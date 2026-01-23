import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha, username } from "better-auth/plugins";
import { db } from "@/lib/db";
import {
  account as accountTable,
  session as sessionTable,
  user as userTable,
  verification as verificationTable,
} from "@/lib/db/schema/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

// Validate required environment variables
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Please set it in your .env.local file."
  );
}

const plugins: BetterAuthOptions["plugins"] = [username()];

// Only add captcha if configured
if (process.env.RECAPTCHA_SECRET_KEY) {
  plugins.push(
    captcha({
      provider: "google-recaptcha",
      secretKey: process.env.RECAPTCHA_SECRET_KEY,
    })
  );
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: userTable,
      session: sessionTable,
      account: accountTable,
      verification: verificationTable,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url, user.name);
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url, user.name);
    },
    sendOnSignUp: true,
  },

  socialProviders: {
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            prompt: "select_account",
          }
        : undefined,
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  plugins,
});

export type Auth = typeof auth;
