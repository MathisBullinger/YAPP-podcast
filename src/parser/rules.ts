import { Podcast } from '../library'

const rules: { [key: string]: Rule } = {
  POD_TITLE: {
    type: 'text',
    context: 'CHANNEL',
    handler: (node, pod: Podcast) => {
      if (node.in !== 'TITLE') return false
      pod.name = node.text
      return true
    },
  },
}

type NodeType = 'node' | 'text'

type Rule = {
  type: NodeType
  context: string
  handler: (node: { [key: string]: any }, pod: object) => boolean
}

export default Object.values(rules).map(
  rule =>
    function(
      type: NodeType,
      node: object,
      context: string,
      pod: object
    ): boolean {
      if (type !== rule.type || context !== rule.context) return false
      return rule.handler(node, pod)
    }
)
