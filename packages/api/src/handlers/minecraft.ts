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
import { HTTPException } from "hono/http-exception";

const RED_HERRINGS = 4;

function randomChoice<T>(list: T[]): T | undefined {
  return list[Math.floor(Math.random() * list.length)];
}

const getIngredients = (
  recipe: Recipe,
): { item: Item; fromRecipe: Recipe; count: number }[] => {
  if (recipe instanceof ShapedRecipe) {
    const ingredientsCount: Map<number, number> = new Map();
    recipe.shape.flat().forEach((item) => {
      if (item) {
        ingredientsCount.set(item.id, (ingredientsCount.get(item.id) ?? 0) + 1);
      }
    });
    return Array.from(ingredientsCount.entries()).map(([itemId, count]) => {
      return {
        item: Item.fromId(itemId),
        fromRecipe: recipe,
        count: count,
      };
    });
  } else if (recipe instanceof ShapelessRecipe) {
    return recipe.ingredients.map((item: Item) => {
      return { item: item, fromRecipe: recipe, count: item.count ?? 1 };
    });
  }

  throw new Error("Recipe is not of type ShapedRecipe or ShapelessRecipe");
};

export const generateGame = async (): Promise<GameData> => {
  const db: Db = Database.getInstance();

  const expectedItem: Item = Item.getRandomItem();

  const [newGame] = await db
    .insert(gamesTable)
    .values({
      expectedItemName: expectedItem.name,
      expectedItemId: expectedItem.id,
      isActive: true,
    })
    .returning();

  if (!newGame) {
    throw new HTTPException(500, { message: "Failed to create a new game" });
  }

  const inventory: { item: Item; fromRecipe: Recipe; count: number }[] = [];
  inventory.push(
    ...getIngredients(randomChoice(Recipe.fromItem(expectedItem))!),
  );

  for (let i = 0; i < RED_HERRINGS; i++) {
    const item: Item = Item.getRandomItem();
    const recipes: Recipe[] = item.getRecipes();
    const chosenRecipe: Recipe = randomChoice(recipes)!;
    inventory.push(...getIngredients(chosenRecipe));
  }

  inventory.forEach(async ({ item, fromRecipe, count }, index) => {
    await db.insert(inventoriesTable).values({
      gameId: newGame.gameId,
      slot: index,
      count: count,
      itemName: item.name,
      itemId: item.id,
      fromRecipeName: fromRecipe.result?.name,
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
    throw new HTTPException(404, { message: "Game not found" });
  }

  return {
    gameId: game.gameId,
    createdAt: game.createdAt.toISOString(),
    isActive: game.isActive,
    expectedItem: Item.fromId(game.expectedItemId),
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
    throw new HTTPException(404, { message: "Inventory not found" });
  }

  return inventory.map(
    (inventoryItem) => new Item(inventoryItem.itemId, inventoryItem.count),
  );
};
