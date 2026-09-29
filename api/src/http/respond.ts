import type { Response } from 'express'

/**
 * Envelope del ecosistema (estándar de respuesta JSON) para las rutas
 * propias del API. Las respuestas de cobro usan el contrato de SnailPay (ADR 0004).
 */
export type ApiError = { code: string; message: string; context: Record<string, unknown> }

export const respond = {
  ok(res: Response, data: unknown): void {
    res.status(200).json({ success: true, errors: [], info: [], data })
  },
  error(res: Response, status: number, error: ApiError): void {
    res.status(status).json({ success: false, errors: [error], info: [], data: null })
  },
}
