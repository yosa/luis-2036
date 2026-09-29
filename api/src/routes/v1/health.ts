import { Router } from 'express'
import { respond } from '../../http/respond'

export function healthRoutes(deps: { isOutage: () => boolean }) {
  const router = Router()
  router.get('/health', (_req, res) => {
    respond.ok(res, { status: 'ok', snailpay_outage: deps.isOutage() })
  })
  return router
}
