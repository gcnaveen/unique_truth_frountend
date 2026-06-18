export const MAX_ANNOUNCEMENT_ATTACHMENTS = 10;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/3gpp",
  "video/x-msvideo",
]);

const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]);

const KIND_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

const KIND_ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4,video/webm,video/quicktime,video/3gpp,video/x-msvideo",
  document:
    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/zip,application/x-zip-compressed",
};

export const getAttachmentKindConfig = (kind) => ({
  kind,
  label: kind === "image" ? "Photo" : kind === "video" ? "Video" : "File",
  maxBytes: KIND_LIMITS[kind] || KIND_LIMITS.document,
  accept: KIND_ACCEPT[kind] || KIND_ACCEPT.document,
});

const normalizeContentType = (contentType) => {
  const type = String(contentType || "").toLowerCase();
  return type === "image/jpg" ? "image/jpeg" : type;
};

const inferKindFromName = (fileName = "") => {
  const name = String(fileName).toLowerCase();
  if (/\.(jpe?g|png|webp|gif)$/.test(name)) return "image";
  if (/\.(mp4|webm|mov|3gp|avi)$/.test(name)) return "video";
  return "document";
};

export const resolveAttachmentKind = (file) => {
  const contentType = normalizeContentType(file?.type);
  if (IMAGE_TYPES.has(contentType)) return "image";
  if (VIDEO_TYPES.has(contentType)) return "video";
  if (DOCUMENT_TYPES.has(contentType)) return "document";
  return inferKindFromName(file?.name);
};

export const normalizeAttachmentContentType = (file, kind) => {
  const contentType = normalizeContentType(file?.type);
  if (kind === "image" && IMAGE_TYPES.has(contentType)) return contentType;
  if (kind === "video" && VIDEO_TYPES.has(contentType)) return contentType;
  if (kind === "document" && DOCUMENT_TYPES.has(contentType)) return contentType;
  if (kind === "image") return "image/jpeg";
  if (kind === "video") return "video/mp4";
  if (kind === "document") return "application/pdf";
  return contentType || "application/octet-stream";
};

export const getAttachmentId = (attachment) =>
  attachment?.id || attachment?._id || attachment?.attachmentId || "";

export const pickAttachmentFromConfirm = (response) => {
  const payload = response?.data ?? response ?? {};
  return payload?.attachment ?? payload;
};

export const pickAttachmentFromDownload = (response) => {
  const payload = response?.data ?? response ?? {};
  return payload?.attachment ?? payload;
};

export const buildAttachmentInput = (confirmed) => ({
  s3Key: confirmed?.s3Key || confirmed?.key,
  kind: confirmed?.kind,
  contentType: confirmed?.contentType,
  fileName: confirmed?.fileName || confirmed?.originalName,
  originalName: confirmed?.originalName || confirmed?.fileName,
  sizeBytes: confirmed?.sizeBytes ?? confirmed?.size,
});

export const getAnnouncementAttachments = (announcement) => {
  if (!Array.isArray(announcement?.attachments)) return [];
  return announcement.attachments;
};

export const announcementHasMedia = (announcement) =>
  Boolean(
    announcement?.hasMedia ||
      Number(announcement?.attachmentCount) > 0 ||
      getAnnouncementAttachments(announcement).length > 0,
  );

export const formatAttachmentCountLabel = (announcement) => {
  const count =
    Number(announcement?.attachmentCount) || getAnnouncementAttachments(announcement).length;
  if (!count) return "";
  return `📎 ${count} attachment${count === 1 ? "" : "s"}`;
};

export const formatAttachmentFileName = (attachment) =>
  attachment?.fileName || attachment?.originalName || "Attachment";

export const formatAttachmentSize = (bytes) => {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const getAttachmentViewUrl = (attachment) =>
  attachment?.viewUrl || attachment?.downloadUrl || "";

export const getAttachmentDownloadUrl = (attachment) =>
  attachment?.downloadUrl || attachment?.viewUrl || "";
