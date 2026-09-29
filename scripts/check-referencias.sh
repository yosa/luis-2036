#!/usr/bin/env bash
# Verifica que ningún archivo versionado mencione términos vetados.
#
# La lista vive en .private/terminos.txt (ignorado por git, un término por
# línea) para que este script no contenga él mismo las palabras que busca.
# Se ejecuta desde el hook pre-commit y a mano antes de publicar.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
terms_file="${repo_root}/.private/terminos.txt"

if [[ ! -s "${terms_file}" ]]; then
  echo "check-referencias: no existe ${terms_file}; se omite la verificación." >&2
  exit 0
fi

# --cached revisa lo que está en el índice (lo que se va a commitear).
if matches="$(git -C "${repo_root}" grep --cached -n -i -F -f "${terms_file}" -- . ':!*.pdf')"; then
  echo "check-referencias: se encontraron términos vetados:" >&2
  echo "${matches}" >&2
  exit 1
fi

echo "check-referencias: sin términos vetados."
