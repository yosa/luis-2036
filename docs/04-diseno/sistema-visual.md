# Sistema visual

> **Audiencia:** quien revisa la presentación y la experiencia de uso.
> **Propósito:** cómo se ve la aplicación, con qué herramientas se diseñó y qué partes se generaron, se tomaron como base o se construyeron a mano (RNF-03).
> **Estado:** implementado y visible en el [catálogo de componentes](https://caracoles-staging.mangobinario.com/componentes): tokens, componentes y las cuatro pantallas (registro, login, dashboard, recarga), revisadas en Chrome en modo claro, oscuro y móvil.

## Principios

- **Claro antes que vistoso.** El saldo y la acción de recargar son lo primero que se ve en el dashboard.
- **Un solo sistema de color**, con tokens CSS (`styles/_tokens.sass`) en modo claro y oscuro, y cero colores sueltos en los componentes.
- **Accesible por defecto**:
  - contraste AA;
  - foco visible;
  - `label` visible en cada campo;
  - errores asociados al campo y anunciados (`role="alert"`);
  - área táctil de al menos 44 px;
  - `prefers-reduced-motion`.
- **Responsivo desde 360 px**, empezando por el móvil.
- **Temática de carreras de caracoles** en la identidad (nombres, iconografía, textos), sin sacrificar la claridad de la parte financiera.

## Pantallas

| Pantalla  | Contenido mínimo                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Registro  | Nombre, correo, contraseña y confirmación; validación en línea; enlace a login                                                  |
| Login     | Correo y contraseña; mensaje de error genérico; enlace a registro                                                               |
| Dashboard | Saludo con el nombre, tarjeta de saldo con botón de recarga, donut de apuestas, barras de victorias por caracol y cerrar sesión |
| Recarga   | Formulario de tarjeta y monto, aviso de datos ficticios, y los estados enviando / aprobado / rechazado / error / timeout        |

## Decisiones visuales

| Elemento    | Decisión                                                                                                                                                                    | Por qué                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Estilo      | "Dark Mode (OLED)" con acento verde, con modo claro equivalente                                                                                                             | Lo recomendó `ui-ux-pro-max` para un dashboard de apuestas: fondo profundo, verde para lo positivo (saldo, aprobado)                       |
| Tipografía  | **Fredoka** (títulos) + **Nunito** (texto), servidas localmente con `@fontsource`                                                                                           | Par "Playful Creative" de `ui-ux-pro-max` para entretenimiento y juego; cercano sin perder legibilidad. Sin peticiones a Google en runtime |
| Iconos      | `lucide-react` (SVG), incluido el caracol de la marca                                                                                                                       | Sin emojis como iconos (regla de la herramienta); SVG accesibles con `aria-hidden`                                                         |
| Modo        | Oscuro por defecto si el sistema lo prefiere; conmutador persistido; script anti-FOUC en `index.html`                                                                       | Respeta `prefers-color-scheme` y no parpadea al recargar                                                                                   |
| Gráficas    | Dona ganadas (verde) / perdidas (violeta) con porcentaje central, leyenda con conteos, tooltip y tabla; barras horizontales de una sola serie (ámbar) con el valor al final | Guía de visualización `dataviz` + validación de la paleta con su script; ver ADR 0007                                                      |
| Formularios | Label visible, error bajo el campo con `aria-describedby`, validación al salir del campo, foco al primer error al enviar                                                    | Guías "Inline Validation" y "Submit Feedback" de la herramienta                                                                            |

## Colores de gráficas (validados con script)

| Token                          | Oscuro    | Claro     |
| ------------------------------ | --------- | --------- |
| `--chart-won`                  | `#16A34A` | `#15803D` |
| `--chart-lost`                 | `#8B5CF6` | `#7C3AED` |
| `--chart-bar` (una sola serie) | `#FBBF24` | `#B45309` |

El par ganadas/perdidas pasa los cinco chequeos del validador en los dos modos (luminosidad, croma, separación para daltonismo, visión normal y contraste contra la superficie).

## Contraste verificado (WCAG AA)

Calculado con la fórmula de luminancia relativa de WCAG antes de fijar los tokens:

| Par                                        | Oscuro   | Claro    |
| ------------------------------------------ | -------- | -------- |
| Texto / superficie                         | 17.8 : 1 | 17.1 : 1 |
| Texto secundario / superficie              | 7.3 : 1  | 7.6 : 1  |
| Texto del botón / acento                   | 7.8 : 1  | 5.0 : 1  |
| Error / superficie                         | 6.7 : 1  | 6.5 : 1  |
| Borde de campo / superficie (mínimo 3 : 1) | 3.9 : 1  | 4.8 : 1  |

El acento verde de la paleta sugerida (`#22C55E`) no alcanza AA con texto blanco en modo claro, así que en ese modo se usa `#15803D`.

## Herramientas y origen de cada parte

| Parte                                                 | Herramienta o base                                                          | Generado / tomado como base / construido                                                                                                         | Notas                                                                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Paleta y tipografía                                   | Plugin `ui-ux-pro-max` (búsqueda `--design-system` y `--domain typography`) | Tomado como base y ajustado a mano para AA en ambos modos                                                                                        | Se descartó su recomendación de patrón ("Enterprise Gateway", de landing) y la tipografía Fira Code por demasiado técnica |
| Tokens y modo claro/oscuro                            | Mi estándar de frontend (tokens CSS + anti-FOUC)                            | Construido                                                                                                                                       | `styles/_tokens.sass`                                                                                                     |
| Componentes (botón, campo, alerta, conmutador, marca) | Ninguna librería de componentes                                             | Construidos a mano sobre los tokens                                                                                                              | CSS Modules + SASS                                                                                                        |
| Iconos                                                | `lucide-react`                                                              | Librería                                                                                                                                         |                                                                                                                           |
| Gráficas                                              | Recharts + guía `dataviz`                                                   | Librería configurada con los tokens; paleta validada con `validate_palette.js`                                                                   | El gris de "perdidas" falló el croma mínimo y se cambió por violeta                                                       |
| Layout del dashboard                                  | —                                                                           | Construido: cifra principal del saldo (≥ 40 px), dona y barras en una cuadrícula de 2 columnas que pasa a 1 en móvil                             | Revisado en Chrome a 1440 y 390 px                                                                                        |
| Pantalla de recarga                                   | —                                                                           | Construida: formulario en dos columnas con panel de tarjetas de prueba e historial; saldo visible en el header en todas las pantallas con sesión | Mensajes por resultado con tono distinto (éxito, error, advertencia)                                                      |
