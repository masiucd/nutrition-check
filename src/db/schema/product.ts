import { relations } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

import { user } from "./user";

// ============================================================================
// TABLES
// ============================================================================

/**
 * Product Table
 * -------------
 * The main product entity representing items sold in the application.
 *
 * @column id - Auto-generated primary key
 * @column name - Product display name (max 255 chars)
 * @column description - Detailed product description (max 1024 chars)
 * @column price - Product price with 2 decimal precision (e.g., 99.99)
 * @column createdAt - Timestamp when the product was created
 * @column updatedAt - Timestamp when the product was last updated
 *
 * @relations
 * - One-to-One with `productStatus` (inventory & availability)
 * - One-to-One with `productInfo` (SEO & physical attributes)
 * - One-to-Many with `productImage` (product gallery)
 * - One-to-Many with `productReview` (customer reviews)
 * - Many-to-Many with `category` (via `productCategory` junction table)
 */
export const product = pg.pgTable(
	"product",
	{
		id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
		name: pg.varchar({ length: 255 }).notNull(),
		description: pg.varchar({ length: 1024 }).notNull(),
		price: pg.decimal("price", { precision: 10, scale: 2 }).notNull(), // e.g., 99.99
		createdAt: pg.timestamp("created_at").defaultNow().notNull(),
		updatedAt: pg.timestamp("updated_at").defaultNow().notNull(),
	},
	(entity) => [pg.uniqueIndex("product_name_idx").on(entity.name)],
);

/**
 * Product Status Table
 * --------------------
 * Stores inventory and availability information for a product.
 * Has a one-to-one relationship with the product table.
 *
 * @column id - Auto-generated primary key
 * @column productId - Foreign key referencing `product.id`
 * @column status - Current status (e.g., "active", "draft", "archived")
 * @column sku - Stock Keeping Unit - unique product identifier for inventory
 * @column stock - Current quantity available in inventory (defaults to 0)
 *
 * @relations
 * - Many-to-One with `product` (belongs to one product)
 */
export const productStatus = pg.pgTable("product_status", {
	id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
	productId: pg
		.integer("product_id")
		.references(() => product.id)
		.notNull(),
	status: pg.varchar({ length: 50 }).notNull().unique(),
	sku: pg.varchar({ length: 100 }).notNull().unique(),
	stock: pg.integer().notNull().default(0),
});

/**
 * Product Info Table
 * ------------------
 * Stores SEO metadata and physical attributes for a product.
 * Has a one-to-one relationship with the product table.
 *
 * @column id - Auto-generated primary key
 * @column productId - Foreign key referencing `product.id`
 * @column weight - Physical weight of the product (for shipping calculations)
 * @column weightUnit - Unit of weight measurement (defaults to "kg")
 * @column slug - URL-friendly unique identifier for the product
 * @column metaTitle - SEO title for search engines
 * @column metaDescription - SEO description for search engines
 *
 * @relations
 * - Many-to-One with `product` (belongs to one product)
 */
export const productInfo = pg.pgTable("product_info", {
	id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
	productId: pg
		.integer("product_id")
		.references(() => product.id)
		.notNull(),
	weight: pg.decimal("weight", { precision: 10, scale: 2 }),
	weightUnit: pg.varchar({ length: 20 }).default("kg"),
	slug: pg.varchar({ length: 255 }).notNull().unique(),
	metaTitle: pg.varchar({ length: 255 }),
	metaDescription: pg.varchar({ length: 512 }),
});

/**
 * Category Table
 * --------------
 * Represents product categories for organizing products.
 * Supports hierarchical/nested categories via parentId.
 *
 * @column id - Auto-generated primary key
 * @column name - Display name of the category
 * @column slug - URL-friendly unique identifier
 * @column parentId - Self-referencing FK for nested categories (nullable for root categories)
 *
 * @relations
 * - Many-to-Many with `product` (via `productCategory` junction table)
 * - Self-referencing for parent/child category hierarchy
 */
export const category = pg.pgTable(
	"category",
	{
		id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
		name: pg.varchar({ length: 255 }).notNull(),
		slug: pg.varchar({ length: 255 }).unique().notNull(),
		parentId: pg.integer(), // Self-referencing foreign key for nested categories
	},
	(entity) => [pg.index("category_name_idx").on(entity.name)],
);

/**
 * Product-Category Junction Table
 * --------------------------------
 * Many-to-many relationship between products and categories.
 * A product can belong to multiple categories, and a category can contain multiple products.
 *
 * @column productId - Foreign key referencing `product.id`
 * @column categoryId - Foreign key referencing `category.id`
 *
 * @primaryKey Composite key of (productId, categoryId)
 *
 * @relations
 * - Many-to-One with `product`
 * - Many-to-One with `category`
 */
export const productCategory = pg.pgTable(
	"product_category",
	{
		productId: pg
			.integer("product_id")
			.references(() => product.id)
			.notNull(),
		categoryId: pg
			.integer()
			.references(() => category.id)
			.notNull(),
	},
	(t) => ({
		pk: pg.primaryKey({ columns: [t.productId, t.categoryId] }),
	}),
);

/**
 * Product Image Table
 * -------------------
 * Stores image URLs and metadata for product galleries.
 * A product can have multiple images.
 *
 * @column id - Auto-generated primary key
 * @column productId - Foreign key referencing `product.id`
 * @column url - Full URL to the image resource
 * @column altText - Accessibility text for the image
 * @column position - Display order in the gallery (0 = primary image)
 *
 * @relations
 * - Many-to-One with `product` (belongs to one product)
 */
export const productImage = pg.pgTable("product_image", {
	id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
	productId: pg
		.integer("product_id")
		.references(() => product.id)
		.notNull(),
	url: pg.varchar({ length: 500 }).notNull(),
	altText: pg.varchar({ length: 255 }),
	position: pg.integer().default(0),
});

/**
 * Product Review Table
 * --------------------
 * Stores customer reviews and ratings for products.
 * Links products to users who submitted the review.
 *
 * @column id - Auto-generated primary key
 * @column productId - Foreign key referencing `product.id`
 * @column userId - Foreign key referencing `user.id` (the reviewer)
 * @column rating - Numeric rating from 1 to 5
 * @column comment - Optional text review/feedback
 * @column createdAt - Timestamp when the review was submitted
 *
 * @relations
 * - Many-to-One with `product` (review belongs to one product)
 * - Many-to-One with `user` (review belongs to one user)
 */
export const productReview = pg.pgTable("product_review", {
	id: pg.integer().primaryKey().generatedAlwaysAsIdentity(),
	productId: pg
		.integer("product_id")
		.references(() => product.id)
		.notNull(),
	userId: pg
		.integer("user_id")
		.references(() => user.id)
		.notNull(),
	rating: pg.integer().notNull(),
	comment: pg.text(),
	createdAt: pg.timestamp().defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

/**
 * Product Relations
 * -----------------
 * Defines how the product table relates to other tables.
 *
 * - `status` (One-to-One): Links to productStatus for inventory info
 * - `info` (One-to-One): Links to productInfo for SEO and physical attributes
 */
export const productRelations = relations(product, ({ one }) => ({
	status: one(productStatus),
	info: one(productInfo),
}));

/**
 * Product Status Relations
 * ------------------------
 * Inverse relation back to the parent product.
 */
export const productStatusRelations = relations(productStatus, ({ one }) => ({
	product: one(product),
}));

/**
 * Product Info Relations
 * ----------------------
 * Inverse relation back to the parent product.
 */
export const productInfoRelations = relations(productInfo, ({ one }) => ({
	product: one(product),
}));

/**
 * Category Relations
 * ------------------
 * Links categories to products via the junction table.
 *
 * - `products` (One-to-Many): All product-category associations for this category
 */
export const categoryRelations = relations(category, ({ many }) => ({
	products: many(productCategory),
}));

/**
 * Product-Category Junction Relations
 * -----------------------------------
 * Enables bidirectional navigation between products and categories.
 *
 * - `product` (Many-to-One): The product in this association
 * - `category` (Many-to-One): The category in this association
 */
export const productCategoryRelations = relations(
	productCategory,
	({ one }) => ({
		product: one(product),
		category: one(category),
	}),
);

/**
 * Product Image Relations
 * -----------------------
 * Links images back to their parent product.
 *
 * - `product` (Many-to-One): The product this image belongs to
 */
export const productImageRelations = relations(productImage, ({ one }) => ({
	product: one(product),
}));

/**
 * Product Review Relations
 * ------------------------
 * Links reviews back to the product being reviewed.
 *
 * - `product` (Many-to-One): The product this review is for
 *
 * Note: User relation should be defined in the user schema file
 */

export const productReviewRelations = relations(productReview, ({ one }) => ({
	product: one(product),
}));
