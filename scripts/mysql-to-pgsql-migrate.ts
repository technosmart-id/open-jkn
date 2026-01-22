import "dotenv/config";
import mysql from "mysql2/promise";
import { Pool } from "pg";

// Configuration
const BATCH_SIZE = 5000;
const DRY_RUN = process.argv.includes("--dry-run");
const SINGLE_TABLE = process.argv
  .find((arg) => arg.startsWith("--table="))
  ?.split("=")[1];
const SKIP_TABLES =
  process.argv
    .find((arg) => arg.startsWith("--skip="))
    ?.split("=")[1]
    ?.split(",") ?? [];

// Table-specific WHERE filters (to limit data during migration)
const TABLE_FILTERS: Record<string, string> = {
  sppt: "THN_PAJAK_SPPT IN ('2024', '2025')",
  pembayaran_sppt: "THN_PAJAK_SPPT IN ('2024', '2025')",
};

// Get WHERE clause for a table (if any filter is defined)
function getTableFilter(tableName: string): string {
  return TABLE_FILTERS[tableName] ?? "";
}

// Migration order - respects foreign key dependencies
const MIGRATION_PHASES = {
  // Phase 1: Reference Tables (no dependencies)
  reference: [
    "ref_propinsi",
    "ref_dati2",
    "ref_kecamatan",
    "ref_kelurahan",
    "ref_jpb",
    "fasilitas",
    "kelas_tanah",
    "kelas_bangunan",
    "tipe_bangunan",
    "bank_tunggal",
    "bank_persepsi",
    "tempat_pembayaran",
  ],
  // Phase 2: DBKB Tables (no dependencies)
  dbkb: [
    "dbkb_standard",
    "dbkb_material",
    "dbkb_mezanin",
    "dbkb_daya_dukung",
    "dbkb_jpb2",
    "dbkb_jpb3",
    "dbkb_jpb4",
    "dbkb_jpb5",
    "dbkb_jpb6",
    "dbkb_jpb7",
    "dbkb_jpb8",
    "dbkb_jpb9",
    "dbkb_jpb12",
    "dbkb_jpb13",
    "dbkb_jpb14",
    "dbkb_jpb15",
    "dbkb_jpb16",
  ],
  // Phase 3: Taxpayer (no dependencies)
  taxpayer: ["dat_subjek_pajak"],
  // Phase 4: Tax Objects (depends on dat_subjek_pajak)
  taxObjects: [
    "dat_objek_pajak",
    "dat_znt",
    "dat_nir",
    "dat_op_bumi",
    "dat_op_induk",
    "dat_op_anggota",
  ],
  // Phase 5: Buildings (depends on dat_objek_pajak)
  buildings: [
    "dat_op_bangunan",
    "dat_fasilitas_bangunan",
    "dat_jpb2",
    "dat_jpb3",
    "dat_jpb4",
    "dat_jpb5",
    "dat_jpb6",
    "dat_jpb7",
    "dat_jpb8",
    "dat_jpb9",
    "dat_jpb12",
    "dat_jpb13",
    "dat_jpb14",
    "dat_jpb15",
    "dat_jpb16",
  ],
  // Phase 6: SPPT & Payments (depends on dat_objek_pajak)
  spptPayments: ["sppt", "sppt_op_bersama", "pembayaran_sppt"],
  // Phase 7: Pelayanan Reference Tables
  pelayananReference: [
    "ref_kanwil",
    "ref_kppbb",
    "ref_jns_pelayanan",
    "ref_seksi",
  ],
  // Phase 8: PST/Pelayanan Tables
  // Note: MySQL uses 'pelayanan' tables, PostgreSQL uses 'pst_' tables
  // The structures are different - MySQL uses ID-based, PostgreSQL uses composite keys
  // These require special handling - see TABLE_ALIASES and PELAYANAN_TRANSFORM
  pelayanan: [
    "pelayanan", // Maps to pst_permohonan (different structure)
    "pelayanan_dokumen", // Maps to pst_lampiran (different structure)
  ],
};

// Table name aliases: MySQL table name -> PostgreSQL table name
// Used when MySQL and PostgreSQL have different table names for same data
const TABLE_ALIASES: Record<string, string> = {
  pelayanan: "pst_permohonan",
  pelayanan_dokumen: "pst_lampiran",
};

// Get PostgreSQL table name from MySQL table name
function getPgTableName(mysqlTable: string): string {
  return TABLE_ALIASES[mysqlTable] ?? mysqlTable;
}

// Tables that require special transformation (different structures between MySQL and PostgreSQL)
// These tables cannot be migrated with simple column mapping
const SPECIAL_TRANSFORM_TABLES = new Set(["pelayanan", "pelayanan_dokumen"]);

// Helper to safely truncate string values
function safeStr(value: unknown, maxLen: number): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const str = String(value);
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

// Transform MySQL pelayanan row to PostgreSQL pst_permohonan format
// MySQL pelayanan uses: ID (auto-increment), NO_PELAYANAN (e.g., "2013.0011.045")
// PostgreSQL pst_permohonan uses: composite key (kd_kanwil, kd_kppbb, thn_pelayanan, bundel_pelayanan, no_urut_pelayanan)
function transformPelayananRow(
  row: Record<string, unknown>
): Record<string, unknown> | null {
  const noPelayanan = row.NO_PELAYANAN as string;
  if (!noPelayanan) {
    return null;
  }

  // Parse NO_PELAYANAN format: "YYYY.BBBB.NNN" -> year.bundel.urut
  const parts = noPelayanan.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [thnPelayanan, bundelPelayanan, noUrutPelayanan] = parts;

  return {
    kd_kanwil: "51", // Default Bali kanwil code
    kd_kppbb: "71", // Default KPPBB code
    thn_pelayanan: thnPelayanan.slice(0, 4),
    bundel_pelayanan: bundelPelayanan.slice(0, 4),
    no_urut_pelayanan: noUrutPelayanan.padStart(3, "0").slice(0, 3),
    nama_pemohon: safeStr(row.NAMA_PEMOHON, 30),
    alamat_pemohon: safeStr(row.ALAMAT_PEMOHON, 40),
    keterangan_pst: safeStr(row.KETERANGAN, 75),
    catatan_pst: safeStr(row.CATATAN, 75),
    status_kolektif: "0",
    tgl_terima_dokumen_wp: row.TANGGAL_PELAYANAN ?? new Date("2000-01-01"),
    tgl_perkiraan_selesai:
      row.TANGGAL_PERKIRAAN_SELESAI ?? new Date("2000-01-01"),
    nip_penerima: safeStr(row.NIP_PETUGAS_PENERIMA, 18) ?? "",
  };
}

// Get all tables in migration order
function getAllTables(): string[] {
  return Object.values(MIGRATION_PHASES).flat();
}

// Parse MySQL connection URL
function parseMySQLUrl(url: string): mysql.ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number.parseInt(parsed.port, 10) || 3306,
    user: parsed.username,
    password: parsed.password || undefined,
    database: parsed.pathname.slice(1),
  };
}

// Format duration
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${(ms / 60_000).toFixed(1)}m`;
}

// Log with timestamp
function log(message: string): void {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`[${timestamp}] ${message}`);
}

// Escape column names for PostgreSQL
function escapeColumn(col: string): string {
  return `"${col}"`;
}

// Column name aliases: MySQL column name -> PostgreSQL column name
// MySQL columns with underscores before numbers don't match PostgreSQL without underscores
const COLUMN_ALIASES: Record<string, string> = {
  // dbkb_jpb tables have different naming in MySQL
  kls_dbkb_jpb_3: "kls_dbkb_jpb3",
  kls_dbkb_jpb_7: "kls_dbkb_jpb7",
  kls_dbkb_jpb_8: "kls_dbkb_jpb8",
  kls_dbkb_jpb_12: "kls_dbkb_jpb12",
  kls_dbkb_jpb_14: "kls_dbkb_jpb14",
  kls_dbkb_jpb_15: "kls_dbkb_jpb15",
  thn_dbkb_jpb_3: "thn_dbkb_jpb3",
  thn_dbkb_jpb_7: "thn_dbkb_jpb7",
  thn_dbkb_jpb_8: "thn_dbkb_jpb8",
  thn_dbkb_jpb_12: "thn_dbkb_jpb12",
  thn_dbkb_jpb_14: "thn_dbkb_jpb14",
  thn_dbkb_jpb_15: "thn_dbkb_jpb15",
  lantai_min_jpb_3: "lantai_min_jpb3",
  lantai_min_jpb_7: "lantai_min_jpb7",
  lantai_min_jpb_8: "lantai_min_jpb8",
  lantai_min_jpb_12: "lantai_min_jpb12",
  lantai_min_jpb_14: "lantai_min_jpb14",
  lantai_min_jpb_15: "lantai_min_jpb15",
  lantai_max_jpb_3: "lantai_max_jpb3",
  lantai_max_jpb_7: "lantai_max_jpb7",
  lantai_max_jpb_8: "lantai_max_jpb8",
  lantai_max_jpb_12: "lantai_max_jpb12",
  lantai_max_jpb_14: "lantai_max_jpb14",
  lantai_max_jpb_15: "lantai_max_jpb15",
  nilai_dbkb_jpb_3: "nilai_dbkb_jpb3",
  nilai_dbkb_jpb_7: "nilai_dbkb_jpb7",
  nilai_dbkb_jpb_8: "nilai_dbkb_jpb8",
  nilai_dbkb_jpb_12: "nilai_dbkb_jpb12",
  nilai_dbkb_jpb_14: "nilai_dbkb_jpb14",
  nilai_dbkb_jpb_15: "nilai_dbkb_jpb15",
  // dat_jpb tables
  kls_jpb_3: "kls_jpb3",
  kls_jpb_7: "kls_jpb7",
  kls_jpb_8: "kls_jpb8",
  kls_jpb_12: "kls_jpb12",
  kls_jpb_14: "kls_jpb14",
  kls_jpb_15: "kls_jpb15",
  // dbkb_jpb6 specific
  lantai_min_jpb_6: "lantai_min_jpb6",
  lantai_max_jpb_6: "lantai_max_jpb6",
};

// Map MySQL column name to PostgreSQL column name
function mapMysqlToPgColumn(mysqlCol: string): string {
  const lower = mysqlCol.toLowerCase();
  return COLUMN_ALIASES[lower] ?? lower;
}

// Check if data type is numeric
function isNumericType(dataType: string): boolean {
  return (
    dataType === "bigint" || dataType === "integer" || dataType === "smallint"
  );
}

// Check if data type is string
function isStringType(dataType: string): boolean {
  return dataType === "character" || dataType === "character varying";
}

// Convert value to rounded integer
function toRoundedInt(value: unknown): number | unknown {
  if (typeof value === "number") {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const num = Number.parseFloat(value);
    return Number.isNaN(num) ? value : Math.round(num);
  }
  return value;
}

// Truncate string to max length
function truncateString(value: string, maxLength: number): string {
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

// Default values for NOT NULL columns when source has NULL
// Keys are PostgreSQL column names (lowercase)
const NULL_DEFAULTS: Record<string, unknown> = {
  // Building classification codes (dbkb_jpb tables)
  kls_dbkb_jpb3: "0",
  kls_dbkb_jpb7: "0",
  kls_dbkb_jpb8: "0",
  kls_dbkb_jpb12: "0",
  kls_dbkb_jpb14: "0",
  kls_dbkb_jpb15: "0",
  // Building classification codes (dat_jpb tables)
  kls_jpb3: "0",
  kls_jpb7: "0",
  kls_jpb8: "0",
  kls_jpb12: "0",
  kls_jpb14: "0",
  kls_jpb15: "0",
  // Building floors
  lantai_min_jpb3: 0,
  lantai_max_jpb3: 0,
  lantai_min_jpb6: 0,
  lantai_max_jpb6: 0,
  lantai_min_jpb7: 0,
  lantai_max_jpb7: 0,
  lantai_min_jpb8: 0,
  lantai_max_jpb8: 0,
  lantai_min_jpb12: 0,
  lantai_max_jpb12: 0,
  lantai_min_jpb14: 0,
  lantai_max_jpb14: 0,
  lantai_min_jpb15: 0,
  lantai_max_jpb15: 0,
  // Form numbers
  no_formulir_lspop: "00000000000",
  no_formulir_spop: "00000000000",
  // Timestamps - use epoch date as default
  tgl_perekaman_bng: new Date("2000-01-01T00:00:00Z"),
  tgl_pendataan_bng: new Date("2000-01-01T00:00:00Z"),
  tgl_pemeriksaan_bng: new Date("2000-01-01T00:00:00Z"),
  tgl_pendataan_op: new Date("2000-01-01T00:00:00Z"),
  tgl_pemeriksaan_op: new Date("2000-01-01T00:00:00Z"),
  tgl_perekaman_op: new Date("2000-01-01T00:00:00Z"),
  // Bank codes for SPPT
  kd_kanwil_bank: "00",
  kd_kppbb_bank: "00",
  kd_bank_tunggal: "00",
  kd_bank_persepsi: "00",
  kd_tp: "00",
  // NIP fields
  nip_pendata_bng: "000000000000000000",
  nip_pemeriksa_bng: "000000000000000000",
  nip_perekam_bng: "000000000000000000",
  nip_pendata: "000000000000000000",
  nip_pemeriksa_op: "000000000000000000",
  nip_perekam_op: "000000000000000000",
  nip_pencetak_sppt: "000000000000000000",
  // SPPT year/class fields
  thn_awal_kls_tanah: "2000",
  thn_awal_kls_bng: "2000",
  kd_kls_tanah: "000",
  kd_kls_bng: "000",
  siklus_sppt: 1,
  // SPPT taxpayer info
  nm_wp_sppt: "",
  jln_wp_sppt: "",
  kelurahan_wp_sppt: "",
  kota_wp_sppt: "",
  // SPPT dates
  tgl_jatuh_tempo_sppt: new Date("2000-01-01T00:00:00Z"),
  tgl_terbit_sppt: new Date("2000-01-01T00:00:00Z"),
  tgl_cetak_sppt: new Date("2000-01-01T00:00:00Z"),
  // PST fields
  status_kolektif: "0",
  tgl_terima_dokumen_wp: new Date("2000-01-01T00:00:00Z"),
  tgl_perkiraan_selesai: new Date("2000-01-01T00:00:00Z"),
  nip_penerima: "000000000000000000",
  status_selesai: 0,
  tgl_selesai: new Date("2000-01-01T00:00:00Z"),
  kd_seksi_berkas: "00",
  nama_wp_baru: "",
  letak_op_baru: "",
  jns_pengurangan: "0",
  pct_permohonan_pengurangan: 0,
  // Pelayanan reference
  nm_kanwil: "",
  al_kanwil: "",
  kota_terbit_kanwil: "",
  nm_kppbb: "",
  al_kppbb: "",
  kota_terbit_kppbb: "",
  nm_jenis_pelayanan: "",
  nm_seksi: "",
  no_srt_seksi: "00",
  kode_surat_1: "",
  kode_surat_2: "",
};

// Get default value for a column or null
function getDefaultForNull(columnName: string): unknown {
  return NULL_DEFAULTS[columnName] ?? null;
}

// Clamp numeric value to fit PostgreSQL numeric(5,2) - max 999.99
function clampNumeric(
  value: unknown,
  precision: number,
  scale: number
): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  const maxValue = 10 ** (precision - scale) - 10 ** -scale;
  const num =
    typeof value === "string" ? Number.parseFloat(value) : Number(value);
  if (Number.isNaN(num)) {
    return 0;
  }
  return Math.min(Math.max(num, -maxValue), maxValue);
}

// Convert MySQL value to PostgreSQL compatible value
function convertValue(
  value: unknown,
  columnName: string,
  pgColumnInfo?: ColumnInfo
): unknown {
  // Handle NULL values with defaults for NOT NULL columns
  // Use PostgreSQL column name for lookup (via alias mapping)
  if (value === null || value === undefined) {
    const pgColName = mapMysqlToPgColumn(columnName);
    return getDefaultForNull(pgColName);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Buffer.isBuffer(value)) {
    return value.toString();
  }

  if (pgColumnInfo) {
    const { dataType, charMaxLength } = pgColumnInfo;

    // Handle numeric(p,s) columns - clamp to fit
    if (dataType === "numeric" && columnName.toLowerCase() === "njkp_sppt") {
      return clampNumeric(value, 5, 2);
    }

    if (isNumericType(dataType)) {
      return toRoundedInt(value);
    }
    if (isStringType(dataType) && charMaxLength && typeof value === "string") {
      return truncateString(value, charMaxLength);
    }
  }

  return typeof value === "string" ? value.trim() : value;
}

// Build INSERT statement with ON CONFLICT DO NOTHING
function buildInsertSQL(
  tableName: string,
  columns: string[],
  rowCount: number
): string {
  const escapedColumns = columns.map(escapeColumn).join(", ");
  const placeholders: string[] = [];

  for (let i = 0; i < rowCount; i++) {
    const rowPlaceholders = columns.map(
      (_, j) => `$${i * columns.length + j + 1}`
    );
    placeholders.push(`(${rowPlaceholders.join(", ")})`);
  }

  return `INSERT INTO "${tableName}" (${escapedColumns}) VALUES ${placeholders.join(", ")} ON CONFLICT DO NOTHING`;
}

// Column type info
type ColumnInfo = {
  name: string;
  dataType: string;
  charMaxLength: number | null;
};

// Get PostgreSQL table columns with type info
async function getPgColumns(
  pgPool: Pool,
  tableName: string
): Promise<ColumnInfo[]> {
  const result = await pgPool.query(
    `SELECT column_name, data_type, character_maximum_length
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return result.rows.map((row) => ({
    name: row.column_name as string,
    dataType: row.data_type as string,
    charMaxLength: row.character_maximum_length as number | null,
  }));
}

// Column mapping result
type ColumnMapping = {
  mysqlColumns: string[];
  pgColumns: string[];
  pgColumnInfoList: ColumnInfo[];
  extraMysqlColumns: string[];
  hasMetadata: boolean;
};

// Build column mapping between MySQL and PostgreSQL
function buildColumnMapping(
  allMysqlColumns: string[],
  pgColumnsInfo: ColumnInfo[]
): ColumnMapping {
  const pgColumnMap = new Map(pgColumnsInfo.map((c) => [c.name, c]));
  const pgColumnNames = pgColumnsInfo.map((c) => c.name);
  const hasMetadata = pgColumnMap.has("metadata");

  const mysqlColumns: string[] = [];
  const pgColumns: string[] = [];
  const pgColumnInfoList: ColumnInfo[] = [];
  const extraMysqlColumns: string[] = [];

  for (const mysqlCol of allMysqlColumns) {
    // Use alias mapping to handle column name differences
    const pgCol = mapMysqlToPgColumn(mysqlCol);
    if (pgColumnNames.includes(pgCol) && pgCol !== "metadata") {
      mysqlColumns.push(mysqlCol);
      pgColumns.push(pgCol);
      pgColumnInfoList.push(pgColumnMap.get(pgCol)!);
    } else if (pgCol !== "metadata") {
      extraMysqlColumns.push(mysqlCol);
    }
  }

  // Add metadata column if there are extra columns
  if (hasMetadata && extraMysqlColumns.length > 0) {
    pgColumns.push("metadata");
    pgColumnInfoList.push(pgColumnMap.get("metadata")!);
  }

  return {
    mysqlColumns,
    pgColumns,
    pgColumnInfoList,
    extraMysqlColumns,
    hasMetadata,
  };
}

// Row conversion context
type RowConversionContext = {
  mysqlColumns: string[];
  pgColumnInfoList: ColumnInfo[];
  extraMysqlColumns: string[];
  storeMetadata: boolean;
};

// Prepare row values for insertion
function prepareRowValues(
  row: mysql.RowDataPacket,
  ctx: RowConversionContext
): unknown[] {
  const values: unknown[] = [];

  // Convert mapped columns
  for (let i = 0; i < ctx.mysqlColumns.length; i++) {
    values.push(
      convertValue(
        row[ctx.mysqlColumns[i]],
        ctx.mysqlColumns[i],
        ctx.pgColumnInfoList[i]
      )
    );
  }

  // Add metadata if needed
  if (ctx.storeMetadata) {
    const metadata: Record<string, unknown> = {};
    for (const extraCol of ctx.extraMysqlColumns) {
      if (row[extraCol] !== null && row[extraCol] !== undefined) {
        metadata[extraCol.toLowerCase()] = row[extraCol];
      }
    }
    values.push(JSON.stringify(metadata));
  }

  return values;
}

// Batch migration context
type BatchMigrationContext = {
  mysqlConn: mysql.Connection;
  pgClient: ReturnType<Pool["connect"]> extends Promise<infer T> ? T : never;
  tableName: string;
  pgTableName: string;
  totalRows: number;
  mapping: ColumnMapping;
  isSpecialTransform: boolean;
  whereClause: string;
};

// Get transform function for special tables
type TransformFn = (
  row: Record<string, unknown>
) => Record<string, unknown> | null;

function getTransformFunction(tableName: string): TransformFn | null {
  if (tableName === "pelayanan") {
    return transformPelayananRow;
  }
  return null;
}

// Process transformed rows for special tables
async function insertTransformedRows(
  ctx: BatchMigrationContext,
  rows: mysql.RowDataPacket[],
  transformFn: TransformFn
): Promise<number> {
  const transformedRows: Record<string, unknown>[] = [];
  for (const row of rows) {
    const transformed = transformFn(row as Record<string, unknown>);
    if (transformed) {
      if (ctx.mapping.hasMetadata) {
        // Convert metadata to JSON string for JSONB column
        transformed.metadata = JSON.stringify(row);
      }
      transformedRows.push(transformed);
    }
  }

  if (transformedRows.length === 0) {
    return 0;
  }

  const pgColumns = Object.keys(transformedRows[0]);
  const values: unknown[] = [];
  for (const tRow of transformedRows) {
    for (const col of pgColumns) {
      values.push(tRow[col]);
    }
  }

  const sql = buildInsertSQL(
    ctx.pgTableName,
    pgColumns,
    transformedRows.length
  );
  await ctx.pgClient.query(sql, values);
  return transformedRows.length;
}

// Process standard rows with column mapping
async function insertStandardRows(
  ctx: BatchMigrationContext,
  rows: mysql.RowDataPacket[],
  conversionCtx: RowConversionContext
): Promise<number> {
  const values: unknown[] = [];
  for (const row of rows) {
    values.push(...prepareRowValues(row, conversionCtx));
  }

  const sql = buildInsertSQL(
    ctx.pgTableName,
    ctx.mapping.pgColumns,
    rows.length
  );
  await ctx.pgClient.query(sql, values);
  return rows.length;
}

// Migrate table data in batches
async function migrateBatches(ctx: BatchMigrationContext): Promise<number> {
  let migratedRows = 0;
  const transformFn = ctx.isSpecialTransform
    ? getTransformFunction(ctx.tableName)
    : null;

  const conversionCtx: RowConversionContext = {
    mysqlColumns: ctx.mapping.mysqlColumns,
    pgColumnInfoList: ctx.mapping.pgColumnInfoList,
    extraMysqlColumns: ctx.mapping.extraMysqlColumns,
    storeMetadata:
      ctx.mapping.hasMetadata && ctx.mapping.extraMysqlColumns.length > 0,
  };

  for (
    let batchOffset = 0;
    batchOffset < ctx.totalRows;
    batchOffset += BATCH_SIZE
  ) {
    const [rows] = await ctx.mysqlConn.query<mysql.RowDataPacket[]>(
      `SELECT * FROM \`${ctx.tableName}\`${ctx.whereClause} LIMIT ${BATCH_SIZE} OFFSET ${batchOffset}`
    );

    if (rows.length === 0) {
      break;
    }

    const insertedCount = transformFn
      ? await insertTransformedRows(ctx, rows, transformFn)
      : await insertStandardRows(ctx, rows, conversionCtx);

    migratedRows += insertedCount;

    const progress = Math.round(
      ((batchOffset + BATCH_SIZE) / ctx.totalRows) * 100
    );
    process.stdout.write(
      `\r  Progress: ${Math.min(progress, 100)}% (${migratedRows.toLocaleString()}/${ctx.totalRows.toLocaleString()})`
    );
  }

  return migratedRows;
}

// Migrate a single table
async function migrateTable(
  mysqlConn: mysql.Connection,
  pgPool: Pool,
  tableName: string
): Promise<{ success: boolean; rowCount: number; error?: string }> {
  const startTime = Date.now();
  // Get the PostgreSQL table name (may be different from MySQL)
  const pgTableName = getPgTableName(tableName);
  const isSpecialTransform = SPECIAL_TRANSFORM_TABLES.has(tableName);

  log(
    `Starting migration: ${tableName}${pgTableName !== tableName ? ` -> ${pgTableName}` : ""}`
  );

  try {
    // Check if table exists in MySQL
    const [tables] = await mysqlConn.query<mysql.RowDataPacket[]>(
      `SHOW TABLES LIKE '${tableName}'`
    );
    if (tables.length === 0) {
      log(`  Table ${tableName} does not exist in MySQL, skipping`);
      return { success: true, rowCount: 0 };
    }

    // Get table filter (if any)
    const tableFilter = getTableFilter(tableName);
    const whereClause = tableFilter ? ` WHERE ${tableFilter}` : "";

    // Get row count from MySQL
    const [countResult] = await mysqlConn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM \`${tableName}\`${whereClause}`
    );
    const totalRows = countResult[0].count as number;

    if (totalRows === 0) {
      log(`  Table ${tableName} is empty, skipping`);
      return { success: true, rowCount: 0 };
    }

    log(
      `  Found ${totalRows.toLocaleString()} rows${tableFilter ? ` (filtered: ${tableFilter})` : ""}`
    );

    // Get column names from MySQL
    const [columns] = await mysqlConn.query<mysql.RowDataPacket[]>(
      `SHOW COLUMNS FROM \`${tableName}\``
    );
    const allMysqlColumns = columns.map((col) => col.Field as string);

    // Get column info from PostgreSQL (using the target table name) and build mapping
    const pgColumnsInfo = await getPgColumns(pgPool, pgTableName);
    const mapping = buildColumnMapping(allMysqlColumns, pgColumnsInfo);

    // For special transform tables, we handle all columns via transformation
    if (isSpecialTransform) {
      log("  Special transform table - using row transformation");
    }

    if (mapping.extraMysqlColumns.length > 0 && mapping.hasMetadata) {
      log(
        `  Extra columns for metadata: ${mapping.extraMysqlColumns.join(", ")}`
      );
    }

    if (mapping.mysqlColumns.length === 0) {
      log("  No matching columns found, skipping");
      return { success: true, rowCount: 0 };
    }

    log(
      `  Migrating ${mapping.mysqlColumns.length}/${allMysqlColumns.length} columns`
    );

    if (DRY_RUN) {
      log(`  [DRY RUN] Would migrate ${totalRows.toLocaleString()} rows`);
      return { success: true, rowCount: totalRows };
    }

    // Clear existing data in PostgreSQL
    const pgClient = await pgPool.connect();
    try {
      await pgClient.query("BEGIN");
      await pgClient.query(`DELETE FROM "${pgTableName}"`);

      // Migrate in batches
      const migratedRows = await migrateBatches({
        mysqlConn,
        pgClient,
        tableName,
        pgTableName,
        totalRows,
        mapping,
        isSpecialTransform,
        whereClause,
      });

      await pgClient.query("COMMIT");
      process.stdout.write("\n");

      const duration = formatDuration(Date.now() - startTime);
      log(`  Completed: ${migratedRows.toLocaleString()} rows in ${duration}`);

      return { success: true, rowCount: migratedRows };
    } catch (error) {
      await pgClient.query("ROLLBACK");
      throw error;
    } finally {
      pgClient.release();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`  ERROR: ${errorMessage}`);
    return { success: false, rowCount: 0, error: errorMessage };
  }
}

// Migration result type
type MigrationResult = {
  table: string;
  success: boolean;
  rowCount: number;
  error?: string;
};

// Generate markdown report
function generateMarkdownReport(
  results: MigrationResult[],
  totalDuration: string,
  isDryRun: boolean
): string {
  const now = new Date();
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  const totalRows = results.reduce((sum, r) => sum + r.rowCount, 0);

  const lines: string[] = [
    "# MySQL to PostgreSQL Migration Report",
    "",
    `**Date:** ${now.toLocaleString()}`,
    `**Mode:** ${isDryRun ? "Dry Run" : "Full Migration"}`,
    `**Duration:** ${totalDuration}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|--------|-------|",
    `| Total Tables | ${results.length} |`,
    `| Successful | ${successCount} |`,
    `| Failed | ${failCount} |`,
    `| Total Rows | ${totalRows.toLocaleString()} |`,
    "",
    "## Table Details",
    "",
    "| # | Table | Status | Rows | Error |",
    "|---|-------|--------|------|-------|",
  ];

  for (const [idx, r] of results.entries()) {
    const status = r.success ? "Success" : "Failed";
    const error = r.error ? r.error.slice(0, 50) : "-";
    lines.push(
      `| ${idx + 1} | ${r.table} | ${status} | ${r.rowCount.toLocaleString()} | ${error} |`
    );
  }

  if (failCount > 0) {
    lines.push("", "## Failed Tables", "");
    const failedResults = results.filter((r) => !r.success);
    for (const r of failedResults) {
      lines.push(
        `### ${r.table}`,
        "",
        "```",
        r.error ?? "Unknown error",
        "```",
        ""
      );
    }
  }

  lines.push("", "---", "*Generated by mysql-to-pgsql-migrate.ts*");

  return lines.join("\n");
}

// Write markdown report to file
function writeMarkdownReport(
  results: MigrationResult[],
  totalDuration: string,
  isDryRun: boolean
): string {
  const { writeFileSync } = require("node:fs");
  const { join } = require("node:path");

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `migration-report-${timestamp}.md`;
  const filepath = join(process.cwd(), "scripts", filename);

  const content = generateMarkdownReport(results, totalDuration, isDryRun);
  writeFileSync(filepath, content, "utf-8");

  return filepath;
}

// Main migration function
async function main(): Promise<void> {
  console.log("\n========================================");
  console.log("MySQL to PostgreSQL Migration");
  console.log("========================================\n");

  if (DRY_RUN) {
    console.log("*** DRY RUN MODE - No changes will be made ***\n");
  }

  // Validate environment variables
  const mysqlUrl = process.env.LEGACY_DATABASE_URL;
  const pgUrl = process.env.DATABASE_URL;

  if (!mysqlUrl) {
    console.error("Error: LEGACY_DATABASE_URL not set");
    process.exit(1);
  }

  if (!pgUrl) {
    console.error("Error: DATABASE_URL not set");
    process.exit(1);
  }

  // Connect to MySQL
  log("Connecting to MySQL...");
  const mysqlConfig = parseMySQLUrl(mysqlUrl);
  const mysqlConn = await mysql.createConnection(mysqlConfig);
  log(`Connected to MySQL: ${mysqlConfig.database}`);

  // Connect to PostgreSQL
  log("Connecting to PostgreSQL...");
  const pgPool = new Pool({ connectionString: pgUrl });
  await pgPool.query("SELECT 1");
  log("Connected to PostgreSQL");

  // Determine tables to migrate
  let tablesToMigrate = SINGLE_TABLE ? [SINGLE_TABLE] : getAllTables();
  tablesToMigrate = tablesToMigrate.filter((t) => !SKIP_TABLES.includes(t));

  console.log(`\nTables to migrate: ${tablesToMigrate.length}`);
  if (SKIP_TABLES.length > 0) {
    console.log(`Skipping: ${SKIP_TABLES.join(", ")}`);
  }
  console.log("");

  // Run migration
  const startTime = Date.now();
  const results: {
    table: string;
    success: boolean;
    rowCount: number;
    error?: string;
  }[] = [];

  for (const table of tablesToMigrate) {
    const result = await migrateTable(mysqlConn, pgPool, table);
    results.push({ table, ...result });
  }

  // Close connections
  await mysqlConn.end();
  await pgPool.end();

  // Print summary
  const totalDuration = formatDuration(Date.now() - startTime);
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  const totalRows = results.reduce((sum, r) => sum + r.rowCount, 0);

  console.log("\n========================================");
  console.log("Migration Summary");
  console.log("========================================");
  console.log(`Total time: ${totalDuration}`);
  console.log(`Tables: ${successCount} succeeded, ${failCount} failed`);
  console.log(`Total rows: ${totalRows.toLocaleString()}`);

  if (failCount > 0) {
    console.log("\nFailed tables:");
    const failedResults = results.filter((result) => !result.success);
    for (const r of failedResults) {
      console.log(`  - ${r.table}: ${r.error}`);
    }
  }

  // Generate markdown report
  const reportPath = writeMarkdownReport(results, totalDuration, DRY_RUN);
  console.log(`\nReport saved to: ${reportPath}`);

  console.log("");
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
