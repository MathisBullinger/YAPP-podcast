import axios from 'axios'

export async function getFeedUrl(id: string): Promise<string> {
  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: { media: 'podcast', term: id, limit: 1 },
  })
  if (data.results.length === 0) return
  return data.results[0].feedUrl
}
