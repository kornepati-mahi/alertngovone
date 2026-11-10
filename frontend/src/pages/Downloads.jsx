import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  FaDownload,
  FaFilePdf,
  FaSearch,
  FaBalanceScale,
  FaUniversity,
  FaFolderOpen,
  FaEye,
  FaTimes
} from "react-icons/fa";
import { fetchDownloads, defaultDownloads } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";
import AnimatedTypewriter from "../components/AnimatedTypewriter";

export default function Downloads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterFromQuery = searchParams.get("filter") || "all";
  const [filter, setFilter] = useState(filterFromQuery);
  const [search, setSearch] = useState("");
  const [docList, setDocList] = useState(defaultDownloads);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Sync filter when URL ?filter= changes
  useEffect(() => {
    const qFilter = searchParams.get("filter");
    if (qFilter) {
      setFilter(qFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    fetchDownloads().then((res) => {
      if (isMounted) {
        if (res.data && res.data.length > 0) {
          setDocList(res.data);
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleFilterChange = (catId) => {
    setFilter(catId);
    setSearchParams(catId === "all" ? {} : { filter: catId });
  };



  const filteredDocs = docList.filter((d) => {
    const matchesCat = filter === "all" || d.category === filter;
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <style>{`
        .downloads-section {
          padding-top: 140px;
          scroll-margin-top: 96px;
        }
        .downloads-heading {
          text-align: center;
          max-width: 840px;
          margin: 0 auto 32px;
        }
        .downloads-typewriter-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 8px 18px;
          border-radius: 999px;
          box-shadow: 0 4px 14px -2px rgba(0, 49, 144, 0.05);
          margin-bottom: 24px;
        }
        .downloads-dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          flex-shrink: 0;
        }
        .downloads-toolbar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 32px;
        }
        .downloads-filter-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 4px 2px 8px;
          width: 100%;
        }
        .downloads-filter-bar::-webkit-scrollbar {
          display: none;
        }
        .downloads-filter-chip {
          white-space: nowrap;
          flex-shrink: 0;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
        }
        .downloads-filter-chip:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          transform: translateY(-1px);
        }
        .downloads-filter-chip.active {
          background: var(--color-primary, #D2190C);
          color: #ffffff;
          border-color: var(--color-primary, #D2190C);
          box-shadow: 0 4px 14px rgba(210, 25, 12, 0.28);
        }
        .downloads-search-wrap {
          position: relative;
          width: 100%;
        }
        .downloads-search-input {
          width: 100%;
          padding: 12px 42px 12px 42px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 0.92rem;
          color: var(--color-dark);
          box-shadow: 0 2px 10px rgba(0, 49, 144, 0.03);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .downloads-search-input:focus {
          outline: none;
          border-color: var(--color-primary, #D2190C);
          box-shadow: 0 0 0 3px rgba(210, 25, 12, 0.12);
        }
        .downloads-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 14px;
          pointer-events: none;
        }
        .downloads-search-clear {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          font-size: 11px;
        }
        .downloads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 22px;
        }
        .downloads-card-modern {
          background: #ffffff;
          padding: 24px 22px;
          border-radius: 18px;
          box-shadow: 0 4px 20px -2px rgba(0, 49, 144, 0.04);
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          position: relative;
        }
        .downloads-card-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 32px -6px rgba(0, 49, 144, 0.1);
          border-color: #cbd5e1;
        }
        .downloads-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .downloads-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(210, 25, 12, 0.08) 0%, rgba(245, 160, 0, 0.12) 100%);
          color: var(--color-primary, #D2190C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          flex-shrink: 0;
        }
        .downloads-format-badge {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .downloads-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-dark, #0f172a);
          line-height: 1.4;
          margin: 0 0 6px 0;
        }
        .downloads-card-meta {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-primary, #D2190C);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .downloads-card-desc {
          font-size: 0.86rem;
          color: var(--color-text-light, #64748b);
          line-height: 1.65;
          margin: 0 0 20px 0;
          flex: 1;
        }
        .downloads-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: auto;
          padding-top: 6px;
        }
        .downloads-view-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #D2190C 0%, #EA580C 100%);
          color: #ffffff;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(210, 25, 12, 0.22);
          transition: all 0.2s ease;
        }
        .downloads-view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(210, 25, 12, 0.32);
        }
        .downloads-save-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          text-align: center;
          background: #ffffff;
          color: var(--color-dark, #0f172a);
          border: 1.5px solid #cbd5e1;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .downloads-save-btn:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }
        @media (max-width: 768px) {
          .downloads-section {
            padding-top: 138px !important;
          }
          .downloads-heading {
            margin-bottom: 20px !important;
          }
          .downloads-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .downloads-card-modern {
            padding: 18px 16px !important;
            border-radius: 16px !important;
          }
          .downloads-card-title {
            font-size: 0.98rem !important;
          }
          .downloads-card-desc {
            font-size: 0.82rem !important;
            margin-bottom: 16px !important;
          }
          .downloads-view-btn,
          .downloads-save-btn {
            padding: 10px 10px !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>

      <section className="section-pad downloads-section hero" style={{ minHeight: "80vh" }}>
        <div className="container">
          {/* HEADER */}
          <div className="downloads-heading">
            <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>
              Resource Archive
            </span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
              Official Documents & Downloads
            </h1>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem", margin: "0 0 20px" }}>
              Statutory schedules, court petitions, official awards, and institutional reports maintained by the ALERT Legal Cell.
            </p>

            <div className="downloads-typewriter-pill">
              <span className="downloads-dot-pulse" aria-hidden="true" />
              <AnimatedTypewriter
                prefix="Archive Shelf:"
                prefixColor="#0f172a"
                highlightColor="#d97706"
                strings={[
                  "Central Bare Acts & Schedules",
                  "High Court Petitions & Orders",
                  "Polavaram Resettlement Awards",
                  "Statutory Guidelines & FAQs",
                  "ALERT Institutional Profiles"
                ]}
              />
            </div>
          </div>

          {/* TOOLBAR: HORIZONTAL CHIP FILTER & SEARCH */}
          <div className="downloads-toolbar">
            <div className="downloads-filter-bar">
              {[
                { id: "all", label: `All Documents (${docList.length})` },
                { id: "acts", label: "LA Act 2013 Schedules" },
                { id: "court", label: "Court Petitions & Awards" },
                { id: "faqs", label: "Statutory FAQs & Guidelines" },
                { id: "reports", label: "ALERT Organization Profile" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleFilterChange(c.id)}
                  className={`downloads-filter-chip ${filter === c.id ? "active" : ""}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="downloads-search-wrap">
              <input
                type="text"
                placeholder="Search documents by title or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="downloads-search-input"
              />
              <FaSearch className="downloads-search-icon" aria-hidden="true" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="downloads-search-clear"
                  title="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* DOCUMENT LIST */}
          <div className="downloads-grid">
            {filteredDocs.map((doc, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                className="downloads-card-modern"
              >
                <div className="downloads-card-top">
                  <span className="downloads-icon-wrap" aria-hidden="true">
                    <FaFilePdf />
                  </span>
                  <span className="downloads-format-badge">
                    {doc.fileSize || "Official PDF"}
                  </span>
                </div>

                <h3 className="downloads-card-title">{doc.title}</h3>
                <div className="downloads-card-meta">{doc.meta}</div>
                <p className="downloads-card-desc">{doc.desc}</p>

                <div className="downloads-card-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedPdf(doc)}
                    className="downloads-view-btn"
                  >
                    <FaEye size={12} /> View PDF
                  </button>
                  <a
                    href={doc.file}
                    download
                    className="downloads-save-btn"
                  >
                    <FaDownload size={11} /> Save
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE PDF VIEWER MODAL */}
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
