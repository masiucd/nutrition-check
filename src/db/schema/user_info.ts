import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { gender } from "./gender";

export const userInfo = pgTable(
	"user_info",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }),
		age: integer(),
		gender: integer().references(() => gender.id),
	},
	//
);
