import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '../../stores/session'
import { renderApp } from '../../test/renderApp'

beforeEach(() => {
  useSessionStore.setState({ user: null })
})

describe('registro, sesión y guards (mínimos de validez)', () => {
  it('registrar → dashboard → cerrar sesión → iniciar sesión → dashboard', async () => {
    const { user, router } = renderApp('/register')

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Caracol123')
    await user.type(screen.getByLabelText('Confirma tu contraseña'), 'Caracol123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('heading', { name: 'Bienvenido de vuelta' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Caracol123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
  })

  it('el dashboard sin sesión redirige al login, y tras entrar vuelve a donde iba', async () => {
    await useSessionStore
      .getState()
      .register({ fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' })
    useSessionStore.getState().logout()
    const { user, router } = renderApp('/dashboard')

    expect(await screen.findByRole('heading', { name: 'Bienvenido de vuelta' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Caracol123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await screen.findByRole('heading', { name: 'Hola, Ana' })
    expect(router.state.location.pathname).toBe('/dashboard')
  })

  it('con sesión activa, el login redirige al dashboard', async () => {
    await useSessionStore
      .getState()
      .register({ fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' })

    renderApp('/login')

    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
  })

  it('credenciales incorrectas muestran un error genérico y no dejan entrar', async () => {
    const { user, router } = renderApp('/login')

    await user.type(screen.getByLabelText('Correo electrónico'), 'nadie@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Caracol123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.')
    expect(router.state.location.pathname).toBe('/login')
  })

  it('un correo ya registrado se señala en su campo', async () => {
    await useSessionStore
      .getState()
      .register({ fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' })
    useSessionStore.getState().logout()
    const { user } = renderApp('/register')

    await user.type(screen.getByLabelText('Nombre completo'), 'Otra Ana')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ANA@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Caracol123')
    await user.type(screen.getByLabelText('Confirma tu contraseña'), 'Caracol123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByLabelText('Correo electrónico')).toHaveAccessibleDescription(
      'Ya existe una cuenta con ese correo. Inicia sesión.',
    )
  })
})
