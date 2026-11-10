import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaFilePdf,
  FaDownload,
  FaEye,
  FaHandHoldingHeart,
  FaBuilding,
  FaSeedling,
  FaUsers,
  FaGavel,
  FaWater,
  FaGraduationCap,
  FaCheckCircle,
  FaShieldAlt,
  FaHeart,
  FaEnvelope,
  FaVideo,
  FaImages
} from "react-icons/fa";
import { getPartnerPage } from "../api/client";
import PdfViewerModal from "../components/PdfViewerModal";

const sectionDividerStyle = { borderTop: "1px solid #e2e8f0", marginTop: 64, paddingTop: 64, scrollMarginTop: 165 };

const DEFAULT_CONTACT_EMAIL = "director@alertngo.in";

const defaultRoutes = [
  {
    icon: "FaBuilding",
    title: "CSR & Section 80G Support",
    body: "Company CSR contributions to ALERT's registered programmes, with 80G tax exemption, a project-specific utilization certificate and audit-ready reporting for your CSR committee and Section 135 filings.",
    fits: "CSR committees, trusts of corporate foundations"
  },
  {
    icon: "FaHandHoldingHeart",
    title: "Institutional & FCRA Grants",
    body: "Multi-year grants from international foundations and development agencies. ALERT has implemented Brot für die Welt (BftW), Germany-supported work through the Antyodaya Project in the coastal Krishna District.",
    fits: "Foundations, embassies, multilateral funds"
  },
  {
    icon: "FaUsers",
    title: "Foundation & Community Partnerships",
    body: "Co-designed work with district administrations, Gram Sabhas, forest committees, universities and other NGOs — joint surveys, legal literacy drives, restoration and livelihood programmes with shared ownership.",
    fits: "PRIs, departments, academic institutions"
  },
  {
    icon: "FaSeedling",
    title: "In-Kind & Skilled Support",
    body: "Solar kits, school and learning material, books, blankets and relief supplies, or pro-bono legal, accounting, translation, design and monitoring expertise contributed against a defined scope.",
    fits: "Suppliers, professional firms, individual experts"
  }
];

const defaultMissions = [
  {
    icon: "FaGavel",
    title: "Land & Forest Rights",
    body: "Recognition of Forest Rights Act and LTR 1970 claims, Community Forest Resource mapping, title-suit recovery, and legal aid for habitation-level rights disputes across the Eastern Ghats agency zones.",
    tell: "Tell us if you want to fund legal aid, claim facilitation or document recovery."
  },
  {
    icon: "FaWater",
    title: "Polavaram Rehabilitation",
    body: "Household surveys, RFCTLARR Act 2013 entitlement tracking, R&R social audits and grievance redressal support for families in the submergence belt of Godavari and Krishna districts.",
    tell: "Tell us if you want to back field research, social audits or victim support."
  },
  {
    icon: "FaUsers",
    title: "Antyodaya Livelihoods",
    body: "Women's cooperatives and SHGs — micro-savings, revolving credit, estuarine fishing and mangrove work, house-site pattas and market linkage for coastal Krishna mandals.",
    tell: "Tell us if you want to seed a cooperative, a revolving fund or skills training."
  },
  {
    icon: "FaGraduationCap",
    title: "Child Rights & Basic Services",
    body: "Joyful learning centres, digital classrooms and kits, school kits and kits for out-of-school children, alongside child-protection and nutrition monitoring at the village level.",
    tell: "Tell us if you want to equip a classroom, a centre or a batch of students."
  }
];

const defaultDiligence = [
  {
    title: "Organizational Profile & 20-Year Report of ALERT",
    file: "/uploads/Organizational-Profile-of-ALERT.pdf",
    meta: "Registration 307/2004 · 12A & 80G certificates",
    icon: "FaFilePdf"
  },
  {
    title: "ALERT Annual Report (April 2020 – March 2021)",
    file: "/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf",
    meta: "Audited operational and financial report",
    icon: "FaFilePdf"
  },
  {
    title: "Governance & Statutory Compliances for NGOs in India",
    file: "/uploads/FAQS-ON-NGO.pdf",
    meta: "Societies Registration, FCRA and 80G compliance manual",
    icon: "FaFilePdf"
  }
];

const defaultCommitments = [
  "Project-scoped agreement with clear deliverables, budget heads and a reporting calendar",
  "Social audit and beneficiary-level verification before a grant is renewed",
  "Named field officer and a site visit for every funded intervention",
  "Donations and grants reported publicly in our News & Views and annual report",
  "Zero tolerance on diversion: 12A & 80G, FCRA and POSH compliant operations"
];

const defaultRegistration = [
  { label: "Legal form", value: "Registered Society, Andhra Pradesh" },
  { label: "Reg. No.", value: "307/2004" },
  { label: "Tax status", value: "12A & 80G — donations tax-exempt" },
  { label: "Foreign contributions", value: "FCRA-compliant institutional grants" },
  { label: "Head office", value: "Vijayawada, Krishna District, Andhra Pradesh" }
];

function renderRouteIcon(name) {
  switch (name) {
    case "FaBuilding": return <FaBuilding />;
    case "FaHandHoldingHeart": return <FaHandHoldingHeart />;
    case "FaUsers": return <FaUsers />;
    case "FaSeedling": return <FaSeedling />;
    case "FaGavel": return <FaGavel />;
    case "FaWater": return <FaWater />;
    case "FaGraduationCap": return <FaGraduationCap />;
    default: return <FaBuilding />;
  }
}

const sectionHeading = (badgeText, title, sub) => (
  <div style={{ textAlign: "center", maxWidth: 860, margin: "0 auto 44px" }}>
    <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>{badgeText}</span>
    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
      {title}
    </h2>
    <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>{sub}</p>
  </div>
);

export default function Partner() {
  const [page, setPage] = useState({
    badge: "Section 01",
    title: "Why Partner With ALERT",
    subtitle: "ALERT is a Vijayawada-based society registered in 2004, working with Adivasi and coastal communities in the Fifth Scheduled Areas of Andhra Pradesh. We combine a legal cell, field research units and community institutions — so a partnership here reaches a habitation, not only a report.",
    intro_p1: "Our mandate runs from forest and land rights through displacement rehabilitation to livelihoods and education. Work is delivered through Gram Sabhas, forest rights committees and women's cooperatives, led by <strong>Y.L.J.B. Jayaraj</strong> with 35 institutional policies governing compliance, safeguarding and monitoring.",
    intro_p2: "We welcome funders who want the messier, slower work — title recovery, entitlement audits, legal literacy — as well as those who prefer a single school kit or solar pole. Both are scoped, reported and audited.",
    hero_media_type: "image",
    hero_media_url: "/uploads/reels/reel-4-women.jpg",
    hero_poster: "",
    contact_email: DEFAULT_CONTACT_EMAIL,
    donate_btn_text: "Give Directly",
    donate_btn_url: "/donate",
    routes_badge: "Section 02",
    routes_title: "Four Ways to Partner",
    routes_subtitle: "Pick the route that matches your mandate, your budget cycle and your reporting needs.",
    missions_badge: "Section 03",
    missions_title: "Where Support Goes",
    missions_subtitle: "Four missions we can ring-fence a grant around. Every funded intervention gets a named officer, a field visit and a written close-out.",
    diligence_badge: "Section 04",
    diligence_title: "Due Diligence Pack",
    diligence_subtitle: "Registration, tax and audit documents your compliance team can verify before any money moves.",
    commitments_title: "Our Institutional Commitments",
    registration_title: "Registration & tax details",
    registration_note: "Certificates, PAN, FCRA sanction and audited statements are shared on request against a signed enquiry. Full document list: [Downloads](/downloads).",
    cta_badge: "Partner With Us",
    cta_title: "Fund Work That Is Verified in the Field",
    cta_subtitle: "Send us your mandate and budget cycle. We will come back with a scoped proposal, a realistic timeline, and the names of the habitation and officer who will do the work.",
    cta_email_subject: "Partnership proposal request",
    cta_donate_url: "/donate"
  });

  const [routes, setRoutes] = useState(defaultRoutes);
  const [missions, setMissions] = useState(defaultMissions);
  const [diligence, setDiligence] = useState(defaultDiligence);
  const [commitments, setCommitments] = useState(defaultCommitments);
  const [registrationItems, setRegistrationItems] = useState(defaultRegistration);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const applyData = (partnerData) => {
      if (!partnerData) return;
      const p = partnerData.page || partnerData.data || partnerData;
      if (p && typeof p === "object" && Object.keys(p).length > 0) {
        setPage((prev) => ({ ...prev, ...p }));
        try {
          const r = typeof p.routes_json === "string" ? JSON.parse(p.routes_json) : p.routes_json;
          if (Array.isArray(r) && r.length > 0) setRoutes(r);
        } catch (e) { }
        try {
          const m = typeof p.missions_json === "string" ? JSON.parse(p.missions_json) : p.missions_json;
          if (Array.isArray(m) && m.length > 0) setMissions(m);
        } catch (e) { }
        try {
          const d = typeof p.diligence_json === "string" ? JSON.parse(p.diligence_json) : p.diligence_json;
          if (Array.isArray(d) && d.length > 0) setDiligence(d);
        } catch (e) { }
        try {
          const c = typeof p.commitments_json === "string" ? JSON.parse(p.commitments_json) : p.commitments_json;
          if (Array.isArray(c) && c.length > 0) setCommitments(c);
        } catch (e) { }
        try {
          const reg = typeof p.registration_json === "string" ? JSON.parse(p.registration_json) : p.registration_json;
          if (Array.isArray(reg) && reg.length > 0) setRegistrationItems(reg);
        } catch (e) { }
      }
    };

    getPartnerPage().then((res) => {
      if (isMounted && res) {
        applyData(res);
      }
    }).catch((err) => console.warn("Partner fetch fallback:", err));

    const handleRealtimeUpdate = (e) => {
      if (isMounted && e?.detail) {
        applyData({ page: e.detail });
      }
    };
    window.addEventListener("alertngo_partner_page_updated", handleRealtimeUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("alertngo_partner_page_updated", handleRealtimeUpdate);
    };
  }, []);

  const contactEmail = page.contact_email || DEFAULT_CONTACT_EMAIL;

  return (
    <>
      <style>{`
        .partner-hero-section {
          padding-top: 140px;
          scroll-margin-top: 96px;
        }
        .partner-diligence-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .partner-doc-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 22px 20px;
          box-shadow: 0 4px 18px -2px rgba(0, 49, 144, 0.04);
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-sizing: border-box;
        }
        .partner-doc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px -6px rgba(0, 49, 144, 0.1);
          border-color: #cbd5e1;
        }
        .partner-doc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .partner-doc-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(210, 25, 12, 0.08) 0%, rgba(245, 160, 0, 0.12) 100%);
          color: var(--color-primary, #d2190c);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1.15rem;
        }
        .partner-doc-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #b45309;
          background: #fef3c7;
          border: 1px solid #fde68a;
          padding: 3px 10px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .partner-doc-title {
          font-size: 1.02rem;
          font-weight: 700;
          color: var(--color-dark, #0f172a);
          line-height: 1.4;
          margin: 0;
        }
        .partner-doc-meta {
          font-size: 0.83rem;
          color: var(--color-text-light, #64748b);
          line-height: 1.55;
          margin: 0;
          flex: 1;
        }
        .partner-doc-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          padding-top: 6px;
        }
        .partner-doc-view-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: linear-gradient(135deg, #d2190c 0%, #ea580c 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(210, 25, 12, 0.2);
        }
        .partner-doc-view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(210, 25, 12, 0.3);
        }
        .partner-doc-download-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          text-decoration: none;
          font-size: 0.82rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .partner-doc-download-btn:hover {
          background: #e2e8f0;
          color: var(--color-dark);
        }
        @media (max-width: 768px) {
          .partner-hero-section {
            padding-top: 138px !important;
          }
          .partner-diligence-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .partner-doc-card {
            padding: 18px 16px !important;
            border-radius: 16px !important;
          }
          .partner-doc-title {
            font-size: 0.96rem !important;
          }
          .partner-doc-meta {
            font-size: 0.8rem !important;
          }
          .partner-doc-view-btn {
            padding: 10px 14px !important;
            font-size: 0.84rem !important;
          }
        }
      `}</style>

      <section className="section-pad partner-hero-section hero" id="why-partner" style={{ scrollMarginTop: 96 }}>
        <div className="container">
          {sectionHeading(
            page.badge || "Section 01",
            page.title || "Why Partner With ALERT",
            page.subtitle || "ALERT is a Vijayawada-based society registered in 2004, working with Adivasi and coastal communities in the Fifth Scheduled Areas of Andhra Pradesh. We combine a legal cell, field research units and community institutions — so a partnership here reaches a habitation, not only a report."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 36, alignItems: "center" }}>
            <div>
              {page.intro_p1 && (
                <p
                  style={{ color: "var(--color-text-light)", lineHeight: 1.8, fontSize: "0.95rem", marginBottom: 16 }}
                  dangerouslySetInnerHTML={{ __html: page.intro_p1 }}
                />
              )}
              {page.intro_p2 && (
                <p
                  style={{ color: "var(--color-text-light)", lineHeight: 1.8, fontSize: "0.95rem", marginBottom: 24 }}
                  dangerouslySetInnerHTML={{ __html: page.intro_p2 }}
                />
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <a href={`mailto:${contactEmail}?subject=Partnership%20enquiry%20to%20ALERT`} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <FaEnvelope size={12} /> Start a Conversation
                </a>
                <Link to={page.donate_btn_url || "/donate"} className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {page.donate_btn_text || "Give Directly"} <FaArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* HERO MEDIA: VIDEO OR IMAGE */}
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)", background: "#0b0f17", minHeight: 340 }}>
              {page.hero_media_type === "video" && page.hero_media_url ? (
                <video
                  src={page.hero_media_url}
                  poster={page.hero_poster || "/uploads/reels/reel-4-women.jpg"}
                  controls
                  style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                />
              ) : (
                <img
                  src={page.hero_media_url || "/uploads/reels/reel-4-women.jpg"}
                  alt="ALERT women's cooperative members at a meeting"
                  style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const cur = page.hero_media_url || "";
                    if (cur.includes(" ") && !e.currentTarget.dataset.fallbackTried) {
                      e.currentTarget.dataset.fallbackTried = "hyphen";
                      e.currentTarget.src = cur.replace(/\s+/g, "-");
                      return;
                    }
                    if (cur.includes("-") && !e.currentTarget.dataset.fallbackTried) {
                      e.currentTarget.dataset.fallbackTried = "space";
                      e.currentTarget.src = cur.replace(/-/g, " ");
                      return;
                    }
                    if (e.currentTarget.src !== "/uploads/reels/reel-4-women.jpg") {
                      e.currentTarget.src = "/uploads/reels/reel-4-women.jpg";
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02 — PARTNERSHIP ROUTES */}
      <section className="section-pad" id="routes" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            page.routes_badge || "Section 02",
            page.routes_title || "Four Ways to Partner",
            page.routes_subtitle || "Pick the route that matches your mandate, your budget cycle and your reporting needs."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {routes.map((r, rIdx) => (
              <article key={rIdx} className="career-card">
                <span style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(62,142,15,0.10)", color: "var(--logo-green)", display: "grid", placeItems: "center", marginBottom: 12 }}>
                  {renderRouteIcon(r.icon)}
                </span>
                <h3 style={{ fontSize: "1.02rem", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1.35, marginBottom: 10 }}>{r.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.7, marginBottom: 14 }}>{r.body}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text)", paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
                  <strong style={{ color: "var(--color-dark)" }}>Best suited to:</strong> {r.fits}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 03 — WHERE SUPPORT GOES */}
      <section className="section-pad" id="missions" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            page.missions_badge || "Section 03",
            page.missions_title || "Where Support Goes",
            page.missions_subtitle || "Four missions we can ring-fence a grant around. Every funded intervention gets a named officer, a field visit and a written close-out."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>
            {missions.map((m, mIdx) => (
              <div key={mIdx} style={{ background: "white", borderRadius: 16, padding: 22, boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9", borderLeft: "3px solid var(--color-primary)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ color: "var(--color-primary)", fontSize: "1.1rem" }}>{renderRouteIcon(m.icon)}</span>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-dark)" }}>{m.title}</h3>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.7 }}>{m.body}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--logo-green)", fontWeight: 600, lineHeight: 1.6, marginTop: "auto" }}>{m.tell}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 04 — DUE DILIGENCE PACK */}
      <section className="section-pad" id="due-diligence" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            page.diligence_badge || "Section 04",
            page.diligence_title || "Due Diligence Pack",
            page.diligence_subtitle || "Registration, tax and audit documents your compliance team can verify before any money moves."
          )}

          <div className="partner-diligence-grid">
            {diligence.map((d, dIdx) => (
              <article
                key={dIdx}
                className="partner-doc-card"
                onClick={() => setSelectedPdf({ file: d.file, title: d.title, meta: d.meta })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPdf({ file: d.file, title: d.title, meta: d.meta });
                  }
                }}
              >
                <div className="partner-doc-top">
                  <span className="partner-doc-icon-wrap" aria-hidden="true">
                    <FaFilePdf />
                  </span>
                  <span className="partner-doc-pill">Official Document</span>
                </div>

                <h3 className="partner-doc-title">{d.title}</h3>
                <p className="partner-doc-meta">{d.meta}</p>

                <div className="partner-doc-actions">
                  <button
                    type="button"
                    className="partner-doc-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPdf({ file: d.file, title: d.title, meta: d.meta });
                    }}
                  >
                    <FaEye size={13} /> View Document
                  </button>
                  <a
                    href={d.file}
                    download
                    className="partner-doc-download-btn"
                    onClick={(e) => e.stopPropagation()}
                    title="Direct Download PDF"
                    aria-label={`Download ${d.title}`}
                  >
                    <FaDownload size={12} />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
            <div style={{ background: "white", padding: "clamp(20px, 3vw, 28px)", borderRadius: 16, boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <FaShieldAlt style={{ color: "var(--logo-green)" }} /> {page.commitments_title || "Our Institutional Commitments"}
              </h3>
              <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
                {commitments.map((c, cIdx) => (
                  <li key={cIdx} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: "0.86rem", color: "var(--color-text)", lineHeight: 1.6 }}>
                    <FaCheckCircle size={13} style={{ color: "var(--logo-green)", marginTop: 3, flexShrink: 0 }} /> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "#f8fafc", padding: "clamp(20px, 3vw, 28px)", borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 14 }}>{page.registration_title || "Registration & tax details"}</h3>
              <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 16px", margin: 0, fontSize: "0.86rem" }}>
                {registrationItems.map((item, idx) => (
                  <div key={idx} style={{ display: "contents" }}>
                    <dt style={{ fontWeight: 700, color: "var(--color-dark)" }}>{item.label}</dt>
                    <dd style={{ margin: 0, color: "var(--color-text-light)" }}>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-light)", lineHeight: 1.7, marginTop: 16, marginBottom: 0 }}>
                {page.registration_note ? (
                  <span>
                    {page.registration_note.includes("[Downloads]") ? (
                      <>
                        {page.registration_note.split("[Downloads]")[0]}
                        <Link to="/downloads" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Downloads</Link>
                        {page.registration_note.split("[Downloads]")[1]?.replace(/^\(\/downloads\)/, "") || ""}
                      </>
                    ) : (
                      page.registration_note
                    )}
                  </span>
                ) : (
                  <>
                    Certificates, PAN, FCRA sanction and audited statements are shared on request against a signed enquiry. Full document list:{" "}
                    <Link to="/downloads" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Downloads</Link>.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <div className="container cta-container">
          <div className="cta-shell cta-shell--single">
            <div className="cta-shell-glow cta-shell-glow-1" aria-hidden="true" />
            <div className="cta-shell-glow cta-shell-glow-2" aria-hidden="true" />

            <div className="cta-copy">
              <div className="cta-badge">
                <span className="cta-badge-dot" aria-hidden="true" />
                <span>{page.cta_badge || "Partner With Us"}</span>
              </div>

              <h2 className="cta-title">
                {page.cta_title || "Fund Work That Is Verified in the Field"}
              </h2>

              <p className="cta-subtitle">
                {page.cta_subtitle || "Send us your mandate and budget cycle. We will come back with a scoped proposal, a realistic timeline, and the names of the habitation and officer who will do the work."}
              </p>

              <div className="cta-actions">
                <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(page.cta_email_subject || "Partnership proposal request")}`} className="cta-btn-donate">
                  <span>Request a Proposal</span>
                  <span className="cta-donate-heart" aria-hidden="true"><FaHeart size={13} /></span>
                </a>
                <Link to="/contact" className="cta-btn-volunteer">
                  <span>Book a Site Visit</span>
                  <FaArrowRight size={12} className="cta-btn-arrow" aria-hidden="true" />
                </Link>
              </div>

              <div className="cta-trust-strip">
                <div className="cta-trust-item">
                  <FaShieldAlt className="cta-trust-icon" aria-hidden="true" />
                  <span>12A &amp; 80G Registered</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaCheckCircle className="cta-trust-icon" aria-hidden="true" />
                  <span>Social Audited Programmes</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaFilePdf className="cta-trust-icon" aria-hidden="true" />
                  <span>Audited Annual Reports</span>
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
