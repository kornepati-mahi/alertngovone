import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaFilePdf,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaAward,
  FaShieldAlt,
  FaStar,
  FaUsers,
  FaCrown,
  FaQuoteLeft,
  FaLandmark,
  FaCalendar,
  FaBalanceScale,
  FaLeaf,
  FaCheckCircle
} from "react-icons/fa";
import PdfViewerModal from "../components/PdfViewerModal";
import { fetchAboutPage, defaultAboutPages } from "../api/client";

const ICON_MAP = {
  FaLandmark,
  FaCalendar,
  FaMapMarkerAlt,
  FaUsers,
  FaAward,
  FaStar,
  FaShieldAlt,
  FaCrown,
  FaPhone,
  FaEnvelope,
  FaFilePdf,
  FaBalanceScale,
  FaLeaf,
  FaCheckCircle
};

export default function OrganizationalProfile() {
  const [selectedPdf, setSelectedPdf] = useState(null);

  const defaultOrgProfile = defaultAboutPages["organizational-profile"] || {
    badge: "Section 03",
    title: "Organizational Profile",
    subtitle: "Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention since 2004.",
    banner_image: null,
    content: {}
  };

  const getLocalOrgProfileData = () => {
    try {
      const local = localStorage.getItem("alertngo_about_pages");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed["organizational-profile"]) {
          return {
            ...defaultOrgProfile,
            ...parsed["organizational-profile"],
            content: {
              ...(defaultOrgProfile.content || {}),
              ...(parsed["organizational-profile"].content || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn("Failed to load local org profile data", e);
    }
    return defaultOrgProfile;
  };

  const [pageData, setPageData] = useState(getLocalOrgProfileData);

  useEffect(() => {
    let mounted = true;
    const loadFromApi = async () => {
      try {
        const res = await fetchAboutPage("organizational-profile");
        if (mounted && res) {
          const item = res.data || res;
          if (item && item.slug === "organizational-profile") {
            setPageData((prev) => ({
              ...prev,
              ...item,
              content: {
                ...(defaultOrgProfile.content || {}),
                ...(item.content || item.content_json ? (typeof item.content === 'object' ? item.content : JSON.parse(item.content_json || '{}')) : {})
              }
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch org profile from API, using fallback", err);
      }
    };

    loadFromApi();

    const handleUpdate = () => {
      setPageData(getLocalOrgProfileData());
      loadFromApi();
    };

    window.addEventListener("alertngo_about_pages_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("alertngo_about_pages_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const content = pageData?.content || {};
  const infoCards = Array.isArray(content.info_cards) && content.info_cards.length > 0
    ? content.info_cards
    : (defaultOrgProfile.content?.info_cards || []);

  const accreditationsCards = Array.isArray(content.accreditations_cards) && content.accreditations_cards.length > 0
    ? content.accreditations_cards
    : (defaultOrgProfile.content?.accreditations_cards || []);

  const renderIcon = (iconName, color, size = 24) => {
    const IconComp = ICON_MAP[iconName] || FaLandmark;
    return <IconComp size={size} color={color || "#003190"} />;
  };

  const profilePdfUrl = content.profile_pdf || "/uploads/Organizational-Profile-of-ALERT.pdf";
  const fieldImgUrl = content.field_image || "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg";

  return (
    <>
      {/* ==================== HERO SECTION ==================== */}
      <section
        id="organizational-profile"
        style={{
          paddingTop: 160,
          paddingBottom: 0,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%)"
        }}
      >
        {/* Background decoration */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -10, left: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(210, 25, 12, 0.06), transparent 70%)", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: -10, right: -10, width: 600, height: 600, background: "radial-gradient(circle, rgba(0, 49, 144, 0.05), transparent 70%)", borderRadius: "50%" }}></div>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 60px" }}
          >
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
              {pageData.badge || "Section 03"}
            </span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "var(--color-dark)", marginBottom: 20, lineHeight: 1.15 }}>
              {pageData.title || "Organizational Profile"}
            </h1>
            <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, fontSize: "1.1rem", margin: 0 }}>
              {pageData.subtitle || "Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention since 2004."}
            </p>
          </motion.div>

          {/* Optional Hero Banner Image */}
          {pageData.banner_image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ maxWidth: 880, margin: "0 auto 50px", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            >
              <img
                src={pageData.banner_image}
                alt={pageData.title || "Organizational Profile"}
                style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </motion.div>
          )}

          {/* ==================== ORG INFO CARDS ==================== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 24,
              marginBottom: 90
            }}
          >
            {infoCards.map((item, i) => {
              const accentColor = item.color || "#003190";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  style={{
                    background: "linear-gradient(145deg, #ffffff 0%, #fdfdff 100%)",
                    border: "1px solid #f1f5f9",
                    borderRadius: 24,
                    padding: 32,
                    textAlign: "center",
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "all 0.3s ease"
                  }}
                  whileHover={{ y: -6, boxShadow: "0 30px 60px -15px rgba(0,0,0,0.12)", borderColor: accentColor }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accentColor}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: accentColor }}>
                    {renderIcon(item.icon, accentColor)}
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--color-dark)", fontSize: "0.8rem", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--color-dark)", fontWeight: 700, marginBottom: item.subtitle ? 4 : 0, lineHeight: 1.3 }}>
                    {item.value}
                  </div>
                  {item.subtitle && (
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)", fontWeight: 600 }}>
                      {item.subtitle}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* ==================== ABOUT ALERT SECTION ==================== */}
          <section style={{ paddingTop: 0, paddingBottom: 90 }}>
            <div className="container">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 36, alignItems: "center", marginBottom: 60 }}>
                {/* Text content */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.7 }}
                >
                  <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
                    {content.about_badge || "Who We Are"}
                  </span>
                  <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "var(--color-dark)", marginBottom: 20, lineHeight: 1.3 }}>
                    {content.about_heading || "Association for Land and Livelihood, Environment, Research and Training"}
                  </h2>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, fontSize: "0.98rem", marginBottom: 20 }}>
                    {content.about_p1 || "ALERT, established in 2004 under the Societies Registration Act, is headquartered in Vijayawada, Andhra Pradesh. Led by founder-director YL Jayaraj, who brings 47 years of experience in grass-roots human rights and community empowerment, ALERT specializes in supporting marginalized communities in the Fifth Scheduled Areas."}
                  </p>
                  <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, fontSize: "0.98rem", marginBottom: 24 }}>
                    {content.about_p2 || "Our mandate encompasses affirmative legislation enforcement, the Forest Rights Act (RoFR 2006), the PESA Act 1996, Land Transfer Regulation 1 of 1970, and fair rehabilitation for communities displaced by mega irrigation projects like Polavaram."}
                  </p>
                  
                  {profilePdfUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedPdf({
                        file: profilePdfUrl,
                        title: "Organizational Profile of ALERT",
                        meta: "Official Society Record • 20-Year Dossier"
                      })}
                      className="btn-primary btn-responsive-pdf"
                    >
                      <FaFilePdf size={13} /> {content.profile_pdf_label || "Download Official Profile PDF"}
                    </button>
                  )}
                </motion.div>

                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  style={{ position: "relative", width: "100%", height: 340, overflow: "hidden", borderRadius: 24, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.15)" }}
                >
                  <img
                    src={fieldImgUrl}
                    alt={content.about_heading || "ALERT Community Field Work"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent 0%, rgba(0,0,0,0.75) 100%)", padding: 24, borderRadius: "0 0 24px 24px" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#F5A000", marginBottom: 4 }}>
                      {content.field_tag || "ALERT Field Operations"}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "white", fontWeight: 600 }}>
                      {content.field_caption || "Empowering Adivasi Communities in Andhra Pradesh"}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ==================== LEGAL ACCREDITATIONS ==================== */}
          <section style={{ paddingTop: 80, paddingBottom: 40, background: "#ffffff" }}>
            <div className="container">
              <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 48px" }}>
                <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
                  {content.accreditations_badge || "Statutory Mandate"}
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "var(--color-dark)", marginBottom: 16 }}>
                  {content.accreditations_title || "Legal Accreditations & Governance"}
                </h2>
                <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "1.05rem", margin: 0 }}>
                  {content.accreditations_subtitle || "ALERT is governed by formal statutes and holds key registrations that ensure transparency, accountability, and legal compliance in all our work."}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
                {accreditationsCards.map((item, i) => {
                  const cardColor = item.color || "#003190";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      style={{ background: "#ffffff", padding: 26, borderRadius: 20, boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", gap: 14, transition: "all 0.3s ease" }}
                      whileHover={{ y: -6, boxShadow: "var(--shadow-md)", borderColor: cardColor }}
                    >
                      <div style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: 14, background: `${cardColor}15`, display: "flex", alignItems: "center", justifyContent: "center", color: cardColor, overflow: "hidden" }}>
                        {renderIcon(item.icon, cardColor)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: 4, fontSize: "0.95rem" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--color-text-light)", lineHeight: 1.5 }}>
                          {item.desc}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </section>

      {selectedPdf && (
        <PdfViewerModal
          file={selectedPdf.file}
          title={selectedPdf.title}
          meta={selectedPdf.meta}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </>
  );
}
