import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { sales, expenses, production, customers, debtPayments } from "../../drizzle/schema";

export const reportsRouter = router({
  getSalesReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        groupBy: z.enum(["day", "week", "month", "year"]).default("day"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const start = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = input.endDate || new Date();

      try {
        const result = await db
          .select({
            date: sql<string>`DATE(${sales.saleDate})`,
            totalSales: sql<number>`SUM(CAST(${sales.totalAmount} AS DECIMAL(15,2)))`,
            count: sql<number>`COUNT(*)`,
          })
          .from(sales)
          .where(sql`${sales.saleDate} BETWEEN ${start} AND ${end}`)
          .groupBy(sql`DATE(${sales.saleDate})`)
          .orderBy(sql`DATE(${sales.saleDate})`);

        return result.map((r) => ({
          date: r.date,
          sales: parseFloat(r.totalSales?.toString() || "0"),
          count: r.count,
        }));
      } catch (error) {
        console.error("Error fetching sales report:", error);
        return [];
      }
    }),

  getExpenseReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const start = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = input.endDate || new Date();

      try {
        const result = await db
          .select({
            category: expenses.categoryId,
            totalAmount: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL(15,2)))`,
            count: sql<number>`COUNT(*)`,
          })
          .from(expenses)
          .where(sql`${expenses.expenseDate} BETWEEN ${start} AND ${end}`)
          .groupBy(expenses.categoryId)
          .orderBy(sql`SUM(CAST(${expenses.amount} AS DECIMAL(15,2))) DESC`);

        return result.map((r) => ({
          category: r.category,
          amount: parseFloat(r.totalAmount?.toString() || "0"),
          count: r.count,
        }));
      } catch (error) {
        console.error("Error fetching expense report:", error);
        return [];
      }
    }),

  getProductionReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const start = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = input.endDate || new Date();

      try {
        const result = await db
          .select({
            productName: production.productId,
            totalQuantity: sql<number>`SUM(${production.quantity})`,
            avgCost: sql<number>`AVG(CAST(${production.quantity} AS DECIMAL(15,2)))`,
          })
          .from(production)
          .where(sql`${production.productionDate} BETWEEN ${start} AND ${end}`)
          .groupBy(production.productId)
          .orderBy(sql`SUM(${production.quantity}) DESC`);

        return result.map((r) => ({
          product: r.productName,
          quantity: r.totalQuantity,
          avgCost: parseFloat(r.avgCost?.toString() || "0"),
        }));
      } catch (error) {
        console.error("Error fetching production report:", error);
        return [];
      }
    }),

  getProfitReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { totalSales: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 };

      const start = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = input.endDate || new Date();

      try {
        const salesResult = await db
          .select({
            total: sql<number>`SUM(CAST(${sales.totalAmount} AS DECIMAL(15,2)))`,
          })
          .from(sales)
          .where(sql`${sales.saleDate} BETWEEN ${start} AND ${end}`);

        const expensesResult = await db
          .select({
            total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL(15,2)))`,
          })
          .from(expenses)
          .where(sql`${expenses.expenseDate} BETWEEN ${start} AND ${end}`);

        const totalSales = parseFloat(salesResult[0]?.total?.toString() || "0");
        const totalExpenses = parseFloat(expensesResult[0]?.total?.toString() || "0");
        const netProfit = totalSales - totalExpenses;
        const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

        return {
          totalSales,
          totalExpenses,
          netProfit,
          profitMargin: Math.round(profitMargin * 10) / 10,
        };
      } catch (error) {
        console.error("Error fetching profit report:", error);
        return { totalSales: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 };
      }
    }),

  getDebtReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const start = input.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const end = input.endDate || new Date();

      try {
        const result = await db
          .select({
            customerId: customers.id,
            customerName: customers.name,
            totalDebt: sql<number>`SUM(CAST(${customers.totalDebt} AS DECIMAL(15,2)))`,
            daysSinceCreation: sql<number>`DATEDIFF(NOW(), ${customers.createdAt})`,
          })
          .from(customers)
          .where(sql`${customers.totalDebt} > 0`)
          .groupBy(customers.id, customers.name, customers.createdAt)
          .orderBy(sql`SUM(CAST(${customers.totalDebt} AS DECIMAL(15,2))) DESC`);

        return result.map((r) => ({
          customerId: r.customerId,
          customerName: r.customerName,
          debt: parseFloat(r.totalDebt?.toString() || "0"),
          daysOverdue: Math.max(0, (r.daysSinceCreation || 0) - 30),
        }));
      } catch (error) {
        console.error("Error fetching debt report:", error);
        return [];
      }
    }),

  getSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db)
        return {
          totalSales: 0,
          totalExpenses: 0,
          netProfit: 0,
          profitMargin: 0,
          totalDebt: 0,
          transactionCount: 0,
        };

      const start = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = input.endDate || new Date();

      try {
        const salesResult = await db
          .select({
            total: sql<number>`SUM(CAST(${sales.totalAmount} AS DECIMAL(15,2)))`,
            count: sql<number>`COUNT(*)`,
          })
          .from(sales)
          .where(sql`${sales.saleDate} BETWEEN ${start} AND ${end}`);

        const expensesResult = await db
          .select({
            total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL(15,2)))`,
          })
          .from(expenses)
          .where(sql`${expenses.expenseDate} BETWEEN ${start} AND ${end}`);

        const debtResult = await db
          .select({
            total: sql<number>`SUM(CAST(${customers.totalDebt} AS DECIMAL(15,2)))`,
          })
          .from(customers);

        const totalSales = parseFloat(salesResult[0]?.total?.toString() || "0");
        const totalExpenses = parseFloat(expensesResult[0]?.total?.toString() || "0");
        const totalDebt = parseFloat(debtResult[0]?.total?.toString() || "0");
        const netProfit = totalSales - totalExpenses;
        const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

        return {
          totalSales,
          totalExpenses,
          netProfit,
          profitMargin: Math.round(profitMargin * 10) / 10,
          totalDebt,
          transactionCount: salesResult[0]?.count || 0,
        };
      } catch (error) {
        console.error("Error fetching summary:", error);
        return {
          totalSales: 0,
          totalExpenses: 0,
          netProfit: 0,
          profitMargin: 0,
          totalDebt: 0,
          transactionCount: 0,
        };
      }
    }),
});
