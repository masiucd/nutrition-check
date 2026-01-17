import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const gender = pgTable("gender", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	type: varchar({ length: 50 }).notNull().unique(),
});
