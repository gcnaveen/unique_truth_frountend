export const unwrapPortalPayload = (response) => response?.data ?? response ?? {};

export const getAdvancePaymentStatus = (profile) => {
  const payload = unwrapPortalPayload(profile);
  return (
    payload?.advancePayment?.status ??
    payload?.paymentStatus ??
    payload?.advancePaymentStatus ??
    "pending"
  );
};

export const canAccessPortalDashboard = (profile) => {
  const payload = unwrapPortalPayload(profile);
  if (payload?.canAccessDashboard === true) return true;
  if (payload?.canAccessDashboard === false) return false;
  return getAdvancePaymentStatus(payload) === "completed";
};

/**
 * Full program payment — NOT the same as advance payment (dashboard access).
 * Uses GET /portal/payments/full/status → fullPayment.canDownloadMedia when present.
 */
export const isFullPaymentCompleted = (source) => {
  const payload = unwrapPortalPayload(source);
  if (!payload) return false;

  const full = payload.fullPayment;
  if (full?.canDownloadMedia === true) return true;
  if (full?.status === "completed" || full?.status === "paid") return true;

  if (payload.canDownloadMedia === true) return true;

  return false;
};

export const buildPortalPaymentContext = (...sources) => {
  const merged = {};
  for (const source of sources) {
    const payload = unwrapPortalPayload(source);
    if (!payload || typeof payload !== "object") continue;
    Object.assign(merged, payload);
    if (payload.advancePayment) {
      merged.advancePayment = { ...merged.advancePayment, ...payload.advancePayment };
    }
    if (payload.fullPayment) {
      merged.fullPayment = { ...merged.fullPayment, ...payload.fullPayment };
    }
    if (payload.enquiry) {
      merged.enquiry = { ...merged.enquiry, ...payload.enquiry };
    }
  }
  return merged;
};

/** Trust API flags for converted enquiries — full program payment no longer gates media. */
export const canDownloadPortalMedia = (mediaListResponse) => {
  const payload = unwrapPortalPayload(mediaListResponse);
  if (payload?.canDownload === false) return false;
  if (payload?.paymentRequired === true) return false;
  return true;
};

export const isPortalMediaItemLocked = (item) => item?.locked === true;

export const getPortalMediaDownloadBlockMessage = () =>
  "Downloads are not available for this file right now. Contact your counsellor if you need help.";

export const getPortalMediaDownloadErrorMessage = (error) => {
  const data = error?.response?.data;
  const code = data?.code;
  if (
    code === "FULL_PAYMENT_REQUIRED" ||
    code === "PAYMENT_INCOMPLETE" ||
    code === "PAYMENT_REQUIRED" ||
    code === "ADVANCE_PAYMENT_REQUIRED"
  ) {
    return getPortalMediaDownloadBlockMessage();
  }
  if (error?.response?.status === 402) {
    return getPortalMediaDownloadBlockMessage();
  }
  return data?.message || error?.message || "Could not download file.";
};

export const pickPortalAccessFromLogin = (response, userData = {}) => ({
  canAccessDashboard:
    response?.canAccessDashboard ??
    userData?.canAccessDashboard ??
    getAdvancePaymentStatus({ advancePayment: response?.advancePayment ?? userData?.advancePayment }) ===
      "completed",
  advancePayment: response?.advancePayment ?? userData?.advancePayment ?? null,
  fullPayment: response?.fullPayment ?? userData?.fullPayment ?? null,
  counselingLevel:
    response?.counselingLevel ?? userData?.counselingLevel ?? userData?.counseling_level ?? "",
});
