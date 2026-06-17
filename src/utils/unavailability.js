import { unwrapApiPayload } from "./profilePhoto";

export const UNAVAILABILITY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeUnavailabilityItems = (response) => {
  const payload = unwrapApiPayload(response);
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return {
    items,
    total: Number.isFinite(Number(payload?.total)) ? Number(payload.total) : items.length,
  };
};

export const groupUnavailabilityByDate = (items = []) => {
  const map = new Map();
  for (const item of items) {
    const date = String(item?.date || "").trim();
    if (!date) continue;
    map.set(date, item);
  }
  return map;
};

export const isPastDateKey = (dateKey) => {
  if (!UNAVAILABILITY_DATE_PATTERN.test(dateKey)) return true;
  const [y, m, d] = dateKey.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target < today;
};

export const formatUnavailabilityLabel = (dateKey) => {
  const date = parseDateKeyLocal(dateKey);
  if (!date) return dateKey;
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const parseDateKeyLocal = (key) => {
  if (!UNAVAILABILITY_DATE_PATTERN.test(key)) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toLocalDateKey = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const monthRangeKeys = (year, monthIndex) => {
  const from = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const to = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
};

export const pickUnavailabilityErrorMessage = (error) => {
  const data = error?.response?.data;
  if (Array.isArray(data?.pastDates) && data.pastDates.length > 0) {
    return `${data?.message || "Cannot mark past dates."} (${data.pastDates.join(", ")})`;
  }
  return data?.message || error?.message || "Request failed.";
};

export const isCounsellorUnavailableConflict = (error) => error?.response?.status === 409;
