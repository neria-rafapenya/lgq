-- Partidas específicas: puertas correderas empotradas y cerramientos especiales
INSERT INTO lgq_action_tasks (id, action_id, code, name, unit, base_rate_hours, role, quantity_key, created_at) VALUES
(4101, 1, 'POCKET_DOOR_INSTALL', 'Puerta corredera empotrada', 'unit', 2.50, 'carpintero', 'sliding_pocket_doors_count', '2026-04-02 09:00:00'),
(4102, 1, 'POCKET_DOOR_MASON', 'Cajón corredera empotrada (obra)', 'unit', 1.20, 'albanil', 'sliding_pocket_doors_count', '2026-04-02 09:00:00'),
(4103, 1, 'ENCLOSURE_SPECIAL', 'Cerramiento especial terraza/patio', 'm2', 1.60, 'instalador', 'enclosure_m2', '2026-04-02 09:00:00');

-- Reglas adicionales por material de suelo
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
(3101, 'floor_material', 'gres', 1.00, '2026-04-02 09:00:00'),
(3201, 'floor_material', 'gres', 1.00, '2026-04-02 09:00:00'),
(3301, 'floor_material', 'gres', 1.00, '2026-04-02 09:00:00'),
(3101, 'floor_material', 'porcelanico', 1.10, '2026-04-02 09:00:00'),
(3201, 'floor_material', 'porcelanico', 1.10, '2026-04-02 09:00:00'),
(3301, 'floor_material', 'porcelanico', 1.10, '2026-04-02 09:00:00'),
(3101, 'floor_material', 'vinilico', 0.90, '2026-04-02 09:00:00'),
(3201, 'floor_material', 'vinilico', 0.90, '2026-04-02 09:00:00'),
(3301, 'floor_material', 'vinilico', 0.90, '2026-04-02 09:00:00'),
(3101, 'floor_material', 'marmol', 1.25, '2026-04-02 09:00:00'),
(3201, 'floor_material', 'marmol', 1.25, '2026-04-02 09:00:00'),
(3301, 'floor_material', 'marmol', 1.25, '2026-04-02 09:00:00');

-- Formato de baldosa pequeño
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
(3005, 'tile_format', 'pequeno', 1.15, '2026-04-02 09:00:00'),
(3009, 'tile_format', 'pequeno', 1.15, '2026-04-02 09:00:00');

-- Puertas correderas empotradas (factor)
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
(3104, 'door_type', 'corredera_empotrada', 1.35, '2026-04-02 09:00:00'),
(3206, 'door_type', 'corredera_empotrada', 1.35, '2026-04-02 09:00:00'),
(3305, 'door_type', 'corredera_empotrada', 1.35, '2026-04-02 09:00:00');

-- Cerramientos especiales por material
INSERT INTO lgq_task_rules (task_id, factor_key, factor_value, multiplier, created_at) VALUES
(4103, 'enclosure_material', 'aluminio', 1.00, '2026-04-02 09:00:00'),
(4103, 'enclosure_material', 'pvc', 0.90, '2026-04-02 09:00:00'),
(4103, 'enclosure_material', 'cristal', 1.20, '2026-04-02 09:00:00');
