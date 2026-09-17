export const adminPermissions = [
  "dashboard:view",
  "orders:view",
  "orders:manage",
  "orders:view_financials",
  "products:view",
  "products:manage",
  "events:view",
  "events:manage",
  "site_assets:manage",
  "team:manage",
  "audit:view",
] as const;

export type AdminPermission = (typeof adminPermissions)[number];

export const delegatedPermissions: Array<{
  permission: AdminPermission;
  label: string;
  description: string;
}> = [
  { permission: "dashboard:view", label: "Dashboard", description: "Open the operations dashboard." },
  { permission: "orders:view", label: "View orders", description: "See customer and delivery details without payment values." },
  { permission: "orders:manage", label: "Update orders", description: "Move orders through processing, shipping and fulfilment." },
  { permission: "products:view", label: "View catalogue", description: "See products and inventory levels." },
  { permission: "products:manage", label: "Manage catalogue", description: "Create products and update stock, prices and images." },
  { permission: "events:view", label: "View community", description: "See events and community members." },
  { permission: "events:manage", label: "Manage community", description: "Create and publish events." },
  { permission: "site_assets:manage", label: "Website images", description: "Replace imagery used across the storefront." },
];

export function hasAdminPermission(
  roleSlug: string,
  permissions: string[],
  required: AdminPermission,
) {
  return roleSlug === "administrator" || permissions.includes(required);
}

export function firstAllowedAdminPath(
  roleSlug: string,
  permissions: string[],
) {
  if (hasAdminPermission(roleSlug, permissions, "dashboard:view")) return "/admin";
  if (hasAdminPermission(roleSlug, permissions, "orders:view")) return "/admin/orders";
  if (hasAdminPermission(roleSlug, permissions, "events:view")) return "/admin/events";
  return "/admin/no-access";
}
