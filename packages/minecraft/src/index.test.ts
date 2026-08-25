import { describe, it, expect } from "vitest";
import MinecraftData from "minecraft-data";

import {
  Item,
  Recipe,
  RecipeFactory,
  ShapedRecipe,
  ShapelessRecipe,
} from "./index";

import "dotenv/config";

const findRecipe = (
  predicate: (recipe: MinecraftData.Recipe) => boolean,
): MinecraftData.Recipe => {
  const mcVersion = process.env.MC_VERSION!;
  const mcData = MinecraftData(mcVersion);
  const recipe = Object.values(mcData.recipes)
    .flat()
    .find((candidate): candidate is MinecraftData.Recipe => {
      return !!candidate && predicate(candidate);
    });

  expect(recipe).toBeDefined();

  return recipe!;
};

describe("minecraft-client", () => {
  describe("test setup", () => {
    it("should have MC_VERSION configured", () => {
      expect(process.env.MC_VERSION).toBeDefined();
      expect(process.env.MC_VERSION).not.toBe("");
    });

    it("should load minecraft-data for the configured version", () => {
      const mcVersion = process.env.MC_VERSION;

      expect(mcVersion).toBeDefined();

      if (!mcVersion) {
        throw new Error("MC_VERSION is not set");
      }

      const mcData = MinecraftData(mcVersion);

      expect(mcData).toBeDefined();
      expect(mcData.items).toBeDefined();
      expect(mcData.itemsByName).toBeDefined();
      expect(mcData.recipes).toBeDefined();
    });
  });

  describe("Item", () => {
    describe("fromDisplayName", () => {
      it("should create an item from a display name", () => {
        const item = Item.fromDisplayName("stone");

        expect(item).toBeInstanceOf(Item);
        expect(item.displayName).toBe("Stone");
        expect(item.id).toBeGreaterThanOrEqual(0);
        expect(item.stackSize).toBeGreaterThan(0);
      });

      it("should create an item for another known display name", () => {
        const item = Item.fromDisplayName("dirt");

        expect(item).toBeInstanceOf(Item);
        expect(item.displayName).toBe("Dirt");
      });

      it("should throw for an item that does not exist", () => {
        expect(() => {
          Item.fromDisplayName("this_item_definitely_does_not_exist");
        }).toThrow(
          "Item with name: this_item_definitely_does_not_exist does not exist",
        );
      });

      it("should preserve the minecraft-data item id", () => {
        const item = Item.fromDisplayName("stone");

        expect(item.id).toBeTypeOf("number");
        expect(item.id).toBeGreaterThanOrEqual(0);
      });

      it("should preserve the minecraft-data stack size", () => {
        const item = Item.fromDisplayName("stone");

        expect(item.stackSize).toBe(64);
      });
    });

    describe("fromId", () => {
      it("should create an item from an id", () => {
        const stone = Item.fromDisplayName("stone");
        const item = Item.fromId(stone.id);

        expect(item).toBeInstanceOf(Item);
        expect(item.id).toBe(stone.id);
        expect(item.displayName).toBe(stone.displayName);
        expect(item.stackSize).toBe(stone.stackSize);
      });

      it("should create the same item when converting from name to id", () => {
        const fromName = Item.fromDisplayName("stone");
        const fromId = Item.fromId(fromName.id);

        expect(fromId).toEqual(fromName);
      });

      it("should throw for an invalid positive id", () => {
        expect(() => {
          Item.fromId(Number.MAX_SAFE_INTEGER);
        }).toThrow(`Item with id: ${Number.MAX_SAFE_INTEGER} does not exist`);
      });

      it("should throw for a negative id", () => {
        expect(() => {
          Item.fromId(-1);
        }).toThrow("Item with id: -1 does not exist");
      });

      it("should throw for an id that is not present", () => {
        expect(() => {
          Item.fromId(999999999);
        }).toThrow("Item with id: 999999999 does not exist");
      });
    });

    describe("fromItem", () => {
      it("should create an Item from minecraft-data item data", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);
        const stone = mcData.itemsByName.stone;

        expect(stone).toBeDefined();

        const item = Item.fromItem(stone!);

        expect(item).toBeInstanceOf(Item);
        expect(item.id).toBe(stone!.id);
        expect(item.displayName).toBe(stone!.displayName);
        expect(item.stackSize).toBe(stone!.stackSize);
      });

      it("should create equivalent items using fromItem and fromDisplayName", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);
        const stone = mcData.itemsByName.stone!;

        const fromItem = Item.fromItem(stone);
        const fromName = Item.fromDisplayName("stone");

        expect(fromItem).toEqual(fromName);
      });

      it("should create an Item with the source item's properties", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);
        const dirt = mcData.itemsByName.dirt!;

        const item = Item.fromItem(dirt);

        expect(item).toMatchObject({
          id: dirt.id,
          displayName: dirt.displayName,
          stackSize: dirt.stackSize,
        });
      });
    });
  });

  describe("Item", () => {
    describe("fromRecipeItem", () => {
      it("should create an Item from a numeric recipe item id", () => {
        const stoneId = Item.fromDisplayName("stone").id;

        const item = Item.fromRecipeItem(stoneId);

        expect(item).toBeInstanceOf(Item);
        expect(item.id).toBe(stoneId);
        expect(item.displayName).toBe("Stone");
      });

      it("should create an Item from an array recipe item id", () => {
        const stoneId = Item.fromDisplayName("stone").id;

        const item = Item.fromRecipeItem([stoneId]);

        expect(item).toBeInstanceOf(Item);
        expect(item.id).toBe(stoneId);
      });

      it("should create an Item from a recipe item object", () => {
        const stoneId = Item.fromDisplayName("stone").id;

        const item = Item.fromRecipeItem({ id: stoneId });

        expect(item).toBeInstanceOf(Item);
        expect(item.id).toBe(stoneId);
      });

      it("should throw when recipeItem is nullish", () => {
        expect(() => Item.fromRecipeItem(null as unknown as number)).toThrow(
          "recipeItem is null",
        );
        expect(() =>
          Item.fromRecipeItem(undefined as unknown as number),
        ).toThrow("recipeItem is null");
      });

      it("should throw when recipeItem is an empty array", () => {
        expect(() => Item.fromRecipeItem([])).toThrow(
          "Empty list for recipeItem",
        );
      });

      it("should throw when recipeItem object has no id", () => {
        expect(() =>
          Item.fromRecipeItem({} as MinecraftData.RecipeItem),
        ).toThrow("Empty id for recipeItem: {}");
      });

      it("should throw when recipeItem references a missing item id", () => {
        expect(() => Item.fromRecipeItem(Number.MAX_SAFE_INTEGER)).toThrow(
          `Item with id: ${Number.MAX_SAFE_INTEGER} does not exist`,
        );
      });

      it("should throw when an array recipeItem references a missing item id", () => {
        expect(() => Item.fromRecipeItem([Number.MAX_SAFE_INTEGER])).toThrow(
          `Item with id: ${Number.MAX_SAFE_INTEGER} does not exist`,
        );
      });

      it("should throw when an object recipeItem references a missing item id", () => {
        expect(() =>
          Item.fromRecipeItem({
            id: Number.MAX_SAFE_INTEGER,
          } as MinecraftData.RecipeItem),
        ).toThrow(`Item with id: ${Number.MAX_SAFE_INTEGER} does not exist`);
      });
    });
  });

  describe("Recipe", () => {
    it("should resolve recipes for a known item instance", () => {
      const item = Item.fromDisplayName("oak_planks");

      const recipes = Recipe.fromItem(item);

      expect(Array.isArray(recipes)).toBe(true);
      expect(recipes.length).toBeGreaterThan(0);
      expect(recipes.every((recipe) => recipe.result instanceof Item)).toBe(
        true,
      );
    });

    it("should resolve recipes by item id", () => {
      const item = Item.fromDisplayName("oak_planks");

      const recipesByItem = Recipe.fromItem(item);
      const recipesById = Recipe.fromId(item.id);

      expect(recipesById).toEqual(recipesByItem);
    });

    it("should resolve the original item from a recipe instance", () => {
      const recipe = findRecipe(
        (candidate) => !!candidate && "inShape" in candidate,
      );
      const createdRecipe = RecipeFactory.createRecipe(recipe);

      expect(Item.fromRecipe(createdRecipe)).toBeInstanceOf(Item);
      expect(Item.fromRecipe(createdRecipe).id).toBe(createdRecipe.result.id);
    });

    it("should throw when recipes are requested for an unknown item id", () => {
      expect(() => Recipe.fromId(Number.MAX_SAFE_INTEGER)).toThrow(
        `Recipes for item: ${Number.MAX_SAFE_INTEGER} do not exist`,
      );
    });

    it("should throw when an item is requested for a recipe id that is not mapped", () => {
      const recipe = RecipeFactory.createRecipe(
        findRecipe((candidate) => !!candidate && "inShape" in candidate),
      );

      const badRecipe = { ...recipe, id: "missing_recipe_id" } as Recipe;

      expect(() => Item.fromRecipe(badRecipe)).toThrow(
        `Item for recipe: ${JSON.stringify(badRecipe)} does not exist`,
      );
    });
  });

  describe("ShapelessRecipe", () => {
    it("should create shapeless recipes with ingredient items", () => {
      const recipe = findRecipe(
        (candidate) => !!candidate && !("inShape" in candidate),
      ) as MinecraftData.ShapelessRecipe;
      const createdRecipe = RecipeFactory.createRecipe(recipe);

      expect(createdRecipe).toBeInstanceOf(ShapelessRecipe);
      if (!(createdRecipe instanceof ShapelessRecipe)) {
        throw new Error("Expected createdRecipe to be a ShapelessRecipe");
      }

      expect(createdRecipe.result).toBeInstanceOf(Item);
      expect(createdRecipe.ingredients).toHaveLength(recipe.ingredients.length);
      expect(
        createdRecipe.ingredients.every(
          (ingredient) => ingredient instanceof Item,
        ),
      ).toBe(true);
      expect(
        createdRecipe.ingredients.map((ingredient) => ingredient.id),
      ).toEqual(
        recipe.ingredients.map(
          (ingredient) => Item.fromRecipeItem(ingredient).id,
        ),
      );
    });

    it("should generate a recipe id based on ingredients and result", () => {
      const recipe = findRecipe(
        (candidate) => !!candidate && !("inShape" in candidate),
      ) as MinecraftData.ShapelessRecipe;
      const createdRecipe = RecipeFactory.createRecipe(
        recipe,
      ) as ShapelessRecipe;

      expect(createdRecipe.id).toContain("shapeless_");
      expect(createdRecipe.id).toContain(String(createdRecipe.result.id));
    });
  });

  describe("ShapedRecipe", () => {
    it("should create shaped recipes with the original inShape data", () => {
      const recipe = findRecipe(
        (candidate) => !!candidate && "inShape" in candidate,
      ) as MinecraftData.ShapedRecipe;
      const createdRecipe = RecipeFactory.createRecipe(recipe);

      expect(createdRecipe).toBeInstanceOf(ShapedRecipe);
      if (!(createdRecipe instanceof ShapedRecipe)) {
        throw new Error("Expected createdRecipe to be a ShapedRecipe");
      }

      expect(createdRecipe.result).toBeInstanceOf(Item);
      expect(createdRecipe.inShape).toEqual(recipe.inShape);
      expect(createdRecipe.inShape).toBeDefined();
    });

    it("should generate a recipe id based on the inShape pattern and result", () => {
      const recipe = findRecipe(
        (candidate) => !!candidate && "inShape" in candidate,
      ) as MinecraftData.ShapedRecipe;
      const createdRecipe = RecipeFactory.createRecipe(recipe) as ShapedRecipe;

      expect(createdRecipe.id).toContain("shaped_");
      expect(createdRecipe.id).toContain(String(createdRecipe.result.id));
      expect(createdRecipe.getId()).toBe(createdRecipe.id);
    });
  });

  describe("RecipeFactory", () => {
    it("should create a shaped recipe from minecraft-data recipe data", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = mcData.recipes[mcData.itemsByName.stone_pickaxe!.id]![0];

      expect(recipe).toBeDefined();

      const createdRecipe: Recipe = RecipeFactory.createRecipe(recipe!);

      expect(createdRecipe).toBeInstanceOf(ShapedRecipe);
      if (!(createdRecipe instanceof ShapedRecipe)) {
        throw new Error("Expected createdRecipe to be a ShapedRecipe");
      }
      expect(createdRecipe.result).toBeInstanceOf(Item);
      expect(createdRecipe.inShape).toBeDefined();
    });

    it("should create a shapeless recipe when recipe data has no inShape", () => {
      const recipe = findRecipe(
        (candidate) => !!candidate && !("inShape" in candidate),
      );

      const createdRecipe: Recipe = RecipeFactory.createRecipe(recipe);

      expect(createdRecipe).toBeInstanceOf(ShapelessRecipe);
      if (!(createdRecipe instanceof ShapelessRecipe)) {
        throw new Error("Expected createdRecipe to be a ShapelessRecipe");
      }
      expect(createdRecipe.result).toBeInstanceOf(Item);
      expect(createdRecipe.ingredients).toBeDefined();
    });
  });

  describe("error handling and initialization guards", () => {
    it("should throw when a recipe is mapped to a missing item", () => {
      const missingRecipe = { id: "missing_recipe_id" } as Recipe;

      expect(() => Item.fromRecipe(missingRecipe)).toThrow(
        `Item for recipe: ${JSON.stringify(missingRecipe)} does not exist`,
      );
    });

    it("should throw when a recipe lookup is requested for a missing mapped item", () => {
      const missingItem = { id: Number.MAX_SAFE_INTEGER } as Item;

      expect(() => Recipe.fromItem(missingItem)).toThrow(
        `Recipes for item: ${JSON.stringify(missingItem)} do not exist`,
      );
    });
  });
});
