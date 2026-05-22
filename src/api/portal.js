import axios from "axios";
import { API_URL } from "../../config";

const portalClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const authHeaders = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

export const getPortalMe = async (token) => {
  const response = await portalClient.get("/portal/me", authHeaders(token));
  return response.data;
};

export const getPortalDashboard = async (token) => {
  const response = await portalClient.get("/portal/dashboard", authHeaders(token));
  return response.data;
};

export const getPortalEnquiries = async (token, params = {}) => {
  const response = await portalClient.get("/portal/enquiries", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getPortalEnquiryById = async (token, enquiryId) => {
  const response = await portalClient.get(
    `/portal/enquiries/${enquiryId}`,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalSessions = async (token, params = {}) => {
  const response = await portalClient.get("/portal/sessions", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getPortalSessionById = async (token, sessionId) => {
  const response = await portalClient.get(
    `/portal/sessions/${sessionId}`,
    authHeaders(token),
  );
  return response.data;
};

export const patchPortalPassword = async (token, payload) => {
  const response = await portalClient.patch("/portal/password", payload, authHeaders(token));
  return response.data;
};

export const getPortalEnquiryAudio = async (token, enquiryId) => {
  const response = await portalClient.get(
    `/portal/enquiries/${enquiryId}/audio`,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalAudioDownload = async (token, enquiryId, audioId) => {
  const response = await portalClient.get(
    `/portal/enquiries/${enquiryId}/audio/${audioId}/download`,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalDataExport = async (token) => {
  const response = await portalClient.get("/portal/me/data-export", {
    ...authHeaders(token),
    responseType: "blob",
  });
  return response;
};

export const postPortalDataRequest = async (token, payload) => {
  const response = await portalClient.post("/portal/data-requests", payload, authHeaders(token));
  return response.data;
};

export const initiatePortalAdvancePayment = async (token, payload) => {
  const response = await portalClient.post(
    "/portal/payments/advance/initiate",
    payload,
    authHeaders(token),
  );
  return response.data;
};
