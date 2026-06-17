import { useCallback, useEffect, useRef, useState } from "react";
import {
  confirmPortalFingerprint,
  deletePortalFingerprint,
  getPortalFingerprint,
  presignPortalFingerprint,
} from "../../api/portal";
import { getPrivacyConfig } from "../../api/publicPortal";
import {
  buildPortalFingerprintConfirmPayload,
  normalizeFingerprintContentType,
  pickPresignUpload,
  putFileToPresignedUrl,
  unwrapApiPayload,
} from "../../counsellor/utils/upload";
import { formatDateTime } from "../utils/format";
import {
  FINGERPRINT_SECTION_ID,
  pickFingerprintFromResponse,
} from "../utils/fingerprint";

const panelClass = "rounded-2xl border border-white/15 bg-white/8 p-5";
const buttonClass =
  "rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2.5 text-sm font-semibold text-[#a7f3d0] disabled:cursor-not-allowed disabled:opacity-50";
const dangerButtonClass =
  "rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-50";

const DEFAULT_NOTICE =
  "Your fingerprint image is used only for analysis during your program. It is stored securely and automatically deleted after 48 hours.";

const formatExpiryCountdown = (expiresAt, expiresInHours) => {
  if (Number.isFinite(expiresInHours)) {
    const hours = Math.max(0, expiresInHours);
    if (hours < 1) return `${Math.round(hours * 60)} minutes remaining`;
    return `${hours.toFixed(1)} hours remaining`;
  }
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / 60000)} minutes remaining`;
  return `${hours.toFixed(1)} hours remaining`;
};

function FingerprintPreviewModal({ open, imageUrl, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-[#0f2e1a] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Fingerprint preview</h3>
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
            alt="Fingerprint preview"
            className="max-h-[75vh] w-full rounded-xl border border-white/15 bg-black/30 object-contain"
          />
        ) : (
          <p className="py-12 text-center text-sm text-white/60">Preview unavailable.</p>
        )}
      </div>
    </div>
  );
}

export default function PortalFingerprintPanel({
  enquiryId,
  accessToken,
  onUploaded,
  highlight = false,
}) {
  const fileInputRef = useRef(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [privacyNoticeVersion, setPrivacyNoticeVersion] = useState("1.0");
  const [privacyNoticeText, setPrivacyNoticeText] = useState(DEFAULT_NOTICE);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);

  const loadFingerprint = useCallback(async () => {
    if (!enquiryId || !accessToken) return null;
    try {
      setLoading(true);
      setError("");
      setPaymentRequired(false);
      const response = await getPortalFingerprint(accessToken, enquiryId);
      const picked = pickFingerprintFromResponse(response);
      setFingerprint(picked);
      return picked;
    } catch (fetchError) {
      if (fetchError?.response?.status === 402) {
        setPaymentRequired(true);
        setFingerprint(null);
      } else if (fetchError?.response?.status === 404) {
        setFingerprint(null);
      } else {
        setError(fetchError?.response?.data?.message || "Failed to load fingerprint.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken, enquiryId]);

  useEffect(() => {
    const loadPrivacy = async () => {
      try {
        const response = await getPrivacyConfig();
        const payload = unwrapApiPayload(response);
        const confirm = payload?.portalFingerprintConfirm ?? payload?.fingerprintConfirm ?? {};
        if (confirm?.privacyNoticeVersion) {
          setPrivacyNoticeVersion(String(confirm.privacyNoticeVersion));
        }
        if (confirm?.noticeText || confirm?.privacyNoticeText) {
          setPrivacyNoticeText(confirm.noticeText || confirm.privacyNoticeText);
        }
      } catch {
        // Keep defaults when privacy config is unavailable.
      }
    };
    loadPrivacy();
  }, []);

  useEffect(() => {
    loadFingerprint();
  }, [loadFingerprint]);

  const handleUploadClick = () => {
    if (!consentChecked) {
      setError("Please accept the biometric consent checkbox below before uploading.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      setError("");
      const picked = await loadFingerprint();
      const url = picked?.viewUrl || fingerprint?.viewUrl || "";
      if (!url) {
        setError("Preview is not available right now. Try again in a moment.");
        return;
      }
      setPreviewUrl(url);
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!enquiryId || !accessToken) return;
    const confirmed = window.confirm(
      "Remove your uploaded fingerprint? You can upload a new scan afterwards.",
    );
    if (!confirmed) return;

    try {
      setRemoving(true);
      setError("");
      setSuccess("");
      await deletePortalFingerprint(accessToken, enquiryId);
      setFingerprint(null);
      setPreviewUrl("");
      setPreviewOpen(false);
      setSuccess("Fingerprint removed.");
      onUploaded?.();
    } catch (removeError) {
      setError(removeError?.response?.data?.message || "Could not remove fingerprint.");
    } finally {
      setRemoving(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !enquiryId) return;

    if (!consentChecked) {
      setError("Please accept the biometric processing consent before uploading.");
      return;
    }

    const contentType = normalizeFingerprintContentType(file);
    if (!contentType) {
      setError("Use a JPEG, PNG, or WebP image (max 10 MB).");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      setPaymentRequired(false);

      const presignRes = await presignPortalFingerprint(accessToken, enquiryId, { contentType });
      const { uploadUrl, payload: presignPayload } = pickPresignUpload(presignRes);
      if (!uploadUrl) throw new Error("Presign response missing upload URL.");

      const maxBytes = Number(presignPayload?.maxBytes);
      if (Number.isFinite(maxBytes) && file.size > maxBytes) {
        throw new Error(`Image must be under ${Math.round(maxBytes / (1024 * 1024))} MB.`);
      }

      const uploadFile =
        contentType !== file.type
          ? new File([file], file.name, { type: contentType })
          : file;

      await putFileToPresignedUrl(uploadUrl, uploadFile);
      const confirmRes = await confirmPortalFingerprint(
        accessToken,
        enquiryId,
        buildPortalFingerprintConfirmPayload(presignPayload, uploadFile, {
          privacyNoticeVersion,
        }),
      );
      const confirmPayload = unwrapApiPayload(confirmRes);
      setSuccess(
        confirmPayload?.message || "Fingerprint saved. It will be removed automatically after 48 hours.",
      );
      setConsentChecked(false);
      await loadFingerprint();
      onUploaded?.();
    } catch (uploadError) {
      if (uploadError?.response?.status === 402) {
        setPaymentRequired(true);
        setError("Advance payment is required before uploading your fingerprint.");
      } else {
        setError(
          uploadError?.response?.data?.message || uploadError?.message || "Upload failed.",
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const activeRecord = fingerprint?.record;
  const viewUrl = fingerprint?.viewUrl || "";
  const countdown = formatExpiryCountdown(
    activeRecord?.expiresAt,
    fingerprint?.expiresInHours,
  );
  const needsUpload = !loading && !activeRecord && !paymentRequired;
  const hasUploaded = Boolean(activeRecord);

  return (
    <>
      <div
        id={FINGERPRINT_SECTION_ID}
        className={[
          panelClass,
          highlight || needsUpload
            ? "border-[#5eead4]/45 ring-2 ring-[#5eead4]/20"
            : "",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5eead4]">
              Fingerprint scan
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">Upload your fingerprint</h2>
            <p className="mt-1 text-xs text-white/55">
              Required for your analysis. One active scan per enquiry. Stored for 48 hours only.
            </p>
          </div>
          {needsUpload ? (
            <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-100">
              Pending
            </span>
          ) : hasUploaded ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-100">
              Uploaded
            </span>
          ) : null}
        </div>

        {paymentRequired ? (
          <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
            Complete your advance payment to unlock fingerprint upload.
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100">
            {success}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-white/70">Loading fingerprint…</p>
        ) : hasUploaded ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Uploaded scan
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
              {viewUrl ? (
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewLoading}
                  className="shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black/25 transition hover:border-[#5eead4]/40"
                >
                  <img
                    src={viewUrl}
                    alt="Fingerprint thumbnail"
                    className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                  />
                </button>
              ) : (
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/20 text-xs text-white/50 sm:h-32 sm:w-32">
                  No preview
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="space-y-1 text-sm text-white/75">
                  {activeRecord?.uploadedAt ? (
                    <p>Uploaded {formatDateTime(activeRecord.uploadedAt)}</p>
                  ) : null}
                  {activeRecord?.expiresAt ? (
                    <p>Expires {formatDateTime(activeRecord.expiresAt)}</p>
                  ) : null}
                  {countdown ? (
                    <p className="font-semibold text-amber-200/90">{countdown}</p>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={previewLoading || removing}
                    className={buttonClass}
                  >
                    {previewLoading ? "Loading…" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={removing || previewLoading}
                    className={dangerButtonClass}
                  >
                    {removing ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/60">
            {paymentRequired
              ? "Upload will be available after advance payment."
              : "No fingerprint uploaded yet."}
          </p>
        )}

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
            {hasUploaded ? "Upload a new scan" : "Step 1 — Biometric consent"}
          </p>
          {!hasUploaded ? (
            <p className="mt-2 text-sm leading-relaxed text-white/75">{privacyNoticeText}</p>
          ) : (
            <p className="mt-2 text-sm text-white/65">
              Accept consent again to replace your current fingerprint image.
            </p>
          )}
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => {
                setConsentChecked(event.target.checked);
                if (event.target.checked) setError("");
              }}
              className="mt-0.5"
            />
            <span>
              I consent to biometric processing of my fingerprint for this enquiry (privacy notice v
              {privacyNoticeVersion}).
            </span>
          </label>
        </div>

        {!paymentRequired && !loading ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {hasUploaded ? "Replace image" : "Step 2 — Upload image"}
            </p>
            <p className="mt-2 text-sm text-white/65">JPEG, PNG, or WebP · max 10 MB</p>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading || removing}
              className={`mt-3 ${buttonClass}`}
            >
              {uploading
                ? "Uploading…"
                : hasUploaded
                  ? "Choose new image"
                  : "Choose fingerprint image"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading || removing}
              onChange={handleFileChange}
            />
            {!consentChecked ? (
              <p className="mt-2 text-xs text-amber-200/90">
                Accept consent above to enable upload.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <FingerprintPreviewModal
        open={previewOpen}
        imageUrl={previewUrl}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
