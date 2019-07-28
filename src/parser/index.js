import { createStream } from 'sax'
import Node from './node'

export default (stream, resolve) => {
  stream.pipe(parser())

  function parser() {
    const sax = createStream(false, {
      trim: true,
      normalize: true,
      lowercase: false,
      xmlns: true,
      position: true,
      strictEntities: false,
    })

    let path = null
    const context = () => (!path ? null : path.name || 'none')
    const podcast = {
      episodes: [],
    }

    const resolvers = {
      podcast: context => {
        path = new Node('podcast')
      },
      episode: context => {
        if (context === 'podcast') {
          path = path.push(new Node('episode'))
          podcast.episodes.push({})
        }
      },
      title: context => {
        if (context === 'podcast' || context === 'episode')
          path = path.push(new Node('title'))
      },
    }

    const handleText = text => {
      switch (context()) {
      case 'title':
        if (path.parent.name === 'podcast') podcast.name = text
        else if (path.parent.name === 'episode')
          podcast.episodes.slice(-1)[0].title = text
        break
      }
    }

    const __ = (k, v) => k.reduce((a, c) => ({ ...a, [c]: v }), {})
    const translation = {
      CHANNEL: 'podcast',
      ITEM: 'episode',
      TITLE: 'title',
    }

    sax.on('opentag', ({ name, attributes }) => {
      name = translation[name]
      if (!name) return
      resolvers[name](context())
    })

    sax.on('text', handleText)

    sax.on('closetag', name => {
      if (context() === translation[name]) path = path ? path.parent : null
    })

    sax.on('end', () => {
      if (path) path.root().printTree()
      console.log(podcast)
      resolve(podcast)
    })

    return sax
  }
}
