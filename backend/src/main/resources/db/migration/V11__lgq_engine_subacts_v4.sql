-- Sub-actuaciones extra
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(4001, 3, 'WATERPROOF_BATH', 'Impermeabilización baño', 'm2', 0.50, 'albanil', 'waterproof_bath_m2', '2026-04-02 09:00:00'),
(4002, 1, 'FLOOR_LEVELING', 'Nivelación suelo (integral)', 'm2', 0.30, 'albanil', 'floor_level_m2', '2026-04-02 09:00:00'),
(4003, 2, 'FLOOR_LEVELING_K', 'Nivelación suelo cocina', 'm2', 0.30, 'albanil', 'kitchen_floor_level_m2', '2026-04-02 09:00:00'),
(4004, 3, 'FLOOR_LEVELING_B', 'Nivelación suelo baño', 'm2', 0.30, 'albanil', 'bathroom_floor_level_m2', '2026-04-02 09:00:00'),
(4005, 1, 'INSULATION_WALLS', 'Aislamiento paredes', 'm2', 0.40, 'albanil', 'insulation_m2', '2026-04-02 09:00:00'),
(4006, 6, 'MOVE_WATER_POINTS', 'Mover puntos de agua', 'unit', 1.50, 'fontanero', 'move_water_points', '2026-04-02 09:00:00'),
(4007, 6, 'MOVE_ELEC_POINTS', 'Mover puntos eléctricos', 'unit', 1.00, 'electricista', 'move_elec_points', '2026-04-02 09:00:00'),
(4008, 7, 'FLOOR_HEATING', 'Instalación suelo radiante', 'm2', 0.60, 'instalador', 'floor_heating_m2', '2026-04-02 09:00:00');

-- Reglas específicas adicionales
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
(4001, 'bath_shower_change', 'yes', 1.20, '2026-04-02 09:00:00'),
(4002, 'floor_material', 'microcemento', 1.15, '2026-04-02 09:00:00'),
(4003, 'floor_material', 'microcemento', 1.15, '2026-04-02 09:00:00'),
(4004, 'floor_material', 'microcemento', 1.15, '2026-04-02 09:00:00'),
(4005, 'insulation_type', 'acoustic', 1.15, '2026-04-02 09:00:00'),
(4005, 'insulation_type', 'thermal', 1.10, '2026-04-02 09:00:00');
