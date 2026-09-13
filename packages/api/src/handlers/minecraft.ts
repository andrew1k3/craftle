import {
  Item,
  Recipe,
  ShapedRecipe,
  ShapelessRecipe,
} from "@workspace/minecraft";
import { Database, Db } from "@workspace/db";
import { gameTable, guessTable, inventoryTable } from "@workspace/db/schema";
import {
  deleteGameRoute,
  getGameRoute,
  getGuessesRoute,
  getInventoryRoute,
} from "../routes/minecraft";
import { z } from "@hono/zod-openapi";
import { desc, eq, and } from "drizzle-orm";
import {
  GameData,
  GuessData,
  GuessParamsData,
  GuessResultData,
  InventoryData,
  ItemData,
} from "@workspace/contracts/minecraft";
import { HTTPException } from "hono/http-exception";
import { User } from "@workspace/auth";

export const RED_HERRINGS = 4;
export const MAX_TURNS = 5;

function randomChoice<T>(list: T[]): T | undefined {
  return list[Math.floor(Math.random() * list.length)];
}

function getIngredients(recipe: Recipe): { item: Item; count: number }[] {
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
        count: count,
      };
    });
  } else if (recipe instanceof ShapelessRecipe) {
    return recipe.ingredients.map((item: Item) => {
      return { item: item, count: item.count ?? 1 };
    });
  }

  throw new Error("Recipe is not of type ShapedRecipe or ShapelessRecipe");
}

export const getLatestGameId = async (): Promise<number> => {
  const db: Db = Database.getInstance();

  const response: { gameId: number } | undefined =
    await db.query.gameTable.findFirst({
      columns: {
        gameId: true,
      },
      orderBy: desc(gameTable.gameId),
    });

  if (!response) {
    throw new HTTPException(500, { message: "No games in database" });
  }

  return response.gameId;
};

export const generateGame = async (): Promise<GameData> => {
  const db: Db = Database.getInstance();

  const expectedItem: Item = Item.getRandomItem();

  const [newGame] = await db
    .insert(gameTable)
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
  const chosenRecipe: Recipe = randomChoice(Recipe.fromItem(expectedItem))!;
  getIngredients(chosenRecipe).forEach((ingredient) => {
    inventory.push({
      item: ingredient.item,
      fromRecipe: chosenRecipe,
      count: ingredient.count,
    });
  });

  for (let i = 0; i < RED_HERRINGS; i++) {
    const item: Item = Item.getRandomItem();
    const recipes: Recipe[] = item.getRecipes();
    const chosenRecipe: Recipe = randomChoice(recipes)!;
    getIngredients(chosenRecipe).forEach((ingredient) => {
      inventory.push({
        item: ingredient.item,
        fromRecipe: chosenRecipe,
        count: ingredient.count,
      });
    });
  }

  inventory.forEach(
    async (
      {
        item,
        fromRecipe,
        count,
      }: { item: Item; fromRecipe: Recipe; count: number },
      index,
    ) => {
      await db.insert(inventoryTable).values({
        gameId: newGame.gameId,
        slot: index,
        count: count,
        itemName: item.name,
        itemId: item.id,
        fromRecipeName: fromRecipe.result?.name,
      });
    },
  );

  return await getGame({ gameId: newGame.gameId });
};

export const getGame = async ({
  gameId,
}: z.infer<typeof getGameRoute.request.query> = {}): Promise<GameData> => {
  const db: Db = Database.getInstance();

  if (!gameId) {
    gameId = await getLatestGameId();
  }

  const game = await db.query.gameTable.findFirst({
    where: eq(gameTable.gameId, gameId),
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
    gameId = await getLatestGameId();
  }

  const inventory = await db.query.inventoryTable.findMany({
    where: eq(inventoryTable.gameId, gameId),
  });

  if (!inventory) {
    throw new HTTPException(404, { message: "Inventory not found" });
  }

  return inventory.map(
    (inventoryItem) => new Item(inventoryItem.itemId, inventoryItem.count),
  );
};

export const deleteGame = async ({
  gameId,
}: z.infer<typeof deleteGameRoute.request.query>): Promise<{
  message: string;
}> => {
  const db: Db = Database.getInstance();

  if (!gameId) {
    gameId = await getLatestGameId();
  }

  const result = await db
    .delete(gameTable)
    .where(eq(gameTable.gameId, gameId))
    .returning();

  console.log(result);

  if (!result) {
    throw new HTTPException(500, { message: "Failed to delete the game" });
  }

  if (result.length === 0) {
    throw new HTTPException(404, { message: "Game not found" });
  }

  return { message: `Game ${gameId} deleted successfully` };
};

export const getGuesses = async (
  { gameId }: z.infer<typeof getGuessesRoute.request.query>,
  user: User,
): Promise<GuessData[]> => {
  const db: Db = Database.getInstance();

  if (!gameId) {
    gameId = await getLatestGameId();
  }

  const userId = user.id;

  if (userId === "") {
    throw new Error("User id is an empty string");
  }

  const result = await db.query.guessTable.findMany({
    where: and(eq(guessTable.userId, userId), eq(guessTable.gameId, gameId)),
  });

  return result;
};

export const guess = async (
  { gameId, turn, guessItemId, guessRecipe }: GuessParamsData,
  user: User,
): Promise<GuessResultData> => {
  // const db: Db = Database.getInstance();

  const lastetGameId = await getLatestGameId();

  if (gameId != lastetGameId) {
    throw new HTTPException(403, {
      message: `User guessed for a stale game id. Expected ${lastetGameId}, got ${gameId}`,
    });
  }

  await parseGuess({ gameId, turn, guessItemId, guessRecipe }, user);

  // // test if this is the correct guess (retrieve game stats)
  // if (isGuessCorrect(guessItemId)) {
  // }

  // // place guess in table



  // fake atm
  return {
    result: [
      ["correct", "incorrect"],
      ["incorrect", "correct"],
    ],
    win: false,
    turn: turn + 1,
    message: "Guess result",
  };
};

async function parseGuess(
  { gameId, turn, guessItemId, guessRecipe }: GuessParamsData,
  user: User,
): Promise<void> {
  const latestGame: GameData = await getGame({ gameId });

  if (!latestGame.isActive) {
    throw new HTTPException(403, {
      message: "Game is not active",
    });
  }

  const previousGuesses: GuessData[] = await getGuesses({ gameId }, user);

  if (previousGuesses.length === 0) {
    return;
  }

  const latestGuess: GuessData = previousGuesses.sort(
    (a, b) => b.turn - a.turn,
  )[0]!;
  const lastTurn = latestGuess.turn;

  if (turn !== lastTurn + 1) {
    throw new HTTPException(403, {
      message: `Turn doesn't match the latest turn. Expected ${lastTurn + 1}, got ${turn}`,
    });
  }

  if (turn > MAX_TURNS) {
    throw new HTTPException(403, {
      message: `Turn exceeds the maximum number of turns. Expected ${MAX_TURNS}, got ${turn}`,
    });
  }

  let item: Item;
  try {
    item = Item.fromId(guessItemId);
  } catch {
    throw new HTTPException(403, {
      message: `Guessed item id couldn't be parsed. Item id: ${guessItemId}`,
    });
  }

  let recipes: Recipe[];
  try {
    recipes = Recipe.fromItemId(guessItemId);
  } catch {
    throw new HTTPException(403, {
      message: `Guessed item id doesn't have recipes that exist. Item id: ${guessItemId}`,
    });
  }

  if (
    item
      .getRecipes()
      .map((recipe) => recipe.id)
      .includes(guessRecipe)
  ) {
    throw new HTTPException(403, {
      message: `Guessed recipe id doesn't match any of the recipes for the guessed item. Item id: ${guessItemId}, Recipe id: ${guessRecipe}, Recipes: ${recipes.map((recipe) => recipe.id).join(", ")}`,
    });
  }

  // test if we can get this recipe from the ingredients available
  const inventory: InventoryData = latestGame.inventory;
  let recipe: Recipe;
  try {
    recipe = Recipe.fromId(guessRecipe);
  } catch {
    throw new HTTPException(403, {
      message: `Guessed recipe id doesn't exist. Recipe id: ${guessRecipe}`,
    });
  }

  const ingredients: { item: Item; count: number }[] = getIngredients(recipe);
  ingredients.forEach((ingredient) => {
    const inventoryItem: ItemData | undefined = inventory.find(
      (item) => item.id === ingredient.item.id,
    );
    if (!inventoryItem) {
      throw new HTTPException(403, {
        message: `Guessed recipe requires an ingredient that is not in the inventory. Ingredient: ${ingredient.item.name}, Recipe id: ${guessRecipe}`,
      });
    }
    if (inventoryItem.count && inventoryItem.count < ingredient.count) {
      throw new HTTPException(403, {
        message: `Guessed recipe requires more of an ingredient than is in the inventory. Ingredient: ${ingredient.item.name}, Required: ${ingredient.count}, In inventory: ${inventoryItem.count}, Recipe id: ${guessRecipe}`,
      });
    }
  });
}

// function isGuessCorrect(guessItemId: number) {
//   throw new Error("Function not implemented.");
// }
