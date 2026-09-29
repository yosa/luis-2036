import type { ErrorRequestHandler, RequestHandler } from 'express'
import type { Logger } from 'pino'
import { AppError } from '../shared/errors/AppError'
import { respond } from './respond'

export const notFound: RequestHandler = (req, res) => {
  respond.error(res, 404, { code: 'route.notFound', message: '', context: { path: req.path } })
}

/** Render centralizado para las rutas con envelope. Nunca expone el stack. */
export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, _req, res, _next) => {
    if (error instanceof AppError) {
      respond.error(res, error.status, { code: error.code, message: '', context: error.context })
      return
    }
    logger.error(
      { channel: 'alerts', err: error, request_id: res.locals.requestId },
      'unhandled.error',
    )
    respond.error(res, 500, { code: 'unhandled.error', message: '', context: {} })
  }
}
