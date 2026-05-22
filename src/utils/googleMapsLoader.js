/**
 * Google Maps JS + Places (same params as admin CreateFranchiseForm). Singleton script load.
 */
export const loadGoogleMaps = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve, reject) => {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!key) {
        reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
        return;
      }
      if (window?.google?.maps?.places?.AutocompleteSuggestion) {
        resolve();
        return;
      }
      window.__gmpInit = () => {
        delete window.__gmpInit;
        resolve();
      };
      const script = document.createElement("script");
      // New Places (AutocompleteSuggestion) currently ships on the alpha/beta JS channel.
      script.src =
        `https://maps.googleapis.com/maps/api/js` +
        `?key=${key}` +
        `&libraries=places` +
        `&v=alpha` +
        `&loading=async` +
        `&callback=__gmpInit`;
      script.async = true;
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
    return promise;
  };
})();
