import { useState, useEffect, useCallback } from "react";
import { fetchOverviewPrograms } from "../api/client";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { FaArrowRight, FaHeart, FaShieldAlt, FaCheckCircle, FaAward, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from "react-icons/fa";

const programs = [
  /* ---------- Forest Rights ---------- */
  {
    img: "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg",
    cat: "Forest Rights",
    title: "RoFR & Tribal Land Advocacy",
    desc: "Securing individual (IFR) and community forest rights (CFR) for Adivasi families under the Forest Rights Act 2006, protecting over 15,000+ acres of ancestral forests.",
    details: ["IFR & CFR Claims Documentation", "Gram Sabha Resolution Filing", "GPS Boundary Demarcation", "Title Deed (Patta) Distribution Support"]
  },
  {
    img: "/uploads/Kotarugommu-18-9-21-1-rotated-1-1024x461-640x480.jpeg",
    cat: "Forest Rights",
    title: "Community Forest Resource (CFR) Mapping",
    desc: "Gram Sabha resource committees in the Rampachodavaram and Chinturu ITDA tracts map and document community forest use, from shifting cultivation plots to bamboo and minor forest produce collection grounds.",
    details: ["Village Resource Mapping", "NTFP & Bamboo Harvest Records", "Sacred Grove (Punya Vanalu) Protection", "CFR Claim Drafting Support"]
  },
  {
    img: "/uploads/tammileru-10-8-21-768x346-1-640x480.jpeg",
    cat: "Forest Rights",
    title: "Land Transfer Regulation 1 of 1970 Restitution",
    desc: "Recovery of tribal land illegally alienated to non-tribals in the K.R. Puram ITDA belt, through revenue petitions, mutation follow-up and litigation support for dispossessed families.",
    details: ["Alienation Case Survey", "Revenue & Mutation Petitions", "Patta Restoration Follow-Up", "Victim Family Legal Aid"]
  },
  {
    img: "/uploads/PHOTO-2023-02-15-19-20-55_1-2_(1).jpg",
    cat: "Forest Rights",
    title: "Forest Rights Act Literacy Camps",
    desc: "Hamlet-level legal literacy sessions that explain the IFR and CFR claim process, Forest Rights Committee formation, and the evidence required before the Sub-Divisional Level Committee.",
    details: ["Bare Act Village Readings", "Claim Helpdesk Assistance", "Forest Rights Committee Formation", "SDLC & DLC Hearing Support"]
  },

  /* ---------- Governance ---------- */
  {
    img: "/uploads/PHOTO-2023-02-15-19-20-56.jpg",
    cat: "Governance",
    title: "Self-Governance & PESA Act 1996",
    desc: "Mobilizing Adivasi hamlets to exercise sovereign powers vested in the Gram Sabha under PESA, curbing illegal land alienation and defending customary heritage.",
    details: ["Gram Sabha Capacity Training", "PESA Rules Enforcement", "Dispute Resolution Through Tribal Elders", "Natural Resource Governance"]
  },
  {
    img: "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg",
    cat: "Governance",
    title: "Gram Sabha Panchayat & Planning Training",
    desc: "Training elected Gram Sabha Panchayats to prepare village development plans, assert minor-water-forest and land entitlement powers, and hold statutory meetings in the mother tongue.",
    details: ["Annual Village Planning", "PESA Powers Orientation", "Minutes & Record Keeping", "Women Councillor Mentoring"]
  },
  {
    img: "/uploads/PHOTO-2022-10-20-17-25-30.jpg",
    cat: "Governance",
    title: "Elder Council Dispute Resolution",
    desc: "Customary justice forums convened by tribal elders and Gram Sabhas settle land, family and resource disputes locally, reducing case pendency and court costs for Adivasi families.",
    details: ["Elder Council Convening", "Customary Law Documentation", "Land Dispute Mediation", "Referral To Legal Aid Cell"]
  },
  {
    img: "/uploads/PHOTO-2022-10-20-17-25-31.jpg",
    cat: "Governance",
    title: "RTI & Departmental Convergence Monitoring",
    desc: "Using the Right to Information Act and ITDA review meetings to track sanctioned works, welfare scheme entitlements and service delivery in agency mandals.",
    details: ["RTI Representations", "ITDA Convergence Reviews", "Scheme Utilisation Audits", "Grievance Escalation Tracking"]
  },

  /* ---------- Polavaram PIP ---------- */
  {
    img: "/uploads/submergence-area-map-1.jpg",
    cat: "Polavaram PIP",
    title: "Land Acquisition (LA) & R&R Advocacy",
    desc: "Defending rights of 1,05,000+ Project Displaced Families (PDFs) facing displacement from the Polavaram National Project under the RFCTLARR Act 2013.",
    details: ["Fair Market Land Valuation", "Adult Youth (18+) Package Claims", "Colony Amenities Monitoring", "High Court Litigation Support"]
  },
  {
    img: "/uploads/ippuru2-1-1024x461-640x480.jpeg",
    cat: "Polavaram PIP",
    title: "R&R Social Audit of Submerged Villages",
    desc: "Independent community social audits across the 371 submergence-area villages of the tri-ITDA belt, verifying beneficiary lists, compensation records and resettlement entitlements.",
    details: ["Household Survey Verification", "Beneficiary List Audits", "Village-Level Social Audit Meetings", "Audit Findings Submissions"]
  },
  {
    img: "/uploads/larr2013.png",
    cat: "Polavaram PIP",
    title: "RFCTLARR Act 2013 Entitlement Tracking",
    desc: "Section-by-section tracking of land-for-land and house-for-house entitlements, homestead plots, amenities and rehabilitation grants for project-affected families.",
    details: ["Entitlement Register Maintenance", "Land-for-Land Verification", "Housing Plot Allocation Review", "Resettlement Colony Amenities"]
  },
  {
    img: "/uploads/egwg-colonies-1.png",
    cat: "Polavaram PIP",
    title: "PAF Grievance Redressal & Litigation Support",
    desc: "Grievance camps and court support for project-affected families whose awards, pensions and colony works remain unresolved, including documentation for writ petitions.",
    details: ["PAF Grievance Camps", "Award Objection Filing", "Rehabilitation Commissioner Representations", "Writ Petition Documentation"]
  },

  /* ---------- Women Cooperatives ---------- */
  {
    img: "/uploads/PHOTO-2023-02-15-19-21-00_1.jpg",
    cat: "Women Cooperatives",
    title: "Antyodaya: Matsya Mithra Women Federation",
    desc: "Empowering 3,500+ Yenadi tribal fisherwomen across 6 coastal mandals of Krishna District through sustainable fisheries, cold storage, and micro-credit.",
    details: ["Fisheries Cooperatives Management", "Micro-Savings & SHG Linkages", "Direct Market Fish Processing", "Leadership & Gender Justice"]
  },
  {
    img: "/uploads/coastal-krishna-fishing.jpg",
    cat: "Women Cooperatives",
    title: "Yenadi House-Site Pattas & Identity Documents",
    desc: "Securing permanent house-site pattas and civil documentation for nomadic Yenadi hamlets in Machilipatnam, Bantumilli and Koduru mandals so families can claim ration, pension and school access.",
    details: ["House-Site Patta Filing", "Aadhaar & Voter Enrolment", "Ration Card Linking", "Pension Scheme Access"]
  },
  {
    img: "/uploads/reels/reel-4-women.jpg",
    cat: "Women Cooperatives",
    title: "Micro-Savings & Revolving Credit Groups",
    desc: "Savings collectives run by Matsya Mithra members replace moneylender debt with internal revolving loans, steady repayments and financial literacy for coastal households.",
    details: ["Weekly Savings Meetings", "Revolving Loan Corpus", "Debt-Free Livelihood Support", "Book-Keeping Training"]
  },
  {
    img: "/uploads/WhatsApp-Image-2021-07-24-at-8.04.03-PM-1-768x1024.jpeg",
    cat: "Women Cooperatives",
    title: "Estuarine Fishing Rights & Mangrove Care",
    desc: "Women-led committees in the Kruthivennu and Nagayalanka creeks protect artisanal fishing zones, ban destructive fine-mesh trawling and restore mangrove tidal barriers.",
    details: ["Artisanal Zone Protection", "Mangrove Regeneration Drives", "Breeding Season Norms", "Cyclone Shelter Preparedness"]
  },

  /* ---------- Child Rights ---------- */
  {
    img: "/uploads/Children-reieved-shoes-1.jpg",
    cat: "Child Rights",
    title: "Child Interventions & Bare Acts",
    desc: "Ensuring every Adivasi child enjoys statutory protection under RTE, Juvenile Justice, and POCSO Acts, supporting bilingual education and nutrition.",
    details: ["Anti-Child Labor & Trafficking Vigilance", "Mother-Tongue Bilingual Learning", "Malnutrition Mitigation in Ashram Schools", "Child Bare Acts Community Workshops"]
  },
  {
    img: "/uploads/reels/reel-2-learning.jpg",
    cat: "Child Rights",
    title: "Joyful Learning Centres in Agency Hamlets",
    desc: "Village learning centres that teach young children in Koya and Telugu mother tongues, with tribal folk content, play-based material and no corporal punishment.",
    details: ["Mother-Tongue Pedagogy", "Folk & Cultural Curricula", "Toy & Learning Material Kits", "Volunteer Teacher Support"]
  },
  {
    img: "/uploads/reels/reel-3-school-kits.jpg",
    cat: "Child Rights",
    title: "Digital Classrooms & School Support Kits",
    desc: "School kits, uniforms, footwear and digital learning equipment supplied to Adivasi children in ashram and village schools to curb dropouts in the Godavari belt.",
    details: ["Uniform & Footwear Support", "Digital Classroom Equipment", "Exam & Career Guidance", "Dropout Re-Enrolment Drives"]
  },
  {
    img: "/uploads/laptop1-640x480.jpeg",
    cat: "Child Rights",
    title: "Child Protection & Nutrition Watch",
    desc: "Community vigilance on child labour, trafficking and residential-school nutrition, with reporting pathways to Child Welfare Committees and district authorities.",
    details: ["Residential School Inspections", "Nutrition & Meal Monitoring", "Childline & CWC Linkages", "POCSO Awareness Sessions"]
  },

  /* ---------- Disaster Relief ---------- */
  {
    img: "/uploads/all2023.jpeg",
    cat: "Disaster Relief",
    title: "Flood Relief Measures (2020 – 2023)",
    desc: "Mobilizing emergency boat rescues, essential food provisions, sanitary supplies, and winter blankets for Godavari and Krishna river flood victims.",
    details: ["Boat Rescue & Evacuation Teams", "Ration & Medical Kit Distribution", "Post-Flood Sanitation & Water Purification", "Housing Rehabilitation Assistance"]
  },
  {
    img: "/uploads/f2023-1024x461-640x480.jpeg",
    cat: "Disaster Relief",
    title: "Godavari Gorge Rescue & Evacuation",
    desc: "Volunteer boat teams reach isolated riverside habitations in the Kunavaram and Devipatnam gorge belt during monsoon inundation, moving families to relief camps.",
    details: ["Community Boat Teams", "Isolated Hamlet Access", "Relief Camp Setup", "Livestock & Grain Shift Support"]
  },
  {
    img: "/uploads/m2023-1024x461-640x480.jpeg",
    cat: "Disaster Relief",
    title: "Winter Blanket & Health Drives",
    desc: "Blankets, warm clothing and basic medical checks for exposed hill hamlets during Eastern Ghats winter, when cold stress hits children and elders hardest.",
    details: ["Blanket Distribution", "Mobile Health Checks", "Elder & Child Care Kits", "Village Health Referrals"]
  },
  {
    img: "/uploads/all2023-1024x576-640x480.jpeg",
    cat: "Disaster Relief",
    title: "Post-Flood Sanitation & Safe Water",
    desc: "Disinfection, clean drinking water units and latrine restoration after Godavari and Krishna floods, plus rebuilding support for damaged houses.",
    details: ["Water Purification Units", "Village Disinfection Works", "Damaged House Repair", "Sanitary & Dignity Kits"]
  },

  /* ---------- Clean Energy ---------- */
  {
    img: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
    cat: "Clean Energy",
    title: "Community Solar & Green Energy",
    desc: "Providing decentralized clean solar home lighting systems and solar street poles to remote, un-electrified hill habitations across the Eastern Ghats.",
    details: ["Solar Street Pole Installations", "Portable Solar Lantern Distribution", "Local Youth Technician Training", "Zero-Carbon Rural Electrification"]
  },
  {
    img: "/uploads/WhatsApp-Image-2021-09-16-at-7.51.09-PM-1024x461.jpeg",
    cat: "Clean Energy",
    title: "Solar Home Lighting for Off-Grid Hamlets",
    desc: "Decentralized solar lighting systems installed in Godavari gorge hamlets cut off from the conventional grid, replacing kerosene lamps in Adivasi households.",
    details: ["Household Solar Kits", "Kerosene-Free Habitats", "Installation Site Survey", "Beneficiary Handover Training"]
  },
  {
    img: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.52-PM-461x1024.jpeg",
    cat: "Clean Energy",
    title: "Solar Street Poles & Water Units",
    desc: "Solar street lighting at village meeting points and schools improves night safety for women and children, alongside solar-assisted drinking water purification.",
    details: ["Village Lane Street Poles", "School & Path Lighting", "Solar Water Purification", "Community Maintenance Corpus"]
  },
  {
    img: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.57-PM-461x1024.jpeg",
    cat: "Clean Energy",
    title: "Tribal Youth Solar Technician Training",
    desc: "Local Adivasi youth are trained to service solar kits, replace batteries and maintain micro-grids, keeping repair work and income inside the village.",
    details: ["Panel & Battery Servicing", "Fault Diagnosis Modules", "Village Maintenance Teams", "Green Livelihood Linkages"]
  },

  /* ---------- Agriculture ---------- */
  {
    img: "/uploads/ramavarampadu_11-08-2021-1024x461-640x480.jpeg",
    cat: "Agriculture",
    title: "Indigenous Millets & Seed Banks",
    desc: "Reviving native heritage millet cultivation, bio-fertilizers, and community heirloom seed banks to guarantee food sovereignty and climate resilience.",
    details: ["Traditional Millet Cultivation", "Community Indigenous Seed Banks", "Chemical-Free Organic Farming", "Soil & Water Conservation Works"]
  },
  {
    img: "/uploads/WhatsApp-Image-2024-10-15-at-4.52.24-PM-640x480.jpeg",
    cat: "Agriculture",
    title: "Community Heirloom Seed Banks",
    desc: "Farmer-managed seed stores preserve native millet, pulse and oilseed varieties, distributed before each sowing season without cost to small and marginal growers.",
    details: ["Variety Selection & Storage", "Seed Exchange Festivals", "Farmer Steward Committees", "Germination & Viability Tests"]
  },
  {
    img: "/uploads/WhatsApp-Image-2024-09-18-at-1.46.51-PM-640x480.jpeg",
    cat: "Agriculture",
    title: "Natural Farming & Bio-Input Fields",
    desc: "Chemical-free plot demonstrations using farmyard inputs, composting and intercropping, so degraded agency slopes regain soil health and lower input costs.",
    details: ["Bio-Fertilizer Preparation", "Compost & Mulch Training", "Intercropping Models", "Pest Management Without Chemicals"]
  },
  {
    img: "/uploads/WhatsApp-Image-2024-10-05-at-11.38.49-AM-640x480.jpeg",
    cat: "Agriculture",
    title: "Water Conservation & Farm Ponds",
    desc: "Contour bunding, percolation tanks and farm ponds dug with Gram Sabha labour to hold monsoon runoff for dry-season millet and vegetable cultivation.",
    details: ["Farm Pond Construction", "Contour & Trench Binding", "Drip & Mica Irrigation Support", "Kitchen Garden Promotion"]
  }
];

const localProgramFor = (category) => {
  const key = (category || "").toLowerCase();
  const rules = [
    [/forest|advocacy|rights/, "Forest Rights"],
    [/women|livelihood|cooperative|antyodaya/, "Women Cooperatives"],
    [/child|education|school/, "Child Rights"],
    [/relief|disaster|flood/, "Disaster Relief"],
    [/energy|solar|environment|climate/, "Clean Energy"],
    [/agriculture|millet|seed|farm/, "Agriculture"],
    [/polavaram|land|r&r|resettle/, "Polavaram PIP"],
    [/governance|pesa|gram/, "Governance"],
  ];
  const hit = rules.find(([re]) => re.test(key));
  return (hit && programs.find((p) => p.cat === hit[1])) || programs[0];
};

const categoryOrder = [
  "Forest Rights",
  "Governance",
  "Polavaram PIP",
  "Women Cooperatives",
  "Child Rights",
  "Disaster Relief",
  "Clean Energy",
  "Agriculture"
];

const categoryMeta = {
  "Forest Rights": { sub: "Securing individual and community forest rights (RoFR 2006) for Adivasi families across the agency tracts." },
  "Governance": { sub: "Empowering Gram Sabhas with sovereign self-governance powers under PESA Act 1996." },
  "Polavaram PIP": { sub: "Defending the statutory rights of 1,05,000+ Project Displaced Families under the RFCTLARR Act 2013." },
  "Women Cooperatives": { sub: "3,500+ Yenadi fisherwomen organized into the Matsya Mithra cooperative federation." },
  "Child Rights": { sub: "Statutory protection, bilingual education, and nutrition for every Adivasi child." },
  "Disaster Relief": { sub: "Emergency rescue, relief, and rehabilitation for Godavari and Krishna flood-affected communities." },
  "Clean Energy": { sub: "Decentralized solar lighting for remote, un-electrified tribal habitations." },
  "Agriculture": { sub: "Heritage millet cultivation, indigenous seed banks, and food sovereignty for Adivasi farmers." }
};

// Reader-facing pillar titles (the wording previously used in the old navbar menu)
const categoryDisplayNames = {
  "Forest Rights": "Forest Rights (RoFR & LTR)",
  "Governance": "PESA & Self-Governance",
  "Polavaram PIP": "Polavaram LA & R&R",
  "Women Cooperatives": "Antyodaya Women Cooperatives",
  "Child Rights": "Child Interventions & Bare Acts",
  "Disaster Relief": "Flood Relief Operations",
  "Clean Energy": "Solar & Clean Energy",
  "Agriculture": "Indigenous Millets & Seed Banks"
};

const slugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const programHeading = (title, sub) => (
  <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 40px" }}>
    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
      {title}
    </h2>
    <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>{sub}</p>
  </div>
);

export default function Programs() {
  const [searchParams] = useSearchParams();
  const [programList, setProgramList] = useState(programs);
  const [categoryList, setCategoryList] = useState([]);
  const [pageSettings, setPageSettings] = useState(null);

  // Legacy deep-link support: /programs?cat=Forest%20Rights scrolls to that category group.
  useEffect(() => {
    const qCat = searchParams.get("cat");
    if (!qCat) return undefined;
    const goTo = (smooth) => {
      const el = document.getElementById(`program-cat-${slugify(qCat)}`) || document.getElementById("programs-grid-area");
      if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    };
    const t1 = setTimeout(() => goTo(true), 250);
    const t2 = setTimeout(() => goTo(false), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [searchParams]);

  const fetchProgramsData = useCallback(async () => {
    // 0. Check localStorage cached settings first for instant local sync
    try {
      const cached = localStorage.getItem("alertngo_programs_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          setPageSettings((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch { }

    try {
      const res = await fetchOverviewPrograms();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setProgramList(res.data);
        if (Array.isArray(res.categories) && res.categories.length > 0) {
          setCategoryList(res.categories);
        }
        if (res.settings) {
          setPageSettings((prev) => {
            const merged = { ...prev, ...res.settings };
            try {
              localStorage.setItem("alertngo_programs_settings", JSON.stringify(merged));
            } catch { }
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote overview programs:", err);
    }
  }, []);

  useEffect(() => {
    fetchProgramsData();
    window.addEventListener("alertngo_programs_updated", fetchProgramsData);
    return () => window.removeEventListener("alertngo_programs_updated", fetchProgramsData);
  }, [fetchProgramsData]);

  // Dynamic Category Mapping
  const dynamicCategoryOrder = categoryList.length > 0
    ? categoryList.map((c) => c.category_name)
    : categoryOrder;

  const dynamicCategoryDisplayNames = { ...categoryDisplayNames };
  const dynamicCategoryMeta = { ...categoryMeta };
  categoryList.forEach((c) => {
    if (c.display_name) dynamicCategoryDisplayNames[c.category_name] = c.display_name;
    if (c.subtitle) dynamicCategoryMeta[c.category_name] = { sub: c.subtitle };
  });

  // Group programs by category, preserving canonical order
  const groups = [];
  dynamicCategoryOrder.forEach((c) => {
    const items = programList.filter((p) => (p.cat || p.category || "").toLowerCase() === c.toLowerCase());
    if (items.length > 0) groups.push({ cat: c, items });
  });
  const known = new Set(dynamicCategoryOrder.map((c) => c.toLowerCase()));
  programList.forEach((p) => {
    const c = p.cat || p.category || "";
    if (c && !known.has(c.toLowerCase())) {
      let g = groups.find((gr) => gr.cat.toLowerCase() === c.toLowerCase());
      if (!g) {
        g = { cat: c, items: [] };
        groups.push(g);
      }
      if (!g.items.some((x) => x.title === p.title)) g.items.push(p);
    }
  });

  // Parse Antyodaya fields
  const antyodayaChips = pageSettings?.antyodaya_chips
    ? (typeof pageSettings.antyodaya_chips === "string" ? JSON.parse(pageSettings.antyodaya_chips) : pageSettings.antyodaya_chips)
    : ["Since January 2016", "Six coastal mandals, Krishna District", "Yenadi tribal community"];

  const antyodayaStats = pageSettings?.antyodaya_stats
    ? (typeof pageSettings.antyodaya_stats === "string" ? JSON.parse(pageSettings.antyodaya_stats) : pageSettings.antyodaya_stats)
    : [{ n: "6", l: "Coastal Mandals" }, { n: "3,500+", l: "Women Enrolled" }, { n: "50+", l: "Cooperatives" }];
  return (
    <>
      <section className="section-pad" id="programs-grid-area" style={{ background: "var(--color-bg)", paddingTop: 150 }}>
        <div className="container">
          {groups.map((g, gi) => (
            <div
              key={g.cat}
              id={`program-cat-${slugify(g.cat)}`}
              style={gi === 0 ? { scrollMarginTop: 96 } : { borderTop: "1px solid #e2e8f0", marginTop: 56, paddingTop: 56, scrollMarginTop: 96 }}
            >
              {programHeading(
                dynamicCategoryDisplayNames[g.cat] || g.cat,
                (dynamicCategoryMeta[g.cat] && dynamicCategoryMeta[g.cat].sub) || (categoryMeta[g.cat] && categoryMeta[g.cat].sub) || "Field interventions under this thematic area."
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 32 }}>
                {g.items.map((p, i) => (
                  <motion.div
                    key={i}
                    style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -6, boxShadow: "var(--shadow-md)" }}
                  >
                    <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                      <img
                        src={p.img}
                        alt={p.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          if (p.localImg && e.currentTarget.getAttribute("src") !== p.localImg) {
                            e.currentTarget.src = p.localImg;
                          }
                        }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,30,0.7), transparent 60%)" }} />
                      <span style={{ position: "absolute", top: 14, left: 14, padding: "4px 12px", background: "var(--color-primary)", color: "white", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700 }}>
                        {p.cat}
                      </span>
                    </div>
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 10 }}>{p.title}</h3>
                        <p style={{ fontSize: "0.88rem", color: "var(--color-text-light)", lineHeight: 1.6, marginBottom: 18 }}>{p.desc}</p>
                        <ul style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                          {p.details.map((d, j) => (
                            <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "var(--color-text)" }}>
                              <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>✔</span> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        to="/la-rr"
                        style={{
                          color: "var(--color-primary)",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        Explore Documentation <FaArrowRight size={11} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ANTYODAYA HIGHLIGHT */}
      <section className="section-pad antyodaya-feature">
        <div className="container">
          <div className="antyodaya-grid">
            <motion.div
              className="antyodaya-copy"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="antyodaya-eyebrow">
                <span className="antyodaya-eyebrow-dot" aria-hidden="true" />
                <span>{pageSettings?.antyodaya_eyebrow || "Flagship Initiative"}</span>
              </span>

              <h2 className="antyodaya-title">
                {pageSettings?.antyodaya_title || "Antyodaya Project"}
                <span>{pageSettings?.antyodaya_subtitle || "Supported by Brot für die Welt (BftW), Germany"}</span>
              </h2>

              <div className="antyodaya-chips">
                {antyodayaChips.map((chip, ci) => (
                  <span className="antyodaya-chip" key={ci}>
                    {ci === 0 && <FaCalendarAlt aria-hidden="true" />}
                    {ci === 1 && <FaMapMarkerAlt aria-hidden="true" />}
                    {ci >= 2 && <FaUsers aria-hidden="true" />}
                    {chip}
                  </span>
                ))}
              </div>

              <p>{pageSettings?.antyodaya_p1 || "In partnership with Brot für die Welt (BftW), Germany, ALERT has executed the Antyodaya Project across six coastal mandals of Krishna District, directly uplifting the highly marginalized Yenadi tribal community."}</p>
              <p>{pageSettings?.antyodaya_p2 || "The Yenadi women have organized into vibrant Matsya Mithra Groups and coastal cooperatives, establishing sustainable fisheries management, obtaining government identity documentation, and achieving true financial independence."}</p>

              <div className="antyodaya-stats">
                {antyodayaStats.map((s, i) => (
                  <div className="antyodaya-stat" key={i}>
                    <div className="antyodaya-stat-value">{s.n}</div>
                    <div className="antyodaya-stat-label">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="antyodaya-media"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="antyodaya-media-frame">
                <div className="antyodaya-media-inner">
                  <img
                    src={pageSettings?.antyodaya_img || "/uploads/programs/WhatsApp-Image-2021-07-24-at-8.04.03-PM-1-768x1024.jpeg"}
                    alt="Antyodaya Project Fisherwomen"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (e.currentTarget.src !== "/uploads/programs/PHOTO-2023-02-15-19-21-00_1.jpg") {
                        e.currentTarget.src = "/uploads/programs/PHOTO-2023-02-15-19-21-00_1.jpg";
                      }
                    }}
                  />
                  <div className="antyodaya-media-caption">
                    {pageSettings?.antyodaya_caption || "Antyodaya Project — coastal Krishna District"}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section">
        <div className="container cta-container">
          <motion.div
            className="cta-shell cta-shell--single"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="cta-shell-glow cta-shell-glow-1" aria-hidden="true" />
            <div className="cta-shell-glow cta-shell-glow-2" aria-hidden="true" />

            <div className="cta-copy">
              <div className="cta-badge">
                <span className="cta-badge-dot" aria-hidden="true" />
                <span>{pageSettings?.cta_badge || "Support Our Work"}</span>
              </div>

              <h2 className="cta-title">
                {pageSettings?.cta_title || "Fuel the Eight Pillars of Change"}
              </h2>

              <p className="cta-subtitle">
                {pageSettings?.cta_subtitle || "Every contribution funds legal aid for forest-rights claims, solar electrification of off-grid hamlets, and the women-led cooperatives that keep Adivasi livelihoods resilient."}
              </p>

              <div className="cta-actions">
                <Link to="/donate" className="cta-btn-donate">
                  <span>Donate Now (80G)</span>
                  <span className="cta-donate-heart" aria-hidden="true">
                    <FaHeart size={13} />
                  </span>
                </Link>
                <Link to="/contact" className="cta-btn-volunteer">
                  <span>Volunteer with Us</span>
                  <FaArrowRight size={12} className="cta-btn-arrow" aria-hidden="true" />
                </Link>
              </div>

              <div className="cta-trust-strip">
                <div className="cta-trust-item">
                  <FaShieldAlt className="cta-trust-icon" aria-hidden="true" />
                  <span>12A &amp; 80G Certified</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaCheckCircle className="cta-trust-icon" aria-hidden="true" />
                  <span>FCRA Registered</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaAward className="cta-trust-icon" aria-hidden="true" />
                  <span>Reg. No. 307/2004</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
