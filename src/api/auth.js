import axios from "axios";
import { API_URL } from "../../config";
import { normalizeLoginEmail } from "../utils/authConstants";

const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Swagger LoginResponse: { token, user } */
export const pickAuthToken = (payload) =>
  payload?.token || payload?.access_token || payload?.accessToken || "";

export const pickAuthUser = (payload) => payload?.user ?? payload?.data ?? payload;

export const loginUser = async ({ email, password }) => {
  const response = await authClient.post("/auth/login", {
    email: normalizeLoginEmail(email),
    password: typeof password === "string" ? password.trim() : password,
  });
  return response.data;
};

/** Pull a user-facing message from axios / API error payloads. */
export const getAuthErrorMessage = (error, fallback = "Login failed. Please try again.") => {
  const data = error?.response?.data;
  const status = error?.response?.status;
  const apiMessage =
    (typeof data === "string" && data) ||
    data?.message ||
    data?.error ||
    (Array.isArray(data?.details) ? data.details.join(", ") : null);

  if (status === 401) {
    return (
      apiMessage ||
      "Invalid email or password. Use the exact password from when the account was created (minimum 10 characters), or the initialPassword shown after create."
    );
  }
  if (status === 403) {
    return apiMessage || "Your account does not have access to sign in here.";
  }
  if (status >= 500) {
    return apiMessage || "Server error. Please try again later.";
  }
  return apiMessage || error?.message || fallback;
};
