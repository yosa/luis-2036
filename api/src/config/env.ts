import { z } from 'zod'

const envSchema = z.object({
  APP_ENV: z.enum(['local', 'test', 'develop', 'staging', 'production']).default('local'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  SNAILPAY_OUTAGE: z.stringbool().default(false),
  SNAILPAY_PROCESSING_DELAY_MS: z.coerce.number().int().nonnegative().default(12_000),
  CHARGES_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(20),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Lee y valida el entorno una sola vez. Si algo falta o viene mal, el proceso
 * no arranca y el mensaje nombra la variable (fail-fast).
 */
export function loadEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`Configuración inválida: ${detail}`)
  }
  return result.data
}
