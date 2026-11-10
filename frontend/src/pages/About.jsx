import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { FaFilePdf, FaUsers, FaEye, FaBullseye } from "react-icons/fa";
import PdfViewerModal from "../components/PdfViewerModal";
import AreaOfOperationExplorer from "../components/AreaOfOperationExplorer";
import PoliciesDirectory from "../components/PoliciesDirectory";
import InteractiveOrganogram from "../components/InteractiveOrganogram";
import InteractiveTimeline from "../components/InteractiveTimeline";
import FlipCard from "../components/FlipCard";
import ErrorBoundary from "../components/ErrorBoundary";
import { defaultAboutPages } from "../api/client";

/* ─── Helpers ────────────────────────────────────────────────────── */
const STORAGE_KEY = "alertngo_about_pages";

/** Read the admin-saved "about" page data from localStorage.
 *  Returns the full page object (with .content) or null. */
function readAdminAboutData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Handle both { about: {...} } and { data: { about: {...} } }
      const candidate = parsed?.["about"] ?? parsed?.data?.["about"];
      const alertPolicies = parsed?.["alert-policies"] ?? parsed?.data?.["alert-policies"];
      if (candidate && typeof candidate === "object") {
        if (
          (!Array.isArray(candidate.content?.policies) || candidate.content.policies.length === 0) &&
          Array.isArray(alertPolicies?.content?.policies) &&
          alertPolicies.content.policies.length > 0
        ) {
          candidate.content = {
            ...(candidate.content || {}),
            policies: alertPolicies.content.policies,
            portal_badge: alertPolicies.content.portal_badge,
            portal_cert: alertPolicies.content.portal_cert,
            portal_title: alertPolicies.content.portal_title,
            portal_desc: alertPolicies.content.portal_desc,
            portal_status_badge: alertPolicies.content.portal_status_badge,
            portal_status_sub: alertPolicies.content.portal_status_sub,
            portal_metrics: alertPolicies.content.portal_metrics,
          };
        }
        return candidate;
      }
      if (alertPolicies && typeof alertPolicies === "object") {
        return {
          slug: "about",
          content: {
            policies: alertPolicies.content?.policies,
            portal_badge: alertPolicies.content?.portal_badge,
            portal_cert: alertPolicies.content?.portal_cert,
            portal_title: alertPolicies.content?.portal_title,
            portal_desc: alertPolicies.content?.portal_desc,
            portal_status_badge: alertPolicies.content?.portal_status_badge,
            portal_status_sub: alertPolicies.content?.portal_status_sub,
            portal_metrics: alertPolicies.content?.portal_metrics,
          }
        };
      }
    }
  } catch (_) { }
  return null;
}

/** Merge admin data on top of defaults. */
function buildPageData(adminData) {
  const def = defaultAboutPages["about"] || {};
  if (!adminData) return def;
  return {
    ...def,
    ...adminData,
    content: {
      ...(def.content || {}),
      ...(adminData.content || {}),
    },
  };
}

/* ─── Layout helpers ─────────────────────────────────────────────── */
const sectionDividerStyle = {
  borderTop: "1px solid #e2e8f0",
  marginTop: 64,
  paddingTop: 64,
  scrollMarginTop: 165,
};

const sectionHeading = (badgeText, title, sub) => (
  <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 44px" }}>
    <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>
      {badgeText}
    </span>
    <h2
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "clamp(1.6rem, 3.2vw, 2rem)",
        color: "var(--color-dark)",
        marginBottom: 12,
        lineHeight: 1.3,
      }}
    >
      {title}
    </h2>
    <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>
      {sub}
    </p>
  </div>
);

/* ─── Component ──────────────────────────────────────────────────── */
export default function About() {
  const [searchParams] = useSearchParams();
  const [selectedPdf, setSelectedPdf] = useState(null);

  /* Start with merged data: localStorage admin override → defaults */
  const [pageData, setPageData] = useState(() => buildPageData(readAdminAboutData()));

  /* Reload whenever admin saves */
  const refresh = useCallback(() => {
    setPageData(buildPageData(readAdminAboutData()));
  }, []);

  useEffect(() => {
    // Immediate refresh on mount (catches stale initial state)
    refresh();

    window.addEventListener("alertngo_about_pages_updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("alertngo_about_pages_updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  /* Deep-link: /about?tab=operation → scroll to section */
  useEffect(() => {
    const qTab = searchParams.get("tab");
    if (qTab && ["profile", "organogram", "operation", "policies", "milestones"].includes(qTab)) {
      const t = setTimeout(() => {
        const el = document.getElementById(qTab);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  /* Convenience aliases */
  const def = defaultAboutPages["about"] || {};
  const defC = def.content || {};
  const c = pageData?.content || {};

  const badge = pageData?.badge || defC.badge || "Section 00";
  const title = pageData?.title || def.title || "About Us";
  const subtitle = pageData?.subtitle ?? def.subtitle ?? "";

  /* Board members: admin value → default */
  const boardMembers = Array.isArray(c.board_members) && c.board_members.length
    ? c.board_members
    : (Array.isArray(defC.board_members) ? defC.board_members : []);

  /* Core values: admin value → default */
  const coreValues = Array.isArray(c.core_values) && c.core_values.length > 0
    ? c.core_values
    : (Array.isArray(defC.core_values) && defC.core_values.length > 0 ? defC.core_values : [
      { title: "Integrity", quote: "We choose our thoughts and actions based on values rather than personal gain.", accent: "#D2190C" },
      { title: "Accountability", quote: "We love to be slapped with truth than to be kissed with a lie.", accent: "#003190" },
      { title: "Transparency", quote: "We build trust through transparency.", accent: "#3E8E0F" },
      { title: "Gender Justice", quote: "We believe and practice equality.", accent: "#F5A000" },
      { title: "Professionalism", quote: "We don't just do it but we prefer to do it in the best way possible.", accent: "#003190" },
      { title: "Excellence", quote: "It is not by accident but the result of our high intention.", accent: "#D2190C" },
      { title: "Empathy", quote: "We carry the message that 'you are not alone'.", accent: "#D2190C" },
    ]);

  return (
    <>
      <section className="section-pad" id="about-content-area" style={{ paddingTop: 150 }}>
        <div className="container">

          {/* ── SECTION 00: ABOUT US HERO ── */}
          <section id="about-us" style={{ scrollMarginTop: 96 }}>
            {sectionHeading(badge, title, subtitle)}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                  gap: 32,
                  alignItems: "center",
                }}
              >
                <div>
                  <span className="badge" style={{ marginBottom: 14, display: "inline-block" }}>
                    {c.est_badge || defC.est_badge || "Est. 2004"}
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)",
                      color: "var(--color-dark)",
                      marginBottom: 18,
                      lineHeight: 1.3,
                    }}
                  >
                    {c.org_heading || defC.org_heading || "Association for Land and Livelihood, Environment, Research and Training"}
                  </h2>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, marginBottom: 16, fontSize: "0.95rem" }}>
                    {c.p1 || defC.p1 || "ALERT was established in 2004 under the Societies Registration Act (Reg. No. 307/2004) and is headquartered in Vijayawada, Andhra Pradesh."}
                  </p>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, marginBottom: 24, fontSize: "0.95rem" }}>
                    {c.p2 || defC.p2 || "Our mandate spans affirmative legislation enforcement, the Forest Rights Act (RoFR 2006), the PESA Act 1996, Land Transfer Regulation 1 of 1970, and fair rehabilitation for communities displaced by mega irrigation projects like Polavaram."}
                  </p>
                </div>

                {(c.hero_image || defC.hero_image) && (
                  <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
                    <img
                      src={c.hero_image || defC.hero_image}
                      alt="ALERT Community Field Work"
                      style={{ width: "100%", height: "400px", objectFit: "cover" }}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </section>

          {/* ── SECTION 01: ORGANIZATIONAL PROFILE ── */}
          <section id="profile" style={sectionDividerStyle}>
            {sectionHeading(
              c.sec01_badge || defC.sec01_badge || "Section 01",
              c.sec01_title || defC.sec01_title || "Organizational Profile",
              c.sec01_subtitle ||
              defC.sec01_subtitle ||
              "Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention."
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                  gap: 36,
                  alignItems: "center",
                }}
              >
                <div>
                  <span className="badge" style={{ marginBottom: 14, display: "inline-block" }}>
                    {c.est_badge || defC.est_badge || "Est. 2004"}
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)",
                      color: "var(--color-dark)",
                      marginBottom: 18,
                      lineHeight: 1.3,
                    }}
                  >
                    {c.org_heading || defC.org_heading || "Association for Land and Livelihood, Environment, Research and Training"}
                  </h2>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, marginBottom: 16, fontSize: "0.95rem" }}>
                    {c.p1 || defC.p1}
                  </p>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, marginBottom: 24, fontSize: "0.95rem" }}>
                    {c.p2 || defC.p2}
                  </p>

                  {/* Accreditation & Governance cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 14,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: 18,
                        borderRadius: 12,
                        boxShadow: "var(--shadow-sm)",
                        borderLeft: "4px solid var(--color-primary)",
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "var(--color-dark)", fontSize: "0.95rem" }}>
                        {c.accreditations_title || defC.accreditations_title || "Legal Accreditations"}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: 4 }}>
                        {c.accreditations_desc || defC.accreditations_desc || "12A, 80G Tax Exemption, FCRA Registered"}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "white",
                        padding: 18,
                        borderRadius: 12,
                        boxShadow: "var(--shadow-sm)",
                        borderLeft: "4px solid #10B981",
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "var(--color-dark)", fontSize: "0.95rem" }}>
                        {c.governance_title || defC.governance_title || "Governance Code"}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginTop: 4 }}>
                        {c.governance_desc || defC.governance_desc || "Governed by 35 Institutional Policies"}
                      </div>
                    </div>
                  </div>

                  {/* PDF Buttons */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                    {(c.profile_pdf || defC.profile_pdf) && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPdf({
                            file: c.profile_pdf || defC.profile_pdf,
                            title: "Organizational Profile of ALERT",
                            meta: "Official Society Record • 20-Year Dossier",
                          })
                        }
                        className="btn-primary"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: "0.88rem",
                          cursor: "pointer",
                          border: "none",
                        }}
                      >
                        <FaFilePdf size={13} /> View Official Profile PDF
                      </button>
                    )}
                    {(c.annual_report_pdf || defC.annual_report_pdf) && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPdf({
                            file: c.annual_report_pdf || defC.annual_report_pdf,
                            title: "ALERT Annual Audited Report (2020-2021)",
                            meta: "Audited Financial & Operational Statement",
                          })
                        }
                        className="btn-outline"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: "0.88rem",
                          cursor: "pointer",
                        }}
                      >
                        <FaFilePdf size={13} /> View Annual Report PDF
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
                  <img
                    src={
                      c.hero_image ||
                      defC.hero_image ||
                      "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg"
                    }
                    alt="ALERT Community Field Work"
                    style={{ width: "100%", height: "400px", objectFit: "cover" }}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              </div>
            </motion.div>
          </section>

          {/* ── SECTION 02: ORGANOGRAM ── */}
          <section id="organogram" style={sectionDividerStyle}>
            {sectionHeading(
              c.sec02_badge || defC.sec02_badge || "Section 02",
              c.sec02_title || defC.sec02_title || "Organogram Chart",
              c.sec02_subtitle ||
              defC.sec02_subtitle ||
              "The democratic governance hierarchy — from the sovereign General Body down to autonomous grassroots Gram Sabhas and field operational cells."
            )}
            <ErrorBoundary>
              <InteractiveOrganogram
                customWings={c.organogram_wings || defC.organogram_wings}
                customHeader={{
                  arch_badge: c.organogram_arch_badge || defC.organogram_arch_badge,
                  arch_sub: c.organogram_arch_sub || defC.organogram_arch_sub,
                  title: c.organogram_heading || defC.organogram_heading,
                  desc: c.organogram_desc || defC.organogram_desc
                }}
              />
            </ErrorBoundary>
          </section>

          {/* ── SECTION 03: AREA OF OPERATION MAP ── */}
          <section id="operation" style={sectionDividerStyle}>
            {sectionHeading(
              c.sec03_badge || defC.sec03_badge || "Section 03",
              c.sec03_title || defC.sec03_title || "Area of Operation Map",
              c.sec03_subtitle ||
              defC.sec03_subtitle ||
              "17 mandal stations and 4 operational jurisdictions across the Fifth-Scheduled Agency Belt and Coastal Krishna Belt of Andhra Pradesh."
            )}
            <ErrorBoundary>
              <AreaOfOperationExplorer />
            </ErrorBoundary>
          </section>

          {/* ── SECTION 04: 35 POLICIES ── */}
          <section id="policies" style={sectionDividerStyle}>
            {sectionHeading(
              c.sec04_badge || defC.sec04_badge || "Section 04",
              c.sec04_title || defC.sec04_title || "ALERT 35 Policies",
              c.sec04_subtitle ||
              defC.sec04_subtitle ||
              "35 formalized statutory charters certified by the ALERT Governing Body ensuring democratic transparency, protection, and financial accountability."
            )}
            <ErrorBoundary>
              <PoliciesDirectory
                customPolicies={Array.isArray(c.policies) && c.policies.length > 0 ? c.policies : undefined}
                customPortal={c.portal_title ? {
                  badge: c.portal_badge,
                  cert: c.portal_cert,
                  title: c.portal_title,
                  desc: c.portal_desc,
                  status_badge: c.portal_status_badge,
                  status_sub: c.portal_status_sub,
                  metrics: c.portal_metrics
                } : undefined}
              />
            </ErrorBoundary>
          </section>

          {/* ── SECTION 05: 20-YEAR MILESTONES ── */}
          <section id="milestones" style={sectionDividerStyle}>
            {sectionHeading(
              c.sec05_badge || defC.sec05_badge || "Section 05",
              c.sec05_title || defC.sec05_title || "20-Year Milestones",
              c.sec05_subtitle ||
              defC.sec05_subtitle ||
              "The journey from 2004 registration to two decades of transformative grassroots justice, appellate litigation, and women cooperative federations."
            )}
            <ErrorBoundary>
              <InteractiveTimeline
                customMilestones={c.milestones}
                customHeader={{
                  badge: c.timeline_badge,
                  sub: c.timeline_sub,
                  heading: c.timeline_heading,
                  desc: c.timeline_desc,
                  jubilee_title: c.timeline_jubilee_title,
                  jubilee_sub: c.timeline_jubilee_sub,
                }}
                customMetrics={c.timeline_metrics}
                customJubilee={{
                  title: c.timeline_jubilee_title,
                  sub: c.timeline_jubilee_sub,
                }}
              />
            </ErrorBoundary>
          </section>

          {/* ── SECTION 06: GOVERNING BODY ── */}
          <section id="governing-body" style={sectionDividerStyle}>
            {sectionHeading(
              c.governing_badge || defC.governing_badge || "Section 06",
              c.governing_title || defC.governing_title || "Governing Body",
              c.governing_subtitle ||
              defC.governing_subtitle ||
              "The democratic Board of Directors that guides ALERT's mission across Andhra Pradesh since 2004."
            )}
            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-light)",
                maxWidth: 700,
                margin: "0 auto 40px",
                fontSize: "0.98rem",
                lineHeight: 1.7,
              }}
            >
              {c.governing_intro ||
                defC.governing_intro ||
                "ALERT is governed by a dedicated Board of Directors comprising legal scholars, development activists, and community leaders."}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                  gap: 28,
                }}
              >
                {boardMembers.map((m, idx) => (
                  <FlipCard
                    key={idx}
                    img={m.img || ""}
                    name={m.name}
                    role={m.role}
                    badge={m.badge || "Board of Directors"}
                    bio={m.bio}
                    highlights={
                      Array.isArray(m.highlights)
                        ? m.highlights
                        : typeof m.highlights === "string"
                          ? m.highlights.split(",").map((h) => h.trim()).filter(Boolean)
                          : []
                    }
                    quote={m.quote}
                  />
                ))}
              </div>
            </motion.div>
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <button
                type="button"
                onClick={() =>
                  setSelectedPdf({
                    file: c.profile_pdf || defC.profile_pdf || "/uploads/Organizational-Profile-of-ALERT.pdf",
                    title: "Organizational Profile of ALERT",
                    meta: "Official Society Record • 20-Year Dossier",
                  })
                }
                className="btn-primary btn-responsive-pdf"
              >
                <FaFilePdf size={13} /> View Governing Body PDF
              </button>
            </div>
          </section>

          {/* ── SECTION 07: VISION & MISSION ── */}
          <section id="vision-mission" style={sectionDividerStyle}>
            {sectionHeading(
              c.sec07_badge || defC.sec07_badge || "Section 07",
              c.sec07_title || defC.sec07_title || "Vision & Mission",
              c.sec07_subtitle ||
              defC.sec07_subtitle ||
              "Guiding principles that drive every intervention across forest rights, land rehabilitation, and tribal empowerment."
            )}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                  gap: 24,
                  alignItems: "start",
                }}
              >
                {/* Vision */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #fdfdff 100%)",
                    border: "1px solid #D2190C25",
                    borderRadius: 24,
                    padding: 32,
                    boxShadow: "0 20px 40px -10px rgba(210, 25, 12, 0.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#D2190C",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <FaEye size={16} />
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "#D2190C",
                      }}
                    >
                      {c.vision_tag || defC.vision_tag || "Vision Statement"}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
                      color: "var(--color-dark)",
                      marginBottom: 12,
                      lineHeight: 1.3,
                    }}
                  >
                    {c.vision_title || defC.vision_title || "Empowerment towards Prosperity & Peace"}
                  </h3>
                  <div
                    style={{
                      marginBottom: 14,
                      padding: 14,
                      background: "rgba(210, 25, 12, 0.06)",
                      borderLeft: "4px solid #D2190C",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text)", fontStyle: "italic", lineHeight: 1.6 }}>
                      "{c.vision_quote || defC.vision_quote || "Empowerment of socially excluded and marginalized towards prosperity and peace"}"
                    </span>
                  </div>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.9rem", margin: 0 }}>
                    {c.vision_desc ||
                      defC.vision_desc ||
                      "ALERT envisions a future where every socially excluded and marginalized Adivasi family lives with dignity, self-governance, and equitable access to forest rights, land, and livelihood opportunities."}
                  </p>
                </div>

                {/* Mission */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)",
                    border: "1px solid #00319025",
                    borderRadius: 24,
                    padding: 32,
                    boxShadow: "0 20px 40px -10px rgba(0, 49, 144, 0.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#003190",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <FaBullseye size={16} />
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "#003190",
                      }}
                    >
                      {c.mission_tag || defC.mission_tag || "Mission Statement"}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
                      color: "var(--color-dark)",
                      marginBottom: 12,
                      lineHeight: 1.3,
                    }}
                  >
                    {c.mission_title || defC.mission_title || "Awaken, Sensitize, Organize, Mobilize"}
                  </h3>
                  <div
                    style={{
                      marginBottom: 14,
                      padding: 14,
                      background: "rgba(0, 49, 144, 0.06)",
                      borderLeft: "4px solid #003190",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text)", fontStyle: "italic", lineHeight: 1.6 }}>
                      "{c.mission_quote || defC.mission_quote || "To awaken, sensitize, organize and mobilize the Adivasi communities for Self-governance, Self-reliance and Sustainable environment and development"}"
                    </span>
                  </div>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.9rem", margin: 0 }}>
                    {c.mission_desc ||
                      defC.mission_desc ||
                      "ALERT works hand-in-hand with tribal communities to secure forest rights under the RoFR Act 2006, ensure fair land acquisition and rehabilitation, and build women-led cooperative federations."}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ── SECTION 08: CORE VALUES ── */}
          <section id="core-values" style={sectionDividerStyle}>
            {sectionHeading(
              c.sec08_badge || defC.sec08_badge || "Section 08",
              c.sec08_title || defC.sec08_title || "Core Values",
              c.sec08_subtitle ||
              defC.sec08_subtitle ||
              "The principles that guide every ALERT intervention — from forest rights to women's cooperatives and disaster relief."
            )}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: 20,
                }}
              >
                {coreValues.map((v, i) => {
                  const accent = v.accent || "#D2190C";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      style={{
                        background: "linear-gradient(145deg, #ffffff 0%, #fdfdff 100%)",
                        border: `1px solid ${accent}15`,
                        borderRadius: 20,
                        padding: 26,
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      whileHover={{ y: -6, borderColor: accent }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: -30,
                          left: -30,
                          width: 90,
                          height: 90,
                          background: `radial-gradient(circle, ${accent}10, transparent 70%)`,
                          borderRadius: "50%",
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: `${accent}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 16,
                          color: accent,
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        <FaEye size={18} />
                      </div>
                      <h4
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontWeight: 700,
                          color: "var(--color-dark)",
                          marginBottom: 10,
                          fontSize: "1rem",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        {v.title}
                      </h4>
                      <div
                        style={{
                          position: "relative",
                          zIndex: 2,
                          marginBottom: 12,
                          padding: 12,
                          background: `${accent}0a`,
                          borderLeft: `4px solid ${accent}`,
                          borderRadius: 8,
                          flex: 1,
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", color: "var(--color-text)", fontStyle: "italic", lineHeight: 1.5 }}>
                          "{v.quote}"
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>

        </div>
      </section>

      {/* PDF Viewer Modal */}
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
