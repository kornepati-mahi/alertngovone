import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaTree,
  FaWater,
  FaCompass,
  FaLayerGroup,
  FaLandmark,
  FaUsers,
  FaBalanceScale,
  FaInfoCircle,
  FaCheckCircle
} from "react-icons/fa";
import { fetchAboutPage, defaultAboutPages } from "../api/client";
import AreaOfOperationExplorer from "../components/AreaOfOperationExplorer";

const ICON_MAP = {
  FaTree,
  FaWater,
  FaCompass,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaLandmark,
  FaUsers,
  FaBalanceScale
};

function renderTerritoryIcon(iconName, color = "#10b981", size = 24) {
  const Component = ICON_MAP[iconName] || FaMapMarkerAlt;
  return <Component size={size} color={color} />;
}

const defaultAreaOfOperation = defaultAboutPages["area-of-operation"] || {
  slug: "area-of-operation",
  badge: "Section 03",
  title: "Area of Operation",
  subtitle: "17 mandal stations and 4 operational jurisdictions across the Fifth-Scheduled Agency Belt and Coastal Krishna Belt of Andhra Pradesh.",
  banner_image: null,
  content: {}
};

function getLocalAreaOfOperationData() {
  try {
    const raw = localStorage.getItem("alertngo_about_pages");
    if (raw) {
      const parsed = JSON.parse(raw);
      const dataMap = parsed?.data && typeof parsed.data === "object" && !parsed["area-of-operation"] ? parsed.data : parsed;
      const candidate = dataMap?.["area-of-operation"];
      if (candidate) {
        const candidateContent = candidate.content || (candidate.content_json ? JSON.parse(candidate.content_json) : {});
        return {
          ...defaultAreaOfOperation,
          ...candidate,
          content: {
            ...(defaultAreaOfOperation.content || {}),
            ...candidateContent
          }
        };
      }
    }
  } catch (err) {
    console.warn("Could not read local area-of-operation data:", err);
  }
  return defaultAreaOfOperation;
}

export default function AreaOfOperation() {
  const [pageData, setPageData] = useState(getLocalAreaOfOperationData);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      // 1. Immediately read from localStorage
      const localData = getLocalAreaOfOperationData();
      if (isMounted && localData) {
        setPageData(localData);
      }

      // 2. Fetch from backend API
      try {
        const res = await fetchAboutPage("area-of-operation");
        const page = res?.data || res;
        if (isMounted && page && (page.slug === "area-of-operation" || page.title || page.content)) {
          const parsedContent = page.content || (page.content_json ? JSON.parse(page.content_json) : {});
          setPageData((prev) => {
            const mergedContent = {
              ...(defaultAreaOfOperation.content || {}),
              ...(prev.content || {}),
              ...parsedContent
            };
            if (Array.isArray(parsedContent?.regions)) {
              mergedContent.regions = parsedContent.regions;
            }
            if (Array.isArray(parsedContent?.map_regions)) {
              mergedContent.map_regions = parsedContent.map_regions;
            }
            return {
              ...defaultAreaOfOperation,
              ...prev,
              ...page,
              content: mergedContent
            };
          });
        }
      } catch (err) {
        console.warn("Could not load area-of-operation data:", err);
      }
    }
    loadData();

    const handleSync = () => loadData();
    window.addEventListener("alertngo_about_pages_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener("alertngo_about_pages_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const content = pageData?.content || defaultAreaOfOperation.content || {};
  const regionsList = Array.isArray(content.regions)
    ? content.regions
    : (defaultAreaOfOperation.content?.regions || []);

  const statItems = [
    { label: "Mandal Stations", val: content.mandals_count || "17 Mandals", icon: FaMapMarkerAlt, color: "#10b981" },
    { label: "Habitations Reached", val: content.habitations_count || "371+ Habitations", icon: FaUsers, color: "#003190" },
    { label: "Operational Belts", val: content.regions_count || "4 Operational Belts", icon: FaLayerGroup, color: "#D2190C" },
    { label: "Tribal Communities", val: content.tribes_count || "6 Communities", icon: FaTree, color: "#F5A000" }
  ];

  return (
    <>
      <style>{`
        .aoo-hero-section {
          padding-top: 150px;
          padding-bottom: 0;
          position: relative;
          overflow: hidden;
        }
        .aoo-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 50px;
        }
        .aoo-stat-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 20px 22px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 16px;
          box-sizing: border-box;
        }
        .aoo-summary-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px 30px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          margin-bottom: 50px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-sizing: border-box;
        }
        .aoo-regions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: 20px;
        }
        .aoo-region-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
        @media (max-width: 768px) {
          .aoo-hero-section {
            padding-top: 138px !important;
          }
          .aoo-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 30px !important;
          }
          .aoo-stat-card {
            padding: 14px 12px !important;
            gap: 10px !important;
            border-radius: 14px !important;
          }
          .aoo-summary-card {
            padding: 16px 14px !important;
            border-radius: 16px !important;
            margin-bottom: 30px !important;
            gap: 12px !important;
          }
          .aoo-regions-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .aoo-region-card {
            padding: 18px 16px !important;
            border-radius: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .aoo-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>
      {/* ==================== HERO SECTION ==================== */}
      <section
        id="area-of-operation"
        className="aoo-hero-section hero"
        style={{
          background: pageData.banner_image
            ? `linear-gradient(rgba(10, 20, 40, 0.78), rgba(10, 20, 40, 0.88)), url("${pageData.banner_image}") center/cover no-repeat`
            : "linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%)",
          color: pageData.banner_image ? "#ffffff" : "inherit"
        }}
      >
        {/* Background decoration */}
        {!pageData.banner_image && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: -10, left: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(210, 25, 12, 0.06), transparent 70%)", borderRadius: "50%" }}></div>
            <div style={{ position: "absolute", bottom: -10, right: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(0, 49, 144, 0.05), transparent 70%)", borderRadius: "50%" }}></div>
          </div>
        )}

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 40px" }}
          >
            <span
              className="badge"
              style={{
                marginBottom: 16,
                display: "inline-block",
                background: pageData.banner_image ? "rgba(255,255,255,0.18)" : undefined,
                color: pageData.banner_image ? "#ffffff" : undefined,
                border: pageData.banner_image ? "1px solid rgba(255,255,255,0.3)" : undefined
              }}
            >
              {pageData.badge || "Section 06"}
            </span>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.85rem, 5vw, 3.5rem)",
                color: pageData.banner_image ? "#ffffff" : "var(--color-dark)",
                marginBottom: 16,
                lineHeight: 1.15
              }}
            >
              {pageData.title || "Area of Operation"}
            </h1>
            <p
              style={{
                color: pageData.banner_image ? "rgba(255,255,255,0.9)" : "var(--color-text-light)",
                lineHeight: 1.7,
                fontSize: "clamp(0.92rem, 2vw, 1.1rem)",
                margin: 0
              }}
            >
              {pageData.subtitle ||
                "All 17 mandal stations and 4 operational jurisdictions across the Fifth-Scheduled Agency Belt and Coastal Krishna Belt of Andhra Pradesh — click any territory to inspect."}
            </p>
          </motion.div>

          {/* ==================== STATS METRICS GRID ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aoo-stats-grid"
          >
            {statItems.map((st, i) => {
              const IconComp = st.icon;
              return (
                <div
                  key={i}
                  className="aoo-stat-card"
                  style={{
                    border: `1px solid ${st.color}25`,
                    borderTop: `4px solid ${st.color}`
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${st.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: st.color,
                      flexShrink: 0
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, color: "#64748b" }}>
                      {st.label}
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {st.val}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* ==================== FIELDWORK SUMMARY CARD ==================== */}
          {content.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="aoo-summary-card"
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(0, 49, 144, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#003190",
                  flexShrink: 0,
                  marginTop: 2
                }}
              >
                <FaInfoCircle size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: "#003190" }}>
                  Geographic Fieldwork Overview
                </span>
                <p style={{ margin: "6px 0 0", color: "#475569", lineHeight: 1.7, fontSize: "0.94rem", wordBreak: "break-word" }}>
                  {content.summary}
                </p>
              </div>
            </motion.div>
          )}

          {/* ==================== OPERATIONAL BELTS CARDS ==================== */}
          {regionsList.length > 0 && (
            <section style={{ marginBottom: 60 }}>
              <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 36px" }}>
                <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>
                  Operational Jurisdictions
                </span>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", color: "var(--color-dark)", margin: 0 }}>
                  Strategic Field Belts &amp; Focal Mandates
                </h3>
              </div>

              <div className="aoo-regions-grid">
                {regionsList.map((reg, idx) => {
                  const regColor = reg.color || "#003190";
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, duration: 0.6 }}
                      className="aoo-region-card"
                      style={{
                        border: `1px solid ${regColor}25`,
                        borderTop: `4px solid ${regColor}`
                      }}
                      whileHover={{ y: -6, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)", borderColor: regColor }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: `${regColor}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: regColor,
                            flexShrink: 0
                          }}
                        >
                          {renderTerritoryIcon(reg.icon, regColor, 22)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--color-dark)", wordBreak: "break-word" }}>
                            {reg.name}
                          </h4>
                          {reg.mandals && (
                            <span style={{ fontSize: "0.72rem", color: regColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
                              {reg.mandals}
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>
                        {reg.focus}
                      </p>

                      {reg.tribes && (
                        <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 12, marginTop: "auto" }}>
                          <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                            Communities / Mandate:
                          </span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>
                            {reg.tribes}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </section>

      {/* ==================== INTERACTIVE MAP EXPLORER ==================== */}
      <section style={{ paddingBottom: 80 }}>
        <div className="container">
          <AreaOfOperationExplorer
            customRegions={content.map_regions}
            customMapSettings={content.map_settings}
          />
        </div>
      </section>
    </>
  );
}
