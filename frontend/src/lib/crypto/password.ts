import { PASSWORD_HASH_ITERATIONS } from '../../constants'

/**
 * Hash de contraseña con PBKDF2-HMAC-SHA256 vía Web Crypto (ADR 0003).
 * Se guardan algoritmo, iteraciones y sal junto al hash para poder subir el
 * costo en el futuro sin romper cuentas existentes.
 */
export type PasswordHash = {
  algorithm: 'PBKDF2-SHA256'
  iterations: number
  salt: string
  hash: string
}

const SALT_BYTES = 16
const HASH_BITS = 256

export async function hashPassword(
  password: string,
  options: { iterations?: number; salt?: Uint8Array<ArrayBuffer> } = {},
): Promise<PasswordHash> {
  const iterations = options.iterations ?? PASSWORD_HASH_ITERATIONS
  const salt = options.salt ?? crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derive(password, salt, iterations)
  return { algorithm: 'PBKDF2-SHA256', iterations, salt: toBase64(salt), hash: toBase64(hash) }
}

/** Recalcula con los parámetros guardados y compara en tiempo constante. */
export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const candidate = await derive(password, fromBase64(stored.salt), stored.iterations)
  return constantTimeEqual(candidate, fromBase64(stored.hash))
}

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    HASH_BITS,
  )
  return new Uint8Array(bits)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index++) diff |= (a[index] ?? 0) ^ (b[index] ?? 0)
  return diff === 0
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}
