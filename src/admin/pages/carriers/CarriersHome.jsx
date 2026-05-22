import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAllFranchises } from "../../../api/franchise";
import { createCarrier, getCarriers, updateCarrier } from "../../../api/carriers";
import CarriersStatsCard from "./components/CarriersStatsCard";
import CreateCarrierForm from "./components/CreateCarrierForm";

const initialCarrierForm = {
  name: "",
  description: "",
  franchiseId: "",
  preferredFranchiseId: "",
  assignmentSource: "auto",
  isActive: true,
};

const CarriersHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [showCreateView, setShowCreateView] = useState(false);
  const [carrierForm, setCarrierForm] = useState(initialCarrierForm);
  const [platformWide, setPlatformWide] = useState(false);
  const [editingCarrierId, setEditingCarrierId] = useState("");
  const [carriers, setCarriers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizeList = (response) => {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const normalizeMeta = (response) => {
    const payload = response?.data ?? response;
    const total = Number(payload?.total);
    const limit = Number(payload?.limit);
    return {
      total: Number.isFinite(total) ? total : 0,
      limit: Number.isFinite(limit) && limit > 0 ? limit : pageLimit,
    };
  };

  const getCarrierId = (item) => item?._id || item?.id || "";
  const getFranchiseId = (item) => item?._id || item?.id || "";
  const getFranchiseLabel = (item) =>
    `${item?.name || "Franchise"}${item?.code ? ` (${item.code})` : ""}`;

  const franchiseLabelById = useMemo(() => {
    const map = new Map();
    franchises.forEach((f) => {
      const id = getFranchiseId(f);
      if (id) map.set(id, getFranchiseLabel(f));
    });
    return map;
  }, [franchises]);

  const getScopeLabel = (row) => {
    const fid = row?.franchiseId;
    if (!fid) return "Platform";
    return franchiseLabelById.get(fid) || fid;
  };

  const totalPages = useMemo(() => {
    const limit = pageLimit;
    const total = totalCount || carriers.length;
    return Math.max(1, Math.ceil(total / limit));
  }, [totalCount, carriers.length, pageLimit]);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const response = await getCarriers(access_token, {
        limit: pageLimit,
        skip,
      });
      const list = normalizeList(response);
      const meta = normalizeMeta(response);
      setCarriers(list);
      setTotalCount(meta.total || list.length);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load carriers.");
    } finally {
      setLoading(false);
    }
  };

  const loadFranchises = async () => {
    try {
      const response = await getAllFranchises(access_token);
      const list = normalizeList(response);
      setFranchises(list);
    } catch {
      // optional for dropdowns
    }
  };

  useEffect(() => {
    if (access_token) loadCarriers();
  }, [access_token, currentPage, pageLimit]);

  useEffect(() => {
    if (access_token) loadFranchises();
  }, [access_token]);

  const handleCarrierChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCarrierForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = () => {
    const body = { assignmentSource: "auto" };
    const name = String(carrierForm.name || "").trim();
    const description = String(carrierForm.description || "").trim();
    if (name) body.name = name;
    if (description) body.description = description;
    if (platformWide) {
      body.franchiseId = null;
    } else if (carrierForm.franchiseId) {
      body.franchiseId = carrierForm.franchiseId;
    }
    const pref = String(carrierForm.preferredFranchiseId || "").trim();
    if (pref) body.preferredFranchiseId = pref;
    body.isActive = Boolean(carrierForm.isActive);
    return body;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = buildPayload();
      if (editingCarrierId) {
        await updateCarrier(access_token, editingCarrierId, payload);
        setSuccess("Carrier updated successfully.");
      } else {
        await createCarrier(access_token, payload);
        setSuccess("Carrier created successfully.");
      }
      setCarrierForm(initialCarrierForm);
      setPlatformWide(false);
      setEditingCarrierId("");
      setShowCreateView(false);
      await loadCarriers();
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.response?.data?.error ||
          (editingCarrierId ? "Failed to update carrier." : "Failed to create carrier.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCarrier = (row) => {
    const id = getCarrierId(row);
    if (!id) return;
    setCarrierForm({
      name: row?.name || "",
      description: row?.description || "",
      franchiseId: row?.franchiseId || "",
      preferredFranchiseId: row?.preferredFranchiseId || "",
      assignmentSource: row?.assignmentSource || "auto",
      isActive: row?.isActive !== false,
    });
    setPlatformWide(!row?.franchiseId);
    setEditingCarrierId(id);
    setShowCreateView(true);
    setError("");
    setSuccess("");
  };

  const handleToggleActive = async (row) => {
    const id = getCarrierId(row);
    if (!id) return;
    const isOpen = row?.isActive !== false;
    const nextIsActive = !isOpen;
    try {
      setError("");
      setSuccess("");
      await updateCarrier(access_token, id, { isActive: nextIsActive });
      setSuccess(`Carrier ${nextIsActive ? "opened" : "closed"} successfully.`);
      await loadCarriers();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update carrier position.");
    }
  };

  const rowActionButtonClass =
    "inline-flex h-8 min-w-18 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors";

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Carriers</h1>
            <p className="text-sm text-white/90 md:text-base">
              Manage carriers — platform-wide or scoped to a franchise.
            </p>
          </div>
          {!showCreateView ? (
            <button
              type="button"
              onClick={() => {
                setEditingCarrierId("");
                setCarrierForm(initialCarrierForm);
                setPlatformWide(false);
                setShowCreateView(true);
              }}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 text-sm font-semibold text-[#0f2e1a] hover:opacity-90"
            >
              Add Carrier
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowCreateView(false);
                setEditingCarrierId("");
                setCarrierForm(initialCarrierForm);
                setPlatformWide(false);
              }}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25"
            >
              Back to List
            </button>
          )}
        </div>
      </div>

      <CarriersStatsCard loading={loading} totalCarriers={totalCount} />

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

      {showCreateView ? (
        <div className="max-w-3xl">
          <CreateCarrierForm
            key={editingCarrierId || "new"}
            carrierForm={carrierForm}
            platformWide={platformWide}
            onPlatformWideChange={(checked) => {
              setPlatformWide(checked);
              if (checked) {
                setCarrierForm((prev) => ({ ...prev, franchiseId: "" }));
              }
            }}
            onChange={handleCarrierChange}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            franchises={franchises}
            getFranchiseId={getFranchiseId}
            getFranchiseLabel={getFranchiseLabel}
            title={editingCarrierId ? "Edit Carrier" : "Create Carrier"}
            submitLabel={editingCarrierId ? "Update Carrier" : "Create Carrier"}
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
          <table className="min-w-[720px] w-full table-fixed border-collapse divide-y divide-white/15">
            <thead className="bg-white/20">
              <tr>
                <th className="w-[8%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-white">
                  Sl
                </th>
                <th className="w-[20%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-white">
                  Name
                </th>
                <th className="w-[32%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-white">
                  Description
                </th>
                <th className="w-[18%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-white">
                  Scope
                </th>
                <th className="w-[10%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-white">
                  Active
                </th>
                <th className="w-[12%] px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-white" colSpan={6}>
                    Loading carriers…
                  </td>
                </tr>
              ) : carriers.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-white" colSpan={6}>
                    No carriers found.
                  </td>
                </tr>
              ) : (
                carriers.map((row, index) => (
                  <tr
                    key={getCarrierId(row) || `c-${index}`}
                    className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                  >
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white align-middle">
                      {(currentPage - 1) * pageLimit + index + 1}
                    </td>
                    <td className="min-w-0 border-r border-white/10 px-3 py-4 text-center align-middle text-sm font-medium text-white">
                      <span className="inline-flex max-w-full rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white/95">
                        <span className="truncate">{row?.name || "—"}</span>
                      </span>
                    </td>
                    <td className="min-w-0 border-r border-white/10 px-3 py-4 text-center align-middle text-sm text-white/90">
                      {row?.description ? (
                        <span className="line-clamp-2 block text-left md:text-center" title={row.description}>
                          {row.description}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="min-w-0 border-r border-white/10 px-3 py-4 text-center align-middle text-sm text-white/90">
                      <span className="line-clamp-2 block" title={getScopeLabel(row)}>
                        {getScopeLabel(row)}
                      </span>
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center align-middle text-sm text-white/90">
                      {row?.isActive !== false ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-4 text-center align-middle">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditCarrier(row)}
                          className={`${rowActionButtonClass} border-[#5eead4]/70 bg-[#5eead4]/15 text-[#a7f3d0] hover:bg-[#5eead4]/25`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(row)}
                          className={`${rowActionButtonClass} ${
                            row?.isActive !== false
                              ? "border-amber-300/50 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30"
                              : "border-emerald-300/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                          }`}
                        >
                          {row?.isActive !== false ? "Close" : "Open"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!showCreateView ? (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-white/85 md:flex-row">
          <p>
            Showing page {currentPage} of {totalPages} | Total records: {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CarriersHome;
