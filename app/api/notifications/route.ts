import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createNotification,
  getNotifications,
  getUnreadCount,
} from "@/lib/notifications";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotifications(session.user.id);
  const unreadCount = await getUnreadCount(session.user.id);

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, type, link } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const notification = await createNotification({
    userId: session.user.id,
    title,
    description,
    type,
    link,
  });

  return NextResponse.json({ notification });
}
