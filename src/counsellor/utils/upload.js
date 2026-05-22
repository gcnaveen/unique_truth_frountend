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
  if (presignPayload?.uploadId) body.uploadId = presignPayload.uploadId;
  if (presignPayload?.assetId) body.assetId = presignPayload.assetId;
  if (file?.type) body.contentType = file.type;
  if (file?.name) body.filename = file.name;
  if (file?.size) body.size = file.size;
  return body;
};

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
  if (payload?.audio) return Array.isArray(payload.audio) ? payload.audio : [payload.audio];
  if (payload && typeof payload === "object" && (payload._id || payload.id)) return [payload];
  return [];
};

export const pickDownloadUrl = (response) => {
  const payload = unwrapApiPayload(response);
  return payload.downloadUrl || payload.url || payload.signedUrl || payload.signed_url || "";
};
