# Estrategia de pruebas

> **Audiencia:** quien revisa las pruebas y quien las corre.
> **Propósito:** qué se prueba, **por qué se eligió** y cómo se ejecuta (RNF-06, E-03).
> **Estado:** estrategia propuesta; todavía no hay pruebas. Cada fila enlazará su archivo de prueba cuando exista.

## Criterio

Se prueba primero **lo que, si falla, hace daño y no se nota a simple vista**:

1. Acreditar saldo cuando no se debía, o no acreditarlo cuando sí.
2. Guardar la contraseña de forma débil, o dejar entrar con una contraseña incorrecta.
3. Que SnailPay responda algo distinto de lo documentado en un escenario.
4. Perder la sesión o el saldo al recargar la página.
5. Que las gráficas muestren datos incoherentes con sus reglas.

La apariencia no se prueba con pruebas automatizadas: se revisa a ojo y con el banco de pruebas en el navegador.

## Qué se prueba

| Área                            | Nivel                                  | Qué se verifica                                                                                                                                                                | Por qué                                                               |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| SnailPay: escenarios            | API, unit del service                  | Cada fila de [escenarios](../03-snailpay/escenarios.md) produce su `status`, su `status_detail` y su HTTP, en el orden de evaluación                                           | Es el contrato que se evalúa; una regresión aquí rompe la integración |
| SnailPay: forma de la respuesta | API, feature (supertest)               | Todas las respuestas traen los campos obligatorios con su formato, incluidos 400, 422 y 503; `authorization_code` solo en los aprobados                                        | RF-22                                                                 |
| SnailPay: vencimiento           | API, unit con reloj inyectado          | La tarjeta vencida se rechaza; la combinación de éxito se aprueba incluso después de 12/26                                                                                     | Evita un escenario que caduca solo                                    |
| SnailPay: caída simulada        | API, feature                           | Con `SNAILPAY_OUTAGE=true`, nada se aprueba                                                                                                                                    | RF-21                                                                 |
| Regla contra falsos éxitos      | Frontend, unit del store `wallet`      | Solo acredita con las cinco condiciones; no acredita dos veces el mismo `id`                                                                                                   | Es el riesgo más grave de la integración                              |
| Cliente HTTP                    | Frontend, unit                         | Timeout → `HttpTimeoutError`, sin red → `HttpNetworkError`, respuesta que no se puede interpretar → no acredita                                                                | RNF-07                                                                |
| Contraseña                      | Frontend, unit                         | El hash no contiene la contraseña; la misma sal da el mismo hash y otra sal da otro; el login falla con contraseña incorrecta y da el mismo mensaje para un correo inexistente | RF-09                                                                 |
| Persistencia                    | Frontend, unit                         | Una lectura corrupta vuelve al valor por defecto sin romper; la sesión vencida se descarta; cerrar sesión conserva el saldo                                                    | RF-06                                                                 |
| Datos de gráficas               | Frontend, unit                         | Seis carreras; la suma de las barras es 6; las apuestas ganadas coinciden con los ganadores; la misma semilla da los mismos datos                                              | RF-13                                                                 |
| Formularios                     | Frontend, componente (Testing Library) | Validaciones visibles por campo; submit deshabilitado en vuelo                                                                                                                 | RF-02                                                                 |
| Flujo mínimo                    | E2E (Cypress)                          | Registro → dashboard → logout → login → dashboard, y recarga aprobada que actualiza el saldo                                                                                   | Los mínimos de validez                                                |

Convenciones: los selectores van por rol, label o texto visible (sin `data-testid`); la red se intercepta y los services no se mockean; y el tiempo y los ids se inyectan.

## Cómo correrlas

> ⏳ Se completa con los comandos reales al terminar el scaffold.

```bash
npm test                         # todas las pruebas unitarias y de componente (api + frontend)
npm test --workspace api         # solo el API
npm test --workspace frontend    # solo el frontend
npm run test:e2e                 # E2E con Cypress contra el build
```
