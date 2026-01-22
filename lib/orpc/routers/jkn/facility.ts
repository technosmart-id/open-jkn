import { and, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { dentalFacility, healthcareFacility } from "@/lib/db/schema/jkn";
import { protectedProcedure } from "../../server";

export const facilityRouter = {
  // Healthcare facilities
  listHealthcareFacilities: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
        city: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [eq(healthcareFacility.isActive, true)];

      if (input.search) {
        conditions.push(
          or(
            like(healthcareFacility.name, `%${input.search}%`),
            like(healthcareFacility.code, `%${input.search}%`)
          )!
        );
      }

      if (input.type) {
        conditions.push(eq(healthcareFacility.type, input.type));
      }

      if (input.city) {
        conditions.push(like(healthcareFacility.city, `%${input.city}%`));
      }

      const facilities = await db
        .select()
        .from(healthcareFacility)
        .where(and(...conditions))
        .limit(input.limit);

      return facilities;
    }),

  getHealthcareFacilityById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      const facility = await db.query.healthcareFacility.findFirst({
        where: eq(healthcareFacility.id, input.id),
      });

      if (!facility) {
        throw new Error("Faskes tidak ditemukan");
      }

      return facility;
    }),

  // Dental facilities
  listDentalFacilities: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        city: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [eq(dentalFacility.isActive, true)];

      if (input.search) {
        conditions.push(
          or(
            like(dentalFacility.name, `%${input.search}%`),
            like(dentalFacility.code, `%${input.search}%`)
          )!
        );
      }

      if (input.city) {
        conditions.push(like(dentalFacility.city, `%${input.city}%`));
      }

      const facilities = await db
        .select()
        .from(dentalFacility)
        .where(and(...conditions))
        .limit(input.limit);

      return facilities;
    }),

  getDentalFacilityById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      const facility = await db.query.dentalFacility.findFirst({
        where: eq(dentalFacility.id, input.id),
      });

      if (!facility) {
        throw new Error("Faskes Gigi tidak ditemukan");
      }

      return facility;
    }),
};
