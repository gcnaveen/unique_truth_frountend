import ProfilePhotoEditor from "../../../../components/profile/ProfilePhotoEditor";
import UserAvatar from "../../../../components/profile/UserAvatar";
import { patchFranchiseAdminUserProfilePhoto } from "../../../../api/franchiseAdmin";
import { pickUserProfilePhotoUrl } from "../../../../utils/profilePhoto";

export { pickUserProfilePhotoUrl };

export function FranchiseTeamPhotoAvatar({ photoUrl, name }) {
  return (
    <div className="flex justify-center">
      <UserAvatar name={name} photoUrl={photoUrl} size={44} />
    </div>
  );
}

export function FranchiseTeamProfilePhotoUpload({
  userId,
  photoUrl,
  name,
  accessToken,
  onUploaded,
  onError,
}) {
  const handlePhotoSaved = async (url) => {
    await patchFranchiseAdminUserProfilePhoto(accessToken, userId, {
      profilePhotoUrl: url,
    });
    onUploaded?.(url);
  };

  const handlePhotoRemoved = async () => {
    await patchFranchiseAdminUserProfilePhoto(accessToken, userId, {
      profilePhotoUrl: null,
    });
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
      helperText="Upload a profile photo for this team member."
    />
  );
}
