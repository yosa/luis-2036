# ADR 0005 — Simulación de errores de transacción, del sistema y de timeout

- **Estado**: Aceptado (2026-09-28)
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

El alcance deja al proyecto decidir **qué errores de transacción simular**. Además exige una **forma documentada de simular un error del sistema**, durante el cual no se aprueba ninguna recarga, y evalúa explícitamente el manejo de errores y de **timeout**. Quien evalúe debe poder reproducir cada caso desde la interfaz, también en la versión desplegada, donde no puede cambiar la configuración del servidor.

## Decisión

1. **Los escenarios se eligen por los datos de entrada**, con tarjetas "mágicas" ficticias, como hacen las pasarelas reales en sus entornos de prueba. La tabla completa y su orden de evaluación están en [`escenarios.md`](../../03-snailpay/escenarios.md).
2. **Errores de transacción simulados**:
   - datos inválidos (422 con `field_errors`)
   - fondos insuficientes
   - tarjeta bloqueada
   - tarjeta vencida
   - CVV incorrecto
   - vencimiento incorrecto
   - tarjeta desconocida
   - JSON malformado

   Todos cubren fallos que un usuario real puede provocar y que exigen un mensaje distinto.

3. **Error del sistema por dos vías**:
   - `SNAILPAY_OUTAGE=true` apaga el servicio completo. Es para probar en local y se aplica **antes** de validar, porque un servicio caído no valida.
   - La tarjeta `4000000000000503`, que funciona en la versión desplegada. `4000000000000500` simula una falla interna.
4. **Timeout real, no simulado en el cliente.** La tarjeta `4000000000000408` hace que SnailPay tarde 12 s, y el frontend corta a los 8 s (`AbortSignal.timeout`). Si alguien espera, la respuesta es 504 `processing_timeout`, **nunca** un aprobado. Así se prueba el camino completo del timeout en el navegador.
5. **La combinación de éxito se evalúa antes que el vencimiento**, para que `12/26` se siga aprobando después de diciembre de 2026 y el escenario obligatorio sea reproducible en cualquier fecha.
6. **Reloj inyectado** en el service: las pruebas fijan la fecha y verifican el vencimiento sin depender del día real.

## Consecuencias

**Positivas**:

- Cada escenario se reproduce con datos, desde la UI o con `curl`, local o desplegado.
- El timeout se prueba de punta a punta.
- Ningún escenario de fallo puede terminar en saldo acreditado.

**Negativas / costos**:

- El escenario de timeout ocupa una conexión 12 s. Se mitiga con rate limit.
- En Lambda, el timeout de la función debe ser mayor que 12 s ([ADR 0008](0008-despliegue.md)).

## Alternativas evaluadas

| Opción                                     | Pros                                                       | Contras                                                  | Veredicto                 |
| ------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------- |
| **Tarjetas mágicas + variable de entorno** | Reproducible local y desplegado; como las pasarelas reales | Hay que documentar la tabla                              | ✅                        |
| Solo variable de entorno                   | Simple                                                     | No se puede reproducir en la versión desplegada          | Descartado como única vía |
| Encabezado `X-Simulate`                    | Flexible                                                   | La UI no lo manda; quien evalúa necesitaría herramientas | Descartado                |
| Fallos aleatorios (p. ej. el 10 %)         | "Realista"                                                 | No es reproducible ni se puede probar                    | ❌                        |
| Timeout simulado solo en el cliente        | Rápido                                                     | No prueba la cancelación real de la petición             | Descartado                |

## Cómo quedó construido

- Tabla de escenarios como función pura, `resolveScenario(request, now)`, en [`scenarios.ts`](../../../api/src/modules/snailpay/createCharge/scenarios.ts), con el orden de evaluación documentado. Probada fila por fila en [`scenarios.test.ts`](../../../api/test/unit/scenarios.test.ts).
- La caída por `SNAILPAY_OUTAGE` se evalúa en el service **antes** de validar la solicitud.
- La demora del timeout se configura con `SNAILPAY_PROCESSING_DELAY_MS` (12 000 por defecto) y se inyecta como `sleep`, así que las pruebas no esperan. Verificado a mano: 504 tras la demora.
- Rate limit de 20 cobros por minuto por IP (`CHARGES_RATE_LIMIT_PER_MINUTE`).

## Pendientes

Ninguno. La colección de Postman con los 14 escenarios está en [`api/postman/`](../../../api/postman/README.md).
