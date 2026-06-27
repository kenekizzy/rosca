import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

export interface AppUser {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface AppState {
  user: AppUser | null
  theme: Theme
  setUser: (user: AppUser | null) => void
  setTheme: (theme: Theme) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ajoflow-store', partialize: (state) => ({ theme: state.theme }) }
  )
)
