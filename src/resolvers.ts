// import axios from 'axios'
// import parser from './parser'
// import { getFeedUrl, searchItunes, mapItunesResult } from './itunesdpr'
// import { UserInputError } from 'apollo-server-lambda'
import * as library from './library'

// async function parseFeed(data) {
//   if (!data) throw new UserInputError('unknown podcast')
//   const { feed: url, itunesId } = data
//   return {
//     ...(await axios({
//       method: 'get',
//       url,
//       responseType: 'stream',
//     }).then(
//       response =>
//         new Promise((resolve, reject) => parser(response.data, resolve, reject))
//     )),
//     itunesId,
//   }
// }

export default {
  Query: {
    // search: async (root, { name, first }, context, info) => {
    //   const fromItunes = [
    //     'itunesId',
    //     'name',
    //     'creator',
    //     'artworks',
    //     'feed',
    //     '__typename',
    //   ]
    //   if (
    //     info.fieldNodes[0].selectionSet.selections
    //       .map(select => select.name.value)
    //       .every(field => fromItunes.includes(field))
    //   ) {
    //     // fetch from itunes
    //     console.log('fetch from itunes')
    //     return (await searchItunes({ term: name, limit: first })).map(
    //       mapItunesResult
    //     )
    //   } else {
    //     // fetch from feeds
    //     console.log('fetch from feeds')
    //     return await Promise.all(
    //       (await getFeedUrl({ name, limit: first })).map(parseFeed)
    //     )
    //   }
    // },
    search: () => [],

    podcast: async (root, { itunesId }) => {
      const podcast =
        (await library.getPodcast(itunesId)) ||
        (await library.addPodcast(itunesId))

      console.log(podcast)

      // await parseFeed(await getFeedUrl({ itunesId }))
      return {}
    },
  },
}