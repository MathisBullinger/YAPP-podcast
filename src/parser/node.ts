export default class Node {
  public readonly name: string
  public readonly parent: Node
  public children: Node[] = []

  constructor(name: string, parent?: Node) {
    this.name = name
    this.parent = parent
  }

  public push(childName: string): Node {
    const child = new Node(childName, this)
    this.children.push(child)
    return child
  }

  public pop(): Node {
    if (!this.parent) return
    this.parent.children = this.parent.children.filter(child => child !== this)
    return this.parent
  }
}
