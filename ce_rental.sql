-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2025 at 10:28 PM
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
-- Database: `ce_rental`
--

-- --------------------------------------------------------

--
-- Table structure for table `borrowing_requests`
--

CREATE TABLE `borrowing_requests` (
  `request_id` int(11) NOT NULL,
  `motorcycle_id` int(11) NOT NULL,
  `borrower_id` int(11) NOT NULL,
  `lecturer_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `borrow_date` date NOT NULL,
  `return_date` date NOT NULL,
  `actual_return_date` date DEFAULT NULL,
  `status` enum('Pending','Approved','Disapproved','Returned') NOT NULL DEFAULT 'Pending',
  `total_price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrowing_requests`
--

INSERT INTO `borrowing_requests` (`request_id`, `motorcycle_id`, `borrower_id`, `lecturer_id`, `staff_id`, `borrow_date`, `return_date`, `actual_return_date`, `status`, `total_price`) VALUES
(46, 1, 9, 11, 10, '2025-04-22', '2025-04-26', '2025-04-22', 'Returned', 1200.00),
(47, 1, 9, 1, 2, '2025-04-22', '2025-04-26', '2025-04-22', 'Returned', 1200.00),
(48, 15, 9, NULL, NULL, '2025-09-02', '2025-09-06', NULL, 'Approved', 4000.00);

-- --------------------------------------------------------

--
-- Table structure for table `motorcycles`
--

CREATE TABLE `motorcycles` (
  `motorcycle_id` int(11) NOT NULL,
  `model` varchar(100) NOT NULL,
  `status` enum('available','pending','borrowed','disabled') NOT NULL DEFAULT 'available',
  `img` varchar(255) NOT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `Register` varchar(10) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `motorcycles`
--

INSERT INTO `motorcycles` (`motorcycle_id`, `model`, `status`, `img`, `created_by`, `Register`, `price`) VALUES
(1, 'HONDA Wave 110i', 'borrowed', 'wave110i.png', 2, 'NP-1235', 300.00),
(2, 'HONDA Wave 125i', 'available', 'wave125i.png', 2, 'NB-7349', 200.00),
(3, 'HONDA Scoopy Urban', 'available', 'scoopyUrban.png', 2, 'JB-1290', 400.00),
(4, 'HONDA PCX 160', 'available', 'Pcx.png', 2, 'UB-8394', 550.00),
(5, 'YAMAHA FINO', 'available', 'FinoYamaha.png', 2, 'VP-1150', 600.00),
(6, 'YAMAHA NMAX 125', 'available', 'Nmax.png', 2, 'WV-6200', 650.00),
(7, 'YAMAHA XMAX 300', 'available', 'Xmax.png', 2, 'WV-3026', 700.00),
(8, 'VESPA GTS 310', 'available', 'Vespa.png', 2, 'XM-9919', 850.00),
(9, 'Zontes 368G', 'available', 'Zontes.png', 2, 'ZT-888', 900.00),
(10, 'Kawasaki Ninja H2R', 'available', 'Ninja.png', 2, 'ZT-678', 1000.00),
(15, 'Mario', 'borrowed', 'Mario.png', 2, 'MR-123', 1000.00);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `u_id` int(10) UNSIGNED NOT NULL,
  `u_username` varchar(255) NOT NULL,
  `u_password` varchar(255) NOT NULL,
  `u_role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`u_id`, `u_username`, `u_password`, `u_role`) VALUES
(1, 'lender', '$2b$10$WzG79aeXJrzNsZql1vunve8YWyeao5WbYw2Rl4pFJEvuIiiGBWMR2', 3),
(2, 'staff', '$2b$10$WzG79aeXJrzNsZql1vunve8YWyeao5WbYw2Rl4pFJEvuIiiGBWMR2', 2),
(5, 'student3', '$2b$10$WzG79aeXJrzNsZql1vunve8YWyeao5WbYw2Rl4pFJEvuIiiGBWMR2', 1),
(6, 'Kevin', '$2b$10$j9.2y4mLx9BK78Ebs4Ejve8DQVTZ8eGKMqcMilw892lYXnKINRsw.', 3),
(7, 'jame', '$2b$10$jIjxkfboVbHhbbpr9u7CROyz.vPEB7E7Mm7oZpfnULoe54WOERmI2', 2),
(8, 'Kevinn', '$2b$10$D1Jnxjjl21gkyVojHg3SaO07y224iEGYHu7pK2.X.BQzZxjK4kOti', 1),
(9, 'Com', '$2b$10$tygsvFr1IFW0oKXvNAwMA.gYF8BIadUebAyfTxVi3qqTGAU/Q7/AC', 1),
(10, 'Pub', '$2b$10$zUP4dvIYsENTrNEOfBx7YuFpuB6SoCQqgW6GxPBYBVMoBhrCSHBRq', 2),
(11, 'C', '$2b$10$mxVU9wdSjvlVYaBUX.srPuT0ZrttG/mMWK16x5ge6nNcWkTLP29FC', 3),
(12, 'Prae', '$2b$10$Oq/XUpbrXOx83SnTB/SbOufSG.V9g1neEO5oL4zrdimG59gyZujCe', 1),
(13, 'Sali', '$2b$10$ms7xZve6kxdUqYTECkEUyeT45qnae0RQiNBL9qgkOVnGynSAmNyl.', 1),
(14, 'Cz', '$2b$10$Hvq.cAy6VkOfGS7ZLRJ9NOF3/b1b8UjljdDjeFxOZd8c9/noq9t26', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `borrowing_requests`
--
ALTER TABLE `borrowing_requests`
  ADD PRIMARY KEY (`request_id`);

--
-- Indexes for table `motorcycles`
--
ALTER TABLE `motorcycles`
  ADD PRIMARY KEY (`motorcycle_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`u_id`),
  ADD UNIQUE KEY `u_username` (`u_username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `borrowing_requests`
--
ALTER TABLE `borrowing_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `motorcycles`
--
ALTER TABLE `motorcycles`
  MODIFY `motorcycle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `u_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `motorcycles`
--
ALTER TABLE `motorcycles`
  ADD CONSTRAINT `motorcycles_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user` (`u_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
