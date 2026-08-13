import { mergeSchema } from "better-auth/db";
import { error } from "console";
import MinecraftData from "minecraft-data";

const mcData: MinecraftData.IndexedData = MinecraftData(
  process.env.MC_VERSION!,
);

export interface Item {
  id: number;
  recipes: Recipe[];
}

export class Item implements Item {
  id: number;
  recipes: Recipe[];

  public constructor(item: MinecraftData.RecipeItem) {
    if (typeof item === "object" || !item) {
      throw new Error(`${item} doesn't follow number datatype.`);
    }
    this.id = item;
    this.recipes =
  }
}

export interface Recipe {
  result: Item;
}

export interface ShapelessRecipe extends Recipe {
  ingredients: Item[];
}

export interface ShapedRecipe extends Recipe {
  inShape: MinecraftData.Shape;
}

class RecipeFactory {
  static createRecipe(recipe: MinecraftData.Recipe): Recipe {
    if ("inShape" in recipe) {
      return;
    }
  }
}

export class ShapelessRecipe implements ShapelessRecipe {
  public result: Item;

  public constructor(shapelessRecipe: MinecraftData.ShapelessRecipe) {
    this.result = Item(shapelessRecipe.result);
  }
}

function test() {
  console.log(process.env.MC_VERSION!);
  const itemName = "glass_bottle";
  const item: MinecraftData.Item = mcData.itemsByName[itemName]!;
  console.log(item.id, item.displayName);
  console.log(mcData.items[item.id]);
  // console.log(mcData.itemsByName["stone"]!);

  const recipes: MinecraftData.Recipe[] = mcData.recipes[item.id]!;

  recipes.forEach((recipe: MinecraftData.Recipe) => {
    if ("inShape" in recipe) {
      const inShape: MinecraftData.Shape = recipe.inShape;
      console.log(
        inShape.map((shapeRow: MinecraftData.ShapeRow) => {
          return shapeRow.map((recipeItem: MinecraftData.RecipeItem) => {
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
      recipe.ingredients.forEach((recipeItem: MinecraftData.RecipeItem) => {
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
