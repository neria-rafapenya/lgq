# LGQ Engine · Árbol lógico de preguntas (LLM)

Este árbol guía al LLM para construir `answers_json` con claves consistentes y calculables.

## Paso 1 · Preguntas base
1) Código postal y provincia (Cataluña) → `province` + validar CP.
2) Tipo de actuación principal (solo una):
   - integral, cocina, baño, redistribución, pintar, instalaciones, climatización
   - Guardar `action_id` según tabla `lgq_actions`.
3) Propiedad o alquiler:
   - `base.ownership = owned | rented`
4) Altura de techos (m) → `base.ceiling_height_m`
   - `factors.ceiling_height_class = high` si > 2.7m
5) Nº de ventanas → `base.windows_count`
6) Superficie a reformar:
   - Si **integral**: pedir estancias con **largo/ancho** y nombre.
     - Guardar en `rooms[]` con `name`, `length_m`, `width_m`, `area_m2`.
     - Sumar en `quantities.area_m2` el total de todas las estancias.
   - Si **no integral**: pedir largo/ancho del recinto.
     - Guardar en `space` con `length_m`, `width_m`, `area_m2`.
     - Guardar `quantities.area_m2` como área del recinto.
7) Distribución:
   - si hay cambios → `factors.layout_changes = yes`

## Paso 2 · Actuaciones (por acción)

### A) Reforma integral completa
- Preguntar nº puertas/ventanas → `doors_count`, `windows_count`
- ¿Puertas correderas empotradas? → `sliding_pocket_doors_count`
- Suelos: retirar o colocar encima → `factors.floor_method`
  - `floor_m2`, `floor_remove_m2`
  - si requiere nivelación → `floor_level_m2`
  - material → `factors.floor_material`
- Pintura: m² paredes/techos → `paint_total_m2`
  - tipo de acabado → `factors.paint_finish`
  - gotelé → `factors.remove_gotele = yes`
- Instalaciones generales:
  - Fontanería (partial/full) → `factors.plumbing_scope`
  - Electricidad (partial/full) → `factors.electrical_scope`
  - Si hay nuevos puntos → `new_light_points`, `new_outlets`
- Si se mueve cocina o baño:
  - `move_kitchen` / `move_bathroom` (0/1)
- Cerramientos especiales (terraza/patio):
  - `enclosure_m2`
  - `factors.enclosure_material`

### B) Cocina
- m² → `kitchen_m2`
- Suelo → `kitchen_floor_m2`
- Nivelación suelo → `kitchen_floor_level_m2`
- Encimera → `countertop_ml`
- Electrodomésticos → `appliances_count`
- Fregadero y grifería → `sinks_count`, `faucets_count`
- Puertas/ventanas → `kitchen_doors_count`, `kitchen_windows_count`
- Mover desagüe lavadora → `move_washer_drain`
- Campana/extractor → `hood_install`
- Puntos eléctricos → `new_light_points`, `new_outlets`

### C) Baño
- m² → `bathroom_m2`
- Suelo → `bathroom_floor_m2`
- Nivelación suelo → `bathroom_floor_level_m2`
- Grifería / accesorios → `bath_faucets_count`, `bath_accessories_count`
- Cambio bañera/ducha → `bath_shower_change`
- Impermeabilización → `waterproof_bath_m2` (normalmente igual a suelo)
- Mampara → `screen_install`
- Puntos eléctricos → `bath_light_points`, `bath_outlets`

### D) Redistribución
- Tabiques a demoler/levantar → `walls_m2`
- Abrir huecos → `openings_count`
- Cerrar huecos → `closures_count`
- Falso techo → `false_ceiling_m2`
- Tipo de pared → `factors.wall_type`

### E) Pintar
- Paredes / techos → `paint_walls_m2`, `paint_ceilings_m2`
- Acabado → `factors.paint_finish`
- Gotelé → `factors.remove_gotele = yes`

### F) Instalaciones
- Electricidad: scope → `factors.electrical_scope`
- Fontanería: scope → `factors.plumbing_scope`
- Desagües completos → `factors.drain_scope = full`
- Cambiar cuadro → `panel_change`
- Rozas → `chasing_m2`
- Nuevos puntos agua → `drain_points`
- Mover puntos agua/eléctricos → `move_water_points`, `move_elec_points`

### G) Climatización
- Suelo radiante → `floor_heating_m2`
- Aire/Calefacción → `climate_units`

## Paso 3 · Mano de obra (automático)
- No preguntar horas. El motor las calcula.
- Solo confirmar si hay condiciones especiales: paredes maestras, alturas altas, materiales complejos.

## Paso 4 · Calcular presupuesto
- Confirmar resumen de cantidades y factores.
- Llamar a `/api/lgq/projects/{projectId}/calculate`.

---

## Reglas de consistencia
- Si cantidad es 0 → no se añade coste.
- Si no hay factor, se usa multiplicador 1.
- Si acción es **integral**, se expanden sub‑actuaciones automáticamente.
