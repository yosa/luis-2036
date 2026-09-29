# Changelog de la documentación

Registro de cambios de la documentación y de las decisiones, en orden de fecha descendente. Los cambios de código quedan en el historial de git.

## 2026-09-28 (noche) — repositorio público

- 🌐 Código publicado en **https://github.com/yosa/luis-2036** como espejo del repositorio de trabajo; cada push actualiza los dos.
- 🧹 Antes de publicar, el historial se reescribió para quitar referencias a rutas, repositorios y herramientas internas (sin cambiar el árbol de `HEAD` ni la estructura de commits). Los términos vetados del hook se ampliaron con identificadores de infraestructura.
- **Reflejado en:** [estado](docs/01-alcance/estado.md) · [README](README.md)

## 2026-09-28 (noche) — aplicación desplegada

- 🚀 Adicional 1 terminado: **https://caracoles-staging.mangobinario.com** (S3 + CloudFront) con el API en AWS Lambda. Verificada de punta a punta.
- 🛠️ `scripts/deploy-staging.sh` reproduce el deploy completo con su verificación. ADR 0008 **aceptado**.
- 📮 El environment de Postman de staging apunta al API publicado.
- **Reflejado en:** [despliegue](docs/06-operacion/despliegue.md) · [ADR 0008](docs/02-arquitectura/adr/0008-despliegue.md) · [estado](docs/01-alcance/estado.md)

## 2026-09-28 (noche) — propuesta de base de datos

- 🗄️ Adicional 2 terminado: PostgreSQL serverless con Kysely, 8 tablas trazadas desde las claves actuales de LocalStorage, restricciones que protegen el saldo y acreditación en una transacción con `Idempotency-Key`.
- **Reflejado en:** [propuesta](docs/07-entrega/propuesta-base-de-datos.md) · [estado](docs/01-alcance/estado.md)

## 2026-09-28 (noche) — E2E con Cypress

- 🧪 6 pruebas E2E contra el build de producción: los cuatro mínimos de validez, persistencia al recargar, guard y recarga (aprobada, rechazada y timeout real). Selección por label y rol. El gate se verificó con un canario que falla.
- 🏛️ ADR 0002 **aceptado**: ya se usan todas sus librerías.
- **Reflejado en:** [estado](docs/01-alcance/estado.md) · [pruebas](docs/05-calidad-y-pruebas/estrategia-de-pruebas.md)

## 2026-09-28 (noche) — recarga con SnailPay

- 💳 Recarga de punta a punta: formulario validado con los patrones del contrato, llamada a SnailPay con los datos del usuario, saldo actualizado de inmediato (también en el header) e historial con la tarjeta enmascarada.
- 🛡️ Regla contra falsos éxitos aplicada en el monedero: cinco condiciones; un "aprobado" con otro monto o repetido no acredita.
- ⏱️ Cada resultado tiene su mensaje: aprobado, rechazo por `status_detail`, error del sistema, timeout, sin red y respuesta inesperada. Recorrido en Chrome contra el API real (aprobada, `…0503`, `…0408`).
- 🏛️ ADR 0006 **aceptado**. **Los 24 requisitos funcionales están terminados.**
- **Reflejado en:** [estado](docs/01-alcance/estado.md) · [ADR 0006](docs/02-arquitectura/adr/0006-datos-de-tarjeta-en-respuesta-y-almacenamiento.md) · [pruebas](docs/05-calidad-y-pruebas/estrategia-de-pruebas.md)

## 2026-09-28 (noche) — corrección del tooltip de la dona

- 🐛 El texto central de la dona ("75 % ganadas") se pintaba encima del tooltip y lo hacía parecer transparente. El tooltip ahora va en una capa superior, con un estilo compartido por las dos gráficas. Lo reportó la revisión del autor.

## 2026-09-28 (noche) — dashboard

- 📊 Dashboard con saldo (cifra principal), dona de apuestas y barras de victorias por caracol; datos simulados y deterministas por usuario y día.
- 🎨 Paleta de gráficas validada con script: "perdidas" pasa de gris a violeta (no cumplía el croma mínimo). Vista de tabla, tooltip y resumen en texto en cada gráfica.
- 🏛️ ADR 0007 **aceptado**. RF-06, RF-08, RF-11, RF-12 y RF-13 terminados.
- **Reflejado en:** [estado](docs/01-alcance/estado.md) · [ADR 0007](docs/02-arquitectura/adr/0007-datos-simulados-de-graficas.md) · [sistema visual](docs/04-diseno/sistema-visual.md)

## 2026-09-28 (noche) — registro, login y sesión

- 🔐 Registro y login locales con hash PBKDF2 (600 000 iteraciones); sesión de 8 h; guards; header con nombre y cerrar sesión. **Los cuatro mínimos de validez se cumplen.**
- 🏛️ ADR 0003 **aceptado**.
- 🧪 20 pruebas nuevas en el frontend, entre ellas el flujo completo con el router real; recorrido revisado en Chrome.
- 🤖 El banco de pruebas en Chrome (MCP) queda documentado en el uso de IA.
- **Reflejado en:** [estado](docs/01-alcance/estado.md) · [autenticación](docs/02-arquitectura/autenticacion-y-sesion.md) · [ADR 0003](docs/02-arquitectura/adr/0003-tratamiento-de-la-contrasena.md) · [uso de IA](docs/07-entrega/uso-de-ia.md)

## 2026-09-28 (noche) — colección Postman de SnailPay

- 📮 Colección y environments en `api/postman/` según mi estándar de colecciones Postman, adaptado a una pasarela simulada (sin auth, sin tenant, sin sintético).
- ✅ Smoke con Newman: 13 requests y 98 aserciones en verde contra el API real. E-04 pasa a terminado.
- **Reflejado en:** [escenarios](docs/03-snailpay/escenarios.md) · [estado](docs/01-alcance/estado.md) · [pruebas](docs/05-calidad-y-pruebas/estrategia-de-pruebas.md) · [ADR 0005](docs/02-arquitectura/adr/0005-simulacion-de-fallos.md)

## 2026-09-28 (noche) — puesta al día tras las primeras ramas de código

- 💳 **SnailPay implementado**: 14 escenarios, contrato en `shared/` y 40 pruebas. ADR 0004 y 0005 **aceptados**.
- 🗂️ ADR 0001 **aceptado**: workspaces `shared`, `api` y `frontend`.
- 📦 ADR 0002 actualizado con las versiones fijadas: TypeScript 6 y ESLint 9 por compatibilidad; React Router 8 y Vite 8.
- 🎨 Frontend: tokens AA en dos modos, tema persistente, cliente HTTP con timeout, storage tipado, componentes base y catálogo `/dev/ui`. Sistema visual documentado.
- 📋 `estado.md` al día con evidencia enlazada; estrategia de pruebas con el inventario real; `ejecutar-local.md` verificado.
- **Reflejado en:** [estado](docs/01-alcance/estado.md) · [ADRs](docs/02-arquitectura/adr/README.md) · [pruebas](docs/05-calidad-y-pruebas/estrategia-de-pruebas.md) · [ejecutar local](docs/06-operacion/ejecutar-local.md)

## 2026-09-28

- 🗂️ Estructura inicial del repositorio: `api/`, `frontend/` y `docs/`, organizado en siete secciones numeradas.
- 📋 Requisitos reescritos con ID trazable (RF, RNF y entregables), y matriz de estado inicial en la que todo figura como pendiente.
- 🏛️ ADR 0001 a 0008 en estado **Propuesto**: organización, librerías, contraseña, contrato de SnailPay, fallos simulados, datos de tarjeta, datos de gráficas y despliegue.
- 💳 Contrato de SnailPay y tabla de escenarios reproducibles, en borrador hasta implementar.
- 🔒 Hook `pre-commit` que impide versionar términos vetados.
- **Reflejado en:** [README](README.md) · [estado](docs/01-alcance/estado.md) · [ADRs](docs/02-arquitectura/adr/README.md)
