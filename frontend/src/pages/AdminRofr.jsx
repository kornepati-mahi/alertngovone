import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaTree, FaBalanceScale, FaFilePdf, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaCloudUploadAlt, FaFolderOpen,
  FaEye, FaSave, FaExternalLinkAlt, FaInfoCircle, FaSearch,
  FaTable, FaImages, FaDownload, FaCalendarAlt, FaFileAlt,
  FaCheckCircle, FaUndo, FaSlidersH, FaLayerGroup, FaVideo,
  FaPlay, FaYoutube, FaMapMarkedAlt, FaLink, FaGavel, FaClock
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  fetchRofrPages,
  defaultRofrPages,
  adminListRofrPages,
  adminCreateRofrPage,
  adminUpdateRofrPage,
  adminDeleteRofrPage,
  adminSaveRofrContent,
  adminCreateAllSitePage,
  adminUploadImage,
  adminUploadVideo
} from "../api/client";
import {
  DEFAULT_STATS_BY_SLUG,
  STAT_ICON_OPTIONS,
  STAT_COLOR_OPTIONS,
  renderStatIcon
} from "../utils/statIcons";

const KEY_STORAGE = "alertngo_admin_key";
const ROFR_CACHE_KEY = "alertngo_rofr_pages_cache";

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : url;
}

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/i.test(url || "");
}

function normalizePage(p) {
  if (!p) return p;
  const c = p.content || {};
  const downloads = Array.isArray(p.downloads) && p.downloads.length > 0 ? p.downloads : (Array.isArray(c.downloads) ? c.downloads : []);
  const tables = Array.isArray(p.tables) && p.tables.length > 0 ? p.tables : (Array.isArray(c.tables) ? c.tables : []);
  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : (Array.isArray(c.images) ? c.images : []);
  const videos = Array.isArray(p.videos) && p.videos.length > 0 ? p.videos : (Array.isArray(c.videos) ? c.videos : []);
  const paragraphs = Array.isArray(p.paragraphs) && p.paragraphs.length > 0 ? p.paragraphs : (Array.isArray(c.paragraphs) ? c.paragraphs : []);
  const stats = Array.isArray(p.stats) && p.stats.length > 0
    ? p.stats
    : (Array.isArray(c.stats) && c.stats.length > 0
        ? c.stats
        : (DEFAULT_STATS_BY_SLUG[p.slug] || []));

  const normalizedImages = images.map((img) => ({
    src: img.src || img.url || "",
    url: img.url || img.src || "",
    name: img.name || img.caption || img.alt || "Official Map / Media",
    alt: img.alt || img.name || "Official Map / Media",
    caption: img.caption || img.name || ""
  }));

  const contentObj = {
    slug: p.slug,
    title: p.title || p.nav_label,
    nav_label: p.nav_label || p.title,
    category: p.category || "RoFR & LTR",
    badge: p.badge || "RoFR & LTR Project",
    subtitle: p.subtitle || "",
    downloads,
    tables,
    images: normalizedImages,
    videos,
    paragraphs,
    stats
  };

  return {
    ...p,
    downloads,
    tables,
    images: normalizedImages,
    videos,
    paragraphs,
    stats,
    downloads_count: downloads.length,
    tables_count: tables.length,
    images_count: normalizedImages.length,
    videos_count: videos.length,
    stats_count: stats.length,
    content: contentObj
  };
}

export default function AdminRofr() {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySlug = searchParams.get("slug") || searchParams.get("page");
  const [adminKey, setAdminKey] = useState(
    () =>
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY_STORAGE) : "") ||
      (typeof localStorage !== "undefined" ? localStorage.getItem(KEY_STORAGE) : "") ||
      "alertngo@123"
  );
  const [pages, setPages] = useState(() => {
    try {
      const cached = localStorage.getItem(ROFR_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizePage);
      }
    } catch {}
    return (defaultRofrPages || []).map(normalizePage);
  });
  const [selectedSlug, setSelectedSlug] = useState(querySlug || "rofr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "info" });

  useEffect(() => {
    if (querySlug && querySlug !== selectedSlug) {
      setSelectedSlug(querySlug);
    }
  }, [querySlug]);

  // Search & Filter within documents & pages
  const [docSearch, setDocSearch] = useState("");
  const [pageSearch, setPageSearch] = useState("");

  const filteredPages = useMemo(() => {
    if (!pageSearch.trim()) return pages;
    const q = pageSearch.toLowerCase().trim();
    return pages.filter(
      (p) =>
        (p.nav_label && p.nav_label.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q))
    );
  }, [pages, pageSearch]);

  const [selectorView, setSelectorView] = useState("hierarchy"); // "hierarchy" | "pills"

  const getPageParentSlug = useCallback((p) => {
    if (!p) return "";
    return p.parent_slug || "";
  }, []);

  const hierarchicalPages = useMemo(() => {
    const parentMap = {};
    const topPages = [];

    pages.forEach((p) => {
      const pParent = getPageParentSlug(p);
      if (pParent) {
        if (!parentMap[pParent]) parentMap[pParent] = [];
        parentMap[pParent].push(p);
      } else {
        topPages.push(p);
      }
    });

    return { topPages, parentMap };
  }, [pages, getPageParentSlug]);

  const handleOpenAddSubPage = (parentSlug) => {
    setNewPageData({
      slug: "",
      nav_label: "",
      title: "",
      subtitle: "",
      category: "RoFR & LTR",
      parent_slug: parentSlug || "",
      isSlugCustom: false,
      isTitleCustom: false
    });
    setShowAddPageModal(true);
  };

  // Modals & Panels
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showAdvancedNewPage, setShowAdvancedNewPage] = useState(false);
  const [newPageData, setNewPageData] = useState({
    slug: "",
    nav_label: "",
    title: "",
    subtitle: "",
    category: "RoFR & LTR",
    parent_slug: "",
    isSlugCustom: false,
    isTitleCustom: false
  });

  // Uploading State for PDF & URL Add Mode
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadPdfError, setUploadPdfError] = useState("");
  const [stagedDoc, setStagedDoc] = useState(null);
  const pdfInputRef = useRef(null);
  const pillsRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Auto-scroll active pill into view
  useEffect(() => {
    if (pillsRef.current) {
      const activeEl = pillsRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
      }
    }
  }, [selectedSlug]);

  // Add Document Mode: "upload" | "url"
  const [docAddMode, setDocAddMode] = useState("upload");
  const [urlDocData, setUrlDocData] = useState({
    text: "",
    url: "",
    filename: "",
    size: "",
    date: "",
    category: "Official PDF"
  });

  // Edit Document Modal State
  const [editingDocIdx, setEditingDocIdx] = useState(null);
  const [editingDocData, setEditingDocData] = useState(null);
  const editDocFileInputRef = useRef(null);
  const [isEditingDocUploading, setIsEditingDocUploading] = useState(false);
  const [editDocUploadError, setEditDocUploadError] = useState("");

  // Uploading State for Image / Map
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [uploadImgError, setUploadImgError] = useState("");
  const imgInputRef = useRef(null);
  const [showAddImgUrlModal, setShowAddImgUrlModal] = useState(false);
  const [addImgMode, setAddImgMode] = useState("upload"); // "upload" | "url"
  const [newImgUrlData, setNewImgUrlData] = useState({ url: "", name: "", caption: "" });
  const [isAddImgModalUploading, setIsAddImgModalUploading] = useState(false);
  const [addImgModalError, setAddImgModalError] = useState("");
  const addModalFileInputRef = useRef(null);

  // Edit Image Modal State & Replacement Upload in Edit Modal
  const [editingImgIdx, setEditingImgIdx] = useState(null);
  const [editingImgData, setEditingImgData] = useState(null);
  const editImgFileInputRef = useRef(null);
  const [isEditingImgUploading, setIsEditingImgUploading] = useState(false);
  const [editImgUploadError, setEditImgUploadError] = useState("");

  // Videos state & modal
  const [showAddVidModal, setShowAddVidModal] = useState(false);
  const [vidModalMode, setVidModalMode] = useState("upload"); // "upload" | "url"
  const [vidModalData, setVidModalData] = useState({ title: "", description: "", url: "", type: "video" });
  const [selectedVidFile, setSelectedVidFile] = useState(null);
  const [selectedVidPreview, setSelectedVidPreview] = useState("");
  const [editingVidIdx, setEditingVidIdx] = useState(null);
  const [uploadVidError, setUploadVidError] = useState("");
  const [isUploadingVid, setIsUploadingVid] = useState(false);
  const [vidUploadProgress, setVidUploadProgress] = useState({ percent: 0, loaded: 0, total: 0 });
  const [uploadedVidUrl, setUploadedVidUrl] = useState("");
  const uploadVidPromiseRef = useRef(null);
  const vidFileInputRef = useRef(null);
  const [previewingVid, setPreviewingVid] = useState(null);

  const queryTab = searchParams.get("tab") || searchParams.get("section");
  // Active Tab within Page: "stats" | "documents" | "images" | "videos" | "content" | "tables" | "settings"
  const [activeSection, setActiveSection] = useState(queryTab || "stats");

  // Stat Card Editor State
  const [newStatCard, setNewStatCard] = useState({
    num: "",
    label: "",
    icon: "balance",
    color: "#003190"
  });

  // Load Admin Key
  useEffect(() => {
    const stored = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY_STORAGE) : "") || "alertngo@123";
    setAdminKey(stored);
  }, []);

  // Fetch all RoFR pages
  const loadPages = useCallback(async () => {
    setLoading(true);
    let currentLocal = null;
    try {
      const cached = localStorage.getItem(ROFR_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentLocal = parsed.map(normalizePage);
          setPages(currentLocal);
        }
      }
    } catch (_) {}

    try {
      if (adminKey) {
        const res = await adminListRofrPages(adminKey);
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const normalized = res.data.map(normalizePage);
          const dbSlugs = new Set(normalized.map((p) => p.slug));
          const localExtras = (currentLocal || []).filter((p) => !dbSlugs.has(p.slug));
          const merged = [...normalized, ...localExtras];
          setPages(merged);
          try {
            localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(merged));
            window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
          } catch (_) { }
          return;
        }
      }
      const pub = await fetchRofrPages();
      if (pub && pub.source === "api" && Array.isArray(pub.data) && pub.data.length > 0) {
        const normalized = pub.data.map(normalizePage);
        const dbSlugs = new Set(normalized.map((p) => p.slug));
        const localExtras = (currentLocal || []).filter((p) => !dbSlugs.has(p.slug));
        const merged = [...normalized, ...localExtras];
        setPages(merged);
        try {
          localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
        } catch (_) { }
      } else if (!currentLocal && pub && pub.data && Array.isArray(pub.data) && pub.data.length > 0) {
        const normalized = pub.data.map(normalizePage);
        setPages(normalized);
      }
    } catch (err) {
      console.warn("Using local RoFR pages cache:", err);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Selected Page Data
  const currentPageRaw = pages.find((p) => p.slug === selectedSlug) || pages[0] || null;
  const currentPage = currentPageRaw ? normalizePage(currentPageRaw) : null;
  const currentContent = currentPage?.content || {
    slug: currentPage?.slug || "",
    title: currentPage?.title || "",
    category: currentPage?.category || "RoFR & LTR",
    paragraphs: [],
    downloads: [],
    tables: [],
    images: [],
    videos: [],
    stats: []
  };


  const showToast = (text, type = "info") => {
    setStatusMsg({ text, type });
    setTimeout(() => {
      setStatusMsg({ text: "", type: "info" });
    }, 4500);
  };

  // Helper to update current page content locally and immediately sync to frontend
  const updateCurrentContent = (mutator) => {
    if (!currentPage) return;
    const cleanSlug = (currentPage.slug || "").toLowerCase().trim();
    setPages((prev) => {
      const nextPages = prev.map((p) => {
        if (p.slug !== currentPage.slug) return p;
        const norm = normalizePage(p);
        const oldContent = norm.content;
        const newContent = typeof mutator === "function" ? mutator({ ...oldContent }) : { ...oldContent, ...mutator };
        const updatedPage = {
          ...norm,
          downloads: newContent.downloads || [],
          tables: newContent.tables || [],
          images: newContent.images || [],
          videos: newContent.videos || [],
          paragraphs: newContent.paragraphs || [],
          stats: newContent.stats || [],
          downloads_count: (newContent.downloads || []).length,
          tables_count: (newContent.tables || []).length,
          images_count: (newContent.images || []).length,
          videos_count: (newContent.videos || []).length,
          stats_count: (newContent.stats || []).length,
          content: newContent
        };

        // Immediate persistence to alertngo_page_override_${cleanSlug}
        try {
          const fullOverride = {
            ...updatedPage,
            title: updatedPage.title || newContent.title || norm.title,
            nav_label: updatedPage.nav_label || newContent.nav_label || norm.nav_label,
            subtitle: updatedPage.subtitle || newContent.subtitle || norm.subtitle,
            category: updatedPage.category || newContent.category || "RoFR & LTR",
            badge: updatedPage.badge || newContent.badge || "RoFR & LTR",
            stats: updatedPage.stats,
            downloads: updatedPage.downloads,
            images: updatedPage.images,
            videos: updatedPage.videos,
            paragraphs: updatedPage.paragraphs,
            tables: updatedPage.tables
          };
          localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
          window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
        } catch (_) {}

        return updatedPage;
      });

      try {
        localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(nextPages));
        window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
        window.dispatchEvent(new Event("storage"));
      } catch (_) {}

      return nextPages;
    });
  };

  // Save Content to Backend & LocalStorage
  const handleSaveContent = async () => {
    if (!currentPage) return;
    setSaving(true);
    const cleanSlug = (currentPage.slug || "").toLowerCase().trim();
    const fullOverride = {
      ...currentPage,
      content: currentContent,
      downloads: currentContent.downloads || [],
      tables: currentContent.tables || [],
      images: currentContent.images || [],
      videos: currentContent.videos || [],
      paragraphs: currentContent.paragraphs || [],
      stats: currentContent.stats || [],
      title: currentPage.title || currentContent.title,
      nav_label: currentPage.nav_label || currentContent.nav_label,
      category: currentContent.category || currentPage.category || "RoFR & LTR",
      badge: currentContent.badge || currentPage.badge || "RoFR & LTR",
      subtitle: currentContent.subtitle || currentPage.subtitle
    };

    // 1. Immediately persist local page override & cache
    try {
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPages = pages.map((p) => (p.slug === currentPage.slug ? fullOverride : p));
      localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(updatedPages));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      const res = await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: currentContent,
        downloads: currentContent.downloads,
        tables: currentContent.tables,
        images: currentContent.images,
        videos: currentContent.videos,
        paragraphs: currentContent.paragraphs,
        stats: currentContent.stats,
        title: currentPage.title,
        nav_label: currentPage.nav_label,
        category: currentContent.category || "RoFR & LTR"
      });
      if (res && res.success) {
        showToast("Changes saved successfully to database! Live on website.", "success");
      } else {
        showToast("Changes saved locally! Live on website immediately.", "info");
      }
    } catch (err) {
      showToast("Changes saved locally! Live on website immediately.", "info");
    } finally {
      setSaving(false);
    }
  };



  // Stat Card Handlers
  const handleAddStatCard = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newStatCard.num.trim() || !newStatCard.label.trim()) {
      showToast("Please provide both a Number/Value and a Label for the stat card.", "error");
      return;
    }
    const currentStats = Array.isArray(currentContent.stats) ? currentContent.stats : [];
    const updated = [...currentStats, { ...newStatCard }];
    updateCurrentContent((prev) => ({ ...prev, stats: updated }));
    setNewStatCard({ num: "", label: "", icon: "balance", color: "#003190" });
    showToast("Stat card added! Click 'Save All Stat Cards' to commit changes.", "success");
  };

  const handleUpdateStatCard = (index, field, value) => {
    const currentStats = Array.isArray(currentContent.stats) ? [...currentContent.stats] : [];
    if (!currentStats[index]) return;
    currentStats[index] = { ...currentStats[index], [field]: value };
    updateCurrentContent((prev) => ({ ...prev, stats: currentStats }));
  };

  const handleDeleteStatCard = (index) => {
    const currentStats = Array.isArray(currentContent.stats) ? [...currentContent.stats] : [];
    const removed = currentStats.splice(index, 1);
    updateCurrentContent((prev) => ({ ...prev, stats: currentStats }));
    showToast(`Removed card "${removed[0]?.label || ""}". Save to persist.`, "info");
  };

  const handleMoveStatCard = (index, direction) => {
    const currentStats = Array.isArray(currentContent.stats) ? [...currentContent.stats] : [];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentStats.length) return;
    const temp = currentStats[index];
    currentStats[index] = currentStats[targetIdx];
    currentStats[targetIdx] = temp;
    updateCurrentContent((prev) => ({ ...prev, stats: currentStats }));
  };

  const handleResetDefaultStats = () => {
    const def = DEFAULT_STATS_BY_SLUG[currentPage?.slug] || DEFAULT_STATS_BY_SLUG["rofr"] || [];
    updateCurrentContent((prev) => ({ ...prev, stats: [...def] }));
    showToast("Reset to standard default stat cards for this page.", "info");
  };

  const handleQuickAddPreset = (preset) => {
    const currentStats = Array.isArray(currentContent.stats) ? currentContent.stats : [];
    const updated = [...currentStats, { ...preset }];
    updateCurrentContent((prev) => ({ ...prev, stats: updated }));
    showToast(`Added preset card "${preset.label}". Click 'Save All Stat Cards' to commit.`, "success");
  };

  // Save Page Settings (Title, Nav Label, Category, Placement)
  const handleSavePageSettings = async (pageData) => {
    setSaving(true);
    const updated = pages.map((p) => (p.slug === pageData.slug ? { ...p, ...pageData } : p));
    setPages(updated);
    const cleanSlug = pageData.slug.toLowerCase().trim();
    const fullOverride = {
      ...pageData,
      ...currentContent,
      parent_slug: pageData.parent_slug || "",
      title: pageData.title,
      nav_label: pageData.nav_label,
      subtitle: pageData.subtitle || "",
      category: pageData.category || "RoFR & LTR",
      badge: pageData.badge || "RoFR & LTR",
      stats: currentContent.stats || [],
      downloads: currentContent.downloads || [],
      images: currentContent.images || [],
      videos: currentContent.videos || [],
      paragraphs: currentContent.paragraphs || [],
      tables: currentContent.tables || []
    };

    try {
      localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(updated));
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminUpdateRofrPage(adminKey, {
          id: pageData.id,
          slug: pageData.slug,
          title: pageData.title,
          nav_label: pageData.nav_label,
          subtitle: pageData.subtitle || "",
          category: pageData.category || "RoFR & LTR",
          parent_slug: pageData.parent_slug || "",
          sort_order: pageData.sort_order ?? 0
        });
      }
      showToast("Page settings updated! Changes are live on website.", "success");
    } catch (err) {
      showToast("Page settings updated locally! Changes are live on website.", "success");
    } finally {
      setSaving(false);
    }
  };

  // Create New Dropdown Page
  const handleCreatePage = async (e) => {
    e.preventDefault();
    const pageName = (newPageData.nav_label || newPageData.title || "").trim();
    if (!pageName) {
      showToast("Please enter a page name.", "error");
      return;
    }
    const cleanSlug = (newPageData.slug && newPageData.slug.trim())
      ? newPageData.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "")
      : pageName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const finalSlug = cleanSlug || `rofr-${Date.now()}`;
    const finalTitle = (newPageData.title || pageName).trim();
    const finalCategory = newPageData.category || "RoFR & LTR";

    setSaving(true);

    const newPageObj = normalizePage({
      id: Date.now(),
      slug: finalSlug,
      nav_label: pageName,
      title: finalTitle,
      subtitle: (newPageData.subtitle || "").trim() || `Official records, reports, and documentation for ${pageName}.`,
      category: finalCategory,
      badge: "RoFR & LTR Project",
      parent_slug: newPageData.parent_slug || "",
      paragraphs: [
        `Welcome to ${pageName}. Official statutory records, notifications, field documentation, and case proceedings are maintained here by ALERT.`
      ],
      downloads: [],
      tables: [],
      images: [],
      videos: [],
      stats: [],
      sort_order: pages.length + 1,
      is_active: 1
    });

    const updatedPages = [...pages, newPageObj];
    setPages(updatedPages);
    setSelectedSlug(finalSlug);

    const fullOverride = {
      ...newPageObj,
      title: finalTitle,
      nav_label: pageName,
      subtitle: newPageObj.subtitle,
      category: finalCategory,
      badge: "RoFR & LTR Project",
      parent_slug: newPageData.parent_slug || "",
      paragraphs: newPageObj.paragraphs,
      downloads: [],
      tables: [],
      images: [],
      videos: [],
      stats: []
    };

    try {
      localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(updatedPages));
      localStorage.setItem(`alertngo_page_override_${finalSlug.toLowerCase()}`, JSON.stringify(fullOverride));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: finalSlug.toLowerCase() } }));
      window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminCreateRofrPage(adminKey, {
          slug: finalSlug,
          nav_label: pageName,
          title: finalTitle,
          subtitle: newPageObj.subtitle,
          category: finalCategory,
          parent_slug: newPageData.parent_slug || ""
        });
        await adminCreateAllSitePage(adminKey, fullOverride);
      }
    } catch (apiErr) {
      console.warn("Backend API sync notice (saved locally):", apiErr);
    }

    showToast(`Page "${pageName}" created and live on website dropdown!`, "success");
    setShowAddPageModal(false);
    setShowAdvancedNewPage(false);
    setNewPageData({ slug: "", nav_label: "", title: "", subtitle: "", category: "RoFR & LTR", parent_slug: "", isSlugCustom: false, isTitleCustom: false });
    setSaving(false);
  };

  // Delete Page
  const handleDeletePage = async (slugToDelete, navLabel) => {
    if (slugToDelete === "rofr") {
      alert("The main RoFR & LTR landing page cannot be deleted as it is the primary category root.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${navLabel}" (/ ${slugToDelete})? This will remove all associated documents from this dropdown page.`)) {
      return;
    }
    setSaving(true);
    const remaining = pages.filter((p) => p.slug !== slugToDelete);
    setPages(remaining);
    setSelectedSlug(remaining[0]?.slug || "rofr");
    try {
      localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(remaining));
      window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminDeleteRofrPage(adminKey, slugToDelete);
      }
      showToast(`Page "${navLabel}" removed.`, "success");
    } catch (err) {
      showToast(`Page "${navLabel}" removed locally.`, "success");
    } finally {
      setSaving(false);
    }
  };



  // PDF File Selection & Upload
  const handlePdfFileSelect = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadPdfError("Please choose a valid PDF document (.pdf).");
      return;
    }
    setUploadPdfError("");
    setIsUploadingPdf(true);

    try {
      const res = await adminUploadImage(adminKey, file, "rofr");
      if (res && res.success && res.url) {
        const cleanName = file.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ");
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        setStagedDoc({
          url: res.url,
          filename: file.name,
          text: formattedTitle,
          size: formatBytes(file.size),
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          category: "Official PDF"
        });
        showToast(`Uploaded ${file.name}! Verify title and click Add.`, "success");
      } else {
        setUploadPdfError(res?.message || "Upload failed on server.");
      }
    } catch (err) {
      setUploadPdfError(err.message || "File upload error.");
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  // Add Staged Document into current page
  const handleAddStagedDoc = async () => {
    if (!stagedDoc || !stagedDoc.url || !currentPage) return;
    const newDoc = {
      url: stagedDoc.url,
      filename: stagedDoc.filename || "document.pdf",
      text: (stagedDoc.text || stagedDoc.filename || "RoFR & LTR Document").trim(),
      size: stagedDoc.size || "",
      date: stagedDoc.date || "",
      category: stagedDoc.category || "Official PDF"
    };

    const updatedDownloads = [...(currentContent.downloads || []), newDoc];
    updateCurrentContent({ downloads: updatedDownloads });
    setStagedDoc(null);

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, downloads: updatedDownloads },
        downloads: updatedDownloads
      });
      showToast(`Added "${newDoc.text}" and saved!`, "success");
    } catch (_) {
      showToast(`Added "${newDoc.text}" locally. Click "Save Changes" to commit.`, "info");
    } finally {
      setSaving(false);
    }
  };



  // Delete Document
  const handleDeleteDoc = async (idx) => {
    const docToDelete = (currentContent.downloads || [])[idx];
    if (!docToDelete || !currentPage) return;
    if (!window.confirm(`Remove document "${docToDelete?.text || docToDelete?.filename}"?`)) return;

    const updatedDownloads = [...(currentContent.downloads || [])];
    updatedDownloads.splice(idx, 1);
    updateCurrentContent({ downloads: updatedDownloads });

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, downloads: updatedDownloads },
        downloads: updatedDownloads
      });
      showToast(`Document "${docToDelete?.text || docToDelete?.filename}" deleted.`, "success");
    } catch (_) {
      showToast("Document removed locally. Click 'Save Changes' to commit.", "info");
    } finally {
      setSaving(false);
    }
  };



  // Reorder Document Up/Down
  const handleMoveDoc = (idx, direction) => {
    const downloads = [...(currentContent.downloads || [])];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= downloads.length) return;
    const temp = downloads[idx];
    downloads[idx] = downloads[targetIdx];
    downloads[targetIdx] = temp;
    updateCurrentContent((prev) => ({ ...prev, downloads }));
  };

  // Edit Document
  const handleOpenEditDoc = (doc, idx) => {
    setEditingDocIdx(idx);
    setEditingDocData({ ...doc });
    setEditDocUploadError("");
    setIsEditingDocUploading(false);
  };

  // Direct replacement PDF upload inside Edit Document modal
  const handleEditDocFileSelect = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setEditDocUploadError("Please choose a valid PDF document (.pdf).");
      return;
    }
    setEditDocUploadError("");
    setIsEditingDocUploading(true);

    try {
      const res = await adminUploadImage(adminKey, file, "rofr");
      if (res && res.success && res.url) {
        const cleanName = file.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ");
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        setEditingDocData((prev) => ({
          ...prev,
          url: res.url,
          filename: file.name,
          size: formatBytes(file.size),
          text: (prev?.text && prev.text !== "Untitled Document" && prev.text.trim()) ? prev.text : formattedTitle
        }));
        showToast(`PDF uploaded! Path updated to ${res.url}`, "success");
      } else {
        setEditDocUploadError(res?.message || "PDF upload failed on server.");
      }
    } catch (err) {
      setEditDocUploadError(err.message || "File upload error.");
    } finally {
      setIsEditingDocUploading(false);
      if (editDocFileInputRef.current) editDocFileInputRef.current.value = "";
    }
  };

  const handleSaveEditDoc = async () => {
    if (editingDocIdx === null || !editingDocData || !currentPage) return;
    const updatedDownloads = [...(currentContent.downloads || [])];
    updatedDownloads[editingDocIdx] = { ...editingDocData };

    updateCurrentContent({ downloads: updatedDownloads });
    setEditingDocIdx(null);
    setEditingDocData(null);
    setEditDocUploadError("");

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, downloads: updatedDownloads },
        downloads: updatedDownloads
      });
      showToast("Document updated and saved successfully!", "success");
    } catch (_) {
      showToast("Document updated locally. Click 'Save Changes' to commit.", "info");
    } finally {
      setSaving(false);
    }
  };



  // Add Document via Shareable URL / Google Drive
  const handleAddUrlDoc = async (e) => {
    e?.preventDefault();
    if (!currentPage) return;
    if (!urlDocData.url || !urlDocData.url.trim()) {
      showToast("Please provide a valid document URL or shareable link.", "error");
      return;
    }
    if (!urlDocData.text || !urlDocData.text.trim()) {
      showToast("Please enter a document display title.", "error");
      return;
    }

    const cleanUrl = urlDocData.url.trim();
    const cleanTitle = urlDocData.text.trim();
    const filename = (urlDocData.filename || (cleanUrl.includes("drive.google.com") ? cleanTitle + ".pdf" : cleanUrl.split("/").pop()) || "document.pdf").trim();

    const newDoc = {
      url: cleanUrl,
      filename: filename,
      text: cleanTitle,
      size: (urlDocData.size || (cleanUrl.includes("drive.google.com") ? "Google Drive" : "")).trim(),
      date: (urlDocData.date || new Date().getFullYear().toString()).trim(),
      category: urlDocData.category || "Official PDF"
    };

    const updatedDownloads = [...(currentContent.downloads || []), newDoc];
    updateCurrentContent({ downloads: updatedDownloads });
    setUrlDocData({ text: "", url: "", filename: "", size: "", date: "", category: "Official PDF" });

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, downloads: updatedDownloads },
        downloads: updatedDownloads
      });
      showToast(`Added "${newDoc.text}" and saved!`, "success");
    } catch (_) {
      showToast(`Added "${newDoc.text}" via URL! Remember to click "Save Changes".`, "info");
    } finally {
      setSaving(false);
    }
  };



  // Upload Image File directly inside Add Modal
  const handleAddModalFileSelect = async (file) => {
    if (!file) return;
    const isImg = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);
    if (!isImg) {
      setAddImgModalError("Please choose a valid image file (JPG, PNG, WEBP, SVG).");
      return;
    }
    setAddImgModalError("");
    setIsAddImgModalUploading(true);

    try {
      const res = await adminUploadImage(adminKey, file, "rofr");
      if (res && res.success && res.url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        setNewImgUrlData((prev) => ({
          ...prev,
          url: res.url,
          name: (prev.name && prev.name.trim()) ? prev.name : formattedTitle
        }));
        showToast(`Image file uploaded to ${res.url}`, "success");
      } else {
        setAddImgModalError(res?.message || "Image upload failed on server.");
      }
    } catch (err) {
      setAddImgModalError(err.message || "File upload error.");
    } finally {
      setIsAddImgModalUploading(false);
      if (addModalFileInputRef.current) addModalFileInputRef.current.value = "";
    }
  };

  // Add Image / Map via File Upload or URL
  const handleAddImgUrl = async (e) => {
    e?.preventDefault();
    if (!currentPage) return;
    if (!newImgUrlData.url || !newImgUrlData.url.trim()) {
      showToast("Please choose an image file or enter an image URL.", "error");
      return;
    }
    const cleanUrl = newImgUrlData.url.trim();
    const cleanTitle = (newImgUrlData.name || "RoFR & LTR Field Image / Map").trim();
    const newImg = {
      src: cleanUrl,
      url: cleanUrl,
      name: cleanTitle,
      alt: cleanTitle,
      caption: (newImgUrlData.caption || "").trim() || cleanTitle
    };

    const updatedImages = [...(currentContent.images || []), newImg];
    updateCurrentContent({ images: updatedImages });
    setNewImgUrlData({ url: "", name: "", caption: "" });
    setShowAddImgUrlModal(false);
    setAddImgModalError("");

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, images: updatedImages },
        images: updatedImages,
        title: currentPage.title,
        dropdown_title: currentPage.dropdown_title
      });
      showToast(`Added "${cleanTitle}" image and saved to database!`, "success");
    } catch (_) {
      showToast(`Added image locally. Remember to click "Save Changes".`, "info");
    } finally {
      setSaving(false);
    }
  };



  // Image Upload Handler
  const handleImageFileSelect = async (file) => {
    if (!file || !currentPage) return;
    setUploadImgError("");
    setIsUploadingImg(true);

    try {
      const res = await adminUploadImage(adminKey, file, "rofr");
      if (res && res.success && res.url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const newImg = {
          src: res.url,
          url: res.url,
          name: formattedTitle,
          alt: formattedTitle,
          caption: formattedTitle
        };

        const updatedImages = [...(currentContent.images || []), newImg];
        updateCurrentContent({ images: updatedImages });

        try {
          setSaving(true);
          await adminSaveRofrContent(adminKey, {
            slug: currentPage.slug,
            page_id: currentPage.id,
            content: { ...currentContent, images: updatedImages },
            images: updatedImages
          });
          showToast(`Uploaded and attached "${formattedTitle}"!`, "success");
        } catch (_) {
          showToast(`Attached image locally. Click "Save Changes" to commit.`, "info");
        } finally {
          setSaving(false);
        }
      } else {
        setUploadImgError(res?.message || "Upload failed on server.");
      }
    } catch (err) {
      setUploadImgError(err.message || "File upload error.");
    } finally {
      setIsUploadingImg(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (idx) => {
    if (!currentPage) return;
    if (!window.confirm("Remove this image?")) return;
    const updatedImages = [...(currentContent.images || [])];
    updatedImages.splice(idx, 1);
    updateCurrentContent({ images: updatedImages });

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, images: updatedImages },
        images: updatedImages
      });
      showToast("Image removed.", "success");
    } catch (_) {
      showToast("Image removed locally. Click 'Save Changes' to commit.", "info");
    } finally {
      setSaving(false);
    }
  };

  // Move / Reorder Image
  const handleMoveImage = async (idx, direction) => {
    const images = [...(currentContent.images || [])];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const temp = images[idx];
    images[idx] = images[targetIdx];
    images[targetIdx] = temp;
    updateCurrentContent({ images });

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, images },
        images: images,
        title: currentPage.title,
        dropdown_title: currentPage.dropdown_title
      });
      showToast("Image reordered successfully!", "success");
    } catch (err) {
      showToast("Saved locally, commit with 'Save Changes': " + err.message, "info");
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Image Modal
  const handleOpenEditImg = (img, idx) => {
    setEditingImgIdx(idx);
    setEditingImgData({
      src: img.src || img.url || "",
      url: img.url || img.src || "",
      name: img.name || img.alt || img.caption || "",
      alt: img.alt || img.name || "",
      caption: img.caption || ""
    });
    setEditImgUploadError("");
    setIsEditingImgUploading(false);
  };

  // Direct Replacement Image File upload inside Edit Modal
  const handleEditImgFileSelect = async (file) => {
    if (!file) return;
    const isImg = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);
    if (!isImg) {
      setEditImgUploadError("Please choose a valid image file (.jpg, .jpeg, .png, .webp, .svg).");
      return;
    }
    setEditImgUploadError("");
    setIsEditingImgUploading(true);

    try {
      const res = await adminUploadImage(adminKey, file, "rofr");
      if (res && res.success && res.url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        setEditingImgData((prev) => ({
          ...prev,
          src: res.url,
          url: res.url,
          name: (prev?.name && prev.name.trim()) ? prev.name : formattedTitle,
          alt: (prev?.alt && prev.alt.trim()) ? prev.alt : formattedTitle
        }));
        showToast(`Image uploaded! Path updated to ${res.url}`, "success");
      } else {
        setEditImgUploadError(res?.message || "Image upload failed on server.");
      }
    } catch (err) {
      setEditImgUploadError(err.message || "File upload error.");
    } finally {
      setIsEditingImgUploading(false);
      if (editImgFileInputRef.current) editImgFileInputRef.current.value = "";
    }
  };

  // Save changes from Edit Image Modal
  const handleSaveEditImg = async () => {
    if (editingImgIdx === null || !editingImgData || !currentPage) return;
    const updatedImages = [...(currentContent.images || [])];
    const finalImg = {
      ...updatedImages[editingImgIdx],
      src: editingImgData.src || editingImgData.url,
      url: editingImgData.url || editingImgData.src,
      name: editingImgData.name || "",
      alt: editingImgData.alt || editingImgData.name || "",
      caption: editingImgData.caption || ""
    };
    updatedImages[editingImgIdx] = finalImg;

    updateCurrentContent({ images: updatedImages });
    setEditingImgIdx(null);
    setEditingImgData(null);
    setEditImgUploadError("");

    // Auto-save to backend
    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, images: updatedImages },
        images: updatedImages,
        title: currentPage.title,
        dropdown_title: currentPage.dropdown_title
      });
      showToast("Image updated and saved to database!", "success");
    } catch (err) {
      showToast("Updated locally, commit with 'Save Changes': " + err.message, "info");
    } finally {
      setSaving(false);
    }
  };



  // ==========================================
  // FIELD VIDEO MANAGEMENT (Instant NTFS <0.05s + Streaming + YouTube)
  // ==========================================
  const handleSelectVidFile = (file) => {
    if (!file) return;
    setSelectedVidFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedVidPreview(previewUrl);
    setUploadVidError("");
    setUploadedVidUrl("");
    setVidUploadProgress({ percent: 0, loaded: 0, total: file.size });
    setIsUploadingVid(true);

    if (!vidModalData.title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
      const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      setVidModalData((prev) => ({ ...prev, title: formattedTitle }));
    }

    const targetFolder = `rofr/${currentPage?.slug || "general"}/videos`;
    const uploadPromise = adminUploadVideo(adminKey, file, targetFolder, (prog) => {
      setVidUploadProgress(prog);
    })
      .then((res) => {
        if (res && res.success && res.url) {
          setUploadedVidUrl(res.url);
          setIsUploadingVid(false);
          return res.url;
        } else {
          setUploadVidError(res?.message || "Failed to upload video file.");
          setIsUploadingVid(false);
          throw new Error(res?.message || "Upload failed");
        }
      })
      .catch((err) => {
        setUploadVidError("Video upload error: " + err.message);
        setIsUploadingVid(false);
        throw err;
      });

    uploadVidPromiseRef.current = uploadPromise;
  };

  const handleOpenAddVideo = (mode = "upload") => {
    setEditingVidIdx(null);
    setVidModalMode(mode);
    setVidModalData({ title: "", description: "", url: "", type: "video" });
    setSelectedVidFile(null);
    if (selectedVidPreview) {
      try { URL.revokeObjectURL(selectedVidPreview); } catch (_) {}
    }
    setSelectedVidPreview("");
    setUploadedVidUrl("");
    setVidUploadProgress({ percent: 0, loaded: 0, total: 0 });
    setUploadVidError("");
    setIsUploadingVid(false);
    uploadVidPromiseRef.current = null;
    setShowAddVidModal(true);
  };

  const handleOpenEditVideo = (vid, idx) => {
    setEditingVidIdx(idx);
    const isYt = isYouTubeUrl(vid.url);
    setVidModalMode(isYt ? "url" : "upload");
    setVidModalData({
      title: vid.title || "",
      description: vid.description || "",
      url: vid.url || "",
      type: vid.type || (isYt ? "youtube" : "video")
    });
    setSelectedVidFile(null);
    if (selectedVidPreview) {
      try { URL.revokeObjectURL(selectedVidPreview); } catch (_) {}
    }
    setSelectedVidPreview(vid.url || "");
    setUploadedVidUrl(vid.url || "");
    setVidUploadProgress({ percent: 100, loaded: 0, total: 0 });
    setUploadVidError("");
    setIsUploadingVid(false);
    uploadVidPromiseRef.current = null;
    setShowAddVidModal(true);
  };

  const handleSaveVideoModal = async (e) => {
    if (e) e.preventDefault();
    setUploadVidError("");

    let finalUrl = uploadedVidUrl || vidModalData.url.trim();

    if (selectedVidFile && !finalUrl) {
      if (uploadVidPromiseRef.current) {
        setIsUploadingVid(true);
        try {
          finalUrl = await uploadVidPromiseRef.current;
        } catch (err) {
          setUploadVidError("Video upload failed: " + err.message);
          setIsUploadingVid(false);
          return;
        }
      } else {
        setIsUploadingVid(true);
        try {
          const targetFolder = `rofr/${currentPage?.slug || "general"}/videos`;
          const uploadRes = await adminUploadVideo(adminKey, selectedVidFile, targetFolder, (prog) => setVidUploadProgress(prog));
          if (uploadRes && uploadRes.success && uploadRes.url) {
            finalUrl = uploadRes.url;
          } else {
            setUploadVidError(uploadRes?.message || "Failed to upload video file.");
            setIsUploadingVid(false);
            return;
          }
        } catch (err) {
          setUploadVidError("Video upload error: " + err.message);
          setIsUploadingVid(false);
          return;
        }
      }
    }

    if (!finalUrl) {
      setUploadVidError("Please select a video file (.mp4, .webm) or provide a YouTube / video link.");
      return;
    }

    const titleText = vidModalData.title.trim() || (selectedVidFile ? selectedVidFile.name.replace(/\.[^/.]+$/, "") : "Field Video Report");
    const newVidObj = {
      id: Date.now().toString(),
      url: finalUrl,
      title: titleText,
      description: vidModalData.description.trim() || titleText,
      type: isYouTubeUrl(finalUrl) ? "youtube" : "video"
    };

    const updatedVideos = [...(currentContent.videos || [])];
    if (editingVidIdx !== null) {
      updatedVideos[editingVidIdx] = newVidObj;
    } else {
      updatedVideos.unshift(newVidObj);
    }

    updateCurrentContent({ videos: updatedVideos });
    setShowAddVidModal(false);

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, videos: updatedVideos },
        videos: updatedVideos
      });
      showToast(editingVidIdx !== null ? "✓ Video updated and saved to database!" : "✓ Video uploaded and saved to database!", "success");
    } catch (_) {
      showToast("Video updated locally. Click 'Save Changes' to commit.", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (idx) => {
    if (!currentPage) return;
    if (!window.confirm("Delete this video?")) return;
    const updatedVideos = [...(currentContent.videos || [])];
    updatedVideos.splice(idx, 1);
    updateCurrentContent({ videos: updatedVideos });

    try {
      setSaving(true);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, videos: updatedVideos },
        videos: updatedVideos
      });
      showToast("Video removed and saved to database.", "success");
    } catch (_) {
      showToast("Video removed locally. Click 'Save Changes' to commit.", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveVideo = async (idx, direction) => {
    const list = [...(currentContent.videos || [])];
    const target = idx + direction;
    if (target < 0 || target >= list.length) return;
    const temp = list[idx];
    list[idx] = list[target];
    list[target] = temp;
    updateCurrentContent({ videos: list });
    try {
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, videos: list },
        videos: list
      });
    } catch (_) {}
  };



  // Paragraph Handlers
  const handleAddParagraph = () => {
    updateCurrentContent((prev) => ({
      ...prev,
      paragraphs: [...(prev.paragraphs || []), ""]
    }));
  };

  const handleUpdateParagraph = (idx, text) => {
    updateCurrentContent((prev) => {
      const paragraphs = [...(prev.paragraphs || [])];
      paragraphs[idx] = text;
      return { ...prev, paragraphs };
    });
  };

  const handleDeleteParagraph = (idx) => {
    updateCurrentContent((prev) => {
      const paragraphs = [...(prev.paragraphs || [])];
      paragraphs.splice(idx, 1);
      return { ...prev, paragraphs };
    });
  };

  const handleMoveParagraph = (idx, direction) => {
    const list = [...(currentContent.paragraphs || [])];
    const target = idx + direction;
    if (target < 0 || target >= list.length) return;
    const temp = list[idx];
    list[idx] = list[target];
    list[target] = temp;
    updateCurrentContent((prev) => ({ ...prev, paragraphs: list }));
  };

  const handleSaveParagraphs = async () => {
    if (!currentPage) return;
    setSaving(true);
    try {
      const cleanParagraphs = (currentContent.paragraphs || []).map((p) => p.trim()).filter(Boolean);
      await adminSaveRofrContent(adminKey, {
        slug: currentPage.slug,
        page_id: currentPage.id,
        content: { ...currentContent, paragraphs: cleanParagraphs },
        paragraphs: cleanParagraphs
      });
      updateCurrentContent((prev) => ({ ...prev, paragraphs: cleanParagraphs }));
      showToast("Overview paragraphs saved successfully to database & live site!", "success");
      loadPages();
    } catch (err) {
      showToast("Failed to save paragraphs: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Table Handlers
  const handleAddTable = () => {
    const newTbl = {
      title: "New Data Table",
      headers: ["Column 1", "Column 2", "Column 3"],
      rows: [
        ["Sample 1", "Sample 2", "Sample 3"],
        ["Sample 4", "Sample 5", "Sample 6"]
      ]
    };
    updateCurrentContent((prev) => ({
      ...prev,
      tables: [...(prev.tables || []), newTbl]
    }));
    showToast("Added new table template.", "info");
  };

  const handleDeleteTable = (tIdx) => {
    if (!window.confirm("Delete this entire table?")) return;
    updateCurrentContent((prev) => {
      const tables = [...(prev.tables || [])];
      tables.splice(tIdx, 1);
      return { ...prev, tables };
    });
  };

  const handleUpdateTableHeader = (tIdx, hIdx, val) => {
    updateCurrentContent((prev) => {
      const tables = [...(prev.tables || [])];
      const table = { ...tables[tIdx] };
      const headers = [...(table.headers || [])];
      headers[hIdx] = val;
      table.headers = headers;
      tables[tIdx] = table;
      return { ...prev, tables };
    });
  };

  const handleUpdateTableCell = (tIdx, rIdx, cIdx, val) => {
    updateCurrentContent((prev) => {
      const tables = [...(prev.tables || [])];
      const table = { ...tables[tIdx] };
      const rows = [...(table.rows || [])];
      const row = [...(rows[rIdx] || [])];
      row[cIdx] = val;
      rows[rIdx] = row;
      table.rows = rows;
      tables[tIdx] = table;
      return { ...prev, tables };
    });
  };

  const handleAddTableRow = (tIdx) => {
    updateCurrentContent((prev) => {
      const tables = [...(prev.tables || [])];
      const table = { ...tables[tIdx] };
      const rows = [...(table.rows || [])];
      const emptyRow = new Array((table.headers || []).length).fill("");
      rows.push(emptyRow);
      table.rows = rows;
      tables[tIdx] = table;
      return { ...prev, tables };
    });
  };

  const handleDeleteTableRow = (tIdx, rIdx) => {
    updateCurrentContent((prev) => {
      const tables = [...(prev.tables || [])];
      const table = { ...tables[tIdx] };
      const rows = [...(table.rows || [])];
      rows.splice(rIdx, 1);
      table.rows = rows;
      tables[tIdx] = table;
      return { ...prev, tables };
    });
  };

  const handleSaveTables = async () => {
    if (!currentPage) return;
    setSaving(true);
    const cleanSlug = (currentPage.slug || "").toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "").trim();
    const currentTables = currentContent.tables || [];
    const fullOverride = {
      ...currentPage,
      content: { ...currentContent, tables: currentTables },
      tables: currentTables,
      tables_count: currentTables.length
    };
    try {
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPages = pages.map((p) => (p.slug === currentPage.slug ? fullOverride : p));
      localStorage.setItem(ROFR_CACHE_KEY, JSON.stringify(updatedPages));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_rofr_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminSaveRofrContent(adminKey, {
          slug: currentPage.slug,
          page_id: currentPage.id,
          content: { ...currentContent, tables: currentTables },
          tables: currentTables
        });
      }
      showToast("Data tables saved successfully to database & live site!", "success");
    } catch (_) {
      showToast("Data tables saved locally! Live on website immediately.", "info");
    } finally {
      setSaving(false);
    }
  };

  // Filtered downloads for search
  const filteredDownloads = (currentContent.downloads || []).filter((d) => {
    if (!docSearch.trim()) return true;
    const q = docSearch.toLowerCase();
    return (
      (d.text && d.text.toLowerCase().includes(q)) ||
      (d.filename && d.filename.toLowerCase().includes(q)) ||
      (d.title && d.title.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout title="RoFR & LTR Project Manager">
      <style>{`
        .pills-scroll-btn {
          background: #1e293b !important;
          border: 1px solid #475569 !important;
          color: #f8fafc !important;
          border-radius: 6px !important;
          padding: 4px 10px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          min-width: auto !important;
          width: auto !important;
          min-height: 28px !important;
          height: 28px !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          line-height: 1 !important;
        }
        .pills-scroll-btn:hover {
          background: #334155 !important;
          border-color: #64748b !important;
          color: #ffffff !important;
        }
        .rofr-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
        }
        .rofr-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rofr-header-row-btns {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rofr-btn-save {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border: none;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.2s ease;
        }
        .rofr-btn-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          background: #1f2937;
          color: #e5e7eb;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid #374151;
          transition: all 0.2s ease;
        }
        .rofr-btn-create {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rofr-stat-header-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          flex-shrink: 0;
        }
        .rofr-stat-btn-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #10b981;
          color: #ffffff;
          border: 1px solid #059669;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
          white-space: nowrap;
        }
        .rofr-stat-btn-save:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        }
        .rofr-stat-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .rofr-stat-subactions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .rofr-stat-btn-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1f2937;
          color: #38bdf8;
          border: 1px solid #374151;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .rofr-stat-btn-live:hover {
          background: #374151;
          color: #7dd3fc;
          border-color: #4b5563;
        }
        .rofr-stat-btn-reset {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1f2937;
          color: #9ca3af;
          border: 1px solid #374151;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .rofr-stat-btn-reset:hover {
          background: #374151;
          color: #f87171;
          border-color: #ef4444;
        }
        .rofr-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .rofr-modal-card {
          background: #111827;
          border-radius: 16px;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border: 1px solid #374151;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          box-sizing: border-box;
        }
        .rofr-selector-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }
        .rofr-subtabs-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .rofr-page,
          .rofr-page * {
            box-sizing: border-box !important;
            max-width: 100%;
          }
          .rofr-page {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            padding-bottom: 30px !important;
          }
          .rofr-header-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            margin-bottom: 14px !important;
          }
          .rofr-header-icon {
            display: none !important;
          }
          .rofr-header-title {
            font-size: 1.05rem !important;
            line-height: 1.25 !important;
            margin: 0 !important;
            font-weight: 800 !important;
          }
          .rofr-header-desc {
            font-size: 0.72rem !important;
            line-height: 1.35 !important;
            margin: 2px 0 0 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .rofr-header-actions {
            width: 100% !important;
            flex-direction: column !important;
            gap: 6px !important;
          }
          .rofr-btn-save {
            width: 100% !important;
            padding: 8px 12px !important;
            font-size: 0.82rem !important;
            border-radius: 8px !important;
            justify-content: center !important;
          }
          .rofr-header-row-btns {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }
          .rofr-btn-live,
          .rofr-btn-create {
            width: 100% !important;
            padding: 7px 6px !important;
            font-size: 0.74rem !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            justify-content: center !important;
          }
          .rofr-selector-card {
            padding: 10px 10px !important;
            margin-bottom: 14px !important;
            border-radius: 12px !important;
          }
          .rofr-selector-head {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 3px !important;
            margin-bottom: 8px !important;
          }
          .rofr-selector-head span:first-child {
            font-size: 0.68rem !important;
            letter-spacing: 0.5px !important;
          }
          .rofr-selector-head span:last-child {
            font-size: 0.68rem !important;
          }
          .rofr-pill-slug {
            display: none !important;
          }
          .rofr-selector-pills {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            touch-action: pan-x !important;
            gap: 10px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(255,255,255,0.3) rgba(0,0,0,0.2) !important;
            padding-bottom: 6px !important;
            padding-left: 6px !important;
            padding-right: 20px !important;
            scroll-padding-left: 6px !important;
          }
          .rofr-selector-pills::-webkit-scrollbar {
            height: 4px !important;
            display: block !important;
          }
          .rofr-selector-pills::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3) !important;
            border-radius: 4px !important;
          }
          .rofr-selector-pills::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2) !important;
          }
          .rofr-selector-pills > * {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            max-width: none !important;
            min-width: max-content !important;
          }
          .rofr-selector-pills button {
            padding: 7px 12px !important;
            font-size: 0.74rem !important;
            border-radius: 8px !important;
            gap: 8px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            text-align: left !important;
            min-width: max-content !important;
            touch-action: pan-x !important;
            user-select: none !important;
            -webkit-user-select: none !important;
          }
          .rofr-selector-pills button span {
            min-width: auto !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            text-align: left !important;
          }
          .rofr-card,
          .rofr-page div[style*="padding: 22px"],
          .rofr-page div[style*="padding: 24px"],
          .rofr-page div[style*="padding: 20px"],
          .rofr-page div[style*="padding: 28px"],
          .rofr-page div[style*="padding: 26px"] {
            padding: 12px 10px !important;
            border-radius: 12px !important;
            margin-bottom: 12px !important;
          }
          .rofr-card-header h2 {
            font-size: 0.98rem !important;
          }
          .rofr-card-header span {
            font-size: 0.68rem !important;
            padding: 2px 6px !important;
          }
          .rofr-card-actions button {
            font-size: 0.72rem !important;
            padding: 5px 10px !important;
          }
          .rofr-subtabs-wrap {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior-x: contain !important;
            gap: 6px !important;
            padding: 4px 2px 8px 2px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(59, 130, 246, 0.4) transparent !important;
          }
          .rofr-subtabs-wrap::-webkit-scrollbar {
            height: 3px !important;
            display: block !important;
          }
          .rofr-subtabs-wrap::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.4) !important;
            border-radius: 3px !important;
          }
          .rofr-subtabs-wrap button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            padding: 6px 12px !important;
            font-size: 0.76rem !important;
            border-radius: 8px !important;
            gap: 6px !important;
          }
          .rofr-stat-header-card {
            padding: 12px 10px !important;
            border-radius: 12px !important;
          }
          .rofr-stat-header-flex {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .rofr-stat-header-title {
            font-size: 1.02rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .rofr-stat-header-badge {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            display: inline-block !important;
            word-break: keep-all !important;
          }
          .rofr-stat-header-desc {
            font-size: 0.74rem !important;
            line-height: 1.35 !important;
            margin-top: 4px !important;
          }
          .rofr-stat-header-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            margin-top: 4px !important;
          }
          .rofr-stat-btn-save {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            height: 36px !important;
            font-size: 0.84rem !important;
            padding: 8px 14px !important;
            box-sizing: border-box !important;
            border-radius: 8px !important;
            font-weight: 700 !important;
            background: #10b981 !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            border: none !important;
            color: #fff !important;
          }
          .rofr-stat-subactions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .rofr-stat-subactions > * {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            height: 32px !important;
            font-size: 0.76rem !important;
            padding: 6px 8px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            border-radius: 8px !important;
          }
          .rofr-stat-btn-live {
            background: #1e293b !important;
            color: #93c5fd !important;
          }
          .rofr-stat-btn-reset {
            background: #1f2937 !important;
            color: #cbd5e1 !important;
          }
          .rofr-stat-save-bar {
            padding: 10px 12px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .rofr-stat-save-text {
            font-size: 0.74rem !important;
            line-height: 1.35 !important;
            text-align: center !important;
          }
          .rofr-stat-save-bar button {
            width: 100% !important;
            justify-content: center !important;
            padding: 8px 14px !important;
            font-size: 0.82rem !important;
          }
          .rofr-stat-item-box {
            padding: 10px 10px !important;
            border-radius: 10px !important;
            margin-bottom: 10px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .rofr-stat-item-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 10px !important;
            padding-bottom: 8px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .rofr-stat-item-title-wrap {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            min-width: 0 !important;
            flex: 1 1 auto !important;
            overflow: hidden !important;
          }
          .rofr-stat-item-badge {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            font-size: 0.65rem !important;
            padding: 2px 6px !important;
            line-height: 1.2 !important;
            letter-spacing: 0.3px !important;
          }
          .rofr-stat-item-title {
            font-size: 0.78rem !important;
            color: #e2e8f0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            min-width: 0 !important;
            flex: 1 1 auto !important;
            display: block !important;
          }
          .rofr-stat-item-controls {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            flex-shrink: 0 !important;
          }
          .rofr-stat-btn-arrow {
            width: 26px !important;
            min-width: 26px !important;
            max-width: 26px !important;
            height: 26px !important;
            min-height: 26px !important;
            max-height: 26px !important;
            padding: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 6px !important;
            background: #0f172a !important;
            border: 1px solid #334155 !important;
            color: #cbd5e1 !important;
            cursor: pointer !important;
            flex-shrink: 0 !important;
          }
          .rofr-stat-btn-del {
            min-height: 24px !important;
            height: 26px !important;
            padding: 0 8px !important;
            font-size: 0.72rem !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            border-radius: 6px !important;
            background: rgba(239, 68, 68, 0.12) !important;
            color: #ef4444 !important;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
            cursor: pointer !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          .rofr-stat-inputs-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .rofr-stat-color-row {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex-wrap: wrap !important;
            width: 100% !important;
          }
          .rofr-stat-color-swatch {
            width: 24px !important;
            min-width: 24px !important;
            max-width: 24px !important;
            height: 24px !important;
            min-height: 24px !important;
            max-height: 24px !important;
            padding: 0 !important;
            border-radius: 6px !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            cursor: pointer !important;
            flex-shrink: 0 !important;
          }
          .rofr-stat-color-input {
            width: 76px !important;
            height: 24px !important;
            min-height: 24px !important;
            font-size: 0.74rem !important;
            padding: 2px 6px !important;
            text-align: center !important;
            box-sizing: border-box !important;
            border-radius: 6px !important;
            background: #0f172a !important;
            border: 1px solid #334155 !important;
            color: #ffffff !important;
          }
          .rofr-preset-btn {
            padding: 4px 8px !important;
            font-size: 0.72rem !important;
            min-height: auto !important;
            line-height: 1.2 !important;
            border-radius: 6px !important;
          }
          .rofr-btn-add-metric {
            width: 100% !important;
            justify-content: center !important;
            padding: 9px 14px !important;
            font-size: 0.82rem !important;
            min-height: 36px !important;
            box-sizing: border-box !important;
          }
          .rofr-tables-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .rofr-btn-add-table {
            width: 100% !important;
            justify-content: center !important;
            padding: 8px 14px !important;
            font-size: 0.8rem !important;
          }
          .rofr-table-topbar {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .rofr-table-scroll-wrap {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            display: block !important;
            border-radius: 8px !important;
            border: 1px solid #374151 !important;
            margin-top: 6px !important;
          }
          .rofr-matrix-table {
            width: 100% !important;
            min-width: 560px !important;
            max-width: none !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
          }
          .rofr-matrix-table th,
          .rofr-matrix-table td {
            max-width: none !important;
            white-space: nowrap !important;
          }
          .rofr-matrix-table input {
            max-width: none !important;
            min-width: 70px !important;
            font-size: 0.78rem !important;
            padding: 5px 6px !important;
          }
          /* Reset any hard minWidth rules that cause overflow on mobile (excluding tables) */
          .rofr-page :not(.rofr-table-scroll-wrap):not(.rofr-matrix-table):not(table):not(th):not(td)*[style*="minWidth: 2"],
          .rofr-page :not(.rofr-table-scroll-wrap):not(.rofr-matrix-table):not(table):not(th):not(td)*[style*="min-width: 2"],
          .rofr-page :not(.rofr-table-scroll-wrap):not(.rofr-matrix-table):not(table):not(th):not(td)*[style*="minWidth: 3"],
          .rofr-page :not(.rofr-table-scroll-wrap):not(.rofr-matrix-table):not(table):not(th):not(td)*[style*="min-width: 3"],
          .rofr-page :not(.rofr-table-scroll-wrap):not(.rofr-matrix-table):not(table):not(th):not(td)*[style*="minWidth: 180"],
          .rofr-page :not(.rofr-table-scroll-wrap):not(.rofr-matrix-table):not(table):not(th):not(td)*[style*="min-width: 180"] {
            min-width: 0 !important;
            width: 100% !important;
          }
          .rofr-page input:not(.rofr-matrix-table input),
          .rofr-page textarea,
          .rofr-page select {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .rofr-modal-backdrop {
            padding: 8px !important;
          }
          .rofr-modal-card {
            padding: 16px 12px !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
      <div className="rofr-page" style={{ width: "100%", paddingBottom: 60, color: "#e2e8f0" }}>
        {/* TOP HERO HEADER */}
        <div className="rofr-header-bar">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="rofr-header-title" style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 12 }}>
              <span className="rofr-header-icon" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", padding: "8px 12px", borderRadius: 12, display: "inline-flex" }}>
                <FaBalanceScale size={20} color="#fff" />
              </span>
              RoFR & LTR Project & Dropdown Pages
            </h1>
            <p className="rofr-header-desc" style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: "0.9rem" }}>
              Manage the primary RoFR & LTR overview page, all 7 dropdown subpages, maps, diagrams, videos, and statutory PDF uploads.
            </p>
          </div>

          <div className="rofr-header-actions">
            <button
              onClick={handleSaveContent}
              disabled={saving}
              className="rofr-btn-save"
            >
              <FaSave size={13} /> {saving ? "Saving Changes..." : "Save Changes"}
            </button>

            <div className="rofr-header-row-btns">
              <Link
                to={`/${selectedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rofr-btn-live"
              >
                <FaEye size={12} /> View Live Page
              </Link>

              <button
                onClick={() => setShowAddPageModal(true)}
                className="rofr-btn-create"
              >
                <FaPlus size={11} /> New Dropdown Page
              </button>
            </div>
          </div>
        </div>

        {/* STATUS ALERT TOAST */}
        {statusMsg.text && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              marginBottom: 20,
              fontSize: "0.88rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: statusMsg.type === "success" ? "rgba(16, 185, 129, 0.15)" : statusMsg.type === "error" ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
              color: statusMsg.type === "success" ? "#34d399" : statusMsg.type === "error" ? "#f87171" : "#60a5fa",
              border: `1px solid ${statusMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : statusMsg.type === "error" ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)"}`
            }}
          >
            {statusMsg.type === "success" ? <FaCheckCircle /> : <FaInfoCircle />}
            {statusMsg.text}
          </div>
        )}

        {/* DROPDOWN PAGES SELECTOR — HIERARCHY + PILL STRIP */}
        <div className="rofr-selector-card" style={{ background: "#111827", borderRadius: 16, padding: "16px 20px", border: "1px solid #1f2937", marginBottom: 24 }}>
          <div className="rofr-selector-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "#ffffff", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
                <FaLayerGroup color="#38bdf8" /> RoFR &amp; LTR Dropdown &amp; Sub-dropdown Pages ({filteredPages.length})
              </span>
              <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: 2 }}>
                Active Editing: <strong style={{ color: "#38bdf8" }}>{currentPage?.nav_label || selectedSlug}</strong> (<code style={{ color: "#facc15" }}>/{selectedSlug}</code>)
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* View Switcher */}
              <div style={{ display: "inline-flex", background: "#0b1222", padding: 3, borderRadius: 8, border: "1px solid #1e293b" }}>
                <button
                  type="button"
                  onClick={() => setSelectorView("hierarchy")}
                  style={{
                    padding: "5px 12px", borderRadius: 6, border: "none", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer",
                    background: selectorView === "hierarchy" ? "#2563eb" : "transparent",
                    color: selectorView === "hierarchy" ? "#ffffff" : "#94a3b8"
                  }}
                >
                  ⊞ Hierarchy View
                </button>
                <button
                  type="button"
                  onClick={() => setSelectorView("pills")}
                  style={{
                    padding: "5px 12px", borderRadius: 6, border: "none", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer",
                    background: selectorView === "pills" ? "#2563eb" : "transparent",
                    color: selectorView === "pills" ? "#ffffff" : "#94a3b8"
                  }}
                >
                  ⋯ Pill Strip
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPageModal(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8,
                  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  color: "#ffffff", border: "1px solid rgba(56, 189, 248, 0.4)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer"
                }}
              >
                <FaPlus size={11} /> New Page
              </button>
            </div>
          </div>

          {/* Quick Filter Box */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "0.85rem" }} />
            <input
              type="text"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="Quick search pages by title or slug..."
              style={{ width: "100%", padding: "8px 14px 8px 36px", borderRadius: 8, background: "#0f172a", border: "1px solid #334155", color: "#ffffff", fontSize: "0.82rem", outline: "none" }}
            />
            {pageSearch && (
              <button
                onClick={() => setPageSearch("")}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.75rem" }}
              >
                Clear
              </button>
            )}
          </div>

          {/* VIEW MODE 1: HIERARCHY TREE VIEW */}
          {selectorView === "hierarchy" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hierarchicalPages.topPages.map((parent) => {
                const isParentSelected = parent.slug === selectedSlug;
                const subs = hierarchicalPages.parentMap[parent.slug] || [];
                const docCount = (parent.content?.downloads || []).length || parent.downloads_count || 0;
                const statCount = (parent.content?.stats || []).length || parent.stats_count || 0;
                const imgCount = (parent.content?.images || []).length || parent.images_count || 0;
                return (
                  <div
                    key={parent.slug}
                    style={{
                      background: isParentSelected ? "rgba(37, 99, 235, 0.12)" : "#131b2e",
                      borderRadius: 12,
                      border: isParentSelected ? "1.5px solid #3b82f6" : "1px solid #1e293b",
                      padding: "12px 14px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div
                        onClick={() => { setSelectedSlug(parent.slug); try { setSearchParams({ slug: parent.slug }); } catch (_) {} }}
                        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: "1 1 280px" }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: subs.length > 0 ? "rgba(56, 189, 248, 0.15)" : "rgba(100, 116, 139, 0.15)", color: subs.length > 0 ? "#38bdf8" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {subs.length > 0 ? <FaFolderOpen size={14} /> : <FaFileAlt size={13} />}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: isParentSelected ? "#ffffff" : "#e2e8f0" }}>{parent.nav_label || parent.title}</span>
                            <code style={{ fontSize: "0.72rem", color: "#38bdf8", background: "rgba(0,0,0,0.3)", padding: "1px 6px", borderRadius: 4 }}>/{parent.slug}</code>
                            {subs.length > 0 && <span style={{ fontSize: "0.7rem", background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", padding: "1px 8px", borderRadius: 999, fontWeight: 700 }}>{subs.length} Sub-dropdown{subs.length !== 1 ? "s" : ""}</span>}
                            {docCount > 0 && <span style={{ fontSize: "0.68rem", color: "#94a3b8", background: "#1f2937", padding: "1px 6px", borderRadius: 4 }}>{docCount} docs</span>}
                            {statCount > 0 && <span style={{ fontSize: "0.68rem", color: "#94a3b8", background: "#1f2937", padding: "1px 6px", borderRadius: 4 }}>{statCount} stats</span>}
                            {imgCount > 0 && <span style={{ fontSize: "0.68rem", color: "#94a3b8", background: "#1f2937", padding: "1px 6px", borderRadius: 4 }}>{imgCount} imgs</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenAddSubPage(parent.slug)}
                          title={`Create a new sub-dropdown under ${parent.nav_label}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          <FaPlus size={9} /> Sub-dropdown
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedSlug(parent.slug); try { setSearchParams({ slug: parent.slug }); } catch (_) {} }}
                          style={{ padding: "4px 10px", borderRadius: 6, background: isParentSelected ? "#2563eb" : "#1f2937", color: "#ffffff", border: "1px solid " + (isParentSelected ? "#3b82f6" : "#374151"), fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          {isParentSelected ? "Editing" : "Edit"}
                        </button>
                        <a
                          href={`/${parent.slug}`} target="_blank" rel="noreferrer"
                          style={{ padding: "4px 8px", borderRadius: 6, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", fontSize: "0.74rem", display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                          title="Open live frontend page in new tab"
                        >
                          <FaExternalLinkAlt size={10} />
                        </a>
                      </div>
                    </div>
                    {subs.length > 0 && (
                      <div style={{ marginLeft: 22, marginTop: 10, paddingLeft: 14, borderLeft: "2px dashed #2563eb", display: "flex", flexDirection: "column", gap: 6 }}>
                        {subs.map((child) => {
                          const isChildSelected = child.slug === selectedSlug;
                          const childDocs = (child.content?.downloads || []).length || child.downloads_count || 0;
                          const childStats = (child.content?.stats || []).length || child.stats_count || 0;
                          const childImgs = (child.content?.images || []).length || child.images_count || 0;
                          return (
                            <div
                              key={child.slug}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: isChildSelected ? "rgba(37, 99, 235, 0.25)" : "#0f172a", border: isChildSelected ? "1px solid #3b82f6" : "1px solid #1e293b", borderRadius: 8, padding: "8px 12px", gap: 10, flexWrap: "wrap", transition: "all 0.15s ease" }}
                            >
                              <div
                                onClick={() => { setSelectedSlug(child.slug); try { setSearchParams({ slug: child.slug }); } catch (_) {} }}
                                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flex: "1 1 240px" }}
                              >
                                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: "0.85rem" }}>↳</span>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: isChildSelected ? "#ffffff" : "#cbd5e1" }}>{child.nav_label || child.title}</span>
                                <code style={{ fontSize: "0.7rem", color: "#94a3b8", background: "rgba(0,0,0,0.3)", padding: "1px 5px", borderRadius: 4 }}>/{child.slug}</code>
                                <span style={{ fontSize: "0.66rem", background: "rgba(147, 197, 253, 0.15)", color: "#93c5fd", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>Sub-item</span>
                                {childDocs > 0 && <span style={{ fontSize: "0.66rem", color: "#64748b" }}>{childDocs} docs</span>}
                                {childStats > 0 && <span style={{ fontSize: "0.66rem", color: "#64748b" }}>{childStats} stats</span>}
                                {childImgs > 0 && <span style={{ fontSize: "0.66rem", color: "#64748b" }}>{childImgs} imgs</span>}
                              </div>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => { setSelectedSlug(child.slug); try { setSearchParams({ slug: child.slug }); } catch (_) {} }}
                                  style={{ padding: "3px 9px", borderRadius: 6, background: isChildSelected ? "#2563eb" : "#1f2937", color: "#ffffff", border: "1px solid " + (isChildSelected ? "#3b82f6" : "#374151"), fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                                >
                                  {isChildSelected ? "Editing" : "Edit"}
                                </button>
                                <a
                                  href={`/${child.slug}`} target="_blank" rel="noreferrer"
                                  style={{ padding: "3px 7px", borderRadius: 6, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                                  title="Open live frontend page in new tab"
                                >
                                  <FaExternalLinkAlt size={9} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW MODE 2: COMPACT PILL STRIP */
            <div
              ref={pillsRef}
              className="rofr-selector-pills"
              onWheel={(e) => {
                if (pillsRef.current) {
                  if (e.deltaX) { pillsRef.current.scrollLeft += e.deltaX; }
                  else if (e.deltaY) { pillsRef.current.scrollLeft += e.deltaY; }
                }
              }}
              onMouseDown={(e) => {
                isDraggingRef.current = true; hasMovedRef.current = false;
                startXRef.current = e.pageX - (pillsRef.current?.offsetLeft || 0);
                scrollLeftRef.current = pillsRef.current?.scrollLeft || 0;
              }}
              onMouseMove={(e) => {
                if (!isDraggingRef.current || !pillsRef.current) return;
                const x = e.pageX - (pillsRef.current?.offsetLeft || 0);
                const walk = x - startXRef.current;
                if (Math.abs(walk) > 4) { hasMovedRef.current = true; pillsRef.current.scrollLeft = scrollLeftRef.current - walk; }
              }}
              onMouseUp={() => { isDraggingRef.current = false; }}
              onMouseLeave={() => { isDraggingRef.current = false; }}
              style={{ cursor: "grab" }}
            >
              {filteredPages.map((p) => {
                const isSelected = p.slug === selectedSlug;
                const docCount = (p.content?.downloads || []).length || p.downloads_count || 0;
                const imgCount = (p.content?.images || []).length || p.images_count || 0;
                const tblCount = (p.content?.tables || []).length || p.tables_count || 0;
                let metaBadge = `${docCount} doc${docCount !== 1 ? "s" : ""}`;
                if (docCount === 0 && imgCount > 0) { metaBadge = `${imgCount} img`; }
                else if (docCount === 0 && tblCount > 0) { metaBadge = `${tblCount} tbl`; }
                return (
                  <button
                    key={p.slug}
                    data-selected={isSelected ? "true" : undefined}
                    onClick={(e) => {
                      if (hasMovedRef.current) { e.preventDefault(); return; }
                      setSelectedSlug(p.slug);
                      try { setSearchParams({ slug: p.slug }); } catch (_) {}
                      setDocSearch(""); setStagedDoc(null);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: isSelected ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "#1f2937", color: isSelected ? "#ffffff" : "#d1d5db", border: isSelected ? "1px solid #3b82f6" : "1px solid #374151", fontSize: "0.82rem", fontWeight: isSelected ? 700 : 500, cursor: "pointer", transition: "all 0.15s ease" }}
                  >
                    <span>{p.nav_label || p.title}</span>
                    <code className="rofr-pill-slug" style={{ fontSize: "0.7rem", opacity: isSelected ? 0.9 : 0.6, background: "rgba(0,0,0,0.25)", padding: "1px 5px", borderRadius: 4 }}>/{p.slug}</code>
                    <span style={{ background: isSelected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", padding: "2px 7px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700 }}>{metaBadge}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVE PAGE CONTENT WORKSPACE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>Loading RoFR & LTR pages...</div>
          </div>
        ) : currentPage ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* PAGE OVERVIEW BAR */}
            <div className="rofr-card" style={{ background: "#111827", borderRadius: 16, padding: "20px 24px", border: "1px solid #1f2937" }}>
              <div className="rofr-card-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: "1px solid #1f2937", paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                      {currentPage.nav_label}
                    </h2>
                    <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "3px 10px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700 }}>
                      Slug: /{currentPage.slug}
                    </span>
                  </div>
                </div>

                <div className="rofr-card-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => {
                      const newNav = window.prompt("Edit Navigation Label:", currentPage.nav_label);
                      if (newNav && newNav.trim()) {
                        handleSavePageSettings({ ...currentPage, nav_label: newNav.trim() });
                      }
                    }}
                    style={{
                      background: "#1f2937",
                      color: "#93c5fd",
                      border: "1px solid #374151",
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <FaEdit /> Rename in Dropdown
                  </button>

                  {currentPage.slug !== "rofr" && (
                    <button
                      onClick={() => handleDeletePage(currentPage.slug, currentPage.nav_label)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <FaTrash /> Delete Page
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Section Navigation Tabs */}
              <div className="rofr-subtabs-wrap">
                {[
                  { id: "stats", label: `Stat Cards & Metrics (${(currentContent.stats || []).length})`, icon: FaBalanceScale },
                  { id: "documents", label: `PDF Documents (${(currentContent.downloads || []).length})`, icon: FaFilePdf },
                  { id: "images", label: `Maps & Images (${(currentContent.images || []).length})`, icon: FaImages },
                  { id: "videos", label: `Field Videos (${(currentContent.videos || []).length})`, icon: FaVideo },
                  { id: "content", label: `Overview Text (${(currentContent.paragraphs || []).length})`, icon: FaFileAlt },
                  { id: "tables", label: `Structured Tables (${(currentContent.tables || []).length})`, icon: FaTable },
                  { id: "settings", label: "Page Meta & Title", icon: FaSlidersH },
                ].map((tab) => {
                  const isActive = activeSection === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 16px",
                        borderRadius: 10,
                        background: isActive ? "#2563eb" : "#1f2937",
                        color: isActive ? "#ffffff" : "#9ca3af",
                        border: isActive ? "1px solid #3b82f6" : "1px solid #374151",
                        fontSize: "0.84rem",
                        fontWeight: isActive ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <Icon />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 0: STAT CARDS & METRICS SECTION */}
            {activeSection === "stats" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* TOP HEADER & ACTION BAR */}
                <div className="rofr-stat-header-card" style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                  <div className="rofr-stat-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ flex: "1 1 340px", minWidth: 260 }}>
                      <h3 className="rofr-stat-header-title" style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <FaBalanceScale color="#3b82f6" /> Impact Stat Cards & Key Numbers
                        </span>
                        <span className="rofr-stat-header-badge adm-badge-pill" style={{ fontSize: "0.74rem", background: "#1e3a8a", color: "#93c5fd", padding: "3px 9px", borderRadius: 999, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, display: "inline-block" }}>
                          {(currentContent.stats || []).length} Cards
                        </span>
                      </h3>
                      <p className="rofr-stat-header-desc" style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: "0.84rem", lineHeight: 1.5 }}>
                        Edit the prominent numerical stat cards for <strong>{currentPage?.nav_label || currentPage?.title || currentPage?.slug}</strong> (e.g. <em>15,453 Approved</em>, <em>1,03,397 Acres</em>, <em>4,735 In Process</em>). You can edit numbers, change labels, pick icons, customize colors, add, delete, and reorder cards anytime.
                      </p>
                    </div>

                    <div
                      className="rofr-stat-header-actions"
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}
                    >
                      <button
                        type="button"
                        onClick={handleSaveContent}
                        disabled={saving}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                          background: saving ? "#059669" : "#10b981", color: "#ffffff",
                          border: "1px solid #059669", borderRadius: 8, padding: "9px 18px",
                          fontSize: "0.88rem", fontWeight: 700,
                          cursor: saving ? "not-allowed" : "pointer",
                          boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)", whiteSpace: "nowrap"
                        }}
                      >
                        <FaSave size={13} /> {saving ? "Saving Changes..." : "Save All Stat Cards"}
                      </button>

                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <a
                          href={`/${(currentPage?.slug || "").replace(/^\/+/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "#1f2937", color: "#38bdf8",
                            border: "1px solid #374151", borderRadius: 6,
                            padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600,
                            textDecoration: "none", whiteSpace: "nowrap"
                          }}
                        >
                          <FaExternalLinkAlt size={12} /> View Live Page
                        </a>

                        <button
                          type="button"
                          onClick={handleResetDefaultStats}
                          title="Restore suggested default cards for this page"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "#1f2937", color: "#9ca3af",
                            border: "1px solid #374151", borderRadius: 6,
                            padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600,
                            cursor: "pointer", whiteSpace: "nowrap"
                          }}
                        >
                          <FaUndo size={12} /> Reset to Defaults
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LIVE PUBLIC PREVIEW */}
                <div style={{ background: "#0f172a", borderRadius: 16, padding: "20px 24px", border: "1px solid #1e293b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                      <FaEye size={12} color="#38bdf8" /> Live Public Preview (As Seen by Visitors)
                    </div>
                    <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Live interactive rendering</span>
                  </div>

                  <div style={{ background: "#f8fafc", borderRadius: 14, padding: "24px 20px", border: "1px solid #e2e8f0" }}>
                    {(!currentContent.stats || currentContent.stats.length === 0) ? (
                      <div style={{ textAlign: "center", padding: "30px 20px", color: "#64748b" }}>
                        <p style={{ margin: "0 0 10px", fontSize: "0.95rem" }}>No stat cards configured yet for this page.</p>
                        <button
                          type="button"
                          onClick={handleResetDefaultStats}
                          style={{
                            background: "#003190",
                            color: "#fff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 8,
                            fontSize: "0.84rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Load Standard Cards for {currentPage?.nav_label || "this page"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                        {(currentContent.stats || []).map((s, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#ffffff",
                              borderRadius: 18,
                              padding: "24px 16px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 8px 20px -4px rgba(0, 49, 144, 0.06)",
                              textAlign: "center",
                              position: "relative",
                              overflow: "hidden"
                            }}
                          >
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color || "#003190" }} />
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: `${s.color || "#003190"}18`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 12px",
                                color: s.color || "#003190"
                              }}
                            >
                              {renderStatIcon(s.icon, s.color || "#003190", 20)}
                            </div>
                            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: 6, fontFamily: "serif" }}>
                              {s.num || "—"}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, letterSpacing: 0.2 }}>
                              {s.label || "Metric Label"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* CURRENT STAT CARDS EDIT LIST */}
                <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaSlidersH color="#38bdf8" /> Configure Stat Cards ({(currentContent.stats || []).length})
                    </h4>
                    <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                      Values update live. Click "Save All Stat Cards" when done.
                    </span>
                  </div>

                  {(!currentContent.stats || currentContent.stats.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "36px 20px", background: "#1f2937", borderRadius: 12, border: "1px dashed #374151" }}>
                      <p style={{ margin: "0 0 12px", color: "#9ca3af", fontSize: "0.9rem" }}>
                        There are currently no stat cards configured for this page.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetDefaultStats}
                        style={{
                          background: "#2563eb",
                          color: "#fff",
                          border: "none",
                          padding: "9px 18px",
                          borderRadius: 8,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Load Suggested Cards
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(currentContent.stats || []).map((card, idx) => (
                        <div
                          key={idx}
                          className="rofr-stat-item-box"
                          style={{
                            background: "#1e293b",
                            borderRadius: 14,
                            padding: "18px 20px",
                            border: `1px solid ${card.color ? `${card.color}40` : "#334155"}`,
                            position: "relative"
                          }}
                        >
                          {/* Card Header with reorder & delete */}
                          <div className="rofr-stat-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid #334155", paddingBottom: 10 }}>
                            <div className="rofr-stat-item-title-wrap" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <span
                                className="rofr-stat-item-badge adm-badge-pill"
                                style={{
                                  background: card.color || "#003190",
                                  color: "#ffffff",
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  letterSpacing: "0.04em",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  display: "inline-block"
                                }}
                              >
                                CARD #{idx + 1}
                              </span>
                              <span className="rofr-stat-item-title" style={{ color: "#e2e8f0", fontSize: "0.88rem", fontWeight: 700 }} title={`${card.num || "Empty Value"} — ${card.label || "Unnamed Metric"}`}>
                                {card.num || "Empty Value"} — {card.label || "Unnamed Metric"}
                              </span>
                            </div>

                            <div className="rofr-stat-item-controls" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              <button
                                type="button"
                                onClick={() => handleMoveStatCard(idx, -1)}
                                disabled={idx === 0}
                                className="rofr-stat-btn-arrow"
                                style={{
                                  background: "#0f172a",
                                  color: idx === 0 ? "#475569" : "#cbd5e1",
                                  border: "1px solid #334155",
                                  borderRadius: 6,
                                  width: 28,
                                  height: 28,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: idx === 0 ? "not-allowed" : "pointer"
                                }}
                                title="Move Up"
                              >
                                <FaArrowUp size={11} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMoveStatCard(idx, 1)}
                                disabled={idx === currentContent.stats.length - 1}
                                className="rofr-stat-btn-arrow"
                                style={{
                                  background: "#0f172a",
                                  color: idx === currentContent.stats.length - 1 ? "#475569" : "#cbd5e1",
                                  border: "1px solid #334155",
                                  borderRadius: 6,
                                  width: 28,
                                  height: 28,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: idx === currentContent.stats.length - 1 ? "not-allowed" : "pointer"
                                }}
                                title="Move Down"
                              >
                                <FaArrowDown size={11} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteStatCard(idx)}
                                className="rofr-stat-btn-del"
                                style={{
                                  background: "rgba(239, 68, 68, 0.12)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  borderRadius: 6,
                                  padding: "5px 10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  marginLeft: 6
                                }}
                                title="Delete this card"
                              >
                                <FaTrash size={11} /> Delete
                              </button>
                            </div>
                          </div>

                          {/* Card Inputs Grid */}
                          <div className="rofr-stat-inputs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
                            {/* 1. Value / Number */}
                            <div>
                              <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                                Stat Number / Value (e.g. 15,453, 1,03,397, 4,735)
                              </label>
                              <input
                                type="text"
                                value={card.num || ""}
                                onChange={(e) => handleUpdateStatCard(idx, "num", e.target.value)}
                                placeholder="e.g. 15,453 or 1,03,397"
                                style={{
                                  width: "100%",
                                  background: "#0f172a",
                                  border: "1px solid #334155",
                                  borderRadius: 8,
                                  color: "#ffffff",
                                  padding: "9px 12px",
                                  fontSize: "0.9rem",
                                  fontWeight: 700,
                                  boxSizing: "border-box"
                                }}
                              />
                            </div>

                            {/* 2. Label / Title */}
                            <div>
                              <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                                Card Label / Description (e.g. Claims Approved, Acres Distributed)
                              </label>
                              <input
                                type="text"
                                value={card.label || ""}
                                onChange={(e) => handleUpdateStatCard(idx, "label", e.target.value)}
                                placeholder="e.g. Claims Approved"
                                style={{
                                  width: "100%",
                                  background: "#0f172a",
                                  border: "1px solid #334155",
                                  borderRadius: 8,
                                  color: "#ffffff",
                                  padding: "9px 12px",
                                  fontSize: "0.88rem",
                                  boxSizing: "border-box"
                                }}
                              />
                            </div>

                            {/* 3. Icon Selector */}
                            <div>
                              <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                                Card Icon
                              </label>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: `${card.color || "#003190"}25`,
                                    color: card.color || "#003190",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                  }}
                                >
                                  {renderStatIcon(card.icon, card.color || "#003190", 17)}
                                </div>
                                <select
                                  value={card.icon || "balance"}
                                  onChange={(e) => handleUpdateStatCard(idx, "icon", e.target.value)}
                                  style={{
                                    flex: 1,
                                    background: "#0f172a",
                                    border: "1px solid #334155",
                                    borderRadius: 8,
                                    color: "#ffffff",
                                    padding: "9px 10px",
                                    fontSize: "0.85rem",
                                    boxSizing: "border-box"
                                  }}
                                >
                                  {STAT_ICON_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* 4. Accent Color */}
                            <div>
                              <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                                Accent Stripe & Icon Color
                              </label>
                              <div className="rofr-stat-color-row" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                {STAT_COLOR_OPTIONS.map((c) => (
                                  <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => handleUpdateStatCard(idx, "color", c.value)}
                                    title={c.label}
                                    className="rofr-stat-color-swatch"
                                    style={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: 6,
                                      background: c.value,
                                      border: card.color === c.value ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.2)",
                                      cursor: "pointer",
                                      boxShadow: card.color === c.value ? "0 0 6px rgba(255,255,255,0.5)" : "none",
                                      padding: 0
                                    }}
                                  />
                                ))}
                                <input
                                  type="text"
                                  value={card.color || "#003190"}
                                  onChange={(e) => handleUpdateStatCard(idx, "color", e.target.value)}
                                  placeholder="#003190"
                                  className="rofr-stat-color-input"
                                  style={{
                                    width: 80,
                                    background: "#0f172a",
                                    border: "1px solid #334155",
                                    borderRadius: 6,
                                    color: "#ffffff",
                                    padding: "4px 8px",
                                    fontSize: "0.78rem",
                                    textAlign: "center"
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ADD NEW STAT CARD FORM */}
                <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px", color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                    <FaPlus color="#10b981" /> Add New Metric Card
                  </h4>

                  {/* Quick Preset Buttons */}
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginRight: 8 }}>Quick Presets:</span>
                    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {[
                        { num: "15,453", label: "RoFR Claims Approved", icon: "balance", color: "#003190" },
                        { num: "1,03,397", label: "Acres Distributed", icon: "map", color: "#3E8E0F" },
                        { num: "4,735", label: "Claims Under Process", icon: "clock", color: "#F5A000" },
                        { num: "37,794", label: "Pending Extent (Acres)", icon: "chart", color: "#D2190C" },
                        { num: "57,597", label: "Total RoFR Submissions", icon: "balance", color: "#003190" },
                        { num: "4,360", label: "LTR Cases Registered", icon: "gavel", color: "#2563eb" },
                        { num: "8,940", label: "LTR Extent Under Dispute", icon: "map", color: "#D2190C" }
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleQuickAddPreset(preset)}
                          className="rofr-preset-btn"
                          style={{
                            background: "#1f2937",
                            color: "#93c5fd",
                            border: "1px solid #374151",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: "0.74rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          + {preset.num} {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleAddStatCard}>
                    <div className="rofr-stat-inputs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 16 }}>
                      {/* Number/Value */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                          Number / Stat Value *
                        </label>
                        <input
                          type="text"
                          value={newStatCard.num}
                          onChange={(e) => setNewStatCard((prev) => ({ ...prev, num: e.target.value }))}
                          placeholder="e.g. 15,453 or 1,03,397"
                          required
                          style={{
                            width: "100%",
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            color: "#ffffff",
                            padding: "9px 12px",
                            fontSize: "0.88rem",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      {/* Label */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                          Metric Label / Subtitle *
                        </label>
                        <input
                          type="text"
                          value={newStatCard.label}
                          onChange={(e) => setNewStatCard((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="e.g. RoFR Claims Approved"
                          required
                          style={{
                            width: "100%",
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            color: "#ffffff",
                            padding: "9px 12px",
                            fontSize: "0.88rem",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>

                      {/* Icon */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                          Select Icon
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: `${newStatCard.color || "#003190"}25`,
                              color: newStatCard.color || "#003190",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            {renderStatIcon(newStatCard.icon, newStatCard.color || "#003190", 17)}
                          </div>
                          <select
                            value={newStatCard.icon}
                            onChange={(e) => setNewStatCard((prev) => ({ ...prev, icon: e.target.value }))}
                            style={{
                              flex: 1,
                              background: "#0f172a",
                              border: "1px solid #334155",
                              borderRadius: 8,
                              color: "#ffffff",
                              padding: "9px 10px",
                              fontSize: "0.85rem",
                              boxSizing: "border-box"
                            }}
                          >
                            {STAT_ICON_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
                          Accent Stripe Color
                        </label>
                        <div className="rofr-stat-color-row" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {STAT_COLOR_OPTIONS.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setNewStatCard((prev) => ({ ...prev, color: c.value }))}
                              title={c.label}
                              className="rofr-stat-color-swatch"
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                background: c.value,
                                border: newStatCard.color === c.value ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.2)",
                                cursor: "pointer",
                                boxShadow: newStatCard.color === c.value ? "0 0 6px rgba(255,255,255,0.5)" : "none",
                                padding: 0
                              }}
                            />
                          ))}
                          <input
                            type="text"
                            value={newStatCard.color}
                            onChange={(e) => setNewStatCard((prev) => ({ ...prev, color: e.target.value }))}
                            placeholder="#003190"
                            className="rofr-stat-color-input"
                            style={{
                              width: 80,
                              background: "#0f172a",
                              border: "1px solid #334155",
                              borderRadius: 6,
                              color: "#ffffff",
                              padding: "4px 8px",
                              fontSize: "0.78rem",
                              textAlign: "center"
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="rofr-btn-add-metric"
                      style={{
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: 8,
                        fontSize: "0.86rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                      }}
                    >
                      <FaPlus size={12} /> Add Metric Card to {currentPage?.nav_label || "Page"}
                    </button>
                  </form>
                </div>

                {/* BOTTOM FLOATING SAVE BAR */}
                <div
                  className="rofr-stat-save-bar"
                  style={{
                    background: "#0f172a",
                    borderRadius: 14,
                    padding: "16px 20px",
                    border: "1px solid #334155",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12
                  }}
                >
                  <div className="rofr-stat-save-text" style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
                    Editing <strong>{(currentContent.stats || []).length} stat cards</strong> for <strong>{currentPage?.nav_label || currentPage?.title}</strong>. Click Save to persist to database.
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveContent}
                    disabled={saving}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: saving ? "#059669" : "#10b981",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: 8,
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      cursor: saving ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                    }}
                  >
                    <FaSave size={14} /> {saving ? "Saving Changes..." : "Save All Stat Cards"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: PDF DOCUMENTS SECTION */}
            {activeSection === "documents" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* DUAL MODE ADD DOCUMENT BOX */}
                <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                        <FaCloudUploadAlt color="#3b82f6" /> Add Official PDF Document
                      </h3>
                      <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "0.82rem" }}>
                        Attach PDF document via computer file upload or cloud share link (Google Drive, web link).
                      </p>
                    </div>

                    {/* Mode Toggle */}
                    <div style={{ display: "flex", background: "#1f2937", padding: "3px", borderRadius: 8, border: "1px solid #374151" }}>
                      <button
                        type="button"
                        onClick={() => setDocAddMode("upload")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: docAddMode === "upload" ? "#0284c7" : "transparent",
                          color: docAddMode === "upload" ? "#ffffff" : "#9ca3af"
                        }}
                      >
                        <FaCloudUploadAlt style={{ marginRight: 6 }} /> Upload PDF File
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocAddMode("url")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: docAddMode === "url" ? "#0284c7" : "transparent",
                          color: docAddMode === "url" ? "#ffffff" : "#9ca3af"
                        }}
                      >
                        <FaLink style={{ marginRight: 6 }} /> Shareable URL (Google Drive)
                      </button>
                    </div>
                  </div>

                  {docAddMode === "upload" ? (
                    <div>
                      <input
                        type="file"
                        ref={pdfInputRef}
                        accept=".pdf,application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handlePdfFileSelect(e.target.files[0]);
                          }
                        }}
                      />

                      {!stagedDoc ? (
                        <div
                          onClick={() => pdfInputRef.current && pdfInputRef.current.click()}
                          style={{
                            border: "2px dashed #374151",
                            borderRadius: 12,
                            padding: "36px 20px",
                            textAlign: "center",
                            cursor: isUploadingPdf ? "not-allowed" : "pointer",
                            background: "rgba(31, 41, 55, 0.4)",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <FaFilePdf size={40} style={{ color: "#3b82f6", marginBottom: 12, opacity: 0.8 }} />
                          <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.95rem" }}>
                            {isUploadingPdf ? "Uploading PDF file..." : "Click to select PDF document from your computer"}
                          </div>
                          <div style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: 6 }}>
                            Saved directly to <code>/uploads/rofr/</code> directory
                          </div>
                          {uploadPdfError && (
                            <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: 8 }}>
                              ⚠️ {uploadPdfError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ background: "#1f2937", borderRadius: 12, padding: "18px 20px", border: "1px solid #374151" }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#34d399", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                            <FaCheckCircle /> PDF Uploaded to Server! Set Display Title and Details:
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                            <div>
                              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                                Document Display Title *
                              </label>
                              <input
                                type="text"
                                value={stagedDoc.text}
                                onChange={(e) => setStagedDoc({ ...stagedDoc, text: e.target.value })}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                                File Size
                              </label>
                              <input
                                type="text"
                                value={stagedDoc.size}
                                onChange={(e) => setStagedDoc({ ...stagedDoc, size: e.target.value })}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                                Date / Year
                              </label>
                              <input
                                type="text"
                                value={stagedDoc.date}
                                onChange={(e) => setStagedDoc({ ...stagedDoc, date: e.target.value })}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                              />
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => setStagedDoc(null)}
                              style={{ background: "transparent", color: "#9ca3af", border: "1px solid #4b5563", padding: "8px 16px", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleAddStagedDoc}
                              style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                            >
                              <FaPlus /> Add Document to Page
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleAddUrlDoc} style={{ background: "#1f2937", borderRadius: 12, padding: "18px 20px", border: "1px solid #374151" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                            Document Display Title *
                          </label>
                          <input
                            type="text"
                            value={urlDocData.text}
                            onChange={(e) => setUrlDocData({ ...urlDocData, text: e.target.value })}
                            placeholder="e.g. High Court Writ Petition"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                            Shareable URL (Google Drive / Web PDF) *
                          </label>
                          <input
                            type="text"
                            value={urlDocData.url}
                            onChange={(e) => setUrlDocData({ ...urlDocData, url: e.target.value })}
                            placeholder="https://drive.google.com/file/d/..."
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                            Date / Year
                          </label>
                          <input
                            type="text"
                            value={urlDocData.date}
                            onChange={(e) => setUrlDocData({ ...urlDocData, date: e.target.value })}
                            placeholder="e.g. 2024"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="submit"
                          style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "8px 20px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <FaPlus /> Add Document via URL
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* ATTACHED DOCUMENTS LIST */}
                <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                        Attached Official Documents ({filteredDownloads.length})
                      </h3>
                      <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: "0.8rem" }}>
                        Documents displayed on public page <code>/{currentPage.slug}</code>
                      </p>
                    </div>

                    <div style={{ position: "relative", minWidth: 260 }}>
                      <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "0.85rem" }} />
                      <input
                        type="text"
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        placeholder="Search document title..."
                        style={{ width: "100%", padding: "7px 12px 7px 34px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.82rem" }}
                      />
                    </div>
                  </div>

                  {filteredDownloads.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                      <FaFilePdf size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
                      <p style={{ margin: 0, fontSize: "0.95rem" }}>
                        {docSearch ? "No documents match your search query." : "No PDF documents attached yet to this page."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {filteredDownloads.map((doc, idx) => {
                        const isCloud = doc.url?.includes("drive.google.com");
                        return (
                          <div
                            key={doc.id || idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 16px",
                              borderRadius: 10,
                              background: "#1f2937",
                              border: "1px solid #374151",
                              gap: 14,
                              flexWrap: "wrap"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 240 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <FaFilePdf size={16} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "0.9rem" }}>
                                  {doc.text || doc.title || doc.filename || "Untitled Document"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
                                  {doc.filename && <span>{doc.filename}</span>}
                                  {doc.size && <span>• {doc.size}</span>}
                                  {doc.date && <span>• {doc.date}</span>}
                                  {isCloud ? (
                                    <span style={{ color: "#60a5fa", fontWeight: 700 }}>• Google Drive</span>
                                  ) : (
                                    <span style={{ color: "#34d399", fontWeight: 700 }}>• Local File</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open / Preview PDF"
                                style={{
                                  background: "#374151",
                                  color: "#60a5fa",
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  fontSize: "0.78rem",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5
                                }}
                              >
                                <FaEye /> Preview
                              </a>

                              <button
                                onClick={() => handleOpenEditDoc(doc, idx)}
                                title="Edit Document Details"
                                style={{
                                  background: "#374151",
                                  color: "#93c5fd",
                                  border: "none",
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  fontSize: "0.78rem",
                                  cursor: "pointer"
                                }}
                              >
                                <FaEdit /> Edit
                              </button>

                              <button
                                onClick={() => handleMoveDoc(idx, -1)}
                                disabled={idx === 0}
                                title="Move Up"
                                style={{ background: "#374151", color: idx === 0 ? "#4b5563" : "#d1d5db", border: "none", padding: "6px 8px", borderRadius: 8, cursor: idx === 0 ? "not-allowed" : "pointer" }}
                              >
                                <FaArrowUp size={11} />
                              </button>

                              <button
                                onClick={() => handleMoveDoc(idx, 1)}
                                disabled={idx === filteredDownloads.length - 1}
                                title="Move Down"
                                style={{ background: "#374151", color: idx === filteredDownloads.length - 1 ? "#4b5563" : "#d1d5db", border: "none", padding: "6px 8px", borderRadius: 8, cursor: idx === filteredDownloads.length - 1 ? "not-allowed" : "pointer" }}
                              >
                                <FaArrowDown size={11} />
                              </button>

                              <button
                                onClick={() => handleDeleteDoc(idx)}
                                title="Delete Document"
                                style={{
                                  background: "rgba(239, 68, 68, 0.1)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  fontSize: "0.78rem",
                                  cursor: "pointer"
                                }}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MAPS & IMAGES SECTION */}
            {activeSection === "images" && (
              <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaImages color="#3b82f6" /> Maps & Visual Field Evidence ({(currentContent.images || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "0.82rem" }}>
                      Upload RoFR claim abstracts, grounds diagrams, and LTR case maps. Stored directly into <code>/uploads/rofr/</code>.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="file"
                      ref={imgInputRef}
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAddImgMode("upload");
                        setAddImgModalError("");
                        setNewImgUrlData({ url: "", name: "", caption: "" });
                        setShowAddImgUrlModal(true);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)"
                      }}
                    >
                      <FaCloudUploadAlt /> + Upload & Add New Map / Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddImgMode("url");
                        setAddImgModalError("");
                        setNewImgUrlData({ url: "", name: "", caption: "" });
                        setShowAddImgUrlModal(true);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#1f2937",
                        color: "#93c5fd",
                        border: "1px solid #374151",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      <FaLink /> Add via URL
                    </button>
                  </div>
                </div>

                {uploadImgError && (
                  <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: 12 }}>
                    ⚠️ {uploadImgError}
                  </div>
                )}

                {(currentContent.images || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaImages size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>No maps or images attached to this page yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {(currentContent.images || []).map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#1f2937",
                          borderRadius: 12,
                          overflow: "hidden",
                          border: "1px solid #374151",
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        <div style={{ height: 180, overflow: "hidden", background: "#0b0f19", position: "relative" }}>
                          <img
                            src={img.src || img.url}
                            alt={img.alt || img.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/uploads/rofr/rf.png";
                            }}
                          />
                          <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "white", padding: "3px 8px", borderRadius: 5, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                            Image #{idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditImg(img, idx)}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background: "rgba(15, 23, 42, 0.85)",
                              backdropFilter: "blur(4px)",
                              color: "#60a5fa",
                              border: "1px solid rgba(96, 165, 250, 0.4)",
                              padding: "4px 9px",
                              borderRadius: 6,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              zIndex: 2
                            }}
                          >
                            <FaEdit size={10} /> Edit / Replace
                          </button>
                        </div>
                        <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <input
                              type="text"
                              value={img.name || img.caption || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateCurrentContent((prev) => {
                                  const images = [...(prev.images || [])];
                                  images[idx] = { ...images[idx], name: val, caption: val, alt: val };
                                  return { ...prev, images };
                                });
                              }}
                              placeholder="Image Caption / Name"
                              style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.82rem", marginBottom: 8 }}
                            />
                            <div style={{ fontSize: "0.72rem", color: "#64748b", wordBreak: "break-all" }}>
                              {img.src || img.url}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <a
                                href={img.src || img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ background: "#374151", color: "#60a5fa", padding: "5px 10px", borderRadius: 6, fontSize: "0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <FaEye size={10} /> View Full
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenEditImg(img, idx)}
                                style={{ background: "#374151", color: "#93c5fd", border: "1px solid #4b5563", padding: "5px 10px", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                              >
                                <FaEdit size={10} /> Edit
                              </button>
                            </div>

                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, -1)}
                                disabled={idx === 0}
                                title="Move Left/Up"
                                style={{ background: "#374151", border: "1px solid #4b5563", color: idx === 0 ? "#6b7280" : "#cbd5e1", padding: "5px 8px", borderRadius: 6, cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: "0.75rem" }}
                              >
                                <FaArrowUp size={10} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 1)}
                                disabled={idx === (currentContent.images || []).length - 1}
                                title="Move Right/Down"
                                style={{ background: "#374151", border: "1px solid #4b5563", color: idx === (currentContent.images || []).length - 1 ? "#6b7280" : "#cbd5e1", padding: "5px 8px", borderRadius: 6, cursor: idx === (currentContent.images || []).length - 1 ? "not-allowed" : "pointer", fontSize: "0.75rem" }}
                              >
                                <FaArrowDown size={10} />
                              </button>
                              <button
                                onClick={() => handleDeleteImage(idx)}
                                style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "5px 10px", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer" }}
                              >
                                <FaTrash size={10} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FIELD VIDEOS */}
            {activeSection === "videos" && (
              <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaVideo color="#3b82f6" /> Field Documentation Videos ({(currentContent.videos || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "0.82rem" }}>
                      Upload local MP4/WebM videos or embed YouTube/Vimeo links for field reviews.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => handleOpenAddVideo("upload")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 10px rgba(37, 99, 235, 0.3)"
                      }}
                    >
                      <FaCloudUploadAlt size={14} /> Upload Video File
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAddVideo("url")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#1e293b",
                        color: "#93c5fd",
                        border: "1px solid #334155",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      <FaLink size={12} /> Add via Video URL
                    </button>
                  </div>
                </div>

                {(currentContent.videos || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b", background: "#0f172a", borderRadius: 12, border: "1px dashed #334155" }}>
                    <FaVideo size={42} style={{ opacity: 0.35, marginBottom: 12 }} />
                    <p style={{ margin: "0 0 14px", fontSize: "0.95rem", color: "#94a3b8" }}>No video documentation added to this page yet.</p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenAddVideo("upload")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "#2563eb", color: "#ffffff", border: "none", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        <FaCloudUploadAlt size={14} /> Upload Video File (MP4, WebM)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAddVideo("url")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#1e293b", color: "#93c5fd", border: "1px solid #334155", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        <FaLink size={12} /> Add Video URL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
                    {(currentContent.videos || []).map((vid, idx) => {
                      const isYt = isYouTubeUrl(vid.url);
                      return (
                        <div
                          key={vid.id || idx}
                          style={{
                            background: "#1f2937",
                            borderRadius: 12,
                            overflow: "hidden",
                            border: "1px solid #374151",
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >
                          {/* Video Player / Embed Preview */}
                          <div style={{ position: "relative", width: "100%", height: 190, background: "#000" }}>
                            {isYt ? (
                              <iframe
                                src={getYouTubeEmbedUrl(vid.url)}
                                title={vid.title || "Video"}
                                style={{ width: "100%", height: "100%", border: "none" }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={vid.url}
                                controls
                                preload="metadata"
                                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                              />
                            )}
                            <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.75)", color: isYt ? "#ef4444" : "#38bdf8", padding: "3px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                              {isYt ? <FaYoutube size={12} /> : <FaVideo size={10} />}
                              <span>{isYt ? "YouTube" : "MP4 / File"}</span>
                            </div>
                          </div>

                          {/* Video Details */}
                          <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.94rem", marginBottom: 6, lineHeight: 1.3 }}>
                                {vid.title}
                              </div>
                              {vid.description && (
                                <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 8, lineHeight: 1.4 }}>
                                  {vid.description}
                                </div>
                              )}
                              <div style={{ fontSize: "0.72rem", color: "#60a5fa", wordBreak: "break-all", background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 4, marginBottom: 12 }}>
                                {vid.url}
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, paddingTop: 10, borderTop: "1px solid #374151" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => setPreviewingVid(vid)}
                                  style={{ background: "#374151", color: "#93c5fd", border: "1px solid #4b5563", padding: "5px 10px", borderRadius: 6, fontSize: "0.74rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <FaPlay size={9} /> Fullscreen
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditVideo(vid, idx)}
                                  style={{ background: "#374151", color: "#e2e8f0", border: "1px solid #4b5563", padding: "5px 10px", borderRadius: 6, fontSize: "0.74rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <FaEdit size={10} /> Edit
                                </button>
                              </div>

                              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVideo(idx, -1)}
                                  disabled={idx === 0}
                                  title="Move Left/Up"
                                  style={{ background: "#374151", border: "1px solid #4b5563", color: idx === 0 ? "#6b7280" : "#cbd5e1", padding: "5px 7px", borderRadius: 6, cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: "0.74rem" }}
                                >
                                  <FaArrowUp size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVideo(idx, 1)}
                                  disabled={idx === (currentContent.videos || []).length - 1}
                                  title="Move Right/Down"
                                  style={{ background: "#374151", border: "1px solid #4b5563", color: idx === (currentContent.videos || []).length - 1 ? "#6b7280" : "#cbd5e1", padding: "5px 7px", borderRadius: 6, cursor: idx === (currentContent.videos || []).length - 1 ? "not-allowed" : "pointer", fontSize: "0.74rem" }}
                                >
                                  <FaArrowDown size={10} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(idx)}
                                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "5px 9px", borderRadius: 6, fontSize: "0.74rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <FaTrash size={10} /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: OVERVIEW TEXT / PARAGRAPHS */}
            {activeSection === "content" && (
              <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaFileAlt color="#3b82f6" /> Page Overview &amp; Narrative Paragraphs ({(currentContent.paragraphs || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "0.82rem" }}>
                      Introductory briefings, statutory overviews, field narratives, and contextual notes.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={handleAddParagraph}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "#1e293b",
                        color: "#93c5fd",
                        border: "1px solid #334155",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      <FaPlus /> Add Paragraph
                    </button>
                    <button
                      onClick={handleSaveParagraphs}
                      disabled={saving}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 18px",
                        borderRadius: 8,
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: saving ? "not-allowed" : "pointer",
                        boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)"
                      }}
                    >
                      <FaSave /> {saving ? "Saving..." : "Save Overview Paragraphs"}
                    </button>
                  </div>
                </div>

                {(currentContent.paragraphs || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b", background: "#0f172a", borderRadius: 12, border: "1px dashed #334155" }}>
                    <FaFileAlt size={40} style={{ opacity: 0.35, marginBottom: 12 }} />
                    <p style={{ margin: "0 0 14px", fontSize: "0.95rem", color: "#94a3b8" }}>No overview paragraphs configured for this page yet.</p>
                    <button
                      onClick={handleAddParagraph}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "#2563eb", color: "#ffffff", border: "none", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      <FaPlus /> Add First Paragraph
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(currentContent.paragraphs || []).map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#1f2937",
                          borderRadius: 12,
                          padding: 16,
                          border: "1px solid #374151"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "2px 8px", borderRadius: 4 }}>
                              Paragraph #{idx + 1}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              {p.length} chars • {p.trim() ? p.trim().split(/\s+/).length : 0} words
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={() => handleMoveParagraph(idx, -1)}
                              disabled={idx === 0}
                              title="Move Paragraph Up"
                              style={{
                                background: "#111827",
                                color: idx === 0 ? "#4b5563" : "#93c5fd",
                                border: "1px solid #374151",
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: idx === 0 ? "not-allowed" : "pointer"
                              }}
                            >
                              <FaArrowUp size={11} />
                            </button>
                            <button
                              onClick={() => handleMoveParagraph(idx, 1)}
                              disabled={idx === (currentContent.paragraphs || []).length - 1}
                              title="Move Paragraph Down"
                              style={{
                                background: "#111827",
                                color: idx === (currentContent.paragraphs || []).length - 1 ? "#4b5563" : "#93c5fd",
                                border: "1px solid #374151",
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: idx === (currentContent.paragraphs || []).length - 1 ? "not-allowed" : "pointer"
                              }}
                            >
                              <FaArrowDown size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteParagraph(idx)}
                              title="Delete Paragraph"
                              style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              <FaTrash size={10} /> Delete
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          value={p}
                          onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                          placeholder="Type paragraph text here... This appears directly in the Overview & Description on the live page."
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: 8,
                            background: "#111827",
                            border: "1px solid #374151",
                            color: "#ffffff",
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                            resize: "vertical"
                          }}
                        />
                      </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 10 }}>
                      <button
                        onClick={handleAddParagraph}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#1e293b", color: "#93c5fd", border: "1px solid #334155", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        <FaPlus /> Add Another Paragraph
                      </button>
                      <button
                        onClick={handleSaveParagraphs}
                        disabled={saving}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 8, background: "#10b981", color: "#ffffff", border: "none", fontSize: "0.86rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)" }}
                      >
                        <FaSave /> {saving ? "Saving..." : "Save Overview Paragraphs to Live Site"}
                      </button>
                    </div>

                    {/* LIVE PREVIEW CONTAINER */}
                    <div style={{ marginTop: 24, padding: "20px 24px", background: "#0f172a", borderRadius: 12, border: "1px solid #1e293b" }}>
                      <div style={{ fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", color: "#38bdf8", letterSpacing: 1.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <FaEye size={12} /> Live Preview on Public Page ({currentPage.slug})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {(currentContent.paragraphs || []).filter(p => p && p.trim()).map((p, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: "0.85rem", marginTop: 2 }}>{idx + 1}.</span>
                            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.7 }}>{p}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: STRUCTURED TABLES */}
            {activeSection === "tables" && (
              <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                <div className="rofr-tables-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaTable color="#3b82f6" /> Structured Data Tables ({(currentContent.tables || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "0.82rem" }}>
                      Data records, rehabilitation status matrix, colony layout abstracts, and DPR lists.
                    </p>
                  </div>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleSaveTables}
                      disabled={saving}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
                        borderRadius: 8, background: "#10b981", color: "#ffffff",
                        border: "1px solid #059669", fontSize: "0.82rem", fontWeight: 700,
                        cursor: saving ? "not-allowed" : "pointer",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)"
                      }}
                    >
                      <FaSave size={13} /> {saving ? "Saving Tables..." : "Save All Tables"}
                    </button>

                    <button
                      onClick={handleAddTable}
                      className="rofr-btn-add-table"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
                        borderRadius: 8, background: "#2563eb", color: "#ffffff",
                        border: "none", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      <FaPlus /> Add New Table
                    </button>
                  </div>
                </div>

                {(currentContent.tables || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaTable size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>No data tables attached to this page yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {(currentContent.tables || []).map((tbl, tIdx) => (
                      <div
                        key={tIdx}
                        style={{
                          background: "#1f2937",
                          borderRadius: 12,
                          padding: 18,
                          border: "1px solid #374151"
                        }}
                      >
                        <div className="rofr-table-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <input
                            type="text"
                            value={tbl.title || `Table #${tIdx + 1}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentContent((prev) => {
                                const tables = [...(prev.tables || [])];
                                tables[tIdx] = { ...tables[tIdx], title: val };
                                return { ...prev, tables };
                              });
                            }}
                            style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.95rem", background: "transparent", border: "1px solid #374151", borderRadius: 6, padding: "4px 8px" }}
                          />
                          <button
                            onClick={() => handleDeleteTable(tIdx)}
                            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            <FaTrash /> Delete Table
                          </button>
                        </div>

                        {/* Mobile Swipe Hint */}
                        <div style={{ fontSize: "0.72rem", color: "#64748b", margin: "4px 0 8px", display: "flex", alignItems: "center", gap: 5 }}>
                          <span>⇄ Swipe table horizontally to edit all columns</span>
                        </div>

                        {/* TABLE MATRIX */}
                        <div className="rofr-table-scroll-wrap" style={{ overflowX: "auto", border: "1px solid #374151", borderRadius: 8 }}>
                          <table className="rofr-matrix-table" style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: "0.82rem" }}>
                            <thead>
                              <tr style={{ background: "#111827" }}>
                                {(tbl.headers || []).map((h, hIdx) => (
                                  <th key={hIdx} style={{ padding: "8px 10px", borderBottom: "1px solid #374151", textAlign: "left", color: "#9ca3af", minWidth: hIdx === 0 ? 60 : 130 }}>
                                    <input
                                      type="text"
                                      value={h}
                                      onChange={(e) => handleUpdateTableHeader(tIdx, hIdx, e.target.value)}
                                      style={{ width: "100%", background: "transparent", border: "none", color: "#60a5fa", fontWeight: 700, fontSize: "0.82rem" }}
                                    />
                                  </th>
                                ))}
                                <th style={{ width: 40, borderBottom: "1px solid #374151" }} />
                              </tr>
                            </thead>
                            <tbody>
                              {(tbl.rows || []).map((row, rIdx) => (
                                <tr key={rIdx} style={{ borderBottom: "1px solid #2d3748" }}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} style={{ padding: "6px 10px", minWidth: cIdx === 0 ? 60 : 130 }}>
                                      <input
                                        type="text"
                                        value={cell || ""}
                                        onChange={(e) => handleUpdateTableCell(tIdx, rIdx, cIdx, e.target.value)}
                                        style={{ width: "100%", background: "transparent", border: "none", color: "#ffffff", fontSize: "0.82rem" }}
                                      />
                                    </td>
                                  ))}
                                  <td style={{ textAlign: "center", padding: "4px" }}>
                                    <button
                                      onClick={() => handleDeleteTableRow(tIdx, rIdx)}
                                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                                    >
                                      <FaTimes />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <button
                            onClick={() => handleAddTableRow(tIdx)}
                            style={{ background: "#374151", color: "#93c5fd", border: "none", padding: "5px 12px", borderRadius: 6, fontSize: "0.76rem", fontWeight: 600, cursor: "pointer" }}
                          >
                            <FaPlus style={{ marginRight: 4 }} /> Add Row
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: PAGE META & TITLE SETTINGS */}
            {activeSection === "settings" && (
              <div style={{ background: "#111827", borderRadius: 16, padding: "22px 24px", border: "1px solid #1f2937" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 16px", color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaSlidersH color="#3b82f6" /> Page Meta, Titles & Navigation
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                      Dropdown Navigation Label
                    </label>
                    <input
                      type="text"
                      value={currentPage.nav_label || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPages((prev) =>
                          prev.map((p) => (p.slug === currentPage.slug ? { ...p, nav_label: val } : p))
                        );
                      }}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                      Banner Heading Title
                    </label>
                    <input
                      type="text"
                      value={currentPage.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPages((prev) =>
                          prev.map((p) => (p.slug === currentPage.slug ? { ...p, title: val } : p))
                        );
                      }}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                    Subtitle / Summary Description
                  </label>
                  <input
                    type="text"
                    value={currentPage.subtitle || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPages((prev) =>
                        prev.map((p) => (p.slug === currentPage.slug ? { ...p, subtitle: val } : p))
                      );
                    }}
                    placeholder="e.g. Official monitoring records, awards, and rehabilitation compliances"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>
                    Navbar Dropdown Placement / Hierarchy
                  </label>
                  <select
                    value={currentPage.parent_slug || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPages((prev) =>
                        prev.map((p) => (p.slug === currentPage.slug ? { ...p, parent_slug: val } : p))
                      );
                    }}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                  >
                    <option value="">Top-Level in RoFR &amp; LTR Dropdown</option>
                    {pages
                      .filter((p) => p.slug !== currentPage.slug && p.slug !== "rofr" && !p.parent_slug)
                      .map((p) => (
                        <option key={p.slug} value={p.slug}>
                          ↳ Sub-dropdown under {p.nav_label || p.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleSavePageSettings(currentPage)}
                    disabled={saving}
                    style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: "0.84rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
                  >
                    Save Page Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* MODAL: CREATE NEW DROPDOWN PAGE */}
        {showAddPageModal && (
          <div
            className="rofr-modal-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)"
            }}
          >
            <div
              className="rofr-modal-card"
              style={{
                background: "#111827",
                borderRadius: 16,
                padding: "24px 28px",
                width: "90%",
                maxWidth: 520,
                border: "1px solid #374151"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #1f2937", paddingBottom: 12 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaPlus color="#3b82f6" /> Create New RoFR & LTR Dropdown Page
                </h3>
                <button
                  onClick={() => setShowAddPageModal(false)}
                  style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreatePage}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>
                    Page Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newPageData.nav_label}
                    onChange={(e) => {
                      const nav = e.target.value;
                      const autoSlug = nav.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                      setNewPageData((prev) => ({
                        ...prev,
                        nav_label: nav,
                        title: prev.isTitleCustom ? prev.title : nav,
                        slug: prev.isSlugCustom ? prev.slug : autoSlug
                      }));
                    }}
                    placeholder="e.g. Recognition of Forest Rights Details"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "#1f2937",
                      border: "1px solid #3b82f6",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.15)"
                    }}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                    Enter the name. The URL slug, banner header, and category badge are all handled automatically.
                  </p>
                </div>

                {/* PLACEMENT / HIERARCHY SELECTOR */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", marginBottom: 6 }}>
                    Placement / Hierarchy in Navbar
                  </label>
                  <select
                    value={newPageData.parent_slug || ""}
                    onChange={(e) => setNewPageData((prev) => ({ ...prev, parent_slug: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "#1f2937",
                      border: "1px solid #374151",
                      color: "#ffffff",
                      fontSize: "0.88rem"
                    }}
                  >
                    <option value="">Top-Level in RoFR &amp; LTR Dropdown</option>
                    {pages
                      .filter((p) => p.slug !== "rofr" && !p.parent_slug)
                      .map((p) => (
                        <option key={p.slug} value={p.slug}>
                          ↳ Sub-dropdown under {p.nav_label || p.title}
                        </option>
                      ))}
                  </select>
                  <p style={{ margin: "5px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
                    Choose whether this is a top-level dropdown page or nested inside a sub-dropdown flyout.
                  </p>
                </div>

                {/* LIVE AUTO-GENERATED SUMMARY */}
                <div style={{ background: "#0f172a", borderRadius: 10, padding: "12px 16px", border: "1px solid #1e293b", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#94a3b8", marginBottom: 6 }}>
                    <span style={{ color: "#38bdf8", fontWeight: 700 }}>Auto URL:</span>
                    <code style={{ background: "#1e293b", color: "#38bdf8", padding: "3px 8px", borderRadius: 6, fontSize: "0.85rem", fontWeight: 600 }}>
                      /{newPageData.slug || (newPageData.nav_label ? newPageData.nav_label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "page-url")}
                    </code>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                    ✓ URL slug, banner title, and category badge will be created automatically.
                  </div>
                </div>

                {/* ADVANCED CUSTOMIZATION (OPTIONAL) */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedNewPage(!showAdvancedNewPage)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <span>{showAdvancedNewPage ? "▼ Hide Advanced Options" : "▶ Customize URL slug or title (Optional)"}</span>
                  </button>

                  {showAdvancedNewPage && (
                    <div style={{ marginTop: 14, padding: "14px", background: "#1f2937", borderRadius: 10, border: "1px solid #374151", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                          Custom URL Slug
                        </label>
                        <input
                          type="text"
                          value={newPageData.slug}
                          onChange={(e) => setNewPageData((prev) => ({ ...prev, slug: e.target.value, isSlugCustom: true }))}
                          placeholder="auto-generated from name"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.84rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                          Custom Banner Title
                        </label>
                        <input
                          type="text"
                          value={newPageData.title}
                          onChange={(e) => setNewPageData((prev) => ({ ...prev, title: e.target.value, isTitleCustom: true }))}
                          placeholder="defaults to page name"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.84rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
                          Custom Subtitle / Description
                        </label>
                        <input
                          type="text"
                          value={newPageData.subtitle}
                          onChange={(e) => setNewPageData((prev) => ({ ...prev, subtitle: e.target.value }))}
                          placeholder="Short summary for this section"
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#111827", border: "1px solid #374151", color: "#ffffff", fontSize: "0.84rem" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddPageModal(false)}
                    style={{ background: "transparent", color: "#9ca3af", border: "1px solid #4b5563", padding: "10px 18px", borderRadius: 8, fontSize: "0.88rem", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newPageData.nav_label.trim()}
                    style={{
                      background: saving || !newPageData.nav_label.trim() ? "#1d4ed8" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: 8,
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      cursor: saving || !newPageData.nav_label.trim() ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
                    }}
                  >
                    {saving ? "Creating..." : "Create Page"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT DOCUMENT INFORMATION */}
        {editingDocIdx !== null && editingDocData && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(4px)"
            }}
          >
            <div
              style={{
                background: "#111827",
                borderRadius: 16,
                padding: "24px 28px",
                width: "90%",
                maxWidth: 580,
                border: "1px solid #374151"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #1f2937", paddingBottom: 12 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaEdit color="#3b82f6" /> Edit Document Information
                </h3>
                <button
                  onClick={() => {
                    setEditingDocIdx(null);
                    setEditingDocData(null);
                  }}
                  style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
                  Document Display Title *
                </label>
                <input
                  type="text"
                  value={editingDocData.text || ""}
                  onChange={(e) => setEditingDocData({ ...editingDocData, text: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
                  Original Filename
                </label>
                <input
                  type="text"
                  value={editingDocData.filename || ""}
                  onChange={(e) => setEditingDocData({ ...editingDocData, filename: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
                    File Size
                  </label>
                  <input
                    type="text"
                    value={editingDocData.size || ""}
                    onChange={(e) => setEditingDocData({ ...editingDocData, size: e.target.value })}
                    placeholder="e.g. 2.4 MB"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
                    Date / Year
                  </label>
                  <input
                    type="text"
                    value={editingDocData.date || ""}
                    onChange={(e) => setEditingDocData({ ...editingDocData, date: e.target.value })}
                    placeholder="e.g. 2024"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#ffffff", fontSize: "0.88rem" }}
                  />
                </div>
              </div>

              {/* DUAL SOURCE SECTION: LOCAL FILE UPLOAD OR SHAREABLE CLOUD LINK */}
              <div style={{ marginBottom: 18, background: "#0a0f1d", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
                    <FaLink color="#3b82f6" /> File Source: Local Upload or Shareable URL
                  </label>
                  {editingDocData.url && (
                    <a
                      href={editingDocData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#60a5fa",
                        fontSize: "0.75rem",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 600,
                        background: "rgba(59, 130, 246, 0.12)",
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(59, 130, 246, 0.3)"
                      }}
                    >
                      <FaExternalLinkAlt size={10} /> Test / Open Link ↗
                    </a>
                  )}
                </div>

                {/* Option 1: Upload Replacement PDF */}
                <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px dashed #334155" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
                    Option 1: Upload Replacement PDF from Computer
                  </div>
                  <input
                    type="file"
                    ref={editDocFileInputRef}
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleEditDocFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => editDocFileInputRef.current && editDocFileInputRef.current.click()}
                      disabled={isEditingDocUploading}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 8,
                        background: "#0284c7",
                        color: "white",
                        border: "none",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: isEditingDocUploading ? "not-allowed" : "pointer"
                      }}
                    >
                      <FaCloudUploadAlt /> {isEditingDocUploading ? "Uploading PDF..." : "Select Replacement PDF"}
                    </button>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Uploads to <code>/uploads/rofr/</code> & updates filename & size
                    </span>
                  </div>
                  {editDocUploadError && (
                    <div style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 6 }}>
                      ⚠️ {editDocUploadError}
                    </div>
                  )}
                </div>

                {/* Option 2: Shareable URL */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                      Option 2: Shareable URL (Google Drive, Cloud link) or File Path:
                    </span>
                    {editingDocData.url?.includes("drive.google.com") ? (
                      <span style={{ fontSize: "0.7rem", color: "#60a5fa", fontWeight: 700, background: "rgba(96, 165, 250, 0.15)", padding: "2px 7px", borderRadius: 4 }}>
                        Google Drive
                      </span>
                    ) : editingDocData.url?.includes("/uploads/") ? (
                      <span style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 700, background: "rgba(52, 211, 153, 0.15)", padding: "2px 7px", borderRadius: 4 }}>
                        Local Upload
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.7rem", color: "#c084fc", fontWeight: 700, background: "rgba(192, 132, 252, 0.15)", padding: "2px 7px", borderRadius: 4 }}>
                        Web Link
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editingDocData.url || ""}
                    onChange={(e) => setEditingDocData({ ...editingDocData, url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... or /uploads/rofr/document.pdf"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "#60a5fa",
                      fontSize: "0.82rem"
                    }}
                  />
                  <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "0.72rem" }}>
                    💡 Both direct computer uploads and cloud share links (Google Drive, etc.) are fully supported!
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDocIdx(null);
                    setEditingDocData(null);
                    setEditDocUploadError("");
                  }}
                  style={{
                    background: "transparent",
                    color: "#9ca3af",
                    border: "1px solid #4b5563",
                    padding: "9px 18px",
                    borderRadius: 8,
                    fontSize: "0.84rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditDoc}
                  style={{
                    background: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    padding: "9px 22px",
                    borderRadius: 8,
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Update Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT IMAGE & REPLACE FILE */}
        {editingImgData && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20
            }}
          >
            <div
              style={{
                background: "#111827",
                borderRadius: 20,
                border: "1px solid #1f2937",
                width: "100%",
                maxWidth: 580,
                maxHeight: "92vh",
                overflowY: "auto",
                padding: "28px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: 20
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f2937", paddingBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 10 }}>
                  <FaEdit color="#3b82f6" /> Edit Image Details & Replace File
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingImgIdx(null);
                    setEditingImgData(null);
                    setEditImgUploadError("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontSize: "1.1rem"
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {editImgUploadError && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                  ⚠️ {editImgUploadError}
                </div>
              )}

              {/* Image Preview */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Current Image Preview
                </label>
                <div style={{ height: 180, background: "#090d16", borderRadius: 10, overflow: "hidden", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={editingImgData.src || editingImgData.url}
                    alt={editingImgData.name || "Preview"}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/uploads/rofr/rf.png";
                    }}
                  />
                </div>
              </div>

              {/* Direct Replacement Image Upload */}
              <div style={{ background: "#1e293b", padding: 14, borderRadius: 10, border: "1px dashed #3b82f6" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#60a5fa", marginBottom: 4 }}>
                  🔄 Replace Image File (Upload from Computer)
                </label>
                <p style={{ margin: "0 0 10px", fontSize: "0.76rem", color: "#94a3b8" }}>
                  Selecting a new image file will upload to <code>/uploads/rofr/</code> and automatically update this image.
                </p>
                <input
                  type="file"
                  ref={editImgFileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleEditImgFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => editImgFileInputRef.current && editImgFileInputRef.current.click()}
                  disabled={isEditingImgUploading}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: isEditingImgUploading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <FaCloudUploadAlt /> {isEditingImgUploading ? "Uploading Replacement..." : "Select Replacement Image File"}
                </button>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Map / Image Title *
                </label>
                <input
                  type="text"
                  value={editingImgData.name || editingImgData.alt || ""}
                  onChange={(e) => setEditingImgData({ ...editingImgData, name: e.target.value, alt: e.target.value })}
                  placeholder="e.g. RoFR Status Abstract Map"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Caption */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Caption / Technical Description
                </label>
                <textarea
                  rows={3}
                  value={editingImgData.caption || ""}
                  onChange={(e) => setEditingImgData({ ...editingImgData, caption: e.target.value })}
                  placeholder="Official claim abstracts or case maps description..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                    fontSize: "0.84rem",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Image URL / Path */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Image File Path or Web URL
                </label>
                <input
                  type="text"
                  value={editingImgData.src || editingImgData.url || ""}
                  onChange={(e) => setEditingImgData({ ...editingImgData, src: e.target.value, url: e.target.value })}
                  placeholder="/uploads/rofr/... or https://..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                    fontSize: "0.82rem",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid #1f2937" }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingImgIdx(null);
                    setEditingImgData(null);
                    setEditImgUploadError("");
                  }}
                  style={{
                    background: "transparent",
                    color: "#9ca3af",
                    border: "1px solid #374151",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditImg}
                  disabled={saving || isEditingImgUploading}
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  <FaSave /> {saving ? "Saving..." : "Save Image Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD MAP / IMAGE (FILE UPLOAD OR URL) */}
        {showAddImgUrlModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20
            }}
          >
            <div
              style={{
                background: "#111827",
                borderRadius: 20,
                width: "100%",
                maxWidth: 560,
                maxHeight: "92vh",
                overflowY: "auto",
                padding: "26px",
                border: "1px solid #374151",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #1f2937", paddingBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: "1.18rem", fontWeight: 700, margin: 0, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                    <FaImages color="#3b82f6" /> Upload & Add Map / Image
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#9ca3af" }}>
                    Select an image from your device or paste a cloud URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddImgUrlModal(false)}
                  style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              {addImgModalError && (
                <div style={{ color: "#ef4444", fontSize: "0.82rem", background: "rgba(239, 68, 68, 0.1)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: 14 }}>
                  ⚠️ {addImgModalError}
                </div>
              )}

              {/* Mode Toggle: File Upload vs URL */}
              <div style={{ display: "flex", gap: 8, background: "#0f172a", padding: 4, borderRadius: 10, border: "1px solid #1e293b", marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setAddImgMode("upload")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: addImgMode === "upload" ? "#2563eb" : "transparent",
                    color: addImgMode === "upload" ? "#ffffff" : "#94a3b8",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <FaCloudUploadAlt size={15} /> Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => setAddImgMode("url")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: addImgMode === "url" ? "#2563eb" : "transparent",
                    color: addImgMode === "url" ? "#ffffff" : "#94a3b8",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <FaExternalLinkAlt size={12} /> Paste Image URL
                </button>
              </div>

              <form onSubmit={handleAddImgUrl}>
                {/* Mode 1: Device File Upload */}
                {addImgMode === "upload" && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                      Select Image File *
                    </label>
                    <input
                      type="file"
                      ref={addModalFileInputRef}
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAddModalFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <div
                      onClick={() => addModalFileInputRef.current && addModalFileInputRef.current.click()}
                      style={{
                        border: "2px dashed #2563eb",
                        borderRadius: 12,
                        padding: "24px 16px",
                        textAlign: "center",
                        background: "#0b1222",
                        cursor: isAddImgModalUploading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FaCloudUploadAlt size={38} color="#60a5fa" style={{ marginBottom: 8 }} />
                      <p style={{ margin: "0 0 4px", fontSize: "0.92rem", fontWeight: 700, color: "#ffffff" }}>
                        {isAddImgModalUploading ? "Uploading Image to Server..." : "Click to Choose Image from Your Computer"}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.76rem", color: "#94a3b8" }}>
                        Supports JPG, PNG, WEBP, GIF, SVG (auto-saves to <code>/uploads/rofr/</code>)
                      </p>
                    </div>

                    {newImgUrlData.url && newImgUrlData.url.startsWith("/uploads/") && (
                      <div style={{ marginTop: 8, fontSize: "0.76rem", color: "#34d399", background: "rgba(52, 211, 153, 0.1)", padding: "6px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                        <FaCheckCircle /> Uploaded: <code>{newImgUrlData.url}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: Direct URL */}
                {addImgMode === "url" && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                      Image / Map Web URL *
                    </label>
                    <input
                      type="text"
                      value={newImgUrlData.url}
                      onChange={(e) => setNewImgUrlData({ ...newImgUrlData, url: e.target.value })}
                      placeholder="https://... or /uploads/rofr/map.jpg"
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 8,
                        background: "#1f2937",
                        border: "1px solid #374151",
                        color: "#ffffff",
                        fontSize: "0.85rem",
                        fontFamily: "monospace"
                      }}
                    />
                  </div>
                )}

                {/* Live Preview if an image is selected */}
                {newImgUrlData.url && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
                      Preview:
                    </label>
                    <div style={{ height: 160, background: "#090d16", borderRadius: 10, overflow: "hidden", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={newImgUrlData.url}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/uploads/rofr/rf.png";
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Title */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Map / Image Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newImgUrlData.name}
                    onChange={(e) => setNewImgUrlData({ ...newImgUrlData, name: e.target.value })}
                    placeholder="e.g. RoFR Status Abstract Map"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      background: "#1f2937",
                      border: "1px solid #374151",
                      color: "#ffffff",
                      fontSize: "0.88rem",
                      fontWeight: 600
                    }}
                  />
                </div>

                {/* Caption */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Caption / Technical Description
                  </label>
                  <textarea
                    rows={2}
                    value={newImgUrlData.caption}
                    onChange={(e) => setNewImgUrlData({ ...newImgUrlData, caption: e.target.value })}
                    placeholder="Official claim abstracts or case maps description..."
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      background: "#1f2937",
                      border: "1px solid #374151",
                      color: "#ffffff",
                      fontSize: "0.84rem",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid #1f2937" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddImgUrlModal(false)}
                    style={{
                      background: "transparent",
                      color: "#9ca3af",
                      border: "1px solid #374151",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddImgModalUploading || !newImgUrlData.url}
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 22px",
                      borderRadius: 8,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: (isAddImgModalUploading || !newImgUrlData.url) ? "not-allowed" : "pointer",
                      opacity: (isAddImgModalUploading || !newImgUrlData.url) ? 0.6 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <FaPlus /> {isAddImgModalUploading ? "Uploading..." : "Add Image to Page"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT FIELD VIDEO */}
        {showAddVidModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16
            }}
          >
            <div
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 16,
                padding: "24px 28px",
                width: "100%",
                maxWidth: 520,
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaVideo color="#ef4444" /> {editingVidIdx !== null ? "Edit / Replace Video" : "Add Field Video"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddVidModal(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Mode Switcher */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#1e293b", padding: 4, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setVidModalMode("upload")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: vidModalMode === "upload" ? "#2563eb" : "transparent",
                    color: vidModalMode === "upload" ? "#ffffff" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <FaCloudUploadAlt size={14} /> Upload Video File
                </button>
                <button
                  type="button"
                  onClick={() => setVidModalMode("url")}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: vidModalMode === "url" ? "#2563eb" : "transparent",
                    color: vidModalMode === "url" ? "#ffffff" : "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <FaLink size={12} /> Add Video URL / YouTube
                </button>
              </div>

              {uploadVidError && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: "0.8rem", marginBottom: 12 }}>
                  ⚠️ {uploadVidError}
                </div>
              )}

              <form onSubmit={handleSaveVideoModal}>
                {vidModalMode === "upload" ? (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                      Select Video File (.mp4, .webm, .mov) *
                    </label>
                    <input
                      type="file"
                      ref={vidFileInputRef}
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSelectVidFile(e.target.files[0]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <div
                      onClick={() => vidFileInputRef.current?.click()}
                      style={{
                        border: "2px dashed #475569",
                        borderRadius: 10,
                        padding: "24px 16px",
                        textAlign: "center",
                        background: "#1e293b",
                        cursor: "pointer"
                      }}
                    >
                      <FaCloudUploadAlt size={32} color="#ef4444" style={{ marginBottom: 8 }} />
                      <p style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>
                        {selectedVidFile ? selectedVidFile.name : "Click to select video from computer (MP4, WebM)"}
                      </p>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {selectedVidFile ? formatBytes(selectedVidFile.size) : "Up to 1024MB supported"}
                      </span>
                    </div>

                    {selectedVidFile && (
                      <div style={{ marginTop: 12, background: "#0b0f19", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: "0.75rem" }}>
                          <span style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                            {uploadedVidUrl || vidUploadProgress.percent === 100 ? (
                              <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                <FaCheckCircle /> Video Upload Complete
                              </span>
                            ) : (
                              <span style={{ color: "#f87171", fontWeight: 600 }}>Streaming Video Upload...</span>
                            )}
                          </span>
                          <span style={{ fontWeight: 700, color: uploadedVidUrl || vidUploadProgress.percent === 100 ? "#10b981" : "#ef4444" }}>
                            {uploadedVidUrl || vidUploadProgress.percent === 100 ? "100%" : `${vidUploadProgress.percent}%`}
                          </span>
                        </div>
                        <div style={{ width: "100%", height: 8, background: "#334155", borderRadius: 4, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${uploadedVidUrl ? 100 : vidUploadProgress.percent}%`,
                              height: "100%",
                              background: uploadedVidUrl || vidUploadProgress.percent === 100 ? "#10b981" : "linear-gradient(90deg, #ef4444, #f97316)",
                              transition: "width 0.2s ease"
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.7rem", color: "#64748b" }}>
                          <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedVidFile.name}</span>
                          <span>{formatBytes(vidUploadProgress.loaded || (uploadedVidUrl ? selectedVidFile.size : 0))} / {formatBytes(selectedVidFile.size)}</span>
                        </div>
                      </div>
                    )}

                    {selectedVidPreview && (
                      <div style={{ marginTop: 10, height: 160, borderRadius: 8, overflow: "hidden", background: "#000" }}>
                        <video src={selectedVidPreview} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                      YouTube or Direct Video URL *
                    </label>
                    <input
                      type="text"
                      value={vidModalData.url}
                      onChange={(e) => setVidModalData({ ...vidModalData, url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or direct .mp4 link"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.85rem" }}
                    />
                    {vidModalData.url && isYouTubeUrl(vidModalData.url) && (
                      <div style={{ marginTop: 10, height: 160, borderRadius: 8, overflow: "hidden", background: "#000" }}>
                        <iframe
                          src={getYouTubeEmbedUrl(vidModalData.url)}
                          title="YouTube Preview"
                          style={{ width: "100%", height: "100%", border: "none" }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: 4 }}>
                    Video Title *
                  </label>
                  <input
                    type="text"
                    value={vidModalData.title}
                    onChange={(e) => setVidModalData({ ...vidModalData, title: e.target.value })}
                    placeholder="e.g. Field Hearing Documentation"
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: 4 }}>
                    Video Description
                  </label>
                  <textarea
                    value={vidModalData.description}
                    onChange={(e) => setVidModalData({ ...vidModalData, description: e.target.value })}
                    placeholder="Brief description of the video recording..."
                    rows={2}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.82rem", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddVidModal(false)}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingVid}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      background: isUploadingVid ? "#991b1b" : "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 700,
                      cursor: isUploadingVid ? "wait" : "pointer"
                    }}
                  >
                    {isUploadingVid ? `Uploading... ${vidUploadProgress.percent}%` : editingVidIdx !== null ? "Save Video" : "Add Video"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FULLSCREEN VIDEO PREVIEW */}
        {previewingVid && (
          <div
            onClick={() => setPreviewingVid(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.88)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              backdropFilter: "blur(6px)",
              padding: 24
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 820,
                background: "#0f172a",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid #334155",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "#1e293b", borderBottom: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.98rem" }}>
                  {previewingVid.title || "Video Preview"}
                </div>
                <button
                  onClick={() => setPreviewingVid(null)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
                {isYouTubeUrl(previewingVid.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(previewingVid.url)}
                    title={previewingVid.title || "Video"}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewingVid.url}
                    controls
                    autoPlay
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </div>

              {previewingVid.description && (
                <div style={{ padding: "14px 20px", color: "#94a3b8", fontSize: "0.85rem", background: "#0f172a" }}>
                  {previewingVid.description}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

