import { chargeResponseSchema, type ChargeRequest, type ChargeResponse } from '@snail-race/shared'
import { HttpUnexpectedResponseError } from '../../lib/http/errors'
import { httpRequest } from '../../lib/http/httpRequest'

const CHARGES_PATH = '/v1/snailpay/charges'

export type ChargeResult = { httpStatus: number; response: ChargeResponse }

/**
 * Solicita un cobro a SnailPay. Toda respuesta del endpoint (también 4xx/5xx)
 * trae el contrato del proveedor (ADR 0004), así que se valida el cuerpo
 * contra el esquema compartido en lugar de fiarse del status. Lanza
 * HttpTimeoutError / HttpNetworkError / HttpUnexpectedResponseError.
 */
export async function createCharge(request: ChargeRequest): Promise<ChargeResult> {
  const { status, body } = await httpRequest(CHARGES_PATH, { method: 'POST', json: request })
  const parsed = chargeResponseSchema.safeParse(body)
  if (!parsed.success) throw new HttpUnexpectedResponseError(CHARGES_PATH, status)
  return { httpStatus: status, response: parsed.data }
}
