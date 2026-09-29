import type { RequestHandler } from 'express'
import type { Logger } from 'pino'
import { parseChargeRequest } from './request'
import type { CreateChargeService } from './service'

export function createChargeHandler(service: CreateChargeService, logger: Logger): RequestHandler {
  return async (req, res) => {
    const result = await service.run(parseChargeRequest(req.body))

    // Un error del sistema es algo que alguien debe mirar; un rechazo es negocio normal.
    const isAlert = result.body.status === 'error'
    logger[isAlert ? 'warn' : 'info'](
      {
        channel: isAlert ? 'alerts' : 'events',
        request_id: res.locals.requestId,
        charge_id: result.body.id,
        status_detail: result.body.status_detail,
      },
      `snailpay.charge.${result.body.status}`,
    )

    if (result.retryAfterSeconds) res.setHeader('Retry-After', String(result.retryAfterSeconds))
    res.status(result.httpStatus).json(result.body)
  }
}
