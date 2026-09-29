import express, { Router, type ErrorRequestHandler } from 'express'
import { rateLimit } from 'express-rate-limit'
import type { Logger } from 'pino'
import { createChargeHandler } from '../../modules/snailpay/createCharge/handler'
import type { CreateChargeService } from '../../modules/snailpay/createCharge/service'

type SnailpayRoutesDeps = {
  createCharge: CreateChargeService
  logger: Logger
  chargesPerMinute: number
}

/**
 * Rutas de SnailPay. Tienen su propio parser y su propio manejo de errores
 * porque TODA respuesta de cobro usa el contrato del proveedor (ADR 0004),
 * incluidos el JSON malformado, el rate limit y un 500 inesperado.
 */
export function snailpayRoutes({ createCharge, logger, chargesPerMinute }: SnailpayRoutesDeps) {
  const router = Router()

  const chargesLimiter = rateLimit({
    windowMs: 60_000,
    limit: chargesPerMinute,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.setHeader('Retry-After', '60')
      res.status(429).json(createCharge.failure('rate_limited'))
    },
  })

  const contractErrors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (isBodyParserError(error)) {
      res.status(400).json(createCharge.failure('malformed_request'))
      return
    }
    logger.error(
      { channel: 'alerts', err: error, request_id: res.locals.requestId },
      'snailpay.charge.unhandled',
    )
    res.status(500).json(createCharge.failure('internal_error'))
  }

  router.post(
    '/snailpay/charges',
    chargesLimiter,
    express.json({ limit: '10kb' }),
    createChargeHandler(createCharge, logger),
    contractErrors,
  )

  return router
}

/** Errores de body-parser: JSON inválido o cuerpo demasiado grande. */
function isBodyParserError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('type' in error)) return false
  return error.type === 'entity.parse.failed' || error.type === 'entity.too.large'
}
