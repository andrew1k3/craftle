import { Database, Db } from "@workspace/db";
import { testUsersTable } from "@workspace/db/schema";
import { TestUser, getTestUsersParams } from "@workspace/contracts/users";

export const getTestUsers = async ({
  limit,
  offset,
}: getTestUsersParams): Promise<TestUser[]> => {
  const db: Db = Database.getInstance();

  const users: (typeof testUsersTable.$inferSelect)[] = await db
    .select()
    .from(testUsersTable)
    .limit(limit ?? 1000)
    .offset(offset ?? 0);

  return users;
};
