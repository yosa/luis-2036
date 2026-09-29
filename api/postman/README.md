# Colección Postman de SnailPay

Prueba manual (Postman) y automatizada (Newman) del API, conforme al estándar de colecciones Postman del ecosistema.

| Archivo                                              | Qué es                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `snailpay.postman_collection.json`                   | Colección: `⚡ Flujo rápido`, `SnailPay` (los 14 escenarios) y `Smoke` (lo que corre Newman) |
| `snailpay.local.postman_environment.template.json`   | Environment local (`http://localhost:3000`)                                                  |
| `snailpay.staging.postman_environment.template.json` | Environment de la versión desplegada (se llena al desplegar)                                 |

## Diferencias con el estándar, y por qué

SnailPay es una pasarela **simulada**: no autentica, no es multi-tenant y no guarda datos (ADR 0004). Por eso:

- **No hay bootstrap de login ni secretos.** Los environments no tienen variables `secret`, así que el template se usa tal cual y no hace falta una copia llena. Si se llena una, `*.postman_environment.json` está en el `.gitignore`.
- **No hay modo sintético**, porque no hay datos que marcar.
- **Las respuestas de cobro no usan el envelope**, sino el contrato de proveedor. Un test a nivel colección exige en **toda** respuesta de cobro:
  - los campos obligatorios;
  - un `status` válido;
  - `authorization_code` solo en los aprobados;
  - el formato de `reference` y de `date_created`.
- Las rutas propias (`/v1/health` y el 404) sí validan el envelope y el `code` en dot.case.

## Correr

Con Postman: importa la colección y el environment `local`, levanta el API (`npm run dev`) y corre `⚡ Flujo rápido` con el Runner.

Con Newman (queda un reporte JUnit en `postman/newman-report.xml`, ignorado por git):

```bash
npm run test:postman -w @snail-race/api          # Smoke contra un API ya levantado en :3000
npm run test:postman:local -w @snail-race/api    # levanta el API, corre el Smoke y lo apaga
```

## Qué queda fuera del Smoke

| Escenario                       | Por qué                                              | Cómo probarlo                                                                                      |
| ------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1 · Caída por `SNAILPAY_OUTAGE` | Depende de la configuración del servidor             | `SNAILPAY_OUTAGE=true npm run dev -w @snail-race/api` y correr la request 01 del folder `SnailPay` |
| 5 · Timeout (`…0408`)           | Tarda 12 s                                           | Request 05 del folder `SnailPay`, o bajar `SNAILPAY_PROCESSING_DELAY_MS`                           |
| 14 · Rate limit                 | Bloquearía el resto de las pruebas durante un minuto | Runner con más de 20 iteraciones; también lo cubre `api/test/feature/charges.test.ts`              |

> Ojo con el rate limit al correr varios folders seguidos: el API permite 20 cobros por minuto por IP. Si ves 429 inesperados, espera un minuto o levanta el API con `CHARGES_RATE_LIMIT_PER_MINUTE` más alto.
