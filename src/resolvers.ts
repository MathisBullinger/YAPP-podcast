import * as library from './library'
import { search } from './itunes'

export default {
  Query: {
    search: async (root, { name, first }) => await search(name, first),

    podcast: async (root, { itunesId }) => {
      return (
        (await library.getPodcast(itunesId)) ||
        (await library.addPodcast(itunesId))
      )
    },
  },
}
