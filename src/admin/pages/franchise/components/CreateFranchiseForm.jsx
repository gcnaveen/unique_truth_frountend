import { useEffect, useRef, useState } from "react";
import { readPlaceLatLng } from "../../../../utils/googlePlaceCoords";
import { loadGoogleMaps } from "../../../../utils/googleMapsLoader";

const CreateFranchiseForm = ({
  franchiseForm,
  onChange,
  onSubmit,
  onPlaceSelect,
  isCreating,
  title = "Create Franchise",
  subtitle = "Add branch and location details.",
  submitLabel = "Create Franchise",
}) => {
  const onSelectRef     = useRef(onPlaceSelect);
  const debounceRef     = useRef(null);
  const sessionTokenRef = useRef(null);

  // ── Local state for the search box and dropdown ──
  const [mapsReady, setMapsReady]       = useState(false);
  const [query, setQuery]               = useState("");
  const [suggestions, setSuggestions]   = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(false);

  // ── Local copy of filled location — NOT cleared by parent re-renders ──
  const [filledLocation, setFilledLocation] = useState(null);

  useEffect(() => { onSelectRef.current = onPlaceSelect; });

  useEffect(() => {
    loadGoogleMaps().then(() => {
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
      setMapsReady(true);
    });
  }, []);

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
    setQuery(""); // clear search box

    try {
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ["addressComponents", "formattedAddress", "location"],
      });

      const get = (type) =>
        place.addressComponents?.find((c) => c.types.includes(type))?.longText ?? "";

      const coords = readPlaceLatLng(place) || { latitude: "", longitude: "" };

      const placeData = {
        address:   place.formattedAddress || "",
        city:      get("locality") || get("administrative_area_level_2") || get("administrative_area_level_3"),
        state:     get("administrative_area_level_1"),
        pincode:   get("postal_code") || get("postal_code_prefix") || "",
        latitude:  coords.latitude,
        longitude: coords.longitude,
      };

      // 1. Save locally so preview doesn't vanish on parent re-render
      setFilledLocation(placeData);

      // 2. Push up to parent (updates franchiseForm for submission)
      onSelectRef.current?.(placeData);

      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    } catch (err) {
      console.error("fetchFields failed:", err);
    } finally {
      setLoadingPlace(false);
    }
  };

  const handleClearLocation = () => {
    setFilledLocation(null);
    setQuery("");
    onSelectRef.current?.({
      address: "", city: "", state: "",
      pincode: "", latitude: "", longitude: "",
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-white/20 bg-white/10 p-5 md:p-6"
    >
      <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
      <p className="mt-1 text-sm text-white/80">{subtitle}</p>

      {/* ── Name ── */}
      <div className="mt-4 grid gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-white/70">Franchise Name</label>
          <input
            name="name"
            value={franchiseForm.name}
            onChange={onChange}
            placeholder="e.g. Downtown Branch"
            required
            className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#5eead4]"
          />
        </div>
      </div>

      {/* ── Location search (hidden once location is filled) ── */}
      {!filledLocation && (
        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-white/70">
            Search &amp; select location
          </label>
          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-[#5eead4]/50 bg-white/15 px-3 py-1 focus-within:border-[#5eead4]">
              <svg className="h-4 w-4 shrink-0 text-[#5eead4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm0 0v9m-4-9a4 4 0 118 0c0 3.5-4 7-4 7s-4-3.5-4-7z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder={mapsReady ? "Search city, area or full address…" : "Loading Maps…"}
                disabled={!mapsReady}
                className="flex-1 bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-white/50 disabled:opacity-50"
              />
              {loadingPlace && (
                <svg className="h-4 w-4 animate-spin text-[#5eead4]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
            </div>

            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/20 bg-[#0f2e1a]/95 shadow-xl backdrop-blur-md">
                {suggestions.map((s, i) => {
                  const pred      = s.placePrediction;
                  const main      = pred.mainText?.toString() ?? "";
                  const secondary = pred.secondaryText?.toString() ?? "";
                  return (
                    <li
                      key={pred.placeId ?? i}
                      onMouseDown={() => handleSelectSuggestion(s)}
                      className="flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm text-white hover:bg-white/10"
                    >
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5eead4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm0 0v9m-4-9a4 4 0 118 0c0 3.5-4 7-4 7s-4-3.5-4-7z" />
                      </svg>
                      <div className="min-w-0">
                        <span className="font-medium">{main}</span>
                        {secondary && <span className="ml-1 text-white/55">{secondary}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <p className="mt-1 text-xs text-white/50">
            Search a specific street or area to get the pincode too.
          </p>
        </div>
      )}

      {/* ── Filled location preview card ── */}
      {filledLocation && (
        <div className="mt-4 rounded-lg border border-[#5eead4]/30 bg-[#5eead4]/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-medium text-[#5eead4]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Location selected
            </p>
            <button
              type="button"
              onClick={handleClearLocation}
              className="text-xs text-white/40 underline hover:text-white/70"
            >
              Change
            </button>
          </div>

          <div className="grid gap-x-4 gap-y-2 md:grid-cols-2">
            <div>
              <p className="text-xs text-white/50">Address</p>
              <p className="text-sm text-white">{filledLocation.address || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">City</p>
              <p className="text-sm text-white">{filledLocation.city || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">State</p>
              <p className="text-sm text-white">{filledLocation.state || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Pincode</p>
              <p className="text-sm text-white">{filledLocation.pincode || "—"}</p>
            </div>
          </div>

          {!filledLocation.pincode && (
            <p className="mt-2 text-xs text-amber-300/80">
              ⚠ No pincode found. Try a more specific address like a street or area name.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isCreating}
        className="mt-4 w-full rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2.5 text-sm font-semibold text-[#0f2e1a] hover:opacity-90 disabled:opacity-60"
      >
        {isCreating ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default CreateFranchiseForm;