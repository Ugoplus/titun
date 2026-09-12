import { compareSync } from "bcryptjs";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const cookieName = "titun-admin";

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("AUTH_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
};

export const verifyAdminCredentials = async (
  email: string,
  password: string,
) => {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim().replace(
    /^(['"])(.*)\1$/,
    "$2",
  );
  const scryptCredential = process.env.ADMIN_PASSWORD_SCRYPT?.trim();
  const emailMatches = Boolean(
    expectedEmail && email.trim().toLowerCase() === expectedEmail,
  );
  let passwordMatches = false;
  if (scryptCredential) {
    const [salt, storedKey] = scryptCredential.split(":");
    if (salt && storedKey) {
      const suppliedKey = scryptSync(password, salt, 64);
      const expectedKey = Buffer.from(storedKey, "hex");
      passwordMatches =
        suppliedKey.length === expectedKey.length &&
        timingSafeEqual(suppliedKey, expectedKey);
    }
  } else if (passwordHash) {
    passwordMatches = compareSync(password, passwordHash);
  }
  if (process.env.ADMIN_AUTH_DEBUG === "true")
    console.info("Admin authentication check", {
      emailMatches,
      passwordMatches,
      passwordLength: password.length,
      hasScryptCredential: Boolean(scryptCredential),
    });
  return emailMatches && passwordMatches;
};

export const createAdminSession = async (email: string) => {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ?? false,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
};

export const isAdmin = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
};

export const clearAdminSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
};
