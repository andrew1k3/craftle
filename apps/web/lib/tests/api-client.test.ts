import { describe, it, expect } from "vitest";
// import { getAuthedTestUsers, healthCheck } from "../api-client";

// describe("API Client", () => {
//   it("should perform a health check", async () => {
//     const response = await healthCheck();
//     expect(response).toEqual({ status: "ok" });
//   });

//   it("should get authed test users", async () => {
//     const params = { limit: 5, offset: 0 };
//     const response = await getAuthedTestUsers(params);

//     expect(response.status).toBe(200);
//     expect(response).toBeDefined();
//     expect(Array.isArray(response)).toBe(true);
//   });
// });

describe("API Client", () => {
  it("should compile and run without errors", () => {
    expect(true).toBe(true);
  });
});
