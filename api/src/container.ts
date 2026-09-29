import { randomInt, randomUUID } from 'node:crypto'
import { setTimeout as sleep } from 'node:timers/promises'
import type { AppDeps } from './app'
import type { Env } from './config/env'
import { createLogger } from './http/logger'
import { createChargeService } from './modules/snailpay/createCharge/service'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCode(length: number): string {
  return Array.from({ length }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')
}

/** Cableado de producción: único lugar donde se eligen las implementaciones reales. */
export function buildDeps(env: Env): AppDeps {
  const isOutage = () => env.SNAILPAY_OUTAGE
  return {
    env,
    logger: createLogger(env),
    isOutage,
    createCharge: createChargeService({
      clock: () => new Date(),
      ids: { uuid: randomUUID, code: randomCode },
      isOutage,
      sleep: (ms) => sleep(ms),
      processingDelayMs: env.SNAILPAY_PROCESSING_DELAY_MS,
    }),
  }
}
