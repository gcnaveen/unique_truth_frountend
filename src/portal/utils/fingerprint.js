import { getPortalEnquiries, getPortalFingerprint } from "../../api/portal";
import { unwrapPortalPayload } from "./access";
import { getId, normalizePagedItems } from "./format";
import { unwrapApiPayload as unwrapUploadPayload } from "../../counsellor/utils/upload";

export const FINGERPRINT_FOCUS_PARAM = "focus";
export const FINGERPRINT_FOCUS_VALUE = "fingerprint";
export const FINGERPRINT_SECTION_ID = "portal-fingerprint-upload";

export const isFingerprintFocus = (searchParams) =>
  searchParams?.get(FINGERPRINT_FOCUS_PARAM) === FINGERPRINT_FOCUS_VALUE;

export const buildJourneyFingerprintPath = (enquiryId) => {
  const base = enquiryId
    ? `/portal/dashboard/enquiries/${enquiryId}`
    : "/portal/dashboard/enquiries";
  return `${base}?${FINGERPRINT_FOCUS_PARAM}=${FINGERPRINT_FOCUS_VALUE}`;
};

export const pickFingerprintFromResponse = (response) => {
  const payload = unwrapUploadPayload(response);
  const record = payload?.fingerprint ?? null;
  if (!record || record === null) return null;
  return {
    record,
    viewUrl: payload?.viewUrl || record?.viewUrl || record?.url || "",
    expiresInHours: payload?.expiresInHours ?? record?.expiresInHours,
  };
};

export const hasActivePortalFingerprint = (response) => {
  const picked = pickFingerprintFromResponse(response);
  if (!picked?.record) return false;
  const expiresAt = picked.record?.expiresAt;
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
};

export const resolvePrimaryEnquiry = (enquiries = [], profile = null) => {
  const list = Array.isArray(enquiries) ? enquiries : [];
  const normalized = list.map((row) => row?.enquiry ?? row).filter(Boolean);

  const profileEnquiry = profile?.enquiry;
  if (profileEnquiry) {
    const profileId = getId(profileEnquiry);
    const match = normalized.find((item) => getId(item) === profileId);
    return match || profileEnquiry;
  }

  const profileEnquiryId = profile?.enquiryId;
  if (profileEnquiryId) {
    const match = normalized.find((item) => getId(item) === profileEnquiryId);
    if (match) return match;
  }

  const converted = normalized.find(
    (item) => item?.status === "converted" || item?.convertedAt,
  );
  if (converted) return converted;

  return normalized[0] || null;
};

export const resolvePrimaryEnquiryId = (enquiries = [], profile = null) =>
  getId(resolvePrimaryEnquiry(enquiries, profile));

export const loadPortalEnquiryList = async (accessToken) => {
  const response = await getPortalEnquiries(accessToken, { limit: 50, skip: 0 });
  const { items } = normalizePagedItems(response);
  if (items.length) return items;
  return normalizePagedItems(unwrapPortalPayload(response)).items;
};

export const checkPortalFingerprintStatus = async (accessToken, enquiryId) => {
  if (!accessToken || !enquiryId) {
    return { enquiryId: "", hasFingerprint: false, paymentRequired: false };
  }

  try {
    const response = await getPortalFingerprint(accessToken, enquiryId);
    return {
      enquiryId,
      hasFingerprint: hasActivePortalFingerprint(response),
      paymentRequired: false,
      fingerprint: pickFingerprintFromResponse(response),
    };
  } catch (error) {
    if (error?.response?.status === 402) {
      return { enquiryId, hasFingerprint: false, paymentRequired: true };
    }
    return { enquiryId, hasFingerprint: false, paymentRequired: false, error };
  }
};
