import MinecraftData, { IndexedBlock, IndexedData } from "minecraft-data";

const mcData: IndexedData = MinecraftData(process.env.MC_VERSION!);

function test() {
  console.log(process.env.MC_VERSION!);
  const stone_block: IndexedBlock = mcData.blocksByName["stone"]!;
  console.log(stone_block.id, stone_block.displayName);
  console.log(mcData.blocks[stone_block.id]);
}

test();
