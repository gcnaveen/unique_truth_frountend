import { formatAccountRole } from "./accountProfile";

export const DEFAULT_ALLOWED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "✅", "👏"];

export const ANNOUNCEMENT_TARGET_ROLES = ["user"];

export const PORTAL_ANNOUNCEMENTS_PATH = "/portal/dashboard/announcements";

export const unwrapAnnouncementPayload = (response) => response?.data ?? response ?? {};

export const normalizeAnnouncementList = (response) => {
  const payload = unwrapAnnouncementPayload(response);
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.announcements)
      ? payload.announcements
      : Array.isArray(payload)
        ? payload
        : [];
  return {
    items,
    total: Number(payload?.total) || items.length,
    page: Number(payload?.page) || 1,
    limit: Number(payload?.limit) || items.length || 20,
    unreadCount: Number(payload?.unreadCount) || 0,
    allowedReactions: payload?.allowedReactions || DEFAULT_ALLOWED_REACTIONS,
  };
};

export const pickAnnouncement = (response) => {
  const payload = unwrapAnnouncementPayload(response);
  return payload?.announcement ?? payload;
};

export const getAnnouncementId = (item) =>
  item?.id || item?._id || item?.announcementId || "";

import {
  announcementHasMedia,
  formatAttachmentCountLabel,
} from "./announcementAttachments";

export const formatAnnouncementPreview = (item) => {
  const title = String(item?.title || "").trim();
  if (title) return title;
  const body = String(item?.body || "").trim();
  if (body) return body.length > 80 ? `${body.slice(0, 80)}…` : body;
  if (announcementHasMedia(item)) {
    const mediaLabel = formatAttachmentCountLabel(item);
    return mediaLabel || "Media announcement";
  }
  return "Announcement";
};

export const formatTargetRoles = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) return "Portal members";
  return roles.map((role) => formatAccountRole(role)).join(", ");
};

export const pickAnnouncementThread = (response) => {
  const payload = unwrapAnnouncementPayload(response);
  const announcement = payload?.announcement ?? payload;
  const replies = Array.isArray(payload?.replies)
    ? payload.replies
    : Array.isArray(announcement?.replies)
      ? announcement.replies
      : [];
  return {
    announcement,
    replies,
    allowedReactions: payload?.allowedReactions || DEFAULT_ALLOWED_REACTIONS,
    canReply: payload?.canReply !== false,
  };
};

export const getReplyId = (reply) => reply?.id || reply?._id || "";

export const pickAnnouncementUnreadCount = (response) => {
  const payload = unwrapAnnouncementPayload(response);
  return Number(payload?.unreadCount ?? payload?.count) || 0;
};

export const isAnnouncementUnread = (item) => !item?.viewerState?.isRead;

export const isAnnouncementArchived = (item) => Boolean(item?.viewerState?.isArchived);
