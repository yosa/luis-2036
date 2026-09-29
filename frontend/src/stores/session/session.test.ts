import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sessionSlot, usersSlot } from '../../storage/slots'
import { AuthError, useSessionStore } from '.'

const ana = { fullName: '  Ana Pérez ', email: ' Ana@Example.com ', password: 'Caracol123' }

beforeEach(() => {
  useSessionStore.setState({ user: null })
})

afterEach(() => {
  vi.useRealTimers()
})

async function expectAuthError(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(AuthError)
  await expect(promise).rejects.toMatchObject({ code })
}

describe('session store', () => {
  it('registrar guarda el usuario con hash (nunca la contraseña) y abre sesión', async () => {
    await useSessionStore.getState().register(ana)

    const stored = usersSlot.read()['ana@example.com']
    expect(stored?.fullName).toBe('Ana Pérez')
    expect(stored?.password.algorithm).toBe('PBKDF2-SHA256')
    expect(JSON.stringify(localStorage)).not.toContain('Caracol123')
    expect(useSessionStore.getState().user).toEqual({
      id: stored?.id,
      fullName: 'Ana Pérez',
      email: 'ana@example.com',
    })
    expect(sessionSlot.read()?.userId).toBe(stored?.id)
  })

  it('no permite registrar dos veces el mismo correo, aunque cambien mayúsculas o espacios', async () => {
    await useSessionStore.getState().register(ana)

    await expectAuthError(
      useSessionStore.getState().register({ ...ana, email: 'ANA@example.com' }),
      'auth.register.emailTaken',
    )
  })

  it('cerrar sesión borra la sesión pero conserva al usuario', async () => {
    await useSessionStore.getState().register(ana)

    useSessionStore.getState().logout()

    expect(useSessionStore.getState().user).toBeNull()
    expect(sessionSlot.read()).toBeNull()
    expect(usersSlot.read()['ana@example.com']).toBeDefined()
  })

  it('se puede volver a iniciar sesión con correo y contraseña', async () => {
    await useSessionStore.getState().register(ana)
    useSessionStore.getState().logout()

    await useSessionStore.getState().login({ email: 'ana@example.com', password: 'Caracol123' })

    expect(useSessionStore.getState().user?.email).toBe('ana@example.com')
  })

  it('contraseña incorrecta y correo inexistente dan el mismo error (no se enumeran cuentas)', async () => {
    await useSessionStore.getState().register(ana)
    useSessionStore.getState().logout()

    await expectAuthError(
      useSessionStore.getState().login({ email: 'ana@example.com', password: 'otra12345' }),
      'auth.login.invalidCredentials',
    )
    await expectAuthError(
      useSessionStore.getState().login({ email: 'nadie@example.com', password: 'Caracol123' }),
      'auth.login.invalidCredentials',
    )
    expect(useSessionStore.getState().user).toBeNull()
  })

  it('una sesión vencida se descarta al restaurar', async () => {
    await useSessionStore.getState().register(ana)
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(Date.now() + 8 * 60 * 60 * 1000 + 1)

    useSessionStore.getState().restore()

    expect(useSessionStore.getState().user).toBeNull()
    expect(sessionSlot.read()).toBeNull()
  })

  it('se sincroniza cuando otra pestaña cierra la sesión', async () => {
    await useSessionStore.getState().register(ana)

    sessionSlot.remove()
    window.dispatchEvent(new StorageEvent('storage', { key: sessionSlot.key }))

    expect(useSessionStore.getState().user).toBeNull()
  })
})
