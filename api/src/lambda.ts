import serverless from 'serverless-http'
import { createApp } from './app'
import { loadEnv } from './config/env'
import { buildDeps } from './container'

export const handler = serverless(createApp(buildDeps(loadEnv(process.env))))
