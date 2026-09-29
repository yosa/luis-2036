import { API_BASE_URL, HTTP_TIMEOUT_MS } from '../../constants'
import { HttpNetworkError, HttpTimeoutError } from './errors'

export type HttpResponse = { status: number; body: unknown }

type HttpRequestOptions = {
  method?: 'GET' | 'POST'
  json?: unknown
  timeoutMs?: number
  signal?: AbortSignal
}

/**
 * Único punto de salida HTTP de la app. Siempre con timeout. Devuelve el status
 * y el cuerpo sin interpretar: cada service valida el cuerpo contra su contrato
 * (SnailPay responde con su propio formato también en 4xx/5xx, ADR 0004).
 */
export async function httpRequest(
  path: string,
  options: HttpRequestOptions = {},
): Promise<HttpResponse> {
  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? HTTP_TIMEOUT_MS)
  const signal = options.signal ? AbortSignal.any([timeoutSignal, options.signal]) : timeoutSignal

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: options.json === undefined ? {} : { 'Content-Type': 'application/json' },
      ...(options.json === undefined ? {} : { body: JSON.stringify(options.json) }),
      signal,
    })
  } catch (error) {
    if (timeoutSignal.aborted) throw new HttpTimeoutError(path)
    throw new HttpNetworkError(path, { cause: error })
  }

  return { status: response.status, body: await parseJson(response) }
}

/** Cuerpo vacío o que no es JSON → null (el contrato decidirá que es inválido). */
async function parseJson(response: Response): Promise<unknown> {
  try {
    const text = await response.text()
    return text ? (JSON.parse(text) as unknown) : null
  } catch {
    return null
  }
}
