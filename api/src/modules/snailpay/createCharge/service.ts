import type { ChargeResponse, FieldError, StatusDetail, ChargeStatus } from '@snail-race/shared'
import type { ChargeEcho, ParsedChargeRequest } from './request'
import { resolveScenario } from './scenarios'

export type ChargeResult = {
  httpStatus: number
  body: ChargeResponse
  /** Segundos para el encabezado Retry-After (solo errores del sistema). */
  retryAfterSeconds?: number
}

export type CreateChargeDeps = {
  clock: () => Date
  ids: { uuid: () => string; code: (length: number) => string }
  /** Caída simulada por configuración (SNAILPAY_OUTAGE). */
  isOutage: () => boolean
  sleep: (ms: number) => Promise<void>
  processingDelayMs: number
}

const SERVICE_RETRY_AFTER_SECONDS = 30

const EMPTY_ECHO: ChargeEcho = {
  transactionAmount: null,
  payerId: null,
  payerEmail: null,
  cardNumber: null,
  cvv: null,
}

/**
 * Caso de uso "crear cobro". Decide el resultado en este orden: caída por
 * configuración → datos inválidos → escenario de la tarjeta. Toda salida,
 * incluso un fallo, trae los campos del contrato (RF-22).
 */
export function createChargeService(deps: CreateChargeDeps) {
  function build(
    status: ChargeStatus,
    statusDetail: StatusDetail,
    echo: ChargeEcho,
    extra: { fieldErrors?: FieldError[] } = {},
  ): ChargeResponse {
    const now = deps.clock()
    return {
      id: deps.ids.uuid(),
      status,
      status_detail: statusDetail,
      transaction_amount: echo.transactionAmount,
      currency_id: 'MXN',
      date_created: now.toISOString(),
      authorization_code: status === 'approved' ? deps.ids.code(6) : null,
      reference: `SNP-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${deps.ids.code(6)}`,
      payer_id: echo.payerId,
      payer_email: echo.payerEmail,
      card_number: echo.cardNumber,
      cvv: echo.cvv,
      ...(extra.fieldErrors ? { field_errors: extra.fieldErrors } : {}),
    }
  }

  return {
    async run(parsed: ParsedChargeRequest): Promise<ChargeResult> {
      if (deps.isOutage()) {
        return {
          httpStatus: 503,
          body: build('error', 'service_unavailable', parsed.echo),
          retryAfterSeconds: SERVICE_RETRY_AFTER_SECONDS,
        }
      }

      if (parsed.kind === 'invalid') {
        return {
          httpStatus: 422,
          body: build('rejected', 'invalid_request', parsed.echo, {
            fieldErrors: parsed.fieldErrors,
          }),
        }
      }

      const scenario = resolveScenario(parsed.request, deps.clock())
      if (scenario.simulateProcessingDelay) await deps.sleep(deps.processingDelayMs)

      return {
        httpStatus: scenario.httpStatus,
        body: build(scenario.status, scenario.statusDetail, parsed.echo),
        ...(scenario.httpStatus === 503 ? { retryAfterSeconds: SERVICE_RETRY_AFTER_SECONDS } : {}),
      }
    },

    /** Respuesta con forma de contrato para fallos fuera del caso de uso (JSON malformado, rate limit, 500). */
    failure(statusDetail: 'malformed_request' | 'rate_limited' | 'internal_error'): ChargeResponse {
      const status: ChargeStatus = statusDetail === 'malformed_request' ? 'rejected' : 'error'
      return build(status, statusDetail, EMPTY_ECHO)
    },
  }
}

export type CreateChargeService = ReturnType<typeof createChargeService>
