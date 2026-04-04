ALTER TABLE lgq_action_tasks
  ADD COLUMN subact_key varchar(80) DEFAULT NULL AFTER quantity_key;

-- Bathroom mappings
UPDATE lgq_action_tasks SET subact_key = 'bathroom-tiling' WHERE code = 'ALICATADO_BANO';
UPDATE lgq_action_tasks SET subact_key = 'bathroom-plumbing' WHERE code = 'FONT_BANO';
UPDATE lgq_action_tasks SET subact_key = 'sanitary' WHERE code = 'SANITARIOS';
UPDATE lgq_action_tasks SET subact_key = 'bathroom-electric' WHERE code = 'ELEC_BANO';
UPDATE lgq_action_tasks SET subact_key = 'bathroom-accessories' WHERE code = 'SCREEN_INSTALL';
UPDATE lgq_action_tasks SET subact_key = 'bathroom-tiling' WHERE code = 'WATERPROOF_BATH';
UPDATE lgq_action_tasks SET subact_key = 'bathroom-floors' WHERE code = 'FLOOR_LEVELING_B';

-- Kitchen mappings
UPDATE lgq_action_tasks SET subact_key = 'kitchen-tiling' WHERE code = 'ALICATADO_COCINA';
UPDATE lgq_action_tasks SET subact_key = 'kitchen-plumbing' WHERE code = 'FONT_COCINA';
UPDATE lgq_action_tasks SET subact_key = 'kitchen-electric' WHERE code = 'ELEC_COCINA';
UPDATE lgq_action_tasks SET subact_key = 'kitchen-furniture' WHERE code = 'MUEBLES_COCINA';
UPDATE lgq_action_tasks SET subact_key = 'appliances' WHERE code = 'HOOD_INSTALL';
UPDATE lgq_action_tasks SET subact_key = 'kitchen-floors' WHERE code = 'FLOOR_LEVELING_K';

-- Painting mappings
UPDATE lgq_action_tasks SET subact_key = 'walls' WHERE code IN ('PINTURA_PAREDES', 'PREPARACION');
UPDATE lgq_action_tasks SET subact_key = 'ceilings' WHERE code = 'PINTURA_TECHOS';
