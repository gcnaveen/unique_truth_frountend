export const API_URL =
  "https://mihakrdgx5.execute-api.ap-south-1.amazonaws.com/api/";

/** Production site URL — used when building payment return links at build time. */
export const APP_URL = (import.meta.env.VITE_APP_URL || "").replace(/\/$/, "");

/** Current app origin (live site in prod, localhost in dev). */
export const getAppOrigin = () => {
  if (typeof window !== "undefined") {
    const origin = window.location?.origin;
    if (origin && origin !== "null") return origin.replace(/\/$/, "");
  }
  return APP_URL;
};

export const JWT_SECRET = "uniquetruth!!2026";
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
};