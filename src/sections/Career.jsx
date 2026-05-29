import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fetchAllPublicCarriers } from "../api/publicCarriers";
import { getPublicFranchises } from "../api/publicFranchises";

const normalizeFranchiseList = (response) => {
  const root = response?.data ?? response;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  return [];
};

const getFranchiseId = (row) => row?._id || row?.id || row?.franchiseId || "";
const getCarrierId = (row) => row?._id || row?.id || "";

const getRoleName = (carrier) => String(carrier?.name || "Role").trim() || "Role";

const getFranchiseLabel = (carrier, franchiseById) => {
  const nested = carrier?.franchise;
  if (typeof nested === "object" && nested?.name) return nested.name;
  if (carrier?.franchiseName || carrier?.branchName) {
    return carrier.franchiseName || carrier.branchName;
  }
  const fid = carrier?.franchiseId || carrier?.preferredFranchiseId;
  if (fid && franchiseById.has(fid)) return franchiseById.get(fid);
  return fid ? "Franchise branch" : "All branches";
};

const getLocationLabel = (carrier, franchiseById) => {
  const franchise = carrier?.franchise;
  const city = franchise?.city || carrier?.city;
  const state = franchise?.state || carrier?.state;
  if (city || state) return [city, state].filter(Boolean).join(", ");
  const fid = carrier?.franchiseId || carrier?.preferredFranchiseId;
  if (fid && franchiseById.has(`${fid}-location`)) {
    return franchiseById.get(`${fid}-location`);
  }
  return carrier?.address || "";
};

const getRoleCountMap = (items) => {
  const map = new Map();
  items.forEach((carrier) => {
    const role = getRoleName(carrier);
    map.set(role, (map.get(role) || 0) + 1);
  });
  return map;
};

function JobDetailModal({ carrier, franchiseMeta, onClose }) {
  if (!carrier) return null;

  const branch = getFranchiseLabel(carrier, franchiseMeta);
  const location = getLocationLabel(carrier, franchiseMeta);
  const role = getRoleName(carrier);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close job details"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-detail-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/15 bg-[#0f2e1a] p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-[#5eead4]/35 bg-[#5eead4]/10 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#a7f3d0]">
              Open position
            </span>
            <h3
              id="job-detail-title"
              className="mt-3 text-2xl font-semibold text-[#fff8ef]"
              style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
            >
              {role}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white/80 hover:bg-white/15"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
              Branch
            </dt>
            <dd className="mt-1 font-medium text-[#c9a86c]">{branch}</dd>
          </div>
          {location ? (
            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                Location
              </dt>
              <dd className="mt-1 text-white/80">{location}</dd>
            </div>
          ) : null}
          {carrier?.code ? (
            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                Job code
              </dt>
              <dd className="mt-1 text-white/80">{carrier.code}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
              Description
            </dt>
            <dd className="mt-2 leading-relaxed text-white/75">
              {carrier?.description?.trim() ||
                "No additional description provided. Contact us to learn more about this role."}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#contact"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[#c9a86c]/50 bg-[#c9a86c] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a120c] no-underline hover:opacity-90"
          >
            Apply now
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const Career = () => {
  const [carriers, setCarriers] = useState([]);
  const [franchiseMeta, setFranchiseMeta] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [carrierItems, franchiseResponse] = await Promise.all([
          fetchAllPublicCarriers({ activeOnly: true }),
          getPublicFranchises().catch(() => []),
        ]);

        const franchises = normalizeFranchiseList(franchiseResponse);
        const meta = new Map();
        franchises.forEach((f) => {
          const id = getFranchiseId(f);
          if (!id) return;
          meta.set(id, f.name || "Branch");
          const location = [f.city, f.state].filter(Boolean).join(", ");
          if (location) meta.set(`${id}-location`, location);
        });

        if (cancelled) return;
        setFranchiseMeta(meta);
        setCarriers(carrierItems);
      } catch (fetchError) {
        if (cancelled) return;
        setCarriers([]);
        setError(
          fetchError?.response?.data?.message ||
            "Could not load career openings. Please try again later.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedCarrier ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCarrier]);

  const roleCountMap = useMemo(() => getRoleCountMap(carriers), [carriers]);

  const roleFilters = useMemo(() => {
    const roles = [...roleCountMap.keys()].sort((a, b) => a.localeCompare(b));
    return roles.map((role) => ({
      role,
      count: roleCountMap.get(role) || 0,
    }));
  }, [roleCountMap]);

  const filteredCarriers = useMemo(() => {
    const list = roleFilter
      ? carriers.filter((c) => getRoleName(c) === roleFilter)
      : carriers;
    return [...list].sort((a, b) => {
      const branchA = getFranchiseLabel(a, franchiseMeta).toLowerCase();
      const branchB = getFranchiseLabel(b, franchiseMeta).toLowerCase();
      if (branchA !== branchB) return branchA.localeCompare(branchB);
      return getRoleName(a).localeCompare(getRoleName(b));
    });
  }, [carriers, roleFilter, franchiseMeta]);

  const totalOpenings = carriers.length;

  return (
    <section
      id="career"
      className="relative overflow-hidden bg-[#0a2210] py-20 sm:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-teal-400/6 blur-[100px]" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#c9a86c]/7 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-[#c9a86c]/85">
            Careers
          </p>
          <h2
            className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.12] tracking-[-0.02em] text-[#fff8ef]"
            style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
          >
            Join our team across India
          </h2>
          <p className="mt-5 text-[0.95rem] leading-[1.85] text-[rgba(255,248,236,0.62)]">
            Open roles at Unique Truth franchises. Filter by role or tap a position to view full
            details.
          </p>
        </motion.div>

        {!loading && !error && totalOpenings > 0 ? (
          <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-1 rounded-2xl border border-[#c9a86c]/30 bg-[#c9a86c]/10 px-6 py-4 text-center">
            <p className="text-3xl font-semibold text-[#fff8ef]">{totalOpenings}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a86c]">
              {totalOpenings === 1 ? "Open position" : "Open positions"}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-300/35 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {!loading && !error && roleFilters.length > 0 ? (
          <div className="mt-8">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Filter by role
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setRoleFilter("")}
                className={[
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  roleFilter === ""
                    ? "border-[#5eead4]/60 bg-[#5eead4]/20 text-[#a7f3d0]"
                    : "border-white/20 bg-white/5 text-white/75 hover:border-white/35 hover:bg-white/10",
                ].join(" ")}
              >
                All roles ({totalOpenings})
              </button>
              {roleFilters.map(({ role, count }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={[
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    roleFilter === role
                      ? "border-[#c9a86c]/60 bg-[#c9a86c]/20 text-[#fde68a]"
                      : "border-white/20 bg-white/5 text-white/75 hover:border-white/35 hover:bg-white/10",
                  ].join(" ")}
                >
                  {role} ({count})
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : filteredCarriers.length === 0 && !error ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-10 text-center">
            <p className="text-sm text-white/75">
              {roleFilter
                ? `No openings for "${roleFilter}" right now. Try another role or view all positions.`
                : "No open positions right now. Check back soon for new opportunities at our franchises."}
            </p>
            {roleFilter ? (
              <button
                type="button"
                onClick={() => setRoleFilter("")}
                className="mt-4 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                Show all openings
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCarriers.map((carrier, index) => {
              const id = getCarrierId(carrier) || `carrier-${index}`;
              const branch = getFranchiseLabel(carrier, franchiseMeta);
              const location = getLocationLabel(carrier, franchiseMeta);
              const role = getRoleName(carrier);
              return (
                <motion.button
                  key={id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.55,
                    delay: Math.min(index * 0.04, 0.24),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => setSelectedCarrier(carrier)}
                  className="flex h-full cursor-pointer flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-sm transition-colors hover:border-[#c9a86c]/35 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5eead4]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-full border border-[#5eead4]/35 bg-[#5eead4]/10 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#a7f3d0]">
                      Open
                    </span>
                    {carrier?.code ? (
                      <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/45">
                        {carrier.code}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[#fff8ef]">{role}</h3>

                  <p className="mt-1 text-sm font-medium text-[#c9a86c]">{branch}</p>
                  {location ? (
                    <p className="mt-1 text-xs text-white/55">{location}</p>
                  ) : null}

                  {carrier?.description ? (
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-white/68">
                      {carrier.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <span className="mt-5 inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-[#a7f3d0]">
                    View details →
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {!loading && filteredCarriers.length > 0 ? (
          <p className="mt-10 text-center text-xs text-white/50">
            Showing {filteredCarriers.length} of {totalOpenings} open{" "}
            {totalOpenings === 1 ? "position" : "positions"}
            {roleFilter ? ` for "${roleFilter}"` : ""}.
          </p>
        ) : null}
      </div>

      <AnimatePresence>
        {selectedCarrier ? (
          <JobDetailModal
            carrier={selectedCarrier}
            franchiseMeta={franchiseMeta}
            onClose={() => setSelectedCarrier(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
};

export default Career;
