import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
} from "drizzle-orm/pg-core";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - for local authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),

  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  position: varchar("position", { length: 255 }),
  address: text("address"),
  businessType: varchar("business_type", { length: 255 }),
  currency: varchar("currency", { length: 10 }).default("XOF"), // XOF ou GHS
  language: varchar("language", { length: 10 }).default("fr"), // fr ou en
  licenseActivated: boolean("license_activated").default(false), // Licence activée pour cet utilisateur
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});