const textRule = (
  context: string,
  parentName: string,
  target: string,
  hierarchy: number = 1
): Rule => ({
  type: 'text',
  context,
  handler: (node, pod) => {
    if (node.in !== parentName) return false
    if (!(target in pod) || hierarchy < pod[target]._h)
      pod[target] = { v: node.text, _h: hierarchy }
    return true
  },
})

const POD = 'CHANNEL'

const rules: { [key: string]: Rule } = {
  'pod.title': textRule(POD, 'TITLE', 'name'),
  'pod.link': textRule(POD, 'LINK', 'link'),
  'pod.lang': textRule(POD, 'LANGUAGE', 'lang'),
  'pod.it:author': textRule(POD, 'ITUNES:AUTHOR', 'creator'),
  'pod.description': textRule(POD, 'DESCRIPTION', 'description', 1),
  'pod.it:summary': textRule(POD, 'ITUNES:SUMMARY', 'description', 2),
  'pod.it:subtitle': textRule(POD, 'ITUNES:SUBTITLE', 'subtitle'),
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

type NodeType = 'node' | 'text'
type RuleHandler = (
  node: { [key: string]: any },
  pod: { [key: string]: any }
) => boolean
type Rule = {
  type: NodeType
  context: string
  handler: RuleHandler
}
