import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaTrophy, FaAward, FaChild, FaFilePdf, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaCloudUploadAlt, FaFolderOpen,
  FaEye, FaSave, FaExternalLinkAlt, FaInfoCircle, FaSearch,
  FaTable, FaImages, FaDownload, FaCalendarAlt, FaFileAlt,
  FaCheckCircle, FaUndo, FaSlidersH, FaLayerGroup, FaVideo,
  FaPlay, FaYoutube, FaMapMarkedAlt, FaLink, FaGavel, FaBalanceScale, FaClock, FaBook, FaBriefcase
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  fetchAchievementsPages,
  adminListAchievementsPages,
  adminGetAchievementsPage,
  adminCreateAchievementsPage,
  adminUpdateAchievementsPage,
  adminDeleteAchievementsPage,
  adminSaveAchievementsContent,
  adminUploadImage,
  adminUploadVideo,
  adminListFolderFiles,
  adminAttachLocalFile,
  adminInstantLocalAttach,
  API_BASE
} from "../api/client";
import {
  DEFAULT_STATS_BY_SLUG,
  STAT_ICON_OPTIONS,
  STAT_COLOR_OPTIONS,
  renderStatIcon
} from "../utils/statIcons";

const KEY_STORAGE = "alertngo_admin_key";
const ACHIEVE_CACHE_KEY = "alertngo_achievements_pages_cache";

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
  const rawStats = Array.isArray(p.stats) && p.stats.length > 0
    ? p.stats
    : (Array.isArray(c.stats) && c.stats.length > 0
      ? c.stats
      : (DEFAULT_STATS_BY_SLUG[p.slug] || []));
  const stats = (rawStats || []).map((st) => ({
    ...st,
    num: st.num || st.value || "",
    value: st.value || st.num || "",
    label: st.label || "",
    color: st.color || "#003190",
    icon: st.icon || "chart"
  }));

  const normalizedImages = images.map((img) => ({
    src: img.src || img.url || "",
    url: img.url || img.src || "",
    name: img.name || img.caption || img.alt || "Achievement Media",
    alt: img.alt || img.name || "Achievement Media",
    caption: img.caption || img.name || ""
  }));

  const parentSlug = p.parent_slug || c.parent_slug || "";
  const contentObj = {
    slug: p.slug,
    title: p.title || p.nav_label,
    nav_label: p.nav_label || p.title,
    category: p.category || "Achievements",
    badge: p.badge || "Achievements & Impact",
    subtitle: p.subtitle || "",
    parent_slug: parentSlug,
    downloads,
    tables,
    images: normalizedImages,
    videos,
    paragraphs,
    stats
  };

  return {
    ...p,
    parent_slug: parentSlug,
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

export default function AdminAchievements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSlug = searchParams.get("slug") || "achievements";
  const initialTab = searchParams.get("tab") || "stats";

  const [adminKey, setAdminKey] = useState(() => {
    return sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
  });

  const [pages, setPages] = useState([]);
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchFilter, setSearchFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Active page draft state
  const [activePage, setActivePage] = useState(null);
  const [currentContent, setCurrentContent] = useState({
    title: "",
    nav_label: "",
    category: "Achievements",
    badge: "Achievements & Impact",
    subtitle: "",
    paragraphs: [],
    downloads: [],
    tables: [],
    images: [],
    videos: [],
    stats: []
  });


  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPageName, setCreatePageName] = useState("");
  const [createCustomSlug, setCreateCustomSlug] = useState("");
  const [createCustomTitle, setCreateCustomTitle] = useState("");
  const [createCategory, setCreateCategory] = useState("Achievements");
  const [showAdvancedCreate, setShowAdvancedCreate] = useState(false);
  const [createError, setCreateError] = useState("");

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameLabel, setRenameLabel] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Images state & modal
  const [showAddImgModal, setShowAddImgModal] = useState(false);
  const [addImgMode, setAddImgMode] = useState("upload");
  const [imgModalData, setImgModalData] = useState({ name: "", caption: "", url: "" });
  const [selectedImgFile, setSelectedImgFile] = useState(null);
  const [selectedImgPreview, setSelectedImgPreview] = useState("");
  const [editingImgIdx, setEditingImgIdx] = useState(null);
  const [uploadImgError, setUploadImgError] = useState("");
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [imgUploadProgress, setImgUploadProgress] = useState({ percent: 0, loaded: 0, total: 0 });
  const [uploadedImgUrl, setUploadedImgUrl] = useState("");
  const uploadImgPromiseRef = useRef(null);
  const [previewFullImg, setPreviewFullImg] = useState(null);
  const imgFileInputRef = useRef(null);

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

  // Documents state & modal
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docModalMode, setDocModalMode] = useState("upload"); // "upload" | "url"
  const [docModalData, setDocModalData] = useState({ text: "", url: "", filename: "", fileSize: "Official PDF" });
  const [selectedDocFile, setSelectedDocFile] = useState(null);
  const [editingDocIdx, setEditingDocIdx] = useState(null);
  const [uploadDocError, setUploadDocError] = useState("");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const docFileInputRef = useRef(null);
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
  }, [activeSlug]);

  // Structured Table state
  const [tableSearch, setTableSearch] = useState("");

  const showToast = useCallback((msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Update query params when activeSlug or activeTab changes
  useEffect(() => {
    setSearchParams({ slug: activeSlug, tab: activeTab }, { replace: true });
  }, [activeSlug, activeTab, setSearchParams]);

  // Load pages list on mount
  const loadPagesList = useCallback(async (preferSlug = null) => {
    setIsLoading(true);
    try {
      let pageList = [];
      const res = await adminListAchievementsPages(adminKey);
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        pageList = res.data;
      } else {
        const pubRes = await fetchAchievementsPages();
        if (pubRes && pubRes.data && Array.isArray(pubRes.data)) {
          pageList = pubRes.data;
        }
      }

      // Fallback defaults if backend table not seeded yet
      if (!pageList || pageList.length === 0) {
        pageList = [
          { slug: "achievements", nav_label: "Achievements Overview", title: "Achievements", category: "Achievements", badge: "Achievements & Impact", sort_order: 1, parent_slug: "", is_active: 1 },
          { slug: "child-interventions", nav_label: "Child Interventions", title: "Child Interventions", category: "Child Rights", badge: "Child Protection & Education", sort_order: 2, parent_slug: "achievements", is_active: 1 },
          { slug: "child-bare-acts", nav_label: "Child Bare Acts", title: "Child Bare Acts", category: "Child Rights", badge: "Statutory Bare Acts", sort_order: 3, parent_slug: "achievements", is_active: 1 },
          { slug: "reports", nav_label: "Reports", title: "Reports", category: "Institutional", badge: "Annual & Field Reports", sort_order: 4, parent_slug: "achievements", is_active: 1 },
          { slug: "portfolio-3", nav_label: "PORTFOLIO", title: "PORTFOLIO", category: "Achievements", badge: "Organization Portfolio", sort_order: 5, parent_slug: "achievements", is_active: 1 }
        ];
      }

      setPages(pageList);
      try {
        localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(pageList));
        window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
        window.dispatchEvent(new Event("storage"));
      } catch (_) {}

      const targetSlug = preferSlug || activeSlug || pageList[0]?.slug || "achievements";
      const matched = pageList.find((p) => p.slug === targetSlug) || pageList[0];
      if (matched) {
        setActiveSlug(matched.slug);
      }
    } catch (err) {
      console.error("Error loading achievements pages:", err);
      showToast("Could not load pages from server; loading fallback data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [adminKey, activeSlug, showToast]);

  useEffect(() => {
    loadPagesList();
  }, []);

  // Fetch full page details whenever activeSlug changes
  useEffect(() => {
    if (!activeSlug) return;
    let isCancelled = false;

    async function fetchFullPage() {
      try {
        const json = await adminGetAchievementsPage(adminKey, activeSlug);
        if (json && json.success && json.data && !isCancelled) {
          const norm = normalizePage(json.data);
          setActivePage(norm);
          setCurrentContent(norm.content);
          return;
        }
      } catch (err) {
        // Fallback to static all_site_pages
      }

      // Fallback
      import("../data/all_site_pages.json").then((mod) => {
        if (isCancelled) return;
        const all = mod.default || {};
        const local = all[activeSlug] || {
          slug: activeSlug,
          title: ucwords(activeSlug.replace(/-/g, " ")),
          paragraphs: [],
          downloads: [],
          tables: [],
          images: [],
          videos: []
        };
        const norm = normalizePage(local);
        setActivePage(norm);
        setCurrentContent(norm.content);
      });
    }

    fetchFullPage();
    return () => {
      isCancelled = true;
    };
  }, [activeSlug, adminKey]);

  function ucwords(str) {
    return (str || "").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Update currentContent helper with live sync to localStorage & events
  const updateContent = useCallback((updater) => {
    setCurrentContent((prev) => {
      const nextContent = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      const cleanSlug = (activeSlug || "").toLowerCase().trim();
      try {
        const fullOverride = {
          ...(activePage || {}),
          slug: cleanSlug,
          title: nextContent.title || activePage?.title,
          nav_label: nextContent.nav_label || activePage?.nav_label,
          subtitle: nextContent.subtitle || activePage?.subtitle,
          category: nextContent.category || "Achievements",
          badge: nextContent.badge || "Achievements",
          stats: nextContent.stats || [],
          downloads: nextContent.downloads || [],
          images: nextContent.images || [],
          videos: nextContent.videos || [],
          paragraphs: nextContent.paragraphs || [],
          tables: nextContent.tables || [],
          content: nextContent
        };
        localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
        localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
        window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
        window.dispatchEvent(new Event("storage"));
      } catch (_) {}
      return nextContent;
    });
  }, [activeSlug, activePage]);

  const handleSaveTables = async () => {
    if (!activeSlug) return;
    setIsSaving(true);
    const cleanSlug = (activeSlug || "").toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "").trim();
    const currentTables = currentContent.tables || [];
    const fullOverride = {
      ...(activePage || {}),
      slug: cleanSlug,
      title: currentContent.title,
      nav_label: currentContent.nav_label,
      content: { ...currentContent, tables: currentTables },
      tables: currentTables,
      tables_count: currentTables.length
    };
    try {
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPages = pages.map((p) => (p.slug === activeSlug ? fullOverride : p));
      localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(updatedPages));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      if (adminKey) {
        await adminSaveAchievementsContent(adminKey, {
          action: "save_page",
          slug: activeSlug,
          title: currentContent.title,
          nav_label: currentContent.nav_label,
          category: currentContent.category,
          badge: currentContent.badge,
          subtitle: currentContent.subtitle,
          parent_slug: currentContent.parent_slug || "",
          content: { ...currentContent, tables: currentTables, parent_slug: currentContent.parent_slug || "" }
        });
      }
      showToast("✓ Data tables saved successfully to database & live site!");
    } catch (_) {
      showToast("✓ Data tables saved locally! Live on website immediately.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!activeSlug) return;
    setIsSaving(true);
    try {
      const payload = {
        action: "save_page",
        slug: activeSlug,
        title: currentContent.title,
        nav_label: currentContent.nav_label,
        category: currentContent.category,
        badge: currentContent.badge,
        subtitle: currentContent.subtitle,
        parent_slug: currentContent.parent_slug || "",
        content: currentContent
      };

      const res = await adminSaveAchievementsContent(adminKey, payload);
      if (res && res.success) {
        showToast("✓ All changes saved successfully to database!");
        try {
          localStorage.removeItem(ACHIEVE_CACHE_KEY);
          window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
          window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: (activeSlug || "").toLowerCase().trim() } }));
          window.dispatchEvent(new Event("storage"));
        } catch (_) {}
        loadPagesList(activeSlug);
      } else {
        showToast(res?.message || "Failed to save page changes.", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("Error saving to backend: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Create page handler
  const derivedCreateSlug = useMemo(() => {
    if (createCustomSlug.trim()) {
      return createCustomSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");
    }
    return createPageName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");
  }, [createPageName, createCustomSlug]);

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!createPageName.trim()) {
      setCreateError("Page Name is required.");
      return;
    }
    setCreateError("");
    try {
      const payload = {
        nav_label: createPageName.trim(),
        title: createCustomTitle.trim() || createPageName.trim(),
        slug: derivedCreateSlug || undefined,
        category: createCategory || "Achievements",
        parent_slug: createParentSlug || ""
      };
      const res = await adminCreateAchievementsPage(adminKey, payload);
      if (res && res.success) {
        showToast("✓ Page created successfully!");
        setShowCreateModal(false);
        setCreatePageName("");
        setCreateCustomSlug("");
        setCreateCustomTitle("");
        setCreateParentSlug("");
        setShowAdvancedCreate(false);
        const newSlug = res.data?.slug || derivedCreateSlug;
        try {
          localStorage.removeItem(ACHIEVE_CACHE_KEY);
          window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
          window.dispatchEvent(new Event("storage"));
        } catch (_) {}
        loadPagesList(newSlug);
      } else {
        setCreateError(res?.message || "Failed to create page.");
      }
    } catch (err) {
      setCreateError("Server error: " + err.message);
    }
  };

  // Rename page handler
  const handleRenamePage = async (e) => {
    e.preventDefault();
    if (!renameLabel.trim() || !activeSlug) return;
    try {
      const res = await adminUpdateAchievementsPage(adminKey, {
        slug: activeSlug,
        nav_label: renameLabel.trim(),
        title: currentContent.title || renameLabel.trim(),
        parent_slug: currentContent.parent_slug || activePage?.parent_slug || ""
      });
      if (res && res.success) {
        showToast("✓ Page renamed successfully!");
        setShowRenameModal(false);
        updateContent({ nav_label: renameLabel.trim() });
        try {
          localStorage.removeItem(ACHIEVE_CACHE_KEY);
          window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
          window.dispatchEvent(new Event("storage"));
        } catch (_) {}
        loadPagesList(activeSlug);
      } else {
        showToast(res?.message || "Failed to rename page.", "error");
      }
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  // Delete page handler
  const handleDeletePage = async () => {
    if (!activeSlug || activeSlug === "achievements") {
      showToast("The main Achievements overview page cannot be deleted.", "error");
      return;
    }
    try {
      const res = await adminDeleteAchievementsPage(adminKey, activeSlug);
      if (res && res.success) {
        const cleanSlug = (activeSlug || "").toLowerCase().trim();
        try {
          localStorage.removeItem(`alertngo_page_override_${cleanSlug}`);
          localStorage.removeItem(`alertngo_page_override_/${cleanSlug}`);
          localStorage.removeItem(ACHIEVE_CACHE_KEY);
          window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
          window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
          window.dispatchEvent(new Event("storage"));
        } catch (_) {}
        showToast("✓ Page deleted successfully.");
        setShowDeleteModal(false);
        loadPagesList("achievements");
      } else {
        showToast(res?.message || "Failed to delete page.", "error");
      }
    } catch (err) {
      showToast("Error deleting page: " + err.message, "error");
    }
  };

  // ==========================================
  // IMAGE MANAGEMENT
  // ==========================================
  // IMAGE MANAGEMENT
  // ==========================================
  const handleSelectImgFile = (file) => {
    if (!file) return;
    setSelectedImgFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedImgPreview(previewUrl);
    setUploadImgError("");
    setUploadedImgUrl("");
    setImgUploadProgress({ percent: 0, loaded: 0, total: file.size });
    setIsUploadingImg(true);

    if (!imgModalData.name) {
      setImgModalData((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }));
    }

    const targetFolder = `achievements/${activeSlug}/images`;
    const uploadPromise = adminUploadImage(adminKey, file, targetFolder, (prog) => {
      setImgUploadProgress(prog);
    })
      .then((res) => {
        if (res && res.success && res.url) {
          setUploadedImgUrl(res.url);
          setIsUploadingImg(false);
          return res.url;
        } else {
          setUploadImgError(res?.message || "Failed to upload image file.");
          setIsUploadingImg(false);
          throw new Error(res?.message || "Image upload failed");
        }
      })
      .catch((err) => {
        setUploadImgError("Upload error: " + (err.message || "Failed"));
        setIsUploadingImg(false);
        throw err;
      });

    uploadImgPromiseRef.current = uploadPromise;
  };

  const handleOpenAddImage = () => {
    setEditingImgIdx(null);
    setAddImgMode("upload");
    setImgModalData({ name: "", caption: "", url: "" });
    setSelectedImgFile(null);
    setSelectedImgPreview("");
    setUploadedImgUrl("");
    setImgUploadProgress({ percent: 0, loaded: 0, total: 0 });
    setUploadImgError("");
    setIsUploadingImg(false);
    uploadImgPromiseRef.current = null;
    setShowAddImgModal(true);
  };

  const handleOpenEditImage = (img, idx) => {
    setEditingImgIdx(idx);
    setAddImgMode(img.src && !img.src.startsWith("http") ? "upload" : "url");
    setImgModalData({
      name: img.name || img.alt || "",
      caption: img.caption || img.name || "",
      url: img.src || img.url || ""
    });
    setSelectedImgFile(null);
    setSelectedImgPreview(img.src || img.url || "");
    setUploadedImgUrl(img.src || img.url || "");
    setImgUploadProgress({ percent: 100, loaded: 0, total: 0 });
    setUploadImgError("");
    setIsUploadingImg(false);
    uploadImgPromiseRef.current = null;
    setShowAddImgModal(true);
  };

  const handleSaveImageModal = async (e) => {
    e.preventDefault();
    setUploadImgError("");

    let finalUrl = uploadedImgUrl || imgModalData.url.trim();

    if (selectedImgFile && !finalUrl) {
      if (uploadImgPromiseRef.current) {
        setIsUploadingImg(true);
        try {
          finalUrl = await uploadImgPromiseRef.current;
        } catch (err) {
          setUploadImgError("Image upload failed: " + err.message);
          setIsUploadingImg(false);
          return;
        }
      } else {
        setIsUploadingImg(true);
        try {
          const targetFolder = `achievements/${activeSlug}/images`;
          const uploadRes = await adminUploadImage(adminKey, selectedImgFile, targetFolder, (prog) => setImgUploadProgress(prog));
          if (uploadRes && uploadRes.success && uploadRes.url) {
            finalUrl = uploadRes.url;
          } else {
            setUploadImgError(uploadRes?.message || "Failed to upload image file to server.");
            setIsUploadingImg(false);
            return;
          }
        } catch (err) {
          setUploadImgError("Upload error: " + err.message);
          setIsUploadingImg(false);
          return;
        }
      }
    }

    if (!finalUrl) {
      setUploadImgError("Please choose an image file to upload or enter a valid URL.");
      return;
    }

    const titleText = imgModalData.name.trim() || imgModalData.caption.trim() || "Achievement Media";
    const captionText = imgModalData.caption.trim() || titleText;

    const newImageObj = {
      src: finalUrl,
      url: finalUrl,
      name: titleText,
      alt: titleText,
      caption: captionText
    };

    const updatedImages = [...(currentContent.images || [])];
    if (editingImgIdx !== null) {
      updatedImages[editingImgIdx] = newImageObj;
    } else {
      updatedImages.unshift(newImageObj);
    }

    const updatedContent = { ...currentContent, images: updatedImages };
    setCurrentContent(updatedContent);
    setActivePage((prev) => (prev ? { ...prev, content: updatedContent } : prev));
    setPages((prev) => prev.map((p) => (p.slug === activeSlug ? { ...p, images: updatedImages, images_count: updatedImages.length, content: { ...(p.content || {}), ...updatedContent } } : p)));

    const cleanSlug = (activeSlug || "").toLowerCase().trim();
    try {
      const fullOverride = {
        ...(activePage || {}),
        ...updatedContent,
        slug: cleanSlug,
        content: updatedContent,
        images: updatedImages,
        images_count: updatedImages.length
      };
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPagesCache = pages.map((p) => (p.slug === activeSlug ? { ...p, images: updatedImages, images_count: updatedImages.length, content: { ...(p.content || {}), ...updatedContent } } : p));
      localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(updatedPagesCache));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}


    // Persist directly to MySQL database immediately!
    try {
      const payload = {
        action: "save_page",
        slug: activeSlug,
        title: updatedContent.title,
        nav_label: updatedContent.nav_label,
        category: updatedContent.category,
        badge: updatedContent.badge,
        subtitle: updatedContent.subtitle,
        parent_slug: updatedContent.parent_slug || currentContent.parent_slug || activePage?.parent_slug || "",
        content: updatedContent
      };
      const res = await adminSaveAchievementsContent(adminKey, payload);
      if (res && res.success) {
        showToast(editingImgIdx !== null ? "Image updated and saved successfully!" : "Image added and saved successfully!");
        try { loadPagesList(activeSlug); } catch (_) {}
      } else {
        showToast(res?.message || "Image added to draft! Remember to click Save Changes.", "info");
      }
    } catch (saveErr) {
      console.warn("Direct save error:", saveErr);
      showToast("✓ Image added to draft! Remember to click Save Changes.", "info");
    }

    setShowAddImgModal(false);
    setSelectedImgPreview("");
    setSelectedImgFile(null);
    setUploadedImgUrl("");
    setImgUploadProgress({ percent: 0, loaded: 0, total: 0 });
    setIsUploadingImg(false);
  };

  const handleDeleteImage = async (idx) => {
    const updatedImages = (currentContent.images || []).filter((_, i) => i !== idx);
    const updatedContent = { ...currentContent, images: updatedImages };
    setCurrentContent(updatedContent);
    setActivePage((prev) => (prev ? { ...prev, content: updatedContent } : prev));
    setPages((prev) => prev.map((p) => (p.slug === activeSlug ? { ...p, images: updatedImages, images_count: updatedImages.length, content: { ...(p.content || {}), ...updatedContent } } : p)));

    const cleanSlug = (activeSlug || "").toLowerCase().trim();
    try {
      const fullOverride = {
        ...(activePage || {}),
        ...updatedContent,
        slug: cleanSlug,
        content: updatedContent,
        images: updatedImages,
        images_count: updatedImages.length
      };
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPagesCache = pages.map((p) => (p.slug === activeSlug ? { ...p, images: updatedImages, images_count: updatedImages.length, content: { ...(p.content || {}), ...updatedContent } } : p));
      localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(updatedPagesCache));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      await adminSaveAchievementsContent(adminKey, {
        action: "save_page",
        slug: activeSlug,
        title: updatedContent.title,
        nav_label: updatedContent.nav_label,
        category: updatedContent.category,
        badge: updatedContent.badge,
        subtitle: updatedContent.subtitle,
        parent_slug: updatedContent.parent_slug || currentContent.parent_slug || activePage?.parent_slug || "",
        content: updatedContent
      });
      showToast("Image deleted successfully!");
      try { loadPagesList(activeSlug); } catch (_) {}
    } catch (_) {
      showToast("Image removed from draft. Click 'Save Changes' to publish.");
    }
  };

  // ==========================================
  // VIDEO MANAGEMENT
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
      setVidModalData((prev) => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
    }

    const targetFolder = `achievements/${activeSlug}/videos`;
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
          throw new Error(res?.message || "Video upload failed");
        }
      })
      .catch((err) => {
        setUploadVidError("Video upload error: " + (err.message || "Failed"));
        setIsUploadingVid(false);
        throw err;
      });

    uploadVidPromiseRef.current = uploadPromise;
  };

  const handleOpenAddVideo = () => {
    setEditingVidIdx(null);
    setVidModalMode("upload");
    setVidModalData({ title: "", description: "", url: "", type: "video" });
    setSelectedVidFile(null);
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
    setVidModalMode(isYouTubeUrl(vid.url) ? "url" : "upload");
    setVidModalData({
      title: vid.title || "",
      description: vid.description || "",
      url: vid.url || "",
      type: vid.type || "video"
    });
    setSelectedVidFile(null);
    setSelectedVidPreview(vid.url || "");
    setUploadedVidUrl(vid.url || "");
    setVidUploadProgress({ percent: 100, loaded: 0, total: 0 });
    setUploadVidError("");
    setIsUploadingVid(false);
    uploadVidPromiseRef.current = null;
    setShowAddVidModal(true);
  };

  const handleSaveVideoModal = async (e) => {
    e.preventDefault();
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
          const targetFolder = `achievements/${activeSlug}/videos`;
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

    const titleText = vidModalData.title.trim() || "Field Video Report";
    const newVidObj = {
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

    const updatedContent = { ...currentContent, videos: updatedVideos };
    setCurrentContent(updatedContent);
    setActivePage((prev) => (prev ? { ...prev, content: updatedContent } : prev));
    setPages((prev) => prev.map((p) => (p.slug === activeSlug ? { ...p, videos: updatedVideos, videos_count: updatedVideos.length, content: { ...(p.content || {}), ...updatedContent } } : p)));

    const cleanSlug = (activeSlug || "").toLowerCase().trim();
    try {
      const fullOverride = {
        ...(activePage || {}),
        ...updatedContent,
        slug: cleanSlug,
        content: updatedContent,
        videos: updatedVideos,
        videos_count: updatedVideos.length
      };
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPagesCache = pages.map((p) => (p.slug === activeSlug ? { ...p, videos: updatedVideos, videos_count: updatedVideos.length, content: { ...(p.content || {}), ...updatedContent } } : p));
      localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(updatedPagesCache));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    // Persist directly to MySQL database immediately!
    try {
      const payload = {
        action: "save_page",
        slug: activeSlug,
        title: updatedContent.title,
        nav_label: updatedContent.nav_label,
        category: updatedContent.category,
        badge: updatedContent.badge,
        subtitle: updatedContent.subtitle,
        parent_slug: updatedContent.parent_slug || currentContent.parent_slug || activePage?.parent_slug || "",
        content: updatedContent
      };
      const res = await adminSaveAchievementsContent(adminKey, payload);
      if (res && res.success) {
        showToast(editingVidIdx !== null ? "✓ Video updated and saved successfully!" : "✓ Video added and saved successfully!");
        try { loadPagesList(activeSlug); } catch (_) {}
      } else {
        showToast(res?.message || "✓ Video added to draft! Remember to click Save Changes.", "info");
      }
    } catch (saveErr) {
      console.warn("Direct save error:", saveErr);
      showToast("✓ Video added to draft! Remember to click Save Changes.", "info");
    }

    setShowAddVidModal(false);
    setSelectedVidPreview("");
    setSelectedVidFile(null);
    setUploadedVidUrl("");
    setVidUploadProgress({ percent: 0, loaded: 0, total: 0 });
    setIsUploadingVid(false);
  };

  const handleDeleteVideo = async (idx) => {
    const updatedVideos = (currentContent.videos || []).filter((_, i) => i !== idx);
    const updatedContent = { ...currentContent, videos: updatedVideos };
    setCurrentContent(updatedContent);
    setActivePage((prev) => (prev ? { ...prev, content: updatedContent } : prev));
    setPages((prev) => prev.map((p) => (p.slug === activeSlug ? { ...p, videos: updatedVideos, videos_count: updatedVideos.length, content: { ...(p.content || {}), ...updatedContent } } : p)));

    const cleanSlug = (activeSlug || "").toLowerCase().trim();
    try {
      const fullOverride = {
        ...(activePage || {}),
        ...updatedContent,
        slug: cleanSlug,
        content: updatedContent,
        videos: updatedVideos,
        videos_count: updatedVideos.length
      };
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPagesCache = pages.map((p) => (p.slug === activeSlug ? { ...p, videos: updatedVideos, videos_count: updatedVideos.length, content: { ...(p.content || {}), ...updatedContent } } : p));
      localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(updatedPagesCache));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      await adminSaveAchievementsContent(adminKey, {
        action: "save_page",
        slug: activeSlug,
        title: updatedContent.title,
        nav_label: updatedContent.nav_label,
        category: updatedContent.category,
        badge: updatedContent.badge,
        subtitle: updatedContent.subtitle,
        parent_slug: updatedContent.parent_slug || currentContent.parent_slug || activePage?.parent_slug || "",
        content: updatedContent
      });
      showToast("✓ Video deleted successfully!");
      try { loadPagesList(activeSlug); } catch (_) {}
    } catch (_) {
      showToast("Video removed from draft. Click 'Save Changes' to publish.");
    }
  };

  // ==========================================
  // DOCUMENT (PDF / REPORT) MANAGEMENT
  // ==========================================
  const handleOpenAddDoc = () => {
    setEditingDocIdx(null);
    setDocModalMode("upload");
    setDocModalData({ text: "", url: "", filename: "", fileSize: "Official PDF" });
    setSelectedDocFile(null);
    setUploadDocError("");
    setShowAddDocModal(true);
  };

  const handleOpenEditDoc = (doc, idx) => {
    setEditingDocIdx(idx);
    setDocModalMode(doc.url && !doc.url.startsWith("http") ? "upload" : "url");
    setDocModalData({
      text: doc.text || doc.title || "",
      url: doc.url || "",
      filename: doc.filename || "",
      fileSize: doc.fileSize || "Official PDF"
    });
    setSelectedDocFile(null);
    setUploadDocError("");
    setShowAddDocModal(true);
  };

  const handleSaveDocModal = async (e) => {
    e.preventDefault();
    setUploadDocError("");

    let finalUrl = docModalData.url.trim();
    let finalFilename = docModalData.filename.trim();
    let finalSize = docModalData.fileSize.trim() || "Official PDF";

    if (selectedDocFile) {
      setIsUploadingDoc(true);
      try {
        const formData = new FormData();
        formData.append("action", "upload_file");
        formData.append("file", selectedDocFile);
        formData.append("admin_key", adminKey);

        const res = await fetch(`${API_BASE}/admin_achievements.php`, {
          method: "POST",
          headers: {
            "X-Admin-Key": adminKey
          },
          body: formData
        });
        const json = await res.json();
        if (json && json.success && json.url) {
          finalUrl = json.url;
          finalFilename = json.filename || selectedDocFile.name;
          finalSize = json.fileSize || formatBytes(selectedDocFile.size);
        } else {
          setUploadDocError(json?.message || "Failed to upload document file.");
          setIsUploadingDoc(false);
          return;
        }
      } catch (err) {
        setUploadDocError("Upload error: " + err.message);
        setIsUploadingDoc(false);
        return;
      }
      setIsUploadingDoc(false);
    }

    if (!finalUrl) {
      setUploadDocError("Please choose a PDF document or provide a shareable document URL.");
      return;
    }

    const titleText = docModalData.text.trim() || finalFilename || "Official Report & Document";

    const newDocObj = {
      text: titleText,
      url: finalUrl,
      filename: finalFilename || titleText,
      fileSize: finalSize
    };

    const updatedDownloads = [...(currentContent.downloads || [])];
    if (editingDocIdx !== null) {
      updatedDownloads[editingDocIdx] = newDocObj;
    } else {
      updatedDownloads.unshift(newDocObj);
    }

    const updatedContent = { ...currentContent, downloads: updatedDownloads };
    setCurrentContent(updatedContent);
    setActivePage((prev) => (prev ? { ...prev, content: updatedContent } : prev));
    setPages((prev) => prev.map((p) => (p.slug === activeSlug ? { ...p, downloads: updatedDownloads, downloads_count: updatedDownloads.length, content: { ...(p.content || {}), ...updatedContent } } : p)));

    const cleanSlug = (activeSlug || "").toLowerCase().trim();
    try {
      const fullOverride = {
        ...(activePage || {}),
        ...updatedContent,
        slug: cleanSlug,
        content: updatedContent,
        downloads: updatedDownloads,
        downloads_count: updatedDownloads.length
      };
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPagesCache = pages.map((p) => (p.slug === activeSlug ? { ...p, downloads: updatedDownloads, downloads_count: updatedDownloads.length, content: { ...(p.content || {}), ...updatedContent } } : p));
      localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(updatedPagesCache));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      const res = await adminSaveAchievementsContent(adminKey, {
        action: "save_page",
        slug: activeSlug,
        title: updatedContent.title,
        nav_label: updatedContent.nav_label,
        category: updatedContent.category,
        badge: updatedContent.badge,
        subtitle: updatedContent.subtitle,
        parent_slug: updatedContent.parent_slug || currentContent.parent_slug || activePage?.parent_slug || "",
        content: updatedContent
      });
      if (res && res.success) {
        showToast(editingDocIdx !== null ? "✓ Document updated and saved successfully!" : "✓ Document added and saved successfully!");
        try { loadPagesList(activeSlug); } catch (_) {}
      } else {
        showToast(res?.message || "✓ Document saved to draft! Click 'Save Changes' to publish.", "info");
      }
    } catch (_) {
      showToast("✓ Document saved to draft! Click 'Save Changes' to publish.", "info");
    }

    setShowAddDocModal(false);
    setSelectedDocFile(null);
  };

  const handleDeleteDoc = async (idx) => {
    const updatedDownloads = (currentContent.downloads || []).filter((_, i) => i !== idx);
    const updatedContent = { ...currentContent, downloads: updatedDownloads };
    setCurrentContent(updatedContent);
    setActivePage((prev) => (prev ? { ...prev, content: updatedContent } : prev));
    setPages((prev) => prev.map((p) => (p.slug === activeSlug ? { ...p, downloads: updatedDownloads, downloads_count: updatedDownloads.length, content: { ...(p.content || {}), ...updatedContent } } : p)));

    const cleanSlug = (activeSlug || "").toLowerCase().trim();
    try {
      const fullOverride = {
        ...(activePage || {}),
        ...updatedContent,
        slug: cleanSlug,
        content: updatedContent,
        downloads: updatedDownloads,
        downloads_count: updatedDownloads.length
      };
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullOverride));
      localStorage.setItem(`alertngo_page_override_/${cleanSlug}`, JSON.stringify(fullOverride));
      const updatedPagesCache = pages.map((p) => (p.slug === activeSlug ? { ...p, downloads: updatedDownloads, downloads_count: updatedDownloads.length, content: { ...(p.content || {}), ...updatedContent } } : p));
      localStorage.setItem(ACHIEVE_CACHE_KEY, JSON.stringify(updatedPagesCache));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    try {
      await adminSaveAchievementsContent(adminKey, {
        action: "save_page",
        slug: activeSlug,
        title: updatedContent.title,
        nav_label: updatedContent.nav_label,
        category: updatedContent.category,
        badge: updatedContent.badge,
        subtitle: updatedContent.subtitle,
        parent_slug: updatedContent.parent_slug || currentContent.parent_slug || activePage?.parent_slug || "",
        content: updatedContent
      });
      showToast("✓ Document deleted successfully!");
      try { loadPagesList(activeSlug); } catch (_) {}
    } catch (_) {
      showToast("Document removed from draft. Click 'Save Changes' to publish.");
    }
  };

  // Filtered pages for horizontal selector
  const filteredPages = useMemo(() => {
    if (!searchFilter.trim()) return pages;
    const q = searchFilter.toLowerCase();
    return pages.filter(
      (p) =>
        (p.nav_label || "").toLowerCase().includes(q) ||
        (p.slug || "").toLowerCase().includes(q) ||
        (p.title || "").toLowerCase().includes(q)
    );
  }, [pages, searchFilter]);

  const [selectorView, setSelectorView] = useState("hierarchy"); // "hierarchy" | "pills"
  const [createParentSlug, setCreateParentSlug] = useState("");

  const standardAchieveSubSlugs = useMemo(() => ["child-interventions", "child-bare-acts", "reports", "portfolio-3"], []);

  const getPageParentSlug = useCallback((p) => {
    if (!p) return "";
    if (p.parent_slug) return p.parent_slug;
    if (standardAchieveSubSlugs.includes(p.slug)) return "achievements";
    return "";
  }, [standardAchieveSubSlugs]);

  const hierarchicalPages = useMemo(() => {
    const parentMap = {};
    const topPages = [];

    (filteredPages || pages).forEach((p) => {
      const pParent = getPageParentSlug(p);
      if (pParent) {
        if (!parentMap[pParent]) parentMap[pParent] = [];
        parentMap[pParent].push(p);
      } else {
        topPages.push(p);
      }
    });

    return { topPages, parentMap };
  }, [filteredPages, pages, getPageParentSlug]);

  const handleOpenAddSubPage = (parentSlug) => {
    setCreatePageName("");
    setCreateCustomSlug("");
    setCreateCustomTitle("");
    setCreateCategory("Achievements");
    setCreateParentSlug(parentSlug || "");
    setShowAdvancedCreate(true);
    setShowCreateModal(true);
  };

  return (
    <AdminLayout title="Achievements & Child Interventions Manager">
      <style>{`
        .ach-page {
          width: 100%;
        }
        .ach-header-bar {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 16px;
          padding: 24px 28px;
          border: 1px solid #334155;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }
        .ach-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ach-selector-card {
          background: #111827;
          border-radius: 14px;
          padding: 16px 20px;
          border: 1px solid #1f2937;
          margin-bottom: 24px;
          width: 100%;
        }
        .ach-selector-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ach-selector-pills {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 8px;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }
        .ach-subtabs-wrap {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          border-bottom: 1px solid #1f2937;
          padding-bottom: 12px;
          margin-bottom: 24px;
          scrollbar-width: thin;
        }
        .ach-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          width: 100%;
        }
        .ach-modal-card {
          background: #111827;
          border-radius: 14px;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border: 1px solid #374151;
          box-sizing: border-box;
        }
        .ach-tab-card {
          background: #111827;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #1f2937;
        }
        .ach-tab-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ach-table-item-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
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

        @media (max-width: 768px) {
          .ach-page,
          .ach-page * {
            box-sizing: border-box !important;
            max-width: 100%;
          }
          .ach-page {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            padding-bottom: 30px !important;
          }
          .ach-header-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 14px 12px !important;
            margin-bottom: 14px !important;
          }
          .ach-header-actions {
            width: 100% !important;
            flex-direction: column !important;
            gap: 6px !important;
          }
          .ach-header-actions > * {
            width: 100% !important;
            text-align: center !important;
            justify-content: center !important;
          }
          .ach-selector-card {
            padding: 10px 10px !important;
            margin-bottom: 14px !important;
            border-radius: 12px !important;
          }
          .ach-selector-head {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            margin-bottom: 8px !important;
          }
          .ach-selector-pills {
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
            padding-left: 2px !important;
            padding-right: 14px !important;
            padding-left: 6px !important;
            padding-right: 20px !important;
            scroll-padding-left: 6px !important;
          }
          .ach-selector-pills::-webkit-scrollbar {
            height: 4px !important;
            display: block !important;
          }
          .ach-selector-pills::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3) !important;
            border-radius: 4px !important;
          }
          .ach-selector-pills::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2) !important;
          }
          .ach-selector-pills > * {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            max-width: none !important;
            min-width: max-content !important;
          }
          .ach-selector-pills button {
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
          .ach-selector-pills button span {
            min-width: auto !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            text-align: left !important;
          }
          .ach-card {
            padding: 12px 10px !important;
            border-radius: 12px !important;
            margin-bottom: 12px !important;
          }
          .ach-control-card > div:first-child {
            width: 100% !important;
            margin-bottom: 10px !important;
          }
          .ach-control-card > div:last-child,
          .ach-header-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .ach-control-card > div:last-child button,
          .ach-control-card > div:last-child a,
          .ach-header-actions button,
          .ach-header-actions a {
            width: 100% !important;
            justify-content: center !important;
            padding: 9px 12px !important;
            font-size: 0.82rem !important;
            box-sizing: border-box !important;
            border-radius: 8px !important;
          }
          .ach-subtabs-wrap {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            touch-action: pan-x !important;
            gap: 8px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(255,255,255,0.3) rgba(0,0,0,0.2) !important;
            padding-bottom: 6px !important;
            padding-right: 12px !important;
            margin-bottom: 14px !important;
          }
          .ach-subtabs-wrap button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            padding: 8px 12px !important;
            font-size: 0.76rem !important;
            border-radius: 8px !important;
          }
          .ach-tab-card {
            padding: 14px 10px !important;
            border-radius: 12px !important;
            margin-bottom: 14px !important;
          }
          .ach-tab-header-bar,
          .ach-stat-header-bar {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            align-items: flex-start !important;
            gap: 10px !important;
            margin-bottom: 16px !important;
            width: 100% !important;
          }
          .ach-tab-header-bar > div:first-child,
          .ach-stat-header-bar > div:first-child {
            width: 100% !important;
          }
          .ach-tab-header-bar > button,
          .ach-tab-header-bar > div:last-child button,
          .ach-stat-header-bar button {
            width: auto !important;
            max-width: max-content !important;
            align-self: flex-start !important;
            justify-content: flex-start !important;
            padding: 7px 14px !important;
            font-size: 0.8rem !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
          }
          .ach-table-item-head {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .ach-table-item-head input {
            width: 100% !important;
            height: 38px !important;
            min-height: 38px !important;
            max-height: 38px !important;
            flex: none !important;
            box-sizing: border-box !important;
            padding: 6px 12px !important;
            font-size: 0.9rem !important;
          }
          .ach-table-item-head > div:last-child {
            display: flex !important;
            justify-content: flex-end !important;
            align-items: center !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .ach-stat-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .ach-stat-card {
            padding: 12px !important;
            border-radius: 10px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .ach-modal-card {
            width: calc(100vw - 20px) !important;
            max-width: calc(100vw - 20px) !important;
            padding: 16px 12px !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
          }
          .ach-table-scroll-wrap {
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
          }
          .ach-table-scroll-wrap table {
            min-width: 540px !important;
            max-width: none !important;
          }
        }
      `}</style>
      <div className="ach-page" style={{ width: "100%", paddingBottom: 60, color: "#f1f5f9", fontFamily: "'Outfit', 'Inter', sans-serif" }}>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 9999,
              padding: "12px 20px",
              borderRadius: 10,
              background: toastMessage.type === "error" ? "#dc2626" : "#059669",
              color: "#ffffff",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 600,
              fontSize: "0.9rem",
              animation: "fadeIn 0.2s ease"
            }}
          >
            {toastMessage.type === "error" ? <FaTimes /> : <FaCheckCircle />}
            <span>{toastMessage.msg}</span>
          </div>
        )}

        {/* TOP HEADER / ACTION BAR */}
        <div
          className="ach-header-bar"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: 16,
            padding: "24px 28px",
            border: "1px solid #334155",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            boxShadow: "0 12px 30px rgba(0,0,0,0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 24,
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.35)",
                flexShrink: 0
              }}
            >
              <FaTrophy />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#ffffff", letterSpacing: -0.5 }}>
                Achievements &amp; Child Interventions Manager
              </h1>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                Manage the primary Achievements overview page, Child Interventions, Bare Acts, Reports, and Portfolio subpages.
              </p>
            </div>
          </div>

          <div className="ach-header-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <a
              href={`/${activeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                borderRadius: 10,
                background: "#1e293b",
                color: "#94a3b8",
                border: "1px solid #475569",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease"
              }}
            >
              <FaExternalLinkAlt size={12} /> View Live Page
            </a>

            <button
              type="button"
              onClick={() => {
                setCreatePageName("");
                setCreateCustomSlug("");
                setCreateCustomTitle("");
                setCreateParentSlug("achievements");
                setShowAdvancedCreate(false);
                setCreateError("");
                setShowCreateModal(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                color: "#ffffff",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(2, 132, 199, 0.35)"
              }}
            >
              <FaPlus size={12} /> Create New Dropdown Page
            </button>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 10,
                background: isSaving ? "#475569" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: isSaving ? "none" : "0 4px 15px rgba(16, 185, 129, 0.4)"
              }}
            >
              <FaSave size={14} /> {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* DROPDOWN PAGES SELECTOR — HIERARCHY + PILL STRIP */}
        <div className="ach-selector-card" style={{ background: "#111827", borderRadius: 14, padding: "16px 20px", border: "1px solid #1f2937", marginBottom: 24 }}>
          <div className="ach-selector-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "#ffffff", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 }}>
                <FaLayerGroup color="#38bdf8" /> Achievements Dropdown &amp; Sub-dropdown Pages ({(filteredPages || pages).length})
              </span>
              <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: 2 }}>
                Active Editing: <strong style={{ color: "#38bdf8" }}>{currentContent.nav_label || currentContent.title || activeSlug}</strong> (<code style={{ color: "#facc15" }}>/{activeSlug}</code>)
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
                onClick={() => { setCreateParentSlug("achievements"); setCreatePageName(""); setCreateCustomSlug(""); setCreateCustomTitle(""); setShowAdvancedCreate(false); setCreateError(""); setShowCreateModal(true); }}
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
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Quick search pages by title or slug (e.g. child-interventions, reports, portfolio)..."
              style={{ width: "100%", padding: "8px 14px 8px 36px", borderRadius: 8, background: "#0b0f19", border: "1px solid #374151", color: "#ffffff", fontSize: "0.82rem", outline: "none" }}
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
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
                const isParentSelected = parent.slug === activeSlug;
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
                        onClick={() => { setActiveSlug(parent.slug); try { setSearchParams({ slug: parent.slug, tab: activeTab }); } catch (_) {} }}
                        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: "1 1 280px" }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: subs.length > 0 ? "rgba(56, 189, 248, 0.15)" : "rgba(100, 116, 139, 0.15)", color: subs.length > 0 ? "#38bdf8" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {subs.length > 0 ? <FaFolderOpen size={14} /> : <FaFileAlt size={13} />}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: isParentSelected ? "#ffffff" : "#e2e8f0" }}>{parent.nav_label || parent.title || parent.slug}</span>
                            <code style={{ fontSize: "0.72rem", color: "#38bdf8", background: "rgba(0,0,0,0.3)", padding: "1px 6px", borderRadius: 4 }}>/{parent.slug}</code>
                            {subs.length > 0 && <span style={{ fontSize: "0.7rem", background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", padding: "1px 8px", borderRadius: 999, fontWeight: 700 }}>{subs.length} Sub-dropdown{subs.length !== 1 ? "s" : ""}</span>}
                            {parent.slug !== "achievements" && !(parent.parent_slug) && (
                              <span style={{ fontSize: "0.68rem", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "1px 8px", borderRadius: 999, fontWeight: 700 }}>
                                Not nested under Achievements
                              </span>
                            )}
                            {docCount > 0 && <span style={{ fontSize: "0.68rem", color: "#94a3b8", background: "#1f2937", padding: "1px 6px", borderRadius: 4 }}>{docCount} docs</span>}
                            {statCount > 0 && <span style={{ fontSize: "0.68rem", color: "#94a3b8", background: "#1f2937", padding: "1px 6px", borderRadius: 4 }}>{statCount} stats</span>}
                            {imgCount > 0 && <span style={{ fontSize: "0.68rem", color: "#94a3b8", background: "#1f2937", padding: "1px 6px", borderRadius: 4 }}>{imgCount} imgs</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {parent.slug !== "achievements" && !(parent.parent_slug) && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await adminUpdateAchievementsPage(adminKey, {
                                  slug: parent.slug,
                                  nav_label: parent.nav_label || parent.title || parent.slug,
                                  title: parent.title || parent.nav_label || parent.slug,
                                  parent_slug: "achievements"
                                });
                                if (res && res.success) {
                                  showToast(`✓ Moved "${parent.nav_label || parent.slug}" under Achievements`);
                                  try {
                                    localStorage.removeItem(ACHIEVE_CACHE_KEY);
                                    window.dispatchEvent(new Event("alertngo_achievements_pages_updated"));
                                    window.dispatchEvent(new Event("storage"));
                                  } catch (_) {}
                                  loadPagesList(parent.slug);
                                } else {
                                  showToast(res?.message || "Failed to move page under Achievements.", "error");
                                }
                              } catch (err) {
                                showToast("Error: " + err.message, "error");
                              }
                            }}
                            title="Set this page as a sub-dropdown under Achievements"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.35)", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Move under Achievements
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenAddSubPage(parent.slug)}
                          title={`Create a new sub-dropdown under ${parent.nav_label || parent.slug}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          <FaPlus size={9} /> Sub-dropdown
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveSlug(parent.slug); try { setSearchParams({ slug: parent.slug, tab: activeTab }); } catch (_) {} }}
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
                          const isChildSelected = child.slug === activeSlug;
                          const childDocs = (child.content?.downloads || []).length || child.downloads_count || 0;
                          const childStats = (child.content?.stats || []).length || child.stats_count || 0;
                          const childImgs = (child.content?.images || []).length || child.images_count || 0;
                          return (
                            <div
                              key={child.slug}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: isChildSelected ? "rgba(37, 99, 235, 0.25)" : "#0f172a", border: isChildSelected ? "1px solid #3b82f6" : "1px solid #1e293b", borderRadius: 8, padding: "8px 12px", gap: 10, flexWrap: "wrap", transition: "all 0.15s ease" }}
                            >
                              <div
                                onClick={() => { setActiveSlug(child.slug); try { setSearchParams({ slug: child.slug, tab: activeTab }); } catch (_) {} }}
                                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flex: "1 1 240px" }}
                              >
                                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: "0.85rem" }}>↳</span>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: isChildSelected ? "#ffffff" : "#cbd5e1" }}>{child.nav_label || child.title || child.slug}</span>
                                <code style={{ fontSize: "0.7rem", color: "#94a3b8", background: "rgba(0,0,0,0.3)", padding: "1px 5px", borderRadius: 4 }}>/{child.slug}</code>
                                <span style={{ fontSize: "0.66rem", background: "rgba(147, 197, 253, 0.15)", color: "#93c5fd", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>Sub-item</span>
                                {childDocs > 0 && <span style={{ fontSize: "0.66rem", color: "#64748b" }}>{childDocs} docs</span>}
                                {childStats > 0 && <span style={{ fontSize: "0.66rem", color: "#64748b" }}>{childStats} stats</span>}
                                {childImgs > 0 && <span style={{ fontSize: "0.66rem", color: "#64748b" }}>{childImgs} imgs</span>}
                              </div>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => { setActiveSlug(child.slug); try { setSearchParams({ slug: child.slug, tab: activeTab }); } catch (_) {} }}
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
              className="ach-selector-pills"
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
              style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin", cursor: "grab" }}
            >
              {(filteredPages || pages).map((p) => {
                const isSelected = p.slug === activeSlug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    data-selected={isSelected ? "true" : undefined}
                    onClick={(e) => {
                      if (hasMovedRef.current) { e.preventDefault(); return; }
                      setActiveSlug(p.slug);
                      try { setSearchParams({ slug: p.slug, tab: activeTab }); } catch (_) {}
                    }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8,
                      background: isSelected ? "#2563eb" : "#1f2937", color: isSelected ? "#ffffff" : "#cbd5e1",
                      border: isSelected ? "1px solid #3b82f6" : "1px solid #374151", fontSize: "0.82rem",
                      fontWeight: isSelected ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease"
                    }}
                  >
                    <span>{p.nav_label || p.title || p.slug}</span>
                    <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, background: isSelected ? "rgba(255,255,255,0.2)" : "#111827", color: isSelected ? "#ffffff" : "#94a3b8" }}>
                      /{p.slug}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

            {/* ACTIVE PAGE CONTROL CARD */}
            <div
              className="ach-card ach-control-card"
              style={{
                background: "#111827",
                borderRadius: 14,
                padding: "20px 24px",
                border: "1px solid #1f2937",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#ffffff" }}>
                    {currentContent.nav_label || currentContent.title || activeSlug}
                  </h2>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "#1e293b",
                      color: "#38bdf8",
                      border: "1px solid #334155",
                      fontWeight: 600
                    }}
                  >
                    Slug: /{activeSlug}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                  Category: <strong style={{ color: "#f1f5f9" }}>{currentContent.category || "Achievements"}</strong> • Badge: <strong style={{ color: "#10b981" }}>{currentContent.badge || "Achievements & Impact"}</strong>
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    setRenameLabel(currentContent.nav_label || currentContent.title || "");
                    setShowRenameModal(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: "#1f2937",
                    color: "#cbd5e1",
                    border: "1px solid #374151",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <FaEdit size={12} /> Rename in Dropdown
                </button>

                {activeSlug !== "achievements" && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    <FaTrash size={11} /> Delete Page
                  </button>
                )}
              </div>
            </div>

            {/* TABS HEADER */}
            <div
              className="ach-subtabs-wrap"
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                borderBottom: "1px solid #1f2937",
                paddingBottom: 12,
                marginBottom: 24,
                scrollbarWidth: "thin"
              }}
            >
              {[
                { id: "stats", label: `Stat Cards & Metrics (${(currentContent.stats || []).length})`, icon: FaSlidersH },
                { id: "images", label: `Maps & Images (${(currentContent.images || []).length})`, icon: FaImages },
                { id: "videos", label: `Field Videos (${(currentContent.videos || []).length})`, icon: FaVideo },
                { id: "documents", label: `PDF Documents & Reports (${(currentContent.downloads || []).length})`, icon: FaFilePdf },
                { id: "overview", label: `Overview Text (${(currentContent.paragraphs || []).length})`, icon: FaFileAlt },
                { id: "tables", label: `Structured Tables (${(currentContent.tables || []).length})`, icon: FaTable },
                { id: "meta", label: "Page Meta & Title", icon: FaSlidersH }
              ].map((tab) => {
                const isTabActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 18px",
                      borderRadius: 10,
                      background: isTabActive ? "#2563eb" : "#111827",
                      color: isTabActive ? "#ffffff" : "#94a3b8",
                      border: isTabActive ? "1px solid #3b82f6" : "1px solid #1f2937",
                      fontSize: "0.85rem",
                      fontWeight: isTabActive ? 700 : 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: STAT CARDS & METRICS */}
            {activeTab === "stats" && (
              <div className="ach-card ach-stat-header-card" style={{ background: "#111827", borderRadius: 14, padding: "24px", border: "1px solid #1f2937" }}>
                <div className="ach-stat-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                      Stat Cards &amp; Metric Highlights ({(currentContent.stats || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                      Displayed in the top highlight bar on <code>/{activeSlug}</code>. Admin can add, edit numbers, labels, icons, or delete anytime.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateContent((prev) => ({
                        ...prev,
                        stats: [
                          ...(prev.stats || []),
                          { value: "100+", num: "100+", label: "New Metric Label", icon: "chart", color: "#003190" }
                        ]
                      }));
                      showToast("New stat card added. Click 'Save Changes' to publish.");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <FaPlus size={11} /> Add Stat Card
                  </button>
                </div>

                {(currentContent.stats || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaSlidersH size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No stat cards configured for this page yet.</p>
                  </div>
                ) : (
                  <div className="ach-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {(currentContent.stats || []).map((st, idx) => {
                      const val = st.value || st.num || "";
                      const lbl = st.label || "";
                      const col = st.color || "#003190";
                      const ic = st.icon || "chart";

                      return (
                        <div
                          key={idx}
                          className="ach-stat-card"
                          style={{
                            background: "#1f2937",
                            borderRadius: 12,
                            padding: 16,
                            border: "1px solid #374151",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="adm-badge-pill" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0, display: "inline-block" }}>CARD #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                updateContent((prev) => ({
                                  ...prev,
                                  stats: prev.stats.filter((_, i) => i !== idx)
                                }));
                                showToast("Stat card deleted. Click 'Save Changes' to publish.");
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "0.8rem"
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.72rem", color: "#9ca3af", marginBottom: 4 }}>
                              Metric Value / Number *
                            </label>
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => {
                                const newV = e.target.value;
                                updateContent((prev) => {
                                  const stats = [...(prev.stats || [])];
                                  stats[idx] = { ...stats[idx], value: newV, num: newV };
                                  return { ...prev, stats };
                                });
                              }}
                              placeholder="e.g. 3,452 or 100+"
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                background: "#111827",
                                border: "1px solid #374151",
                                color: "#ffffff",
                                fontSize: "0.95rem",
                                fontWeight: 700
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.72rem", color: "#9ca3af", marginBottom: 4 }}>
                              Metric Label / Description *
                            </label>
                            <input
                              type="text"
                              value={lbl}
                              onChange={(e) => {
                                const newL = e.target.value;
                                updateContent((prev) => {
                                  const stats = [...(prev.stats || [])];
                                  stats[idx] = { ...stats[idx], label: newL };
                                  return { ...prev, stats };
                                });
                              }}
                              placeholder="e.g. Farmers Supported"
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                background: "#111827",
                                border: "1px solid #374151",
                                color: "#ffffff",
                                fontSize: "0.82rem"
                              }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af", marginBottom: 4 }}>Icon</label>
                              <select
                                value={ic}
                                onChange={(e) => {
                                  const newI = e.target.value;
                                  updateContent((prev) => {
                                    const stats = [...(prev.stats || [])];
                                    stats[idx] = { ...stats[idx], icon: newI };
                                    return { ...prev, stats };
                                  });
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 8px",
                                  borderRadius: 6,
                                  background: "#111827",
                                  border: "1px solid #374151",
                                  color: "#ffffff",
                                  fontSize: "0.78rem"
                                }}
                              >
                                {STAT_ICON_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af", marginBottom: 4 }}>Accent Color</label>
                              <select
                                value={col}
                                onChange={(e) => {
                                  const newC = e.target.value;
                                  updateContent((prev) => {
                                    const stats = [...(prev.stats || [])];
                                    stats[idx] = { ...stats[idx], color: newC };
                                    return { ...prev, stats };
                                  });
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 8px",
                                  borderRadius: 6,
                                  background: "#111827",
                                  border: "1px solid #374151",
                                  color: "#ffffff",
                                  fontSize: "0.78rem"
                                }}
                              >
                                {STAT_COLOR_OPTIONS.map((c) => (
                                  <option key={c.value} value={c.value}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MAPS & IMAGES */}
            {activeTab === "images" && (
              <div className="ach-tab-card" style={{ background: "#111827", borderRadius: 14, padding: "24px", border: "1px solid #1f2937" }}>
                <div className="ach-tab-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaImages color="#38bdf8" /> Field Photos, Infographics &amp; Images ({(currentContent.images || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                      Upload photo evidence from your computer or add external image URLs. Stored into <code>/uploads/achievements/</code>.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleOpenAddImage}
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
                      <FaCloudUploadAlt size={14} /> + Upload &amp; Add New Image
                    </button>
                  </div>
                </div>

                {(currentContent.images || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaImages size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No images or infographics attached to this page yet.</p>
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
                              e.target.src = "/uploads/PORTFOLIO-2.png";
                            }}
                          />
                          <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "white", padding: "3px 8px", borderRadius: 5, fontSize: "0.7rem", fontWeight: 700 }}>
                            IMAGE #{idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditImage(img, idx)}
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
                              gap: 4
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
                                updateContent((prev) => {
                                  const images = [...(prev.images || [])];
                                  images[idx] = { ...images[idx], name: val, caption: val, alt: val };
                                  return { ...prev, images };
                                });
                              }}
                              placeholder="Image Caption / Name"
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: 6,
                                background: "#111827",
                                border: "1px solid #374151",
                                color: "#ffffff",
                                fontSize: "0.82rem",
                                marginBottom: 6
                              }}
                            />
                            <div style={{ fontSize: "0.72rem", color: "#64748b", wordBreak: "break-all" }}>
                              {img.src || img.url}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginTop: 12 }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => setPreviewFullImg(img.src || img.url)}
                                style={{
                                  background: "#374151",
                                  color: "#60a5fa",
                                  border: "none",
                                  padding: "5px 10px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                <FaEye size={10} /> View Full
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditImage(img, idx)}
                                style={{
                                  background: "#374151",
                                  color: "#93c5fd",
                                  border: "1px solid #4b5563",
                                  padding: "5px 10px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                <FaEdit size={10} /> Edit
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(idx)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              <FaTrash size={10} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FIELD VIDEOS */}
            {activeTab === "videos" && (
              <div className="ach-tab-card" style={{ background: "#111827", borderRadius: 14, padding: "24px", border: "1px solid #1f2937" }}>
                <div className="ach-tab-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaVideo color="#ef4444" /> Field Videos &amp; Documentary Recordings ({(currentContent.videos || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                      Directly upload video files (.mp4, .webm, .mov) or attach YouTube / Vimeo links.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleOpenAddVideo}
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
                        cursor: "pointer"
                      }}
                    >
                      <FaCloudUploadAlt size={14} /> + Upload / Add Video
                    </button>
                  </div>
                </div>

                {(currentContent.videos || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaVideo size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No videos attached to this page yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
                    {(currentContent.videos || []).map((vid, idx) => {
                      const isYt = isYouTubeUrl(vid.url);
                      return (
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
                          <div style={{ height: 180, background: "#000000", position: "relative" }}>
                            {isYt ? (
                              <iframe
                                src={getYouTubeEmbedUrl(vid.url)}
                                title={vid.title}
                                style={{ width: "100%", height: "100%", border: "none" }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={vid.url}
                                controls
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            )}
                            <span
                              style={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                background: isYt ? "#dc2626" : "#2563eb",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: "0.7rem",
                                fontWeight: 700
                              }}
                            >
                              {isYt ? "YouTube" : "Video File"}
                            </span>
                          </div>

                          <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                              <input
                                type="text"
                                value={vid.title || ""}
                                onChange={(e) => {
                                  const newT = e.target.value;
                                  updateContent((prev) => {
                                    const videos = [...(prev.videos || [])];
                                    videos[idx] = { ...videos[idx], title: newT };
                                    return { ...prev, videos };
                                  });
                                }}
                                placeholder="Video Title"
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  background: "#111827",
                                  border: "1px solid #374151",
                                  color: "#ffffff",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  marginBottom: 6
                                }}
                              />
                              <textarea
                                value={vid.description || ""}
                                onChange={(e) => {
                                  const newD = e.target.value;
                                  updateContent((prev) => {
                                    const videos = [...(prev.videos || [])];
                                    videos[idx] = { ...videos[idx], description: newD };
                                    return { ...prev, videos };
                                  });
                                }}
                                placeholder="Video description..."
                                rows={2}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  background: "#111827",
                                  border: "1px solid #374151",
                                  color: "#cbd5e1",
                                  fontSize: "0.78rem",
                                  resize: "vertical"
                                }}
                              />
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditVideo(vid, idx)}
                                style={{
                                  background: "#374151",
                                  color: "#93c5fd",
                                  border: "1px solid #4b5563",
                                  padding: "5px 12px",
                                  borderRadius: 6,
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                <FaEdit size={10} /> Edit / Replace Video
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVideo(idx)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                <FaTrash size={10} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PDF DOCUMENTS & REPORTS */}
            {activeTab === "documents" && (
              <div className="ach-tab-card" style={{ background: "#111827", borderRadius: 14, padding: "24px", border: "1px solid #1f2937" }}>
                <div className="ach-tab-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaFilePdf color="#f59e0b" /> Official Documents &amp; Audit Reports ({(currentContent.downloads || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                      Upload official PDF bare acts, audited annual statements, and survey reports.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddDoc}
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
                      cursor: "pointer"
                    }}
                  >
                    <FaPlus size={11} /> Add PDF / Report Document
                  </button>
                </div>

                {(currentContent.downloads || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaFilePdf size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No PDF documents or reports attached yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(currentContent.downloads || []).map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#1f2937",
                          borderRadius: 10,
                          padding: "12px 16px",
                          border: "1px solid #374151",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          flexWrap: "wrap"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              background: "rgba(245, 158, 11, 0.15)",
                              color: "#f59e0b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 18
                            }}
                          >
                            <FaFilePdf />
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              value={doc.text || doc.title || ""}
                              onChange={(e) => {
                                const newT = e.target.value;
                                updateContent((prev) => {
                                  const downloads = [...(prev.downloads || [])];
                                  downloads[idx] = { ...downloads[idx], text: newT, title: newT };
                                  return { ...prev, downloads };
                                });
                              }}
                              placeholder="Document Title"
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: 6,
                                background: "#111827",
                                border: "1px solid #374151",
                                color: "#ffffff",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                marginBottom: 4
                              }}
                            />
                            <div style={{ fontSize: "0.72rem", color: "#64748b", wordBreak: "break-all" }}>
                              {doc.url} • <span style={{ color: "#94a3b8" }}>{doc.fileSize || "Official Document"}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              background: "#374151",
                              color: "#60a5fa",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}
                          >
                            <FaDownload size={10} /> View / Download
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEditDoc(doc, idx)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              background: "#374151",
                              color: "#cbd5e1",
                              border: "1px solid #4b5563",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}
                          >
                            <FaEdit size={10} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(idx)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: 6
                            }}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: OVERVIEW TEXT & NARRATIVE */}
            {activeTab === "overview" && (
              <div className="ach-tab-card" style={{ background: "#111827", borderRadius: 14, padding: "24px", border: "1px solid #1f2937" }}>
                <div className="ach-tab-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                      Narrative Text &amp; Story Paragraphs ({(currentContent.paragraphs || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                      Full narrative text presented on <code>/{activeSlug}</code>. You can add new paragraphs, edit existing text, or delete anytime.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateContent((prev) => ({
                        ...prev,
                        paragraphs: [...(prev.paragraphs || []), "New narrative paragraph detailing our community intervention..."]
                      }));
                      showToast("New paragraph added. Click 'Save Changes' to publish.");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <FaPlus size={11} /> Add Paragraph
                  </button>
                </div>

                {(currentContent.paragraphs || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaFileAlt size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No story paragraphs yet. Click "+ Add Paragraph" to start.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(currentContent.paragraphs || []).map((pText, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#1f2937",
                          borderRadius: 12,
                          padding: 16,
                          border: "1px solid #374151"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span className="adm-badge-pill" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0, display: "inline-block" }}>
                            PARAGRAPH #{idx + 1}
                          </span>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateContent((prev) => {
                                    const paras = [...(prev.paragraphs || [])];
                                    const temp = paras[idx - 1];
                                    paras[idx - 1] = paras[idx];
                                    paras[idx] = temp;
                                    return { ...prev, paragraphs: paras };
                                  });
                                }}
                                style={{ background: "#374151", border: "none", color: "#cbd5e1", borderRadius: 4, padding: "4px 8px", cursor: "pointer" }}
                                title="Move Up"
                              >
                                <FaArrowUp size={10} />
                              </button>
                            )}
                            {idx < (currentContent.paragraphs || []).length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateContent((prev) => {
                                    const paras = [...(prev.paragraphs || [])];
                                    const temp = paras[idx + 1];
                                    paras[idx + 1] = paras[idx];
                                    paras[idx] = temp;
                                    return { ...prev, paragraphs: paras };
                                  });
                                }}
                                style={{ background: "#374151", border: "none", color: "#cbd5e1", borderRadius: 4, padding: "4px 8px", cursor: "pointer" }}
                                title="Move Down"
                              >
                                <FaArrowDown size={10} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                updateContent((prev) => ({
                                  ...prev,
                                  paragraphs: (prev.paragraphs || []).filter((_, i) => i !== idx)
                                }));
                                showToast("Paragraph removed. Click 'Save Changes' to publish.");
                              }}
                              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px 8px" }}
                              title="Delete"
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={pText}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateContent((prev) => {
                              const paras = [...(prev.paragraphs || [])];
                              paras[idx] = val;
                              return { ...prev, paragraphs: paras };
                            });
                          }}
                          rows={4}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "#111827",
                            border: "1px solid #374151",
                            color: "#ffffff",
                            fontSize: "0.88rem",
                            lineHeight: 1.6,
                            resize: "vertical"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: STRUCTURED TABLES */}
            {activeTab === "tables" && (
              <div className="ach-tab-card" style={{ background: "#111827", borderRadius: 14, padding: "24px", border: "1px solid #1f2937" }}>
                <div className="ach-tab-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                      Structured Tables &amp; Data Grids ({(currentContent.tables || []).length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                      Dynamic data tables rendered with instant search filters, column headers, and view/download buttons.
                    </p>
                  </div>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleSaveTables}
                      disabled={isSaving}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px",
                        borderRadius: 8, background: "#10b981", color: "#ffffff",
                        border: "1px solid #059669", fontSize: "0.82rem", fontWeight: 700,
                        cursor: isSaving ? "not-allowed" : "pointer",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)"
                      }}
                    >
                      <FaSave size={13} /> {isSaving ? "Saving Tables..." : "Save All Tables"}
                    </button>

                    <button
                    type="button"
                    onClick={() => {
                      updateContent((prev) => ({
                        ...prev,
                        tables: [
                          ...(prev.tables || []),
                          {
                            title: "New Table",
                            headers: ["S.No", "Program / Focus", "Key Metric", "Documentation"],
                            rows: [
                              ["1", "Community Initiative", "500 Beneficiaries", "Official Notice"]
                            ]
                          }
                        ]
                      }));
                      showToast("New table added. Click 'Save Changes' to publish.");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <FaPlus size={11} /> Add Table
                  </button>
                  </div>
                </div>

                {(currentContent.tables || []).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    <FaTable size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No structured tables configured for this page yet.</p>
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
                    <div className="ach-table-item-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <input
                        type="text"
                        value={tbl.title || `Table #${tIdx + 1}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateContent((prev) => {
                            const tables = [...(prev.tables || [])];
                            tables[tIdx] = { ...tables[tIdx], title: val };
                            return { ...prev, tables };
                          });
                        }}
                        style={{
                          background: "#111827",
                          border: "1px solid #374151",
                          color: "#ffffff",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          padding: "6px 12px",
                          borderRadius: 6,
                          minWidth: 200,
                          height: 38
                        }}
                      />

                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  updateContent((prev) => {
                                    const tables = [...(prev.tables || [])];
                                    const numCols = (tables[tIdx].headers || []).length || 3;
                                    const newRow = Array(numCols).fill("New Data");
                                    tables[tIdx] = {
                                      ...tables[tIdx],
                                      rows: [...(tables[tIdx].rows || []), newRow]
                                    };
                                    return { ...prev, tables };
                                  });
                                }}
                                style={{
                                  background: "#2563eb",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                + Add Row
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateContent((prev) => ({
                                    ...prev,
                                    tables: (prev.tables || []).filter((_, i) => i !== tIdx)
                                  }));
                                  showToast("Table deleted. Click 'Save Changes' to publish.");
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  fontSize: "0.85rem"
                                }}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          {/* Table View / Headers */}
                          <div className="ach-table-scroll-wrap" style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                              <thead>
                                <tr style={{ background: "#111827" }}>
                                  {(tbl.headers || []).map((h, hIdx) => (
                                    <th key={hIdx} style={{ padding: "8px 10px", border: "1px solid #374151", textAlign: "left", color: "#38bdf8" }}>
                                      <input
                                        type="text"
                                        value={h}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateContent((prev) => {
                                            const tables = [...(prev.tables || [])];
                                            const headers = [...(tables[tIdx].headers || [])];
                                            headers[hIdx] = val;
                                            tables[tIdx] = { ...tables[tIdx], headers };
                                            return { ...prev, tables };
                                          });
                                        }}
                                        style={{
                                          background: "transparent",
                                          border: "none",
                                          color: "#38bdf8",
                                          fontWeight: 700,
                                          width: "100%"
                                        }}
                                      />
                                    </th>
                                  ))}
                                  <th style={{ width: 40, border: "1px solid #374151" }} />
                                </tr>
                              </thead>
                              <tbody>
                                {(tbl.rows || []).map((r, rIdx) => (
                                  <tr key={rIdx}>
                                    {(Array.isArray(r) ? r : []).map((cell, cIdx) => (
                                      <td key={cIdx} style={{ padding: "6px 8px", border: "1px solid #374151" }}>
                                        <input
                                          type="text"
                                          value={cell}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            updateContent((prev) => {
                                              const tables = [...(prev.tables || [])];
                                              const rows = [...(tables[tIdx].rows || [])];
                                              const row = [...rows[rIdx]];
                                              row[cIdx] = val;
                                              rows[rIdx] = row;
                                              tables[tIdx] = { ...tables[tIdx], rows };
                                              return { ...prev, tables };
                                            });
                                          }}
                                          style={{
                                            width: "100%",
                                            background: "transparent",
                                            border: "none",
                                            color: "#ffffff"
                                          }}
                                        />
                                      </td>
                                    ))}
                                    <td style={{ textAlign: "center", border: "1px solid #374151" }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateContent((prev) => {
                                            const tables = [...(prev.tables || [])];
                                            tables[tIdx] = {
                                              ...tables[tIdx],
                                              rows: (tables[tIdx].rows || []).filter((_, i) => i !== rIdx)
                                            };
                                            return { ...prev, tables };
                                          });
                                        }}
                                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                                      >
                                        <FaTrash size={10} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 7: PAGE META & TITLE */}
                {activeTab === "meta" && (
                  <div className="ach-tab-card" style={{ background: "#111827", borderRadius: 14, padding: "24px", border: "1px solid #1f2937", maxWidth: 900 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                      Page Metadata &amp; Banner Settings
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", color: "#9ca3af", marginBottom: 6 }}>
                          Parent Dropdown / Navbar Location
                        </label>
                        <select
                          value={currentContent.parent_slug || ""}
                          onChange={(e) => updateContent({ parent_slug: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "#0b0f19",
                            border: "1px solid #374151",
                            color: "#ffffff",
                            fontSize: "0.95rem"
                          }}
                        >
                          <option value="">— Top-level (or auto under Achievements menu) —</option>
                          {(pages || [])
                            .filter((p) => p && p.slug && p.slug !== activeSlug)
                            .map((p) => (
                              <option key={p.slug} value={p.slug}>
                                {p.nav_label || p.title || p.slug} ({p.slug})
                              </option>
                            ))}
                        </select>
                        <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 6 }}>
                          Set <code>achievements</code> to place this page as a sub-dropdown under Achievements in the navbar. Save changes after updating.
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", color: "#9ca3af", marginBottom: 6 }}>
                          Page Header Title (Visible on Website Banner) *
                        </label>
                        <input
                          type="text"
                          value={currentContent.title || ""}
                          onChange={(e) => updateContent({ title: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "#0b0f19",
                            border: "1px solid #374151",
                            color: "#ffffff",
                            fontSize: "0.95rem"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", color: "#9ca3af", marginBottom: 6 }}>
                          Navigation Label (Inside Navbar Dropdown) *
                        </label>
                        <input
                          type="text"
                          value={currentContent.nav_label || ""}
                          onChange={(e) => updateContent({ nav_label: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "#0b0f19",
                            border: "1px solid #374151",
                            color: "#ffffff",
                            fontSize: "0.95rem"
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", color: "#9ca3af", marginBottom: 6 }}>
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={currentContent.category || ""}
                            onChange={(e) => updateContent({ category: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 8,
                              background: "#0b0f19",
                              border: "1px solid #374151",
                              color: "#ffffff",
                              fontSize: "0.95rem"
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", color: "#9ca3af", marginBottom: 6 }}>
                            Badge Tag (Banner Top Label)
                          </label>
                          <input
                            type="text"
                            value={currentContent.badge || ""}
                            onChange={(e) => updateContent({ badge: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 8,
                              background: "#0b0f19",
                              border: "1px solid #374151",
                              color: "#ffffff",
                              fontSize: "0.95rem"
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", color: "#9ca3af", marginBottom: 6 }}>
                          Subtitle / Mission Overview Description
                        </label>
                        <textarea
                          value={currentContent.subtitle || ""}
                          onChange={(e) => updateContent({ subtitle: e.target.value })}
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "#0b0f19",
                            border: "1px solid #374151",
                            color: "#ffffff",
                            fontSize: "0.85rem",
                            lineHeight: 1.5,
                            resize: "vertical"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* MODALS */}
                {/* ========================================================================= */}

                {/* 1. CREATE PAGE MODAL (SIMPLIFIED 1-FIELD) */}
                {showCreateModal && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 9999,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20
                    }}
                  >
                    <div
                      className="ach-modal-card"
                      style={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 16,
                        padding: "26px 30px",
                        width: "100%",
                        maxWidth: 520,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                          <FaPlus color="#38bdf8" /> Create New Achievements Page
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {createError && (
                        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: "0.82rem", marginBottom: 14 }}>
                          ⚠️ {createError}
                        </div>
                      )}

                      <form onSubmit={handleCreatePage}>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                            Page Name *
                          </label>
                          <input
                            type="text"
                            value={createPageName}
                            onChange={(e) => setCreatePageName(e.target.value)}
                            placeholder="e.g. Community Welfare Review"
                            autoFocus
                            required
                            style={{
                              width: "100%",
                              padding: "12px 14px",
                              borderRadius: 8,
                              background: "#1e293b",
                              border: "1px solid #475569",
                              color: "#ffffff",
                              fontSize: "0.95rem"
                            }}
                          />
                          <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: 6 }}>
                            Auto URL: <code>/{derivedCreateSlug || "..."}</code>
                          </div>
                          {createParentSlug === "achievements" && !showAdvancedCreate && (
                            <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: 6 }}>
                              Will be added under <strong style={{ color: "#cbd5e1" }}>Achievements</strong> dropdown (change in Advanced Settings).
                            </div>
                          )}
                        </div>

                        <div style={{ marginBottom: 18 }}>
                          <button
                            type="button"
                            onClick={() => setShowAdvancedCreate(!showAdvancedCreate)}
                            style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "0.78rem", cursor: "pointer", padding: 0 }}
                          >
                            {showAdvancedCreate ? "▼ Hide Advanced Settings" : "▶ Customize URL slug, title, or parent (Optional)"}
                          </button>

                          {showAdvancedCreate && (
                            <div style={{ marginTop: 12, padding: 14, background: "#1e293b", borderRadius: 8, border: "1px solid #334155", display: "flex", flexDirection: "column", gap: 10 }}>
                              <div>
                                <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: 4 }}>Parent Dropdown (optional)</label>
                                <select
                                  value={createParentSlug}
                                  onChange={(e) => setCreateParentSlug(e.target.value)}
                                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0b0f19", border: "1px solid #475569", color: "#fff", fontSize: "0.82rem" }}
                                >
                                  <option value="">— Top-level page —</option>
                                  {(pages || [])
                                    .filter((p) => p && p.slug && p.slug !== derivedCreateSlug)
                                    .map((p) => (
                                      <option key={p.slug} value={p.slug}>
                                        {p.nav_label || p.title || p.slug} ({p.slug})
                                      </option>
                                    ))}
                                </select>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 4 }}>
                                  Select a parent to create this as a sub-dropdown item in the navbar.
                                </div>
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: 4 }}>Custom URL Slug</label>
                                <input
                                  type="text"
                                  value={createCustomSlug}
                                  onChange={(e) => setCreateCustomSlug(e.target.value)}
                                  placeholder="e.g. community-welfare"
                                  style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: "#0b0f19", border: "1px solid #475569", color: "#fff", fontSize: "0.82rem" }}
                                />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginBottom: 4 }}>Banner Header Title</label>
                                <input
                                  type="text"
                                  value={createCustomTitle}
                                  onChange={(e) => setCreateCustomTitle(e.target.value)}
                                  placeholder="Official Title on Banner"
                                  style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: "#0b0f19", border: "1px solid #475569", color: "#fff", fontSize: "0.82rem" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            style={{ padding: "9px 16px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", fontSize: "0.85rem", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{ padding: "9px 20px", borderRadius: 8, background: "#0284c7", color: "#ffffff", border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Create Page
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 2. RENAME MODAL */}
                {showRenameModal && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 9999,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20
                    }}
                  >
                    <div
                      className="ach-modal-card"
                      style={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 16,
                        padding: "24px 28px",
                        width: "100%",
                        maxWidth: 440
                      }}
                    >
                      <h3 style={{ margin: "0 0 14px", fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }}>
                        Rename Dropdown Label
                      </h3>
                      <form onSubmit={handleRenamePage}>
                        <div style={{ marginBottom: 16 }}>
                          <input
                            type="text"
                            value={renameLabel}
                            onChange={(e) => setRenameLabel(e.target.value)}
                            required
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: 8,
                              background: "#1e293b",
                              border: "1px solid #475569",
                              color: "#ffffff",
                              fontSize: "0.9rem"
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => setShowRenameModal(false)}
                            style={{ padding: "8px 14px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{ padding: "8px 18px", borderRadius: 8, background: "#2563eb", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer" }}
                          >
                            Save Name
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 3. DELETE CONFIRMATION MODAL */}
                {showDeleteModal && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 9999,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20
                    }}
                  >
                    <div
                      className="ach-modal-card"
                      style={{
                        background: "#0f172a",
                        border: "1px solid rgba(239,68,68,0.4)",
                        borderRadius: 16,
                        padding: "24px 28px",
                        width: "100%",
                        maxWidth: 440
                      }}
                    >
                      <h3 style={{ margin: "0 0 10px", fontSize: "1.15rem", fontWeight: 800, color: "#ef4444" }}>
                        Confirm Page Deletion
                      </h3>
                      <p style={{ margin: "0 0 18px", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        Are you sure you want to delete <strong>/{activeSlug}</strong>? All attached narrative text, tables, images, and videos will be permanently removed.
                      </p>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(false)}
                          style={{ padding: "8px 14px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeletePage}
                          style={{ padding: "8px 18px", borderRadius: 8, background: "#dc2626", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer" }}
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ADD / EDIT IMAGE MODAL */}
                {showAddImgModal && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 9999,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20
                    }}
                  >
                    <div
                      className="ach-modal-card"
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
                          <FaImages color="#38bdf8" /> {editingImgIdx !== null ? "Edit / Replace Image" : "Add New Image / Photo"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowAddImgModal(false)}
                          style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Mode Switcher */}
                      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#1e293b", padding: 4, borderRadius: 8 }}>
                        <button
                          type="button"
                          onClick={() => setAddImgMode("upload")}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: addImgMode === "upload" ? "#2563eb" : "transparent",
                            color: addImgMode === "upload" ? "#ffffff" : "#94a3b8",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <FaCloudUploadAlt size={14} /> Upload Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddImgMode("url")}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: addImgMode === "url" ? "#2563eb" : "transparent",
                            color: addImgMode === "url" ? "#ffffff" : "#94a3b8",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <FaLink size={12} /> Photo URL
                        </button>
                      </div>

                      {uploadImgError && (
                        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: "0.8rem", marginBottom: 12 }}>
                          ⚠️ {uploadImgError}
                        </div>
                      )}

                      <form onSubmit={handleSaveImageModal}>
                        {addImgMode === "upload" ? (
                          <div style={{ marginBottom: 14 }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                              Select Photo / Image File *
                            </label>
                            <input
                              type="file"
                              ref={imgFileInputRef}
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleSelectImgFile(e.target.files[0]);
                                }
                              }}
                              style={{ display: "none" }}
                            />
                            <div
                              onClick={() => imgFileInputRef.current?.click()}
                              style={{
                                border: "2px dashed #475569",
                                borderRadius: 10,
                                padding: "24px 16px",
                                textAlign: "center",
                                background: "#1e293b",
                                cursor: "pointer"
                              }}
                            >
                              <FaCloudUploadAlt size={32} color="#38bdf8" style={{ marginBottom: 8 }} />
                              <p style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>
                                {selectedImgFile ? selectedImgFile.name : "Click to choose image file (JPG, PNG, WEBP)"}
                              </p>
                              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                                {selectedImgFile ? formatBytes(selectedImgFile.size) : "Max recommended 10MB"}
                              </span>
                            </div>

                            {selectedImgFile && (
                              <div style={{ marginTop: 12, background: "#0b0f19", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: "0.75rem" }}>
                                  <span style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                                    {uploadedImgUrl || imgUploadProgress.percent === 100 ? (
                                      <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                        <FaCheckCircle /> Upload Complete
                                      </span>
                                    ) : (
                                      <span>Uploading Photo...</span>
                                    )}
                                  </span>
                                  <span style={{ fontWeight: 700, color: uploadedImgUrl || imgUploadProgress.percent === 100 ? "#10b981" : "#38bdf8" }}>
                                    {uploadedImgUrl || imgUploadProgress.percent === 100 ? "100%" : `${imgUploadProgress.percent}%`}
                                  </span>
                                </div>
                                <div style={{ width: "100%", height: 6, background: "#334155", borderRadius: 3, overflow: "hidden" }}>
                                  <div
                                    style={{
                                      width: `${uploadedImgUrl ? 100 : imgUploadProgress.percent}%`,
                                      height: "100%",
                                      background: uploadedImgUrl || imgUploadProgress.percent === 100 ? "#10b981" : "linear-gradient(90deg, #38bdf8, #2563eb)",
                                      transition: "width 0.2s ease"
                                    }}
                                  />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.7rem", color: "#64748b" }}>
                                  <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedImgFile.name}</span>
                                  <span>{formatBytes(imgUploadProgress.loaded || selectedImgFile.size)} / {formatBytes(selectedImgFile.size)}</span>
                                </div>
                              </div>
                            )}

                            {selectedImgPreview && (
                              <div style={{ marginTop: 10, height: 140, borderRadius: 8, overflow: "hidden", background: "#0b0f19" }}>
                                <img src={selectedImgPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ marginBottom: 14 }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                              Image / Photo URL *
                            </label>
                            <input
                              type="text"
                              value={imgModalData.url}
                              onChange={(e) => setImgModalData({ ...imgModalData, url: e.target.value })}
                              placeholder="https://... or /uploads/..."
                              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.85rem" }}
                            />
                          </div>
                        )}

                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: 4 }}>
                            Image Title / Name
                          </label>
                          <input
                            type="text"
                            value={imgModalData.name}
                            onChange={(e) => setImgModalData({ ...imgModalData, name: e.target.value })}
                            placeholder="e.g. Field Training in Koya Village"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.85rem" }}
                          />
                        </div>

                        <div style={{ marginBottom: 18 }}>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: 4 }}>
                            Caption / Description
                          </label>
                          <textarea
                            value={imgModalData.caption}
                            onChange={(e) => setImgModalData({ ...imgModalData, caption: e.target.value })}
                            placeholder="Detailed caption describing this field photo or infographic..."
                            rows={2}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.82rem", resize: "vertical" }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => setShowAddImgModal(false)}
                            style={{ padding: "8px 14px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUploadingImg || (addImgMode === "folder" && !uploadedImgUrl && !imgModalData.url)}
                            style={{
                              padding: "8px 20px",
                              borderRadius: 8,
                              background: addImgMode === "folder" ? "#059669" : isUploadingImg ? "#1d4ed8" : "#2563eb",
                              color: "#ffffff",
                              border: "none",
                              fontWeight: 700,
                              cursor: isUploadingImg ? "wait" : "pointer"
                            }}
                          >
                            {addImgMode === "folder" ? "Attach Photo to Page" : isUploadingImg ? `Uploading... ${imgUploadProgress.percent}%` : editingImgIdx !== null ? "Save Image" : "Add Image"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 5. ADD / EDIT VIDEO MODAL */}
                {showAddVidModal && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 9999,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20
                    }}
                  >
                    <div
                      className="ach-modal-card"
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
                            disabled={isUploadingVid || (vidModalMode === "folder" && !uploadedVidUrl && !vidModalData.url)}
                            style={{
                              padding: "8px 20px",
                              borderRadius: 8,
                              background: vidModalMode === "folder" ? "#059669" : isUploadingVid ? "#991b1b" : "#2563eb",
                              color: "#ffffff",
                              border: "none",
                              fontWeight: 700,
                              cursor: isUploadingVid ? "wait" : "pointer"
                            }}
                          >
                            {vidModalMode === "folder" ? "Attach Video to Page" : isUploadingVid ? `Uploading... ${vidUploadProgress.percent}%` : editingVidIdx !== null ? "Save Video" : "Add Video"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 6. ADD / EDIT DOCUMENT MODAL */}
                {showAddDocModal && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 9999,
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20
                    }}
                  >
                    <div
                      className="ach-modal-card"
                      style={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 16,
                        padding: "24px 28px",
                        width: "100%",
                        maxWidth: 520
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
                          <FaFilePdf color="#f59e0b" /> {editingDocIdx !== null ? "Edit Document" : "Add PDF / Report Document"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowAddDocModal(false)}
                          style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Mode Switcher */}
                      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#1e293b", padding: 4, borderRadius: 8 }}>
                        <button
                          type="button"
                          onClick={() => setDocModalMode("folder")}
                          style={{
                            flex: 1.2,
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: docModalMode === "folder" ? "#059669" : "transparent",
                            color: docModalMode === "folder" ? "#ffffff" : "#94a3b8",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <FaFolderOpen size={13} /> 📁 Media Folder (0s)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocModalMode("upload")}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: docModalMode === "upload" ? "#2563eb" : "transparent",
                            color: docModalMode === "upload" ? "#ffffff" : "#94a3b8",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <FaCloudUploadAlt size={14} /> ⚡ Fast Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocModalMode("url")}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: docModalMode === "url" ? "#2563eb" : "transparent",
                            color: docModalMode === "url" ? "#ffffff" : "#94a3b8",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
                          }}
                        >
                          <FaLink size={12} /> Document URL
                        </button>
                      </div>

                      {uploadDocError && (
                        <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, padding: "8px 12px", color: "#fca5a5", fontSize: "0.8rem", marginBottom: 12 }}>
                          ⚠️ {uploadDocError}
                        </div>
                      )}

                      <form onSubmit={handleSaveDocModal}>
                        {docModalMode === "folder" ? (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ background: "#064e3b", border: "1px solid #059669", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#6ee7b7", display: "flex", alignItems: "center", gap: 6 }}>
                                  <FaFolderOpen /> ⚡ 0-Second Instant Document Attach
                                </div>
                                <button
                                  type="button"
                                  onClick={loadFolderDocuments}
                                  disabled={isLoadingFolderDocs}
                                  style={{
                                    background: "#047857",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4
                                  }}
                                >
                                  <FaUndo size={10} /> Refresh Folder
                                </button>
                              </div>
                              <p style={{ margin: "0 0 8px", fontSize: "0.75rem", color: "#a7f3d0", lineHeight: 1.4 }}>
                                Drop or paste official PDF / report documents directly into this folder on your PC:
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#022c22", border: "1px solid #047857", borderRadius: 6, padding: "6px 8px" }}>
                                <code style={{ flex: 1, color: "#34d399", fontSize: "0.72rem", fontWeight: 700, wordBreak: "break-all" }}>
                                  frontend\public\uploads\achievements\{activeSlug}\documents\
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`frontend\\public\\uploads\\achievements\\${activeSlug}\\documents\\`);
                                    showToast("Copied documents folder path to clipboard!");
                                  }}
                                  style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 4, padding: "3px 8px", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                                >
                                  Copy Path
                                </button>
                              </div>
                            </div>

                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                              Select Document from Folder ({folderDocs.length} found):
                            </label>

                            {isLoadingFolderDocs ? (
                              <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "0.82rem" }}>
                                Scanning documents folder...
                              </div>
                            ) : folderDocs.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "18px 12px", background: "#0b0f19", borderRadius: 8, border: "1px dashed #334155", color: "#94a3b8", fontSize: "0.8rem" }}>
                                No documents found in <code>frontend/public/uploads/achievements/{activeSlug}/documents/</code>.<br />
                                Copy or move your PDF reports into that folder, then click <strong>Refresh Folder</strong> above!
                              </div>
                            ) : (
                              <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                                {folderDocs.map((doc, i) => (
                                  <div
                                    key={i}
                                    onClick={() => handleSelectFolderDoc(doc)}
                                    style={{
                                      background: selectedFolderDoc?.filename === doc.filename ? "#065f46" : "#1e293b",
                                      border: `1px solid ${selectedFolderDoc?.filename === doc.filename ? "#10b981" : "#334155"}`,
                                      borderRadius: 8,
                                      padding: "8px 12px",
                                      cursor: "pointer",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      transition: "all 0.15s ease"
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                                      <FaFilePdf color={selectedFolderDoc?.filename === doc.filename ? "#34d399" : "#f59e0b"} size={14} />
                                      <div style={{ overflow: "hidden" }}>
                                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                          {doc.filename}
                                        </div>
                                        <div style={{ fontSize: "0.7rem", color: selectedFolderDoc?.filename === doc.filename ? "#a7f3d0" : "#94a3b8" }}>
                                          {formatBytes(doc.size)} • {doc.url}
                                        </div>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ffffff", padding: "3px 8px", background: selectedFolderDoc?.filename === doc.filename ? "#059669" : "#334155", borderRadius: 4 }}>
                                      {selectedFolderDoc?.filename === doc.filename ? "Selected ✓" : "Choose"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : docModalMode === "upload" ? (
                          <div style={{ marginBottom: 14 }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                              Select PDF File *
                            </label>
                            <input
                              type="file"
                              ref={docFileInputRef}
                              accept=".pdf,.doc,.docx,.xlsx,.xls,.zip"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  setSelectedDocFile(file);
                                  if (!docModalData.text) {
                                    setDocModalData((prev) => ({ ...prev, text: file.name.replace(/\.[^/.]+$/, ""), filename: file.name }));
                                  }
                                }
                              }}
                              style={{ display: "none" }}
                            />
                            <div
                              onClick={() => docFileInputRef.current?.click()}
                              style={{
                                border: "2px dashed #475569",
                                borderRadius: 10,
                                padding: "24px 16px",
                                textAlign: "center",
                                background: "#1e293b",
                                cursor: "pointer"
                              }}
                            >
                              <FaFilePdf size={32} color="#f59e0b" style={{ marginBottom: 8 }} />
                              <p style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>
                                {selectedDocFile ? selectedDocFile.name : "Click to select PDF or report file"}
                              </p>
                              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                                {selectedDocFile ? formatBytes(selectedDocFile.size) : "Standard official document"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginBottom: 14 }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                              Document Download or Google Drive URL *
                            </label>
                            <input
                              type="text"
                              value={docModalData.url}
                              onChange={(e) => setDocModalData({ ...docModalData, url: e.target.value })}
                              placeholder="https://drive.google.com/file/... or /uploads/..."
                              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.85rem" }}
                            />
                          </div>
                        )}

                        <div style={{ marginBottom: 14 }}>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: 4 }}>
                            Official Document Title *
                          </label>
                          <input
                            type="text"
                            value={docModalData.text}
                            onChange={(e) => setDocModalData({ ...docModalData, text: e.target.value })}
                            placeholder="e.g. Juvenile Justice Care and Protection Rules 2007"
                            required
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.85rem" }}
                          />
                        </div>

                        <div style={{ marginBottom: 18 }}>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "#cbd5e1", marginBottom: 4 }}>
                            File Size / Document Category
                          </label>
                          <input
                            type="text"
                            value={docModalData.fileSize}
                            onChange={(e) => setDocModalData({ ...docModalData, fileSize: e.target.value })}
                            placeholder="e.g. Official PDF [745 KB]"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#1e293b", border: "1px solid #475569", color: "#ffffff", fontSize: "0.85rem" }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => setShowAddDocModal(false)}
                            style={{ padding: "8px 14px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUploadingDoc}
                            style={{ padding: "8px 18px", borderRadius: 8, background: "#2563eb", color: "#ffffff", border: "none", fontWeight: 700, cursor: isUploadingDoc ? "not-allowed" : "pointer" }}
                          >
                            {isUploadingDoc ? "Uploading..." : editingDocIdx !== null ? "Save Document" : "Add Document"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 7. FULL IMAGE VIEWER MODAL */}
                {previewFullImg && (
                  <div
                    onClick={() => setPreviewFullImg(null)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 99999,
                      background: "rgba(0,0,0,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20,
                      cursor: "zoom-out"
                    }}
                  >
                    <img
                      src={previewFullImg}
                      alt="Full view"
                      style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain", borderRadius: 8 }}
                    />
                  </div>
                )}

              </div>
    </AdminLayout>
          );
}

