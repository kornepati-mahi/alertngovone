import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUsers,
  FaWater,
  FaMapMarkedAlt,
  FaClock,
  FaUtensils,
  FaTint,
  FaMedkit,
  FaBed,
  FaShip,
  FaHandHoldingHeart,
  FaArrowRight,
  FaHeart,
  FaCheckCircle,
} from "react-icons/fa";

/* ─── Static data ─────────────────────────────────────────────── */

const stats = [
  { icon: <FaUsers />, value: "4,200+", label: "Families Emergency Relieved", color: "var(--color-primary)" },
  { icon: <FaWater />, value: "5", label: "Major Flood Operations (2019–2023)", color: "var(--color-secondary)" },
  { icon: <FaMapMarkedAlt />, value: "15+", label: "Districts Covered", color: "#3E8E0F" },
  { icon: <FaClock />, value: "48hrs", label: "Average Response Time", color: "#F5A000" },
];

const timeline = [
  {
    year: "2023",
    title: "Godavari Flood Relief 2023",
    description:
      "4,200 displaced families received emergency rations & medical kits across Alluri Sitharama Raju and Eluru districts. Mechanized boats were deployed to reach the most isolated hamlets.",
    image: "/uploads/all2023.jpeg",
    bullets: [
      "Emergency ration kits to 4,200 families",
      "Medical first-aid kits distributed across 2 districts",
      "Mechanized boat deployment for cut-off villages",
      "Coordination with district administration & NDRF teams",
    ],
  },
  {
    year: "2022",
    title: "Multi-Mandal Relief Mission",
    description:
      "Ration packets and hygiene supplies reached Kunavaram, VR Puram and Chintoor mandals, areas where flood waters inundated roads and isolated tribal hamlets for weeks.",
    image: "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg",
    bullets: [
      "Ration packets to flood-affected mandals",
      "Hygiene & sanitation supply kits",
      "Coverage of Kunavaram, VR Puram, Chintoor mandals",
      "Last-mile delivery via head-load volunteers",
    ],
  },
  {
    year: "2021",
    title: "Rescue Boat Deployment",
    description:
      "ALERT established relief bases in remote hill areas to serve tribal children, nursing mothers and elderly residents cut off by the 2021 floods, deploying rescue boats across inaccessible terrains.",
    image: "/uploads/WhatsApp-Image-2021-08-23-at-11.23.52-AM-1024x768.jpeg",
    bullets: [
      "Relief bases set up in remote hill areas",
      "Priority care for children, nursing mothers & elderly",
      "Rescue boat operations in inaccessible terrain",
      "Emergency food & clean water distribution",
    ],
  },
  {
    year: "2020",
    title: "Blankets & Winter Care",
    description:
      "3,000+ thermal wool blankets were distributed to Konda Reddi tribal households to protect vulnerable families from post-flood cold spells in the Godavari agency belt.",
    image: "/uploads/WhatsApp-Image-2020-10-10-at-1.48.07-PM-1-300x225-1.jpeg",
    bullets: [
      "3,000+ thermal wool blankets distributed",
      "Focus on Konda Reddi tribal households",
      "Post-flood winter care for the elderly",
      "Agency belt coverage across multiple villages",
    ],
  },
  {
    year: "2020 (Covid)",
    title: "Essential Groceries During COVID Lockdowns",
    description:
      "Nutritional hampers and essential grocery kits were delivered to forest hamlet families during the COVID-19 lockdowns, when supply chains collapsed and remote communities faced acute food insecurity.",
    image: "/uploads/WhatsApp-Image-2020-07-29-at-10.42.06-AM-768x576-1.jpeg",
    bullets: [
      "Nutritional hampers to forest hamlet families",
      "Delivered during strict COVID-19 lockdown",
      "Addressed acute food insecurity in agency areas",
      "Covered communities with no market access",
    ],
  },
];

const provisions = [
  {
    icon: <FaUtensils />,
    title: "Emergency Food Rations",
    desc: "Ready-to-eat meals and dry-ration kits containing rice, dal, oil and essential groceries to sustain displaced families during acute relief phases.",
    color: "var(--color-primary)",
  },
  {
    icon: <FaTint />,
    title: "Clean Drinking Water",
    desc: "Water pouches, purification tablets and portable filtration units distributed to prevent waterborne disease outbreaks in flood-affected camps.",
    color: "var(--color-secondary)",
  },
  {
    icon: <FaMedkit />,
    title: "Medical Aid Kits",
    desc: "First-aid and primary healthcare kits with ORS, basic medicines and wound-care supplies, coordinated with ASHA workers and primary health centres.",
    color: "#D2190C",
  },
  {
    icon: <FaBed />,
    title: "Shelter & Blankets",
    desc: "Thermal wool blankets, polythene sheets and temporary shelter materials to protect families from exposure in post-flood conditions and winter months.",
    color: "#F5A000",
  },
  {
    icon: <FaShip />,
    title: "Boat Rescue Operations",
    desc: "Mechanized and country boats deployed to evacuate and supply relief materials to villages surrounded by floodwaters and inaccessible by road.",
    color: "#003190",
  },
  {
    icon: <FaHandHoldingHeart />,
    title: "Post-Relief Rehabilitation",
    desc: "Follow-up livelihood support, house repair assistance and psychosocial counselling to help communities rebuild after the immediate emergency phase.",
    color: "#3E8E0F",
  },
];

/* ─── Animation variants ──────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] },
  }),
};

/* ─── Component ───────────────────────────────────────────────── */

export default function DisasterRelief() {
  return (
    <>
      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════ */}
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <span
              className="badge"
              style={{
                marginBottom: 20,
                display: "inline-block",
                background: "rgba(210,25,12,0.18)",
                color: "#FFCCC9",
                border: "1px solid rgba(210,25,12,0.4)",
              }}
            >
              Emergency Response
            </span>

            <h1>Disaster Relief &amp; Emergency Response</h1>

            <p>
              ALERT deploys rapid-response flood relief operations across the Godavari agency belt —
              delivering rations, medical kits, rescue boats and shelter materials to the most
              vulnerable tribal families when disaster strikes.
            </p>

            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">
                <FaHome style={{ verticalAlign: "middle", marginRight: 4 }} />
                Home
              </Link>
              <span className="breadcrumb-sep" aria-hidden="true">›</span>
              <span>Disaster Relief</span>
            </nav>
          </motion.div>
        </div>

        {/* Decorative bottom wave */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: "var(--color-bg)",
            clipPath: "ellipse(55% 100% at 50% 100%)",
          }}
        />
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — IMPACT STATS
      ═══════════════════════════════════════════ */}
      <section className="section-pad" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 56px" }}
          >
            <motion.span variants={fadeUp} className="badge" style={{ marginBottom: 14, display: "inline-block" }}>
              Impact at a Glance
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.65rem, 3.2vw, 2.1rem)",
                color: "var(--color-dark)",
                marginBottom: 14,
                lineHeight: 1.3,
              }}
            >
              Two Decades of Emergency Action
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.96rem" }}
            >
              Since 2004, ALERT has been the first responder for flood-affected Adivasi communities
              across the Godavari basin — bridging the gap between disaster and government relief.
            </motion.p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                style={{
                  background: "white",
                  borderRadius: 18,
                  padding: "32px 24px",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid #f1f5f9",
                  textAlign: "center",
                  borderTop: `4px solid ${s.color}`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: `${s.color}15`,
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.35rem",
                    margin: "0 auto 16px",
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: "clamp(2rem, 4vw, 2.6rem)",
                    fontWeight: 800,
                    color: s.color,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.5 }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — TIMELINE OF RELIEF OPERATIONS
      ═══════════════════════════════════════════ */}
      <section
        className="section-pad"
        style={{ background: "white", borderTop: "1px solid #e2e8f0" }}
      >
        <div className="container">
          {/* Heading */}
          <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 64px" }}>
            <span className="badge" style={{ marginBottom: 14, display: "inline-block" }}>
              Field Operations
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.65rem, 3.2vw, 2.1rem)",
                color: "var(--color-dark)",
                marginBottom: 14,
                lineHeight: 1.3,
              }}
            >
              Timeline of Relief Operations
            </h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.96rem" }}>
              A year-by-year account of ALERT's emergency deployments across the flood-prone
              Godavari agency belt.
            </p>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative" }}>
            {/* Vertical spine */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 3,
                background: "linear-gradient(180deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                transform: "translateX(-50%)",
                borderRadius: 4,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 64,
                position: "relative",
                zIndex: 1,
              }}
            >
              {timeline.map((op, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 40px 1fr",
                      gap: "0 24px",
                      alignItems: "center",
                    }}
                  >
                    {/* Left slot */}
                    <div style={{ gridColumn: isEven ? 1 : 3, gridRow: 1 }}>
                      <TimelineCard op={op} align={isEven ? "right" : "left"} />
                    </div>

                    {/* Center node */}
                    <div
                      style={{
                        gridColumn: 2,
                        gridRow: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--gradient-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 0 0 6px rgba(210,25,12,0.12)",
                          flexShrink: 0,
                        }}
                      >
                        <FaWater style={{ color: "white", fontSize: "1rem" }} />
                      </div>
                    </div>

                    {/* Right slot — image side */}
                    <div style={{ gridColumn: isEven ? 3 : 1, gridRow: 1 }}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          borderRadius: 18,
                          overflow: "hidden",
                          boxShadow: "var(--shadow-md)",
                          aspectRatio: "16/10",
                        }}
                      >
                        <img
                          src={op.image}
                          alt={op.title}
                          loading="lazy"
                          decoding="async"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Responsive fallback (mobile): single-column list ── */}
        <style>{`
          @media (max-width: 720px) {
            .dr-timeline-spine { display: none !important; }
            .dr-timeline-grid  { display: flex !important; flex-direction: column !important; gap: 36px !important; }
            .dr-timeline-node  { display: none !important; }
            .dr-card-left, .dr-card-right { grid-column: 1 / -1 !important; text-align: left !important; }
          }
        `}</style>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — WHAT WE PROVIDE
      ═══════════════════════════════════════════ */}
      <section className="section-pad" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 56px" }}>
            <span className="badge" style={{ marginBottom: 14, display: "inline-block" }}>
              Relief Provisions
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.65rem, 3.2vw, 2.1rem)",
                color: "var(--color-dark)",
                marginBottom: 14,
                lineHeight: 1.3,
              }}
            >
              What We Provide
            </h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.75, fontSize: "0.96rem" }}>
              ALERT's disaster relief package is designed to cover immediate survival needs as well
              as medium-term recovery — ensuring no community is left behind.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {provisions.map((p, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ y: -5, boxShadow: "var(--shadow-md)" }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "white",
                  borderRadius: 18,
                  padding: "28px 24px",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid #f1f5f9",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: `${p.color}14`,
                    color: p.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    marginBottom: 18,
                  }}
                >
                  {p.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--color-dark)",
                    marginBottom: 10,
                  }}
                >
                  {p.title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.7 }}>
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — CTA
      ═══════════════════════════════════════════ */}
      <section
        className="section-pad"
        style={{
          background: "var(--gradient-hero)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-30%",
            right: "-10%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(210,25,12,0.12)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-8%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(0,49,144,0.18)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(210,25,12,0.2)",
                border: "1px solid rgba(210,25,12,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                color: "#FFCCC9",
                margin: "0 auto 24px",
              }}
            >
              <FaHeart />
            </div>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.8rem, 3.8vw, 2.6rem)",
                color: "white",
                marginBottom: 16,
                lineHeight: 1.25,
              }}
            >
              Support Our Relief Work
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: "clamp(0.95rem, 2vw, 1.08rem)",
                lineHeight: 1.75,
                maxWidth: 580,
                margin: "0 auto 36px",
              }}
            >
              Every contribution helps ALERT reach more families in the critical 48-hour window
              after a flood — providing food, clean water and medical care to those who need it most.
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/donate"
                className="btn-primary"
                style={{ fontSize: "1rem", padding: "14px 34px" }}
              >
                Donate Now <FaArrowRight size={13} />
              </Link>
              <Link
                to="/contact"
                className="btn-outline"
                style={{
                  fontSize: "1rem",
                  padding: "13px 32px",
                  borderColor: "rgba(255,255,255,0.45)",
                  color: "white",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                Get in Touch <FaArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ─── Sub-component: Timeline Card ───────────────────────────── */

function TimelineCard({ op, align }) {
  const isRight = align === "right";
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: "28px 26px",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid #f1f5f9",
        textAlign: isRight ? "right" : "left",
        borderLeft: isRight ? undefined : "4px solid var(--color-primary)",
        borderRight: isRight ? "4px solid var(--color-primary)" : undefined,
      }}
    >
      {/* Year badge */}
      <span
        className="badge"
        style={{
          marginBottom: 12,
          display: "inline-block",
          background: "rgba(210,25,12,0.1)",
          color: "var(--color-primary)",
        }}
      >
        {op.year}
      </span>

      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.1rem, 2.2vw, 1.3rem)",
          color: "var(--color-dark)",
          marginBottom: 10,
          lineHeight: 1.35,
        }}
      >
        {op.title}
      </h3>

      <p
        style={{
          fontSize: "0.88rem",
          color: "var(--color-text-light)",
          lineHeight: 1.75,
          marginBottom: 18,
        }}
      >
        {op.description}
      </p>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: isRight ? "flex-end" : "flex-start",
        }}
      >
        {op.bullets.map((b, bi) => (
          <li
            key={bi}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              flexDirection: isRight ? "row-reverse" : "row",
              fontSize: "0.84rem",
              color: "var(--color-text-light)",
            }}
          >
            <FaCheckCircle
              style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 3 }}
              size={13}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
