interface Podcast {
  name: string
  creator: string
  website: string
  language: string
  feed: string
  description: {
    short: string
    long: string
  }
  publisher: {
    name: string
    email: string
  }
  categories: string[]
  lastBuild: string
  image: string
  websub: {
    hub: string
    url: string
  }
  episodes: Episode[]
}

interface Episode {
  title: string
  file: string
  date: string
  description: {
    short: string
    long: string
  }
  image: string
  season: string
  episode: string
  type: string
  duration: string
}

interface GqlField {
  name: {
    value: string
  }
  selecionSet: {
    selections: GqlField[]
  }
}
