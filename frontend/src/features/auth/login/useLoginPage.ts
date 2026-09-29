import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { z } from 'zod'
import { useZodForm } from '../../../hooks/useZodForm'
import { AuthError, useSessionStore } from '../../../stores/session'
import { loginSchema } from '../schemas'

/** Ruta a la que se intentó entrar sin sesión (la deja ProtectedRoute en el state). */
function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const from = (state as { from?: { pathname?: unknown } }).from?.pathname
    if (typeof from === 'string' && from.startsWith('/')) return from
  }
  return '/dashboard'
}

export function useLoginPage() {
  const login = useSessionStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [credentialsError, setCredentialsError] = useState(false)
  const form = useZodForm({
    schema: loginSchema,
    initialValues: { email: '', password: '' },
    idPrefix: 'login',
  })

  async function onSubmit(data: z.output<typeof loginSchema>) {
    setCredentialsError(false)
    try {
      await login(data)
      await navigate(redirectTarget(location.state), { replace: true })
    } catch (error) {
      if (error instanceof AuthError && error.code === 'auth.login.invalidCredentials') {
        setCredentialsError(true)
        return
      }
      throw error
    }
  }

  return { form, onSubmit, credentialsError, dismissError: () => setCredentialsError(false) }
}
