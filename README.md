# Carreras de caracoles

Aplicación web de temática de apuestas en carreras de caracoles:

- **Registro e inicio de sesión locales**, con un **dashboard** que muestra saldo, gráfica de apuestas ganadas y perdidas, y gráfica de victorias por caracol.
- **Recarga de saldo** mediante **SnailPay**, una pasarela de pagos simulada construida en Express.

Frontend en **React + TypeScript**, backend en **Express + TypeScript**, persistencia del usuario, la sesión y el saldo en **LocalStorage**.

> **Estado (2026-09-28):** SnailPay (API) terminado y probado; registro, login y sesión terminados (mínimos de validez cumplidos). Dashboard con saldo y gráficas terminado. En curso: recarga con SnailPay.
> La matriz de lo terminado y lo pendiente vive en [`docs/01-alcance/estado.md`](docs/01-alcance/estado.md), y es la única fuente de verdad del avance.

## Inicio rápido

Requiere Node 22.22 o superior. Detalle y variables en [`docs/06-operacion/ejecutar-local.md`](docs/06-operacion/ejecutar-local.md).

```bash
npm install          # instala shared/, api/ y frontend/ (npm workspaces)
npm run dev          # levanta API (:3000) y frontend (:5173)
npm test             # pruebas de ambos paquetes
```

## Estructura del repositorio

```
shared/      contrato de SnailPay (esquemas zod) compartido por api y frontend
api/         Express + TypeScript — servicio SnailPay
frontend/    React + Vite + TypeScript — registro, sesión, dashboard y recarga
docs/        documentación del proyecto (índice abajo)
scripts/     utilidades del repo (verificación previa a commit)
```

## Documentación

| Sección                                               | Qué encontrarás                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`01-alcance/`](docs/01-alcance/)                     | [Requisitos](docs/01-alcance/requisitos.md) con ID trazable · [Estado](docs/01-alcance/estado.md) (terminado / pendiente, con evidencia) · [Glosario](docs/01-alcance/glosario.md)                                                                                                                                                                                   |
| [`02-arquitectura/`](docs/02-arquitectura/)           | [Visión general](docs/02-arquitectura/vision-general.md) · [Frontend](docs/02-arquitectura/frontend.md) · [API](docs/02-arquitectura/api.md) · [Autenticación y sesión](docs/02-arquitectura/autenticacion-y-sesion.md) · [Persistencia en LocalStorage](docs/02-arquitectura/persistencia-localstorage.md) · [Decisiones (ADR)](docs/02-arquitectura/adr/README.md) |
| [`03-snailpay/`](docs/03-snailpay/)                   | [Contrato del API](docs/03-snailpay/contrato.md) · [Escenarios reproducibles](docs/03-snailpay/escenarios.md)                                                                                                                                                                                                                                                        |
| [`04-diseno/`](docs/04-diseno/)                       | [Sistema visual](docs/04-diseno/sistema-visual.md): librerías, tokens y qué se generó o se construyó                                                                                                                                                                                                                                                                 |
| [`05-calidad-y-pruebas/`](docs/05-calidad-y-pruebas/) | [Estrategia de pruebas](docs/05-calidad-y-pruebas/estrategia-de-pruebas.md): qué se prueba, por qué y cómo correrlo                                                                                                                                                                                                                                                  |
| [`06-operacion/`](docs/06-operacion/)                 | [Ejecutar en local](docs/06-operacion/ejecutar-local.md) · [Despliegue](docs/06-operacion/despliegue.md)                                                                                                                                                                                                                                                             |
| [`07-entrega/`](docs/07-entrega/)                     | [Uso de IA](docs/07-entrega/uso-de-ia.md) · [Registro de tiempo](docs/07-entrega/registro-de-tiempo.md) · [Propuesta de base de datos](docs/07-entrega/propuesta-base-de-datos.md) · [Documento de respuesta](docs/07-entrega/documento-respuesta.md)                                                                                                                |

## Convenciones

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) en español (`feat`, `fix`, `refactor`, `test`, `docs`).
- **Código:** identificadores en inglés; comentarios, textos de interfaz y descripciones de pruebas en español.
- **Decisiones:** cada decisión relevante tiene un ADR en [`docs/02-arquitectura/adr/`](docs/02-arquitectura/adr/README.md). Un ADR aceptado no se edita: se reemplaza con uno nuevo.
- **Cambios de documentación:** se registran en [`CHANGELOG.md`](CHANGELOG.md).
