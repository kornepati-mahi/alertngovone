import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaBookOpen,
  FaFilePdf,
  FaChevronDown,
  FaCheck
} from "react-icons/fa";
import { getGrievancePage, submitCommunityGrievance } from "../api/client";

const defaultGrievanceCategories = [
  {
    value: "R&R Package Entitlement",
    label: "R&R Package Entitlement",
    desc: "₹10 Lakh or House allotment"
  },
  {
    value: "Adult Youth Package",
    label: "Adult Youth (18+ Yrs) Package",
    desc: "Non-inclusion in entitlement roll"
  },
  {
    value: "Land Valuation / Award Issue",
    label: "Land Valuation / Low Compensation",
    desc: "Discrepancy in land award"
  },
  {
    value: "House / Structure Valuation",
    label: "House Structure Valuation",
    desc: "Structure measurement discrepancy"
  },
  {
    value: "Resettlement Colony Infrastructure",
    label: "R&R Colony Amenities",
    desc: "Water, power, access roads"
  },
  {
    value: "RoFR Forest Land Patta Issue",
    label: "RoFR Forest Land Patta",
    desc: "Title rejection or pending claim"
  }
];

const defaultFullForms = [
  { abbr: "PDF", full: "Project Displaced Family", desc: "A family whose home or physical dwelling is acquired and displaced." },
  { abbr: "PAF", full: "Project Affected Family", desc: "A family whose livelihood or agricultural land is impacted by the project." },
  { abbr: "SDC", full: "Special Deputy Collector", desc: "The designated Land Acquisition & Resettlement Officer at sub-division level." },
  { abbr: "SLAO", full: "Special Land Acquisition Officer", desc: "Revenue officer presiding over award enquiries and compensation disbursement." },
  { abbr: "FRL", full: "Full Reservoir Level", desc: "Maximum water storage height (+45.72 Meters in Polavaram Dam)." },
  { abbr: "RoFR", full: "Recognition of Forest Rights", desc: "Statutory rights under the Scheduled Tribes Forest Rights Act 2006." },
];

export default function Grievances() {
  const [pageData, setPageData] = useState(null);
  const [categories, setCategories] = useState(defaultGrievanceCategories);

  const [form, setForm] = useState({
    name: "",
    aadhaar: "",
    phone: "",
    village: "",
    mandal: "",
    district: "Alluri Sitharama Raju",
    grievanceType: "R&R Package Entitlement",
    description: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [grievanceId, setGrievanceId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const applyGrievanceData = (p) => {
    if (!p) return;
    setPageData(p);
    try {
      const parsedCats = typeof p.categories_json === "string" ? JSON.parse(p.categories_json) : p.categories_json;
      if (Array.isArray(parsedCats) && parsedCats.length > 0) {
        setCategories(parsedCats);
        setForm((prev) => {
          if (!parsedCats.some((c) => c.value === prev.grievanceType)) {
            return { ...prev, grievanceType: parsedCats[0].value };
          }
          return prev;
        });
      }
    } catch (_) { }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let active = true;
    getGrievancePage().then((res) => {
      if (active && res && res.page) {
        applyGrievanceData(res.page);
      }
    }).catch(() => { });

    const handleRealtimeUpdate = (e) => {
      if (active && e?.detail) {
        applyGrievanceData(e.detail);
      }
    };
    window.addEventListener("alertngo_grievance_page_updated", handleRealtimeUpdate);

    return () => {
      active = false;
      window.removeEventListener("alertngo_grievance_page_updated", handleRealtimeUpdate);
    };
  }, []);

  const additionalCharts = (() => {
    const p = pageData;
    if (p?.charts_json) {
      try {
        const parsed = typeof p.charts_json === "string" ? JSON.parse(p.charts_json) : p.charts_json;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter((c) => c && c.image);
      } catch (_) { }
    }
    return [];
  })();

  const fullForms = (() => {
    if (pageData?.full_forms_json) {
      try {
        const parsed = typeof pageData.full_forms_json === "string" ? JSON.parse(pageData.full_forms_json) : pageData.full_forms_json;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) { }
    }
    return defaultFullForms;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trackingCode = "ALT-GRV-" + Math.floor(100000 + Math.random() * 900000);
    try {
      const res = await submitCommunityGrievance({
        ...form,
        tracking_code: trackingCode
      });
      setGrievanceId(res?.tracking_code || trackingCode);
      setSubmitted(true);
    } catch (err) {
      // Local fallback
      setGrievanceId(trackingCode);
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .grievances-section {
          padding-top: 140px;
          scroll-margin-top: 96px;
        }
        .custom-select-trigger {
          width: 100%;
          min-height: 50px;
          padding: 8px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          text-align: left;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .custom-select-trigger:focus,
        .custom-select-trigger[aria-expanded="true"] {
          outline: none;
          border-color: var(--color-primary, #D2190C);
          box-shadow: 0 0 0 3px rgba(210, 25, 12, 0.12);
        }
        .custom-select-val {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }
        .custom-select-label {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--color-dark, #0f172a);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .custom-select-desc {
          font-size: 0.76rem;
          color: #64748b;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .custom-select-arrow {
          color: #64748b;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .custom-select-arrow.open {
          transform: rotate(180deg);
          color: var(--color-primary, #D2190C);
        }
        .custom-select-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.14);
          z-index: 100;
          overflow-y: auto;
          max-height: 280px;
          padding: 6px;
        }
        .custom-select-option {
          padding: 10px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          transition: background 0.15s ease;
          box-sizing: border-box;
        }
        .custom-select-option:hover {
          background: #f8fafc;
        }
        .custom-select-option.selected {
          background: #fef2f2;
        }
        .custom-select-option .option-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-dark, #0f172a);
          line-height: 1.35;
        }
        .custom-select-option.selected .option-label {
          color: var(--color-primary, #D2190C);
          font-weight: 700;
        }
        .custom-select-option .option-desc {
          font-size: 0.76rem;
          color: #64748b;
          margin-top: 2px;
          line-height: 1.3;
        }
        .custom-select-option.selected .option-desc {
          color: #991b1b;
        }
        .option-check {
          color: var(--color-primary, #D2190C);
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .grievances-section {
            padding-top: 138px !important;
          }
          .grievances-main-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>

      <section className="section-pad grievances-section hero" style={{ minHeight: "80vh" }}>
        <div className="container" style={{ overflow: "hidden" }}>
          <div className="grievances-main-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 32, alignItems: "start", marginBottom: 48 }}>
            {/* GRIEVANCE FORM */}
            <motion.div
              className="contact-form"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ background: "white", padding: "clamp(18px, 4vw, 36px)", borderRadius: 16, boxShadow: "var(--shadow-md)" }}
            >
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <FaCheckCircle style={{ fontSize: "3.5rem", color: "#10B981", marginBottom: 16 }} />
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 8 }}>
                    {pageData?.success_title || "Grievance Registered Successfully"}
                  </h3>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 10, margin: "20px 0", border: "1px dashed #cbd5e1" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)" }}>Tracking Reference Number</p>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-primary)" }}>{grievanceId}</div>
                  </div>
                  <p style={{ color: "var(--color-text-light)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 24 }}>
                    {pageData?.success_desc || "Our legal and field caseworkers in Vijayawada will inspect the revenue records and follow up with the concerned Special Deputy Collector (SDC)."}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary"
                    style={{ border: "none", cursor: "pointer", borderRadius: 30 }}
                  >
                    Submit Another Grievance
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 6 }}>
                    {pageData?.form_title || "Lodge a Land or R&R Grievance"}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", marginBottom: 24 }}>
                    {pageData?.form_subtitle || "Provide accurate details as per your household ration card / patta documents."}
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name of Claimant *</label>
                      <input
                        className="form-input"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Name as per Aadhaar"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Mobile *</label>
                      <input
                        className="form-input"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91-XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Village / Habitation *</label>
                      <input
                        className="form-input"
                        required
                        value={form.village}
                        onChange={(e) => setForm({ ...form, village: e.target.value })}
                        placeholder="Village name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mandal *</label>
                      <input
                        className="form-input"
                        required
                        value={form.mandal}
                        onChange={(e) => setForm({ ...form, mandal: e.target.value })}
                        placeholder="Mandal name"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ position: "relative" }} ref={dropdownRef}>
                    <label className="form-label" id="grievance-category-label">Grievance Category *</label>
                    <button
                      type="button"
                      className="custom-select-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={dropdownOpen}
                      aria-labelledby="grievance-category-label"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                    >
                      <div className="custom-select-val">
                        <span className="custom-select-label">
                          {categories.find(c => c.value === form.grievanceType)?.label || form.grievanceType}
                        </span>
                        <span className="custom-select-desc">
                          {categories.find(c => c.value === form.grievanceType)?.desc}
                        </span>
                      </div>
                      <FaChevronDown
                        size={12}
                        className={`custom-select-arrow ${dropdownOpen ? "open" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="custom-select-menu" role="listbox" aria-labelledby="grievance-category-label">
                        {categories.map((cat) => {
                          const isSelected = form.grievanceType === cat.value;
                          return (
                            <div
                              key={cat.value}
                              role="option"
                              aria-selected={isSelected}
                              className={`custom-select-option ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setForm({ ...form, grievanceType: cat.value });
                                setDropdownOpen(false);
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="option-label">{cat.label}</div>
                                {cat.desc && <div className="option-desc">{cat.desc}</div>}
                              </div>
                              {isSelected && <FaCheck size={12} className="option-check" aria-hidden="true" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Details of the Grievance *</label>
                    <textarea
                      className="form-textarea"
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Explain the issue clearly (mention survey number, passbook number, or order number if available)..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="form-submit"
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      padding: "14px",
                      background: "var(--color-primary)",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {loading ? "Registering..." : (
                      <>
                        <FaPaperPlane /> Submit Grievance
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* ACRONYMS & FAQ DOWNLOAD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div style={{ background: "white", padding: "clamp(18px, 4vw, 30px)", borderRadius: 16, boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#003190" }}>
                    <FaBookOpen size={20} />
                    <h3 style={{ fontSize: "1.2rem", color: "var(--color-dark)", fontWeight: 700 }}>
                      R&R Terminology & Acronyms
                    </h3>
                  </div>
                  {pageData?.faq_pdf_url && (
                    <a
                      href={pageData.faq_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <FaFilePdf /> {pageData?.faq_pdf_label || "FAQ PDF"}
                    </a>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  {fullForms.map((item, idx) => (
                    <div key={idx} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                      <span style={{ fontWeight: 800, color: "var(--color-primary)", marginRight: 8 }}>{item.abbr}:</span>
                      <strong style={{ color: "var(--color-dark)", fontSize: "0.88rem" }}>{item.full}</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)", marginTop: 2 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOWNLOAD GRIEVANCES FULL FORMS CHART 1 */}
              {(pageData?.chart1_image || pageData?.chart1_image === undefined) && (
                <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "var(--shadow-sm)" }}>
                  <h4 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                    {pageData?.chart1_title || "Official Grievance Categories Chart"}
                  </h4>
                  <img
                    src={pageData?.chart1_image || "/uploads/grievance-types.png"}
                    alt={pageData?.chart1_title || "Grievance Types Chart"}
                    style={{ width: "100%", borderRadius: 8 }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* AUTHENTIC SCRAPED CHARTS SECTION (CHARTS 2 & 3) */}
          {((pageData?.chart2_image || pageData?.chart2_image === undefined) || (pageData?.chart3_image || pageData?.chart3_image === undefined)) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
              {(pageData?.chart2_image || pageData?.chart2_image === undefined) && (
                <div style={{ background: "white", padding: 28, borderRadius: 16, boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                    {pageData?.chart2_title || "ALERT R&R Grievances Abstract"}
                  </h3>
                  <img
                    src={pageData?.chart2_image || "/uploads/GRIEVANCE-ALL.png"}
                    alt={pageData?.chart2_title || "ALERT Grievances Abstract"}
                    style={{ width: "100%", borderRadius: 8 }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}

              {(pageData?.chart3_image || pageData?.chart3_image === undefined) && (
                <div style={{ background: "white", padding: 28, borderRadius: 16, boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                    {pageData?.chart3_title || "Land Rights Grievances Classification"}
                  </h3>
                  <img
                    src={pageData?.chart3_image || "/uploads/LAND-RIGHTS.png"}
                    alt={pageData?.chart3_title || "Land Rights Grievances"}
                    style={{ width: "100%", borderRadius: 8 }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </div>
          )}

          {/* ADDITIONAL CHARTS (admin-managed) */}
          {additionalCharts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, marginTop: 32 }}>
              {additionalCharts.map((ch, i) => (
                <div key={i} style={{ background: "white", padding: 28, borderRadius: 16, boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12 }}>
                    {ch.title || `Chart ${i + 4}`}
                  </h3>
                  <img
                    src={ch.image}
                    alt={ch.title || `Chart ${i + 4}`}
                    style={{ width: "100%", borderRadius: 8 }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
