/** El servidor no respondió dentro del timeout del cliente. No implica que la operación falló. */
export class HttpTimeoutError extends Error {
  constructor(readonly path: string) {
    super(`http.timeout: ${path}`)
    this.name = 'HttpTimeoutError'
  }
}

/** No hubo respuesta (sin red, CORS, servidor caído). */
export class HttpNetworkError extends Error {
  constructor(
    readonly path: string,
    options?: { cause?: unknown },
  ) {
    super(`http.network: ${path}`, options)
    this.name = 'HttpNetworkError'
  }
}

/** Hubo respuesta, pero no con la forma esperada por el contrato. */
export class HttpUnexpectedResponseError extends Error {
  constructor(
    readonly path: string,
    readonly status: number,
  ) {
    super(`http.unexpectedResponse: ${path} (${status})`)
    this.name = 'HttpUnexpectedResponseError'
  }
}
