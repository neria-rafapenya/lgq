ALTER TABLE lgq_catalog_variants
  ADD COLUMN size_x_cm DECIMAL(8,2) NULL AFTER image_url,
  ADD COLUMN size_y_cm DECIMAL(8,2) NULL AFTER size_x_cm,
  ADD COLUMN size_z_cm DECIMAL(8,2) NULL AFTER size_y_cm;
