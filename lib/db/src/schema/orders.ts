import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  rank: text("rank").notNull().default("cart"),
  transactionId: text("transaction_id").notNull(),
  referral: text("referral").notNull().default("NONE"),
  status: text("status").notNull().default("pending"),
  items: text("items"),
  totalPrice: integer("total_price"),
  minecraftUsername: text("minecraft_username"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
