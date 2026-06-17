import axios from "axios";
import { API_URL } from "../../config";

const accountClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const authHeaders = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

/** GET /account/me */
export const getAccountMe = async (token) => {
  const response = await accountClient.get("/account/me", authHeaders(token));
  return response.data;
};

/** PATCH /account/me — staff profile fields */
export const patchAccountMe = async (token, payload) => {
  const response = await accountClient.patch("/account/me", payload, authHeaders(token));
  return response.data;
};

/** PATCH /account/profile-photo — { profilePhotoUrl } */
export const patchAccountProfilePhoto = async (token, payload) => {
  const response = await accountClient.patch(
    "/account/profile-photo",
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** PATCH /account/password — all roles */
export const changeAccountPassword = async (token, payload) => {
  const response = await accountClient.patch(
    "/account/password",
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** GET /account/unavailability — sales & counsellor */
export const getAccountUnavailability = async (token, params = {}) => {
  const response = await accountClient.get("/account/unavailability", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/** POST /account/unavailability — { date } or { dates, note } */
export const postAccountUnavailability = async (token, payload) => {
  const response = await accountClient.post(
    "/account/unavailability",
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** DELETE /account/unavailability/{date} */
export const deleteAccountUnavailability = async (token, date) => {
  const response = await accountClient.delete(
    `/account/unavailability/${encodeURIComponent(date)}`,
    authHeaders(token),
  );
  return response.data;
};
