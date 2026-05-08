import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { deliveries, driverSettlements, drivers } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

export const deliveryRouter = router({
  // Create new delivery
  create: protectedProcedure
    .input(
      z.object({
        driverId: z.number(),
        deliveryDate: z.date(),
        totalQuantity: z.number().positive(),
        status: z.enum(["pending", "in_transit", "completed", "returned"]).default("pending"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.insert(deliveries).values({
          driverId: input.driverId,
          deliveryDate: input.deliveryDate,
          totalQuantity: input.totalQuantity.toString(),
          status: input.status,
          notes: input.notes,
          createdBy: ctx.user!.id,
        })

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create delivery",
        });
      }
    }),

  // Get all deliveries
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(deliveries)
          .orderBy(desc(deliveries.deliveryDate))
          .limit(input.limit);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch deliveries",
        });
      }
    }),

  // Get deliveries by driver
  getByDriver: protectedProcedure
    .input(z.object({ driverId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(deliveries)
          .where(eq(deliveries.driverId, input.driverId))
          .orderBy(desc(deliveries.deliveryDate));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch driver deliveries",
        });
      }
    }),

  // Update delivery status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_transit", "completed", "returned"]),
        returnedQuantity: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const delivery = await db
          .select()
          .from(deliveries)
          .where(eq(deliveries.id, input.id))
          .limit(1);

        if (!delivery || delivery.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Delivery not found",
          });
        }

        const updateData: any = { status: input.status };
        if (input.returnedQuantity !== undefined) {
          updateData.returnedQuantity = input.returnedQuantity.toString();
        }

        await db.update(deliveries).set(updateData).where(eq(deliveries.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update delivery",
        });
      }
    }),

  // Delete delivery
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        if (ctx.user?.role !== "owner" && ctx.user?.role !== "manager") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only owner or manager can delete deliveries",
          });
        }

        await db.delete(deliveries).where(eq(deliveries.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete delivery",
        });
      }
    }),

  // Calculate and record driver settlement
  recordSettlement: protectedProcedure
    .input(
      z.object({
        driverId: z.number(),
        settlementDate: z.date(),
        totalEarnings: z.number(),
        returnDeductions: z.number().default(0),
        advances: z.number().default(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const netPayout = input.totalEarnings - input.returnDeductions - input.advances;

        await db.insert(driverSettlements).values({
          driverId: input.driverId,
          settlementDate: input.settlementDate,
          totalEarnings: input.totalEarnings.toString(),
          returnDeductions: input.returnDeductions.toString(),
          advances: input.advances.toString(),
          netPayout: netPayout.toString(),
          status: "pending",
          notes: input.notes,
          createdBy: ctx.user!.id,
        })

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record settlement",
        });
      }
    }),

  // Get driver settlements
  getSettlements: protectedProcedure
    .input(
      z.object({
        driverId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const conditions = [];

        if (input.driverId) {
          conditions.push(eq(driverSettlements.driverId, input.driverId));
        }

        if (input.startDate && input.endDate) {
          conditions.push(gte(driverSettlements.settlementDate, input.startDate));
          conditions.push(lte(driverSettlements.settlementDate, input.endDate));
        }

        const result = await db
          .select()
          .from(driverSettlements)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(driverSettlements.settlementDate));
        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch settlements",
        });
      }
    }),

  // Update settlement status
  updateSettlementStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "partial"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(driverSettlements)
          .set({ status: input.status })
          .where(eq(driverSettlements.id, input.id))

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update settlement",
        });
      }
    }),
});
