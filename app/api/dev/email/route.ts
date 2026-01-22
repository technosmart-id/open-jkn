import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendTestEmail } from "@/lib/email";

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { to, message } = body;

  const email = to ?? session.user.email;

  if (!email) {
    return NextResponse.json(
      { error: "Email address is required" },
      { status: 400 }
    );
  }

  const result = await sendTestEmail(email, message);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Test email sent to ${email}`,
    emailId: result.id,
  });
}
