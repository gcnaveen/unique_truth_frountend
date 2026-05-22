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

export const pickPortalAccessFromLogin = (response, userData = {}) => ({
  canAccessDashboard:
    response?.canAccessDashboard ??
    userData?.canAccessDashboard ??
    getAdvancePaymentStatus({ advancePayment: response?.advancePayment ?? userData?.advancePayment }) ===
      "completed",
  advancePayment: response?.advancePayment ?? userData?.advancePayment ?? null,
  counselingLevel:
    response?.counselingLevel ?? userData?.counselingLevel ?? userData?.counseling_level ?? "",
});
