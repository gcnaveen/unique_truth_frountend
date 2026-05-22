import axios from "axios";
import { API_URL } from "../../config";

const carriersClient = axios.create({
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

export const getCarriers = async (token, params = {}) => {
  const response = await carriersClient.get("/admin/carriers", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const createCarrier = async (token, payload) => {
  const response = await carriersClient.post("/admin/carriers", payload, authHeaders(token));
  return response.data;
};

export const updateCarrier = async (token, carrierId, payload) => {
  const response = await carriersClient.patch(
    `/admin/carriers/${carrierId}`,
    payload,
    authHeaders(token)
  );
  return response.data;
};
