import { useMemo, useState } from "react";

const CreateFranchiseAdminForm = ({
  adminForm,
  franchises,
  getFranchiseId,
  getFranchiseLabel,
  onChange,
  onSubmit,
  isCreating,
}) => {
  const [franchiseQuery, setFranchiseQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const franchiseOptions = useMemo(
    () =>
      franchises.map((item) => ({
        id: getFranchiseId(item),
        label: getFranchiseLabel(item),
      })),
    [franchises, getFranchiseId, getFranchiseLabel]
  );

  const selectedFranchiseLabel = useMemo(
    () =>
      franchiseOptions.find((option) => option.id === adminForm.franchiseId)?.label || "",
    [adminForm.franchiseId, franchiseOptions]
  );

  const visibleFranchiseOptions = useMemo(() => {
    const query = franchiseQuery.trim().toLowerCase();
    if (!query) return franchiseOptions;
    return franchiseOptions.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [franchiseOptions, franchiseQuery]);

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-white/20 bg-white/10 p-5 md:p-6">
      <h2 className="text-lg font-semibold text-white md:text-xl">Create Franchise Admin</h2>
      <p className="mt-1 text-sm text-white/80">Create the admin account for a franchise.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          name="name"
          value={adminForm.name}
          onChange={onChange}
          placeholder="Name"
          className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
        />
        <input
          type="email"
          name="email"
          value={adminForm.email}
          onChange={onChange}
          placeholder="Email"
          className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
        />
        <input
          type="password"
          name="password"
          value={adminForm.password}
          onChange={onChange}
          placeholder="Password"
          className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
        />
        <div className="relative md:col-span-2">
          <input
            value={franchiseQuery || selectedFranchiseLabel}
            onChange={(event) => {
              const value = event.target.value;
              setFranchiseQuery(value);
              if (!value.trim()) {
                onChange({ target: { name: "franchiseId", value: "" } });
              }
            }}
            onFocus={() => {
              setIsDropdownOpen(true);
              setFranchiseQuery((prev) => prev || selectedFranchiseLabel);
            }}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 120)}
            placeholder="Select Franchise"
            className="w-full rounded-lg border border-white/25 bg-[#133726] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
          />
          {isDropdownOpen ? (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/20 bg-[#0f2e1a] shadow-lg">
              {visibleFranchiseOptions.length === 0 ? (
                <button
                  type="button"
                  className="w-full cursor-default px-3 py-2 text-left text-sm text-white/70"
                >
                  No matching franchise found
                </button>
              ) : (
                visibleFranchiseOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onMouseDown={() => {
                      setFranchiseQuery("");
                      onChange({ target: { name: "franchiseId", value: option.id } });
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 ${
                      option.id === adminForm.franchiseId ? "text-[#5eead4]" : "text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className="mt-4 rounded-xl border border-[#5eead4]/70 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/25"
      >
        {isCreating ? "Creating..." : "Create Franchise Admin"}
      </button>
    </form>
  );
};

export default CreateFranchiseAdminForm;
