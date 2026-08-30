// import { Item, Recipe, ShapedRecipe } from "@workspace/minecraft/";
// import { Database, Db } from "@workspace/db";
// import { gamesTable, inventoriesTable } from "@workspace/db/schema";
// import {
//   getGameRoute,
//   getInventoryRoute,
// } from "@workspace/api/routes/minecraft";
// import { z } from "@hono/zod-openapi";
// import { eq } from "drizzle-orm";
// import { GameData, InventoryData } from "@workspace/contracts/minecraft";

// // const RED_HERRINGS = 4;

// // export const generateGame = async (): Promise<GameData> => {
// //   const db: Db = Database.getInstance();

// //   const newGame = await db
// //     .insert(gamesTable)
// //     .values({
// //       expectedItemName: Item.getRandomItem().name,
// //       isActive: true,
// //     })
// //     .returning();

// //   // Generate x red herrings
// //   const inventory: Item[] = [];
// //   for (let i = 0; i < RED_HERRINGS; i++) {
// //     const item: Item = Item.getRandomItem();
// //     const recipes: Recipe[] = item.getRecipes();
// //     const chosenRecipe: Recipe | undefined =
// //       recipes[Math.floor(Math.random() * recipes.length)];

// //     if (!chosenRecipe) {
// //       throw new Error(`Item doesn't have recipe: ${item.displayName}`);
// //     }

// //     if (chosenRecipe instanceof ShapedRecipe) {
// //       chosenRecipe.inShape.forEach((shapeRow) => {

// //       })
// //     } else {

// //     }
// //   }

// //   //TODO: make our own inShape type, parse the recipeItems

// //   return newGame;
// // };

// export const getGame = async ({
//   gameId,
// }: z.infer<typeof getGameRoute.request.params>): Promise<GameData> => {
//   const db: Db = Database.getInstance();

//   const game = gameId
//     ? await db.query.gamesTable.findFirst({
//         where: eq(gamesTable.gameId, gameId),
//         with: {
//           inventory: true,
//         },
//       })
//     : await db.query.gamesTable.findFirst({
//         with: {
//           inventory: true,
//         },
//       });

//   if (!game) {
//     throw new Error("Game not found");
//   }

//   return {
//     gameId: game.gameId,
//     createdAt: game.createdAt.toISOString(),
//     isActive: game.isActive,
//     expectedItem: Item.fromName(game.expectedItemName),
//     inventory: game.inventory.map((inventoryItem) =>
//       Item.fromName(inventoryItem.itemName),
//     ),
//   };
// };

// export const getInventory = async ({
//   gameId,
// }: z.infer<
//   typeof getInventoryRoute.request.params
// >): Promise<InventoryData> => {
//   const db: Db = Database.getInstance();

//   const inventory = await db.query.inventoriesTable.findMany({
//     where: eq(inventoriesTable.gameId, gameId),
//   });

//   if (!inventory) {
//     throw new Error("Inventory not found");
//   }

//   return inventory.map((inventoryItem) =>
//     Item.fromName(inventoryItem.itemName),
//   );
// };
