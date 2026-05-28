import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  createFranchiseAdminUser,
  getFranchiseAdminTeam,
} from "../../../api/franchiseAdmin";
import { getCounselingLevels } from "../../../api/publicPortal";
import CreateFranchiseTeamUserForm from "./components/CreateFranchiseTeamUserForm";
import FranchiseTeamRoleSelector from "./components/FranchiseTeamRoleSelector";
import TeamStatsCard from "./components/TeamStatsCard";
import {
  MIN_PASSWORD_LENGTH,
  normalizeLoginEmail,
  validatePasswordForApi,
} from "../../../utils/authConstants";
import { COUNSELING_LEVEL_META, getCounselingLevelLabel } from "../../../portal/utils/format";

const initialUserForm = {
  email: "",
  name: "",
  password: "",
  territory: "",
  speciality: "",
  counselingLevel: "",
};

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "sales", label: "Sales" },
  { value: "counsellor", label: "Counsellor" },
  { value: "operation_team", label: "Operation team" },
  { value: "user", label: "User" },
];

const normalizeCounselingLevels = (response) => {
  const payload = response?.data ?? response ?? {};
  const raw = payload?.levels ?? payload?.items ?? payload;

  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        typeof item === "string"
          ? { id: item, label: getCounselingLevelLabel(item) }
          : {
              id: item?.id || item?.value || item?.level,
              label: item?.label || getCounselingLevelLabel(item?.id || item?.value || item?.level),
            },
      )
      .filter((item) => item.id);
  }

  return Object.keys(COUNSELING_LEVEL_META).map((id) => ({
    id,
    label: COUNSELING_LEVEL_META[id].label,
  }));
};

const getRoleLabel = (role) => {
  const map = {
    sales: "Sales",
    counsellor: "Counsellor",
    operation_team: "Operation team",
    user: "User",
  };
  return map[String(role || "").toLowerCase()] || role || "-";
};

const TeamHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [showCreateView, setShowCreateView] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [role, setRole] = useState("sales");
  const [roleFilter, setRoleFilter] = useState("");
  const [team, setTeam] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [counselingLevels, setCounselingLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const buildInitialUserForm = () => ({
    ...initialUserForm,
    counselingLevel: counselingLevels[0]?.id || "",
  });

  const getUserId = (item) => item?._id || item?.id || "";

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const params = { limit: pageLimit, skip };
      if (roleFilter) params.role = roleFilter;

      const response = await getFranchiseAdminTeam(access_token, params);
      const payload = response?.data ?? response;
      const items = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];
      const total = Number(payload?.total);
      const limit = Number(payload?.limit) || pageLimit;

      setTeam(items);
      setTotalUsers(Number.isFinite(total) ? total : items.length);
      setTotalPages(
        Number.isFinite(total) && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1,
      );
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access_token) loadTeam();
  }, [access_token, currentPage, pageLimit, roleFilter]);

  useEffect(() => {
    const loadCounselingLevels = async () => {
      try {
        setLoadingLevels(true);
        const response = await getCounselingLevels();
        const normalized = normalizeCounselingLevels(response);
        setCounselingLevels(normalized);
        setUserForm((prev) => ({
          ...prev,
          counselingLevel:
            prev.counselingLevel || normalized[0]?.id || prev.counselingLevel,
        }));
      } catch {
        const fallback = normalizeCounselingLevels(null);
        setCounselingLevels(fallback);
        setUserForm((prev) => ({
          ...prev,
          counselingLevel: prev.counselingLevel || fallback[0]?.id || "",
        }));
      } finally {
        setLoadingLevels(false);
      }
    };

    loadCounselingLevels();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (role === "counsellor" && !userForm.speciality?.trim()) {
      setError("Speciality is required for counsellor role.");
      return;
    }
    if (role === "counsellor" && !userForm.counselingLevel) {
      setError("Counseling level is required for counsellor role.");
      return;
    }

    const pwd = userForm.password?.trim() || "";
    if (pwd) {
      const pwdError = validatePasswordForApi(pwd);
      if (pwdError) {
        setError(pwdError);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        email: normalizeLoginEmail(userForm.email),
        name: userForm.name.trim(),
        role,
      };
      if (role === "sales" && userForm.territory?.trim()) {
        payload.territory = userForm.territory.trim();
      }
      if (role === "counsellor") {
        payload.speciality = userForm.speciality.trim();
        payload.counselingLevel = userForm.counselingLevel;
      }
      if (userForm.password?.trim()) {
        payload.password = userForm.password.trim();
      }

      const response = await createFranchiseAdminUser(access_token, payload);
      const created = response?.data ?? response;
      const initialPassword =
        created?.initialPassword ?? response?.initialPassword ?? null;

      let successMsg = `${getRoleLabel(role)} added successfully.`;
      if (initialPassword) {
        successMsg += ` Initial password: ${initialPassword}`;
      }
      setSuccess(successMsg);

      setUserForm(buildInitialUserForm());
      setRole("sales");
      setShowCreateView(false);
      setCurrentPage(1);
      await loadTeam();
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.response?.data?.error ||
          "Failed to add team member.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Team</h1>
            <p className="text-sm text-white/90 md:text-base">
              Manage users in your franchise — sales and counsellors.
            </p>
          </div>
          {!showCreateView ? (
            <button
              type="button"
              onClick={() => setShowCreateView(true)}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 text-sm font-semibold text-[#0f2e1a] hover:opacity-90"
            >
              Add team member
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowCreateView(false);
                setUserForm(buildInitialUserForm());
                setError("");
              }}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25"
            >
              Back to list
            </button>
          )}
        </div>
      </div>

      <TeamStatsCard loading={loading} totalUsers={totalUsers} />

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
        <div className="space-y-6">
          <FranchiseTeamRoleSelector role={role} setRole={setRole} />
          <CreateFranchiseTeamUserForm
            role={role}
            userForm={userForm}
            levels={counselingLevels}
            loadingLevels={loadingLevels}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            title={`Add ${getRoleLabel(role)}`}
            submitLabel={`Add ${getRoleLabel(role)}`}
          />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Filter by role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-white/25 bg-[#133726] px-3 py-2 text-sm text-white outline-none focus:border-[#5eead4]"
            >
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
            <table className="min-w-full table-fixed divide-y divide-white/15">
              <thead className="bg-white/20">
                <tr>
                  <th className="w-[8%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                    #
                  </th>
                  <th className="w-[22%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                    Name
                  </th>
                  <th className="w-[28%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                    Email
                  </th>
                  <th className="w-[14%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                    Role
                  </th>
                  <th className="w-[14%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                    Territory
                  </th>
                  <th className="w-[14%] px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                    Speciality
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-white">
                      Loading team…
                    </td>
                  </tr>
                ) : team.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-white">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  team.map((item, index) => (
                    <tr
                      key={getUserId(item) || item?.email || `member-${index}`}
                      className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                    >
                      <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white">
                        {(currentPage - 1) * pageLimit + index + 1}
                      </td>
                      <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white">
                        {item?.name || "-"}
                      </td>
                      <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white">
                        {item?.email || "-"}
                      </td>
                      <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white">
                        {getRoleLabel(item?.role)}
                      </td>
                      <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white">
                        {item?.territory || "-"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-white">
                        {item?.speciality || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-white/85 md:flex-row">
            <p>
              Page {currentPage} of {Math.max(totalPages, 1)} · {totalUsers} total
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
                onClick={() => setCurrentPage((p) => Math.min(Math.max(totalPages, 1), p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default TeamHome;
