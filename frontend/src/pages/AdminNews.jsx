import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaNewspaper, FaSearch, FaPlus, FaTrash, FaEdit, FaSave, FaExternalLinkAlt,
  FaCheck, FaTimes, FaCloudUploadAlt, FaCalendarAlt, FaTag, FaCheckCircle,
  FaExclamationTriangle, FaSyncAlt, FaArrowRight, FaFilter, FaImages
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminListNews,
  adminCreateNews,
  adminUpdateNews,
  adminDeleteNews,
  adminReorderNews,
  adminSeedNews,
  adminUploadImage,
  API_BASE
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

const CATEGORY_COLORS = {
  relief: { bg: "rgba(2, 132, 199, 0.15)", border: "#0284c7", text: "#7dd3fc", label: "Flood Relief" },
  winter: { bg: "rgba(99, 102, 241, 0.15)", border: "#6366f1", text: "#a5b4fc", label: "Winter Blankets" },
  groceries: { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#6ee7b7", label: "Groceries Distribution" },
  energy: { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#fcd34d", label: "Solar Energy" },
  general: { bg: "rgba(148, 163, 184, 0.15)", border: "#94a3b8", text: "#cbd5e1", label: "General News" }
};

const getCategoryTheme = (catKey) => {
  if (!catKey) return CATEGORY_COLORS.general;
  const k = catKey.toLowerCase().trim();
  if (CATEGORY_COLORS[k]) return CATEGORY_COLORS[k];
  if (k.includes("relief") || k.includes("flood")) return { ...CATEGORY_COLORS.relief, label: catKey };
  if (k.includes("winter") || k.includes("blanket")) return { ...CATEGORY_COLORS.winter, label: catKey };
  if (k.includes("grocer") || k.includes("food") || k.includes("ration")) return { ...CATEGORY_COLORS.groceries, label: catKey };
  if (k.includes("energy") || k.includes("solar")) return { ...CATEGORY_COLORS.energy, label: catKey };
  return {
    bg: "rgba(168, 85, 247, 0.15)",
    border: "#a855f7",
    text: "#d8b4fe",
    label: catKey
  };
};

export default function AdminNews() {
  const [adminKey, setAdminKey] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsSummary, setStatsSummary] = useState({
    total: 0,
    relief: 0,
    winter: 0,
    groceries: 0,
    energy: 0
  });

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Add / Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    category: "Flood Relief",
    tag: "Field Relief",
    img: "",
    excerpt: "",
    details: "",
    link_url: "/contact",
    sort_order: 0,
    is_active: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  // Image Upload Ref
  const imageInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-sync Modal
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth Key Init
  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
  }, []);

  // Load articles
  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
      const res = await adminListNews(key);
      if (res && res.success && Array.isArray(res.data)) {
        setArticles(res.data);
        if (res.stats_summary) {
          setStatsSummary(res.stats_summary);
        }
      } else {
        showToast(res?.message || "Failed to load news articles", "error");
      }
    } catch (err) {
      showToast(err.message || "Network error loading news articles", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const selLower = selectedCategory.toLowerCase();
    return articles.filter((a) => {
      const catLower = (a.category || "").toLowerCase();
      const tagLower = (a.tag || "").toLowerCase();

      const matchesCat =
        selectedCategory === "all" ||
        a.category === selectedCategory ||
        catLower === selLower ||
        catLower.includes(selLower) ||
        tagLower.includes(selLower) ||
        (selLower === "relief" && (catLower.includes("flood") || tagLower.includes("flood") || catLower.includes("relief") || tagLower.includes("relief")));

      const matchesSearch =
        !q ||
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.tag && a.tag.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
        (a.date && a.date.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, search]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      category: "Flood Relief",
      tag: "Field Relief",
      img: "",
      excerpt: "",
      details: "",
      link_url: "/contact",
      sort_order: articles.length + 1,
      is_active: 1
    });
    setShowEditModal(true);
  };

  // Open Edit
  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      date: item.date || "",
      category: item.category || "Flood Relief",
      tag: item.tag || "Field Relief",
      img: item.img || "",
      excerpt: item.excerpt || "",
      details: item.details || "",
      link_url: item.link_url || "/contact",
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== undefined ? item.is_active : 1
    });
    setShowEditModal(true);
  };

  // Save Article
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Article title is required", "error");
      return;
    }
    if (!formData.excerpt.trim()) {
      showToast("Article summary / excerpt is required", "error");
      return;
    }

    setIsSaving(true);
    try {
      let res;
      if (editingId) {
        res = await adminUpdateNews(adminKey, { id: editingId, ...formData });
      } else {
        res = await adminCreateNews(adminKey, formData);
      }

      if (res && res.success) {
        showToast(editingId ? "Article updated successfully!" : "Article published successfully!", "success");
        setShowEditModal(false);
        await loadArticles();
      } else {
        showToast(res?.message || "Failed to save article", "error");
      }
    } catch (err) {
      showToast(err.message || "Error saving article", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await adminDeleteNews(adminKey, deleteTarget.id);
      if (res && res.success) {
        showToast(`Article '${deleteTarget.title}' deleted successfully!`, "success");
        setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        showToast(res?.message || "Failed to delete article", "error");
      }
    } catch (err) {
      showToast(err.message || "Error deleting article", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Re-sync Defaults
  const handleResyncDefaults = async (force = false) => {
    setIsSyncing(true);
    try {
      const res = await adminSeedNews(adminKey, force);
      if (res && res.success) {
        showToast(res.message || "Articles synchronized successfully!", "success");
        setShowSyncModal(false);
        await loadArticles();
      } else {
        showToast(res?.message || "Failed to sync articles", "error");
      }
    } catch (err) {
      showToast(err.message || "Error synchronizing articles", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload image
  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const targetFolder = `news/images`;
      const res = await adminUploadImage(adminKey, file, targetFolder);
      if (res && res.success && res.url) {
        setFormData((prev) => ({ ...prev, img: res.url }));
        showToast("Article photo uploaded successfully!", "success");
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

  return (
    <AdminLayout title="News & Field Dispatches Management">
      <style>{`
        .adm-modal-form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 14px;
        }
        .adm-modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .adm-news-container {
            padding: 10px 4px !important;
          }
          .adm-news-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adm-news-head > div:last-child {
            width: 100% !important;
            flex-direction: column !important;
          }
          .adm-news-head > div:last-child > * {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .adm-news-filters {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adm-news-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            width: 100% !important;
          }
          .adm-news-tabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
          }
          .adm-news-search {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .adm-news-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-news-modal {
            max-width: calc(100vw - 10px) !important;
            width: calc(100vw - 10px) !important;
            padding: 14px 10px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
          }
          .adm-news-modal * {
            box-sizing: border-box !important;
          }
          .adm-news-modal h3 {
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
          .adm-news-modal input,
          .adm-news-modal select,
          .adm-news-modal textarea {
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
      <div className="adm-news-container" style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto", color: "#f8fafc" }}>
        {/* Top Header & Actions */}
        <div
          className="adm-news-head"
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
              <FaNewspaper color="#38bdf8" /> News & Field Dispatches
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
              Full CRUD management over all field dispatches, flood relief reports, winter drives, and campaigns shown on <code>/news-views</code>.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="/news-views"
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
              <FaExternalLinkAlt size={12} /> View Live /news-views
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
              onClick={handleOpenCreate}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 18px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                border: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)"
              }}
            >
              <FaPlus /> Add News Article
            </button>
          </div>
        </div>

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
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Total Articles</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#38bdf8", marginTop: 4 }}>
              {articles.length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Active dispatches in DB</span>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Flood Relief</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0284c7", marginTop: 4 }}>
              {articles.filter((a) => {
                const c = (a.category || "").toLowerCase();
                return c === "relief" || c.includes("flood") || c.includes("relief");
              }).length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Rescue & rations</span>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Winter Relief</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#818cf8", marginTop: 4 }}>
              {articles.filter((a) => {
                const c = (a.category || "").toLowerCase();
                return c === "winter" || c.includes("winter") || c.includes("blanket");
              }).length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Blanket distributions</span>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Groceries</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#10b981", marginTop: 4 }}>
              {articles.filter((a) => {
                const c = (a.category || "").toLowerCase();
                return c === "groceries" || c.includes("grocer") || c.includes("food");
              }).length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Submergence food kits</span>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>Clean Energy</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f59e0b", marginTop: 4 }}>
              {articles.filter((a) => {
                const c = (a.category || "").toLowerCase();
                return c === "energy" || c.includes("energy") || c.includes("solar");
              }).length}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Solar street lighting</span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div
          className="adm-news-filters"
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
          {/* Category Filter Buttons */}
          <div className="adm-news-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { id: "all", label: "All Campaigns" },
              { id: "relief", label: "Flood Relief" },
              { id: "winter", label: "Winter Blankets" },
              { id: "groceries", label: "Groceries Support" },
              { id: "energy", label: "Solar Energy" }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: "0.82rem",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    border: isSelected ? "1px solid #0284c7" : "1px solid #334155",
                    background: isSelected ? "#0284c7" : "#1e293b",
                    color: "#ffffff"
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="adm-news-search" style={{ position: "relative", minWidth: 0, width: "100%", maxWidth: 420 }}>
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
              placeholder="Search news by title, tag, date..."
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

        {/* Articles Grid */}
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>Loading News Articles...</div>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>Querying MySQL news_articles table...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
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
            <FaNewspaper size={40} color="#475569" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: "0 0 8px", color: "#ffffff" }}>No Articles Found</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem" }}>
              No news dispatches matched the selected filter or search query.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#0284c7",
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
          <div className="adm-news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 20 }}>
            {filteredArticles.map((article) => {
              const catTheme = getCategoryTheme(article.category);
              return (
                <div
                  key={article.id}
                  style={{
                    background: "#111827",
                    border: "1px solid #1f2937",
                    borderRadius: 14,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284c7")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1f2937")}
                >
                  {/* Image Cover */}
                  <div style={{ height: 200, background: "#0b0f19", position: "relative", overflow: "hidden" }}>
                    {article.img ? (
                      <img
                        src={article.img}
                        alt={article.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                        <FaImages size={36} />
                      </div>
                    )}

                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background: "rgba(0,0,0,0.8)",
                        color: "#ffffff"
                      }}
                    >
                      {article.tag}
                    </span>

                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: catTheme.bg,
                        color: catTheme.text,
                        border: `1px solid ${catTheme.border}`
                      }}
                    >
                      {catTheme.label}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.8rem", marginBottom: 8 }}>
                        <FaCalendarAlt size={11} color="#0284c7" /> {article.date}
                      </div>

                      <h3 style={{ margin: "0 0 10px", fontSize: "1.08rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.4 }}>
                        {article.title}
                      </h3>

                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Actions Footer */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 18,
                        paddingTop: 12,
                        borderTop: "1px solid #1f2937"
                      }}
                    >
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        Action: <strong>{article.link_url || "/contact"}</strong>
                      </span>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleOpenEdit(article)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            background: "#0284c7",
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
                          onClick={() => setDeleteTarget(article)}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────────────── */}
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
            className="adm-news-modal"
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
                <FaNewspaper color="#38bdf8" /> {editingId ? "Edit News Dispatch" : "Add News Dispatch"}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveArticle}>
              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Headline / Article Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Godavari Flood Relief 2023: Emergency Rations & Medical Kits"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              {/* Tag, Category, Date */}
              <div className="adm-modal-form-grid">
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Category Pillar * <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 500 }}>(Manual Entry)</span>
                  </label>
                  <input
                    type="text"
                    list="newsCategorySuggestions"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Flood Relief"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                  />
                  <datalist id="newsCategorySuggestions">
                    <option value="Flood Relief" />
                    <option value="Field Relief" />
                    <option value="Winter Relief" />
                    <option value="Groceries Distribution" />
                    <option value="Clean Energy" />
                    <option value="Forest Rights" />
                    <option value="Child Rights" />
                    <option value="Governance" />
                    <option value="General News" />
                  </datalist>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Display Tag Badge *
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Field Relief"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Date / Month *
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. September 2023"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              {/* Quick Fill Category Options */}
              <div style={{ marginTop: -4, marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Quick Fill Category:</span>
                {["Flood Relief", "Field Relief", "Winter Relief", "Groceries Support", "Clean Energy"].map((catOption) => (
                  <button
                    key={catOption}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: catOption })}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: formData.category === catOption ? "#0284c7" : "#1e293b",
                      border: "1px solid #334155",
                      color: formData.category === catOption ? "#fff" : "#94a3b8",
                      fontSize: "0.72rem",
                      cursor: "pointer"
                    }}
                  >
                    {catOption}
                  </button>
                ))}
              </div>

              {/* Excerpt / Summary */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Summary Excerpt *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  placeholder="Summary of the dispatch shown on the news card..."
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.88rem", lineHeight: 1.5, resize: "vertical" }}
                />
              </div>

              {/* Image Upload & URL */}
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 8 }}>
                  Article Photo Cover
                </label>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
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
                      background: "#0284c7",
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
                    <FaCloudUploadAlt /> {isUploadingImage ? "Uploading Photo..." : "Upload Photo File"}
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
                  <div style={{ height: 140, borderRadius: 8, overflow: "hidden", background: "#000", marginTop: 8 }}>
                    <img src={formData.img} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                  Button Action Link (defaults to /contact)
                </label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/contact or /donate"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, background: "#111827", border: "1px solid #334155", color: "#fff", fontSize: "0.85rem" }}
                />
              </div>

              {/* Actions */}
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
                  disabled={isSaving}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {isSaving ? "Saving..." : editingId ? "Update Article" : "Publish Article"}
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
            className="adm-news-modal"
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
              Reset Default News Articles
            </h3>
            <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 }}>
              This will re-seed the standard 6 field relief dispatches into MySQL table <code>news_articles</code>.
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
                  background: "#0284c7",
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
              Delete Article?
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
                onClick={handleDeleteArticle}
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
                {isDeleting ? "Deleting..." : "Yes, Delete Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

