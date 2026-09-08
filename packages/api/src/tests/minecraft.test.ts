import app, { BASE_PATH } from "../";
import { describe, it, expect } from "vitest";

describe("/games/game", () => {
  it("should get the game state", async () => {
    const res = await app.request(`${BASE_PATH}/games/game`);
    const data = await res.json();

    expect(res?.status).toBe(200);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty("gameId");
    expect(data).toHaveProperty("createdAt");
    expect(data).toHaveProperty("isActive");
    expect(data).toHaveProperty("expectedItem");
    expect(data).toHaveProperty("inventory");
  });

  it("should get the game state with a specific gameId", async () => {
    const res = await app.request(`${BASE_PATH}/games/game?gameId=1`);
    const data = await res.json();

    expect(res?.status).toBe(200);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty("gameId");
    expect(data).toHaveProperty("createdAt");
    expect(data).toHaveProperty("isActive");
    expect(data).toHaveProperty("expectedItem");
    expect(data).toHaveProperty("inventory");

    expect(data.gameId).toBe(1);
  });

  it("should return 400 for invalid gameId", async () => {
    const res = await app.request(`${BASE_PATH}/games/game?gameId=-1`);

    expect(res?.status).toBe(400);
  });

  it("should return 400 for non-numeric gameId", async () => {
    const res = await app.request(`${BASE_PATH}/games/game?gameId=abc`);

    expect(res?.status).toBe(400);
  });
});

describe("/games/inventory", () => {
  it("should get the game inventory", async () => {
    const res = await app.request(`${BASE_PATH}/games/inventory`);
    const data = await res.json();

    expect(res?.status).toBe(200);
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should get the game inventory with a specific gameId", async () => {
    const res = await app.request(`${BASE_PATH}/games/inventory?gameId=1`);
    const data = await res.json();

    expect(res?.status).toBe(200);
    expect(data).not.toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return 400 for invalid gameId", async () => {
    const res = await app.request(`${BASE_PATH}/games/inventory?gameId=-1`);

    expect(res?.status).toBe(400);
  });

  it("should return 400 for non-numeric gameId", async () => {
    const res = await app.request(`${BASE_PATH}/games/inventory?gameId=abc`);

    expect(res?.status).toBe(400);
  });
});
