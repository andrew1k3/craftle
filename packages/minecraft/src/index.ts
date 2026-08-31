import MinecraftData from "minecraft-data";
import {
  ItemData,
  RecipeData,
  ShapelessRecipeData,
  ShapedRecipeData,
} from "@workspace/contracts/minecraft";
import "dotenv/config";

const mcVersion = process.env.MC_VERSION;
const mcData: MinecraftData.IndexedData = MinecraftData(mcVersion!);
const mcAssets = require("minecraft-assets")(mcVersion!);
const itemsToRecipes: Map<number, Recipe[]> = new Map();
const recipeToItem: Map<string, Item> = new Map();
const items: Map<number, Item> = new Map();
const itemsArray: Item[] = [];

export class Item implements ItemData {
  id: number;
  name: string;
  displayName: string;
  stackSize: number;
  image: string;
  count?: number;

  public constructor(id: number, count: number = 1) {
    const item: MinecraftData.Item | undefined = mcData.items[id];
    if (!item) {
      throw new Error(`Item with id: ${id} does not exist`);
    }

    this.id = id;
    this.name = item.name;
    this.displayName = item.displayName;
    this.stackSize = item.stackSize;
    this.image = mcAssets.textureContent[this.name].texture;
    this.count = count;
  }

  public getRecipes(): Recipe[] {
    return itemsToRecipes.get(this.id) ?? [];
  }

  public static getRandomItem(): Item {
    return itemsArray[Math.floor(Math.random() * itemsArray.length)]!;
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
    let count = 1;
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
      if (!recipeItem.id) {
        throw new Error(
          `Empty id for recipeItem: ${JSON.stringify(recipeItem)}`,
        );
      }
      const foundItem = mcData.items[recipeItem.id];
      if (!foundItem) {
        throw new Error(`Item with id: ${recipeItem.id} does not exist`);
      }
      count = recipeItem.count ?? 1;
      item = foundItem;
    }

    return new Item(item.id, count);
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
  public result?: Item;
  public abstract id: string;

  public constructor(result: Item | undefined) {
    this.result = result;
  }

  public hasResult(): boolean {
    return recipeToItem.get(this.id) !== undefined;
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

  public constructor(
    ingredients: Item[],
    result: Item | undefined = undefined,
  ) {
    super(result);
    this.ingredients = ingredients;
    this.id = `shapeless_${ingredients.map((ingredient) => ingredient.id).join("_")}`;
  }

  public static fromShapelessRecipe(
    shapelessRecipe: MinecraftData.ShapelessRecipe,
  ) {
    const ingredients: Item[] = shapelessRecipe.ingredients.map(
      Item.fromRecipeItem,
    );
    return new ShapelessRecipe(
      ingredients,
      Item.fromRecipeItem(shapelessRecipe.result),
    );
  }
}

export class ShapedRecipe extends Recipe implements ShapedRecipeData {
  public override id: string;
  public shape: (Item | null)[][];

  public constructor(
    shape: MinecraftData.Shape,
    result: Item | undefined = undefined,
  ) {
    super(result);
    this.shape = shape.map((shapeRow) =>
      shapeRow.map((item) => {
        try {
          return Item.fromRecipeItem(item);
        } catch {
          return null;
        }
      }),
    );
    this.id = `shaped_${shape.map((row) => row.join("")).join("_")}`;
  }

  public static fromShapedRecipe(shapedRecipe: MinecraftData.ShapedRecipe) {
    return new ShapedRecipe(
      shapedRecipe.inShape,
      Item.fromRecipeItem(shapedRecipe.result),
    );
  }
}

export class RecipeFactory {
  public static createRecipe(recipe: MinecraftData.Recipe): Recipe {
    if ("inShape" in recipe) {
      const shapedRecipe = recipe as MinecraftData.ShapedRecipe;
      return ShapedRecipe.fromShapedRecipe(shapedRecipe);
    } else if ("ingredients" in recipe) {
      const shapelessRecipe = recipe as MinecraftData.ShapelessRecipe;
      return ShapelessRecipe.fromShapelessRecipe(shapelessRecipe);
    } else {
      throw new Error(`Unknown recipe type: ${JSON.stringify(recipe)}`);
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
    items.set(item.id, item);
    itemsArray.push(item);
    itemsToRecipes.set(item.id, recipes);
    recipes.forEach((recipe) => {
      recipeToItem.set(recipe.id, item);
    });
  });
}

init();
