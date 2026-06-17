import axios from "axios";
import { API_URL } from "../../config";

const uploadsClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const authHeaders = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

/** POST /uploads/profile-photo/presign */
export const presignProfilePhoto = async (token, payload) => {
  const response = await uploadsClient.post(
    "/uploads/profile-photo/presign",
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** POST /uploads/profile-photo/confirm */
export const confirmProfilePhoto = async (token, payload) => {
  const response = await uploadsClient.post(
    "/uploads/profile-photo/confirm",
    payload,
    authHeaders(token),
  );
  return response.data;
};
