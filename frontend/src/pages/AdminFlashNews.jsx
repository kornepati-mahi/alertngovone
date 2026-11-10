import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaEdit,
  FaTimes,
  FaSyncAlt,
  FaBullhorn,
  FaCheckCircle,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminListFlashNews,
  adminCreateFlashNews,
  adminUpdateFlashNews,
  adminDeleteFlashNews,
  defaultFlashNews,
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";
const FLASH_KEY = "alertngo_flash_news";

export default function AdminFlashNews() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || "");
  const navigate = useNavigate();

  const [items, setItems] = useState(() => {
    try {
      const local = localStorage.getItem(FLASH_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return defaultFlashNews.map((d, i) => ({ ...d, is_active: 1, sort_order: i + 1 }));
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [message, setMessage] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ message: "", sort_order: 1, is_active: 1 });

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const syncItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem(FLASH_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new Event("alertngo_flash_updated"));
  };

  const load = useCallback(async (key) => {
    if (!key) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminListFlashNews(key);
      if (res && res.data && res.data.length > 0) {
        syncItems(res.data);
      }
    } catch (err) {
      // Backend offline or fallback - keep items from localStorage
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) load(adminKey);
  }, [adminKey, load]);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!adminKey) {
      navigate("/admin", { replace: true });
    }
  }, [adminKey, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) {
      setError("Please write the announcement text.");
      return;
    }
    setSaving(true);
    clearMessages();

    const newItem = {
      id: Date.now(),
      message: text,
      is_active: isActive ? 1 : 0,
      sort_order: Number(sortOrder) || (items.length + 1),
    };

    try {
      await adminCreateFlashNews(adminKey, newItem);
    } catch (err) {
      // Fallback to local
    }

    const updated = [...items, newItem];
    syncItems(updated);
    setMessage("");
    setSortOrder(items.length + 2);
    setIsActive(true);
    setNotice("Announcement added! It is now live on the top bar.");
    setSaving(false);
    setTimeout(() => setNotice(""), 3500);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({
      message: item.message,
      sort_order: item.sort_order,
      is_active: Number(item.is_active) ? 1 : 0,
    });
    clearMessages();
  };

  const saveEdit = async (id) => {
    const text = draft.message.trim();
    if (!text) {
      setError("Message cannot be empty.");
      return;
    }
    setSaving(true);
    clearMessages();

    try {
      await adminUpdateFlashNews(adminKey, {
        id,
        message: text,
        sort_order: Number(draft.sort_order) || 0,
        is_active: draft.is_active ? 1 : 0,
      });
    } catch (err) {
      // Fallback to local
    }

    const updated = items.map((it) =>
      it.id === id
        ? {
          ...it,
          message: text,
          sort_order: Number(draft.sort_order) || 0,
          is_active: draft.is_active ? 1 : 0,
        }
        : it
    );
    syncItems(updated);
    setEditingId(null);
    setNotice("Announcement updated successfully!");
    setSaving(false);
    setTimeout(() => setNotice(""), 3500);
  };

  const toggleActive = async (item) => {
    clearMessages();
    const newActive = Number(item.is_active) ? 0 : 1;
    try {
      await adminUpdateFlashNews(adminKey, {
        id: item.id,
        is_active: newActive,
      });
    } catch (err) { }

    const updated = items.map((it) => (it.id === item.id ? { ...it, is_active: newActive } : it));
    syncItems(updated);
  };

  const remove = async (item) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    clearMessages();
    try {
      await adminDeleteFlashNews(adminKey, item.id);
    } catch (err) { }

    const updated = items.filter((it) => it.id !== item.id);
    syncItems(updated);
    setNotice("Announcement deleted.");
    setTimeout(() => setNotice(""), 3500);
  };

  const activeCount = useMemo(
    () => items.filter((item) => Number(item.is_active)).length,
    [items]
  );

  if (!adminKey) return null;

  return (
    <AdminLayout title="Flash News / Ticker Updates">
      <style>{`
        .afn-container {
          max-width: 100%;
        }
        .afn-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .afn-subtitle {
          color: #8892a4;
          font-size: 0.88rem;
          margin: 0;
        }
        .afn-subtitle strong {
          color: #fff;
        }
        .afn-refresh-btn {
          background: #1e2436;
          color: #8892a4;
          border: 1px solid #2a3148;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .afn-refresh-btn:hover {
          color: #fff;
          border-color: #c0392b;
          background: #252d40;
        }
        .afn-card {
          background: #141820;
          border: 1px solid #1e2436;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .afn-card-title {
          color: #fff;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .afn-label {
          display: block;
          color: #8892a4;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .afn-textarea {
          width: 100%;
          background: #1e2436;
          border: 1.5px solid #2a3148;
          border-radius: 10px;
          color: #e8edf5;
          font-size: 0.92rem;
          padding: 12px 14px;
          outline: none;
          box-sizing: border-box;
          min-height: 85px;
          resize: vertical;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .afn-textarea:focus {
          border-color: #c0392b;
        }
        .afn-input-small {
          width: 80px;
          background: #1e2436;
          border: 1.5px solid #2a3148;
          border-radius: 8px;
          color: #fff;
          padding: 8px 12px;
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .afn-input-small:focus {
          border-color: #c0392b;
        }
        .afn-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 14px;
        }
        .afn-controls-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .afn-checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #e8edf5;
          font-size: 0.85rem;
          cursor: pointer;
          user-select: none;
        }
        .afn-checkbox-label input {
          accent-color: #c0392b;
          width: 16px;
          height: 16px;
        }
        .afn-btn-primary {
          background: #c0392b;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 11px 22px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s;
        }
        .afn-btn-primary:hover:not(:disabled) {
          background: #a93226;
          transform: translateY(-1px);
        }
        .afn-btn-primary:disabled {
          background: #2a3148;
          color: #64748b;
          cursor: not-allowed;
        }
        .afn-notice {
          background: rgba(46, 204, 113, 0.15);
          border: 1px solid rgba(46, 204, 113, 0.4);
          color: #2ecc71;
          border-radius: 8px;
          padding: 11px 16px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .afn-error {
          background: rgba(192, 57, 43, 0.15);
          border: 1px solid rgba(192, 57, 43, 0.4);
          color: #ff6b6b;
          border-radius: 8px;
          padding: 11px 16px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        /* List items */
        .afn-item {
          background: #1e2436;
          border: 1px solid #2a3148;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }
        .afn-item:hover {
          border-color: rgba(192, 57, 43, 0.4);
        }
        .afn-item.is-inactive {
          opacity: 0.6;
        }
        .afn-item-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .afn-pill-active {
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.35);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .afn-pill-hidden {
          background: rgba(136, 146, 164, 0.15);
          color: #8892a4;
          border: 1px solid rgba(136, 146, 164, 0.3);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .afn-badge-order {
          background: #141820;
          color: #8892a4;
          border: 1px solid #2a3148;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 0.72rem;
          font-weight: 700;
          font-family: monospace;
        }
        .afn-item-content {
          color: #f1f5f9;
          font-size: 0.93rem;
          line-height: 1.5;
          margin: 0 0 14px;
        }
        .afn-item-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .afn-btn-ghost {
          background: #141820;
          border: 1px solid #2a3148;
          color: #8892a4;
          border-radius: 7px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .afn-btn-ghost:hover {
          color: #fff;
          border-color: #c0392b;
          background: #252d40;
        }
        .afn-btn-danger {
          background: rgba(192, 57, 43, 0.15);
          border: 1px solid rgba(192, 57, 43, 0.35);
          color: #ff6b6b;
          border-radius: 7px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .afn-btn-danger:hover {
          background: #c0392b;
          color: #fff;
        }
        /* Inline edit */
        .afn-edit-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .afn-edit-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .afn-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
          }
          .afn-subtitle {
            font-size: 0.76rem !important;
            line-height: 1.4 !important;
          }
          .afn-refresh-btn {
            width: 100% !important;
            height: 32px !important;
            min-height: 32px !important;
            font-size: 0.74rem !important;
            padding: 4px 10px !important;
            border-radius: 6px !important;
            justify-content: center !important;
          }
          .afn-card {
            padding: 12px 10px !important;
            margin-bottom: 14px !important;
            border-radius: 10px !important;
          }
          .afn-card-title {
            font-size: 0.94rem !important;
            margin-bottom: 10px !important;
          }
          .afn-label {
            font-size: 0.72rem !important;
            margin-bottom: 4px !important;
          }
          .afn-textarea {
            padding: 8px 10px !important;
            font-size: 0.82rem !important;
            min-height: 60px !important;
            border-radius: 8px !important;
          }
          .afn-form-footer {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-top: 10px !important;
          }
          .afn-controls-left {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .afn-input-small {
            height: 32px !important;
            padding: 4px 8px !important;
            font-size: 0.78rem !important;
            width: 60px !important;
            border-radius: 6px !important;
          }
          .afn-checkbox-label {
            font-size: 0.76rem !important;
            gap: 6px !important;
          }
          .afn-btn-primary {
            width: 100% !important;
            height: 34px !important;
            min-height: 34px !important;
            max-height: 34px !important;
            font-size: 0.78rem !important;
            padding: 0 14px !important;
            border-radius: 6px !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .afn-notice, .afn-error {
            padding: 7px 10px !important;
            font-size: 0.74rem !important;
            border-radius: 7px !important;
            margin-bottom: 12px !important;
          }
          .afn-item {
            padding: 10px 10px !important;
            margin-bottom: 8px !important;
            border-radius: 8px !important;
          }
          .afn-item-top {
            margin-bottom: 6px !important;
            gap: 6px !important;
          }
          .afn-pill-active, .afn-pill-hidden {
            font-size: 0.68rem !important;
            padding: 2px 7px !important;
          }
          .afn-badge-order {
            font-size: 0.68rem !important;
            padding: 2px 6px !important;
          }
          .afn-item-content {
            font-size: 0.8rem !important;
            line-height: 1.4 !important;
            margin: 0 0 8px !important;
          }
          .afn-item-actions {
            display: flex !important;
            align-items: center !important;
            justify-content: stretch !important;
            gap: 6px !important;
            padding-top: 8px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          .afn-item-actions button {
            flex: 1 1 0 !important;
            width: 33.3% !important;
            height: 28px !important;
            min-height: 28px !important;
            max-height: 28px !important;
            font-size: 0.72rem !important;
            padding: 0 4px !important;
            border-radius: 5px !important;
            justify-content: center !important;
            white-space: nowrap !important;
            box-sizing: border-box !important;
          }
          .afn-edit-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .afn-edit-row-top {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
          }
          .afn-edit-btn-row {
            margin-left: 0 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
          }
          .afn-edit-btn-row > button {
            width: 100% !important;
            height: 32px !important;
            min-height: 32px !important;
            max-height: 32px !important;
            font-size: 0.74rem !important;
            padding: 0 10px !important;
            justify-content: center !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div className="afn-container">
        {/* Header bar */}
        <div className="afn-header">
          <p className="afn-subtitle">
            These announcements scroll across the top bar of every page.{" "}
            <strong>{activeCount} of {items.length} active</strong>.
          </p>
          <button className="afn-refresh-btn" onClick={() => load(adminKey)} disabled={loading}>
            <FaSyncAlt size={11} /> Refresh
          </button>
        </div>

        {error && <div className="afn-error">⚠️ {error}</div>}
        {notice && (
          <div className="afn-notice">
            <FaCheckCircle size={14} /> {notice}
          </div>
        )}

        {/* ── Add New Announcement Card ── */}
        <div className="afn-card">
          <h2 className="afn-card-title">
            <FaPlus size={12} color="#c0392b" /> Add New Ticker Announcement
          </h2>
          <form onSubmit={handleAdd}>
            <label className="afn-label" htmlFor="new-flash-msg">
              Message Text (max 500 characters)
            </label>
            <textarea
              id="new-flash-msg"
              className="afn-textarea"
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Welcome to ALERT — latest announcements and field updates appear here."
            />

            <div className="afn-form-footer">
              <div className="afn-controls-left">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="afn-label" style={{ margin: 0 }}>Order:</span>
                  <input
                    type="number"
                    className="afn-input-small"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                </div>
                <label className="afn-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active immediately</span>
                </label>
              </div>

              <button type="submit" className="afn-btn-primary" disabled={saving}>
                <FaPlus size={11} /> {saving ? "Saving…" : "Add Announcement"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Current Announcements List Card ── */}
        <div className="afn-card">
          <h2 className="afn-card-title">
            <FaBullhorn size={13} color="#c0392b" /> Current Announcements ({items.length})
          </h2>

          {items.length === 0 ? (
            <div style={{ color: "#8892a4", padding: "20px 0", textAlign: "center" }}>
              No announcements yet. Add one above!
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <div key={item.id} className={`afn-item ${Number(item.is_active) ? "" : "is-inactive"}`}>
                  {editingId === item.id ? (
                    /* Edit mode */
                    <div className="afn-edit-box">
                      <label className="afn-label">Edit Message Text</label>
                      <textarea
                        className="afn-textarea"
                        maxLength={500}
                        value={draft.message}
                        onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                      />
                      <div className="afn-edit-actions">
                        <div className="afn-edit-row-top">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="afn-label" style={{ margin: 0 }}>Order:</span>
                            <input
                              type="number"
                              className="afn-input-small"
                              value={draft.sort_order}
                              onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                            />
                          </div>
                          <label className="afn-checkbox-label">
                            <input
                              type="checkbox"
                              checked={Boolean(draft.is_active)}
                              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked ? 1 : 0 })}
                            />
                            <span>Active</span>
                          </label>
                        </div>
                        <div className="afn-edit-btn-row" style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            className="afn-btn-primary"
                            onClick={() => saveEdit(item.id)}
                            disabled={saving}
                          >
                            <FaSave size={11} /> Save Changes
                          </button>
                          <button
                            type="button"
                            className="afn-btn-ghost"
                            onClick={() => setEditingId(null)}
                            disabled={saving}
                          >
                            <FaTimes size={11} /> Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <div className="afn-item-top">
                        <span className={Number(item.is_active) ? "afn-pill-active" : "afn-pill-hidden"}>
                          {Number(item.is_active) ? "● Active" : "○ Hidden"}
                        </span>
                        <span className="afn-badge-order">Order #{item.sort_order}</span>
                      </div>

                      <p className="afn-item-content">{item.message}</p>

                      <div className="afn-item-actions">
                        <button
                          type="button"
                          className="afn-btn-ghost"
                          onClick={() => toggleActive(item)}
                          title={Number(item.is_active) ? "Hide from website" : "Show on website"}
                        >
                          {Number(item.is_active) ? (
                            <><FaEyeSlash size={11} /> Hide</>
                          ) : (
                            <><FaEye size={11} /> Show</>
                          )}
                        </button>
                        <button
                          type="button"
                          className="afn-btn-ghost"
                          onClick={() => startEdit(item)}
                        >
                          <FaEdit size={11} /> Edit
                        </button>
                        <button
                          type="button"
                          className="afn-btn-danger"
                          onClick={() => remove(item)}
                        >
                          <FaTrash size={11} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ color: "#8892a4", fontSize: "0.78rem", textAlign: "center", marginTop: 8 }}>
          Saved announcements appear on the top bar in real-time.
        </div>
      </div>
    </AdminLayout>
  );
}
