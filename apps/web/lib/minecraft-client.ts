import { mergeSchema } from "better-auth/db";
import { error } from "console";
import MinecraftData, {
  IndexedBlock,
  IndexedData,
  Item,
  Recipe,
  RecipeItem,
  Shape,
  ShapedRecipe,
  ShapeRow,
} from "minecraft-data";

const mcData: IndexedData = MinecraftData(process.env.MC_VERSION!);

function test() {
  console.log(process.env.MC_VERSION!);
  const itemName = "glass_bottle";
  const item: Item = mcData.itemsByName[itemName]!;
  console.log(item.id, item.displayName);
  console.log(mcData.items[item.id]);
  // console.log(mcData.itemsByName["stone"]!);

  const recipes: Recipe[] = mcData.recipes[item.id]!;

  recipes.forEach((recipe: Recipe) => {
    if ("inShape" in recipe) {
      const inShape: Shape = recipe.inShape;
      console.log(
        inShape.map((shapeRow: ShapeRow) => {
          return shapeRow.map((recipeItem: RecipeItem) => {
            if (!recipeItem) {
              return "";
            }
            if (typeof recipeItem === "object") {
              throw new Error("errorrrrr");
            }
            return mcData.items[recipeItem]?.name;
          });
        }),
      );
    } else {
      recipe.ingredients.forEach((recipeItem: RecipeItem) => {
        if (typeof recipeItem === "object") {
          throw new Error("errorrrrr");
        }
        console.log(mcData.items[recipeItem]);
        // console.log(recipeItem);
      });
    }
  });
  // const recipesEntries: [string, Recipe[]][] = Object.entries(mcData.recipes);

  // recipesEntries.forEach(([_, recipes]: [string, Recipe[]]) => {
  // recipes.forEach((recipe: Recipe) => {
  //   if ("inShape" in recipe) {
  //     const inShape: Shape = recipe.inShape;
  //     console.log(
  //       inShape.map((shapeRow: ShapeRow) => {
  //         return shapeRow.map((recipeItem: RecipeItem) => {
  //           if (!recipeItem) {
  //             return "";
  //           }
  //           if (typeof recipeItem === "object") {
  //             throw new Error("errorrrrr");
  //           }
  //           return mcData.items[recipeItem]?.name;
  //         });
  //       }),
  //     );
  //   } else {
  //     recipe.ingredients.forEach((recipeItem: RecipeItem) => {
  //       if (typeof recipeItem === "object") {
  //         throw new Error("errorrrrr");
  //       }
  //       console.log(mcData.items[recipeItem]);
  //       // console.log(recipeItem);
  //     });
  //   }
  // });
  // });
}

test();
