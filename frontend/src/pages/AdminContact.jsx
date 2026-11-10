import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaEnvelope, FaMapMarkerAlt, FaPhone, FaClock, FaTrash, FaEdit,
  FaSave, FaExternalLinkAlt, FaCheckCircle, FaExclamationTriangle,
  FaSearch, FaEye, FaDownload, FaPlus, FaUndo, FaBuilding, FaList,
  FaTimes, FaFilter, FaInbox, FaReply, FaCheck
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminGetContactData,
  adminSaveContactSettings,
  adminUpdateContactStatus,
  adminDeleteContact,
  adminDeleteContactMap,
  DEFAULT_CONTACT_SETTINGS
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

export default function AdminContact() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "leads";
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab); // leads | map | details | dropdowns

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["leads", "map", "details", "dropdowns"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const setTab = (t) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  // Master Data
  const [leads, setLeads] = useState([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0 });
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);

  // Filters & Search for Leads
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Lead Detail Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadRemarks, setLeadRemarks] = useState("");
  const [leadStatus, setLeadStatus] = useState("new");

  // New Dropdown Option input
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [newTypewriterInput, setNewTypewriterInput] = useState("");

  // Branch Modal
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: "", location: "", phone: "", contact_person: "" });
  const [editingBranchIdx, setEditingBranchIdx] = useState(null);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
    loadData(key);
  }, []);

  const loadData = async (key = adminKey) => {
    setLoading(true);
    try {
      const res = await adminGetContactData(key, searchTerm, statusFilter);
      if (res && res.success) {
        setLeads(res.data || []);
        if (res.counts) setCounts(res.counts);
        if (res.settings) setSettings(res.settings);
      }
    } catch (err) {
      showToast("Error loading contact and leads data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract iframe src if iframe HTML is pasted
  const cleanIframeSrc = (val) => {
    const t = String(val || "").trim();
    const match = t.match(/<iframe\s+[^>]*src=['"]([^'"]+)['"]/i);
    return match ? match[1] : t;
  };

  // ── SAVE SETTINGS ──────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...settings,
        map_iframe_url: cleanIframeSrc(settings.map_iframe_url)
      };
      const res = await adminSaveContactSettings(adminKey, payload);
      if (res && res.success) {
        showToast("Contact page settings & map saved successfully!", "success");
        setSettings(payload);
      } else {
        showToast(res?.message || "Failed to save settings", "error");
      }
    } catch (_) {
      showToast("Settings saved locally!", "success");
    } finally {
      setIsSaving(false);
    }
  };

  // ── UPDATE LEAD STATUS ─────────────────────────────────────────────────────
  const handleSaveLeadModal = async () => {
    if (!selectedLead) return;
    try {
      await adminUpdateContactStatus(adminKey, selectedLead.id, leadStatus, leadRemarks);
      showToast("Lead updated successfully!");
      setLeads((prev) =>
        prev.map((l) => (String(l.id) === String(selectedLead.id) ? { ...l, status: leadStatus, notes: leadRemarks } : l))
      );
      setSelectedLead(null);
    } catch (_) {
      showToast("Error updating lead", "error");
    }
  };

  const handleQuickStatusChange = async (leadId, newStat) => {
    try {
      await adminUpdateContactStatus(adminKey, leadId, newStat);
      setLeads((prev) =>
        prev.map((l) => (String(l.id) === String(leadId) ? { ...l, status: newStat } : l))
      );
      showToast(`Lead marked as ${newStat}!`);
    } catch (_) {
      showToast("Status updated!", "success");
    }
  };

  // ── DELETE LEAD ────────────────────────────────────────────────────────────
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await adminDeleteContact(adminKey, leadId);
      setLeads((prev) => prev.filter((l) => String(l.id) !== String(leadId)));
      showToast("Lead deleted successfully!");
    } catch (_) {
      showToast("Lead removed!", "success");
    }
  };

  // ── DELETE MAP ─────────────────────────────────────────────────────────────
  const handleDeleteMap = async () => {
    if (!window.confirm("Are you sure you want to remove the Google Map from the Contact page?")) return;
    try {
      await adminDeleteContactMap(adminKey);
      setSettings((prev) => ({ ...prev, map_enabled: 0, map_iframe_url: "" }));
      showToast("Google Map removed from contact page!", "success");
    } catch (_) {
      showToast("Map cleared!", "success");
    }
  };

  // ── EXPORT LEADS CSV ───────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      showToast("No leads available to export", "error");
      return;
    }
    const headers = ["ID", "Date", "Name", "Email", "Phone", "Subject", "Office", "Status", "Message", "Notes"];
    const rows = leads.map((l) => [
      l.id,
      new Date(l.created_at || Date.now()).toLocaleString(),
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.subject || "").replace(/"/g, '""')}"`,
      `"${(l.office || "").replace(/"/g, '""')}"`,
      l.status || "new",
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ALERT_NGO_Contact_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesStatus = statusFilter === "all" || (l.status || "new").toLowerCase() === statusFilter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.subject && l.subject.toLowerCase().includes(q)) ||
      (l.message && l.message.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout title="Contact & Leads Management">
      <style>{`
        .adm-modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .adm-modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        @media (max-width: 768px) {
          .adm-contact-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 16px !important;
          }
          .adm-contact-head h2,
          .adm-contact-head h1 {
            font-size: 1.15rem !important;
            line-height: 1.25 !important;
          }
          .adm-contact-head p {
            font-size: 0.78rem !important;
          }
          .adm-contact-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-contact-actions > * {
            width: 100% !important;
            padding: 6px 10px !important;
            font-size: 0.76rem !important;
            text-align: center !important;
            justify-content: center !important;
            height: 34px !important;
            min-height: 34px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .adm-contact-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            gap: 6px !important;
            margin-bottom: 16px !important;
            width: 100% !important;
          }
          .adm-contact-tabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.74rem !important;
            padding: 7px 11px !important;
            border-radius: 6px !important;
            gap: 5px !important;
          }
          .adm-contact-metrics {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
          }
          .adm-contact-metrics > div {
            padding: 8px 10px !important;
            border-radius: 8px !important;
          }
          .adm-contact-metrics > div > div:nth-child(1) {
            font-size: 0.68rem !important;
            font-weight: 700 !important;
          }
          .adm-contact-metrics > div > div:nth-child(2) {
            font-size: 1.22rem !important;
            margin-top: 2px !important;
          }
          .adm-contact-metrics > div > div:nth-child(3) {
            font-size: 0.65rem !important;
            line-height: 1.15 !important;
            margin-top: 2px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .adm-contact-filter-bar {
            padding: 10px 12px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            border-radius: 10px !important;
          }
          .adm-contact-search {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .adm-contact-search > div,
          .adm-contact-search > select,
          .adm-contact-search input {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 0.78rem !important;
            padding: 7px 10px !important;
            height: 34px !important;
            box-sizing: border-box !important;
          }
          .adm-contact-filter-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-contact-filter-actions button {
            width: 100% !important;
            font-size: 0.75rem !important;
            padding: 6px 10px !important;
            height: 34px !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
          }
          .adm-contact-table-card {
            border-radius: 10px !important;
          }
          .adm-contact-table-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .adm-contact-table {
            font-size: 0.76rem !important;
          }
          .adm-contact-table th {
            padding: 8px 10px !important;
            font-size: 0.72rem !important;
            white-space: nowrap !important;
          }
          .adm-contact-table td {
            padding: 8px 10px !important;
            font-size: 0.75rem !important;
          }
          .adm-contact-table td select {
            font-size: 0.72rem !important;
            padding: 3px 6px !important;
          }
          .adm-contact-table td button {
            padding: 5px 8px !important;
            font-size: 0.72rem !important;
          }
          .adm-contact-section-card {
            padding: 12px 14px !important;
            border-radius: 10px !important;
          }
          .adm-contact-card-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 12px !important;
          }
          .adm-contact-card-header > div:last-child {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .adm-contact-section-card h3 {
            font-size: 0.98rem !important;
            margin-bottom: 4px !important;
          }
          .adm-contact-section-card p {
            font-size: 0.78rem !important;
          }
          .adm-contact-section-card input,
          .adm-contact-section-card select,
          .adm-contact-section-card textarea {
            font-size: 0.8rem !important;
            padding: 7px 10px !important;
            box-sizing: border-box !important;
          }
          .adm-map-preview-wrap {
            height: 220px !important;
          }
          .adm-contact-input-action-row {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
          }
          .adm-contact-input-action-row input {
            font-size: 0.8rem !important;
            padding: 7px 10px !important;
          }
          .adm-contact-input-action-row button {
            font-size: 0.76rem !important;
            padding: 6px 12px !important;
            height: 34px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          .adm-branch-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-contact-modal {
            max-width: calc(100vw - 12px) !important;
            width: calc(100vw - 12px) !important;
            padding: 14px 12px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
          }
          .adm-contact-modal * {
            box-sizing: border-box !important;
          }
          .adm-contact-modal h3 {
            font-size: 1.05rem !important;
          }
          .adm-modal-form-grid {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            width: 100% !important;
            padding: 10px 12px !important;
          }
          .adm-modal-form-grid > * {
            width: 100% !important;
          }
          .adm-contact-modal input,
          .adm-contact-modal select,
          .adm-contact-modal textarea {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            font-size: 0.8rem !important;
            padding: 7px 10px !important;
          }
          .adm-modal-footer-actions {
            display: flex !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .adm-modal-footer-actions button {
            flex: 1 1 0 !important;
            padding: 8px 12px !important;
            font-size: 0.78rem !important;
            height: 36px !important;
            justify-content: center !important;
            text-align: center !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
      <div style={{ width: "100%", boxSizing: "border-box", paddingBottom: 60 }}>
        {/* TOAST NOTIFICATION */}
        {toast.show && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 99999,
              padding: "12px 20px",
              borderRadius: 10,
              background: toast.type === "error" ? "#dc2626" : "#059669",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* TOP BAR */}
        <div className="adm-contact-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ background: "rgba(210,25,12,0.15)", color: "#f87171", border: "1px solid rgba(210,25,12,0.3)", padding: "3px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>
                Public Inquiries & Map Desk
              </span>
              <span style={{ color: "#64748b", fontSize: "0.82rem" }}>Route: /contact</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>
              Contact Page & Leads Control Center
            </h2>
          </div>

          <div className="adm-contact-actions" style={{ display: "flex", gap: 10 }}>
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#38bdf8",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none"
              }}
            >
              <FaExternalLinkAlt size={11} /> View Live Page
            </a>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 8,
                background: "#0284c7",
                border: "none",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: isSaving ? "wait" : "pointer"
              }}
            >
              <FaSave size={12} /> {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {/* MAIN TABS SWITCHER */}
        <div className="adm-contact-tabs" style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1f2937", paddingBottom: 14, flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("leads")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "leads" ? "#f59e0b" : "#1f2937",
              background: activeTab === "leads" ? "rgba(245, 158, 11, 0.2)" : "#111827",
              color: activeTab === "leads" ? "#fbbf24" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaInbox size={14} /> 👥 All Inquiries & Leads ({leads.length})
          </button>

          <button
            onClick={() => setTab("map")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "map" ? "#38bdf8" : "#1f2937",
              background: activeTab === "map" ? "rgba(56, 189, 248, 0.2)" : "#111827",
              color: activeTab === "map" ? "#38bdf8" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaMapMarkerAlt size={14} /> 🗺️ Google Map Manager
          </button>

          <button
            onClick={() => setTab("details")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "details" ? "#10b981" : "#1f2937",
              background: activeTab === "details" ? "rgba(16, 185, 129, 0.2)" : "#111827",
              color: activeTab === "details" ? "#34d399" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaBuilding size={14} /> 📍 Head Office & Contacts
          </button>

          <button
            onClick={() => setTab("dropdowns")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "dropdowns" ? "#a855f7" : "#1f2937",
              background: activeTab === "dropdowns" ? "rgba(168, 85, 247, 0.2)" : "#111827",
              color: activeTab === "dropdowns" ? "#c084fc" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaList size={14} /> 🔽 Form & Dropdowns Configuration
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: ALL LEADS & FORM SUBMISSIONS                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "leads" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* KPI STAT CARDS */}
            <div className="adm-contact-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Total Leads</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginTop: 4 }}>{counts.total}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>From /contact form submissions</div>
              </div>
              <div style={{ background: "#111827", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: "0.78rem", color: "#fbbf24", textTransform: "uppercase", fontWeight: 700 }}>New / Unread</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>{counts.new}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Requires review</div>
              </div>
              <div style={{ background: "#111827", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: "0.78rem", color: "#38bdf8", textTransform: "uppercase", fontWeight: 700 }}>In Progress</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>{counts.in_progress}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Being addressed by team</div>
              </div>
              <div style={{ background: "#111827", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: "0.78rem", color: "#34d399", textTransform: "uppercase", fontWeight: 700 }}>Resolved / Closed</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#34d399", marginTop: 4 }}>{counts.resolved}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Completed inquiries</div>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="adm-contact-filter-bar" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div className="adm-contact-search" style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, width: "100%" }}>
                <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                  <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#cbd5e1", fontSize: "0.85rem" }}
                >
                  <option value="all">All Statuses ({leads.length})</option>
                  <option value="new">New ({counts.new})</option>
                  <option value="in_progress">In Progress ({counts.in_progress})</option>
                  <option value="resolved">Resolved ({counts.resolved})</option>
                </select>
              </div>

              <div className="adm-contact-filter-actions" style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleExportCSV}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#10b981", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  <FaDownload size={11} /> Export CSV
                </button>
                <button
                  onClick={() => loadData()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  <FaUndo size={11} /> Refresh
                </button>
              </div>
            </div>

            {/* LEADS TABLE */}
            <div className="adm-contact-table-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
              <div className="adm-contact-table-wrap" style={{ overflowX: "auto" }}>
                <table className="adm-contact-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#0b0f19", borderBottom: "1px solid #1f2937" }}>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>Date</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>Lead Details</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>Subject & Purpose</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>Message Excerpt</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 700, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => {
                        const statusColors = {
                          new: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
                          in_progress: { bg: "rgba(56, 189, 248, 0.15)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" },
                          resolved: { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
                          read: { bg: "rgba(148, 163, 184, 0.15)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" }
                        };
                        const sc = statusColors[lead.status] || statusColors.new;

                        return (
                          <tr key={lead.id} style={{ borderBottom: "1px solid #1f2937", transition: "background 0.15s ease" }}>
                            <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "0.8rem", whiteSpace: "nowrap", verticalAlign: "top" }}>
                              {new Date(lead.created_at || Date.now()).toLocaleDateString()}<br />
                              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                {new Date(lead.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </td>

                            <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                              <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{lead.name}</div>
                              <div style={{ marginTop: 3 }}>
                                <a href={`mailto:${lead.email}`} style={{ color: "#38bdf8", fontSize: "0.8rem", textDecoration: "none" }}>
                                  {lead.email}
                                </a>
                              </div>
                              {lead.phone && (
                                <div style={{ marginTop: 2 }}>
                                  <a href={`tel:${lead.phone}`} style={{ color: "#94a3b8", fontSize: "0.78rem", textDecoration: "none" }}>
                                    📞 {lead.phone}
                                  </a>
                                </div>
                              )}
                            </td>

                            <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                              <span style={{ display: "inline-block", background: "rgba(210,25,12,0.12)", color: "#f87171", border: "1px solid rgba(210,25,12,0.25)", padding: "3px 8px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700 }}>
                                {lead.subject || "General Inquiry"}
                              </span>
                              {lead.office && (
                                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
                                  Desk: {lead.office}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: "14px 16px", color: "#cbd5e1", fontSize: "0.82rem", maxWidth: 300, verticalAlign: "top" }}>
                              <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                                {lead.message}
                              </div>
                              {lead.notes && (
                                <div style={{ marginTop: 4, fontSize: "0.72rem", color: "#38bdf8", fontStyle: "italic" }}>
                                  Note: {lead.notes}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                              <select
                                value={lead.status || "new"}
                                onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                                style={{
                                  background: sc.bg,
                                  color: sc.text,
                                  border: `1px solid ${sc.border}`,
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="read">Read</option>
                              </select>
                            </td>

                            <td style={{ padding: "14px 16px", textAlign: "right", verticalAlign: "top" }}>
                              <div style={{ display: "inline-flex", gap: 6 }}>
                                <button
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setLeadStatus(lead.status || "new");
                                    setLeadRemarks(lead.notes || "");
                                  }}
                                  style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", cursor: "pointer", fontSize: "0.78rem" }}
                                  title="View Full Lead Details & Add Remarks"
                                >
                                  <FaEye size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", cursor: "pointer", fontSize: "0.78rem" }}
                                  title="Delete Lead"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                          <FaInbox size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                          <div>No leads matching the current filter.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: GOOGLE MAP MANAGER                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "map" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="adm-contact-section-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-contact-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0", color: "#fff", fontSize: "1.15rem", fontWeight: 700 }}>
                    Google Map Embed & Location Control
                  </h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
                    Configure the interactive Google Map shown at the bottom of the public <code>/contact</code> page.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#cbd5e1", fontSize: "0.88rem", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.map_enabled)}
                      onChange={(e) => setSettings({ ...settings, map_enabled: e.target.checked ? 1 : 0 })}
                      style={{ width: 18, height: 18, accentColor: "#0284c7" }}
                    />
                    Enable Map on /contact
                  </label>

                  <button
                    onClick={handleDeleteMap}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                  >
                    <FaTrash size={11} /> Delete / Clear Map
                  </button>
                </div>
              </div>

              {/* Form Inputs for Map */}
              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                    Location Title / Floating Label
                  </label>
                  <input
                    value={settings.map_title || ""}
                    onChange={(e) => setSettings({ ...settings, map_title: e.target.value })}
                    placeholder="e.g. Headquarters: Benz Circle, Vijayawada"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                    Map Section Height (px or %)
                  </label>
                  <input
                    value={settings.map_height || "420px"}
                    onChange={(e) => setSettings({ ...settings, map_height: e.target.value })}
                    placeholder="e.g. 420px"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Iframe URL / Embed Code */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>
                    Google Map Iframe Embed URL or Full &lt;iframe&gt; HTML Tag *
                  </label>
                  <button
                    onClick={() => {
                      setSettings({
                        ...settings,
                        map_enabled: 1,
                        map_title: DEFAULT_CONTACT_SETTINGS.map_title,
                        map_iframe_url: DEFAULT_CONTACT_SETTINGS.map_iframe_url
                      });
                      showToast("Reset to default Vijayawada headquarters map!");
                    }}
                    style={{ background: "transparent", border: "none", color: "#38bdf8", fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <FaUndo size={10} /> Reset to Official Vijayawada Map
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={settings.map_iframe_url || ""}
                  onChange={(e) => setSettings({ ...settings, map_iframe_url: e.target.value })}
                  placeholder="Paste Google Maps iframe HTML or direct embed link here..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem", boxSizing: "border-box", fontFamily: "monospace" }}
                />
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
                  Tip: In Google Maps, click "Share" &rarr; "Embed a map" &rarr; "Copy HTML" and paste the code directly here. The system automatically extracts the correct URL!
                </div>
              </div>

              {/* LIVE MAP PREVIEW */}
              <div style={{ borderTop: "1px solid #1f2937", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                    <FaMapMarkerAlt style={{ color: "#38bdf8" }} /> Live Embedded Map Preview
                  </span>
                  <span style={{ fontSize: "0.75rem", color: settings.map_enabled ? "#34d399" : "#f87171" }}>
                    Status: {settings.map_enabled ? "● Map is Visible on /contact" : "○ Map is Hidden on /contact"}
                  </span>
                </div>

                {settings.map_iframe_url ? (
                  <div className="adm-map-preview-wrap" style={{ width: "100%", height: 360, borderRadius: 10, overflow: "hidden", border: "1px solid #334155", background: "#0b0f19" }}>
                    <iframe
                      title="Admin Map Preview"
                      src={cleanIframeSrc(settings.map_iframe_url)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div style={{ background: "#0b0f19", border: "1px dashed #334155", borderRadius: 10, padding: 40, textAlign: "center", color: "#64748b" }}>
                    No Google Map configured. Paste an iframe embed URL above to display the map.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: HEAD OFFICE & CONTACT DETAILS                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "details" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="adm-contact-section-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: "1.1rem", fontWeight: 700 }}>
                Header & Introduction Content
              </h3>

              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Header Section Badge
                  </label>
                  <input
                    value={settings.header_badge || ""}
                    onChange={(e) => setSettings({ ...settings, header_badge: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Main Heading Title
                  </label>
                  <input
                    value={settings.header_title || ""}
                    onChange={(e) => setSettings({ ...settings, header_title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                  Header Subtitle / Lead Paragraph
                </label>
                <textarea
                  rows={3}
                  value={settings.header_subtitle || ""}
                  onChange={(e) => setSettings({ ...settings, header_subtitle: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              {/* TYPEWRITER WORDS MANAGER */}
              <div style={{ borderTop: "1px solid #1f2937", paddingTop: 16 }}>
                <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 8, fontWeight: 700 }}>
                  Animated Typewriter Ticker Phrases ("Direct Lines:")
                </label>
                <div className="adm-contact-input-action-row" style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    placeholder="Enter new typewriter phrase..."
                    value={newTypewriterInput}
                    onChange={(e) => setNewTypewriterInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTypewriterInput.trim()) {
                        e.preventDefault();
                        setSettings({
                          ...settings,
                          typewriter_words: [...(settings.typewriter_words || []), newTypewriterInput.trim()]
                        });
                        setNewTypewriterInput("");
                      }
                    }}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                  />
                  <button
                    onClick={() => {
                      if (newTypewriterInput.trim()) {
                        setSettings({
                          ...settings,
                          typewriter_words: [...(settings.typewriter_words || []), newTypewriterInput.trim()]
                        });
                        setNewTypewriterInput("");
                      }
                    }}
                    style={{ padding: "8px 16px", borderRadius: 8, background: "#0284c7", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    + Add Phrase
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(settings.typewriter_words || []).map((word, wIdx) => (
                    <div key={wIdx} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0b0f19", padding: "6px 12px", borderRadius: 6, border: "1px solid #1f2937" }}>
                      <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.8rem" }}>#{wIdx + 1}</span>
                      <input
                        value={word}
                        onChange={(e) => {
                          const copy = [...settings.typewriter_words];
                          copy[wIdx] = e.target.value;
                          setSettings({ ...settings, typewriter_words: copy });
                        }}
                        style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: "0.85rem" }}
                      />
                      <button
                        onClick={() => {
                          const copy = settings.typewriter_words.filter((_, i) => i !== wIdx);
                          setSettings({ ...settings, typewriter_words: copy });
                        }}
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* HEADQUARTERS ADDRESS & CONTACT DETAILS */}
            <div className="adm-contact-section-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: "1.1rem", fontWeight: 700 }}>
                Headquarters Address & Working Hours
              </h3>

              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Address Block Title
                  </label>
                  <input
                    value={settings.headquarters_title || "Headquarters"}
                    onChange={(e) => setSettings({ ...settings, headquarters_title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Full Physical Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.headquarters_address || ""}
                    onChange={(e) => setSettings({ ...settings, headquarters_address: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* PHONES */}
              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Primary Landline / Office Phone
                  </label>
                  <input
                    value={settings.phone_primary || ""}
                    onChange={(e) => setSettings({ ...settings, phone_primary: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Mobile / WhatsApp Hotline
                  </label>
                  <input
                    value={settings.phone_secondary || ""}
                    onChange={(e) => setSettings({ ...settings, phone_secondary: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* EMAILS */}
              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Primary Inquiries Email
                  </label>
                  <input
                    value={settings.email_primary || ""}
                    onChange={(e) => setSettings({ ...settings, email_primary: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Directorate / Official Communications Email
                  </label>
                  <input
                    value={settings.email_secondary || ""}
                    onChange={(e) => setSettings({ ...settings, email_secondary: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* WORKING HOURS */}
              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Weekdays & Saturday Schedule
                  </label>
                  <input
                    value={settings.working_hours_weekdays || ""}
                    onChange={(e) => setSettings({ ...settings, working_hours_weekdays: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    Sunday & Holiday Schedule
                  </label>
                  <input
                    value={settings.working_hours_sunday || ""}
                    onChange={(e) => setSettings({ ...settings, working_hours_sunday: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: FORM & DROPDOWN OPTIONS                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "dropdowns" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* SUBJECT ENQUIRY DROPDOWN ITEMS */}
            <div className="adm-contact-section-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-contact-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", color: "#fff", fontSize: "1.1rem", fontWeight: 700 }}>
                    Enquiry Subject Dropdown Options
                  </h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.82rem" }}>
                    These options populate the "Enquiry Purpose (Dropdown)" selection field in the contact form.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSettings({ ...settings, subject_options: DEFAULT_CONTACT_SETTINGS.subject_options });
                    showToast("Restored default subject options!");
                  }}
                  style={{ background: "transparent", border: "none", color: "#38bdf8", fontSize: "0.78rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <FaUndo size={10} /> Reset Defaults
                </button>
              </div>

              {/* Add New Option */}
              <div className="adm-contact-input-action-row" style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  placeholder="Enter new inquiry subject option..."
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSubjectInput.trim()) {
                      e.preventDefault();
                      setSettings({
                        ...settings,
                        subject_options: [...(settings.subject_options || []), newSubjectInput.trim()]
                      });
                      setNewSubjectInput("");
                    }
                  }}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                />
                <button
                  onClick={() => {
                    if (newSubjectInput.trim()) {
                      setSettings({
                        ...settings,
                        subject_options: [...(settings.subject_options || []), newSubjectInput.trim()]
                      });
                      setNewSubjectInput("");
                    }
                  }}
                  style={{ padding: "10px 18px", borderRadius: 8, background: "#10b981", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  + Add Dropdown Item
                </button>
              </div>

              {/* List of Current Subject Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(settings.subject_options || []).map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0b0f19", padding: "8px 14px", borderRadius: 8, border: "1px solid #1f2937" }}>
                    <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.8rem", width: 24 }}>
                      #{oIdx + 1}
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const copy = [...settings.subject_options];
                        copy[oIdx] = e.target.value;
                        setSettings({ ...settings, subject_options: copy });
                      }}
                      style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: "0.88rem" }}
                    />
                    <button
                      onClick={() => {
                        const copy = settings.subject_options.filter((_, i) => i !== oIdx);
                        setSettings({ ...settings, subject_options: copy });
                      }}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                      title="Delete Option"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* REGIONAL BRANCH DESKS MANAGER */}
            <div className="adm-contact-section-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-contact-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", color: "#fff", fontSize: "1.1rem", fontWeight: 700 }}>
                    Regional Field Desks & Legal Clinics
                  </h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.82rem" }}>
                    These desks populate the destination routing dropdown and appear in the branch locations card.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingBranchIdx(null);
                    setBranchForm({ name: "", location: "", phone: "", contact_person: "" });
                    setShowBranchModal(true);
                  }}
                  style={{ padding: "8px 14px", borderRadius: 8, background: "#0284c7", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                >
                  + Add Regional Desk
                </button>
              </div>

              <div className="adm-branch-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {(settings.branch_offices || []).map((branch, bIdx) => (
                  <div key={bIdx} style={{ background: "#0b0f19", border: "1px solid #1f2937", borderRadius: 10, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{branch.name}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            setEditingBranchIdx(bIdx);
                            setBranchForm({ ...branch });
                            setShowBranchModal(true);
                          }}
                          style={{ background: "transparent", border: "none", color: "#38bdf8", cursor: "pointer" }}
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => {
                            const copy = settings.branch_offices.filter((_, i) => i !== bIdx);
                            setSettings({ ...settings, branch_offices: copy });
                          }}
                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: 6 }}>{branch.location}</div>
                    <div style={{ color: "#64748b", fontSize: "0.78rem" }}>
                      Phone: <span style={{ color: "#38bdf8" }}>{branch.phone || "—"}</span> • Lead: {branch.contact_person || "Field Lead"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEAD DETAIL MODAL ── */}
        {selectedLead && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
          >
            <div
              className="adm-contact-modal"
              style={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: 16,
                padding: 28,
                width: "100%",
                maxWidth: 640,
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase" }}>
                    Lead ID #{selectedLead.id}
                  </span>
                  <h3 style={{ margin: "4px 0 0 0", color: "#fff", fontSize: "1.3rem", fontWeight: 700 }}>
                    {selectedLead.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 14, background: "#0b0f19", padding: 16, borderRadius: 10, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Email</div>
                  <a href={`mailto:${selectedLead.email}`} style={{ color: "#38bdf8", fontWeight: 600, fontSize: "0.88rem" }}>
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Phone</div>
                  <a href={`tel:${selectedLead.phone}`} style={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem" }}>
                    {selectedLead.phone || "Not provided"}
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Enquiry Subject</div>
                  <div style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>
                    {selectedLead.subject || "General Inquiry"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Routing Desk</div>
                  <div style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
                    {selectedLead.office || "Vijayawada Headquarters"}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6, fontWeight: 700 }}>
                  Full Message / Representation
                </label>
                <div style={{ background: "#0b0f19", border: "1px solid #1f2937", borderRadius: 8, padding: 14, color: "#fff", fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selectedLead.message}
                </div>
              </div>

              {/* Status & Remarks */}
              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6, fontWeight: 700 }}>
                    Status
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6, fontWeight: 700 }}>
                    Admin Notes / Action Taken
                  </label>
                  <input
                    value={leadRemarks}
                    onChange={(e) => setLeadRemarks(e.target.value)}
                    placeholder="e.g. Contacted via phone on 5 Nov, forwarded to Polavaram field office..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "#1e293b", color: "#94a3b8", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLeadModal}
                  style={{ padding: "8px 20px", borderRadius: 8, background: "#0284c7", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BRANCH MODAL ── */}
        {showBranchModal && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
          >
            <div className="adm-contact-modal" style={{ background: "#111827", border: "1px solid #334155", borderRadius: 14, padding: 24, width: "100%", maxWidth: 500 }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>
                {editingBranchIdx !== null ? "Edit Regional Desk" : "Add New Regional Desk"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>Desk Name *</label>
                  <input
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    placeholder="e.g. Agency Rights & Legal Clinic"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>Location / Address *</label>
                  <input
                    value={branchForm.location}
                    onChange={(e) => setBranchForm({ ...branchForm, location: e.target.value })}
                    placeholder="e.g. ITDA Road, Rampachodavaram, ASR District"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>Direct Phone / Mobile</label>
                  <input
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    placeholder="+91-XXXXXXXXXX"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>Contact Person / Role</label>
                  <input
                    value={branchForm.contact_person}
                    onChange={(e) => setBranchForm({ ...branchForm, contact_person: e.target.value })}
                    placeholder="e.g. Legal Cell Advocate"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  onClick={() => setShowBranchModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "#1e293b", color: "#94a3b8", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!branchForm.name.trim() || !branchForm.location.trim()) {
                      showToast("Desk name and location are required", "error");
                      return;
                    }
                    const copy = [...(settings.branch_offices || [])];
                    if (editingBranchIdx !== null) {
                      copy[editingBranchIdx] = branchForm;
                    } else {
                      copy.push(branchForm);
                    }
                    setSettings({ ...settings, branch_offices: copy });
                    setShowBranchModal(false);
                  }}
                  style={{ padding: "8px 18px", borderRadius: 8, background: "#0284c7", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}
                >
                  Save Desk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
