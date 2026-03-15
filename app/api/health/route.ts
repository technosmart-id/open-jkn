import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { db } from "@/lib/db";
import { participant } from "@/lib/db/schema/jkn";
import { tblFamilies } from "@/lib/db/schema/openimis";

export async function GET() {
  const jknDb = { status: "unknown", error: null as string | null };
  const imisDb = { status: "unknown", error: null as string | null };

  // Check JKN database connection
  try {
    const participantCount = await db
      .select({ count: count() })
      .from(participant)
      .then((result) => result[0]?.count || 0);
    jknDb.status = "connected";
    jknDb.error = null;
  } catch (error) {
    jknDb.status = "error";
    jknDb.error = error instanceof Error ? error.message : "Unknown error";
  }

  // Check openIMIS database connection
  try {
    const connectionString = process.env.OPENIMIS_DATABASE_URL;
    if (connectionString) {
      const pool = new Pool({ connectionString });
      const imisDbConnection = drizzle(pool, { schema: { tblFamilies } });
      const familyCount = await imisDbConnection
        .select({ count: count() })
        .from(tblFamilies)
        .then((result) => result[0]?.count || 0);
      await pool.end();
      imisDb.status = "connected";
      imisDb.error = null;
    } else {
      imisDb.status = "error";
      imisDb.error = "OPENIMIS_DATABASE_URL not set";
    }
  } catch (error) {
    imisDb.status = "error";
    imisDb.error = error instanceof Error ? error.message : "Unknown error";
  }

  const overallStatus =
    jknDb.status === "connected" && imisDb.status === "connected"
      ? "ok"
      : "error";

  return NextResponse.json({
    status: overallStatus,
    jknDatabase: jknDb.status,
    imisDatabase: imisDb.status,
    imisError: imisDb.error,
  });
}
