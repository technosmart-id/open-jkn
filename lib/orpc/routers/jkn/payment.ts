import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { contributionPayment } from "@/lib/db/schema/jkn";
import { protectedProcedure } from "../../server";

const bankNameEnum = z.enum([
  "LAINNYA",
  "MANDIRI",
  "BRI",
  "BNI",
  "BCA",
  "BCA_SYARIAH",
  "BRI_SYARIAH",
  "BNI_SYARIAH",
  "BTN",
  "JATENG",
  "JATIM",
  "JB",
  "SUMUT",
]);

export const paymentRouter = {
  list: protectedProcedure
    .input(
      z.object({
        participantId: z.number().optional(),
        status: z.string().optional(),
        periodYear: z.number().optional(),
        periodMonth: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions: ReturnType<typeof eq>[] = [];

      if (input.participantId) {
        conditions.push(
          eq(contributionPayment.participantId, input.participantId)
        );
      }

      if (input.status) {
        conditions.push(eq(contributionPayment.status, input.status));
      }

      if (input.periodYear) {
        conditions.push(eq(contributionPayment.periodYear, input.periodYear));
      }

      if (input.periodMonth) {
        conditions.push(eq(contributionPayment.periodMonth, input.periodMonth));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(contributionPayment)
          .where(whereClause)
          .orderBy(
            desc(contributionPayment.periodYear),
            desc(contributionPayment.periodMonth)
          )
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(contributionPayment)
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
      const payment = await db.query.contributionPayment.findFirst({
        where: eq(contributionPayment.id, input.id),
        with: {
          participant: true,
        },
      });

      if (!payment) {
        throw new Error("Pembayaran tidak ditemukan");
      }

      return payment;
    }),

  create: protectedProcedure
    .input(
      z.object({
        participantId: z.number(),
        periodMonth: z.number().min(1).max(12),
        periodYear: z.number(),
        amount: z.string(), // decimal as string
        adminFee: z.string().optional(),
        paymentMethod: z.enum(["AUTO_DEBIT", "MANUAL", "VIRTUAL_ACCOUNT"]),
        bankName: bankNameEnum.optional(),
        virtualAccountNumber: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      // Check arrears and calculate penalty
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const paymentMonth = input.periodMonth;
      const paymentYear = input.periodYear;

      let penaltyAmount = "0";

      if (
        paymentYear < currentYear ||
        (paymentYear === currentYear && paymentMonth < currentMonth)
      ) {
        // Calculate months in arrears
        const yearDiff = currentYear - paymentYear;
        const monthsInArrears = yearDiff * 12 + (currentMonth - paymentMonth);

        // Calculate penalty: 2.5% per month in arrears
        const amount = Number.parseFloat(input.amount);
        const penalty = amount * (0.025 * monthsInArrears);
        penaltyAmount = penalty.toFixed(2);
      }

      // Generate payment number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10_000)
        .toString()
        .padStart(4, "0");
      const paymentNumber = `PAY${timestamp}${random}`;

      // Calculate total amount
      const adminFeeValue = input.adminFee || "0";
      const totalAmount = (
        Number.parseFloat(input.amount) +
        Number.parseFloat(adminFeeValue) +
        Number.parseFloat(penaltyAmount)
      ).toFixed(2);

      const [payment] = await db
        .insert(contributionPayment)
        .values({
          paymentNumber,
          participantId: input.participantId,
          periodMonth: input.periodMonth,
          periodYear: input.periodYear,
          amount: input.amount,
          adminFee: input.adminFee,
          totalAmount,
          paymentMethod: input.paymentMethod,
          bankName: input.bankName,
          virtualAccountNumber: input.virtualAccountNumber,
          status: "PENDING",
          penaltyAmount,
        })
        .returning();

      return payment;
    }),

  markAsPaid: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        paymentDate: z.string(),
        paymentReference: z.string(),
      })
    )
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(contributionPayment)
        .set({
          status: "PAID",
          paymentDate: new Date(input.paymentDate),
          paymentReference: input.paymentReference,
          updatedAt: new Date(),
        })
        .where(eq(contributionPayment.id, input.id))
        .returning();

      return updated;
    }),
};
