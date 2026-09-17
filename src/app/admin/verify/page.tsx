import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminChallenge,
  createAdminSession,
  getAdminUserIdentity,
  getPendingChallenge,
  recordAdminLogin,
  setPendingChallenge,
  verifyAdminChallenge,
} from "@/lib/auth";
import { firstAllowedAdminPath } from "@/lib/admin-permissions";
import { sendAdminLoginCode } from "@/lib/email";
import { consumeRateLimit } from "@/lib/rate-limit";

export default async function AdminVerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pending = await getPendingChallenge("login_2fa");
  if (!pending) redirect("/admin/login");
  const params = await searchParams;

  async function verify(formData: FormData) {
    "use server";
    const current = await getPendingChallenge("login_2fa");
    if (!current) redirect("/admin/login");
    const code = String(formData.get("code") ?? "").replace(/\s/g, "");
    const limit = await consumeRateLimit(await headers(), {
      scope: "admin-login-code",
      limit: 10,
      windowSeconds: 15 * 60,
      identity: current.userId,
    });
    if (!limit.allowed) redirect("/admin/verify?error=rate-limit");
    const valid = await verifyAdminChallenge({
      ...current,
      type: "login_2fa",
      code,
    });
    if (!valid) redirect("/admin/verify?error=code");
    const identity = await getAdminUserIdentity(current.userId);
    if (!identity) redirect("/admin/login?error=credentials");
    await recordAdminLogin(identity.id);
    await createAdminSession(identity);
    redirect(firstAllowedAdminPath(identity.roleSlug, identity.permissions));
  }

  async function resendCode() {
    "use server";
    const current = await getPendingChallenge("login_2fa");
    if (!current) redirect("/admin/login");
    const limit = await consumeRateLimit(await headers(), {
      scope: "admin-login-code-resend",
      limit: 3,
      windowSeconds: 15 * 60,
      identity: current.userId,
    });
    if (!limit.allowed) redirect("/admin/verify?error=rate-limit");
    const identity = await getAdminUserIdentity(current.userId);
    if (!identity) redirect("/admin/login");
    const challenge = await createAdminChallenge(identity.id, "login_2fa");
    await setPendingChallenge(identity.id, challenge.id, "login_2fa");
    await sendAdminLoginCode(identity.email, challenge.code);
    redirect("/admin/verify?status=resent");
  }

  const error =
    params.error === "rate-limit"
      ? "Too many code attempts. Request a fresh sign-in code later."
      : params.error
        ? "That code is incorrect, expired or has already been used."
        : null;

  return (
    <main className="mx-auto grid min-h-[65svh] max-w-md place-content-center px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
        Two-step verification
      </p>
      <h1 className="mt-3 font-display text-6xl tracking-[-.04em]">
        Check your email
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/65">
        Enter the six-digit code we sent to the email address on this account.
        It expires after 10 minutes.
      </p>
      {error && (
        <p role="alert" className="mt-5 border border-red-800 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </p>
      )}
      {params.status === "resent" && (
        <p role="status" className="mt-5 border border-leaf bg-mint/30 p-3 text-sm">
          A fresh verification code has been sent.
        </p>
      )}
      <form action={verify} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-xs font-bold">
          Verification code
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
        <button className="min-h-12 bg-ink px-5 font-bold text-cream">
          Verify and sign in
        </button>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <form action={resendCode}><button className="border-b border-ink/50 pb-1">Send a new code</button></form>
        <Link href="/admin/login" className="border-b border-ink/50 pb-1">Start again</Link>
      </div>
    </main>
  );
}
