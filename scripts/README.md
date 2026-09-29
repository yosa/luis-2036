# Scripts del repositorio

> **Audiencia:** quien desarrolla, despliega o prepara la entrega.
> **Propósito:** qué hace cada script, qué necesita y cómo se usa. Todos se ejecutan desde la raíz del repositorio.

| Script                                         | Para qué                                                     | Cuándo se usa                                                |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| [`check-referencias.sh`](check-referencias.sh) | Impide versionar términos vetados                            | Automático en cada commit (hook) y a mano antes de publicar  |
| [`generar-pdf.sh`](generar-pdf.sh)             | Genera el PDF del documento de respuesta y valida su formato | Cada vez que cambia `docs/07-entrega/documento-respuesta.md` |
| [`deploy-staging.sh`](deploy-staging.sh)       | Despliega el API y el sitio en AWS y verifica el resultado   | Para publicar una versión nueva                              |

## `check-referencias.sh` y el hook de pre-commit

Busca, en los archivos que se van a commitear, los términos de una lista privada (`.private/terminos.txt`, ignorada por git): nombres que no deben aparecer en un repositorio público e identificadores de infraestructura. Si encuentra alguno, muestra el archivo y la línea y **bloquea el commit**.

```bash
git config core.hooksPath .githooks   # una vez por clon: activa el hook .githooks/pre-commit
scripts/check-referencias.sh          # verificación manual
```

- **Requisitos:** solo git.
- **Sin la lista privada** (por ejemplo, en un clon público), el script avisa y no bloquea nada. Es intencional: la lista no puede publicarse, porque contiene justo lo que se quiere ocultar.
- La lista se lee de un archivo aparte para que el propio script no contenga los términos que busca.

## `generar-pdf.sh`

Convierte `docs/07-entrega/documento-respuesta.md` en `docs/07-entrega/documento-respuesta.pdf`, con la hoja de estilos `docs/07-entrega/estilo-pdf.css` (Arial 10, interlineado estándar, pie paginado).

```bash
scripts/generar-pdf.sh
# documento-respuesta.pdf: 4 páginas
# Sin términos vetados.
```

- **Requisitos:** pandoc, Google Chrome y poppler (para `pdfinfo` y `pdftotext`). Si Chrome no está en la ruta de macOS, se indica con `CHROME_BIN=/ruta/a/chrome`.
- **Falla si** el PDF pasa de 6 páginas (4 de la entrega principal más 1 por cada adicional) o si su texto contiene términos vetados. Esa segunda revisión es necesaria porque el hook de git no lee el texto de un PDF.
- El PDF se versiona junto a su fuente. Si se edita el markdown, hay que regenerarlo antes del commit para que no queden desincronizados.

## `deploy-staging.sh`

Publica la versión de staging (ver [despliegue](../docs/06-operacion/despliegue.md)):

1. Construye el API con esbuild y lo despliega en AWS Lambda con Serverless Framework, desde una carpeta temporal.
2. Construye el sitio con la URL del API.
3. Lo sube a S3 (assets con caché larga e `index.html` sin caché) e invalida CloudFront.
4. Verifica `/v1/health` del API y `/dashboard` del sitio.

**Requisitos:** AWS CLI, Serverless Framework 3 y credenciales de AWS con permisos de despliegue.

Los datos de la infraestructura **no están en el repositorio**: se pasan por variables de entorno. Si falta alguna, el script se detiene y dice cuál.

| Variable                     | Qué es                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| `AWS_PROFILE`                | Perfil de AWS con permisos de despliegue                               |
| `SERVERLESS_CONFIG`          | Ruta al `serverless.yml` del API (se guarda fuera de este repositorio) |
| `API_URL`                    | URL pública del API; se hornea en el build del sitio                   |
| `SITE_URL`                   | URL pública del sitio                                                  |
| `SITE_BUCKET_URI`            | `s3://<bucket>/<carpeta>` donde se publica el sitio                    |
| `CLOUDFRONT_DISTRIBUTION_ID` | Distribución de CloudFront a invalidar                                 |
| `CLOUDFRONT_PATH`            | Ruta a invalidar, por ejemplo `/<carpeta>/*`                           |

```bash
AWS_PROFILE=… SERVERLESS_CONFIG=… API_URL=… SITE_URL=… \
SITE_BUCKET_URI=… CLOUDFRONT_DISTRIBUTION_ID=… CLOUDFRONT_PATH=… \
scripts/deploy-staging.sh
```
