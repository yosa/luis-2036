import { describe, expect, it } from 'vitest'
import { describeOutcome, type RechargeOutcome } from './describeOutcome'

const charge = (
  overrides: Partial<Extract<RechargeOutcome, { kind: 'charge' }>> = {},
): RechargeOutcome => ({
  kind: 'charge',
  httpStatus: 201,
  statusDetail: 'accredited',
  credited: true,
  authorizationCode: 'A7K2Q9',
  reference: 'SNP-20260928-7K2QF4',
  amountCents: 25_050,
  balanceCents: 25_050,
  ...overrides,
})

describe('describeOutcome', () => {
  it('un cobro acreditado informa monto, autorización, referencia y nuevo saldo', () => {
    expect(describeOutcome(charge())).toEqual({
      tone: 'success',
      title: 'Recarga aprobada por $250.50.',
      detail:
        'Código de autorización A7K2Q9 · Referencia SNP-20260928-7K2QF4 · Nuevo saldo $250.50.',
    })
  })

  it('"aprobado" que no pasa la regla contra falsos éxitos NO se presenta como éxito', () => {
    const message = describeOutcome(charge({ credited: false, balanceCents: 0 }))

    expect(message.tone).toBe('warning')
    expect(message.detail).toContain('No se aplicó ningún saldo.')
  })

  it.each([
    ['cc_rejected_bad_filled_security_code', 'El CVV no es correcto.'],
    ['cc_rejected_insufficient_funds', 'La tarjeta no tiene fondos suficientes.'],
    ['cc_rejected_expired', 'La tarjeta está vencida.'],
    ['service_unavailable', 'SnailPay no está disponible en este momento.'],
    ['rate_limited', 'Demasiados intentos. Espera un momento y vuelve a intentar.'],
  ] as const)('%s → "%s", y aclara que el saldo no cambió', (statusDetail, title) => {
    const message = describeOutcome(
      charge({ statusDetail, credited: false, httpStatus: 402, balanceCents: 0 }),
    )

    expect(message).toMatchObject({ tone: 'error', title })
    expect(message.detail).toContain('No se aplicó ningún saldo. Tu saldo sigue en $0.00.')
  })

  it('timeout, sin red y respuesta inesperada tienen mensajes distintos, ninguno de éxito', () => {
    const titles = (['timeout', 'network', 'unexpected'] as const).map(
      (kind) => describeOutcome({ kind }).title,
    )

    expect(new Set(titles).size).toBe(3)
    expect(describeOutcome({ kind: 'timeout' }).tone).toBe('warning')
  })
})
