type NodeType = 'node' | 'text'

type RuleHandler = (
  node: { [key: string]: any },
  pod: { [key: string]: any }
) => boolean

export type Rule = {
  type: NodeType
  context: string
  handler: RuleHandler
}

export const textRule = (
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

export const nodeRule = (
  context: string,
  nodeName: string,
  target: string | [string, (pod) => {}],
  value: (attrs) => any,
  hierarchy: number = 1
): Rule => ({
  type: 'node',
  context,
  handler: (node, pod) => {
    if (node.name !== nodeName) return false
    const [b, t] = !Array.isArray(target)
      ? [pod, target]
      : [target[1](pod), target[0]]
    if (!(target in pod) || hierarchy < b[t]._h)
      b[t] = { v: value(node.attributes || {}), _h: hierarchy }
    return true
  },
})

export const nodeRuleCst = (
  context: string,
  nodeName: string,
  handler: (pod, attrs: {}) => void
): Rule => ({
  type: 'node',
  context,
  handler: (node, pod) => {
    if (node.name !== nodeName) return false
    handler(pod, node.attributes)
    return true
  },
})

export const lastEpisode = (target: string): [string, (pod) => {}] => [
  target,
  pod => pod.episodes[pod.episodes.length - 1],
]

export const build = (rules: { [key: string]: Rule }) =>
  Object.values(rules).map(
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
