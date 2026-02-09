/**
 * Caption slice - Subtitle and caption management
 */

import { Subtitle } from '../../../types/player'

export interface CaptionSlice {
  // Caption state
  captionsEnabled: boolean
  availableCaptions: Subtitle[]
  selectedCaption: Subtitle | null
  
  // Caption styling
  fontSize: 'small' | 'medium' | 'large'
  fontColor: string
  backgroundColor: string
  
  // Actions
  enableCaptions: () => void
  disableCaptions: () => void
  toggleCaptions: () => void
  setAvailableCaptions: (captions: Subtitle[]) => void
  selectCaption: (caption: Subtitle | null) => void
  
  // Styling actions
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setFontColor: (color: string) => void
  setBackgroundColor: (color: string) => void
}

export const createCaptionSlice = (set: any): CaptionSlice => ({
  captionsEnabled: false,
  availableCaptions: [],
  selectedCaption: null,
  
  fontSize: 'medium',
  fontColor: '#FFFFFF',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  
  enableCaptions: () => set({ captionsEnabled: true }),
  disableCaptions: () => set({ captionsEnabled: false }),
  toggleCaptions: () => set((state: CaptionSlice) => ({ 
    captionsEnabled: !state.captionsEnabled 
  })),
  
  setAvailableCaptions: (captions: Subtitle[]) => 
    set({ availableCaptions: captions }),
  
  selectCaption: (caption: Subtitle | null) => {
    set({ 
      selectedCaption: caption,
      captionsEnabled: caption !== null 
    })
  },
  
  setFontSize: (size: 'small' | 'medium' | 'large') => 
    set({ fontSize: size }),
  
  setFontColor: (color: string) => 
    set({ fontColor: color }),
  
  setBackgroundColor: (color: string) => 
    set({ backgroundColor: color }),
})
