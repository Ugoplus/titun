import { compare, hash } from "bcryptjs";
import {
  createHmac,
  randomInt,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { and, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AdminPermission } from "@/lib/admin-permissions";
import { hasAdminPermission } from "@/lib/admin-permissions";
import {
  normalizeAdminPassword,
  validateAdminPassword,
} from "@/lib/admin-password";
import { getDb } from "@/lib/db";
import {
  adminAuditLog,
  adminAuthChallenges,
  adminRoles,
  adminUsers,
} from "@/lib/db/schema";

const sessionCookieName = "titun-admin";
const pendingCookieName = "titun-admin-pending";
const resetCookieName = "titun-admin-reset";
const tokenIssuer = "titun-store";
const tokenAudience = "titun-admin";
const dummyPasswordHash =
  "$2b$12$b4LCaXnDaqDi8wT2cIl0guYJhXQ2vG8gj9QZ1dUdcRjbfayv8.mby";

export type AdminChallengeType = "login_2fa" | "password_reset" | "invite";

export type AdminIdentity = {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  roleSlug: string;
  permissions: string[];
  sessionVersion: number;
};

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("AUTH_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
};

const secureCookies =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://");

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const verifyStoredPassword = async (password: string, stored: string) => {
  const normalized = normalizeAdminPassword(password);
  if (stored.startsWith("scrypt:")) {
    const [salt, storedKey] = stored.slice(7).split(":");
    if (!salt || !storedKey) return false;
    const suppliedKey = scryptSync(normalized, salt, 64);
    const expectedKey = Buffer.from(storedKey, "hex");
    return (
      suppliedKey.length === expectedKey.length &&
      timingSafeEqual(suppliedKey, expectedKey)
    );
  }
  return compare(normalized, stored);
};

export { validateAdminPassword } from "@/lib/admin-password";

export const hashAdminPassword = async (password: string) => {
  const result = validateAdminPassword(password);
  if (!result.valid) throw new Error(result.error);
  return hash(result.password, 12);
};

const identityFromRecord = (record: {
  user: typeof adminUsers.$inferSelect;
  role: typeof adminRoles.$inferSelect;
}): AdminIdentity => ({
  id: record.user.id,
  email: record.user.email,
  name: record.user.name,
  roleId: record.role.id,
  roleName: record.role.name,
  roleSlug: record.role.slug,
  permissions: record.role.permissions,
  sessionVersion: record.user.sessionVersion,
});

const getUserWithRole = async (userId: string) => {
  const [record] = await getDb()
    .select({ user: adminUsers, role: adminRoles })
    .from(adminUsers)
    .innerJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
    .where(eq(adminUsers.id, userId))
    .limit(1);
  return record;
};

export const verifyAdminCredentials = async (
  email: string,
  password: string,
) => {
  const [record] = await getDb()
    .select({ user: adminUsers, role: adminRoles })
    .from(adminUsers)
    .innerJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
    .where(eq(adminUsers.email, normalizeEmail(email)))
    .limit(1);
  const storedHash = record?.user.passwordHash ?? dummyPasswordHash;
  const passwordMatches = await verifyStoredPassword(password, storedHash);
  if (!record || !record.user.active || !record.user.passwordHash) return null;
  return passwordMatches ? identityFromRecord(record) : null;
};

export const createAdminSession = async (identity: AdminIdentity) => {
  const token = await new SignJWT({
    email: identity.email,
    sessionVersion: identity.sessionVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(identity.id)
    .setIssuer(tokenIssuer)
    .setAudience(tokenAudience)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: Boolean(secureCookies),
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  cookieStore.delete(pendingCookieName);
  cookieStore.delete(resetCookieName);
};

export const getAdminIdentity = async (): Promise<AdminIdentity | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionCookieName)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: tokenIssuer,
      audience: tokenAudience,
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.sessionVersion !== "number"
    )
      return null;
    const record = await getUserWithRole(payload.sub);
    if (
      !record?.user.active ||
      record.user.sessionVersion !== payload.sessionVersion
    )
      return null;
    return identityFromRecord(record);
  } catch {
    return null;
  }
};

export const getAdminRateLimitIdentity = async () => {
  const identity = await getAdminIdentity();
  return identity?.id ?? null;
};

export const isAdmin = async () => Boolean(await getAdminIdentity());

export const adminCan = (
  identity: AdminIdentity,
  permission: AdminPermission,
) => hasAdminPermission(identity.roleSlug, identity.permissions, permission);

export const clearAdminSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  cookieStore.delete(pendingCookieName);
  cookieStore.delete(resetCookieName);
};

const challengeHash = (challengeId: string, code: string) =>
  createHmac("sha256", getSecret())
    .update(`${challengeId}:${code}`)
    .digest("hex");

export const createAdminChallenge = async (
  userId: string,
  type: AdminChallengeType,
) => {
  const id = randomUUID();
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + (type === "invite" ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000),
  );
  await getDb().transaction(async (tx) => {
    await tx
      .update(adminAuthChallenges)
      .set({ consumedAt: now })
      .where(
        and(
          eq(adminAuthChallenges.userId, userId),
          eq(adminAuthChallenges.type, type),
          isNull(adminAuthChallenges.consumedAt),
        ),
      );
    await tx.insert(adminAuthChallenges).values({
      id,
      userId,
      type,
      codeHash: challengeHash(id, code),
      expiresAt,
    });
  });
  return { id, code, expiresAt };
};

export const verifyAdminChallenge = async ({
  challengeId,
  userId,
  type,
  code,
}: {
  challengeId: string;
  userId: string;
  type: AdminChallengeType;
  code: string;
}) => {
  const [challenge] = await getDb()
    .update(adminAuthChallenges)
    .set({ attempts: sql`${adminAuthChallenges.attempts} + 1` })
    .where(
      and(
        eq(adminAuthChallenges.id, challengeId),
        eq(adminAuthChallenges.userId, userId),
        eq(adminAuthChallenges.type, type),
        isNull(adminAuthChallenges.consumedAt),
        gt(adminAuthChallenges.expiresAt, new Date()),
        lt(adminAuthChallenges.attempts, 5),
      ),
    )
    .returning();
  if (!challenge) return false;
  const supplied = Buffer.from(challengeHash(challenge.id, code));
  const expected = Buffer.from(challenge.codeHash);
  const matches =
    supplied.length === expected.length && timingSafeEqual(supplied, expected);
  if (!matches) return false;
  const consumed = await getDb()
    .update(adminAuthChallenges)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(adminAuthChallenges.id, challenge.id),
        isNull(adminAuthChallenges.consumedAt),
      ),
    )
    .returning({ id: adminAuthChallenges.id });
  return consumed.length === 1;
};

const createPendingToken = async (
  userId: string,
  challengeId: string,
  purpose: "login_2fa" | "password_reset",
) =>
  new SignJWT({ challengeId, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(tokenIssuer)
    .setAudience(tokenAudience)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecret());

export const setPendingChallenge = async (
  userId: string,
  challengeId: string,
  purpose: "login_2fa" | "password_reset",
) => {
  const token = await createPendingToken(userId, challengeId, purpose);
  const cookieStore = await cookies();
  cookieStore.set(
    purpose === "login_2fa" ? pendingCookieName : resetCookieName,
    token,
    {
      httpOnly: true,
      sameSite: "strict",
      secure: Boolean(secureCookies),
      path: "/admin",
      maxAge: 10 * 60,
    },
  );
};

export const getPendingChallenge = async (
  purpose: "login_2fa" | "password_reset",
) => {
  try {
    const token = (await cookies()).get(
      purpose === "login_2fa" ? pendingCookieName : resetCookieName,
    )?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: tokenIssuer,
      audience: tokenAudience,
    });
    if (
      payload.purpose !== purpose ||
      typeof payload.sub !== "string" ||
      typeof payload.challengeId !== "string"
    )
      return null;
    return { userId: payload.sub, challengeId: payload.challengeId };
  } catch {
    return null;
  }
};

export const clearPendingChallenge = async (
  purpose: "login_2fa" | "password_reset",
) => {
  (await cookies()).delete(
    purpose === "login_2fa" ? pendingCookieName : resetCookieName,
  );
};

export const verifyLatestAdminChallenge = async ({
  userId,
  type,
  code,
}: {
  userId: string;
  type: AdminChallengeType;
  code: string;
}) => {
  const [challenge] = await getDb()
    .select({ id: adminAuthChallenges.id })
    .from(adminAuthChallenges)
    .where(
      and(
        eq(adminAuthChallenges.userId, userId),
        eq(adminAuthChallenges.type, type),
        isNull(adminAuthChallenges.consumedAt),
      ),
    )
    .orderBy(desc(adminAuthChallenges.createdAt))
    .limit(1);
  if (!challenge) return false;
  return verifyAdminChallenge({
    challengeId: challenge.id,
    userId,
    type,
    code,
  });
};

export const getAdminUserByEmail = async (email: string) => {
  const [user] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizeEmail(email)))
    .limit(1);
  return user ?? null;
};

export const getAdminUserIdentity = async (userId: string) => {
  const record = await getUserWithRole(userId);
  return record?.user.active ? identityFromRecord(record) : null;
};

export const recordAdminLogin = async (userId: string) => {
  await getDb()
    .update(adminUsers)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(adminUsers.id, userId));
  await writeAdminAudit({
    actorUserId: userId,
    action: "auth.login.completed",
    targetType: "admin_user",
    targetId: userId,
  });
};

export const writeAdminAudit = async ({
  actorUserId,
  action,
  targetType,
  targetId,
  metadata = {},
}: {
  actorUserId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}) => {
  await getDb().insert(adminAuditLog).values({
    actorUserId: actorUserId ?? null,
    action,
    targetType: targetType ?? null,
    targetId: targetId ?? null,
    metadata,
  });
};
