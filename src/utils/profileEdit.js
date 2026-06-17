import { unwrapApiPayload } from "./profilePhoto";

const STAFF_PROFILE_EDIT = {
  canEditName: false,
  canEditProfilePhoto: true,
  canChangePassword: true,
  getProfileEndpoint: "/api/account/me",
  updateProfileEndpoint: "/api/account/me",
  changePasswordEndpoint: "/api/account/password",
};

const PORTAL_PROFILE_EDIT = {
  canEditName: true,
  canEditProfilePhoto: true,
  canChangePassword: true,
  getProfileEndpoint: "/api/portal/me",
  updateProfileEndpoint: "/api/portal/me",
  changePasswordEndpoint: "/api/account/password",
};

export const pickProfileEdit = (source, { isPortalUser = false } = {}) => {
  const payload = unwrapApiPayload(source);
  const edit = payload.profileEdit ?? source?.profileEdit;
  const fallback = isPortalUser ? PORTAL_PROFILE_EDIT : STAFF_PROFILE_EDIT;
  if (!edit || typeof edit !== "object") return { ...fallback };
  return { ...fallback, ...edit };
};

export const usesPortalProfileEndpoint = (profileEdit) =>
  String(profileEdit?.updateProfileEndpoint || "").includes("/portal/");

export const canManageStaffUnavailability = (profileEdit) =>
  profileEdit?.canManageUnavailability === true;
