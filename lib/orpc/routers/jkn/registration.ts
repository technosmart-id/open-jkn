import { and, desc, eq, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { participant, registrationApplication } from "@/lib/db/schema/jkn";
import { protectedProcedure } from "../../server";

const registrationStatusEnum = z.enum([
  "DRAFT",
  "VERIFIKASI",
  "VIRTUAL_ACCOUNT_DIBUAT",
  "MENUNGGU_PEMBAYARAN",
  "AKTIF",
  "DITOLAK",
  "DIBATALKAN",
  "KEDALUWARSA",
]);

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

export const registrationRouter = {
  list: protectedProcedure
    .input(
      z.object({
        status: registrationStatusEnum.optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions: ReturnType<typeof eq | typeof sql>[] = [];

      if (input.status) {
        conditions.push(eq(registrationApplication.status, input.status));
      }

      if (input.search) {
        conditions.push(
          sql`${registrationApplication.applicationNumber} ILIKE ${`%${input.search}%`}`
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(registrationApplication)
          .where(whereClause)
          .orderBy(desc(registrationApplication.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(registrationApplication)
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
      const application = await db.query.registrationApplication.findFirst({
        where: eq(registrationApplication.id, input.id),
      });

      if (!application) {
        throw new Error("Pendaftaran tidak ditemukan");
      }

      // Manually fetch participant if participantId exists
      type ParticipantData = Awaited<
        ReturnType<typeof db.query.participant.findFirst>
      > | null;
      let participantData: ParticipantData = null;
      if (application.participantId) {
        participantData = (await db.query.participant.findFirst({
          where: eq(participant.id, application.participantId),
        })) as ParticipantData;
      }

      return {
        ...application,
        participant: participantData,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        participantId: z.number().optional(), // null for new participants
        participantSegment: participantSegmentEnum,
        treatmentClass: z.enum(["I", "II", "III"]),
        // Documents
        familyCardDocumentUrl: z.string().optional(),
        identityDocumentUrl: z.string().optional(),
        bankBookDocumentUrl: z.string().optional(),
        autodebitLetterDocumentUrl: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      // Generate application number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10_000)
        .toString()
        .padStart(4, "0");
      const applicationNumber = `REG${timestamp}${random}`;

      const [application] = await db
        .insert(registrationApplication)
        .values({
          applicationNumber,
          participantId: input.participantId,
          status: "DRAFT",
          participantSegment: input.participantSegment,
          treatmentClass: input.treatmentClass,
          familyCardDocumentUrl: input.familyCardDocumentUrl,
          identityDocumentUrl: input.identityDocumentUrl,
          bankBookDocumentUrl: input.bankBookDocumentUrl,
          autodebitLetterDocumentUrl: input.autodebitLetterDocumentUrl,
          enteredBy: context.user.id,
          enteredAt: new Date(),
        })
        .returning();

      return application;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "DRAFT",
          "VERIFIKASI",
          "VIRTUAL_ACCOUNT_DIBUAT",
          "MENUNGGU_PEMBAYARAN",
          "AKTIF",
          "DITOLAK",
          "DIBATALKAN",
          "KEDALUWARSA",
        ]),
        rejectionReason: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      type UpdateData = {
        status:
          | "DRAFT"
          | "VERIFIKASI"
          | "VIRTUAL_ACCOUNT_DIBUAT"
          | "MENUNGGU_PEMBAYARAN"
          | "AKTIF"
          | "DITOLAK"
          | "DIBATALKAN"
          | "KEDALUWARSA";
        updatedAt: Date;
        verifiedBy?: string;
        verifiedAt?: Date;
        virtualAccountCreated?: boolean;
        virtualAccountCreatedAt?: Date;
        firstPaymentDeadline?: string;
        rejectionReason?: string;
      };

      const updateData: UpdateData = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "VERIFIKASI") {
        updateData.verifiedBy = context.user.id;
        updateData.verifiedAt = new Date();
      }

      if (input.status === "VIRTUAL_ACCOUNT_DIBUAT") {
        updateData.virtualAccountCreated = true;
        updateData.virtualAccountCreatedAt = new Date();
        // Set payment deadline to 30 days from now
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);
        updateData.firstPaymentDeadline = deadline.toISOString();
      }

      if (input.status === "DITOLAK") {
        updateData.rejectionReason = input.rejectionReason;
      }

      const [updated] = await db
        .update(registrationApplication)
        .set(updateData)
        .where(eq(registrationApplication.id, input.id))
        .returning();

      return updated;
    }),

  // Check for expired registrations
  checkExpired: protectedProcedure.handler(async () => {
    const expired = await db
      .select()
      .from(registrationApplication)
      .where(
        and(
          eq(registrationApplication.status, "MENUNGGU_PEMBAYARAN"),
          lt(
            registrationApplication.firstPaymentDeadline,
            new Date().toISOString()
          )
        )
      );

    // Update to expired status
    for (const app of expired) {
      await db
        .update(registrationApplication)
        .set({ status: "KEDALUWARSA", updatedAt: new Date() })
        .where(eq(registrationApplication.id, app.id));
    }

    return { expired: expired.length };
  }),
};
