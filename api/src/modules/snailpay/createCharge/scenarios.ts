import type { ChargeRequest, ChargeStatus, StatusDetail } from '@snail-race/shared'

/**
 * Tabla de escenarios de SnailPay (docs/03-snailpay/escenarios.md). Función
 * pura: misma entrada y misma fecha, mismo resultado.
 */

export const SUCCESS_CARD = {
  number: '1234123412341234',
  expiration: '12/26',
  cvv: '543',
} as const

/** Tarjetas ficticias que disparan un escenario; terminan en un número mnemónico. */
export const MAGIC_CARDS = {
  serviceUnavailable: '4000000000000503',
  internalError: '4000000000000500',
  processingTimeout: '4000000000000408',
  insufficientFunds: '4000000000000402',
  cardBlocked: '4000000000000403',
} as const

export type ScenarioOutcome = {
  status: ChargeStatus
  statusDetail: StatusDetail
  httpStatus: number
  /** Solo el escenario de timeout: cuánto esperar antes de responder. */
  simulateProcessingDelay?: true
}

const outcome = (
  status: ChargeStatus,
  statusDetail: StatusDetail,
  httpStatus: number,
): ScenarioOutcome => ({ status, statusDetail, httpStatus })

export function resolveScenario(request: ChargeRequest, now: Date): ScenarioOutcome {
  const { card_number: cardNumber, expiration, cvv } = request

  // 1. Fallas del sistema: un emisor caído no evalúa nada más.
  if (cardNumber === MAGIC_CARDS.serviceUnavailable) {
    return outcome('error', 'service_unavailable', 503)
  }
  if (cardNumber === MAGIC_CARDS.internalError) return outcome('error', 'internal_error', 503)
  if (cardNumber === MAGIC_CARDS.processingTimeout) {
    return { ...outcome('error', 'processing_timeout', 504), simulateProcessingDelay: true }
  }

  // 2. La combinación de éxito se aprueba siempre, sin importar la fecha, para
  //    que el escenario obligatorio siga siendo reproducible después de 12/26.
  if (
    cardNumber === SUCCESS_CARD.number &&
    expiration === SUCCESS_CARD.expiration &&
    cvv === SUCCESS_CARD.cvv
  ) {
    return outcome('approved', 'accredited', 201)
  }

  // 3. Rechazos del emisor.
  if (isExpired(expiration, now)) return outcome('rejected', 'cc_rejected_expired', 402)
  if (cardNumber === MAGIC_CARDS.insufficientFunds) {
    return outcome('rejected', 'cc_rejected_insufficient_funds', 402)
  }
  if (cardNumber === MAGIC_CARDS.cardBlocked) {
    return outcome('rejected', 'cc_rejected_card_blocked', 402)
  }
  if (cardNumber === SUCCESS_CARD.number) {
    return cvv === SUCCESS_CARD.cvv
      ? outcome('rejected', 'cc_rejected_bad_filled_date', 402)
      : outcome('rejected', 'cc_rejected_bad_filled_security_code', 402)
  }
  return outcome('rejected', 'cc_rejected_unknown_card', 402)
}

/** Una tarjeta MM/YY es válida hasta el último día de ese mes (en UTC). */
export function isExpired(expiration: string, now: Date): boolean {
  const [month, year] = expiration.split('/').map(Number)
  if (month === undefined || year === undefined) return true
  const expiresAfter = Date.UTC(2000 + year, month, 1) // primer instante del mes siguiente
  return now.getTime() >= expiresAfter
}
