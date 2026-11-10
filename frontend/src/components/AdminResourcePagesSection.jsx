import { useState, useEffect, useRef } from "react";
import {
  FaFileAlt, FaPlus, FaTrash, FaEdit, FaSave, FaExternalLinkAlt,
  FaCheckCircle, FaExclamationTriangle, FaCloudUploadAlt, FaTimes,
  FaFolderOpen, FaBars, FaVideo, FaImages, FaTable, FaDownload,
  FaChartLine, FaArrowUp, FaArrowDown, FaEye, FaUndo, FaSearch,
  FaCopy, FaPlay
} from "react-icons/fa";
import {
  adminGetAllSitePage,
  adminSaveAllSitePage,
  adminCreateAllSitePage,
  adminDeleteAllSitePage,
  adminUploadImage,
  adminUploadVideo,
  API_BASE
} from "../api/client";
import {
  DEFAULT_GRIEVANCE_PAGES,
  DEFAULT_DOWNLOAD_PAGES,
  DEFAULT_QUICK_LINKS_PAGES
} from "../data/defaultResourcePages";
import {
  STAT_ICON_OPTIONS,
  STAT_COLOR_OPTIONS,
  renderStatIcon
} from "../utils/statIcons";

export default function AdminResourcePagesSection({
  sectionType = "grievance", // "grievance" | "download" | "quick_links"
  initialSlug = "",
  adminKey = "",
  onShowToast = () => {}
}) {
  const isGrievance = sectionType === "grievance";
  const isQuickLinks = sectionType === "quick_links";
  const defaultList = isQuickLinks
    ? DEFAULT_QUICK_LINKS_PAGES
    : (isGrievance ? DEFAULT_GRIEVANCE_PAGES : DEFAULT_DOWNLOAD_PAGES);
  const storageListKey = isQuickLinks
    ? "alertngo_quick_links_pages_list"
    : (isGrievance ? "alertngo_grievance_pages_list" : "alertngo_download_pages_list");

  const [pagesList, setPagesList] = useState(() => {
    try {
      const saved = localStorage.getItem(storageListKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return defaultList;
  });

  const [selectedSlug, setSelectedSlug] = useState(() => {
    if (initialSlug) {
      const match = defaultList.find((p) => p.slug.toLowerCase() === initialSlug.toLowerCase());
      if (match) return match.slug;
    }
    return defaultList[0]?.slug || "";
  });

  // Current editing page data
  const [currentPage, setCurrentPage] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(isQuickLinks ? "tables" : "overview"); // overview, stats, paragraphs, images, downloads, tables, videos
  const [isSaving, setIsSaving] = useState(false);

  // Modals for Page Creation & Deletion
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageForm, setNewPageForm] = useState({
    title: "",
    slug: "",
    nav_label: "",
    category: isQuickLinks ? "Legal & Downloads" : (isGrievance ? "Community & Archive" : "Legal & Downloads"),
    badge: isQuickLinks ? "Government Portals" : (isGrievance ? "Community Grievance" : "Legislative Acts"),
    subtitle: ""
  });
  const [deleteTargetSlug, setDeleteTargetSlug] = useState(null);

  // Modal: Edit Page Meta (Header / Title / Slug / Subtitle)
  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [pageMetaForm, setPageMetaForm] = useState({
    title: "",
    slug: "",
    nav_label: "",
    category: "",
    badge: "",
    subtitle: ""
  });

  // Modal: Edit Image / Archival Scan
  const [editingImageModal, setEditingImageModal] = useState({
    isOpen: false,
    index: -1,
    form: { url: "", name: "", caption: "", alt: "" }
  });
  const replaceImageFileRef = useRef(null);
  const [isUploadingReplaceImage, setIsUploadingReplaceImage] = useState(false);

  // Modal: Edit Document / PDF
  const [editingDocModal, setEditingDocModal] = useState({
    isOpen: false,
    index: -1,
    form: { title: "", file: "", meta: "", fileSize: "" }
  });
  const replaceDocFileRef = useRef(null);
  const [isUploadingReplaceDoc, setIsUploadingReplaceDoc] = useState(false);

  // Modal: Edit Video
  const [editingVideoModal, setEditingVideoModal] = useState({
    isOpen: false,
    index: -1,
    form: { title: "", url: "", description: "" }
  });
  const replaceVideoFileRef = useRef(null);
  const [isUploadingReplaceVideo, setIsUploadingReplaceVideo] = useState(false);

  // Upload refs for adding new items
  const imageFileRef = useRef(null);
  const docFileRef = useRef(null);
  const videoFileRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Sync with initialSlug if prop changes
  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
    }
    if (isQuickLinks) {
      setActiveSubTab("tables");
    }
  }, [initialSlug, isQuickLinks]);

  // Load selected page data
  useEffect(() => {
    if (!selectedSlug) return;

    // 1. Check local override cache
    let found = null;
    try {
      const cached = localStorage.getItem(`alertngo_page_override_${selectedSlug.toLowerCase()}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.title || parsed.slug)) {
          found = parsed;
        }
      }
    } catch (_) {}

    // 2. Check current pagesList
    if (!found) {
      found = pagesList.find((p) => p.slug.toLowerCase() === selectedSlug.toLowerCase());
    }

    // 3. Fallback to defaultList
    const defaultPage = defaultList.find((p) => p.slug.toLowerCase() === selectedSlug.toLowerCase()) || (isQuickLinks ? DEFAULT_QUICK_LINKS_PAGES[0] : null);

    if (!found) {
      found = defaultPage;
    }

    // Defensive table & content restoration:
    let tablesToUse = Array.isArray(found?.tables) && found.tables.length > 0 ? found.tables : [];
    if (tablesToUse.length === 0 && defaultPage?.tables && defaultPage.tables.length > 0) {
      tablesToUse = defaultPage.tables;
    }

    let parasToUse = Array.isArray(found?.paragraphs) && found.paragraphs.length > 0 ? found.paragraphs : [];
    if (parasToUse.length === 0 && defaultPage?.paragraphs && defaultPage.paragraphs.length > 0) {
      parasToUse = defaultPage.paragraphs;
    }

    let downloadsToUse = Array.isArray(found?.downloads) && found.downloads.length > 0 ? found.downloads : [];
    if (downloadsToUse.length === 0 && defaultPage?.downloads && defaultPage.downloads.length > 0) {
      downloadsToUse = defaultPage.downloads;
    }

    let imagesToUse = Array.isArray(found?.images) && found.images.length > 0 ? found.images : [];
    if (imagesToUse.length === 0 && defaultPage?.images && defaultPage.images.length > 0) {
      imagesToUse = defaultPage.images;
    }

    let statsToUse = Array.isArray(found?.stats) && found.stats.length > 0 ? found.stats : (defaultPage?.stats || []);
    let videosToUse = Array.isArray(found?.videos) && found.videos.length > 0 ? found.videos : (defaultPage?.videos || []);

    // Normalize structure
    const normalized = {
      slug: selectedSlug,
      title: found?.title || defaultPage?.title || selectedSlug,
      nav_label: found?.nav_label || found?.title || defaultPage?.title || selectedSlug,
      category: found?.category || defaultPage?.category || (isQuickLinks ? "Legal & Downloads" : (isGrievance ? "Community & Archive" : "Legal & Downloads")),
      badge: found?.badge || defaultPage?.badge || (isQuickLinks ? "Government Portals & Directories" : (isGrievance ? "Community Grievance" : "Legislative Acts")),
      subtitle: found?.subtitle || defaultPage?.subtitle || "",
      paragraphs: parasToUse,
      images: imagesToUse.map((img) => ({ ...img })),
      downloads: downloadsToUse.map((d) => ({ ...d })),
      tables: tablesToUse.map((t) => ({ ...t, rows: (t.rows || []).map((r) => [...r]) })),
      videos: videosToUse.map((v) => ({ ...v })),
      stats: statsToUse.map((s) => ({ ...s }))
    };

    setCurrentPage(normalized);

    // Try fetching latest from API in background if possible
    adminGetAllSitePage(adminKey, selectedSlug)
      .then((res) => {
        if (res && res.success && res.data) {
          const apiD = res.data;
          const c = apiD.content || {};
          setCurrentPage((prev) => {
            if (!prev || prev.slug !== selectedSlug) return prev;
            return {
              ...prev,
              title: apiD.title || prev.title,
              nav_label: apiD.nav_label || prev.nav_label,
              category: apiD.category || prev.category,
              badge: apiD.badge || prev.badge,
              subtitle: apiD.subtitle !== undefined ? apiD.subtitle : prev.subtitle,
              paragraphs: Array.isArray(apiD.paragraphs) && apiD.paragraphs.length > 0 ? apiD.paragraphs : (Array.isArray(c.paragraphs) && c.paragraphs.length > 0 ? c.paragraphs : prev.paragraphs),
              images: Array.isArray(apiD.images) && apiD.images.length > 0 ? apiD.images : (Array.isArray(c.images) && c.images.length > 0 ? c.images : prev.images),
              downloads: Array.isArray(apiD.downloads) && apiD.downloads.length > 0 ? apiD.downloads : (Array.isArray(c.downloads) && c.downloads.length > 0 ? c.downloads : prev.downloads),
              tables: Array.isArray(apiD.tables) && apiD.tables.length > 0 ? apiD.tables : (Array.isArray(c.tables) && c.tables.length > 0 ? c.tables : prev.tables),
              videos: Array.isArray(apiD.videos) && apiD.videos.length > 0 ? apiD.videos : (Array.isArray(c.videos) && c.videos.length > 0 ? c.videos : prev.videos),
              stats: Array.isArray(apiD.stats) && apiD.stats.length > 0 ? apiD.stats : (Array.isArray(c.stats) && c.stats.length > 0 ? c.stats : prev.stats)
            };
          });
        }
      })
      .catch(() => {});
  }, [selectedSlug, isGrievance, isQuickLinks]);

  // Helper: sync current page locally
  const syncLocalOverride = (updated) => {
    try {
      localStorage.setItem(`alertngo_page_override_${updated.slug.toLowerCase()}`, JSON.stringify(updated));
      setPagesList((prev) => {
        const nextList = prev.map((p) => (p.slug.toLowerCase() === updated.slug.toLowerCase() ? { ...p, ...updated } : p));
        try {
          localStorage.setItem(storageListKey, JSON.stringify(nextList));
        } catch (_) {}
        return nextList;
      });
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: updated.slug } }));
    } catch (_) {}
  };

  // ── SAVE PAGE HANDLER ──────────────────────────────────────────────────────
  const handleSavePage = async () => {
    if (!currentPage) return;
    setIsSaving(true);
    try {
      const payload = {
        slug: currentPage.slug,
        title: currentPage.title,
        nav_label: currentPage.nav_label,
        category: currentPage.category,
        badge: currentPage.badge,
        subtitle: currentPage.subtitle,
        paragraphs: currentPage.paragraphs,
        images: currentPage.images,
        downloads: currentPage.downloads,
        tables: currentPage.tables,
        videos: currentPage.videos,
        stats: currentPage.stats
      };

      // 1. Cache locally for instant reactivity
      syncLocalOverride(payload);

      // 2. Save to backend database
      await adminSaveAllSitePage(adminKey, payload);

      // 3. Dispatch update event for frontend listeners
      window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: currentPage.slug } }));

      onShowToast(`Page "${currentPage.title}" saved successfully!`, "success");
    } catch (err) {
      onShowToast("Saved locally (" + (err.message || "server synced") + ")", "success");
    } finally {
      setIsSaving(false);
    }
  };

  // ── EDIT PAGE META MODAL HANDLERS ──────────────────────────────────────────
  const openEditPageMetaModal = (pageToEdit = currentPage) => {
    const target = pageToEdit || currentPage;
    if (!target) return;
    setPageMetaForm({
      title: target.title || "",
      slug: target.slug || "",
      nav_label: target.nav_label || target.title || "",
      category: target.category || "",
      badge: target.badge || "",
      subtitle: target.subtitle || ""
    });
    setShowEditPageModal(true);
  };

  const handleSavePageMeta = (e) => {
    e.preventDefault();
    if (!pageMetaForm.title.trim()) {
      onShowToast("Page title is required", "error");
      return;
    }
    const updated = {
      ...currentPage,
      title: pageMetaForm.title.trim(),
      nav_label: pageMetaForm.nav_label.trim() || pageMetaForm.title.trim(),
      category: pageMetaForm.category.trim(),
      badge: pageMetaForm.badge.trim(),
      subtitle: pageMetaForm.subtitle.trim()
    };
    setCurrentPage(updated);
    syncLocalOverride(updated);
    setShowEditPageModal(false);
    onShowToast("Page info updated! Click 'Save Changes' to push to server.", "success");
  };

  // ── EDIT IMAGE MODAL HANDLERS ──────────────────────────────────────────────
  const openEditImageModal = (img, idx) => {
    setEditingImageModal({
      isOpen: true,
      index: idx,
      form: {
        url: img.url || img.src || "",
        name: img.name || img.caption || "Image Record",
        caption: img.caption || img.name || "",
        alt: img.alt || img.caption || img.name || ""
      }
    });
  };

  const handleSaveImageModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (editingImageModal.index < 0 || !currentPage) return;
    const idx = editingImageModal.index;
    const f = editingImageModal.form;
    if (!f.url.trim()) {
      onShowToast("Image URL / path is required", "error");
      return;
    }

    const nextImages = [...currentPage.images];
    nextImages[idx] = {
      ...nextImages[idx],
      url: f.url.trim(),
      src: f.url.trim(),
      name: f.name.trim() || f.caption.trim() || "Archival Record",
      caption: f.caption.trim() || f.name.trim() || "",
      alt: f.alt.trim() || f.caption.trim() || f.name.trim() || ""
    };

    const updated = { ...currentPage, images: nextImages };
    setCurrentPage(updated);
    syncLocalOverride(updated);
    setEditingImageModal({ isOpen: false, index: -1, form: { url: "", name: "", caption: "", alt: "" } });
    onShowToast("Image updated successfully!", "success");
  };

  const handleReplaceImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReplaceImage(true);
    try {
      const res = await adminUploadImage(adminKey, file, "grievances");
      if (res && res.url) {
        const autoName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setEditingImageModal((prev) => ({
          ...prev,
          form: {
            ...prev.form,
            url: res.url,
            name: prev.form.name || autoName,
            caption: prev.form.caption || autoName
          }
        }));
        onShowToast("Replacement image uploaded!", "success");
      } else {
        onShowToast(res?.message || "Image upload failed", "error");
      }
    } catch (err) {
      onShowToast("Upload error: " + err.message, "error");
    } finally {
      setIsUploadingReplaceImage(false);
      if (replaceImageFileRef.current) replaceImageFileRef.current.value = "";
    }
  };

  // ── EDIT DOCUMENT MODAL HANDLERS ───────────────────────────────────────────
  const openEditDocModal = (doc, idx) => {
    setEditingDocModal({
      isOpen: true,
      index: idx,
      form: {
        title: doc.title || "",
        file: doc.file || "",
        meta: doc.meta || "Official PDF Document",
        fileSize: doc.fileSize || "Official PDF"
      }
    });
  };

  const handleSaveDocModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (editingDocModal.index < 0 || !currentPage) return;
    const idx = editingDocModal.index;
    const f = editingDocModal.form;
    if (!f.title.trim()) {
      onShowToast("Document title is required", "error");
      return;
    }
    const nextDocs = [...currentPage.downloads];
    nextDocs[idx] = {
      ...nextDocs[idx],
      title: f.title.trim(),
      file: f.file.trim(),
      meta: f.meta.trim() || "Official PDF Document",
      fileSize: f.fileSize.trim() || "Official PDF"
    };

    const updated = { ...currentPage, downloads: nextDocs };
    setCurrentPage(updated);
    syncLocalOverride(updated);
    setEditingDocModal({ isOpen: false, index: -1, form: { title: "", file: "", meta: "", fileSize: "" } });
    onShowToast("Document updated successfully!", "success");
  };

  const handleReplaceDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReplaceDoc(true);
    try {
      const res = await adminUploadImage(adminKey, file, "downloads");
      if (res && res.url) {
        const sizeKb = Math.round(file.size / 1024);
        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setEditingDocModal((prev) => ({
          ...prev,
          form: {
            ...prev.form,
            file: res.url,
            title: prev.form.title || autoTitle,
            fileSize: sizeStr
          }
        }));
        onShowToast("Replacement PDF uploaded!", "success");
      } else {
        onShowToast(res?.message || "Document upload failed", "error");
      }
    } catch (err) {
      onShowToast("Upload error: " + err.message, "error");
    } finally {
      setIsUploadingReplaceDoc(false);
      if (replaceDocFileRef.current) replaceDocFileRef.current.value = "";
    }
  };

  // ── EDIT VIDEO MODAL HANDLERS ──────────────────────────────────────────────
  const openEditVideoModal = (vid, idx) => {
    setEditingVideoModal({
      isOpen: true,
      index: idx,
      form: {
        title: vid.title || "",
        url: vid.url || "",
        description: vid.description || "Official Field Video"
      }
    });
  };

  const handleSaveVideoModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (editingVideoModal.index < 0 || !currentPage) return;
    const idx = editingVideoModal.index;
    const f = editingVideoModal.form;
    if (!f.url.trim()) {
      onShowToast("Video URL is required", "error");
      return;
    }
    const nextVideos = [...currentPage.videos];
    nextVideos[idx] = {
      ...nextVideos[idx],
      title: f.title.trim() || "Official Video",
      url: f.url.trim(),
      description: f.description.trim() || "Official Video"
    };

    const updated = { ...currentPage, videos: nextVideos };
    setCurrentPage(updated);
    syncLocalOverride(updated);
    setEditingVideoModal({ isOpen: false, index: -1, form: { title: "", url: "", description: "" } });
    onShowToast("Video updated successfully!", "success");
  };

  const handleReplaceVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReplaceVideo(true);
    try {
      const res = await adminUploadVideo(adminKey, file, "videos");
      if (res && res.url) {
        const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setEditingVideoModal((prev) => ({
          ...prev,
          form: {
            ...prev.form,
            url: res.url,
            title: prev.form.title || autoTitle
          }
        }));
        onShowToast("Replacement video uploaded!", "success");
      } else {
        onShowToast(res?.message || "Video upload failed", "error");
      }
    } catch (err) {
      onShowToast("Upload error: " + err.message, "error");
    } finally {
      setIsUploadingReplaceVideo(false);
      if (replaceVideoFileRef.current) replaceVideoFileRef.current.value = "";
    }
  };

  // ── CREATE PAGE HANDLER ────────────────────────────────────────────────────
  const handleCreatePage = async (e) => {
    e.preventDefault();
    const title = newPageForm.title.trim();
    if (!title) {
      onShowToast("Page title is required", "error");
      return;
    }
    let slug = newPageForm.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (!slug) {
      slug = `page-${Date.now()}`;
    }

    const newPage = {
      slug,
      title,
      nav_label: newPageForm.nav_label.trim() || title,
      category: newPageForm.category || (isQuickLinks ? "Legal & Downloads" : (isGrievance ? "Community & Archive" : "Legal & Downloads")),
      badge: newPageForm.badge || (isQuickLinks ? "Government Portals" : (isGrievance ? "Community Grievance" : "Legislative Acts")),
      subtitle: newPageForm.subtitle.trim() || `Official documentation and field records on ${title}.`,
      paragraphs: [
        `This section contains official publications, representations, and reports regarding ${title}.`,
        "Maintained by ALERT Legal and Research team in Vijayawada."
      ],
      images: [],
      downloads: [],
      tables: [],
      videos: [],
      stats: [
        { num: "1", label: "Published Record", color: "#003190", icon: "check" }
      ]
    };

    try {
      await adminCreateAllSitePage(adminKey, newPage);
    } catch (_) {}

    try {
      localStorage.setItem(`alertngo_page_override_${slug}`, JSON.stringify(newPage));
    } catch (_) {}

    const updatedList = [...pagesList, newPage];
    setPagesList(updatedList);
    try {
      localStorage.setItem(storageListKey, JSON.stringify(updatedList));
    } catch (_) {}

    setSelectedSlug(slug);
    setShowAddPageModal(false);
    setNewPageForm({
      title: "",
      slug: "",
      nav_label: "",
      category: isQuickLinks ? "Legal & Downloads" : (isGrievance ? "Community & Archive" : "Legal & Downloads"),
      badge: isQuickLinks ? "Government Portals" : (isGrievance ? "Community Grievance" : "Legislative Acts"),
      subtitle: ""
    });
    window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug } }));
    onShowToast(`New page "${title}" created!`, "success");
  };

  // ── DELETE PAGE HANDLER ────────────────────────────────────────────────────
  const handleDeletePage = async () => {
    if (!deleteTargetSlug) return;
    const targetSlug = deleteTargetSlug;
    setDeleteTargetSlug(null);

    try {
      await adminDeleteAllSitePage(adminKey, targetSlug);
    } catch (_) {}

    try {
      localStorage.removeItem(`alertngo_page_override_${targetSlug.toLowerCase()}`);
    } catch (_) {}

    const updatedList = pagesList.filter((p) => p.slug.toLowerCase() !== targetSlug.toLowerCase());
    setPagesList(updatedList);
    try {
      localStorage.setItem(storageListKey, JSON.stringify(updatedList));
    } catch (_) {}

    if (selectedSlug.toLowerCase() === targetSlug.toLowerCase()) {
      setSelectedSlug(updatedList[0]?.slug || "");
    }
    window.dispatchEvent(new CustomEvent("alertngo_page_updated", { detail: { slug: targetSlug } }));
    onShowToast(`Page "${targetSlug}" deleted.`, "success");
  };

  // ── IMAGE UPLOAD HANDLER ───────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminUploadImage(adminKey, file, "grievances");
      if (res && res.url) {
        const autoName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const newImg = {
          url: res.url,
          src: res.url,
          name: autoName,
          caption: autoName,
          alt: autoName
        };
        const updated = {
          ...currentPage,
          images: [...currentPage.images, newImg]
        };
        setCurrentPage(updated);
        syncLocalOverride(updated);
        onShowToast("Image uploaded!", "success");
      } else {
        onShowToast(res?.message || "Image upload failed", "error");
      }
    } catch (err) {
      onShowToast("Upload error: " + err.message, "error");
    } finally {
      setUploadingImage(false);
      if (imageFileRef.current) imageFileRef.current.value = "";
    }
  };

  // ── DOCUMENT / PDF UPLOAD HANDLER ──────────────────────────────────────────
  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const res = await adminUploadImage(adminKey, file, "downloads");
      if (res && res.url) {
        const sizeKb = Math.round(file.size / 1024);
        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const newDoc = {
          title: autoTitle,
          file: res.url,
          meta: "Official PDF Document",
          fileSize: sizeStr
        };
        const updated = {
          ...currentPage,
          downloads: [...currentPage.downloads, newDoc]
        };
        setCurrentPage(updated);
        syncLocalOverride(updated);
        onShowToast("Document PDF uploaded!", "success");
      } else {
        onShowToast(res?.message || "Document upload failed", "error");
      }
    } catch (err) {
      onShowToast("Upload error: " + err.message, "error");
    } finally {
      setUploadingDoc(false);
      if (docFileRef.current) docFileRef.current.value = "";
    }
  };

  // ── VIDEO UPLOAD HANDLER ───────────────────────────────────────────────────
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const res = await adminUploadVideo(adminKey, file, "videos");
      if (res && res.url) {
        const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const newVid = {
          url: res.url,
          title: autoTitle,
          description: "Official Field Video"
        };
        const updated = {
          ...currentPage,
          videos: [...currentPage.videos, newVid]
        };
        setCurrentPage(updated);
        syncLocalOverride(updated);
        onShowToast("Video uploaded!", "success");
      } else {
        onShowToast(res?.message || "Video upload failed", "error");
      }
    } catch (err) {
      onShowToast("Upload error: " + err.message, "error");
    } finally {
      setUploadingVideo(false);
      if (videoFileRef.current) videoFileRef.current.value = "";
    }
  };

  return (
    <div className="adm-res-container" style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: 24, alignItems: "start" }}>
      <style>{`
        @media (max-width: 768px) {
          .adm-res-container {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .adm-res-panel {
            padding: 14px 10px !important;
          }
          .adm-section-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .adm-section-header > button,
          .adm-section-header > div:last-child > button,
          .adm-section-header > div > button {
            width: 100% !important;
            padding: 7px 12px !important;
            font-size: 0.78rem !important;
            white-space: nowrap !important;
            height: 35px !important;
            min-height: 35px !important;
            box-sizing: border-box !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .adm-res-header-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding-bottom: 12px !important;
            margin-bottom: 14px !important;
          }
          .adm-res-header-bar h2 {
            font-size: 1.1rem !important;
            line-height: 1.3 !important;
          }
          .adm-res-header-bar span {
            font-size: 0.7rem !important;
          }
          .adm-res-header-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .adm-res-header-actions > * {
            width: 100% !important;
            min-width: 0 !important;
            height: 34px !important;
            min-height: 34px !important;
            padding: 5px 8px !important;
            font-size: 0.74rem !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .adm-res-subtabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            width: 100% !important;
            gap: 6px !important;
          }
          .adm-res-subtabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.72rem !important;
            padding: 5px 9px !important;
          }
          .adm-res-grid-2col {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .adm-res-doc-item {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 10px 12px !important;
          }
          .adm-res-doc-actions {
            width: 100% !important;
            justify-content: flex-end !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .adm-res-doc-actions > * {
            font-size: 0.74rem !important;
            padding: 5px 8px !important;
          }
          /* ── Image modal preview row: stack on mobile ── */
          .adm-img-preview-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .adm-img-preview-thumb {
            width: 100% !important;
            height: 160px !important;
          }
          .adm-img-upload-btn {
            width: 100% !important;
            justify-content: center !important;
            white-space: nowrap !important;
            font-size: 0.8rem !important;
            padding: 8px 12px !important;
            box-sizing: border-box !important;
          }
          /* ── All modal wrappers ── */
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-res-modal {
            max-width: calc(100vw - 10px) !important;
            width: calc(100vw - 10px) !important;
            padding: 14px 10px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }
          .adm-res-modal * {
            box-sizing: border-box !important;
          }
          .adm-res-modal h3 {
            font-size: 1.05rem !important;
          }
          .adm-res-modal input,
          .adm-res-modal select,
          .adm-res-modal textarea {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            font-size: 0.82rem !important;
            padding: 8px 10px !important;
          }
          /* ── Modal footer buttons ── */
          .adm-res-modal-footer {
            display: flex !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-res-modal-footer button {
            flex: 1 1 0 !important;
            justify-content: center !important;
            white-space: nowrap !important;
            font-size: 0.78rem !important;
            padding: 8px 10px !important;
            height: 36px !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
      {/* ── LEFT SIDEBAR: PAGES LIST ── */}
      <div className="adm-res-panel" style={{ background: "#111827", borderRadius: 14, border: "1px solid #1f2937", padding: 18 }}>
        <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
              {isQuickLinks ? "🔗 Quick Links" : (isGrievance ? "⚖️ Grievance Pages" : "🏛️ Download Pages")}
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              {pagesList.length} page{pagesList.length !== 1 ? "s" : ""} in this section
            </span>
          </div>
          <button
            onClick={() => setShowAddPageModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: isQuickLinks ? "#0284c7" : (isGrievance ? "#f59e0b" : "#10b981"),
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <FaPlus size={10} /> Add Page
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagesList.map((p) => {
            const isSelected = selectedSlug.toLowerCase() === p.slug.toLowerCase();
            const pCount = p.paragraphs?.length || 0;
            const iCount = p.images?.length || 0;
            const dCount = p.downloads?.length || 0;
            const tCount = p.tables?.length || 0;

            return (
              <div
                key={p.slug}
                onClick={() => setSelectedSlug(p.slug)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: isSelected ? (isQuickLinks ? "#38bdf8" : (isGrievance ? "#f59e0b" : "#10b981")) : "#1f2937",
                  background: isSelected ? (isQuickLinks ? "rgba(56, 189, 248, 0.15)" : (isGrievance ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)")) : "#172033",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: isSelected ? "#fff" : "#cbd5e1", flex: 1 }}>
                    {p.title || p.nav_label}
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "#0f172a",
                      color: "#94a3b8",
                      fontFamily: "monospace"
                    }}
                  >
                    /{p.slug}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span>{pCount} para{pCount !== 1 ? "s" : ""}</span>
                    {iCount > 0 && <span>• {iCount} img{iCount !== 1 ? "s" : ""}</span>}
                    {dCount > 0 && <span>• {dCount} doc{dCount !== 1 ? "s" : ""}</span>}
                    {tCount > 0 && <span>• {tCount} tbl{tCount !== 1 ? "s" : ""}</span>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlug(p.slug);
                      openEditPageMetaModal(p);
                    }}
                    title="Edit Page Information"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: 5,
                      background: isSelected ? "rgba(56, 189, 248, 0.2)" : "#1e293b",
                      border: "1px solid",
                      borderColor: isSelected ? "#38bdf8" : "#334155",
                      color: "#38bdf8",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <FaEdit size={10} /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT MAIN: SELECTED PAGE EDITOR ── */}
      {currentPage ? (
        <div className="adm-res-panel" style={{ background: "#111827", borderRadius: 14, border: "1px solid #1f2937", padding: 24 }}>
          {/* Header Bar */}
          <div className="adm-res-header-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20, borderBottom: "1px solid #1f2937", paddingBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: isQuickLinks ? "rgba(56, 189, 248, 0.2)" : (isGrievance ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)"),
                    color: isQuickLinks ? "#38bdf8" : (isGrievance ? "#fbbf24" : "#34d399"),
                    fontWeight: 700,
                    fontSize: "0.75rem"
                  }}
                >
                  {currentPage.badge || (isQuickLinks ? "Government Portals" : (isGrievance ? "Grievance Page" : "Download Page"))}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace" }}>
                  URL: /{currentPage.slug}
                </span>
                {currentPage.category && (
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    • {currentPage.category}
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#f8fafc", margin: 0 }}>
                {currentPage.title}
              </h2>
            </div>

            <div className="adm-res-header-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => openEditPageMetaModal(currentPage)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #0284c7",
                  background: "rgba(2, 132, 199, 0.15)",
                  color: "#38bdf8",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <FaEdit size={12} /> Edit Details
              </button>
              <a
                href={`/${currentPage.slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#cbd5e1",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none"
                }}
              >
                <FaEye size={12} /> View Live
              </a>
              <button
                onClick={() => setDeleteTargetSlug(currentPage.slug)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #7f1d1d",
                  background: "rgba(127, 29, 29, 0.3)",
                  color: "#f87171",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <FaTrash size={12} /> Delete
              </button>
              <button
                onClick={handleSavePage}
                disabled={isSaving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: isQuickLinks ? "#0284c7" : (isGrievance ? "#f59e0b" : "#10b981"),
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: isSaving ? "not-allowed" : "pointer"
                }}
              >
                <FaSave size={12} /> {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Sub-tabs within Page Editor */}
          <div className="adm-res-subtabs" style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #1f2937", paddingBottom: 12, flexWrap: "wrap" }}>
            {[
              { id: "overview", label: "ℹ️ Overview" },
              { id: "stats", label: `📊 Key Stats (${currentPage.stats?.length || 0})` },
              { id: "paragraphs", label: `📝 Paragraphs (${currentPage.paragraphs?.length || 0})` },
              { id: "images", label: `🖼️ Images (${currentPage.images?.length || 0})` },
              { id: "downloads", label: `📥 PDF Downloads (${currentPage.downloads?.length || 0})` },
              { id: "tables", label: `📊 Tables (${currentPage.tables?.length || 0})` },
              { id: "videos", label: `🎬 Videos (${currentPage.videos?.length || 0})` }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveSubTab(st.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "1px solid",
                  borderColor: activeSubTab === st.id ? "#38bdf8" : "#1f2937",
                  background: activeSubTab === st.id ? "rgba(56, 189, 248, 0.15)" : "#172033",
                  color: activeSubTab === st.id ? "#38bdf8" : "#94a3b8",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* SUBTAB 1: OVERVIEW */}
          {activeSubTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="adm-res-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                    Page Heading / Title *
                  </label>
                  <input
                    value={currentPage.title}
                    onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                    Navbar Menu Label
                  </label>
                  <input
                    value={currentPage.nav_label}
                    onChange={(e) => setCurrentPage({ ...currentPage, nav_label: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div className="adm-res-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                    Category Tag
                  </label>
                  <input
                    value={currentPage.category}
                    onChange={(e) => setCurrentPage({ ...currentPage, category: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                    Badge Tag (Header Pill)
                  </label>
                  <input
                    value={currentPage.badge}
                    onChange={(e) => setCurrentPage({ ...currentPage, badge: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Subtitle / Brief Lead Description
                </label>
                <textarea
                  rows={3}
                  value={currentPage.subtitle}
                  onChange={(e) => setCurrentPage({ ...currentPage, subtitle: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box" }}
                />
              </div>

              {(isQuickLinks || selectedSlug === "quick-links") && (
                <div style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaTable /> Official Portals Directory Table: {currentPage.tables?.[0]?.rows?.length || 9} Portals Listed
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 2 }}>
                      Official links to Giribhumi, Polavaram R&R, AP G.Os, MoTA, and ITDAs are configured in the Tables tab.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("tables")}
                    style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <FaTable size={12} /> Manage & Edit Tables ({currentPage.tables?.length || 0})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2: KEY STATS */}
          {activeSubTab === "stats" && (
            <div>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Key numeric metrics rendered in top stat cards
                </span>
                <button
                  onClick={() => {
                    const newStats = [...(currentPage.stats || []), { num: "100+", label: "Metric Title", color: "#003190", icon: "chart" }];
                    const updated = { ...currentPage, stats: newStats };
                    setCurrentPage(updated);
                    syncLocalOverride(updated);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                >
                  <FaPlus size={10} /> Add Stat Card
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
                {currentPage.stats?.map((st, idx) => (
                  <div key={idx} style={{ background: "#172033", border: "1px solid #1f2937", borderRadius: 10, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>CARD #{idx + 1}</span>
                      <button
                        onClick={() => {
                          const newStats = currentPage.stats.filter((_, i) => i !== idx);
                          const updated = { ...currentPage, stats: newStats };
                          setCurrentPage(updated);
                          syncLocalOverride(updated);
                        }}
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Number / Value</label>
                      <input
                        value={st.num || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentPage((prev) => {
                            const copy = [...prev.stats];
                            copy[idx] = { ...copy[idx], num: val };
                            return { ...prev, stats: copy };
                          });
                        }}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Label Description</label>
                      <input
                        value={st.label || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentPage((prev) => {
                            const copy = [...prev.stats];
                            copy[idx] = { ...copy[idx], label: val };
                            return { ...prev, stats: copy };
                          });
                        }}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Color</label>
                        <select
                          value={st.color || "#003190"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentPage((prev) => {
                              const copy = [...prev.stats];
                              copy[idx] = { ...copy[idx], color: val };
                              return { ...prev, stats: copy };
                            });
                          }}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#fff", fontSize: "0.8rem", boxSizing: "border-box" }}
                        >
                          {STAT_COLOR_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Icon</label>
                        <select
                          value={st.icon || "chart"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentPage((prev) => {
                              const copy = [...prev.stats];
                              copy[idx] = { ...copy[idx], icon: val };
                              return { ...prev, stats: copy };
                            });
                          }}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#fff", fontSize: "0.8rem", boxSizing: "border-box" }}
                        >
                          {STAT_ICON_OPTIONS.map((ico) => (
                            <option key={ico.id} value={ico.id}>{ico.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 3: PARAGRAPHS */}
          {activeSubTab === "paragraphs" && (
            <div>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Main descriptive body paragraphs (HTML markup allowed)
                </span>
                <button
                  onClick={() => {
                    const newParas = [...(currentPage.paragraphs || []), "Enter new paragraph text here..."];
                    const updated = { ...currentPage, paragraphs: newParas };
                    setCurrentPage(updated);
                    syncLocalOverride(updated);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                >
                  <FaPlus size={10} /> Add Paragraph
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {currentPage.paragraphs?.map((pText, idx) => (
                  <div key={idx} style={{ background: "#172033", border: "1px solid #1f2937", borderRadius: 10, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>PARAGRAPH #{idx + 1}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        {idx > 0 && (
                          <button
                            onClick={() => {
                              const copy = [...currentPage.paragraphs];
                              const tmp = copy[idx];
                              copy[idx] = copy[idx - 1];
                              copy[idx - 1] = tmp;
                              const updated = { ...currentPage, paragraphs: copy };
                              setCurrentPage(updated);
                              syncLocalOverride(updated);
                            }}
                            title="Move Up"
                            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                          >
                            <FaArrowUp size={11} />
                          </button>
                        )}
                        {idx < currentPage.paragraphs.length - 1 && (
                          <button
                            onClick={() => {
                              const copy = [...currentPage.paragraphs];
                              const tmp = copy[idx];
                              copy[idx] = copy[idx + 1];
                              copy[idx + 1] = tmp;
                              const updated = { ...currentPage, paragraphs: copy };
                              setCurrentPage(updated);
                              syncLocalOverride(updated);
                            }}
                            title="Move Down"
                            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                          >
                            <FaArrowDown size={11} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const newParas = currentPage.paragraphs.filter((_, i) => i !== idx);
                            const updated = { ...currentPage, paragraphs: newParas };
                            setCurrentPage(updated);
                            syncLocalOverride(updated);
                          }}
                          style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      value={typeof pText === "string" ? pText : (pText?.text || "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentPage((prev) => {
                          const copy = [...prev.paragraphs];
                          copy[idx] = val;
                          return { ...prev, paragraphs: copy };
                        });
                      }}
                      style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#0f172a", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", lineHeight: 1.6, boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 4: IMAGES & SCANS (WITH FULL EDIT OPTION) */}
          {activeSubTab === "images" && (
            <div>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Archival field scans, maps, and photographic documentation
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    ref={imageFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => imageFileRef.current?.click()}
                    disabled={uploadingImage}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#0284c7", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaCloudUploadAlt size={12} /> {uploadingImage ? "Uploading…" : "Upload Image"}
                  </button>
                  <button
                    onClick={() => {
                      const url = window.prompt("Enter image URL or path (e.g. /uploads/image.jpg):");
                      if (url) {
                        const newImg = { url, src: url, name: "Image Record", caption: "Archival Record", alt: "Archival Record" };
                        const updated = {
                          ...currentPage,
                          images: [...currentPage.images, newImg]
                        };
                        setCurrentPage(updated);
                        syncLocalOverride(updated);
                        onShowToast("Image added!", "success");
                      }
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaPlus size={10} /> Add by URL
                  </button>
                </div>
              </div>

              {currentPage.images && currentPage.images.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
                  {currentPage.images.map((img, idx) => {
                    const imgSrc = img.url || img.src || "";
                    const imgCaption = img.caption || img.name || `Image #${idx + 1}`;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: "#172033",
                          border: "1px solid #1f2937",
                          borderRadius: 12,
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)"
                        }}
                      >
                        {/* Image Preview Box with Action Overlay */}
                        <div style={{ position: "relative", height: 160, background: "#0f172a", overflow: "hidden" }}>
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={img.alt || imgCaption}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                              <FaImages size={32} />
                            </div>
                          )}

                          {/* Top-Left: Badge */}
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              background: "rgba(0,0,0,0.75)",
                              backdropFilter: "blur(4px)",
                              color: "#38bdf8",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: "0.72rem",
                              fontWeight: 700
                            }}
                          >
                            Image #{idx + 1}
                          </div>

                          {/* Top-Right: Quick Edit & Delete icons */}
                          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                            <button
                              onClick={() => openEditImageModal(img, idx)}
                              title="Edit Image Details & Replace"
                              style={{
                                background: "rgba(2, 132, 199, 0.9)",
                                border: "none",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                              }}
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => {
                                const newImages = currentPage.images.filter((_, i) => i !== idx);
                                const updated = { ...currentPage, images: newImages };
                                setCurrentPage(updated);
                                syncLocalOverride(updated);
                                onShowToast("Image removed", "info");
                              }}
                              title="Delete Image"
                              style={{
                                background: "rgba(239, 68, 68, 0.9)",
                                border: "none",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                              }}
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Image Meta & Controls */}
                        <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                          {/* Caption Input */}
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block", marginBottom: 3 }}>
                              Caption / Title
                            </label>
                            <input
                              placeholder="Image Caption"
                              value={img.caption || img.name || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentPage((prev) => {
                                  const copy = [...prev.images];
                                  copy[idx] = { ...copy[idx], caption: val, name: val };
                                  return { ...prev, images: copy };
                                });
                              }}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                borderRadius: 6,
                                background: "#0f172a",
                                border: "1px solid #334155",
                                color: "#fff",
                                fontSize: "0.82rem",
                                boxSizing: "border-box"
                              }}
                            />
                          </div>

                          {/* Image Path preview */}
                          <div
                            style={{
                              background: "#0b0f17",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: "0.72rem",
                              color: "#64748b",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }} title={imgSrc}>
                              {imgSrc || "No URL"}
                            </span>
                            {imgSrc && (
                              <a
                                href={imgSrc}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.7rem", fontWeight: 700 }}
                              >
                                View
                              </a>
                            )}
                          </div>

                          {/* Action Buttons: Prominent EDIT and DELETE */}
                          <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                            <button
                              onClick={() => openEditImageModal(img, idx)}
                              style={{
                                flex: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "7px 12px",
                                borderRadius: 6,
                                background: "#1e293b",
                                border: "1px solid #0284c7",
                                color: "#38bdf8",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <FaEdit size={12} /> Edit Image
                            </button>
                            <button
                              onClick={() => {
                                const newImages = currentPage.images.filter((_, i) => i !== idx);
                                const updated = { ...currentPage, images: newImages };
                                setCurrentPage(updated);
                                syncLocalOverride(updated);
                                onShowToast("Image removed", "info");
                              }}
                              title="Delete Image"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                padding: "7px 10px",
                                borderRadius: 6,
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#f87171",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: "#172033", border: "1px dashed #334155", borderRadius: 12, padding: 36, textAlign: "center", color: "#94a3b8" }}>
                  <FaImages size={36} style={{ color: "#475569", marginBottom: 10 }} />
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.9rem" }}>No images or archival scans attached to this page.</p>
                  <button
                    onClick={() => imageFileRef.current?.click()}
                    style={{ background: "#0284c7", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaCloudUploadAlt size={12} /> Upload First Image
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 5: PDF DOWNLOADS (WITH FULL EDIT OPTION) */}
          {activeSubTab === "downloads" && (
            <div>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Attached statutory Acts, Government Orders, and gazettes in PDF
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    ref={docFileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    onChange={handleDocUpload}
                  />
                  <button
                    onClick={() => docFileRef.current?.click()}
                    disabled={uploadingDoc}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#059669", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaCloudUploadAlt size={12} /> {uploadingDoc ? "Uploading…" : "Upload PDF"}
                  </button>
                  <button
                    onClick={() => {
                      const file = window.prompt("Enter PDF document path (e.g. /uploads/document.pdf):");
                      if (file) {
                        const title = window.prompt("Enter Document Title:") || "Official Document";
                        const newDoc = { title, file, meta: "Official Gazette", fileSize: "Official PDF" };
                        const updated = {
                          ...currentPage,
                          downloads: [...currentPage.downloads, newDoc]
                        };
                        setCurrentPage(updated);
                        syncLocalOverride(updated);
                        onShowToast("Document added!", "success");
                      }
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaPlus size={10} /> Add by URL
                  </button>
                </div>
              </div>

              {currentPage.downloads && currentPage.downloads.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {currentPage.downloads.map((doc, idx) => (
                    <div
                      key={idx}
                      className="adm-res-doc-item"
                      style={{
                        background: "#172033",
                        border: "1px solid #1f2937",
                        borderRadius: 10,
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 14,
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                        <span style={{ color: "#ef4444", fontSize: "1.6rem", flexShrink: 0 }}>📄</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#fff", marginBottom: 4 }}>
                            {doc.title || `Document #${idx + 1}`}
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.78rem", color: "#94a3b8", flexWrap: "wrap" }}>
                            <span>{doc.meta || "Official PDF"}</span>
                            <span>•</span>
                            <span style={{ color: "#38bdf8" }}>{doc.fileSize || "PDF"}</span>
                            {doc.file && (
                              <>
                                <span>•</span>
                                <span style={{ fontFamily: "monospace", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220, whiteSpace: "nowrap" }}>
                                  {doc.file}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: View, Edit, Delete */}
                      <div className="adm-res-doc-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {doc.file && (
                          <a
                            href={doc.file}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: "7px 12px",
                              borderRadius: 6,
                              background: "#1e293b",
                              border: "1px solid #334155",
                              color: "#cbd5e1",
                              fontSize: "0.8rem",
                              textDecoration: "none",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}
                          >
                            <FaEye size={11} /> View
                          </a>
                        )}
                        <button
                          onClick={() => openEditDocModal(doc, idx)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 14px",
                            borderRadius: 6,
                            background: "#1e293b",
                            border: "1px solid #0284c7",
                            color: "#38bdf8",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          <FaEdit size={11} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            const newDocs = currentPage.downloads.filter((_, i) => i !== idx);
                            const updated = { ...currentPage, downloads: newDocs };
                            setCurrentPage(updated);
                            syncLocalOverride(updated);
                            onShowToast("Document removed", "info");
                          }}
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#f87171",
                            padding: "7px 10px",
                            borderRadius: 6,
                            cursor: "pointer"
                          }}
                          title="Delete Document"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#172033", border: "1px dashed #334155", borderRadius: 12, padding: 36, textAlign: "center", color: "#94a3b8" }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.9rem" }}>No statutory Acts or PDF documents attached.</p>
                  <button
                    onClick={() => docFileRef.current?.click()}
                    style={{ background: "#059669", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaCloudUploadAlt size={12} /> Upload First PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 6: TABLES */}
          {activeSubTab === "tables" && (
            <div>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem", color: "#fff", fontWeight: 700 }}>
                    {isQuickLinks ? "Official Government Portals Directory Table" : "Tabular Registers & Data Tables"}
                  </h4>
                  <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                    {isQuickLinks
                      ? "Direct directory links and government authorities for Polavaram R&R, Giribhumi, ITDAs, and MoTA"
                      : "Tabular registers, statutory schedules, and survey matrices"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(isQuickLinks || selectedSlug === "quick-links" || (!currentPage.tables || currentPage.tables.length === 0)) && (
                    <button
                      type="button"
                      onClick={() => {
                        const defaultQuick = DEFAULT_QUICK_LINKS_PAGES[0];
                        if (defaultQuick && defaultQuick.tables) {
                          const updated = {
                            ...currentPage,
                            tables: JSON.parse(JSON.stringify(defaultQuick.tables))
                          };
                          setCurrentPage(updated);
                          syncLocalOverride(updated);
                          onShowToast("Restored 9 Official Government Portals Table! Remember to click 'Save Changes'.", "success");
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(56, 189, 248, 0.15)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        color: "#38bdf8",
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      <FaUndo size={11} /> Restore 9 Official Portals Table
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newTables = [
                        ...(currentPage.tables || []),
                        {
                          title: "New Data Table",
                          headers: ["Column 1", "Column 2", "Column 3"],
                          rows: [["Data 1", "Data 2", "Data 3"]]
                        }
                      ];
                      const updated = { ...currentPage, tables: newTables };
                      setCurrentPage(updated);
                      syncLocalOverride(updated);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaPlus size={10} /> Add Table
                  </button>
                </div>
              </div>

              {(!currentPage.tables || currentPage.tables.length === 0) ? (
                <div style={{ background: "#172033", border: "1px dashed #334155", borderRadius: 12, padding: "36px 20px", textAlign: "center" }}>
                  <FaTable size={32} style={{ color: "#64748b", marginBottom: 12 }} />
                  <h5 style={{ color: "#e2e8f0", fontSize: "1rem", margin: "0 0 6px 0" }}>No Data Tables Configured Yet</h5>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", maxWidth: 460, margin: "0 auto 16px auto" }}>
                    {isQuickLinks
                      ? "Click below to automatically create and populate the 9 official state and central government portals directory table."
                      : "Add a structured table to display administrative registers, schedules, or records on this page."}
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultQuick = DEFAULT_QUICK_LINKS_PAGES[0];
                        const t = (isQuickLinks && defaultQuick?.tables)
                          ? JSON.parse(JSON.stringify(defaultQuick.tables))
                          : [{ title: "Records Table", headers: ["Department / Portal", "Authority", "Direct Access Link"], rows: [["Giribhumi Land Records Portal", "Government of Andhra Pradesh", "http://www.giribhumi.ap.gov.in/pages/dashboard.aspx"]] }];
                        const updated = { ...currentPage, tables: t };
                        setCurrentPage(updated);
                        syncLocalOverride(updated);
                        onShowToast("Table created!", "success");
                      }}
                      style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <FaPlus size={12} /> {isQuickLinks ? "Populate 9 Government Portals Table" : "Create First Table"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {currentPage.tables?.map((tbl, tIdx) => (
                    <div key={tIdx} style={{ background: "#172033", border: "1px solid #1f2937", borderRadius: 10, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                        <input
                          placeholder="Table Title"
                          value={tbl.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentPage((prev) => {
                              const copy = [...prev.tables];
                              copy[tIdx] = { ...copy[tIdx], title: val };
                              return { ...prev, tables: copy };
                            });
                          }}
                          style={{ fontSize: "0.95rem", fontWeight: 700, padding: "6px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#fff", minWidth: 260, flex: 1 }}
                        />
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {tbl.rows?.length || 0} rows • {tbl.headers?.length || 0} cols
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const colName = window.prompt("Enter new column name:") || "New Column";
                              setCurrentPage((prev) => {
                                const copy = [...prev.tables];
                                const t = { ...copy[tIdx] };
                                t.headers = [...(t.headers || []), colName];
                                t.rows = (t.rows || []).map((r) => [...r, ""]);
                                copy[tIdx] = t;
                                return { ...prev, tables: copy };
                              });
                            }}
                            style={{ padding: "4px 8px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            + Column
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPage((prev) => {
                                const copy = [...prev.tables];
                                const t = { ...copy[tIdx] };
                                const newRow = new Array((t.headers || []).length).fill("");
                                t.rows = [...(t.rows || []), newRow];
                                copy[tIdx] = t;
                                return { ...prev, tables: copy };
                              });
                            }}
                            style={{ padding: "4px 8px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#34d399", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            + Row
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this table?")) {
                                const newTables = currentPage.tables.filter((_, i) => i !== tIdx);
                                const updated = { ...currentPage, tables: newTables };
                                setCurrentPage(updated);
                                syncLocalOverride(updated);
                              }
                            }}
                            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: "4px 6px" }}
                            title="Delete Table"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>

                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                          <thead>
                            <tr>
                              {tbl.headers?.map((h, hIdx) => (
                                <th key={hIdx} style={{ background: "#0f172a", padding: "8px 10px", border: "1px solid #1f2937", color: "#94a3b8", textAlign: "left" }}>
                                  <input
                                    value={h}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setCurrentPage((prev) => {
                                        const copy = [...prev.tables];
                                        const t = { ...copy[tIdx] };
                                        t.headers = [...t.headers];
                                        t.headers[hIdx] = val;
                                        copy[tIdx] = t;
                                        return { ...prev, tables: copy };
                                      });
                                    }}
                                    style={{ background: "transparent", border: "none", color: "#38bdf8", fontWeight: 700, width: "100%" }}
                                  />
                                </th>
                              ))}
                              <th style={{ background: "#0f172a", border: "1px solid #1f2937", width: 36 }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {tbl.rows?.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => {
                                  const cellStr = String(cell || "").trim();
                                  const isUrl = cellStr.startsWith("http://") || cellStr.startsWith("https://");
                                  return (
                                    <td key={cIdx} style={{ padding: "6px 8px", border: "1px solid #1f2937" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <input
                                          value={cell || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setCurrentPage((prev) => {
                                              const copy = [...prev.tables];
                                              const t = { ...copy[tIdx] };
                                              t.rows = t.rows.map((r, ri) => (ri === rIdx ? r.map((c, ci) => (ci === cIdx ? val : c)) : r));
                                              copy[tIdx] = t;
                                              return { ...prev, tables: copy };
                                            });
                                          }}
                                          style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "5px 7px", borderRadius: 4, fontSize: "0.8rem", boxSizing: "border-box" }}
                                        />
                                        {isUrl && (
                                          <a
                                            href={cellStr}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Open / Test External Link"
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              width: 26,
                                              height: 26,
                                              borderRadius: 4,
                                              background: "rgba(56, 189, 248, 0.15)",
                                              border: "1px solid rgba(56, 189, 248, 0.4)",
                                              color: "#38bdf8",
                                              flexShrink: 0,
                                              textDecoration: "none"
                                            }}
                                          >
                                            <FaExternalLinkAlt size={10} />
                                          </a>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td style={{ border: "1px solid #1f2937", textAlign: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentPage((prev) => {
                                        const copy = [...prev.tables];
                                        const t = { ...copy[tIdx] };
                                        t.rows = t.rows.filter((_, ri) => ri !== rIdx);
                                        copy[tIdx] = t;
                                        return { ...prev, tables: copy };
                                      });
                                    }}
                                    style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "1rem" }}
                                    title="Delete Row"
                                  >
                                    ×
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

          {/* SUBTAB 7: VIDEOS (WITH FULL EDIT OPTION) */}
          {activeSubTab === "videos" && (
            <div>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Attached field documentaries, reels, and video interviews
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    ref={videoFileRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    style={{ display: "none" }}
                    onChange={handleVideoUpload}
                  />
                  <button
                    onClick={() => videoFileRef.current?.click()}
                    disabled={uploadingVideo}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#dc2626", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaCloudUploadAlt size={12} /> {uploadingVideo ? "Uploading…" : "Upload Video"}
                  </button>
                  <button
                    onClick={() => {
                      const url = window.prompt("Enter video URL or YouTube embed:");
                      if (url) {
                        const title = window.prompt("Enter video title:") || "Field Video";
                        const newVid = { url, title, description: "Official Video" };
                        const updated = {
                          ...currentPage,
                          videos: [...currentPage.videos, newVid]
                        };
                        setCurrentPage(updated);
                        syncLocalOverride(updated);
                        onShowToast("Video added!", "success");
                      }
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaPlus size={10} /> Add by URL
                  </button>
                </div>
              </div>

              {currentPage.videos && currentPage.videos.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                  {currentPage.videos.map((vid, idx) => (
                    <div key={idx} style={{ background: "#172033", border: "1px solid #1f2937", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 700 }}>VIDEO #{idx + 1}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => openEditVideoModal(vid, idx)}
                            title="Edit Video"
                            style={{ background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", borderRadius: 4, padding: "3px 6px", cursor: "pointer", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <FaEdit size={10} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              const newVideos = currentPage.videos.filter((_, i) => i !== idx);
                              const updated = { ...currentPage, videos: newVideos };
                              setCurrentPage(updated);
                              syncLocalOverride(updated);
                              onShowToast("Video removed", "info");
                            }}
                            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>
                        {vid.title || `Video #${idx + 1}`}
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={vid.url}>
                        {vid.url}
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 6 }}>
                        <button
                          onClick={() => openEditVideoModal(vid, idx)}
                          style={{
                            flex: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: 6,
                            background: "#1e293b",
                            border: "1px solid #0284c7",
                            color: "#38bdf8",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          <FaEdit size={11} /> Edit Video
                        </button>
                        {vid.url && (
                          <a
                            href={vid.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: "rgba(220, 38, 38, 0.2)",
                              border: "1px solid rgba(220, 38, 38, 0.4)",
                              color: "#fca5a5",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none"
                            }}
                          >
                            <FaPlay size={9} /> Play
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#172033", border: "1px dashed #334155", borderRadius: 12, padding: 36, textAlign: "center", color: "#94a3b8" }}>
                  <FaVideo size={36} style={{ color: "#475569", marginBottom: 10 }} />
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.9rem" }}>No video clips attached to this page.</p>
                  <button
                    onClick={() => videoFileRef.current?.click()}
                    style={{ background: "#dc2626", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    <FaCloudUploadAlt size={12} /> Upload First Video
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: "#111827", borderRadius: 14, border: "1px solid #1f2937", padding: 40, textAlign: "center", color: "#94a3b8" }}>
          Select a page on the left to start editing.
        </div>
      )}

      {/* ── MODAL: EDIT IMAGE / ARCHIVAL SCAN ── */}
      {editingImageModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            className="adm-res-modal"
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 14,
              width: "100%",
              maxWidth: 580,
              padding: 24,
              color: "#fff",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #1f2937", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem" }}>🖼️</span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                  Edit Image & Archival Scan
                </h3>
              </div>
              <button
                onClick={() => setEditingImageModal({ isOpen: false, index: -1, form: { url: "", name: "", caption: "", alt: "" } })}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveImageModal} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Preview Thumbnail */}
              <div className="adm-img-preview-row" style={{ display: "flex", gap: 16, alignItems: "center", background: "#0b0f17", padding: 12, borderRadius: 10, border: "1px solid #1f2937" }}>
                <div className="adm-img-preview-thumb" style={{ width: 120, height: 90, background: "#020617", borderRadius: 8, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                  {editingImageModal.form.url ? (
                    <img
                      src={editingImageModal.form.url}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                      <FaImages size={28} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>Replace Image File:</div>
                  <input
                    ref={replaceImageFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleReplaceImageUpload}
                  />
                  <button
                    type="button"
                    className="adm-img-upload-btn"
                    onClick={() => replaceImageFileRef.current?.click()}
                    disabled={isUploadingReplaceImage}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#0284c7",
                      border: "none",
                      color: "#fff",
                      padding: "7px 14px",
                      borderRadius: 6,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      cursor: isUploadingReplaceImage ? "not-allowed" : "pointer"
                    }}
                  >
                    <FaCloudUploadAlt size={13} /> {isUploadingReplaceImage ? "Uploading…" : "Upload New File"}
                  </button>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
                    Supports JPG, PNG, WEBP, archival scans
                  </div>
                </div>
              </div>

              {/* Image URL Input */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Image URL / File Path *
                </label>
                <input
                  required
                  placeholder="/uploads/grievance-scan.jpg or https://..."
                  value={editingImageModal.form.url}
                  onChange={(e) => setEditingImageModal((prev) => ({ ...prev, form: { ...prev.form, url: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              {/* Title / Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Image Title / Label
                </label>
                <input
                  placeholder="e.g. Grievance All Table / Submergence Map"
                  value={editingImageModal.form.name}
                  onChange={(e) => setEditingImageModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              {/* Caption */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Caption (displayed on public card)
                </label>
                <input
                  placeholder="e.g. Archival field representation scan"
                  value={editingImageModal.form.caption}
                  onChange={(e) => setEditingImageModal((prev) => ({ ...prev, form: { ...prev.form, caption: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              {/* Alt Text */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Alt Description (Accessibility & SEO)
                </label>
                <input
                  placeholder="e.g. Scan of PAF compensation settlement register"
                  value={editingImageModal.form.alt}
                  onChange={(e) => setEditingImageModal((prev) => ({ ...prev, form: { ...prev.form, alt: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              {/* Modal Actions */}
              <div className="adm-res-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, borderTop: "1px solid #1f2937", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setEditingImageModal({ isOpen: false, index: -1, form: { url: "", name: "", caption: "", alt: "" } })}
                  style={{ padding: "8px 16px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 22px", borderRadius: 6, background: "#0284c7", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                >
                  <FaSave size={12} /> Save Image Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PDF DOCUMENT ── */}
      {editingDocModal.isOpen && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div className="adm-res-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, width: "100%", maxWidth: 540, padding: 24, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #1f2937", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem", color: "#ef4444" }}>📄</span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                  Edit PDF Document
                </h3>
              </div>
              <button
                onClick={() => setEditingDocModal({ isOpen: false, index: -1, form: { title: "", file: "", meta: "", fileSize: "" } })}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDocModal} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Document Title *
                </label>
                <input
                  required
                  placeholder="e.g. Right to Fair Compensation and Transparency in Land Acquisition"
                  value={editingDocModal.form.title}
                  onChange={(e) => setEditingDocModal((prev) => ({ ...prev, form: { ...prev.form, title: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              {/* Upload Replacement File */}
              <div style={{ background: "#0b0f17", padding: 12, borderRadius: 8, border: "1px solid #1f2937" }}>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>Replace PDF File:</div>
                <input
                  ref={replaceDocFileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onChange={handleReplaceDocUpload}
                />
                <button
                  type="button"
                  onClick={() => replaceDocFileRef.current?.click()}
                  disabled={isUploadingReplaceDoc}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#059669",
                    border: "none",
                    color: "#fff",
                    padding: "7px 14px",
                    borderRadius: 6,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: isUploadingReplaceDoc ? "not-allowed" : "pointer"
                  }}
                >
                  <FaCloudUploadAlt size={13} /> {isUploadingReplaceDoc ? "Uploading…" : "Upload New PDF"}
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  PDF File URL / Path
                </label>
                <input
                  placeholder="/uploads/downloads/act-2013.pdf"
                  value={editingDocModal.form.file}
                  onChange={(e) => setEditingDocModal((prev) => ({ ...prev, form: { ...prev.form, file: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div className="adm-res-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                    Meta Description
                  </label>
                  <input
                    placeholder="e.g. Official Gazette Act 30 of 2013"
                    value={editingDocModal.form.meta}
                    onChange={(e) => setEditingDocModal((prev) => ({ ...prev, form: { ...prev.form, meta: e.target.value } }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                    File Size Label
                  </label>
                  <input
                    placeholder="e.g. 2.4 MB"
                    value={editingDocModal.form.fileSize}
                    onChange={(e) => setEditingDocModal((prev) => ({ ...prev, form: { ...prev.form, fileSize: e.target.value } }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div className="adm-res-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, borderTop: "1px solid #1f2937", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setEditingDocModal({ isOpen: false, index: -1, form: { title: "", file: "", meta: "", fileSize: "" } })}
                  style={{ padding: "8px 16px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 22px", borderRadius: 6, background: "#059669", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                >
                  <FaSave size={12} /> Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT VIDEO ── */}
      {editingVideoModal.isOpen && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div className="adm-res-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, width: "100%", maxWidth: 540, padding: 24, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #1f2937", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem", color: "#ef4444" }}>🎬</span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                  Edit Field Video
                </h3>
              </div>
              <button
                onClick={() => setEditingVideoModal({ isOpen: false, index: -1, form: { title: "", url: "", description: "" } })}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveVideoModal} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Video Title *
                </label>
                <input
                  required
                  placeholder="e.g. Field Hearing at Submergence Hamlet"
                  value={editingVideoModal.form.title}
                  onChange={(e) => setEditingVideoModal((prev) => ({ ...prev, form: { ...prev.form, title: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              {/* Upload Replacement Video */}
              <div style={{ background: "#0b0f17", padding: 12, borderRadius: 8, border: "1px solid #1f2937" }}>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>Replace Video File:</div>
                <input
                  ref={replaceVideoFileRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  style={{ display: "none" }}
                  onChange={handleReplaceVideoUpload}
                />
                <button
                  type="button"
                  onClick={() => replaceVideoFileRef.current?.click()}
                  disabled={isUploadingReplaceVideo}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#dc2626",
                    border: "none",
                    color: "#fff",
                    padding: "7px 14px",
                    borderRadius: 6,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: isUploadingReplaceVideo ? "not-allowed" : "pointer"
                  }}
                >
                  <FaCloudUploadAlt size={13} /> {isUploadingReplaceVideo ? "Uploading…" : "Upload New Video"}
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Video URL / YouTube Embed *
                </label>
                <input
                  required
                  placeholder="/uploads/videos/field-reel.mp4 or https://www.youtube.com/embed/..."
                  value={editingVideoModal.form.url}
                  onChange={(e) => setEditingVideoModal((prev) => ({ ...prev, form: { ...prev.form, url: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
                  Description / Topic
                </label>
                <textarea
                  rows={2}
                  placeholder="Official Documentary clip"
                  value={editingVideoModal.form.description}
                  onChange={(e) => setEditingVideoModal((prev) => ({ ...prev, form: { ...prev.form, description: e.target.value } }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div className="adm-res-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, borderTop: "1px solid #1f2937", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setEditingVideoModal({ isOpen: false, index: -1, form: { title: "", url: "", description: "" } })}
                  style={{ padding: "8px 16px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 22px", borderRadius: 6, background: "#dc2626", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                >
                  <FaSave size={12} /> Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PAGE DETAILS / META ── */}
      {showEditPageModal && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div className="adm-res-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, width: "100%", maxWidth: 540, padding: 24, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #1f2937", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.2rem" }}>⚙️</span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  Edit Page Information & Navigation
                </h3>
              </div>
              <button
                onClick={() => setShowEditPageModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePageMeta} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                  Page Title *
                </label>
                <input
                  required
                  value={pageMetaForm.title}
                  onChange={(e) => setPageMetaForm({ ...pageMetaForm, title: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div className="adm-res-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                    URL Slug (/{pageMetaForm.slug})
                  </label>
                  <input
                    disabled
                    value={pageMetaForm.slug}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, background: "#0b0f17", border: "1px solid #1f2937", color: "#64748b", fontSize: "0.88rem", boxSizing: "border-box", cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                    Navbar Label
                  </label>
                  <input
                    value={pageMetaForm.nav_label}
                    onChange={(e) => setPageMetaForm({ ...pageMetaForm, nav_label: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div className="adm-res-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                    Category Tag
                  </label>
                  <input
                    value={pageMetaForm.category}
                    onChange={(e) => setPageMetaForm({ ...pageMetaForm, category: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                    Badge Header Pill
                  </label>
                  <input
                    value={pageMetaForm.badge}
                    onChange={(e) => setPageMetaForm({ ...pageMetaForm, badge: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                  Subtitle / Lead Summary
                </label>
                <textarea
                  rows={2}
                  value={pageMetaForm.subtitle}
                  onChange={(e) => setPageMetaForm({ ...pageMetaForm, subtitle: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div className="adm-res-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, borderTop: "1px solid #1f2937", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowEditPageModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: 6, background: isGrievance ? "#f59e0b" : "#10b981", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Update Page Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW PAGE ── */}
      {showAddPageModal && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div className="adm-res-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, width: "100%", maxWidth: 520, padding: 24, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                {isQuickLinks ? "➕ Add New Quick Links Page" : (isGrievance ? "➕ Add New Grievance Page" : "➕ Add New Download Page")}
              </h3>
              <button
                onClick={() => setShowAddPageModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePage} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                  Page Title *
                </label>
                <input
                  required
                  placeholder="e.g. Submergence Land Claims"
                  value={newPageForm.title}
                  onChange={(e) => setNewPageForm({ ...newPageForm, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                  Page Slug (URL identifier, e.g. /my-new-page)
                </label>
                <input
                  placeholder="Leave blank to auto-generate from title"
                  value={newPageForm.slug}
                  onChange={(e) => setNewPageForm({ ...newPageForm, slug: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                  Navbar Label
                </label>
                <input
                  placeholder="Short label for navigation"
                  value={newPageForm.nav_label}
                  onChange={(e) => setNewPageForm({ ...newPageForm, nav_label: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 4 }}>
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief lead summary"
                  value={newPageForm.subtitle}
                  onChange={(e) => setNewPageForm({ ...newPageForm, subtitle: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#172033", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", boxSizing: "border-box" }}
                />
              </div>

              <div className="adm-res-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: 6, background: isQuickLinks ? "#0284c7" : (isGrievance ? "#f59e0b" : "#10b981"), border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE ── */}
      {deleteTargetSlug && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div className="adm-res-modal" style={{ background: "#111827", border: "1px solid #7f1d1d", borderRadius: 14, width: "100%", maxWidth: 420, padding: 24, color: "#fff", textAlign: "center" }}>
            <FaExclamationTriangle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 8px 0" }}>
              Delete Page /{deleteTargetSlug}?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: 20 }}>
              This will remove this page from the public site and admin repository. This action cannot be undone.
            </p>
            <div className="adm-res-modal-footer" style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                onClick={() => setDeleteTargetSlug(null)}
                style={{ padding: "8px 16px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePage}
                style={{ padding: "8px 20px", borderRadius: 6, background: "#dc2626", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
