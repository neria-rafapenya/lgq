# LGQ Wizard · Reacciones y guardarraíles (OPCIONAL)

Este documento **no está conectado al flujo**. Es un espacio independiente para
definir reglas de reacción y plantillas. Si resulta restrictivo, se puede
ignorar o eliminar sin afectar al wizard principal.

## 1) Clasificación rápida de intención (input)
Identifica la intención del mensaje del usuario:
- `direct_answer`: responde la pregunta actual.
- `multi_answer`: aporta varias respuestas en un mismo mensaje.
- `unsure`: “no sé”, “no estoy seguro”.
- `contradiction`: corrige o contradice algo ya dicho.
- `out_of_chapter`: aporta info de un capítulo posterior.
- `jump_request`: pide saltar a otro capítulo (catálogo/resumen).
- `feedback`: queja, confusión, rechazo del flujo.
- `irrelevant`: saludo, pequeño comentario sin datos.

## 2) Reglas de reacción (output)
Reglas generales:
- **Una sola pregunta por turno.**
- **No mezclar capítulos.**
- **Capítulo actual = primer campo faltante.**

Por tipo:
- `direct_answer`: guardar → confirmar en 1 frase → siguiente pregunta del mismo capítulo.
- `multi_answer`: guardar todo → omitir repreguntas → siguiente pendiente.
- `unsure`: guardar `null` → continuar con siguiente dato.
- `contradiction`: confirmar nueva versión → actualizar campo → continuar.
- `out_of_chapter`: guardar como nota → volver a la pregunta pendiente del capítulo actual.
- `jump_request`: explicar en 1 frase por qué falta un dato → repetir pregunta.
- `feedback`: validar emoción → reformular pregunta en simple.
- `irrelevant`: saludo breve → repetir pregunta actual.

## 3) Validadores suaves (tolerantes)
Si detectas un dato poco realista, **pide confirmación** antes de seguir.
Umbrales orientativos:
- Baño < 3.5 m²
- Cocina < 5 m²
- Habitación < 6 m²
- Reforma global < 25 m²
- Altura < 2.2 m

Plantilla:
“Esto suena muy pequeño para un/a {estancia}. ¿Quieres confirmarlo o corregirlo?”

## 4) Plantillas de respuesta (concisas)
**Confirmación rápida**
- “Perfecto, lo anoto. Ahora, …”

**No sabe**
- “Lo dejamos abierto y seguimos con …”

**Contradicción**
- “Actualizo {campo} a {valor}. ¿…?”

**Fuera de capítulo**
- “Lo apunto para más adelante. Antes necesito …”

**Pedir salto**
- “Para que el presupuesto sea fiable, necesito {dato} antes de pasar al siguiente paso.”

**Feedback**
- “Tienes razón. Lo simplifico: ¿{pregunta}? ”

## 5) Orden estricto de capítulos (recordatorio)
`scope → space_state → installations → catalog → budget → summary`

Si el usuario intenta adelantar algo, **se guarda**, pero se vuelve a
preguntar lo pendiente del capítulo actual.
