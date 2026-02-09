export interface Movie {
  id: string
  tmdbId: number
  title: string
  type: 'movie' | 'series' | 'anime' | 'kdrama' | 'cdrama'
  poster?: string
  backdrop?: string
  overview?: string
  releaseDate?: string
  rating?: number
  genres?: string[]
  runtime?: number
  status?: string
}

export interface Series extends Movie {
  type: 'series' | 'anime' | 'kdrama' | 'cdrama'
  seasons?: Season[]
  numberOfSeasons?: number
  numberOfEpisodes?: number
}

export interface Season {
  id: string
  seasonNumber: number
  name: string
  overview?: string
  posterPath?: string
  airDate?: string
  episodes: Episode[]
}

export interface Episode {
  id: string
  episodeNumber: number
  seasonNumber: number
  name: string
  overview?: string
  stillPath?: string
  airDate?: string
  runtime?: number
}
