import { NextResponse } from "next/server";
import { SyncService } from "@/lib/sync";

export async function POST(request: Request) {
  try {
    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: "participantId is required" },
        { status: 400 }
      );
    }

    const syncService = new SyncService({ dryRun: false });

    await syncService.syncParticipant(participantId);

    await syncService.close();

    return NextResponse.json({
      success: true,
      message: `Participant ${participantId} synced to openIMIS`,
    });
  } catch (error) {
    console.error("[Sync API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sync failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
