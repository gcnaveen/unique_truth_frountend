/** Normalize role string from login / API for routing and guards. */
export const normalizeAuthRole = (roleValue) => {
  const r = String(roleValue || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  if (r === "franchise_admin" || r === "franchiseadmin") return "franchise_admin";
  if (r === "super_admin" || r === "platform_admin") return "admin";
  if (r === "sales_person" || r === "salesperson") return "sales";
  if (r === "counselor") return "counsellor";
  return r;
};

export const roleMatches = (actualRole, expectedRole) =>
  normalizeAuthRole(actualRole) === normalizeAuthRole(expectedRole);

export const isPlatformAdmin = (role) => {
  const r = normalizeAuthRole(role);
  return r === "admin";
};

export const isFranchiseAdmin = (role) => normalizeAuthRole(role) === "franchise_admin";

export const isSales = (role) => normalizeAuthRole(role) === "sales";

export const isCounsellor = (role) => normalizeAuthRole(role) === "counsellor";

export const isPortalUser = (role) => normalizeAuthRole(role) === "user";

export const getDashboardHome = (role) => {
  if (isPlatformAdmin(role)) return "/admin/dashboard/questionaries";
  if (isFranchiseAdmin(role)) return "/franchise-admin/dashboard/team";
  if (isSales(role)) return "/sales/dashboard/enquiries";
  if (isCounsellor(role)) return "/counsellor/dashboard";
  if (isPortalUser(role)) return "/portal/dashboard";
  return "/portal/dashboard";
};
