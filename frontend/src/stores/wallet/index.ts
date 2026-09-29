import type { ChargeResponse } from '@snail-race/shared'
import { create } from 'zustand'
import { isCreditable } from '../../lib/wallet/creditRules'
import { chargesSlot, walletsSlot, type ChargeRecord, type Wallet } from '../../storage/slots'
import { useSessionStore } from '../session'

const EMPTY_WALLET: Wallet = { balanceCents: 0, appliedChargeIds: [] }
const EMPTY_CHARGES: ChargeRecord[] = []

type WalletState = {
  /** Usuario al que pertenece el monedero cargado (null sin sesión). */
  userId: string | null
  balanceCents: number
  /** Cobros del usuario, del más reciente al más antiguo. */
  charges: ChargeRecord[]
  /** Carga el monedero del usuario; si no tiene, empieza en $0 (RF-08). */
  load: (userId: string | null) => void
  /**
   * Única operación que puede aumentar el saldo. Guarda SIEMPRE el cobro en el
   * historial (con tarjeta y CVV ficticios, RF-24) y acredita solo si cumple la
   * regla contra falsos éxitos. Devuelve si acreditó.
   */
  recordCharge: (input: {
    httpStatus: number
    response: ChargeResponse
    requestedAmountCents: number
  }) => { credited: boolean }
}

export function readWallet(userId: string): Wallet {
  return walletsSlot.read()[userId] ?? EMPTY_WALLET
}

function readCharges(userId: string): ChargeRecord[] {
  return chargesSlot.read()[userId] ?? EMPTY_CHARGES
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  userId: null,
  balanceCents: 0,
  charges: EMPTY_CHARGES,

  load(userId) {
    set({
      userId,
      balanceCents: userId ? readWallet(userId).balanceCents : 0,
      charges: userId ? readCharges(userId) : EMPTY_CHARGES,
    })
  },

  recordCharge({ httpStatus, response, requestedAmountCents }) {
    const { userId } = get()
    if (!userId) return { credited: false }

    // Se lee del storage en el momento (no del estado en memoria) por si otra pestaña acreditó.
    const wallet = readWallet(userId)
    const credited = isCreditable({
      httpStatus,
      response,
      requestedAmountCents,
      appliedChargeIds: wallet.appliedChargeIds,
    })

    const record: ChargeRecord = {
      requestedAmountCents,
      httpStatus,
      recordedAt: new Date().toISOString(),
      credited,
      response,
    }
    const charges = [record, ...readCharges(userId)]
    chargesSlot.write({ ...chargesSlot.read(), [userId]: charges })

    if (credited) {
      const nextWallet: Wallet = {
        balanceCents: wallet.balanceCents + requestedAmountCents,
        appliedChargeIds: [...wallet.appliedChargeIds, response.id],
      }
      walletsSlot.write({ ...walletsSlot.read(), [userId]: nextWallet })
      set({ balanceCents: nextWallet.balanceCents, charges })
    } else {
      set({ charges })
    }
    return { credited }
  },
}))

// El monedero sigue a la sesión: al entrar se carga el del usuario y al salir se vacía.
useWalletStore.getState().load(useSessionStore.getState().user?.id ?? null)
useSessionStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useWalletStore.getState().load(state.user?.id ?? null)
})
