import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  bankInformation,
  dentalFacility,
  employmentIdentity,
  familyMember,
  healthcareFacility,
  participant,
  participantHealthcareFacility,
} from "@/lib/db/schema/jkn";
import { protectedProcedure } from "../../server";

const participantSegmentEnum = z.enum([
  "PU_PNS_PUSAT",
  "PU_PNS_DAERAH",
  "PU_PNS_POLRI",
  "PU_PNS_TNI_AD",
  "PU_PNS_TNI_AL",
  "PU_PNS_TNI_AU",
  "PU_PNS_MABES_TNI",
  "PU_PNS_KEMHAN",
  "PU_TNI_AD",
  "PU_TNI_AL",
  "PU_TNI_AU",
  "PU_POLRI",
  "PU_PPNPN",
  "PU_BUMN",
  "PU_BUMD",
  "PU_SWASTA",
  "PBPU",
  "BP",
  "INVESTOR",
  "PEMBERI_KERJA",
  "PENSIUNAN_PNS",
  "PENSIUNAN_TNI_POLRI",
  "PENSIUNAN_BUMN",
  "PENSIUNAN_SWASTA",
  "PBI_APBN",
  "PBI_APBD",
]);

export const participantRouter = {
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        segment: participantSegmentEnum.optional(),
        status: z.enum(["active", "inactive", "all"]).default("all"),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions: ReturnType<typeof sql<string> | typeof eq>[] = [];

      if (input.search) {
        conditions.push(
          sql`${participant.fullName} ILIKE ${`%${input.search}%`} OR ${participant.bpjsNumber} ILIKE ${`%${input.search}%`} OR ${participant.identityNumber} ILIKE ${`%${input.search}%`}`
        );
      }

      if (input.segment) {
        conditions.push(eq(participant.participantSegment, input.segment));
      }

      if (input.status === "active") {
        conditions.push(eq(participant.isActive, true));
      } else if (input.status === "inactive") {
        conditions.push(eq(participant.isActive, false));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(participant)
          .where(whereClause)
          .orderBy(desc(participant.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(participant)
          .where(whereClause),
      ]);

      const total = totalResult[0]?.count || 0;

      return {
        data,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      const participantData = await db.query.participant.findFirst({
        where: eq(participant.id, input.id),
      });

      if (!participantData) {
        throw new Error("Peserta tidak ditemukan");
      }

      // Manually fetch employment identity
      const employmentIdentityData =
        await db.query.employmentIdentity.findFirst({
          where: eq(employmentIdentity.participantId, input.id),
        });

      // Manually fetch healthcare facilities
      const healthcareFacilitiesData =
        await db.query.participantHealthcareFacility.findMany({
          where: eq(participantHealthcareFacility.participantId, input.id),
        });

      // Fetch facility details for each healthcare facility
      const healthcareFacilitiesWithDetails = await Promise.all(
        healthcareFacilitiesData.map(async (phf) => {
          const primaryFacility = phf.primaryFacilityId
            ? await db.query.healthcareFacility.findFirst({
                where: eq(healthcareFacility.id, phf.primaryFacilityId),
              })
            : null;

          const dentalFacilityData = phf.dentalFacilityId
            ? await db.query.dentalFacility.findFirst({
                where: eq(dentalFacility.id, phf.dentalFacilityId),
              })
            : null;

          return {
            ...phf,
            primaryFacility,
            dentalFacility: dentalFacilityData,
          };
        })
      );

      // Manually fetch bank information
      const bankInfo = await db.query.bankInformation.findFirst({
        where: eq(bankInformation.participantId, input.id),
      });

      return {
        ...participantData,
        employmentIdentity: employmentIdentityData,
        healthcareFacilities: healthcareFacilitiesWithDetails,
        bankInformation: bankInfo,
      };
    }),

  getByBpjsNumber: protectedProcedure
    .input(z.object({ bpjsNumber: z.string() }))
    .handler(async ({ input }) => {
      const participantData = await db.query.participant.findFirst({
        where: eq(participant.bpjsNumber, input.bpjsNumber),
        with: {
          employmentIdentity: true,
          healthcareFacilities: {
            with: {
              primaryFacility: true,
              dentalFacility: true,
            },
          },
        },
      });

      return participantData;
    }),

  getFamilyMembers: protectedProcedure
    .input(z.object({ participantId: z.number() }))
    .handler(async ({ input }) =>
      db.query.familyMember.findMany({
        where: eq(familyMember.headOfFamilyId, input.participantId),
        orderBy: (fm, { asc }) => [asc(fm.createdAt)],
      })
    ),

  create: protectedProcedure
    .input(
      z.object({
        // Participant fields
        familyCardNumber: z.string().length(16),
        identityNumber: z.string().length(16),
        fullName: z.string().min(3).max(100),
        nameOnCard: z.string().max(100).optional(),
        gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
        bloodType: z
          .enum([
            "A",
            "B",
            "AB",
            "O",
            "A_POSITIVE",
            "B_POSITIVE",
            "AB_POSITIVE",
            "O_POSITIVE",
            "A_NEGATIVE",
            "B_NEGATIVE",
            "AB_NEGATIVE",
            "O_NEGATIVE",
            "UNKNOWN",
          ])
          .optional(),
        birthPlace: z.string().min(2),
        birthDate: z.string(), // ISO date string
        religion: z.enum([
          "ISLAM",
          "KRISTEN",
          "KATOLIK",
          "HINDU",
          "BUDHA",
          "KONGHUCU",
          "LAINNYA",
        ]),
        maritalStatus: z.enum(["KAWIN", "BELUM_KAWIN", "JANDA", "DUDA"]),
        phoneNumber: z.string().optional(),
        email: z.string().email().optional(),
        addressStreet: z.string().optional(),
        addressRt: z.string().optional(),
        addressRw: z.string().optional(),
        addressVillage: z.string().optional(),
        addressDistrict: z.string().optional(),
        addressCity: z.string().optional(),
        addressProvince: z.string().optional(),
        addressPostalCode: z.string().optional(),
        mailingAddressSame: z.boolean().default(true),
        mailingAddressStreet: z.string().optional(),
        mailingAddressRt: z.string().optional(),
        mailingAddressRw: z.string().optional(),
        mailingAddressVillage: z.string().optional(),
        mailingAddressDistrict: z.string().optional(),
        mailingAddressCity: z.string().optional(),
        mailingAddressProvince: z.string().optional(),
        mailingAddressPostalCode: z.string().optional(),
        npwp: z.string().optional(),
        photoUrl: z.string().optional(),
        occupation: z.string().optional(),
        monthlyIncome: z.string().optional(), // decimal as string
        visaNumber: z.string().optional(),
        hasCommercialInsurance: z.boolean().default(false),
        commercialInsurancePolicyNumber: z.string().optional(),
        commercialInsuranceCompanyName: z.string().optional(),
        participantSegment: participantSegmentEnum,
        treatmentClass: z.enum(["I", "II", "III"]),
        isLifetimeMember: z.boolean().default(true),

        // Employment identity for PPU
        employmentIdentity: z
          .object({
            institutionName: z.string().optional(),
            institutionCode: z.string().optional(),
            salaryPayerInstitution: z.string().optional(),
            salaryPayerInstitutionCode: z.string().optional(),
            oldEmployeeId: z.string().optional(),
            newEmployeeId: z.string().optional(),
            grade: z
              .enum(["I", "II", "III", "IV", "A", "B", "C", "D", "E"])
              .optional(),
            rank: z.string().optional(),
            baseSalary: z.string().optional(),
            employmentStartDate: z.string().optional(),
            gradeStartDate: z.string().optional(),
            position: z.string().optional(),
            employeeStatus: z
              .enum(["TETAP", "KONTRAK", "PARUH_WAKTU"])
              .optional(),
            companyAddress: z.string().optional(),
            companyVillage: z.string().optional(),
            companyDistrict: z.string().optional(),
            companyCity: z.string().optional(),
            companyProvince: z.string().optional(),
            companyPostalCode: z.string().optional(),
          })
          .optional(),

        // Healthcare facilities
        primaryFacilityId: z.number().optional(),
        dentalFacilityId: z.number().optional(),

        // Family members
        familyMembers: z
          .array(
            z.object({
              identityNumber: z.string().length(16),
              fullName: z.string().min(3).max(100),
              relationship: z.enum([
                "SUAMI",
                "ISTRI",
                "ANAK_TANGGUNGAN",
                "ANAK_TIDAK_TANGGUNGAN",
                "ORANG_TUA",
                "FAMILY_LAIN",
              ]),
              childOrder: z.number().optional(),
              isStudent: z.boolean().default(false),
              gender: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
              birthPlace: z.string().min(2),
              birthDate: z.string(),
              phoneNumber: z.string().optional(),
              email: z.string().email().optional(),
              bpjsNumber: z.string().optional(),
              employeeId: z.string().optional(),
              studentVerificationNumber: z.string().optional(),
              studentVerificationDate: z.string().optional(),
              photoUrl: z.string().optional(),
              primaryFacilityId: z.number().optional(),
              dentalFacilityId: z.number().optional(),
              hasCommercialInsurance: z.boolean().default(false),
              commercialInsurancePolicyNumber: z.string().optional(),
              commercialInsuranceCompanyName: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const {
        employmentIdentity: employmentIdentityData,
        familyMembers,
        primaryFacilityId,
        dentalFacilityId,
        ...participantData
      } = input;

      // Insert participant
      const [newParticipant] = await db
        .insert(participant)
        .values({
          ...participantData,
          userId: context.user.id,
        })
        .returning();

      // Insert employment identity if provided
      if (
        employmentIdentityData &&
        Object.keys(employmentIdentityData).length > 0
      ) {
        await db.insert(employmentIdentity).values({
          ...employmentIdentityData,
          participantId: newParticipant.id,
        });
      }

      // Insert healthcare facility
      if (primaryFacilityId || dentalFacilityId) {
        await db.insert(participantHealthcareFacility).values({
          participantId: newParticipant.id,
          primaryFacilityId,
          dentalFacilityId,
          treatmentClass: input.treatmentClass,
          effectiveDate: new Date().toISOString(),
        });
      }

      // Insert family members
      if (familyMembers && familyMembers.length > 0) {
        for (const member of familyMembers) {
          await db.insert(familyMember).values({
            ...member,
            headOfFamilyId: newParticipant.id,
          });
        }
      }

      return newParticipant;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          fullName: z.string().min(3).max(100).optional(),
          phoneNumber: z.string().optional(),
          email: z.string().email().optional(),
          addressStreet: z.string().optional(),
          addressVillage: z.string().optional(),
          addressDistrict: z.string().optional(),
          addressCity: z.string().optional(),
          addressProvince: z.string().optional(),
          addressPostalCode: z.string().optional(),
          photoUrl: z.string().optional(),
        }),
      })
    )
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(participant)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(participant.id, input.id))
        .returning();

      return updated;
    }),

  deactivate: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        reason: z.string(),
      })
    )
    .handler(async ({ input }) => {
      const [deactivated] = await db
        .update(participant)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivationReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(participant.id, input.id))
        .returning();

      return deactivated;
    }),
};
