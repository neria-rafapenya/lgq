# Backend LGQ – Motor de Presupuestos

Este backend incorpora un motor de presupuestos orientado a reformas (LGQ) con catálogo, reglas de horas y generación de PDF. La lógica está diseñada para que el LLM recoja inputs y el sistema calcule materiales, tareas y mano de obra de forma consistente.

## Visión general (flujo en 4 pasos)

1. **Preguntas base**
   - Se recogen datos estructurados y se guardan en `lgq_project_base` (`city`, `province`, `answers_json`).
   - El JSON acepta claves directas y agrupadas bajo `quantities` y `factors` (ver prompts LGQ).

2. **Actuaciones**
   - El usuario selecciona **una** actuación principal (`lgq_actions`).
   - Si la actuación es `integral`, el motor expande automáticamente a todas las actuaciones activas.
   - Se guardan en `lgq_project_action_selections`.

3. **Mano de obra**
   - Cada actuación tiene **partidas** (`lgq_action_tasks`) con base de horas, unidad y oficio.
   - Las horas se ajustan por reglas (`lgq_task_rules`) y cantidades (`quantity_key` + inputs del usuario).
   - Se agrupan por oficio en `lgq_project_labor` usando tarifas (`lgq_professional_rates`).

4. **Cálculo final**
   - Se suman catálogo + mano de obra para el **subtotal**.
   - Se aplica IVA (21% fijo por ahora).
   - Se guarda en `lgq_project_budget` y se genera el PDF.

## Paquetes principales

- `com.lgq.budget.lgq.controller`
  - `LgqEngineController` expone los endpoints del motor.
- `com.lgq.budget.lgq.service`
  - `LgqEngineService` calcula tareas, horas y totales.
  - `LgqBudgetPdfService` genera el PDF con OpenPDF.
- `com.lgq.budget.lgq.repository`
  - Repositorios SQL (catálogo, acciones, proyectos).
- `com.lgq.budget.lgq.dto`
  - DTOs de respuesta/solicitud.

## Modelo de datos (tablas `lgq_*`)

- `lgq_catalogs` / `lgq_catalog_items` / `lgq_catalog_variants`
  - Catálogos `N1..N25` con ítems y variantes (material/calidad/precio).
  - Cada catálogo tiene **10 ítems de ejemplo** (dummy) con `image_url`.

- `lgq_actions`
  - Actuaciones principales (integral, cocina, baño, etc.).

- `lgq_action_tasks`
  - Partidas con `base_rate_hours`, `unit`, `role` y `quantity_key`.

- `lgq_task_rules`
  - Multiplicadores por condición (`factor_key` / `factor_value`).

- `lgq_professional_rates`
  - Tarifas por oficio (globales).

- `lgq_project_base`
  - Inputs base del proyecto + `answers_json`.

- `lgq_project_action_selections`
  - Selección de actuaciones por proyecto.

- `lgq_project_catalog_selections`
  - Ítems elegidos, variante, cantidad y precio unitario.

- `lgq_project_task_hours`
  - Resultado de horas por partida.

- `lgq_project_labor`
  - Horas y coste total por oficio.

- `lgq_project_extras`
  - Extras (escombros, contenedor, protección, limpieza final).

- `lgq_project_budget`
  - Subtotal, IVA y total.

## Reglas de cálculo

- **Cantidad**
  - Se obtiene desde `quantity_key` (p.ej. `area_m2`, `bathrooms_count`, `kitchens_count`).
  - Si no existe, se infiere por la unidad (m2, ml, unit).

- **Reglas por factores**
  - `lgq_task_rules` aplica multiplicadores cuando el usuario responde a factores.
  - Claves y valores están documentados para el LLM en:
    - `backend/src/main/resources/prompts/lgq_engine_tree.md`
    - `backend/src/main/resources/prompts/lgq_engine_mapping.md`

## Prompts LGQ

El prompt principal se combina en `PromptLibrary` y añade bloques LGQ:

- `wizard.md` (prompt base)
- `wizard_tree.md`
- `wizard_labor_estimates.md`
- `lgq_engine_tree.md`
- `lgq_engine_mapping.md`

El objetivo es que el LLM entregue **inputs estructurados** (cantidades y factores) que puedan convertirse en horas y partidas.

## Endpoints (LGQ)

- `GET /api/lgq/catalogs`
- `GET /api/lgq/catalogs/{code}`
- `GET /api/lgq/actions`
- `GET /api/lgq/projects/{projectId}/base`
- `PUT /api/lgq/projects/{projectId}/base`
- `PUT /api/lgq/projects/{projectId}/actions`
- `PUT /api/lgq/projects/{projectId}/catalog`
- `POST /api/lgq/projects/{projectId}/calculate`
- `GET /api/lgq/projects/{projectId}/budget/pdf`

## PDF de presupuesto

- Generación con **OpenPDF** (`com.lowagie`).
- Incluye:
  - Cabecera con logo `assets/lgq-logo.png` y datos de empresa.
  - Secciones: Catálogo, Partidas, Mano de obra, Totales.
  - Columnas: Cantidad, Precio, Importe.

## Migraciones relacionadas

- `V5__lgq_engine_schema.sql` – tablas LGQ.
- `V6__lgq_engine_seed.sql` – catálogos (N1..N25) e ítems dummy.
- `V7__lgq_task_quantities.sql` – `quantity_key`.
- `V8..V14` – reglas, subactuaciones y ampliación de catálogos.

## Notas clave

- IVA fijo al **21%**.
- Solo se admite **una actuación** principal; `integral` expande a todas.
- Las tarifas por oficio son globales y editables en `lgq_professional_rates`.

---

Si quieres ampliar el catálogo, reglas o actuaciones, se debe actualizar:
1. `lgq_catalogs` / `lgq_catalog_items` / `lgq_catalog_variants`.
2. `lgq_actions` / `lgq_action_tasks` / `lgq_task_rules`.
3. Prompts LGQ (`lgq_engine_tree.md` y `lgq_engine_mapping.md`).
