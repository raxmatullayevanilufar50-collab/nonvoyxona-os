import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as dbHelpers from "../db.helpers";

// Owner-only procedure
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only owner can manage users" });
  }
  return next({ ctx });
});

export const usersRouter = router({
  // List all users (owner only)
  list: ownerProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      const allUsers = await db.select().from(users).orderBy(users.createdAt);
      return allUsers;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list users",
      });
    }
  }),

  // Create user (owner only)
  create: ownerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        surname: z.string().optional(),
        phoneNumber: z.string().optional(),
        pinCode: z.string().min(4).max(6),
        role: z.enum(["manager", "cashier", "driver"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        // Check if PIN already exists
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.pinCode, input.pinCode))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "PIN code already exists",
          });
        }

        const result = await db.insert(users).values({
          openId: `local_${input.pinCode}_${Date.now()}`,
          pinCode: input.pinCode,
          role: input.role,
          isActive: true,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),

  // Update user (owner only)
  update: ownerProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        surname: z.string().optional(),
        phoneNumber: z.string().optional(),
        role: z.enum(["manager", "cashier", "driver"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        const updateData: any = {
          updatedAt: new Date(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.surname !== undefined) updateData.surname = input.surname;
        if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
        if (input.role !== undefined) updateData.role = input.role;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        await db.update(users).set(updateData).where(eq(users.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }
    }),

  // Delete user (owner only)
  delete: ownerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        await db.delete(users).where(eq(users.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        });
      }
    }),
});
