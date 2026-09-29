# Uso de inteligencia artificial

> **Audiencia:** quien evalúa el uso responsable de herramientas (RNF-04).
> **Propósito:** bitácora de qué herramientas de IA se usaron, para qué, en qué partes y cómo se validó cada resultado. Se llena **durante** el trabajo, no de memoria al final.

## Herramientas

| Herramienta | Modelo / versión | Uso principal |
|---|---|---|
| Claude Code (CLI) | Claude Opus 5.5 | Análisis del enunciado, organización del repo, redacción de documentación y estándares, generación y revisión de código, pruebas |

## Proceso de trabajo

1. **Primero el análisis.** El enunciado se leyó completo y se convirtió en requisitos con ID trazable antes de escribir código.
2. **Estándares antes que código.** Como React y Express no son el stack habitual, primero se escribieron sus estándares siguiendo el patrón de los existentes (Laravel, Quasar, Nuxt) y luego se aplicaron aquí.
3. **La IA propone y la persona decide.** Las decisiones de arquitectura se registran en ADRs. Cada ADR lo revisa y lo acepta el autor antes de implementarse.
4. **Validación**: todo código generado se lee completo, se ejecuta y queda cubierto por pruebas. Lo que no se puede explicar no se entrega.

## Bitácora

| Fecha | Tarea | Qué hizo la IA | Qué hizo o decidió la persona | Cómo se validó |
|---|---|---|---|---|
| 2026-09-28 | Análisis del enunciado y plan | Extrajo requisitos y restricciones del PDF y propuso la organización del repo y los estándares | Eligió el despliegue (Lambda + S3), el gestor de estado (Zustand, por similitud con Pinia) y el flujo GitLab → GitHub | Revisión del plan antes de ejecutarlo |
| 2026-09-28 | Estándares React y Express | Redactó los estándares y extrajo el núcleo agnóstico de frontend siguiendo el patrón existente | Aprobó publicarlos en el repositorio de estándares | Enlaces verificados con un script; revisión antes del merge |
| 2026-09-28 | Documentación base del repo | Redactó requisitos, arquitectura, contrato y escenarios de SnailPay, y ADRs propuestos | Revisó los ADR 0001–0008 | Enlaces verificados; el hook de términos vetados se probó con un canario |
| 2026-09-28 | Elección de versiones | Consultó las versiones publicadas y detectó que typescript-eslint no admite TypeScript 7 ni jsx-a11y ESLint 10 | Aceptó fijar TypeScript 6.0 y ESLint 9 | Revisión de `peerDependencies` en npm |
