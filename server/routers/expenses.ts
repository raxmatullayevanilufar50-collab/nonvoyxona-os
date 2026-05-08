import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { expenses, expenseCategories } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

export const expensesRouter = router({
  // Get expense categories
  getCategories: protectedProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db
        .select()
        .from(expenseCategories)
        .where(eq(expenseCategories.isActive, true))
        .orderBy(expenseCategories.name);

      return result;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch categories",
      });
    }
  }),

  // Create new expense
  create: protectedProcedure
    .input(
      z.object({
        categoryId: z.number(),
        amount: z.number().positive(),
        description: z.string().optional(),
        expenseDate: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(expenses).values({
          categoryId: input.categoryId,
          amount: input.amount.toString(),
          description: input.description,
          expenseDate: input.expenseDate,
          notes: input.notes,
          createdBy: ctx.user!.id,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create expense",
        });
      }
    }),

  // Get expenses by date range
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(expenses)
          .where(
            and(
              gte(expenses.expenseDate, input.startDate),
              lte(expenses.expenseDate, input.endDate)
            )
          )
          .orderBy(desc(expenses.expenseDate));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expenses",
        });
      }
    }),

  // Get all expenses
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(expenses)
          .orderBy(desc(expenses.expenseDate))
          .limit(input.limit);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch expenses",
        });
      }
    }),

  // Delete expense
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        if (ctx.user?.role !== "owner" && ctx.user?.role !== "manager") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only owner or manager can delete expenses",
          });
        }

        await db.delete(expenses).where(eq(expenses.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete expense",
        });
      }
    }),
});
