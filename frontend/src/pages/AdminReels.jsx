import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaCloudUploadAlt, FaFolderOpen,
  FaCheckCircle, FaEye, FaSave, FaExternalLinkAlt, FaInfoCircle,
  FaPlay, FaVideo, FaTag, FaClock, FaLayerGroup
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  defaultReels,
  defaultReelsHeader,
  fetchHomeReels,
  adminListReels,
  adminCreateReel,
  adminUpdateReel,
  adminDeleteReel,
  adminReorderReels,
  adminSaveReelsHeader,
  adminUploadImage
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";
const REELS_STORAGE_KEY = "alertngo_home_reels";
const REELS_HEADER_KEY = "alertngo_home_reels_header";

const PRESET_REEL_POSTERS = [
  { url: "/uploads/reels/reel-1-dhimsa.jpg", label: "Dhimsa Dance (Reel 1)" },
  { url: "/uploads/reels/reel-2-learning.jpg", label: "Digital Learning (Reel 2)" },
  { url: "/uploads/reels/reel-3-school-kits.jpg", label: "School Kits (Reel 3)" },
  { url: "/uploads/reels/reel-4-women.jpg", label: "Women's Federation (Reel 4)" },
  { url: "/uploads/all2023.jpeg", label: "Flood Relief Mission" },
  { url: "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", label: "Gram Sabha Gathering" },
];

const PRESET_REEL_VIDEOS = [
  { url: "/uploads/reels/reel-1-dhimsa.mp4", label: "Reel 1: Dhimsa Dance (0:08)" },
  { url: "/uploads/reels/reel-2-learning.mp4", label: "Reel 2: Digital Learning (0:08)" },
  { url: "/uploads/reels/reel-3-school-kits.mp4", label: "Reel 3: School Kits (0:08)" },
  { url: "/uploads/reels/reel-4-women.mp4", label: "Reel 4: Women's Convention (0:08)" },
];

const SUGGESTED_TOPICS = [
  "Culture & Identity",
  "Education",
  "Child Support",
  "Women's Collectives",
  "Forest Rights",
  "Disaster Relief",
  "Gram Sabha",
  "Clean Energy",
  "Sustainable Agriculture"
];

function compressAndOptimizeImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) {
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

export default function AdminReels() {
  const [reels, setReels] = useState(() => {
    try {
      const local = localStorage.getItem(REELS_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultReels;
  });

  const [header, setHeader] = useState(() => {
    try {
      const local = localStorage.getItem(REELS_HEADER_KEY);
      if (local) return JSON.parse(local);
    } catch {}
    return defaultReelsHeader;
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const adminKey = sessionStorage.getItem(KEY_STORAGE) || "";

  // New Reel Form State
  const [newReel, setNewReel] = useState({
    label: `Reel ${reels.length + 1}`,
    duration: "0:15",
    topic: "Culture & Identity",
    title: "",
    img: "/uploads/reels/reel-1-dhimsa.jpg",
    video: "/uploads/reels/reel-1-dhimsa.mp4",
  });
  const [newUploadedPoster, setNewUploadedPoster] = useState(null);
  const [newUploadedVideo, setNewUploadedVideo] = useState(null);
  const [posterDragging, setPosterDragging] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);
  const posterFileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);

  // Edit Reel State
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editPosterDragging, setEditPosterDragging] = useState(false);
  const [editVideoDragging, setEditVideoDragging] = useState(false);
  const editPosterInputRef = useRef(null);
  const editVideoInputRef = useRef(null);

  // Live preview interactive play state
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const showNotice = (msg) => {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 3500);
  };

  const syncReels = (updated) => {
    setReels(updated);
    try {
      localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage quota warning for reels:", e);
    }
    window.dispatchEvent(new Event("alertngo_reels_updated"));
  };

  const syncHeader = (updatedHeader) => {
    setHeader(updatedHeader);
    try {
      localStorage.setItem(REELS_HEADER_KEY, JSON.stringify(updatedHeader));
    } catch (e) {
      console.warn("Storage quota warning for reels header:", e);
    }
    window.dispatchEvent(new Event("alertngo_reels_updated"));
  };

  const loadReels = useCallback(async () => {
    setLoading(true);
    try {
      if (adminKey) {
        const res = await adminListReels(adminKey);
        if (res && res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            syncReels(res.data);
          }
          if (res.header) {
            syncHeader(res.header);
          }
          setLoading(false);
          return;
        }
      }
      const pub = await fetchHomeReels();
      if (pub && pub.data && Array.isArray(pub.data) && pub.data.length > 0) {
        syncReels(pub.data);
      }
      if (pub && pub.header) {
        syncHeader(pub.header);
      }
    } catch (err) {
      console.warn("Could not fetch remote reels:", err);
    }
    setLoading(false);
  }, [adminKey]);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  // Handle Video file upload
  const handleVideoFile = (file, onSuccess) => {
    if (!file) return;
    const isVideo = file.type && file.type.startsWith("video/");
    if (!isVideo && !file.name.match(/\.(mp4|webm|mov|ogg)$/i)) {
      setError("Please select a valid video file (MP4, WebM, MOV).");
      return;
    }
    if (file.size > 80 * 1024 * 1024) {
      setError("Video size is too large (maximum 80MB).");
      return;
    }

    const localBlobUrl = URL.createObjectURL(file);
    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    onSuccess({
      url: localBlobUrl,
      name: file.name,
      size: sizeFormatted,
      file: file
    });

    // Auto-detect duration from video element
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = localBlobUrl;
    tempVideo.onloadedmetadata = () => {
      const sec = Math.round(tempVideo.duration);
      if (sec && !isNaN(sec)) {
        const mins = Math.floor(sec / 60);
        const remSec = sec % 60;
        const durStr = `${mins}:${remSec < 10 ? "0" : ""}${remSec}`;
        setNewReel((prev) => ({ ...prev, duration: durStr }));
      }
    };

    if (adminKey) {
      adminUploadImage(adminKey, file, "reels")
        .then((res) => {
          if (res && res.success && res.url) {
            onSuccess({
              url: res.url,
              name: file.name,
              size: sizeFormatted,
              file: null
            });
          }
        })
        .catch(() => {});
    }
  };

  // Image Processing
  const processImage = (file, onDataReady, onServerUploadReady) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    compressAndOptimizeImage(file, 1000, 1000, 0.85)
      .then((compressed) => {
        onDataReady(compressed);
        if (adminKey) {
          adminUploadImage(adminKey, compressed.originalFile || compressed.dataUrl, "reels")
            .then((uploadRes) => {
              if (uploadRes && uploadRes.success && uploadRes.url) {
                if (onServerUploadReady) onServerUploadReady(uploadRes.url);
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to process image.");
      });
  };

  // Save Header & Profile Info
  const handleSaveHeader = async (e) => {
    e.preventDefault();
    if (!header.title.trim()) {
      setError("Section Title cannot be empty.");
      return;
    }
    setError("");

    if (adminKey) {
      try {
        await adminSaveReelsHeader(adminKey, header);
      } catch (err) {
        console.warn("Header save API error:", err);
      }
    }
    syncHeader({ ...header });
    showNotice("Instagram section header & profile settings saved! Check the home page.");
  };

  // Add Reel
  const handleAddReel = async (e) => {
    e.preventDefault();
    if (!newReel.title.trim()) {
      setError("Please enter the Reel Title / Description.");
      return;
    }
    setError("");

    const finalVideo = newUploadedVideo?.url || newReel.video || "/uploads/reels/reel-1-dhimsa.mp4";
    const finalPoster =
      newUploadedPoster?.serverUrl ||
      newUploadedPoster?.dataUrl ||
      newReel.img ||
      "/uploads/reels/reel-1-dhimsa.jpg";

    const reelObj = {
      id: Date.now(),
      label: newReel.label.trim() || `Reel ${reels.length + 1}`,
      duration: newReel.duration.trim() || "0:15",
      topic: newReel.topic.trim() || "Culture & Identity",
      title: newReel.title.trim(),
      img: finalPoster,
      image_url: finalPoster,
      video: finalVideo,
      video_url: finalVideo,
      sort_order: reels.length + 1,
      is_active: 1
    };

    if (adminKey) {
      try {
        const res = await adminCreateReel(adminKey, reelObj);
        if (res && res.data && res.data.id) {
          reelObj.id = res.data.id;
        }
      } catch (err) {
        console.warn("Create reel error:", err);
      }
    }

    syncReels([...reels, reelObj]);
    setNewReel({
      label: `Reel ${reels.length + 2}`,
      duration: "0:15",
      topic: "Culture & Identity",
      title: "",
      img: finalPoster,
      video: finalVideo,
    });
    setNewUploadedPoster(null);
    setNewUploadedVideo(null);
    showNotice(`Added new reel: "${reelObj.title}"! Visible on the home page.`);
  };

  // Edit Reel Handlers
  const startEdit = (r) => {
    setEditingId(r.id);
    setEditDraft({
      ...r,
      img: r.img || r.image_url || "/uploads/reels/reel-1-dhimsa.jpg",
      video: r.video || r.video_url || "/uploads/reels/reel-1-dhimsa.mp4"
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editDraft.title.trim()) {
      setError("Reel Title cannot be empty.");
      return;
    }
    setError("");

    const updatedObj = {
      ...editDraft,
      image_url: editDraft.img,
      video_url: editDraft.video
    };

    if (adminKey) {
      try {
        await adminUpdateReel(adminKey, updatedObj);
      } catch (err) {
        console.warn("Update reel error:", err);
      }
    }

    const updated = reels.map((r) => (r.id === id ? { ...r, ...updatedObj } : r));
    syncReels(updated);
    setEditingId(null);
    setEditDraft(null);
    showNotice(`Updated reel: "${updatedObj.title}" successfully!`);
  };

  // Delete Reel
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from Instagram Stories?`)) return;
    if (adminKey) {
      try {
        await adminDeleteReel(adminKey, id);
      } catch (err) {
        console.warn("Delete reel error:", err);
      }
    }
    syncReels(reels.filter((r) => r.id !== id));
    showNotice(`Deleted reel "${title}".`);
  };

  // Reorder
  const moveReel = async (index, direction) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= reels.length) return;
    const reordered = [...reels];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;

    const updatedWithOrder = reordered.map((r, idx) => ({ ...r, sort_order: idx + 1 }));
    syncReels(updatedWithOrder);

    if (adminKey) {
      try {
        await adminReorderReels(adminKey, updatedWithOrder);
      } catch (err) {}
    }
    showNotice("Reels display order updated.");
  };

  // Live Preview Reel
  const livePreviewReel = editDraft || {
    label: newReel.label || "Reel 1",
    duration: newReel.duration || "0:08",
    topic: newReel.topic || "Culture & Identity",
    title: newReel.title || "Dhimsa dance at a community gathering",
    img: newUploadedPoster?.dataUrl || newReel.img || "/uploads/reels/reel-1-dhimsa.jpg",
    video: newUploadedVideo?.url || newReel.video || "/uploads/reels/reel-1-dhimsa.mp4",
  };

  return (
    <AdminLayout title="Instagram Reels">
      <style>{`
        .reels-page {
          width: 100%;
          color: #f1f5f9;
          padding-bottom: 80px;
          box-sizing: border-box;
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

        .reels-grid-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 24px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 1120px) {
          .reels-grid-layout { grid-template-columns: 1fr; }
        }

        .reels-grid-main { min-width: 0; width: 100%; }
        .reels-grid-side { min-width: 0; width: 100%; }

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
        .reels-preview-sticky {
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
        .form-row-3col {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr;
          gap: 14px;
        }
        .form-row-half {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 720px) {
          .form-row-2col, .form-row-3col, .form-row-half {
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

        /* Pure Upload Dropzone */
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
          overflow: hidden;
        }
        .upload-dropzone:hover, .upload-dropzone.dragging {
          border-color: #c0392b;
          background: rgba(192, 57, 43, 0.08);
        }
        .upload-icon { color: #c0392b; margin-bottom: 8px; }
        .upload-title { color: #fff; font-size: 0.92rem; font-weight: 700; }
        .upload-sub { color: #8892a4; font-size: 0.78rem; margin: 4px 0 10px; }
        .upload-hint { color: #64748b; font-size: 0.72rem; margin-top: 8px; word-break: break-word; }

        .btn-browse {
          background: #1e2436;
          color: #fff;
          border: 1px solid #2a3148;
          padding: 7px 16px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .btn-browse:hover {
          background: #252d42;
          border-color: #c0392b;
        }

        .uploaded-preview-box {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #0f131c;
          border: 1px solid #2a3148;
          border-radius: 10px;
          padding: 12px 14px;
          box-sizing: border-box;
          max-width: 100%;
          overflow: hidden;
        }
        .preview-img-wrap {
          width: 70px;
          height: 90px;
          border-radius: 8px;
          overflow: hidden;
          background: #1e2436;
          flex-shrink: 0;
          border: 1.5px solid #2a3148;
        }
        .preview-img { width: 100%; height: 100%; object-fit: cover; }
        .preview-info { flex: 1; min-width: 0; }
        .preview-status { font-size: 0.72rem; font-weight: 700; color: #2ecc71; display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
        .preview-filename { font-size: 0.85rem; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .preview-filesize { font-size: 0.72rem; color: #8892a4; margin-bottom: 8px; }
        .preview-actions { display: flex; gap: 8px; }

        .btn-change-image {
          background: #1e2436;
          color: #fff;
          border: 1px solid #2a3148;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .btn-remove-image {
          background: rgba(231,76,60,0.15);
          color: #ff7675;
          border: 1px solid rgba(231,76,60,0.3);
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Preset grid */
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
          gap: 8px;
          margin-top: 8px;
          max-width: 100%;
        }
        .preset-card {
          border: 1.5px solid #232938;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: #0f131c;
          transition: all 0.15s;
          text-align: center;
          box-sizing: border-box;
        }
        .preset-card:hover {
          border-color: #c0392b;
          transform: translateY(-2px);
        }
        .preset-img {
          width: 100%;
          height: 52px;
          object-fit: cover;
          display: block;
        }
        .preset-label {
          font-size: 0.62rem;
          color: #94a3b8;
          padding: 3px 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Reel item in list */
        .reel-item-card {
          background: #0d1017;
          border: 1px solid #1e2436;
          border-radius: 10px;
          padding: 14px 18px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: border-color 0.2s;
          box-sizing: border-box;
          max-width: 100%;
        }
        .reel-item-card:hover { border-color: #2a3148; }
        .reel-thumb-box {
          width: 64px;
          height: 85px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          background: #1e2436;
          flex-shrink: 0;
          border: 2px solid #2a3148;
        }
        .reel-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .reel-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .reel-details { flex: 1; min-width: 0; }
        .reel-title-txt { font-size: 0.96rem; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .reel-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
        .reel-pill-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #fff;
          background: #c0392b;
          border-radius: 10px;
          padding: 2px 7px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .reel-pill-topic {
          font-size: 0.68rem;
          font-weight: 600;
          color: #38bdf8;
          background: rgba(56,189,248,0.12);
          border: 1px solid rgba(56,189,248,0.3);
          border-radius: 10px;
          padding: 2px 7px;
        }
        .reel-pill-dur {
          font-size: 0.68rem;
          color: #94a3b8;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .reel-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .btn-icon-action {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #1e2436;
          border: 1px solid #2a3148;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .btn-icon-action:hover:not(:disabled) {
          background: #252d42;
          color: #fff;
          border-color: #c0392b;
        }
        .btn-icon-action:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-icon-danger:hover {
          background: rgba(231,76,60,0.2) !important;
          color: #ff7675 !important;
          border-color: #e74c3c !important;
        }

        .btn-red {
          background: #c0392b;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s;
        }
        .btn-red:hover { background: #a93226; }
        .btn-secondary {
          background: #1e2436;
          color: #cbd5e1;
          border: 1px solid #2a3148;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-secondary:hover { background: #252d42; color: #fff; }

        .notice-pill {
          background: rgba(46,204,113,0.15);
          border: 1px solid #2ecc71;
          color: #2ecc71;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.84rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .error-pill {
          background: rgba(231,76,60,0.15);
          border: 1px solid #e74c3c;
          color: #ff7675;
          padding: 10px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.84rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Live Simulated Reel Card on Right */
        .live-reel-card {
          position: relative;
          width: 100%;
          aspect-ratio: 9/16;
          border-radius: 18px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 16px 36px rgba(0,0,0,0.4);
          border: 1.5px solid #232938;
          box-sizing: border-box;
        }
        .live-reel-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .live-reel-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.85) 100%);
          pointer-events: none;
        }
        .live-reel-top-tag {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.2);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          z-index: 5;
        }
        .live-reel-top-dur {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          color: #cbd5e1;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.2);
          z-index: 5;
        }
        .live-reel-play-btn {
          position: absolute;
          top: 42%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          color: #c0392b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          transition: transform 0.2s, background 0.2s;
          z-index: 10;
        }
        .live-reel-play-btn:hover {
          transform: translate(-50%, -50%) scale(1.1);
          background: #fff;
        }
        .live-reel-bottom {
          position: absolute;
          bottom: 14px;
          left: 14px;
          right: 14px;
          z-index: 5;
        }
        .live-reel-topic-pill {
          color: #38bdf8;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          display: block;
        }
        .live-reel-title-txt {
          color: #fff;
          font-size: 0.88rem;
          font-weight: 700;
          line-height: 1.35;
          margin: 0;
          text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        }
        .live-reel-video-tag {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 8;
        }

        .reel-item-body {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 768px) {
          .reels-page {
            padding-bottom: 30px !important;
          }
          .adm-header-stats {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            padding: 10px !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
            border-radius: 10px !important;
          }
          .adm-header-stats .stat-item {
            gap: 8px !important;
            width: 100% !important;
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
          .adm-header-stats a.btn-secondary {
            grid-column: span 2 !important;
            width: 100% !important;
            height: 32px !important;
            min-height: 32px !important;
            max-height: 32px !important;
            font-size: 0.74rem !important;
            padding: 4px 10px !important;
            border-radius: 6px !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .adm-reels-notice {
            padding: 10px 12px !important;
            margin-bottom: 14px !important;
            border-radius: 9px !important;
            gap: 8px !important;
          }
          .adm-reels-notice svg {
            width: 16px !important;
            height: 16px !important;
          }
          .adm-reels-notice div {
            font-size: 0.74rem !important;
            line-height: 1.35 !important;
          }
          .adm-card-panel {
            padding: 12px 10px !important;
            border-radius: 10px !important;
            margin-bottom: 14px !important;
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
          .upload-dropzone {
            padding: 10px 8px !important;
            border-radius: 8px !important;
          }
          .upload-icon {
            width: 22px !important;
            height: 22px !important;
            margin-bottom: 3px !important;
          }
          .upload-title {
            font-size: 0.78rem !important;
          }
          .upload-sub {
            font-size: 0.68rem !important;
            margin: 2px 0 5px !important;
          }
          .upload-hint {
            font-size: 0.64rem !important;
            margin-top: 3px !important;
          }
          .btn-browse {
            height: 26px !important;
            min-height: 26px !important;
            padding: 3px 8px !important;
            font-size: 0.7rem !important;
            border-radius: 5px !important;
          }
          .uploaded-preview-box {
            padding: 8px 10px !important;
            gap: 10px !important;
            border-radius: 8px !important;
          }
          .preview-img-wrap {
            width: 50px !important;
            height: 64px !important;
            border-radius: 6px !important;
          }
          .preview-status {
            font-size: 0.66rem !important;
          }
          .preview-filename {
            font-size: 0.75rem !important;
          }
          .preview-filesize {
            font-size: 0.65rem !important;
            margin-bottom: 5px !important;
          }
          .preview-actions {
            gap: 6px !important;
          }
          .btn-change-image, .btn-remove-image {
            height: 25px !important;
            min-height: 25px !important;
            padding: 2px 7px !important;
            font-size: 0.68rem !important;
            border-radius: 5px !important;
          }
          .preset-grid {
            grid-template-columns: repeat(auto-fill, minmax(68px, 1fr)) !important;
            gap: 5px !important;
          }
          .preset-card {
            border-radius: 6px !important;
          }
          .preset-img {
            height: 40px !important;
          }
          .preset-label {
            font-size: 0.56rem !important;
            padding: 2px !important;
          }
          .btn-red, .btn-secondary {
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
            gap: 8px !important;
            width: 100% !important;
          }
          .btn-form-row > button,
          .btn-form-row > a {
            width: 100% !important;
            max-width: 100% !important;
            flex: none !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            font-size: 0.78rem !important;
            padding: 0 12px !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            white-space: nowrap !important;
          }
          .btn-add-reel {
            width: 100% !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            font-size: 0.76rem !important;
            justify-content: center !important;
          }
          .reel-item-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 10px !important;
            gap: 8px !important;
            border-radius: 8px !important;
            margin-bottom: 8px !important;
          }
          .reel-item-body {
            display: flex !important;
            align-items: flex-start !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .reel-thumb-box {
            width: 48px !important;
            height: 64px !important;
            border-radius: 6px !important;
            flex-shrink: 0 !important;
          }
          .reel-details {
            flex: 1 !important;
            min-width: 0 !important;
          }
          .reel-title-txt {
            font-size: 0.8rem !important;
            line-height: 1.25 !important;
            margin-bottom: 2px !important;
          }
          .reel-pills {
            gap: 3px !important;
            margin-bottom: 3px !important;
          }
          .reel-pill-label, .reel-pill-topic, .reel-pill-dur {
            font-size: 0.62rem !important;
            padding: 1px 5px !important;
          }
          .reel-actions {
            width: 100% !important;
            display: flex !important;
            justify-content: flex-end !important;
            gap: 5px !important;
            border-top: 1px solid rgba(255,255,255,0.06) !important;
            padding-top: 6px !important;
          }
          .btn-icon-action {
            width: 28px !important;
            height: 26px !important;
            min-height: 26px !important;
            border-radius: 5px !important;
          }
          .notice-pill, .error-pill {
            padding: 7px 10px !important;
            font-size: 0.74rem !important;
            border-radius: 7px !important;
            margin-bottom: 12px !important;
          }
          .reels-preview-sticky {
            position: static !important;
            padding: 12px 10px !important;
          }
          .live-reel-card {
            border-radius: 12px !important;
          }
          .live-reel-play-btn {
            width: 40px !important;
            height: 40px !important;
          }
        }
      `}</style>

      <div className="reels-page">
        {/* Header Stats Bar */}
        <div className="adm-header-stats">
          <div className="stat-item">
            <div className="stat-icon" style={{ background: "rgba(225, 48, 108, 0.15)", color: "#e1306c" }}>
              <FaInstagram size={22} />
            </div>
            <div>
              <div className="stat-val">{reels.length}</div>
              <div className="stat-lbl">Active Instagram Reels</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
              <FaVideo size={20} />
            </div>
            <div>
              <div className="stat-val">@{header.profile_handle || "alert.ngo"}</div>
              <div className="stat-lbl">Instagram Handle</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon" style={{ background: "rgba(46, 204, 113, 0.15)", color: "#2ecc71" }}>
              <FaLayerGroup size={20} />
            </div>
            <div>
              <div className="stat-val">4-Col</div>
              <div className="stat-lbl">Auto-Wrap Grid</div>
            </div>
          </div>
          <a href="/#reels" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
            <FaExternalLinkAlt size={11} /> View on Website
          </a>
        </div>

        {notice && (
          <div className="notice-pill">
            <FaCheckCircle size={14} /> {notice}
          </div>
        )}
        {error && (
          <div className="error-pill">
            <FaTimes size={14} /> {error}
          </div>
        )}

        {/* 4-Column Auto-Wrap Responsive Notice */}
        <div className="adm-reels-notice" style={{
          background: "rgba(225, 48, 108, 0.1)",
          border: "1px solid rgba(225, 48, 108, 0.35)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <FaInfoCircle size={22} color="#e1306c" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: "0.84rem", color: "#fce7f3", lineHeight: 1.5 }}>
            <strong style={{ color: "#fff" }}>4-Column Auto-Wrap Layout:</strong> On the live website, the first 4 reels appear side-by-side in row 1. When you add a 5th, 6th, or 7th reel, it automatically flows into the next row below with clean responsive spacing!
          </div>
        </div>

        <div className="reels-grid-layout">
          {/* LEFT COLUMN: Header settings, Add Reel, Existing Reels list */}
          <div className="reels-grid-main">
            {/* Header & Instagram Profile Customizer */}
            <div className="adm-card-panel">
              <h2><FaInstagram size={16} color="#e1306c" /> Instagram Section Header & Profile Info</h2>
              <form onSubmit={handleSaveHeader}>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Badge Tag</label>
                    <input
                      type="text"
                      className="form-input"
                      value={header.badge || ""}
                      onChange={(e) => setHeader({ ...header, badge: e.target.value })}
                      placeholder="Instagram"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={header.title || ""}
                      onChange={(e) => setHeader({ ...header, title: e.target.value })}
                      placeholder="Stories from the Field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Section Subtitle</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: 60 }}
                    value={header.subtitle || ""}
                    onChange={(e) => setHeader({ ...header, subtitle: e.target.value })}
                    placeholder="Short videos from our work across Andhra Pradesh — follow us for the latest from the communities we serve."
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Instagram Handle</label>
                    <input
                      type="text"
                      className="form-input"
                      value={header.profile_handle || ""}
                      onChange={(e) => setHeader({ ...header, profile_handle: e.target.value })}
                      placeholder="alert.ngo"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Profile URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={header.profile_url || ""}
                      onChange={(e) => setHeader({ ...header, profile_url: e.target.value })}
                      placeholder="https://www.instagram.com/alert.ngo/"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Bio Copy</label>
                  <input
                    type="text"
                    className="form-input"
                    value={header.profile_bio || ""}
                    onChange={(e) => setHeader({ ...header, profile_bio: e.target.value })}
                    placeholder="Adivasi rights, forest governance & women's collectives across Andhra Pradesh."
                  />
                </div>

                <div className="btn-form-row" style={{ display: "flex", gap: 10 }}>
                  <button type="submit" className="btn-red" style={{ padding: "8px 18px", fontSize: "0.82rem" }}>
                    <FaSave size={12} /> Save Instagram Header
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "8px 14px", fontSize: "0.82rem" }}
                    onClick={() => {
                      setHeader(defaultReelsHeader);
                      showNotice("Reset header draft to defaults. Click 'Save Instagram Header' to apply.");
                    }}
                  >
                    Reset Header
                  </button>
                </div>
              </form>
            </div>

            {/* Form: Add New Reel */}
            <div className="adm-card-panel">
              <h2><FaPlus size={14} /> Add New Instagram Reel Video</h2>
              <form onSubmit={handleAddReel}>
                <div className="form-row-3col">
                  <div className="form-group">
                    <label className="form-label">Reel Label *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Reel 5"
                      value={newReel.label}
                      onChange={(e) => setNewReel({ ...newReel, label: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 0:15"
                      value={newReel.duration}
                      onChange={(e) => setNewReel({ ...newReel, duration: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Topic / Category *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Culture & Identity"
                      value={newReel.topic}
                      onChange={(e) => setNewReel({ ...newReel, topic: e.target.value })}
                      list="reel-topic-suggestions"
                    />
                    <datalist id="reel-topic-suggestions">
                      {SUGGESTED_TOPICS.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reel Title / Description *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dhimsa dance at a community gathering in the agency hills"
                    value={newReel.title}
                    onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                  />
                </div>

                {/* Video Upload Dropzone */}
                <div className="form-group">
                  <label className="form-label">Reel Video File (MP4, WebM)</label>
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    accept="video/mp4, video/webm, video/quicktime, video/ogg"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleVideoFile(e.target.files[0], (v) => {
                          setNewUploadedVideo(v);
                          setNewReel((prev) => ({ ...prev, video: v.url }));
                        });
                      }
                      e.target.value = "";
                    }}
                  />

                  {newUploadedVideo || newReel.video ? (
                    <div className="uploaded-preview-box" style={{ marginBottom: 10 }}>
                      <div style={{ width: 60, height: 60, background: "#1e2436", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8", flexShrink: 0 }}>
                        <FaVideo size={24} />
                      </div>
                      <div className="preview-info">
                        <div className="preview-status">
                          <FaCheckCircle color="#2ecc71" size={12} /> Video Attached
                        </div>
                        <div className="preview-filename">{newUploadedVideo?.name || newReel.video.split("/").pop()}</div>
                        <div className="preview-filesize">{newUploadedVideo?.size || "Preset Video"}</div>
                        <div className="preview-actions">
                          <button type="button" className="btn-change-image" onClick={() => videoFileInputRef.current?.click()}>
                            <FaFolderOpen size={11} /> Change Video
                          </button>
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => {
                              setNewUploadedVideo(null);
                              setNewReel((prev) => ({ ...prev, video: "" }));
                            }}
                          >
                            <FaTrash size={11} /> Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-dropzone ${videoDragging ? "dragging" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setVideoDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setVideoDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setVideoDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleVideoFile(e.dataTransfer.files[0], (v) => {
                            setNewUploadedVideo(v);
                            setNewReel((prev) => ({ ...prev, video: v.url }));
                          });
                        }
                      }}
                      onClick={() => videoFileInputRef.current?.click()}
                    >
                      <FaVideo size={36} className="upload-icon" />
                      <div className="upload-title">Drag & Drop Video File (MP4, WebM)</div>
                      <div className="upload-sub">or click to browse from computer</div>
                      <button type="button" className="btn-browse" onClick={(e) => { e.stopPropagation(); videoFileInputRef.current?.click(); }}>
                        <FaFolderOpen size={12} /> Browse Video
                      </button>
                      <div className="upload-hint">MP4, WebM (Max 80MB)</div>
                    </div>
                  )}

                  {/* Preset video quick pick */}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Or pick from existing field videos:</span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                      {PRESET_REEL_VIDEOS.map((pv) => (
                        <button
                          key={pv.url}
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "0.72rem" }}
                          onClick={() => {
                            setNewUploadedVideo(null);
                            setNewReel((prev) => ({ ...prev, video: pv.url }));
                            showNotice(`Selected ${pv.label}`);
                          }}
                        >
                          <FaPlay size={8} /> {pv.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>


                <button type="submit" className="btn-red btn-add-reel" style={{ marginTop: 8 }}>
                  <FaPlus size={12} /> Add Reel
                </button>
              </form>
            </div>

            {/* List of Existing Reels */}
            <div className="adm-card-panel">
              <h2><FaVideo size={14} /> Current Instagram Reels ({reels.length})</h2>
              <p style={{ color: "#8892a4", fontSize: "0.8rem", margin: "-6px 0 16px" }}>
                Use Up/Down arrows to reorder reels. Click Edit to change topics, videos, posters, or titles.
              </p>

              {reels.map((r, idx) => {
                const isEditing = editingId === r.id;
                return isEditing ? (
                  <div
                    key={r.id}
                    style={{
                      background: "#161c28",
                      border: "1.5px solid #c0392b",
                      borderRadius: 12,
                      padding: 18,
                      marginBottom: 16
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ color: "#c0392b", fontWeight: 700, fontSize: "0.88rem" }}>
                        Editing: {r.title}
                      </span>
                      <button type="button" className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.72rem" }} onClick={cancelEdit}>
                        <FaTimes size={10} /> Cancel
                      </button>
                    </div>

                    <div className="form-row-3col" style={{ gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Label</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editDraft.label}
                          onChange={(e) => setEditDraft({ ...editDraft, label: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Duration</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editDraft.duration}
                          onChange={(e) => setEditDraft({ ...editDraft, duration: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Topic</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editDraft.topic}
                          onChange={(e) => setEditDraft({ ...editDraft, topic: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reel Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editDraft.title}
                        onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                      />
                    </div>

                    {/* Change video */}
                    <div className="form-group">
                      <label className="form-label">Replace Video (Drop or Browse File)</label>
                      <input
                        type="file"
                        ref={editVideoInputRef}
                        accept="video/mp4, video/webm, video/quicktime"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleVideoFile(e.target.files[0], (v) => {
                              setEditDraft((prev) => ({ ...prev, video: v.url }));
                              showNotice(`Video updated to ${e.target.files[0].name}`);
                            });
                          }
                          e.target.value = "";
                        }}
                      />
                      <div
                        className={`upload-dropzone ${editVideoDragging ? "dragging" : ""}`}
                        style={{ padding: "12px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setEditVideoDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setEditVideoDragging(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditVideoDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleVideoFile(e.dataTransfer.files[0], (v) => {
                              setEditDraft((prev) => ({ ...prev, video: v.url }));
                              showNotice(`Video updated to ${e.dataTransfer.files[0].name}`);
                            });
                          }
                        }}
                        onClick={() => editVideoInputRef.current?.click()}
                      >
                        <FaVideo size={20} color="#38bdf8" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>Click to replace video file</div>
                          <div style={{ color: "#8892a4", fontSize: "0.72rem" }}>Current: {editDraft.video?.split("/").pop()}</div>
                        </div>
                        <button type="button" className="btn-browse" onClick={(e) => { e.stopPropagation(); editVideoInputRef.current?.click(); }}>
                          <FaFolderOpen size={11} /> Browse Video
                        </button>
                      </div>
                    </div>

                    {/* Change poster */}
                    <div className="form-group">
                      <label className="form-label">Replace Poster Photo</label>
                      <input
                        type="file"
                        ref={editPosterInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processImage(
                              e.target.files[0],
                              (c) => {
                                setEditDraft((prev) => ({ ...prev, img: c.dataUrl }));
                                showNotice(`Poster updated`);
                              },
                              (serverUrl) => {
                                setEditDraft((prev) => ({ ...prev, img: serverUrl }));
                              }
                            );
                          }
                          e.target.value = "";
                        }}
                      />
                      <div
                        className={`upload-dropzone ${editPosterDragging ? "dragging" : ""}`}
                        style={{ padding: "12px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setEditPosterDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setEditPosterDragging(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditPosterDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            processImage(
                              e.dataTransfer.files[0],
                              (c) => {
                                setEditDraft((prev) => ({ ...prev, img: c.dataUrl }));
                              },
                              (serverUrl) => {
                                setEditDraft((prev) => ({ ...prev, img: serverUrl }));
                              }
                            );
                          }
                        }}
                        onClick={() => editPosterInputRef.current?.click()}
                      >
                        <img src={editDraft.img} alt="poster" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>Click to replace poster image</div>
                          <div style={{ color: "#8892a4", fontSize: "0.72rem" }}>Supports PNG, JPG, WEBP</div>
                        </div>
                        <button type="button" className="btn-browse" onClick={(e) => { e.stopPropagation(); editPosterInputRef.current?.click(); }}>
                          <FaFolderOpen size={11} /> Browse Poster
                        </button>
                      </div>
                    </div>

                    <div className="btn-form-row" style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <button type="button" className="btn-red" onClick={() => handleSaveEdit(r.id)}>
                        <FaSave size={12} /> Save Changes
                      </button>
                      <button type="button" className="btn-secondary" onClick={cancelEdit}>
                        <FaTimes size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={r.id} className="reel-item-card">
                    <div className="reel-item-body">
                      <div className="reel-thumb-box">
                        <img src={r.img || r.image_url} alt={r.title} className="reel-thumb-img" />
                        <div className="reel-thumb-overlay">
                          <FaPlay size={12} />
                        </div>
                      </div>
                      <div className="reel-details">
                        <div className="reel-pills">
                          <span className="reel-pill-label">{r.label}</span>
                          <span className="reel-pill-topic">{r.topic}</span>
                          <span className="reel-pill-dur"><FaClock size={9} /> {r.duration}</span>
                        </div>
                        <div className="reel-title-txt">{r.title}</div>
                        <div style={{ color: "#64748b", fontSize: "0.72rem", marginTop: 2 }}>
                          Video: {r.video?.split("/").pop()}
                        </div>
                      </div>
                    </div>
                    <div className="reel-actions">
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => moveReel(idx, "up")}
                      >
                        <FaArrowUp size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Move Down"
                        disabled={idx === reels.length - 1}
                        onClick={() => moveReel(idx, "down")}
                      >
                        <FaArrowDown size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Edit Reel"
                        onClick={() => startEdit(r)}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action btn-icon-danger"
                        title="Delete Reel"
                        onClick={() => handleDelete(r.id, r.title)}
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive Reel Preview */}
          <div className="reels-grid-side">
            <div className="adm-card-panel reels-preview-sticky">
              <h2><FaEye size={13} /> Live Interactive Reel Preview</h2>
              <p style={{ color: "#8892a4", fontSize: "0.78rem", margin: "-6px 0 16px", lineHeight: 1.4 }}>
                Below is how this reel renders on the home page. Tap the play button to preview playback:
              </p>

              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 16px", width: "100%", overflow: "hidden" }}>
                <div style={{ width: "100%", maxWidth: 260, minWidth: 0 }}>
                  <div className="live-reel-card">
                    {previewPlaying ? (
                      <video
                        className="live-reel-video-tag"
                        src={livePreviewReel.video || "/uploads/reels/reel-1-dhimsa.mp4"}
                        poster={livePreviewReel.img}
                        controls
                        autoPlay
                        playsInline
                        onEnded={() => setPreviewPlaying(false)}
                      />
                    ) : (
                      <img src={livePreviewReel.img || "/uploads/reels/reel-1-dhimsa.jpg"} alt={livePreviewReel.title} className="live-reel-img" />
                    )}

                    <div className="live-reel-shade" />
                    <span className="live-reel-top-tag"><FaPlay size={7} /> {livePreviewReel.label}</span>
                    <span className="live-reel-top-dur">{livePreviewReel.duration}</span>

                    <button
                      type="button"
                      className="live-reel-play-btn"
                      onClick={() => setPreviewPlaying(!previewPlaying)}
                      aria-label="Toggle Play"
                    >
                      {previewPlaying ? <FaTimes size={16} /> : <FaPlay size={16} style={{ marginLeft: 2 }} />}
                    </button>

                    <div className="live-reel-bottom">
                      <span className="live-reel-topic-pill">{livePreviewReel.topic}</span>
                      <h4 className="live-reel-title-txt">{livePreviewReel.title}</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: "#0d1017",
                border: "1px solid #1e2436",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: "0.76rem",
                color: "#94a3b8"
              }}>
                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>💡 Instagram Reels Guidelines:</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
                  <li><strong>9:16 Aspect Ratio:</strong> Videos display vertically in smartphone reel format.</li>
                  <li><strong>Auto-Wrap:</strong> Displays 4 reels per row on desktop. Adding a 5th or 6th reel automatically creates the next row below.</li>
                  <li>All changes sync in real-time to the home page!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
