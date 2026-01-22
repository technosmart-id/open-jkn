import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Notification table
export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("info"), // info, success, warning, error
  title: text("title").notNull(),
  description: text("description"),
  link: text("link"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export types
export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;

// JKN Schema: import from "@/lib/db/schema/jkn" directly to avoid barrel file issues
export * from "./jkn";

// PBB Schema: import from "@/lib/db/schema/pbb" directly to avoid barrel file issues
