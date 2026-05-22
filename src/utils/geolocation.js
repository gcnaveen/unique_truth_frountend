/**
 * Browser GeolocationPositionError codes (numeric).
 * @see https://developer.mozilla.org/docs/Web/API/GeolocationPositionError
 */
export const GEO_ERROR = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
};

/**
 * Resolves the device location using the Geolocation API.
 * Retries with lower accuracy if high accuracy fails (helps on macOS Safari
 * where CoreLocation sometimes reports kCLErrorLocationUnknown).
 *
 * @returns {Promise<{ latitude: number; longitude: number }>}
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const err = new Error("Geolocation is not supported in this browser.");
      err.code = 0;
      reject(err);
      return;
    }

    const attempts = [
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0, ...options },
      { enableHighAccuracy: false, timeout: 25000, maximumAge: 120000, ...options },
    ];

    const tryAt = (index) => {
      if (index >= attempts.length) {
        const last = new Error(
          "Could not obtain your position. On desktop Safari, try Wi‑Fi, allow precise location, or use a phone."
        );
        last.code = GEO_ERROR.POSITION_UNAVAILABLE;
        reject(last);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (geoErr) => {
          const code = geoErr?.code;
          // Permission denied: do not retry with different options
          if (code === GEO_ERROR.PERMISSION_DENIED) {
            reject(geoErr);
            return;
          }
          tryAt(index + 1);
        },
        attempts[index]
      );
    };

    tryAt(0);
  });
}
