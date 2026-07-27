import { Database, Db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { User, getUsersParams } from "@workspace/api/models/users";
import { HTTPException } from "hono/http-exception";

export const getUsers = async ({
  limit,
  offset,
}: getUsersParams): Promise<User[]> => {
  if (limit! <= 0) {
    throw new HTTPException(400, {
      message: "Limit must be a positive integer",
    });
  }
  if (offset! < 0) {
    throw new HTTPException(400, {
      message: "Offset must be a non-negative integer",
    });
  }

  const db: Db = Database.getInstance();

  const users: (typeof usersTable.$inferSelect)[] = await db
    .select()
    .from(usersTable)
    .limit(limit ?? 1000)
    .offset(offset ?? 0);

  return users;
};
