-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 07, 2025 at 01:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `car_rental`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_status` varchar(50) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `car_id`, `start_date`, `end_date`, `total_price`, `status`, `created_at`, `payment_status`) VALUES
(64, 8, 5, '2025-12-07', '2025-12-08', 2700.00, 'confirmed', '2025-12-06 23:17:31', 'pending'),
(65, 11, 2, '2025-12-07', '2025-12-08', 2500.00, 'confirmed', '2025-12-07 11:54:19', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `model` varchar(100) NOT NULL,
  `make` varchar(50) DEFAULT NULL,
  `year` int(4) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `availability` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`id`, `model`, `make`, `year`, `type`, `price_per_day`, `availability`) VALUES
(1, 'Toyota Vios', 'Toyota', 2020, 'Sedan', 1500.00, 1),
(2, 'Honda CR-V', 'Honda', 2019, 'SUV', 2500.00, 0),
(3, 'Nissan Almera', 'Nissan', 2018, 'Sedan', 1400.00, 1),
(4, 'Mitsubishi Xpander', 'Mitsubishi', 2020, 'MPV', 2200.00, 1),
(5, 'Ford Ranger', 'Ford', 2018, 'Pickup', 2700.00, 1),
(6, 'Hyundai Accent', 'Hyundai', 2017, 'Sedan', 1600.00, 1),
(35, 'Hyundai Grand Starex', 'Hyundai', 2016, 'Van', 2800.00, 1),
(36, 'Tonery Tiggo 2', 'Tiggo', 2024, 'SUV', 2200.00, 1),
(37, 'Toyota Fortuner', 'Toyota', 2016, 'SUV', 3200.00, 1),
(38, 'Toyota HiAce', 'Toyota', 2016, 'Van', 2900.00, 1),
(39, 'Toyota Hilux', 'Toyota', 2017, 'Pickup', 2800.00, 1),
(40, 'Toyota Scion xB', 'Toyota', 2004, 'Compact', 1800.00, 1),
(41, 'Kia Picanto', 'Kia', 2003, 'Compact', 1200.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(255) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `role`) VALUES
(4, 'Test User', 'test@example.com', '$2b$10$SAGkgHelfnf1McVU.pxkXuxA6lRLVIpNqPxLH1oXtVBY57UXDyD6O', '2025-11-17 14:23:03', 'user'),
(5, 'API Test User', 'apitest@example.com', '$2b$10$O0QmFdOLhWCcsRrjZ.1V7eOSaVjRiDqCxUKmgsG002i3dD5ofAfhG', '2025-11-17 14:25:17', 'user'),
(7, 'Admin User', 'admin@carrentals.com', '$2b$10$2/JSh6ISkGEiVbFK/rwzR.ajtpWiwREWC1fHJGK97BE1otRhjXawe', '2025-11-26 03:53:54', 'user'),
(8, 'Abby Bobby', 'abby@2992.email.com', '$2b$10$jza/gqrNghRonkzXzPNeAunaqlLS4eorKxxE2gwjXFowFKKtTuvFS', '2025-11-27 04:46:36', 'user'),
(11, 'kl', 'klongi@yahoo.com', '$2b$10$fn2guzylXQyiP1kB0gJK9eA0brWvI/xAqVj1nJlQkdUml7EAbTKw2', '2025-11-27 09:27:55', 'user'),
(12, 'loki', 'loki@email.com', '$2b$10$57GerHLFD2Rx9Vhrs/Rjd.dOc6LyRJ83N3RUrdTm18thb8VFCYhtK', '2025-12-03 01:44:43', 'user'),
(14, 'Kobe Go', 'kobeg@gmail.com', '$2b$10$dyMd2VQ./Y7d5hahmAPSx.1VcVz2A5OWkusl7RKLiRa3YBIb6AiBW', '2025-12-05 16:25:39', 'user'),
(16, 'Admin Poge', 'adminpoge@email.com', '$2b$10$ZapEaSytJ/KNDGg/r21UFOPxQh9i6mmPhboKIxgJrz9qLqxG9I7Z6', '2025-12-06 23:46:20', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
