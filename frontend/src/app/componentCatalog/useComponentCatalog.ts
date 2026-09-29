import { useState } from 'react'
import { z } from 'zod'
import { useZodForm } from '../../hooks/useZodForm'

const demoSchema = z.object({
  email: z.email('Escribe un correo válido'),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Escribe un monto con hasta 2 decimales')
    .transform(Number)
    .refine((value) => value >= 1 && value <= 10_000, 'El monto va de $1 a $10,000'),
})

export function useComponentCatalog() {
  const [submitted, setSubmitted] = useState<string | null>(null)
  const form = useZodForm({
    schema: demoSchema,
    initialValues: { email: '', amount: '' },
    idPrefix: 'catalog',
  })

  async function onSubmit(data: z.output<typeof demoSchema>) {
    // Simula una petición para mostrar el estado de carga del botón.
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitted(`${data.email} · $${data.amount.toFixed(2)}`)
  }

  return { form, submitted, onSubmit }
}
