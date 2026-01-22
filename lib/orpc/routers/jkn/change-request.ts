import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  dataChangeRequest,
  employmentIdentity,
  participant,
} from "@/lib/db/schema/jkn";
import { protectedProcedure } from "../../server";

const changeTypeEnum = z.enum([
  "ALAMAT",
  "TEMPAT_KERJA",
  "GOLONGAN_KEPANGKATAN",
  "GAJI",
  "FASKES",
  "PENSIUN",
  "KEMATIAN",
  "DATA_KELUARGA",
  "NAMA",
]);

export const changeRequestRouter = {
  list: protectedProcedure
    .input(
      z.object({
        changeType: changeTypeEnum.optional(),
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions: ReturnType<typeof eq>[] = [];

      if (input.changeType) {
        conditions.push(eq(dataChangeRequest.changeType, input.changeType));
      }

      if (input.status) {
        conditions.push(eq(dataChangeRequest.status, input.status));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(dataChangeRequest)
          .where(whereClause)
          .orderBy(desc(dataChangeRequest.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(dataChangeRequest)
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
      const changeRequest = await db.query.dataChangeRequest.findFirst({
        where: eq(dataChangeRequest.id, input.id),
      });

      if (!changeRequest) {
        throw new Error("Permohonan perubahan tidak ditemukan");
      }

      // Manually fetch participant if participantId exists
      type ParticipantData = Awaited<
        ReturnType<typeof db.query.participant.findFirst>
      > | null;
      let participantData: ParticipantData = null;
      if (changeRequest.participantId) {
        participantData = (await db.query.participant.findFirst({
          where: eq(participant.id, changeRequest.participantId),
        })) as ParticipantData;
      }

      return {
        ...changeRequest,
        participant: participantData,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        participantId: z.number(),
        changeType: z.enum([
          "ALAMAT",
          "TEMPAT_KERJA",
          "GOLONGAN_KEPANGKATAN",
          "GAJI",
          "FASKES",
          "PENSIUN",
          "KEMATIAN",
          "DATA_KELUARGA",
          "NAMA",
        ]),
        previousData: z.any(), // JSON
        newData: z.any(), // JSON
        supportingDocumentUrl: z.string().optional(),
        deathCertificateNumber: z.string().optional(),
        deathCertificateDocumentUrl: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      // Generate request number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10_000)
        .toString()
        .padStart(4, "0");
      const requestNumber = `CHR${timestamp}${random}`;

      const [request] = await db
        .insert(dataChangeRequest)
        .values({
          requestNumber,
          participantId: input.participantId,
          changeType: input.changeType,
          previousData: input.previousData,
          newData: input.newData,
          supportingDocumentUrl: input.supportingDocumentUrl,
          deathCertificateNumber: input.deathCertificateNumber,
          deathCertificateDocumentUrl: input.deathCertificateDocumentUrl,
          status: "PENDING",
          enteredBy: context.user.id,
          enteredAt: new Date(),
        })
        .returning();

      return request;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["PENDING", "VERIFIED", "APPROVED", "REJECTED"]),
        verificationNotes: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const updateData: {
        status: string;
        verifiedBy?: string;
        verifiedAt?: Date;
        verificationNotes?: string;
      } = {
        status: input.status,
      };

      if (input.status === "VERIFIED") {
        updateData.verifiedBy = context.user.id;
        updateData.verifiedAt = new Date();
        updateData.verificationNotes = input.verificationNotes;
      }

      const [updated] = await db
        .update(dataChangeRequest)
        .set(updateData)
        .where(eq(dataChangeRequest.id, input.id))
        .returning();

      return updated;
    }),

  approve: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .handler(async ({ input }) => {
      // Get the change request
      const request = await db.query.dataChangeRequest.findFirst({
        where: eq(dataChangeRequest.id, input.id),
      });

      if (!request) {
        throw new Error("Permohonan tidak ditemukan");
      }

      // Apply the changes based on change type
      const { newData, changeType, participantId } = request;

      // Update participant with new data
      switch (changeType) {
        case "ALAMAT":
        case "NAMA":
          // Update participant table
          await db
            .update(participant)
            .set({
              ...(newData as Record<string, unknown>),
              updatedAt: new Date(),
            })
            .where(eq(participant.id, participantId));
          break;

        case "TEMPAT_KERJA":
        case "GOLONGAN_KEPANGKATAN":
        case "GAJI":
          // Update employment identity
          await db
            .update(employmentIdentity)
            .set({
              ...(newData as Record<string, unknown>),
              updatedAt: new Date(),
            })
            .where(eq(employmentIdentity.participantId, participantId));
          break;

        case "FASKES":
          // Healthcare facilities are updated via participantHealthcareFacility
          // This would require specific handling
          break;

        case "KEMATIAN":
          // Deactivate participant
          await db
            .update(participant)
            .set({
              isActive: false,
              deactivatedAt: new Date(),
              deactivationReason: "Meninggal dunia",
              updatedAt: new Date(),
            })
            .where(eq(participant.id, participantId));
          break;

        default:
          break;
      }

      // Mark request as approved
      const [updated] = await db
        .update(dataChangeRequest)
        .set({
          status: "APPROVED",
          enteredBy: request.enteredBy,
          enteredAt: new Date(),
        })
        .where(eq(dataChangeRequest.id, input.id))
        .returning();

      return updated;
    }),
};
