export const normalizePagedItems = (response) => {
  const payload = response?.data ?? response ?? {};
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];
  const total = Number(payload?.total);
  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
  };
};

export const getId = (row) => row?._id || row?.id || "";

export const getEnquiryFromRow = (row) => row?.enquiry ?? row;

export const getEnquiryId = (row) => {
  const enquiry = getEnquiryFromRow(row);
  return enquiry?._id || enquiry?.id || row?.enquiryId || "";
};

export const hasBookedSession = (row) =>
  Boolean(row?.sessionType || row?.scheduledAt || row?.status);

export const getSessionTypeDisplay = (row) => {
  if (row?.sessionType) return formatLabel(row.sessionType);
  const enquiry = getEnquiryFromRow(row);
  if (enquiry?.service) return formatLabel(enquiry.service);
  return "—";
};

export const getSessionScheduledDisplay = (row) => {
  if (row?.scheduledAt) return formatDateTime(row.scheduledAt);
  const enquiry = getEnquiryFromRow(row);
  if (enquiry?.convertedAt) return `Converted · ${formatDateTime(enquiry.convertedAt)}`;
  return "Not scheduled";
};

export const getSessionStatusDisplay = (row) => {
  if (row?.status) return formatLabel(row.status);
  if (hasBookedSession(row)) return "Scheduled";
  const enquiry = getEnquiryFromRow(row);
  if (enquiry?.status) return formatLabel(enquiry.status);
  return "Awaiting booking";
};

export const getAssignedUserName = (row) => {
  const enquiry = getEnquiryFromRow(row);
  return enquiry?.name || enquiry?.email || row?.name || row?.email || "—";
};

export const getAssignedUserEmail = (row) => getEnquiryFromRow(row)?.email || row?.email || "—";

export const getAssignedUserPhone = (row) =>
  getEnquiryFromRow(row)?.phoneNumber || row?.phoneNumber || "";

export const getAssignedUserService = (row) => {
  const enquiry = getEnquiryFromRow(row);
  return formatLabel(enquiry?.service || row?.service);
};

export const getAssignedUserDate = (row) => {
  const enquiry = getEnquiryFromRow(row);
  return formatDateTime(
    enquiry?.convertedAt || enquiry?.updatedAt || enquiry?.createdAt || row?.createdAt,
  );
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

export const SESSION_TYPES = [
  { value: "initial_consultation", label: "Initial consultation" },
  { value: "follow_up", label: "Follow up" },
  { value: "assessment", label: "Assessment" },
  { value: "counselling", label: "Counselling" },
];

export const SESSION_STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" },
];
