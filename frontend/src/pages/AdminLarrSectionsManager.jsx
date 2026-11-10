import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCloudUploadAlt,
  FaFilePdf, FaImage, FaVideo, FaFileAlt, FaArrowUp, FaArrowDown,
  FaCheckCircle, FaExclamationCircle, FaEye, FaLink, FaChevronDown,
  FaChevronRight, FaGripVertical, FaLayerGroup, FaCheck
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminListLaRrPages,
  adminGetLaRrPage,
  adminSaveLaRrContent,
  adminUploadImage,
  adminUploadVideo
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

/* ─── Toast ─────────────────────────────────────────────────────────── */
function Toast({ msg }) {
  if (!msg.text) return null;
  const bg = msg.type === "error" ? "#dc2626" : msg.type === "success" ? "#059669" : "#0284c7";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: "#fff", padding: "12px 20px",
      borderRadius: 10, fontWeight: 700, fontSize: "0.9rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)", maxWidth: 400,
      display: "flex", alignItems: "center", gap: 10
    }}>
      {msg.type === "success" ? <FaCheckCircle /> : msg.type === "error" ? <FaExclamationCircle /> : null}
      {msg.text}
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const EMPTY_SECTION = () => ({
  id: Date.now() + Math.random(),
  title: "",
  subtitle: "",
  badge: "",
  content: "",
  paragraphs: [],
  images: [],
  videos: [],
  downloads: []
});

/* ─── MediaItem component ─────────────────────────────────────────────── */
function MediaItem({ item, label, onRemove, onEdit }) {
  const src = item.src || item.url || item.file || "";
  const name = item.name || item.title || item.text || (src.split("/").pop()) || "Media";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#0f172a", border: "1px solid #1e293b",
      borderRadius: 8, padding: "8px 12px", marginBottom: 6
    }}>
      <span style={{ color: "#64748b", fontSize: "0.75rem", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#cbd5e1", fontSize: "0.82rem", flex: 1, wordBreak: "break-all" }}>{name}</span>
      {src && (
        <a href={src} target="_blank" rel="noopener noreferrer"
          style={{ color: "#38bdf8", fontSize: "0.75rem", textDecoration: "none" }}>
          <FaEye />
        </a>
      )}
      {onEdit && (
        <button onClick={onEdit} style={{
          background: "none", border: "none", color: "#f59e0b", cursor: "pointer", padding: 2
        }}><FaEdit /></button>
      )}
      <button onClick={onRemove} style={{
        background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 2
      }}><FaTrash /></button>
    </div>
  );
}

/* ─── SectionEditor ───────────────────────────────────────────────────── */
function SectionEditor({ section, idx, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, adminKey, showToast }) {
  const [expanded, setExpanded] = useState(true);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [addImgUrl, setAddImgUrl] = useState("");
  const [addVidUrl, setAddVidUrl] = useState("");
  const [addPdfUrl, setAddPdfUrl] = useState({ url: "", title: "", size: "" });
  const [imgMode, setImgMode] = useState("upload"); // upload | url
  const [vidMode, setVidMode] = useState("upload"); // upload | url | youtube
  const [pdfMode, setPdfMode] = useState("upload"); // upload | url

  const imgRef = useRef();
  const vidRef = useRef();
  const pdfRef = useRef();

  const patch = (field, value) => onChange(idx, { ...section, [field]: value });

  /* Image upload */
  const handleImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const res = await adminUploadImage(adminKey, file, "larr");
      if (res?.success && res.url) {
        const imgs = [...(section.images || []), { src: res.url, url: res.url, name: file.name.replace(/\.[^/.]+$/, "") }];
        patch("images", imgs);
        showToast("Image uploaded!", "success");
      } else showToast(res?.message || "Upload failed", "error");
    } catch { showToast("Upload error", "error"); }
    finally { setUploadingImg(false); if (e.target) e.target.value = ""; }
  };

  const handleAddImgUrl = () => {
    if (!addImgUrl.trim()) return;
    const name = addImgUrl.split("/").pop().replace(/\.[^/.]+$/, "") || "Image";
    const imgs = [...(section.images || []), { src: addImgUrl.trim(), url: addImgUrl.trim(), name }];
    patch("images", imgs);
    setAddImgUrl("");
    showToast("Image URL added!", "success");
  };

  /* Video upload */
  const handleVidUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVid(true);
    try {
      const res = await adminUploadVideo(adminKey, file, "larr");
      if (res?.success && res.url) {
        const vids = [...(section.videos || []), { src: res.url, url: res.url, title: file.name, type: "video" }];
        patch("videos", vids);
        showToast("Video uploaded!", "success");
      } else showToast(res?.message || "Upload failed", "error");
    } catch { showToast("Upload error", "error"); }
    finally { setUploadingVid(false); if (e.target) e.target.value = ""; }
  };

  const handleAddVidUrl = () => {
    if (!addVidUrl.trim()) return;
    const isYt = /youtube\.com|youtu\.be/i.test(addVidUrl);
    const vids = [...(section.videos || []), { src: addVidUrl.trim(), url: addVidUrl.trim(), title: "Video", type: isYt ? "youtube" : "video" }];
    patch("videos", vids);
    setAddVidUrl("");
    showToast("Video URL added!", "success");
  };

  /* PDF upload */
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const res = await adminUploadImage(adminKey, file, "larr"); // reuses image upload endpoint for PDFs
      if (res?.success && res.url) {
        const cleanName = file.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ");
        const docTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const docs = [...(section.downloads || []), {
          url: res.url, file: res.url,
          title: docTitle, text: docTitle,
          filename: file.name,
          size: formatBytes(file.size),
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        }];
        patch("downloads", docs);
        showToast("PDF uploaded!", "success");
      } else showToast(res?.message || "Upload failed", "error");
    } catch { showToast("Upload error", "error"); }
    finally { setUploadingPdf(false); if (e.target) e.target.value = ""; }
  };

  const handleAddPdfUrl = () => {
    if (!addPdfUrl.url.trim()) return;
    const docs = [...(section.downloads || []), {
      url: addPdfUrl.url.trim(),
      file: addPdfUrl.url.trim(),
      title: addPdfUrl.title || addPdfUrl.url.split("/").pop().replace(/\.pdf$/i, "").replace(/[-_]+/g, " "),
      text: addPdfUrl.title || "Document",
      filename: addPdfUrl.url.split("/").pop(),
      size: addPdfUrl.size || "",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    }];
    patch("downloads", docs);
    setAddPdfUrl({ url: "", title: "", size: "" });
    showToast("PDF URL added!", "success");
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    background: "#0f172a", border: "1px solid #374151",
    borderRadius: 8, color: "#f1f5f9", fontSize: "0.88rem",
    boxSizing: "border-box", outline: "none", resize: "vertical"
  };
  const labelStyle = { fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: 5, fontWeight: 600, letterSpacing: "0.03em" };
  const uploadBtnStyle = (bg) => ({
    padding: "7px 14px", background: bg, color: "#fff", border: "none",
    borderRadius: 7, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
    display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0
  });
  const tabBtnStyle = (active, color = "#0284c7") => ({
    padding: "5px 12px", border: "none", borderRadius: 6, cursor: "pointer",
    fontSize: "0.74rem", fontWeight: 700,
    background: active ? color : "#1e293b",
    color: active ? "#fff" : "#94a3b8"
  });

  return (
    <div style={{
      background: "#111827", border: "1px solid #1f2937",
      borderRadius: 14, marginBottom: 16, overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 18px", background: "#0d1117",
        borderBottom: expanded ? "1px solid #1f2937" : "none",
        cursor: "pointer"
      }} onClick={() => setExpanded(v => !v)}>
        <FaGripVertical style={{ color: "#334155", flexShrink: 0 }} />
        <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 700, background: "#1e293b", padding: "2px 8px", borderRadius: 5, flexShrink: 0 }}>
          §{idx + 1}
        </span>
        <span style={{ flex: 1, color: "#e2e8f0", fontWeight: 700, fontSize: "0.9rem" }}>
          {section.title || <em style={{ color: "#64748b" }}>Untitled Section</em>}
        </span>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onMoveUp(idx)} disabled={isFirst} style={{ ...uploadBtnStyle("#1e293b"), padding: "5px 9px", opacity: isFirst ? 0.3 : 1 }}><FaArrowUp /></button>
          <button onClick={() => onMoveDown(idx)} disabled={isLast} style={{ ...uploadBtnStyle("#1e293b"), padding: "5px 9px", opacity: isLast ? 0.3 : 1 }}><FaArrowDown /></button>
          <button onClick={() => onDelete(idx)} style={{ ...uploadBtnStyle("#dc2626"), padding: "5px 9px" }}><FaTrash /></button>
        </div>
        {expanded ? <FaChevronDown style={{ color: "#64748b" }} /> : <FaChevronRight style={{ color: "#64748b" }} />}
      </div>

      {!expanded ? null : (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Section Title *</label>
            <input
              value={section.title || ""}
              onChange={e => patch("title", e.target.value)}
              placeholder="e.g. Land Acquisition Act 2013"
              style={inputStyle}
            />
          </div>

          {/* Badge & Subtitle row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Badge Label</label>
              <input
                value={section.badge || ""}
                onChange={e => patch("badge", e.target.value)}
                placeholder="e.g. Section 02"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Subtitle</label>
              <input
                value={section.subtitle || ""}
                onChange={e => patch("subtitle", e.target.value)}
                placeholder="Short description shown under title"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Body Content */}
          <div>
            <label style={labelStyle}>Body Content / Description</label>
            <textarea
              value={section.content || ""}
              onChange={e => patch("content", e.target.value)}
              rows={5}
              placeholder="Enter full HTML or plain-text content for this section..."
              style={{ ...inputStyle }}
            />
          </div>

          {/* Paragraphs */}
          <div>
            <label style={labelStyle}>Paragraphs (one per line)</label>
            <textarea
              value={(section.paragraphs || []).join("\n")}
              onChange={e => patch("paragraphs", e.target.value.split("\n").filter(x => x.trim()))}
              rows={4}
              placeholder="Each line becomes a separate paragraph..."
              style={{ ...inputStyle }}
            />
          </div>

          {/* ── Images ─────────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Images / Maps</label>
            {/* Existing */}
            {(section.images || []).map((img, i) => (
              <MediaItem key={i} label="IMG" item={img}
                onRemove={() => {
                  const imgs = [...(section.images || [])];
                  imgs.splice(i, 1);
                  patch("images", imgs);
                }}
              />
            ))}
            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button onClick={() => setImgMode("upload")} style={tabBtnStyle(imgMode === "upload")}><FaCloudUploadAlt /> Upload</button>
              <button onClick={() => setImgMode("url")} style={tabBtnStyle(imgMode === "url")}><FaLink /> URL</button>
            </div>
            {imgMode === "upload" ? (
              <>
                <input type="file" ref={imgRef} style={{ display: "none" }} accept="image/*" onChange={handleImgUpload} />
                <button type="button" onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                  style={uploadBtnStyle("#0284c7")}>
                  <FaCloudUploadAlt /> {uploadingImg ? "Uploading…" : "Upload Image"}
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input value={addImgUrl} onChange={e => setAddImgUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={handleAddImgUrl} style={uploadBtnStyle("#0284c7")}>
                  <FaPlus /> Add
                </button>
              </div>
            )}
          </div>

          {/* ── Videos ─────────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>Videos</label>
            {(section.videos || []).map((vid, i) => (
              <MediaItem key={i} label="VID" item={vid}
                onRemove={() => {
                  const vids = [...(section.videos || [])];
                  vids.splice(i, 1);
                  patch("videos", vids);
                }}
              />
            ))}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button onClick={() => setVidMode("upload")} style={tabBtnStyle(vidMode === "upload", "#059669")}><FaCloudUploadAlt /> Upload</button>
              <button onClick={() => setVidMode("url")} style={tabBtnStyle(vidMode === "url", "#059669")}><FaLink /> URL/YouTube</button>
            </div>
            {vidMode === "upload" ? (
              <>
                <input type="file" ref={vidRef} style={{ display: "none" }} accept="video/*" onChange={handleVidUpload} />
                <button type="button" onClick={() => vidRef.current?.click()} disabled={uploadingVid}
                  style={uploadBtnStyle("#059669")}>
                  <FaVideo /> {uploadingVid ? "Uploading…" : "Upload Video"}
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input value={addVidUrl} onChange={e => setAddVidUrl(e.target.value)}
                  placeholder="YouTube or direct video URL"
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={handleAddVidUrl} style={uploadBtnStyle("#059669")}>
                  <FaPlus /> Add
                </button>
              </div>
            )}
          </div>

          {/* ── PDFs ───────────────────────────────────────────────── */}
          <div>
            <label style={labelStyle}>PDF Documents</label>
            {(section.downloads || []).map((doc, i) => (
              <MediaItem key={i} label="PDF" item={{ ...doc, name: doc.title || doc.text || doc.filename }}
                onRemove={() => {
                  const docs = [...(section.downloads || [])];
                  docs.splice(i, 1);
                  patch("downloads", docs);
                }}
                onEdit={() => {
                  const newTitle = window.prompt("Edit PDF title:", doc.title || doc.text || "");
                  if (newTitle !== null) {
                    const docs = [...(section.downloads || [])];
                    docs[i] = { ...docs[i], title: newTitle, text: newTitle };
                    patch("downloads", docs);
                  }
                }}
              />
            ))}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button onClick={() => setPdfMode("upload")} style={tabBtnStyle(pdfMode === "upload", "#7c3aed")}><FaCloudUploadAlt /> Upload PDF</button>
              <button onClick={() => setPdfMode("url")} style={tabBtnStyle(pdfMode === "url", "#7c3aed")}><FaLink /> Add URL</button>
            </div>
            {pdfMode === "upload" ? (
              <>
                <input type="file" ref={pdfRef} style={{ display: "none" }} accept=".pdf,application/pdf" onChange={handlePdfUpload} />
                <button type="button" onClick={() => pdfRef.current?.click()} disabled={uploadingPdf}
                  style={uploadBtnStyle("#7c3aed")}>
                  <FaFilePdf /> {uploadingPdf ? "Uploading…" : "Upload PDF"}
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={addPdfUrl.title} onChange={e => setAddPdfUrl(v => ({ ...v, title: e.target.value }))}
                  placeholder="Document title / label"
                  style={{ ...inputStyle }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={addPdfUrl.url} onChange={e => setAddPdfUrl(v => ({ ...v, url: e.target.value }))}
                    placeholder="https://example.com/document.pdf"
                    style={{ ...inputStyle, flex: 1 }} />
                  <input value={addPdfUrl.size} onChange={e => setAddPdfUrl(v => ({ ...v, size: e.target.value }))}
                    placeholder="Size (e.g. 1.2 MB)"
                    style={{ ...inputStyle, width: 120 }} />
                  <button onClick={handleAddPdfUrl} style={uploadBtnStyle("#7c3aed")}>
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

/* ─── Main Page Component ─────────────────────────────────────────────── */
export default function AdminLarrSectionsManager() {
  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get("slug") || "la-rr";

  const [adminKey, setAdminKey] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(slugParam);
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ text: "", type: "info" });

  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || localStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
  }, []);

  /* Load page list */
  const loadPages = useCallback(async () => {
    if (!adminKey) return;
    try {
      const res = await adminListLaRrPages(adminKey);
      if (res?.success && Array.isArray(res.data)) {
        setPages(res.data);
      }
    } catch { }
  }, [adminKey]);

  useEffect(() => { loadPages(); }, [loadPages]);

  /* Load selected page */
  const loadPage = useCallback(async () => {
    if (!adminKey || !selectedSlug) return;
    setIsLoading(true);
    try {
      const res = await adminGetLaRrPage(adminKey, selectedSlug);
      if (res?.success && res.data) {
        const p = res.data;
        setPage(p);
        const content = p.content || {};
        // Sections can live at content.sections or we construct from scratch
        const secs = Array.isArray(content.sections) ? content.sections : [];
        setSections(secs.map(s => ({ ...s, id: s.id || Date.now() + Math.random() })));
      }
    } catch (e) {
      showToast("Failed to load page: " + (e?.message || e), "error");
    } finally {
      setIsLoading(false);
    }
  }, [adminKey, selectedSlug]);

  useEffect(() => { if (adminKey) loadPage(); }, [adminKey, loadPage]);

  /* Sync slug from URL param */
  useEffect(() => {
    if (slugParam && slugParam !== selectedSlug) {
      setSelectedSlug(slugParam);
    }
  }, [slugParam]);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "info" }), 4000);
  };

  /* Section CRUD */
  const handleAddSection = () => {
    setSections(prev => [...prev, EMPTY_SECTION()]);
    showToast("New section added. Fill in the details and save.", "info");
  };

  const handleChangeSection = (idx, updated) => {
    setSections(prev => prev.map((s, i) => i === idx ? updated : s));
  };

  const handleDeleteSection = (idx) => {
    if (!window.confirm(`Delete section "${sections[idx]?.title || `Section ${idx + 1}`}"?`)) return;
    setSections(prev => prev.filter((_, i) => i !== idx));
    showToast("Section removed. Click Save to persist.", "info");
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    setSections(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (idx) => {
    if (idx >= sections.length - 1) return;
    setSections(prev => {
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  /* Save all sections to backend */
  const handleSave = async () => {
    if (!page) return;
    setIsSaving(true);
    const cleanSections = sections.map(({ id, ...rest }) => rest); // strip temp ids
    try {
      const res = await adminSaveLaRrContent(adminKey, {
        slug: page.slug,
        page_id: page.id,
        content: { ...(page.content || {}), sections: cleanSections },
        sections: cleanSections
      });
      if (res?.success) {
        showToast("All sections saved to database successfully!", "success");
        setPage(prev => ({ ...prev, content: { ...(prev?.content || {}), sections: cleanSections } }));
      } else {
        showToast(res?.message || "Save may have partial issues.", "error");
      }
    } catch (e) {
      showToast("Error: " + (e?.message || e), "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* Styles */
  const sidebarItemStyle = (active) => ({
    padding: "9px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4,
    background: active ? "rgba(37,99,235,0.2)" : "#0f172a",
    border: active ? "1px solid #3b82f6" : "1px solid #1e293b",
    color: active ? "#93c5fd" : "#94a3b8",
    fontSize: "0.82rem", fontWeight: 600,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    transition: "all 0.15s"
  });

  const selectedPage = pages.find(p => p.slug === selectedSlug);

  return (
    <AdminLayout title="LARR — Sections Manager">
      <Toast msg={toast} />

      {/* Page header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.3rem", margin: 0 }}>
            <FaLayerGroup style={{ marginRight: 10, color: "#38bdf8" }} />
            LA & RR — Sections Manager
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "4px 0 0" }}>
            Add, edit, delete and reorder custom sections for each LA & RR page. Each section supports images, videos and PDFs.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave} disabled={isSaving || !page}
            style={{
              padding: "10px 22px", background: isSaving ? "#1e293b" : "#0284c7",
              color: "#fff", border: "none", borderRadius: 9, cursor: "pointer",
              fontWeight: 800, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8
            }}>
            {isSaving ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", display: "inline-block" }} /></> : <FaSave />}
            {isSaving ? "Saving…" : "Save All Sections"}
          </button>
          <button onClick={handleAddSection}
            style={{
              padding: "10px 18px", background: "#059669", color: "#fff",
              border: "none", borderRadius: 9, cursor: "pointer",
              fontWeight: 800, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8
            }}>
            <FaPlus /> Add Section
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* ── Left sidebar: page selector ── */}
        <div style={{
          width: 240, flexShrink: 0,
          background: "#111827", borderRadius: 14,
          border: "1px solid #1f2937", padding: 14,
          position: "sticky", top: 16,
          maxHeight: "calc(100vh - 120px)", overflowY: "auto"
        }}>
          <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", marginBottom: 10, padding: "0 4px" }}>
            SELECT PAGE
          </div>
          {pages.length === 0 && (
            <p style={{ color: "#475569", fontSize: "0.8rem", padding: "0 4px" }}>Loading pages…</p>
          )}
          {pages.map(p => (
            <div key={p.slug}
              onClick={() => setSelectedSlug(p.slug)}
              style={sidebarItemStyle(p.slug === selectedSlug)}>
              <span>{p.nav_label || p.title || p.slug}</span>
              {p.slug === selectedSlug && <FaCheck style={{ color: "#60a5fa", fontSize: "0.7rem" }} />}
            </div>
          ))}
        </div>

        {/* ── Main content: sections ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Page info banner */}
          {selectedPage && (
            <div style={{
              background: "#0d1117", border: "1px solid #1e293b",
              borderRadius: 12, padding: "14px 18px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#93c5fd", fontWeight: 800, fontSize: "0.95rem" }}>
                  {selectedPage.nav_label || selectedPage.title}
                </div>
                <div style={{ color: "#475569", fontSize: "0.78rem", marginTop: 2 }}>
                  slug: <code style={{ color: "#64748b" }}>{selectedPage.slug}</code>
                  {" · "}
                  {sections.length} section{sections.length !== 1 ? "s" : ""}
                </div>
              </div>
              <a href={`/la-rr`} target="_blank" rel="noopener noreferrer"
                style={{
                  color: "#38bdf8", fontSize: "0.78rem", fontWeight: 600,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 5
                }}>
                <FaEye /> Preview Page
              </a>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: "center", color: "#64748b", padding: 60 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #1e293b", borderTopColor: "#38bdf8", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              Loading sections…
            </div>
          ) : sections.length === 0 ? (
            <div style={{
              textAlign: "center", padding: 60,
              background: "#111827", border: "1px dashed #1f2937",
              borderRadius: 14, color: "#475569"
            }}>
              <FaLayerGroup style={{ fontSize: "2.5rem", marginBottom: 14, color: "#1e293b" }} />
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: "#64748b" }}>No sections yet</div>
              <div style={{ fontSize: "0.82rem", marginBottom: 20 }}>
                Click "Add Section" to create the first section for this page.
              </div>
              <button onClick={handleAddSection}
                style={{
                  padding: "10px 20px", background: "#059669", color: "#fff",
                  border: "none", borderRadius: 8, cursor: "pointer",
                  fontWeight: 700, fontSize: "0.88rem",
                  display: "inline-flex", alignItems: "center", gap: 8
                }}>
                <FaPlus /> Add First Section
              </button>
            </div>
          ) : (
            <>
              {sections.map((section, idx) => (
                <SectionEditor
                  key={section.id || idx}
                  section={section}
                  idx={idx}
                  onChange={handleChangeSection}
                  onDelete={handleDeleteSection}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={idx === 0}
                  isLast={idx === sections.length - 1}
                  adminKey={adminKey}
                  showToast={showToast}
                />
              ))}

              {/* Bottom save bar */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", background: "#0d1117",
                border: "1px solid #1e293b", borderRadius: 12, marginTop: 8
              }}>
                <span style={{ color: "#64748b", fontSize: "0.82rem" }}>
                  {sections.length} section{sections.length !== 1 ? "s" : ""} · unsaved changes will be lost on refresh
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleAddSection}
                    style={{
                      padding: "9px 16px", background: "#059669", color: "#fff",
                      border: "none", borderRadius: 8, cursor: "pointer",
                      fontWeight: 700, fontSize: "0.84rem",
                      display: "flex", alignItems: "center", gap: 7
                    }}>
                    <FaPlus /> Add Section
                  </button>
                  <button onClick={handleSave} disabled={isSaving}
                    style={{
                      padding: "9px 20px", background: isSaving ? "#1e293b" : "#0284c7",
                      color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
                      fontWeight: 700, fontSize: "0.84rem",
                      display: "flex", alignItems: "center", gap: 7
                    }}>
                    <FaSave /> {isSaving ? "Saving…" : "Save to Database"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
}

