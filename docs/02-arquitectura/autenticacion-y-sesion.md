# Autenticación y sesión

> **Audiencia:** quien revisa la seguridad de la solución.
> **Propósito:** cómo se registran los usuarios, cómo se guarda la contraseña, cómo funciona la sesión y qué límites tiene hacerlo todo en el navegador.
> **Estado:** implementado (2026-09-28). Decisión en el [ADR 0003](adr/0003-tratamiento-de-la-contrasena.md), aceptado. Código en [`stores/session`](../../frontend/src/stores/session/index.ts), [`features/auth`](../../frontend/src/features/auth/) y [`app/guards`](../../frontend/src/app/guards/index.tsx).

## Registro

1. El formulario valida con zod:
   - **nombre:** de 2 a 80 caracteres, sin espacios a los lados.
   - **correo:** con formato válido; se normaliza con `trim` y minúsculas.
   - **contraseña:** mínimo 8 caracteres, con al menos una letra y un número, y a lo más 128 caracteres.
   - **confirmación:** debe ser igual a la contraseña.
2. Si el correo ya está registrado, se muestra "Ya existe una cuenta con ese correo". El mensaje no revela nada más.
3. Se genera una **sal aleatoria de 16 bytes** (`crypto.getRandomValues`) y se deriva el hash con **PBKDF2-HMAC-SHA256 con 600 000 iteraciones** (`crypto.subtle`).
4. Se guarda el usuario con `id` (UUID v4), nombre, correo y `password: { algorithm, iterations, salt, hash }`, con sal y hash en base64. **La contraseña en claro nunca se guarda ni se registra en logs.**
5. Se crea la sesión y se navega al dashboard. El saldo inicial es 0 (RF-08).

## Inicio de sesión

1. Se busca al usuario por el correo normalizado.
2. Se deriva el hash de la contraseña capturada con la sal y las iteraciones **guardadas en ese usuario**, de modo que se puedan subir las iteraciones en el futuro sin romper las cuentas existentes.
3. Se compara en **tiempo constante** (comparación byte a byte sin salida temprana).
4. Si el correo no existe o la contraseña no coincide, el mensaje es el mismo: "Correo o contraseña incorrectos". Así no se enumeran cuentas. Con un correo inexistente se verifica contra un hash señuelo, para que la respuesta tampoco tarde distinto.
5. Si se llegó al login desde una ruta protegida, tras entrar se vuelve a esa ruta.

## Sesión

- Se guarda en LocalStorage con `userId`, `createdAt` y `expiresAt` (8 horas).
- Al cargar la app, la sesión se valida con su esquema. Si ya venció o está corrupta, se descarta y se envía al login.
- **Cerrar sesión** borra la sesión, pero no el usuario, el saldo ni los cobros (RF-04 y RF-06).
- Dos pestañas se sincronizan con el evento `storage`: cerrar sesión en una cierra la otra.

## Por qué PBKDF2 con Web Crypto

| Opción                         | Pros                                                                                                                                | Contras                                                                                                | Veredicto                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| **PBKDF2-SHA256 (Web Crypto)** | Nativo en todos los navegadores, sin dependencias, recomendado por OWASP con ≥ 600 000 iteraciones, y asíncrono (no congela la UI). | Es menos resistente a GPU que Argon2id.                                                                | ✅                                               |
| Argon2id (WASM)                | Es el más recomendado hoy.                                                                                                          | Agrega un binario WASM y más configuración para un alcance de simulación.                              | Descartado por costo y beneficio en este alcance |
| bcrypt (JS)                    | Es conocido.                                                                                                                        | Una implementación en JS puro es lenta y bloquea el hilo principal, y trunca la contraseña a 72 bytes. | Descartado                                       |
| SHA-256 simple                 | Es trivial.                                                                                                                         | No tiene sal ni factor de trabajo, así que cae ante tablas precalculadas.                              | ❌ Nunca                                         |
| Guardarla en claro o en base64 | —                                                                                                                                   | Base64 no es cifrado.                                                                                  | ❌ Nunca                                         |

## Límites honestos

- **Hacer el hash en el cliente no protege frente a quien controla el navegador.** El objetivo es que un respaldo o una copia del LocalStorage **no revele la contraseña**, que el usuario probablemente reutiliza en otros sitios. No convierte al navegador en un servidor de autenticación.
- **La sesión no es un token firmado.** Quien edite LocalStorage puede fabricarse una sesión. En producción, la autenticación viviría en el servidor, con cookie `HttpOnly`, `Secure` y `SameSite`, y el hash (Argon2id) solo en el servidor.
- **No hay límite de intentos de login.** En local no hay a quién proteger. En producción sería un rate limit por cuenta y por IP en el servidor.
