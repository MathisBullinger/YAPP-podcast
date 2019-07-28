import axios from 'axios'
import parser from './parser'

function mapItunesData(data) {
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

export default {
  Query: {
    search: async (root, { name, first }) => {
      const {
        data: { results: itunesResult },
      } = await axios.get('https://itunes.apple.com/search', {
        params: {
          media: 'podcast',
          term: name,
          limit: first,
        },
      })

      return itunesResult.map(res => mapItunesData(res))
    },

    podcast: async (root, { itunesId }) => {
      const {
        data: { results: itunesResult },
      } = await axios.get('https://itunes.apple.com/search', {
        params: {
          media: 'podcast',
          term: itunesId,
          limit: 1,
        },
      })

      if (itunesResult.length === 0) return
      return mapItunesData(itunesResult[0])
    },
  },

  Podcast: {
    thumbnail: ({ artworks }) =>
      !artworks || !artworks.length
        ? null
        : artworks.find(
          art =>
            art.size ===
              (Math.max(
                ...artworks.filter(art => art.size <= 200).map(art => art.size)
              ) || Math.min(...artworks.map(art => art.size)))
        ),

    artwork: ({ artworks }) =>
      !artworks || !artworks.length
        ? null
        : artworks.find(
          art => art.size === Math.max(...artworks.map(art => art.size))
        ),

    episodes: async ({ feed }) =>
      !feed
        ? null
        : (await axios({
          method: 'get',
          url: feed,
          responseType: 'stream',
        }).then(
          response =>
            new Promise((resolve, reject) =>
              parser(response.data, resolve, reject)
            )
        )).episodes,
  },
}
