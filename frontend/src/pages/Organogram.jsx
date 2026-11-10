import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaSitemap,
  FaFilePdf,
  FaShieldAlt,
  FaAward,
  FaLandmark,
  FaCrown,
  FaBalanceScale,
  FaHandshake,
  FaHandsHelping,
  FaCheckCircle,
  FaExpand,
  FaTimes,
  FaInfoCircle
} from "react-icons/fa";
import { fetchAboutPage, defaultAboutPages } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";

const ICON_MAP = {
  FaUsers,
  FaSitemap,
  FaShieldAlt,
  FaAward,
  FaLandmark,
  FaCrown,
  FaBalanceScale,
  FaHandshake,
  FaHandsHelping,
  FaCheckCircle
};

const defaultOrganogram = defaultAboutPages["organogram"] || {
  slug: "organogram",
  badge: "Section 04",
  title: "Organogram",
  subtitle: "The democratic governance hierarchy of ALERT — from the sovereign General Body down to grassroots Gram Sabhas and field operational cells.",
  banner_image: null,
  content: {}
};

function getLocalOrganogramData() {
  try {
    const raw = localStorage.getItem("alertngo_about_pages");
    if (raw) {
      const parsed = JSON.parse(raw);
      const dataMap = parsed?.data && typeof parsed.data === "object" && !parsed["organogram"] ? parsed.data : parsed;
      const candidate = dataMap?.["organogram"];
      if (candidate) {
        const candidateContent = candidate.content || (candidate.content_json ? JSON.parse(candidate.content_json) : {});
        const wings = Array.isArray(candidateContent.organogram_wings) && candidateContent.organogram_wings.length > 0
          ? candidateContent.organogram_wings
          : (dataMap?.["about"]?.content?.organogram_wings || defaultAboutPages["about"]?.content?.organogram_wings || defaultOrganogram.content?.organogram_wings || []);

        return {
          ...defaultOrganogram,
          ...candidate,
          content: {
            ...(defaultOrganogram.content || {}),
            ...candidateContent,
            organogram_wings: wings
          }
        };
      }
    }
  } catch (err) {
    console.warn("Could not read local organogram data:", err);
  }
  return defaultOrganogram;
}

export default function Organogram() {
  const [pageData, setPageData] = useState(getLocalOrganogramData);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [zoomImage, setZoomImage] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      // 1. Immediately read from localStorage
      const localData = getLocalOrganogramData();
      if (isMounted && localData) {
        setPageData(localData);
      }

      // 2. Fetch from backend API
      try {
        const res = await fetchAboutPage("organogram");
        const page = res?.data || res;
        if (isMounted && page && (page.slug === "organogram" || page.title || page.content)) {
          const parsedContent = page.content || (page.content_json ? JSON.parse(page.content_json) : {});
          setPageData((prev) => {
            const mergedContent = {
              ...(defaultOrganogram.content || {}),
              ...(prev.content || {}),
              ...parsedContent
            };
            if (Array.isArray(parsedContent?.levels)) {
              mergedContent.levels = parsedContent.levels;
            }
            if (Array.isArray(parsedContent?.organogram_wings)) {
              mergedContent.organogram_wings = parsedContent.organogram_wings;
            } else if (!mergedContent.organogram_wings) {
              mergedContent.organogram_wings = prev.content?.organogram_wings || defaultAboutPages["about"]?.content?.organogram_wings || defaultOrganogram.content?.organogram_wings;
            }
            return {
              ...defaultOrganogram,
              ...prev,
              ...page,
              content: mergedContent
            };
          });
        }
      } catch (err) {
        console.warn("Could not load organogram data:", err);
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

  const content = pageData?.content || defaultOrganogram.content || {};
  const levels = Array.isArray(content.levels) ? content.levels : (defaultOrganogram.content?.levels || []);

  const renderIcon = (iconName, accent = "#D2190C", size = 22) => {
    const Component = ICON_MAP[iconName] || FaSitemap;
    return <Component size={size} color={accent} />;
  };

  return (
    <>
      <style>{`
        .organogram-chart-card {
          background: linear-gradient(145deg, #ffffff 0%, #fdfdff 100%);
          border: 1px solid #f1f5f9;
          border-radius: 32px;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          margin-bottom: 70px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
        }
        .organogram-chart-container {
          position: relative;
          width: 100%;
          background: #f8fafc;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .organogram-chart-img {
          width: 100%;
          height: auto;
          max-height: 540px;
          object-fit: contain;
          object-position: center;
          display: block;
        }
        .organogram-expand-pill {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 2;
          background: rgba(15, 23, 42, 0.85);
          color: #ffffff;
          border-radius: 30px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          backdrop-filter: blur(6px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .organogram-chart-footer {
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          padding: 16px 24px;
          box-sizing: border-box;
        }
        .organogram-footer-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #003190;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .organogram-footer-title {
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #003190;
          display: block;
          margin-bottom: 3px;
        }
        .organogram-footer-desc {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.45;
        }

        @media (max-width: 768px) {
          .organogram-hero-section {
            padding-top: 175px !important;
          }
          .organogram-chart-card {
            border-radius: 20px !important;
            margin-bottom: 36px !important;
          }
          .organogram-chart-container {
            padding: 14px 8px !important;
          }
          .organogram-chart-img {
            max-height: 380px !important;
          }
          .organogram-expand-pill {
            top: 10px !important;
            right: 10px !important;
            padding: 5px 10px !important;
            font-size: 0.7rem !important;
            gap: 5px !important;
          }
          .organogram-chart-footer {
            padding: 12px 14px !important;
          }
          .organogram-footer-icon {
            width: 26px !important;
            height: 26px !important;
          }
          .organogram-footer-title {
            font-size: 0.75rem !important;
          }
          .organogram-footer-desc {
            font-size: 0.72rem !important;
            line-height: 1.35 !important;
          }
        }
      `}</style>
      {/* ==================== HERO SECTION ==================== */}
      <section
        id="organogram"
        className="organogram-hero-section"
        style={{
          paddingTop: 160,
          paddingBottom: 0,
          position: "relative",
          overflow: "hidden",
          background: pageData.banner_image
            ? `linear-gradient(rgba(10, 20, 40, 0.78), rgba(10, 20, 40, 0.88)), url("${pageData.banner_image}") center/cover no-repeat`
            : "linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%)",
          color: pageData.banner_image ? "#ffffff" : "inherit"
        }}
      >
        {/* Background decoration (when no custom banner image) */}
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
            style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 70px" }}
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
              {pageData.badge || "Section 04"}
            </span>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.85rem, 5vw, 3.2rem)",
                color: pageData.banner_image ? "#ffffff" : "var(--color-dark)",
                marginBottom: 18,
                lineHeight: 1.18
              }}
            >
              {pageData.title || "Organogram"}
            </h1>
            <p
              style={{
                color: pageData.banner_image ? "rgba(255,255,255,0.9)" : "var(--color-text-light)",
                lineHeight: 1.75,
                fontSize: "1.05rem",
                margin: 0
              }}
            >
              {pageData.subtitle ||
                "The democratic governance hierarchy of ALERT — from the sovereign General Body down to grassroots Gram Sabhas and field operational cells."}
            </p>
          </motion.div>

          {/* ==================== ORGANOGRAM IMAGE CARD ==================== */}
          {content.chart_image && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="organogram-chart-card"
              whileHover={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.14)", borderColor: "#003190" }}
              onClick={() => setZoomImage(true)}
            >
              <div className="organogram-chart-container">
                <img
                  src={content.chart_image}
                  alt="ALERT Organogram Chart"
                  className="organogram-chart-img"
                  loading="lazy"
                  decoding="async"
                />

                {/* Expand Pill */}
                <div className="organogram-expand-pill">
                  <FaExpand size={11} />
                  <span>Click to Enlarge</span>
                </div>
              </div>

              {/* Card Caption / Meta (positioned below image so it never blocks the diagram) */}
              <div className="organogram-chart-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="organogram-footer-icon">
                    <FaSitemap size={14} />
                  </div>
                  <div>
                    <span className="organogram-footer-title">
                      {content.chart_badge || "ALERT Governance Structure"}
                    </span>
                    <div className="organogram-footer-desc">
                      {content.chart_desc ||
                        "Click or tap to view the full organizational chart showing reporting lines from General Body to field operational cells."}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== HIERARCHY LEVELS ==================== */}
          <section style={{ paddingTop: 0, paddingBottom: 80 }}>
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
              <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
                {content.levels_badge || "Governance Levels"}
              </span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 16 }}>
                {content.levels_title || "Five-Tier Governance Structure"}
              </h2>
              <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "1.05rem", margin: 0 }}>
                {content.levels_subtitle ||
                  "ALERT follows a democratic, bottom-up governance model where authority flows from the community level up to the General Body."}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
              {levels.map((level, i) => (
                <motion.div
                  key={level.level || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  style={{
                    background: "#ffffff",
                    padding: 26,
                    borderRadius: 20,
                    boxShadow: "var(--shadow-sm)",
                    border: `1px solid ${level.accent || "#D2190C"}25`,
                    borderTop: `4px solid ${level.accent || "#D2190C"}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    transition: "all 0.3s ease",
                    position: "relative"
                  }}
                  whileHover={{ y: -6, boxShadow: "0 14px 28px rgba(0,0,0,0.08)", borderColor: level.accent || "#D2190C" }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      minWidth: 48,
                      minHeight: 48,
                      borderRadius: 14,
                      background: `${level.accent || "#D2190C"}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0
                    }}
                  >
                    {renderIcon(level.icon, level.accent || "#D2190C", 22)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          color: level.accent || "#D2190C",
                          background: `${level.accent || "#D2190C"}15`,
                          padding: "3px 10px",
                          borderRadius: 500
                        }}
                      >
                        {level.level || `Level 0${i + 1}`}
                      </div>
                      <h4 style={{ fontWeight: 700, color: "var(--color-dark)", fontSize: "1.05rem", margin: 0 }}>
                        {level.title}
                      </h4>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-light)", lineHeight: 1.6 }}>
                      {level.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ==================== DOWNLOAD PDF ==================== */}
          {content.pdf_file && (
            <section style={{ textAlign: "center", marginTop: 10, paddingBottom: 60 }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPdf({
                      file: content.pdf_file,
                      title: content.pdf_title || "Organizational Profile of ALERT",
                      meta: content.pdf_meta || "Official Society Record • Governance Document"
                    })
                  }
                  className="btn-primary btn-responsive-pdf"
                >
                  <FaFilePdf size={14} /> {content.pdf_btn_label || "Download Governance Document PDF"}
                </button>
              </div>
            </section>
          )}
        </div>
      </section>

      {/* ==================== LIGHTBOX MODAL FOR ORGANOGRAM CHART ==================== */}
      <AnimatePresence>
        {zoomImage && content.chart_image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(15, 23, 42, 0.95)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              backdropFilter: "blur(8px)"
            }}
            onClick={() => setZoomImage(false)}
          >
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 24,
                display: "flex",
                alignItems: "center",
                gap: 12,
                zIndex: 10
              }}
            >
              <button
                type="button"
                onClick={() => setZoomImage(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  transition: "background 0.2s ease"
                }}
              >
                <FaTimes />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                maxWidth: "92vw",
                maxHeight: "86vh",
                overflow: "auto",
                background: "#ffffff",
                borderRadius: 16,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                padding: 16
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={content.chart_image}
                alt="ALERT Organogram Chart Zoomed"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: 8
                }}
              />
              <div style={{ marginTop: 12, textAlign: "center", color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
                {content.chart_badge || "ALERT Governance Structure"}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Modal */}
      {selectedPdf && (
        <PdfViewerModal
          file={selectedPdf.file}
          title={selectedPdf.title}
          meta={selectedPdf.meta}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </>
  );
}
