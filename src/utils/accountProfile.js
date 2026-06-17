import { unwrapApiPayload, pickUserProfilePhotoUrl } from "./profilePhoto";

export const pickAccountUser = (response) => {
  const payload = unwrapApiPayload(response);
  return payload.user ?? payload;
};

export const pickAccountPayload = (response) => unwrapApiPayload(response);

const ROLE_LABELS = {
  franchise_admin: "Franchise Admin",
  franchiseadmin: "Franchise Admin",
  admin: "Platform Admin",
  sales: "Sales",
  sales_person: "Sales",
  counsellor: "Counsellor",
  counselor: "Counsellor",
  manager: "Manager",
  operation_team: "Operation Team",
  user: "Member",
};

export const formatAccountRole = (role) => {
  const key = String(role || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  return ROLE_LABELS[key] || (role ? String(role).replace(/_/g, " ") : "—");
};

export const formatAccountDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatAccountDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** User-facing account fields for the profile details panel. */
export const buildAccountDetailRows = (user) => {
  if (!user || typeof user !== "object") return [];

  const rows = [
    { label: "Full name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: formatAccountRole(user.role) },
  ];

  if (user.franchiseId) {
    rows.push({ label: "Franchise ID", value: user.franchiseId, mono: true });
  }
  if (user.franchiseName || user.franchise?.name) {
    rows.push({
      label: "Franchise",
      value: user.franchiseName || user.franchise?.name,
    });
  }
  if (user.territory) rows.push({ label: "Territory", value: user.territory });
  if (user.speciality) rows.push({ label: "Speciality", value: user.speciality });
  if (user.counselingLevel) {
    rows.push({ label: "Counseling level", value: user.counselingLevel });
  }

  rows.push({
    label: "Account status",
    value: user.isActive === false ? "Inactive" : "Active",
    badge: user.isActive === false ? "inactive" : "active",
  });
  rows.push({ label: "Member since", value: formatAccountDate(user.createdAt) });
  rows.push({ label: "Last updated", value: formatAccountDateTime(user.updatedAt) });

  if (user._id || user.id) {
    rows.push({
      label: "Account ID",
      value: user._id || user.id,
      mono: true,
    });
  }

  return rows;
};

export { pickUserProfilePhotoUrl };
