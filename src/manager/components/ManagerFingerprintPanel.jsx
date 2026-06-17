import { useCallback, useEffect, useRef, useState } from "react";
import {
  confirmManagerFingerprint,
  getManagerFingerprint,
  presignManagerFingerprint,
} from "../../api/manager";
import {
  buildManagerFingerprintConfirmPayload,
  normalizeFingerprintContentType,
  pickPresignUpload,
  putFileToPresignedUrl,
  unwrapApiPayload,
} from "../../counsellor/utils/upload";
import { formatDateTime } from "../../portal/utils/format";
import { pickFingerprintFromResponse } from "../../portal/utils/fingerprint";

const panelClass = "rounded-xl border border-white/15 bg-white/5 p-4";
const buttonClass =
  "rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0] disabled:cursor-not-allowed disabled:opacity-50";

const formatExpiryCountdown = (expiresAt) => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / 60000)} minutes remaining`;
  return `${hours.toFixed(1)} hours remaining`;
};

export default function ManagerFingerprintPanel({
  userId,
  accessToken,
  canUploadFingerprint = false,
  fingerprintMeta = null,
  onUploaded,
}) {
  const fileInputRef = useRef(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFingerprint = useCallback(async () => {
    if (!userId || !accessToken) return null;
    try {
      setLoading(true);
      setError("");
      const response = await getManagerFingerprint(accessToken, userId);
      const picked = pickFingerprintFromResponse(response);
      setFingerprint(picked);
      return picked;
    } catch (fetchError) {
      if (fetchError?.response?.status !== 404) {
        setError(fetchError?.response?.data?.message || "Failed to load fingerprint.");
      } else {
        setFingerprint(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken, userId]);

  useEffect(() => {
    if (fingerprintMeta?.hasFingerprint) {
      loadFingerprint();
      return;
    }
    setFingerprint(null);
  }, [fingerprintMeta?.hasFingerprint, loadFingerprint, userId]);

  const handleUploadClick = () => {
    if (!attestationChecked) {
      setError("Confirm that valid user consent is on file before uploading.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userId || !accessToken) return;

    if (!attestationChecked) {
      setError("Confirm consent attestation before uploading.");
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

      const presignRes = await presignManagerFingerprint(accessToken, userId, { contentType });
      const { uploadUrl, payload: presignPayload } = pickPresignUpload(presignRes);
      if (!uploadUrl) throw new Error("Presign response missing upload URL.");

      const maxBytes = Number(presignPayload?.maxBytes);
      if (Number.isFinite(maxBytes) && file.size > maxBytes) {
        throw new Error(`Image must be under ${Math.round(maxBytes / (1024 * 1024))} MB.`);
      }

      const uploadFile =
        contentType !== file.type ? new File([file], file.name, { type: contentType }) : file;

      await putFileToPresignedUrl(uploadUrl, uploadFile);
      const confirmRes = await confirmManagerFingerprint(
        accessToken,
        userId,
        buildManagerFingerprintConfirmPayload(presignPayload, uploadFile),
      );
      const confirmPayload = unwrapApiPayload(confirmRes);
      setSuccess(
        confirmPayload?.message ||
          "Fingerprint uploaded on behalf of user. It auto-deletes after 48 hours.",
      );
      setAttestationChecked(false);
      await loadFingerprint();
      onUploaded?.(confirmPayload);
    } catch (uploadError) {
      if (uploadError?.response?.status === 409) {
        setError(
          uploadError?.response?.data?.message || "Fingerprint already uploaded for this user.",
        );
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
  const countdown = formatExpiryCountdown(activeRecord?.expiresAt);
  const status = String(fingerprintMeta?.status || "").toLowerCase();
  const showUpload = canUploadFingerprint && status !== "no_enquiry" && !activeRecord;

  return (
    <div className={panelClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
            Fingerprint
          </p>
          <p className="mt-1 text-sm text-white/75">
            Upload on behalf of the member when they have not uploaded yet.
          </p>
        </div>
        {activeRecord ? (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-100">
            Active
          </span>
        ) : status === "no_enquiry" ? (
          <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/60">
            No enquiry
          </span>
        ) : canUploadFingerprint ? (
          <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-100">
            Missing
          </span>
        ) : null}
      </div>

      {status === "no_enquiry" ? (
        <p className="mt-3 text-sm text-white/60">
          This member has no linked enquiry. Contact admin to link an enquiry before uploading.
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
        <p className="mt-3 text-sm text-white/60">Loading fingerprint…</p>
      ) : activeRecord ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          {viewUrl ? (
            <img
              src={viewUrl}
              alt="Fingerprint preview"
              className="h-28 w-28 shrink-0 rounded-xl border border-white/20 bg-black/25 object-contain"
            />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/25 bg-black/20 text-xs text-white/50">
              No preview
            </div>
          )}
          <div className="min-w-0 text-sm text-white/75">
            {activeRecord?.uploadedAt ? (
              <p>Uploaded {formatDateTime(activeRecord.uploadedAt)}</p>
            ) : null}
            {activeRecord?.expiresAt ? (
              <p>Expires {formatDateTime(activeRecord.expiresAt)}</p>
            ) : null}
            {countdown ? <p className="font-semibold text-amber-200/90">{countdown}</p> : null}
          </div>
        </div>
      ) : showUpload ? (
        <p className="mt-3 text-sm text-white/60">No active fingerprint on file.</p>
      ) : null}

      {showUpload ? (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={attestationChecked}
              onChange={(event) => {
                setAttestationChecked(event.target.checked);
                if (event.target.checked) setError("");
              }}
              className="mt-0.5"
            />
            <span>
              I confirm that the user has provided informed consent for fingerprint capture.
            </span>
          </label>
          <p className="text-xs text-white/55">JPEG, PNG, or WebP · max 10 MB</p>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className={buttonClass}
          >
            {uploading ? "Uploading…" : "Upload fingerprint"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </div>
      ) : null}
    </div>
  );
}
