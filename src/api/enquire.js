import axios from "axios";
import { API_URL } from "../../config";

const enquireClient = axios.create({
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

export const getEnquiries = async (token, { service } = {}) => {
  const response = await enquireClient.get("/enquiries", {
    ...authHeaders(token),
    params: service ? { service } : undefined,
  });
  return response.data;
};

export const getEnquiriesStats = async (token) => {
  const response = await enquireClient.get("/enquiries/stats", authHeaders(token));
  return response.data;
};

export const getCompletePackages = async (token, { service } = {}) => {
  const response = await enquireClient.get("/enquiries/complete-packages", {
    ...authHeaders(token),
    params: service ? { service } : undefined,
  });
  return response.data;
};

