import dbClient from './dynamodb'
import * as itunes from './itunes'
import parse from './parser'
import uuidv5 from 'uuid/v5'

export async function getPodcast(id: string): Promise<Podcast> {
  const { result } = await dbClient
    .newQueryBuilder('podcasts')
    .setHashKey('podId', id)
    .execute()
  if (!Array.isArray(result) || result.length === 0) return
  const metaIndex = result.findIndex(r => r.SK === 'meta')
  return {
    ...result.splice(metaIndex, 1)[0],
    episodes: result,
  }
}

export async function addPodcast(id: string): Promise<Podcast> {
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
      ].map(item => dbClient.putItem('podcasts', item).execute())
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
