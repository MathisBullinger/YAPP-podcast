import axios from 'axios'
import { createStream } from 'sax'
import { Podcast } from '../library'

export default async (feed: string): Promise<Podcast> =>
  new Promise((resolve, reject) => {
    axios({ method: 'get', url: feed, responseType: 'stream' })
      .then(({ data }) => {
        parse(data)
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
  })

async function parse(stream): Promise<Podcast> {
  return new Promise((resolve, reject) => {
    const sax = createStream(false, {
      trim: true,
      normalize: true,
      lowercase: false,
      xmlns: false,
      position: true,
      strictEntities: false,
    })

    sax.on('end', () => resolve({ name: 'done' }))
    sax.on('error', reject)

    stream.pipe(sax)
  })
}
