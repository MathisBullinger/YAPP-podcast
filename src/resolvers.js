import axios from 'axios'

export default {
  Query: {
    search: async (root, { name, first }) => {
      const { data: itunesResult } = await axios.get(
        'https://itunes.apple.com/search',
        {
          params: {
            media: 'podcast',
            term: name,
            limit: first,
          },
        }
      )
      return itunesResult.results.map(res => ({
        itunesId: res.collectionId,
        name: res.collectionName,
        creator: res.artistName,
      }))
    },
  },
}
