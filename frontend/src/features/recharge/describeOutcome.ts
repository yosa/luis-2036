import type { StatusDetail } from '@snail-race/shared'
import { formatCents } from '../../lib/money/money'

export type RechargeOutcome =
  | {
      kind: 'charge'
      httpStatus: number
      statusDetail: StatusDetail
      credited: boolean
      authorizationCode: string | null
      reference: string
      amountCents: number
      balanceCents: number
    }
  | { kind: 'timeout' }
  | { kind: 'network' }
  | { kind: 'unexpected' }

export type OutcomeMessage = {
  tone: 'success' | 'error' | 'warning'
  title: string
  detail: string
}

const NO_CHARGE = 'No se aplicó ningún saldo.'

const REJECTION_TITLES: Partial<Record<StatusDetail, string>> = {
  invalid_request: 'Revisa los datos marcados en el formulario.',
  cc_rejected_insufficient_funds: 'La tarjeta no tiene fondos suficientes.',
  cc_rejected_card_blocked: 'El banco bloqueó esta tarjeta. Usa otra.',
  cc_rejected_expired: 'La tarjeta está vencida.',
  cc_rejected_bad_filled_security_code: 'El CVV no es correcto.',
  cc_rejected_bad_filled_date: 'La fecha de vencimiento no es correcta.',
  cc_rejected_unknown_card: 'No reconocemos esta tarjeta. Revisa el número.',
  service_unavailable: 'SnailPay no está disponible en este momento.',
  internal_error: 'SnailPay no está disponible en este momento.',
  rate_limited: 'Demasiados intentos. Espera un momento y vuelve a intentar.',
}

/**
 * Traduce el resultado de una recarga a un mensaje para la persona. El texto
 * se decide por `status_detail` (el contrato), nunca por un mensaje del
 * servidor. Todo lo que no sea un cobro acreditado dice explícitamente que el
 * saldo no cambió (RF-23).
 */
export function describeOutcome(outcome: RechargeOutcome): OutcomeMessage {
  if (outcome.kind === 'timeout') {
    return {
      tone: 'warning',
      title: 'No pudimos confirmar la recarga a tiempo.',
      detail: `${NO_CHARGE} Puedes intentarlo de nuevo.`,
    }
  }
  if (outcome.kind === 'network') {
    return {
      tone: 'error',
      title: 'Sin conexión con SnailPay.',
      detail: `Revisa tu conexión e intenta de nuevo. ${NO_CHARGE}`,
    }
  }
  if (outcome.kind === 'unexpected') {
    return { tone: 'error', title: 'Ocurrió un error inesperado.', detail: NO_CHARGE }
  }

  if (outcome.credited) {
    return {
      tone: 'success',
      title: `Recarga aprobada por ${formatCents(outcome.amountCents)}.`,
      detail: `Código de autorización ${outcome.authorizationCode ?? ''} · Referencia ${outcome.reference} · Nuevo saldo ${formatCents(outcome.balanceCents)}.`,
    }
  }
  if (outcome.statusDetail === 'accredited') {
    // SnailPay dijo "aprobado" pero la respuesta no cumple la regla contra falsos éxitos.
    return {
      tone: 'warning',
      title: 'La respuesta de SnailPay no coincide con lo solicitado.',
      detail: `${NO_CHARGE} Referencia ${outcome.reference}.`,
    }
  }
  if (outcome.statusDetail === 'processing_timeout') {
    return {
      tone: 'warning',
      title: 'No pudimos confirmar la recarga a tiempo.',
      detail: `${NO_CHARGE} Referencia ${outcome.reference}.`,
    }
  }

  const title = REJECTION_TITLES[outcome.statusDetail] ?? 'Ocurrió un error inesperado.'
  return {
    tone: 'error',
    title,
    detail: `${NO_CHARGE} Tu saldo sigue en ${formatCents(outcome.balanceCents)}. Referencia ${outcome.reference}.`,
  }
}
