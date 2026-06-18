import { useCallback, useEffect, useState } from "react";
import { getPortalAnnouncementAttachmentDownload } from "../../api/portal";
import {
  formatAttachmentCountLabel,
  formatAttachmentFileName,
  formatAttachmentSize,
  getAttachmentDownloadUrl,
  getAttachmentId,
  getAttachmentViewUrl,
  getAnnouncementAttachments,
  pickAttachmentFromDownload,
} from "../../utils/announcementAttachments";

const panelClass = "overflow-hidden rounded-xl border border-white/15 bg-black/20";

function ImageLightbox({ open, imageUrl, fileName, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-[#0f2e1a] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-white">{fileName}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Close
          </button>
        </div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={fileName}
            className="max-h-[75vh] w-full rounded-xl object-contain"
          />
        ) : null}
      </div>
    </div>
  );
}

function AttachmentMediaItem({
  attachment,
  announcementId,
  accessToken,
  compact = false,
}) {
  const attachmentId = getAttachmentId(attachment);
  const kind = attachment?.kind || "document";
  const fileName = formatAttachmentFileName(attachment);
  const [viewUrl, setViewUrl] = useState(getAttachmentViewUrl(attachment));
  const [downloadUrl, setDownloadUrl] = useState(getAttachmentDownloadUrl(attachment));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setViewUrl(getAttachmentViewUrl(attachment));
    setDownloadUrl(getAttachmentDownloadUrl(attachment));
    setError("");
  }, [attachment]);

  const refreshUrl = useCallback(async () => {
    if (!accessToken || !announcementId || !attachmentId) return null;
    try {
      setRefreshing(true);
      setError("");
      const response = await getPortalAnnouncementAttachmentDownload(
        accessToken,
        announcementId,
        attachmentId,
      );
      const refreshed = pickAttachmentFromDownload(response);
      const nextView = getAttachmentViewUrl(refreshed) || response?.downloadUrl || "";
      const nextDownload = getAttachmentDownloadUrl(refreshed) || response?.downloadUrl || "";
      if (nextView) setViewUrl(nextView);
      if (nextDownload) setDownloadUrl(nextDownload);
      return nextView || nextDownload;
    } catch (refreshError) {
      setError(refreshError?.response?.data?.message || "Could not refresh attachment.");
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [accessToken, announcementId, attachmentId]);

  const handleMediaError = async () => {
    await refreshUrl();
  };

  const handleDownload = async () => {
    let url = downloadUrl || viewUrl;
    if (!url) {
      url = await refreshUrl();
    }
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (kind === "image") {
    return (
      <>
        <div className={panelClass}>
          {viewUrl ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full"
            >
              <img
                src={viewUrl}
                alt={fileName}
                onError={handleMediaError}
                className={[
                  "w-full object-contain",
                  compact ? "max-h-40" : "max-h-80",
                ].join(" ")}
              />
            </button>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-white/55">
              {refreshing ? "Loading image…" : "Image preview unavailable."}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-xs text-white/65">
            <span className="truncate">{fileName}</span>
            <button
              type="button"
              onClick={handleDownload}
              disabled={refreshing}
              className="font-semibold text-[#a7f3d0] hover:underline disabled:opacity-50"
            >
              Download
            </button>
          </div>
        </div>
        <ImageLightbox
          open={lightboxOpen}
          imageUrl={viewUrl}
          fileName={fileName}
          onClose={() => setLightboxOpen(false)}
        />
        {error ? <p className="text-xs text-red-200">{error}</p> : null}
      </>
    );
  }

  if (kind === "video") {
    return (
      <div className={panelClass}>
        {viewUrl ? (
          <video
            src={viewUrl}
            controls
            playsInline
            preload="metadata"
            onError={handleMediaError}
            className={["w-full bg-black", compact ? "max-h-48" : "max-h-96"].join(" ")}
          >
            <track kind="captions" />
          </video>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-white/55">
            {refreshing ? "Loading video…" : "Video preview unavailable."}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2 text-xs text-white/65">
          <span className="truncate">{fileName}</span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={refreshing}
            className="font-semibold text-[#a7f3d0] hover:underline disabled:opacity-50"
          >
            Download
          </button>
        </div>
        {error ? <p className="px-3 pb-2 text-xs text-red-200">{error}</p> : null}
      </div>
    );
  }

  const sizeLabel = formatAttachmentSize(attachment?.sizeBytes);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{fileName}</p>
        <p className="text-xs text-white/55">
          Document{sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={refreshing}
        className="rounded-lg border border-[#5eead4]/40 bg-[#5eead4]/10 px-3 py-1.5 text-xs font-semibold text-[#a7f3d0] disabled:opacity-50"
      >
        {refreshing ? "Loading…" : "Download"}
      </button>
      {error ? <p className="w-full text-xs text-red-200">{error}</p> : null}
    </div>
  );
}

function AdminAttachmentPreview({ attachment, onRemove, removing }) {
  const kind = attachment?.kind || "document";
  const fileName = formatAttachmentFileName(attachment);
  const sizeLabel = formatAttachmentSize(attachment?.sizeBytes);
  const icon = kind === "image" ? "🖼" : kind === "video" ? "🎬" : "📄";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-black/25 text-lg">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{fileName}</p>
          <p className="text-xs capitalize text-white/55">
            {kind}
            {sizeLabel ? ` · ${sizeLabel}` : ""}
          </p>
        </div>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="rounded-lg border border-red-400/35 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-100 disabled:opacity-50"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}

export function AnnouncementAttachments({
  announcement,
  announcementId,
  accessToken,
  compact = false,
  editable = false,
  onRemove,
  removingId = "",
}) {
  const attachments = getAnnouncementAttachments(announcement);
  if (!attachments.length) return null;

  if (editable) {
    return (
      <ul className="space-y-2">
        {attachments.map((attachment) => {
          const id = getAttachmentId(attachment) || attachment?.s3Key;
          return (
            <li key={id}>
              <AdminAttachmentPreview
                attachment={attachment}
                onRemove={onRemove ? () => onRemove(attachment) : undefined}
                removing={removingId === id}
              />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {attachments.map((attachment) => {
        const id = getAttachmentId(attachment) || attachment?.s3Key;
        return (
          <AttachmentMediaItem
            key={id}
            attachment={attachment}
            announcementId={announcementId}
            accessToken={accessToken}
            compact={compact}
          />
        );
      })}
    </div>
  );
}

export function AnnouncementAttachmentBadge({ announcement, className = "" }) {
  const label = formatAttachmentCountLabel(announcement);
  if (!label) return null;
  return (
    <span
      className={[
        "rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
