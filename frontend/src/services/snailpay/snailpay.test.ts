import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpUnexpectedResponseError } from '../../lib/http/errors'
import { createCharge } from '.'

afterEach(() => {
  vi.unstubAllGlobals()
})

const request = {
  card_number: '1234123412341234',
  expiration: '12/26',
  cvv: '543',
  holder_name: 'Ana Pérez',
  amount: 100,
  payer_id: '3f0c2a8e-1b4d-4c6e-8f9a-0b1c2d3e4f5a',
  payer_email: 'ana@example.com',
}

describe('createCharge', () => {
  it('una respuesta con forma de contrato se entrega aunque sea un 402', async () => {
    const body = {
      id: 'c-1',
      status: 'rejected',
      status_detail: 'cc_rejected_expired',
      transaction_amount: 100,
      currency_id: 'MXN',
      date_created: '2026-09-28T19:54:03.120Z',
      authorization_code: null,
      reference: 'SNP-20260928-AAAAAA',
      payer_id: request.payer_id,
      payer_email: request.payer_email,
      card_number: request.card_number,
      cvv: request.cvv,
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(body, { status: 402 }))),
    )

    await expect(createCharge(request)).resolves.toMatchObject({
      httpStatus: 402,
      response: { status_detail: 'cc_rejected_expired' },
    })
  })

  it('una respuesta fuera de contrato (p. ej. HTML de un proxy) lanza HttpUnexpectedResponseError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('<h1>502</h1>', { status: 502 }))),
    )

    await expect(createCharge(request)).rejects.toBeInstanceOf(HttpUnexpectedResponseError)
  })

  it('un 201 sin los campos del contrato tampoco se acepta como aprobado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json({ status: 'approved' }, { status: 201 }))),
    )

    await expect(createCharge(request)).rejects.toBeInstanceOf(HttpUnexpectedResponseError)
  })
})
