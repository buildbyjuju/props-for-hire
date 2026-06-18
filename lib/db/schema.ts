import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  date,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "pending_confirmation",
  "paid",
  "cancelled",
]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  imageUrls: text("image_urls").array().notNull().default([]),
  quantityAvailable: integer("quantity_available").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  eventDate: date("event_date").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  stripeSessionId: text("stripe_session_id"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  selectedSize: text("selected_size"),
  selectedSets: text("selected_sets"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dateBlocks = pgTable("date_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  eventDate: date("event_date").notNull(),
  selectedSize: text("selected_size"),
  selectedSets: text("selected_sets"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quoteRequests = pgTable("quote_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  eventDate: date("event_date").notNull(),
  setupTime: text("setup_time").notNull(),
  eventType: text("event_type").notNull(),
  notes: text("notes"),
  inspirationUrls: text("inspiration_urls").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  item: one(items, {
    fields: [bookings.itemId],
    references: [items.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type DateBlock = typeof dateBlocks.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
