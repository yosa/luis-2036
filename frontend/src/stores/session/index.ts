import { create } from 'zustand'
import { SESSION_TTL_MS } from '../../constants'
import { hashPassword, verifyPassword, type PasswordHash } from '../../lib/crypto/password'
import { sessionSlot, usersSlot, type StoredUser } from '../../storage/slots'

/** Lo que la UI puede ver del usuario: nunca el hash. */
export type PublicUser = Pick<StoredUser, 'id' | 'fullName' | 'email'>

export type AuthErrorCode = 'auth.register.emailTaken' | 'auth.login.invalidCredentials'

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
  }
}

type SessionState = {
  user: PublicUser | null
  register: (input: { fullName: string; email: string; password: string }) => Promise<void>
  login: (input: { email: string; password: string }) => Promise<void>
  logout: () => void
  /** Relee la sesión guardada (al cargar la app o si otra pestaña la cambió). */
  restore: () => void
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

/**
 * Hash de referencia para comparar cuando el correo no existe: así el login
 * tarda lo mismo con o sin cuenta y no revela qué correos están registrados.
 */
let decoyHash: Promise<PasswordHash> | null = null
const getDecoyHash = () => (decoyHash ??= hashPassword(crypto.randomUUID()))

function toPublicUser({ id, fullName, email }: StoredUser): PublicUser {
  return { id, fullName, email }
}

function startSession(userId: string, now = new Date()) {
  sessionSlot.write({
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  })
}

/** Usuario de la sesión guardada, o null si no hay, venció o apunta a un usuario inexistente. */
function readActiveUser(now = new Date()): PublicUser | null {
  const session = sessionSlot.read()
  if (!session) return null
  const user = Object.values(usersSlot.read()).find((candidate) => candidate.id === session.userId)
  if (!user || new Date(session.expiresAt).getTime() <= now.getTime()) {
    sessionSlot.remove()
    return null
  }
  return toPublicUser(user)
}

export const useSessionStore = create<SessionState>()((set) => ({
  // Se lee de forma síncrona al crear el store: un refresh en /dashboard no parpadea hacia /login.
  user: readActiveUser(),

  async register({ fullName, email, password }) {
    const normalizedEmail = normalizeEmail(email)
    if (usersSlot.read()[normalizedEmail]) throw new AuthError('auth.register.emailTaken')

    const user: StoredUser = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      createdAt: new Date().toISOString(),
    }
    // Se relee tras el await: otra pestaña pudo registrar usuarios mientras se calculaba el hash.
    usersSlot.write({ ...usersSlot.read(), [normalizedEmail]: user })
    startSession(user.id)
    set({ user: toPublicUser(user) })
  },

  async login({ email, password }) {
    const user = usersSlot.read()[normalizeEmail(email)]
    const isValid = await verifyPassword(password, user?.password ?? (await getDecoyHash()))
    if (!user || !isValid) throw new AuthError('auth.login.invalidCredentials')

    startSession(user.id)
    set({ user: toPublicUser(user) })
  },

  logout() {
    // Solo se borra la sesión: el usuario, su saldo y sus cobros se conservan (RF-04, RF-06).
    sessionSlot.remove()
    set({ user: null })
  },

  restore() {
    set({ user: readActiveUser() })
  },
}))

/** Si otra pestaña inicia o cierra sesión, esta se sincroniza. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === sessionSlot.key || event.key === null) useSessionStore.getState().restore()
  })
}
