import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaEye,
  FaBullseye,
  FaSeedling,
  FaUsers,
  FaHeart,
  FaLeaf,
  FaBullhorn,
  FaQuoteLeft,
  FaAward,
  FaMapMarkerAlt,
  FaStar,
  FaCrown,
  FaFilePdf
} from "react-icons/fa";
import PdfViewerModal from "../components/PdfViewerModal";
import { fetchAboutPage, defaultAboutPages } from "../api/client";

export default function VisionMission() {
  const [selectedPdf, setSelectedPdf] = useState(null);
  const defaultPage = defaultAboutPages["vision-mission"];

  const getLocalData = () => {
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        const candidate = parsed?.["vision-mission"] || parsed?.data?.["vision-mission"];
        if (candidate && candidate.content) {
          // If cached data contains the old placeholder title, use the new defaultPage
          if (candidate.content.vision?.title === "Empowerment towards Prosperity & Peace") {
            return defaultPage;
          }
          return candidate;
        }
      }
    } catch {}
    return defaultPage;
  };

  const [pageData, setPageData] = useState(getLocalData);

  useEffect(() => {
    let active = true;
    fetchAboutPage("vision-mission").then((res) => {
      if (active && res && res.data) {
        const target = res.data.slug ? res.data : (res.data["vision-mission"] || res.data);
        if (target && target.content) {
          if (target.content.vision?.title === "Empowerment towards Prosperity & Peace") {
            setPageData(defaultPage);
          } else {
            setPageData(target);
          }
        }
      }
    });

    const updateData = () => {
      setPageData(getLocalData());
    };

    window.addEventListener("alertngo_about_pages_updated", updateData);
    window.addEventListener("storage", updateData);
    return () => {
      active = false;
      window.removeEventListener("alertngo_about_pages_updated", updateData);
      window.removeEventListener("storage", updateData);
    };
  }, []);

  const d = defaultPage;
  const content = pageData?.content || d.content;
  const vision = content?.vision || d.content.vision;
  const mission = content?.mission || d.content.mission;
  const statsSection = content?.stats || d.content.stats;
  const beliefsSection = content?.beliefs || d.content.beliefs;
  const approachSection = content?.approach || d.content.approach;

  const visionImage = vision?.image !== undefined ? vision.image : "/uploads/cropped-12.jpg";
  const missionImage = mission?.image !== undefined ? mission.image : "/uploads/cropped-4.jpg";

  // Safe list extractions
  const statsList = Array.isArray(statsSection)
    ? statsSection
    : (Array.isArray(statsSection?.items) ? statsSection.items : (d.content.stats.items || []));

  const beliefsList = Array.isArray(beliefsSection)
    ? beliefsSection
    : (Array.isArray(beliefsSection?.items) ? beliefsSection.items : (d.content.beliefs.items || []));

  const approachTagsList = Array.isArray(approachSection?.tags)
    ? approachSection.tags
    : (typeof approachSection?.tags === "string" ? approachSection.tags.split(",").map(t => t.trim()).filter(Boolean) : (d.content.approach.tags || []));

  const statIcons = [<FaAward size={24} color="#F5A000" />, <FaUsers size={24} color="#38BDF8" />, <FaSeedling size={24} color="#3E8E0F" />, <FaMapMarkerAlt size={24} color="#D2190C" />, <FaLeaf size={24} color="#F5A000" />];
  const beliefIcons = [<FaEye size={20} color="#003190" />, <FaBullseye size={20} color="#D2190C" />, <FaSeedling size={20} color="#3E8E0F" />, <FaUsers size={20} color="#F5A000" />, <FaHeart size={20} color="#D2190C" />, <FaLeaf size={20} color="#3E8E0F" />, <FaBullhorn size={20} color="#003190" />, <FaAward size={20} color="#F5A000" />];

  return (
    <>
      <style>{`
        .vm-hero-section {
          padding-top: 140px;
          padding-bottom: 70px;
        }
        .vm-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: stretch;
          width: 100%;
          max-width: 100%;
        }
        .vm-card {
          border-radius: 32px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .vm-card-img {
          height: 260px;
        }
        .vm-card-content {
          padding: 40px;
          box-sizing: border-box;
          width: 100%;
        }
        .vm-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          width: 100%;
        }
        .vm-beliefs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          width: 100%;
        }
        .vm-approach-section {
          padding-top: 60px;
          padding-bottom: 90px;
          width: 100%;
        }
        .vm-approach-card {
          border-radius: 28px;
          padding: 56px;
          box-sizing: border-box;
          width: 100%;
        }

        @media (max-width: 900px) {
          .vm-hero-section {
            padding-top: 175px !important;
            padding-bottom: 40px !important;
          }
          .vm-grid-2col {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .vm-card {
            border-radius: 22px !important;
          }
          .vm-card-img {
            height: 200px !important;
          }
          .vm-card-content {
            padding: 24px 18px !important;
          }
          .vm-stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important;
            gap: 12px !important;
          }
          .vm-beliefs-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
            gap: 12px !important;
          }
          .vm-approach-section {
            padding-top: 36px !important;
            padding-bottom: 48px !important;
          }
          .vm-approach-card {
            border-radius: 20px !important;
            padding: 26px 16px !important;
          }
        }

        @media (max-width: 480px) {
          .vm-card-content {
            padding: 20px 14px !important;
          }
          .vm-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .vm-beliefs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ==================== HERO SECTION ==================== */}
      <section
        className="section-pad vm-hero-section"
        id="vision-mission"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%)",
          maxWidth: "100%"
        }}
      >
        {/* Background decoration */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -10, left: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(210, 25, 12, 0.06), transparent 60%)", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: -10, right: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(0, 49, 144, 0.05), transparent 60%)", borderRadius: "50%" }}></div>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 40px" }}
          >
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>{pageData?.badge || d.badge}</span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.85rem, 5vw, 3.2rem)", color: "var(--color-dark)", marginBottom: 18, lineHeight: 1.18 }}>
              {pageData?.title || d.title}
            </h1>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "1.05rem", margin: "0 auto 20px" }}>
              {pageData?.subtitle || d.subtitle}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() =>
                  setSelectedPdf({
                    file: content?.profile_pdf || pageData?.profile_pdf || "/uploads/Organizational-Profile-of-ALERT.pdf",
                    title: "Organizational Profile of ALERT",
                    meta: "Official Society Record • 20-Year Dossier",
                  })
                }
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 26px",
                  borderRadius: 500,
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #D2190C 0%, #b91c1c 100%)",
                  boxShadow: "0 10px 24px -4px rgba(210, 25, 12, 0.35)",
                  cursor: "pointer",
                  border: "none",
                  color: "#ffffff"
                }}
              >
                <FaFilePdf size={16} />
                <span>{content?.profile_pdf_label || pageData?.profile_pdf_label || "Download Official Profile PDF"}</span>
              </button>
            </div>
          </motion.div>

          {/* ==================== VISION | MISSION GRID ==================== */}
          <div className="vm-grid-2col">
            {/* VISION CARD */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="vm-card"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fdfdff 100%)",
                border: "1px solid #D2190C25",
                boxShadow: "0 30px 60px -15px rgba(210, 25, 12, 0.12)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "100%"
              }}
            >
            {/* Image */}
            {visionImage ? (
              <div className="vm-card-img" style={{ position: "relative", width: "100%", overflow: "hidden" }}>
                <img
                  src={visionImage}
                  alt={vision?.title || "ALERT Vision"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(210, 25, 12, 0.3) 100%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 24, zIndex: 2, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#F5A000", background: "rgba(255,255,255,0.92)", padding: "6px 14px", borderRadius: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {vision?.tag || "OUR VISION"}
                  </span>
                  {(vision?.subtitle || vision?.direction) && (
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#ffffff", background: "rgba(210, 25, 12, 0.88)", padding: "6px 14px", borderRadius: 500, backdropFilter: "blur(4px)" }}>
                      {vision.subtitle || vision.direction}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: "30px 40px 0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#D2190C", background: "rgba(210, 25, 12, 0.1)", padding: "6px 14px", borderRadius: 500 }}>
                  {vision?.tag || "OUR VISION"}
                </span>
                {(vision?.subtitle || vision?.direction) && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#b91c1c", background: "rgba(210, 25, 12, 0.08)", padding: "6px 12px", borderRadius: 500 }}>
                    {vision.subtitle || vision.direction}
                  </span>
                )}
              </div>
            )}

            {/* Content */}
            <div className="vm-card-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#D2190C", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 8px 18px rgba(210, 25, 12, 0.35)" }}>
                  <FaEye size={18} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#D2190C" }}>
                  {vision?.statement_label || "Vision Statement"}
                </span>
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--color-dark)", marginBottom: 14, lineHeight: 1.3 }}>
                {vision?.title || "Our Vision"}
              </h2>
              <div style={{ marginBottom: 22, padding: 18, background: "rgba(210, 25, 12, 0.06)", borderLeft: "4px solid #D2190C", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <FaQuoteLeft size={12} style={{ color: "#D2190C", marginTop: 2, opacity: 0.8, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.92rem", color: "var(--color-text)", fontStyle: "italic", lineHeight: 1.6, fontWeight: 500 }}>
                    "{vision?.quote || "An egalitarian society where tribal and marginalized communities live with sovereign dignity, social justice, and constitutional self-determination."}"
                  </span>
                </div>
              </div>
              <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.95rem", marginBottom: 26, flex: 1 }}>
                {vision?.desc || "ALERT envisions an inclusive and resilient society in which Adivasis and vulnerable forest hamlets govern their ancestral ecosystems through constitutional safeguards like PESA 1996 and RoFR 2006. We strive for an India where indigenous wisdom guides ecological conservation and every child accesses equitable quality education without losing their cultural roots."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                {(vision?.points || [
                  "Sovereignty over ancestral forest domains and community water resources.",
                  "Active constitutional legal aid protecting vulnerable indigenous families.",
                  "Empowered women cooperatives leading economic grassroots enterprises.",
                  "Intergenerational cultural preservation of language, music, and traditions."
                ]).map((h, i) => {
                  const label = typeof h === "object" && h !== null ? (h.title || h.name || h.label || h.desc || "") : String(h || "");
                  if (!label) return null;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "10px 14px",
                        background: "rgba(210, 25, 12, 0.04)",
                        border: "1px solid rgba(210, 25, 12, 0.12)",
                        borderRadius: 12
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "#D2190C",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          flexShrink: 0,
                          marginTop: 2
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-dark)", lineHeight: 1.5 }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ==================== MISSION CARD (RIGHT) ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="vm-card"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)",
              border: "1px solid #00319025",
              boxShadow: "0 30px 60px -15px rgba(0, 49, 144, 0.12)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}
          >
            {/* Image */}
            {missionImage ? (
              <div className="vm-card-img" style={{ position: "relative", width: "100%", overflow: "hidden" }}>
                <img
                  src={missionImage}
                  alt={mission?.title || "ALERT Mission"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(0, 49, 144, 0.3) 100%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 24, zIndex: 2, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#38BDF8", background: "rgba(255,255,255,0.92)", padding: "6px 14px", borderRadius: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {mission?.tag || "OUR MISSION"}
                  </span>
                  {(mission?.subtitle || mission?.mandate) && (
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#ffffff", background: "rgba(0, 49, 144, 0.88)", padding: "6px 14px", borderRadius: 500, backdropFilter: "blur(4px)" }}>
                      {mission.subtitle || mission.mandate}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: "30px 40px 0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#003190", background: "rgba(0, 49, 144, 0.1)", padding: "6px 14px", borderRadius: 500 }}>
                  {mission?.tag || "OUR MISSION"}
                </span>
                {(mission?.subtitle || mission?.mandate) && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#003190", background: "rgba(0, 49, 144, 0.08)", padding: "6px 12px", borderRadius: 500 }}>
                    {mission.subtitle || mission.mandate}
                  </span>
                )}
              </div>
            )}

            <div className="vm-card-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#003190", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 8px 18px rgba(0, 49, 144, 0.35)" }}>
                  <FaBullseye size={18} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#003190" }}>
                  {mission?.statement_label || "Mission Statement"}
                </span>
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--color-dark)", marginBottom: 14, lineHeight: 1.3 }}>
                {mission?.title || "Our Mission"}
              </h2>
              <div style={{ marginBottom: 22, padding: 18, background: "rgba(0, 49, 144, 0.06)", borderLeft: "4px solid #003190", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <FaQuoteLeft size={12} style={{ color: "#003190", marginTop: 2, opacity: 0.8, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.92rem", color: "var(--color-text)", fontStyle: "italic", lineHeight: 1.6, fontWeight: 500 }}>
                    "{mission?.quote || "Mobilizing communities, defending constitutional land tenure, and fostering sustainable indigenous livelihoods through collaborative grassroots action."}"
                  </span>
                </div>
              </div>
              <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.95rem", marginBottom: 26, flex: 1 }}>
                {mission?.desc || "To educate, organize, and legally support tribal and forest-dwelling communities across Andhra Pradesh to claim their statutory rights under the Forest Rights Act 2006 and LARR Act 2013, while pioneering sustainable solar electrification and women-led cooperative enterprises."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: "auto" }}>
                {(mission?.pillars || [
                  "Rights Enforcement",
                  "Grassroots Organizing",
                  "Sustainable Livelihoods",
                  "Emergency Relief & Energy"
                ]).map((h, i) => {
                  const label = typeof h === "object" && h !== null ? (h.title || h.name || h.label || h.desc || "") : String(h || "");
                  if (!label) return null;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "rgba(0, 49, 144, 0.05)",
                        border: "1px solid rgba(0, 49, 144, 0.16)",
                        borderRadius: 12
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "#003190",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          flexShrink: 0
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#003190", lineHeight: 1.4 }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
          </div> {/* close grid */}
        </div>
      </section>

      {/* ==================== IMPACT STATS ==================== */}
      <section style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 60px" }}>
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>{statsSection?.badge || "Our Impact"}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 16 }}>
              {statsSection?.title || "Numbers That Speak"}
            </h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "1.05rem", margin: 0 }}>
              {statsSection?.subtitle || "Two decades of grassroots work across the Fifth Scheduled Areas of Andhra Pradesh — measured in lives touched, rights secured, and communities empowered."}
            </p>
          </div>
          <div className="vm-stats-grid">
            {statsList.map((s, i) => {
              const accentColor = (typeof s === "object" && s?.color) ? s.color : "#F5A000";
              const iconEl = statIcons[i % statIcons.length];
              const numStr = typeof s === "object" && s !== null ? (typeof s.num === "object" ? (s.num?.title || s.num?.num || "") : (s.num ?? "")) : String(s || "");
              const labelStr = typeof s === "object" && s !== null ? (typeof s.label === "object" ? s.label?.title : (s.label || s.title || "")) : "";
              const descStr = typeof s === "object" && s !== null ? (typeof s.desc === "object" ? s.desc?.desc : (s.desc || "")) : "";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  style={{
                    padding: "32px 24px",
                    background: "linear-gradient(145deg, #ffffff 0%, #fdfdff 100%)",
                    borderRadius: 24,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
                    border: `1px solid ${accentColor}15`,
                    textAlign: "center",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  whileHover={{
                    y: -8,
                    boxShadow: `0 30px 60px -15px ${accentColor}25`,
                    borderColor: accentColor
                  }}
                >
                  <div style={{ position: "absolute", top: -40, left: -40, width: 120, height: 120, background: `radial-gradient(circle, ${accentColor}20, transparent 70%)`, borderRadius: "50%", zIndex: 0, pointerEvents: "none" }} />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: accentColor, boxShadow: `0 8px 18px ${accentColor}20` }}>
                      {iconEl}
                    </div>
                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-dark)", lineHeight: 1, marginBottom: 10, fontFamily: "var(--font-serif)", display: "block" }}>{numStr}</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 6 }}>{labelStr}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-light)", lineHeight: 1.4, fontWeight: 500 }}>{descStr}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== CORE BELIEFS ==================== */}
      <section style={{ paddingTop: 90, paddingBottom: 40, background: "#ffffff" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>{beliefsSection?.badge || "Core Beliefs"}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 16 }}>
              {beliefsSection?.title || "What We Stand For"}
            </h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "1.05rem", margin: 0 }}>
              {beliefsSection?.subtitle || "ALERT's work is anchored in these core beliefs that shape every project, partnership, and policy advocacy we undertake."}
            </p>
          </div>
          <div className="vm-beliefs-grid">
            {beliefsList.map((item, i) => {
              const iconEl = beliefIcons[i % beliefIcons.length];
              const titleStr = typeof item === "object" && item !== null ? (typeof item.title === "object" ? item.title?.title : (item.title || item.name || "")) : String(item || "");
              const descStr = typeof item === "object" && item !== null ? (typeof item.desc === "object" ? item.desc?.desc : (item.desc || "")) : "";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  style={{ background: "#ffffff", padding: 26, borderRadius: 20, boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.3s ease" }}
                  whileHover={{ y: -6, boxShadow: "var(--shadow-md)", borderColor: "var(--color-primary)" }}
                >
                  <div style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: 14, background: "rgba(210, 25, 12, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "var(--color-primary)", overflow: "hidden" }}>
                    {iconEl}
                  </div>
                  <h4 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: 8, fontSize: "0.95rem" }}>{titleStr}</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-light)", lineHeight: 1.5, margin: 0 }}>{descStr}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== APPROACH CARD ==================== */}
      <section className="vm-approach-section" style={{ textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 740, margin: "0 auto" }}>
          <div className="vm-approach-card" style={{ background: "linear-gradient(135deg, var(--color-dark) 0%, #0E2B66 100%)", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 30% 20%, rgba(245,160,0,0.15), transparent 50%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <span style={{ color: "#F5A000", fontWeight: 800, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 2, marginBottom: 16, display: "block" }}>
                {approachSection?.badge || "Our Approach"}
              </span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 4vw, 2.5rem)", marginBottom: 22, lineHeight: 1.3 }}>
                {approachSection?.title || "From Rights to Resilience"}
              </h2>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: 28, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                {approachSection?.desc || "ALERT follows a rights-based development approach: we awaken communities to their constitutional entitlements, sensitize duty-bearers to their obligations, organize Gram Sabhas into collective decision-making bodies, and mobilize resources for sustainable forest rights, land justice, and livelihood security."}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {approachTagsList.map((t, i) => {
                  const tagStr = typeof t === "object" && t !== null ? (t.title || t.name || t.label || "") : String(t || "");
                  return (
                    <span key={i} style={{ padding: "8px 16px", border: i === 0 ? "1px solid rgba(245,160,0,0.4)" : "1px solid rgba(255,255,255,0.3)", borderRadius: 500, color: i === 0 ? "#F5A000" : "white", fontSize: "0.8rem", fontWeight: 700, background: i === 0 ? "rgba(245,160,0,0.1)" : "rgba(255,255,255,0.05)" }}>
                      {tagStr}
                    </span>
                  );
                })}
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
