import { Router } from 'express'
import type { AppDeps } from '../app'
import { healthRoutes } from './v1/health'
import { snailpayRoutes } from './v1/snailpay'

/** Agregador delgado: solo monta cada módulo bajo /v1. */
export function routes(deps: AppDeps) {
  const router = Router()
  router.use(
    '/v1',
    healthRoutes({ isOutage: deps.isOutage }),
    snailpayRoutes({
      createCharge: deps.createCharge,
      logger: deps.logger,
      chargesPerMinute: deps.env.CHARGES_RATE_LIMIT_PER_MINUTE,
    }),
  )
  return router
}
