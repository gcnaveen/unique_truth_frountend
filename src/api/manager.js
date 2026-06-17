import axios from "axios";
import { API_URL } from "../../config";

const managerClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const authHeaders = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

export const getManagerUsers = async (token, params = {}) => {
  const response = await managerClient.get("/manager/users", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getManagerUserById = async (token, userId) => {
  const response = await managerClient.get(`/manager/users/${userId}`, authHeaders(token));
  return response.data;
};

export const patchManagerUserBlock = async (token, userId, payload) => {
  const response = await managerClient.patch(
    `/manager/users/${userId}/block`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const presignManagerFingerprint = async (token, userId, payload) => {
  const response = await managerClient.post(
    `/manager/users/${userId}/fingerprint/presign`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const confirmManagerFingerprint = async (token, userId, payload) => {
  const response = await managerClient.post(
    `/manager/users/${userId}/fingerprint/confirm`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getManagerFingerprint = async (token, userId) => {
  const response = await managerClient.get(
    `/manager/users/${userId}/fingerprint`,
    authHeaders(token),
  );
  return response.data;
};
