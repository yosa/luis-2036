import { describe, expect, it } from 'vitest'
import { formatCents, maskCardNumber, toCents } from './money'

describe('money', () => {
  it('convierte a centavos sin errores de punto flotante', () => {
    expect(toCents(19.99)).toBe(1999)
    expect(toCents(0.07)).toBe(7)
    expect(toCents(250.5)).toBe(25_050)
  })

  it('formatea en pesos mexicanos', () => {
    expect(formatCents(125_050)).toBe('$1,250.50')
  })

  it('enmascara la tarjeta dejando solo los últimos 4 dígitos', () => {
    expect(maskCardNumber('1234123412341234')).toBe('•••• 1234')
    expect(maskCardNumber(null)).toBe('••••')
  })
})
