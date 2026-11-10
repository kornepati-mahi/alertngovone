import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaBalanceScale,
  FaEye,
  FaUsers,
  FaStar,
  FaAward,
  FaHeart,
  FaCrown,
  FaQuoteLeft,
  FaMapMarkerAlt,
  FaLeaf,
  FaBullseye,
  FaCheckCircle,
  FaHandHoldingHeart,
  FaHandsHelping,
  FaSun
} from "react-icons/fa";
import PdfViewerModal from "../components/PdfViewerModal";
import { fetchAboutPage, defaultAboutPages } from "../api/client";

const ICON_MAP = {
  FaShieldAlt,
  FaBalanceScale,
  FaEye,
  FaUsers,
  FaStar,
  FaAward,
  FaHeart,
  FaCrown,
  FaLeaf,
  FaBullseye,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaHandHoldingHeart,
  FaHandsHelping,
  FaSun
};

export default function CoreValues() {
  const [selectedPdf, setSelectedPdf] = useState(null);

  const defaultCoreValues = defaultAboutPages["core-values"] || {
    badge: "Section 02",
    title: "Core Values",
    subtitle: "The principles that guide every ALERT intervention — from forest rights to land rehabilitation, from women's cooperatives to disaster relief.",
    banner_image: null,
    content: {
      values: [],
      manifesto_badge: "Our Manifesto",
      manifesto_title: "Values in Action",
      manifesto_desc: "These seven values are not just words on a page — they are lived every day in the field.",
      manifesto_tags: ["Integrity", "Accountability", "Transparency", "Gender Justice", "Professionalism", "Excellence", "Empathy"]
    }
  };

  const getLocalCoreValuesData = () => {
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed["core-values"]) {
          return {
            ...defaultCoreValues,
            ...parsed["core-values"],
            content: {
              ...(defaultCoreValues.content || {}),
              ...(parsed["core-values"].content || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn("Failed to load local core values data", e);
    }
    return defaultCoreValues;
  };

  const [pageData, setPageData] = useState(getLocalCoreValuesData);

  useEffect(() => {
    let mounted = true;
    const loadFromApi = async () => {
      try {
        const res = await fetchAboutPage("core-values");
        if (mounted && res) {
          const item = res.data || res;
          if (item && item.slug === "core-values") {
            setPageData((prev) => ({
              ...prev,
              ...item,
              content: {
                ...(defaultCoreValues.content || {}),
                ...(item.content || item.content_json ? (typeof item.content === 'object' ? item.content : JSON.parse(item.content_json || '{}')) : {})
              }
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch core values from API, using fallback", err);
      }
    };

    loadFromApi();

    const handleUpdate = () => {
      setPageData(getLocalCoreValuesData());
      loadFromApi();
    };

    window.addEventListener("alertngo_about_pages_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("alertngo_about_pages_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const content = pageData?.content || {};
  const valuesList = Array.isArray(content.values) && content.values.length > 0
    ? content.values
    : (defaultCoreValues.content?.values || []);

  const manifestoBadge = content.manifesto_badge || "Our Manifesto";
  const manifestoTitle = content.manifesto_title || "Values in Action";
  const manifestoDesc = content.manifesto_desc || "These seven values are not just words on a page — they are lived every day in the field. From the Gram Sabha meetings in agency mandals to the courtrooms defending forest rights, from the women's cooperative meetings to the disaster relief operations, ALERT's values shape every decision, every relationship, and every outcome.";
  
  const manifestoTags = Array.isArray(content.manifesto_tags)
    ? content.manifesto_tags
    : (typeof content.manifesto_tags === "string" && content.manifesto_tags.trim()
        ? content.manifesto_tags.split(",").map(t => t.trim()).filter(Boolean)
        : valuesList.map(v => v.title).filter(Boolean));

  const renderIcon = (iconName, accent) => {
    const IconComp = ICON_MAP[iconName] || FaShieldAlt;
    return <IconComp size={26} color={accent || "#D2190C"} />;
  };

  return (
    <>
      <style>{`
        .cv-hero-section {
          padding-top: 140px;
          padding-bottom: 0;
        }
        .cv-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          gap: 24px;
          margin-bottom: 90px;
          width: 100%;
        }
        .cv-value-card {
          border-radius: 28px;
          padding: 36px;
          box-sizing: border-box;
          width: 100%;
        }
        .cv-manifesto-section {
          padding-top: 80px;
          padding-bottom: 90px;
          background: #ffffff;
          width: 100%;
        }
        .cv-manifesto-card {
          border-radius: 28px;
          padding: 52px 36px;
          box-sizing: border-box;
          width: 100%;
        }

        @media (max-width: 768px) {
          .cv-hero-section {
            padding-top: 175px !important;
          }
          .cv-values-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            margin-bottom: 50px !important;
          }
          .cv-value-card {
            padding: 22px 18px !important;
            border-radius: 20px !important;
          }
          .cv-manifesto-section {
            padding-top: 40px !important;
            padding-bottom: 50px !important;
          }
          .cv-manifesto-card {
            padding: 28px 18px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>

      {/* ==================== HERO SECTION ==================== */}
      <section
        id="core-values"
        className="cv-hero-section"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%)",
          maxWidth: "100%"
        }}
      >
        {/* Background decoration */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -10, left: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(210, 25, 12, 0.06), transparent 70%)", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: -10, right: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(0, 49, 144, 0.05), transparent 70%)", borderRadius: "50%" }}></div>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 40px" }}
          >
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
              {pageData.badge || "Section 02"}
            </span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.85rem, 5vw, 3.2rem)", color: "var(--color-dark)", marginBottom: 18, lineHeight: 1.18 }}>
              {pageData.title || "Core Values"}
            </h1>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "1.05rem", margin: 0 }}>
              {pageData.subtitle || "The principles that guide every ALERT intervention — from forest rights to land rehabilitation, from women's cooperatives to disaster relief."}
            </p>
          </motion.div>

          {/* Optional Hero Banner Image */}
          {pageData.banner_image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ maxWidth: 840, margin: "0 auto 40px", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            >
              <img
                src={pageData.banner_image}
                alt={pageData.title || "Core Values"}
                style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </motion.div>
          )}

          {/* ==================== VALUES GRID ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="cv-values-grid"
          >
            {valuesList.map((value, i) => {
              const accentColor = value.accent || "#D2190C";
              const glowColor = `${accentColor}1A`; // ~10% opacity

              return (
                <motion.div
                  key={value.id || `val-${i}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.7 }}
                  whileHover={{ y: -8, boxShadow: `0 30px 60px -15px ${accentColor}25`, borderColor: accentColor }}
                  className="cv-value-card"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #fdfdff 100%)",
                    border: `1px solid ${accentColor}20`,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Top accent glow */}
                  <div style={{ position: "absolute", top: -40, left: -40, width: 120, height: 120, background: `radial-gradient(circle, ${glowColor}, transparent 70%)`, borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />

                  {/* Optional Card Image */}
                  {value.image && (
                    <div style={{ height: 140, borderRadius: 16, overflow: "hidden", marginBottom: 20, position: "relative", zIndex: 2 }}>
                      <img
                        src={value.image}
                        alt={value.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                  )}

                  {/* Icon */}
                  <div style={{ position: "relative", zIndex: 2, width: 52, height: 52, borderRadius: 14, background: `${accentColor}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: accentColor, boxShadow: `0 8px 18px ${accentColor}20` }}>
                    {renderIcon(value.icon, accentColor)}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3, position: "relative", zIndex: 2 }}>
                    {value.title}
                  </h3>

                  {/* Quote */}
                  {value.quote && (
                    <div style={{ position: "relative", zIndex: 2, marginBottom: 16, padding: 14, background: `${accentColor}0A`, borderLeft: `4px solid ${accentColor}`, borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <FaQuoteLeft size={12} style={{ color: accentColor, marginTop: 2, opacity: 0.8, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.88rem", color: "var(--color-text)", fontStyle: "italic", lineHeight: 1.6 }}>"{value.quote}"</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p style={{ position: "relative", zIndex: 2, color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.92rem", marginBottom: 16, flex: 1 }}>
                    {value.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ==================== VALUES MANIFESTO ==================== */}
      <section className="cv-manifesto-section">
        <div className="container">
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div className="cv-manifesto-card" style={{ background: "linear-gradient(135deg, var(--color-dark) 0%, #0E2B66 100%)", color: "white", position: "relative", overflow: "hidden", textAlign: "center" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 30% 20%, rgba(245,160,0,0.15), transparent 50%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <span style={{ color: "#F5A000", fontWeight: 800, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 2, marginBottom: 16, display: "block" }}>
                  {manifestoBadge}
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", marginBottom: 20, lineHeight: 1.3 }}>
                  {manifestoTitle}
                </h2>
                <p style={{ fontSize: "0.98rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: 24, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
                  {manifestoDesc}
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {manifestoTags.map((v, i) => (
                    <span
                      key={i}
                      style={{ padding: "6px 14px", borderRadius: 500, fontSize: "0.78rem", fontWeight: 700, background: "rgba(245,160,0,0.12)", color: "#F5A000", border: "1px solid rgba(245,160,0,0.3)" }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
