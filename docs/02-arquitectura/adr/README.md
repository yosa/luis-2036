# Registro de decisiones (ADR)

> **Audiencia:** quien revisa o continúa el proyecto.
> **Propósito:** por qué el proyecto es como es. Cada decisión relevante tiene su contexto, las alternativas que se evaluaron y sus consecuencias.

## Convenciones

- **Nombre del archivo:** `NNNN-titulo-en-kebab-case.md`, con 4 dígitos. El número no se reutiliza.
- **Estados:** `Propuesto` → `Aceptado`, o `Rechazado`. Más adelante, `Reemplazado por NNNN`.
- **Un ADR aceptado es inmutable.** Si la decisión cambia, se escribe un ADR nuevo que lo reemplaza y el anterior solo actualiza su estado.
- **Plantilla:** cabecera (Estado, Fecha, Decide, Reemplaza), luego Contexto → Decisión → Consecuencias → Alternativas evaluadas → Pendientes.
- Un ADR pasa de `Propuesto` a `Aceptado` **cuando la decisión queda implementada**, y en ese mismo commit se enlaza la evidencia.

## Índice

| ID                                                             | Título                                                         | Estado    |
| -------------------------------------------------------------- | -------------------------------------------------------------- | --------- |
| [0001](0001-organizacion-del-repositorio.md)                   | Organización del repositorio: monorepo con npm workspaces      | Aceptado  |
| [0002](0002-librerias-del-frontend-y-la-api.md)                | Librerías del frontend y de la API                             | Propuesto |
| [0003](0003-tratamiento-de-la-contrasena.md)                   | Tratamiento de la contraseña: PBKDF2 con Web Crypto            | Aceptado  |
| [0004](0004-contrato-de-snailpay.md)                           | Contrato de SnailPay y regla contra falsos éxitos              | Aceptado  |
| [0005](0005-simulacion-de-fallos.md)                           | Simulación de errores de transacción, del sistema y de timeout | Aceptado  |
| [0006](0006-datos-de-tarjeta-en-respuesta-y-almacenamiento.md) | Número de tarjeta y CVV en la respuesta y en LocalStorage      | Propuesto |
| [0007](0007-datos-simulados-de-graficas.md)                    | Datos simulados y deterministas para las gráficas              | Aceptado  |
| [0008](0008-despliegue.md)                                     | Despliegue: API en Lambda y frontend en S3/CloudFront          | Propuesto |

## Dependencias

- 0004 → 0005 y 0006: los escenarios y los datos de tarjeta parten del contrato.
- 0002 → 0007: la librería de gráficas condiciona la forma de los datos.
- 0001 → 0008: los workspaces definen qué se construye y se despliega.
