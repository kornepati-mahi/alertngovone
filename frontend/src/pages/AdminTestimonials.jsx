import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaQuoteLeft, FaStar, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaCloudUploadAlt, FaFolderOpen,
  FaCheckCircle, FaEye, FaSave, FaExternalLinkAlt, FaInfoCircle,
  FaArrowRight, FaCommentDots, FaUser, FaPalette, FaGlobe
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  defaultTestimonials,
  defaultTestimonialsHeader,
  fetchHomeTestimonials,
  adminListTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  adminReorderTestimonials,
  adminSaveTestimonialsHeader,
  adminUploadImage
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";
const TESTIMONIALS_STORAGE_KEY = "alertngo_home_testimonials";
const TESTIMONIALS_HEADER_KEY = "alertngo_home_testimonials_header";

const AVATAR_COLORS = [
  { name: "Crimson Red", hex: "#D2190C" },
  { name: "Forest Green", hex: "#3E8E0F" },
  { name: "Warm Amber", hex: "#F5A623" },
  { name: "Ocean Blue", hex: "#005696" },
  { name: "Royal Purple", hex: "#7B1FA2" },
  { name: "Rose Pink", hex: "#C2185B" },
  { name: "Teal Green", hex: "#00796B" },
  { name: "Deep Indigo", hex: "#512DA8" },
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

function compressAndOptimizeImage(file, maxWidth = 500, maxHeight = 500, quality = 0.85) {
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
        resolve({ dataUrl, width, height });
      };
      img.onerror = () => reject(new Error("Failed to load image for optimization."));
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function AdminTestimonials() {
  const adminKey = sessionStorage.getItem(KEY_STORAGE) || localStorage.getItem(KEY_STORAGE) || "alertngo@123";

  const [testimonials, setTestimonials] = useState(() => {
    try {
      const local = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return defaultTestimonials;
  });

  const [header, setHeader] = useState(() => {
    try {
      const local = localStorage.getItem(TESTIMONIALS_HEADER_KEY);
      if (local) return JSON.parse(local);
    } catch { }
    return defaultTestimonialsHeader;
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Form State for Testimonial item
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formText, setFormText] = useState("");
  const [formAvatar, setFormAvatar] = useState(null);
  const [formAvatarColor, setFormAvatarColor] = useState("#D2190C");
  const [formRating, setFormRating] = useState(5);
  const [formSource, setFormSource] = useState("Google");
  const [formIsActive, setFormIsActive] = useState(1);
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Header form
  const [hdrBadge, setHdrBadge] = useState(() => header.badge || "Testimonials");
  const [hdrTitle, setHdrTitle] = useState(() => header.title || "Voices from the Community");
  const [hdrGTitle, setHdrGTitle] = useState(() => header.google_reviews_title || "Google Reviews");
  const [hdrGSub, setHdrGSub] = useState(() => header.google_reviews_subtitle || "See what our community says on Google");
  const [hdrGUrl, setHdrGUrl] = useState(() => header.google_reviews_url || "https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews");
  const [hdrGRating, setHdrGRating] = useState(() => Number(header.google_rating) || 5.0);
  const [hdrGShow, setHdrGShow] = useState(() => (header.show_google_badge !== undefined ? Number(header.show_google_badge) : 1));

  const fileInputRef = useRef(null);

  const showNotice = (msg) => {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 3500);
  };

  const syncTestimonials = (updated) => {
    setTestimonials(updated);
    try {
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(updated));
    } catch { }
    window.dispatchEvent(new CustomEvent("alertngo_testimonials_updated"));
  };

  const syncHeader = (updatedHeader) => {
    setHeader(updatedHeader);
    try {
      localStorage.setItem(TESTIMONIALS_HEADER_KEY, JSON.stringify(updatedHeader));
    } catch { }
    window.dispatchEvent(new CustomEvent("alertngo_testimonials_updated"));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (adminKey) {
        const res = await adminListTestimonials(adminKey);
        if (res && res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            syncTestimonials(res.data);
          }
          if (res.header) {
            syncHeader(res.header);
            setHdrBadge(res.header.badge || "Testimonials");
            setHdrTitle(res.header.title || "Voices from the Community");
            setHdrGTitle(res.header.google_reviews_title || "Google Reviews");
            setHdrGSub(res.header.google_reviews_subtitle || "See what our community says on Google");
            setHdrGUrl(res.header.google_reviews_url || "https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews");
            setHdrGRating(Number(res.header.google_rating) || 5.0);
            setHdrGShow(Number(res.header.show_google_badge) !== 0 ? 1 : 0);
          }
          setLoading(false);
          return;
        }
      }
      const pub = await fetchHomeTestimonials();
      if (pub && pub.data && Array.isArray(pub.data) && pub.data.length > 0) {
        syncTestimonials(pub.data);
      }
      if (pub && pub.header) {
        syncHeader(pub.header);
      }
    } catch (err) {
      console.warn("Could not fetch remote testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Image Processing for avatar photo
  const handleAvatarFile = async (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WEBP).");
      return;
    }
    setAvatarUploadLoading(true);
    setError("");
    try {
      const optimized = await compressAndOptimizeImage(file);
      setFormAvatar(optimized.dataUrl);
      if (adminKey) {
        try {
          const upRes = await adminUploadImage(adminKey, optimized.dataUrl, "testimonials");
          if (upRes && upRes.url) {
            setFormAvatar(upRes.url);
          }
        } catch { }
      }
      showNotice("Reviewer photo uploaded successfully!");
    } catch (err) {
      setError(err.message || "Failed to process image.");
    } finally {
      setAvatarUploadLoading(false);
    }
  };

  // Start edit
  const handleStartEdit = (t) => {
    setEditingId(t.id);
    setFormName(t.name || "");
    setFormRole(t.role || "");
    setFormText(t.text || "");
    setFormAvatar(t.avatar || null);
    setFormAvatarColor(t.avatar_color || "#D2190C");
    setFormRating(t.rating ? Number(t.rating) : 5);
    setFormSource(t.source || "Google");
    setFormIsActive(t.is_active !== undefined ? Number(t.is_active) : 1);
    const formEl = document.getElementById("testimonial-form-card");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
  };

  // Reset form
  const handleResetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormRole("");
    setFormText("");
    setFormAvatar(null);
    setFormAvatarColor("#D2190C");
    setFormRating(5);
    setFormSource("Google");
    setFormIsActive(1);
    setError("");
  };

  // Save Testimonial
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) {
      setError("Reviewer Name and Testimonial Quote text are required.");
      return;
    }
    setError("");

    const payload = {
      name: formName.trim(),
      role: formRole.trim(),
      text: formText.trim(),
      avatar: formAvatar,
      avatar_color: formAvatarColor,
      rating: formRating,
      source: formSource.trim() || "Google",
      is_active: formIsActive ? 1 : 0
    };

    setLoading(true);
    try {
      if (editingId) {
        payload.id = editingId;
        if (adminKey) {
          try {
            await adminUpdateTestimonial(adminKey, payload);
          } catch { }
        }
        const updated = testimonials.map((t) => (t.id === editingId ? { ...t, ...payload } : t));
        syncTestimonials(updated);
        showNotice("Testimonial updated successfully!");
        handleResetForm();
      } else {
        let newItem = {
          id: Date.now(),
          ...payload,
          sort_order: testimonials.length + 1
        };
        if (adminKey) {
          try {
            const res = await adminCreateTestimonial(adminKey, payload);
            if (res && res.data) newItem = res.data;
          } catch { }
        }
        const updated = [...testimonials, newItem];
        syncTestimonials(updated);
        showNotice("New testimonial added to the marquee ribbon!");
        handleResetForm();
      }
    } catch {
      setError("Could not save testimonial. Saved locally.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Testimonial
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete the testimonial from "${name}"?`)) return;
    setLoading(true);
    if (adminKey) {
      try {
        await adminDeleteTestimonial(adminKey, id);
      } catch { }
    }
    const updated = testimonials.filter((t) => t.id !== id);
    syncTestimonials(updated);
    showNotice(`Deleted testimonial from "${name}".`);
    setLoading(false);
  };

  // Toggle active status
  const handleToggleActive = async (t) => {
    const nextState = Number(t.is_active) === 1 ? 0 : 1;
    const updatedItem = { ...t, is_active: nextState };
    const updated = testimonials.map((item) => (item.id === t.id ? updatedItem : item));
    syncTestimonials(updated);
    if (adminKey) {
      try {
        await adminUpdateTestimonial(adminKey, updatedItem);
      } catch { }
    }
    showNotice(`Testimonial marked as ${nextState ? "Active in Marquee" : "Hidden"}.`);
  };

  // Reorder
  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;
    const reordered = [...testimonials];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    syncTestimonials(reordered);
    showNotice("Order updated. Click 'Save Order' to commit to database.");
  };

  // Commit Order to database
  const handleSaveOrder = async () => {
    setLoading(true);
    if (adminKey) {
      try {
        const payload = testimonials.map((t, idx) => ({ id: t.id, sort_order: idx + 1 }));
        await adminReorderTestimonials(adminKey, payload);
        showNotice("Testimonials order saved to database successfully!");
      } catch {
        showNotice("Order saved locally.");
      }
    } else {
      showNotice("Order saved locally.");
    }
    setLoading(false);
  };

  // Save Header & Google Reviews Badge settings
  const handleSaveHeader = async (e) => {
    e.preventDefault();
    if (!hdrTitle.trim()) {
      setError("Section Title cannot be empty.");
      return;
    }
    setError("");
    setLoading(true);
    const payload = {
      badge: hdrBadge.trim(),
      title: hdrTitle.trim(),
      google_reviews_title: hdrGTitle.trim(),
      google_reviews_subtitle: hdrGSub.trim(),
      google_reviews_url: hdrGUrl.trim(),
      google_rating: parseFloat(hdrGRating) || 5.0,
      show_google_badge: hdrGShow ? 1 : 0
    };

    if (adminKey) {
      try {
        const res = await adminSaveTestimonialsHeader(adminKey, payload);
        if (res && res.header) {
          syncHeader(res.header);
          showNotice("Header & Google Reviews badge updated successfully!");
          setLoading(false);
          return;
        }
      } catch { }
    }
    syncHeader(payload);
    showNotice("Header & Google Reviews badge updated successfully!");
    setLoading(false);
  };

  // Reset to default testimonials
  const handleResetDefaults = () => {
    if (!window.confirm("Reset all testimonials and header to default original content?")) return;
    setTestimonials(defaultTestimonials);
    setHeader(defaultTestimonialsHeader);
    setHdrBadge(defaultTestimonialsHeader.badge);
    setHdrTitle(defaultTestimonialsHeader.title);
    setHdrGTitle(defaultTestimonialsHeader.google_reviews_title);
    setHdrGSub(defaultTestimonialsHeader.google_reviews_subtitle);
    setHdrGUrl(defaultTestimonialsHeader.google_reviews_url);
    setHdrGRating(Number(defaultTestimonialsHeader.google_rating) || 5.0);
    setHdrGShow(Number(defaultTestimonialsHeader.show_google_badge) !== 0 ? 1 : 0);
    syncTestimonials(defaultTestimonials);
    syncHeader(defaultTestimonialsHeader);
    showNotice("Reset all testimonials to original defaults.");
  };

  const activeCount = testimonials.filter((t) => Number(t.is_active) !== 0).length;

  return (
    <AdminLayout title="Testimonials & Google Reviews">
      <style>{`
        .test-page {
          width: 100%;
          color: #f1f5f9;
          padding-bottom: 80px;
          box-sizing: border-box;
          font-family: 'Outfit', 'Inter', sans-serif;
        }
        .adm-header-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: linear-gradient(135deg, #141820 0%, #1a202c 100%);
          border: 1px solid #232938;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 24px;
          box-sizing: border-box;
          width: 100%;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-val { font-size: 1.4rem; font-weight: 800; color: #fff; line-height: 1.1; }
        .stat-lbl { font-size: 0.75rem; color: #8892a4; text-transform: uppercase; letter-spacing: 0.05em; }

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

        .info-banner {
          background: rgba(52, 152, 219, 0.1);
          border: 1px solid rgba(52, 152, 219, 0.3);
          color: #70b8ff;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.84rem;
          line-height: 1.5;
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

        .test-grid-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 24px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 1120px) {
          .test-grid-layout { grid-template-columns: 1fr; }
        }

        .test-grid-main { min-width: 0; width: 100%; }
        .test-grid-side { min-width: 0; width: 100%; }

        .adm-card-panel {
          background: #141820;
          border: 1px solid #1e2436;
          border-radius: 14px;
          padding: 22px;
          margin-bottom: 20px;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        .test-preview-sticky {
          position: sticky;
          top: 20px;
          padding: 20px 18px;
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
        @media (max-width: 768px) {
          .form-row-2col, .form-row-half {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }

        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          box-sizing: border-box;
          background: #0d1017;
          border: 1px solid #2a3148;
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-size: 0.88rem;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
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
          transition: all 0.2s;
        }
        .btn-primary:hover { background: #a93226; transform: translateY(-1px); }

        .btn-emerald {
          background: #27ae60;
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s;
        }
        .btn-emerald:hover { background: #219653; }

        .btn-form-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn-secondary {
          background: #1e2436;
          color: #cbd5e1;
          border: 1px solid #2a3148;
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: #252d42; color: #fff; }

        .upload-dropzone {
          border: 2px dashed #2a3148;
          border-radius: 10px;
          padding: 18px 16px;
          text-align: center;
          background: #0f131c;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
          max-width: 100%;
        }
        .upload-dropzone:hover, .upload-dropzone.dragging {
          border-color: #c0392b;
          background: rgba(192, 57, 43, 0.08);
        }

        .test-list-card {
          background: #0f131c;
          border: 1px solid #1e2436;
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
          transition: border-color 0.2s;
          box-sizing: border-box;
          width: 100%;
        }
        .test-list-card:hover {
          border-color: #2a334d;
        }
        .test-list-card.is-hidden {
          opacity: 0.55;
        }

        .reorder-btn {
          background: #1a202c;
          border: 1px solid #2d3748;
          color: #e2e8f0;
          border-radius: 6px;
          padding: 5px 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .reorder-btn:hover:not(:disabled) {
          background: #2d3748;
          color: #fff;
          border-color: #c0392b;
        }
        .reorder-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-status-toggle {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-status-toggle.is-active {
          background: rgba(39, 174, 96, 0.15);
          color: #2ecc71;
          border: 1px solid rgba(39, 174, 96, 0.3);
        }
        .btn-status-toggle.is-inactive {
          background: #1e2436;
          color: #8892a4;
          border: 1px solid #2a3148;
        }

        .btn-action-edit {
          background: #1e2436;
          color: #fff;
          border: 1px solid #2a3148;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s;
        }
        .btn-action-edit:hover { background: #252d42; border-color: #c0392b; }

        .btn-action-delete {
          background: rgba(231, 76, 60, 0.12);
          color: #ff6b6b;
          border: 1px solid rgba(231, 76, 60, 0.25);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          transition: all 0.15s;
        }
        .btn-action-delete:hover {
          background: rgba(231, 76, 60, 0.25);
          border-color: #e74c3c;
        }

        .test-item-top {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 768px) {
          .test-page {
            padding-bottom: 30px !important;
          }
          .adm-header-stats {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 10px !important;
            gap: 10px !important;
            margin-bottom: 14px !important;
            border-radius: 10px !important;
          }
          .adm-stats-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .stat-item {
            gap: 8px !important;
          }
          .stat-icon {
            width: 34px !important;
            height: 34px !important;
            border-radius: 8px !important;
          }
          .stat-icon svg {
            width: 15px !important;
            height: 15px !important;
          }
          .stat-val {
            font-size: 1.05rem !important;
          }
          .stat-lbl {
            font-size: 0.65rem !important;
          }
          .adm-stats-actions {
            display: flex !important;
            gap: 6px !important;
            width: 100% !important;
            flex-direction: column !important;
          }
          .btn-view-site, .btn-reset {
            width: 100% !important;
            flex: none !important;
            height: 32px !important;
            min-height: 32px !important;
            max-height: 32px !important;
            font-size: 0.74rem !important;
            padding: 4px 8px !important;
            border-radius: 6px !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .info-banner {
            padding: 10px 12px !important;
            font-size: 0.74rem !important;
            line-height: 1.35 !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
            border-radius: 9px !important;
          }
          .notice-banner, .error-banner {
            padding: 7px 10px !important;
            font-size: 0.74rem !important;
            border-radius: 7px !important;
            margin-bottom: 12px !important;
          }
          .adm-card-panel {
            padding: 12px 10px !important;
            border-radius: 10px !important;
            margin-bottom: 14px !important;
          }
          .google-pill-box {
            padding: 10px 8px !important;
            border-radius: 8px !important;
            margin-bottom: 12px !important;
          }
          .adm-card-panel h2 {
            font-size: 0.94rem !important;
            padding-bottom: 8px !important;
            margin-bottom: 10px !important;
          }
          .adm-card-panel h2 svg {
            width: 14px !important;
            height: 14px !important;
          }
          .form-group {
            margin-bottom: 10px !important;
          }
          .form-label {
            font-size: 0.74rem !important;
            margin-bottom: 4px !important;
          }
          .form-input, .form-textarea, .form-select {
            font-size: 0.78rem !important;
            padding: 6px 9px !important;
            height: 34px !important;
            border-radius: 6px !important;
          }
          .form-textarea {
            height: auto !important;
            min-height: 54px !important;
          }
          .btn-primary, .btn-secondary, .btn-emerald {
            font-size: 0.74rem !important;
            padding: 5px 12px !important;
            height: 32px !important;
            min-height: 32px !important;
            max-height: 32px !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .btn-form-row {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            margin-top: 10px !important;
          }
          .btn-form-row > button,
          .btn-form-row > a {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 1 100% !important;
            box-sizing: border-box !important;
            min-height: 36px !important;
            height: auto !important;
            max-height: none !important;
            font-size: 0.78rem !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            white-space: normal !important;
            word-break: break-word !important;
            line-height: 1.3 !important;
          }
          .community-voices-header {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
            padding-bottom: 8px !important;
          }
          .community-voices-header h2 {
            font-size: 0.88rem !important;
            margin: 0 !important;
            border: none !important;
            padding: 0 !important;
          }
          .community-voices-header .btn-emerald {
            height: 28px !important;
            min-height: 28px !important;
            max-height: 28px !important;
            padding: 2px 10px !important;
            font-size: 0.72rem !important;
            flex-shrink: 0 !important;
          }
          .test-list-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 10px !important;
            gap: 8px !important;
            border-radius: 8px !important;
            margin-bottom: 8px !important;
          }
          .test-item-top {
            display: flex !important;
            align-items: flex-start !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .test-avatar-img, .test-avatar-initial {
            width: 36px !important;
            height: 36px !important;
            font-size: 15px !important;
            border-radius: 50% !important;
            flex-shrink: 0 !important;
          }
          .reorder-btn {
            padding: 2px 5px !important;
            height: 20px !important;
            min-height: 20px !important;
            border-radius: 4px !important;
          }
          .test-name {
            font-size: 0.82rem !important;
          }
          .test-role {
            font-size: 0.7rem !important;
          }
          .test-quote {
            font-size: 0.74rem !important;
            line-height: 1.35 !important;
          }
          .test-actions-bar {
            width: 100% !important;
            display: flex !important;
            justify-content: flex-end !important;
            gap: 5px !important;
            border-top: 1px solid rgba(255,255,255,0.06) !important;
            padding-top: 6px !important;
          }
          .btn-status-toggle, .btn-action-edit, .btn-action-delete {
            height: 26px !important;
            min-height: 26px !important;
            padding: 2px 8px !important;
            font-size: 0.7rem !important;
            border-radius: 4px !important;
          }
          .test-preview-sticky {
            position: static !important;
            padding: 12px 10px !important;
          }
        }
      `}</style>

      <div className="test-page">
        {/* STATS STRIP */}
        <div className="adm-header-stats">
          <div className="adm-stats-grid" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(192,57,43,0.15)", color: "#ff6b6b" }}>
                <FaQuoteLeft size={20} />
              </div>
              <div>
                <div className="stat-val">{testimonials.length}</div>
                <div className="stat-lbl">Total Testimonials</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(39,174,96,0.15)", color: "#2ecc71" }}>
                <FaCheckCircle size={20} />
              </div>
              <div>
                <div className="stat-val">{activeCount}</div>
                <div className="stat-lbl">Active in Ribbon</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(243,156,18,0.15)", color: "#f39c12" }}>
                <FaStar size={20} />
              </div>
              <div>
                <div className="stat-val">{(Number(hdrGRating) || 5.0).toFixed(1)} ★</div>
                <div className="stat-lbl">Google Rating</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(52,152,219,0.15)", color: "#3498db" }}>
                <GoogleMark size={22} />
              </div>
              <div>
                <div className="stat-val" style={{ fontSize: "1.1rem" }}>
                  {hdrGShow ? "Visible" : "Hidden"}
                </div>
                <div className="stat-lbl">Google Review Pill</div>
              </div>
            </div>
          </div>

          <div className="adm-stats-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <a href="/#testimonials" target="_blank" rel="noreferrer" className="btn-view-site">
              <FaEye size={12} /> View on Website
            </a>
            <button type="button" onClick={handleResetDefaults} className="btn-reset">
              Reset Defaults
            </button>
          </div>
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

        {/* INFO BANNER */}
        <div className="info-banner">
          <FaInfoCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Continuous Marquee Ribbon:</strong> Testimonials scroll automatically in an infinite ribbon across the homepage. Admin can reorder, toggle visibility, customize author roles, and link the Google Reviews badge directly to your official Google business search or reviews page.
          </span>
        </div>

        {/* 2-COLUMN LAYOUT */}
        <div className="test-grid-layout">
          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="test-grid-main">
            {/* 1. SECTION HEADER & GOOGLE REVIEWS BADGE */}
            <div className="adm-card-panel">
              <h2>
                <FaQuoteLeft style={{ color: "#c0392b" }} />
                Section Header &amp; Google Reviews Badge
              </h2>
              <form onSubmit={handleSaveHeader}>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Category Badge / Small Tag</label>
                    <input
                      type="text"
                      className="form-input"
                      value={hdrBadge}
                      onChange={(e) => setHdrBadge(e.target.value)}
                      placeholder="e.g. Testimonials"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Main Section Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={hdrTitle}
                      onChange={(e) => setHdrTitle(e.target.value)}
                      placeholder="e.g. Voices from the Community"
                      required
                    />
                  </div>
                </div>

                {/* Google Reviews Badge settings box */}
                <div className="google-pill-box" style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 10, padding: 16, marginBottom: 18, boxSizing: "border-box", maxWidth: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <GoogleMark size={20} />
                      <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff" }}>Google Reviews Pill Settings</span>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.8rem", color: "#cbd5e1" }}>
                      <input
                        type="checkbox"
                        checked={hdrGShow === 1}
                        onChange={(e) => setHdrGShow(e.target.checked ? 1 : 0)}
                        style={{ width: 16, height: 16, accentColor: "#c0392b" }}
                      />
                      <span>Show Google Review Badge on Website</span>
                    </label>
                  </div>

                  <div className="form-row-half">
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Badge Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={hdrGTitle}
                        onChange={(e) => setHdrGTitle(e.target.value)}
                        placeholder="Google Reviews"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Subtitle / Sub-text</label>
                      <input
                        type="text"
                        className="form-input"
                        value={hdrGSub}
                        onChange={(e) => setHdrGSub(e.target.value)}
                        placeholder="See what our community says on Google"
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Google Reviews Direct Target Link URL *</label>
                      <input
                        type="url"
                        className="form-input"
                        value={hdrGUrl}
                        onChange={(e) => setHdrGUrl(e.target.value)}
                        placeholder="https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Display Star Rating (e.g. 5.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="5.0"
                        className="form-input"
                        value={hdrGRating}
                        onChange={(e) => setHdrGRating(parseFloat(e.target.value) || 5.0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="btn-form-row" style={{ display: "flex", flexWrap: "wrap", gap: 8, width: "100%", boxSizing: "border-box" }}>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ flex: "1 1 180px", maxWidth: "100%", justifyContent: "center" }}>
                    <FaSave size={13} style={{ flexShrink: 0 }} /> <span>Save Header &amp; Badge</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHdrBadge(defaultTestimonialsHeader.badge);
                      setHdrTitle(defaultTestimonialsHeader.title);
                      setHdrGTitle(defaultTestimonialsHeader.google_reviews_title);
                      setHdrGSub(defaultTestimonialsHeader.google_reviews_subtitle);
                      setHdrGUrl(defaultTestimonialsHeader.google_reviews_url);
                      setHdrGRating(defaultTestimonialsHeader.google_rating);
                      setHdrGShow(defaultTestimonialsHeader.show_google_badge);
                    }}
                    className="btn-secondary"
                    style={{ flex: "1 1 120px", maxWidth: "100%", justifyContent: "center" }}
                  >
                    Reset Header
                  </button>
                </div>
              </form>
            </div>

            {/* 2. ADD / EDIT TESTIMONIAL */}
            <div className="adm-card-panel" id="testimonial-form-card">
              <h2>
                {editingId ? <FaEdit style={{ color: "#3498db" }} /> : <FaPlus style={{ color: "#2ecc71" }} />}
                {editingId ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>
              <form onSubmit={handleSaveTestimonial}>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Reviewer / Beneficiary Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Ramaiah G. or Lakshmi Devi"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role / Village / Community Affiliation *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="e.g. Village Leader, Khammam District or Matsya Mithra Group Member"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Testimonial Quote / Review Text *</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Enter the full community voice or quote..."
                    required
                  />
                </div>

                <div className="form-row-half">
                  <div className="form-group">
                    <label className="form-label">Star Rating (1 - 5 Stars)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 2,
                            color: star <= formRating ? "#f39c12" : "#4a5568",
                            fontSize: 22,
                            transition: "transform 0.15s"
                          }}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginLeft: 8 }}>
                        {formRating} Star{formRating > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Source Platform / Verification Tag</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value)}
                      placeholder="e.g. Google or Beneficiary"
                    />
                  </div>
                </div>

                {/* Avatar Style & Optional Image Upload */}
                <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 10, padding: 16, marginBottom: 18 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <FaUser size={12} color="#c0392b" />
                    Avatar Representation
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: "0.75rem", color: "#8892a4", marginBottom: 6 }}>
                      Letter Avatar Color (used if no custom photo uploaded):
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setFormAvatarColor(c.hex)}
                          title={c.name}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: c.hex,
                            border: formAvatarColor === c.hex ? "3px solid #fff" : "2px solid #2a3148",
                            cursor: "pointer",
                            transform: formAvatarColor === c.hex ? "scale(1.15)" : "scale(1)",
                            transition: "all 0.15s"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#8892a4", marginBottom: 6 }}>
                      Optional Custom Reviewer Photo:
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      {formAvatar ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img
                            src={formAvatar}
                            alt="Avatar preview"
                            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid #c0392b" }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormAvatar(null)}
                            style={{
                              background: "rgba(231,76,60,0.15)",
                              color: "#ff7675",
                              border: "1px solid rgba(231,76,60,0.3)",
                              padding: "5px 12px",
                              borderRadius: 6,
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Remove Photo (Use Letter)
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`upload-dropzone ${dragging ? "dragging" : ""}`}
                          style={{ padding: "12px 18px", flex: 1 }}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleAvatarFile(file);
                          }}
                        >
                          <FaCloudUploadAlt size={22} style={{ color: "#c0392b", marginBottom: 4 }} />
                          <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>
                            {avatarUploadLoading ? "Optimizing Photo..." : "Upload Reviewer Photo"}
                          </div>
                          <div style={{ color: "#8892a4", fontSize: "0.72rem" }}>
                            Drag and drop or click to browse (PNG, JPG, WEBP)
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarFile(file);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive === 1}
                    onChange={(e) => setFormIsActive(e.target.checked ? 1 : 0)}
                    style={{ width: 16, height: 16, accentColor: "#c0392b", cursor: "pointer" }}
                  />
                  <label htmlFor="formIsActive" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#cbd5e1", cursor: "pointer" }}>
                    Active in live marquee ribbon
                  </label>
                </div>

                <div className="btn-form-row" style={{ display: "flex", flexWrap: "wrap", gap: 8, width: "100%", boxSizing: "border-box" }}>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ flex: "1 1 180px", maxWidth: "100%", justifyContent: "center" }}>
                    <FaSave size={13} style={{ flexShrink: 0 }} /> <span>{editingId ? "Update Testimonial" : "Add Testimonial"}</span>
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleResetForm} className="btn-secondary" style={{ flex: "1 1 120px", maxWidth: "100%", justifyContent: "center" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 3. ALL TESTIMONIALS LIST & REORDERING */}
            <div className="adm-card-panel">
              <div className="community-voices-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16, borderBottom: "1px solid #1e2436", paddingBottom: 12 }}>
                <h2 style={{ margin: 0, border: "none", padding: 0 }}>
                  <FaCommentDots style={{ color: "#f39c12" }} />
                  Community Voices ({testimonials.length})
                </h2>
                <button type="button" onClick={handleSaveOrder} disabled={loading} className="btn-emerald">
                  <FaSave size={12} /> Save Order
                </button>
              </div>

              <div style={{ fontSize: "0.8rem", color: "#8892a4", marginBottom: 16 }}>
                Use the <FaArrowUp size={10} /> <FaArrowDown size={10} /> buttons to organize the sequence in the continuous scrolling ribbon.
              </div>

              {testimonials.map((t, idx) => {
                const isActive = Number(t.is_active) !== 0;
                return (
                  <div key={t.id} className={`test-list-card ${!isActive ? "is-hidden" : ""}`}>
                    <div className="test-item-top">
                      {/* Reorder arrows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          title="Move Up"
                          className="reorder-btn"
                        >
                          <FaArrowUp size={9} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === testimonials.length - 1}
                          title="Move Down"
                          className="reorder-btn"
                        >
                          <FaArrowDown size={9} />
                        </button>
                      </div>

                      {/* Avatar preview */}
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="test-avatar-img"
                          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #2a3148", flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          className="test-avatar-initial"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: t.avatar_color || "#D2190C",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 18,
                            flexShrink: 0
                          }}
                        >
                          {(t.name || "A").charAt(0)}
                        </div>
                      )}

                      {/* Information */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                          <span className="test-name" style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>{t.name}</span>
                          <span className="test-role" style={{ fontSize: "0.74rem", color: "#8892a4" }}>• {t.role}</span>
                          <span
                            style={{
                              fontSize: "0.66rem",
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 10,
                              background: "#1e2436",
                              color: "#cbd5e1",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3
                            }}
                          >
                            <GoogleMark size={10} /> {t.source || "Google"}
                          </span>
                          <span style={{ color: "#f39c12", fontSize: 9, display: "inline-flex", gap: 1 }}>
                            {Array.from({ length: Number(t.rating) || 5 }).map((_, rIdx) => (
                              <FaStar key={rIdx} size={8} />
                            ))}
                          </span>
                        </div>
                        <p
                          className="test-quote"
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: "#cbd5e1",
                            lineHeight: 1.45,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          "{t.text}"
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="test-actions-bar" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(t)}
                        className={`btn-status-toggle ${isActive ? "is-active" : "is-inactive"}`}
                      >
                        {isActive ? "Active" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="btn-action-edit"
                      >
                        <FaEdit size={10} /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.name)}
                        className="btn-action-delete"
                        title="Delete Testimonial"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT / STICKY PREVIEW COLUMN ── */}
          <div className="test-grid-side">
            <div className="adm-card-panel test-preview-sticky">
              <h2>
                <FaEye style={{ color: "#2ecc71" }} />
                Live Card Preview
              </h2>

              <div style={{ fontSize: "0.75rem", color: "#8892a4", marginBottom: 14 }}>
                Below is how your testimonial card appears on the live website:
              </div>

              {/* Home website card preview */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: "26px 20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  color: "#1e293b",
                  minHeight: 250,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginBottom: 20
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <FaQuoteLeft style={{ fontSize: 32, color: "#D2190C", opacity: 0.35 }} />
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#475569",
                        background: "#f8fafc",
                        padding: "3px 8px",
                        borderRadius: 20,
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <GoogleMark size={13} />
                      <span>{formSource || "Google"}</span>
                      <span style={{ color: "#F5A623", display: "inline-flex", gap: 1 }}>
                        {Array.from({ length: formRating || 5 }).map((_, rIdx) => (
                          <FaStar key={rIdx} size={8} />
                        ))}
                      </span>
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: "#334155", lineHeight: 1.6, fontStyle: "italic" }}>
                    "{formText || "ALERT has transformed our village. We finally have our forest rights documents and can access the forest resources that belong to us."}"
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                  {formAvatar ? (
                    <img
                      src={formAvatar}
                      alt={formName || "Author"}
                      style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: formAvatarColor || "#D2190C",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 18,
                        flexShrink: 0
                      }}
                    >
                      {(formName || "R").charAt(0)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a" }}>
                      {formName || "Ramaiah G."}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {formRole || "Village Leader, Khammam District"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Google Review Badge Preview */}
              <div style={{ borderTop: "1px solid #1e2436", paddingTop: 16 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <GoogleMark size={14} /> Live Google Review Badge
                </div>

                {hdrGShow === 1 ? (
                  <a
                    href={hdrGUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      background: "#fff",
                      borderRadius: 30,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                      textDecoration: "none",
                      color: "#1e293b",
                      width: "100%",
                      boxSizing: "border-box"
                    }}
                  >
                    <GoogleMark size={22} />
                    <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>
                          <span style={{ color: "#4285F4" }}>G</span>
                          <span style={{ color: "#EA4335" }}>o</span>
                          <span style={{ color: "#FBBC05" }}>o</span>
                          <span style={{ color: "#4285F4" }}>g</span>
                          <span style={{ color: "#34A853" }}>l</span>
                          <span style={{ color: "#EA4335" }}>e</span> Reviews
                        </span>
                        <span style={{ color: "#F5A623", display: "inline-flex", gap: 1 }}>
                          {[0, 1, 2, 3, 4].map((s) => (
                            <FaStar key={s} size={9} />
                          ))}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {hdrGSub}
                      </div>
                    </div>
                    <FaArrowRight size={11} style={{ color: "#94a3b8" }} />
                  </a>
                ) : (
                  <div style={{ padding: "10px", background: "#0d1017", borderRadius: 8, color: "#8892a4", fontSize: "0.75rem", textAlign: "center" }}>
                    Badge is currently hidden on the website.
                  </div>
                )}
              </div>

              {/* Guidelines Box */}
              <div style={{ background: "#0d1017", border: "1px solid #1e2436", borderRadius: 10, padding: 14, marginTop: 18, fontSize: "0.75rem", color: "#8892a4", lineHeight: 1.5 }}>
                <strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>💡 Testimonials Guidelines:</strong>
                • Keep quotes authentic, concise, and focused on tangible impact.<br />
                • The infinite marquee ribbon runs smoothly across desktop, tablet, and mobile.<br />
                • The Google Reviews link opens in a new browser tab.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
