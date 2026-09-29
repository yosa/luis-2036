import type { ChargeResponse } from '@snail-race/shared'
import { toCents } from '../money/money'

export type CreditCheck = {
  httpStatus: number
  response: ChargeResponse
  requestedAmountCents: number
  appliedChargeIds: readonly string[]
}

/**
 * Regla contra falsos éxitos (ADR 0004): un cobro acredita saldo solo si se
 * cumplen las cinco condiciones. Cualquier otra combinación NO acredita.
 */
export function isCreditable({
  httpStatus,
  response,
  requestedAmountCents,
  appliedChargeIds,
}: CreditCheck): boolean {
  return (
    httpStatus === 201 &&
    response.status === 'approved' &&
    Boolean(response.authorization_code) &&
    response.transaction_amount !== null &&
    toCents(response.transaction_amount) === requestedAmountCents &&
    !appliedChargeIds.includes(response.id)
  )
}
