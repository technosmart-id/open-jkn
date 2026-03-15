import { randomUUID } from "crypto";
import { Pool } from "pg";

// Database connections
const jknPool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "openjkn",
});

const imisPool = new Pool({
  host: "localhost",
  port: 5432,
  user: "IMISuser",
  password: "IMISuserP@s",
  database: "IMIS",
});

const DEFAULT_AUDIT_USER_ID = 2;
const DEFAULT_LOCATION_ID = 35;
const DEFAULT_HEAD_INSUREE_ID = 1;

async function testSync() {
  console.log("--- Testing Direct Sync to openIMIS ---");

  try {
    // Step 1: Get a participant from JKN
    const participantResult = await jknPool.query(`
      SELECT id, "fullName", "bpjsNumber", "familyCardNumber", gender,
             "birthDate", "maritalStatus", "addressStreet", "phoneNumber", "email",
             "statusPeserta", "effectiveDate", "expiryDate"
      FROM participant
      WHERE "bpjsNumber" IS NOT NULL
      LIMIT 1
    `);

    if (participantResult.rows.length === 0) {
      console.log("No participants found to sync");
      return;
    }

    const participant = participantResult.rows[0];
    console.log(
      `Syncing participant: ${participant.fullName} (${participant.bpjsNumber})`
    );

    // Map data
    const nameParts = participant.fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "-";

    const genderMap: Record<string, string> = {
      LAKI_LAKI: "M",
      PEREMPUAN: "F",
    };
    const maritalMap: Record<string, string> = {
      KAWIN: "M",
      BELUM_KAWIN: "S",
      JANDA: "W",
      DUDA: "D",
    };

    const chfId = participant.bpjsNumber;

    // Step 2: Check/create family in openIMIS
    const familyResult = await imisPool.query(
      `
      SELECT "FamilyID", "InsureeID"
      FROM "tblFamilies"
      WHERE "ConfirmationNo" = $1
    `,
      [participant.familyCardNumber.substring(0, 12)]
    );

    let familyId: number;
    if (familyResult.rows.length === 0) {
      console.log("Creating family...");
      const insertFamily = await imisPool.query(
        `
        INSERT INTO "tblFamilies" ("FamilyUUID", "ConfirmationNo", "FamilyAddress", "LocationId", "InsureeID", "AuditUserID", "ValidityFrom")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING "FamilyID"
      `,
        [
          randomUUID(),
          participant.familyCardNumber.substring(0, 12),
          participant.addressStreet || "",
          DEFAULT_LOCATION_ID,
          DEFAULT_HEAD_INSUREE_ID,
          DEFAULT_AUDIT_USER_ID,
        ]
      );
      familyId = insertFamily.rows[0].FamilyID;
      console.log(`  Created FamilyID: ${familyId}`);
    } else {
      familyId = familyResult.rows[0].FamilyID;
      console.log(`  Found existing FamilyID: ${familyId}`);
    }

    // Step 3: Check/create insuree in openIMIS
    const insureeResult = await imisPool.query(
      `
      SELECT "InsureeID", "CHFID"
      FROM "tblInsuree"
      WHERE "CHFID" = $1
    `,
      [chfId]
    );

    if (insureeResult.rows.length > 0) {
      console.log(`Updating insuree: ${chfId}`);
      await imisPool.query(
        `
        UPDATE "tblInsuree"
        SET "OtherNames" = $1, "LastName" = $2, "Gender" = $3, "DOB" = $4,
            "Marital" = $5, "CurrentAddress" = $6, "Phone" = $7, "Email" = $8,
            "FamilyID" = $9, "LocationId" = $10, "ValidityFrom" = NOW()
        WHERE "InsureeID" = $11
      `,
        [
          firstName,
          lastName,
          genderMap[participant.gender] || "U",
          participant.birthDate,
          maritalMap[participant.maritalStatus] || "O",
          participant.addressStreet || "",
          participant.phoneNumber || "",
          participant.email || "",
          familyId,
          DEFAULT_LOCATION_ID,
          insureeResult.rows[0].InsureeID,
        ]
      );
    } else {
      console.log(`Inserting insuree: ${chfId}`);
      await imisPool.query(
        `
        INSERT INTO "tblInsuree" ("CHFID", "LastName", "OtherNames", "Gender", "DOB", "Marital",
                                "CurrentAddress", "Phone", "Email", "FamilyID", "LocationId", "ValidityFrom")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      `,
        [
          chfId,
          lastName,
          firstName,
          genderMap[participant.gender] || "U",
          participant.birthDate,
          maritalMap[participant.maritalStatus] || "O",
          participant.addressStreet || "",
          participant.phoneNumber || "",
          participant.email || "",
          familyId,
          DEFAULT_LOCATION_ID,
        ]
      );
    }

    // Step 4: Check/create policy if active
    if (participant.statusPeserta === "AKTIF") {
      const policyUUID = `POL-${chfId}`;
      const policyResult = await imisPool.query(
        `
        SELECT "PolicyID" FROM "tblPolicy" WHERE "PolicyUUID" = $1
      `,
        [policyUUID]
      );

      if (policyResult.rows.length > 0) {
        console.log(`Updating policy: ${policyUUID}`);
        await imisPool.query(
          `
          UPDATE "tblPolicy"
          SET "FamilyID" = $1, "EffectiveDate" = $2, "ExpiryDate" = $3, "PolicyStatus" = 1
          WHERE "PolicyID" = $4
        `,
          [
            familyId,
            participant.effectiveDate || new Date(),
            participant.expiryDate ||
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            policyResult.rows[0].PolicyID,
          ]
        );
      } else {
        console.log(`Inserting policy: ${policyUUID}`);
        await imisPool.query(
          `
          INSERT INTO "tblPolicy" ("PolicyUUID", "FamilyID", "EffectiveDate", "ExpiryDate", "PolicyStatus", "EnrollDate", "StartDate", "AuditUserID")
          VALUES ($1, $2, $3, $4, 1, NOW(), NOW(), $5)
        `,
          [
            policyUUID,
            familyId,
            participant.effectiveDate || new Date(),
            participant.expiryDate ||
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            DEFAULT_AUDIT_USER_ID,
          ]
        );
      }
    }

    console.log("\n--- Sync SUCCESS! ---");
    console.log(`Participant ${participant.fullName} synced to openIMIS`);
    console.log(`CHFID: ${chfId}, FamilyID: ${familyId}`);
  } catch (error) {
    console.error("--- Sync FAILED! ---");
    console.error(error);
  } finally {
    await jknPool.end();
    await imisPool.end();
  }
}

testSync();
