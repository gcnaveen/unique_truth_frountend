import { useCallback, useEffect, useState } from "react";
import {
  confirmCounsellorAudio,
  confirmCounsellorFingerprint,
  confirmCounsellorReport,
  getCounsellorAudioList,
  getCounsellorFingerprint,
  getCounsellorReportList,
  presignCounsellorAudio,
  presignCounsellorFingerprint,
  presignCounsellorReport,
} from "../../../../api/counsellor";
import { formatDateTime, getId } from "../../../utils/format";
import {
  buildConfirmPayload,
  buildReportConfirmPayload,
  normalizeMediaList,
  pickPresignUpload,
  putFileToPresignedUrl,
  resolveReportContentType,
  unwrapApiPayload,
} from "../../../utils/upload";

const panelClass = "mt-6 rounded-xl border border-white/20 bg-white/10 p-4";
const buttonClass =
  "rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 py-2 text-xs font-semibold text-[#a7f3d0] disabled:opacity-50";

const getMediaItemLabel = (item, index, fallbackPrefix) =>
  item?.label ||
  item?.originalName ||
  item?.fileName ||
  item?.filename ||
  item?.name ||
  `${fallbackPrefix} ${index + 1}`;

export default function AssignedUserMediaPanel({ enquiryId, accessToken }) {
  const [fingerprint, setFingerprint] = useState(null);
  const [audioItems, setAudioItems] = useState([]);
  const [reportItems, setReportItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [fingerprintUploading, setFingerprintUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [mediaSuccess, setMediaSuccess] = useState("");

  const resolvedEnquiryId = enquiryId;

  const loadMedia = useCallback(async () => {
    if (!resolvedEnquiryId || !accessToken) return;
    try {
      setMediaLoading(true);
      setMediaError("");
      const [fpRes, audioRes, reportsRes] = await Promise.all([
        getCounsellorFingerprint(accessToken, resolvedEnquiryId).catch(() => null),
        getCounsellorAudioList(accessToken, resolvedEnquiryId).catch(() => ({ items: [] })),
        getCounsellorReportList(accessToken, resolvedEnquiryId).catch(() => ({ items: [] })),
      ]);
      const fpPayload = unwrapApiPayload(fpRes);
      const fpRecord = fpPayload?.fingerprint ?? fpPayload;
      const hasFingerprint =
        fpRecord &&
        (fpRecord.url ||
          fpRecord.imageUrl ||
          fpRecord.downloadUrl ||
          fpRecord.signedUrl ||
          fpRecord.key);
      setFingerprint(hasFingerprint ? fpRecord : null);
      setAudioItems(normalizeMediaList(audioRes));
      setReportItems(normalizeMediaList(reportsRes));
    } catch (fetchError) {
      setMediaError(fetchError?.response?.data?.message || "Failed to load media.");
    } finally {
      setMediaLoading(false);
    }
  }, [accessToken, resolvedEnquiryId]);

  useEffect(() => {
    if (resolvedEnquiryId && accessToken) loadMedia();
    else {
      setFingerprint(null);
      setAudioItems([]);
      setReportItems([]);
    }
  }, [resolvedEnquiryId, accessToken, loadMedia]);

  const runPresignUpload = async ({
    file,
    presignFn,
    confirmFn,
    setUploading,
    successMessage,
    getPresignBody,
    buildConfirmBody,
  }) => {
    if (!file || !resolvedEnquiryId) return;
    try {
      setUploading(true);
      setMediaError("");
      setMediaSuccess("");
      const presignBody = getPresignBody(file);
      const presignRes = await presignFn(accessToken, resolvedEnquiryId, presignBody);
      const { uploadUrl, payload: presignPayload } = pickPresignUpload(presignRes);
      if (!uploadUrl) throw new Error("Presign response missing upload URL.");
      const extraHeaders = {};
      if (presignPayload?.headers && typeof presignPayload.headers === "object") {
        Object.assign(extraHeaders, presignPayload.headers);
      }
      await putFileToPresignedUrl(uploadUrl, file, extraHeaders);
      await confirmFn(
        accessToken,
        resolvedEnquiryId,
        buildConfirmBody(presignPayload, file),
      );
      setMediaSuccess(successMessage);
      await loadMedia();
    } catch (uploadError) {
      setMediaError(
        uploadError?.response?.data?.message || uploadError?.message || "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFingerprintFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMediaError("Fingerprint must be an image file.");
      return;
    }
    runPresignUpload({
      file,
      presignFn: presignCounsellorFingerprint,
      confirmFn: confirmCounsellorFingerprint,
      setUploading: setFingerprintUploading,
      successMessage: "Fingerprint uploaded (retained 48 hours).",
      getPresignBody: (f) => ({
        contentType: f.type,
        filename: f.name,
        size: f.size,
      }),
      buildConfirmBody: buildConfirmPayload,
    });
  };

  const handleAudioFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setMediaError("Please choose an audio file.");
      return;
    }
    runPresignUpload({
      file,
      presignFn: presignCounsellorAudio,
      confirmFn: confirmCounsellorAudio,
      setUploading: setAudioUploading,
      successMessage: "Audio recording saved for the member.",
      getPresignBody: (f) => ({
        contentType: f.type,
        filename: f.name,
        size: f.size,
      }),
      buildConfirmBody: buildConfirmPayload,
    });
  };

  const handleReportFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const contentType = resolveReportContentType(file);
    if (!contentType) {
      setMediaError("Reports must be PDF or Word (.pdf, .doc, .docx).");
      return;
    }
    runPresignUpload({
      file,
      presignFn: presignCounsellorReport,
      confirmFn: confirmCounsellorReport,
      setUploading: setReportUploading,
      successMessage: "Report uploaded. The member can download it after full payment.",
      getPresignBody: () => ({ contentType }),
      buildConfirmBody: buildReportConfirmPayload,
    });
  };

  const fingerprintUrl =
    fingerprint?.url ||
    fingerprint?.imageUrl ||
    fingerprint?.downloadUrl ||
    fingerprint?.signedUrl ||
    "";

  return (
    <div className={panelClass}>
      <h3 className="text-base font-semibold text-white">Fingerprint, audio & reports</h3>
      <p className="mt-1 text-xs text-white/70">
        Upload files for this member. Audio and reports are only downloadable by the member after
        they complete full program payment — you cannot download uploads from here.
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

      {mediaLoading ? (
        <p className="mt-4 text-sm text-white/70">Loading media…</p>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">Fingerprint</p>
              <label className={buttonClass}>
                {fingerprintUploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={fingerprintUploading}
                  onChange={handleFingerprintFile}
                />
              </label>
            </div>
            {fingerprintUrl ? (
              <div className="mt-3">
                <img
                  src={fingerprintUrl}
                  alt="Fingerprint scan"
                  className="max-h-48 w-full rounded-lg border border-white/20 object-contain bg-black/20"
                />
                {fingerprint?.expiresAt ? (
                  <p className="mt-2 text-xs text-amber-200/90">
                    Expires {formatDateTime(fingerprint.expiresAt)}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-white/60">Active · 48h retention</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-white/60">No active fingerprint on file.</p>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">Audio recordings</p>
              <label className={buttonClass}>
                {audioUploading ? "Uploading…" : "Upload audio"}
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  disabled={audioUploading}
                  onChange={handleAudioFile}
                />
              </label>
            </div>
            {audioItems.length === 0 ? (
              <p className="mt-2 text-sm text-white/60">No recordings yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {audioItems.map((item, index) => (
                  <li
                    key={getId(item) || `audio-${index}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-white">
                      {getMediaItemLabel(item, index, "Recording")}
                    </p>
                    <p className="text-xs text-white/55">
                      {formatDateTime(item?.createdAt || item?.uploadedAt)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a7f3d0]/80">
                      Uploaded · member download after full payment
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">Reports</p>
              <label className={buttonClass}>
                {reportUploading ? "Uploading…" : "Upload report"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  disabled={reportUploading}
                  onChange={handleReportFile}
                />
              </label>
            </div>
            <p className="mt-1 text-[10px] text-white/50">PDF, DOC, or DOCX</p>
            {reportItems.length === 0 ? (
              <p className="mt-2 text-sm text-white/60">No reports yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {reportItems.map((item, index) => (
                  <li
                    key={getId(item) || `report-${index}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-white">
                      {getMediaItemLabel(item, index, "Report")}
                    </p>
                    <p className="text-xs text-white/55">
                      {formatDateTime(item?.createdAt || item?.uploadedAt)}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#a7f3d0]/80">
                      Uploaded · member download after full payment
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
