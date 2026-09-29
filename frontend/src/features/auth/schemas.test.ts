import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './schemas'

const valid = {
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  password: 'Caracol123',
  confirmPassword: 'Caracol123',
}

const firstError = (input: unknown) => registerSchema.safeParse(input).error?.issues[0]?.message

describe('registerSchema', () => {
  it('acepta un registro válido', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it.each([
    ['contraseña corta', { password: 'Ab1', confirmPassword: 'Ab1' }, 'Usa al menos 8 caracteres'],
    [
      'sin número',
      { password: 'Caracoles', confirmPassword: 'Caracoles' },
      'Incluye al menos un número',
    ],
    [
      'sin letra',
      { password: '12345678', confirmPassword: '12345678' },
      'Incluye al menos una letra',
    ],
    ['confirmación distinta', { confirmPassword: 'Caracol124' }, 'Las contraseñas no coinciden'],
    ['correo inválido', { email: 'ana@' }, 'Escribe un correo válido, como ana@ejemplo.com'],
    ['nombre vacío', { fullName: '   ' }, 'Escribe tu nombre completo'],
  ])('rechaza: %s', (_name, overrides, message) => {
    expect(firstError({ ...valid, ...overrides })).toBe(message)
  })
})

describe('loginSchema', () => {
  it('exige correo y contraseña, sin revelar reglas de la contraseña', () => {
    const result = loginSchema.safeParse({ email: 'ana@example.com', password: '' })

    expect(result.error?.issues[0]?.message).toBe('Escribe tu contraseña')
  })
})
