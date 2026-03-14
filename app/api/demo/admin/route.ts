import { generateId } from "better-auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema/auth";

const DEMO_ADMIN = {
  email: "admin@jkn.go.id",
  password: "admin123456",
  name: "Admin JKN",
} as const;

export async function POST() {
  try {
    const { scryptAsync } = await import("@noble/hashes/scrypt.js");
    const { hex } = await import("@better-auth/utils/hex");
    const crypto = await import("node:crypto");

    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, DEMO_ADMIN.email))
      .limit(1);

    const existingUser = existingUsers[0];
    const userId = existingUser?.id || generateId();

    const salt = hex.encode(
      crypto.webcrypto.getRandomValues(new Uint8Array(16))
    );

    const password = DEMO_ADMIN.password.normalize("NFKC");

    const key = await scryptAsync(password, salt, {
      N: 16_384,
      r: 16,
      p: 1,
      dkLen: 64,
      maxmem: 128 * 16_384 * 16 * 2,
    });

    const passwordHash = `${salt}:${hex.encode(key)}`;

    if (existingUser) {
      await db
        .update(user)
        .set({
          name: DEMO_ADMIN.name,
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      await db
        .update(account)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(eq(account.userId, userId));

      return NextResponse.json({ success: true });
    }

    await db.insert(user).values({
      id: userId,
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(account).values({
      id: generateId(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Demo seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
