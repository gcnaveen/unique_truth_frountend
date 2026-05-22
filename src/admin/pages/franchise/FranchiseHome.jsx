import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  createFranchise,
  deleteFranchise,
  getFranchiseById,
  getFranchises,
  updateFranchise,
} from "../../../api/franchise";
import CreateFranchiseForm from "./components/CreateFranchiseForm";
import FranchiseStatsCard from "./components/FranchiseStatsCard";

const initialFranchiseForm = {
  name: "",
  city: "",
  state: "",
  address: "",
  pincode: "",
  latitude: "",
  longitude: "",
};

const FranchiseHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [showCreateView, setShowCreateView] = useState(false);
  const [franchiseForm, setFranchiseForm] = useState(initialFranchiseForm);
  const [franchises, setFranchises] = useState([]);
  const [editingFranchiseId, setEditingFranchiseId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);
  const [totalFranchiseCount, setTotalFranchiseCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreatingFranchise, setIsCreatingFranchise] = useState(false);

  const normalizeList = (response) => {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };
  const normalizeMeta = (response) => {
    const payload = response?.data ?? response;
    const total = Number(payload?.total);
    const page = Number(payload?.page);
    const limit = Number(payload?.limit);
    const pages = Number(payload?.totalPages);
    return {
      total: Number.isFinite(total) ? total : 0,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : pageLimit,
      totalPages: Number.isFinite(pages) && pages > 0 ? pages : 1,
    };
  };

  const getFranchiseId = (item) => item?._id || item?.id || "";
  const getFranchiseLabel = (item) =>
    `${item?.name || "Franchise"}${item?.code ? ` (${item.code})` : ""}`;
  const getFranchiseAdminName = (item) =>
    item?.franchiseAdmin?.name ||
    item?.franchiseAdmin?.email ||
    item?.admin?.name ||
    item?.admin?.email ||
    item?.adminName ||
    item?.adminEmail ||
    "-";
  const getFranchiseAddress = (item) => item?.address || "-";
  const rowActionButtonClass =
    "inline-flex h-8 min-w-18 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors";

  const mapFranchiseToForm = (item) => ({
    name: item?.name || "",
    city: item?.city || "",
    state: item?.state || "",
    address: item?.address || "",
    pincode: item?.pincode || "",
    latitude: item?.latitude ?? "",
    longitude: item?.longitude ?? "",
  });

  const loadFranchises = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getFranchises(access_token, {
        page: currentPage,
        limit: pageLimit,
      });
      const list = normalizeList(response);
      const meta = normalizeMeta(response);
      setFranchises(list);
      setTotalFranchiseCount(meta.total || list.length);
      setTotalPages(meta.totalPages);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load franchises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access_token) loadFranchises();
  }, [access_token, currentPage, pageLimit]);

  const totalFranchise = useMemo(
    () => totalFranchiseCount || franchises.length,
    [totalFranchiseCount, franchises.length]
  );

  const handleFranchiseChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFranchiseForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toNumberOrZero = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed !== 0 ? parsed : 0;
  };

  const handleCreateFranchise = async (event) => {
    event.preventDefault();

    const payload = {
      ...franchiseForm,
      latitude:  toNumberOrZero(franchiseForm.latitude),
      longitude: toNumberOrZero(franchiseForm.longitude),
    };

    console.log("📦 Submitting franchise payload:", payload);

    try {
      setIsCreatingFranchise(true);
      setError("");
      setSuccess("");
      if (editingFranchiseId) {
        await updateFranchise(access_token, editingFranchiseId, payload);
        setSuccess("Franchise updated successfully.");
      } else {
        await createFranchise(access_token, payload);
        setSuccess("Franchise created successfully.");
      }
      setFranchiseForm(initialFranchiseForm);
      setEditingFranchiseId("");
      await loadFranchises();
      setShowCreateView(false);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          (editingFranchiseId ? "Failed to update franchise." : "Failed to create franchise.")
      );
    } finally {
      setIsCreatingFranchise(false);
    }
  };

  const handleEditFranchise = async (franchiseId) => {
    if (!franchiseId) return;
    try {
      setError("");
      setSuccess("");
      const response = await getFranchiseById(access_token, franchiseId);
      const item = response?.data ?? response;
      setFranchiseForm(mapFranchiseToForm(item));
      setEditingFranchiseId(franchiseId);
      setShowCreateView(true);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load franchise details.");
    }
  };

  const handleDeleteFranchise = async (franchiseId) => {
    if (!franchiseId) return;
    const isConfirmed = window.confirm("Are you sure you want to delete this franchise?");
    if (!isConfirmed) return;
    try {
      setError("");
      setSuccess("");
      await deleteFranchise(access_token, franchiseId);
      setSuccess("Franchise deleted successfully.");
      if (editingFranchiseId === franchiseId) {
        setEditingFranchiseId("");
        setFranchiseForm(initialFranchiseForm);
      }
      if (franchises.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await loadFranchises();
      }
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || "Failed to delete franchise.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Franchise
            </h1>
            <p className="text-sm text-white/90 md:text-base">
              Create new franchises and assign their franchise admin users.
            </p>
          </div>
          {!showCreateView ? (
            <button
              type="button"
              onClick={() => setShowCreateView(true)}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 text-sm font-semibold text-[#0f2e1a] hover:opacity-90"
            >
              Add Franchise
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowCreateView(false);
                setEditingFranchiseId("");
                setFranchiseForm(initialFranchiseForm);
              }}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25"
            >
              Back to List
            </button>
          )}
        </div>
      </div>

      <FranchiseStatsCard loading={loading} totalFranchise={totalFranchise} />

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
          <CreateFranchiseForm
            key={`${success}-${editingFranchiseId || "create"}`}
            franchiseForm={franchiseForm}
            onChange={handleFranchiseChange}
            onSubmit={handleCreateFranchise}
            onPlaceSelect={(placeData) => {
              console.log("🏠 onPlaceSelect received:", placeData);
              setFranchiseForm((prev) => ({ ...prev, ...placeData }));
            }}
            isCreating={isCreatingFranchise}
            title={editingFranchiseId ? "Edit Franchise" : "Create Franchise"}
            submitLabel={editingFranchiseId ? "Update Franchise" : "Create Franchise"}
          />
        </div>
      ) : (
<div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
  <table className="min-w-full table-fixed divide-y divide-white/15">
    
    {/* ================= HEADER ================= */}
    <thead className="bg-white/20">
      <tr>
        <th className="w-[8%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
          Sl No
        </th>
        <th className="w-[24%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
          Franchise
        </th>
        <th className="w-[23%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
          Franchise Admin
        </th>
        <th className="w-[30%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
          Address
        </th>
        <th className="w-[15%] px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
          Action
        </th>
      </tr>
    </thead>

    {/* ================= BODY ================= */}
    <tbody className="divide-y divide-white/10">
      
      {/* LOADING */}
      {loading ? (
        <tr>
          <td className="px-4 py-8 text-sm text-white md:px-5" colSpan={5}>
            Loading franchises...
          </td>
        </tr>
      ) : franchises.length === 0 ? (

        /* EMPTY */
        <tr>
          <td className="px-4 py-8 text-sm text-white md:px-5" colSpan={5}>
            No franchises found.
          </td>
        </tr>

      ) : (

        /* DATA ROWS */
        franchises.map((franchise, index) => (
          <tr
            key={getFranchiseId(franchise) || franchise?.code || franchise?.name}
            className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
          >
            
            {/* ✅ SERIAL NUMBER */}
            <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white md:px-5">
              {(currentPage - 1) * pageLimit + index + 1}
            </td>

            {/* FRANCHISE */}
            <td className="border-r border-white/10 px-4 py-4 text-center text-sm font-medium text-white md:px-5">
              <span className="inline-flex rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/95">
                {getFranchiseLabel(franchise)}
              </span>
            </td>

            {/* ADMIN */}
            <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white/90 md:px-5">
              {getFranchiseAdminName(franchise)}
            </td>

            {/* ADDRESS */}
            <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white/90 md:px-5">
              {getFranchiseAddress(franchise)}
            </td>

            {/* ACTION */}
            <td className="px-4 py-4 text-center md:px-5">
              <div className="flex flex-wrap justify-center gap-2">
                
                <button
                  type="button"
                  onClick={() => handleEditFranchise(getFranchiseId(franchise))}
                  className={`${rowActionButtonClass} border-[#5eead4]/70 bg-[#5eead4]/15 text-[#a7f3d0] hover:bg-[#5eead4]/25`}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteFranchise(getFranchiseId(franchise))}
                  className={`${rowActionButtonClass} border-red-300/40 bg-red-500/20 text-red-100 hover:bg-red-500/30`}
                >
                  Delete
                </button>

              </div>
            </td>

          </tr>
        ))
      )}
    </tbody>
  </table>
</div>      )}
      {!showCreateView ? (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-white/85 md:flex-row">
          <p>
            Showing page {currentPage} of {Math.max(totalPages, 1)} | Total records:{" "}
            {totalFranchise}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || loading}
              className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1))
              }
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

export default FranchiseHome;