import { getNearestFranchises, pickNearestFranchiseSummary } from "../api/publicFranchises";
import { GEO_ERROR, getCurrentPosition } from "./geolocation";

export function normalizeMapsPlace(place) {
  if (!place || typeof place !== "object") return null;
  const lat = parseFloat(place.latitude);
  const lng = parseFloat(place.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
}

async function queryNearestBranches(latitude, longitude) {
  let nearest = null;
  let nearestError = null;
  try {
    const res = await getNearestFranchises({ latitude, longitude });
    nearest = pickNearestFranchiseSummary(res);
  } catch (e) {
    nearestError = e?.response?.data?.message || e?.message || "Nearest branch request failed.";
  }
  return { nearest, nearestError };
}

/** Lat/lng from Google Places (same as admin franchise form). */
export async function fetchNearestFromCoords(latitude, longitude, locationSource = "maps_place") {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      latitude: null,
      longitude: null,
      locationSource: "invalid",
      nearest: null,
      nearestError: null,
      fallbackNote: "Could not read coordinates from the selected place.",
      nearestQueried: false,
    };
  }
  const { nearest, nearestError } = await queryNearestBranches(lat, lng);
  return {
    latitude: lat,
    longitude: lng,
    locationSource,
    nearest,
    nearestError,
    fallbackNote: null,
    nearestQueried: true,
  };
}

/**
 * Nearest branch resolution:
 * 1) If user selected a Google Places result (admin-style), use that lat/lng first.
 * 2) Otherwise try device GPS.
 * 3) Otherwise explain that automatic location failed — user should select above.
 *
 * @param {{ mapsPlaceFallback?: object | null; deviceGps?: boolean }} [options]
 * @param [options.deviceGps=true] If false, never calls browser geolocation (Contact / enquiry use Places only).
 */
export async function fetchNearestFranchiseForUser(options = {}) {
  const maps = normalizeMapsPlace(options.mapsPlaceFallback);
  const allowDeviceGps = options.deviceGps !== false;

  if (maps) {
    return fetchNearestFromCoords(maps.latitude, maps.longitude, "maps_place");
  }

  if (!allowDeviceGps) {
    return {
      latitude: null,
      longitude: null,
      locationSource: "maps_required",
      nearest: null,
      nearestError: null,
      fallbackNote:
        "Select your city or address above. Nearest branch uses the same Google Places lookup as admin (browser GPS is not used here).",
      nearestQueried: false,
    };
  }

  try {
    const coords = await getCurrentPosition();
    const { latitude, longitude } = coords;
    const { nearest, nearestError } = await queryNearestBranches(latitude, longitude);

    return {
      latitude,
      longitude,
      locationSource: "device",
      nearest,
      nearestError,
      fallbackNote: null,
      nearestQueried: true,
    };
  } catch (err) {
    if (err?.code === GEO_ERROR.PERMISSION_DENIED || err?.code === 1) {
      return {
        latitude: null,
        longitude: null,
        locationSource: "denied",
        nearest: null,
        nearestError: null,
        fallbackNote:
          "Location access was denied. Select your city or address above to find your nearest franchise (same Google Places lookup as admin).",
        nearestQueried: false,
      };
    }

    const unsupported =
      err?.code === 0 && String(err?.message || "").toLowerCase().includes("not supported");

    return {
      latitude: null,
      longitude: null,
      locationSource: unsupported ? "unsupported" : "unavailable",
      nearest: null,
      nearestError: null,
      fallbackNote: unsupported
        ? "This browser does not support GPS. Select your city or address above to find your nearest franchise."
        : "Automatic location did not work on this device (Safari often shows a CoreLocation error in the console). Select your city or address above — we use the same Google Places search as admin — then submit again.",
      nearestQueried: false,
    };
  }
}
