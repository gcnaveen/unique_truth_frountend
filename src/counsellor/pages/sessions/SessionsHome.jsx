import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCounsellorSessions } from "../../../api/counsellor";
import {
  getAssignedUserName,
  getEnquiryId,
  getId,
  getSessionScheduledDisplay,
  getSessionStatusDisplay,
  getSessionTypeDisplay,
  hasBookedSession,
  normalizePagedItems,
} from "../../utils/format";
import AssignedUserDrawer from "../assigned-users/components/AssignedUserDrawer";
import SessionDrawer from "./components/SessionDrawer";

const WHEN_TABS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

const SessionsHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [whenFilter, setWhenFilter] = useState("all");
  const [sessions, setSessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedEnquiryId, setSelectedEnquiryId] = useState("");
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);
  const [bookDrawerOpen, setBookDrawerOpen] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalCount || sessions.length) / pageLimit)),
    [totalCount, sessions.length, pageLimit],
  );

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const skip = (currentPage - 1) * pageLimit;
      const params = { limit: pageLimit, skip, when: whenFilter };
      const response = await getCounsellorSessions(access_token, params);
      const { items, total } = normalizePagedItems(response);
      setSessions(items);
      setTotalCount(total);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load sessions.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access_token) loadSessions();
  }, [access_token, currentPage, pageLimit, whenFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [whenFilter]);

  const openRow = (row) => {
    if (hasBookedSession(row)) {
      const sessionId = getId(row);
      if (!sessionId) return;
      setSelectedSessionId(sessionId);
      setSessionDrawerOpen(true);
      return;
    }
    const enquiryId = getEnquiryId(row);
    if (!enquiryId) return;
    setSelectedEnquiryId(enquiryId);
    setBookDrawerOpen(true);
  };

  const closeSessionDrawer = () => {
    setSessionDrawerOpen(false);
    setTimeout(() => setSelectedSessionId(""), 300);
  };

  const closeBookDrawer = () => {
    setBookDrawerOpen(false);
    setTimeout(() => setSelectedEnquiryId(""), 300);
  };

  return (
    <>
      <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Sessions</h1>
          <p className="mt-1 text-sm text-white/90 md:text-base">
            Past and upcoming sessions. Book new slots, add notes, and update status.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {WHEN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setWhenFilter(tab.id)}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                whenFilter === tab.id
                  ? "border-[#5eead4]/70 bg-[#5eead4]/20 text-[#a7f3d0]"
                  : "border-white/25 bg-white/10 text-white/80 hover:bg-white/15",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm text-white">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-white/20 bg-white/5">
          <table className="min-w-[800px] w-full table-fixed border-collapse divide-y divide-white/15">
            <thead className="bg-white/20">
              <tr>
                <th className="w-[6%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  #
                </th>
                <th className="w-[18%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  User
                </th>
                <th className="w-[18%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Type
                </th>
                <th className="w-[22%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Scheduled
                </th>
                <th className="w-[12%] border-r border-white/15 px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
                  Status
                </th>
                <th className="w-[12%] px-3 py-3.5 text-center text-xs font-semibold uppercase text-white">
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
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-white">
                    No sessions in this view.
                  </td>
                </tr>
              ) : (
                sessions.map((row, index) => (
                  <tr
                    key={getId(row) || `s-${index}`}
                    className={index % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.08]"}
                  >
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white">
                      {(currentPage - 1) * pageLimit + index + 1}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white">
                      {getAssignedUserName(row)}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      {getSessionTypeDisplay(row)}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-white/90">
                      {getSessionScheduledDisplay(row)}
                    </td>
                    <td className="border-r border-white/10 px-3 py-4 text-center text-sm text-[#a7f3d0]">
                      {getSessionStatusDisplay(row)}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => openRow(row)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 text-xs font-semibold text-[#a7f3d0]"
                      >
                        {hasBookedSession(row) ? "View" : "Book"}
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

      <SessionDrawer
        sessionId={selectedSessionId}
        accessToken={access_token}
        open={sessionDrawerOpen}
        onClose={closeSessionDrawer}
        onUpdated={loadSessions}
      />
      <AssignedUserDrawer
        enquiryId={selectedEnquiryId}
        accessToken={access_token}
        open={bookDrawerOpen}
        onClose={closeBookDrawer}
        onUpdated={loadSessions}
      />
    </>
  );
};

export default SessionsHome;
