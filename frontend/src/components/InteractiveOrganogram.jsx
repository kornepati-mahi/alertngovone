import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  FaSitemap,
  FaUsers,
  FaBalanceScale,
  FaWater,
  FaHandHoldingHeart,
  FaLock,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle
} from "react-icons/fa";

const organogramData = {
  id: "general_body",
  title: "General Body of ALERT",
  subtitle: "Supreme Sovereign Authority",
  desc: "Comprises founding members, legal experts, academics, and grassroots indigenous representatives. Convenes annually to ratify organizational policy, review audits, and elect the Governing Body.",
  color: "#061842",
  icon: <FaUsers />,
  badge: "Constitutional Core",
  children: [
    {
      id: "governing_body",
      title: "Governing Body / Board of Directors",
      subtitle: "Executive Governance & Policy Trusteeship",
      desc: "7-member elected body steering policy formulation, legal intervention strategy, FCRA compliance, and 35 institutional governance frameworks.",
      color: "var(--color-primary)",
      icon: <FaSitemap />,
      badge: "Policy Leadership",
      children: [
        {
          id: "secretary_director",
          title: "Chief Functionary / Secretary & Director",
          subtitle: "Mr. Y.L.J.B. Jayaraj (Founder & Executive Leader)",
          desc: "47+ years of grassroots human rights leadership. Directs day-to-day operations, state-level advocacy, donor coordination, and high court legal strategy.",
          color: "#1e3a8a",
          icon: <FaBalanceScale />,
          badge: "Executive Functionary",
          children: [
            {
              id: "legal_wing",
              title: "Legal Cell & Constitutional Advocacy",
              subtitle: "PESA, RoFR & LTR Legal Aid Unit",
              desc: "Drafts High Court PILs, RTI representations, Forest Rights Act (RoFR 2006) community claims, and Land Transfer Regulation 1/70 land restitution suits.",
              color: "#10b981",
              icon: <FaBalanceScale />,
              badge: "Legal Cell",
              lead: "Paralegal Team & Constitutional Scholars"
            },
            {
              id: "polavaram_wing",
              title: "Polavaram LA & R&R Field Unit",
              subtitle: "371 Submerged Villages Relief Command",
              desc: "Monitors statutory rehabilitation under RFCTLARR Act 2013, conducts field surveys across Godavari gorge hamlets, and verifies land-for-land entitlements.",
              color: "#f59e0b",
              icon: <FaWater />,
              badge: "R&R Cell",
              lead: "Field Surveyors & Community Organizers"
            },
            {
              id: "antyodaya_wing",
              title: "Antyodaya Livelihoods & Women Cooperatives",
              subtitle: "Nomadic Yenadi & Coastal Fisheries Directorate",
              desc: "Manages the 3,500-member Matsya Mithra Women Fisheries Federation, nomadic tribal housing pattas, and solar micro-grid installations.",
              color: "#0ea5e9",
              icon: <FaHandHoldingHeart />,
              badge: "Community Co-ops",
              lead: "Cooperative Managers & Field Mobilizers"
            },
            {
              id: "finance_wing",
              title: "Finance, Administration & Compliance",
              subtitle: "Statutory Governance & 35 Policies Registry",
              desc: "Oversees 12A, 80G, FCRA statutory compliance, quarterly double-entry audits, POSH Internal Complaints Committee, and procurement standards.",
              color: "#8b5cf6",
              icon: <FaLock />,
              badge: "Compliance Cell",
              lead: "Chartered Accountants & Internal Auditors"
            }
          ]
        }
      ]
    }
  ]
};

export default function InteractiveOrganogram({ customWings, customHeader }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState("wings"); // 'wings'

  const defaultWings = organogramData.children[0].children[0].children;
  const wingsList = Array.isArray(customWings) && customWings.length > 0
    ? customWings
    : defaultWings;

  const archBadge = customHeader?.arch_badge || "Organizational Architecture";
  const archSub = customHeader?.arch_sub || "Democratic Governance Hierarchy";
  const organogramTitle = customHeader?.title || "Interactive Institutional Organogram";
  const organogramDesc = customHeader?.desc || "Visualizing ALERT's transparent governance framework: from the sovereign General Body down to autonomous grassroots Gram Sabhas and field operational cells.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* HEADER CARD */}
      <div style={{ background: "white", padding: "clamp(20px, 4vw, 32px)", borderRadius: 20, boxShadow: "var(--shadow-sm)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="badge" style={{ background: "rgba(30, 58, 138, 0.12)", color: "#1e3a8a", fontWeight: 700 }}>
                {archBadge}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-light)" }}>
                {archSub}
              </span>
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--color-dark)", margin: 0 }}>
              {organogramTitle}
            </h3>
            <p style={{ color: "var(--color-text-light)", marginTop: 6, fontSize: "0.95rem", maxWidth: 760, lineHeight: 1.6 }}>
              {organogramDesc}
            </p>
          </div>

          <div style={{ display: "inline-flex", background: "#f8fafc", padding: 4, borderRadius: 20, border: "1px solid #cbd5e1" }}>
            <button
              type="button"
              onClick={() => setActiveTab("wings")}
              style={{
                border: "none",
                padding: "8px 16px",
                borderRadius: 16,
                background: activeTab === "wings" ? "var(--color-dark)" : "transparent",
                color: activeTab === "wings" ? "white" : "#64748b",
                cursor: "pointer",
                fontSize: "0.84rem",
                fontWeight: 600,
                transition: "all 0.2s ease"
              }}
            >
              {wingsList.length} Operational Wings
            </button>
          </div>
        </div>
      </div>

      {/* 4 WINGS DETAILED ACCORDION */}
      {activeTab === "wings" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {wingsList.map((wing, idx) => {
            const wingColor = wing.color || "var(--color-primary)";
            const wingIcon = wing.icon || (
              idx === 0 ? <FaBalanceScale /> :
              idx === 1 ? <FaWater /> :
              idx === 2 ? <FaHandHoldingHeart /> : <FaLock />
            );
            return (
              <div
                key={wing.id || idx}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid #e2e8f0",
                  borderLeft: `5px solid ${wingColor}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ color: wingColor, fontSize: "1.4rem" }}>{wingIcon}</span>
                  <div>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>
                      {wing.title}
                    </h4>
                    {wing.subtitle && (
                      <span style={{ fontSize: "0.82rem", color: "var(--color-primary)", fontWeight: 600 }}>
                        {wing.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: "0.9rem", color: "var(--color-text-light)", lineHeight: 1.6, marginBottom: 16 }}>
                  {wing.desc}
                </p>

                {wing.lead && (
                  <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
                    <FaCheckCircle style={{ color: "#10b981", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 600 }}>
                      Led by: {wing.lead}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL FOR ANY SELECTED NODE */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
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
                maxWidth: 550,
                width: "100%",
                padding: 28,
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", padding: "3px 10px", borderRadius: 12, background: "#f1f5f9", color: "var(--color-primary)" }}>
                  {selectedNode.badge || "ALERT Leadership"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.2rem" }}
                >
                  ✕
                </button>
              </div>

              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "var(--color-dark)", marginBottom: 4 }}>
                {selectedNode.title}
              </h4>
              <div style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: 14 }}>
                {selectedNode.subtitle}
              </div>

              <p style={{ fontSize: "0.92rem", color: "var(--color-text-light)", lineHeight: 1.65, marginBottom: 20 }}>
                {selectedNode.desc}
              </p>

              {selectedNode.lead && (
                <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20, fontSize: "0.85rem", color: "#475569" }}>
                  <strong>Operational Command: </strong> {selectedNode.lead}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "10px 0" }}
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
