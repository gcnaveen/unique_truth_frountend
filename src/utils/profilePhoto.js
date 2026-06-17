import { confirmProfilePhoto, presignProfilePhoto } from "../api/uploads";
import { putFileToPresignedUrl } from "../counsellor/utils/upload";

export const unwrapApiPayload = (response) => response?.data ?? response ?? {};

export const pickUserProfilePhotoUrl = (user) => {
  if (!user || typeof user !== "object") return "";
  const nested = user.profilePhoto;
  return (
    user.profilePhotoUrl ||
    user.photoUrl ||
    user.avatarUrl ||
    user.imageUrl ||
    (typeof nested === "string" ? nested : nested?.url || nested?.signedUrl || "") ||
    ""
  );
};

export const pickPresignProfilePhoto = (response) => {
  const payload = unwrapApiPayload(response);
  return {
    uploadUrl: payload.uploadUrl || payload.upload_url || payload.url || "",
    key: payload.key || payload.profilePhotoKey || payload.storageKey || "",
    publicUrl: payload.publicUrl || payload.profilePhotoUrl || "",
    payload,
  };
};

export const pickConfirmProfilePhoto = (response) => {
  const payload = unwrapApiPayload(response);
  return {
    profilePhotoUrl:
      payload.profilePhotoUrl || payload.publicUrl || payload.url || "",
    profilePhotoKey:
      payload.profilePhotoKey || payload.key || payload.storageKey || "",
  };
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const validateProfileImageFile = (file) => {
  if (!file) return "No file selected.";
  if (!IMAGE_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
    return "Please choose a JPEG, PNG, WebP, or GIF image.";
  }
  return "";
};

/**
 * Presign → PUT S3 → confirm. Returns URLs/keys for PATCH on user profile.
 */
export const uploadProfilePhotoFile = async (accessToken, file) => {
  const validationError = validateProfileImageFile(file);
  if (validationError) throw new Error(validationError);

  const presignRes = await presignProfilePhoto(accessToken, {
    contentType: file.type,
  });
  const { uploadUrl, key, publicUrl, payload } = pickPresignProfilePhoto(presignRes);
  if (!uploadUrl) throw new Error("Upload URL not returned.");

  const extraHeaders = {};
  if (payload?.headers && typeof payload.headers === "object") {
    Object.assign(extraHeaders, payload.headers);
  }

  await putFileToPresignedUrl(uploadUrl, file, extraHeaders);

  const profilePhotoKey = key || payload?.profilePhotoKey || payload?.key;
  if (!profilePhotoKey) throw new Error("Storage key not returned from presign.");

  const confirmRes = await confirmProfilePhoto(accessToken, { profilePhotoKey });
  const confirmed = pickConfirmProfilePhoto(confirmRes);

  return {
    profilePhotoUrl: confirmed.profilePhotoUrl || publicUrl || "",
    profilePhotoKey: confirmed.profilePhotoKey || profilePhotoKey,
  };
};
