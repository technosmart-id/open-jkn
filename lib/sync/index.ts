import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { db as jknDb } from "../db";
import * as jknSchema from "../db/schema/jkn";
import { mapPolicyStatus, openIMISMapping } from "../db/schema/jkn/sync-utils";
import { tblFamilies, tblInsuree, tblPolicy } from "../db/schema/openimis";

// Default values for openIMIS required fields (from live data)
const DEFAULT_AUDIT_USER_ID = 2;
const DEFAULT_LOCATION_ID = 35;
const DEFAULT_HEAD_INSUREE_ID = 1;
const DEFAULT_PROD_ID = 4;

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
          tblPolicy: { findFirst: async () => null },
        },
        insert: () => ({
          values: () => ({
            returning: async () => [{ FamilyID: 1, InsureeID: 1 }],
          }),
        }),
        update: () => ({ set: () => ({ where: async () => {} }) }),
      };
    } else {
      const connectionString = process.env.OPENIMIS_DATABASE_URL;
      if (!connectionString) {
        throw new Error("OPENIMIS_DATABASE_URL is not defined");
      }
      this.pool = new Pool({ connectionString });
      this.imisDb = drizzle(this.pool, {
        schema: { tblInsuree, tblFamilies, tblPolicy },
      });
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

    // Handle both old schema (fullName) and new schema (firstName/lastName)
    const fullName = (participant as any).fullName || "";
    const firstNameFromNew = participant.firstName || "";
    const lastNameFromNew = participant.lastName || "";

    const nameParts = (fullName || firstNameFromNew).split(" ");
    const firstName = nameParts[0] || firstNameFromNew;
    const lastName = nameParts.slice(1).join(" ") || lastNameFromNew || "-";

    const gender =
      (openIMISMapping.gender as any)[participant.gender] ||
      openIMISMapping.gender.default;
    const maritalStatus =
      (openIMISMapping.maritalStatus as any)[participant.maritalStatus] ||
      openIMISMapping.maritalStatus.default;

    const chfId = participant.bpjsNumber || `JKN-${participant.identityNumber}`;

    // Step 1: Check/create family
    const confirmationNo = participant.familyCardNumber?.substring(0, 12);
    let imisFamily = await this.imisDb.query.tblFamilies.findFirst({
      where: eq(tblFamilies.confirmationNo, confirmationNo),
    });

    if (imisFamily) {
      console.log(`  Found existing FamilyID: ${imisFamily.FamilyID}`);
    } else {
      console.log(`[Sync] Creating family: ${confirmationNo}`);
      if (this.dryRun) {
        imisFamily = { FamilyID: 999, InsureeID: 1 };
      } else {
        const [newFamily] = await this.imisDb
          .insert(tblFamilies)
          .values({
            familyUuid: randomUUID(),
            confirmationNo,
            address: participant.addressStreet || "",
            locationId: DEFAULT_LOCATION_ID,
            insureeId: DEFAULT_HEAD_INSUREE_ID,
            auditUserId: DEFAULT_AUDIT_USER_ID,
            validityFrom: new Date(),
          })
          .returning();
        imisFamily = newFamily;
        console.log(`  Created FamilyID: ${newFamily.FamilyID}`);
      }
    }

    // Step 2: Check/create insuree
    const existingInsuree = await this.imisDb.query.tblInsuree.findFirst({
      where: eq(tblInsuree.chfId, chfId),
    });

    const insureeData = {
      auditUserId: DEFAULT_AUDIT_USER_ID,
      insureeUuid: randomUUID(),
      chfId,
      lastName: lastName || "-",
      otherNames: firstName,
      gender,
      dob: participant.birthDate,
      maritalStatus,
      address: participant.addressStreet || "",
      phoneNumber: participant.phoneNumber || "",
      email: participant.email || "",
      familyId: imisFamily.FamilyID,
      validityFrom: new Date(),
      isHead: true,
      relationship: 1, // Head of household
    };

    let insureeId: number;
    if (existingInsuree) {
      console.log(`[Sync] Updating insuree: ${chfId}`);
      if (this.dryRun) {
        insureeId = existingInsuree.id;
      } else {
        await this.imisDb
          .update(tblInsuree)
          .set(insureeData)
          .where(eq(tblInsuree.id, existingInsuree.id));
        insureeId = existingInsuree.id;
      }
    } else {
      console.log(`[Sync] Inserting insuree: ${chfId}`);
      if (this.dryRun) {
        insureeId = 1;
      } else {
        const [newInsuree] = await this.imisDb
          .insert(tblInsuree)
          .values(insureeData)
          .returning();
        insureeId = newInsuree.id;
        console.log(`  Created InsureeID: ${newInsuree.id}`);
      }
    }

    // Step 3: Check/create policy for active participants
    if (
      (participant as any).statusPeserta === "AKTIF" &&
      participant.bpjsNumber
    ) {
      const policyUUID = `POL-${participant.bpjsNumber}`;
      const policyData = {
        auditUserId: DEFAULT_AUDIT_USER_ID,
        validityFrom: new Date(),
        policyUuid: policyUUID,
        familyId: imisFamily.FamilyID,
        effectiveDate: (participant as any).effectiveDate || new Date(),
        expiryDate:
          (participant as any).expiryDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: mapPolicyStatus((participant as any).statusPeserta),
        enrollDate: new Date(),
        startDate: new Date(),
        prodId: DEFAULT_PROD_ID,
      };

      const existingPolicy = await this.imisDb.query.tblPolicy.findFirst({
        where: eq(tblPolicy.policyUuid, policyUUID),
      });

      if (existingPolicy) {
        console.log(`[Sync] Updating policy: ${policyUUID}`);
        if (!this.dryRun) {
          await this.imisDb
            .update(tblPolicy)
            .set(policyData)
            .where(eq(tblPolicy.id, existingPolicy.id));
        }
      } else {
        console.log(`[Sync] Inserting policy: ${policyUUID}`);
        if (!this.dryRun) {
          await this.imisDb.insert(tblPolicy).values(policyData);
        }
      }
    }

    console.log(`[Sync] COMPLETED for participant ${participantId}`);
    return { familyId: imisFamily.FamilyID, insureeId };
  }

  async close() {
    if (this.pool) await this.pool.end();
  }
}
