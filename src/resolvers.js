import axios from 'axios'
import parser from './parser'
import { getFeedUrl, searchItunes, mapItunesResult } from './itunes'

async function parseFeed(url) {
  return await axios({
    method: 'get',
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => parser(response.data, resolve, reject))
  )
}

export default {
  Query: {
    search: async (root, { name, first }, context, info) => {
      const fromItunes = ['itunesId', 'name', 'creator', 'artworks', 'feed']
      if (
        info.fieldNodes[0].selectionSet.selections
          .map(select => select.name.value)
          .every(field => fromItunes.includes(field))
      ) {
        // fetch from itunes
        return (await searchItunes({ term: name, limit: first })).map(
          mapItunesResult
        )
      } else {
        // fetch from feeds
        return await Promise.all(
          (await getFeedUrl({ name, limit: first })).map(parseFeed)
        )
      }
    },

    podcast: async (root, { itunesId }) => ({
      ...(await parseFeed(await getFeedUrl({ itunesId }))),
      itunesId,
    }),
  },
}
