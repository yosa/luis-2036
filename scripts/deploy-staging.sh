#!/usr/bin/env bash
# Publica la versión de staging: API en AWS Lambda (Serverless Framework) y sitio en S3 + CloudFront.
# Runbook: docs/06-operacion/despliegue.md.
#
# Los datos de la infraestructura NO viven en este repositorio: se pasan por variables de entorno.
#   AWS_PROFILE                 perfil de AWS con permisos de despliegue
#   SERVERLESS_CONFIG           ruta al serverless.yml del API (se guarda fuera de este repo)
#   API_URL                     URL pública del API (se hornea en el build del sitio)
#   SITE_URL                    URL pública del sitio
#   SITE_BUCKET_URI             s3://<bucket>/<carpeta> donde se publica el sitio
#   CLOUDFRONT_DISTRIBUTION_ID  distribución a invalidar
#   CLOUDFRONT_PATH             ruta a invalidar (p. ej. /<carpeta>/*)
set -euo pipefail

for var in AWS_PROFILE SERVERLESS_CONFIG API_URL SITE_URL SITE_BUCKET_URI CLOUDFRONT_DISTRIBUTION_ID CLOUDFRONT_PATH; do
  if [[ -z "${!var:-}" ]]; then
    echo "Falta la variable de entorno ${var} (ver el encabezado de este script)." >&2
    exit 1
  fi
done

repo_root="$(git rev-parse --show-toplevel)"

echo "==> API: build y deploy a Lambda"
npm run build -w @snail-race/api
deploy_dir="$(mktemp -d)"
cp -R "${repo_root}/api/dist" "${deploy_dir}/"
echo '{"type":"module"}' > "${deploy_dir}/package.json"
cp "${SERVERLESS_CONFIG}" "${deploy_dir}/serverless.yml"
(cd "${deploy_dir}" && serverless deploy --stage staging)

echo "==> Sitio: build con la URL del API y subida a S3"
VITE_API_BASE_URL="${API_URL}" npm run build -w @snail-race/web
aws s3 sync "${repo_root}/frontend/dist/assets" "${SITE_BUCKET_URI}/assets" \
  --delete --cache-control "public,max-age=31536000,immutable" --only-show-errors
aws s3 sync "${repo_root}/frontend/dist" "${SITE_BUCKET_URI}" \
  --delete --exclude "assets/*" --cache-control "no-cache" --only-show-errors
aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
  --paths "${CLOUDFRONT_PATH}" --output text --query 'Invalidation.Id'

echo "==> Verificación (por el recurso, no por el comando)"
curl -fsS "${API_URL}/v1/health" && echo
curl -fsS -o /dev/null -w "sitio /dashboard: HTTP %{http_code}\n" "${SITE_URL}/dashboard"
