import * as db from './dynamodb'
import * as itunes from './itunes'
import parse from './parser'
import uuidv5 from 'uuid/v5'
import { genUnique } from './utils/slug'

export async function getPodcast(
  id: string,
  fields: GqlField[]
): Promise<Podcast> {
  console.log(`get podcast ${id}`)
  const queryEpisodes = fields.find(({ name }) => name.value === 'episodes')
  const queries: Promise<any>[] = [getMeta(id)]
  if (queryEpisodes)
    queries.push(
      db.client
        .query({
          TableName: 'podcasts',
          KeyConditionExpression: '#podId = :podId',
          ExpressionAttributeNames: {
            '#podId': 'podId',
            '#date': 'date',
            '#file': 'file',
            '#title': 'title',
            '#duration': 'duration',
          },
          ExpressionAttributeValues: {
            ':podId': id,
          },
          ProjectionExpression: 'SK, #title, #date, #file, #duration',
        })
        .promise()
    )

  try {
    const [meta, epResult] = await Promise.all(queries)
    if (!meta) return
    const episodes = epResult
      ? { episodes: (epResult.Items || []).filter(({ SK }) => SK !== 'meta') }
      : {}
    return {
      ...meta,
      ...episodes,
    }
  } catch (e) {
    console.warn(e)
  }
}

export const getMeta = (podId: string) => db.get({ podId, SK: 'meta' })
export const batchGetMeta = (...ids: string[]) =>
  db.batchGet(ids.map(id => ({ podId: id, SK: 'meta' })))

export const getEpisode = async (podId: string, SK: string) =>
  await db.get({ podId, SK })

export async function addPodcast(id: string): Promise<Podcast> {
  console.log(`add podcast ${id}`)
  const feed = await itunes.getFeedUrl(id)
  if (!feed) return
  try {
    const podcast: Podcast = {
      ...(await parse(feed)),
      feed: feed,
    }
    await Promise.all(
      [
        {
          podId: id,
          SK: 'meta',
          ...((v: string) => (v ? { slug: v } : {}))(
            await genUnique(podcast.name, id)
          ),
          ...extractMeta(podcast),
        },
        ...podcast.episodes.map(e => ({
          podId: id,
          SK: `ep_${e.date || 0}_${uuidv5(e.file || '', uuidv5.URL)}`,
          ...e,
        })),
      ].map(item => db.put(item))
    )
    podcast['podId'] = id
    podcast.episodes = podcast.episodes.map(e => ({
      ...e,
      SK: `ep_${e.date || 0}_${uuidv5(e.file || '', uuidv5.URL)}`,
    }))
    return podcast
  } catch (err) {
    console.warn(err)
    throw err
  }
}

function extractMeta(podcast: Podcast): Meta {
  return Object.fromEntries(
    Object.entries(podcast).filter(([k]) => k !== 'episodes')
  ) as Meta
}
