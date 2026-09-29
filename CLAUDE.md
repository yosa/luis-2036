# CLAUDE.md — Carreras de caracoles

Monorepo con documentación y código: `api/` (Express + TS, servicio SnailPay), `frontend/` (React + Vite + TS) y `docs/`.
Idioma de trabajo: español (documentación, commits, comentarios); identificadores en inglés.

## Regla de oro

| #   | Regla                                                                                                                                                                                                               | Por qué                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | **Nada versionado puede nombrar a la organización que encargó el proyecto ni describirlo como evaluación.** El hook `pre-commit` corre `scripts/check-referencias.sh` con la lista privada `.private/terminos.txt`. | Requisito de la entrega: el repo es público y no debe ser encontrable por esos términos. |
| 2   | **`docs/01-alcance/estado.md` dice la verdad del código.** Una funcionalidad solo se marca ✅ si hay evidencia (prueba o archivo) enlazada. Al terminar o romper algo, se actualiza en el mismo commit.             | Una discrepancia entre lo declarado como terminado y el código se penaliza.              |
| 3   | **Todo lo que se escribe hay que poder explicarlo.** Nada de código generado sin revisar: cada decisión no obvia tiene su ADR o su comentario.                                                                      | Se puede pedir defender o modificar cualquier parte.                                     |
| 4   | **El alcance es el de `requisitos.md`.** No se construye sección de apuestas ni motor de carreras; los datos de las gráficas son simulados.                                                                         | Lo pide el alcance; tiempo objetivo de 6 a 8 horas.                                      |
| 5   | **Los datos de tarjeta siempre son ficticios.** Los números de prueba están en `docs/03-snailpay/escenarios.md`.                                                                                                    | La pasarela es un mock; nunca debe tocar datos reales.                                   |

## Estándares (leer antes de escribir código)

Los estándares del ecosistema viven en `un repositorio privado`. **Se enlazan, no se copian aquí.** Para este repo aplican:

- `estándar de frontend`: núcleo agnóstico de frontend.
- `estándar de React`: React + Vite (Zustand, React Router, `fetch` con timeout, `storage/` tipado).
- `estándar de Express`: Express + TS (slicing, zod en el borde, `AppError`, Vitest + supertest).
- `estándar de respuesta JSON`: envelope. SnailPay lo sustituye por el contrato del proveedor simulado; ver ADR 0004.

Si una decisión de este repo se aparta de un estándar, se documenta en un ADR.

## Mapa del repo

```
api/                     Express + TS (SnailPay)
frontend/                React + Vite + TS
docs/01-alcance/         requisitos (RF/RNF), estado (fuente de verdad del avance), glosario
docs/02-arquitectura/    visión, frontend, api, auth, persistencia, adr/
docs/03-snailpay/        contrato del API + escenarios reproducibles
docs/04-diseno/          sistema visual y herramientas usadas
docs/05-calidad-y-pruebas/ estrategia de pruebas
docs/06-operacion/       ejecutar en local, despliegue
docs/07-entrega/         uso de IA, tiempo, propuesta de BD, fuente del documento de respuesta
scripts/                 check-referencias.sh
.private/                (ignorado) enunciado original, términos vetados, borradores
```

## Glosario breve

- **SnailPay:** pasarela de pagos simulada (mock) expuesta por `api/`.
- **Recarga:** cargar saldo al usuario mediante un cobro a SnailPay.
- **Escenario:** combinación de datos de entrada que produce una respuesta concreta de SnailPay.
- **Día simulado:** 6 carreras entre 6 caracoles, generadas de forma determinista para las gráficas.

El glosario completo está en `docs/01-alcance/glosario.md`.

## Commits

Conventional Commits en español. El título lleva el tipo de mayor peso (`feat` > `fix` > `refactor` > `test` > `docs`) y el resto va en el body. Antes de cada commit corren el hook de referencias, el type-check, el lint y las pruebas.

## Comandos

```bash
git config core.hooksPath .githooks   # una vez por clon: activa el hook de referencias
npm run dev                           # API :3000 + frontend :5173
npm run check                         # type-check + lint + formato + pruebas (antes de cada commit)
scripts/check-referencias.sh          # verificación manual de términos vetados
```

## Flujo de trabajo

Una rama por feature (`feat/…`, `docs/…`), con sus pruebas y **la actualización de `estado.md`, ADR, CHANGELOG y guías en la misma rama**. Antes del commit se muestra el diff y, si hay UI, se revisa en el navegador. Merge `--no-ff` a `main`.
