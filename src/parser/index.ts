import axios from 'axios'
import { createStream } from 'sax'
import Node from './node'
import rules from './rules'
import format, { Podcast } from './format'

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

    sax.on('end', () => {
      resolve(format(podcast as PodcastData))
    })
    sax.on('error', reject)

    let parseChain: Node = new Node('ROOT')
    const podcast = { episodes: [] }

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

    let cdata = ''
    sax.on('cdata', data => (cdata += data))
    sax.on('closecdata', () => {
      rules.find(rule =>
        rule(
          'data',
          { cdata, in: parseChain.name },
          parseChain.parent.name,
          podcast
        )
      )
      cdata = ''
    })

    stream.pipe(sax)
  })
}

export interface PodcastData {
  name?: Text
  creator?: Text
  description?: Text
  subtitle?: Text
  link?: Text
  lang?: Text
  episodes: EpisodeData[]
}

interface EpisodeData {
  title?: Text
  file?: Text
  duration?: Text
  date?: Text
  description?: Text
  link?: Text
}

export interface Text {
  v: string
  t: 'text' | 'data'
}
