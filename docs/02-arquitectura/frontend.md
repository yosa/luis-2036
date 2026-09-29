# Frontend

> **Audiencia:** quien desarrolla o revisa `frontend/`.
> **Propósito:** cómo se organiza el código del frontend y por qué.
> **Estado:** base técnica y sistema visual implementados (2026-09-28): tokens, storage tipado, tema, cliente HTTP, componentes base, `useZodForm` y catálogo `/dev/ui`. Auth terminado (registro, login, sesión, guards y `AppShell`). Todas las pantallas terminadas: registro, login, dashboard y recarga.
> **Estándar que aplica:** `estándar de React` (y el núcleo `estándar de frontend`) del ecosistema. Este documento solo registra lo propio del proyecto.

## Stack

React 19 · Vite 8 · TypeScript 6 strict · React Router 8 (modo librería) · Zustand · zod · Recharts · SASS con CSS Modules · Vitest + Testing Library · Cypress. Las librerías se justifican en el [ADR 0002](adr/0002-librerias-del-frontend-y-la-api.md).

## Estructura de `src/`

Leyenda: ✅ ya existe · ⏳ llega con su feature.

- ✅ `app/`: router (agregador), `guards` (`ProtectedRoute`/`PublicOnlyRoute`), `appShell`, `centeredLayout`, `notFound`, `rootError` y `devCatalog` (solo en desarrollo).
- ✅ `features/auth/` (registro, login, esquemas, rutas), `features/dashboard/overview` (saldo, dona y barras con `chartCard` accesible), `stores/wallet` (saldo que sigue a la sesión), `lib/raceDay`, `lib/money`, `stores/session`, `lib/crypto` y `storage/slots.ts` (usuarios y sesión).
- ✅ `components/`: `button`, `textField`, `alert`, `themeToggle`, `brand`.
- ✅ `hooks/useZodForm.ts`, `lib/http/`, `storage/createStorageSlot.ts`, `stores/theme/`, `constants/` y `styles/`.
- ✅ `features/recharge/` (formulario, mensajes por resultado, tarjetas de prueba, historial), `services/snailpay`, `lib/wallet/creditRules` y el slot de cobros.

Estructura objetivo:

```
src/
  app/                       App.tsx, router.tsx (agregador), ErrorBoundary
  features/
    auth/
      register/              página de registro (contenedor) + components/registerForm
      login/                 página de login (contenedor) + components/loginForm
      routes.tsx
    dashboard/
      overview/              página del dashboard: saldo, gráficas, acciones
        components/          balanceCard, betsDonut, snailWinsBar, userMenu
      routes.tsx
    recharge/
      create/                formulario de recarga + resultado (aprobado / rechazado / error / timeout)
      routes.tsx
  components/                transversales: errorBanner, appHeader, themeToggle, feedbackAlert
  services/snailpay/         createCharge(payload) sobre lib/http
  stores/
    session/                 sesión activa + login/logout/register
    wallet/                  saldo + aplicación idempotente de cobros aprobados
  storage/                   repositorio tipado de LocalStorage (claves, esquemas, versión)
  lib/
    http/                    request() sobre fetch con AbortSignal.timeout y 3 clases de error
    crypto/                  hash de contraseña con PBKDF2 (Web Crypto)
    raceDay/                 generador determinista de un día de carreras (datos de gráficas)
  schemas/                   esquemas zod: registro, login, recarga, contrato de SnailPay
  constants/                 única lectura de import.meta.env; nombres de caracoles
  styles/                    _tokens.sass, _mixins.sass, main.sass
```

## Rutas

| Ruta         | Acceso          | Pantalla                                                    |
| ------------ | --------------- | ----------------------------------------------------------- |
| `/register`  | solo sin sesión | Registro                                                    |
| `/login`     | solo sin sesión | Inicio de sesión                                            |
| `/dashboard` | solo con sesión | Dashboard                                                   |
| `/recharge`  | solo con sesión | Recarga con SnailPay (también accesible desde el dashboard) |
| `/`          | —               | Redirige a `/dashboard` o a `/login` según haya sesión      |

Los guards son layout routes (`ProtectedRoute`, `PublicOnlyRoute`). La sesión se rehidrata desde LocalStorage **antes** del primer render, para que un refresh no parpadee hacia el login (RF-06).

## Estado

| Store     | Estado                                     | Acciones                                                                                                 |
| --------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `session` | usuario activo (sin el hash) y vencimiento | `register`, `login`, `logout`, `restore`                                                                 |
| `wallet`  | saldo en centavos, cobros del usuario      | `applyCharge(response, requestedAmount)`: suma solo si la respuesta cumple la regla contra falsos éxitos |

Las reglas de negocio viven en las acciones del store y en `lib/`, no en los componentes. Son lo primero que se prueba.

## Manejo de errores en la recarga

| Resultado                             | Detección                                                | Mensaje                                                                           | Saldo |
| ------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- | ----- |
| Aprobado                              | 201 + `approved` + `authorization_code` + monto coincide | "Recarga aprobada por $X. Autorización ABC123"                                    | suma  |
| Rechazado                             | 402/422 + `rejected`                                     | mensaje por `status_detail` (tabla en [escenarios](../03-snailpay/escenarios.md)) | igual |
| Error del sistema                     | 503 + `error`                                            | "SnailPay no está disponible. No se hizo ningún cargo."                           | igual |
| Timeout                               | `HttpTimeoutError` (se vence el límite del cliente)      | "No pudimos confirmar la recarga. No se aplicó ningún saldo."                     | igual |
| Sin red                               | `HttpNetworkError`                                       | "Sin conexión con SnailPay."                                                      | igual |
| Respuesta que no se puede interpretar | falla el esquema del contrato                            | "Respuesta inesperada. No se aplicó ningún saldo."                                | igual |

El botón de envío se deshabilita mientras la petición está en vuelo, y un cobro aprobado se aplica **una sola vez por `id`** aunque la respuesta llegue repetida. Un encabezado `Idempotency-Key`, que deduplica en el servidor, queda como mejora futura porque SnailPay no guarda estado.
