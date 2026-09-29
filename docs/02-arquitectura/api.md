# API

> **Audiencia:** quien desarrolla o revisa `api/`.
> **Propósito:** cómo se organiza el código del backend y por qué.
> **Estado:** implementado (2026-09-28). 40 pruebas; ver [estrategia de pruebas](../05-calidad-y-pruebas/estrategia-de-pruebas.md).
> **Estándar que aplica:** mi estándar de código para APIs Express + TypeScript. Este documento solo registra lo propio del proyecto.

## Stack

Node 22 · Express 5 · TypeScript strict · zod · pino · helmet · cors · express-rate-limit · Vitest + supertest · `tsx` (desarrollo) · esbuild + `serverless-http` (despliegue).

## Estructura de `src/`

```
src/
  app.ts                          createApp(deps): helmet, CORS, requestId, access log, rutas (sin listen)
  container.ts                    cableado de producción: reloj real, ids aleatorios, sleep real
  server.ts                       arranque local
  lambda.ts                       entrada para AWS Lambda (serverless-http)
  config/env.ts                   entorno validado con zod; si falta algo, no arranca
  http/                           requestId, accessLog, logger (pino con redact), respond (envelope), errorHandler
  shared/errors/AppError.ts       código dot.case + contexto + status semántico
  routes/index.ts                 agregador → /v1
  routes/v1/health.ts             GET /v1/health (envelope)
  routes/v1/snailpay.ts           POST /v1/snailpay/charges con parser, rate limit y errores propios del contrato
  modules/snailpay/createCharge/
    request.ts                    borde: valida con el contrato compartido y extrae el eco
    scenarios.ts                  tabla de escenarios (función pura)
    service.ts                    orden caída → inválido → escenario; arma toda respuesta
    handler.ts                    single-action: parsea, llama al service, loguea y responde
```

Pruebas en `test/unit/` (escenarios, service, parseo) y `test/feature/` (HTTP con supertest sobre `createApp` con dependencias falsas: reloj fijo, ids secuenciales, `sleep` inmediato).

## Endpoints

| Método | Ruta                   | Propósito                                                                            |
| ------ | ---------------------- | ------------------------------------------------------------------------------------ |
| `POST` | `/v1/snailpay/charges` | Solicita un cobro. Contrato completo en [`contrato.md`](../03-snailpay/contrato.md). |
| `GET`  | `/v1/health`           | Salud del servicio. Reporta si la caída simulada está activa.                        |

## Decisiones propias del proyecto

- **SnailPay responde con el contrato del proveedor, no con el envelope JSON común**, porque lo que se simula es una pasarela externa. **Toda** respuesta de `POST /v1/snailpay/charges` usa ese formato, incluidos el JSON malformado, el rate limit y un 500 inesperado, para que el cliente tenga un solo parser. Las demás rutas (404, `/v1/health`) usan el envelope. Ver [ADR 0004](adr/0004-contrato-de-snailpay.md).
- **Sin estado en el servidor.** SnailPay no guarda cobros. Cada respuesta se calcula a partir de la entrada, del reloj y del generador de ids, ambos inyectados. Por eso las pruebas son deterministas y el despliegue en Lambda no necesita almacenamiento.
- **Tiempo e ids inyectados** (`clock`, `idGenerator`) en el service, para probar el vencimiento de la tarjeta y la forma de la respuesta sin depender de la fecha real.
- **El escenario de timeout** es una demora deliberada del servidor, mayor que el timeout del cliente ([ADR 0005](adr/0005-simulacion-de-fallos.md)). El timeout de la función Lambda debe ser mayor que esa demora.

## Seguridad

- `helmet`, CORS con allowlist (`CORS_ORIGINS`), `express.json({ limit: '10kb' })` y rate limit por IP en `/v1/snailpay/charges`.
- Los logs de pino redactan `card_number`, `cvv` y `holder_name`. El requisito de devolver el PAN y el CVV en la respuesta no se extiende a los logs.
- Un 500 nunca expone el stack ni mensajes internos.
