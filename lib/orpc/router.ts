import { jknRouter } from "./routers/jkn";
import { protectedProcedure, publicProcedure } from "./server";

export const router = {
  health: publicProcedure.handler(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  })),

  me: protectedProcedure.handler(({ context }) => ({
    id: context.user.id,
    name: context.user.name,
    email: context.user.email,
    image: context.user.image,
  })),

  jkn: jknRouter,
};

export type Router = typeof router;
