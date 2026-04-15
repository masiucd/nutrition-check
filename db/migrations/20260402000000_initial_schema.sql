-- migrate:up

-- ============================================================
-- DROP (safe teardown — CASCADE handles FK order automatically)
-- ============================================================

DROP TABLE IF EXISTS users_data        CASCADE;
DROP TABLE IF EXISTS daily_logs        CASCADE;
DROP TABLE IF EXISTS foods             CASCADE;
DROP TABLE IF EXISTS food_types        CASCADE;
DROP TABLE IF EXISTS food_categories   CASCADE;
DROP TABLE IF EXISTS users             CASCADE;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE users (
	id         SERIAL PRIMARY KEY,
	email      TEXT        NOT NULL UNIQUE,
	password   TEXT        NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users_data (
	id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	age        INTEGER,
	gender     BOOLEAN,
	first_name VARCHAR(100),
	last_name  VARCHAR(100),
	occupation VARCHAR(100),
	height     NUMERIC(5,2),
	weight     NUMERIC(5,2),
	city       VARCHAR(100),
	country    VARCHAR(100),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE food_categories (
	id   SERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE
);

CREATE TABLE food_types (
	id   SERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE
);

CREATE TABLE foods (
	id                SERIAL PRIMARY KEY,
	user_id           INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	category_id       INTEGER       REFERENCES food_categories(id),
	type_id           INTEGER       REFERENCES food_types(id),
	name              TEXT          NOT NULL,
	calories_per_unit NUMERIC(10,2) NOT NULL,
	protein_per_unit  NUMERIC(10,2) NOT NULL DEFAULT 0,
	carbs_per_unit    NUMERIC(10,2) NOT NULL DEFAULT 0,
	fat_per_unit      NUMERIC(10,2) NOT NULL DEFAULT 0,
	unit_label        TEXT          NOT NULL DEFAULT 'serving',
	created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
	updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_logs (
	id         SERIAL PRIMARY KEY,
	user_id    INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	food_id    INTEGER       NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
	log_date   DATE          NOT NULL,
	meal       TEXT          NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snacks')),
	quantity   NUMERIC(10,2) NOT NULL,
	calories   NUMERIC(10,2) NOT NULL,
	created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX foods_user_id_idx        ON foods(user_id);
CREATE INDEX foods_name_idx           ON foods(user_id, name);
CREATE INDEX idx_foods_category_id    ON foods(category_id);
CREATE INDEX daily_logs_user_date_idx ON daily_logs(user_id, log_date);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO food_categories (name) VALUES
	('Fruit'),
	('Vegetable'),
	('Meat'),
	('Dairy'),
	('Grains'),
	('Legumes'),
	('Nuts & Seeds'),
	('Snacks'),
	('Seafood');

INSERT INTO food_types (name) VALUES
	('Whole Food'),
	('Processed'),
	('Semi-Processed');

-- migrate:down

DROP TABLE IF EXISTS daily_logs        CASCADE;
DROP TABLE IF EXISTS foods             CASCADE;
DROP TABLE IF EXISTS food_types        CASCADE;
DROP TABLE IF EXISTS food_categories   CASCADE;
DROP TABLE IF EXISTS users_data        CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
