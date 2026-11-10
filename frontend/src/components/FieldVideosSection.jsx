import React from "react";
import { motion } from "framer-motion";
import { FaVideo } from "react-icons/fa";

function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function isYouTubeUrl(url) {
  return /(?:youtube\.com|youtu\.be)/.test(url || "");
}

export default function FieldVideosSection({
  videos = [],
  title = "Field Videos & Video Reports",
  badge = "Field Videos",
  sectionStyle = {}
}) {
  if (!Array.isArray(videos) || videos.length === 0) return null;

  return (
    <section style={{ paddingTop: 20, paddingBottom: 80, background: "#ffffff", ...sectionStyle }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #E11D48 0%, #FB7185 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 8px 20px rgba(225,29,72,0.3)" }}>
            <FaVideo size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-dark)", margin: 0, letterSpacing: -0.5 }}>{title}</h3>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)", fontWeight: 600 }}>{videos.length} video{videos.length !== 1 ? "s" : ""} available</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {videos.map((vid, vIdx) => {
            const isYt = isYouTubeUrl(vid.url);
            const ytEmbedUrl = isYt ? getYouTubeEmbedUrl(vid.url) : "";

            return (
              <motion.div
                key={vIdx}
                whileHover={{ y: -6, boxShadow: "0 20px 35px -10px rgba(0,0,0,0.12)" }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ background: "#000000", position: "relative", width: "100%", aspectRatio: "16/9" }}>
                  {ytEmbedUrl ? (
                    <iframe
                      src={ytEmbedUrl}
                      title={vid.title || "Field Video"}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      src={vid.url}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", background: "#0b0f19" }}
                    />
                  )}
                </div>
                <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--color-dark)", margin: "0 0 6px", lineHeight: 1.35 }}>
                    {vid.title || `Field Video #${vIdx + 1}`}
                  </h4>
                  {vid.description && (
                    <p style={{ fontSize: "0.84rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                      {vid.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

