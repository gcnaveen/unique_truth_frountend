import { useMemo, useState } from "react";

const FranchiseCombo = ({ label, value, onSelect, franchises, getFranchiseId, getFranchiseLabel }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () =>
      franchises.map((item) => ({
        id: getFranchiseId(item),
        label: getFranchiseLabel(item),
      })),
    [franchises, getFranchiseId, getFranchiseLabel]
  );

  const selectedLabel = useMemo(
    () => options.find((o) => o.id === value)?.label || "",
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-white/70">{label}</label>
      <div className="relative">
        <input
          value={query || selectedLabel}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            if (!v.trim()) onSelect("");
          }}
          onFocus={() => {
            setOpen(true);
            setQuery((prev) => prev || selectedLabel);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search or leave empty…"
          className="w-full rounded-lg border border-white/25 bg-[#133726] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
        />
        {open ? (
          <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-white/20 bg-[#0f2e1a] shadow-lg">
            <button
              type="button"
              onMouseDown={() => {
                onSelect("");
                setQuery("");
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
            >
              Clear selection
            </button>
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onMouseDown={() => {
                  onSelect(o.id);
                  setQuery("");
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 ${
                  o.id === value ? "text-[#5eead4]" : "text-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const CreateCarrierForm = ({
  carrierForm,
  platformWide,
  onPlatformWideChange,
  onChange,
  onSubmit,
  isSubmitting,
  franchises,
  getFranchiseId,
  getFranchiseLabel,
  title,
  submitLabel,
}) => {
  const setFranchiseId = (id) => {
    onChange({ target: { name: "franchiseId", value: id } });
  };
  const setPreferredFranchiseId = (id) => {
    onChange({ target: { name: "preferredFranchiseId", value: id } });
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-white/20 bg-white/10 p-5 md:p-6">
      <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
      <p className="mt-1 text-sm text-white/80">
        All fields are optional. Use platform-wide for a carrier visible to every franchise.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-white/70">Name</label>
          <input
            name="name"
            value={carrierForm.name}
            onChange={onChange}
            placeholder="Carrier name"
            className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-white/70">Description</label>
          <textarea
            name="description"
            value={carrierForm.description}
            onChange={onChange}
            rows={3}
            placeholder="Description"
            className="resize-y rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
          />
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white md:col-span-2">
          <input
            type="checkbox"
            checked={platformWide}
            onChange={(e) => onPlatformWideChange(e.target.checked)}
            className="h-4 w-4 accent-[#5eead4]"
          />
          Platform-wide (visible to all franchises — no franchise scope)
        </label>
        {!platformWide ? (
          <div className="md:col-span-2">
            <FranchiseCombo
              label="Select Franchise"
              value={carrierForm.franchiseId}
              onSelect={setFranchiseId}
              franchises={franchises}
              getFranchiseId={getFranchiseId}
              getFranchiseLabel={getFranchiseLabel}
            />
          </div>
        ) : null}
        <div className="md:col-span-2">
          <FranchiseCombo
            label="Preferred franchise (optional)"
            value={carrierForm.preferredFranchiseId}
            onSelect={setPreferredFranchiseId}
            franchises={franchises}
            getFranchiseId={getFranchiseId}
            getFranchiseLabel={getFranchiseLabel}
          />
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white md:col-span-2">
          <input
            type="checkbox"
            name="isActive"
            checked={carrierForm.isActive}
            onChange={onChange}
            className="h-4 w-4 accent-[#5eead4]"
          />
          Position open (active)
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2.5 text-sm font-semibold text-[#0f2e1a] hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
};

export default CreateCarrierForm;
