import pino from 'pino'
import type { Env } from '../config/env'

/**
 * Logger JSON. Los datos de tarjeta y del titular se redactan siempre: el
 * requisito de devolverlos en la respuesta no se extiende a los logs (ADR 0006).
 */
export function createLogger(env: Pick<Env, 'LOG_LEVEL'>) {
  return pino({
    level: env.LOG_LEVEL,
    redact: {
      paths: ['card_number', 'cvv', 'holder_name', '*.card_number', '*.cvv', '*.holder_name'],
      censor: '[redactado]',
    },
  })
}
