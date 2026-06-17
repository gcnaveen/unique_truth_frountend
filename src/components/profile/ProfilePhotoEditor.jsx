import { useEffect, useRef, useState } from "react";
import { uploadProfilePhotoFile } from "../../utils/profilePhoto";
import UserAvatar from "./UserAvatar";

/**
 * Presign → S3 → confirm, then calls onPhotoSaved(profilePhotoUrl).
 * Parent is responsible for PATCH user record (account/me, portal/me, admin user, etc.).
 */
export default function ProfilePhotoEditor({
  accessToken,
  photoUrl = "",
  name = "",
  canEdit = true,
  canRemove = true,
  showUploadButton = false,
  onPhotoSaved,
  onPhotoRemoved,
  onError,
  compact = false,
  hideHeader = false,
  avatarSize: avatarSizeProp,
  helperText = "",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [stagedFile, setStagedFile] = useState(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState("");

  const displayUrl = stagedPreviewUrl || previewUrl || photoUrl;
  const busy = uploading || removing;
  const avatarSize = avatarSizeProp ?? (compact ? 56 : 80);
  const hasStagedUpload = Boolean(stagedFile);

  useEffect(() => {
    if (!uploading && !stagedFile) setPreviewUrl("");
  }, [photoUrl, uploading, stagedFile]);

  useEffect(() => {
    return () => {
      if (stagedPreviewUrl) URL.revokeObjectURL(stagedPreviewUrl);
    };
  }, [stagedPreviewUrl]);

  const handlePick = () => {
    if (!busy && canEdit) inputRef.current?.click();
  };

  const clearStagedFile = () => {
    if (stagedPreviewUrl) URL.revokeObjectURL(stagedPreviewUrl);
    setStagedFile(null);
    setStagedPreviewUrl("");
  };

  const uploadFile = async (file) => {
    if (!file || !accessToken || !canEdit) return;

    try {
      setUploading(true);
      const { profilePhotoUrl } = await uploadProfilePhotoFile(accessToken, file);
      if (!profilePhotoUrl) throw new Error("Photo URL not returned after upload.");
      setPreviewUrl(profilePhotoUrl);
      clearStagedFile();
      await onPhotoSaved?.(profilePhotoUrl);
    } catch (err) {
      onError?.(
        err?.response?.data?.message || err?.message || "Profile photo upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !accessToken || !canEdit) return;

    if (showUploadButton) {
      clearStagedFile();
      const localPreview = URL.createObjectURL(file);
      setStagedFile(file);
      setStagedPreviewUrl(localPreview);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      setUploading(true);
      const { profilePhotoUrl } = await uploadProfilePhotoFile(accessToken, file);
      if (!profilePhotoUrl) throw new Error("Photo URL not returned after upload.");
      setPreviewUrl(profilePhotoUrl);
      await onPhotoSaved?.(profilePhotoUrl);
    } catch (err) {
      setPreviewUrl(photoUrl || "");
      onError?.(
        err?.response?.data?.message || err?.message || "Profile photo upload failed.",
      );
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleUploadClick = async () => {
    if (!stagedFile || busy) return;
    await uploadFile(stagedFile);
  };

  const handleRemove = async () => {
    if (!canEdit || !canRemove || !displayUrl || busy) return;
    try {
      setRemoving(true);
      await onPhotoRemoved?.();
      setPreviewUrl("");
    } catch (err) {
      onError?.(
        err?.response?.data?.message || err?.message || "Could not remove profile photo.",
      );
    } finally {
      setRemoving(false);
    }
  };

  if (!canEdit && !displayUrl) return null;

  const showHeader = !compact && !hideHeader;

  return (
    <div className={compact || hideHeader ? "" : "rounded-xl border border-white/20 bg-white/10 p-4 md:p-5"}>
      {showHeader ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Profile photo
          </p>
          <p className="mt-1 text-sm text-white/70">
            {helperText ||
              (canEdit
                ? "Upload or replace your profile picture."
                : "Your profile photo.")}
          </p>
        </>
      ) : null}

      <div className={`flex items-center gap-4 ${showHeader ? "mt-4" : ""}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {canEdit ? (
          <button
            type="button"
            onClick={handlePick}
            disabled={busy}
            title={displayUrl ? "Change photo" : "Add photo"}
            className={[
              "relative shrink-0 overflow-hidden rounded-full border-2 transition-colors",
              displayUrl
                ? "border-[#5eead4]/50 hover:border-[#5eead4]"
                : "border-dashed border-white/35 bg-white/5 hover:border-[#c9a86c]/60",
              busy ? "cursor-wait opacity-60" : "cursor-pointer",
            ].join(" ")}
          >
            {displayUrl ? (
              <UserAvatar name={name} photoUrl={displayUrl} size={avatarSize} />
            ) : (
              <span
                className="flex items-center justify-center text-[#c9a86c]"
                style={{ width: avatarSize, height: avatarSize }}
              >
                <span className="text-3xl font-light leading-none">+</span>
              </span>
            )}
            {busy ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px] font-semibold text-white">
                …
              </span>
            ) : null}
          </button>
        ) : (
          <UserAvatar name={name} photoUrl={displayUrl} size={avatarSize} />
        )}

        <div className="min-w-0 flex-1 text-sm text-white/60">
          {canEdit ? (
            <>
              {showUploadButton ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePick}
                    disabled={busy}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Choose image
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={busy || !hasStagedUpload}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-3 text-xs font-semibold text-[#0f2e1a] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? "Uploading…" : "Upload"}
                  </button>
                </div>
              ) : (
                <p>{displayUrl ? "Click the photo to replace it." : "Click + to add a photo."}</p>
              )}
              {hasStagedUpload && !uploading ? (
                <p className="mt-2 text-xs text-white/50">
                  Image selected. Click Upload to save.
                </p>
              ) : null}
              {displayUrl && canRemove && !hasStagedUpload ? (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={busy}
                  className="mt-2 text-xs font-semibold text-red-200/90 hover:text-red-100 disabled:opacity-50"
                >
                  Remove photo
                </button>
              ) : null}
            </>
          ) : (
            <p>Contact an admin to change your photo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
