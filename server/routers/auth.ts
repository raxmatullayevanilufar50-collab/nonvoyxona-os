import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import * as dbHelpers from "../db.helpers";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const authRouter = router({
  // Get current user
  me: publicProcedure.query(({ ctx }) => ctx.user),

  // PIN-based login
  loginWithPin: publicProcedure
    .input(
      z.object({
        pinCode: z.string().min(4).max(6),
        role: z.enum(["owner", "manager", "cashier", "driver"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Find user by PIN code and role
        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        const user = await database
          .select()
          .from(users)
          .where(eq(users.pinCode, input.pinCode))
          .limit(1);

        if (!user || user.length === 0) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid PIN code" });
        }

        const foundUser = user[0];

        // Check if user has the requested role
        if (foundUser.role !== input.role) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User does not have this role",
          });
        }

        // Check if user is active
        if (!foundUser.isActive) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User account is inactive",
          });
        }

        // Update last signed in
        await database
          .update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, foundUser.id));

        return {
          success: true,
          user: foundUser,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed",
        });
      }
    }),

  // Verify owner secret code
  verifySecretCode: publicProcedure
    .input(z.object({ secretCode: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const isValid = await dbHelpers.verifyOwnerSecretCode(input.secretCode);

        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid secret code",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Secret code verification failed",
        });
      }
    }),

  // Set owner secret code (owner only)
  setSecretCode: protectedProcedure
    .input(z.object({ secretCode: z.string().min(4) }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.user?.role !== "owner") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only owner can set secret code",
          });
        }

        await dbHelpers.setOwnerSecretCode(input.secretCode);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set secret code",
        });
      }
    }),

  // Logout
  logout: protectedProcedure.mutation(({ ctx }) => {
    // Session is cleared by the middleware
    return { success: true };
  }),
});
