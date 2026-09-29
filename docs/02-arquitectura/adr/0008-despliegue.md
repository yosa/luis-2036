# ADR 0008 — Despliegue: API en Lambda y frontend en S3/CloudFront

- **Estado**: Propuesto
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

El adicional 1 pide publicar la aplicación con una URL pública que se pueda revisar **sin credenciales adicionales**. La infraestructura disponible es mi cuenta de AWS, donde ya publico sitios estáticos (S3 + CloudFront) y APIs en Lambda.

## Decisión

1. **API**: Express empaquetado con **esbuild** y expuesto en **AWS Lambda con `serverless-http`**, detrás de API Gateway (HTTP API), con runtime `nodejs22.x`.
   - El `serverless.yml` vive en un repositorio privado del ecosistema y **se escribe a mano**, porque no hay plantilla para Node.
   - El timeout de la función es de **20 s**, mayor que la demora de 12 s del escenario de timeout.
2. **Frontend**: build de Vite (`dist/`) publicado como **sitio estático** en S3 + CloudFront, con un subdominio neutral (p. ej. `caracoles-staging.mangobinario.com`).
   - Se sube con `aws s3 sync`, igual que los sitios estáticos sin CI.
3. **Stage no productivo**, lo que da `noindex` por la distribución de CloudFront. **Sin Basic Auth**, para que se pueda revisar sin credenciales.
4. **CORS**: el API permite solo el origen del sitio publicado (y `localhost` en desarrollo).
5. **Deploy manual desde local** con un runbook en [despliegue](../../06-operacion/despliegue.md). No hay CI de deploy para esta entrega.

## Consecuencias

**Positivas**:

- Usa infraestructura que ya existe y se conoce.
- El costo es de $0 en reposo.
- La misma `createApp` corre en local y en Lambda.

**Negativas / costos**:

- El deploy es manual.
- El primer request de Lambda tiene arranque en frío.
- El subdominio queda bajo el dominio del proveedor, no bajo uno neutral.

## Alternativas evaluadas

| Opción                                               | Pros                                           | Contras                                                              | Veredicto  |
| ---------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- | ---------- |
| **Lambda + S3/CloudFront del ecosistema**            | Infraestructura conocida, costo cero en reposo | Deploy manual; `serverless.yml` a mano                               | ✅         |
| Render / Railway (API) + Vercel / Netlify (frontend) | Deploy desde GitHub en minutos                 | Dos plataformas nuevas fuera del ecosistema                          | Descartado |
| Servir el frontend desde Express en un solo servicio | Un solo deploy                                 | Mezcla responsabilidades y obliga a tener un servidor siempre activo | Descartado |

## Pendientes

- Crear el spec del sitio y el `serverless.yml` en un repositorio privado cuando exista el build.
- Confirmar el subdominio final.
