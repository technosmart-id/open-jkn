#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// Don't bake DATABASE_URL into config - use environment variable at runtime
// drizzle-kit will read DATABASE_URL from environment automatically

const config = {
  schema: [
    "./lib/db/schema/auth.ts",
    "./lib/db/schema/index.ts",
    "./lib/db/schema/pbb/index.ts",
    "./lib/db/schema/jkn/index.ts",
  ],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  // Don't include dbCredentials - drizzle-kit reads DATABASE_URL from env
};

const configPath = path.join(process.cwd(), "drizzle.config.json");
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(
  "Generated drizzle.config.json (runtime DATABASE_URL will be used)"
);
