import { create } from 'zustand'

interface Movie {
  id: string
  title: string
  type: 'movie' | 'series' | 'anime' | 'kdrama' | 'cdrama'
  poster?: string
  backdrop?: string
  overview?: string
  releaseDate?: string
  rating?: number
}

interface MoviesState {
  movies: Movie[]
  loading: boolean
  error: string | null
  selectedMovie: Movie | null
  fetchMovies: () => Promise<void>
  setSelectedMovie: (movie: Movie | null) => void
}

export const useMoviesStore = create<MoviesState>((set) => ({
  movies: [],
  loading: false,
  error: null,
  selectedMovie: null,

  fetchMovies: async () => {
    set({ loading: true, error: null })
    try {
      // TODO: Implement actual API call
      // const response = await apiClient.get('/api/movies')
      // set({ movies: response.data, loading: false })
      
      // Mock data for now
      const mockMovies: Movie[] = []
      set({ movies: mockMovies, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch movies', loading: false })
    }
  },

  setSelectedMovie: (movie: Movie | null) => set({ selectedMovie: movie }),
}))
