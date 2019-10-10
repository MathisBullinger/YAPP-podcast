import axios from 'axios'
import { createStream } from 'sax'
import Node from './node'
import rules from './rules'
import format from './format'
import querystring from 'querystring'

export default async function parseUrl(feed: string): Promise<Podcast> {
  return new Promise((resolve, reject) => {
    axios({ method: 'get', url: feed, responseType: 'stream' })
      .then(({ data }) => {
        parse(data, feed)
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
  })
}

async function parse(stream, url: string): Promise<Podcast> {
  let isPaginated = false

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
      if (isPaginated && podcast.episodes.length) {
        const currentPage =
          parseInt(querystring.parse(url).page as string, 10) || 1
        url = url.replace(/&page=\d+/, '') + `&page=${currentPage + 1}`

        parseUrl(url.replace(/&page=\d+/, '') + `&page=${currentPage + 1}`)
          .then(result => {
            if (!result || !result.episodes || !result.episodes.length)
              resolve((currentPage === 1 ? format : d => d)(podcast))

            resolve(
              (currentPage === 1 ? format : d => d)({
                ...podcast,
                ...{ episodes: [...podcast.episodes, ...result.episodes] },
              })
            )
          })
          .catch(() => resolve(format(podcast)))
      } else resolve(format(podcast))
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
      if (parseChain.name === 'GENERATOR' && text.includes('squarespace'))
        isPaginated = true

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
  img?: Text
  episodes: EpisodeData[]
}

interface EpisodeData {
  title?: Text
  file?: Text
  duration?: Text
  date?: Text
  description?: Text
  content?: Text
  link?: Text
  img?: Text
}

export interface Text {
  v: string
  t: 'text' | 'data'
}
