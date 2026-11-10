import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaThLarge,
  FaList,
  FaBalanceScale,
  FaHandHoldingHeart,
  FaBuilding,
  FaLock,
  FaFolderOpen,
  FaCopy,
  FaCheck,
  FaFileContract
} from "react-icons/fa";
import { DEFAULT_35_POLICIES, DEFAULT_COMPLIANCE_PORTAL } from "../data/defaultPolicies";

export { DEFAULT_35_POLICIES, DEFAULT_COMPLIANCE_PORTAL };

const resolvePolicyIcon = (icon) => {
  if (typeof icon === "object" && icon !== null) return icon;
  switch (icon) {
    case "FaBuilding": return <FaBuilding />;
    case "FaLock": return <FaLock />;
    case "FaHandHoldingHeart": return <FaHandHoldingHeart />;
    case "FaShieldAlt": return <FaShieldAlt />;
    case "FaBalanceScale": return <FaBalanceScale />;
    case "FaFolderOpen": return <FaFolderOpen />;
    default: return <FaFileContract />;
  }
};

export default function PoliciesDirectory({ customPolicies, customPortal }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [internalPolicies, setInternalPolicies] = useState(() => {
    if (Array.isArray(customPolicies) && customPolicies.length > 0) return customPolicies;
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        const aboutPols = parsed?.["about"]?.content?.policies;
        const alertPols = parsed?.["alert-policies"]?.content?.policies;
        if (Array.isArray(aboutPols) && aboutPols.length > 0) return aboutPols;
        if (Array.isArray(alertPols) && alertPols.length > 0) return alertPols;
      }
    } catch { }
    return DEFAULT_35_POLICIES;
  });

  const [internalPortal, setInternalPortal] = useState(() => {
    if (customPortal && typeof customPortal === "object" && customPortal.title) return customPortal;
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        const c = parsed?.["about"]?.content?.portal_title
          ? parsed?.["about"]?.content
          : (parsed?.["alert-policies"]?.content || parsed?.["about"]?.content);
        if (c && (c.portal_title || c.portal_metrics)) {
          return {
            badge: c.portal_badge || DEFAULT_COMPLIANCE_PORTAL.portal_badge,
            cert: c.portal_cert || DEFAULT_COMPLIANCE_PORTAL.portal_cert,
            title: c.portal_title || DEFAULT_COMPLIANCE_PORTAL.portal_title,
            desc: c.portal_desc || DEFAULT_COMPLIANCE_PORTAL.portal_desc,
            status_badge: c.portal_status_badge || DEFAULT_COMPLIANCE_PORTAL.portal_status_badge,
            status_sub: c.portal_status_sub || DEFAULT_COMPLIANCE_PORTAL.portal_status_sub,
            metrics: Array.isArray(c.portal_metrics) && c.portal_metrics.length > 0 ? c.portal_metrics : DEFAULT_COMPLIANCE_PORTAL.portal_metrics,
          };
        }
      }
    } catch { }
    return {
      badge: DEFAULT_COMPLIANCE_PORTAL.portal_badge,
      cert: DEFAULT_COMPLIANCE_PORTAL.portal_cert,
      title: DEFAULT_COMPLIANCE_PORTAL.portal_title,
      desc: DEFAULT_COMPLIANCE_PORTAL.portal_desc,
      status_badge: DEFAULT_COMPLIANCE_PORTAL.portal_status_badge,
      status_sub: DEFAULT_COMPLIANCE_PORTAL.portal_status_sub,
      metrics: DEFAULT_COMPLIANCE_PORTAL.portal_metrics,
    };
  });

  useEffect(() => {
    if (Array.isArray(customPolicies) && customPolicies.length > 0) {
      setInternalPolicies(customPolicies);
    }
  }, [customPolicies]);

  useEffect(() => {
    if (customPortal && typeof customPortal === "object" && customPortal.title) {
      setInternalPortal(customPortal);
    }
  }, [customPortal]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const local = localStorage.getItem("alertngo_about_pages");
        if (local) {
          const parsed = JSON.parse(local);
          const aboutC = parsed?.["about"]?.content;
          const alertC = parsed?.["alert-policies"]?.content;
          const pols = (aboutC && Array.isArray(aboutC.policies) && aboutC.policies.length > 0)
            ? aboutC.policies
            : (alertC && Array.isArray(alertC.policies) && alertC.policies.length > 0 ? alertC.policies : null);
          if (pols) {
            setInternalPolicies(pols);
          }
          const c = (aboutC && aboutC.portal_title) ? aboutC : (alertC || aboutC);
          if (c) {
            setInternalPortal({
              badge: c.portal_badge || DEFAULT_COMPLIANCE_PORTAL.portal_badge,
              cert: c.portal_cert || DEFAULT_COMPLIANCE_PORTAL.portal_cert,
              title: c.portal_title || DEFAULT_COMPLIANCE_PORTAL.portal_title,
              desc: c.portal_desc || DEFAULT_COMPLIANCE_PORTAL.portal_desc,
              status_badge: c.portal_status_badge || DEFAULT_COMPLIANCE_PORTAL.portal_status_badge,
              status_sub: c.portal_status_sub || DEFAULT_COMPLIANCE_PORTAL.portal_status_sub,
              metrics: Array.isArray(c.portal_metrics) && c.portal_metrics.length > 0 ? c.portal_metrics : DEFAULT_COMPLIANCE_PORTAL.portal_metrics,
            });
          }
        }
      } catch { }
    };

    window.addEventListener("alertngo_about_pages_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("alertngo_about_pages_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const categories = [
    "All",
    "Governance & Ethics",
    "Protection & Rights",
    "Financial & Operational",
    "Community & Field"
  ];

  const normalizeCategory = (cat) => {
    if (!cat) return "Governance & Ethics";
    const lower = String(cat).toLowerCase();
    if (lower.includes("financial") || lower.includes("operation") || lower.includes("procure") || lower.includes("cost") || lower.includes("finance")) {
      return "Financial & Operational";
    }
    if (lower.includes("protect") || lower.includes("child") || lower.includes("gender") || lower.includes("posh") || lower.includes("right") || lower.includes("hiv")) {
      return "Protection & Rights";
    }
    if (lower.includes("community") || lower.includes("field") || lower.includes("ecolog") || lower.includes("environ") || lower.includes("health") || lower.includes("safety") || lower.includes("disaster") || lower.includes("fisher")) {
      return "Community & Field";
    }
    return "Governance & Ethics";
  };

  const filtered = internalPolicies.filter((p) => {
    const pCat = p.category || "";
    const matchesCat =
      selectedCategory === "All" ||
      pCat === selectedCategory ||
      normalizeCategory(pCat) === selectedCategory;
    const q = searchTerm.toLowerCase().trim();
    const idStr = String(p.id !== undefined ? p.id : "");
    const matchesSearch =
      !q ||
      (p.title || "").toLowerCase().includes(q) ||
      (p.scope || p.desc || "").toLowerCase().includes(q) ||
      (p.statutoryBasis || "").toLowerCase().includes(q) ||
      (p.badge || "").toLowerCase().includes(q) ||
      pCat.toLowerCase().includes(q) ||
      idStr.toLowerCase().includes(q) ||
      `#${idStr.padStart(2, "0")}`.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleCopyCitation = (policy) => {
    const text = `ALERT Institutional Policy #${policy.id}: ${policy.title} - Statutory Basis: ${policy.statutoryBasis || "ALERT Statutory Compliance"}. Scope: ${policy.scope || policy.desc}`;
    navigator.clipboard.writeText(text);
    setCopiedId(policy.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER CARD */}
      <div style={{ background: "white", padding: "clamp(20px, 4vw, 32px)", borderRadius: 20, boxShadow: "var(--shadow-sm)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="badge" style={{ background: "rgba(255, 137, 0, 0.12)", color: "var(--color-primary)", fontWeight: 700 }}>
                {internalPortal.badge || "Interactive Compliance Portal"}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-light)" }}>
                {internalPortal.cert || "Certified by ALERT Governing Body"}
              </span>
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--color-dark)", margin: 0 }}>
              {internalPortal.title || "The 35 Institutional Governance Policies"}
            </h3>
            <p style={{ color: "var(--color-text-light)", marginTop: 8, fontSize: "0.95rem", maxWidth: 760, lineHeight: 1.6 }}>
              {internalPortal.desc || "ALERT operations are strictly governed by 35 formalized statutory charters ensuring democratic transparency, child protection, financial accountability, and indigenous community rights."}
            </p>
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: "10px 16px", borderRadius: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <FaCheckCircle style={{ color: "#16a34a", fontSize: "1.2rem" }} />
            <div>
              <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#166534" }}>
                {internalPortal.status_badge || "100% Ratified & Audited"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#15803d" }}>
                {internalPortal.status_sub || "Active Statutory Compliance"}
              </div>
            </div>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 24 }}>
          {(internalPortal.metrics || [
            { label: "Active Policies", val: `${internalPolicies.length} / 35`, color: "#10b981" },
            { label: "POSH Compliant", val: "100%", color: "var(--color-primary)" },
            { label: "Audited Charters", val: "Certified", color: "#8b5cf6" },
            { label: "Regulatory Status", val: "12A • 80G • FCRA", color: "#0ea5e9" },
          ]).map((item, idx) => (
            <div key={idx} style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: item.color, marginTop: 2 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        {/* CATEGORY PILLS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
                border: selectedCategory === cat ? "none" : "1px solid #cbd5e1",
                background: selectedCategory === cat ? "var(--color-primary)" : "white",
                color: selectedCategory === cat ? "white" : "var(--color-dark)",
                boxShadow: selectedCategory === cat ? "0 4px 12px rgba(255,137,0,0.3)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CONTROLS RIGHT: SEARCH & VIEW SWITCH */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: 240 }}>
            <input
              type="text"
              placeholder="Search policies (e.g. POSH, Finance)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 36px",
                borderRadius: 20,
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
            <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          </div>

          <div style={{ display: "inline-flex", background: "white", padding: 3, borderRadius: 20, border: "1px solid #cbd5e1" }}>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Card Grid View"
              style={{
                border: "none",
                padding: "6px 12px",
                borderRadius: 16,
                background: viewMode === "grid" ? "var(--color-dark)" : "transparent",
                color: viewMode === "grid" ? "white" : "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.8rem",
                fontWeight: 600
              }}
            >
              <FaThLarge size={12} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              style={{
                border: "none",
                padding: "6px 12px",
                borderRadius: 16,
                background: viewMode === "table" ? "var(--color-dark)" : "transparent",
                color: viewMode === "table" ? "white" : "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.8rem",
                fontWeight: 600
              }}
            >
              <FaList size={12} /> Table
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS COUNT & HINT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#64748b" }}>
        <span>Showing {filtered.length} of {internalPolicies.length} policies certified under ALERT Society Registration</span>
        <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>💡 Click any card for statutory dossier</span>
      </div>

      {/* VIEW: GRID MODE */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {filtered.map((policy) => (
            <motion.div
              key={policy.id}
              whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedPolicy(policy)}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 22,
                boxShadow: "var(--shadow-sm)",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span
                    style={{
                      background: "rgba(255, 137, 0, 0.1)",
                      color: "var(--color-primary)",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      padding: "4px 10px",
                      borderRadius: 12
                    }}
                  >
                    #{String(policy.id).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 8,
                      background: "#f1f5f9",
                      color: "#475569"
                    }}
                  >
                    {policy.category}
                  </span>
                </div>

                <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.18rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 8, lineHeight: 1.35 }}>
                  {policy.title}
                </h4>

                <p style={{ fontSize: "0.87rem", color: "var(--color-text-light)", lineHeight: 1.6, margin: 0 }}>
                  {policy.scope || policy.desc}
                </p>
              </div>

              <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px dashed #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.76rem", color: "#10b981", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <FaCheckCircle size={11} /> {policy.badge || "Statutory"}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--color-primary)", fontWeight: 700 }}>
                  Inspect Dossier →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* VIEW: TABLE MODE */}
      {viewMode === "table" && (
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid #e2e8f0" }}>
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 18px", width: 70, fontWeight: 700, color: "var(--color-dark)" }}>S.No</th>
                  <th style={{ padding: "14px 18px", width: 260, fontWeight: 700, color: "var(--color-dark)" }}>Policy Name</th>
                  <th style={{ padding: "14px 18px", width: 180, fontWeight: 700, color: "var(--color-dark)" }}>Category</th>
                  <th style={{ padding: "14px 18px", fontWeight: 700, color: "var(--color-dark)" }}>Scope & Purpose</th>
                  <th style={{ padding: "14px 18px", width: 140, fontWeight: 700, color: "var(--color-dark)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPolicy(p)}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: idx % 2 === 0 ? "white" : "#fafafa",
                      cursor: "pointer",
                      transition: "background 0.15s ease"
                    }}
                  >
                    <td style={{ padding: "12px 18px", fontWeight: 700, color: "var(--color-primary)" }}>
                      #{String(p.id).padStart(2, "0")}
                    </td>
                    <td style={{ padding: "12px 18px", fontWeight: 700, color: "var(--color-dark)" }}>
                      {p.title}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{ fontSize: "0.76rem", padding: "3px 8px", borderRadius: 8, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px 18px", color: "var(--color-text-light)", lineHeight: 1.5 }}>
                      {p.scope || p.desc}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-primary)",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer"
                        }}
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STATUTORY POLICY DOSSIER INTERACTIVE MODAL */}
      <AnimatePresence>
        {selectedPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPolicy(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              backdropFilter: "blur(6px)"
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 20,
                maxWidth: 620,
                width: "100%",
                padding: "clamp(20px, 4vw, 32px)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: "rgba(255, 137, 0, 0.12)", color: "var(--color-primary)", fontWeight: 800, padding: "4px 10px", borderRadius: 10, fontSize: "0.85rem" }}>
                    Policy #{String(selectedPolicy.id).padStart(2, "0")}
                  </span>
                  <span style={{ background: "#f1f5f9", color: "#475569", fontWeight: 700, padding: "4px 10px", borderRadius: 10, fontSize: "0.78rem" }}>
                    {selectedPolicy.category}
                  </span>
                  {selectedPolicy.badge && (
                    <span style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", fontWeight: 700, padding: "4px 10px", borderRadius: 10, fontSize: "0.78rem" }}>
                      {selectedPolicy.badge}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPolicy(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.3rem" }}
                >
                  ✕
                </button>
              </div>

              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.45rem", color: "var(--color-dark)", marginBottom: 10 }}>
                {selectedPolicy.title}
              </h4>

              {/* STATUTORY LEGAL BASIS */}
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, borderLeft: "4px solid var(--color-primary)", marginBottom: 18 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                  Enacted Statutory Legal Basis
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--color-dark)", marginTop: 2 }}>
                  {selectedPolicy.statutoryBasis || "ALERT Society Registered Charter & Statutory Framework"}
                </div>
              </div>

              {/* COMMITTEE */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                  Enforcing Authority / Committee:
                </div>
                <div style={{ fontSize: "0.88rem", color: "#1e3a8a", fontWeight: 700 }}>
                  {selectedPolicy.committee || "ALERT Governing Body & Institutional Compliance Cell"}
                </div>
              </div>

              {/* SCOPE */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                  Scope & Application:
                </div>
                <p style={{ fontSize: "0.92rem", color: "var(--color-text)", lineHeight: 1.6, margin: 0 }}>
                  {selectedPolicy.scope || selectedPolicy.desc}
                </p>
              </div>

              {/* PRINCIPLES */}
              {(selectedPolicy.principles || selectedPolicy.highlights) && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                    Core Enforceable Principles:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(selectedPolicy.principles || selectedPolicy.highlights).map((pr, pIdx) => (
                      <div key={pIdx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.86rem", color: "#334155" }}>
                        <FaCheckCircle style={{ color: "#10b981", marginTop: 3, flexShrink: 0 }} size={12} />
                        <span>{pr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleCopyCitation(selectedPolicy)}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center", padding: "10px 0", fontSize: "0.88rem" }}
                >
                  {copiedId === selectedPolicy.id ? (
                    <>
                      <FaCheck /> Citation Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy /> Copy Policy Citation
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPolicy(null)}
                  className="btn-secondary"
                  style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
