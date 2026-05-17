import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionData } from '@/types'

interface SessionStore {
  session: SessionData | null
  setSession: (session: SessionData) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    { name: 'latemate-session' },
  ),
)
