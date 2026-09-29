import { z } from 'zod'
import { create } from 'zustand'
import { THEME_STORAGE_KEY } from '../../constants'
import { createStorageSlot } from '../../storage/createStorageSlot'

export type ThemeMode = 'light' | 'dark'

const themeSlot = createStorageSlot(
  THEME_STORAGE_KEY,
  z.enum(['light', 'dark']).nullable(),
  () => null,
)

type ThemeState = {
  mode: ThemeMode
  toggle: () => void
}

/** El modo inicial ya lo fijó el script anti-FOUC de index.html en <html data-mode>. */
function currentMode(): ThemeMode {
  return document.documentElement.dataset.mode === 'light' ? 'light' : 'dark'
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  mode: currentMode(),
  toggle: () => {
    const mode: ThemeMode = get().mode === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.mode = mode
    themeSlot.write(mode)
    set({ mode })
  },
}))
