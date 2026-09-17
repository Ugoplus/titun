import Link from "next/link";
import type { AdminIdentity } from "@/lib/auth";
import { hasAdminPermission } from "@/lib/admin-permissions";

export function AdminNavigation({ identity }: { identity: AdminIdentity }) {
  const links = [
    { href: "/admin", label: "Dashboard", permission: "dashboard:view" as const },
    { href: "/admin/orders", label: "Orders", permission: "orders:view" as const },
    { href: "/admin/events", label: "Community", permission: "events:view" as const },
    { href: "/admin/content", label: "Website content", permission: "site_assets:manage" as const },
    { href: "/admin/team", label: "Team access", permission: "team:manage" as const },
  ].filter(({ permission }) =>
    hasAdminPermission(identity.roleSlug, identity.permissions, permission),
  );

  return (
    <nav aria-label="Admin sections" className="filter-scroll flex gap-2 overflow-x-auto border-b border-ink/20 pb-4">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="inline-flex min-h-11 shrink-0 items-center border border-ink/25 px-4 text-sm font-semibold hover:border-ink">
          {link.label}
        </Link>
      ))}
      <span className="ml-auto hidden shrink-0 self-center text-xs text-ink/60 md:block">
        {identity.name} · {identity.roleName}
      </span>
    </nav>
  );
}
