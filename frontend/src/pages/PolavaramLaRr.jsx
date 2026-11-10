import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaArrowRight,
  FaFilePdf,
  FaDownload,
  FaEye,
  FaGavel,
  FaFileAlt,
  FaTable,
  FaMapMarkedAlt,
  FaClipboardList,
  FaBookOpen,
  FaProjectDiagram,
  FaExclamationCircle,
  FaUsers,
  FaImage,
  FaFileInvoiceDollar,
  FaFilter,
  FaEdit
} from "react-icons/fa";
import { fetchAllPages, fetchLaRrPages, fetchPageBySlug } from "../api/client";
import sitePages from "../data/all_site_pages.json";
import PdfViewerModal from "../components/PdfViewerModal";
import { renderStatIcon, DEFAULT_STATS_BY_SLUG } from "../utils/statIcons";

const sectionDividerStyle = { borderTop: "1px solid #e2e8f0", marginTop: 64, paddingTop: 64, scrollMarginTop: 165 };

const sectionHeading = (badgeText, title, sub) => (
  <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 44px" }}>
    <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>{badgeText}</span>
    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
      {title}
    </h2>
    <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>{sub}</p>
  </div>
);

const cardStyle = { background: "white", padding: 20, borderRadius: 16, boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" };

/* Document types are derived from the archived page title and its attached assets — never invented. */
const DOC_TYPES = [
  { key: "court", label: "Court & Commissioner Records", short: "Court Record", tone: "#D2190C", icon: <FaGavel />, match: /court|commissioner|petition|writ|award/i },
  { key: "schedule", label: "Statutory Schedules", short: "Schedule", tone: "#0E2B66", icon: <FaFilePdf />, match: /schedule/i },
  { key: "go", label: "Government Orders", short: "Govt. Order", tone: "#3E8E0F", icon: <FaFileAlt />, match: /g\.?\s?o\.?s?\b|government order/i },
  { key: "dpr", label: "Project Reports (DPR)", short: "Project Report", tone: "#0E2B66", icon: <FaFileInvoiceDollar />, match: /dpr|detailed project|project report/i },
  { key: "minutes", label: "Authority Minutes & Reviews", short: "Minutes", tone: "#F5A000", icon: <FaUsers />, match: /minute|review meeting|presentation/i },
  { key: "flow", label: "Process Flow Charts", short: "Flow Chart", tone: "#0E2B66", icon: <FaProjectDiagram />, match: /flow/i },
  { key: "form", label: "Grievance Forms", short: "Form", tone: "#D2190C", icon: <FaClipboardList />, match: /form/i },
  { key: "grievance", label: "Grievance Records & Follow-ups", short: "Grievance", tone: "#D2190C", icon: <FaExclamationCircle />, match: /grievance/i },
  { key: "faq", label: "FAQs & Guidance Notes", short: "FAQ", tone: "#F5A000", icon: <FaBookOpen />, match: /faq/i },
  { key: "status", label: "Status Reports & Data Tables", short: "Status Report", tone: "#3E8E0F", icon: <FaTable />, match: /status|progress|abstract|package/i },
  { key: "analysis", label: "Issue Analyses", short: "Issue Analysis", tone: "#D2190C", icon: <FaExclamationCircle />, match: /issue|implementing/i },
  { key: "map", label: "Maps & Colony Layouts", short: "Map / Layout", tone: "#0E2B66", icon: <FaMapMarkedAlt />, match: /map|layout|coloni|colonies|submergence/i },
];

const DEFAULT_DOC_TYPE = { key: "record", label: "Field Records", short: "Field Record", tone: "#475569", icon: <FaFileAlt /> };

const docTypeOf = (title) => DOC_TYPES.find((t) => t.match.test(title || "")) || DEFAULT_DOC_TYPE;

const legalDocs = [
  { title: "Key Critical Issues of Polavaram Project (PIP)", file: "/uploads/Seperated-Polavaram-issues-4.pdf", desc: "Special dossier on submergence contour errors, youth package exclusions, and colony infrastructure." },
  { title: "High Court Cases: East Godavari", file: "/uploads/High-court-Cases_EG-1.pdf", desc: "List of pending writ petitions defending tribal forest rights and compensation." },
  { title: "High Court Cases: West Godavari", file: "/uploads/Pending-High-court-cases_WG.pdf", desc: "Legal petitions on adult youth packages and resettlement house valuations." },
  { title: "Cases @ R&R Commissioner Office", file: "/uploads/RR-commissioner-office_Court-Cases.pdf", desc: "Appeals filed before the R&R Commissioner for excluded families." },
  { title: "RTI Data @ LA & RR Court", file: "/uploads/RTI-Data-LA-RR-Court.pdf", desc: "Official RTI disclosures from the Land Acquisition & Resettlement Authority." },
  { title: "Compendium of FRA Judgements", file: "/uploads/Compendum-of-Judgements-on-FRA-2007-2015.pdf", desc: "Landmark High Court and Supreme Court judgements protecting forest rights." },
  { title: "Award Copies Documentation", file: "/uploads/AWARD-COPIES-1.pdf", desc: "Official land and structural valuation award copies." },
];

const schedules = [
  { title: "Schedule 1: Compensation Formula", file: "/uploads/schedule-1.pdf", desc: "Multipliers for rural/tribal areas and 100% solatium norms." },
  { title: "Schedule 2: R&R Entitlements", file: "/uploads/schedule-2.pdf", desc: "Mandatory house allotment, subsistence grant, cattle shed, shifting." },
  { title: "Schedule 3: 25 Colony Amenities", file: "/uploads/schedules-3-1.pdf", desc: "Statutory 25 amenities mandatory in every resettlement colony." },
];

const prettyPdfLabel = (name) => {
  const base = (name || "").split("/").pop().replace(/\.pdf$/i, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Used when the CMS returns no attached files, so the library never renders empty
const fallbackPolavaramPdfs = [
  { title: "Schedule 1: Compensation Formula", file: "/uploads/schedule-1.pdf" },
  { title: "Schedule 2: R&R Entitlements", file: "/uploads/schedule-2.pdf" },
  { title: "Schedule 3: 25 Colony Amenities", file: "/uploads/schedules-3-1.pdf" },
  { title: "FAQ on LARR Act 2013", file: "/uploads/FAQ-LARR.pdf" },
  { title: "Key Critical Issues of PIP", file: "/uploads/Seperated-Polavaram-issues-4.pdf" },
  { title: "Cases @ R&R Commissioner Office", file: "/uploads/RR-commissioner-office_Court-Cases.pdf" },
  { title: "Award Copies Documentation", file: "/uploads/AWARD-COPIES-1.pdf" },
];

/* ALERT's own reference shelf: statutory, court and scheme documents held in /uploads.
   Titles, sources and descriptions match the entries on the Downloads page; sizes are the real files. */
const referenceLibrary = [
  {
    title: "High Court Cases: East Godavari District",
    file: "/uploads/High-court-Cases_EG-1.pdf",
    meta: "High Court of Andhra Pradesh",
    size: "134 KB",
    chip: "Court Record",
    tone: "#D2190C",
    icon: <FaGavel />,
    desc: "Record of writ petitions and court orders defending Adivasi forest rights and fair land valuation in East Godavari."
  },
  {
    title: "Pending High Court Cases: West Godavari District",
    file: "/uploads/Pending-High-court-cases_WG.pdf",
    meta: "High Court of Andhra Pradesh",
    size: "189 KB",
    chip: "Court Record",
    tone: "#D2190C",
    icon: <FaGavel />,
    desc: "Compiled list of pending litigation regarding adult youth entitlement packages and resettlement colony allotments."
  },
  {
    title: "RTI Disclosures: LA & RR Authority Court",
    file: "/uploads/RTI-Data-LA-RR-Court.pdf",
    meta: "RTI Official Disclosures",
    size: "116 KB",
    chip: "RTI Disclosure",
    tone: "#0E2B66",
    icon: <FaBookOpen />,
    desc: "Comprehensive RTI records regarding land acquisition award enquiries and compensation disbursement tracking."
  },
  {
    title: "Compendium of Judgements on Forest Rights Act (2007–2015)",
    file: "/uploads/Compendum-of-Judgements-on-FRA-2007-2015.pdf",
    meta: "ALERT Legal Cell Compilation",
    size: "4.8 MB",
    chip: "Judgements",
    tone: "#3E8E0F",
    icon: <FaGavel />,
    desc: "Landmark High Court and Supreme Court judgements affirming tribal land tenure under the Forest Rights Act 2006."
  },
  {
    title: "Land Acquisition & Structural Award Copies",
    file: "/uploads/AWARD-COPIES-1.pdf",
    meta: "Official Revenue Awards",
    size: "846 KB",
    chip: "Award Record",
    tone: "#0E2B66",
    icon: <FaFileAlt />,
    desc: "Certified award copies issued by Special Land Acquisition Officers (SLAOs) in the Polavaram submergence basin."
  },
  {
    title: "R&R Grievance Redressal FAQs & Procedures",
    file: "/uploads/GREIVANCE-FAQ.pdf",
    meta: "ALERT Community Handbook",
    size: "400 KB",
    chip: "Grievance",
    tone: "#D2190C",
    icon: <FaExclamationCircle />,
    desc: "Practical handbook on lodging grievances, appeal procedures before the SDC, and entitlement claims under Polavaram."
  },
  {
    title: "Ministry of Tribal Affairs (MoTA) RoFR Guidelines FAQ",
    file: "/uploads/MoTA_FAQ.pdf",
    meta: "Ministry of Tribal Affairs",
    size: "249 KB",
    chip: "Ministry Guidance",
    tone: "#F5A000",
    icon: <FaBookOpen />,
    desc: "Official clarifications on Individual Forest Rights (IFR), Community Rights (CFR) and Gram Sabha powers."
  },
  {
    title: "RTI Online Filing & Tribal Advocacy Manual",
    file: "/uploads/RTI-Online-FAQs.pdf",
    meta: "Central Information Commission",
    size: "131 KB",
    chip: "RTI Guidance",
    tone: "#0E2B66",
    icon: <FaBookOpen />,
    desc: "Guide to filing online Right to Information petitions to access project documents, DPRs and land award records."
  },
  {
    title: "MGNREGA Operational Guidelines & Rights in Tribal Areas",
    file: "/uploads/MGNREGA_GUIDELINES.pdf",
    meta: "Ministry of Rural Development",
    size: "2.4 MB",
    chip: "Scheme Guideline",
    tone: "#3E8E0F",
    icon: <FaFileAlt />,
    desc: "Statutory operational guidelines for the employment guarantee, watershed development and land levelling in Scheduled Areas."
  },
  {
    title: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) FAQ",
    file: "/uploads/PMKSY_FAQ.pdf",
    meta: "Ministry of Agriculture & Farmers Welfare",
    size: "380 KB",
    chip: "Scheme FAQ",
    tone: "#F5A000",
    icon: <FaFileAlt />,
    desc: "Guidelines on micro-irrigation subsidies, check dams and water harvesting structures for smallholder farmers."
  }
];

export default function PolavaramLaRr() {
  const [searchParams] = useSearchParams();
  const [polavaramPages, setPolavaramPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [archiveType, setArchiveType] = useState("all");
  const [pageData, setPageData] = useState(null);
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

  // Legacy deep-link support: /la-rr?tab=overview scrolls to that section instead of switching tabs.
  // Charts load lazily and change page height, so the position is re-applied once the layout settles.
  useEffect(() => {
    const qTab = searchParams.get("tab");
    const allowed = ["overview", "land_acquisition", "rr_package", "court_cases", "submergence", "rofr_ltr", "archive"];
    if (!qTab || !allowed.includes(qTab)) return undefined;
    const goTo = (smooth) => {
      const el = document.getElementById(qTab);
      if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    };
    const t1 = setTimeout(() => goTo(true), 250);
    const t2 = setTimeout(() => goTo(false), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const loadPageData = () => {
      fetchPageBySlug("la-rr").then((pRes) => {
        if (isMounted && pRes && pRes.data) {
          setPageData(pRes.data);
        }
      }).catch(() => {});
    };
    loadPageData();

    (fetchLaRrPages().then((lr) => lr && lr.data && lr.data.length ? lr : fetchAllPages("Polavaram LA & R&R"))).then((res) => {
      if (isMounted) {
        if (res && res.data) setPolavaramPages(res.data);
        setLoading(false);
      }
    }).catch(() => { if (isMounted) setLoading(false); });

    // Re-fetch when admin updates content (so changes reflect without manual cache clear)
    const handlePageUpdate = () => { if (isMounted) loadPageData(); };
    const handleLarrUpdate = () => {
      if (!isMounted) return;
      fetchLaRrPages().then((lr) => { if (isMounted && lr && lr.data) setPolavaramPages(lr.data); }).catch(() => {});
    };
    window.addEventListener("alertngo_page_updated", handlePageUpdate);
    window.addEventListener("alertngo_larr_pages_updated", handleLarrUpdate);
    window.addEventListener("storage", handleLarrUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("alertngo_page_updated", handlePageUpdate);
      window.removeEventListener("alertngo_larr_pages_updated", handleLarrUpdate);
      window.removeEventListener("storage", handleLarrUpdate);
    };
  }, []);

  const localArchive = Object.values(sitePages)
    .filter((p) => p.category === "Polavaram LA & R&R")
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      tables_count: (p.tables || []).length,
      images_count: (p.images || []).length,
      downloads: p.downloads || []
    }));

  const remoteArchive = polavaramPages.filter((p) => (p.category || "").toLowerCase() === "polavaram la & r&r");

  // CMS rows win on titles/counts; attached file lists come from the shipped catalogue
  const archivePages = (remoteArchive.length >= localArchive.length ? remoteArchive : localArchive).map((r) => ({
    ...r,
    downloads: r.downloads && r.downloads.length
      ? r.downloads
      : (localArchive.find((l) => l.slug === r.slug) || {}).downloads || []
  }));

  const archivePdfs = (() => {
    const seen = new Set();
    const docs = [];
    archivePages.forEach((p) => {
      (p.downloads || []).forEach((d) => {
        const url = d.url || d.file;
        if (!url || seen.has(url)) return;
        seen.add(url);
        docs.push({ url, filename: d.filename || url.split("/").pop(), label: prettyPdfLabel(d.filename || url) });
      });
    });
    return docs.length > 0 ? docs : fallbackPolavaramPdfs.map((f) => ({ url: f.file, filename: f.file.split("/").pop(), label: prettyPdfLabel(f.file) }));
  })();

  // Tag every catalogued page with its document type, then group in DOC_TYPES order.
  const archiveGroups = (() => {
    const typed = archivePages.map((p) => {
      const type = docTypeOf(p.title);
      const seenPdfs = new Set();
      const pdfs = (p.downloads || [])
        .filter((d) => (d.url || d.file || "").toLowerCase().endsWith(".pdf"))
        .filter((d) => {
          const u = d.url || d.file;
          if (!u || seenPdfs.has(u)) return false;
          seenPdfs.add(u);
          return true;
        });
      return { ...p, type, pdfs };
    });
    const order = [...DOC_TYPES, DEFAULT_DOC_TYPE];
    return order
      .map((t) => ({ type: t, pages: typed.filter((p) => p.type.key === t.key) }))
      .filter((g) => g.pages.length > 0);
  })();

  const visibleGroups = archiveType === "all" ? archiveGroups : archiveGroups.filter((g) => g.type.key === archiveType);
  const tablePageCount = archivePages.reduce((n, p) => n + (p.tables_count > 0 ? 1 : 0), 0);

  // Dynamic values driven directly by Admin Panel for /la-rr
  const liveDownloads = pageData?.downloads || [];
  const liveImages = pageData?.images || [];
  const liveSections = Array.isArray(pageData?.sections) ? pageData.sections : [];
  const displayParagraphs = (pageData?.paragraphs && pageData.paragraphs.length > 0)
    ? pageData.paragraphs
    : [
        "The project affects over 371 tribal and non-tribal villages across East Godavari and West Godavari districts (now Alluri Sitharama Raju and Eluru districts). It is one of the largest displacement events of indigenous people in contemporary India.",
        "Since 2004, ALERT has worked at ground zero — defending displaced tribal communities, tracking land valuation awards, monitoring R&R colony infrastructure, and facilitating legal representation for affected families."
      ];

  const liveSchedules = liveDownloads.filter((d) => /schedule/i.test(d.title || d.category || d.filename || d.desc || ""));
  const displaySchedules = liveSchedules.length > 0
    ? liveSchedules.map((d) => ({
        title: d.title || d.text || prettyPdfLabel(d.filename || d.url),
        file: d.url || d.file,
        desc: d.desc || "Statutory schedule under RFCTLARR Act 2013."
      }))
    : schedules;

  const liveLegal = liveDownloads.filter((d) =>
    !/schedule/i.test(d.title || d.category || d.filename || d.desc || "") &&
    (/court|case|petition|writ|award|rti|judgement|issue|dossier/i.test(d.title || d.category || d.filename || d.desc || "") ||
     /Legal Dossier|Court Record|RTI Disclosure|Judgements|Award Record/i.test(d.category || ""))
  );
  const displayLegalDocs = liveLegal.length > 0
    ? liveLegal.map((d) => ({
        title: d.title || d.text || prettyPdfLabel(d.filename || d.url),
        file: d.url || d.file,
        desc: d.desc || "Official court and legal record defending displaced communities."
      }))
    : legalDocs;

  // Resolve dynamic images from admin uploads
  const findImg = (pattern, fallback) => {
    const found = liveImages.find((img) => pattern.test(img.name || img.caption || img.alt || img.src || img.url || ""));
    return found ? (found.src || found.url) : fallback;
  };

  const submergenceMapSrc = findImg(/submergence.*map/i, "/uploads/submergence-area-map-1.jpg");
  const statusMapSrc = findImg(/status.*(la|rr)/i, "/uploads/status-rr-la.png");
  const phasesMapSrc = findImg(/phase/i, "/uploads/phases.png");
  const flowchartSrc = findImg(/flowchart|flow.*chart/i, "/uploads/LA-CHART.png");
  const entitlementsSrc = findImg(/entitlement|larr2013/i, "/uploads/larr2013.png");
  const package10LakhSrc = findImg(/10.*lakh/i, "/uploads/10-Laksh-G.O.jpg");
  const coloniesStatusSrc = findImg(/colon/i, "/uploads/egwg-colonies-1.png");
  const abstract371Src = findImg(/371.*abstract/i, "/uploads/371-ABSTRACT.png");
  const rofrAbstractSrc = findImg(/rofr|rf.png/i, "/uploads/RF.png");
  const reasonsRejectionSrc = findImg(/rejection/i, "/uploads/reasons-for-rejection.png");
  const ltrDisposalsSrc = findImg(/ltr.*disposal.*(eluru|asr)/i, "/uploads/ltr-disposals-eluru.png");
  const ltrReasonsSrc = findImg(/ltr.*disposal.*reason/i, "/uploads/LTR-DISPOSAL-REASONS.png");

  // Reference shelf first (it carries full titles and descriptions), then anything attached to an archived page.
  const libraryDocs = (() => {
    const seen = new Set();
    const derived = archivePdfs.map((d) => {
      const t = docTypeOf(d.label);
      return { title: d.label, file: d.url, meta: "Attached to an archived page", size: null, chip: t.short, tone: t.tone, icon: t.icon, desc: null, filename: d.filename };
    });
    const liveRefShelf = (liveDownloads.length > 0)
      ? liveDownloads.map((d) => {
          const t = docTypeOf(d.title || d.filename);
          return {
            title: d.title || d.text || prettyPdfLabel(d.filename || d.url),
            file: d.url || d.file,
            meta: d.category || "Official Repository Record",
            size: d.size || null,
            chip: t.short,
            tone: t.tone,
            icon: t.icon,
            desc: d.desc || null,
            filename: d.filename
          };
        })
      : referenceLibrary;
    return [...liveRefShelf, ...derived].filter((x) => !seen.has(x.file) && seen.add(x.file));
  })();

  return (
    <>
      <style>{`
        .plr-overview-section {
          padding-top: 150px;
          scroll-margin-top: 165px;
        }
        .plr-card-btn-view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 8px;
          background: linear-gradient(135deg, #D2190C 0%, #F5A000 100%);
          color: #ffffff !important;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(210, 25, 12, 0.25);
          transition: all 0.2s ease;
          text-decoration: none;
          box-sizing: border-box;
          line-height: 1.2;
        }
        .plr-card-btn-view:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .plr-card-btn-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: 8px;
          background: #ffffff;
          color: #D2190C !important;
          border: 1.5px solid #D2190C;
          cursor: pointer;
          white-space: nowrap;
          text-decoration: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          line-height: 1.2;
        }
        .plr-card-btn-save:hover {
          background: rgba(210, 25, 12, 0.06);
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .plr-overview-section {
            padding-top: 138px !important;
          }
        }
        @media (max-width: 480px) {
          .plr-card-btn-view,
          .plr-card-btn-save {
            padding: 6px 8px !important;
            font-size: 0.74rem !important;
            border-radius: 6px !important;
            gap: 4px !important;
          }
        }
      `}</style>
      <section className="hero section-pad plr-overview-section" id="overview">
        <div className="container">
          {sectionHeading(
            pageData?.badge || "Section 01",
            pageData?.title || "Polavaram Project Overview",
            pageData?.subtitle || "The Indira Sagar (Polavaram) Multi-Purpose National Project and the Adivasi communities it displaces — ALERT's ground-level documentation since 2004."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 36, alignItems: "center", marginBottom: 40 }}>
            <div>
              <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>{pageData?.badge || "National Project"}</span>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.4rem, 3vw, 1.8rem)", color: "var(--color-dark)", marginBottom: 16 }}>
                {pageData?.title || "Polavaram Irrigation Project (PIP) & Adivasi Rights"}
              </h3>
              {displayParagraphs.map((p, pIdx) => (
                <p key={pIdx} style={{ color: "var(--color-text-light)", lineHeight: 1.8, marginBottom: pIdx === displayParagraphs.length - 1 ? 24 : 16, fontSize: "0.95rem" }}>
                  {p}
                </p>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 12, marginBottom: 24 }}>
                {((Array.isArray(pageData?.stats) && pageData.stats.length > 0)
                  ? pageData.stats
                  : DEFAULT_STATS_BY_SLUG["la-rr"]
                ).map((st, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      background: "#ffffff",
                      padding: "16px 14px",
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      borderTop: `3px solid ${st.color || "var(--color-primary)"}`,
                      boxShadow: "0 4px 12px -2px rgba(0, 49, 144, 0.05)",
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${st.color || "#003190"}14`,
                        color: st.color || "#003190",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px"
                      }}
                    >
                      {renderStatIcon(st.icon, st.color || "#003190", 15)}
                    </div>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-dark)", lineHeight: 1.1, marginBottom: 4, fontFamily: "serif" }}>
                      {st.num}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-light)", fontWeight: 600 }}>
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Link to="/grievances" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Submit / Track Grievance <FaArrowRight size={12} />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/la-rr?slug=la-rr&tab=stats"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(0, 49, 144, 0.08)",
                      color: "#003190",
                      border: "1px solid rgba(0, 49, 144, 0.2)",
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                    title="Admin Edit Stat Cards & Metrics for LA & RR"
                  >
                    <FaEdit size={12} /> Admin Edit
                  </Link>
                )}
              </div>

            </div>

            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
              <img
                src={submergenceMapSrc}
                alt="Polavaram Submergence Map"
                style={{ width: "100%", height: "auto", maxHeight: 420, objectFit: "cover", display: "block" }} loading="lazy" decoding="async" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
            <div style={cardStyle}>
              <h4 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>LA & R&R Official Status</h4>
              <img src={statusMapSrc} alt="Status of RR & LA" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
            <div style={cardStyle}>
              <h4 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>Project Submergence Phases</h4>
              <img src={phasesMapSrc} alt="Project Phases" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
          </div>

          {/* DYNAMIC FIELD DATA TABLES */}
          {pageData?.tables && pageData.tables.length > 0 && (
            <div style={{ marginTop: 36 }}>
              {pageData.tables.map((tbl, tIdx) => (
                <div key={tIdx} style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "var(--shadow-sm)", overflowX: "auto", marginBottom: 24, border: "1px solid #f1f5f9" }}>
                  <h4 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: "1.05rem" }}>
                    <FaTable color="var(--color-primary)" /> Field Progress &amp; Habitation Matrix {pageData.tables.length > 1 ? `#${tIdx + 1}` : ""}
                  </h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                        {(tbl.headers || []).map((h, hIdx) => (
                          <th key={hIdx} style={{ padding: "10px 14px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(tbl.rows || []).map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: "1px solid #f1f5f9", background: rIdx % 2 === 0 ? "#ffffff" : "#fcfcfd" }}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: "10px 14px", color: "#334155" }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 02 — LAND ACQUISITION ACT 2013 */}
      <section className="section-pad" id="land_acquisition" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            pageData?.section2_badge || "Section 02",
            pageData?.section2_title || "Land Acquisition Act 2013",
            pageData?.section2_subtitle || "The statutory process flow and the compensation, entitlement and colony-amenity schedules that govern every acquisition."
          )}

          <div style={{ background: "white", padding: "clamp(20px, 4vw, 36px)", borderRadius: 16, boxShadow: "var(--shadow-sm)", textAlign: "center", marginBottom: 32 }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.3rem, 3vw, 1.6rem)", color: "var(--color-dark)", marginBottom: 12 }}>
              Land Acquisition (LA Act 2013) Process Flowchart
            </h3>
            <p style={{ color: "var(--color-text-light)", marginBottom: 20, fontSize: "0.92rem" }}>
              Official procedural flowchart illustrating Section 11 preliminary notification, Social Impact Assessment (SIA), Section 19 declaration, and Section 23 award enquiry.
            </p>
            <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <img src={flowchartSrc} alt="Land Acquisition Process Flowchart" style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" decoding="async" />
            </div>
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 16 }}>
            Download RFCTLARR Act 2013 Statutory Schedules
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 18 }}>
            {displaySchedules.map((s, idx) => (
              <div key={idx} style={{ ...cardStyle, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#ef4444", fontSize: "1.6rem", marginBottom: 10 }}><FaFilePdf /></div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 6 }}>{s.title}</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)", lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPdf({ file: s.file, title: s.title, meta: "Central Bare Act • RFCTLARR Act 2013" })}
                    className="plr-card-btn-view"
                  >
                    <FaEye size={11} /> View PDF
                  </button>
                  <a href={s.file} download className="plr-card-btn-save">
                    <FaDownload size={10} /> Save
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 03 — R&R PACKAGE & COLONY HOUSING */}
      <section className="section-pad" id="rr_package" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            pageData?.section3_badge || "Section 03",
            pageData?.section3_title || "R&R Package & Colony Housing",
            pageData?.section3_subtitle || "Statutory entitlements, the ₹10 lakh financial package notification, and construction status across Godavari resettlement colonies."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24, marginBottom: 30 }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                LARR 2013 Statutory Entitlements
              </h3>
              <img src={entitlementsSrc} alt="LARR 2013 Entitlements" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                ₹10 Lakh Financial Package G.O.
              </h3>
              <img src={package10LakhSrc} alt="10 Lakh Package GO" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
              East & West Godavari Resettlement Colonies Construction Status
            </h3>
            <img src={coloniesStatusSrc} alt="Colony Construction Status" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* SECTION 04 — COURT CASES & RTI RECORDS */}
      <section className="section-pad" id="court_cases" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            pageData?.section4_badge || "Section 04",
            pageData?.section4_title || "Court Cases & Legal Cell",
            pageData?.section4_subtitle || "Petitions, writ orders, appeals and RTI disclosures compiled through ALERT's legal interventions defending displaced Adivasis."
          )}

          <div style={{ background: "white", padding: "clamp(20px, 4vw, 32px)", borderRadius: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 18 }}>
              {displayLegalDocs.map((c, i) => (
                <div key={i} style={{ padding: 18, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: "#ef4444", fontSize: "1.4rem", marginBottom: 8 }}><FaFilePdf /></div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 6 }}>{c.title}</h4>
                    <p style={{ fontSize: "0.82rem", color: "var(--color-text-light)", lineHeight: 1.5, marginBottom: 16 }}>{c.desc}</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPdf({ file: c.file, title: c.title, meta: "Official Court / Legal Dossier" })}
                      className="plr-card-btn-view"
                    >
                      <FaEye size={11} /> View PDF
                    </button>
                    <a href={c.file} download className="plr-card-btn-save">
                      <FaDownload size={10} /> Save
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05 — SUBMERGENCE HABITATIONS & MAPS */}
      <section className="section-pad" id="submergence" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            pageData?.section5_badge || "Section 05",
            pageData?.section5_title || "Submergence Habitations & Maps",
            pageData?.section5_subtitle || "The official 371-village abstract with household and population breakdown across the Godavari basin mandals."
          )}

          <div style={{ background: "white", padding: "clamp(20px, 4vw, 36px)", borderRadius: 16, boxShadow: "var(--shadow-sm)", textAlign: "center", marginBottom: 30 }}>
            <h3 style={{ fontSize: "clamp(1.3rem, 3vw, 1.6rem)", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
              Official 371 Submergence Villages Abstract
            </h3>
            <p style={{ color: "var(--color-text-light)", marginBottom: 20, fontSize: "0.92rem" }}>
              Authentic statistical breakdown of submergence villages, households, and population across Godavari basin mandals.
            </p>
            <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <img src={abstract371Src} alt="371 Submergence Villages Abstract Table" style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" decoding="async" />
            </div>
          </div>

          <div style={{ ...cardStyle, textAlign: "center" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>Submergence Area Map (Contour 41.15m & 45.72m)</h3>
            <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 12, overflow: "hidden" }}>
              <img src="/uploads/submergence-area-map-1.jpg" alt="Polavaram submergence area map" style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06 — ROFR & LTR DISPOSALS */}
      <section className="section-pad" id="rofr_ltr" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            pageData?.section6_badge || "Section 06",
            pageData?.section6_title || "RoFR & LTR Disposals",
            pageData?.section6_subtitle || "Forest rights claim outcomes and Land Transfer Regulation disposal analysis for the agency belt."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24, marginBottom: 24 }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                Recognition of Forest Rights (RoFR) Abstract
              </h3>
              <img src={rofrAbstractSrc} alt="RoFR Abstract" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                Reasons for Rejections Analysis
              </h3>
              <img src={reasonsRejectionSrc} alt="Reasons for Rejections" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                LTR Disposals in Eluru & ASR Districts
              </h3>
              <img src={ltrDisposalsSrc} alt="LTR Disposals" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                LTR Disposal Legal Reasons
              </h3>
              <img src={ltrReasonsSrc} alt="LTR Disposal Reasons" style={{ width: "100%", borderRadius: 8 }} loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06b — ADMIN-UPLOADED MAPS & VISUAL EVIDENCE */}
      {liveImages.length > 0 && (
        <section className="section-pad" id="maps_evidence" style={sectionDividerStyle}>
          <div className="container">
            {sectionHeading(
              "Section 06b",
              "Maps & Visual Field Evidence",
              `${liveImages.length} map(s)/image(s) uploaded via the admin panel.`
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {liveImages.map((img, i) => (
                <div key={i} style={{ background: "white", padding: 16, borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
                  <img
                    src={img.src || img.url}
                    alt={img.name || img.caption || img.alt || `Map ${i + 1}`}
                    style={{ width: "100%", borderRadius: 8 }}
                    loading="lazy"
                    decoding="async"
                  />
                  <div style={{ marginTop: 8, fontWeight: 700, color: "var(--color-dark)", fontSize: "0.9rem" }}>
                    {img.name || img.caption || img.alt || `Map ${i + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ADMIN-MANAGED SECTIONS */}
      {liveSections.length > 0 && liveSections.map((sec, si) => (
        <section key={si} className="section-pad" id={`section_${si}`} style={sectionDividerStyle}>
          <div className="container">
            {sectionHeading(
              sec.badge || `Section ${si + 8}`,
              sec.title || `Section ${si + 1}`,
              sec.subtitle || ""
            )}
            {sec.paragraphs && sec.paragraphs.map((p, pi) => (
              <p key={pi} style={{ color: "var(--color-text-light)", lineHeight: 1.7, marginBottom: 12 }}>{p}</p>
            ))}
            {sec.images && sec.images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, margin: "16px 0" }}>
                {sec.images.map((img, ii) => (
                  <img key={ii} src={img.src || img.url} alt={img.name || img.alt || ""} style={{ width: "100%", borderRadius: 8 }} loading="lazy" />
                ))}
              </div>
            )}
            {sec.videos && sec.videos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, margin: "16px 0" }}>
                {sec.videos.map((v, vi) => (
                  <video key={vi} src={v.src || v.url} controls style={{ width: "100%", borderRadius: 8 }} />
                ))}
              </div>
            )}
            {sec.downloads && sec.downloads.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "16px 0" }}>
                {sec.downloads.map((d, di) => (
                  <a key={di} href={d.url || d.file} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: "0.85rem" }}>
                    <FaFilePdf size={12} /> {d.title || d.text || "Document"}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* SECTION 07 — POLAVARAM DOCUMENT ARCHIVE */}
      <section className="section-pad" id="archive" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            "Section 07",
            "Polavaram Document Archive",
            `${archivePages.length} catalogued Polavaram records sorted by document type — ${archiveGroups.length} types, ${tablePageCount} pages carrying tabulated field data, and a ${libraryDocs.length}-document statutory & reference PDF shelf below.`
          )}

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--color-text-light)" }}>Loading archive…</p>
          ) : (
            <>
              {/* DOCUMENT TYPE FILTER */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "0.78rem", fontWeight: 700, color: "var(--color-dark)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <FaFilter size={10} style={{ color: "var(--color-primary)" }} /> Document type
                </span>
                <button
                  type="button"
                  onClick={() => setArchiveType("all")}
                  className={`archive-type-pill ${archiveType === "all" ? "is-active" : ""}`}
                >
                  All ({archivePages.length})
                </button>
                {archiveGroups.map((g) => (
                  <button
                    key={g.type.key}
                    type="button"
                    onClick={() => setArchiveType(g.type.key)}
                    className={`archive-type-pill ${archiveType === g.type.key ? "is-active" : ""}`}
                  >
                    {g.type.short} ({g.pages.length})
                  </button>
                ))}
              </div>

              {/* GROUPED BY DOCUMENT TYPE */}
              {visibleGroups.map((g) => (
                <div key={g.type.key} style={{ marginBottom: 40 }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 6 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: `${g.type.tone}14`, color: g.type.tone, display: "grid", placeItems: "center", flexShrink: 0, fontSize: "0.9rem" }}>
                      {g.type.icon}
                    </span>
                    {g.type.label}
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-light)" }}>({g.pages.length})</span>
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-text-light)", margin: "0 0 16px 44px", lineHeight: 1.6 }}>
                    {g.type.key === "court" ? "Writ petitions, appeals and filings before the R&R Commissioner and the High Court."
                      : g.type.key === "schedule" ? "Compensation, entitlement and colony-amenity schedules of the LA Act 2013."
                        : g.type.key === "go" ? "Government orders issued on acquisition, rehabilitation and package sanctions."
                          : g.type.key === "dpr" ? "Detailed Project Report material and project documentation."
                            : g.type.key === "minutes" ? "Authority minutes and review-meeting records with follow-up actions."
                              : g.type.key === "flow" ? "Step-by-step land acquisition and R&R process charts used in village sessions."
                                : g.type.key === "form" ? "Grievance and claim forms families file with the authorities."
                                  : g.type.key === "grievance" ? "Complaints logged, departmental follow-ups and resolution records."
                                    : g.type.key === "faq" ? "Clarification notes on LARR entitlements, with the source PDF attached."
                                      : g.type.key === "status" ? "Progress, package and village-level status data compiled from field records."
                                        : g.type.key === "analysis" ? "Field analyses of implementation gaps affecting submergence families."
                                          : g.type.key === "map" ? "Submergence contours, colony layouts and habitation-level maps."
                                            : "Photographic and documentary field records collected during ALERT casework."}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 268px), 1fr))", gap: 14 }}>
                    {g.pages.map((item) => (
                      <article key={item.slug} className="archive-page-card" style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 9 }}>
                        <span className="archive-type-chip" style={{ background: `${item.type.tone}14`, color: item.type.tone }}>
                          {item.type.icon} {item.type.short}
                        </span>

                        <Link to={`/page/${item.slug}`} style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1.4, textDecoration: "none" }}>
                          {item.title}
                        </Link>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: "0.72rem", color: "var(--color-text-light)" }}>
                          {item.pdfs.length > 0 ? <span className="archive-meta"><FaFilePdf size={9} /> {item.pdfs.length} PDF{item.pdfs.length > 1 ? "s" : ""}</span> : null}
                          {item.tables_count > 0 ? <span className="archive-meta"><FaTable size={9} /> {item.tables_count} data table{item.tables_count > 1 ? "s" : ""}</span> : null}
                          {item.images_count > 0 ? <span className="archive-meta"><FaImage size={9} /> {item.images_count} archival photo{item.images_count > 1 ? "s" : ""}</span> : null}
                        </div>

                        {item.pdfs.length > 0 ? (
                          <div style={{ display: "grid", gap: 6 }}>
                            {item.pdfs.slice(0, 2).map((d, dIdx) => {
                              const url = d.url || d.file;
                              const label = prettyPdfLabel(d.filename || url);
                              return (
                                <div key={`${item.slug || 'page'}-${url}-${dIdx}`} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 6, alignItems: "center" }}>
                                  <span style={{ fontSize: "0.74rem", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>{label}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPdf({ file: url, title: label, meta: item.title })}
                                    className="archive-mini-btn"
                                    aria-label={`View ${label}`}
                                  >
                                    <FaEye size={10} /> View
                                  </button>
                                  <a href={url} download className="archive-mini-btn" aria-label={`Save ${label}`}>
                                    <FaDownload size={9} /> Save
                                  </a>
                                </div>
                              );
                            })}
                            {item.pdfs.length > 2 ? (
                              <span style={{ fontSize: "0.72rem", color: "var(--color-text-light)" }}>+ {item.pdfs.length - 2} more in the PDF library below</span>
                            ) : null}
                          </div>
                        ) : null}

                        <Link to={`/page/${item.slug}`} style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 6, marginTop: "auto", textDecoration: "none" }}>
                          Open Page <FaArrowRight size={10} />
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ))}

              <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 16 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(210,25,12,0.08)", color: "var(--color-primary)", display: "grid", placeItems: "center", fontSize: "0.9rem" }}>
                  <FaFilePdf />
                </span>
                Statutory &amp; Reference PDF Library ({libraryDocs.length})
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-light)" }}>· {archivePdfs.length} attached to archived pages, {referenceLibrary.length} on ALERT's reference shelf</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
                {libraryDocs.map((doc, docIdx) => (
                  <div key={doc.file ? `${doc.file}-${docIdx}` : docIdx} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 10 }}>
                    <span className="archive-type-chip" style={{ background: `${doc.tone}14`, color: doc.tone }}>
                      {doc.icon} {doc.chip}
                    </span>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1.4 }}>{doc.title}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-light)", lineHeight: 1.6 }}>{doc.desc || doc.meta}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: "0.71rem", color: "var(--color-text-light)" }}>
                      <span className="archive-meta"><FaFilePdf size={9} /> PDF</span>
                      {doc.size ? <span className="archive-meta">{doc.size}</span> : null}
                      {doc.meta && doc.desc ? <span className="archive-meta">{doc.meta}</span> : null}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedPdf({ file: doc.file, title: doc.title, meta: doc.meta || "Polavaram LA & R&R Archive" })}
                        className="plr-card-btn-view"
                      >
                        <FaEye size={11} /> View PDF
                      </button>
                      <a href={doc.file} download className="plr-card-btn-save">
                        <FaDownload size={10} /> Save
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 36 }}>
                <Link to="/all-pages?category=Polavaram%20LA%20%26%20R%26R" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Browse All Site Pages <FaArrowRight size={12} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* PDF Interactive Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={true}
          file={selectedPdf.file || selectedPdf.url || selectedPdf.fileUrl}
          title={selectedPdf.title}
          meta={selectedPdf.meta || "Official Court / Legal Dossier"}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </>
  );
}
