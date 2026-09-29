# Ejecutar en local

> **Audiencia:** quien evalúa o desarrolla.
> **Propósito:** levantar el frontend y el API en local y reproducir los escenarios (E-02).
> **Estado:** ⏳ se completa con los comandos reales al terminar el scaffold. Hasta entonces, lo de abajo es el objetivo, no una instrucción verificada.

## Requisitos

- Node 22 (ver `engines` en `package.json`)
- npm 10 o superior (viene con Node)

## Pasos

```bash
git clone <url-del-repo> && cd luis-2036
npm install                      # instala api/ y frontend/
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env
npm run dev                      # API en http://localhost:3000 · frontend en http://localhost:5173
```

## Variables de entorno

| Paquete  | Variable               | Default                 | Para qué                                     |
| -------- | ---------------------- | ----------------------- | -------------------------------------------- |
| api      | `PORT`                 | `3000`                  | Puerto local                                 |
| api      | `CORS_ORIGINS`         | `http://localhost:5173` | Orígenes permitidos                          |
| api      | `SNAILPAY_OUTAGE`      | `false`                 | `true` simula la caída completa del servicio |
| frontend | `VITE_API_BASE_URL`    | `http://localhost:3000` | URL del API                                  |
| frontend | `VITE_HTTP_TIMEOUT_MS` | `8000`                  | Timeout del cliente para los cobros          |

## Reproducir los escenarios de SnailPay

Ver [escenarios](../03-snailpay/escenarios.md). Para la caída simulada: `SNAILPAY_OUTAGE=true npm run dev --workspace api`.
