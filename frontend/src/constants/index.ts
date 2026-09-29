/** Única lectura de import.meta.env de la app y constantes compartidas. Nada secreto: todo esto es público. */
export const STORAGE_PREFIX = 'snail-race'
export const THEME_STORAGE_KEY = `${STORAGE_PREFIX}:theme`

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
/** Timeout del cliente; el escenario de timeout de SnailPay tarda más a propósito (ADR 0005). */
export const HTTP_TIMEOUT_MS = Number(import.meta.env.VITE_HTTP_TIMEOUT_MS ?? 8000)
