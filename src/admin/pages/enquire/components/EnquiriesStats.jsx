const formatNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat().format(n);
};

const StatCard = ({ label, value, accentClassName }) => {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-xl md:p-5 xl:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80 xl:text-sm">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold text-white xl:text-[2rem] ${accentClassName || ""}`}>
        {formatNumber(value)}
      </p>
    </div>
  );
};

export default function EnquiriesStats({ stats, loading }) {
  const total =
    stats?.total ??
    stats?.count ??
    stats?.enquiries ??
    stats?.totalEnquiries ??
    null;

  const byService = stats?.byService || stats?.services || stats?.serviceCounts || null;
  const skills = byService?.["Skills Behind Studies"];
  const behavioral = byService?.["Behavioral Awareness"];
  const relationship = byService?.["Relationship Awareness"];
  const talent = byService?.["Talent Awareness"];
  const completePackage =
    byService?.["Complete Package"] ??
    stats?.completePackages ??
    stats?.completePackageCount ??
    null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total enquiries"
        value={loading ? null : total}
        accentClassName="text-[#fde68a]"
      />
      <StatCard label="Skills Behind Studies" value={loading ? null : skills} />
      <StatCard label="Behavioral Awareness" value={loading ? null : behavioral} />
      <StatCard label="Relationship Awareness" value={loading ? null : relationship} />
      <StatCard label="Talent Awareness" value={loading ? null : talent} />
      <StatCard label="Complete Package" value={loading ? null : completePackage} />
    </div>
  );
}

