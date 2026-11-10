import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaCompass,
  FaTree,
  FaWater,
  FaBalanceScale,
  FaSearch,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaLayerGroup,
  FaMapMarkedAlt,
  FaInfoCircle
} from "react-icons/fa";
import { defaultOperationalRegions, defaultMapSettings } from "../data/defaultOperationalRegions";

export { defaultOperationalRegions, defaultMapSettings };

export default function AreaOfOperationExplorer({ customRegions, customMapSettings }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polygonsGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [internalRegions, setInternalRegions] = useState(() => {
    if (Array.isArray(customRegions) && customRegions.length > 0) return customRegions;
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        const mapRegs = parsed["area-of-operation"]?.content?.map_regions;
        if (Array.isArray(mapRegs) && mapRegs.length > 0) return mapRegs;
      }
    } catch { }
    return defaultOperationalRegions;
  });

  const [internalMapSettings, setInternalMapSettings] = useState(() => {
    if (customMapSettings && typeof customMapSettings === "object") return customMapSettings;
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        const ms = parsed["area-of-operation"]?.content?.map_settings;
        if (ms && typeof ms === "object") return ms;
      }
    } catch { }
    return {};
  });

  useEffect(() => {
    if (Array.isArray(customRegions) && customRegions.length > 0) {
      setInternalRegions(customRegions);
    }
  }, [customRegions]);

  useEffect(() => {
    if (customMapSettings && typeof customMapSettings === "object") {
      setInternalMapSettings(customMapSettings);
    }
  }, [customMapSettings]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const local = localStorage.getItem("alertngo_about_pages");
        if (local) {
          const parsed = JSON.parse(local);
          const mapRegs = parsed["area-of-operation"]?.content?.map_regions;
          if (Array.isArray(mapRegs) && mapRegs.length > 0) {
            setInternalRegions(mapRegs);
          }
          const ms = parsed["area-of-operation"]?.content?.map_settings;
          if (ms && typeof ms === "object") {
            setInternalMapSettings(ms);
          }
        }
      } catch { }
    };
    window.addEventListener("alertngo_about_pages_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("alertngo_about_pages_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const [selectedRegionId, setSelectedRegionId] = useState("all");
  const [selectedMandal, setSelectedMandal] = useState(null);
  const [searchMandal, setSearchMandal] = useState("");

  const activeRegions = selectedRegionId === "all"
    ? internalRegions
    : internalRegions.filter((r) => r.id === selectedRegionId);

  const allMandals = internalRegions.flatMap((r) =>
    (r.mandals || []).map((m) => ({ ...m, regionId: r.id, regionName: r.name, badgeColor: m.pinColor || r.badgeColor || r.color || "#003190" }))
  );

  const filteredMandals = activeRegions.flatMap((r) =>
    (r.mandals || [])
      .filter((m) =>
        (m.name || "").toLowerCase().includes(searchMandal.toLowerCase()) ||
        (m.fullName || "").toLowerCase().includes(searchMandal.toLowerCase()) ||
        (m.itda || "").toLowerCase().includes(searchMandal.toLowerCase()) ||
        (m.river || "").toLowerCase().includes(searchMandal.toLowerCase()) ||
        (m.actionTag || "").toLowerCase().includes(searchMandal.toLowerCase()) ||
        (m.activities || "").toLowerCase().includes(searchMandal.toLowerCase()) ||
        (r.name || "").toLowerCase().includes(searchMandal.toLowerCase())
      )
      .map((m) => ({ ...m, regionId: r.id, regionName: r.name, badgeColor: m.pinColor || r.badgeColor || r.color || "#003190" }))
  );

  const mapCenterLat = parseFloat(internalMapSettings?.map_center_lat) || 17.1;
  const mapCenterLng = parseFloat(internalMapSettings?.map_center_lng) || 81.45;
  const mapZoomLevel = parseFloat(internalMapSettings?.map_zoom) || 8.5;
  const mapTileUrl = internalMapSettings?.map_tile_url || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [mapCenterLat, mapCenterLng],
        zoom: mapZoomLevel,
        scrollWheelZoom: false,
        zoomControl: true
      });

      tileLayerRef.current = L.tileLayer(mapTileUrl, {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      polygonsGroupRef.current = L.layerGroup().addTo(map);
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer if tile url changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(mapTileUrl);
  }, [mapTileUrl]);

  // Render Overlays, Polygons & Permanent Labeled Pins with DYNAMIC COLORS
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !polygonsGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    const polygonsGroup = polygonsGroupRef.current;

    markersGroup.clearLayers();
    polygonsGroup.clearLayers();

    // 1. Draw Territory Highlights (Color-coded boundary overlays)
    internalRegions.forEach((reg) => {
      const isRegionActive = selectedRegionId === "all" || selectedRegionId === reg.id;
      if (!isRegionActive) return;

      const regColor = reg.badgeColor || reg.color || "#003190";

      if (Array.isArray(reg.polygonCoords) && reg.polygonCoords.length > 2) {
        const poly = L.polygon(reg.polygonCoords, {
          color: regColor,
          fillColor: regColor,
          fillOpacity: reg.id === "submergence" ? 0.35 : 0.18,
          weight: reg.id === selectedRegionId ? 3.5 : 2,
          dashArray: reg.id === "submergence" ? "6, 6" : null
        });

        const itdaText = Array.isArray(reg.itda) ? reg.itda.join(" • ") : (reg.itda || "");
        poly.bindTooltip(`<b>${reg.name}</b>${itdaText ? `<br/>${itdaText}` : ""}`, {
          sticky: true,
          direction: "top"
        });

        poly.on("click", () => {
          setSelectedRegionId(reg.id);
          if (reg.center && reg.zoom) {
            mapInstanceRef.current.flyTo(reg.center, reg.zoom, { duration: 1.2 });
          }
        });

        polygonsGroup.addLayer(poly);
      }
    });

    // 2. Draw Permanent Labeled Markers for every Mandal
    allMandals.forEach((mandal) => {
      const isRegionActive = selectedRegionId === "all" || selectedRegionId === mandal.regionId;
      if (!isRegionActive) return;
      if (!mandal.lat || !mandal.lng) return;

      const pinColor = mandal.badgeColor || "#003190";

      const customPin = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; cursor: pointer;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${pinColor}; opacity: 0.25; animation: pulse 2s infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: ${pinColor}; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([mandal.lat, mandal.lng], { icon: customPin });

      // PERMANENT VISIBLE NAME LABEL ABOVE PIN
      marker.bindTooltip(
        `<span style="color: ${pinColor}; font-weight: 800;">●</span> <strong>${mandal.name}</strong>`,
        {
          permanent: true,
          direction: "top",
          offset: [0, -12],
          className: "mandal-map-label"
        }
      );

      // Interactive Popup on Click
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 6px 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: ${pinColor}; color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
              ${mandal.itda || ""}
            </span>
          </div>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: #061842; margin: 2px 0 4px;">
            ${mandal.fullName || mandal.name}
          </h4>
          <div style="font-size: 0.8rem; color: #d97706; font-weight: 700; margin-bottom: 6px;">
            ${mandal.river || ""}
          </div>
          <p style="font-size: 0.82rem; color: #475569; line-height: 1.45; margin: 0 0 10px;">
            ${mandal.activities || ""}
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mandal.fullName || mandal.name}, Andhra Pradesh, India`)}"
            target="_blank"
            rel="noopener noreferrer"
            style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--color-primary); font-weight: 700; text-decoration: none;"
          >
            Open in Google Maps ↗
          </a>
        </div>
      `);

      marker.on("click", () => {
        setSelectedMandal(mandal);
        mapInstanceRef.current.flyTo([mandal.lat, mandal.lng], 11, { duration: 1.2 });
      });

      markersGroup.addLayer(marker);
    });
  }, [selectedRegionId, selectedMandal, internalRegions]);

  const handleSelectRegion = (regId) => {
    setSelectedRegionId(regId);
    setSelectedMandal(null);

    if (mapInstanceRef.current) {
      if (regId === "all") {
        mapInstanceRef.current.flyTo([mapCenterLat, mapCenterLng], mapZoomLevel, { duration: 1.4 });
      } else {
        const reg = internalRegions.find((r) => r.id === regId);
        if (reg && reg.center) {
          mapInstanceRef.current.flyTo(reg.center, reg.zoom || 10, { duration: 1.4 });
        }
      }
    }
  };

  const handleMandalClick = (mandal) => {
    setSelectedMandal(mandal);
    if (mapInstanceRef.current && mandal.lat && mandal.lng) {
      mapInstanceRef.current.flyTo([mandal.lat, mandal.lng], 12, { duration: 1.2 });
      const mapEl = document.getElementById("territory-map-viewport");
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const filterTabs = [
    { id: "all", label: "All Operational Belts" },
    ...internalRegions.map((r) => ({ id: r.id, label: r.shortName || r.name }))
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%", maxWidth: "100%" }}>
      <style>{`
        .aoo-explorer-card {
          background: white;
          padding: clamp(16px, 4vw, 32px);
          border-radius: 20px;
          box-shadow: var(--shadow-sm);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .aoo-key-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
          gap: 12px;
        }
        .aoo-leaflet-viewport {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .aoo-leaflet-map-canvas {
          width: 100%;
          height: 520px;
          z-index: 1;
        }
        .aoo-mandals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: 16px;
          width: 100%;
          max-width: 100%;
        }
        .aoo-filter-search-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
        }
        .aoo-search-box {
          position: relative;
          width: 100%;
          max-width: 320px;
          flex: 1 1 200px;
        }
        @media (max-width: 768px) {
          .aoo-explorer-card {
            padding: 18px 14px !important;
            border-radius: 16px !important;
          }
          .aoo-leaflet-viewport {
            border-radius: 16px !important;
          }
          .aoo-leaflet-map-canvas {
            height: 380px !important;
          }
          .aoo-key-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .aoo-mandals-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .aoo-search-box {
            max-width: 100%;
          }
        }
        @media (max-width: 480px) {
          .aoo-leaflet-map-canvas {
            height: 320px !important;
          }
        }
      `}</style>

      {/* HEADER CARD */}
      <div className="aoo-explorer-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669", fontWeight: 700 }}>
                {internalMapSettings?.map_badge || "Visual Territory Identification"}
              </span>
              <span style={{ fontSize: "0.82rem", color: "var(--color-text-light)" }}>
                Andhra Pradesh Fifth-Scheduled Agency Belt &amp; Coastal Belt
              </span>
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.35rem, 3vw, 2rem)", color: "var(--color-dark)", margin: 0, wordBreak: "break-word" }}>
              {internalMapSettings?.map_title || "ALERT Area of Operation: Identified Territories & Mandals"}
            </h3>
            <p style={{ color: "var(--color-text-light)", marginTop: 6, fontSize: "0.92rem", maxWidth: 760, lineHeight: 1.6 }}>
              {internalMapSettings?.map_subtitle ||
                "All 17 mandal stations and 4 operational jurisdictions are labeled and color-coded below. Click on any territory badge or mandal pin to inspect."}
            </p>
          </div>
        </div>

        {/* DYNAMIC COLOR-CODED IDENTIFICATION LEGEND BAR */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 }}>
            Territory Identification Key (Click to Highlight on Map):
          </div>
          <div className="aoo-key-grid">
            {internalRegions.map((reg) => {
              const regColor = reg.badgeColor || reg.color || "#003190";
              const isSelected = selectedRegionId === reg.id;
              const mandalsCount = (reg.mandals || []).length;
              const itdaText = Array.isArray(reg.itda) ? reg.itda.join(" • ") : (reg.itda || "");
              return (
                <div
                  key={reg.id}
                  onClick={() => handleSelectRegion(isSelected ? "all" : reg.id)}
                  style={{
                    background: isSelected ? `${regColor}15` : "#f8fafc",
                    border: `2px solid ${isSelected ? regColor : "#e2e8f0"}`,
                    borderLeft: `5px solid ${regColor}`,
                    borderRadius: 12,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    minWidth: 0
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: regColor, display: "inline-block", flexShrink: 0 }} />
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a", wordBreak: "break-word" }}>{reg.shortName || reg.name}</strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.35, wordBreak: "break-word" }}>
                    {mandalsCount > 0 ? `${mandalsCount} Mandals` : (reg.mandals ? String(reg.mandals) : "")}
                    {itdaText ? ` • ${itdaText}` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div className="aoo-filter-search-row">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: "100%" }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectRegion(tab.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: "0.78rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: selectedRegionId === tab.id ? "var(--color-primary)" : "#ffffff",
                color: selectedRegionId === tab.id ? "#ffffff" : "#475569",
                boxShadow: selectedRegionId === tab.id ? "0 4px 12px rgba(210, 25, 12, 0.25)" : "var(--shadow-sm)",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="aoo-search-box">
          <input
            type="text"
            placeholder="Search mandal or activity..."
            value={searchMandal}
            onChange={(e) => setSearchMandal(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px 8px 36px",
              borderRadius: 20,
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        </div>
      </div>

      {/* MAP VIEWPORT CONTAINER */}
      <div
        id="territory-map-viewport"
        className="aoo-leaflet-viewport"
      >
        {/* LEAFLET IDENTIFIED OVERLAY ENGINE */}
        <div>
          <div
            ref={mapContainerRef}
            className="aoo-leaflet-map-canvas"
          />
          <div style={{ padding: "12px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#64748b", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {internalRegions.map((reg) => {
                const regColor = reg.badgeColor || reg.color || "#003190";
                const count = (reg.mandals || []).length;
                return (
                  <span key={reg.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: regColor, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ wordBreak: "break-word" }}>{reg.shortName || reg.name} {count > 0 ? `(${count})` : ""}</span>
                  </span>
                );
              })}
            </div>
            <span style={{ fontSize: "0.74rem", lineHeight: 1.4 }}>💡 Every pin has its station name permanently labeled above it</span>
          </div>
        </div>
      </div>

      {/* DETAILED MANDAL GRID (CLICK TO SPOTLIGHT & FLY ON MAP) */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
          <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <FaCompass style={{ color: "var(--color-primary)" }} /> Field Mandals &amp; Ground Action
          </h4>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Showing {filteredMandals.length} active mandal stations • Click any card to fly to it on map
          </span>
        </div>

        <div className="aoo-mandals-grid">
          {filteredMandals.map((m, idx) => {
            const isSpotlight = selectedMandal?.id === m.id;
            const cardBadgeColor = m.badgeColor || "#10b981";
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleMandalClick(m)}
                style={{
                  background: isSpotlight ? "#f0fdf4" : "white",
                  borderRadius: 14,
                  padding: "clamp(14px, 3vw, 20px)",
                  boxShadow: isSpotlight ? "0 8px 24px rgba(16,185,129,0.2)" : "var(--shadow-sm)",
                  border: isSpotlight ? "2px solid #10b981" : "1px solid #f1f5f9",
                  borderLeft: `5px solid ${cardBadgeColor}`,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                  minWidth: 0
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                    <h5 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-dark)", margin: 0, display: "flex", alignItems: "center", gap: 6, wordBreak: "break-word" }}>
                      <FaMapMarkerAlt style={{ color: cardBadgeColor, fontSize: "0.9rem", flexShrink: 0 }} /> {m.fullName || m.name}
                    </h5>
                    {m.itda && (
                      <span style={{ fontSize: "0.72rem", background: "#f8fafc", color: "#64748b", padding: "2px 8px", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }}>
                        {m.itda}
                      </span>
                    )}
                  </div>
                  {m.river && (
                    <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 600, marginBottom: 8 }}>
                      {m.river}
                    </div>
                  )}
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)", lineHeight: 1.55, margin: 0, wordBreak: "break-word" }}>
                    {m.activities}
                  </p>
                </div>

                <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px dashed #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ color: cardBadgeColor, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <FaCheckCircle size={11} style={{ flexShrink: 0 }} /> {m.actionTag || "Community Mobilization"}
                  </span>
                  <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.78rem" }}>
                    Highlight on Map →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
