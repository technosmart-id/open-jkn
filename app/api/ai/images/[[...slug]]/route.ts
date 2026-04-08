import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { type NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";

// Use OS temp directory for consistency with other AI routes
const OUTPUT_DIR = path.join(os.tmpdir(), "openjkn-ai", "outputs_enrollment");

// Map route paths to actual file names
const FILE_MAP: Record<string, string> = {
  "dashboard.png": "anomaly_dashboard.png",
  "age-distribution.png": "age_distribution.png",
  "training-history.png": "ae_training_history.png",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const slugPath = slug?.join("/") || "";
  const fileName = FILE_MAP[slugPath] || slugPath;
  const filePath = path.join(OUTPUT_DIR, fileName);

  // Check if file exists
  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: "Image not found. Run the model training first." },
      { status: 404 }
    );
  }

  try {
    const imageBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "svg"
            ? "image/svg+xml"
            : "image/png";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    );
  }
}
