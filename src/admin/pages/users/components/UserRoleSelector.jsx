const UserRoleSelector = ({ role, setRole }) => {
  return (
    <div className="mb-6 rounded-xl border border-white/20 bg-white/10 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Create Role</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            role === "admin"
              ? "bg-[#c9a86c]/25 text-[#fde68a] border border-[#c9a86c]/70"
              : "bg-white/10 text-white/80 border border-white/25 hover:bg-white/20",
          ].join(" ")}
        >
          Franchise Admin
        </button>
        <button
          type="button"
          onClick={() => setRole("sales_person")}
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            role === "sales_person"
              ? "bg-[#5eead4]/25 text-[#a7f3d0] border border-[#5eead4]/70"
              : "bg-white/10 text-white/80 border border-white/25 hover:bg-white/20",
          ].join(" ")}
        >
          Sales Person
        </button>
        <button
          type="button"
          onClick={() => setRole("counsellor")}
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            role === "counsellor"
              ? "bg-[#fde68a]/20 text-[#fde68a] border border-[#fde68a]/60"
              : "bg-white/10 text-white/80 border border-white/25 hover:bg-white/20",
          ].join(" ")}
        >
          Counsellor
        </button>
      </div>
    </div>
  );
};

export default UserRoleSelector;
