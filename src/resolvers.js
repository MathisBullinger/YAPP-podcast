import axios from 'axios'

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

      return itunesResult.map(res => {
        const artworks = Object.keys(res)
          .filter(key => key.startsWith('artworkUrl'))
          .map(key => ({
            url: res[key],
            size: parseInt(key.replace('artworkUrl', ''), 10) || null,
          }))

        return {
          itunesId: res.collectionId,
          name: res.collectionName,
          creator: res.artistName,
          ...(artworks && { artworks }),
        }
      })
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
  },
}
