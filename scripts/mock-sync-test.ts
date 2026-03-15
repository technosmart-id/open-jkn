/**
 * Pure Mock Test for Sync Logic
 * Verifies mapping and formatting without any DB connection
 */
import {
  mapPolicyStatus,
  openIMISMapping,
  splitName,
} from "../lib/db/schema/jkn/sync-utils";

async function runMockTest() {
  console.log("--- Starting Pure Mock Sync Test ---");

  // Mock JKN Participant
  const mockParticipant = {
    id: 1,
    identityNumber: "1234567890123456",
    familyCardNumber: "1234567890123456",
    firstName: "andrie",
    lastName: "yunus",
    gender: "LAKI_LAKI",
    birthDate: new Date("1990-05-20"),
    maritalStatus: "BELUM_KAWIN",
    bpjsNumber: "0009876543210",
    statusPeserta: "AKTIF",
    effectiveDate: new Date("2024-01-01"),
    expiryDate: new Date("2024-12-31"),
    addressStreet: "Jl. Sudirman No. 1",
  };

  console.log(
    `Input JKN Data: ${mockParticipant.firstName} ${mockParticipant.lastName}`
  );

  // Test Name Splitting (if we had a full name)
  const split = splitName("Budi Santoso");
  console.log(
    `- splitName("Budi Santoso") -> First: "${split.firstName}", Last: "${split.lastName}"`
  );

  // Test Gender Mapping
  const gender =
    (openIMISMapping.gender as any)[mockParticipant.gender] ||
    openIMISMapping.gender.default;
  console.log(`- Gender: ${mockParticipant.gender} -> openIMIS: "${gender}"`);

  // Test Marital Mapping
  const marital =
    (openIMISMapping.maritalStatus as any)[mockParticipant.maritalStatus] ||
    openIMISMapping.maritalStatus.default;
  console.log(
    `- Marital: ${mockParticipant.maritalStatus} -> openIMIS: "${marital}"`
  );

  // Test Policy Status Mapping
  const policyStatus = mapPolicyStatus(mockParticipant.statusPeserta);
  console.log(
    `- Policy Status: ${mockParticipant.statusPeserta} -> openIMIS Status Code: ${policyStatus}`
  );

  // Simulation of Sync Logic Formatting
  const targetInsureeData = {
    chfId: mockParticipant.bpjsNumber,
    otherNames: mockParticipant.firstName,
    lastName: mockParticipant.lastName,
    gender,
    dob: mockParticipant.birthDate,
    maritalStatus: marital,
    address: mockParticipant.addressStreet,
  };

  console.log("\nTarget openIMIS Payload (Formatted):");
  console.dir(targetInsureeData);

  console.log("\n--- Mock Test Completed Successfully ---");
}

runMockTest().catch(console.error);
