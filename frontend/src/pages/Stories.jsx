import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHeart, FaShieldAlt, FaCheckCircle, FaBookOpen, FaMapMarkerAlt, FaVideo, FaPlay } from "react-icons/fa";
import { fetchStories } from "../api/client";

function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : url;
}

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/i.test(url || "");
}

const sectionDividerStyle = { borderTop: "1px solid #e2e8f0", marginTop: 64, paddingTop: 64, scrollMarginTop: 165 };

const sectionHeading = (badgeText, title, sub) => (
  <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 44px" }}>
    <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>{badgeText}</span>
    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
      {title}
    </h2>
    <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>{sub}</p>
  </div>
);

const featuredStories = [
  {
    img: "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
    tag: "Forest Rights",
    place: "Maredumilli Mandal, ASR District",
    title: "The resolution that turned a forest into a legal record",
    body: "For years the hamlet's bamboo and tendu collection was treated as encroachment. A Gram Sabha resolution, a resource map drawn village by village, and a community forest rights claim changed that: the forest the elders had guarded was finally written into the record as theirs.",
    outcome: "CFR claim filed with Gram Sabha endorsement"
  },
  {
    img: "/uploads/coastal-krishna-fishing.jpg",
    tag: "Women Cooperatives",
    place: "Machilipatnam Mandal, Krishna District",
    title: "Matsya Mithra: from auction floor to co-operative ledger",
    body: "Yenadi fisherwomen once sold the morning catch at whatever the middleman offered. Organised into savings groups and registered cooperatives, they now fix their own price, run cold storage links, and lend from their own revolving fund instead of the moneylender's.",
    outcome: "Federation of 3,500+ members across 6 mandals"
  },
  {
    img: "/uploads/l-1.jpg",
    tag: "Child Rights",
    place: "Chinturu ITDA, Godavari Agency",
    title: "A classroom that begins in Koya",
    body: "Children who stopped at the first difficult sentence were not failing school — school was arriving in a language they had never heard. Joyful learning centres started lessons in the mother tongue, moved on to Telugu, and carried tribal folk content into the syllabus.",
    outcome: "Mother-tongue learning centres in agency hamlets"
  },
  {
    img: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
    tag: "Clean Energy",
    place: "Devipatnam Mandal, Godavari Gorge",
    title: "The first evening the hamlet kept its lights on",
    body: "Kerosene meant a lamp that smoked, a bill that ate a week's income, and children who could not study after dark. Solar home lighting and a street pole at the junction changed the timetable: the shop stayed open, the children finished their homework.",
    outcome: "75+ off-grid hamlets with solar lighting"
  },
  {
    img: "/uploads/all2023.jpeg",
    tag: "Disaster Relief",
    place: "Kunavaram Mandal, Godavari Basin",
    title: "Boats before the water reached the steps",
    body: "When the Godavari rose, the first help was not a government truck — it was neighbours with boats, moving families, grain and livestock to the relief camp. ALERT's field teams ran ration, sanitary kits and winter blankets alongside post-flood disinfection.",
    outcome: "Rescue, ration and rehabilitation response 2020–2023"
  },
  {
    img: "/uploads/ippuru2-1-1024x461-640x480.jpeg",
    tag: "Polavaram LA & R&R",
    place: "Polavaram Mandal, Eluru District",
    title: "Counting every family the award list forgot",
    body: "Project displacement is decided in columns of a register. Household surveys and social audits in the submergence belt put names, land parcels and adult-youth entitlements back on paper — the evidence that later became representations and writ petitions.",
    outcome: "R&R social audits across the 371-village belt"
  }
];

const shortStories = [
  {
    tag: "Governance",
    place: "Rampachodavaram",
    title: "A panchayat that now keeps its own minutes",
    body: "Training in statutory meetings, record keeping and PESA powers meant the difference between a Gram Sabha that was informed and one that decided."
  },
  {
    tag: "Land Rights",
    place: "Buttayigudem",
    title: "Land sold under a forged bond, recovered on paper",
    body: "Alienated tribal land was traced through revenue records, challenged under the Land Transfer Regulation, and restored to the family that had lost it."
  },
  {
    tag: "Livelihoods",
    place: "Ramavarampadu",
    title: "Seeds the village keeps, not buys",
    body: "A community seed bank of native millets and pulses returns every season, with farmer stewards maintaining germination and variety."
  },
  {
    tag: "Identity",
    place: "Koduru",
    title: "Aadhaar, ration card, voter ID — in one camp day",
    body: "Nomadic families excluded from the welfare net were documented in a civil rights camp, opening pensions, ration and school enrolment."
  }
];

const programmeLinks = [
  { label: "Forest Rights (RoFR & LTR)", cat: "Forest Rights" },
  { label: "PESA & Self-Governance", cat: "Governance" },
  { label: "Polavaram LA & R&R", cat: "Polavaram PIP" },
  { label: "Antyodaya Women Cooperatives", cat: "Women Cooperatives" },
  { label: "Child Interventions & Bare Acts", cat: "Child Rights" },
  { label: "Flood Relief Operations", cat: "Disaster Relief" },
  { label: "Solar & Clean Energy", cat: "Clean Energy" },
  { label: "Indigenous Millets & Seed Banks", cat: "Agriculture" }
];

const STORIES_SETTINGS_CACHE_KEY = "alertngo_stories_settings";

const defaultStoriesSettings = {
  s1_badge: "Section 01",
  s1_title: "Field Stories",
  s1_subtitle: "Compiled from ALERT's programme records, Gram Sabha resolutions and case files across the Fifth Scheduled Areas and the coastal Krishna belt. Identifying details of community members are withheld.",

  s2_badge: "Section 02",
  s2_title: "More From the Field",
  s2_subtitle: "Short notes from mandal offices and village visits — the smaller administrative wins that make the larger ones possible.",

  s3_badge: "Section 03",
  s3_title: "Stories by Programme",
  s3_subtitle: "Every story belongs to one of ALERT's eight impact pillars — open the pillar to see the interventions behind it.",
  s3_programme_links: programmeLinks,

  cta_badge: "Next Story",
  cta_title: "Help Write the Next Chapter",
  cta_title_highlight: "Next Chapter",
  cta_subtitle: "Every patta, seed bank, street pole and savings ledger in these stories was funded by someone who read about work like this. Support the field teams who document, file and follow up.",
  cta_donate_label: "Donate Now",
  cta_donate_url: "/donate",
  cta_volunteer_label: "Volunteer with Us",
  cta_volunteer_url: "/contact",
  cta_trust_items: [
    "12A & 80G Certified",
    "FCRA Registered",
    "Reg. No. 307/2004"
  ]
};

export default function Stories() {
  const [featuredList, setFeaturedList] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_stories_featured");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const cachedAll = localStorage.getItem("alertngo_stories_all");
      if (cachedAll) {
        const parsedAll = JSON.parse(cachedAll);
        if (Array.isArray(parsedAll)) {
          const f = parsedAll.filter((s) => s.story_type !== "field_note" && (s.is_active === 1 || s.is_active === true || s.is_active === "1"));
          if (f.length > 0) return f;
        }
      }
    } catch {}
    return featuredStories;
  });

  const [fieldNotesList, setFieldNotesList] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_stories_field_notes");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const cachedAll = localStorage.getItem("alertngo_stories_all");
      if (cachedAll) {
        const parsedAll = JSON.parse(cachedAll);
        if (Array.isArray(parsedAll)) {
          const fn = parsedAll.filter((s) => s.story_type === "field_note" && (s.is_active === 1 || s.is_active === true || s.is_active === "1"));
          if (fn.length > 0) return fn;
        }
      }
    } catch {}
    return shortStories;
  });

  const [pageSettings, setPageSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(STORIES_SETTINGS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          return {
            ...defaultStoriesSettings,
            ...parsed,
            s3_programme_links: Array.isArray(parsed.s3_programme_links)
              ? parsed.s3_programme_links
              : (typeof parsed.s3_programme_links === "string" ? JSON.parse(parsed.s3_programme_links) : defaultStoriesSettings.s3_programme_links),
            cta_trust_items: Array.isArray(parsed.cta_trust_items)
              ? parsed.cta_trust_items
              : (typeof parsed.cta_trust_items === "string" ? JSON.parse(parsed.cta_trust_items) : defaultStoriesSettings.cta_trust_items)
          };
        }
      }
    } catch {}
    return defaultStoriesSettings;
  });

  const loadData = () => {
    fetchStories().then((res) => {
      if (res) {
        const payload = (res.data && typeof res.data === "object") ? res.data : res;
        const feat = payload.featured || res.featured;
        const notes = payload.field_notes || res.field_notes;
        const sett = payload.settings || res.settings;

        if (Array.isArray(feat) && feat.length > 0) {
          setFeaturedList(feat);
          try {
            localStorage.setItem("alertngo_stories_featured", JSON.stringify(feat));
          } catch {}
        }
        if (Array.isArray(notes) && notes.length > 0) {
          setFieldNotesList(notes);
          try {
            localStorage.setItem("alertngo_stories_field_notes", JSON.stringify(notes));
          } catch {}
        }
        if (sett && typeof sett === "object") {
          const merged = {
            ...defaultStoriesSettings,
            ...sett,
            s3_programme_links: Array.isArray(sett.s3_programme_links)
              ? sett.s3_programme_links
              : (typeof sett.s3_programme_links === "string" ? JSON.parse(sett.s3_programme_links) : defaultStoriesSettings.s3_programme_links),
            cta_trust_items: Array.isArray(sett.cta_trust_items)
              ? sett.cta_trust_items
              : (typeof sett.cta_trust_items === "string" ? JSON.parse(sett.cta_trust_items) : defaultStoriesSettings.cta_trust_items)
          };
          setPageSettings(merged);
          try {
            localStorage.setItem(STORIES_SETTINGS_CACHE_KEY, JSON.stringify(merged));
          } catch {}
        }
      }
    });
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("alertngo_stories_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("alertngo_stories_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Format CTA title highlight if matched
  const renderCtaTitle = () => {
    const rawTitle = pageSettings.cta_title || "Help Write the Next Chapter";
    const highlight = pageSettings.cta_title_highlight || "Next Chapter";
    if (highlight && rawTitle.includes(highlight)) {
      const parts = rawTitle.split(highlight);
      return (
        <>
          {parts[0]}
          <span className="cta-title-highlight">{highlight}</span>
          {parts.slice(1).join(highlight)}
        </>
      );
    }
    return rawTitle;
  };

  const currentProgrammeLinks = Array.isArray(pageSettings.s3_programme_links) && pageSettings.s3_programme_links.length > 0
    ? pageSettings.s3_programme_links
    : programmeLinks;

  const currentTrustItems = Array.isArray(pageSettings.cta_trust_items) && pageSettings.cta_trust_items.length > 0
    ? pageSettings.cta_trust_items
    : ["12A & 80G Certified", "FCRA Registered", "Reg. No. 307/2004"];

  return (
    <>
      <section className="section-pad" id="featured-stories" style={{ paddingTop: 150, scrollMarginTop: 96 }}>
        <div className="container">
          {sectionHeading(
            pageSettings.s1_badge || "Section 01",
            pageSettings.s1_title || "Field Stories",
            pageSettings.s1_subtitle || "Compiled from ALERT's programme records, Gram Sabha resolutions and case files across the Fifth Scheduled Areas and the coastal Krishna belt. Identifying details of community members are withheld."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
            {featuredList.map((s, idx) => {
              const isVideo = s.media_type === "video" || !!s.video_url;
              return (
                <article
                  key={s.id || s.title || idx}
                  className="story-card"
                  style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}
                >
                  <div style={{ position: "relative", height: 220, overflow: "hidden", background: "#061842" }}>
                    {isVideo ? (
                      isYouTubeUrl(s.video_url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(s.video_url)}
                          title={s.title}
                          style={{ width: "100%", height: "100%", border: "none" }}
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={s.video_url}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      )
                    ) : (
                      <>
                        <img src={s.img} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" decoding="async" />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,24,66,0.72), transparent 62%)" }} />
                      </>
                    )}
                    <span style={{ position: "absolute", top: 14, left: 14, padding: "4px 12px", background: "var(--color-primary)", color: "white", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, zIndex: 2 }}>
                      {s.tag}
                    </span>
                    {isVideo && (
                      <span style={{ position: "absolute", top: 14, right: 14, padding: "4px 10px", background: "rgba(220, 38, 38, 0.9)", color: "white", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700, zIndex: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        <FaVideo size={10} /> Video Story
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.74rem", fontWeight: 700, color: "var(--color-text-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      <FaMapMarkerAlt size={10} style={{ color: "var(--logo-green)" }} /> {s.place}
                    </span>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1.35 }}>{s.title}</h3>
                    <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.7 }}>{s.body}</p>
                    {s.outcome && (
                      <span style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.8rem", fontWeight: 700, color: "var(--logo-green)" }}>
                        <FaCheckCircle size={12} /> {s.outcome}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 02 — SHORT FIELD NOTES */}
      <section className="section-pad" id="field-notes" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            pageSettings.s2_badge || "Section 02",
            pageSettings.s2_title || "More From the Field",
            pageSettings.s2_subtitle || "Short notes from mandal offices and village visits — the smaller administrative wins that make the larger ones possible."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {fieldNotesList.map((s, idx) => (
              <div key={s.id || s.title || idx} style={{ background: "white", padding: 22, borderRadius: 14, boxShadow: "var(--shadow-sm)", borderLeft: "4px solid var(--color-primary)", display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {s.tag} · {s.place}
                </span>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1.4 }}>{s.title}</h3>
                <p style={{ fontSize: "0.86rem", color: "var(--color-text-light)", lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 03 — STORIES BY PROGRAMME */}
      <section className="section-pad" id="by-programme" style={sectionDividerStyle}>
        <div className="container">
          {sectionHeading(
            pageSettings.s3_badge || "Section 03",
            pageSettings.s3_title || "Stories by Programme",
            pageSettings.s3_subtitle || "Every story belongs to one of ALERT's eight impact pillars — open the pillar to see the interventions behind it."
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {currentProgrammeLinks.map((p, idx) => (
              <Link
                key={p.cat || idx}
                to={`/programs?cat=${encodeURIComponent(p.cat || "")}`}
                className="story-pill"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "14px 18px", background: "white", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: "0.86rem", fontWeight: 700, color: "var(--color-dark)" }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                  <FaBookOpen size={12} style={{ color: "var(--logo-gold)" }} /> {p.label}
                </span>
                <FaArrowRight size={11} style={{ color: "var(--color-primary)" }} />
              </Link>
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
                <span>{pageSettings.cta_badge || "Next Story"}</span>
              </div>

              <h2 className="cta-title">
                {renderCtaTitle()}
              </h2>

              <p className="cta-subtitle">
                {pageSettings.cta_subtitle || "Every patta, seed bank, street pole and savings ledger in these stories was funded by someone who read about work like this. Support the field teams who document, file and follow up."}
              </p>

              <div className="cta-actions">
                <Link to={pageSettings.cta_donate_url || "/donate"} className="cta-btn-donate">
                  <span>{pageSettings.cta_donate_label || "Donate Now"}</span>
                  <span className="cta-donate-heart" aria-hidden="true"><FaHeart size={13} /></span>
                </Link>
                <Link to={pageSettings.cta_volunteer_url || "/contact"} className="cta-btn-volunteer">
                  <span>{pageSettings.cta_volunteer_label || "Volunteer with Us"}</span>
                  <FaArrowRight size={12} className="cta-btn-arrow" aria-hidden="true" />
                </Link>
              </div>

              {currentTrustItems && currentTrustItems.length > 0 && (
                <div className="cta-trust-strip">
                  {currentTrustItems.map((item, idx) => (
                    <Fragment key={idx}>
                      {idx > 0 && <span className="cta-trust-dot" aria-hidden="true">•</span>}
                      <div className="cta-trust-item">
                        {idx % 3 === 0 ? (
                          <FaShieldAlt className="cta-trust-icon" aria-hidden="true" />
                        ) : idx % 3 === 1 ? (
                          <FaCheckCircle className="cta-trust-icon" aria-hidden="true" />
                        ) : (
                          <FaBookOpen className="cta-trust-icon" aria-hidden="true" />
                        )}
                        <span>{item}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
