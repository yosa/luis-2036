import { chargeResponseSchema } from '@snail-race/shared'
import { describe, expect, it } from 'vitest'
import { parseChargeRequest } from '../../src/modules/snailpay/createCharge/request'
import { MAGIC_CARDS } from '../../src/modules/snailpay/createCharge/scenarios'
import { createChargeService } from '../../src/modules/snailpay/createCharge/service'
import { fakeChargeDeps, validPayload } from '../support/factories'

const run = (body: unknown, deps = fakeChargeDeps()) =>
  createChargeService(deps).run(parseChargeRequest(body))

describe('createChargeService', () => {
  it('un cobro aprobado trae código de autorización y cumple el contrato', async () => {
    const result = await run(validPayload({ amount: 250.5 }))

    expect(result.httpStatus).toBe(201)
    expect(chargeResponseSchema.parse(result.body)).toMatchObject({
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 250.5,
      authorization_code: 'AAAAAA',
      reference: 'SNP-20260928-AAAAAA',
      date_created: '2026-09-28T19:54:03.120Z',
      card_number: '1234123412341234',
      cvv: '543',
    })
  })

  it('un rechazo nunca trae código de autorización', async () => {
    const result = await run(validPayload({ cvv: '111' }))

    expect(result.body.status).toBe('rejected')
    expect(result.body.authorization_code).toBeNull()
  })

  it('la caída por configuración gana incluso sobre datos inválidos, y nada se aprueba', async () => {
    const deps = fakeChargeDeps({ isOutage: () => true })

    const invalid = await run({ card_number: '1' }, deps)
    const wouldApprove = await run(validPayload(), deps)

    for (const result of [invalid, wouldApprove]) {
      expect(result.httpStatus).toBe(503)
      expect(result.body).toMatchObject({ status: 'error', status_detail: 'service_unavailable' })
      expect(result.body.authorization_code).toBeNull()
      expect(result.retryAfterSeconds).toBe(30)
    }
  })

  it('datos inválidos → 422 con un error por campo y eco de lo recibido', async () => {
    const result = await run({ ...validPayload(), cvv: '5', expiration: '13/26', amount: 0 })

    expect(result.httpStatus).toBe(422)
    expect(result.body.status_detail).toBe('invalid_request')
    expect(result.body.field_errors).toEqual(
      expect.arrayContaining([
        { field: 'cvv', code: 'invalid_format' },
        { field: 'expiration', code: 'invalid_format' },
        { field: 'amount', code: 'out_of_range' },
      ]),
    )
    expect(result.body).toMatchObject({ transaction_amount: 0, cvv: '5' })
    expect(chargeResponseSchema.safeParse(result.body).success).toBe(true)
  })

  it('el escenario de timeout espera la demora configurada y nunca aprueba', async () => {
    const deps = fakeChargeDeps({ processingDelayMs: 12_000 })

    const result = await run(validPayload({ card_number: MAGIC_CARDS.processingTimeout }), deps)

    expect(deps.sleep).toHaveBeenCalledWith(12_000)
    expect(result).toMatchObject({ httpStatus: 504, body: { status: 'error' } })
  })

  it('failure() produce respuestas con forma de contrato', () => {
    const service = createChargeService(fakeChargeDeps())

    expect(chargeResponseSchema.parse(service.failure('malformed_request'))).toMatchObject({
      status: 'rejected',
      transaction_amount: null,
    })
    expect(service.failure('rate_limited').status).toBe('error')
  })
})
