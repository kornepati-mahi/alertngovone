import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilePdf,
  FaDownload,
  FaTable,
  FaImages,
  FaArrowLeft,
  FaSearch,
  FaTimes,
  FaEye,
  FaFileAlt,
  FaVideo,
  FaPlay,
  FaEdit,
  FaExternalLinkAlt
} from "react-icons/fa";
import { fetchPageBySlug } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";
import { DEFAULT_STATS_BY_SLUG, renderStatIcon } from "../utils/statIcons";

export default function PageDetail() {
  const categoryColorMap = {
    "Polavaram LA & R&R": "#D2190C",
    "Land Acquisition": "#003190",
    "Court Cases": "#7C2D12",
    "RoFR": "#3E8E0F",
    "RoFR & LTR": "#059669",
    "Forest Rights & LTR": "#059669",
    "Grievance": "#D2190C",
    "Download": "#003190"
  };
  const params = useParams();
  const location = useLocation();
  // /page/:slug and /:slug give a route param; hardcoded routes like /quick-links don't —
  // fall back to the pathname so those pages fetch their real slug instead of an empty one.
  const slug = params.slug || location.pathname.replace(/^\/+/, "").replace(/^page\//, "").replace(/\/+$/, "");
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState("");
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    return (
      (typeof sessionStorage !== "undefined" && !!sessionStorage.getItem("alertngo_admin_key")) ||
      (typeof localStorage !== "undefined" && !!localStorage.getItem("alertngo_admin_key"))
    );
  });

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
    let isMounted = true;
    setLoading(true);

    const loadData = () => {
      fetchPageBySlug(slug).then((res) => {
        if (isMounted) {
          setPage(res.data);
          setLoading(false);
        }
      });
    };

    loadData();
    window.scrollTo(0, 0);

    const updateHandler = (e) => {
      const targetSlug = (e?.detail?.slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
      const currentClean = (slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
      if (!targetSlug || targetSlug === currentClean) {
        loadData();
      }
    };
    window.addEventListener("alertngo_page_updated", updateHandler);
    window.addEventListener("storage", updateHandler);

    return () => {
      isMounted = false;
      window.removeEventListener("alertngo_page_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 170 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: "center" }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--gradient-primary)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, animation: "spin 1s linear infinite" }}>
            <FaDownload size={20} />
          </div>
          <div style={{ fontSize: "1.25rem", color: "var(--color-primary)", fontWeight: 800, marginBottom: 12 }}>
            Loading Content…
          </div>
          <p style={{ color: "var(--color-text-light)" }}>Fetching page data from ALERT repository</p>
        </motion.div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="section-pad" style={{ paddingTop: 170 }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 600 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
              <FaTimes size={18} />
            </div>
          </motion.div>
          <h2 style={{ fontSize: "2rem", marginBottom: 16 }}>Document Not Found</h2>
          <p style={{ color: "var(--color-text-light)", marginBottom: 24 }}>
            The requested document slug <code>{slug}</code> could not be located.
          </p>
          <Link to="/downloads" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <FaArrowLeft /> Browse All Documents
          </Link>
        </div>
      </div>
    );
  }

  const categoryColor = categoryColorMap[page.category] || "#64748b";

  const isRealImg = (img) => {
    const src = img.src || img.url;
    return (
      src &&
      !src.includes("wps-visitor-counter") &&
      !src.endsWith(".gif") &&
      !src.includes("alert-logo") &&
      !src.toLowerCase().includes("logo") &&
      !src.includes("embed-any-document") &&
      !["loading", "reload", "open"].includes((img.name || img.alt || img.caption || "").toLowerCase())
    );
  };

  const paragraphs = Array.isArray(page.paragraphs) && page.paragraphs.length > 0 ? page.paragraphs : (Array.isArray(page.content?.paragraphs) ? page.content.paragraphs : []);
  const downloads = Array.isArray(page.downloads) && page.downloads.length > 0 ? page.downloads : (Array.isArray(page.content?.downloads) ? page.content.downloads : []);
  const tables = Array.isArray(page.tables) && page.tables.length > 0 ? page.tables : (Array.isArray(page.content?.tables) ? page.content.tables : []);
  const rawImages = Array.isArray(page.images) && page.images.length > 0 ? page.images : (Array.isArray(page.content?.images) ? page.content.images : []);
  const videos = Array.isArray(page.videos) && page.videos.length > 0 ? page.videos : (Array.isArray(page.content?.videos) ? page.content.videos : []);

  const hasContent =
    paragraphs.length > 0 ||
    downloads.length > 0 ||
    tables.length > 0 ||
    rawImages.filter(isRealImg).length > 0 ||
    videos.length > 0;

  const rawStats = (Array.isArray(page.stats) && page.stats.length > 0)
    ? page.stats
    : (Array.isArray(page.content?.stats) && page.content.stats.length > 0
      ? page.content.stats
      : (DEFAULT_STATS_BY_SLUG[slug] || []));
  const pageStats = (rawStats || []).map((s) => ({
    ...s,
    num: s.num || s.value || "—",
    label: s.label || s.title || "Key Metric",
    color: s.color || "#003190",
    icon: s.icon || "chart"
  }));

  const getAdminEditUrl = () => {
    const s = (slug || "").toLowerCase();
    const cat = (page?.category || "").toLowerCase();

    // Grievance sub-pages
    if (["abstract", "rr-grievances", "types-of-grievances", "rr-grievance-full-forms"].includes(s) || (cat.includes("grievance") && !s.includes("polavaram"))) {
      return `/admin/partner?tab=grievance_pages&slug=${slug}`;
    }
    // Download sub-pages
    if (["legislative-acts-2", "gos", "rr-gos", "others"].includes(s) || (cat.includes("download") && !s.includes("achieve") && !s.includes("quick"))) {
      return `/admin/partner?tab=download_pages&slug=${slug}`;
    }
    // Quick Links page
    if (s === "quick-links" || s.includes("quick-link")) {
      return `/admin/partner?tab=quick_links&slug=quick-links`;
    }

    if (s.includes("achieve") || s.includes("child") || s.includes("report") || s.includes("portfolio") || cat.includes("achieve") || cat.includes("child") || cat.includes("report") || cat.includes("portfolio")) {
      return `/admin/achievements?slug=${slug}&tab=stats`;
    }
    if (s.includes("flood") || s.includes("blanket") || s.includes("grocer") || cat.includes("flood") || cat.includes("relief")) {
      return `/admin/flood-relief?slug=${slug}&tab=stats`;
    }
    if (s.includes("rofr") || s.includes("ltr") || cat.includes("rofr") || cat.includes("ltr")) {
      return `/admin/rofr?slug=${slug}&tab=stats`;
    }
    if (s.includes("polavaram") || s.includes("submergence") || cat.includes("polavaram")) {
      return `/admin/polavaram?slug=${slug}&tab=stats`;
    }
    if (s.includes("la-rr") || s.includes("larr") || s.includes("case") || s.includes("act") || s.includes("petition") || cat.includes("la & rr") || cat.includes("land acquisition")) {
      return `/admin/la-rr?slug=${slug}&tab=stats`;
    }
    return `/admin/all-pages?slug=${slug}`;
  };

  return (
    <>
      <style>{`
        .pagedetail-section {
          padding-top: 140px;
        }
        .pagedetail-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 44px;
        }
        .pagedetail-downloads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: 18px;
          width: 100%;
        }
        .pagedetail-dl-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 20px;
          box-shadow: var(--shadow-sm);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .pagedetail-dl-actions {
          display: flex;
          gap: 10px;
          width: 100%;
        }
        .pagedetail-dl-btn {
          flex: 1 1 110px;
          padding: 11px 16px;
          font-size: 0.82rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 12px;
          box-sizing: border-box;
          text-align: center;
        }
        .pagedetail-images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: 20px;
          width: 100%;
        }
        .pagedetail-videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: 20px;
          width: 100%;
        }
        .pagedetail-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          padding: 24px 28px;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        .pagedetail-search-box {
          position: relative;
          width: 100%;
          max-width: 280px;
          flex: 1 1 200px;
        }
        .pagedetail-section h1 {
          margin-top: 0;
          word-break: break-word;
        }
        @media (max-width: 768px) {
          .pagedetail-section {
            padding-top: 138px !important;
          }
          .pagedetail-section > .container {
            padding-top: 8px !important;
          }
          .pagedetail-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 28px !important;
          }
          .pagedetail-downloads-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .pagedetail-dl-card {
            padding: 18px 16px !important;
            border-radius: 16px !important;
          }
          .pagedetail-dl-actions {
            flex-wrap: wrap;
            gap: 8px;
          }
          .pagedetail-dl-btn {
            flex: 1 1 100%;
            padding: 10px 14px !important;
          }
          .pagedetail-images-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .pagedetail-videos-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .pagedetail-table-header {
            padding: 16px 14px !important;
          }
          .pagedetail-search-box {
            max-width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .pagedetail-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>
      {/* CONTENT SECTION */}
      <section className="hero section-pad pagedetail-section" style={{ background: "var(--color-bg)" }}>
        <div className="container" style={{ maxWidth: 1100, paddingTop: 20 }}>

          {/* PAGE TITLE & SUBTITLE */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ maxWidth: "100%" }}>
              <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "var(--color-dark)", marginBottom: 8, letterSpacing: -0.5, wordBreak: "break-word" }}>
                {page.title}
              </h1>
              {page.subtitle && (
                <p style={{ fontSize: "0.98rem", color: "var(--color-text-light)", margin: 0, maxWidth: 780, lineHeight: 1.6, wordBreak: "break-word" }}>
                  {page.subtitle}
                </p>
              )}
            </div>

            {isAdmin && (
              <Link
                to={getAdminEditUrl()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(0, 49, 144, 0.08)",
                  color: "#003190",
                  border: "1px solid rgba(0, 49, 144, 0.2)",
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                title="Open this page in Admin Panel to edit stat cards, documents, images or content"
              >
                <FaEdit size={12} /> Admin Edit Page
              </Link>
            )}
          </div>

          {/* DYNAMIC IMPACT STAT CARDS */}
          {pageStats && pageStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pagedetail-stats-grid"
            >
              {pageStats.map((st, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    background: "#ffffff",
                    borderRadius: 18,
                    padding: "20px 16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px -4px rgba(0, 49, 144, 0.06)",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: st.color || "#003190" }} />
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${st.color || "#003190"}14`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      color: st.color || "#003190"
                    }}
                  >
                    {renderStatIcon(st.icon, st.color || "#003190", 20)}
                  </div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 6, fontFamily: "serif" }}>
                    {st.num || st.value || "—"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, letterSpacing: 0.2 }}>
                    {st.label || "Key Metric"}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* PARAGRAPHS / OVERVIEW */}
          {paragraphs && paragraphs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ background: "#ffffff", borderRadius: 24, boxShadow: "var(--shadow-lg)", border: "1px solid #f1f5f9", marginBottom: 48, overflow: "hidden" }}
            >
              <div style={{ padding: "clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px) 20px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(${categoryColor === "#D2190C" ? "210,25,12" : categoryColor === "#003190" ? "0,49,144" : "100,100,100"}, 0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: categoryColor, flexShrink: 0 }}>
                    <FaFileAlt size={18} />
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.5, wordBreak: "break-word" }}>Overview & Description</h3>
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: categoryColor, marginTop: 4 }}>Official Record • ALERT Legal Cell</div>
              </div>
              <div style={{ padding: "20px clamp(18px, 4vw, 40px) clamp(20px, 4vw, 40px)", display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                {paragraphs.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                      <span style={{ color: categoryColor, fontWeight: 800, fontSize: "0.85rem", marginTop: 2, flexShrink: 0 }}>{idx + 1}</span>
                      <p style={{ color: "var(--color-text)", lineHeight: 1.8, fontSize: "0.95rem", margin: 0, wordBreak: "break-word" }}>{p}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DOWNLOADS SECTION */}
          {downloads && downloads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ marginBottom: 48 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26, paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #D2190C 0%, #F5A000 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 8px 20px rgba(210,25,12,0.35)", flexShrink: 0 }}>
                  <FaDownload size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.5, wordBreak: "break-word" }}>Attached Official Documents</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)", fontWeight: 600 }}>{downloads.length} file{downloads.length !== 1 ? "s" : ""} available</div>
                </div>
              </div>
              <div className="pagedetail-downloads-grid">
                {downloads.map((dl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07, duration: 0.5 }}
                    whileHover={{ y: -6, boxShadow: "0 24px 48px -12px rgba(210,25,12,0.25)", borderColor: "#D2190C" }}
                    className="pagedetail-dl-card"
                  >
                    <div style={{ position: "absolute", top: 0, right: 0, width: 44, height: 44, background: "rgba(210,25,12,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaFilePdf size={16} color="#D2190C" style={{ opacity: 0.7 }} />
                    </div>
                    <div style={{ zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#D2190C", marginBottom: 10 }}>Official PDF</div>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word" }}>
                        {dl.title || dl.text || dl.name || dl.filename || "Official Document"}
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginBottom: 20, lineHeight: 1.5, flex: 1, wordBreak: "break-word" }}>{dl.filename || dl.size || ""}</p>
                      <div className="pagedetail-dl-actions">
                        {(() => {
                          const dlUrlRaw = dl.url || dl.file || "";
                          const dlUrl = dlUrlRaw.includes(" ") ? dlUrlRaw.replace(/ /g, "%20") : dlUrlRaw;
                          const dlTitle = dl.title || dl.text || dl.name || dl.filename || "Official Document";
                          return (
                            <>
                              <button
                                onClick={() => setSelectedPdf({
                                  url: dlUrl,
                                  file: dlUrl,
                                  title: dlTitle,
                                  meta: dl.meta || dl.category || "Official Legal Dossier"
                                })}
                                className="btn-primary pagedetail-dl-btn"
                                style={{ borderRadius: 12, background: "linear-gradient(135deg, #D2190C 0%, #F5A000 100%)", color: "white", border: "none", boxShadow: "0 8px 20px rgba(210,25,12,0.35)", cursor: "pointer" }}
                              >
                                <FaEye size={12} /> View
                              </button>
                              <a
                                href={dlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="pagedetail-dl-btn"
                                style={{ textDecoration: "none", color: categoryColor, border: `2px solid ${categoryColor}`, background: "transparent" }}
                              >
                                <FaDownload size={12} /> Download
                              </a>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STRUCTURED TABLES */}
          {tables && tables.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ marginBottom: 48 }}
            >
              {tables.map((tbl, tIdx) => {
                const filteredRows = tbl.rows.filter(row =>
                  row.some(cell => String(cell).toLowerCase().includes(tableSearch.toLowerCase()))
                );

                return (
                  <div key={tIdx} style={{ background: "#ffffff", borderRadius: 24, boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9", marginBottom: 32, overflow: "hidden" }}>
                    <div className="pagedetail-table-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(210,25,12,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D2190C", flexShrink: 0 }}>
                          <FaTable size={16} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.5, wordBreak: "break-word" }}>{tbl.title || "Official Records & Data Table"}</h3>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-light)", fontWeight: 600 }}>Statutory Data & Records</div>
                        </div>
                      </div>
                      <div className="pagedetail-search-box">
                        <input
                          type="text"
                          placeholder="Filter table rows…"
                          value={tableSearch}
                          onChange={(e) => setTableSearch(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 14px 9px 38px",
                            borderRadius: 14,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.85rem",
                            outline: "none",
                            boxShadow: "none",
                            background: "#ffffff",
                            boxSizing: "border-box"
                          }}
                        />
                        <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                        <thead>
                          <tr style={{ background: "#f1f5f9", borderBottom: "3px solid #cbd5e1" }}>
                            {tbl.headers.map((h, hIdx) => (
                              <th key={hIdx} style={{ padding: "10px 16px", fontWeight: 800, color: "var(--color-dark)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "2px solid #e2e8f0", textAlign: "left", whiteSpace: "nowrap" }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.length > 0 ? (
                            filteredRows.map((r, rIdx) => (
                              <tr key={rIdx} style={{ borderBottom: "1px solid #f1f5f9", background: rIdx % 2 === 0 ? "#ffffff" : "#fafbfc", transition: "all 0.2s ease" }}>
                                {r.map((c, cIdx) => {
                                  const cStr = String(c || "").trim();
                                  const isUrl = cStr.toLowerCase().startsWith("http://") || cStr.toLowerCase().startsWith("https://");
                                  const isPdf = isUrl && (cStr.toLowerCase().endsWith(".pdf") || cStr.toLowerCase().includes(".pdf") || cStr.toLowerCase().includes("drive.google"));
                                  const isEmpty = cStr === "";
                                  const colTitle = tbl.headers?.[cIdx] || `Document ${cIdx + 1}`;
                                  return (
                                    <td
                                      key={cIdx}
                                      style={{
                                        padding: "10px 16px",
                                        color: "var(--color-text)",
                                        verticalAlign: "middle",
                                        borderBottom: "1px solid #f1f5f9"
                                      }}
                                    >
                                      {isEmpty ? (
                                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.82rem" }}>—</span>
                                      ) : isPdf ? (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedPdf({ url: cStr, title: colTitle })}
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "6px 14px",
                                            background: "rgba(210,25,12,0.08)",
                                            color: "#D2190C",
                                            fontWeight: 700,
                                            fontSize: "0.8rem",
                                            border: "1px solid rgba(210,25,12,0.2)",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.15s ease",
                                            whiteSpace: "nowrap"
                                          }}
                                        >
                                          <FaFilePdf size={13} style={{ flexShrink: 0 }} /> View PDF
                                        </button>
                                      ) : isUrl ? (
                                        <a
                                          href={cStr}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "6px 14px",
                                            background: "rgba(0, 49, 144, 0.08)",
                                            color: "#003190",
                                            fontWeight: 700,
                                            fontSize: "0.8rem",
                                            border: "1px solid rgba(0, 49, 144, 0.2)",
                                            borderRadius: 8,
                                            textDecoration: "none",
                                            transition: "all 0.15s ease",
                                            whiteSpace: "nowrap"
                                          }}
                                        >
                                          <FaExternalLinkAlt size={11} style={{ flexShrink: 0 }} /> Open Portal
                                        </a>
                                      ) : (
                                        <span style={{ display: "block", fontSize: "0.85rem", fontWeight: cIdx === 0 ? 600 : 400 }}>{c}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={tbl.headers.length || 1} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                                No rows matching search filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ padding: "14px 20px", fontSize: "0.8rem", color: "var(--color-text-light)", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
                      Showing <strong style={{ color: categoryColor }}>{filteredRows.length}</strong> of <strong>{tbl.rows.length}</strong> records.
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* IMAGES & CHARTS */}
          {rawImages && rawImages.filter(isRealImg).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ marginBottom: 48 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #003190 0%, #38BDF8 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 8px 20px rgba(0,49,144,0.35)", flexShrink: 0 }}>
                  <FaImages size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.5, wordBreak: "break-word" }}>Field Evidence & Maps</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)", fontWeight: 600 }}>{rawImages.filter(isRealImg).length} visual record{rawImages.filter(isRealImg).length !== 1 ? "s" : ""} available</div>
                </div>
              </div>
              <div className="pagedetail-images-grid">
                {rawImages.map((img, idx) => {
                  const isCounterGif = !isRealImg(img);
                  if (isCounterGif) return null;
                  const imgSrcRaw = img.src || img.url || "";
                  const imgSrc = imgSrcRaw.includes(" ") ? imgSrcRaw.replace(/ /g, "%20") : imgSrcRaw;
                  const imgTitle = img.name || img.caption || img.alt || "Official Map Record";
                  return (
                    <motion.div
                      key={imgSrc || idx}
                      whileHover={{ y: -8, boxShadow: "0 24px 48px -12px rgba(0,49,144,0.2)" }}
                      style={{
                        background: "#ffffff",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "var(--shadow-sm)",
                        border: "1px solid #f1f5f9",
                        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        boxSizing: "border-box"
                      }}
                    >
                      <div
                        onClick={() => setSelectedImg({ src: imgSrc, name: imgTitle, caption: img.caption })}
                        style={{ height: 240, overflow: "hidden", background: "#f8fafc", position: "relative", cursor: "pointer" }}
                      >
                        <img
                          src={imgSrc}
                          alt={imgTitle}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.65)", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {slug.includes("map") ? "Contour Map" : "Visual Record"}
                        </div>
                      </div>
                      <div style={{ padding: "16px 16px 18px", borderTop: "1px solid #f1f5f9", flex: 1, display: "flex", flexDirection: "column" }}>
                        <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 6, lineHeight: 1.4, wordBreak: "break-word" }}>{imgTitle}</p>
                        {img.caption && img.caption !== imgTitle && (
                          <p style={{ fontSize: "0.82rem", color: "var(--color-text-light)", marginBottom: 12, lineHeight: 1.5, wordBreak: "break-word" }}>{img.caption}</p>
                        )}
                        <div style={{ marginTop: "auto", display: "flex", gap: 8, paddingTop: 10, flexWrap: "wrap" }}>
                          <button
                            onClick={() => setSelectedImg({ src: imgSrc, name: imgTitle, caption: img.caption })}
                            style={{ flex: "1 1 110px", padding: "9px 12px", borderRadius: 10, background: "var(--color-primary)", color: "white", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, boxSizing: "border-box" }}
                          >
                            <FaEye size={12} /> View Map
                          </button>
                          <a
                            href={imgSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            style={{ flex: "1 1 110px", padding: "9px 12px", borderRadius: 10, background: "#f1f5f9", color: "#003190", border: "1px solid #e2e8f0", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, boxSizing: "border-box" }}
                          >
                            <FaDownload size={12} /> Download
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* VIDEOS & MULTIMEDIA */}
          {videos && videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ marginBottom: 48 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #E11D48 0%, #FB7185 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 8px 20px rgba(225,29,72,0.35)", flexShrink: 0 }}>
                  <FaVideo size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.5, wordBreak: "break-word" }}>Field Videos & Video Reports</h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)", fontWeight: 600 }}>{videos.length} video{videos.length !== 1 ? "s" : ""} available</div>
                </div>
              </div>
              <div className="pagedetail-videos-grid">
                {videos.map((vid, vIdx) => {
                  const isYouTube = vid.url && (vid.url.includes("youtube.com") || vid.url.includes("youtu.be"));
                  let ytEmbedUrl = "";
                  if (isYouTube) {
                    const match = vid.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                    if (match && match[1]) {
                      ytEmbedUrl = `https://www.youtube.com/embed/${match[1]}`;
                    }
                  }
                  return (
                    <motion.div
                      key={vIdx}
                      whileHover={{ y: -6, boxShadow: "0 24px 48px -12px rgba(225,29,72,0.2)" }}
                      style={{
                        background: "#ffffff",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "var(--shadow-sm)",
                        border: "1px solid #f1f5f9",
                        display: "flex",
                        flexDirection: "column",
                        boxSizing: "border-box"
                      }}
                    >
                      <div style={{ background: "#000000", position: "relative", width: "100%", aspectRatio: "16/9" }}>
                        {ytEmbedUrl ? (
                          <iframe
                            src={ytEmbedUrl}
                            title={vid.title || "Video"}
                            style={{ width: "100%", height: "100%", border: "none" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            src={vid.url}
                          />
                        )}
                      </div>
                      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--color-dark)", margin: "0 0 6px", wordBreak: "break-word" }}>
                          {vid.title || "Field Video Record"}
                        </h4>
                        {vid.description && (
                          <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)", margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>
                            {vid.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* EMPTY STATE — page exists but has no published content yet */}
          {!hasContent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                background: "#ffffff",
                borderRadius: 24,
                boxShadow: "var(--shadow-sm)",
                border: "1px solid #f1f5f9",
                padding: "clamp(40px, 7vw, 72px) 28px",
                textAlign: "center",
                maxWidth: 640,
                margin: "0 auto 48px",
              }}
            >
              <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(0,49,144,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#003190", margin: "0 auto 20px" }}>
                <FaFileAlt size={24} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: 10 }}>Nothing published here yet</h3>
              <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: 24 }}>
                This page is set up, but its documents, tables or images have not been added yet.
                Please check back soon — or reach out to ALERT's office if you need this record urgently.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/downloads" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "auto", padding: "11px 22px", fontSize: "0.85rem" }}>
                  <FaArrowLeft size={12} /> Browse All Documents
                </Link>
                <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", fontSize: "0.85rem", fontWeight: 700, color: "#003190", border: "2px solid #003190", borderRadius: 12, textDecoration: "none" }}>
                  Contact Us
                </Link>
              </div>
            </motion.div>
          )}

          {/* BACK TO DIRECTORY */}
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <motion.a
              href="/downloads"
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 34px", background: "var(--color-dark)", color: "white", textDecoration: "none", borderRadius: 14, fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 20px 40px -10px rgba(6,24,66,0.35)", transition: "all 0.3s ease" }}
            >
              <FaArrowLeft size={14} /> View All Downloads & Acts
            </motion.a>
          </div>
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
              background: "rgba(8,10,14,0.92)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              backdropFilter: "blur(4px)"
            }}
          >
            <div style={{ position: "relative", maxWidth: "92vw", maxHeight: "92vh", onClick: (e) => e.stopPropagation() }}>
              <button
                onClick={() => setSelectedImg(null)}
                style={{
                  position: "absolute",
                  top: -48,
                  right: 0,
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.2s ease"
                }}
              >
                <FaTimes />
              </button>
              <img
                src={selectedImg.src || selectedImg.url}
                alt={selectedImg.name || selectedImg.caption || selectedImg.alt || "Map / Visual Record"}
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 16, display: "block", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", margin: "0 auto" }}
                loading="lazy"
                decoding="async" />
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <p style={{ color: "rgba(255,255,255,0.95)", margin: "0 0 6px", fontSize: "1rem", fontWeight: 700 }}>
                  {selectedImg.name || selectedImg.caption || selectedImg.alt || "Official Record"}
                </p>
                {selectedImg.caption && selectedImg.caption !== selectedImg.name && (
                  <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 10px", fontSize: "0.85rem" }}>
                    {selectedImg.caption}
                  </p>
                )}
                <a
                  href={selectedImg.src || selectedImg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-primary)", color: "white", padding: "6px 16px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}
                >
                  <FaDownload size={11} /> Download Original Image
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Modal Viewer */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={true}
          file={selectedPdf.file || selectedPdf.url || selectedPdf.fileUrl}
          title={selectedPdf.title}
          meta={selectedPdf.meta}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </>
  );
}
