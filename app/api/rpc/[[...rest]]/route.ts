import { RPCHandler } from "@orpc/server/fetch";
import { router } from "@/lib/orpc/router";
import { createContext } from "@/lib/orpc/server";

const handler = new RPCHandler(router);

async function handleRequest(request: Request) {
  try {
    const context = await createContext();

    const { response } = await handler.handle(request, {
      prefix: "/api/rpc",
      context,
    });

    return response ?? new Response("Not Found", { status: 404 });
  } catch (err) {
    // Log unexpected errors
    console.error("[RPC] Unexpected error:", {
      path: request.url,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
