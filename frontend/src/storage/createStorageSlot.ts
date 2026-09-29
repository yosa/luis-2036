import type { z } from 'zod'

/**
 * Único acceso a localStorage (estándar de React §Persistencia).
 * Leer = validar contra el esquema: un valor corrupto, de otra versión o
 * editado a mano vuelve al valor por defecto sin romper la app. Si el
 * navegador no permite localStorage (modo privado, cuota), se usa memoria.
 */
export type StorageSlot<T> = {
  key: string
  read(): T
  write(value: T): void
  remove(): void
}

const memoryFallback = new Map<string, string>()

export function createStorageSlot<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: () => T,
): StorageSlot<T> {
  return {
    key,
    read() {
      const raw = safeGet(key)
      if (raw === null) return fallback()
      try {
        const result = schema.safeParse(JSON.parse(raw))
        if (result.success) return result.data
      } catch {
        // JSON inválido: se trata igual que un esquema que no cumple.
      }
      console.warn(`storage.corrupted: ${key}; se usa el valor por defecto`)
      return fallback()
    },
    write(value) {
      const raw = JSON.stringify(value)
      try {
        localStorage.setItem(key, raw)
      } catch {
        memoryFallback.set(key, raw)
      }
    },
    remove() {
      memoryFallback.delete(key)
      try {
        localStorage.removeItem(key)
      } catch {
        // Sin localStorage no hay nada que borrar allí.
      }
    },
  }
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? memoryFallback.get(key) ?? null
  } catch {
    return memoryFallback.get(key) ?? null
  }
}
