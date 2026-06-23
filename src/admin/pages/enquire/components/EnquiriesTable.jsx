import { useMemo } from "react";

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const formatText = (value) => {
  const v = String(value || "").trim();
  return v || "-";
};

export default function EnquiriesTable({ rows, loading, onView }) {
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/15 bg-white/8">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/85">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/85">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/85">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/85">
              Gender
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/85">
              Age
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/85">
              Answers
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/85">
              Created
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-white/85">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {loading ? (
            <tr>
              <td className="px-4 py-6 text-sm text-white/85" colSpan={8}>
                Loading enquiries...
              </td>
            </tr>
          ) : safeRows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-sm text-white/85" colSpan={8}>
                No enquiries found.
              </td>
            </tr>
          ) : (
            safeRows.map((row) => (
              <tr key={row?._id || `${row?.email}-${row?.createdAt}`}>
                <td className="px-4 py-3 text-sm font-medium text-white">
                  {formatText(row?.name)}
                </td>
                <td className="px-4 py-3 text-sm text-white/90">
                  {formatText(row?.phoneNumber)}
                </td>
                <td className="px-4 py-3 text-sm text-white/90">
                  {formatText(row?.email)}
                </td>
                <td className="px-4 py-3 text-sm text-white/90">
                  {formatText(row?.gender)}
                </td>
                <td className="px-4 py-3 text-sm text-white/90">
                  {Number.isFinite(Number(row?.age)) ? Number(row.age) : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-white/90">
                  {Array.isArray(row?.answers) ? row.answers.length : 0}
                </td>
                <td className="px-4 py-3 text-sm text-white/90">
                  {formatDateTime(row?.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onView?.(row)}
                    className="rounded-lg border border-[#5eead4]/60 bg-[#5eead4]/10 px-3 py-1.5 text-xs font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/20"
                  >
                    View details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

