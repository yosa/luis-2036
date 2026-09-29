import { describe, expect, it } from 'vitest'
import {
  isExpired,
  MAGIC_CARDS,
  resolveScenario,
} from '../../src/modules/snailpay/createCharge/scenarios'
import { FIXED_NOW, validPayload } from '../support/factories'

describe('resolveScenario: tabla de escenarios de SnailPay', () => {
  it.each([
    ['cobro exitoso', {}, 'approved', 'accredited', 201],
    ['CVV incorrecto', { cvv: '999' }, 'rejected', 'cc_rejected_bad_filled_security_code', 402],
    [
      'vencimiento incorrecto',
      { expiration: '11/28' },
      'rejected',
      'cc_rejected_bad_filled_date',
      402,
    ],
    ['tarjeta vencida', { expiration: '01/24' }, 'rejected', 'cc_rejected_expired', 402],
    [
      'fondos insuficientes',
      { card_number: MAGIC_CARDS.insufficientFunds, expiration: '10/30' },
      'rejected',
      'cc_rejected_insufficient_funds',
      402,
    ],
    [
      'tarjeta bloqueada',
      { card_number: MAGIC_CARDS.cardBlocked, expiration: '10/30' },
      'rejected',
      'cc_rejected_card_blocked',
      402,
    ],
    [
      'tarjeta desconocida',
      { card_number: '5555666677778888', expiration: '10/30' },
      'rejected',
      'cc_rejected_unknown_card',
      402,
    ],
    [
      'servicio no disponible',
      { card_number: MAGIC_CARDS.serviceUnavailable },
      'error',
      'service_unavailable',
      503,
    ],
    ['falla interna', { card_number: MAGIC_CARDS.internalError }, 'error', 'internal_error', 503],
    ['timeout', { card_number: MAGIC_CARDS.processingTimeout }, 'error', 'processing_timeout', 504],
  ] as const)('%s', (_name, overrides, status, statusDetail, httpStatus) => {
    const outcome = resolveScenario(validPayload(overrides), FIXED_NOW)

    expect(outcome).toMatchObject({ status, statusDetail, httpStatus })
  })

  it('aprueba la combinación de éxito aunque 12/26 ya haya pasado', () => {
    const outcome = resolveScenario(validPayload(), new Date('2031-05-01T00:00:00Z'))

    expect(outcome.status).toBe('approved')
  })

  it('evalúa las fallas del sistema antes que el vencimiento', () => {
    const outcome = resolveScenario(
      validPayload({ card_number: MAGIC_CARDS.serviceUnavailable, expiration: '01/20' }),
      FIXED_NOW,
    )

    expect(outcome.statusDetail).toBe('service_unavailable')
  })

  it('solo el escenario de timeout pide simular la demora', () => {
    const timeout = resolveScenario(
      validPayload({ card_number: MAGIC_CARDS.processingTimeout }),
      FIXED_NOW,
    )
    const approved = resolveScenario(validPayload(), FIXED_NOW)

    expect(timeout.simulateProcessingDelay).toBe(true)
    expect(approved.simulateProcessingDelay).toBeUndefined()
  })
})

describe('isExpired', () => {
  it('una tarjeta sigue vigente hasta el último instante de su mes', () => {
    expect(isExpired('09/26', new Date('2026-09-30T23:59:59.999Z'))).toBe(false)
    expect(isExpired('09/26', new Date('2026-10-01T00:00:00.000Z'))).toBe(true)
  })

  it('una fecha futura no está vencida', () => {
    expect(isExpired('12/26', FIXED_NOW)).toBe(false)
  })
})
