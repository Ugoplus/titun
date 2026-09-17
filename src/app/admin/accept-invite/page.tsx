import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import {
  getAdminUserByEmail,
  hashAdminPassword,
  validateAdminPassword,
  verifyLatestAdminChallenge,
  writeAdminAudit,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { consumeRateLimit } from "@/lib/rate-limit";

export default async function AcceptAdminInvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  async function acceptInvite(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const code = String(formData.get("code") ?? "").replace(/\s/g, "");
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (password !== confirmation)
      redirect("/admin/accept-invite?error=mismatch");
    const passwordCheck = validateAdminPassword(password);
    if (!passwordCheck.valid)
      redirect("/admin/accept-invite?error=password");
    const limit = await consumeRateLimit(await headers(), {
      scope: "admin-invite-accept",
      limit: 10,
      windowSeconds: 60 * 60,
      identity: email || "unknown",
    });
    if (!limit.allowed)
      redirect("/admin/accept-invite?error=rate-limit");
    const user = await getAdminUserByEmail(email);
    const valid = user
      ? await verifyLatestAdminChallenge({
          userId: user.id,
          type: "invite",
          code,
        })
      : false;
    if (!user || !valid) redirect("/admin/accept-invite?error=code");
    const passwordHash = await hashAdminPassword(passwordCheck.password);
    await getDb()
      .update(adminUsers)
      .set({
        passwordHash,
        active: true,
        sessionVersion: sql`${adminUsers.sessionVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, user.id));
    await writeAdminAudit({
      actorUserId: user.id,
      action: "auth.invitation.accepted",
      targetType: "admin_user",
      targetId: user.id,
    });
    redirect("/admin/login?invite=accepted");
  }

  const error =
    params.error === "mismatch"
      ? "The passwords do not match."
      : params.error === "password"
        ? "Use a unique passphrase between 12 and 128 characters."
        : params.error === "rate-limit"
          ? "Too many attempts. Ask an administrator for a new invitation."
          : params.error
            ? "That invitation is incorrect, expired or has already been used."
            : null;

  return (
    <main className="mx-auto grid min-h-[65svh] max-w-md place-content-center px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
        Team invitation
      </p>
      <h1 className="mt-3 font-display text-6xl tracking-[-.04em]">
        Create your access
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/65">
        Use the email address and six-digit code from your invitation, then
        create a unique passphrase.
      </p>
      {error && (
        <p role="alert" className="mt-5 border border-red-800 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </p>
      )}
      <form action={acceptInvite} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-xs font-bold">
          Email
          <input name="email" type="email" required autoComplete="email" className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none" />
        </label>
        <label className="grid gap-2 text-xs font-bold">
          Invitation code
          <input name="code" type="text" required minLength={6} maxLength={6} pattern="[0-9]{6}" inputMode="numeric" autoComplete="one-time-code" className="h-14 border-b border-ink bg-transparent text-2xl font-semibold tracking-[.18em] outline-none" />
        </label>
        <label className="grid gap-2 text-xs font-bold">
          Password
          <input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none" />
        </label>
        <label className="grid gap-2 text-xs font-bold">
          Confirm password
          <input name="confirmation" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none" />
        </label>
        <button className="min-h-12 bg-ink px-5 font-bold text-cream">
          Accept invitation
        </button>
      </form>
      <Link href="/admin/login" className="mt-6 w-fit border-b border-ink/50 pb-1 text-sm">
        Return to sign in
      </Link>
    </main>
  );
}
