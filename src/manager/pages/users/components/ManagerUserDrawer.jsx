import { useEffect, useState } from "react";
import UserAvatar from "../../../../components/profile/UserAvatar";
import { getManagerUserById, patchManagerUserBlock } from "../../../../api/manager";
import ManagerFingerprintPanel from "../../../components/ManagerFingerprintPanel";
import { formatDateTime } from "../../../../portal/utils/format";
import {
  accountStatusTone,
  enquiryStatusTone,
  formatEnquiryStatus,
  formatFingerprintStatus,
  fingerprintStatusTone,
  formatManagerUserRole,
  getManagerUserId,
  pickManagerUser,
} from "../../../../utils/managerUsers";

const panelClass = "rounded-xl border border-white/15 bg-white/5 p-4";

export default function ManagerUserDrawer({
  open,
  user,
  accessToken,
  onClose,
  onUpdated,
}) {
  const [detail, setDetail] = useState(user);
  const [loading, setLoading] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState("");

  const userId = getManagerUserId(user);

  useEffect(() => {
    if (!open || !userId || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getManagerUserById(accessToken, userId);
        setDetail(pickManagerUser(response));
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load user.");
        setDetail(user);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, userId, accessToken, user]);

  const handleBlockToggle = async () => {
    if (!userId || !accessToken || !detail) return;
    const nextActive = detail.isActive === false;
    const action = nextActive ? "unblock" : "block";
    const confirmed = window.confirm(
      nextActive
        ? "Restore portal access for this member?"
        : "Block this member? They will not be able to log in.",
    );
    if (!confirmed) return;

    try {
      setBlocking(true);
      setError("");
      const response = await patchManagerUserBlock(accessToken, userId, {
        isActive: nextActive,
      });
      const updated = pickManagerUser(response) || { ...detail, isActive: nextActive };
      setDetail(updated);
      onUpdated?.(updated);
    } catch (actionError) {
      setError(actionError?.response?.data?.message || `Could not ${action} user.`);
    } finally {
      setBlocking(false);
    }
  };

  if (!open) return null;

  const enquiry = detail?.enquiry;
  const fingerprint = detail?.fingerprint || {};
  const isActive = detail?.isActive !== false;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-white/15 bg-[#0f2e1a]/98 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <UserAvatar
              name={detail?.name || "Member"}
              photoUrl={detail?.profilePhotoUrl}
              size={48}
            />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-white">
                {detail?.name || "Member"}
              </h2>
              <p className="truncate text-sm text-white/60">{detail?.email || "—"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-white/60">Loading member…</p>
          ) : detail ? (
            <div className="space-y-4">
              <div className={`${panelClass} flex flex-wrap gap-2`}>
                <span
                  className={[
                    "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                    accountStatusTone(isActive),
                  ].join(" ")}
                >
                  {isActive ? "Active" : "Blocked"}
                </span>
                <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
                  {formatManagerUserRole(detail.role)}
                </span>
                <span
                  className={[
                    "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                    fingerprintStatusTone(fingerprint),
                  ].join(" ")}
                >
                  Fingerprint · {formatFingerprintStatus(fingerprint)}
                </span>
              </div>

              <div className={panelClass}>
                <h3 className="text-sm font-semibold text-white">Member details</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/55">Joined</dt>
                    <dd className="text-white/85">{formatDateTime(detail.createdAt)}</dd>
                  </div>
                  {detail.franchiseId ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/55">Franchise</dt>
                      <dd className="truncate font-mono text-xs text-white/75">
                        {detail.franchiseId}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className={panelClass}>
                <h3 className="text-sm font-semibold text-white">Enquiry</h3>
                {enquiry?.id || enquiry?._id ? (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          enquiryStatusTone(enquiry.status),
                        ].join(" ")}
                      >
                        {formatEnquiryStatus(enquiry.status)}
                      </span>
                    </div>
                    <p className="text-white/80">{enquiry.service || "—"}</p>
                    {enquiry.convertedAt ? (
                      <p className="text-white/55">
                        Converted {formatDateTime(enquiry.convertedAt)}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-white/60">No enquiry linked.</p>
                )}
              </div>

              <ManagerFingerprintPanel
                userId={userId}
                accessToken={accessToken}
                canUploadFingerprint={Boolean(fingerprint.canUploadFingerprint)}
                fingerprintMeta={fingerprint}
                onUploaded={() => {
                  getManagerUserById(accessToken, userId)
                    .then((response) => {
                      const updated = pickManagerUser(response);
                      setDetail(updated);
                      onUpdated?.(updated);
                    })
                    .catch(() => {});
                }}
              />

              <div className="border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={handleBlockToggle}
                  disabled={blocking}
                  className={[
                    "rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50",
                    isActive
                      ? "border-red-400/40 bg-red-500/10 text-red-100"
                      : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
                  ].join(" ")}
                >
                  {blocking ? "Saving…" : isActive ? "Block member" : "Unblock member"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
