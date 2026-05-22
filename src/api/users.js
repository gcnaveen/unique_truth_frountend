import axios from "axios";
import { API_URL } from "../../config";

const usersClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authHeaders = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

export const getAdminUsers = async (token, params = {}) => {
  const response = await usersClient.get("/admin/users", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const createAdminUser = async (token, payload) => {
  const response = await usersClient.post("/admin/users", payload, authHeaders(token));
  return response.data;
};

export const getAdminUserById = async (token, userId) => {
  const response = await usersClient.get(`/admin/users/${userId}`, authHeaders(token));
  return response.data;
};

export const updateAdminUser = async (token, userId, payload) => {
  const response = await usersClient.patch(`/admin/users/${userId}`, payload, authHeaders(token));
  return response.data;
};

export const blockAdminUser = async (token, userId, payload) => {
  const response = await usersClient.patch(
    `/admin/users/${userId}/block`,
    payload,
    authHeaders(token)
  );
  return response.data;
};
