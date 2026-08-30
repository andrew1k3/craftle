import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const gamesTable = pgTable("games", {
  gameId: serial("gameId").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expectedItemName: text("expected_item_name").notNull(),
});

export const inventoriesTable = pgTable(
  "inventories",
  {
    gameId: integer("gameId")
      .notNull()
      .references(() => gamesTable.gameId, { onDelete: "cascade" }),
    slot: integer("slot").notNull(),
    itemName: text("item_name").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.gameId, table.slot],
    }),
  ],
);

export const inventoryRelations = relations(inventoriesTable, ({ one }) => ({
  game: one(gamesTable, {
    fields: [inventoriesTable.gameId],
    references: [gamesTable.gameId],
  }),
}));

export const gameRelations = relations(gamesTable, ({ many }) => ({
  inventory: many(inventoriesTable),
}));
