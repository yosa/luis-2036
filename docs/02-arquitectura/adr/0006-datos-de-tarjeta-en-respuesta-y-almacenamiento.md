# ADR 0006 — Número de tarjeta y CVV en la respuesta y en LocalStorage

- **Estado**: Propuesto
- **Fecha**: 2026-09-28
- **Decide**: Luis Heredia
- **Reemplaza**: —

## Contexto

El alcance exige que el número de tarjeta y el CVV **vengan en las respuestas del servicio**, **se guarden en LocalStorage** y **siempre sean ficticios**. En un sistema real las dos cosas estarían prohibidas:
- PCI DSS prohíbe guardar el CVV después de la autorización, incluso cifrado.
- El número de tarjeta solo puede guardarse protegido, y debe mostrarse truncado.

Hay que cumplir el alcance sin normalizar una práctica insegura y sin exponer más de lo necesario.

## Decisión

1. **Se cumple el requisito tal cual**: `card_number` y `cvv` vienen en toda respuesta de cobro y el registro completo del cobro se guarda en LocalStorage.
2. **Se limita la exposición en todo lo demás**:
   - la interfaz muestra el número **enmascarado** (`•••• 1234`) y **nunca** vuelve a mostrar el CVV;
   - los logs del API redactan `card_number`, `cvv` y `holder_name`;
   - el formulario de recarga no conserva los datos de la tarjeta después de enviarlos.
3. **Solo se usan datos ficticios**: los números de prueba documentados. La interfaz lo recuerda con un aviso junto al formulario.
4. **Queda escrito el contraste con producción** (ver abajo), para que la decisión no se lea como una práctica recomendada.

## Consecuencias

**Positivas**: se cumple el requisito, la exposición visual y en logs es mínima y la desviación respecto a una práctica real queda explícita.

**Negativas / costos**: LocalStorage conserva un PAN y un CVV legibles por cualquier script de la página. Se acepta solo porque los datos son ficticios y lo pide el alcance.

## Cómo sería en producción

- La tarjeta se **tokeniza en el navegador** con el SDK de la pasarela (campos alojados o un iframe), y el comercio nunca ve el PAN ni el CVV.
- El backend guarda solo el **token**, la marca y los **últimos 4 dígitos**. El CVV no se guarda nunca.
- La respuesta del cobro trae el PAN truncado (`last_four_digits`) y ningún CVV.

## Alternativas evaluadas

| Opción | Pros | Contras | Veredicto |
|---|---|---|---|
| **Cumplir el requisito y limitar la exposición** | Cumple el alcance con el menor riesgo posible dentro de él | Datos sensibles (ficticios) en LocalStorage | ✅ |
| Guardar el PAN enmascarado y omitir el CVV | Correcto según PCI | Incumple un requisito explícito | Descartado |
| Cifrar en LocalStorage con una llave del bundle | Parece más seguro | Es teatro: la llave está en el mismo bundle | ❌ |
