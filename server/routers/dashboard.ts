import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as dbHelpers from "../db.helpers";
import { getDb } from "../db";
import { sales, expenses, production, products } from "../../drizzle/schema";
import { and, gte, lte, desc } from "drizzle-orm";

export const dashboardRouter = router({
  // Get dashboard metrics for a specific date
  getMetrics: protectedProcedure
    .input(z.object({ date: z.date().optional() }))
    .query(async ({ input }) => {
      try {
        const date = input.date || new Date();
        const metrics = await dbHelpers.getDashboardMetrics(date);

        if (!metrics) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch metrics",
          });
        }

        return metrics;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch dashboard metrics",
        });
      }
    }),

  // Get sales and expenses chart data for date range
  getChartData: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // Get daily sales and expenses
        const dailyData: Record<string, { sales: number; expenses: number }> = {};

        const salesData = await db
          .select()
          .from(sales)
          .where(and(gte(sales.saleDate, input.startDate), lte(sales.saleDate, input.endDate)));

        const expensesData = await db
          .select()
          .from(expenses)
          .where(
            and(gte(expenses.expenseDate, input.startDate), lte(expenses.expenseDate, input.endDate))
          );

        // Aggregate by date
        salesData.forEach((sale) => {
          const dateKey = sale.saleDate.toISOString().split("T")[0];
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = { sales: 0, expenses: 0 };
          }
          dailyData[dateKey].sales += parseFloat(sale.totalAmount.toString());
        });

        expensesData.forEach((expense) => {
          const dateKey = expense.expenseDate.toISOString().split("T")[0];
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = { sales: 0, expenses: 0 };
          }
          dailyData[dateKey].expenses += parseFloat(expense.amount.toString());
        });

        // Convert to array and sort by date
        const chartData = Object.entries(dailyData)
          .map(([date, data]) => ({
            date,
            sales: Math.round(data.sales),
            expenses: Math.round(data.expenses),
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        return chartData;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chart data",
        });
      }
    }),

  // Get production breakdown by product
  getProductionBreakdown: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const productionData = await db
          .select()
          .from(production)
          .where(
            and(
              gte(production.productionDate, input.startDate),
              lte(production.productionDate, input.endDate)
            )
          );

        // Get product names and aggregate quantities
        const breakdown: Record<string, number> = {};

        for (const prod of productionData) {
          const product = await db
            .select()
            .from(products)
            .where(eq(products.id, prod.productId))
            .limit(1);

          if (product && product.length > 0) {
            const productName = product[0].name;
            breakdown[productName] = (breakdown[productName] || 0) + parseFloat(prod.quantity.toString());
          }
        }

        // Convert to array and calculate percentages
        const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
        const breakdownArray = Object.entries(breakdown)
          .map(([name, value]) => ({
            name,
            value: Math.round((value / total) * 100),
            quantity: Math.round(value),
          }))
          .sort((a, b) => b.value - a.value);

        return breakdownArray;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch production breakdown",
        });
      }
    }),

  // Get low stock alerts
  getLowStockAlerts: protectedProcedure.query(async () => {
    try {
      const lowStockItems = await dbHelpers.getLowStockIngredients();
      return lowStockItems;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch low stock alerts",
      });
    }
  }),

  // Get pending deliveries
  getPendingDeliveries: protectedProcedure.query(async () => {
    try {
      const deliveries = await dbHelpers.getPendingDeliveries();
      return deliveries;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending deliveries",
      });
    }
  }),

  // Get recent transactions
  getRecentTransactions: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const recentSales = await db
          .select()
          .from(sales)
          .orderBy(desc(sales.saleDate))
          .limit(input.limit);

        return recentSales;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recent transactions",
        });
      }
    }),
});

// Import eq for the query
import { eq } from "drizzle-orm";
