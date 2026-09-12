import { redirect } from "next/navigation";
import { createAdminSession, isAdmin, verifyAdminCredentials } from "@/lib/auth";

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;
  async function login(formData: FormData) { "use server"; const email = String(formData.get("email") ?? ""); const password = String(formData.get("password") ?? ""); if (!(await verifyAdminCredentials(email, password))) redirect("/admin/login?error=1"); await createAdminSession(email); redirect("/admin"); }
  return <div className="mx-auto grid min-h-[65svh] max-w-md place-content-center px-5"><p className="text-xs font-bold uppercase tracking-[.09em] text-ink/50">Private access</p><h1 className="mt-3 font-display text-6xl tracking-[-.05em]">TITUN admin</h1><p className="mt-4 text-sm text-ink/65">Manage products, pricing and stock.</p>{params.error && <p role="alert" className="mt-5 border border-red-800 bg-red-50 p-3 text-sm text-red-900">That email or password was not recognised.</p>}<form action={login} className="mt-8 grid gap-5"><label className="grid gap-2 text-xs font-bold">Email<input name="email" type="email" required autoComplete="username" className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none"/></label><label className="grid gap-2 text-xs font-bold">Password<input name="password" type="password" required autoComplete="current-password" className="h-12 border-b border-ink bg-transparent text-base font-normal outline-none"/></label><button className="mt-3 min-h-12 bg-ink px-5 font-bold text-cream">Sign in securely</button></form></div>;
}
