ALTER TABLE lgq_action_tasks
  ADD COLUMN quantity_key varchar(50) DEFAULT NULL;

UPDATE lgq_action_tasks
SET quantity_key = 'area_m2'
WHERE code IN ('DEMOLICION_GENERAL', 'ROZAS_REMO', 'LIMPIEZA_FINAL', 'ELECTRICA_GENERAL', 'FONT_GENERAL');

UPDATE lgq_action_tasks
SET quantity_key = 'kitchen_m2'
WHERE code IN ('ALICATADO_COCINA');

UPDATE lgq_action_tasks
SET quantity_key = 'kitchens_count'
WHERE code IN ('FONT_COCINA', 'ELEC_COCINA', 'MUEBLES_COCINA');

UPDATE lgq_action_tasks
SET quantity_key = 'bathroom_m2'
WHERE code IN ('ALICATADO_BANO');

UPDATE lgq_action_tasks
SET quantity_key = 'bathrooms_count'
WHERE code IN ('FONT_BANO', 'SANITARIOS', 'ELEC_BANO');

UPDATE lgq_action_tasks
SET quantity_key = 'walls_m2'
WHERE code IN ('DEMOLER_TABIQUES', 'LEVANTAR_TABIQUES');

UPDATE lgq_action_tasks
SET quantity_key = 'paint_walls_m2'
WHERE code IN ('PINTURA_PAREDES', 'PREPARACION');

UPDATE lgq_action_tasks
SET quantity_key = 'paint_ceilings_m2'
WHERE code IN ('PINTURA_TECHOS');

UPDATE lgq_action_tasks
SET quantity_key = 'climate_units'
WHERE code IN ('AIRE_ACOND', 'CALEFACCION');
