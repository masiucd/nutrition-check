-- migrate:up

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE foods (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  calories_per_unit NUMERIC(10, 2) NOT NULL,
  unit_label       TEXT NOT NULL DEFAULT 'serving',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX foods_user_id_idx ON foods(user_id);
CREATE INDEX foods_name_idx    ON foods(user_id, name);

CREATE TABLE daily_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id    INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  log_date   DATE NOT NULL,
  meal       TEXT NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  quantity   NUMERIC(10, 2) NOT NULL,
  calories   NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX daily_logs_user_date_idx ON daily_logs(user_id, log_date);

-- migrate:down

DROP TABLE IF EXISTS daily_logs;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS users;
