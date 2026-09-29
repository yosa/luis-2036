# Persistencia en LocalStorage

> **Audiencia:** quien desarrolla o revisa la persistencia.
> **Propósito:** qué se guarda, con qué forma, por qué y cómo se protege contra datos corruptos.
> **Estado:** implementado (2026-09-28) en [`storage/slots.ts`](../../frontend/src/storage/slots.ts).

## Principios

- **Un solo punto de acceso** (`frontend/src/storage/`). Ningún componente ni store llama `localStorage` directo.
- **Leer es validar.** Cada clave tiene un esquema zod. Si lo leído no cumple el esquema, se usa el valor por defecto y se registra una advertencia, sin tumbar la app.
- **Versionado.** Las claves llevan la versión del esquema en el nombre (`v1`). Si cambia la forma de un dato, se sube la versión y se escribe una migración.
- **Montos en centavos (enteros)** para evitar errores de punto flotante. El API recibe y responde el monto en pesos con 2 decimales, y la conversión ocurre en un solo lugar.
- **Tolerancia a fallos.** Todo acceso va dentro de `try/catch` (modo privado, cuota llena). Si LocalStorage no está disponible, la app funciona en memoria y avisa que no se conservará la información.

## Claves

| Clave                   | Contenido                                                                                                                                                             | Se borra al cerrar sesión |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `snail-race:v1:users`   | Mapa `email → { id, fullName, email, password: { algorithm, iterations, salt, hash }, createdAt }`                                                                    | No                        |
| `snail-race:v1:session` | `{ userId, createdAt, expiresAt }`                                                                                                                                    | **Sí**                    |
| `snail-race:v1:wallets` | Mapa `userId → { balanceCents, appliedChargeIds: string[] }`                                                                                                          | No                        |
| `snail-race:v1:charges` | Mapa `userId → ChargeRecord[]`: la respuesta completa de SnailPay, incluidos `card_number` y `cvv`, más el monto pedido, el HTTP, la fecha y si acreditó (`credited`) | No                        |

Guardar el número de tarjeta y el CVV en `charges` es un requisito explícito del alcance (RF-24), y ahí terminan los datos ficticios de prueba. La interfaz los muestra **enmascarados** (`•••• 1234`) y nunca vuelve a mostrar el CVV. La justificación y la alternativa de producción están en el [ADR 0006](adr/0006-datos-de-tarjeta-en-respuesta-y-almacenamiento.md).

## Aplicar un cobro sin duplicar saldo

`wallet.applyCharge` es la **única** operación que aumenta el saldo. Suma solo si la respuesta cumple la regla contra falsos éxitos ([visión general](vision-general.md#flujo-principal-recarga-de-saldo)) y si el `id` del cobro no está en `appliedChargeIds`. Así, un doble clic, un reintento o una respuesta repetida no acreditan el saldo dos veces.

## Qué pasa si alguien edita LocalStorage

Si la edición es válida según el esquema, se acepta: el navegador es del usuario. Si la edición rompe el esquema, se descarta esa clave y se vuelve al valor por defecto. En ningún caso la app se cae. Es la limitación que se declara en la [visión general](vision-general.md#límites-conocidos-del-diseño).
