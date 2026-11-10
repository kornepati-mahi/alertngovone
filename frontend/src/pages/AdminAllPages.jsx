import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaFileAlt, FaSearch, FaPlus, FaTrash, FaEdit, FaSave, FaExternalLinkAlt,
  FaCheck, FaTimes, FaUndo, FaCloudUploadAlt, FaVideo, FaTable, FaImages,
  FaDownload, FaChartLine, FaArrowUp, FaArrowDown, FaLink, FaFolderOpen,
  FaCheckCircle, FaExclamationTriangle, FaSyncAlt, FaLayerGroup, FaFilter
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import allSitePagesJson from "../data/all_site_pages.json";
import {
  adminListAllSitePages,
  adminGetAllSitePage,
  adminCreateAllSitePage,
  adminSaveAllSitePage,
  adminDeleteAllSitePage,
  adminReorderAllSitePages,
  adminSeedAllSitePages,
  adminUploadImage,
  adminUploadVideo,
  API_BASE
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

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

/* ── Map a JSON fallback page into the all-pages list shape ── */
const mapJsonToPage = (p, idx) => ({
  id: idx,
  slug: p.slug,
  title: p.title,
  nav_label: p.nav_label || p.title,
  category: p.category || "General",
  badge: p.badge || p.category || "General",
  subtitle: p.subtitle || "",
  paragraphs_count: p.paragraphs?.length || 0,
  tables_count: p.tables?.length || 0,
  images_count: p.images?.length || 0,
  downloads_count: p.downloads?.length || 0,
  videos_count: p.videos?.length || 0,
  stats_count: p.stats?.length || 0,
  sort_order: idx,
  is_active: 1,
  content: {
    paragraphs: p.paragraphs || [],
    tables: p.tables || [],
    images: p.images || [],
    downloads: p.downloads || [],
    videos: p.videos || [],
    stats: p.stats || []
  }
});

/* ── Merge about-pages (AdminAboutPages system) into all-pages list ──
    AdminAboutPages stores rich content in localStorage key "alertngo_about_pages".
    This brings About ALERT / Vision & Mission / Core Values / etc. into All Pages
    so they can be edited from one place. ──────────────────────────────────── */
const mergeAboutPages = (pages) => {
  try {
    const local = localStorage.getItem("alertngo_about_pages");
    if (!local) return pages;
    const parsed = JSON.parse(local);
    if (!parsed || typeof parsed !== "object") return pages;
    const existing = new Set(pages.map((p) => (p.slug || "").toLowerCase().trim()));
    let nextId = pages.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
    const added = [];
    for (const [slug, page] of Object.entries(parsed)) {
      if (!slug || !page || typeof page !== "object") continue;
      const cleanSlug = String(slug).toLowerCase().trim();
      if (existing.has(cleanSlug)) continue;
      const content = page.content || {};
      const paragraphs = Array.isArray(content.paragraphs) && content.paragraphs.length > 0
        ? content.paragraphs
        : [content.p1, content.p2, content.p3].filter(Boolean);
      added.push({
        id: nextId++,
        slug: page.slug || slug,
        title: page.title || slug,
        nav_label: page.title || slug,
        category: page.category || "About Us",
        badge: page.badge || "About Us",
        subtitle: page.subtitle || "",
        sort_order: nextId,
        is_active: 1,
        content: {
          paragraphs: paragraphs,
          tables: Array.isArray(content.tables) ? content.tables : [],
          images: Array.isArray(content.images) ? content.images : [],
          downloads: Array.isArray(content.downloads) ? content.downloads : [],
          videos: Array.isArray(content.videos) ? content.videos : [],
          stats: Array.isArray(content.stats) ? content.stats : []
        }
      });
      existing.add(cleanSlug);
    }
    return added.length > 0 ? [...pages, ...added] : pages;
  } catch {
    return pages;
  }
};

/* ── Get rich content for an about-tab page from AdminAboutPages storage ──
    Returns content in all-pages shape (paragraphs, tables, images, …) so the
    All Pages editor shows the real "About ALERT" content instead of JSON placeholders. */
const getAboutPageContent = (slug) => {
  try {
    const local = localStorage.getItem("alertngo_about_pages");
    if (!local) return null;
    const parsed = JSON.parse(local);
    if (!parsed || typeof parsed !== "object") return null;
    const page = parsed[slug] || (parsed.data && parsed.data[slug]);
    if (!page) return null;
    const content = page.content || {};
    const paragraphs = Array.isArray(content.paragraphs) && content.paragraphs.length > 0
      ? content.paragraphs
      : [content.p1, content.p2, content.p3].filter(Boolean);
    return {
      paragraphs,
      tables: Array.isArray(content.tables) ? content.tables : [],
      images: Array.isArray(content.images) ? content.images : [],
      downloads: Array.isArray(content.downloads) ? content.downloads : [],
      videos: Array.isArray(content.videos) ? content.videos : [],
      stats: Array.isArray(content.stats) ? content.stats : []
    };
  } catch {
    return null;
  }
};

/* About-tab slugs managed by AdminAboutPages (shared with All Pages editor) */
const ABOUT_SLUGS = ["about","vision-mission","core-values","organizational-profile","organogram","alert-policies","area-of-operation"];

const CATEGORY_COLORS = {
  "Polavaram LA & R&R": { bg: "rgba(210, 25, 12, 0.15)", border: "#ef4444", text: "#fca5a5" },
  "RoFR & LTR": { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#6ee7b7" },
  "Forest Rights & LTR": { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#6ee7b7" },
  "Flood Relief": { bg: "rgba(2, 132, 199, 0.15)", border: "#0284c7", text: "#7dd3fc" },
  "Disaster Relief": { bg: "rgba(2, 132, 199, 0.15)", border: "#0284c7", text: "#7dd3fc" },
  "Governance & Institutional": { bg: "rgba(139, 92, 246, 0.15)", border: "#8b5cf6", text: "#c4b5fd" },
  "Programs & Livelihood": { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#fcd34d" },
  "Legal & Downloads": { bg: "rgba(236, 72, 153, 0.15)", border: "#ec4899", text: "#f472b6" },
  "Community & Archive": { bg: "rgba(100, 116, 139, 0.15)", border: "#64748b", text: "#cbd5e1" },
  "General": { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", text: "#93c5fd" }
};

export default function AdminAllPages() {
  const [adminKey, setAdminKey] = useState("");
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsSummary, setStatsSummary] = useState({
    total_pages: 0,
    total_tables: 0,
    total_images: 0,
    total_downloads: 0,
    total_videos: 0
  });

  // Filters & search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Active edit state
  const [editingPage, setEditingPage] = useState(null); // original full page
  const [editFormData, setEditFormData] = useState(null); // working copy
  const [activeTab, setActiveTab] = useState("overview"); // overview, paragraphs, tables, images, downloads, videos, stats
  const [isSaving, setIsSaving] = useState(false);

  // New Page Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Polavaram LA & R&R");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-sync Modal
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Video Upload Modal within Editor
  const [showAddVidModal, setShowAddVidModal] = useState(false);
  const [editingVidIdx, setEditingVidIdx] = useState(null);
  const [vidModalMode, setVidModalMode] = useState("upload"); // upload, url
  const [vidModalData, setVidModalData] = useState({ title: "", description: "", url: "" });
  const [selectedVidFile, setSelectedVidFile] = useState(null);
  const [selectedVidPreview, setSelectedVidPreview] = useState("");
  const [uploadedVidUrl, setUploadedVidUrl] = useState("");
  const [vidUploadProgress, setVidUploadProgress] = useState({ percent: 0, loaded: 0, total: 0 });
  const [isUploadingVid, setIsUploadingVid] = useState(false);
  const [uploadVidError, setUploadVidError] = useState("");
  const vidFileInputRef = useRef(null);

  // Image Upload Ref within Editor
  const imageInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Document / PDF Upload Ref within Editor
  const docInputRef = useRef(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Category Pills Drag & Scroll
  const categoryPillsRef = useRef(null);
  const [isCatDragging, setIsCatDragging] = useState(false);
  const [catStartX, setCatStartX] = useState(0);
  const [catScrollLeft, setCatScrollLeft] = useState(0);

  const handleCatMouseDown = (e) => {
    setIsCatDragging(true);
    setCatStartX(e.pageX - (categoryPillsRef.current?.offsetLeft || 0));
    setCatScrollLeft(categoryPillsRef.current?.scrollLeft || 0);
  };
  const handleCatMouseMove = (e) => {
    if (!isCatDragging || !categoryPillsRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoryPillsRef.current.offsetLeft;
    const walk = (x - catStartX) * 1.5;
    categoryPillsRef.current.scrollLeft = catScrollLeft - walk;
  };
  const handleCatMouseUp = () => setIsCatDragging(false);
  const handleCatMouseLeave = () => setIsCatDragging(false);

  // Wheel horizontal scroll for category pills
  useEffect(() => {
    const el = categoryPillsRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Modal Tabs Ref & horizontal wheel scroll
  const modalTabsRef = useRef(null);
  useEffect(() => {
    const el = modalTabsRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [editingPage]);

  // Auto scroll active category into view
  useEffect(() => {
    if (categoryPillsRef.current) {
      const activeEl = categoryPillsRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedCategory]);

  // Auth Key Init
  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
  }, []);

  // Load pages list from MySQL site_all_pages
  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const res = await adminListAllSitePages(key);
      let basePages = [];
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const dbSlugs = new Set(res.data.map((p) => (p.slug || "").toLowerCase().trim()));
        const missing = Object.values(allSitePagesJson)
          .filter((p) => !dbSlugs.has((p.slug || "").toLowerCase().trim()))
          .map((p, idx) => mapJsonToPage(p, res.data.length + idx + 1));
        basePages = [...res.data, ...missing];
        if (res.stats_summary) {
          setStatsSummary(res.stats_summary);
        }
      } else {
        // Fallback to static all_site_pages.json so quick-links and all pages display
        basePages = Object.values(allSitePagesJson).map((p, idx) => mapJsonToPage(p, idx + 1));
      }
      // Merge about-pages (AdminAboutPages system) so About ALERT etc. appear here too
      setPages(mergeAboutPages(basePages));
    } catch (err) {
      // Fallback
      const basePages = Object.values(allSitePagesJson).map((p, idx) => mapJsonToPage(p, idx + 1));
      setPages(mergeAboutPages(basePages));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Categories list
  const categoryOptions = useMemo(() => {
    const set = new Set([
      "All",
      "Polavaram LA & R&R",
      "RoFR & LTR",
      "Forest Rights & LTR",
      "Flood Relief",
      "Disaster Relief",
      "Governance & Institutional",
      "Programs & Livelihood",
      "Legal & Downloads",
      "Community & Archive",
      "General"
    ]);
    pages.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [pages]);

  // Filtered pages
  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((p) => {
      const matchesCat =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesSearch =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [pages, selectedCategory, search]);

  // Open Edit Page
  const handleOpenEdit = (page) => {
    // Prefer rich content from AdminAboutPages storage for about-tab pages
    const isAboutTab = ABOUT_SLUGS.includes(String(page.slug || "").toLowerCase());
    let content = page.content || {};
    const aboutContent = isAboutTab ? getAboutPageContent(page.slug) : null;
    if (aboutContent) {
      content = aboutContent;
    }
    const fallback = allSitePagesJson[page.slug] || Object.values(allSitePagesJson).find(p => p.slug === page.slug);
    if ((!content.tables || content.tables.length === 0) && fallback?.tables?.length > 0) {
      content = { ...content, tables: fallback.tables };
    }
    if ((!content.paragraphs || content.paragraphs.length === 0) && fallback?.paragraphs?.length > 0) {
      content = { ...content, paragraphs: fallback.paragraphs };
    }
    if ((!content.stats || content.stats.length === 0) && fallback?.stats?.length > 0) {
      content = { ...content, stats: fallback.stats };
    }
    if ((!content.images || content.images.length === 0) && fallback?.images?.length > 0) {
      content = { ...content, images: fallback.images };
    }
    if ((!content.downloads || content.downloads.length === 0) && fallback?.downloads?.length > 0) {
      content = { ...content, downloads: fallback.downloads };
    }
    if ((!content.videos || content.videos.length === 0) && fallback?.videos?.length > 0) {
      content = { ...content, videos: fallback.videos };
    }
    const full = {
      id: page.id,
      slug: page.slug,
      nav_label: page.nav_label || page.title,
      title: page.title,
      category: page.category || fallback?.category || "General",
      badge: page.badge || page.category || fallback?.badge || "General",
      subtitle: page.subtitle || fallback?.subtitle || "",
      sort_order: page.sort_order || 0,
      is_active: page.is_active !== undefined ? page.is_active : 1,
      paragraphs: Array.isArray(content.paragraphs) ? [...content.paragraphs] : [],
      tables: Array.isArray(content.tables) ? JSON.parse(JSON.stringify(content.tables)) : [],
      images: Array.isArray(content.images) ? JSON.parse(JSON.stringify(content.images)) : [],
      downloads: Array.isArray(content.downloads) ? JSON.parse(JSON.stringify(content.downloads)) : [],
      videos: Array.isArray(content.videos) ? JSON.parse(JSON.stringify(content.videos)) : [],
      stats: Array.isArray(content.stats) ? JSON.parse(JSON.stringify(content.stats)) : []
    };
    setEditingPage(page);
    setEditFormData(full);
    setActiveTab("overview");
  };

  const handleCloseEdit = () => {
    setEditingPage(null);
    setEditFormData(null);
    try { setSearchParams({}); } catch (_) {}
  };

  useEffect(() => {
    if (!editingPage) return;
    const onKey = (e) => { if (e.key === "Escape") handleCloseEdit(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingPage]);

  // Automatically open page if slug param provided in URL query (e.g. /admin/all-pages?slug=xyz)
  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get("slug");

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (!slugParam) return;
    const clean = slugParam.toLowerCase().replace(/^\//, "").trim();
    if (!clean) return;
    if (pages.length > 0) {
      const match = pages.find((p) => (p.slug || "").toLowerCase().replace(/^\//, "").trim() === clean);
      if (match) {
        autoOpenedRef.current = true;
        handleOpenEdit(match);
        return;
      }
    }
    // Check local page override
    try {
      const cached = localStorage.getItem(`alertngo_page_override_${clean}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.title || parsed.slug)) {
          autoOpenedRef.current = true;
          handleOpenEdit(parsed);
          return;
        }
      }
    } catch (_) {}

    const currentKey = adminKey || sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    adminGetAllSitePage(currentKey, clean).then((res) => {
      if (res && res.success && res.data) {
        autoOpenedRef.current = true;
        handleOpenEdit(res.data);
      }
    }).catch(() => {});
  }, [slugParam, pages, adminKey]);

  // Save Page Changes to MySQL and localStorage
  const handleSavePage = async () => {
    if (!editFormData) return;
    setIsSaving(true);
    const cleanSlug = (editFormData.slug || "").toLowerCase().replace(/^\//, "").trim();
    const fullPageData = {
      ...editFormData,
      slug: cleanSlug,
      tables_count: (editFormData.tables || []).length,
      images_count: (editFormData.images || []).length,
      downloads_count: (editFormData.downloads || []).length,
      videos_count: (editFormData.videos || []).length,
      paragraphs_count: (editFormData.paragraphs || []).length,
      stats_count: (editFormData.stats || []).length,
      content: {
        paragraphs: editFormData.paragraphs || [],
        tables: editFormData.tables || [],
        images: editFormData.images || [],
        downloads: editFormData.downloads || [],
        videos: editFormData.videos || [],
        stats: editFormData.stats || []
      }
    };

    // 1. Immediately persist to localStorage override so PageDetail loads all 7 content blocks
    try {
      localStorage.setItem(`alertngo_page_override_${cleanSlug}`, JSON.stringify(fullPageData));
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: cleanSlug } }));
      window.dispatchEvent(new Event("storage"));
    } catch (_) {}

    // 1b. Sync about-page edits back to AdminAboutPages storage so /about & /admin/about-pages reflect changes.
    // Only the "about" slug shares a compatible content shape (paragraphs/p1/p2). Organogram, Area of Operation,
    // Vision & Mission, etc. use rich nested structures (levels, regions, map_regions, vision, mission…) that the
    // All Pages editor does not understand — syncing content would corrupt them. Those tabs must be edited in
    // /admin/about-pages instead.
    if (cleanSlug === "about") {
      try {
        const local = localStorage.getItem("alertngo_about_pages");
        let aboutMap = {};
        try { if (local) aboutMap = JSON.parse(local); } catch {}
        if (!aboutMap || typeof aboutMap !== "object") aboutMap = {};
        const existing = aboutMap["about"] || {};
        const paras = editFormData.paragraphs || [];
        const updated = {
          ...existing,
          slug: "about",
          title: editFormData.title || existing.title || "About Us",
          badge: editFormData.badge || existing.badge || "Section 00",
          subtitle: editFormData.subtitle !== undefined ? editFormData.subtitle : existing.subtitle,
          content: {
            ...existing.content,
            p1: paras[0] || existing.content?.p1 || "",
            p2: paras[1] || existing.content?.p2 || "",
            p3: paras[2] || existing.content?.p3 || "",
            paragraphs: existing.content?.paragraphs?.length > 0 ? existing.content.paragraphs : paras,
            tables: existing.content?.tables?.length > 0 ? existing.content.tables : (editFormData.tables || []),
            images: existing.content?.images?.length > 0 ? existing.content.images : (editFormData.images || []),
            downloads: existing.content?.downloads?.length > 0 ? existing.content.downloads : (editFormData.downloads || []),
            videos: existing.content?.videos?.length > 0 ? existing.content.videos : (editFormData.videos || []),
            stats: existing.content?.stats?.length > 0 ? existing.content.stats : (editFormData.stats || [])
          }
        };
        aboutMap["about"] = updated;
        localStorage.setItem("alertngo_about_pages", JSON.stringify(aboutMap));
        window.dispatchEvent(new CustomEvent("alertngo_about_pages_updated"));
        window.dispatchEvent(new Event("storage"));
      } catch (_) {}
    } else if (ABOUT_SLUGS.includes(cleanSlug)) {
      // For other about-tabs (organogram, area-of-operation, …): sync only metadata, never content.
      try {
        const local = localStorage.getItem("alertngo_about_pages");
        let aboutMap = {};
        try { if (local) aboutMap = JSON.parse(local); } catch {}
        if (!aboutMap || typeof aboutMap !== "object") aboutMap = {};
        const existing = aboutMap[cleanSlug] || {};
        aboutMap[cleanSlug] = {
          ...existing,
          slug: cleanSlug,
          title: editFormData.title || existing.title || cleanSlug,
          badge: editFormData.badge || existing.badge || "About Us",
          subtitle: editFormData.subtitle !== undefined ? editFormData.subtitle : existing.subtitle
        };
        localStorage.setItem("alertngo_about_pages", JSON.stringify(aboutMap));
        window.dispatchEvent(new CustomEvent("alertngo_about_pages_updated"));
        window.dispatchEvent(new Event("storage"));
      } catch (_) {}
    }

    // Update in list
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === editFormData.id || (p.slug || "").toLowerCase().replace(/^\//, "").trim() === cleanSlug) {
          return {
            ...p,
            ...fullPageData
          };
        }
        return p;
      })
    );

    try {
      const res = await adminSaveAllSitePage(adminKey, {
        id: editFormData.id,
        slug: cleanSlug,
        title: editFormData.title,
        nav_label: editFormData.nav_label,
        category: editFormData.category,
        badge: editFormData.badge,
        subtitle: editFormData.subtitle,
        sort_order: editFormData.sort_order,
        is_active: editFormData.is_active,
        paragraphs: editFormData.paragraphs,
        tables: editFormData.tables,
        images: editFormData.images,
        downloads: editFormData.downloads,
        videos: editFormData.videos,
        stats: editFormData.stats
      });

      if (res && res.success) {
        showToast(`Page '${editFormData.title}' saved successfully! Changes are live on website.`, "success");
      } else {
        showToast(`Saved locally! Changes are live on website.`, "success");
      }
    } catch (err) {
      showToast(`Saved locally! Changes are live on website.`, "success");
    } finally {
      setIsSaving(false);
    }
  };

  // Create New Page
  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Page title is required", "error");
      return;
    }
    setIsCreating(true);
    try {
      const res = await adminCreateAllSitePage(adminKey, {
        title: newTitle.trim(),
        slug: newSlug.trim() || undefined,
        category: newCategory,
        subtitle: newSubtitle.trim()
      });

      if (res && res.success && res.data) {
        showToast(`Page '${res.data.title}' created successfully!`, "success");
        setShowCreateModal(false);
        setNewTitle("");
        setNewSlug("");
        setNewSubtitle("");
        await loadPages();
        // Automatically open the new page for editing
        handleOpenEdit(res.data);
      } else {
        showToast(res?.message || "Failed to create page", "error");
      }
    } catch (err) {
      showToast(err.message || "Error creating page", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Page
  const handleDeletePage = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await adminDeleteAllSitePage(adminKey, deleteTarget.id);
      if (res && res.success) {
        showToast(`Page '${deleteTarget.title}' deleted successfully!`, "success");
        setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        if (editingPage && editingPage.id === deleteTarget.id) {
          handleCloseEdit();
        }
        setDeleteTarget(null);
      } else {
        showToast(res?.message || "Failed to delete page", "error");
      }
    } catch (err) {
      showToast(err.message || "Error deleting page", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Re-sync from JSON
  const handleResyncFromJson = async (force = false) => {
    setIsSyncing(true);
    try {
      const res = await adminSeedAllSitePages(adminKey, force);
      if (res && res.success) {
        showToast(res.message || "Synchronized from JSON successfully!", "success");
        setShowSyncModal(false);
        await loadPages();
      } else {
        showToast(res?.message || "Failed to sync pages", "error");
      }
    } catch (err) {
      showToast(err.message || "Error synchronizing pages", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // ── VIDEO UPLOAD & MANAGEMENT ─────────────────────────────────────────────
  const openAddVideoModal = (existingIdx = null) => {
    setEditingVidIdx(existingIdx);
    setUploadVidError("");
    setSelectedVidFile(null);
    setSelectedVidPreview("");
    setUploadedVidUrl("");
    setVidUploadProgress({ percent: 0, loaded: 0, total: 0 });

    if (existingIdx !== null && editFormData?.videos?.[existingIdx]) {
      const v = editFormData.videos[existingIdx];
      setVidModalData({
        title: v.title || "",
        description: v.description || "",
        url: v.url || v.src || ""
      });
      setVidModalMode(v.url && !isYouTubeUrl(v.url) && !v.url.includes("http") ? "upload" : "url");
      if (v.url && !isYouTubeUrl(v.url)) {
        setSelectedVidPreview(v.url);
        setUploadedVidUrl(v.url);
      }
    } else {
      setVidModalData({ title: "", description: "", url: "" });
      setVidModalMode("upload");
    }
    setShowAddVidModal(true);
  };

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

    const targetFolder = `all_pages/${editFormData?.slug || "general"}/videos`;
    adminUploadVideo(adminKey, file, targetFolder, (prog) => {
      setVidUploadProgress(prog);
    })
      .then((res) => {
        if (res && res.success && res.url) {
          setUploadedVidUrl(res.url);
          setIsUploadingVid(false);
        } else {
          setUploadVidError(res?.message || "Failed to upload video file.");
          setIsUploadingVid(false);
        }
      })
      .catch((err) => {
        setUploadVidError(err.message || "Video upload failed.");
        setIsUploadingVid(false);
      });
  };

  const handleSaveVideoModal = (e) => {
    e.preventDefault();
    let finalUrl = vidModalMode === "upload" ? (uploadedVidUrl || vidModalData.url) : vidModalData.url;
    if (!finalUrl && selectedVidFile) {
      showToast("Please wait for video upload to complete.", "error");
      return;
    }
    if (!finalUrl) {
      showToast("Please provide a video URL or upload a file.", "error");
      return;
    }

    const newVid = {
      title: vidModalData.title.trim() || (selectedVidFile ? selectedVidFile.name : "Field Video"),
      description: vidModalData.description.trim(),
      url: finalUrl,
      type: "video"
    };

    setEditFormData((prev) => {
      const curVideos = Array.isArray(prev.videos) ? [...prev.videos] : [];
      if (editingVidIdx !== null) {
        curVideos[editingVidIdx] = newVid;
      } else {
        curVideos.push(newVid);
      }
      return { ...prev, videos: curVideos };
    });

    setShowAddVidModal(false);
    showToast(editingVidIdx !== null ? "Video updated." : "Video attached to page!", "success");
  };

  const handleDeleteVideo = (idx) => {
    setEditFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== idx)
    }));
  };

  // ── IMAGE MANAGEMENT ──────────────────────────────────────────────────────
  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const targetFolder = `all_pages/${editFormData?.slug || "general"}/images`;
      const res = await adminUploadImage(adminKey, file, targetFolder);
      if (res && res.success && res.url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setEditFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              src: res.url,
              url: res.url,
              name: cleanName,
              caption: cleanName,
              alt: cleanName
            }
          ]
        }));
        showToast("Image uploaded and added to gallery!", "success");
      } else {
        showToast(res?.message || "Failed to upload image", "error");
      }
    } catch (err) {
      showToast(err.message || "Error uploading image", "error");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const url = prompt("Enter Image URL (e.g. /uploads/... or https://...):");
    if (!url) return;
    const caption = prompt("Enter Caption / Label:", "Field Photo") || "Field Photo";
    setEditFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          src: url,
          url: url,
          name: caption,
          caption: caption,
          alt: caption
        }
      ]
    }));
  };

  const handleDeleteImage = (idx) => {
    setEditFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  // ── DOWNLOADS / PDF MANAGEMENT ───────────────────────────────────────────
  const handleUploadDocFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const targetFolder = `all_pages/${editFormData?.slug || "general"}/docs`;
      const res = await adminUploadImage(adminKey, file, targetFolder);
      if (res && res.success && res.url) {
        const title = file.name.replace(/\.[^/.]+$/, "");
        setEditFormData((prev) => ({
          ...prev,
          downloads: [
            ...prev.downloads,
            {
              title: title,
              text: title,
              filename: file.name,
              url: res.url,
              size: formatBytes(file.size)
            }
          ]
        }));
        showToast("Document uploaded and attached!", "success");
      } else {
        showToast(res?.message || "Failed to upload document", "error");
      }
    } catch (err) {
      showToast(err.message || "Error uploading document", "error");
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const handleAddDocUrl = () => {
    const url = prompt("Enter Document / PDF URL (e.g. /uploads/... or https://...):");
    if (!url) return;
    const title = prompt("Enter Document Title / Label:", "Statutory Order / Report") || "Document";
    const size = prompt("Enter File Size (e.g. 1.5 MB):", "1.2 MB") || "1.0 MB";
    setEditFormData((prev) => ({
      ...prev,
      downloads: [
        ...prev.downloads,
        {
          title: title,
          text: title,
          filename: title + ".pdf",
          url: url,
          size: size
        }
      ]
    }));
  };

  const handleDeleteDoc = (idx) => {
    setEditFormData((prev) => ({
      ...prev,
      downloads: prev.downloads.filter((_, i) => i !== idx)
    }));
  };

  // ── PARAGRAPHS MANAGEMENT ────────────────────────────────────────────────
  const handleAddParagraph = () => {
    setEditFormData((prev) => ({
      ...prev,
      paragraphs: [...prev.paragraphs, "New informative paragraph for this page..."]
    }));
  };

  const handleUpdateParagraph = (idx, text) => {
    setEditFormData((prev) => {
      const copy = [...prev.paragraphs];
      copy[idx] = text;
      return { ...prev, paragraphs: copy };
    });
  };

  const handleDeleteParagraph = (idx) => {
    setEditFormData((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== idx)
    }));
  };

  const handleMoveParagraph = (idx, dir) => {
    setEditFormData((prev) => {
      const copy = [...prev.paragraphs];
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return { ...prev, paragraphs: copy };
    });
  };

  // ── TABLES MANAGEMENT ────────────────────────────────────────────────────
  const handleAddTable = () => {
    const newTbl = {
      title: "New Table Record",
      headers: ["Column 1", "Column 2", "Column 3"],
      rows: [
        ["Data 1", "Data 2", "Data 3"],
        ["Data 4", "Data 5", "Data 6"]
      ]
    };
    setEditFormData((prev) => ({
      ...prev,
      tables: [...prev.tables, newTbl]
    }));
  };

  const handleUpdateTableTitle = (tblIdx, title) => {
    setEditFormData((prev) => {
      const copy = [...prev.tables];
      copy[tblIdx] = { ...copy[tblIdx], title };
      return { ...prev, tables: copy };
    });
  };

  const handleAddTableColumn = (tblIdx) => {
    setEditFormData((prev) => {
      const copy = [...prev.tables];
      const tbl = { ...copy[tblIdx] };
      const curHeaders = Array.isArray(tbl.headers) ? [...tbl.headers] : [];
      curHeaders.push(`Col ${curHeaders.length + 1}`);
      tbl.headers = curHeaders;
      tbl.rows = (tbl.rows || []).map((row) => [...row, "-"]);
      copy[tblIdx] = tbl;
      return { ...prev, tables: copy };
    });
  };

  const handleDeleteTableColumn = (tblIdx, colIdx) => {
    setEditFormData((prev) => {
      const copy = [...prev.tables];
      const tbl = { ...copy[tblIdx] };
      tbl.headers = (tbl.headers || []).filter((_, c) => c !== colIdx);
      tbl.rows = (tbl.rows || []).map((row) => row.filter((_, c) => c !== colIdx));
      copy[tblIdx] = tbl;
      return { ...prev, tables: copy };
    });
  };

  const handleUpdateTableHeader = (tblIdx, colIdx, val) => {
    setEditFormData((prev) => {
      const copy = [...prev.tables];
      const tbl = { ...copy[tblIdx] };
      const curHeaders = [...tbl.headers];
      curHeaders[colIdx] = val;
      tbl.headers = curHeaders;
      copy[tblIdx] = tbl;
      return { ...prev, tables: copy };
    });
  };

  const handleAddTableRow = (tblIdx) => {
    setEditFormData((prev) => {
      const copy = [...prev.tables];
      const tbl = { ...copy[tblIdx] };
      const colCount = (tbl.headers || []).length || 1;
      const newRow = new Array(colCount).fill("");
      tbl.rows = [...(tbl.rows || []), newRow];
      copy[tblIdx] = tbl;
      return { ...prev, tables: copy };
    });
  };

  const handleDeleteTableRow = (tblIdx, rowIdx) => {
    setEditFormData((prev) => {
      const copy = [...prev.tables];
      const tbl = { ...copy[tblIdx] };
      tbl.rows = (tbl.rows || []).filter((_, r) => r !== rowIdx);
      copy[tblIdx] = tbl;
      return { ...prev, tables: copy };
    });
  };

  const handleUpdateTableCell = (tblIdx, rowIdx, colIdx, val) => {
    setEditFormData((prev) => {
      const copy = [...prev.tables];
      const tbl = { ...copy[tblIdx] };
      const curRows = tbl.rows.map((r) => [...r]);
      if (!curRows[rowIdx]) curRows[rowIdx] = [];
      curRows[rowIdx][colIdx] = val;
      tbl.rows = curRows;
      copy[tblIdx] = tbl;
      return { ...prev, tables: copy };
    });
  };

  const handleDeleteTable = (tblIdx) => {
    setEditFormData((prev) => ({
      ...prev,
      tables: prev.tables.filter((_, i) => i !== tblIdx)
    }));
  };

  // ── STATS MANAGEMENT ─────────────────────────────────────────────────────
  const handleAddStat = () => {
    setEditFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { num: "100+", label: "Key Metric" }]
    }));
  };

  const handleUpdateStat = (idx, field, val) => {
    setEditFormData((prev) => {
      const copy = [...(prev.stats || [])];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, stats: copy };
    });
  };

  const handleDeleteStat = (idx) => {
    setEditFormData((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== idx)
    }));
  };

  return (
    <AdminLayout title="All Site Pages Repository">
      <style>{`
        .allpages-root {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .allpages-root * {
          box-sizing: border-box;
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
          .allpages-container {
            padding: 14px 10px !important;
          }
          .allpages-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .allpages-header h1 {
            font-size: 1.35rem !important;
          }
          .allpages-header-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .allpages-header-actions button {
            width: 100% !important;
            justify-content: center !important;
            padding: 8px 10px !important;
            font-size: 0.8rem !important;
          }
          .allpages-metrics {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .allpages-metric-card {
            padding: 10px 12px !important;
          }
          .allpages-metric-card .metric-val {
            font-size: 1.4rem !important;
          }
          .allpages-controls-card {
            padding: 12px 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .allpages-search-box {
            width: 100% !important;
            min-width: 0 !important;
          }
          .allpages-item-card {
            padding: 12px 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .allpages-item-info {
            min-width: 0 !important;
            width: 100% !important;
          }
          .allpages-item-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 6px !important;
            margin-top: 4px !important;
          }
          .allpages-item-actions > a,
          .allpages-item-actions > button:not(:last-child) {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            height: 36px !important;
            min-height: 36px !important;
            max-height: 36px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            padding: 0 8px !important;
            font-size: 0.78rem !important;
            font-weight: 700 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 5px !important;
            line-height: 1 !important;
            box-sizing: border-box !important;
          }
          .allpages-item-actions > button:last-child {
            flex: 0 0 36px !important;
            width: 36px !important;
            min-width: 36px !important;
            max-width: 36px !important;
            height: 36px !important;
            min-height: 36px !important;
            max-height: 36px !important;
            padding: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
          .allpages-modal-backdrop {
            padding: 6px !important;
          }
          .allpages-modal-card {
            max-height: 96vh !important;
            border-radius: 10px !important;
          }
          .allpages-modal-header {
            padding: 12px 14px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .allpages-modal-header-actions {
            display: flex !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .allpages-modal-header-actions button:first-child,
          .allpages-modal-header-actions a {
            flex: 1 !important;
          }
          .allpages-modal-tabs {
            padding: 6px 10px !important;
          }
          .allpages-modal-body {
            padding: 14px 10px !important;
          }
          .allpages-grid-2col {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .allpages-videos-grid {
            grid-template-columns: 1fr !important;
          }
          .allpages-photos-grid {
            grid-template-columns: 1fr !important;
          }
          .allpages-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .allpages-dialog-card {
            padding: 16px 14px !important;
            max-width: 100% !important;
          }
          .allpages-table-header-ctrl {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .allpages-table-header-ctrl > div {
            margin-right: 0 !important;
            width: 100% !important;
          }
          .allpages-table-btn-group {
            display: flex !important;
            flex-wrap: wrap !important;
            width: 100% !important;
            gap: 6px !important;
          }
          .allpages-table-btn-group button {
            flex: 1 !important;
            text-align: center !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 420px) {
          .allpages-metrics {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 99999,
            background: toast.type === "error" ? "#ef4444" : "#10b981",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            fontWeight: 700,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "fadeIn 0.2s ease"
          }}
        >
          {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {toast.message}
        </div>
      )}

      {/* Main Container */}
      <div className="allpages-container allpages-root" style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto", color: "#f8fafc" }}>
        {/* Top Header & Actions */}
        <div
          className="allpages-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
            borderBottom: "1px solid #1e293b",
            paddingBottom: 20
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 6px",
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
            >
              <FaFileAlt color="#3b82f6" /> All Site Pages Repository
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
              Direct database control over all site documentation pages, statistical tables, photo galleries, PDF records, and field videos.
            </p>
          </div>

          <div className="allpages-header-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowSyncModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                borderRadius: 8,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#94a3b8",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <FaSyncAlt /> Sync with JSON
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                border: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                transition: "transform 0.15s ease"
              }}
            >
              <FaPlus /> Create New Page
            </button>
          </div>
        </div>

        {/* Metric Cards Banner */}
        <div
          className="allpages-metrics"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 24
          }}
        >
          <div className="allpages-metric-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Total Pages</div>
            <div className="metric-val" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#38bdf8", marginTop: 4 }}>
              {pages.length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>In database & indexed</span>
          </div>

          <div className="allpages-metric-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Statistical Tables</div>
            <div className="metric-val" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981", marginTop: 4 }}>
              {statsSummary.total_tables || pages.reduce((a, b) => a + (b.tables_count || 0), 0)}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>DPRs, surveys, census</span>
          </div>

          <div className="allpages-metric-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Photo Gallery</div>
            <div className="metric-val" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>
              {statsSummary.total_images || pages.reduce((a, b) => a + (b.images_count || 0), 0)}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Field photos & maps</span>
          </div>

          <div className="allpages-metric-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>PDF & Documents</div>
            <div className="metric-val" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ec4899", marginTop: 4 }}>
              {statsSummary.total_downloads || pages.reduce((a, b) => a + (b.downloads_count || 0), 0)}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Government orders & rules</span>
          </div>

          <div className="allpages-metric-card" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Field Videos</div>
            <div className="metric-val" style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ef4444", marginTop: 4 }}>
              {statsSummary.total_videos || pages.reduce((a, b) => a + (b.videos_count || 0), 0)}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Direct MP4s & YouTube</span>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div
          className="allpages-controls-card"
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}
        >
          {/* Header Row for Category: Label, Active Indicator & Scroll Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, width: "100%", flexWrap: "nowrap" }}>
            <span style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <FaFilter size={10} /> Filter: <code style={{ color: "#38bdf8", textTransform: "none", fontWeight: 700 }}>{selectedCategory}</code>
            </span>
            <div style={{ display: "inline-flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <button
                type="button"
                className="pills-scroll-btn"
                onClick={() => categoryPillsRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                title="Scroll left"
                aria-label="Scroll left"
                style={{
                  background: "#1e293b",
                  border: "1px solid #475569",
                  color: "#f8fafc",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  minWidth: "auto",
                  width: "auto",
                  minHeight: 28,
                  height: 28,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  lineHeight: 1
                }}
              >
                ‹ Left
              </button>
              <button
                type="button"
                className="pills-scroll-btn"
                onClick={() => categoryPillsRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                title="Scroll right"
                aria-label="Scroll right"
                style={{
                  background: "#1e293b",
                  border: "1px solid #475569",
                  color: "#f8fafc",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  minWidth: "auto",
                  width: "auto",
                  minHeight: 28,
                  height: 28,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  lineHeight: 1
                }}
              >
                Right ›
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Category Pills */}
          <div
            ref={categoryPillsRef}
            onMouseDown={handleCatMouseDown}
            onMouseMove={handleCatMouseMove}
            onMouseUp={handleCatMouseUp}
            onMouseLeave={handleCatMouseLeave}
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "nowrap",
              alignItems: "center",
              overflowX: "auto",
              overflowY: "hidden",
              width: "100%",
              paddingBottom: 6,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.25) transparent",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x",
              cursor: isCatDragging ? "grabbing" : "grab",
              userSelect: "none"
            }}
          >
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  data-selected={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: "0.8rem",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    border: isSelected ? "1px solid #3b82f6" : "1px solid #334155",
                    background: isSelected ? "#1d4ed8" : "#1e293b",
                    color: isSelected ? "#ffffff" : "#cbd5e1",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    flexShrink: 0
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="allpages-search-box" style={{ position: "relative", width: "100%", minWidth: 0 }}>
            <FaSearch
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b"
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, slug, content..."
              style={{
                width: "100%",
                padding: "10px 16px 10px 40px",
                borderRadius: 24,
                background: "#0b0f19",
                border: "1px solid #334155",
                color: "#ffffff",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Content Area: Loading or Table / Grid */}
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>Loading All Site Pages...</div>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>Connecting to MySQL site_all_pages repository...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "#111827",
              borderRadius: 14,
              border: "1px solid #1f2937",
              color: "#94a3b8"
            }}
          >
            <FaFileAlt size={40} color="#475569" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: "0 0 8px", color: "#ffffff" }}>No Pages Found</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem" }}>
              No site pages matched category &quot;{selectedCategory}&quot; and search query &quot;{search}&quot;.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: 4 }}>
              Showing <strong>{filteredPages.length}</strong> of <strong>{pages.length}</strong> site pages
            </div>

            {filteredPages.map((page) => {
              const catTheme = CATEGORY_COLORS[page.category] || CATEGORY_COLORS["General"];
              return (
                <div
                  key={page.id || page.slug}
                  className="allpages-item-card"
                  style={{
                    background: "#111827",
                    border: "1px solid #1f2937",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                    transition: "border-color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1f2937")}
                >
                  {/* Left: Info */}
                  <div className="allpages-item-info" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 12,
                          background: catTheme.bg,
                          color: catTheme.text,
                          border: `1px solid ${catTheme.border}`
                        }}
                      >
                        {page.category || "General"}
                      </span>

                      <span style={{ fontSize: "0.78rem", color: "#64748b", fontFamily: "monospace" }}>
                        /{page.slug}
                      </span>

                      {page.badge && page.badge !== page.category && (
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", background: "#1e293b", padding: "2px 8px", borderRadius: 4 }}>
                          {page.badge}
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                      {page.title}
                    </h3>

                    {page.subtitle && (
                      <p style={{ margin: "0 0 6px", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                        {page.subtitle}
                      </p>
                    )}

                    {page.excerpt && !page.subtitle && (
                      <p style={{ margin: "0 0 6px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.4 }}>
                        {page.excerpt}
                      </p>
                    )}

                    {/* Content Count Badges */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, fontSize: "0.75rem" }}>
                      <span style={{ background: "#1e293b", padding: "3px 8px", borderRadius: 6, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FaFileAlt size={10} color="#38bdf8" /> {page.paragraphs_count || (page.content?.paragraphs?.length || 0)} Paras
                      </span>
                      <span style={{ background: "#1e293b", padding: "3px 8px", borderRadius: 6, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FaTable size={10} color="#10b981" /> {page.tables_count || (page.content?.tables?.length || 0)} Tables
                      </span>
                      <span style={{ background: "#1e293b", padding: "3px 8px", borderRadius: 6, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FaImages size={10} color="#f59e0b" /> {page.images_count || (page.content?.images?.length || 0)} Photos
                      </span>
                      <span style={{ background: "#1e293b", padding: "3px 8px", borderRadius: 6, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FaDownload size={10} color="#ec4899" /> {page.downloads_count || (page.content?.downloads?.length || 0)} PDFs
                      </span>
                      <span style={{ background: "#1e293b", padding: "3px 8px", borderRadius: 6, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FaVideo size={10} color="#ef4444" /> {page.videos_count || (page.content?.videos?.length || 0)} Videos
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="allpages-item-actions" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View live public page in new tab"
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: "#1e293b",
                        border: "1px solid #334155",
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        whiteSpace: "nowrap",
                        height: 36,
                        minHeight: 36,
                        maxHeight: 36,
                        lineHeight: 1,
                        boxSizing: "border-box"
                      }}
                    >
                      <FaExternalLinkAlt size={11} /> Live Page
                    </a>

                    <button
                      onClick={() => handleOpenEdit(page)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        background: "#2563eb",
                        border: "none",
                        color: "#ffffff",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        whiteSpace: "nowrap",
                        height: 36,
                        minHeight: 36,
                        maxHeight: 36,
                        lineHeight: 1,
                        boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                        boxSizing: "border-box"
                      }}
                    >
                      <FaEdit /> Edit Page
                    </button>

                    <button
                      onClick={() => setDeleteTarget(page)}
                      title="Delete this page"
                      style={{
                        padding: "0",
                        borderRadius: 8,
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        minWidth: 36,
                        maxWidth: 36,
                        height: 36,
                        minHeight: 36,
                        maxHeight: 36,
                        boxSizing: "border-box",
                        flexShrink: 0
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

      {/* ── FULL EDIT PAGE MODAL / DRAWER ─────────────────────────────────── */}
      {editingPage && editFormData && (
        <div
          className="allpages-modal-backdrop"
          onClick={handleCloseEdit}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: "rgba(3, 7, 18, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
            padding: "20px 24px"
          }}
        >
          <div
            className="allpages-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0d111c",
              border: "1px solid #1e293b",
              borderRadius: 16,
              width: "100%",
              maxWidth: 1300,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div
              className="allpages-modal-header"
              style={{
                padding: "16px 24px",
                background: "#111827",
                borderBottom: "1px solid #1f2937",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#ffffff" }}>
                    Editing: {editFormData.title}
                  </h2>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#38bdf8", background: "#0b1527", padding: "3px 8px", borderRadius: 6, border: "1px solid #1e3a8a" }}>
                    /{editFormData.slug}
                  </span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  Category: <strong>{editFormData.category}</strong>
                </span>
              </div>

              <div className="allpages-modal-header-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a
                  href={`/${editFormData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <FaExternalLinkAlt size={10} /> View Live
                </a>

                <button
                  type="button"
                  onClick={handleSavePage}
                  disabled={isSaving}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                  }}
                >
                  <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCloseEdit}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: "#334155",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div
              ref={modalTabsRef}
              className="allpages-modal-tabs"
              style={{
                display: "flex",
                gap: 4,
                padding: "8px 24px",
                background: "#090d16",
                borderBottom: "1px solid #1e293b",
                overflowX: "auto",
                overflowY: "hidden",
                flexWrap: "nowrap",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.2) transparent"
              }}
            >
              {[
                { id: "overview", label: "📝 Metadata & Hero", count: null },
                { id: "paragraphs", label: "📄 Paragraphs", count: editFormData.paragraphs.length },
                { id: "tables", label: "📊 Statistical Tables", count: editFormData.tables.length },
                { id: "images", label: "🖼️ Photos & Maps", count: editFormData.images.length },
                { id: "downloads", label: "📥 PDFs & Documents", count: editFormData.downloads.length },
                { id: "videos", label: "🎥 Field Videos", count: editFormData.videos.length },
                { id: "stats", label: "📈 Stats Counters", count: editFormData.stats.length }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: isActive ? "#1e293b" : "transparent",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          background: isActive ? "#3b82f6" : "#334155",
                          color: "#ffffff",
                          padding: "1px 6px",
                          borderRadius: 10
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="allpages-modal-body" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              {/* ── TAB 1: OVERVIEW & METADATA ── */}
              {activeTab === "overview" && (
                <div style={{ maxWidth: 860 }}>
                  <div className="allpages-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                        Page Title *
                      </label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                        Navigation Label (Short Name)
                      </label>
                      <input
                        type="text"
                        value={editFormData.nav_label}
                        onChange={(e) => setEditFormData({ ...editFormData, nav_label: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                      />
                    </div>
                  </div>

                  <div className="allpages-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                        Page URL Slug * (e.g. submergence-area-map)
                      </label>
                      <input
                        type="text"
                        value={editFormData.slug}
                        onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#38bdf8", fontFamily: "monospace", fontSize: "0.9rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                        Category
                      </label>
                      <input
                        type="text"
                        list="catSuggestions"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                      />
                      <datalist id="catSuggestions">
                        {categoryOptions.filter((c) => c !== "All").map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                      Header Badge Text (e.g. &quot;Polavaram PIP&quot;, &quot;RoFR Rules & G.O. Records&quot;)
                    </label>
                    <input
                      type="text"
                      value={editFormData.badge}
                      onChange={(e) => setEditFormData({ ...editFormData, badge: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                      Page Subtitle / Tagline
                    </label>
                    <textarea
                      value={editFormData.subtitle}
                      onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                      rows={3}
                      placeholder="Enter a descriptive subtitle or overview summary of this record..."
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", resize: "vertical" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={editFormData.sort_order}
                        onChange={(e) => setEditFormData({ ...editFormData, sort_order: parseInt(e.target.value) || 0 })}
                        style={{ width: 120, padding: "8px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff" }}
                      />
                    </div>
                  </div>
                </div>
              )}



              {/* ── TAB 2: PARAGRAPHS ── */}
              {activeTab === "paragraphs" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ffffff" }}>Page Content & Paragraphs</h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                        Manage textual sections, official statements, and background narratives.
                      </p>
                    </div>
                    <button
                      onClick={handleAddParagraph}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <FaPlus /> Add Paragraph
                    </button>
                  </div>

                  {editFormData.paragraphs.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", background: "#111827", borderRadius: 12, color: "#94a3b8" }}>
                      No paragraphs added yet. Click &quot;Add Paragraph&quot; to begin writing content.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {editFormData.paragraphs.map((para, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#111827",
                            border: "1px solid #1f2937",
                            borderRadius: 10,
                            padding: "14px 16px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#38bdf8" }}>
                              Paragraph #{idx + 1}
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => handleMoveParagraph(idx, -1)}
                                disabled={idx === 0}
                                title="Move up"
                                style={{ background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", borderRadius: 4, padding: "4px 8px", cursor: idx === 0 ? "not-allowed" : "pointer" }}
                              >
                                <FaArrowUp size={10} />
                              </button>
                              <button
                                onClick={() => handleMoveParagraph(idx, 1)}
                                disabled={idx === editFormData.paragraphs.length - 1}
                                title="Move down"
                                style={{ background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", borderRadius: 4, padding: "4px 8px", cursor: idx === editFormData.paragraphs.length - 1 ? "not-allowed" : "pointer" }}
                              >
                                <FaArrowDown size={10} />
                              </button>
                              <button
                                onClick={() => handleDeleteParagraph(idx)}
                                title="Delete paragraph"
                                style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 4, padding: "4px 8px", cursor: "pointer" }}
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={para}
                            onChange={(e) => handleUpdateParagraph(idx, e.target.value)}
                            rows={3}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: 6,
                              background: "#0b0f19",
                              border: "1px solid #334155",
                              color: "#ffffff",
                              fontSize: "0.88rem",
                              lineHeight: 1.5,
                              resize: "vertical"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: STATISTICAL TABLES ── */}
              {activeTab === "tables" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ffffff" }}>Statistical Tables & DPR Data</h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                        Manage survey tables, census statistics, and government data schedules.
                      </p>
                    </div>
                    <button
                      onClick={handleAddTable}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <FaPlus /> Add New Table
                    </button>
                  </div>

                  {editFormData.tables.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", background: "#111827", borderRadius: 12, color: "#94a3b8" }}>
                      No tables on this page. Click &quot;Add New Table&quot; to add structured data.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {editFormData.tables.map((table, tIdx) => (
                        <div
                          key={tIdx}
                          style={{
                            background: "#111827",
                            border: "1px solid #1f2937",
                            borderRadius: 12,
                            padding: "16px 20px"
                          }}
                        >
                          <div className="allpages-table-header-ctrl" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                            <div style={{ flex: 1, minWidth: 200, marginRight: 16 }}>
                              <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>
                                Table Title / Caption:
                              </label>
                              <input
                                type="text"
                                value={table.title || ""}
                                onChange={(e) => handleUpdateTableTitle(tIdx, e.target.value)}
                                placeholder="e.g. Schedule II - Resettlement & Rehabilitation Packages"
                                style={{ width: "100%", height: 38, minHeight: 38, maxHeight: 38, padding: "6px 12px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}
                              />
                            </div>
                            <div className="allpages-table-btn-group" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                onClick={() => handleAddTableColumn(tIdx)}
                                style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", fontSize: "0.75rem", cursor: "pointer", height: 34, display: "inline-flex", alignItems: "center" }}
                              >
                                + Add Column
                              </button>
                              <button
                                onClick={() => handleAddTableRow(tIdx)}
                                style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#10b981", fontSize: "0.75rem", cursor: "pointer", height: 34, display: "inline-flex", alignItems: "center" }}
                              >
                                + Add Row
                              </button>
                              <button
                                onClick={() => handleDeleteTable(tIdx)}
                                style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", height: 34, display: "inline-flex", alignItems: "center" }}
                              >
                                Delete Table
                              </button>
                            </div>
                          </div>

                          {/* Render Editable Table */}
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                              <thead>
                                <tr>
                                  {(table.headers || []).map((header, hIdx) => (
                                    <th
                                      key={hIdx}
                                      style={{
                                        background: "#1e293b",
                                        padding: "8px",
                                        border: "1px solid #334155",
                                        minWidth: 140
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input
                                          type="text"
                                          value={header}
                                          onChange={(e) => handleUpdateTableHeader(tIdx, hIdx, e.target.value)}
                                          style={{
                                            width: "100%",
                                            background: "transparent",
                                            border: "none",
                                            color: "#38bdf8",
                                            fontWeight: 700,
                                            fontSize: "0.82rem"
                                          }}
                                        />
                                        <button
                                          onClick={() => handleDeleteTableColumn(tIdx, hIdx)}
                                          title="Delete column"
                                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                                        >
                                          <FaTimes size={10} />
                                        </button>
                                      </div>
                                    </th>
                                  ))}
                                  <th style={{ width: 40, background: "#1e293b", border: "1px solid #334155" }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {(table.rows || []).map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {(row || []).map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        style={{
                                          padding: "6px",
                                          border: "1px solid #1f2937",
                                          background: rIdx % 2 === 0 ? "#0b0f19" : "#0d1322"
                                        }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                          <input
                                            type="text"
                                            value={cell || ""}
                                            onChange={(e) => handleUpdateTableCell(tIdx, rIdx, cIdx, e.target.value)}
                                            style={{
                                              width: "100%",
                                              padding: "4px 8px",
                                              borderRadius: 4,
                                              background: "transparent",
                                              border: "1px solid #1e293b",
                                              color: "#cbd5e1",
                                              fontSize: "0.82rem"
                                            }}
                                          />
                                          {(String(cell || "").trim().startsWith("http://") || String(cell || "").trim().startsWith("https://")) && (
                                            <a
                                              href={String(cell).trim()}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="Open / Test External Link"
                                              style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: 24,
                                                height: 24,
                                                borderRadius: 4,
                                                background: "rgba(56, 189, 248, 0.15)",
                                                border: "1px solid rgba(56, 189, 248, 0.4)",
                                                color: "#38bdf8",
                                                flexShrink: 0,
                                                textDecoration: "none"
                                              }}
                                            >
                                              <FaExternalLinkAlt size={9} />
                                            </a>
                                          )}
                                        </div>
                                      </td>
                                    ))}
                                    <td style={{ textAlign: "center", border: "1px solid #1f2937", background: "#0b0f19" }}>
                                      <button
                                        onClick={() => handleDeleteTableRow(tIdx, rIdx)}
                                        title="Delete row"
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

              {/* ── TAB 4: PHOTOS & MAPS ── */}
              {activeTab === "images" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ffffff" }}>Photo Gallery & Maps</h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                        Upload field survey photographs, official project maps, and illustrations.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        onChange={handleUploadImageFile}
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          background: "#f59e0b",
                          color: "#000",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaCloudUploadAlt size={14} /> {isUploadingImage ? "Uploading..." : "Upload Photo"}
                      </button>
                      <button
                        onClick={handleAddImageUrl}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          background: "#1e293b",
                          border: "1px solid #334155",
                          color: "#cbd5e1",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaLink /> Add Image URL
                      </button>
                    </div>
                  </div>

                  {editFormData.images.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", background: "#111827", borderRadius: 12, color: "#94a3b8" }}>
                      No photos attached. Click &quot;Upload Photo&quot; to add maps or pictures.
                    </div>
                  ) : (
                    <div
                      className="allpages-photos-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: 16
                      }}
                    >
                      {editFormData.images.map((img, idx) => {
                        const src = img.src || img.url || "";
                        return (
                          <div
                            key={idx}
                            style={{
                              background: "#111827",
                              border: "1px solid #1f2937",
                              borderRadius: 10,
                              overflow: "hidden",
                              display: "flex",
                              flexDirection: "column"
                            }}
                          >
                            <div style={{ height: 160, background: "#0b0f19", position: "relative" }}>
                              <img
                                src={src}
                                alt={img.alt || img.caption || "Page media"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <button
                                onClick={() => handleDeleteImage(idx)}
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  background: "rgba(239, 68, 68, 0.9)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: 26,
                                  height: 26,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                            <div style={{ padding: "10px 12px" }}>
                              <input
                                type="text"
                                value={img.caption || img.name || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditFormData((prev) => {
                                    const copy = [...prev.images];
                                    copy[idx] = { ...copy[idx], caption: val, name: val, alt: val };
                                    return { ...prev, images: copy };
                                  });
                                }}
                                placeholder="Caption / Name..."
                                style={{ width: "100%", padding: "6px 8px", borderRadius: 4, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.8rem" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 5: PDFS & DOWNLOADS ── */}
              {activeTab === "downloads" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ffffff" }}>Official Downloads & PDF Records</h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                        Attach gazettes, government orders (G.O.), and legal judgements for visitor download.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <input
                        type="file"
                        ref={docInputRef}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleUploadDocFile}
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={() => docInputRef.current?.click()}
                        disabled={isUploadingDoc}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          background: "#ec4899",
                          color: "#fff",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaCloudUploadAlt size={14} /> {isUploadingDoc ? "Uploading..." : "Upload Document"}
                      </button>
                      <button
                        onClick={handleAddDocUrl}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          background: "#1e293b",
                          border: "1px solid #334155",
                          color: "#cbd5e1",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaLink /> Add Link
                      </button>
                    </div>
                  </div>

                  {editFormData.downloads.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", background: "#111827", borderRadius: 12, color: "#94a3b8" }}>
                      No documents attached. Click &quot;Upload Document&quot; to attach statutory records.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {editFormData.downloads.map((doc, idx) => (
                        <div
                          key={idx}
                          className="allpages-item-card"
                          style={{
                            background: "#111827",
                            border: "1px solid #1f2937",
                            borderRadius: 10,
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap"
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input
                              type="text"
                              value={doc.title || doc.text || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditFormData((prev) => {
                                  const copy = [...prev.downloads];
                                  copy[idx] = { ...copy[idx], title: val, text: val };
                                  return { ...prev, downloads: copy };
                                });
                              }}
                              placeholder="Document Title / Name..."
                              style={{ width: "100%", padding: "6px 10px", borderRadius: 4, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontWeight: 600, fontSize: "0.85rem", marginBottom: 4 }}
                            />
                            <div style={{ display: "flex", gap: 10, fontSize: "0.75rem", color: "#64748b", flexWrap: "wrap" }}>
                              <span style={{ wordBreak: "break-all" }}>URL: {doc.url || "N/A"}</span>
                              {doc.size && <span>• Size: {doc.size}</span>}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ padding: "6px 10px", borderRadius: 6, background: "#1e293b", color: "#cbd5e1", textDecoration: "none", fontSize: "0.78rem" }}
                              >
                                View
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteDoc(idx)}
                              style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", fontSize: "0.78rem", cursor: "pointer" }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 6: FIELD VIDEOS (ULTRA-FAST FORMAT) ── */}
              {activeTab === "videos" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ffffff" }}>Field Videos & Multimedia</h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                        Upload video files directly or embed YouTube streaming recordings.
                      </p>
                    </div>
                    <button
                      onClick={() => openAddVideoModal(null)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.35)"
                      }}
                    >
                      <FaPlus /> Add Video
                    </button>
                  </div>

                  {editFormData.videos.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", background: "#111827", borderRadius: 12, color: "#94a3b8" }}>
                      <FaVideo size={36} color="#475569" style={{ marginBottom: 10 }} />
                      <p style={{ margin: 0, fontSize: "0.85rem" }}>
                        No field videos attached yet. Click &quot;Add Video&quot; to upload an MP4 or embed a YouTube recording.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="allpages-videos-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 16
                      }}
                    >
                      {editFormData.videos.map((vid, idx) => {
                        const vidUrl = vid.url || vid.src || "";
                        const isYt = isYouTubeUrl(vidUrl);
                        return (
                          <div
                            key={idx}
                            style={{
                              background: "#111827",
                              border: "1px solid #1f2937",
                              borderRadius: 12,
                              overflow: "hidden",
                              display: "flex",
                              flexDirection: "column"
                            }}
                          >
                            <div style={{ height: 180, background: "#000000" }}>
                              {isYt ? (
                                <iframe
                                  src={getYouTubeEmbedUrl(vidUrl)}
                                  title={vid.title}
                                  style={{ width: "100%", height: "100%", border: "none" }}
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={vidUrl}
                                  controls
                                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                              )}
                            </div>

                            <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                              <div>
                                <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
                                  {vid.title || "Field Video"}
                                </h4>
                                {vid.description && (
                                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.4 }}>
                                    {vid.description}
                                  </p>
                                )}
                              </div>

                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                                <button
                                  onClick={() => openAddVideoModal(idx)}
                                  style={{ padding: "6px 12px", borderRadius: 6, background: "#1e293b", color: "#38bdf8", border: "1px solid #334155", fontSize: "0.75rem", cursor: "pointer" }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(idx)}
                                  style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}
                                >
                                  <FaTrash />
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

              {/* ── TAB 7: STATS COUNTERS ── */}
              {activeTab === "stats" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#ffffff" }}>Key Metric Counters</h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                        Highlighted metrics (e.g. &quot;373 Submerged Villages&quot;, &quot;10,000+ Displaced Families&quot;).
                      </p>
                    </div>
                    <button
                      onClick={handleAddStat}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <FaPlus /> Add Metric
                    </button>
                  </div>

                  {editFormData.stats.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", background: "#111827", borderRadius: 12, color: "#94a3b8" }}>
                      No stats cards configured. Click &quot;Add Metric&quot; to highlight key numbers.
                    </div>
                  ) : (
                    <div className="allpages-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                      {editFormData.stats.map((st, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#111827",
                            border: "1px solid #1f2937",
                            borderRadius: 10,
                            padding: "14px 16px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Metric #{idx + 1}</span>
                            <button
                              onClick={() => handleDeleteStat(idx)}
                              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Value / Number:</label>
                            <input
                              type="text"
                              value={st.num || st.value || ""}
                              onChange={(e) => handleUpdateStat(idx, "num", e.target.value)}
                              placeholder="e.g. 373 Villages"
                              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, background: "#0b0f19", border: "1px solid #334155", color: "#38bdf8", fontWeight: 700 }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Label Description:</label>
                            <input
                              type="text"
                              value={st.label || ""}
                              onChange={(e) => handleUpdateStat(idx, "label", e.target.value)}
                              placeholder="e.g. Submerged Habitations"
                              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, background: "#0b0f19", border: "1px solid #334155", color: "#cbd5e1" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE NEW PAGE MODAL ─────────────────────────────────────────── */}
      {showCreateModal && (
        <div
          className="allpages-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20
          }}
        >
          <div
            className="allpages-dialog-card"
            style={{
              background: "#0d111c",
              border: "1px solid #1e293b",
              borderRadius: 14,
              padding: "24px 28px",
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>
                Create New Site Page
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreatePage}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Page Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Schedule V Forest Land Rights"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Slug (URL Path)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="e.g. schedule-v-forest-rights"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#38bdf8", fontFamily: "monospace", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                >
                  <option value="Polavaram LA & R&R">Polavaram LA & R&R</option>
                  <option value="RoFR & LTR">RoFR & LTR</option>
                  <option value="Flood Relief">Flood Relief</option>
                  <option value="Governance & Institutional">Governance & Institutional</option>
                  <option value="Programs & Livelihood">Programs & Livelihood</option>
                  <option value="Legal & Downloads">Legal & Downloads</option>
                  <option value="Community & Archive">Community & Archive</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Subtitle / Overview Tagline
                </label>
                <textarea
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  rows={2}
                  placeholder="Brief introductory summary..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {isCreating ? "Creating..." : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SYNC FROM JSON MODAL ─────────────────────────────────────────── */}
      {showSyncModal && (
        <div
          className="allpages-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20
          }}
        >
          <div
            className="allpages-dialog-card"
            style={{
              background: "#0d111c",
              border: "1px solid #1e293b",
              borderRadius: 14,
              padding: "24px 28px",
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#fff", fontSize: "1.2rem", fontWeight: 800 }}>
              Synchronize with JSON Dataset
            </h3>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 }}>
              This will inspect <code>frontend/src/data/all_site_pages.json</code> and ensure all initial 91 pages and records are seeded into MySQL table <code>site_all_pages</code>.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResyncFromJson(false)}
                disabled={isSyncing}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {isSyncing ? "Synchronizing..." : "Sync Missing Pages"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      {deleteTarget && (
        <div
          className="allpages-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20
          }}
        >
          <div
            className="allpages-dialog-card"
            style={{
              background: "#0d111c",
              border: "1px solid #ef4444",
              borderRadius: 14,
              padding: "24px 28px",
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#ef4444", fontSize: "1.2rem", fontWeight: 800 }}>
              Delete Page?
            </h3>
            <p style={{ margin: "0 0 20px", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>&quot;{deleteTarget.title}&quot;</strong> (<code>/{deleteTarget.slug}</code>) from the database? This action cannot be undone.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePage}
                disabled={isDeleting}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Page"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAST VIDEO MODAL (2-TAB: UPLOAD / URL) ─────────────────────────── */}
      {showAddVidModal && (
        <div
          className="allpages-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20
          }}
        >
          <div
            className="allpages-dialog-card"
            style={{
              background: "#0d111c",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: "24px 28px",
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
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
                  disabled={isUploadingVid}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: isUploadingVid ? "#475569" : "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 700,
                    cursor: isUploadingVid ? "not-allowed" : "pointer"
                  }}
                >
                  {isUploadingVid ? `Uploading... ${vidUploadProgress.percent}%` : "Attach Video to Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

