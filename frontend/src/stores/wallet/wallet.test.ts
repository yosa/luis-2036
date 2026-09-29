import type { ChargeResponse } from '@snail-race/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { chargesSlot, walletsSlot } from '../../storage/slots'
import { useSessionStore } from '../session'
import { useWalletStore } from '.'

const ana = { fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' }

const approved = (overrides: Partial<ChargeResponse> = {}): ChargeResponse => ({
  id: 'charge-1',
  status: 'approved',
  status_detail: 'accredited',
  transaction_amount: 100,
  currency_id: 'MXN',
  date_created: '2026-09-28T19:54:03.120Z',
  authorization_code: 'A7K2Q9',
  reference: 'SNP-20260928-7K2QF4',
  payer_id: 'user-1',
  payer_email: 'ana@example.com',
  card_number: '1234123412341234',
  cvv: '543',
  ...overrides,
})

beforeEach(async () => {
  useSessionStore.setState({ user: null })
  await useSessionStore.getState().register(ana)
})

const userId = () => useSessionStore.getState().user?.id ?? ''

describe('wallet store', () => {
  it('un usuario nuevo empieza con saldo $0', () => {
    expect(useWalletStore.getState().balanceCents).toBe(0)
  })

  it('sigue a la sesión: carga el saldo guardado al entrar y lo vacía al salir', async () => {
    walletsSlot.write({ [userId()]: { balanceCents: 25_050, appliedChargeIds: ['x'] } })
    useSessionStore.getState().logout()

    expect(useWalletStore.getState().balanceCents).toBe(0)

    await useSessionStore.getState().login({ email: ana.email, password: ana.password })

    expect(useWalletStore.getState().balanceCents).toBe(25_050)
  })

  it('un cobro aprobado suma el monto, persiste el saldo y guarda el cobro', () => {
    const result = useWalletStore
      .getState()
      .recordCharge({ httpStatus: 201, response: approved(), requestedAmountCents: 10_000 })

    expect(result.credited).toBe(true)
    expect(useWalletStore.getState().balanceCents).toBe(10_000)
    expect(walletsSlot.read()[userId()]?.balanceCents).toBe(10_000)
  })

  it('la misma respuesta aplicada dos veces acredita una sola vez', () => {
    const { recordCharge } = useWalletStore.getState()
    recordCharge({ httpStatus: 201, response: approved(), requestedAmountCents: 10_000 })
    const second = recordCharge({
      httpStatus: 201,
      response: approved(),
      requestedAmountCents: 10_000,
    })

    expect(second.credited).toBe(false)
    expect(useWalletStore.getState().balanceCents).toBe(10_000)
  })

  it('un rechazo se guarda en el historial pero NO cambia el saldo', () => {
    const rejected = approved({
      id: 'charge-2',
      status: 'rejected',
      status_detail: 'cc_rejected_bad_filled_security_code',
      authorization_code: null,
      cvv: '999',
    })

    const result = useWalletStore
      .getState()
      .recordCharge({ httpStatus: 402, response: rejected, requestedAmountCents: 10_000 })

    expect(result.credited).toBe(false)
    expect(useWalletStore.getState().balanceCents).toBe(0)
    expect(useWalletStore.getState().charges[0]?.credited).toBe(false)
  })

  it('guarda el número de tarjeta y el CVV ficticios en LocalStorage (RF-24)', () => {
    useWalletStore
      .getState()
      .recordCharge({ httpStatus: 201, response: approved(), requestedAmountCents: 10_000 })

    const stored = chargesSlot.read()[userId()]?.[0]?.response
    expect(stored).toMatchObject({ card_number: '1234123412341234', cvv: '543' })
  })
})
