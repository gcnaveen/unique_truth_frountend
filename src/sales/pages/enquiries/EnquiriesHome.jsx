import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getSalesDashboardSummary, getSalesEnquiries } from "../../../api/sales";
import SalesEnquiryDrawer from "./components/SalesEnquiryDrawer";

const STATUS_TABS = [
  { id: "", label: "All active" },
  { id: "new", label: "New" },
  { id: "in_progress", label: "In progress" },
  { id: "converted", label: "Converted" },
  { id: "closed", label: "Closed" },
];

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
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
  };
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatService = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

const formatStatus = (value) =>
  String(value || "new")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const statusBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "converted") return "bg-[#c9a86c]/25 text-[#fde68a] border-[#c9a86c]/50";
  if (s === "in_progress") return "bg-[#5eead4]/20 text-[#a7f3d0] border-[#5eead4]/50";
  if (s === "closed") return "bg-white/10 text-white/60 border-white/25";
  return "bg-white/15 text-white border-white/30";
};

const EnquiriesHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [statusFilter, setStatusFilter] = useState("");
  const [enquiries, setEnquiries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalCount || enquiries.length) / pageLimit)),
    [totalCount, enquiries.length, pageLimit],
  );

  const getEnquiryId = (row) => row?._id || row?.id || "";

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await getSalesDashboardSummary(access_token);
      setSummary(response?.data ?? response);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const params = { limit: pageLimit, skip };
      if (statusFilter === "closed") {
        params.status = "closed";
        params.includeClosed = "true";
      } else if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await getSalesEnquiries(access_token, params);
      const { items, total } = normalizePagedItems(response);
      setEnquiries(items);
      setTotalCount(total);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load enquiries.");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!access_token) return;
    loadSummary();
  }, [access_token]);

  useEffect(() => {
    if (!access_token) return;
    loadEnquiries();
  }, [access_token, currentPage, pageLimit, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const openDrawer = (row) => {
    const id = getEnquiryId(row);
    if (!id) return;
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedId(""), 300);
  };

  const countByStatus = (key) => {
    const map = summary?.byStatus ?? {};
    return Number(map[key] ?? map[key === "in_progress" ? "inProgress" : key] ?? 0);
  };

  return (
    <>
      <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Sales dashboard
          </h1>
          <p className="mt-1 text-sm text-white/90 md:text-base">
            View assigned enquiries, follow up, and update status (converted or closed).
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: "new", label: "New" },
            { key: "in_progress", label: "In progress" },
            { key: "converted", label: "Converted" },
            { key: "closed", label: "Closed" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="rounded-xl border border-white/20 bg-white/10 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {summaryLoading ? "…" : countByStatus(key)}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border",
                statusFilter === tab.id
                  ? "border-[#5eead4]/70 bg-[#5eead4]/20 text-[#a7f3d0]"
                  : "border-white/25 bg-white/10 text-white/80 hover:bg-white/15",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm text-white">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
          <table className="min-w-[800px] w-full table-fixed border-collapse divide-y divide-white/15">
            <thead className="bg-white/20">
              <tr>
                <th className="w-[6%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  #
                </th>
                <th className="w-[16%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Name
                </th>
                <th className="w-[22%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Contact
                </th>
                <th className="w-[18%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Query
                </th>
                <th className="w-[12%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Date
                </th>
                <th className="w-[12%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Status
                </th>
                <th className="w-[14%] px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
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
                    No enquiries in this view.
                  </td>
                </tr>
              ) : (
                enquiries.map((row, index) => (
                  <tr
                    key={getEnquiryId(row) || `e-${index}`}
                    className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                  >
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white">
                      {(currentPage - 1) * pageLimit + index + 1}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm font-medium text-white">
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
                      {formatDateTime(row?.createdAt)}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center align-middle">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(row?.status)}`}
                      >
                        {formatStatus(row?.status)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => openDrawer(row)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 text-xs font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/25"
                      >
                        View / follow up
                      </button>
                    </td>
                  </tr>
                ))
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

      <SalesEnquiryDrawer
        enquiryId={selectedId}
        accessToken={access_token}
        open={drawerOpen}
        onClose={closeDrawer}
        onUpdated={() => {
          loadEnquiries();
          loadSummary();
        }}
      />
    </>
  );
};

export default EnquiriesHome;
