-- Fix JKN tables with proper quoted column names
-- This ensures camelCase column names are preserved

DROP TABLE IF EXISTS contribution_payment CASCADE;
DROP TABLE IF EXISTS data_change_request CASCADE;
DROP TABLE IF EXISTS registration_application CASCADE;
DROP TABLE IF EXISTS bank_information CASCADE;
DROP TABLE IF EXISTS family_member CASCADE;
DROP TABLE IF EXISTS employment_identity CASCADE;
DROP TABLE IF EXISTS participant CASCADE;
DROP TABLE IF EXISTS participant_healthcare_facility CASCADE;
DROP TABLE IF EXISTS dental_facility CASCADE;
DROP TABLE IF EXISTS healthcare_facility CASCADE;

CREATE TABLE healthcare_facility (
  "id" SERIAL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "class" TEXT,
  "address" TEXT,
  "village" TEXT,
  "district" TEXT,
  "city" TEXT,
  "province" TEXT,
  "postalCode" TEXT,
  "phoneNumber" TEXT,
  "email" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE dental_facility (
  "id" SERIAL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "class" TEXT,
  "address" TEXT,
  "village" TEXT,
  "district" TEXT,
  "city" TEXT,
  "province" TEXT,
  "postalCode" TEXT,
  "phoneNumber" TEXT,
  "email" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE participant (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT,
  "familyCardNumber" TEXT NOT NULL,
  "identityNumber" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "nameOnCard" TEXT,
  "gender" TEXT NOT NULL,
  "bloodType" TEXT,
  "birthPlace" TEXT NOT NULL,
  "birthDate" TIMESTAMP NOT NULL,
  "religion" TEXT NOT NULL,
  "maritalStatus" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "email" TEXT,
  "addressStreet" TEXT,
  "addressRt" TEXT,
  "addressRw" TEXT,
  "addressVillage" TEXT,
  "addressDistrict" TEXT,
  "addressCity" TEXT,
  "addressProvince" TEXT,
  "addressPostalCode" TEXT,
  "mailingAddressSame" BOOLEAN DEFAULT true,
  "mailingAddressStreet" TEXT,
  "mailingAddressRt" TEXT,
  "mailingAddressRw" TEXT,
  "mailingAddressVillage" TEXT,
  "mailingAddressDistrict" TEXT,
  "mailingAddressCity" TEXT,
  "mailingAddressProvince" TEXT,
  "mailingAddressPostalCode" TEXT,
  "npwp" TEXT,
  "photoUrl" TEXT,
  "occupation" TEXT,
  "monthlyIncome" TEXT,
  "visaNumber" TEXT,
  "hasCommercialInsurance" BOOLEAN DEFAULT false,
  "commercialInsurancePolicyNumber" TEXT,
  "commercialInsuranceCompanyName" TEXT,
  "bpjsNumber" TEXT NOT NULL,
  "participantSegment" TEXT NOT NULL,
  "treatmentClass" TEXT NOT NULL,
  "isLifetimeMember" BOOLEAN DEFAULT true,
  "isActive" BOOLEAN DEFAULT true,
  "deactivatedAt" TIMESTAMP,
  "deactivationReason" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE participant_healthcare_facility (
  "id" SERIAL PRIMARY KEY,
  "participantId" INTEGER REFERENCES participant("id") ON DELETE CASCADE,
  "primaryFacilityId" INTEGER REFERENCES healthcare_facility("id"),
  "dentalFacilityId" INTEGER REFERENCES dental_facility("id"),
  "treatmentClass" TEXT NOT NULL,
  "effectiveDate" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE employment_identity (
  "id" SERIAL PRIMARY KEY,
  "participantId" INTEGER REFERENCES participant("id") ON DELETE CASCADE,
  "institutionName" TEXT,
  "institutionCode" TEXT,
  "salaryPayerInstitution" TEXT,
  "salaryPayerInstitutionCode" TEXT,
  "oldEmployeeId" TEXT,
  "newEmployeeId" TEXT,
  "grade" TEXT,
  "rank" TEXT,
  "baseSalary" TEXT,
  "employmentStartDate" TIMESTAMP,
  "gradeStartDate" TIMESTAMP,
  "position" TEXT,
  "employeeStatus" TEXT,
  "companyAddress" TEXT,
  "companyVillage" TEXT,
  "companyDistrict" TEXT,
  "companyCity" TEXT,
  "companyProvince" TEXT,
  "companyPostalCode" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE family_member (
  "id" SERIAL PRIMARY KEY,
  "headOfFamilyId" INTEGER REFERENCES participant("id") ON DELETE CASCADE,
  "identityNumber" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "childOrder" INTEGER,
  "isStudent" BOOLEAN DEFAULT false,
  "gender" TEXT NOT NULL,
  "birthPlace" TEXT NOT NULL,
  "birthDate" TIMESTAMP NOT NULL,
  "phoneNumber" TEXT,
  "email" TEXT,
  "bpjsNumber" TEXT,
  "employeeId" TEXT,
  "studentVerificationNumber" TEXT,
  "studentVerificationDate" TIMESTAMP,
  "photoUrl" TEXT,
  "primaryFacilityId" INTEGER REFERENCES healthcare_facility("id"),
  "dentalFacilityId" INTEGER REFERENCES dental_facility("id"),
  "hasCommercialInsurance" BOOLEAN DEFAULT false,
  "commercialInsurancePolicyNumber" TEXT,
  "commercialInsuranceCompanyName" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE bank_information (
  "id" SERIAL PRIMARY KEY,
  "participantId" INTEGER REFERENCES participant("id") ON DELETE CASCADE,
  "bankName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountHolderName" TEXT NOT NULL,
  "virtualAccountNumber" TEXT,
  "autoDebitAuthorized" BOOLEAN DEFAULT false,
  "autoDebitDocumentUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE registration_application (
  "id" SERIAL PRIMARY KEY,
  "applicationNumber" TEXT NOT NULL UNIQUE,
  "participantId" INTEGER REFERENCES participant("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL,
  "participantSegment" TEXT NOT NULL,
  "treatmentClass" TEXT NOT NULL,
  "familyCardDocumentUrl" TEXT,
  "identityDocumentUrl" TEXT,
  "bankBookDocumentUrl" TEXT,
  "autodebitLetterDocumentUrl" TEXT,
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMP,
  "virtualAccountCreated" BOOLEAN DEFAULT false,
  "virtualAccountCreatedAt" TIMESTAMP,
  "firstPaymentDeadline" TIMESTAMP,
  "rejectionReason" TEXT,
  "enteredBy" TEXT NOT NULL,
  "enteredAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE data_change_request (
  "id" SERIAL PRIMARY KEY,
  "participantId" INTEGER REFERENCES participant("id") ON DELETE CASCADE,
  "changeType" TEXT NOT NULL,
  "previousData" JSONB,
  "newData" JSONB,
  "supportingDocumentUrl" TEXT,
  "deathCertificateNumber" TEXT,
  "deathCertificateDocumentUrl" TEXT,
  "status" TEXT NOT NULL,
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMP,
  "verificationNotes" TEXT,
  "enteredBy" TEXT NOT NULL,
  "enteredAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE contribution_payment (
  "id" SERIAL PRIMARY KEY,
  "participantId" INTEGER REFERENCES participant("id") ON DELETE CASCADE,
  "paymentNumber" TEXT NOT NULL UNIQUE,
  "periodMonth" INTEGER NOT NULL,
  "periodYear" INTEGER NOT NULL,
  "amount" TEXT NOT NULL,
  "adminFee" TEXT,
  "penaltyAmount" TEXT DEFAULT '0',
  "totalAmount" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "bankName" TEXT,
  "virtualAccountNumber" TEXT,
  "status" TEXT NOT NULL,
  "paymentDate" TIMESTAMP,
  "paymentReference" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_participant_bpjs_number ON participant("bpjsNumber");
CREATE INDEX idx_participant_identity ON participant("identityNumber");
CREATE INDEX idx_participant_active ON participant("isActive");
CREATE INDEX idx_registration_application_number ON registration_application("applicationNumber");
CREATE INDEX idx_registration_application_status ON registration_application("status");
CREATE INDEX idx_payment_participant_period ON contribution_payment("participantId", "periodYear", "periodMonth");
CREATE INDEX idx_payment_status ON contribution_payment("status");
