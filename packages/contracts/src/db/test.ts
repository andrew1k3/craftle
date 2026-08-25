import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const testUsersTable = pgTable("testUsers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
