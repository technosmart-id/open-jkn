#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// Use environment variable in config - drizzle-kit will expand it at runtime
const config = {
  schema: ["./lib/db/schema/auth.ts", "./lib/db/schema/jkn/index.ts"],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};

const configPath = path.join(process.cwd(), "drizzle.config.json");
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log("Generated drizzle.config.json (DATABASE_URL from env)");
