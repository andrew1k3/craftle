import { Database, Db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { User, getUsersParams } from "@workspace/contracts/users";
import { HTTPException } from "hono/http-exception";

export const getUsers = async ({
  limit,
  offset,
}: getUsersParams): Promise<User[]> => {
  const db: Db = Database.getInstance();

  const users: (typeof usersTable.$inferSelect)[] = await db
    .select()
    .from(usersTable)
    .limit(limit ?? 1000)
    .offset(offset ?? 0);

  return users;
};
