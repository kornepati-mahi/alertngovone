import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaLandmark,
  FaTree,
  FaGavel,
  FaHandHoldingHeart,
  FaCheckCircle,
  FaSun,
  FaUsers,
  FaAward,
  FaHistory,
  FaCalendarAlt,
  FaCompass,
  FaBalanceScale,
  FaShieldAlt,
  FaLeaf
} from "react-icons/fa";
import {
  DEFAULT_TIMELINE_HEADER,
  DEFAULT_TIMELINE_METRICS,
  DEFAULT_MILESTONES
} from "../data/defaultMilestones";

const ICON_MAP = {
  FaLandmark: <FaLandmark />,
  FaTree: <FaTree />,
  FaGavel: <FaGavel />,
  FaHandHoldingHeart: <FaHandHoldingHeart />,
  FaCheckCircle: <FaCheckCircle />,
  FaSun: <FaSun />,
  FaUsers: <FaUsers />,
  FaAward: <FaAward />,
  FaHistory: <FaHistory />,
  FaCalendarAlt: <FaCalendarAlt />,
  FaCompass: <FaCompass />,
  FaBalanceScale: <FaBalanceScale />,
  FaShieldAlt: <FaShieldAlt />,
  FaLeaf: <FaLeaf />
};

function renderIcon(icon, defaultIcon = <FaAward />) {
  if (!icon) return defaultIcon;
  if (typeof icon === "string") {
    return ICON_MAP[icon] || defaultIcon;
  }
  return icon;
}

export default function InteractiveTimeline({
  customMilestones,
  customHeader,
  customMetrics,
  customJubilee
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [highlightedYear, setHighlightedYear] = useState(null);

  const header = {
    badge: customHeader?.badge || DEFAULT_TIMELINE_HEADER.badge,
    sub: customHeader?.sub || DEFAULT_TIMELINE_HEADER.sub,
    heading: customHeader?.heading || DEFAULT_TIMELINE_HEADER.heading,
    desc: customHeader?.desc || DEFAULT_TIMELINE_HEADER.desc,
    jubilee_title: customJubilee?.title || customHeader?.jubilee_title || DEFAULT_TIMELINE_HEADER.jubilee_title,
    jubilee_sub: customJubilee?.sub || customHeader?.jubilee_sub || DEFAULT_TIMELINE_HEADER.jubilee_sub
  };

  const metrics = useMemo(() => {
    return Array.isArray(customMetrics) && customMetrics.length > 0
      ? customMetrics
      : DEFAULT_TIMELINE_METRICS;
  }, [customMetrics]);

  const milestonesData = useMemo(() => {
    return Array.isArray(customMilestones) && customMilestones.length > 0
      ? customMilestones
      : DEFAULT_MILESTONES;
  }, [customMilestones]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    milestonesData.forEach((m) => {
      if (m.category && m.category.trim()) {
        set.add(m.category.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [milestonesData]);

  const filtered = selectedCategory === "All"
    ? milestonesData
    : milestonesData.filter((m) => m.category === selectedCategory);

  const handleYearJump = (year) => {
    setHighlightedYear(year);
    const el = document.getElementById(`milestone-${year}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* HEADER CARD */}
      <div style={{ background: "white", padding: "clamp(20px, 4vw, 32px)", borderRadius: 20, boxShadow: "var(--shadow-sm)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {header.badge && (
                <span className="badge" style={{ background: "rgba(255, 137, 0, 0.12)", color: "var(--color-primary)", fontWeight: 700 }}>
                  {header.badge}
                </span>
              )}
              {header.sub && (
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-light)" }}>
                  {header.sub}
                </span>
              )}
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--color-dark)", margin: 0 }}>
              {header.heading}
            </h3>
            {header.desc && (
              <p style={{ color: "var(--color-text-light)", marginTop: 6, fontSize: "0.95rem", maxWidth: 760, lineHeight: 1.6 }}>
                {header.desc}
              </p>
            )}
          </div>

          {(header.jubilee_title || header.jubilee_sub) && (
            <div style={{ background: "#fff7ed", border: "1px solid #ffedd5", padding: "10px 18px", borderRadius: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <FaAward style={{ color: "var(--color-primary)", fontSize: "1.4rem" }} />
              <div>
                {header.jubilee_title && (
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--color-dark)" }}>{header.jubilee_title}</div>
                )}
                {header.jubilee_sub && (
                  <div style={{ fontSize: "0.76rem", color: "#c2410c" }}>{header.jubilee_sub}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* METRICS ROW */}
        {metrics.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 24 }}>
            {metrics.map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  borderRadius: 14,
                  padding: "16px 18px",
                  borderLeft: `4px solid ${stat.color || "var(--color-primary)"}`,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    {stat.label}
                  </span>
                  <span style={{ color: stat.color || "var(--color-primary)", fontSize: "1.1rem" }}>
                    {renderIcon(stat.icon, <FaHistory />)}
                  </span>
                </div>
                <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--color-dark)", margin: "4px 0" }}>
                  {stat.val}
                </div>
                {stat.desc && (
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{stat.desc}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK-JUMP YEAR SCRUBBER & CATEGORY FILTER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        {/* YEAR BUTTONS */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {milestonesData.map((m, idx) => {
            const yrKey = m.year || String(idx);
            const isMatch = highlightedYear === yrKey;
            return (
              <button
                key={yrKey}
                onClick={() => handleYearJump(yrKey)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: isMatch ? "none" : "1px solid #cbd5e1",
                  background: isMatch ? "var(--color-primary)" : "white",
                  color: isMatch ? "white" : "var(--color-dark)",
                  boxShadow: isMatch ? "0 4px 12px rgba(255,137,0,0.3)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                {yrKey}
              </button>
            );
          })}
        </div>

        {/* CATEGORY FILTER */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 16,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: selectedCategory === cat ? "var(--color-dark)" : "#f1f5f9",
                  color: selectedCategory === cat ? "white" : "#475569",
                  transition: "all 0.2s ease"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CENTRAL SPINE TIMELINE CONTAINER */}
      <div style={{ position: "relative", padding: "20px 0" }}>
        {/* GLOWING VERTICAL SPINE */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 4,
            background: "linear-gradient(to bottom, #D2190C 0%, #3E8E0F 50%, #003190 100%)",
            transform: "translateX(-50%)",
            borderRadius: 4,
            boxShadow: "0 0 12px rgba(255, 137, 0, 0.4)"
          }}
          className="timeline-central-spine"
        />

        {/* TIMELINE ITEMS (ZIGZAG ON DESKTOP, STACKED ON MOBILE) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 36, position: "relative" }}>
          {filtered.map((item, idx) => {
            const isEven = idx % 2 === 0;
            const isHighlighted = highlightedYear === item.year;

            return (
              <div
                key={item.year || idx}
                id={`milestone-${item.year}`}
                style={{
                  display: "flex",
                  justifyContent: isEven ? "flex-start" : "flex-end",
                  position: "relative",
                  width: "100%"
                }}
                className={`timeline-row ${isEven ? "timeline-left" : "timeline-right"}`}
              >
                {/* TIMELINE CARD */}
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -4, boxShadow: "0 16px 36px rgba(0,0,0,0.12)" }}
                  style={{
                    width: "calc(50% - 40px)",
                    background: isHighlighted ? "#fffbeb" : "white",
                    borderRadius: 18,
                    padding: "24px 26px",
                    boxShadow: isHighlighted ? "0 10px 30px rgba(245,158,11,0.25)" : "0 6px 20px rgba(0,0,0,0.06)",
                    border: isHighlighted ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                    borderTop: `4px solid ${item.color || "var(--color-primary)"}`,
                    position: "relative",
                    transition: "all 0.25s ease"
                  }}
                  className="timeline-card-box"
                >
                  {/* TOP HEADER: YEAR & PHASE */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span
                      style={{
                        background: item.color || "var(--color-primary)",
                        color: "white",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        padding: "4px 12px",
                        borderRadius: 20,
                        boxShadow: `0 3px 10px ${(item.color || "#D2190C")}40`,
                        letterSpacing: 0.5
                      }}
                    >
                      {item.year}
                    </span>
                    {item.phase && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {item.phase}
                      </span>
                    )}
                  </div>

                  {/* TITLE */}
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--color-dark)", margin: "0 0 10px", lineHeight: 1.35 }}>
                    {item.title}
                  </h4>

                  {/* NARRATIVE */}
                  <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.65, margin: "0 0 16px" }}>
                    {item.desc}
                  </p>

                  {/* STAT PILL BADGE */}
                  <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    {item.stat && (
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: item.color || "var(--color-primary)",
                          background: "#f8fafc",
                          padding: "4px 10px",
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaCheckCircle size={11} /> {item.stat}
                      </span>
                    )}
                    {item.category && (
                      <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600 }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* CENTRAL SPINE NODE (CONNECTED CIRCLE) */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "32px",
                    transform: "translateX(-50%)",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: item.color || "var(--color-primary)",
                    border: "4px solid white",
                    boxShadow: `0 0 16px ${(item.color || "#D2190C")}70`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.9rem",
                    zIndex: 2
                  }}
                  className="timeline-node-pin"
                >
                  {renderIcon(item.icon, <FaAward />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
