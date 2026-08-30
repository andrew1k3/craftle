import {
  Item,
  Recipe,
  ShapedRecipe,
  ShapelessRecipe,
} from "@workspace/minecraft";
import { Database, Db } from "@workspace/db";
import { gamesTable, inventoriesTable } from "@workspace/db/schema";
import {
  getGameRoute,
  getInventoryRoute,
} from "@workspace/api/routes/minecraft";
import { z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { GameData, InventoryData } from "@workspace/contracts/minecraft";

const RED_HERRINGS = 4;

export const generateGame = async (): Promise<GameData> => {
  const db: Db = Database.getInstance();

  const [newGame] = await db
    .insert(gamesTable)
    .values({
      expectedItemName: Item.getRandomItem().name,
      isActive: true,
    })
    .returning();

  if (!newGame) {
    throw new Error("New game wasn't created.");
  }

  const inventory: Item[] = [];
  for (let i = 0; i < RED_HERRINGS; i++) {
    const item: Item = Item.getRandomItem();
    const recipes: Recipe[] = item.getRecipes();
    const chosenRecipe: Recipe | undefined =
      recipes[Math.floor(Math.random() * recipes.length)];

    if (!chosenRecipe) {
      throw new Error(`Item doesn't have recipe: ${item.displayName}`);
    }

    if (chosenRecipe instanceof ShapedRecipe) {
      const ingredients: Set<Item> = new Set();
      chosenRecipe.shape.flat().forEach((item) => {
        if (item) {
          ingredients.add(item);
        }
      });
      inventory.push(...Array.from<Item>(ingredients));
    } else if (chosenRecipe instanceof ShapelessRecipe) {
      chosenRecipe.ingredients.forEach((item: Item) => {
        inventory.push(item);
      });
    }
  }

  inventory.forEach(async (item, index) => {
    await db.insert(inventoriesTable).values({
      gameId: newGame.gameId,
      slot: index,
      itemName: item.name,
    });
  });

  return await getGame({ gameId: newGame.gameId });
};

export const getGame = async ({
  gameId,
}: z.infer<typeof getGameRoute.request.query> = {}): Promise<GameData> => {
  const db: Db = Database.getInstance();

  const game = gameId
    ? await db.query.gamesTable.findFirst({
        where: eq(gamesTable.gameId, gameId),
        with: {
          inventory: true,
        },
      })
    : await db.query.gamesTable.findFirst({
        with: {
          inventory: true,
        },
      });

  if (!game) {
    throw new Error("Game not found");
  }

  return {
    gameId: game.gameId,
    createdAt: game.createdAt.toISOString(),
    isActive: game.isActive,
    expectedItem: Item.fromName(game.expectedItemName),
    inventory: game.inventory.map((inventoryItem) =>
      Item.fromName(inventoryItem.itemName),
    ),
  };
};

export const getInventory = async ({
  gameId,
}: z.infer<typeof getInventoryRoute.request.query>): Promise<InventoryData> => {
  const db: Db = Database.getInstance();

  if (!gameId) {
    gameId = (await getGame()).gameId;
  }

  const inventory = await db.query.inventoriesTable.findMany({
    where: eq(inventoriesTable.gameId, gameId),
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory.map((inventoryItem) =>
    Item.fromName(inventoryItem.itemName),
  );
};
