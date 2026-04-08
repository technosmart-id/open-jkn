import { existsSync } from "fs";
import { NextResponse } from "next/server";
import path from "path";

const MODEL_DIR = path.join(
  process.cwd(),
  "ai",
  "anomaly_detection",
  "saved_models"
);
const OUTPUT_DIR = path.join(process.cwd(), "ai", "outputs_enrollment");

// Required model files
const REQUIRED_FILES = [
  "autoencoder.keras",
  "isolation_forest.joblib",
  "scaler.joblib",
  "feature_names.joblib",
  "threshold.joblib",
];

// Output image files
const OUTPUT_IMAGES = [
  "anomaly_dashboard.png",
  "age_distribution.png",
  "ae_training_history.png",
];

export async function GET() {
  const modelStatus: Record<string, boolean> = {};
  const imageStatus: Record<string, boolean> = {};

  // Check model files
  let allModelsExist = true;
  for (const file of REQUIRED_FILES) {
    const exists = existsSync(path.join(MODEL_DIR, file));
    modelStatus[file] = exists;
    if (!exists) allModelsExist = false;
  }

  // Check output images
  for (const file of OUTPUT_IMAGES) {
    imageStatus[file] = existsSync(path.join(OUTPUT_DIR, file));
  }

  // Check if training has been run at all
  const anyOutputExists = OUTPUT_IMAGES.some((file) => imageStatus[file]);

  return NextResponse.json({
    modelsReady: allModelsExist,
    hasOutput: anyOutputExists,
    modelFiles: modelStatus,
    images: imageStatus,
    canTrain: true, // Python script exists
    canScore: allModelsExist,
  });
}
