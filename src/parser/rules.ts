import {
  build,
  textRule,
  nodeRuleCst,
  nodeRule,
  lastEpisode as et,
  tags as n,
} from './ruleUtils'

const POD = 'CHANNEL'
const EP = 'ITEM'

export default build({
  'pod.title': textRule(POD, n.title, 'name'),
  'pod.link': textRule(POD, n.link, 'link'),
  'pod.lang': textRule(POD, n.lang, 'lang'),
  'pod.it:author': textRule(POD, n.itunes.author, 'creator'),
  'pod.description': textRule(POD, n.description, 'description', 1),
  'pod.it:summary': textRule(POD, n.itunes.summary, 'description', 2),
  'pod.it:subtitle': textRule(POD, n.itunes.subtitle, 'subtitle'),

  'pod.item': nodeRuleCst(POD, n.item, pod => pod.episodes.push({})),
  'ep.title': textRule(EP, n.title, et('title')),
  'ep.date': textRule(EP, n.pubdate, et('date')),
  'ep.enclosure': nodeRule(EP, n.enclosure, et('file'), ({ URL }) => URL, 1),
  'ep.m:con': nodeRule(EP, n.media.content, et('file'), ({ URL }) => URL, 2),
})
