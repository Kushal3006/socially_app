import { pgTable, serial, timestamp,varchar } from "drizzle-orm/pg-core";

export const todos = pgTable("socially", {
  id: serial("id").primaryKey(),
  email: varchar("email",{length:100}).notNull(),
  username: varchar("username",{length:50}),
  clerkId:varchar("clerkId",{length:50}).unique(),
  name:varchar("name",{length:50}).notNull(),
  Bio:varchar("Bio",{length:255}),
  image: varchar("image"),
  location: varchar("location"),
  website: varchar("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  //realationsc

}); 