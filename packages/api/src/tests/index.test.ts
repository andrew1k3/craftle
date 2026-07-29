import { Hono } from "hono";
import { testClient } from "hono/testing";
import app from "../";
import { describe, it, expect } from "vitest";
import { OpenAPIHono } from "@hono/zod-openapi";

describe("Get all users", () => {
  // Create the test client from the app instance
  // const client = testClient(app);

  it("should get all users", async () => {
    // Call the endpoint using the typed client
    const res = await app.request("/users", {
      method: "GET",
    });

    // Assertions
    expect(res?.status).toBe(200);
    // expect(await res?.json()).toEqual({
    //   results: ["result1", "result2"],
    // });
  });
});
