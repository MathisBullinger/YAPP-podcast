import axios from 'axios'

export async function searchItunes({ term, limit }) {
  if (!term) return []
  return (await axios.get('https://itunes.apple.com/search', {
    params: {
      media: 'podcast',
      term,
      ...(limit && { limit }),
    },
  })).data.results
}

export async function getFeedUrl({ name, itunesId, limit }) {
  const results = await searchItunes({
    term: itunesId || name,
    ...((itunesId || limit) && { limit: itunesId ? 1 : limit }),
  })

  if (itunesId) {
    if (
      results.length === 0 ||
      results[0].collectionId.toString() !== itunesId.toString() ||
      !results[0].feedUrl
    )
      return null
    return results[0].feedUrl
  } else return results.map(result => result.feedUrl).filter(feed => feed)
}

export function mapItunesResult(data) {
  const artworks = Object.keys(data)
    .filter(key => key.startsWith('artworkUrl'))
    .map(key => ({
      url: data[key],
      size: parseInt(key.replace('artworkUrl', ''), 10) || null,
    }))
  return {
    itunesId: data.collectionId,
    name: data.collectionName,
    creator: data.artistName,
    ...(artworks && { artworks }),
    feed: data.feedUrl,
  }
}
