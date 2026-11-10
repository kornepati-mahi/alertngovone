import { useState, useMemo } from "react";
import { FaSearch, FaFileAlt, FaExternalLinkAlt, FaEdit, FaSave, FaCheckCircle } from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import sitePages from "../data/all_site_pages.json";

export default function AdminEditPages() {
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [customTitles, setCustomTitles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("alertngo_custom_page_titles") || "{}");
    } catch {
      return {};
    }
  });
  const [editTitle, setEditTitle] = useState("");
  const [saved, setSaved] = useState(false);

  const pages = useMemo(() => {
    const list = Array.isArray(sitePages) ? sitePages : Object.values(sitePages);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [search]);

  const handleSelectPage = (page) => {
    setSelectedSlug(page.slug);
    setEditTitle(customTitles[page.slug] || page.title || "");
    setSaved(false);
  };

  const handleSaveTitle = (e) => {
    e.preventDefault();
    if (!selectedSlug) return;
    const updated = { ...customTitles, [selectedSlug]: editTitle.trim() };
    setCustomTitles(updated);
    localStorage.setItem("alertngo_custom_page_titles", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout title="Edit Pages">
      <style>{`
        .pages-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
        }
        @media(max-width: 900px) {
          .pages-layout { grid-template-columns: 1fr; }
        }
        .panel-card {
          background: #141820;
          border: 1px solid #1e2436;
          border-radius: 14px;
          padding: 20px;
        }
        .search-box {
          position: relative;
          margin-bottom: 16px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #4a5568;
        }
        .search-input {
          width: 100%;
          background: #1e2436;
          border: 1.5px solid #2a3148;
          border-radius: 8px;
          color: #fff;
          padding: 10px 12px 10px 36px;
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
        }
        .search-input:focus { border-color: #c0392b; }
        .page-list {
          max-height: 520px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-right: 4px;
        }
        .page-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 8px;
          background: #1e2436;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .page-item:hover {
          background: #252d40;
          border-color: #2a3148;
        }
        .page-item.active {
          background: rgba(192,57,43,0.18);
          border-color: #c0392b;
        }
        .page-item-title {
          color: #fff;
          font-size: 0.86rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 260px;
        }
        .page-item-slug {
          color: #8892a4;
          font-size: 0.72rem;
        }
        .form-label {
          display: block;
          color: #8892a4;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          background: #1e2436;
          border: 1.5px solid #2a3148;
          border-radius: 8px;
          color: #fff;
          padding: 11px 14px;
          font-size: 0.92rem;
          outline: none;
          box-sizing: border-box;
          margin-bottom: 16px;
        }
        .form-input:focus { border-color: #c0392b; }
        .save-btn {
          background: #c0392b;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .save-btn:hover { background: #a93226; }
        .saved-badge {
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.4);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 0.82rem;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      <div className="pages-layout">
        {/* Left: list of pages */}
        <div className="panel-card">
          <div className="search-box">
            <FaSearch size={12} className="search-icon" />
            <input
              type="text"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages by name or slug..."
            />
          </div>
          <div style={{ color: "#8892a4", fontSize: "0.78rem", marginBottom: 10 }}>
            Showing {pages.length} pages
          </div>
          <div className="page-list">
            {pages.map((p) => {
              const active = selectedSlug === p.slug;
              return (
                <div
                  key={p.slug}
                  className={`page-item${active ? " active" : ""}`}
                  onClick={() => handleSelectPage(p)}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div className="page-item-title">{customTitles[p.slug] || p.title || p.slug}</div>
                    <div className="page-item-slug">/{p.slug}</div>
                  </div>
                  <FaEdit size={12} color={active ? "#ff6b6b" : "#8892a4"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: edit form for selected page */}
        <div className="panel-card">
          {selectedSlug ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h2 style={{ color: "#fff", margin: 0, fontSize: "1.1rem" }}>
                  Edit Page: <span style={{ color: "#c0392b" }}>/{selectedSlug}</span>
                </h2>
                <a
                  href={`/${selectedSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#8892a4",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                  }}
                >
                  <FaExternalLinkAlt size={11} /> Open Live Page
                </a>
              </div>

              {saved && (
                <div className="saved-badge">
                  <FaCheckCircle size={13} /> Page title saved!
                </div>
              )}

              <form onSubmit={handleSaveTitle}>
                <label className="form-label">Display Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter custom title..."
                />

                <label className="form-label">Slug (URL)</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedSlug}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />

                <button type="submit" className="save-btn">
                  <FaSave size={13} /> Save Page Title
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#8892a4" }}>
              <FaFileAlt size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
              <h3 style={{ color: "#fff", margin: "0 0 6px" }}>Select a page to edit</h3>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>
                Choose any page from the left list to update its title or preview its live content.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
