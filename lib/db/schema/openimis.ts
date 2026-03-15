import {
  boolean,
  char,
  date,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * openIMIS Schema for Sync Targets
 * Verified against live 24.10 server
 * Includes all required fields for successful inserts
 */

export const tblInsuree = pgTable("tblInsuree", {
  id: serial("InsureeID").primaryKey(),
  auditUserId: integer("AuditUserID").notNull(),
  insureeUuid: varchar("InsureeUUID", { length: 50 }).notNull(),
  chfId: varchar("CHFID", { length: 50 }).notNull(),
  cardIssued: boolean("CardIssued"),
  lastName: varchar("LastName", { length: 100 }).notNull(),
  otherNames: varchar("OtherNames", { length: 100 }),
  gender: char("Gender", { length: 1 }),
  dob: date("DOB"),
  maritalStatus: char("Marital", { length: 1 }),
  address: varchar("CurrentAddress", { length: 255 }),
  currentVillage: integer("CurrentVillage"),
  phoneNumber: varchar("Phone", { length: 50 }),
  email: varchar("Email", { length: 100 }),
  familyId: integer("FamilyID"),
  geoLocation: varchar("GeoLocation", { length: 255 }),
  isHead: boolean("IsHead"),
  relationship: integer("Relationship"),
  validityFrom: timestamp("ValidityFrom").notNull(),
  validityTo: timestamp("ValidityTo"),
});

export const tblFamilies = pgTable("tblFamilies", {
  id: serial("FamilyID").primaryKey(),
  familyUuid: varchar("FamilyUUID", { length: 50 }).notNull(),
  legacyId: integer("LegacyID"),
  poverty: boolean("Poverty"),
  address: varchar("FamilyAddress", { length: 255 }),
  isOffline: boolean("isOffline"),
  ethnicity: varchar("Ethnicity", { length: 50 }),
  confirmationNo: varchar("ConfirmationNo", { length: 12 }),
  validityFrom: timestamp("ValidityFrom").notNull(),
  validityTo: timestamp("ValidityTo"),
  auditUserId: integer("AuditUserID").notNull(),
  confirmationType: varchar("ConfirmationType", { length: 50 }),
  familyType: varchar("FamilyType", { length: 50 }),
  insureeId: integer("InsureeID").notNull(),
  locationId: integer("LocationId"),
});

export const tblPolicy = pgTable("tblPolicy", {
  id: serial("PolicyID").primaryKey(),
  auditUserId: integer("AuditUserID").notNull(),
  validityFrom: timestamp("ValidityFrom").notNull(),
  policyUuid: varchar("PolicyUUID", { length: 50 }).notNull().unique(),
  familyId: integer("FamilyID").notNull(),
  effectiveDate: date("EffectiveDate"),
  expiryDate: date("ExpiryDate"),
  status: integer("PolicyStatus"),
  policyStage: varchar("PolicyStage", { length: 50 }),
  policyValue: integer("PolicyValue"),
  enrollDate: date("EnrollDate"),
  startDate: date("StartDate"),
  prodId: integer("ProdID").notNull(),
  officerId: integer("OfficerID"),
});
