# Glosario

> **Audiencia:** todos.
> **Propósito:** vocabulario común entre la documentación, el código y la interfaz. Los términos en inglés son los identificadores que aparecen en el código.

## Dominio

| Término      | Código     | Significado                                                                                                                                                             |
| ------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caracol      | `snail`    | Competidor de una carrera. Hay 6, con nombre fijo.                                                                                                                      |
| Carrera      | `race`     | Competencia entre los 6 caracoles con un solo ganador.                                                                                                                  |
| Día simulado | `raceDay`  | Las 6 carreras de un día, generadas de forma determinista (ADR 0007).                                                                                                   |
| Apuesta      | `bet`      | Pronóstico simulado del usuario sobre el ganador de una carrera. Se gana si coincide con el ganador. No hay una sección para apostar: las apuestas son datos simulados. |
| Saldo        | `balance`  | Dinero disponible del usuario. Se guarda en centavos y empieza en 0.                                                                                                    |
| Recarga      | `recharge` | Aumento del saldo mediante un cobro aprobado por SnailPay.                                                                                                              |

## SnailPay

| Término                | Código               | Significado                                                                                       |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| SnailPay               | `snailpay`           | Pasarela de pagos simulada que expone `api/`.                                                     |
| Cobro                  | `charge`             | Una solicitud de pago a SnailPay y su respuesta.                                                  |
| Estado                 | `status`             | Resultado general del cobro: `approved`, `rejected` o `error`.                                    |
| Detalle del estado     | `status_detail`      | Motivo concreto del resultado, por ejemplo `accredited` o `cc_rejected_bad_filled_security_code`. |
| Código de autorización | `authorization_code` | Código que emite SnailPay solo cuando aprueba el cobro. En los demás casos es `null`.             |
| Referencia             | `reference`          | Identificador legible del cobro, útil para soporte.                                               |
| Pagador                | `payer`              | El usuario que paga, identificado por `payer_id` y `payer_email`.                                 |
| Tarjeta de prueba      | —                    | Número ficticio que dispara un escenario concreto ([escenarios](../03-snailpay/escenarios.md)).   |
| Escenario              | —                    | Combinación de entrada que produce una respuesta determinada de SnailPay.                         |
| Caída simulada         | `outage`             | Modo en que SnailPay responde como si tuviera un problema interno (ADR 0005).                     |

## Técnicos

| Término  | Significado                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ADR      | _Architecture Decision Record_: registro de una decisión con su contexto, alternativas y consecuencias.                              |
| Envelope | Forma común de respuesta JSON de mis APIs (`success`, `errors`, `data`). SnailPay usa en cambio el contrato de proveedor (ADR 0004). |
| PBKDF2   | Función de derivación de claves que se usa para guardar la contraseña como hash con sal (ADR 0003).                                  |
| PAN      | _Primary Account Number_: el número de tarjeta.                                                                                      |
| Timeout  | Límite de espera del cliente. Al vencerse, la recarga queda como no confirmada y el saldo no cambia.                                 |
