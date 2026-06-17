import ProfilePhotoEditor from "../../../../components/profile/ProfilePhotoEditor";
import UserAvatar from "../../../../components/profile/UserAvatar";
import { patchAdminUserProfilePhoto } from "../../../../api/users";
import { pickUserProfilePhotoUrl } from "../../../../utils/profilePhoto";

export { pickUserProfilePhotoUrl };

/** Read-only avatar for the users table. */
export function UserProfilePhotoAvatar({ photoUrl, name }) {
  return (
    <div className="flex justify-center">
      <UserAvatar name={name} photoUrl={photoUrl} size={44} />
    </div>
  );
}

/** Upload on admin edit user — presign → confirm → PATCH profile-photo. */
export function UserProfilePhotoUpload({
  userId,
  photoUrl,
  accessToken,
  name,
  onUploaded,
  onError,
}) {
  const handlePhotoSaved = async (url) => {
    await patchAdminUserProfilePhoto(accessToken, userId, { profilePhotoUrl: url });
    onUploaded?.(url);
  };

  const handlePhotoRemoved = async () => {
    await patchAdminUserProfilePhoto(accessToken, userId, { profilePhotoUrl: null });
    onUploaded?.("");
  };

  return (
    <ProfilePhotoEditor
      accessToken={accessToken}
      photoUrl={photoUrl}
      name={name}
      canEdit
      onPhotoSaved={handlePhotoSaved}
      onPhotoRemoved={handlePhotoRemoved}
      onError={onError}
      helperText="Upload a photo for this user. It is saved when upload completes."
    />
  );
}
