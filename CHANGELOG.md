# Changelog de la documentación

Registro de cambios de la documentación y de las decisiones, en orden de fecha descendente. Los cambios de código quedan en el historial de git.

## 2026-09-28

- 🗂️ Estructura inicial del repositorio: `api/`, `frontend/` y `docs/`, organizado en siete secciones numeradas.
- 📋 Requisitos reescritos con ID trazable (RF, RNF y entregables), y matriz de estado inicial en la que todo figura como pendiente.
- 🏛️ ADR 0001 a 0008 en estado **Propuesto**: organización, librerías, contraseña, contrato de SnailPay, fallos simulados, datos de tarjeta, datos de gráficas y despliegue.
- 💳 Contrato de SnailPay y tabla de escenarios reproducibles, en borrador hasta implementar.
- 🔒 Hook `pre-commit` que impide versionar términos vetados.
- **Reflejado en:** [README](README.md) · [estado](docs/01-alcance/estado.md) · [ADRs](docs/02-arquitectura/adr/README.md)
