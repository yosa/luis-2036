# Uso de inteligencia artificial

> **Audiencia:** quien evalúa el uso responsable de herramientas (RNF-04).
> **Propósito:** bitácora de qué herramientas de IA se usaron, para qué, en qué partes y cómo se validó cada resultado. Se llena **durante** el trabajo, no de memoria al final.

## Herramientas

| Herramienta       | Modelo / versión | Uso principal                                                                                                                    |
| ----------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code (CLI) | Claude Opus 5.5  | Análisis del enunciado, organización del repo, redacción de documentación y estándares, generación y revisión de código, pruebas |

## Proceso de trabajo

1. **Primero el análisis.** El enunciado se leyó completo y se convirtió en requisitos con ID trazable antes de escribir código.
2. **Estándares antes que código.** Como React y Express no son el stack habitual, primero se escribieron sus estándares siguiendo el patrón de los existentes (Laravel, Quasar, Nuxt) y luego se aplicaron aquí.
3. **La IA propone y la persona decide.** Las decisiones de arquitectura se registran en ADRs. Cada ADR lo revisa y lo acepta el autor antes de implementarse.
4. **Validación**: todo código generado se lee completo, se ejecuta y queda cubierto por pruebas. Lo que no se puede explicar no se entrega.

## Bitácora

| Fecha      | Tarea                         | Qué hizo la IA                                                                                                 | Qué hizo o decidió la persona                                                                                          | Cómo se validó                                                                                                                            |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-28 | Análisis del enunciado y plan | Extrajo requisitos y restricciones del PDF y propuso la organización del repo y los estándares                 | Eligió el despliegue (Lambda + S3), el gestor de estado (Zustand, por similitud con Pinia) y el flujo GitLab → GitHub  | Revisión del plan antes de ejecutarlo                                                                                                     |
| 2026-09-28 | Estándares React y Express    | Redactó los estándares y extrajo el núcleo agnóstico de frontend siguiendo el patrón existente                 | Aprobó publicarlos en el repositorio de estándares                                                                     | Enlaces verificados con un script; revisión antes del merge                                                                               |
| 2026-09-28 | Documentación base del repo   | Redactó requisitos, arquitectura, contrato y escenarios de SnailPay, y ADRs propuestos                         | Revisó los ADR 0001–0008                                                                                               | Enlaces verificados; el hook de términos vetados se probó con un canario                                                                  |
| 2026-09-28 | Elección de versiones         | Consultó las versiones publicadas y detectó que typescript-eslint no admite TypeScript 7 ni jsx-a11y ESLint 10 | Aceptó fijar TypeScript 6.0 y ESLint 9                                                                                 | Revisión de `peerDependencies` en npm                                                                                                     |
| 2026-09-28 | API de SnailPay               | Implementó el módulo por slices, la tabla de escenarios y 40 pruebas                                           | Revisó el orden de evaluación de los escenarios                                                                        | Pruebas + `curl` al servidor real; canarios en type-check y lint                                                                          |
| 2026-09-28 | Sistema visual                | Consultó `ui-ux-pro-max` (design system, tipografía, gráficas, formularios) y calculó el contraste AA          | Aceptó la paleta ajustada; descartó el patrón de landing y la tipografía técnica                                       | Contraste calculado con la fórmula WCAG; revisión en Chrome en ambos modos                                                                |
| 2026-09-28 | Base del frontend             | Escribió la base técnica y los componentes                                                                     | Pidió dividir el trabajo en ramas pequeñas con pruebas, revisión antes de cada commit y un catálogo para ver el UI kit | Revisión rama por rama en Chrome; así se encontró un bug del anti-FOUC (el tema no persistía al recargar)                                 |
| 2026-09-28 | Documentación del avance      | Actualizó estado, ADR, guías y registros                                                                       | Señaló que la documentación no se estaba actualizando al avanzar                                                       | Enlaces verificados; el conteo de pruebas se tomó del reporter de Vitest, no a mano                                                       |
| 2026-09-28 | Colección Postman             | Leyó el estándar de colecciones, generó la colección con un script y la corrió con Newman                      | Pidió crear la carpeta `postman/` según el estándar                                                                    | Newman contra el API real: 98 aserciones en verde; los fallos esperados (caída por configuración, rate limit) se reprodujeron a propósito |
