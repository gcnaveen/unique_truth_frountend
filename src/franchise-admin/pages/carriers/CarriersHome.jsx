import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  createFranchiseAdminCarrier,
  getFranchiseAdminCarriers,
  patchFranchiseAdminCarrier,
} from "../../../api/franchiseAdmin";

const initialCarrierForm = {
  name: "",
  description: "",
  code: "",
  isActive: true,
};

const normalizePagedItems = (response) => {
  const payload = response?.data ?? response ?? {};
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];
  const total = Number(payload?.total);
  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
  };
};

const CarriersHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [showCreateView, setShowCreateView] = useState(false);
  const [carrierForm, setCarrierForm] = useState(initialCarrierForm);
  const [carriers, setCarriers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalCount || carriers.length) / pageLimit)),
    [totalCount, carriers.length, pageLimit],
  );

  const getCarrierId = (row) => row?._id || row?.id || "";

  const loadCarriers = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const response = await getFranchiseAdminCarriers(access_token, {
        limit: pageLimit,
        skip,
      });
      const { items, total } = normalizePagedItems(response);
      setCarriers(items);
      setTotalCount(total);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load carriers.");
      setCarriers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access_token) loadCarriers();
  }, [access_token, currentPage, pageLimit]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCarrierForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = carrierForm.name.trim();
    if (!name) {
      setError("Carrier name is required.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = {
        name,
        isActive: Boolean(carrierForm.isActive),
      };
      const description = carrierForm.description.trim();
      const code = carrierForm.code.trim();
      if (description) payload.description = description;
      if (code) payload.code = code;

      await createFranchiseAdminCarrier(access_token, payload);
      setSuccess("Carrier created for your franchise.");
      setCarrierForm(initialCarrierForm);
      setShowCreateView(false);
      setCurrentPage(1);
      await loadCarriers();
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.response?.data?.error ||
          "Failed to create carrier.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (row) => {
    const id = getCarrierId(row);
    if (!id) return;
    const nextIsActive = row?.isActive === false;
    try {
      setError("");
      setSuccess("");
      await patchFranchiseAdminCarrier(access_token, id, { isActive: nextIsActive });
      setSuccess(`Carrier position ${nextIsActive ? "opened" : "closed"}.`);
      await loadCarriers();
    } catch (toggleError) {
      setError(toggleError?.response?.data?.message || "Failed to update carrier.");
    }
  };

  const rowActionButtonClass =
    "inline-flex h-8 min-w-18 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors";

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Carriers</h1>
          <p className="text-sm text-white/90 md:text-base">
            Create and manage carrier positions for your franchise. Close a position to hide it from default lists.
          </p>
        </div>
        {!showCreateView ? (
          <button
            type="button"
            onClick={() => setShowCreateView(true)}
            className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 text-sm font-semibold text-[#0f2e1a] hover:opacity-90"
          >
            Add Carrier
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowCreateView(false);
              setCarrierForm(initialCarrierForm);
            }}
            className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25"
          >
            Back to List
          </button>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-white/20 bg-white/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Your franchise</p>
        <p className="mt-1 text-2xl font-semibold text-white">{loading ? "…" : totalCount}</p>
        <p className="text-sm text-white/80">Carrier positions</p>
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

      {showCreateView ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl rounded-xl border border-white/20 bg-white/10 p-5 md:p-6"
        >
          <h2 className="text-lg font-semibold text-white">Create carrier</h2>
          <p className="mt-1 text-sm text-white/80">Scoped automatically to your franchise.</p>
          <div className="mt-4 grid gap-3">
            <input
              name="name"
              value={carrierForm.name}
              onChange={handleChange}
              placeholder="Name *"
              required
              className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
            />
            <input
              name="code"
              value={carrierForm.code}
              onChange={handleChange}
              placeholder="Code (optional, unique in franchise)"
              className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
            />
            <textarea
              name="description"
              value={carrierForm.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description"
              className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
            />
            <label className="flex items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                name="isActive"
                checked={carrierForm.isActive}
                onChange={handleChange}
                className="rounded border-white/30"
              />
              Open position (active)
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2 text-sm font-semibold text-[#0f2e1a] hover:opacity-90 disabled:opacity-70"
          >
            {submitting ? "Creating…" : "Create carrier"}
          </button>
        </form>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
          <table className="min-w-[720px] w-full table-fixed border-collapse divide-y divide-white/15">
            <thead className="bg-white/20">
              <tr>
                <th className="w-[8%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  #
                </th>
                <th className="w-[22%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Name
                </th>
                <th className="w-[14%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Code
                </th>
                <th className="w-[32%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Description
                </th>
                <th className="w-[10%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
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
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-white">
                    Loading carriers…
                  </td>
                </tr>
              ) : carriers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-white">
                    No carriers yet. Add one for your franchise.
                  </td>
                </tr>
              ) : (
                carriers.map((row, index) => {
                  const isOpen = row?.isActive !== false;
                  return (
                    <tr
                      key={getCarrierId(row) || `c-${index}`}
                      className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                    >
                      <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white">
                        {(currentPage - 1) * pageLimit + index + 1}
                      </td>
                      <td className="border-r border-white/10 px-3 py-4 text-center text-sm font-medium text-white">
                        {row?.name || "—"}
                      </td>
                      <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                        {row?.code || "—"}
                      </td>
                      <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                        <span className="line-clamp-2">{row?.description || "—"}</span>
                      </td>
                      <td className="border-r border-white/10 px-3 py-4 text-center text-sm">
                        <span
                          className={
                            isOpen
                              ? "text-[#a7f3d0]"
                              : "text-white/60"
                          }
                        >
                          {isOpen ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(row)}
                          className={`${rowActionButtonClass} ${
                            isOpen
                              ? "border-red-300/40 bg-red-500/15 text-red-100 hover:bg-red-500/25"
                              : "border-[#5eead4]/50 bg-[#5eead4]/15 text-[#a7f3d0] hover:bg-[#5eead4]/25"
                          }`}
                        >
                          {isOpen ? "Close" : "Open"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {!showCreateView && totalPages > 1 ? (
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

export default CarriersHome;
