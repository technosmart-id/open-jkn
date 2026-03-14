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
    // Use scryptAsync for password hashing (Better Auth default)
    const { scryptAsync } = await import("@noble/hashes/scrypt.js");
    const { hex } = await import("@better-auth/utils/hex");
    const crypto = await import("node:crypto");

    // Check if admin user exists
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, DEMO_ADMIN.email))
      .limit(1);

    const existingUser = existingUsers[0];
    const userId = existingUser?.id || generateId();

    // Generate 16-byte salt and encode as hex
    const salt = hex.encode(
      crypto.webcrypto.getRandomValues(new Uint8Array(16))
    );

    // Normalize password with NFKC (Better Auth requirement)
    const password = DEMO_ADMIN.password.normalize("NFKC");

    // Derive key using scryptAsync with Better Auth's parameters
    const key = await scryptAsync(password, salt, {
      N: 16_384,
      r: 16,
      p: 1,
      dkLen: 64,
      maxmem: 128 * 16_384 * 16 * 2,
    });

    // Format as {saltHex}:{derivedKeyHex}
    const passwordHash = `${salt}:${hex.encode(key)}`;

    if (existingUser) {
      // Update existing user and account
      await db
        .update(user)
        .set({
          name: DEMO_ADMIN.name,
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      // Update password in account table
      await db
        .update(account)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(eq(account.userId, userId));

      return NextResponse.json({
        success: true,
        message: "Admin user updated",
        created: false,
      });
    }

    // Create new user
    await db.insert(user).values({
      id: userId,
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create account with password
    await db.insert(account).values({
      id: generateId(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created",
      created: true,
    });
  } catch (error) {
    console.error("Demo admin seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed admin user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
