# Sistema visual

> **Audiencia:** quien revisa la presentación y la experiencia de uso.
> **Propósito:** cómo se ve la aplicación, con qué herramientas se diseñó y qué partes se generaron, se tomaron como base o se construyeron a mano (RNF-03).
> **Estado:** pendiente. Se completa durante el desarrollo, **a medida** que se toman las decisiones, no al final.

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

| Pantalla | Contenido mínimo |
|---|---|
| Registro | Nombre, correo, contraseña y confirmación; validación en línea; enlace a login |
| Login | Correo y contraseña; mensaje de error genérico; enlace a registro |
| Dashboard | Saludo con el nombre, tarjeta de saldo con botón de recarga, donut de apuestas, barras de victorias por caracol y cerrar sesión |
| Recarga | Formulario de tarjeta y monto, aviso de datos ficticios, y los estados enviando / aprobado / rechazado / error / timeout |

## Herramientas y origen de cada parte

> Se llena conforme avanza el trabajo. Es la fuente de la sección "Herramientas, librerías y plantillas" del documento de respuesta.

| Parte | Herramienta o base | Generado / tomado como base / construido | Notas |
|---|---|---|---|
| Paleta y tipografía | ⟨por definir⟩ (p. ej. el plugin `ui-ux-pro-max`) | ⟨por definir⟩ | |
| Tokens y modo claro/oscuro | Estándar del ecosistema | ⟨por definir⟩ | |
| Componentes de formulario | ⟨por definir⟩ | ⟨por definir⟩ | |
| Gráficas | Recharts | Librería configurada con los tokens | |
| Layout del dashboard | ⟨por definir⟩ | ⟨por definir⟩ | |
