import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Set it in .env.local or environment before running migrations."
  );
}

export default defineConfig({
  schema: [
    "./lib/db/schema/auth.ts",
    "./lib/db/schema/index.ts",
    "./lib/db/schema/pbb/index.ts",
    "./lib/db/schema/jkn/index.ts",
  ],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
