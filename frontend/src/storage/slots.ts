import { z } from 'zod'
import { STORAGE_PREFIX } from '../constants'
import { createStorageSlot } from './createStorageSlot'

/** Claves y esquemas persistidos (docs/02-arquitectura/persistencia-localstorage.md). */
const key = (name: string) => `${STORAGE_PREFIX}:v1:${name}`

export const passwordHashSchema = z.object({
  algorithm: z.literal('PBKDF2-SHA256'),
  iterations: z.number().int().positive(),
  salt: z.string().min(1),
  hash: z.string().min(1),
})

export const storedUserSchema = z.object({
  id: z.uuid(),
  fullName: z.string().min(1),
  email: z.email(),
  password: passwordHashSchema,
  createdAt: z.iso.datetime(),
})
export type StoredUser = z.infer<typeof storedUserSchema>

export const sessionSchema = z.object({
  userId: z.uuid(),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
})
export type Session = z.infer<typeof sessionSchema>

/** Usuarios por correo normalizado. */
export const usersSlot = createStorageSlot(
  key('users'),
  z.record(z.string(), storedUserSchema),
  () => ({}),
)

export const sessionSlot = createStorageSlot(key('session'), sessionSchema.nullable(), () => null)

export const walletSchema = z.object({
  balanceCents: z.number().int().nonnegative(),
  appliedChargeIds: z.array(z.string()),
})
export type Wallet = z.infer<typeof walletSchema>

/** Monedero por id de usuario. Un usuario sin monedero empieza en $0 (RF-08). */
export const walletsSlot = createStorageSlot(
  key('wallets'),
  z.record(z.string(), walletSchema),
  () => ({}),
)
