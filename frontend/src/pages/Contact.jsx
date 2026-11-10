import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock,
  FaPaperPlane, FaCheckCircle, FaBuilding, FaExternalLinkAlt,
  FaChevronDown, FaCheck
} from "react-icons/fa";
import AnimatedTypewriter from "../components/AnimatedTypewriter";
import { fetchContactSettings, submitContactForm, DEFAULT_CONTACT_SETTINGS } from "../api/client";

export default function Contact() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: DEFAULT_CONTACT_SETTINGS.subject_options[0] || "General Inquiry",
    office: "Vijayawada Headquarters",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [officeDropdownOpen, setOfficeDropdownOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const officeDropdownRef = useRef(null);
  const subjectDropdownRef = useRef(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (officeDropdownRef.current && !officeDropdownRef.current.contains(e.target)) {
        setOfficeDropdownOpen(false);
      }
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target)) {
        setSubjectDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOfficeDropdownOpen(false);
        setSubjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Load contact settings
  useEffect(() => {
    let isMounted = true;
    fetchContactSettings().then((data) => {
      if (isMounted && data) {
        setSettings(data);
        if (data.subject_options && data.subject_options.length > 0) {
          setForm((prev) => ({
            ...prev,
            subject: prev.subject || data.subject_options[0]
          }));
        }
      }
    });

    const handleUpdate = (e) => {
      if (e.detail) setSettings((prev) => ({ ...prev, ...e.detail }));
    };
    window.addEventListener("alertngo_contact_settings_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("alertngo_contact_settings_updated", handleUpdate);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContactForm(form);
      setSubmitted(true);
    } catch (_) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const subjectList = (settings.subject_options && settings.subject_options.length > 0)
    ? settings.subject_options
    : DEFAULT_CONTACT_SETTINGS.subject_options;

  const branchList = (settings.branch_offices && settings.branch_offices.length > 0)
    ? settings.branch_offices
    : DEFAULT_CONTACT_SETTINGS.branch_offices;

  const officeOptions = [
    {
      value: "Vijayawada Headquarters",
      label: "Headquarters — Vijayawada",
      sub: "Main Office · Sai Nagar, Benz Circle"
    },
    ...branchList.map((b) => ({
      value: b.name,
      label: b.name,
      sub: b.location
    }))
  ];

  const selectedOffice = officeOptions.find((o) => o.value === form.office) || officeOptions[0];
  const selectedSubject = form.subject || subjectList[0] || "General Inquiry";

  return (
    <>
      <style>{`
        .contact-section {
          padding-top: 140px;
          scroll-margin-top: 96px;
        }
        .contact-heading {
          text-align: center;
          max-width: 880px;
          margin: 0 auto 30px;
        }
        .contact-main-title {
          font-family: var(--font-serif);
          font-size: clamp(1.7rem, 3.5vw, 2.3rem);
          color: var(--color-dark);
          margin-bottom: 12px;
          line-height: 1.3;
          font-weight: 800;
        }
        .contact-main-subtitle {
          color: var(--color-text-light);
          line-height: 1.7;
          font-size: 0.95rem;
          max-width: 760px;
          margin: 0 auto 16px;
        }
        .contact-typewriter-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 8px 18px;
          border-radius: 999px;
          box-shadow: 0 4px 14px -2px rgba(0, 49, 144, 0.05);
          margin-top: 6px;
        }
        .contact-dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          flex-shrink: 0;
        }
        .contact-channel-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }
        .contact-channel-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px -2px rgba(0, 49, 144, 0.05);
          border: 1px solid #edf2f7;
          transition: all 0.2s ease;
        }
        .contact-channel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(0, 49, 144, 0.08);
          border-color: #cbd5e1;
        }
        .channel-icon-box {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .channel-icon-red {
          background: rgba(210, 25, 12, 0.08);
          color: #D2190C;
        }
        .channel-icon-blue {
          background: rgba(0, 49, 144, 0.08);
          color: #003190;
        }
        .channel-icon-green {
          background: rgba(5, 150, 105, 0.08);
          color: #059669;
        }
        .channel-icon-amber {
          background: rgba(217, 119, 6, 0.08);
          color: #d97706;
        }
        .channel-body {
          min-width: 0;
          flex: 1;
        }
        .channel-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .channel-text {
          font-size: 0.82rem;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }
        .channel-meta-label {
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 500;
        }
        .channel-link {
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .channel-link.blue {
          color: #003190;
        }
        .channel-link.blue:hover {
          color: #D2190C;
          text-decoration: underline;
        }
        .channel-link.green {
          color: #059669;
        }
        .channel-link.green:hover {
          color: #047857;
          text-decoration: underline;
        }
        .contact-info-title {
          font-family: var(--font-serif);
          font-size: clamp(1.4rem, 2.5vw, 1.9rem);
          font-weight: 700;
          color: var(--color-dark);
          margin-bottom: 10px;
          line-height: 1.25;
        }
        .contact-info-desc {
          color: var(--color-text-light);
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 0.88rem;
        }
        .form-title {
          font-family: var(--font-sans);
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--color-dark);
          margin-top: 4px;
          margin-bottom: 6px;
        }
        .form-subtitle {
          font-size: 0.86rem;
          color: var(--color-text-light);
          line-height: 1.5;
        }
        .form-label {
          font-weight: 700;
          font-size: 0.82rem;
          color: #334155;
          margin-bottom: 5px;
          display: block;
        }
        .form-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 0.86rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          border-color: #D2190C;
          box-shadow: 0 0 0 3px rgba(210, 25, 12, 0.12);
        }
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 0.86rem;
          outline: none;
          box-sizing: border-box;
          resize: vertical;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-textarea:focus {
          border-color: #D2190C;
          box-shadow: 0 0 0 3px rgba(210, 25, 12, 0.12);
        }
        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .contact-select-trigger {
          width: 100%;
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .contact-select-trigger:focus,
        .contact-select-trigger[aria-expanded="true"] {
          outline: none;
          border-color: #D2190C;
          box-shadow: 0 0 0 3px rgba(210, 25, 12, 0.12);
        }
        .contact-select-val {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }
        .contact-select-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact-select-sub {
          font-size: 0.74rem;
          color: #64748b;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact-select-arrow {
          color: #64748b;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .contact-select-arrow.open {
          transform: rotate(180deg);
          color: #D2190C;
        }
        .contact-select-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 60;
          overflow-y: auto;
          max-height: 240px;
          padding: 4px;
        }
        .contact-select-option {
          padding: 8px 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          box-sizing: border-box;
        }
        .contact-select-option:hover {
          background: #f8fafc;
        }
        .contact-select-option.selected {
          background: #fef2f2;
        }
        .contact-select-option .opt-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.35;
          word-break: break-word;
        }
        .contact-select-option.selected .opt-label {
          color: #D2190C;
          font-weight: 700;
        }
        .contact-select-option .opt-desc {
          font-size: 0.73rem;
          color: #64748b;
          margin-top: 2px;
          line-height: 1.3;
          word-break: break-word;
        }
        .contact-select-option.selected .opt-desc {
          color: #991b1b;
        }
        .contact-select-option .opt-check {
          color: #D2190C;
          flex-shrink: 0;
        }

        /* Sleek submit button */
        .contact-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 44px;
          padding: 11px 20px;
          background: linear-gradient(135deg, #D2190C 0%, #B81509 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(210, 25, 12, 0.25);
          transition: all 0.2s ease;
          line-height: 1.2;
          box-sizing: border-box;
        }
        .contact-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(210, 25, 12, 0.35);
          background: linear-gradient(135deg, #b81509 0%, #9a1107 100%);
        }
        .contact-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .contact-submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .contact-section {
            padding-top: 170px !important;
          }
          .contact-heading {
            margin-bottom: 18px !important;
          }
          .contact-main-title {
            font-size: 1.35rem !important;
            line-height: 1.25 !important;
          }
          .contact-main-subtitle {
            font-size: 0.80rem !important;
            line-height: 1.45 !important;
            margin-bottom: 10px !important;
          }
          .contact-typewriter-pill {
            padding: 5px 12px !important;
            font-size: 0.76rem !important;
          }
          .contact-info-title {
            font-size: 1.15rem !important;
            line-height: 1.3 !important;
            margin-bottom: 6px !important;
          }
          .contact-info-desc {
            font-size: 0.78rem !important;
            line-height: 1.45 !important;
            margin-bottom: 14px !important;
          }
          .contact-channel-list {
            gap: 9px !important;
            margin-bottom: 20px !important;
          }
          .contact-channel-card {
            padding: 10px 12px !important;
            gap: 10px !important;
            border-radius: 10px !important;
          }
          .channel-icon-box {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            border-radius: 8px !important;
            font-size: 0.82rem !important;
          }
          .channel-title {
            font-size: 0.84rem !important;
            margin-bottom: 2px !important;
          }
          .channel-text {
            font-size: 0.76rem !important;
            line-height: 1.4 !important;
          }
          .channel-meta-label {
            font-size: 0.72rem !important;
          }
          .channel-link {
            font-size: 0.76rem !important;
          }
          .contact-branches-box {
            padding: 12px !important;
            border-radius: 10px !important;
          }
          .contact-branch-item {
            padding: 8px 10px !important;
            font-size: 0.76rem !important;
            border-radius: 6px !important;
          }
          .contact-form-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .contact-form {
            padding: 16px 12px !important;
            border-radius: 14px !important;
          }
          .form-title {
            font-size: 1.18rem !important;
            margin-bottom: 4px !important;
          }
          .form-subtitle {
            font-size: 0.78rem !important;
            margin-bottom: 12px !important;
          }
          .form-label {
            font-size: 0.78rem !important;
            margin-bottom: 4px !important;
          }
          .form-input, .form-textarea {
            font-size: 0.82rem !important;
            padding: 8px 10px !important;
          }
          .contact-submit-btn {
            min-height: 40px !important;
            padding: 9px 14px !important;
            font-size: 0.86rem !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(210, 25, 12, 0.2) !important;
          }
          .contact-submit-extra {
            display: none !important;
          }
          .contact-select-trigger {
            min-height: 40px !important;
            padding: 6px 10px !important;
          }
          .contact-select-label {
            font-size: 0.82rem !important;
          }
          .contact-select-sub {
            font-size: 0.70rem !important;
          }
        }
      `}</style>

      <section className="section-pad contact-section hero" id="head-office" style={{ scrollMarginTop: 96 }}>
        <div className="container">
          {/* HEADER INTRO */}
          <div className="contact-heading">
            <span className="badge" style={{ marginBottom: 10, display: "inline-block" }}>
              {settings.header_badge || "Section 01"}
            </span>
            <h1 className="contact-main-title">
              {settings.header_title || "Reach The Head Office"}
            </h1>
            <p className="contact-main-subtitle">
              {settings.header_subtitle}
            </p>

            <div className="contact-typewriter-pill">
              <span className="contact-dot-pulse" aria-hidden="true" />
              <AnimatedTypewriter
                prefix="Direct Lines:"
                prefixColor="#0f172a"
                highlightColor="#d97706"
                words={settings.typewriter_words && settings.typewriter_words.length > 0 ? settings.typewriter_words : DEFAULT_CONTACT_SETTINGS.typewriter_words}
                typingSpeed={50}
                deletingSpeed={25}
                pauseTime={2200}
              />
            </div>
          </div>

          <div className="contact-grid">
            {/* LEFT COLUMN: CONTACT DETAILS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge" style={{ marginBottom: 10, display: "inline-block" }}>
                {settings.info_badge || "Get In Touch"}
              </span>
              <h2 className="contact-info-title">
                {settings.info_title || "We Are Here To Support Adivasi Communities"}
              </h2>
              <p className="contact-info-desc">
                {settings.info_description}
              </p>

              <div className="contact-channel-list">
                {/* Headquarters Address */}
                <div className="contact-channel-card">
                  <div className="channel-icon-box channel-icon-red">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="channel-body">
                    <div className="channel-title">
                      {settings.headquarters_title || "Headquarters"}
                    </div>
                    <p className="channel-text" style={{ whiteSpace: "pre-line" }}>
                      {settings.headquarters_address}
                    </p>
                  </div>
                </div>

                {/* Call Us */}
                <div className="contact-channel-card">
                  <div className="channel-icon-box channel-icon-blue">
                    <FaPhone />
                  </div>
                  <div className="channel-body">
                    <div className="channel-title">
                      {settings.phone_title || "Call Us"}
                    </div>
                    <div className="channel-text">
                      <div>
                        <span className="channel-meta-label">Phone:&nbsp;</span>
                        <a href={`tel:${settings.phone_primary}`} className="channel-link blue" style={{ whiteSpace: "nowrap" }}>
                          {settings.phone_primary}
                        </a>
                      </div>
                      <div>
                        <span className="channel-meta-label">Mobile/WA:&nbsp;</span>
                        <a href={`tel:${settings.phone_secondary}`} className="channel-link blue" style={{ whiteSpace: "nowrap" }}>
                          {settings.phone_secondary}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Us */}
                <div className="contact-channel-card">
                  <div className="channel-icon-box channel-icon-green">
                    <FaEnvelope />
                  </div>
                  <div className="channel-body">
                    <div className="channel-title">
                      {settings.email_title || "Email Us"}
                    </div>
                    <div className="channel-text">
                      <div>
                        <span className="channel-meta-label">General:&nbsp;</span>
                        <a href={`mailto:${settings.email_primary}`} className="channel-link green">
                          {settings.email_primary}
                        </a>
                      </div>
                      <div>
                        <span className="channel-meta-label">Directorate:&nbsp;</span>
                        <a href={`mailto:${settings.email_secondary}`} className="channel-link green">
                          {settings.email_secondary}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="contact-channel-card">
                  <div className="channel-icon-box channel-icon-amber">
                    <FaClock />
                  </div>
                  <div className="channel-body">
                    <div className="channel-title">
                      {settings.working_hours_title || "Working Hours"}
                    </div>
                    <div className="channel-text">
                      <div>{settings.working_hours_weekdays}</div>
                      <div style={{ color: "#b45309", fontSize: "0.76rem" }}>{settings.working_hours_sunday}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* REGIONAL DESKS ACCORDION / LIST */}
              {branchList && branchList.length > 0 && (
                <div className="contact-branches-box" style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <FaBuilding style={{ color: "#003190", fontSize: "0.95rem" }} />
                    <span style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--color-dark)" }}>
                      Regional Field Desks & Legal Clinics
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {branchList.map((branch, idx) => (
                      <div key={idx} className="contact-branch-item" style={{ background: "#fff", padding: "9px 12px", borderRadius: 8, border: "1px solid #edf2f7", fontSize: "0.80rem" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.82rem" }}>{branch.name}</div>
                        <div style={{ color: "#64748b", marginTop: 2, fontSize: "0.76rem" }}>{branch.location}</div>
                        {branch.phone && (
                          <div style={{ color: "#003190", fontWeight: 600, marginTop: 3, fontSize: "0.76rem" }}>
                            Direct Contact: <a href={`tel:${branch.phone}`} style={{ color: "#003190", textDecoration: "none", fontWeight: 600 }}>{branch.phone}</a> ({branch.contact_person || "Field Lead"})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT COLUMN: INTERACTIVE FORM WITH ADMIN-CONTROLLED DROPDOWNS */}
            <motion.div
              className="contact-form"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ background: "white", padding: "clamp(24px, 4vw, 40px)", borderRadius: 20, boxShadow: "var(--shadow-md)", border: "1px solid #edf2f7", height: "fit-content" }}
            >
              {submitted ? (
                <div className="form-success" style={{ textAlign: "center", padding: "40px 16px" }}>
                  <FaCheckCircle style={{ fontSize: "3.6rem", color: "#10B981", marginBottom: 18 }} />
                  <h3 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: 12 }}>
                    Message Received Successfully!
                  </h3>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, marginBottom: 24, fontSize: "0.95rem" }}>
                    Thank you, <strong>{form.name}</strong>. Your inquiry has been forwarded to our Vijayawada team and logged in our grievance & communications register. We will respond within 24–48 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        subject: subjectList[0] || "General Inquiry",
                        office: "Vijayawada Headquarters",
                        message: ""
                      });
                    }}
                    className="btn-primary"
                    style={{ border: "none", cursor: "pointer", padding: "12px 32px", borderRadius: 30, fontWeight: 700 }}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#D2190C", textTransform: "uppercase", letterSpacing: 1 }}>
                      Online Inquiries Desk
                    </span>
                    <h3 className="form-title">
                      {settings.form_title || "Send Us a Message"}
                    </h3>
                    <p className="form-subtitle">
                      {settings.form_subtitle || "Fill out the form below and we will get back to you promptly."}
                    </p>
                  </div>

                  {/* Row 1: Name & Email */}
                  <div className="contact-form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Your Full Name *
                      </label>
                      <input
                        className="form-input"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Rama Rao / Dr. Sharma"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Email Address *
                      </label>
                      <input
                        className="form-input"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="e.g. name@example.com"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone & Subject Dropdown */}
                  <div className="contact-form-row" style={{ marginTop: 14 }}>
                    <div className="form-group">
                      <label className="form-label">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        className="form-input"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91-XXXXXXXXXX"
                      />
                    </div>

                    {/* ADMIN-CONTROLLED SUBJECT DROPDOWN */}
                    <div className="form-group" style={{ position: "relative" }} ref={subjectDropdownRef}>
                      <label className="form-label" id="contact-subject-label">
                        Enquiry Purpose *
                      </label>
                      <button
                        type="button"
                        className="contact-select-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={subjectDropdownOpen}
                        aria-labelledby="contact-subject-label"
                        onClick={() => {
                          setSubjectDropdownOpen((prev) => !prev);
                          setOfficeDropdownOpen(false);
                        }}
                      >
                        <div className="contact-select-val">
                          <span className="contact-select-label">{selectedSubject}</span>
                        </div>
                        <FaChevronDown
                          className={`contact-select-arrow ${subjectDropdownOpen ? "open" : ""}`}
                          size={12}
                        />
                      </button>
                      {subjectDropdownOpen && (
                        <div className="contact-select-menu" role="listbox">
                          {subjectList.map((opt, i) => {
                            const isSelected = form.subject === opt;
                            return (
                              <div
                                key={i}
                                role="option"
                                aria-selected={isSelected}
                                className={`contact-select-option ${isSelected ? "selected" : ""}`}
                                onClick={() => {
                                  setForm((prev) => ({ ...prev, subject: opt }));
                                  setSubjectDropdownOpen(false);
                                }}
                              >
                                <span className="opt-label">{opt}</span>
                                {isSelected && <FaCheck size={12} className="opt-check" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Office Desk Dropdown (Optional Selection) */}
                  <div className="form-group" style={{ marginTop: 14, position: "relative" }} ref={officeDropdownRef}>
                    <label className="form-label" id="contact-office-label">
                      Routing Destination (Office Desk)
                    </label>
                    <button
                      type="button"
                      className="contact-select-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={officeDropdownOpen}
                      aria-labelledby="contact-office-label"
                      onClick={() => {
                        setOfficeDropdownOpen((prev) => !prev);
                        setSubjectDropdownOpen(false);
                      }}
                    >
                      <div className="contact-select-val">
                        <span className="contact-select-label">{selectedOffice.label}</span>
                        {selectedOffice.sub && (
                          <span className="contact-select-sub">{selectedOffice.sub}</span>
                        )}
                      </div>
                      <FaChevronDown
                        className={`contact-select-arrow ${officeDropdownOpen ? "open" : ""}`}
                        size={12}
                      />
                    </button>
                    {officeDropdownOpen && (
                      <div className="contact-select-menu" role="listbox">
                        {officeOptions.map((opt, idx) => {
                          const isSelected = form.office === opt.value;
                          return (
                            <div
                              key={idx}
                              role="option"
                              aria-selected={isSelected}
                              className={`contact-select-option ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, office: opt.value }));
                                setOfficeDropdownOpen(false);
                              }}
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="opt-label">{opt.label}</div>
                                {opt.sub && <div className="opt-desc">{opt.sub}</div>}
                              </div>
                              {isSelected && <FaCheck size={12} className="opt-check" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Textarea */}
                  <div className="form-group" style={{ marginTop: 14, marginBottom: 18 }}>
                    <label className="form-label">
                      Detailed Message / Representation *
                    </label>
                    <textarea
                      className="form-textarea"
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please provide details of your inquiry, village / mandal information, or partnership proposal..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Transmitting..." : (
                      <>
                        <FaPaperPlane size={13} style={{ flexShrink: 0 }} />
                        <span>Send Message</span>
                        <span className="contact-submit-extra">&nbsp;& Register Lead</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* DYNAMIC GOOGLE MAP EMBED (ADMIN-CONTROLLED) */}
      {Boolean(settings.map_enabled) && settings.map_iframe_url && (
        <section style={{ position: "relative", width: "100%", height: settings.map_height || "420px", background: "#f1f5f9" }}>
          <iframe
            title={settings.map_title || "ALERT NGO Location"}
            src={settings.map_iframe_url}
            width="100%"
            height="100%"
            style={{ border: 0, display: "block" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Location Badge */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              maxWidth: "calc(100% - 32px)",
              background: "rgba(10, 16, 30, 0.88)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.82rem",
              fontWeight: 600,
              zIndex: 10,
              boxSizing: "border-box",
              flexWrap: "wrap"
            }}
          >
            <FaMapMarkerAlt style={{ color: "#ef4444" }} />
            <span>{settings.map_title || "Headquarters: Benz Circle, Vijayawada"}</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("ALERT NGO Vijayawada Benz Circle")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#38bdf8",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginLeft: 6,
                fontSize: "0.8rem",
                textDecoration: "none"
              }}
            >
              Directions <FaExternalLinkAlt size={10} />
            </a>
          </div>
        </section>
      )}
    </>
  );
}
