import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import {
  clearPendingChallenge,
  getPendingChallenge,
  hashAdminPassword,
  validateAdminPassword,
  verifyAdminChallenge,
  writeAdminAudit,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { consumeRateLimit } from "@/lib/rate-limit";

export default async function ResetAdminPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pending = await getPendingChallenge("password_reset");
  if (!pending) redirect("/admin/forgot-password");
  const params = await searchParams;

  async function resetPassword(formData: FormData) {
    "use server";
    const current = await getPendingChallenge("password_reset");
    if (!current) redirect("/admin/forgot-password");
    const code = String(formData.get("code") ?? "").replace(/\s/g, "");
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (password !== confirmation)
      redirect("/admin/reset-password?error=mismatch");
    const passwordCheck = validateAdminPassword(password);
    if (!passwordCheck.valid)
      redirect("/admin/reset-password?error=password");
    const limit = await consumeRateLimit(await headers(), {
      scope: "admin-password-reset-code",
      limit: 10,
      windowSeconds: 15 * 60,
      identity: current.userId,
    });
    if (!limit.allowed)
      redirect("/admin/reset-password?error=rate-limit");
    const valid = await verifyAdminChallenge({
      ...current,
      type: "password_reset",
      code,
    });
    if (!valid) redirect("/admin/reset-password?error=code");
    const passwordHash = await hashAdminPassword(passwordCheck.password);
    const updated = await getDb()
      .update(adminUsers)
      .set({
        passwordHash,
        sessionVersion: sql`${adminUsers.sessionVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, current.userId))
      .returning({ id: adminUsers.id });
    if (!updated.length) redirect("/admin/reset-password?error=code");
    await writeAdminAudit({
      actorUserId: current.userId,
      action: "auth.password.reset",
      targetType: "admin_user",
      targetId: current.userId,
    });
    await clearPendingChallenge("password_reset");
    redirect("/admin/login?reset=complete");
  }

  const error =
    params.error === "mismatch"
      ? "The passwords do not match."
      : params.error === "password"
        ? "Use a unique passphrase between 12 and 128 characters."
        : params.error === "rate-limit"
          ? "Too many attempts. Request a new reset code later."
          : params.error
            ? "That code is incorrect, expired or has already been used."
            : null;

  return (
    <main className="mx-auto grid min-h-[65svh] max-w-md place-content-center px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
        Account recovery
      </p>
      <h1 className="mt-3 font-display text-6xl tracking-[-.04em]">
        Choose a new password
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/65">
        If the email belongs to an active account, a reset code is on its way.
        Use a unique passphrase of at least 12 characters.
      </p>
      {error && (
        <p role="alert" className="mt-5 border border-red-800 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </p>
      )}
      <form action={resetPassword} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-xs font-bold">
          Reset code
          <input
            name="code"
            type="text"
            required
            minLength={6}
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="h-14 border-b border-ink bg-transparent text-2xl font-semibold tracking-[.18em] outline-none"
          />
        </label>
        <label className="grid gap-2 text-xs font-bold">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none"
          />
        </label>
        <label className="grid gap-2 text-xs font-bold">
          Confirm new password
          <input
            name="confirmation"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none"
          />
        </label>
        <button className="min-h-12 bg-ink px-5 font-bold text-cream">
          Reset password
        </button>
      </form>
      <Link href="/admin/forgot-password" className="mt-6 w-fit border-b border-ink/50 pb-1 text-sm">
        Request another code
      </Link>
    </main>
  );
}
