import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaHandHoldingHeart, FaQrcode, FaEdit, FaTrash, FaCheck,
  FaTimes, FaSearch, FaEye, FaDownload, FaPlus, FaSave,
  FaReceipt, FaShieldAlt, FaHeart, FaExclamationTriangle,
  FaCheckCircle, FaUpload, FaCopy, FaUniversity, FaFileAlt
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminGetDonationsData,
  adminSaveDonateSettings,
  adminUpdateDonationStatus,
  adminDeleteDonation,
  adminUploadImage,
  DEFAULT_DONATE_SETTINGS
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

export default function AdminDonate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "donations";
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab); // donations | payment_qr | content | bank

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["donations", "payment_qr", "content", "bank"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const setTab = (t) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  // Master State
  const [donations, setDonations] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, verified: 0, rejected: 0, total_amount: 0 });
  const [settings, setSettings] = useState(DEFAULT_DONATE_SETTINGS);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Donation Detail Modal
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updateStatusVal, setUpdateStatusVal] = useState("pending");

  // Screenshot Lightbox Modal
  const [lightboxImg, setLightboxImg] = useState(null);

  // Impact Tier Form Modal
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTierIdx, setEditingTierIdx] = useState(null);
  const [tierForm, setTierForm] = useState({ amount: 1000, title: "", impact: "" });

  // QR Code upload state
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrFilePreview, setQrFilePreview] = useState(null);

  // Bank detail row form modal
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBankIdx, setEditingBankIdx] = useState(null);
  const [bankRowForm, setBankRowForm] = useState({ label: "", value: "" });

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
      const res = await adminGetDonationsData(key, searchTerm, statusFilter);
      if (res && res.success) {
        setDonations(res.data || []);
        if (res.counts) setCounts(res.counts);
        if (res.settings) setSettings(res.settings);
      }
    } catch (_) {
      showToast("Error loading donations data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Status Updater
  const handleUpdateStatus = async (id, status, notes = "") => {
    try {
      const res = await adminUpdateDonationStatus(adminKey, id, status, notes);
      if (res && res.success) {
        showToast(`Donation #${id} marked as ${status}`);
        setDonations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, payment_status: status, admin_notes: notes } : d))
        );
        // refresh counts locally
        setCounts((prev) => {
          const currentItem = donations.find((d) => d.id === id);
          const oldStatus = currentItem?.payment_status || "pending";
          if (oldStatus === status) return prev;
          return {
            ...prev,
            [oldStatus]: Math.max(0, (prev[oldStatus] || 1) - 1),
            [status]: (prev[status] || 0) + 1
          };
        });
      } else {
        showToast(res?.message || "Failed to update donation status", "error");
      }
    } catch (_) {
      showToast("Error updating donation status", "error");
    }
  };

  // Delete Record
  const handleDeleteDonation = async (id) => {
    if (!window.confirm(`Are you sure you want to delete donation #${id}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await adminDeleteDonation(adminKey, id);
      if (res && res.success) {
        showToast(`Donation #${id} deleted`);
        setDonations((prev) => prev.filter((d) => d.id !== id));
      } else {
        showToast("Failed to delete donation", "error");
      }
    } catch (_) {
      showToast("Error deleting donation", "error");
    }
  };

  // Upload QR code
  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    setUploadingQr(true);
    try {
      const res = await adminUploadImage(file);
      if (res && res.success && res.url) {
        setSettings((prev) => ({ ...prev, qr_code_image: res.url }));
        setQrFilePreview(res.url);
        showToast("Payment QR Code uploaded successfully! Don't forget to click Save Settings.");
      } else {
        // Fallback: Data URL preview
        const reader = new FileReader();
        reader.onload = () => {
          setSettings((prev) => ({ ...prev, qr_code_image: reader.result }));
          setQrFilePreview(reader.result);
          showToast("Payment QR Code stored locally! Click Save to apply.");
        };
        reader.readAsDataURL(file);
      }
    } catch (_) {
      showToast("Error uploading QR image", "error");
    } finally {
      setUploadingQr(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (customSettings = settings) => {
    setIsSaving(true);
    try {
      const res = await adminSaveDonateSettings(adminKey, customSettings);
      if (res && res.success) {
        setSettings(customSettings);
        showToast("Donation settings saved successfully!");
      } else {
        showToast(res?.message || "Failed to save settings", "error");
      }
    } catch (_) {
      showToast("Error saving settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Tier modal actions
  const openNewTierModal = () => {
    setEditingTierIdx(null);
    setTierForm({ amount: 1000, title: "", impact: "" });
    setTierModalOpen(true);
  };

  const openEditTierModal = (idx) => {
    const t = settings.impact_tiers?.[idx];
    if (!t) return;
    setEditingTierIdx(idx);
    setTierForm({ amount: t.amount, title: t.title || "", impact: t.impact || "" });
    setTierModalOpen(true);
  };

  const handleSaveTier = () => {
    if (!tierForm.amount || !tierForm.impact) {
      showToast("Please provide tier amount and impact description", "error");
      return;
    }
    const currentTiers = Array.isArray(settings.impact_tiers) ? [...settings.impact_tiers] : [];
    if (editingTierIdx !== null) {
      currentTiers[editingTierIdx] = {
        ...currentTiers[editingTierIdx],
        amount: Number(tierForm.amount),
        title: tierForm.title || `₹${Number(tierForm.amount).toLocaleString()}`,
        impact: tierForm.impact
      };
    } else {
      currentTiers.push({
        id: Date.now(),
        amount: Number(tierForm.amount),
        title: tierForm.title || `₹${Number(tierForm.amount).toLocaleString()}`,
        impact: tierForm.impact
      });
    }
    currentTiers.sort((a, b) => Number(a.amount) - Number(b.amount));
    const updated = { ...settings, impact_tiers: currentTiers };
    setSettings(updated);
    setTierModalOpen(false);
    handleSaveSettings(updated);
  };

  const handleDeleteTier = (idx) => {
    if (!window.confirm("Remove this impact tier from the donate page?")) return;
    const currentTiers = [...(settings.impact_tiers || [])];
    currentTiers.splice(idx, 1);
    const updated = { ...settings, impact_tiers: currentTiers };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  // Bank detail row modal actions
  const openNewBankModal = () => {
    setEditingBankIdx(null);
    setBankRowForm({ label: "", value: "" });
    setBankModalOpen(true);
  };

  const openEditBankModal = (idx) => {
    const b = settings.bank_details?.[idx];
    if (!b) return;
    setEditingBankIdx(idx);
    setBankRowForm({ label: b.label || "", value: b.value || "" });
    setBankModalOpen(true);
  };

  const handleSaveBankRow = () => {
    if (!bankRowForm.label || !bankRowForm.value) {
      showToast("Please provide both Label and Value", "error");
      return;
    }
    const currentRows = Array.isArray(settings.bank_details) ? [...settings.bank_details] : [];
    if (editingBankIdx !== null) {
      currentRows[editingBankIdx] = { label: bankRowForm.label, value: bankRowForm.value };
    } else {
      currentRows.push({ label: bankRowForm.label, value: bankRowForm.value });
    }
    const updated = { ...settings, bank_details: currentRows };
    setSettings(updated);
    setBankModalOpen(false);
    handleSaveSettings(updated);
  };

  const handleDeleteBankRow = (idx) => {
    if (!window.confirm("Remove this bank detail row?")) return;
    const currentRows = [...(settings.bank_details || [])];
    currentRows.splice(idx, 1);
    const updated = { ...settings, bank_details: currentRows };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  // Export to CSV
  const exportToCsv = () => {
    if (!donations || donations.length === 0) {
      showToast("No donation records to export", "error");
      return;
    }
    const headers = ["ID", "Date", "Donor Name", "Email", "Phone", "PAN", "Amount (INR)", "Payment Status", "Transaction ID / UTR", "Screenshot URL", "Message", "Admin Notes"];
    const rows = donations.map((d) => [
      d.id,
      d.created_at || "",
      `"${(d.donor_name || "").replace(/"/g, '""')}"`,
      `"${(d.email || "").replace(/"/g, '""')}"`,
      `"${(d.phone || "").replace(/"/g, '""')}"`,
      `"${(d.pan || "").replace(/"/g, '""')}"`,
      d.amount || 0,
      d.payment_status || "pending",
      `"${(d.transaction_id || "").replace(/"/g, '""')}"`,
      `"${(d.screenshot_url || "").replace(/"/g, '""')}"`,
      `"${(d.message || "").replace(/"/g, '""')}"`,
      `"${(d.admin_notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ALERT_Donations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Donations CSV exported successfully!");
  };

  return (
    <AdminLayout title="Donations & Payment QR Management">
      <style>{`
        .adm-modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .adm-modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        @media (max-width: 768px) {
          .adm-donate-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 14px !important;
          }
          .adm-donate-head h1,
          .adm-donate-head h2,
          .adm-donate-head h3 {
            font-size: 1.15rem !important;
            line-height: 1.25 !important;
          }
          .adm-donate-head p {
            font-size: 0.78rem !important;
          }
          .adm-donate-actions {
            display: flex !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-donate-actions > * {
            flex: 1 1 0 !important;
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
          .adm-donate-metrics {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
          }
          .adm-donate-metrics > div {
            padding: 8px 10px !important;
            border-radius: 8px !important;
          }
          .adm-donate-metrics > div > div:nth-child(1) {
            font-size: 0.68rem !important;
            font-weight: 700 !important;
          }
          .adm-donate-metrics > div > div:nth-child(2) {
            font-size: 1.22rem !important;
            margin-top: 2px !important;
          }
          .adm-donate-metrics > div > div:nth-child(3) {
            font-size: 0.65rem !important;
            line-height: 1.15 !important;
            margin-top: 2px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .adm-donate-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            gap: 6px !important;
            margin-bottom: 16px !important;
            width: 100% !important;
          }
          .adm-donate-tabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.74rem !important;
            padding: 7px 11px !important;
            border-radius: 6px !important;
            gap: 5px !important;
          }
          .adm-donate-tabs button span {
            font-size: 0.65rem !important;
            padding: 1px 5px !important;
          }
          .adm-donate-section-card {
            padding: 12px 14px !important;
            border-radius: 10px !important;
          }
          .adm-donate-card-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 14px !important;
          }
          .adm-donate-card-header h3 {
            font-size: 1.05rem !important;
          }
          .adm-donate-card-header p {
            font-size: 0.78rem !important;
          }
          .adm-donate-card-header button {
            width: 100% !important;
            height: 34px !important;
            font-size: 0.76rem !important;
            padding: 6px 12px !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .adm-donate-card-header > div:last-child {
            display: flex !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-donate-card-header > div:last-child button {
            flex: 1 1 0 !important;
          }
          .adm-donate-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
          }
          .adm-donate-search-form {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            display: flex !important;
            gap: 8px !important;
          }
          .adm-donate-search-form > div {
            flex: 1 !important;
            width: auto !important;
            max-width: 100% !important;
          }
          .adm-donate-search-form input {
            font-size: 0.78rem !important;
            padding: 7px 10px 7px 32px !important;
            height: 34px !important;
            box-sizing: border-box !important;
          }
          .adm-donate-search-form button {
            font-size: 0.76rem !important;
            padding: 6px 12px !important;
            height: 34px !important;
            box-sizing: border-box !important;
          }
          .adm-donate-filter-actions {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-donate-status-pills {
            display: flex !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .adm-donate-status-pills button {
            flex: 1 1 0 !important;
            padding: 5px 6px !important;
            font-size: 0.72rem !important;
            text-align: center !important;
            justify-content: center !important;
          }
          .adm-donate-filter-actions > button {
            width: 100% !important;
            height: 34px !important;
            font-size: 0.75rem !important;
            padding: 6px 10px !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
          }
          .adm-donate-table-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .adm-donate-table {
            font-size: 0.76rem !important;
          }
          .adm-donate-table th {
            padding: 8px 10px !important;
            font-size: 0.72rem !important;
            white-space: nowrap !important;
          }
          .adm-donate-table td {
            padding: 8px 10px !important;
            font-size: 0.75rem !important;
          }
          .adm-donate-table td button {
            padding: 4px 7px !important;
            font-size: 0.72rem !important;
          }
          .adm-donate-qr-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .adm-donate-qr-box {
            width: 180px !important;
            height: 180px !important;
            margin: 0 auto 12px !important;
          }
          .adm-donate-tier-card {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 12px 14px !important;
            border-radius: 8px !important;
            background: #0b0f19 !important;
            border: 1px solid #1f2937 !important;
          }
          .adm-tier-body {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .adm-tier-price {
            font-size: 0.92rem !important;
            font-weight: 800 !important;
            color: #f87171 !important;
            background: rgba(210, 25, 12, 0.15) !important;
            border: 1px solid rgba(210, 25, 12, 0.3) !important;
            padding: 2px 8px !important;
            border-radius: 6px !important;
            min-width: auto !important;
            display: inline-block !important;
            width: fit-content !important;
          }
          .adm-tier-content {
            width: 100% !important;
          }
          .adm-tier-title {
            font-size: 0.88rem !important;
            font-weight: 700 !important;
            color: #f8fafc !important;
            line-height: 1.3 !important;
            word-break: break-word !important;
          }
          .adm-tier-desc {
            font-size: 0.78rem !important;
            color: #94a3b8 !important;
            line-height: 1.35 !important;
            margin-top: 3px !important;
            word-break: break-word !important;
          }
          .adm-tier-actions {
            display: flex !important;
            justify-content: flex-end !important;
            gap: 8px !important;
            width: 100% !important;
            border-top: 1px solid #1f2937 !important;
            padding-top: 8px !important;
          }
          .adm-tier-actions button {
            padding: 5px 12px !important;
            font-size: 0.74rem !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
          .adm-donate-bank-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .adm-donate-section-card label {
            font-size: 0.78rem !important;
            margin-bottom: 4px !important;
          }
          .adm-donate-section-card input,
          .adm-donate-section-card select,
          .adm-donate-section-card textarea {
            font-size: 0.8rem !important;
            padding: 7px 10px !important;
            box-sizing: border-box !important;
          }
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-donate-modal {
            max-width: calc(100vw - 12px) !important;
            width: calc(100vw - 12px) !important;
            padding: 14px 12px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
          }
          .adm-donate-modal * {
            box-sizing: border-box !important;
          }
          .adm-donate-modal h3 {
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
          .adm-donate-modal input,
          .adm-donate-modal select,
          .adm-donate-modal textarea {
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
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            background: toast.type === "error" ? "#ef4444" : "#10b981",
            color: "#fff",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.9rem"
          }}
        >
          {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {toast.message}
        </div>
      )}

      {/* METRIC STATS HEADER (Dark Theme) */}
      <div className="adm-donate-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#111827", padding: "18px 20px", borderRadius: 12, border: "1px solid #1f2937" }}>
          <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Total Collected</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#10b981", marginTop: 4 }}>
            ₹{Number(counts.total_amount || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Approved / verified pledges</div>
        </div>

        <div style={{ background: "#111827", padding: "18px 20px", borderRadius: 12, border: "1px solid #1f2937" }}>
          <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Total Donations</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>{counts.total}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Total donor submissions</div>
        </div>

        <div style={{ background: "#111827", padding: "18px 20px", borderRadius: 12, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
          <div style={{ fontSize: "0.78rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase" }}>Pending Verification</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>{counts.pending}</div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>Awaiting UTR / proof review</div>
        </div>

        <div style={{ background: "#111827", padding: "18px 20px", borderRadius: 12, border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <div style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>Verified for 80G</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#34d399", marginTop: 4 }}>{counts.verified}</div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>Receipts ready for dispatch</div>
        </div>
      </div>

      {/* TOP TABS NAVIGATION (Dark Theme) */}
      <div className="adm-donate-tabs" style={{ display: "flex", gap: 8, borderBottom: "1px solid #1f2937", paddingBottom: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { id: "donations", label: "All Donations & Receipts", icon: FaReceipt, badge: counts.pending > 0 ? counts.pending : null },
          { id: "payment_qr", label: "Payment QR & UPI Settings", icon: FaQrcode },
          { id: "content", label: "Page Content & Impact Tiers", icon: FaHandHoldingHeart },
          { id: "bank", label: "Bank Transfer Details", icon: FaUniversity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: isActive ? "#D2190C" : "#1f2937",
                background: isActive ? "rgba(210, 25, 12, 0.2)" : "#111827",
                color: isActive ? "#f87171" : "#94a3b8",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Icon size={14} />
              {tab.label}
              {tab.badge !== null && tab.badge > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.72rem",
                    padding: "2px 7px",
                    borderRadius: 999,
                    fontWeight: 800
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL DONATIONS (Dark Theme) */}
      {activeTab === "donations" && (
        <div className="adm-donate-section-card" style={{ background: "#111827", padding: 22, borderRadius: 12, border: "1px solid #1f2937" }}>
          {/* Filter Bar */}
          <div className="adm-donate-filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
            <form className="adm-donate-search-form" onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, flex: 1, minWidth: 0, width: "100%" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
                <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search donor name, email, phone, PAN, UTR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 14px 9px 38px",
                    borderRadius: 8,
                    background: "#0b0f19",
                    border: "1px solid #334155",
                    color: "#fff",
                    fontSize: "0.85rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  background: "#D2190C",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Filter
              </button>
            </form>

            <div className="adm-donate-filter-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div className="adm-donate-status-pills" style={{ display: "flex", background: "#0b0f19", border: "1px solid #1f2937", padding: 3, borderRadius: 8 }}>
                {["all", "pending", "verified", "rejected"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      adminGetDonationsData(adminKey, searchTerm, s).then((res) => {
                        if (res && res.data) setDonations(res.data);
                      });
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: statusFilter === s ? "#1f2937" : "transparent",
                      color: statusFilter === s ? "#fff" : "#94a3b8",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      textTransform: "capitalize"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={exportToCsv}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0b0f19",
                  color: "#cbd5e1",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer"
                }}
              >
                <FaDownload size={12} /> Export CSV
              </button>
            </div>
          </div>

          {/* Donations Table */}
          <div className="adm-donate-table-wrap" style={{ overflowX: "auto" }}>
            <table className="adm-donate-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#0b0f19", color: "#94a3b8", borderBottom: "1px solid #1f2937" }}>
                  <th style={{ padding: "12px 14px" }}>ID / Date</th>
                  <th style={{ padding: "12px 14px" }}>Donor Details</th>
                  <th style={{ padding: "12px 14px" }}>Amount</th>
                  <th style={{ padding: "12px 14px" }}>Payment Proof</th>
                  <th style={{ padding: "12px 14px" }}>UTR / Reference</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center", color: "#64748b" }}>
                      <FaReceipt size={32} style={{ opacity: 0.3, marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                      <div style={{ fontWeight: 700, color: "#94a3b8" }}>No donation submissions found</div>
                      <div style={{ fontSize: "0.8rem", marginTop: 4 }}>When supporters donate and upload payment receipts, they will appear here.</div>
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom: "1px solid #1f2937",
                        transition: "background 0.15s ease",
                        color: "#f8fafc"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 700, color: "#f87171", fontFamily: "monospace" }}>#{d.id}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                          {d.created_at ? new Date(d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                        </div>
                      </td>

                      <td style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 700, color: "#f8fafc" }}>{d.donor_name || "Anonymous"}</div>
                        <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{d.email}</div>
                        {d.phone && <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{d.phone}</div>}
                        {d.pan && (
                          <span style={{ display: "inline-block", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontSize: "0.72rem", padding: "1px 6px", borderRadius: 4, marginTop: 4, fontFamily: "monospace", fontWeight: 700 }}>
                            PAN: {d.pan}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "14px" }}>
                        <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#10b981" }}>
                          ₹{Number(d.amount).toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Sec. 80G Eligible</div>
                      </td>

                      <td style={{ padding: "14px" }}>
                        {d.screenshot_url ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <img
                              src={d.screenshot_url}
                              alt="Payment Proof"
                              style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, border: "1px solid #334155", cursor: "pointer", background: "#0b0f19" }}
                              onClick={() => setLightboxImg(d.screenshot_url)}
                              title="Click to view full screenshot"
                            />
                            <button
                              type="button"
                              onClick={() => setLightboxImg(d.screenshot_url)}
                              style={{ border: "none", background: "transparent", color: "#38bdf8", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, padding: 0 }}
                            >
                              View Receipt
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>No receipt uploaded</span>
                        )}
                      </td>

                      <td style={{ padding: "14px" }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.82rem", color: "#cbd5e1" }}>
                          {d.transaction_id || "—"}
                        </div>
                        {d.admin_notes && (
                          <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: 4, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            Note: {d.admin_notes}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            background:
                              d.payment_status === "verified"
                                ? "rgba(16, 185, 129, 0.15)"
                                : d.payment_status === "rejected"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(245, 158, 11, 0.15)",
                            color:
                              d.payment_status === "verified"
                                ? "#34d399"
                                : d.payment_status === "rejected"
                                ? "#f87171"
                                : "#fbbf24",
                            border: `1px solid ${
                              d.payment_status === "verified"
                                ? "rgba(16, 185, 129, 0.3)"
                                : d.payment_status === "rejected"
                                ? "rgba(239, 68, 68, 0.3)"
                                : "rgba(245, 158, 11, 0.3)"
                            }`
                          }}
                        >
                          {d.payment_status === "verified" ? "Verified" : d.payment_status === "rejected" ? "Rejected" : "Pending"}
                        </span>
                      </td>

                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                          <button
                            onClick={() => {
                              setSelectedDonation(d);
                              setAdminNotes(d.admin_notes || "");
                              setUpdateStatusVal(d.payment_status || "pending");
                            }}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #334155",
                              background: "#0b0f19",
                              color: "#cbd5e1",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 600
                            }}
                            title="Review Details & Notes"
                          >
                            <FaEye size={11} style={{ marginRight: 4 }} /> View
                          </button>

                          {d.payment_status !== "verified" && (
                            <button
                              onClick={() => handleUpdateStatus(d.id, "verified", d.admin_notes)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid rgba(16, 185, 129, 0.4)",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#34d399",
                                cursor: "pointer",
                                fontSize: "0.78rem",
                                fontWeight: 700
                              }}
                              title="Mark as Verified (Bank Received)"
                            >
                              <FaCheck size={11} />
                            </button>
                          )}

                          {d.payment_status !== "rejected" && (
                            <button
                              onClick={() => handleUpdateStatus(d.id, "rejected", d.admin_notes)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#f87171",
                                cursor: "pointer",
                                fontSize: "0.78rem",
                                fontWeight: 700
                              }}
                              title="Mark as Rejected"
                            >
                              <FaTimes size={11} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteDonation(d.id)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #374151",
                              background: "#0b0f19",
                              color: "#94a3b8",
                              cursor: "pointer",
                              fontSize: "0.78rem"
                            }}
                            title="Delete Record"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT QR & UPI SETTINGS (Dark Theme) */}
      {activeTab === "payment_qr" && (
        <div className="adm-donate-section-card" style={{ background: "#111827", padding: 24, borderRadius: 12, border: "1px solid #1f2937", maxWidth: 900 }}>
          <div className="adm-donate-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Payment QR Code & UPI Configuration
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 4 }}>
                Donors scan this QR code or use this UPI ID to pay for their donation directly.
              </p>
            </div>
            <div className="adm-donate-actions">
              <button
                onClick={() => handleSaveSettings()}
                disabled={isSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 20px",
                  borderRadius: 8,
                  background: "#D2190C",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer"
                }}
              >
                <FaSave /> {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          <div className="adm-donate-qr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 32, alignItems: "start" }}>
            {/* QR Image Box */}
            <div style={{ textAlign: "center" }}>
              <div
                className="adm-donate-qr-box"
                style={{
                  width: 220,
                  height: 220,
                  background: "#ffffff",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #334155",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img
                  src={qrFilePreview || settings.qr_code_image || "/uploads/alert-donation-qr.png"}
                  alt="Donation QR Code"
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 18px",
                    background: "#1f2937",
                    color: "#f8fafc",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    cursor: uploadingQr ? "wait" : "pointer"
                  }}
                >
                  <FaUpload />
                  {uploadingQr ? "Uploading..." : "Upload New QR Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    disabled={uploadingQr}
                    style={{ display: "none" }}
                  />
                </label>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 8 }}>
                  Supports PNG, JPG, WEBP, SVG (Max 5MB)
                </div>
              </div>

              <div style={{ textAlign: "left", background: "#0b0f19", padding: "10px 14px", borderRadius: 8, border: "1px solid #1f2937" }}>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Current Image URL:</div>
                <div style={{ fontSize: "0.78rem", color: "#38bdf8", wordBreak: "break-all", fontFamily: "monospace", marginTop: 2 }}>
                  {settings.qr_code_image || "/uploads/alert-donation-qr.png"}
                </div>
              </div>
            </div>

            {/* UPI & Payment Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>
                  VPA / UPI ID *
                </label>
                <input
                  type="text"
                  value={settings.upi_id || ""}
                  onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                  placeholder="e.g. alert.ngo@upi or 9440182940@ybl"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: 4 }}>
                  Used for the one-click copy button and mobile deep links into Google Pay / PhonePe.
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Payee / Account Name
                </label>
                <input
                  type="text"
                  value={settings.upi_name || settings.upi_payee_name || ""}
                  onChange={(e) => setSettings({ ...settings, upi_name: e.target.value, upi_payee_name: e.target.value })}
                  placeholder="e.g. Association for Land and Livelihood"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Payment Step Instructions
                </label>
                <textarea
                  rows={4}
                  value={settings.payment_instructions || ""}
                  onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })}
                  placeholder="Instructions displayed next to QR code..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0b0f19", padding: "12px 16px", borderRadius: 8, border: "1px solid #1f2937" }}>
                <input
                  type="checkbox"
                  id="require_screenshot_chk"
                  checked={Boolean(settings.require_screenshot)}
                  onChange={(e) => setSettings({ ...settings, require_screenshot: e.target.checked ? 1 : 0 })}
                  style={{ width: 18, height: 18, accentColor: "#D2190C", cursor: "pointer" }}
                />
                <label htmlFor="require_screenshot_chk" style={{ fontSize: "0.86rem", fontWeight: 600, color: "#f8fafc", cursor: "pointer" }}>
                  Require Payment Screenshot / Receipt upload before submission
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAGE CONTENT & IMPACT TIERS (Dark Theme) */}
      {activeTab === "content" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          {/* Main Titles */}
          <div className="adm-donate-section-card" style={{ background: "#111827", padding: 24, borderRadius: 12, border: "1px solid #1f2937" }}>
            <div className="adm-donate-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", margin: 0 }}>Donate Page Content</h3>
              <button
                onClick={() => handleSaveSettings()}
                disabled={isSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 20px",
                  borderRadius: 8,
                  background: "#D2190C",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer"
                }}
              >
                <FaSave /> {isSaving ? "Saving..." : "Save Content"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>Badge</label>
                <input
                  type="text"
                  value={settings.page_badge || ""}
                  onChange={(e) => setSettings({ ...settings, page_badge: e.target.value })}
                  style={{ width: "100%", padding: "9px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>Main Heading</label>
                <input
                  type="text"
                  value={settings.page_title || ""}
                  onChange={(e) => setSettings({ ...settings, page_title: e.target.value })}
                  style={{ width: "100%", padding: "9px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>Description Paragraph</label>
                <textarea
                  rows={3}
                  value={settings.page_description || settings.intro_text || ""}
                  onChange={(e) => setSettings({ ...settings, page_description: e.target.value, intro_text: e.target.value })}
                  style={{ width: "100%", padding: "9px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>80G Tax Exemption Note</label>
                <input
                  type="text"
                  value={settings.tax_note || settings.tax_exemption_note || ""}
                  onChange={(e) => setSettings({ ...settings, tax_note: e.target.value, tax_exemption_note: e.target.value })}
                  style={{ width: "100%", padding: "9px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Preset Amount Buttons (Comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(settings.preset_amounts) ? settings.preset_amounts.join(", ") : "500, 1000, 2500, 5000, 10000, 25000"}
                  onChange={(e) => {
                    const parsed = e.target.value.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0);
                    setSettings({ ...settings, preset_amounts: parsed });
                  }}
                  style={{ width: "100%", padding: "9px 14px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* Impact Tiers Manager */}
          <div className="adm-donate-section-card" style={{ background: "#111827", padding: 24, borderRadius: 12, border: "1px solid #1f2937" }}>
            <div className="adm-donate-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", margin: 0 }}>Impact Tiers (Cards on Left)</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 4 }}>
                  These tiers show donors what their financial contribution achieves on the ground.
                </p>
              </div>
              <button
                onClick={openNewTierModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#D2190C",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <FaPlus /> Add Impact Tier
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(settings.impact_tiers || []).map((t, idx) => (
                <div
                  key={idx}
                  className="adm-donate-tier-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "12px 16px",
                    background: "#0b0f19",
                    borderRadius: 8,
                    border: "1px solid #1f2937"
                  }}
                >
                  <div className="adm-tier-body" style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flex: 1 }}>
                    <div
                      className="adm-tier-price"
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        color: "#f87171",
                        minWidth: 80,
                        flexShrink: 0
                      }}
                    >
                      ₹{Number(String(t.amount).replace(/[^0-9]/g, "") || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="adm-tier-content" style={{ minWidth: 0, flex: 1 }}>
                      {t.title && <div className="adm-tier-title" style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.9rem" }}>{t.title}</div>}
                      <div className="adm-tier-desc" style={{ color: "#94a3b8", fontSize: "0.84rem", marginTop: 2 }}>{t.impact}</div>
                    </div>
                  </div>

                  <div className="adm-tier-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => openEditTierModal(idx)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "1px solid #334155",
                        background: "#111827",
                        color: "#38bdf8",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTier(idx)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "1px solid rgba(239,68,68,0.4)",
                        background: "rgba(239,68,68,0.1)",
                        color: "#f87171",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BANK TRANSFER DETAILS (Dark Theme) */}
      {activeTab === "bank" && (
        <div className="adm-donate-section-card" style={{ background: "#111827", padding: 24, borderRadius: 12, border: "1px solid #1f2937", maxWidth: 900 }}>
          <div className="adm-donate-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                Direct Bank Transfer Details
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 4 }}>
                Displayed at the bottom of the public Donate page for NEFT, RTGS, IMPS, and Wire Transfers.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={openNewBankModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#1f2937",
                  color: "#cbd5e1",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  border: "1px solid #374151",
                  cursor: "pointer"
                }}
              >
                <FaPlus /> Add Row
              </button>
              <button
                onClick={() => handleSaveSettings()}
                disabled={isSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: "#D2190C",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  cursor: "pointer"
                }}
              >
                <FaSave /> {isSaving ? "Saving..." : "Save Bank Details"}
              </button>
            </div>
          </div>

          <div className="adm-donate-bank-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {(settings.bank_details || []).map((b, idx) => (
              <div
                key={idx}
                className="adm-donate-bank-card"
                style={{
                  background: "#0b0f19",
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: "1px solid #1f2937"
                }}
              >
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                  {b.label}
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f8fafc", marginTop: 4, wordBreak: "break-all" }}>
                  {b.value}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10, borderTop: "1px solid #1f2937", paddingTop: 8 }}>
                  <button
                    onClick={() => openEditBankModal(idx)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "1px solid #334155",
                      background: "#111827",
                      color: "#38bdf8",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBankRow(idx)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "1px solid rgba(239,68,68,0.4)",
                      background: "rgba(239,68,68,0.1)",
                      color: "#f87171",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DONATION DETAIL MODAL (Dark Theme) */}
      {selectedDonation && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={() => setSelectedDonation(null)}
        >
          <div
            className="adm-donate-modal"
            style={{
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: 14,
              maxWidth: 620,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              padding: 24,
              boxSizing: "border-box",
              color: "#f8fafc"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.3rem" }}>🎗️</span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                  Donation #{selectedDonation.id} Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                style={{ border: "none", background: "transparent", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="adm-modal-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#0b0f19", padding: 16, borderRadius: 10, border: "1px solid #1f2937", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase" }}>Donor Name</div>
                <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.95rem" }}>{selectedDonation.donor_name}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase" }}>Amount Donated</div>
                <div style={{ fontWeight: 800, color: "#10b981", fontSize: "1.1rem" }}>₹{Number(selectedDonation.amount).toLocaleString("en-IN")}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase" }}>Email Address</div>
                <a href={`mailto:${selectedDonation.email}`} style={{ color: "#38bdf8", fontWeight: 600, fontSize: "0.85rem" }}>{selectedDonation.email}</a>
              </div>

              <div>
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase" }}>Phone / WhatsApp</div>
                <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: "0.85rem" }}>{selectedDonation.phone || "—"}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase" }}>PAN (80G Receipt)</div>
                <div style={{ color: "#38bdf8", fontWeight: 700, fontFamily: "monospace" }}>{selectedDonation.pan || "Not Provided"}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase" }}>Transaction ID / UTR</div>
                <div style={{ color: "#f8fafc", fontWeight: 700, fontFamily: "monospace" }}>{selectedDonation.transaction_id || "—"}</div>
              </div>
            </div>

            {/* Payment Screenshot Preview */}
            {selectedDonation.screenshot_url && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Uploaded Payment Proof / Receipt:
                </div>
                <div
                  style={{
                    background: "#0b0f19",
                    padding: 10,
                    borderRadius: 10,
                    textAlign: "center",
                    border: "1px solid #1f2937"
                  }}
                >
                  <img
                    src={selectedDonation.screenshot_url}
                    alt="Payment Screenshot"
                    style={{ maxWidth: "100%", maxHeight: 240, objectFit: "contain", borderRadius: 6, cursor: "zoom-in" }}
                    onClick={() => setLightboxImg(selectedDonation.screenshot_url)}
                  />
                  <div style={{ marginTop: 6, fontSize: "0.75rem", color: "#94a3b8" }}>
                    Click image to open full resolution
                  </div>
                </div>
              </div>
            )}

            {selectedDonation.message && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 4 }}>Donor Message:</div>
                <div style={{ background: "#0b0f19", padding: "10px 14px", borderRadius: 8, fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic", border: "1px solid #1f2937" }}>
                  "{selectedDonation.message}"
                </div>
              </div>
            )}

            {/* Admin Notes & Status Form */}
            <div style={{ borderTop: "1px solid #1f2937", paddingTop: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Verification Status
                </label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                >
                  <option value="pending">Pending (Review in progress)</option>
                  <option value="verified">Verified (Payment confirmed, receipt issued)</option>
                  <option value="rejected">Rejected (Invalid receipt / unpaid)</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record UTR validation, receipt number, or bank reconciliation notes..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #374151", background: "#1f2937", color: "#cbd5e1", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleUpdateStatus(selectedDonation.id, updateStatusVal, adminNotes);
                    setSelectedDonation(null);
                  }}
                  style={{ padding: "8px 20px", borderRadius: 8, background: "#D2190C", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Save Status & Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX FOR SCREENSHOT */}
      {lightboxImg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.88)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
          onClick={() => setLightboxImg(null)}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={lightboxImg}
              alt="Full Screenshot"
              style={{ maxWidth: "100%", maxHeight: "88vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}
            />
            <button
              onClick={() => setLightboxImg(null)}
              style={{
                position: "absolute",
                top: -16,
                right: -16,
                background: "#D2190C",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                cursor: "pointer"
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* TIER MODAL (Dark Theme) */}
      {tierModalOpen && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={() => setTierModalOpen(false)}
        >
          <div
            className="adm-donate-modal"
            style={{
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: 14,
              maxWidth: 480,
              width: "100%",
              padding: 22,
              boxSizing: "border-box",
              color: "#f8fafc"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: 16 }}>
              {editingTierIdx !== null ? "Edit Impact Tier" : "Add Impact Tier"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Donation Amount (₹) *
                </label>
                <input
                  type="number"
                  value={tierForm.amount}
                  onChange={(e) => setTierForm({ ...tierForm, amount: e.target.value })}
                  placeholder="e.g. 1000"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Tier Title (Short)
                </label>
                <input
                  type="text"
                  value={tierForm.title}
                  onChange={(e) => setTierForm({ ...tierForm, title: e.target.value })}
                  placeholder="e.g. Solar Energy Access"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Impact Description *
                </label>
                <textarea
                  rows={3}
                  value={tierForm.impact}
                  onChange={(e) => setTierForm({ ...tierForm, impact: e.target.value })}
                  placeholder="e.g. Provides clean solar lantern to a remote village household"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box", resize: "vertical" }}
                />
              </div>

              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setTierModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #374151", background: "#1f2937", color: "#cbd5e1", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTier}
                  style={{ padding: "8px 20px", borderRadius: 8, background: "#D2190C", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Save Tier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANK ROW MODAL (Dark Theme) */}
      {bankModalOpen && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={() => setBankModalOpen(false)}
        >
          <div
            className="adm-donate-modal"
            style={{
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: 14,
              maxWidth: 480,
              width: "100%",
              padding: 22,
              boxSizing: "border-box",
              color: "#f8fafc"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", marginBottom: 16 }}>
              {editingBankIdx !== null ? "Edit Bank Detail Row" : "Add Bank Detail Row"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Label *
                </label>
                <input
                  type="text"
                  value={bankRowForm.label}
                  onChange={(e) => setBankRowForm({ ...bankRowForm, label: e.target.value })}
                  placeholder="e.g. Account Number, IFSC Code, SWIFT"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.84rem", color: "#cbd5e1", marginBottom: 6 }}>
                  Value *
                </label>
                <input
                  type="text"
                  value={bankRowForm.value}
                  onChange={(e) => setBankRowForm({ ...bankRowForm, value: e.target.value })}
                  placeholder="e.g. SBIN0001845 or 39201948572"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #374151", background: "#1f2937", color: "#cbd5e1", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBankRow}
                  style={{ padding: "8px 20px", borderRadius: 8, background: "#D2190C", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Save Row
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
