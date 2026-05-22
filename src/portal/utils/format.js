import {
  formatDateTime,
  formatLabel,
  getId,
  normalizePagedItems,
} from "../../counsellor/utils/format";

export { formatDateTime, formatLabel, getId, normalizePagedItems };

export const COUNSELING_LEVEL_META = {
  basic: {
    label: "Basic",
    tagline: "Essential guidance to get started",
    accent: "from-[#94a3b8] to-[#64748b]",
  },
  standard: {
    label: "Standard",
    tagline: "Balanced support for your journey",
    accent: "from-[#c9a86c] to-[#d4a574]",
  },
  premium: {
    label: "Premium",
    tagline: "Deeper insights and priority care",
    accent: "from-[#5eead4] to-[#2dd4bf]",
  },
  intensive: {
    label: "Intensive",
    tagline: "Full programme with maximum attention",
    accent: "from-[#a78bfa] to-[#7c3aed]",
  },
};

export const getCounselingLevelLabel = (id) =>
  COUNSELING_LEVEL_META[id]?.label || formatLabel(id);

export const formatRupees = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};
