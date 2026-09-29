import { create } from 'zustand'
import { walletsSlot, type Wallet } from '../../storage/slots'
import { useSessionStore } from '../session'

const EMPTY_WALLET: Wallet = { balanceCents: 0, appliedChargeIds: [] }

type WalletState = {
  /** Usuario al que pertenece el monedero cargado (null sin sesión). */
  userId: string | null
  balanceCents: number
  /** Carga el monedero del usuario; si no tiene, empieza en $0 (RF-08). */
  load: (userId: string | null) => void
}

export function readWallet(userId: string): Wallet {
  return walletsSlot.read()[userId] ?? EMPTY_WALLET
}

export const useWalletStore = create<WalletState>()((set) => ({
  userId: null,
  balanceCents: 0,
  load(userId) {
    set({ userId, balanceCents: userId ? readWallet(userId).balanceCents : 0 })
  },
}))

// El monedero sigue a la sesión: al entrar se carga el del usuario y al salir se vacía.
useWalletStore.getState().load(useSessionStore.getState().user?.id ?? null)
useSessionStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useWalletStore.getState().load(state.user?.id ?? null)
})
