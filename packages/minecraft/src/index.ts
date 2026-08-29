import MinecraftData from "minecraft-data";
import MinecraftAssets = require("minecraft-assets");
import {
  ItemData,
  RecipeData,
  ShapelessRecipeData,
  ShapedRecipeData,
} from "@workspace/contracts/minecraft";
import "dotenv/config";

const mcVersion = process.env.MC_VERSION;
const mcData: MinecraftData.IndexedData = MinecraftData(mcVersion!);
const mcAssets = MinecraftAssets(mcVersion!);
const itemsToRecipes: Map<number, Recipe[]> = new Map();
const recipeToItem: Map<string, Item> = new Map();

export class Item implements ItemData {
  id: number;
  name: string;
  displayName: string;
  stackSize: number;
  image: string;

  public constructor(id: number) {
    const item: MinecraftData.Item | undefined = mcData.items[id];
    if (!item) {
      throw new Error(`Item with id: ${id} does not exist`);
    }

    this.id = id;
    this.name = item.name;
    this.displayName = item.displayName;
    this.stackSize = item.stackSize;
    this.image = mcAssets.textureContent[this.name].texture;
  }

  public static fromRecipe(recipe: Recipe): Item {
    const item: Item = recipeToItem.get(recipe.id)!;
    if (!item) {
      throw new Error(
        `Item for recipe: ${JSON.stringify(recipe)} does not exist`,
      );
    }
    return item;
  }

  public static fromRecipeItem(recipeItem: MinecraftData.RecipeItem): Item {
    if (!recipeItem) {
      throw new Error("recipeItem is null");
    }

    let item: MinecraftData.Item;
    if (typeof recipeItem === "number") {
      const foundItem = mcData.items[recipeItem];
      if (!foundItem) {
        throw new Error(`Item with id: ${recipeItem} does not exist`);
      }
      item = foundItem;
    } else if (recipeItem instanceof Array) {
      if (recipeItem[0] == null) {
        throw new Error("Empty list for recipeItem");
      }
      const foundItem = mcData.items[recipeItem[0]];
      if (!foundItem) {
        throw new Error(`Item with id: ${recipeItem[0]} does not exist`);
      }
      item = foundItem;
    } else {
      if (recipeItem?.id == null) {
        throw new Error(
          `Empty id for recipeItem: ${JSON.stringify(recipeItem)}`,
        );
      }
      const foundItem = mcData.items[recipeItem.id];
      if (!foundItem) {
        throw new Error(`Item with id: ${recipeItem.id} does not exist`);
      }
      item = foundItem;
    }

    return new Item(item.id);
  }

  public static fromId(id: number): Item {
    return new Item(id);
  }

  public static fromItem(item: MinecraftData.Item): Item {
    return new Item(item.id);
  }

  public static fromName(name: string): Item {
    const item: MinecraftData.Item | undefined = mcData.itemsByName[name];
    if (!item) {
      throw new Error(`Item with name: ${name} does not exist`);
    }
    return new Item(item.id);
  }

  public static fromDisplayName(name: string): Item {
    return this.fromName(name.replace(" ", "_").toLowerCase());
  }
}

export abstract class Recipe implements RecipeData {
  public result: Item;
  public abstract id: string;

  public constructor(recipe: MinecraftData.Recipe) {
    this.result = Item.fromRecipeItem(recipe.result);
  }

  public static fromItem(item: Item): Recipe[] {
    const recipes: Recipe[] = itemsToRecipes.get(item.id)!;
    if (!recipes) {
      throw new Error(`Recipes for item: ${JSON.stringify(item)} do not exist`);
    }
    return recipes;
  }

  public static fromId(id: number): Recipe[] {
    const recipes: Recipe[] = itemsToRecipes.get(id)!;
    if (!recipes) {
      throw new Error(`Recipes for item: ${id} do not exist`);
    }
    return recipes;
  }
}

export class ShapelessRecipe extends Recipe implements ShapelessRecipeData {
  public override id: string;
  public ingredients: Item[];

  public constructor(shapelessRecipe: MinecraftData.ShapelessRecipe) {
    super(shapelessRecipe);
    this.ingredients = shapelessRecipe.ingredients.map(Item.fromRecipeItem);
    this.id = `shapeless_${this.ingredients.map((ingredient) => ingredient.id).join("_")}__${this.result.id}`;
  }
}

export class ShapedRecipe extends Recipe implements ShapedRecipeData {
  public override id: string;
  public inShape: MinecraftData.Shape;

  public constructor(shapedRecipe: MinecraftData.ShapedRecipe) {
    super(shapedRecipe);
    this.inShape = shapedRecipe.inShape;
    this.id = `shaped_${this.inShape.map((row) => row.join("")).join("_")}__${this.result.id}`;
  }

  public getId(): string {
    return this.id;
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

function init() {
  if (!mcVersion) {
    throw new Error("MC_VERSION environment variable is not set");
  }

  if (!mcData) {
    throw new Error(
      `Minecraft data for version ${mcVersion} could not be loaded`,
    );
  }

  Object.entries(mcData.recipes).forEach(([id, mcDataRecipes]) => {
    const recipes: Recipe[] = mcDataRecipes.map(RecipeFactory.createRecipe);
    const item: Item = Item.fromId(Number(id));
    itemsToRecipes.set(item.id, recipes);
    recipes.forEach((recipe) => {
      recipeToItem.set(recipe.id, item);
    });
  });
}

init();
