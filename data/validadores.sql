-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 30-03-2026 a las 13:44:37
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `validadores`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `category_materials`
--

CREATE TABLE `category_materials` (
  `id` int(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `category_materials`
--

INSERT INTO `category_materials` (`id`, `name`, `created_at`) VALUES
(100001, 'Demoliciones', '2026-03-30 10:59:41'),
(100002, 'Albañilería', '2026-03-30 10:59:41'),
(100003, 'Estructura', '2026-03-30 10:59:41'),
(100004, 'Cerramientos', '2026-03-30 10:59:41'),
(100005, 'Fontanería', '2026-03-30 10:59:41'),
(100006, 'Electricidad', '2026-03-30 10:59:41'),
(100007, 'Gas', '2026-03-30 10:59:41'),
(100008, 'Climatización', '2026-03-30 10:59:41'),
(100009, 'Ventilación', '2026-03-30 10:59:41'),
(100010, 'Revestimientos', '2026-03-30 10:59:41'),
(100011, 'Pavimentos', '2026-03-30 10:59:41'),
(100012, 'Alicatados', '2026-03-30 10:59:41'),
(100013, 'Impermeabilización', '2026-03-30 10:59:41'),
(100014, 'Pintura', '2026-03-30 10:59:41'),
(100015, 'Sanitarios', '2026-03-30 10:59:41'),
(100016, 'Mobiliario de baño', '2026-03-30 10:59:41'),
(100017, 'Grifería', '2026-03-30 10:59:41'),
(100018, 'Mamparas', '2026-03-30 10:59:41'),
(100019, 'Mobiliario de cocina', '2026-03-30 10:59:41'),
(100020, 'Encimeras', '2026-03-30 10:59:41'),
(100021, 'Electrodomésticos', '2026-03-30 10:59:41'),
(100022, 'Fregaderos', '2026-03-30 10:59:41'),
(100023, 'Carpintería interior', '2026-03-30 10:59:41'),
(100024, 'Carpintería exterior', '2026-03-30 10:59:41'),
(100025, 'Puertas', '2026-03-30 10:59:41'),
(100026, 'Ventanas', '2026-03-30 10:59:41'),
(100027, 'Iluminación', '2026-03-30 10:59:41'),
(100028, 'Mecanismos eléctricos', '2026-03-30 10:59:41'),
(100029, 'Aislamiento térmico', '2026-03-30 10:59:41'),
(100030, 'Aislamiento acústico', '2026-03-30 10:59:41'),
(100031, 'Transporte', '2026-03-30 10:59:41'),
(100032, 'Gestión de residuos', '2026-03-30 10:59:41'),
(100033, 'Medios auxiliares', '2026-03-30 10:59:41'),
(100034, 'Licencias y permisos', '2026-03-30 10:59:41'),
(100035, 'Dirección de obra', '2026-03-30 10:59:41'),
(100036, 'Coordinación de seguridad', '2026-03-30 10:59:41'),
(100037, 'Limpieza final', '2026-03-30 10:59:41'),
(100038, 'Puesta en marcha', '2026-03-30 10:59:41'),
(100039, 'Revisiones', '2026-03-30 10:59:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineitem_materials`
--

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

--
-- Volcado de datos para la tabla `lineitem_materials`
--

INSERT INTO `lineitem_materials` (`id`, `subcategory_id`, `name`, `type`, `unit`, `description`, `base_price`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Demolición de tabiques', 'service', 'm2', NULL, 15.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(2, 2, 'Retirada de suelos', 'service', 'm2', NULL, 10.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(3, 3, 'Retirada de alicatados', 'service', 'm2', NULL, 12.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(4, 4, 'Levantado de tabiques', 'service', 'm2', NULL, 25.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(5, 5, 'Enfoscado y enlucido', 'service', 'm2', NULL, 18.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(6, 6, 'Recrecido de suelo', 'service', 'm2', NULL, 20.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(7, 7, 'Refuerzo estructural', 'service', 'unit', NULL, 300.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(8, 8, 'Apertura de huecos', 'service', 'unit', NULL, 250.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(9, 9, 'Cerramiento interior', 'service', 'm2', NULL, 30.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(10, 10, 'Cerramiento exterior', 'service', 'm2', NULL, 45.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(11, 11, 'Instalación de tuberías', 'service', 'ml', NULL, 12.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(12, 11, 'Tubería multicapa', 'product', 'ml', NULL, 5.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(13, 12, 'Instalación de desagües', 'service', 'ml', NULL, 10.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(14, 13, 'Punto de agua', 'service', 'unit', NULL, 60.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(15, 14, 'Instalación eléctrica', 'service', 'ml', NULL, 8.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(16, 15, 'Cuadro eléctrico', 'product', 'unit', NULL, 150.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(17, 16, 'Punto eléctrico', 'service', 'unit', NULL, 40.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(18, 17, 'Instalación de gas', 'service', 'ml', NULL, 15.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(19, 18, 'Conexión de gas', 'service', 'unit', NULL, 80.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(20, 19, 'Instalación aire acondicionado', 'service', 'unit', NULL, 300.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(21, 20, 'Instalación calefacción', 'service', 'unit', NULL, 400.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(22, 21, 'Sistema de extracción', 'service', 'unit', NULL, 120.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(23, 22, 'Ventilación forzada', 'service', 'unit', NULL, 150.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(24, 23, 'Revestimiento decorativo', 'product', 'm2', NULL, 20.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(25, 23, 'Colocación revestimiento', 'service', 'm2', NULL, 18.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(26, 24, 'Baldosa cerámica', 'product', 'm2', NULL, 15.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(27, 24, 'Colocación de pavimento', 'service', 'm2', NULL, 20.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(28, 25, 'Azulejo pared', 'product', 'm2', NULL, 18.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(29, 25, 'Alicatado', 'service', 'm2', NULL, 22.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(30, 26, 'Membrana impermeable', 'product', 'm2', NULL, 10.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(31, 26, 'Impermeabilización de ducha', 'service', 'm2', NULL, 25.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(32, 27, 'Pintura plástica', 'product', 'm2', NULL, 5.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(33, 27, 'Pintura interior', 'service', 'm2', NULL, 12.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(34, 28, 'Inodoro', 'product', 'unit', NULL, 120.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(35, 28, 'Lavabo', 'product', 'unit', NULL, 90.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(36, 29, 'Mueble de baño', 'product', 'unit', NULL, 200.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(37, 30, 'Grifo lavabo', 'product', 'unit', NULL, 60.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(38, 30, 'Grifo ducha', 'product', 'unit', NULL, 80.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(39, 31, 'Mampara ducha', 'product', 'unit', NULL, 180.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(40, 32, 'Muebles de cocina', 'product', 'ml', NULL, 200.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(41, 33, 'Encimera de cuarzo', 'product', 'ml', NULL, 250.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(42, 34, 'Horno', 'product', 'unit', NULL, 300.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(43, 34, 'Vitrocerámica', 'product', 'unit', NULL, 200.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(44, 35, 'Fregadero inox', 'product', 'unit', NULL, 120.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(45, 36, 'Puerta interior', 'product', 'unit', NULL, 150.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(46, 37, 'Ventana aluminio', 'product', 'unit', NULL, 250.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(47, 38, 'Puerta corredera', 'product', 'unit', NULL, 200.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(48, 39, 'Ventana PVC', 'product', 'unit', NULL, 220.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(49, 40, 'Luminaria LED', 'product', 'unit', NULL, 40.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(50, 41, 'Enchufe', 'product', 'unit', NULL, 10.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(51, 41, 'Interruptor', 'product', 'unit', NULL, 12.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(52, 42, 'Aislamiento térmico', 'product', 'm2', NULL, 18.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(53, 43, 'Aislamiento acústico', 'product', 'm2', NULL, 22.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(54, 44, 'Transporte materiales', 'service', 'unit', NULL, 100.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(55, 45, 'Retirada escombros', 'service', 'm3', NULL, 60.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(56, 46, 'Alquiler andamios', 'service', 'unit', NULL, 80.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(57, 47, 'Licencia de obra', 'service', 'unit', NULL, 300.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(58, 48, 'Dirección técnica', 'service', 'unit', NULL, 500.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(59, 49, 'Coordinación seguridad', 'service', 'unit', NULL, 250.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(60, 50, 'Limpieza final', 'service', 'unit', NULL, 150.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(61, 51, 'Entrega de obra', 'service', 'unit', NULL, 0.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02'),
(62, 52, 'Revisión final', 'service', 'unit', NULL, 0.00, 1, '2026-03-30 11:13:02', '2026-03-30 11:13:02');

-- Extras catálogo (baldosas/rajolas, suelos, pintura, carpintería)
INSERT INTO `lineitem_materials` (`id`, `subcategory_id`, `name`, `type`, `unit`, `description`, `base_price`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 25, 'Pavimento porcelánico arena 60x60', 'product', 'm2', 'Porcelánico mate, tono arena', 28.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(102, 25, 'Pavimento hidráulico azul 20x20', 'product', 'm2', 'Baldosa hidráulica decorativa', 35.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(103, 27, 'Azulejo metro blanco brillo 10x20', 'product', 'm2', 'Azulejo clásico para paredes', 22.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(104, 28, 'Azulejo decorativo geométrico gris', 'product', 'm2', 'Alicatado decorativo', 32.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(105, 26, 'Suelo laminado roble claro AC4', 'product', 'm2', 'Laminado resistente tono roble', 24.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(106, 31, 'Pintura blanco roto mate', 'product', 'm2', 'Pintura interior mate color blanco roto', 6.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(107, 31, 'Pintura gris perla satinado', 'product', 'm2', 'Pintura interior satinada color gris perla', 7.50, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(108, 32, 'Pintura antihumedad baño', 'product', 'm2', 'Pintura técnica antihumedad', 9.50, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(109, 49, 'Puerta interior lacada blanca', 'product', 'unit', 'Puerta lisa lacada blanca', 180.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(110, 49, 'Marco/cerco MDF blanco', 'product', 'unit', 'Marco y tapajuntas MDF blanco', 65.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(111, 53, 'Puerta abatible roble natural', 'product', 'unit', 'Puerta abatible acabado roble', 210.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
(112, 54, 'Puerta corredera vidrio esmerilado', 'product', 'unit', 'Puerta corredera con vidrio esmerilado', 260.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineitem_materials_variants`
--

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

--
-- Volcado de datos para la tabla `lineitem_materials_variants`
--

INSERT INTO `lineitem_materials_variants` (`id`, `lineitem_id`, `name`, `material`, `brand`, `quality`, `price`, `is_active`, `created_at`, `updated_at`, `is_default`, `sku`, `supplier`, `stock`, `image_url`) VALUES
(1, 1, 'Demolición estándar', NULL, NULL, 'standard', 15.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'DEM-001', 'DemoCorp', 999, 'https://example.com/img/demolicion.jpg'),
(2, 2, 'Retirada estándar', NULL, NULL, 'standard', 10.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'DEM-001', 'DemoCorp', 999, 'https://example.com/img/demolicion.jpg'),
(3, 3, 'Retirada alicatado reforzada', NULL, NULL, 'premium', 14.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'DEM-001', 'DemoCorp', 999, 'https://example.com/img/demolicion.jpg'),
(4, 4, 'Tabique ladrillo hueco', 'ladrillo', NULL, 'standard', 25.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'ALB-4', 'Construmat', 200, 'https://example.com/img/albanileria.jpg'),
(5, 5, 'Enfoscado fino', 'yeso', NULL, 'standard', 18.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'ALB-5', 'Construmat', 200, 'https://example.com/img/albanileria.jpg'),
(6, 6, 'Recrecido autonivelante', 'mortero', NULL, 'premium', 22.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'ALB-6', 'Construmat', 200, 'https://example.com/img/albanileria.jpg'),
(7, 7, 'Refuerzo metálico', 'acero', NULL, 'premium', 320.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'EST-7', 'SteelWorks', 50, 'https://example.com/img/estructura.jpg'),
(8, 8, 'Apertura con refuerzo', NULL, NULL, 'standard', 260.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'EST-8', 'SteelWorks', 50, 'https://example.com/img/estructura.jpg'),
(9, 9, 'Pladur estándar', 'pladur', NULL, 'standard', 30.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-9', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(10, 10, 'Cerramiento aislado', 'pladur+lana', NULL, 'premium', 50.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-10', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(11, 11, 'Instalación básica', NULL, NULL, 'standard', 12.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-11', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(12, 12, 'Tubería multicapa estándar', 'multicapa', 'Genérica', 'standard', 5.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'FON-PIPE-001', 'Uponor', 500, 'https://example.com/img/tuberia.jpg'),
(13, 12, 'Tubería multicapa premium', 'multicapa', 'Uponor', 'premium', 8.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'FON-PIPE-001', 'Uponor', 500, 'https://example.com/img/tuberia.jpg'),
(14, 13, 'Desagüe PVC estándar', 'PVC', NULL, 'standard', 10.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-14', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(15, 14, 'Punto de agua completo', NULL, NULL, 'standard', 60.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-15', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(16, 15, 'Cableado estándar', 'cobre', NULL, 'standard', 8.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'ELE-16', 'Schneider', 400, 'https://example.com/img/electricidad.jpg'),
(17, 16, 'Cuadro básico', NULL, 'Schneider', 'standard', 150.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'ELE-17', 'Schneider', 400, 'https://example.com/img/electricidad.jpg'),
(18, 17, 'Punto eléctrico estándar', NULL, NULL, 'standard', 40.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'ELE-18', 'Schneider', 400, 'https://example.com/img/electricidad.jpg'),
(19, 18, 'Instalación homologada', NULL, NULL, 'standard', 15.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-19', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(20, 19, 'Conexión certificada', NULL, NULL, 'standard', 80.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-20', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(21, 20, 'Split básico', NULL, 'Mitsubishi', 'standard', 300.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-21', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(22, 21, 'Sistema radiadores', NULL, NULL, 'premium', 420.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-22', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(23, 22, 'Extractor estándar', NULL, NULL, 'standard', 120.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-23', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(24, 23, 'Sistema forzado', NULL, NULL, 'premium', 150.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-24', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(25, 24, 'Revestimiento cerámico básico', 'cerámica', NULL, 'standard', 20.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'REV-25', 'Porcelanosa', 300, 'https://example.com/img/baldosa.jpg'),
(26, 24, 'Revestimiento porcelánico', 'porcelánico', NULL, 'premium', 30.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'REV-26', 'Porcelanosa', 300, 'https://example.com/img/baldosa.jpg'),
(27, 25, 'Colocación estándar', NULL, NULL, 'standard', 18.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-27', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(28, 26, 'Baldosa económica', 'cerámica', NULL, 'basic', 15.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'REV-28', 'Porcelanosa', 300, 'https://example.com/img/baldosa.jpg'),
(29, 26, 'Porcelánico rectificado', 'porcelánico', NULL, 'premium', 28.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'REV-29', 'Porcelanosa', 300, 'https://example.com/img/baldosa.jpg'),
(30, 27, 'Colocación pavimento', NULL, NULL, 'standard', 20.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-30', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(31, 28, 'Azulejo blanco básico', 'cerámica', NULL, 'basic', 18.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'REV-31', 'Porcelanosa', 300, 'https://example.com/img/baldosa.jpg'),
(32, 28, 'Azulejo decorativo', 'cerámica', NULL, 'premium', 30.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'REV-32', 'Porcelanosa', 300, 'https://example.com/img/baldosa.jpg'),
(33, 29, 'Alicatado estándar', NULL, NULL, 'standard', 22.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-33', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(34, 30, 'Membrana líquida', 'resina', NULL, 'standard', 10.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-34', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(35, 31, 'Impermeabilización ducha premium', NULL, NULL, 'premium', 30.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-35', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(36, 32, 'Pintura básica', 'plástica', NULL, 'basic', 5.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-36', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(37, 32, 'Pintura lavable premium', 'acrílica', NULL, 'premium', 9.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'GEN-37', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(38, 33, 'Pintura interior', NULL, NULL, 'standard', 12.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-38', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(39, 34, 'Inodoro básico', NULL, 'Roca', 'standard', 120.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'SAN-39', 'Roca', 100, 'https://example.com/img/sanitario.jpg'),
(40, 34, 'Inodoro suspendido', NULL, 'Roca', 'premium', 250.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'SAN-40', 'Roca', 100, 'https://example.com/img/sanitario.jpg'),
(41, 35, 'Lavabo estándar', NULL, NULL, 'standard', 90.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'SAN-41', 'Roca', 100, 'https://example.com/img/sanitario.jpg'),
(42, 36, 'Mueble básico', 'madera', NULL, 'standard', 200.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-42', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(43, 37, 'Grifo básico', NULL, NULL, 'standard', 60.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-43', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(44, 37, 'Grifo termostático', NULL, 'Grohe', 'premium', 120.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'GEN-44', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(45, 38, 'Mampara corredera', NULL, NULL, 'standard', 180.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-45', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(46, 39, 'Mueble melamina', 'melamina', NULL, 'standard', 200.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'KIT-46', 'IKEA', 80, 'https://example.com/img/cocina.jpg'),
(47, 39, 'Mueble lacado premium', 'lacado', NULL, 'premium', 350.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'KIT-47', 'IKEA', 80, 'https://example.com/img/cocina.jpg'),
(48, 40, 'Encimera cuarzo básico', 'cuarzo', NULL, 'standard', 250.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'KIT-48', 'IKEA', 80, 'https://example.com/img/cocina.jpg'),
(49, 40, 'Encimera Dekton', 'dekton', NULL, 'premium', 450.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'KIT-49', 'IKEA', 80, 'https://example.com/img/cocina.jpg'),
(50, 41, 'Horno básico', NULL, 'Balay', 'standard', 300.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-50', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(51, 41, 'Horno premium', NULL, 'Bosch', 'premium', 600.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'GEN-51', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(52, 42, 'Vitrocerámica estándar', NULL, NULL, 'standard', 200.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-52', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(53, 43, 'Fregadero inox estándar', 'inox', NULL, 'standard', 120.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-53', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(54, 44, 'Puerta madera básica', 'madera', NULL, 'standard', 150.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-54', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(55, 45, 'Ventana aluminio básica', 'aluminio', NULL, 'standard', 250.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-55', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(56, 46, 'Puerta corredera estándar', 'madera', NULL, 'standard', 200.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-56', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(57, 47, 'Ventana PVC estándar', 'PVC', NULL, 'standard', 220.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-57', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(58, 48, 'LED básico', NULL, NULL, 'standard', 40.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'LUX-58', 'Philips', 250, 'https://example.com/img/led.jpg'),
(59, 49, 'Enchufe estándar', NULL, 'Simon', 'standard', 10.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'ELE-59', 'Schneider', 400, 'https://example.com/img/electricidad.jpg'),
(60, 49, 'Interruptor premium', NULL, 'Simon', 'premium', 18.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 0, 'ELE-60', 'Schneider', 400, 'https://example.com/img/electricidad.jpg'),
(61, 50, 'Aislamiento térmico básico', 'lana mineral', NULL, 'standard', 18.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-61', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(62, 51, 'Aislamiento acústico premium', 'panel acústico', NULL, 'premium', 25.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-62', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(63, 52, 'Transporte estándar', NULL, NULL, 'standard', 100.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-63', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(64, 53, 'Retirada escombros estándar', NULL, NULL, 'standard', 60.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-64', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(65, 54, 'Andamio básico', NULL, NULL, 'standard', 80.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-65', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(66, 55, 'Licencia estándar', NULL, NULL, 'standard', 300.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-66', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(67, 56, 'Dirección técnica completa', NULL, NULL, 'premium', 500.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-67', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(68, 57, 'Seguridad obra', NULL, NULL, 'standard', 250.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-68', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(69, 58, 'Limpieza estándar', NULL, NULL, 'standard', 150.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-69', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(70, 59, 'Entrega formal', NULL, NULL, 'standard', 0.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-70', 'Generic Supplier', 0, 'https://example.com/img/default.jpg'),
(71, 60, 'Revisión final técnica', NULL, NULL, 'standard', 0.00, 1, '2026-03-30 11:15:29', '2026-03-30 11:17:34', 1, 'GEN-71', 'Generic Supplier', 0, 'https://example.com/img/default.jpg');

-- Variantes catálogo (baldosas/rajolas, suelos, pintura, carpintería)
INSERT INTO `lineitem_materials_variants` (`id`, `lineitem_id`, `name`, `material`, `brand`, `quality`, `price`, `is_active`, `created_at`, `updated_at`, `is_default`, `sku`, `supplier`, `stock`, `image_url`) VALUES
(201, 101, 'Porcelánico arena mate', 'porcelánico', 'Porcelanosa', 'premium', 28.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'REV-101', 'Porcelanosa', 200, 'https://example.com/img/porcelanico-arena.jpg'),
(202, 102, 'Hidráulico azul clásico', 'hidráulico', 'LeroyMerlin', 'standard', 35.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'REV-102', 'LeroyMerlin', 120, 'https://example.com/img/hidraulico-azul.jpg'),
(203, 103, 'Metro blanco brillo', 'cerámica', 'Roca', 'standard', 22.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'REV-103', 'Roca', 300, 'https://example.com/img/azulejo-metro.jpg'),
(204, 104, 'Geométrico gris', 'cerámica', 'Porcelanosa', 'premium', 32.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'REV-104', 'Porcelanosa', 150, 'https://example.com/img/azulejo-geom.jpg'),
(205, 105, 'Laminado roble claro', 'laminado', 'Finfloor', 'standard', 24.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'REV-105', 'Finfloor', 180, 'https://example.com/img/laminado-roble.jpg'),
(206, 106, 'Blanco roto mate', 'pintura', 'Bruguer', 'standard', 6.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'PIN-106', 'Bruguer', 500, 'https://example.com/img/pintura-blanco.jpg'),
(207, 107, 'Gris perla satinado', 'pintura', 'Titan', 'premium', 7.50, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'PIN-107', 'Titan', 400, 'https://example.com/img/pintura-gris.jpg'),
(208, 108, 'Antihumedad baño', 'pintura', 'Sika', 'premium', 9.50, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'PIN-108', 'Sika', 250, 'https://example.com/img/pintura-antihumedad.jpg'),
(209, 109, 'Puerta lacada blanca', 'madera', 'PuertasCastell', 'standard', 180.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'CARP-109', 'PuertasCastell', 60, 'https://example.com/img/puerta-lacada.jpg'),
(210, 110, 'Marco MDF blanco', 'madera', 'PuertasCastell', 'standard', 65.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'CARP-110', 'PuertasCastell', 120, 'https://example.com/img/marco-blanco.jpg'),
(211, 111, 'Puerta abatible roble', 'madera', 'PuertasCastell', 'premium', 210.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'CARP-111', 'PuertasCastell', 40, 'https://example.com/img/puerta-roble.jpg'),
(212, 112, 'Corredera vidrio esmerilado', 'vidrio', 'PuertasCastell', 'premium', 260.00, 1, '2026-04-01 10:00:00', '2026-04-01 10:00:00', 1, 'CARP-112', 'PuertasCastell', 30, 'https://example.com/img/puerta-corredera.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `projects`
--

INSERT INTO `projects` (`id`, `name`, `created_at`) VALUES
(1, 'Reforma baño pequeño antiguo', '2026-03-30 11:24:56'),
(2, 'Reforma parcial cocina', '2026-03-30 11:24:56'),
(3, 'Reforma integral piso 60m2', '2026-03-30 11:24:56'),
(4, 'Lavado de cara baño moderno', '2026-03-30 11:24:56'),
(5, 'Reforma completa cocina antigua', '2026-03-30 11:24:56'),
(6, 'Baño parcial con mejoras', '2026-03-30 11:24:56'),
(7, 'Reforma ático con redistribución', '2026-03-30 11:24:56'),
(8, 'Cocina nueva obra reciente', '2026-03-30 11:24:56'),
(9, 'Baño muy deteriorado', '2026-03-30 11:24:56'),
(10, 'Reforma estética general', '2026-03-30 11:24:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_equipment_selections`
--

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

--
-- Volcado de datos para la tabla `project_equipment_selections`
--

INSERT INTO `project_equipment_selections` (`id`, `project_id`, `lineitem_id`, `variant_id`, `quantity`, `unit_price`, `room`, `is_selected`, `created_at`, `updated_at`) VALUES
(1, 1, 34, 39, 1, NULL, 'bathroom', 1, '2026-03-30 11:29:18', '2026-03-30 11:29:18'),
(2, 1, 34, 39, 1, NULL, 'bathroom', 1, '2026-03-30 11:31:41', '2026-03-30 11:31:41'),
(3, 1, 35, 41, 1, NULL, 'bathroom', 1, '2026-03-30 11:31:41', '2026-03-30 11:31:41'),
(4, 1, 39, 46, 1, NULL, 'bathroom', 1, '2026-03-30 11:31:41', '2026-03-30 11:31:41'),
(5, 2, 42, 52, 1, NULL, 'kitchen', 1, '2026-03-30 11:31:41', '2026-03-30 11:31:41'),
(6, 2, 43, 53, 1, NULL, 'kitchen', 1, '2026-03-30 11:31:41', '2026-03-30 11:31:41'),
(7, 2, 44, 54, 1, NULL, 'kitchen', 1, '2026-03-30 11:31:41', '2026-03-30 11:31:41'),
(8, 1, 14, 15, 2, NULL, 'bathroom', 1, '2026-03-30 11:33:21', '2026-03-30 11:33:21'),
(9, 1, 17, 18, 3, NULL, 'bathroom', 1, '2026-03-30 11:33:21', '2026-03-30 11:33:21'),
(10, 2, 12, 12, 5, NULL, 'kitchen', 1, '2026-03-30 11:33:21', '2026-03-30 11:33:21'),
(11, 2, 23, 24, 1, NULL, 'kitchen', 1, '2026-03-30 11:33:21', '2026-03-30 11:33:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_extras`
--

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

--
-- Volcado de datos para la tabla `project_extras`
--

INSERT INTO `project_extras` (`id`, `project_id`, `debris_removal`, `municipal_permits`, `dumpster_required`, `protection_required`, `final_cleaning`, `created_at`) VALUES
(1, 1, 1, 1, 1, 1, 1, '2026-03-30 11:35:45'),
(2, 2, 1, 0, 0, 1, 1, '2026-03-30 11:35:45'),
(3, 3, 1, 1, 1, 1, 1, '2026-03-30 11:35:45'),
(4, 4, 0, 0, 0, 0, 1, '2026-03-30 11:35:45'),
(5, 5, 1, 1, 1, 1, 1, '2026-03-30 11:35:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_financials`
--

CREATE TABLE `project_financials` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `margin_percentage` decimal(5,2) DEFAULT 15.00,
  `contingency_percentage` decimal(5,2) DEFAULT 10.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `project_financials`
--

INSERT INTO `project_financials` (`id`, `project_id`, `margin_percentage`, `contingency_percentage`, `created_at`) VALUES
(1, 1, 20.00, 15.00, '2026-03-30 11:36:35'),
(2, 2, 15.00, 10.00, '2026-03-30 11:36:35'),
(3, 3, 25.00, 20.00, '2026-03-30 11:36:35'),
(4, 4, 10.00, 5.00, '2026-03-30 11:36:35'),
(5, 5, 18.00, 12.00, '2026-03-30 11:36:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_installations`
--

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

--
-- Volcado de datos para la tabla `project_installations`
--

INSERT INTO `project_installations` (`id`, `project_id`, `plumbing_renovation`, `electrical_renovation`, `gas_renovation`, `new_water_points`, `new_light_points`, `new_socket_points`, `heating_type`, `has_heating_system`, `created_at`, `updated_at`) VALUES
(1, 1, 'full', 'full', 'none', 2, 3, 2, 'electric', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(2, 2, 'partial', 'partial', 'partial', 1, 2, 3, 'gas', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(3, 3, 'full', 'full', 'full', 5, 8, 10, 'aerothermal', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(4, 4, 'none', 'none', 'none', 0, 1, 0, 'electric', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(5, 5, 'full', 'full', 'full', 3, 5, 6, 'gas', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(6, 6, 'partial', 'partial', 'none', 1, 2, 2, 'electric', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(7, 7, 'full', 'full', 'full', 6, 10, 12, 'aerothermal', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(8, 8, 'none', 'none', 'none', 2, 4, 5, 'electric', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(9, 9, 'full', 'full', 'none', 2, 3, 2, 'electric', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15'),
(10, 10, 'none', 'partial', 'none', 0, 2, 2, 'electric', 1, '2026-03-30 11:26:15', '2026-03-30 11:26:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_labor`
--

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

--
-- Volcado de datos para la tabla `project_labor`
--

INSERT INTO `project_labor` (`id`, `project_id`, `masonry_hours`, `plumbing_hours`, `electrical_hours`, `carpentry_hours`, `installation_hours`, `project_management_hours`, `created_at`) VALUES
(1, 1, 20.00, 15.00, 10.00, 5.00, 8.00, 6.00, '2026-03-30 11:35:24'),
(2, 2, 10.00, 8.00, 6.00, 4.00, 5.00, 4.00, '2026-03-30 11:35:24'),
(3, 3, 80.00, 40.00, 35.00, 20.00, 25.00, 15.00, '2026-03-30 11:35:24'),
(4, 4, 5.00, 0.00, 2.00, 0.00, 3.00, 2.00, '2026-03-30 11:35:24'),
(5, 5, 30.00, 20.00, 15.00, 10.00, 12.00, 8.00, '2026-03-30 11:35:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_location`
--

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

--
-- Volcado de datos para la tabla `project_location`
--

INSERT INTO `project_location` (`id`, `project_id`, `city`, `province`, `has_elevator`, `has_parking`, `floor`, `created_at`) VALUES
(1, 1, 'Barcelona', 'Barcelona', 1, 0, 3, '2026-03-30 11:36:01'),
(2, 2, 'Tarragona', 'Tarragona', 0, 1, 2, '2026-03-30 11:36:01'),
(3, 3, 'Madrid', 'Madrid', 1, 1, 5, '2026-03-30 11:36:01'),
(4, 4, 'Reus', 'Tarragona', 1, 1, 1, '2026-03-30 11:36:01'),
(5, 5, 'Valencia', 'Valencia', 0, 0, 4, '2026-03-30 11:36:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_material_selections`
--

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

--
-- Volcado de datos para la tabla `project_material_selections`
--

INSERT INTO `project_material_selections` (`id`, `project_id`, `lineitem_id`, `variant_id`, `quantity`, `unit_price`, `is_selected`, `is_custom`, `created_at`, `updated_at`) VALUES
(21, 1, 26, 28, 5.00, NULL, 1, 0, '2026-03-30 11:28:18', '2026-03-30 11:28:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_scope`
--

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

--
-- Volcado de datos para la tabla `project_scope`
--

INSERT INTO `project_scope` (`id`, `project_id`, `reform_type`, `has_layout_changes`, `move_kitchen`, `move_bathroom`, `demolish_walls`, `open_spaces`, `created_at`, `updated_at`) VALUES
(1, 1, 'integral', 0, 0, 0, 1, 0, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(2, 2, 'partial', 0, 0, 0, 0, 0, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(3, 3, 'integral', 1, 1, 1, 1, 1, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(4, 4, 'partial', 0, 0, 0, 0, 0, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(5, 5, 'integral', 1, 1, 0, 1, 1, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(6, 6, 'partial', 0, 0, 0, 1, 0, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(7, 7, 'integral', 1, 1, 1, 1, 1, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(8, 8, 'partial', 0, 0, 0, 0, 0, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(9, 9, 'integral', 0, 0, 0, 1, 0, '2026-03-30 11:25:11', '2026-03-30 11:25:11'),
(10, 10, 'partial', 0, 0, 0, 0, 0, '2026-03-30 11:25:11', '2026-03-30 11:25:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_space_state`
--

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

--
-- Volcado de datos para la tabla `project_space_state`
--

INSERT INTO `project_space_state` (`id`, `project_id`, `area_m2`, `height_m`, `has_distribution_plan`, `plumbing_status`, `electrical_status`, `drainage_status`, `wall_type`, `demolition_required`, `created_at`, `updated_at`) VALUES
(1, 1, 4.50, 2.50, 0, 'bad', 'bad', 'bad', 'brick', 1, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(2, 2, 8.00, 2.60, 1, 'regular', 'good', 'good', 'mixed', 0, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(3, 3, 55.00, 2.70, 1, 'bad', 'bad', 'regular', 'load_bearing', 1, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(4, 4, 5.20, 2.50, 1, 'good', 'good', 'good', 'pladur', 0, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(5, 5, 10.50, 2.60, 0, 'bad', 'bad', 'bad', 'brick', 1, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(6, 6, 3.80, 2.40, 0, 'regular', 'regular', 'good', 'mixed', 1, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(7, 7, 70.00, 2.80, 1, 'regular', 'bad', 'regular', 'load_bearing', 1, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(8, 8, 9.00, 2.60, 1, 'good', 'good', 'good', 'pladur', 0, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(9, 9, 4.00, 2.50, 0, 'bad', 'bad', 'bad', 'brick', 1, '2026-03-30 11:21:07', '2026-03-30 11:21:07'),
(10, 10, 6.00, 2.50, 1, 'good', 'regular', 'good', 'mixed', 0, '2026-03-30 11:21:07', '2026-03-30 11:21:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_timeline`
--

CREATE TABLE `project_timeline` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `estimated_days` int(11) DEFAULT NULL,
  `urgency_level` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `project_timeline`
--

INSERT INTO `project_timeline` (`id`, `project_id`, `estimated_days`, `urgency_level`, `created_at`) VALUES
(1, 1, 7, 'high', '2026-03-30 11:36:17'),
(2, 2, 10, 'medium', '2026-03-30 11:36:17'),
(3, 3, 30, 'high', '2026-03-30 11:36:17'),
(4, 4, 3, 'low', '2026-03-30 11:36:17'),
(5, 5, 15, 'medium', '2026-03-30 11:36:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subcategory_materials`
--

CREATE TABLE `subcategory_materials` (
  `id` int(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `subcategory_materials`
--

INSERT INTO `subcategory_materials` (`id`, `created_at`, `category_id`, `name`) VALUES
(1, '2026-03-30 11:03:36', 100001, 'Demolición de tabiques'),
(2, '2026-03-30 11:03:36', 100001, 'Retirada de suelos'),
(3, '2026-03-30 11:03:36', 100001, 'Retirada de alicatados'),
(4, '2026-03-30 11:03:36', 100002, 'Levantado de tabiques'),
(5, '2026-03-30 11:03:36', 100002, 'Enfoscados y yesos'),
(6, '2026-03-30 11:03:36', 100002, 'Recrecidos de suelo'),
(7, '2026-03-30 11:03:36', 100003, 'Refuerzos estructurales'),
(8, '2026-03-30 11:03:36', 100003, 'Apertura de huecos'),
(9, '2026-03-30 11:03:36', 100004, 'Cerramientos interiores'),
(10, '2026-03-30 11:03:36', 100004, 'Cerramientos exteriores'),
(11, '2026-03-30 11:03:36', 100005, 'Instalación de tuberías'),
(12, '2026-03-30 11:03:36', 100005, 'Desagües'),
(13, '2026-03-30 11:03:36', 100005, 'Puntos de agua'),
(14, '2026-03-30 11:03:36', 100006, 'Cableado'),
(15, '2026-03-30 11:03:36', 100006, 'Cuadro eléctrico'),
(16, '2026-03-30 11:03:36', 100006, 'Puntos eléctricos'),
(17, '2026-03-30 11:03:36', 100007, 'Instalación de gas'),
(18, '2026-03-30 11:03:36', 100007, 'Conexiones'),
(19, '2026-03-30 11:03:36', 100008, 'Aire acondicionado'),
(20, '2026-03-30 11:03:36', 100008, 'Calefacción'),
(21, '2026-03-30 11:03:36', 100009, 'Extracción de aire'),
(22, '2026-03-30 11:03:36', 100009, 'Ventilación forzada'),
(23, '2026-03-30 11:03:36', 100010, 'Revestimientos verticales'),
(24, '2026-03-30 11:03:36', 100010, 'Revestimientos decorativos'),
(25, '2026-03-30 11:03:36', 100011, 'Suelos cerámicos'),
(26, '2026-03-30 11:03:36', 100011, 'Suelos laminados'),
(27, '2026-03-30 11:03:36', 100012, 'Alicatado de paredes'),
(28, '2026-03-30 11:03:36', 100012, 'Alicatado decorativo'),
(29, '2026-03-30 11:03:36', 100013, 'Impermeabilización de duchas'),
(30, '2026-03-30 11:03:36', 100013, 'Sellado de juntas'),
(31, '2026-03-30 11:03:36', 100014, 'Pintura interior'),
(32, '2026-03-30 11:03:36', 100014, 'Pintura técnica'),
(33, '2026-03-30 11:03:36', 100015, 'Inodoros'),
(34, '2026-03-30 11:03:36', 100015, 'Lavabos'),
(35, '2026-03-30 11:03:36', 100016, 'Muebles de baño'),
(36, '2026-03-30 11:03:36', 100016, 'Almacenamiento'),
(37, '2026-03-30 11:03:36', 100017, 'Grifería lavabo'),
(38, '2026-03-30 11:03:36', 100017, 'Grifería ducha'),
(39, '2026-03-30 11:03:36', 100018, 'Mamparas de ducha'),
(40, '2026-03-30 11:03:36', 100018, 'Mamparas de bañera'),
(41, '2026-03-30 11:03:36', 100019, 'Muebles bajos'),
(42, '2026-03-30 11:03:36', 100019, 'Muebles altos'),
(43, '2026-03-30 11:03:36', 100020, 'Encimeras de cuarzo'),
(44, '2026-03-30 11:03:36', 100020, 'Encimeras de granito'),
(45, '2026-03-30 11:03:36', 100021, 'Cocción'),
(46, '2026-03-30 11:03:36', 100021, 'Lavado'),
(47, '2026-03-30 11:03:36', 100022, 'Fregaderos inox'),
(48, '2026-03-30 11:03:36', 100022, 'Fregaderos integrados'),
(49, '2026-03-30 11:03:36', 100023, 'Puertas interiores'),
(50, '2026-03-30 11:03:36', 100023, 'Armarios'),
(51, '2026-03-30 11:03:36', 100024, 'Ventanas'),
(52, '2026-03-30 11:03:36', 100024, 'Cerramientos exteriores'),
(53, '2026-03-30 11:03:36', 100025, 'Puertas abatibles'),
(54, '2026-03-30 11:03:36', 100025, 'Puertas correderas'),
(55, '2026-03-30 11:03:36', 100026, 'Ventanas PVC'),
(56, '2026-03-30 11:03:36', 100026, 'Ventanas aluminio'),
(57, '2026-03-30 11:03:36', 100027, 'Iluminación general'),
(58, '2026-03-30 11:03:36', 100027, 'Iluminación decorativa'),
(59, '2026-03-30 11:03:36', 100028, 'Enchufes'),
(60, '2026-03-30 11:03:36', 100028, 'Interruptores'),
(61, '2026-03-30 11:03:36', 100029, 'Aislamiento paredes'),
(62, '2026-03-30 11:03:36', 100029, 'Aislamiento suelos'),
(63, '2026-03-30 11:03:36', 100030, 'Aislamiento ruido'),
(64, '2026-03-30 11:03:36', 100030, 'Paneles acústicos'),
(65, '2026-03-30 11:03:36', 100031, 'Transporte de materiales'),
(66, '2026-03-30 11:03:36', 100032, 'Retirada de escombros'),
(67, '2026-03-30 11:03:36', 100033, 'Andamios'),
(68, '2026-03-30 11:03:36', 100034, 'Licencias'),
(69, '2026-03-30 11:03:36', 100035, 'Dirección técnica'),
(70, '2026-03-30 11:03:36', 100036, 'Seguridad en obra'),
(71, '2026-03-30 11:03:36', 100037, 'Limpieza post-obra'),
(72, '2026-03-30 11:03:36', 100038, 'Entrega de obra'),
(73, '2026-03-30 11:03:36', 100039, 'Revisión final');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `category_materials`
--
ALTER TABLE `category_materials`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `lineitem_materials`
--
ALTER TABLE `lineitem_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_lineitem_subcategory` (`subcategory_id`);

--
-- Indices de la tabla `lineitem_materials_variants`
--
ALTER TABLE `lineitem_materials_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_variant_lineitem` (`lineitem_id`);

--
-- Indices de la tabla `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `project_equipment_selections`
--
ALTER TABLE `project_equipment_selections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_equipment_project` (`project_id`),
  ADD KEY `fk_equipment_lineitem` (`lineitem_id`),
  ADD KEY `fk_equipment_variant` (`variant_id`);

--
-- Indices de la tabla `project_extras`
--
ALTER TABLE `project_extras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_extras_project` (`project_id`);

--
-- Indices de la tabla `project_financials`
--
ALTER TABLE `project_financials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_financials_project` (`project_id`);

--
-- Indices de la tabla `project_installations`
--
ALTER TABLE `project_installations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_installations_project` (`project_id`);

--
-- Indices de la tabla `project_labor`
--
ALTER TABLE `project_labor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_labor_project` (`project_id`);

--
-- Indices de la tabla `project_location`
--
ALTER TABLE `project_location`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_location_project` (`project_id`);

--
-- Indices de la tabla `project_material_selections`
--
ALTER TABLE `project_material_selections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_selection_project` (`project_id`),
  ADD KEY `fk_selection_lineitem` (`lineitem_id`),
  ADD KEY `fk_selection_variant` (`variant_id`);

--
-- Indices de la tabla `project_scope`
--
ALTER TABLE `project_scope`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_scope_project` (`project_id`);

--
-- Indices de la tabla `project_space_state`
--
ALTER TABLE `project_space_state`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `project_timeline`
--
ALTER TABLE `project_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_timeline_project` (`project_id`);

--
-- Indices de la tabla `subcategory_materials`
--
ALTER TABLE `subcategory_materials`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `category_materials`
--
ALTER TABLE `category_materials`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100040;

--
-- AUTO_INCREMENT de la tabla `lineitem_materials`
--
ALTER TABLE `lineitem_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT de la tabla `lineitem_materials_variants`
--
ALTER TABLE `lineitem_materials_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT de la tabla `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `project_equipment_selections`
--
ALTER TABLE `project_equipment_selections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `project_extras`
--
ALTER TABLE `project_extras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `project_financials`
--
ALTER TABLE `project_financials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `project_installations`
--
ALTER TABLE `project_installations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `project_labor`
--
ALTER TABLE `project_labor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `project_location`
--
ALTER TABLE `project_location`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `project_material_selections`
--
ALTER TABLE `project_material_selections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `project_scope`
--
ALTER TABLE `project_scope`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `project_space_state`
--
ALTER TABLE `project_space_state`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `project_timeline`
--
ALTER TABLE `project_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `subcategory_materials`
--
ALTER TABLE `subcategory_materials`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `lineitem_materials`
--
ALTER TABLE `lineitem_materials`
  ADD CONSTRAINT `fk_lineitem_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategory_materials` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `lineitem_materials_variants`
--
ALTER TABLE `lineitem_materials_variants`
  ADD CONSTRAINT `fk_variant_lineitem` FOREIGN KEY (`lineitem_id`) REFERENCES `lineitem_materials` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_equipment_selections`
--
ALTER TABLE `project_equipment_selections`
  ADD CONSTRAINT `fk_equipment_lineitem` FOREIGN KEY (`lineitem_id`) REFERENCES `lineitem_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_equipment_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_equipment_variant` FOREIGN KEY (`variant_id`) REFERENCES `lineitem_materials_variants` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_extras`
--
ALTER TABLE `project_extras`
  ADD CONSTRAINT `fk_extras_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_financials`
--
ALTER TABLE `project_financials`
  ADD CONSTRAINT `fk_financials_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_installations`
--
ALTER TABLE `project_installations`
  ADD CONSTRAINT `fk_installations_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_labor`
--
ALTER TABLE `project_labor`
  ADD CONSTRAINT `fk_labor_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_location`
--
ALTER TABLE `project_location`
  ADD CONSTRAINT `fk_location_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_material_selections`
--
ALTER TABLE `project_material_selections`
  ADD CONSTRAINT `fk_selection_lineitem` FOREIGN KEY (`lineitem_id`) REFERENCES `lineitem_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_selection_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_selection_variant` FOREIGN KEY (`variant_id`) REFERENCES `lineitem_materials_variants` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_scope`
--
ALTER TABLE `project_scope`
  ADD CONSTRAINT `fk_scope_project` FOREIGN KEY (`project_id`) REFERENCES `project_space_state` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `project_timeline`
--
ALTER TABLE `project_timeline`
  ADD CONSTRAINT `fk_timeline_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
