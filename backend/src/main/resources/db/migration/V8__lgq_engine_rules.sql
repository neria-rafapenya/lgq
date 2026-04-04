-- Ajuste de tiempos base existentes
UPDATE lgq_action_tasks SET base_rate_hours = 0.35 WHERE id = 3002;
UPDATE lgq_action_tasks SET base_rate_hours = 0.90 WHERE id = 3005;
UPDATE lgq_action_tasks SET base_rate_hours = 7.00 WHERE id = 3006;
UPDATE lgq_action_tasks SET base_rate_hours = 5.00 WHERE id = 3007;
UPDATE lgq_action_tasks SET base_rate_hours = 0.90 WHERE id = 3009;
UPDATE lgq_action_tasks SET base_rate_hours = 3.50 WHERE id = 3012;
UPDATE lgq_action_tasks SET base_rate_hours = 0.70 WHERE id = 3013;
UPDATE lgq_action_tasks SET base_rate_hours = 0.90 WHERE id = 3014;
UPDATE lgq_action_tasks SET base_rate_hours = 0.35 WHERE id = 3015;
UPDATE lgq_action_tasks SET base_rate_hours = 0.30 WHERE id = 3016;
UPDATE lgq_action_tasks SET base_rate_hours = 0.45 WHERE id = 3018;
UPDATE lgq_action_tasks SET base_rate_hours = 0.45 WHERE id = 3019;

-- Nuevas partidas para reforma integral
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3101, 1, 'SUELO_GENERAL', 'Colocación suelo general', 'm2', 0.70, 'albanil', 'floor_m2', '2026-04-02 09:00:00'),
(3102, 1, 'RETIRADA_SUELO', 'Retirada de suelo existente', 'm2', 0.30, 'albanil', 'floor_remove_m2', '2026-04-02 09:00:00'),
(3103, 1, 'PINTURA_GENERAL', 'Pintura general', 'm2', 0.35, 'pintor', 'paint_total_m2', '2026-04-02 09:00:00'),
(3104, 1, 'PUERTAS_INST', 'Instalación de puertas', 'unit', 1.50, 'carpintero', 'doors_count', '2026-04-02 09:00:00'),
(3105, 1, 'VENTANAS_INST', 'Instalación de ventanas', 'unit', 2.00, 'instalador', 'windows_count', '2026-04-02 09:00:00'),
(3106, 1, 'ELECTRICA_GENERAL_INT', 'Electricidad general integral', 'm2', 0.45, 'electricista', 'electric_m2', '2026-04-02 09:00:00'),
(3107, 1, 'FONT_GENERAL_INT', 'Fontanería general integral', 'm2', 0.45, 'fontanero', 'plumbing_m2', '2026-04-02 09:00:00');

-- Nuevas partidas para cocina
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3201, 2, 'SUELO_COCINA', 'Colocación suelo cocina', 'm2', 0.70, 'albanil', 'kitchen_floor_m2', '2026-04-02 09:00:00'),
(3202, 2, 'ENCIMERA_COCINA', 'Instalación encimera', 'ml', 1.20, 'carpintero', 'countertop_ml', '2026-04-02 09:00:00'),
(3203, 2, 'ELECTRO_COCINA', 'Instalación electrodomésticos', 'unit', 1.20, 'instalador', 'appliances_count', '2026-04-02 09:00:00'),
(3204, 2, 'FREGADERO_COCINA', 'Instalación fregadero', 'unit', 1.50, 'fontanero', 'sinks_count', '2026-04-02 09:00:00'),
(3205, 2, 'GRIFERIA_COCINA', 'Instalación grifería cocina', 'unit', 0.80, 'fontanero', 'faucets_count', '2026-04-02 09:00:00'),
(3206, 2, 'PUERTA_COCINA', 'Instalación puerta cocina', 'unit', 1.50, 'carpintero', 'kitchen_doors_count', '2026-04-02 09:00:00'),
(3207, 2, 'VENTANA_COCINA', 'Instalación ventana cocina', 'unit', 2.00, 'instalador', 'kitchen_windows_count', '2026-04-02 09:00:00');

-- Nuevas partidas para baño
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(3301, 3, 'SUELO_BANO', 'Colocación suelo baño', 'm2', 0.70, 'albanil', 'bathroom_floor_m2', '2026-04-02 09:00:00'),
(3302, 3, 'GRIFERIA_BANO', 'Instalación grifería baño', 'unit', 0.80, 'fontanero', 'bath_faucets_count', '2026-04-02 09:00:00'),
(3303, 3, 'ACCESORIOS_BANO', 'Instalación accesorios baño', 'unit', 0.50, 'instalador', 'bath_accessories_count', '2026-04-02 09:00:00'),
(3304, 3, 'DUCHA_CAMBIO', 'Cambio bañera/ducha', 'unit', 6.00, 'fontanero', 'bath_shower_change', '2026-04-02 09:00:00'),
(3305, 3, 'PUERTA_BANO', 'Instalación puerta baño', 'unit', 1.50, 'carpintero', 'bath_doors_count', '2026-04-02 09:00:00'),
(3306, 3, 'VENTANA_BANO', 'Instalación ventana baño', 'unit', 2.00, 'instalador', 'bath_windows_count', '2026-04-02 09:00:00');

-- Reglas de modulación por factores
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
-- Cambios de distribución
(3001, 'layout_changes', 'yes', 1.30, '2026-04-02 09:00:00'),
(3002, 'layout_changes', 'yes', 1.30, '2026-04-02 09:00:00'),
(3013, 'layout_changes', 'yes', 1.30, '2026-04-02 09:00:00'),
(3014, 'layout_changes', 'yes', 1.20, '2026-04-02 09:00:00'),

-- Alcance de instalaciones
(3107, 'plumbing_scope', 'partial', 0.70, '2026-04-02 09:00:00'),
(3107, 'plumbing_scope', 'full', 1.30, '2026-04-02 09:00:00'),
(3019, 'plumbing_scope', 'partial', 0.70, '2026-04-02 09:00:00'),
(3019, 'plumbing_scope', 'full', 1.30, '2026-04-02 09:00:00'),
(3006, 'plumbing_scope', 'partial', 0.80, '2026-04-02 09:00:00'),
(3006, 'plumbing_scope', 'full', 1.20, '2026-04-02 09:00:00'),
(3010, 'plumbing_scope', 'partial', 0.80, '2026-04-02 09:00:00'),
(3010, 'plumbing_scope', 'full', 1.20, '2026-04-02 09:00:00'),

(3106, 'electrical_scope', 'partial', 0.70, '2026-04-02 09:00:00'),
(3106, 'electrical_scope', 'full', 1.30, '2026-04-02 09:00:00'),
(3018, 'electrical_scope', 'partial', 0.70, '2026-04-02 09:00:00'),
(3018, 'electrical_scope', 'full', 1.30, '2026-04-02 09:00:00'),
(3007, 'electrical_scope', 'partial', 0.80, '2026-04-02 09:00:00'),
(3007, 'electrical_scope', 'full', 1.20, '2026-04-02 09:00:00'),
(3012, 'electrical_scope', 'partial', 0.80, '2026-04-02 09:00:00'),
(3012, 'electrical_scope', 'full', 1.20, '2026-04-02 09:00:00'),

-- Pintura y acabados
(3015, 'paint_finish', 'estucado', 1.35, '2026-04-02 09:00:00'),
(3016, 'paint_finish', 'estucado', 1.35, '2026-04-02 09:00:00'),
(3017, 'paint_finish', 'estucado', 1.35, '2026-04-02 09:00:00'),
(3103, 'paint_finish', 'estucado', 1.35, '2026-04-02 09:00:00'),
(3015, 'paint_finish', 'patina', 1.20, '2026-04-02 09:00:00'),
(3016, 'paint_finish', 'patina', 1.20, '2026-04-02 09:00:00'),
(3017, 'paint_finish', 'patina', 1.20, '2026-04-02 09:00:00'),
(3103, 'paint_finish', 'patina', 1.20, '2026-04-02 09:00:00'),
(3015, 'paint_finish', 'pistola', 0.85, '2026-04-02 09:00:00'),
(3016, 'paint_finish', 'pistola', 0.85, '2026-04-02 09:00:00'),
(3017, 'paint_finish', 'pistola', 0.85, '2026-04-02 09:00:00'),
(3103, 'paint_finish', 'pistola', 0.85, '2026-04-02 09:00:00'),
(3017, 'remove_gotele', 'yes', 1.25, '2026-04-02 09:00:00'),

-- Altura de techo alta
(3015, 'ceiling_height_class', 'high', 1.15, '2026-04-02 09:00:00'),
(3016, 'ceiling_height_class', 'high', 1.15, '2026-04-02 09:00:00'),
(3103, 'ceiling_height_class', 'high', 1.15, '2026-04-02 09:00:00'),

-- Formato de baldosa / alicatado
(3005, 'tile_format', 'mosaico', 1.25, '2026-04-02 09:00:00'),
(3009, 'tile_format', 'mosaico', 1.25, '2026-04-02 09:00:00'),
(3005, 'tile_format', 'grande', 1.15, '2026-04-02 09:00:00'),
(3009, 'tile_format', 'grande', 1.15, '2026-04-02 09:00:00'),

-- Método de suelo
(3101, 'floor_method', 'remove', 1.15, '2026-04-02 09:00:00'),
(3201, 'floor_method', 'remove', 1.15, '2026-04-02 09:00:00'),
(3301, 'floor_method', 'remove', 1.15, '2026-04-02 09:00:00'),
(3101, 'floor_method', 'overlay', 0.90, '2026-04-02 09:00:00'),
(3201, 'floor_method', 'overlay', 0.90, '2026-04-02 09:00:00'),
(3301, 'floor_method', 'overlay', 0.90, '2026-04-02 09:00:00'),

-- Tipo de puerta
(3104, 'door_type', 'corredera', 1.20, '2026-04-02 09:00:00'),
(3104, 'door_type', 'blindada', 1.30, '2026-04-02 09:00:00'),
(3206, 'door_type', 'corredera', 1.20, '2026-04-02 09:00:00'),
(3305, 'door_type', 'corredera', 1.20, '2026-04-02 09:00:00');
