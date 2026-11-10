import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaPhotoVideo, FaSearch, FaPlus, FaTrash, FaEdit, FaSave, FaExternalLinkAlt,
  FaCheck, FaTimes, FaCloudUploadAlt, FaCalendarAlt, FaTag, FaCheckCircle,
  FaExclamationTriangle, FaSyncAlt, FaArrowRight, FaFilter, FaImages, FaPlay,
  FaVideo, FaEye, FaEyeSlash, FaCopy, FaBars, FaList, FaLink, FaFolderPlus
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminListGallery,
  adminCreateGalleryItem,
  adminUpdateGalleryItem,
  adminDeleteGalleryItem,
  adminToggleGalleryItem,
  adminReorderGallery,
  adminSeedGallery,
  adminListGalleryDropdowns,
  adminCreateGalleryDropdown,
  adminUpdateGalleryDropdown,
  adminDeleteGalleryDropdown,
  adminToggleGalleryDropdown,
  adminReorderGalleryDropdowns,
  adminSeedGalleryDropdowns,
  adminUploadImage,
  adminUploadVideo,
  API_BASE
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

const CATEGORY_COLORS = {
  "Events": { bg: "rgba(234, 88, 12, 0.18)", border: "#ea580c", text: "#fdba74" },
  "Community": { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", text: "#93c5fd" },
  "Forest Rights": { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#6ee7b7" },
  "Education": { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#fcd34d" },
  "Relief": { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", text: "#fca5a5" },
  "Energy": { bg: "rgba(234, 179, 8, 0.15)", border: "#eab308", text: "#fde047" },
  "Field Work": { bg: "rgba(168, 85, 247, 0.15)", border: "#a855f7", text: "#d8b4fe" },
  "Women": { bg: "rgba(236, 72, 153, 0.15)", border: "#ec4899", text: "#f472b6" },
  "General": { bg: "rgba(148, 163, 184, 0.15)", border: "#94a3b8", text: "#cbd5e1" }
};

const STANDARD_CATEGORIES = [
  "Events",
  "Community",
  "Forest Rights",
  "Education",
  "Relief",
  "Energy",
  "Field Work",
  "Women"
];

const STANDARD_DROPDOWN_SECTIONS = [
  "Photos & Images",
  "Field Videos",
  "Events & Albums"
];

function isYouTubeUrl(url) {
  return /(?:youtube\.com|youtu\.be)/i.test(url || "");
}

function getYouTubeThumbnail(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}

function isVideoFile(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v|mkv)($|\?)/i.test(url);
}

function captureVideoPosterBlob(source) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      let url = "";
      if (typeof source === "string") {
        url = source;
      } else if (source instanceof Blob || source instanceof File) {
        url = URL.createObjectURL(source);
      } else {
        return resolve(null);
      }
      video.src = url;

      let isCleaned = false;
      const cleanup = () => {
        if (!isCleaned) {
          isCleaned = true;
          if (typeof source !== "string") {
            try { URL.revokeObjectURL(url); } catch (e) { }
          }
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 7000);

      video.onloadeddata = () => {
        try {
          video.currentTime = Math.min(1.0, video.duration > 1 ? 1.0 : 0.1);
        } catch (e) {
          cleanup();
          clearTimeout(timer);
          resolve(null);
        }
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            cleanup();
            clearTimeout(timer);
            resolve(blob);
          }, "image/jpeg", 0.85);
        } catch (err) {
          cleanup();
          clearTimeout(timer);
          resolve(null);
        }
      };

      video.onerror = () => {
        cleanup();
        clearTimeout(timer);
        resolve(null);
      };
    } catch (e) {
      resolve(null);
    }
  });
}

function AdminMediaThumbnail({ item }) {
  const [imgError, setImgError] = useState(false);
  const isVideo = item.type === "video";

  if (!isVideo) {
    if (!item.src || imgError) {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
          <FaPhotoVideo size={36} />
        </div>
      );
    }
    return (
      <img
        src={item.src}
        alt={item.title}
        loading="lazy"
        onError={() => setImgError(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    );
  }

  // Video item
  const isYt = isYouTubeUrl(item.src);
  const ytThumb = isYt ? getYouTubeThumbnail(item.src) : "";
  const candidatePoster = (item.poster && !isVideoFile(item.poster)) ? item.poster : ytThumb;

  if (candidatePoster && !imgError) {
    return (
      <img
        src={candidatePoster}
        alt=""
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          setImgError(true);
        }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    );
  }

  if (isYt && ytThumb) {
    return (
      <img
        src={ytThumb}
        alt={item.title}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    );
  }

  if (item.src) {
    return (
      <video
        src={`${item.src}#t=0.5`}
        preload="auto"
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          pointerEvents: "none",
          background: "#000"
        }}
      />
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
      <FaVideo size={36} />
    </div>
  );
}

export default function AdminGallery() {
  const [adminKey, setAdminKey] = useState("");
  const [viewTab, setViewTab] = useState("media"); // "media" | "dropdowns"

  // ── Media Catalog States ──────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search for Media
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "image", "video"
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Media Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create
  const [formData, setFormData] = useState({
    type: "image",
    title: "",
    cat: "Community",
    src: "",
    poster: "",
    duration: "",
    description: "",
    sort_order: 0,
    is_active: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  // Upload states
  const imageInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isCapturingPoster, setIsCapturingPoster] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Media Delete & Sync Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Dropdown Manager States ───────────────────────────────────────────────
  const [dropdowns, setDropdowns] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [editingDropdownId, setEditingDropdownId] = useState(null);
  const [dropdownFormData, setDropdownFormData] = useState({
    section: "Photos & Images",
    label: "",
    path: "/gallery-9",
    sort_order: 0,
    is_active: 1
  });
  const [isSavingDropdown, setIsSavingDropdown] = useState(false);
  const [deleteDropdownTarget, setDeleteDropdownTarget] = useState(null);
  const [isDeletingDropdown, setIsDeletingDropdown] = useState(false);
  const [showDropdownSyncModal, setShowDropdownSyncModal] = useState(false);
  const [isSyncingDropdowns, setIsSyncingDropdowns] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showModal || showDropdownModal || deleteTarget || deleteDropdownTarget || showDropdownSyncModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, showDropdownModal, deleteTarget, deleteDropdownTarget, showDropdownSyncModal]);

  // Auth Key Init
  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
  }, []);

  // Load Media Items
  const loadGallery = useCallback(async () => {
    setLoading(true);
    try {
      const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const res = await adminListGallery(key);
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        showToast(res?.message || "Failed to load media items", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while connecting to media database", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Dropdowns
  const loadDropdowns = useCallback(async () => {
    setDropdownLoading(true);
    try {
      const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const res = await adminListGalleryDropdowns(key);
      if (res && res.success && Array.isArray(res.data)) {
        setDropdowns(res.data);
      } else {
        showToast(res?.message || "Failed to load dropdown items", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading navbar dropdowns", "error");
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
    loadDropdowns();
  }, [loadGallery, loadDropdowns]);

  // Dynamic metrics for media
  const stats = useMemo(() => {
    const total = items.length;
    const imagesCount = items.filter((i) => (i.type || "image") === "image").length;
    const videosCount = items.filter((i) => i.type === "video").length;
    const eventsCount = items.filter((i) => i.cat === "Events" || i.cat === "Event").length;
    const activeCount = items.filter((i) => Number(i.is_active) !== 0).length;
    return { total, imagesCount, videosCount, eventsCount, activeCount };
  }, [items]);

  // Dynamic available categories
  const availableCategories = useMemo(() => {
    const cats = new Set(STANDARD_CATEGORIES);
    items.forEach((it) => {
      if (it.cat && it.cat.trim()) cats.add(it.cat.trim());
    });
    return Array.from(cats);
  }, [items]);

  // Grouped dropdowns
  const groupedDropdowns = useMemo(() => {
    const map = {};
    STANDARD_DROPDOWN_SECTIONS.forEach((s) => { map[s] = []; });
    dropdowns.forEach((d) => {
      const sec = d.section || "Photos & Images";
      if (!map[sec]) map[sec] = [];
      map[sec].push(d);
    });
    return map;
  }, [dropdowns]);

  // Filtered media items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (typeFilter !== "all") {
        const itType = it.type || "image";
        if (itType !== typeFilter) return false;
      }
      if (catFilter !== "all" && it.cat !== catFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const t = (it.title || "").toLowerCase();
        const d = (it.description || "").toLowerCase();
        const c = (it.cat || "").toLowerCase();
        if (!t.includes(q) && !d.includes(q) && !c.includes(q)) return false;
      }
      return true;
    });
  }, [items, typeFilter, catFilter, search]);

  // Open Create Media Modal
  const openCreateModal = (defaultType = "image", defaultCat = "Community") => {
    setEditingId(null);
    setFormData({
      type: defaultType,
      title: "",
      cat: defaultCat,
      src: "",
      poster: "",
      duration: defaultType === "video" ? "0:30" : "",
      description: "",
      sort_order: items.length + 1,
      is_active: 1
    });
    setVideoProgress(0);
    setShowModal(true);
  };

  // Open Edit Media Modal
  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      type: item.type || "image",
      title: item.title || "",
      cat: item.cat || "Community",
      src: item.src || "",
      poster: item.poster || "",
      duration: item.duration || "",
      description: item.description || "",
      sort_order: item.sort_order || 0,
      is_active: Number(item.is_active) !== 0 ? 1 : 0
    });
    setVideoProgress(0);
    setShowModal(true);
  };

  // Handle Media Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "src" && prev.type === "video" && isYouTubeUrl(value) && !prev.poster) {
        const ytThumb = getYouTubeThumbnail(value);
        if (ytThumb) {
          next.poster = ytThumb;
        }
      }
      return next;
    });
  };

  // Handle Image File Upload
  const handleImageUpload = async (e, field = "src") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "poster") {
      setIsUploadingPoster(true);
    } else {
      setIsUploadingImage(true);
    }

    try {
      const res = await adminUploadImage(adminKey, file, "gallery");
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, [field]: res.url }));
        showToast(`Image uploaded: ${file.name}`, "success");
      } else {
        showToast(res?.message || "Image upload failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading image file", "error");
    } finally {
      if (field === "poster") {
        setIsUploadingPoster(false);
      } else {
        setIsUploadingImage(false);
      }
    }
  };

  // Handle Video File Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setVideoProgress(5);

    try {
      const res = await adminUploadVideo(
        adminKey,
        file,
        "gallery/videos",
        (prog) => {
          const pct = typeof prog === "object" && prog !== null ? (prog.percent ?? 0) : (Number(prog) || 0);
          setVideoProgress(pct);
        }
      );

      if (res && res.success && res.url) {
        let capturedPoster = "";
        try {
          const posterBlob = await captureVideoPosterBlob(file);
          if (posterBlob) {
            const posterFile = new File(
              [posterBlob],
              `${file.name.replace(/\.[^/.]+$/, "")}-poster.jpg`,
              { type: "image/jpeg" }
            );
            const posterRes = await adminUploadImage(adminKey, posterFile, "gallery/videos");
            if (posterRes && posterRes.success && posterRes.url) {
              capturedPoster = posterRes.url;
            }
          }
        } catch (posterErr) {
          console.warn("Auto-poster generation error:", posterErr);
        }

        setFormData((prev) => {
          const autoTitle = prev.title || file.name.replace(/\.[^/.]+$/, "");
          return {
            ...prev,
            src: res.url,
            poster: prev.poster || capturedPoster,
            title: autoTitle
          };
        });
        showToast(
          capturedPoster
            ? `Video & cover poster auto-generated: ${file.name}`
            : `Video uploaded: ${file.name}`,
          "success"
        );
      } else {
        showToast(res?.message || "Video upload failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error uploading video file", "error");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Handle Manual Auto-Capture Cover for Video
  const handleAutoCapturePoster = async () => {
    if (!formData.src) {
      showToast("Please enter or upload a video first", "error");
      return;
    }

    if (isYouTubeUrl(formData.src)) {
      const ytThumb = getYouTubeThumbnail(formData.src);
      if (ytThumb) {
        setFormData((prev) => ({ ...prev, poster: ytThumb }));
        showToast("YouTube cover thumbnail applied!", "success");
        return;
      }
    }

    setIsCapturingPoster(true);
    try {
      const blob = await captureVideoPosterBlob(formData.src);
      if (!blob) {
        showToast("Could not capture video frame. Please upload a cover manually.", "error");
        return;
      }
      const coverFile = new File([blob], "video-cover.jpg", { type: "image/jpeg" });
      const res = await adminUploadImage(adminKey, coverFile, "gallery/videos");
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, poster: res.url }));
        showToast("Cover frame captured and saved!", "success");
      } else {
        showToast(res?.message || "Failed to upload captured frame", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to capture video poster frame", "error");
    } finally {
      setIsCapturingPoster(false);
    }
  };

  // Save Media Item
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Please enter a title", "error");
      return;
    }
    if (!formData.src.trim()) {
      showToast(
        formData.type === "video"
          ? "Please upload a video file or enter a video URL"
          : "Please upload an image or enter an image URL",
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const res = await adminUpdateGalleryItem(adminKey, editingId, formData);
        if (res && res.success) {
          showToast("Media item updated successfully!", "success");
          setShowModal(false);
          loadGallery();
        } else {
          showToast(res?.message || "Failed to update item", "error");
        }
      } else {
        const res = await adminCreateGalleryItem(adminKey, formData);
        if (res && res.success) {
          showToast("New media item added successfully!", "success");
          setShowModal(false);
          loadGallery();
        } else {
          showToast(res?.message || "Failed to create item", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while saving item", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Media Visibility
  const handleToggleActive = async (id, currentVal) => {
    const nextVal = currentVal ? 0 : 1;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_active: nextVal } : i))
    );
    try {
      const res = await adminToggleGalleryItem(adminKey, id, nextVal);
      if (res && res.success) {
        showToast(nextVal ? "Item visible on public gallery" : "Item hidden from public gallery", "success");
      } else {
        loadGallery();
        showToast(res?.message || "Failed to toggle status", "error");
      }
    } catch (err) {
      loadGallery();
      showToast("Error updating status", "error");
    }
  };

  // Delete Media Item
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await adminDeleteGalleryItem(adminKey, deleteTarget.id);
      if (res && res.success) {
        showToast("Media item permanently deleted", "success");
        setDeleteTarget(null);
        loadGallery();
      } else {
        showToast(res?.message || "Failed to delete item", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting item", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore Default Media Items
  const handleRestoreDefaults = async () => {
    setIsSyncing(true);
    try {
      const res = await adminSeedGallery(adminKey);
      if (res && res.success) {
        showToast(res.message || "Default media items restored!", "success");
        setShowSyncModal(false);
        loadGallery();
      } else {
        showToast(res?.message || "Failed to restore defaults", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error syncing defaults", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // ── DROPDOWN CRUD HANDLERS ────────────────────────────────────────────────
  const openCreateDropdownModal = (defaultSection = "Photos & Images") => {
    setEditingDropdownId(null);
    setDropdownFormData({
      section: defaultSection,
      label: "",
      path: defaultSection === "Field Videos" ? "/gallery-9?filter=Videos" : defaultSection === "Events & Albums" ? "/gallery-9?cat=Events" : "/gallery-9?filter=Photos",
      sort_order: dropdowns.length + 1,
      is_active: 1
    });
    setShowDropdownModal(true);
  };

  const openEditDropdownModal = (item) => {
    setEditingDropdownId(item.id);
    setDropdownFormData({
      section: item.section || "Photos & Images",
      label: item.label || "",
      path: item.path || "/gallery-9",
      sort_order: item.sort_order || 0,
      is_active: Number(item.is_active) !== 0 ? 1 : 0
    });
    setShowDropdownModal(true);
  };

  const handleSaveDropdown = async (e) => {
    e.preventDefault();
    if (!dropdownFormData.label.trim()) {
      showToast("Please enter a link label", "error");
      return;
    }
    if (!dropdownFormData.path.trim()) {
      showToast("Please enter a destination path", "error");
      return;
    }

    setIsSavingDropdown(true);
    try {
      let res;
      if (editingDropdownId) {
        res = await adminUpdateGalleryDropdown(adminKey, editingDropdownId, dropdownFormData);
      } else {
        res = await adminCreateGalleryDropdown(adminKey, dropdownFormData);
      }

      if (res && res.success) {
        showToast(editingDropdownId ? "Dropdown item updated!" : "New dropdown link created!", "success");
        setShowDropdownModal(false);
        loadDropdowns();
        // Dispatch live update to Navbar
        window.dispatchEvent(new Event("alertngo_gallery_dropdowns_updated"));
      } else {
        showToast(res?.message || "Failed to save dropdown item", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving dropdown item", "error");
    } finally {
      setIsSavingDropdown(false);
    }
  };

  const handleToggleDropdownActive = async (id, currentVal) => {
    const nextVal = currentVal ? 0 : 1;
    setDropdowns((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_active: nextVal } : d))
    );
    try {
      const res = await adminToggleGalleryDropdown(adminKey, id, nextVal);
      if (res && res.success) {
        showToast(nextVal ? "Dropdown item shown on Navbar" : "Dropdown item hidden from Navbar", "success");
        window.dispatchEvent(new Event("alertngo_gallery_dropdowns_updated"));
      } else {
        loadDropdowns();
        showToast(res?.message || "Failed to toggle status", "error");
      }
    } catch (err) {
      loadDropdowns();
      showToast("Error toggling dropdown visibility", "error");
    }
  };

  const confirmDeleteDropdown = async () => {
    if (!deleteDropdownTarget) return;
    setIsDeletingDropdown(true);
    try {
      const res = await adminDeleteGalleryDropdown(adminKey, deleteDropdownTarget.id);
      if (res && res.success) {
        showToast("Dropdown item permanently deleted", "success");
        setDeleteDropdownTarget(null);
        loadDropdowns();
        window.dispatchEvent(new Event("alertngo_gallery_dropdowns_updated"));
      } else {
        showToast(res?.message || "Failed to delete item", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting dropdown item", "error");
    } finally {
      setIsDeletingDropdown(false);
    }
  };

  const handleRestoreDropdownDefaults = async () => {
    setIsSyncingDropdowns(true);
    try {
      const res = await adminSeedGalleryDropdowns(adminKey);
      if (res && res.success) {
        showToast(res.message || "Default navbar dropdown links restored!", "success");
        setShowDropdownSyncModal(false);
        loadDropdowns();
        window.dispatchEvent(new Event("alertngo_gallery_dropdowns_updated"));
      } else {
        showToast(res?.message || "Failed to restore defaults", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error syncing dropdown defaults", "error");
    } finally {
      setIsSyncingDropdowns(false);
    }
  };

  // Copy link
  const copyLink = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Path copied to clipboard!", "success");
  };

  return (
    <AdminLayout title="Videos & Images">
      <style>{`
        .adm-modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .adm-modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid #1f2937;
        }

        @media (max-width: 768px) {
          .adm-gal-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            gap: 8px !important;
            width: 100% !important;
            scrollbar-width: thin !important;
          }
          .adm-gal-tabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.78rem !important;
            padding: 8px 12px !important;
            min-height: 36px !important;
          }
          .adm-gal-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 18px !important;
          }
          .adm-gal-head h1 {
            font-size: 1.35rem !important;
          }
          .adm-gal-head p {
            font-size: 0.8rem !important;
          }
          .adm-gal-badge-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }
          .adm-gal-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-gal-actions > * {
            width: 100% !important;
            padding: 8px 10px !important;
            font-size: 0.78rem !important;
            text-align: center !important;
            justify-content: center !important;
            margin: 0 !important;
            height: 38px !important;
            min-height: 38px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .adm-gal-actions > a:first-child {
            grid-column: 1 / -1 !important;
          }
          .adm-gal-metrics {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
          }
          .adm-gal-metrics > div {
            padding: 10px 12px !important;
            border-radius: 10px !important;
          }
          .adm-gal-metrics > div > div:nth-child(2) {
            font-size: 1.35rem !important;
            margin-top: 4px !important;
          }
          .adm-gal-metrics > div > div:nth-child(3) {
            font-size: 0.7rem !important;
            line-height: 1.2 !important;
            margin-top: 2px !important;
          }
          .adm-gal-metrics > div:last-child {
            grid-column: 1 / -1 !important;
          }
          .adm-gal-pills {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            gap: 6px !important;
            width: 100% !important;
            scrollbar-width: thin !important;
          }
          .adm-gal-pills button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.76rem !important;
            padding: 6px 10px !important;
            min-height: 30px !important;
          }
          .adm-gal-search {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .adm-gal-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-gal-modal {
            max-width: calc(100vw - 10px) !important;
            width: calc(100vw - 10px) !important;
            padding: 14px 10px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
          }
          .adm-gal-modal * {
            box-sizing: border-box !important;
          }
          .adm-gal-modal h3 {
            font-size: 1.05rem !important;
          }
          .adm-modal-form-grid {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .adm-modal-form-grid > * {
            width: 100% !important;
          }
          .adm-gal-modal input,
          .adm-gal-modal select,
          .adm-gal-modal textarea {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            font-size: 0.85rem !important;
            padding: 9px 11px !important;
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
          .adm-dropdown-header-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-dropdown-header-actions button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 8px 10px !important;
            font-size: 0.78rem !important;
            height: 38px !important;
            min-height: 38px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .adm-dropdown-section-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 12px 14px !important;
          }
          .adm-dropdown-section-head button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            height: 36px !important;
          }
          .adm-dropdown-item-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 12px 10px !important;
          }
          .adm-dropdown-item-info {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
            min-width: 0 !important;
          }
          .adm-dropdown-item-info-top {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .adm-dropdown-item-info .item-index {
            font-size: 0.75rem !important;
            color: #64748b !important;
            width: auto !important;
            flex-shrink: 0 !important;
          }
          .adm-dropdown-item-info .item-label {
            font-weight: 700 !important;
            color: #fff !important;
            font-size: 0.92rem !important;
            white-space: normal !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            min-width: 0 !important;
            flex: 1 !important;
          }
          .adm-dropdown-item-info .item-path {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            font-size: 0.76rem !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: block !important;
            padding: 4px 8px !important;
          }
          .adm-dropdown-item-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr 40px !important;
            align-items: center !important;
            gap: 6px !important;
            border-top: 1px solid #1e293b !important;
            padding-top: 8px !important;
          }
          .adm-dropdown-item-actions button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 6px 8px !important;
            font-size: 0.74rem !important;
            height: 34px !important;
            min-height: 34px !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
      <div style={{ width: "100%", boxSizing: "border-box", color: "#f8fafc" }}>

        {/* Toast */}
        {toast.show && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 99999,
              padding: "12px 20px",
              borderRadius: 10,
              background: toast.type === "error" ? "#dc2626" : "#059669",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "fadeIn 0.2s ease"
            }}
          >
            {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* TOP VIEW TAB SWITCHER */}
        <div className="adm-gal-tabs" style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: "1px solid #1f2937", paddingBottom: 16 }}>
          <button
            onClick={() => setViewTab("media")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "media" ? "#0284c7" : "#1f2937",
              background: viewTab === "media" ? "rgba(2, 132, 199, 0.2)" : "#111827",
              color: viewTab === "media" ? "#38bdf8" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaPhotoVideo size={16} /> 🖼️ Media Catalog ({items.length})
          </button>

          <button
            onClick={() => setViewTab("dropdowns")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "dropdowns" ? "#ea580c" : "#1f2937",
              background: viewTab === "dropdowns" ? "rgba(234, 88, 12, 0.2)" : "#111827",
              color: viewTab === "dropdowns" ? "#fb923c" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaBars size={15} /> 📑 Navbar Dropdown Menus Manager ({dropdowns.length})
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: MEDIA CATALOG                                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "media" && (
          <>
            {/* TOP BAR */}
            <div
              className="adm-gal-head"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 28
              }}
            >
              <div>
                <div className="adm-gal-badge-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "rgba(225, 29, 72, 0.15)",
                      color: "#fb7185",
                      border: "1px solid rgba(225, 29, 72, 0.3)",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5
                    }}
                  >
                    <FaPhotoVideo size={12} /> Media Repository
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Connected to MySQL table `gallery_items`
                  </span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
                  Videos & Images Management
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Manage all authentic field photos, community reels, and documentary videos shown on{" "}
                  <Link to="/gallery-9" target="_blank" style={{ color: "#38bdf8", textDecoration: "none" }}>
                    /gallery-9
                  </Link>{" "}
                  and{" "}
                  <Link to="/gallery" target="_blank" style={{ color: "#38bdf8", textDecoration: "none" }}>
                    /gallery
                  </Link>.
                </p>
              </div>

              <div className="adm-gal-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  to="/gallery-9"
                  target="_blank"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    color: "#cbd5e1",
                    textDecoration: "none",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                >
                  <FaExternalLinkAlt size={12} /> View Public Gallery
                </Link>

                <button
                  onClick={() => setShowSyncModal(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 16px",
                    background: "rgba(100, 116, 139, 0.15)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    borderRadius: 8,
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 600
                  }}
                >
                  <FaSyncAlt size={12} /> Restore Defaults
                </button>

                <button
                  onClick={() => openCreateModal("image")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 18px",
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)"
                  }}
                >
                  <FaImages size={13} /> + Add Photo
                </button>

                <button
                  onClick={() => openCreateModal("video")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 18px",
                    background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(225, 29, 72, 0.35)"
                  }}
                >
                  <FaVideo size={13} /> + Add Video
                </button>

                <button
                  onClick={() => openCreateModal("image", "Events")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 18px",
                    background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.35)"
                  }}
                >
                  <FaCalendarAlt size={13} /> + Add Event Media
                </button>
              </div>
            </div>

            {/* METRICS ROW */}
            <div
              className="adm-gal-metrics"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 26
              }}
            >
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Total Media</span>
                  <FaPhotoVideo size={16} color="#38bdf8" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fff", marginTop: 8 }}>{stats.total}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Combined photography & videos</div>
              </div>

              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Photos & Images</span>
                  <FaImages size={16} color="#34d399" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#34d399", marginTop: 8 }}>{stats.imagesCount}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Archival field images</div>
              </div>

              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Field Videos & Reels</span>
                  <FaVideo size={16} color="#fb7185" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fb7185", marginTop: 8 }}>{stats.videosCount}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Community video clips</div>
              </div>

              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Events Media</span>
                  <FaCalendarAlt size={16} color="#fb923c" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fb923c", marginTop: 8 }}>{stats.eventsCount}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Conventions, meets & assemblies</div>
              </div>

              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Active Published</span>
                  <FaCheckCircle size={16} color="#a78bfa" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#a78bfa", marginTop: 8 }}>{stats.activeCount}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Currently live on site</div>
              </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>

                {/* TYPE TABS: ALL / PHOTOS / VIDEOS / EVENTS */}
                <div style={{ display: "flex", gap: 6, background: "#0b0f17", padding: 4, borderRadius: 8 }}>
                  <button
                    onClick={() => { setTypeFilter("all"); setCatFilter("all"); }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: typeFilter === "all" && catFilter === "all" ? "#0284c7" : "transparent",
                      color: typeFilter === "all" && catFilter === "all" ? "#fff" : "#94a3b8",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    All ({stats.total})
                  </button>
                  <button
                    onClick={() => { setTypeFilter("image"); setCatFilter("all"); }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: typeFilter === "image" && catFilter === "all" ? "#0284c7" : "transparent",
                      color: typeFilter === "image" && catFilter === "all" ? "#fff" : "#94a3b8",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <FaImages size={12} /> Photos ({stats.imagesCount})
                  </button>
                  <button
                    onClick={() => { setTypeFilter("video"); setCatFilter("all"); }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: typeFilter === "video" && catFilter === "all" ? "#e11d48" : "transparent",
                      color: typeFilter === "video" && catFilter === "all" ? "#fff" : "#94a3b8",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <FaVideo size={12} /> Videos ({stats.videosCount})
                  </button>
                  <button
                    onClick={() => {
                      if (catFilter === "Events") {
                        setCatFilter("all");
                      } else {
                        setCatFilter("Events");
                        setTypeFilter("all");
                      }
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: catFilter === "Events" ? "#ea580c" : "transparent",
                      color: catFilter === "Events" ? "#fff" : "#94a3b8",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <FaCalendarAlt size={12} /> Events ({stats.eventsCount})
                  </button>
                </div>

                {/* SEARCH BOX */}
                <div className="adm-gal-search" style={{ position: "relative", minWidth: 0, width: "100%", maxWidth: 420 }}>
                  <FaSearch
                    size={13}
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search media by title or topic..."
                    style={{
                      width: "100%",
                      padding: "9px 14px 9px 36px",
                      background: "#0b0f17",
                      border: "1px solid #1f2937",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: "0.88rem",
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
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      <FaTimes size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div className="adm-gal-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                  Category:
                </span>
                <button
                  onClick={() => setCatFilter("all")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "1px solid",
                    borderColor: catFilter === "all" ? "#38bdf8" : "#1f2937",
                    background: catFilter === "all" ? "rgba(56, 189, 248, 0.15)" : "#0b0f17",
                    color: catFilter === "all" ? "#38bdf8" : "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  All Categories
                </button>
                {availableCategories.map((c) => {
                  const count = items.filter((i) => i.cat === c).length;
                  const isSelected = catFilter === c;
                  const theme = CATEGORY_COLORS[c] || CATEGORY_COLORS["General"];
                  return (
                    <button
                      key={c}
                      onClick={() => setCatFilter(c)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: "1px solid",
                        borderColor: isSelected ? theme.border : "#1f2937",
                        background: isSelected ? theme.bg : "#0b0f17",
                        color: isSelected ? theme.text : "#94a3b8",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      {c} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MEDIA LIST / GRID */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>Loading media items from database...</div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "70px 20px",
                  background: "#111827",
                  border: "1px dashed #374151",
                  borderRadius: 14
                }}
              >
                <FaPhotoVideo size={42} style={{ color: "#475569", marginBottom: 16 }} />
                <h3 style={{ fontSize: "1.2rem", color: "#f1f5f9", margin: "0 0 6px" }}>No media items found</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem", maxWidth: 440, margin: "0 auto 20px" }}>
                  No media matches your search or category filters.
                </p>
                <button
                  onClick={() => { setSearch(""); setTypeFilter("all"); setCatFilter("all"); }}
                  style={{
                    padding: "9px 18px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                className="adm-gal-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                  gap: 20
                }}
              >
                {filteredItems.map((item) => {
                  const isVideo = item.type === "video";
                  const isActive = Number(item.is_active) !== 0;
                  const catTheme = CATEGORY_COLORS[item.cat] || CATEGORY_COLORS["General"];
                  const thumbSrc = isVideo ? (item.poster || item.src) : item.src;

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: "#111827",
                        border: "1px solid #1f2937",
                        borderRadius: 12,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        opacity: isActive ? 1 : 0.65,
                        transition: "transform 0.2s, border-color 0.2s",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)"
                      }}
                    >
                      {/* THUMBNAIL / PREVIEW */}
                      <div style={{ height: 180, background: "#000", position: "relative", overflow: "hidden" }}>
                        <AdminMediaThumbnail item={item} />

                        {isVideo && (
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              left: 10,
                              background: "rgba(225, 29, 72, 0.9)",
                              backdropFilter: "blur(4px)",
                              color: "#fff",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}
                          >
                            <FaPlay size={8} /> Video {item.duration ? `· ${item.duration}` : ""}
                          </div>
                        )}

                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            background: catTheme.bg,
                            border: `1px solid ${catTheme.border}`,
                            backdropFilter: "blur(4px)",
                            color: catTheme.text,
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700
                          }}
                        >
                          {item.cat}
                        </div>

                        {!isActive && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 10,
                              left: 10,
                              background: "rgba(0,0,0,0.85)",
                              color: "#f87171",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5
                            }}
                          >
                            <FaEyeSlash size={10} /> Hidden on Site
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h4 style={{ margin: "0 0 8px", fontSize: "0.98rem", fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>
                          {item.title}
                        </h4>

                        {item.description && (
                          <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 12px", lineHeight: 1.4, flex: 1 }}>
                            {item.description}
                          </p>
                        )}

                        <div
                          style={{
                            background: "#0b0f17",
                            borderRadius: 6,
                            padding: "6px 10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 14,
                            fontSize: "0.75rem",
                            color: "#64748b"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }} title={item.src}>
                            {item.src}
                          </span>
                          <button onClick={() => copyLink(item.src)} title="Copy file path" style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2 }}>
                            <FaCopy size={11} />
                          </button>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #1f2937", marginTop: "auto" }}>
                          <button
                            onClick={() => handleToggleActive(item.id, isActive)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "6px 10px",
                              background: isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                              borderRadius: 6,
                              color: isActive ? "#34d399" : "#fca5a5",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            {isActive ? <FaEye size={11} /> : <FaEyeSlash size={11} />}
                            <span>{isActive ? "Visible" : "Hidden"}</span>
                          </button>

                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => openEditModal(item)}
                              style={{
                                padding: "6px 10px",
                                background: "rgba(2, 132, 199, 0.15)",
                                border: "1px solid rgba(2, 132, 199, 0.35)",
                                borderRadius: 6,
                                color: "#38bdf8",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5
                              }}
                            >
                              <FaEdit size={11} /> Edit
                            </button>

                            <button
                              onClick={() => setDeleteTarget(item)}
                              style={{
                                padding: "6px 10px",
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.35)",
                                borderRadius: 6,
                                color: "#f87171",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5
                              }}
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
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: NAVBAR DROPDOWN MENUS MANAGER                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "dropdowns" && (
          <div>
            {/* TOP BAR FOR DROPDOWNS */}
            <div
              className="adm-gal-head"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 26
              }}
            >
              <div>
                <div className="adm-gal-badge-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "rgba(234, 88, 12, 0.18)",
                      color: "#fb923c",
                      border: "1px solid rgba(234, 88, 12, 0.3)",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5
                    }}
                  >
                    <FaBars size={12} /> Navigation Architecture
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Connected to MySQL table `gallery_dropdowns`
                  </span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
                  Navbar Dropdown Menus Manager
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Create, edit, reorder, or delete any dropdown links displayed under the <strong>"Videos & Images"</strong> navbar menu.
                </p>
              </div>

              <div className="adm-dropdown-header-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowDropdownSyncModal(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 16px",
                    background: "rgba(100, 116, 139, 0.15)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    borderRadius: 8,
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 600
                  }}
                >
                  <FaSyncAlt size={12} /> Reset 11 Defaults
                </button>

                <button
                  onClick={() => openCreateDropdownModal("Photos & Images")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 18px",
                    background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.35)"
                  }}
                >
                  <FaPlus size={12} /> Add Dropdown Link
                </button>
              </div>
            </div>

            {/* DROPDOWN SECTIONS CARDS */}
            {dropdownLoading ? (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>Loading dropdown menus from database...</div>
              </div>
            ) : Object.keys(groupedDropdowns).length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#111827", borderRadius: 12 }}>
                <p style={{ color: "#94a3b8" }}>No dropdown items found in database.</p>
                <button onClick={() => setShowDropdownSyncModal(true)} style={{ padding: "8px 16px", background: "#ea580c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                  Restore Defaults
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {Object.entries(groupedDropdowns).map(([sectionName, sectionItems]) => {
                  const isPhotoSec = sectionName.toLowerCase().includes("photo") || sectionName.toLowerCase().includes("image");
                  const isVideoSec = sectionName.toLowerCase().includes("video");
                  const isEventSec = sectionName.toLowerCase().includes("event");

                  const secIcon = isPhotoSec ? FaImages : isVideoSec ? FaVideo : isEventSec ? FaCalendarAlt : FaList;
                  const secColor = isPhotoSec ? "#38bdf8" : isVideoSec ? "#fb7185" : isEventSec ? "#fb923c" : "#a78bfa";
                  const SecIconComp = secIcon;

                  return (
                    <div
                      key={sectionName}
                      style={{
                        background: "#111827",
                        border: "1px solid #1f2937",
                        borderRadius: 14,
                        overflow: "hidden"
                      }}
                    >
                      {/* SECTION HEADER */}
                      <div
                        className="adm-dropdown-section-head"
                        style={{
                          padding: "16px 22px",
                          background: "#0b0f17",
                          borderBottom: "1px solid #1f2937",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 12
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.06)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: secColor
                            }}
                          >
                            <SecIconComp size={16} />
                          </span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
                              {sectionName}
                            </h3>
                            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                              {sectionItems.length} dropdown {sectionItems.length === 1 ? "link" : "links"} configured
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openCreateDropdownModal(sectionName)}
                          style={{
                            padding: "7px 14px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 6,
                            color: "#fff",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <FaPlus size={10} /> Add to {sectionName}
                        </button>
                      </div>

                      {/* SECTION LINKS LIST */}
                      <div style={{ padding: "12px 18px" }}>
                        {sectionItems.length === 0 ? (
                          <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b", fontSize: "0.86rem" }}>
                            No links in this dropdown section yet.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {sectionItems.map((item, idx) => {
                              const isActive = Number(item.is_active) !== 0;
                              return (
                                <div
                                  key={item.id}
                                  className="adm-dropdown-item-row"
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "10px 14px",
                                    background: "#0d131f",
                                    border: "1px solid #1e293b",
                                    borderRadius: 8,
                                    gap: 12,
                                    opacity: isActive ? 1 : 0.6
                                  }}
                                >
                                  <div className="adm-dropdown-item-info" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, overflow: "hidden" }}>
                                    <div className="adm-dropdown-item-info-top" style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                      <span className="item-index" style={{ fontSize: "0.75rem", color: "#64748b", width: 20, textAlign: "center", flexShrink: 0 }}>
                                        #{idx + 1}
                                      </span>
                                      <span className="item-label" style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                                        {item.label}
                                      </span>
                                    </div>
                                    <span
                                      className="item-path"
                                      style={{
                                        fontSize: "0.78rem",
                                        color: "#38bdf8",
                                        background: "rgba(56, 189, 248, 0.1)",
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: 260
                                      }}
                                      title={item.path}
                                    >
                                      {item.path}
                                    </span>
                                  </div>

                                  <div className="adm-dropdown-item-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {/* VISIBILITY TOGGLE */}
                                    <button
                                      onClick={() => handleToggleDropdownActive(item.id, isActive)}
                                      title={isActive ? "Hide from navbar dropdown" : "Show on navbar dropdown"}
                                      style={{
                                        padding: "5px 9px",
                                        background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                                        border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                                        borderRadius: 6,
                                        color: isActive ? "#34d399" : "#fca5a5",
                                        fontSize: "0.74rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4
                                      }}
                                    >
                                      {isActive ? <FaEye size={10} /> : <FaEyeSlash size={10} />}
                                      <span>{isActive ? "Active" : "Hidden"}</span>
                                    </button>

                                    {/* EDIT BUTTON */}
                                    <button
                                      onClick={() => openEditDropdownModal(item)}
                                      title="Edit dropdown link"
                                      style={{
                                        padding: "5px 9px",
                                        background: "rgba(2, 132, 199, 0.15)",
                                        border: "1px solid rgba(2, 132, 199, 0.35)",
                                        borderRadius: 6,
                                        color: "#38bdf8",
                                        fontSize: "0.76rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4
                                      }}
                                    >
                                      <FaEdit size={10} /> Edit
                                    </button>

                                    {/* DELETE BUTTON */}
                                    <button
                                      onClick={() => setDeleteDropdownTarget(item)}
                                      title="Delete dropdown link"
                                      style={{
                                        padding: "5px 9px",
                                        background: "rgba(239, 68, 68, 0.15)",
                                        border: "1px solid rgba(239, 68, 68, 0.35)",
                                        borderRadius: 6,
                                        color: "#f87171",
                                        fontSize: "0.76rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4
                                      }}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE / EDIT MEDIA MODAL ────────────────────────────────────── */}
        {showModal && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => !isSaving && setShowModal(false)}
          >
            <div
              className="adm-gal-modal"
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 14,
                maxWidth: 620,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "26px 30px",
                color: "#fff",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f2937", paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                    {editingId ? "Edit Media Item" : "Add New Media Item"}
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                    Configure photo or video for the public gallery on /gallery-9
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} disabled={isSaving} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 8 }}>Media Type *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: "image" }))}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "2px solid",
                        borderColor: formData.type === "image" ? "#0284c7" : "#1f2937",
                        background: formData.type === "image" ? "rgba(2, 132, 199, 0.18)" : "#0b0f17",
                        color: formData.type === "image" ? "#38bdf8" : "#94a3b8",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8
                      }}
                    >
                      <FaImages size={15} /> 📷 Photo / Image
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: "video" }))}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "2px solid",
                        borderColor: formData.type === "video" ? "#e11d48" : "#1f2937",
                        background: formData.type === "video" ? "rgba(225, 29, 72, 0.18)" : "#0b0f17",
                        color: formData.type === "video" ? "#fb7185" : "#94a3b8",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8
                      }}
                    >
                      <FaVideo size={15} /> 🎥 Field Video / Reel
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Media Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Godavari Basin Relief Operations"
                    required
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem", outline: "none" }}
                  />
                </div>

                <div className="adm-modal-form-grid">
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Category Tag *</label>
                    <select
                      name="cat"
                      value={formData.cat}
                      onChange={handleChange}
                      style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem", outline: "none", cursor: "pointer" }}
                    >
                      {STANDARD_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Custom Category (Optional)</label>
                    <input
                      type="text"
                      placeholder="Or type custom category..."
                      value={STANDARD_CATEGORIES.includes(formData.cat) ? "" : formData.cat}
                      onChange={(e) => { if (e.target.value.trim()) setFormData((prev) => ({ ...prev, cat: e.target.value })); }}
                      style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                </div>

                {formData.type === "image" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Photo / Image Source *</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <input type="file" ref={imageInputRef} accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e, "src")} />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        style={{ padding: "9px 16px", background: "#0284c7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <FaCloudUploadAlt size={15} />
                        {isUploadingImage ? "Uploading Photo..." : "Upload Photo File"}
                      </button>
                      <input
                        type="text"
                        name="src"
                        value={formData.src}
                        onChange={handleChange}
                        placeholder="/uploads/your-image.jpg"
                        style={{ flex: 1, padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.86rem", outline: "none" }}
                      />
                    </div>
                    {formData.src && (
                      <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: "1px solid #1f2937", height: 140, background: "#000" }}>
                        <img src={formData.src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      </div>
                    )}
                  </div>
                )}

                {formData.type === "video" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Video Source (.mp4, .webm or YouTube URL) *</label>
                      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                        <input type="file" ref={videoInputRef} accept="video/mp4,video/webm,video/quicktime" style={{ display: "none" }} onChange={handleVideoUpload} />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={isUploadingVideo}
                          style={{ padding: "9px 16px", background: "#e11d48", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          <FaCloudUploadAlt size={15} />
                          {isUploadingVideo ? `Uploading (${typeof videoProgress === "object" && videoProgress !== null ? (videoProgress.percent ?? 0) : (Number(videoProgress) || 0)}%)` : "Upload Video File"}
                        </button>
                        <input
                          type="text"
                          name="src"
                          value={formData.src}
                          onChange={handleChange}
                          placeholder="/uploads/gallery/videos/clip.mp4 or YouTube link"
                          style={{ flex: 1, padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.86rem", outline: "none" }}
                        />
                      </div>
                      {isUploadingVideo && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#fb7185", marginBottom: 4 }}>
                            <span>Streaming Video Upload...</span>
                            <span>{typeof videoProgress === "object" && videoProgress !== null ? (videoProgress.percent ?? 0) : (Number(videoProgress) || 0)}%</span>
                          </div>
                          <div style={{ height: 6, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${typeof videoProgress === "object" && videoProgress !== null ? (videoProgress.percent ?? 0) : (Number(videoProgress) || 0)}%`, height: "100%", background: "linear-gradient(90deg, #e11d48, #fb7185)", transition: "width 0.2s" }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="adm-modal-form-grid">
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Poster / Cover Image</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <input type="file" ref={posterInputRef} accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e, "poster")} />
                          <button type="button" onClick={() => posterInputRef.current?.click()} disabled={isUploadingPoster} style={{ padding: "8px 12px", background: "#334155", border: "none", borderRadius: 6, color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            {isUploadingPoster ? "Uploading..." : "Upload Cover"}
                          </button>
                          <button
                            type="button"
                            onClick={handleAutoCapturePoster}
                            disabled={isCapturingPoster || !formData.src}
                            title="Auto-extract cover thumbnail from video"
                            style={{
                              padding: "8px 12px",
                              background: "rgba(225, 29, 72, 0.2)",
                              border: "1px solid rgba(225, 29, 72, 0.45)",
                              borderRadius: 6,
                              color: "#fb7185",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: !formData.src ? "not-allowed" : "pointer"
                            }}
                          >
                            {isCapturingPoster ? "Extracting..." : "📸 Auto-Cover"}
                          </button>
                          <input type="text" name="poster" value={formData.poster} onChange={handleChange} placeholder="Cover image path..." style={{ flex: 1, minWidth: 160, padding: "8px 10px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem", outline: "none" }} />
                        </div>
                        {formData.poster && (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                            <img src={formData.poster} alt="Cover preview" style={{ width: 70, height: 42, objectFit: "cover", borderRadius: 4, border: "1px solid #334155" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                            <span style={{ fontSize: "0.74rem", color: "#34d399" }}>Cover image attached</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Video Duration (e.g. 0:08, 1:45)</label>
                        <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="0:08" style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.86rem", outline: "none" }} />
                      </div>
                    </div>

                    {formData.src && (
                      <div style={{ marginTop: 6, background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#cbd5e1" }}>Media Live Preview</span>
                          <span style={{ fontSize: "0.72rem", color: formData.poster ? "#34d399" : "#fb7185" }}>
                            {formData.poster ? "✓ Cover Poster Set" : "⚠️ Auto First Frame used"}
                          </span>
                        </div>
                        {isYouTubeUrl(formData.src) ? (
                          <div style={{ aspectRatio: "16/9", maxHeight: 200, width: "100%" }}>
                            <iframe
                              src={formData.src.replace("watch?v=", "embed/")}
                              title="YouTube preview"
                              style={{ width: "100%", height: "100%", border: "none", borderRadius: 6 }}
                            />
                          </div>
                        ) : (
                          <video
                            src={formData.src}
                            poster={formData.poster}
                            controls
                            preload="metadata"
                            style={{ width: "100%", maxHeight: 200, borderRadius: 6, background: "#000", objectFit: "contain" }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Description / Caption</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Short description or community context..." style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.86rem", outline: "none", resize: "vertical" }} />
                </div>

                <div className="adm-modal-form-grid">
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Sort Order</label>
                    <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.86rem", outline: "none" }} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Publication Status</label>
                    <select name="is_active" value={formData.is_active} onChange={handleChange} style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.86rem", outline: "none", cursor: "pointer" }}>
                      <option value={1}>✅ Published (Live on Site)</option>
                      <option value={0}>❌ Hidden (Draft / Private)</option>
                    </select>
                  </div>
                </div>

                <div className="adm-modal-footer-actions">
                  <button type="button" onClick={() => setShowModal(false)} disabled={isSaving} style={{ padding: "10px 18px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={isSaving} style={{ padding: "10px 22px", background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <FaSave size={14} />
                    {isSaving ? "Saving Media..." : editingId ? "Save Changes" : "Create Media Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT DROPDOWN MODAL ─────────────────────────────────── */}
        {showDropdownModal && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => !isSavingDropdown && setShowDropdownModal(false)}
          >
            <div
              className="adm-gal-modal"
              style={{
                background: "#111827",
                border: "1px solid #ea580c",
                borderRadius: 14,
                maxWidth: 580,
                width: "100%",
                padding: "26px 30px",
                color: "#fff",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f2937", paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                    {editingDropdownId ? "Edit Dropdown Link" : "Add New Dropdown Link"}
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                    Configure a navigation link under "Videos & Images" in the navbar
                  </p>
                </div>
                <button onClick={() => setShowDropdownModal(false)} disabled={isSavingDropdown} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveDropdown} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Dropdown Group / Section *
                  </label>
                  <div className="adm-modal-form-grid" style={{ marginBottom: 8 }}>
                    <select
                      value={dropdownFormData.section}
                      onChange={(e) => setDropdownFormData((prev) => ({ ...prev, section: e.target.value }))}
                      style={{ padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem", outline: "none", cursor: "pointer" }}
                    >
                      {STANDARD_DROPDOWN_SECTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                      <option value="Custom Group">Or type new group below...</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Custom Section Group..."
                      value={STANDARD_DROPDOWN_SECTIONS.includes(dropdownFormData.section) ? "" : dropdownFormData.section}
                      onChange={(e) => { if (e.target.value.trim()) setDropdownFormData((prev) => ({ ...prev, section: e.target.value })); }}
                      style={{ padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Link Label (Text displayed in menu) *
                  </label>
                  <input
                    type="text"
                    value={dropdownFormData.label}
                    onChange={(e) => setDropdownFormData((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Cultural Conclave & Festivals"
                    required
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Target Path / URL *
                  </label>
                  <input
                    type="text"
                    value={dropdownFormData.path}
                    onChange={(e) => setDropdownFormData((prev) => ({ ...prev, path: e.target.value }))}
                    placeholder="/gallery-9?cat=Events or /gallery-9?filter=Videos"
                    required
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem", outline: "none", marginBottom: 8 }}
                  />

                  {/* PRESET SHORTCUTS */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Quick presets:</span>
                    {[
                      { l: "All Photos", p: "/gallery-9?filter=Photos" },
                      { l: "All Videos", p: "/gallery-9?filter=Videos" },
                      { l: "All Events", p: "/gallery-9?cat=Events" },
                      { l: "Event Photos", p: "/gallery-9?cat=Events&filter=Photos" },
                      { l: "Event Videos", p: "/gallery-9?cat=Events&filter=Videos" },
                      { l: "Event Album", p: "/gallery" }
                    ].map((btn) => (
                      <button
                        type="button"
                        key={btn.l}
                        onClick={() => setDropdownFormData((prev) => ({ ...prev, path: btn.p }))}
                        style={{ padding: "3px 8px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 4, color: "#38bdf8", fontSize: "0.72rem", cursor: "pointer" }}
                      >
                        {btn.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="adm-modal-form-grid">
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Sort Order</label>
                    <input
                      type="number"
                      value={dropdownFormData.sort_order}
                      onChange={(e) => setDropdownFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.86rem", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Navbar Visibility</label>
                    <select
                      value={dropdownFormData.is_active}
                      onChange={(e) => setDropdownFormData((prev) => ({ ...prev, is_active: parseInt(e.target.value) }))}
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.86rem", outline: "none", cursor: "pointer" }}
                    >
                      <option value={1}>✅ Visible in Dropdown</option>
                      <option value={0}>❌ Hidden from Dropdown</option>
                    </select>
                  </div>
                </div>

                <div className="adm-modal-footer-actions">
                  <button type="button" onClick={() => setShowDropdownModal(false)} disabled={isSavingDropdown} style={{ padding: "10px 18px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={isSavingDropdown} style={{ padding: "10px 22px", background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <FaSave size={14} />
                    {isSavingDropdown ? "Saving..." : editingDropdownId ? "Save Changes" : "Create Dropdown Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── DELETE DROPDOWN MODAL ────────────────────────────────────────── */}
        {deleteDropdownTarget && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => !isDeletingDropdown && setDeleteDropdownTarget(null)}
          >
            <div className="adm-gal-modal" style={{ background: "#111827", border: "1px solid #ef4444", borderRadius: 14, maxWidth: 460, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                  <FaTrash size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Delete Dropdown Link</h3>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{deleteDropdownTarget.section}</span>
                </div>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 16px" }}>
                Are you sure you want to remove <strong>"{deleteDropdownTarget.label}"</strong> from the navbar dropdown?
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setDeleteDropdownTarget(null)} disabled={isDeletingDropdown} style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="button" onClick={confirmDeleteDropdown} disabled={isDeletingDropdown} style={{ padding: "9px 18px", background: "#dc2626", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {isDeletingDropdown ? "Deleting..." : "Yes, Delete Link"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESTORE DROPDOWN DEFAULTS MODAL ──────────────────────────────── */}
        {showDropdownSyncModal && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => !isSyncingDropdowns && setShowDropdownSyncModal(false)}
          >
            <div className="adm-gal-modal" style={{ background: "#111827", border: "1px solid #ea580c", borderRadius: 14, maxWidth: 480, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(234, 88, 12, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c" }}>
                  <FaSyncAlt size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Reset 11 Default Links</h3>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Resets table `gallery_dropdowns`</span>
                </div>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 16px" }}>
                This will restore the standard 11 dropdown links for Photos, Videos, and Events across the navbar.
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowDropdownSyncModal(false)} disabled={isSyncingDropdowns} style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="button" onClick={handleRestoreDropdownDefaults} disabled={isSyncingDropdowns} style={{ padding: "9px 18px", background: "#ea580c", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {isSyncingDropdowns ? "Restoring..." : "Yes, Restore Defaults"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE MEDIA MODAL ───────────────────────────────────────────── */}
        {deleteTarget && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => !isDeleting && setDeleteTarget(null)}
          >
            <div className="adm-gal-modal" style={{ background: "#111827", border: "1px solid #ef4444", borderRadius: 14, maxWidth: 460, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                  <FaTrash size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Delete Media Item</h3>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>ID #{deleteTarget.id} · {deleteTarget.type === "video" ? "Video" : "Photo"}</span>
                </div>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 16px" }}>
                Are you sure you want to permanently delete:
                <br />
                <strong style={{ color: "#fff" }}>"{deleteTarget.title}"</strong>?
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="button" onClick={confirmDelete} disabled={isDeleting} style={{ padding: "9px 18px", background: "#dc2626", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {isDeleting ? "Deleting..." : "Yes, Delete Item"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESTORE MEDIA DEFAULTS MODAL ─────────────────────────────────── */}
        {showSyncModal && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => !isSyncing && setShowSyncModal(false)}
          >
            <div className="adm-gal-modal" style={{ background: "#111827", border: "1px solid #3b82f6", borderRadius: 14, maxWidth: 480, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
                  <FaSyncAlt size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Restore Media Defaults</h3>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Resets table `gallery_items`</span>
                </div>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 16px" }}>
                This will reset the media items table and re-populate the original photographs, reels and event videos from the archive.
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowSyncModal(false)} disabled={isSyncing} style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="button" onClick={handleRestoreDefaults} disabled={isSyncing} style={{ padding: "9px 18px", background: "#0284c7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {isSyncing ? "Restoring..." : "Yes, Restore Defaults"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
