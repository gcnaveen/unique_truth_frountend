import { useCallback, useEffect, useState } from "react";
import {
  confirmCounsellorAudio,
  confirmCounsellorReport,
  deleteCounsellorAudio,
  deleteCounsellorReport,
  getCounsellorAudioDownload,
  getCounsellorAudioList,
  getCounsellorReportDownload,
  getCounsellorReportList,
  presignCounsellorAudio,
  presignCounsellorReport,
} from "../../../../api/counsellor";
import { formatDateTime, getId } from "../../../utils/format";
import {
  buildConfirmPayload,
  buildReportConfirmPayload,
  fetchBlobPreviewUrl,
  isPdfMediaItem,
  normalizeMediaList,
  pickDownloadUrl,
  pickMediaItemUrl,
  pickPresignUpload,
  putFileToPresignedUrl,
  resolveReportContentType,
  revokeBlobPreviewUrl,
} from "../../../utils/upload";

const panelClass = "mt-6 rounded-xl border border-white/20 bg-white/10 p-4";
const buttonClass =
  "rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 py-2 text-xs font-semibold text-[#a7f3d0] disabled:opacity-50";
const dangerButtonClass =
  "rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-100 disabled:opacity-50";
const ghostButtonClass =
  "rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 disabled:opacity-50";

const getMediaItemLabel = (item, index, fallbackPrefix) =>
  item?.label ||
  item?.originalName ||
  item?.fileName ||
  item?.filename ||
  item?.name ||
  `${fallbackPrefix} ${index + 1}`;

function MediaPreviewModal({ open, title, url, kind, fileName, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0f2e1a] p-4 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {fileName ? <p className="truncate text-xs text-white/55">{fileName}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Close
          </button>
        </div>
        {!url ? (
          <p className="py-12 text-center text-sm text-white/60">Preview unavailable.</p>
        ) : kind === "audio" ? (
          <audio controls src={url} className="w-full">
            Your browser does not support audio playback.
          </audio>
        ) : kind === "pdf" ? (
          <object
            data={`${url}#toolbar=1&navpanes=0`}
            type="application/pdf"
            className="h-[70vh] w-full rounded-xl border border-white/15 bg-white"
          >
            <embed
              src={`${url}#toolbar=1&navpanes=0`}
              type="application/pdf"
              className="h-[70vh] w-full rounded-xl"
            />
          </object>
        ) : (
          <div className="space-y-3 py-8 text-center">
            <p className="text-sm text-white/70">Inline preview is not available for this file type.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0]"
            >
              Open file
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaItemRow({
  item,
  index,
  fallbackPrefix,
  previewUrl,
  previewLoading,
  deleting,
  onPreview,
  onDelete,
  kind,
}) {
  const label = getMediaItemLabel(item, index, fallbackPrefix);
  const inlineAudio = kind === "audio" && previewUrl;

  return (
    <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">{label}</p>
          <p className="text-xs text-white/55">
            {formatDateTime(item?.createdAt || item?.uploadedAt)}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a7f3d0]/80">
            Uploaded · available for member download
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPreview(item)}
            disabled={previewLoading || deleting}
            className={ghostButtonClass}
          >
            {previewLoading ? "Loading…" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            disabled={deleting || previewLoading}
            className={dangerButtonClass}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
      {inlineAudio ? (
        <audio controls src={previewUrl} className="mt-3 w-full">
          Your browser does not support audio playback.
        </audio>
      ) : null}
    </li>
  );
}

export default function AssignedUserMediaPanel({
  enquiryId,
  accessToken,
  fingerprintMeta = null,
}) {
  const [audioItems, setAudioItems] = useState([]);
  const [reportItems, setReportItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [mediaSuccess, setMediaSuccess] = useState("");
  const [audioPreviewUrls, setAudioPreviewUrls] = useState({});
  const [previewModal, setPreviewModal] = useState(null);
  const [previewLoadingId, setPreviewLoadingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const closePreviewModal = useCallback(() => {
    setPreviewModal((current) => {
      if (current?.revokeOnClose) {
        revokeBlobPreviewUrl(current.url);
      }
      return null;
    });
  }, []);

  useEffect(
    () => () => {
      if (previewModal?.revokeOnClose) {
        revokeBlobPreviewUrl(previewModal.url);
      }
    },
    [previewModal],
  );

  const resolvedEnquiryId = enquiryId;

  const loadMedia = useCallback(async () => {
    if (!resolvedEnquiryId || !accessToken) return;
    try {
      setMediaLoading(true);
      setMediaError("");
      const [audioRes, reportsRes] = await Promise.all([
        getCounsellorAudioList(accessToken, resolvedEnquiryId).catch(() => ({ items: [] })),
        getCounsellorReportList(accessToken, resolvedEnquiryId).catch(() => ({ items: [] })),
      ]);
      setAudioItems(normalizeMediaList(audioRes));
      setReportItems(normalizeMediaList(reportsRes));
      setAudioPreviewUrls({});
    } catch (fetchError) {
      setMediaError(fetchError?.response?.data?.message || "Failed to load media.");
    } finally {
      setMediaLoading(false);
    }
  }, [accessToken, resolvedEnquiryId]);

  useEffect(() => {
    if (resolvedEnquiryId && accessToken) loadMedia();
    else {
      setAudioItems([]);
      setReportItems([]);
      setAudioPreviewUrls({});
    }
  }, [resolvedEnquiryId, accessToken, loadMedia]);

  const uploadSingleFile = async ({
    file,
    presignFn,
    confirmFn,
    getPresignBody,
    buildConfirmBody,
  }) => {
    const presignBody = getPresignBody(file);
    const presignRes = await presignFn(accessToken, resolvedEnquiryId, presignBody);
    const { uploadUrl, payload: presignPayload } = pickPresignUpload(presignRes);
    if (!uploadUrl) throw new Error("Presign response missing upload URL.");
    const extraHeaders = {};
    if (presignPayload?.headers && typeof presignPayload.headers === "object") {
      Object.assign(extraHeaders, presignPayload.headers);
    }
    await putFileToPresignedUrl(uploadUrl, file, extraHeaders);
    await confirmFn(accessToken, resolvedEnquiryId, buildConfirmBody(presignPayload, file));
  };

  const uploadFiles = async ({
    files,
    setUploading,
    presignFn,
    confirmFn,
    getPresignBody,
    buildConfirmBody,
    successMessage,
    invalidMessage,
    validateFile,
  }) => {
    if (!files.length || !resolvedEnquiryId) return;

    const validFiles = [];
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setMediaError(validationError);
        return;
      }
      validFiles.push(file);
    }

    try {
      setUploading(true);
      setMediaError("");
      setMediaSuccess("");
      let uploadedCount = 0;

      for (let index = 0; index < validFiles.length; index += 1) {
        const file = validFiles[index];
        if (validFiles.length > 1) {
          setUploadProgress(`Uploading ${index + 1} of ${validFiles.length}…`);
        }
        await uploadSingleFile({
          file,
          presignFn,
          confirmFn,
          getPresignBody,
          buildConfirmBody,
        });
        uploadedCount += 1;
      }

      setMediaSuccess(
        validFiles.length > 1
          ? `${uploadedCount} file(s) uploaded successfully.`
          : successMessage,
      );
      await loadMedia();
    } catch (uploadError) {
      setMediaError(
        uploadError?.response?.data?.message || uploadError?.message || invalidMessage,
      );
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleAudioFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    uploadFiles({
      files,
      setUploading: setAudioUploading,
      presignFn: presignCounsellorAudio,
      confirmFn: confirmCounsellorAudio,
      successMessage: "Audio recording saved for the member.",
      invalidMessage: "Audio upload failed.",
      getPresignBody: (file) => ({
        contentType: file.type,
        filename: file.name,
        size: file.size,
      }),
      buildConfirmBody: buildConfirmPayload,
      validateFile: (file) =>
        file.type.startsWith("audio/") ? null : `"${file.name}" is not a supported audio file.`,
    });
  };

  const handleReportFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    uploadFiles({
      files,
      setUploading: setReportUploading,
      presignFn: presignCounsellorReport,
      confirmFn: confirmCounsellorReport,
      successMessage: "Report uploaded. The member can download it from their portal.",
      invalidMessage: "Report upload failed.",
      getPresignBody: (file) => ({ contentType: resolveReportContentType(file) }),
      buildConfirmBody: buildReportConfirmPayload,
      validateFile: (file) =>
        resolveReportContentType(file)
          ? null
          : `"${file.name}" must be PDF or Word (.pdf, .doc, .docx).`,
    });
  };

  const resolveMediaUrl = async (item, type) => {
    const itemId = getId(item);
    const cached = pickMediaItemUrl(item);
    if (cached) return cached;
    if (!itemId || !resolvedEnquiryId || !accessToken) return "";

    const response =
      type === "audio"
        ? await getCounsellorAudioDownload(accessToken, resolvedEnquiryId, itemId)
        : await getCounsellorReportDownload(accessToken, resolvedEnquiryId, itemId);
    return pickDownloadUrl(response);
  };

  const handlePreview = async (item, type) => {
    const itemId = getId(item);
    if (!itemId) return;

    try {
      setPreviewLoadingId(itemId);
      setMediaError("");
      const url = await resolveMediaUrl(item, type);
      if (!url) throw new Error("Preview link unavailable.");

      if (type === "audio") {
        setAudioPreviewUrls((prev) => ({ ...prev, [itemId]: url }));
        return;
      }

      if (isPdfMediaItem(item)) {
        const blobUrl = await fetchBlobPreviewUrl(url, "application/pdf");
        setPreviewModal({
          kind: "pdf",
          title: "Report preview",
          url: blobUrl,
          fileName: getMediaItemLabel(item, 0, "Report"),
          revokeOnClose: true,
        });
        return;
      }

      setPreviewModal({
        kind: "file",
        title: "Report preview",
        url,
        fileName: getMediaItemLabel(item, 0, "Report"),
      });
    } catch (previewError) {
      setMediaError(previewError?.response?.data?.message || previewError?.message || "Preview failed.");
    } finally {
      setPreviewLoadingId("");
    }
  };

  const handleDelete = async (item, type) => {
    const itemId = getId(item);
    if (!itemId || !resolvedEnquiryId || !accessToken) return;

    const label = getMediaItemLabel(item, 0, type === "audio" ? "Recording" : "Report");
    const confirmed = window.confirm(`Delete "${label}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(itemId);
      setMediaError("");
      setMediaSuccess("");
      if (type === "audio") {
        await deleteCounsellorAudio(accessToken, resolvedEnquiryId, itemId);
        setAudioPreviewUrls((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      } else {
        await deleteCounsellorReport(accessToken, resolvedEnquiryId, itemId);
      }
      setMediaSuccess(`${type === "audio" ? "Recording" : "Report"} deleted.`);
      if (previewModal && getId(item) === itemId) closePreviewModal();
      await loadMedia();
    } catch (deleteError) {
      setMediaError(deleteError?.response?.data?.message || "Could not delete file.");
    } finally {
      setDeletingId("");
    }
  };

  const hasFingerprint =
    fingerprintMeta &&
    (fingerprintMeta._id ||
      fingerprintMeta.id ||
      fingerprintMeta.uploadedAt ||
      fingerprintMeta.expiresAt);

  const audioUploadLabel = audioUploading
    ? uploadProgress || "Uploading…"
    : "Upload audio files";
  const reportUploadLabel = reportUploading
    ? uploadProgress || "Uploading…"
    : "Upload report files";

  return (
    <>
      <div className={panelClass}>
        <h3 className="text-base font-semibold text-white">Audio & reports</h3>
        <p className="mt-1 text-xs text-white/70">
          Upload one or more audio files and reports for this member. Preview or delete uploads
          here. Fingerprint scans are uploaded by the member in their portal. Converted members
          can download audio and reports from their portal.
        </p>

        {mediaError ? (
          <p className="mt-3 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-xs text-red-100">
            {mediaError}
          </p>
        ) : null}
        {mediaSuccess ? (
          <p className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100">
            {mediaSuccess}
          </p>
        ) : null}

        <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-3">
          <p className="text-sm font-medium text-white">Member fingerprint</p>
          {hasFingerprint ? (
            <div className="mt-2 space-y-1 text-sm text-white/75">
              {fingerprintMeta?.fileName ? (
                <p>
                  <span className="text-white/55">File:</span> {fingerprintMeta.fileName}
                </p>
              ) : null}
              {fingerprintMeta?.uploadedAt ? (
                <p>
                  <span className="text-white/55">Uploaded:</span>{" "}
                  {formatDateTime(fingerprintMeta.uploadedAt)}
                </p>
              ) : null}
              {fingerprintMeta?.expiresAt ? (
                <p>
                  <span className="text-white/55">Expires:</span>{" "}
                  {formatDateTime(fingerprintMeta.expiresAt)}
                </p>
              ) : null}
              <p className="text-xs text-white/50">
                Uploaded by the member. Image is not viewable from counsellor access.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/60">No active fingerprint from the member yet.</p>
          )}
        </div>

        {mediaLoading ? (
          <p className="mt-4 text-sm text-white/70">Loading media…</p>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">Audio recordings</p>
                <label className={buttonClass}>
                  {audioUploadLabel}
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    className="hidden"
                    disabled={audioUploading}
                    onChange={handleAudioFiles}
                  />
                </label>
              </div>
              <p className="mt-1 text-[10px] text-white/50">Select one or more audio files</p>
              {audioItems.length === 0 ? (
                <p className="mt-2 text-sm text-white/60">No recordings yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {audioItems.map((item, index) => {
                    const itemId = getId(item);
                    return (
                      <MediaItemRow
                        key={itemId || `audio-${index}`}
                        item={item}
                        index={index}
                        fallbackPrefix="Recording"
                        kind="audio"
                        previewUrl={audioPreviewUrls[itemId]}
                        previewLoading={previewLoadingId === itemId}
                        deleting={deletingId === itemId}
                        onPreview={(row) => handlePreview(row, "audio")}
                        onDelete={(row) => handleDelete(row, "audio")}
                      />
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">Reports</p>
                <label className={buttonClass}>
                  {reportUploadLabel}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    className="hidden"
                    disabled={reportUploading}
                    onChange={handleReportFiles}
                  />
                </label>
              </div>
              <p className="mt-1 text-[10px] text-white/50">
                PDF, DOC, or DOCX · select one or more files
              </p>
              {reportItems.length === 0 ? (
                <p className="mt-2 text-sm text-white/60">No reports yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {reportItems.map((item, index) => {
                    const itemId = getId(item);
                    return (
                      <MediaItemRow
                        key={itemId || `report-${index}`}
                        item={item}
                        index={index}
                        fallbackPrefix="Report"
                        kind="report"
                        previewLoading={previewLoadingId === itemId}
                        deleting={deletingId === itemId}
                        onPreview={(row) => handlePreview(row, "report")}
                        onDelete={(row) => handleDelete(row, "report")}
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <MediaPreviewModal
        open={Boolean(previewModal)}
        title={previewModal?.title || "Preview"}
        url={previewModal?.url || ""}
        kind={previewModal?.kind || "file"}
        fileName={previewModal?.fileName || ""}
        onClose={closePreviewModal}
      />
    </>
  );
}
