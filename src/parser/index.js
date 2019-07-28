import { createStream } from 'sax'
import Node from './node'
import uuidv3 from 'uuid/v3'

export default (stream, resolve) => {
  stream.pipe(parser())

  function parser() {
    const sax = createStream(false, {
      trim: true,
      normalize: true,
      lowercase: false,
      xmlns: false,
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
        if (context === null) path = new Node('podcast')
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
      file: (context, { URL }) => {
        if (context === 'episode') podcast.episodes.slice(-1)[0].file = URL
      },
      id: context => {
        if (context === 'episode') path = path.push(new Node('id'))
      },
    }

    const handleText = text => {
      switch (context()) {
      case 'title':
        if (path.parent.name === 'podcast') podcast.name = text
        else if (path.parent.name === 'episode')
          podcast.episodes.slice(-1)[0].title = text
        break

      case 'id':
        if (path.parent.name === 'episode')
          podcast.episodes.slice(-1)[0].id = text
        break
      }
    }

    // const __ = (k, v) => k.reduce((a, c) => ({ ...a, [c]: v }), {})
    const translation = {
      CHANNEL: 'podcast',
      ITEM: 'episode',
      TITLE: 'title',
      ENCLOSURE: 'file',
      GUID: 'id',
    }

    sax.on('opentag', ({ name, attributes }) => {
      name = translation[name]
      if (!name) return
      resolvers[name](context(), attributes)
    })

    sax.on('text', handleText)

    sax.on('closetag', name => {
      if (
        translation[name] === 'episode' &&
        context() === 'episode' &&
        !podcast.episodes.slice(-1)[0].id
      )
        podcast.episodes.slice(-1)[0].id = uuidv3(
          podcast.episodes.slice(-1)[0].file,
          uuidv3.DNS
        )
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
