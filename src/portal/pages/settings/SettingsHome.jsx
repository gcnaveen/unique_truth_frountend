import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeAccountPassword } from "../../../api/account";
import {
  getPortalDataExport,
  getPortalMe,
  patchPortalMe,
  postPortalDataRequest,
} from "../../../api/portal";
import ProfilePhotoEditor from "../../../components/profile/ProfilePhotoEditor";
import { passwordChanged, updateUser } from "../../../reducers/user";
import { MIN_PASSWORD_LENGTH } from "../../../utils/authConstants";
import { pickPortalAccessFromLogin } from "../../utils/access";
import { pickProfileEdit } from "../../../utils/profileEdit";
import {
  pickUserProfilePhotoUrl,
  unwrapApiPayload,
} from "../../../utils/profilePhoto";

export default function PortalSettingsHome() {
  const dispatch = useDispatch();
  const {
    access_token,
    name: storedName,
    profilePhotoUrl: storedPhoto,
    profileEdit: storedEdit,
  } = useSelector((state) => state.user.value);

  const [profileEdit, setProfileEdit] = useState(
    storedEdit || pickProfileEdit(null, { isPortalUser: true }),
  );
  const [name, setName] = useState(storedName || "");
  const [photoUrl, setPhotoUrl] = useState(storedPhoto || "");
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestType, setRequestType] = useState("access");
  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const panelClass = "rounded-2xl border border-white/15 bg-white/8 p-5 md:p-6";

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        const response = await getPortalMe(access_token);
        const data = unwrapApiPayload(response);
        const edit = pickProfileEdit(data, { isPortalUser: true });
        const access = pickPortalAccessFromLogin(data);
        setProfileEdit(edit);
        setName(data.name || storedName || "");
        setPhotoUrl(pickUserProfilePhotoUrl(data));
        dispatch(
          updateUser({
            name: data.name,
            profilePhotoUrl: pickUserProfilePhotoUrl(data),
            profileEdit: edit,
            ...access,
          }),
        );
      } catch {
        setProfileEdit(pickProfileEdit(storedEdit, { isPortalUser: true }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token, dispatch]);

  const handleNameSave = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await patchPortalMe(access_token, { name: trimmed });
      dispatch(updateUser({ name: trimmed }));
      setSuccess("Name updated.");
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Failed to update name.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoSaved = async (url) => {
    await patchPortalMe(access_token, { profilePhotoUrl: url });
    setPhotoUrl(url);
    dispatch(updateUser({ profilePhotoUrl: url }));
    setSuccess("Profile photo updated.");
    setError("");
  };

  const handlePhotoRemoved = async () => {
    await patchPortalMe(access_token, { profilePhotoUrl: null });
    setPhotoUrl("");
    dispatch(updateUser({ profilePhotoUrl: "" }));
    setSuccess("Profile photo removed.");
    setError("");
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await changeAccountPassword(access_token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
      dispatch(passwordChanged());
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");
      setSuccess("");
      const response = await getPortalDataExport(access_token);
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `unique-truth-data-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess("Your data export has started.");
    } catch (exportError) {
      setError(exportError?.response?.data?.message || "Data export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleDataRequest = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = { type: requestType };
      if (requestNote.trim()) payload.note = requestNote.trim();
      const response = await postPortalDataRequest(access_token, payload);
      setSuccess(response?.message || "Your request has been submitted.");
      setRequestNote("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Request could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-white/70">Loading settings…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-white">Privacy & account</h1>
        <p className="mt-2 text-sm text-white/70">
          Manage your profile, password, data export, and privacy requests.
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

      {profileEdit?.canEditName ? (
        <form onSubmit={handleNameSave} className={panelClass}>
          <h2 className="text-lg font-semibold text-white">Your name</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-4 w-full max-w-md rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0] disabled:opacity-50"
          >
            Save name
          </button>
        </form>
      ) : null}

      {profileEdit?.canEditProfilePhoto !== false ? (
        <ProfilePhotoEditor
          accessToken={access_token}
          photoUrl={photoUrl}
          name={name}
          canEdit
          onPhotoSaved={handlePhotoSaved}
          onPhotoRemoved={handlePhotoRemoved}
          onError={setError}
          helperText="Update your member portal profile photo."
        />
      ) : null}

      {profileEdit?.canChangePassword !== false ? (
        <form onSubmit={handlePassword} className={panelClass}>
          <h2 className="text-lg font-semibold text-white">Change password</h2>
          <p className="mt-1 text-xs text-white/55">
            Use a strong password you have not used elsewhere.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4] sm:col-span-2"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2 text-sm font-semibold text-[#0f2e1a] disabled:opacity-50"
          >
            Update password
          </button>
        </form>
      ) : null}

      <div className={panelClass}>
        <h2 className="text-lg font-semibold text-white">Export my data</h2>
        <p className="mt-1 text-xs text-white/55">DPDP right of access — download a copy of your data.</p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0] disabled:opacity-50"
        >
          {exporting ? "Preparing export…" : "Download data export"}
        </button>
      </div>

      <form onSubmit={handleDataRequest} className={panelClass}>
        <h2 className="text-lg font-semibold text-white">Data principal request</h2>
        <p className="mt-1 text-xs text-white/55">
          Request a copy of your data or erasure under DPDP.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: "access", label: "Access copy" },
            { id: "erasure", label: "Erasure" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRequestType(opt.id)}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-semibold",
                requestType === opt.id
                  ? "border-[#5eead4]/60 bg-[#5eead4]/20 text-[#a7f3d0]"
                  : "border-white/20 bg-white/5 text-white/75",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <textarea
          value={requestNote}
          onChange={(e) => setRequestNote(e.target.value)}
          rows={3}
          placeholder="Optional note for our privacy team…"
          className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Submit request
        </button>
      </form>
    </div>
  );
}
