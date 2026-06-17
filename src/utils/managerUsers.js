import { formatAccountRole } from "./accountProfile";

export const unwrapManagerPayload = (response) => response?.data ?? response ?? {};

export const getManagerUserId = (user) => user?.id || user?._id || "";

export const normalizeManagerUserList = (response) => {
  const payload = unwrapManagerPayload(response);
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload)
        ? payload
        : [];
  return {
    items,
    total: Number(payload?.total) || items.length,
    page: Number(payload?.page) || 1,
    limit: Number(payload?.limit) || items.length || 20,
    franchiseId: payload?.franchiseId || "",
    filters: payload?.filters || null,
  };
};

export const pickManagerUser = (response) => {
  const payload = unwrapManagerPayload(response);
  return payload?.user ?? payload;
};

export const formatEnquiryStatus = (status) => {
  const value = String(status || "none")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return value || "None";
};

export const formatFingerprintStatus = (fingerprint = {}) => {
  const status = String(fingerprint?.status || "").toLowerCase();
  if (status === "uploaded" || fingerprint?.hasFingerprint) return "Uploaded";
  if (status === "no_enquiry") return "No enquiry";
  if (status === "missing") return "Missing";
  return fingerprint?.hasFingerprint ? "Uploaded" : "Missing";
};

export const fingerprintStatusTone = (fingerprint = {}) => {
  const status = String(fingerprint?.status || "").toLowerCase();
  if (status === "uploaded" || fingerprint?.hasFingerprint) {
    return "bg-emerald-500/15 text-emerald-100 border-emerald-400/40";
  }
  if (status === "no_enquiry") return "bg-white/10 text-white/60 border-white/25";
  return "bg-amber-500/15 text-amber-100 border-amber-400/40";
};

export const enquiryStatusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "converted") return "bg-[#c9a86c]/25 text-[#fde68a] border-[#c9a86c]/50";
  if (value === "in_progress") return "bg-[#5eead4]/20 text-[#a7f3d0] border-[#5eead4]/50";
  if (value === "closed") return "bg-white/10 text-white/60 border-white/25";
  if (value === "none") return "bg-white/10 text-white/55 border-white/20";
  return "bg-white/15 text-white border-white/30";
};

export const accountStatusTone = (isActive) =>
  isActive
    ? "bg-emerald-500/15 text-emerald-100 border-emerald-400/40"
    : "bg-red-500/15 text-red-100 border-red-400/40";

export const formatManagerUserRole = (role) => formatAccountRole(role || "user");
