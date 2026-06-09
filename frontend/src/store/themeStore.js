import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Theme store — toggles dark/light mode, persisted to localStorage.
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: true, // Default dark mode

      toggleTheme: () => {
        const next = !get().isDark
        set({ isDark: next })
        if (next) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      initTheme: () => {
        const isDark = get().isDark
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }),
    { name: 'ams-theme' }
  )
)

export default useThemeStore
