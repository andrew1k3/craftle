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
import { user } from "./auth-schema";

export const gameTable = pgTable("game", {
  gameId: serial("game_id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expectedItemId: integer("expected_item_id").notNull(),
  expectedItemName: text("expected_item_name").notNull(),
});

export const inventoryTable = pgTable(
  "inventory",
  {
    gameId: integer("game_id")
      .notNull()
      .references(() => gameTable.gameId, { onDelete: "cascade" }),
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

export const guessTable = pgTable(
  "guess",
  {
    gameId: integer("game_id")
      .notNull()
      .references(() => gameTable.gameId, { onDelete: "cascade" }),
    turn: integer("turn").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    guessItemId: integer("guess_item_id").notNull(),
    guessItemName: text("guess_item_name").notNull(),
    guessRecipe: text("guess_recipe").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.gameId, table.turn, table.userId],
    }),
  ],
);

// TODO: add a table for a user's current game, including turn, game being active, gameId, and have the game and guesses as relations.

export const inventoryRelations = relations(inventoryTable, ({ one }) => ({
  game: one(gameTable, {
    fields: [inventoryTable.gameId],
    references: [gameTable.gameId],
  }),
}));

export const gameRelations = relations(gameTable, ({ many }) => ({
  inventory: many(inventoryTable),
  guesses: many(guessTable),
}));

// one game can have many guesses, and one user can have many guesses
export const guessRelations = relations(guessTable, ({ one }) => ({
  game: one(gameTable, {
    fields: [guessTable.gameId],
    references: [gameTable.gameId],
  }),
  user: one(user, {
    fields: [guessTable.userId],
    references: [user.id],
  }),
}));
