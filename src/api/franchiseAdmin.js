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

/** GET /franchise-admin/enquiries/unassigned */
export const getFranchiseAdminUnassignedEnquiries = async (token, params = {}) => {
  const response = await franchiseAdminClient.get("/franchise-admin/enquiries/unassigned", {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

/** PATCH /franchise-admin/enquiries/{enquiryId}/assign — optional { salesId } */
export const assignFranchiseAdminEnquiry = async (token, enquiryId, body = {}) => {
  const response = await franchiseAdminClient.patch(
    `/franchise-admin/enquiries/${enquiryId}/assign`,
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
