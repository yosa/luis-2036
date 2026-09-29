import {
  CARD_NUMBER_PATTERN,
  CVV_PATTERN,
  EXPIRATION_PATTERN,
  HOLDER_NAME_MAX_LENGTH,
  MAX_CHARGE_AMOUNT,
} from '@snail-race/shared'
import { z } from 'zod'

/**
 * Formulario de recarga. Los valores llegan como texto y se normalizan aquí;
 * los patrones son los MISMOS del contrato compartido con el API, así que el
 * cliente y SnailPay coinciden en qué es un dato válido.
 */
export const rechargeFormSchema = z.object({
  holderName: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre como aparece en la tarjeta')
    .max(HOLDER_NAME_MAX_LENGTH, `Usa máximo ${HOLDER_NAME_MAX_LENGTH} caracteres`),
  cardNumber: z
    .string()
    .transform((value) => value.replaceAll(/[\s-]/g, ''))
    .pipe(z.string().regex(CARD_NUMBER_PATTERN, 'El número de tarjeta debe tener 16 dígitos')),
  expiration: z
    .string()
    .trim()
    .regex(EXPIRATION_PATTERN, 'Usa el formato MM/AA, por ejemplo 12/26'),
  cvv: z.string().trim().regex(CVV_PATTERN, 'El CVV tiene 3 o 4 dígitos'),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Escribe un monto con hasta 2 decimales, por ejemplo 250.50')
    .transform(Number)
    .refine((value) => value > 0, 'El monto debe ser mayor que $0')
    .refine(
      (value) => value <= MAX_CHARGE_AMOUNT,
      `El monto máximo por recarga es $${MAX_CHARGE_AMOUNT.toLocaleString('es-MX')}`,
    ),
})

export type RechargeForm = z.output<typeof rechargeFormSchema>
export type RechargeFormField = keyof RechargeForm

/** Campo del contrato de SnailPay → campo del formulario (para pegar los field_errors). */
export const FIELD_BY_CONTRACT: Record<string, RechargeFormField | undefined> = {
  card_number: 'cardNumber',
  expiration: 'expiration',
  cvv: 'cvv',
  holder_name: 'holderName',
  amount: 'amount',
}
