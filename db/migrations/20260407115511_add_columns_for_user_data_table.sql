-- migrate:up
ALTER TABLE users_data
    ADD COLUMN first_name  VARCHAR(50),
    ADD COLUMN last_name   VARCHAR(50),
    ADD COLUMN occupation  VARCHAR(50),
    ADD COLUMN height      NUMERIC(5,2),
    ADD COLUMN weight      NUMERIC(5,2),
    ADD COLUMN city        VARCHAR(50),
    ADD COLUMN country     VARCHAR(50);

-- migrate:down
