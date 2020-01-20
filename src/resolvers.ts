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
      (await library.getPodcast(itunesId, getFields(info, 'podcast'))) ||
      (await library.getNewPodcast(itunesId)),

    podcasts: async (root, { itunesIds }, context, info) =>
      await library.getPodcasts(itunesIds, getFields(info, 'podcasts')),

    episode: async (root, { podcastId, episodeId }) =>
      await library.getEpisode(podcastId, episodeId),
  },

  Podcast: {
    id: (obj: any) => obj.id || obj.podId,
    itunesId: (obj: any) => obj.id || obj.podId,
    artworks: (obj: any) => obj.artworks || parseArt(obj),
    descr: (obj: any) => ({
      short: obj.description_short,
      long: obj.description_long,
    }),
    description: (obj: any) =>
      obj.description ||
      '\u200c' + (obj.description_short || obj.description_long),
    colors: parseColors,
  },

  Episode: {
    artworks: parseArt,
    id: (obj: any) => obj.SK,
    duration: () => 0,
    date: ({ date }: any) =>
      !date ? '0' : new Date(date).getTime().toString(),
    descr: (obj: any) => ({
      short: obj.description_short,
      long: obj.description_long,
    }),
    description: (obj: any) =>
      obj.description ||
      '\u200c' + (obj.description_short || obj.description_long),
    content: (obj: any) =>
      obj.content || '\u200c' + (obj.description_long || obj.description_short),
  },
}
