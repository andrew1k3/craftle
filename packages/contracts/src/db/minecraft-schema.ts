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
  gameId: serial("game_id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expectedItemId: integer("expected_item_id").notNull(),
  expectedItemName: text("expected_item_name").notNull(),
});

export const inventoriesTable = pgTable(
  "inventories",
  {
    gameId: integer("game_id")
      .notNull()
      .references(() => gamesTable.gameId, { onDelete: "cascade" }),
    slot: integer("slot").notNull(),
    count: integer("count").notNull(),
    itemId: integer("item_id").notNull(),
    itemName: text("item_name").notNull(),
    fromRecipeName: text("from_recipe_name"),
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
