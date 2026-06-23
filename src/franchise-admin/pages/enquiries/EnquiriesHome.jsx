import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import EnquiryDetailsDrawer from "../../../admin/pages/enquire/components/EnquiryDetailsDrawer";
import UserAvatar from "../../../components/profile/UserAvatar";
import { pickUserProfilePhotoUrl } from "../../../utils/profilePhoto";
import {
  assignFranchiseAdminEnquiryTeam,
  getFranchiseAdminEnquiryAssignmentSettings,
  getFranchiseAdminEnquiryById,
  getFranchiseAdminEnquiries,
  getFranchiseAdminTeam,
  patchFranchiseAdminEnquiryAssignmentSettings,
} from "../../../api/franchiseAdmin";

const normalizePagedItems = (response) => {
  const payload = response?.data ?? response ?? {};
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];
  const total = Number(payload?.total);
  const limit = Number(payload?.limit);
  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
    limit: Number.isFinite(limit) && limit > 0 ? limit : items.length || 10,
  };
};

const unwrapPayload = (response) => response?.data ?? response ?? {};

const pickAutoAssign = (payload) => {
  const value =
    payload?.autoAssign ??
    payload?.enquiryAutoAssign ??
    payload?.autoAssignment ??
    payload?.enabled;
  return value === true;
};

const formatService = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

const getAssignedSalesId = (row) =>
  row?.salesId ||
  row?.assignedSalesId ||
  row?.assignedSales?._id ||
  row?.assignedSales?.id ||
  row?.assignedTo?._id ||
  row?.assignedTo?.id ||
  "";

const getAssignedCounsellorId = (row) =>
  row?.counsellorId ||
  row?.assignedCounsellorId ||
  row?.assignedCounsellor?._id ||
  row?.assignedCounsellor?.id ||
  "";

const getAssigneeLabel = (row, nestedField) => {
  const nested = row?.[nestedField];
  if (nested?.name) return nested.name;
  if (nested?.email) return nested.email;
  return "—";
};

const AssigneeCell = ({ row, nestedField, accentClass }) => {
  const nested = row?.[nestedField];
  const label = getAssigneeLabel(row, nestedField);
  if (!nested || label === "—") {
    return (
      <div className="flex min-h-[4.5rem] items-center justify-center">
        <span className="text-xs text-white/50">Unassigned</span>
      </div>
    );
  }
  return (
    <div className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5">
      <UserAvatar
        name={label}
        photoUrl={pickUserProfilePhotoUrl(nested)}
        size={32}
      />
      <span
        className={[
          "inline-flex max-w-[7.5rem] truncate rounded-md border px-2 py-0.5 text-[10px] font-semibold",
          accentClass,
        ].join(" ")}
        title={label}
      >
        {label}
      </span>
    </div>
  );
};

const thClass =
  "border-r border-white/15 px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-white last:border-r-0";
const tdClass =
  "border-r border-white/10 px-4 py-3 align-middle text-sm text-white/90 last:border-r-0";

const EnquiriesHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [enquiries, setEnquiries] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [counsellorTeam, setCounsellorTeam] = useState([]);
  const [autoAssign, setAutoAssign] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState("");
  const [teamByEnquiry, setTeamByEnquiry] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalCount || enquiries.length) / pageLimit)),
    [totalCount, enquiries.length, pageLimit],
  );

  const getEnquiryId = (row) => row?._id || row?.id || "";
  const getUserId = (row) => row?._id || row?.id || "";
  const getUserLabel = (row) =>
    row?.name ? `${row.name}${row.email ? ` (${row.email})` : ""}` : row?.email || "—";

  const loadTeam = async () => {
    try {
      const [salesResponse, counsellorResponse] = await Promise.all([
        getFranchiseAdminTeam(access_token, { role: "sales", limit: 100, skip: 0 }),
        getFranchiseAdminTeam(access_token, { role: "counsellor", limit: 100, skip: 0 }),
      ]);
      setSalesTeam(normalizePagedItems(salesResponse).items);
      setCounsellorTeam(normalizePagedItems(counsellorResponse).items);
    } catch {
      setSalesTeam([]);
      setCounsellorTeam([]);
    }
  };

  const loadAssignmentSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await getFranchiseAdminEnquiryAssignmentSettings(access_token);
      setAutoAssign(pickAutoAssign(unwrapPayload(response)));
    } catch {
      setAutoAssign(false);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const response = await getFranchiseAdminEnquiries(access_token, {
        limit: pageLimit,
        skip,
      });
      const { items, total } = normalizePagedItems(response);
      const detailResults = await Promise.allSettled(
        items.map(async (item) => {
          const enquiryId = getEnquiryId(item);
          if (!enquiryId) return item;
          const detailResponse = await getFranchiseAdminEnquiryById(access_token, enquiryId);
          const detail = unwrapPayload(detailResponse);
          return { ...item, ...detail };
        }),
      );
      const hydratedItems = detailResults.map((result, index) =>
        result.status === "fulfilled" ? result.value : items[index],
      );
      setEnquiries(hydratedItems);
      setTotalCount(total);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load franchise enquiries.");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!access_token) return;
    loadTeam();
    loadAssignmentSettings();
  }, [access_token]);

  useEffect(() => {
    if (!access_token) return;
    loadEnquiries();
  }, [access_token, currentPage, pageLimit]);

  useEffect(() => {
    if (!selectedEnquiry) {
      setIsDrawerVisible(false);
      return;
    }
    requestAnimationFrame(() => setIsDrawerVisible(true));
  }, [selectedEnquiry]);

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => setSelectedEnquiry(null), 300);
  };

  const handleToggleAutoAssign = async () => {
    const next = !autoAssign;
    try {
      setSettingsSaving(true);
      setError("");
      setSuccess("");
      const response = await patchFranchiseAdminEnquiryAssignmentSettings(access_token, {
        autoAssign: next,
      });
      const saved = pickAutoAssign(unwrapPayload(response));
      setAutoAssign(saved !== undefined ? saved : next);
      setSuccess(
        next
          ? "Auto-assign is on. New enquiries will be assigned automatically."
          : "Auto-assign is off. Assign sales and counsellor manually per enquiry.",
      );
    } catch (toggleError) {
      setError(toggleError?.response?.data?.message || "Could not update auto-assign setting.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const getTeamDraft = (enquiryId) =>
    teamByEnquiry[enquiryId] || { salesId: "", counsellorId: "" };

  const setTeamDraft = (enquiryId, patch) => {
    setTeamByEnquiry((prev) => ({
      ...prev,
      [enquiryId]: {
        salesId: "",
        counsellorId: "",
        ...prev[enquiryId],
        ...patch,
      },
    }));
  };

  const handleAssignTeam = async (enquiryId) => {
    if (!enquiryId) return;
    const { salesId, counsellorId } = getTeamDraft(enquiryId);
    if (!salesId) {
      setError("Select a sales person.");
      return;
    }
    if (!counsellorId) {
      setError("Select a counsellor.");
      return;
    }
    try {
      setAssigningId(enquiryId);
      setError("");
      setSuccess("");
      await assignFranchiseAdminEnquiryTeam(access_token, enquiryId, {
        salesId,
        counsellorId,
      });
      setSuccess("Sales and counsellor assigned to this enquiry.");
      setTeamByEnquiry((prev) => {
        const next = { ...prev };
        delete next[enquiryId];
        return next;
      });
      await loadEnquiries();
    } catch (assignError) {
      setError(assignError?.response?.data?.message || "Failed to assign team.");
    } finally {
      setAssigningId("");
    }
  };

  const rowActionButtonClass =
    "inline-flex h-9 w-full items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors";

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Enquiries</h1>
        <p className="text-sm text-white/90 md:text-base">
          Enquiries submitted for your franchise.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-4 rounded-xl border border-white/20 bg-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Enquiry assignment
          </p>
          <p className="mt-1 text-sm text-white/85">
            {autoAssign
              ? "New enquiries are auto-assigned to sales and counsellor in your branch."
              : "Turn on auto-assign or pick sales and counsellor manually for each enquiry."}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
          <span className="text-sm font-semibold text-white">Auto-assign</span>
          <button
            type="button"
            role="switch"
            aria-checked={autoAssign}
            disabled={settingsLoading || settingsSaving}
            onClick={handleToggleAutoAssign}
            className={[
              "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50",
              autoAssign ? "bg-[#5eead4]" : "bg-white/25",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                autoAssign ? "translate-x-5" : "translate-x-0",
              ].join(" ")}
            />
          </button>
          <span className="text-xs font-medium text-white/70">
            {settingsLoading ? "Loading…" : settingsSaving ? "Saving…" : autoAssign ? "On" : "Off"}
          </span>
        </label>
      </div>

      <div className="mb-4 rounded-xl border border-white/20 bg-white/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Queue</p>
        <p className="mt-1 text-2xl font-semibold text-white">{loading ? "…" : totalCount}</p>
        <p className="text-sm text-white/80">Total in your franchise</p>
      </div>

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-white">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm font-medium text-white">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
        <table className="w-full min-w-[1260px] table-fixed border-collapse">
          <thead className="bg-white/20">
            <tr>
              <th className={`${thClass} w-[3%] text-center`}>#</th>
              <th className={`${thClass} w-[10%] text-left`}>Name</th>
              <th className={`${thClass} w-[14%] text-left`}>Contact</th>
              <th className={`${thClass} w-[11%] text-left`}>Service</th>
              <th className={`${thClass} w-[10%] text-left`}>Branch</th>
              <th className={`${thClass} w-[12%] text-center`}>Sales</th>
              <th className={`${thClass} w-[12%] text-center`}>Counsellor</th>
              <th className={`${thClass} w-[18%] text-center`}>Assignment</th>
              <th className={`${thClass} w-[10%] text-center`}>Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-white">
                  Loading enquiries…
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-white">
                  No enquiries for your franchise right now.
                </td>
              </tr>
            ) : (
              enquiries.map((row, index) => {
                const enquiryId = getEnquiryId(row);
                const isAssigning = assigningId === enquiryId;
                const assignedSalesId = getAssignedSalesId(row);
                const assignedCounsellorId = getAssignedCounsellorId(row);
                const isFullyAssigned = Boolean(assignedSalesId && assignedCounsellorId);
                const draft = getTeamDraft(enquiryId);

                return (
                  <tr
                    key={enquiryId || `e-${index}`}
                    className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                  >
                    <td className={`${tdClass} text-center text-white`}>
                      {(currentPage - 1) * pageLimit + index + 1}
                    </td>
                    <td className={`${tdClass} text-left font-medium text-white`}>
                      <span className="line-clamp-2 break-words">{row?.name || "—"}</span>
                    </td>
                    <td className={`${tdClass} text-left`}>
                      <div className="break-all">{row?.email || "—"}</div>
                      {row?.phoneNumber ? (
                        <div className="mt-0.5 text-xs text-white/70">{row.phoneNumber}</div>
                      ) : null}
                    </td>
                    <td className={`${tdClass} text-left`}>
                      <span className="line-clamp-2 break-words">{formatService(row?.service)}</span>
                    </td>
                    <td className={`${tdClass} text-left`}>
                      <span
                        className="line-clamp-2 break-words"
                        title={row?.preferredBranchName || row?.preferredFranchiseId || ""}
                      >
                        {row?.preferredBranchName || row?.preferredFranchiseId || "—"}
                      </span>
                    </td>
                    <td className={`${tdClass} text-center`}>
                      {assignedSalesId ? (
                        <AssigneeCell
                          row={row}
                          nestedField={row?.assignedSales ? "assignedSales" : "assignedTo"}
                          accentClass="border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
                        />
                      ) : (
                        <div className="flex min-h-[4.5rem] items-center justify-center">
                          <span className="text-xs text-white/50">Unassigned</span>
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} text-center`}>
                      {assignedCounsellorId ? (
                        <AssigneeCell
                          row={row}
                          nestedField="assignedCounsellor"
                          accentClass="border-[#c9a86c]/40 bg-[#c9a86c]/15 text-[#fde68a]"
                        />
                      ) : (
                        <div className="flex min-h-[4.5rem] items-center justify-center">
                          <span className="text-xs text-white/50">Unassigned</span>
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[15rem] flex-col items-stretch justify-center gap-2">
                        {isFullyAssigned ? (
                          <span className="text-xs font-semibold text-emerald-100">Team assigned</span>
                        ) : autoAssign ? (
                          <span className="text-xs text-white/70">Waiting for auto-assign…</span>
                        ) : (
                          <>
                            <select
                              value={draft.salesId}
                              onChange={(e) =>
                                setTeamDraft(enquiryId, { salesId: e.target.value })
                              }
                              className="w-full rounded-lg border border-white/25 bg-[#133726] px-2 py-2 text-xs text-white outline-none focus:border-[#5eead4]"
                            >
                              <option value="">Select sales</option>
                              {salesTeam.map((member) => (
                                <option key={getUserId(member)} value={getUserId(member)}>
                                  {getUserLabel(member)}
                                </option>
                              ))}
                            </select>
                            <select
                              value={draft.counsellorId}
                              onChange={(e) =>
                                setTeamDraft(enquiryId, { counsellorId: e.target.value })
                              }
                              className="w-full rounded-lg border border-white/25 bg-[#133726] px-2 py-2 text-xs text-white outline-none focus:border-[#5eead4]"
                            >
                              <option value="">Select counsellor</option>
                              {counsellorTeam.map((member) => (
                                <option key={getUserId(member)} value={getUserId(member)}>
                                  {getUserLabel(member)}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={isAssigning}
                              onClick={() => handleAssignTeam(enquiryId)}
                              className={`${rowActionButtonClass} border-[#5eead4]/50 bg-[#5eead4]/15 text-[#a7f3d0] hover:bg-[#5eead4]/25 disabled:opacity-50`}
                            >
                              {isAssigning ? "Assigning…" : "Assign team"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex min-h-[4.5rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(row)}
                          className={`${rowActionButtonClass} border-[#5eead4]/50 bg-[#5eead4]/15 text-[#a7f3d0] hover:bg-[#5eead4]/25`}
                        >
                          View details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-white/80">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}

      {selectedEnquiry ? (
        <EnquiryDetailsDrawer
          enquiryId={getEnquiryId(selectedEnquiry)}
          initialEnquiry={selectedEnquiry}
          accessToken={access_token}
          open={isDrawerVisible}
          onClose={closeDrawer}
          fetchEnquiry={getFranchiseAdminEnquiryById}
        />
      ) : null}
    </section>
  );
};

export default EnquiriesHome;
