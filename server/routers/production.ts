import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { production, ingredientConsumption, ingredients } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

export const productionRouter = router({
  // Create new production entry
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().positive(),
        ingredientConsumption: z.array(
          z.object({
            ingredientId: z.number(),
            quantityUsed: z.number().positive(),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Create production entry
        const result = await db.insert(production).values({
          productId: input.productId,
          quantity: input.quantity.toString(),
          productionDate: new Date(),
          notes: input.notes,
          createdBy: ctx.user!.id,
        });

        // Get the created production ID
        const createdProduction = await db
          .select()
          .from(production)
          .orderBy(desc(production.createdAt))
          .limit(1);

        const productionId = createdProduction[0]?.id || 0;

        // Record ingredient consumption and deduct from stock
        for (const consumption of input.ingredientConsumption) {
          // Record consumption
          await db.insert(ingredientConsumption).values({
            productionId,
            ingredientId: consumption.ingredientId,
            quantityUsed: consumption.quantityUsed.toString(),
          });

          // Deduct from ingredient stock
          const ingredient = await db
            .select()
            .from(ingredients)
            .where(eq(ingredients.id, consumption.ingredientId))
            .limit(1);

          if (ingredient && ingredient.length > 0) {
            const newStock =
              parseFloat(ingredient[0].currentStock.toString()) - consumption.quantityUsed;
            await db
              .update(ingredients)
              .set({ currentStock: newStock.toString() })
              .where(eq(ingredients.id, consumption.ingredientId));
          }
        }

        return { success: true, productionId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create production entry",
        });
      }
    }),

  // Get production by date range
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
          .from(production)
          .where(
            and(
              gte(production.productionDate, input.startDate),
              lte(production.productionDate, input.endDate)
            )
          )
          .orderBy(desc(production.productionDate));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch production entries",
        });
      }
    }),

  // Get all production entries
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(production)
          .orderBy(desc(production.productionDate))
          .limit(input.limit);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch production entries",
        });
      }
    }),

  // Get production details with ingredient consumption
  getDetails: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const prod = await db
          .select()
          .from(production)
          .where(eq(production.id, input.id))
          .limit(1);

        if (!prod || prod.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Production entry not found",
          });
        }

        const consumption = await db
          .select()
          .from(ingredientConsumption)
          .where(eq(ingredientConsumption.productionId, input.id));

        return {
          production: prod[0],
          consumption,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch production details",
        });
      }
    }),

  // Update production
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        quantity: z.number().positive().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const prod = await db
          .select()
          .from(production)
          .where(eq(production.id, input.id))
          .limit(1);

        if (!prod || prod.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Production entry not found",
          });
        }

        const updateData: any = {};
        if (input.quantity) updateData.quantity = input.quantity.toString();
        if (input.notes !== undefined) updateData.notes = input.notes;

        await db.update(production).set(updateData).where(eq(production.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update production entry",
        });
      }
    }),

  // Delete production
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
            message: "Only owner or manager can delete production entries",
          });
        }

        const prod = await db
          .select()
          .from(production)
          .where(eq(production.id, input.id))
          .limit(1);

        if (!prod || prod.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Production entry not found",
          });
        }

        // Reverse ingredient stock deductions
        const consumption = await db
          .select()
          .from(ingredientConsumption)
          .where(eq(ingredientConsumption.productionId, input.id));

        for (const cons of consumption) {
          const ingredient = await db
            .select()
            .from(ingredients)
            .where(eq(ingredients.id, cons.ingredientId))
            .limit(1);

          if (ingredient && ingredient.length > 0) {
            const newStock =
              parseFloat(ingredient[0].currentStock.toString()) +
              parseFloat(cons.quantityUsed.toString());
            await db
              .update(ingredients)
              .set({ currentStock: newStock.toString() })
              .where(eq(ingredients.id, cons.ingredientId));
          }
        }

        // Delete consumption records
        await db
          .delete(ingredientConsumption)
          .where(eq(ingredientConsumption.productionId, input.id));

        // Delete production entry
        await db.delete(production).where(eq(production.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete production entry",
        });
      }
    }),
});
