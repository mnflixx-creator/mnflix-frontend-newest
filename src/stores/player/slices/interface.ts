/**
 * Interface slice - UI state for player controls
 */

export interface InterfaceSlice {
  // Control visibility
  controlsVisible: boolean
  showControls: () => void
  hideControls: () => void
  
  // Display modes
  isFullscreen: boolean
  isTheaterMode: boolean
  toggleFullscreen: () => void
  toggleTheaterMode: () => void
  setFullscreen: (fullscreen: boolean) => void
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Settings panel
  showSettings: boolean
  toggleSettings: () => void
}

export const createInterfaceSlice = (set: any): InterfaceSlice => ({
  controlsVisible: true,
  showControls: () => set({ controlsVisible: true }),
  hideControls: () => set({ controlsVisible: false }),
  
  isFullscreen: false,
  isTheaterMode: false,
  toggleFullscreen: () => set((state: InterfaceSlice) => ({ 
    isFullscreen: !state.isFullscreen 
  })),
  toggleTheaterMode: () => set((state: InterfaceSlice) => ({ 
    isTheaterMode: !state.isTheaterMode 
  })),
  setFullscreen: (fullscreen: boolean) => set({ isFullscreen: fullscreen }),
  
  isLoading: false,
  error: null,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  
  showSettings: false,
  toggleSettings: () => set((state: InterfaceSlice) => ({ 
    showSettings: !state.showSettings 
  })),
})
