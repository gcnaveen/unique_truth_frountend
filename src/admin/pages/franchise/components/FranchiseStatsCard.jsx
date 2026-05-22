const FranchiseStatsCard = ({ loading, totalFranchise }) => {
  return (
    <article className="mb-4 rounded-xl border border-white/20 bg-white/10 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Total Franchise</p>
      <p className="mt-2 text-2xl font-semibold text-[#fde68a]">{loading ? "..." : totalFranchise}</p>
    </article>
  );
};

export default FranchiseStatsCard;
