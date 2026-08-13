import MinecraftData from "minecraft-data";
import "dotenv/config";

console.log("cwd:", process.cwd());
console.log("MC_VERSION:", process.env.MC_VERSION);

const mcVersion = process.env.MC_VERSION;

if (!mcVersion) {
  throw new Error("MC_VERSION environment variable is not set");
}

const mcData: MinecraftData.IndexedData = MinecraftData(mcVersion);

if (!mcData) {
  throw new Error(
    `Minecraft data for version ${mcVersion} could not be loaded`,
  );
}

export type Shape = MinecraftData.Shape;
export type Recipes = Recipe[];

interface IItem {
  id: number;
  displayName: string;
  stackSize: number;
  recipes?: Recipes | undefined;
}

interface IRecipe {
  result: Item;
}

interface IShapelessRecipe extends IRecipe {
  ingredients: Item[];
}

interface IShapedRecipe extends IRecipe {
  inShape: Shape;
}

export class Item implements IItem {
  id: number;
  displayName: string;
  stackSize: number;
  recipes?: Recipes | undefined;

  private constructor(id: number, displayName: string, stackSize: number) {
    this.id = id;
    this.displayName = displayName;
    this.stackSize = stackSize;

    const recipes: MinecraftData.Recipe[] = mcData.recipes[this.id]!;
    if (recipes) {
      this.recipes = recipes.map(RecipeFactory.createRecipe);
    }
  }

  public hasRecipe(): boolean {
    return this.recipes != undefined;
  }

  public static fromRecipeItem(recipeItem: MinecraftData.RecipeItem): Item {
    if (typeof recipeItem !== "number") {
      throw new Error(`${recipeItem} doesn't follow the id datatype.`);
    }
    const item: MinecraftData.Item = mcData.items[recipeItem]!;
    return new Item(item.id, item.displayName, item.stackSize);
  }

  public static fromItem(item: MinecraftData.Item): Item {
    return new Item(item.id, item.displayName, item.stackSize);
  }

  public static fromId(id: number): Item {
    const item: MinecraftData.Item | undefined = mcData.items[id];
    if (!item) {
      throw new Error(`Item with id: ${id} does not exist`);
    }
    return new Item(item.id, item.displayName, item.stackSize);
  }

  public static fromDisplayName(displayName: string): Item {
    const item: MinecraftData.Item | undefined =
      mcData.itemsByName[displayName];
    if (!item) {
      throw new Error(`Item with name: ${displayName} does not exist`);
    }
    return new Item(item.id, item.displayName, item.stackSize);
  }
}

export class Recipe implements IRecipe {
  public result: Item;
  public constructor(recipe: MinecraftData.Recipe) {
    this.result = Item.fromRecipeItem(recipe.result);
  }
}

export class ShapelessRecipe extends Recipe implements IShapelessRecipe {
  public ingredients: Item[];

  public constructor(shapelessRecipe: MinecraftData.ShapelessRecipe) {
    super(shapelessRecipe);
    this.ingredients = shapelessRecipe.ingredients.map(Item.fromRecipeItem);
  }
}

export class ShapedRecipe extends Recipe implements IShapedRecipe {
  public inShape: MinecraftData.Shape;

  public constructor(shapedRecipe: MinecraftData.ShapedRecipe) {
    super(shapedRecipe);
    this.inShape = shapedRecipe.inShape;
  }
}

export class RecipeFactory {
  public static createRecipe(recipe: MinecraftData.Recipe): Recipe {
    if ("inShape" in recipe) {
      return new ShapedRecipe(recipe);
    } else {
      return new ShapelessRecipe(recipe);
    }
  }
}
