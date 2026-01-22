import { os } from "@orpc/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { Session, User } from "@/lib/db/schema/auth";

export type Context = {
  user: User | null;
  session: Session | null;
};

// Base builder with context type
const base = os.$context<Context>();

// Public procedure - no auth required
export const publicProcedure = base;

// Protected procedure - requires authentication
export const protectedProcedure = base.use(({ context, next }) => {
  if (!(context.user && context.session)) {
    throw new Error("Unauthorized");
  }

  return next({
    context: {
      user: context.user,
      session: context.session,
    },
  });
});

// Helper to create context from request headers
export async function createContext(): Promise<Context> {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return { user: null, session: null };
  }

  return {
    user: session.user as User,
    session: session.session as Session,
  };
}
