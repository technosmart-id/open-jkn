import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { db as jknDb } from "../db";
import * as jknSchema from "../db/schema/jkn";
import {
  DEFAULT_OPENIMIS_LOCATION_ID,
  mapPolicyStatus,
  openIMISMapping,
} from "../db/schema/jkn/sync-utils";
import * as openimisSchema from "../db/schema/openimis";

/**
 * SyncService
 * Handles data synchronization from openjkn to openIMIS
 */
export class SyncService {
  private imisDb: any;
  private pool: Pool | null = null;
  private dryRun: boolean;

  constructor(options: { dryRun?: boolean } = {}) {
    this.dryRun = options.dryRun ?? true;

    if (this.dryRun) {
      console.log("[Sync] Initialized in DRY RUN mode");
      this.imisDb = {
        query: {
          tblFamilies: { findFirst: async () => null },
          tblInsuree: { findFirst: async () => null },
          tblPolicies: { findFirst: async () => null },
        },
        insert: () => ({
          values: () => ({ returning: async () => [{ id: 1 }] }),
        }),
        update: () => ({ set: () => ({ where: async () => {} }) }),
      };
    } else {
      const connectionString = process.env.OPENIMIS_DATABASE_URL;
      if (!connectionString) {
        throw new Error("OPENIMIS_DATABASE_URL is not defined");
      }
      this.pool = new Pool({ connectionString });
      this.imisDb = drizzle(this.pool, { schema: openimisSchema });
    }
  }

  async syncParticipant(participantId: number) {
    console.log(`[Sync] Starting sync for participant ID: ${participantId}`);

    const participant = await jknDb.query.participant.findFirst({
      where: eq(jknSchema.participant.id, participantId),
    });

    if (!participant) {
      throw new Error(`Participant ${participantId} not found in JKN`);
    }

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
      if (this.dryRun) {
        imisFamily = { id: 999 }; // Dummy for Dry Run
      } else {
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
    }

    const existingInsuree = await this.imisDb.query.tblInsuree.findFirst({
      where: eq(openimisSchema.tblInsuree.chfId, participant.bpjsNumber || ""),
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
      if (!this.dryRun) {
        await this.imisDb
          .update(openimisSchema.tblInsuree)
          .set(insureeData)
          .where(eq(openimisSchema.tblInsuree.id, existingInsuree.id));
      }
    } else {
      console.log(`[Sync] Inserting new insuree ${insureeData.chfId}`);
      if (!this.dryRun) {
        await this.imisDb.insert(openimisSchema.tblInsuree).values(insureeData);
      }
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
        if (!this.dryRun) {
          await this.imisDb
            .update(openimisSchema.tblPolicies)
            .set(policyData)
            .where(eq(openimisSchema.tblPolicies.id, existingPolicy.id));
        }
      } else {
        console.log(`[Sync] Inserting policy ${policyUUID}`);
        if (!this.dryRun) {
          await this.imisDb
            .insert(openimisSchema.tblPolicies)
            .values(policyData);
        }
      }
    }

    console.log(`[Sync] COMPLETED for participant ${participantId}`);
  }

  async close() {
    if (this.pool) await this.pool.end();
  }
}
