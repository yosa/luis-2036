import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import type { Logger } from 'pino'
import type { Env } from './config/env'
import { accessLog } from './http/accessLog'
import { errorHandler, notFound } from './http/errorHandler'
import { requestId } from './http/requestId'
import type { CreateChargeService } from './modules/snailpay/createCharge/service'
import { routes } from './routes'

export type AppDeps = {
  env: Env
  logger: Logger
  createCharge: CreateChargeService
  isOutage: () => boolean
}

/**
 * Arma la aplicación sin escuchar un puerto: la usan server.ts (local),
 * lambda.ts (AWS) y las pruebas (supertest).
 */
export function createApp(deps: AppDeps) {
  const app = express()

  // Detrás de API Gateway/CloudFront hay un proxy: el rate limit debe ver la IP real.
  app.set('trust proxy', deps.env.APP_ENV === 'local' || deps.env.APP_ENV === 'test' ? false : 1)
  app.use(helmet())
  app.use(cors({ origin: deps.env.CORS_ORIGINS, methods: ['GET', 'POST'] }))
  app.use(requestId)
  app.use(accessLog(deps.logger))

  app.use(routes(deps))

  app.use(notFound)
  app.use(errorHandler(deps.logger))
  return app
}
