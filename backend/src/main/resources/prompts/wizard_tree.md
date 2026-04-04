# LGQ Wizard · Árbol básico de decisión (OPCIONAL)

Este árbol es una **guía prioritaria** para evitar preguntas redundantes.
Si entra en conflicto con el wizard principal, **respeta el orden de capítulos**.

## 1) scope
1. Pregunta si la reforma es **integral** o **parcial**.
2. Pregunta **qué espacios** se reforman: baño, cocina, otra habitación o global.
3. Si es global, asume todas las estancias principales.

## 2) space_state
1. Área (m²) → altura → plano de distribución → tipo de pared → demolición necesaria.
2. Estados (bueno/regular/malo) **solo** de las instalaciones relevantes.
   - Si el usuario ya indicó algo como “**solo desagüe lavadora**”, **no** preguntes por electricidad ni calefacción.
   - Si solo hay desagüe/agua, pide estado de **fontanería** y **saneamiento**, y omite electricidad.
3. Si el usuario da datos de instalaciones fuera de capítulo, **guárdalos** y sigue con lo pendiente del estado actual.

## 3) installations
1. Pregunta única: “¿Quieres incluir **fontanería**, **electricidad** y/o **calefacción**?”
2. Si responde **ninguna**:
   - Marca renovaciones como `none`.
   - Salta a **catálogo**.
   - En mano de obra incluye al menos **albañil**.
3. Si incluye **fontanería**:
   - Pregunta alcance (completa/parcial/ninguna).
   - Pregunta por **desagües/saneamiento**.
4. Si incluye **electricidad**:
   - Pregunta alcance (completa/parcial/sin cambios).
   - Pregunta por **puntos de luz/enchufes**.
5. Si incluye **calefacción**:
   - Pregunta tipo de calefacción y si hay sistema existente.

Nota de alcance:
- Si el usuario pide **mover/desviar un desagüe** (p. ej. lavadora), anota que
  eso implica **horas de fontanero + albañil** (rozas, sellado y remates).
- Si ya indicó ese alcance, **no repitas** la pregunta de desagües: asume **parcial**
  y continúa con el siguiente bloque.

## 4) catalog
1. Solo muestra categorías de **estancias mencionadas**.
2. Si el usuario quiere propuesta LGQ → muestra **mosaico de catálogo**.
3. Si compra por su cuenta → marca como `custom`.
4. Pregunta por **baldosas/rajolas** (baño/cocina) y **suelo** y ofrece modelos del catálogo.
5. Pregunta por **carpintería** (puertas, marcos, ventanas) y ofrece modelos del catálogo.
6. Pregunta por **pintura** y ofrece colores/acabados del catálogo (o pide preferencias si no hay items).

## 5) budget
1. Mano de obra y extras operativos.
2. **Licencias** en pregunta separada.
3. Margen y contingencia al final.
4. Limpieza final **siempre incluida**: 1 h / 4 m².

## 6) summary
1. Resumen breve por capítulos.
2. Pide siguiente paso: revisar materiales o calcular presupuesto.
