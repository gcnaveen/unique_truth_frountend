import axios from "axios";
import { API_URL } from "../../config";

const counsellorClient = axios.create({
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

export const getCounsellorDashboardSummary = async (token) => {
  const response = await counsellorClient.get("/counsellor/dashboard/summary", authHeaders(token));
  return response.data;
};

export const getCounsellorAssignedUsers = async (token, params = {}) => {
  const response = await counsellorClient.get("/counsellor/assigned-users", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getCounsellorAssignedUserDetail = async (token, enquiryId) => {
  const response = await counsellorClient.get(
    `/counsellor/assigned-users/${enquiryId}`,
    authHeaders(token),
  );
  return response.data;
};

export const getCounsellorSessions = async (token, params = {}) => {
  const response = await counsellorClient.get("/counsellor/sessions", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const createCounsellorSession = async (token, payload) => {
  const response = await counsellorClient.post("/counsellor/sessions", payload, authHeaders(token));
  return response.data;
};

export const getCounsellorSessionById = async (token, sessionId) => {
  const response = await counsellorClient.get(
    `/counsellor/sessions/${sessionId}`,
    authHeaders(token),
  );
  return response.data;
};

export const patchCounsellorSessionNotes = async (token, sessionId, payload) => {
  const response = await counsellorClient.patch(
    `/counsellor/sessions/${sessionId}/notes`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const patchCounsellorSessionStatus = async (token, sessionId, payload) => {
  const response = await counsellorClient.patch(
    `/counsellor/sessions/${sessionId}/status`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const presignCounsellorFingerprint = async (token, enquiryId, payload = {}) => {
  const response = await counsellorClient.post(
    `/counsellor/assigned-users/${enquiryId}/fingerprint/presign`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const confirmCounsellorFingerprint = async (token, enquiryId, payload) => {
  const response = await counsellorClient.post(
    `/counsellor/assigned-users/${enquiryId}/fingerprint/confirm`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getCounsellorFingerprint = async (token, enquiryId) => {
  const response = await counsellorClient.get(
    `/counsellor/assigned-users/${enquiryId}/fingerprint`,
    authHeaders(token),
  );
  return response.data;
};

export const presignCounsellorAudio = async (token, enquiryId, payload = {}) => {
  const response = await counsellorClient.post(
    `/counsellor/assigned-users/${enquiryId}/audio/presign`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const confirmCounsellorAudio = async (token, enquiryId, payload) => {
  const response = await counsellorClient.post(
    `/counsellor/assigned-users/${enquiryId}/audio/confirm`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getCounsellorAudioList = async (token, enquiryId) => {
  const response = await counsellorClient.get(
    `/counsellor/assigned-users/${enquiryId}/audio`,
    authHeaders(token),
  );
  return response.data;
};

export const getCounsellorAudioDownload = async (token, enquiryId, audioId) => {
  const response = await counsellorClient.get(
    `/counsellor/assigned-users/${enquiryId}/audio/${audioId}/download`,
    authHeaders(token),
  );
  return response.data;
};
