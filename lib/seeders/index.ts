import { faker } from "@faker-js/faker/locale/id_ID";
import { generateId } from "better-auth";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, session, user } from "@/lib/db/schema/auth";
import {
  bankInformation,
  contributionPayment,
  dataChangeRequest,
  dentalFacility,
  employmentIdentity,
  familyMember,
  healthcareFacility,
  participant,
  participantHealthcareFacility,
  registrationApplication,
} from "@/lib/db/schema/jkn";

// Default admin credentials
export const DEFAULT_ADMIN = {
  email: "admin@jkn.go.id",
  password: "admin123456",
  name: "Admin JKN",
} as const;

const SEGMENTS = [
  "PU_PNS_PUSAT",
  "PU_PNS_DAERAH",
  "PU_TNI_AD",
  "PU_POLRI",
  "PBPU",
  "BP",
  "PBI_APBN",
] as const;

const TREATMENT_CLASSES = ["I", "II", "III"] as const;
const FACILITY_TYPES = [
  "PUSKESMAS",
  "KLINIK",
  "RS_TIP_D",
  "RS_TIP_C",
  "RS_BEDAH",
] as const;
const BANKS = ["BCA", "BRI", "BNI", "MANDIRI", "BTN"] as const;

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

export async function seedHealthcareFacilities(count = 20) {
  console.log(`Seeding ${count} healthcare facilities...`);

  const facilities: Array<Omit<typeof healthcareFacility.$inferInsert, "id">> =
    [];
  for (let i = 0; i < count; i++) {
    // Use methods that work with Indonesian locale
    const city = faker.location.city();
    const state = faker.location.state();
    const street = faker.location.streetAddress();

    const facility = {
      code: `FASKES${String(i + 1).padStart(3, "0")}`,
      name: `${faker.company.name()} ${randomItem(FACILITY_TYPES)}`,
      type: randomItem(FACILITY_TYPES),
      address: `${street}, ${city}`,
      city,
      province: state,
      phoneNumber: faker.phone.number(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    facilities.push(facility);
  }

  await db.insert(healthcareFacility).values(facilities);
  console.log(`✓ Seeded ${count} healthcare facilities`);

  return facilities;
}

export async function seedDentalFacilities(count = 10) {
  console.log(`Seeding ${count} dental facilities...`);

  const facilities: Array<{
    code: string;
    name: string;
    address: string;
    city: string;
    province: string;
    phoneNumber: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  for (let i = 0; i < count; i++) {
    const city = faker.location.city();
    const state = faker.location.state();
    const street = faker.location.streetAddress();

    const facility = {
      code: `GIGI${String(i + 1).padStart(3, "0")}`,
      name: `Praktik Gigi ${faker.person.fullName()}`,
      address: street,
      city,
      province: state,
      phoneNumber: faker.phone.number(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    facilities.push(facility);
  }

  await db.insert(dentalFacility).values(facilities);
  console.log(`✓ Seeded ${count} dental facilities`);

  return facilities;
}

function createEmploymentIdentity(
  index: number,
  employerName: string
): Omit<typeof employmentIdentity.$inferInsert, "id"> {
  const city = faker.location.city();
  const state = faker.location.state();

  return {
    participantId: index + 1,
    institutionName: employerName,
    institutionCode: `INS${String(index + 1).padStart(6, "0")}`,
    salaryPayerInstitution: employerName,
    salaryPayerInstitutionCode: `PAY${String(index + 1).padStart(4, "0")}`,
    oldEmployeeId: `OLD${String(index + 1).padStart(8, "0")}`,
    newEmployeeId: `EMP${String(index + 1).padStart(6, "0")}`,
    grade: "I",
    rank: faker.person.jobTitle(),
    baseSalary: faker.number
      .int({ min: 3_000_000, max: 15_000_000 })
      .toString(),
    employmentStartDate: randomDate(new Date(2020, 0, 1), new Date()),
    gradeStartDate: randomDate(new Date(2020, 0, 1), new Date()),
    position: faker.person.jobTitle(),
    employeeStatus: "TETAP",
    companyAddress: faker.location.streetAddress(),
    companyVillage: city,
    companyDistrict: faker.location.county(),
    companyCity: city,
    companyProvince: state,
    companyPostalCode: faker.location.zipCode(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createFamilyMember(
  participantIndex: number
): Omit<typeof familyMember.$inferInsert, "id"> {
  const isChild = randomBoolean();
  const city = faker.location.city();
  const fullName = faker.person.fullName();
  const nameParts = fullName.split(" ");
  const isStudent = isChild && randomBoolean();
  const birthDate = faker.date.birthdate({ mode: "age", min: 1, max: 25 });
  const studentVerificationDate = isStudent
    ? new Date(new Date().getFullYear() - 1, 0, 1)
    : null;

  const data: ReturnType<typeof createFamilyMember> = {
    headOfFamilyId: participantIndex + 1,
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || null,
    identityNumber: faker.string.numeric(16),
    relationship: isChild ? "ANAK_TANGGUNGAN" : "ISTRI",
    pisaCode: isChild ? "4" : "2",
    childOrder: isChild ? faker.number.int({ min: 1, max: 5 }) : null,
    isStudent,
    gender: faker.person.sex() === "female" ? "PEREMPUAN" : "LAKI_LAKI",
    birthPlace: city,
    birthDate,
    phoneNumber: faker.phone.number() || null,
    email: faker.internet.email() || null,
    bpjsNumber: null,
    employeeId: null,
    studentVerificationNumber: isStudent ? faker.string.alphanumeric(10) : null,
    studentVerificationDate,
    photoUrl: null,
    primaryFacilityId: null,
    dentalFacilityId: null,
    hasCommercialInsurance: false,
    commercialInsurancePolicyNumber: null,
    commercialInsuranceCompanyName: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return data;
}

function createBankAccount(
  index: number
): Omit<typeof bankInformation.$inferInsert, "id"> {
  return {
    participantId: index + 1,
    bankName: randomItem(BANKS),
    accountNumber: faker.finance.accountNumber(10),
    accountHolderName: faker.person.fullName(),
    autoDebitAuthorized: randomBoolean(),
    virtualAccountNumber: `VA${String(index + 1).padStart(12, "0")}`,
    autoDebitDocumentUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createPrimaryFacility(
  index: number,
  facilityId: number,
  treatmentClass: (typeof TREATMENT_CLASSES)[number]
): Omit<typeof participantHealthcareFacility.$inferInsert, "id"> {
  return {
    participantId: index + 1,
    primaryFacilityId: facilityId,
    treatmentClass,
    effectiveDate: new Date(),
    createdAt: new Date(),
  };
}

function createDentalFacility(
  index: number,
  facilityId: number,
  treatmentClass: (typeof TREATMENT_CLASSES)[number]
): Omit<typeof participantHealthcareFacility.$inferInsert, "id"> {
  return {
    participantId: index + 1,
    dentalFacilityId: facilityId,
    treatmentClass,
    effectiveDate: new Date(),
    createdAt: new Date(),
  };
}

function createParticipantData(
  index: number,
  segment: (typeof SEGMENTS)[number],
  isActive: boolean
): Omit<typeof participant.$inferInsert, "id"> & {
  treatmentClass: (typeof TREATMENT_CLASSES)[number];
} {
  const city = faker.location.city();
  const state = faker.location.state();
  const street = faker.location.streetAddress();
  const fullName = faker.person.fullName();
  const nameParts = fullName.split(" ");
  const birthDate = faker.date.birthdate({ mode: "age", min: 18, max: 80 });

  // Format date as YYYY-MM-DD for database date column
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const data: ReturnType<typeof createParticipantData> = {
    bpjsNumber: `${String(index + 1).padStart(13, "0")}`,
    familyCardNumber: faker.string.numeric(16),
    identityNumber: faker.string.numeric(16),
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || null,
    nameOnCard: fullName,
    pisaCode: "1",
    gender: faker.person.sex() === "female" ? "PEREMPUAN" : "LAKI_LAKI",
    bloodType: "O",
    birthPlace: city,
    birthDate: formatDate(birthDate),
    religion: "ISLAM",
    maritalStatus: "KAWIN",
    phoneNumber: faker.phone.number(),
    email: faker.internet.email(),
    addressStreet: street,
    addressRt: faker.string.numeric(3),
    addressRw: faker.string.numeric(3),
    addressVillage: city,
    addressDistrict: faker.location.county(),
    addressCity: city,
    addressProvince: state,
    addressPostalCode: faker.location.zipCode(),
    mailingAddressSame: true,
    mailingAddressStreet: null,
    mailingAddressRt: null,
    mailingAddressRw: null,
    mailingAddressVillage: null,
    mailingAddressDistrict: null,
    mailingAddressCity: null,
    mailingAddressProvince: null,
    mailingAddressPostalCode: null,
    npwp: faker.string.numeric(15),
    photoUrl: null,
    occupation: faker.person.jobTitle(),
    monthlyIncome: faker.number
      .int({ min: 3_000_000, max: 15_000_000 })
      .toString(),
    visaNumber: null,
    hasCommercialInsurance: false,
    commercialInsurancePolicyNumber: null,
    commercialInsuranceCompanyName: null,
    participantSegment: segment,
    treatmentClass: randomItem(TREATMENT_CLASSES),
    isLifetimeMember: true,
    userId: null,
    isActive,
    statusPeserta: isActive ? "AKTIF" : "NON_AKTIF",
    statusBayar: "LUNAS",
    effectiveDate: null,
    expiryDate: null,
  };

  // Add timestamps last
  data.createdAt = randomDate(new Date(2023, 0, 1), new Date());
  data.updatedAt = new Date();

  // Only add deactivated fields if inactive
  if (isActive) {
    data.deactivatedAt = null;
    data.deactivationReason = null;
  } else {
    data.deactivatedAt = randomDate(new Date(2023, 0, 1), new Date());
    data.deactivationReason = "Non-payment";
  }

  return data;
}

export async function seedParticipants(count = 50) {
  console.log(`Seeding ${count} participants...`);

  // Get facilities
  const faskesList = await db.query.healthcareFacility.findMany();
  const gigiList = await db.query.dentalFacility.findMany();

  // Use plain arrays to let Drizzle infer columns from actual data
  const participants: Record<string, unknown>[] = [];
  const employmentIdentities: Record<string, unknown>[] = [];
  const familyMembers: Record<string, unknown>[] = [];
  const banks: Record<string, unknown>[] = [];
  const participantFacilities: Record<string, unknown>[] = [];

  for (let i = 0; i < count; i++) {
    const segment = randomItem(SEGMENTS);
    const isActive = randomBoolean();

    const participantData = createParticipantData(
      i,
      segment,
      isActive
    ) as Record<string, unknown>;
    delete participantData.id;
    participants.push(participantData);
  }

  // Use raw SQL to insert participants, excluding the 'id' column
  // Drizzle's ORM always includes all columns from the schema, including auto-increment
  for (const p of participants) {
    await db.execute(
      sql`INSERT INTO "participant" (
        "bpjsNumber", "familyCardNumber", "identityNumber", "firstName", "lastName", "nameOnCard", "pisaCode",
        "gender", "bloodType", "birthPlace", "birthDate", "religion", "maritalStatus", "phoneNumber", "email",
        "addressStreet", "addressRt", "addressRw", "addressVillage", "addressDistrict", "addressCity", "addressProvince",
        "addressPostalCode", "mailingAddressSame", "mailingAddressStreet", "mailingAddressRt", "mailingAddressRw",
        "mailingAddressVillage", "mailingAddressDistrict", "mailingAddressCity", "mailingAddressProvince",
        "mailingAddressPostalCode", "npwp", "photoUrl", "occupation", "monthlyIncome", "visaNumber",
        "hasCommercialInsurance", "commercialInsurancePolicyNumber", "commercialInsuranceCompanyName",
        "participantSegment", "treatmentClass", "isLifetimeMember", "userId", "createdAt", "updatedAt",
        "effectiveDate", "expiryDate", "isActive", "statusPeserta", "statusBayar", "deactivatedAt",
        "deactivationReason"
      ) VALUES (
        ${p.bpjsNumber}, ${p.familyCardNumber}, ${p.identityNumber}, ${p.firstName}, ${p.lastName}, ${p.nameOnCard}, ${p.pisaCode},
        ${p.gender}, ${p.bloodType}, ${p.birthPlace}, ${p.birthDate}, ${p.religion}, ${p.maritalStatus}, ${p.phoneNumber}, ${p.email},
        ${p.addressStreet}, ${p.addressRt}, ${p.addressRw}, ${p.addressVillage}, ${p.addressDistrict}, ${p.addressCity}, ${p.addressProvince},
        ${p.addressPostalCode}, ${p.mailingAddressSame}, ${p.mailingAddressStreet}, ${p.mailingAddressRt}, ${p.mailingAddressRw},
        ${p.mailingAddressVillage}, ${p.mailingAddressDistrict}, ${p.mailingAddressCity}, ${p.mailingAddressProvince},
        ${p.mailingAddressPostalCode}, ${p.npwp}, ${p.photoUrl}, ${p.occupation}, ${p.monthlyIncome}, ${p.visaNumber},
        ${p.hasCommercialInsurance}, ${p.commercialInsurancePolicyNumber}, ${p.commercialInsuranceCompanyName},
        ${p.participantSegment}, ${p.treatmentClass}, ${p.isLifetimeMember}, ${p.userId}, ${p.createdAt}, ${p.updatedAt},
        ${p.effectiveDate}, ${p.expiryDate}, ${p.isActive}, ${p.statusPeserta}, ${p.statusBayar}, ${p.deactivatedAt},
        ${p.deactivationReason}
      )`
    );
  }

  // Get the inserted participants with their actual IDs
  const insertedParticipants = await db.query.participant.findMany();

  // Update related records with actual participant IDs
  for (const participantRecord of insertedParticipants) {
    const actualParticipantId = participantRecord.id;
    const segment = participantRecord.participantSegment;
    const isEmployed = segment.startsWith("PU_");
    const hasFamily = randomBoolean();

    // Add employment identity for PPU
    if (isEmployed) {
      const empData = createEmploymentIdentity(
        actualParticipantId - 1,
        faker.company.name()
      ) as Record<string, unknown>;
      delete empData.id;
      empData.participantId = actualParticipantId;
      employmentIdentities.push(empData);
    }

    // Add family members
    if (hasFamily) {
      const familyCount = faker.number.int({ min: 1, max: 4 });
      for (let j = 0; j < familyCount; j++) {
        const famData = createFamilyMember(actualParticipantId - 1) as Record<
          string,
          unknown
        >;
        delete famData.id;
        famData.headOfFamilyId = actualParticipantId;
        familyMembers.push(famData);
      }
    }

    // Add bank account
    const bankData = createBankAccount(actualParticipantId - 1) as Record<
      string,
      unknown
    >;
    delete bankData.id;
    bankData.participantId = actualParticipantId;
    banks.push(bankData);

    // Assign facilities (1 primary, 1 dental)
    const treatmentClass = participantRecord.treatmentClass;
    if (faskesList.length > 0) {
      const facilityData = createPrimaryFacility(
        actualParticipantId - 1,
        randomItem(faskesList).id,
        treatmentClass
      ) as Record<string, unknown>;
      delete facilityData.id;
      facilityData.participantId = actualParticipantId;
      participantFacilities.push(facilityData);
    }

    if (gigiList.length > 0) {
      const facilityData = createDentalFacility(
        actualParticipantId - 1,
        randomItem(gigiList).id,
        treatmentClass
      ) as Record<string, unknown>;
      delete facilityData.id;
      facilityData.participantId = actualParticipantId;
      participantFacilities.push(facilityData);
    }
  }

  await db.insert(employmentIdentity).values(employmentIdentities as any);
  await db.insert(familyMember).values(familyMembers as any);
  await db.insert(bankInformation).values(banks as any);
  await db
    .insert(participantHealthcareFacility)
    .values(participantFacilities as any);

  console.log(`✓ Seeded ${count} participants`);
  console.log(`  - ${employmentIdentities.length} employment identities`);
  console.log(`  - ${familyMembers.length} family members`);
  console.log(`  - ${banks.length} bank accounts`);
  console.log(`  - ${participantFacilities.length} facility assignments`);

  return participants;
}

export async function seedRegistrations(count = 30) {
  console.log(`Seeding ${count} registrations...`);

  const participantsList = await db.query.participant.findMany();
  const statuses = [
    "DRAFT",
    "VERIFIKASI",
    "VIRTUAL_ACCOUNT_DIBUAT",
    "MENUNGGU_PEMBAYARAN",
    "AKTIF",
    "DITOLAK",
    "DIBATALKAN",
  ] as const;

  const registrations: (typeof registrationApplication.$inferInsert)[] = [];
  for (let i = 0; i < count; i++) {
    const participantRecord = participantsList[i % participantsList.length];
    const status = randomItem(statuses);

    const baseUrl = faker.internet.url();
    const registration = {
      applicationNumber: `REG${Date.now()}${String(i).padStart(4, "0")}`,
      participantId: participantRecord.id,
      status,
      participantSegment: participantRecord.participantSegment,
      treatmentClass: participantRecord.treatmentClass,
      familyCardDocumentUrl: `${baseUrl}/kk.pdf`,
      identityDocumentUrl: `${baseUrl}/ktp.pdf`,
      bankBookDocumentUrl: `${baseUrl}/buku.pdf`,
      autodebitLetterDocumentUrl: `${baseUrl}/autodebet.pdf`,
      enteredBy: "admin",
      enteredAt: randomDate(new Date(2024, 0, 1), new Date()),
      verifiedBy: status !== "DRAFT" ? "admin" : null,
      verifiedAt: status !== "DRAFT" ? new Date() : null,
      virtualAccountCreated:
        status === "VIRTUAL_ACCOUNT_DIBUAT" ||
        status === "MENUNGGU_PEMBAYARAN" ||
        status === "AKTIF",
      virtualAccountCreatedAt:
        status === "VIRTUAL_ACCOUNT_DIBUAT" ||
        status === "MENUNGGU_PEMBAYARAN" ||
        status === "AKTIF"
          ? new Date()
          : null,
      firstPaymentDeadline:
        status === "MENUNGGU_PEMBAYARAN" || status === "AKTIF"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
      rejectionReason: status === "DITOLAK" ? "Dokumen tidak lengkap" : null,
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      updatedAt: new Date(),
    };

    registrations.push(registration);
  }

  await db.insert(registrationApplication).values(registrations);
  console.log(`✓ Seeded ${count} registrations`);

  return registrations;
}

export async function seedPayments(count = 100) {
  console.log(`Seeding ${count} payments...`);

  const participantsList = await db.query.participant.findMany();
  const statuses = ["PENDING", "PAID", "FAILED"] as const;
  const methods = ["AUTO_DEBIT", "MANUAL", "VIRTUAL_ACCOUNT"] as const;

  const payments: (typeof contributionPayment.$inferInsert)[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  for (let i = 0; i < count; i++) {
    const participantRecord = participantsList[i % participantsList.length];
    const status = randomItem(statuses);
    const method = randomItem(methods);
    const isPaid = status === "PAID";

    // Generate dates within the last 12 months
    const monthsAgo = Math.floor(i / 8);
    const paymentMonth = ((currentMonth - monthsAgo - 1) % 12) + 1;
    const paymentYear =
      currentYear - Math.floor((currentMonth - paymentMonth) / 12);

    const payment = {
      paymentNumber: `PAY${Date.now()}${String(i).padStart(4, "0")}`,
      participantId: participantRecord.id,
      periodMonth: paymentMonth,
      periodYear: paymentYear,
      amount: faker.number.int({ min: 100_000, max: 500_000 }).toFixed(2),
      adminFee: faker.number.int({ min: 5000, max: 20_000 }).toFixed(2),
      penaltyAmount: faker.number.int({ min: 0, max: 100_000 }).toFixed(2),
      totalAmount: "0", // Will be calculated properly in real app
      paymentMethod: method,
      bankName: randomItem(BANKS),
      virtualAccountNumber: `VA${String(i + 1).padStart(12, "0")}`,
      status,
      paymentDate: isPaid
        ? randomDate(
            new Date(paymentYear, paymentMonth - 1, 1),
            new Date(paymentYear, paymentMonth, 10)
          )
        : null,
      paymentReference: isPaid ? `REF${faker.string.alphanumeric(10)}` : null,
      createdAt: randomDate(
        new Date(paymentYear, paymentMonth - 1, 1),
        new Date()
      ),
      updatedAt: new Date(),
    };

    payments.push(payment);
  }

  await db.insert(contributionPayment).values(payments);
  console.log(`✓ Seeded ${count} payments`);

  return payments;
}

export async function seedChangeRequests(count = 20) {
  console.log(`Seeding ${count} change requests...`);

  const participantsList = await db.query.participant.findMany();
  const changeTypes = [
    "ALAMAT",
    "TEMPAT_KERJA",
    "GAJI",
    "FASKES",
    "DATA_KELUARGA",
    "NAMA",
  ] as const;
  const statuses = ["PENDING", "VERIFIED", "APPROVED", "REJECTED"] as const;

  const requests: (typeof dataChangeRequest.$inferInsert)[] = [];
  for (let i = 0; i < count; i++) {
    const participantRecord = participantsList[i % participantsList.length];
    const changeType = randomItem(changeTypes);
    const status = randomItem(statuses);

    const newCity = faker.location.city();
    const newStreet = faker.location.streetAddress();

    const request = {
      participantId: participantRecord.id,
      changeType,
      previousData: {
        addressStreet: participantRecord.addressStreet,
        addressCity: participantRecord.addressCity,
      },
      newData: {
        addressStreet: newStreet,
        addressCity: newCity,
      },
      supportingDocumentUrl: `${faker.internet.url()}/doc.pdf`,
      status,
      verifiedBy: status !== "PENDING" ? "admin" : null,
      verifiedAt: status !== "PENDING" ? new Date() : null,
      verificationNotes: status === "REJECTED" ? "Data tidak valid" : null,
      enteredBy: "admin",
      enteredAt: randomDate(new Date(2024, 0, 1), new Date()),
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      updatedAt: new Date(),
    };

    requests.push(request);
  }

  await db.insert(dataChangeRequest).values(requests);
  console.log(`✓ Seeded ${count} change requests`);

  return requests;
}

export async function seedAdminUser() {
  console.log("Seeding default admin user...");

  // Use scryptAsync for password hashing (Better Auth default)
  // Format: {saltHex}:{derivedKeyHex}
  const { scryptAsync } = await import("@noble/hashes/scrypt.js");
  const { hex } = await import("@better-auth/utils/hex");
  const crypto = await import("node:crypto");

  const userId = generateId();
  const accountId = generateId();

  // Generate 16-byte salt and encode as hex
  const salt = hex.encode(crypto.webcrypto.getRandomValues(new Uint8Array(16)));

  // Normalize password with NFKC (Better Auth requirement)
  const password = DEFAULT_ADMIN.password.normalize("NFKC");

  // Derive key using scryptAsync with Better Auth's parameters
  const key = await scryptAsync(password, salt, {
    N: 16_384,
    r: 16,
    p: 1,
    dkLen: 64,
    maxmem: 128 * 16_384 * 16 * 2,
  });

  // Format as {saltHex}:{derivedKeyHex}
  const passwordHash = `${salt}:${hex.encode(key)}`;

  // Check if admin user already exists using raw SQL
  const { sql } = await import("drizzle-orm");
  const existingUsers = await db
    .select({
      id: user.id,
      email: user.email,
    })
    .from(user)
    .where(sql`${user.email} = ${DEFAULT_ADMIN.email}`)
    .limit(1);

  if (existingUsers.length > 0) {
    console.log("  ⊗ Admin user already exists, skipping...");
    return existingUsers[0];
  }

  // Create user and account
  await db.insert(user).values({
    id: userId,
    email: DEFAULT_ADMIN.email,
    name: DEFAULT_ADMIN.name,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(account).values({
    id: accountId,
    userId,
    accountId: userId,
    providerId: "credential",
    password: passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✓ Seeded admin user (${DEFAULT_ADMIN.email})`);

  const created = await db
    .select({
      id: user.id,
      email: user.email,
    })
    .from(user)
    .where(sql`${user.email} = ${DEFAULT_ADMIN.email}`)
    .limit(1);

  return created[0];
}

export async function clearAllData() {
  console.log("Clearing all JKN data...");

  // Import sql for raw SQL condition
  const { sql } = await import("drizzle-orm");

  // Helper function to safely delete from a table
  async function safeDelete(table: unknown, tableName: string) {
    try {
      // @ts-expect-error - Drizzle delete expects specific table type
      await db.delete(table).where(sql`1=1`);
      console.log(`  ✓ Cleared ${tableName}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const causeErrMsg =
        error instanceof Error && error.cause instanceof Error
          ? error.cause.message
          : "";
      if (
        errMsg.includes("does not exist") ||
        causeErrMsg.includes("does not exist")
      ) {
        console.log(`  ⊗ Table ${tableName} does not exist yet, skipping...`);
      } else {
        throw error;
      }
    }
  }

  // Delete auth data first (due to foreign key constraints)
  await safeDelete(session, "session");
  await safeDelete(account, "account");
  await safeDelete(user, "user");

  // Use Drizzle delete with where(sql) to delete all rows
  // Delete in correct order: child tables first, then parent tables
  await safeDelete(contributionPayment, "contribution_payment");
  await safeDelete(dataChangeRequest, "data_change_request");
  await safeDelete(registrationApplication, "registration_application");
  await safeDelete(
    participantHealthcareFacility,
    "participant_healthcare_facility"
  );
  await safeDelete(bankInformation, "bank_information");
  await safeDelete(familyMember, "family_member");
  await safeDelete(employmentIdentity, "employment_identity");
  await safeDelete(participant, "participant");
  await safeDelete(dentalFacility, "dental_facility");
  await safeDelete(healthcareFacility, "healthcare_facility");

  console.log("✓ Cleared all JKN data");
}

export async function seedAll() {
  console.log("🌱 Starting comprehensive database seeding...\n");

  await clearAllData();

  // Seed admin user first
  await seedAdminUser();

  await seedHealthcareFacilities(20);
  await seedDentalFacilities(10);
  await seedParticipants(50);
  await seedRegistrations(30);
  await seedPayments(100);
  await seedChangeRequests(20);

  console.log("\n✨ Database seeding completed!");
  console.log("\n📧 Default admin credentials:");
  console.log(`   Email: ${DEFAULT_ADMIN.email}`);
  console.log(`   Password: ${DEFAULT_ADMIN.password}`);
}
