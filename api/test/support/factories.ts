import { Writable } from 'node:stream'
import pino from 'pino'
import { vi } from 'vitest'
import type { ChargeRequest } from '@snail-race/shared'
import { createApp } from '../../src/app'
import { loadEnv, type Env } from '../../src/config/env'
import {
  createChargeService,
  type CreateChargeDeps,
} from '../../src/modules/snailpay/createCharge/service'

export const FIXED_NOW = new Date('2026-09-28T19:54:03.120Z')

export function validPayload(overrides: Partial<ChargeRequest> = {}): ChargeRequest {
  return {
    card_number: '1234123412341234',
    expiration: '12/26',
    cvv: '543',
    holder_name: 'Ana Pérez',
    amount: 100,
    payer_id: '3f0c2a8e-1b4d-4c6e-8f9a-0b1c2d3e4f5a',
    payer_email: 'ana@example.com',
    ...overrides,
  }
}

/** Dependencias deterministas: reloj fijo, ids secuenciales y sin esperas reales. */
export function fakeChargeDeps(overrides: Partial<CreateChargeDeps> = {}): CreateChargeDeps {
  let sequence = 0
  return {
    clock: () => FIXED_NOW,
    ids: {
      uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`,
      code: (length) => 'A'.repeat(length),
    },
    isOutage: () => false,
    sleep: vi.fn(() => Promise.resolve()),
    processingDelayMs: 12_000,
    ...overrides,
  }
}

/** App completa con dependencias falsas y un logger que se puede inspeccionar. */
export function buildTestApp(
  options: { env?: Partial<Record<keyof Env, string>>; charge?: Partial<CreateChargeDeps> } = {},
) {
  const env = loadEnv({ APP_ENV: 'test', LOG_LEVEL: 'info', ...options.env })
  const logLines: string[] = []
  const logger = pino(
    {
      level: 'info',
      redact: {
        paths: ['card_number', 'cvv', 'holder_name', '*.card_number', '*.cvv', '*.holder_name'],
        censor: '[redactado]',
      },
    },
    new Writable({
      write(chunk: Buffer, _encoding, callback) {
        logLines.push(chunk.toString())
        callback()
      },
    }),
  )
  const isOutage = () => env.SNAILPAY_OUTAGE
  const app = createApp({
    env,
    logger,
    isOutage,
    createCharge: createChargeService(fakeChargeDeps({ isOutage, ...options.charge })),
  })
  return { app, logLines }
}
