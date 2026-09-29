import type { RequestHandler } from 'express'
import type { Logger } from 'pino'

/** Una línea por petición, sin cuerpo (el cuerpo trae datos de tarjeta). */
export function accessLog(logger: Logger): RequestHandler {
  return (req, res, next) => {
    const startedAt = performance.now()
    res.on('finish', () => {
      logger.info(
        {
          channel: 'events',
          request_id: res.locals.requestId,
          method: req.method,
          path: req.originalUrl.split('?')[0],
          status: res.statusCode,
          duration_ms: Math.round(performance.now() - startedAt),
        },
        'http.request',
      )
    })
    next()
  }
}
