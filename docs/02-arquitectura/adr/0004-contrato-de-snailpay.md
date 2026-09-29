# ADR 0004 — Contrato de SnailPay y regla contra falsos éxitos

- **Estado**: Aceptado (2026-09-28)
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

SnailPay simula una **pasarela de pagos externa**. El alcance fija los campos que debe traer toda respuesta (`id`, `status`, `status_detail`, `transaction_amount`, `date_created`, `authorization_code`, `reference`, `payer_id`, `payer_email`) y deja los formatos a criterio del proyecto, siempre que sean consistentes y estén documentados. Mi estándar de APIs define un envelope (`success`, `errors`, `data`) pensado para las APIs propias, no para imitar a un tercero. El riesgo más grave de la integración es un **falso cobro exitoso**: acreditar saldo cuando el cobro no se aprobó.

## Decisión

1. **SnailPay responde con su propio contrato de proveedor**, no con el envelope. Se parece al de las pasarelas reales (estado general más detalle en `snake_case`). **Toda** respuesta de `POST /v1/snailpay/charges` trae la misma forma, sin importar si es éxito, rechazo, dato inválido, error del sistema, JSON malformado o rate limit. Las demás rutas usan el envelope JSON común.
2. **Tres estados** (`approved`, `rejected`, `error`) y un catálogo cerrado de `status_detail`, con el HTTP alineado (201 / 402 / 422 / 400 / 429 / 503 / 504 / 500). Contrato completo: [`contrato.md`](../../03-snailpay/contrato.md).
3. **`id` y `reference` se generan en todas las respuestas**, también en las fallidas, para poder rastrear cualquier intento. `authorization_code` solo existe si el cobro se aprueba.
4. **Regla contra falsos éxitos en el cliente.** Se acredita saldo solo con HTTP 201, `status = approved`, `authorization_code` no nulo, `transaction_amount` igual al monto pedido y un `id` que no se haya aplicado antes. Cualquier otra combinación, incluida una respuesta que no pasa el esquema, **no acredita**.
5. **El contrato se define una sola vez** como esquema zod compartido: el API lo usa para construir la respuesta y el frontend para validarla.

## Consecuencias

**Positivas**:

- El cliente tiene un solo parser.
- RF-22 se cumple incluso en errores inesperados.
- La acreditación depende de cinco condiciones verificables y probadas, no de interpretar un mensaje.

**Negativas / costos**:

- El API tiene dos formatos de respuesta (el del proveedor en `/charges` y el envelope en el resto). Se documenta aquí y en [api.md](../api.md).

## Alternativas evaluadas

| Opción                                                                 | Pros                                               | Contras                                                                                           | Veredicto                     |
| ---------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Contrato de proveedor en todas las respuestas de cobro**             | Fiel a una pasarela real; un parser; RF-22 siempre | Se aparta del envelope                                                                            | ✅                            |
| Envelope con los campos dentro de `data`                               | Sigue el estándar                                  | Un rechazo tendría `success: false` y `data: null`, lo que pierde los campos que exige el alcance | Descartado                    |
| Siempre HTTP 200 y solo `status`                                       | Simple                                             | Oculta los errores a proxies, logs y monitoreo                                                    | Descartado                    |
| Rechazos como 200 con `status: rejected` (estilo de algunas pasarelas) | Común en la industria                              | Menos explícito para quien integra por primera vez                                                | Descartado a favor de 402/422 |

## Cómo quedó construido

- Contrato único en [`shared/src/snailpay/charge.ts`](../../../shared/src/snailpay/charge.ts): esquemas de solicitud y respuesta y catálogo cerrado de `status_detail`.
- El API arma **toda** respuesta de cobro con el mismo builder ([`service.ts`](../../../api/src/modules/snailpay/createCharge/service.ts)), incluidos los fallos fuera del caso de uso (JSON malformado, rate limit, 500) mediante `failure()`.
- Las rutas de SnailPay tienen su propio parser y manejo de errores ([`routes/v1/snailpay.ts`](../../../api/src/routes/v1/snailpay.ts)) para no caer en el envelope.
- Pruebas: [contrato en HTTP](../../../api/test/feature/charges.test.ts) y [service](../../../api/test/unit/createChargeService.test.ts).
- La regla contra falsos éxitos del cliente (punto 4) está en [`lib/wallet/creditRules.ts`](../../../frontend/src/lib/wallet/creditRules.ts). La aplica `recordCharge` del monedero, que es la única operación que aumenta el saldo. El frontend valida también el cuerpo contra el contrato: un 201 sin los campos obligatorios se trata como respuesta inesperada ([prueba](../../../frontend/src/services/snailpay/snailpay.test.ts)).

## Pendientes

- Encabezado `Idempotency-Key` con deduplicación en el servidor. Requiere estado, así que queda como evolución con base de datos.
