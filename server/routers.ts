import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { dashboardRouter } from "./routers/dashboard";
import { salesRouter } from "./routers/sales";
import { productionRouter } from "./routers/production";
import { ingredientsRouter } from "./routers/ingredients";
import { deliveryRouter } from "./routers/delivery";
import { expensesRouter } from "./routers/expenses";
import { salariesRouter } from "./routers/salaries";
import { customersRouter } from "./routers/customers";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  dashboard: dashboardRouter,
  sales: salesRouter,
  production: productionRouter,
  ingredients: ingredientsRouter,
  delivery: deliveryRouter,
  expenses: expensesRouter,
  salaries: salariesRouter,
  customers: customersRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
