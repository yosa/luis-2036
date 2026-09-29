# Changelog de la documentación

Registro de cambios de la documentación y de las decisiones, en orden de fecha descendente. Los cambios de código quedan en el historial de git.

## 2026-09-28 (noche) — colección Postman de SnailPay

- 📮 Colección y environments en `api/postman/` según el estándar del ecosistema, adaptado a una pasarela simulada (sin auth, sin tenant, sin sintético).
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
