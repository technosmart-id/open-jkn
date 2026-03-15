import { count } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { participant } from "@/lib/db/schema/jkn";

export async function GET() {
  try {
    // Check JKN database connection
    const participantCount = await db
      .select({ count: count() })
      .from(participant)
      .then((result) => result[0]?.count || 0);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      participantCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
