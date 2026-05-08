import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  datetime,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow with PIN and role-based access.
 * Extended with bakery-specific fields for PIN login and secret code validation.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    surname: text("surname"),
    email: varchar("email", { length: 320 }),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    pinCode: varchar("pinCode", { length: 6 }).notNull(), // 4-6 digit PIN
    role: mysqlEnum("role", ["owner", "manager", "cashier", "driver"]).default("cashier").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index("roleIdx").on(table.role),
    activeIdx: index("activeIdx").on(table.isActive),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Owner secret code - additional security layer for admin access
 * Only the owner can set/change this code
 */
export const ownerSecretCode = mysqlTable("ownerSecretCode", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OwnerSecretCode = typeof ownerSecretCode.$inferSelect;

/**
 * Bakery products (bread, pastries, etc.)
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }), // bread, pastry, cake, etc.
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 50 }).default("dona").notNull(), // dona (piece), kg, etc.
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("categoryIdx").on(table.category),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Raw ingredients/materials for production
 */
export const ingredients = mysqlTable(
  "ingredients",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    unit: varchar("unit", { length: 50 }).notNull(), // kg, liter, etc.
    currentStock: decimal("currentStock", { precision: 12, scale: 2 }).default("0").notNull(),
    minStockLevel: decimal("minStockLevel", { precision: 12, scale: 2 }).default("0").notNull(),
    unitCost: decimal("unitCost", { precision: 10, scale: 2 }).notNull(),
    supplier: varchar("supplier", { length: 255 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

/**
 * Ingredient purchases/stock additions
 */
export const ingredientPurchases = mysqlTable(
  "ingredientPurchases",
  {
    id: int("id").autoincrement().primaryKey(),
    ingredientId: int("ingredientId").notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
    unitCost: decimal("unitCost", { precision: 10, scale: 2 }).notNull(),
    totalCost: decimal("totalCost", { precision: 12, scale: 2 }).notNull(),
    purchaseDate: datetime("purchaseDate").notNull(),
    supplier: varchar("supplier", { length: 255 }),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    ingredientIdx: index("ingredientIdx").on(table.ingredientId),
    dateIdx: index("dateIdx").on(table.purchaseDate),
  })
);

export type IngredientPurchase = typeof ingredientPurchases.$inferSelect;
export type InsertIngredientPurchase = typeof ingredientPurchases.$inferInsert;

/**
 * Daily production records
 */
export const production = mysqlTable(
  "production",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    productionDate: datetime("productionDate").notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdx: index("productIdx").on(table.productId),
    dateIdx: index("dateIdx").on(table.productionDate),
  })
);

export type Production = typeof production.$inferSelect;
export type InsertProduction = typeof production.$inferInsert;

/**
 * Ingredient consumption mapping (production to ingredients)
 */
export const ingredientConsumption = mysqlTable(
  "ingredientConsumption",
  {
    id: int("id").autoincrement().primaryKey(),
    productionId: int("productionId").notNull(),
    ingredientId: int("ingredientId").notNull(),
    quantityUsed: decimal("quantityUsed", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productionIdx: index("productionIdx").on(table.productionId),
    ingredientIdx: index("ingredientIdx").on(table.ingredientId),
  })
);

export type IngredientConsumption = typeof ingredientConsumption.$inferSelect;
export type InsertIngredientConsumption = typeof ingredientConsumption.$inferInsert;

/**
 * Customer records
 */
export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    address: text("address"),
    totalDebt: decimal("totalDebt", { precision: 12, scale: 2 }).default("0").notNull(),
    notes: text("notes"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Sales transactions
 */
export const sales = mysqlTable(
  "sales",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    customerId: int("customerId"),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "debt"]).notNull(),
    amountPaid: decimal("amountPaid", { precision: 12, scale: 2 }).default("0").notNull(),
    debtAmount: decimal("debtAmount", { precision: 12, scale: 2 }).default("0").notNull(),
    saleDate: datetime("saleDate").notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdx: index("productIdx").on(table.productId),
    customerIdx: index("customerIdx").on(table.customerId),
    dateIdx: index("dateIdx").on(table.saleDate),
    paymentIdx: index("paymentIdx").on(table.paymentMethod),
  })
);

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Customer debt payments
 */
export const debtPayments = mysqlTable(
  "debtPayments",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull(),
    saleId: int("saleId"),
    paymentAmount: decimal("paymentAmount", { precision: 12, scale: 2 }).notNull(),
    paymentDate: datetime("paymentDate").notNull(),
    paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "check"]).notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index("customerIdx").on(table.customerId),
    dateIdx: index("dateIdx").on(table.paymentDate),
  })
);

export type DebtPayment = typeof debtPayments.$inferSelect;
export type InsertDebtPayment = typeof debtPayments.$inferInsert;

/**
 * Drivers
 */
export const drivers = mysqlTable(
  "drivers",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    licenseNumber: varchar("licenseNumber", { length: 50 }),
    vehicleNumber: varchar("vehicleNumber", { length: 50 }),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
  })
);

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

/**
 * Delivery orders
 */
export const deliveries = mysqlTable(
  "deliveries",
  {
    id: int("id").autoincrement().primaryKey(),
    driverId: int("driverId").notNull(),
    deliveryDate: datetime("deliveryDate").notNull(),
    status: mysqlEnum("status", ["pending", "in_transit", "completed", "returned"]).default("pending").notNull(),
    totalQuantity: decimal("totalQuantity", { precision: 10, scale: 2 }).notNull(),
    returnedQuantity: decimal("returnedQuantity", { precision: 10, scale: 2 }).default("0").notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    driverIdx: index("driverIdx").on(table.driverId),
    dateIdx: index("dateIdx").on(table.deliveryDate),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;

/**
 * Delivery items
 */
export const deliveryItems = mysqlTable(
  "deliveryItems",
  {
    id: int("id").autoincrement().primaryKey(),
    deliveryId: int("deliveryId").notNull(),
    productId: int("productId").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    returnedQuantity: decimal("returnedQuantity", { precision: 10, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    deliveryIdx: index("deliveryIdx").on(table.deliveryId),
    productIdx: index("productIdx").on(table.productId),
  })
);

export type DeliveryItem = typeof deliveryItems.$inferSelect;
export type InsertDeliveryItem = typeof deliveryItems.$inferInsert;

/**
 * Driver settlements
 */
export const driverSettlements = mysqlTable(
  "driverSettlements",
  {
    id: int("id").autoincrement().primaryKey(),
    driverId: int("driverId").notNull(),
    settlementDate: datetime("settlementDate").notNull(),
    totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).notNull(),
    returnDeductions: decimal("returnDeductions", { precision: 12, scale: 2 }).default("0").notNull(),
    advances: decimal("advances", { precision: 12, scale: 2 }).default("0").notNull(),
    netPayout: decimal("netPayout", { precision: 12, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["pending", "paid", "partial"]).default("pending").notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    driverIdx: index("driverIdx").on(table.driverId),
    dateIdx: index("dateIdx").on(table.settlementDate),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type DriverSettlement = typeof driverSettlements.$inferSelect;
export type InsertDriverSettlement = typeof driverSettlements.$inferInsert;

/**
 * Expense categories
 */
export const expenseCategories = mysqlTable("expenseCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;

/**
 * Expenses
 */
export const expenses = mysqlTable(
  "expenses",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("categoryId").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description"),
    expenseDate: datetime("expenseDate").notNull(),
    isPaid: boolean("isPaid").default(false).notNull(),
    dueDate: datetime("dueDate"),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("categoryIdx").on(table.categoryId),
    dateIdx: index("dateIdx").on(table.expenseDate),
    paidIdx: index("paidIdx").on(table.isPaid),
  })
);

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Employees (for salary tracking)
 */
export const employees = mysqlTable(
  "employees",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    name: varchar("name", { length: 255 }).notNull(),
    surname: varchar("surname", { length: 255 }).notNull(),
    position: varchar("position", { length: 100 }),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    monthlySalary: decimal("monthlySalary", { precision: 12, scale: 2 }).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    hireDate: datetime("hireDate").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
  })
);

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * Salary payments
 */
export const salaryPayments = mysqlTable(
  "salaryPayments",
  {
    id: int("id").autoincrement().primaryKey(),
    employeeId: int("employeeId").notNull(),
    month: int("month").notNull(), // 1-12
    year: int("year").notNull(),
    baseSalary: decimal("baseSalary", { precision: 12, scale: 2 }).notNull(),
    advances: decimal("advances", { precision: 12, scale: 2 }).default("0").notNull(),
    deductions: decimal("deductions", { precision: 12, scale: 2 }).default("0").notNull(),
    netSalary: decimal("netSalary", { precision: 12, scale: 2 }).notNull(),
    isPaid: boolean("isPaid").default(false).notNull(),
    paidDate: datetime("paidDate"),
    paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "transfer"]),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    employeeIdx: index("employeeIdx").on(table.employeeId),
    monthYearIdx: index("monthYearIdx").on(table.month),
    paidIdx: index("paidIdx").on(table.isPaid),
  })
);

export type SalaryPayment = typeof salaryPayments.$inferSelect;
export type InsertSalaryPayment = typeof salaryPayments.$inferInsert;

/**
 * Audit log for tracking all user actions
 */
export const auditLog = mysqlTable(
  "auditLog",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    module: varchar("module", { length: 100 }).notNull(),
    entityType: varchar("entityType", { length: 100 }),
    entityId: int("entityId"),
    oldValues: text("oldValues"), // JSON
    newValues: text("newValues"), // JSON
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    moduleIdx: index("moduleIdx").on(table.module),
    dateIdx: index("dateIdx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
