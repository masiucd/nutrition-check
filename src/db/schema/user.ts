import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	username: varchar({ length: 255 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
	passwordHash: varchar("password_hash", { length: 512 }).notNull(),
	// name: varchar({ length: 255 }).notNull(),
	// age: integer().notNull(),
});
