const LEVEL_ORDER = ["basic", "standard", "premium", "intensive"];

const normalizeService = (value) => String(value || "").trim().toLowerCase();

export const isCompletePackageService = (service) => {
  const s = normalizeService(service);
  return s === "complete package" || s === "complete_package";
};

export const getLevelIndex = (level) => {
  const key = String(level || "").trim().toLowerCase();
  const idx = LEVEL_ORDER.indexOf(key);
  return idx === -1 ? 0 : idx;
};

export const getCompletePaymentByRule = ({ service, counselingLevel }) => {
  const base = isCompletePackageService(service) ? 25000 : 10000;
  const idx = getLevelIndex(counselingLevel);
  return base + idx * 2500;
};

export const getAdvancePaymentByRule = ({ service, counselingLevel }) => {
  const total = getCompletePaymentByRule({ service, counselingLevel });
  return Math.round(total * 0.2);
};

export const getPricingBreakdown = ({ service, counselingLevel }) => {
  const total = getCompletePaymentByRule({ service, counselingLevel });
  const advance = getAdvancePaymentByRule({ service, counselingLevel });
  const remaining = Math.max(0, total - advance);
  return { total, advance, remaining };
};

