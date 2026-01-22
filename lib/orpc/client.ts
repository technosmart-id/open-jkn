"use client";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";
import type { router } from "./router";

const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/rpc`,
  headers: () => ({
    "Content-Type": "application/json",
  }),
});

export const client = createORPCClient<RouterClient<typeof router>>(link);
export const orpc = createORPCReactQueryUtils(client);
