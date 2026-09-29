# Estado del proyecto

> **Audiencia:** quien revisa la entrega.
> **Propósito:** la **única fuente de verdad** de qué está terminado. Una fila solo pasa a ✅ cuando tiene evidencia enlazada: una prueba automatizada o el archivo que la implementa. Se actualiza en el mismo commit que cambia el código.
> **Última actualización:** 2026-09-28. Estructura y documentación base; el desarrollo aún no empieza.

Leyenda: ✅ terminado con evidencia · 🟡 parcial (el detalle dice qué falta) · ⏳ pendiente · ❌ fuera de alcance / no se hará

## Mínimos de validez

| Mínimo | Estado | Evidencia |
|---|---|---|
| Registrar un usuario con correo y contraseña | ⏳ | — |
| Cerrar sesión | ⏳ | — |
| Iniciar sesión de nuevo con los datos registrados | ⏳ | — |
| Acceder a una pantalla posterior al inicio de sesión | ⏳ | — |

## Requisitos funcionales

| ID | Resumen | Estado | Evidencia | Notas |
|---|---|---|---|---|
| RF-01 | Registro con nombre, correo, contraseña y confirmación | ⏳ | — | |
| RF-02 | Validaciones, sin adjuntos | ⏳ | — | |
| RF-03 | Acceso tras registrarse | ⏳ | — | |
| RF-04 | Cerrar sesión | ⏳ | — | |
| RF-05 | Login con correo y contraseña | ⏳ | — | |
| RF-06 | Persistencia al recargar | ⏳ | — | |
| RF-07 | Dashboard solo con sesión activa | ⏳ | — | |
| RF-08 | Saldo inicial $0 | ⏳ | — | |
| RF-09 | Tratamiento de la contraseña | ⏳ | — | ADR 0003 |
| RF-10 | Nombre del usuario en el dashboard | ⏳ | — | |
| RF-11 | Saldo actual | ⏳ | — | |
| RF-12 | Donut de apuestas ganadas y perdidas | ⏳ | — | ADR 0007 |
| RF-13 | Barras de victorias por caracol | ⏳ | — | ADR 0007 |
| RF-14 | Opción de recargar con SnailPay | ⏳ | — | |
| RF-15 | Opción de cerrar sesión | ⏳ | — | |
| RF-16 | SnailPay como mock en Express | ⏳ | — | |
| RF-17 | Datos de tarjeta, monto y datos del usuario por API | ⏳ | — | [contrato](../03-snailpay/contrato.md) |
| RF-18 | Cobro exitoso con la tarjeta de prueba | ⏳ | — | [escenarios](../03-snailpay/escenarios.md) |
| RF-19 | El saldo aumenta, se persiste y se muestra; aviso de aprobado | ⏳ | — | |
| RF-20 | Errores de transacción con `status_detail` | ⏳ | — | ADR 0005 |
| RF-21 | Error del sistema documentado y sin recarga aplicada | ⏳ | — | ADR 0005 |
| RF-22 | Los 9 campos en todas las respuestas | ⏳ | — | ADR 0004 |
| RF-23 | Sin cambio de saldo ni falso éxito en los fallos | ⏳ | — | |
| RF-24 | PAN y CVV ficticios en la respuesta y en LocalStorage | ⏳ | — | ADR 0006 |

## Requisitos no funcionales y entregables

| ID | Resumen | Estado | Evidencia |
|---|---|---|---|
| RNF-01 | TypeScript en ambos lados | ⏳ | — |
| RNF-02 | Interfaz clara y consistente | ⏳ | — |
| RNF-03 | Herramientas de UI documentadas | ⏳ | [sistema visual](../04-diseno/sistema-visual.md) |
| RNF-04 | Uso de IA documentado | 🟡 | [uso de IA](../07-entrega/uso-de-ia.md): bitácora iniciada |
| RNF-05 | Buenas prácticas | ⏳ | — |
| RNF-06 | Pruebas automatizadas | ⏳ | [estrategia](../05-calidad-y-pruebas/estrategia-de-pruebas.md) |
| RNF-07 | Errores y timeout | ⏳ | — |
| RNF-08 | Sin referencias identificables | ✅ | `scripts/check-referencias.sh` + hook `pre-commit` |
| E-01 | PDF de respuesta | ⏳ | — |
| E-02 | Instrucciones para ejecutar | ⏳ | [ejecutar local](../06-operacion/ejecutar-local.md) |
| E-03 | Instrucciones de pruebas | ⏳ | — |
| E-04 | Reproducir las respuestas de SnailPay | 🟡 | [escenarios](../03-snailpay/escenarios.md): definidos, sin implementar |
| E-05 | Repositorio público en GitHub | ⏳ | — |
| AD-01 | Aplicación desplegada | ⏳ | ADR 0008 |
| AD-02 | Propuesta de base de datos | ⏳ | [propuesta](../07-entrega/propuesta-base-de-datos.md) |

## Problemas conocidos

Aún ninguno. Cada problema se registra aquí con cómo reproducirlo y, si se decide no corregirlo, por qué.
