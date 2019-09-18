import stripTags from 'striptags'
import sanitize from 'sanitize-html'
import { PodcastData, Text } from '.'

export default function(pod: PodcastData): Podcast {
  const text = (v: Text): string => (v === undefined ? '' : stripTags(v.v))

  const invalid = (v: Text): boolean =>
    v === undefined || !('v' in v) || typeof v.v !== 'string'

  const data = (v: Text): string => {
    if (invalid(v)) return null
    while (v.v.startsWith('\u200c')) v.v = v.v.substring(1)
    if (v.t !== 'data') return text(v)
    return '\u200c' + sanitize(v.v)
  }

  const date = (v: Text): number => {
    if (invalid(v)) return null
    return Date.parse(v.v)
  }

  const duration = (v: Text): number => {
    if (invalid(v)) return null
    if (/^\d+$/.test(v.v)) return parseInt(v.v, 10)
    if (/^\d\d:\d\d:\d\d$/.test(v.v))
      return v.v
        .split(':')
        .reverse()
        .map((v, i) => parseInt(v, 10) * 60 ** i)
        .reduce((a, c) => a + c)
    return 0
  }

  const filterNull = (obj: object) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null))

  return filterNull({
    creator: text(pod.creator),
    name: text(pod.name),
    link: text(pod.link),
    language: text(pod.lang),
    description: data(pod.description),
    subtitle: data(pod.subtitle),
    episodes: pod.episodes.map(e =>
      filterNull({
        title: text(e.title),
        description: data(e.description),
        date: date(e.date),
        file: text(e.file),
        duration: duration(e.duration),
        link: text(e.link),
      })
    ),
  }) as Podcast
}

export interface Podcast extends Meta {
  episodes: Episode[]
}

export interface Meta {
  creator?: string
  name?: string
  link?: string
  language?: string
  description?: string
  subtitle?: string
}

export interface Episode {
  title?: string
  description?: string
  date?: number
  file?: string
  duration?: number
  link?: string
}
