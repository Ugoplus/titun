import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { delegatedPermissions } from "@/lib/admin-permissions";
import {
  createAdminChallenge,
  getAdminIdentity,
  writeAdminAudit,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  adminAuditLog,
  adminRoles,
  adminUsers,
} from "@/lib/db/schema";
import {
  isAdminEmailSecurityReady,
  sendAdminInvitation,
} from "@/lib/email";

export const dynamic = "force-dynamic";

async function requireAdministrator() {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/admin/login");
  if (identity.roleSlug !== "administrator") redirect("/admin?error=forbidden");
  return identity;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "custom-role";

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const identity = await requireAdministrator();
  const params = await searchParams;
  const db = getDb();
  const [roles, team, audit] = await Promise.all([
    db.select().from(adminRoles).orderBy(asc(adminRoles.name)),
    db
      .select({ user: adminUsers, role: adminRoles })
      .from(adminUsers)
      .innerJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
      .orderBy(asc(adminUsers.name)),
    db.select().from(adminAuditLog).orderBy(desc(adminAuditLog.createdAt)).limit(25),
  ]);

  async function createRole(formData: FormData) {
    "use server";
    const actor = await requireAdministrator();
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2 || name.length > 60)
      redirect("/admin/team?error=role");
    const allowed = new Set(delegatedPermissions.map(({ permission }) => permission));
    const permissions = formData
      .getAll("permissions")
      .map(String)
      .filter((permission) => allowed.has(permission as never));
    if (permissions.includes("orders:manage") && !permissions.includes("orders:view"))
      permissions.push("orders:view");
    if (permissions.includes("products:manage") && !permissions.includes("products:view"))
      permissions.push("products:view");
    if (permissions.includes("events:manage") && !permissions.includes("events:view"))
      permissions.push("events:view");
    if (permissions.length > 0 && !permissions.includes("dashboard:view"))
      permissions.push("dashboard:view");
    const [role] = await getDb()
      .insert(adminRoles)
      .values({
        name,
        slug: `${slugify(name)}-${randomUUID().slice(0, 8)}`,
        permissions: [...new Set(permissions)],
      })
      .returning();
    await writeAdminAudit({
      actorUserId: actor.id,
      action: "role.created",
      targetType: "admin_role",
      targetId: role.id,
      metadata: { name: role.name },
    });
    revalidatePath("/admin/team");
  }

  async function inviteUser(formData: FormData) {
    "use server";
    const actor = await requireAdministrator();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const roleId = String(formData.get("roleId") ?? "");
    if (!isAdminEmailSecurityReady())
      redirect("/admin/team?error=email-config");
    if (name.length < 2 || !email.includes("@"))
      redirect("/admin/team?error=user");
    const [role] = await getDb().select().from(adminRoles).where(eq(adminRoles.id, roleId)).limit(1);
    if (!role) redirect("/admin/team?error=user");
    let user: typeof adminUsers.$inferSelect;
    try {
      [user] = await getDb()
        .insert(adminUsers)
        .values({ name, email, roleId: role.id, active: false })
        .returning();
    } catch {
      redirect("/admin/team?error=duplicate");
    }
    const challenge = await createAdminChallenge(user.id, "invite");
    await sendAdminInvitation(user.email, user.name, challenge.code);
    await writeAdminAudit({
      actorUserId: actor.id,
      action: "user.invited",
      targetType: "admin_user",
      targetId: user.id,
      metadata: { email: user.email, role: role.name },
    });
    revalidatePath("/admin/team");
  }

  async function resendInvite(formData: FormData) {
    "use server";
    const actor = await requireAdministrator();
    const userId = String(formData.get("userId") ?? "");
    if (!isAdminEmailSecurityReady())
      redirect("/admin/team?error=email-config");
    const [user] = await getDb().select().from(adminUsers).where(eq(adminUsers.id, userId)).limit(1);
    if (!user || user.passwordHash) redirect("/admin/team?error=user");
    const challenge = await createAdminChallenge(user.id, "invite");
    await sendAdminInvitation(user.email, user.name, challenge.code);
    await writeAdminAudit({ actorUserId: actor.id, action: "user.invitation_resent", targetType: "admin_user", targetId: user.id });
    redirect("/admin/team?status=resent");
  }

  async function updateRole(formData: FormData) {
    "use server";
    const actor = await requireAdministrator();
    const userId = String(formData.get("userId") ?? "");
    const roleId = String(formData.get("roleId") ?? "");
    if (userId === actor.id) redirect("/admin/team?error=self");
    const [target] = await getDb()
      .select({ user: adminUsers, role: adminRoles })
      .from(adminUsers)
      .innerJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
      .where(eq(adminUsers.id, userId))
      .limit(1);
    const [nextRole] = await getDb().select().from(adminRoles).where(eq(adminRoles.id, roleId)).limit(1);
    if (!target || !nextRole) redirect("/admin/team?error=user");
    if (target.role.slug === "administrator" && nextRole.slug !== "administrator") {
      const [remaining] = await getDb()
        .select({ value: count() })
        .from(adminUsers)
        .innerJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
        .where(and(eq(adminUsers.active, true), eq(adminRoles.slug, "administrator"), ne(adminUsers.id, userId)));
      if (Number(remaining?.value ?? 0) < 1) redirect("/admin/team?error=last-admin");
    }
    await getDb()
      .update(adminUsers)
      .set({ roleId: nextRole.id, sessionVersion: sql`${adminUsers.sessionVersion} + 1`, updatedAt: new Date() })
      .where(eq(adminUsers.id, userId));
    await writeAdminAudit({ actorUserId: actor.id, action: "user.role_changed", targetType: "admin_user", targetId: userId, metadata: { role: nextRole.name } });
    revalidatePath("/admin/team");
  }

  async function toggleAccess(formData: FormData) {
    "use server";
    const actor = await requireAdministrator();
    const userId = String(formData.get("userId") ?? "");
    if (userId === actor.id) redirect("/admin/team?error=self");
    const [target] = await getDb()
      .select({ user: adminUsers, role: adminRoles })
      .from(adminUsers)
      .innerJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
      .where(eq(adminUsers.id, userId))
      .limit(1);
    if (!target || !target.user.passwordHash) redirect("/admin/team?error=user");
    if (target.user.active && target.role.slug === "administrator") {
      const [remaining] = await getDb()
        .select({ value: count() })
        .from(adminUsers)
        .innerJoin(adminRoles, eq(adminUsers.roleId, adminRoles.id))
        .where(and(eq(adminUsers.active, true), eq(adminRoles.slug, "administrator"), ne(adminUsers.id, userId)));
      if (Number(remaining?.value ?? 0) < 1) redirect("/admin/team?error=last-admin");
    }
    const active = !target.user.active;
    await getDb()
      .update(adminUsers)
      .set({ active, sessionVersion: sql`${adminUsers.sessionVersion} + 1`, updatedAt: new Date() })
      .where(eq(adminUsers.id, userId));
    await writeAdminAudit({ actorUserId: actor.id, action: active ? "user.access_restored" : "user.access_revoked", targetType: "admin_user", targetId: userId });
    revalidatePath("/admin/team");
  }

  const error =
    params.error === "self"
      ? "You cannot revoke or change your own administrator access."
      : params.error === "last-admin"
        ? "At least one active administrator must remain."
        : params.error === "duplicate"
          ? "A team member with that email already exists."
          : params.error === "email-config"
            ? "HTTPS and SMTP delivery must be configured before invitations can be sent."
          : params.error
            ? "The requested team change could not be completed."
            : null;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
      <AdminNavigation identity={identity} />
      <div className="mt-10 border-b border-ink/20 pb-8">
        <h1 className="font-display text-6xl tracking-[-.035em] md:text-8xl">Team access</h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/65">
          Invite staff, assign only the sections they need and revoke every active session immediately.
        </p>
      </div>
      {error && <p role="alert" className="mt-6 border border-red-800 bg-red-50 p-4 text-sm text-red-900">{error}</p>}
      {params.status === "resent" && <p role="status" className="mt-6 border border-leaf bg-mint/30 p-4 text-sm">A fresh invitation code has been sent.</p>}
      {!isAdminEmailSecurityReady() && <p role="status" className="mt-6 border border-clay bg-peach/35 p-4 text-sm">HTTPS and SMTP delivery are not fully connected. Roles and revocation are active, but invitations and verification codes remain unavailable until both are ready.</p>}

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl">Invite a team member</h2>
          <form action={inviteUser} className="mt-5 grid gap-4 border border-ink/20 bg-white p-5">
            <label className="grid gap-2 text-xs font-bold">Name<input required name="name" className="h-11 border-b border-ink/35 text-base font-normal outline-none" /></label>
            <label className="grid gap-2 text-xs font-bold">Email<input required name="email" type="email" autoComplete="off" className="h-11 border-b border-ink/35 text-base font-normal outline-none" /></label>
            <label className="grid gap-2 text-xs font-bold">Role<select required name="roleId" className="h-11 border border-ink/25 bg-white px-3 text-sm font-normal">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
            <button className="min-h-11 bg-ink px-5 text-sm font-bold text-white">Send invitation</button>
          </form>
        </div>
        <div>
          <h2 className="font-display text-4xl">Create a role</h2>
          <form action={createRole} className="mt-5 grid gap-4 border border-ink/20 bg-white p-5">
            <label className="grid gap-2 text-xs font-bold">Role name<input required name="name" className="h-11 border-b border-ink/35 text-base font-normal outline-none" /></label>
            <fieldset>
              <legend className="text-xs font-bold">Section permissions</legend>
              <div className="mt-3 grid gap-2">
                {delegatedPermissions.map((item) => (
                  <label key={item.permission} className="grid grid-cols-[auto_1fr] gap-x-3 border border-ink/15 p-3 text-sm">
                    <input type="checkbox" name="permissions" value={item.permission} className="mt-1" />
                    <span><span className="block font-semibold">{item.label}</span><span className="mt-1 block text-xs leading-relaxed text-ink/60">{item.description}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-xs leading-relaxed text-ink/60">Revenue, payment values, team administration and audit history remain administrator-only.</p>
            <button className="min-h-11 bg-ink px-5 text-sm font-bold text-white">Create role</button>
          </form>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-4xl">Team members</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead><tr className="border-b border-ink/30 text-xs uppercase tracking-[.06em] text-ink/65"><th className="py-3">Person</th><th>Role</th><th>Status</th><th>Last sign-in</th><th className="text-right">Access</th></tr></thead>
            <tbody>
              {team.map(({ user, role }) => {
                const invited = !user.passwordHash;
                return (
                  <tr key={user.id} className="border-b border-ink/15 align-top">
                    <td className="py-4"><span className="font-semibold">{user.name}</span><span className="mt-1 block text-xs text-ink/60">{user.email}</span></td>
                    <td className="py-4">
                      {user.id === identity.id ? <span>{role.name}</span> : <form action={updateRole} className="flex gap-2"><input type="hidden" name="userId" value={user.id} /><select name="roleId" defaultValue={role.id} className="h-10 border border-ink/25 bg-white px-2 text-sm">{roles.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select><button className="h-10 border border-ink px-3 text-xs font-bold">Save</button></form>}
                    </td>
                    <td className="py-4">{invited ? "Invitation pending" : user.active ? "Active" : "Revoked"}</td>
                    <td className="py-4 tabular-nums">{user.lastLoginAt ? user.lastLoginAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }) : "Never"}</td>
                    <td className="py-4 text-right">
                      {user.id === identity.id ? <span className="text-xs text-ink/55">Current user</span> : invited ? <form action={resendInvite}><input type="hidden" name="userId" value={user.id} /><button className="min-h-10 border border-ink px-3 text-xs font-bold">Resend invitation</button></form> : <form action={toggleAccess}><input type="hidden" name="userId" value={user.id} /><button className={`min-h-10 border px-3 text-xs font-bold ${user.active ? "border-red-800 text-red-900" : "border-ink bg-ink text-white"}`}>{user.active ? "Revoke access" : "Restore access"}</button></form>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-4xl">Recent security activity</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead><tr className="border-b border-ink/30 text-xs uppercase tracking-[.06em] text-ink/65"><th className="py-3">When</th><th>Action</th><th>Target</th></tr></thead>
            <tbody>{audit.map((entry) => <tr key={entry.id} className="border-b border-ink/15"><td className="py-3 tabular-nums">{entry.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })}</td><td>{entry.action.replaceAll("_", " ")}</td><td>{entry.targetType ?? "—"}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
