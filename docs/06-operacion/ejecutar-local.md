# Ejecutar en local

> **Audiencia:** quien evalúa o desarrolla.
> **Propósito:** levantar el frontend y el API en local y reproducir los escenarios (E-02).
> **Estado:** verificado el 2026-09-28 con `npm run dev` (API en `:3000` y frontend en `:5173`).

## Requisitos

- Node **22.22 o superior** (ver `engines` en `package.json` y `.nvmrc`).
- npm 10 o superior (viene con Node). No hace falta ninguna otra herramienta.

## Pasos

```bash
git clone <url-del-repo> && cd luis-2036
npm install        # instala shared/, api/ y frontend/ (npm workspaces)
npm run dev        # API en http://localhost:3000 · frontend en http://localhost:5173
```

No hace falta crear archivos `.env`: los dos paquetes tienen valores por defecto para local. Si quieres cambiarlos, copia `api/.env.example` a `api/.env` y `frontend/.env.example` a `frontend/.env`.

Comprobación rápida del API:

```bash
curl http://localhost:3000/v1/health
# {"success":true,"errors":[],"info":[],"data":{"status":"ok","snailpay_outage":false}}
```

## Variables de entorno

| Paquete  | Variable                        | Default                 | Para qué                                          |
| -------- | ------------------------------- | ----------------------- | ------------------------------------------------- |
| api      | `PORT`                          | `3000`                  | Puerto local                                      |
| api      | `CORS_ORIGINS`                  | `http://localhost:5173` | Orígenes permitidos, separados por coma           |
| api      | `SNAILPAY_OUTAGE`               | `false`                 | `true` simula la caída completa del servicio      |
| api      | `SNAILPAY_PROCESSING_DELAY_MS`  | `12000`                 | Demora del escenario de timeout (tarjeta `…0408`) |
| api      | `CHARGES_RATE_LIMIT_PER_MINUTE` | `20`                    | Cobros permitidos por minuto y por IP             |
| api      | `LOG_LEVEL`                     | `info`                  | Nivel de log de pino                              |
| frontend | `VITE_API_BASE_URL`             | `http://localhost:3000` | URL del API                                       |
| frontend | `VITE_HTTP_TIMEOUT_MS`          | `8000`                  | Timeout del cliente para los cobros               |

## Reproducir los escenarios de SnailPay

La tabla completa está en [escenarios](../03-snailpay/escenarios.md). Para la caída simulada, levanta el API con la variable:

```bash
SNAILPAY_OUTAGE=true npm run dev -w @snail-race/api
```

## Otros comandos

| Comando                                   | Qué hace                                         |
| ----------------------------------------- | ------------------------------------------------ |
| `npm test`                                | Pruebas del API y del frontend                   |
| `npm run check`                           | Type-check + lint + formato + pruebas            |
| `npm run build`                           | Build del API (esbuild) y del frontend (Vite)    |
| `npm run test:postman -w @snail-race/api` | Smoke de Postman (Newman) contra el API en :3000 |
| `http://localhost:5173/dev/ui`            | Catálogo de componentes (solo con `npm run dev`) |
