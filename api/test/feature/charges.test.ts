import { chargeResponseSchema } from '@snail-race/shared'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { buildTestApp, validPayload } from '../support/factories'

const CHARGES = '/v1/snailpay/charges'

/** El cuerpo de supertest es `any`: se valida contra el contrato antes de leerlo. */
const chargeBody = (response: request.Response) => chargeResponseSchema.parse(response.body)
const envelopeBody = (response: request.Response) =>
  response.body as { success: boolean; errors: { code: string }[]; data: unknown }

describe('POST /v1/snailpay/charges', () => {
  it('201 con los campos obligatorios del contrato en un cobro aprobado', async () => {
    const { app } = buildTestApp()

    const response = await request(app).post(CHARGES).send(validPayload())

    expect(response.status).toBe(201)
    expect(chargeResponseSchema.parse(response.body)).toMatchObject({
      status: 'approved',
      payer_id: validPayload().payer_id,
      payer_email: 'ana@example.com',
    })
    for (const field of [
      'id',
      'status',
      'status_detail',
      'transaction_amount',
      'date_created',
      'authorization_code',
      'reference',
      'payer_id',
      'payer_email',
    ]) {
      expect(response.body).toHaveProperty(field)
    }
  })

  it('402 con status_detail en un rechazo del emisor', async () => {
    const { app } = buildTestApp()

    const response = await request(app)
      .post(CHARGES)
      .send(validPayload({ cvv: '000' }))

    expect(response.status).toBe(402)
    expect(chargeBody(response).status_detail).toBe('cc_rejected_bad_filled_security_code')
  })

  it('422 con field_errors cuando faltan datos', async () => {
    const { app } = buildTestApp()

    const response = await request(app).post(CHARGES).send({ amount: 100 })

    expect(response.status).toBe(422)
    expect(chargeBody(response).field_errors).toContainEqual({
      field: 'card_number',
      code: 'required',
    })
  })

  it('400 con forma de contrato cuando el JSON está malformado', async () => {
    const { app } = buildTestApp()

    const response = await request(app)
      .post(CHARGES)
      .set('Content-Type', 'application/json')
      .send('{"card_number": ')

    expect(response.status).toBe(400)
    expect(chargeResponseSchema.parse(response.body).status_detail).toBe('malformed_request')
  })

  it('con SNAILPAY_OUTAGE=true responde 503 + Retry-After y no aprueba la tarjeta de éxito', async () => {
    const { app } = buildTestApp({ env: { SNAILPAY_OUTAGE: 'true' } })

    const response = await request(app).post(CHARGES).send(validPayload())

    expect(response.status).toBe(503)
    expect(response.headers['retry-after']).toBe('30')
    expect(response.body).toMatchObject({ status: 'error', authorization_code: null })
  })

  it('429 con forma de contrato al exceder el límite por minuto', async () => {
    const { app } = buildTestApp({ env: { CHARGES_RATE_LIMIT_PER_MINUTE: '2' } })

    await request(app).post(CHARGES).send(validPayload())
    await request(app).post(CHARGES).send(validPayload())
    const response = await request(app).post(CHARGES).send(validPayload())

    expect(response.status).toBe(429)
    expect(chargeBody(response).status_detail).toBe('rate_limited')
  })

  it('nunca escribe el número de tarjeta, el CVV ni el titular en los logs', async () => {
    const { app, logLines } = buildTestApp()

    await request(app).post(CHARGES).send(validPayload())
    await request(app)
      .post(CHARGES)
      .send({ ...validPayload(), cvv: 'x' })

    const logs = logLines.join('\n')
    expect(logs).toContain('snailpay.charge.approved')
    expect(logs).not.toContain('1234123412341234')
    expect(logs).not.toContain('Ana Pérez')
  })
})

describe('rutas del API', () => {
  it('GET /v1/health reporta si la caída simulada está activa (envelope)', async () => {
    const { app } = buildTestApp({ env: { SNAILPAY_OUTAGE: 'true' } })

    const response = await request(app).get('/v1/health')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ success: true, data: { snailpay_outage: true } })
  })

  it('una ruta inexistente responde 404 con el envelope, no con HTML', async () => {
    const { app } = buildTestApp()

    const response = await request(app).get('/v1/nada')

    expect(response.status).toBe(404)
    expect(envelopeBody(response).errors[0]?.code).toBe('route.notFound')
  })

  it('solo permite CORS a los orígenes configurados', async () => {
    const { app } = buildTestApp({ env: { CORS_ORIGINS: 'http://localhost:5173' } })

    const allowed = await request(app).get('/v1/health').set('Origin', 'http://localhost:5173')
    const denied = await request(app).get('/v1/health').set('Origin', 'https://otro.example')

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(denied.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('agrega cabeceras de seguridad y oculta X-Powered-By', async () => {
    const { app } = buildTestApp()

    const response = await request(app).get('/v1/health')

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})
