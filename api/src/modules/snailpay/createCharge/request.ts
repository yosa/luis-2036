import { chargeRequestSchema, type ChargeRequest, type FieldError } from '@snail-race/shared'
import type { z } from 'zod'

/** Lo que la respuesta devuelve en eco aunque la solicitud sea inválida. */
export type ChargeEcho = {
  transactionAmount: number | null
  payerId: string | null
  payerEmail: string | null
  cardNumber: string | null
  cvv: string | null
}

export type ParsedChargeRequest =
  | { kind: 'valid'; request: ChargeRequest; echo: ChargeEcho }
  | { kind: 'invalid'; fieldErrors: FieldError[]; echo: ChargeEcho }

/**
 * Borde del caso de uso: valida la forma del cuerpo con el contrato compartido.
 * No decide nada de negocio (eso es del service); solo clasifica.
 */
export function parseChargeRequest(body: unknown): ParsedChargeRequest {
  const echo = extractEcho(body)
  const result = chargeRequestSchema.safeParse(body)
  if (result.success) return { kind: 'valid', request: result.data, echo }
  return { kind: 'invalid', fieldErrors: toFieldErrors(result.error.issues), echo }
}

function toFieldErrors(issues: z.core.$ZodIssue[]): FieldError[] {
  const byField = new Map<string, FieldError>()
  for (const issue of issues) {
    const field = String(issue.path[0] ?? 'body')
    if (byField.has(field)) continue
    byField.set(field, { field, code: toFieldErrorCode(issue) })
  }
  return [...byField.values()]
}

function toFieldErrorCode(issue: z.core.$ZodIssue): FieldError['code'] {
  if (issue.code === 'invalid_type' && issue.input === undefined) return 'required'
  if (issue.code === 'too_small' || issue.code === 'too_big') return 'out_of_range'
  return 'invalid_format'
}

function extractEcho(body: unknown): ChargeEcho {
  const source = isRecord(body) ? body : {}
  const amount = source.amount
  return {
    transactionAmount: typeof amount === 'number' && Number.isFinite(amount) ? amount : null,
    payerId: stringOrNull(source.payer_id),
    payerEmail: stringOrNull(source.payer_email),
    cardNumber: stringOrNull(source.card_number),
    cvv: stringOrNull(source.cvv),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}
