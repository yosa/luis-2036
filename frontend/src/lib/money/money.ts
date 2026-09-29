import { CURRENCY, LOCALE } from '../../constants'

const formatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })

/** Pesos → centavos enteros. Redondea para absorber el error binario (19.99 * 100). */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function formatCents(cents: number): string {
  return formatter.format(cents / 100)
}

/** Muestra solo los últimos 4 dígitos: •••• 1234 (ADR 0006). */
export function maskCardNumber(cardNumber: string | null): string {
  if (!cardNumber) return '••••'
  return `•••• ${cardNumber.slice(-4)}`
}
