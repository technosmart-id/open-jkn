import { NextResponse } from "next/server";
import { seedAdminUser } from "@/lib/seeders";

export async function POST() {
  try {
    await seedAdminUser();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Demo seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
