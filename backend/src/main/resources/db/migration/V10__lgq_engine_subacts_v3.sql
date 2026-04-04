-- Sub-actuaciones adicionales (redistribución/obra civil)
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3701, 4, 'OPENING_WALL', 'Abrir hueco en pared', 'unit', 2.50, 'albanil', 'openings_count', '2026-04-02 09:00:00'),
(3702, 4, 'CLOSING_WALL', 'Cerrar hueco / tapiar', 'unit', 1.50, 'albanil', 'closures_count', '2026-04-02 09:00:00'),
(3703, 4, 'FALSE_CEILING', 'Falso techo', 'm2', 0.60, 'albanil', 'false_ceiling_m2', '2026-04-02 09:00:00');

-- Instalaciones específicas
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3801, 6, 'PANEL_CHANGE', 'Cambio cuadro eléctrico', 'unit', 3.00, 'electricista', 'panel_change', '2026-04-02 09:00:00'),
(3802, 6, 'CHASING_MASON', 'Rozas/canalización (albañilería)', 'm2', 0.25, 'albanil', 'chasing_m2', '2026-04-02 09:00:00'),
(3803, 6, 'CHASING_ELEC', 'Tendido cableado en rozas', 'm2', 0.15, 'electricista', 'chasing_m2', '2026-04-02 09:00:00'),
(3804, 6, 'DRAIN_POINTS', 'Nuevos puntos de desagüe', 'unit', 2.00, 'fontanero', 'drain_points', '2026-04-02 09:00:00');

-- Carpintería adicional
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3901, 1, 'DOOR_FRAMES', 'Cambio de marcos de puerta', 'unit', 0.80, 'carpintero', 'door_frames_count', '2026-04-02 09:00:00');

-- Cocina / baño extras
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3921, 2, 'HOOD_INSTALL', 'Instalación campana / salida humos', 'unit', 2.00, 'instalador', 'hood_install', '2026-04-02 09:00:00'),
(3922, 3, 'SCREEN_INSTALL', 'Instalación mampara', 'unit', 1.50, 'instalador', 'screen_install', '2026-04-02 09:00:00');

-- Reglas específicas
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
(3701, 'wall_type', 'load_bearing', 1.40, '2026-04-02 09:00:00'),
(3702, 'wall_type', 'load_bearing', 1.25, '2026-04-02 09:00:00'),
(3701, 'wall_type', 'brick', 1.10, '2026-04-02 09:00:00'),
(3702, 'wall_type', 'brick', 1.10, '2026-04-02 09:00:00'),
(3701, 'wall_type', 'pladur', 0.85, '2026-04-02 09:00:00'),
(3702, 'wall_type', 'pladur', 0.85, '2026-04-02 09:00:00'),

-- Ventanas con RPT
(3105, 'window_type', 'rpte', 1.25, '2026-04-02 09:00:00'),
(3207, 'window_type', 'rpte', 1.25, '2026-04-02 09:00:00'),
(3306, 'window_type', 'rpte', 1.25, '2026-04-02 09:00:00');
