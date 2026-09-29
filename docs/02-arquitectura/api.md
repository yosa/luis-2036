# API

> **Audiencia:** quien desarrolla o revisa `api/`.
> **Propósito:** cómo se organiza el código del backend y por qué.
> **Estado:** diseño propuesto, pendiente de implementar.
> **Estándar que aplica:** `estándar de Express` del ecosistema. Este documento solo registra lo propio del proyecto.

## Stack

Node 22 · Express 5 · TypeScript strict · zod · pino · helmet · cors · express-rate-limit · Vitest + supertest · `tsx` (desarrollo) · esbuild + `serverless-http` (despliegue).

## Estructura prevista de `src/`

```
src/
  app.ts                          createApp(deps): middleware + rutas (sin listen)
  server.ts                       arranque local
  lambda.ts                       entrada para AWS Lambda
  config/env.ts                   entorno validado con zod (fail-fast)
  http/                           requestId, validate, errorHandler, notFound, respond
  shared/errors/AppError.ts
  routes/index.ts                 agregador → /v1
  routes/v1/snailpay.ts
  routes/v1/health.ts
  modules/
    snailpay/
      createCharge/
        request.ts                esquema zod del cobro
        handler.ts                single-action
        service.ts                resuelve el escenario y arma la respuesta
        scenarios.ts              tabla de escenarios (datos de entrada → resultado)
        errors.ts
        types.ts
```

## Endpoints

| Método | Ruta | Propósito |
|---|---|---|
| `POST` | `/v1/snailpay/charges` | Solicita un cobro. Contrato completo en [`contrato.md`](../03-snailpay/contrato.md). |
| `GET` | `/v1/health` | Salud del servicio. Reporta si la caída simulada está activa. |

## Decisiones propias del proyecto

- **SnailPay responde con el contrato del proveedor, no con el envelope del ecosistema**, porque lo que se simula es una pasarela externa. **Toda** respuesta de `POST /v1/snailpay/charges` usa ese formato, incluidos el JSON malformado, el rate limit y un 500 inesperado, para que el cliente tenga un solo parser. Las demás rutas (404, `/v1/health`) usan el envelope. Ver [ADR 0004](adr/0004-contrato-de-snailpay.md).
- **Sin estado en el servidor.** SnailPay no guarda cobros. Cada respuesta se calcula a partir de la entrada, del reloj y del generador de ids, ambos inyectados. Por eso las pruebas son deterministas y el despliegue en Lambda no necesita almacenamiento.
- **Tiempo e ids inyectados** (`clock`, `idGenerator`) en el service, para probar el vencimiento de la tarjeta y la forma de la respuesta sin depender de la fecha real.
- **El escenario de timeout** es una demora deliberada del servidor, mayor que el timeout del cliente ([ADR 0005](adr/0005-simulacion-de-fallos.md)). El timeout de la función Lambda debe ser mayor que esa demora.

## Seguridad

- `helmet`, CORS con allowlist (`CORS_ORIGINS`), `express.json({ limit: '10kb' })` y rate limit por IP en `/v1/snailpay/charges`.
- Los logs de pino redactan `card_number`, `cvv` y `holder_name`. El requisito de devolver el PAN y el CVV en la respuesta no se extiende a los logs.
- Un 500 nunca expone el stack ni mensajes internos.
