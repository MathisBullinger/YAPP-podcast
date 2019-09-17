import dbClient from './dynamodb'
import * as itunes from './itunes'
import parse from './parser'

export interface Podcast {
  name: string
  link: string
}

export async function getPodcast(id: string): Promise<Podcast> {
  console.log('get podcast')
  const { result } = await dbClient.getItem('podcasts').setHashKey('podID', id)
  if (!result) return
}

export async function addPodcast(id: string): Promise<Podcast> {
  const feed = await itunes.getFeedUrl(id)
  if (!feed) return
  try {
    const podcast = await parse(feed)
    console.log(podcast)
  } catch (err) {
    console.warn(err)
  }
}
