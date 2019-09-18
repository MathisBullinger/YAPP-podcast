import * as library from './library'

export default {
  Query: {
    search: () => [],

    podcast: async (root, { itunesId }) => {
      const podcast =
        (await library.getPodcast(itunesId)) ||
        (await library.addPodcast(itunesId))

      console.log('podcast:', podcast)

      return {}
    },
  },
}
