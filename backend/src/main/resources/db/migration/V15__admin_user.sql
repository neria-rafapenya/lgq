INSERT INTO `users` (`email`, `name`, `password_hash`, `role`)
SELECT 'admin@admin.com', 'Administrador', '$2y$10$35YIQRtoEEMDoeQIWzinUOl06pWqet0anSPv50utjnwjEJqmSHlVS', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM `users` WHERE `email` = 'admin@admin.com'
);
