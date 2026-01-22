import { z } from "zod";
import { protectedProcedure } from "../server";

// Schema for SPPT data
const spptSchema = z.object({
  tahunPajak: z.number(),
  kabupaten: z.string(),
  provinsi: z.string(),
  nop: z.object({
    full: z.string(),
    provinsi: z.string(),
    kabupaten: z.string(),
    kecamatan: z.string(),
    kelurahan: z.string(),
    blok: z.string(),
    noUrut: z.string(),
    jenisOP: z.string(),
  }),
  letakOP: z.object({
    alamat: z.string(),
    rtRw: z.string(),
    kelurahan: z.string(),
    kecamatan: z.string(),
  }),
  wajibPajak: z.object({
    nama: z.string(),
    alamat: z.string(),
    kotaKodePos: z.string(),
  }),
  objekPajak: z.object({
    luasTanah: z.number(),
    luasBangunan: z.number(),
    njopTanahPerM2: z.number(),
    njopBangunanPerM2: z.number(),
    kelasTanah: z.string(),
    kelasBangunan: z.string(),
  }),
  perhitungan: z.object({
    njopTanah: z.number(),
    njopBangunan: z.number(),
    njopTotal: z.number(),
    njoptkp: z.number(),
    njopKenaPajak: z.number(),
    tarif: z.number(),
    pbbTerutang: z.number(),
  }),
  jatuhTempo: z.string(),
  tanggalTerbit: z.string(),
  nomorUrut: z.string(),
  tempatPembayaran: z.array(z.string()),
});

export type SpptData = z.infer<typeof spptSchema>;

// Mock data generator
function generateMockSppt(nop: string, tahun: number): SpptData {
  // Parse NOP parts (format: XX.XX.XXX.XXX.XXX.XXXX.X)
  const parts = nop.replace(/\./g, "").split("");
  const luasTanah = 200 + Math.floor(Math.random() * 500);
  const luasBangunan = 100 + Math.floor(Math.random() * 300);
  const njopTanahPerM2 = 1_000_000 + Math.floor(Math.random() * 4_000_000);
  const njopBangunanPerM2 = 2_000_000 + Math.floor(Math.random() * 3_000_000);
  const njopTanah = luasTanah * njopTanahPerM2;
  const njopBangunan = luasBangunan * njopBangunanPerM2;
  const njopTotal = njopTanah + njopBangunan;
  const njoptkp = 12_000_000;
  const njopKenaPajak = Math.max(0, njopTotal - njoptkp);
  const tarif = njopTotal > 1_000_000_000 ? 0.2 : 0.1;
  const pbbTerutang = Math.round((njopKenaPajak * tarif) / 100);

  return {
    tahunPajak: tahun,
    kabupaten: "KOTA BANDUNG",
    provinsi: "JAWA BARAT",
    nop: {
      full: nop,
      provinsi: parts.slice(0, 2).join(""),
      kabupaten: parts.slice(2, 4).join(""),
      kecamatan: parts.slice(4, 7).join(""),
      kelurahan: parts.slice(7, 10).join(""),
      blok: parts.slice(10, 13).join(""),
      noUrut: parts.slice(13, 17).join(""),
      jenisOP: parts[17] || "0",
    },
    letakOP: {
      alamat: "JL. SUDIRMAN NO. 456",
      rtRw: "001/002",
      kelurahan: "SUKAJADI",
      kecamatan: "CICENDO",
    },
    wajibPajak: {
      nama: "PT ABADI JAYA",
      alamat: "JL. GATOT SUBROTO NO. 123",
      kotaKodePos: "JAKARTA SELATAN 12930",
    },
    objekPajak: {
      luasTanah,
      luasBangunan,
      njopTanahPerM2,
      njopBangunanPerM2,
      kelasTanah: "A25",
      kelasBangunan: "A10",
    },
    perhitungan: {
      njopTanah,
      njopBangunan,
      njopTotal,
      njoptkp,
      njopKenaPajak,
      tarif,
      pbbTerutang,
    },
    jatuhTempo: `30 September ${tahun}`,
    tanggalTerbit: `02 Januari ${tahun}`,
    nomorUrut: "000001",
    tempatPembayaran: [
      "Bank BJB",
      "Bank BNI",
      "Bank Mandiri",
      "Tokopedia",
      "Kantor Pos",
      "Indomaret/Alfamart",
    ],
  };
}

export const spptRouter = {
  // Get single SPPT by NOP and year
  getByNopTahun: protectedProcedure
    .input(
      z.object({
        nop: z.string().min(18),
        tahun: z.number().min(2000).max(2100),
      })
    )
    .handler(({ input }) => {
      // In production, this would query the database
      return generateMockSppt(input.nop, input.tahun);
    }),

  // List SPPT for printing (batch)
  listForPrint: protectedProcedure
    .input(
      z.object({
        tahun: z.number(),
        kelurahan: z.string().optional(),
        kecamatan: z.string().optional(),
        statusBayar: z.enum(["semua", "lunas", "belum"]).default("semua"),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .handler(({ input }) => {
      // Mock list of NOPs for batch printing
      const mockNops = [
        "32.71.010.001.001.0001.0",
        "32.71.010.001.001.0002.0",
        "32.71.010.001.001.0003.0",
        "32.71.010.001.002.0001.0",
        "32.71.010.001.002.0002.0",
      ];

      const data = mockNops
        .slice(input.offset, input.offset + input.limit)
        .map((nop) => generateMockSppt(nop, input.tahun));

      return {
        data,
        total: mockNops.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Get SPPT summary (for dashboard)
  summary: protectedProcedure
    .input(z.object({ tahun: z.number() }))
    .handler(({ input }) => ({
      tahun: input.tahun,
      totalSppt: 15_234,
      totalKetetapan: 45_678_901_234,
      sudahCetak: 12_456,
      belumCetak: 2778,
      lunas: 10_234,
      belumBayar: 5000,
      totalRealisasi: 38_456_789_012,
      persenRealisasi: 84.2,
    })),
};

export type SpptRouter = typeof spptRouter;
