# Escenarios reproducibles de SnailPay

> **Audiencia:** quien evalúa o prueba la integración.
> **Propósito:** los datos exactos que producen cada respuesta de SnailPay, para reproducirla desde la interfaz o con `curl`.
> **Estado:** definidos, pendientes de implementar. Al terminar, cada fila enlaza la prueba automatizada que la cubre.

**Todos los números de tarjeta son ficticios.** Ninguno corresponde a una tarjeta real. SnailPay no valida el dígito de Luhn: la tarjeta de éxito del alcance (`1234123412341234`) no lo cumple y aun así debe aprobarse.

## Datos base

Salvo que la fila diga otra cosa: nombre `Ana Pérez`, monto `100`, y `payer_id`/`payer_email` del usuario con sesión.

## Tabla de escenarios

Se evalúan **en este orden**. Gana el primero que coincide.

| # | Escenario | Tarjeta | Vencimiento | CVV | Otros | HTTP | `status` / `status_detail` | Saldo |
|---|---|---|---|---|---|---|---|---|
| 1 | Caída simulada (por configuración) | cualquiera | cualquiera | cualquiera | API con `SNAILPAY_OUTAGE=true` | 503 | `error` / `service_unavailable` | igual |
| 2 | Datos con formato inválido | p. ej. `1234` | p. ej. `13/26` | p. ej. `5` | o monto `0`, o nombre vacío | 422 | `rejected` / `invalid_request` + `field_errors` | igual |
| 3 | Error del sistema (por tarjeta) | `4000000000000503` | futuro | cualquiera | — | 503 | `error` / `service_unavailable` | igual |
| 4 | Falla interna | `4000000000000500` | futuro | cualquiera | — | 503 | `error` / `internal_error` | igual |
| 5 | Timeout | `4000000000000408` | futuro | cualquiera | SnailPay tarda 12 s; el frontend corta a los 8 s | — (cliente) · 504 si se espera | `error` / `processing_timeout` | igual |
| 6 | **Cobro exitoso** | `1234123412341234` | `12/26` | `543` | cualquier nombre y monto válidos | 201 | `approved` / `accredited` | **+ monto** |
| 7 | Tarjeta vencida | cualquiera | pasado, p. ej. `01/24` | cualquiera | — | 402 | `rejected` / `cc_rejected_expired` | igual |
| 8 | Fondos insuficientes | `4000000000000402` | futuro | cualquiera | — | 402 | `rejected` / `cc_rejected_insufficient_funds` | igual |
| 9 | Tarjeta bloqueada | `4000000000000403` | futuro | cualquiera | — | 402 | `rejected` / `cc_rejected_card_blocked` | igual |
| 10 | CVV incorrecto | `1234123412341234` | `12/26` | distinto de `543` | — | 402 | `rejected` / `cc_rejected_bad_filled_security_code` | igual |
| 11 | Vencimiento incorrecto | `1234123412341234` | futuro distinto de `12/26` | `543` | — | 402 | `rejected` / `cc_rejected_bad_filled_date` | igual |
| 12 | Tarjeta desconocida | cualquier otro número de 16 dígitos | futuro | cualquiera | — | 402 | `rejected` / `cc_rejected_unknown_card` | igual |
| 13 | JSON malformado | — | — | — | cuerpo que no es JSON | 400 | `rejected` / `malformed_request` | igual |
| 14 | Rate limit | cualquiera | cualquiera | cualquiera | más de 20 solicitudes por minuto desde la misma IP | 429 | `error` / `rate_limited` | igual |

Notas de diseño (detalle en el [ADR 0005](../02-arquitectura/adr/0005-simulacion-de-fallos.md)):
- **Las tarjetas "mágicas" terminan en un número que recuerda el HTTP o el caso:** `…0402` fondos, `…0403` bloqueada, `…0408` timeout, `…0500` falla interna, `…0503` no disponible.
- **La combinación de éxito se aprueba siempre, sin importar la fecha actual**, para que el escenario siga siendo reproducible después de diciembre de 2026, cuando `12/26` ya sería una fecha pasada. Por eso se evalúa antes que el vencimiento.
- **El error del sistema tiene dos vías:** la variable de entorno, que apaga todo el servicio y sirve para probar en local, y la tarjeta `…0503`, que sirve en la versión desplegada, donde quien evalúa no puede cambiar la configuración.

## Mensaje que ve el usuario

| `status_detail` | Mensaje en la interfaz |
|---|---|
| `accredited` | "Recarga aprobada por $X. Código de autorización: ABC123." |
| `invalid_request` | El error se muestra junto a cada campo (según `field_errors`). |
| `cc_rejected_insufficient_funds` | "La tarjeta no tiene fondos suficientes." |
| `cc_rejected_card_blocked` | "El banco bloqueó esta tarjeta. Usa otra." |
| `cc_rejected_expired` | "La tarjeta está vencida." |
| `cc_rejected_bad_filled_security_code` | "El CVV no es correcto." |
| `cc_rejected_bad_filled_date` | "La fecha de vencimiento no es correcta." |
| `cc_rejected_unknown_card` | "No reconocemos esta tarjeta. Revisa el número." |
| `service_unavailable`, `internal_error` | "SnailPay no está disponible en este momento. No se hizo ningún cargo; intenta más tarde." |
| `processing_timeout` y timeout del cliente | "No pudimos confirmar la recarga a tiempo. No se aplicó ningún saldo." |
| `rate_limited` | "Demasiados intentos. Espera un momento y vuelve a intentar." |
| `malformed_request` o respuesta que no se puede interpretar | "Ocurrió un error inesperado. No se aplicó ningún saldo." |

## Reproducir con `curl`

```bash
# Escenario 6: cobro exitoso
curl -s -X POST http://localhost:3000/v1/snailpay/charges \
  -H 'Content-Type: application/json' \
  -d '{"card_number":"1234123412341234","expiration":"12/26","cvv":"543","holder_name":"Ana Pérez","amount":100,"payer_id":"3f0c2a8e-1b4d-4c6e-8f9a-0b1c2d3e4f5a","payer_email":"ana@example.com"}'

# Escenario 1: caída simulada (levantar el API con la variable)
SNAILPAY_OUTAGE=true npm run dev --workspace api
```

> ⏳ Cuando exista el API, se agregará una colección de Postman en `api/postman/` que cubra las 14 filas, siguiendo el estándar de colecciones del ecosistema.
