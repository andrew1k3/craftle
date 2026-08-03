import app, { BASE_PATH } from "../";
import { describe, it, expect } from "vitest";
import { buildQueryParams } from "./utils";
import { getTestUsersParams } from "@workspace/contracts/users";

describe("/testUsers", () => {
  it("should get all users", async () => {
    const res = await app.request(`${BASE_PATH}/testUsers`);

    expect(res?.status).toBe(200);
    expect(await res?.json()).not.toBeNull();
  });

  it("should get a limited amount of users", async () => {
    const options: getTestUsersParams = {
      offset: 0,
      limit: 10,
    };
    const res = await app.request(
      `${BASE_PATH}/testUsers${buildQueryParams(options)}`,
    );
    const data = await res.json();

    expect(res?.status).toBe(200);
    expect(data).not.toBeNull();
    expect(data).length.lte(10);
  });

  it("should return 400 for invalid query parameters", async () => {
    const options: getTestUsersParams = {
      offset: -1,
      limit: 10,
    };
    const res = await app.request(
      `${BASE_PATH}/testUsers${buildQueryParams(options)}`,
    );

    expect(res?.status).toBe(400);
  });

  it("should reject negative limit", async () => {
    const options: getTestUsersParams = {
      offset: 0,
      limit: -10,
    };
    const res = await app.request(
      `${BASE_PATH}/testUsers${buildQueryParams(options)}`,
    );

    expect(res?.status).toBe(400);
  });

  it("should reject negative offset", async () => {
    const options: getTestUsersParams = {
      offset: -10,
      limit: 10,
    };
    const res = await app.request(
      `${BASE_PATH}/testUsers${buildQueryParams(options)}`,
    );

    expect(res?.status).toBe(400);
  });

  it("get different users with different offsets", async () => {
    const options1: getTestUsersParams = {
      offset: 0,
      limit: 10,
    };
    const res1 = await app.request(
      `${BASE_PATH}/testUsers${buildQueryParams(options1)}`,
    );
    const data1 = await res1.json();

    const options2: getTestUsersParams = {
      offset: 10,
      limit: 10,
    };
    const res2 = await app.request(
      `${BASE_PATH}/testUsers${buildQueryParams(options2)}`,
    );
    const data2 = await res2.json();

    expect(res1?.status).toBe(200);
    expect(res2?.status).toBe(200);
    expect(data1).not.toEqual(data2);
  });
});
