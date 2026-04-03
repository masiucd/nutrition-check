-- migrate:up
CREATE TABLE users_data (
  id INTEGER PRIMARY KEY REFERENCES users(id), -- The user_id references the users table
  data JSONB, -- The data column stores JSONB data
  age INTEGER, -- The age column stores the user's age
  gender BOOLEAN -- The gender column stores the user's gender either 0 (male) or 1 (female) or false (male) and true (female)
);

-- migrate:down
