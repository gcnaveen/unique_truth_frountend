import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeAccountPassword,
  getAccountMe,
  patchAccountProfilePhoto,
} from "../api/account";
import ChangePasswordModal from "../components/account/ChangePasswordModal";
import ProfilePhotoEditor from "../components/profile/ProfilePhotoEditor";
import { passwordChanged, updateUser } from "../reducers/user";
import { MIN_PASSWORD_LENGTH } from "../utils/authConstants";
import {
  formatAccountRole,
  pickAccountPayload,
  pickAccountUser,
  pickUserProfilePhotoUrl,
} from "../utils/accountProfile";
import { pickProfileEdit } from "../utils/profileEdit";

const panelClass =
  "rounded-2xl border border-white/15 bg-white/[0.07] shadow-lg backdrop-blur-sm";

export default function AccountSettingsPage() {
  const dispatch = useDispatch();
  const { access_token, name, profilePhotoUrl, profileEdit: storedEdit } = useSelector(
    (state) => state.user.value,
  );

  const [accountUser, setAccountUser] = useState(null);
  const [profileEdit, setProfileEdit] = useState(storedEdit || pickProfileEdit(null));
  const [photoUrl, setPhotoUrl] = useState(profilePhotoUrl || "");
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAccountMe(access_token);
        const payload = pickAccountPayload(response);
        const user = pickAccountUser(response);
        const edit = pickProfileEdit(payload);
        const url = pickUserProfilePhotoUrl(user);

        setAccountUser(user);
        setProfileEdit(edit);
        setPhotoUrl(url);
        dispatch(
          updateUser({
            name: user?.name || name,
            email_id: user?.email,
            profilePhotoUrl: url,
            profileEdit: edit,
          }),
        );
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Could not load your profile.");
        setProfileEdit(pickProfileEdit(storedEdit || null));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token, dispatch]);

  const displayName = accountUser?.name || name || "—";
  const displayEmail = accountUser?.email || "—";
  const displayRole = formatAccountRole(accountUser?.role);

  const handlePhotoSaved = async (url) => {
    await patchAccountProfilePhoto(access_token, { profilePhotoUrl: url });
    setPhotoUrl(url);
    setAccountUser((prev) => (prev ? { ...prev, profilePhotoUrl: url } : prev));
    dispatch(updateUser({ profilePhotoUrl: url }));
    setSuccess("Profile photo updated.");
    setError("");
  };

  const handlePhotoRemoved = async () => {
    await patchAccountProfilePhoto(access_token, { profilePhotoUrl: null });
    setPhotoUrl("");
    setAccountUser((prev) =>
      prev ? { ...prev, profilePhotoUrl: "", profilePhotoKey: "" } : prev,
    );
    dispatch(updateUser({ profilePhotoUrl: "" }));
    setSuccess("Profile photo removed.");
    setError("");
  };

  const handlePasswordSubmit = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordModalError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordModalError("New passwords do not match.");
      return;
    }

    try {
      setSubmittingPassword(true);
      setPasswordModalError("");
      await changeAccountPassword(access_token, { currentPassword, newPassword });
      setPasswordModalOpen(false);
      setSuccess("Password updated successfully.");
      setError("");
      dispatch(passwordChanged());
    } catch (submitError) {
      setPasswordModalError(
        submitError?.response?.data?.message || "Failed to update password.",
      );
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-sm text-white/70">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          My profile
        </h1>
        <p className="mt-2 text-sm text-white/75">
          {profileEdit?.note ||
            "Update your profile photo and manage your password."}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <section className={`${panelClass} overflow-hidden`}>
        {profileEdit?.canEditProfilePhoto !== false ? (
          <div className="border-b border-white/10 px-5 py-6 md:px-8">
            <ProfilePhotoEditor
              accessToken={access_token}
              photoUrl={photoUrl}
              name={displayName}
              canEdit
              hideHeader
              showUploadButton
              avatarSize={96}
              onPhotoSaved={handlePhotoSaved}
              onPhotoRemoved={handlePhotoRemoved}
              onError={setError}
            />
          </div>
        ) : null}

        <div className="px-5 py-6 md:px-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/55">
            Account information
          </h3>
          <dl className="mt-4 divide-y divide-white/10">
            <div className="grid gap-1 py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="text-sm font-medium text-white/55">Full name</dt>
              <dd className="text-sm text-white">{displayName}</dd>
            </div>
            <div className="grid gap-1 py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="text-sm font-medium text-white/55">Email</dt>
              <dd className="text-sm text-white">{displayEmail}</dd>
            </div>
            <div className="grid gap-1 py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="text-sm font-medium text-white/55">Role</dt>
              <dd className="text-sm text-white">{displayRole}</dd>
            </div>
          </dl>

          {profileEdit?.canChangePassword !== false ? (
            <div className="mt-6 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => {
                  setPasswordModalError("");
                  setPasswordModalOpen(true);
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
              >
                Change password
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => !submittingPassword && setPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        submitting={submittingPassword}
        error={passwordModalError}
      />
    </div>
  );
}
