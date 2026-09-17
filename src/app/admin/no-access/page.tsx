import { redirect } from "next/navigation";
import { clearAdminSession, getAdminIdentity } from "@/lib/auth";

export default async function AdminNoAccessPage() {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/login");

  async function logout() {
    "use server";
    await clearAdminSession();
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto grid min-h-[65svh] max-w-xl place-content-center px-5 py-12">
      <h1 className="font-display text-6xl tracking-[-.035em]">No sections assigned</h1>
      <p className="mt-5 max-w-lg leading-relaxed text-ink/65">
        Your account is active, but its role does not currently include an admin section. Ask an administrator to update your role.
      </p>
      <form action={logout} className="mt-7">
        <button className="min-h-11 border border-ink px-5 text-sm font-bold">Sign out</button>
      </form>
    </main>
  );
}
