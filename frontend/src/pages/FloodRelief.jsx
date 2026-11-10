import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaWater,
  FaMapMarkedAlt,
  FaClock,
  FaShip,
  FaHandHoldingHeart,
  FaChevronRight,
  FaArrowRight,
  FaFilePdf,
  FaDownload,
  FaEye,
  FaEdit,
  FaTable,
  FaImages,
  FaVideo,
  FaPlay,
  FaTimes,
  FaFileAlt,
  FaSearchPlus
} from "react-icons/fa";
import { fetchFloodReliefPages, fetchFloodReliefPageBySlug } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";
import FieldVideosSection from "../components/FieldVideosSection";
import { DEFAULT_STATS_BY_SLUG, renderStatIcon } from "../utils/statIcons";

const defaultReliefYears = [
  {
    id: "2023",
    tabLabel: "Flood Relief 2023",
    title: "Flood Relief 2023",
    sub: "Godavari Basin Emergency Mission",
    desc: "4,200+ displaced families received emergency rations & medical kits across Alluri Sitharama Raju and Eluru districts. Mechanized boats deployed to reach the most isolated hamlets.",
    items: [],
    badge: "Active",
    badgeColor: "#3E8E0F",
    link: "/2023-2"
  },
  {
    id: "2022",
    tabLabel: "Flood Relief 2022",
    title: "Flood Relief 2022",
    sub: "Multi-Mandal Relief Mission",
    desc: "Ration packets and hygiene supplies reached Kunavaram, VR Puram and Chintoor mandals — areas where flood waters inundated roads and isolated tribal hamlets for weeks.",
    items: [],
    badge: "Completed",
    badgeColor: "#003190",
    link: "/flood-relief-measures-2022"
  },
  {
    id: "2021",
    tabLabel: "Flood Relief 2021",
    title: "Flood Relief 2021",
    sub: "Rescue Boat Deployment",
    desc: "Relief bases established in remote hill areas serving tribal children, nursing mothers and elderly residents cut off by the 2021 floods, deploying rescue boats across inaccessible terrains.",
    items: [],
    badge: "Completed",
    badgeColor: "#003190",
    link: "/flood-relief-measures-2021-2"
  },
  {
    id: "2020",
    tabLabel: "Flood Relief 2020",
    title: "Flood Relief 2020",
    sub: "Blankets & Winter Care",
    desc: "Blankets distribution in East Godavari and groceries distribution in West Godavari — thermal wool blankets and essential grocery kits delivered to forest hamlet families during COVID lockdowns.",
    items: [
      { label: "Blankets Distribution — East Godavari", link: "/blankets-distribution-in-east-godavari", desc: "3,000+ thermal wool blankets to Konda Reddi tribal households" },
      { label: "Groceries Distribution — West Godavari", link: "/groceries-distribution-in-west-godavari", desc: "Essential grocery hampers to forest hamlet families during COVID-19 lockdown" }
    ],
    badge: "Completed",
    badgeColor: "#003190",
    link: "/flood-relief-measures-2020"
  }
];

const pageToReliefYear = (p, idx = 0) => {
  const slug = p?.slug || "";
  const title = p?.title || p?.nav_label || "Flood Relief Mission";
  const sub = p?.subtitle || p?.content?.subtitle || p?.badge || "Relief Mission";
  const desc =
    (Array.isArray(p?.paragraphs) && p.paragraphs[0]) ||
    (Array.isArray(p?.content?.paragraphs) && p.content.paragraphs[0]) ||
    p?.subtitle ||
    "Detailed report and documentation for this flood relief mission.";
  const badge = p?.badge || p?.content?.badge || "Mission";
  return {
    id: slug || `relief-${idx}`,
    tabLabel: p?.nav_label || title,
    title,
    sub,
    desc,
    items: Array.isArray(p?.items) ? p.items : [],
    badge,
    badgeColor: badge === "Active" ? "#3E8E0F" : "#003190",
    link: `/${slug}`
  };
};

export default function FloodRelief() {
  const [activeYear, setActiveYear] = useState("2023");
  const [reliefYears, setReliefYears] = useState(defaultReliefYears);
  const [pageData, setPageData] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const loggedIn =
        (typeof sessionStorage !== "undefined" && !!sessionStorage.getItem("alertngo_admin_key")) ||
        (typeof localStorage !== "undefined" && !!localStorage.getItem("alertngo_admin_key"));
      setIsAdmin(loggedIn);
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    return () => window.removeEventListener("storage", checkAdmin);
  }, []);

  useEffect(() => {
    fetchFloodReliefPageBySlug("flood-relief-measures").then(res => {
      if (res && res.data) setPageData(res.data);
    }).catch(() => {});

    fetchFloodReliefPages().then(res => {
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const pages = res.data.filter((p) => (p?.is_active === undefined || Number(p.is_active) !== 0));
        const missionPages = pages.filter((p) => p.slug && p.slug !== "flood-relief-measures");

        if (missionPages.length > 0) {
          const merged = missionPages.map((p, idx) => {
            const matchDefault = defaultReliefYears.find(
              (y) => p.slug === y.link.replace(/^\//, "") || p.slug?.includes(y.id) || (p.title || "").includes(y.id)
            );
            const base = pageToReliefYear(p, idx);
            return {
              ...base,
              tabLabel: base.tabLabel || matchDefault?.tabLabel || base.title,
              sub: base.sub || matchDefault?.sub || "Relief Mission",
              desc: base.desc || matchDefault?.desc || base.desc,
              items: (matchDefault?.items?.length ? matchDefault.items : base.items) || [],
              badge: p.badge || p.content?.badge || matchDefault?.badge || base.badge,
              badgeColor: (p.badge || p.content?.badge || matchDefault?.badge) === "Active" ? "#3E8E0F" : "#003190",
            };
          });
          setReliefYears(merged);
          setActiveYear((cur) => (merged.some((m) => m.id === cur) ? cur : merged[0].id));
        } else {
          // fallback: enrich defaults with any matching page data
          setReliefYears(prev => prev.map(y => {
            const found = pages.find(p => p.slug?.includes(y.id) || p.title?.includes(y.id));
            if (found) {
              return {
                ...y,
                title: found.title || y.title,
                sub: found.subtitle || y.sub,
                desc: found.paragraphs?.[0] || found.subtitle || y.desc,
                badge: found.badge || y.badge
              };
            }
            return y;
          }));
        }
      }
    }).catch(() => {});
  }, []);

  const dynamicStats = (pageData?.stats && pageData.stats.length > 0)
    ? pageData.stats
    : (pageData?.content?.stats && pageData.content.stats.length > 0)
        ? pageData.content.stats
        : DEFAULT_STATS_BY_SLUG["flood-relief-measures"];

  const activeYearData = reliefYears.find(y => y.id === activeYear) || reliefYears[0];

  const pageTitle = pageData?.title || "Flood Relief Measures";
  const pageBadge = pageData?.badge || "Disaster Emergency Mission";
  const pageSubtitle = pageData?.subtitle || "Emergency response across the Godavari agency belt — delivering rations, medical kits, rescue boats and shelter materials to vulnerable tribal families when disaster strikes.";
  const paragraphs = Array.isArray(pageData?.paragraphs) ? pageData.paragraphs : [];
  const downloads = Array.isArray(pageData?.downloads) ? pageData.downloads : [];
  const tables = Array.isArray(pageData?.tables) ? pageData.tables : [];
  const images = Array.isArray(pageData?.images) ? pageData.images : [];
  const videos = Array.isArray(pageData?.videos) ? pageData.videos : [];

  return (
    <>
      <style>{`
        .flood-hero-section {
          padding-top: 160px;
          padding-bottom: 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%);
        }
        .flood-hero-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 60px;
        }
        .flood-year-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.07);
          overflow: hidden;
          margin-bottom: 90px;
        }
        .flood-year-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
          padding: 8px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .flood-year-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 14px;
          border: none;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
          min-width: 0;
        }
        .flood-active-content {
          padding: 36px 40px;
        }
        @media (max-width: 960px) {
          .flood-year-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .flood-hero-section {
            padding-top: 138px !important;
          }
          .flood-hero-header {
            margin: 0 auto 28px !important;
          }
          .flood-year-box {
            border-radius: 18px !important;
            margin-bottom: 40px !important;
          }
          .flood-year-tabs {
            display: flex !important;
            overflow-x: auto !important;
            gap: 8px !important;
            padding: 10px 12px !important;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .flood-year-tabs::-webkit-scrollbar {
            display: none;
          }
          .flood-year-tab-btn {
            flex: 0 0 auto !important;
            padding: 9px 18px !important;
            font-size: 0.78rem !important;
            border-radius: 999px !important;
            min-height: 38px;
          }
          .flood-year-tab-btn:not(.active) {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03) !important;
            color: #475569 !important;
          }
          .flood-active-content {
            padding: 20px 16px !important;
          }
          .flood-active-header {
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          .flood-active-icon {
            width: 38px !important;
            height: 38px !important;
            border-radius: 10px !important;
          }
          .flood-active-title {
            font-size: clamp(1.2rem, 4.5vw, 1.55rem) !important;
            margin-bottom: 6px !important;
            line-height: 1.25 !important;
            word-break: break-word;
          }
          .flood-active-desc {
            font-size: 0.9rem !important;
            line-height: 1.65 !important;
            margin-bottom: 20px !important;
          }
          .flood-subprog-item {
            padding: 12px 14px !important;
            gap: 12px !important;
            border-radius: 12px !important;
          }
          .flood-view-report-btn {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 12px 20px !important;
          }
          .flood-overview-card {
            border-radius: 18px !important;
            margin-bottom: 36px !important;
          }
          .flood-overview-header {
            padding: 16px 16px !important;
          }
          .flood-overview-body {
            padding: 18px 16px !important;
            gap: 12px !important;
          }
          .flood-stats-section {
            padding: 44px 0 !important;
          }
          .flood-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .flood-stat-card {
            padding: 22px 14px !important;
            border-radius: 16px !important;
          }
          .flood-stat-number {
            font-size: 1.8rem !important;
          }
          .flood-subpages-section {
            padding-top: 44px !important;
            padding-bottom: 50px !important;
          }
          .flood-subpages-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .flood-subpage-card {
            padding: 20px 16px !important;
            border-radius: 18px !important;
          }
          .flood-cta-section {
            padding-top: 36px !important;
            padding-bottom: 50px !important;
          }
          .flood-cta-box {
            padding: 30px 18px !important;
            border-radius: 20px !important;
          }
          .flood-cta-actions {
            flex-direction: column !important;
            width: 100% !important;
          }
          .flood-cta-actions a {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        .flood-subpages-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .flood-subpage-card {
          min-width: 0;
          max-width: 100%;
        }
        @media (max-width: 1200px) {
          .flood-subpages-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 480px) {
          .flood-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ==================== HERO ==================== */}
      <section
        id="flood-relief"
        className="flood-hero-section hero"
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
            className="flood-hero-header"
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span className="badge">{pageBadge}</span>
              {isAdmin && (
                <Link
                  to="/admin/flood-relief?slug=flood-relief-measures"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#0284c7",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: 500,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)"
                  }}
                  title="Open Admin Editor for Flood Relief"
                >
                  <FaEdit size={12} /> Edit Page in Admin
                </Link>
              )}
            </div>

            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "var(--color-dark)", marginBottom: 16, lineHeight: 1.15, wordBreak: "break-word" }}>
              {pageTitle}
            </h1>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "1.05rem", margin: 0, wordBreak: "break-word" }}>
              {pageSubtitle}
            </p>
          </motion.div>

          {/* ==================== OVERVIEW & PARAGRAPHS (IF CONFIGURED) ==================== */}
          {paragraphs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flood-overview-card"
              style={{
                background: "#ffffff",
                borderRadius: 24,
                boxShadow: "0 20px 40px -15px rgba(0, 49, 144, 0.06)",
                border: "1px solid #e2e8f0",
                marginBottom: 60,
                overflow: "hidden"
              }}
            >
              <div className="flood-overview-header" style={{ padding: "28px 36px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(210, 25, 12, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D2190C" }}>
                    <FaFileAlt size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.3 }}>
                      Overview &amp; Disaster Protocol
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                      Official Operational Record • ALERT Relief Cell
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin/flood-relief?slug=flood-relief-measures"
                    style={{ fontSize: "0.8rem", color: "#0284c7", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <FaEdit size={12} /> Edit Content
                  </Link>
                )}
              </div>
              <div className="flood-overview-body" style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
                {paragraphs.map((p, idx) => (
                  <p key={idx} style={{ color: "var(--color-text)", fontSize: "1.02rem", lineHeight: 1.85, margin: 0, wordBreak: "break-word" }}>
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* ==================== ATTACHED DOCUMENTS & REPORTS (IF UPLOADED) ==================== */}
          {downloads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ marginBottom: 70 }}
            >
              <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 36px" }}>
                <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Official Records</span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", color: "var(--color-dark)", marginBottom: 10 }}>
                  Relief Reports &amp; Documentation
                </h2>
                <p style={{ color: "var(--color-text-light)", fontSize: "0.95rem", margin: 0 }}>
                  Official field assessments, beneficiary summaries, and relief circulars published by ALERT.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
                {downloads.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#ffffff",
                      borderRadius: 20,
                      padding: "24px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.25s ease"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(210, 25, 12, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D2190C", flexShrink: 0 }}>
                          <FaFilePdf size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-dark)", margin: "0 0 6px", lineHeight: 1.4 }}>
                            {doc.title || doc.text || doc.name || doc.filename || "Relief Document"}
                          </h4>
                          <div style={{ display: "flex", gap: 10, fontSize: "0.75rem", color: "#64748b", flexWrap: "wrap" }}>
                            {doc.size && <span>{doc.size}</span>}
                            {doc.date && <span>• {doc.date}</span>}
                            {doc.category && <span style={{ color: "#003190", fontWeight: 600 }}>• {doc.category}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
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
                          padding: "10px 16px",
                          borderRadius: 12,
                          border: "none",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <FaEye size={13} /> View Document
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
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#64748b",
                          textDecoration: "none"
                        }}
                        title="Download Document"
                      >
                        <FaDownload size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ==================== YEAR NAVIGATION (DROPDOWN-STYLE) ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flood-year-box"
          >
            {/* Year tabs */}
            <div className="flood-year-tabs">
              {reliefYears.map((year) => {
                const isActive = activeYear === year.id;
                return (
                  <button
                    key={year.id}
                    onClick={() => setActiveYear(year.id)}
                    className={`flood-year-tab-btn ${isActive ? "active" : ""}`}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #D2190C 0%, #EA580C 100%)"
                        : "transparent",
                      color: isActive ? "#ffffff" : "#475569",
                      boxShadow: isActive ? "0 6px 16px -3px rgba(210, 25, 12, 0.35)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.color = "#0f172a";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {year.tabLabel || ("Flood Relief " + year.id)}
                    </span>
                    {year.items.length > 0 && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 500,
                          background: isActive ? "rgba(255, 255, 255, 0.25)" : "#e2e8f0",
                          color: isActive ? "#ffffff" : "#475569",
                          whiteSpace: "nowrap",
                          flexShrink: 0
                        }}
                      >
                        {year.items.length} sub-items
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active year content */}
            <motion.div
              key={activeYear}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flood-active-content"
            >
              <div className="flood-active-header" style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
                <div className="flood-active-icon" style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(210, 25, 12, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D2190C", flexShrink: 0 }}>
                  <FaWater size={20} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#D2190C", marginBottom: 4, display: "block" }}>
                    {activeYearData.badge}
                  </span>
                  <h3 className="flood-active-title" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem, 3vw, 1.8rem)", color: "var(--color-dark)", marginBottom: 8, lineHeight: 1.3 }}>
                    {activeYearData.title}
                  </h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-light)" }}>{activeYearData.sub}</span>
                </div>
              </div>
              <p className="flood-active-desc" style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.95rem", marginBottom: 28 }}>
                {activeYearData.desc}
              </p>

              {activeYearData.items.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 12, display: "block" }}>
                    Sub-Programmes
                  </span>
                  <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
                    {activeYearData.items.map((item, i) => (
                      <Link
                        key={i}
                        to={item.link}
                        className="flood-subprog-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 22px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 16,
                          textDecoration: "none",
                          color: "var(--color-dark)",
                          transition: "all 0.25s ease",
                          gap: 16
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#ffffff";
                          e.currentTarget.style.borderColor = "#D2190C";
                          e.currentTarget.style.boxShadow = "0 8px 24px -4px rgba(210, 25, 12, 0.12)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f8fafc";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 4 }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                            {item.desc}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#D2190C",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                            flexShrink: 0
                          }}
                        >
                          <span>Explore</span>
                          <FaChevronRight size={11} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to={activeYearData.link}
                className="btn-primary flood-view-report-btn"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", fontSize: "0.9rem" }}
              >
                View Full Report <FaArrowRight size={12} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== IMPACT STATS ==================== */}
      <section className="flood-stats-section" style={{ padding: "80px 0", background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)", position: "relative" }}>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
            <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Field Impact</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 3.8vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 14 }}>
              Two Decades of Emergency Response
            </h2>
            <p style={{ color: "var(--color-text-light)", fontSize: "1.02rem", lineHeight: 1.7, margin: 0 }}>
              Delivering critical rations, solar illumination, and boat rescue services to the most isolated tribal habitations across the Godavari basin.
            </p>
            {isAdmin && (
              <div style={{ marginTop: 16 }}>
                <Link
                  to="/admin/flood-relief?slug=flood-relief-measures&tab=stats"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#1e293b",
                    color: "#93c5fd",
                    padding: "7px 14px",
                    borderRadius: 10,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    border: "1px solid #334155"
                  }}
                >
                  <FaEdit size={12} /> Edit Overview Stat Cards in Admin
                </Link>
              </div>
            )}
          </div>

          <div className="flood-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {dynamicStats.map((s, i) => {
              const cardColor = s.color || "#003190";
              const cardNum = s.num || s.value || "—";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="flood-stat-card"
                  style={{
                    textAlign: "center",
                    padding: "36px 24px",
                    background: "#ffffff",
                    borderRadius: 22,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px -5px rgba(0, 49, 144, 0.05), 0 4px 6px -2px rgba(0,0,0,0.02)",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px -10px rgba(0, 49, 144, 0.12)", borderColor: cardColor }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: cardColor }} />
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: `${cardColor}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 18px",
                      color: cardColor,
                      boxShadow: `0 4px 14px ${cardColor}20`
                    }}
                  >
                    {renderStatIcon(s.icon, cardColor, 24)}
                  </div>
                  <div
                    className="flood-stat-number"
                    style={{
                      fontSize: "2.35rem",
                      fontWeight: 800,
                      color: "var(--color-dark)",
                      lineHeight: 1.1,
                      marginBottom: 10,
                      fontFamily: "var(--font-serif)"
                    }}
                  >
                    {cardNum}
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.2px", lineHeight: 1.4 }}>
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== DATA TABLES (IF CONFIGURED BY ADMIN) ==================== */}
      {tables.length > 0 && (
        <section style={{ padding: "80px 0", background: "#ffffff" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
              <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Relief Data</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", color: "var(--color-dark)", marginBottom: 12 }}>
                Operation Metrics &amp; Coverage Tables
              </h2>
              <p style={{ color: "var(--color-text-light)", fontSize: "0.95rem", margin: 0 }}>
                Structured distribution figures, coverage mandals, and relief logs across affected zones.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              {tables.map((tbl, tIdx) => (
                <div
                  key={tIdx}
                  style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.05)"
                  }}
                >
                  {tbl.title && (
                    <div style={{ padding: "20px 28px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
                      <FaTable size={16} color="#003190" />
                      <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--color-dark)" }}>
                        {tbl.title}
                      </h4>
                    </div>
                  )}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                      {tbl.headers && tbl.headers.length > 0 && (
                        <thead>
                          <tr style={{ background: "#f1f5f9" }}>
                            {tbl.headers.map((h, hIdx) => (
                              <th
                                key={hIdx}
                                style={{
                                  padding: "14px 20px",
                                  fontWeight: 700,
                                  color: "var(--color-dark)",
                                  borderBottom: "2px solid #e2e8f0",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {(tbl.rows || []).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            style={{
                              background: rIdx % 2 === 0 ? "#ffffff" : "#fdfdff",
                              borderBottom: "1px solid #f1f5f9"
                            }}
                          >
                            {(Array.isArray(row) ? row : []).map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                style={{
                                  padding: "14px 20px",
                                  color: "var(--color-text)",
                                  lineHeight: 1.5
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== PHOTO GALLERY (IF CONFIGURED BY ADMIN) ==================== */}
      {images.length > 0 && (
        <section style={{ padding: "80px 0", background: "#f8fafc" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
              <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Field Photography</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", color: "var(--color-dark)", marginBottom: 12 }}>
                On the Ground in Godavari
              </h2>
              <p style={{ color: "var(--color-text-light)", fontSize: "0.95rem", margin: 0 }}>
                Documenting relief delivery, rescue boats, solar lantern installations, and camp assistance.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
              {images.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                  onClick={() => setSelectedImg(img)}
                  style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    position: "relative"
                  }}
                  whileHover={{ y: -6, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)" }}
                >
                  <div style={{ position: "relative", paddingTop: "62%", overflow: "hidden" }}>
                    <img
                      src={img.src || img.url}
                      alt={img.alt || img.caption || "Flood Relief"}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s ease"
                      }}
                      loading="lazy"
                    />
                    <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "white", width: 32, height: 32, borderRadius: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaSearchPlus size={13} />
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <h5 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", margin: "0 0 6px" }}>
                      {img.name || img.caption || "Field Operation Photo"}
                    </h5>
                    {img.caption && (
                      <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                        {img.caption}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== VIDEOS (IF CONFIGURED BY ADMIN) ==================== */}
      <FieldVideosSection videos={videos} />

      {/* ==================== QUICK LINKS TO SUB-PAGES ==================== */}
      <section className="flood-subpages-section" style={{ paddingTop: 80, paddingBottom: 90, background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>All Relief Operations</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 16 }}>Explore Every Relief Mission</h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "1.05rem", margin: 0 }}>
              Browse detailed reports for each year of flood relief — from rescue operations to rehabilitation efforts across Andhra Pradesh.
            </p>
           
          </div>
          <div className="flood-subpages-grid" style={{ gap: 20 }}>
            {reliefYears.map((year, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flood-subpage-card"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 24,
                  padding: 32,
                  boxShadow: "0 10px 30px -5px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  minWidth: 0,
                  overflow: "hidden"
                }}
                whileHover={{ y: -6, boxShadow: "0 20px 45px -10px rgba(210, 25, 12, 0.12)", borderColor: "var(--color-primary)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, minWidth: 0, flexWrap: "wrap" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(210, 25, 12, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D2190C", flexShrink: 0 }}>
                    <FaShip size={18} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#D2190C", background: "rgba(210, 25, 12, 0.08)", padding: "4px 10px", borderRadius: 500, maxWidth: "100%", overflowWrap: "anywhere" }}>
                    {year.badge}
                  </span>
                </div>
                <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.2rem, 2.5vw, 1.4rem)", color: "var(--color-dark)", marginBottom: 8, lineHeight: 1.3, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  {year.title}
                </h4>
                {year.sub && (
                  <div style={{ fontSize: "0.86rem", color: "#64748b", fontWeight: 600, marginBottom: 10, lineHeight: 1.45, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                    {year.sub}
                  </div>
                )}
                <p style={{ color: "var(--color-text-light)", lineHeight: 1.6, fontSize: "0.88rem", marginBottom: 20, flex: 1, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  {year.desc}
                </p>
                <Link
                  to={year.link}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#D2190C",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textDecoration: "none"
                  }}
                >
                  Open Report <FaArrowRight size={11} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="flood-cta-section" style={{ paddingTop: 60, paddingBottom: 90, textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="flood-cta-box" style={{ background: "linear-gradient(135deg, var(--color-dark) 0%, #0E2B66 100%)", borderRadius: 28, padding: 56, color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 30% 20%, rgba(245,160,0,0.15), transparent 50%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <span style={{ color: "#F5A000", fontWeight: 800, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 2, marginBottom: 16, display: "block" }}>Support Relief Work</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", marginBottom: 22, lineHeight: 1.3 }}>Be First Responders</h2>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: 28, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                Every contribution helps ALERT reach more families in the critical 48-hour window after a flood — providing food, clean water and medical care to those who need it most.
              </p>
              <div className="flood-cta-actions" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/donate" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", fontSize: "1rem" }}>
                  Donate Now <FaArrowRight size={12} />
                </Link>
                <Link to="/contact" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 30px", fontSize: "1rem", borderColor: "rgba(255,255,255,0.4)", color: "white", background: "rgba(255,255,255,0.05)" }}>
                  Contact Us <FaArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PDF VIEWER MODAL ==================== */}
      <PdfViewerModal
        isOpen={Boolean(selectedPdf)}
        file={selectedPdf}
        onClose={() => setSelectedPdf(null)}
      />

      {/* ==================== IMAGE LIGHTBOX MODAL ==================== */}
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
              zIndex: 99999,
              background: "rgba(0, 0, 0, 0.88)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: 960,
                width: "100%",
                background: "#0f172a",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
              }}
            >
              <button
                onClick={() => setSelectedImg(null)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 500,
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2
                }}
              >
                <FaTimes size={16} />
              </button>
              <img
                src={selectedImg.src || selectedImg.url}
                alt={selectedImg.name || selectedImg.caption || "Enlarged Field Image"}
                style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", display: "block", background: "#000" }}
              />
              {(selectedImg.name || selectedImg.caption) && (
                <div style={{ padding: "18px 24px", color: "white" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>
                    {selectedImg.name || "Field Photo"}
                  </div>
                  {selectedImg.caption && (
                    <div style={{ fontSize: "0.88rem", color: "#94a3b8" }}>
                      {selectedImg.caption}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
