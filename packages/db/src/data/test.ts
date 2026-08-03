import { eq } from "drizzle-orm";
import { testUsersTable } from "@workspace/db/schema";
import demoUsers from "./users.json";
import { Database, Db } from "..";

async function main() {
  // const db: Db = Database.getInstance();
  // demoUsers.forEach(async (u) => {
  //   const user: typeof testUsersTable.$inferInsert = {
  //     name: u.name,
  //     role: u.role,
  //     email: u.email,
  //   };
  //   await db.insert(testUsersTable).values(user);
  //   console.log("New user created!");
  // });
  // const users = await db.select().from(testUsersTable);
  // console.log("Getting all users from the database: ", users);
}
main();
