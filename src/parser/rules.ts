import {
  build,
  textRule,
  nodeRuleCst as custRule,
  nodeRule,
  lastEpisode as et,
  tags as n,
} from './ruleUtils'

const P = 'CHANNEL'
const E = 'ITEM'

// prettier-ignore
export default build({
  'pod.title':        textRule(P, n.title,            'name'),
  'pod.link':         textRule(P, n.link,             'link'),
  'pod.lang':         textRule(P, n.lang,             'lang'),
  'pod.it:author':    textRule(P, n.itunes.author,    'creator'),
  'pod.description':  textRule(P, n.description,      'description', 1),
  'pod.it:summary':   textRule(P, n.itunes.summary,   'description', 2),
  'pod.it:subtitle':  textRule(P, n.itunes.subtitle,  'subtitle'),

  'pod.item':         custRule(P, n.item,             pod => pod.episodes.push({})),
  'ep.title':         textRule(E, n.title,            et('title')),
  'ep.date':          textRule(E, n.pubdate,          et('date')),
  'ep.enclosure':     nodeRule(E, n.enclosure,        et('file'), ({ URL }) => URL, 1),
  'ep.m:con':         nodeRule(E, n.media.content,    et('file'), ({ URL }) => URL, 2),
})
