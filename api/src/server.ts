import { createApp } from './app'
import { loadEnv } from './config/env'
import { buildDeps } from './container'

const deps = buildDeps(loadEnv(process.env))

createApp(deps).listen(deps.env.PORT, () => {
  deps.logger.info(
    { channel: 'events', port: deps.env.PORT, snailpay_outage: deps.env.SNAILPAY_OUTAGE },
    'api.started',
  )
})
