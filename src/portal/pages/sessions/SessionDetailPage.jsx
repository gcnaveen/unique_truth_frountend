import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPortalSessionById } from "../../../api/portal";
import { unwrapPortalPayload } from "../../utils/access";
import { formatDateTime, formatLabel } from "../../utils/format";

export default function PortalSessionDetailPage() {
  const { sessionId } = useParams();
  const { access_token } = useSelector((state) => state.user.value);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!access_token || !sessionId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPortalSessionById(access_token, sessionId);
        const data = unwrapPortalPayload(response);
        setSession(data?.session ?? data);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load session.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token, sessionId]);

  if (loading) return <p className="text-sm text-white/70">Loading session…</p>;

  if (!session) {
    return (
      <div className="space-y-4">
        <Link to="/portal/dashboard/sessions" className="text-sm text-[#a7f3d0] hover:underline">
          ← Sessions
        </Link>
        <p className="text-white/70">Session not found.</p>
      </div>
    );
  }

  const counsellor = session?.counsellor ?? session?.enquiry?.counsellor;

  return (
    <div className="space-y-6">
      <Link
        to="/portal/dashboard/sessions"
        className="inline-flex text-sm font-semibold text-[#a7f3d0] hover:underline"
      >
        ← Sessions
      </Link>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <header className="rounded-3xl border border-white/15 bg-white/8 p-6">
        <p className="text-xs uppercase tracking-wide text-[#c9a86c]">Session</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-white">
          {formatLabel(session.sessionType)}
        </h1>
        <p className="mt-2 inline-flex rounded-full border border-[#5eead4]/40 bg-[#5eead4]/15 px-3 py-1 text-xs font-semibold text-[#a7f3d0]">
          {formatLabel(session.status)}
        </p>
      </header>

      <dl className="grid gap-4 rounded-2xl border border-white/15 bg-white/8 p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-white/55">Scheduled</dt>
          <dd className="mt-1 font-medium text-white">{formatDateTime(session.scheduledAt)}</dd>
        </div>
        <div>
          <dt className="text-white/55">Duration</dt>
          <dd className="mt-1 font-medium text-white">
            {session.durationMinutes ? `${session.durationMinutes} minutes` : "—"}
          </dd>
        </div>
        {counsellor ? (
          <div className="sm:col-span-2">
            <dt className="text-white/55">Counsellor</dt>
            <dd className="mt-1 font-medium text-white">{counsellor.name || "—"}</dd>
          </div>
        ) : null}
      </dl>

      {(session.notes || []).length > 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
          <h2 className="text-base font-semibold text-white">Notes from your counsellor</h2>
          <ul className="mt-4 space-y-3">
            {[...(session.notes || [])].reverse().map((note, idx) => (
              <li
                key={`${note?.at || idx}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85"
              >
                {note.note || "—"}
                <p className="mt-1 text-xs text-white/50">{formatDateTime(note.at)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
