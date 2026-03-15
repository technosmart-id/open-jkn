import {
  char,
  date,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Partial openIMIS Schema for Sync Targets
 * Verified against live 24.10 server
 */

export const tblInsuree = pgTable("tblInsuree", {
  id: serial("InsureeID").primaryKey(),
  chfId: varchar("CHFID", { length: 50 }).notNull().unique(),
  lastName: varchar("LastName", { length: 100 }).notNull(),
  otherNames: varchar("OtherNames", { length: 100 }),
  gender: char("Gender", { length: 1 }),
  dob: date("DOB"),
  maritalStatus: char("Marital", { length: 1 }),
  address: varchar("CurrentAddress", { length: 255 }),
  phoneNumber: varchar("Phone", { length: 50 }),
  email: varchar("Email", { length: 100 }),
  familyId: integer("FamilyID"),
  locationId: integer("LocationId"),
});

export const tblFamilies = pgTable("tblFamilies", {
  id: serial("FamilyID").primaryKey(),
  familyCode: varchar("CHFID", { length: 50 }).notNull().unique(), // Head CHFID
  address: varchar("FamilyAddress", { length: 255 }),
  locationId: integer("LocationId"),
});

export const tblPolicies = pgTable("tblPolicies", {
  id: serial("PolicyID").primaryKey(),
  policyUUID: varchar("PolicyUUID", { length: 50 }).notNull().unique(),
  familyId: integer("FamilyID").notNull(),
  effectiveDate: date("EffectiveDate"),
  expiryDate: date("ExpiryDate"),
  status: integer("PolicyStatus"),
  auditUserId: integer("AuditUserID"),
});
