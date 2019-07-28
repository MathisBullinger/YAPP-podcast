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

    function resolveTagName(name) {
      switch (name) {
      case 'CHANNEL':
        return 'podcast'
      }
    }

    let tree = null

    let counter = 0
    sax.on('opentag', ({ name, attributes }) => {
      counter++
      if (counter > 10) return
      console.log(name)
      name = resolveTagName(name)
      if (!name) return
      if (name === 'podcast') {
        if (!tree) tree = new Node(name)
        return
      }
    })

    sax.on('end', () => resolve(null))

    return sax
  }
}
