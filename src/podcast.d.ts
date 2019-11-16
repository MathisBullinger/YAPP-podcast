interface Podcast extends Meta {
  episodes: Episode[]
}

interface Meta {
  creator?: string
  name?: string
  link?: string
  language?: string
  description?: string
  subtitle?: string
  feed?: string
  img?: string
}

interface Episode {
  title?: string
  description?: string
  content?: string
  date?: string
  file?: string
  duration?: number
  link?: string
  img?: string
}

interface GqlField {
  name: {
    value: string
  }
  selecionSet: {
    selections: GqlField[]
  }
}
