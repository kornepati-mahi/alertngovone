import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaFileContract,
  FaBalanceScale,
  FaUsers,
  FaHeart,
  FaLeaf,
  FaAward,
  FaFilePdf,
  FaStar,
  FaLandmark,
  FaGavel,
  FaHandshake,
  FaLock,
  FaEye
} from "react-icons/fa";
import { fetchAboutPage, defaultAboutPages } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";

const ICON_MAP = {
  FaUsers,
  FaBalanceScale,
  FaLeaf,
  FaFileContract,
  FaShieldAlt,
  FaAward,
  FaHeart,
  FaGavel,
  FaStar,
  FaLandmark,
  FaHandshake,
  FaLock,
  FaEye
};

function renderPolicyIcon(iconName, accent = "#D2190C", size = 26) {
  const Component = ICON_MAP[iconName] || FaFileContract;
  return <Component size={size} color={accent} />;
}

export default function AlertPolicies() {
  const [pageData, setPageData] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        const item = parsed?.["alert-policies"] || parsed?.["about"];
        if (item) {
          return {
            ...defaultAboutPages["alert-policies"],
            ...item,
            content: {
              ...defaultAboutPages["alert-policies"]?.content,
              ...(item.content || {})
            }
          };
        }
      }
    } catch {}
    return defaultAboutPages["alert-policies"];
  });
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      // 1. Check local storage first for instant synchronization
      try {
        const local = localStorage.getItem("alertngo_about_pages");
        if (local) {
          const parsed = JSON.parse(local);
          const item = parsed?.["alert-policies"] || parsed?.["about"];
          if (item && isMounted) {
            setPageData({
              ...defaultAboutPages["alert-policies"],
              ...item,
              content: {
                ...defaultAboutPages["alert-policies"]?.content,
                ...(item.content || {})
              }
            });
          }
        }
      } catch {}

      // 2. Fetch from backend
      try {
        const res = await fetchAboutPage("alert-policies");
        const page = res?.data || res;
        if (page && isMounted) {
          setPageData((prev) => ({
            ...prev,
            ...defaultAboutPages["alert-policies"],
            ...page,
            content: {
              ...defaultAboutPages["alert-policies"]?.content,
              ...(prev.content || {}),
              ...(page.content || {})
            }
          }));
        }
      } catch (err) {
        console.warn("Could not load alert-policies data:", err);
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

  const content = pageData?.content || defaultAboutPages["alert-policies"].content;
  const policiesList = Array.isArray(content.policies)
    ? content.policies
    : defaultAboutPages["alert-policies"].content.policies;
  const commitmentTags = Array.isArray(content.commitment_tags)
    ? content.commitment_tags
    : defaultAboutPages["alert-policies"].content.commitment_tags || [];

  return (
    <>
      <style>{`
        .policy-hero-section {
          padding-top: 140px;
          padding-bottom: 0;
        }
        .policy-card-responsive {
          padding: 36px;
          border-radius: 28px;
          box-sizing: border-box;
          width: 100%;
        }
        .policy-commitment-section {
          padding-top: 60px;
          padding-bottom: 80px;
          background: #ffffff;
          width: 100%;
        }
        .policy-commitment-card {
          background: linear-gradient(135deg, var(--color-dark) 0%, #0E2B66 100%);
          border-radius: 28px;
          padding: 48px 40px;
          color: white;
          position: relative;
          overflow: hidden;
          text-align: center;
          box-sizing: border-box;
          width: 100%;
        }

        @media (max-width: 768px) {
          .policy-hero-section {
            padding-top: 175px !important;
          }
          .policy-card-responsive {
            padding: 22px 18px !important;
            border-radius: 20px !important;
          }
          .policy-commitment-section {
            padding-top: 36px !important;
            padding-bottom: 48px !important;
          }
          .policy-commitment-card {
            padding: 26px 16px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
      {/* ==================== HERO SECTION ==================== */}
      <section
        id="alert-policies"
        className="policy-hero-section"
        style={{
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
              {pageData.badge || "Section 05"}
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
              {pageData.title || "ALERT Policies"}
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
                "Formal institutional charters that govern every ALERT intervention — ensuring integrity, accountability, and community-first decision-making."}
            </p>
          </motion.div>

          {/* ==================== POLICIES GRID ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 24,
              marginBottom: 90
            }}
          >
            {policiesList.map((policy, i) => {
              const accentColor = policy.accent || "#003190";
              const highlights = Array.isArray(policy.highlights) ? policy.highlights : [];
              return (
                <motion.div
                  key={policy.id || i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.7 }}
                  whileHover={{ y: -8, boxShadow: `0 30px 60px -15px ${accentColor}25`, borderColor: accentColor }}
                  className="policy-card-responsive"
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #fdfdff 100%)",
                    border: `1px solid ${accentColor}20`,
                    borderTop: `4px solid ${accentColor}`,
                    borderRadius: 28,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
                    padding: 36,
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Top accent glow */}
                  <div
                    style={{
                      position: "absolute",
                      top: -40,
                      left: -40,
                      width: 120,
                      height: 120,
                      background: `radial-gradient(circle, ${accentColor}18, transparent 70%)`,
                      borderRadius: "50%",
                      zIndex: 0,
                      pointerEvents: "none"
                    }}
                  />

                  {/* Category badge */}
                  <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        minHeight: 48,
                        borderRadius: 14,
                        background: `${accentColor}14`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: accentColor,
                        boxShadow: `0 8px 18px ${accentColor}20`,
                        overflow: "hidden",
                        flexShrink: 0
                      }}
                    >
                      {renderPolicyIcon(policy.icon, accentColor, 24)}
                    </div>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: accentColor
                      }}
                    >
                      {policy.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(1.3rem, 2.5vw, 1.55rem)",
                      color: "var(--color-dark)",
                      marginBottom: 14,
                      lineHeight: 1.3,
                      position: "relative",
                      zIndex: 2
                    }}
                  >
                    {policy.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      position: "relative",
                      zIndex: 2,
                      color: "var(--color-text-light)",
                      lineHeight: 1.75,
                      fontSize: "0.92rem",
                      marginBottom: 24,
                      flex: 1
                    }}
                  >
                    {policy.desc}
                  </p>

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
                      {highlights.map((h, hi) => (
                        <span
                          key={hi}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 500,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: `${accentColor}10`,
                            color: accentColor,
                            border: `1px solid ${accentColor}35`
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ==================== POLICY COMMITMENT ==================== */}
      <section className="policy-commitment-section">
        <div className="container">
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="policy-commitment-card">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 30% 20%, rgba(245,160,0,0.15), transparent 50%)",
                  pointerEvents: "none"
                }}
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                <span
                  style={{
                    color: "#F5A000",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: 2,
                    marginBottom: 14,
                    display: "block"
                  }}
                >
                  {content.commitment_badge || "Our Commitment"}
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(1.6rem, 4vw, 2.3rem)",
                    marginBottom: 18,
                    lineHeight: 1.3
                  }}
                >
                  {content.commitment_title || "Principles in Practice"}
                </h2>
                <p
                  style={{
                    fontSize: "0.98rem",
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.75,
                    marginBottom: 24,
                    maxWidth: 580,
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}
                >
                  {content.commitment_desc ||
                    "ALERT's policies are not just documents — they are lived every day in the field. From Gram Sabha meetings to courtroom advocacy, from women's cooperative governance to disaster relief operations, these principles shape every decision, relationship, and outcome."}
                </p>
                {commitmentTags.length > 0 && (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {commitmentTags.map((v, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 500,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          background: "rgba(245,160,0,0.12)",
                          color: "#F5A000",
                          border: "1px solid rgba(245,160,0,0.3)"
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DOWNLOAD POLICY DOCUMENT ==================== */}
      {content.pdf_file && (
        <section style={{ textAlign: "center", marginTop: 10, paddingBottom: 60 }}>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
            <button
              type="button"
              onClick={() =>
                setSelectedPdf({
                  file: content.pdf_file,
                  title: content.pdf_title || "Organizational Profile & Policies",
                  meta: content.pdf_meta || "Official Society Record • Governance & Policy Document"
                })
              }
              className="btn-primary btn-responsive-pdf"
            >
              <FaFilePdf size={14} /> {content.pdf_btn_label || "Download Policy Document PDF"}
            </button>
          </div>
        </section>
      )}

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
