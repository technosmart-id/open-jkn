import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import {
  type DatabaseAnalysisOptions,
  ensureDirs,
  queryParticipantsForML,
  runPythonScript,
} from "@/lib/ai-utils";

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    await ensureDirs();

    // Parse options (default to active participants, large limit)
    const body = (await request
      .json()
      .catch(() => ({}))) as DatabaseAnalysisOptions;
    const { participantSegment, isActive = true, limit = 100_000 } = body;

    console.log(`[AI Train] Preparing data for training (limit: ${limit})...`);

    // Query database and export to CSV
    tempFilePath = await queryParticipantsForML({
      participantSegment,
      isActive,
      limit,
    });

    console.log(
      `[AI Train] Data exported to ${tempFilePath}. Starting training...`
    );

    // Run Python training script
    const scriptPath = path.join(process.cwd(), "ai", "run_train.py");
    const output = await runPythonScript(scriptPath, [tempFilePath]);

    console.log("[AI Train] Training completed successfully.");

    return NextResponse.json({
      success: true,
      message: "Model training completed successfully",
      output,
    });
  } catch (error) {
    console.error("[AI Train] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to train model",
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
