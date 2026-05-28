import { unwrapPortalPayload } from "./access";
import { getPricingBreakdown } from "./pricing";

export const pickCheckoutUrl = (response) => {
  const data = unwrapPortalPayload(response);
  return (
    data?.checkoutPageUrl ||
    data?.checkoutUrl ||
    data?.redirectUrl ||
    data?.url ||
    ""
  );
};

export const pickFullPaymentFromStatus = (statusResponse) => {
  const payload = unwrapPortalPayload(statusResponse);
  return payload?.fullPayment ?? payload;
};

export const getFullPaymentSummary = (paymentContext) => {
  const p = unwrapPortalPayload(paymentContext);
  const full = p?.fullPayment ?? {};
  const adv = p?.advancePayment ?? {};
  const service = p?.enquiry?.service || p?.service || "";
  const level = p?.counselingLevel || p?.counsellingLevel || "basic";
  const rule = getPricingBreakdown({ service, counselingLevel: level });

  const total =
    full.totalRupees ??
    full.totalAmount ??
    full.programTotalRupees ??
    adv.totalRupees ??
    adv.programAmountRupees ??
    rule.total;

  const paid =
    full.paidRupees ??
    full.paidAmount ??
    full.amountPaidRupees ??
    adv.paidRupees ??
    adv.amountPaidRupees ??
    adv.amountRupees;

  let remaining =
    full.remainingRupees ??
    full.remainingAmount ??
    full.balanceDue ??
    full.amountDueRupees ??
    full.balanceRupees;

  if (remaining == null && typeof total === "number" && typeof paid === "number") {
    remaining = Math.max(0, total - paid);
  }

  const minRupees = full.minRupees ?? 1;

  return {
    total,
    paid,
    remaining: typeof remaining === "number" ? remaining : null,
    minRupees,
    status: full.status,
    canDownloadMedia: full.canDownloadMedia === true,
  };
};

export const stashPaymentReturn = ({ type = "full", returnTo = "", enquiryId = "" }) => {
  try {
    sessionStorage.setItem("portalPaymentType", type);
    sessionStorage.setItem("portalPaymentReturnTo", returnTo);
    if (enquiryId) sessionStorage.setItem("portalPaymentEnquiryId", enquiryId);
  } catch {
    /* ignore */
  }
};

export const readPaymentReturn = () => {
  try {
    return {
      type: sessionStorage.getItem("portalPaymentType") || "full",
      returnTo: sessionStorage.getItem("portalPaymentReturnTo") || "",
      enquiryId: sessionStorage.getItem("portalPaymentEnquiryId") || "",
    };
  } catch {
    return { type: "full", returnTo: "", enquiryId: "" };
  }
};

export const clearPaymentReturn = () => {
  try {
    sessionStorage.removeItem("portalPaymentType");
    sessionStorage.removeItem("portalPaymentReturnTo");
    sessionStorage.removeItem("portalPaymentEnquiryId");
  } catch {
    /* ignore */
  }
};
