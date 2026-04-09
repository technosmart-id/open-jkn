import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import {
  type DatabaseAnalysisOptions,
  ensureDirs,
  OUTPUT_DIR,
  parseCsvFile,
  queryParticipantsForML,
  runPythonScript,
} from "@/lib/ai-utils";
import { db } from "@/lib/db";
import { participant } from "@/lib/db/schema/jkn";

function sliceData<T>(data: T[], maxItems: number): T[] {
  return data.slice(0, maxItems);
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    await ensureDirs();

    // Parse request body for options
    const body = (await request.json()) as DatabaseAnalysisOptions;
    const { participantSegment, isActive, limit } = body;

    // Query database and export to CSV
    tempFilePath = await queryParticipantsForML({
      participantSegment,
      isActive,
      limit,
    });

    // Run Python scoring script
    const scriptPath = path.join(process.cwd(), "ai", "run_score.py");
    await runPythonScript(scriptPath, [tempFilePath]);

    // Parse the output CSV
    const scoredDataPath = path.join(OUTPUT_DIR, "scored_new_data.csv");
    const anomaliesDataPath = path.join(OUTPUT_DIR, "anomalies_new_data.csv");

    let scoredData: unknown[] | null = null;
    let anomaliesData: unknown[] | null = null;
    let summary: any = null;

    if (existsSync(scoredDataPath)) {
      scoredData = await parseCsvFile(scoredDataPath);
    }

    if (existsSync(anomaliesDataPath)) {
      anomaliesData = await parseCsvFile(anomaliesDataPath);
    }

    // Calculate summary
    if (scoredData) {
      const totalRecords = scoredData.length;
      const anomaliesCount = anomaliesData?.length || 0;
      const anomalyRate =
        totalRecords > 0 ? (anomaliesCount / totalRecords) * 100 : 0;

      // Count by source
      const sourceCounts: Record<string, number> = {};
      anomaliesData?.forEach((record: any) => {
        const source = record.anomaly_source || "unknown";
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      summary = {
        totalRecords,
        anomaliesCount,
        anomalyRate: Math.round(anomalyRate * 100) / 100,
        ruleBased:
          (sourceCounts["rule_only"] || 0) + (sourceCounts["model+rule"] || 0),
        modelBased:
          (sourceCounts["model_only"] || 0) + (sourceCounts["model+rule"] || 0),
      };
    }

    return NextResponse.json({
      success: true,
      source: "database",
      summary,
      scoredData: scoredData ? sliceData(scoredData, 100) : null,
      anomalies: anomaliesData ? sliceData(anomaliesData, 50) : null,
      images: {
        dashboard: "/api/ai/images/dashboard.png",
        ageDistribution: "/api/ai/images/age-distribution.png",
        trainingHistory: "/api/ai/images/training-history.png",
      },
    });
  } catch (error) {
    console.error("Database anomaly detection error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        await unlink(tempFilePath);
      } catch {}
    }
  }
}

export async function GET() {
  try {
    const segmentCounts = await db
      .select({
        segment: participant.participantSegment,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(participant)
      .groupBy(participant.participantSegment);

    const statusCounts = await db
      .select({
        isActive: participant.isActive,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(participant)
      .groupBy(participant.isActive);

    const totalParticipants = statusCounts.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({
      available: true,
      stats: {
        totalParticipants,
        bySegment: segmentCounts,
        byStatus: statusCounts,
      },
    });
  } catch (error) {
    console.error("Database stats error:", error);
    return NextResponse.json(
      { error: "Failed to get database stats" },
      { status: 500 }
    );
  }
}
