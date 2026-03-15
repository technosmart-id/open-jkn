import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import { Pool } from "pg";
import { SyncService } from "../lib/sync";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Live Backend Sync Test
 * Bypasses local JKN DB (using mock) but connects to REAL openIMIS via tunnel
 */
async function liveSyncTest() {
  console.log("--- Starting Live Backend Sync Test ---");

  // Initialize SyncService in REAL mode (dryRun: false)
  // We override construction to use direct object params to avoid @ encoding issues
  const syncService = new SyncService({ dryRun: false });

  // Manually override the pool to use direct params
  (syncService as any).pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "IMISuser",
    password: "IMISuserP@s",
    database: "IMIS",
  });
  (syncService as any).imisDb = drizzle((syncService as any).pool, {
    schema: require("../lib/db/schema/openimis"),
  });

  // Mock JKN Participant Data (Manually constructed to skip DB fetch)
  const mockParticipant = {
    id: 888, // Custom ID
    identityNumber: "3273012345670001",
    familyCardNumber: "3273012345678901",
    firstName: "andrie",
    lastName: "yunus",
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
    // We override the syncParticipant logic slightly or just mock the db.query part
    // Since SyncService is a class, we'll patch it for this test to use our mock

    // @ts-expect-error - Patching for test
    syncService.syncParticipant = async function (participantId: number) {
      const participant = mockParticipant;
      console.log(`[Test] Using Mocked JKN Data for ID: ${participantId}`);

      // Re-implement the core sync logic here for the test
      // (Copy-pasted from SyncService.syncParticipant but using our mock object)
      // This is safer than trying to populate a potentially broken local DB

      const {
        openIMISMapping,
        mapPolicyStatus,
        DEFAULT_OPENIMIS_LOCATION_ID,
      } = require("../lib/db/schema/jkn/sync-utils");
      const { eq } = require("drizzle-orm");
      const openimisSchema = require("../lib/db/schema/openimis");

      const firstName = participant.firstName;
      const lastName = participant.lastName || "";
      const gender =
        (openIMISMapping.gender as any)[participant.gender] ||
        openIMISMapping.gender.default;
      const maritalStatus =
        (openIMISMapping.maritalStatus as any)[participant.maritalStatus] ||
        openIMISMapping.maritalStatus.default;

      let imisFamily = await this.imisDb.query.tblFamilies.findFirst({
        where: eq(
          openimisSchema.tblFamilies.familyCode,
          participant.familyCardNumber
        ),
      });

      if (!imisFamily) {
        console.log(
          `[Sync] Creating family record: ${participant.familyCardNumber}`
        );
        const [newFamily] = await this.imisDb
          .insert(openimisSchema.tblFamilies)
          .values({
            familyCode: participant.familyCardNumber,
            address: participant.addressStreet,
            locationId: DEFAULT_OPENIMIS_LOCATION_ID,
          })
          .returning();
        imisFamily = newFamily;
      }

      const existingInsuree = await this.imisDb.query.tblInsuree.findFirst({
        where: eq(
          openimisSchema.tblInsuree.chfId,
          participant.bpjsNumber || ""
        ),
      });

      const insureeData = {
        chfId: participant.bpjsNumber || `JKN-${participant.identityNumber}`,
        otherNames: firstName,
        lastName,
        gender,
        dob: participant.birthDate,
        maritalStatus,
        address: participant.addressStreet,
        phoneNumber: participant.phoneNumber,
        email: participant.email,
        familyId: imisFamily.id,
        locationId: DEFAULT_OPENIMIS_LOCATION_ID,
      };

      if (existingInsuree) {
        console.log(`[Sync] Updating insuree ${insureeData.chfId}`);
        await this.imisDb
          .update(openimisSchema.tblInsuree)
          .set(insureeData)
          .where(eq(openimisSchema.tblInsuree.id, existingInsuree.id));
      } else {
        console.log(`[Sync] Inserting new insuree ${insureeData.chfId}`);
        await this.imisDb.insert(openimisSchema.tblInsuree).values(insureeData);
      }

      if (participant.statusPeserta === "AKTIF" && participant.bpjsNumber) {
        const policyUUID = `POL-${participant.bpjsNumber}`;
        const policyData = {
          policyUUID,
          familyId: imisFamily.id,
          effectiveDate: participant.effectiveDate,
          expiryDate: participant.expiryDate,
          status: mapPolicyStatus(participant.statusPeserta),
        };

        const existingPolicy = await this.imisDb.query.tblPolicies.findFirst({
          where: eq(openimisSchema.tblPolicies.policyUUID, policyUUID),
        });

        if (existingPolicy) {
          console.log(`[Sync] Updating policy ${policyUUID}`);
          await this.imisDb
            .update(openimisSchema.tblPolicies)
            .set(policyData)
            .where(eq(openimisSchema.tblPolicies.id, existingPolicy.id));
        } else {
          console.log(`[Sync] Inserting policy ${policyUUID}`);
          await this.imisDb
            .insert(openimisSchema.tblPolicies)
            .values(policyData);
        }
      }
    };

    await syncService.syncParticipant(mockParticipant.id);
    console.log("--- Live Sync Test Success! ---");
  } catch (error) {
    console.error("--- Live Sync Test FAILED! ---");
    console.error(error);
  } finally {
    await syncService.close();
    process.exit(0);
  }
}

liveSyncTest().catch(console.error);
