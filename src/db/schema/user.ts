import * as pg from "drizzle-orm/pg-core";

export const user = pg.pgTable(
	"user",
	{
		id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
		username: pg.varchar({ length: 255 }).notNull().unique(),
		email: pg.varchar({ length: 255 }).notNull().unique(),
		passwordHash: pg.varchar("password_hash", { length: 512 }).notNull(),
	},
	(e) => [
		pg.uniqueIndex("username_idx").on(e.username),
		pg.uniqueIndex("email_idx").on(e.email),
	],
);
