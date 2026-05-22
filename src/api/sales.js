import axios from "axios";
import { API_URL } from "../../config";

const salesClient = axios.create({
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

/** GET /sales/enquiries — assigned enquiries for logged-in sales user */
export const getSalesEnquiries = async (token, params = {}) => {
  const response = await salesClient.get("/sales/enquiries", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/** GET /sales/enquiries/{enquiryId} */
export const getSalesEnquiryById = async (token, enquiryId) => {
  const response = await salesClient.get(`/sales/enquiries/${enquiryId}`, authHeaders(token));
  return response.data;
};

/** PATCH /sales/enquiries/{enquiryId}/status — { status, note? } */
export const updateSalesEnquiryStatus = async (token, enquiryId, payload) => {
  const response = await salesClient.patch(
    `/sales/enquiries/${enquiryId}/status`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** POST /sales/enquiries/{enquiryId}/follow-ups — { note } */
export const addSalesEnquiryFollowUp = async (token, enquiryId, payload) => {
  const response = await salesClient.post(
    `/sales/enquiries/${enquiryId}/follow-ups`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** GET /sales/dashboard/summary */
export const getSalesDashboardSummary = async (token) => {
  const response = await salesClient.get("/sales/dashboard/summary", authHeaders(token));
  return response.data;
};
