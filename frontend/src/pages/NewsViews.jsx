import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaArrowRight, FaHeart, FaShieldAlt, FaCheckCircle, FaUsers } from "react-icons/fa";
import AnimatedTypewriter from "../components/AnimatedTypewriter";
import { fetchNews, defaultNews } from "../api/client";

export default function NewsViews() {
  const [selectedTag, setSelectedTag] = useState("all");
  const [articles, setArticles] = useState(defaultNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchNews().then((res) => {
      if (isMounted) {
        if (res.data && res.data.length > 0) {
          setArticles(res.data);
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);


  const newsItems = [
    {
      title: "Godavari Flood Relief 2023: Emergency Rations & Medical Kits to 4,200 Displaced Families",
      date: "September 2023",
      category: "relief",
      tag: "Flood Relief 2023",
      img: "/uploads/all2023.jpeg",
      excerpt: "ALERT mobilized field teams across flood-hit habitations of Alluri Sitharama Raju and Eluru districts, deploying mechanized boats to supply rice, lentils, drinking water, and sanitary kits to cut-off Adivasi hamlets."
    },
    {
      title: "Flood Relief Operations 2022: Multi-Mandal Relief Mission Across Submergence Habitations",
      date: "October 2022",
      category: "relief",
      tag: "Flood Relief 2022",
      img: "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg",
      excerpt: "Field caseworkers distributed comprehensive ration packets and hygiene supplies to families displaced by heavy Godavari river spillage in Kunavaram, VR Puram, and Chintoor mandals."
    },
    {
      title: "Flood Relief Operations 2021: Rescue Boat Deployment & Essential Services in Hill Tracts",
      date: "August 2021",
      category: "relief",
      tag: "Flood Relief 2021",
      img: "/uploads/WhatsApp-Image-2021-08-23-at-11.23.52-AM-1024x768.jpeg",
      excerpt: "ALERT established temporary relief distribution bases in remote hill areas, providing direct sustenance to vulnerable tribal children, nursing mothers, and elderly persons."
    },
    {
      title: "Blankets & Winter Care Distribution in East Godavari Hill Hamlets",
      date: "October 2020",
      category: "winter",
      tag: "Blankets Drive",
      img: "/uploads/WhatsApp-Image-2020-10-10-at-1.48.07-PM-1-300x225-1.jpeg",
      excerpt: "Over 3,000 thermal wool blankets and basic healthcare supplies were handed over directly to remote Konda Reddi tribal households facing harsh winter temperatures."
    },
    {
      title: "Essential Groceries Distribution Campaign in West Godavari Submergence Villages",
      date: "September 2020",
      category: "groceries",
      tag: "Groceries Distribution",
      img: "/uploads/WhatsApp-Image-2020-09-21-at-8.41.17-PM-300x225-1.jpeg",
      excerpt: "Comprehensive grocery kits containing 25kg rice, cooking oil, pulses, and dry spices were delivered to each family residing in Polavaram submergence zones."
    },
    {
      title: "Project Green Energy: Solar Street Lighting & Lantern Distribution in Off-Grid Villages",
      date: "September 2021",
      category: "energy",
      tag: "Solar Energy",
      img: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
      excerpt: "Decentralized clean solar street poles and solar home lanterns were installed across off-grid tribal hamlets, bringing illumination to villages without electric grid access."
    }
  ];

  const categoryFilters = useMemo(() => {
    const list = [
      { id: "all", label: "All Campaigns" },
      { id: "relief", label: "Flood Relief (2021–2023)" },
      { id: "winter", label: "East Godavari Blankets" },
      { id: "groceries", label: "West Godavari Groceries" },
      { id: "energy", label: "Green Solar Energy" },
    ];
    const seen = new Set(["all", "relief", "winter", "groceries", "energy"]);
    articles.forEach((a) => {
      const c = (a.category || "").trim();
      const cLower = c.toLowerCase();
      if (
        c &&
        !seen.has(cLower) &&
        !cLower.includes("flood") &&
        !cLower.includes("winter") &&
        !cLower.includes("grocer") &&
        !cLower.includes("energy")
      ) {
        seen.add(cLower);
        list.push({ id: c, label: c });
      }
    });
    return list;
  }, [articles]);

  const filteredNews = articles.filter((n) => {
    if (selectedTag === "all") return true;
    const cat = (n.category || "").toLowerCase();
    const tag = (n.tag || "").toLowerCase();
    const sel = selectedTag.toLowerCase();
    if (cat === sel || tag === sel || cat.includes(sel) || tag.includes(sel)) return true;
    if (sel === "relief" && (cat.includes("flood") || tag.includes("flood") || cat.includes("relief") || tag.includes("relief"))) return true;
    if (sel === "winter" && (cat.includes("winter") || tag.includes("blanket"))) return true;
    if (sel === "groceries" && (cat.includes("grocer") || tag.includes("food") || tag.includes("ration"))) return true;
    if (sel === "energy" && (cat.includes("energy") || tag.includes("solar"))) return true;
    return false;
  });

  return (
    <>
      <style>{`
        .news-hero-section {
          padding-top: 140px;
          scroll-margin-top: 96px;
        }
        .news-typewriter-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 8px 20px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(0, 49, 144, 0.05);
          font-size: 0.86rem;
          max-width: 100%;
          box-sizing: border-box;
        }
        .news-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
        .news-filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 40px;
        }
        .news-filter-btn {
          padding: 9px 22px;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .news-filter-btn.active {
          background: linear-gradient(135deg, #D2190C 0%, #EA580C 100%) !important;
          color: #ffffff !important;
          border: 1px solid transparent !important;
          box-shadow: 0 6px 18px -2px rgba(210, 25, 12, 0.35) !important;
        }
        .news-filter-btn:not(.active):hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
          transform: translateY(-1px);
        }
        .news-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }
        .news-card-img-wrap {
          height: 230px;
          overflow: hidden;
          position: relative;
        }
        .news-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        @media (max-width: 768px) {
          .news-hero-section {
            padding-top: 138px !important;
          }
          .news-hero-header {
            margin-bottom: 16px !important;
          }
          .news-hero-header h2 {
            font-size: clamp(1.5rem, 5.5vw, 1.85rem) !important;
            margin-bottom: 10px !important;
          }
          .news-hero-header p {
            font-size: 0.9rem !important;
            line-height: 1.6 !important;
          }
          .news-typewriter-pill {
            font-size: 0.78rem !important;
            padding: 6px 14px !important;
            gap: 6px !important;
          }
          .news-typewriter-container {
            margin-bottom: 22px !important;
          }
          .news-filter-bar {
            display: flex !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            gap: 8px !important;
            justify-content: flex-start !important;
            padding: 4px 16px 14px !important;
            margin: 0 -16px 26px !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .news-filter-bar::-webkit-scrollbar {
            display: none;
          }
          .news-filter-btn {
            flex: 0 0 auto !important;
            padding: 8px 16px !important;
            font-size: 0.78rem !important;
            border-radius: 999px !important;
          }
          .news-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .news-card-img-wrap {
            height: 200px !important;
          }
          .news-card-body {
            padding: 20px 18px !important;
          }
        }
      `}</style>

      <section className="section-pad news-hero-section hero" id="dispatches">
        <div className="container">
          <div className="news-hero-header" style={{ textAlign: "center", maxWidth: 860, margin: "0 auto 20px" }}>
            <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Section 01</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
              News From The Field
            </h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>
              Ground dispatches from flood relief drives, blanket and grocery distributions, and solar installations across the tribal and coastal belts of Andhra Pradesh.
            </p>
          </div>

          <div className="news-typewriter-container" style={{ display: "flex", justifyContent: "center", marginBottom: 34 }}>
            <div className="news-typewriter-pill">
              <span className="news-pulse-dot" />
              <AnimatedTypewriter
                prefix="Field Action: "
                prefixColor="#475569"
                highlightColor="#D2190C"
                words={[
                  "Godavari Flood Relief 2021 – 2023 Operations",
                  "East Godavari Remote Village Blanket Drives",
                  "West Godavari Essential Groceries Support",
                  "Decentralized Solar Street Pole Deployments",
                  "Emergency Boat Rescues in Submergence Hamlets"
                ]}
                typingSpeed={55}
                deletingSpeed={30}
                pauseTime={2000}
              />
            </div>
          </div>

          {/* TAG FILTERS */}
          <div className="news-filter-bar">
            {categoryFilters.map((t) => {
              const isActive = selectedTag === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(t.id)}
                  className={`news-filter-btn ${isActive ? "active" : ""}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* NEWS GRID */}
          <div className="news-cards-grid">
            {filteredNews.map((item, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: "white",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 10px 30px -5px rgba(0, 49, 144, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #e2e8f0"
                }}
              >
                <div className="news-card-img-wrap">
                  <img
                    src={item.img}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                    loading="lazy"
                    decoding="async"
                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="news-card-body">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.8rem", marginBottom: 10 }}>
                      <FaCalendarAlt size={12} /> {item.date}
                    </div>
                    <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1.4, marginBottom: 10 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.6, marginBottom: 18 }}>
                      {item.excerpt}
                    </p>
                  </div>

                  <Link
                    to={item.link_url || "/contact"}
                    style={{
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    Partner / Support Relief <FaArrowRight size={11} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <div className="container cta-container">
          <div className="cta-shell cta-shell--single">
            <div className="cta-shell-glow cta-shell-glow-1" aria-hidden="true" />
            <div className="cta-shell-glow cta-shell-glow-2" aria-hidden="true" />

            <div className="cta-copy">
              <div className="cta-badge">
                <span className="cta-badge-dot" aria-hidden="true" />
                <span>News &amp; Views</span>
              </div>

              <h2 className="cta-title">
                Relief Seasons Do Not <span className="cta-title-highlight">Wait For A Cycle</span>
              </h2>

              <p className="cta-subtitle">
                Flood, winter and cyclone responses are funded as they arise. Support a distribution in advance, or write to us to join a relief drive as a volunteer.
              </p>

              <div className="cta-actions">
                <Link to="/donate" className="cta-btn-donate">
                  <span>Fund a Relief Drive</span>
                  <span className="cta-donate-heart" aria-hidden="true"><FaHeart size={13} /></span>
                </Link>
                <Link to="/contact" className="cta-btn-volunteer">
                  <span>Join A Field Team</span>
                  <FaArrowRight size={12} className="cta-btn-arrow" aria-hidden="true" />
                </Link>
              </div>

              <div className="cta-trust-strip">
                <div className="cta-trust-item">
                  <FaShieldAlt className="cta-trust-icon" aria-hidden="true" />
                  <span>12A &amp; 80G</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaCheckCircle className="cta-trust-icon" aria-hidden="true" />
                  <span>Distribution Lists Shared</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaUsers className="cta-trust-icon" aria-hidden="true" />
                  <span>Field-Verified Reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
