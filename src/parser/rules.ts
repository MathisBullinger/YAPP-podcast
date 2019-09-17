const textRule = (
  context: string,
  parentName: string,
  target: string | [string, (pod) => {}],
  hierarchy: number = 1
): Rule => ({
  type: 'text',
  context,
  handler: (node, pod) => {
    if (node.in !== parentName) return false
    const [b, t] = !Array.isArray(target)
      ? [pod, target]
      : [target[1](pod), target[0]]
    if (!(target in pod) || hierarchy < b[t]._h)
      b[t] = { v: node.text, _h: hierarchy }
    return true
  },
})

const nodeRule = (
  context: string,
  nodeName: string,
  handler: (pod, attrs: []) => void
): Rule => ({
  type: 'node',
  context,
  handler: (node, pod) => {
    if (node.name !== nodeName) return false
    handler(pod, node.attributes)
    return true
  },
})

const POD = 'CHANNEL'
const EP = 'ITEM'

const et = (target: string): [string, (pod) => {}] => [
  target,
  pod => pod.episodes[pod.episodes.length - 1],
]

const rules: { [key: string]: Rule } = {
  'pod.title': textRule(POD, 'TITLE', 'name'),
  'pod.link': textRule(POD, 'LINK', 'link'),
  'pod.lang': textRule(POD, 'LANGUAGE', 'lang'),
  'pod.it:author': textRule(POD, 'ITUNES:AUTHOR', 'creator'),
  'pod.description': textRule(POD, 'DESCRIPTION', 'description', 1),
  'pod.it:summary': textRule(POD, 'ITUNES:SUMMARY', 'description', 2),
  'pod.it:subtitle': textRule(POD, 'ITUNES:SUBTITLE', 'subtitle'),

  'pod.item': nodeRule(POD, 'ITEM', pod => pod.episodes.push({})),
  'ep.title': textRule(EP, 'TITLE', et('title')),
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
