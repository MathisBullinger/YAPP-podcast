export default class Node {
  constructor(name = null, data = null) {
    this.name = name
    this.data = data
    this._children = []
    this._parent = null
  }

  setParent(parent) {
    if (!(parent instanceof Node)) throw Error('_parent must be node')
    this._parent = parent
  }

  push(child) {
    if (!(child instanceof Node)) throw new Error('child must be node')
    child.setParent(this)
    this._children.push(child)
    return child
  }

  root() {
    if (this._parent === null) return this
    return this._parent.root()
  }

  printTree() {
    if (process.env.NODE_ENV === 'development')
      require('./prettyPrint').default(this)
  }
}
