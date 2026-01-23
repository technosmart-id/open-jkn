#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const config = {
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
};

const configPath = path.join(process.cwd(), "drizzle.config.json");
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log("Generated drizzle.config.json");
