# Enrollment & Synchronization Documentation

This document outlines the end-to-end process of participant enrollment in **OpenJKN** and the automated background synchronization to **openIMIS**.

## 1. Overview

OpenJKN serves as an educational superset of openIMIS, tailored for the Indonesian JKN (Jaminan Kesehatan Nasional) standards. When a participant is enrolled or updated in OpenJKN, the data is pushed to a live openIMIS instance to maintain consistency across systems.

## 2. Data Models (OpenJKN)

The enrollment data is structured around three main entities in OpenJKN:

| Entity | Description | Key Fields |
| :--- | :--- | :--- |
| **Participant** | The individual insured member. | `bpjsNumber`, `identityNumber`, `firstName`, `lastName`, `gender`, `birthDate`, `statusPeserta`, `effectiveDate`, `expiryDate` |
| **Family** | Grouping of members under a single card. | `familyCardNumber`, `addressStreet`, `villageCode` |
| **FamilyMember** | Links Participants to Families. | `familyId`, `participantId`, `pisaCode` (Relationship code) |

## 3. Synchronization Service (`SyncService`)

The `SyncService` (`lib/sync/index.ts`) handles the heavy lifting of moving data from OpenJKN's PostgreSQL to openIMIS's PostgreSQL.

### Workflow:
1. **Fetch**: Retrieve the latest participant data from the OpenJKN database.
2. **Map**: Convert JKN-specific values (enums) to openIMIS standards.
3. **Upsert Family**: Ensure the family record exists in `tblFamilies`.
4. **Upsert Insuree**: Insert or update the member in `tblInsuree`.
5. **Sync Policy**: If the participant is `AKTIF`, create/update a policy in `tblPolicies`.

### Mapping Logic:

| JKN Value | openIMIS Code | Note |
| :--- | :--- | :--- |
| **Gender**: `LAKI_LAKI` | `M` | Male |
| **Gender**: `PEREMPUAN` | `F` | Female |
| **Marital**: `BELUM_KAWIN`| `S` | Single |
| **Marital**: `KAWIN` | `M` | Married |
| **Status**: `AKTIF` | `1` | Active Policy |

## 4. Infrastructure & Connectivity

*   **Production Server**: `194.31.53.215`
*   **Database**: PostgreSQL 16 (Dokploy container)
*   **Service Name**: `openimis-db` (mapped via SSH or internal Dokploy network)
*   **Verified Schema (openIMIS 24.10)**:
    *   `tblInsuree`: Core member table.
    *   `tblFamilies`: Family grouping table.
    *   `tblPolicies`: Policy management table.

## 5. Background Process

The synchronization is designed to run in the background. In a production environment:
1. A trigger or queue worker (e.g., Celery or a Node.js task runner) calls `SyncService.syncParticipant(id)`.
2. The service connects using the `OPENIMIS_DATABASE_URL` environment variable.
3. Errors are logged, and the process completes without blocking the user-facing UI.

## 6. Verification

You can verify the sync process using the built-in test scripts:
- **Mock Test**: `bun run scripts/mock-sync-test.ts` (Validates mapping logic without DB).
- **Live Verification**: Check the `tblInsuree` table in the openIMIS database for the `CHFID` starting with `JKN-` or matching the `bpjsNumber`.

---
*Last Updated: 2026-03-15*
*Verified by: Antigravity AI*
