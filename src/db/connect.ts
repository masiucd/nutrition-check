// import {SQL} from "bun"
// import {env} from "../env"

// // TODO use environment variables for connection string- use zod schema validation

// const SqlString = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
// // const psql = new SQL("postgresql://root:root@localhost:5444/postgres")
// const psql = new SQL(SqlString)

// export {psql as sql}

// import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/data/env";

// import 'dotenv/config';

// const db = drizzle(process.env.DATABASE_URL!);

export const dbUrl = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

const pool = new Pool({
	connectionString: dbUrl,
});

export const db = drizzle({ client: pool });
