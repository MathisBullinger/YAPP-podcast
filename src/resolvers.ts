import * as library from './library'

export default {
  Query: {
    search: () => [],

    podcast: async (root, { itunesId }) => {
      return (
        (await library.getPodcast(itunesId)) ||
        (await library.addPodcast(itunesId))
      )
    },
  },
}
