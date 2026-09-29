import type { ChargeResponse } from '@snail-race/shared'
import { describe, expect, it } from 'vitest'
import { isCreditable, type CreditCheck } from './creditRules'

const approved: ChargeResponse = {
  id: 'charge-1',
  status: 'approved',
  status_detail: 'accredited',
  transaction_amount: 250.5,
  currency_id: 'MXN',
  date_created: '2026-09-28T19:54:03.120Z',
  authorization_code: 'A7K2Q9',
  reference: 'SNP-20260928-7K2QF4',
  payer_id: 'user-1',
  payer_email: 'ana@example.com',
  card_number: '1234123412341234',
  cvv: '543',
}

const check = (overrides: Partial<CreditCheck> = {}, response: Partial<ChargeResponse> = {}) =>
  isCreditable({
    httpStatus: 201,
    requestedAmountCents: 25_050,
    appliedChargeIds: [],
    ...overrides,
    response: { ...approved, ...response },
  })

describe('isCreditable: regla contra falsos éxitos', () => {
  it('acredita un cobro aprobado que cumple las cinco condiciones', () => {
    expect(check()).toBe(true)
  })

  it.each([
    ['HTTP distinto de 201', { httpStatus: 200 }, {}],
    ['status no aprobado', {}, { status: 'rejected' as const }],
    ['sin código de autorización', {}, { authorization_code: null }],
    ['monto distinto al pedido', { requestedAmountCents: 25_000 }, {}],
    ['monto nulo', {}, { transaction_amount: null }],
    ['id ya aplicado (respuesta repetida)', { appliedChargeIds: ['charge-1'] }, {}],
  ])('NO acredita: %s', (_name, overrides, response) => {
    expect(check(overrides, response)).toBe(false)
  })

  it('compara el monto en centavos, sin errores de punto flotante', () => {
    expect(check({ requestedAmountCents: 1999 }, { transaction_amount: 19.99 })).toBe(true)
  })
})
