import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { bankInformation } from "@/lib/db/schema/jkn";
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

export const bankRouter = {
  getParticipantBanks: protectedProcedure
    .input(z.object({ participantId: z.number() }))
    .handler(async ({ input }) =>
      db.query.bankInformation.findMany({
        where: eq(bankInformation.participantId, input.participantId),
      })
    ),

  create: protectedProcedure
    .input(
      z.object({
        participantId: z.number(),
        bankName: bankNameEnum,
        accountNumber: z.string(),
        accountHolderName: z.string(),
        autoDebitAuthorized: z.boolean().default(false),
        autoDebitDocumentUrl: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const [bank] = await db
        .insert(bankInformation)
        .values({
          ...input,
          virtualAccountNumber: `VA${Date.now()}`,
        })
        .returning();

      return bank;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        accountNumber: z.string().optional(),
        accountHolderName: z.string().optional(),
        autoDebitAuthorized: z.boolean().optional(),
        autoDebitDocumentUrl: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...data } = input;

      const [updated] = await db
        .update(bankInformation)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(bankInformation.id, id))
        .returning();

      return updated;
    }),

  setVirtualAccount: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        virtualAccountNumber: z.string(),
      })
    )
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(bankInformation)
        .set({
          virtualAccountNumber: input.virtualAccountNumber,
          updatedAt: new Date(),
        })
        .where(eq(bankInformation.id, input.id))
        .returning();

      return updated;
    }),
};
