import axios from "axios";
import { API_URL } from "../../config";

const publicClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** GET /public/franchises — list franchise branches */
export const getPublicFranchises = async (params = {}) => {
  const response = await publicClient.get("/public/franchises", { params });
  return response.data;
};

/**
 * GET /public/franchises/nearest — suggest nearest branches by coordinates.
 * Tries `latitude`/`longitude` first, then `lat`/`lng` if the server returns 400/422.
 */
export const getNearestFranchises = async (params = {}) => {
  const lat = params.latitude ?? params.lat;
  const lng = params.longitude ?? params.lng;

  const tryRequest = async (query) => {
    const response = await publicClient.get("/public/franchises/nearest", { params: query });
    return response.data;
  };

  if (lat == null || lng == null) {
    return tryRequest(params);
  }

  try {
    return await tryRequest({ latitude: lat, longitude: lng });
  } catch (e) {
    const status = e?.response?.status;
    if (status === 400 || status === 422) {
      return await tryRequest({ lat, lng });
    }
    throw e;
  }
};

/**
 * Normalizes various API shapes into a single display object.
 */
export const pickNearestFranchiseSummary = (response) => {
  const root = response?.data ?? response;
  const candidates = Array.isArray(root)
    ? root
    : Array.isArray(root?.items)
      ? root.items
      : Array.isArray(root?.franchises)
        ? root.franchises
        : Array.isArray(root?.data)
          ? root.data
          : root && typeof root === "object" && (root._id || root.id || root.name)
            ? [root]
            : [];

  const first = candidates[0];
  if (!first) return null;

  const id = first._id || first.id || first.franchiseId || "";
  const name = first.name || first.franchiseName || first.title || "Nearest branch";
  const address = first.address || first.formattedAddress || "";
  const distance =
    first.distanceKm != null
      ? `${Number(first.distanceKm).toFixed(1)} km`
      : first.distanceMeters != null
        ? `${(Number(first.distanceMeters) / 1000).toFixed(1)} km`
        : first.distance != null
          ? String(first.distance)
          : "";

  const parts = [name, address, distance].filter(Boolean);
  return {
    id,
    name,
    address,
    distance,
    label: parts.join(" · ") || name,
  };
};
