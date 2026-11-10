import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaUsers,
  FaCheckCircle,
  FaEnvelope,
  FaShieldAlt,
  FaHeart,
  FaVideo,
  FaImages,
  FaFilePdf,
  FaExternalLinkAlt,
  FaTree,
  FaBalanceScale,
  FaPaperPlane,
  FaUser,
  FaPhone,
  FaLink,
  FaCommentAlt,
  FaSpinner
} from "react-icons/fa";
import { getCareers, submitCareerApplication } from "../api/client";

const sectionDividerStyle = { borderTop: "1px solid #e2e8f0", marginTop: 64, paddingTop: 64, scrollMarginTop: 165 };

const DEFAULT_APPLY_EMAIL = "contact@alertngo.in";

const defaultOpenings = [
  {
    id: 1,
    role: "Field Coordinator — Polavaram R&R",
    type: "Full-time",
    place: "Vijayawada HQ with field travel, ASR & Eluru districts",
    icon: "FaMapMarkerAlt",
    about: "Lead household surveys and social audits across the submergence belt, verify RFCTLARR Act 2013 entitlements, and carry findings into meetings with the R&R Commissioner and Gram Sabhas.",
    fit: "Field research experience with tribal communities, Telugu fluency, comfort with long mandal travel.",
    apply_email: "contact@alertngo.in"
  },
  {
    id: 2,
    role: "Legal Aid & RTI Researcher",
    type: "Full-time",
    place: "Vijayawada HQ",
    icon: "FaShieldAlt",
    about: "Draft RTI representations, writ petition documentation and RoFR / LTR case files with the Legal Cell, and prepare village-level legal literacy material on the Bare Acts.",
    fit: "Law degree or legal-research background; writing in plain Telugu and English; familiarity with forest and land law.",
    apply_email: "contact@alertngo.in"
  },
  {
    id: 3,
    role: "Women Cooperatives Manager",
    type: "Full-time",
    place: "Krishna District coastal mandals",
    icon: "FaUsers",
    about: "Work with Matsya Mithra groups on savings discipline, market linkages, fish handling and leadership training for Yenadi members across the six coastal mandals.",
    fit: "Experience with SHGs or cooperatives, fisheries or livelihood programmes, and community mobilisation.",
    apply_email: "contact@alertngo.in"
  },
  {
    id: 4,
    role: "Monitoring, Evaluation & Learning Officer",
    type: "Full-time",
    place: "Vijayawada HQ with field visits",
    icon: "FaGraduationCap",
    about: "Maintain the MEL framework behind ALERT's 35 institutional policies — beneficiary tracking, outcome harvesting, donor reporting and the evidence used in our public impact pages.",
    fit: "M&E or development-economics background, data cleaning and reporting discipline, Kannada/Telugu an advantage.",
    apply_email: "contact@alertngo.in"
  },
  {
    id: 5,
    role: "Solar & Green Energy Technician",
    type: "Contract / Project",
    place: "Eastern Ghats agency habitations",
    icon: "FaBriefcase",
    about: "Install and service solar home lighting and street poles, train local youth maintenance teams, and keep the spares and warranty record for each hamlet.",
    fit: "ITI or diploma in electrical work, solar system experience, willingness to stay in field locations.",
    apply_email: "contact@alertngo.in"
  }
];

const defaultPathways = [
  {
    title: "Field Volunteering",
    who: "Students and early-career practitioners",
    body: "Join a mandal team for relief distribution, school support, documentation drives or civil-documentation camps. Short stints of two to four weeks, longer placements by arrangement."
  },
  {
    title: "Research Internships",
    who: "Postgraduate researchers in law, development, anthropology, data",
    body: "Work with verified programme records on land rights, displacement rehabilitation or cooperative livelihoods. We ask for a research design cleared by your guide and a plain-language summary for the community."
  },
  {
    title: "Skilled Pro-Bono Support",
    who: "Lawyers, accountants, designers, developers, translators",
    body: "Legal opinion support, audit readiness, translation of Bare Acts into Koya and Telugu, photography and archive digitisation — contributed on your own schedule."
  }
];

const defaultValues = [
  "Volunteer & Intern Professional Code for work inside Fifth Scheduled Adivasi habitations",
  "POSH Act 2013 compliance with an active Internal Complaints Committee",
  "Child Protection & Safeguarding Policy — background checks and no unsupervised access",
  "Human Resource Policy with merit recruitment and affirmative induction of tribal youth",
  "Do No Harm and conflict-sensitive community practice",
  "Grievance Redressal Mechanism with a 15-day resolution pathway"
];

const defaultApplySteps = [
  { n: "01", t: "Write to us", d: `Email contact@alertngo.in with the role or pathway in the subject line — for example "Application — MEL Officer".` },
  { n: "02", t: "Send your file", d: "CV or resume, a short note on why this work, and contacts for two referees. Certificates can follow later." },
  { n: "03", t: "Conversation", d: "A first call with the programme team, then a field or task-based exercise that reflects the actual work." },
  { n: "04", t: "Decision", d: "Written offer or honest feedback. Vacancies are filled as project funding allows; we keep strong applicants in a talent pool." }
];

const defaultTrustStrip = [
  { text: "No Recruitment Fee", icon: "FaShieldAlt" },
  { text: "POSH Compliant Workplace", icon: "FaCheckCircle" },
  { text: "Tribal Youth Induction", icon: "FaUsers" }
];

function renderRoleIcon(iconName) {
  switch (iconName) {
    case "FaMapMarkerAlt": return <FaMapMarkerAlt />;
    case "FaShieldAlt": return <FaShieldAlt />;
    case "FaUsers": return <FaUsers />;
    case "FaGraduationCap": return <FaGraduationCap />;
    case "FaHeart": return <FaHeart />;
    case "FaTree": return <FaTree />;
    case "FaBalanceScale": return <FaBalanceScale />;
    case "FaBriefcase":
    default:
      return <FaBriefcase />;
  }
}

function renderTrustIcon(iconName) {
  switch (iconName) {
    case "FaCheckCircle": return <FaCheckCircle className="cta-trust-icon" aria-hidden="true" />;
    case "FaUsers": return <FaUsers className="cta-trust-icon" aria-hidden="true" />;
    case "FaShieldAlt":
    default:
      return <FaShieldAlt className="cta-trust-icon" aria-hidden="true" />;
  }
}

function parseValueItem(v, idx) {
  if (typeof v !== "string") {
    return {
      icon: <FaCheckCircle />,
      title: "Organizational Policy",
      desc: String(v)
    };
  }

  const trimmed = v.trim();

  // 1: Volunteer & Intern Professional Code
  if (/volunteer\s*&?\s*intern/i.test(trimmed)) {
    return {
      icon: <FaUsers />,
      title: "Volunteer & Intern Code",
      desc: "Strict professional code of conduct for fieldwork inside Fifth Scheduled Adivasi habitations."
    };
  }

  // 2: POSH Act 2013
  if (/posh\s*act/i.test(trimmed)) {
    return {
      icon: <FaBalanceScale />,
      title: "POSH Act 2013 Compliance",
      desc: "Active Internal Complaints Committee ensuring a safe, respectful, harassment-free workplace."
    };
  }

  // 3: Child Protection & Safeguarding
  if (/child\s*protection/i.test(trimmed)) {
    return {
      icon: <FaHeart />,
      title: "Child Protection & Safeguarding",
      desc: "Mandatory background checks, code of ethics, and zero unsupervised access to minors."
    };
  }

  // 4: Human Resource Policy & tribal youth
  if (/human\s*resource|tribal\s*youth/i.test(trimmed)) {
    return {
      icon: <FaGraduationCap />,
      title: "Affirmative HR & Youth Induction",
      desc: "Merit-based recruitment with affirmative induction for youth from tribal communities."
    };
  }

  // 5: Do No Harm
  if (/do\s*no\s*harm/i.test(trimmed)) {
    return {
      icon: <FaTree />,
      title: "Do No Harm Principle",
      desc: "Conflict-sensitive community engagement respecting tribal self-governance and culture."
    };
  }

  // 6: Grievance Redressal
  if (/grievance\s*redressal/i.test(trimmed)) {
    return {
      icon: <FaShieldAlt />,
      title: "Grievance Redressal Mechanism",
      desc: "Structured, time-bound 15-day resolution pathway for community and staff concerns."
    };
  }

  // Generic custom delimiter splitting (e.g. from CMS updates)
  if (trimmed.includes(" — ")) {
    const parts = trimmed.split(" — ");
    return {
      icon: <FaCheckCircle />,
      title: parts[0].trim(),
      desc: parts.slice(1).join(" — ").trim()
    };
  }
  if (trimmed.includes(" - ")) {
    const parts = trimmed.split(" - ");
    return {
      icon: <FaCheckCircle />,
      title: parts[0].trim(),
      desc: parts.slice(1).join(" - ").trim()
    };
  }
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    return {
      icon: <FaCheckCircle />,
      title: parts[0].trim(),
      desc: parts.slice(1).join(":").trim()
    };
  }

  return {
    icon: <FaCheckCircle />,
    title: trimmed,
    desc: ""
  };
}

function getYouTubeEmbed(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : url;
}

const sectionHeading = (badgeText, title, sub) => (
  <div className="careers-heading" style={{ textAlign: "center", maxWidth: 860, margin: "0 auto 40px" }}>
    <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>{badgeText}</span>
    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
      {title}
    </h2>
    <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem", margin: 0 }}>{sub}</p>
  </div>
);

export default function Careers() {
  const defaultPageValues = {
    badge: "Section 01",
    title: "Working With ALERT",
    subtitle: "ALERT is a Vijayawada-based society working in the Fifth Scheduled Areas of Andhra Pradesh since 2004. Our teams are small, field-first, and answerable to Gram Sabhas — so the work is close to the community and rarely desk-bound.",
    intro_p1: "Founded and led by <strong>Y.L.J.B. Jayaraj</strong>, ALERT runs four operational wings — Legal Cell, Polavaram LA & R&R Field Unit, Antyodaya Livelihoods & Women Cooperatives, and Finance, Administration & Compliance. Each needs people who can hold a file, a conversation and a village meeting on the same day.",
    intro_p2: "Openings below are the roles we recruit for regularly. Availability depends on project funding cycles — if a post is closed when you write, we keep your file for the next cycle.",
    hero_media_type: "image",
    hero_media_url: "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg",
    hero_poster: "",
    apply_email: DEFAULT_APPLY_EMAIL,
    partner_btn_text: "Partner With Us",
    partner_btn_url: "/partner",
    openings_badge: "Section 02",
    openings_title: "Roles We Recruit For",
    openings_subtitle: "Five core positions across the legal, field, livelihood and compliance wings.",
    pathways_badge: "Section 03",
    pathways_title: "Internships & Volunteer Pathways",
    pathways_subtitle: "Three ways to work with ALERT without a paid post — each governed by our Volunteer & Intern Professional Code.",
    steps_badge: "Section 04",
    steps_title: "How To Apply",
    steps_subtitle: "One email, four steps. We never charge any fee at any stage of recruitment.",
    values_title: "What you can expect from us",
    cta_badge: "Careers",
    cta_title: "Do Work That Reaches the Last Hamlet",
    cta_subtitle: "If none of the roles above fit you yet, send your profile anyway. Field coordinators, legal researchers and MEL staff are recruited as project funding opens.",
    cta_email_subject: "Profile for ALERT talent pool",
    cta_contact_url: "/contact"
  };

  const [page, setPage] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_page");
      if (local) return { ...defaultPageValues, ...JSON.parse(local) };
    } catch (e) { }
    return defaultPageValues;
  });

  const [openings, setOpenings] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_openings");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return defaultOpenings;
  });

  const [pathways, setPathways] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_pathways");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const pageLocal = localStorage.getItem("alertngo_careers_page");
      if (pageLocal) {
        const pObj = JSON.parse(pageLocal);
        const pw = typeof pObj.pathways_json === "string" ? JSON.parse(pObj.pathways_json) : pObj.pathways_json;
        if (Array.isArray(pw) && pw.length > 0) return pw;
      }
    } catch (e) { }
    return defaultPathways;
  });

  const [steps, setSteps] = useState(defaultApplySteps);
  const [values, setValues] = useState(defaultValues);
  const [trustStrip, setTrustStrip] = useState(defaultTrustStrip);
  const [mediaList, setMediaList] = useState([]);

  // Dynamic Pathway & Role Options managed by Admin
  const [customOptions, setCustomOptions] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_form_options");
      if (local) return JSON.parse(local);
    } catch (e) {}
    return [
      "Field Volunteering",
      "Research Internships",
      "Skilled Pro-Bono Support",
      "General Volunteer / Talent Pool",
      "Pro-Bono Legal / Research Support"
    ];
  });

  const refreshFromStorage = () => {
    try {
      const pageLocal = localStorage.getItem("alertngo_careers_page");
      if (pageLocal) {
        const pObj = JSON.parse(pageLocal);
        setPage((prev) => ({ ...prev, ...pObj }));
        const pw = typeof pObj.pathways_json === "string" ? JSON.parse(pObj.pathways_json) : pObj.pathways_json;
        if (Array.isArray(pw)) setPathways(pw);
        const st = typeof pObj.steps_json === "string" ? JSON.parse(pObj.steps_json) : pObj.steps_json;
        if (Array.isArray(st)) setSteps(st);
        const vl = typeof pObj.values_json === "string" ? JSON.parse(pObj.values_json) : pObj.values_json;
        if (Array.isArray(vl)) setValues(vl);
      }
      const pwLocal = localStorage.getItem("alertngo_careers_pathways");
      if (pwLocal) {
        const parsedPw = JSON.parse(pwLocal);
        if (Array.isArray(parsedPw)) setPathways(parsedPw);
      }
      const opLocal = localStorage.getItem("alertngo_careers_openings");
      if (opLocal) {
        const parsedOp = JSON.parse(opLocal);
        if (Array.isArray(parsedOp)) setOpenings(parsedOp);
      }
      const foLocal = localStorage.getItem("alertngo_careers_form_options");
      if (foLocal) {
        const parsedFo = JSON.parse(foLocal);
        if (Array.isArray(parsedFo)) setCustomOptions(parsedFo);
      }
    } catch (e) { }
  };

  useEffect(() => {
    let isMounted = true;
    window.addEventListener("alertngo_careers_updated", refreshFromStorage);
    window.addEventListener("alertngo_careers_form_options_updated", refreshFromStorage);

    getCareers()
      .then((res) => {
        if (!isMounted || !res || !res.success) return;
        if (res.page) {
          setPage((prev) => ({ ...prev, ...res.page }));
          try {
            const pw = typeof res.page.pathways_json === "string" ? JSON.parse(res.page.pathways_json) : res.page.pathways_json;
            if (Array.isArray(pw) && pw.length > 0) setPathways(pw);
          } catch (e) { }
          try {
            const st = typeof res.page.steps_json === "string" ? JSON.parse(res.page.steps_json) : res.page.steps_json;
            if (Array.isArray(st) && st.length > 0) setSteps(st);
          } catch (e) { }
          try {
            const vl = typeof res.page.values_json === "string" ? JSON.parse(res.page.values_json) : res.page.values_json;
            if (Array.isArray(vl) && vl.length > 0) setValues(vl);
          } catch (e) { }
          try {
            const ts = typeof res.page.trust_strip_json === "string" ? JSON.parse(res.page.trust_strip_json) : res.page.trust_strip_json;
            if (Array.isArray(ts) && ts.length > 0) setTrustStrip(ts);
          } catch (e) { }
        }
        if (Array.isArray(res.openings) && res.openings.length > 0) {
          setOpenings(res.openings);
        }
        if (Array.isArray(res.media)) {
          setMediaList(res.media);
        }
      })
      .catch((err) => {
        console.warn("Careers dynamic fetch fallback:", err);
      });

    return () => {
      isMounted = false;
      window.removeEventListener("alertngo_careers_updated", refreshFromStorage);
      window.removeEventListener("alertngo_careers_form_options_updated", refreshFromStorage);
    };
  }, []);

  const applyEmail = page.apply_email || DEFAULT_APPLY_EMAIL;

  // Interactive Application Form State
  const [appForm, setAppForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest_type: "",
    background: "",
    note: "",
    resume_url: "",
    resume_name: "",
    resume_size: "",
    resume_data: "",
    referees: ""
  });
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appSuccess, setAppSuccess] = useState(null);
  const [appError, setAppError] = useState("");

  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setAppError("File is too large. Please select a resume document under 12MB.");
      return;
    }
    setAppError("");
    const reader = new FileReader();
    reader.onload = () => {
      setAppForm((prev) => ({
        ...prev,
        resume_data: reader.result,
        resume_name: file.name,
        resume_size: file.size < 1024 * 1024
          ? (file.size / 1024).toFixed(1) + " KB"
          : (file.size / (1024 * 1024)).toFixed(2) + " MB"
      }));
    };
    reader.onerror = () => {
      setAppError("Failed to read the file. Please try again or paste a link.");
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setAppError("");
    if (!appForm.name.trim() || !appForm.email.trim() || !appForm.note.trim()) {
      setAppError("Please provide your name, email, and statement of interest.");
      return;
    }

    setAppSubmitting(true);
    const selectedInterest = appForm.interest_type || (pathways[0]?.title || "Field Volunteering");
    const leadPayload = {
      ...appForm,
      id: Date.now(),
      interest_type: selectedInterest,
      resume_url: appForm.resume_data || appForm.resume_url || "",
      resume_name: appForm.resume_name || (appForm.resume_url ? "Candidate Portfolio Link" : ""),
      status: "New",
      created_at: new Date().toISOString()
    };

    // Store in localStorage for instant admin reflection
    try {
      const existing = JSON.parse(localStorage.getItem("alertngo_career_leads") || "[]");
      existing.unshift(leadPayload);
      localStorage.setItem("alertngo_career_leads", JSON.stringify(existing));
      window.dispatchEvent(new Event("alertngo_career_leads_updated"));
    } catch (err) {}

    // Post to backend
    try {
      const res = await submitCareerApplication(leadPayload);
      setAppSuccess({
        refId: res?.id || leadPayload.id,
        name: leadPayload.name,
        role: selectedInterest,
        resume_name: leadPayload.resume_name
      });
      setAppForm({
        name: "",
        email: "",
        phone: "",
        interest_type: "",
        background: "",
        note: "",
        resume_url: "",
        resume_name: "",
        resume_size: "",
        resume_data: "",
        referees: ""
      });
    } catch (err) {
      setAppSuccess({
        refId: leadPayload.id,
        name: leadPayload.name,
        role: selectedInterest,
        resume_name: leadPayload.resume_name
      });
    } finally {
      setAppSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .careers-hero-section {
          padding-top: 140px;
          scroll-margin-top: 96px;
        }
        .career-card-modern {
          background: #ffffff;
          border-radius: 20px;
          padding: 26px 24px;
          box-shadow: 0 8px 26px -4px rgba(0, 49, 144, 0.05);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .career-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 49, 144, 0.12);
          border-color: rgba(210, 25, 12, 0.3);
        }
        .career-type-pill {
          display: inline-flex;
          align-items: center;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .career-loc-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          color: #475569;
          margin-bottom: 14px;
        }
        .career-fits-box {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-left: 3px solid var(--color-primary, #D2190C);
          border-radius: 0 12px 12px 0;
          padding: 12px 14px;
          margin-bottom: 18px;
          font-size: 0.84rem;
          color: #334155;
          line-height: 1.6;
        }
        .career-apply-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #D2190C 0%, #EA580C 100%);
          color: #ffffff !important;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(210, 25, 12, 0.25);
          transition: all 0.25s ease;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
        }
        .career-apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(210, 25, 12, 0.35);
        }
        .career-jd-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 12px;
          background: #f0f9ff;
          border: 1.5px solid #bae6fd;
          color: #0284c7;
          font-weight: 700;
          font-size: 0.82rem;
          text-decoration: none;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .career-jd-btn:hover {
          background: #e0f2fe;
          border-color: #7dd3fc;
        }

        /* SECTION 03 — PATHWAYS */
        .career-pathway-card {
          background: #ffffff;
          padding: 24px 22px;
          border-radius: 18px;
          box-shadow: 0 4px 18px -2px rgba(0, 49, 144, 0.05);
          border: 1px solid #e2e8f0;
          border-top: 3.5px solid var(--logo-gold, #F5A000);
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.25s ease;
        }
        .career-pathway-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px -6px rgba(0, 49, 144, 0.1);
        }
        .career-pathway-who {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--color-primary, #D2190C);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* SECTION 04 — HOW TO APPLY STEPS */
        .career-step-card {
          background: #ffffff;
          padding: 22px 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
          position: relative;
        }
        .career-step-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }
        .career-step-num {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-primary, #D2190C);
          display: inline-block;
          margin-bottom: 8px;
          line-height: 1;
        }
        .career-step-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-dark);
          margin: 0 0 8px 0;
        }
        .career-step-desc {
          font-size: 0.85rem;
          color: var(--color-text-light);
          line-height: 1.65;
          margin: 0;
        }

        /* SECTION 04 — INTERACTIVE APPLICATION FORM */
        .career-application-card {
          background: #ffffff;
          border-radius: 22px;
          padding: clamp(22px, 3.5vw, 36px);
          box-shadow: 0 12px 32px -8px rgba(0, 49, 144, 0.08);
          border: 1px solid #e2e8f0;
          border-top: 4px solid var(--color-primary, #D2190C);
          margin-top: 32px;
          margin-bottom: 36px;
          box-sizing: border-box;
        }
        .career-app-input, .career-app-select, .career-app-textarea {
          width: 100%;
          padding: 11px 14px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.88rem;
          color: #0f172a;
          box-sizing: border-box;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .career-app-input:focus, .career-app-select:focus, .career-app-textarea:focus {
          outline: none;
          background: #ffffff;
          border-color: var(--color-primary, #D2190C);
          box-shadow: 0 0 0 3px rgba(210, 25, 12, 0.12);
        }
        .career-app-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 6px;
        }
        .career-app-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 26px;
          border-radius: 12px;
          background: linear-gradient(135deg, #D2190C 0%, #b81409 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(210, 25, 12, 0.25);
        }
        .career-app-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(210, 25, 12, 0.35);
        }
        .career-app-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }

        /* SECTION 04 — VALUES & SAFEGUARDS MODERN CARD */
        .career-values-card-modern {
          background: #ffffff;
          border-radius: 22px;
          padding: clamp(22px, 3.5vw, 36px);
          box-shadow: 0 10px 30px -10px rgba(0, 49, 144, 0.07);
          border: 1px solid #e2e8f0;
          margin-top: 16px;
          position: relative;
          overflow: hidden;
        }
        .career-values-card-modern::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981 0%, #059669 45%, #f59e0b 100%);
        }
        .career-values-header {
          margin-bottom: 24px;
        }
        .career-values-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }
        .career-values-title {
          font-size: clamp(1.15rem, 2.5vw, 1.35rem);
          font-weight: 700;
          color: var(--color-dark);
          margin: 0 0 6px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .career-values-subtitle {
          font-size: 0.88rem;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }
        .career-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 14px;
        }
        .career-value-tile {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .career-value-tile:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 6px 20px -4px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }
        .career-value-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #a7f3d0;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 15px;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.12);
        }
        .career-value-content {
          flex: 1;
          min-width: 0;
        }
        .career-value-lead {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--color-dark);
          margin: 0 0 4px 0;
          line-height: 1.35;
        }
        .career-value-desc {
          font-size: 0.82rem;
          color: #475569;
          line-height: 1.55;
          margin: 0;
        }

        /* CAREERS CTA SECTION */
        .careers-cta-section {
          position: relative;
        }

        @media (max-width: 768px) {
          .careers-hero-section {
            padding-top: 138px !important;
          }
          .careers-heading {
            margin-bottom: 24px !important;
          }
          .career-card-modern {
            padding: 18px 16px !important;
            border-radius: 18px !important;
          }
          .careers-hero-actions {
            flex-direction: column !important;
            width: 100%;
          }
          .careers-hero-actions a {
            width: 100% !important;
            justify-content: center !important;
          }
          .careers-hero-media {
            min-height: 240px !important;
            height: 240px !important;
          }
          .careers-hero-media img,
          .careers-hero-media video {
            height: 240px !important;
          }
          .careers-openings-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .career-pathways-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .career-pathway-card {
            padding: 18px 16px !important;
          }
          .career-steps-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
          }
          .career-step-card {
            padding: 16px 14px !important;
          }
          .career-values-card-modern {
            padding: 20px 16px !important;
            border-radius: 18px !important;
          }
          .career-values-header {
            margin-bottom: 18px !important;
          }
          .career-values-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .career-value-tile {
            padding: 12px 14px !important;
            gap: 12px !important;
          }
          .career-value-icon-box {
            width: 32px !important;
            height: 32px !important;
            font-size: 13px !important;
          }
          .career-value-lead {
            font-size: 0.88rem !important;
          }
          .career-value-desc {
            font-size: 0.8rem !important;
          }
          .careers-cta-section {
            padding: 48px 0 60px !important;
          }
          .careers-cta-section .cta-shell--single {
            padding: 28px 16px !important;
            border-radius: 20px !important;
          }
          .careers-cta-section .cta-title {
            font-size: clamp(1.4rem, 6.2vw, 1.85rem) !important;
            line-height: 1.25 !important;
            margin-bottom: 12px !important;
          }
          .careers-cta-section .cta-subtitle {
            font-size: 0.86rem !important;
            line-height: 1.6 !important;
            margin-bottom: 20px !important;
          }
          .careers-cta-section .cta-actions {
            flex-direction: column !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .careers-cta-section .cta-actions a {
            width: 100% !important;
            justify-content: center !important;
            padding: 12px 18px !important;
            font-size: 0.88rem !important;
            box-sizing: border-box !important;
          }
          .careers-cta-section .cta-trust-strip {
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 8px !important;
            margin-top: 16px !important;
          }
          .careers-cta-section .cta-trust-item {
            font-size: 0.78rem !important;
          }
        }
      `}</style>

      {/* ── SECTION 01 — WORKING WITH ALERT ── */}
      <section className="section-pad careers-hero-section hero" id="work-with-alert">
        <div className="container">
          {sectionHeading(
            page.badge || "Section 01",
            page.title || "Working With ALERT",
            page.subtitle || "ALERT is a Vijayawada-based society working in the Fifth Scheduled Areas of Andhra Pradesh since 2004."
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
              <div className="careers-hero-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <a href={`mailto:${applyEmail}?subject=Application%20to%20ALERT`} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <FaEnvelope size={12} /> Send Your Profile
                </a>
                <Link to={page.partner_btn_url || "/partner"} className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {page.partner_btn_text || "Partner With Us"} <FaArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* HERO MULTIMEDIA CONTAINER (SUPPORT BOTH IMAGE AND VIDEO) */}
            <div className="careers-hero-media" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-md)", background: "#0b0f17", minHeight: 340 }}>
              {page.hero_media_type === "video" && page.hero_media_url ? (
                <video
                  src={page.hero_media_url}
                  poster={page.hero_poster || "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg"}
                  controls
                  style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                />
              ) : (
                <img
                  src={page.hero_media_url || "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg"}
                  alt="ALERT field team meeting with community members"
                  style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const cur = e.currentTarget.src || "";
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
                    e.currentTarget.src = "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg";
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 02 — CURRENT OPENINGS ── */}
      <section className="section-pad" id="openings" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            page.openings_badge || "Section 02",
            page.openings_title || "Roles We Recruit For",
            page.openings_subtitle || "Five core positions across the legal, field, livelihood and compliance wings."
          )}

          <div className="careers-openings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {openings.filter(o => o.is_active === undefined || Number(o.is_active) !== 0).map((o) => {
              const applyTarget = o.apply_link || `mailto:${o.apply_email || applyEmail}?subject=${encodeURIComponent(`Application — ${o.role}`)}`;
              const isExternal = Boolean(o.apply_link && !o.apply_link.startsWith("mailto:"));

              return (
                <article key={o.id || o.role} className="career-card-modern">
                  {/* CARD HEADER */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                    <span style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, rgba(210,25,12,0.1) 0%, rgba(245,160,0,0.12) 100%)", color: "var(--color-primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {renderRoleIcon(o.icon)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                        <span className="career-type-pill">
                          {o.type}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.08rem", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1.35, margin: 0 }}>
                        {o.role}
                      </h3>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="career-loc-chip">
                    <FaMapMarkerAlt size={12} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <span>{o.place}</span>
                  </div>

                  {/* ABOUT */}
                  <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                    {o.about}
                  </p>

                  {/* ATTACHED MEDIA (IMAGE / VIDEO / YOUTUBE) */}
                  {o.media_type && o.media_type !== "none" && o.media_url && (
                    <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      {o.media_type === "video" ? (
                        <video src={o.media_url} controls style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                      ) : o.media_type === "youtube" ? (
                        <iframe
                          src={getYouTubeEmbed(o.media_url)}
                          title={o.role}
                          style={{ width: "100%", height: 180, border: "none", display: "block" }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <img src={o.media_url} alt={o.role} style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} loading="lazy" />
                      )}
                    </div>
                  )}

                  {/* FIT / REQUIREMENTS */}
                  {o.fit && (
                    <div className="career-fits-box">
                      <strong style={{ color: "var(--color-dark)", display: "block", marginBottom: 3, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        What fits
                      </strong>
                      <span style={{ fontSize: "0.84rem", color: "#475569" }}>{o.fit}</span>
                    </div>
                  )}

                  {/* ATTACHED JD DOWNLOAD LINK & APPLY BUTTON */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto", paddingTop: 4 }}>
                    {o.jd_file && (
                      <a
                        href={o.jd_file}
                        target="_blank"
                        rel="noreferrer"
                        className="career-jd-btn"
                      >
                        <FaFilePdf size={13} /> Job Details (PDF)
                      </a>
                    )}

                    <a
                      href={applyTarget}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="career-apply-btn"
                    >
                      Apply for this role {isExternal ? <FaExternalLinkAlt size={11} /> : <FaArrowRight size={11} />}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 03 — INTERNSHIPS & VOLUNTEER PATHWAYS ── */}
      <section className="section-pad" id="pathways" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            page.pathways_badge || "Section 03",
            page.pathways_title || "Internships & Volunteer Pathways",
            page.pathways_subtitle || "Three ways to work with ALERT without a paid post — each governed by our Volunteer & Intern Professional Code."
          )}

          <div className="career-pathways-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
            {pathways.filter(p => p.is_active === undefined || Number(p.is_active) !== 0).map((p, pIdx) => (
              <div key={p.id || p.title || pIdx} className="career-pathway-card">
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>{p.title}</h3>
                <span className="career-pathway-who">{p.who}</span>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.7, margin: 0, flex: 1 }}>{p.body}</p>
                {p.link_url && (
                  <div style={{ paddingTop: 8 }}>
                    <Link to={p.link_url} style={{ color: "var(--color-primary)", fontSize: "0.82rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      Learn more <FaArrowRight size={9} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 04 — HOW TO APPLY ── */}
      <section className="section-pad" id="how-to-apply" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            page.steps_badge || "Section 04",
            page.steps_title || "How To Apply",
            page.steps_subtitle || "One email, four steps. We never charge any fee at any stage of recruitment."
          )}

          <div className="career-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20, marginBottom: 32 }}>
            {steps.map((s, idx) => (
              <div key={idx} className="career-step-card">
                <span className="career-step-num">{s.n || `0${idx + 1}`}</span>
                <h3 className="career-step-title">{s.t}</h3>
                <p className="career-step-desc">{s.d}</p>
              </div>
            ))}
          </div>

          {/* ── INTERACTIVE APPLICATION & PATHWAY FORM (Single Step Direct Application) ── */}
          <div id="apply-form" className="career-application-card">
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <span className="badge" style={{ marginBottom: 10, display: "inline-block" }}>
                  Direct Application &amp; Talent Pool
                </span>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.3rem, 2.4vw, 1.75rem)", color: "var(--color-dark)", margin: "0 0 10px" }}>
                  Express Your Interest or Apply for a Pathway
                </h3>
                <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 auto", maxWidth: 640 }}>
                  Submit your details and upload your resume directly below. Submissions are received directly by our recruitment cell for immediate review and follow-up.
                </p>
              </div>

              {appSuccess ? (
                <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1.5px solid #10b981", borderRadius: 14, padding: "30px 24px", textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#10b981", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                    <FaCheckCircle size={28} />
                  </div>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#065f46", margin: "0 0 8px" }}>
                    Application Submitted Successfully!
                  </h4>
                  <p style={{ color: "#047857", fontSize: "0.92rem", lineHeight: 1.6, margin: "0 0 12px" }}>
                    Thank you, <strong>{appSuccess.name}</strong>. Your profile for <strong>{appSuccess.role}</strong> has been logged into ALERT’s talent pool (Application ID: <code>#{appSuccess.refId}</code>).
                  </p>
                  {appSuccess.resume_name && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16, 185, 129, 0.15)", color: "#065f46", padding: "4px 12px", borderRadius: 6, fontSize: "0.82rem", fontWeight: 600, marginBottom: 14 }}>
                      <FaFilePdf size={13} /> {appSuccess.resume_name} attached
                    </div>
                  )}
                  <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.5, margin: "0 0 20px" }}>
                    Our recruitment cell will review your profile and reach out via email or phone within 5–7 business days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAppSuccess(null)}
                    style={{ background: "#059669", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: "0.86rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  {appError && (
                    <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 18 }}>
                      {appError}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label className="career-app-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="career-app-input"
                        placeholder="e.g. Ananya Rao"
                        value={appForm.name}
                        onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="career-app-label">Email Address *</label>
                      <input
                        type="email"
                        required
                        className="career-app-input"
                        placeholder="e.g. ananya.rao@example.com"
                        value={appForm.email}
                        onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label className="career-app-label">Phone / WhatsApp Number</label>
                      <input
                        type="tel"
                        className="career-app-input"
                        placeholder="e.g. +91 98765 43210"
                        value={appForm.phone}
                        onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="career-app-label">Pathway or Role of Interest *</label>
                      <select
                        className="career-app-select"
                        value={appForm.interest_type}
                        onChange={(e) => setAppForm({ ...appForm, interest_type: e.target.value })}
                        required
                      >
                        <option value="">-- Select Pathway or Role --</option>
                        <optgroup label="🎓 Volunteer & Intern Pathways">
                          {pathways.filter(p => p.is_active === undefined || Number(p.is_active) !== 0).map((p, i) => (
                            <option key={`pw_${i}`} value={p.title}>{p.title}</option>
                          ))}
                        </optgroup>
                        <optgroup label="💼 Job Openings & Roles">
                          {openings.filter(o => o.is_active === undefined || Number(o.is_active) !== 0).map((o, i) => (
                            <option key={`op_${i}`} value={o.role}>{o.role} ({o.type})</option>
                          ))}
                        </optgroup>
                        {customOptions && customOptions.length > 0 && (
                          <optgroup label="🌟 Custom Channels & Talent Pool">
                            {customOptions
                              .filter(c => !pathways.some(p => p.title === c) && !openings.some(o => o.role === c))
                              .map((c, i) => (
                                <option key={`co_${i}`} value={c}>{c}</option>
                              ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="career-app-label">Current Academic / Professional Background</label>
                    <input
                      type="text"
                      className="career-app-input"
                      placeholder="e.g. Law student / Social work / IT / Agriculture"
                      value={appForm.background}
                      onChange={(e) => setAppForm({ ...appForm, background: e.target.value })}
                    />
                  </div>

                  {/* RESUME / CV FILE UPLOAD (PDF, DOC, DOCX) */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="career-app-label">Upload Resume / CV File *</label>
                    {appForm.resume_name ? (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#f0fdf4",
                        border: "1.5px solid #86efac",
                        borderRadius: 10,
                        padding: "10px 14px",
                        gap: 12
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FaFilePdf size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#166534", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {appForm.resume_name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#15803d" }}>
                              {appForm.resume_size || "Document ready for upload"} • Ready to attach
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppForm((prev) => ({ ...prev, resume_data: "", resume_name: "", resume_size: "" }))}
                          style={{
                            background: "#fee2e2",
                            border: "1px solid #fca5a5",
                            color: "#b91c1c",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Change / Remove
                        </button>
                      </div>
                    ) : (
                      <label style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #cbd5e1",
                        borderRadius: 10,
                        padding: "18px 14px",
                        background: "#f8fafc",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}>
                        <FaFilePdf size={24} style={{ color: "#ef4444", marginBottom: 6 }} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                          Click or drag to select your Resume / CV file
                        </span>
                        <span style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 3 }}>
                          Supports PDF, DOC, DOCX up to 12MB
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleResumeFileChange}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="career-app-label">Or Resume / Portfolio Public URL (Optional)</label>
                    <input
                      type="url"
                      className="career-app-input"
                      placeholder="e.g. Google Drive, LinkedIn, or Dropbox public link"
                      value={appForm.resume_url}
                      onChange={(e) => setAppForm({ ...appForm, resume_url: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="career-app-label">Statement of Interest &amp; Motivation *</label>
                    <textarea
                      rows={4}
                      required
                      className="career-app-textarea"
                      placeholder="Share a short note on why this work, your preferred duration/availability, and how your skills can serve tribal and forest-dwelling communities..."
                      value={appForm.note}
                      onChange={(e) => setAppForm({ ...appForm, note: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label className="career-app-label">Contacts for Two Referees (Optional)</label>
                    <input
                      type="text"
                      className="career-app-input"
                      placeholder="e.g. Prof. R. Sharma (Andhra Univ, 98480xxxxx) &amp; Dr. S. Rao"
                      value={appForm.referees}
                      onChange={(e) => setAppForm({ ...appForm, referees: e.target.value })}
                    />
                    <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, display: "block" }}>
                      Names, titles &amp; contact numbers/emails for two references. Certificates can follow later.
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderTop: "1px solid #f1f5f9", paddingTop: 18 }}>
                    <div style={{ fontSize: "0.76rem", color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                      <FaShieldAlt style={{ color: "#10b981", flexShrink: 0 }} />
                      <span>Zero recruitment fee &amp; POSH compliant safeguarding standards.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={appSubmitting}
                      className="career-app-submit-btn"
                    >
                      {appSubmitting ? (
                        <>
                          <FaSpinner className="spin" size={14} /> Submitting Application...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane size={13} /> Send Application &amp; Join Talent Pool
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="career-values-card-modern">
            <div className="career-values-header">
              <div className="career-values-badge">
                <FaShieldAlt size={11} />
                <span>Safeguarding & Governance</span>
              </div>
              <h3 className="career-values-title">
                {page.values_title || "What you can expect from us"}
              </h3>
              <p className="career-values-subtitle">
                ALERT upholds statutory labor compliance, ethical fieldwork protocols, and affirmative tribal dignity across every program.
              </p>
            </div>

            <div className="career-values-grid">
              {values.map((v, vIdx) => {
                const item = parseValueItem(v, vIdx);
                return (
                  <div key={vIdx} className="career-value-tile">
                    <div className="career-value-icon-box" aria-hidden="true">
                      {item.icon}
                    </div>
                    <div className="career-value-content">
                      <h4 className="career-value-lead">{item.title}</h4>
                      {item.desc && <p className="career-value-desc">{item.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── OPTIONAL MULTIMEDIA & FIELD WORK SHOWCASE SECTION ── */}
      {mediaList.length > 0 && (
        <section className="section-pad" id="careers-multimedia" style={sectionDividerStyle}>
          <div className="container">
            {sectionHeading(
              "Life & Mission",
              "Field Work, Youth & Community Orientation",
              "Visual moments from ALERT's field teams, community meetings, and educational workshops across the agency tract."
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {mediaList.map((m) => (
                <div key={m.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 200, background: "#0b0f17", position: "relative" }}>
                    {m.type === "video" ? (
                      <video src={m.url} poster={m.poster} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : m.type === "document" ? (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
                        <FaFilePdf size={46} />
                        <span style={{ marginTop: 8, fontSize: "0.85rem", color: "#334155", fontWeight: 600 }}>Downloadable Document</span>
                      </div>
                    ) : (
                      <img src={m.url} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    )}
                  </div>
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase" }}>{m.tag || "Field Work"}</span>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--color-dark)" }}>{m.title}</h4>
                    {m.description && <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--color-text-light)", lineHeight: 1.5, flex: 1 }}>{m.description}</p>}
                    {m.type === "document" && m.url && (
                      <div style={{ marginTop: 8 }}>
                        <a href={m.url} target="_blank" rel="noreferrer" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", padding: "6px 12px" }}>
                          <FaFilePdf size={11} /> Download PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CALL TO ACTION ── */}
      <section className="cta-section careers-cta-section">
        <div className="container cta-container">
          <div className="cta-shell cta-shell--single">
            <div className="cta-shell-glow cta-shell-glow-1" aria-hidden="true" />
            <div className="cta-shell-glow cta-shell-glow-2" aria-hidden="true" />

            <div className="cta-copy">
              <div className="cta-badge">
                <span className="cta-badge-dot" aria-hidden="true" />
                <span>{page.cta_badge || "Careers"}</span>
              </div>

              <h2 className="cta-title">
                {page.cta_title || "Do Work That Reaches the Last Hamlet"}
              </h2>

              <p className="cta-subtitle">
                {page.cta_subtitle || "If none of the roles above fit you yet, send your profile anyway. Field coordinators, legal researchers and MEL staff are recruited as project funding opens."}
              </p>

              <div className="cta-actions">
                <a
                  href={`mailto:${applyEmail}?subject=${encodeURIComponent(page.cta_email_subject || "Profile for ALERT talent pool")}`}
                  className="cta-btn-donate"
                >
                  <span>Email Your Profile</span>
                  <span className="cta-donate-heart" aria-hidden="true"><FaHeart size={13} /></span>
                </a>
                <Link to={page.cta_contact_url || "/contact"} className="cta-btn-volunteer">
                  <span>Talk to the Head Office</span>
                  <FaArrowRight size={12} className="cta-btn-arrow" aria-hidden="true" />
                </Link>
              </div>

              {trustStrip.length > 0 && (
                <div className="cta-trust-strip">
                  {trustStrip.map((item, tIdx) => (
                    <span key={tIdx} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {tIdx > 0 && <span className="cta-trust-dot" aria-hidden="true">•</span>}
                      <div className="cta-trust-item">
                        {renderTrustIcon(item.icon)}
                        <span>{item.text}</span>
                      </div>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
