import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBullhorn,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaTimes,
  FaChevronDown,
  FaHeart,
  FaChevronRight,
  FaLinkedin,
  FaUserShield
} from "react-icons/fa";

// ── Language switcher helpers ──────────────────────────────────────────────
const LANG_LABELS = {
  en: { label: "EN", font: "Outfit, sans-serif", title: "English" },
  te: { label: "తె", font: "'Noto Sans Telugu', sans-serif", title: "తెలుగు" },
  hi: { label: "हि", font: "'Noto Sans Devanagari', sans-serif", title: "हिंदी" },
};

function setGoogleTranslateLang(langCode) {
  // Find the hidden <select> that Google Translate injects and change it
  const select = document.querySelector(".goog-te-combo");
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
    return;
  }
  // Fallback: use the cookie approach
  document.cookie = `googtrans=/en/${langCode}; path=/`;
  window.location.reload();
}

function getCurrentLang() {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
  return match ? match[1] : "en";
}
// ──────────────────────────────────────────────────────────────────────────

const socialLinks = [
  { name: "Facebook", url: "https://www.facebook.com/share/1CKPiocND8/", icon: FaFacebook },
  { name: "X (Twitter)", url: "https://x.com/AlertapIn", icon: FaTwitter },
  { name: "Instagram", url: "https://www.instagram.com/alertngo/", icon: FaInstagram },
  { name: "YouTube", url: "https://www.youtube.com/@alertvja", icon: FaYoutube },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/107938041/", icon: FaLinkedin },
];
import { fetchFlashNews, defaultFlashNews, fetchPolavaramPages, fetchGalleryDropdowns, defaultGalleryDropdowns, fetchPartnerDropdowns, defaultPartnerDropdowns, fetchAboutDropdowns, defaultAboutDropdowns, fetchLaRrPages, defaultLaRrPages, fetchRofrPages, defaultRofrPages, fetchAchievementsPages } from "../api/client";

const navLinks = [
  { label: "Home", path: "/" },
  {
    label: "About",
    path: "/about",
    dropdown: [
      { label: "About ALERT", path: "/about" },
      { label: "Governing Body", path: "/governing-body" },
      { label: "Vision & Mission", path: "/vision-mission-2" },
      { label: "Core Values", path: "/core-values" },
      { label: "Org Profile", path: "/organizational-profile" },
      { label: "Organogram", path: "/organogram" },
      { label: "ALERT Policies", path: "/alert-policies" },
      { label: "Area of Operation", path: "/area-of-operation" },
    ]
  },
  {
    label: "Team",
    path: "/governing-body",
  },
  {
    label: "Our Work",
    path: "/programs",
    dropdown: [
      { label: "Key Programs Overview", path: "/programs" },
      {
        label: "Polavaram Project",
        path: "/legislative-acts-2",
        dropdown: [
          { label: "Submergence Map", path: "/submergence-area-map" },
          { label: "PIP Progress", path: "/chronological-order-of-pip-progress" },
          { label: "PIP Issues", path: "/issues-of-pip" },
          { label: "PPA Minutes", path: "/polavaram-project-authority-minutes" },
          { label: "SLMC Meetings", path: "/slmc-meetings" },
          { label: "PIP Review", path: "/review-meeting-presentations-on-pip" },
        ]
      },
      { label: "LA & RR", path: "/land-acquisition-la" },
      {
        label: "RoFR & LTR",
        path: "/rofr",
        dropdown: [
          { label: "Abstract RoFR", path: "/abstract-rofr" },
          { label: "Rejection Reasons", path: "/reasons-for-rejections" },
          { label: "RoFR Judgements", path: "/compendium-of-judgements-rofr" },
          { label: "RoFR Rules-G.Os", path: "/rofr-g-os" },
          { label: "LTR ASR", path: "/ltr" },
          { label: "LTR ELURU", path: "/ltr-eluru" },
          { label: "LTR Disposal", path: "/ltr-disposal-meanings" },
        ]
      },
      {
        label: "Flood Relief",
        path: "/flood-relief-measures",
        dropdown: [
          { label: "2023", path: "/2023-2" },
          { label: "2022", path: "/flood-relief-measures-2022" },
          { label: "2021", path: "/flood-relief-measures-2021-2" },
          { label: "2020", path: "/flood-relief-measures-2020", dropdown: [
            { label: "Blankets – East G.", path: "/blankets-distribution-in-east-godavari" },
            { label: "Groceries – West G.", path: "/groceries-distribution-in-west-godavari" },
          ]},
        ]
      },
      {
        label: "Achievements",
        path: "/achievements",
        dropdown: [
          { label: "Child Interventions", path: "/child-interventions" },
          { label: "Child Bare Acts", path: "/child-bare-acts" },
          { label: "Reports", path: "/reports" },
          { label: "PORTFOLIO", path: "/portfolio-3" },
        ]
      },
      { label: "All 90 Site Pages", path: "/all-pages" },
    ]
  },
  { label: "Stories", path: "/stories" },
  { label: "News", path: "/news-views" },
  {
    label: "Videos & Images",
    path: "/gallery-9",
    dropdown: [
      {
        label: "Photos & Images",
        path: "/gallery-9?filter=Photos",
        dropdown: [
          { label: "All Photos", path: "/gallery-9?filter=Photos" },
          { label: "Community & Forest Rights", path: "/gallery-9?filter=Photos&cat=Community" },
          { label: "Flood Relief & Operations", path: "/gallery-9?filter=Photos&cat=Relief" },
          { label: "Education & Livelihood", path: "/gallery-9?filter=Photos&cat=Education" },
        ]
      },
      {
        label: "Field Videos",
        path: "/gallery-9?filter=Videos",
        dropdown: [
          { label: "All Videos", path: "/gallery-9?filter=Videos" },
          { label: "Field Reels & Stories", path: "/gallery-9?filter=Videos" },
          { label: "Community & Youth Videos", path: "/gallery-9?filter=Videos&cat=Education" },
        ]
      },
      {
        label: "Events & Albums",
        path: "/gallery-9?cat=Events",
        dropdown: [
          { label: "All Event Media", path: "/gallery-9?cat=Events" },
          { label: "Event Photos", path: "/gallery-9?cat=Events&filter=Photos" },
          { label: "Event Videos", path: "/gallery-9?cat=Events&filter=Videos" },
          { label: "Conferences & Conventions", path: "/gallery-9?cat=Events" },
        ]
      },
    ]
  },
  { label: "Careers", path: "/careers" },
  {
    label: "Partner with us",
    path: "/partner",
    dropdown: [
      { label: "Partner with Us", path: "/partner" },
      {
        label: "Grievances",
        path: "/grievances",
        dropdown: [
          { label: "R&R Grievances", path: "/abstract" },
          { label: "Land Rights Grievance", path: "/rr-grievances" },
          { label: "Types of Grievances", path: "/types-of-grievances" },
          { label: "R&R Forms", path: "/rr-grievance-full-forms" },
        ]
      },
      {
        label: "Downloads",
        path: "/downloads",
        dropdown: [
          { label: "Legislative Acts", path: "/legislative-acts-2" },
          { label: "GO's", path: "/gos" },
          { label: "R&R G.Os", path: "/rr-gos" },
          { label: "Others", path: "/others" },
        ]
      },
      { label: "FAQ’s", path: "/faqs" },
      { label: "Quick Links", path: "/quick-links" },
    ]
  },
  {
    label: "Contact",
    path: "/contact",
    dropdown: [
      { label: "Contact Us", path: "/contact" },
      { label: "Grievances Desk", path: "/grievances" },
    ]
  },
];

// Optional extra links flyout (if any overflow is ever needed)
const moreLinks = [];

const moreItem = { label: "More", dropdown: moreLinks };

const FLYOUT_WIDTH = 280;
const DESKTOP_NAV_MIN_WIDTH = 1141;
const MENU_GAP = 0;

function measureTopRect(label, refs) {
  const el = refs.current[label];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const navEl = el.closest(".navbar") || document.querySelector(".navbar");
  const navBottom = navEl ? navEl.getBoundingClientRect().bottom : r.bottom;
  const maxLeft = Math.max(12, window.innerWidth - FLYOUT_WIDTH - 12);
  return { left: Math.min(Math.max(12, r.left), maxLeft), top: navBottom };
}

function measureSubRect(label, refs) {
  const el = refs.current[label];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const flyoutEl = el.closest(".nav-flyout");
  const flyoutRect = flyoutEl ? flyoutEl.getBoundingClientRect() : r;

  let isLeft = false;
  let left = flyoutRect.right - 2;
  if (left + FLYOUT_WIDTH > window.innerWidth - 12) {
    left = Math.max(12, flyoutRect.left - FLYOUT_WIDTH + 2);
    isLeft = true;
  }

  // Align submenu cleanly: match parent flyout top for the first item,
  // or align with item top minus container padding (6px), never higher than parent flyout
  const parentTop = flyoutRect.top;
  const itemTop = r.top;
  const maxTop = Math.max(parentTop, window.innerHeight - 340);
  const top = Math.max(parentTop, Math.min(itemTop - 6, maxTop));

  return { left, top, isLeft };
}

function measureSubSubRect(label, refs) {
  const el = refs.current[label];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const flyoutEl = el.closest(".nav-flyout-nested") || el.closest(".nav-flyout");
  const flyoutRect = flyoutEl ? flyoutEl.getBoundingClientRect() : r;

  let isLeft = false;
  let left = flyoutRect.right - 2;
  if (left + FLYOUT_WIDTH > window.innerWidth - 12) {
    left = Math.max(12, flyoutRect.left - FLYOUT_WIDTH + 2);
    isLeft = true;
  }

  const parentTop = flyoutRect.top;
  const itemTop = r.top;
  const maxTop = Math.max(parentTop, window.innerHeight - 300);
  const top = Math.max(parentTop, Math.min(itemTop - 6, maxTop));

  return { left, top, isLeft };
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState({});
  const [openTop, setOpenTop] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [openSubSub, setOpenSubSub] = useState(null);
  const [topPos, setTopPos] = useState(null);
  const [subPos, setSubPos] = useState(null);
  const [subSubPos, setSubSubPos] = useState(null);
  const mousePos = useRef({ x: 0, y: 0, prevX: 0, movingRight: false });
  const isInsideSub = useRef(false);
  const isInsideSubSub = useRef(false);
  const [flashNews, setFlashNews] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_flash_news");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeOnly = parsed.filter((p) => Number(p.is_active) !== 0);
          if (activeOnly.length > 0) return activeOnly;
        }
      }
    } catch {}
    return defaultFlashNews;
  });
  const [polavaramPages, setPolavaramPages] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_polavaram_pages_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  });
  const [galleryDropdowns, setGalleryDropdowns] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_gallery_dropdowns_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultGalleryDropdowns;
  });
  const [partnerDropdowns, setPartnerDropdowns] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_partner_dropdowns_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultPartnerDropdowns;
  });
  const [aboutDropdowns, setAboutDropdowns] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_about_dropdowns");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultAboutDropdowns;
  });
  const [larrPages, setLarrPages] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_larr_pages_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultLaRrPages || [];
  });
  const [rofrPages, setRofrPages] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_rofr_pages_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultRofrPages || [];
  });
  const [achievementsPages, setAchievementsPages] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_achievements_pages_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [activeLang, setActiveLang] = useState(getCurrentLang);
  const topRefs = useRef({});
  const subRefs = useRef({});
  const subSubRefs = useRef({});
  const closeTimer = useRef(0);
  const switchSubTimer = useRef(0);
  const switchSubSubTimer = useRef(0);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    fetchPolavaramPages()
      .then((res) => {
        if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setPolavaramPages(res.data);
          try {
            localStorage.setItem("alertngo_polavaram_pages_cache", JSON.stringify(res.data));
          } catch (_) {}
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchFlashNews().then((res) => {
      if (active && Array.isArray(res.data) && res.data.length > 0) {
        const activeItems = res.data.filter((p) => Number(p.is_active) !== 0);
        setFlashNews(activeItems.length > 0 ? activeItems : res.data);
        // Re-trigger Google Translate on newly injected ticker content
        setTimeout(() => {
          const select = document.querySelector(".goog-te-combo");
          if (select && select.value && select.value !== "en") {
            select.dispatchEvent(new Event("change"));
          }
        }, 300);
      }
    });

    const updateHandler = () => {
      try {
        const local = localStorage.getItem("alertngo_flash_news");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            const activeOnly = parsed.filter((p) => Number(p.is_active) !== 0);
            if (activeOnly.length > 0) setFlashNews(activeOnly);
          }
        }
      } catch {}
    };

    window.addEventListener("alertngo_flash_updated", updateHandler);
    window.addEventListener("storage", updateHandler);

    return () => {
      active = false;
      window.removeEventListener("alertngo_flash_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchGalleryDropdowns()
      .then((res) => {
        if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setGalleryDropdowns(activeOnly.length > 0 ? activeOnly : res.data);
          try {
            localStorage.setItem("alertngo_gallery_dropdowns_cache", JSON.stringify(res.data));
          } catch (_) {}
        }
      })
      .catch(() => {});

    const updateHandler = () => {
      fetchGalleryDropdowns().then((res) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setGalleryDropdowns(activeOnly.length > 0 ? activeOnly : res.data);
        }
      });
    };

    window.addEventListener("alertngo_gallery_dropdowns_updated", updateHandler);
    window.addEventListener("storage", updateHandler);

    return () => {
      active = false;
      window.removeEventListener("alertngo_gallery_dropdowns_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchPartnerDropdowns()
      .then((res) => {
        if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setPartnerDropdowns(activeOnly.length > 0 ? activeOnly : res.data);
          try {
            localStorage.setItem("alertngo_partner_dropdowns_cache", JSON.stringify(res.data));
          } catch (_) {}
        }
      })
      .catch(() => {});

    const updateHandler = () => {
      fetchPartnerDropdowns().then((res) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setPartnerDropdowns(activeOnly.length > 0 ? activeOnly : res.data);
        }
      });
    };

    window.addEventListener("alertngo_partner_dropdowns_updated", updateHandler);
    window.addEventListener("storage", updateHandler);

    return () => {
      active = false;
      window.removeEventListener("alertngo_partner_dropdowns_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchAboutDropdowns()
      .then((res) => {
        if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setAboutDropdowns(activeOnly.length > 0 ? activeOnly : res.data);
          if (res.source === "api") {
            try {
              localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(res.data));
            } catch (_) {}
          }
        }
      })
      .catch(() => {});

    const updateHandler = () => {
      try {
        const cached = localStorage.getItem("alertngo_about_dropdowns");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOnly = parsed.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
            setAboutDropdowns(activeOnly.length > 0 ? activeOnly : parsed);
            return;
          }
        }
      } catch (_) {}
      fetchAboutDropdowns().then((res) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setAboutDropdowns(activeOnly.length > 0 ? activeOnly : res.data);
          if (res.source === "api") {
            try {
              localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(res.data));
            } catch (_) {}
          }
        }
      });
    };

    window.addEventListener("alertngo_about_dropdowns_updated", updateHandler);
    window.addEventListener("storage", updateHandler);

    return () => {
      active = false;
      window.removeEventListener("alertngo_about_dropdowns_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchLaRrPages()
      .then((res) => {
        if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setLarrPages(activeOnly.length > 0 ? activeOnly : res.data);
          if (res.source === "api") {
            try {
              localStorage.setItem("alertngo_larr_pages_cache", JSON.stringify(res.data));
            } catch (_) {}
          }
        }
      })
      .catch(() => {});

    const updateHandler = () => {
      try {
        const cached = localStorage.getItem("alertngo_larr_pages_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOnly = parsed.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
            setLarrPages(activeOnly.length > 0 ? activeOnly : parsed);
            return;
          }
        }
      } catch (_) {}
      fetchLaRrPages().then((res) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setLarrPages(activeOnly.length > 0 ? activeOnly : res.data);
          if (res.source === "api") {
            try {
              localStorage.setItem("alertngo_larr_pages_cache", JSON.stringify(res.data));
            } catch (_) {}
          }
        }
      });
    };

    window.addEventListener("alertngo_larr_pages_updated", updateHandler);
    window.addEventListener("storage", updateHandler);

    return () => {
      active = false;
      window.removeEventListener("alertngo_larr_pages_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchRofrPages()
      .then((res) => {
        if (active && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setRofrPages(activeOnly.length > 0 ? activeOnly : res.data);
          if (res.source === "api") {
            try {
              localStorage.setItem("alertngo_rofr_pages_cache", JSON.stringify(res.data));
            } catch (_) {}
          }
        }
      })
      .catch(() => {});

    const updateHandler = () => {
      try {
        const cached = localStorage.getItem("alertngo_rofr_pages_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOnly = parsed.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
            setRofrPages(activeOnly.length > 0 ? activeOnly : parsed);
            return;
          }
        }
      } catch (_) {}
      fetchRofrPages().then((res) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          setRofrPages(activeOnly.length > 0 ? activeOnly : res.data);
          if (res.source === "api") {
            try {
              localStorage.setItem("alertngo_rofr_pages_cache", JSON.stringify(res.data));
            } catch (_) {}
          }
        }
      });
    };

    window.addEventListener("alertngo_rofr_pages_updated", updateHandler);
    window.addEventListener("storage", updateHandler);

    return () => {
      active = false;
      window.removeEventListener("alertngo_rofr_pages_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchAchievementsPages()
      .then((res) => {
        if (active && res && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          const list = activeOnly.length > 0 ? activeOnly : res.data;
          setAchievementsPages(list);
          try { localStorage.setItem("alertngo_achievements_pages_cache", JSON.stringify(list)); } catch (_) {}
        }
      })
      .catch(() => {});

    const updateHandler = () => {
      try {
        const cached = localStorage.getItem("alertngo_achievements_pages_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOnly = parsed.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
            setAchievementsPages(activeOnly.length > 0 ? activeOnly : parsed);
          }
        }
      } catch (_) {}
      fetchAchievementsPages().then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          const activeOnly = res.data.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
          const list = activeOnly.length > 0 ? activeOnly : res.data;
          setAchievementsPages(list);
          try { localStorage.setItem("alertngo_achievements_pages_cache", JSON.stringify(list)); } catch (_) {}
        }
      });
    };

    window.addEventListener("alertngo_achievements_pages_updated", updateHandler);
    window.addEventListener("storage", updateHandler);
    return () => {
      active = false;
      window.removeEventListener("alertngo_achievements_pages_updated", updateHandler);
      window.removeEventListener("storage", updateHandler);
    };
  }, []);

  const tickerItems = flashNews.length > 0 ? [...flashNews, ...flashNews] : [];
  const tickerDuration = Math.max(22, flashNews.length * 12);

  useEffect(() => {
    let raf = 0;
    const handler = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled((prev) => {
          const next = window.scrollY > 30;
          return prev === next ? prev : next;
        });
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const prevX = mousePos.current.x;
      mousePos.current.prevX = prevX;
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      mousePos.current.movingRight = e.clientX > prevX + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setExpandedMobileItems({});
    setOpenTop(null);
    setOpenSub(null);
    setOpenSubSub(null);
    setTopPos(null);
    setSubPos(null);
    setSubSubPos(null);
    isInsideSub.current = false;
    isInsideSubSub.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClose = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setExpandedMobileItems({});
        document.body.style.overflow = "";
      }
    };
    window.addEventListener("resize", handleClose);
    window.addEventListener("orientationchange", handleClose);

    let mql = null;
    try {
      mql = window.matchMedia("(min-width: 1024px)");
      const onMediaChange = (e) => {
        if (e.matches) {
          setMobileOpen(false);
          setExpandedMobileItems({});
          document.body.style.overflow = "";
        }
      };
      if (mql.matches && mobileOpen) {
        setMobileOpen(false);
        setExpandedMobileItems({});
        document.body.style.overflow = "";
      }
      if (mql.addEventListener) {
        mql.addEventListener("change", onMediaChange);
      } else if (mql.addListener) {
        mql.addListener(onMediaChange);
      }
    } catch {}

    return () => {
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("orientationchange", handleClose);
    };
  }, [mobileOpen]);

  const toggleMobileSubmenu = (label) => {
    setExpandedMobileItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const closeDesktopMenus = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
    if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
    setOpenTop(null);
    setOpenSub(null);
    setOpenSubSub(null);
    setTopPos(null);
    setSubPos(null);
    setSubSubPos(null);
    isInsideSub.current = false;
    isInsideSubSub.current = false;
  }, []);

  const holdDesktopMenu = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  const scheduleDesktopMenuClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(closeDesktopMenus, 450);
  };

  const openDesktopMenu = (label) => {
    holdDesktopMenu();
    if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
    if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
    setOpenTop(label);
    setOpenSub(null);
    setOpenSubSub(null);
    setSubPos(null);
    setSubSubPos(null);
    isInsideSub.current = false;
    isInsideSubSub.current = false;
    setTopPos(measureTopRect(label, topRefs));
  };

  const openDesktopSub = (label) => {
    holdDesktopMenu();
    if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
    if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
    setOpenSub(label);
    setOpenSubSub(null);
    setSubSubPos(null);
    isInsideSubSub.current = false;
    setSubPos(measureSubRect(label, subRefs));
  };

  const openDesktopSubSub = (label) => {
    holdDesktopMenu();
    if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
    setOpenSubSub(label);
    setSubSubPos(measureSubSubRect(label, subSubRefs));
  };

  // Keep the fixed flyouts glued to their triggers while the page moves.
  useEffect(() => {
    if (!openTop) return undefined;
    let frame = 0;
    const reposition = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setTopPos(measureTopRect(openTop, topRefs));
        if (openSub) setSubPos(measureSubRect(openSub, subRefs));
        if (openSubSub) setSubSubPos(measureSubSubRect(openSubSub, subSubRefs));
      });
    };
    window.addEventListener("scroll", reposition, { passive: true, capture: true });
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, { capture: true });
      window.removeEventListener("resize", reposition);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [openTop, openSub, openSubSub]);

  useEffect(() => {
    if (!openTop) return undefined;
    const dismiss = (event) => {
      if (event.target?.closest?.(".nav-flyout") || event.target?.closest?.(".navbar-links")) return;
      closeDesktopMenus();
    };
    const onKey = (event) => {
      if (event.key === "Escape") closeDesktopMenus();
    };
    const onNarrow = () => {
      if (window.innerWidth < DESKTOP_NAV_MIN_WIDTH) closeDesktopMenus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onNarrow);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onNarrow);
    };
  }, [openTop, closeDesktopMenus]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
    if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
  }, []);

  function handleLangSwitch(lang) {
    setActiveLang(lang);
    setGoogleTranslateLang(lang);
    // Re-apply after a short delay so dynamically rendered content (ticker, etc.) also gets translated
    if (lang !== "en") {
      setTimeout(() => {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = lang;
          select.dispatchEvent(new Event("change"));
        }
      }, 500);
    }
  }

  function renderDesktopItem(link) {
    if (link.dropdown) {
      const ddOpen = openTop === link.label;
      return (
        <Link
          key={link.label}
          to={link.path}
          ref={(el) => { topRefs.current[link.label] = el; }}
          className={`nav-link nav-link-menu ${location.pathname === link.path ? "active" : ""} ${ddOpen ? "is-open" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
          onMouseEnter={() => openDesktopMenu(link.label)}
          onMouseLeave={scheduleDesktopMenuClose}
          onClick={closeDesktopMenus}
        >
          {link.label}
          <FaChevronDown size={9} style={{ transform: ddOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
        </Link>
      );
    }
    return (
      <Link
        key={link.label}
        to={link.path}
        className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
        onMouseEnter={() => { if (openTop) closeDesktopMenus(); }}
      >
        {link.label}
      </Link>
    );
  }

  function renderFlyoutItems(items, level = 1) {
    if (!Array.isArray(items)) return null;

    return items.map((item) => {
      const isActive = location.pathname === item.path;

      if (item.dropdown && item.dropdown.length > 0) {
        if (level === 1) {
          const subOpen = openSub === item.label;
          return (
            <div
              key={item.label}
              ref={(el) => { subRefs.current[item.label] = el; }}
              className={`nav-flyout-item nav-flyout-parent ${subOpen ? "is-open active-parent" : ""} ${isActive ? "active" : ""}`}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => {
                holdDesktopMenu();
                if (openSub === item.label) {
                  if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
                  return;
                }
                if (openSub) {
                  if (isInsideSub.current) return;
                  if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
                  const delay = mousePos.current.movingRight ? 550 : 320;
                  switchSubTimer.current = window.setTimeout(() => {
                    if (!isInsideSub.current) {
                      openDesktopSub(item.label);
                    }
                  }, delay);
                } else {
                  openDesktopSub(item.label);
                }
              }}
            >
              <Link
                to={item.path}
                onClick={closeDesktopMenus}
                style={{ color: "inherit", textDecoration: "none", flex: 1, display: "flex", alignItems: "center" }}
              >
                {item.label}
              </Link>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (openSub === item.label) {
                    setOpenSub(null);
                    setSubPos(null);
                    setOpenSubSub(null);
                    setSubSubPos(null);
                  } else {
                    openDesktopSub(item.label);
                  }
                }}
                title="Toggle submenu"
                style={{ padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaChevronRight size={8} style={{ transform: subOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
              </span>
            </div>
          );
        } else if (level === 2) {
          const subSubOpen = openSubSub === item.label;
          return (
            <div
              key={item.label}
              ref={(el) => { subSubRefs.current[item.label] = el; }}
              className={`nav-flyout-item nav-flyout-parent ${subSubOpen ? "is-open active-parent" : ""} ${isActive ? "active" : ""}`}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => {
                holdDesktopMenu();
                if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
                if (openSubSub === item.label) {
                  if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
                  return;
                }
                if (openSubSub) {
                  if (isInsideSubSub.current) return;
                  if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
                  const delay = mousePos.current.movingRight ? 550 : 320;
                  switchSubSubTimer.current = window.setTimeout(() => {
                    if (!isInsideSubSub.current) {
                      openDesktopSubSub(item.label);
                    }
                  }, delay);
                } else {
                  openDesktopSubSub(item.label);
                }
              }}
            >
              <Link
                to={item.path}
                onClick={closeDesktopMenus}
                style={{ color: "inherit", textDecoration: "none", flex: 1, display: "flex", alignItems: "center" }}
              >
                {item.label}
              </Link>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (openSubSub === item.label) {
                    setOpenSubSub(null);
                    setSubSubPos(null);
                  } else {
                    openDesktopSubSub(item.label);
                  }
                }}
                title="Toggle submenu"
                style={{ padding: "4px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaChevronRight size={8} style={{ transform: subSubOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
              </span>
            </div>
          );
        }
      }

      return (
        <Link
          key={item.label}
          to={item.path}
          className={`nav-flyout-item ${isActive ? "active" : ""}`}
          onMouseEnter={() => {
            holdDesktopMenu();
            if (level === 1) {
              if (isInsideSub.current) return;
              if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
              const delay = mousePos.current.movingRight ? 550 : 380;
              switchSubTimer.current = window.setTimeout(() => {
                if (!isInsideSub.current) {
                  setOpenSub(null);
                  setSubPos(null);
                  setOpenSubSub(null);
                  setSubSubPos(null);
                }
              }, delay);
            } else if (level === 2) {
              if (isInsideSubSub.current) return;
              if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
              const delay = mousePos.current.movingRight ? 550 : 380;
              switchSubSubTimer.current = window.setTimeout(() => {
                if (!isInsideSubSub.current) {
                  setOpenSubSub(null);
                  setSubSubPos(null);
                }
              }, delay);
            }
          }}
          onClick={closeDesktopMenus}
        >
          {item.label}
        </Link>
      );
    });
  }

  const effectiveNavLinks = useMemo(() => {
    let base = navLinks;

    if (polavaramPages && polavaramPages.length > 0) {
      const dropdownItems = polavaramPages
        .filter((p) => p.slug !== "legislative-acts-2" && (p.is_active === undefined || Number(p.is_active) !== 0))
        .map((p) => ({
          label: p.nav_label || p.title,
          path: `/${p.slug}`,
        }));

      if (dropdownItems.length > 0) {
        base = base.map((item) => {
          if (item.label === "Our Work" && item.dropdown) {
            return {
              ...item,
              dropdown: item.dropdown.map((sub) => {
                if (sub.label === "Polavaram Project") {
                  return {
                    ...sub,
                    dropdown: dropdownItems,
                  };
                }
                return sub;
              }),
            };
          }
          return item;
        });
      }
    }

    if (galleryDropdowns && galleryDropdowns.length > 0) {
      const grouped = {};
      galleryDropdowns.forEach((item) => {
        if (item.is_active !== undefined && Number(item.is_active) === 0) return;
        const sec = item.section || "Photos & Images";
        if (!grouped[sec]) grouped[sec] = [];
        grouped[sec].push({
          label: item.label,
          path: item.path
        });
      });

      const dynamicMediaDropdown = Object.keys(grouped).map((sec) => {
        const subLinks = grouped[sec];
        const defaultPath = subLinks[0]?.path || "/gallery-9";
        return {
          label: sec,
          path: defaultPath,
          dropdown: subLinks
        };
      });

      if (dynamicMediaDropdown.length > 0) {
        base = base.map((item) => {
          if (item.label === "Videos & Images") {
            return {
              ...item,
              dropdown: dynamicMediaDropdown
            };
          }
          return item;
        });
      }
    }

    if (partnerDropdowns && partnerDropdowns.length > 0) {
      const dynamicPartnerDropdown = partnerDropdowns
        .filter((item) => item.is_active === undefined || Number(item.is_active) !== 0)
        .map((item) => {
          let subItems = [];
          if (item.sub_items_json) {
            try {
              subItems = typeof item.sub_items_json === "string" ? JSON.parse(item.sub_items_json) : item.sub_items_json;
            } catch (_) {}
          }
          const entry = {
            label: item.label,
            path: item.path,
          };
          if (Array.isArray(subItems) && subItems.length > 0) {
            entry.dropdown = subItems;
          }
          return entry;
        });

      if (dynamicPartnerDropdown.length > 0) {
        base = base.map((item) => {
          if (item.label === "Partner with us") {
            return {
              ...item,
              dropdown: dynamicPartnerDropdown,
            };
          }
          return item;
        });
      }
    }

    if (larrPages && larrPages.length > 0) {
      // Keep "LA & RR" as a direct link to /land-acquisition-la (no dropdown UI).
      base = base.map((item) => {
        if (item.label === "Our Work" && item.dropdown) {
          return {
            ...item,
            dropdown: item.dropdown.map((sub) => {
              if (sub.label === "LA & RR") {
                return {
                  label: "LA & RR",
                  path: "/land-acquisition-la",
                };
              }
              return sub;
            }),
          };
        }
        return item;
      });
    }

    if (aboutDropdowns && aboutDropdowns.length > 0) {
      const activeAbout = aboutDropdowns.filter((item) => item.is_active === undefined || Number(item.is_active) !== 0);
      const topLevelAbout = activeAbout.filter((item) => !item.parent_id || item.parent_id === "" || item.parent_id === "0");
      const childrenAbout = activeAbout.filter((item) => item.parent_id && item.parent_id !== "" && item.parent_id !== "0");

      const dynamicAboutDropdown = topLevelAbout
        .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
        .map((parent) => {
          const mySubs = childrenAbout
            .filter((c) => String(c.parent_id) === String(parent.id))
            .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
            .map((c) => ({ label: c.label, path: c.path }));

          let legacySubs = [];
          if (parent.sub_items_json) {
            try {
              legacySubs = typeof parent.sub_items_json === "string" ? JSON.parse(parent.sub_items_json) : parent.sub_items_json;
            } catch (_) {}
          }
          const allSubs = [...mySubs, ...(Array.isArray(legacySubs) ? legacySubs : [])];

          const entry = {
            label: parent.label,
            path: parent.path,
          };
          if (allSubs.length > 0) {
            entry.dropdown = allSubs;
          }
          return entry;
        });

      if (dynamicAboutDropdown.length > 0) {
        base = base.map((item) => {
          if (item.label === "About") {
            return {
              ...item,
              dropdown: dynamicAboutDropdown,
            };
          }
          return item;
        });
      }
    }

    if (rofrPages && rofrPages.length > 0) {
      const activeRofr = rofrPages.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
      const topLevelRofr = activeRofr
        .filter((p) => p.slug !== "rofr" && (!p.parent_slug || p.parent_slug === ""))
        .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

      const dynamicRofrDropdown = topLevelRofr.map((p) => {
        const children = activeRofr
          .filter((c) => c.parent_slug === p.slug)
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
          .map((c) => ({ label: c.nav_label || c.title, path: `/${c.slug}` }));

        const entry = {
          label: p.nav_label || p.title,
          path: `/${p.slug}`
        };
        if (children.length > 0) {
          entry.dropdown = children;
        }
        return entry;
      });

      const rofrOverview = activeRofr.find((p) => p.slug === "rofr");
      if (rofrOverview) {
        dynamicRofrDropdown.unshift({
          label: rofrOverview.nav_label || "RoFR & LTR Overview",
          path: "/rofr"
        });
      }

      if (dynamicRofrDropdown.length > 0) {
        base = base.map((item) => {
          if (item.label === "Our Work" && item.dropdown) {
            return {
              ...item,
              dropdown: item.dropdown.map((sub) => {
                if (sub.label === "RoFR & LTR") {
                  return {
                    ...sub,
                    dropdown: dynamicRofrDropdown
                  };
                }
                return sub;
              })
            };
          }
          return item;
        });
      }
    }

    if (achievementsPages && achievementsPages.length > 0) {
      const activeAch = achievementsPages.filter((p) => p.is_active === undefined || Number(p.is_active) !== 0);
      const bySlug = new Map(activeAch.map((p) => [p.slug, p]));
      const childrenOf = (parentSlug) =>
        activeAch
          .filter((p) => (p.parent_slug || "") === parentSlug && p.slug !== parentSlug)
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

      const root = bySlug.get("achievements") || activeAch.find((p) => p.slug === "achievements");
      const rootLabel = root?.nav_label || root?.title || "Achievements";
      const rootPath = "/achievements";

      const buildNode = (p) => {
        const kids = childrenOf(p.slug).map(buildNode);
        const node = {
          label: p.nav_label || p.title || p.slug,
          path: `/${p.slug}`
        };
        if (kids.length > 0) node.dropdown = kids;
        return node;
      };

      // Direct children of achievements root; include legacy known children if present; also include other top-level pages (no parent) as children for discoverability
      let direct = childrenOf("achievements");
      if (direct.length === 0) {
        const legacy = ["child-interventions", "child-bare-acts", "reports", "portfolio-3"];
        direct = legacy.map((s) => bySlug.get(s)).filter(Boolean);
      }
      const extraTop = activeAch
        .filter((p) => p.slug !== "achievements" && !(p.parent_slug || "") && !direct.some((d) => d.slug === p.slug))
        .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
      const dynamicAchDropdown = [...direct, ...extraTop].map(buildNode);

      base = base.map((item) => {
        if (item.label === "Our Work" && item.dropdown) {
          return {
            ...item,
            dropdown: item.dropdown.map((sub) => {
              if (sub.label === "Achievements") {
                return {
                  ...sub,
                  label: rootLabel,
                  path: rootPath,
                  dropdown: dynamicAchDropdown.length > 0 ? dynamicAchDropdown : sub.dropdown
                };
              }
              return sub;
            })
          };
        }
        return item;
      });
    }

    return base;
  }, [polavaramPages, galleryDropdowns, partnerDropdowns, aboutDropdowns, larrPages, rofrPages, achievementsPages]);

  const activeTopLink = openTop ? [...effectiveNavLinks, moreItem].find((l) => l.label === openTop) : null;
  const activeSubLink = activeTopLink?.dropdown?.find((d) => d.label === openSub) || null;
  const activeSubSubLink = activeSubLink?.dropdown?.find((d) => d.label === openSubSub) || null;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-topbar">
          <div className="container topbar-inner">
            <div className="topbar-flash" aria-label="Latest announcements">
              <span className="topbar-flash-label" translate="no"><FaBullhorn size={10} /> Updates</span>
              <div className="topbar-flash-viewport">
                <div className="topbar-flash-track" style={{ animationDuration: `${tickerDuration}s` }} translate="yes">
                  {tickerItems.map((item, i) => (
                    <span className="topbar-flash-item" key={`${item.id}-${i}`} translate="yes">{item.message}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="topbar-actions">
              {/* Hidden Google Translate widget mount point */}
              <div id="google_translate_element" style={{ display: "none" }} />

              {/* Language switcher buttons */}
              <div className="topbar-lang" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {Object.entries(LANG_LABELS).map(([code, { label, font, title }]) => (
                  <button
                    key={code}
                    onClick={() => handleLangSwitch(code)}
                    title={title}
                    style={{
                      background: activeLang === code ? "var(--color-primary, #c0392b)" : "#f0f0f0",
                      color: activeLang === code ? "#fff" : "#222",
                      border: activeLang === code ? "2px solid var(--color-primary, #c0392b)" : "2px solid #ccc",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: "0.78rem",
                      fontFamily: font,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      lineHeight: 1.6,
                      minWidth: 32,
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="topbar-social">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a key={s.name} href={s.url} target="_blank" rel="noreferrer" title={s.name}><Icon /></a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="navbar-main">
          <div className="container navbar-inner">
            <Link to="/" className="navbar-logo">
              <img src="/alert-logo.png" alt="ALERT logo" className="navbar-logo-img" />
            </Link>

            <div className="navbar-links">
              {effectiveNavLinks.map((link) => renderDesktopItem(link))}
              {moreLinks.length > 0 && (
                <span
                  ref={(el) => { topRefs.current["More"] = el; }}
                  className={`nav-link nav-link-menu ${openTop === "More" ? "is-open" : ""} ${moreLinks.some((l) => l.path === location.pathname || l.dropdown?.some((d) => d.path === location.pathname)) ? "active" : ""}`}
                  style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                  onMouseEnter={() => openDesktopMenu("More")}
                  onMouseLeave={scheduleDesktopMenuClose}
                >
                  More
                  <FaChevronDown size={9} style={{ transform: openTop === "More" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                </span>
              )}
            </div>

            <div className="navbar-actions">
              <Link
                to="/admin"
                title="Admin Panel"
                className="admin-nav-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 13px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#003190",
                  background: "rgba(0,49,144,0.08)",
                  border: "1.5px solid rgba(0,49,144,0.25)",
                  borderRadius: 8,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(0,49,144,0.15)";
                  e.currentTarget.style.borderColor = "#003190";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(0,49,144,0.08)";
                  e.currentTarget.style.borderColor = "rgba(0,49,144,0.25)";
                }}
              >
                <FaUserShield size={12} /> Admin
              </Link>
              <Link to="/donate" className="btn-primary donate-nav-btn" style={{ padding: "8px 18px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <FaHeart size={11} /> Donate
              </Link>
              <button
                className="navbar-hamburger"
                onClick={() => setMobileOpen(!mobileOpen)}
                id="hamburger-btn"
                aria-label="Toggle navigation menu"
                style={{ background: "none", border: "none" }}
              >
                {mobileOpen ? (
                  <FaTimes size={24} color="#003190" />
                ) : (
                  <>
                    <div className="hamburger-line" />
                    <div className="hamburger-line" />
                    <div className="hamburger-line" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {activeTopLink && topPos && createPortal(
        <div
          className="nav-flyout"
          style={{
            left: `${topPos.left}px`,
            top: `${topPos.top}px`,
            width: `${FLYOUT_WIDTH}px`,
            maxHeight: `${Math.max(200, viewportH - topPos.top - 16)}px`,
          }}
          onMouseEnter={holdDesktopMenu}
          onMouseLeave={scheduleDesktopMenuClose}
        >
          {renderFlyoutItems(activeTopLink.dropdown, 1)}
        </div>,
        document.body
      )}

      {activeSubLink && subPos && createPortal(
        <div
          className={`nav-flyout nav-flyout-nested ${subPos.isLeft ? "align-left" : ""}`}
          style={{
            left: `${subPos.left}px`,
            top: `${subPos.top}px`,
            width: `${FLYOUT_WIDTH}px`,
          }}
          onMouseEnter={() => {
            isInsideSub.current = true;
            holdDesktopMenu();
            if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
          }}
          onMouseLeave={() => {
            isInsideSub.current = false;
            scheduleDesktopMenuClose();
          }}
        >
          {renderFlyoutItems(activeSubLink.dropdown, 2)}
        </div>,
        document.body
      )}

      {activeSubSubLink && subSubPos && createPortal(
        <div
          className={`nav-flyout nav-flyout-nested nav-flyout-level3 ${subSubPos.isLeft ? "align-left" : ""}`}
          style={{
            left: `${subSubPos.left}px`,
            top: `${subSubPos.top}px`,
            width: `${FLYOUT_WIDTH}px`,
          }}
          onMouseEnter={() => {
            isInsideSub.current = true;
            isInsideSubSub.current = true;
            holdDesktopMenu();
            if (switchSubTimer.current) window.clearTimeout(switchSubTimer.current);
            if (switchSubSubTimer.current) window.clearTimeout(switchSubSubTimer.current);
          }}
          onMouseLeave={() => {
            isInsideSubSub.current = false;
            scheduleDesktopMenuClose();
          }}
        >
          {renderFlyoutItems(activeSubSubLink.dropdown, 3)}
        </div>,
        document.body
      )}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            style={{ display: "flex" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src="/alert-icon.png" alt="ALERT" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "contain", background: "white", padding: 2 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "white", letterSpacing: 1 }}>ALERT</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>EST. 2004</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer" }}
                aria-label="Close menu"
              >
                <FaTimes size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
              {[...effectiveNavLinks, ...moreLinks].map((link) => {
                if (link.dropdown) {
                  return (
                    <div key={link.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div
                        onClick={() => toggleMobileSubmenu(link.label)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 8px", color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" }}
                      >
                        <span>{link.label}</span>
                        <FaChevronDown size={11} style={{ color: "var(--color-primary)", transform: expandedMobileItems[link.label] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                      </div>
                      <AnimatePresence>
                        {expandedMobileItems[link.label] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: "hidden", background: "rgba(255,255,255,0.03)", borderRadius: 8, margin: "0 0 10px 0", padding: "6px 0" }}
                          >
                            {link.dropdown.map((sub) => {
                              if (sub.dropdown) {
                                return (
                                  <div key={sub.label} style={{ marginBottom: 6 }}>
                                    <div
                                      onClick={() => toggleMobileSubmenu(sub.label)}
                                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                                    >
                                      <span>{sub.label}</span>
                                      <FaChevronDown size={10} style={{ color: "var(--color-primary)", transform: expandedMobileItems[sub.label] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
                                    </div>
                                    <AnimatePresence>
                                      {expandedMobileItems[sub.label] && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          style={{ overflow: "hidden", background: "rgba(255,255,255,0.02)", borderRadius: 6, margin: "4px 0", padding: "4px 0" }}
                                        >
                                          {sub.dropdown.map((ss) => (
                                            <Link key={ss.label} to={ss.path} onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", textDecoration: "none" }}>
                                              <span style={{ color: "var(--color-primary)", fontSize: "0.7rem" }}>•</span>
                                              <span>{ss.label}</span>
                                            </Link>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              }
                              return (
                                <Link key={sub.label} to={sub.path} onClick={() => setMobileOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", textDecoration: "none" }}>
                                  <span style={{ color: "var(--color-primary)", fontSize: "0.7rem" }}>•</span>
                                  <span>{sub.label}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <div key={link.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link to={link.path} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "14px 8px", color: location.pathname === link.path ? "var(--color-primary)" : "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>
                      {link.label}
                    </Link>
                  </div>
                );
              })}
            </div>
            <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingBottom: 4 }}>
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a key={s.name} href={s.url} target="_blank" rel="noreferrer" title={s.name} style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", transition: "color 0.2s ease" }}>
                      <Icon />
                    </a>
                  );
                })}
              </div>
              <Link to="/donate" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ textAlign: "center", justifyContent: "center", width: "100%", padding: "12px", borderRadius: 25 }}>
                <FaHeart size={12} /> Donate Now (80G)
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  width: "100%", padding: "10px", borderRadius: 25, textDecoration: "none",
                  background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
                  fontSize: "0.85rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <FaUserShield size={13} /> Admin Panel
              </Link>
              <div style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Update: {flashNews[0].message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 1000 }}
        />
      )}
    </>
  );
}
