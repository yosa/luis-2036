# Despliegue

> **Audiencia:** quien despliega o revisa la versión publicada.
> **Propósito:** cómo se publica la aplicación (adicional AD-01).
> **Estado:** publicado el 2026-09-28 y verificado de punta a punta (registro y recarga aprobada contra el API desplegado). Decisión en el [ADR 0008](../02-arquitectura/adr/0008-despliegue.md).

## URLs

| Pieza                   | Plataforma                                         | URL                                                      |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| **Aplicación**          | AWS S3 + CloudFront                                | **https://caracoles-staging.mangobinario.com**           |
| Catálogo de componentes | AWS S3 + CloudFront (misma aplicación)             | https://caracoles-staging.mangobinario.com/componentes   |
| API (SnailPay)          | AWS Lambda (Node 22, arm64) + API Gateway HTTP API | https://api-caracoles-staging-us-east-1.mangobinario.com |

Se revisa **sin credenciales**: basta con registrarse en la propia aplicación. Las tarjetas de prueba aparecen en la pantalla de recarga.

## Cómo se implementó

- **API:** el mismo `createApp` que corre en local se envuelve con `serverless-http` (`api/src/lambda.ts`) y se empaqueta con esbuild en un solo archivo, sin `node_modules`.
  - Se despliega con Serverless Framework: función, HTTP API, dominio propio con certificado y registro DNS.
  - El timeout de la función es de 20 s: mayor que la demora del escenario de timeout (12 s) y menor que el límite de API Gateway (29 s).
- **Sitio:** el build de Vite se hornea con `VITE_API_BASE_URL` apuntando al API y se sube a S3.
  - Los assets con hash llevan caché de un año; `index.html` va con `no-cache`.
  - Una función de CloudFront resuelve el subdominio a su carpeta. Como es una SPA, **toda ruta sirve `index.html`**, así que recargar `/dashboard` no da 403.
- **CORS:** el API solo acepta el origen del sitio publicado.
- **Indexación:** la distribución responde `x-robots-tag: noindex`, así que la aplicación no aparece en buscadores.

## Runbook

[`scripts/deploy-staging.sh`](../../scripts/deploy-staging.sh) construye y despliega el API, construye el sitio con la URL del API, lo sube a S3, invalida la caché y verifica `/v1/health` y `/dashboard`.

Los datos de la infraestructura (perfil de AWS, bucket, distribución, configuración de Serverless) **no están en este repositorio**: el script los recibe por variables de entorno, documentadas en su encabezado.

## Consideraciones y limitaciones

- **Arranque en frío:** el primer cobro después de un rato de inactividad tarda cerca de un segundo más.
- **La caída por variable de entorno no se activa en la versión publicada** (`SNAILPAY_OUTAGE=false`). Ahí se usa la tarjeta `…0503`.
- **Los datos viven en el navegador de quien evalúa:** la versión publicada no guarda nada en el servidor.
- **Deploy manual**, sin CI de despliegue (ADR 0008).
- **Costo en reposo de $0:** Lambda, API Gateway, S3 y CloudFront cobran por uso.
