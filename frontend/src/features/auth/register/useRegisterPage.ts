import { useNavigate } from 'react-router'
import type { z } from 'zod'
import { useZodForm } from '../../../hooks/useZodForm'
import { AuthError, useSessionStore } from '../../../stores/session'
import { registerSchema } from '../schemas'

export function useRegisterPage() {
  const register = useSessionStore((state) => state.register)
  const navigate = useNavigate()
  const form = useZodForm({
    schema: registerSchema,
    initialValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    idPrefix: 'register',
  })

  async function onSubmit(data: z.output<typeof registerSchema>) {
    try {
      await register(data)
      await navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof AuthError && error.code === 'auth.register.emailTaken') {
        form.setFieldError('email', 'Ya existe una cuenta con ese correo. Inicia sesión.')
        return
      }
      throw error
    }
  }

  return { form, onSubmit }
}
