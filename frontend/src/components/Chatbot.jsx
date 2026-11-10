import { useState, useRef, useEffect, useCallback } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaExternalLinkAlt } from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8001";

/* ─── helpers ─── */
const WELCOME = `Hello! 👋 I'm the ALERT website assistant. I can help you with information about:
- Polavaram LA & R&R (Land Acquisition & Resettlement)
- Court cases, legal documents & PDFs
- ALERT's programmes, forest rights, grievances
- Compensation, entitlements & colony housing

Ask me anything about the site!`;

function renderText(text) {
  // Convert markdown links [label](url) → <a> tags, and newlines → <br>
  const parts = [];
  let remaining = text;
  let key = 0;
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  linkRe.lastIndex = 0;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) {
      const slice = text.slice(last, m.index);
      parts.push(...slice.split("\n").flatMap((s, i) => (i === 0 ? [s] : [<br key={key++} />, s])));
    }
    const href = m[2].startsWith("/") ? m[2] : m[2];
    parts.push(
      <a
        key={key++}
        href={href}
        target={m[2].startsWith("http") ? "_blank" : "_self"}
        rel="noopener noreferrer"
        style={{ color: "#D2190C", textDecoration: "underline", fontWeight: 600 }}
      >
        {m[1]}
        {m[2].startsWith("http") && <FaExternalLinkAlt size={9} style={{ marginLeft: 3, verticalAlign: "middle" }} />}
      </a>
    );
    last = m.index + m[0].length;
    linkRe.lastIndex = last;
  }
  if (last < text.length) {
    const slice = text.slice(last);
    parts.push(...slice.split("\n").flatMap((s, i) => (i === 0 ? [s] : [<br key={key++} />, s])));
  }
  return parts;
}

/* ─── main component ─── */
export default function Chatbot({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  hideToggle = false,
  toggleBottom = 24,
  windowBottom = 90,
  mobileToggleBottom = 14,
  mobileWindowBottom = 68,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback((next) => {
    const value = typeof next === "function" ? next(open) : next;
    if (!isControlled) setInternalOpen(value);
    if (onOpenChange) onOpenChange(value);
  }, [isControlled, onOpenChange, open]);
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  /* auto-scroll */
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  /* focus input when opened */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const userMsg = { role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Build history for context (last 6 turns, excluding welcome)
    const history = messages
      .filter((m) => m.ts !== messages[0]?.ts || m.role !== "assistant")
      .slice(-12)
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch(`${API_BASE}/chat.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const payload = await res.json();

      if (payload.success && payload.data?.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: payload.data.answer, sources: payload.data.sources || [], ts: Date.now() },
        ]);
      } else {
        throw new Error(payload.message || "No answer received");
      }
    } catch (err) {
      setError("Sorry, I couldn't reach the assistant right now. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm having trouble connecting right now. For immediate help, please visit the [Polavaram Document Archive](/la-rr#archive) or [all Polavaram LA & R&R pages](/all-pages?category=Polavaram%20LA%20%26%20R%26R).`,
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ─── SUGGESTED QUESTIONS ─── */
  const suggestions = [
    "What is Polavaram LA & R&R?",
    "How many villages are affected?",
    "What compensation do displaced families get?",
    "Show me court case documents",
  ];

  const askSuggestion = (q) => {
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      {/* ── floating toggle button ── */}
      {!hideToggle && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat assistant" : "Open chat assistant"}
          style={{
            position: "fixed",
            bottom: `var(--chatbot-toggle-bottom, ${toggleBottom}px)`,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: open
              ? "linear-gradient(135deg,#9E0F04,#D2190C)"
              : "linear-gradient(135deg,#D2190C,#F5A000)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(210,25,12,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.35rem",
            zIndex: 998,
            transition: "transform 0.2s ease, background 0.2s ease",
            transform: open ? "rotate(45deg) scale(0.92)" : "scale(1)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = open ? "rotate(45deg) scale(0.98)" : "scale(1.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = open ? "rotate(45deg) scale(0.92)" : "scale(1)"; }}
        >
          {open ? <FaTimes /> : <FaComments />}
        </button>
      )}

      {/* ── chat window ── */}
      {open && (
        <div
          className="chatbot-modal-window"
          style={{
            position: "fixed",
            bottom: `var(--chatbot-window-bottom, ${windowBottom}px)`,
            right: 20,
            width: "min(380px, calc(100vw - 32px))",
            height: "min(560px, calc(100vh - 120px))",
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 16px 60px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 997,
            border: "1px solid #f1f5f9",
            animation: "chatSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* header */}
          <div
            style={{
              background: "linear-gradient(135deg,#D2190C 0%,#003190 100%)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                color: "#fff",
              }}
            >
              <FaRobot />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
                ALERT Assistant
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem" }}>
                Polavaram LA &amp; R&amp;R Info
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* messages area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 14px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                }}
              >
                {/* avatar */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg,#003190,#0E2B66)"
                      : "linear-gradient(135deg,#D2190C,#F5A000)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.7rem",
                    flexShrink: 0,
                  }}
                >
                  {msg.role === "user" ? <FaUser /> : <FaRobot />}
                </div>

                {/* bubble */}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 13px",
                    borderRadius: msg.role === "user"
                      ? "16px 4px 16px 16px"
                      : "4px 16px 16px 16px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg,#003190,#0E2B66)"
                      : "#f8fafc",
                    color: msg.role === "user" ? "#fff" : "#26334D",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                  }}
                >
                  {renderText(msg.content)}

                  {/* sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Sources
                      </div>
                      {msg.sources.map((s, si) => (
                        <a
                          key={si}
                          href={s.url}
                          style={{
                            display: "block",
                            fontSize: "0.74rem",
                            color: "#D2190C",
                            textDecoration: "none",
                            fontWeight: 600,
                            marginBottom: 2,
                          }}
                        >
                          → {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* typing indicator */}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#D2190C,#F5A000)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.7rem",
                    flexShrink: 0,
                  }}
                >
                  <FaRobot />
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderRadius: "4px 16px 16px 16px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#D2190C",
                        display: "inline-block",
                        animation: `chatDot 1.2s ease-in-out ${d * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* suggestions (only on first message) */}
          {messages.length === 1 && (
            <div
              style={{
                padding: "4px 14px 8px",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                flexShrink: 0,
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => askSuggestion(s)}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: 20,
                    padding: "5px 11px",
                    fontSize: "0.74rem",
                    color: "#003190",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* input bar */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              flexShrink: 0,
              background: "#fff",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask about Polavaram LA & R&R…"
              style={{
                flex: 1,
                resize: "none",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: "9px 12px",
                fontSize: "0.85rem",
                fontFamily: "inherit",
                color: "#26334D",
                outline: "none",
                lineHeight: 1.5,
                maxHeight: 96,
                overflowY: "auto",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#D2190C")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background:
                  !input.trim() || loading
                    ? "#e2e8f0"
                    : "linear-gradient(135deg,#D2190C,#F5A000)",
                color: !input.trim() || loading ? "#94a3b8" : "#fff",
                border: "none",
                cursor: !input.trim() || loading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <FaPaperPlane />
            </button>
          </div>

          {/* footer note */}
          <div
            style={{
              padding: "5px 14px 10px",
              textAlign: "center",
              fontSize: "0.67rem",
              color: "#94a3b8",
              flexShrink: 0,
            }}
          >
            Powered by ALERT's knowledge base · alertngo.in
          </div>
        </div>
      )}

      {/* keyframe animations & mobile responsive styles */}
      <style>{`
        :root {
          --chatbot-toggle-bottom: ${toggleBottom}px;
          --chatbot-window-bottom: ${windowBottom}px;
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @media (max-width: 480px) {
          .chatbot-modal-window {
            right: 8px !important;
            left: 8px !important;
            bottom: ${mobileWindowBottom}px !important;
            width: calc(100% - 16px) !important;
            max-width: calc(100% - 16px) !important;
            height: min(500px, calc(100vh - 84px)) !important;
            border-radius: 16px !important;
          }
          .chatbot-toggle-btn {
            bottom: ${mobileToggleBottom}px !important;
            right: 14px !important;
            width: 46px !important;
            height: 46px !important;
            font-size: 1.15rem !important;
          }
        }
      `}</style>
    </>
  );
}

