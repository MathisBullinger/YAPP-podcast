import * as library from './library'
import { search } from './itunes'

const parseArt = (obj: any) =>
  Object.entries(obj)
    .filter(([k]) => k.startsWith('img'))
    .map(([k, v]) => [k.split('_'), v])
    .map(([k, v]: [string[], any]) => ({
      url: v,
      size: parseInt(k.pop(), 10),
      type: k.pop(),
    }))

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

  Podcast: {
    itunesId: (obj: any) => obj.podId,
    artworks: (obj: any) => obj.artworks || parseArt(obj),
  },

  Episode: {
    artworks: parseArt,
    id: (obj: any) => obj.SK,
  },
}
