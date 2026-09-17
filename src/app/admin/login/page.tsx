import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  createAdminChallenge,
  createAdminSession,
  isAdmin,
  recordAdminLogin,
  setPendingChallenge,
  verifyAdminCredentials,
} from "@/lib/auth";
import {
  isAdminEmailSecurityReady,
  sendAdminLoginCode,
} from "@/lib/email";
import { firstAllowedAdminPath } from "@/lib/admin-permissions";
import { consumeRateLimit } from "@/lib/rate-limit";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const requestHeaders = await headers();
    const [ipLimit, accountLimit] = await Promise.all([
      consumeRateLimit(requestHeaders, {
        scope: "admin-login-ip",
        limit: 120,
        windowSeconds: 60 * 60,
      }),
      consumeRateLimit(requestHeaders, {
        scope: "admin-login-account",
        limit: 10,
        windowSeconds: 60 * 60,
        identity: email || "unknown",
      }),
    ]);
    if (!ipLimit.allowed || !accountLimit.allowed)
      redirect("/admin/login?error=rate-limit");

    const identity = await verifyAdminCredentials(email, password);
    if (!identity) redirect("/admin/login?error=credentials");

    if (!isAdminEmailSecurityReady()) {
      await recordAdminLogin(identity.id);
      await createAdminSession(identity);
      redirect(firstAllowedAdminPath(identity.roleSlug, identity.permissions));
    }

    const challenge = await createAdminChallenge(identity.id, "login_2fa");
    await setPendingChallenge(identity.id, challenge.id, "login_2fa");
    try {
      await sendAdminLoginCode(identity.email, challenge.code);
    } catch (error) {
      console.error("Admin sign-in code could not be sent", error);
      redirect("/admin/login?error=email");
    }
    redirect("/admin/verify");
  }

  const error =
    params.error === "rate-limit"
      ? "Too many sign-in attempts. Please wait before trying again."
      : params.error === "email"
        ? "The verification email could not be sent. Please try again."
        : params.error
          ? "That email or password was not recognised."
          : null;
  const emailVerificationEnabled = isAdminEmailSecurityReady();

  return (
    <main className="mx-auto grid min-h-[65svh] max-w-md place-content-center px-5 py-12">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-ink/70">
        Private access
      </p>
      <h1 className="mt-3 font-display text-6xl tracking-[-.04em]">
        TITUN admin
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/65">
        {emailVerificationEnabled
          ? "Sign in with your password. We will email a verification code before access is granted."
          : "Sign in with your administrator email and password."}
      </p>
      {params.reset === "complete" && (
        <p role="status" className="mt-5 border border-leaf bg-mint/30 p-3 text-sm">
          Your password has been reset. Sign in with the new password.
        </p>
      )}
      {params.invite === "accepted" && (
        <p role="status" className="mt-5 border border-leaf bg-mint/30 p-3 text-sm">
          Your invitation is complete. Sign in to continue.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 border border-red-800 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </p>
      )}
      <form action={login} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-xs font-bold">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none"
          />
        </label>
        <label className="grid gap-2 text-xs font-bold">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none"
          />
        </label>
        <button className="mt-3 min-h-12 bg-ink px-5 font-bold text-cream">
          Continue securely
        </button>
      </form>
      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm">
        <Link href="/admin/forgot-password" className="border-b border-ink/50 pb-1">
          Forgot password?
        </Link>
        <Link href="/admin/accept-invite" className="border-b border-ink/50 pb-1">
          Accept an invitation
        </Link>
      </div>
    </main>
  );
}
