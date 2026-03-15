import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import { Pool } from "pg";
import { tblFamilies, tblInsuree, tblPolicy } from "../lib/db/schema/openimis";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Live Backend Sync Test
 * Connects to REAL openIMIS database and syncs a test participant
 */
async function liveSyncTest() {
  console.log("--- Starting Live Backend Sync Test ---");

  // Create direct connection to openIMIS
  const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "IMISuser",
    password: "IMISuserP@s",
    database: "IMIS",
  });

  const imisDb = drizzle(pool, {
    schema: { tblInsuree, tblFamilies, tblPolicy },
  });

  // Mock JKN Participant Data
  const mockParticipant = {
    id: 888,
    identityNumber: "3273012345670001",
    familyCardNumber: "3273012345678901",
    firstName: "Andrie",
    lastName: "Yunus",
    gender: "LAKI_LAKI",
    birthDate: new Date("1992-08-15"),
    maritalStatus: "BELUM_KAWIN",
    bpjsNumber: "0009988776655",
    statusPeserta: "AKTIF",
    effectiveDate: new Date("2024-01-01"),
    expiryDate: new Date("2024-12-31"),
    addressStreet: "Jl. Kebon Jeruk No. 12",
    phoneNumber: "08123456789",
    email: "andrie.yunus@example.com",
  };

  console.log(
    `Syncing Test Participant: ${mockParticipant.firstName} ${mockParticipant.lastName}`
  );

  try {
    const { openIMISMapping, DEFAULT_OPENIMIS_LOCATION_ID } = await import(
      "../lib/db/schema/jkn/sync-utils"
    );
    const { eq } = await import("drizzle-orm");

    // Map data
    const gender =
      (openIMISMapping.gender as any)[mockParticipant.gender] ||
      openIMISMapping.gender.default;
    const maritalStatus =
      (openIMISMapping.maritalStatus as any)[mockParticipant.maritalStatus] ||
      openIMISMapping.maritalStatus.default;

    // Check/create family
    let imisFamily = await imisDb.query.tblFamilies.findFirst({
      where: eq(tblFamilies.confirmationNo, mockParticipant.familyCardNumber),
    });

    if (imisFamily) {
      console.log(`  Found existing FamilyID: ${imisFamily.FamilyID}`);
    } else {
      console.log(
        `[Sync] Creating family: ${mockParticipant.familyCardNumber}`
      );
      const [newFamily] = await imisDb
        .insert(tblFamilies)
        .values({
          confirmationNo: mockParticipant.familyCardNumber,
          familyAddress: mockParticipant.addressStreet,
          locationId: DEFAULT_OPENIMIS_LOCATION_ID,
          validityFrom: new Date(),
        })
        .returning();
      imisFamily = newFamily;
      console.log(`  Created FamilyID: ${newFamily.FamilyID}`);
    }

    // Check/create insuree
    const existingInsuree = await imisDb.query.tblInsuree.findFirst({
      where: eq(tblInsuree.chfId, mockParticipant.bpjsNumber || ""),
    });

    const insureeData = {
      chfId: mockParticipant.bpjsNumber,
      otherNames: mockParticipant.firstName,
      lastName: mockParticipant.lastName,
      gender,
      dob: mockParticipant.birthDate,
      maritalStatus,
      address: mockParticipant.addressStreet,
      phoneNumber: mockParticipant.phoneNumber,
      email: mockParticipant.email,
      familyId: imisFamily.FamilyID,
      locationId: DEFAULT_OPENIMIS_LOCATION_ID,
      validityFrom: new Date(),
    };

    if (existingInsuree) {
      console.log(`[Sync] Updating insuree: ${insureeData.chfId}`);
      await imisDb
        .update(tblInsuree)
        .set(insureeData)
        .where(eq(tblInsuree.id, existingInsuree.id));
    } else {
      console.log(`[Sync] Inserting insuree: ${insureeData.chfId}`);
      await imisDb.insert(tblInsuree).values(insureeData);
    }

    // Check/create policy
    if (
      mockParticipant.statusPeserta === "AKTIF" &&
      mockParticipant.bpjsNumber
    ) {
      const { mapPolicyStatus } = await import(
        "../lib/db/schema/jkn/sync-utils"
      );
      const policyUUID = `POL-${mockParticipant.bpjsNumber}`;
      const policyData = {
        policyUuid: policyUUID,
        familyId: imisFamily.FamilyID,
        effectiveDate: mockParticipant.effectiveDate,
        expiryDate: mockParticipant.expiryDate,
        status: mapPolicyStatus(mockParticipant.statusPeserta),
        enrollDate: new Date(),
        startDate: mockParticipant.effectiveDate || new Date(),
      };

      const existingPolicy = await imisDb.query.tblPolicy.findFirst({
        where: eq(tblPolicy.policyUuid, policyUUID),
      });

      if (existingPolicy) {
        console.log(`[Sync] Updating policy: ${policyUUID}`);
        await imisDb
          .update(tblPolicy)
          .set(policyData)
          .where(eq(tblPolicy.id, existingPolicy.id));
      } else {
        console.log(`[Sync] Inserting policy: ${policyUUID}`);
        await imisDb.insert(tblPolicy).values(policyData);
      }
    }

    console.log("\n--- Live Sync Test SUCCESS! ---");
    console.log("Summary:");
    console.log(`  FamilyID: ${imisFamily.FamilyID}`);
    console.log(`  CHFID: ${mockParticipant.bpjsNumber}`);
    console.log(
      `  Name: ${mockParticipant.firstName} ${mockParticipant.lastName}`
    );
  } catch (error) {
    console.error("--- Live Sync Test FAILED! ---");
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

liveSyncTest().catch(console.error);
