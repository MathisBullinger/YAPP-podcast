import {
  build,
  textRule,
  nodeRuleCst as custRule,
  nodeRule,
  lastEpisode as et,
  tags as n,
} from './ruleUtils'

// prettier-ignore
export default build({
  'pod.title':        textRule(n.podcast, n.title,            'name'),
  'pod.link':         textRule(n.podcast, n.link,             'link'),
  'pod.lang':         textRule(n.podcast, n.lang,             'lang'),
  'pod.it:author':    textRule(n.podcast, n.itunes.author,    'creator'),
  'pod.description':  textRule(n.podcast, n.description,      'description', 1),
  'pod.it:summary':   textRule(n.podcast, n.itunes.summary,   'description', 2),
  'pod.it:subtitle':  textRule(n.podcast, n.itunes.subtitle,  'subtitle'),
  'pod.it:image':     nodeRule(n.podcast, n.itunes.image,     'img', ({HREF}) => HREF),
  
  'pod.item':         custRule(n.podcast, n.item,             pod => pod.episodes.push({})),
  'ep.title':         textRule(n.episode, n.title,            et('title')),
  'ep.date':          textRule(n.episode, n.pubdate,          et('date')),
  'ep.enclosure':     nodeRule(n.episode, n.enclosure,        et('file'), ({ URL }) => URL, 1),
  'ep.mediacontent':  nodeRule(n.episode, n.media.content,    et('file'), ({ URL }) => URL, 2),
  'ep.it.duration':   textRule(n.episode, n.itunes.duration,  et('duration')),
  'ep.link':          textRule(n.episode, n.link,             et('link')),
  'ep.it:sum':        textRule(n.episode, n.itunes.summary,   et('description'), 1),
  'ep.description':   textRule(n.episode, n.description,      et('description'), 2),
  'ep.it:image':      nodeRule(n.episode, n.itunes.image,     et('img'), ({HREF}) => HREF, 1),
  'ep.body':          textRule(n.episode, n.body,             et('content'), 1),
  'ep.content':       textRule(n.episode, n.content,          et('content'), 2),
  'ep.fullitem':      textRule(n.episode, n.fullitem,         et('content'), 3),
})
