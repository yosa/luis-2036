# ADR 0002 — Librerías del frontend y de la API

- **Estado**: Propuesto
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

El stack base viene dado: React, Express y TypeScript. Sobre él hay que elegir el router, el manejo de estado, la validación, las gráficas, el estilo y las pruebas. El criterio es seguir los estándares del ecosistema para React y Express, minimizar dependencias y que cada librería tenga una razón que se pueda explicar.

## Decisión

| Necesidad          | Librería                                                    | Razón                                                                                                                              |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Build del frontend | **Vite**                                                    | Estándar de facto para React sin framework, arranque rápido y soporte nativo de TypeScript y CSS Modules                           |
| Rutas              | **React Router 8** (modo librería)                          | Guards como layout routes; sin SSR porque es una SPA                                                                               |
| Estado             | **Zustand**                                                 | Lo más parecido a los setup stores de Pinia: un store por dominio con acciones dentro, selectores y sin provider                   |
| Validación         | **zod**                                                     | Un esquema para validar y tipar a la vez, compartido entre frontend y API                                                          |
| Gráficas           | **Recharts**                                                | Declarativa en React; el donut (`PieChart` con `innerRadius`) y las barras están listos, y es accesible con etiquetas              |
| Estilos            | **SASS + CSS Modules** sobre tokens CSS                     | El mismo sistema de tokens del ecosistema, con alcance local y sin runtime                                                         |
| Servidor           | **Express 5**                                               | Pedido por el alcance; la versión 5 propaga solos los errores de los handlers `async`                                              |
| Seguridad HTTP     | **helmet**, **cors**, **express-rate-limit**                | Cabeceras seguras, CORS con allowlist y límite de solicitudes                                                                      |
| Logs               | **pino**                                                    | Logs JSON con `redact` de datos sensibles                                                                                          |
| Pruebas            | **Vitest**, **Testing Library**, **supertest**, **Cypress** | Un solo runner para los dos paquetes; componentes probados por comportamiento; HTTP sin levantar el servidor; E2E del flujo mínimo |

## Consecuencias

**Positivas**: pocas dependencias, todas justificadas, y alineadas con los estándares del ecosistema para React y Express.

**Negativas / costos**: Recharts pesa más que una gráfica hecha a mano con SVG. Se acepta porque ahorra tiempo en accesibilidad, tooltips y responsividad.

## Alternativas evaluadas

| Opción                                 | Pros               | Contras                                                           | Veredicto                                                                    |
| -------------------------------------- | ------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Context + `useReducer` (estado)        | Sin dependencias   | Re-renderiza a todos los consumidores y obliga a partir providers | Descartado                                                                   |
| Redux Toolkit (estado)                 | Robusto            | Más ceremonia de la que pide el alcance                           | Descartado                                                                   |
| Chart.js / react-chartjs-2             | Muy usado          | Imperativo (canvas) y menos accesible                             | Descartado                                                                   |
| Tailwind (estilos)                     | Rápido de escribir | Segundo sistema paralelo a los tokens del ecosistema              | Descartado                                                                   |
| Librería de componentes completa (MUI) | Muchos componentes | Pesada e impone su propio sistema visual                          | Descartado; si hace falta, primitivas accesibles sueltas (p. ej. un diálogo) |
| Jest                                   | Muy conocido       | Configuración extra con ESM y Vite                                | Descartado a favor de Vitest                                                 |

## Versiones fijadas y por qué

Al instalar (2026-09-28) se eligió la última versión de cada librería, salvo dos excepciones forzadas por compatibilidad:

| Paquete       | Versión          | Motivo                                                                                                                                                |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript    | **6.0** (no 7.0) | `typescript-eslint` solo admite `<6.1`; con TypeScript 7 se pierde el lint type-aware                                                                 |
| ESLint        | **9** (no 10)    | `eslint-plugin-jsx-a11y` solo admite hasta ESLint 9; npm ya marca la 9 como sin soporte. Se revisa cuando el plugin publique compatibilidad           |
| React Router  | 8                | Mantiene la API de data router (`createBrowserRouter`, `RouterProvider` en `react-router/dom`); sus cambios incompatibles no afectan al modo librería |
| Vite / Vitest | 8 / 5            | Últimas versiones, compatibles entre sí                                                                                                               |

## Pendientes

- Confirmar si hace falta una primitiva accesible para el diálogo de recarga o si alcanza con una página propia (`/recharge`).
