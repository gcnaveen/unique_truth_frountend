const CarriersStatsCard = ({ loading, totalCarriers }) => {
  return (
    <article className="mb-4 rounded-xl border border-white/20 bg-white/10 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Total Carriers</p>
      <p className="mt-2 text-2xl font-semibold text-[#fde68a]">{loading ? "..." : totalCarriers}</p>
    </article>
  );
};

export default CarriersStatsCard;
