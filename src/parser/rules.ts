import {
  build,
  textRule,
  nodeRuleCst,
  nodeRule,
  lastEpisode as et,
} from './ruleUtils'

const POD = 'CHANNEL'
const EP = 'ITEM'

export default build({
  'pod.title': textRule(POD, 'TITLE', 'name'),
  'pod.link': textRule(POD, 'LINK', 'link'),
  'pod.lang': textRule(POD, 'LANGUAGE', 'lang'),
  'pod.it:author': textRule(POD, 'ITUNES:AUTHOR', 'creator'),
  'pod.description': textRule(POD, 'DESCRIPTION', 'description', 1),
  'pod.it:summary': textRule(POD, 'ITUNES:SUMMARY', 'description', 2),
  'pod.it:subtitle': textRule(POD, 'ITUNES:SUBTITLE', 'subtitle'),

  'pod.item': nodeRuleCst(POD, 'ITEM', pod => pod.episodes.push({})),
  'ep.title': textRule(EP, 'TITLE', et('title')),
  'ep.date': textRule(EP, 'PUBDATE', et('date')),
  'ep.enclosure': nodeRule(EP, 'ENCLOSURE', et('file'), ({ URL }) => URL, 1),
  'ep.m:con': nodeRule(EP, 'MEDIA:CONTENT', et('file'), ({ URL }) => URL, 2),
})
