import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaSave,
  FaUndo,
  FaEye,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTimes,
  FaImage,
  FaArrowUp,
  FaArrowDown,
  FaUniversity,
  FaStickyNote,
  FaCloud,
  FaTree,
  FaHeart,
  FaShieldAlt,
  FaUsers,
  FaCompass,
  FaCloudUploadAlt,
  FaFolderOpen,
  FaChevronDown,
  FaSearch,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCheck,
  FaListUl,
  FaLink,
  FaAward,
  FaHandsHelping,
  FaInstagram,
  FaQuoteLeft
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
import AdminLayout from "../components/AdminLayout";
import {
  defaultHeroSlides,
  fetchHeroSlides,
  adminListHeroSlides,
  adminCreateHeroSlide,
  adminUpdateHeroSlide,
  adminDeleteHeroSlide,
  defaultHomeFeatures,
  fetchHomeFeatures,
  adminListHomeFeatures,
  adminCreateHomeFeature,
  adminUpdateHomeFeature,
  adminDeleteHomeFeature,
  defaultHomeAbout,
  fetchHomeAbout,
  adminSaveHomeAbout,
  defaultRegions,
  fetchRegions,
  adminListRegions,
  adminCreateRegion,
  adminUpdateRegion,
  adminDeleteRegion,
  adminUploadImage
} from "../api/client";

const HOME_CONFIG_KEY = "alertngo_home_config";
const HERO_SLIDES_KEY = "alertngo_hero_slides";
const HOME_FEATURES_KEY = "alertngo_home_features";
const HOME_ABOUT_KEY = "alertngo_home_about";
const HOME_REGIONS_KEY = "alertngo_home_regions";
const REGIONS_HEADER_KEY = "alertngo_regions_header";
const KEY_STORAGE = "alertngo_admin_key";

const DEFAULT_CONFIG = {
  badge: "Est. 2004 - Reg. No. 307/2004",
  titleLine1: "Association for Land",
  titleLine2: "Livelihood",
  description:
    "Empowering Adivasi communities in the Fifth Scheduled Areas of Andhra Pradesh through forest rights, self-governance, and sustainable development since 2004.",
};

const PRESET_IMAGES = [
  { label: "Community Meeting / Team", url: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg" },
  { label: "ASR Hill Culture & Gathering", url: "/uploads/region-asr-culture.jpg" },
  { label: "Godavari Submergence Map", url: "/uploads/submergence-area-map-1.jpg" },
  { label: "Coastal Krishna Fishing Crews", url: "/uploads/coastal-krishna-fishing.jpg" },
  { label: "Gram Sabha Training Adivasi", url: "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg" },
  { label: "Forest Rights Advocacy", url: "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg" },
  { label: "Flood Relief Mission 2023", url: "/uploads/all2023.jpeg" },
  { label: "Project Green Energy Solar", url: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg" },
];

const ACCENT_COLOR_OPTIONS = [
  { label: "Forest Green", color: "#3E8E0F" },
  { label: "Amber / Orange", color: "#D97706" },
  { label: "Ocean Blue", color: "#0ea5e9" },
  { label: "Crimson Red", color: "#c0392b" },
  { label: "Deep Purple", color: "#8b5cf6" },
  { label: "Emerald Teal", color: "#059669" },
  { label: "Goldenrod", color: "#f59e0b" },
];

const BOOTSTRAP_ICON_OPTIONS = [
  { value: "bank", label: "Bank / Institution", component: BsBank2, color: "#c0392b", bg: "rgba(192, 57, 43, 0.15)" },
  { value: "note", label: "Document / Vision", component: BsFileEarmarkText, color: "#f5a000", bg: "rgba(245, 160, 0, 0.15)" },
  { value: "target", label: "Target / Mission", component: BsBullseye, color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" },
  { value: "tree", label: "Forest / Hill Agency", component: BsTree, color: "#16a34a", bg: "rgba(22, 163, 74, 0.15)" },
  { value: "water", label: "River / Godavari Submergence", component: BsWater, color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.15)" },
  { value: "pin", label: "Location / Habitations", component: BsPinMapFill, color: "#d97706", bg: "rgba(217, 119, 6, 0.15)" },
  { value: "buildings", label: "Administration / ITDA", component: BsBuildingsFill, color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)" },
  { value: "heart", label: "Welfare / Health", component: BsHeartFill, color: "#e11d48", bg: "rgba(225, 29, 72, 0.15)" },
  { value: "shield", label: "Rights / Constitutional", component: BsShieldCheck, color: "#2563eb", bg: "rgba(37, 99, 235, 0.15)" },
  { value: "people", label: "Community / Tribes", component: BsPeopleFill, color: "#d97706", bg: "rgba(217, 119, 6, 0.15)" },
  { value: "book", label: "Education / Schools", component: BsBook, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" },
  { value: "globe", label: "Advocacy / Global", component: BsGlobe2, color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.15)" },
  { value: "lightbulb", label: "Solar / Innovation", component: BsLightbulbFill, color: "#eab308", bg: "rgba(234, 179, 8, 0.15)" },
  { value: "cash", label: "Livelihood / Self-Reliance", component: BsCashCoin, color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  { value: "compass", label: "Coastal / Fisheries / Vision", component: BsCompass, color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)" },
  { value: "award", label: "Honor / Achievements", component: BsAwardFill, color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)" },
  { value: "hand", label: "Cooperation / Unity", component: BsHandThumbsUpFill, color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" },
];

function getIconComponent(iconName) {
  if (!iconName) return <BsBank2 size={24} color="#c0392b" />;

  // Check custom uploaded image (data URL or file path)
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
        style={{ width: 24, height: 24, objectFit: "contain" }}
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
      return <BsBank2 size={24} color="#c0392b" />;
    case "note":
    case "vision":
    case "document":
    case "file":
      return <BsFileEarmarkText size={24} color="#f5a000" />;
    case "cloud":
    case "mission":
    case "bullseye":
    case "target":
      return <BsBullseye size={24} color="#22c55e" />;
    case "tree":
    case "forest":
      return <BsTree size={24} color="#16a34a" />;
    case "water":
    case "river":
      return <BsWater size={24} color="#0ea5e9" />;
    case "pin":
    case "location":
    case "map":
      return <BsPinMapFill size={24} color="#d97706" />;
    case "buildings":
    case "itda":
      return <BsBuildingsFill size={24} color="#6366f1" />;
    case "heart":
    case "welfare":
      return <BsHeartFill size={24} color="#e11d48" />;
    case "shield":
    case "rights":
      return <BsShieldCheck size={24} color="#2563eb" />;
    case "users":
    case "people":
    case "community":
      return <BsPeopleFill size={24} color="#d97706" />;
    case "book":
    case "education":
      return <BsBook size={24} color="#8b5cf6" />;
    case "globe":
    case "world":
      return <BsGlobe2 size={24} color="#0ea5e9" />;
    case "lightbulb":
    case "solar":
    case "energy":
      return <BsLightbulbFill size={24} color="#eab308" />;
    case "cash":
    case "coin":
    case "livelihood":
      return <BsCashCoin size={24} color="#10b981" />;
    case "compass":
      return <BsCompass size={24} color="#6366f1" />;
    case "award":
      return <BsAwardFill size={24} color="#ec4899" />;
    case "hand":
      return <BsHandThumbsUpFill size={24} color="#f97316" />;
    default:
      return <i className={`bi bi-${clean}`} style={{ fontSize: 22, color: "#c0392b" }}></i>;
  }
}

function IconPickerDropdown({ value, onChange, label = "Card Icon" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualIcon, setManualIcon] = useState("");
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange(ev.target.result);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = "";
  };

  const filtered = BOOTSTRAP_ICON_OPTIONS.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="icon-dropdown-wrap" ref={containerRef}>
      {label && <label className="form-label">{label}</label>}

      {/* Button showing current selected icon */}
      <button
        type="button"
        className="icon-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="icon-dropdown-thumb">
          {getIconComponent(value)}
        </div>
        <span className="icon-dropdown-selected-name">
          {BOOTSTRAP_ICON_OPTIONS.find((o) => o.value === value)?.label ||
            (value && value.startsWith("data:") ? "Custom Image Icon" : `Bootstrap: ${value || "bank"}`)}
        </span>
        <FaChevronDown size={11} className={`icon-dropdown-arrow ${isOpen ? "open" : ""}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="icon-dropdown-popover">
          {/* Search bar */}
          <div className="icon-search-bar">
            <FaSearch size={11} color="#8892a4" />
            <input
              type="text"
              className="icon-search-input"
              placeholder="Search icons (e.g. bank, tree, water, pin)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Grid of Bootstrap Icon Options */}
          <div className="icon-grid-scroll">
            {filtered.map((opt) => {
              const active = value === opt.value;
              return (
                <div
                  key={opt.value}
                  className={`icon-grid-item ${active ? "active" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <div className="icon-box-badge" style={{ background: opt.bg }}>
                    <opt.component size={20} color={opt.color} />
                  </div>
                  <div className="icon-grid-text">
                    <span className="icon-grid-title">{opt.label}</span>
                    <span className="icon-grid-sub">bi-{opt.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Add: Type Bootstrap Icon name */}
          <div className="icon-manual-add">
            <div className="icon-manual-label">Type Bootstrap Icon Name Manually:</div>
            <div className="icon-manual-flex">
              <input
                type="text"
                className="icon-manual-input"
                placeholder="e.g. water, tree, compass, pin, flag..."
                value={manualIcon}
                onChange={(e) => setManualIcon(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manualIcon.trim()) {
                    e.preventDefault();
                    onChange(manualIcon.trim());
                    setIsOpen(false);
                  }
                }}
              />
              {manualIcon.trim() && (
                <div className="icon-manual-thumb">
                  {getIconComponent(manualIcon.trim())}
                </div>
              )}
              <button
                type="button"
                className="btn-apply-manual"
                disabled={!manualIcon.trim()}
                onClick={() => {
                  onChange(manualIcon.trim());
                  setIsOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Upload Custom Icon Image */}
          <div className="icon-upload-section">
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="btn-upload-custom-icon"
              onClick={() => fileRef.current?.click()}
            >
              <FaFolderOpen size={12} /> Upload Custom Icon Image (PNG / SVG)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function compressAndOptimizeImage(file, maxWidth = 1280, maxHeight = 960, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      return reject(new Error("Please upload a valid image file."));
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeFormatted =
          approxBytes > 1024 * 1024
            ? (approxBytes / (1024 * 1024)).toFixed(2) + " MB"
            : (approxBytes / 1024).toFixed(0) + " KB";

        resolve({
          dataUrl,
          name: file.name,
          size: sizeFormatted,
          width,
          height,
          originalFile: file,
        });
      };
      img.onerror = () => reject(new Error("Failed to process image in canvas."));
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function AdminEditHome() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState(false);
  const [activeTab, setActiveTab] = useState("about"); // 'about' | 'regions' | 'features' | 'slides' | 'text'

  // Slides state
  const [slides, setSlides] = useState(() => {
    try {
      const local = localStorage.getItem(HERO_SLIDES_KEY);
      if (local) return JSON.parse(local);
    } catch {}
    return defaultHeroSlides;
  });
  // Pure image upload state - strictly images only, no URLs
  const [uploadedImage, setUploadedImage] = useState(null); // { dataUrl, name, size }
  const [newSubtitle, setNewSubtitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Edit slide state
  const [editingSlideId, setEditingSlideId] = useState(null);
  const [editSlideDraft, setEditSlideDraft] = useState({ image_url: "", subtitle: "", sort_order: 1 });
  const [editDragging, setEditDragging] = useState(false);
  const editFileInputRef = useRef(null);

  // Feature Cards state (Our Work, Our Vision, Our Mission, etc.)
  const [features, setFeatures] = useState(() => {
    try {
      const local = localStorage.getItem(HOME_FEATURES_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultHomeFeatures;
  });
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    link_url: "/about",
    icon_name: "university",
  });
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [editFeatureDraft, setEditFeatureDraft] = useState({
    title: "",
    description: "",
    link_url: "/about",
    icon_name: "university",
    sort_order: 1,
  });

  // "Who We Are" About Section state
  const [aboutData, setAboutData] = useState(() => {
    try {
      const local = localStorage.getItem(HOME_ABOUT_KEY);
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
  const [aboutPreviewUrl, setAboutPreviewUrl] = useState(null);
  const [newChecklistPoint, setNewChecklistPoint] = useState("");
  const [aboutDragging, setAboutDragging] = useState(false);
  const aboutFileInputRef = useRef(null);

  // "Where We Work" Regions Section state
  const [regionsList, setRegionsList] = useState(() => {
    try {
      const local = localStorage.getItem(HOME_REGIONS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultRegions;
  });
  const [regionsHeader, setRegionsHeader] = useState(() => {
    try {
      const local = localStorage.getItem(REGIONS_HEADER_KEY);
      if (local) return JSON.parse(local);
    } catch {}
    return {
      badge: "Where We Work",
      title: "Three Regions, One Commitment",
      subtitle: "From the Eastern Ghats agency hills to the Godavari submergence belt and the Krishna coast, ALERT stands with Adivasi communities wherever rights are at stake.",
      map_text: "Explore our interactive area map",
      map_link: "/area-of-operation",
    };
  });
  const [newRegion, setNewRegion] = useState({
    title: "",
    tag: "",
    description: "",
    mandals: "",
    tribes: "",
    stat_badge: "",
    accent_color: "#3E8E0F",
    icon_name: "tree",
    image_url: "",
  });
  const [newRegionImg, setNewRegionImg] = useState(null); // { dataUrl, name, size }
  const [regionDragging, setRegionDragging] = useState(false);
  const regionFileInputRef = useRef(null);

  // Edit Region state
  const [editingRegionId, setEditingRegionId] = useState(null);
  const [editRegionDraft, setEditRegionDraft] = useState(null);
  const [editRegionDragging, setEditRegionDragging] = useState(false);
  const editRegionFileInputRef = useRef(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const adminKey = sessionStorage.getItem(KEY_STORAGE) || "";

  // Load config
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HOME_CONFIG_KEY);
      if (stored) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const showNotice = (msg) => {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 3500);
  };

  // Sync helpers with quota protection
  const syncSlides = (newSlides) => {
    setSlides(newSlides);
    try {
      localStorage.setItem(HERO_SLIDES_KEY, JSON.stringify(newSlides));
    } catch (e) {
      console.warn("Storage quota warning for slides:", e);
    }
    window.dispatchEvent(new Event("alertngo_hero_updated"));
  };

  const syncFeatures = (newFeatures) => {
    setFeatures(newFeatures);
    try {
      localStorage.setItem(HOME_FEATURES_KEY, JSON.stringify(newFeatures));
    } catch (e) {
      console.warn("Storage quota warning for features:", e);
    }
    window.dispatchEvent(new Event("alertngo_features_updated"));
  };

  const syncAbout = (newAbout) => {
    const merged = { ...newAbout };
    if (!Array.isArray(merged.impact_stats) || merged.impact_stats.length === 0) {
      merged.impact_stats = defaultHomeAbout.impact_stats;
    }
    setAboutData(merged);
    newAbout = merged;
    try {
      localStorage.setItem(HOME_ABOUT_KEY, JSON.stringify(newAbout));
    } catch (e) {
      console.warn("Storage quota warning for about:", e);
    }
    window.dispatchEvent(new Event("alertngo_about_updated"));
  };

  const syncRegions = (newList) => {
    setRegionsList(newList);
    try {
      localStorage.setItem(HOME_REGIONS_KEY, JSON.stringify(newList));
    } catch (e) {
      console.warn("Storage quota warning for regions:", e);
    }
    window.dispatchEvent(new Event("alertngo_regions_updated"));
  };

  const syncRegionsHeader = (newHdr) => {
    setRegionsHeader(newHdr);
    try {
      localStorage.setItem(REGIONS_HEADER_KEY, JSON.stringify(newHdr));
    } catch (e) {
      console.warn("Storage quota warning for regions header:", e);
    }
    window.dispatchEvent(new Event("alertngo_regions_updated"));
  };

  const loadAll = useCallback(async () => {
    try {
      if (adminKey) {
        const [slidesRes, featsRes, aboutRes, regionsRes] = await Promise.allSettled([
          adminListHeroSlides(adminKey),
          adminListHomeFeatures(adminKey),
          fetchHomeAbout(),
          adminListRegions(adminKey),
        ]);
        if (slidesRes.status === "fulfilled" && slidesRes.value?.data?.length > 0) {
          const local = localStorage.getItem(HERO_SLIDES_KEY);
          if (local) {
            try {
              const parsed = JSON.parse(local);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setSlides(parsed);
              } else {
                syncSlides(slidesRes.value.data);
              }
            } catch {
              syncSlides(slidesRes.value.data);
            }
          } else {
            syncSlides(slidesRes.value.data);
          }
        }
        if (featsRes.status === "fulfilled" && featsRes.value?.data?.length > 0) {
          syncFeatures(featsRes.value.data);
        }
        if (aboutRes.status === "fulfilled" && aboutRes.value?.data) {
          const local = localStorage.getItem(HOME_ABOUT_KEY);
          if (local) {
            try {
              const parsed = JSON.parse(local);
              if (parsed && (parsed.image_url || parsed.title)) {
                const merged = { ...defaultHomeAbout, ...aboutRes.value.data, ...parsed };
                if (!Array.isArray(merged.impact_stats) || merged.impact_stats.length === 0) {
                  merged.impact_stats = defaultHomeAbout.impact_stats;
                }
                setAboutData(merged);
              } else {
                syncAbout({ ...defaultHomeAbout, ...aboutRes.value.data });
              }
            } catch {
              syncAbout({ ...defaultHomeAbout, ...aboutRes.value.data });
            }
          } else {
            syncAbout({ ...defaultHomeAbout, ...aboutRes.value.data });
          }
        }
        if (regionsRes.status === "fulfilled" && Array.isArray(regionsRes.value?.data) && regionsRes.value.data.length > 0) {
          const local = localStorage.getItem(HOME_REGIONS_KEY);
          if (local) {
            try {
              const parsed = JSON.parse(local);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setRegionsList(parsed);
              } else {
                syncRegions(regionsRes.value.data);
              }
            } catch {
              syncRegions(regionsRes.value.data);
            }
          } else {
            syncRegions(regionsRes.value.data);
          }
        }
      }
    } catch {}
  }, [adminKey]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Auto-Compress & Auto-Upload Image Processing ──
  const processImageFile = async (file, onSuccess, onServerUploaded, folder = "home") => {
    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please upload an image file only (PNG, JPG, JPEG, WEBP, GIF). Video files are not supported.");
      return;
    }

    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("The selected image is larger than 25MB. Please choose a smaller image.");
      return;
    }

    setError("");
    try {
      // 1. Instant client-side canvas compression (< 120KB)
      // Produces an optimized web JPEG loaded directly in memory
      const compressed = await compressAndOptimizeImage(file);

      // Immediately deliver the memory dataUrl to onSuccess!
      // This is 100% reliable, renders instantly in 0ms, and cannot 404 or show broken image icons.
      onSuccess({
        dataUrl: compressed.dataUrl,
        name: file.name,
        size: compressed.size,
      });

      // 2. Physical server file upload in the background
      if (adminKey) {
        adminUploadImage(adminKey, file, folder).then((uploadRes) => {
          if (uploadRes && uploadRes.success && uploadRes.url) {
            console.log("Background physical upload synced:", uploadRes.url);
            if (typeof onServerUploaded === "function") {
              onServerUploaded(uploadRes.url);
            }
          }
        }).catch((err) => {
          console.warn("Background upload error (using local dataUrl):", err);
        });
      }
    } catch (err) {
      console.error("Image processing error:", err);
      setError("Failed to process image file. Please try again.");
    }
  };

  // ── Slides Handlers ──
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processImageFile(
        file,
        (imgObj) => {
          setUploadedImage(imgObj);
          if (!newSubtitle) {
            const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            setNewSubtitle(autoTitle);
          }
        },
        (serverUrl) => {
          setUploadedImage((prev) => ({ ...prev, serverUrl }));
        },
        "hero"
      );
    }
  };
  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processImageFile(
        file,
        (imgObj) => {
          setUploadedImage(imgObj);
          if (!newSubtitle) {
            const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            setNewSubtitle(autoTitle);
          }
        },
        (serverUrl) => {
          setUploadedImage((prev) => ({ ...prev, serverUrl }));
        },
        "hero"
      );
    }
    if (e.target) e.target.value = "";
  };

  const handleEditFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processImageFile(
        file,
        (imgObj) => {
          const chosenUrl = imgObj.serverUrl || imgObj.dataUrl;
          setEditSlideDraft((prev) => ({ ...prev, image_url: chosenUrl }));
          showNotice(`Image updated to ${file.name}`);
        },
        (serverUrl) => {
          setEditSlideDraft((prev) => ({ ...prev, image_url: serverUrl }));
        },
        "hero"
      );
    }
    if (e.target) e.target.value = "";
  };
  const handleEditDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processImageFile(
        file,
        (imgObj) => {
          const chosenUrl = imgObj.serverUrl || imgObj.dataUrl;
          setEditSlideDraft((prev) => ({ ...prev, image_url: chosenUrl }));
          showNotice(`Image updated to ${file.name}`);
        },
        (serverUrl) => {
          setEditSlideDraft((prev) => ({ ...prev, image_url: serverUrl }));
        },
        "hero"
      );
    }
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!uploadedImage || !uploadedImage.dataUrl) {
      setError("Please drop an image or click Browse Image to upload.");
      return;
    }
    setError("");
    const chosenUrl = uploadedImage.serverUrl || uploadedImage.dataUrl;
    const newSlideObj = {
      id: Date.now(),
      image_url: chosenUrl,
      subtitle: newSubtitle.trim() || uploadedImage.name || "Defending Adivasi Forest & Land Rights",
      sort_order: slides.length + 1,
      is_active: 1,
    };
    if (adminKey) {
      try {
        await adminCreateHeroSlide(adminKey, newSlideObj);
      } catch {}
    }
    syncSlides([...slides, newSlideObj]);
    setUploadedImage(null);
    setNewSubtitle("");
    showNotice("New hero slide image uploaded and added!");
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm("Delete this hero slide?")) return;
    if (adminKey) {
      try {
        await adminDeleteHeroSlide(adminKey, id);
      } catch {}
    }
    syncSlides(slides.filter((s) => s.id !== id));
    showNotice("Slide deleted.");
  };

  const handleSaveSlideEdit = async (id) => {
    if (!editSlideDraft.image_url) {
      setError("Slide must have an image.");
      return;
    }
    if (adminKey) {
      try {
        await adminUpdateHeroSlide(adminKey, {
          id,
          image_url: editSlideDraft.image_url,
          subtitle: editSlideDraft.subtitle.trim(),
          sort_order: Number(editSlideDraft.sort_order) || 1,
        });
      } catch {}
    }
    const updated = slides.map((s) =>
      s.id === id
        ? {
            ...s,
            image_url: editSlideDraft.image_url,
            bg: editSlideDraft.image_url,
            subtitle: editSlideDraft.subtitle.trim(),
            sub: editSlideDraft.subtitle.trim(),
            sort_order: Number(editSlideDraft.sort_order) || 1,
          }
        : s
    );
    syncSlides(updated);
    setEditingSlideId(null);
    showNotice("Slide updated.");
  };

  const moveSlide = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    syncSlides(reordered);
    showNotice("Slide order updated.");
  };

  // ── Features Handlers (Our Work, Our Vision, Our Mission) ──
  const handleAddFeature = async (e) => {
    e.preventDefault();
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      setError("Please fill in both Card Title and Description.");
      return;
    }
    setError("");

    const newFeatObj = {
      id: Date.now(),
      title: newFeature.title.trim(),
      description: newFeature.description.trim(),
      link_url: newFeature.link_url.trim() || "/about",
      icon_name: newFeature.icon_name || "university",
      is_active: 1,
      sort_order: features.length + 1,
    };

    if (adminKey) {
      try {
        await adminCreateHomeFeature(adminKey, newFeatObj);
      } catch {}
    }
    syncFeatures([...features, newFeatObj]);
    setNewFeature({ title: "", description: "", link_url: "/about", icon_name: "university" });
    showNotice("New feature card added! Check the Home page.");
  };

  const handleDeleteFeature = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feature card?")) return;
    if (adminKey) {
      try {
        await adminDeleteHomeFeature(adminKey, id);
      } catch {}
    }
    syncFeatures(features.filter((f) => f.id !== id));
    showNotice("Feature card deleted.");
  };

  const startEditFeature = (feat) => {
    setEditingFeatureId(feat.id);
    setEditFeatureDraft({
      title: feat.title,
      description: feat.description || feat.desc || "",
      link_url: feat.link_url || feat.link || "/about",
      icon_name: feat.icon_name || "university",
      sort_order: feat.sort_order || 1,
    });
  };

  const handleSaveFeatureEdit = async (id) => {
    if (!editFeatureDraft.title.trim() || !editFeatureDraft.description.trim()) {
      setError("Title and Description cannot be empty.");
      return;
    }
    if (adminKey) {
      try {
        await adminUpdateHomeFeature(adminKey, {
          id,
          ...editFeatureDraft,
        });
      } catch {}
    }
    const updated = features.map((f) =>
      f.id === id ? { ...f, ...editFeatureDraft } : f
    );
    syncFeatures(updated);
    setEditingFeatureId(null);
    showNotice("Feature card updated successfully!");
  };

  const moveFeature = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= features.length) return;
    const reordered = [...features];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    syncFeatures(reordered);
    showNotice("Card order updated.");
  };

  // ── "Who We Are" About Handlers ──
  const handleSaveAbout = async (e) => {
    if (e) e.preventDefault();
    if (adminKey) {
      try {
        await adminSaveHomeAbout(adminKey, aboutData);
      } catch (err) {
        console.warn("API save error:", err);
      }
    }
    syncAbout(aboutData);
    showNotice("Who We Are section saved and updated on the Home page!");
  };

  const handleResetAbout = () => {
    if (window.confirm("Reset Who We Are section form back to default? Click 'Save Who We Are Section' below to apply.")) {
      setAboutPreviewUrl(null);
      setAboutData(defaultHomeAbout);
      showNotice("Form reset to defaults. Click 'Save Who We Are Section' below to apply changes.");
    }
  };

  const handleAddChecklistPoint = (e) => {
    e.preventDefault();
    if (!newChecklistPoint.trim()) return;
    const current = Array.isArray(aboutData.features) ? aboutData.features : [];
    setAboutData({
      ...aboutData,
      features: [...current, newChecklistPoint.trim()],
    });
    setNewChecklistPoint("");
  };

  const handleRemoveChecklistPoint = (index) => {
    const current = Array.isArray(aboutData.features) ? aboutData.features : [];
    setAboutData({
      ...aboutData,
      features: current.filter((_, i) => i !== index),
    });
  };

  const handleAboutFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processImageFile(
        file,
        (imgObj) => {
          // 1. Immediately show in-memory preview in editor (NOT saved yet!)
          setAboutPreviewUrl(imgObj.dataUrl);
          setAboutData((prev) => ({
            ...prev,
            image_url: imgObj.dataUrl,
          }));
          showNotice(`Photo loaded in preview. Click "Save Who We Are Section" below to apply.`);
        },
        (serverUrl) => {
          // 2. Physical server file ready on disk; stages the URL for when the user clicks Save
          setAboutData((prev) => ({
            ...prev,
            image_url: serverUrl,
          }));
        }
      );
    }
    if (e.target) e.target.value = "";
  };

  const handleAboutDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAboutDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processImageFile(
        file,
        (imgObj) => {
          // 1. Immediately show in-memory preview in editor (NOT saved yet!)
          setAboutPreviewUrl(imgObj.dataUrl);
          setAboutData((prev) => ({
            ...prev,
            image_url: imgObj.dataUrl,
          }));
          showNotice(`Photo loaded in preview. Click "Save Who We Are Section" below to apply.`);
        },
        (serverUrl) => {
          // 2. Physical server file ready on disk; stages the URL for when the user clicks Save
          setAboutData((prev) => ({
            ...prev,
            image_url: serverUrl,
          }));
        }
      );
    }
  };

  // ── "Where We Work" Regions Handlers ──
  const handleSaveRegionsHeader = (e) => {
    e.preventDefault();
    syncRegionsHeader(regionsHeader);
    showNotice("Regions header section updated!");
  };

  const handleAddRegion = async (e) => {
    e.preventDefault();
    if (!newRegion.title.trim()) {
      setError("Please enter a Region Title (e.g. ASR Hill Agency).");
      return;
    }
    const finalImg = newRegionImg?.serverUrl || newRegionImg?.dataUrl || newRegion.image_url || "/uploads/region-asr-culture.jpg";
    const regionObj = {
      id: Date.now(),
      title: newRegion.title.trim(),
      tag: newRegion.tag.trim(),
      description: newRegion.description.trim(),
      desc: newRegion.description.trim(),
      mandals: newRegion.mandals.trim(),
      tribes: newRegion.tribes.trim(),
      stat_badge: newRegion.stat_badge.trim() || newRegion.mandals.trim(),
      stat: newRegion.stat_badge.trim() || newRegion.mandals.trim(),
      accent_color: newRegion.accent_color || "#3E8E0F",
      accent: newRegion.accent_color || "#3E8E0F",
      icon_name: newRegion.icon_name || "tree",
      image_url: finalImg,
      img: finalImg,
      sort_order: regionsList.length + 1,
      is_active: 1,
    };

    if (adminKey) {
      try {
        await adminCreateRegion(adminKey, regionObj);
      } catch (err) {}
    }

    syncRegions([...regionsList, regionObj]);
    setNewRegion({
      title: "",
      tag: "",
      description: "",
      mandals: "",
      tribes: "",
      stat_badge: "",
      accent_color: "#3E8E0F",
      icon_name: "tree",
      image_url: "",
    });
    setNewRegionImg(null);
    showNotice("New Region Card added! Check the Home page.");
  };

  const handleDeleteRegion = async (id) => {
    if (!window.confirm("Delete this Region Card?")) return;
    if (adminKey) {
      try {
        await adminDeleteRegion(adminKey, id);
      } catch (err) {}
    }
    syncRegions(regionsList.filter((r) => r.id !== id));
    showNotice("Region Card deleted.");
  };

  const startEditRegion = (region) => {
    setEditingRegionId(region.id);
    setEditRegionDraft({
      ...region,
      description: region.description || region.desc || "",
      stat_badge: region.stat_badge || region.stat || "",
      accent_color: region.accent_color || region.accent || "#3E8E0F",
      icon_name: region.icon_name || "tree",
      image_url: region.image_url || region.img || "",
    });
  };

  const handleSaveRegionEdit = async (id) => {
    if (!editRegionDraft.title.trim()) {
      setError("Region Title cannot be empty.");
      return;
    }
    const updatedObj = {
      ...editRegionDraft,
      desc: editRegionDraft.description,
      stat: editRegionDraft.stat_badge,
      accent: editRegionDraft.accent_color,
      img: editRegionDraft.image_url,
    };
    if (adminKey) {
      try {
        await adminUpdateRegion(adminKey, updatedObj);
      } catch (err) {}
    }
    const updated = regionsList.map((r) => (r.id === id ? { ...r, ...updatedObj } : r));
    syncRegions(updated);
    setEditingRegionId(null);
    setEditRegionDraft(null);
    showNotice("Region card updated successfully!");
  };

  const moveRegion = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= regionsList.length) return;
    const reordered = [...regionsList];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    syncRegions(reordered);
    showNotice("Region card display order updated.");
  };

  const handleRegionFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processImageFile(
        e.target.files[0],
        (imgObj) => {
          const chosenUrl = imgObj.serverUrl || imgObj.dataUrl;
          setNewRegionImg(imgObj);
          setNewRegion((prev) => ({ ...prev, image_url: chosenUrl }));
        },
        (serverUrl) => {
          setNewRegion((prev) => ({ ...prev, image_url: serverUrl }));
        },
        "regions"
      );
    }
    if (e.target) e.target.value = "";
  };

  const handleRegionDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRegionDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processImageFile(
        e.dataTransfer.files[0],
        (imgObj) => {
          const chosenUrl = imgObj.serverUrl || imgObj.dataUrl;
          setNewRegionImg(imgObj);
          setNewRegion((prev) => ({ ...prev, image_url: chosenUrl }));
        },
        (serverUrl) => {
          setNewRegion((prev) => ({ ...prev, image_url: serverUrl }));
        },
        "regions"
      );
    }
  };

  const handleEditRegionFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processImageFile(
        e.target.files[0],
        (imgObj) => {
          const chosenUrl = imgObj.serverUrl || imgObj.dataUrl;
          setEditRegionDraft((prev) => ({ ...prev, image_url: chosenUrl }));
          showNotice(`Image updated to ${imgObj.name}`);
        },
        (serverUrl) => {
          setEditRegionDraft((prev) => ({ ...prev, image_url: serverUrl }));
        },
        "regions"
      );
    }
    if (e.target) e.target.value = "";
  };

  const handleEditRegionDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditRegionDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processImageFile(
        e.dataTransfer.files[0],
        (imgObj) => {
          const chosenUrl = imgObj.serverUrl || imgObj.dataUrl;
          setEditRegionDraft((prev) => ({ ...prev, image_url: chosenUrl }));
          showNotice(`Image updated to ${imgObj.name}`);
        },
        (serverUrl) => {
          setEditRegionDraft((prev) => ({ ...prev, image_url: serverUrl }));
        },
        "regions"
      );
    }
  };

  // Text Config save
  const handleSaveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem(HOME_CONFIG_KEY, JSON.stringify(config));
    setSavedConfig(true);
    setTimeout(() => setSavedConfig(false), 3000);
  };

  const handleResetConfig = () => {
    if (window.confirm("Reset all Home Page text settings back to default?")) {
      localStorage.removeItem(HOME_CONFIG_KEY);
      setConfig(DEFAULT_CONFIG);
      setSavedConfig(true);
      setTimeout(() => setSavedConfig(false), 3000);
    }
  };

  return (
    <AdminLayout title="Manage Home Page Content">
      <style>{`
        .edit-nav-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid #1e2436;
          padding-bottom: 10px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          flex-wrap: nowrap;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .edit-nav-tabs::-webkit-scrollbar {
          height: 6px;
        }
        .edit-nav-tabs::-webkit-scrollbar-thumb {
          background: #2a3148;
          border-radius: 3px;
        }
        .tab-btn {
          background: #141820;
          color: #8892a4;
          border: 1.5px solid #1e2436;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tab-btn:hover {
          color: #fff;
          border-color: #2a3148;
          background: #1c2232;
        }
        .tab-btn.active {
          background: #c0392b;
          color: #fff;
          border-color: #c0392b;
          box-shadow: 0 2px 10px rgba(192, 57, 43, 0.35);
        }
        .grid-2col {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }
        @media(max-width: 960px) {
          .grid-2col { grid-template-columns: 1fr; }
        }
        .adm-card-panel {
          background: #141820;
          border: 1px solid #1e2436;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .adm-card-panel h2 {
          color: #fff;
          font-size: 1.15rem;
          margin: 0 0 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          color: #8892a4;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          background: #1e2436;
          border: 1.5px solid #2a3148;
          border-radius: 10px;
          color: #e8edf5;
          font-size: 0.92rem;
          padding: 12px 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s;
          font-family: inherit;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: #c0392b; }
        .form-textarea { min-height: 85px; resize: vertical; }
        .btn-red {
          background: #c0392b;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 11px 20px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background .2s;
        }
        .btn-red:hover { background: #a93226; }
        .btn-secondary {
          background: #252d40;
          color: #e2e8f0;
          border: 1px solid #3b455e;
          border-radius: 8px;
          padding: 11px 18px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-secondary:hover { color: #fff; background: #2f3b54; border-color: #4b5876; }
        .notice-msg {
          background: rgba(46, 204, 113, 0.15);
          border: 1px solid rgba(46, 204, 113, 0.4);
          color: #2ecc71;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 0.85rem;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .error-msg {
          background: rgba(192, 57, 43, 0.15);
          border: 1px solid rgba(192, 57, 43, 0.4);
          color: #ff6b6b;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 0.85rem;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Custom Icon Dropdown Styles ── */
        .icon-dropdown-wrap {
          position: relative;
          width: 100%;
        }
        .icon-dropdown-btn {
          width: 100%;
          background: #1e2436;
          border: 1.5px solid #2a3148;
          border-radius: 10px;
          color: #e8edf5;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-align: left;
          outline: none;
          transition: border-color .2s;
          box-sizing: border-box;
          min-height: 48px;
        }
        .icon-dropdown-btn:hover { border-color: #c0392b; }
        .icon-dropdown-thumb {
          width: 32px;
          height: 32px;
          background: rgba(210, 25, 12, 0.12);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-dropdown-selected-name {
          color: #fff;
          font-size: 0.88rem;
          font-weight: 600;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .icon-dropdown-arrow {
          color: #8892a4;
          transition: transform .2s ease;
          flex-shrink: 0;
        }
        .icon-dropdown-arrow.open {
          transform: rotate(180deg);
          color: #c0392b;
        }
        .icon-dropdown-popover {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          min-width: 320px;
          background: #141820;
          border: 1.5px solid #2a3148;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.6);
          z-index: 100;
        }
        .icon-search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1e2436;
          border: 1px solid #2a3148;
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 10px;
        }
        .icon-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 0.82rem;
          width: 100%;
        }
        .icon-grid-scroll {
          max-height: 210px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 4px;
          margin-bottom: 10px;
        }
        .icon-grid-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 8px;
          background: #181d2a;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all .15s ease;
        }
        .icon-grid-item:hover {
          background: #1e2436;
          border-color: #2a3148;
        }
        .icon-grid-item.active {
          background: rgba(192, 57, 43, 0.15);
          border-color: #c0392b;
        }
        .icon-box-badge {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-grid-text {
          display: flex;
          flex-direction: column;
        }
        .icon-grid-title {
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .icon-grid-sub {
          color: #8892a4;
          font-size: 0.68rem;
          font-family: monospace;
        }
        .icon-manual-add {
          border-top: 1px solid #1e2436;
          padding-top: 10px;
          margin-bottom: 10px;
        }
        .icon-manual-label {
          color: #8892a4;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .icon-manual-flex {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .icon-manual-input {
          flex: 1;
          background: #1e2436;
          border: 1px solid #2a3148;
          border-radius: 6px;
          color: #fff;
          padding: 7px 10px;
          font-size: 0.8rem;
          outline: none;
        }
        .icon-manual-input:focus { border-color: #c0392b; }
        .icon-manual-thumb {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: #1e2436;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #2a3148;
        }
        .btn-apply-manual {
          background: #c0392b;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 7px 12px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-apply-manual:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .icon-upload-section {
          border-top: 1px solid #1e2436;
          padding-top: 8px;
        }
        .btn-upload-custom-icon {
          width: 100%;
          background: #1e2436;
          color: #8892a4;
          border: 1px dashed #2a3148;
          border-radius: 6px;
          padding: 7px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all .2s;
        }
        .btn-upload-custom-icon:hover {
          background: #252d40;
          color: #fff;
          border-color: #c0392b;
        }

        /* Item styling */
        .card-item {
          background: #1e2436;
          border: 1px solid #2a3148;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }
        .card-item:hover { border-color: rgba(192,57,43,0.4); }
        .card-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .card-item-title-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .card-icon-wrap {
          width: 42px;
          height: 42px;
          background: #141820;
          border: 1px solid #2a3148;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-item-title {
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
        }
        .card-item-link {
          color: #8892a4;
          font-size: 0.75rem;
        }
        .card-item-desc {
          color: #cbd5e1;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 8px 0 12px;
        }
        .card-item-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-end;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 10px;
        }
        .icon-btn {
          background: #141820;
          border: 1px solid #2a3148;
          color: #8892a4;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn:hover { color: #fff; border-color: #c0392b; }
        .icon-btn-danger:hover { background: #c0392b; color: #fff; border-color: #c0392b; }

        /* Slides styling */
        .slide-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #1e2436;
          border: 1px solid #2a3148;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 12px;
        }
        .slide-thumb {
          width: 90px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          background: #000;
          flex-shrink: 0;
          border: 1px solid #2a3148;
        }
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 8px;
          margin-top: 10px;
        }
        .preset-card {
          background: #1e2436;
          border: 1.5px solid #2a3148;
          border-radius: 8px;
          padding: 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .preset-card:hover { border-color: #c0392b; background: #252d40; }
        .preset-img {
          width: 100%;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        .preset-label {
          color: #8892a4;
          font-size: 0.68rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Image Upload Dropzone & Preview Styles ── */
        .upload-dropzone {
          border: 2px dashed #2a3148;
          background: #181d2a;
          border-radius: 12px;
          padding: 24px 18px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .upload-dropzone:hover {
          border-color: #c0392b;
          background: #1c2232;
        }
        .upload-dropzone.dragging {
          border-color: #c0392b;
          background: rgba(192, 57, 43, 0.14);
          transform: scale(1.01);
        }
        .upload-icon {
          color: #c0392b;
          margin-bottom: 10px;
          transition: transform 0.2s ease;
        }
        .upload-dropzone:hover .upload-icon {
          transform: translateY(-3px);
        }
        .upload-title {
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .upload-sub {
          color: #8892a4;
          font-size: 0.8rem;
          margin-bottom: 12px;
        }
        .btn-browse {
          background: #2a3148;
          color: #ffffff;
          border: 1px solid #3a445d;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-browse:hover {
          background: #c0392b;
          border-color: #c0392b;
        }
        .upload-hint {
          color: #64748b;
          font-size: 0.74rem;
          margin-top: 10px;
        }
        .uploaded-preview-box {
          background: #181d2a;
          border: 1.5px solid #2ecc71;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .preview-img-wrap {
          width: 110px;
          height: 75px;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          border: 1px solid #2a3148;
          flex-shrink: 0;
        }
        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .preview-info {
          flex: 1;
          min-width: 0;
        }
        .preview-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2ecc71;
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .preview-filename {
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .preview-filesize {
          color: #8892a4;
          font-size: 0.75rem;
          margin-bottom: 8px;
        }
        .preview-actions {
          display: flex;
          gap: 8px;
        }
        .btn-change-image {
          background: #2a3148;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-change-image:hover { background: #3a445d; }
        .btn-remove-image {
          background: rgba(192, 57, 43, 0.2);
          color: #ff6b6b;
          border: 1px solid rgba(192, 57, 43, 0.4);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-remove-image:hover { background: #c0392b; color: #fff; }

        /* Checklist Manager */
        .checklist-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1e2436;
          border: 1px solid #2a3148;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 6px;
          font-size: 0.85rem;
          color: #e8edf5;
        }
        .checklist-item .chk-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2ecc71;
          font-weight: 700;
        }
        .color-swatches {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .color-swatch-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s, border-color 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .color-swatch-btn:hover {
          transform: scale(1.15);
        }
        .color-swatch-btn.active {
          border-color: #ffffff;
          box-shadow: 0 0 0 2px #c0392b;
        }

        .edit-inline-dropzone {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #141820;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
          max-width: 100%;
        }
        .edit-drop-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .edit-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }

        /* ── COMPREHENSIVE RESPONSIVE MOBILE OPTIMIZATION (max-width: 768px & 480px) ── */
        @media (max-width: 768px) {
          .grid-2col {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          /* Force all inline 2-col and 3-col form rows across all tabs to stack cleanly on mobile */
          div[style*="grid-template-columns"],
          div[style*="gridTemplateColumns"],
          form div[style*="grid-template-columns"],
          form div[style*="gridTemplateColumns"],
          .card-item div[style*="grid-template-columns"],
          .card-item div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .edit-nav-tabs {
            gap: 6px !important;
            margin-bottom: 14px !important;
            padding-bottom: 8px !important;
          }
          .tab-btn {
            padding: 6px 13px !important;
            font-size: 0.74rem !important;
            gap: 6px !important;
          }

          .adm-card-panel {
            padding: 12px 10px !important;
            margin-bottom: 14px !important;
            border-radius: 10px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .adm-card-panel h2 {
            font-size: 0.88rem !important;
            margin-bottom: 10px !important;
            line-height: 1.3 !important;
            flex-wrap: wrap !important;
          }

          .form-group {
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }
          .form-label {
            font-size: 0.68rem !important;
            margin-bottom: 4px !important;
            letter-spacing: 0.03em !important;
          }
          .form-input, .form-textarea, .form-select {
            padding: 7px 9px !important;
            font-size: 0.78rem !important;
            border-radius: 7px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
          }
          .form-textarea {
            min-height: 70px !important;
          }

          /* Action and Submit Buttons */
          .btn-red, .btn-secondary {
            padding: 7px 12px !important;
            font-size: 0.75rem !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
          }
          div:has(> .btn-red):has(> .btn-secondary) {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          div:has(> .btn-red):has(> .btn-secondary) button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }

          /* Inline Edit Dropzones & Buttons */
          .edit-inline-dropzone {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 11px 10px !important;
          }
          .edit-drop-content {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .edit-inline-dropzone .btn-browse {
            width: 100% !important;
            justify-content: center !important;
            padding: 8px 12px !important;
            font-size: 0.76rem !important;
            box-sizing: border-box !important;
            text-align: center !important;
          }
          .edit-card-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
            margin-top: 8px !important;
          }
          .edit-card-actions button {
            width: 100% !important;
            justify-content: center !important;
            padding: 8px 10px !important;
            font-size: 0.76rem !important;
            box-sizing: border-box !important;
            text-align: center !important;
            border-radius: 6px !important;
          }

          /* Card Item & List */
          .card-item {
            padding: 10px !important;
            border-radius: 8px !important;
            margin-bottom: 10px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .card-item-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }
          .card-item-title-box {
            width: 100% !important;
            gap: 8px !important;
          }
          .card-icon-wrap {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
            border-radius: 6px !important;
          }
          .card-icon-wrap svg {
            width: 14px !important;
            height: 14px !important;
          }
          .card-item-title {
            font-size: 0.84rem !important;
            line-height: 1.25 !important;
          }
          .card-item-link {
            font-size: 0.68rem !important;
            word-break: break-all !important;
          }
          .card-item-desc {
            font-size: 0.74rem !important;
            line-height: 1.38 !important;
            margin: 6px 0 8px !important;
          }
          .card-item-actions {
            justify-content: flex-end !important;
            gap: 6px !important;
            width: 100% !important;
            padding-top: 6px !important;
          }
          .card-item-actions .icon-btn {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.72rem !important;
            border-radius: 5px !important;
          }

          /* Hero Slide Items */
          .slide-item {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            padding: 10px !important;
            box-sizing: border-box !important;
          }
          .slide-thumb {
            width: 100% !important;
            height: 110px !important;
            border-radius: 6px !important;
          }

          /* Image Upload Dropzone & Previews */
          .upload-dropzone {
            padding: 14px 10px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
          }
          .upload-icon {
            margin-bottom: 6px !important;
          }
          .upload-title {
            font-size: 0.82rem !important;
            line-height: 1.3 !important;
          }
          .upload-sub {
            font-size: 0.72rem !important;
            margin-bottom: 8px !important;
          }
          .btn-browse {
            padding: 6px 12px !important;
            font-size: 0.74rem !important;
          }
          .upload-hint {
            font-size: 0.66rem !important;
            line-height: 1.35 !important;
            margin-top: 6px !important;
          }

          .uploaded-preview-box {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 9px !important;
            gap: 8px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
          }
          .preview-img-wrap {
            width: 100% !important;
            height: 110px !important;
            border-radius: 6px !important;
          }
          .preview-filename {
            font-size: 0.78rem !important;
          }
          .preview-filesize {
            font-size: 0.68rem !important;
            margin-bottom: 6px !important;
          }
          .preview-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .btn-change-image, .btn-remove-image {
            justify-content: center !important;
            padding: 6px 8px !important;
            font-size: 0.70rem !important;
            box-sizing: border-box !important;
            width: 100% !important;
          }

          /* Icon Picker Popover Mobile Drawer */
          .icon-dropdown-popover {
            position: fixed !important;
            top: auto !important;
            bottom: 8px !important;
            left: 8px !important;
            right: 8px !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: calc(100vw - 16px) !important;
            max-height: 65vh !important;
            overflow-y: auto !important;
            z-index: 99999 !important;
            box-shadow: 0 16px 45px rgba(0,0,0,0.85) !important;
            box-sizing: border-box !important;
            border-radius: 12px !important;
            padding: 10px !important;
          }

          /* Presets Grid */
          .preset-grid {
            grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)) !important;
            gap: 5px !important;
          }
          .preset-card {
            padding: 4px !important;
          }
          .preset-img {
            height: 38px !important;
          }
          .preset-label {
            font-size: 0.60rem !important;
          }

          /* Checklist Items */
          .checklist-item {
            padding: 6px 8px !important;
            font-size: 0.74rem !important;
            gap: 6px !important;
            box-sizing: border-box !important;
          }

          /* Notice & Error Messages */
          .notice-msg, .error-msg {
            padding: 8px 10px !important;
            font-size: 0.74rem !important;
            margin-bottom: 12px !important;
            word-break: break-word !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Tabs */}
      <div className="edit-nav-tabs">
        <button
          className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          <FaUsers size={14} /> Who We Are (About Section)
        </button>
        <button
          className={`tab-btn ${activeTab === "regions" ? "active" : ""}`}
          onClick={() => setActiveTab("regions")}
        >
          <FaMapMarkerAlt size={14} /> Where We Work ({regionsList.length} Regions)
        </button>
        <Link
          to="/admin/programs"
          className="tab-btn"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <FaHandsHelping size={14} /> What We Do (Key Programs)
        </Link>
        <Link
          to="/admin/reels"
          className="tab-btn"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <FaInstagram size={14} color="#e1306c" /> Instagram Reels
        </Link>
        <Link
          to="/admin/testimonials"
          className="tab-btn"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <FaQuoteLeft size={14} color="#f39c12" /> Testimonials &amp; Google Reviews
        </Link>
        <button
          className={`tab-btn ${activeTab === "features" ? "active" : ""}`}
          onClick={() => setActiveTab("features")}
        >
          <FaCompass size={14} /> Work, Vision & Mission Cards ({features.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "slides" ? "active" : ""}`}
          onClick={() => setActiveTab("slides")}
        >
          <FaImage size={14} /> Hero Slider Images ({slides.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "text" ? "active" : ""}`}
          onClick={() => setActiveTab("text")}
        >
          <FaEdit size={14} /> Hero Headlines & Text
        </button>
      </div>

      {notice && (
        <div className="notice-msg">
          <FaCheckCircle size={14} /> {notice}
        </div>
      )}
      {error && (
        <div className="error-msg">
          ⚠️ {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: WHO WE ARE (ABOUT SECTION)
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === "about" && (
        <div className="grid-2col">
          <div>
            {/* Experience Badge Settings */}
            <div className="adm-card-panel">
              <h2><FaAward size={15} /> Experience Badge on Photo</h2>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Years Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.years_number || ""}
                    onChange={(e) => setAboutData({ ...aboutData, years_number: e.target.value })}
                    placeholder="20+"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Badge Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.years_label || ""}
                    onChange={(e) => setAboutData({ ...aboutData, years_label: e.target.value })}
                    placeholder="Years of Service"
                  />
                </div>
              </div>
            </div>

            {/* Section Headings & Story Text */}
             <div className="adm-card-panel">
               <h2><FaAward size={15} /> Our Impact Stats</h2>
               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                 {(aboutData.impact_stats || []).map((s, idx) => (
                   <div key={idx} style={{ display: "grid", gridTemplateColumns: "90px 70px 1fr 1fr auto", gap: 8, alignItems: "center", background: "#111827", padding: 10, borderRadius: 8, border: "1px solid #1f293b" }}>
                     <input className="form-input" placeholder="Number" value={s.number || ""} onChange={(e) => {
                       const copy = [...(aboutData.impact_stats || [])]; copy[idx] = { ...copy[idx], number: e.target.value }; setAboutData({ ...aboutData, impact_stats: copy });
                     }} />
                     <input className="form-input" placeholder="Suffix" value={s.suffix || ""} onChange={(e) => {
                       const copy = [...(aboutData.impact_stats || [])]; copy[idx] = { ...copy[idx], suffix: e.target.value }; setAboutData({ ...aboutData, impact_stats: copy });
                     }} />
                     <input className="form-input" placeholder="Label" value={s.label || ""} onChange={(e) => {
                       const copy = [...(aboutData.impact_stats || [])]; copy[idx] = { ...copy[idx], label: e.target.value }; setAboutData({ ...aboutData, impact_stats: copy });
                     }} />
                     <input className="form-input" placeholder="Note" value={s.note || ""} onChange={(e) => {
                       const copy = [...(aboutData.impact_stats || [])]; copy[idx] = { ...copy[idx], note: e.target.value }; setAboutData({ ...aboutData, impact_stats: copy });
                     }} />
                     <button type="button" onClick={() => {
                       const copy = [...(aboutData.impact_stats || [])]; copy.splice(idx, 1); setAboutData({ ...aboutData, impact_stats: copy });
                     }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><FaTrash size={12} /></button>
                   </div>
                 ))}
                 <button type="button" className="btn-secondary" onClick={() => setAboutData({ ...aboutData, impact_stats: [...(aboutData.impact_stats || []), { number: "", suffix: "", label: "", note: "" }] })} style={{ alignSelf: "flex-start" }}>
                   <FaPlus size={11} /> Add Stat
                 </button>
               </div>
             </div>


            <div className="adm-card-panel">
              <h2><FaEdit size={15} /> Headings & Narrative Text</h2>
              <div className="form-group">
                <label className="form-label">Section Tag</label>
                <input
                  type="text"
                  className="form-input"
                  value={aboutData.tag || ""}
                  onChange={(e) => setAboutData({ ...aboutData, tag: e.target.value })}
                  placeholder="Who We Are"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section Main Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={aboutData.title || ""}
                  onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                  placeholder="Championing Adivasi Rights and Sustainable Development"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Highlight Paragraph</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 70 }}
                  value={aboutData.lead_text || ""}
                  onChange={(e) => setAboutData({ ...aboutData, lead_text: e.target.value })}
                  placeholder="Led by YL Jayaraj with 47 years of NGO experience, ALERT specializes in empowering Adivasis in Andhra Pradesh."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Story Paragraph 1</label>
                <textarea
                  className="form-textarea"
                  value={aboutData.p1 || ""}
                  onChange={(e) => setAboutData({ ...aboutData, p1: e.target.value })}
                  placeholder="ALERT, established in 2004, is a South India-based not-for-profit..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Story Paragraph 2</label>
                <textarea
                  className="form-textarea"
                  value={aboutData.p2 || ""}
                  onChange={(e) => setAboutData({ ...aboutData, p2: e.target.value })}
                  placeholder="ALERT partners with Adivasi Mahasabha, advocating for Adivasi rights..."
                />
              </div>
            </div>

            {/* Checklist of Pillars (6 points) */}
            <div className="adm-card-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2><FaListUl size={15} /> Key Pillars Checklist ({aboutData.features?.length || 0})</h2>
                <span style={{ fontSize: "0.76rem", color: "#8892a4" }}>
                  Displayed in 2 columns with checkmarks on Home
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                {(aboutData.features || []).map((pt, idx) => (
                  <div key={idx} className="checklist-item">
                    <span className="chk-pill">
                      <FaCheck size={11} /> {pt}
                    </span>
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      style={{ width: 28, height: 28 }}
                      title="Delete Point"
                      onClick={() => handleRemoveChecklistPoint(idx)}
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new checklist point */}
              <div className="checklist-add-row">
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: "8px 12px" }}
                  placeholder="e.g. Forest Rights Secured, Women Empowerment..."
                  value={newChecklistPoint}
                  onChange={(e) => setNewChecklistPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddChecklistPoint(e);
                  }}
                />
                <button
                  type="button"
                  className="btn-red"
                  style={{ padding: "8px 16px", whiteSpace: "nowrap" }}
                  onClick={handleAddChecklistPoint}
                  disabled={!newChecklistPoint.trim()}
                >
                  <FaPlus size={11} /> Add Point
                </button>
              </div>
            </div>

            {/* Action Buttons Settings */}
            <div className="adm-card-panel">
              <h2><FaLink size={15} /> Action Buttons (Links)</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Button 1 Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.btn1_text || ""}
                    onChange={(e) => setAboutData({ ...aboutData, btn1_text: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Button 1 URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.btn1_link || ""}
                    onChange={(e) => setAboutData({ ...aboutData, btn1_link: e.target.value })}
                    placeholder="/about"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Button 2 Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.btn2_text || ""}
                    onChange={(e) => setAboutData({ ...aboutData, btn2_text: e.target.value })}
                    placeholder="Get Involved"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Button 2 URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aboutData.btn2_link || ""}
                    onChange={(e) => setAboutData({ ...aboutData, btn2_link: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
              </div>
            </div>

            {/* Pure Image Upload - Drag & Drop / File Select (No URL Input) */}
            <div className="adm-card-panel">
              <h2><FaImage size={15} /> Section Photo Upload</h2>
              <label className="form-label">Drag & Drop Image or Click Browse (Images Only)</label>

              <input
                type="file"
                ref={aboutFileInputRef}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                style={{ display: "none" }}
                onChange={handleAboutFileSelect}
              />

              {(() => {
                const activeAboutImage = aboutPreviewUrl || aboutData.image_url;
                return activeAboutImage ? (
                  <>
                    <div
                      className={`uploaded-preview-box ${aboutDragging ? "dragging" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setAboutDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setAboutDragging(false); }}
                      onDrop={handleAboutDrop}
                      style={{
                        border: aboutDragging ? "2px dashed #e74c3c" : "1px solid #2a3148",
                        background: aboutDragging ? "rgba(231, 76, 60, 0.12)" : "#141a29"
                      }}
                    >
                      <div className="preview-img-wrap" style={{ width: 140, height: 95 }}>
                        <img
                          src={activeAboutImage}
                          alt="About preview"
                          className="preview-img"
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
                      <div className="preview-info">
                        <div className="preview-status">
                          <FaCheckCircle color="#2ecc71" size={13} /> Active Photo
                        </div>
                        <div className="preview-filename">
                          {activeAboutImage.startsWith("data:") ? "Custom Uploaded Photo" : activeAboutImage.split("/").pop()}
                        </div>
                        <div className="preview-filesize">PNG / JPG / WEBP &bull; Ready & Displayed</div>
                        <div className="preview-actions">
                          <button
                            type="button"
                            className="btn-change-image"
                            onClick={() => aboutFileInputRef.current?.click()}
                          >
                            <FaFolderOpen size={11} /> Replace Image
                          </button>
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => {
                              setAboutPreviewUrl(null);
                              setAboutData((prev) => ({ ...prev, image_url: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg" }));
                              showNotice("Reverted to default photo. Click 'Save Who We Are Section' below to apply.");
                            }}
                          >
                            <FaUndo size={11} /> Revert Default
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Drag & Drop target for fast replacement */}
                    <div
                      className="secondary-drop-box"
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setAboutDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setAboutDragging(false); }}
                      onDrop={handleAboutDrop}
                      onClick={() => aboutFileInputRef.current?.click()}
                      style={{
                        marginTop: 10,
                        border: aboutDragging ? "2px dashed #e74c3c" : "1.5px dashed #2a3148",
                        background: aboutDragging ? "rgba(231, 76, 60, 0.12)" : "#0f131c",
                        cursor: "pointer",
                      }}
                    >
                      <span><FaCloudUploadAlt size={16} color={aboutDragging ? "#e74c3c" : "#8892a4"} style={{ marginRight: 8, verticalAlign: -3 }} /> Drag &amp; drop another photo here or click to browse</span>
                      <span style={{ color: "#e74c3c", fontWeight: 700, fontSize: "0.78rem" }}>Browse Files</span>
                    </div>
                  </>
                ) : (
                  <div
                    className={`upload-dropzone ${aboutDragging ? "dragging" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setAboutDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setAboutDragging(false); }}
                    onDrop={handleAboutDrop}
                    onClick={() => aboutFileInputRef.current?.click()}
                  >
                    <FaCloudUploadAlt size={46} className="upload-icon" />
                    <div className="upload-title">Drag & Drop Photo Here</div>
                    <div className="upload-sub">or click to browse from your computer</div>
                    <button
                      type="button"
                      className="btn-browse"
                      onClick={(e) => { e.stopPropagation(); aboutFileInputRef.current?.click(); }}
                    >
                      <FaFolderOpen size={13} /> Browse Image File
                    </button>
                    <div className="upload-hint">
                      PNG, JPG, WEBP, GIF (Max 10MB) &bull; <strong style={{ color: "#ff8b8b" }}>Images only, videos not supported</strong>
                    </div>
                  </div>
                );
              })()}

              {/* Preset quick pick */}
              <div style={{ marginTop: 14 }}>
                <span style={{ fontSize: "0.75rem", color: "#8892a4" }}>Or select from website library:</span>
                <div className="preset-grid">
                  {PRESET_IMAGES.map((p) => (
                    <div
                      key={p.url}
                      className="preset-card"
                      onClick={() => {
                        setAboutPreviewUrl(p.url);
                        setAboutData((prev) => ({ ...prev, image_url: p.url }));
                        showNotice(`Selected photo: ${p.label}. Click 'Save Who We Are Section' below to apply.`);
                      }}
                    >
                      <img src={p.url} alt={p.label} className="preset-img" />
                      <div className="preset-label">{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Save All About Changes */}
            <div className="edit-actions-row">
              <button type="button" className="btn-red" onClick={handleSaveAbout}>
                <FaSave size={13} /> Save Who We Are Section
              </button>
              <button type="button" className="btn-secondary" onClick={handleResetAbout}>
                <FaUndo size={12} /> Reset to Defaults
              </button>
            </div>
          </div>

          {/* Right Column: Live Visual Card Preview */}
          <div>
            <div className="adm-card-panel" style={{ position: "sticky", top: 20 }}>
              <h2><FaEye size={13} /> Live Section Preview</h2>
              <div style={{
                background: "#ffffff",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                color: "#1e293b"
              }}>
                {/* Image + Experience Badge */}
                <div style={{ position: "relative", height: 180, background: "#0f172a" }}>
                  <img
                    src={aboutPreviewUrl || aboutData.image_url || "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg"}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  <div style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    background: "#c0392b",
                    color: "#ffffff",
                    borderRadius: 8,
                    padding: "6px 12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1 }}>{aboutData.years_number || "20+"}</div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>{aboutData.years_label || "Years of Service"}</div>
                  </div>
                </div>

                {/* Content preview */}
                <div style={{ padding: 18 }}>
                  <div style={{ color: "#c0392b", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {aboutData.tag || "Who We Are"}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.3 }}>
                    {aboutData.title || "Championing Adivasi Rights"}
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.4, margin: "0 0 10px", fontWeight: 600 }}>
                    {aboutData.lead_text}
                  </p>

                  {/* Checklist items pills */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, margin: "12px 0" }}>
                    {(aboutData.features || []).map((pt, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#334155", fontWeight: 600 }}>
                        <span style={{ color: "#22c55e", fontWeight: 800 }}>✓</span> {pt}
                      </div>
                    ))}
                  </div>

                  {/* Action buttons preview */}
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <div style={{
                      background: "#c0392b",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 700
                    }}>
                      {aboutData.btn1_text || "Learn More"} &rarr;
                    </div>
                    <div style={{
                      border: "1px solid #cbd5e1",
                      color: "#334155",
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 700
                    }}>
                      {aboutData.btn2_text || "Get Involved"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, textAlign: "center" }}>
                <a
                  href="/#about"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#ff6b6b", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}
                >
                  View Live "Who We Are" on Website &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: WHERE WE WORK (REGIONS SECTION)
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === "regions" && (
        <div className="grid-2col">
          <div>
            {/* Multi-card display banner rule */}
            <div style={{
              background: "rgba(14, 165, 233, 0.12)",
              border: "1px solid rgba(14, 165, 233, 0.35)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <FaInfoCircle size={22} color="#0ea5e9" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: "0.84rem", color: "#bae6fd", lineHeight: 1.5 }}>
                <strong style={{ color: "#fff" }}>3-Column Responsive Grid Layout:</strong> The first 3 Region cards appear side-by-side in the top row. When a 4th or 5th card is added, it automatically displays neatly in the row below!
              </div>
            </div>

            {/* Section Header Settings */}
            <div className="adm-card-panel">
              <h2><FaEdit size={15} /> Regions Section Header</h2>
              <form onSubmit={handleSaveRegionsHeader}>
                <div className="form-group">
                  <label className="form-label">Header Badge</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regionsHeader.badge || ""}
                    onChange={(e) => setRegionsHeader({ ...regionsHeader, badge: e.target.value })}
                    placeholder="Where We Work"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Section Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regionsHeader.title || ""}
                    onChange={(e) => setRegionsHeader({ ...regionsHeader, title: e.target.value })}
                    placeholder="Three Regions, One Commitment"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle Paragraph</label>
                  <textarea
                    className="form-textarea"
                    value={regionsHeader.subtitle || ""}
                    onChange={(e) => setRegionsHeader({ ...regionsHeader, subtitle: e.target.value })}
                    placeholder="From the Eastern Ghats agency hills to the Godavari submergence belt..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Map Link Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regionsHeader.map_text || ""}
                      onChange={(e) => setRegionsHeader({ ...regionsHeader, map_text: e.target.value })}
                      placeholder="Explore our interactive area map"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Map Link URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={regionsHeader.map_link || ""}
                      onChange={(e) => setRegionsHeader({ ...regionsHeader, map_link: e.target.value })}
                      placeholder="/about"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-red" style={{ marginTop: 16 }}>
                  <FaSave size={12} /> Save Header Settings
                </button>
              </form>
            </div>

            {/* List of Existing Regions Cards */}
            <div className="adm-card-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2><FaMapMarkerAlt size={15} /> Current Region Cards ({regionsList.length})</h2>
                <span style={{ fontSize: "0.78rem", color: "#8892a4" }}>
                  Row 1: Cards 1-3 &bull; Row 2: Cards 4+
                </span>
              </div>

              {regionsList.length === 0 ? (
                <p style={{ color: "#8892a4" }}>No region cards yet. Add your first region below!</p>
              ) : (
                regionsList.map((r, index) => {
                  const isEditing = editingRegionId === r.id;
                  const cardImg = r.image_url || r.img;
                  const cardAccent = r.accent_color || r.accent || "#3E8E0F";

                  return (
                    <div
                      key={r.id || index}
                      className="card-item"
                      style={{ borderLeft: `4px solid ${cardAccent}` }}
                    >
                      {isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                              <label className="form-label">Region Title</label>
                              <input
                                type="text"
                                className="form-input"
                                value={editRegionDraft.title}
                                onChange={(e) => setEditRegionDraft({ ...editRegionDraft, title: e.target.value })}
                                placeholder="e.g. ASR Hill Agency"
                              />
                            </div>
                            <div>
                              <label className="form-label">Tag / ITDA Focus</label>
                              <input
                                type="text"
                                className="form-input"
                                value={editRegionDraft.tag}
                                onChange={(e) => setEditRegionDraft({ ...editRegionDraft, tag: e.target.value })}
                                placeholder="e.g. Rampachodavaram & Chinturu ITDAs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="form-label">Description</label>
                            <textarea
                              className="form-textarea"
                              value={editRegionDraft.description}
                              onChange={(e) => setEditRegionDraft({ ...editRegionDraft, description: e.target.value })}
                              placeholder="Region advocacy description..."
                            />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                            <div>
                              <label className="form-label">Stat Badge Overlay</label>
                              <input
                                type="text"
                                className="form-input"
                                value={editRegionDraft.stat_badge}
                                onChange={(e) => setEditRegionDraft({ ...editRegionDraft, stat_badge: e.target.value })}
                                placeholder="e.g. 6 Mandals"
                              />
                            </div>
                            <div>
                              <label className="form-label">Mandals Coverage</label>
                              <input
                                type="text"
                                className="form-input"
                                value={editRegionDraft.mandals}
                                onChange={(e) => setEditRegionDraft({ ...editRegionDraft, mandals: e.target.value })}
                                placeholder="e.g. 6 mandals"
                              />
                            </div>
                            <div>
                              <label className="form-label">Tribes / Communities</label>
                              <input
                                type="text"
                                className="form-input"
                                value={editRegionDraft.tribes}
                                onChange={(e) => setEditRegionDraft({ ...editRegionDraft, tribes: e.target.value })}
                                placeholder="e.g. Koya · Konda Reddi"
                              />
                            </div>
                          </div>

                          {/* Icon picker + Color picker */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <IconPickerDropdown
                              label="Region Icon (Bootstrap Icons / Custom)"
                              value={editRegionDraft.icon_name}
                              onChange={(val) => setEditRegionDraft({ ...editRegionDraft, icon_name: val })}
                            />
                            <div>
                              <label className="form-label">Accent Color</label>
                              <div className="color-swatches">
                                {ACCENT_COLOR_OPTIONS.map((c) => (
                                  <button
                                    key={c.color}
                                    type="button"
                                    className={`color-swatch-btn ${editRegionDraft.accent_color === c.color ? "active" : ""}`}
                                    style={{ background: c.color }}
                                    title={c.label}
                                    onClick={() => setEditRegionDraft({ ...editRegionDraft, accent_color: c.color })}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Image Dropzone in edit mode */}
                          <div>
                            <label className="form-label">Region Photo (Drop or Browse File)</label>
                            <input
                              type="file"
                              ref={editRegionFileInputRef}
                              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                              style={{ display: "none" }}
                              onChange={handleEditRegionFileSelect}
                            />
                            <div
                              className="edit-inline-dropzone"
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setEditRegionDragging(true); }}
                              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setEditRegionDragging(false); }}
                              onDrop={handleEditRegionDrop}
                              onClick={() => editRegionFileInputRef.current?.click()}
                              style={{
                                border: editRegionDragging ? "2px dashed #c0392b" : "1.5px dashed #2a3148",
                              }}
                            >
                              <div className="edit-drop-content">
                                <img
                                  src={editRegionDraft.image_url}
                                  alt="Current"
                                  style={{ width: 64, height: 42, objectFit: "cover", borderRadius: 6, border: "1px solid #2a3148", flexShrink: 0 }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg";
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>
                                    Click or drop image to replace region photo
                                  </div>
                                  <div style={{ color: "#8892a4", fontSize: "0.72rem" }}>
                                    PNG, JPG, WEBP, GIF (Max 10MB)
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn-browse"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editRegionFileInputRef.current?.click();
                                }}
                              >
                                <FaFolderOpen size={11} /> Browse
                              </button>
                            </div>
                          </div>

                          <div className="edit-card-actions">
                            <button
                              type="button"
                              className="btn-red"
                              onClick={() => handleSaveRegionEdit(r.id)}
                            >
                              <FaSave size={12} /> Save Changes
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => { setEditingRegionId(null); setEditRegionDraft(null); }}
                            >
                              <FaTimes size={12} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="card-item-header">
                            <div className="card-item-title-box">
                              <img
                                src={cardImg}
                                alt={r.title}
                                style={{ width: 56, height: 42, borderRadius: 6, objectFit: "cover", border: "1px solid #2a3148" }}
                                onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg";
                    }}
                              />
                              <div className="card-icon-wrap" style={{ background: `${cardAccent}22` }}>
                                {getIconComponent(r.icon_name)}
                              </div>
                              <div>
                                <h3 className="card-item-title">{r.title}</h3>
                                <div className="card-item-link">{r.tag || "Regional Field Area"}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {r.stat_badge && (
                                <span style={{
                                  background: cardAccent,
                                  color: "#ffffff",
                                  borderRadius: 4,
                                  padding: "2px 8px",
                                  fontSize: "0.72rem",
                                  fontWeight: 800
                                }}>
                                  {r.stat_badge}
                                </span>
                              )}
                              <span style={{
                                background: "#141820",
                                color: "#8892a4",
                                border: "1px solid #2a3148",
                                borderRadius: 6,
                                padding: "2px 8px",
                                fontSize: "0.72rem",
                                fontWeight: 700
                              }}>
                                #{index + 1} {index < 3 ? "(Row 1)" : "(Row 2+)"}
                              </span>
                            </div>
                          </div>

                          <p className="card-item-desc">{r.description || r.desc}</p>

                          <div style={{ display: "flex", gap: 14, fontSize: "0.75rem", color: "#8892a4", marginBottom: 10 }}>
                            {r.mandals && <span>📍 {r.mandals}</span>}
                            {r.tribes && <span>👥 {r.tribes}</span>}
                          </div>

                          <div className="card-item-actions">
                            <button
                              className="icon-btn"
                              title="Move Up"
                              onClick={() => moveRegion(index, "up")}
                              disabled={index === 0}
                              style={{ opacity: index === 0 ? 0.3 : 1 }}
                            >
                              <FaArrowUp size={11} />
                            </button>
                            <button
                              className="icon-btn"
                              title="Move Down"
                              onClick={() => moveRegion(index, "down")}
                              disabled={index === regionsList.length - 1}
                              style={{ opacity: index === regionsList.length - 1 ? 0.3 : 1 }}
                            >
                              <FaArrowDown size={11} />
                            </button>
                            <button
                              className="icon-btn"
                              title="Edit Region Card"
                              onClick={() => startEditRegion(r)}
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              className="icon-btn icon-btn-danger"
                              title="Delete Region Card"
                              onClick={() => handleDeleteRegion(r.id)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Region Card Form */}
            <div className="adm-card-panel">
              <h2><FaPlus size={13} /> Add New Region Card</h2>
              <form onSubmit={handleAddRegion}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Region Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRegion.title}
                      onChange={(e) => setNewRegion({ ...newRegion, title: e.target.value })}
                      placeholder="e.g. ASR Hill Agency, Alluri Seetharama Raju"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tag / ITDA Subhead</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRegion.tag}
                      onChange={(e) => setNewRegion({ ...newRegion, tag: e.target.value })}
                      placeholder="e.g. Rampachodavaram & Chinturu ITDAs"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description Paragraph</label>
                  <textarea
                    className="form-textarea"
                    value={newRegion.description}
                    onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
                    placeholder="PESA Gram Sabha sovereignty, community forest rights (CFR) and individual forest pattas..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Stat Badge on Image</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRegion.stat_badge}
                      onChange={(e) => setNewRegion({ ...newRegion, stat_badge: e.target.value })}
                      placeholder="e.g. 6 Mandals, 371 Habitations"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mandals Coverage</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRegion.mandals}
                      onChange={(e) => setNewRegion({ ...newRegion, mandals: e.target.value })}
                      placeholder="e.g. 6 mandals"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tribes / Communities</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRegion.tribes}
                      onChange={(e) => setNewRegion({ ...newRegion, tribes: e.target.value })}
                      placeholder="e.g. Koya · Konda Reddi"
                    />
                  </div>
                </div>

                {/* Accent Color & Icon */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <IconPickerDropdown
                      label="Card Icon (Bootstrap Icons / Upload)"
                      value={newRegion.icon_name}
                      onChange={(val) => setNewRegion({ ...newRegion, icon_name: val })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Accent Color</label>
                    <div className="color-swatches">
                      {ACCENT_COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          className={`color-swatch-btn ${newRegion.accent_color === c.color ? "active" : ""}`}
                          style={{ background: c.color }}
                          title={c.label}
                          onClick={() => setNewRegion({ ...newRegion, accent_color: c.color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Region Image Upload (Pure Drag & Drop / File Select - NO URL Input) */}
                <div className="form-group">
                  <label className="form-label">Region Cover Photo (Drop or Browse File)</label>

                  <input
                    type="file"
                    ref={regionFileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    style={{ display: "none" }}
                    onChange={handleRegionFileSelect}
                  />

                  {newRegionImg ? (
                    <div className="uploaded-preview-box">
                      <div className="preview-img-wrap">
                        <img
                          src={newRegionImg.dataUrl}
                          alt="New region preview"
                          className="preview-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/uploads/region-asr-culture.jpg";
                          }}
                        />
                      </div>
                      <div className="preview-info">
                        <div className="preview-status">
                          <FaCheckCircle color="#2ecc71" size={13} /> Photo Ready to Add
                        </div>
                        <div className="preview-filename">{newRegionImg.name}</div>
                        <div className="preview-filesize">{newRegionImg.size}</div>
                        <div className="preview-actions">
                          <button
                            type="button"
                            className="btn-change-image"
                            onClick={() => regionFileInputRef.current?.click()}
                          >
                            <FaFolderOpen size={11} /> Change Photo
                          </button>
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => {
                              setNewRegionImg(null);
                              setNewRegion((prev) => ({ ...prev, image_url: "" }));
                            }}
                          >
                            <FaTrash size={11} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-dropzone ${regionDragging ? "dragging" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setRegionDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setRegionDragging(false); }}
                      onDrop={handleRegionDrop}
                      onClick={() => regionFileInputRef.current?.click()}
                    >
                      <FaCloudUploadAlt size={42} className="upload-icon" />
                      <div className="upload-title">Drag & Drop Region Photo Here</div>
                      <div className="upload-sub">or click to browse from your computer</div>
                      <button
                        type="button"
                        className="btn-browse"
                        onClick={(e) => { e.stopPropagation(); regionFileInputRef.current?.click(); }}
                      >
                        <FaFolderOpen size={13} /> Browse Image File
                      </button>
                      <div className="upload-hint">
                        PNG, JPG, WEBP, GIF (Max 10MB) &bull; <strong style={{ color: "#ff8b8b" }}>Images only, videos not supported</strong>
                      </div>
                    </div>
                  )}

                  {/* Preset quick pick */}
                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: "0.75rem", color: "#8892a4" }}>Or pick from existing photos:</span>
                    <div className="preset-grid">
                      {PRESET_IMAGES.map((p) => (
                        <div
                          key={p.url}
                          className="preset-card"
                          onClick={() => {
                            setNewRegionImg({ dataUrl: p.url, name: p.label, size: "Library Photo" });
                            setNewRegion((prev) => ({ ...prev, image_url: p.url }));
                          }}
                        >
                          <img src={p.url} alt={p.label} className="preset-img" />
                          <div className="preset-label">{p.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-red" style={{ marginTop: 8 }}>
                  <FaPlus size={12} /> Add Region Card
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Region Card Preview */}
          <div>
            <div className="adm-card-panel" style={{ position: "sticky", top: 20 }}>
              <h2><FaEye size={13} /> Region Card Preview</h2>
              <div style={{
                background: "#ffffff",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                color: "#1e293b",
                borderTop: `4px solid ${newRegion.accent_color || "#3E8E0F"}`
              }}>
                <div style={{ position: "relative", height: 160, background: "#0f172a" }}>
                  <img
                    src={newRegionImg?.dataUrl || newRegion.image_url || (regionsList[0] ? (regionsList[0].image_url || regionsList[0].img) : "/uploads/region-asr-culture.jpg")}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg";
                    }}
                  />
                  {(newRegion.stat_badge || (regionsList[0] && (regionsList[0].stat_badge || regionsList[0].stat))) && (
                    <div style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      background: newRegion.accent_color || "#3E8E0F",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: "0.74rem",
                      fontWeight: 800,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                    }}>
                      {newRegion.stat_badge || (regionsList[0] && (regionsList[0].stat_badge || regionsList[0].stat))}
                    </div>
                  )}
                </div>

                <div style={{ padding: 18 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: `${newRegion.accent_color || "#3E8E0F"}1f`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10
                  }}>
                    {getIconComponent(newRegion.icon_name || "tree")}
                  </div>

                  {newRegion.tag && (
                    <div style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                      {newRegion.tag}
                    </div>
                  )}

                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                    {newRegion.title || (regionsList[0] ? regionsList[0].title : "ASR Hill Agency")}
                  </h3>

                  <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.5, margin: "0 0 12px" }}>
                    {newRegion.description || (regionsList[0] ? (regionsList[0].description || regionsList[0].desc) : "Region description...")}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.74rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                    <div>📍 {newRegion.mandals || (regionsList[0] ? regionsList[0].mandals : "6 mandals")}</div>
                    <div>👥 {newRegion.tribes || (regionsList[0] ? regionsList[0].tribes : "Koya · Konda Reddi (PVTG)")}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18, textAlign: "center" }}>
                <a
                  href="/#regions"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#ff6b6b", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}
                >
                  View Live "Where We Work" on Website &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: FEATURE CARDS (Our Work, Our Vision, Our Mission)
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === "features" && (
        <div className="grid-2col">
          <div>
            {/* List of current feature cards */}
            <div className="adm-card-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2>Current Feature Cards ({features.length})</h2>
                <span style={{ fontSize: "0.78rem", color: "#8892a4" }}>
                  Displayed 3 per page with Prev/Next navigation
                </span>
              </div>

              {features.length === 0 ? (
                <p style={{ color: "#8892a4" }}>No feature cards yet. Add one below!</p>
              ) : (
                features.map((f, index) => {
                  const isEditing = editingFeatureId === f.id;
                  return (
                    <div key={f.id || index} className="card-item">
                      {isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <input
                            type="text"
                            className="form-input"
                            value={editFeatureDraft.title}
                            onChange={(e) => setEditFeatureDraft({ ...editFeatureDraft, title: e.target.value })}
                            placeholder="Card Title (e.g. Our Work)"
                          />
                          <textarea
                            className="form-textarea"
                            value={editFeatureDraft.description}
                            onChange={(e) => setEditFeatureDraft({ ...editFeatureDraft, description: e.target.value })}
                            placeholder="Card description..."
                          />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <input
                              type="text"
                              className="form-input"
                              value={editFeatureDraft.link_url}
                              onChange={(e) => setEditFeatureDraft({ ...editFeatureDraft, link_url: e.target.value })}
                              placeholder="Link (e.g. /about)"
                            />
                            <IconPickerDropdown
                              label=""
                              value={editFeatureDraft.icon_name}
                              onChange={(val) => setEditFeatureDraft({ ...editFeatureDraft, icon_name: val })}
                            />
                          </div>
                          <div className="edit-card-actions">
                            <button
                              type="button"
                              className="btn-red"
                              onClick={() => handleSaveFeatureEdit(f.id)}
                            >
                              <FaSave size={12} /> Save
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => setEditingFeatureId(null)}
                            >
                              <FaTimes size={12} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="card-item-header">
                            <div className="card-item-title-box">
                              <div className="card-icon-wrap">
                                {getIconComponent(f.icon_name)}
                              </div>
                              <div>
                                <h3 className="card-item-title">{f.title}</h3>
                                <div className="card-item-link">Link: {f.link_url || f.link || "/about"}</div>
                              </div>
                            </div>
                            <span style={{
                              background: "#141820",
                              color: "#8892a4",
                              border: "1px solid #2a3148",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: "0.72rem",
                              fontWeight: 700
                            }}>
                              #{index + 1}
                            </span>
                          </div>

                          <p className="card-item-desc">{f.description || f.desc}</p>

                          <div className="card-item-actions">
                            <button
                              className="icon-btn"
                              title="Move Up"
                              onClick={() => moveFeature(index, "up")}
                              disabled={index === 0}
                              style={{ opacity: index === 0 ? 0.3 : 1 }}
                            >
                              <FaArrowUp size={11} />
                            </button>
                            <button
                              className="icon-btn"
                              title="Move Down"
                              onClick={() => moveFeature(index, "down")}
                              disabled={index === features.length - 1}
                              style={{ opacity: index === features.length - 1 ? 0.3 : 1 }}
                            >
                              <FaArrowDown size={11} />
                            </button>
                            <button
                              className="icon-btn"
                              title="Edit Card"
                              onClick={() => startEditFeature(f)}
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              className="icon-btn icon-btn-danger"
                              title="Delete Card"
                              onClick={() => handleDeleteFeature(f.id)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Feature Card Form */}
            <div className="adm-card-panel">
              <h2><FaPlus size={13} /> Add New Feature Card</h2>
              <form onSubmit={handleAddFeature}>
                <div className="form-group">
                  <label className="form-label">Card Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFeature.title}
                    onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                    placeholder="e.g. Community Health & Relief"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Card Description</label>
                  <textarea
                    className="form-textarea"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                    placeholder="Describe the initiative or pillar..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Link URL (Read More)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newFeature.link_url}
                      onChange={(e) => setNewFeature({ ...newFeature, link_url: e.target.value })}
                      placeholder="/about or /programs"
                    />
                  </div>

                  <div className="form-group">
                    <IconPickerDropdown
                      label="Card Icon (Bootstrap Icons / Upload)"
                      value={newFeature.icon_name}
                      onChange={(val) => setNewFeature({ ...newFeature, icon_name: val })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-red" style={{ marginTop: 8 }}>
                  <FaPlus size={12} /> Add Feature Card
                </button>
              </form>
            </div>
          </div>

          {/* Right: Live Card Preview */}
          <div>
            <div className="adm-card-panel" style={{ position: "sticky", top: 20 }}>
              <h2><FaEye size={13} /> Card Live Preview</h2>
              <div style={{
                background: "#ffffff",
                borderRadius: 14,
                padding: "24px 20px",
                borderTop: "4px solid #c0392b",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  background: "rgba(210, 25, 12, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}>
                  {getIconComponent(newFeature.icon_name || (features[0] && features[0].icon_name))}
                </div>
                <h3 style={{ color: "#03102F", fontSize: "1.15rem", fontWeight: 700, margin: "0 0 8px" }}>
                  {newFeature.title || (features[0] ? features[0].title : "Feature Title")}
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: 1.5, margin: "0 0 16px" }}>
                  {newFeature.description || (features[0] ? (features[0].description || features[0].desc) : "Card description will appear here...")}
                </p>
                <span style={{ color: "#c0392b", fontWeight: 700, fontSize: "0.85rem" }}>
                  Read more &rarr;
                </span>
              </div>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#ff6b6b", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}
                >
                  Open Live Website to View &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: HERO SLIDER IMAGES
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === "slides" && (
        <div className="grid-2col">
          <div>
            <div className="adm-card-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2>Current Hero Slides ({slides.length})</h2>
                <span style={{ fontSize: "0.78rem", color: "#8892a4" }}>
                  Slides cycle every 5s on the Home page
                </span>
              </div>

              {slides.length === 0 ? (
                <p style={{ color: "#8892a4" }}>No slides yet. Upload an image below!</p>
              ) : (
                slides.map((s, index) => {
                  const imgUrl = s.image_url || s.bg;
                  const isEditing = editingSlideId === s.id;
                  return (
                    <div key={s.id || index} className="slide-item">
                      <img src={imgUrl} alt="Slide thumb" className="slide-thumb" onError={(e) => { e.target.src = "/alert-logo.png"; }} />

                      {isEditing ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                          <input
                            type="file"
                            ref={editFileInputRef}
                            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                            style={{ display: "none" }}
                            onChange={handleEditFileSelect}
                          />

                          <div
                            className="edit-inline-dropzone"
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setEditDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setEditDragging(false); }}
                            onDrop={handleEditDrop}
                            onClick={() => editFileInputRef.current?.click()}
                            style={{
                              border: editDragging ? "2px dashed #c0392b" : "1.5px dashed #2a3148",
                            }}
                          >
                            <div className="edit-drop-content">
                              <img
                                src={editSlideDraft.image_url}
                                alt="Current"
                                style={{ width: 56, height: 38, objectFit: "cover", borderRadius: 6, border: "1px solid #2a3148", flexShrink: 0 }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg";
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>
                                  Click or drop new photo to replace
                                </div>
                                <div style={{ color: "#8892a4", fontSize: "0.72rem" }}>
                                  Images only (PNG, JPG, WEBP, GIF &bull; Max 10MB)
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn-browse"
                              onClick={(e) => {
                                e.stopPropagation();
                                editFileInputRef.current?.click();
                              }}
                            >
                              <FaFolderOpen size={11} /> Browse
                            </button>
                          </div>

                          <input
                            type="text"
                            className="form-input"
                            value={editSlideDraft.subtitle}
                            onChange={(e) => setEditSlideDraft({ ...editSlideDraft, subtitle: e.target.value })}
                            placeholder="Subtitle / caption"
                          />
                          <div className="edit-card-actions">
                            <button
                              type="button"
                              className="btn-red"
                              onClick={() => handleSaveSlideEdit(s.id)}
                            >
                              <FaSave size={12} /> Save
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => setEditingSlideId(null)}
                            >
                              <FaTimes size={12} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ color: "#fff", fontSize: "0.92rem", fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {s.subtitle || s.sub || "Hero Slide"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{
                                background: "#141820",
                                color: "#2ecc71",
                                border: "1px solid rgba(46,204,113,0.3)",
                                borderRadius: 4,
                                padding: "2px 6px",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                letterSpacing: "0.03em"
                              }}>
                                IMAGE SLIDE
                              </span>
                              <span style={{ color: "#8892a4", fontSize: "0.72rem" }}>
                                Slide #{index + 1}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <button
                              className="icon-btn"
                              title="Move up"
                              onClick={() => moveSlide(index, "up")}
                              disabled={index === 0}
                              style={{ opacity: index === 0 ? 0.3 : 1 }}
                            >
                              <FaArrowUp size={11} />
                            </button>
                            <button
                              className="icon-btn"
                              title="Move down"
                              onClick={() => moveSlide(index, "down")}
                              disabled={index === slides.length - 1}
                              style={{ opacity: index === slides.length - 1 ? 0.3 : 1 }}
                            >
                              <FaArrowDown size={11} />
                            </button>
                            <button
                              className="icon-btn"
                              title="Edit slide"
                              onClick={() => {
                                setEditingSlideId(s.id);
                                setEditSlideDraft({
                                  image_url: s.image_url || s.bg || "",
                                  subtitle: s.subtitle || s.sub || "",
                                  sort_order: s.sort_order || 1,
                                });
                              }}
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              className="icon-btn icon-btn-danger"
                              title="Delete slide"
                              onClick={() => handleDeleteSlide(s.id)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Slide Form */}
            <div className="adm-card-panel">
              <h2><FaPlus size={13} /> Upload New Hero Slide Image</h2>
              <form onSubmit={handleAddSlide}>
                <div className="form-group">
                  <label className="form-label">Slide Image (Drop or Browse File)</label>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />

                  {!uploadedImage ? (
                    <div
                      className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaCloudUploadAlt size={46} className="upload-icon" />
                      <div className="upload-title">Drag & Drop Image Here</div>
                      <div className="upload-sub">or click to browse from your computer</div>
                      <button
                        type="button"
                        className="btn-browse"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <FaFolderOpen size={14} /> Browse Image File
                      </button>
                      <div className="upload-hint">
                        Supports PNG, JPG, JPEG, WEBP, GIF (Max 10MB) &bull; <strong style={{ color: "#ff8b8b" }}>Images only, videos not supported</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="uploaded-preview-box">
                      <div className="preview-img-wrap">
                        <img
                          src={uploadedImage.dataUrl}
                          alt="Uploaded preview"
                          className="preview-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/uploads/submergence-area-map-1.jpg";
                          }}
                        />
                      </div>
                      <div className="preview-info">
                        <div className="preview-status">
                          <FaCheckCircle color="#2ecc71" size={13} /> Image Ready to Add
                        </div>
                        <div className="preview-filename">{uploadedImage.name}</div>
                        <div className="preview-filesize">{uploadedImage.size}</div>
                        <div className="preview-actions">
                          <button
                            type="button"
                            className="btn-change-image"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FaFolderOpen size={11} /> Change Image
                          </button>
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => setUploadedImage(null)}
                          >
                            <FaTrash size={11} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preset Quick Select */}
                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: "0.75rem", color: "#8892a4" }}>Or pick from existing website photos:</span>
                    <div className="preset-grid">
                      {PRESET_IMAGES.map((p) => (
                        <div
                          key={p.url}
                          className="preset-card"
                          onClick={() => {
                            setUploadedImage({
                              dataUrl: p.url,
                              name: p.label,
                              size: "Library Photo",
                            });
                            if (!newSubtitle) setNewSubtitle(p.label);
                          }}
                        >
                          <img src={p.url} alt={p.label} className="preset-img" />
                          <div className="preset-label">{p.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Slide Subtitle / Caption</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="e.g. Empowering Marginalized Tribal Communities"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-red"
                  disabled={!uploadedImage}
                  style={{
                    opacity: uploadedImage ? 1 : 0.5,
                    cursor: uploadedImage ? "pointer" : "not-allowed",
                  }}
                >
                  <FaPlus size={12} /> Add Hero Slide
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="adm-card-panel" style={{ position: "sticky", top: 20 }}>
              <h2><FaEye size={13} /> Slider Preview</h2>
              <div style={{
                borderRadius: 12,
                overflow: "hidden",
                height: 180,
                position: "relative",
                background: "#000",
                border: "1.5px solid #2a3148",
              }}>
                <img
                  src={uploadedImage?.dataUrl || (slides[0] ? (slides[0].image_url || slides[0].bg) : "/uploads/submergence-area-map-1.jpg")}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
                  onError={(e) => { e.target.src = "/alert-logo.png"; }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}>
                  <div style={{ color: "#f5a000", fontSize: "0.72rem", fontWeight: 700 }}>
                    {config.badge}
                  </div>
                  <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 800 }}>
                    {config.titleLine1} & <span style={{ color: "#c0392b" }}>{config.titleLine2}</span>
                  </div>
                  <div style={{ color: "#ccc", fontSize: "0.75rem", marginTop: 4 }}>
                    {newSubtitle || (slides[0] ? (slides[0].subtitle || slides[0].sub) : "")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: HERO TEXT & HEADLINES
          ══════════════════════════════════════════════════════════════ */}
      {activeTab === "text" && (
        <div className="grid-2col">
          <div className="adm-card-panel">
            <h2>Hero Headlines & Tagline</h2>
            {savedConfig && (
              <div className="notice-msg">
                <FaCheckCircle size={14} /> Headline settings saved!
              </div>
            )}
            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label className="form-label">Hero Badge / Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.badge}
                  onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                  placeholder="Est. 2004 - Reg. No. 307/2004"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Headline Line 1</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.titleLine1}
                  onChange={(e) => setConfig({ ...config, titleLine1: e.target.value })}
                  placeholder="Association for Land"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Headline Line 2 (Highlighted Text)</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.titleLine2}
                  onChange={(e) => setConfig({ ...config, titleLine2: e.target.value })}
                  placeholder="Livelihood"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description Paragraph</label>
                <textarea
                  className="form-textarea"
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Hero description paragraph..."
                />
              </div>

              <div className="edit-actions-row">
                <button type="submit" className="btn-red">
                  <FaSave size={13} /> Save Headlines
                </button>
                <button type="button" onClick={handleResetConfig} className="btn-secondary">
                  <FaUndo size={12} /> Reset to Default
                </button>
              </div>
            </form>
          </div>

          <div>
            <div className="adm-card-panel" style={{ position: "sticky", top: 20 }}>
              <h2><FaEye size={13} /> Headline Preview</h2>
              <div style={{ background: "#0a0a0a", padding: 18, borderRadius: 10, border: "1px solid #2a3148" }}>
                <div style={{ color: "#f5a000", fontSize: "0.75rem", fontWeight: 700, marginBottom: 8 }}>
                  {config.badge}
                </div>
                <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.3 }}>
                  {config.titleLine1}<br />& <span style={{ color: "#c0392b" }}>{config.titleLine2}</span>
                </div>
                <p style={{ color: "#8892a4", fontSize: "0.8rem", marginTop: 10, lineHeight: 1.5 }}>
                  {config.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
