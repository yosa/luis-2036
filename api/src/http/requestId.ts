import { randomUUID } from 'node:crypto'
import type { RequestHandler } from 'express'

const REQUEST_ID_PATTERN = /^[\w-]{1,64}$/

/** Propaga o genera un X-Request-Id para correlacionar logs y respuestas. */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.get('x-request-id')
  const id = incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID()
  res.locals.requestId = id
  res.setHeader('X-Request-Id', id)
  next()
}
