import dbClient from './dynamodb'
import * as itunes from './itunes'
import parse from './parser'
import { Podcast as PodForm, Meta } from './parser/format'
import uuidv5 from 'uuid/v5'

export async function getPodcast(id: string): Promise<Podcast> {
  console.log('get podcast', id)
  const { result } = await dbClient
    .getItem('podcasts')
    .setHashKey('podId', id)
    .setRangeKey('SK', 'meta')
    .execute()
  console.log('result:', result)
  if (!result) return
}

export async function addPodcast(id: string): Promise<Podcast> {
  console.log('add podcast', id)
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
  } catch (err) {
    console.warn(err)
    throw err
  }
}

interface Podcast extends PodForm {
  feed: string
}

interface Key {
  podId: string
  SK: string
}

function getMeta(podcast: Podcast): Meta {
  return Object.fromEntries(
    Object.entries(podcast).filter(([k]) => k !== 'episodes')
  ) as Meta
}
