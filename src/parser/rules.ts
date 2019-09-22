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
  'ep.m:con':         nodeRule(n.episode, n.media.content,    et('file'), ({ URL }) => URL, 2),
  'ep.it.duration':   textRule(n.episode, n.itunes.duration,  et('duration')),
  'ep.link':          textRule(n.episode, n.link,             et('link')),
  'ep.summary':       textRule(n.episode, n.description,      et('summary')),
  'ep.description':   textRule(n.episode, n.content,          et('description')),
  'ep.it:image':      nodeRule(n.podcast, n.itunes.image,     et('img'), ({HREF}) => HREF),
})
