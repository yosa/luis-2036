# Despliegue

> **Audiencia:** quien despliega o revisa la versión publicada.
> **Propósito:** cómo se publica la aplicación (adicional AD-01).
> **Estado:** ⏳ pendiente. Decisión en el [ADR 0008](../02-arquitectura/adr/0008-despliegue.md).

## Resumen

| Pieza    | Plataforma                                                           | URL            |
| -------- | -------------------------------------------------------------------- | -------------- |
| Frontend | AWS S3 + CloudFront (sitio estático de un repositorio privado) | ⟨por publicar⟩ |
| API      | AWS Lambda + API Gateway (`serverless-http`)                         | ⟨por publicar⟩ |

## Runbook (borrador)

1. `npm run build --workspace api`: esbuild genera `api/dist/lambda.mjs`.
2. `serverless deploy --stage staging`, con el `serverless.yml` de un repositorio privado. La función usa timeout de 20 s y `CORS_ORIGINS` con el dominio del sitio.
3. `VITE_API_BASE_URL=<url-del-api> npm run build --workspace frontend`.
4. `aws s3 sync frontend/dist s3://<bucket>/<carpeta>/ --delete` e invalidar CloudFront.
5. Verificar por el recurso, no por el comando:
   - registro, login y dashboard en la URL pública;
   - un cobro aprobado y un rechazo desde la UI;
   - la tarjeta `…0503` responde con error del sistema.

## Consideraciones y limitaciones

- **Sin credenciales:** el sitio no usa Basic Auth, porque quien evalúa debe entrar directo.
- **Arranque en frío:** el primer cobro después de un rato de inactividad tarda más.
- **La caída por variable de entorno** no se puede activar desde la versión publicada; ahí se usa la tarjeta `…0503`.
- **Los datos viven en el navegador de quien evalúa**; el despliegue no guarda nada.
