import * as library from './library'
import { search } from './itunes'
import genSlug from './utils/slug'

const parseArt = (obj: any) =>
  Object.entries(obj)
    .filter(([k]) => k.startsWith('img'))
    .map(([k, v]) => [k.split('_'), v])
    .map(([k, v]: [string[], any]) => ({
      url: v,
      size: parseInt(k.pop(), 10),
      type: k.pop(),
    }))

const parseColors = (obj: any) =>
  Object.entries(obj)
    .filter(([k]) => k.startsWith('cl'))
    .map(([k, v]) => ({ name: k.substring(2), value: v }))

export default {
  Query: {
    search: async (root, { name, first }) =>
      await Promise.all(
        (await search(name, first)).map(info => {
          console.log('id:', (info as any).podId)
          return library
            .getPodcast((info as any).podId.toString())
            .then(
              res => (
                console.log(
                  `${(info as any).podId} source: ${res ? 'DB' : 'itunes'}`
                ),
                res || info
              )
            )
        })
      ),

    podcast: async (root, { itunesId }) =>
      (await library.getPodcast(itunesId)) ||
      (await library.addPodcast(itunesId)),

    episode: async (root, { podcastId, episodeId }) =>
      await library.getEpisode(podcastId, episodeId),
  },

  Podcast: {
    itunesId: (obj: any) => obj.podId,
    artworks: (obj: any) => obj.artworks || parseArt(obj),
    colors: parseColors,
    slug: (obj: any) => obj.name && genSlug(obj.name),
  },

  Episode: {
    artworks: parseArt,
    id: (obj: any) => obj.SK,
  },
}
