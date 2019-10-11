import * as db from './dynamodb'
import * as itunes from './itunes'
import parse from './parser'
import uuidv5 from 'uuid/v5'

export async function getPodcast(id: string): Promise<Podcast> {
  const metaQuery = db.get({ podId: id, SK: 'meta' })
  const epQuery = db.client
    .query({
      TableName: 'podcasts',
      KeyConditionExpression: '#podId = :podId',
      ExpressionAttributeNames: {
        '#podId': 'podId',
        '#date': 'date',
        '#file': 'file',
      },
      ExpressionAttributeValues: {
        ':podId': id,
      },
      ProjectionExpression: 'SK, title, #date, #file',
    })
    .promise()

  try {
    const [meta, epResult] = await Promise.all([metaQuery, epQuery])
    const episodes = (epResult.Items || []).filter(({ SK }) => SK !== 'meta')
    return {
      ...meta,
      episodes,
    }
  } catch (e) {
    console.warn(e)
  }
}

export async function addPodcast(id: string): Promise<Podcast> {
  console.log('\nADD PODCAST\n')

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
          ...getMeta(podcast),
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

function getMeta(podcast: Podcast): Meta {
  return Object.fromEntries(
    Object.entries(podcast).filter(([k]) => k !== 'episodes')
  ) as Meta
}
