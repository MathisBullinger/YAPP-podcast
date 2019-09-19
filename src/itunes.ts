import axios from 'axios'
import { translateKeys } from './utils/object'

export async function getFeedUrl(id: string): Promise<string> {
  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: { media: 'podcast', term: id, limit: 1 },
  })
  if (data.results.length === 0) return
  return data.results[0].feedUrl
}

export async function search(
  term: string,
  limit: number
): Promise<Partial<Podcast>> {
  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: { media: 'podcast', term, ...(limit && { limit }) },
  })

  const translation = {
    collectionId: 'itunesId',
    artistName: 'creator',
    collectionName: 'name',
    feedUrl: 'feed',
  }
  return data.results.map(result => translateKeys(result, translation))
}
