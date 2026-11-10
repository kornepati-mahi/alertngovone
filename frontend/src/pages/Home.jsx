import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaArrowRight,
  FaPlay,
  FaLeaf,
  FaHeart,
  FaQuoteLeft,
  FaUniversity,
  FaStickyNote,
  FaCloud,
  FaTree,
  FaWater,
  FaFish,
  FaMapMarkerAlt,
  FaMapMarkedAlt,
  FaAward,
  FaStar,
  FaUsers,
  FaShieldAlt,
  FaInstagram,
  FaGraduationCap,
  FaTimes,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import {
  BsBank2,
  BsFileEarmarkText,
  BsBullseye,
  BsTree,
  BsHeartFill,
  BsShieldCheck,
  BsPeopleFill,
  BsBook,
  BsGlobe2,
  BsLightbulbFill,
  BsCashCoin,
  BsCompass,
  BsAwardFill,
  BsHandThumbsUpFill,
  BsWater,
  BsPinMapFill,
  BsBuildingsFill
} from "react-icons/bs";
import AnimatedTypewriter from "../components/AnimatedTypewriter";
import FlipCard from "../components/FlipCard";
import ParticleText from "../components/ParticleText";
import {
  fetchHeroSlides,
  defaultHeroSlides,
  fetchHomeFeatures,
  defaultHomeFeatures,
  fetchHomeAbout,
  defaultHomeAbout,
  fetchRegions,
  defaultRegions,
  fetchTeamMembers,
  defaultTeamMembers,
  fetchHomePrograms,
  fetchOverviewPrograms,
  defaultPrograms,
  defaultProgramsHeader,
  fetchHomeReels,
  defaultReels,
  defaultReelsHeader,
  fetchHomeTestimonials,
  defaultTestimonials,
  defaultTestimonialsHeader
} from "../api/client";

const heroSlides = [
  { bg: "/uploads/submergence-area-map-1.jpg", sub: "Defending Adivasi Forest & Land Rights" },
  { bg: "/uploads/all2023.jpeg", sub: "Flood Relief & Emergency Provisioning" },
  { bg: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg", sub: "Empowering Marginalized Communities" },
  { bg: "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", sub: "Revitalizing Gram Sabha Self-Governance" },
  { bg: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", sub: "Project Green Energy: Solar Future" },
];

// Generated once so the 5s hero slider re-render doesn't rebuild particles.
const heroParticles = Array.from({ length: 10 }, (_, i) => ({
  size: Math.random() * 6 + 3,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  color:
    i % 3 === 0
      ? "rgba(210,25,12,0.6)"
      : i % 3 === 1
      ? "rgba(245,160,0,0.6)"
      : "rgba(62,142,15,0.45)",
  delay: `${Math.random() * 6}s`,
  duration: `${Math.random() * 4 + 4}s`,
}));

const alertTeamMembers = [
  {
    name: "Prof. Ch. Diwakar Babu",
    role: "President",
    img: "/uploads/Divakar-Babu.jpg",
    bio: "Renowned legal scholar, former Principal of V.R. Law College, and constitutional rights specialist guiding ALERT's legal interventions in tribal fifth-scheduled areas.",
    highlights: ["Principal VR Law College", "Constitutional Rights Expert", "Appellate Litigation Advisor"],
    quote: "Justice is non-negotiable for the indigenous forest dwelling communities."
  },
  {
    name: "Mr V. Rama Krishna",
    role: "Vice President",
    img: "/uploads/Ramakrishna.jpg",
    bio: "Senior development activist specializing in rural livelihood cooperatives, grassroots agrarian sustainability, and natural resource stewardship for forest hamlets.",
    highlights: ["Rural Livelihood Cooperatives", "Community Mobilization", "Natural Resource Policy"],
    quote: "Self-reliance begins when communities govern their own indigenous land."
  },
  {
    name: "Mr Y.L.J.B. Jayaraj",
    role: "Secretary & Director",
    img: "/uploads/jayaraj-sir.jpg",
    bio: "Founder & Chief Functionary with 47+ years of grass-roots human rights, affirmative tribal advocacy, and institutional leadership across Andhra Pradesh.",
    highlights: ["47+ Years Grassroots Leadership", "FRA & PESA Enforcement Specialist", "Disaster Relief Coordinator"],
    quote: "Every tribal settlement has a constitutional right to sovereignty, dignity, and flourishing."
  },
  {
    name: "Ms P. Sirisha",
    role: "Treasurer",
    img: "/uploads/Sirisha-1.jpg",
    bio: "Development finance specialist overseeing statutory financial auditing, reporting, and regulatory compliances under FCRA and Indian Income Tax regulations.",
    highlights: ["12A & 80G Compliances", "Statutory Financial Auditing", "Transparent Donor Reporting"],
    quote: "Uncompromising integrity and financial transparency are our core tenets."
  },
  {
    name: "Mr J. Prasad",
    role: "Executive Member",
    img: "/uploads/Jillela-Prasad-1-3.png",
    bio: "Community organizer actively directing field campaigns on Forest Rights (RoFR 2006), GPS boundary demarcation, and Gram Sabha empowerment across Godavari agency mandals.",
    highlights: ["RoFR Patta Verification", "Gram Sabha Mobilizer", "Youth Leadership Training"],
    quote: "The Gram Sabha is the true sovereign custodian of our ancestral forests."
  },
  {
    name: "Ms K.L. Nancharamma",
    role: "Executive Member",
    img: "/uploads/Nancharamma-1-1.png",
    bio: "Indigenous community leader championing Yenadi women rights, healthcare access, and the Antyodaya Matsya Mithra fisheries cooperative federation.",
    highlights: ["Antyodaya Women Leader", "Fisheries Cooperative Builder", "Indigenous Gender Rights"],
    quote: "When women lead economic cooperatives, entire tribal habitations rise."
  },
  {
    name: "Ms N. Silpa",
    role: "Executive Member",
    img: "/uploads/silpa-1.png",
    bio: "Field intervention coordinator focusing on tribal youth digital informatics, ashram school education equity, and flood disaster relief logistical operations.",
    highlights: ["Tribal Youth Informatics", "Ashram School Advocacy", "Emergency Relief Operations"],
    quote: "Education and digital access are the strongest equalizers for tribal youth."
  },
];

function GoogleMark({ size = 20 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function StatCounter({ end, suffix = "", label, note, icon, accent = "#F5A000" }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTimestamp = null;
    const duration = 2200;
    let animId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * end));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [inView, end]);

  return (
    <motion.div
      ref={ref}
      className="impact-card"
      style={{ "--impact-accent": accent }}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="impact-icon">{icon}</div>
      <div className="impact-number">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="impact-label">{label}</div>
      {note && <p className="impact-note">{note}</p>}
    </motion.div>
  );
}







const regions = [
  {
    title: "ASR Hill Agency",
    tag: "Rampachodavaram & Chinturu ITDAs",
    desc: "PESA Gram Sabha sovereignty, community forest rights (CFR) and individual forest pattas across the Eastern Ghats agency mandals.",
    mandals: "6 mandals",
    tribes: "Koya · Konda Reddi (PVTG) · Valmiki",
    stat: "6 Mandals",
    img: "/uploads/region-asr-culture.jpg",
    alt: "Adivasi cultural gathering in the agency hills",
    accent: "#3E8E0F",
    tint: "rgba(62,142,15,0.12)",
    icon: <FaTree size={20} />,
  },
  {
    title: "Eluru Agency & Polavaram",
    tag: "K.R. Puram ITDA · Dam Belt",
    desc: "LTR 1/70 land restitution, fair RFCTLARR compensation and rehabilitation support for families facing Polavaram submergence.",
    mandals: "5 mandals · 371 habitations",
    tribes: "Koya · Konda Dora · Nayaks",
    stat: "371 Habitations",
    img: "/uploads/submergence-area-map-1.jpg",
    alt: "Polavaram submergence contour map along the Godavari",
    accent: "#D97706",
    tint: "rgba(217,119,6,0.12)",
    icon: <FaWater size={20} />,
  },
  {
    title: "Coastal Krishna Belt",
    tag: "Machilipatnam Coastal Cell",
    desc: "Land and housing entitlements for nomadic Yenadi families, the Matsya Mithra women's fisheries federation, and mangrove resilience.",
    mandals: "6 coastal mandals",
    tribes: "Yenadi · Fisher communities",
    stat: "3,500+ Women",
    img: "/uploads/coastal-krishna-fishing.jpg",
    alt: "Traditional fishing crews on the Krishna coast",
    accent: "#0ea5e9",
    tint: "rgba(14,165,233,0.12)",
    icon: <FaFish size={20} />,
  },
];

function renderFeatureIcon(iconName) {
  if (!iconName) return <BsBank2 size={28} color="#c0392b" />;

  // 1. If it's a custom uploaded image/svg (data URL or relative path)
  if (
    typeof iconName === "string" &&
    (iconName.startsWith("data:image/") ||
      iconName.startsWith("/") ||
      iconName.endsWith(".png") ||
      iconName.endsWith(".svg") ||
      iconName.endsWith(".jpg"))
  ) {
    return (
      <img
        src={iconName}
        alt="icon"
        style={{ width: 30, height: 30, objectFit: "contain" }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  const clean = String(iconName).toLowerCase().trim().replace(/^bi-/, "");
  switch (clean) {
    case "university":
    case "work":
    case "bank":
    case "bank2":
    case "building":
      return <BsBank2 size={28} color="#c0392b" />;
    case "note":
    case "vision":
    case "document":
    case "file":
      return <BsFileEarmarkText size={28} color="#f5a000" />;
    case "cloud":
    case "mission":
    case "bullseye":
    case "target":
      return <BsBullseye size={28} color="#22c55e" />;
    case "tree":
    case "forest":
      return <BsTree size={28} color="#16a34a" />;
    case "heart":
    case "welfare":
      return <BsHeartFill size={28} color="#e11d48" />;
    case "shield":
    case "rights":
      return <BsShieldCheck size={28} color="#2563eb" />;
    case "users":
    case "people":
    case "community":
      return <BsPeopleFill size={28} color="#d97706" />;
    case "book":
    case "education":
      return <BsBook size={28} color="#8b5cf6" />;
    case "globe":
    case "world":
      return <BsGlobe2 size={28} color="#0ea5e9" />;
    case "lightbulb":
    case "solar":
    case "energy":
      return <BsLightbulbFill size={28} color="#eab308" />;
    case "cash":
    case "coin":
    case "livelihood":
      return <BsCashCoin size={28} color="#10b981" />;
    case "compass":
      return <BsCompass size={28} color="#6366f1" />;
    case "award":
      return <BsAwardFill size={28} color="#ec4899" />;
    case "hand":
      return <BsHandThumbsUpFill size={28} color="#f97316" />;
    case "water":
    case "river":
      return <BsWater size={28} color="#0ea5e9" />;
    case "pin":
    case "location":
    case "map":
      return <BsPinMapFill size={28} color="#d97706" />;
    case "buildings":
    case "itda":
      return <BsBuildingsFill size={28} color="#6366f1" />;
    default:
      return <i className={`bi bi-${clean}`} style={{ fontSize: 28, color: "#c0392b" }}></i>;
  }
}

export default function HomePage() {
  const [homeConfig] = useState(() => {
    try {
      const stored = localStorage.getItem("alertngo_home_config");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [slides, setSlides] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_hero_slides");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultHeroSlides;
  });
  const [slideIdx, setSlideIdx] = useState(0);

  // Feature cards (Work, Vision, Mission, etc.)
  const [features, setFeatures] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_features");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultHomeFeatures;
  });
  const [featurePage, setFeaturePage] = useState(0);

  // "Who We Are" About data
  const [aboutData, setAboutData] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_about");
      if (local) {
        const parsed = JSON.parse(local);
        const merged = { ...defaultHomeAbout, ...parsed };
        if (!Array.isArray(merged.impact_stats) || merged.impact_stats.length === 0) {
          merged.impact_stats = defaultHomeAbout.impact_stats;
        }
        return merged;
      }
    } catch {}
    return defaultHomeAbout;
  });

  // "Where We Work" Regions data
  const [regionsList, setRegionsList] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_regions");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultRegions;
  });

  const [regionsHeader, setRegionsHeader] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_regions_header");
      if (local) return JSON.parse(local);
    } catch {}
    return {
      badge: "Where We Work",
      title: "Three Regions, One Commitment",
      subtitle: "From the Eastern Ghats agency hills to the Godavari submergence belt and the Krishna coast, ALERT stands with Adivasi communities wherever rights are at stake.",
      map_text: "Explore our interactive area map",
      map_link: "/area-of-operation"
    };
  });

  // ALERT Team & Board of Directors (Dynamic state managed via Admin)
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_team_members");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultTeamMembers;
  });

  // "What We Do" Key Programs (Dynamic state managed via Admin)
  const [programsList, setProgramsList] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_programs");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultPrograms;
  });

  const [programsHeader, setProgramsHeader] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_programs_header");
      if (local) return JSON.parse(local);
    } catch {}
    return defaultProgramsHeader;
  });

  // Instagram Reels (Dynamic state managed via Admin)
  const [reelsList, setReelsList] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_reels");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultReels;
  });

  const [reelsHeader, setReelsHeader] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_reels_header");
      if (local) return JSON.parse(local);
    } catch {}
    return defaultReelsHeader;
  });

  // Testimonials & Google Reviews (Dynamic state managed via Admin)
  const [testimonialsList, setTestimonialsList] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_testimonials");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultTestimonials;
  });

  const [testimonialsHeader, setTestimonialsHeader] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_home_testimonials_header");
      if (local) return JSON.parse(local);
    } catch {}
    return defaultTestimonialsHeader;
  });

  useEffect(() => {
    let active = true;
    fetchHomeAbout().then((res) => {
      if (active && res && res.data) {
        setAboutData((prev) => {
          try {
            const local = localStorage.getItem("alertngo_home_about");
            if (local) {
              const parsed = JSON.parse(local);
              if (parsed && (parsed.image_url || parsed.title)) {
                return { ...res.data, ...parsed };
              }
            }
          } catch {}
          return { ...prev, ...res.data };
        });
      }
    });
    fetchRegions().then((res) => {
      if (active && Array.isArray(res.data) && res.data.length > 0) {
        try {
          const local = localStorage.getItem("alertngo_home_regions");
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const activeOnly = parsed.filter((r) => Number(r.is_active) !== 0);
              setRegionsList(activeOnly.length > 0 ? activeOnly : parsed);
              return;
            }
          }
        } catch {}
        const activeOnly = res.data.filter((r) => Number(r.is_active) !== 0);
        setRegionsList(activeOnly.length > 0 ? activeOnly : res.data);
      }
    });

    const updateAbout = () => {
      try {
        const local = localStorage.getItem("alertngo_home_about");
        if (local) setAboutData({ ...defaultHomeAbout, ...JSON.parse(local) });
      } catch {}
    };

    const updateRegions = () => {
      try {
        const local = localStorage.getItem("alertngo_home_regions");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const activeOnly = parsed.filter((r) => Number(r.is_active) !== 0);
            setRegionsList(activeOnly.length > 0 ? activeOnly : parsed);
          }
        }
        const hdr = localStorage.getItem("alertngo_regions_header");
        if (hdr) setRegionsHeader(JSON.parse(hdr));
      } catch {}
    };

    window.addEventListener("alertngo_about_updated", updateAbout);
    window.addEventListener("alertngo_regions_updated", updateRegions);
    window.addEventListener("storage", updateAbout);
    window.addEventListener("storage", updateRegions);

    return () => {
      active = false;
      window.removeEventListener("alertngo_about_updated", updateAbout);
      window.removeEventListener("alertngo_regions_updated", updateRegions);
      window.removeEventListener("storage", updateAbout);
      window.removeEventListener("storage", updateRegions);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchHomeFeatures().then((res) => {
      if (active && Array.isArray(res.data) && res.data.length > 0) {
        const activeOnly = res.data.filter((f) => Number(f.is_active) !== 0);
        setFeatures(activeOnly.length > 0 ? activeOnly : res.data);
      }
    });

    const updateFeatures = () => {
      try {
        const local = localStorage.getItem("alertngo_home_features");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const activeOnly = parsed.filter((f) => Number(f.is_active) !== 0);
            setFeatures(activeOnly.length > 0 ? activeOnly : parsed);
          }
        }
      } catch {}
    };

    window.addEventListener("alertngo_features_updated", updateFeatures);
    window.addEventListener("storage", updateFeatures);

    return () => {
      active = false;
      window.removeEventListener("alertngo_features_updated", updateFeatures);
      window.removeEventListener("storage", updateFeatures);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchHeroSlides().then((res) => {
      if (active && Array.isArray(res.data) && res.data.length > 0) {
        try {
          const local = localStorage.getItem("alertngo_hero_slides");
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
              return;
            }
          }
        } catch {}
        setSlides(res.data);
      }
    });

    const updateSlides = () => {
      try {
        const local = localStorage.getItem("alertngo_hero_slides");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener("alertngo_hero_updated", updateSlides);
    window.addEventListener("storage", updateSlides);

    return () => {
      active = false;
      window.removeEventListener("alertngo_hero_updated", updateSlides);
      window.removeEventListener("storage", updateSlides);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchTeamMembers().then((res) => {
      if (active && res && Array.isArray(res.data) && res.data.length > 0) {
        try {
          const local = localStorage.getItem("alertngo_team_members");
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTeamMembers(parsed);
              return;
            }
          }
        } catch {}
        setTeamMembers(res.data);
      }
    });

    const updateTeam = () => {
      try {
        const local = localStorage.getItem("alertngo_team_members");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTeamMembers(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener("alertngo_team_updated", updateTeam);
    window.addEventListener("storage", updateTeam);

    return () => {
      active = false;
      window.removeEventListener("alertngo_team_updated", updateTeam);
      window.removeEventListener("storage", updateTeam);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchOverviewPrograms().then((res) => {
      // Build a flat list of featured programs from overview programs (one per category)
      const ovData = (res && (res.data || res.programs)) || [];
      let flat = [];
      if (Array.isArray(ovData) && ovData.length > 0) {
        // ovData may be array of categories, each with .programs, or flat array of programs
        if (ovData[0] && (ovData[0].programs || ovData[0].cards)) {
          for (const cat of ovData) {
            const cards = cat.programs || cat.cards || [];
            if (Array.isArray(cards) && cards.length > 0) {
              const c = cards[0];
              flat.push({ id: c.id, title: c.title, category: cat.category_name || cat.display_name || c.category, description: c.description, image_url: c.img || c.image_url, link_url: c.link_url || "/programs" });
            }
          }
        } else {
          flat = ovData.map((p) => ({ id: p.id, title: p.title, category: p.category, description: p.description, image_url: p.img || p.image_url, link_url: p.link_url || "/programs" }));
        }
      }
      if (flat.length > 0) {
        setProgramsList(flat.slice(0, 6));
      }
      if (active && res && res.header) {
        try {
          const localHdr = localStorage.getItem("alertngo_home_programs_header");
          if (localHdr) {
            setProgramsHeader(JSON.parse(localHdr));
            return;
          }
        } catch {}
        setProgramsHeader(res.header);
      }
    });

    const updatePrograms = async () => {
      try {
        const res = await fetchOverviewPrograms();
        const ovData = (res && (res.data || res.programs)) || [];
        let flat = [];
        if (Array.isArray(ovData) && ovData.length > 0) {
          if (ovData[0] && (ovData[0].programs || ovData[0].cards)) {
            for (const cat of ovData) {
              const cards = cat.programs || cat.cards || [];
              if (Array.isArray(cards) && cards.length > 0) {
                const c = cards[0];
                flat.push({ id: c.id, title: c.title, category: cat.category_name || cat.display_name || c.category, description: c.description, image_url: c.img || c.image_url, link_url: c.link_url || "/programs" });
              }
            }
          } else {
            flat = ovData.map((p) => ({ id: p.id, title: p.title, category: p.category, description: p.description, image_url: p.img || p.image_url, link_url: p.link_url || "/programs" }));
          }
        }
        if (flat.length > 0) setProgramsList(flat.slice(0, 6));
      } catch {}
      try {
        const hdr = localStorage.getItem("alertngo_home_programs_header");
        if (hdr) setProgramsHeader(JSON.parse(hdr));
      } catch {}
    };

    window.addEventListener("alertngo_programs_updated", updatePrograms);
    window.addEventListener("storage", updatePrograms);

    return () => {
      active = false;
      window.removeEventListener("alertngo_programs_updated", updatePrograms);
      window.removeEventListener("storage", updatePrograms);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchHomeReels().then((res) => {
      if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        try {
          const local = localStorage.getItem("alertngo_home_reels");
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReelsList(parsed);
              return;
            }
          }
        } catch {}
        const activeOnly = res.data.filter((r) => Number(r.is_active) !== 0);
        setReelsList(activeOnly.length > 0 ? activeOnly : res.data);
      }
      if (active && res && res.header) {
        try {
          const localHdr = localStorage.getItem("alertngo_home_reels_header");
          if (localHdr) {
            setReelsHeader(JSON.parse(localHdr));
            return;
          }
        } catch {}
        setReelsHeader(res.header);
      }
    });

    const updateReels = () => {
      try {
        const local = localStorage.getItem("alertngo_home_reels");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOnly = parsed.filter((r) => Number(r.is_active) !== 0);
            setReelsList(activeOnly.length > 0 ? activeOnly : parsed);
          }
        }
        const hdr = localStorage.getItem("alertngo_home_reels_header");
        if (hdr) setReelsHeader(JSON.parse(hdr));
      } catch {}
    };

    window.addEventListener("alertngo_reels_updated", updateReels);
    window.addEventListener("storage", updateReels);

    return () => {
      active = false;
      window.removeEventListener("alertngo_reels_updated", updateReels);
      window.removeEventListener("storage", updateReels);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchHomeTestimonials().then((res) => {
      if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        try {
          const local = localStorage.getItem("alertngo_home_testimonials");
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTestimonialsList(parsed);
              return;
            }
          }
        } catch {}
        const activeOnly = res.data.filter((t) => Number(t.is_active) !== 0);
        setTestimonialsList(activeOnly.length > 0 ? activeOnly : res.data);
      }
      if (active && res && res.header) {
        try {
          const localHdr = localStorage.getItem("alertngo_home_testimonials_header");
          if (localHdr) {
            setTestimonialsHeader(JSON.parse(localHdr));
            return;
          }
        } catch {}
        setTestimonialsHeader(res.header);
      }
    });

    const updateTestimonials = () => {
      try {
        const local = localStorage.getItem("alertngo_home_testimonials");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOnly = parsed.filter((t) => Number(t.is_active) !== 0);
            setTestimonialsList(activeOnly.length > 0 ? activeOnly : parsed);
          }
        }
        const hdr = localStorage.getItem("alertngo_home_testimonials_header");
        if (hdr) setTestimonialsHeader(JSON.parse(hdr));
      } catch {}
    };

    window.addEventListener("alertngo_testimonials_updated", updateTestimonials);
    window.addEventListener("storage", updateTestimonials);

    return () => {
      active = false;
      window.removeEventListener("alertngo_testimonials_updated", updateTestimonials);
      window.removeEventListener("storage", updateTestimonials);
    };
  }, []);
  // Only the visible slide (plus the next one) downloads up front instead of all five.
  const [readySlides, setReadySlides] = useState([0, 1]);
  const [playingReel, setPlayingReel] = useState(null);
  const reelTrackRef = useRef(null);
  const [reelSlide, setReelSlide] = useState(0);

  const handleReelScroll = () => {
    const el = reelTrackRef.current;
    if (!el) return;
    const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    [...el.children].forEach((child, i) => {
      const r = child.getBoundingClientRect();
      const dist = Math.abs((r.left + r.right) / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setReelSlide(best);
  };

  const goToReel = (i) => {
    const el = reelTrackRef.current;
    const child = el?.children[i];
    if (!el || !child) return;
    const left = child.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
    el.scrollTo({ left, behavior: "smooth" });
  };

  useEffect(() => {
    if (playingReel === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPlayingReel(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [playingReel]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const next = (slideIdx + 1) % slides.length;
    setReadySlides((prev) =>
      prev.includes(next) && prev.includes(slideIdx) ? prev : [...new Set([...prev, slideIdx, next])]
    );
  }, [slideIdx, slides]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);


  return (
    <>
      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-slider">
          {slides.map((s, i) => {
            const bgUrl = s.image_url || s.bg;
            const isVideo = bgUrl && (bgUrl.endsWith(".mp4") || bgUrl.endsWith(".webm") || bgUrl.startsWith("data:video"));
            if (isVideo) {
              return (
                <video
                  key={s.id || i}
                  src={bgUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`hero-slide ${i === slideIdx ? "active" : ""}`}
                  style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", inset: 0 }}
                />
              );
            }
            return (
              <div
                key={s.id || i}
                className={`hero-slide ${i === slideIdx ? "active" : ""}`}
                style={readySlides.includes(i) ? { backgroundImage: `url("${bgUrl}")` } : undefined}
              />
            );
          })}
        </div>
        <div className="hero-overlay" />
        <div className="hero-particles">
          {heroParticles.map((p, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                top: p.top,
                background: p.color,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
        <div className="hero-content container">
          <div className="hero-grid">
            <div>
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FaLeaf /> {homeConfig?.badge || "Est. 2004 - Reg. No. 307/2004"}
              </motion.div>
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                {homeConfig?.titleLine1 || "Association for Land"}<br />& <span className="text-gradient">{homeConfig?.titleLine2 || "Livelihood"}</span>
              </motion.h1>
              <motion.div
                className="hero-subtitle"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                style={{ minHeight: "2.6rem", lineHeight: 1.35 }}
              >
                <AnimatedTypewriter
                  prefix="Dedicated to "
                  words={[
                    "Adivasi Forest & Land Rights",
                    "Polavaram Displaced Rehabilitation",
                    "Gram Sabha Self-Governance (PESA)",
                    "Antyodaya Women Cooperatives",
                    "Clean Solar Energy for Tribal Hamlets",
                    "Emergency Godavari Flood Relief"
                  ]}
                  typingSpeed={60}
                  deletingSpeed={30}
                  pauseTime={2000}
                />
              </motion.div>
              <motion.p
                className="hero-description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {homeConfig?.description || "Empowering Adivasi communities in the Fifth Scheduled Areas of Andhra Pradesh through forest rights, self-governance, and sustainable development since 2004."}
              </motion.p>
              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link to="/about" className="btn-primary">
                  <FaPlay size={12} /> Our Story
                </Link>
                <Link
                  to="/donate"
                  className="btn-outline"
                  style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
                >
                  Donate Now <FaHeart size={12} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="hero-slider-dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`slider-dot ${i === slideIdx ? "active" : ""}`}
              onClick={() => setSlideIdx(i)}
            />
          ))}
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="section-pad features-section">
        <div className="container">
          {(() => {
            const CARDS_PER_PAGE = 3;
            const totalPages = Math.ceil(features.length / CARDS_PER_PAGE);
            const currentCards = features.slice(
              featurePage * CARDS_PER_PAGE,
              (featurePage + 1) * CARDS_PER_PAGE
            );

            return (
              <>
                <div className="features-grid">
                  {currentCards.map((f, i) => (
                    <motion.div
                      key={f.id || i}
                      className="feature-card"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <div className="feature-icon">{renderFeatureIcon(f.icon_name)}</div>
                      <h3 className="feature-title">{f.title}</h3>
                      <p className="feature-desc">{f.description || f.desc}</p>
                      <Link to={f.link_url || f.link || (String(f.title || "").toLowerCase().includes("vision") ? "/vision-mission-2" : String(f.title || "").toLowerCase().includes("mission") ? "/vision-mission-2" : "/about")} className="feature-link" style={{ position: "relative", zIndex: 5, cursor: "pointer" }}>
                        Read more <FaArrowRight size={12} />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 28,
                    position: "relative",
                    zIndex: 20
                  }}>
                    <button
                      onClick={() => setFeaturePage((p) => Math.max(0, p - 1))}
                      disabled={featurePage === 0}
                      style={{
                        background: featurePage === 0 ? "rgba(0,0,0,0.06)" : "var(--color-primary)",
                        color: featurePage === 0 ? "#94a3b8" : "#fff",
                        border: "none",
                        borderRadius: 20,
                        padding: "7px 18px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: featurePage === 0 ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: featurePage === 0 ? "none" : "0 4px 12px rgba(210,25,12,0.25)",
                        transition: "all 0.2s"
                      }}
                    >
                      <FaChevronLeft size={10} /> Prev 3
                    </button>

                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-light)" }}>
                      {featurePage + 1} / {totalPages}
                    </span>

                    <button
                      onClick={() => setFeaturePage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={featurePage >= totalPages - 1}
                      style={{
                        background: featurePage >= totalPages - 1 ? "rgba(0,0,0,0.06)" : "var(--color-primary)",
                        color: featurePage >= totalPages - 1 ? "#94a3b8" : "#fff",
                        border: "none",
                        borderRadius: 20,
                        padding: "7px 18px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: featurePage >= totalPages - 1 ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: featurePage >= totalPages - 1 ? "none" : "0 4px 12px rgba(210,25,12,0.25)",
                        transition: "all 0.2s"
                      }}
                    >
                      Next 3 <FaChevronRight size={10} />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="section-pad about-section" id="about">
        <div className="container">
          <div className="about-grid">
            <motion.div
              className="about-image-wrapper"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="about-image">
                <img
                  src={aboutData.image_url || "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg"}
                  alt={aboutData.title || "ALERT Team"}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.target.src && !e.target.dataset.retried && !e.target.src.startsWith("data:") && !e.target.src.includes("WhatsApp")) {
                      e.target.dataset.retried = "1";
                      setTimeout(() => {
                        if (e.target) e.target.src = e.target.src.split("?")[0] + "?t=" + Date.now();
                      }, 600);
                    } else {
                      e.target.onerror = null;
                      e.target.src = "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg";
                    }
                  }}
                />
              </div>
              <div className="about-image-badge">
                <div className="years">{aboutData.years_number || "20+"}</div>
                <div className="years-label">{aboutData.years_label || "Years of Service"}</div>
              </div>
            </motion.div>
            <motion.div
              className="about-content"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="about-tag">{aboutData.tag || "Who We Are"}</p>
              <h2 className="about-title">{aboutData.title || "Championing Adivasi Rights and Sustainable Development"}</h2>
              {aboutData.lead_text && (
                <p className="about-lead">
                  {aboutData.lead_text}
                </p>
              )}
              {aboutData.p1 && (
                <p className="about-text">
                  {aboutData.p1}
                </p>
              )}
              {aboutData.p2 && (
                <p className="about-text">
                  {aboutData.p2}
                </p>
              )}
              {Array.isArray(aboutData.features) && aboutData.features.length > 0 && (
                <div className="about-features">
                  {aboutData.features.map((f, i) => (
                    <div key={i} className="about-feature-item">
                      <div className="check">✓</div> {f}
                    </div>
                  ))}
                </div>
              )}
              <div className="about-actions">
                <Link to={aboutData.btn1_link || "/about"} className="btn-primary" style={{ position: "relative", zIndex: 5, cursor: "pointer" }}>
                  {aboutData.btn1_text || "Learn More"} <FaArrowRight size={12} />
                </Link>
                <Link to={aboutData.btn2_link || "/contact"} className="btn-outline" style={{ position: "relative", zIndex: 5, cursor: "pointer" }}>
                  {aboutData.btn2_text || "Get Involved"}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHERE WE WORK */}
      <section className="section-pad regions-section" id="regions">
        <div className="container">
          <motion.div
            className="regions-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
              {regionsHeader.badge || "Where We Work"}
            </span>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              {regionsHeader.title || "Three Regions, One Commitment"}
            </h2>
            <p className="section-subtitle">
              {regionsHeader.subtitle || "From the Eastern Ghats agency hills to the Godavari submergence belt and the Krishna coast, ALERT stands with Adivasi communities wherever rights are at stake."}
            </p>
          </motion.div>
          <div className="regions-grid">
            {regionsList.map((r, i) => (
              <motion.article
                key={r.id || r.title || i}
                className="region-card"
                style={{ "--region-accent": r.accent || r.accent_color || "#3E8E0F" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.12, duration: 0.5 }}
              >
                <div className="region-media">
                  <img
                    src={r.image_url || r.img}
                    alt={r.alt_text || r.alt || r.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/uploads/region-asr-culture.jpg";
                    }}
                  />
                  <div className="region-media-shade" />
                  {(r.stat || r.stat_badge) && <span className="region-media-stat">{r.stat || r.stat_badge}</span>}
                </div>
                <div className="region-card-icon" style={{ background: r.tint || (r.accent_color ? `${r.accent_color}22` : "rgba(62,142,15,0.12)") }}>
                  {renderFeatureIcon(r.icon_name || (r.title.toLowerCase().includes("water") || r.title.toLowerCase().includes("eluru") ? "water" : r.title.toLowerCase().includes("krishna") ? "fish" : "tree"))}
                </div>
                <div className="region-body">
                  {r.tag && <span className="region-card-tag">{r.tag}</span>}
                  <h3>{r.title}</h3>
                  <p className="region-desc">{r.description || r.desc}</p>
                  <div className="region-meta">
                    {r.mandals && <span><FaMapMarkerAlt size={11} /> {r.mandals}</span>}
                    {r.tribes && <span><FaUsers size={11} /> {r.tribes}</span>}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="regions-footer">
            <Link to={(regionsHeader.map_link && regionsHeader.map_link !== "/about") ? regionsHeader.map_link : "/area-of-operation"} style={{ position: "relative", zIndex: 5, cursor: "pointer" }}>
              {regionsHeader.map_text || "Explore our interactive area map"} <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* PROJECT GREEN ENERGY */}
      <section className="section-pad" style={{ background: "var(--color-bg)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 40, alignItems: "center" }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="badge" style={{ marginBottom: 14, display: "inline-block" }}>Clean Energy Initiative</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 16 }}>
                Project Green Energy
              </h2>
              <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, marginBottom: 16 }}>
                Bridging the energy divide across isolated tribal hill habitations that never had electric grid infrastructure. ALERT works hand-in-hand with village youth to install decentralized clean solar street poles and distribute durable solar home lanterns.
              </p>
              <p style={{ color: "var(--color-text-light)", lineHeight: 1.8, marginBottom: 24 }}>
                This initiative ensures children can study after dark, mitigates human-wildlife encounters during night hours, and replaces toxic kerosene lamps with clean, zero-emission lighting.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 14 }}>
                {[
                  { n: "75+", l: "Hamlets Electrified" },
                  { n: "3,500+", l: "Solar Lanterns" },
                  { n: "100%", l: "Clean Energy" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "white", padding: "16px 12px", borderRadius: 12, textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary)" }}>{s.n}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
                <img
                  src="/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg"
                  alt="Project Green Energy Solar Erection"
                  style={{ width: "100%", height: "360px", objectFit: "cover" }} loading="lazy" decoding="async" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AUTHENTIC ALERT TEAM SECTION */}
      <section className="section-pad" style={{ background: "white" }}>
        <div className="container">
          <motion.div
            className="text-center"
            style={{ marginBottom: 48 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>Board of Directors</span>
            <h2 className="section-title">ALERT Team</h2>
            <p className="section-subtitle">Leadership dedicated to justice, dignity, and sustainable prosperity for Adivasis.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
            {teamMembers.map((m, idx) => (
              <motion.div
                key={m.id || idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <FlipCard
                  img={m.image_url || m.img}
                  name={m.name}
                  role={m.role}
                  bio={m.bio}
                  badge={m.badge || "Board of Directors"}
                  highlights={m.highlights || []}
                  quote={m.quote}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="section-pad impact-section" id="impact">
        <div className="container">
          <motion.div
            className="impact-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>Our Impact</span>
            <h2 className="section-title" style={{ color: "white", marginBottom: 16 }}>Two Decades of Transformative Change</h2>
            <p className="section-subtitle">Measurable impact across Adivasi communities in Andhra Pradesh</p>
          </motion.div>
          <div className="impact-grid">
            {(Array.isArray(aboutData?.impact_stats) && aboutData.impact_stats.length > 0 ? aboutData.impact_stats : [
              { number: "20", suffix: "+", label: "Years of Service", note: "Rooted in the Fifth Scheduled Areas since 2004" },
              { number: "25000", suffix: "+", label: "Families Impacted", note: "Adivasi households across three operating regions" },
              { number: "15000", suffix: "+", label: "Acres Forest Rights", note: "Individual and community forest titles secured" },
              { number: "371", suffix: "", label: "Habitations Defended", note: "Polavaram submergence villages under R&R advocacy" }
            ]).map((s, i) => {
              const icons = [<FaAward size={20} />, <FaUsers size={20} />, <FaTree size={20} />, <FaMapMarkedAlt size={20} />];
              const accents = ["#F5A000", "#38BDF8", "#7BC043", "#FF7A5C"];
              return (
                <StatCounter
                  key={i}
                  end={parseInt(String(s.number).replace(/[^0-9]/g, "")) || 0}
                  suffix={s.suffix || ""}
                  label={s.label || ""}
                  note={s.note || ""}
                  icon={icons[i % icons.length]}
                  accent={accents[i % accents.length]}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="section-pad programs-section" id="programs">
        <div className="container">
          <motion.div
            className="programs-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>{programsHeader.badge || "What We Do"}</span>
            <h2 className="section-title" style={{ marginBottom: 16 }}>{programsHeader.title || "Our Key Programs"}</h2>
            <p className="section-subtitle">{programsHeader.subtitle || "Comprehensive programs addressing the needs of Adivasi and marginalized communities"}</p>
          </motion.div>
          <div className="programs-grid">
            {(programsList && programsList.length > 0 ? programsList : defaultPrograms).map((p, i) => (
              <motion.div
                key={p.id || i}
                className="program-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.1 }}
              >
                <div className="program-image">
                  <img
                    src={p.image_url || p.img}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg";
                    }}
                  />
                  <div className="program-image-overlay" />
                  <span className="program-category">{p.category || p.cat}</span>
                </div>
                <div className="program-content">
                  <h3 className="program-title">{p.title}</h3>
                  <p className="program-desc">{p.description || p.desc}</p>
                  <Link to={p.link_url || p.link || "/programs"} className="program-link" style={{ position: "relative", zIndex: 5, cursor: "pointer" }}>
                    Learn More <FaArrowRight size={11} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM REELS */}
      <section className="section-pad reels-section" id="reels">
        <div className="container">
          <motion.div
            className="reels-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {reelsHeader.badge && (
              <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
                <FaInstagram size={10} style={{ marginRight: 6, verticalAlign: "-1px" }} />
                {reelsHeader.badge}
              </span>
            )}
            <h2 className="section-title" style={{ marginBottom: 16 }}>{reelsHeader.title || "Stories from the Field"}</h2>
            <p className="section-subtitle">{reelsHeader.subtitle || "Short videos from our work across Andhra Pradesh — follow us for the latest from the communities we serve."}</p>
          </motion.div>

          <motion.div
            className="reels-shell"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="reels-profile">
              <a
                className="reels-avatar-ring"
                href={reelsHeader.profile_url || "https://www.instagram.com/alert.ngo/"}
                target="_blank"
                rel="noreferrer"
                aria-label="ALERT NGO on Instagram"
              >
                <img
                  src={reelsHeader.avatar_url || "/uploads/alert-logo-transparent-cropped-removebg-preview-2.png"}
                  alt="ALERT NGO logo"
                  width="64"
                  height="64"
                />
              </a>
              <div className="reels-profile-copy">
                <div className="reels-handle">{reelsHeader.profile_handle || "alert.ngo"}</div>
                <div className="reels-profile-meta">@{reelsHeader.profile_handle || "alert.ngo"} · Instagram</div>
                <p className="reels-profile-bio">{reelsHeader.profile_bio || "Adivasi rights, forest governance & women's collectives across Andhra Pradesh."}</p>
              </div>
              <div className="reels-profile-actions">
                <a
                  className="reels-follow"
                  href={reelsHeader.profile_url || "https://www.instagram.com/alert.ngo/"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram size={13} /> Follow
                </a>
                <a
                  className="reels-outline"
                  href={reelsHeader.profile_url ? (reelsHeader.profile_url.endsWith('/') ? `${reelsHeader.profile_url}reels/` : `${reelsHeader.profile_url}/reels/`) : "https://www.instagram.com/alert.ngo/reels/"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaPlay size={9} /> View Reels
                </a>
              </div>
            </div>

            <div className="reels-track" ref={reelTrackRef} onScroll={handleReelScroll}>
              {reelsList.map((r, i) => {
                const poster = r.img || r.image_url;
                const videoSrc = r.video || r.video_url;
                const itemKey = r.id || r.label || i;
                return (
                  <motion.div
                    key={itemKey}
                    className={`reel-card${playingReel === i ? " is-playing" : ""}`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                  >
                    {poster ? (
                      <img src={poster} alt={r.title} loading="lazy" decoding="async" />
                    ) : (
                      <video src={videoSrc} muted preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    {playingReel === i && videoSrc && (
                      <video
                        className="reel-video-inline"
                        src={videoSrc}
                        poster={poster}
                        controls
                        autoPlay
                        playsInline
                        muted
                        preload="metadata"
                        onEnded={() => setPlayingReel(null)}
                      />
                    )}
                    <span className="reel-shade" aria-hidden="true" />
                    <span className="reel-tag"><FaPlay size={7} /> {r.label || `Reel ${i + 1}`}</span>
                    {r.duration && <span className="reel-duration" aria-hidden="true">{r.duration}</span>}
                    {playingReel === i ? (
                      <button
                        type="button"
                        className="reel-stop"
                        onClick={() => setPlayingReel(null)}
                        aria-label={`Stop ${r.label || `Reel ${i + 1}`}`}
                      >
                        <FaTimes size={12} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="reel-play"
                        onClick={() => setPlayingReel(i)}
                        aria-label={`Play ${r.label || `Reel ${i + 1}`}: ${r.title}`}
                      >
                        <FaPlay size={15} />
                      </button>
                    )}
                    <span className="reel-info">
                      {r.topic && <span className="reel-topic">{r.topic}</span>}
                      <span className="reel-title">{r.title}</span>
                      {playingReel !== i && (
                        <span className="reel-open">Tap to play <FaPlay size={6} /></span>
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="reels-dots">
              {reelsList.map((r, i) => (
                <button
                  key={r.id || r.label || i}
                  type="button"
                  className={`reels-dot${reelSlide === i ? " is-active" : ""}`}
                  onClick={() => goToReel(i)}
                  aria-label={`Show ${r.label || `Reel ${i + 1}`}`}
                  aria-current={reelSlide === i ? "true" : undefined}
                />
              ))}
            </div>

            <div className="reels-footer">
              <p className="reels-caption">
                <FaInstagram size={13} /> Enjoying our content? Follow us for field updates and stories from the communities we serve.
              </p>
              <a
                className="reels-cta"
                href={reelsHeader.profile_url || "https://www.instagram.com/alert.ngo/"}
                target="_blank"
                rel="noreferrer"
              >
                Visit our profile <FaArrowRight size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad testimonials-section" id="testimonials">
        <div className="container">
          <motion.div
            className="testimonials-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {testimonialsHeader.badge && (
              <span className="badge" style={{ marginBottom: 16, display: "inline-block" }}>
                {testimonialsHeader.badge}
              </span>
            )}
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              <ParticleText
                text="alertngo"
                particleSize={2}
                density={4}
                color="#D2190C"
                highlightColor="#D2190C"
                highlightMode="motion"
                shape="circle"
                intro="gather"
                scatter={180}
                gatherDuration={1600}
                stagger={420}
                clickBurst
                burstStrength={1}
                pointerRepel={40}
                repelRadius={120}
                idleDrift={0.7}
                trigger="hover"
                fontSize="clamp(3rem, 12vw, 8rem)"
                fontWeight={800}
                fontFamily="inherit"
                glow
              />
            </h2>
            {Number(testimonialsHeader.show_google_badge) !== 0 && (
              <a
                className="google-review-badge"
                href={testimonialsHeader.google_reviews_url || "https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews"}
                target="_blank"
                rel="noreferrer"
                aria-label="Read ALERT NGO reviews on Google"
              >
                <span className="google-review-logo" aria-hidden="true">
                  <GoogleMark size={20} />
                </span>
                <span className="google-review-copy">
                  <span className="google-review-title">
                    <span className="google-review-name">
                      <span className="g-blue">G</span><span className="g-red">o</span><span className="g-yellow">o</span><span className="g-blue">g</span><span className="g-green">l</span><span className="g-red">e</span> {testimonialsHeader.google_reviews_title ? testimonialsHeader.google_reviews_title.replace(/^google\s*/i, "") : "Reviews"}
                    </span>
                    <span className="google-stars" aria-hidden="true">
                      {Array.from({ length: Math.round(Number(testimonialsHeader.google_rating) || 5) }).map((_, s) => (
                        <FaStar key={s} size={10} />
                      ))}
                    </span>
                  </span>
                  <span className="google-review-meta">
                    {testimonialsHeader.google_reviews_subtitle || "See what our community says on Google"}
                  </span>
                </span>
                <FaArrowRight className="google-review-arrow" size={12} />
              </a>
            )}
          </motion.div>
          {(() => {
            const listToDisplay = Array.isArray(testimonialsList) && testimonialsList.length > 0 ? testimonialsList : defaultTestimonials;
            return (
              <div className="testimonials-marquee">
                <div className="testimonials-track">
                  {[...listToDisplay, ...listToDisplay].map((t, i) => (
                    <div
                      key={`${t.id || t.name}-${i}`}
                      className="testimonial-card marquee-card"
                      aria-hidden={i >= listToDisplay.length ? "true" : undefined}
                    >
                      <div>
                        <div className="testimonial-top">
                          <FaQuoteLeft className="testimonial-quote" />
                          <span className="testimonial-google" title={`${t.source || "Google"} review`}>
                            <GoogleMark size={13} />
                            <span className="testimonial-google-word">{t.source || "Google"}</span>
                            <span className="testimonial-google-stars" aria-hidden="true">
                              {Array.from({ length: Number(t.rating) || 5 }).map((_, s) => (
                                <FaStar key={s} size={8} />
                              ))}
                            </span>
                          </span>
                        </div>
                        <p className="testimonial-text">{t.text}</p>
                      </div>
                      <div className="testimonial-author" style={{ marginTop: 20 }}>
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="testimonial-avatar"
                            style={{ objectFit: "cover", width: 44, height: 44, borderRadius: "50%" }}
                          />
                        ) : (
                          <div
                            className="testimonial-avatar"
                            style={{
                              background: t.avatar_color || "#D2190C",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700
                            }}
                          >
                            {(t.name || "A").charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="testimonial-name">{t.name}</div>
                          <div className="testimonial-role">{t.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section cta-section--home" id="get-involved">
        <div className="container cta-container">
          <motion.div
            className="cta-shell"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Ambient lighting accents */}
            <div className="cta-shell-glow cta-shell-glow-1" aria-hidden="true" />
            <div className="cta-shell-glow cta-shell-glow-2" aria-hidden="true" />

            <div className="cta-copy">
              <div className="cta-badge">
                <span className="cta-badge-dot" aria-hidden="true" />
                <span>Get Involved</span>
              </div>

              <h2 className="cta-title">
                Ready to Make a <span className="cta-title-highlight">Lasting Difference?</span>
              </h2>

              <p className="cta-subtitle">
                Join ALERT in empowering Adivasi communities. Your support directly funds legal advocacy for ancestral forest rights, women-led cooperatives, agency school education, and emergency flood relief across Andhra Pradesh.
              </p>

              <div className="cta-actions">
                <Link to="/donate" className="cta-btn-donate">
                  <span>Donate Now</span>
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
                  <span>100% Grassroots Work</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaCheckCircle className="cta-trust-icon" aria-hidden="true" />
                  <span>80G Tax Exemption</span>
                </div>
                <span className="cta-trust-dot" aria-hidden="true">•</span>
                <div className="cta-trust-item">
                  <FaAward className="cta-trust-icon" aria-hidden="true" />
                  <span>30+ Years of Impact</span>
                </div>
              </div>
            </div>

            <div className="cta-panel">
              <div className="cta-panel-head">
                <div>
                  <span className="cta-panel-eyebrow">Where Your Support Goes</span>
                  <h3 className="cta-panel-heading">Direct Impact Breakdown</h3>
                </div>
                <span className="cta-panel-count">4 Key Missions</span>
              </div>

              <div className="cta-panel-list">
                <div className="cta-panel-card">
                  <div className="cta-panel-icon cta-icon-green" aria-hidden="true">
                    <FaTree size={18} />
                  </div>
                  <div className="cta-panel-info">
                    <div className="cta-panel-row">
                      <strong>Forest &amp; Land Rights</strong>
                      <span className="cta-impact-badge cta-impact-green">5,000+ Acres</span>
                    </div>
                    <span className="cta-panel-desc">Legal aid for IFR &amp; CFR community claims</span>
                  </div>
                </div>

                <div className="cta-panel-card">
                  <div className="cta-panel-icon cta-icon-gold" aria-hidden="true">
                    <FaUsers size={18} />
                  </div>
                  <div className="cta-panel-info">
                    <div className="cta-panel-row">
                      <strong>Women's Collectives</strong>
                      <span className="cta-impact-badge cta-impact-gold">1,200+ Women</span>
                    </div>
                    <span className="cta-panel-desc">Matsya Mithra cooperatives &amp; livelihoods</span>
                  </div>
                </div>

                <div className="cta-panel-card">
                  <div className="cta-panel-icon cta-icon-blue" aria-hidden="true">
                    <FaGraduationCap size={18} />
                  </div>
                  <div className="cta-panel-info">
                    <div className="cta-panel-row">
                      <strong>Education &amp; Learning</strong>
                      <span className="cta-impact-badge cta-impact-blue">800+ Students</span>
                    </div>
                    <span className="cta-panel-desc">Digital classrooms &amp; agency school kits</span>
                  </div>
                </div>

                <div className="cta-panel-card">
                  <div className="cta-panel-icon cta-icon-red" aria-hidden="true">
                    <FaCloud size={18} />
                  </div>
                  <div className="cta-panel-info">
                    <div className="cta-panel-row">
                      <strong>Disaster Relief</strong>
                      <span className="cta-impact-badge cta-impact-red">Immediate Aid</span>
                    </div>
                    <span className="cta-panel-desc">Godavari flood rescue &amp; food provisions</span>
                  </div>
                </div>
              </div>

              <Link to="/programs" className="cta-panel-link">
                <span>Explore all 6 impact programmes</span>
                <span className="cta-panel-arrow" aria-hidden="true">
                  <FaArrowRight size={12} />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
