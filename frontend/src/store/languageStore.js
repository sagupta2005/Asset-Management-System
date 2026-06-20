import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLanguageStore = create(
  persist(
    (set) => ({
      lang: 'EN',
      toggleLang: () => set((state) => ({ lang: state.lang === 'EN' ? 'HI' : 'EN' })),
      setLang: (lang) => set({ lang }),
    }),
    { name: 'ams-lang' }
  )
)

export default useLanguageStore
