CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`module` varchar(100) NOT NULL,
	`entityType` varchar(100),
	`entityId` int,
	`oldValues` text,
	`newValues` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phoneNumber` varchar(20),
	`address` text,
	`totalDebt` decimal(12,2) NOT NULL DEFAULT '0',
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debtPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`saleId` int,
	`paymentAmount` decimal(12,2) NOT NULL,
	`paymentDate` datetime NOT NULL,
	`paymentMethod` enum('cash','card','check') NOT NULL,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debtPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`deliveryDate` datetime NOT NULL,
	`status` enum('pending','in_transit','completed','returned') NOT NULL DEFAULT 'pending',
	`totalQuantity` decimal(10,2) NOT NULL,
	`returnedQuantity` decimal(10,2) NOT NULL DEFAULT '0',
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`returnedQuantity` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliveryItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driverSettlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`settlementDate` datetime NOT NULL,
	`totalEarnings` decimal(12,2) NOT NULL,
	`returnDeductions` decimal(12,2) NOT NULL DEFAULT '0',
	`advances` decimal(12,2) NOT NULL DEFAULT '0',
	`netPayout` decimal(12,2) NOT NULL,
	`status` enum('pending','paid','partial') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driverSettlements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`licenseNumber` varchar(50),
	`vehicleNumber` varchar(50),
	`phoneNumber` varchar(20),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`surname` varchar(255) NOT NULL,
	`position` varchar(100),
	`phoneNumber` varchar(20),
	`monthlySalary` decimal(12,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`hireDate` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenseCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenseCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `expenseCategories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`expenseDate` datetime NOT NULL,
	`isPaid` boolean NOT NULL DEFAULT false,
	`dueDate` datetime,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredientConsumption` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productionId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`quantityUsed` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingredientConsumption_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredientPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ingredientId` int NOT NULL,
	`quantity` decimal(12,2) NOT NULL,
	`unitCost` decimal(10,2) NOT NULL,
	`totalCost` decimal(12,2) NOT NULL,
	`purchaseDate` datetime NOT NULL,
	`supplier` varchar(255),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingredientPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`currentStock` decimal(12,2) NOT NULL DEFAULT '0',
	`minStockLevel` decimal(12,2) NOT NULL DEFAULT '0',
	`unitCost` decimal(10,2) NOT NULL,
	`supplier` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ownerSecretCode` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ownerSecretCode_id` PRIMARY KEY(`id`),
	CONSTRAINT `ownerSecretCode_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `production` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`productionDate` datetime NOT NULL,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `production_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`unitPrice` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL DEFAULT 'dona',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salaryPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`baseSalary` decimal(12,2) NOT NULL,
	`advances` decimal(12,2) NOT NULL DEFAULT '0',
	`deductions` decimal(12,2) NOT NULL DEFAULT '0',
	`netSalary` decimal(12,2) NOT NULL,
	`isPaid` boolean NOT NULL DEFAULT false,
	`paidDate` datetime,
	`paymentMethod` enum('cash','card','transfer'),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salaryPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`customerId` int,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`paymentMethod` enum('cash','card','debt') NOT NULL,
	`amountPaid` decimal(12,2) NOT NULL DEFAULT '0',
	`debtAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`saleDate` datetime NOT NULL,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('owner','manager','cashier','driver') NOT NULL DEFAULT 'cashier';--> statement-breakpoint
ALTER TABLE `users` ADD `surname` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `pinCode` varchar(6) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `userIdx` ON `auditLog` (`userId`);--> statement-breakpoint
CREATE INDEX `moduleIdx` ON `auditLog` (`module`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `auditLog` (`createdAt`);--> statement-breakpoint
CREATE INDEX `customerIdx` ON `debtPayments` (`customerId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `debtPayments` (`paymentDate`);--> statement-breakpoint
CREATE INDEX `driverIdx` ON `deliveries` (`driverId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `deliveries` (`deliveryDate`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `deliveries` (`status`);--> statement-breakpoint
CREATE INDEX `deliveryIdx` ON `deliveryItems` (`deliveryId`);--> statement-breakpoint
CREATE INDEX `productIdx` ON `deliveryItems` (`productId`);--> statement-breakpoint
CREATE INDEX `driverIdx` ON `driverSettlements` (`driverId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `driverSettlements` (`settlementDate`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `driverSettlements` (`status`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `drivers` (`userId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `employees` (`userId`);--> statement-breakpoint
CREATE INDEX `categoryIdx` ON `expenses` (`categoryId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `expenses` (`expenseDate`);--> statement-breakpoint
CREATE INDEX `paidIdx` ON `expenses` (`isPaid`);--> statement-breakpoint
CREATE INDEX `productionIdx` ON `ingredientConsumption` (`productionId`);--> statement-breakpoint
CREATE INDEX `ingredientIdx` ON `ingredientConsumption` (`ingredientId`);--> statement-breakpoint
CREATE INDEX `ingredientIdx` ON `ingredientPurchases` (`ingredientId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `ingredientPurchases` (`purchaseDate`);--> statement-breakpoint
CREATE INDEX `productIdx` ON `production` (`productId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `production` (`productionDate`);--> statement-breakpoint
CREATE INDEX `categoryIdx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `employeeIdx` ON `salaryPayments` (`employeeId`);--> statement-breakpoint
CREATE INDEX `monthYearIdx` ON `salaryPayments` (`month`);--> statement-breakpoint
CREATE INDEX `paidIdx` ON `salaryPayments` (`isPaid`);--> statement-breakpoint
CREATE INDEX `productIdx` ON `sales` (`productId`);--> statement-breakpoint
CREATE INDEX `customerIdx` ON `sales` (`customerId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `sales` (`saleDate`);--> statement-breakpoint
CREATE INDEX `paymentIdx` ON `sales` (`paymentMethod`);--> statement-breakpoint
CREATE INDEX `roleIdx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `activeIdx` ON `users` (`isActive`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;