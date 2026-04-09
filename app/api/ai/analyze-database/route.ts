import { spawn } from "child_process";
import { and, eq, sql } from "drizzle-orm";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { type NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";
import { db } from "@/lib/db";
import {
  type FamilyMember,
  participant,
  type participantSegmentEnum,
} from "@/lib/db/schema/jkn";

// Use OS temp directory for better compatibility in containerized environments
const TEMP_BASE = path.join(os.tmpdir(), "openjkn-ai");
const UPLOAD_DIR = path.join(TEMP_BASE, "uploads");
const OUTPUT_DIR = path.join(TEMP_BASE, "outputs_enrollment");

// Ensure directories exist
async function ensureDirs() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
}

// Database schema → ML expected format mapping
interface DatabaseAnalysisOptions {
  participantSegment?: (typeof participantSegmentEnum.enumValues)[number];
  isActive?: boolean;
  limit?: number;
}

// PISA code mapping for peran field
const PISA_CODE_TO_ROLE: Record<string, string> = {
  "1": "PESERTA",
  "2": "ISTRI",
  "3": "SUAMI",
  "4": "ANAK",
  "5": "FAMILY_LAIN",
};

// Relationship to role mapping
const RELATIONSHIP_TO_ROLE: Record<string, string> = {
  SUAMI: "SUAMI",
  ISTRI: "ISTRI",
  ANAK_TANGGUNGAN: "ANAK",
  ANAK_TIDAK_TANGGUNGAN: "ANAK",
  ORANG_TUA: "ORANG_TUA",
  FAMILY_LAIN: "FAMILY_LAIN",
};

async function queryParticipantsForAnalysis(
  options: DatabaseAnalysisOptions = {}
): Promise<string> {
  const { participantSegment, isActive = true, limit = 50_000 } = options;

  try {
    // Build where conditions
    let whereClause: unknown;

    if (isActive !== undefined && participantSegment) {
      whereClause = and(
        eq(participant.isActive, isActive),
        eq(participant.participantSegment, participantSegment)
      );
    } else if (isActive !== undefined) {
      whereClause = eq(participant.isActive, isActive);
    } else if (participantSegment) {
      whereClause = eq(participant.participantSegment, participantSegment);
    }

    const participants = await db.query.participant.findMany({
      where: whereClause as never,
      with: {
        familyMembers: true,
      },
      limit,
    });

    // Transform data to ML expected format
    const mlRecords = transformToMLFormat(participants);

    // Write to temporary CSV file
    await ensureDirs();
    const timestamp = Date.now();
    const tempFileName = `db-export-${timestamp}.csv`;
    const tempFilePath = path.join(UPLOAD_DIR, tempFileName);

    await writeMLCsv(tempFilePath, mlRecords);

    return tempFilePath;
  } catch (queryError) {
    // Log detailed error for debugging
    console.error("[Database Query Error]:", queryError);

    // If relation query fails, try without relations (simple participant data only)
    console.log("[Fallback] Trying simple query without relations...");

    let whereClause: unknown;

    if (isActive !== undefined && participantSegment) {
      whereClause = and(
        eq(participant.isActive, isActive),
        eq(participant.participantSegment, participantSegment)
      );
    } else if (isActive !== undefined) {
      whereClause = eq(participant.isActive, isActive);
    } else if (participantSegment) {
      whereClause = eq(participant.participantSegment, participantSegment);
    }

    const participants = await db.query.participant.findMany({
      where: whereClause as never,
      limit,
    });

    // Transform data to ML expected format (without family members)
    const mlRecords = transformSimpleToMLFormat(participants);

    // Write to temporary CSV file
    await ensureDirs();
    const timestamp = Date.now();
    const tempFileName = `db-export-${timestamp}.csv`;
    const tempFilePath = path.join(UPLOAD_DIR, tempFileName);

    await writeMLCsv(tempFilePath, mlRecords);

    return tempFilePath;
  }
}

// Transform database records to ML expected format
interface MLRecord {
  PSTV01: string; // id_peserta
  PSTV02: string; // id_keluarga
  PSTV03: string; // tanggal_lahir
  PSTV04: string; // peran
  PSTV05: string; // jenis_kelamin
  PSTV06: string; // status_kawin
  PSTV07: string; // kelas_rawat
  PSTV08: string; // jenis_peserta
  PSTV15: string; // kapitasi
  PSTV17: string; // status_peserta
}

function transformToMLFormat(
  participants: Array<{
    id: number;
    bpjsNumber: string | null;
    familyCardNumber: string;
    birthDate: Date | string;
    gender: "LAKI_LAKI" | "PEREMPUAN";
    maritalStatus: "KAWIN" | "BELUM_KAWIN" | "JANDA" | "DUDA";
    participantSegment: string;
    treatmentClass: "I" | "II" | "III";
    isActive: boolean;
    statusPeserta: string | null;
    familyMembers: FamilyMember[];
  }>
): MLRecord[] {
  const records: MLRecord[] = [];

  for (const p of participants) {
    // Use bpjsNumber if available, otherwise use a generated ID
    const idPeserta = p.bpjsNumber || `P${p.id}`;
    const idKeluarga = p.familyCardNumber;

    // Format birth date as DD/MM/YYYY
    const birthDate = formatDate(p.birthDate);

    // Get role from pisaCode (default to PESERTA for main participant)
    const peran = PISA_CODE_TO_ROLE["1"]; // "1" is the default pisaCode

    // Kapitasi value (default to "YA" for active participants)
    const kapitasi = p.isActive ? "YA" : "TIDAK";

    // Status peserta
    const statusPeserta =
      p.statusPeserta || (p.isActive ? "AKTIF" : "NON_AKTIF");

    records.push({
      PSTV01: idPeserta,
      PSTV02: idKeluarga,
      PSTV03: birthDate,
      PSTV04: peran,
      PSTV05: p.gender,
      PSTV06: p.maritalStatus,
      PSTV07: p.treatmentClass,
      PSTV08: p.participantSegment,
      PSTV15: kapitasi,
      PSTV17: statusPeserta,
    });

    // Add family members
    for (const fm of p.familyMembers) {
      const fmIdPeserta = fm.bpjsNumber || `FM${fm.id}`;
      const fmBirthDate = formatDate(fm.birthDate);
      const fmPeran = RELATIONSHIP_TO_ROLE[fm.relationship] || "FAMILY_LAIN";
      const fmKapitasi = "YA"; // Family members typically covered

      records.push({
        PSTV01: fmIdPeserta,
        PSTV02: idKeluarga,
        PSTV03: fmBirthDate,
        PSTV04: fmPeran,
        PSTV05: fm.gender,
        PSTV06: "BELUM_KAWIN", // Default for family members
        PSTV07: p.treatmentClass, // Inherit from head of family
        PSTV08: p.participantSegment, // Inherit from head of family
        PSTV15: fmKapitasi,
        PSTV17: "AKTIF",
      });
    }
  }

  return records;
}

// Format date to DD/MM/YYYY
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Simple transform without family members (fallback)
function transformSimpleToMLFormat(
  participants: Array<{
    id: number;
    bpjsNumber: string | null;
    familyCardNumber: string;
    birthDate: Date | string;
    gender: "LAKI_LAKI" | "PEREMPUAN";
    maritalStatus: "KAWIN" | "BELUM_KAWIN" | "JANDA" | "DUDA";
    participantSegment: string;
    treatmentClass: "I" | "II" | "III";
    isActive: boolean;
    statusPeserta: string | null;
  }>
): MLRecord[] {
  const records: MLRecord[] = [];

  for (const p of participants) {
    const idPeserta = p.bpjsNumber || `P${p.id}`;
    const idKeluarga = p.familyCardNumber;
    const birthDate = formatDate(p.birthDate);
    const peran = PISA_CODE_TO_ROLE["1"];
    const kapitasi = p.isActive ? "YA" : "TIDAK";
    const statusPeserta =
      p.statusPeserta || (p.isActive ? "AKTIF" : "NON_AKTIF");

    records.push({
      PSTV01: idPeserta,
      PSTV02: idKeluarga,
      PSTV03: birthDate,
      PSTV04: peran,
      PSTV05: p.gender,
      PSTV06: p.maritalStatus,
      PSTV07: p.treatmentClass,
      PSTV08: p.participantSegment,
      PSTV15: kapitasi,
      PSTV17: statusPeserta,
    });
  }

  return records;
}

// Write ML format records to CSV
async function writeMLCsv(
  filePath: string,
  records: MLRecord[]
): Promise<void> {
  const headers = [
    "PSTV01",
    "PSTV02",
    "PSTV03",
    "PSTV04",
    "PSTV05",
    "PSTV06",
    "PSTV07",
    "PSTV08",
    "PSTV15",
    "PSTV17",
  ];

  const csvLines = [headers.join(",")];

  for (const record of records) {
    const values = headers.map((h) => record[h as keyof MLRecord]);
    csvLines.push(values.join(","));
  }

  await writeFile(filePath, csvLines.join("\n"));
}

// Run Python script and return output
function runPythonScript(
  scriptPath: string,
  dataPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [scriptPath, dataPath], {
      env: {
        ...process.env,
        OPENJKN_AI_OUTPUT_DIR: OUTPUT_DIR,
      },
    });
    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(
          new Error(`Python script exited with code ${code}: ${errorOutput}`)
        );
      }
    });

    python.on("error", (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
}

// Simple CSV parser for the output files
async function parseCsvFile(filePath: string): Promise<unknown[]> {
  const fs = await import("fs/promises");
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const data: unknown[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const record: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      const value = values[index];
      // Try to parse as number
      const numValue = Number(value);
      record[header] =
        !Number.isNaN(numValue) && value !== "" ? numValue : value;
    });

    data.push(record);
  }

  return data;
}

// Simple CSV line parser (handles quoted values)
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());

  return result;
}

// Limit data size for response
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
    tempFilePath = await queryParticipantsForAnalysis({
      participantSegment,
      isActive,
      limit,
    });

    // Run Python scoring script
    const scriptPath = path.join(process.cwd(), "ai", "run_score.py");
    await runPythonScript(scriptPath, tempFilePath);

    // Parse the output CSV
    const scoredDataPath = path.join(OUTPUT_DIR, "scored_new_data.csv");
    const anomaliesDataPath = path.join(OUTPUT_DIR, "anomalies_new_data.csv");

    let scoredData: unknown[] | null = null;
    let anomaliesData: unknown[] | null = null;
    let summary: Record<string, number> | null = null;

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
      anomaliesData?.forEach((record: unknown) => {
        const r = record as { anomaly_source?: string };
        const source = r.anomaly_source || "unknown";
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
    // Clean up temp file
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        await unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

// GET endpoint to check database analysis capabilities
export async function GET() {
  try {
    // Get participant counts by segment
    const segmentCounts = await db
      .select({
        segment: participant.participantSegment,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(participant)
      .groupBy(participant.participantSegment);

    // Get active/inactive counts
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
      {
        error: "Failed to get database stats",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
