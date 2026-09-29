/**
 * Error de dominio: código estable dot.case + contexto + status HTTP semántico.
 * El `code` es el contrato con el consumidor; nunca se escribe texto para el
 * usuario aquí.
 */
export class AppError extends Error {
  status = 500

  constructor(
    readonly code: string,
    readonly context: Record<string, unknown> = {},
  ) {
    super(code)
    this.name = 'AppError'
  }

  asNotFound(): this {
    return this.withStatus(404)
  }

  asUnprocessable(): this {
    return this.withStatus(422)
  }

  asServiceUnavailable(): this {
    return this.withStatus(503)
  }

  withStatus(status: number): this {
    this.status = status
    return this
  }
}
