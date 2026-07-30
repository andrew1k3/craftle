import { Hono } from "hono";
import { testClient } from "hono/testing";
import app, { BASE_PATH } from "../";
import { describe, it, expect } from "vitest";
import { buildQueryParams } from "./utils";
import { getUsersParams } from "@workspace/contracts/users";

describe("/", () => {
  it("should get all the docs", async () => {
    const res = await app.request(`${BASE_PATH}`);

    expect(res?.status).toBe(200);
    expect(await res?.json()).not.toBeNull();
  });
});

describe("/health", () => {
  it("should return 200 OK", async () => {
    const res = await app.request(`${BASE_PATH}/health`);
    const data = await res.json();

    expect(res?.status).toBe(200);
    expect(data).not.toBeNull();
    expect(data).toHaveProperty("status", "ok");
  });
});
