# LGQ Engine · Mapa de claves para el LLM

Este mapa indica qué **claves** debe escribir el LLM en `answers_json` para que el motor calcule tiempos y costes.

## 0) Datos base (base/rooms/space)
- `base.ownership`: `owned | rented`
- `base.ceiling_height_m`: altura de techo en metros.
- `base.windows_count`: nº ventanas totales.
- `rooms[]`: listado de estancias (solo integral) con:
  - `name`, `length_m`, `width_m`, `area_m2`
- `space`: recinto único (no integral) con:
  - `length_m`, `width_m`, `area_m2`
- `quantities.area_m2`: suma total de m² (rooms o space).

## 1) Selección de actuación principal
- `action_id`: id de la tabla `lgq_actions`.
- Si es **Reforma integral completa**, el motor expandirá automáticamente todas las sub‑actuaciones.

## 2) Cantidades (quantities)

> Usar `answers_json.quantities` para todas estas claves. Todas admiten `0`.

### Global
- `area_m2`: m² totales de vivienda
- `floor_m2`: m² de suelo a colocar (integral)
- `floor_remove_m2`: m² de suelo a retirar (integral)
- `floor_level_m2`: m² de nivelación suelo (integral)
- `paint_total_m2`: m² a pintar total (integral)
- `doors_count`: nº puertas generales
- `door_frames_count`: nº marcos de puerta
- `sliding_pocket_doors_count`: nº puertas correderas empotradas
- `windows_count`: nº ventanas generales
- `electric_m2`: m² de instalación eléctrica general
- `plumbing_m2`: m² de instalación fontanería general
- `new_light_points`: nº puntos de luz nuevos (general)
- `new_outlets`: nº enchufes nuevos (general)
- `insulation_m2`: m² de aislamiento de paredes
- `enclosure_m2`: m² de cerramiento especial (terraza/patio)

### Redistribución / obra civil
- `walls_m2`: m² de tabiques a demoler/levantar
- `openings_count`: nº huecos a abrir (puertas/ventanas)
- `closures_count`: nº huecos a cerrar
- `false_ceiling_m2`: m² de falso techo

### Instalaciones
- `panel_change`: 0/1 cambio de cuadro eléctrico
- `chasing_m2`: m² de rozas/canalización
- `drain_points`: nº puntos de desagüe nuevos
- `move_water_points`: nº puntos de agua a mover
- `move_elec_points`: nº puntos eléctricos a mover

### Cocina
- `kitchens_count`: nº de cocinas
- `kitchen_m2`: m² de cocina
- `kitchen_floor_m2`: m² de suelo cocina
- `kitchen_floor_level_m2`: m² de nivelación suelo cocina
- `countertop_ml`: metros lineales de encimera
- `appliances_count`: nº electrodomésticos
- `sinks_count`: nº fregaderos
- `faucets_count`: nº grifos
- `kitchen_doors_count`: nº puertas cocina
- `kitchen_windows_count`: nº ventanas cocina
- `move_washer_drain`: 0/1 si se mueve desagüe lavadora
- `hood_install`: 0/1 instalación campana

### Baño
- `bathrooms_count`: nº de baños
- `bathroom_m2`: m² de baño
- `bathroom_floor_m2`: m² suelo baño
- `bathroom_floor_level_m2`: m² de nivelación suelo baño
- `bath_faucets_count`: nº grifos baño
- `bath_accessories_count`: nº accesorios baño
- `bath_shower_change`: 0/1 cambio bañera <-> ducha
- `waterproof_bath_m2`: m² de impermeabilización
- `bath_doors_count`: nº puertas baño
- `bath_windows_count`: nº ventanas baño
- `bath_light_points`: nº puntos de luz baño
- `bath_outlets`: nº enchufes baño
- `screen_install`: 0/1 instalación mampara

### Pintura
- `paint_walls_m2`: m² paredes a pintar
- `paint_ceilings_m2`: m² techos a pintar

### Ventilación
- `vent_grilles_count`: nº rejillas/tomas aire
- `vent_chimney_count`: nº salidas de humos

### Climatización
- `climate_units`: nº equipos / unidades
- `floor_heating_m2`: m² de suelo radiante

## 3) Factores (factors)

> Usar `answers_json.factors`.

- `layout_changes`: `yes/no`
- `plumbing_scope`: `partial/full`
- `electrical_scope`: `partial/full`
- `drain_scope`: `full`
- `paint_finish`: `estucado | patina | pistola | liso | efecto_cemento | efecto_oxido | efecto_marmol | efecto_arena | veladuras | esponjado | grafiado | encalado | stencil | microcemento`
- `remove_gotele`: `yes/no`
- `ceiling_height_class`: `high`
- `tile_format`: `mosaico | grande | pequeno`
- `floor_method`: `remove | overlay`
- `floor_material`: `microcemento | parquet | laminado | gres | porcelanico | vinilico | marmol`
- `door_type`: `corredera | blindada | abatible | corredera_empotrada`
- `wall_type`: `brick | pladur | load_bearing`
- `window_type`: `rpte | standard`
- `insulation_type`: `acoustic | thermal`
- `enclosure_material`: `aluminio | pvc | cristal`

## 4) Ejemplo mínimo

```json
{
  "action_id": 1,
  "quantities": {
    "area_m2": 85,
    "floor_m2": 85,
    "floor_remove_m2": 85,
    "paint_total_m2": 220,
    "doors_count": 6,
    "windows_count": 5,
    "new_light_points": 8,
    "new_outlets": 12
  },
  "factors": {
    "layout_changes": "yes",
    "plumbing_scope": "full",
    "electrical_scope": "full",
    "paint_finish": "liso",
    "floor_method": "remove",
    "floor_material": "gres"
  }
}
```

## 5) Cómo impactan
- Cada tarea suma `base_rate_hours * quantity`.
- Si hay reglas que coincidan con los factores, se aplica el multiplicador.
- Las horas alimentan `lgq_project_labor` y el total.

## 6) Reglas para calcular cantidades de materiales (catálogo)
Usar estas reglas **solo para sugerencias** al usuario en el detalle del producto.

### Baldosas / alicatados / suelos
- Si la variante tiene `size_x_cm` y `size_y_cm`:
  - `area_pieza_m2 = (size_x_cm * size_y_cm) / 10000`
  - `piezas = ceil((superficie_m2 / area_pieza_m2) * 1.10)`  *(10% merma)*
- `superficie_m2`:
  - Suelo: `space.area_m2` o suma `rooms[].area_m2`.
  - Paredes: si hay largo/ancho y altura:
    - `perimetro = 2 * (length_m + width_m)`
    - `paredes_m2 = perimetro * base.ceiling_height_m`
    - restar huecos: `windows_count * 1.2 m2` (aprox).

### Pintura
- Si no hay rendimiento específico del producto, usar:
  - `rendimiento = 10 m2/l`
  - `manos = 2`
  - `litros = ceil((superficie_m2 / rendimiento) * manos * 1.10)`
