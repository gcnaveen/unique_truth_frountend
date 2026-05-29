import axios from "axios";
import { API_URL } from "../../config";

const publicClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

/** GET /public/carriers — open positions across all franchises */
export const getPublicCarriers = async (params = {}) => {
  const response = await publicClient.get("/public/carriers", { params });
  return response.data;
};

export const normalizeCarrierList = (response) => {
  const payload = response?.data ?? response ?? {};
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const isCarrierOpen = (carrier) => carrier?.isActive !== false;

/** Load all pages when the API paginates results. */
export const fetchAllPublicCarriers = async ({ activeOnly = true } = {}) => {
  const limit = 100;
  let skip = 0;
  let collected = [];
  let total = Infinity;

  while (skip < total) {
    const response = await getPublicCarriers({ limit, skip });
    const payload = response?.data ?? response ?? {};
    const items = normalizeCarrierList(response);
    const batch = activeOnly ? items.filter(isCarrierOpen) : items;
    collected = collected.concat(batch);
    const reported = Number(payload?.total);
    total = Number.isFinite(reported) ? reported : collected.length;
    if (items.length < limit) break;
    skip += limit;
  }

  return collected;
};
