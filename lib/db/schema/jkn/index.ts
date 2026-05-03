import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "../auth";

// Enums for participant types and categories
export const participantSegmentEnum = pgEnum("participant_segment", [
  "PU_PNS_PUSAT", // Pegawai Negeri Sipil Pusat
  "PU_PNS_DAERAH", // Pegawai Negeri Sipil Daerah
  "PU_PNS_POLRI", // Pegawai Negeri Sipil di POLRI
  "PU_PNS_TNI_AD", // Pegawai Negeri Sipil di TNI AD
  "PU_PNS_TNI_AL", // Pegawai Negeri Sipil di TNI AL
  "PU_PNS_TNI_AU", // Pegawai Negeri Sipil di TNI AU
  "PU_PNS_MABES_TNI", // Pegawai Negeri Sipil di Mabes TNI
  "PU_PNS_KEMHAN", // Pegawai Negeri Sipil di Kementerian Pertahanan
  "PU_TNI_AD", // Tentara Nasional Indonesia Angkatan Darat
  "PU_TNI_AL", // Tentara Nasional Indonesia Angkatan Laut
  "PU_TNI_AU", // Tentara Nasional Indonesia Angkatan Udara
  "PU_POLRI", // Kepolisian Negara Republik Indonesia
  "PU_PPNPN", // Pegawai Pemerintah Non Pegawai Negeri
  "PU_BUMN", // Pegawai BUMN
  "PU_BUMD", // Pegawai BUMD
  "PU_SWASTA", // Pekerja Swasta
  "PBPU", // Pekerja Bukan Penerima Upah (Freelance, etc.)
  "BP", // Bukan Pekerja
  "INVESTOR", // Investor
  "PEMBERI_KERJA", // Pemberi Kerja
  "PENSIUNAN_PNS", // Pensiunan PNS
  "PENSIUNAN_TNI_POLRI", // Pensiunan TNI/POLRI
  "PENSIUNAN_BUMN", // Pensiunan BUMN/BUMD
  "PENSIUNAN_SWASTA", // Pensiunan Swasta
  "PBI_APBN", // Penerima Bantuan Iuran APBN
  "PBI_APBD", // Penerima Bantuan Iuran APBD
]);

export const genderEnum = pgEnum("gender", ["LAKI_LAKI", "PEREMPUAN"]);

export const maritalStatusEnum = pgEnum("marital_status", [
  "KAWIN",
  "BELUM_KAWIN",
  "JANDA",
  "DUDA",
]);

export const bloodTypeEnum = pgEnum("blood_type", [
  "A",
  "B",
  "AB",
  "O",
  "A_POSITIVE",
  "B_POSITIVE",
  "AB_POSITIVE",
  "O_POSITIVE",
  "A_NEGATIVE",
  "B_NEGATIVE",
  "AB_NEGATIVE",
  "O_NEGATIVE",
  "UNKNOWN",
]);

export const religionEnum = pgEnum("religion", [
  "ISLAM",
  "KRISTEN",
  "KATOLIK",
  "HINDU",
  "BUDHA",
  "KONGHUCU",
  "LAINNYA",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "TETAP",
  "KONTRAK",
  "PARUH_WAKTU",
]);

export const gradeEnum = pgEnum("grade", [
  "I",
  "II",
  "III",
  "IV",
  "A",
  "B",
  "C",
  "D",
  "E",
]);

export const treatmentClassEnum = pgEnum("treatment_class", ["I", "II", "III"]);

export const bankEnum = pgEnum("bank_name", [
  "MANDIRI",
  "BRI",
  "BNI",
  "BCA",
  "BCA_SYARIAH",
  "BRI_SYARIAH",
  "BNI_SYARIAH",
  "BTN",
  "JATENG",
  "JATIM",
  "JB",
  "SUMUT",
  "LAINNYA",
]);

export const relationshipEnum = pgEnum("relationship", [
  "SUAMI",
  "ISTRI",
  "ANAK_TANGGUNGAN",
  "ANAK_TIDAK_TANGGUNGAN",
  "ORANG_TUA",
  "FAMILY_LAIN",
]);

// PISA Code (Hubungan Keluarga BPJS)
// 1: Peserta, 2: Istri, 3: Suami, 4: Anak
export const pisaCodeEnum = pgEnum("pisa_code", ["1", "2", "3", "4", "5"]);

export const changeTypeEnum = pgEnum("change_type", [
  "ALAMAT",
  "TEMPAT_KERJA",
  "GOLONGAN_KEPANGKATAN",
  "GAJI",
  "FASKES",
  "PENSIUN",
  "KEMATIAN",
  "DATA_KELUARGA",
  "NAMA",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "DRAFT",
  "VERIFIKASI",
  "VIRTUAL_ACCOUNT_DIBUAT",
  "MENUNGGU_PEMBAYARAN",
  "AKTIF",
  "DITOLAK",
  "DIBATALKAN",
  "KEDALUWARSA",
]);

// Participants table - Main participant data
export const participant = pgTable("participant", {
  id: serial("id").primaryKey().notNull(),

  // BPJS identifier
  bpjsNumber: varchar("bpjsNumber", { length: 13 }).unique(),

  // SatuSehat identifier (FHIR Patient resource ID)
  satusehatId: text("satusehatId"),

  // Personal identity
  familyCardNumber: varchar("familyCardNumber", { length: 16 }).notNull(),
  identityNumber: varchar("identityNumber", { length: 16 }).notNull(), // NIK/KITAS/KITAP
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  nameOnCard: varchar("nameOnCard", { length: 100 }), // Nama pada kartu (could be different)

  pisaCode: pisaCodeEnum("pisaCode").notNull().default("1"), // Default to Peserta

  gender: genderEnum("gender").notNull(),
  bloodType: bloodTypeEnum("bloodType").default("UNKNOWN"),

  birthPlace: varchar("birthPlace", { length: 100 }).notNull(),
  birthDate: date("birthDate").notNull(),

  religion: religionEnum("religion").notNull(),
  maritalStatus: maritalStatusEnum("maritalStatus").notNull(),

  // Contact information
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 100 }),

  // Address (same as ID card)
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressRt: varchar("addressRt", { length: 5 }),
  addressRw: varchar("addressRw", { length: 5 }),
  addressVillage: varchar("addressVillage", { length: 100 }),
  addressDistrict: varchar("addressDistrict", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressProvince: varchar("addressProvince", { length: 100 }),
  addressPostalCode: varchar("addressPostalCode", { length: 10 }),

  // Mailing address (if different)
  mailingAddressSame: boolean("mailingAddressSame").notNull().default(true),
  mailingAddressStreet: varchar("mailingAddressStreet", { length: 255 }),
  mailingAddressRt: varchar("mailingAddressRt", { length: 5 }),
  mailingAddressRw: varchar("mailingAddressRw", { length: 5 }),
  mailingAddressVillage: varchar("mailingAddressVillage", { length: 100 }),
  mailingAddressDistrict: varchar("mailingAddressDistrict", { length: 100 }),
  mailingAddressCity: varchar("mailingAddressCity", { length: 100 }),
  mailingAddressProvince: varchar("mailingAddressProvince", { length: 100 }),
  mailingAddressPostalCode: varchar("mailingAddressPostalCode", {
    length: 10,
  }),

  // Tax ID
  npwp: varchar("npwp", { length: 20 }),

  // Photo
  photoUrl: text("photoUrl"),

  // Occupation and income (for PBPU, Investor, Pemberi Kerja)
  occupation: varchar("occupation", { length: 100 }),
  monthlyIncome: varchar("monthlyIncome", { length: 50 }),

  // Foreign national details
  visaNumber: varchar("visaNumber", { length: 50 }), // For WNA

  // Commercial insurance (for primary participant)
  hasCommercialInsurance: boolean("hasCommercialInsurance")
    .notNull()
    .default(false),
  commercialInsurancePolicyNumber: varchar("commercialInsurancePolicyNumber", {
    length: 50,
  }),
  commercialInsuranceCompanyName: varchar("commercialInsuranceCompanyName", {
    length: 100,
  }),

  // Participant segment and class
  participantSegment: participantSegmentEnum("participantSegment").notNull(),
  treatmentClass: treatmentClassEnum("treatmentClass").notNull(),

  // Lifetime membership status (status kepesertaan seumur hidup)
  isLifetimeMember: boolean("isLifetimeMember").notNull().default(true),

  // User link (for web portal access)
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),

  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),

  // Policy lifecycle for openIMIS sync
  effectiveDate: timestamp("effectiveDate"),
  expiryDate: timestamp("expiryDate"),

  // Status
  isActive: boolean("isActive").notNull().default(true),
  statusPeserta: varchar("statusPeserta", { length: 50 }).default("AKTIF"), // JKN status
  statusBayar: varchar("statusBayar", { length: 50 }).default("LUNAS"), // Payment status
  deactivatedAt: timestamp("deactivatedAt"),
  deactivationReason: text("deactivationReason"),
});

// Employment identity for PPU participants
export const employmentIdentity = pgTable("employment_identity", {
  id: serial("id").primaryKey().notNull(),
  participantId: integer("participantId")
    .notNull()
    .references(() => participant.id, { onDelete: "cascade" }),

  // Institution/Company details
  institutionName: varchar("institutionName", { length: 255 }),
  institutionCode: varchar("institutionCode", { length: 20 }),
  salaryPayerInstitution: varchar("salaryPayerInstitution", { length: 255 }),
  salaryPayerInstitutionCode: varchar("salaryPayerInstitutionCode", {
    length: 20,
  }),

  // Employee ID (NIP/NRP)
  oldEmployeeId: varchar("oldEmployeeId", { length: 20 }),
  newEmployeeId: varchar("newEmployeeId", { length: 20 }),

  // Grade and rank
  grade: gradeEnum("grade"),
  rank: varchar("rank", { length: 100 }),

  // Salary
  baseSalary: varchar("baseSalary", { length: 50 }),

  // Dates
  employmentStartDate: timestamp("employmentStartDate"),
  gradeStartDate: timestamp("gradeStartDate"),

  // Position
  position: varchar("position", { length: 255 }),
  employeeStatus: employeeStatusEnum("employeeStatus"),

  // For private sector employees
  companyAddress: varchar("companyAddress", { length: 255 }),
  companyVillage: varchar("companyVillage", { length: 100 }),
  companyDistrict: varchar("companyDistrict", { length: 100 }),
  companyCity: varchar("companyCity", { length: 100 }),
  companyProvince: varchar("companyProvince", { length: 100 }),
  companyPostalCode: varchar("companyPostalCode", { length: 10 }),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Healthcare facilities (Faskes)
export const healthcareFacility = pgTable("healthcare_facility", {
  id: serial("id").primaryKey().notNull(),

  code: varchar("code", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  class: varchar("class", { length: 50 }),

  // Address
  address: varchar("address", { length: 255 }),
  village: varchar("village", { length: 100 }),
  district: varchar("district", { length: 100 }),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postalCode", { length: 10 }),

  // Contact
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 100 }),

  isActive: boolean("isActive").notNull().default(true),

  // SatuSehat identifier (FHIR Organization resource ID)
  satusehatId: text("satusehatId"),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Dental facilities
export const dentalFacility = pgTable("dental_facility", {
  id: serial("id").primaryKey().notNull(),

  code: varchar("code", { length: 20 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  class: varchar("class", { length: 50 }),

  // Address
  address: varchar("address", { length: 255 }),
  village: varchar("village", { length: 100 }),
  district: varchar("district", { length: 100 }),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postalCode", { length: 10 }),

  // Contact
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 100 }),

  isActive: boolean("isActive").notNull().default(true),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Participant's selected healthcare facilities
export const participantHealthcareFacility = pgTable(
  "participant_healthcare_facility",
  {
    id: serial("id").primaryKey().notNull(),
    participantId: integer("participantId").references(() => participant.id, {
      onDelete: "cascade",
    }),

    // Primary healthcare facility
    primaryFacilityId: integer("primaryFacilityId").references(
      () => healthcareFacility.id,
      { onDelete: "restrict" }
    ),

    // Dental facility
    dentalFacilityId: integer("dentalFacilityId").references(
      () => dentalFacility.id,
      {
        onDelete: "restrict",
      }
    ),

    // Facility class
    treatmentClass: treatmentClassEnum("treatmentClass").notNull(),

    // Effective date
    effectiveDate: timestamp("effectiveDate", {
      precision: 3,
    }).notNull(),

    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  }
);

// Family members (dependents)
export const familyMember = pgTable("family_member", {
  id: serial("id").primaryKey().notNull(),
  headOfFamilyId: integer("headOfFamilyId")
    .notNull()
    .references(() => participant.id, { onDelete: "cascade" }),

  // Personal identity
  identityNumber: text("identityNumber").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName"),
  relationship: relationshipEnum("relationship").notNull(),
  pisaCode: pisaCodeEnum("pisaCode").notNull(), // 2: Istri, 3: Suami, 4: Anak

  // Child ordering (for children: Anak Ke-I, II, III, etc.)
  childOrder: integer("childOrder"),

  // Student status flag
  isStudent: boolean("isStudent").notNull().default(false),

  gender: genderEnum("gender").notNull(),
  birthPlace: text("birthPlace").notNull(),
  birthDate: timestamp("birthDate", {
    precision: 3,
    mode: "date",
  }).notNull(),

  // Contact
  phoneNumber: text("phoneNumber"),
  email: text("email"),

  // BPJS number (if existing member)
  bpjsNumber: text("bpjsNumber"),

  // Employee ID (for spouse who is also a worker)
  employeeId: text("employeeId"),

  // Student verification (for children > 21 years old)
  studentVerificationNumber: text("studentVerificationNumber"),
  studentVerificationDate: timestamp("studentVerificationDate", {
    precision: 3,
    mode: "date",
  }),

  // Photo
  photoUrl: text("photoUrl"),

  // Healthcare facilities
  primaryFacilityId: integer("primaryFacilityId").references(
    () => healthcareFacility.id,
    { onDelete: "restrict" }
  ),
  dentalFacilityId: integer("dentalFacilityId").references(
    () => dentalFacility.id,
    {
      onDelete: "restrict",
    }
  ),

  // Commercial insurance
  hasCommercialInsurance: boolean("hasCommercialInsurance")
    .notNull()
    .default(false),
  commercialInsurancePolicyNumber: text("commercialInsurancePolicyNumber"),
  commercialInsuranceCompanyName: text("commercialInsuranceCompanyName"),

  // SatuSehat identifier (FHIR RelatedPerson resource ID)
  satusehatId: text("satusehatId"),

  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

// Bank information for payment
export const bankInformation = pgTable("bank_information", {
  id: serial("id").primaryKey().notNull(),
  participantId: integer("participantId").references(() => participant.id, {
    onDelete: "cascade",
  }),

  bankName: bankEnum("bankName").notNull(),
  accountNumber: text("accountNumber").notNull(),
  accountHolderName: text("accountHolderName").notNull(),

  // For auto-debit authorization
  autoDebitAuthorized: boolean("autoDebitAuthorized").notNull().default(false),
  autoDebitDocumentUrl: text("autoDebitDocumentUrl"),

  // Virtual account
  virtualAccountNumber: text("virtualAccountNumber"),

  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

// Registration applications
export const registrationApplication = pgTable("registration_application", {
  id: serial("id").primaryKey().notNull(),
  applicationNumber: text("applicationNumber").notNull().unique(),

  participantId: integer("participantId").references(() => participant.id, {
    onDelete: "set null",
  }),

  status: registrationStatusEnum("status").notNull().default("DRAFT"),

  // Registration details
  participantSegment: participantSegmentEnum("participantSegment").notNull(),
  treatmentClass: treatmentClassEnum("treatmentClass").notNull(),

  // Verified by staff
  verifiedBy: text("verifiedBy"),
  verifiedAt: timestamp("verifiedAt", { precision: 3 }),

  // Entry by staff
  enteredBy: text("enteredBy").notNull(),
  enteredAt: timestamp("enteredAt", { precision: 3 }).notNull(),

  // Virtual account created
  virtualAccountCreated: boolean("virtualAccountCreated")
    .notNull()
    .default(false),
  virtualAccountCreatedAt: timestamp("virtualAccountCreatedAt", {
    precision: 3,
  }),

  // Payment deadline (14-30 days from VA creation)
  firstPaymentDeadline: timestamp("firstPaymentDeadline", {
    precision: 3,
  }),

  // Supporting attachments (documents)
  familyCardDocumentUrl: text("familyCardDocumentUrl"),
  identityDocumentUrl: text("identityDocumentUrl"),
  bankBookDocumentUrl: text("bankBookDocumentUrl"),
  autodebitLetterDocumentUrl: text("autodebitLetterDocumentUrl"),

  // Rejection
  rejectionReason: text("rejectionReason"),

  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

// Data change requests (Formulir 3B)
export const dataChangeRequest = pgTable("data_change_request", {
  id: serial("id").primaryKey().notNull(),
  participantId: integer("participantId").references(() => participant.id, {
    onDelete: "cascade",
  }),

  changeType: changeTypeEnum("changeType").notNull(),

  // Previous data (stored as JSON)
  previousData: jsonb("previousData"),

  // New data (stored as JSON)
  newData: jsonb("newData"),

  // Supporting documents
  supportingDocumentUrl: text("supportingDocumentUrl"),

  // Death certificate (for KEMATIAN change type)
  deathCertificateNumber: text("deathCertificateNumber"),
  deathCertificateDocumentUrl: text("deathCertificateDocumentUrl"),

  // Verification
  verifiedBy: text("verifiedBy"),
  verifiedAt: timestamp("verifiedAt", { precision: 3 }),
  verificationNotes: text("verificationNotes"),

  // Entry
  enteredBy: text("enteredBy").notNull(),
  enteredAt: timestamp("enteredAt", { precision: 3 }).notNull(),

  // Status
  status: text("status").notNull().default("PENDING"),

  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

// Contribution payments
export const contributionPayment = pgTable("contribution_payment", {
  id: serial("id").primaryKey().notNull(),
  paymentNumber: text("paymentNumber").notNull().unique(),

  participantId: integer("participantId").references(() => participant.id, {
    onDelete: "cascade",
  }),

  // Payment period (month/year)
  periodMonth: integer("periodMonth").notNull(),
  periodYear: integer("periodYear").notNull(),

  // Amount
  amount: text("amount").notNull(),
  adminFee: text("adminFee"),
  penaltyAmount: text("penaltyAmount").notNull().default("0"),
  totalAmount: text("totalAmount").notNull(),

  // Payment method
  paymentMethod: text("paymentMethod").notNull(),
  bankName: bankEnum("bankName"),

  // Payment details
  paymentDate: timestamp("paymentDate", { precision: 3 }),
  paymentReference: text("paymentReference"),

  // Status
  status: text("status").notNull().default("PENDING"),

  // Virtual account
  virtualAccountNumber: text("virtualAccountNumber"),

  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

// SatuSehat sync tracking
export const satusehatSyncStatusEnum = pgEnum("satusehat_sync_status", [
  "PENDING",
  "SYNCED",
  "FAILED",
  "UPDATE_NEEDED",
]);

export const satusehatSync = pgTable("satusehat_sync", {
  id: serial("id").primaryKey().notNull(),

  // References to local records
  participantId: integer("participantId").references(() => participant.id, {
    onDelete: "cascade",
  }),
  familyMemberId: integer("familyMemberId").references(() => familyMember.id, {
    onDelete: "cascade",
  }),
  healthcareFacilityId: integer("healthcareFacilityId").references(
    () => healthcareFacility.id,
    {
      onDelete: "cascade",
    }
  ),

  // SatuSehat resource info
  resourceType: varchar("resourceType", {
    length: 50,
  }).notNull(), // 'Patient', 'RelatedPerson', 'Organization'
  satusehatResourceId: text("satusehatResourceId").notNull(), // The FHIR resource ID
  satusehatUrl: text("satusehatUrl"), // Full URL to the resource in SatuSehat

  // Sync status
  status: satusehatSyncStatusEnum("status").notNull().default("SYNCED"),
  lastSyncedAt: timestamp("lastSyncedAt", { precision: 3 }).notNull(),
  lastSyncError: text("lastSyncError"), // Error message if sync failed

  // Metadata
  syncVersion: integer("syncVersion").notNull().default(1),

  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

// Export types
export type Participant = typeof participant.$inferSelect;
export type NewParticipant = typeof participant.$inferInsert;

export type EmploymentIdentity = typeof employmentIdentity.$inferSelect;
export type NewEmploymentIdentity = typeof employmentIdentity.$inferInsert;

export type HealthcareFacility = typeof healthcareFacility.$inferSelect;
export type NewHealthcareFacility = typeof healthcareFacility.$inferInsert;

export type DentalFacility = typeof dentalFacility.$inferSelect;
export type NewDentalFacility = typeof dentalFacility.$inferInsert;

export type ParticipantHealthcareFacility =
  typeof participantHealthcareFacility.$inferSelect;
export type NewParticipantHealthcareFacility =
  typeof participantHealthcareFacility.$inferInsert;

export type FamilyMember = typeof familyMember.$inferSelect;
export type NewFamilyMember = typeof familyMember.$inferInsert;

export type BankInformation = typeof bankInformation.$inferSelect;
export type NewBankInformation = typeof bankInformation.$inferInsert;

export type RegistrationApplication =
  typeof registrationApplication.$inferSelect;
export type NewRegistrationApplication =
  typeof registrationApplication.$inferInsert;

export type DataChangeRequest = typeof dataChangeRequest.$inferSelect;
export type NewDataChangeRequest = typeof dataChangeRequest.$inferInsert;

export type ContributionPayment = typeof contributionPayment.$inferSelect;
export type NewContributionPayment = typeof contributionPayment.$inferInsert;

export type SatusehatSync = typeof satusehatSync.$inferSelect;
export type NewSatusehatSync = typeof satusehatSync.$inferInsert;
