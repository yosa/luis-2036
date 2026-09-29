import { beforeEach, describe, expect, it } from 'vitest'
import { walletsSlot } from '../../storage/slots'
import { useSessionStore } from '../session'
import { useWalletStore } from '.'

const ana = { fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' }

beforeEach(() => {
  useSessionStore.setState({ user: null })
})

describe('wallet store', () => {
  it('un usuario nuevo empieza con saldo $0', async () => {
    await useSessionStore.getState().register(ana)

    expect(useWalletStore.getState().balanceCents).toBe(0)
  })

  it('sigue a la sesión: carga el saldo guardado al entrar y lo vacía al salir', async () => {
    await useSessionStore.getState().register(ana)
    const userId = useSessionStore.getState().user?.id ?? ''
    walletsSlot.write({ [userId]: { balanceCents: 25_050, appliedChargeIds: ['x'] } })
    useSessionStore.getState().logout()

    expect(useWalletStore.getState().balanceCents).toBe(0)

    await useSessionStore.getState().login({ email: ana.email, password: ana.password })

    expect(useWalletStore.getState()).toMatchObject({ userId, balanceCents: 25_050 })
  })
})
