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
  });
});
