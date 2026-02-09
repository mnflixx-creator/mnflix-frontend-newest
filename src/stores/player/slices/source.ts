/**
 * Source slice - Media source and quality management
 */

import { StreamSource, Subtitle } from '../../../types/player'

export interface SourceSlice {
  // Media info
  mediaId: string | null
  mediaTitle: string
  mediaType: 'movie' | 'series' | 'anime' | 'kdrama' | 'cdrama'
  
  // Streaming sources
  sources: StreamSource[]
  currentSource: StreamSource | null
  availableQualities: string[]
  currentQuality: string
  
  // Subtitles
  subtitles: Subtitle[]
  currentSubtitle: Subtitle | null
  
  // Actions
  setMediaInfo: (id: string, title: string, type: string) => void
  setSources: (sources: StreamSource[]) => void
  setCurrentSource: (source: StreamSource | null) => void
  setQuality: (quality: string) => void
  setSubtitles: (subtitles: Subtitle[]) => void
  setCurrentSubtitle: (subtitle: Subtitle | null) => void
  
  // Helper methods
  getSourceByQuality: (quality: string) => StreamSource | null
}

export const createSourceSlice = (set: any, get: any): SourceSlice => ({
  mediaId: null,
  mediaTitle: '',
  mediaType: 'movie',
  
  sources: [],
  currentSource: null,
  availableQualities: [],
  currentQuality: 'auto',
  
  subtitles: [],
  currentSubtitle: null,
  
  setMediaInfo: (id: string, title: string, type: string) => 
    set({ 
      mediaId: id, 
      mediaTitle: title, 
      mediaType: type as any 
    }),
  
  setSources: (sources: StreamSource[]) => {
    const qualities = ['auto', ...Array.from(new Set(sources.map(s => s.quality)))]
    set({ 
      sources, 
      availableQualities: qualities,
      currentSource: sources[0] || null 
    })
  },
  
  setCurrentSource: (source: StreamSource | null) => 
    set({ currentSource: source }),
  
  setQuality: (quality: string) => {
    const state = get() as SourceSlice
    const source = state.getSourceByQuality(quality)
    set({ 
      currentQuality: quality,
      currentSource: source || state.currentSource
    })
  },
  
  setSubtitles: (subtitles: Subtitle[]) => 
    set({ subtitles }),
  
  setCurrentSubtitle: (subtitle: Subtitle | null) => 
    set({ currentSubtitle: subtitle }),
  
  getSourceByQuality: (quality: string) => {
    const state = get() as SourceSlice
    if (quality === 'auto') {
      return state.sources[0] || null
    }
    return state.sources.find(s => s.quality === quality) || null
  },
})
