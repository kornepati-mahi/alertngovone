import { useState, useEffect } from "react";
import { FaWhatsapp, FaInstagram, FaComments, FaTimes, FaChevronRight } from "react-icons/fa";
import Chatbot from "./Chatbot";

const WHATSAPP_NUMBER = "919391234444"; // ALERT contact (India)
const INSTAGRAM_URL = "https://www.instagram.com/alertngo/";

const SERVICES = [
  { label: "Polavaram LA & R&R Support", message: "Hello ALERT, I would like to know more about Polavaram LA & R&R support and related assistance." },
  { label: "Flood Relief Assistance", message: "Hello ALERT, I need information about flood relief assistance and support services." },
  { label: "Forest Rights (RoFR) & LTR", message: "Hello ALERT, I would like help regarding Forest Rights (RoFR) and LTR matters." },
  { label: "Legal Aid & Grievances", message: "Hello ALERT, I need legal aid / grievance support. Please guide me." },
  { label: "Child Interventions & Education", message: "Hello ALERT, I would like information about child interventions and education support." },
  { label: "Livelihoods & Programs", message: "Hello ALERT, I would like to know about your livelihoods and community programs." },
  { label: "Donations & Partnerships", message: "Hello ALERT, I am interested in donations/partnership opportunities. Please share details." },
  { label: "General Inquiry", message: "Hello ALERT, I have a general inquiry. Please assist me." },
];

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function FloatingContactActions() {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 480 : false));
  const [waOpen, setWaOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!waOpen) return;
    const onDocClick = (e) => {
      if (!e.target.closest?.(".floating-wa-wrap")) setWaOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [waOpen]);

  const right = isMobile ? 14 : 24;
  const btnSize = isMobile ? 46 : 56;
  const gap = isMobile ? 10 : 12;
  const bottomInstagram = isMobile ? 14 : 24;
  const bottomWhatsApp = bottomInstagram + btnSize + gap;
  const bottomChat = bottomWhatsApp + btnSize + gap;
  const chatWindowBottom = bottomChat + btnSize + (isMobile ? 8 : 10);

  const baseBtn = {
    position: "fixed",
    right,
    width: btnSize,
    height: btnSize,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    zIndex: 998,
    boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <>
      {/* Instagram */}
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Instagram profile"
        title="Instagram"
        style={{
          ...baseBtn,
          bottom: bottomInstagram,
          background: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)",
          fontSize: isMobile ? "1.2rem" : "1.35rem",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <FaInstagram />
      </a>

      {/* WhatsApp + services menu */}
      <div className="floating-wa-wrap" style={{ position: "fixed", right, bottom: bottomWhatsApp, zIndex: 1001 }}>
        {waOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: btnSize + 10,
              width: isMobile ? "min(320px, calc(100vw - 28px))" : 320,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              boxShadow: "0 16px 40px rgba(15,23,42,0.18)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "12px 14px", background: "linear-gradient(135deg,#128C7E,#25D366)", color: "#fff" }}>
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>WhatsApp Services</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.92, marginTop: 2 }}>Select a service to send a pre-filled message</div>
            </div>
            <div style={{ maxHeight: isMobile ? 280 : 320, overflowY: "auto", padding: 8 }}>
              {SERVICES.map((svc) => (
                <button
                  key={svc.label}
                  type="button"
                  onClick={() => {
                    openWhatsApp(svc.message);
                    setWaOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    borderRadius: 10,
                    padding: "10px 10px",
                    marginBottom: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    color: "#0f172a",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#ecfdf5"; e.currentTarget.style.borderColor = "#86efac"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  <span>{svc.label}</span>
                  <FaChevronRight size={11} color="#16a34a" />
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          aria-label={waOpen ? "Close WhatsApp services" : "Open WhatsApp services"}
          title="WhatsApp"
          onClick={() => { setWaOpen((o) => !o); setChatOpen(false); }}
          style={{
            ...baseBtn,
            position: "relative",
            right: "auto",
            bottom: "auto",
            background: waOpen ? "linear-gradient(135deg,#0f766e,#128C7E)" : "linear-gradient(135deg,#25D366,#128C7E)",
            fontSize: isMobile ? "1.25rem" : "1.45rem",
            transform: waOpen ? "scale(0.96)" : "scale(1)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = waOpen ? "scale(1)" : "scale(1.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = waOpen ? "scale(0.96)" : "scale(1)"; }}
        >
          {waOpen ? <FaTimes /> : <FaWhatsapp />}
        </button>
      </div>

      {/* AI Chatbot toggle (above WhatsApp) */}
      <button
        type="button"
        aria-label={chatOpen ? "Close chat assistant" : "Open chat assistant"}
        title="AI Assistant"
        onClick={() => { setChatOpen((o) => !o); setWaOpen(false); }}
        style={{
          ...baseBtn,
          bottom: bottomChat,
          background: chatOpen
            ? "linear-gradient(135deg,#9E0F04,#D2190C)"
            : "linear-gradient(135deg,#D2190C,#F5A000)",
          fontSize: isMobile ? "1.15rem" : "1.35rem",
          transform: chatOpen ? "rotate(45deg) scale(0.92)" : "scale(1)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = chatOpen ? "rotate(45deg) scale(0.98)" : "scale(1.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = chatOpen ? "rotate(45deg) scale(0.92)" : "scale(1)"; }}
      >
        {chatOpen ? <FaTimes /> : <FaComments />}
      </button>

      {/* Chatbot window (controlled, toggle hidden) */}
      <Chatbot
        open={chatOpen}
        onOpenChange={setChatOpen}
        hideToggle
        toggleBottom={bottomChat}
        windowBottom={chatWindowBottom}
        mobileToggleBottom={bottomChat}
        mobileWindowBottom={chatWindowBottom}
      />
    </>
  );
}
