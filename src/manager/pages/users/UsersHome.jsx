import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import UserAvatar from "../../../components/profile/UserAvatar";
import { getManagerUsers } from "../../../api/manager";
import ManagerUserDrawer from "./components/ManagerUserDrawer";
import {
  accountStatusTone,
  enquiryStatusTone,
  fingerprintStatusTone,
  formatEnquiryStatus,
  formatFingerprintStatus,
  getManagerUserId,
  normalizeManagerUserList,
} from "../../../utils/managerUsers";

const DEFAULT_ACCOUNT_FILTERS = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
  { value: "all", label: "All" },
];

const DEFAULT_FINGERPRINT_FILTERS = [
  { value: "", label: "All fingerprints" },
  { value: "missing", label: "Missing" },
  { value: "uploaded", label: "Uploaded" },
  { value: "no_enquiry", label: "No enquiry" },
];

const DEFAULT_ENQUIRY_FILTERS = [
  { value: "", label: "All enquiries" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
  { value: "none", label: "None" },
];

const filterButtonClass = (active) =>
  [
    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
    active
      ? "border-[#5eead4]/50 bg-[#5eead4]/15 text-[#a7f3d0]"
      : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10",
  ].join(" ");

export default function ManagerUsersHome() {
  const { access_token } = useSelector((state) => state.user.value);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountStatus, setAccountStatus] = useState("active");
  const [fingerprintFilter, setFingerprintFilter] = useState("");
  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [availableFilters, setAvailableFilters] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const accountFilters = availableFilters?.accountStatus
    ? availableFilters.accountStatus.map((value) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
      }))
    : DEFAULT_ACCOUNT_FILTERS;

  const fingerprintFilters = availableFilters?.fingerprint
    ? [
        { value: "", label: "All fingerprints" },
        ...availableFilters.fingerprint.map((value) => ({
          value,
          label:
            value === "no_enquiry"
              ? "No enquiry"
              : value.charAt(0).toUpperCase() + value.slice(1),
        })),
      ]
    : DEFAULT_FINGERPRINT_FILTERS;

  const enquiryFilters = availableFilters?.enquiryStatus
    ? [
        { value: "", label: "All enquiries" },
        ...availableFilters.enquiryStatus.map((value) => ({
          value,
          label:
            value === "in_progress"
              ? "In progress"
              : value === "no_enquiry" || value === "none"
                ? "None"
                : value.charAt(0).toUpperCase() + value.slice(1),
        })),
      ]
    : DEFAULT_ENQUIRY_FILTERS;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadUsers = async () => {
    if (!access_token) return;
    try {
      setLoading(true);
      setError("");
      const params = { page, limit, accountStatus };
      if (fingerprintFilter) params.fingerprint = fingerprintFilter;
      if (enquiryStatus) params.enquiryStatus = enquiryStatus;
      const response = await getManagerUsers(access_token, params);
      const parsed = normalizeManagerUserList(response);
      setUsers(parsed.items);
      setTotal(parsed.total);
      setAvailableFilters(parsed.filters?.available || null);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load portal users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [access_token, page, limit, accountStatus, fingerprintFilter, enquiryStatus]);

  const openDrawer = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleUserUpdated = (updated) => {
    const id = getManagerUserId(updated);
    setUsers((prev) =>
      prev.map((item) => (getManagerUserId(item) === id ? { ...item, ...updated } : item)),
    );
    setSelectedUser((prev) => (prev && getManagerUserId(prev) === id ? { ...prev, ...updated } : prev));
    loadUsers();
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Portal members
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Manage members in your franchise — view fingerprint status, upload on their behalf, and
          block or unblock access.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-white/15 bg-white/[0.07] p-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/55">Account</p>
          <div className="flex flex-wrap gap-2">
            {accountFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setAccountStatus(option.value);
                }}
                className={filterButtonClass(accountStatus === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/55">
            Fingerprint
          </p>
          <div className="flex flex-wrap gap-2">
            {fingerprintFilters.map((option) => (
              <button
                key={option.value || "all"}
                type="button"
                onClick={() => {
                  setPage(1);
                  setFingerprintFilter(option.value);
                }}
                className={filterButtonClass(fingerprintFilter === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/55">
            Enquiry
          </p>
          <div className="flex flex-wrap gap-2">
            {enquiryFilters.map((option) => (
              <button
                key={option.value || "all-enquiry"}
                type="button"
                onClick={() => {
                  setPage(1);
                  setEnquiryStatus(option.value);
                }}
                className={filterButtonClass(enquiryStatus === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07]">
        {loading ? (
          <p className="p-6 text-sm text-white/60">Loading members…</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-white/60">No members match these filters.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {users.map((user) => {
              const id = getManagerUserId(user);
              const enquiry = user?.enquiry;
              const fingerprint = user?.fingerprint || {};
              const isActive = user?.isActive !== false;
              return (
                <li key={id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <button
                      type="button"
                      onClick={() => openDrawer(user)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <UserAvatar
                        name={user?.name || "Member"}
                        photoUrl={user?.profilePhotoUrl}
                        size={40}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{user?.name || "Member"}</p>
                        <p className="truncate text-sm text-white/55">{user?.email || "—"}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={[
                              "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              accountStatusTone(isActive),
                            ].join(" ")}
                          >
                            {isActive ? "Active" : "Blocked"}
                          </span>
                          <span
                            className={[
                              "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              enquiryStatusTone(enquiry?.status),
                            ].join(" ")}
                          >
                            {formatEnquiryStatus(enquiry?.status || "none")}
                          </span>
                          <span
                            className={[
                              "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              fingerprintStatusTone(fingerprint),
                            ].join(" ")}
                          >
                            {formatFingerprintStatus(fingerprint)}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex flex-wrap gap-2">
                      {fingerprint.canUploadFingerprint ? (
                        <button
                          type="button"
                          onClick={() => openDrawer(user)}
                          className="rounded-lg border border-[#5eead4]/40 bg-[#5eead4]/10 px-3 py-1.5 text-xs font-semibold text-[#a7f3d0]"
                        >
                          Upload fingerprint
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => openDrawer(user)}
                        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-white/55">
            Page {page} of {totalPages} · {total} members
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <ManagerUserDrawer
        open={drawerOpen}
        user={selectedUser}
        accessToken={access_token}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUser(null);
        }}
        onUpdated={handleUserUpdated}
      />
    </div>
  );
}
