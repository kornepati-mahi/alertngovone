import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen, FaSearch, FaPlus, FaTrash, FaEdit, FaSave, FaExternalLinkAlt,
  FaCheck, FaTimes, FaCloudUploadAlt, FaVideo, FaImages, FaCheckCircle,
  FaExclamationTriangle, FaSyncAlt, FaMapMarkerAlt, FaTag, FaPlay, FaLink,
  FaArrowUp, FaArrowDown, FaEye, FaLayerGroup, FaFilter, FaSlidersH, FaHeart,
  FaShieldAlt, FaUndo, FaArrowRight, FaBullhorn
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminListStories,
  adminCreateStory,
  adminUpdateStory,
  adminDeleteStory,
  adminReorderStories,
  adminSeedStories,
  adminSaveStoriesSettings,
  adminUploadImage,
  adminUploadVideo,
  API_BASE
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";
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
  s3_programme_links: [
    { label: "Forest Rights (RoFR & LTR)", cat: "Forest Rights" },
    { label: "PESA & Self-Governance", cat: "Governance" },
    { label: "Polavaram LA & R&R", cat: "Polavaram PIP" },
    { label: "Antyodaya Women Cooperatives", cat: "Women Cooperatives" },
    { label: "Child Interventions & Bare Acts", cat: "Child Rights" },
    { label: "Flood Relief Operations", cat: "Disaster Relief" },
    { label: "Solar & Clean Energy", cat: "Clean Energy" },
    { label: "Indigenous Millets & Seed Banks", cat: "Agriculture" }
  ],

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

const defaultFieldNotesList = [
  {
    story_type: "field_note",
    tag: "Governance",
    place: "Rampachodavaram",
    title: "A panchayat that now keeps its own minutes",
    body: "Training in statutory meetings, record keeping and PESA powers meant the difference between a Gram Sabha that was informed and one that decided.",
    sort_order: 7,
    is_active: 1
  },
  {
    story_type: "field_note",
    tag: "Land Rights",
    place: "Buttayigudem",
    title: "Land sold under a forged bond, recovered on paper",
    body: "Alienated tribal land was traced through revenue records, challenged under the Land Transfer Regulation, and restored to the family that had lost it.",
    sort_order: 8,
    is_active: 1
  },
  {
    story_type: "field_note",
    tag: "Livelihoods",
    place: "Ramavarampadu",
    title: "Seeds the village keeps, not buys",
    body: "A community seed bank of native millets and pulses returns every season, with farmer stewards maintaining germination and variety.",
    sort_order: 9,
    is_active: 1
  },
  {
    story_type: "field_note",
    tag: "Identity",
    place: "Koduru",
    title: "Aadhaar, ration card, voter ID — in one camp day",
    body: "Nomadic families excluded from the welfare net were documented in a civil rights camp, opening pensions, ration and school enrolment.",
    sort_order: 10,
    is_active: 1
  }
];

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

const TAG_COLORS = {
  "Forest Rights": { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#6ee7b7" },
  "Women Cooperatives": { bg: "rgba(236, 72, 153, 0.15)", border: "#ec4899", text: "#f472b6" },
  "Child Rights": { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", text: "#93c5fd" },
  "Clean Energy": { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#fcd34d" },
  "Disaster Relief": { bg: "rgba(2, 132, 199, 0.15)", border: "#0284c7", text: "#7dd3fc" },
  "Polavaram LA & R&R": { bg: "rgba(210, 25, 12, 0.15)", border: "#ef4444", text: "#fca5a5" },
  "Governance": { bg: "rgba(139, 92, 246, 0.15)", border: "#8b5cf6", text: "#c4b5fd" },
  "Land Rights": { bg: "rgba(20, 184, 166, 0.15)", border: "#14b8a6", text: "#5eead4" },
  "Livelihoods": { bg: "rgba(234, 88, 12, 0.15)", border: "#ea580c", text: "#fdba74" },
  "Identity": { bg: "rgba(100, 116, 139, 0.15)", border: "#64748b", text: "#cbd5e1" }
};

export default function AdminStories() {
  const [adminKey, setAdminKey] = useState("");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsSummary, setStatsSummary] = useState({
    total_stories: 0,
    featured_count: 0,
    field_notes_count: 0,
    video_stories_count: 0,
    photo_stories_count: 0
  });

  // Main Navigation Tabs: 's1' (Featured), 's2' (Field Notes), 's3' (Programme Pills), 'cta' (Call to Action), 'all' (Master Directory)
  const [activeMainTab, setActiveMainTab] = useState("s1");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
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

  // State for adding pills in Tab 3
  const [newPill, setNewPill] = useState({ label: "", cat: "" });

  // State for adding trust badge in Tab 4
  const [newTrustText, setNewTrustText] = useState("");

  // Filter & Search
  const [activeTypeTab, setActiveTypeTab] = useState("all"); // 'all', 'featured', 'field_note'
  const [search, setSearch] = useState("");

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Add / Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState(null); // null = new, number = edit
  const [formData, setFormData] = useState({
    story_type: "featured",
    tag: "Forest Rights",
    place: "",
    title: "",
    body: "",
    outcome: "",
    media_type: "image",
    img: "",
    video_url: "",
    sort_order: 0,
    is_active: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-sync Modal
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Video Upload States inside Story Modal
  const [vidModalMode, setVidModalMode] = useState("upload"); // 'upload', 'url'
  const [selectedVidFile, setSelectedVidFile] = useState(null);
  const [selectedVidPreview, setSelectedVidPreview] = useState("");
  const [uploadedVidUrl, setUploadedVidUrl] = useState("");
  const [vidUploadProgress, setVidUploadProgress] = useState({ percent: 0, loaded: 0, total: 0 });
  const [isUploadingVid, setIsUploadingVid] = useState(false);
  const [uploadVidError, setUploadVidError] = useState("");
  const vidFileInputRef = useRef(null);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showEditModal || deleteTarget || showSyncModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showEditModal, deleteTarget, showSyncModal]);

  // Image Upload Ref inside Story Modal
  const imageInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Init Auth Key
  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
  }, []);

  // Sync Local Storage and notify public views
  const syncStoriesCache = useCallback((allStories, newSettings = null) => {
    try {
      localStorage.setItem("alertngo_stories_all", JSON.stringify(allStories));
      const featured = allStories.filter(
        (s) => s.story_type !== "field_note" && (s.is_active === 1 || s.is_active === true || s.is_active === "1")
      );
      const fieldNotes = allStories.filter(
        (s) => s.story_type === "field_note" && (s.is_active === 1 || s.is_active === true || s.is_active === "1")
      );
      localStorage.setItem("alertngo_stories_featured", JSON.stringify(featured));
      localStorage.setItem("alertngo_stories_field_notes", JSON.stringify(fieldNotes));
      if (newSettings) {
        localStorage.setItem(STORIES_SETTINGS_CACHE_KEY, JSON.stringify(newSettings));
      }
      window.dispatchEvent(new Event("alertngo_stories_updated"));
    } catch (e) {}
  }, []);

  // Load Stories & Settings
  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const res = await adminListStories(key);
      if (res && res.success && Array.isArray(res.data)) {
        let currentStories = res.data;
        const hasFieldNotes = currentStories.some((s) => s.story_type === "field_note");
        if (!hasFieldNotes && currentStories.length > 0) {
          try {
            for (const fn of defaultFieldNotesList) {
              await adminCreateStory(key, fn);
            }
            const reloaded = await adminListStories(key);
            if (reloaded?.success && Array.isArray(reloaded.data)) {
              currentStories = reloaded.data;
              if (reloaded.stats_summary) setStatsSummary(reloaded.stats_summary);
            }
          } catch {}
        }
        setStories(currentStories);
        if (res.stats_summary) {
          setStatsSummary(res.stats_summary);
        }
        let mergedSettings = defaultStoriesSettings;
        if (res.settings && typeof res.settings === "object") {
          const s = res.settings;
          mergedSettings = {
            ...defaultStoriesSettings,
            ...s,
            s3_programme_links: Array.isArray(s.s3_programme_links)
              ? s.s3_programme_links
              : (typeof s.s3_programme_links === "string" ? JSON.parse(s.s3_programme_links) : defaultStoriesSettings.s3_programme_links),
            cta_trust_items: Array.isArray(s.cta_trust_items)
              ? s.cta_trust_items
              : (typeof s.cta_trust_items === "string" ? JSON.parse(s.cta_trust_items) : defaultStoriesSettings.cta_trust_items)
          };
          setPageSettings(mergedSettings);
        }
        syncStoriesCache(currentStories, mergedSettings);
      } else {
        showToast(res?.message || "Failed to load stories", "error");
      }
    } catch (err) {
      showToast(err.message || "Network error loading stories", "error");
    } finally {
      setLoading(false);
    }
  }, [syncStoriesCache]);

  // Restore Default 4 Field Notes Handler
  const handleRestoreFieldNotes = async () => {
    setIsSaving(true);
    try {
      const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      for (const fn of defaultFieldNotesList) {
        const exists = stories.some((s) => s.title === fn.title && s.story_type === "field_note");
        if (!exists) {
          await adminCreateStory(key, fn);
        }
      }
      await loadStories();
      window.dispatchEvent(new Event("alertngo_stories_updated"));
      showToast("4 default field notes populated successfully!");
    } catch (err) {
      showToast("Error populating field notes: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Settings Save Handler
  const handleSavePageSettings = async (overrideSettings = null) => {
    setIsSavingSettings(true);
    const toSave = overrideSettings || pageSettings;
    try {
      const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const res = await adminSaveStoriesSettings(key, toSave);
      if (res && res.success) {
        setPageSettings(toSave);
        try {
          localStorage.setItem(STORIES_SETTINGS_CACHE_KEY, JSON.stringify(toSave));
        } catch {}
        window.dispatchEvent(new Event("alertngo_stories_updated"));
        showToast("Stories page settings updated and published successfully!");
      } else {
        localStorage.setItem(STORIES_SETTINGS_CACHE_KEY, JSON.stringify(toSave));
        window.dispatchEvent(new Event("alertngo_stories_updated"));
        showToast(res?.message || "Saved locally in browser cache", "warning");
      }
    } catch (err) {
      localStorage.setItem(STORIES_SETTINGS_CACHE_KEY, JSON.stringify(toSave));
      window.dispatchEvent(new Event("alertngo_stories_updated"));
      showToast("Saved locally in browser cache", "warning");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Programme Pills Handlers
  const handleAddProgrammePill = () => {
    if (!newPill.label.trim()) {
      showToast("Please enter a link label", "error");
      return;
    }
    const updated = [
      ...(pageSettings.s3_programme_links || []),
      { label: newPill.label.trim(), cat: newPill.cat.trim() || newPill.label.trim() }
    ];
    const newSettings = { ...pageSettings, s3_programme_links: updated };
    setPageSettings(newSettings);
    setNewPill({ label: "", cat: "" });
    handleSavePageSettings(newSettings);
  };

  const handleUpdateProgrammePill = (idx, field, val) => {
    const list = [...(pageSettings.s3_programme_links || [])];
    if (list[idx]) {
      list[idx] = { ...list[idx], [field]: val };
      const newSettings = { ...pageSettings, s3_programme_links: list };
      setPageSettings(newSettings);
      try {
        localStorage.setItem(STORIES_SETTINGS_CACHE_KEY, JSON.stringify(newSettings));
        window.dispatchEvent(new Event("alertngo_stories_updated"));
      } catch {}
    }
  };

  const handleDeleteProgrammePill = (idx) => {
    const list = (pageSettings.s3_programme_links || []).filter((_, i) => i !== idx);
    const newSettings = { ...pageSettings, s3_programme_links: list };
    setPageSettings(newSettings);
    handleSavePageSettings(newSettings);
  };

  const handleMoveProgrammePill = (idx, dir) => {
    const list = [...(pageSettings.s3_programme_links || [])];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    const newSettings = { ...pageSettings, s3_programme_links: list };
    setPageSettings(newSettings);
    handleSavePageSettings(newSettings);
  };

  const handleResetProgrammePills = () => {
    const newSettings = { ...pageSettings, s3_programme_links: defaultStoriesSettings.s3_programme_links };
    setPageSettings(newSettings);
    handleSavePageSettings(newSettings);
    showToast("Programme pills reset to defaults and published!");
  };

  // Trust Badges Handlers
  const handleAddTrustItem = () => {
    if (!newTrustText.trim()) return;
    const updated = [...(pageSettings.cta_trust_items || []), newTrustText.trim()];
    const newSettings = { ...pageSettings, cta_trust_items: updated };
    setPageSettings(newSettings);
    setNewTrustText("");
    handleSavePageSettings(newSettings);
  };

  const handleUpdateTrustItem = (idx, val) => {
    const list = [...(pageSettings.cta_trust_items || [])];
    list[idx] = val;
    const newSettings = { ...pageSettings, cta_trust_items: list };
    setPageSettings(newSettings);
    try {
      localStorage.setItem(STORIES_SETTINGS_CACHE_KEY, JSON.stringify(newSettings));
      window.dispatchEvent(new Event("alertngo_stories_updated"));
    } catch {}
  };

  const handleDeleteTrustItem = (idx) => {
    const list = (pageSettings.cta_trust_items || []).filter((_, i) => i !== idx);
    const newSettings = { ...pageSettings, cta_trust_items: list };
    setPageSettings(newSettings);
    handleSavePageSettings(newSettings);
  };

  const handleResetTrustItems = () => {
    const newSettings = { ...pageSettings, cta_trust_items: defaultStoriesSettings.cta_trust_items };
    setPageSettings(newSettings);
    handleSavePageSettings(newSettings);
    showToast("Trust badges reset to defaults and published!");
  };

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Filtered stories
  const filteredStories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stories.filter((s) => {
      const matchesType =
        activeTypeTab === "all" ||
        s.story_type === activeTypeTab;
      const matchesSearch =
        !q ||
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.tag && s.tag.toLowerCase().includes(q)) ||
        (s.place && s.place.toLowerCase().includes(q)) ||
        (s.body && s.body.toLowerCase().includes(q)) ||
        (s.outcome && s.outcome.toLowerCase().includes(q));
      return matchesType && matchesSearch;
    });
  }, [stories, activeTypeTab, search]);

  // Open Create Modal
  const handleOpenCreate = (defaultType = "featured") => {
    setEditingStoryId(null);
    setFormData({
      story_type: defaultType,
      tag: defaultType === "featured" ? "Forest Rights" : "Governance",
      place: "",
      title: "",
      body: "",
      outcome: "",
      media_type: "image",
      img: "",
      video_url: "",
      sort_order: stories.length + 1,
      is_active: 1
    });
    setSelectedVidFile(null);
    setSelectedVidPreview("");
    setUploadedVidUrl("");
    setUploadVidError("");
    setVidUploadProgress({ percent: 0, loaded: 0, total: 0 });
    setShowEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (story) => {
    setEditingStoryId(story.id);
    setFormData({
      story_type: story.story_type || "featured",
      tag: story.tag || "Forest Rights",
      place: story.place || "",
      title: story.title || "",
      body: story.body || "",
      outcome: story.outcome || "",
      media_type: story.media_type || (story.video_url ? "video" : "image"),
      img: story.img || "",
      video_url: story.video_url || "",
      sort_order: story.sort_order || 0,
      is_active: story.is_active !== undefined ? story.is_active : 1
    });

    setSelectedVidFile(null);
    setSelectedVidPreview(story.video_url || "");
    setUploadedVidUrl(story.video_url || "");
    setUploadVidError("");
    setVidUploadProgress({ percent: story.video_url ? 100 : 0, loaded: 0, total: 0 });
    setVidModalMode(story.video_url && isYouTubeUrl(story.video_url) ? "url" : "upload");
    setShowEditModal(true);
  };

  // Save Story (Create or Update)
  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Story title is required", "error");
      return;
    }
    if (!formData.body.trim()) {
      showToast("Story narrative body is required", "error");
      return;
    }

    setIsSaving(true);
    try {
      const key = adminKey || sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const payload = {
        ...formData,
        video_url: uploadedVidUrl || formData.video_url
      };

      let res;
      if (editingStoryId) {
        res = await adminUpdateStory(key, { id: editingStoryId, ...payload });
      } else {
        res = await adminCreateStory(key, payload);
      }

      if (res && res.success) {
        showToast(
          editingStoryId ? "Story updated successfully!" : "Story created successfully!",
          "success"
        );
        setShowEditModal(false);
        await loadStories();
      } else {
        showToast(res?.message || "Failed to save story", "error");
      }
    } catch (err) {
      showToast(err.message || "Error saving story", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Story
  const handleDeleteStory = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const key = adminKey || sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const res = await adminDeleteStory(key, deleteTarget.id);
      if (res && res.success) {
        showToast(`Story '${deleteTarget.title}' deleted successfully!`, "success");
        setStories((prev) => {
          const next = prev.filter((s) => s.id !== deleteTarget.id);
          syncStoriesCache(next);
          return next;
        });
        setDeleteTarget(null);
      } else {
        showToast(res?.message || "Failed to delete story", "error");
      }
    } catch (err) {
      showToast(err.message || "Error deleting story", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Story Active / Hidden Status
  const handleToggleActive = async (story) => {
    try {
      const key = adminKey || sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const newActive = (story.is_active === 1 || story.is_active === true || story.is_active === "1") ? 0 : 1;
      const res = await adminUpdateStory(key, { ...story, is_active: newActive });
      if (res && res.success) {
        showToast(`Story '${story.title}' is now ${newActive ? 'Active' : 'Hidden'} on website`, "success");
        setStories((prev) => {
          const next = prev.map((s) => (s.id === story.id ? { ...s, is_active: newActive } : s));
          syncStoriesCache(next);
          return next;
        });
      } else {
        showToast(res?.message || "Failed to toggle story status", "error");
      }
    } catch (err) {
      showToast(err.message || "Error updating story status", "error");
    }
  };

  // Move Story Order Up / Down
  const handleMoveOrder = async (storyId, direction) => {
    const list = [...stories];
    const index = list.findIndex((s) => s.id === storyId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updated = list.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setStories(updated);
    syncStoriesCache(updated);

    try {
      const key = adminKey || sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const orderPayload = updated.map((item) => ({ id: item.id, sort_order: item.sort_order }));
      await adminReorderStories(key, orderPayload);
      showToast("Order updated successfully!", "success");
    } catch (err) {
      showToast("Failed to save reorder: " + err.message, "error");
    }
  };

  // Re-sync Defaults
  const handleResyncDefaults = async (force = false) => {
    setIsSyncing(true);
    try {
      const res = await adminSeedStories(adminKey, force);
      if (res && res.success) {
        showToast(res.message || "Stories synchronized successfully!", "success");
        setShowSyncModal(false);
        await loadStories();
      } else {
        showToast(res?.message || "Failed to sync stories", "error");
      }
    } catch (err) {
      showToast(err.message || "Error synchronizing stories", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Image Upload handler
  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const targetFolder = `stories/images`;
      const res = await adminUploadImage(adminKey, file, targetFolder);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, img: res.url, media_type: "image" }));
        showToast("Story photo uploaded successfully!", "success");
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

  // Video Upload handler
  const handleSelectVidFile = (file) => {
    if (!file) return;
    setSelectedVidFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedVidPreview(previewUrl);
    setUploadVidError("");
    setUploadedVidUrl("");
    setVidUploadProgress({ percent: 0, loaded: 0, total: file.size });
    setIsUploadingVid(true);

    const targetFolder = `stories/videos`;
    adminUploadVideo(adminKey, file, targetFolder, (prog) => {
      setVidUploadProgress(prog);
    })
      .then((res) => {
        if (res && res.success && res.url) {
          setUploadedVidUrl(res.url);
          setFormData((prev) => ({ ...prev, video_url: res.url, media_type: "video" }));
          setIsUploadingVid(false);
          showToast("Story video uploaded and attached!", "success");
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

  return (
    <AdminLayout title="Stories of Change Management">
      <style>{`
        .adm-placement-toggle {
          display: flex;
          gap: 10px;
        }
        .adm-modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .adm-media-cover-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .adm-modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .adm-stories-container {
            padding: 10px 4px !important;
          }
          .adm-stories-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adm-stories-head > div:last-child {
            width: 100% !important;
            flex-direction: column !important;
          }
          .adm-stories-head > div:last-child > * {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .adm-stories-filters {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adm-stories-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            width: 100% !important;
          }
          .adm-stories-tabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
          }
          .adm-stories-search {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .adm-stories-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-stories-modal {
            max-width: calc(100vw - 10px) !important;
            width: calc(100vw - 10px) !important;
            padding: 14px 10px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
          }
          .adm-stories-modal * {
            box-sizing: border-box !important;
          }
          .adm-stories-modal h3 {
            font-size: 1.05rem !important;
          }
          .adm-placement-toggle {
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-placement-toggle button {
            width: 100% !important;
            flex: none !important;
            white-space: normal !important;
            text-align: center !important;
            padding: 10px 12px !important;
            font-size: 0.82rem !important;
            line-height: 1.35 !important;
            height: auto !important;
            min-height: 42px !important;
            border-radius: 8px !important;
          }
          .adm-stories-modal .adm-modal-form-grid {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            width: 100% !important;
            margin-bottom: 14px !important;
          }
          .adm-stories-modal .adm-modal-form-grid > * {
            width: 100% !important;
          }
          .adm-stories-modal input,
          .adm-stories-modal select,
          .adm-stories-modal textarea {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            font-size: 0.85rem !important;
            padding: 9px 11px !important;
          }
          .adm-media-cover-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .adm-media-cover-head > span {
            font-size: 0.82rem !important;
          }
          .adm-media-cover-head > div {
            width: 100% !important;
            display: flex !important;
          }
          .adm-media-cover-head button {
            flex: 1 1 0 !important;
            text-align: center !important;
            justify-content: center !important;
            padding: 7px 10px !important;
          }
          .adm-media-upload-row {
            flex-direction: column !important;
            width: 100% !important;
          }
          .adm-media-upload-row button {
            width: 100% !important;
            justify-content: center !important;
          }
          .adm-modal-footer-actions {
            display: flex !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .adm-modal-footer-actions button {
            flex: 1 1 0 !important;
            padding: 10px 14px !important;
            font-size: 0.82rem !important;
            justify-content: center !important;
            text-align: center !important;
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
      <div className="adm-stories-container" style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto", color: "#f8fafc" }}>
        {/* Top Header & Actions */}
        <div
          className="adm-stories-head"
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
              <FaBookOpen color="#ec4899" /> Stories of Change
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
              Manage community impact stories, field notes, photos, and video testimonials displayed on <code>/stories</code>.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="/stories"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                borderRadius: 8,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#cbd5e1",
                fontWeight: 600,
                fontSize: "0.85rem",
                textDecoration: "none"
              }}
            >
              <FaExternalLinkAlt size={12} /> View Live /stories
            </a>

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
                cursor: "pointer"
              }}
            >
              <FaSyncAlt /> Reset Defaults
            </button>

            <button
              onClick={() => handleOpenCreate("featured")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                border: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(236, 72, 153, 0.4)"
              }}
            >
              <FaPlus /> Add New Story
            </button>
          </div>
        </div>

        {/* ── MAIN SECTION TABS ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            borderBottom: "1px solid #1e293b",
            paddingBottom: 14,
            marginBottom: 24,
            overflowX: "auto"
          }}
        >
          {[
            {
              id: "s1",
              label: "Section 01: Field Stories (Featured)",
              count: stories.filter((s) => s.story_type !== "field_note").length,
              icon: <FaImages />
            },
            {
              id: "s2",
              label: "Section 02: More From the Field (Field Notes)",
              count: stories.filter((s) => s.story_type === "field_note").length,
              icon: <FaBookOpen />
            },
            {
              id: "s3",
              label: "Section 03: Stories by Programme (Pills)",
              count: (pageSettings.s3_programme_links || []).length,
              icon: <FaTag />
            },
            {
              id: "cta",
              label: "Call To Action (Next Chapter)",
              icon: <FaHeart />
            },
            {
              id: "all",
              label: "All Stories Overview & Search",
              count: stories.length,
              icon: <FaLayerGroup />
            }
          ].map((tab) => {
            const active = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: "0.88rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  background: active ? "linear-gradient(135deg, #db2777 0%, #ec4899 100%)" : "#1e293b",
                  border: active ? "1px solid #ec4899" : "1px solid #334155",
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  boxShadow: active ? "0 4px 12px rgba(236, 72, 153, 0.3)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    style={{
                      background: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: "0.75rem",
                      fontWeight: 800
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB S1: SECTION 01 — FIELD STORIES (FEATURED) ───────────────────── */}
        {activeMainTab === "s1" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* S1 Headings Editor */}
            <div style={{ background: "#0d111c", border: "1px solid #1e293b", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 16, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 700, fontSize: "0.78rem" }}>
                    Section 01 Header
                  </span>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>
                    Section 01 Titles & Subtitle
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleSavePageSettings()}
                  disabled={isSavingSettings}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 18px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <FaSave /> {isSavingSettings ? "Saving..." : "Save Section 01 Headings"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={pageSettings.s1_badge || ""}
                    onChange={(e) => setPageSettings({ ...pageSettings, s1_badge: e.target.value })}
                    placeholder="e.g. Section 01"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Section Title / Heading
                  </label>
                  <input
                    type="text"
                    value={pageSettings.s1_title || ""}
                    onChange={(e) => setPageSettings({ ...pageSettings, s1_title: e.target.value })}
                    placeholder="e.g. Field Stories"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Descriptive Subtitle
                </label>
                <textarea
                  rows={2}
                  value={pageSettings.s1_subtitle || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, s1_subtitle: e.target.value })}
                  placeholder="Compiled from ALERT's programme records..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", resize: "vertical" }}
                />
              </div>
            </div>

            {/* S1 Featured Stories List Header & Add Button */}
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                  <FaImages color="#38bdf8" /> Featured Field Stories ({stories.filter((s) => s.story_type !== "field_note").length})
                </h3>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
                  In-depth stories with high-resolution photography, video testimonials, and statutory outcomes displayed on <code>/stories#featured-stories</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreate("featured")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 20px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)"
                }}
              >
                <FaPlus /> Add Featured Story
              </button>
            </div>

            {/* Cards Grid for Section 01 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {stories.filter((s) => s.story_type !== "field_note").map((story) => {
                const isVideo = story.media_type === "video" || !!story.video_url;
                return (
                  <div
                    key={story.id}
                    style={{
                      background: "#0d111c",
                      border: "1px solid #1e293b",
                      borderRadius: 14,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{ position: "relative", height: 180, background: "#061842" }}>
                      {isVideo ? (
                        isYouTubeUrl(story.video_url) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(story.video_url)}
                            title={story.title}
                            style={{ width: "100%", height: "100%", border: "none" }}
                          />
                        ) : (
                          <video
                            src={story.video_url}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            controls
                          />
                        )
                      ) : (
                        <img
                          src={story.img || "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg"}
                          alt={story.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          padding: "3px 10px",
                          borderRadius: 16,
                          background: "#0284c7",
                          color: "#fff",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          zIndex: 2
                        }}
                      >
                        {story.tag}
                      </span>
                    </div>

                    <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                        <FaMapMarkerAlt color="#10b981" /> {story.place}
                      </span>
                      <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>
                        {story.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.84rem", color: "#94a3b8", lineHeight: 1.6, flex: 1 }}>
                        {story.body}
                      </p>
                      {story.outcome && (
                        <div style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                          <FaCheckCircle size={11} /> {story.outcome}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1e293b", marginTop: "auto" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(story.id, "up")}
                            style={{ padding: "4px 7px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", cursor: "pointer" }}
                          >
                            <FaArrowUp size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(story.id, "down")}
                            style={{ padding: "4px 7px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", cursor: "pointer" }}
                          >
                            <FaArrowDown size={10} />
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(story)}
                            style={{ padding: "6px 12px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                          >
                            <FaEdit size={11} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(story)}
                            style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer" }}
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB S2: SECTION 02 — MORE FROM THE FIELD (FIELD NOTES) ─────────── */}
        {activeMainTab === "s2" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Section 02 Heading & Subtitle Configuration */}
            <div style={{ background: "#0d111c", border: "1px solid #1e293b", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 16, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontWeight: 700, fontSize: "0.78rem" }}>
                    Section 02 Headings
                  </span>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>
                    Section 02 Titles & Subtitle
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleSavePageSettings()}
                  disabled={isSavingSettings}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 18px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <FaSave /> {isSavingSettings ? "Saving..." : "Save Headings"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={pageSettings.s2_badge || ""}
                    onChange={(e) => setPageSettings({ ...pageSettings, s2_badge: e.target.value })}
                    placeholder="e.g. Section 02"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Section Title / Heading
                  </label>
                  <input
                    type="text"
                    value={pageSettings.s2_title || ""}
                    onChange={(e) => setPageSettings({ ...pageSettings, s2_title: e.target.value })}
                    placeholder="e.g. More From the Field"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Descriptive Subtitle
                </label>
                <textarea
                  rows={2}
                  value={pageSettings.s2_subtitle || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, s2_subtitle: e.target.value })}
                  placeholder="Short notes from mandal offices and village visits..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", resize: "vertical" }}
                />
              </div>
            </div>

            {/* Field Notes Management Toolbar */}
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                  <FaBookOpen color="#10b981" /> Section 02 Short Field Notes ({stories.filter((s) => s.story_type === "field_note").length})
                </h3>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
                  Short notes from mandal offices and village visits — the smaller administrative wins that make the larger ones possible. Displayed on <code>/stories#field-notes</code>.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleRestoreFieldNotes}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 16px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <FaSyncAlt /> Restore 4 Default Notes
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCreate("field_note")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 20px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                  }}
                >
                  <FaPlus /> Add Field Note
                </button>
              </div>
            </div>

            {/* Field Notes Cards Grid */}
            {stories.filter((s) => s.story_type === "field_note").length === 0 ? (
              <div style={{ background: "#0d111c", border: "1px dashed #334155", borderRadius: 14, padding: "40px 20px", textAlign: "center" }}>
                <FaBookOpen size={36} color="#64748b" style={{ marginBottom: 12 }} />
                <h4 style={{ margin: "0 0 8px", color: "#fff", fontSize: "1.1rem" }}>No Field Notes in Database</h4>
                <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "0.88rem" }}>
                  Click below to insert the standard 4 field notes (Rampachodavaram, Buttayigudem, Ramavarampadu, Koduru) or add a custom one.
                </p>
                <button
                  type="button"
                  onClick={handleRestoreFieldNotes}
                  style={{ padding: "10px 24px", borderRadius: 8, background: "#10b981", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                >
                  Populate 4 Standard Field Notes
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 18 }}>
                {stories.filter((s) => s.story_type === "field_note").map((story) => (
                  <div
                    key={story.id}
                    style={{
                      background: "#0d111c",
                      border: "1px solid #1e293b",
                      borderLeft: "4px solid #10b981",
                      borderRadius: 12,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {story.tag} · {story.place}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(story.id, "up")}
                          title="Move Up"
                          style={{ padding: "4px 7px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", cursor: "pointer" }}
                        >
                          <FaArrowUp size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(story.id, "down")}
                          title="Move Down"
                          style={{ padding: "4px 7px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#cbd5e1", cursor: "pointer" }}
                        >
                          <FaArrowDown size={10} />
                        </button>
                      </div>
                    </div>

                    <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.35 }}>
                      {story.title}
                    </h4>

                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, flex: 1 }}>
                      {story.body}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1e293b", marginTop: "auto" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(story)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: story.is_active ? "#10b981" : "#64748b",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: story.is_active ? "#10b981" : "#64748b" }} />
                        {story.is_active ? "Active on Site" : "Hidden"}
                      </button>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(story)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 6,
                            background: "#1e293b",
                            border: "1px solid #334155",
                            color: "#38bdf8",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          <FaEdit size={11} /> Edit Note
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(story)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            fontSize: "0.8rem",
                            cursor: "pointer"
                          }}
                          title="Delete field note"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB S3: SECTION 03 — STORIES BY PROGRAMME (PILLS) ──────────────── */}
        {activeMainTab === "s3" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Section 03 Headings Configuration */}
            <div style={{ background: "#0d111c", border: "1px solid #1e293b", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 16, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", fontWeight: 700, fontSize: "0.78rem" }}>
                    Section 03 Headings
                  </span>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc" }}>
                    Section 03 Titles & Subtitle
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleSavePageSettings()}
                  disabled={isSavingSettings}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 18px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <FaSave /> {isSavingSettings ? "Saving..." : "Save Headings"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Section Badge
                  </label>
                  <input
                    type="text"
                    value={pageSettings.s3_badge || ""}
                    onChange={(e) => setPageSettings({ ...pageSettings, s3_badge: e.target.value })}
                    placeholder="e.g. Section 03"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Section Title / Heading
                  </label>
                  <input
                    type="text"
                    value={pageSettings.s3_title || ""}
                    onChange={(e) => setPageSettings({ ...pageSettings, s3_title: e.target.value })}
                    placeholder="e.g. Stories by Programme"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Descriptive Subtitle
                </label>
                <textarea
                  rows={2}
                  value={pageSettings.s3_subtitle || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, s3_subtitle: e.target.value })}
                  placeholder="Every story belongs to one of ALERT's eight impact pillars..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", resize: "vertical" }}
                />
              </div>
            </div>

            {/* Header info banner */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.15rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                  <FaTag color="#f59e0b" /> Section 03 Impact Pillar Links ({pageSettings.s3_programme_links?.length || 0})
                </h3>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.86rem" }}>
                  These pills render in Section 03 of <code>/stories#by-programme</code> and link directly to filtered initiatives on <code>/programs?cat=...</code>.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleResetProgrammePills}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  <FaUndo size={11} /> Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePageSettings()}
                  disabled={isSavingSettings}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 20px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  <FaSave /> {isSavingSettings ? "Saving..." : "Save Programme Links"}
                </button>
              </div>
            </div>

            {/* Add New Programme Link Pill Card */}
            <div style={{ background: "#0d111c", border: "1px solid #1e293b", borderRadius: 14, padding: "20px 24px" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: "0.98rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 8 }}>
                <FaPlus color="#f59e0b" size={13} /> Add New Programme Pill Link
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr auto", gap: 12, alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Pill Display Label *
                  </label>
                  <input
                    type="text"
                    value={newPill.label}
                    onChange={(e) => setNewPill({ ...newPill, label: e.target.value })}
                    placeholder="e.g. Forest Rights (RoFR & LTR)"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Category Query Parameter (?cat=...)
                  </label>
                  <input
                    type="text"
                    value={newPill.cat}
                    onChange={(e) => setNewPill({ ...newPill, cat: e.target.value })}
                    placeholder="e.g. Forest Rights"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddProgrammePill}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  <FaPlus style={{ marginRight: 6 }} /> Add Pill
                </button>
              </div>
            </div>

            {/* List of Existing Programme Pills */}
            <div style={{ background: "#0d111c", border: "1px solid #1e293b", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#f8fafc" }}>
                  Active Programme Pills ({pageSettings.s3_programme_links?.length || 0})
                </h4>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  Click &apos;Save Programme Links&apos; after modifying
                </span>
              </div>

              {(!pageSettings.s3_programme_links || pageSettings.s3_programme_links.length === 0) ? (
                <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                  No programme pills defined. Click Reset Defaults or add a new pill above.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pageSettings.s3_programme_links.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "36px 2fr 2fr 100px 42px",
                        gap: 12,
                        alignItems: "center",
                        background: "#111827",
                        border: "1px solid #1f2937",
                        borderRadius: 10,
                        padding: "10px 14px"
                      }}
                    >
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#64748b", textAlign: "center" }}>
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={p.label || ""}
                        onChange={(e) => handleUpdateProgrammePill(idx, "label", e.target.value)}
                        placeholder="Label"
                        style={{ padding: "8px 12px", borderRadius: 6, background: "#0d111c", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                      />
                      <input
                        type="text"
                        value={p.cat || ""}
                        onChange={(e) => handleUpdateProgrammePill(idx, "cat", e.target.value)}
                        placeholder="cat parameter"
                        style={{ padding: "8px 12px", borderRadius: 6, background: "#0d111c", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                      />
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveProgrammePill(idx, -1)}
                          disabled={idx === 0}
                          style={{ padding: "6px 8px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: idx === 0 ? "#475569" : "#cbd5e1", cursor: idx === 0 ? "not-allowed" : "pointer" }}
                          title="Move up"
                        >
                          <FaArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProgrammePill(idx, 1)}
                          disabled={idx === pageSettings.s3_programme_links.length - 1}
                          style={{ padding: "6px 8px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: idx === pageSettings.s3_programme_links.length - 1 ? "#475569" : "#cbd5e1", cursor: idx === pageSettings.s3_programme_links.length - 1 ? "not-allowed" : "pointer" }}
                          title="Move down"
                        >
                          <FaArrowDown size={11} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProgrammePill(idx)}
                        style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Delete pill"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Save Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => handleSavePageSettings()}
                disabled={isSavingSettings}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
                }}
              >
                <FaSave /> {isSavingSettings ? "Saving Changes..." : "Save & Publish Programme Links"}
              </button>
            </div>
          </div>
        )}

        {activeMainTab === "all" && (
          <>
        {/* Metric Cards Banner */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 24
          }}
        >
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Total Stories</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ec4899", marginTop: 4 }}>
              {stories.length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Documented in database</span>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Section 01: Featured</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#38bdf8", marginTop: 4 }}>
              {stories.filter((s) => s.story_type !== "field_note").length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>With media & outcomes</span>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Section 02: Field Notes</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981", marginTop: 4 }}>
              {stories.filter((s) => s.story_type === "field_note").length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Short grassroots wins</span>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Video Stories</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ef4444", marginTop: 4 }}>
              {stories.filter((s) => s.media_type === "video" || !!s.video_url).length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Direct MP4s / YouTube</span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div
          className="adm-stories-filters"
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16
          }}
        >
          {/* Story Type Switcher */}
          <div className="adm-stories-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setActiveTypeTab("all")}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: "0.82rem",
                fontWeight: activeTypeTab === "all" ? 700 : 500,
                cursor: "pointer",
                border: activeTypeTab === "all" ? "1px solid #ec4899" : "1px solid #334155",
                background: activeTypeTab === "all" ? "#db2777" : "#1e293b",
                color: "#ffffff"
              }}
            >
              All Stories ({stories.length})
            </button>

            <button
              onClick={() => setActiveTypeTab("featured")}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: "0.82rem",
                fontWeight: activeTypeTab === "featured" ? 700 : 500,
                cursor: "pointer",
                border: activeTypeTab === "featured" ? "1px solid #38bdf8" : "1px solid #334155",
                background: activeTypeTab === "featured" ? "#0284c7" : "#1e293b",
                color: "#ffffff"
              }}
            >
              Section 01: Featured ({stories.filter((s) => s.story_type !== "field_note").length})
            </button>

            <button
              onClick={() => setActiveTypeTab("field_note")}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: "0.82rem",
                fontWeight: activeTypeTab === "field_note" ? 700 : 500,
                cursor: "pointer",
                border: activeTypeTab === "field_note" ? "1px solid #10b981" : "1px solid #334155",
                background: activeTypeTab === "field_note" ? "#059669" : "#1e293b",
                color: "#ffffff"
              }}
            >
              Section 02: Field Notes ({stories.filter((s) => s.story_type === "field_note").length})
            </button>
          </div>

          {/* Search Box */}
          <div className="adm-stories-search" style={{ position: "relative", minWidth: 0, width: "100%", maxWidth: 420 }}>
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
              placeholder="Search stories, tags, locations..."
              style={{
                width: "100%",
                padding: "10px 16px 10px 40px",
                borderRadius: 24,
                background: "#0b0f19",
                border: "1px solid #334155",
                color: "#ffffff",
                fontSize: "0.85rem",
                outline: "none"
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

        {/* Stories List */}
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>Loading Stories...</div>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>Querying MySQL stories table...</p>
          </div>
        ) : filteredStories.length === 0 ? (
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
            <FaBookOpen size={40} color="#475569" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: "0 0 8px", color: "#ffffff" }}>No Stories Found</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem" }}>
              No stories match your filter or search query.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveTypeTab("all");
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#ec4899",
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
          <div className="adm-stories-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 18 }}>
            {filteredStories.map((story) => {
              const tagTheme = TAG_COLORS[story.tag] || { bg: "rgba(100, 116, 139, 0.15)", border: "#64748b", text: "#cbd5e1" };
              const isVideo = story.media_type === "video" || !!story.video_url;
              return (
                <div
                  key={story.id}
                  style={{
                    background: "#111827",
                    border: "1px solid #1f2937",
                    borderRadius: 14,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ec4899")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1f2937")}
                >
                  {/* Media Header (If featured story or has image/video) */}
                  {story.story_type !== "field_note" && (story.img || story.video_url) ? (
                    <div style={{ height: 180, background: "#0b0f19", position: "relative", overflow: "hidden" }}>
                      {isVideo ? (
                        isYouTubeUrl(story.video_url) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(story.video_url)}
                            title={story.title}
                            style={{ width: "100%", height: "100%", border: "none" }}
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={story.video_url}
                            controls
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )
                      ) : (
                        <img
                          src={story.img}
                          alt={story.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}

                      {/* Tag pill badge overlay */}
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: tagTheme.bg,
                          color: tagTheme.text,
                          border: `1px solid ${tagTheme.border}`,
                          backdropFilter: "blur(4px)"
                        }}
                      >
                        {story.tag}
                      </span>

                      {isVideo && (
                        <span
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            background: "rgba(239, 68, 68, 0.9)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          <FaVideo size={10} /> Video Story
                        </span>
                      )}
                    </div>
                  ) : null}

                  {/* Body Content */}
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase"
                        }}
                      >
                        <FaMapMarkerAlt color="#10b981" /> {story.place || "Field Location"}
                      </span>

                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: story.story_type === "field_note" ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)",
                          color: story.story_type === "field_note" ? "#6ee7b7" : "#7dd3fc"
                        }}
                      >
                        {story.story_type === "field_note" ? "Field Note" : "Featured"}
                      </span>
                    </div>

                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.35 }}>
                      {story.title}
                    </h3>

                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.6, flex: 1 }}>
                      {story.body}
                    </p>

                    {story.outcome && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "8px 12px",
                          background: "rgba(16, 185, 129, 0.1)",
                          borderLeft: "3px solid #10b981",
                          borderRadius: 6,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#6ee7b7",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaCheckCircle size={12} /> {story.outcome}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #1f2937"
                      }}
                    >
                      <button
                        onClick={() => handleOpenEdit(story)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          background: "#2563eb",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <FaEdit /> Edit
                      </button>

                      <button
                        onClick={() => setDeleteTarget(story)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "rgba(239, 68, 68, 0.15)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                          fontSize: "0.8rem",
                          cursor: "pointer"
                        }}
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
        </>
      )}

      {/* ── TAB 4: CALL TO ACTION (NEXT CHAPTER) ─────────────────────────── */}
      {activeMainTab === "cta" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header Info Banner */}
          <div
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 14,
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                <FaHeart color="#ec4899" /> Stories Call To Action (Next Chapter)
              </h2>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.86rem" }}>
                Configure the bottom call-to-action banner, buttons, and statutory trust badges on <code>/stories</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSavePageSettings()}
              disabled={isSavingSettings}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
              }}
            >
              <FaSave /> {isSavingSettings ? "Saving..." : "Save CTA Settings"}
            </button>
          </div>

          {/* CTA Content Fields */}
          <div style={{ background: "#0d111c", border: "1px solid #1e293b", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Banner Badge Text
                </label>
                <input
                  type="text"
                  value={pageSettings.cta_badge || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, cta_badge: e.target.value })}
                  placeholder="e.g. Next Story"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Main Heading
                </label>
                <input
                  type="text"
                  value={pageSettings.cta_title || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, cta_title: e.target.value })}
                  placeholder="e.g. Help Write the Next Chapter"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                Highlighted Phrase (Glows with pink/violet gradient)
              </label>
              <input
                type="text"
                value={pageSettings.cta_title_highlight || ""}
                onChange={(e) => setPageSettings({ ...pageSettings, cta_title_highlight: e.target.value })}
                placeholder="e.g. Next Chapter"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem" }}
              />
              <span style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: 4, display: "block" }}>
                Must exactly match a portion of the Main Heading above to receive the glowing gradient effect.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                CTA Subtitle / Message
              </label>
              <textarea
                rows={3}
                value={pageSettings.cta_subtitle || ""}
                onChange={(e) => setPageSettings({ ...pageSettings, cta_subtitle: e.target.value })}
                placeholder="Every patta, seed bank, street pole..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", resize: "vertical" }}
              />
            </div>

            {/* Action Buttons Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
              {/* Primary Button */}
              <div style={{ background: "#111827", padding: 16, borderRadius: 10, border: "1px solid #1f2937" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ec4899", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <FaHeart size={12} /> Primary Action Button (Donate)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", color: "#cbd5e1", marginBottom: 4 }}>Button Label</label>
                    <input
                      type="text"
                      value={pageSettings.cta_donate_label || ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, cta_donate_label: e.target.value })}
                      placeholder="Donate Now"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0d111c", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", color: "#cbd5e1", marginBottom: 4 }}>Destination URL / Link</label>
                    <input
                      type="text"
                      value={pageSettings.cta_donate_url || ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, cta_donate_url: e.target.value })}
                      placeholder="/donate"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0d111c", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Button */}
              <div style={{ background: "#111827", padding: 16, borderRadius: 10, border: "1px solid #1f2937" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#38bdf8", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <FaArrowRight size={12} /> Secondary Action Button (Volunteer)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", color: "#cbd5e1", marginBottom: 4 }}>Button Label</label>
                    <input
                      type="text"
                      value={pageSettings.cta_volunteer_label || ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, cta_volunteer_label: e.target.value })}
                      placeholder="Volunteer with Us"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0d111c", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", color: "#cbd5e1", marginBottom: 4 }}>Destination URL / Link</label>
                    <input
                      type="text"
                      value={pageSettings.cta_volunteer_url || ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, cta_volunteer_url: e.target.value })}
                      placeholder="/contact"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0d111c", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Certifications Repeater */}
            <div style={{ paddingTop: 10, borderTop: "1px solid #1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
                  <FaShieldAlt size={12} /> Statutory Trust Certifications Badges
                </div>
                <button
                  type="button"
                  onClick={handleResetTrustItems}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.78rem" }}
                >
                  <FaUndo size={10} style={{ marginRight: 4 }} /> Reset Badges
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <input
                  type="text"
                  value={newTrustText}
                  onChange={(e) => setNewTrustText(e.target.value)}
                  placeholder="e.g. 12A & 80G Certified"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTrustItem(); } }}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 6, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                />
                <button
                  type="button"
                  onClick={handleAddTrustItem}
                  style={{ padding: "8px 16px", borderRadius: 6, background: "#334155", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}
                >
                  Add Badge
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(pageSettings.cta_trust_items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#111827",
                      border: "1px solid #334155",
                      borderRadius: 20,
                      padding: "5px 12px",
                      fontSize: "0.82rem",
                      color: "#e2e8f0"
                    }}
                  >
                    <FaShieldAlt size={10} color="#10b981" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateTrustItem(idx, e.target.value)}
                      style={{ background: "transparent", border: "none", color: "#fff", fontSize: "0.82rem", outline: "none", width: `${Math.max(item.length, 12)}ch` }}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteTrustItem(idx)}
                      style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 0 }}
                      title="Remove badge"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live CTA Preview */}
          <div style={{ background: "#061842", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 16, padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 12, right: 14, fontSize: "0.72rem", fontWeight: 800, color: "#ec4899", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Live CTA Box Preview
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 20, background: "rgba(236, 72, 153, 0.15)", border: "1px solid #ec4899", color: "#f472b6", fontSize: "0.75rem", fontWeight: 700, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899", display: "inline-block" }} />
              <span>{pageSettings.cta_badge || "Next Story"}</span>
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.3 }}>
              {(() => {
                const t = pageSettings.cta_title || "Help Write the Next Chapter";
                const h = pageSettings.cta_title_highlight || "Next Chapter";
                if (h && t.includes(h)) {
                  const p = t.split(h);
                  return (
                    <>
                      {p[0]}
                      <span style={{ background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {h}
                      </span>
                      {p.slice(1).join(h)}
                    </>
                  );
                }
                return t;
              })()}
            </h2>
            <p style={{ maxWidth: 640, margin: "0 auto 20px", color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.6 }}>
              {pageSettings.cta_subtitle || "Every patta, seed bank, street pole and savings ledger in these stories was funded by someone who read about work like this."}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ padding: "10px 22px", borderRadius: 24, background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {pageSettings.cta_donate_label || "Donate Now"} <FaHeart size={11} />
              </span>
              <span style={{ padding: "10px 22px", borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {pageSettings.cta_volunteer_label || "Volunteer with Us"} <FaArrowRight size={10} />
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: "0.78rem", color: "#94a3b8" }}>
              {(pageSettings.cta_trust_items || []).map((item, idx) => (
                <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FaShieldAlt size={10} color="#10b981" /> {item}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                setPageSettings({
                  ...pageSettings,
                  cta_badge: defaultStoriesSettings.cta_badge,
                  cta_title: defaultStoriesSettings.cta_title,
                  cta_title_highlight: defaultStoriesSettings.cta_title_highlight,
                  cta_subtitle: defaultStoriesSettings.cta_subtitle,
                  cta_donate_label: defaultStoriesSettings.cta_donate_label,
                  cta_donate_url: defaultStoriesSettings.cta_donate_url,
                  cta_volunteer_label: defaultStoriesSettings.cta_volunteer_label,
                  cta_volunteer_url: defaultStoriesSettings.cta_volunteer_url,
                  cta_trust_items: defaultStoriesSettings.cta_trust_items
                });
                showToast("Restored CTA settings to default values (click Save to publish)");
              }}
              style={{ padding: "10px 18px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}
            >
              <FaUndo style={{ marginRight: 6 }} /> Reset CTA to Default
            </button>
            <button
              type="button"
              onClick={() => handleSavePageSettings()}
              disabled={isSavingSettings}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
              }}
            >
              <FaSave /> {isSavingSettings ? "Saving Changes..." : "Save & Publish CTA Banner"}
            </button>
          </div>
        </div>
      )}
      </div>

      {/* ── CREATE / EDIT STORY MODAL ──────────────────────────────────────── */}
      {showEditModal && (
        <div
          className="adm-modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: "rgba(3, 7, 18, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20
          }}
        >
          <div
            className="adm-stories-modal"
            style={{
              background: "#0d111c",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: "24px 28px",
              width: "100%",
              maxWidth: 680,
              boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
              maxHeight: "92vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.25rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                <FaBookOpen color="#ec4899" /> {editingStoryId ? "Edit Story of Change" : "Add New Field Story"}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveStory}>
              {/* Story Type Radio/Toggle */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Story Placement *
                </label>
                <div className="adm-placement-toggle">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, story_type: "featured" })}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: formData.story_type === "featured" ? "1px solid #38bdf8" : "1px solid #334155",
                      background: formData.story_type === "featured" ? "#0284c7" : "#1e293b",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Section 01: Featured Story (Card with Media)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, story_type: "field_note" })}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: formData.story_type === "field_note" ? "1px solid #10b981" : "1px solid #334155",
                      background: formData.story_type === "field_note" ? "#059669" : "#1e293b",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Section 02: Short Field Note
                  </button>
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Story Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The resolution that turned a forest into a legal record"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              {/* Tag & Place */}
              <div className="adm-modal-form-grid">
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Thematic Tag / Pillar *
                  </label>
                  <input
                    type="text"
                    list="storyTags"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Forest Rights, Women Cooperatives"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                  />
                  <datalist id="storyTags">
                    <option value="Forest Rights" />
                    <option value="Women Cooperatives" />
                    <option value="Child Rights" />
                    <option value="Clean Energy" />
                    <option value="Disaster Relief" />
                    <option value="Polavaram LA & R&R" />
                    <option value="Governance" />
                    <option value="Land Rights" />
                    <option value="Livelihoods" />
                    <option value="Identity" />
                  </datalist>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Location / Place *
                  </label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="e.g. Maredumilli Mandal, ASR District"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              {/* Narrative Body */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Story Narrative Body *
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  placeholder="Detail the community background, the intervention, and how rights or livelihoods were secured..."
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", lineHeight: 1.5, resize: "vertical" }}
                />
              </div>

              {/* Outcome (for Featured) */}
              {formData.story_type === "featured" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Key Outcome / Metric Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    placeholder="e.g. CFR claim filed with Gram Sabha endorsement / 75+ off-grid hamlets"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#6ee7b7", fontSize: "0.85rem" }}
                  />
                </div>
              )}

              {/* Media Section (Featured Stories) */}
              {formData.story_type === "featured" && (
                <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
                  <div className="adm-media-cover-head">
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
                      Media Cover: Photo or Field Video
                    </span>
                    <div style={{ display: "flex", gap: 6, background: "#1e293b", padding: 3, borderRadius: 6 }}>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, media_type: "image" })}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 4,
                          border: "none",
                          background: formData.media_type === "image" ? "#2563eb" : "transparent",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        📷 Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, media_type: "video" })}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 4,
                          border: "none",
                          background: formData.media_type === "video" ? "#ef4444" : "transparent",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        🎥 Video
                      </button>
                    </div>
                  </div>

                  {formData.media_type === "image" ? (
                    <div>
                      <div className="adm-media-upload-row" style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input
                          type="file"
                          ref={imageInputRef}
                          accept="image/*"
                          onChange={handleUploadImageFile}
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploadingImage}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 6,
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <FaCloudUploadAlt /> {isUploadingImage ? "Uploading..." : "Upload Photo File"}
                        </button>
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <input
                          type="text"
                          value={formData.img}
                          onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                          placeholder="Or paste Image URL (/uploads/... or https://...)"
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.82rem" }}
                        />
                      </div>

                      {formData.img && (
                        <div style={{ height: 130, borderRadius: 8, overflow: "hidden", background: "#000", marginTop: 8 }}>
                          <img src={formData.img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* Video Switcher */}
                      <div style={{ display: "flex", gap: 6, marginBottom: 12, background: "#0b0f19", padding: 4, borderRadius: 6 }}>
                        <button
                          type="button"
                          onClick={() => setVidModalMode("upload")}
                          style={{
                            flex: 1,
                            padding: "6px",
                            borderRadius: 4,
                            border: "none",
                            background: vidModalMode === "upload" ? "#ef4444" : "transparent",
                            color: "#fff",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Upload MP4 File
                        </button>
                        <button
                          type="button"
                          onClick={() => setVidModalMode("url")}
                          style={{
                            flex: 1,
                            padding: "6px",
                            borderRadius: 4,
                            border: "none",
                            background: vidModalMode === "url" ? "#ef4444" : "transparent",
                            color: "#fff",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          YouTube / Direct URL
                        </button>
                      </div>

                      {uploadVidError && (
                        <div style={{ color: "#f87171", fontSize: "0.78rem", marginBottom: 8 }}>
                          ⚠️ {uploadVidError}
                        </div>
                      )}

                      {vidModalMode === "upload" ? (
                        <div>
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
                              borderRadius: 8,
                              padding: "18px 12px",
                              textAlign: "center",
                              background: "#0b0f19",
                              cursor: "pointer"
                            }}
                          >
                            <FaCloudUploadAlt size={26} color="#ef4444" style={{ marginBottom: 4 }} />
                            <p style={{ margin: 0, fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>
                              {selectedVidFile ? selectedVidFile.name : "Click to select video (.mp4, .webm)"}
                            </p>
                            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                              {selectedVidFile ? formatBytes(selectedVidFile.size) : "Ultra-fast direct linking support"}
                            </span>
                          </div>

                          {selectedVidFile && (
                            <div style={{ marginTop: 10, background: "#0b0f19", borderRadius: 6, padding: "8px 12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", marginBottom: 4 }}>
                                <span>{uploadedVidUrl ? "Upload Complete" : "Uploading Video..."}</span>
                                <span>{uploadedVidUrl ? "100%" : `${vidUploadProgress.percent}%`}</span>
                              </div>
                              <div style={{ height: 6, background: "#334155", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${uploadedVidUrl ? 100 : vidUploadProgress.percent}%`, background: "#ef4444" }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            value={formData.video_url}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.82rem" }}
                          />
                        </div>
                      )}

                      {/* Video Preview */}
                      {(formData.video_url || selectedVidPreview) && (
                        <div style={{ height: 160, borderRadius: 8, overflow: "hidden", background: "#000", marginTop: 10 }}>
                          {isYouTubeUrl(formData.video_url) ? (
                            <iframe
                              src={getYouTubeEmbedUrl(formData.video_url)}
                              title="Preview"
                              style={{ width: "100%", height: "100%", border: "none" }}
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={formData.video_url || selectedVidPreview}
                              controls
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingVid}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: isSaving || isUploadingVid ? "not-allowed" : "pointer"
                  }}
                >
                  {isSaving ? "Saving..." : editingStoryId ? "Update Story" : "Publish Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SYNC DEFAULTS MODAL ───────────────────────────────────────────── */}
      {showSyncModal && (
        <div
          className="adm-modal-backdrop"
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
            className="adm-stories-modal"
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
              Reset Default Stories
            </h3>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 }}>
              This will re-seed the standard 6 featured stories and 4 field notes into MySQL table <code>stories</code>.
            </p>

            <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#334155", color: "#cbd5e1", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResyncDefaults(true)}
                disabled={isSyncing}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: "#ec4899",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {isSyncing ? "Resetting..." : "Reset All to Defaults"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div
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
            className="adm-stories-modal"
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
              Delete Story?
            </h3>
            <p style={{ margin: "0 0 20px", color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>&quot;{deleteTarget.title}&quot;</strong>? This action cannot be undone.
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
                onClick={handleDeleteStory}
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
                {isDeleting ? "Deleting..." : "Yes, Delete Story"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

