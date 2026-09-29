# Contrato del API de SnailPay

> **Audiencia:** quien integra con SnailPay (el frontend) y quien revisa las respuestas.
> **Propósito:** la forma exacta de la solicitud y de todas las respuestas de un cobro.
> **Estado:** contrato propuesto, pendiente de implementar. Se congela al aceptar el [ADR 0004](../02-arquitectura/adr/0004-contrato-de-snailpay.md).

## Endpoint

```
POST /v1/snailpay/charges
Content-Type: application/json
```

Local: `http://localhost:3000/v1/snailpay/charges`. Desplegado: ver [despliegue](../06-operacion/despliegue.md).

## Solicitud

| Campo         | Tipo   | Regla                                                                            | Ejemplo              |
| ------------- | ------ | -------------------------------------------------------------------------------- | -------------------- |
| `card_number` | string | Exactamente 16 dígitos, sin espacios. El frontend quita los espacios de captura. | `"1234123412341234"` |
| `expiration`  | string | `MM/YY`, con mes entre `01` y `12`                                               | `"12/26"`            |
| `cvv`         | string | 3 o 4 dígitos                                                                    | `"543"`              |
| `holder_name` | string | No vacío después de `trim`, máximo 80 caracteres                                 | `"Ana Pérez"`        |
| `amount`      | number | Mayor que 0, máximo 10 000.00, con 2 decimales como máximo (pesos)               | `250.5`              |
| `payer_id`    | string | UUID del usuario registrado                                                      | `"3f0c…"`            |
| `payer_email` | string | Correo del usuario registrado                                                    | `"ana@example.com"`  |

## Respuesta

**Toda** respuesta de este endpoint trae la misma forma, sin importar el resultado: aprobada, rechazada, con datos inválidos, error del sistema, JSON malformado, rate limit o error inesperado. Así el cliente tiene un solo parser y RF-22 se cumple sin excepciones.

| Campo                | Tipo           | Formato y valores                                                                                |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| `id`                 | string         | UUID v4 que genera SnailPay para cada operación, **incluidas las fallidas**                      |
| `status`             | string         | `approved` · `rejected` · `error`                                                                |
| `status_detail`      | string         | Motivo en `snake_case` (catálogo abajo)                                                          |
| `transaction_amount` | number \| null | El monto solicitado, tal cual llegó. `null` si no llegó o no es un número                        |
| `currency_id`        | string         | Siempre `"MXN"`                                                                                  |
| `date_created`       | string         | ISO 8601 en UTC con milisegundos: `2026-09-28T19:54:03.120Z`                                     |
| `authorization_code` | string \| null | 6 caracteres `[A-Z0-9]` **solo** si `status = approved`; en los demás casos `null`               |
| `reference`          | string         | `SNP-AAAAMMDD-XXXXXX` (fecha UTC + 6 caracteres `[A-Z0-9]`), p. ej. `SNP-20260928-7K2QF4`        |
| `payer_id`           | string \| null | Eco del solicitado (`null` si no llegó)                                                          |
| `payer_email`        | string \| null | Eco del solicitado (`null` si no llegó)                                                          |
| `card_number`        | string \| null | Eco del solicitado. Lo exige el alcance (RF-24); siempre ficticio                                |
| `cvv`                | string \| null | Eco del solicitado. Lo exige el alcance (RF-24); siempre ficticio                                |
| `field_errors`       | array          | **Solo** con `status_detail = invalid_request`: `[{ "field": "cvv", "code": "invalid_format" }]` |

### Status HTTP

| HTTP | `status`   | Cuándo                                                                                                                          |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 201  | `approved` | Cobro aprobado                                                                                                                  |
| 402  | `rejected` | Rechazado por el emisor: fondos insuficientes, tarjeta vencida, datos que no coinciden, etc.                                    |
| 422  | `rejected` | Datos con formato inválido (`invalid_request`, con `field_errors`)                                                              |
| 400  | `rejected` | El cuerpo no es JSON válido (`malformed_request`)                                                                               |
| 429  | `error`    | Demasiadas solicitudes (`rate_limited`), con encabezado `Retry-After`                                                           |
| 503  | `error`    | Error del sistema simulado (`service_unavailable`, `internal_error`), con `Retry-After`                                         |
| 504  | `error`    | El procesamiento excedió su tiempo (`processing_timeout`). Solo lo recibe un cliente que espera más que el timeout del frontend |
| 500  | `error`    | Error inesperado del servidor (`internal_error`). No debería ocurrir                                                            |

**El discriminador es `status`, y el HTTP lo confirma.** El cliente solo considera un cobro aprobado con HTTP 201, `status = approved` y `authorization_code` no nulo.

### Catálogo de `status_detail`

| `status`   | `status_detail`                        | Significado                                                |
| ---------- | -------------------------------------- | ---------------------------------------------------------- |
| `approved` | `accredited`                           | Cobro aprobado y acreditado                                |
| `rejected` | `invalid_request`                      | Uno o más campos con formato inválido (ver `field_errors`) |
| `rejected` | `malformed_request`                    | El cuerpo no es JSON válido                                |
| `rejected` | `cc_rejected_insufficient_funds`       | Fondos insuficientes                                       |
| `rejected` | `cc_rejected_card_blocked`             | Tarjeta bloqueada por el emisor                            |
| `rejected` | `cc_rejected_expired`                  | Tarjeta vencida                                            |
| `rejected` | `cc_rejected_bad_filled_security_code` | El CVV no corresponde a la tarjeta                         |
| `rejected` | `cc_rejected_bad_filled_date`          | La fecha de vencimiento no corresponde a la tarjeta        |
| `rejected` | `cc_rejected_unknown_card`             | Tarjeta no reconocida por la red simulada                  |
| `error`    | `service_unavailable`                  | SnailPay está en mantenimiento o caído                     |
| `error`    | `internal_error`                       | Falla interna de SnailPay al procesar                      |
| `error`    | `processing_timeout`                   | El procesamiento no terminó a tiempo                       |
| `error`    | `rate_limited`                         | Demasiadas solicitudes desde el mismo origen               |

Cómo producir cada uno: [escenarios](escenarios.md).

## Ejemplos

**Aprobado (201)**

```json
{
  "id": "b8a4c7e2-5f3d-4e1a-9c2b-7d6e5f4a3b21",
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 250.5,
  "currency_id": "MXN",
  "date_created": "2026-09-28T19:54:03.120Z",
  "authorization_code": "A7K2Q9",
  "reference": "SNP-20260928-7K2QF4",
  "payer_id": "3f0c2a8e-1b4d-4c6e-8f9a-0b1c2d3e4f5a",
  "payer_email": "ana@example.com",
  "card_number": "1234123412341234",
  "cvv": "543"
}
```

**Rechazado por CVV (402)**: la misma forma con `"status": "rejected"`, `"status_detail": "cc_rejected_bad_filled_security_code"` y `"authorization_code": null`.

**Datos inválidos (422)**: la misma forma con `"status_detail": "invalid_request"` y `"field_errors": [{ "field": "expiration", "code": "invalid_format" }]`.

**Error del sistema (503)**: la misma forma con `"status": "error"`, `"status_detail": "service_unavailable"`, `"authorization_code": null` y el encabezado `Retry-After: 30`.

> Estos ejemplos son de referencia mientras se implementa. Al terminar, se validan contra las pruebas del API y se enlaza la prueba que los fija.
