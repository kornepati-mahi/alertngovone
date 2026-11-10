import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCloudUploadAlt,
  FaFilePdf, FaImage, FaVideo, FaFileAlt, FaArrowLeft
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

export default function AdminLaRrSections() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug") || "la-rr";
  const [adminKey, setAdminKey] = useState("");
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const imgInputRef = useRef(null);
  const vidInputRef = useRef(null);

  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
  }, []);

  const loadPage = useCallback(async () => {
    try {
      const res = await adminGetLaRrPage(adminKey, slug);
      if (res && res.success && res.data) {
        const p = res.data;
        setPage(p);
        const content = p.content || {};
        const secs = Array.isArray(content.sections) ? content.sections : [];
        setSections(secs);
        if (secs.length === 0) setSelectedIdx(-1);
      }
    } catch (e) {
      showToast("Failed to load page", "error");
    }
  }, [adminKey, slug]);

  useEffect(() => { if (adminKey) loadPage(); }, [adminKey, loadPage]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const selected = selectedIdx >= 0 ? sections[selectedIdx] : null;

  const updateSection = (idx, patch) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSection = () => {
    const newSec = { title: "New Section", subtitle: "", paragraphs: [], images: [], videos: [], downloads: [] };
    setSections((prev) => {
      const next = [...prev, newSec];
      setSelectedIdx(next.length - 1);
      return next;
    });
  };

  const deleteSection = async (idx) => {
    if (!window.confirm("Delete this section?")) return;
    const next = sections.filter((_, i) => i !== idx);
    setSections(next);
    setSelectedIdx(next.length > 0 ? 0 : -1);
    await saveAll(next);
  };

  const saveAll = async (secs = sections) => {
    if (!page) return;
    setIsSaving(true);
    try {
      await adminSaveLaRrContent(adminKey, {
        slug: page.slug,
        page_id: page.id,
        content: { ...(page.content || {}), sections: secs },
        sections: secs
      });
      showToast("Sections saved to database!", "success");
    } catch (e) {
      showToast("Error saving: " + (e?.message || e), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || selectedIdx < 0) return;
    setIsUploading(true);
    try {
      const res = await adminUploadImage(adminKey, file, "larr");
      if (res && res.success && res.url) {
        const imgs = [...(selected.images || []), { src: res.url, url: res.url, name: file.name.replace(/\.[^/.]+$/, "") }];
        updateSection(selectedIdx, { images: imgs });
        showToast("Image uploaded", "success");
      } else {
        showToast(res?.message || "Upload failed", "error");
      }
    } catch (err) {
      showToast("Upload error", "error");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleVidUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || selectedIdx < 0) return;
    setIsUploading(true);
    try {
      const res = await adminUploadVideo(adminKey, file, "larr");
      if (res && res.success && res.url) {
        const vids = [...(selected.videos || []), { src: res.url, url: res.url, name: file.name }];
        updateSection(selectedIdx, { videos: vids });
        showToast("Video uploaded", "success");
      } else {
        showToast(res?.message || "Upload failed", "error");
      }
    } catch (err) {
      showToast("Upload error", "error");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <AdminLayout title={`LA & RR Sections — ${page?.nav_label || slug}`}>
      <div style={{ display: "flex", gap: 16, minHeight: "70vh" }}>
        {/* Sidebar */}
        <div style={{ width: 260, flexShrink: 0, background: "#111827", borderRadius: 12, border: "1px solid #1f2937", padding: 12, position: "sticky", top: 16, alignSelf: "flex-start", maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>Sections</span>
            <button onClick={addSection} style={{ padding: "4px 10px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}>
              <FaPlus size={10} /> Add
            </button>
          </div>
          {sections.length === 0 && <p style={{ color: "#64748b", fontSize: "0.8rem" }}>No sections yet.</p>}
          {sections.map((s, i) => (
            <div
              key={i}
              onClick={() => setSelectedIdx(i)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                marginBottom: 6,
                cursor: "pointer",
                background: i === selectedIdx ? "rgba(37,99,235,0.2)" : "#0f172a",
                border: i === selectedIdx ? "1px solid #3b82f6" : "1px solid #1e293b",
                color: "#e2e8f0",
                fontSize: "0.82rem",
                fontWeight: 600
              }}
            >
              {s.title || `Section ${i + 1}`}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div style={{ flex: 1, background: "#111827", borderRadius: 12, border: "1px solid #1f2937", padding: 20 }}>
          {toast.show && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: toast.type === "error" ? "#dc2626" : "#059669", color: "#fff", borderRadius: 6, fontSize: "0.85rem" }}>
              {toast.message}
            </div>
          )}
          {!selected ? (
            <p style={{ color: "#64748b" }}>Select or add a section to edit.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#9ca3af", display: "block", marginBottom: 4 }}>Title</label>
                <input
                  value={selected.title || ""}
                  onChange={(e) => updateSection(selectedIdx, { title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #374151", borderRadius: 8, color: "#fff", fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#9ca3af", display: "block", marginBottom: 4 }}>Subtitle</label>
                <input
                  value={selected.subtitle || ""}
                  onChange={(e) => updateSection(selectedIdx, { subtitle: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #374151", borderRadius: 8, color: "#fff", fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#9ca3af", display: "block", marginBottom: 4 }}>Paragraphs (one per line)</label>
                <textarea
                  value={(selected.paragraphs || []).join("\n")}
                  onChange={(e) => updateSection(selectedIdx, { paragraphs: e.target.value.split("\n").filter((x) => x.trim()) })}
                  rows={6}
                  style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #374151", borderRadius: 8, color: "#fff", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#9ca3af", display: "block", marginBottom: 4 }}>Images (URLs, one per line)</label>
                <textarea
                  value={(selected.images || []).map((x) => (typeof x === "string" ? x : x.src || x.url || "")).join("\n")}
                  onChange={(e) => updateSection(selectedIdx, { images: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).map((u) => ({ src: u, url: u, name: "Image" })) })}
                  rows={3}
                  style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #374151", borderRadius: 8, color: "#fff", fontSize: "0.85rem" }}
                />
                <input type="file" ref={imgInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImgUpload} />
                <button type="button" onClick={() => imgInputRef.current?.click()} disabled={isUploading} style={{ marginTop: 6, padding: "6px 12px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>
                  <FaCloudUploadAlt size={12} /> Upload Image
                </button>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#9ca3af", display: "block", marginBottom: 4 }}>Videos (URLs, one per line)</label>
                <textarea
                  value={(selected.videos || []).map((x) => (typeof x === "string" ? x : x.src || x.url || "")).join("\n")}
                  onChange={(e) => updateSection(selectedIdx, { videos: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).map((u) => ({ src: u, url: u, name: "Video" })) })}
                  rows={2}
                  style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #374151", borderRadius: 8, color: "#fff", fontSize: "0.85rem" }}
                />
                <input type="file" ref={vidInputRef} style={{ display: "none" }} accept="video/*" onChange={handleVidUpload} />
                <button type="button" onClick={() => vidInputRef.current?.click()} disabled={isUploading} style={{ marginTop: 6, padding: "6px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>
                  <FaVideo size={12} /> Upload Video
                </button>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#9ca3af", display: "block", marginBottom: 4 }}>PDFs (URLs, one per line)</label>
                <textarea
                  value={(selected.downloads || []).map((x) => (typeof x === "string" ? x : x.url || x.file || "")).join("\n")}
                  onChange={(e) => updateSection(selectedIdx, { downloads: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).map((u) => ({ url: u, file: u, title: "Document" })) })}
                  rows={2}
                  style={{ width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #374151", borderRadius: 8, color: "#fff", fontSize: "0.85rem" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => saveAll()} disabled={isSaving} style={{ padding: "9px 18px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                  <FaSave size={12} /> {isSaving ? "Saving..." : "Save to Database"}
                </button>
                <button onClick={() => deleteSection(selectedIdx)} style={{ padding: "9px 18px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                  <FaTrash size={12} /> Delete Section
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}