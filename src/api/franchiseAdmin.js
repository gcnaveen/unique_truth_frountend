import axios from "axios";
import { API_URL } from "../../config";

const franchiseAdminClient = axios.create({
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

/**
 * GET /franchise-admin/team — users in the franchise admin's franchise.
 * @param {{ role?: string; limit?: number; skip?: number }} params
 */
export const getFranchiseAdminTeam = async (token, params = {}) => {
  const response = await franchiseAdminClient.get("/franchise-admin/users", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/**
 * POST /franchise-admin/users — add user under own franchise (franchise from token).
 */
export const createFranchiseAdminUser = async (token, payload) => {
  const response = await franchiseAdminClient.post(
    "/franchise-admin/users",
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** GET /franchise-admin/users/{userId} */
export const getFranchiseAdminUserById = async (token, userId) => {
  const response = await franchiseAdminClient.get(
    `/franchise-admin/users/${userId}`,
    authHeaders(token),
  );
  return response.data;
};

/** PATCH /franchise-admin/users/{userId} */
export const updateFranchiseAdminUser = async (token, userId, payload) => {
  const response = await franchiseAdminClient.patch(
    `/franchise-admin/users/${userId}`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** PATCH /franchise-admin/users/{userId}/profile-photo */
export const patchFranchiseAdminUserProfilePhoto = async (token, userId, payload) => {
  const response = await franchiseAdminClient.patch(
    `/franchise-admin/users/${userId}/profile-photo`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** PATCH /franchise-admin/users/{userId}/block — { isActive } */
export const blockFranchiseAdminUser = async (token, userId, payload) => {
  const response = await franchiseAdminClient.patch(
    `/franchise-admin/users/${userId}/block`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** GET /franchise-admin/enquiries */
export const getFranchiseAdminEnquiries = async (token, params = {}) => {
  const response = await franchiseAdminClient.get("/franchise-admin/enquiries", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/** GET /franchise-admin/enquiries/unassigned */
export const getFranchiseAdminUnassignedEnquiries = async (token, params = {}) => {
  const response = await franchiseAdminClient.get("/franchise-admin/enquiries/unassigned", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/** GET /franchise-admin/enquiries/{enquiryId} */
export const getFranchiseAdminEnquiryById = async (token, enquiryId) => {
  const response = await franchiseAdminClient.get(
    `/franchise-admin/enquiries/${enquiryId}`,
    authHeaders(token),
  );
  return response.data;
};

/** GET /franchise-admin/settings/enquiry-assignment */
export const getFranchiseAdminEnquiryAssignmentSettings = async (token) => {
  const response = await franchiseAdminClient.get(
    "/franchise-admin/settings/enquiry-assignment",
    authHeaders(token),
  );
  return response.data;
};

/** PATCH /franchise-admin/settings/enquiry-assignment — { autoAssign: boolean } */
export const patchFranchiseAdminEnquiryAssignmentSettings = async (token, payload) => {
  const response = await franchiseAdminClient.patch(
    "/franchise-admin/settings/enquiry-assignment",
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** PATCH /franchise-admin/enquiries/{enquiryId}/assign-team — { salesId, counsellorId } */
export const assignFranchiseAdminEnquiryTeam = async (token, enquiryId, body = {}) => {
  const response = await franchiseAdminClient.patch(
    `/franchise-admin/enquiries/${enquiryId}/assign-team`,
    body,
    authHeaders(token),
  );
  return response.data;
};

/** GET /franchise-admin/carriers */
export const getFranchiseAdminCarriers = async (token, params = {}) => {
  const response = await franchiseAdminClient.get("/franchise-admin/carriers", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/** POST /franchise-admin/carriers */
export const createFranchiseAdminCarrier = async (token, payload) => {
  const response = await franchiseAdminClient.post(
    "/franchise-admin/carriers",
    payload,
    authHeaders(token),
  );
  return response.data;
};

/** PATCH /franchise-admin/carriers/{carrierId} — { isActive } */
export const patchFranchiseAdminCarrier = async (token, carrierId, payload) => {
  const response = await franchiseAdminClient.patch(
    `/franchise-admin/carriers/${carrierId}`,
    payload,
    authHeaders(token),
  );
  return response.data;
};
