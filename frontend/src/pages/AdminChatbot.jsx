import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  FaRobot,
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaCheck,
  FaSyncAlt,
  FaTrash,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaServer,
  FaBolt,
  FaInfoCircle
} from "react-icons/fa";
import {
  getChatbotAdminConfig,
  saveChatbotAdminKey,
  testChatbotAdminKey,
  setActiveChatbotAdminKey,
  deleteChatbotAdminKey
} from "../api/client";

const POPULAR_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "LLaMA 3.3 70B Versatile", badge: "Recommended", desc: "Top reasoning, high speed, default for ALERT" },
  { id: "llama-3.1-8b-instant", name: "LLaMA 3.1 8B Instant", badge: "Fastest", desc: "Ultra-low latency, instant responses" },
  { id: "llama3-70b-8192", name: "LLaMA 3 70B (8k)", badge: "Standard", desc: "Standard production 70B model" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (32k context)", badge: "Long Context", desc: "Large context window for extensive documents" },
  { id: "gemma2-9b-it", name: "Google Gemma 2 9B", badge: "Google", desc: "Efficient Google instruction-tuned model" },
  { id: "custom", name: "Custom Model Name...", badge: "Custom", desc: "Manually specify any Groq-supported model" }
];

export default function AdminChatbot() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active key & env state
  const [activeKey, setActiveKey] = useState(null);
  const [keysList, setKeysList] = useState([]);
  const [envInfo, setEnvInfo] = useState({});

  // Form state
  const [formKey, setFormKey] = useState("");
  const [formModel, setFormModel] = useState("llama-3.3-70b-versatile");
  const [customModel, setCustomModel] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getChatbotAdminConfig();
      if (res && res.success && res.data) {
        const d = res.data;
        setActiveKey(d.active || null);
        setKeysList(d.keys || []);
        setEnvInfo(d.env_info || {});

        if (d.active) {
          setFormKey(d.active.api_key || "");
          const m = d.active.model_name || "llama-3.3-70b-versatile";
          const isStandard = POPULAR_MODELS.some(p => p.id === m);
          if (isStandard) {
            setFormModel(m);
            setCustomModel("");
          } else {
            setFormModel("custom");
            setCustomModel(m);
          }
          setFormLabel(d.active.label || "");
        }
      }
    } catch (err) {
      triggerToast("Error loading chatbot settings: " + (err.message || "Failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    triggerToast("API Key copied to clipboard!");
  };

  const handleTestKey = async (keyToTest = null, id = null) => {
    const key = keyToTest || (formModel === "custom" ? customModel : formModel, formKey);
    if (!key) {
      triggerToast("Please provide an API key to test.", "error");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testChatbotAdminKey(null, key, id);
      if (res && res.data) {
        setTestResult(res.data);
        if (res.data.ok) {
          triggerToast(`Connected successfully in ${res.data.latency_ms}ms!`, "success");
        } else {
          triggerToast(`Test failed: ${res.data.error || "Invalid API key"}`, "error");
        }
      }
    } catch (err) {
      setTestResult({ ok: false, error: err.message || "Connection test failed." });
      triggerToast("Test error: " + err.message, "error");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalKey = formKey.trim();
    if (!finalKey) {
      triggerToast("API Key cannot be empty.", "error");
      return;
    }
    const finalModel = formModel === "custom" ? customModel.trim() : formModel;
    if (!finalModel) {
      triggerToast("Please specify a valid model name.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await saveChatbotAdminKey(null, {
        api_key: finalKey,
        model_name: finalModel,
        provider: "groq",
        label: formLabel.trim() || `Production Key (${new Date().toLocaleDateString()})`,
        id: editingId
      });

      if (res && res.success) {
        triggerToast("Chatbot API key and .env updated successfully!", "success");
        setEditingId(null);
        await loadData();
      } else {
        triggerToast(res?.message || "Failed to update API key.", "error");
      }
    } catch (err) {
      triggerToast("Error saving API key: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id) => {
    if (!id) return;
    try {
      const res = await setActiveChatbotAdminKey(null, id);
      if (res && res.success) {
        triggerToast("Active API key switched and synchronized to .env!", "success");
        await loadData();
      } else {
        triggerToast(res?.message || "Failed to activate key.", "error");
      }
    } catch (err) {
      triggerToast("Error activating key: " + err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm("Are you sure you want to delete this API key from the database history?")) return;
    try {
      const res = await deleteChatbotAdminKey(null, id);
      if (res && res.success) {
        triggerToast("Key removed from database.", "success");
        await loadData();
      } else {
        triggerToast(res?.message || "Failed to delete key.", "error");
      }
    } catch (err) {
      triggerToast("Error deleting key: " + err.message, "error");
    }
  };

  const handleEditRow = (row) => {
    setEditingId(row.id);
    setFormKey(row.api_key || "");
    const m = row.model_name || "llama-3.3-70b-versatile";
    const isStandard = POPULAR_MODELS.some(p => p.id === m);
    if (isStandard) {
      setFormModel(m);
      setCustomModel("");
    } else {
      setFormModel("custom");
      setCustomModel(m);
    }
    setFormLabel(row.label || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    if (activeKey) {
      setFormKey(activeKey.api_key || "");
      const m = activeKey.model_name || "llama-3.3-70b-versatile";
      const isStandard = POPULAR_MODELS.some(p => p.id === m);
      if (isStandard) {
        setFormModel(m);
        setCustomModel("");
      } else {
        setFormModel("custom");
        setCustomModel(m);
      }
      setFormLabel(activeKey.label || "");
    }
  };

  const formatMaskedKey = (masked, raw) => {
    if (masked) {
      return masked.replace(/•{6,}/, "••••••••");
    }
    if (raw && raw.length > 12) {
      return raw.substring(0, 8) + "••••••••" + raw.substring(raw.length - 4);
    }
    return raw ? raw.substring(0, 8) + "••••••••" : "—";
  };

  return (
    <AdminLayout title="Chatbot API Key & AI Settings">
      <style>{`
        .adm-chatbot-container {
          width: 100%;
          box-sizing: border-box;
          padding-bottom: 60px;
        }
        .adm-chatbot-desktop-table {
          display: block;
          overflow-x: auto;
          width: 100%;
          max-width: 100%;
          -webkit-overflow-scrolling: touch;
          border-radius: 8px;
        }
        .adm-chatbot-mobile-cards {
          display: none;
        }
        .adm-chatbot-table {
          width: 100%;
          min-width: 600px;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }
        @media (max-width: 768px) {
          .adm-chatbot-container {
            padding-bottom: 30px !important;
          }
          .adm-chatbot-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
          }
          .adm-chatbot-status-card {
            padding: 10px 12px !important;
            border-radius: 9px !important;
          }
          .adm-chatbot-status-card .adm-stat-top {
            margin-bottom: 6px !important;
          }
          .adm-chatbot-status-card .adm-stat-label {
            font-size: 0.68rem !important;
          }
          .adm-chatbot-status-card .adm-stat-val {
            font-size: 0.92rem !important;
          }
          .adm-chatbot-status-card .adm-stat-sub {
            font-size: 0.7rem !important;
            margin-top: 4px !important;
          }
          .adm-chatbot-box {
            padding: 12px 10px !important;
            border-radius: 10px !important;
            margin-bottom: 14px !important;
          }
          .adm-chatbot-head {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            padding-bottom: 10px !important;
            margin-bottom: 12px !important;
            border-bottom: 1px solid #1e2436 !important;
          }
          .adm-chatbot-head h2,
          .adm-chatbot-head h3 {
            font-size: 0.98rem !important;
            line-height: 1.25 !important;
            margin: 0 0 3px !important;
          }
          .adm-chatbot-head p {
            font-size: 0.72rem !important;
            line-height: 1.35 !important;
            margin: 0 !important;
          }
          .adm-chatbot-cancel-btn {
            height: 28px !important;
            min-height: 28px !important;
            padding: 4px 10px !important;
            font-size: 0.72rem !important;
            border-radius: 6px !important;
            white-space: nowrap !important;
          }
          .adm-chatbot-refresh-btn {
            width: auto !important;
            height: 28px !important;
            min-height: 28px !important;
            max-height: 28px !important;
            padding: 3px 10px !important;
            font-size: 0.72rem !important;
            border-radius: 6px !important;
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 5px !important;
          }
          .adm-chatbot-label {
            font-size: 0.76rem !important;
            margin-bottom: 5px !important;
          }
          .adm-chatbot-input,
          .adm-chatbot-select {
            font-size: 0.78rem !important;
            padding: 7px 9px !important;
            border-radius: 6px !important;
            height: 34px !important;
            box-sizing: border-box !important;
          }
          .adm-chatbot-key-input {
            font-size: 0.76rem !important;
            padding: 7px 72px 7px 9px !important;
            height: 34px !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
          }
          .adm-chatbot-key-tools {
            right: 5px !important;
            gap: 3px !important;
          }
          .adm-chatbot-key-tool-btn {
            padding: 3px 6px !important;
            font-size: 0.68rem !important;
            height: 24px !important;
            border-radius: 4px !important;
          }
          .adm-chatbot-help {
            font-size: 0.7rem !important;
            margin-top: 4px !important;
          }
          .adm-chatbot-alert {
            padding: 8px 10px !important;
            font-size: 0.74rem !important;
            gap: 6px !important;
          }
          .adm-chatbot-alert svg {
            width: 14px !important;
            height: 14px !important;
            flex-shrink: 0 !important;
          }
          .adm-chatbot-actions {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: stretch !important;
            gap: 8px !important;
            width: 100% !important;
            margin-top: 8px !important;
          }
          .adm-chatbot-actions .adm-chatbot-btn {
            flex: 1 1 0 !important;
            width: 50% !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            padding: 4px 6px !important;
            font-size: 0.74rem !important;
            font-weight: 700 !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          /* Hide desktop table on mobile, show mobile cards */
          .adm-chatbot-desktop-table {
            display: none !important;
          }
          .adm-chatbot-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-chatbot-card-btn {
            height: 28px !important;
            min-height: 28px !important;
            max-height: 28px !important;
            font-size: 0.72rem !important;
            padding: 2px 6px !important;
            box-sizing: border-box !important;
          }
          .adm-chatbot-info-cards {
            gap: 8px !important;
          }
          .adm-chatbot-info-card {
            padding: 10px 12px !important;
            border-radius: 9px !important;
          }
          .adm-chatbot-info-card h4 {
            font-size: 0.82rem !important;
            margin-bottom: 4px !important;
          }
          .adm-chatbot-info-card p {
            font-size: 0.72rem !important;
            line-height: 1.4 !important;
          }
          .adm-chatbot-toast {
            top: 10px !important;
            left: 8px !important;
            right: 8px !important;
            padding: 7px 10px !important;
            font-size: 0.74rem !important;
            border-radius: 7px !important;
          }
        }
      `}</style>
      <div className="adm-chatbot-container">
        {/* TOAST NOTIFICATION */}
        {toast.show && (
          <div
            className="adm-chatbot-toast"
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

        {/* TOP STATUS CARDS */}
        <div className="adm-chatbot-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 16, marginBottom: 24 }}>
          {/* Status Card */}
          <div className="adm-chatbot-status-card" style={{ background: "#111520", border: "1px solid #1e2436", borderRadius: 14, padding: "20px 22px" }}>
            <div className="adm-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="adm-stat-label" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Chatbot Assistant
              </span>
              <FaRobot size={18} color="#c0392b" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: activeKey?.api_key ? "#10b981" : "#ef4444",
                  boxShadow: activeKey?.api_key ? "0 0 12px #10b981" : "none",
                  flexShrink: 0
                }}
              />
              <span className="adm-stat-val" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
                {activeKey?.api_key ? "Active & Configured" : "Key Missing"}
              </span>
            </div>
            <div className="adm-stat-sub" style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 8 }}>
              Provider: <strong style={{ color: "#38bdf8" }}>Groq Cloud AI (High Speed)</strong>
            </div>
          </div>

          {/* Active Model */}
          <div className="adm-chatbot-status-card" style={{ background: "#111520", border: "1px solid #1e2436", borderRadius: 14, padding: "20px 22px" }}>
            <div className="adm-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="adm-stat-label" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Active LLM Model
              </span>
              <FaBolt size={18} color="#f59e0b" />
            </div>
            <div className="adm-stat-val" style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeKey?.model_name || "llama-3.3-70b-versatile"}
            </div>
            <div className="adm-stat-sub" style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 8 }}>
              Context Fallback: <strong>llama-3.1-8b-instant</strong>
            </div>
          </div>

          {/* .env Sync Status */}
          <div className="adm-chatbot-status-card" style={{ background: "#111520", border: "1px solid #1e2436", borderRadius: 14, padding: "20px 22px" }}>
            <div className="adm-stat-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="adm-stat-label" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                .env Synchronization
              </span>
              <FaServer size={18} color="#10b981" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaCheckCircle color="#10b981" size={16} style={{ flexShrink: 0 }} />
              <span className="adm-stat-val" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10b981" }}>
                Auto-Synced to backend/.env
              </span>
            </div>
            <div className="adm-stat-sub" style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 8 }}>
              Updates `.env` & MySQL table simultaneously
            </div>
          </div>
        </div>

        {/* MAIN CONFIGURATION CARD */}
        <div className="adm-chatbot-box" style={{ background: "#111520", border: "1px solid #1e2436", borderRadius: 16, padding: "28px 30px", marginBottom: 30 }}>
          <div className="adm-chatbot-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e2436", paddingBottom: 18, marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
                <FaKey color="#c0392b" />
                {editingId ? `Update Key #${editingId}` : "Chatbot API Key Manager"}
              </h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#8892a4" }}>
                Update the Groq API key anytime. Changes are saved to the MySQL database and directly written into <code style={{ color: "#38bdf8" }}>backend/.env</code>.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="adm-chatbot-cancel-btn"
                style={{
                  background: "#1e2436",
                  color: "#cbd5e1",
                  border: "1px solid #334155",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel Edit Mode
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
              {/* API Key Input */}
              <div className="adm-chatbot-form-group">
                <label className="adm-chatbot-label" style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
                  Groq API Key *
                </label>
                <div className="adm-chatbot-key-wrapper" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showKey ? "text" : "password"}
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="Enter your Groq API key"
                    required
                    className="adm-chatbot-key-input"
                    style={{
                      width: "100%",
                      padding: "13px 120px 13px 16px",
                      background: "#0d0f14",
                      border: "1.5px solid #2a3148",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: "0.95rem",
                      fontFamily: "monospace",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  <div className="adm-chatbot-key-tools" style={{ position: "absolute", right: 10, display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      title={showKey ? "Hide key" : "Show key"}
                      className="adm-chatbot-key-tool-btn"
                      style={{
                        background: "#1e2436",
                        border: "1px solid #2a3148",
                        color: "#94a3b8",
                        borderRadius: 6,
                        padding: "6px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.75rem"
                      }}
                    >
                      {showKey ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(formKey)}
                      title="Copy Key"
                      className="adm-chatbot-key-tool-btn"
                      style={{
                        background: copied ? "#059669" : "#1e2436",
                        border: "1px solid #2a3148",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "6px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.75rem"
                      }}
                    >
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                <div className="adm-chatbot-help" style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 6 }}>
                  Need a free key? Get one instantly from{" "}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: "#38bdf8", textDecoration: "underline" }}>
                    console.groq.com/keys <FaExternalLinkAlt size={10} />
                  </a>
                </div>
              </div>

              {/* Model Selection */}
              <div className="adm-chatbot-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
                <div className="adm-chatbot-form-group">
                  <label className="adm-chatbot-label" style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
                    Primary LLM Model
                  </label>
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="adm-chatbot-select"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#0d0f14",
                      border: "1.5px solid #2a3148",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  >
                    {POPULAR_MODELS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="adm-chatbot-form-group">
                  <label className="adm-chatbot-label" style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
                    Key Label / Note (optional)
                  </label>
                  <input
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="e.g. Primary Production Key 2026"
                    className="adm-chatbot-input"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#0d0f14",
                      border: "1.5px solid #2a3148",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Custom Model Input if selected */}
              {formModel === "custom" && (
                <div className="adm-chatbot-form-group">
                  <label className="adm-chatbot-label" style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
                    Custom Model Identifier
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. llama-3.3-70b-specdec or custom-endpoint-model"
                    required
                    className="adm-chatbot-input"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "#0d0f14",
                      border: "1.5px solid #2a3148",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              )}

              {/* TEST RESULT ALERT */}
              {testResult && (
                <div
                  className="adm-chatbot-alert"
                  style={{
                    padding: "14px 18px",
                    borderRadius: 10,
                    background: testResult.ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1.5px solid ${testResult.ok ? "#10b981" : "#ef4444"}`,
                    color: testResult.ok ? "#34d399" : "#f87171",
                    fontSize: "0.88rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  {testResult.ok ? <FaCheckCircle size={20} /> : <FaExclamationTriangle size={20} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>
                      {testResult.ok ? "Groq API Key Verified!" : "Key Verification Failed"}
                    </div>
                    <div style={{ fontSize: "0.8rem", marginTop: 2, opacity: 0.9, wordBreak: "break-word" }}>
                      {testResult.message || testResult.error}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="adm-chatbot-actions">
                <button
                  type="button"
                  onClick={() => handleTestKey(formKey)}
                  disabled={testing || !formKey.trim()}
                  className="adm-chatbot-btn adm-chatbot-btn-test"
                  style={{
                    background: "#1e2436",
                    color: "#38bdf8",
                    border: "1.5px solid #0284c7",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: testing || !formKey.trim() ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: testing || !formKey.trim() ? 0.6 : 1,
                    transition: "all 0.2s"
                  }}
                >
                  <FaBolt size={12} />
                  <span>{testing ? "Testing..." : "Test Connection"}</span>
                </button>

                <button
                  type="submit"
                  disabled={saving || !formKey.trim()}
                  className="adm-chatbot-btn adm-chatbot-btn-save"
                  style={{
                    background: "linear-gradient(135deg, #c0392b, #a93226)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 20px",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: saving || !formKey.trim() ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(192,57,43,0.4)",
                    opacity: saving || !formKey.trim() ? 0.6 : 1,
                    transition: "all 0.2s"
                  }}
                >
                  <FaSyncAlt size={12} className={saving ? "spin" : ""} />
                  <span>{saving ? "Saving..." : "Save Key & Sync"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* DATABASE TABLE FOR API KEYS */}
        <div className="adm-chatbot-box" style={{ background: "#111520", border: "1px solid #1e2436", borderRadius: 16, padding: "24px 26px", marginBottom: 24 }}>
          <div className="adm-chatbot-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <h3 style={{ fontSize: "1.12rem", fontWeight: 800, color: "#fff", margin: "0 0 3px" }}>
                Chatbot API Keys Database Table (`chatbot_settings`)
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#8892a4" }}>
                All configured API keys stored in MySQL. The active key is automatically used by the live chatbot and written to <code style={{ color: "#38bdf8" }}>backend/.env</code>.
              </p>
            </div>
            <button
              onClick={loadData}
              className="adm-chatbot-refresh-btn"
              style={{
                background: "#1e2436",
                border: "1px solid #2a3148",
                color: "#cbd5e1",
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: "0.76rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5
              }}
            >
              <FaSyncAlt size={11} /> Refresh Table
            </button>
          </div>

          {/* DESKTOP TABLE (Hidden on mobile) */}
          <div className="adm-chatbot-desktop-table">
            <table className="adm-chatbot-table" style={{ width: "100%", minWidth: 620, borderCollapse: "collapse", fontSize: "0.86rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e2436", color: "#64748b", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px" }}>Label</th>
                  <th style={{ padding: "10px 12px" }}>Masked Key</th>
                  <th style={{ padding: "10px 12px" }}>Model</th>
                  <th style={{ padding: "10px 12px" }}>Last Updated</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keysList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "30px 14px", textAlign: "center", color: "#64748b" }}>
                      No API keys saved yet. Add one using the form above.
                    </td>
                  </tr>
                ) : (
                  keysList.map((row) => {
                    const isActive = Number(row.is_active) === 1;
                    return (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: "1px solid #181d2c",
                          background: isActive ? "rgba(192,57,43,0.06)" : "transparent"
                        }}
                      >
                        {/* Status */}
                        <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                          {isActive ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "rgba(16,185,129,0.15)",
                                color: "#10b981",
                                border: "1px solid rgba(16,185,129,0.3)",
                                padding: "2px 8px",
                                borderRadius: 20,
                                fontSize: "0.74rem",
                                fontWeight: 700
                              }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                              ACTIVE (.env)
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "rgba(148,163,184,0.1)",
                                color: "#94a3b8",
                                padding: "2px 8px",
                                borderRadius: 20,
                                fontSize: "0.74rem",
                                fontWeight: 600
                              }}
                            >
                              Standby
                            </span>
                          )}
                        </td>

                        {/* Label */}
                        <td style={{ padding: "12px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                          {row.label || `Key #${row.id}`}
                        </td>

                        {/* Masked Key */}
                        <td style={{ padding: "12px", fontFamily: "monospace", color: "#38bdf8", whiteSpace: "nowrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <code>{formatMaskedKey(row.masked_key, row.api_key)}</code>
                            <button
                              type="button"
                              onClick={() => handleCopy(row.api_key)}
                              title="Copy raw key"
                              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 2 }}
                            >
                              <FaCopy size={12} />
                            </button>
                          </span>
                        </td>

                        {/* Model */}
                        <td style={{ padding: "12px", color: "#e2e8f0", whiteSpace: "nowrap" }}>
                          <code style={{ background: "#0d0f14", padding: "2px 8px", borderRadius: 4, fontSize: "0.78rem", color: "#f59e0b" }}>
                            {row.model_name || "llama-3.3-70b-versatile"}
                          </code>
                        </td>

                        {/* Updated At */}
                        <td style={{ padding: "12px", color: "#8892a4", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                          {row.updated_at ? new Date(row.updated_at).toLocaleString() : "—"}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleTestKey(row.api_key, row.id)}
                              title="Test this key"
                              style={{
                                background: "#1e2436",
                                border: "1px solid #2a3148",
                                color: "#38bdf8",
                                padding: "5px 9px",
                                borderRadius: 5,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              <FaBolt size={10} /> Test
                            </button>

                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => handleSetActive(row.id)}
                                title="Set as active key and sync to .env"
                                style={{
                                  background: "#059669",
                                  border: "none",
                                  color: "#fff",
                                  padding: "5px 10px",
                                  borderRadius: 5,
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                Activate
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleEditRow(row)}
                              title="Edit key"
                              style={{
                                background: "#1e2436",
                                border: "1px solid #2a3148",
                                color: "#cbd5e1",
                                padding: "5px 9px",
                                borderRadius: 5,
                                fontSize: "0.75rem",
                                cursor: "pointer"
                              }}
                            >
                              Edit
                            </button>

                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => handleDelete(row.id)}
                                title="Delete key from history"
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  border: "1px solid rgba(239,68,68,0.3)",
                                  color: "#ef4444",
                                  padding: "5px 8px",
                                  borderRadius: 5,
                                  fontSize: "0.75rem",
                                  cursor: "pointer"
                                }}
                              >
                                <FaTrash size={10} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW (Clean responsive cards on mobile screens) */}
          <div className="adm-chatbot-mobile-cards">
            {keysList.length === 0 ? (
              <div style={{ padding: "20px 10px", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                No API keys saved yet. Add one using the form above.
              </div>
            ) : (
              keysList.map((row) => {
                const isActive = Number(row.is_active) === 1;
                return (
                  <div
                    key={row.id}
                    style={{
                      background: isActive ? "rgba(192,57,43,0.08)" : "#0d1017",
                      border: `1px solid ${isActive ? "rgba(192,57,43,0.35)" : "#1e2436"}`,
                      borderRadius: 9,
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8
                    }}
                  >
                    {/* Card Top: Status & Date */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {isActive ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16,185,129,0.3)",
                            padding: "2px 7px",
                            borderRadius: 12,
                            fontSize: "0.68rem",
                            fontWeight: 700
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
                          ACTIVE (.env)
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "rgba(148,163,184,0.1)",
                            color: "#94a3b8",
                            padding: "2px 7px",
                            borderRadius: 12,
                            fontSize: "0.68rem",
                            fontWeight: 600
                          }}
                        >
                          Standby
                        </span>
                      )}
                      <span style={{ fontSize: "0.68rem", color: "#64748b" }}>
                        {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : ""}
                      </span>
                    </div>

                    {/* Card Body: Label, Masked Key & Model */}
                    <div>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.84rem", marginBottom: 4 }}>
                        {row.label || `Key #${row.id}`}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                        <code
                          style={{
                            background: "#0d0f14",
                            border: "1px solid #1e2436",
                            color: "#38bdf8",
                            fontFamily: "monospace",
                            fontSize: "0.72rem",
                            padding: "2px 7px",
                            borderRadius: 4,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {formatMaskedKey(row.masked_key, row.api_key)}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(row.api_key)}
                          title="Copy raw key"
                          style={{
                            background: "#1e2436",
                            border: "1px solid #2a3148",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "2px 6px",
                            borderRadius: 4,
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "0.7rem",
                            height: 22
                          }}
                        >
                          <FaCopy size={10} />
                        </button>
                      </div>
                      <div>
                        <span
                          style={{
                            background: "#161b26",
                            border: "1px solid #1e2436",
                            color: "#f59e0b",
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            display: "inline-block"
                          }}
                        >
                          {row.model_name || "llama-3.3-70b-versatile"}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions: Compact Buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, paddingTop: 6, borderTop: "1px solid #1e2436" }}>
                      <button
                        type="button"
                        onClick={() => handleTestKey(row.api_key, row.id)}
                        className="adm-chatbot-card-btn"
                        style={{
                          flex: 1,
                          background: "#1e2436",
                          border: "1px solid #2a3148",
                          color: "#38bdf8",
                          borderRadius: 5,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4
                        }}
                      >
                        <FaBolt size={9} /> Test
                      </button>

                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleSetActive(row.id)}
                          className="adm-chatbot-card-btn"
                          style={{
                            flex: 1,
                            background: "#059669",
                            border: "none",
                            color: "#fff",
                            borderRadius: 5,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          Activate
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditRow(row)}
                        className="adm-chatbot-card-btn"
                        style={{
                          flex: 1,
                          background: "#1e2436",
                          border: "1px solid #2a3148",
                          color: "#cbd5e1",
                          borderRadius: 5,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        Edit
                      </button>

                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          title="Delete key"
                          className="adm-chatbot-card-btn"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#ef4444",
                            width: 32,
                            borderRadius: 5,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <FaTrash size={9} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECURITY & ARCHITECTURE EXPLANATION */}
        <div className="adm-chatbot-grid adm-chatbot-info-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 18 }}>
          <div className="adm-chatbot-info-card" style={{ background: "#111520", border: "1px solid #1e2436", borderRadius: 14, padding: "20px 22px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <FaShieldAlt color="#10b981" /> Server-Side Key Security
            </h4>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#8892a4", lineHeight: 1.6 }}>
              Your API key is stored strictly on the backend in MySQL (<code style={{ color: "#38bdf8" }}>chatbot_settings</code>) and in <code style={{ color: "#38bdf8" }}>backend/.env</code>. The client-side visitor chatbot talks only to your PHP server (<code style={{ color: "#38bdf8" }}>chat.php</code>); your actual API key is never sent to the browser or public visitors.
            </p>
          </div>

          <div className="adm-chatbot-info-card" style={{ background: "#111520", border: "1px solid #1e2436", borderRadius: 14, padding: "20px 22px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <FaInfoCircle color="#38bdf8" /> Frontend Chatbot UI Untouched
            </h4>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#8892a4", lineHeight: 1.6 }}>
              The frontend chatbot widget remains completely untouched. When you update the API key here, the chatbot instantly begins using the new key without requiring any server restarts or website refreshes.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

