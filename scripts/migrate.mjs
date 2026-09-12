import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const migration = await readFile(new URL("../drizzle/0000_titun.sql", import.meta.url), "utf8");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await sql.unsafe(migration);
  console.info("TITUN database is ready.");
} finally {
  await sql.end();
}
