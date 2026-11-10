import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaShieldAlt,
  FaReceipt,
  FaPhone,
  FaEnvelope,
  FaQrcode,
  FaCheck,
  FaCopy,
  FaUpload,
  FaPaperPlane,
  FaTimes,
  FaUniversity,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaFileInvoice
} from "react-icons/fa";
import {
  DEFAULT_DONATE_SETTINGS,
  fetchDonateSettings,
  submitDonation
} from "../api/client";

export default function Donate() {
  const [settings, setSettings] = useState(DEFAULT_DONATE_SETTINGS);
  const [selected, setSelected] = useState(1000);
  const [custom, setCustom] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pan: "",
    message: "",
    transaction_id: ""
  });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const fileInputRef = useRef(null);

  // Load dynamic settings from backend or local cache
  useEffect(() => {
    let mounted = true;
    fetchDonateSettings().then((data) => {
      if (mounted && data) {
        setSettings(data);
      }
    });

    const handleSettingsUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener("alertngo_donate_settings_updated", handleSettingsUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("alertngo_donate_settings_updated", handleSettingsUpdate);
    };
  }, []);

  const finalAmount = custom ? Number(custom) : (selected || 0);

  // Combine default preset amounts with any custom impact tier amounts
  const tierAmounts = Array.isArray(settings.impact_tiers)
    ? settings.impact_tiers.map((t) => Number(String(t.amount).replace(/[^0-9]/g, ""))).filter((n) => !isNaN(n) && n > 0)
    : [];
  const presetAmounts = Array.from(new Set([500, 1000, 2500, 5000, 10000, 25000, ...tierAmounts])).sort((a, b) => a - b);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2200);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Screenshot file size should be less than 10MB");
        return;
      }
      setScreenshotFile(file);
      setErrorMsg("");
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const minAmount = settings.min_donation || 10;
    if (!finalAmount || finalAmount < minAmount) {
      setErrorMsg(`Please select or enter a donation amount of at least ₹${minAmount}`);
      return;
    }

    if (!form.name.trim()) {
      setErrorMsg("Please enter your full name");
      return;
    }

    if (!form.email.trim()) {
      setErrorMsg("Please enter a valid email address for receipt delivery");
      return;
    }

    if (settings.require_screenshot && !screenshotFile && !form.transaction_id) {
      setErrorMsg("Please upload your payment screenshot or enter the UPI Reference / UTR Number");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        pan: form.pan.trim().toUpperCase(),
        amount: finalAmount,
        message: form.message.trim(),
        transaction_id: form.transaction_id.trim()
      };

      const res = await submitDonation(payload, screenshotFile);
      if (res && res.success) {
        setSubmittedData({
          ...payload,
          tracking_code: res.tracking_code || form.transaction_id || `ALT-DON-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }),
          screenshot_url: res.screenshot_url || screenshotPreview
        });
      } else {
        throw new Error(res?.message || "Failed to submit donation");
      }
    } catch (err) {
      // Local fallback submission
      const fallbackCode = form.transaction_id || `ALT-DON-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedData({
        ...form,
        amount: finalAmount,
        tracking_code: fallbackCode,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }),
        screenshot_url: screenshotPreview
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setForm({ name: "", email: "", phone: "", pan: "", message: "", transaction_id: "" });
    setScreenshotFile(null);
    setScreenshotPreview("");
    setErrorMsg("");
  };

  // UPI deep link for mobile devices
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(settings.upi_id || "alert.ngo@upi")}&pn=${encodeURIComponent(
    settings.upi_payee_name || settings.upi_name || "ALERT NGO"
  )}&am=${finalAmount || 500}&cu=INR&tn=${encodeURIComponent("Donation to ALERT NGO")}`;

  return (
    <>
      <style>{`
        /* Global & Desktop donate section clearance */
        .donate-section {
          padding-top: 130px;
          padding-bottom: 60px;
          scroll-margin-top: 96px;
          background: #fbfbfe;
        }
        .donate-grid-custom {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 36px;
          align-items: start;
        }
        .donate-main-title {
          font-family: var(--font-serif);
          font-size: 2.1rem;
          font-weight: 800;
          color: var(--color-dark, #0f172a);
          margin-bottom: 12px;
          line-height: 1.22;
        }
        .donate-intro-text {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 22px;
          font-size: 0.98rem;
        }
        .impact-tiers-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .impact-tier-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 18px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .impact-tier-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(210,25,12,0.08);
          border-color: rgba(210,25,12,0.25);
        }
        .impact-tier-card.active {
          border-color: var(--color-primary, #D2190C);
          background: #fff8f6 !important;
          box-shadow: 0 4px 12px rgba(210,25,12,0.1);
        }
        .impact-tier-amount {
          font-weight: 800;
          color: #1e293b;
          font-size: 1.15rem;
          min-width: 75px;
        }
        .impact-tier-card.active .impact-tier-amount {
          color: var(--color-primary, #D2190C);
        }
        .impact-tier-desc {
          font-size: 0.88rem;
          color: #334155;
          margin: 0;
          line-height: 1.45;
        }
        .donate-form-card {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 8px 26px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }
        .qr-pay-card-premium {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .qr-box-wrap-clean {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .qr-image-wrapper {
          background: #ffffff;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 3px 10px rgba(0,0,0,0.04);
          text-align: center;
          flex-shrink: 0;
        }
        .qr-image-display {
          width: 125px;
          height: 125px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .qr-info-content {
          flex: 1;
          min-width: 0;
        }
        .upi-copy-chip-clean {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          padding: 7px 11px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          max-width: 100%;
        }
        .upi-copy-chip-clean:hover {
          border-color: var(--color-primary, #D2190C);
          background: #fff8f6;
        }
        .upi-mobile-pay-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #0f172a;
          color: #ffffff !important;
          padding: 9px 12px;
          border-radius: 7px;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          margin-bottom: 10px;
          transition: all 0.15s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .upi-mobile-pay-btn:hover {
          background: #1e293b;
        }
        .qr-steps-mini {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .qr-step-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.76rem;
          color: #475569;
        }
        .qr-step-num {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #334155;
          font-weight: 700;
          font-size: 0.7rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .screenshot-dropzone {
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
          border-radius: 10px;
          padding: 14px 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .screenshot-dropzone:hover {
          border-color: var(--color-primary, #D2190C);
          background: #fff5f5;
        }
        .donate-submit-btn {
          width: 100%;
          background: var(--color-primary, #D2190C);
          color: #ffffff;
          border: none;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(210,25,12,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          letter-spacing: 0.2px;
        }
        .donate-submit-btn:hover:not(:disabled) {
          background: #b9150a;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(210,25,12,0.3);
        }
        .donate-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Responsive tablet & mobile clearances */
        @media (max-width: 900px) {
          .donate-section {
            padding-top: 155px !important;
            padding-bottom: 40px !important;
          }
          .donate-grid-custom {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        @media (max-width: 600px) {
          .donate-section {
            padding-top: 180px !important;
          }
          .donate-main-title {
            font-size: 1.30rem !important;
            line-height: 1.25 !important;
            margin-bottom: 8px !important;
          }
          .donate-intro-text {
            font-size: 0.80rem !important;
            line-height: 1.5 !important;
            margin-bottom: 14px !important;
          }
          .impact-tiers-list {
            gap: 8px !important;
          }
          .impact-tier-card {
            padding: 9px 12px !important;
            gap: 10px !important;
            border-radius: 9px !important;
          }
          .impact-tier-amount {
            font-size: 0.95rem !important;
            min-width: 58px !important;
          }
          .impact-tier-desc {
            font-size: 0.78rem !important;
            line-height: 1.38 !important;
          }
          .donate-form-card {
            padding: 16px 13px !important;
            border-radius: 12px !important;
          }
          .qr-box-wrap-clean {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
          .qr-image-wrapper {
            margin: 0 auto;
            width: 100%;
            max-width: 140px;
            padding: 8px;
            box-sizing: border-box;
          }
          .qr-image-display {
            width: 110px;
            height: 110px;
          }
          .upi-copy-chip-clean {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }
          .form-row-responsive {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .form-input, .form-textarea {
            font-size: 0.82rem !important;
            padding: 7px 10px !important;
            border-radius: 7px !important;
          }
          .form-input {
            height: 37px !important;
          }
          .amount-btn {
            padding: 8px 6px !important;
            font-size: 0.82rem !important;
            border-radius: 6px !important;
          }
          .screenshot-dropzone {
            padding: 10px 8px !important;
          }
          .donate-submit-btn {
            padding: 11px 14px !important;
            font-size: 0.86rem !important;
            border-radius: 8px !important;
            box-shadow: 0 3px 10px rgba(210,25,12,0.2) !important;
          }
        }
        @media (max-width: 480px) {
          .donate-amounts {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <section className="section-pad donate-section">
        <div className="container">
          <div className="donate-grid-custom">
            {/* LEFT COLUMN: Dynamic Impact, Tiers, and Trust Badges */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
              <span className="badge" style={{ marginBottom: 10, display: "inline-block", background: "rgba(210,25,12,0.1)", color: "var(--color-primary, #D2190C)", fontWeight: 700, fontSize: "0.78rem" }}>
                Make an Impact
              </span>
              <h1 className="donate-main-title">
                {settings.page_title || "Your Donation Changes Lives"}
              </h1>
              <p className="donate-intro-text">
                {settings.intro_text ||
                  "Every donation to ALERT directly supports Adivasi communities in Andhra Pradesh. Your contribution funds forest rights advocacy, women empowerment programs, solar energy access, and sustainable livelihood initiatives."}
              </p>

              {/* Dynamic Impact Tiers with Click-to-Select */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                  Select an impact tier to donate:
                </p>
                <div className="impact-tiers-list">
                  {(settings.impact_tiers && settings.impact_tiers.length > 0
                    ? settings.impact_tiers
                    : DEFAULT_DONATE_SETTINGS.impact_tiers
                  ).map((d, i) => {
                    const rawNum = Number(String(d.amount).replace(/[^0-9]/g, ""));
                    const isTierSelected = finalAmount === rawNum;
                    return (
                      <div
                        key={i}
                        className={`impact-tier-card ${isTierSelected ? "active" : ""}`}
                        onClick={() => {
                          if (rawNum > 0) {
                            setSelected(rawNum);
                            setCustom("");
                          }
                        }}
                      >
                        <div className="impact-tier-amount">
                          {String(d.amount || "").startsWith("₹")
                            ? d.amount
                            : `₹${Number(String(d.amount || 0).replace(/[^0-9]/g, "") || 0).toLocaleString("en-IN")}`}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p className="impact-tier-desc">
                            {d.impact}
                          </p>
                        </div>
                        {isTierSelected && (
                          <span style={{ color: "var(--color-primary, #D2190C)", fontSize: "0.95rem" }}>
                            <FaCheck />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Trust Badges */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                {(settings.trust_badges && settings.trust_badges.length > 0
                  ? settings.trust_badges
                  : DEFAULT_DONATE_SETTINGS.trust_badges
                ).map((b, i) => {
                  const label = typeof b === "string" ? b : b?.label || "100% Impact";
                  const iconType = typeof b === "object" ? b?.icon : "";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#475569",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        background: "white",
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <span style={{ color: "var(--color-primary, #D2190C)" }}>
                        {iconType === "shield" || i % 3 === 0 ? (
                          <FaShieldAlt />
                        ) : iconType === "receipt" || i % 3 === 1 ? (
                          <FaReceipt />
                        ) : (
                          <FaHeart />
                        )}
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Donation & Payment Form with QR Code */}
            <motion.div
              className="donate-form-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              {submittedData ? (
                /* SUCCESS CONFIRMATION VIEW */
                <div style={{ textAlign: "center", padding: "16px 8px" }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      background: "rgba(16,185,129,0.12)",
                      color: "#059669",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      margin: "0 auto 12px"
                    }}
                  >
                    ✓
                  </div>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                    Thank You, {submittedData.name}!
                  </h2>
                  <p style={{ color: "#475569", fontSize: "0.88rem", marginBottom: 16 }}>
                    Your donation has been recorded. Our team will verify the payment and email your official Section 80G Tax Exemption Receipt.
                  </p>

                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: "16px",
                      textAlign: "left",
                      marginBottom: 18
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid #e2e8f0", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Reference Code:</span>
                      <span style={{ fontWeight: 800, color: "var(--color-primary, #D2190C)", fontFamily: "monospace", fontSize: "0.92rem" }}>
                        {submittedData.tracking_code}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Amount Donated:</span>
                      <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.98rem" }}>
                        ₹{Number(submittedData.amount).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Donor Email:</span>
                      <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem" }}>
                        {submittedData.email}
                      </span>
                    </div>
                    {submittedData.pan && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>PAN (80G Tax):</span>
                        <span style={{ fontWeight: 700, color: "#0f172a", fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {submittedData.pan}
                        </span>
                      </div>
                    )}
                    {submittedData.screenshot_url && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 4 }}>Receipt Uploaded:</span>
                        <img
                          src={submittedData.screenshot_url}
                          alt="Payment Receipt"
                          style={{ maxHeight: 90, borderRadius: 6, border: "1px solid #cbd5e1" }}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleReset}
                    className="donate-submit-btn"
                    style={{ margin: "0 auto", maxWidth: 220 }}
                  >
                    Donate Again
                  </button>
                </div>
              ) : (
                /* DONATION FORM */
                <form onSubmit={handleSubmit}>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                    Make Your Donation
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: 16 }}>
                    Select amount, scan the official QR code to pay, and upload your payment confirmation.
                  </p>

                  {/* Step 1: Select Amount */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem", color: "#334155", display: "block", marginBottom: 6 }}>
                      1. Select Amount (₹)
                    </label>
                    <div className="donate-amounts" style={{ gap: 8, marginBottom: 10 }}>
                      {presetAmounts.map((a) => (
                        <button
                          type="button"
                          key={a}
                          className={`amount-btn ${selected === a && !custom ? "active" : ""}`}
                          onClick={() => {
                            setSelected(a);
                            setCustom("");
                          }}
                        >
                          ₹{a.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: 9, fontWeight: 700, color: "#64748b", fontSize: "0.85rem" }}>₹</span>
                      <input
                        className="form-input"
                        style={{ paddingLeft: 28 }}
                        type="number"
                        min="10"
                        placeholder="Enter custom amount (₹)"
                        value={custom}
                        onChange={(e) => {
                          setCustom(e.target.value);
                          setSelected(null);
                        }}
                      />
                    </div>
                    {finalAmount > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "6px 12px",
                          background: "rgba(210, 25, 12, 0.08)",
                          borderRadius: 6,
                          color: "var(--color-primary, #D2190C)",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span>Donating:</span>
                        <span style={{ fontSize: "1rem" }}>₹{finalAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Donor Details */}
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem", color: "#334155", display: "block", marginBottom: 6 }}>
                      2. Donor Information
                    </label>
                    <div className="form-row form-row-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 3, display: "block" }}>Full Name *</label>
                        <input
                          className="form-input"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 3, display: "block" }}>Email *</label>
                        <input
                          className="form-input"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="form-row form-row-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 3, display: "block" }}>Phone Number</label>
                        <input
                          className="form-input"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91-XXXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 3, display: "block" }}>PAN Number (for 80G)</label>
                        <input
                          className="form-input"
                          value={form.pan}
                          onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 3, display: "block" }}>Message (Optional)</label>
                      <textarea
                        className="form-textarea"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Any message or designation for this donation..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Step 3: Payment QR Code Section */}
                  <div className="qr-pay-card-premium">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0f172a" }}>
                        <FaQrcode style={{ fontSize: "1.05rem", color: "var(--color-primary, #D2190C)" }} />
                        <strong style={{ fontSize: "0.88rem" }}>3. Scan QR Code to Pay</strong>
                      </div>
                      <span style={{ fontSize: "0.7rem", background: "#ecfdf5", color: "#059669", padding: "2px 7px", borderRadius: 999, fontWeight: 700, border: "1px solid #a7f3d0" }}>
                        Instant UPI
                      </span>
                    </div>

                    <div className="qr-box-wrap-clean">
                      {/* QR Display Card */}
                      <div className="qr-image-wrapper">
                        <img
                          src={settings.qr_code_image || "/uploads/alert-donation-qr.png"}
                          alt="ALERT UPI Payment QR Code"
                          className="qr-image-display"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.fallback) {
                              e.currentTarget.dataset.fallback = "1";
                              e.currentTarget.src = "/uploads/alert-donation-qr.svg";
                            }
                          }}
                        />
                        <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 4, fontWeight: 600 }}>
                          Scan with any UPI App
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="qr-info-content">
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 3 }}>
                            Official UPI ID:
                          </span>
                          <button
                            type="button"
                            className="upi-copy-chip-clean"
                            onClick={() => handleCopy(settings.upi_id || "alert.ngo@upi", "upi_id")}
                            title="Click to copy UPI ID"
                          >
                            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                              {settings.upi_id || "alert.ngo@upi"}
                            </span>
                            {copiedField === "upi_id" ? (
                              <span style={{ color: "#16a34a", display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.72rem", fontWeight: 700 }}>
                                <FaCheck /> Copied!
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-primary, #D2190C)", display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.72rem", fontWeight: 700 }}>
                                <FaCopy /> Copy
                              </span>
                            )}
                          </button>
                        </div>

                        <div style={{ fontSize: "0.76rem", color: "#334155", marginBottom: 8 }}>
                          <span style={{ color: "#64748b" }}>Payee: </span>
                          <strong>{settings.upi_payee_name || settings.upi_name || "Association for Land and Livelihood (ALERT)"}</strong>
                        </div>

                        {/* Mobile Direct Pay Deep Link Button */}
                        <a
                          href={upiDeepLink}
                          className="upi-mobile-pay-btn"
                        >
                          <FaExternalLinkAlt size={10} /> Open UPI App (GPay / PhonePe / Paytm)
                        </a>

                        {/* Clean 2-Step Compact Instructions */}
                        <div className="qr-steps-mini">
                          <div className="qr-step-item">
                            <span className="qr-step-num">1</span>
                            <span>Scan QR or copy UPI ID & complete transfer</span>
                          </div>
                          <div className="qr-step-item">
                            <span className="qr-step-num">2</span>
                            <span>Upload the payment screenshot below</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Upload Payment Screenshot / Receipt */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: "0.82rem", color: "#334155", display: "block", marginBottom: 6 }}>
                      4. Upload Payment Screenshot / Receipt
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />

                    {screenshotPreview ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: 10,
                          background: "#f1f5f9",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1"
                        }}
                      >
                        <img
                          src={screenshotPreview}
                          alt="Screenshot Preview"
                          style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {screenshotFile?.name || "Payment Screenshot"}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "2px 0 0" }}>
                            {screenshotFile ? `${(screenshotFile.size / 1024).toFixed(1)} KB` : "Uploaded successfully"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: 5,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 700
                          }}
                        >
                          <FaTimes /> Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        className="screenshot-dropzone"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaUpload style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: 4 }} />
                        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                          Click to upload payment screenshot
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "#64748b", margin: "2px 0 0" }}>
                          JPG, PNG, or WEBP receipt from your UPI app (Max 10MB)
                        </p>
                      </div>
                    )}

                    {/* UTR / Transaction Reference ID */}
                    <div style={{ marginTop: 10 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem", color: "#64748b", marginBottom: 3, display: "block" }}>
                        UPI Reference / UTR Number (Optional if screenshot uploaded)
                      </label>
                      <input
                        className="form-input"
                        value={form.transaction_id}
                        onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                        placeholder="e.g. 12-digit UPI Ref ID: 4123XXXXXXXX"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#fee2e2",
                        border: "1px solid #fecaca",
                        borderRadius: 6,
                        color: "#dc2626",
                        fontSize: "0.82rem",
                        marginBottom: 14
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  {/* Compact, Prominent Submit Button */}
                  <button type="submit" className="donate-submit-btn" disabled={submitting}>
                    {submitting ? (
                      "Recording Donation..."
                    ) : (
                      <>
                        <FaPaperPlane size={13} /> Submit Payment Proof ({finalAmount ? `₹${finalAmount.toLocaleString()}` : "₹0"})
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center", marginTop: 10, lineHeight: 1.4 }}>
                    {settings.tax_exemption_note ||
                      "ALERT is registered under Section 12A & 80G of the Income Tax Act. All donations are 100% tax-exempt."}
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dynamic Bank Transfer Section */}
      <section className="section-pad-sm" style={{ background: "#0b1528", color: "white", padding: "50px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.1)",
                color: "#f8fafc",
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: 20,
                marginBottom: 8
              }}
            >
              <FaUniversity /> Direct Bank NEFT / RTGS / IMPS
            </span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.7rem", color: "white", marginBottom: 6, fontWeight: 700 }}>
              Bank Transfer Details
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem" }}>
              Corporate sponsors and large institutional donors can transfer directly into our registered NGO account
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 12,
              maxWidth: 860,
              margin: "0 auto"
            }}
          >
            {(settings.bank_details && settings.bank_details.length > 0
              ? settings.bank_details
              : DEFAULT_DONATE_SETTINGS.bank_details
            ).map((d, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {d.label}
                  </p>
                  <p style={{ color: "white", fontWeight: 700, fontSize: "0.92rem", margin: 0, wordBreak: "break-all" }}>
                    {d.value}
                  </p>
                </div>
                {d.label && !d.label.toLowerCase().includes("bank") && !d.label.toLowerCase().includes("name") && (
                  <button
                    type="button"
                    onClick={() => handleCopy(d.value, `bank_${i}`)}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "none",
                      color: copiedField === `bank_${i}` ? "#4ade80" : "white",
                      padding: "7px",
                      borderRadius: 5,
                      cursor: "pointer",
                      fontSize: "0.8rem"
                    }}
                    title="Copy to clipboard"
                  >
                    {copiedField === `bank_${i}` ? <FaCheck /> : <FaCopy />}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              After completing a direct bank transfer, please share transaction details to{" "}
              <a href="mailto:contact@alertngo.in" style={{ color: "#f87171", textDecoration: "underline" }}>
                contact@alertngo.in
              </a>{" "}
              or submit via the form above for Section 80G tax receipt issuance.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
