-- Ajustes finos de tiempos base
UPDATE lgq_action_tasks SET base_rate_hours = 7.50 WHERE id = 3008; -- montaje muebles cocina
UPDATE lgq_action_tasks SET base_rate_hours = 3.50 WHERE id = 3011; -- sanitarios
UPDATE lgq_action_tasks SET base_rate_hours = 0.85 WHERE id = 3005; -- alicatado cocina
UPDATE lgq_action_tasks SET base_rate_hours = 0.85 WHERE id = 3009; -- alicatado baño
UPDATE lgq_action_tasks SET base_rate_hours = 0.55 WHERE id = 3017; -- preparación pintura

-- Sub-actuaciones específicas (mover desagüe lavadora, puntos eléctricos, etc.)
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3401, 2, 'MOVE_WASHER_DRAIN_PLUMB', 'Mover desagüe lavadora (fontanería)', 'unit', 3.00, 'fontanero', 'move_washer_drain', '2026-04-02 09:00:00'),
(3402, 2, 'MOVE_WASHER_DRAIN_MASON', 'Mover desagüe lavadora (albañilería)', 'unit', 2.00, 'albanil', 'move_washer_drain', '2026-04-02 09:00:00'),
(3403, 2, 'NEW_LIGHT_POINTS', 'Nuevos puntos de luz', 'unit', 0.80, 'electricista', 'new_light_points', '2026-04-02 09:00:00'),
(3404, 2, 'NEW_OUTLETS', 'Nuevos enchufes', 'unit', 0.60, 'electricista', 'new_outlets', '2026-04-02 09:00:00'),
(3405, 3, 'NEW_LIGHT_POINTS_BATH', 'Nuevos puntos de luz baño', 'unit', 0.80, 'electricista', 'bath_light_points', '2026-04-02 09:00:00'),
(3406, 3, 'NEW_OUTLETS_BATH', 'Nuevos enchufes baño', 'unit', 0.60, 'electricista', 'bath_outlets', '2026-04-02 09:00:00'),
(3407, 1, 'NEW_LIGHT_POINTS_GEN', 'Nuevos puntos de luz (general)', 'unit', 0.80, 'electricista', 'new_light_points', '2026-04-02 09:00:00'),
(3408, 1, 'NEW_OUTLETS_GEN', 'Nuevos enchufes (general)', 'unit', 0.60, 'electricista', 'new_outlets', '2026-04-02 09:00:00');

-- Mover cocina / baño en reforma integral
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3601, 1, 'MOVE_KITCHEN_PLUMB', 'Mover cocina (fontanería)', 'unit', 10.00, 'fontanero', 'move_kitchen', '2026-04-02 09:00:00'),
(3602, 1, 'MOVE_KITCHEN_ELEC', 'Mover cocina (electricidad)', 'unit', 8.00, 'electricista', 'move_kitchen', '2026-04-02 09:00:00'),
(3603, 1, 'MOVE_KITCHEN_MASON', 'Mover cocina (albañilería)', 'unit', 8.00, 'albanil', 'move_kitchen', '2026-04-02 09:00:00'),
(3611, 1, 'MOVE_BATH_PLUMB', 'Mover baño (fontanería)', 'unit', 10.00, 'fontanero', 'move_bathroom', '2026-04-02 09:00:00'),
(3612, 1, 'MOVE_BATH_ELEC', 'Mover baño (electricidad)', 'unit', 6.00, 'electricista', 'move_bathroom', '2026-04-02 09:00:00'),
(3613, 1, 'MOVE_BATH_MASON', 'Mover baño (albañilería)', 'unit', 8.00, 'albanil', 'move_bathroom', '2026-04-02 09:00:00');

-- Ventilaciones (acción instalaciones)
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3501, 6, 'VENT_GRILLES', 'Instalación rejillas/tomas de aire', 'unit', 1.00, 'instalador', 'vent_grilles_count', '2026-04-02 09:00:00'),
(3502, 6, 'VENT_CHIMNEYS', 'Instalación salidas de humos', 'unit', 2.50, 'instalador', 'vent_chimney_count', '2026-04-02 09:00:00');

-- Reglas adicionales de modulación
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
-- Tipo de pared
(3013, 'wall_type', 'brick', 1.10, '2026-04-02 09:00:00'),
(3014, 'wall_type', 'brick', 1.10, '2026-04-02 09:00:00'),
(3013, 'wall_type', 'pladur', 0.85, '2026-04-02 09:00:00'),
(3014, 'wall_type', 'pladur', 0.85, '2026-04-02 09:00:00'),
(3013, 'wall_type', 'load_bearing', 1.40, '2026-04-02 09:00:00'),
(3014, 'wall_type', 'load_bearing', 1.25, '2026-04-02 09:00:00'),

-- Material de suelo
(3101, 'floor_material', 'microcemento', 1.30, '2026-04-02 09:00:00'),
(3201, 'floor_material', 'microcemento', 1.30, '2026-04-02 09:00:00'),
(3301, 'floor_material', 'microcemento', 1.30, '2026-04-02 09:00:00'),
(3101, 'floor_material', 'parquet', 1.10, '2026-04-02 09:00:00'),
(3201, 'floor_material', 'parquet', 1.10, '2026-04-02 09:00:00'),
(3301, 'floor_material', 'parquet', 1.10, '2026-04-02 09:00:00'),
(3101, 'floor_material', 'laminado', 0.90, '2026-04-02 09:00:00'),
(3201, 'floor_material', 'laminado', 0.90, '2026-04-02 09:00:00'),
(3301, 'floor_material', 'laminado', 0.90, '2026-04-02 09:00:00'),

-- Desagües (si se renuevan de forma completa)
(3006, 'drain_scope', 'full', 1.20, '2026-04-02 09:00:00'),
(3010, 'drain_scope', 'full', 1.20, '2026-04-02 09:00:00'),
(3019, 'drain_scope', 'full', 1.20, '2026-04-02 09:00:00');
