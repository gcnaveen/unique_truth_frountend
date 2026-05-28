export const unwrapApiPayload = (response) => response?.data ?? response ?? {};

export const pickPresignUpload = (presignResponse) => {
  const payload = unwrapApiPayload(presignResponse);
  const uploadUrl = payload.uploadUrl || payload.upload_url || payload.url;
  const key = payload.key || payload.storageKey || payload.storage_key;
  return { uploadUrl, key, payload };
};

export const buildConfirmPayload = (presignPayload, file) => {
  const body = {};
  const key = presignPayload?.key || presignPayload?.storageKey || presignPayload?.storage_key;
  if (key) body.key = key;
  if (presignPayload?.s3Key) body.s3Key = presignPayload.s3Key;
  if (presignPayload?.uploadId) body.uploadId = presignPayload.uploadId;
  if (presignPayload?.assetId) body.assetId = presignPayload.assetId;
  if (file?.type) body.contentType = file.type;
  if (file?.name) {
    body.filename = file.name;
    body.fileName = file.name;
    body.originalName = file.name;
  }
  if (file?.size) body.size = file.size;
  return body;
};

export const REPORT_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const resolveReportContentType = (file) => {
  if (file?.type && REPORT_CONTENT_TYPES.includes(file.type)) return file.type;
  const name = String(file?.name || "").toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (name.endsWith(".doc")) return "application/msword";
  return null;
};

export const buildReportConfirmPayload = (presignPayload, file) => ({
  ...buildConfirmPayload(presignPayload, file),
  consentReportProcessing: true,
  attestationDataPrincipalConsentObtained: true,
});

export const putFileToPresignedUrl = async (uploadUrl, file, extraHeaders = {}) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      ...extraHeaders,
    },
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
};

export const normalizeMediaList = (response) => {
  const payload = unwrapApiPayload(response);
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  if (payload?.recordings) return payload.recordings;
  if (payload?.reports) return payload.reports;
  if (payload?.audio) return Array.isArray(payload.audio) ? payload.audio : [payload.audio];
  if (payload && typeof payload === "object" && (payload._id || payload.id)) return [payload];
  return [];
};

export const pickDownloadUrl = (response) => {
  const payload = unwrapApiPayload(response);
  return payload.downloadUrl || payload.url || payload.signedUrl || payload.signed_url || "";
};
