ALTER TABLE `conversations`
  ADD COLUMN `project_id` int(11) NULL;

UPDATE `conversations`
SET `project_id` = CAST(TRIM(SUBSTRING_INDEX(`title`, ' ', -1)) AS UNSIGNED)
WHERE `project_id` IS NULL
  AND `title` REGEXP '^Proyecto [0-9]+$';

ALTER TABLE `conversations`
  ADD KEY `fk_conv_project` (`project_id`),
  ADD CONSTRAINT `fk_conv_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;
