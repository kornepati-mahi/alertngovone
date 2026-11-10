import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShip,
  FaBed,
  FaArrowRight,
  FaEdit,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaTable,
  FaImages,
  FaSlidersH,
  FaChartBar,
  FaTimes,
  FaExternalLinkAlt,
  FaCheckCircle
} from "react-icons/fa";
import { fetchFloodReliefPageBySlug } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";
import FieldVideosSection from "../components/FieldVideosSection";
import { DEFAULT_STATS_BY_SLUG, renderStatIcon } from "../utils/statIcons";

const defaultImages = [
  "/uploads/WhatsApp-Image-2020-10-10-at-1.48.07-PM-1-300x225-1.jpeg",
  "/uploads/WhatsApp-Image-2020-10-10-at-11.15.55-PM-300x225-1.jpeg",
  "/uploads/WhatsApp-Image-2020-10-10-at-1.48.08-PM-1-300x225-1.jpeg",
  "/uploads/WhatsApp-Image-2020-10-10-at-11.15.54-PM-300x225-1.jpeg",
  "/uploads/WhatsApp-Image-2020-10-10-at-11.16.37-PM-300x225-1.jpeg"
];

const defaultParagraphs = [
  "Following flood inundations in late 2020, severe winter weather struck the elevated agency tracts of East Godavari. Thousands of displaced tribal families in makeshift shelters faced freezing hill nights.",
  "ALERT distributed 3,000+ high-quality thermal blankets to vulnerable tribal families, protecting children and elderly residents from cold-induced illnesses and exposure."
];

export default function BlanketsDistributionEastGodavari() {
  const [pageData, setPageData] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    fetchFloodReliefPageBySlug("blankets-distribution-in-east-godavari").then((res) => {
      if (res && res.data) setPageData(res.data);
    }).catch(() => {});
  }, []);

  const isAdmin = typeof sessionStorage !== "undefined" && !!sessionStorage.getItem("alertngo_admin_key");

  const dynamicStats = (pageData?.stats && pageData.stats.length > 0)
    ? pageData.stats
    : (pageData?.content?.stats && pageData.content.stats.length > 0)
        ? pageData.content.stats
        : DEFAULT_STATS_BY_SLUG["blankets-distribution-in-east-godavari"];

  const rawImages = (pageData?.images && pageData.images.length > 0)
    ? pageData.images
    : (pageData?.content?.images && pageData.content.images.length > 0)
        ? pageData.content.images
        : defaultImages.map(src => ({ src, url: src, name: "Blankets Distribution Photo", caption: "East Godavari District – Year 2020" }));

  const images = rawImages.map(img => typeof img === "string" ? { src: img, url: img, caption: "East Godavari District – Year 2020" } : {
    src: img.src || img.url,
    url: img.url || img.src,
    caption: img.caption || img.name || "East Godavari District – Year 2020"
  });

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

  const title = pageData?.title || "Blankets Distribution – East Godavari";
  const badge = pageData?.badge || "Flood Relief 2020";
  const desc = pageData?.subtitle || paragraphs[0] || "Blankets distribution in East Godavari District – Year 2020. Thermal wool blankets for Konda Reddi tribal households.";

  // Program details section texts (fully customizable by admin)
  const sectionBadge = pageData?.section_badge || pageData?.content?.section_badge || "Program Details";
  const sectionTitle = pageData?.section_title || pageData?.content?.section_title || "Winter Care for Tribal Households";
  const sectionDesc = pageData?.section_desc || pageData?.content?.section_desc || (paragraphs.length > 1 ? paragraphs[1] : "ALERT distributed 3,000+ thermal wool blankets to Konda Reddi tribal households in East Godavari district to protect vulnerable families from post-flood cold spells and winter months.");

  // Call to action texts
  const ctaBadge = pageData?.cta_badge || pageData?.content?.cta_badge || "Support Relief Work";
  const ctaTitle = pageData?.cta_title || pageData?.content?.cta_title || "Keep Families Warm";
  const ctaDesc = pageData?.cta_desc || pageData?.content?.cta_desc || "Thermal blankets protect tribal families from cold spells and winter hardship after flood disasters.";
  const ctaBtn = pageData?.cta_btn || pageData?.content?.cta_btn || "Donate Now";

  return (
    <>
      {/* ADMIN FLOATING ACTION BAR WHEN SIGNED IN */}
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
              Admin Mode: Editing <strong>Blankets Distribution – East Godavari</strong>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                href="/admin/flood-relief?slug=blankets-distribution-in-east-godavari&tab=content"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none"
                }}
              >
                <FaFileAlt size={12} /> Edit Page Text &amp; Paragraphs
              </a>
              <a
                href="/admin/flood-relief?slug=blankets-distribution-in-east-godavari&tab=settings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#1e293b",
                  color: "#93c5fd",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid #334155"
                }}
              >
                <FaSlidersH size={12} /> Edit Meta &amp; Titles
              </a>
              <a
                href="/admin/flood-relief?slug=blankets-distribution-in-east-godavari&tab=images"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#1e293b",
                  color: "#93c5fd",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid #334155"
                }}
              >
                <FaImages size={12} /> Edit Images ({images.length})
              </a>
              <a
                href="/admin/flood-relief?slug=blankets-distribution-in-east-godavari&tab=stats"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#1e293b",
                  color: "#93c5fd",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid #334155"
                }}
              >
                <FaChartBar size={12} /> Edit Stats
              </a>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section
        id="blankets-distribution-east-godavari"
        style={{
          paddingTop: isAdmin ? 140 : 160,
          paddingBottom: 0,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%)"
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -10, left: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(210, 25, 12, 0.06), transparent 70%)", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: -10, right: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(0, 49, 144, 0.05), transparent 70%)", borderRadius: "50%" }}></div>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 56px" }}
          >
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>{badge}</span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.4rem, 5vw, 3.4rem)", color: "var(--color-dark)", marginBottom: 20, lineHeight: 1.15 }}>
              {title}
            </h1>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, fontSize: "1.08rem", margin: 0 }}>
              {desc}
            </p>
          </motion.div>

          {/* STATS ROW */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 60 }}
          >
            {dynamicStats.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px 18px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 20px -4px rgba(0, 49, 144, 0.05)",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color || "#003190" }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color || "#003190"}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: s.color || "#003190" }}>
                  {renderStatIcon(s.icon, s.color || "#003190", 20)}
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-dark)", lineHeight: 1.1, marginBottom: 6, fontFamily: "var(--font-serif)" }}>
                  {s.num}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* FIELD IMAGES GALLERY */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 25px 50px -15px rgba(0,0,0,0.1)",
                  border: "1px solid #f1f5f9",
                  aspectRatio: "4/3",
                  transition: "all 0.4s ease",
                  cursor: "pointer"
                }}
                whileHover={{ y: -8, boxShadow: "0 35px 70px -20px rgba(210,25,12,0.2)" }}
              >
                <img
                  src={img.src}
                  alt={img.caption || "Blankets Distribution East Godavari"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent 0%, rgba(210,25,12,0.85) 100%)", padding: 20, borderRadius: "0 0 20px 20px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#F5A000", marginBottom: 4 }}>
                    Blankets Distribution
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "white", fontWeight: 600 }}>
                    {img.caption}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DYNAMIC OVERVIEW & FIELD NARRATIVE PARAGRAPHS */}
      {paragraphs.length > 0 && (
        <section style={{ paddingTop: 80, paddingBottom: 60, background: "#ffffff" }}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                background: "#ffffff",
                borderRadius: 24,
                boxShadow: "0 20px 40px -15px rgba(0, 49, 144, 0.06)",
                border: "1px solid #e2e8f0",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  padding: "24px 32px",
                  borderBottom: "1px solid #f1f5f9",
                  background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "rgba(210, 25, 12, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#D2190C"
                    }}
                  >
                    <FaFileAlt size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.3 }}>
                      Operational Overview &amp; Field Narrative
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                      Official Operational Documentation • ALERT Disaster Cell
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <a
                    href="/admin/flood-relief?slug=blankets-distribution-in-east-godavari&tab=content"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#0284c7",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    <FaEdit size={12} /> Edit Narrative Text
                  </a>
                )}
              </div>

              <div style={{ padding: "32px clamp(20px, 4vw, 36px)", display: "flex", flexDirection: "column", gap: 18 }}>
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

      {/* PROGRAM DETAILS & HIGHLIGHTS */}
      <section style={{ paddingTop: 40, paddingBottom: 80, background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>{sectionBadge}</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 16 }}>
              {sectionTitle}
            </h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "1.05rem", margin: 0 }}>
              {sectionDesc}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
            {[
              { icon: <FaBed />, title: "3,000+ Blankets", desc: "High-grade thermal wool blankets distributed" },
              { icon: <FaShip />, title: "East Godavari Agency", desc: "Konda Reddi tribal households covered" },
              { icon: <FaBed />, title: "Year 2020 Relief", desc: "Emergency winter post-flood program" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{
                  background: "#ffffff",
                  padding: 26,
                  borderRadius: 20,
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  transition: "all 0.3s ease"
                }}
                whileHover={{ y: -6, boxShadow: "var(--shadow-md)", borderColor: "var(--color-primary)" }}
              >
                <div style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: 14, background: "rgba(210, 25, 12, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D2190C", overflow: "hidden" }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: 4, fontSize: "0.95rem" }}>{item.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-light)", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ATTACHED OFFICIAL DOCUMENTS & REPORTS (IF UPLOADED BY ADMIN) */}
      {downloads.length > 0 && (
        <section style={{ paddingTop: 20, paddingBottom: 80, background: "#ffffff" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #D2190C 0%, #F5A000 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
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
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fee2e2", color: "#D2190C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        background: "#003190",
                        color: "#ffffff",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      <FaEye size={12} /> View
                    </button>
                    <a
                      href={doc.url || doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        color: "#64748b"
                      }}
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

      {/* STRUCTURED TABLES (IF CONFIGURED BY ADMIN) */}
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

      {/* CALL TO ACTION */}
      <section style={{ paddingTop: 60, paddingBottom: 90, textAlign: "center", background: "#ffffff" }}>
        <div className="container">
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <a href="/flood-relief-measures" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600 }}>
                ← Back to Flood Relief Measures
              </a>
            </div>
            <div style={{ background: "linear-gradient(135deg, var(--color-dark) 0%, #0E2B66 100%)", borderRadius: 28, padding: 48, color: "white", display: "inline-block", width: "100%", boxShadow: "0 25px 60px -15px rgba(0, 49, 144, 0.25)" }}>
              <span style={{ color: "#F5A000", fontWeight: 800, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 2, marginBottom: 16, display: "block" }}>{ctaBadge}</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", marginBottom: 18, lineHeight: 1.3 }}>{ctaTitle}</h2>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: 28, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                {ctaDesc}
              </p>
              <a href="/donate" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-primary)", color: "white", padding: "14px 34px", borderRadius: 500, fontWeight: 700, textDecoration: "none", boxShadow: "0 12px 30px -6px rgba(210,25,12,0.4)" }}>
                {ctaBtn} <FaArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
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
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <FaTimes size={18} />
            </button>
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900, maxHeight: "85vh", textAlign: "center" }}>
              <img
                src={selectedImg.src || selectedImg.url}
                alt={selectedImg.caption}
                style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 16, objectFit: "contain", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
              />
              <div style={{ color: "#ffffff", marginTop: 14, fontSize: "0.95rem", fontWeight: 600 }}>
                {selectedImg.caption}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF VIEWER MODAL */}
      <PdfViewerModal
        isOpen={!!selectedPdf}
        fileUrl={selectedPdf ? (selectedPdf.url || selectedPdf.file) : ""}
        title={selectedPdf ? (selectedPdf.text || selectedPdf.filename || "Attached Document") : ""}
        meta="Flood Relief 2020 Archive • ALERT"
        onClose={() => setSelectedPdf(null)}
      />
    </>
  );
}
