import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWater,
  FaMapMarkedAlt,
  FaClock,
  FaShip,
  FaArrowRight,
  FaEdit,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaTable,
  FaImages,
  FaSlidersH,
  FaChartBar,
  FaTimes
} from "react-icons/fa";
import { fetchFloodReliefPageBySlug } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";
import FieldVideosSection from "../components/FieldVideosSection";
import { DEFAULT_STATS_BY_SLUG, renderStatIcon } from "../utils/statIcons";

const defaultImages = [
  { src: "/uploads/PHOTO-2022-10-20-17-25-29-2-1024x461-640x480.jpg", alt: "Flood Relief 2022", caption: "Solar Lanterns Distribution – 2022" },
  { src: "/uploads/PHOTO-2022-10-20-17-25-30-1024x461-640x480.jpg", alt: "Flood Relief 2022", caption: "Relief Materials Distribution" },
  { src: "/uploads/PHOTO-2022-10-20-17-25-30-1-1024x461-640x480.jpg", alt: "Flood Relief 2022", caption: "Community Support" },
  { src: "/uploads/PHOTO-2022-10-20-17-25-30-2-1024x461-640x480.jpg", alt: "Flood Relief 2022", caption: "Boat Rescue Operations" },
  { src: "/uploads/PHOTO-2022-10-20-17-25-31-1024x461-640x480.jpg", alt: "Flood Relief 2022", caption: "Relief Camps" }
];

const defaultParagraphs = [
  "The 2022 Godavari floods caused unprecedented backwater submergence in the agency tracts, leaving hill-top hamlets completely marooned for weeks. Roads and communication lines were severely disrupted.",
  "ALERT field teams operated country boats to reach interior hamlets, providing emergency sustenance, blankets, solar lanterns, and dry provisions to thousands of affected families.",
  "Solar lanterns were distributed to ensure illuminated living conditions and prevent snakebites in waterlogged settlement camps."
];

export default function FloodRelief2022() {
  const [pageData, setPageData] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    fetchFloodReliefPageBySlug("flood-relief-measures-2022").then((res) => {
      if (res && res.data) setPageData(res.data);
    }).catch(() => {});
  }, []);

  const isAdmin = typeof sessionStorage !== "undefined" && !!sessionStorage.getItem("alertngo_admin_key");

  const dynamicStats = (pageData?.stats && pageData.stats.length > 0)
    ? pageData.stats
    : (pageData?.content?.stats && pageData.content.stats.length > 0)
        ? pageData.content.stats
        : DEFAULT_STATS_BY_SLUG["flood-relief-measures-2022"];

  const rawImages = (pageData?.images && pageData.images.length > 0)
    ? pageData.images
    : (pageData?.content?.images && pageData.content.images.length > 0)
        ? pageData.content.images
        : defaultImages;

  const images = rawImages.map((img) => ({
    src: img.src || img.url,
    alt: img.alt || img.name || "Flood Relief 2022",
    caption: img.caption || img.name || "Solar Lanterns & Emergency Provisioning 2022"
  }));

  const rawParagraphs = (pageData?.paragraphs && pageData.paragraphs.length > 0)
    ? pageData.paragraphs
    : (pageData?.content?.paragraphs && pageData.content.paragraphs.length > 0)
        ? pageData.content.paragraphs
        : defaultParagraphs;
  const paragraphs = Array.isArray(rawParagraphs) ? rawParagraphs : [String(rawParagraphs)];

  const downloads = (pageData?.downloads && pageData.downloads.length > 0)
    ? pageData.downloads
    : (pageData?.content?.downloads && pageData.content.downloads.length > 0)
        ? pageData.content.downloads
        : [];

  const tables = (pageData?.tables && pageData.tables.length > 0)
    ? pageData.tables
    : (pageData?.content?.tables && pageData.content.tables.length > 0)
        ? pageData.content.tables
        : [];

  const videos = (pageData?.videos && pageData.videos.length > 0)
    ? pageData.videos
    : (pageData?.content?.videos && pageData.content.videos.length > 0)
        ? pageData.content.videos
        : [];

  const title = pageData?.title || pageData?.content?.title || "Solar Lanterns Distribution Program";
  const badge = pageData?.badge || pageData?.content?.badge || "Flood Relief 2022";
  const desc = pageData?.subtitle || pageData?.content?.subtitle || paragraphs[0] || "Solar Lanterns Distribution Program — 2022. Solar lantern distribution across flood-affected habitations in the Godavari basin.";
  const heroImage =
    pageData?.heroImage || pageData?.hero_image ||
    pageData?.content?.heroImage || pageData?.content?.hero_image ||
    images[0]?.src || "/uploads/PHOTO-2022-10-20-17-25-29-2-1024x461-640x480.jpg";
  const heroImageCaption =
    pageData?.heroImageCaption || pageData?.hero_image_caption ||
    pageData?.content?.heroImageCaption || pageData?.content?.hero_image_caption ||
    images[0]?.caption || title;

  return (
    <>
      <style>{`
        .fr-page-hero {
          padding-top: 140px;
          padding-bottom: 70px;
        }
        .fr-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
          margin-bottom: 90px;
        }
        .fr-hero-image-box {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15);
          border: 1px solid rgba(210,25,12,0.1);
          height: 520px;
          cursor: pointer;
        }
        .fr-hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent 0%, rgba(0,0,0,0.85) 100%);
          padding: 32px;
          border-radius: 0 0 32px 32px;
        }
        .fr-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 16px;
          margin-bottom: 70px;
        }
        .fr-stat-card {
          background: #ffffff;
          border-radius: 22px;
          padding: 28px 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 49, 144, 0.05);
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .fr-narrative-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 40px -15px rgba(0, 49, 144, 0.06);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        .fr-narrative-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .fr-narrative-body {
          padding: 32px clamp(20px, 4vw, 36px);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .fr-cta-box {
          background: linear-gradient(135deg, var(--color-dark) 0%, #0E2B66 100%) !important;
          border-radius: 32px;
          padding: 64px;
          color: white;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          width: 100%;
        }
        .fr-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--color-primary);
          color: white;
          padding: 16px 34px;
          border-radius: 500px;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          box-shadow: 0 12px 30px -6px rgba(210,25,12,0.4);
          transition: all 0.25s ease;
        }
        @media (max-width: 768px) {
          .fr-hero-section {
            padding-top: 0 !important;
          }
          .fr-page-hero {
            padding-top: 135px !important;
            padding-bottom: 30px !important;
          }
          .fr-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            margin-bottom: 40px !important;
          }
          .fr-hero-grid h1 {
            font-size: clamp(1.8rem, 6vw, 2.5rem) !important;
            margin-bottom: 16px !important;
          }
          .fr-hero-grid p {
            font-size: 0.95rem !important;
            line-height: 1.65 !important;
            margin-bottom: 20px !important;
          }
          .fr-hero-actions {
            flex-direction: column !important;
            width: 100% !important;
          }
          .fr-hero-actions a {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .fr-hero-image-box {
            height: 250px !important;
            border-radius: 18px !important;
          }
          .fr-hero-overlay {
            padding: 14px 14px !important;
            border-radius: 0 0 18px 18px !important;
          }
          .fr-hero-overlay h3 {
            font-size: 1.15rem !important;
            margin-bottom: 4px !important;
          }
          .fr-hero-overlay p {
            font-size: 0.8rem !important;
            line-height: 1.4 !important;
          }
          .fr-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 36px !important;
          }
          .fr-stat-card {
            padding: 18px 12px !important;
            border-radius: 16px !important;
          }
          .fr-stat-card .stat-val {
            font-size: 1.55rem !important;
          }
          .fr-narrative-card {
            border-radius: 18px !important;
          }
          .fr-narrative-header {
            padding: 16px 14px !important;
          }
          .fr-narrative-body {
            padding: 18px 14px !important;
            gap: 14px !important;
          }
          .fr-cta-box {
            padding: 32px 18px !important;
            border-radius: 20px !important;
          }
          .fr-cta-box h2 {
            font-size: clamp(1.4rem, 5vw, 1.85rem) !important;
            margin-bottom: 14px !important;
          }
          .fr-cta-box p {
            font-size: 0.92rem !important;
            line-height: 1.65 !important;
            margin-bottom: 24px !important;
          }
          .fr-cta-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 13px 20px !important;
            box-sizing: border-box !important;
          }
        }
        @media (max-width: 480px) {
          .fr-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* ADMIN FLOATING ACTION BAR */}
      {isAdmin && (
        <div
          style={{
            position: "sticky",
            top: 76,
            zIndex: 40,
            background: "#0f172a",
            borderBottom: "1px solid #334155",
            padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)"
          }}
        >
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38bdf8", fontSize: "0.84rem", fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              Admin Mode: Editing <strong>Flood Relief 2022</strong>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                href="/admin/flood-relief?slug=flood-relief-measures-2022&tab=content"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#ffffff", padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}
              >
                <FaFileAlt size={12} /> Edit Page Text &amp; Paragraphs
              </a>
              <a
                href="/admin/flood-relief?slug=flood-relief-measures-2022&tab=settings"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", color: "#93c5fd", padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", border: "1px solid #334155" }}
              >
                <FaSlidersH size={12} /> Edit Meta &amp; Titles
              </a>
              <a
                href="/admin/flood-relief?slug=flood-relief-measures-2022&tab=images"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", color: "#93c5fd", padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", border: "1px solid #334155" }}
              >
                <FaImages size={12} /> Edit Images ({images.length})
              </a>
              <a
                href="/admin/flood-relief?slug=flood-relief-measures-2022&tab=stats"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", color: "#93c5fd", padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", border: "1px solid #334155" }}
              >
                <FaChartBar size={12} /> Edit Stats
              </a>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section
        id="flood-relief-2022"
        className="fr-hero-section hero"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#ffffff"
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-10%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(210, 25, 12, 0.08), transparent 70%)", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(0, 49, 144, 0.08), transparent 70%)", borderRadius: "50%" }}></div>
        </div>

        <div className="container fr-page-hero" style={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="fr-hero-grid"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7 }}
            >
              <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>{badge}</span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 7vw, 4rem)", color: "var(--color-dark)", marginBottom: 24, lineHeight: 1.1 }}>
                {title}
              </h1>
              <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, fontSize: "1.05rem", marginBottom: 30, maxWidth: 480 }}>
                {desc}
              </p>
              <div className="fr-hero-actions" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a href="/donate" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-primary)", color: "white", padding: "14px 32px", borderRadius: 500, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 12px 30px -6px rgba(210,25,12,0.4)" }}>
                  <FaArrowRight size={12} /> Donate Now
                </a>
                <a href="/flood-relief-measures" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.8)", color: "var(--color-dark)", padding: "13px 28px", borderRadius: 500, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", border: "1px solid rgba(0,0,0,0.05)" }}>
                  View All Years <FaArrowRight size={10} />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="fr-hero-image-box"
              onClick={() => setSelectedImg({ src: heroImage, alt: heroImageCaption || title, caption: heroImageCaption || title })}
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img
                  src={heroImage}
                  alt={heroImageCaption || title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="fr-hero-overlay">
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#F5A000", marginBottom: 4 }}>
                    Flood Relief 2022
                  </div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.3rem, 3vw, 1.6rem)", color: "white", marginBottom: 8, lineHeight: 1.3 }}>
                    Solar Lanterns Distribution Program
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                    {heroImageCaption || "Solar lanterns erected across flood-affected tribal hamlets to ensure safety after dark."}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* STATS ROW */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="fr-stats-grid"
          >
            {dynamicStats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="fr-stat-card"
                whileHover={{ y: -6, boxShadow: "0 20px 35px -10px rgba(0, 49, 144, 0.12)", borderColor: s.color || "#003190" }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color || "#003190" }} />
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color || "#003190"}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: s.color || "#003190" }}>
                  {renderStatIcon(s.icon, s.color || "#003190", 22)}
                </div>
                <div className="stat-val" style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--color-dark)", lineHeight: 1, marginBottom: 8, fontFamily: "var(--font-serif)" }}>{s.num}</div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600, letterSpacing: 0.3 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DYNAMIC FIELD NARRATIVE PARAGRAPHS */}
      {paragraphs.length > 0 && (
        <section style={{ paddingTop: 20, paddingBottom: 70, background: "#ffffff" }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="fr-narrative-card"
            >
              <div className="fr-narrative-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(210, 25, 12, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D2190C" }}>
                    <FaFileAlt size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.3 }}>
                      Field Narrative &amp; Disaster Documentation
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                      Official Operational Documentation • ALERT Disaster Cell
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <a
                    href="/admin/flood-relief?slug=flood-relief-measures-2022&tab=content"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0284c7", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}
                  >
                    <FaEdit size={12} /> Edit Narrative Text
                  </a>
                )}
              </div>

              <div className="fr-narrative-body">
                {paragraphs.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(210, 25, 12, 0.1)",
                        color: "#D2190C",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: 2
                      }}
                    >
                      {idx + 1}
                    </span>
                    <p style={{ color: "var(--color-text)", fontSize: "1.02rem", lineHeight: 1.85, margin: 0 }}>
                      {p}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* FIELD IMAGES */}
      <section style={{ paddingTop: 40, paddingBottom: 90, background: "#f4f7fe" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 40 }}
          >
            <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Field Images</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 12 }}>
              On the Ground
            </h2>
            <p style={{ color: "var(--color-text-light)", fontSize: "0.95rem" }}>
              Archival photography from 2022 flood relief operations — solar lantern distributions and emergency boat relays across inundated mandals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20 }}
          >
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                onClick={() => setSelectedImg(img)}
                style={{
                  position: "relative",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 25px 50px -15px rgba(0,0,0,0.08)",
                  border: "1px solid #f1f5f9",
                  aspectRatio: "4/3",
                  transition: "all 0.4s ease",
                  cursor: "pointer"
                }}
                whileHover={{ y: -8, boxShadow: "0 35px 70px -20px rgba(210,25,12,0.2)" }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent 0%, rgba(0,0,0,0.75) 100%)", padding: 18, borderRadius: "0 0 24px 24px" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#F5A000", marginBottom: 4 }}>
                    Flood Relief 2022
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "white", fontWeight: 600 }}>{img.caption}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ATTACHED DOCUMENTS & REPORTS (IF UPLOADED BY ADMIN) */}
      {downloads.length > 0 && (
        <section style={{ paddingTop: 40, paddingBottom: 80, background: "#ffffff" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #003190 0%, #38BDF8 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <FaDownload size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-dark)", margin: 0 }}>Attached Official Documents &amp; Reports</h3>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>{downloads.length} file{downloads.length !== 1 ? "s" : ""} available</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
              {downloads.map((doc, dIdx) => (
                <div
                  key={dIdx}
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaDownload size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--color-dark)", margin: "0 0 4px", lineHeight: 1.3 }}>
                        {doc.text || doc.filename || `Document #${dIdx + 1}`}
                      </h4>
                      {doc.size && <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{doc.size}</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => setSelectedPdf(doc)}
                      style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#003190", color: "#ffffff", padding: "8px 12px", borderRadius: 8, border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      <FaEye size={12} /> View
                    </button>
                    <a
                      href={doc.url || doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b" }}
                      title="Download"
                    >
                      <FaDownload size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STRUCTURED TABLES (IF ANY) */}
      {tables.length > 0 && (
        <section style={{ paddingTop: 20, paddingBottom: 80, background: "#ffffff" }}>
          <div className="container">
            {tables.map((tbl, tIdx) => (
              <div key={tIdx} style={{ marginBottom: 36, background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "18px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
                  <FaTable color="#003190" />
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--color-dark)" }}>{tbl.title || `Data Matrix #${tIdx + 1}`}</h4>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                    {tbl.headers && tbl.headers.length > 0 && (
                      <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                          {tbl.headers.map((h, hIdx) => (
                            <th key={hIdx} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#334155", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {(tbl.rows || []).map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          {(row || []).map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: "12px 16px", color: "#475569" }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FIELD VIDEOS (IF UPLOADED BY ADMIN) */}
      <FieldVideosSection videos={videos} />

      {/* CTA SECTION */}
      <section className="fr-cta-section" style={{ paddingTop: 60, paddingBottom: 90, textAlign: "center", background: "#ffffff" }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div className="fr-cta-box">
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 30% 20%, rgba(245,160,0,0.15), transparent 50%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <span style={{ color: "#F5A000", fontWeight: 800, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 2, marginBottom: 16, display: "block" }}>Support Relief Work</span>
                <h2 className="fr-cta-title" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 22, lineHeight: 1.3 }}>Power Marooned Hamlets</h2>
                <p className="fr-cta-text" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.8, marginBottom: 32, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                  Solar lanterns provide essential night illumination, keeping families safe from hazards and waterborne wildlife during severe flood inundations.
                </p>
                <a href="/donate" className="fr-cta-btn">
                  <FaArrowRight size={12} /> Donate Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20, paddingBottom: 60, textAlign: "center", background: "#ffffff" }}>
        <div className="container">
          <a href="/flood-relief-measures" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>
            ← Back to Flood Relief Measures
          </a>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              backdropFilter: "blur(4px)"
            }}
          >
            <button
              onClick={() => setSelectedImg(null)}
              style={{ position: "absolute", top: 24, right: 24, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <FaTimes size={18} />
            </button>
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900, maxHeight: "85vh", textAlign: "center" }}>
              <img
                src={selectedImg.src}
                alt={selectedImg.alt}
                style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 16, objectFit: "contain", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
              />
              <div style={{ color: "#ffffff", marginTop: 14, fontSize: "0.95rem", fontWeight: 600 }}>
                {selectedImg.caption}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF MODAL */}
      <PdfViewerModal
        isOpen={!!selectedPdf}
        fileUrl={selectedPdf ? (selectedPdf.url || selectedPdf.file) : ""}
        title={selectedPdf ? (selectedPdf.text || selectedPdf.filename || "Attached Document") : ""}
        meta="Flood Relief 2022 Archive • ALERT"
        onClose={() => setSelectedPdf(null)}
      />
    </>
  );
}
