CREATE TYPE "public"."bank_name" AS ENUM('MANDIRI', 'BRI', 'BNI', 'BCA', 'BCA_SYARIAH', 'BRI_SYARIAH', 'BNI_SYARIAH', 'BTN', 'JATENG', 'JATIM', 'JB', 'SUMUT', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."blood_type" AS ENUM('A', 'B', 'AB', 'O', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE', 'O_POSITIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE', 'O_NEGATIVE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."change_type" AS ENUM('ALAMAT', 'TEMPAT_KERJA', 'GOLONGAN_KEPANGKATAN', 'GAJI', 'FASKES', 'PENSIUN', 'KEMATIAN', 'DATA_KELUARGA', 'NAMA');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('TETAP', 'KONTRAK', 'PARUH_WAKTU');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('LAKI_LAKI', 'PEREMPUAN');--> statement-breakpoint
CREATE TYPE "public"."grade" AS ENUM('I', 'II', 'III', 'IV', 'A', 'B', 'C', 'D', 'E');--> statement-breakpoint
CREATE TYPE "public"."marital_status" AS ENUM('KAWIN', 'BELUM_KAWIN', 'JANDA', 'DUDA');--> statement-breakpoint
CREATE TYPE "public"."participant_segment" AS ENUM('PU_PNS_PUSAT', 'PU_PNS_DAERAH', 'PU_PNS_POLRI', 'PU_PNS_TNI_AD', 'PU_PNS_TNI_AL', 'PU_PNS_TNI_AU', 'PU_PNS_MABES_TNI', 'PU_PNS_KEMHAN', 'PU_TNI_AD', 'PU_TNI_AL', 'PU_TNI_AU', 'PU_POLRI', 'PU_PPNPN', 'PU_BUMN', 'PU_BUMD', 'PU_SWASTA', 'PBPU', 'BP', 'INVESTOR', 'PEMBERI_KERJA', 'PENSIUNAN_PNS', 'PENSIUNAN_TNI_POLRI', 'PENSIUNAN_BUMN', 'PENSIUNAN_SWASTA', 'PBI_APBN', 'PBI_APBD');--> statement-breakpoint
CREATE TYPE "public"."pisa_code" AS ENUM('1', '2', '3', '4', '5');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('DRAFT', 'VERIFIKASI', 'VIRTUAL_ACCOUNT_DIBUAT', 'MENUNGGU_PEMBAYARAN', 'AKTIF', 'DITOLAK', 'DIBATALKAN', 'KEDALUWARSA');--> statement-breakpoint
CREATE TYPE "public"."relationship" AS ENUM('SUAMI', 'ISTRI', 'ANAK_TANGGUNGAN', 'ANAK_TIDAK_TANGGUNGAN', 'ORANG_TUA', 'FAMILY_LAIN');--> statement-breakpoint
CREATE TYPE "public"."religion" AS ENUM('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDHA', 'KONGHUCU', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."treatment_class" AS ENUM('I', 'II', 'III');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_information" (
	"id" serial PRIMARY KEY NOT NULL,
	"participantId" integer,
	"bankName" "bank_name" NOT NULL,
	"accountNumber" text NOT NULL,
	"accountHolderName" text NOT NULL,
	"autoDebitAuthorized" boolean DEFAULT false NOT NULL,
	"autoDebitDocumentUrl" text,
	"virtualAccountNumber" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contribution_payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"paymentNumber" text NOT NULL,
	"participantId" integer,
	"periodMonth" integer NOT NULL,
	"periodYear" integer NOT NULL,
	"amount" text NOT NULL,
	"adminFee" text,
	"penaltyAmount" text DEFAULT '0' NOT NULL,
	"totalAmount" text NOT NULL,
	"paymentMethod" text NOT NULL,
	"bankName" "bank_name",
	"paymentDate" timestamp (3),
	"paymentReference" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"virtualAccountNumber" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "contribution_payment_paymentNumber_unique" UNIQUE("paymentNumber")
);
--> statement-breakpoint
CREATE TABLE "data_change_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"participantId" integer,
	"changeType" "change_type" NOT NULL,
	"previousData" jsonb,
	"newData" jsonb,
	"supportingDocumentUrl" text,
	"deathCertificateNumber" text,
	"deathCertificateDocumentUrl" text,
	"verifiedBy" text,
	"verifiedAt" timestamp (3),
	"verificationNotes" text,
	"enteredBy" text NOT NULL,
	"enteredAt" timestamp (3) NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dental_facility" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"class" varchar(50),
	"address" varchar(255),
	"village" varchar(100),
	"district" varchar(100),
	"city" varchar(100),
	"province" varchar(100),
	"postalCode" varchar(10),
	"phoneNumber" varchar(20),
	"email" varchar(100),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dental_facility_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "employment_identity" (
	"id" serial PRIMARY KEY NOT NULL,
	"participantId" integer NOT NULL,
	"institutionName" varchar(255),
	"institutionCode" varchar(20),
	"salaryPayerInstitution" varchar(255),
	"salaryPayerInstitutionCode" varchar(20),
	"oldEmployeeId" varchar(20),
	"newEmployeeId" varchar(20),
	"grade" "grade",
	"rank" varchar(100),
	"baseSalary" varchar(50),
	"employmentStartDate" timestamp,
	"gradeStartDate" timestamp,
	"position" varchar(255),
	"employeeStatus" "employee_status",
	"companyAddress" varchar(255),
	"companyVillage" varchar(100),
	"companyDistrict" varchar(100),
	"companyCity" varchar(100),
	"companyProvince" varchar(100),
	"companyPostalCode" varchar(10),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_member" (
	"id" serial PRIMARY KEY NOT NULL,
	"headOfFamilyId" integer NOT NULL,
	"identityNumber" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text,
	"relationship" "relationship" NOT NULL,
	"pisaCode" "pisa_code" NOT NULL,
	"childOrder" integer,
	"isStudent" boolean DEFAULT false NOT NULL,
	"gender" "gender" NOT NULL,
	"birthPlace" text NOT NULL,
	"birthDate" timestamp (3) NOT NULL,
	"phoneNumber" text,
	"email" text,
	"bpjsNumber" text,
	"employeeId" text,
	"studentVerificationNumber" text,
	"studentVerificationDate" timestamp (3),
	"photoUrl" text,
	"primaryFacilityId" integer,
	"dentalFacilityId" integer,
	"hasCommercialInsurance" boolean DEFAULT false NOT NULL,
	"commercialInsurancePolicyNumber" text,
	"commercialInsuranceCompanyName" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "healthcare_facility" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"class" varchar(50),
	"address" varchar(255),
	"village" varchar(100),
	"district" varchar(100),
	"city" varchar(100),
	"province" varchar(100),
	"postalCode" varchar(10),
	"phoneNumber" varchar(20),
	"email" varchar(100),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "healthcare_facility_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "participant" (
	"id" serial PRIMARY KEY NOT NULL,
	"bpjsNumber" varchar(13),
	"familyCardNumber" varchar(16) NOT NULL,
	"identityNumber" varchar(16) NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100),
	"nameOnCard" varchar(100),
	"pisaCode" "pisa_code" DEFAULT '1' NOT NULL,
	"gender" "gender" NOT NULL,
	"bloodType" "blood_type" DEFAULT 'UNKNOWN',
	"birthPlace" varchar(100) NOT NULL,
	"birthDate" date NOT NULL,
	"religion" "religion" NOT NULL,
	"maritalStatus" "marital_status" NOT NULL,
	"phoneNumber" varchar(20),
	"email" varchar(100),
	"addressStreet" varchar(255),
	"addressRt" varchar(5),
	"addressRw" varchar(5),
	"addressVillage" varchar(100),
	"addressDistrict" varchar(100),
	"addressCity" varchar(100),
	"addressProvince" varchar(100),
	"addressPostalCode" varchar(10),
	"mailingAddressSame" boolean DEFAULT true NOT NULL,
	"mailingAddressStreet" varchar(255),
	"mailingAddressRt" varchar(5),
	"mailingAddressRw" varchar(5),
	"mailingAddressVillage" varchar(100),
	"mailingAddressDistrict" varchar(100),
	"mailingAddressCity" varchar(100),
	"mailingAddressProvince" varchar(100),
	"mailingAddressPostalCode" varchar(10),
	"npwp" varchar(20),
	"photoUrl" text,
	"occupation" varchar(100),
	"monthlyIncome" varchar(50),
	"visaNumber" varchar(50),
	"hasCommercialInsurance" boolean DEFAULT false NOT NULL,
	"commercialInsurancePolicyNumber" varchar(50),
	"commercialInsuranceCompanyName" varchar(100),
	"participantSegment" "participant_segment" NOT NULL,
	"treatmentClass" "treatment_class" NOT NULL,
	"isLifetimeMember" boolean DEFAULT true NOT NULL,
	"userId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"effectiveDate" timestamp,
	"expiryDate" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"statusPeserta" varchar(50) DEFAULT 'AKTIF',
	"statusBayar" varchar(50) DEFAULT 'LUNAS',
	"deactivatedAt" timestamp,
	"deactivationReason" text,
	CONSTRAINT "participant_bpjsNumber_unique" UNIQUE("bpjsNumber")
);
--> statement-breakpoint
CREATE TABLE "participant_healthcare_facility" (
	"id" serial PRIMARY KEY NOT NULL,
	"participantId" integer,
	"primaryFacilityId" integer,
	"dentalFacilityId" integer,
	"treatmentClass" "treatment_class" NOT NULL,
	"effectiveDate" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_application" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicationNumber" text NOT NULL,
	"participantId" integer,
	"status" "registration_status" DEFAULT 'DRAFT' NOT NULL,
	"participantSegment" "participant_segment" NOT NULL,
	"treatmentClass" "treatment_class" NOT NULL,
	"verifiedBy" text,
	"verifiedAt" timestamp (3),
	"enteredBy" text NOT NULL,
	"enteredAt" timestamp (3) NOT NULL,
	"virtualAccountCreated" boolean DEFAULT false NOT NULL,
	"virtualAccountCreatedAt" timestamp (3),
	"firstPaymentDeadline" timestamp (3),
	"familyCardDocumentUrl" text,
	"identityDocumentUrl" text,
	"bankBookDocumentUrl" text,
	"autodebitLetterDocumentUrl" text,
	"rejectionReason" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "registration_application_applicationNumber_unique" UNIQUE("applicationNumber")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_information" ADD CONSTRAINT "bank_information_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_payment" ADD CONSTRAINT "contribution_payment_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_change_request" ADD CONSTRAINT "data_change_request_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_identity" ADD CONSTRAINT "employment_identity_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_member" ADD CONSTRAINT "family_member_headOfFamilyId_participant_id_fk" FOREIGN KEY ("headOfFamilyId") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_member" ADD CONSTRAINT "family_member_primaryFacilityId_healthcare_facility_id_fk" FOREIGN KEY ("primaryFacilityId") REFERENCES "public"."healthcare_facility"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_member" ADD CONSTRAINT "family_member_dentalFacilityId_dental_facility_id_fk" FOREIGN KEY ("dentalFacilityId") REFERENCES "public"."dental_facility"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant" ADD CONSTRAINT "participant_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_healthcare_facility" ADD CONSTRAINT "participant_healthcare_facility_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_healthcare_facility" ADD CONSTRAINT "participant_healthcare_facility_primaryFacilityId_healthcare_facility_id_fk" FOREIGN KEY ("primaryFacilityId") REFERENCES "public"."healthcare_facility"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_healthcare_facility" ADD CONSTRAINT "participant_healthcare_facility_dentalFacilityId_dental_facility_id_fk" FOREIGN KEY ("dentalFacilityId") REFERENCES "public"."dental_facility"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_application" ADD CONSTRAINT "registration_application_participantId_participant_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."participant"("id") ON DELETE set null ON UPDATE no action;