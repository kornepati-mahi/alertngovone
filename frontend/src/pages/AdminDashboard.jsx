import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBullhorn, FaExternalLinkAlt, FaCheckCircle, FaEdit, FaUsers,
  FaHandsHelping, FaInstagram, FaQuoteLeft, FaInfoCircle, FaWater,
  FaBalanceScale, FaTree, FaHandHoldingHeart, FaTrophy, FaFileAlt,
  FaBookOpen, FaNewspaper, FaPhotoVideo, FaBriefcase, FaEnvelope,
  FaSearch, FaEye, FaTrash, FaDownload, FaInbox, FaTimes, FaMapMarkerAlt
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  adminGetContactData,
  adminUpdateContactStatus,
  adminDeleteContact
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

const cards = [
  {
    icon: FaHandHoldingHeart,
    color: "#D2190C",
    bg: "rgba(210,25,12,.12)",
    label: "Donations & Payment QR",
    desc: "Manage incoming donations, verify payment screenshots, upload UPI payment QR code, edit impact tiers, and update bank transfer details.",
    path: "/admin/donate",
    action: "Manage",
  },
  {
    icon: FaEnvelope,
    color: "#e11d48",
    bg: "rgba(225,29,72,.12)",
    label: "Contact & Leads",
    desc: "Manage public contact inquiries, leads from /contact form, and interactive Google Map iframe.",
    path: "/admin/contact",
    action: "Manage",
  },
  {
    icon: FaEdit,
    color: "#e67e22",
    bg: "rgba(230,126,34,.12)",
    label: "Edit Home",
    desc: "Upload hero images, customize feature cards, regions, and update headlines.",
    path: "/admin/edit-home",
    action: "Manage",
  },
  {
    icon: FaInfoCircle,
    color: "#3498db",
    bg: "rgba(52,152,219,.12)",
    label: "About Us Pages",
    desc: "Manage Governing Body, Vision & Mission, Core Values, Org Profile, Organogram, and Policies.",
    path: "/admin/about-pages",
    action: "Manage",
  },
  {
    icon: FaHandsHelping,
    color: "#c0392b",
    bg: "rgba(192,57,43,.12)",
    label: "Key Programs",
    desc: "Manage 'What We Do' programs, categories, cover photos, descriptions and links.",
    path: "/admin/programs",
    action: "Manage",
  },
  {
    icon: FaWater,
    color: "#0284c7",
    bg: "rgba(2,132,199,.12)",
    label: "Polavaram Project",
    desc: "Manage Polavaram Project, PIP dropdown pages, maps, videos, and PDF uploads.",
    path: "/admin/polavaram",
    action: "Manage",
  },
  {
    icon: FaBalanceScale,
    color: "#D2190C",
    bg: "rgba(210,25,12,.12)",
    label: "LA & RR",
    desc: "Manage Land Acquisition, Court Cases, RR Packages, Submergence Villages, DPRs, and Awards.",
    path: "/admin/la-rr",
    action: "Manage",
  },
  {
    icon: FaTree,
    color: "#059669",
    bg: "rgba(5,150,105,.12)",
    label: "RoFR & LTR",
    desc: "Manage Recognition of Forest Rights (FRA 2006), Rejection Reasons, Judgements, Statutory G.Os, and LTR Disposals.",
    path: "/admin/rofr",
    action: "Manage",
  },
  {
    icon: FaHandHoldingHeart,
    color: "#0284c7",
    bg: "rgba(2,132,199,.12)",
    label: "Flood Relief",
    desc: "Manage Flood Relief emergency response pages, yearly relief missions (2023–2020), blanket & grocery distributions, and photo galleries.",
    path: "/admin/flood-relief",
    action: "Manage",
  },
  {
    icon: FaTrophy,
    color: "#10b981",
    bg: "rgba(16,185,129,.12)",
    label: "Achievements",
    desc: "Manage Achievements overview, Child Interventions, Child Bare Acts, Reports, and Portfolio pages.",
    path: "/admin/achievements",
    action: "Manage",
  },
  {
    icon: FaFileAlt,
    color: "#3b82f6",
    bg: "rgba(59,130,246,.12)",
    label: "All Site Pages",
    desc: "Complete repository of all 91 pages, statistical tables, photo galleries, PDF rules, and videos.",
    path: "/admin/all-pages",
    action: "Manage",
  },
  {
    icon: FaBookOpen,
    color: "#ec4899",
    bg: "rgba(236,72,153,.12)",
    label: "Stories of Change",
    desc: "Manage field stories, community testimonials, photos, outcomes, and video narratives.",
    path: "/admin/stories",
    action: "Manage",
  },
  {
    icon: FaNewspaper,
    color: "#38bdf8",
    bg: "rgba(56,189,248,.12)",
    label: "News & Dispatches",
    desc: "Manage field relief reports, distribution campaigns, photos, dates, and announcements for /news-views.",
    path: "/admin/news",
    action: "Manage",
  },
  {
    icon: FaPhotoVideo,
    color: "#fb7185",
    bg: "rgba(251,113,133,.12)",
    label: "Videos & Images",
    desc: "Manage authentic field photography, videos, community reels, and albums on /gallery-9.",
    path: "/admin/gallery",
    action: "Manage",
  },
  {
    icon: FaBriefcase,
    color: "#10b981",
    bg: "rgba(16,185,129,.12)",
    label: "Careers & Openings",
    desc: "Manage recruitment roles, internships, volunteer pathways, apply guidelines, media & attachments on /careers.",
    path: "/admin/careers",
    action: "Manage",
  },
  {
    icon: FaHandsHelping,
    color: "#0284c7",
    bg: "rgba(2,132,199,.12)",
    label: "Partner & Resources",
    desc: "Manage Partner with Us (/partner), Grievances (Abstract, Land Rights), Downloads (Acts, GOs), Quick Links (/quick-links), community complaints, FAQs, and navbar dropdown menus.",
    path: "/admin/partner",
    action: "Manage",
  },
  {
    icon: FaInstagram,
    color: "#e1306c",
    bg: "rgba(225,48,108,.12)",
    label: "Instagram Reels",
    desc: "Upload field videos, manage reel covers, captions, durations, and stories.",
    path: "/admin/reels",
    action: "Manage",
  },
  {
    icon: FaQuoteLeft,
    color: "#f39c12",
    bg: "rgba(243,156,18,.12)",
    label: "Testimonials & Google Reviews",
    desc: "Manage community voices, quotes, author roles, ratings, and Google Review links.",
    path: "/admin/testimonials",
    action: "Manage",
  },
  {
    icon: FaUsers,
    color: "#2ecc71",
    bg: "rgba(46,204,113,.12)",
    label: "Team & Board",
    desc: "Manage Board of Directors profiles, photos, quotes, bios, and credentials.",
    path: "/admin/team",
    action: "Manage",
  },
  {
    icon: FaBullhorn,
    color: "#9b59b6",
    bg: "rgba(155,89,182,.12)",
    label: "Flash News",
    desc: "Manage scrolling announcements shown at the top of every page.",
    path: "/admin/flash-news",
    action: "Manage",
  },
];

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [leads, setLeads] = useState([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadRemarks, setLeadRemarks] = useState("");
  const [leadStatus, setLeadStatus] = useState("new");

  const loadLeads = async (key = adminKey) => {
    try {
      const res = await adminGetContactData(key, searchTerm, statusFilter);
      if (res && res.success) {
        setLeads(res.data || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (_) { }
  };

  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
    loadLeads(key);

    const handleNewLead = () => loadLeads(key);
    window.addEventListener("alertngo_new_lead", handleNewLead);
    return () => window.removeEventListener("alertngo_new_lead", handleNewLead);
  }, []);

  const handleQuickStatusChange = async (leadId, newStat) => {
    try {
      await adminUpdateContactStatus(adminKey, leadId, newStat);
      setLeads((prev) =>
        prev.map((l) => (String(l.id) === String(leadId) ? { ...l, status: newStat } : l))
      );
    } catch (_) { }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Delete this lead record?")) return;
    try {
      await adminDeleteContact(adminKey, leadId);
      setLeads((prev) => prev.filter((l) => String(l.id) !== String(leadId)));
    } catch (_) { }
  };

  const handleSaveModal = async () => {
    if (!selectedLead) return;
    try {
      await adminUpdateContactStatus(adminKey, selectedLead.id, leadStatus, leadRemarks);
      setLeads((prev) =>
        prev.map((l) => (String(l.id) === String(selectedLead.id) ? { ...l, status: leadStatus, notes: leadRemarks } : l))
      );
      setSelectedLead(null);
    } catch (_) { }
  };

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return;
    const headers = ["ID", "Date", "Name", "Email", "Phone", "Subject", "Office", "Status", "Message", "Notes"];
    const rows = leads.map((l) => [
      l.id,
      new Date(l.created_at || Date.now()).toLocaleString(),
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.subject || "").replace(/"/g, '""')}"`,
      `"${(l.office || "").replace(/"/g, '""')}"`,
      l.status || "new",
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ALERT_NGO_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = statusFilter === "all" || (l.status || "new").toLowerCase() === statusFilter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.subject && l.subject.toLowerCase().includes(q)) ||
      (l.message && l.message.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout title="Dashboard">
      <style>{`
        .dash-welcome {
          background: linear-gradient(135deg, #141820, #1a1f2e);
          border: 1px solid #1e2436;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }
        .dash-welcome-title {
          color: #fff;
          margin: 0 0 4px;
          font-size: 1.25rem;
          font-weight: 800;
        }
        .dash-welcome-sub {
          color: #8892a4;
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        .dash-welcome-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .dash-action-btn-contact {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(225, 29, 72, 0.15);
          border: 1px solid rgba(225, 29, 72, 0.4);
          color: #fb7185;
          padding: 8px 14px;
          border-radius: 7px;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .dash-action-btn-contact:hover {
          background: rgba(225, 29, 72, 0.25);
        }
        .dash-action-btn-visit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #c0392b;
          color: #fff;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 7px;
          font-size: 0.8rem;
          font-weight: 700;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .dash-action-btn-visit:hover {
          background: #a93226;
        }

        .dash-leads-box {
          background: #111622;
          border: 1px solid #1e2436;
          border-radius: 12px;
          padding: 20px 22px;
          margin-bottom: 24px;
        }
        .dash-leads-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dash-badge-live {
          background: rgba(225, 29, 72, 0.15);
          color: #fb7185;
          border: 1px solid rgba(225, 29, 72, 0.3);
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .dash-leads-title {
          margin: 0;
          color: #fff;
          font-size: 1.15rem;
          font-weight: 800;
          word-break: break-word;
        }
        .dash-lead-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .dash-btn-csv {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 7px;
          background: #1e293b;
          border: 1px solid #334155;
          color: #10b981;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .dash-btn-manage {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 7px;
          background: #0284c7;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }
        .dash-btn-manage:hover {
          background: #0369a1;
        }

        .dash-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .dash-stat-card {
          background: #0b0f19;
          border: 1px solid #1f2937;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .dash-stat-label {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
        }
        .dash-stat-val {
          font-size: 1.45rem;
          font-weight: 800;
          margin-top: 2px;
        }

        .dash-search-row {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .dash-search-input-box {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .dash-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 14px;
        }
        .dash-card {
          background: #141820;
          border: 1px solid #1e2436;
          border-radius: 12px;
          padding: 18px 20px;
          transition: border-color 0.2s, transform 0.2s;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dash-card:hover:not(.dash-card-soon) {
          border-color: #c0392b44;
          transform: translateY(-2px);
        }
        .dash-card-soon {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .dash-card-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dash-card h3 {
          color: #fff;
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .dash-card p {
          color: #8892a4;
          margin: 0;
          font-size: 0.8rem;
          line-height: 1.45;
          flex: 1;
        }
        .dash-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 7px;
          font-size: 0.78rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          align-self: flex-start;
        }
        .dash-card-btn-red {
          background: rgba(192, 57, 43, 0.15);
          color: #ff6b6b;
          border: 1px solid rgba(192, 57, 43, 0.3);
        }
        .dash-card-btn-red:hover {
          background: rgba(192, 57, 43, 0.25);
        }
        .dash-card-btn-gray {
          background: #1e2436;
          color: #4a5568;
          border: 1px solid #2a3148;
          cursor: not-allowed;
        }

        .dash-modules-heading {
          margin: 0;
          color: #fff;
          font-size: 1.05rem;
          font-weight: 700;
        }

        .dash-leads-table-wrap {
          background: #0b0f19;
          border: 1px solid #1f2937;
          border-radius: 10px;
          overflow: hidden;
          width: 100%;
          max-width: 100%;
        }

        /* ── MOBILE MEDIA QUERIES (max-width: 640px) ── */
        @media (max-width: 640px) {
          .dash-welcome {
            padding: 12px 10px !important;
            border-radius: 10px !important;
            margin-bottom: 12px !important;
            gap: 8px !important;
          }
          .dash-welcome-title {
            font-size: 0.95rem !important;
            margin-bottom: 2px !important;
            line-height: 1.25 !important;
          }
          .dash-welcome-sub {
            font-size: 0.72rem !important;
            line-height: 1.35 !important;
          }
          .dash-welcome-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 7px !important;
            width: 100% !important;
          }
          .dash-action-btn-contact,
          .dash-action-btn-visit {
            width: 100% !important;
            padding: 6px 6px !important;
            font-size: 0.70rem !important;
            justify-content: center !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            text-align: center !important;
          }

          .dash-leads-box {
            padding: 11px 9px !important;
            border-radius: 10px !important;
            margin-bottom: 14px !important;
          }
          .dash-leads-header {
            margin-bottom: 8px !important;
            gap: 6px !important;
          }
          .dash-badge-live {
            font-size: 0.62rem !important;
            padding: 2px 5px !important;
          }
          .dash-leads-title {
            font-size: 0.86rem !important;
            line-height: 1.25 !important;
            margin-top: 2px !important;
          }
          .dash-lead-actions {
            display: grid !important;
            grid-template-columns: 1fr 1.35fr !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .dash-btn-csv,
          .dash-btn-manage {
            width: 100% !important;
            padding: 5px 6px !important;
            font-size: 0.70rem !important;
            justify-content: center !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            text-align: center !important;
          }

          .dash-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
            margin-bottom: 10px !important;
          }
          .dash-stat-card {
            padding: 6px 8px !important;
            border-radius: 7px !important;
          }
          .dash-stat-label {
            font-size: 0.62rem !important;
          }
          .dash-stat-val {
            font-size: 1.15rem !important;
            margin-top: 1px !important;
          }

          .dash-search-row {
            flex-direction: column !important;
            gap: 6px !important;
            margin-bottom: 8px !important;
          }
          .dash-search-input-box {
            width: 100% !important;
            min-width: 0 !important;
          }
          .dash-search-input-box input {
            padding: 5px 8px 5px 26px !important;
            font-size: 0.74rem !important;
            height: 31px !important;
            border-radius: 6px !important;
          }
          .dash-search-row select {
            width: 100% !important;
            padding: 5px 8px !important;
            font-size: 0.74rem !important;
            height: 31px !important;
            border-radius: 6px !important;
          }

          .dash-leads-table-wrap table th {
            padding: 5px 6px !important;
            font-size: 0.62rem !important;
            text-transform: uppercase !important;
            letter-spacing: 0.3px !important;
            white-space: nowrap !important;
          }
          .dash-leads-table-wrap table td {
            padding: 6px 6px !important;
            font-size: 0.68rem !important;
          }
          .dash-table-empty {
            padding: 16px 6px !important;
            font-size: 0.72rem !important;
          }
          .dash-table-empty svg {
            width: 20px !important;
            height: 20px !important;
            margin-bottom: 4px !important;
          }

          .dash-modules-heading {
            font-size: 0.82rem !important;
            font-weight: 700 !important;
            letter-spacing: 0.3px !important;
            text-transform: uppercase !important;
            color: #94a3b8 !important;
          }

          .dash-cards {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .dash-card {
            padding: 10px 11px !important;
            border-radius: 8px !important;
            gap: 5px !important;
          }
          .dash-card-icon {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            border-radius: 6px !important;
          }
          .dash-card-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
          .dash-card h3 {
            font-size: 0.80rem !important;
            font-weight: 700 !important;
            line-height: 1.25 !important;
          }
          .dash-card p {
            font-size: 0.70rem !important;
            line-height: 1.32 !important;
            color: #94a3b8 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .dash-card-btn {
            padding: 4px 9px !important;
            font-size: 0.68rem !important;
            border-radius: 5px !important;
          }
        }
      `}</style>

      {/* Welcome banner */}
      <div className="dash-welcome">
        <div>
          <h2 className="dash-welcome-title">👋 Welcome back, Admin</h2>
          <p className="dash-welcome-sub">Monitor community leads, update Google Map location, and control all site content from here.</p>
        </div>
        <div className="dash-welcome-actions">
          <Link to="/admin/contact" className="dash-action-btn-contact">
            <FaEnvelope size={11} /> Contact & Leads
          </Link>
          <a href="/" target="_blank" rel="noreferrer" className="dash-action-btn-visit">
            <FaExternalLinkAlt size={11} /> View Site
          </a>
        </div>
      </div>

      {/* ── PRIORITY: FORM SUBMISSIONS & LEADS REGISTER ── */}
      <div className="dash-leads-box">
        <div className="dash-leads-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
              <span className="dash-badge-live">
                Live Inquiries Register
              </span>
              <span style={{ color: "#64748b", fontSize: "0.74rem" }}>Real-time submissions from /contact form</span>
            </div>
            <h3 className="dash-leads-title">
              Recent Contact Form Inquiries & Leads ({counts.total})
            </h3>
          </div>

          <div className="dash-lead-actions">
            <button
              onClick={handleExportCSV}
              className="dash-btn-csv"
            >
              <FaDownload size={10} /> Export CSV
            </button>
            <Link
              to="/admin/contact"
              className="dash-btn-manage"
            >
              Manage Full Leads &rarr;
            </Link>
          </div>
        </div>

        {/* STATS CHIPS (2x2 Grid on Mobile) */}
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-label">Total Leads</div>
            <div className="dash-stat-val" style={{ color: "#fff" }}>{counts.total}</div>
          </div>
          <div className="dash-stat-card" style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}>
            <div className="dash-stat-label" style={{ color: "#fbbf24" }}>New Inquiries</div>
            <div className="dash-stat-val" style={{ color: "#fbbf24" }}>{counts.new}</div>
          </div>
          <div className="dash-stat-card" style={{ borderColor: "rgba(56, 189, 248, 0.3)" }}>
            <div className="dash-stat-label" style={{ color: "#38bdf8" }}>In Progress</div>
            <div className="dash-stat-val" style={{ color: "#38bdf8" }}>{counts.in_progress}</div>
          </div>
          <div className="dash-stat-card" style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
            <div className="dash-stat-label" style={{ color: "#34d399" }}>Resolved</div>
            <div className="dash-stat-val" style={{ color: "#34d399" }}>{counts.resolved}</div>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="dash-search-row">
          <div className="dash-search-input-box">
            <input
              type="text"
              placeholder="Search leads by name, email, phone, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.82rem", boxSizing: "border-box" }}
            />
            <FaSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, background: "#0b0f19", border: "1px solid #334155", color: "#cbd5e1", fontSize: "0.82rem" }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New ({counts.new})</option>
            <option value="in_progress">In Progress ({counts.in_progress})</option>
            <option value="resolved">Resolved ({counts.resolved})</option>
          </select>
        </div>

        {/* LEADS TABLE */}
        <div className="dash-leads-table-wrap">
          <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#080c14", borderBottom: "1px solid #1f2937" }}>
                  <th style={{ padding: "10px 14px", color: "#94a3b8" }}>Date</th>
                  <th style={{ padding: "10px 14px", color: "#94a3b8" }}>Name & Contact</th>
                  <th style={{ padding: "10px 14px", color: "#94a3b8" }}>Purpose / Subject</th>
                  <th style={{ padding: "10px 14px", color: "#94a3b8" }}>Message Preview</th>
                  <th style={{ padding: "10px 14px", color: "#94a3b8" }}>Status</th>
                  <th style={{ padding: "10px 14px", color: "#94a3b8", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.slice(0, 10).map((lead) => {
                  const statusColors = {
                    new: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
                    in_progress: { bg: "rgba(56, 189, 248, 0.15)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" },
                    resolved: { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
                    read: { bg: "rgba(148, 163, 184, 0.15)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" }
                  };
                  const sc = statusColors[lead.status] || statusColors.new;

                  return (
                    <tr key={lead.id} style={{ borderBottom: "1px solid #1f2937" }}>
                      <td style={{ padding: "12px 14px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {new Date(lead.created_at || Date.now()).toLocaleDateString()}<br />
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                          {new Date(lead.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 700, color: "#fff" }}>{lead.name}</div>
                        <div style={{ fontSize: "0.78rem" }}>
                          <a href={`mailto:${lead.email}`} style={{ color: "#38bdf8", textDecoration: "none" }}>{lead.email}</a>
                        </div>
                        {lead.phone && (
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>📞 {lead.phone}</div>
                        )}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ display: "inline-block", background: "rgba(210,25,12,0.12)", color: "#f87171", border: "1px solid rgba(210,25,12,0.25)", padding: "2px 6px", borderRadius: 5, fontSize: "0.72rem", fontWeight: 700 }}>
                          {lead.subject || "General Inquiry"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", color: "#cbd5e1", maxWidth: 260 }}>
                        <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                          {lead.message}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <select
                          value={lead.status || "new"}
                          onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                          style={{
                            background: sc.bg,
                            color: sc.text,
                            border: `1px solid ${sc.border}`,
                            padding: "3px 6px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="read">Read</option>
                        </select>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setLeadStatus(lead.status || "new");
                              setLeadRemarks(lead.notes || "");
                            }}
                            style={{ padding: "5px 8px", borderRadius: 6, background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", cursor: "pointer", fontSize: "0.75rem" }}
                            title="View Full Lead & Add Notes"
                          >
                            <FaEye size={11} />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            style={{ padding: "5px 8px", borderRadius: 6, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem" }}
                            title="Delete Lead"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="dash-table-empty" style={{ textAlign: "center", color: "#64748b" }}>
                      <FaInbox size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <div>No contact form leads submitted yet.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ALL ADMIN SECTIONS / CARDS ── */}
      <div style={{ marginBottom: 10 }}>
        <h3 className="dash-modules-heading">
          Content & Page Management Modules
        </h3>
      </div>
      <div className="dash-cards">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`dash-card${c.soon ? " dash-card-soon" : ""}`}>
              <div className="dash-card-icon" style={{ background: c.bg }}>
                <Icon size={22} color={c.color} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3>{c.label}</h3>
                {c.soon && <span className="dash-soon-pill">SOON</span>}
              </div>
              <p>{c.desc}</p>
              {c.path ? (
                <Link to={c.path} className="dash-card-btn dash-card-btn-red">
                  <FaCheckCircle size={11} /> {c.action}
                </Link>
              ) : (
                <span className="dash-card-btn dash-card-btn-gray">{c.action}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: VIEW LEAD */}
      {selectedLead && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: 14, padding: 24, width: "100%", maxWidth: 580 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 700 }}>LEAD #{selectedLead.id}</span>
                <h3 style={{ margin: "2px 0 0", color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>{selectedLead.name}</h3>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "#0b0f19", padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Email</div>
                <a href={`mailto:${selectedLead.email}`} style={{ color: "#38bdf8", fontWeight: 600, fontSize: "0.85rem" }}>{selectedLead.email}</a>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Phone</div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>{selectedLead.phone || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Subject</div>
                <div style={{ color: "#f87171", fontWeight: 700, fontSize: "0.82rem" }}>{selectedLead.subject || "General Inquiry"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Office Desk</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.82rem" }}>{selectedLead.office || "Headquarters"}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, marginBottom: 4 }}>Full Inquiry Message:</div>
              <div style={{ background: "#0b0f19", border: "1px solid #1f2937", borderRadius: 8, padding: 12, color: "#fff", fontSize: "0.88rem", lineHeight: 1.5, maxHeight: 150, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                {selectedLead.message}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4, fontWeight: 700 }}>Status</label>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.82rem" }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="read">Read</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4, fontWeight: 700 }}>Admin Remarks / Notes</label>
                <input
                  value={leadRemarks}
                  onChange={(e) => setLeadRemarks(e.target.value)}
                  placeholder="Notes about phone call or resolution..."
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0b0f19", border: "1px solid #334155", color: "#fff", fontSize: "0.82rem", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setSelectedLead(null)} style={{ padding: "8px 16px", borderRadius: 6, background: "#1e293b", color: "#94a3b8", border: "none", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSaveModal} style={{ padding: "8px 18px", borderRadius: 6, background: "#0284c7", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
