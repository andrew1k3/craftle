import { eq } from "drizzle-orm";
import { usersTable } from "@workspace/db/schema";
import users from "./users.json";
import { Database, Db } from "..";

async function main() {
  users.forEach(async (u) => {
    const user: typeof usersTable.$inferInsert = {
      name: u.name,
      role: u.role,
      email: u.email,
    };
    const db: Db = Database.getInstance();
    await db.insert(usersTable).values(user);
    console.log("New user created!");
    const users = await db.select().from(usersTable);
    console.log("Getting all users from the database: ", users);
  });

  // const user: typeof usersTable.$inferInsert = {
  //   name: "John",
  //   age: 30,
  //   email: "john@example.com",
  // };
  // await db.insert(usersTable).values(user);
  // console.log("New user created!");
  // const users = await db.select().from(usersTable);
  // console.log("Getting all users from the database: ", users);
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */
  // await db
  //   .update(usersTable)
  //   .set({
  //     age: 31,
  //   })
  //   .where(eq(usersTable.email, user.email));
  // console.log("User info updated!");
  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log("User deleted!");
}
main();
