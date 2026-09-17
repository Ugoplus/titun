import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import {
  createAdminChallenge,
  getAdminUserByEmail,
  setPendingChallenge,
} from "@/lib/auth";
import {
  isAdminEmailSecurityReady,
  sendAdminPasswordResetCode,
} from "@/lib/email";
import { consumeRateLimit } from "@/lib/rate-limit";

export default async function ForgotAdminPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  async function requestReset(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!isAdminEmailSecurityReady())
      redirect("/admin/forgot-password?error=email-config");
    const requestHeaders = await headers();
    const [ipLimit, accountLimit] = await Promise.all([
      consumeRateLimit(requestHeaders, {
        scope: "admin-password-reset-ip",
        limit: 30,
        windowSeconds: 60 * 60,
      }),
      consumeRateLimit(requestHeaders, {
        scope: "admin-password-reset-account",
        limit: 5,
        windowSeconds: 60 * 60,
        identity: email || "unknown",
      }),
    ]);
    if (!ipLimit.allowed || !accountLimit.allowed)
      redirect("/admin/forgot-password?error=rate-limit");

    const user = await getAdminUserByEmail(email);
    if (user?.active) {
      const challenge = await createAdminChallenge(user.id, "password_reset");
      await setPendingChallenge(user.id, challenge.id, "password_reset");
      try {
        await sendAdminPasswordResetCode(user.email, challenge.code);
      } catch (error) {
        console.error("Admin password reset email could not be sent", error);
      }
    } else {
      await setPendingChallenge(randomUUID(), randomUUID(), "password_reset");
    }
    redirect("/admin/reset-password?sent=1");
  }

  return (
    <main className="mx-auto grid min-h-[65svh] max-w-md place-content-center px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
        Account recovery
      </p>
      <h1 className="mt-3 font-display text-6xl tracking-[-.04em]">
        Reset your password
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/65">
        Enter your admin email. If it belongs to an active account, we will send
        a six-digit reset code.
      </p>
      {params.error === "rate-limit" && (
        <p role="alert" className="mt-5 border border-red-800 bg-red-50 p-3 text-sm text-red-900">
          Too many reset requests. Please wait before trying again.
        </p>
      )}
      {params.error === "email-config" && (
        <p role="alert" className="mt-5 border border-red-800 bg-red-50 p-3 text-sm text-red-900">
          Email recovery is not available yet. Ask the server administrator to finish HTTPS and SMTP setup.
        </p>
      )}
      <form action={requestReset} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-xs font-bold">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none"
          />
        </label>
        <button className="min-h-12 bg-ink px-5 font-bold text-cream">
          Send reset code
        </button>
      </form>
      <Link href="/admin/login" className="mt-6 w-fit border-b border-ink/50 pb-1 text-sm">
        Return to sign in
      </Link>
    </main>
  );
}
