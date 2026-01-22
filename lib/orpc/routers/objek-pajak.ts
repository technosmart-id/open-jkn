import { z } from "zod";
import { protectedProcedure } from "../server";

// Zod schemas for objek pajak
const objekPajakSchema = z.object({
  nop: z.string().length(18),
  alamat: z.string(),
  kelurahan: z.string(),
  kecamatan: z.string(),
  luasBumi: z.number(),
  luasBangunan: z.number(),
  njopBumi: z.number(),
  njopBangunan: z.number(),
  njopTotal: z.number(),
});

const searchParamsSchema = z.object({
  search: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

const mapFilterSchema = z.object({
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  statusBayar: z.enum(["semua", "lunas", "belum"]).default("semua"),
  bounds: z
    .object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    })
    .optional(),
});

// Mock data for demonstration
const mockObjekPajak = [
  {
    nop: "327101000100100010",
    alamat: "Jl. Merdeka No. 1",
    kelurahan: "Sukajadi",
    kecamatan: "Sukajadi",
    luasBumi: 200,
    luasBangunan: 150,
    njopBumi: 1_000_000,
    njopBangunan: 2_000_000,
    njopTotal: 3_000_000,
  },
  {
    nop: "327101000100100020",
    alamat: "Jl. Pahlawan No. 5",
    kelurahan: "Sukamaju",
    kecamatan: "Sukajadi",
    luasBumi: 300,
    luasBangunan: 200,
    njopBumi: 1_500_000,
    njopBangunan: 3_000_000,
    njopTotal: 4_500_000,
  },
];

// Mock data for map view with coordinates (Bandung area)
const mockObjekPajakMap = [
  {
    nop: "32.71.010.001.001.0001.0",
    namaWP: "PT ABADI JAYA",
    alamatOP: "Jl. Asia Afrika No. 123",
    kelurahan: "Braga",
    kecamatan: "Sumur Bandung",
    lat: -6.9215,
    lng: 107.6081,
    luasTanah: 500,
    luasBangunan: 350,
    njop: 2_500_000_000,
    pbbTerutang: 5_000_000,
    statusBayar: "lunas" as const,
  },
  {
    nop: "32.71.010.001.001.0002.0",
    namaWP: "CV SENTOSA MAKMUR",
    alamatOP: "Jl. Braga No. 45",
    kelurahan: "Braga",
    kecamatan: "Sumur Bandung",
    lat: -6.9189,
    lng: 107.6095,
    luasTanah: 300,
    luasBangunan: 200,
    njop: 1_800_000_000,
    pbbTerutang: 3_600_000,
    statusBayar: "belum" as const,
  },
  {
    nop: "32.71.010.001.002.0001.0",
    namaWP: "BUDI SANTOSO",
    alamatOP: "Jl. Merdeka No. 78",
    kelurahan: "Citarum",
    kecamatan: "Bandung Wetan",
    lat: -6.9135,
    lng: 107.6185,
    luasTanah: 250,
    luasBangunan: 180,
    njop: 1_200_000_000,
    pbbTerutang: 2_400_000,
    statusBayar: "lunas" as const,
  },
  {
    nop: "32.71.010.001.002.0002.0",
    namaWP: "SITI RAHAYU",
    alamatOP: "Jl. Diponegoro No. 55",
    kelurahan: "Citarum",
    kecamatan: "Bandung Wetan",
    lat: -6.9055,
    lng: 107.6155,
    luasTanah: 400,
    luasBangunan: 280,
    njop: 2_100_000_000,
    pbbTerutang: 4_200_000,
    statusBayar: "belum" as const,
  },
  {
    nop: "32.71.010.002.001.0001.0",
    namaWP: "H. AHMAD YANI",
    alamatOP: "Jl. Dago No. 100",
    kelurahan: "Dago",
    kecamatan: "Coblong",
    lat: -6.8845,
    lng: 107.6175,
    luasTanah: 600,
    luasBangunan: 400,
    njop: 3_500_000_000,
    pbbTerutang: 7_000_000,
    statusBayar: "lunas" as const,
  },
  {
    nop: "32.71.010.002.001.0002.0",
    namaWP: "TOKO SEJAHTERA",
    alamatOP: "Jl. Ir. H. Juanda No. 88",
    kelurahan: "Dago",
    kecamatan: "Coblong",
    lat: -6.8925,
    lng: 107.6125,
    luasTanah: 200,
    luasBangunan: 150,
    njop: 950_000_000,
    pbbTerutang: 1_900_000,
    statusBayar: "belum" as const,
  },
  {
    nop: "32.71.010.002.002.0001.0",
    namaWP: "UD MAJU BERSAMA",
    alamatOP: "Jl. Cihampelas No. 150",
    kelurahan: "Cipaganti",
    kecamatan: "Coblong",
    lat: -6.8935,
    lng: 107.6025,
    luasTanah: 350,
    luasBangunan: 250,
    njop: 1_600_000_000,
    pbbTerutang: 3_200_000,
    statusBayar: "lunas" as const,
  },
  {
    nop: "32.71.010.003.001.0001.0",
    namaWP: "PT BANDUNG INDAH",
    alamatOP: "Jl. Sukajadi No. 200",
    kelurahan: "Sukajadi",
    kecamatan: "Sukajadi",
    lat: -6.8875,
    lng: 107.5935,
    luasTanah: 450,
    luasBangunan: 320,
    njop: 2_200_000_000,
    pbbTerutang: 4_400_000,
    statusBayar: "belum" as const,
  },
  {
    nop: "32.71.010.003.001.0002.0",
    namaWP: "HOTEL GRAND ROYAL",
    alamatOP: "Jl. Setiabudi No. 88",
    kelurahan: "Setiabudi",
    kecamatan: "Sukasari",
    lat: -6.8655,
    lng: 107.5985,
    luasTanah: 2000,
    luasBangunan: 1500,
    njop: 15_000_000_000,
    pbbTerutang: 30_000_000,
    statusBayar: "lunas" as const,
  },
  {
    nop: "32.71.010.003.002.0001.0",
    namaWP: "RESTORAN SUNDA ASLI",
    alamatOP: "Jl. Riau No. 45",
    kelurahan: "Citarum",
    kecamatan: "Bandung Wetan",
    lat: -6.9085,
    lng: 107.6215,
    luasTanah: 280,
    luasBangunan: 200,
    njop: 1_400_000_000,
    pbbTerutang: 2_800_000,
    statusBayar: "belum" as const,
  },
];

export type ObjekPajakMapData = (typeof mockObjekPajakMap)[number];

export const objekPajakRouter = {
  list: protectedProcedure.input(searchParamsSchema).handler(({ input }) => {
    let filtered = mockObjekPajak;

    if (input.search) {
      const search = input.search.toLowerCase();
      filtered = filtered.filter(
        (op) =>
          op.nop.includes(search) || op.alamat.toLowerCase().includes(search)
      );
    }

    if (input.kelurahan) {
      filtered = filtered.filter((op) => op.kelurahan === input.kelurahan);
    }

    if (input.kecamatan) {
      filtered = filtered.filter((op) => op.kecamatan === input.kecamatan);
    }

    const start = (input.page - 1) * input.limit;
    const end = start + input.limit;
    const paginated = filtered.slice(start, end);

    return {
      data: paginated,
      total: filtered.length,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(filtered.length / input.limit),
    };
  }),

  // Get properties with coordinates for map view
  listForMap: protectedProcedure.input(mapFilterSchema).handler(({ input }) => {
    let filtered = mockObjekPajakMap;

    if (input.kelurahan) {
      filtered = filtered.filter((op) => op.kelurahan === input.kelurahan);
    }

    if (input.kecamatan) {
      filtered = filtered.filter((op) => op.kecamatan === input.kecamatan);
    }

    if (input.statusBayar !== "semua") {
      filtered = filtered.filter((op) => op.statusBayar === input.statusBayar);
    }

    // Filter by map bounds if provided
    if (input.bounds) {
      filtered = filtered.filter(
        (op) =>
          op.lat >= input.bounds!.south &&
          op.lat <= input.bounds!.north &&
          op.lng >= input.bounds!.west &&
          op.lng <= input.bounds!.east
      );
    }

    // Calculate summary stats
    const totalNjop = filtered.reduce((sum, op) => sum + op.njop, 0);
    const totalPbb = filtered.reduce((sum, op) => sum + op.pbbTerutang, 0);
    const lunas = filtered.filter((op) => op.statusBayar === "lunas").length;
    const belum = filtered.filter((op) => op.statusBayar === "belum").length;

    return {
      data: filtered,
      total: filtered.length,
      summary: {
        totalNjop,
        totalPbb,
        lunas,
        belum,
      },
    };
  }),

  getByNop: protectedProcedure
    .input(z.object({ nop: z.string().length(18) }))
    .handler(({ input }) => {
      const objekPajak = mockObjekPajak.find((op) => op.nop === input.nop);

      if (!objekPajak) {
        throw new Error("Objek Pajak tidak ditemukan");
      }

      return objekPajak;
    }),

  create: protectedProcedure
    .input(objekPajakSchema)
    .handler(({ input, context }) => {
      // In production, this would insert into the database
      console.log(`User ${context.user.name} creating objek pajak:`, input);
      return { success: true, data: input };
    }),
};

export type ObjekPajakRouter = typeof objekPajakRouter;
