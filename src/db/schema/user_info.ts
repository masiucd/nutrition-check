import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { gender } from "./gender";
import { user } from "./user";

/**
 * User information table schema.
 *
 * Stores additional profile information for users including personal details
 * such as name, age, and gender preference.
 *
 * @table user_info
 * @property {number} id - Primary key, references the user table
 * @property {string} [name] - User's full name, max 255 characters
 * @property {number} [age] - User's age in years
 * @property {number} [gender] - Foreign key reference to the gender table
 */
export const userInfo = pgTable("user_info", {
	id: integer()
		.primaryKey()
		.references(() => user.id)
		.notNull(),
	name: varchar({ length: 255 }),
	age: integer(),
	gender: integer().references(() => gender.id),
});

/**
 * Defines the relations for the userInfo table.
 *
 * @relations
 * - gender: One-to-one relationship with the gender table, mapping userInfo.gender to gender.id
 * - user: One-to-one relationship with the user table, mapping userInfo.id to user.id
 */
export const userInfoRelations = relations(userInfo, ({ one }) => ({
	gender: one(gender, {
		fields: [userInfo.gender],
		references: [gender.id],
	}),
	user: one(user, {
		fields: [userInfo.id],
		references: [user.id],
	}),
}));
