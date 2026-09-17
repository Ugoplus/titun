import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const migration = await readFile(new URL("../drizzle/0000_titun.sql", import.meta.url), "utf8");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await sql.unsafe(migration);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const bcryptHash = process.env.ADMIN_PASSWORD_HASH?.trim().replace(/^(['"])(.*)\1$/, "$2");
  const scryptCredential = process.env.ADMIN_PASSWORD_SCRYPT?.trim();
  const passwordHash = bcryptHash || (scryptCredential ? `scrypt:${scryptCredential}` : null);
  if (adminEmail && passwordHash) {
    await sql`
      INSERT INTO admin_users (email, name, password_hash, role_id, active)
      SELECT ${adminEmail}, 'TITUN Administrator', ${passwordHash}, id, true
      FROM admin_roles
      WHERE slug = 'administrator'
      ON CONFLICT (email) DO NOTHING
    `;
  }
  console.info("TITUN database is ready.");
} finally {
  await sql.end();
}
