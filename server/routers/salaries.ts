import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { salaryPayments } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

export const salariesRouter = router({
  // Record monthly salary payment
  recordPayment: protectedProcedure
    .input(
      z.object({
        employeeId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
        baseSalary: z.number().positive(),
        advances: z.number().default(0),
        deductions: z.number().default(0),
        paymentMethod: z.enum(["cash", "card", "transfer"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const netSalary = input.baseSalary - input.advances - input.deductions;

        await db.insert(salaryPayments).values({
          employeeId: input.employeeId,
          month: input.month,
          year: input.year,
          baseSalary: input.baseSalary.toString(),
          advances: input.advances.toString(),
          deductions: input.deductions.toString(),
          netSalary: netSalary.toString(),
          isPaid: false,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          createdBy: ctx.user!.id,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record payment",
        });
      }
    }),

  // Get salary payments for employee
  getByEmployee: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(salaryPayments)
          .where(eq(salaryPayments.employeeId, input.employeeId))
          .orderBy(desc(salaryPayments.year), desc(salaryPayments.month));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payments",
        });
      }
    }),

  // Get all salary payments
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        isPaid: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const conditions = [];
        if (input.isPaid !== undefined) {
          conditions.push(eq(salaryPayments.isPaid, input.isPaid));
        }

        const result = await db
          .select()
          .from(salaryPayments)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(salaryPayments.year), desc(salaryPayments.month))
          .limit(input.limit);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payments",
        });
      }
    }),

  // Mark salary as paid
  markAsPaid: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        paidDate: z.date(),
        paymentMethod: z.enum(["cash", "card", "transfer"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(salaryPayments)
          .set({
            isPaid: true,
            paidDate: input.paidDate,
            paymentMethod: input.paymentMethod,
          })
          .where(eq(salaryPayments.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark as paid",
        });
      }
    }),

  // Get salary summary by month/year
  getSummary: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const payments = await db
          .select()
          .from(salaryPayments)
          .where(
            and(
              eq(salaryPayments.month, input.month),
              eq(salaryPayments.year, input.year)
            )
          );

        const totalBaseSalary = payments.reduce(
          (sum, p) => sum + parseFloat(p.baseSalary.toString()),
          0
        );
        const totalAdvances = payments.reduce(
          (sum, p) => sum + parseFloat(p.advances.toString()),
          0
        );
        const totalDeductions = payments.reduce(
          (sum, p) => sum + parseFloat(p.deductions.toString()),
          0
        );
        const totalNetSalary = payments.reduce(
          (sum, p) => sum + parseFloat(p.netSalary.toString()),
          0
        );
        const paidCount = payments.filter((p) => p.isPaid).length;

        return {
          payments,
          summary: {
            totalBaseSalary,
            totalAdvances,
            totalDeductions,
            totalNetSalary,
            paidCount,
            unpaidCount: payments.length - paidCount,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch summary",
        });
      }
    }),
});
