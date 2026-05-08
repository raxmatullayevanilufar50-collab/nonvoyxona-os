import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { ingredients, ingredientPurchases } from "../../drizzle/schema";
import { and, gte, lte, desc, eq } from "drizzle-orm";

export const ingredientsRouter = router({
  // Create new ingredient
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        unit: z.string().min(1),
        minStockLevel: z.number().default(0),
        unitCost: z.number().positive(),
        supplier: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if ingredient already exists
        const existing = await db
          .select()
          .from(ingredients)
          .where(eq(ingredients.name, input.name))
          .limit(1);

        if (existing && existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ingredient already exists",
          });
        }

        await db.insert(ingredients).values({
          name: input.name,
          unit: input.unit,
          currentStock: "0",
          minStockLevel: input.minStockLevel.toString(),
          unitCost: input.unitCost.toString(),
          supplier: input.supplier,
          isActive: true,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create ingredient",
        });
      }
    }),

  // Get all active ingredients
  list: protectedProcedure
    .input(z.object({ includeInactive: z.boolean().default(false) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(ingredients)
          .where(input.includeInactive ? undefined : eq(ingredients.isActive, true))
          .orderBy(ingredients.name);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ingredients",
        });
      }
    }),

  // Get ingredient by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(ingredients)
          .where(eq(ingredients.id, input.id))
          .limit(1);

        if (!result || result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ingredient not found",
          });
        }

        return result[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch ingredient",
        });
      }
    }),

  // Update ingredient
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        unit: z.string().optional(),
        minStockLevel: z.number().optional(),
        unitCost: z.number().optional(),
        supplier: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.unit) updateData.unit = input.unit;
        if (input.minStockLevel !== undefined) updateData.minStockLevel = input.minStockLevel.toString();
        if (input.unitCost) updateData.unitCost = input.unitCost.toString();
        if (input.supplier !== undefined) updateData.supplier = input.supplier;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        await db.update(ingredients).set(updateData).where(eq(ingredients.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ingredient",
        });
      }
    }),

  // Record ingredient purchase
  recordPurchase: protectedProcedure
    .input(
      z.object({
        ingredientId: z.number(),
        quantity: z.number().positive(),
        unitCost: z.number().positive(),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const totalCost = input.quantity * input.unitCost;

        // Record purchase
        await db.insert(ingredientPurchases).values({
          ingredientId: input.ingredientId,
          quantity: input.quantity.toString(),
          unitCost: input.unitCost.toString(),
          totalCost: totalCost.toString(),
          purchaseDate: new Date(),
          supplier: input.supplier,
          notes: input.notes,
          createdBy: ctx.user!.id,
        });

        // Update ingredient stock
        const ingredient = await db
          .select()
          .from(ingredients)
          .where(eq(ingredients.id, input.ingredientId))
          .limit(1);

        if (ingredient && ingredient.length > 0) {
          const newStock =
            parseFloat(ingredient[0].currentStock.toString()) + input.quantity;
          await db
            .update(ingredients)
            .set({ currentStock: newStock.toString() })
            .where(eq(ingredients.id, input.ingredientId));
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record purchase",
        });
      }
    }),

  // Get purchase history
  getPurchaseHistory: protectedProcedure
    .input(
      z.object({
        ingredientId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const whereConditions = [eq(ingredientPurchases.ingredientId, input.ingredientId)];

        if (input.startDate && input.endDate) {
          whereConditions.push(
            gte(ingredientPurchases.purchaseDate, input.startDate),
            lte(ingredientPurchases.purchaseDate, input.endDate)
          );
        }

        const result = await db
          .select()
          .from(ingredientPurchases)
          .where(and(...whereConditions))
          .orderBy(desc(ingredientPurchases.purchaseDate));
        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch purchase history",
        });
      }
    }),

  // Get low stock ingredients
  getLowStock: protectedProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const allIngredients = await db
        .select()
        .from(ingredients)
        .where(eq(ingredients.isActive, true));

      const lowStock = allIngredients.filter(
        (ing) =>
          parseFloat(ing.currentStock.toString()) <=
          parseFloat(ing.minStockLevel.toString())
      );

      return lowStock;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch low stock ingredients",
      });
    }
  }),
});
