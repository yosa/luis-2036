import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

// Iteraciones bajas SOLO en pruebas, para que corran rápido; el valor real
// (600 000) se verifica aparte.
const FAST = { iterations: 1_000 }

describe('hashPassword / verifyPassword', () => {
  it('no guarda la contraseña ni algo que la contenga', async () => {
    const stored = await hashPassword('Caracol123', FAST)

    expect(JSON.stringify(stored)).not.toContain('Caracol123')
    expect(stored).toMatchObject({ algorithm: 'PBKDF2-SHA256', iterations: 1_000 })
  })

  it('usa 600 000 iteraciones por defecto (OWASP)', async () => {
    const stored = await hashPassword('Caracol123')

    expect(stored.iterations).toBe(600_000)
  })

  it('misma contraseña y misma sal dan el mismo hash; otra sal, otro hash', async () => {
    const salt = new Uint8Array(16).fill(7)

    const first = await hashPassword('Caracol123', { ...FAST, salt })
    const second = await hashPassword('Caracol123', { ...FAST, salt })
    const randomSalt = await hashPassword('Caracol123', FAST)

    expect(first.hash).toBe(second.hash)
    expect(randomSalt.hash).not.toBe(first.hash)
  })

  it('verifica la contraseña correcta y rechaza la incorrecta', async () => {
    const stored = await hashPassword('Caracol123', FAST)

    await expect(verifyPassword('Caracol123', stored)).resolves.toBe(true)
    await expect(verifyPassword('caracol123', stored)).resolves.toBe(false)
  })

  it('verifica con las iteraciones guardadas, no con las actuales', async () => {
    const legacy = await hashPassword('Caracol123', { iterations: 500 })

    await expect(verifyPassword('Caracol123', legacy)).resolves.toBe(true)
  })
})
