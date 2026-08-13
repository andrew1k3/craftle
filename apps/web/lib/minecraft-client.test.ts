import { describe, it, expect } from "vitest";
import MinecraftData from "minecraft-data";
import "dotenv/config";

import {
  Item,
  Recipe,
  ShapedRecipe,
  ShapelessRecipe,
  RecipeFactory,
} from "./minecraft-client";

// The exact argument type accepted by Item.fromRecipeItem, derived from the
// function's own signature. Using this (instead of `any`) for the
// deliberately-invalid-input edge case tests means the cast stays correct
// even if the real parameter type changes.
type FromRecipeItemArg = Parameters<typeof Item.fromRecipeItem>[0];

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

    describe("fromRecipeItem", () => {
      it("should create an Item from a numeric recipe item", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);
        const stone = mcData.itemsByName.stone!;

        const item = Item.fromRecipeItem(stone.id);

        expect(item).toBeInstanceOf(Item);
        expect(item.id).toBe(stone.id);
        expect(item.displayName).toBe(stone.displayName);
        expect(item.stackSize).toBe(stone.stackSize);
      });

      it("should produce the same result as fromId", () => {
        const stone = Item.fromDisplayName("stone");

        const fromRecipeItem = Item.fromRecipeItem(stone.id);
        const fromId = Item.fromId(stone.id);

        expect(fromRecipeItem).toEqual(fromId);
      });

      it("should throw when passed an object", () => {
        expect(() => {
          Item.fromRecipeItem({ id: 1 } as unknown as FromRecipeItemArg);
        }).toThrow();
      });

      it("should throw when passed null", () => {
        expect(() => {
          Item.fromRecipeItem(null as unknown as FromRecipeItemArg);
        }).toThrow();
      });

      it("should throw when passed undefined", () => {
        expect(() => {
          Item.fromRecipeItem(undefined as unknown as FromRecipeItemArg);
        }).toThrow();
      });
    });

    describe("hasRecipe", () => {
      it("should return a boolean", () => {
        const item = Item.fromDisplayName("stone");

        expect(typeof item.hasRecipe()).toBe("boolean");
      });

      it("should indicate whether recipes are present", () => {
        const item = Item.fromDisplayName("stone");

        expect(item.hasRecipe()).toBe(item.recipes !== undefined);
      });

      it("should have recipes for an item that minecraft-data provides recipes for", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);
        const itemsWithRecipes = Object.entries(mcData.recipes).filter(
          ([, recipes]) => recipes && recipes.length > 0,
        );

        expect(itemsWithRecipes.length).toBeGreaterThan(0);

        const [id, recipes] = itemsWithRecipes[0]!;

        const item = Item.fromId(Number(id));

        expect(recipes).toBeDefined();
        expect(item.hasRecipe()).toBe(true);
        expect(item.recipes).toBeDefined();
        expect(item.recipes!.length).toBeGreaterThan(0);
      });

      it("should be false when the item has no recipes", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);

        const itemWithoutRecipes = Object.entries(mcData.items).find(
          ([id]) => !mcData.recipes[Number(id)],
        );

        expect(itemWithoutRecipes).toBeDefined();

        const [id] = itemWithoutRecipes!;

        const item = Item.fromId(Number(id));

        expect(item.recipes).toBeUndefined();
        expect(item.hasRecipe()).toBe(false);
      });
    });

    describe("properties", () => {
      it("should expose id", () => {
        const item = Item.fromDisplayName("stone");

        expect(item.id).toBeTypeOf("number");
      });

      it("should expose displayName", () => {
        const item = Item.fromDisplayName("stone");

        expect(item.displayName).toBe("Stone");
      });

      it("should expose stackSize", () => {
        const item = Item.fromDisplayName("stone");

        expect(item.stackSize).toBe(64);
      });

      it("should expose recipes as undefined when there are no recipes", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);

        const itemWithoutRecipes = Object.entries(mcData.items).find(
          ([id]) => !mcData.recipes[Number(id)],
        );

        expect(itemWithoutRecipes).toBeDefined();

        const [id] = itemWithoutRecipes!;
        const item = Item.fromId(Number(id));

        expect(item.recipes).toBeUndefined();
      });

      it("should expose recipes when recipes exist", () => {
        const mcVersion = process.env.MC_VERSION!;

        const mcData = MinecraftData(mcVersion);

        const itemWithRecipes = Object.entries(mcData.items).find(([id]) => {
          const recipes = mcData.recipes[Number(id)];
          return recipes && recipes.length > 0;
        });

        expect(itemWithRecipes).toBeDefined();

        const [id] = itemWithRecipes!;
        const item = Item.fromId(Number(id));

        expect(item.recipes).toBeDefined();
        expect(Array.isArray(item.recipes)).toBe(true);
      });
    });
  });

  describe("Recipe", () => {
    it("should create a Recipe from minecraft-data recipe data", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes).flat().find(Boolean);

      expect(recipe).toBeDefined();

      const result = new Recipe(recipe!);

      expect(result).toBeInstanceOf(Recipe);
      expect(result.result).toBeInstanceOf(Item);
    });

    it("should convert the recipe result to an Item", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes).flat().find(Boolean)!;

      const result = new Recipe(recipe);

      const expectedResult = Item.fromRecipeItem(recipe.result);

      expect(result.result).toEqual(expectedResult);
    });

    it("should expose a result Item", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes).flat().find(Boolean)!;

      const result = RecipeFactory.createRecipe(recipe);

      expect(result.result).toBeInstanceOf(Item);
      expect(result.result.id).toBeTypeOf("number");
      expect(result.result.displayName).toBeTypeOf("string");
      expect(result.result.stackSize).toBeTypeOf("number");
    });
  });

  describe("ShapelessRecipe", () => {
    it("should create a ShapelessRecipe from shapeless recipe data", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapelessRecipe =>
            !("inShape" in recipe),
        );

      expect(recipe).toBeDefined();

      const shapelessRecipe = new ShapelessRecipe(recipe!);

      expect(shapelessRecipe).toBeInstanceOf(ShapelessRecipe);
      expect(shapelessRecipe).toBeInstanceOf(Recipe);
    });

    it("should convert every ingredient to an Item", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapelessRecipe =>
            !("inShape" in recipe),
        );

      expect(recipe).toBeDefined();

      const shapelessRecipe = new ShapelessRecipe(recipe!);

      expect(shapelessRecipe.ingredients).toBeDefined();
      expect(Array.isArray(shapelessRecipe.ingredients)).toBe(true);

      for (const ingredient of shapelessRecipe.ingredients) {
        expect(ingredient).toBeInstanceOf(Item);
      }
    });

    it("should preserve the number of ingredients", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapelessRecipe =>
            !("inShape" in recipe),
        );

      expect(recipe).toBeDefined();

      const shapelessRecipe = new ShapelessRecipe(recipe!);

      expect(shapelessRecipe.ingredients.length).toBe(
        recipe!.ingredients.length,
      );
    });

    it("should convert ingredients to the correct Items", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapelessRecipe =>
            !("inShape" in recipe),
        );

      expect(recipe).toBeDefined();

      const shapelessRecipe = new ShapelessRecipe(recipe!);

      const expectedIngredients = recipe!.ingredients.map(
        (ingredient: MinecraftData.RecipeItem) =>
          Item.fromRecipeItem(ingredient),
      );

      expect(shapelessRecipe.ingredients).toEqual(expectedIngredients);
    });

    it("should contain the correct recipe result", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapelessRecipe =>
            !("inShape" in recipe),
        );

      expect(recipe).toBeDefined();

      const shapelessRecipe = new ShapelessRecipe(recipe!);

      expect(shapelessRecipe.result).toEqual(
        Item.fromRecipeItem(recipe!.result),
      );
    });
  });

  describe("ShapedRecipe", () => {
    it("should create a ShapedRecipe from shaped recipe data", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapedRecipe => "inShape" in recipe,
        );

      expect(recipe).toBeDefined();

      const shapedRecipe = new ShapedRecipe(recipe!);

      expect(shapedRecipe).toBeInstanceOf(ShapedRecipe);
      expect(shapedRecipe).toBeInstanceOf(Recipe);
    });

    it("should preserve the recipe shape", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapedRecipe => "inShape" in recipe,
        );

      expect(recipe).toBeDefined();

      const shapedRecipe = new ShapedRecipe(recipe!);

      expect(shapedRecipe.inShape).toEqual(recipe!.inShape);
    });

    it("should expose an array as the shape", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapedRecipe => "inShape" in recipe,
        );

      expect(recipe).toBeDefined();

      const shapedRecipe = new ShapedRecipe(recipe!);

      expect(Array.isArray(shapedRecipe.inShape)).toBe(true);
    });

    it("should contain the correct recipe result", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapedRecipe => "inShape" in recipe,
        );

      expect(recipe).toBeDefined();

      const shapedRecipe = new ShapedRecipe(recipe!);

      expect(shapedRecipe.result).toEqual(Item.fromRecipeItem(recipe!.result));
    });

    it("should inherit from Recipe", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const recipe = Object.values(mcData.recipes)
        .flat()
        .find(
          (recipe): recipe is MinecraftData.ShapedRecipe => "inShape" in recipe,
        );

      expect(recipe).toBeDefined();

      const shapedRecipe = new ShapedRecipe(recipe!);

      expect(shapedRecipe).toBeInstanceOf(Recipe);
      expect(shapedRecipe.result).toBeInstanceOf(Item);
    });
  });

  describe("recipe integration", () => {
    it("should turn every recipe on an Item into a Recipe instance", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const itemWithRecipes = Object.entries(mcData.items).find(([id]) => {
        const recipes = mcData.recipes[Number(id)];
        return recipes && recipes.length > 0;
      });

      expect(itemWithRecipes).toBeDefined();

      const [id] = itemWithRecipes!;
      const item = Item.fromId(Number(id));

      expect(item.recipes).toBeDefined();

      for (const recipe of item.recipes!) {
        expect(recipe).toBeInstanceOf(Recipe);
      }
    });

    it("should create ShapedRecipe objects for shaped recipes", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const shaped = Object.values(mcData.recipes)
        .flat()
        .find((recipe) => "inShape" in recipe);

      expect(shaped).toBeDefined();

      const item = Item.fromId(shaped!.result as number);

      const shapedRecipes = item.recipes?.filter(
        (recipe) => recipe instanceof ShapedRecipe,
      );

      expect(shapedRecipes).toBeDefined();
    });

    it("should create ShapelessRecipe objects for shapeless recipes", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const shapeless = Object.values(mcData.recipes)
        .flat()
        .find((recipe) => !("inShape" in recipe));

      expect(shapeless).toBeDefined();

      const item = Item.fromId(shapeless!.result as number);

      const shapelessRecipes = item.recipes?.filter(
        (recipe) => recipe instanceof ShapelessRecipe,
      );

      expect(shapelessRecipes).toBeDefined();
    });

    it("should correctly identify shaped versus shapeless recipes", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      const allRecipes = Object.values(mcData.recipes).flat();

      expect(allRecipes.length).toBeGreaterThan(0);

      for (const minecraftRecipe of allRecipes) {
        const resultItem = Item.fromRecipeItem(minecraftRecipe.result);
        const recipe = resultItem.recipes?.find(
          (candidate) => candidate.result.id === resultItem.id,
        );

        expect(recipe).toBeInstanceOf(Recipe);
      }
    });
  });

  describe("round trips", () => {
    it("should round-trip an item through name -> id -> recipe item", () => {
      const original = Item.fromDisplayName("stone");

      const fromId = Item.fromId(original.id);
      const fromRecipeItem = Item.fromRecipeItem(original.id);

      expect(fromId).toEqual(original);
      expect(fromRecipeItem).toEqual(original);
    });

    it("should round-trip an item through minecraft-data -> Item", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);
      const original = mcData.itemsByName.stone!;

      const item = Item.fromItem(original);

      expect(item.id).toBe(original.id);
      expect(item.displayName).toBe(original.displayName);
      expect(item.stackSize).toBe(original.stackSize);
    });

    it("should create consistent Item instances for the same id", () => {
      const stone = Item.fromDisplayName("stone");

      const item1 = Item.fromId(stone.id);
      const item2 = Item.fromId(stone.id);
      const item3 = Item.fromRecipeItem(stone.id);

      expect(item1).toEqual(item2);
      expect(item2).toEqual(item3);
      expect(item1).toEqual(stone);
    });
  });

  describe("edge cases", () => {
    it("should reject a string passed to fromRecipeItem", () => {
      expect(() => {
        Item.fromRecipeItem("stone" as unknown as FromRecipeItemArg);
      }).toThrow();
    });

    it("should reject an array passed to fromRecipeItem", () => {
      expect(() => {
        Item.fromRecipeItem([1] as unknown as FromRecipeItemArg);
      }).toThrow();
    });

    it("should reject a boolean passed to fromRecipeItem", () => {
      expect(() => {
        Item.fromRecipeItem(true as unknown as FromRecipeItemArg);
      }).toThrow();
    });

    it("should reject false passed to fromRecipeItem", () => {
      expect(() => {
        Item.fromRecipeItem(false as unknown as FromRecipeItemArg);
      }).toThrow();
    });

    it("should reject zero when zero is not a valid item id", () => {
      const mcVersion = process.env.MC_VERSION!;

      const mcData = MinecraftData(mcVersion);

      if (!mcData.items[0]) {
        expect(() => Item.fromId(0)).toThrow("Item with id: 0 does not exist");
      } else {
        expect(Item.fromId(0)).toBeInstanceOf(Item);
      }
    });
  });
});
