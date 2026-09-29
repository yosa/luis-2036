import { z } from 'zod'

/**
 * Contrato de SnailPay. Única definición de la solicitud y la respuesta de un
 * cobro: el API la usa para validar y construir la respuesta; el frontend,
 * para validar el formulario y lo que recibe. Ver docs/03-snailpay/contrato.md.
 */

export const CARD_NUMBER_PATTERN = /^\d{16}$/
export const EXPIRATION_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/
export const CVV_PATTERN = /^\d{3,4}$/
export const HOLDER_NAME_MAX_LENGTH = 80
export const MAX_CHARGE_AMOUNT = 10_000

/** true si el número tiene como máximo dos decimales (tolerante al redondeo binario). */
export function hasAtMostTwoDecimals(value: number): boolean {
  const cents = value * 100
  return Math.abs(cents - Math.round(cents)) < 1e-6
}

export const chargeRequestSchema = z.object({
  card_number: z.string().regex(CARD_NUMBER_PATTERN),
  expiration: z.string().regex(EXPIRATION_PATTERN),
  cvv: z.string().regex(CVV_PATTERN),
  holder_name: z.string().trim().min(1).max(HOLDER_NAME_MAX_LENGTH),
  amount: z
    .number()
    .positive()
    .max(MAX_CHARGE_AMOUNT)
    .refine(hasAtMostTwoDecimals, { message: 'too_many_decimals' }),
  payer_id: z.uuid(),
  payer_email: z.email(),
})

export type ChargeRequest = z.infer<typeof chargeRequestSchema>
export type ChargeRequestField = keyof ChargeRequest

export const CHARGE_STATUSES = ['approved', 'rejected', 'error'] as const
export type ChargeStatus = (typeof CHARGE_STATUSES)[number]

export const STATUS_DETAILS = [
  'accredited',
  'invalid_request',
  'malformed_request',
  'cc_rejected_insufficient_funds',
  'cc_rejected_card_blocked',
  'cc_rejected_expired',
  'cc_rejected_bad_filled_security_code',
  'cc_rejected_bad_filled_date',
  'cc_rejected_unknown_card',
  'service_unavailable',
  'internal_error',
  'processing_timeout',
  'rate_limited',
] as const
export type StatusDetail = (typeof STATUS_DETAILS)[number]

export const FIELD_ERROR_CODES = ['required', 'invalid_format', 'out_of_range'] as const

export const fieldErrorSchema = z.object({
  field: z.string(),
  code: z.enum(FIELD_ERROR_CODES),
})
export type FieldError = z.infer<typeof fieldErrorSchema>

export const chargeResponseSchema = z.object({
  id: z.string().min(1),
  status: z.enum(CHARGE_STATUSES),
  status_detail: z.enum(STATUS_DETAILS),
  transaction_amount: z.number().nullable(),
  currency_id: z.literal('MXN'),
  date_created: z.iso.datetime(),
  authorization_code: z.string().nullable(),
  reference: z.string().min(1),
  payer_id: z.string().nullable(),
  payer_email: z.string().nullable(),
  card_number: z.string().nullable(),
  cvv: z.string().nullable(),
  field_errors: z.array(fieldErrorSchema).optional(),
})

export type ChargeResponse = z.infer<typeof chargeResponseSchema>
