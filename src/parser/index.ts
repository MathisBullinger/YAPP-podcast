import axios from 'axios'
import { createStream } from 'sax'
import { Podcast } from '../library'
import Node from './node'
import rules from './rules'

export default async (feed: string): Promise<Podcast> =>
  new Promise((resolve, reject) => {
    console.log(feed)
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

    sax.on('end', () => resolve(podcast as Podcast))
    sax.on('error', reject)

    let parseChain: Node = new Node('ROOT')
    const podcast = {}

    sax.on('opentag', ({ name, attributes }) => {
      parseChain = parseChain.push(name)
      rules.find(rule =>
        rule('node', { name, attributes }, parseChain.parent.name, podcast)
      )
    })

    sax.on('text', (text: string) => {
      rules.find(rule =>
        rule(
          'text',
          { text, in: parseChain.name },
          parseChain.parent.name,
          podcast
        )
      )
    })

    sax.on('closetag', () => {
      parseChain = parseChain.pop()
    })

    stream.pipe(sax)
  })
}