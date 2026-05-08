import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { customers, debtPayments } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

export const customersRouter = router({
  // Create new customer
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(customers).values({
          name: input.name,
          phoneNumber: input.phoneNumber,
          address: input.address,
          totalDebt: "0",
          notes: input.notes,
          isActive: true,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create customer",
        });
      }
    }),

  // Get all customers
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const conditions = [];
        if (input.isActive !== undefined) {
          conditions.push(eq(customers.isActive, input.isActive));
        }

        const result = await db
          .select()
          .from(customers)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(customers.createdAt))
          .limit(input.limit);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch customers",
        });
      }
    }),

  // Get customer with debt details
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const customer = await db
          .select()
          .from(customers)
          .where(eq(customers.id, input.id))
          .limit(1);

        if (!customer || customer.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found",
          });
        }

        const payments = await db
          .select()
          .from(debtPayments)
          .where(eq(debtPayments.customerId, input.id))
          .orderBy(desc(debtPayments.paymentDate));

        return {
          customer: customer[0],
          payments,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch customer",
        });
      }
    }),

  // Record debt payment
  recordPayment: protectedProcedure
    .input(
      z.object({
        customerId: z.number(),
        amount: z.number().positive(),
        paymentDate: z.date(),
        paymentMethod: z.enum(["cash", "card", "check"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Record payment
        await db.insert(debtPayments).values({
          customerId: input.customerId,
          paymentAmount: input.amount.toString(),
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          createdBy: ctx.user!.id,
        });

        // Update customer total debt
        const customer = await db
          .select()
          .from(customers)
          .where(eq(customers.id, input.customerId))
          .limit(1);

        if (customer && customer.length > 0) {
          const currentDebt = parseFloat(customer[0].totalDebt.toString());
          const newDebt = Math.max(0, currentDebt - input.amount);

          await db
            .update(customers)
            .set({ totalDebt: newDebt.toString() })
            .where(eq(customers.id, input.customerId));
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record payment",
        });
      }
    }),

  // Get customers with outstanding debt
  getWithDebt: protectedProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db
        .select()
        .from(customers)
        .where(eq(customers.isActive, true))
        .orderBy(desc(customers.totalDebt));

      // Filter to only those with debt > 0
      return result.filter((c) => parseFloat(c.totalDebt.toString()) > 0);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch customers with debt",
      });
    }
  }),

  // Update customer info
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.phoneNumber) updateData.phoneNumber = input.phoneNumber;
        if (input.address) updateData.address = input.address;
        if (input.notes) updateData.notes = input.notes;

        await db
          .update(customers)
          .set(updateData)
          .where(eq(customers.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update customer",
        });
      }
    }),

  // Get debt payment history
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        customerId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const conditions = [];

        if (input.customerId) {
          conditions.push(eq(debtPayments.customerId, input.customerId));
        }

        if (input.startDate && input.endDate) {
          conditions.push(gte(debtPayments.paymentDate, input.startDate));
          conditions.push(lte(debtPayments.paymentDate, input.endDate));
        }

        const result = await db
          .select()
          .from(debtPayments)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(debtPayments.paymentDate));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payment history",
        });
      }
    }),
});
