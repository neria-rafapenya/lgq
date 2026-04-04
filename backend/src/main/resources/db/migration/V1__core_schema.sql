CREATE TABLE `category_materials` (
  `id` int(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `lineitem_materials` (
  `id` int(11) NOT NULL,
  `subcategory_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('product','service') NOT NULL,
  `unit` enum('m2','ml','unit','kg','m3') NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `lineitem_materials_variants` (
  `id` int(11) NOT NULL,
  `lineitem_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `material` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `quality` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_default` tinyint(1) DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `supplier` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `image_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_equipment_selections` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `lineitem_id` int(11) NOT NULL,
  `variant_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `room` enum('bathroom','kitchen','general') NOT NULL,
  `is_selected` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_extras` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `debris_removal` tinyint(1) DEFAULT 0,
  `municipal_permits` tinyint(1) DEFAULT 0,
  `dumpster_required` tinyint(1) DEFAULT 0,
  `protection_required` tinyint(1) DEFAULT 0,
  `final_cleaning` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_financials` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `margin_percentage` decimal(5,2) DEFAULT 15.00,
  `contingency_percentage` decimal(5,2) DEFAULT 10.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_installations` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `plumbing_renovation` enum('none','partial','full') DEFAULT 'none',
  `electrical_renovation` enum('none','partial','full') DEFAULT 'none',
  `gas_renovation` enum('none','partial','full') DEFAULT 'none',
  `new_water_points` int(11) DEFAULT 0,
  `new_light_points` int(11) DEFAULT 0,
  `new_socket_points` int(11) DEFAULT 0,
  `heating_type` enum('none','electric','gas','aerothermal') DEFAULT 'none',
  `has_heating_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_labor` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `masonry_hours` decimal(10,2) DEFAULT 0.00,
  `plumbing_hours` decimal(10,2) DEFAULT 0.00,
  `electrical_hours` decimal(10,2) DEFAULT 0.00,
  `carpentry_hours` decimal(10,2) DEFAULT 0.00,
  `installation_hours` decimal(10,2) DEFAULT 0.00,
  `project_management_hours` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_location` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `has_elevator` tinyint(1) DEFAULT 1,
  `has_parking` tinyint(1) DEFAULT 1,
  `floor` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_material_selections` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `lineitem_id` int(11) NOT NULL,
  `variant_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `is_selected` tinyint(1) DEFAULT 1,
  `is_custom` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_scope` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `reform_type` enum('partial','integral') NOT NULL,
  `has_layout_changes` tinyint(1) DEFAULT 0,
  `move_kitchen` tinyint(1) DEFAULT 0,
  `move_bathroom` tinyint(1) DEFAULT 0,
  `demolish_walls` tinyint(1) DEFAULT 0,
  `open_spaces` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_space_state` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `area_m2` decimal(10,2) DEFAULT NULL,
  `height_m` decimal(5,2) DEFAULT NULL,
  `has_distribution_plan` tinyint(1) DEFAULT 0,
  `plumbing_status` enum('good','regular','bad') DEFAULT NULL,
  `electrical_status` enum('good','regular','bad') DEFAULT NULL,
  `drainage_status` enum('good','regular','bad') DEFAULT NULL,
  `wall_type` enum('pladur','brick','load_bearing','mixed') DEFAULT NULL,
  `demolition_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `project_timeline` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `estimated_days` int(11) DEFAULT NULL,
  `urgency_level` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subcategory_materials` (
  `id` int(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `category_materials`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `lineitem_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lineitem_subcategory` (`subcategory_id`);

ALTER TABLE `lineitem_materials_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_variant_lineitem` (`lineitem_id`);

ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `project_equipment_selections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_equipment_project` (`project_id`),
  ADD KEY `fk_equipment_lineitem` (`lineitem_id`),
  ADD KEY `fk_equipment_variant` (`variant_id`);

ALTER TABLE `project_extras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_extras_project` (`project_id`);

ALTER TABLE `project_financials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_financials_project` (`project_id`);

ALTER TABLE `project_installations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_installations_project` (`project_id`);

ALTER TABLE `project_labor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_labor_project` (`project_id`);

ALTER TABLE `project_location`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_location_project` (`project_id`);

ALTER TABLE `project_material_selections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_selection_project` (`project_id`),
  ADD KEY `fk_selection_lineitem` (`lineitem_id`),
  ADD KEY `fk_selection_variant` (`variant_id`);

ALTER TABLE `project_scope`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_scope_project` (`project_id`);

ALTER TABLE `project_space_state`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `project_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_timeline_project` (`project_id`);

ALTER TABLE `subcategory_materials`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `category_materials`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100040;

ALTER TABLE `lineitem_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

ALTER TABLE `lineitem_materials_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `project_equipment_selections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

ALTER TABLE `project_extras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `project_financials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `project_installations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `project_labor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `project_location`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `project_material_selections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

ALTER TABLE `project_scope`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `project_space_state`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `project_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `subcategory_materials`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

ALTER TABLE `lineitem_materials`
  ADD CONSTRAINT `fk_lineitem_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategory_materials` (`id`) ON DELETE CASCADE;

ALTER TABLE `lineitem_materials_variants`
  ADD CONSTRAINT `fk_variant_lineitem` FOREIGN KEY (`lineitem_id`) REFERENCES `lineitem_materials` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_equipment_selections`
  ADD CONSTRAINT `fk_equipment_lineitem` FOREIGN KEY (`lineitem_id`) REFERENCES `lineitem_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_equipment_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_equipment_variant` FOREIGN KEY (`variant_id`) REFERENCES `lineitem_materials_variants` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_extras`
  ADD CONSTRAINT `fk_extras_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_financials`
  ADD CONSTRAINT `fk_financials_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_installations`
  ADD CONSTRAINT `fk_installations_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_labor`
  ADD CONSTRAINT `fk_labor_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_location`
  ADD CONSTRAINT `fk_location_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_material_selections`
  ADD CONSTRAINT `fk_selection_lineitem` FOREIGN KEY (`lineitem_id`) REFERENCES `lineitem_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_selection_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_selection_variant` FOREIGN KEY (`variant_id`) REFERENCES `lineitem_materials_variants` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_scope`
  ADD CONSTRAINT `fk_scope_project` FOREIGN KEY (`project_id`) REFERENCES `project_space_state` (`id`) ON DELETE CASCADE;

ALTER TABLE `project_timeline`
  ADD CONSTRAINT `fk_timeline_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;
