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

const parseColors = (obj: any) =>
  Object.entries(obj)
    .filter(([k]) => k.startsWith('cl'))
    .map(([k, v]) => ({ name: k.substring(2), value: v }))

const getFields = (info: any, query: string) =>
  info.fieldNodes
    .find(({ name }) => name.value === query)
    .selectionSet.selections.filter(({ kind }) => kind === 'Field')

export default {
  Query: {
    search: async (root, { name, first }) => {
      const itResults = await search(name, first)
      const results = await library.batchGetMeta(
        ...itResults.map(({ podId }: any) => podId.toString())
      )
      return itResults.map(
        (r: any) =>
          results.find(({ podId }) => podId === r.podId.toString()) || r
      )
    },

    podcast: async (root, { itunesId }, context, info) =>
      await library.getPodcast(itunesId, getFields(info, 'podcast')),

    podcasts: async (root, { itunesIds }, context, info) =>
      await library.getPodcasts(itunesIds, getFields(info, 'podcasts')),

    episode: async (root, { podcastId, episodeId }) =>
      await library.getEpisode(podcastId, episodeId),
  },

  Podcast: {
    itunesId: (obj: any) => obj.podId,
    artworks: (obj: any) => obj.artworks || parseArt(obj),
    colors: parseColors,
  },

  Episode: {
    artworks: parseArt,
    id: (obj: any) => obj.SK,
  },
}
