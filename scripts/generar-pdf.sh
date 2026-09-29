#!/usr/bin/env bash
# Genera docs/07-entrega/documento-respuesta.pdf desde su fuente en markdown.
# Formato pedido: Arial 10, interlineado estándar, sin código ni capturas, máximo 6 páginas
# (4 + 1 por cada adicional terminado). Requiere pandoc, Google Chrome y pdfinfo (poppler).
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
dir="${repo_root}/docs/07-entrega"
chrome="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
max_pages=6
tmp_html="$(mktemp -t documento-respuesta).html"

pandoc "${dir}/documento-respuesta.md" -s \
  --metadata pagetitle="Carreras de caracoles — documento de respuesta" \
  --css "${dir}/estilo-pdf.css" --embed-resources -o "${tmp_html}"

"${chrome}" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="${dir}/documento-respuesta.pdf" "file://${tmp_html}" >/dev/null 2>&1

pages="$(pdfinfo "${dir}/documento-respuesta.pdf" | awk '/^Pages:/ {print $2}')"
echo "documento-respuesta.pdf: ${pages} páginas"
if (( pages > max_pages )); then
  echo "El PDF excede el máximo de ${max_pages} páginas." >&2
  exit 1
fi

# El PDF no pasa por el hook de git como texto: se revisa aquí con la misma lista privada.
terms_file="${repo_root}/.private/terminos.txt"
if [[ -s "${terms_file}" ]] && pdftotext "${dir}/documento-respuesta.pdf" - | grep -qiF -f "${terms_file}"; then
  echo "El PDF contiene términos vetados." >&2
  exit 1
fi
echo "Sin términos vetados."
