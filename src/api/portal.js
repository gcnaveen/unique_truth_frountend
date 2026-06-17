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

/** PATCH /portal/me — name and/or profilePhotoUrl */
export const patchPortalMe = async (token, payload) => {
  const response = await portalClient.patch("/portal/me", payload, authHeaders(token));
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

export const initiatePortalSessionPayment = async (token, sessionId, payload) => {
  const response = await portalClient.post(
    `/portal/sessions/${sessionId}/payments/initiate`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalSessionPaymentStatus = async (token, sessionId, params = {}) => {
  const response = await portalClient.get(
    `/portal/sessions/${sessionId}/payments/status`,
    { ...authHeaders(token), params },
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

export const getPortalEnquiryReports = async (token, enquiryId) => {
  const response = await portalClient.get(
    `/portal/enquiries/${enquiryId}/reports`,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalReportDownload = async (token, enquiryId, reportId) => {
  const response = await portalClient.get(
    `/portal/enquiries/${enquiryId}/reports/${reportId}/download`,
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

/** Full program payment — unlocks audio/report downloads for a converted enquiry. */
export const initiatePortalFullPayment = async (token, payload) => {
  const response = await portalClient.post(
    "/portal/payments/full/initiate",
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalAdvancePaymentStatus = async (token, params = {}) => {
  const response = await portalClient.get("/portal/payments/advance/status", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/** Per-enquiry full payment status — includes fullPayment.canDownloadMedia. */
export const getPortalFullPaymentStatus = async (token, enquiryId, params = {}) => {
  const response = await portalClient.get("/portal/payments/full/status", {
    ...authHeaders(token),
    params: { enquiryId, ...params },
  });
  return response.data;
};

export const presignPortalFingerprint = async (token, enquiryId, payload = {}) => {
  const response = await portalClient.post(
    `/portal/enquiries/${enquiryId}/fingerprint/presign`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const confirmPortalFingerprint = async (token, enquiryId, payload) => {
  const response = await portalClient.post(
    `/portal/enquiries/${enquiryId}/fingerprint/confirm`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalFingerprint = async (token, enquiryId) => {
  const response = await portalClient.get(
    `/portal/enquiries/${enquiryId}/fingerprint`,
    authHeaders(token),
  );
  return response.data;
};

export const deletePortalFingerprint = async (token, enquiryId) => {
  const response = await portalClient.delete(
    `/portal/enquiries/${enquiryId}/fingerprint`,
    authHeaders(token),
  );
  return response.data;
};

export const getPortalAnnouncements = async (token, params = {}) => {
  const response = await portalClient.get("/portal/announcements", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getPortalAnnouncementsUnreadCount = async (token) => {
  const response = await portalClient.get(
    "/portal/announcements/unread-count",
    authHeaders(token),
  );
  return response.data;
};

export const getPortalAnnouncementById = async (token, announcementId) => {
  const response = await portalClient.get(
    `/portal/announcements/${announcementId}`,
    authHeaders(token),
  );
  return response.data;
};

export const postPortalAnnouncementReply = async (token, announcementId, payload) => {
  const response = await portalClient.post(
    `/portal/announcements/${announcementId}/replies`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const putPortalAnnouncementReaction = async (token, announcementId, payload) => {
  const response = await portalClient.put(
    `/portal/announcements/${announcementId}/reactions`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const deletePortalAnnouncementReaction = async (token, announcementId) => {
  const response = await portalClient.delete(
    `/portal/announcements/${announcementId}/reactions`,
    authHeaders(token),
  );
  return response.data;
};

export const postPortalAnnouncementArchive = async (token, announcementId) => {
  const response = await portalClient.post(
    `/portal/announcements/${announcementId}/archive`,
    {},
    authHeaders(token),
  );
  return response.data;
};

export const deletePortalAnnouncementArchive = async (token, announcementId) => {
  const response = await portalClient.delete(
    `/portal/announcements/${announcementId}/archive`,
    authHeaders(token),
  );
  return response.data;
};
