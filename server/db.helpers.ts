import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  users,
  products,
  sales,
  production,
  ingredients,
  customers,
  deliveries,
  driverSettlements,
  expenses,
  salaryPayments,
  ownerSecretCode,
} from "../drizzle/schema";

// ============ USER HELPERS ============

export async function getUserByPinCode(pinCode: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.pinCode, pinCode)).limit(1);
  return result[0] || null;
}

export async function getOwnerSecretCode() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ownerSecretCode).limit(1);
  return result[0] || null;
}

export async function setOwnerSecretCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Delete existing code
  await db.delete(ownerSecretCode);
  
  // Insert new code
  const result = await db.insert(ownerSecretCode).values({ code });
  return result;
}

export async function verifyOwnerSecretCode(code: string) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(ownerSecretCode).where(eq(ownerSecretCode.code, code)).limit(1);
  return result.length > 0;
}

// ============ SALES HELPERS ============

export async function getDailySales(date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db
    .select()
    .from(sales)
    .where(and(gte(sales.saleDate, startOfDay), lte(sales.saleDate, endOfDay)))
    .orderBy(desc(sales.saleDate));
}

export async function getTotalSalesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select()
    .from(sales)
    .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));
  
  return result.reduce((sum, sale) => sum + parseFloat(sale.totalAmount.toString()), 0);
}

// ============ PRODUCTION HELPERS ============

export async function getDailyProduction(date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db
    .select()
    .from(production)
    .where(and(gte(production.productionDate, startOfDay), lte(production.productionDate, endOfDay)))
    .orderBy(desc(production.productionDate));
}

// ============ INGREDIENTS HELPERS ============

export async function getIngredientByName(name: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(ingredients).where(eq(ingredients.name, name)).limit(1);
  return result[0] || null;
}

export async function getLowStockIngredients() {
  const db = await getDb();
  if (!db) return [];
  
  const allIngredients = await db.select().from(ingredients).where(eq(ingredients.isActive, true));
  
  return allIngredients.filter(
    (ing) => parseFloat(ing.currentStock.toString()) <= parseFloat(ing.minStockLevel.toString())
  );
}

// ============ CUSTOMER HELPERS ============

export async function getCustomerDebt(customerId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  return customer[0] ? parseFloat(customer[0].totalDebt.toString()) : 0;
}

export async function getCustomersWithDebt() {
  const db = await getDb();
  if (!db) return [];
  
  const allCustomers = await db.select().from(customers);
  
  return allCustomers.filter((cust) => parseFloat(cust.totalDebt.toString()) > 0);
}

// ============ DELIVERY HELPERS ============

export async function getPendingDeliveries() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.status, "pending"))
    .orderBy(desc(deliveries.deliveryDate));
}

// ============ EXPENSES HELPERS ============

export async function getTotalExpensesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select()
    .from(expenses)
    .where(and(gte(expenses.expenseDate, startDate), lte(expenses.expenseDate, endDate)));
  
  return result.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
}

// ============ SALARY HELPERS ============

export async function getUnpaidSalaries() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(salaryPayments).where(eq(salaryPayments.isPaid, false));
}

// ============ DRIVER SETTLEMENT HELPERS ============

export async function getPendingDriverSettlements() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(driverSettlements)
    .where(eq(driverSettlements.status, "pending"))
    .orderBy(desc(driverSettlements.settlementDate));
}

// ============ DASHBOARD HELPERS ============

export async function getDashboardMetrics(date: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const dailySales = await db
    .select()
    .from(sales)
    .where(and(gte(sales.saleDate, startOfDay), lte(sales.saleDate, endOfDay)));
  
  const dailyExpenses = await db
    .select()
    .from(expenses)
    .where(and(gte(expenses.expenseDate, startOfDay), lte(expenses.expenseDate, endOfDay)));
  
  const totalSales = dailySales.reduce((sum, s) => sum + parseFloat(s.totalAmount.toString()), 0);
  const totalExpenses = dailyExpenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
  const profit = totalSales - totalExpenses;
  
  const debtCustomers = await getCustomersWithDebt();
  const totalDebt = debtCustomers.reduce((sum, c) => sum + parseFloat(c.totalDebt.toString()), 0);
  
  return {
    totalSales,
    totalExpenses,
    profit,
    totalDebt,
    transactionCount: dailySales.length,
    expenseCount: dailyExpenses.length,
  };
}
