import { Podcast } from '../library'

const textRule = (
  context: string,
  parentName: string,
  target: string
): Rule => ({
  type: 'text',
  context,
  handler: (node, pod) => {
    if (node.in !== parentName) return false
    pod[target] = node.text
    return true
  },
})

const POD = 'CHANNEL'

const rules: { [key: string]: Rule } = {
  POD_TITLE: textRule(POD, 'TITLE', 'name'),
  POD_LINK: textRule(POD, 'LINK', 'link'),
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
      return rule.handler(node, pod as Podcast)
    }
)

type NodeType = 'node' | 'text'
type RuleHandler = (node: { [key: string]: any }, pod: Podcast) => boolean
type Rule = {
  type: NodeType
  context: string
  handler: RuleHandler
}
