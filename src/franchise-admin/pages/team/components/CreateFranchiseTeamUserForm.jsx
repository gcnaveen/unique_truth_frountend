import { MIN_PASSWORD_LENGTH } from "../../../../utils/authConstants";

const CreateFranchiseTeamUserForm = ({
  role,
  userForm,
  onChange,
  onSubmit,
  submitting,
  title,
  submitLabel,
}) => {
  const showTerritory = role === "sales";
  const showSpeciality = role === "counsellor";

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-white/20 bg-white/10 p-5 md:p-6">
      <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
      <p className="mt-1 text-sm text-white/80">
        Users are added to your franchise automatically. Do not set a franchise ID.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          name="name"
          value={userForm.name}
          onChange={onChange}
          placeholder="Name *"
          required
          className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
        />
        <input
          type="email"
          name="email"
          value={userForm.email}
          onChange={onChange}
          placeholder="Email *"
          required
          className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
        />
        <input
          type="password"
          name="password"
          value={userForm.password}
          onChange={onChange}
          placeholder={`Password (optional — min ${MIN_PASSWORD_LENGTH} chars if set; auto-generated if empty)`}
          minLength={MIN_PASSWORD_LENGTH}
          className="md:col-span-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
        />
        {showTerritory ? (
          <input
            name="territory"
            value={userForm.territory}
            onChange={onChange}
            placeholder="Territory (optional for sales)"
            className="md:col-span-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
          />
        ) : null}
        {showSpeciality ? (
          <input
            name="speciality"
            value={userForm.speciality}
            onChange={onChange}
            placeholder="Speciality * (required for counsellor)"
            required
            className="md:col-span-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#5eead4]"
          />
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2 text-sm font-semibold text-[#0f2e1a] hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default CreateFranchiseTeamUserForm;
