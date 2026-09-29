# ADR 0003 — Tratamiento de la contraseña: PBKDF2 con Web Crypto

- **Estado**: Propuesto
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

El registro y el login son una **simulación local en LocalStorage**, y el alcance dice expresamente que la forma de tratar y guardar la contraseña se evalúa. No hay un servidor de identidad, así que el hash ocurre en el navegador. El riesgo que sí se puede mitigar es que una copia del LocalStorage (un respaldo, otra persona en el mismo equipo, una extensión) **revele la contraseña**, que el usuario probablemente reutiliza en otros sitios.

## Decisión

1. **Nunca se guarda la contraseña en claro**, ni en base64, ni se escribe en logs.
2. Se guarda un **hash PBKDF2-HMAC-SHA256** calculado con la **Web Crypto API** (`crypto.subtle.deriveBits`):
   - **600 000 iteraciones**, que es el mínimo que hoy recomienda OWASP para PBKDF2-SHA256.
   - Una **sal aleatoria de 16 bytes por usuario**, generada con `crypto.getRandomValues`.
   - Una salida de 256 bits.
3. Junto al hash se guardan el **algoritmo, las iteraciones y la sal**, para poder subir el costo en el futuro sin romper cuentas.
4. El login recalcula el hash con los parámetros guardados y lo compara en **tiempo constante**.
5. Un correo inexistente y una contraseña incorrecta dan **el mismo mensaje**, para no enumerar cuentas.

Detalle del flujo: [autenticación y sesión](../autenticacion-y-sesion.md).

## Consecuencias

**Positivas**:
- No hace falta ninguna dependencia.
- Es asíncrono, así que no congela la interfaz.
- Tiene sal por usuario y un factor de trabajo alto.
- Se puede explicar y probar: la misma entrada con la misma sal da el mismo hash, y otra sal da otro hash.

**Negativas / costos**:
- 600 000 iteraciones tardan unos cientos de milisegundos por registro o login. Se acepta, y la UI muestra un estado de "procesando".
- Hacer el hash en el cliente **no** protege frente a quien controla el navegador. Es una simulación, y así se declara.

## Alternativas evaluadas

| Opción | Pros | Contras | Veredicto |
|---|---|---|---|
| **PBKDF2-SHA256 (Web Crypto)** | Nativo, auditado, asíncrono | Menos resistente a GPU que Argon2id | ✅ |
| Argon2id (WASM) | El más recomendado hoy | Binario WASM extra para un alcance de simulación | Descartado; es la opción para producción en el servidor |
| bcrypt en JS | Conocido | Lento en JS puro, bloquea el hilo y trunca a 72 bytes | Descartado |
| SHA-256 sin sal | Trivial | Sin factor de trabajo; cae ante tablas precalculadas | ❌ |
| Mandar la contraseña a Express para hashearla | Se parece a producción | Contradice la simulación local del alcance y el hash terminaría igual en el navegador | Descartado |

## Pendientes

- En producción: autenticación en el servidor con Argon2id, cookie de sesión `HttpOnly` y rate limit de intentos (ver [propuesta de base de datos](../../07-entrega/propuesta-base-de-datos.md)).
