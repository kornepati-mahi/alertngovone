import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSearchPlus, FaHeart, FaShieldAlt, FaCheckCircle, FaArrowRight, FaPlay } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import AnimatedTypewriter from "../components/AnimatedTypewriter";
import { fetchGallery, defaultGallery } from "../api/client";

const BASE_CATEGORIES = ["All", "Photos", "Videos", "Events", "Community", "Forest Rights", "Education", "Relief", "Energy", "Field Work", "Women"];

function getEmbedUrl(url) {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }
  return url;
}

function isYouTubeUrl(url) {
  return /(?:youtube\.com|youtu\.be)/i.test(url || "");
}

function getYouTubeThumbnail(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}

function isVideoFile(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v|mkv)($|\?)/i.test(url);
}

function GalleryTileMedia({ item }) {
  const [posterFailed, setPosterFailed] = useState(false);
  const isVideo = item.type === "video";

  if (!isVideo) {
    return (
      <img
        src={item.src}
        alt={item.title || "Gallery photo"}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92, display: "block" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  const isYt = isYouTubeUrl(item.src);
  const ytThumb = isYt ? getYouTubeThumbnail(item.src) : "";
  const validPoster = item.poster && !isVideoFile(item.poster) ? item.poster : ytThumb;

  if (validPoster && !posterFailed) {
    return (
      <img
        src={validPoster}
        alt=""
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92, display: "block" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          setPosterFailed(true);
        }}
      />
    );
  }

  if (isYt && ytThumb) {
    return (
      <img
        src={ytThumb}
        alt={item.title || "YouTube thumbnail"}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92, display: "block" }}
      />
    );
  }

  if (item.src) {
    return (
      <video
        src={`${item.src}#t=0.5`}
        preload="auto"
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: 0.92,
          pointerEvents: "none",
          background: "#000"
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b"
      }}
    >
      <FaPlay size={28} />
    </div>
  );
}

export default function Gallery() {
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get("filter");
  const urlCat = searchParams.get("cat");

  const initialActive = urlCat || (urlFilter === "Photos" ? "Photos" : urlFilter === "Videos" ? "Videos" : "All");
  const [active, setActive] = useState(initialActive);
  const [typeConstraint, setTypeConstraint] = useState(urlFilter === "Photos" ? "image" : urlFilter === "Videos" ? "video" : "all");
  const [lightbox, setLightbox] = useState(null);
  const [images, setImages] = useState(defaultGallery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const f = searchParams.get("filter");
    const c = searchParams.get("cat");
    if (c) {
      setActive(c);
      if (f === "Photos") setTypeConstraint("image");
      else if (f === "Videos") setTypeConstraint("video");
      else setTypeConstraint("all");
    } else if (f) {
      if (f === "Photos") { setActive("Photos"); setTypeConstraint("image"); }
      else if (f === "Videos") { setActive("Videos"); setTypeConstraint("video"); }
      else { setActive(f); setTypeConstraint("all"); }
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    fetchGallery().then((res) => {
      if (isMounted) {
        if (res.data && res.data.length > 0) {
          setImages(res.data);
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(BASE_CATEGORIES);
    images.forEach((img) => {
      if (img.cat && img.cat.trim()) cats.add(img.cat.trim());
    });
    return Array.from(cats);
  }, [images]);

  const photoCount = images.filter((i) => (i.type || "image") === "image").length;
  const videoCount = images.filter((i) => i.type === "video").length;
  const eventsCount = images.filter((i) => i.cat === "Events" || i.cat === "Event").length;

  const filtered = useMemo(() => {
    let list = images;
    if (active === "All") {
      list = images;
    } else if (active === "Photos") {
      list = images.filter((i) => (i.type || "image") === "image");
    } else if (active === "Videos") {
      list = images.filter((i) => i.type === "video");
    } else if (active === "Events") {
      list = images.filter((i) => i.cat === "Events" || i.cat === "Event");
    } else {
      list = images.filter((i) => i.cat === active);
    }

    if (typeConstraint !== "all") {
      list = list.filter((i) => (i.type || "image") === typeConstraint);
    }
    return list;
  }, [images, active, typeConstraint]);




  return (
    <>
      <style>{`
        .gallery-hero-section {
          padding-top: 140px;
          scroll-margin-top: 96px;
        }
        .gallery-typewriter-pill {
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
        .gallery-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
        .gallery-filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 40px;
        }
        .gallery-filter-btn {
          padding: 9px 20px;
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
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .gallery-filter-btn.active {
          background: linear-gradient(135deg, #D2190C 0%, #EA580C 100%) !important;
          color: #ffffff !important;
          border: 1px solid transparent !important;
          box-shadow: 0 6px 18px -2px rgba(210, 25, 12, 0.35) !important;
        }
        .gallery-filter-btn:not(.active):hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
          transform: translateY(-1px);
        }
        .gallery-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .gallery-hero-section {
            padding-top: 138px !important;
          }
          .gallery-hero-header {
            margin-bottom: 16px !important;
          }
          .gallery-hero-header h2 {
            font-size: clamp(1.5rem, 5.5vw, 1.85rem) !important;
            margin-bottom: 10px !important;
          }
          .gallery-hero-header p {
            font-size: 0.9rem !important;
            line-height: 1.6 !important;
          }
          .gallery-typewriter-pill {
            font-size: 0.78rem !important;
            padding: 6px 14px !important;
            gap: 6px !important;
          }
          .gallery-typewriter-container {
            margin-bottom: 22px !important;
          }
          .gallery-filter-bar {
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
          .gallery-filter-bar::-webkit-scrollbar {
            display: none;
          }
          .gallery-filter-btn {
            flex: 0 0 auto !important;
            padding: 8px 16px !important;
            font-size: 0.78rem !important;
            border-radius: 999px !important;
          }
          .gallery-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
          }
        }
      `}</style>

      <section className="section-pad gallery-hero-section hero" id="gallery-grid" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <div className="gallery-hero-header" style={{ textAlign: "center", maxWidth: 860, margin: "0 auto 20px" }}>
            <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Section 01</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
              Videos &amp; Authentic Photo Gallery
            </h2>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>
              Archival photography and community video documentation from forest rights claims, Gram Sabha assemblies, women's cooperatives, solar installations and disaster relief — shared with community consent.
            </p>
          </div>

          <div className="gallery-typewriter-container" style={{ display: "flex", justifyContent: "center", marginBottom: 34 }}>
            <div className="gallery-typewriter-pill">
              <span className="gallery-pulse-dot" />
              <AnimatedTypewriter
                prefix="Archival Spotlight: "
                prefixColor="#475569"
                highlightColor="#D2190C"
                words={[
                  "Forest Rights Claims & Gram Sabha Assemblies",
                  "Antyodaya Women Fisheries Cooperatives",
                  "Off-Grid Hill Habitation Solar Street Poles",
                  "Godavari Basin Emergency Boat Rescues",
                  "Joyful Learning Centres & School Kits"
                ]}
                typingSpeed={55}
                deletingSpeed={30}
                pauseTime={2000}
              />
            </div>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="gallery-filter-bar">
            {categories.map((c) => {
              const label =
                c === "All"
                  ? `All (${images.length})`
                  : c === "Photos"
                  ? `Photos (${photoCount})`
                  : c === "Videos"
                  ? `Videos (${videoCount})`
                  : c === "Events"
                  ? `Events (${eventsCount})`
                  : c;

              const isActive = active === c;

              return (
                <button
                  key={c}
                  onClick={() => {
                    setActive(c);
                    setTypeConstraint("all");
                  }}
                  className={`gallery-filter-btn ${isActive ? "active" : ""}`}
                >
                  {c === "Videos" && videoCount > 0 ? <FaPlay size={9} style={{ marginRight: 4 }} /> : null}
                  {label}
                </button>
              );
            })}
          </div>

          {/* GRID — plain divs keep filtering instant; layout animation was forcing a full re-measure */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-light)" }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No media items found in "{active}".</p>
              <button
                onClick={() => setActive("All")}
                style={{
                  marginTop: 12,
                  padding: "8px 20px",
                  borderRadius: 20,
                  border: "none",
                  background: "var(--color-primary)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                View All Media
              </button>
            </div>
          ) : (
            <div className="gallery-cards-grid">
              {filtered.map((img, idx) => {
                const isVideo = img.type === "video";
                return (
                <div
                  key={img.id ? `gallery-${img.id}` : `${img.src || "media"}-${idx}`}
                  className={`gallery-tile${isVideo ? " gallery-video-tile" : ""}`}
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    aspectRatio: "4/3",
                    boxShadow: "var(--shadow-sm)",
                    background: "#000"
                  }}
                  onClick={() => setLightbox(img)}
                >
                  <GalleryTileMedia item={img} />
                  {isVideo ? (
                    <>
                      <span className="gallery-video-badge"><FaPlay size={8} /> Video</span>
                      <span className="gallery-play-orb" aria-hidden="true"><span><FaPlay size={16} /></span></span>
                    </>
                  ) : null}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: 18,
                      pointerEvents: "none"
                    }}
                  >
                    <span
                      style={{
                        alignSelf: "flex-start",
                        padding: "3px 10px",
                        background: isVideo ? "var(--logo-gold)" : "var(--color-primary)",
                        color: "white",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        marginBottom: 6
                      }}
                    >
                      {isVideo ? `Video · ${img.cat}` : img.cat}
                    </span>
                    <p style={{ color: "white", fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.3 }}>
                      {img.title}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
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
                <span>Photo Archive</span>
              </div>

              <h2 className="cta-title">
                Use Our Images <span className="cta-title-highlight">With Consent</span>
              </h2>

              <p className="cta-subtitle">
                Photographs show real community members in Fifth Scheduled Areas. Media, funders and partners can request high-resolution files and captions through the head office; faces of children are released only with guardian consent.
              </p>

              <div className="cta-actions">
                <Link to="/contact" className="cta-btn-donate">
                  <span>Request Images</span>
                  <span className="cta-donate-heart" aria-hidden="true"><FaHeart size={13} /></span>
                </Link>
                <Link to="/partner" className="cta-btn-volunteer">
                  <span>Partner With Us</span>
                  <FaArrowRight size={12} className="cta-btn-arrow" aria-hidden="true" />
                </Link>
              </div>

              <div className="cta-trust-strip">
                <div className="cta-trust-item">
                  <FaShieldAlt className="cta-trust-icon" aria-hidden="true" />
                  <span>Informed Community Consent</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaCheckCircle className="cta-trust-icon" aria-hidden="true" />
                  <span>Captions & Locality on Request</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaSearchPlus className="cta-trust-icon" aria-hidden="true" />
                  <span>Full Archive in Downloads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.95)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24
            }}
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "white",
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.2rem"
              }}
            >
              <FaTimes />
            </button>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{ maxWidth: 960, width: "100%", textAlign: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.type === "video" ? (
                lightbox.src && (lightbox.src.includes("youtube.com") || lightbox.src.includes("youtu.be")) ? (
                  <iframe
                    src={getEmbedUrl(lightbox.src)}
                    title={lightbox.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      maxHeight: "80vh",
                      border: "none",
                      borderRadius: 12,
                      background: "#000"
                    }}
                  />
                ) : (
                  <video
                    src={lightbox.src}
                    poster={lightbox.poster}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    style={{ width: "100%", borderRadius: 12, maxHeight: "80vh", background: "#000", objectFit: "contain" }}
                  />
                )
              ) : (
                <img
                  src={lightbox.src}
                  alt={lightbox.title}
                  decoding="async"
                  style={{ width: "100%", borderRadius: 12, maxHeight: "80vh", objectFit: "contain" }}
                />
              )}
              <p style={{ color: "white", marginTop: 16, fontWeight: 700, fontSize: "1.1rem" }}>
                {lightbox.title}
              </p>
              {lightbox.type === "video" ? (
                <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 6, fontSize: "0.8rem" }}>
                  Field reel · {lightbox.cat}
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
