const ROLES = [
  { id: "sales", label: "Sales" },
  { id: "counsellor", label: "Counsellor" },
  { id: "operation_team", label: "Operation team" },
  { id: "user", label: "User" },
];

const FranchiseTeamRoleSelector = ({ role, setRole }) => (
  <div className="mb-6 rounded-xl border border-white/20 bg-white/10 p-4 md:p-5">
    <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Role</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {ROLES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setRole(id)}
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border",
            role === id
              ? "bg-[#5eead4]/25 text-[#a7f3d0] border-[#5eead4]/70"
              : "bg-white/10 text-white/80 border-white/25 hover:bg-white/20",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default FranchiseTeamRoleSelector;
