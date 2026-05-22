const UsersStatsCard = ({ loading, totalUsers }) => {
  return (
    <div className="mb-6 rounded-xl border border-white/20 bg-white/10 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Total Users</p>
      <p className="mt-2 text-2xl font-semibold text-[#5eead4]">{loading ? "..." : totalUsers}</p>
    </div>
  );
};

export default UsersStatsCard;
