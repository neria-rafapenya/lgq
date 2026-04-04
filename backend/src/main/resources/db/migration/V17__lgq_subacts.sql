CREATE TABLE `lgq_subacts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_id` bigint NOT NULL,
  `subact_key` varchar(80) NOT NULL,
  `label` varchar(255) NOT NULL,
  `helper` varchar(255) DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `catalog_code` varchar(10) DEFAULT NULL,
  `options_json` longtext DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lgq_subacts_action` (`action_id`, `subact_key`),
  KEY `idx_lgq_subacts_action` (`action_id`),
  CONSTRAINT `fk_lgq_subacts_action` FOREIGN KEY (`action_id`) REFERENCES `lgq_actions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'layout', 'Cambiar distribución', 'Tirar o crear tabiques.', 'text', NULL, NULL, 1, 1
FROM lgq_actions WHERE code = 'integral';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'paint', 'Pintar', 'Paredes y techos.', 'catalog', 'N1', NULL, 2, 1
FROM lgq_actions WHERE code = 'integral';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'floors', 'Suelos', 'Reparar o cambiar.', 'catalog', 'N2', NULL, 3, 1
FROM lgq_actions WHERE code = 'integral';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'doors', 'Puertas', 'Pintar o sustituir.', 'catalog', 'N4', NULL, 4, 1
FROM lgq_actions WHERE code = 'integral';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'windows', 'Ventanas', 'Cambio o cerramientos.', 'catalog', 'N6', NULL, 5, 1
FROM lgq_actions WHERE code = 'integral';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'electric', 'Sistema eléctrico', 'Cableado y accesorios.', 'catalog', 'N9', NULL, 6, 1
FROM lgq_actions WHERE code = 'integral';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'ventilation', 'Ventilación', 'Rejillas, tomas y salidas.', 'catalog', 'N10', NULL, 7, 1
FROM lgq_actions WHERE code = 'integral';

INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'kitchen-furniture', 'Muebles', 'Tipos y materiales.', 'catalog', 'N25', NULL, 1, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'kitchen-plumbing', 'Fontanería', 'Tuberías y desagües.', 'options', NULL,
  '[{"key":"drains","label":"Cambiar desagües"},{"key":"pipes","label":"Cambiar tuberías de agua"}]', 2, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'countertop', 'Encimera', 'Material y acabado.', 'catalog', 'N13', NULL, 3, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'appliances', 'Electrodomésticos', 'Reemplazo o nuevos.', 'catalog', 'N14', NULL, 4, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'sink', 'Fregadero', 'Modelos y tamaños.', 'catalog', 'N15', NULL, 5, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'faucets', 'Grifería', 'Tipos y acabados.', 'catalog', 'N17', NULL, 6, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'kitchen-tiling', 'Alicatado', 'Paredes y zonas húmedas.', 'catalog', 'N18', NULL, 7, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'kitchen-windows', 'Ventanas', 'Cambio o ajuste.', 'catalog', 'N6', NULL, 8, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'kitchen-doors', 'Puertas y marcos', 'Cambiar o reparar.', 'catalog', 'N4', NULL, 9, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'kitchen-electric', 'Sistema eléctrico', 'Cableado y accesorios.', 'catalog', 'N9', NULL, 10, 1
FROM lgq_actions WHERE code = 'kitchen';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'kitchen-floors', 'Suelos', 'Reparar o cambiar.', 'catalog', 'N2', NULL, 11, 1
FROM lgq_actions WHERE code = 'kitchen';

INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-furniture', 'Muebles', 'Tipos y materiales.', 'catalog', 'N25', NULL, 1, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-plumbing', 'Fontanería', 'Tuberías y desagües.', 'options', NULL,
  '[{"key":"drains","label":"Cambiar desagües"},{"key":"pipes","label":"Cambiar tuberías de agua"}]', 2, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-accessories', 'Accesorios', 'Espejos y complementos.', 'catalog', 'N24', NULL, 3, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'sanitary', 'Sanitarios', 'WC, lavabo, bidé.', 'catalog', 'N23', NULL, 4, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-faucets', 'Grifería', 'Tipos y acabados.', 'catalog', 'N17', NULL, 5, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-tiling', 'Alicatado', 'Paredes y zonas húmedas.', 'catalog', 'N18', NULL, 6, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-windows', 'Ventanas', 'Cambio o ajuste.', 'catalog', 'N6', NULL, 7, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-doors', 'Puertas y marcos', 'Cambiar o reparar.', 'catalog', 'N4', NULL, 8, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-electric', 'Sistema eléctrico', 'Cableado y accesorios.', 'catalog', 'N9', NULL, 9, 1
FROM lgq_actions WHERE code = 'bathroom';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bathroom-floors', 'Suelos', 'Reparar o cambiar.', 'catalog', 'N2', NULL, 10, 1
FROM lgq_actions WHERE code = 'bathroom';

INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'demolition', 'Tirar tabiques', 'Demoliciones internas.', 'text', NULL, NULL, 1, 1
FROM lgq_actions WHERE code = 'redistribution';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'bearing', 'Pared maestra', 'Requiere refuerzo.', 'text', NULL, NULL, 2, 1
FROM lgq_actions WHERE code = 'redistribution';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'build', 'Crear tabiques', 'Nuevas particiones.', 'text', NULL, NULL, 3, 1
FROM lgq_actions WHERE code = 'redistribution';

INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'walls', 'Paredes', 'Pintura por m².', 'catalog', 'N1', NULL, 1, 1
FROM lgq_actions WHERE code = 'painting';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'ceilings', 'Techos', 'Pintura por m².', 'catalog', 'N1', NULL, 2, 1
FROM lgq_actions WHERE code = 'painting';
INSERT INTO lgq_subacts (action_id, subact_key, label, helper, type, catalog_code, options_json, sort_order, is_active)
SELECT id, 'floors', 'Suelos (parking)', 'Tratamiento específico.', 'catalog', 'N2', NULL, 3, 1
FROM lgq_actions WHERE code = 'painting';
