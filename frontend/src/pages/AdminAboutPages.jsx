import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaInfoCircle, FaEye, FaShieldAlt, FaLandmark, FaSitemap,
  FaFileContract, FaMapMarkerAlt, FaSave, FaExternalLinkAlt,
  FaCheckCircle, FaTimes, FaPlus, FaTrash, FaEdit, FaCloudUploadAlt,
  FaArrowRight, FaBullseye, FaAward, FaQuoteLeft, FaBalanceScale, FaLeaf,
  FaUsers, FaWater, FaHeart, FaStar, FaCrown, FaHandHoldingHeart, FaHandsHelping, FaSun,
  FaArrowUp, FaArrowDown, FaCalendar, FaPhone, FaEnvelope, FaFilePdf, FaGavel, FaLock, FaHandshake,
  FaCompass, FaLayerGroup, FaTree, FaMapMarkedAlt, FaUndo, FaSlidersH, FaPalette, FaSearch, FaFilter,
  FaBars, FaList, FaSyncAlt, FaImages, FaBuilding, FaFolderOpen, FaCopy, FaThLarge, FaHistory
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  defaultAboutPages,
  DEFAULT_35_POLICIES,
  DEFAULT_COMPLIANCE_PORTAL,
  DEFAULT_TIMELINE_HEADER,
  DEFAULT_TIMELINE_METRICS,
  DEFAULT_MILESTONES,
  fetchAboutPages,
  adminListAboutPages,
  adminUpdateAboutPage,
  adminUploadImage,
  defaultAboutDropdowns,
  fetchAboutDropdowns,
  adminListAboutDropdowns,
  adminSaveAboutDropdown,
  adminDeleteAboutDropdown,
  adminToggleAboutDropdown,
  adminReorderAboutDropdowns,
  adminResetAboutDropdowns,
  adminCreateAllSitePage
} from "../api/client";
import { defaultOperationalRegions, defaultMapSettings } from "../data/defaultOperationalRegions";

const KEY_STORAGE = "alertngo_admin_key";
const ABOUT_PAGES_STORAGE_KEY = "alertngo_about_pages";

const ABOUT_TABS = [
  { id: "about", label: "About ALERT", path: "/about", icon: FaInfoCircle },
  { id: "vision-mission", label: "Vision & Mission", path: "/vision-mission-2", icon: FaEye },
  { id: "core-values", label: "Core Values", path: "/core-values", icon: FaShieldAlt },
  { id: "organizational-profile", label: "Org Profile", path: "/organizational-profile", icon: FaLandmark },
  { id: "organogram", label: "Organogram", path: "/organogram", icon: FaSitemap },
  { id: "alert-policies", label: "ALERT Policies", path: "/alert-policies", icon: FaFileContract },
  { id: "area-of-operation", label: "Area of Operation", path: "/area-of-operation", icon: FaMapMarkerAlt },
  { id: "dropdown-menu", label: "About Dropdown Menu", path: "/#about", icon: FaBars },
];

const CORE_VALUE_ICONS = [
  { id: "FaShieldAlt", label: "Shield (Integrity / Protection)" },
  { id: "FaBalanceScale", label: "Scale (Accountability / Justice)" },
  { id: "FaEye", label: "Eye (Transparency / Openness)" },
  { id: "FaUsers", label: "Users (Gender Justice / Community)" },
  { id: "FaStar", label: "Star (Professionalism / Rigor)" },
  { id: "FaAward", label: "Award (Excellence / Achievement)" },
  { id: "FaHeart", label: "Heart (Empathy / Compassion)" },
  { id: "FaCrown", label: "Crown (Leadership / Sovereignty)" },
  { id: "FaLeaf", label: "Leaf (Ecology / Sustainability)" },
  { id: "FaHandHoldingHeart", label: "Hand with Heart (Grassroots Care)" },
  { id: "FaHandsHelping", label: "Hands Helping (Solidarity / Mutual Aid)" },
  { id: "FaBullseye", label: "Bullseye (Mission / Purpose)" },
  { id: "FaSun", label: "Sun (Energy / Awakening)" }
];

const ORG_PROFILE_ICONS = [
  { id: "FaLandmark", label: "Landmark (Organization / Institution)" },
  { id: "FaCalendar", label: "Calendar (Establishment / History)" },
  { id: "FaMapMarkerAlt", label: "Map Marker (Headquarters / Territory)" },
  { id: "FaUsers", label: "Users (Leadership / Directorate)" },
  { id: "FaAward", label: "Award (12A / Certification)" },
  { id: "FaStar", label: "Star (80G / Excellence)" },
  { id: "FaShieldAlt", label: "Shield (FCRA / Legal Protection)" },
  { id: "FaCrown", label: "Crown (Registration Act XXI of 1860)" },
  { id: "FaBalanceScale", label: "Balance Scale (Statutory Governance)" },
  { id: "FaCheckCircle", label: "Check Circle (Approved / Compliant)" },
  { id: "FaLeaf", label: "Leaf (Environment / Sustainable Mission)" },
  { id: "FaFilePdf", label: "Document / File" }
];

const ORGANOGRAM_ICONS = [
  { id: "FaUsers", label: "Users (General Body / Assembly)" },
  { id: "FaShieldAlt", label: "Shield (Governing Body / Board of Directors)" },
  { id: "FaAward", label: "Award (Executive Committee / Directorate)" },
  { id: "FaLandmark", label: "Landmark (Program Cells / Legal Units)" },
  { id: "FaSitemap", label: "Sitemap (Field Mobilizers / Gram Sabhas)" },
  { id: "FaCrown", label: "Crown (Leadership / Supreme Authority)" },
  { id: "FaBalanceScale", label: "Balance Scale (Statutory Compliance)" },
  { id: "FaHandsHelping", label: "Hands Helping (Grassroots Teams)" },
  { id: "FaCheckCircle", label: "Check Circle (Operational Units)" }
];

const POLICY_ICONS = [
  { id: "FaBuilding", label: "Building (Operational & Logistics / Infrastructure)" },
  { id: "FaLock", label: "Lock (Finance / Statutory Controls / Audit)" },
  { id: "FaHandHoldingHeart", label: "Hand with Heart (Sensitization / Health / Well-being)" },
  { id: "FaUsers", label: "Users (HR / Joyful Learning / Community Safeguarding)" },
  { id: "FaFileContract", label: "File Contract (Procurement / Tenders / Asset Management)" },
  { id: "FaBalanceScale", label: "Balance Scale (Gender Justice / Anti-Discrimination)" },
  { id: "FaShieldAlt", label: "Shield (Conflict of Interest / Whistleblower / Protection)" },
  { id: "FaAward", label: "Award (POSH / Women Empowerment / Accreditations)" },
  { id: "FaLeaf", label: "Leaf (Environmental / Ecology / Sacred Groves)" },
  { id: "FaHeart", label: "Heart (Health & Safety / Disaster Rescue / Dignity)" },
  { id: "FaGavel", label: "Gavel (Code of Ethics / Anti-Corruption / Statutory Law)" },
  { id: "FaStar", label: "Star (Excellence / Capacity Building / Training)" },
  { id: "FaLandmark", label: "Landmark (Panchayat / PESA / Gram Sabha Governance)" },
  { id: "FaHandshake", label: "Handshake (Partnership / Women Cooperatives / Federation)" },
  { id: "FaEye", label: "Eye (Transparency / RTI / Public Disclosure)" },
  { id: "FaFolderOpen", label: "Folder Open (Dossier / Archives / Document Access)" }
];

const REGION_ICONS = [
  { id: "FaTree", label: "Tree (Forest Reserve / Agency Hills)" },
  { id: "FaWater", label: "Water (Riverine Basin / Polavaram Dam Belt)" },
  { id: "FaCompass", label: "Compass (Coastal Belt / Marine Estuary)" },
  { id: "FaMapMarkerAlt", label: "Map Marker (Administrative ITDA Station)" },
  { id: "FaBalanceScale", label: "Balance Scale (Legal Aid & LTR Restitution)" },
  { id: "FaLandmark", label: "Landmark (Headquarters / Regional Office)" },
  { id: "FaUsers", label: "Users (Tribal Communities / Gram Sabhas)" },
  { id: "FaLayerGroup", label: "Layer Group (Multi-Jurisdiction / Tri-ITDA)" }
];

const MAP_COLOR_PRESETS = [
  { label: "Emerald Green", color: "#10b981" },
  { label: "Crimson Red", color: "#ef4444" },
  { label: "Amber Gold", color: "#f59e0b" },
  { label: "Ocean Blue", color: "#0ea5e9" },
  { label: "Royal Indigo", color: "#6366f1" },
  { label: "Vibrant Purple", color: "#8b5cf6" },
  { label: "Rose Pink", color: "#f43f5e" },
  { label: "Teal", color: "#14b8a6" },
  { label: "ALERT Navy", color: "#003190" },
  { label: "Dark Forest", color: "#15803d" },
  { label: "Coral Orange", color: "#f97316" }
];

const MANDAL_ACTION_TAGS = [
  "Community Mobilization",
  "Legal Defense & RoFR",
  "PESA Gram Sabha",
  "Disaster Risk Reduction",
  "Women Fisheries Federation",
  "R&R Social Audit",
  "Forest Resource Mapping",
  "Solar Electrification",
  "Tribal Health & Nutrition"
];

const MILESTONE_ICONS = [
  { id: "FaLandmark", label: "Landmark (Foundation / Statutory Registration)" },
  { id: "FaTree", label: "Tree (Forest Rights Act / RoFR / CFR Titling)" },
  { id: "FaGavel", label: "Gavel (High Court & Supreme Court Appellate PILs)" },
  { id: "FaHandHoldingHeart", label: "Hand Holding Heart (Nomadic Yenadi / Antyodaya)" },
  { id: "FaCheckCircle", label: "Check Circle (Forest Tenure Triumph / 15,000+ Acres)" },
  { id: "FaSun", label: "Sun (Off-Grid Solar Micro-Grids / Clean Energy)" },
  { id: "FaUsers", label: "Users (Women Fisheries Cooperatives / Community)" },
  { id: "FaAward", label: "Award (20-Year Jubilee / Voluntary Excellence)" },
  { id: "FaHistory", label: "History (Tenure / Historic Timeline)" },
  { id: "FaBalanceScale", label: "Balance Scale (Constitutional & Human Rights)" },
  { id: "FaShieldAlt", label: "Shield (Protection & Social Safeguards)" },
  { id: "FaLeaf", label: "Leaf (Ecology & Sustainable Living)" }
];

const MILESTONE_CATEGORIES = [
  "Legal & Rights",
  "Land & Energy",
  "Community & Women"
];

const formatTagsToString = (arr) => {
  if (!arr) return "";
  if (Array.isArray(arr)) {
    return arr
      .map((item) => (typeof item === "object" && item !== null ? (item.title || item.name || item.desc || "") : String(item)))
      .filter(Boolean)
      .join(", ");
  }
  return typeof arr === "object" && arr !== null ? (arr.title || arr.name || arr.desc || "") : String(arr);
};

function normalizePagesMap(raw) {
  if (!raw || typeof raw !== "object") return defaultAboutPages;
  let base = raw;
  if (base.data && typeof base.data === "object" && !base["vision-mission"] && !base["about"]) {
    base = base.data;
  }
  if (Array.isArray(base)) {
    const map = {};
    for (const item of base) {
      if (item && item.slug) map[item.slug] = item;
    }
    base = map;
  }
  const result = { ...defaultAboutPages };
  for (const slug of Object.keys(defaultAboutPages)) {
    const def = defaultAboutPages[slug];
    const incoming = base[slug];
    if (incoming) {
      // If cached data for vision-mission is using old placeholder title, upgrade with defaults
      let visionData = { ...(def?.content?.vision || {}), ...(incoming?.content?.vision || {}) };
      let missionData = { ...(def?.content?.mission || {}), ...(incoming?.content?.mission || {}) };
      if (slug === "vision-mission" && (incoming?.content?.vision?.title === "Empowerment towards Prosperity & Peace" || incoming?.title === "Vision & Mission — ALERT")) {
        visionData = { ...(def?.content?.vision || {}) };
        missionData = { ...(def?.content?.mission || {}) };
      }
      if (Array.isArray(visionData.points)) {
        visionData.points = visionData.points
          .map((p) => (typeof p === "object" && p !== null ? (p.title || p.name || p.desc || "") : String(p)))
          .filter(Boolean);
      }

      if (Array.isArray(missionData.pillars)) {
        missionData.pillars = missionData.pillars
          .map((p) => (typeof p === "object" && p !== null ? (p.title || p.name || p.desc || "") : String(p)))
          .filter(Boolean);
      }

      // Normalize stats if array or object
      let statsData = incoming?.content?.stats;
      if (Array.isArray(statsData)) {
        statsData = { ...(def?.content?.stats || {}), items: statsData };
      } else {
        statsData = { ...(def?.content?.stats || {}), ...(statsData || {}) };
      }
      if (!Array.isArray(statsData.items)) {
        statsData.items = def?.content?.stats?.items || [];
      }

      // Normalize beliefs if array or object
      let beliefsData = incoming?.content?.beliefs;
      if (Array.isArray(beliefsData)) {
        beliefsData = { ...(def?.content?.beliefs || {}), items: beliefsData };
      } else {
        beliefsData = { ...(def?.content?.beliefs || {}), ...(beliefsData || {}) };
      }
      if (!Array.isArray(beliefsData.items)) {
        beliefsData.items = def?.content?.beliefs?.items || [];
      }

      // Normalize approach if object
      let approachData = { ...(def?.content?.approach || {}), ...(incoming?.content?.approach || {}) };
      if (Array.isArray(approachData.tags)) {
        approachData.tags = approachData.tags
          .map((t) => (typeof t === "object" && t !== null ? (t.title || t.name || "") : String(t)))
          .filter(Boolean);
      }

      // Normalize board_members for about page
      let boardMembers = incoming?.content?.board_members;
      if (!Array.isArray(boardMembers)) {
        boardMembers = def?.content?.board_members || [];
      }

      // Normalize flood_stats for about page
      let floodStats = incoming?.content?.flood_stats;
      if (!Array.isArray(floodStats)) {
        floodStats = def?.content?.flood_stats || [];
      }

      // Normalize organogram_wings for about & organogram pages
      let organogramWings = incoming?.content?.organogram_wings;
      if (!Array.isArray(organogramWings)) {
        organogramWings = def?.content?.organogram_wings || defaultAboutPages["about"]?.content?.organogram_wings || [];
      }

      // Normalize core_values for about page
      let aboutCoreValues = incoming?.content?.core_values;
      if (!Array.isArray(aboutCoreValues)) {
        aboutCoreValues = def?.content?.core_values || [];
      }

      // Normalize values for core-values
      let coreValues = incoming?.content?.values;
      if (!Array.isArray(coreValues)) {
        coreValues = def?.content?.values || [];
      }

      // Normalize info_cards for organizational-profile
      let infoCards = incoming?.content?.info_cards;
      if (!Array.isArray(infoCards)) {
        infoCards = def?.content?.info_cards || [];
      }

      // Normalize accreditations_cards for organizational-profile
      let accreditationsCards = incoming?.content?.accreditations_cards;
      if (!Array.isArray(accreditationsCards)) {
        accreditationsCards = def?.content?.accreditations_cards || [];
      }

      // Normalize levels for organogram
      let organogramLevels = incoming?.content?.levels;
      if (!Array.isArray(organogramLevels)) {
        organogramLevels = def?.content?.levels || [];
      }

      // Normalize policies for alert-policies & about
      let institutionalPolicies = incoming?.content?.policies;
      if (!Array.isArray(institutionalPolicies)) {
        institutionalPolicies = def?.content?.policies || DEFAULT_35_POLICIES;
      }

      // Normalize milestones for about page
      let milestonesList = incoming?.content?.milestones;
      if (!Array.isArray(milestonesList) || milestonesList.length === 0) {
        milestonesList = def?.content?.milestones || DEFAULT_MILESTONES;
      }

      // Normalize timeline_metrics for about page
      let timelineMetrics = incoming?.content?.timeline_metrics;
      if (!Array.isArray(timelineMetrics) || timelineMetrics.length === 0) {
        timelineMetrics = def?.content?.timeline_metrics || DEFAULT_TIMELINE_METRICS;
      }

      // Normalize portal metrics
      let portalMetrics = incoming?.content?.portal_metrics;
      if (!Array.isArray(portalMetrics) || portalMetrics.length === 0) {
        portalMetrics = def?.content?.portal_metrics || DEFAULT_COMPLIANCE_PORTAL.portal_metrics;
      }

      // Normalize commitment_tags for alert-policies
      let commitmentTags = incoming?.content?.commitment_tags;
      if (!Array.isArray(commitmentTags)) {
        commitmentTags = def?.content?.commitment_tags || [];
      }

      // Normalize regions for area-of-operation
      let operationalRegionsList = incoming?.content?.regions;
      if (!Array.isArray(operationalRegionsList)) {
        operationalRegionsList = def?.content?.regions || [];
      }

      // Normalize map_regions for area-of-operation
      let mapRegionsList = incoming?.content?.map_regions;
      if (!Array.isArray(mapRegionsList) || mapRegionsList.length === 0) {
        mapRegionsList = def?.content?.map_regions || defaultOperationalRegions;
      }

      // Normalize map_settings for area-of-operation
      let mapSettingsObj = incoming?.content?.map_settings;
      if (!mapSettingsObj || typeof mapSettingsObj !== "object") {
        mapSettingsObj = def?.content?.map_settings || defaultMapSettings;
      }

      result[slug] = {
        ...def,
        ...incoming,
        badge: incoming.badge || def.badge,
        title: incoming.title || def.title,
        subtitle: incoming.subtitle || def.subtitle,
        banner_image: incoming.banner_image !== undefined ? incoming.banner_image : (def.banner_image || null),
        content: {
          ...(def?.content || {}),
          ...(incoming?.content || {}),
          vision: visionData,
          mission: missionData,
          stats: statsData,
          beliefs: beliefsData,
          approach: approachData,
          board_members: boardMembers,
          flood_stats: floodStats,
          organogram_wings: organogramWings,
          core_values: aboutCoreValues,
          values: coreValues,
          info_cards: infoCards,
          accreditations_cards: accreditationsCards,
          levels: organogramLevels,
          chart_image: incoming?.content?.chart_image !== undefined ? incoming.content.chart_image : (def?.content?.chart_image || null),
          chart_badge: incoming?.content?.chart_badge || def?.content?.chart_badge || "ALERT Governance Structure",
          chart_desc: incoming?.content?.chart_desc || def?.content?.chart_desc || "",
          levels_badge: incoming?.content?.levels_badge || def?.content?.levels_badge || "Governance Levels",
          levels_title: incoming?.content?.levels_title || def?.content?.levels_title || "Five-Tier Governance Structure",
          levels_subtitle: incoming?.content?.levels_subtitle || def?.content?.levels_subtitle || "",
          organogram_arch_badge: incoming?.content?.organogram_arch_badge || def?.content?.organogram_arch_badge || "Organizational Architecture",
          organogram_arch_sub: incoming?.content?.organogram_arch_sub || def?.content?.organogram_arch_sub || "Democratic Governance Hierarchy",
          organogram_heading: incoming?.content?.organogram_heading || def?.content?.organogram_heading || "Interactive Institutional Organogram",
          organogram_desc: incoming?.content?.organogram_desc || def?.content?.organogram_desc || "",
          pdf_file: incoming?.content?.pdf_file !== undefined ? incoming.content.pdf_file : (def?.content?.pdf_file || ""),
          pdf_title: incoming?.content?.pdf_title || def?.content?.pdf_title || "Organizational Profile of ALERT",
          pdf_meta: incoming?.content?.pdf_meta || def?.content?.pdf_meta || "Official Society Record • Governance Document",
          pdf_btn_label: incoming?.content?.pdf_btn_label || def?.content?.pdf_btn_label || "Download Governance Document PDF",
          portal_badge: incoming?.content?.portal_badge || def?.content?.portal_badge || DEFAULT_COMPLIANCE_PORTAL.portal_badge,
          portal_cert: incoming?.content?.portal_cert || def?.content?.portal_cert || DEFAULT_COMPLIANCE_PORTAL.portal_cert,
          portal_title: incoming?.content?.portal_title || def?.content?.portal_title || DEFAULT_COMPLIANCE_PORTAL.portal_title,
          portal_desc: incoming?.content?.portal_desc || def?.content?.portal_desc || DEFAULT_COMPLIANCE_PORTAL.portal_desc,
          portal_status_badge: incoming?.content?.portal_status_badge || def?.content?.portal_status_badge || DEFAULT_COMPLIANCE_PORTAL.portal_status_badge,
          portal_status_sub: incoming?.content?.portal_status_sub || def?.content?.portal_status_sub || DEFAULT_COMPLIANCE_PORTAL.portal_status_sub,
          portal_metrics: portalMetrics,
          policies: institutionalPolicies,
          timeline_badge: incoming?.content?.timeline_badge || def?.content?.timeline_badge || DEFAULT_TIMELINE_HEADER.badge,
          timeline_sub: incoming?.content?.timeline_sub || def?.content?.timeline_sub || DEFAULT_TIMELINE_HEADER.sub,
          timeline_heading: incoming?.content?.timeline_heading || def?.content?.timeline_heading || DEFAULT_TIMELINE_HEADER.heading,
          timeline_desc: incoming?.content?.timeline_desc || def?.content?.timeline_desc || DEFAULT_TIMELINE_HEADER.desc,
          timeline_jubilee_title: incoming?.content?.timeline_jubilee_title || def?.content?.timeline_jubilee_title || DEFAULT_TIMELINE_HEADER.jubilee_title,
          timeline_jubilee_sub: incoming?.content?.timeline_jubilee_sub || def?.content?.timeline_jubilee_sub || DEFAULT_TIMELINE_HEADER.jubilee_sub,
          timeline_metrics: timelineMetrics,
          milestones: milestonesList,
          commitment_tags: commitmentTags,
          regions: operationalRegionsList,
          map_regions: slug === "area-of-operation" ? mapRegionsList : (incoming?.content?.map_regions || undefined),
          map_settings: slug === "area-of-operation" ? mapSettingsObj : (incoming?.content?.map_settings || undefined)
        }
      };
    }
  }
  return result;
}

export default function AdminAboutPages() {
  const adminKey = sessionStorage.getItem(KEY_STORAGE) || localStorage.getItem(KEY_STORAGE) || "alertngo@123";

  const [pagesMap, setPagesMap] = useState(() => {
    try {
      const local = localStorage.getItem(ABOUT_PAGES_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        return normalizePagesMap(parsed);
      }
    } catch { }
    return defaultAboutPages;
  });

  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get("slug");

  const [activeTab, setActiveTab] = useState(() => {
    if (slugParam) {
      if (ABOUT_TABS.some((t) => t.id === slugParam)) return slugParam;
      if (slugParam.startsWith("vision-mission")) return "vision-mission";
      if (slugParam === "profile" || slugParam.includes("profile")) return "organizational-profile";
      if (slugParam === "values" || slugParam.includes("core-values")) return "core-values";
      if (slugParam.includes("organogram")) return "organogram";
      if (slugParam.includes("policies")) return "alert-policies";
      if (slugParam.includes("operation")) return "area-of-operation";
    }
    return "about";
  });

  // Dropdown Menu Management State
  const [dropdownItems, setDropdownItems] = useState(() => {
    try {
      const cached = localStorage.getItem("alertngo_about_dropdowns");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultAboutDropdowns;
  });
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [editingDropdownId, setEditingDropdownId] = useState(null);
  const [dropdownForm, setDropdownForm] = useState({
    label: "",
    path: "",
    parent_id: "",
    is_active: 1,
    sort_order: 0
  });
  const [dropdownFilter, setDropdownFilter] = useState("all");
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [customPathMode, setCustomPathMode] = useState(false);
  const [simHoverParent, setSimHoverParent] = useState(null);

  const filteredDropdownItems = dropdownItems.filter((item) => {
    if (dropdownFilter === "active" && Number(item.is_active) === 0) return false;
    if (dropdownFilter === "hidden" && Number(item.is_active) !== 0) return false;
    if (dropdownSearch.trim()) {
      const q = dropdownSearch.toLowerCase();
      const matchLabel = (item.label || "").toLowerCase().includes(q);
      const matchPath = (item.path || "").toLowerCase().includes(q);
      if (!matchLabel && !matchPath) return false;
    }
    return true;
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Sync dropdowns from server / local storage
  const loadDropdowns = useCallback(async () => {
    let currentLocal = null;
    try {
      const cached = localStorage.getItem("alertngo_about_dropdowns");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentLocal = parsed;
          setDropdownItems(parsed);
        }
      }
    } catch (_) {}

    try {
      if (adminKey) {
        const res = await adminListAboutDropdowns(adminKey);
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbIds = new Set(res.data.map((d) => String(d.id)));
          const dbPaths = new Set(res.data.map((d) => (d.path || "").toLowerCase()));
          const localExtras = (currentLocal || []).filter(
            (d) => !dbIds.has(String(d.id)) && !dbPaths.has((d.path || "").toLowerCase())
          );
          const merged = [...res.data, ...localExtras];
          setDropdownItems(merged);
          try {
            localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(merged));
            window.dispatchEvent(new Event("alertngo_about_dropdowns_updated"));
          } catch (_) {}
          return;
        }
      }
      const pub = await fetchAboutDropdowns();
      if (pub && pub.source === "api" && Array.isArray(pub.data) && pub.data.length > 0) {
        const dbIds = new Set(pub.data.map((d) => String(d.id)));
        const dbPaths = new Set(pub.data.map((d) => (d.path || "").toLowerCase()));
        const localExtras = (currentLocal || []).filter(
          (d) => !dbIds.has(String(d.id)) && !dbPaths.has((d.path || "").toLowerCase())
        );
        const merged = [...pub.data, ...localExtras];
        setDropdownItems(merged);
        try {
          localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(merged));
          window.dispatchEvent(new Event("alertngo_about_dropdowns_updated"));
        } catch (_) {}
      } else if (!currentLocal && pub && pub.data && Array.isArray(pub.data) && pub.data.length > 0) {
        setDropdownItems(pub.data);
      }
    } catch (err) {
      console.warn("Using local dropdowns cache:", err);
    }
  }, [adminKey]);

  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);

  const handleOpenAddDropdown = (presetParentId = "") => {
    setEditingDropdownId(null);
    setCustomPathMode(false);
    setDropdownForm({
      label: "",
      path: "",
      parent_id: presetParentId ? String(presetParentId) : "",
      is_active: 1,
      sort_order: dropdownItems.length + 1
    });
    setShowDropdownModal(true);
  };

  const handleOpenEditDropdown = (item) => {
    setEditingDropdownId(item.id);
    setCustomPathMode(true);
    setDropdownForm({
      id: item.id,
      label: item.label || "",
      path: item.path || "",
      parent_id: item.parent_id ? String(item.parent_id) : "",
      is_active: Number(item.is_active) !== 0 ? 1 : 0,
      sort_order: item.sort_order ?? 0
    });
    setShowDropdownModal(true);
  };

  const handleSaveDropdown = async (e) => {
    e.preventDefault();
    const cleanLabel = dropdownForm.label.trim();
    if (!cleanLabel) {
      setError("Please provide a Menu Item Label.");
      return;
    }
    setError("");
    setLoading(true);

    // Auto-generate clean path if not manually provided
    let derivedPath = dropdownForm.path.trim();
    if (!derivedPath) {
      const generatedSlug = cleanLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `page-${Date.now()}`;
      derivedPath = `/${generatedSlug}`;
    } else if (!derivedPath.startsWith("/") && !derivedPath.startsWith("http://") && !derivedPath.startsWith("https://")) {
      derivedPath = `/${derivedPath}`;
    }

    let updatedList = [...dropdownItems];
    const payload = {
      ...dropdownForm,
      label: cleanLabel,
      path: derivedPath,
      parent_id: dropdownForm.parent_id ? String(dropdownForm.parent_id) : "",
      is_active: Number(dropdownForm.is_active) !== 0 ? 1 : 0
    };

    if (editingDropdownId) {
      updatedList = updatedList.map((d) => (d.id === editingDropdownId ? { ...d, ...payload } : d));
    } else {
      const newId = Date.now();
      updatedList.push({ ...payload, id: newId });

      // Automatically create the dedicated empty page supporting images, videos, PDFs & content
      const rawSlug = derivedPath.replace(/^\//, "").trim();
      if (rawSlug && !derivedPath.startsWith("http")) {
        const initialPageData = {
          title: cleanLabel,
          nav_label: cleanLabel,
          slug: rawSlug,
          category: "About Us",
          badge: "About Us",
          parent_id: dropdownForm.parent_id ? String(dropdownForm.parent_id) : "",
          subtitle: `Explore documents, photo records, and videos for ${cleanLabel}.`,
          paragraphs: [
            `Welcome to ${cleanLabel}. Comprehensive information, photo documentation, video recordings, and official PDF documents are maintained here by ALERT.`
          ],
          images: [],
          videos: [],
          downloads: [],
          tables: [],
          stats: []
        };

        try {
          if (adminKey) {
            await adminCreateAllSitePage(adminKey, initialPageData);
          }
        } catch (createErr) {
          console.warn("Auto-create all-page notice:", createErr);
        }

        // Cache local page override so PageDetail loads it immediately
        try {
          localStorage.setItem(`alertngo_page_override_${rawSlug.toLowerCase()}`, JSON.stringify(initialPageData));
          window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: rawSlug.toLowerCase() } }));
          window.dispatchEvent(new Event("storage"));
        } catch (_) {}
      }
    }

    setDropdownItems(updatedList);
    try {
      localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("alertngo_about_dropdowns_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminSaveAboutDropdown(adminKey, payload);
      }
      showNotice(
        editingDropdownId
          ? "Dropdown item updated successfully!"
          : `Created "${cleanLabel}" with automatic page supporting Images, Videos, PDFs & Content!`
      );
      setShowDropdownModal(false);
    } catch (err) {
      showNotice("Saved locally.");
      setShowDropdownModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDropdownActive = async (id, currentActive) => {
    const nextActive = currentActive ? 0 : 1;
    const updated = dropdownItems.map((d) => (d.id === id ? { ...d, is_active: nextActive } : d));
    setDropdownItems(updated);
    try {
      localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(updated));
      window.dispatchEvent(new Event("alertngo_about_dropdowns_updated"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminToggleAboutDropdown(adminKey, id, nextActive);
      }
      showNotice(nextActive ? "Item is now visible in the Navbar dropdown." : "Item hidden from Navbar dropdown.");
    } catch (_) {
      showNotice("Visibility updated locally.");
    }
  };

  const handleDeleteDropdown = async (id, label) => {
    if (!window.confirm(`Are you sure you want to delete "${label}" from the 'ABOUT' dropdown menu?`)) return;
    const targetItem = dropdownItems.find((d) => String(d.id) === String(id));
    const updated = dropdownItems.filter((d) => String(d.id) !== String(id));
    setDropdownItems(updated);
    try {
      localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(updated));
      window.dispatchEvent(new Event("alertngo_about_dropdowns_updated"));
    } catch (_) {}

    // Also remove the underlying content page so the URL no longer 404s / shows stale content
    try {
      const rawSlug = (targetItem?.path || "").replace(/^\//, "").trim();
      if (rawSlug && !String(targetItem?.path || "").startsWith("http")) {
        try { localStorage.removeItem(`alertngo_page_override_${rawSlug.toLowerCase()}`); } catch (_) {}
        if (adminKey) {
          await adminDeleteAllSitePage(adminKey, rawSlug);
        }
      }
    } catch (_) {}

    try {
      if (adminKey) {
        await adminDeleteAboutDropdown(adminKey, id);
      }
      showNotice(`Deleted "${label}" from dropdown.`);
    } catch (_) {
      showNotice("Deleted locally.");
    }
  };

  const handleMoveDropdown = async (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= dropdownItems.length) return;
    const updated = [...dropdownItems];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    const reordered = updated.map((item, i) => ({ ...item, sort_order: i + 1 }));
    setDropdownItems(reordered);

    try {
      localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(reordered));
      window.dispatchEvent(new Event("alertngo_about_dropdowns_updated"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminReorderAboutDropdowns(adminKey, reordered);
      }
      showNotice("Dropdown items reordered successfully!");
    } catch (_) {
      showNotice("Order saved locally.");
    }
  };

  const handleResetDropdownDefaults = async () => {
    if (!window.confirm("Restore original default 8 items in the 'ABOUT' dropdown menu?")) return;
    setDropdownItems(defaultAboutDropdowns);
    try {
      localStorage.setItem("alertngo_about_dropdowns", JSON.stringify(defaultAboutDropdowns));
      window.dispatchEvent(new Event("alertngo_about_dropdowns_updated"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminResetAboutDropdowns(adminKey);
      }
      showNotice("Restored default About dropdown items!");
    } catch (_) {
      showNotice("Reset locally.");
    }
  };
  const [uploadingField, setUploadingField] = useState(null);
  const [newVisionTag, setNewVisionTag] = useState("");
  const [newMissionPillar, setNewMissionPillar] = useState("");
  const [newApproachTag, setNewApproachTag] = useState("");
  const [expandedMapReg, setExpandedMapReg] = useState(0);
  const [mandalFilterRegion, setMandalFilterRegion] = useState("all");
  const [mandalSearchQuery, setMandalSearchQuery] = useState("");
  const [expandedMandals, setExpandedMandals] = useState({});
  const [showAddMandalForm, setShowAddMandalForm] = useState(false);
  const [newMandalData, setNewMandalData] = useState({
    regIdx: 0,
    name: "",
    fullName: "",
    itda: "",
    river: "",
    lat: 17.5,
    lng: 81.5,
    actionTag: "Community Mobilization",
    activities: ""
  });
  const [expandedRegions, setExpandedRegions] = useState({});
  const [expandedPolicies, setExpandedPolicies] = useState({});
  const [policySearchQuery, setPolicySearchQuery] = useState("");
  const [policyCategoryFilter, setPolicyCategoryFilter] = useState("all");

  const toggleMandalExpand = (key) => {
    setExpandedMandals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExpandAllMandals = (allKeys) => {
    const next = {};
    (allKeys || []).forEach((k) => { next[k] = true; });
    setExpandedMandals(next);
  };

  const handleCollapseAllMandals = () => {
    setExpandedMandals({});
  };

  const toggleRegionExpand = (idx) => {
    setExpandedRegions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const togglePolicyExpand = (idx) => {
    setExpandedPolicies((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleExpandAllPolicies = (allIndices) => {
    const next = {};
    (allIndices || []).forEach((idx) => { next[idx] = true; });
    setExpandedPolicies(next);
  };

  const handleCollapseAllPolicies = () => {
    setExpandedPolicies({});
  };

  // Active page state
  const currentPage = pagesMap[activeTab] || defaultAboutPages[activeTab] || {
    slug: activeTab,
    badge: "About Us",
    title: "",
    subtitle: "",
    content: {}
  };

  const [pageBadge, setPageBadge] = useState(currentPage.badge || "");
  const [pageTitle, setPageTitle] = useState(currentPage.title || "");
  const [pageSubtitle, setPageSubtitle] = useState(currentPage.subtitle || "");
  const [pageBanner, setPageBanner] = useState(currentPage.banner_image || "");
  const [pageContent, setPageContent] = useState(currentPage.content || {});

  // Sync inputs whenever active tab changes
  useEffect(() => {
    const page = pagesMap[activeTab] || defaultAboutPages[activeTab] || {};
    setPageBadge(page.badge || "");
    setPageTitle(page.title || "");
    setPageSubtitle(page.subtitle || "");
    setPageBanner(page.banner_image || "");
    setPageContent(page.content || {});
    setError("");
    setNotice("");
  }, [activeTab, pagesMap]);

  const showNotice = (msg) => {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 3500);
  };

  const syncPages = (updatedMap) => {
    const normalized = normalizePagesMap(updatedMap);
    setPagesMap(normalized);
    try {
      localStorage.setItem(ABOUT_PAGES_STORAGE_KEY, JSON.stringify(normalized));
    } catch { }
    window.dispatchEvent(new CustomEvent("alertngo_about_pages_updated"));
    window.dispatchEvent(new Event("storage"));
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Image size exceeds 12MB limit.");
      return;
    }

    setUploadingField(field);
    setError("");

    try {
      // 1. Instant local base64 preview so user sees it right away
      const dataUrl = await readFileAsDataUrl(file);
      if (field === "hero_image") {
        setPageContent((prev) => ({ ...prev, hero_image: dataUrl }));
      } else {
        setPageContent((prev) => ({
          ...prev,
          [field]: { ...(prev[field] || {}), image: dataUrl }
        }));
      }

      // 2. Upload to backend server
      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "about");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          if (field === "hero_image") {
            setPageContent((prev) => ({ ...prev, hero_image: uploadRes.url }));
          } else {
            setPageContent((prev) => ({
              ...prev,
              [field]: { ...(prev[field] || {}), image: uploadRes.url }
            }));
          }
          showNotice(`Image uploaded to server successfully! Click 'Save' below to apply changes.`);
        } else {
          showNotice(`Image updated locally. Click 'Save' to apply.`);
        }
      } else {
        showNotice(`Image updated locally. Click 'Save' to apply.`);
      }
    } catch (err) {
      console.warn("Upload error:", err);
      showNotice("Image preview set. Click 'Save' to keep changes.");
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  

  const handleRemoveImage = (field) => {
    if (field === "hero_image") {
      setPageContent((prev) => ({ ...prev, hero_image: "" }));
      showNotice("Removed hero image. Click 'Save' to apply.");
    } else {
      setPageContent((prev) => ({
        ...prev,
        [field]: { ...(prev[field] || {}), image: "" }
      }));
      showNotice(`Removed ${field === "vision" ? "Vision" : "Mission"} banner image. Click 'Save' to apply.`);
    }
  };

  const handlePdfUpload = async (e, field = "profile_pdf") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please select a valid PDF file (.pdf).");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("PDF file size exceeds 50MB limit.");
      return;
    }

    setUploadingField(field);
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPageContent((prev) => ({ ...prev, [field]: dataUrl }));

      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "profile");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          setPageContent((prev) => ({ ...prev, [field]: uploadRes.url }));
          showNotice(`PDF '${file.name}' uploaded to server successfully! Click 'Save' to apply.`);
        } else {
          showNotice(`PDF set locally. Click 'Save' to apply.`);
        }
      } else {
        showNotice(`PDF set locally. Click 'Save' to apply.`);
      }
    } catch (err) {
      console.warn("PDF upload error:", err);
      showNotice("PDF set locally. Click 'Save' to apply.");
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleMemberImageUpload = async (e, memberIdx) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setUploadingField(`member-${memberIdx}`);
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const curMembers = [...(pageContent.board_members || [])];
      curMembers[memberIdx] = { ...(curMembers[memberIdx] || {}), img: dataUrl };
      setPageContent((prev) => ({ ...prev, board_members: curMembers }));

      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "team");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          const updated = [...(pageContent.board_members || [])];
          updated[memberIdx] = { ...(updated[memberIdx] || {}), img: uploadRes.url };
          setPageContent((prev) => ({ ...prev, board_members: updated }));
          showNotice("Member photo uploaded to server! Click 'Save' to apply.");
        }
      }
    } catch (err) {
      console.warn("Upload error:", err);
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  

  const handleAddBoardMember = () => {
    const curMembers = pageContent.board_members || [];
    const newMember = {
      name: "New Board Member",
      role: "Board Member",
      badge: "Board of Directors",
      img: "",
      bio: "Dedicated constitutional advocate and grassroots development leader.",
      highlights: "Grassroots Development, Community Rights",
      quote: "Committed to self-governance and dignity."
    };
    setPageContent((prev) => ({ ...prev, board_members: [...curMembers, newMember] }));
    showNotice("Added new board member card!");
  };

  const handleDeleteBoardMember = (idxToDelete) => {
    const curMembers = (pageContent.board_members || []).filter((_, idx) => idx !== idxToDelete);
    setPageContent((prev) => ({ ...prev, board_members: curMembers }));
    showNotice(`Removed board member #${idxToDelete + 1}`);
  };

  const handleAddMilestone = () => {
    const cur = pageContent.milestones || [];
    const latestYear = cur.length > 0 ? (parseInt(cur[cur.length - 1].year, 10) || 2024) + 1 : 2025;
    const newM = {
      year: String(latestYear),
      title: "New Transformative Milestone",
      phase: "GRASSROOTS ADVOCACY PHASE",
      category: "Legal & Rights",
      color: "#1e3a8a",
      icon: "FaAward",
      stat: "Milestone Outcome / Certification",
      desc: "Detailed description of the legislative triumph, community mobilization, or institutional breakthrough achieved during this milestone period."
    };
    setPageContent((prev) => ({ ...prev, milestones: [...cur, newM] }));
    showNotice(`Added new milestone for year ${latestYear}!`);
  };

  const handleDeleteMilestone = (idxToDelete) => {
    const cur = (pageContent.milestones || []).filter((_, idx) => idx !== idxToDelete);
    setPageContent((prev) => ({ ...prev, milestones: cur }));
    showNotice(`Removed milestone #${idxToDelete + 1}`);
  };

  const handleMoveMilestone = (fromIdx, toIdx) => {
    const cur = [...(pageContent.milestones || [])];
    if (toIdx < 0 || toIdx >= cur.length) return;
    const item = cur.splice(fromIdx, 1)[0];
    cur.splice(toIdx, 0, item);
    setPageContent((prev) => ({ ...prev, milestones: cur }));
    showNotice("Reordered milestones.");
  };

  const handleAddTimelineMetric = () => {
    const cur = pageContent.timeline_metrics || [];
    const newMetric = {
      label: "New Metric",
      val: "100+",
      desc: "Continuous Grassroots Work",
      color: "#F5A000",
      icon: "FaHistory"
    };
    setPageContent((prev) => ({ ...prev, timeline_metrics: [...cur, newMetric] }));
    showNotice("Added new timeline summary metric!");
  };

  const handleDeleteTimelineMetric = (idxToDelete) => {
    const cur = (pageContent.timeline_metrics || []).filter((_, idx) => idx !== idxToDelete);
    setPageContent((prev) => ({ ...prev, timeline_metrics: cur }));
    showNotice(`Removed metric #${idxToDelete + 1}`);
  };

  const handleAddOrganogramWing = () => {
    const curWings = pageContent.organogram_wings || [];
    const newWing = {
      id: `wing_${Date.now()}`,
      title: "New Operational Wing",
      subtitle: "Wing Subtitle",
      desc: "Wing mandate and operational description.",
      lead: "Team Leads & Coordinators",
      badge: "Operational Cell",
      color: "#10b981",
    };
    setPageContent((prev) => ({ ...prev, organogram_wings: [...curWings, newWing] }));
    showNotice("Added new operational wing!");
  };

  const handleDeleteOrganogramWing = (idxToDelete) => {
    const curWings = (pageContent.organogram_wings || []).filter((_, idx) => idx !== idxToDelete);
    setPageContent((prev) => ({ ...prev, organogram_wings: curWings }));
    showNotice(`Removed operational wing #${idxToDelete + 1}`);
  };

  const handleAddAboutCoreValue = () => {
    const curValues = pageContent.core_values || [];
    const newV = {
      title: "New Value",
      quote: "Our conviction and standard...",
      accent: "#D2190C",
    };
    setPageContent((prev) => ({ ...prev, core_values: [...curValues, newV] }));
    showNotice("Added new core value!");
  };

  const handleDeleteAboutCoreValue = (idxToDelete) => {
    const curValues = (pageContent.core_values || []).filter((_, idx) => idx !== idxToDelete);
    setPageContent((prev) => ({ ...prev, core_values: curValues }));
    showNotice(`Removed core value #${idxToDelete + 1}`);
  };

  const handleAddCoreValue = () => {
    const newV = {
      id: `val-${Date.now()}`,
      title: "New Value",
      quote: "Our conviction and standard...",
      desc: "Detailed explanation of how this value guides our work and interventions on the ground.",
      icon: "FaShieldAlt",
      accent: "#D2190C",
      image: ""
    };
    setPageContent((prev) => ({
      ...prev,
      values: [...(prev.values || []), newV]
    }));
    showNotice("Added new core value card!");
  };

  const handleDeleteCoreValue = (vIdx) => {
    const filtered = (pageContent.values || []).filter((_, idx) => idx !== vIdx);
    setPageContent((prev) => ({ ...prev, values: filtered }));
    showNotice(`Removed core value #${vIdx + 1}`);
  };

  const handleMoveCoreValue = (vIdx, direction) => {
    const list = [...(pageContent.values || [])];
    const targetIdx = direction === "up" ? vIdx - 1 : vIdx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[vIdx];
    list[vIdx] = list[targetIdx];
    list[targetIdx] = temp;
    setPageContent((prev) => ({ ...prev, values: list }));
  };

  const handleValueImageUpload = async (e, valIdx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setUploadingField(`value-${valIdx}`);
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const curValues = [...(pageContent.values || [])];
      curValues[valIdx] = { ...(curValues[valIdx] || {}), image: dataUrl };
      setPageContent((prev) => ({ ...prev, values: curValues }));

      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "about");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          const updated = [...(pageContent.values || [])];
          updated[valIdx] = { ...(updated[valIdx] || {}), image: uploadRes.url };
          setPageContent((prev) => ({ ...prev, values: updated }));
          showNotice("Value card image uploaded to server! Click 'Save' to apply.");
        }
      }
    } catch (err) {
      console.warn("Upload error:", err);
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  

  const handleRemoveValueImage = (valIdx) => {
    const updated = [...(pageContent.values || [])];
    updated[valIdx] = { ...(updated[valIdx] || {}), image: "" };
    setPageContent((prev) => ({ ...prev, values: updated }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setUploadingField("banner_image");
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPageBanner(dataUrl);

      if (adminKey) {
        const bannerFolder = activeTab === "organogram" ? "organogram" : activeTab === "alert-policies" ? "policies" : activeTab === "area-of-operation" ? "area-of-operation" : "about";
        const uploadRes = await adminUploadImage(adminKey, file, bannerFolder);
        if (uploadRes && uploadRes.success && uploadRes.url) {
          setPageBanner(uploadRes.url);
          showNotice("Banner image uploaded to server! Click 'Save' to apply.");
        }
      }
    } catch (err) {
      console.warn("Banner upload error:", err);
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleBannerImageUpload = handleBannerUpload;

  const handleAddInfoCard = () => {
    const newCard = {
      title: "New Metric",
      value: "Metric Value",
      subtitle: "Brief note or statutory reference",
      icon: "FaLandmark",
      color: "#003190"
    };
    setPageContent((prev) => ({
      ...prev,
      info_cards: [...(prev.info_cards || []), newCard]
    }));
    showNotice("Added new organization info card!");
  };

  const handleDeleteInfoCard = (idx) => {
    const list = (pageContent.info_cards || []).filter((_, i) => i !== idx);
    setPageContent((prev) => ({ ...prev, info_cards: list }));
    showNotice(`Removed info card #${idx + 1}`);
  };

  const handleAddAccreditationCard = () => {
    const newCard = {
      title: "New Accreditation",
      desc: "Statutory compliance, certification, or legal accreditation details.",
      icon: "FaAward",
      color: "#D2190C"
    };
    setPageContent((prev) => ({
      ...prev,
      accreditations_cards: [...(prev.accreditations_cards || []), newCard]
    }));
    showNotice("Added new accreditation card!");
  };

  const handleDeleteAccreditationCard = (idx) => {
    const list = (pageContent.accreditations_cards || []).filter((_, i) => i !== idx);
    setPageContent((prev) => ({ ...prev, accreditations_cards: list }));
    showNotice(`Removed accreditation card #${idx + 1}`);
  };

  const handleFieldImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setUploadingField("field_image");
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPageContent((prev) => ({ ...prev, field_image: dataUrl }));

      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "about");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          setPageContent((prev) => ({ ...prev, field_image: uploadRes.url }));
          showNotice("Field operations image uploaded to server! Click 'Save' to apply.");
        }
      }
    } catch (err) {
      console.warn("Upload error:", err);
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleRemoveFieldImage = () => {
    setPageContent((prev) => ({ ...prev, field_image: "" }));
    showNotice("Removed field operations image. Click 'Save' to apply.");
  };

  // Organogram handlers
  const handleOrganogramChartUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for the organogram chart.");
      return;
    }
    setUploadingField("organogram_chart");
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPageContent((prev) => ({ ...prev, chart_image: dataUrl }));

      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "organogram");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          setPageContent((prev) => ({ ...prev, chart_image: uploadRes.url }));
          showNotice("Organogram chart image uploaded to server! Click 'Save' to apply.");
        }
      }
    } catch (err) {
      console.warn("Organogram chart upload error:", err);
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleRemoveOrganogramChart = () => {
    setPageContent((prev) => ({ ...prev, chart_image: "" }));
    showNotice("Removed organogram chart image. Click 'Save' to apply.");
  };

  const handleOrganogramPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField("organogram_pdf");
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPageContent((prev) => ({ ...prev, pdf_file: dataUrl }));

      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "organogram");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          setPageContent((prev) => ({ ...prev, pdf_file: uploadRes.url }));
          showNotice("Governance PDF uploaded to server! Click 'Save' to apply.");
        }
      }
    } catch (err) {
      console.warn("Governance PDF upload error:", err);
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleAddOrganogramLevel = () => {
    const list = [...(pageContent.levels || [])];
    const nextIdx = list.length + 1;
    list.push({
      level: `Level 0${nextIdx}`,
      title: `New Governance Tier ${nextIdx}`,
      desc: "Describe the responsibilities, reporting authority, and scope for this tier.",
      accent: "#003190",
      icon: "FaSitemap"
    });
    setPageContent((prev) => ({ ...prev, levels: list }));
    showNotice(`Added new governance level #${nextIdx}!`);
  };

  const handleDeleteOrganogramLevel = (idx) => {
    const list = (pageContent.levels || []).filter((_, i) => i !== idx);
    setPageContent((prev) => ({ ...prev, levels: list }));
    showNotice(`Removed governance level #${idx + 1}`);
  };

  const handleMoveOrganogramLevel = (idx, direction) => {
    const list = [...(pageContent.levels || [])];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setPageContent((prev) => ({ ...prev, levels: list }));
  };

  // Alert Policies handlers
  const handleRestore35Policies = () => {
    if (window.confirm("Restore all 35 certified policies and compliance portal metrics to default standards?")) {
      setPageContent((prev) => ({
        ...prev,
        ...DEFAULT_COMPLIANCE_PORTAL,
        policies: DEFAULT_35_POLICIES
      }));
      showNotice("Restored all 35 certified statutory policies & compliance portal metrics! Click 'Save' to apply.");
    }
  };

  const handleResetCompliancePortal = () => {
    setPageContent((prev) => ({
      ...prev,
      ...DEFAULT_COMPLIANCE_PORTAL
    }));
    showNotice("Reset Interactive Compliance Portal & metrics to certified defaults!");
  };

  const handleAddPolicy = () => {
    const list = [...(pageContent.policies || [])];
    const nextNum = list.length + 1;
    const idStr = String(nextNum).padStart(2, "0");
    list.push({
      id: nextNum,
      title: `New Policy #${idStr}`,
      category: "Governance & Ethics",
      statutoryBasis: "Societies Registration Act XXI of 1860",
      committee: "ALERT Governing Body Oversight Cell",
      badge: "Statutory",
      icon: "FaFileContract",
      accent: "#003190",
      desc: "Mandate, operational scope, and community safeguards for this policy.",
      scope: "Mandate, operational scope, and community safeguards for this policy.",
      principles: [
        "Statutory compliance and governance oversight",
        "Community participation and transparency",
        "Zero tolerance for violations"
      ],
      highlights: ["Statutory Compliance", "Ethical Governance"]
    });
    setPageContent((prev) => ({ ...prev, policies: list }));
    setExpandedPolicies((prev) => ({ ...prev, [list.length - 1]: true }));
    showNotice(`Added new policy #${idStr}!`);
  };

  const handleDuplicatePolicy = (idx) => {
    const list = [...(pageContent.policies || [])];
    const source = list[idx];
    if (!source) return;
    const nextNum = list.length + 1;
    const duplicated = {
      ...source,
      id: nextNum,
      title: `${source.title || "Policy"} (Copy)`
    };
    list.splice(idx + 1, 0, duplicated);
    setPageContent((prev) => ({ ...prev, policies: list }));
    setExpandedPolicies((prev) => ({ ...prev, [idx + 1]: true }));
    showNotice(`Duplicated policy #${idx + 1}!`);
  };

  const handleDeletePolicy = (idx) => {
    const list = (pageContent.policies || []).filter((_, i) => i !== idx);
    setPageContent((prev) => ({ ...prev, policies: list }));
    showNotice(`Removed policy #${idx + 1}`);
  };

  const handleMovePolicy = (idx, direction) => {
    const list = [...(pageContent.policies || [])];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setPageContent((prev) => ({ ...prev, policies: list }));
  };

  const handlePolicyPdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField("policy_pdf");
    setError("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPageContent((prev) => ({ ...prev, pdf_file: dataUrl }));

      if (adminKey) {
        const uploadRes = await adminUploadImage(adminKey, file, "policies");
        if (uploadRes && uploadRes.success && uploadRes.url) {
          setPageContent((prev) => ({ ...prev, pdf_file: uploadRes.url }));
          showNotice("Policy PDF document uploaded to server! Click 'Save' to apply.");
        }
      }
    } catch (err) {
      console.warn("Policy PDF upload error:", err);
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  // Area of Operation handlers
  const handleAddOperationalRegion = () => {
    const list = [...(pageContent.regions || [])];
    const nextIdx = list.length + 1;
    list.push({
      name: `New Operational Belt ${nextIdx}`,
      focus: "Describe the primary intervention focus, legal defense, and community programs.",
      mandals: "1-2 Mandals",
      tribes: "Tribal & Nomadic Communities",
      color: "#003190",
      icon: "FaMapMarkerAlt"
    });
    setPageContent((prev) => ({ ...prev, regions: list }));
    showNotice(`Added new operational territory #${nextIdx}!`);
  };

  const handleDeleteOperationalRegion = (idx) => {
    const list = [...(pageContent.regions || [])];
    const regName = list[idx]?.name || `Territory #${idx + 1}`;
    if (!window.confirm(`Delete operational belt "${regName}"?`)) return;
    const updated = list.filter((_, i) => i !== idx);
    setPageContent((prev) => ({ ...prev, regions: updated }));
    showNotice(`Deleted operational territory "${regName}". Click 'Save Area of Operation' to persist.`);
  };

  const handleMoveOperationalRegion = (idx, direction) => {
    const list = [...(pageContent.regions || [])];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setPageContent((prev) => ({ ...prev, regions: list }));
  };

  // Area of Operation Interactive Map Handlers
  const handleUpdateMapSetting = (field, value) => {
    setPageContent((prev) => ({
      ...prev,
      map_settings: {
        ...(prev.map_settings || defaultMapSettings),
        [field]: value
      }
    }));
  };

  const handleAddMapRegion = () => {
    const list = [...(pageContent.map_regions || defaultOperationalRegions || [])];
    const nextIdx = list.length + 1;
    list.push({
      id: `territory-${Date.now()}`,
      name: `New Operational Territory ${nextIdx}`,
      shortName: `Territory ${nextIdx}`,
      badgeColor: "#10b981",
      itda: ["Administrative ITDA Station"],
      focus: "Fieldwork interventions, community development, and statutory rights advocacy.",
      tribes: ["Tribal & Nomadic Communities"],
      center: [17.2, 81.3],
      zoom: 9.5,
      polygonCoords: [],
      mandals: []
    });
    setPageContent((prev) => ({ ...prev, map_regions: list }));
    setExpandedMapReg(list.length - 1);
    showNotice(`Added new map territory #${nextIdx}!`);
  };

  const handleDeleteMapRegion = (idx) => {
    const list = [...(pageContent.map_regions || defaultOperationalRegions || [])];
    const regName = list[idx]?.name || list[idx]?.shortName || `Map Territory #${idx + 1}`;
    if (!window.confirm(`Delete map territory "${regName}" and all its mandal pins?`)) return;
    const updated = list.filter((_, i) => i !== idx);
    setPageContent((prev) => ({ ...prev, map_regions: updated }));
    setExpandedMapReg((prev) => Math.max(0, Math.min(prev, updated.length - 1)));
    showNotice(`Deleted map territory "${regName}". Click 'Save Area of Operation' to persist.`);
  };

  const handleResetMapToDefault = () => {
    if (window.confirm("Reset all map territories, mandal stations, coordinates, and colors to official defaults?")) {
      setPageContent((prev) => ({
        ...prev,
        map_regions: JSON.parse(JSON.stringify(defaultOperationalRegions)),
        map_settings: { ...defaultMapSettings }
      }));
      setExpandedMapReg(0);
      showNotice("Map reset to official 4 territories and 17 mandal stations.");
    }
  };

  const handleUpdateMapRegion = (regIdx, field, value) => {
    const list = [...(pageContent.map_regions || defaultOperationalRegions || [])];
    if (!list[regIdx]) return;
    list[regIdx] = { ...list[regIdx], [field]: value };
    setPageContent((prev) => ({ ...prev, map_regions: list }));
  };

  const handleOpenAddMandalForm = () => {
    const list = Array.isArray(pageContent.map_regions) && pageContent.map_regions.length > 0
      ? pageContent.map_regions
      : defaultOperationalRegions;
    const targetIdx = mandalFilterRegion === "all"
      ? 0
      : Math.max(0, list.findIndex((r) => r.id === mandalFilterRegion));
    const selReg = list[targetIdx] || list[0];
    const nextNum = (selReg?.mandals || []).length + 1;

    setNewMandalData({
      regIdx: targetIdx,
      name: `${nextNum}. New Mandal`,
      fullName: `New Mandal Station ${nextNum}`,
      itda: Array.isArray(selReg?.itda) ? selReg.itda[0] || "" : (selReg?.itda || ""),
      river: "River Basin / Agency Region",
      lat: selReg?.center ? selReg.center[0] : 17.5,
      lng: selReg?.center ? selReg.center[1] : 81.5,
      actionTag: "Community Mobilization",
      activities: "PESA Gram Sabha legal empowerment, RoFR claim facilitation, and community support."
    });
    setShowAddMandalForm(true);
  };

  const handleSaveNewMandal = () => {
    const list = [...(pageContent.map_regions || defaultOperationalRegions || [])];
    const targetIdx = newMandalData.regIdx >= 0 && newMandalData.regIdx < list.length ? newMandalData.regIdx : 0;
    if (!list[targetIdx]) return;
    const mandals = [...(list[targetIdx].mandals || [])];
    const nextNum = mandals.length + 1;
    const fullName = newMandalData.fullName.trim() || `New Mandal Station ${nextNum}`;
    const name = newMandalData.name.trim() || `${nextNum}. ${fullName.replace(/ Mandal$/i, "")}`;
    const newId = `mandal-${Date.now()}`;

    const newMandal = {
      id: newId,
      name,
      fullName,
      itda: newMandalData.itda.trim() || (Array.isArray(list[targetIdx].itda) ? list[targetIdx].itda[0] || "" : (list[targetIdx].itda || "")),
      river: newMandalData.river.trim() || "River Basin / Agency Region",
      lat: Number(newMandalData.lat) || (list[targetIdx].center ? list[targetIdx].center[0] : 17.5),
      lng: Number(newMandalData.lng) || (list[targetIdx].center ? list[targetIdx].center[1] : 81.5),
      actionTag: newMandalData.actionTag || "Community Mobilization",
      activities: newMandalData.activities.trim() || "PESA Gram Sabha legal empowerment, RoFR claim facilitation, and community support."
    };

    mandals.push(newMandal);
    list[targetIdx] = { ...list[targetIdx], mandals };
    setPageContent((prev) => ({ ...prev, map_regions: list }));
    setShowAddMandalForm(false);
    showNotice(`Added "${fullName}" to ${list[targetIdx].shortName || list[targetIdx].name}! Click 'Save Area of Operation' to persist.`);
  };

  const handleAddMandalToRegion = (regIdx) => {
    const list = [...(pageContent.map_regions || defaultOperationalRegions || [])];
    if (!list[regIdx]) return;
    const mandals = [...(list[regIdx].mandals || [])];
    const nextNum = mandals.length + 1;
    const newId = `mandal-${Date.now()}`;
    mandals.push({
      id: newId,
      name: `${nextNum}. New Mandal`,
      fullName: `New Mandal Station ${nextNum}`,
      itda: Array.isArray(list[regIdx].itda) ? list[regIdx].itda[0] || "" : (list[regIdx].itda || ""),
      lat: list[regIdx].center ? list[regIdx].center[0] : 17.5,
      lng: list[regIdx].center ? list[regIdx].center[1] : 81.5,
      river: "River Basin / Agency Region",
      actionTag: "Community Mobilization",
      activities: "PESA Gram Sabha legal empowerment, RoFR claim facilitation, and community support."
    });
    list[regIdx] = { ...list[regIdx], mandals };
    setPageContent((prev) => ({ ...prev, map_regions: list }));
    setExpandedMandals((prev) => ({ ...prev, [newId]: true }));
    showNotice(`Added new mandal pin to ${list[regIdx].shortName || list[regIdx].name}!`);
  };

  const handleDeleteMandalFromRegion = (regIdx, mandalIdx) => {
    const list = JSON.parse(JSON.stringify(pageContent.map_regions || defaultOperationalRegions || []));
    if (!list[regIdx] || !list[regIdx].mandals) return;
    const mandalName = list[regIdx].mandals[mandalIdx]?.fullName || list[regIdx].mandals[mandalIdx]?.name || "Mandal station";
    if (!window.confirm(`Delete mandal station "${mandalName}"?`)) return;
    list[regIdx].mandals.splice(mandalIdx, 1);
    setPageContent((prev) => ({ ...prev, map_regions: list }));
    showNotice(`Deleted mandal station "${mandalName}". Click 'Save Area of Operation' to persist.`);
  };

  const handleUpdateMandalInRegion = (regIdx, mandalIdx, field, value) => {
    const list = [...(pageContent.map_regions || defaultOperationalRegions || [])];
    if (!list[regIdx] || !list[regIdx].mandals || !list[regIdx].mandals[mandalIdx]) return;
    const mandals = [...list[regIdx].mandals];
    mandals[mandalIdx] = { ...mandals[mandalIdx], [field]: value };
    list[regIdx] = { ...list[regIdx], mandals };
    setPageContent((prev) => ({ ...prev, map_regions: list }));
  };

  const handleReassignMandalTerritory = (fromRegIdx, mandalIdx, toRegIdx) => {
    if (fromRegIdx === toRegIdx) return;
    const list = JSON.parse(JSON.stringify(pageContent.map_regions || defaultOperationalRegions || []));
    if (!list[fromRegIdx] || !list[toRegIdx]) return;
    const [movedMandal] = list[fromRegIdx].mandals.splice(mandalIdx, 1);
    if (!list[toRegIdx].mandals) list[toRegIdx].mandals = [];
    list[toRegIdx].mandals.push(movedMandal);
    setPageContent((prev) => ({ ...prev, map_regions: list }));
    showNotice(`Moved ${movedMandal.fullName || movedMandal.name} to ${list[toRegIdx].shortName || list[toRegIdx].name}!`);
  };

  const handleMoveMandalInRegion = (regIdx, mandalIdx, direction) => {
    const list = JSON.parse(JSON.stringify(pageContent.map_regions || defaultOperationalRegions || []));
    if (!list[regIdx] || !list[regIdx].mandals) return;
    const targetIdx = mandalIdx + direction;
    if (targetIdx < 0 || targetIdx >= list[regIdx].mandals.length) return;
    const temp = list[regIdx].mandals[mandalIdx];
    list[regIdx].mandals[mandalIdx] = list[regIdx].mandals[targetIdx];
    list[regIdx].mandals[targetIdx] = temp;
    setPageContent((prev) => ({ ...prev, map_regions: list }));
  };

  

  const handleAddVisionTag = (customVal) => {
    const clean = (typeof customVal === "string" ? customVal : newVisionTag).trim();
    if (!clean) return;
    const current = Array.isArray(pageContent.vision?.points)
      ? pageContent.vision.points.map((p) => (typeof p === "object" && p !== null ? (p.title || p.name || p.desc || "") : String(p)))
      : [];
    if (!current.includes(clean)) {
      setPageContent((prev) => ({
        ...prev,
        vision: { ...(prev.vision || {}), points: [...current, clean] }
      }));
    }
    setNewVisionTag("");
  };

  const handleDeleteVisionTag = (indexToDelete) => {
    const current = Array.isArray(pageContent.vision?.points) ? pageContent.vision.points : [];
    const filtered = current.filter((_, idx) => idx !== indexToDelete);
    setPageContent((prev) => ({
      ...prev,
      vision: { ...(prev.vision || {}), points: filtered }
    }));
  };

  const handleAddMissionPillar = (customVal) => {
    const clean = (typeof customVal === "string" ? customVal : newMissionPillar).trim();
    if (!clean) return;
    const current = Array.isArray(pageContent.mission?.pillars)
      ? pageContent.mission.pillars.map((p) => (typeof p === "object" && p !== null ? (p.title || p.name || p.desc || "") : String(p)))
      : [];
    if (!current.includes(clean)) {
      setPageContent((prev) => ({
        ...prev,
        mission: { ...(prev.mission || {}), pillars: [...current, clean] }
      }));
    }
    setNewMissionPillar("");
  };

  const handleDeleteMissionPillar = (indexToDelete) => {
    const current = Array.isArray(pageContent.mission?.pillars) ? pageContent.mission.pillars : [];
    const filtered = current.filter((_, idx) => idx !== indexToDelete);
    setPageContent((prev) => ({
      ...prev,
      mission: { ...(prev.mission || {}), pillars: filtered }
    }));
  };

  const handleAddApproachTag = (customVal) => {
    const clean = (typeof customVal === "string" ? customVal : newApproachTag).trim();
    if (!clean) return;
    const current = Array.isArray(pageContent.approach?.tags)
      ? pageContent.approach.tags.map((t) => (typeof t === "object" && t !== null ? (t.title || t.name || "") : String(t)))
      : [];
    if (!current.includes(clean)) {
      setPageContent((prev) => ({
        ...prev,
        approach: { ...(prev.approach || {}), tags: [...current, clean] }
      }));
    }
    setNewApproachTag("");
  };

  const handleDeleteApproachTag = (indexToDelete) => {
    const current = Array.isArray(pageContent.approach?.tags) ? pageContent.approach.tags : [];
    const filtered = current.filter((_, idx) => idx !== indexToDelete);
    setPageContent((prev) => ({
      ...prev,
      approach: { ...(prev.approach || {}), tags: filtered }
    }));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // ── 1. Seed localStorage with defaultAboutPages if nothing is stored yet ──
      try {
        const existing = localStorage.getItem(ABOUT_PAGES_STORAGE_KEY);
        if (!existing) {
          const seeded = normalizePagesMap(defaultAboutPages);
          localStorage.setItem(ABOUT_PAGES_STORAGE_KEY, JSON.stringify(seeded));
          setPagesMap(seeded);
          window.dispatchEvent(new CustomEvent("alertngo_about_pages_updated"));
        }
      } catch (_) {}

      // ── 2. Try fetching from backend ──
      if (adminKey) {
        const res = await adminListAboutPages(adminKey);
        if (res && res.success && res.data) {
          syncPages(res.data);
          setLoading(false);
          return;
        }
      }
      const pub = await fetchAboutPages();
      if (pub && pub.data) {
        syncPages(pub.data);
      }
    } catch (err) {
      console.warn("Could not load about pages from server:", err);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save current active page
  const handleSaveCurrentPage = async (e) => {
    e.preventDefault();
    if (!pageTitle.trim()) {
      setError("Page Title cannot be empty.");
      return;
    }

    const payload = {
      slug: activeTab,
      badge: pageBadge.trim(),
      title: pageTitle.trim(),
      subtitle: pageSubtitle.trim(),
      banner_image: pageBanner ? pageBanner.trim() : null,
      content: pageContent
    };

    setLoading(true);
    try {
      if (adminKey) {
        try {
          await adminUpdateAboutPage(adminKey, payload);
        } catch { }
      }
      const updatedMap = {
        ...pagesMap,
        [activeTab]: {
          ...(pagesMap[activeTab] || {}),
          ...payload
        }
      };

      // Automatic two-way policy synchronization between 'about' and 'alert-policies'
      if (activeTab === "alert-policies" && Array.isArray(pageContent.policies)) {
        updatedMap["about"] = {
          ...(updatedMap["about"] || {}),
          content: {
            ...(updatedMap["about"]?.content || {}),
            policies: pageContent.policies,
            portal_badge: pageContent.portal_badge,
            portal_cert: pageContent.portal_cert,
            portal_title: pageContent.portal_title,
            portal_desc: pageContent.portal_desc,
            portal_status_badge: pageContent.portal_status_badge,
            portal_status_sub: pageContent.portal_status_sub,
            portal_metrics: pageContent.portal_metrics
          }
        };
        if (adminKey) {
          try {
            await adminUpdateAboutPage(adminKey, {
              slug: "about",
              content: updatedMap["about"].content
            });
          } catch {}
        }
      } else if (activeTab === "about" && Array.isArray(pageContent.policies)) {
        updatedMap["alert-policies"] = {
          ...(updatedMap["alert-policies"] || {}),
          content: {
            ...(updatedMap["alert-policies"]?.content || {}),
            policies: pageContent.policies,
            portal_badge: pageContent.portal_badge,
            portal_cert: pageContent.portal_cert,
            portal_title: pageContent.portal_title,
            portal_desc: pageContent.portal_desc,
            portal_status_badge: pageContent.portal_status_badge,
            portal_status_sub: pageContent.portal_status_sub,
            portal_metrics: pageContent.portal_metrics
          }
        };
        if (adminKey) {
          try {
            await adminUpdateAboutPage(adminKey, {
              slug: "alert-policies",
              content: updatedMap["alert-policies"].content
            });
          } catch {}
        }
      }

      // Automatic two-way organogram synchronization between 'about' and 'organogram'
      if (activeTab === "organogram") {
        updatedMap["about"] = {
          ...(updatedMap["about"] || {}),
          content: {
            ...(updatedMap["about"]?.content || {}),
            organogram_wings: pageContent.organogram_wings,
            organogram_arch_badge: pageContent.organogram_arch_badge,
            organogram_arch_sub: pageContent.organogram_arch_sub,
            organogram_heading: pageContent.organogram_heading,
            organogram_desc: pageContent.organogram_desc,
            ...(pageContent.chart_image ? { chart_image: pageContent.chart_image } : {})
          }
        };
        if (adminKey) {
          try {
            await adminUpdateAboutPage(adminKey, {
              slug: "about",
              content: updatedMap["about"].content
            });
          } catch {}
        }
      } else if (activeTab === "about" && Array.isArray(pageContent.organogram_wings)) {
        updatedMap["organogram"] = {
          ...(updatedMap["organogram"] || {}),
          content: {
            ...(updatedMap["organogram"]?.content || {}),
            organogram_wings: pageContent.organogram_wings,
            organogram_arch_badge: pageContent.organogram_arch_badge,
            organogram_arch_sub: pageContent.organogram_arch_sub,
            organogram_heading: pageContent.organogram_heading,
            organogram_desc: pageContent.organogram_desc,
            ...(pageContent.chart_image ? { chart_image: pageContent.chart_image } : {})
          }
        };
        if (adminKey) {
          try {
            await adminUpdateAboutPage(adminKey, {
              slug: "organogram",
              content: updatedMap["organogram"].content
            });
          } catch {}
        }
      }

      syncPages(updatedMap);
      showNotice(`Page '${activeTab}' updated successfully!`);
    } catch {
      setError("Failed to save changes. Saved locally.");
    } finally {
      setLoading(false);
    }
  };

  // Reset current page to original defaults
  const handleResetCurrentPage = () => {
    const defaultPage = defaultAboutPages[activeTab];
    if (!defaultPage) return;
    if (!window.confirm(`Reset '${defaultPage.title}' to original defaults?`)) return;

    setPageBadge(defaultPage.badge);
    setPageTitle(defaultPage.title);
    setPageSubtitle(defaultPage.subtitle);
    setPageContent(defaultPage.content);

    const updatedMap = {
      ...pagesMap,
      [activeTab]: defaultPage
    };
    syncPages(updatedMap);
    showNotice(`Reset '${defaultPage.title}' to defaults.`);
  };

  const handleRestoreAllDefaults = () => {
    if (!window.confirm("Restore ALL about-pages tabs (About ALERT, Vision & Mission, Core Values, Org Profile, Organogram, ALERT Policies, Area of Operation, Flood Relief) to original defaults? This overwrites any custom edits.")) return;

    const updatedMap = {};
    let restoredCount = 0;
    for (const slug of Object.keys(defaultAboutPages)) {
      updatedMap[slug] = defaultAboutPages[slug];
      restoredCount++;
    }
    syncPages(updatedMap);
    showNotice(`Restored ${restoredCount} about-pages tabs to defaults.`);
  };

  const activeTabMeta = ABOUT_TABS.find((t) => t.id === activeTab) || ABOUT_TABS[0];

  return (
    <AdminLayout title="Edit About Us Pages">
      <style>{`
        .abt-page {
          width: 100%;
          color: #f1f5f9;
          padding-bottom: 80px;
          box-sizing: border-box;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        /* ── HORIZONTAL PILL TABS STRIP (SWIPEABLE ON MOBILE) ── */
        .abt-tabs-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          flex-wrap: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(192, 57, 43, 0.45) transparent;
          padding: 4px 2px 10px 2px;
          margin-bottom: 18px;
          width: 100%;
          box-sizing: border-box;
        }
        .abt-tabs-strip::-webkit-scrollbar {
          height: 3px;
          display: block;
        }
        .abt-tabs-strip::-webkit-scrollbar-track {
          background: rgba(20, 24, 32, 0.5);
          border-radius: 3px;
        }
        .abt-tabs-strip::-webkit-scrollbar-thumb {
          background: rgba(192, 57, 43, 0.5);
          border-radius: 3px;
        }
        .abt-tab-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid #1e2436;
          background: #141820;
          color: #94a3b8;
          transition: all 0.2s ease;
          text-decoration: none;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .abt-tab-pill:hover {
          background: #1e2436;
          color: #fff;
          border-color: #2a3148;
        }
        .abt-tab-pill.is-active {
          background: #c0392b;
          color: #ffffff;
          border-color: #c0392b;
          box-shadow: 0 4px 14px rgba(192, 57, 43, 0.35);
        }

        /* ── TOP STATS STRIP ── */
        .adm-header-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: linear-gradient(135deg, #141820 0%, #1a202c 100%);
          border: 1px solid #232938;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 18px;
          box-sizing: border-box;
          width: 100%;
        }
        .adm-header-stats-left {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .adm-header-stats-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .stat-meta {
          min-width: 0;
        }
        .stat-val-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-val { font-size: 1.3rem; font-weight: 800; color: #fff; line-height: 1.1; }
        .stat-lbl { font-size: 0.72rem; color: #8892a4; text-transform: uppercase; letter-spacing: 0.05em; }

        .btn-view-site {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          background: #1e2436;
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          border: 1px solid #2a3148;
          transition: all 0.2s;
        }
        .btn-view-site:hover { background: #252d42; color: #fff; border-color: #c0392b; }

        .btn-reset {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          background: #141820;
          color: #8892a4;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid #232938;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-reset:hover { background: #1e2436; color: #fff; }

        .btn-reset--all {
          border-color: rgba(210, 25, 12, 0.35);
          color: #ff6b6b;
        }
        .btn-reset--all:hover {
          background: rgba(210, 25, 12, 0.15);
          color: #fff;
          border-color: #c0392b;
        }

        .notice-banner {
          background: rgba(46, 204, 113, 0.12);
          border: 1px solid rgba(46, 204, 113, 0.35);
          color: #2ecc71;
          padding: 12px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 600;
        }
        .error-banner {
          background: rgba(231, 76, 60, 0.12);
          border: 1px solid rgba(231, 76, 60, 0.35);
          color: #ff7675;
          padding: 12px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .abt-grid-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 24px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 1120px) {
          .abt-grid-layout { grid-template-columns: 1fr; }
        }

        .adm-card-panel {
          background: #141820;
          border: 1px solid #1e2436;
          border-radius: 14px;
          padding: 22px;
          margin-bottom: 20px;
          box-sizing: border-box;
          width: 100%;
        }
        .adm-card-panel h2 {
          color: #fff;
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #1e2436;
          padding-bottom: 12px;
        }

        .form-row-2col {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 14px;
        }
        .form-row-half {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .form-input, .form-textarea, select.form-input, select {
          width: 100%;
          box-sizing: border-box;
          background-color: #0d1017 !important;
          border: 1px solid #2a3148 !important;
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff !important;
          font-size: 0.88rem;
          font-family: inherit;
          transition: border-color 0.2s;
          color-scheme: dark !important;
        }
        select.form-input option, select option {
          background-color: #0d1017 !important;
          color: #ffffff !important;
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #c0392b;
        }
        .form-textarea { resize: vertical; min-height: 80px; }

        .btn-primary {
          background: #c0392b;
          color: #fff;
          border: none;
          padding: 9px 20px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .btn-primary:hover { background: #a93226; transform: translateY(-1px); }

        .btn-secondary {
          background: #1e2436;
          color: #cbd5e1;
          border: 1px solid #2a3148;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: #252d42; color: #fff; }

        .reorder-btn {
          background: #1a202c;
          border: 1px solid #2d3748;
          color: #e2e8f0;
          border-radius: 6px;
          padding: 5px 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          box-sizing: border-box;
        }
        .reorder-btn:hover:not(:disabled) {
          background: #2d3748;
          color: #fff;
          border-color: #3498db;
        }
        .reorder-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .btn-action-edit {
          background: #1e2436;
          color: #ffffff;
          border: 1px solid #2a3148;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
          box-sizing: border-box;
          line-height: 1;
        }
        .btn-action-edit:hover {
          background: #252d42;
          color: #ffffff;
          border-color: #3498db;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.25);
        }

        .btn-action-delete {
          background: rgba(231, 76, 60, 0.12);
          color: #ff6b6b;
          border: 1px solid rgba(231, 76, 60, 0.3);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.15s ease;
          box-sizing: border-box;
          line-height: 1;
        }
        .btn-action-delete:hover {
          background: rgba(231, 76, 60, 0.28);
          border-color: #e74c3c;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
        }

        .sticky-preview {
          position: sticky;
          top: 20px;
          padding: 20px 18px;
        }

        .adm-upload-group {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* ── IMAGE PREVIEW BOXES ── */
        .adm-img-preview-box {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #0d1017;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #1e2436;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        .adm-preview-thumb {
          height: 52px;
          width: 80px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #2a3148;
          flex-shrink: 0;
        }
        .adm-preview-info {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        .adm-preview-title {
          font-size: 0.80rem;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .adm-preview-path {
          font-size: 0.70rem;
          color: #8892a4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        .adm-preview-remove {
          background: transparent;
          border: none;
          color: #ff7675;
          cursor: pointer;
          font-size: 0.75rem;
          padding: 4px 8px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .adm-preview-remove:hover {
          color: #ff4757;
        }

        /* ── BADGES & TAG CHIPS ── */
        .adm-badge-pill {
          white-space: nowrap !important;
          word-break: keep-all !important;
          flex-shrink: 0 !important;
          display: inline-flex !important;
          align-items: center !important;
          line-height: 1.2 !important;
        }
        .adm-tag-chip {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          padding: 5px 8px 5px 12px !important;
          border-radius: 20px !important;
          font-size: 0.78rem !important;
          font-weight: 600 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          line-height: 1.35 !important;
          position: relative !important;
        }
        .adm-tag-chip-text {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          word-break: normal !important;
        }
        .adm-tag-chip-del {
          background: rgba(0, 0, 0, 0.28) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          cursor: pointer !important;
          width: 18px !important;
          height: 18px !important;
          border-radius: 50% !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          line-height: 1 !important;
          opacity: 0.9 !important;
          transition: all 0.2s ease !important;
          margin-left: 6px !important;
          padding: 0 !important;
        }
        .adm-tag-chip-del:hover {
          opacity: 1 !important;
          background: rgba(231, 76, 60, 0.6) !important;
        }

        .abt-form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        /* ── FIELD MANDALS GRID & CARD LAYOUT ── */
        .abt-page .adm-mandals-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
          gap: 16px !important;
          align-items: start !important;
        }
        .abt-page .adm-mandal-card {
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-self: start !important;
          transition: all 0.2s ease !important;
        }
        @media (min-width: 769px) {
          .abt-page .adm-mandal-card.is-editing {
            grid-column: span 2 !important;
          }
        }

        /* ── COMPREHENSIVE RESPONSIVE MOBILE OPTIMIZATION (max-width: 768px & 480px) ── */
        @media (max-width: 768px) {
          .abt-page {
            padding-bottom: 40px !important;
          }

          /* Header stats strip */
          .adm-header-stats {
            padding: 10px 12px !important;
            gap: 10px !important;
            margin-bottom: 12px !important;
            border-radius: 10px !important;
          }
          .adm-header-stats-left {
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .adm-header-stats-left .stat-item,
          .adm-header-stats-left .stat-item:nth-child(3) {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            padding: 8px 12px !important;
            background: rgba(13, 16, 23, 0.5) !important;
            border-radius: 8px !important;
            border: 1px solid #1e2436 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .stat-item {
            gap: 10px !important;
          }
          .stat-icon {
            width: 34px !important;
            height: 34px !important;
            border-radius: 8px !important;
            flex-shrink: 0 !important;
          }
          .stat-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
          .stat-meta {
            flex: 1 !important;
            min-width: 0 !important;
          }
          .stat-val {
            font-size: 0.95rem !important;
            line-height: 1.2 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .stat-lbl {
            font-size: 0.68rem !important;
            letter-spacing: 0.03em !important;
            white-space: nowrap !important;
          }
          .adm-header-stats-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .btn-view-site, .btn-reset {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 8px 10px !important;
            font-size: 0.76rem !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }

          /* Horizontal Pill Tabs */
          .abt-tabs-strip {
            gap: 6px !important;
            margin-bottom: 12px !important;
            padding-bottom: 6px !important;
          }
          .abt-tab-pill {
            padding: 6px 12px !important;
            font-size: 0.74rem !important;
            gap: 6px !important;
          }

          /* Panels & Cards */
          .abt-page .adm-card-panel {
            padding: 12px 10px !important;
            margin-bottom: 14px !important;
            border-radius: 10px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .abt-page .adm-card-panel h2 {
            font-size: 0.88rem !important;
            margin-bottom: 10px !important;
            padding-bottom: 8px !important;
            line-height: 1.3 !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-wrap: nowrap !important;
          }
          .abt-page .adm-card-panel h2 svg {
            flex-shrink: 0 !important;
            font-size: 1rem !important;
          }

          /* Section header titles with icons */
          .abt-page .adm-section-header > div:first-child,
          .abt-page .adm-item-header-title {
            font-size: 0.86rem !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 7px !important;
            flex-wrap: wrap !important;
          }
          .abt-page .adm-section-header svg,
          .abt-page .adm-item-header-title svg {
            flex-shrink: 0 !important;
          }

          /* All forms, inputs and grids */
          .abt-page .form-row-2col,
          .abt-page .form-row-half,
          .abt-page div[style*="grid-template-columns"],
          .abt-page div[style*="gridTemplateColumns"],
          .abt-page form div[style*="grid-template-columns"],
          .abt-page form div[style*="gridTemplateColumns"],
          .abt-page .adm-mandals-grid,
          .abt-page .adm-info-cards-grid,
          .abt-page .adm-accreditations-grid,
          .abt-page .adm-mandal-coords-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .abt-page .adm-info-cards-grid > div,
          .abt-page .adm-info-card-item,
          .abt-page .adm-accreditations-grid > div {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
          }
          .abt-page .adm-info-card-item > div {
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .abt-page .form-group {
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }
          .abt-page .form-label {
            font-size: 0.70rem !important;
            margin-bottom: 4px !important;
            letter-spacing: 0.02em !important;
            flex-wrap: wrap !important;
          }
          .abt-page .form-input,
          .abt-page .form-textarea,
          .abt-page select.form-input,
          .abt-page select {
            padding: 7px 9px !important;
            font-size: 0.78rem !important;
            border-radius: 7px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
            background-color: #0d1017 !important;
            color: #ffffff !important;
            color-scheme: dark !important;
          }
          .abt-page select option {
            background-color: #0d1017 !important;
            color: #ffffff !important;
          }

          /* Upload / Flex rows (strictly scoped to .adm-upload-group) */
          .abt-page .adm-upload-group {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .abt-page .adm-upload-group input,
          .abt-page .adm-upload-group .form-input {
            width: 100% !important;
            min-width: 0 !important;
          }
          .abt-page .adm-upload-group label,
          .abt-page .adm-upload-group .btn-primary,
          .abt-page .adm-upload-group .btn-secondary,
          .abt-page .adm-upload-group button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
          }

          /* Action buttons at bottom */
          .abt-form-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .abt-form-actions button {
            width: 100% !important;
            justify-content: center !important;
            padding: 9px 8px !important;
            font-size: 0.78rem !important;
            white-space: nowrap !important;
          }

          /* Live preview sidebar collapsed */
          .sticky-preview {
            position: static !important;
            padding: 12px 10px !important;
            margin-top: 10px !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }

          /* Image Preview Boxes on Mobile */
          .abt-page .adm-img-preview-box {
            padding: 8px 10px !important;
            gap: 8px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .abt-page .adm-preview-thumb {
            width: 58px !important;
            max-width: 58px !important;
            height: 40px !important;
            max-height: 40px !important;
            border-radius: 5px !important;
            object-fit: cover !important;
            display: block !important;
            flex-shrink: 0 !important;
          }
          .abt-page .adm-preview-info {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            overflow: hidden !important;
          }
          .abt-page .adm-preview-title {
            font-size: 0.74rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
          }
          .abt-page .adm-preview-path {
            font-size: 0.65rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            display: block !important;
          }
          .abt-page .adm-preview-remove {
            font-size: 0.70rem !important;
            padding: 2px 6px !important;
            flex-shrink: 0 !important;
          }

          /* Notice and error banners */
          .notice-banner, .error-banner {
            padding: 8px 12px !important;
            font-size: 0.78rem !important;
            border-radius: 8px !important;
            margin-bottom: 12px !important;
          }

          /* Inner cards and boxes */
          .abt-page div[style*="padding: 20px"],
          .abt-page div[style*="padding: 22px"],
          .abt-page div[style*="padding: 16px"] {
            padding: 10px 8px !important;
            border-radius: 8px !important;
          }

          /* Min-width resets to prevent horizontal blowouts */
          .abt-page *[style*="minWidth: 2"],
          .abt-page *[style*="min-width: 2"],
          .abt-page *[style*="minWidth: 3"],
          .abt-page *[style*="min-width: 3"],
          .abt-page *[style*="minWidth: 1"] {
            min-width: 0 !important;
          }

          /* Buttons responsive tuning to prevent oversized / multi-line wrap buttons */
          .abt-page .btn-secondary,
          .abt-page .btn-primary,
          .abt-page button {
            white-space: nowrap !important;
            max-width: 100% !important;
            flex-shrink: 0 !important;
          }
          .abt-page .btn-secondary {
            padding: 5px 10px !important;
            font-size: 0.74rem !important;
            height: auto !important;
            min-height: 0 !important;
            line-height: 1.3 !important;
          }
          .abt-page .btn-primary {
            padding: 7px 14px !important;
            font-size: 0.78rem !important;
            height: auto !important;
            min-height: 0 !important;
            line-height: 1.3 !important;
          }

          /* Ensure all space-between headers wrap cleanly with gap */
          .abt-page div[style*="justify-content: space-between"],
          .abt-page div[style*="justifyContent: \"space-between\""] {
            flex-wrap: wrap !important;
            gap: 8px !important;
            align-items: center !important;
          }

          /* Section Headers with clean mobile responsiveness */
          .abt-page .adm-section-header {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 14px !important;
            width: 100% !important;
          }
          .abt-page .adm-section-header > div:first-child {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .abt-page .adm-section-header > button,
          .abt-page .adm-section-header > div:last-child {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }

          /* Territory Accordion Header Bar on Mobile */
          .abt-page .adm-territory-header {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 10px 12px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .abt-page .adm-territory-header-left {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex-wrap: wrap !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .abt-page .adm-territory-header-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            width: 100% !important;
            margin-left: 0 !important;
          }
          .abt-page .adm-territory-header-actions button {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            padding: 5px 12px !important;
            font-size: 0.74rem !important;
          }
          .abt-page .adm-territory-header-actions span {
            flex-shrink: 0 !important;
            padding-left: 2px !important;
          }

          /* Item Headers (e.g. Board Members, Impact Stats, Belts) */
          .abt-page .adm-item-header {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 10px !important;
            width: 100% !important;
          }
          .abt-page .adm-item-header-title {
            width: 100% !important;
            flex: 1 1 100% !important;
            min-width: 0 !important;
            font-size: 0.84rem !important;
            font-weight: 700 !important;
            color: #fff !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex-wrap: wrap !important;
          }
          .abt-page .adm-item-header-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            gap: 8px !important;
            width: 100% !important;
            margin-left: 0 !important;
          }
          .abt-page .adm-item-header-actions button {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            padding: 5px 12px !important;
            font-size: 0.74rem !important;
          }

          /* Count badges and section pills (single line) */
          .abt-page .adm-badge-pill {
            white-space: nowrap !important;
            word-break: keep-all !important;
            flex-shrink: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            line-height: 1.2 !important;
          }

          /* Tag Chips on Mobile: NEVER overflow card width, text truncates with ellipsis before delete button */
          .abt-page .adm-tag-chip {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            padding: 5px 8px 5px 12px !important;
            border-radius: 20px !important;
            font-size: 0.76rem !important;
            font-weight: 600 !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            line-height: 1.35 !important;
            position: relative !important;
          }
          .abt-page .adm-tag-chip-text {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            word-break: normal !important;
          }
          .abt-page .adm-tag-chip-del {
            background: rgba(0, 0, 0, 0.3) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            cursor: pointer !important;
            padding: 0 !important;
            width: 18px !important;
            height: 18px !important;
            border-radius: 50% !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
            line-height: 1 !important;
            opacity: 0.9 !important;
            margin-left: 6px !important;
          }

          /* Individual Info Card Form Item on Mobile */
          .abt-page .adm-info-card-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
          }
          .abt-page .adm-info-card-item .form-row-2col {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .abt-page .adm-info-card-item .form-group {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
            margin-bottom: 10px !important;
          }
          .abt-page .adm-info-card-item .form-input,
          .abt-page .adm-info-card-item select {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>

      <div className="abt-page">
        {/* STATS STRIP */}
        <div className="adm-header-stats">
          <div className="adm-header-stats-left">
            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(192,57,43,0.15)", color: "#ff6b6b" }}>
                <FaInfoCircle size={20} />
              </div>
              <div className="stat-meta">
                <div className="stat-val">{ABOUT_TABS.length}</div>
                <div className="stat-lbl">About Us Pages</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(39,174,96,0.15)", color: "#2ecc71" }}>
                <FaCheckCircle size={20} />
              </div>
              <div className="stat-meta">
                <div className="stat-val stat-val-truncate">{activeTabMeta.label}</div>
                <div className="stat-lbl">Currently Editing</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(52,152,219,0.15)", color: "#3498db" }}>
                <FaExternalLinkAlt size={18} />
              </div>
              <div className="stat-meta">
                <div className="stat-val stat-val-truncate" style={{ fontSize: "0.95rem" }}>{activeTabMeta.path}</div>
                <div className="stat-lbl">Live URL Path</div>
              </div>
            </div>
          </div>

          <div className="adm-header-stats-actions">
            <a href={activeTabMeta.path} target="_blank" rel="noreferrer" className="btn-view-site">
              <FaEye size={12} /> View Page
            </a>
            <button type="button" onClick={handleResetCurrentPage} className="btn-reset">
              Reset Tab Defaults
            </button>
            <button type="button" onClick={handleRestoreAllDefaults} className="btn-reset btn-reset--all">
              <FaUndo size={12} /> Restore All Defaults
            </button>
          </div>
        </div>

        {/* ── HORIZONTAL PILL TABS STRIP (MATCHING USER SCREENSHOT) ── */}
        <div className="abt-tabs-strip">
          {ABOUT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  setActiveTab(tab.id);
                  e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                }}
                className={`abt-tab-pill ${isActive ? "is-active" : ""}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* NOTICES */}
        {notice && (
          <div className="notice-banner">
            <FaCheckCircle /> <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="error-banner">
            <FaTimes /> <span>{error}</span>
          </div>
        )}

        {/* 2-COLUMN LAYOUT */}
        <div className="abt-grid-layout">
          {/* ── LEFT / MAIN CONTENT ── */}
          <div className="test-grid-main">
            {activeTab === "dropdown-menu" ? (
              <div className="adm-card-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderBottom: "1px solid #1e2436", paddingBottom: 14, marginBottom: 16 }}>
                  <div>
                    <h2 style={{ margin: 0, border: "none", padding: 0, display: "flex", alignItems: "center", gap: 10 }}>
                      <FaBars style={{ color: "#D2190C" }} />
                      ABOUT Dropdown Manager
                    </h2>
                    <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 4 }}>
                      Add, edit, reorder, or delete links displayed under the <strong>ABOUT</strong> dropdown menu on the website navbar.
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={handleOpenAddDropdown}
                      className="btn-primary"
                      style={{ background: "#27ae60", borderColor: "#27ae60" }}
                    >
                      <FaPlus size={12} /> Add Dropdown Link
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDropdownDefaults}
                      className="btn-secondary"
                      title="Restore original 8 default dropdown items"
                    >
                      <FaUndo size={11} /> Reset Defaults
                    </button>
                  </div>
                </div>

                {/* FILTER & SEARCH BAR */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      { id: "all", label: `All (${dropdownItems.length})` },
                      { id: "active", label: `Active (${dropdownItems.filter((d) => Number(d.is_active) !== 0).length})` },
                      { id: "hidden", label: `Hidden (${dropdownItems.filter((d) => Number(d.is_active) === 0).length})` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setDropdownFilter(f.id)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          border: dropdownFilter === f.id ? "1px solid #D2190C" : "1px solid #2a3148",
                          background: dropdownFilter === f.id ? "rgba(210,25,12,0.15)" : "#0d1017",
                          color: dropdownFilter === f.id ? "#ff6b6b" : "#8892a4",
                          cursor: "pointer"
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: "relative", minWidth: 200, maxWidth: "100%", flex: "1 1 200px" }}>
                    <FaSearch size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: 30, height: 32, fontSize: "0.78rem" }}
                      placeholder="Search by label or path..."
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* DROPDOWN ITEMS LIST WITH SUB-DROPDOWN HIERARCHY */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredDropdownItems.length === 0 ? (
                    <div style={{ padding: "30px 20px", textAlign: "center", color: "#8892a4", background: "#0d1017", borderRadius: 10, border: "1px dashed #2a3148" }}>
                      No dropdown items match your filter.
                      <div style={{ marginTop: 8 }}>
                        <button type="button" onClick={() => handleOpenAddDropdown()} className="btn-primary" style={{ fontSize: "0.76rem", padding: "6px 14px" }}>
                          <FaPlus size={10} /> Add New Link Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const topLevel = filteredDropdownItems.filter(
                        (d) => !d.parent_id || d.parent_id === "" || d.parent_id === "0" || !dropdownItems.some((p) => String(p.id) === String(d.parent_id))
                      );
                      const orphans = filteredDropdownItems.filter(
                        (d) => false
                      );

                      return (
                        <>
                          {topLevel.map((item) => {
                            const isActive = Number(item.is_active) !== 0;
                            const originalIdx = dropdownItems.findIndex((d) => d.id === item.id);
                            const childSubs = filteredDropdownItems.filter(
                              (c) => String(c.parent_id) === String(item.id)
                            );

                            return (
                              <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {/* Parent Card */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    padding: "12px 14px",
                                    background: isActive ? "#0f131c" : "#0a0d13",
                                    border: `1px solid ${isActive ? "#1e2436" : "#161b26"}`,
                                    borderRadius: 10,
                                    opacity: isActive ? 1 : 0.65,
                                    boxSizing: "border-box",
                                    flexWrap: "wrap"
                                  }}
                                >
                                  {/* Left: Reorder buttons + Index + Label + Path */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 240px", minWidth: 0 }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveDropdown(originalIdx, -1)}
                                        disabled={originalIdx === 0}
                                        title="Move Up"
                                        className="reorder-btn"
                                        style={{
                                          background: "#1a202c",
                                          border: "1px solid #2d3748",
                                          color: originalIdx === 0 ? "#4a5568" : "#e2e8f0",
                                          borderRadius: 5,
                                          padding: "4px 7px",
                                          cursor: originalIdx === 0 ? "not-allowed" : "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          opacity: originalIdx === 0 ? 0.35 : 1
                                        }}
                                      >
                                        <FaArrowUp size={9} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveDropdown(originalIdx, 1)}
                                        disabled={originalIdx === dropdownItems.length - 1}
                                        title="Move Down"
                                        className="reorder-btn"
                                        style={{
                                          background: "#1a202c",
                                          border: "1px solid #2d3748",
                                          color: originalIdx === dropdownItems.length - 1 ? "#4a5568" : "#e2e8f0",
                                          borderRadius: 5,
                                          padding: "4px 7px",
                                          cursor: originalIdx === dropdownItems.length - 1 ? "not-allowed" : "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          opacity: originalIdx === dropdownItems.length - 1 ? 0.35 : 1
                                        }}
                                      >
                                        <FaArrowDown size={9} />
                                      </button>
                                    </div>

                                    <span
                                      style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        background: "#1e2436",
                                        color: "#94a3b8",
                                        fontSize: "0.7rem",
                                        fontWeight: 800,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                      }}
                                    >
                                      #{originalIdx + 1}
                                    </span>

                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                                        {childSubs.length > 0 && (
                                          <span style={{ background: "rgba(59, 130, 246, 0.2)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.4)", padding: "1px 7px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 700 }}>
                                            ↳ {childSubs.length} Sub-items
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: "0.74rem", color: "#38bdf8", marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                        <a
                                          href={item.path}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            background: "#0d1017",
                                            padding: "2px 7px",
                                            borderRadius: 4,
                                            border: "1px solid #1e2436",
                                            color: "#38bdf8",
                                            textDecoration: "none",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontSize: "0.72rem"
                                          }}
                                          title="Open live page on public website"
                                        >
                                          <code>{item.path}</code> <FaExternalLinkAlt size={8} />
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Add Sub-dropdown + Toggle active + Manage Content + Edit Link + Delete */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAddDropdown(item.id)}
                                      style={{
                                        background: "rgba(16, 185, 129, 0.12)",
                                        color: "#34d399",
                                        border: "1px solid rgba(16, 185, 129, 0.35)",
                                        padding: "6px 11px",
                                        borderRadius: 6,
                                        fontSize: "0.74rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                        transition: "all 0.15s ease"
                                      }}
                                      title={`Add a sub-dropdown menu item under "${item.label}"`}
                                    >
                                      <FaPlus size={9} /> <span>Sub-dropdown</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleToggleDropdownActive(item.id, isActive)}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        fontSize: "0.74rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        border: isActive ? "1px solid rgba(39, 174, 96, 0.35)" : "1px solid #2a3148",
                                        background: isActive ? "rgba(39, 174, 96, 0.15)" : "#1e2436",
                                        color: isActive ? "#2ecc71" : "#8892a4",
                                        transition: "all 0.15s ease"
                                      }}
                                      title={isActive ? "Click to hide from website navbar" : "Click to show in website navbar"}
                                    >
                                      {isActive ? "Visible" : "Hidden"}
                                    </button>

                                    <Link
                                      to={`/admin/all-pages?slug=${(item.path || "").replace(/^\//, "")}`}
                                      style={{
                                        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                                        color: "#ffffff",
                                        border: "1px solid rgba(59, 130, 246, 0.4)",
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        fontSize: "0.74rem",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                                        whiteSpace: "nowrap"
                                      }}
                                      title="Open rich content editor to upload Images, Videos, PDFs, and Text"
                                    >
                                      <FaImages size={11} /> <span>Manage Content</span>
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditDropdown(item)}
                                      className="btn-action-edit"
                                      style={{
                                        background: "#1e2436",
                                        color: "#ffffff",
                                        border: "1px solid #2a3148",
                                        padding: "6px 12px",
                                        borderRadius: 6,
                                        fontSize: "0.74rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        transition: "all 0.15s ease"
                                      }}
                                      title="Edit Label, Placement, or Path"
                                    >
                                      <FaEdit size={11} style={{ color: "#3498db" }} /> <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDropdown(item.id, item.label)}
                                      className="btn-action-delete"
                                      style={{
                                        background: "rgba(231, 76, 60, 0.12)",
                                        color: "#ff6b6b",
                                        border: "1px solid rgba(231, 76, 60, 0.3)",
                                        padding: "6px 10px",
                                        borderRadius: 6,
                                        fontSize: "0.74rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 4,
                                        transition: "all 0.15s ease"
                                      }}
                                      title="Delete item from dropdown"
                                    >
                                      <FaTrash size={11} />
                                    </button>
                                  </div>
                                </div>

                                {/* Nested Child Sub-Dropdown Items */}
                                {childSubs.length > 0 && (
                                  <div
                                    style={{
                                      marginLeft: 32,
                                      borderLeft: "2px dashed #3b82f6",
                                      paddingLeft: 12,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 6
                                    }}
                                  >
                                    {childSubs.map((sub) => {
                                      const subActive = Number(sub.is_active) !== 0;
                                      const subOriginalIdx = dropdownItems.findIndex((d) => d.id === sub.id);

                                      return (
                                        <div
                                          key={sub.id}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 10,
                                            padding: "10px 12px",
                                            background: subActive ? "#0b0f17" : "#080b10",
                                            border: `1px solid ${subActive ? "#1e293b" : "#121824"}`,
                                            borderRadius: 8,
                                            opacity: subActive ? 1 : 0.65,
                                            flexWrap: "wrap"
                                          }}
                                        >
                                          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px", minWidth: 0 }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                              <button
                                                type="button"
                                                onClick={() => handleMoveDropdown(subOriginalIdx, -1)}
                                                disabled={subOriginalIdx === 0}
                                                style={{ background: "#151b28", border: "1px solid #232d42", color: "#94a3b8", borderRadius: 4, padding: "2px 5px", cursor: "pointer", fontSize: 8 }}
                                              >
                                                ▲
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleMoveDropdown(subOriginalIdx, 1)}
                                                disabled={subOriginalIdx === dropdownItems.length - 1}
                                                style={{ background: "#151b28", border: "1px solid #232d42", color: "#94a3b8", borderRadius: 4, padding: "2px 5px", cursor: "pointer", fontSize: 8 }}
                                              >
                                                ▼
                                              </button>
                                            </div>

                                            <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "2px 6px", borderRadius: 4, fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>
                                              ↳ Sub-item
                                            </span>

                                            <div style={{ minWidth: 0, flex: 1 }}>
                                              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e2e8f0" }}>
                                                {sub.label}
                                              </div>
                                              <div style={{ fontSize: "0.7rem", color: "#38bdf8", marginTop: 1 }}>
                                                <a href={sub.path} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", textDecoration: "none" }}>
                                                  <code>{sub.path}</code>
                                                </a>
                                              </div>
                                            </div>
                                          </div>

                                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                            <button
                                              type="button"
                                              onClick={() => handleToggleDropdownActive(sub.id, subActive)}
                                              style={{
                                                padding: "4px 8px",
                                                borderRadius: 5,
                                                fontSize: "0.7rem",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                border: subActive ? "1px solid rgba(39, 174, 96, 0.35)" : "1px solid #2a3148",
                                                background: subActive ? "rgba(39, 174, 96, 0.15)" : "#1e2436",
                                                color: subActive ? "#2ecc71" : "#8892a4"
                                              }}
                                            >
                                              {subActive ? "Visible" : "Hidden"}
                                            </button>

                                            <Link
                                              to={`/admin/all-pages?slug=${(sub.path || "").replace(/^\//, "")}`}
                                              style={{
                                                background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                                                color: "#ffffff",
                                                border: "1px solid rgba(59, 130, 246, 0.4)",
                                                padding: "4px 9px",
                                                borderRadius: 5,
                                                fontSize: "0.7rem",
                                                fontWeight: 700,
                                                textDecoration: "none",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4
                                              }}
                                              title="Upload images, videos, PDFs, and text for this sub-dropdown page"
                                            >
                                              <FaImages size={10} /> <span>Manage</span>
                                            </Link>

                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditDropdown(sub)}
                                              style={{ background: "#1e2436", color: "#ffffff", border: "1px solid #2a3148", padding: "4px 8px", borderRadius: 5, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                                            >
                                              <FaEdit size={10} color="#38bdf8" />
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => handleDeleteDropdown(sub.id, sub.label)}
                                              style={{ background: "rgba(231, 76, 60, 0.12)", color: "#ff6b6b", border: "1px solid rgba(231, 76, 60, 0.3)", padding: "4px 8px", borderRadius: 5, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                                            >
                                              <FaTrash size={10} />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Orphan sub-items if parent was deleted */}
                          {orphans.length > 0 && (
                            <div style={{ marginTop: 12, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 10, padding: 12 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>
                                ⚠️ Unlinked Sub-Items (Parent not found):
                              </div>
                              {orphans.map((orphan) => (
                                <div key={orphan.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                  <span style={{ fontSize: "0.82rem", color: "#fff" }}>{orphan.label} ({orphan.path})</span>
                                  <button type="button" onClick={() => handleOpenEditDropdown(orphan)} style={{ background: "#f59e0b", color: "#000", border: "none", padding: "4px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                                    Assign Parent
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}
                </div>
              </div>
            ) : (
              <>
            {/* HERO & HEADER SECTION */}
            <div className="adm-card-panel">
              <h2>
                <activeTabMeta.icon style={{ color: "#c0392b" }} />
                {activeTabMeta.label} — Page Header &amp; Hero
              </h2>
              <form onSubmit={handleSaveCurrentPage}>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Hero Badge / Section Tag</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pageBadge}
                      onChange={(e) => setPageBadge(e.target.value)}
                      placeholder="e.g. Leadership, Section 01, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Page Main Heading *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="e.g. Vision & Mission"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Page Subtitle / Tagline</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={pageSubtitle}
                    onChange={(e) => setPageSubtitle(e.target.value)}
                    placeholder="Short introduction describing this section..."
                  />
                </div>

                {/* ── PAGE SPECIFIC EDITORS ── */}

                {/* 0. ABOUT ALERT (MAIN PAGE) */}
                {activeTab === "about" && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e2436" }}>
                    {/* SECTION 00: MAIN STORY & HERO */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(210, 25, 12, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#D2190C", fontWeight: 700, fontSize: "0.95rem", flex: "1 1 auto", minWidth: 0 }}>
                          <FaInfoCircle size={18} style={{ flexShrink: 0 }} />
                          <span>Section 00: Main About Story (/about)</span>
                        </div>
                        <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(210, 25, 12, 0.15)", color: "#ff7675", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Hero Story
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Establishment Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.est_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, est_badge: e.target.value })}
                            placeholder="e.g. Est. 2004"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Full Organization Name Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.org_heading || ""}
                            onChange={(e) => setPageContent({ ...pageContent, org_heading: e.target.value })}
                            placeholder="Association for Land and Livelihood, Environment, Research and Training"
                          />
                        </div>
                      </div>

                      {/* HERO IMAGE UPLOAD */}
                      <div className="form-group" style={{ background: "#141820", padding: 14, borderRadius: 10, border: "1px solid #1e2436" }}>
                        <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span><FaCloudUploadAlt style={{ marginRight: 6, color: "#D2190C" }} /> Community Fieldwork Hero Image</span>
                          <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Upload image file or enter URL</span>
                        </label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            value={pageContent.hero_image || ""}
                            onChange={(e) => setPageContent({ ...pageContent, hero_image: e.target.value })}
                            placeholder="/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg"
                          />
                          <label
                            className="btn-primary"
                            style={{
                              cursor: uploadingField === "hero_image" ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              margin: 0,
                              background: "#D2190C",
                              opacity: uploadingField === "hero_image" ? 0.7 : 1
                            }}
                          >
                            <FaCloudUploadAlt /> {uploadingField === "hero_image" ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "hero_image"}
                              onChange={(e) => handleImageUpload(e, "hero_image")}
                            />
                          </label>
                          {pageContent.hero_image && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage("hero_image")}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Delete / Clear Image"
                            >
                              <FaTrash size={12} /> Delete
                            </button>
                          )}
                        </div>

                        {pageContent.hero_image && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageContent.hero_image}
                              alt="About hero preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Hero Image Preview</div>
                              <div className="adm-preview-path" title={pageContent.hero_image}>
                                {pageContent.hero_image.startsWith("data:") ? "Immediate Preview (Uploaded Data URL)" : pageContent.hero_image}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage("hero_image")}
                              className="adm-preview-remove"
                              title="Remove image"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Narrative Paragraph 1 (Genesis & Leadership)</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.p1 || ""}
                          onChange={(e) => setPageContent({ ...pageContent, p1: e.target.value })}
                          placeholder="ALERT was established in 2004 under the Societies Registration Act..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Narrative Paragraph 2 (Mandate & Scope)</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.p2 || ""}
                          onChange={(e) => setPageContent({ ...pageContent, p2: e.target.value })}
                          placeholder="Our mandate spans affirmative legislation enforcement, RoFR 2006, PESA 1996..."
                        />
                      </div>
                    </div>

                    {/* SECTION 01: LEGAL ACCREDITATIONS & PDFS */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#38BDF8", fontWeight: 700, fontSize: "1rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaFileContract size={16} /> Section 01: Legal Accreditations &amp; PDF Documents
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Section 01 Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec01_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec01_badge: e.target.value })}
                            placeholder="Section 01"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section 01 Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec01_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec01_title: e.target.value })}
                            placeholder="Organizational Profile"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section 01 Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.sec01_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, sec01_subtitle: e.target.value })}
                          placeholder="Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention."
                        />
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Accreditations Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.accreditations_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, accreditations_title: e.target.value })}
                            placeholder="Legal Accreditations"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Accreditations Details</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.accreditations_desc || ""}
                            onChange={(e) => setPageContent({ ...pageContent, accreditations_desc: e.target.value })}
                            placeholder="12A, 80G Tax Exemption, FCRA Registered"
                          />
                        </div>
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Governance Code Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.governance_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, governance_title: e.target.value })}
                            placeholder="Governance Code"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Governance Details</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.governance_desc || ""}
                            onChange={(e) => setPageContent({ ...pageContent, governance_desc: e.target.value })}
                            placeholder="Governed by 35 Institutional Policies"
                          />
                        </div>
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span><FaFilePdf style={{ marginRight: 6, color: "#D2190C" }} /> Official Profile PDF Link / Path</span>
                            <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Upload PDF or enter URL</span>
                          </label>
                          <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1, minWidth: 0 }}
                              value={pageContent.profile_pdf || ""}
                              onChange={(e) => setPageContent({ ...pageContent, profile_pdf: e.target.value })}
                              placeholder="/uploads/Organizational-Profile-of-ALERT.pdf"
                            />
                            <label
                              className="btn-primary"
                              style={{
                                cursor: uploadingField === "profile_pdf_about" ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                margin: 0,
                                background: "#D2190C",
                                opacity: uploadingField === "profile_pdf_about" ? 0.7 : 1
                              }}
                            >
                              <FaCloudUploadAlt /> {uploadingField === "profile_pdf_about" ? "Uploading..." : "Upload PDF"}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: "none" }}
                                disabled={uploadingField === "profile_pdf_about"}
                                onChange={(e) => handlePdfUpload(e, "profile_pdf")}
                              />
                            </label>
                            {pageContent.profile_pdf && (
                              <button
                                type="button"
                                onClick={() => setPageContent({ ...pageContent, profile_pdf: "" })}
                                className="btn-secondary"
                                style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                                title="Clear PDF"
                              >
                                <FaTrash size={12} /> Clear
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span><FaFilePdf style={{ marginRight: 6, color: "#003190" }} /> Annual Audited Report PDF Link / Path</span>
                            <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Upload PDF or enter URL</span>
                          </label>
                          <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1, minWidth: 0 }}
                              value={pageContent.annual_report_pdf || ""}
                              onChange={(e) => setPageContent({ ...pageContent, annual_report_pdf: e.target.value })}
                              placeholder="/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf"
                            />
                            <label
                              className="btn-primary"
                              style={{
                                cursor: uploadingField === "annual_report_pdf" ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                margin: 0,
                                background: "#003190",
                                opacity: uploadingField === "annual_report_pdf" ? 0.7 : 1
                              }}
                            >
                              <FaCloudUploadAlt /> {uploadingField === "annual_report_pdf" ? "Uploading..." : "Upload PDF"}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: "none" }}
                                disabled={uploadingField === "annual_report_pdf"}
                                onChange={(e) => handlePdfUpload(e, "annual_report_pdf")}
                              />
                            </label>
                            {pageContent.annual_report_pdf && (
                              <button
                                type="button"
                                onClick={() => setPageContent({ ...pageContent, annual_report_pdf: "" })}
                                className="btn-secondary"
                                style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                                title="Clear PDF"
                              >
                                <FaTrash size={12} /> Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 02: ORGANOGRAM & 4 WINGS */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ color: "#818cf8", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 0 }}>
                          <FaSitemap size={16} /> Section 02: Organogram Chart &amp; 4 Operational Wings
                          <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(129, 140, 248, 0.15)", color: "#818cf8", padding: "2px 8px", borderRadius: 12 }}>
                            {(pageContent.organogram_wings || []).length} wings
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddOrganogramWing}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#818cf8", borderColor: "rgba(129, 140, 248, 0.4)", whiteSpace: "nowrap" }}
                        >
                          <FaPlus size={10} /> Add Operational Wing
                        </button>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Organogram Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec02_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec02_badge: e.target.value })}
                            placeholder="Section 02"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Organogram Section Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec02_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec02_title: e.target.value })}
                            placeholder="Organogram Chart"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Organogram Section Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.sec02_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, sec02_subtitle: e.target.value })}
                          placeholder="The democratic governance hierarchy — from the sovereign General Body..."
                        />
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Architecture Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.organogram_arch_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, organogram_arch_badge: e.target.value })}
                            placeholder="Organizational Architecture"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Architecture Subtitle</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.organogram_arch_sub || ""}
                            onChange={(e) => setPageContent({ ...pageContent, organogram_arch_sub: e.target.value })}
                            placeholder="Democratic Governance Hierarchy"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Card Main Heading</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.organogram_heading || ""}
                          onChange={(e) => setPageContent({ ...pageContent, organogram_heading: e.target.value })}
                          placeholder="Interactive Institutional Organogram"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Architecture Description</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageContent.organogram_desc || ""}
                          onChange={(e) => setPageContent({ ...pageContent, organogram_desc: e.target.value })}
                          placeholder="Visualizing ALERT's transparent governance framework..."
                        />
                      </div>

                      {/* OPERATIONAL WINGS CARDS */}
                      {(pageContent.organogram_wings || []).map((wing, wIdx) => (
                        <div
                          key={wing.id || wIdx}
                          style={{
                            background: "#141824",
                            border: `1px solid ${wing.color || "#1e2436"}`,
                            borderLeft: `4px solid ${wing.color || "#818cf8"}`,
                            borderRadius: 10,
                            padding: 16,
                            marginBottom: 14
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: wing.color || "#818cf8" }}>
                              Wing #{wIdx + 1}: {wing.title || "Untitled Wing"}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrganogramWing(wIdx)}
                              style={{ background: "transparent", border: "none", color: "#ff7675", cursor: "pointer", fontSize: "0.78rem" }}
                            >
                              <FaTrash size={11} /> Delete Wing
                            </button>
                          </div>

                          <div className="form-row-2col">
                            <div className="form-group">
                              <label className="form-label">Wing Title</label>
                              <input
                                type="text"
                                className="form-input"
                                value={wing.title || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.organogram_wings || [])];
                                  cur[wIdx] = { ...cur[wIdx], title: e.target.value };
                                  setPageContent({ ...pageContent, organogram_wings: cur });
                                }}
                                placeholder="Legal Cell & Constitutional Advocacy"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Wing Subtitle / Mandate</label>
                              <input
                                type="text"
                                className="form-input"
                                value={wing.subtitle || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.organogram_wings || [])];
                                  cur[wIdx] = { ...cur[wIdx], subtitle: e.target.value };
                                  setPageContent({ ...pageContent, organogram_wings: cur });
                                }}
                                placeholder="PESA, RoFR & LTR Legal Aid Unit"
                              />
                            </div>
                          </div>

                          <div className="form-row-2col">
                            <div className="form-group">
                              <label className="form-label">Led By / Functionary</label>
                              <input
                                type="text"
                                className="form-input"
                                value={wing.lead || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.organogram_wings || [])];
                                  cur[wIdx] = { ...cur[wIdx], lead: e.target.value };
                                  setPageContent({ ...pageContent, organogram_wings: cur });
                                }}
                                placeholder="Paralegal Team & Constitutional Scholars"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Accent Color Code</label>
                              <input
                                type="text"
                                className="form-input"
                                value={wing.color || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.organogram_wings || [])];
                                  cur[wIdx] = { ...cur[wIdx], color: e.target.value };
                                  setPageContent({ ...pageContent, organogram_wings: cur });
                                }}
                                placeholder="#10b981"
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Wing Description</label>
                            <textarea
                              rows={2}
                              className="form-textarea"
                              value={wing.desc || ""}
                              onChange={(e) => {
                                const cur = [...(pageContent.organogram_wings || [])];
                                cur[wIdx] = { ...cur[wIdx], desc: e.target.value };
                                setPageContent({ ...pageContent, organogram_wings: cur });
                              }}
                              placeholder="Drafts High Court PILs, RTI representations..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SECTION 03: AREA OF OPERATION MAP */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaMapMarkerAlt size={16} /> Section 03: Area of Operation Map
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Section 03 Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec03_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec03_badge: e.target.value })}
                            placeholder="Section 03"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section 03 Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec03_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec03_title: e.target.value })}
                            placeholder="Area of Operation Map"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section 03 Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.sec03_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, sec03_subtitle: e.target.value })}
                          placeholder="17 mandal stations and 4 operational jurisdictions across the Fifth-Scheduled Agency Belt and Coastal Krishna Belt of Andhra Pradesh."
                        />
                      </div>
                      <div style={{ background: "#141820", padding: 12, borderRadius: 8, border: "1px dashed #2a3148", fontSize: "0.82rem", color: "#8892a4", display: "flex", alignItems: "center", gap: 10 }}>
                        <FaInfoCircle style={{ color: "#38bdf8", flexShrink: 0 }} />
                        <span>Interactive Leaflet Map with all 17 mandals, ITDAs, and territory polygons renders automatically on the About page. Detailed coordinates and regional color pins can also be managed from the <strong>Area of Operation</strong> tab above.</span>
                      </div>
                    </div>

                    {/* SECTION 04: ALERT 35 POLICIES */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(245, 160, 0, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                          <FaFileContract size={16} /> Section 04: ALERT 35 Policies &amp; Compliance Portal
                        </div>
                        <span style={{ fontSize: "0.72rem", background: "rgba(245, 160, 0, 0.15)", color: "#f59e0b", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          35 Certified Charters
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Section 04 Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec04_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec04_badge: e.target.value })}
                            placeholder="Section 04"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section 04 Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec04_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec04_title: e.target.value })}
                            placeholder="ALERT 35 Policies"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section 04 Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.sec04_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, sec04_subtitle: e.target.value })}
                          placeholder="35 formalized statutory charters certified by the ALERT Governing Body ensuring democratic transparency, protection, and financial accountability."
                        />
                      </div>

                      {/* Compliance Portal & 35 Policies Status Strip */}
                      <div style={{ background: "#080b11", border: "1px solid #1e2436", borderRadius: 10, padding: 16, marginTop: 14, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
                              {pageContent.portal_badge || "Interactive Compliance Portal"}
                            </span>
                            <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", margin: "3px 0 0" }}>
                              {pageContent.portal_title || "The 35 Institutional Governance Policies"}
                            </h4>
                          </div>
                          <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                            {pageContent.portal_status_badge || "100% Ratified & Audited"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#8892a4", lineHeight: 1.5, marginBottom: 12 }}>
                          {pageContent.portal_desc || "ALERT operations are strictly governed by 35 formalized statutory charters ensuring democratic transparency, child protection, financial accountability, and indigenous community rights."}
                        </div>

                        {/* 4 Metric Chips */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 14 }}>
                          {(Array.isArray(pageContent.portal_metrics) && pageContent.portal_metrics.length > 0
                            ? pageContent.portal_metrics
                            : DEFAULT_COMPLIANCE_PORTAL.portal_metrics
                          ).map((m, mi) => (
                            <div key={mi} style={{ background: "#141820", padding: "8px 10px", borderRadius: 6, border: `1px solid ${m.color || "#38bdf8"}30` }}>
                              <div style={{ fontSize: "0.68rem", color: "#8892a4" }}>{m.label}</div>
                              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: m.color || "#38bdf8" }}>{m.val}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => setActiveTab("alert-policies")}
                            className="btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaEdit size={11} /> Edit Full 35 Policy Charters &amp; Portal in ALERT Policies Tab
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPageContent((prev) => ({
                                ...prev,
                                ...DEFAULT_COMPLIANCE_PORTAL,
                                policies: DEFAULT_35_POLICIES
                              }));
                              showNotice("Pushed all 35 certified statutory policies & compliance portal to About page! Click 'Save' to apply.");
                            }}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.08)", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaSyncAlt size={11} /> Push / Sync 35 Policies
                          </button>
                        </div>
                      </div>

                      {/* Section 04 Policies Directory Manager */}
                      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #1e2436" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
                              <FaFileContract size={15} />
                              <span>Section 04 Policies Manager</span>
                              <span style={{ fontSize: "0.72rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                                {(pageContent.policies || []).length} policies
                              </span>
                            </div>
                            <div style={{ fontSize: "0.76rem", color: "#8892a4", marginTop: 2 }}>
                              Policies configured here render directly inside Section 04 of /about and automatically sync to /alert-policies.
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={handleRestore35Policies}
                              className="btn-secondary"
                              style={{ padding: "5px 10px", fontSize: "0.74rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.08)", display: "inline-flex", alignItems: "center", gap: 5 }}
                            >
                              <FaSyncAlt size={10} /> Restore 35 Policies
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const isAnyExpanded = Object.values(expandedPolicies).some(Boolean);
                                if (isAnyExpanded) {
                                  handleCollapseAllPolicies();
                                } else {
                                  const allIdxs = (pageContent.policies || []).map((_, i) => i);
                                  handleExpandAllPolicies(allIdxs);
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: "5px 10px", fontSize: "0.74rem", color: "#cbd5e1", borderColor: "#2a3148", display: "inline-flex", alignItems: "center", gap: 5 }}
                            >
                              <FaSlidersH size={10} /> {Object.values(expandedPolicies).some(Boolean) ? "Collapse All" : "Expand All"}
                            </button>
                            <button
                              type="button"
                              onClick={handleAddPolicy}
                              className="btn-secondary"
                              style={{ padding: "5px 12px", fontSize: "0.76rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", display: "inline-flex", alignItems: "center", gap: 5 }}
                            >
                              <FaPlus size={10} /> Add Policy
                            </button>
                          </div>
                        </div>

                        {/* Search & Category filter */}
                        <div style={{ background: "#080b11", border: "1px solid #1e2436", borderRadius: 8, padding: 10, marginBottom: 12 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                              <FaSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8892a4", fontSize: "0.72rem" }} />
                              <input
                                type="text"
                                className="form-input"
                                value={policySearchQuery}
                                onChange={(e) => setPolicySearchQuery(e.target.value)}
                                placeholder="Search policies by name, #ID, category, or act..."
                                style={{ paddingLeft: 28, height: 32, fontSize: "0.8rem" }}
                              />
                              {policySearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setPolicySearchQuery("")}
                                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8892a4", cursor: "pointer" }}
                                >
                                  <FaTimes size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {["all", "Financial & Operational", "Protection & Rights", "Governance & Ethics", "Community & Field"].map((cat) => {
                              const isSelected = policyCategoryFilter === cat;
                              const count = cat === "all"
                                ? (pageContent.policies || []).length
                                : (pageContent.policies || []).filter((p) => p.category === cat).length;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setPolicyCategoryFilter(cat)}
                                  style={{
                                    background: isSelected ? "rgba(56, 189, 248, 0.2)" : "#141820",
                                    border: isSelected ? "1px solid #38bdf8" : "1px solid #2a3148",
                                    color: isSelected ? "#38bdf8" : "#8892a4",
                                    padding: "3px 8px",
                                    borderRadius: 5,
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4
                                  }}
                                >
                                  <span>{cat === "all" ? "All" : cat}</span>
                                  <span style={{ fontSize: "0.62rem", background: isSelected ? "#38bdf8" : "rgba(255,255,255,0.1)", color: isSelected ? "#0a0d14" : "#8892a4", padding: "1px 5px", borderRadius: 8, fontWeight: 800 }}>
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Policy cards */}
                        {(() => {
                          const allPols = pageContent.policies || [];
                          const filtered = allPols
                            .map((pol, originalIdx) => ({ pol, originalIdx }))
                            .filter(({ pol, originalIdx }) => {
                              if (policyCategoryFilter !== "all" && pol.category !== policyCategoryFilter) return false;
                              if (policySearchQuery.trim()) {
                                const q = policySearchQuery.toLowerCase();
                                const numStr = String(pol.id !== undefined ? pol.id : originalIdx + 1);
                                const idMatch = numStr.includes(q) || `#${numStr.padStart(2, "0")}`.toLowerCase().includes(q);
                                const titleMatch = (pol.title || "").toLowerCase().includes(q);
                                const descMatch = (pol.desc || pol.scope || "").toLowerCase().includes(q);
                                const catMatch = (pol.category || "").toLowerCase().includes(q);
                                const actMatch = (pol.statutoryBasis || "").toLowerCase().includes(q);
                                const commMatch = (pol.committee || "").toLowerCase().includes(q);
                                const badgeMatch = (pol.badge || "").toLowerCase().includes(q);
                                return idMatch || titleMatch || descMatch || catMatch || actMatch || commMatch || badgeMatch;
                              }
                              return true;
                            });

                          if (allPols.length === 0) {
                            return (
                              <div style={{ textAlign: "center", padding: 20, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 8, fontSize: "0.82rem" }}>
                                No policies added to Section 04 yet. Click "Add Policy" or "Restore 35 Policies".
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {filtered.map(({ pol, originalIdx }) => {
                                const polAccent = pol.accent || "#003190";
                                const highlightsArr = Array.isArray(pol.highlights)
                                  ? pol.highlights
                                  : (typeof pol.highlights === "string" ? pol.highlights.split(",").map((s) => s.trim()).filter(Boolean) : []);
                                const principlesArr = Array.isArray(pol.principles)
                                  ? pol.principles
                                  : (typeof pol.principles === "string" ? pol.principles.split("\n").map((s) => s.trim()).filter(Boolean) : []);
                                const isPolEditing = Boolean(expandedPolicies[originalIdx]);
                                const numLabel = `#${String(pol.id !== undefined ? pol.id : originalIdx + 1).padStart(2, "0")}`;

                                return (
                                  <div
                                    key={pol.id || originalIdx}
                                    style={{
                                      background: "#080b11",
                                      border: isPolEditing ? `2px solid #38bdf8` : `1px solid ${polAccent}40`,
                                      borderLeft: `4px solid ${isPolEditing ? "#38bdf8" : polAccent}`,
                                      borderRadius: 10,
                                      padding: 12
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isPolEditing ? 10 : 0, flexWrap: "wrap", gap: 6 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 180 }}>
                                        <span style={{ fontSize: "0.74rem", fontWeight: 800, color: polAccent, background: `${polAccent}15`, padding: "1px 6px", borderRadius: 4 }}>
                                          {numLabel}
                                        </span>
                                        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>
                                          {pol.title || `Policy ${numLabel}`}
                                        </span>
                                        {pol.category && (
                                          <span style={{ fontSize: "0.65rem", color: polAccent, border: `1px solid ${polAccent}40`, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                                            {pol.category}
                                          </span>
                                        )}
                                        {pol.badge && (
                                          <span style={{ fontSize: "0.65rem", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                                            {pol.badge}
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <button
                                          type="button"
                                          onClick={() => togglePolicyExpand(originalIdx)}
                                          className="btn-secondary"
                                          style={{
                                            padding: "3px 8px",
                                            fontSize: "0.68rem",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            color: isPolEditing ? "#10b981" : "#38bdf8",
                                            borderColor: isPolEditing ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)",
                                            background: isPolEditing ? "rgba(16, 185, 129, 0.1)" : "rgba(56, 189, 248, 0.08)",
                                            fontWeight: 700,
                                            cursor: "pointer"
                                          }}
                                        >
                                          <FaEdit size={10} /> {isPolEditing ? "Done" : "Edit"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicatePolicy(originalIdx)}
                                          className="btn-secondary"
                                          style={{ padding: "3px 6px", fontSize: "0.7rem", color: "#cbd5e1" }}
                                          title="Duplicate Policy"
                                        >
                                          <FaCopy size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMovePolicy(originalIdx, -1)}
                                          disabled={originalIdx === 0}
                                          className="btn-secondary"
                                          style={{ padding: "3px 6px", fontSize: "0.7rem", opacity: originalIdx === 0 ? 0.4 : 1 }}
                                          title="Move Up"
                                        >
                                          <FaArrowUp size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMovePolicy(originalIdx, 1)}
                                          disabled={originalIdx === (pageContent.policies || []).length - 1}
                                          className="btn-secondary"
                                          style={{ padding: "3px 6px", fontSize: "0.7rem", opacity: originalIdx === (pageContent.policies || []).length - 1 ? 0.4 : 1 }}
                                          title="Move Down"
                                        >
                                          <FaArrowDown size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePolicy(originalIdx)}
                                          className="btn-secondary"
                                          style={{ padding: "3px 6px", fontSize: "0.7rem", color: "#ff7675" }}
                                          title="Delete Policy"
                                        >
                                          <FaTrash size={10} />
                                        </button>
                                      </div>
                                    </div>

                                    {!isPolEditing && (pol.desc || pol.scope) && (
                                      <div style={{ fontSize: "0.74rem", color: "#8892a4", marginTop: 3, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {pol.desc || pol.scope}
                                      </div>
                                    )}

                                    {isPolEditing && (
                                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e2436" }}>
                                        <div className="form-row-2col">
                                          <div className="form-group" style={{ marginBottom: 8 }}>
                                            <label className="form-label" style={{ fontSize: "0.7rem" }}>Policy Title</label>
                                            <input
                                              type="text"
                                              className="form-input"
                                              value={pol.title || ""}
                                              onChange={(e) => {
                                                const copy = [...(pageContent.policies || [])];
                                                copy[originalIdx].title = e.target.value;
                                                setPageContent({ ...pageContent, policies: copy });
                                              }}
                                              placeholder="e.g. Common Cost Policy"
                                              style={{ height: 32, fontSize: "0.8rem" }}
                                            />
                                          </div>
                                          <div className="form-group" style={{ marginBottom: 8 }}>
                                            <label className="form-label" style={{ fontSize: "0.7rem" }}>Category</label>
                                            <input
                                              type="text"
                                              className="form-input"
                                              list="adm-policy-category-suggestions"
                                              value={pol.category || ""}
                                              onChange={(e) => {
                                                const copy = [...(pageContent.policies || [])];
                                                copy[originalIdx].category = e.target.value;
                                                setPageContent({ ...pageContent, policies: copy });
                                              }}
                                              placeholder="Financial & Operational, Protection & Rights, etc."
                                              style={{ height: 32, fontSize: "0.8rem" }}
                                            />
                                          </div>
                                        </div>

                                        <div className="form-row-2col">
                                          <div className="form-group" style={{ marginBottom: 8 }}>
                                            <label className="form-label" style={{ fontSize: "0.7rem" }}>Statutory Badge Tag</label>
                                            <input
                                              type="text"
                                              className="form-input"
                                              list="adm-policy-badge-suggestions"
                                              value={pol.badge || ""}
                                              onChange={(e) => {
                                                const copy = [...(pageContent.policies || [])];
                                                copy[originalIdx].badge = e.target.value;
                                                setPageContent({ ...pageContent, policies: copy });
                                              }}
                                              placeholder="e.g. Statutory, Mandatory, Human Rights"
                                              style={{ height: 32, fontSize: "0.8rem" }}
                                            />
                                          </div>
                                          <div className="form-group" style={{ marginBottom: 8 }}>
                                            <label className="form-label" style={{ fontSize: "0.7rem" }}>Policy ID / Number</label>
                                            <input
                                              type="text"
                                              className="form-input"
                                              value={pol.id !== undefined ? pol.id : originalIdx + 1}
                                              onChange={(e) => {
                                                const copy = [...(pageContent.policies || [])];
                                                copy[originalIdx].id = e.target.value;
                                                setPageContent({ ...pageContent, policies: copy });
                                              }}
                                              style={{ height: 32, fontSize: "0.8rem" }}
                                            />
                                          </div>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 8 }}>
                                          <label className="form-label" style={{ fontSize: "0.7rem" }}>Mandate &amp; Scope Description</label>
                                          <textarea
                                            rows={2}
                                            className="form-textarea"
                                            value={pol.desc || pol.scope || ""}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].desc = e.target.value;
                                              copy[originalIdx].scope = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="Policy mandate and safeguards..."
                                            style={{ fontSize: "0.8rem" }}
                                          />
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 8 }}>
                                          <label className="form-label" style={{ fontSize: "0.7rem" }}>
                                            Statutory Principles / Dossier Points (One per line)
                                          </label>
                                          <textarea
                                            rows={2}
                                            className="form-textarea"
                                            value={principlesArr.join("\n")}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].principles = e.target.value
                                                .split("\n")
                                                .map((s) => s.trim())
                                                .filter(Boolean);
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="Enter principles..."
                                            style={{ fontSize: "0.8rem" }}
                                          />
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.7rem" }}>Highlights (comma separated pills)</label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={highlightsArr.join(", ")}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].highlights = e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean);
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="e.g. Highlights"
                                            style={{ height: 32, fontSize: "0.8rem" }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      <div style={{ background: "#141820", padding: 12, borderRadius: 8, border: "1px dashed #2a3148", fontSize: "0.82rem", color: "#8892a4", display: "flex", alignItems: "center", gap: 10 }}>
                        <FaInfoCircle style={{ color: "#f59e0b", flexShrink: 0 }} />
                        <span>All 35 institutional policy charters (Common Cost, FCRA Finance, POSH, Child Safeguarding, Whistleblower, etc.) are available with live search on the About page. Full charter text can also be customized under the <strong>ALERT Policies</strong> tab.</span>
                      </div>
                    </div>

                    {/* SECTION 05: 20-YEAR MILESTONES */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ color: "#ec4899", fontWeight: 700, fontSize: "0.98rem", display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 0, flexWrap: "wrap" }}>
                          <FaAward size={18} style={{ flexShrink: 0 }} />
                          <span>Section 05: 20-Year Milestones & Historical Journey</span>
                          <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(236, 72, 153, 0.15)", color: "#ec4899", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap" }}>
                            {(pageContent.milestones || []).length} Milestones
                          </span>
                          <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(245, 160, 0, 0.15)", color: "#f59e0b", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap" }}>
                            {(pageContent.timeline_metrics || []).length} Summary Metrics
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddMilestone}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#ec4899", borderColor: "rgba(236, 72, 153, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={10} /> Add Milestone
                        </button>
                      </div>

                      {/* SECTION 05 OUTER WRAPPER META */}
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Section 05 Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec05_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec05_badge: e.target.value })}
                            placeholder="Section 05"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section 05 Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec05_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec05_title: e.target.value })}
                            placeholder="20-Year Milestones"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section 05 Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.sec05_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, sec05_subtitle: e.target.value })}
                          placeholder="The journey from 2004 registration to two decades of transformative grassroots justice, appellate litigation, and women cooperative federations."
                        />
                      </div>

                      {/* 1. TIMELINE HEADER BANNER & JUBILEE CARD */}
                      <div style={{ background: "#141824", border: "1px solid #1e2638", borderRadius: 12, padding: 18, marginBottom: 20 }}>
                        <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.88rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                          <FaLandmark size={14} /> Interactive Timeline Header & Jubilee Badge
                        </div>
                        <div className="form-row-2col">
                          <div className="form-group">
                            <label className="form-label">Header Badge / Tag</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.timeline_badge || ""}
                              onChange={(e) => setPageContent({ ...pageContent, timeline_badge: e.target.value })}
                              placeholder="Historical Journey"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Header Sub-Tag / Date Span</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.timeline_sub || ""}
                              onChange={(e) => setPageContent({ ...pageContent, timeline_sub: e.target.value })}
                              placeholder="2004 — 2024 • Two Decades of Impact"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Main Timeline Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.timeline_heading || ""}
                            onChange={(e) => setPageContent({ ...pageContent, timeline_heading: e.target.value })}
                            placeholder="Two Decades of Transformative Milestones"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Timeline Description / Overview</label>
                          <textarea
                            rows={2}
                            className="form-textarea"
                            value={pageContent.timeline_desc || ""}
                            onChange={(e) => setPageContent({ ...pageContent, timeline_desc: e.target.value })}
                            placeholder="Trace the evolution of ALERT from its foundational registration in 2004 to landmark appellate High Court litigation..."
                          />
                        </div>

                        <div className="form-row-2col" style={{ marginBottom: 0 }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Jubilee Box Title</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.timeline_jubilee_title || ""}
                              onChange={(e) => setPageContent({ ...pageContent, timeline_jubilee_title: e.target.value })}
                              placeholder="20 Years of Advocacy"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Jubilee Box Subtitle</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.timeline_jubilee_sub || ""}
                              onChange={(e) => setPageContent({ ...pageContent, timeline_jubilee_sub: e.target.value })}
                              placeholder="2004 — 2024 Jubilee"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. TIMELINE 4 SUMMARY METRIC CARDS */}
                      <div style={{ background: "#141824", border: "1px solid #1e2638", borderRadius: 12, padding: 18, marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                          <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                            <FaHistory size={14} /> Timeline Summary Metrics ({(pageContent.timeline_metrics || []).length})
                          </div>
                          <button
                            type="button"
                            onClick={handleAddTimelineMetric}
                            className="btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "0.75rem", color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.4)" }}
                          >
                            <FaPlus size={9} /> Add Metric
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                          {(pageContent.timeline_metrics || []).map((metric, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                background: "#0d1017",
                                borderRadius: 10,
                                padding: 14,
                                border: `1px solid ${metric.color ? metric.color + "40" : "#1e2436"}`,
                                borderLeft: `4px solid ${metric.color || "#F5A000"}`
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8892a4" }}>METRIC #{mIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTimelineMetric(mIdx)}
                                  style={{ background: "transparent", border: "none", color: "#ff7675", cursor: "pointer", padding: "2px 6px" }}
                                  title="Delete metric"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                              <div className="form-group" style={{ marginBottom: 8 }}>
                                <label className="form-label" style={{ fontSize: "0.72rem" }}>Metric Label</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={metric.label || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.timeline_metrics || [])];
                                    copy[mIdx] = { ...copy[mIdx], label: e.target.value };
                                    setPageContent({ ...pageContent, timeline_metrics: copy });
                                  }}
                                  placeholder="Active Field Tenure"
                                  style={{ height: 32, fontSize: "0.82rem" }}
                                />
                              </div>
                              <div className="form-row-2col" style={{ marginBottom: 8 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Value</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={metric.val || ""}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.timeline_metrics || [])];
                                      copy[mIdx] = { ...copy[mIdx], val: e.target.value };
                                      setPageContent({ ...pageContent, timeline_metrics: copy });
                                    }}
                                    placeholder="20+ Years"
                                    style={{ height: 32, fontSize: "0.82rem" }}
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Accent Color</label>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <input
                                      type="color"
                                      value={metric.color || "#F5A000"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.timeline_metrics || [])];
                                        copy[mIdx] = { ...copy[mIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, timeline_metrics: copy });
                                      }}
                                      style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent" }}
                                    />
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={metric.color || ""}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.timeline_metrics || [])];
                                        copy[mIdx] = { ...copy[mIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, timeline_metrics: copy });
                                      }}
                                      style={{ height: 32, fontSize: "0.75rem" }}
                                      placeholder="#F5A000"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: "0.72rem" }}>Description</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={metric.desc || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.timeline_metrics || [])];
                                    copy[mIdx] = { ...copy[mIdx], desc: e.target.value };
                                    setPageContent({ ...pageContent, timeline_metrics: copy });
                                  }}
                                  placeholder="Continuous Grassroots Work"
                                  style={{ height: 32, fontSize: "0.82rem" }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. MILESTONES TIMELINE ENTRIES */}
                      <div style={{ background: "#141824", border: "1px solid #1e2638", borderRadius: 12, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                          <div style={{ color: "#ec4899", fontWeight: 700, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: 8 }}>
                            <FaAward size={15} /> Milestones Timeline Entries ({(pageContent.milestones || []).length} items)
                          </div>
                          <button
                            type="button"
                            onClick={handleAddMilestone}
                            className="btn-secondary"
                            style={{ padding: "5px 12px", fontSize: "0.76rem", color: "#ec4899", borderColor: "rgba(236, 72, 153, 0.4)" }}
                          >
                            <FaPlus size={9} /> Add Milestone
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {(pageContent.milestones || []).map((m, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                background: "#0d1017",
                                borderRadius: 12,
                                padding: 16,
                                border: `1px solid ${m.color ? m.color + "40" : "#1e2436"}`,
                                borderTop: `4px solid ${m.color || "#1e3a8a"}`
                              }}
                            >
                              {/* Top Bar with ordering and delete */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ background: m.color || "#1e3a8a", color: "white", fontWeight: 800, fontSize: "0.82rem", padding: "2px 10px", borderRadius: 12 }}>
                                    {m.year || "Year"}
                                  </span>
                                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>
                                    {m.title || `Milestone #${mIdx + 1}`}
                                  </span>
                                  {m.category && (
                                    <span style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.08)", color: "#94a3b8", padding: "2px 8px", borderRadius: 8 }}>
                                      {m.category}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveMilestone(mIdx, mIdx - 1)}
                                    disabled={mIdx === 0}
                                    style={{ background: "#161b26", border: "1px solid #1e2436", color: mIdx === 0 ? "#475569" : "#cbd5e1", padding: "3px 8px", borderRadius: 6, cursor: mIdx === 0 ? "not-allowed" : "pointer", fontSize: "0.72rem" }}
                                    title="Move earlier"
                                  >
                                    <FaArrowUp size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveMilestone(mIdx, mIdx + 1)}
                                    disabled={mIdx === (pageContent.milestones || []).length - 1}
                                    style={{ background: "#161b26", border: "1px solid #1e2436", color: mIdx === (pageContent.milestones || []).length - 1 ? "#475569" : "#cbd5e1", padding: "3px 8px", borderRadius: 6, cursor: mIdx === (pageContent.milestones || []).length - 1 ? "not-allowed" : "pointer", fontSize: "0.72rem" }}
                                    title="Move later"
                                  >
                                    <FaArrowDown size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMilestone(mIdx)}
                                    style={{ background: "transparent", border: "none", color: "#ff7675", cursor: "pointer", padding: "3px 8px" }}
                                    title="Delete milestone"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Row 1: Year, Phase, Category, Color */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 10 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Year</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={m.year || ""}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.milestones || [])];
                                      copy[mIdx] = { ...copy[mIdx], year: e.target.value };
                                      setPageContent({ ...pageContent, milestones: copy });
                                    }}
                                    placeholder="2004"
                                    style={{ height: 32, fontSize: "0.82rem" }}
                                  />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Phase Tag (Uppercase)</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={m.phase || ""}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.milestones || [])];
                                      copy[mIdx] = { ...copy[mIdx], phase: e.target.value };
                                      setPageContent({ ...pageContent, milestones: copy });
                                    }}
                                    placeholder="FOUNDATION & STATUTORY MANDATE"
                                    style={{ height: 32, fontSize: "0.82rem" }}
                                  />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Category</label>
                                  <select
                                    className="form-input"
                                    value={m.category || "Legal & Rights"}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.milestones || [])];
                                      copy[mIdx] = { ...copy[mIdx], category: e.target.value };
                                      setPageContent({ ...pageContent, milestones: copy });
                                    }}
                                    style={{ height: 32, fontSize: "0.82rem", background: "#0d1017", color: "#ffffff", colorScheme: "dark" }}
                                  >
                                    {MILESTONE_CATEGORIES.map((cat) => (
                                      <option key={cat} value={cat} style={{ background: "#0d1017", color: "#ffffff" }}>{cat}</option>
                                    ))}
                                    {!MILESTONE_CATEGORIES.includes(m.category) && m.category && (
                                      <option value={m.category} style={{ background: "#0d1017", color: "#ffffff" }}>{m.category}</option>
                                    )}
                                  </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Accent Color</label>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <input
                                      type="color"
                                      value={m.color || "#1e3a8a"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.milestones || [])];
                                        copy[mIdx] = { ...copy[mIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, milestones: copy });
                                      }}
                                      style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", background: "transparent" }}
                                    />
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={m.color || ""}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.milestones || [])];
                                        copy[mIdx] = { ...copy[mIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, milestones: copy });
                                      }}
                                      style={{ height: 32, fontSize: "0.75rem" }}
                                      placeholder="#1e3a8a"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Row 2: Title, Stat Pill, Icon */}
                              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr", gap: 10, marginBottom: 10 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Milestone Title</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={m.title || ""}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.milestones || [])];
                                      copy[mIdx] = { ...copy[mIdx], title: e.target.value };
                                      setPageContent({ ...pageContent, milestones: copy });
                                    }}
                                    placeholder="ALERT Founded & Registered"
                                    style={{ height: 32, fontSize: "0.82rem" }}
                                  />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Stat / Outcome Pill</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={m.stat || ""}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.milestones || [])];
                                      copy[mIdx] = { ...copy[mIdx], stat: e.target.value };
                                      setPageContent({ ...pageContent, milestones: copy });
                                    }}
                                    placeholder="Registration No. 307/2004"
                                    style={{ height: 32, fontSize: "0.82rem" }}
                                  />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: "0.72rem" }}>Center Spine Icon</label>
                                  <select
                                    className="form-input"
                                    value={m.icon || "FaAward"}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.milestones || [])];
                                      copy[mIdx] = { ...copy[mIdx], icon: e.target.value };
                                      setPageContent({ ...pageContent, milestones: copy });
                                    }}
                                    style={{ height: 32, fontSize: "0.82rem", background: "#0d1017", color: "#ffffff", colorScheme: "dark" }}
                                  >
                                    {MILESTONE_ICONS.map((opt) => (
                                      <option key={opt.id} value={opt.id} style={{ background: "#0d1017", color: "#ffffff" }}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Row 3: Narrative Description */}
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: "0.72rem" }}>Milestone Narrative Description</label>
                                <textarea
                                  rows={2}
                                  className="form-textarea"
                                  value={m.desc || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.milestones || [])];
                                    copy[mIdx] = { ...copy[mIdx], desc: e.target.value };
                                    setPageContent({ ...pageContent, milestones: copy });
                                  }}
                                  placeholder="Full details of the milestone, impact, legal breakthrough, or community empowerment..."
                                  style={{ fontSize: "0.82rem" }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 06: GOVERNING BODY (ON ABOUT PAGE) */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ color: "#2ecc71", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 0, flexWrap: "wrap" }}>
                          <FaUsers size={16} style={{ flexShrink: 0 }} />
                          <span>Section 06: Governing Body Board Members</span>
                          <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(46, 204, 113, 0.15)", color: "#2ecc71", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                            {(pageContent.board_members || []).length} members
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddBoardMember}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#2ecc71", borderColor: "rgba(46, 204, 113, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={10} /> Add Board Member
                        </button>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Governing Body Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.governing_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, governing_badge: e.target.value })}
                            placeholder="Section 06"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Governing Body Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.governing_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, governing_title: e.target.value })}
                            placeholder="Governing Body"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Governing Body Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.governing_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, governing_subtitle: e.target.value })}
                          placeholder="The democratic Board of Directors that guides ALERT's mission..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Governing Body Intro Narrative</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageContent.governing_intro || ""}
                          onChange={(e) => setPageContent({ ...pageContent, governing_intro: e.target.value })}
                          placeholder="ALERT is governed by a dedicated Board of Directors comprising legal scholars..."
                        />
                      </div>

                      {/* BOARD MEMBERS LIST */}
                      {(pageContent.board_members || []).map((m, mIdx) => (
                        <div key={mIdx} style={{ background: "#161b26", borderRadius: 10, padding: 16, marginBottom: 14, border: "1px solid #1e2436" }}>
                          <div className="adm-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                            <span className="adm-item-header-title" style={{ fontSize: "0.84rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto", minWidth: 0 }}>
                              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", flexShrink: 0 }}></span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                Member #{mIdx + 1}: {m.name || "Untitled Member"} {m.role ? `(${m.role})` : ""}
                              </span>
                            </span>
                            <div className="adm-item-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteBoardMember(mIdx)}
                                className="btn-secondary"
                                style={{ background: "rgba(231, 76, 60, 0.12)", border: "1px solid rgba(231, 76, 60, 0.3)", color: "#ff7675", cursor: "pointer", fontSize: "0.72rem", padding: "4px 10px", whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                                title="Delete this member"
                              >
                                <FaTrash size={10} /> Delete Member
                              </button>
                            </div>
                          </div>

                          <div className="form-row-2col">
                            <div className="form-group">
                              <label className="form-label">Member Full Name</label>
                              <input
                                type="text"
                                className="form-input"
                                value={m.name || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.board_members || [])];
                                  cur[mIdx] = { ...cur[mIdx], name: e.target.value };
                                  setPageContent({ ...pageContent, board_members: cur });
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Designation / Role</label>
                              <input
                                type="text"
                                className="form-input"
                                value={m.role || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.board_members || [])];
                                  cur[mIdx] = { ...cur[mIdx], role: e.target.value };
                                  setPageContent({ ...pageContent, board_members: cur });
                                }}
                              />
                            </div>
                          </div>

                          <div className="form-row-2col">
                            <div className="form-group">
                              <label className="form-label">Badge Tag (e.g. Board of Directors)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={m.badge || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.board_members || [])];
                                  cur[mIdx] = { ...cur[mIdx], badge: e.target.value };
                                  setPageContent({ ...pageContent, board_members: cur });
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Key Highlights (comma separated)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={Array.isArray(m.highlights) ? m.highlights.join(", ") : (m.highlights || "")}
                                onChange={(e) => {
                                  const cur = [...(pageContent.board_members || [])];
                                  cur[mIdx] = { ...cur[mIdx], highlights: e.target.value };
                                  setPageContent({ ...pageContent, board_members: cur });
                                }}
                                placeholder="Constitutional Rights Expert, Senior Scholar"
                              />
                            </div>
                          </div>

                          {/* Member Photo Upload */}
                          <div className="form-group">
                            <label className="form-label">Member Photo URL / Upload</label>
                            <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ flex: 1, minWidth: 0 }}
                                value={m.img || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.board_members || [])];
                                  cur[mIdx] = { ...cur[mIdx], img: e.target.value };
                                  setPageContent({ ...pageContent, board_members: cur });
                                }}
                                placeholder="/uploads/Divakar-Babu.jpg"
                              />
                              <label
                                className="btn-secondary"
                                style={{
                                  cursor: uploadingField === `member-${mIdx}` ? "not-allowed" : "pointer",
                                  whiteSpace: "nowrap",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  margin: 0
                                }}
                              >
                                <FaCloudUploadAlt /> {uploadingField === `member-${mIdx}` ? "Uploading..." : "Upload Photo"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  disabled={uploadingField === `member-${mIdx}`}
                                  onChange={(e) => handleMemberImageUpload(e, mIdx)}
                                />
                              </label>
                              {m.img && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = [...(pageContent.board_members || [])];
                                    cur[mIdx] = { ...cur[mIdx], img: "" };
                                    setPageContent({ ...pageContent, board_members: cur });
                                  }}
                                  style={{ background: "transparent", border: "none", color: "#ff7675", cursor: "pointer", fontSize: "0.75rem" }}
                                  title="Clear photo"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                            {m.img && (
                              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                                <img
                                  src={m.img}
                                  alt={m.name || "Member"}
                                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid #2a3148" }}
                                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                                <span style={{ fontSize: "0.75rem", color: "#8892a4" }}>Photo preview</span>
                              </div>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Member Quote (Displayed on Card Flip)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={m.quote || ""}
                              onChange={(e) => {
                                const cur = [...(pageContent.board_members || [])];
                                cur[mIdx] = { ...cur[mIdx], quote: e.target.value };
                                setPageContent({ ...pageContent, board_members: cur });
                              }}
                              placeholder="Justice is non-negotiable for the indigenous forest dwelling communities."
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Bio Narrative</label>
                            <textarea
                              rows={2}
                              className="form-textarea"
                              value={m.bio || ""}
                              onChange={(e) => {
                                const cur = [...(pageContent.board_members || [])];
                                cur[mIdx] = { ...cur[mIdx], bio: e.target.value };
                                setPageContent({ ...pageContent, board_members: cur });
                              }}
                              placeholder="Renowned legal scholar and former Principal of V.R. Law College..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SECTION 07: VISION & MISSION */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#D2190C", fontWeight: 700, fontSize: "1rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaEye size={16} /> Section 07: Vision &amp; Mission Statements
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Section 07 Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec07_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec07_badge: e.target.value })}
                            placeholder="Section 07"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section 07 Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec07_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec07_title: e.target.value })}
                            placeholder="Vision & Mission"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Section 07 Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.sec07_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, sec07_subtitle: e.target.value })}
                          placeholder="Guiding principles that drive every intervention across forest rights, land rehabilitation, and tribal empowerment."
                        />
                      </div>

                      {/* Vision Statement Box */}
                      <div style={{ background: "#141824", border: "1px solid rgba(210, 25, 12, 0.3)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                        <div style={{ color: "#D2190C", fontWeight: 700, fontSize: "0.9rem", marginBottom: 12 }}>
                          Vision Statement
                        </div>
                        <div className="form-row-2col">
                          <div className="form-group">
                            <label className="form-label">Vision Tag</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.vision_tag || ""}
                              onChange={(e) => setPageContent({ ...pageContent, vision_tag: e.target.value })}
                              placeholder="Vision Statement"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Vision Heading</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.vision_title || ""}
                              onChange={(e) => setPageContent({ ...pageContent, vision_title: e.target.value })}
                              placeholder="Empowerment towards Prosperity & Peace"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Vision Quote (Highlighted)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.vision_quote || ""}
                            onChange={(e) => setPageContent({ ...pageContent, vision_quote: e.target.value })}
                            placeholder="Empowerment of socially excluded and marginalized towards prosperity and peace"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Vision Narrative Description</label>
                          <textarea
                            rows={3}
                            className="form-textarea"
                            value={pageContent.vision_desc || ""}
                            onChange={(e) => setPageContent({ ...pageContent, vision_desc: e.target.value })}
                            placeholder="ALERT envisions a future where every socially excluded and marginalized Adivasi family lives with dignity..."
                          />
                        </div>
                      </div>

                      {/* Mission Statement Box */}
                      <div style={{ background: "#141824", border: "1px solid rgba(0, 49, 144, 0.3)", borderRadius: 10, padding: 16 }}>
                        <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.9rem", marginBottom: 12 }}>
                          Mission Statement
                        </div>
                        <div className="form-row-2col">
                          <div className="form-group">
                            <label className="form-label">Mission Tag</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.mission_tag || ""}
                              onChange={(e) => setPageContent({ ...pageContent, mission_tag: e.target.value })}
                              placeholder="Mission Statement"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Mission Heading</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.mission_title || ""}
                              onChange={(e) => setPageContent({ ...pageContent, mission_title: e.target.value })}
                              placeholder="Awaken, Sensitize, Organize, Mobilize"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Mission Quote (Highlighted)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.mission_quote || ""}
                            onChange={(e) => setPageContent({ ...pageContent, mission_quote: e.target.value })}
                            placeholder="To awaken, sensitize, organize and mobilize the Adivasi communities for Self-governance, Self-reliance and Sustainable environment and development"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Mission Narrative Description</label>
                          <textarea
                            rows={3}
                            className="form-textarea"
                            value={pageContent.mission_desc || ""}
                            onChange={(e) => setPageContent({ ...pageContent, mission_desc: e.target.value })}
                            placeholder="ALERT works hand-in-hand with tribal communities to secure forest rights under the RoFR Act 2006..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 08: CORE VALUES */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ color: "#10b981", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto", minWidth: 0 }}>
                          <FaShieldAlt size={16} /> Section 08: Core Values
                          <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: 12 }}>
                            {(pageContent.core_values || []).length} values
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAboutCoreValue}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", whiteSpace: "nowrap" }}
                        >
                          <FaPlus size={10} /> Add Core Value
                        </button>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Section 08 Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec08_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec08_badge: e.target.value })}
                            placeholder="Section 08"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section 08 Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.sec08_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, sec08_title: e.target.value })}
                            placeholder="Core Values"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Section 08 Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.sec08_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, sec08_subtitle: e.target.value })}
                          placeholder="The principles that guide every ALERT intervention — from forest rights to women's cooperatives and disaster relief."
                        />
                      </div>

                      {/* CORE VALUES ITEMS */}
                      {(pageContent.core_values || []).map((val, vIdx) => (
                        <div
                          key={vIdx}
                          style={{
                            background: "#141824",
                            border: `1px solid ${val.accent || "#1e2436"}`,
                            borderLeft: `4px solid ${val.accent || "#10b981"}`,
                            borderRadius: 10,
                            padding: 14,
                            marginBottom: 12
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: val.accent || "#10b981" }}>
                              Value #{vIdx + 1}: {val.title || "Untitled"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAboutCoreValue(vIdx)}
                              style={{ background: "transparent", border: "none", color: "#ff7675", cursor: "pointer", fontSize: "0.75rem" }}
                            >
                              <FaTrash size={11} /> Delete
                            </button>
                          </div>

                          <div className="form-row-2col">
                            <div className="form-group">
                              <label className="form-label">Value Title</label>
                              <input
                                type="text"
                                className="form-input"
                                value={val.title || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.core_values || [])];
                                  cur[vIdx] = { ...cur[vIdx], title: e.target.value };
                                  setPageContent({ ...pageContent, core_values: cur });
                                }}
                                placeholder="e.g. Integrity"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Accent Color Code</label>
                              <input
                                type="text"
                                className="form-input"
                                value={val.accent || ""}
                                onChange={(e) => {
                                  const cur = [...(pageContent.core_values || [])];
                                  cur[vIdx] = { ...cur[vIdx], accent: e.target.value };
                                  setPageContent({ ...pageContent, core_values: cur });
                                }}
                                placeholder="#D2190C"
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Value Quote / Conviction</label>
                            <input
                              type="text"
                              className="form-input"
                              value={val.quote || ""}
                              onChange={(e) => {
                                const cur = [...(pageContent.core_values || [])];
                                cur[vIdx] = { ...cur[vIdx], quote: e.target.value };
                                setPageContent({ ...pageContent, core_values: cur });
                              }}
                              placeholder="We choose our thoughts and actions based on values rather than personal gain."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1. VISION & MISSION */}
                {activeTab === "vision-mission" && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e2436" }}>
                    {/* VISION STATEMENT CARD */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(210, 25, 12, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#D2190C", fontWeight: 700, fontSize: "0.95rem", flex: "1 1 auto", minWidth: 0 }}>
                          <FaEye size={18} style={{ flexShrink: 0 }} />
                          <span>Vision Card Settings (Left Column on Live Page)</span>
                        </div>
                        <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(210, 25, 12, 0.15)", color: "#ff7675", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Section Card 1
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Vision Tag Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.vision?.tag || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              vision: { ...(pageContent.vision || {}), tag: e.target.value }
                            })}
                            placeholder="OUR VISION"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Vision Sub-Badge / Core Direction</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.vision?.subtitle || pageContent.vision?.direction || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              vision: { ...(pageContent.vision || {}), subtitle: e.target.value, direction: e.target.value }
                            })}
                            placeholder="Core Direction"
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Vision Statement Eyebrow</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.vision?.statement_label || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              vision: { ...(pageContent.vision || {}), statement_label: e.target.value }
                            })}
                            placeholder="Vision Statement"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Vision Card Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.vision?.title || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              vision: { ...(pageContent.vision || {}), title: e.target.value }
                            })}
                            placeholder="Our Vision"
                          />
                        </div>
                      </div>

                      {/* VISION BANNER IMAGE UPLOAD & MANAGEMENT */}
                      <div className="form-group" style={{ background: "#141820", padding: 14, borderRadius: 10, border: "1px solid #1e2436" }}>
                        <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span><FaCloudUploadAlt style={{ marginRight: 6, color: "#D2190C" }} /> Vision Banner Image</span>
                          <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Upload image file or enter URL</span>
                        </label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            value={pageContent.vision?.image || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              vision: { ...(pageContent.vision || {}), image: e.target.value }
                            })}
                            placeholder="/uploads/cropped-12.jpg or https://..."
                          />
                          <label
                            className="btn-primary"
                            style={{
                              cursor: uploadingField === "vision" ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              margin: 0,
                              background: "#D2190C",
                              opacity: uploadingField === "vision" ? 0.7 : 1
                            }}
                          >
                            <FaCloudUploadAlt /> {uploadingField === "vision" ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "vision"}
                              onChange={(e) => handleImageUpload(e, "vision")}
                            />
                          </label>
                          {pageContent.vision?.image && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage("vision")}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Delete / Clear Image"
                            >
                              <FaTrash size={12} /> Delete
                            </button>
                          )}
                        </div>

                        {pageContent.vision?.image && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageContent.vision.image}
                              alt="Vision banner preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Vision Banner Preview</div>
                              <div className="adm-preview-path" title={pageContent.vision.image}>
                                {pageContent.vision.image.startsWith("data:") ? "Immediate Preview (Uploaded Data URL)" : pageContent.vision.image}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage("vision")}
                              className="adm-preview-remove"
                              title="Delete banner image"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Vision Quote (Highlighted Callout)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.vision?.quote || ""}
                          onChange={(e) => setPageContent({
                            ...pageContent,
                            vision: { ...(pageContent.vision || {}), quote: e.target.value }
                          })}
                          placeholder="An egalitarian society where tribal and marginalized communities live with sovereign dignity..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Vision Detailed Narrative</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.vision?.desc || ""}
                          onChange={(e) => setPageContent({
                            ...pageContent,
                            vision: { ...(pageContent.vision || {}), desc: e.target.value }
                          })}
                          placeholder="ALERT envisions an inclusive and resilient society..."
                        />
                      </div>

                      {/* VISION FOCUS POINTS ITEM MANAGER (REPEATER LIST WITH ADD ANOTHER BELOW) */}
                      <div className="form-group" style={{ background: "#141820", padding: 16, borderRadius: 12, border: "1px solid #1e2436" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <label className="form-label" style={{ marginBottom: 2, display: "flex", alignItems: "center", gap: 8, color: "#ff7675", fontWeight: 700 }}>
                              <span>👁️ Vision Focus Points / Commitments ({(pageContent.vision?.points || []).length})</span>
                            </label>
                            <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>
                              Edit points inline, reorder, delete, or click "+ Add Another Point" to insert a new one below.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = Array.isArray(pageContent.vision?.points) ? [...pageContent.vision.points] : [];
                              setPageContent((prev) => ({
                                ...prev,
                                vision: { ...(prev.vision || {}), points: [...cur, ""] }
                              }));
                            }}
                            className="btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#ff7675", borderColor: "rgba(210, 25, 12, 0.4)", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                          >
                            <FaPlus size={10} /> Add Another Point
                          </button>
                        </div>

                        {/* List of item input rows */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                          {(pageContent.vision?.points || []).map((point, ptIdx) => {
                            const ptVal = typeof point === "object" && point !== null ? (point.title || point.name || point.desc || "") : String(point || "");
                            return (
                              <div
                                key={ptIdx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  background: "#0d1017",
                                  padding: "8px 12px",
                                  borderRadius: 8,
                                  border: "1px solid rgba(210, 25, 12, 0.25)"
                                }}
                              >
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff7675", width: 24, textAlign: "center", flexShrink: 0 }}>
                                  #{ptIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ flex: 1, minWidth: 0, padding: "7px 12px", fontSize: "0.85rem" }}
                                  value={ptVal}
                                  placeholder={`Focus point #${ptIdx + 1} (e.g. Sovereignty over ancestral forest domains...)...`}
                                  onChange={(e) => {
                                    const cur = [...(pageContent.vision?.points || [])];
                                    cur[ptIdx] = e.target.value;
                                    setPageContent((prev) => ({
                                      ...prev,
                                      vision: { ...(prev.vision || {}), points: cur }
                                    }));
                                  }}
                                />
                                <button
                                  type="button"
                                  disabled={ptIdx === 0}
                                  onClick={() => {
                                    if (ptIdx === 0) return;
                                    const cur = [...(pageContent.vision?.points || [])];
                                    const temp = cur[ptIdx - 1];
                                    cur[ptIdx - 1] = cur[ptIdx];
                                    cur[ptIdx] = temp;
                                    setPageContent((prev) => ({
                                      ...prev,
                                      vision: { ...(prev.vision || {}), points: cur }
                                    }));
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "6px 8px", opacity: ptIdx === 0 ? 0.3 : 1, cursor: ptIdx === 0 ? "not-allowed" : "pointer" }}
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  disabled={ptIdx === (pageContent.vision?.points || []).length - 1}
                                  onClick={() => {
                                    if (ptIdx >= (pageContent.vision?.points || []).length - 1) return;
                                    const cur = [...(pageContent.vision?.points || [])];
                                    const temp = cur[ptIdx + 1];
                                    cur[ptIdx + 1] = cur[ptIdx];
                                    cur[ptIdx] = temp;
                                    setPageContent((prev) => ({
                                      ...prev,
                                      vision: { ...(prev.vision || {}), points: cur }
                                    }));
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "6px 8px", opacity: ptIdx === (pageContent.vision?.points || []).length - 1 ? 0.3 : 1, cursor: ptIdx === (pageContent.vision?.points || []).length - 1 ? "not-allowed" : "pointer" }}
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = (pageContent.vision?.points || []).filter((_, idx) => idx !== ptIdx);
                                    setPageContent((prev) => ({
                                      ...prev,
                                      vision: { ...(prev.vision || {}), points: cur }
                                    }));
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "6px 8px", color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)" }}
                                  title="Delete this point"
                                >
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            );
                          })}

                          {(!pageContent.vision?.points || pageContent.vision.points.length === 0) && (
                            <div style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "0.82rem", background: "#0d1017", borderRadius: 8, border: "1px dashed #2a3148" }}>
                              No vision focus points added yet. Click "+ Add Another Point" to create one.
                            </div>
                          )}
                        </div>

                        {/* Bottom button to show another one below */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = Array.isArray(pageContent.vision?.points) ? [...pageContent.vision.points] : [];
                              setPageContent((prev) => ({
                                ...prev,
                                vision: { ...(prev.vision || {}), points: [...cur, ""] }
                              }));
                            }}
                            className="btn-secondary"
                            style={{ flex: 1, minWidth: 200, justifyContent: "center", display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", color: "#ff7675", borderColor: "rgba(210, 25, 12, 0.4)", background: "rgba(210, 25, 12, 0.06)" }}
                          >
                            <FaPlus size={10} /> Add Another Point Below
                          </button>
                        </div>

                        {/* Comma-separated input for direct bulk editing */}
                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: "0.7rem", color: "#8892a4", display: "block", marginBottom: 4 }}>Or bulk edit as comma-separated:</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: "0.78rem", color: "#94a3b8" }}
                            value={formatTagsToString(pageContent.vision?.points)}
                            onChange={(e) => {
                              const pts = e.target.value.split(",").map(p => p.trim()).filter(Boolean);
                              setPageContent({
                                ...pageContent,
                                vision: { ...(pageContent.vision || {}), points: pts }
                              });
                            }}
                            placeholder="Or bulk edit as comma separated..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* MISSION STATEMENT CARD */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(0, 49, 144, 0.45)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#38BDF8", fontWeight: 700, fontSize: "0.95rem", flex: "1 1 auto", minWidth: 0 }}>
                          <FaBullseye size={18} style={{ flexShrink: 0 }} />
                          <span>Mission Card Settings (Right Column on Live Page)</span>
                        </div>
                        <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(0, 49, 144, 0.25)", color: "#38BDF8", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Section Card 2
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Mission Tag Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.mission?.tag || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              mission: { ...(pageContent.mission || {}), tag: e.target.value }
                            })}
                            placeholder="OUR MISSION"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Mission Sub-Badge / Strategic Mandate</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.mission?.subtitle || pageContent.mission?.mandate || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              mission: { ...(pageContent.mission || {}), subtitle: e.target.value, mandate: e.target.value }
                            })}
                            placeholder="Strategic Mandate"
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Mission Statement Eyebrow</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.mission?.statement_label || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              mission: { ...(pageContent.mission || {}), statement_label: e.target.value }
                            })}
                            placeholder="Mission Statement"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Mission Card Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.mission?.title || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              mission: { ...(pageContent.mission || {}), title: e.target.value }
                            })}
                            placeholder="Our Mission"
                          />
                        </div>
                      </div>

                      {/* MISSION BANNER IMAGE UPLOAD & MANAGEMENT */}
                      <div className="form-group" style={{ background: "#141820", padding: 14, borderRadius: 10, border: "1px solid #1e2436" }}>
                        <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span><FaCloudUploadAlt style={{ marginRight: 6, color: "#38BDF8" }} /> Mission Banner Image</span>
                          <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Upload image file or enter URL</span>
                        </label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            value={pageContent.mission?.image || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              mission: { ...(pageContent.mission || {}), image: e.target.value }
                            })}
                            placeholder="/uploads/cropped-4.jpg or https://..."
                          />
                          <label
                            className="btn-primary"
                            style={{
                              cursor: uploadingField === "mission" ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              margin: 0,
                              background: "#003190",
                              opacity: uploadingField === "mission" ? 0.7 : 1
                            }}
                          >
                            <FaCloudUploadAlt /> {uploadingField === "mission" ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "mission"}
                              onChange={(e) => handleImageUpload(e, "mission")}
                            />
                          </label>
                          {pageContent.mission?.image && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage("mission")}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Delete / Clear Image"
                            >
                              <FaTrash size={12} /> Delete
                            </button>
                          )}
                        </div>

                        {pageContent.mission?.image && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageContent.mission.image}
                              alt="Mission banner preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Mission Banner Preview</div>
                              <div className="adm-preview-path" title={pageContent.mission.image}>
                                {pageContent.mission.image.startsWith("data:") ? "Immediate Preview (Uploaded Data URL)" : pageContent.mission.image}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage("mission")}
                              className="adm-preview-remove"
                              title="Delete banner image"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mission Quote (Highlighted Callout)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.mission?.quote || ""}
                          onChange={(e) => setPageContent({
                            ...pageContent,
                            mission: { ...(pageContent.mission || {}), quote: e.target.value }
                          })}
                          placeholder="Mobilizing communities, defending constitutional land tenure..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mission Detailed Narrative</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.mission?.desc || ""}
                          onChange={(e) => setPageContent({
                            ...pageContent,
                            mission: { ...(pageContent.mission || {}), desc: e.target.value }
                          })}
                          placeholder="To educate, organize, and legally support tribal and forest-dwelling communities..."
                        />
                      </div>

                      {/* MISSION PILLARS ITEM MANAGER (REPEATER LIST WITH ADD ANOTHER BELOW) */}
                      <div className="form-group" style={{ background: "#141820", padding: 16, borderRadius: 12, border: "1px solid #1e2436" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                          <div>
                            <label className="form-label" style={{ marginBottom: 2, display: "flex", alignItems: "center", gap: 8, color: "#38BDF8", fontWeight: 700 }}>
                              <span>🎯 Key Mission Pillars / Action Mandates ({(pageContent.mission?.pillars || []).length})</span>
                            </label>
                            <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>
                              Edit pillars inline, reorder, delete, or click "+ Add Another Pillar" to insert a new one below.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = Array.isArray(pageContent.mission?.pillars) ? [...pageContent.mission.pillars] : [];
                              setPageContent((prev) => ({
                                ...prev,
                                mission: { ...(prev.mission || {}), pillars: [...cur, ""] }
                              }));
                            }}
                            className="btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#38BDF8", borderColor: "rgba(56, 189, 248, 0.4)", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                          >
                            <FaPlus size={10} /> Add Another Pillar
                          </button>
                        </div>

                        {/* List of item input rows */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                          {(pageContent.mission?.pillars || []).map((pillar, pIdx) => {
                            const pVal = typeof pillar === "object" && pillar !== null ? (pillar.title || pillar.name || pillar.desc || "") : String(pillar || "");
                            return (
                              <div
                                key={pIdx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  background: "#0d1017",
                                  padding: "8px 12px",
                                  borderRadius: 8,
                                  border: "1px solid rgba(56, 189, 248, 0.25)"
                                }}
                              >
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38BDF8", width: 24, textAlign: "center", flexShrink: 0 }}>
                                  #{pIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ flex: 1, minWidth: 0, padding: "7px 12px", fontSize: "0.85rem" }}
                                  value={pVal}
                                  placeholder={`Pillar #${pIdx + 1} (e.g. Rights Enforcement, Grassroots Organizing, Emergency Relief & Energy)...`}
                                  onChange={(e) => {
                                    const cur = [...(pageContent.mission?.pillars || [])];
                                    cur[pIdx] = e.target.value;
                                    setPageContent((prev) => ({
                                      ...prev,
                                      mission: { ...(prev.mission || {}), pillars: cur }
                                    }));
                                  }}
                                />
                                <button
                                  type="button"
                                  disabled={pIdx === 0}
                                  onClick={() => {
                                    if (pIdx === 0) return;
                                    const cur = [...(pageContent.mission?.pillars || [])];
                                    const temp = cur[pIdx - 1];
                                    cur[pIdx - 1] = cur[pIdx];
                                    cur[pIdx] = temp;
                                    setPageContent((prev) => ({
                                      ...prev,
                                      mission: { ...(prev.mission || {}), pillars: cur }
                                    }));
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "6px 8px", opacity: pIdx === 0 ? 0.3 : 1, cursor: pIdx === 0 ? "not-allowed" : "pointer" }}
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  disabled={pIdx === (pageContent.mission?.pillars || []).length - 1}
                                  onClick={() => {
                                    if (pIdx >= (pageContent.mission?.pillars || []).length - 1) return;
                                    const cur = [...(pageContent.mission?.pillars || [])];
                                    const temp = cur[pIdx + 1];
                                    cur[pIdx + 1] = cur[pIdx];
                                    cur[pIdx] = temp;
                                    setPageContent((prev) => ({
                                      ...prev,
                                      mission: { ...(prev.mission || {}), pillars: cur }
                                    }));
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "6px 8px", opacity: pIdx === (pageContent.mission?.pillars || []).length - 1 ? 0.3 : 1, cursor: pIdx === (pageContent.mission?.pillars || []).length - 1 ? "not-allowed" : "pointer" }}
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cur = (pageContent.mission?.pillars || []).filter((_, idx) => idx !== pIdx);
                                    setPageContent((prev) => ({
                                      ...prev,
                                      mission: { ...(prev.mission || {}), pillars: cur }
                                    }));
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: "6px 8px", color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)" }}
                                  title="Delete this pillar"
                                >
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            );
                          })}

                          {(!pageContent.mission?.pillars || pageContent.mission.pillars.length === 0) && (
                            <div style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "0.82rem", background: "#0d1017", borderRadius: 8, border: "1px dashed #2a3148" }}>
                              No mission pillars added yet. Click "+ Add Another Pillar" to create one.
                            </div>
                          )}
                        </div>

                        {/* Bottom button to show another one below */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = Array.isArray(pageContent.mission?.pillars) ? [...pageContent.mission.pillars] : [];
                              setPageContent((prev) => ({
                                ...prev,
                                mission: { ...(prev.mission || {}), pillars: [...cur, ""] }
                              }));
                            }}
                            className="btn-secondary"
                            style={{ flex: 1, minWidth: 200, justifyContent: "center", display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", color: "#38BDF8", borderColor: "rgba(56, 189, 248, 0.4)", background: "rgba(56, 189, 248, 0.06)" }}
                          >
                            <FaPlus size={10} /> Add Another Pillar Below
                          </button>
                        </div>

                        {/* Comma-separated input for direct bulk editing */}
                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: "0.7rem", color: "#8892a4", display: "block", marginBottom: 4 }}>Or bulk edit as comma-separated:</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: "0.78rem", color: "#94a3b8" }}
                            value={formatTagsToString(pageContent.mission?.pillars)}
                            onChange={(e) => {
                              const pts = e.target.value.split(",").map(p => p.trim()).filter(Boolean);
                              setPageContent({
                                ...pageContent,
                                mission: { ...(pageContent.mission || {}), pillars: pts }
                              });
                            }}
                            placeholder="Or bulk edit as comma separated: Rights Enforcement, Grassroots Organizing..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* IMPACT STATS SECTION */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ color: "#F5A000", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0, flex: "1 1 auto" }}>
                          <span>📊 Impact Stats Section ("Numbers That Speak")</span>
                          <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(245, 160, 0, 0.15)", color: "#F5A000", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                            {(pageContent.stats?.items || []).length} stats
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const curStats = pageContent.stats?.items || [];
                            const newStat = { num: "100+", label: "New Impact Stat", desc: "Short description of the impact achieved", color: "#F5A000" };
                            setPageContent({
                              ...pageContent,
                              stats: {
                                ...(pageContent.stats || {}),
                                items: [...curStats, newStat]
                              }
                            });
                            showNotice("Added new impact stat card!");
                          }}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#F5A000", borderColor: "rgba(245, 160, 0, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={10} /> Add New Stat
                        </button>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Stats Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.stats?.badge || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              stats: { ...(pageContent.stats || {}), badge: e.target.value }
                            })}
                            placeholder="Our Impact"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Stats Section Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.stats?.title || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              stats: { ...(pageContent.stats || {}), title: e.target.value }
                            })}
                            placeholder="Numbers That Speak"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Stats Section Subtitle</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageContent.stats?.subtitle || ""}
                          onChange={(e) => setPageContent({
                            ...pageContent,
                            stats: { ...(pageContent.stats || {}), subtitle: e.target.value }
                          })}
                          placeholder="Two decades of grassroots work across the Fifth Scheduled Areas..."
                        />
                      </div>

                      {/* STAT ITEMS LIST */}
                      {(pageContent.stats?.items || []).map((st, idx) => (
                        <div key={idx} style={{ background: "#161b26", borderRadius: 10, padding: 16, marginBottom: 12, border: `1px solid ${st.color || "#F5A000"}40` }}>
                          <div className="adm-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                            <span className="adm-item-header-title" style={{ fontSize: "0.84rem", fontWeight: 700, color: st.color || "#F5A000", display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto", minWidth: 0 }}>
                              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: st.color || "#F5A000", flexShrink: 0 }}></span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                Stat Item #{idx + 1}: {st.label || "Untitled"}
                              </span>
                            </span>
                            <div className="adm-item-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const curStats = (pageContent.stats?.items || []).filter((_, i) => i !== idx);
                                  setPageContent({
                                    ...pageContent,
                                    stats: { ...(pageContent.stats || {}), items: curStats }
                                  });
                                  showNotice(`Removed Stat #${idx + 1}`);
                                }}
                                className="btn-secondary"
                                style={{ background: "rgba(231, 76, 60, 0.12)", border: "1px solid rgba(231, 76, 60, 0.3)", color: "#ff7675", cursor: "pointer", fontSize: "0.72rem", padding: "4px 10px", whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                                title="Delete this stat"
                              >
                                <FaTrash size={10} /> Delete Stat
                              </button>
                            </div>
                          </div>

                          <div className="form-row-2col">
                            <div className="form-group">
                              <label className="form-label">Metric Value (e.g. 20+, 25,000+, 371)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={st.num || ""}
                                onChange={(e) => {
                                  const curStats = [...(pageContent.stats?.items || [])];
                                  curStats[idx] = { ...curStats[idx], num: e.target.value };
                                  setPageContent({ ...pageContent, stats: { ...(pageContent.stats || {}), items: curStats } });
                                }}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Metric Label (e.g. Years of Service)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={st.label || ""}
                                onChange={(e) => {
                                  const curStats = [...(pageContent.stats?.items || [])];
                                  curStats[idx] = { ...curStats[idx], label: e.target.value };
                                  setPageContent({ ...pageContent, stats: { ...(pageContent.stats || {}), items: curStats } });
                                }}
                              />
                            </div>
                          </div>

                          <div className="form-row-2col">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label">Short Description</label>
                              <input
                                type="text"
                                className="form-input"
                                value={st.desc || ""}
                                onChange={(e) => {
                                  const curStats = [...(pageContent.stats?.items || [])];
                                  curStats[idx] = { ...curStats[idx], desc: e.target.value };
                                  setPageContent({ ...pageContent, stats: { ...(pageContent.stats || {}), items: curStats } });
                                }}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label">Accent Color Hex</label>
                              <input
                                type="text"
                                className="form-input"
                                value={st.color || "#F5A000"}
                                onChange={(e) => {
                                  const curStats = [...(pageContent.stats?.items || [])];
                                  curStats[idx] = { ...curStats[idx], color: e.target.value };
                                  setPageContent({ ...pageContent, stats: { ...(pageContent.stats || {}), items: curStats } });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!pageContent.stats?.items || pageContent.stats.items.length === 0) && (
                        <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "0.85rem", background: "#161b26", borderRadius: 8 }}>
                          No impact stats yet. Click "+ Add New Stat" above.
                        </div>
                      )}
                    </div>

                    {/* CORE BELIEFS SECTION */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ color: "#2ecc71", fontWeight: 700, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0, flex: "1 1 auto" }}>
                          <span>🌿 Core Beliefs ("What We Stand For")</span>
                          <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(46, 204, 113, 0.15)", color: "#2ecc71", padding: "2px 8px", borderRadius: 12 }}>
                            {(pageContent.beliefs?.items || []).length} beliefs
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const curBeliefs = pageContent.beliefs?.items || [];
                            const newB = { title: "New Core Belief", desc: "Description of ALERT's core belief and practice.", color: "#003190" };
                            setPageContent({
                              ...pageContent,
                              beliefs: {
                                ...(pageContent.beliefs || {}),
                                items: [...curBeliefs, newB]
                              }
                            });
                            showNotice("Added new core belief card!");
                          }}
                          className="btn-secondary"
                          style={{ padding: "5px 12px", fontSize: "0.78rem", color: "#2ecc71", borderColor: "rgba(46, 204, 113, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={10} /> Add New Belief
                        </button>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Beliefs Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.beliefs?.badge || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              beliefs: { ...(pageContent.beliefs || {}), badge: e.target.value }
                            })}
                            placeholder="Core Beliefs"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Beliefs Section Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.beliefs?.title || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              beliefs: { ...(pageContent.beliefs || {}), title: e.target.value }
                            })}
                            placeholder="What We Stand For"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Beliefs Section Subtitle</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageContent.beliefs?.subtitle || ""}
                          onChange={(e) => setPageContent({
                            ...pageContent,
                            beliefs: { ...(pageContent.beliefs || {}), subtitle: e.target.value }
                          })}
                          placeholder="ALERT's work is anchored in these core beliefs..."
                        />
                      </div>

                      {/* BELIEF ITEMS LIST */}
                      {(pageContent.beliefs?.items || []).map((bel, idx) => (
                        <div key={idx} style={{ background: "#161b26", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #1e2436" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto", minWidth: 0 }}>
                              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", flexShrink: 0 }}></span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                Belief #{idx + 1}: {bel.title || "Untitled"}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const curBeliefs = (pageContent.beliefs?.items || []).filter((_, i) => i !== idx);
                                setPageContent({
                                  ...pageContent,
                                  beliefs: { ...(pageContent.beliefs || {}), items: curBeliefs }
                                });
                                showNotice(`Removed Belief #${idx + 1}`);
                              }}
                              className="btn-secondary"
                              style={{ background: "rgba(231, 76, 60, 0.12)", border: "1px solid rgba(231, 76, 60, 0.3)", color: "#ff7675", cursor: "pointer", fontSize: "0.72rem", padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                              title="Delete this belief"
                            >
                              <FaTrash size={10} /> Delete Belief
                            </button>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Belief Title</label>
                            <input
                              type="text"
                              className="form-input"
                              value={bel.title || ""}
                              onChange={(e) => {
                                const curBeliefs = [...(pageContent.beliefs?.items || [])];
                                curBeliefs[idx] = { ...curBeliefs[idx], title: e.target.value };
                                setPageContent({ ...pageContent, beliefs: { ...(pageContent.beliefs || {}), items: curBeliefs } });
                              }}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Belief Description</label>
                            <textarea
                              rows={2}
                              className="form-textarea"
                              value={bel.desc || ""}
                              onChange={(e) => {
                                const curBeliefs = [...(pageContent.beliefs?.items || [])];
                                curBeliefs[idx] = { ...curBeliefs[idx], desc: e.target.value };
                                setPageContent({ ...pageContent, beliefs: { ...(pageContent.beliefs || {}), items: curBeliefs } });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {(!pageContent.beliefs?.items || pageContent.beliefs.items.length === 0) && (
                        <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "0.85rem", background: "#161b26", borderRadius: 8 }}>
                          No core beliefs yet. Click "+ Add New Belief" above.
                        </div>
                      )}
                    </div>

                    {/* APPROACH SECTION CARD */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#F5A000", fontWeight: 700, fontSize: "1rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>🛡️ Approach Card ("From Rights to Resilience")</span>
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Approach Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.approach?.badge || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              approach: { ...(pageContent.approach || {}), badge: e.target.value }
                            })}
                            placeholder="Our Approach"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Approach Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.approach?.title || ""}
                            onChange={(e) => setPageContent({
                              ...pageContent,
                              approach: { ...(pageContent.approach || {}), title: e.target.value }
                            })}
                            placeholder="From Rights to Resilience"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Approach Description</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.approach?.desc || ""}
                          onChange={(e) => setPageContent({
                            ...pageContent,
                            approach: { ...(pageContent.approach || {}), desc: e.target.value }
                          })}
                          placeholder="ALERT follows a rights-based development approach..."
                        />
                      </div>

                      {/* APPROACH TAGS (CHIPS + ADD + COMMA SEPARATED) */}
                      <div className="form-group">
                        <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>Approach Focus Tags ({(pageContent.approach?.tags || []).length})</span>
                          <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Click '×' on any tag to delete</span>
                        </label>

                        {/* Interactive Chips with delete button */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                          {(pageContent.approach?.tags || []).map((t, idx) => {
                            const label = typeof t === "object" && t !== null ? (t.title || t.name || "") : String(t);
                            return (
                              <span
                                key={idx}
                                className="adm-tag-chip"
                                style={{
                                  background: "rgba(245, 160, 0, 0.15)",
                                  color: "#F5A000",
                                  border: "1px solid rgba(245, 160, 0, 0.35)",
                                }}
                              >
                                <span className="adm-tag-chip-text">{label}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteApproachTag(idx)}
                                  className="adm-tag-chip-del"
                                  style={{ color: "#F5A000" }}
                                  title={`Delete tag '${label}'`}
                                >
                                  <FaTimes size={10} />
                                </button>
                              </span>
                            );
                          })}
                          {(!pageContent.approach?.tags || pageContent.approach.tags.length === 0) && (
                            <span style={{ fontSize: "0.78rem", color: "#64748b", fontStyle: "italic" }}>No approach tags added yet.</span>
                          )}
                        </div>

                        {/* Quick add tag row */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            placeholder="Type new approach tag (e.g. Rights-Based)..."
                            value={newApproachTag}
                            onChange={(e) => setNewApproachTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddApproachTag();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddApproachTag()}
                            className="btn-secondary"
                            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                          >
                            <FaPlus size={10} /> Add Tag
                          </button>
                        </div>

                        {/* Comma-separated input for direct bulk editing */}
                        <div>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: "0.78rem", color: "#94a3b8" }}
                            value={formatTagsToString(pageContent.approach?.tags)}
                            onChange={(e) => {
                              const pts = e.target.value.split(",").map(p => p.trim()).filter(Boolean);
                              setPageContent({
                                ...pageContent,
                                approach: { ...(pageContent.approach || {}), tags: pts }
                              });
                            }}
                            placeholder="Or bulk edit as comma separated: Community-Led, Rights-Based, Sustainable..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* OFFICIAL PROFILE PDF DOWNLOAD SETTINGS */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(210, 25, 12, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ff7675", fontWeight: 700, fontSize: "0.95rem" }}>
                          <FaFilePdf size={18} style={{ color: "#D2190C" }} />
                          <span>Official Profile PDF Link &amp; Button Settings</span>
                        </div>
                        <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(210, 25, 12, 0.15)", color: "#ff7675", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          PDF Document Action
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span><FaFilePdf style={{ marginRight: 6, color: "#D2190C" }} /> Official Profile PDF Link / Path</span>
                            <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Upload PDF or enter URL/path</span>
                          </label>
                          <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1, minWidth: 0 }}
                              value={pageContent.profile_pdf || ""}
                              onChange={(e) => setPageContent({ ...pageContent, profile_pdf: e.target.value })}
                              placeholder="/uploads/Organizational-Profile-of-ALERT.pdf"
                            />
                            <label
                              className="btn-primary"
                              style={{
                                cursor: uploadingField === "profile_pdf_vm" ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                margin: 0,
                                background: "#D2190C",
                                opacity: uploadingField === "profile_pdf_vm" ? 0.7 : 1
                              }}
                            >
                              <FaCloudUploadAlt /> {uploadingField === "profile_pdf_vm" ? "Uploading..." : "Upload PDF"}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: "none" }}
                                disabled={uploadingField === "profile_pdf_vm"}
                                onChange={(e) => handlePdfUpload(e, "profile_pdf")}
                              />
                            </label>
                            {pageContent.profile_pdf && (
                              <button
                                type="button"
                                onClick={() => setPageContent({ ...pageContent, profile_pdf: "" })}
                                className="btn-secondary"
                                style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                                title="Clear PDF"
                              >
                                <FaTrash size={12} /> Clear
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Profile PDF Button Label</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.profile_pdf_label || ""}
                            onChange={(e) => setPageContent({ ...pageContent, profile_pdf_label: e.target.value })}
                            placeholder="Download Official Profile PDF"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CORE VALUES */}
                {activeTab === "core-values" && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1e2436" }}>
                    
                    {/* SECTION 02: HERO & BANNER */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#D2190C", fontWeight: 700, fontSize: "1rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaShieldAlt size={16} /> Section 02: Hero &amp; Banner
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Hero Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageBadge}
                            onChange={(e) => setPageBadge(e.target.value)}
                            placeholder="Section 02"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Page Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                            placeholder="Core Values"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Page Subtitle</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageSubtitle}
                          onChange={(e) => setPageSubtitle(e.target.value)}
                          placeholder="The principles that guide every ALERT intervention..."
                        />
                      </div>
                      
                      {/* Optional Banner Image Upload */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Hero Banner Image (Optional)</label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            value={pageBanner || ""}
                            onChange={(e) => setPageBanner(e.target.value)}
                            placeholder="e.g. /uploads/core-values-banner.jpg or https://..."
                          />
                          <label
                            className="btn-secondary"
                            style={{
                              cursor: uploadingField === "banner_image" ? "wait" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "9px 14px"
                            }}
                          >
                            <FaCloudUploadAlt /> {uploadingField === "banner_image" ? "Uploading..." : "Upload Banner"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "banner_image"}
                              onChange={handleBannerUpload}
                            />
                          </label>
                          {pageBanner && (
                            <button
                              type="button"
                              onClick={() => setPageBanner("")}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Remove banner image"
                            >
                              <FaTrash size={12} /> Clear
                            </button>
                          )}
                        </div>
                        {/* CORE VALUES HERO BANNER */}
                        {pageBanner && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageBanner}
                              alt="Banner preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Core Values Banner Preview</div>
                              <div className="adm-preview-path" title={pageBanner}>
                                {pageBanner.startsWith("data:") ? "Immediate Data URL Preview" : pageBanner}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPageBanner("");
                                setSaveNotice("Banner removed. Click 'Save' to persist.");
                              }}
                              className="adm-preview-remove"
                              title="Remove banner"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* VALUES CARDS MANAGER */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <FaStar size={16} />
                            <span>Core Values Cards</span>
                            <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {(pageContent.values || []).length} values
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            Add, reorder, edit, or delete the value cards displayed in the grid on /core-values.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCoreValue}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={11} /> Add Value Card
                        </button>
                      </div>

                      {(pageContent.values || []).length === 0 && (
                        <div style={{ textAlign: "center", padding: 30, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 10 }}>
                          No core value cards yet. Click "Add Value Card" to create the first card.
                        </div>
                      )}

                      {(pageContent.values || []).map((val, vIdx) => {
                        const accent = val.accent || "#D2190C";
                        return (
                          <div
                            key={val.id || `v-${vIdx}`}
                            style={{
                              background: "#080b11",
                              border: `1px solid ${accent}40`,
                              borderLeft: `4px solid ${accent}`,
                              borderRadius: 12,
                              padding: 16,
                              marginBottom: 16
                            }}
                          >
                            <div className="adm-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                              <div className="adm-item-header-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ padding: "3px 10px", borderRadius: 6, background: `${accent}25`, color: accent, fontSize: "0.75rem", fontWeight: 800 }}>
                                  #{vIdx + 1}
                                </span>
                                <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>
                                  {val.title || "Untitled Value"}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => handleMoveCoreValue(vIdx, "up")}
                                  disabled={vIdx === 0}
                                  className="btn-secondary"
                                  style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: vIdx === 0 ? 0.4 : 1 }}
                                  title="Move Up"
                                >
                                  <FaArrowUp size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveCoreValue(vIdx, "down")}
                                  disabled={vIdx === (pageContent.values || []).length - 1}
                                  className="btn-secondary"
                                  style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: vIdx === (pageContent.values || []).length - 1 ? 0.4 : 1 }}
                                  title="Move Down"
                                >
                                  <FaArrowDown size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCoreValue(vIdx)}
                                  className="btn-secondary"
                                  style={{ padding: "4px 10px", fontSize: "0.72rem", color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)" }}
                                  title="Delete Value Card"
                                >
                                  <FaTrash size={10} /> Remove
                                </button>
                              </div>
                            </div>

                            <div className="form-row-2col">
                              <div className="form-group" style={{ marginBottom: 12 }}>
                                <label className="form-label">Value Title</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={val.title || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.values || [])];
                                    copy[vIdx] = { ...copy[vIdx], title: e.target.value };
                                    setPageContent({ ...pageContent, values: copy });
                                  }}
                                  placeholder="e.g. Integrity, Accountability..."
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 12 }}>
                                <label className="form-label">Accent Color (Theme / Glow)</label>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <input
                                    type="color"
                                    value={val.accent || "#D2190C"}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.values || [])];
                                      copy[vIdx] = { ...copy[vIdx], accent: e.target.value };
                                      setPageContent({ ...pageContent, values: copy });
                                    }}
                                    style={{ width: 42, height: 38, border: "none", background: "transparent", cursor: "pointer", borderRadius: 6 }}
                                  />
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ flex: 1 }}
                                    value={val.accent || "#D2190C"}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.values || [])];
                                      copy[vIdx] = { ...copy[vIdx], accent: e.target.value };
                                      setPageContent({ ...pageContent, values: copy });
                                    }}
                                    placeholder="#D2190C"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="form-row-2col">
                              <div className="form-group" style={{ marginBottom: 12 }}>
                                <label className="form-label">Icon</label>
                                <select
                                  className="form-input"
                                  value={val.icon || "FaShieldAlt"}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.values || [])];
                                    copy[vIdx] = { ...copy[vIdx], icon: e.target.value };
                                    setPageContent({ ...pageContent, values: copy });
                                  }}
                                  style={{ background: "#0d1017", color: "#fff" }}
                                >
                                  {CORE_VALUE_ICONS.map((ic) => (
                                    <option key={ic.id} value={ic.id}>
                                      {ic.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="form-group" style={{ marginBottom: 12 }}>
                                <label className="form-label">Quote / Motto</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={val.quote || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.values || [])];
                                    copy[vIdx] = { ...copy[vIdx], quote: e.target.value };
                                    setPageContent({ ...pageContent, values: copy });
                                  }}
                                  placeholder="e.g. We choose our thoughts and actions based on values..."
                                />
                              </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 12 }}>
                              <label className="form-label">Full Description</label>
                              <textarea
                                rows={2}
                                className="form-textarea"
                                value={val.desc || ""}
                                onChange={(e) => {
                                  const copy = [...(pageContent.values || [])];
                                  copy[vIdx] = { ...copy[vIdx], desc: e.target.value };
                                  setPageContent({ ...pageContent, values: copy });
                                }}
                                placeholder="Detailed narrative on how this value is applied..."
                              />
                            </div>

                            {/* Card Image Upload (Optional) */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label className="form-label">Card Image (Optional)</label>
                              <div className="adm-upload-group" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ flex: 1, minWidth: 0, fontSize: "0.78rem" }}
                                  value={val.image || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.values || [])];
                                    copy[vIdx] = { ...copy[vIdx], image: e.target.value };
                                    setPageContent({ ...pageContent, values: copy });
                                  }}
                                  placeholder="Image URL or upload..."
                                />
                                <label
                                  className="btn-secondary"
                                  style={{
                                    cursor: uploadingField === `value-${vIdx}` ? "wait" : "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 12px",
                                    fontSize: "0.75rem"
                                  }}
                                >
                                  <FaCloudUploadAlt /> {uploadingField === `value-${vIdx}` ? "Uploading..." : "Upload"}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    disabled={uploadingField === `value-${vIdx}`}
                                    onChange={(e) => handleValueImageUpload(e, vIdx)}
                                  />
                                </label>
                                {val.image && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveValueImage(vIdx)}
                                    className="btn-secondary"
                                    style={{ padding: "8px 12px", fontSize: "0.75rem", color: "#ff7675" }}
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                )}
                              </div>
                              {val.image && (
                                <div className="adm-img-preview-box" style={{ marginTop: 8 }}>
                                  <img
                                    src={val.image}
                                    alt={val.title}
                                    className="adm-preview-thumb"
                                    style={{ height: 42, width: 64 }}
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  />
                                  <div className="adm-preview-info">
                                    <div className="adm-preview-title">{val.title || "Value Card Photo"}</div>
                                    <div className="adm-preview-path" title={val.image}>
                                      {val.image.startsWith("data:") ? "Immediate Preview (Uploaded Data URL)" : val.image}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveValueImage(vIdx)}
                                    className="adm-preview-remove"
                                    title="Remove photo"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* VALUES MANIFESTO SECTION */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20 }}>
                      <div style={{ color: "#F5A000", fontWeight: 700, fontSize: "1rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaAward size={16} /> Values Manifesto Section
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Manifesto Small Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.manifesto_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, manifesto_badge: e.target.value })}
                            placeholder="Our Manifesto"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Manifesto Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.manifesto_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, manifesto_title: e.target.value })}
                            placeholder="Values in Action"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Manifesto Description Narrative</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.manifesto_desc || ""}
                          onChange={(e) => setPageContent({ ...pageContent, manifesto_desc: e.target.value })}
                          placeholder="These seven values are not just words on a page — they are lived every day in the field..."
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Manifesto Highlight Tags / Pills (Comma-Separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formatTagsToString(pageContent.manifesto_tags)}
                          onChange={(e) => {
                            const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                            setPageContent({ ...pageContent, manifesto_tags: tags });
                          }}
                          placeholder="Integrity, Accountability, Transparency, Gender Justice, Professionalism, Excellence, Empathy"
                        />
                        <div style={{ fontSize: "0.74rem", color: "#8892a4", marginTop: 6 }}>
                          Leave blank to automatically display the titles of your Core Values cards above as tags.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ORG PROFILE */}
                {activeTab === "organizational-profile" && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1e2436" }}>
                    
                    {/* SECTION 03: HERO & BANNER */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#003190", fontWeight: 700, fontSize: "1rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaLandmark size={16} /> Section 03: Hero &amp; Banner
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Hero Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageBadge}
                            onChange={(e) => setPageBadge(e.target.value)}
                            placeholder="Section 03"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Page Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                            placeholder="Organizational Profile"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Page Subtitle</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageSubtitle}
                          onChange={(e) => setPageSubtitle(e.target.value)}
                          placeholder="Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention since 2004."
                        />
                      </div>

                      {/* Optional Banner Image Upload */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Hero Banner Image (Optional)</label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            value={pageBanner || ""}
                            onChange={(e) => setPageBanner(e.target.value)}
                            placeholder="e.g. /uploads/org-profile-banner.jpg or https://..."
                          />
                          <label
                            className="btn-secondary"
                            style={{
                              cursor: uploadingField === "banner_image" ? "wait" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "9px 14px"
                            }}
                          >
                            <FaCloudUploadAlt /> {uploadingField === "banner_image" ? "Uploading..." : "Upload Banner"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "banner_image"}
                              onChange={handleBannerUpload}
                            />
                          </label>
                          {pageBanner && (
                            <button
                              type="button"
                              onClick={() => setPageBanner("")}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Remove banner image"
                            >
                              <FaTrash size={12} /> Clear
                            </button>
                          )}
                        </div>
                        {pageBanner && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageBanner}
                              alt="Banner preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Organizational Profile Banner Preview</div>
                              <div className="adm-preview-path" title={pageBanner}>
                                {pageBanner.startsWith("data:") ? "Immediate Data URL Preview" : pageBanner}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPageBanner("");
                                setSaveNotice("Banner removed. Click 'Save' to persist.");
                              }}
                              className="adm-preview-remove"
                              title="Remove banner"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TOP INFO CARDS MANAGER */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <FaCalendar size={16} />
                            <span>Key Information Cards</span>
                            <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {(pageContent.info_cards || []).length} cards
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            Primary 4 highlight metric cards displayed beneath the hero section on /organizational-profile.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddInfoCard}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={11} /> Add Info Card
                        </button>
                      </div>

                      {(pageContent.info_cards || []).length === 0 && (
                        <div style={{ textAlign: "center", padding: 30, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 10 }}>
                          No info cards configured. Click "Add Info Card" to add one.
                        </div>
                      )}

                      <div className="adm-info-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                        {(pageContent.info_cards || []).map((card, cIdx) => {
                          const cardColor = card.color || "#003190";
                          return (
                            <div
                              key={cIdx}
                              className="adm-info-card-item"
                              style={{
                                background: "#080b11",
                                border: `1px solid ${cardColor}40`,
                                borderTop: `4px solid ${cardColor}`,
                                borderRadius: 12,
                                padding: 14,
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                boxSizing: "border-box"
                              }}
                            >
                              <div className="adm-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                <span className="adm-item-header-title" style={{ fontSize: "0.78rem", fontWeight: 800, color: cardColor }}>
                                  Card #{cIdx + 1}
                                </span>
                                <div className="adm-item-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteInfoCard(cIdx)}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#ff7675" }}
                                    title="Delete Card"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                              </div>

                              <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Title / Label</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={card.title || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.info_cards || [])];
                                    copy[cIdx] = { ...copy[cIdx], title: e.target.value };
                                    setPageContent({ ...pageContent, info_cards: copy });
                                  }}
                                  placeholder="e.g. Organization Name, Established..."
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Primary Value</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={card.value || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.info_cards || [])];
                                    copy[cIdx] = { ...copy[cIdx], value: e.target.value };
                                    setPageContent({ ...pageContent, info_cards: copy });
                                  }}
                                  placeholder="e.g. 2004, YL Jayaraj..."
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Subtitle / Subtext (Optional)</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={card.subtitle || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.info_cards || [])];
                                    copy[cIdx] = { ...copy[cIdx], subtitle: e.target.value };
                                    setPageContent({ ...pageContent, info_cards: copy });
                                  }}
                                  placeholder="e.g. Reg. No. 307/2004..."
                                />
                              </div>

                              <div className="form-row-2col">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label">Icon</label>
                                  <select
                                    className="form-input"
                                    value={card.icon || "FaLandmark"}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.info_cards || [])];
                                      copy[cIdx] = { ...copy[cIdx], icon: e.target.value };
                                      setPageContent({ ...pageContent, info_cards: copy });
                                    }}
                                    style={{ background: "#0d1017", color: "#fff" }}
                                  >
                                    {ORG_PROFILE_ICONS.map((ic) => (
                                      <option key={ic.id} value={ic.id}>
                                        {ic.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label">Accent Color</label>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <input
                                      type="color"
                                      value={card.color || "#003190"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.info_cards || [])];
                                        copy[cIdx] = { ...copy[cIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, info_cards: copy });
                                      }}
                                      style={{ width: 36, height: 34, border: "none", background: "transparent", cursor: "pointer", borderRadius: 4 }}
                                    />
                                    <input
                                      type="text"
                                      className="form-input"
                                      style={{ flex: 1, fontSize: "0.78rem" }}
                                      value={card.color || "#003190"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.info_cards || [])];
                                        copy[cIdx] = { ...copy[cIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, info_cards: copy });
                                      }}
                                      placeholder="#003190"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>


                    {/* ABOUT / NARRATIVE & FIELD OPERATIONS */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#2ecc71", fontWeight: 700, fontSize: "1rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaUsers size={16} /> Who We Are &amp; Field Operations
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.about_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, about_badge: e.target.value })}
                            placeholder="Who We Are"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.about_heading || ""}
                            onChange={(e) => setPageContent({ ...pageContent, about_heading: e.target.value })}
                            placeholder="Association for Land and Livelihood..."
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Narrative Paragraph 1 (Genesis &amp; Leadership)</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.about_p1 || ""}
                          onChange={(e) => setPageContent({ ...pageContent, about_p1: e.target.value })}
                          placeholder="ALERT, established in 2004 under the Societies Registration Act..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Narrative Paragraph 2 (Statutory Mandate &amp; Reach)</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.about_p2 || ""}
                          onChange={(e) => setPageContent({ ...pageContent, about_p2: e.target.value })}
                          placeholder="Our mandate encompasses affirmative legislation enforcement..."
                        />
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span><FaFilePdf style={{ marginRight: 6, color: "#D2190C" }} /> Official Profile PDF Link / Path</span>
                            <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Upload PDF file or enter URL/path</span>
                          </label>
                          <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ flex: 1, minWidth: 0 }}
                              value={pageContent.profile_pdf || ""}
                              onChange={(e) => setPageContent({ ...pageContent, profile_pdf: e.target.value })}
                              placeholder="/uploads/Organizational-Profile-of-ALERT.pdf"
                            />
                            <label
                              className="btn-primary"
                              style={{
                                cursor: uploadingField === "profile_pdf" ? "not-allowed" : "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                margin: 0,
                                background: "#D2190C",
                                opacity: uploadingField === "profile_pdf" ? 0.7 : 1
                              }}
                            >
                              <FaCloudUploadAlt /> {uploadingField === "profile_pdf" ? "Uploading..." : "Upload PDF"}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: "none" }}
                                disabled={uploadingField === "profile_pdf"}
                                onChange={(e) => handlePdfUpload(e, "profile_pdf")}
                              />
                            </label>
                            {pageContent.profile_pdf && (
                              <button
                                type="button"
                                onClick={() => setPageContent({ ...pageContent, profile_pdf: "" })}
                                className="btn-secondary"
                                style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                                title="Clear PDF"
                              >
                                <FaTrash size={12} /> Clear
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Profile PDF Button Label</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.profile_pdf_label || ""}
                            onChange={(e) => setPageContent({ ...pageContent, profile_pdf_label: e.target.value })}
                            placeholder="Download Official Profile PDF"
                          />
                        </div>
                      </div>

                      {/* Field Operations Image Upload */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Field Operations Photo &amp; Caption</label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ flex: 1, minWidth: 0 }}
                            value={pageContent.field_image || ""}
                            onChange={(e) => setPageContent({ ...pageContent, field_image: e.target.value })}
                            placeholder="/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg"
                          />
                          <label
                            className="btn-secondary"
                            style={{
                              cursor: uploadingField === "field_image" ? "wait" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "9px 14px"
                            }}
                          >
                            <FaCloudUploadAlt /> {uploadingField === "field_image" ? "Uploading..." : "Upload Photo"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "field_image"}
                              onChange={handleFieldImageUpload}
                            />
                          </label>
                          {pageContent.field_image && (
                            <button
                              type="button"
                              onClick={handleRemoveFieldImage}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Remove Photo"
                            >
                              <FaTrash size={12} /> Clear
                            </button>
                          )}
                        </div>

                        {pageContent.field_image && (
                          <div className="adm-img-preview-box" style={{ marginBottom: 12 }}>
                            <img
                              src={pageContent.field_image}
                              alt="Field Operations Preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Field Operations Photo Preview</div>
                              <div className="adm-preview-path" title={pageContent.field_image}>
                                {pageContent.field_image.startsWith("data:") ? "Immediate Data URL Preview" : pageContent.field_image}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveFieldImage}
                              className="adm-preview-remove"
                              title="Remove photo"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}

                        <div className="form-row-2col">
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Image Tag / Ribbon</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.field_tag || ""}
                              onChange={(e) => setPageContent({ ...pageContent, field_tag: e.target.value })}
                              placeholder="ALERT Field Operations"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Image Caption</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.field_caption || ""}
                              onChange={(e) => setPageContent({ ...pageContent, field_caption: e.target.value })}
                              placeholder="Empowering Adivasi Communities in Andhra Pradesh"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LEGAL ACCREDITATIONS & GOVERNANCE SECTION */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#f39c12", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <FaShieldAlt size={16} />
                            <span>Legal Accreditations &amp; Governance Cards</span>
                            <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(243, 156, 18, 0.15)", color: "#f39c12", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {(pageContent.accreditations_cards || []).length} cards
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            Displayed in the bottom grid on /organizational-profile.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAccreditationCard}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#f39c12", borderColor: "rgba(243, 156, 18, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={11} /> Add Accreditation Card
                        </button>
                      </div>

                      <div className="form-row-2col" style={{ marginBottom: 14 }}>
                        <div className="form-group">
                          <label className="form-label">Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.accreditations_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, accreditations_badge: e.target.value })}
                            placeholder="Statutory Mandate"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Section Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.accreditations_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, accreditations_title: e.target.value })}
                            placeholder="Legal Accreditations & Governance"
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="form-label">Section Subtitle Narrative</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageContent.accreditations_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, accreditations_subtitle: e.target.value })}
                          placeholder="ALERT is governed by formal statutes and holds key registrations..."
                        />
                      </div>

                      <div className="adm-info-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                        {(pageContent.accreditations_cards || []).map((card, aIdx) => {
                          const cardColor = card.color || "#003190";
                          return (
                            <div
                              key={aIdx}
                              className="adm-info-card-item"
                              style={{
                                background: "#080b11",
                                border: `1px solid ${cardColor}40`,
                                borderLeft: `4px solid ${cardColor}`,
                                borderRadius: 12,
                                padding: 14,
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                boxSizing: "border-box"
                              }}
                            >
                              <div className="adm-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                <span className="adm-item-header-title" style={{ fontSize: "0.8rem", fontWeight: 800, color: cardColor }}>
                                  Accreditation #{aIdx + 1}
                                </span>
                                <div className="adm-item-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccreditationCard(aIdx)}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#ff7675" }}
                                    title="Delete Card"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                              </div>

                              <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Title / Certification</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={card.title || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.accreditations_cards || [])];
                                    copy[aIdx] = { ...copy[aIdx], title: e.target.value };
                                    setPageContent({ ...pageContent, accreditations_cards: copy });
                                  }}
                                  placeholder="e.g. 12A Registration, 80G Certification..."
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Description</label>
                                <textarea
                                  rows={2}
                                  className="form-textarea"
                                  value={card.desc || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.accreditations_cards || [])];
                                    copy[aIdx] = { ...copy[aIdx], desc: e.target.value };
                                    setPageContent({ ...pageContent, accreditations_cards: copy });
                                  }}
                                  placeholder="e.g. Income Tax registration for charitable activities under Section 12A."
                                />
                              </div>

                              <div className="form-row-2col">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label">Icon</label>
                                  <select
                                    className="form-input"
                                    value={card.icon || "FaAward"}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.accreditations_cards || [])];
                                      copy[aIdx] = { ...copy[aIdx], icon: e.target.value };
                                      setPageContent({ ...pageContent, accreditations_cards: copy });
                                    }}
                                    style={{ background: "#0d1017", color: "#fff" }}
                                  >
                                    {ORG_PROFILE_ICONS.map((ic) => (
                                      <option key={ic.id} value={ic.id}>
                                        {ic.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label">Color</label>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <input
                                      type="color"
                                      value={card.color || "#003190"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.accreditations_cards || [])];
                                        copy[aIdx] = { ...copy[aIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, accreditations_cards: copy });
                                      }}
                                      style={{ width: 36, height: 34, border: "none", background: "transparent", cursor: "pointer", borderRadius: 4 }}
                                    />
                                    <input
                                      type="text"
                                      className="form-input"
                                      style={{ flex: 1, fontSize: "0.78rem" }}
                                      value={card.color || "#003190"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.accreditations_cards || [])];
                                        copy[aIdx] = { ...copy[aIdx], color: e.target.value };
                                        setPageContent({ ...pageContent, accreditations_cards: copy });
                                      }}
                                      placeholder="#003190"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>


                    {/* STATUTORY REGISTRATIONS & OFFICE CONTACTS */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaFileContract size={16} style={{ color: "#3498db" }} /> Statutory Registrations &amp; Office Contacts
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Registration Number</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.reg_no || ""}
                            onChange={(e) => setPageContent({ ...pageContent, reg_no: e.target.value })}
                            placeholder="307/2004"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">PAN Card Number</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.pan || ""}
                            onChange={(e) => setPageContent({ ...pageContent, pan: e.target.value })}
                            placeholder="AAATA4707G"
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">FCRA Registration Status</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.fcra_status || ""}
                            onChange={(e) => setPageContent({ ...pageContent, fcra_status: e.target.value })}
                            placeholder="Registered with Ministry of Home Affairs, Govt of India"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">12A &amp; 80G Tax Exemptions</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.tax_exempt || ""}
                            onChange={(e) => setPageContent({ ...pageContent, tax_exempt: e.target.value })}
                            placeholder="12A & 80G Approved under Indian Income Tax Act"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Official Registered Address</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.registered_office || ""}
                          onChange={(e) => setPageContent({ ...pageContent, registered_office: e.target.value })}
                          placeholder="D.No. 40-27-84, Sriramachandra Nagar, Vijayawada - 520010, Andhra Pradesh, India"
                        />
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Official Phone</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.phone || ""}
                            onChange={(e) => setPageContent({ ...pageContent, phone: e.target.value })}
                            placeholder="+91 866 247 2484"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Official Email</label>
                          <input
                            type="email"
                            className="form-input"
                            value={pageContent.email || ""}
                            onChange={(e) => setPageContent({ ...pageContent, email: e.target.value })}
                            placeholder="alertngo.vja@gmail.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. ORGANOGRAM */}
                {activeTab === "organogram" && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e2436" }}>
                    {/* SECTION 04: HERO & BANNER */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(0, 49, 144, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#38bdf8", fontWeight: 700, fontSize: "1rem" }}>
                          <FaSitemap size={18} /> Section 04: Organogram Hero &amp; Banner
                        </div>
                        <span style={{ fontSize: "0.72rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Hero &amp; Banner
                        </span>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Hero Banner Background Image (Optional)</label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            value={pageBanner || ""}
                            onChange={(e) => setPageBanner(e.target.value)}
                            placeholder="e.g. /uploads/organogram-banner.jpg or https://..."
                            style={{ flex: 1, minWidth: 0 }}
                          />
                          <label
                            className="btn-secondary"
                            style={{ cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaCloudUploadAlt size={14} />
                            {uploadingField === "banner_image" ? "Uploading..." : "Upload Banner"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "banner_image"}
                              onChange={handleBannerUpload}
                            />
                          </label>
                          {pageBanner && (
                            <button
                              type="button"
                              onClick={handleRemoveBanner}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Remove banner image"
                            >
                              <FaTrash size={12} /> Clear
                            </button>
                          )}
                        </div>
                        {pageBanner && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageBanner}
                              alt="Banner preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Organogram Banner Preview</div>
                              <div className="adm-preview-path" title={pageBanner}>
                                {pageBanner.startsWith("data:") ? "Immediate Data URL Preview" : pageBanner}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveBanner}
                              className="adm-preview-remove"
                              title="Remove banner"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ORGANOGRAM STRUCTURE CHART IMAGE & DIAGRAM */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#F5A000", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                            <FaSitemap size={16} /> Organogram Chart Image &amp; Diagram
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            The primary hierarchy diagram image displayed on /organogram with click-to-zoom lightbox capability.
                          </div>
                        </div>
                        {pageContent.chart_image && (
                          <span style={{ fontSize: "0.72rem", background: "rgba(245, 160, 0, 0.15)", color: "#F5A000", padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>
                            Diagram Active
                          </span>
                        )}
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Chart Card Badge / Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.chart_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, chart_badge: e.target.value })}
                            placeholder="e.g. ALERT Governance Structure"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Chart Caption / Description</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.chart_desc || ""}
                            onChange={(e) => setPageContent({ ...pageContent, chart_desc: e.target.value })}
                            placeholder="e.g. Click to zoom the full organizational chart..."
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Chart Image File / URL</label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.chart_image || ""}
                            onChange={(e) => setPageContent({ ...pageContent, chart_image: e.target.value })}
                            placeholder="e.g. /uploads/Alert-Organogram.jpg or https://..."
                            style={{ flex: 1, minWidth: 0 }}
                          />
                          <label
                            className="btn-secondary"
                            style={{ cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaCloudUploadAlt size={14} />
                            {uploadingField === "organogram_chart" ? "Uploading..." : "Upload Chart Image"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "organogram_chart"}
                              onChange={handleOrganogramChartUpload}
                            />
                          </label>
                          {pageContent.chart_image && (
                            <button
                              type="button"
                              onClick={handleRemoveOrganogramChart}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Remove chart image"
                            >
                              <FaTrash size={12} /> Clear
                            </button>
                          )}
                        </div>

                        {pageContent.chart_image && (
                          <div className="adm-img-preview-box" style={{ marginTop: 14 }}>
                            <img
                              src={pageContent.chart_image}
                              alt="Organogram Chart Thumbnail"
                              className="adm-preview-thumb"
                              style={{ width: 68, height: 46, objectFit: "contain", background: "#fff", padding: 2 }}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">
                                {pageContent.chart_badge || "ALERT Governance Structure"}
                              </div>
                              <div className="adm-preview-path" title={pageContent.chart_image}>
                                {pageContent.chart_image}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveOrganogramChart}
                              className="adm-preview-remove"
                              title="Remove chart"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FIVE-TIER GOVERNANCE LEVELS (HIERARCHY MANAGER) */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <FaAward size={16} />
                            <span>Governance Hierarchy Levels</span>
                            <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {(pageContent.levels || []).length} levels
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            Configure the democratic governance tiers from the sovereign General Body down to grassroots Gram Sabhas.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddOrganogramLevel}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#22c55e", borderColor: "rgba(34, 197, 94, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={11} /> Add Governance Level
                        </button>
                      </div>

                      {/* Section metadata */}
                      <div className="form-row-2col" style={{ marginBottom: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Levels Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.levels_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, levels_badge: e.target.value })}
                            placeholder="e.g. Governance Levels"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Levels Section Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.levels_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, levels_title: e.target.value })}
                            placeholder="e.g. Five-Tier Governance Structure"
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 18 }}>
                        <label className="form-label">Levels Section Subtitle</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.levels_subtitle || ""}
                          onChange={(e) => setPageContent({ ...pageContent, levels_subtitle: e.target.value })}
                          placeholder="e.g. ALERT follows a democratic, bottom-up governance model..."
                        />
                      </div>

                      {(pageContent.levels || []).length === 0 && (
                        <div style={{ textAlign: "center", padding: 30, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 10 }}>
                          No governance levels added. Click "Add Governance Level" to create one.
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {(pageContent.levels || []).map((lvl, lIdx) => {
                          const lvlAccent = lvl.accent || "#003190";
                          return (
                            <div
                              key={lvl.level || lIdx}
                              style={{
                                background: "#080b11",
                                border: `1px solid ${lvlAccent}40`,
                                borderLeft: `4px solid ${lvlAccent}`,
                                borderRadius: 12,
                                padding: 16
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: lvlAccent, background: `${lvlAccent}15`, padding: "2px 8px", borderRadius: 4 }}>
                                    #{lIdx + 1}
                                  </span>
                                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>
                                    {lvl.title || `Level ${lIdx + 1}`}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOrganogramLevel(lIdx, -1)}
                                    disabled={lIdx === 0}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: lIdx === 0 ? 0.4 : 1 }}
                                    title="Move Level Up"
                                  >
                                    <FaArrowUp size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOrganogramLevel(lIdx, 1)}
                                    disabled={lIdx === (pageContent.levels || []).length - 1}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: lIdx === (pageContent.levels || []).length - 1 ? 0.4 : 1 }}
                                    title="Move Level Down"
                                  >
                                    <FaArrowDown size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrganogramLevel(lIdx)}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#ff7675" }}
                                    title="Delete Level"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                              </div>

                              <div className="form-row-2col">
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                  <label className="form-label">Level Tag / Badge</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={lvl.level || ""}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.levels || [])];
                                      copy[lIdx].level = e.target.value;
                                      setPageContent({ ...pageContent, levels: copy });
                                    }}
                                    placeholder="e.g. Level 01"
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                  <label className="form-label">Level Title</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={lvl.title || ""}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.levels || [])];
                                      copy[lIdx].title = e.target.value;
                                      setPageContent({ ...pageContent, levels: copy });
                                    }}
                                    placeholder="e.g. General Body"
                                  />
                                </div>
                              </div>

                              <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Description / Responsibilities / Scope</label>
                                <textarea
                                  rows={2}
                                  className="form-textarea"
                                  value={lvl.desc || ""}
                                  onChange={(e) => {
                                    const copy = [...(pageContent.levels || [])];
                                    copy[lIdx].desc = e.target.value;
                                    setPageContent({ ...pageContent, levels: copy });
                                  }}
                                  placeholder="Describe the mandate, composition, and reporting responsibilities of this tier..."
                                />
                              </div>

                              <div className="form-row-2col" style={{ marginBottom: 0 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label">Tier Icon</label>
                                  <select
                                    className="form-input"
                                    value={lvl.icon || "FaSitemap"}
                                    onChange={(e) => {
                                      const copy = [...(pageContent.levels || [])];
                                      copy[lIdx].icon = e.target.value;
                                      setPageContent({ ...pageContent, levels: copy });
                                    }}
                                  >
                                    {ORGANOGRAM_ICONS.map((ic) => (
                                      <option key={ic.id} value={ic.id}>
                                        {ic.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label className="form-label">Accent Theme Color</label>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input
                                      type="color"
                                      value={lvl.accent || "#003190"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.levels || [])];
                                        copy[lIdx].accent = e.target.value;
                                        setPageContent({ ...pageContent, levels: copy });
                                      }}
                                      style={{ width: 38, height: 38, border: "none", borderRadius: 6, background: "none", cursor: "pointer" }}
                                    />
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={lvl.accent || "#003190"}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.levels || [])];
                                        copy[lIdx].accent = e.target.value;
                                        setPageContent({ ...pageContent, levels: copy });
                                      }}
                                      placeholder="#003190"
                                      style={{ flex: 1 }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* OFFICIAL GOVERNANCE DOCUMENT (PDF) */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ color: "#ec4899", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                          <FaFilePdf size={16} /> Official Governance Document (PDF)
                        </div>
                        <span style={{ fontSize: "0.72rem", background: "rgba(236, 72, 153, 0.15)", color: "#ec4899", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Document Download
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Download Button Label</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.pdf_btn_label || ""}
                            onChange={(e) => setPageContent({ ...pageContent, pdf_btn_label: e.target.value })}
                            placeholder="e.g. Download Governance Document PDF"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Document Title (in Viewer Modal)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.pdf_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, pdf_title: e.target.value })}
                            placeholder="e.g. Organizational Profile of ALERT"
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Document Meta / Badge Text</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.pdf_meta || ""}
                            onChange={(e) => setPageContent({ ...pageContent, pdf_meta: e.target.value })}
                            placeholder="e.g. Official Society Record • Governance Document"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">PDF File Path / URL</label>
                          <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.pdf_file || ""}
                              onChange={(e) => setPageContent({ ...pageContent, pdf_file: e.target.value })}
                              placeholder="e.g. /uploads/Organizational-Profile-of-ALERT.pdf"
                              style={{ flex: 1, minWidth: 0 }}
                            />
                            <label
                              className="btn-secondary"
                              style={{ cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                            >
                              <FaCloudUploadAlt size={14} />
                              {uploadingField === "organogram_pdf" ? "Uploading..." : "Upload PDF"}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: "none" }}
                                disabled={uploadingField === "organogram_pdf"}
                                onChange={handleOrganogramPdfUpload}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ALERT POLICIES */}
                {activeTab === "alert-policies" && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e2436" }}>
                    {/* SECTION 05: HERO & BANNER */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(210, 25, 12, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#D2190C", fontWeight: 700, fontSize: "1rem" }}>
                          <FaFileContract size={18} /> Section 05: ALERT Policies Hero &amp; Banner
                        </div>
                        <span style={{ fontSize: "0.72rem", background: "rgba(210, 25, 12, 0.15)", color: "#ff7675", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Hero &amp; Banner
                        </span>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Hero Banner Background Image (Optional)</label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            value={pageBanner || ""}
                            onChange={(e) => setPageBanner(e.target.value)}
                            placeholder="e.g. /uploads/policies-banner.jpg or https://..."
                            style={{ flex: 1, minWidth: 0 }}
                          />
                          <label
                            className="btn-secondary"
                            style={{ cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaCloudUploadAlt size={14} />
                            {uploadingField === "banner_image" ? "Uploading..." : "Upload Banner"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "banner_image"}
                              onChange={handleBannerUpload}
                            />
                          </label>
                          {pageBanner && (
                            <button
                              type="button"
                              onClick={handleRemoveBanner}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Remove banner image"
                            >
                              <FaTrash size={12} /> Clear
                            </button>
                          )}
                        </div>
                        {pageBanner && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageBanner}
                              alt="Banner preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Alert Policies Banner Preview</div>
                              <div className="adm-preview-path" title={pageBanner}>
                                {pageBanner.startsWith("data:") ? "Immediate Data URL Preview" : pageBanner}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveBanner}
                              className="adm-preview-remove"
                              title="Remove banner"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION: INTERACTIVE COMPLIANCE PORTAL */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ color: "#10b981", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                          <FaShieldAlt size={16} /> Interactive Compliance Portal &amp; Statutory Certifications
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                            {pageContent.portal_status_badge || "100% Ratified & Audited"}
                          </span>
                          <button
                            type="button"
                            onClick={handleResetCompliancePortal}
                            className="btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "0.72rem", color: "#cbd5e1" }}
                            title="Reset portal texts and 4 metrics to default"
                          >
                            <FaUndo size={10} /> Reset Portal
                          </button>
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Portal Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.portal_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, portal_badge: e.target.value })}
                            placeholder="e.g. Interactive Compliance Portal"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Certification Seal / Subtitle</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.portal_cert || ""}
                            onChange={(e) => setPageContent({ ...pageContent, portal_cert: e.target.value })}
                            placeholder="e.g. Certified by ALERT Governing Body"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Portal Main Heading</label>
                        <input
                          type="text"
                          className="form-input"
                          value={pageContent.portal_title || ""}
                          onChange={(e) => setPageContent({ ...pageContent, portal_title: e.target.value })}
                          placeholder="e.g. The 35 Institutional Governance Policies"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Portal Narrative Description</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={pageContent.portal_desc || ""}
                          onChange={(e) => setPageContent({ ...pageContent, portal_desc: e.target.value })}
                          placeholder="ALERT operations are strictly governed by 35 formalized statutory charters..."
                        />
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Status Badge Text</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.portal_status_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, portal_status_badge: e.target.value })}
                            placeholder="e.g. 100% Ratified & Audited"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Status Subtitle / Footnote</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.portal_status_sub || ""}
                            onChange={(e) => setPageContent({ ...pageContent, portal_status_sub: e.target.value })}
                            placeholder="e.g. Active Statutory Compliance"
                          />
                        </div>
                      </div>

                      {/* 4 STATUTORY COMPLIANCE METRICS */}
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e2436" }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <FaCheckCircle size={13} color="#10b981" /> 4 Statutory Compliance Metrics
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                          {(Array.isArray(pageContent.portal_metrics) && pageContent.portal_metrics.length > 0
                            ? pageContent.portal_metrics
                            : DEFAULT_COMPLIANCE_PORTAL.portal_metrics
                          ).map((metric, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                background: "#080b11",
                                border: `1px solid ${metric.color || "#38bdf8"}40`,
                                borderTop: `3px solid ${metric.color || "#38bdf8"}`,
                                borderRadius: 8,
                                padding: 12
                              }}
                            >
                              <div style={{ fontSize: "0.72rem", color: "#8892a4", marginBottom: 6, fontWeight: 700 }}>
                                Metric #{mIdx + 1}
                              </div>
                              <div className="form-group" style={{ marginBottom: 6 }}>
                                <label className="form-label" style={{ fontSize: "0.68rem" }}>Label</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={metric.label || ""}
                                  onChange={(e) => {
                                    const metricsCopy = [
                                      ...(Array.isArray(pageContent.portal_metrics) && pageContent.portal_metrics.length > 0
                                        ? pageContent.portal_metrics
                                        : DEFAULT_COMPLIANCE_PORTAL.portal_metrics)
                                    ];
                                    metricsCopy[mIdx] = { ...metricsCopy[mIdx], label: e.target.value };
                                    setPageContent({ ...pageContent, portal_metrics: metricsCopy });
                                  }}
                                  placeholder="e.g. Active Policies"
                                  style={{ height: 32, fontSize: "0.78rem" }}
                                />
                              </div>
                              <div className="form-group" style={{ marginBottom: 6 }}>
                                <label className="form-label" style={{ fontSize: "0.68rem" }}>Value</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={metric.val || ""}
                                  onChange={(e) => {
                                    const metricsCopy = [
                                      ...(Array.isArray(pageContent.portal_metrics) && pageContent.portal_metrics.length > 0
                                        ? pageContent.portal_metrics
                                        : DEFAULT_COMPLIANCE_PORTAL.portal_metrics)
                                    ];
                                    metricsCopy[mIdx] = { ...metricsCopy[mIdx], val: e.target.value };
                                    setPageContent({ ...pageContent, portal_metrics: metricsCopy });
                                  }}
                                  placeholder="e.g. 35 / 35"
                                  style={{ height: 32, fontSize: "0.78rem", fontWeight: 700 }}
                                />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: "0.68rem" }}>Accent Color</label>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                  <input
                                    type="color"
                                    value={metric.color || "#38bdf8"}
                                    onChange={(e) => {
                                      const metricsCopy = [
                                        ...(Array.isArray(pageContent.portal_metrics) && pageContent.portal_metrics.length > 0
                                          ? pageContent.portal_metrics
                                          : DEFAULT_COMPLIANCE_PORTAL.portal_metrics)
                                      ];
                                      metricsCopy[mIdx] = { ...metricsCopy[mIdx], color: e.target.value };
                                      setPageContent({ ...pageContent, portal_metrics: metricsCopy });
                                    }}
                                    style={{ width: 28, height: 28, border: "none", borderRadius: 4, background: "none", cursor: "pointer" }}
                                  />
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={metric.color || "#38bdf8"}
                                    onChange={(e) => {
                                      const metricsCopy = [
                                        ...(Array.isArray(pageContent.portal_metrics) && pageContent.portal_metrics.length > 0
                                          ? pageContent.portal_metrics
                                          : DEFAULT_COMPLIANCE_PORTAL.portal_metrics)
                                      ];
                                      metricsCopy[mIdx] = { ...metricsCopy[mIdx], color: e.target.value };
                                      setPageContent({ ...pageContent, portal_metrics: metricsCopy });
                                    }}
                                    placeholder="#10b981"
                                    style={{ height: 32, fontSize: "0.74rem", flex: 1 }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 35 INSTITUTIONAL POLICIES MANAGER */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <datalist id="adm-policy-category-suggestions">
                        <option value="Financial & Operational" />
                        <option value="Protection & Rights" />
                        <option value="Governance & Ethics" />
                        <option value="Community & Field" />
                      </datalist>
                      <datalist id="adm-policy-badge-suggestions">
                        <option value="Statutory" />
                        <option value="Human Rights" />
                        <option value="Institutional" />
                        <option value="Integrity" />
                        <option value="Child Rights" />
                        <option value="Mandatory" />
                        <option value="Ecological" />
                        <option value="Field Safety" />
                        <option value="Zero Tolerance" />
                        <option value="Whistleblower" />
                        <option value="Operational" />
                        <option value="Cooperative" />
                        <option value="Legal Aid" />
                        <option value="Emergency" />
                        <option value="Justice" />
                        <option value="Democracy" />
                        <option value="Transparency" />
                        <option value="Public Record" />
                        <option value="Accountability" />
                        <option value="Asset Control" />
                        <option value="MEL Framework" />
                      </datalist>

                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <FaFileContract size={16} />
                            <span>Institutional Governance Policies</span>
                            <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {(pageContent.policies || []).length} / 35 Certified Charters
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            Manage, search, reorder, or edit all 35 statutory charters and their dossier principles.
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={handleRestore35Policies}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.08)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                            title="Reset or push all 35 certified statutory policies"
                          >
                            <FaSyncAlt size={11} /> Restore 35 Policies
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const isAnyExpanded = Object.values(expandedPolicies).some(Boolean);
                              if (isAnyExpanded) {
                                handleCollapseAllPolicies();
                              } else {
                                const allIdxs = (pageContent.policies || []).map((_, i) => i);
                                handleExpandAllPolicies(allIdxs);
                              }
                            }}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", color: "#cbd5e1", borderColor: "#2a3148", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaSlidersH size={11} /> {Object.values(expandedPolicies).some(Boolean) ? "Collapse All" : "Expand All"}
                          </button>
                          <button
                            type="button"
                            onClick={handleAddPolicy}
                            className="btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "0.78rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaPlus size={11} /> Add Policy
                          </button>
                        </div>
                      </div>

                      {/* SEARCH & CATEGORY FILTER TOOLBAR */}
                      <div style={{ background: "#080b11", border: "1px solid #1e2436", borderRadius: 10, padding: 12, marginBottom: 16 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                            <FaSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8892a4", fontSize: "0.75rem" }} />
                            <input
                              type="text"
                              className="form-input"
                              value={policySearchQuery}
                              onChange={(e) => setPolicySearchQuery(e.target.value)}
                              placeholder="Search policies by name, #01, category, or statutory act..."
                              style={{ paddingLeft: 28, height: 34, fontSize: "0.82rem" }}
                            />
                            {policySearchQuery && (
                              <button
                                type="button"
                                onClick={() => setPolicySearchQuery("")}
                                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8892a4", cursor: "pointer" }}
                              >
                                <FaTimes size={10} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Category filter pills */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {["all", "Financial & Operational", "Protection & Rights", "Governance & Ethics", "Community & Field"].map((cat) => {
                            const isSelected = policyCategoryFilter === cat;
                            const count = cat === "all"
                              ? (pageContent.policies || []).length
                              : (pageContent.policies || []).filter((p) => p.category === cat).length;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setPolicyCategoryFilter(cat)}
                                style={{
                                  background: isSelected ? "rgba(56, 189, 248, 0.2)" : "#141820",
                                  border: isSelected ? "1px solid #38bdf8" : "1px solid #2a3148",
                                  color: isSelected ? "#38bdf8" : "#8892a4",
                                  padding: "4px 10px",
                                  borderRadius: 6,
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5
                                }}
                              >
                                <span>{cat === "all" ? "All Policies" : cat}</span>
                                <span style={{ fontSize: "0.65rem", background: isSelected ? "#38bdf8" : "rgba(255,255,255,0.1)", color: isSelected ? "#0a0d14" : "#8892a4", padding: "1px 6px", borderRadius: 10, fontWeight: 800 }}>
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* FILTERED POLICIES LIST */}
                      {(() => {
                        const allPols = pageContent.policies || [];
                        const filtered = allPols
                          .map((pol, originalIdx) => ({ pol, originalIdx }))
                          .filter(({ pol, originalIdx }) => {
                            if (policyCategoryFilter !== "all" && pol.category !== policyCategoryFilter) return false;
                            if (policySearchQuery.trim()) {
                              const q = policySearchQuery.toLowerCase();
                              const numStr = String(pol.id !== undefined ? pol.id : originalIdx + 1);
                              const idMatch = numStr.includes(q) || `#${numStr.padStart(2, "0")}`.toLowerCase().includes(q);
                              const titleMatch = (pol.title || "").toLowerCase().includes(q);
                              const descMatch = (pol.desc || pol.scope || "").toLowerCase().includes(q);
                              const catMatch = (pol.category || "").toLowerCase().includes(q);
                              const actMatch = (pol.statutoryBasis || "").toLowerCase().includes(q);
                              const commMatch = (pol.committee || "").toLowerCase().includes(q);
                              const badgeMatch = (pol.badge || "").toLowerCase().includes(q);
                              return idMatch || titleMatch || descMatch || catMatch || actMatch || commMatch || badgeMatch;
                            }
                            return true;
                          });

                        if (allPols.length === 0) {
                          return (
                            <div style={{ textAlign: "center", padding: 30, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 10 }}>
                              No policies found. Click "Restore 35 Policies" or "Add Policy" to populate.
                            </div>
                          );
                        }

                        if (filtered.length === 0) {
                          return (
                            <div style={{ textAlign: "center", padding: 30, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 10 }}>
                              No policies match your search or filter. Try a different keyword or category.
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ fontSize: "0.74rem", color: "#8892a4", marginBottom: 2 }}>
                              Showing {filtered.length} of {allPols.length} policies certified under ALERT Society Registration
                            </div>
                            {filtered.map(({ pol, originalIdx }) => {
                              const polAccent = pol.accent || "#003190";
                              const highlightsArr = Array.isArray(pol.highlights)
                                ? pol.highlights
                                : (typeof pol.highlights === "string" ? pol.highlights.split(",").map((s) => s.trim()).filter(Boolean) : []);
                              const principlesArr = Array.isArray(pol.principles)
                                ? pol.principles
                                : (typeof pol.principles === "string" ? pol.principles.split("\n").map((s) => s.trim()).filter(Boolean) : []);
                              const isPolEditing = Boolean(expandedPolicies[originalIdx]);
                              const numLabel = `#${String(pol.id !== undefined ? pol.id : originalIdx + 1).padStart(2, "0")}`;

                              return (
                                <div
                                  key={pol.id || originalIdx}
                                  style={{
                                    background: "#080b11",
                                    border: isPolEditing ? `2px solid #38bdf8` : `1px solid ${polAccent}40`,
                                    borderLeft: `4px solid ${isPolEditing ? "#38bdf8" : polAccent}`,
                                    borderRadius: 12,
                                    padding: 16,
                                    boxShadow: isPolEditing ? "0 0 16px rgba(56, 189, 248, 0.15)" : "none",
                                    transition: "all 0.2s ease"
                                  }}
                                >
                                  {/* Policy Card Header Summary */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isPolEditing ? 14 : 0, flexWrap: "wrap", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 200 }}>
                                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: polAccent, background: `${polAccent}15`, padding: "2px 8px", borderRadius: 4 }}>
                                        {numLabel}
                                      </span>
                                      <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff" }}>
                                        {pol.title || `Policy ${numLabel}`}
                                      </span>
                                      {pol.category && (
                                        <span style={{ fontSize: "0.68rem", color: polAccent, border: `1px solid ${polAccent}40`, padding: "1px 7px", borderRadius: 12, fontWeight: 700 }}>
                                          {pol.category}
                                        </span>
                                      )}
                                      {pol.badge && (
                                        <span style={{ fontSize: "0.68rem", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                                          {pol.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                      <button
                                        type="button"
                                        onClick={() => togglePolicyExpand(originalIdx)}
                                        className="btn-secondary"
                                        style={{
                                          padding: "3px 8px",
                                          fontSize: "0.68rem",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          color: isPolEditing ? "#10b981" : "#38bdf8",
                                          borderColor: isPolEditing ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)",
                                          background: isPolEditing ? "rgba(16, 185, 129, 0.1)" : "rgba(56, 189, 248, 0.08)",
                                          fontWeight: 700,
                                          cursor: "pointer"
                                        }}
                                        title={isPolEditing ? "Close policy editor" : "Edit policy details"}
                                      >
                                        <FaEdit size={10} /> {isPolEditing ? "Done" : "Edit"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicatePolicy(originalIdx)}
                                        className="btn-secondary"
                                        style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#cbd5e1" }}
                                        title="Duplicate Policy"
                                      >
                                        <FaCopy size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMovePolicy(originalIdx, -1)}
                                        disabled={originalIdx === 0}
                                        className="btn-secondary"
                                        style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: originalIdx === 0 ? 0.4 : 1 }}
                                        title="Move Policy Up"
                                      >
                                        <FaArrowUp size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMovePolicy(originalIdx, 1)}
                                        disabled={originalIdx === (pageContent.policies || []).length - 1}
                                        className="btn-secondary"
                                        style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: originalIdx === (pageContent.policies || []).length - 1 ? 0.4 : 1 }}
                                        title="Move Policy Down"
                                      >
                                        <FaArrowDown size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePolicy(originalIdx)}
                                        className="btn-secondary"
                                        style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#ff7675" }}
                                        title="Delete Policy"
                                      >
                                        <FaTrash size={10} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Policy Brief preview when collapsed */}
                                  {!isPolEditing && (pol.desc || pol.scope) && (
                                    <div style={{ fontSize: "0.76rem", color: "#8892a4", marginTop: 4, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                      {pol.desc || pol.scope}
                                    </div>
                                  )}

                                  {/* Detailed Form Fields when Expanded */}
                                  {isPolEditing && (
                                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e2436" }}>
                                      <div className="form-row-2col">
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Policy Title</label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={pol.title || ""}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].title = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="e.g. Common Cost Policy"
                                          />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Category</label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            list="adm-policy-category-suggestions"
                                            value={pol.category || ""}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].category = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="Financial & Operational, Protection & Rights, Governance & Ethics, Community & Field"
                                          />
                                        </div>
                                      </div>

                                      <div className="form-row-2col">
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Statutory Badge Tag</label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            list="adm-policy-badge-suggestions"
                                            value={pol.badge || ""}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].badge = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="e.g. Statutory, Human Rights, Mandatory, Ecological, Field Safety"
                                          />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Policy ID / Number</label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={pol.id !== undefined ? pol.id : originalIdx + 1}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].id = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="e.g. 1"
                                          />
                                        </div>
                                      </div>

                                      <div className="form-row-2col">
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Statutory Basis / Act</label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={pol.statutoryBasis || ""}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].statutoryBasis = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="e.g. Societies Registration Act 1860 & Multi-Donor Financial Accounting Standards"
                                          />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Custodian Committee / Cell</label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={pol.committee || ""}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].committee = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                            placeholder="e.g. Board Finance & Logistical Oversight Committee"
                                          />
                                        </div>
                                      </div>

                                      <div className="form-row-2col">
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Policy Icon</label>
                                          <select
                                            className="form-input"
                                            value={pol.icon || "FaFileContract"}
                                            onChange={(e) => {
                                              const copy = [...(pageContent.policies || [])];
                                              copy[originalIdx].icon = e.target.value;
                                              setPageContent({ ...pageContent, policies: copy });
                                            }}
                                          >
                                            {POLICY_ICONS.map((ic) => (
                                              <option key={ic.id} value={ic.id}>
                                                {ic.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                          <label className="form-label">Accent Theme Color</label>
                                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                            <input
                                              type="color"
                                              value={pol.accent || "#003190"}
                                              onChange={(e) => {
                                                const copy = [...(pageContent.policies || [])];
                                                copy[originalIdx].accent = e.target.value;
                                                setPageContent({ ...pageContent, policies: copy });
                                              }}
                                              style={{ width: 38, height: 38, border: "none", borderRadius: 6, background: "none", cursor: "pointer" }}
                                            />
                                            <input
                                              type="text"
                                              className="form-input"
                                              value={pol.accent || "#003190"}
                                              onChange={(e) => {
                                                const copy = [...(pageContent.policies || [])];
                                                copy[originalIdx].accent = e.target.value;
                                                setPageContent({ ...pageContent, policies: copy });
                                              }}
                                              placeholder="#003190"
                                              style={{ flex: 1 }}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="form-group" style={{ marginBottom: 10 }}>
                                        <label className="form-label">Mandate &amp; Scope Description</label>
                                        <textarea
                                          rows={2}
                                          className="form-textarea"
                                          value={pol.desc || pol.scope || ""}
                                          onChange={(e) => {
                                            const copy = [...(pageContent.policies || [])];
                                            copy[originalIdx].desc = e.target.value;
                                            copy[originalIdx].scope = e.target.value;
                                            setPageContent({ ...pageContent, policies: copy });
                                          }}
                                          placeholder="Describe the mandate, operational scope, and community safeguards for this policy..."
                                        />
                                      </div>

                                      <div className="form-group" style={{ marginBottom: 10 }}>
                                        <label className="form-label">
                                          Statutory Principles / Dossier Points (One per line)
                                          <span style={{ fontSize: "0.72rem", color: "#8892a4", marginLeft: 8, fontWeight: 400 }}>
                                            (Displayed inside the Inspect Dossier modal)
                                          </span>
                                        </label>
                                        <textarea
                                          rows={3}
                                          className="form-textarea"
                                          value={principlesArr.join("\n")}
                                          onChange={(e) => {
                                            const copy = [...(pageContent.policies || [])];
                                            copy[originalIdx].principles = e.target.value
                                              .split("\n")
                                              .map((s) => s.trim())
                                              .filter(Boolean);
                                            setPageContent({ ...pageContent, policies: copy });
                                          }}
                                          placeholder="Enter each statutory principle on a new line..."
                                        />
                                      </div>

                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Highlights (comma separated pills)</label>
                                        <input
                                          type="text"
                                          className="form-input"
                                          value={highlightsArr.join(", ")}
                                          onChange={(e) => {
                                            const copy = [...(pageContent.policies || [])];
                                            copy[originalIdx].highlights = e.target.value
                                              .split(",")
                                              .map((s) => s.trim())
                                              .filter(Boolean);
                                            setPageContent({ ...pageContent, policies: copy });
                                          }}
                                          placeholder="e.g. Activity-based proportional expense allocation, Quarterly reconciliation"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>


                    {/* OUR COMMITMENT SECTION ("PRINCIPLES IN PRACTICE") */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ color: "#F5A000", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                          <FaShieldAlt size={16} /> Our Commitment ("Principles in Practice")
                        </div>
                        <span style={{ fontSize: "0.72rem", background: "rgba(245, 160, 0, 0.15)", color: "#F5A000", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Field Manifesto
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Commitment Section Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.commitment_badge || ""}
                            onChange={(e) => setPageContent({ ...pageContent, commitment_badge: e.target.value })}
                            placeholder="e.g. Our Commitment"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Commitment Main Heading</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.commitment_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, commitment_title: e.target.value })}
                            placeholder="e.g. Principles in Practice"
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label">Commitment Description</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.commitment_desc || ""}
                          onChange={(e) => setPageContent({ ...pageContent, commitment_desc: e.target.value })}
                          placeholder="How ALERT's policies are lived out daily in the field..."
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Principle Values (comma separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={
                            Array.isArray(pageContent.commitment_tags)
                              ? pageContent.commitment_tags.join(", ")
                              : ""
                          }
                          onChange={(e) =>
                            setPageContent({
                              ...pageContent,
                              commitment_tags: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            })
                          }
                          placeholder="e.g. Integrity, Accountability, Transparency, Gender Justice, Professionalism, Excellence, Empathy"
                        />
                      </div>
                    </div>

                    {/* OFFICIAL POLICY DOCUMENT (PDF) */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ color: "#ec4899", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                          <FaFilePdf size={16} /> Official Policy Document (PDF)
                        </div>
                        <span style={{ fontSize: "0.72rem", background: "rgba(236, 72, 153, 0.15)", color: "#ec4899", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Document Download
                        </span>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group">
                          <label className="form-label">Download Button Label</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.pdf_btn_label || ""}
                            onChange={(e) => setPageContent({ ...pageContent, pdf_btn_label: e.target.value })}
                            placeholder="e.g. Download Policy Document PDF"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Document Title (in Viewer Modal)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.pdf_title || ""}
                            onChange={(e) => setPageContent({ ...pageContent, pdf_title: e.target.value })}
                            placeholder="e.g. Organizational Profile & Policies"
                          />
                        </div>
                      </div>

                      <div className="form-row-2col">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Document Meta / Badge Text</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.pdf_meta || ""}
                            onChange={(e) => setPageContent({ ...pageContent, pdf_meta: e.target.value })}
                            placeholder="e.g. Official Society Record • Governance & Policy Document"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">PDF File Path / URL</label>
                          <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.pdf_file || ""}
                              onChange={(e) => setPageContent({ ...pageContent, pdf_file: e.target.value })}
                              placeholder="e.g. /uploads/Organizational-Profile-of-ALERT.pdf"
                              style={{ flex: 1, minWidth: 0 }}
                            />
                            <label
                              className="btn-secondary"
                              style={{ cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                            >
                              <FaCloudUploadAlt size={14} />
                              {uploadingField === "policy_pdf" ? "Uploading..." : "Upload PDF"}
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                style={{ display: "none" }}
                                disabled={uploadingField === "policy_pdf"}
                                onChange={handlePolicyPdfUpload}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. AREA OF OPERATION */}
                {activeTab === "area-of-operation" && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e2436" }}>
                    {/* SECTION 06: HERO & BANNER */}
                    <div style={{ background: "#0d1017", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#10b981", fontWeight: 700, fontSize: "1rem" }}>
                          <FaMapMarkerAlt size={18} /> Section 06: Area of Operation Hero &amp; Banner
                        </div>
                        <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                          Hero &amp; Banner
                        </span>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Hero Banner Background Image (Optional)</label>
                        <div className="adm-upload-group" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            className="form-input"
                            value={pageBanner || ""}
                            onChange={(e) => setPageBanner(e.target.value)}
                            placeholder="e.g. /uploads/area-banner.jpg or https://..."
                            style={{ flex: 1, minWidth: 0 }}
                          />
                          <label
                            className="btn-secondary"
                            style={{ cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <FaCloudUploadAlt size={14} />
                            {uploadingField === "banner_image" ? "Uploading..." : "Upload Banner"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              disabled={uploadingField === "banner_image"}
                              onChange={handleBannerUpload}
                            />
                          </label>
                          {pageBanner && (
                            <button
                              type="button"
                              onClick={handleRemoveBanner}
                              className="btn-secondary"
                              style={{ color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", padding: "9px 12px" }}
                              title="Remove banner image"
                            >
                              <FaTrash size={12} /> Clear
                            </button>
                          )}
                        </div>
                        {pageBanner && (
                          <div className="adm-img-preview-box">
                            <img
                              src={pageBanner}
                              alt="Banner preview"
                              className="adm-preview-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <div className="adm-preview-info">
                              <div className="adm-preview-title">Area of Operation Banner Preview</div>
                              <div className="adm-preview-path" title={pageBanner}>
                                {pageBanner.startsWith("data:") ? "Immediate Data URL Preview" : pageBanner}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveBanner}
                              className="adm-preview-remove"
                              title="Remove banner"
                            >
                              <FaTrash size={11} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* OPERATIONAL STATISTICS STRIP */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaLayerGroup size={16} /> Operational Scale &amp; Metric Badges
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label className="form-label">Mandals Count Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.mandals_count || ""}
                            onChange={(e) => setPageContent({ ...pageContent, mandals_count: e.target.value })}
                            placeholder="e.g. 17 Mandals"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 12 }}>
                          <label className="form-label">Habitations Count Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.habitations_count || ""}
                            onChange={(e) => setPageContent({ ...pageContent, habitations_count: e.target.value })}
                            placeholder="e.g. 371+ Habitations"
                          />
                        </div>
                      </div>
                      <div className="form-row-2col">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Operational Belts Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.regions_count || ""}
                            onChange={(e) => setPageContent({ ...pageContent, regions_count: e.target.value })}
                            placeholder="e.g. 4 Operational Belts"
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Communities / Tribes Badge</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pageContent.tribes_count || ""}
                            onChange={(e) => setPageContent({ ...pageContent, tribes_count: e.target.value })}
                            placeholder="e.g. 6 Indigenous Communities"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FIELDWORK SUMMARY NARRATIVE */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                      <div style={{ color: "#F5A000", fontWeight: 700, fontSize: "1rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaInfoCircle size={16} /> Geographic Fieldwork Overview &amp; Context
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Fieldwork Narrative Summary</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={pageContent.summary || ""}
                          onChange={(e) => setPageContent({ ...pageContent, summary: e.target.value })}
                          placeholder="Comprehensive description of ALERT's geographical outreach across agency and coastal belts..."
                        />
                      </div>
                    </div>

                    {/* OPERATIONAL JURISDICTIONS & BELTS MANAGER */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#10b981", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <FaCompass size={16} />
                            <span>Operational Territories &amp; Belts</span>
                            <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {(pageContent.regions || []).length} belts
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            Manage the strategic field belts, ITDA jurisdictions, mandal counts, and focal tribal groups on /area-of-operation.
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => {
                              const next = {};
                              (pageContent.regions || []).forEach((_, i) => { next[i] = true; });
                              setExpandedRegions(next);
                            }}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", display: "inline-flex", alignItems: "center", gap: 5 }}
                            title="Expand all operational belt editors"
                          >
                            <FaEdit size={11} /> Expand All
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedRegions({})}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", color: "#94a3b8" }}
                            title="Collapse all operational belts"
                          >
                            Collapse All
                          </button>
                          <button
                            type="button"
                            onClick={handleAddOperationalRegion}
                            className="btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                          >
                            <FaPlus size={11} /> Add Operational Belt
                          </button>
                        </div>
                      </div>

                      {(pageContent.regions || []).length === 0 && (
                        <div style={{ textAlign: "center", padding: 30, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 10 }}>
                          No operational territories configured. Click "Add Operational Belt" to create one.
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {(pageContent.regions || []).map((reg, rIdx) => {
                          const regColor = reg.color || "#003190";
                          const isRegEditing = Boolean(expandedRegions[rIdx]);
                          return (
                            <div
                              key={rIdx}
                              style={{
                                background: "#080b11",
                                border: isRegEditing ? "2px solid #38bdf8" : `1px solid ${regColor}40`,
                                borderLeft: `4px solid ${isRegEditing ? "#38bdf8" : regColor}`,
                                borderRadius: 12,
                                padding: 16,
                                boxShadow: isRegEditing ? "0 0 16px rgba(56, 189, 248, 0.15)" : "none",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isRegEditing ? 12 : 6, flexWrap: "wrap", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: regColor, background: `${regColor}15`, padding: "2px 8px", borderRadius: 4 }}>
                                    #{rIdx + 1}
                                  </span>
                                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                                    {reg.name || `Territory #${rIdx + 1}`}
                                  </span>
                                  {reg.mandals && (
                                    <span style={{ fontSize: "0.7rem", color: regColor, border: `1px solid ${regColor}40`, padding: "1px 7px", borderRadius: 12 }}>
                                      {reg.mandals}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => toggleRegionExpand(rIdx)}
                                    className="btn-secondary"
                                    style={{
                                      padding: "3px 8px",
                                      fontSize: "0.68rem",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      color: isRegEditing ? "#10b981" : "#38bdf8",
                                      borderColor: isRegEditing ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)",
                                      background: isRegEditing ? "rgba(16, 185, 129, 0.1)" : "rgba(56, 189, 248, 0.08)",
                                      fontWeight: 700,
                                      cursor: "pointer"
                                    }}
                                    title={isRegEditing ? "Close belt editor" : "Edit belt details"}
                                  >
                                    <FaEdit size={10} /> {isRegEditing ? "Done" : "Edit"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOperationalRegion(rIdx, -1)}
                                    disabled={rIdx === 0}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: rIdx === 0 ? 0.4 : 1 }}
                                    title="Move Belt Up"
                                  >
                                    <FaArrowUp size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOperationalRegion(rIdx, 1)}
                                    disabled={rIdx === (pageContent.regions || []).length - 1}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", opacity: rIdx === (pageContent.regions || []).length - 1 ? 0.4 : 1 }}
                                    title="Move Belt Down"
                                  >
                                    <FaArrowDown size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOperationalRegion(rIdx)}
                                    className="btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "0.72rem", color: "#ff7675" }}
                                    title="Delete Belt"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                              </div>

                              {isRegEditing ? (
                                <div>
                                  <div className="form-row-2col">
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                      <label className="form-label">Territory / Belt Name</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={reg.name || ""}
                                        onChange={(e) => {
                                          const copy = [...(pageContent.regions || [])];
                                          copy[rIdx].name = e.target.value;
                                          setPageContent({ ...pageContent, regions: copy });
                                        }}
                                        placeholder="e.g. ASR Hill Agency"
                                      />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                      <label className="form-label">Mandals Covered</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={reg.mandals || ""}
                                        onChange={(e) => {
                                          const copy = [...(pageContent.regions || [])];
                                          copy[rIdx].mandals = e.target.value;
                                          setPageContent({ ...pageContent, regions: copy });
                                        }}
                                        placeholder="e.g. 6 Mandals"
                                      />
                                    </div>
                                  </div>

                                  <div className="form-row-2col">
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                      <label className="form-label">Territory Icon</label>
                                      <select
                                        className="form-input"
                                        value={reg.icon || "FaMapMarkerAlt"}
                                        onChange={(e) => {
                                          const copy = [...(pageContent.regions || [])];
                                          copy[rIdx].icon = e.target.value;
                                          setPageContent({ ...pageContent, regions: copy });
                                        }}
                                      >
                                        {REGION_ICONS.map((ic) => (
                                          <option key={ic.id} value={ic.id}>
                                            {ic.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                      <label className="form-label">Accent Theme Color</label>
                                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <input
                                          type="color"
                                          value={reg.color || "#003190"}
                                          onChange={(e) => {
                                            const copy = [...(pageContent.regions || [])];
                                            copy[rIdx].color = e.target.value;
                                            setPageContent({ ...pageContent, regions: copy });
                                          }}
                                          style={{ width: 38, height: 38, border: "none", borderRadius: 6, background: "none", cursor: "pointer" }}
                                        />
                                        <input
                                          type="text"
                                          className="form-input"
                                          value={reg.color || "#003190"}
                                          onChange={(e) => {
                                            const copy = [...(pageContent.regions || [])];
                                            copy[rIdx].color = e.target.value;
                                            setPageContent({ ...pageContent, regions: copy });
                                          }}
                                          placeholder="#003190"
                                          style={{ flex: 1 }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Operational Focus &amp; Programs</label>
                                    <textarea
                                      rows={2}
                                      className="form-textarea"
                                      value={reg.focus || ""}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.regions || [])];
                                        copy[rIdx].focus = e.target.value;
                                        setPageContent({ ...pageContent, regions: copy });
                                      }}
                                      placeholder="Describe the legal interventions, Gram Sabha work, and focus areas..."
                                    />
                                  </div>

                                  <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Tribal Communities / Target Mandate</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={reg.tribes || ""}
                                      onChange={(e) => {
                                        const copy = [...(pageContent.regions || [])];
                                        copy[rIdx].tribes = e.target.value;
                                        setPageContent({ ...pageContent, regions: copy });
                                      }}
                                      placeholder="e.g. Koya · Konda Reddi (PVTG) · Valmiki"
                                    />
                                  </div>

                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid #1e2436" }}>
                                    <button
                                      type="button"
                                      onClick={() => toggleRegionExpand(rIdx)}
                                      className="btn-secondary"
                                      style={{ padding: "5px 12px", fontSize: "0.74rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 }}
                                    >
                                      <FaCheckCircle size={11} /> Done Editing Belt #{rIdx + 1}
                                    </button>
                                    <span style={{ fontSize: "0.68rem", color: "#8892a4" }}>
                                      Click 'Save Area of Operation' below.
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                                  <div style={{ fontSize: "0.76rem", color: "#8892a4", lineHeight: 1.5, flex: 1 }}>
                                    <strong style={{ color: "#cbd5e1" }}>Focus: </strong>{reg.focus || "Operational mandate and legal support"}
                                    {reg.tribes && <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>Mandate: {reg.tribes}</div>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleRegionExpand(rIdx)}
                                    className="btn-secondary"
                                    style={{ padding: "4px 10px", fontSize: "0.72rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700 }}
                                  >
                                    <FaEdit size={10} /> Edit Belt Details →
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 07: INTERACTIVE LEAFLET MAP & TERRITORY COLORS MANAGER */}
                    <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                      <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <FaMapMarkedAlt size={17} />
                            <span>Leaflet Interactive Map &amp; Territory Colors</span>
                            <span className="adm-badge-pill" style={{ fontSize: "0.72rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: 12, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {((pageContent.map_regions || defaultOperationalRegions) || []).length} territories
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8892a4", marginTop: 2 }}>
                            Configure visual territory polygon colors, map canvas tiles, center viewports, and all 17+ mandal station pins.
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={handleResetMapToDefault}
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "0.78rem", color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.4)", whiteSpace: "nowrap" }}
                            title="Reset all map boundaries, colors, and 17 mandal pins to official defaults"
                          >
                            <FaUndo size={11} /> Reset Map Defaults
                          </button>
                          <button
                            type="button"
                            onClick={handleAddMapRegion}
                            className="btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", whiteSpace: "nowrap", flexShrink: 0 }}
                          >
                            <FaPlus size={11} /> Add Map Territory
                          </button>
                        </div>
                      </div>

                      {/* SUB-SECTION 1: MAP HEADER & CAPTIONS */}
                      <div style={{ background: "#080b11", border: "1px solid #1e2436", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <FaInfoCircle size={13} style={{ color: "#38bdf8" }} /> Map Explorer Header &amp; Subtitle
                        </div>
                        <div className="form-row-2col">
                          <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label">Map Explorer Badge</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.map_badge || ""}
                              onChange={(e) => setPageContent({ ...pageContent, map_badge: e.target.value })}
                              placeholder="Visual Territory Identification"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label">Map Explorer Title</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.map_title || ""}
                              onChange={(e) => setPageContent({ ...pageContent, map_title: e.target.value })}
                              placeholder="ALERT Area of Operation: Identified Territories & Mandals"
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Map Explorer Subtitle / Guide</label>
                          <textarea
                            rows={2}
                            className="form-textarea"
                            value={pageContent.map_subtitle || ""}
                            onChange={(e) => setPageContent({ ...pageContent, map_subtitle: e.target.value })}
                            placeholder="All 17 mandal stations and 4 operational jurisdictions are labeled and color-coded below..."
                          />
                        </div>
                      </div>

                      {/* SUB-SECTION 2: MAP VIEWPORT & TILE THEME */}
                      <div style={{ background: "#080b11", border: "1px solid #1e2436", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          <FaSlidersH size={13} style={{ color: "#38bdf8" }} /> Map Canvas Theme &amp; Default Coordinates
                        </div>
                        <div className="form-row-2col">
                          <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label">Map Tile Theme</label>
                            <select
                              className="form-input"
                              value={pageContent.map_settings?.map_tile_url || defaultMapSettings.map_tile_url}
                              onChange={(e) => handleUpdateMapSetting("map_tile_url", e.target.value)}
                            >
                              <option value="https://tile.openstreetmap.org/{z}/{x}/{y}.png">OpenStreetMap Standard (Default)</option>
                              <option value="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png">CartoDB Positron (Clean Light)</option>
                              <option value="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png">CartoDB Voyager (Detailed Color)</option>
                              <option value="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png">CartoDB Dark Matter (Sleek Dark)</option>
                              <option value="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png">OpenTopoMap (Topographical Relief)</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ marginBottom: 10 }}>
                            <label className="form-label">Custom Tile URL (Optional)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={pageContent.map_settings?.map_tile_url || ""}
                              onChange={(e) => handleUpdateMapSetting("map_tile_url", e.target.value)}
                              placeholder="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Default Center Lat</label>
                            <input
                              type="number"
                              step="0.001"
                              className="form-input"
                              value={pageContent.map_settings?.map_center_lat ?? defaultMapSettings.map_center_lat}
                              onChange={(e) => handleUpdateMapSetting("map_center_lat", e.target.value)}
                              placeholder="17.1"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Default Center Lng</label>
                            <input
                              type="number"
                              step="0.001"
                              className="form-input"
                              value={pageContent.map_settings?.map_center_lng ?? defaultMapSettings.map_center_lng}
                              onChange={(e) => handleUpdateMapSetting("map_center_lng", e.target.value)}
                              placeholder="81.45"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Default Zoom Level</label>
                            <input
                              type="number"
                              step="0.5"
                              className="form-input"
                              value={pageContent.map_settings?.map_zoom ?? defaultMapSettings.map_zoom}
                              onChange={(e) => handleUpdateMapSetting("map_zoom", e.target.value)}
                              placeholder="8.5"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SUB-SECTION 3: TERRITORIES & COLOR SELECTOR TABS */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                          <FaPalette size={13} style={{ color: "#38bdf8" }} /> Map Operational Territories &amp; Boundary Polygons
                        </div>

                        {/* Fast Territory Jump Pills */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                          {(pageContent.map_regions || defaultOperationalRegions || []).map((t, tIdx) => {
                            const tColor = t.badgeColor || t.color || "#003190";
                            const isActive = expandedMapReg === tIdx;
                            return (
                              <button
                                key={t.id || tIdx}
                                type="button"
                                onClick={() => setExpandedMapReg(tIdx)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "6px 12px",
                                  borderRadius: 20,
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  background: isActive ? `${tColor}25` : "#080b11",
                                  color: isActive ? "#ffffff" : "#94a3b8",
                                  border: `1.5px solid ${isActive ? tColor : "#1e2436"}`,
                                  transition: "all 0.2s ease"
                                }}
                              >
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: tColor, display: "inline-block" }} />
                                <span>{t.shortName || t.name || `Territory #${tIdx + 1}`}</span>
                                <span style={{ fontSize: "0.68rem", opacity: 0.8, background: `${tColor}30`, padding: "1px 6px", borderRadius: 10 }}>
                                  {(t.mandals || []).length}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* TERRITORY CARDS */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {(pageContent.map_regions || defaultOperationalRegions || []).map((reg, regIdx) => {
                          const regColor = reg.badgeColor || reg.color || "#003190";
                          const isExpanded = expandedMapReg === regIdx;
                          const mandalsList = reg.mandals || [];

                          return (
                            <div
                              key={reg.id || regIdx}
                              style={{
                                background: "#080b11",
                                border: `1px solid ${isExpanded ? regColor : "#1e2436"}`,
                                borderLeft: `5px solid ${regColor}`,
                                borderRadius: 12,
                                overflow: "hidden",
                                transition: "all 0.2s ease"
                              }}
                            >
                              {/* Territory Header Bar */}
                              <div
                                onClick={() => setExpandedMapReg(isExpanded ? -1 : regIdx)}
                                className="adm-territory-header"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "12px 14px",
                                  cursor: "pointer",
                                  background: isExpanded ? `${regColor}12` : "transparent",
                                  flexWrap: "wrap",
                                  gap: 8
                                }}
                              >
                                <div className="adm-territory-header-left" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: "1 1 auto", minWidth: 0 }}>
                                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: regColor, display: "inline-block", boxShadow: `0 0 8px ${regColor}80`, flexShrink: 0 }} />
                                  <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#ffffff", wordBreak: "break-word" }}>
                                    {reg.name || `Territory #${regIdx + 1}`}
                                  </span>
                                  {reg.shortName && (
                                    <span className="adm-badge-pill" style={{ fontSize: "0.72rem", color: regColor, background: `${regColor}15`, padding: "2px 8px", borderRadius: 4, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                                      {reg.shortName}
                                    </span>
                                  )}
                                  <span className="adm-badge-pill" style={{ fontSize: "0.70rem", color: "#94a3b8", background: "#1e2436", padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap", flexShrink: 0 }}>
                                    {mandalsList.length} Mandal Station{mandalsList.length === 1 ? "" : "s"}
                                  </span>
                                </div>

                                <div className="adm-territory-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMapRegion(regIdx);
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: "4px 10px", fontSize: "0.72rem", color: "#ff7675", borderColor: "rgba(255, 118, 117, 0.3)", whiteSpace: "nowrap", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                                    title="Delete territory"
                                  >
                                    <FaTrash size={10} /> Delete
                                  </button>
                                  <span style={{ fontSize: "0.85rem", color: "#8892a4", fontWeight: 700, flexShrink: 0, paddingLeft: 4 }}>
                                    {isExpanded ? "▲" : "▼"}
                                  </span>
                                </div>
                              </div>

                              {/* Territory Content Body */}
                              {isExpanded && (
                                <div style={{ padding: "16px 18px", borderTop: `1px solid ${regColor}30` }}>
                                  {/* Territory Name & Short Name */}
                                  <div className="form-row-2col">
                                    <div className="form-group" style={{ marginBottom: 12 }}>
                                      <label className="form-label">Full Territory Name</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={reg.name || ""}
                                        onChange={(e) => handleUpdateMapRegion(regIdx, "name", e.target.value)}
                                        placeholder="e.g. ASR District (Alluri Sitharama Raju)"
                                      />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 12 }}>
                                      <label className="form-label">Short Name (for Filter Pills &amp; Legend)</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={reg.shortName || ""}
                                        onChange={(e) => handleUpdateMapRegion(regIdx, "shortName", e.target.value)}
                                        placeholder="e.g. ASR District"
                                      />
                                    </div>
                                  </div>

                                  {/* MAP HIGHLIGHT & BOUNDARY COLOR PICKER */}
                                  <div className="form-group" style={{ marginBottom: 14, background: "#10141d", padding: 12, borderRadius: 10, border: `1px solid ${regColor}35` }}>
                                    <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                        <FaPalette size={13} style={{ color: regColor }} /> Territory Map Highlight &amp; Polygon Color
                                      </span>
                                      <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Applies to map polygons, pins, and legend</span>
                                    </label>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                                      <input
                                        type="color"
                                        value={regColor}
                                        onChange={(e) => {
                                          handleUpdateMapRegion(regIdx, "badgeColor", e.target.value);
                                          handleUpdateMapRegion(regIdx, "color", e.target.value);
                                        }}
                                        style={{ width: 44, height: 40, border: "none", borderRadius: 8, background: "none", cursor: "pointer" }}
                                      />
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={regColor}
                                        onChange={(e) => {
                                          handleUpdateMapRegion(regIdx, "badgeColor", e.target.value);
                                          handleUpdateMapRegion(regIdx, "color", e.target.value);
                                        }}
                                        placeholder="#10b981"
                                        style={{ width: 140, fontWeight: 700, letterSpacing: 0.5 }}
                                      />
                                      <div
                                        style={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: 8,
                                          background: regColor,
                                          border: "2px solid #ffffff",
                                          boxShadow: `0 0 10px ${regColor}80`
                                        }}
                                        title={`Current Color: ${regColor}`}
                                      />
                                    </div>

                                    {/* Quick Palette Swatches */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Quick Presets:</span>
                                      {MAP_COLOR_PRESETS.map((preset) => (
                                        <button
                                          key={preset.color}
                                          type="button"
                                          onClick={() => {
                                            handleUpdateMapRegion(regIdx, "badgeColor", preset.color);
                                            handleUpdateMapRegion(regIdx, "color", preset.color);
                                          }}
                                          style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: "50%",
                                            background: preset.color,
                                            border: regColor.toLowerCase() === preset.color.toLowerCase() ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.2)",
                                            cursor: "pointer",
                                            padding: 0,
                                            boxShadow: regColor.toLowerCase() === preset.color.toLowerCase() ? `0 0 8px ${preset.color}` : "none",
                                            transform: regColor.toLowerCase() === preset.color.toLowerCase() ? "scale(1.2)" : "scale(1)",
                                            transition: "all 0.15s ease"
                                          }}
                                          title={preset.label}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  {/* ITDA & Communities */}
                                  <div className="form-row-2col">
                                    <div className="form-group" style={{ marginBottom: 12 }}>
                                      <label className="form-label">ITDA Jurisdictions</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={Array.isArray(reg.itda) ? reg.itda.join(", ") : (reg.itda || "")}
                                        onChange={(e) => handleUpdateMapRegion(regIdx, "itda", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                                        placeholder="e.g. Rampachodavaram ITDA, Chinturu ITDA"
                                      />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 12 }}>
                                      <label className="form-label">Tribal Communities</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={Array.isArray(reg.tribes) ? reg.tribes.join(", ") : (reg.tribes || "")}
                                        onChange={(e) => handleUpdateMapRegion(regIdx, "tribes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                                        placeholder="e.g. Koya, Konda Reddi (PVTG), Valmiki"
                                      />
                                    </div>
                                  </div>

                                  {/* Focus narrative */}
                                  <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label className="form-label">Field Focus &amp; Intervention Mandate</label>
                                    <textarea
                                      rows={2}
                                      className="form-textarea"
                                      value={reg.focus || ""}
                                      onChange={(e) => handleUpdateMapRegion(regIdx, "focus", e.target.value)}
                                      placeholder="PESA Gram Sabha sovereignty, RoFR Community Forest Rights (CFR)..."
                                    />
                                  </div>

                                  {/* Territory Focus Viewport Coordinates */}
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                      <label className="form-label">Focus Lat</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={Array.isArray(reg.center) ? reg.center[0] : 17.5}
                                        onChange={(e) => {
                                          const lng = Array.isArray(reg.center) ? reg.center[1] : 81.5;
                                          handleUpdateMapRegion(regIdx, "center", [parseFloat(e.target.value) || 0, lng]);
                                        }}
                                        placeholder="17.55"
                                      />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                      <label className="form-label">Focus Lng</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={Array.isArray(reg.center) ? reg.center[1] : 81.5}
                                        onChange={(e) => {
                                          const lat = Array.isArray(reg.center) ? reg.center[0] : 17.5;
                                          handleUpdateMapRegion(regIdx, "center", [lat, parseFloat(e.target.value) || 0]);
                                        }}
                                        placeholder="81.55"
                                      />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                      <label className="form-label">Focus Zoom</label>
                                      <input
                                        type="number"
                                        step="0.5"
                                        className="form-input"
                                        value={reg.zoom ?? 9.5}
                                        onChange={(e) => handleUpdateMapRegion(regIdx, "zoom", parseFloat(e.target.value) || 9)}
                                        placeholder="9.5"
                                      />
                                    </div>
                                  </div>

                                  {/* MANDALS & PINS MANAGER FOR THIS TERRITORY */}
                                  <div style={{ background: "#05070a", border: "1px solid #1e2436", borderRadius: 10, padding: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                                        <FaMapMarkerAlt size={13} style={{ color: regColor }} />
                                        Mandal Stations &amp; Map Pins ({mandalsList.length})
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleAddMandalToRegion(regIdx)}
                                        className="btn-secondary"
                                        style={{ padding: "6px 12px", fontSize: "0.78rem", color: regColor, borderColor: `${regColor}40` }}
                                      >
                                        <FaPlus size={10} /> Add Mandal Station
                                      </button>
                                    </div>

                                    {mandalsList.length === 0 && (
                                      <div style={{ textAlign: "center", padding: 20, color: "#8892a4", border: "1px dashed #1e2436", borderRadius: 8, fontSize: "0.8rem" }}>
                                        No mandal pins configured for this territory. Click "Add Mandal Station" to place one.
                                      </div>
                                    )}

                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                      {mandalsList.map((mandal, mIdx) => {
                                        const mandalPinColor = mandal.pinColor || regColor;
                                        return (
                                          <div
                                            key={mandal.id || mIdx}
                                            style={{
                                              background: "#0c1017",
                                              border: "1px solid #1e2436",
                                              borderLeft: `3px solid ${mandalPinColor}`,
                                              borderRadius: 8,
                                              padding: 12
                                            }}
                                          >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: mandalPinColor }} />
                                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
                                                  #{mIdx + 1} {mandal.name || `Station #${mIdx + 1}`}
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteMandalFromRegion(regIdx, mIdx)}
                                                className="btn-secondary"
                                                style={{ padding: "3px 7px", fontSize: "0.7rem", color: "#ff7675" }}
                                                title="Remove station"
                                              >
                                                <FaTrash size={9} />
                                              </button>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 8 }}>
                                              <div>
                                                <label style={{ fontSize: "0.68rem", color: "#8892a4", display: "block", marginBottom: 2 }}>Mandal Label</label>
                                                <input
                                                  type="text"
                                                  className="form-input"
                                                  style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                                                  value={mandal.name || ""}
                                                  onChange={(e) => handleUpdateMandalInRegion(regIdx, mIdx, "name", e.target.value)}
                                                  placeholder="e.g. 1. Chinturu"
                                                />
                                              </div>
                                              <div>
                                                <label style={{ fontSize: "0.68rem", color: "#8892a4", display: "block", marginBottom: 2 }}>Full Name</label>
                                                <input
                                                  type="text"
                                                  className="form-input"
                                                  style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                                                  value={mandal.fullName || ""}
                                                  onChange={(e) => handleUpdateMandalInRegion(regIdx, mIdx, "fullName", e.target.value)}
                                                  placeholder="e.g. Chinturu Mandal"
                                                />
                                              </div>
                                              <div>
                                                <label style={{ fontSize: "0.68rem", color: "#8892a4", display: "block", marginBottom: 2 }}>Latitude</label>
                                                <input
                                                  type="number"
                                                  step="0.0001"
                                                  className="form-input"
                                                  style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                                                  value={mandal.lat ?? ""}
                                                  onChange={(e) => handleUpdateMandalInRegion(regIdx, mIdx, "lat", parseFloat(e.target.value) || 0)}
                                                  placeholder="17.747"
                                                />
                                              </div>
                                              <div>
                                                <label style={{ fontSize: "0.68rem", color: "#8892a4", display: "block", marginBottom: 2 }}>Longitude</label>
                                                <input
                                                  type="number"
                                                  step="0.0001"
                                                  className="form-input"
                                                  style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                                                  value={mandal.lng ?? ""}
                                                  onChange={(e) => handleUpdateMandalInRegion(regIdx, mIdx, "lng", parseFloat(e.target.value) || 0)}
                                                  placeholder="81.393"
                                                />
                                              </div>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 8 }}>
                                              <div>
                                                <label style={{ fontSize: "0.68rem", color: "#8892a4", display: "block", marginBottom: 2 }}>ITDA Division</label>
                                                <input
                                                  type="text"
                                                  className="form-input"
                                                  style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                                                  value={mandal.itda || ""}
                                                  onChange={(e) => handleUpdateMandalInRegion(regIdx, mIdx, "itda", e.target.value)}
                                                  placeholder="e.g. Chinturu ITDA"
                                                />
                                              </div>
                                              <div>
                                                <label style={{ fontSize: "0.68rem", color: "#8892a4", display: "block", marginBottom: 2 }}>River / Basin Area</label>
                                                <input
                                                  type="text"
                                                  className="form-input"
                                                  style={{ padding: "6px 8px", fontSize: "0.78rem" }}
                                                  value={mandal.river || ""}
                                                  onChange={(e) => handleUpdateMandalInRegion(regIdx, mIdx, "river", e.target.value)}
                                                  placeholder="e.g. Sabari & Godavari Basin"
                                                />
                                              </div>
                                            </div>

                                            <div>
                                              <label style={{ fontSize: "0.68rem", color: "#8892a4", display: "block", marginBottom: 2 }}>Key Field Activities</label>
                                              <textarea
                                                rows={2}
                                                className="form-textarea"
                                                style={{ padding: "6px 8px", fontSize: "0.76rem" }}
                                                value={mandal.activities || ""}
                                                onChange={(e) => handleUpdateMandalInRegion(regIdx, mIdx, "activities", e.target.value)}
                                                placeholder="Gram Sabha Patta titling under RoFR 2006, flash flood warning system..."
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 08: FIELD MANDALS & GROUND ACTION MANAGER */}
                    {(() => {
                      const curRegions = Array.isArray(pageContent.map_regions) && pageContent.map_regions.length > 0
                        ? pageContent.map_regions
                        : defaultOperationalRegions;

                      const allFieldMandals = curRegions.flatMap((reg, regIdx) =>
                        (reg.mandals || []).map((mandal, mandalIdx) => {
                          const mKey = mandal.id || `${reg.id || regIdx}-${mandalIdx}`;
                          return {
                            ...mandal,
                            key: mKey,
                            regIdx,
                            mandalIdx,
                            regionId: reg.id || `reg-${regIdx}`,
                            regionName: reg.name,
                            regionShortName: reg.shortName || reg.name,
                            regionBadgeColor: reg.badgeColor || reg.color || "#10b981"
                          };
                        })
                      );

                      const displayedFieldMandals = allFieldMandals.filter((m) => {
                        const matchesTerritory = mandalFilterRegion === "all" || m.regionId === mandalFilterRegion;
                        if (!matchesTerritory) return false;
                        if (!mandalSearchQuery.trim()) return true;
                        const q = mandalSearchQuery.toLowerCase();
                        return (
                          (m.name || "").toLowerCase().includes(q) ||
                          (m.fullName || "").toLowerCase().includes(q) ||
                          (m.itda || "").toLowerCase().includes(q) ||
                          (m.river || "").toLowerCase().includes(q) ||
                          (m.actionTag || "").toLowerCase().includes(q) ||
                          (m.activities || "").toLowerCase().includes(q) ||
                          (m.regionName || "").toLowerCase().includes(q)
                        );
                      });

                      return (
                        <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                            <div>
                              <div style={{ color: "#10b981", fontWeight: 700, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}>
                                <FaCompass size={18} style={{ color: "#10b981" }} /> Field Mandals &amp; Ground Action ({allFieldMandals.length})
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "#8892a4", marginTop: 2 }}>
                                Showing {displayedFieldMandals.length} active mandal stations • Configure ITDA jurisdictions, river basins, ground action categories, and fieldwork activities.
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <button
                                type="button"
                                onClick={() => handleExpandAllMandals(displayedFieldMandals.map((m) => m.key || m.id || `${m.regIdx}-${m.mandalIdx}`))}
                                className="btn-secondary"
                                style={{ padding: "8px 14px", fontSize: "0.8rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", display: "inline-flex", alignItems: "center", gap: 6 }}
                                title="Expand all mandal station editors"
                              >
                                <FaEdit size={11} /> Expand All ({displayedFieldMandals.length})
                              </button>
                              <button
                                type="button"
                                onClick={handleCollapseAllMandals}
                                className="btn-secondary"
                                style={{ padding: "8px 14px", fontSize: "0.8rem", color: "#94a3b8" }}
                                title="Collapse all stations to preview cards"
                              >
                                Collapse All
                              </button>
                              <button
                                type="button"
                                onClick={handleOpenAddMandalForm}
                                className="btn-secondary"
                                style={{ padding: "8px 16px", fontSize: "0.82rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, cursor: "pointer" }}
                              >
                                <FaPlus size={11} /> Add Field Mandal Station
                              </button>
                            </div>
                          </div>

                          {/* FAST JUMP PILLS & SEARCH BAR */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16, background: "#080b11", padding: 12, borderRadius: 10, border: "1px solid #1e2436" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => setMandalFilterRegion("all")}
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: 20,
                                  fontSize: "0.76rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  background: mandalFilterRegion === "all" ? "#10b981" : "#141820",
                                  color: mandalFilterRegion === "all" ? "#ffffff" : "#94a3b8",
                                  border: "1px solid #2a3148"
                                }}
                              >
                                All Belts ({allFieldMandals.length})
                              </button>
                              {curRegions.map((r, rIdx) => {
                                const rColor = r.badgeColor || r.color || "#003190";
                                const count = (r.mandals || []).length;
                                const isSel = mandalFilterRegion === (r.id || `reg-${rIdx}`);
                                return (
                                  <button
                                    key={r.id || rIdx}
                                    type="button"
                                    onClick={() => setMandalFilterRegion(r.id || `reg-${rIdx}`)}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 6,
                                      padding: "5px 12px",
                                      borderRadius: 20,
                                      fontSize: "0.76rem",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      background: isSel ? `${rColor}25` : "#141820",
                                      color: isSel ? "#ffffff" : "#94a3b8",
                                      border: `1px solid ${isSel ? rColor : "#2a3148"}`
                                    }}
                                  >
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: rColor }} />
                                    {r.shortName || r.name} ({count})
                                  </button>
                                );
                              })}
                            </div>

                            <div style={{ position: "relative", minWidth: 0, flex: "1 1 180px", width: "100%" }}>
                              <FaSearch size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                              <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: 30, fontSize: "0.78rem", height: 32 }}
                                placeholder="Filter mandals by name, ITDA, river..."
                                value={mandalSearchQuery}
                                onChange={(e) => setMandalSearchQuery(e.target.value)}
                              />
                              {mandalSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setMandalSearchQuery("")}
                                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8892a4", cursor: "pointer", fontSize: "0.75rem" }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>

                          {/* DEDICATED ADD NEW MANDAL STATION INPUT FORM */}
                          {showAddMandalForm && (
                            <div
                              style={{
                                background: "#05070a",
                                border: "2px solid #10b981",
                                borderRadius: 12,
                                padding: 20,
                                marginBottom: 20,
                                boxShadow: "0 0 24px rgba(16, 185, 129, 0.18)"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #1e2436", paddingBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#10b981", fontWeight: 700, fontSize: "0.98rem" }}>
                                  <FaMapMarkerAlt size={16} />
                                  <span>Add New Field Mandal Station Pin</span>
                                  <span style={{ fontSize: "0.7rem", background: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: 12, color: "#10b981", fontWeight: 700 }}>
                                    Active Form
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowAddMandalForm(false)}
                                  className="btn-secondary"
                                  style={{ padding: "4px 10px", fontSize: "0.75rem", color: "#94a3b8" }}
                                  title="Close form"
                                >
                                  <FaTimes size={11} /> Cancel
                                </button>
                              </div>

                              <div className="form-row-2col">
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>
                                    Full Station Name <span style={{ color: "#ff7675" }}>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={newMandalData.fullName}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nextNum = (curRegions[newMandalData.regIdx]?.mandals || []).length + 1;
                                      setNewMandalData({
                                        ...newMandalData,
                                        fullName: val,
                                        name: newMandalData.name || `${nextNum}. ${val.replace(/ Mandal$/i, "")}`
                                      });
                                    }}
                                    placeholder="e.g. Rampachodavaram Mandal"
                                    autoFocus
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>
                                    Short / Map Pin Label <span style={{ color: "#ff7675" }}>*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={newMandalData.name}
                                    onChange={(e) => setNewMandalData({ ...newMandalData, name: e.target.value })}
                                    placeholder="e.g. 7. Rampachodavaram"
                                  />
                                </div>
                              </div>

                              <div className="form-row-2col">
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>
                                    Territory Belt / District <span style={{ color: "#ff7675" }}>*</span>
                                  </label>
                                  <select
                                    className="form-input"
                                    value={newMandalData.regIdx}
                                    onChange={(e) => {
                                      const idx = parseInt(e.target.value, 10);
                                      const selReg = curRegions[idx];
                                      const nextNum = (selReg?.mandals || []).length + 1;
                                      setNewMandalData({
                                        ...newMandalData,
                                        regIdx: idx,
                                        name: `${nextNum}. New Mandal`,
                                        fullName: `New Mandal Station ${nextNum}`,
                                        itda: Array.isArray(selReg?.itda) ? selReg.itda[0] || "" : (selReg?.itda || ""),
                                        lat: selReg?.center ? selReg.center[0] : 17.5,
                                        lng: selReg?.center ? selReg.center[1] : 81.5
                                      });
                                    }}
                                  >
                                    {curRegions.map((r, rI) => (
                                      <option key={r.id || rI} value={rI}>
                                        {r.name} ({r.shortName || r.name}) — {(r.mandals || []).length} current pins
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>ITDA Division</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={newMandalData.itda}
                                    onChange={(e) => setNewMandalData({ ...newMandalData, itda: e.target.value })}
                                    placeholder="e.g. Rampachodavaram ITDA"
                                  />
                                </div>
                              </div>

                              <div className="form-row-2col">
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>River Basin / Geography</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={newMandalData.river}
                                    onChange={(e) => setNewMandalData({ ...newMandalData, river: e.target.value })}
                                    placeholder="e.g. Godavari Gorge Basin"
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>Ground Action Tag</label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={newMandalData.actionTag}
                                    onChange={(e) => setNewMandalData({ ...newMandalData, actionTag: e.target.value })}
                                    placeholder="e.g. Community Mobilization"
                                  />
                                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                                    {[
                                      "Community Mobilization",
                                      "Legal Defense & RoFR",
                                      "PESA Gram Sabha",
                                      "Disaster Risk Reduction",
                                      "Women Fisheries Federation"
                                    ].map((tag) => (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setNewMandalData({ ...newMandalData, actionTag: tag })}
                                        style={{
                                          fontSize: "0.68rem",
                                          padding: "2px 8px",
                                          borderRadius: 12,
                                          cursor: "pointer",
                                          background: newMandalData.actionTag === tag ? "#10b98125" : "#141820",
                                          color: newMandalData.actionTag === tag ? "#10b981" : "#94a3b8",
                                          border: `1px solid ${newMandalData.actionTag === tag ? "#10b981" : "#2a3148"}`
                                        }}
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="form-row-2col">
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>Latitude (GPS Coordinates)</label>
                                  <input
                                    type="number"
                                    step="0.0001"
                                    className="form-input"
                                    value={newMandalData.lat}
                                    onChange={(e) => setNewMandalData({ ...newMandalData, lat: parseFloat(e.target.value) || 0 })}
                                    placeholder="17.450"
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                  <label className="form-label" style={{ fontSize: "0.74rem" }}>Longitude (GPS Coordinates)</label>
                                  <input
                                    type="number"
                                    step="0.0001"
                                    className="form-input"
                                    value={newMandalData.lng}
                                    onChange={(e) => setNewMandalData({ ...newMandalData, lng: parseFloat(e.target.value) || 0 })}
                                    placeholder="81.770"
                                  />
                                </div>
                              </div>

                              <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label" style={{ fontSize: "0.74rem" }}>Field Activities &amp; Legal Interventions</label>
                                <textarea
                                  rows={2}
                                  className="form-textarea"
                                  value={newMandalData.activities}
                                  onChange={(e) => setNewMandalData({ ...newMandalData, activities: e.target.value })}
                                  placeholder="Describe PESA Gram Sabha legal empowerment, RoFR claim facilitation, relief operations..."
                                />
                              </div>

                              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => setShowAddMandalForm(false)}
                                  className="btn-secondary"
                                  style={{ padding: "8px 16px", fontSize: "0.82rem" }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveNewMandal}
                                  className="btn-primary"
                                  style={{
                                    padding: "8px 22px",
                                    fontSize: "0.82rem",
                                    background: "#10b981",
                                    borderColor: "#10b981",
                                    color: "#ffffff",
                                    fontWeight: 700,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    cursor: "pointer"
                                  }}
                                >
                                  <FaPlus size={11} /> Save &amp; Add Mandal Station
                                </button>
                              </div>
                            </div>
                          )}

                          {displayedFieldMandals.length === 0 && (
                            <div style={{ textAlign: "center", padding: 30, color: "#8892a4", border: "1px dashed #2a3148", borderRadius: 10 }}>
                              No mandal stations matched "{mandalSearchQuery}". Try clearing your search query.
                            </div>
                          )}

                          {/* MANDAL STATIONS GRID */}
                          <div
                            className="adm-mandals-grid"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                              gap: 16,
                              alignItems: "start"
                            }}
                          >
                            {displayedFieldMandals.map((mandal) => {
                              const regColor = mandal.regionBadgeColor || "#10b981";
                              const pinColor = mandal.pinColor || regColor;
                              const actionTag = mandal.actionTag || "Community Mobilization";
                              const mandalKey = mandal.key || mandal.id || `${mandal.regIdx}-${mandal.mandalIdx}`;
                              const isEditing = Boolean(expandedMandals[mandalKey]);

                              return (
                                <div
                                  key={mandalKey}
                                  className={`adm-mandal-card ${isEditing ? "is-editing" : ""}`}
                                  style={{
                                    background: isEditing ? "#0b0f19" : "#080b11",
                                    border: isEditing ? "2px solid #38bdf8" : `1px solid ${regColor}35`,
                                    borderLeft: `5px solid ${isEditing ? "#38bdf8" : pinColor}`,
                                    borderRadius: 12,
                                    padding: 16,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-start",
                                    gap: 12,
                                    alignSelf: "start",
                                    boxShadow: isEditing ? "0 4px 20px rgba(56, 189, 248, 0.2)" : "none",
                                    transition: "all 0.2s ease"
                                  }}
                                >
                                  {/* Station Header */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: pinColor, background: `${pinColor}15`, padding: "2px 7px", borderRadius: 4 }}>
                                        #{mandal.mandalIdx + 1}
                                      </span>
                                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 6 }}>
                                        <FaMapMarkerAlt style={{ color: pinColor, fontSize: "0.85rem" }} />
                                        {mandal.fullName || mandal.name}
                                      </h4>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <span style={{ fontSize: "0.68rem", color: regColor, background: `${regColor}15`, border: `1px solid ${regColor}40`, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                                        {mandal.regionShortName}
                                      </span>

                                      {/* EDIT BUTTON */}
                                      <button
                                        type="button"
                                        onClick={() => toggleMandalExpand(mandalKey)}
                                        className="btn-secondary"
                                        style={{
                                          padding: "3px 8px",
                                          fontSize: "0.68rem",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          color: isEditing ? "#10b981" : "#38bdf8",
                                          borderColor: isEditing ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)",
                                          background: isEditing ? "rgba(16, 185, 129, 0.1)" : "rgba(56, 189, 248, 0.08)",
                                          fontWeight: 700,
                                          cursor: "pointer"
                                        }}
                                        title={isEditing ? "Close editor / view card" : "Edit station details"}
                                      >
                                        <FaEdit size={10} /> {isEditing ? "Done" : "Edit"}
                                      </button>

                                      {/* MOVE UP */}
                                      <button
                                        type="button"
                                        onClick={() => handleMoveMandalInRegion(mandal.regIdx, mandal.mandalIdx, -1)}
                                        disabled={mandal.mandalIdx === 0}
                                        className="btn-secondary"
                                        style={{ padding: "3px 6px", fontSize: "0.68rem", opacity: mandal.mandalIdx === 0 ? 0.3 : 1 }}
                                        title="Move station up"
                                      >
                                        <FaArrowUp size={9} />
                                      </button>

                                      {/* MOVE DOWN */}
                                      <button
                                        type="button"
                                        onClick={() => handleMoveMandalInRegion(mandal.regIdx, mandal.mandalIdx, 1)}
                                        disabled={mandal.mandalIdx === (curRegions[mandal.regIdx]?.mandals || []).length - 1}
                                        className="btn-secondary"
                                        style={{ padding: "3px 6px", fontSize: "0.68rem", opacity: mandal.mandalIdx === (curRegions[mandal.regIdx]?.mandals || []).length - 1 ? 0.3 : 1 }}
                                        title="Move station down"
                                      >
                                        <FaArrowDown size={9} />
                                      </button>

                                      {/* DELETE */}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMandalFromRegion(mandal.regIdx, mandal.mandalIdx)}
                                        className="btn-secondary"
                                        style={{ padding: "3px 6px", fontSize: "0.68rem", color: "#ff7675" }}
                                        title="Delete mandal station"
                                      >
                                        <FaTrash size={9} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* IF EDITING: SHOW CLEAN RESPONSIVE FORM */}
                                  {isEditing ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.74rem", fontWeight: 700, color: "#cbd5e1" }}>
                                            Full Station Name
                                          </label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={mandal.fullName || ""}
                                            onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "fullName", e.target.value)}
                                            placeholder="e.g. Chinturu Mandal"
                                            style={{ fontSize: "0.82rem" }}
                                          />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.74rem", fontWeight: 700, color: "#cbd5e1" }}>
                                            Short / Map Label
                                          </label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={mandal.name || ""}
                                            onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "name", e.target.value)}
                                            placeholder="e.g. 1. Chinturu"
                                            style={{ fontSize: "0.82rem" }}
                                          />
                                        </div>
                                      </div>

                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.74rem", fontWeight: 700, color: "#cbd5e1" }}>
                                            ITDA Division
                                          </label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={mandal.itda || ""}
                                            onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "itda", e.target.value)}
                                            placeholder="e.g. Chinturu ITDA"
                                            style={{ fontSize: "0.82rem" }}
                                          />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.74rem", fontWeight: 700, color: "#cbd5e1" }}>
                                            River Basin / Geography
                                          </label>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={mandal.river || ""}
                                            onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "river", e.target.value)}
                                            placeholder="e.g. Sabari & Godavari Basin"
                                            style={{ fontSize: "0.82rem" }}
                                          />
                                        </div>
                                      </div>

                                      {/* Ground Action Tag with clickable presets */}
                                      <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: "0.74rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <span style={{ fontWeight: 700, color: "#cbd5e1" }}>Ground Action Tag / Category</span>
                                          <span style={{ fontSize: "0.68rem", color: "#8892a4" }}>Shown on card bottom</span>
                                        </label>
                                        <input
                                          type="text"
                                          className="form-input"
                                          value={mandal.actionTag || "Community Mobilization"}
                                          onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "actionTag", e.target.value)}
                                          placeholder="e.g. Community Mobilization"
                                          style={{ fontSize: "0.82rem" }}
                                        />
                                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                                          {[
                                            "Community Mobilization",
                                            "Legal Defense & RoFR",
                                            "PESA Gram Sabha",
                                            "Disaster Risk Reduction",
                                            "Women Fisheries Federation"
                                          ].map((tag) => (
                                            <button
                                              key={tag}
                                              type="button"
                                              onClick={() => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "actionTag", tag)}
                                              style={{
                                                fontSize: "0.66rem",
                                                padding: "2px 8px",
                                                borderRadius: 12,
                                                cursor: "pointer",
                                                background: (mandal.actionTag || "Community Mobilization") === tag ? `${pinColor}25` : "#141820",
                                                color: (mandal.actionTag || "Community Mobilization") === tag ? pinColor : "#94a3b8",
                                                border: `1px solid ${(mandal.actionTag || "Community Mobilization") === tag ? pinColor : "#2a3148"}`
                                              }}
                                            >
                                              {tag}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Assigned Territory & Coordinates */}
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#cbd5e1" }}>
                                            Territory Belt
                                          </label>
                                          <select
                                            className="form-input"
                                            value={mandal.regIdx}
                                            onChange={(e) => handleReassignMandalTerritory(mandal.regIdx, mandal.mandalIdx, parseInt(e.target.value, 10))}
                                            style={{ fontSize: "0.78rem", padding: "6px 8px" }}
                                          >
                                            {curRegions.map((t, tI) => (
                                              <option key={t.id || tI} value={tI}>
                                                {t.shortName || t.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#cbd5e1" }}>
                                            Latitude
                                          </label>
                                          <input
                                            type="number"
                                            step="0.0001"
                                            className="form-input"
                                            style={{ fontSize: "0.78rem", padding: "6px 8px" }}
                                            value={mandal.lat ?? ""}
                                            onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "lat", parseFloat(e.target.value) || 0)}
                                            placeholder="17.747"
                                          />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                          <label className="form-label" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#cbd5e1" }}>
                                            Longitude
                                          </label>
                                          <input
                                            type="number"
                                            step="0.0001"
                                            className="form-input"
                                            style={{ fontSize: "0.78rem", padding: "6px 8px" }}
                                            value={mandal.lng ?? ""}
                                            onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "lng", parseFloat(e.target.value) || 0)}
                                            placeholder="81.393"
                                          />
                                        </div>
                                      </div>

                                      {/* Key Activities narrative */}
                                      <div className="form-group" style={{ marginBottom: 4 }}>
                                        <label className="form-label" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#cbd5e1" }}>
                                          Field Activities &amp; Legal Interventions
                                        </label>
                                        <textarea
                                          rows={2}
                                          className="form-textarea"
                                          style={{ fontSize: "0.78rem" }}
                                          value={mandal.activities || ""}
                                          onChange={(e) => handleUpdateMandalInRegion(mandal.regIdx, mandal.mandalIdx, "activities", e.target.value)}
                                          placeholder="Describe legal aid, Gram Sabha empowerment, relief operations..."
                                        />
                                      </div>

                                      {/* Action row below editor */}
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 10, borderTop: "1px solid #1e2436", flexWrap: "wrap", gap: 8 }}>
                                        <button
                                          type="button"
                                          onClick={() => toggleMandalExpand(mandalKey)}
                                          className="btn-secondary"
                                          style={{ padding: "6px 16px", fontSize: "0.78rem", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.12)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, cursor: "pointer" }}
                                        >
                                          <FaCheckCircle size={12} /> Done Editing #{mandal.mandalIdx + 1}
                                        </button>
                                        <span style={{ fontSize: "0.7rem", color: "#8892a4" }}>
                                          Edits live. Click 'Save Area of Operation' below.
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    /* COLLAPSED VIEW: PUBLIC CARD MINI PREVIEW */
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                      <div
                                        style={{
                                          background: "#ffffff",
                                          borderRadius: 10,
                                          padding: "12px 14px",
                                          color: "#0f172a",
                                          border: `1px solid ${pinColor}30`,
                                          borderLeft: `4px solid ${pinColor}`
                                        }}
                                      >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>
                                            {mandal.fullName || mandal.name}
                                          </span>
                                          {mandal.itda && (
                                            <span style={{ fontSize: "0.64rem", background: "#f1f5f9", color: "#475569", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                                              {mandal.itda}
                                            </span>
                                          )}
                                        </div>
                                        {mandal.river && (
                                          <div style={{ fontSize: "0.7rem", color: "#003190", fontWeight: 700, marginBottom: 4 }}>
                                            {mandal.river}
                                          </div>
                                        )}
                                        <div style={{ fontSize: "0.7rem", color: "#475569", lineHeight: 1.45, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                          {mandal.activities || "Fieldwork activities description..."}
                                        </div>
                                        <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.68rem" }}>
                                          <span style={{ color: pinColor, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                            <FaCheckCircle size={9} /> {actionTag}
                                          </span>
                                          <span style={{ color: "#003190", fontWeight: 700 }}>
                                            Highlight on Map →
                                          </span>
                                        </div>
                                      </div>

                                      {/* Footer status & button */}
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: 6 }}>
                                        <div style={{ fontSize: "0.7rem", color: "#8892a4", display: "flex", alignItems: "center", gap: 6 }}>
                                          <span>📍 {Number(mandal.lat || 0).toFixed(3)}°, {Number(mandal.lng || 0).toFixed(3)}°</span>
                                          <span>•</span>
                                          <span style={{ color: "#cbd5e1" }}>{mandal.river || "River Basin"}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => toggleMandalExpand(mandalKey)}
                                          className="btn-secondary"
                                          style={{ padding: "4px 10px", fontSize: "0.72rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 700, cursor: "pointer" }}
                                          title="Open editor for this station"
                                        >
                                          <FaEdit size={10} /> Edit Station Details →
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="abt-form-actions">
                  <button type="submit" disabled={loading} className="btn-primary">
                    <FaSave size={13} /> Save {activeTabMeta.label}
                  </button>
                  <button type="button" onClick={handleResetCurrentPage} className="btn-secondary">
                    Reset to Defaults
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

          {/* ── RIGHT / STICKY PREVIEW COLUMN ── */}
          <div className="test-grid-side">
            <div className="adm-card-panel sticky-preview">
              <h2>
                <FaEye style={{ color: "#2ecc71" }} />
                Live Preview
              </h2>

              <div style={{ fontSize: "0.75rem", color: "#8892a4", marginBottom: 14 }}>
                Header &amp; hero preview for <strong>{activeTabMeta.label}</strong>:
              </div>

              {/* Live Preview Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f4f7fe 100%)",
                  borderRadius: 14,
                  padding: "26px 20px",
                  color: "#1e293b",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  marginBottom: 18,
                  overflow: "hidden",
                  wordBreak: "break-word"
                }}
              >
                {pageBadge && (
                  <span
                    style={{
                      display: "inline-block",
                      marginBottom: 10,
                      padding: "4px 14px",
                      borderRadius: 20,
                      background: "rgba(210,25,12,0.08)",
                      color: "#D2190C",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 0.8
                    }}
                  >
                    {pageBadge}
                  </span>
                )}
                <h3 style={{ margin: "0 0 10px", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                  {pageTitle || activeTabMeta.label}
                </h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>
                  {pageSubtitle || "Section description appears here on the live public website..."}
                </p>

                {activeTab === "about" && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "left" }}>
                    <div style={{ background: "#ffffff", border: "1px solid rgba(210, 25, 12, 0.2)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                      {pageContent.hero_image && (
                        <div style={{ height: 110, width: "100%", overflow: "hidden", position: "relative" }}>
                          <img
                            src={pageContent.hero_image}
                            alt="About Hero"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                          <span style={{ position: "absolute", top: 6, left: 6, fontSize: "0.62rem", fontWeight: 800, color: "#D2190C", background: "rgba(255,255,255,0.92)", padding: "2px 8px", borderRadius: 10 }}>
                            {pageContent.est_badge || "Est. 2004"}
                          </span>
                        </div>
                      )}
                      <div style={{ padding: 12 }}>
                        {!pageContent.hero_image && (
                          <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#D2190C", textTransform: "uppercase" }}>
                            {pageContent.est_badge || "Est. 2004"}
                          </span>
                        )}
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a", marginTop: 2 }}>
                          {pageContent.org_heading || "Association for Land and Livelihood..."}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 6, lineHeight: 1.5, maxHeight: 72, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {pageContent.p1 || "ALERT was established in 2004..."}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.72rem" }}>
                      <span style={{ background: "rgba(46, 204, 113, 0.15)", color: "#27ae60", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        👥 {(pageContent.board_members || []).length} Board Members
                      </span>
                      <span style={{ background: "rgba(236, 72, 153, 0.15)", color: "#ec4899", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        🏆 {(pageContent.milestones || []).length} Milestones
                      </span>
                      <span style={{ background: "rgba(245, 160, 0, 0.15)", color: "#d35400", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        📊 {(pageContent.timeline_metrics || []).length} Metrics
                      </span>
                      {pageContent.profile_pdf && (
                        <span style={{ background: "rgba(52, 152, 219, 0.15)", color: "#2980b9", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          📄 Profile PDF
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "vision-mission" && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "left" }}>
                    {/* Vision card preview */}
                    <div style={{ background: "#ffffff", border: "1px solid rgba(210, 25, 12, 0.2)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                      {pageContent.vision?.image && (
                        <div style={{ height: 90, width: "100%", overflow: "hidden", position: "relative" }}>
                          <img
                            src={pageContent.vision.image}
                            alt="Vision banner"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                          <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#D2190C", background: "rgba(255,255,255,0.92)", padding: "2px 8px", borderRadius: 10 }}>
                              {pageContent.vision?.tag || "OUR VISION"}
                            </span>
                            {(pageContent.vision?.subtitle || pageContent.vision?.direction) && (
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#ffffff", background: "#D2190C", padding: "2px 6px", borderRadius: 10 }}>
                                {pageContent.vision.subtitle || pageContent.vision.direction}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div style={{ padding: 12 }}>
                        {!pageContent.vision?.image && (
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#D2190C", textTransform: "uppercase" }}>
                              {pageContent.vision?.tag || "OUR VISION"}
                            </span>
                            {(pageContent.vision?.subtitle || pageContent.vision?.direction) && (
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b" }}>
                                • {pageContent.vision.subtitle || pageContent.vision.direction}
                              </span>
                            )}
                          </div>
                        )}
                        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#D2190C", textTransform: "uppercase", letterSpacing: 1 }}>
                          {pageContent.vision?.statement_label || "Vision Statement"}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a", marginTop: 2 }}>
                          {pageContent.vision?.title || "Our Vision"}
                        </div>
                        <div style={{ fontStyle: "italic", fontSize: "0.78rem", color: "#64748b", marginTop: 4, padding: "6px 8px", background: "rgba(210, 25, 12, 0.05)", borderLeft: "2px solid #D2190C", borderRadius: 4 }}>
                          "{pageContent.vision?.quote || "An egalitarian society where tribal and marginalized communities live with sovereign dignity..."}"
                        </div>
                        {(pageContent.vision?.points || []).length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                            {(pageContent.vision?.points || []).map((p, i) => {
                              const label = typeof p === "object" && p !== null ? (p.title || p.name || "") : String(p);
                              if (!label) return null;
                              return (
                                <div key={i} style={{ fontSize: "0.68rem", color: "#1e293b", display: "flex", alignItems: "flex-start", gap: 6 }}>
                                  <span style={{ color: "#D2190C", fontWeight: 800, fontSize: "0.7rem", flexShrink: 0 }}>✓</span>
                                  <span style={{ lineHeight: 1.35 }}>{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mission card preview */}
                    <div style={{ background: "#ffffff", border: "1px solid rgba(0, 49, 144, 0.2)", borderRadius: 10, overflow: "hidden" }}>
                      {pageContent.mission?.image && (
                        <div style={{ height: 90, width: "100%", overflow: "hidden", position: "relative" }}>
                          <img
                            src={pageContent.mission.image}
                            alt="Mission banner"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                          <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#003190", background: "rgba(255,255,255,0.92)", padding: "2px 8px", borderRadius: 10 }}>
                              {pageContent.mission?.tag || "OUR MISSION"}
                            </span>
                            {(pageContent.mission?.subtitle || pageContent.mission?.mandate) && (
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#ffffff", background: "#003190", padding: "2px 6px", borderRadius: 10 }}>
                                {pageContent.mission.subtitle || pageContent.mission.mandate}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div style={{ padding: 12 }}>
                        {!pageContent.mission?.image && (
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#003190", textTransform: "uppercase" }}>
                              {pageContent.mission?.tag || "OUR MISSION"}
                            </span>
                            {(pageContent.mission?.subtitle || pageContent.mission?.mandate) && (
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#64748b" }}>
                                • {pageContent.mission.subtitle || pageContent.mission.mandate}
                              </span>
                            )}
                          </div>
                        )}
                        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#003190", textTransform: "uppercase", letterSpacing: 1 }}>
                          {pageContent.mission?.statement_label || "Mission Statement"}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a", marginTop: 2 }}>
                          {pageContent.mission?.title || "Our Mission"}
                        </div>
                        <div style={{ fontStyle: "italic", fontSize: "0.78rem", color: "#64748b", marginTop: 4, padding: "6px 8px", background: "rgba(0, 49, 144, 0.05)", borderLeft: "2px solid #003190", borderRadius: 4 }}>
                          "{pageContent.mission?.quote || "Mobilizing communities, defending constitutional land tenure..."}"
                        </div>
                        {(pageContent.mission?.pillars || []).length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                            {(pageContent.mission?.pillars || []).map((p, i) => {
                              const label = typeof p === "object" && p !== null ? (p.title || p.name || "") : String(p);
                              if (!label) return null;
                              return (
                                <div key={i} style={{ fontSize: "0.68rem", color: "#1e293b", display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", background: "rgba(0,49,144,0.05)", borderRadius: 4 }}>
                                  <span style={{ color: "#003190", fontWeight: 800, fontSize: "0.7rem", flexShrink: 0 }}>✓</span>
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "core-values" && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "left", width: "100%", overflow: "hidden" }}>
                    {pageBanner && (
                      <div style={{ height: 80, width: "100%", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                        <img src={pageBanner} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Core Values Cards</span>
                        <span style={{ background: "rgba(210,25,12,0.1)", color: "#D2190C", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {(pageContent.values || []).length}
                        </span>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, width: "100%" }}>
                        {(pageContent.values || []).slice(0, 6).map((v, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#ffffff",
                              border: `1px solid ${v.accent || "#D2190C"}35`,
                              borderLeft: `3px solid ${v.accent || "#D2190C"}`,
                              borderRadius: 6,
                              padding: "6px 8px",
                              minWidth: 0,
                              overflow: "hidden"
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: "0.74rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {v.title || `Value #${i+1}`}
                            </div>
                            <div style={{ fontSize: "0.64rem", color: "#64748b", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                              "{v.quote || ""}"
                            </div>
                          </div>
                        ))}
                      </div>
                      {(pageContent.values || []).length > 6 && (
                        <div style={{ fontSize: "0.68rem", color: "#8892a4", marginTop: 6, textAlign: "center" }}>
                          +{(pageContent.values || []).length - 6} more values
                        </div>
                      )}
                    </div>

                    {/* Manifesto preview */}
                    <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #0E2B66 100%)", borderRadius: 8, padding: 12, color: "#fff", width: "100%", overflow: "hidden", boxSizing: "border-box" }}>
                      <span style={{ color: "#F5A000", fontWeight: 800, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
                        {pageContent.manifesto_badge || "Our Manifesto"}
                      </span>
                      <div style={{ fontWeight: 800, fontSize: "0.82rem", marginTop: 2 }}>
                        {pageContent.manifesto_title || "Values in Action"}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.8)", marginTop: 4, lineHeight: 1.4, maxHeight: 44, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {pageContent.manifesto_desc || ""}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "organizational-profile" && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "left", width: "100%", overflow: "hidden" }}>
                    {pageBanner && (
                      <div style={{ height: 80, width: "100%", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                        <img src={pageBanner} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Key Info Cards</span>
                        <span style={{ background: "rgba(0,49,144,0.1)", color: "#003190", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {(pageContent.info_cards || []).length}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, width: "100%" }}>
                        {(pageContent.info_cards || []).slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#ffffff",
                              border: `1px solid ${c.color || "#003190"}30`,
                              borderTop: `3px solid ${c.color || "#003190"}`,
                              borderRadius: 6,
                              padding: "6px 8px",
                              minWidth: 0,
                              overflow: "hidden"
                            }}
                          >
                            <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.title}
                            </div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {pageContent.field_image && (
                      <div style={{ height: 85, width: "100%", borderRadius: 8, overflow: "hidden", position: "relative", marginBottom: 12 }}>
                        <img src={pageContent.field_image} alt="Field Operations" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.7)", padding: "4px 8px" }}>
                          <div style={{ color: "#F5A000", fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase" }}>
                            {pageContent.field_tag || "Field Operations"}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.72rem" }}>
                      <span style={{ background: "rgba(210,25,12,0.1)", color: "#D2190C", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        🏛️ {(pageContent.accreditations_cards || []).length} Accreditations
                      </span>
                      {pageContent.profile_pdf && (
                        <span style={{ background: "rgba(52,152,219,0.1)", color: "#2980b9", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          📄 Official PDF
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "organogram" && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "left", width: "100%", overflow: "hidden" }}>
                    {pageBanner && (
                      <div style={{ height: 80, width: "100%", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                        <img src={pageBanner} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    {pageContent.chart_image && (
                      <div style={{ height: 100, width: "100%", borderRadius: 8, overflow: "hidden", position: "relative", marginBottom: 12, background: "#f8fafc", border: "1px solid #cbd5e1" }}>
                        <img src={pageContent.chart_image} alt="Chart" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(15,23,42,0.85)", padding: "3px 8px" }}>
                          <div style={{ color: "#38bdf8", fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {pageContent.chart_badge || "Governance Chart"}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Governance Tiers</span>
                        <span style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {(pageContent.levels || []).length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                        {(pageContent.levels || []).slice(0, 5).map((lvl, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#ffffff",
                              border: `1px solid ${lvl.accent || "#003190"}30`,
                              borderLeft: `3px solid ${lvl.accent || "#003190"}`,
                              borderRadius: 6,
                              padding: "5px 8px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              minWidth: 0,
                              overflow: "hidden"
                            }}
                          >
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {lvl.title || `Level ${i + 1}`}
                            </span>
                            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: lvl.accent || "#003190", textTransform: "uppercase", flexShrink: 0 }}>
                              {lvl.level || `L0${i + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                      {(pageContent.levels || []).length > 5 && (
                        <div style={{ fontSize: "0.68rem", color: "#8892a4", marginTop: 4, textAlign: "center" }}>
                          +{(pageContent.levels || []).length - 5} more tiers
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.72rem" }}>
                      {pageContent.chart_image && (
                        <span style={{ background: "rgba(245,160,0,0.1)", color: "#d97706", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          📊 Interactive Chart
                        </span>
                      )}
                      {pageContent.pdf_file && (
                        <span style={{ background: "rgba(236,72,153,0.1)", color: "#db2777", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          📄 Governance PDF
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "alert-policies" && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "left", width: "100%", overflow: "hidden" }}>
                    {pageBanner && (
                      <div style={{ height: 80, width: "100%", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                        <img src={pageBanner} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Institutional Policies</span>
                        <span style={{ background: "rgba(210,25,12,0.1)", color: "#D2190C", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {(pageContent.policies || []).length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                        {(pageContent.policies || []).slice(0, 5).map((pol, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#ffffff",
                              border: `1px solid ${pol.accent || "#003190"}30`,
                              borderLeft: `3px solid ${pol.accent || "#003190"}`,
                              borderRadius: 6,
                              padding: "6px 8px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              minWidth: 0,
                              overflow: "hidden"
                            }}
                          >
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {pol.title || `Policy #${i + 1}`}
                            </span>
                            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: pol.accent || "#003190", textTransform: "uppercase", flexShrink: 0, marginLeft: 6 }}>
                              {pol.category || "Policy"}
                            </span>
                          </div>
                        ))}
                      </div>
                      {(pageContent.policies || []).length > 5 && (
                        <div style={{ fontSize: "0.68rem", color: "#8892a4", marginTop: 4, textAlign: "center" }}>
                          +{(pageContent.policies || []).length - 5} more policies
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.72rem" }}>
                      <span style={{ background: "rgba(245,160,0,0.1)", color: "#d97706", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        ⭐ {pageContent.commitment_title || "Principles in Practice"}
                      </span>
                      {pageContent.pdf_file && (
                        <span style={{ background: "rgba(236,72,153,0.1)", color: "#db2777", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          📄 Official PDF
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "area-of-operation" && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e2e8f0", textAlign: "left", width: "100%", overflow: "hidden" }}>
                    {pageBanner && (
                      <div style={{ height: 80, width: "100%", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                        <img src={pageBanner} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    {/* Stats strip */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, marginBottom: 12, width: "100%" }}>
                      <div style={{ background: "#ffffff", border: "1px solid #10b98130", borderTop: "3px solid #10b981", borderRadius: 6, padding: "5px 8px", minWidth: 0, overflow: "hidden" }}>
                        <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Mandals</div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {pageContent.mandals_count || "17"}
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", border: "1px solid #00319030", borderTop: "3px solid #003190", borderRadius: 6, padding: "5px 8px", minWidth: 0, overflow: "hidden" }}>
                        <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Habitations</div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {pageContent.habitations_count || "371+"}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Operational Belts</span>
                        <span style={{ background: "rgba(16,185,129,0.1)", color: "#059669", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {(pageContent.regions || []).length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                        {(pageContent.regions || []).slice(0, 4).map((reg, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#ffffff",
                              border: `1px solid ${reg.color || "#003190"}30`,
                              borderLeft: `3px solid ${reg.color || "#003190"}`,
                              borderRadius: 6,
                              padding: "5px 8px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              minWidth: 0,
                              overflow: "hidden"
                            }}
                          >
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {reg.name || `Territory #${i + 1}`}
                            </span>
                            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: reg.color || "#003190", textTransform: "uppercase", flexShrink: 0, marginLeft: 6 }}>
                              {reg.mandals || "Zone"}
                            </span>
                          </div>
                        ))}
                      </div>
                      {(pageContent.regions || []).length > 4 && (
                        <div style={{ fontSize: "0.68rem", color: "#8892a4", marginTop: 4, textAlign: "center" }}>
                          +{(pageContent.regions || []).length - 4} more territories
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.72rem" }}>
                      <span style={{ background: "rgba(16,185,129,0.1)", color: "#059669", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        🗺️ Interactive Leaflet Map
                      </span>
                      {pageContent.tribes_count && (
                        <span style={{ background: "rgba(245,160,0,0.1)", color: "#d97706", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          👥 {pageContent.tribes_count}
                        </span>
                      )}
                    </div>

                    {/* Map Territories & Pins strip */}
                    {Array.isArray(pageContent.map_regions) && pageContent.map_regions.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #e2e8f0" }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                          <span>Map Color Palette</span>
                          <span style={{ color: "#059669", fontWeight: 700 }}>
                            {pageContent.map_regions.reduce((acc, r) => acc + (r.mandals || []).length, 0)} Total Pins
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {pageContent.map_regions.map((mr, idx) => {
                            const c = mr.badgeColor || mr.color || "#003190";
                            return (
                              <span
                                key={idx}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  background: `${c}15`,
                                  color: c,
                                  border: `1px solid ${c}40`,
                                  padding: "2px 6px",
                                  borderRadius: 12
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                                {mr.shortName || mr.name || `T${idx + 1}`} ({(mr.mandals || []).length})
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick links box */}
              <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 10, padding: 14, fontSize: "0.75rem", color: "#8892a4", lineHeight: 1.6 }}>
                <strong style={{ color: "#fff", display: "block", marginBottom: 6 }}>🔗 Navigation &amp; Live Link:</strong>
                Live Path: <code style={{ color: "#f39c12" }}>{activeTabMeta.path}</code><br />
                Changes saved here immediately update the website without manual browser refresh.<br />
                <a
                  href={activeTabMeta.path}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#3498db",
                    fontWeight: 700,
                    marginTop: 8,
                    textDecoration: "none"
                  }}
                >
                  <FaExternalLinkAlt size={10} /> Open {activeTabMeta.label} in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
