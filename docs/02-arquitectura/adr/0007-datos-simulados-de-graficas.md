# ADR 0007 — Datos simulados y deterministas para las gráficas

- **Estado**: Aceptado (2026-09-28)
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

El dashboard muestra dos gráficas con datos **simulados**:

- un donut de apuestas ganadas y perdidas;
- barras con las victorias de cada caracol en un **día simulado de 6 carreras entre 6 caracoles**.

Los datos deben ser **coherentes con esas reglas**. No se construye una sección para apostar ni un motor de carreras.

## Decisión

1. **Un generador puro** (`lib/raceDay`) produce el día simulado a partir de una **semilla** que combina el `id` del usuario y la fecha local (`AAAA-MM-DD`). Usa un PRNG pequeño y determinista (mulberry32), no `Math.random`.
2. **Carreras**: para cada una de las 6 se elige un ganador entre los 6 caracoles. Las barras cuentan las victorias por caracol, y **la suma de las barras siempre es 6**.
3. **Apuestas**: el usuario apuesta en algunas de las carreras del mismo día (entre 3 y 6), por un caracol en cada una. Una apuesta **se gana si su caracol ganó esa carrera**. El donut se deriva de esas apuestas, así que **ganadas + perdidas ≤ 6** y cada resultado es consistente con las barras.
4. **Los mismos datos durante todo el día**, para el mismo usuario y también al recargar la página. Al día siguiente cambian. Como el resultado es reproducible, se puede probar.
5. **Seis caracoles con nombre fijo** en `constants/`: Rayo Baboso, Turbo Concha, Doña Lentitud, Flash Viscoso, Capitán Caparazón y La Veloz Babosa.

## Consecuencias

**Positivas**:

- La coherencia se puede probar como invariante: 6 carreras, un ganador por carrera, la suma de las barras es 6, y las apuestas ganadas coinciden con los ganadores.
- No hay nada que guardar.
- Una recarga no cambia las gráficas de forma arbitraria.

**Negativas / costos**:

- El donut tiene números pequeños (como máximo 6 apuestas). Se acepta por coherencia con el día simulado. La gráfica muestra cantidades y porcentaje.

## Alternativas evaluadas

| Opción                                                   | Pros                                  | Contras                                      | Veredicto  |
| -------------------------------------------------------- | ------------------------------------- | -------------------------------------------- | ---------- |
| **Generador determinista con semilla por usuario y día** | Coherente, reproducible y comprobable | Hay que escribir un PRNG pequeño             | ✅         |
| `Math.random` en cada render                             | Trivial                               | Cambia al recargar y no se puede probar      | ❌         |
| Datos fijos a mano (JSON)                                | Simple                                | No demuestra la regla y se ven igual siempre | Descartado |
| Donut sobre un historial de varios días                  | Números más grandes                   | Se desacopla del día que muestran las barras | Descartado |

## Cómo quedó construido

- [`lib/raceDay`](../../../frontend/src/lib/raceDay/raceDay.ts): PRNG mulberry32 con una semilla FNV-1a de `usuario:fecha local`. Las invariantes (6 carreras, suma 6, apuestas coherentes con los ganadores, determinismo) se prueban sobre 200 semillas en [`raceDay.test.ts`](../../../frontend/src/lib/raceDay/raceDay.test.ts).
- **Dona:** el alcance la pide. La guía de visualización usada recomienda un medidor para una proporción de dos partes, así que la dona lleva el porcentaje escrito en el centro, la leyenda con conteos, un tooltip y una vista de tabla. No depende del color.
- **Barras horizontales,** porque los nombres son largos. Es una sola serie, así que no lleva leyenda. Tienen el valor al final de cada barra y un tope mínimo para que un "0" no parezca un dato faltante. El resumen en texto anuncia al líder o el empate.
- **Colores ganadas/perdidas validados con script** (separación para daltonismo, luminosidad, croma y contraste) en los dos modos. El gris inicial para "perdidas" no pasaba el croma mínimo y se cambió por violeta, que además evita el par rojo/verde.
