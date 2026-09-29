# Requisitos

> **Audiencia:** quien desarrolla y quien revisa.
> **Propósito:** los requisitos del proyecto con un ID estable para rastrearlos hasta el código, las pruebas y la [matriz de estado](estado.md).
> **Fuente:** enunciado original del encargo (copia privada, no versionada). Este documento lo reescribe sin cambiar el alcance.

## Contexto y restricciones

- **Objetivo:** una aplicación web sencilla, con temática de apuestas en carreras de caracoles, que muestre cómo se organiza una solución, cómo se adapta a un stack dado, qué prácticas se aplican y cómo se manejan las distintas respuestas de una integración.
- **Stack obligatorio:** React (frontend), Express (backend), TypeScript en ambos, y LocalStorage para el usuario, la sesión y el saldo.
- **Esfuerzo esperado:** de 6 a 8 horas de trabajo, dentro de un plazo de 7 días naturales. No se busca una aplicación lista para producción.
- **Entrega parcial:** se admite. Debe declararse con claridad qué se terminó, qué quedó pendiente y cómo se continuaría. **Una discrepancia entre lo declarado como terminado y el código se penaliza.**

## Requisitos funcionales

### Registro e inicio de sesión

| ID    | Requisito                                                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| RF-01 | Registrar un usuario con nombre completo, correo, contraseña y confirmación de contraseña.                                          |
| RF-02 | El formulario valida lo necesario y no pide ni procesa archivos adjuntos.                                                           |
| RF-03 | Una vez registrado, el usuario accede a la aplicación.                                                                              |
| RF-04 | El usuario puede cerrar sesión.                                                                                                     |
| RF-05 | El usuario puede volver a iniciar sesión con su correo y su contraseña.                                                             |
| RF-06 | La información se conserva al recargar la página.                                                                                   |
| RF-07 | El dashboard solo es accesible con una sesión activa.                                                                               |
| RF-08 | El usuario empieza con saldo de $0.                                                                                                 |
| RF-09 | El registro y el login son una simulación local. **El tratamiento y almacenamiento de la contraseña forma parte de la evaluación.** |

Fuera de alcance: recuperar la contraseña, verificar el correo y administrar varios usuarios.

### Dashboard

| ID    | Requisito                                                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-10 | Muestra el nombre del usuario registrado.                                                                                                                         |
| RF-11 | Muestra el saldo actual.                                                                                                                                          |
| RF-12 | Gráfica tipo donut con las apuestas ganadas y perdidas (datos simulados).                                                                                         |
| RF-13 | Gráfica de barras con las victorias de cada caracol durante un día simulado: 6 caracoles con nombre libre, 6 carreras al día, y datos coherentes con esas reglas. |
| RF-14 | Opción para cargar saldo mediante SnailPay.                                                                                                                       |
| RF-15 | Opción para cerrar sesión.                                                                                                                                        |

Fuera de alcance: una sección para apostar y la lógica para correr carreras. La organización visual del dashboard es libre.

### SnailPay (servicio simulado en Express)

| ID    | Requisito                                                                                                                                                                                                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-16 | SnailPay es un mock de pasarela de pagos construido en Express. No se conecta a servicios reales ni procesa información financiera real.                                                                                                                                            |
| RF-17 | La recarga pide por API: número de tarjeta, fecha de vencimiento, CVV, nombre completo y monto. También usa el identificador y el correo del usuario registrado.                                                                                                                    |
| RF-18 | **Cobro exitoso** con tarjeta `1234123412341234`, vencimiento `12/26`, CVV `543`, cualquier nombre no vacío y cualquier monto válido mayor que cero.                                                                                                                                |
| RF-19 | Si el cobro es exitoso, el saldo aumenta en el monto, se guarda en LocalStorage, el dashboard lo muestra de inmediato y se informa claramente que la operación fue aprobada.                                                                                                        |
| RF-20 | **Errores de transacción:** uno o más escenarios definidos por el proyecto (datos inválidos, tarjeta rechazada u otros), con qué datos los provocan y un `status_detail` útil.                                                                                                      |
| RF-21 | **Error del sistema:** existe una forma documentada de simular que SnailPay tiene un problema interno. Mientras dura, no se aprueba ni se aplica ninguna recarga.                                                                                                                   |
| RF-22 | Toda respuesta (éxito, error de transacción y error del sistema) contiene `id`, `status`, `status_detail`, `transaction_amount`, `date_created`, `authorization_code` (cuando aplica), `reference`, `payer_id` y `payer_email`, con valores y formatos consistentes y documentados. |
| RF-23 | Si la operación no es exitosa, el saldo no cambia, el usuario recibe un mensaje comprensible y nunca se genera un falso cobro exitoso.                                                                                                                                              |
| RF-24 | El número de tarjeta y el CVV se incluyen en las respuestas del servicio, se guardan en LocalStorage y siempre son datos ficticios.                                                                                                                                                 |

## Requisitos no funcionales

| ID     | Requisito                                                                                                                                                                                                                   |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | TypeScript en el frontend y en el backend.                                                                                                                                                                                  |
| RNF-02 | Interfaz clara, consistente y utilizable. No se pide alta fidelidad, pero una app sin trabajo de diseño baja la calificación.                                                                                               |
| RNF-03 | Se documenta qué plantilla, librería o herramienta de UI se usó, qué partes se generaron o se tomaron como base y qué partes se adaptaron o construyeron a mano.                                                            |
| RNF-04 | Se documenta el uso de IA: herramientas, para qué, qué partes apoyaron y cuál fue el proceso de trabajo.                                                                                                                    |
| RNF-05 | Buenas prácticas visibles en la organización, la separación de responsabilidades, los nombres, el tipado, las validaciones, el manejo de estados y errores, la seguridad, la legibilidad, el uso de git y la documentación. |
| RNF-06 | Pruebas automatizadas. Se evalúa qué se decidió probar, por qué y la capacidad de explicarlo.                                                                                                                               |
| RNF-07 | Manejo de respuestas del API, de errores y de **timeout**.                                                                                                                                                                  |
| RNF-08 | Ni el repositorio ni el código contienen nombres, logotipos, enlaces o referencias que identifiquen a la organización que encarga el proyecto.                                                                              |

## Requisitos mínimos de validez

Sin esto la entrega no es válida: una aplicación funcional que permita **(1)** registrar un usuario con correo y contraseña, **(2)** cerrar la sesión, **(3)** iniciar sesión otra vez con esos datos y **(4)** acceder a una pantalla posterior al inicio de sesión.

## Entregables

| ID   | Entregable                                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E-01 | Documento de respuesta en PDF: Arial 10, interlineado estándar, máximo 4 páginas (5 con un adicional y 6 con los dos). Sin código, sin fragmentos de código y sin capturas. |
| E-02 | Instrucciones para ejecutar el frontend y el backend.                                                                                                                       |
| E-03 | Instrucciones para ejecutar las pruebas.                                                                                                                                    |
| E-04 | Información para reproducir cada respuesta simulada de SnailPay.                                                                                                            |
| E-05 | Enlace a un repositorio público de GitHub llamado `[primer-nombre]-[4 dígitos aleatorios]`: **`luis-2036`**.                                                                |

El PDF incluye: resumen del proceso, decisiones principales, herramientas y librerías, uso de IA y cómo se validó, pruebas y por qué se eligieron, funcionalidades terminadas, funcionalidades incompletas o problemas conocidos, tiempo aproximado y enlace al repositorio.

## Adicionales opcionales

| ID    | Adicional                                                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AD-01 | **Aplicación desplegada:** URL pública, plataforma, explicación breve de la implementación y limitaciones. Se revisa sin pedir credenciales adicionales. |
| AD-02 | **Propuesta de base de datos:** qué se almacena, entidades y relaciones, tecnología y cambios en el frontend y el backend. No se implementa.             |
