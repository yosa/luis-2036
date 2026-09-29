# ADR 0001 — Organización del repositorio: monorepo con npm workspaces

- **Estado**: Aceptado (2026-09-28)
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

La entrega es **un solo repositorio git** con frontend, backend y documentación. Quien evalúe tiene que poder instalar, levantar y probar ambos paquetes con instrucciones cortas. El frontend y el API comparten un contrato (la solicitud y la respuesta de SnailPay), y conviene que ese contrato tenga una sola definición.

## Decisión

1. **Monorepo con npm workspaces**: `api/` y `frontend/` son paquetes, y la raíz orquesta con `npm install`, `npm run dev` y `npm test`.
2. **npm y no pnpm.** Viene con Node, así que quien evalúa no instala nada más. `package-lock.json` se versiona.
3. **Contrato compartido.** Los esquemas zod de SnailPay viven en un solo lugar y los importan los dos paquetes. La forma exacta (un tercer workspace `shared/` o una ruta compartida) se fija en el scaffold.
4. **La documentación vive en `docs/`**, en secciones numeradas, con el README raíz como índice. La arquitectura va en `docs/02-arquitectura/`, no en una carpeta de primer nivel, porque no hay código de infraestructura propio.

## Consecuencias

**Positivas**: una sola instalación, un comando para todo, y el contrato no puede divergir entre cliente y servidor.

**Negativas / costos**: los workspaces agregan algo de configuración (scripts en la raíz, `tsconfig` por paquete), y un cambio en el contrato compartido obliga a revisar los dos lados, que es justo lo que se busca.

## Alternativas evaluadas

| Opción                                     | Pros                                                | Contras                                   | Veredicto                    |
| ------------------------------------------ | --------------------------------------------------- | ----------------------------------------- | ---------------------------- |
| **npm workspaces**                         | Nativo, sin herramientas extra                      | Menos eficiente en disco que pnpm         | ✅                           |
| pnpm workspaces                            | Rápido y estricto; es el que uso en otros proyectos | Obliga a quien evalúa a instalarlo        | Descartado para esta entrega |
| Dos carpetas independientes sin workspaces | Simple                                              | Dos instalaciones y el contrato duplicado | Descartado                   |
| Turborepo / Nx                             | Caché de tareas                                     | Sobredimensionado para dos paquetes       | Descartado                   |

## Cómo quedó construido

- Workspaces `shared`, `api` y `frontend` en el [`package.json`](../../../package.json) raíz; `package-lock.json` versionado.
- El contrato vive en un tercer workspace, [`shared/`](../../../shared/src/snailpay/charge.ts) (`@snail-race/shared`), que exporta TypeScript directamente sin paso de build: `tsx`/esbuild en el API y Vite en el frontend lo compilan al consumirlo.
- Scripts raíz: `dev`, `test`, `type-check`, `lint`, `format` y `check` (todo junto).

## Pendientes

Ninguno.
