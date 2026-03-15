/**
 * Sync Utilities for mapping JKN (openjkn) data structures
 * to openIMIS (tblInsuree, tblFamilies, tblPolicies) standards.
 */

export const openIMISMapping = {
  // Gender mapping: openjkn Enum -> openIMIS Char
  gender: {
    LAKI_LAKI: "M",
    PEREMPUAN: "F",
    default: "U",
  },

  // Marital Status mapping: openjkn Enum -> openIMIS Code
  maritalStatus: {
    KAWIN: "M",
    BELUM_KAWIN: "S",
    JANDA: "W",
    DUDA: "D",
    default: "O",
  },

  // Relationship mapping: openjkn Enum -> openIMIS Code
  relationship: {
    SUAMI: "S",
    ISTRI: "W",
    ANAK_TANGGUNGAN: "C",
    ORANG_TUA: "P",
    default: "O",
  },

  // BPJS PISA Code to openIMIS Relationship (Alternative)
  pisaToRelationship: {
    "1": "H", // Head of Family
    "2": "W", // Spouse (Istri)
    "3": "S", // Spouse (Suami)
    "4": "C", // Child
    "5": "O", // Other
  },
};

/**
 * Fallback: Split a full name into First Name and Last Name
 * (Useful if legacy data with only fullName is encountered)
 */
export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  const firstName = parts.slice(0, -1).join(" ");
  const lastName = parts[parts.length - 1];
  return { firstName, lastName };
}

/**
 * Map JKN Status to openIMIS Policy Status
 */
export function mapPolicyStatus(jknStatus: string): number {
  switch (jknStatus) {
    case "AKTIF":
      return 1; // Active in openIMIS
    case "NON_AKTIF":
      return 4; // Suspended/Inactive
    default:
      return 2; // Pending/Grace
  }
}

/**
 * Get Default openIMIS Location
 * (Real implementation should query tblLocations based on JKN address)
 */
export const DEFAULT_OPENIMIS_LOCATION_ID = 1; // Global/Default Root Location
