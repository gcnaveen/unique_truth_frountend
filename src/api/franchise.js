import axios from "axios";
import { API_URL } from "../../config";

const franchiseClient = axios.create({
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

export const getFranchises = async (token, params = {}) => {
  const response = await franchiseClient.get("/admin/franchises", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getAllFranchises = async (token) => {
  const response = await franchiseClient.get("/admin/franchises/all", authHeaders(token));
  return response.data;
};

export const getFranchiseById = async (token, franchiseId) => {
  const response = await franchiseClient.get(
    `/admin/franchises/${franchiseId}`,
    authHeaders(token)
  );
  return response.data;
};

export const createFranchise = async (token, payload) => {
  const response = await franchiseClient.post("/admin/franchises", payload, authHeaders(token));
  return response.data;
};

export const updateFranchise = async (token, franchiseId, payload) => {
  const response = await franchiseClient.patch(
    `/admin/franchises/${franchiseId}`,
    payload,
    authHeaders(token)
  );
  return response.data;
};

export const deleteFranchise = async (token, franchiseId) => {
  const response = await franchiseClient.delete(
    `/admin/franchises/${franchiseId}`,
    authHeaders(token)
  );
  return response.data;
};
