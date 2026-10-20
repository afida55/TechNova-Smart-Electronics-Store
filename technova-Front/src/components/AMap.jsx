import { useEffect, useRef, useState } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

export default function AMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geocoderRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const searchMarkerRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let destroyed = false;

    const initMap = async () => {
      try {
        // ==========================================
        // AMAP SECURITY CONFIGURATION
        // ==========================================

        window._AMapSecurityConfig = {
          securityJsCode:
            import.meta.env.VITE_AMAP_SECURITY_CODE,
        };

        console.log(
          "AMap Key exists:",
          !!import.meta.env.VITE_AMAP_KEY
        );

        console.log(
          "AMap Security Code exists:",
          !!import.meta.env.VITE_AMAP_SECURITY_CODE
        );

        console.log(
          "AMap Security Code length:",
          import.meta.env.VITE_AMAP_SECURITY_CODE?.length
        );

        // ==========================================
        // LOAD AMAP
        // ==========================================

        const AMap = await AMapLoader.load({
          key: import.meta.env.VITE_AMAP_KEY,
          version: "2.0",
          plugins: ["AMap.Geocoder"],
        });

        if (destroyed || !mapRef.current) {
          return;
        }

        // ==========================================
        // CREATE MAP
        // ==========================================

        const map = new AMap.Map(mapRef.current, {
          zoom: 13,
          center: [104.0668, 30.5728],
          viewMode: "2D",
        });

        mapInstanceRef.current = map;

        // ==========================================
        // TECHNOVA STORE MARKER
        // ==========================================

        const storeMarker = new AMap.Marker({
          position: [104.0668, 30.5728],
          title: "TechNova Electronics Store",
        });

        storeMarkerRef.current = storeMarker;

        map.add(storeMarker);

        // ==========================================
        // STORE INFO WINDOW
        // ==========================================

        const infoWindow = new AMap.InfoWindow({
          content: `
            <div style="padding: 8px 12px; min-width: 190px;">
              <strong>TechNova Electronics Store</strong>
              <br />
              <span style="color: #64748b;">
                Chengdu, China
              </span>
            </div>
          `,
          offset: new AMap.Pixel(0, -30),
        });

        storeMarker.on("click", () => {
          infoWindow.open(
            map,
            storeMarker.getPosition()
          );
        });

        // ==========================================
        // GEOCODER
        // ==========================================

        geocoderRef.current = new AMap.Geocoder({
          city: "成都",
        });
      } catch (error) {
        console.error("AMap failed to load:", error);
      }
    };

    initMap();

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      destroyed = true;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }

      geocoderRef.current = null;
      storeMarkerRef.current = null;
      searchMarkerRef.current = null;
    };
  }, []);

  // ==========================================
  // SEARCH LOCATION
  // ==========================================

  const handleSearch = () => {
    const keyword = searchText.trim();

    if (
      !keyword ||
      !geocoderRef.current ||
      !mapInstanceRef.current
    ) {
      return;
    }

    setSearching(true);

    geocoderRef.current.getLocation(
      keyword,
      (status, result) => {
        setSearching(false);

        // ========================================
        // SEARCH FAILED
        // ========================================

        if (
          status !== "complete" ||
          !result?.geocodes ||
          result.geocodes.length === 0
        ) {
          alert(
            "Location not found. Please try another search."
          );
          return;
        }

        // ========================================
        // GET LOCATION
        // ========================================

        const location =
          result.geocodes[0].location;

        if (!location) {
          alert(
            "Location could not be displayed."
          );
          return;
        }

        const map = mapInstanceRef.current;

        // ========================================
        // MOVE MAP
        // ========================================

        map.setCenter([
          location.lng,
          location.lat,
        ]);

        map.setZoom(15);

        // ========================================
        // REMOVE OLD SEARCH MARKER
        // ========================================

        if (searchMarkerRef.current) {
          map.remove(
            searchMarkerRef.current
          );

          searchMarkerRef.current = null;
        }

        // ========================================
        // CREATE SEARCH MARKER
        // ========================================

        const AMap = window.AMap;

        if (!AMap) {
          console.error("AMap is not available.");
          return;
        }

        const searchMarker = new AMap.Marker({
          position: location,
          title: keyword,
        });

        searchMarkerRef.current = searchMarker;

        map.add(searchMarker);

        // ========================================
        // SEARCH RESULT INFO WINDOW
        // ========================================

        const searchInfoWindow =
          new AMap.InfoWindow({
            content: `
              <div style="padding: 8px 12px; min-width: 220px;">
                <strong>${keyword}</strong>
                <br />
                <span style="color: #64748b;">
                  ${
                    result.geocodes[0]
                      .formattedAddress ||
                    "Address found"
                  }
                </span>
              </div>
            `,
            offset: new AMap.Pixel(0, -30),
          });

        searchInfoWindow.open(
          map,
          location
        );
      }
    );
  };

  // ==========================================
  // ENTER KEY SEARCH
  // ==========================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full">

      {/* ==========================================
          SEARCH
      =========================================== */}

      <div className="flex gap-2 mb-4">

        <input
          type="text"
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Search a location in Chengdu..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={
            searching ||
            !searchText.trim()
          }
          className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching
            ? "Searching..."
            : "Search"}
        </button>

      </div>

      {/* ==========================================
          MAP
      =========================================== */}

      <div
        ref={mapRef}
        className="w-full h-[420px] rounded-2xl overflow-hidden"
      />

    </div>
  );
}