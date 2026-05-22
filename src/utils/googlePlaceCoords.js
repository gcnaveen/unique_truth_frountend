/**
 * Reads lat/lng from google.maps.Place after fetchFields.
 * Handles LatLng with .lat()/.lng(), plain literals, and legacy geometry.location.
 */
export function readPlaceLatLng(place) {
  if (!place) return null;

  const fromLatLngLike = (loc) => {
    if (loc == null) return null;
    let lat;
    let lng;
    if (typeof loc.lat === "function") {
      lat = loc.lat();
      lng = typeof loc.lng === "function" ? loc.lng() : undefined;
    } else {
      lat = loc.lat;
      lng = loc.lng;
    }
    const la = typeof lat === "number" ? lat : parseFloat(lat);
    const lo = typeof lng === "number" ? lng : parseFloat(lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
    return { latitude: la, longitude: lo };
  };

  const primary = fromLatLngLike(place.location);
  if (primary) return primary;

  const legacy = place.geometry?.location;
  if (legacy && typeof legacy.lat === "function" && typeof legacy.lng === "function") {
    const la = legacy.lat();
    const lo = legacy.lng();
    if (Number.isFinite(la) && Number.isFinite(lo)) return { latitude: la, longitude: lo };
  }

  return null;
}
