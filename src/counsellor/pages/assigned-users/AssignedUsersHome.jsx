import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCounsellorAssignedUsers } from "../../../api/counsellor";
import {
  getAssignedUserDate,
  getAssignedUserEmail,
  getAssignedUserName,
  getAssignedUserPhone,
  getAssignedUserService,
  getEnquiryId,
  getId,
  normalizePagedItems,
} from "../../utils/format";
import AssignedUserDrawer from "./components/AssignedUserDrawer";

const AssignedUsersHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalCount || users.length) / pageLimit)),
    [totalCount, users.length, pageLimit],
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const response = await getCounsellorAssignedUsers(access_token, {
        limit: pageLimit,
        skip,
      });
      const { items, total } = normalizePagedItems(response);
      setUsers(items);
      setTotalCount(total);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load assigned users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access_token) loadUsers();
  }, [access_token, currentPage, pageLimit]);

  const openDrawer = (row) => {
    const id = getEnquiryId(row) || getId(row);
    if (!id) return;
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedId(""), 300);
  };

  return (
    <>
      <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Assigned users
          </h1>
          <p className="mt-1 text-sm text-white/90 md:text-base">
            Users converted by sales and assigned to you. Book sessions, upload fingerprint
            and audio, and view history.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm text-white">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
          <table className="min-w-[720px] w-full table-fixed border-collapse divide-y divide-white/15">
            <thead className="bg-white/20">
              <tr>
                <th className="w-[6%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  #
                </th>
                <th className="w-[22%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Name
                </th>
                <th className="w-[24%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Contact
                </th>
                <th className="w-[20%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Service
                </th>
                <th className="w-[14%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Date
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
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-white">
                    No assigned users yet.
                  </td>
                </tr>
              ) : (
                users.map((row, index) => (
                  <tr
                    key={getId(row) || `u-${index}`}
                    className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                  >
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white">
                      {(currentPage - 1) * pageLimit + index + 1}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm font-medium text-white">
                      {getAssignedUserName(row)}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      <div>{getAssignedUserEmail(row)}</div>
                      <div className="text-xs text-white/70">{getAssignedUserPhone(row)}</div>
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      {getAssignedUserService(row)}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      {getAssignedUserDate(row)}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => openDrawer(row)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 text-xs font-semibold text-[#a7f3d0]"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
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

      <AssignedUserDrawer
        enquiryId={selectedId}
        accessToken={access_token}
        open={drawerOpen}
        onClose={closeDrawer}
        onUpdated={loadUsers}
      />
    </>
  );
};

export default AssignedUsersHome;
