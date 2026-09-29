import { describe, expect, it } from 'vitest'
import { parseChargeRequest } from '../../src/modules/snailpay/createCharge/request'
import { validPayload } from '../support/factories'

describe('parseChargeRequest', () => {
  it('acepta una solicitud válida y recorta el nombre', () => {
    const parsed = parseChargeRequest(validPayload({ holder_name: '  Ana Pérez  ' }))

    expect(parsed.kind).toBe('valid')
    if (parsed.kind === 'valid') expect(parsed.request.holder_name).toBe('Ana Pérez')
  })

  it('distingue campo faltante de formato inválido', () => {
    const parsed = parseChargeRequest({
      ...validPayload(),
      card_number: undefined,
      payer_email: 'no-es-correo',
    })

    expect(parsed.kind).toBe('invalid')
    if (parsed.kind === 'invalid') {
      expect(parsed.fieldErrors).toEqual(
        expect.arrayContaining([
          { field: 'card_number', code: 'required' },
          { field: 'payer_email', code: 'invalid_format' },
        ]),
      )
    }
  })

  it.each([
    ['más de 2 decimales', 10.005],
    ['cero', 0],
    ['negativo', -5],
    ['mayor al máximo', 10_000.01],
  ])('rechaza el monto: %s', (_name, amount) => {
    expect(parseChargeRequest(validPayload({ amount })).kind).toBe('invalid')
  })

  it('acepta montos con centavos que no son exactos en binario', () => {
    expect(parseChargeRequest(validPayload({ amount: 0.07 })).kind).toBe('valid')
    expect(parseChargeRequest(validPayload({ amount: 19.99 })).kind).toBe('valid')
  })

  it('si el cuerpo no es un objeto, el eco queda en null', () => {
    const parsed = parseChargeRequest('texto')

    expect(parsed.echo).toEqual({
      transactionAmount: null,
      payerId: null,
      payerEmail: null,
      cardNumber: null,
      cvv: null,
    })
  })
})
