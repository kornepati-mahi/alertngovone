import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaCloudUploadAlt, FaFolderOpen,
  FaCheckCircle, FaUndo, FaEye, FaSave, FaExternalLinkAlt,
  FaQuoteLeft, FaIdBadge, FaAward, FaUserTie
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import FlipCard from "../components/FlipCard";
import {
  defaultTeamMembers,
  fetchTeamMembers,
  adminListTeam,
  adminCreateTeamMember,
  adminUpdateTeamMember,
  adminDeleteTeamMember,
  adminReorderTeam,
  adminUploadImage
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";
const TEAM_STORAGE_KEY = "alertngo_team_members";

const PRESET_TEAM_PHOTOS = [
  { url: "/uploads/Divakar-Babu.jpg", label: "Prof. Diwakar Babu" },
  { url: "/uploads/Ramakrishna.jpg", label: "Mr V. Rama Krishna" },
  { url: "/uploads/jayaraj-sir.jpg", label: "Mr Y.L.J.B. Jayaraj" },
  { url: "/uploads/Sirisha-1.jpg", label: "Ms P. Sirisha" },
  { url: "/uploads/Jillela-Prasad-1-3.png", label: "Mr J. Prasad" },
  { url: "/uploads/Nancharamma-1-1.png", label: "Ms K.L. Nancharamma" },
  { url: "/uploads/silpa-1.png", label: "Ms N. Silpa" },
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

export default function AdminTeam() {
  const [members, setMembers] = useState(() => {
    try {
      const local = localStorage.getItem(TEAM_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return defaultTeamMembers;
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const adminKey = sessionStorage.getItem(KEY_STORAGE) || "";

  // New Member Form State
  const [newMember, setNewMember] = useState({
    name: "",
    role: "Executive Member",
    badge: "Board of Directors",
    quote: "",
    bio: "",
    image_url: "",
  });
  const [newHighlights, setNewHighlights] = useState([]);
  const [highlightInput, setHighlightInput] = useState("");
  const [newUploadedImg, setNewUploadedImg] = useState(null); // { dataUrl, name, size }
  const [newDragging, setNewDragging] = useState(false);
  const newFileInputRef = useRef(null);

  // Edit Member State
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editHighlightInput, setEditHighlightInput] = useState("");
  const [editDragging, setEditDragging] = useState(false);
  const editFileInputRef = useRef(null);

  const showNotice = (msg) => {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 3500);
  };

  const syncMembers = (newMembers) => {
    setMembers(newMembers);
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(newMembers));
    } catch (e) {
      console.warn("Storage quota warning for team:", e);
    }
    window.dispatchEvent(new Event("alertngo_team_updated"));
  };

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      if (adminKey) {
        const res = await adminListTeam(adminKey);
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          syncMembers(res.data);
          setLoading(false);
          return;
        }
      }
      const pubRes = await fetchTeamMembers();
      if (pubRes && pubRes.data && Array.isArray(pubRes.data) && pubRes.data.length > 0) {
        syncMembers(pubRes.data);
      }
    } catch (err) {
      console.warn("Load team error:", err);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // Image Upload Processor (Pure Drag & Drop / File Select - NO URL INPUT)
  const processImage = async (file, onSuccess, onServerReady) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP, GIF). Videos are not supported.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("The selected image is larger than 25MB. Please choose a smaller image.");
      return;
    }
    setError("");
    try {
      const compressed = await compressAndOptimizeImage(file);
      onSuccess(compressed);

      if (adminKey) {
        adminUploadImage(adminKey, file, "team").then((res) => {
          if (res && res.success && res.url) {
            if (typeof onServerReady === "function") {
              onServerReady(res.url);
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

  // Add Highlights Handlers
  const handleAddHighlight = (e) => {
    if (e) e.preventDefault();
    if (!highlightInput.trim()) return;
    setNewHighlights([...newHighlights, highlightInput.trim()]);
    setHighlightInput("");
  };

  const handleRemoveHighlight = (idx) => {
    setNewHighlights(newHighlights.filter((_, i) => i !== idx));
  };

  // Edit Highlights Handlers
  const handleAddEditHighlight = (e) => {
    if (e) e.preventDefault();
    if (!editHighlightInput.trim() || !editDraft) return;
    const current = Array.isArray(editDraft.highlights) ? editDraft.highlights : [];
    setEditDraft({ ...editDraft, highlights: [...current, editHighlightInput.trim()] });
    setEditHighlightInput("");
  };

  const handleRemoveEditHighlight = (idx) => {
    if (!editDraft) return;
    const current = Array.isArray(editDraft.highlights) ? editDraft.highlights : [];
    setEditDraft({ ...editDraft, highlights: current.filter((_, i) => i !== idx) });
  };

  // Add Team Member Action
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) {
      setError("Please enter the Member Name.");
      return;
    }
    setError("");

    const finalImg = newUploadedImg?.serverUrl || newUploadedImg?.dataUrl || newMember.image_url || "/uploads/Divakar-Babu.jpg";

    const memberObj = {
      id: Date.now(),
      name: newMember.name.trim(),
      role: newMember.role.trim() || "Executive Member",
      badge: newMember.badge.trim() || "Board of Directors",
      quote: newMember.quote.trim(),
      bio: newMember.bio.trim(),
      highlights: newHighlights,
      image_url: finalImg,
      img: finalImg,
      sort_order: members.length + 1,
      is_active: 1
    };

    if (adminKey) {
      try {
        const res = await adminCreateTeamMember(adminKey, memberObj);
        if (res && res.data && res.data.id) {
          memberObj.id = res.data.id;
        }
      } catch (err) {
        console.warn("API create error:", err);
      }
    }

    syncMembers([...members, memberObj]);
    setNewMember({
      name: "",
      role: "Executive Member",
      badge: "Board of Directors",
      quote: "",
      bio: "",
      image_url: "",
    });
    setNewHighlights([]);
    setNewUploadedImg(null);
    showNotice(`Added new team member: ${memberObj.name}! Check the website.`);
  };

  // Edit Team Member Handlers
  const startEdit = (m) => {
    setEditingId(m.id);
    setEditDraft({
      ...m,
      highlights: Array.isArray(m.highlights) ? [...m.highlights] : [],
      image_url: m.image_url || m.img || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editDraft.name.trim()) {
      setError("Member Name cannot be empty.");
      return;
    }
    setError("");

    const updatedObj = {
      ...editDraft,
      img: editDraft.image_url,
    };

    if (adminKey) {
      try {
        await adminUpdateTeamMember(adminKey, updatedObj);
      } catch (err) {
        console.warn("API update error:", err);
      }
    }

    const updated = members.map((m) => (m.id === id ? { ...m, ...updatedObj } : m));
    syncMembers(updated);
    setEditingId(null);
    setEditDraft(null);
    showNotice(`Updated member: ${updatedObj.name} successfully!`);
  };

  // Delete Member
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the Board of Directors?`)) return;
    if (adminKey) {
      try {
        await adminDeleteTeamMember(adminKey, id);
      } catch (err) {
        console.warn("API delete error:", err);
      }
    }
    syncMembers(members.filter((m) => m.id !== id));
    showNotice(`Removed ${name} from team.`);
  };

  // Reorder Members
  const moveMember = async (index, direction) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= members.length) return;
    const reordered = [...members];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;

    const updatedWithOrder = reordered.map((m, idx) => ({ ...m, sort_order: idx + 1 }));
    syncMembers(updatedWithOrder);

    if (adminKey) {
      try {
        await adminReorderTeam(adminKey, updatedWithOrder);
      } catch (err) { }
    }
    showNotice("Team display order updated.");
  };

  // Preview member currently shown in Live FlipCard
  const livePreviewMember = editDraft || {
    name: newMember.name || "Prof. Ch. Diwakar Babu",
    role: newMember.role || "President",
    badge: newMember.badge || "Board of Directors",
    quote: newMember.quote || "Justice is non-negotiable for the indigenous forest dwelling communities.",
    bio: newMember.bio || "Renowned legal scholar, former Principal of V.R. Law College, and constitutional rights specialist guiding ALERT's legal interventions in tribal fifth-scheduled areas.",
    highlights: newHighlights.length > 0 ? newHighlights : ["Principal VR Law College", "Constitutional Rights Expert", "Appellate Litigation Advisor"],
    img: newUploadedImg?.dataUrl || newMember.image_url || "/uploads/Divakar-Babu.jpg",
  };

  return (
    <AdminLayout title="Team & Board of Directors">
      <style>{`
        .team-page {
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

        .team-grid-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 24px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 1120px) {
          .team-grid-layout { grid-template-columns: 1fr; }
        }

        .team-grid-main {
          min-width: 0;
          width: 100%;
        }
        .team-grid-side {
          min-width: 0;
          width: 100%;
        }

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
        .team-preview-sticky {
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

        /* Pure Image Upload Dropzone */
        .upload-dropzone {
          border: 2px dashed #2a3148;
          border-radius: 10px;
          padding: 20px 16px;
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
          gap: 16px;
          background: #0f131c;
          border: 1px solid #2a3148;
          border-radius: 10px;
          padding: 12px 16px;
        }
        .preview-img-wrap {
          width: 90px;
          height: 90px;
          border-radius: 10px;
          overflow: hidden;
          background: #1e2436;
          flex-shrink: 0;
          border: 2px solid #2a3148;
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

        /* Preset photos grid */
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
          gap: 8px;
          margin-top: 8px;
        }
        .preset-card {
          border: 1.5px solid #232938;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: #0f131c;
          transition: all 0.15s;
          text-align: center;
        }
        .preset-card:hover {
          border-color: #c0392b;
          transform: translateY(-2px);
        }
        .preset-img {
          width: 100%;
          height: 48px;
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

        /* Highlight chips */
        .highlight-chip-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }
        .highlight-chip {
          background: #1e2436;
          border: 1px solid #2a3148;
          color: #cbd5e1;
          border-radius: 14px;
          padding: 4px 10px;
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .chip-del {
          color: #e74c3c;
          cursor: pointer;
          font-size: 0.75rem;
        }

        /* Member card row in list */
        .member-item-card {
          background: #0d1017;
          border: 1px solid #1e2436;
          border-radius: 10px;
          padding: 14px 18px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: border-color 0.2s;
        }
        .member-item-card:hover { border-color: #2a3148; }
        .member-thumb {
          width: 58px;
          height: 58px;
          border-radius: 10px;
          object-fit: cover;
          border: 2px solid #2a3148;
          flex-shrink: 0;
        }
        .member-details { flex: 1; min-width: 0; }
        .member-name { font-size: 0.96rem; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .member-role { font-size: 0.78rem; color: #c0392b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .member-bio-preview { font-size: 0.74rem; color: #8892a4; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .member-actions { display: flex; align-items: center; gap: 6px; }
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

        .member-item-body {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }
        .adm-stats-grid {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .adm-stats-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-form-row {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .team-page {
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
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px !important;
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
            width: 100% !important;
          }
          .btn-view-site {
            width: 100% !important;
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
            display: inline-flex !important;
            align-items: center !important;
          }

          .notice-pill, .error-pill {
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

          /* Profile Photo dropzone on mobile */
          .upload-dropzone {
            padding: 12px 10px !important;
          }
          .upload-icon {
            font-size: 26px !important;
            margin-bottom: 4px !important;
          }
          .upload-icon svg {
            width: 26px !important;
            height: 26px !important;
          }
          .upload-title {
            font-size: 0.8rem !important;
          }
          .upload-sub {
            font-size: 0.7rem !important;
            margin: 2px 0 6px !important;
          }
          .upload-hint {
            font-size: 0.65rem !important;
            margin-top: 4px !important;
          }
          .btn-browse {
            height: 28px !important;
            min-height: 28px !important;
            padding: 3px 10px !important;
            font-size: 0.72rem !important;
            border-radius: 5px !important;
          }

          /* Uploaded preview box on mobile */
          .uploaded-preview-box {
            padding: 8px 10px !important;
            gap: 10px !important;
          }
          .preview-img-wrap {
            width: 48px !important;
            height: 48px !important;
            border-radius: 6px !important;
          }
          .preview-filename {
            font-size: 0.76rem !important;
          }
          .preview-status {
            font-size: 0.68rem !important;
          }
          .preview-filesize {
            font-size: 0.68rem !important;
            margin-bottom: 4px !important;
          }
          .btn-change-image, .btn-remove-image {
            height: 26px !important;
            min-height: 26px !important;
            padding: 2px 8px !important;
            font-size: 0.7rem !important;
            border-radius: 4px !important;
          }

          /* Preset grid on mobile */
          .preset-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 5px !important;
          }
          .preset-img {
            height: 38px !important;
          }
          .preset-label {
            font-size: 0.58rem !important;
            padding: 2px !important;
          }

          /* Action Buttons */
          .btn-form-row {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .btn-form-row > button,
          .btn-form-row > a,
          .btn-red,
          .btn-secondary {
            font-size: 0.78rem !important;
            padding: 0 14px !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .btn-form-row > button,
          .btn-form-row > a {
            width: 100% !important;
            flex: none !important;
          }

          /* Member item card on mobile */
          .member-item-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 10px !important;
            gap: 8px !important;
            border-radius: 8px !important;
            margin-bottom: 8px !important;
          }
          .member-item-body {
            display: flex !important;
            align-items: flex-start !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .member-thumb {
            width: 40px !important;
            height: 40px !important;
            border-radius: 8px !important;
            flex-shrink: 0 !important;
          }
          .member-name {
            font-size: 0.84rem !important;
          }
          .member-role {
            font-size: 0.68rem !important;
          }
          .member-bio-preview {
            font-size: 0.72rem !important;
            line-height: 1.35 !important;
          }
          .member-actions {
            width: 100% !important;
            display: flex !important;
            justify-content: flex-end !important;
            gap: 6px !important;
            border-top: 1px solid rgba(255,255,255,0.06) !important;
            padding-top: 6px !important;
          }
          .btn-icon-action {
            width: 28px !important;
            height: 26px !important;
            min-height: 26px !important;
            border-radius: 4px !important;
          }
          .btn-icon-action svg {
            width: 10px !important;
            height: 10px !important;
          }

          .team-preview-sticky {
            position: static !important;
            padding: 12px 10px !important;
          }
        }
      `}</style>

      <div className="team-page">
        {/* Header Stats Bar */}
        <div className="adm-header-stats">
          <div className="adm-stats-grid">
            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(192,57,43,0.15)", color: "#c0392b" }}>
                <FaUsers size={20} />
              </div>
              <div>
                <div className="stat-val">{members.length}</div>
                <div className="stat-lbl">Total Team</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(46,204,113,0.15)", color: "#2ecc71" }}>
                <FaAward size={20} />
              </div>
              <div>
                <div className="stat-val">{members.filter((m) => m.badge?.includes("Board")).length}</div>
                <div className="stat-lbl">Board Directors</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon" style={{ background: "rgba(52,152,219,0.15)", color: "#3498db" }}>
                <FaUserTie size={20} />
              </div>
              <div>
                <div className="stat-val">{members.filter((m) => Number(m.is_active) !== 0).length}</div>
                <div className="stat-lbl">Active Profiles</div>
              </div>
            </div>
          </div>
          <div className="adm-stats-actions">
            <a href="/#about" target="_blank" rel="noreferrer" className="btn-secondary btn-view-site">
              <FaExternalLinkAlt size={11} /> View on Website
            </a>
          </div>
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

        <div className="team-grid-layout">
          {/* LEFT COLUMN: Add New Member & Existing Members List */}
          <div className="team-grid-main">
            {/* Form: Add New Team Member */}
            <div className="adm-card-panel">
              <h2><FaPlus size={14} /> Add New Team Member / Board Director</h2>
              <form onSubmit={handleAddMember}>
                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Prof. Ch. Diwakar Babu"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role / Position *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. President, Vice President, Treasurer"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-half">
                  <div className="form-group">
                    <label className="form-label">Category Badge</label>
                    <select
                      className="form-select"
                      value={newMember.badge}
                      onChange={(e) => setNewMember({ ...newMember, badge: e.target.value })}
                    >
                      <option value="Board of Directors">Board of Directors</option>
                      <option value="Founder & Director">Founder & Director</option>
                      <option value="Executive Team">Executive Team</option>
                      <option value="Advisory Committee">Advisory Committee</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Key Quote / Motto</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Justice is non-negotiable for tribal communities."
                      value={newMember.quote}
                      onChange={(e) => setNewMember({ ...newMember, quote: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Biography / Background Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Renowned legal scholar, former Principal of V.R. Law College, guiding ALERT's legal interventions..."
                    value={newMember.bio}
                    onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  />
                </div>

                {/* Highlights / Badges manager */}
                <div className="form-group">
                  <label className="form-label">Key Highlights / Credentials (Displayed on card back)</label>
                  <div className="highlight-chip-wrap">
                    {newHighlights.map((hl, i) => (
                      <span key={i} className="highlight-chip">
                        <FaCheck size={9} color="#2ecc71" /> {hl}
                        <span className="chip-del" onClick={() => handleRemoveHighlight(i)}>✕</span>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: "8px 12px", fontSize: "0.82rem" }}
                      placeholder="e.g. Principal VR Law College (press Add)"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddHighlight();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "8px 14px", fontSize: "0.78rem" }}
                      onClick={handleAddHighlight}
                      disabled={!highlightInput.trim()}
                    >
                      <FaPlus size={10} /> Add
                    </button>
                  </div>
                </div>

                {/* Member Photo Upload (Pure Drag & Drop / File Select - NO URL INPUT) */}
                <div className="form-group">
                  <label className="form-label">Profile Photo (Drop or Browse File - Pure Image Upload)</label>
                  <input
                    type="file"
                    ref={newFileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImage(e.target.files[0], (compressed) => {
                          setNewUploadedImg(compressed);
                          setNewMember((prev) => ({ ...prev, image_url: compressed.dataUrl }));
                        }, (serverUrl) => {
                          setNewMember((prev) => ({ ...prev, image_url: serverUrl }));
                        });
                      }
                      e.target.value = "";
                    }}
                  />

                  {newUploadedImg || newMember.image_url ? (
                    <div className="uploaded-preview-box">
                      <div className="preview-img-wrap">
                        <img
                          src={newUploadedImg?.dataUrl || newMember.image_url}
                          alt="New member"
                          className="preview-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/uploads/Divakar-Babu.jpg";
                          }}
                        />
                      </div>
                      <div className="preview-info">
                        <div className="preview-status">
                          <FaCheckCircle color="#2ecc71" size={12} /> Photo Selected
                        </div>
                        <div className="preview-filename">
                          {newUploadedImg?.name || newMember.image_url.split("/").pop()}
                        </div>
                        <div className="preview-filesize">{newUploadedImg?.size || "Preset Photo"}</div>
                        <div className="preview-actions">
                          <button
                            type="button"
                            className="btn-change-image"
                            onClick={() => newFileInputRef.current?.click()}
                          >
                            <FaFolderOpen size={11} /> Browse File
                          </button>
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => {
                              setNewUploadedImg(null);
                              setNewMember((prev) => ({ ...prev, image_url: "" }));
                            }}
                          >
                            <FaTrash size={11} /> Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-dropzone ${newDragging ? "dragging" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setNewDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setNewDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          processImage(e.dataTransfer.files[0], (compressed) => {
                            setNewUploadedImg(compressed);
                            setNewMember((prev) => ({ ...prev, image_url: compressed.dataUrl }));
                          }, (serverUrl) => {
                            setNewMember((prev) => ({ ...prev, image_url: serverUrl }));
                          });
                        }
                      }}
                      onClick={() => newFileInputRef.current?.click()}
                    >
                      <FaCloudUploadAlt size={40} className="upload-icon" />
                      <div className="upload-title">Drag & Drop Member Photo Here</div>
                      <div className="upload-sub">or click to browse from computer</div>
                      <button
                        type="button"
                        className="btn-browse"
                        onClick={(e) => { e.stopPropagation(); newFileInputRef.current?.click(); }}
                      >
                        <FaFolderOpen size={12} /> Browse Image File
                      </button>
                      <div className="upload-hint">PNG, JPG, WEBP (Max 10MB) &bull; <strong style={{ color: "#ff8b8b" }}>Images only, videos not supported</strong></div>
                    </div>
                  )}

                  {/* Preset quick pick */}
                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: "0.72rem", color: "#8892a4" }}>Or select from existing member photos:</span>
                    <div className="preset-grid">
                      {PRESET_TEAM_PHOTOS.map((p) => (
                        <div
                          key={p.url}
                          className="preset-card"
                          onClick={() => {
                            setNewUploadedImg(null);
                            setNewMember((prev) => ({ ...prev, image_url: p.url }));
                          }}
                        >
                          <img src={p.url} alt={p.label} className="preset-img" />
                          <div className="preset-label">{p.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="btn-form-row" style={{ marginTop: 12 }}>
                  <button type="submit" className="btn-red">
                    <FaPlus size={12} /> Add Team Member
                  </button>
                </div>
              </form>
            </div>

            {/* List of Existing Members */}
            <div className="adm-card-panel">
              <h2><FaUsers size={14} /> Board of Directors & Team ({members.length})</h2>
              <p style={{ color: "#8892a4", fontSize: "0.8rem", margin: "-6px 0 16px" }}>
                Use the arrows to reorder members. Click Edit to change quotes, credentials, or photos.
              </p>

              {members.map((m, idx) => {
                const isEditing = editingId === m.id;
                return isEditing ? (
                  <div key={m.id} style={{
                    background: "#161c28",
                    border: "1.5px solid #c0392b",
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 16
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ color: "#c0392b", fontWeight: 700, fontSize: "0.88rem" }}>
                        Editing: {m.name}
                      </span>
                      <button type="button" className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.72rem" }} onClick={cancelEdit}>
                        <FaTimes size={10} /> Cancel
                      </button>
                    </div>

                    <div className="form-row-2col" style={{ gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role / Position</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editDraft.role}
                          onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row-half" style={{ gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Category Badge</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editDraft.badge || "Board of Directors"}
                          onChange={(e) => setEditDraft({ ...editDraft, badge: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Key Quote / Motto</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editDraft.quote || ""}
                          onChange={(e) => setEditDraft({ ...editDraft, quote: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Biography</label>
                      <textarea
                        className="form-textarea"
                        value={editDraft.bio || ""}
                        onChange={(e) => setEditDraft({ ...editDraft, bio: e.target.value })}
                      />
                    </div>

                    {/* Edit Highlights */}
                    <div className="form-group">
                      <label className="form-label">Highlights / Credentials</label>
                      <div className="highlight-chip-wrap">
                        {(editDraft.highlights || []).map((hl, i) => (
                          <span key={i} className="highlight-chip">
                            <FaCheck size={9} color="#2ecc71" /> {hl}
                            <span className="chip-del" onClick={() => handleRemoveEditHighlight(i)}>✕</span>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          placeholder="Add credential..."
                          value={editHighlightInput}
                          onChange={(e) => setEditHighlightInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddEditHighlight();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                          onClick={handleAddEditHighlight}
                          disabled={!editHighlightInput.trim()}
                        >
                          <FaPlus size={10} /> Add
                        </button>
                      </div>
                    </div>

                    {/* Edit Photo Dropzone */}
                    <div className="form-group">
                      <label className="form-label">Change Member Photo (Drop or Browse File)</label>
                      <input
                        type="file"
                        ref={editFileInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processImage(e.target.files[0], (compressed) => {
                              setEditDraft((prev) => ({ ...prev, image_url: compressed.dataUrl }));
                              showNotice(`Photo updated to ${e.target.files[0].name}`);
                            }, (serverUrl) => {
                              setEditDraft((prev) => ({ ...prev, image_url: serverUrl }));
                            });
                          }
                          e.target.value = "";
                        }}
                      />
                      <div
                        className={`upload-dropzone ${editDragging ? "dragging" : ""}`}
                        style={{ padding: "14px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setEditDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setEditDragging(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            processImage(e.dataTransfer.files[0], (compressed) => {
                              setEditDraft((prev) => ({ ...prev, image_url: compressed.dataUrl }));
                              showNotice(`Photo updated to ${e.dataTransfer.files[0].name}`);
                            }, (serverUrl) => {
                              setEditDraft((prev) => ({ ...prev, image_url: serverUrl }));
                            });
                          }
                        }}
                        onClick={() => editFileInputRef.current?.click()}
                      >
                        <img
                          src={editDraft.image_url || editDraft.img}
                          alt={editDraft.name}
                          style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/uploads/Divakar-Babu.jpg";
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>Click or drop photo here to replace</div>
                          <div style={{ color: "#8892a4", fontSize: "0.72rem" }}>Supports PNG, JPG, WEBP</div>
                        </div>
                        <button
                          type="button"
                          className="btn-browse"
                          onClick={(e) => { e.stopPropagation(); editFileInputRef.current?.click(); }}
                        >
                          <FaFolderOpen size={11} /> Browse File
                        </button>
                      </div>
                    </div>

                    <div className="btn-form-row" style={{ marginTop: 14 }}>
                      <button type="button" className="btn-red" onClick={() => handleSaveEdit(m.id)}>
                        <FaSave size={12} /> Save Changes
                      </button>
                      <button type="button" className="btn-secondary" onClick={cancelEdit}>
                        <FaTimes size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="member-item-card">
                    <div className="member-item-body">
                      <img
                        src={m.image_url || m.img}
                        alt={m.name}
                        className="member-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/uploads/Divakar-Babu.jpg";
                        }}
                      />
                      <div className="member-details">
                        <div className="member-name">{m.name}</div>
                        <div className="member-role">{m.role} &bull; <span style={{ color: "#94a3b8", textTransform: "none", fontWeight: 500 }}>{m.badge || "Board of Directors"}</span></div>
                        {m.quote && (
                          <div style={{ color: "#f59e0b", fontSize: "0.72rem", fontStyle: "italic", marginTop: 2 }}>
                            "{m.quote}"
                          </div>
                        )}
                        <div className="member-bio-preview">{m.bio}</div>
                      </div>
                    </div>
                    <div className="member-actions">
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => moveMember(idx, "up")}
                      >
                        <FaArrowUp size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Move Down"
                        disabled={idx === members.length - 1}
                        onClick={() => moveMember(idx, "down")}
                      >
                        <FaArrowDown size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Edit Member"
                        onClick={() => startEdit(m)}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action btn-icon-danger"
                        title="Remove Member"
                        onClick={() => handleDelete(m.id, m.name)}
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive FlipCard Preview */}
          <div className="team-grid-side">
            <div className="adm-card-panel team-preview-sticky">
              <h2><FaEye size={13} /> Live Flip Card Preview</h2>
              <p style={{ color: "#8892a4", fontSize: "0.78rem", margin: "-6px 0 16px", lineHeight: 1.4 }}>
                Hover or tap the card below to see the interactive 3D flip animation exactly as it renders on the live website.
              </p>

              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 16px", width: "100%", overflow: "hidden" }}>
                <div style={{ width: "100%", maxWidth: 290, minWidth: 0 }}>
                  <FlipCard
                    img={livePreviewMember.img || livePreviewMember.image_url}
                    name={livePreviewMember.name}
                    role={livePreviewMember.role}
                    bio={livePreviewMember.bio}
                    badge={livePreviewMember.badge || "Board of Directors"}
                    highlights={livePreviewMember.highlights || []}
                    quote={livePreviewMember.quote}
                  />
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
                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>💡 Flip Card Features:</div>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
                  <li><strong>Front:</strong> Member portrait photo, full name, role title.</li>
                  <li><strong>Back:</strong> Inspiring quote, full biography, and key credential badges.</li>
                  <li>Any updates made on this page immediately reflect across the public Home and Governing Body pages!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
