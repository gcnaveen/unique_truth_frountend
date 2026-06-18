import { useRef, useState } from "react";
import {
  confirmAdminAnnouncementAttachment,
  presignAdminAnnouncementAttachment,
} from "../../api/announcements";
import { putFileToPresignedUrl } from "../../counsellor/utils/upload";
import {
  buildAttachmentInput,
  getAttachmentKindConfig,
  MAX_ANNOUNCEMENT_ATTACHMENTS,
  normalizeAttachmentContentType,
  pickAttachmentFromConfirm,
  resolveAttachmentKind,
} from "../../utils/announcementAttachments";
import { AnnouncementAttachments } from "./AnnouncementAttachments";

const buttonClass =
  "rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition hover:border-[#5eead4]/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";

export default function AnnouncementAttachmentUploader({
  accessToken,
  attachments,
  onChange,
  disabled = false,
}) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [uploadingKind, setUploadingKind] = useState("");
  const [error, setError] = useState("");

  const atLimit = attachments.length >= MAX_ANNOUNCEMENT_ATTACHMENTS;

  const openPicker = (kind) => {
    if (disabled || uploadingKind || atLimit) return;
    if (kind === "image") imageInputRef.current?.click();
    if (kind === "video") videoInputRef.current?.click();
    if (kind === "document") documentInputRef.current?.click();
  };

  const handleRemove = (attachment) => {
    const key = attachment?.s3Key || attachment?.id || attachment?._id;
    onChange?.(attachments.filter((item) => (item?.s3Key || item?.id || item?._id) !== key));
  };

  const uploadFile = async (file, preferredKind) => {
    if (!accessToken || !file) return;
    const kind = preferredKind || resolveAttachmentKind(file);
    const contentType = normalizeAttachmentContentType(file, kind);
    const config = getAttachmentKindConfig(kind);

    if (file.size > config.maxBytes) {
      throw new Error(
        `${config.label} must be under ${Math.round(config.maxBytes / (1024 * 1024))} MB.`,
      );
    }

    const presignRes = await presignAdminAnnouncementAttachment(accessToken, {
      kind,
      contentType,
    });
    const payload = presignRes?.data ?? presignRes ?? {};
    const uploadUrl = payload.uploadUrl || payload.upload_url || payload.url;
    const s3Key = payload.s3Key || payload.key;
    if (!uploadUrl || !s3Key) {
      throw new Error("Presign response missing upload details.");
    }

    const maxBytes = Number(payload?.maxBytes);
    if (Number.isFinite(maxBytes) && file.size > maxBytes) {
      throw new Error(`File must be under ${Math.round(maxBytes / (1024 * 1024))} MB.`);
    }

    const uploadFile =
      contentType !== file.type ? new File([file], file.name, { type: contentType }) : file;

    await putFileToPresignedUrl(uploadUrl, uploadFile);
    const confirmRes = await confirmAdminAnnouncementAttachment(accessToken, {
      s3Key,
      kind,
      contentType,
      fileName: file.name,
    });
    const confirmed = pickAttachmentFromConfirm(confirmRes);
    return buildAttachmentInput(confirmed);
  };

  const handleFileChange = async (event, preferredKind) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (atLimit) {
      setError(`Maximum ${MAX_ANNOUNCEMENT_ATTACHMENTS} attachments per announcement.`);
      return;
    }

    try {
      setUploadingKind(preferredKind);
      setError("");
      const attachment = await uploadFile(file, preferredKind);
      onChange?.([...attachments, attachment]);
    } catch (uploadError) {
      setError(uploadError?.response?.data?.message || uploadError?.message || "Upload failed.");
    } finally {
      setUploadingKind("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openPicker("image")}
          disabled={disabled || Boolean(uploadingKind) || atLimit}
          className={buttonClass}
        >
          {uploadingKind === "image" ? "Uploading photo…" : "+ Add photo"}
        </button>
        <button
          type="button"
          onClick={() => openPicker("video")}
          disabled={disabled || Boolean(uploadingKind) || atLimit}
          className={buttonClass}
        >
          {uploadingKind === "video" ? "Uploading video…" : "+ Add video"}
        </button>
        <button
          type="button"
          onClick={() => openPicker("document")}
          disabled={disabled || Boolean(uploadingKind) || atLimit}
          className={buttonClass}
        >
          {uploadingKind === "document" ? "Uploading file…" : "+ Add file"}
        </button>
      </div>

      <p className="text-xs text-white/45">
        Up to {MAX_ANNOUNCEMENT_ATTACHMENTS} attachments · photos 10 MB · videos 100 MB · files 25
        MB
      </p>

      {error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      ) : null}

      {attachments.length > 0 ? (
        <AnnouncementAttachments
          announcement={{ attachments }}
          editable
          onRemove={handleRemove}
        />
      ) : null}

      <input
        ref={imageInputRef}
        type="file"
        accept={getAttachmentKindConfig("image").accept}
        className="hidden"
        onChange={(event) => handleFileChange(event, "image")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept={getAttachmentKindConfig("video").accept}
        className="hidden"
        onChange={(event) => handleFileChange(event, "video")}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept={getAttachmentKindConfig("document").accept}
        className="hidden"
        onChange={(event) => handleFileChange(event, "document")}
      />
    </div>
  );
}
