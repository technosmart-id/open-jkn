// Participant segment labels
export const PARTICIPANT_SEGMENTS = {
  PU_PNS_PUSAT: "PNS Pusat",
  PU_PNS_DAERAH: "PNS Daerah",
  PU_PNS_POLRI: "PNS POLRI",
  PU_PNS_TNI_AD: "PNS TNI AD",
  PU_PNS_TNI_AL: "PNS TNI AL",
  PU_PNS_TNI_AU: "PNS TNI AU",
  PU_PNS_MABES_TNI: "PNS Mabes TNI",
  PU_PNS_KEMHAN: "PNS Kemhan",
  PU_TNI_AD: "TNI AD",
  PU_TNI_AL: "TNI AL",
  PU_TNI_AU: "TNI AU",
  PU_POLRI: "POLRI",
  PU_PPNPN: "PPNPN",
  PU_BUMN: "Pegawai BUMN",
  PU_BUMD: "Pegawai BUMD",
  PU_SWASTA: "Pekerja Swasta",
  PBPU: "Pekerja Bukan Penerima Upah",
  BP: "Bukan Pekerja",
  INVESTOR: "Investor",
  PEMBERI_KERJA: "Pemberi Kerja",
  PENSIUNAN_PNS: "Pensiunan PNS",
  PENSIUNAN_TNI_POLRI: "Pensiunan TNI/POLRI",
  PENSIUNAN_BUMN: "Pensiunan BUMN/BUMD",
  PENSIUNAN_SWASTA: "Pensiunan Swasta",
  PBI_APBN: "PBI APBN",
  PBI_APBD: "PBI APBD",
} as const;

// Treatment classes
export const TREATMENT_CLASSES = {
  I: "Kelas I",
  II: "Kelas II",
  III: "Kelas III",
} as const;

// Registration statuses
export const REGISTRATION_STATUS = {
  DRAFT: "Draft",
  VERIFIKASI: "Verifikasi",
  VIRTUAL_ACCOUNT_DIBUAT: "Virtual Account Dibuat",
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  AKTIF: "Aktif",
  DITOLAK: "Ditolak",
  DIBATALKAN: "Dibatalkan",
  KEDALUWARSA: "Kedaluwarsa",
} as const;

// Change types
export const CHANGE_TYPES = {
  ALAMAT: "Perubahan Alamat",
  TEMPAT_KERJA: "Perubahan Tempat Kerja",
  GOLONGAN_KEPANGKATAN: "Perubahan Golongan/Kepangkatan",
  GAJI: "Perubahan Gaji",
  FASKES: "Perubahan Faskes",
  PENSIUN: "Transisi ke Pensiunan",
  KEMATIAN: "Laporan Kematian",
  DATA_KELUARGA: "Perubahan Data Keluarga",
  NAMA: "Perubahan Nama",
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  AUTO_DEBIT: "Auto Debit",
  MANUAL: "Manual",
  VIRTUAL_ACCOUNT: "Virtual Account",
} as const;

// Genders
export const GENDERS = {
  LAKI_LAKI: "Laki-laki",
  PEREMPUAN: "Perempuan",
} as const;

// Marital status
export const MARITAL_STATUS = {
  KAWIN: "Kawin",
  BELUM_KAWIN: "Belum Kawin",
  JANDA: "Janda",
  DUDA: "Duda",
} as const;

// Religions
export const RELIGIONS = {
  ISLAM: "Islam",
  KRISTEN: "Kristen",
  KATOLIK: "Katolik",
  HINDU: "Hindu",
  BUDHA: "Budha",
  KONGHUCU: "Konghucu",
  LAINNYA: "Lainnya",
} as const;

// Blood types
export const BLOOD_TYPES = {
  A: "A",
  B: "B",
  AB: "AB",
  O: "O",
  A_POSITIVE: "A+",
  B_POSITIVE: "B+",
  AB_POSITIVE: "AB+",
  O_POSITIVE: "O+",
  A_NEGATIVE: "A-",
  B_NEGATIVE: "B-",
  AB_NEGATIVE: "AB-",
  O_NEGATIVE: "O-",
  UNKNOWN: "Tidak diketahui",
} as const;

// Relationships
export const RELATIONSHIPS = {
  SUAMI: "Suami",
  ISTRI: "Istri",
  ANAK_TANGGUNGAN: "Anak Tanggungan",
  ANAK_TIDAK_TANGGUNGAN: "Anak Tidak Tanggungan",
  ORANG_TUA: "Orang Tua",
  FAMILY_LAIN: "Family Lain",
} as const;

// Facility types
export const FACILITY_TYPES = {
  PUSKESMAS: "Puskesmas",
  KLINIK: "Klinik",
  DOKTER: "Dokter",
  RUMAH_SAKIT: "Rumah Sakit",
} as const;
