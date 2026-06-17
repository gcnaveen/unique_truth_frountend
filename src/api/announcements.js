import axios from "axios";
import { API_URL } from "../../config";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const authHeaders = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

export const getAdminAnnouncements = async (token, params = {}) => {
  const response = await client.get("/admin/announcements", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getAdminAnnouncementById = async (token, announcementId) => {
  const response = await client.get(
    `/admin/announcements/${announcementId}`,
    authHeaders(token),
  );
  return response.data;
};

export const createAdminAnnouncement = async (token, payload) => {
  const response = await client.post("/admin/announcements", payload, authHeaders(token));
  return response.data;
};

export const patchAdminAnnouncement = async (token, announcementId, payload) => {
  const response = await client.patch(
    `/admin/announcements/${announcementId}`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const deleteAdminAnnouncement = async (token, announcementId) => {
  const response = await client.delete(
    `/admin/announcements/${announcementId}`,
    authHeaders(token),
  );
  return response.data;
};
