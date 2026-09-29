import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Escribe tu correo')
  .pipe(z.email('Escribe un correo válido, como ana@ejemplo.com'))

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Escribe tu nombre completo')
      .max(80, 'Usa máximo 80 caracteres'),
    email,
    password: z
      .string()
      .min(8, 'Usa al menos 8 caracteres')
      .max(128, 'Usa máximo 128 caracteres')
      .regex(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/, 'Incluye al menos una letra')
      .regex(/\d/, 'Incluye al menos un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Escribe tu contraseña'),
})
