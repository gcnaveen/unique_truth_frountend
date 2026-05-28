import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAllFranchises } from "../../../api/franchise";
import {
  blockAdminUser,
  createAdminUser,
  getAdminUserById,
  getAdminUsers,
  updateAdminUser,
} from "../../../api/users";
import UsersStatsCard from "./components/UsersStatsCard";
import UserRoleSelector from "./components/UserRoleSelector";
import CreateUserForm from "./components/CreateUserForm";
import {
  MIN_PASSWORD_LENGTH,
  normalizeLoginEmail,
  validatePasswordForApi,
} from "../../../utils/authConstants";
import { parseUserProvisionResponse } from "../../../utils/userProvision";

const initialUserForm = {
  email: "",
  name: "",
  franchiseId: "",
  password: "",
  territory: "",
  speciality: "",
};

const uiRoleToApiRole = (value) => {
  if (value === "admin" || value === "franchise_admin") return "franchise_admin";
  if (value === "sales_person") return "sales";
  if (value === "counsellor") return "counsellor";
  return value || "franchise_admin";
};

const apiRoleToUiRole = (value) => {
  if (
    value === "franchise_admin" ||
    value === "franchiseadmin" ||
    value === "franchise-admin" ||
    value === "admin"
  ) {
    return "admin";
  }
  if (value === "sales_person" || value === "salesperson" || value === "sales") {
    return "sales_person";
  }
  if (value === "counsellor" || value === "counselor") return "counsellor";
  return "sales_person";
};

const UsersHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [showCreateView, setShowCreateView] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [role, setRole] = useState("sales_person");
  const [editingUserId, setEditingUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginCredentials, setLoginCredentials] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");

  const normalizeList = (response) => {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };
  const normalizeMeta = (response) => {
    const payload = response?.data ?? response;
    const total = Number(payload?.total);
    const pages = Number(payload?.totalPages);
    return {
      total: Number.isFinite(total) ? total : 0,
      totalPages: Number.isFinite(pages) && pages > 0 ? pages : 1,
    };
  };

  const getFranchiseId = (item) => item?._id || item?.id || "";
  const getFranchiseLabel = (item) =>
    `${item?.name || "Franchise"}${item?.code ? ` (${item.code})` : ""}`;
  const getUserId = (item) => item?._id || item?.id || "";
  const rowActionButtonClass =
    "inline-flex h-8 min-w-18 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors";
  const getUserRoleLabel = (value) => {
    const normalized = apiRoleToUiRole(value);
    if (normalized === "admin") return "Franchise Admin";
    if (normalized === "sales_person") return "Sales Person";
    return "Counsellor";
  };
  const getUserIsActive = (item) => item?.isActive !== false;

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: currentPage,
        limit: pageLimit,
      };
      if (roleFilter !== "all") {
        params.role = uiRoleToApiRole(roleFilter);
      }
      const usersResponse = await getAdminUsers(access_token, params);
      const usersList = normalizeList(usersResponse);
      const meta = normalizeMeta(usersResponse);
      setUsers(usersList);
      setTotalUsers(meta.total || usersList.length);
      setTotalPages(meta.totalPages);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load users data.");
    } finally {
      setLoading(false);
    }
  };

  const loadFranchises = async () => {
    try {
      const franchiseResponse = await getAllFranchises(access_token);
      const franchiseList = normalizeList(franchiseResponse);
      setFranchises(franchiseList);
      const firstFranchiseId = getFranchiseId(franchiseList[0]);
      setUserForm((prev) => ({
        ...prev,
        franchiseId: prev.franchiseId || firstFranchiseId,
      }));
    } catch {}
  };

  useEffect(() => {
    if (access_token) loadUsers();
  }, [access_token, currentPage, pageLimit, roleFilter]);

  useEffect(() => {
    if (access_token) loadFranchises();
  }, [access_token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const apiRole = uiRoleToApiRole(role);
    const email = normalizeLoginEmail(userForm.email);
    const name = userForm.name.trim();
    const password = userForm.password?.trim() || "";

    if (!email || !name) {
      setError("Name and email are required.");
      return;
    }

    const needsFranchise =
      apiRole === "franchise_admin" || apiRole === "sales" || apiRole === "counsellor";

    if (!editingUserId && needsFranchise && !userForm.franchiseId) {
      setError("Select a franchise for this role.");
      return;
    }

    if (!editingUserId && apiRole === "counsellor" && !userForm.speciality?.trim()) {
      setError("Speciality is required for counsellor role.");
      return;
    }

    if (!editingUserId && apiRole === "franchise_admin") {
      const pwdError = validatePasswordForApi(password, { required: true });
      if (pwdError) {
        setError(
          `${pwdError} The franchise admin will sign in at /login with this email and that password.`,
        );
        return;
      }
    }

    if (!editingUserId && password) {
      const pwdError = validatePasswordForApi(password);
      if (pwdError) {
        setError(pwdError);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      setLoginCredentials(null);
      const payload = {
        email,
        name,
        role: apiRole,
        franchiseId: userForm.franchiseId,
      };
      if (userForm.franchiseId) {
        payload.preferredFranchiseId = userForm.franchiseId;
        payload.assignmentSource = "auto";
      }
      if (apiRole === "sales" && userForm.territory?.trim()) {
        payload.territory = userForm.territory.trim();
      }
      if (apiRole === "counsellor") {
        payload.speciality = userForm.speciality.trim();
      }

      if (editingUserId) {
        delete payload.password;
        delete payload.preferredFranchiseId;
        delete payload.assignmentSource;
        await updateAdminUser(access_token, editingUserId, payload);
        setSuccess("User updated successfully.");
      } else {
        if (password) payload.password = password;
        const response = await createAdminUser(access_token, payload);
        const provision = parseUserProvisionResponse(response);
        const loginPassword = provision.initialPassword || password || null;

        let successMsg = `${getUserRoleLabel(role)} created successfully.`;
        if (apiRole === "franchise_admin") {
          successMsg += " Save the login details below — they are shown only once.";
        } else if (provision.initialPassword) {
          successMsg += " Save the generated password below.";
        }
        setSuccess(successMsg);
        if (loginPassword) {
          setLoginCredentials({
            email,
            password: loginPassword,
            role: provision.role || apiRole,
            serverGenerated: Boolean(provision.initialPassword),
            typedPassword: password || null,
          });
        }
      }
      setUserForm((prev) => ({
        ...initialUserForm,
        franchiseId: prev.franchiseId,
      }));
      setEditingUserId("");
      setShowCreateView(false);
      await loadUsers();
      await loadFranchises();
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.response?.data?.error ||
          submitError?.response?.data?.details ||
          (editingUserId ? "Failed to update user." : "Failed to create user.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (userId) => {
    if (!userId) return;
    try {
      setError("");
      setSuccess("");
      const response = await getAdminUserById(access_token, userId);
      const user = response?.data ?? response;
      setUserForm((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
        franchiseId: user?.franchiseId || user?.preferredFranchiseId || "",
        password: "",
        territory: user?.territory || "",
        speciality: user?.speciality || "",
        isActive: user?.isActive !== false,
      }));
      setRole(apiRoleToUiRole(user?.role));
      setEditingUserId(userId);
      setShowCreateView(true);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load user details.");
    }
  };

  const handleToggleBlockUser = async (userId, isActive) => {
    if (!userId) return;
    const nextIsActive = !isActive;
    const isConfirmed = window.confirm(
      `Are you sure you want to ${nextIsActive ? "unblock" : "block"} this user?`
    );
    if (!isConfirmed) return;
    try {
      setError("");
      setSuccess("");
      await blockAdminUser(access_token, userId, { isActive: nextIsActive });
      setSuccess(`User ${nextIsActive ? "unblocked" : "blocked"} successfully.`);
      await loadUsers();
    } catch (blockError) {
      setError(blockError?.response?.data?.message || "Failed to update user status.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Users
            </h1>
            <p className="text-sm text-white/90 md:text-base">
              Create platform users for sales and counselling teams.
            </p>
          </div>
          {!showCreateView ? (
            <button
              type="button"
              onClick={() => setShowCreateView(true)}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 text-sm font-semibold text-[#0f2e1a] hover:opacity-90"
            >
              Add User
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowCreateView(false);
                setEditingUserId("");
                setUserForm((prev) => ({
                  ...initialUserForm,
                  franchiseId: prev.franchiseId,
                }));
              }}
              className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25"
            >
              Back to List
            </button>
          )}
        </div>
        {!showCreateView ? (
          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/75">
              Filter by role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white outline-none"
            >
              <option value="all">All roles</option>
              <option value="admin">Franchise Admin</option>
              <option value="sales_person">Sales Person</option>
              <option value="counsellor">Counsellor</option>
            </select>
          </div>
        ) : null}
      </div>

      <UsersStatsCard loading={loading} totalUsers={totalUsers} />

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-white">
          {success}
        </div>
      ) : null}
      {loginCredentials ? (
        <div className="mb-4 rounded-xl border border-amber-300/50 bg-amber-500/15 p-4 text-sm text-white">
          <p className="font-semibold text-amber-100">Login credentials (copy now)</p>
          <p className="mt-2">
            Email: <span className="font-mono text-[#fde68a]">{loginCredentials.email}</span>
          </p>
          <p className="mt-1">
            Password:{" "}
            <span className="font-mono text-[#fde68a]">{loginCredentials.password}</span>
          </p>
          <p className="mt-1 text-white/80">
            Role: {loginCredentials.role} · Sign in at <span className="font-mono">/login</span>
          </p>
          {loginCredentials.serverGenerated ? (
            <p className="mt-2 text-amber-100/90">
              The API generated this password. Use exactly what is shown above at login.
            </p>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm font-medium text-white">
          {error}
        </div>
      ) : null}

      {showCreateView ? (
        <div className="space-y-6">
          {editingUserId ? (
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 md:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Role
              </p>
              <div className="mt-3">
                <span className="inline-flex rounded-lg border border-[#5eead4]/70 bg-[#5eead4]/15 px-3 py-1.5 text-xs font-semibold text-[#a7f3d0]">
                  {getUserRoleLabel(role)}
                </span>
              </div>
            </div>
          ) : (
            <UserRoleSelector role={role} setRole={setRole} />
          )}
          <CreateUserForm
            role={role}
            userForm={userForm}
            franchises={franchises}
            getFranchiseId={getFranchiseId}
            getFranchiseLabel={getFranchiseLabel}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            title={editingUserId ? `Edit ${getUserRoleLabel(role)}` : `Create ${getUserRoleLabel(role)}`}
            submitLabel={editingUserId ? "Update User" : `Create ${getUserRoleLabel(role)}`}
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
          <table className="min-w-full table-fixed divide-y divide-white/15">
            <thead className="bg-white/20">
              <tr>
                <th className="w-[8%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Sl No
                </th>
                <th className="w-[24%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Name
                </th>
                <th className="w-[26%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Email
                </th>
                <th className="w-[15%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Role
                </th>
                <th className="w-[17%] border-r border-white/15 px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Franchise
                </th>
                <th className="w-[10%] px-4 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-white md:px-5" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-white md:px-5" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((item, index) => (
                  <tr
                    key={getUserId(item) || item?.email || `user-${index}`}
                    className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                  >
                    <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white md:px-5">
                      {(currentPage - 1) * pageLimit + index + 1}
                    </td>
                    <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white md:px-5">
                      {item?.name || "-"}
                    </td>
                    <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white md:px-5">
                      {item?.email || "-"}
                    </td>
                    <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white md:px-5">
                      {getUserRoleLabel(item?.role)}
                    </td>
                    <td className="border-r border-white/10 px-4 py-4 text-center text-sm text-white md:px-5">
                      {item?.franchiseName ||
                        item?.franchise?.name ||
                        item?.preferredFranchise?.name ||
                        "-"}
                    </td>
                    <td className="px-4 py-4 text-center md:px-5">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditUser(getUserId(item))}
                          className={`${rowActionButtonClass} border-[#5eead4]/70 bg-[#5eead4]/15 text-[#a7f3d0] hover:bg-[#5eead4]/25`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBlockUser(getUserId(item), getUserIsActive(item))}
                          className={`${rowActionButtonClass} ${
                            getUserIsActive(item)
                              ? "border-red-300/40 bg-red-500/20 text-red-100 hover:bg-red-500/30"
                              : "border-emerald-300/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                          }`}
                        >
                          {getUserIsActive(item) ? "Block" : "Unblock"}
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
            Showing page {currentPage} of {Math.max(totalPages, 1)} | Total records: {totalUsers}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/80">Go to page</label>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value) || 1)}
              disabled={loading}
              className="h-9 rounded-lg border border-white/25 bg-white/10 px-2 text-xs font-semibold text-white outline-none disabled:opacity-50"
            >
              {Array.from({ length: Math.max(totalPages, 1) }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {idx + 1}
                </option>
              ))}
            </select>
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
              onClick={() => setCurrentPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1))}
              disabled={currentPage >= totalPages || loading}
              className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default UsersHome;
