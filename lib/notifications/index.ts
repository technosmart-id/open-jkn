import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type NewNotification, notification } from "@/lib/db/schema";

function generateId(): string {
  return crypto.randomUUID();
}

export type NotificationType = "info" | "success" | "warning" | "error";

export type CreateNotificationInput = {
  userId: string;
  type?: NotificationType;
  title: string;
  description?: string;
  link?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const data: NewNotification = {
    id: generateId(),
    userId: input.userId,
    type: input.type ?? "info",
    title: input.title,
    description: input.description ?? null,
    link: input.link ?? null,
  };

  const [result] = await db.insert(notification).values(data).returning();
  return result;
}

export function getNotifications(userId: string, limit = 20) {
  return db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt))
    .limit(limit);
}

export function getUnreadNotifications(userId: string) {
  return db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const results = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId));

  return results.filter((n) => !n.read).length;
}

export async function markAsRead(notificationId: string, userId: string) {
  const [result] = await db
    .update(notification)
    .set({ read: true })
    .where(
      and(eq(notification.id, notificationId), eq(notification.userId, userId))
    )
    .returning();

  return result;
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notification)
    .set({ read: true })
    .where(eq(notification.userId, userId));
}

export async function deleteNotification(
  notificationId: string,
  userId: string
) {
  await db
    .delete(notification)
    .where(
      and(eq(notification.id, notificationId), eq(notification.userId, userId))
    );
}

export async function deleteAllNotifications(userId: string) {
  await db.delete(notification).where(eq(notification.userId, userId));
}
