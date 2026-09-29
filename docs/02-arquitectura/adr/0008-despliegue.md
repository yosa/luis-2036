# ADR 0008 — Despliegue: API en Lambda y frontend en S3/CloudFront

- **Estado**: Aceptado (2026-09-28)
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

El adicional 1 pide publicar la aplicación con una URL pública que se pueda revisar **sin credenciales adicionales**. Tengo disponible una cuenta de AWS donde ya publico sitios estáticos (S3 + CloudFront, un subdominio por sitio) y APIs en Lambda. El código se publica en un repositorio público, así que los datos de la infraestructura no pueden quedar en él.

## Decisión

1. **API**: Express empaquetado con **esbuild** y expuesto en **AWS Lambda con `serverless-http`**, detrás de API Gateway (HTTP API), con runtime `nodejs22.x` y dominio propio.
   - El timeout de la función es de **20 s**, mayor que la demora de 12 s del escenario de timeout.
   - La configuración de Serverless se guarda **fuera de este repositorio**.
2. **Frontend**: build de Vite (`dist/`) publicado en **S3 + CloudFront** bajo un subdominio neutral, `caracoles-staging.mangobinario.com`.
3. **Stage no productivo**, con `noindex` en las cabeceras. **Sin autenticación de acceso**, para que se pueda revisar sin credenciales.
4. **CORS**: el API permite solo el origen del sitio publicado (y `localhost` en desarrollo).
5. **Deploy manual** con [`scripts/deploy-staging.sh`](../../../scripts/deploy-staging.sh). Recibe los datos de la infraestructura por variables de entorno y no hay CI de deploy para esta entrega.

## Consecuencias

**Positivas**:

- Usa infraestructura que ya conozco.
- El costo es de $0 en reposo.
- La misma `createApp` corre en local, en pruebas y en Lambda.
- El repositorio público no expone datos de la infraestructura.

**Negativas / costos**:

- El deploy es manual.
- El primer request de Lambda tiene arranque en frío.
- La configuración de Serverless vive aparte del código.

## Alternativas evaluadas

| Opción                                               | Pros                                                           | Contras                                                                     | Veredicto  |
| ---------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------- |
| **Lambda + S3/CloudFront en mi cuenta de AWS**       | Infraestructura conocida, costo cero en reposo, dominio propio | Deploy manual                                                               | ✅         |
| Render / Railway (API) + Vercel / Netlify (frontend) | Deploy desde el repositorio en minutos                         | Dos plataformas nuevas; el API con arranque en frío en los planes gratuitos | Descartado |
| Servir el frontend desde Express en un solo servicio | Un solo deploy                                                 | Mezcla responsabilidades y obliga a tener un servidor siempre activo        | Descartado |

## Cómo quedó construido

- **Sitio:** https://caracoles-staging.mangobinario.com. **API:** https://api-caracoles-staging-us-east-1.mangobinario.com.
- **Lambda:** Node 22 en arm64, 512 MB y timeout de 20 s. Bundle de esbuild de 1.8 MB. El deploy corre desde una carpeta temporal, así que no deja archivos de despliegue en el repositorio.
- **Función de CloudFront:** se agregó el subdominio y se registró la carpeta como SPA. Como la comparten otros sitios, antes de publicarla se comparó con la versión en producción y se probó con la ruta nueva y con un sitio existente.
- **Verificación por el recurso:**
  - `/`, `/dashboard` y `/recharge` responden 200 y llevan `x-robots-tag: noindex`;
  - el preflight de CORS solo acepta el sitio;
  - el escenario de timeout responde 504 a los 12.4 s sin que Lambda lo corte;
  - registro y recarga aprobada en Chrome contra la versión publicada.

## Pendientes

Ninguno para esta entrega. Un CI de despliegue queda como mejora.
