# 🧠 Motor de cálculo de presupuesto (SQL + lógica backend)

## 🎯 Objetivo

Implementar un **motor de cálculo de presupuesto** basado en una base de datos relacional ya definida.

El sistema debe:

- Calcular el coste total de un proyecto
- Desglosar costes por categorías
- Aplicar margen y contingencia
- Integrarse con backend (NestJS)

---

## 🧱 Contexto de la base de datos

El sistema dispone de las siguientes tablas:

### Core
- projects

### Estado del proyecto
- project_space_state
- project_scope
- project_installations

### Selecciones del usuario
- project_material_selections
- project_equipment_selections

### Catálogo
- lineitem_materials
- lineitem_materials_variants
- subcategory_materials
- category_materials

### Costes adicionales
- project_labor
- project_extras

### Configuración
- project_location
- project_timeline
- project_financials

---

## ⚙️ Concepto clave

TOTAL = materiales + equipamiento + mano de obra + extras  
+ margen + contingencia

---

## 🧮 1. Cálculo de materiales

```sql
SELECT 
  SUM(pms.quantity * v.price) AS total_materials
FROM project_material_selections pms
JOIN lineitem_materials_variants v 
  ON pms.variant_id = v.id
WHERE pms.project_id = :projectId;
```

---

## 🧮 2. Cálculo de equipamiento

```sql
SELECT 
  SUM(pes.quantity * v.price) AS total_equipment
FROM project_equipment_selections pes
JOIN lineitem_materials_variants v 
  ON pes.variant_id = v.id
WHERE pes.project_id = :projectId;
```

---

## 🧮 3. Desglose por categorías

```sql
SELECT 
  c.name AS category,
  SUM(pms.quantity * v.price) AS total
FROM project_material_selections pms
JOIN lineitem_materials li ON pms.lineitem_id = li.id
JOIN subcategory_materials sc ON li.subcategory_id = sc.id
JOIN category_materials c ON sc.category_id = c.id
JOIN lineitem_materials_variants v ON pms.variant_id = v.id
WHERE pms.project_id = :projectId
GROUP BY c.name;
```

---

## 🧮 4. Mano de obra

```sql
SELECT 
  (masonry_hours * 25) +
  (plumbing_hours * 30) +
  (electrical_hours * 28) +
  (carpentry_hours * 27) +
  (installation_hours * 26) +
  (project_management_hours * 35)
AS total_labor
FROM project_labor
WHERE project_id = :projectId;
```

---

## 🧮 5. Extras

```sql
SELECT 
  (debris_removal * 300) +
  (municipal_permits * 500) +
  (dumpster_required * 200) +
  (protection_required * 150) +
  (final_cleaning * 100)
AS total_extras
FROM project_extras
WHERE project_id = :projectId;
```

---

## 💰 6. Total + margen + contingencia

```sql
SELECT 
  base_total,
  base_total * (1 + margin_percentage/100) AS total_with_margin,
  base_total * (1 + contingency_percentage/100) AS total_with_contingency
FROM (
  SELECT 
    SUM(pms.quantity * v.price) AS base_total
  FROM project_material_selections pms
  JOIN lineitem_materials_variants v 
    ON pms.variant_id = v.id
  WHERE pms.project_id = :projectId
) t
JOIN project_financials pf 
  ON pf.project_id = :projectId;
```

---

## 🧠 Lógica backend (NestJS)

```ts
class BudgetService {
  async calculateProjectBudget(projectId: number) {
    const materials = await this.getMaterials(projectId);
    const equipment = await this.getEquipment(projectId);
    const labor = await this.getLabor(projectId);
    const extras = await this.getExtras(projectId);
    const financials = await this.getFinancials(projectId);

    const base =
      materials + equipment + labor + extras;

    return {
      base,
      total:
        base *
        (1 + financials.margin / 100) *
        (1 + financials.contingency / 100),
    };
  }
}
```

---

## 🚀 Resultado esperado

```json
{
  "materials": 1200,
  "equipment": 800,
  "labor": 1500,
  "extras": 400,
  "base": 3900,
  "total": 5200
}
```

---

## 🎯 TL;DR

- La BBDD = datos
- El motor = lógica
- SQL = cálculo parcial
- Backend = orquestación final
