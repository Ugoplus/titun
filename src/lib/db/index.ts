import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalDatabase = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

const getConnection = () => {
  if (!process.env.DATABASE_URL) return null;
  if (!globalDatabase.sql) {
    globalDatabase.sql = postgres(process.env.DATABASE_URL, {
      max: process.env.NODE_ENV === "production" ? 10 : 3,
      prepare: false,
    });
  }
  return globalDatabase.sql;
};

export const getDb = () => {
  const connection = getConnection();
  if (!connection) throw new Error("DATABASE_URL is not configured");
  return drizzle(connection, { schema });
};

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);
