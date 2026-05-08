import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sales, customers } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

export const salesRouter = router({
  // Create new sale
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        customerId: z.number().optional(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        paymentMethod: z.enum(["cash", "card", "debt"]),
        amountPaid: z.number().default(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const totalAmount = input.quantity * input.unitPrice;
        const debtAmount = input.paymentMethod === "debt" ? totalAmount - input.amountPaid : 0;

        await db.insert(sales).values({
          productId: input.productId,
          customerId: input.customerId,
          quantity: input.quantity.toString(),
          unitPrice: input.unitPrice.toString(),
          totalAmount: totalAmount.toString(),
          paymentMethod: input.paymentMethod,
          amountPaid: input.amountPaid.toString(),
          debtAmount: debtAmount.toString(),
          saleDate: new Date(),
          notes: input.notes,
          createdBy: ctx.user!.id,
        })

        // Update customer debt if applicable
        if (input.customerId && debtAmount > 0) {
          const customer = await db
            .select()
            .from(customers)
            .where(eq(customers.id, input.customerId))
            .limit(1);

          if (customer && customer.length > 0) {
            const newDebt =
              parseFloat(customer[0].totalDebt.toString()) + debtAmount;
            await db
              .update(customers)
              .set({ totalDebt: newDebt.toString() })
              .where(eq(customers.id, input.customerId));
          }
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create sale",
        });
      }
    }),

  // Get sales by date range
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
          .from(sales)
          .where(
            and(
              gte(sales.saleDate, input.startDate),
              lte(sales.saleDate, input.endDate)
            )
          )
          .orderBy(desc(sales.saleDate));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sales",
        });
      }
    }),

  // Get all sales
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(sales)
          .orderBy(desc(sales.saleDate))
          .limit(input.limit);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sales",
        });
      }
    }),

  // Update sale
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        quantity: z.number().positive().optional(),
        unitPrice: z.number().positive().optional(),
        paymentMethod: z.enum(["cash", "card", "debt"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const sale = await db
          .select()
          .from(sales)
          .where(eq(sales.id, input.id))
          .limit(1);

        if (!sale || sale.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });
        }

        const updateData: any = {};
        if (input.quantity) updateData.quantity = input.quantity;
        if (input.unitPrice) updateData.unitPrice = input.unitPrice;
        if (input.paymentMethod) updateData.paymentMethod = input.paymentMethod;
        if (input.notes !== undefined) updateData.notes = input.notes;

        if (input.quantity && input.unitPrice) {
          updateData.totalAmount = input.quantity * input.unitPrice;
        }

        await db.update(sales).set(updateData).where(eq(sales.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update sale",
        });
      }
    }),

  // Delete sale
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if user is owner or manager
        if (ctx.user?.role !== "owner" && ctx.user?.role !== "manager") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only owner or manager can delete sales",
          });
        }

        const sale = await db
          .select()
          .from(sales)
          .where(eq(sales.id, input.id))
          .limit(1);

        if (!sale || sale.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Sale not found" });
        }

        // Reverse customer debt if applicable
        if (sale[0].customerId && parseFloat(sale[0].debtAmount.toString()) > 0) {
          const customer = await db
            .select()
            .from(customers)
            .where(eq(customers.id, sale[0].customerId))
            .limit(1);

          if (customer && customer.length > 0) {
            const newDebt = Math.max(
              0,
              parseFloat(customer[0].totalDebt.toString()) -
                parseFloat(sale[0].debtAmount.toString())
            );
            await db
              .update(customers)
              .set({ totalDebt: newDebt.toString() })
              .where(eq(customers.id, sale[0].customerId));
          }
        }

        await db.delete(sales).where(eq(sales.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete sale",
        });
      }
    }),
});
