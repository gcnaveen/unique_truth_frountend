import { useEffect, useRef, useState } from "react";
import { readPlaceLatLng } from "../utils/googlePlaceCoords";
import { loadGoogleMaps } from "../utils/googleMapsLoader";

/**
 * Google Places autocomplete → lat/lng (same API usage as admin CreateFranchiseForm).
 * @param {'dark'|'light'} theme
 * @param {(place: object | null) => void} onPlaceSelected — `null` when cleared
 */
export default function PlaceSearchAutocomplete({
  theme = "light",
  label = "Select your location",
  hint = "",
  onPlaceSelected,
  onClear,
  disabled = false,
}) {
  const onSelectRef = useRef(onPlaceSelected);
  const debounceRef = useRef(null);
  const sessionTokenRef = useRef(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [filledLocation, setFilledLocation] = useState(null);

  useEffect(() => {
    onSelectRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        setMapsReady(true);
        setMapsError("");
      })
      .catch((e) => setMapsError(e?.message || "Maps could not load."));
  }, []);

  const isDark = theme === "dark";

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim() || !mapsReady) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: results } =
          await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: val,
            sessionToken: sessionTokenRef.current,
          });
        setSuggestions(results ?? []);
        setShowDropdown((results ?? []).length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = async (suggestion) => {
    const prediction = suggestion.placePrediction;
    setShowDropdown(false);
    setSuggestions([]);
    setLoadingPlace(true);
    setQuery("");

    try {
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ["addressComponents", "formattedAddress", "location"],
      });

      const get = (type) =>
        place.addressComponents?.find((c) => c.types.includes(type))?.longText ?? "";

      const coords = readPlaceLatLng(place) || { latitude: "", longitude: "" };

      const placeData = {
        address: place.formattedAddress || "",
        city:
          get("locality") ||
          get("administrative_area_level_2") ||
          get("administrative_area_level_3"),
        state: get("administrative_area_level_1"),
        pincode: get("postal_code") || get("postal_code_prefix") || "",
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      setFilledLocation(placeData);
      onSelectRef.current?.(placeData);

      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    } catch (err) {
      console.error("fetchFields failed:", err);
    } finally {
      setLoadingPlace(false);
    }
  };

  const handleClearLocation = () => {
    setFilledLocation(null);
    setQuery("");
    onClear?.();
    onSelectRef.current?.(null);
  };

  const shell = isDark
    ? "border-white/15 bg-[#14381f]/50 focus-within:border-teal-400/35"
    : "border-[#0f2e1a]/20 bg-white focus-within:border-[#0d9488]/60";
  const inputCls = isDark
    ? "text-[#fff8ef] placeholder:text-[rgba(255,248,236,0.42)]"
    : "text-[#0f2e1a] placeholder:text-[#0f2e1a]/45";
  const labelCls = isDark ? "text-[rgba(255,248,236,0.56)]" : "text-[#0f2e1a]/70";
  const hintCls = isDark ? "text-[rgba(255,248,236,0.45)]" : "text-[#0f2e1a]/55";
  const dropdownCls = isDark
    ? "border-white/15 bg-[#0f2e15]/98 text-[#fff8ef] shadow-xl backdrop-blur-md"
    : "border-[#0f2e1a]/15 bg-white text-[#0a1a12] shadow-lg";
  const itemHover = isDark ? "hover:bg-white/10" : "hover:bg-[#0f2e1a]/06";
  const cardCls = isDark
    ? "border-teal-400/25 bg-teal-400/8 text-[#fff8ef]"
    : "border-[#5eead4]/35 bg-[#5eead4]/8 text-[#0a1a12]";

  return (
    <div className="grid gap-1.5">
      <label className={`text-[0.64rem] font-semibold uppercase tracking-[0.18em] ${labelCls}`}>
        {label}
      </label>
      {mapsError ? (
        <p className={`text-[0.72rem] ${isDark ? "text-amber-200/90" : "text-red-700"}`}>{mapsError}</p>
      ) : null}

      {!filledLocation ? (
        <div className="relative">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-1 transition-colors ${shell} ${disabled ? "opacity-50" : ""}`}
          >
            <svg
              className={`h-4 w-4 shrink-0 ${isDark ? "text-teal-300/80" : "text-[#0d9488]"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm0 0v9m-4-9a4 4 0 118 0c0 3.5-4 7-4 7s-4-3.5-4-7z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder={mapsReady ? "Search city, area, or street…" : "Loading Maps…"}
              disabled={!mapsReady || disabled}
              className={`min-w-0 flex-1 bg-transparent py-2 text-[0.88rem] outline-none ${inputCls} disabled:cursor-not-allowed`}
            />
            {loadingPlace ? (
              <svg className="h-4 w-4 shrink-0 animate-spin text-teal-400" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : null}
          </div>

          {showDropdown && suggestions.length > 0 ? (
            <ul
              className={`absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border ${dropdownCls}`}
            >
              {suggestions.map((s, i) => {
                const pred = s.placePrediction;
                const main = pred.mainText?.toString() ?? "";
                const secondary = pred.secondaryText?.toString() ?? "";
                return (
                  <li
                    key={pred.placeId ?? i}
                    onMouseDown={() => handleSelectSuggestion(s)}
                    className={`flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm ${itemHover}`}
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{main}</span>
                      {secondary ? <span className="ml-1 opacity-70">{secondary}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className={`rounded-xl border p-3 text-sm ${cardCls}`}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Selected</span>
            <button
              type="button"
              onClick={handleClearLocation}
              className="text-xs underline opacity-80 hover:opacity-100"
            >
              Change
            </button>
          </div>
          <p className="text-[0.88rem] leading-snug">{filledLocation.address || "—"}</p>
        </div>
      )}

      {hint ? <p className={`text-[0.72rem] leading-relaxed ${hintCls}`}>{hint}</p> : null}
    </div>
  );
}
