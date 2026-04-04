-- N1 Pinturas: acabados decorativos avanzados
INSERT INTO lgq_catalog_items (id, catalog_id, code, name, unit, description, image_url, is_active, created_at) VALUES
(1151, 1, 'N1-11', 'Pintura efecto cemento', 'm2', 'Acabado efecto cemento', 'https://example.com/lgq/N1-11.jpg', 1, '2026-04-02 09:00:00'),
(1152, 1, 'N1-12', 'Pintura efecto óxido', 'm2', 'Acabado efecto óxido', 'https://example.com/lgq/N1-12.jpg', 1, '2026-04-02 09:00:00'),
(1153, 1, 'N1-13', 'Pintura efecto mármol', 'm2', 'Acabado efecto mármol', 'https://example.com/lgq/N1-13.jpg', 1, '2026-04-02 09:00:00'),
(1154, 1, 'N1-14', 'Pintura efecto arena', 'm2', 'Acabado efecto arena', 'https://example.com/lgq/N1-14.jpg', 1, '2026-04-02 09:00:00'),
(1155, 1, 'N1-15', 'Pintura veladuras', 'm2', 'Acabado veladuras', 'https://example.com/lgq/N1-15.jpg', 1, '2026-04-02 09:00:00'),
(1156, 1, 'N1-16', 'Pintura esponjado', 'm2', 'Acabado esponjado', 'https://example.com/lgq/N1-16.jpg', 1, '2026-04-02 09:00:00'),
(1157, 1, 'N1-17', 'Pintura grafiado', 'm2', 'Acabado grafiado', 'https://example.com/lgq/N1-17.jpg', 1, '2026-04-02 09:00:00'),
(1158, 1, 'N1-18', 'Pintura encalado', 'm2', 'Acabado encalado', 'https://example.com/lgq/N1-18.jpg', 1, '2026-04-02 09:00:00'),
(1159, 1, 'N1-19', 'Pintura stencil', 'm2', 'Acabado stencil', 'https://example.com/lgq/N1-19.jpg', 1, '2026-04-02 09:00:00'),
(1160, 1, 'N1-20', 'Pintura microcemento', 'm2', 'Acabado microcemento', 'https://example.com/lgq/N1-20.jpg', 1, '2026-04-02 09:00:00');

INSERT INTO lgq_catalog_variants (id, item_id, name, material, quality, price, is_default, is_active, created_at) VALUES
(2151, 1151, 'Estándar', 'decorativo', 'standard', 32, 1, 1, '2026-04-02 09:00:00'),
(2152, 1152, 'Estándar', 'decorativo', 'standard', 34, 1, 1, '2026-04-02 09:00:00'),
(2153, 1153, 'Estándar', 'decorativo', 'standard', 36, 1, 1, '2026-04-02 09:00:00'),
(2154, 1154, 'Estándar', 'decorativo', 'standard', 30, 1, 1, '2026-04-02 09:00:00'),
(2155, 1155, 'Estándar', 'decorativo', 'standard', 28, 1, 1, '2026-04-02 09:00:00'),
(2156, 1156, 'Estándar', 'decorativo', 'standard', 26, 1, 1, '2026-04-02 09:00:00'),
(2157, 1157, 'Estándar', 'decorativo', 'standard', 33, 1, 1, '2026-04-02 09:00:00'),
(2158, 1158, 'Estándar', 'decorativo', 'standard', 24, 1, 1, '2026-04-02 09:00:00'),
(2159, 1159, 'Estándar', 'decorativo', 'standard', 29, 1, 1, '2026-04-02 09:00:00'),
(2160, 1160, 'Estándar', 'decorativo', 'standard', 38, 1, 1, '2026-04-02 09:00:00');
