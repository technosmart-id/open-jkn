import { db as jknDb } from "../lib/db";
import { participant } from "../lib/db/schema/jkn";
import { SyncService } from "../lib/sync";

/**
 * Test script for SyncService
 */
async function testSync() {
  console.log("--- Starting Sync Test ---");

  // 1. Ensure we have at least one participant in JKN
  let testParticipant = await jknDb.query.participant.findFirst();

  if (!testParticipant) {
    console.log("No participants found in JKN, creating a test record...");
    const [newParticipant] = await jknDb
      .insert(participant)
      .values({
        identityNumber: "1234567890123456",
        familyCardNumber: "1234567890123456",
        firstName: "Budi",
        lastName: "Santoso",
        gender: "LAKI_LAKI",
        birthPlace: "Jakarta",
        birthDate: new Date("1980-01-01"),
        religion: "ISLAM",
        maritalStatus: "KAWIN",
        participantSegment: "PBPU",
        treatmentClass: "I",
        bpjsNumber: "0001234567890",
        statusPeserta: "AKTIF",
      })
      .returning();
    testParticipant = newParticipant;
  }

  console.log(
    `Using participant: ${testParticipant.firstName} ${testParticipant.lastName} (ID: ${testParticipant.id})`
  );

  // 2. Initialize SyncService in Dry Run mode
  const syncService = new SyncService({ dryRun: true });

  try {
    await syncService.syncParticipant(testParticipant.id);
    console.log("Test execution successful!");
  } catch (error) {
    console.error("Test failed during sync execution:", error);
  } finally {
    await syncService.close();
    process.exit(0);
  }
}

testSync().catch(console.error);
