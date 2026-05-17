import { create } from 'zustand'
import type { Coords } from '@/types'

interface LocationStore {
  isSharing: boolean
  currentCoords: Coords | null
  accuracy: number | null
  error: string | null
  watchId: number | null
  setSharing: (isSharing: boolean) => void
  setCoords: (coords: Coords, accuracy: number) => void
  setError: (error: string) => void
  setWatchId: (watchId: number | null) => void
  reset: () => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  isSharing: false,
  currentCoords: null,
  accuracy: null,
  error: null,
  watchId: null,
  setSharing: (isSharing) => set({ isSharing }),
  setCoords: (coords, accuracy) => set({ currentCoords: coords, accuracy, error: null }),
  setError: (error) => set({ error }),
  setWatchId: (watchId) => set({ watchId }),
  reset: () =>
    set({ isSharing: false, currentCoords: null, accuracy: null, error: null, watchId: null }),
}))
