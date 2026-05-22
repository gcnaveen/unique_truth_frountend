import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  assignFranchiseAdminEnquiry,
  getFranchiseAdminTeam,
  getFranchiseAdminUnassignedEnquiries,
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

const formatService = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

const EnquiriesHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [enquiries, setEnquiries] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState("");
  const [salesByEnquiry, setSalesByEnquiry] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalCount || enquiries.length) / pageLimit)),
    [totalCount, enquiries.length, pageLimit],
  );

  const getEnquiryId = (row) => row?._id || row?.id || "";
  const getUserId = (row) => row?._id || row?.id || "";
  const getUserLabel = (row) =>
    row?.name ? `${row.name}${row.email ? ` (${row.email})` : ""}` : row?.email || "—";

  const loadSalesTeam = async () => {
    try {
      const response = await getFranchiseAdminTeam(access_token, {
        role: "sales",
        limit: 100,
        skip: 0,
      });
      const { items } = normalizePagedItems(response);
      setSalesTeam(items);
    } catch {
      setSalesTeam([]);
    }
  };

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const response = await getFranchiseAdminUnassignedEnquiries(access_token, {
        limit: pageLimit,
        skip,
      });
      const { items, total } = normalizePagedItems(response);
      setEnquiries(items);
      setTotalCount(total);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load unassigned enquiries.");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!access_token) return;
    loadSalesTeam();
  }, [access_token]);

  useEffect(() => {
    if (!access_token) return;
    loadEnquiries();
  }, [access_token, currentPage, pageLimit]);

  const handleAssign = async (enquiryId) => {
    if (!enquiryId) return;
    const salesId = salesByEnquiry[enquiryId] || "";
    try {
      setAssigningId(enquiryId);
      setError("");
      setSuccess("");
      const body = salesId ? { salesId } : {};
      await assignFranchiseAdminEnquiry(access_token, enquiryId, body);
      setSuccess(
        salesId
          ? "Enquiry assigned to the selected sales person."
          : "Enquiry auto-assigned to the least-loaded sales person in your branch.",
      );
      setSalesByEnquiry((prev) => {
        const next = { ...prev };
        delete next[enquiryId];
        return next;
      });
      await loadEnquiries();
    } catch (assignError) {
      setError(assignError?.response?.data?.message || "Failed to assign enquiry.");
    } finally {
      setAssigningId("");
    }
  };

  const rowActionButtonClass =
    "inline-flex h-8 min-w-18 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors";

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Enquiries</h1>
        <p className="text-sm text-white/90 md:text-base">
          Unassigned enquiries for your branch. Assign to a sales person or use auto-assign.
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-white/20 bg-white/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Queue</p>
        <p className="mt-1 text-2xl font-semibold text-white">{loading ? "…" : totalCount}</p>
        <p className="text-sm text-white/80">Unassigned in your franchise</p>
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
        <table className="min-w-[900px] w-full table-fixed border-collapse divide-y divide-white/15">
          <thead className="bg-white/20">
            <tr>
              <th className="w-[5%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                #
              </th>
              <th className="w-[14%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                Name
              </th>
              <th className="w-[16%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                Contact
              </th>
              <th className="w-[14%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                Service
              </th>
              <th className="w-[16%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                Preferred branch
              </th>
              <th className="w-[20%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                Assign to sales
              </th>
              <th className="w-[15%] px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-white">
                  Loading enquiries…
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-white">
                  No unassigned enquiries right now.
                </td>
              </tr>
            ) : (
              enquiries.map((row, index) => {
                const enquiryId = getEnquiryId(row);
                const isAssigning = assigningId === enquiryId;
                return (
                  <tr
                    key={enquiryId || `e-${index}`}
                    className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                  >
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white">
                      {(currentPage - 1) * pageLimit + index + 1}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white">
                      {row?.name || "—"}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      <div>{row?.email || "—"}</div>
                      <div className="text-xs text-white/70">{row?.phoneNumber || ""}</div>
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      {formatService(row?.service)}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      {row?.preferredBranchName || row?.preferredFranchiseId || "—"}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center align-middle">
                      <select
                        value={salesByEnquiry[enquiryId] ?? ""}
                        onChange={(e) =>
                          setSalesByEnquiry((prev) => ({
                            ...prev,
                            [enquiryId]: e.target.value,
                          }))
                        }
                        className="w-full max-w-[200px] rounded-lg border border-white/25 bg-[#133726] px-2 py-2 text-xs text-white outline-none focus:border-[#5eead4]"
                      >
                        <option value="">Auto (least loaded)</option>
                        {salesTeam.map((member) => (
                          <option key={getUserId(member)} value={getUserId(member)}>
                            {getUserLabel(member)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4 text-center align-middle">
                      <button
                        type="button"
                        disabled={isAssigning}
                        onClick={() => handleAssign(enquiryId)}
                        className={`${rowActionButtonClass} border-[#5eead4]/50 bg-[#5eead4]/15 text-[#a7f3d0] hover:bg-[#5eead4]/25 disabled:opacity-50`}
                      >
                        {isAssigning ? "Assigning…" : "Assign"}
                      </button>
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
    </section>
  );
};

export default EnquiriesHome;
