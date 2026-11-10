import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaBullhorn, FaSignOutAlt,
  FaShieldAlt, FaBars, FaTimes, FaChevronRight, FaEdit, FaUsers, FaHandsHelping, FaInstagram, FaQuoteLeft, FaInfoCircle, FaWater, FaBalanceScale, FaTree, FaHandHoldingHeart, FaTrophy, FaFileAlt, FaBookOpen, FaNewspaper, FaPhotoVideo, FaBriefcase, FaEnvelope, FaRobot, FaKey, FaEye, FaEyeSlash, FaLock, FaCheck
} from "react-icons/fa";

const KEY_STORAGE = "alertngo_admin_key";

const navItems = [
  { label: "Dashboard", icon: FaHome, path: "/admin/dashboard" },
  { label: "Edit Home", icon: FaEdit, path: "/admin/edit-home" },
  {
    label: "About Pages",
    icon: FaInfoCircle,
    path: "/admin/about-pages",
    subItems: [
      { label: "Governing Body", path: "/admin/about-pages?slug=governing-body" },
      { label: "Vision & Mission", path: "/admin/about-pages?slug=vision-mission-2" },
      { label: "Core Values", path: "/admin/about-pages?slug=core-values" },
      { label: "Profile", path: "/admin/about-pages?slug=organizational-profile" },
      { label: "Organogram", path: "/admin/about-pages?slug=organogram" },
      { label: "Alert Policies", path: "/admin/about-pages?slug=alert-policies" },
      { label: "Area of Operation", path: "/admin/about-pages?slug=area-of-operation" },
      { label: "Dropdown Menu", path: "/admin/about-pages?slug=dropdown-menu" }
    ]
  },
  {
    label: "Key Programs",
    icon: FaHandsHelping,
    path: "/admin/programs",
    subItems: [
      { label: "Natural Resources", path: "/admin/programs?id=nrm" },
      { label: "Child Rights & Edu", path: "/admin/programs?id=edu" },
      { label: "Community Health", path: "/admin/programs?id=health" },
      { label: "Women Empowerment", path: "/admin/programs?id=women" },
      { label: "Disaster Preparedness", path: "/admin/programs?id=disaster" },
      { label: "Tribal Livelihoods", path: "/admin/programs?id=livelihood" }
    ]
  },
  {
    label: "Polavaram Project",
    icon: FaWater,
    path: "/admin/polavaram",
    subItems: [
      { label: "Overview", path: "/admin/polavaram?slug=polavaram" },
      { label: "Submergence Villages", path: "/admin/polavaram?slug=polavaram-submergence-villages" },
      { label: "Submergence Area Map", path: "/admin/polavaram?slug=submergence-area-map" },
      { label: "R&R Status", path: "/admin/polavaram?slug=polavaram-rr" },
      { label: "Colonies Monitored", path: "/admin/polavaram?slug=polavaram-rehabilitation-colonies" }
    ]
  },
  {
    label: "LA & RR",
    icon: FaBalanceScale,
    path: "/admin/la-rr",
    subItems: [
      { label: "Overview", path: "/admin/la-rr?slug=la-rr" },
      { label: "R&R Package", path: "/admin/la-rr?slug=r-r-package" },
      { label: "Court Cases", path: "/admin/la-rr?slug=cases" },
      { label: "Act & Rules", path: "/admin/la-rr?slug=act-rules" },
      { label: "Petitions", path: "/admin/la-rr?slug=petitions" }
    ]
  },
  {
    label: "RoFR & LTR",
    icon: FaTree,
    path: "/admin/rofr",
    subItems: [
      { label: "RoFR Overview", path: "/admin/rofr?slug=rofr" },
      { label: "Abstract RoFR", path: "/admin/rofr?slug=abstract-rofr" },
      { label: "Rejection Reasons", path: "/admin/rofr?slug=reasons-for-rejections" },
      { label: "RoFR Judgements", path: "/admin/rofr?slug=compendium-of-judgements-rofr" },
      { label: "RoFR Rules-G.Os", path: "/admin/rofr?slug=rofr-g-os" },
      { label: "LTR ASR", path: "/admin/rofr?slug=ltr" },
      { label: "LTR ELURU", path: "/admin/rofr?slug=ltr-eluru" },
      { label: "LTR Disposal", path: "/admin/rofr?slug=ltr-disposal-meanings" }
    ]
  },
  {
    label: "Flood Relief",
    icon: FaHandHoldingHeart,
    path: "/admin/flood-relief",
    subItems: [
      { label: "Overview", path: "/admin/flood-relief?slug=flood-relief-measures" },
      { label: "2023 Mission", path: "/admin/flood-relief?slug=2023-2" },
      { label: "2022 Mission", path: "/admin/flood-relief?slug=flood-relief-measures-2022" },
      { label: "2021 Mission", path: "/admin/flood-relief?slug=flood-relief-measures-2021-2" },
      { label: "2020 Mission", path: "/admin/flood-relief?slug=flood-relief-measures-2020" },
      { label: "Blankets - East G.", path: "/admin/flood-relief?slug=blankets-distribution-in-east-godavari" },
      { label: "Groceries - West G.", path: "/admin/flood-relief?slug=groceries-distribution-in-west-godavari" }
    ]
  },
  {
    label: "Achievements",
    icon: FaTrophy,
    path: "/admin/achievements",
    subItems: [
      { label: "Overview", path: "/admin/achievements?slug=achievements" },
      { label: "Child Interventions", path: "/admin/achievements?slug=child-interventions" },
      { label: "Child Bare Acts", path: "/admin/achievements?slug=child-bare-acts" },
      { label: "Reports", path: "/admin/achievements?slug=reports" },
      { label: "PORTFOLIO", path: "/admin/achievements?slug=portfolio-3" }
    ]
  },
  { label: "All Site Pages", icon: FaFileAlt, path: "/admin/all-pages" },
  { label: "Stories of Change", icon: FaBookOpen, path: "/admin/stories" },
  { label: "News & Dispatches", icon: FaNewspaper, path: "/admin/news" },
  { label: "Videos & Images", icon: FaPhotoVideo, path: "/admin/gallery" },
  { label: "Careers", icon: FaBriefcase, path: "/admin/careers" },
  {
    label: "Partner & Resources",
    icon: FaHandsHelping,
    path: "/admin/partner",
    subItems: [
      { label: "Partner with Us", path: "/admin/partner?tab=partner" },
      { label: "Grievances Desk", path: "/admin/partner?tab=grievances" },
      { label: "Grievance Pages (4)", path: "/admin/partner?tab=grievance_pages" },
      { label: "Downloads Pages (4)", path: "/admin/partner?tab=download_pages" },
      { label: "Quick Links (/quick-links)", path: "/admin/partner?tab=quick_links" },
      { label: "Resource Files", path: "/admin/partner?tab=downloads" },
      { label: "FAQ’s Center", path: "/admin/partner?tab=faqs" },
      { label: "Dropdown Menus", path: "/admin/partner?tab=dropdowns" }
    ]
  },
  {
    label: "Contact & Leads",
    icon: FaEnvelope,
    path: "/admin/contact",
    subItems: [
      { label: "All Leads & Inquiries", path: "/admin/contact?tab=leads" },
      { label: "Google Map Embed", path: "/admin/contact?tab=map" },
      { label: "Head Office Details", path: "/admin/contact?tab=details" },
      { label: "Form & Dropdowns", path: "/admin/contact?tab=dropdowns" }
    ]
  },
  {
    label: "Donations & QR",
    icon: FaHandHoldingHeart,
    path: "/admin/donate",
    subItems: [
      { label: "All Donations & Receipts", path: "/admin/donate?tab=donations" },
      { label: "Payment QR & UPI Settings", path: "/admin/donate?tab=qr" },
      { label: "Page Content & Impact Tiers", path: "/admin/donate?tab=content" },
      { label: "Bank Account Details", path: "/admin/donate?tab=bank" }
    ]
  },
  { label: "Chatbot API Key", icon: FaRobot, path: "/admin/chatbot" },
  { label: "Reels", icon: FaInstagram, path: "/admin/reels" },
  { label: "Testimonials", icon: FaQuoteLeft, path: "/admin/testimonials" },
  { label: "Team", icon: FaUsers, path: "/admin/team" },
  { label: "Flash News", icon: FaBullhorn, path: "/admin/flash-news" },
];

export default function AdminLayout({ children, title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Auto-close mobile sidebar when expanding to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Change Password Modal State
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdShowOld, setPwdShowOld] = useState(false);
  const [pwdShowNew, setPwdShowNew] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    const currentSaved = localStorage.getItem("alertngo_admin_password") || "alertngo@123";
    if (oldPassword !== currentSaved && oldPassword !== "alertngo@123") {
      setPwdError("Current password is incorrect.");
      return;
    }
    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }

    setPwdLoading(true);
    setTimeout(() => {
      localStorage.setItem("alertngo_admin_password", newPassword);
      sessionStorage.setItem(KEY_STORAGE, newPassword);
      setPwdSuccess("Password updated successfully!");
      setPwdLoading(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPwdModal(false);
        setPwdSuccess("");
      }, 1500);
    }, 500);
  };

  const logout = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    navigate("/admin", { replace: true });
  };

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100% !important;
          max-width: 100% !important;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden !important;
          background: #0d0f14 !important;
        }
        .adm-wrap {
          display: flex;
          height: 100vh;
          max-height: 100vh;
          width: 100% !important;
          max-width: 100% !important;
          overflow: hidden !important;
          background: #0d0f14;
          font-family: 'Outfit', 'Inter', sans-serif;
          box-sizing: border-box;
          min-width: 0;
        }

        /* ── Fixed Sidebar ── */
        .adm-sidebar {
          width: var(--sw, 240px);
          height: 100vh;
          max-height: 100vh;
          background: #111520;
          border-right: 1px solid #1e2436;
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          overflow: visible !important;
        }
        .adm-sidebar::-webkit-scrollbar,
        .adm-sidebar *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        .adm-sidebar.collapsed { --sw: 68px; }
        .adm-sidebar.collapsed .adm-sidebar-head {
          padding: 14px 0;
          justify-content: center;
        }
        .adm-sidebar.collapsed .adm-nav-item {
          justify-content: center;
          padding: 11px 0;
        }
        .adm-sidebar.collapsed .adm-logout,
        .adm-sidebar.collapsed .adm-foot-btn {
          justify-content: center;
          padding: 11px 0;
        }
        .adm-sidebar-head {
          padding: 20px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #1e2436;
          min-height: 64px;
          box-sizing: border-box;
          flex-shrink: 0;
          position: relative;
          overflow: visible;
        }
        .adm-logo-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          flex-shrink: 0;
          background: #ffffff;
          border: 1.5px solid rgba(192,57,43,.3);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          padding: 2px;
          box-sizing: border-box;
          text-decoration: none;
        }
        .adm-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .adm-brand { overflow: hidden; white-space: nowrap; }
        .adm-brand-name { color: #fff; font-weight: 800; font-size: 0.95rem; line-height: 1.2; }
        .adm-brand-sub { color: #c0392b; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.05em; }
        .adm-toggle {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
          position: absolute;
          right: -9999px;
          top: 50%;
          width: 0;
          height: 0;
          padding: 0;
          margin: 0;
          border: none;
        }

        .adm-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          -webkit-overflow-scrolling: touch;
        }
        .adm-nav::-webkit-scrollbar,
        .adm-nav *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        .adm-nav::-webkit-scrollbar-thumb {
          display: none !important;
          background: transparent !important;
        }
        .adm-nav::-webkit-scrollbar-track {
          display: none !important;
          background: transparent !important;
        }
        .adm-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #8892a4;
          font-size: 0.88rem;
          font-weight: 600;
          transition: all 0.18s;
          white-space: nowrap;
          overflow: hidden;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          position: relative;
        }
        .adm-nav-item:hover { background: #1e2436; color: #fff; }
        .adm-nav-item.active { background: rgba(192,57,43,.15); color: #ff6b6b; border-left: 3px solid #c0392b; padding-left: 9px; }
        .adm-nav-item.soon { opacity: 0.5; cursor: not-allowed; }
        .adm-nav-icon { font-size: 1rem; flex-shrink: 0; }
        .adm-soon-tag {
          margin-left: auto;
          background: #1e2436;
          color: #4a5568;
          font-size: 0.6rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .adm-nav-label { overflow: hidden; text-overflow: ellipsis; }

        .adm-sidebar-foot {
          padding: 8px 8px;
          border-top: 1px solid #1e2436;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .adm-foot-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          transition: all 0.18s;
          white-space: nowrap;
          overflow: hidden;
          box-sizing: border-box;
        }
        .adm-change-pwd-btn {
          color: #38bdf8;
        }
        .adm-change-pwd-btn:hover { background: rgba(56,189,248,0.12); color: #7dd3fc; }
        .adm-logout {
          color: #94a3b8;
        }
        .adm-logout:hover { background: rgba(192,57,43,.15); color: #ff6b6b; }

        /* ── Main Container (Middle Area Scrolls Independently) ── */
        .adm-main {
          flex: 1;
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .adm-topbar {
          height: 64px;
          background: #111520;
          border-bottom: 1px solid #1e2436;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px 0 48px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .adm-mob-toggle {
          display: none !important;
        }
        @media (min-width: 769px) {
          .adm-mob-toggle {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        }
        .adm-topbar-left {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 10px !important;
          min-width: 0 !important;
          flex-wrap: nowrap !important;
          flex: 1 !important;
        }
        .adm-page-title {
          color: #fff;
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0;
        }
        .adm-user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1e2436;
          border: 1px solid #2a3148;
          border-radius: 20px;
          padding: 6px 12px 6px 8px;
        }
        .adm-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c0392b, #a93226);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          color: #fff;
        }
        .adm-uname { color: #8892a4; font-size: 0.78rem; font-weight: 600; }
        
        /* Middle scrollable area */
        .adm-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          box-sizing: border-box;
          height: calc(100vh - 64px);
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .adm-content::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .pills-scroll-btn {
          background: #1e293b !important;
          border: 1px solid #475569 !important;
          color: #f8fafc !important;
          border-radius: 6px !important;
          padding: 4px 10px !important;
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          min-width: auto !important;
          width: auto !important;
          min-height: 28px !important;
          height: 28px !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          line-height: 1 !important;
        }
        .pills-scroll-btn:hover {
          background: #334155 !important;
          border-color: #64748b !important;
          color: #ffffff !important;
        }

        /* ── Comprehensive Mobile Optimization across all Admin Pages ── */
        .adm-mob-close { display: none; }
        .adm-overlay { display: none; }

        @media (max-width: 768px) {
          .adm-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: min(290px, 84vw) !important;
            max-width: 84vw !important;
            z-index: 9999 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: 10px 0 35px rgba(0, 0, 0, 0.75) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .adm-sidebar.mob-open {
            transform: translateX(0) !important;
          }
          .adm-sidebar.mob-open .adm-nav-label {
            display: inline-block !important;
          }
          .adm-sidebar.mob-open .adm-brand {
            display: block !important;
          }
          .adm-sidebar-head {
            padding: 16px 14px !important;
            min-height: 58px !important;
            display: flex !important;
            align-items: center !important;
          }
          .adm-toggle {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
            opacity: 0 !important;
            right: -9999px !important;
          }
          .adm-mob-close {
            display: flex !important;
            align-items: center;
            justify-content: center;
            margin-left: auto;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #cbd5e1;
            cursor: pointer;
            padding: 0;
          }
          .adm-overlay {
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0, 0, 0, 0.75) !important;
            backdrop-filter: blur(4px) !important;
            -webkit-backdrop-filter: blur(4px) !important;
            z-index: 9990 !important;
            display: none !important;
          }
          .adm-overlay.show {
            display: block !important;
          }
          .adm-mob-toggle {
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid #2a3148;
            color: #fff;
            border-radius: 8px;
            width: 36px;
            height: 36px;
            cursor: pointer;
            flex-shrink: 0;
            padding: 0;
          }
          .adm-topbar {
            height: 56px !important;
            padding: 0 12px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .adm-main {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow-x: hidden !important;
          }
          .adm-page-title {
            font-size: 0.86rem !important;
            font-weight: 700 !important;
            margin-left: 4px !important;
            max-width: min(200px, 48vw) !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .adm-user-chip {
            padding: 2px !important;
            background: transparent !important;
            border: none !important;
          }
          .adm-uname {
            display: none !important;
          }

          /* Content scrollable area on mobile */
          .adm-content {
            padding: 12px 10px !important;
            height: calc(100vh - 56px) !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }

          /* Prevent any child element from blowing past viewport width & enforce shrink */
          .adm-content,
          .adm-content * {
            max-width: 100% !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
          }
          /* Allow items inside horizontal scroll containers to be wider than the scroll view */
          .adm-content [class*="pills-wrap"] > *,
          .adm-content [class*="cat-pills"] > *,
          .adm-content [class*="tabs-wrap"] > *,
          .adm-content [class*="subtabs"] > *,
          .adm-content [class*="selector-pills"] > *,
          .adm-content [class*="table-scroll"] > table,
          .adm-content [class*="table-scroll"] > * {
            max-width: none !important;
          }

          /* General typography adjustments: prevent huge text */
          .adm-content h1 {
            font-size: 1.15rem !important;
            line-height: 1.28 !important;
            margin-bottom: 8px !important;
          }
          .adm-content h2,
          .adm-content .adm-card-panel h2 {
            font-size: 1rem !important;
            line-height: 1.3 !important;
            margin-bottom: 10px !important;
          }
          .adm-content h3 {
            font-size: 0.9rem !important;
            line-height: 1.3 !important;
            margin-bottom: 6px !important;
          }
          .adm-content h4 {
            font-size: 0.82rem !important;
          }
          .adm-content p,
          .adm-content label {
            word-break: break-word;
          }
          .adm-content span:not(.adm-badge-pill):not([class*="badge"]):not([class*="pill"]):not([class*="chip"]):not([class*="tag"]):not([class*="stat-item-badge"]):not([class*="stat-header-badge"]) {
            word-break: break-word;
          }
          .adm-content .adm-badge-pill,
          .adm-content [class*="badge"],
          .adm-content [class*="pill"],
          .adm-content [class*="chip"],
          .adm-content [class*="tag"],
          .adm-content [class*="stat-item-badge"],
          .adm-content [class*="stat-header-badge"] {
            word-break: keep-all !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            display: inline-block !important;
          }
          .adm-content p {
            font-size: 0.8rem !important;
            line-height: 1.45 !important;
          }

          /* Button adjustments: prevent big / bulky buttons */
          .adm-content button:not([class*="swatch"]):not([class*="arrow"]):not([class*="color"]):not([class*="preset"]):not([class*="icon-btn"]),
          .adm-content .btn,
          .adm-content .btn-red,
          .adm-content .btn-secondary,
          .adm-content a.btn,
          .adm-content a.dash-visit,
          .adm-content a[style*="borderRadius: 10"],
          .adm-content a[style*="borderRadius: 8"],
          .adm-content a[style*="border-radius: 10"],
          .adm-content a[style*="border-radius: 8"],
          .adm-content button[style*="padding: \"12px"],
          .adm-content button[style*="padding: 12px"],
          .adm-content .tab-btn {
            font-size: 0.8rem !important;
            padding: 8px 12px !important;
            min-height: 32px !important;
            line-height: 1.25 !important;
            text-align: center !important;
          }

          /* Restore pill selector buttons – let inline styles take effect */
          .adm-content [class*="selector-pills"],
          .adm-content [class*="pills-wrap"],
          .adm-content [class*="cat-pills"],
          .adm-content [class*="tabs-wrap"],
          .adm-content [class*="subtabs"] {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            touch-action: pan-x !important;
            gap: 10px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding-bottom: 6px !important;
            padding-left: 6px !important;
            padding-right: 20px !important;
            scroll-padding-left: 6px !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2) !important;
          }
          .adm-content .pills-scroll-btn,
          .adm-content button.pills-scroll-btn {
            background: #1e293b !important;
            border: 1px solid #475569 !important;
            color: #f8fafc !important;
            border-radius: 6px !important;
            padding: 4px 10px !important;
            font-size: 0.82rem !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            min-width: auto !important;
            width: auto !important;
            min-height: 28px !important;
            height: 28px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          .adm-content .pills-scroll-btn:hover {
            background: #334155 !important;
            border-color: #64748b !important;
          }
          .adm-content [class*="selector-pills"]::-webkit-scrollbar,
          .adm-content [class*="pills-wrap"]::-webkit-scrollbar,
          .adm-content [class*="tabs-wrap"]::-webkit-scrollbar,
          .adm-content [class*="subtabs"]::-webkit-scrollbar {
            height: 4px !important;
            display: block !important;
          }
          .adm-content [class*="selector-pills"]::-webkit-scrollbar-thumb,
          .adm-content [class*="pills-wrap"]::-webkit-scrollbar-thumb,
          .adm-content [class*="tabs-wrap"]::-webkit-scrollbar-thumb,
          .adm-content [class*="subtabs"]::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3) !important;
            border-radius: 4px !important;
          }
          .adm-content [class*="selector-pills"]::-webkit-scrollbar-track,
          .adm-content [class*="pills-wrap"]::-webkit-scrollbar-track,
          .adm-content [class*="tabs-wrap"]::-webkit-scrollbar-track,
          .adm-content [class*="subtabs"]::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2) !important;
          }
          .adm-content [class*="selector-pills"] button,
          .adm-content [class*="pills-wrap"] button,
          .adm-content [class*="tabs-wrap"] button,
          .adm-content [class*="subtabs"] button {
            font-size: 0.82rem !important;
            padding: 8px 14px !important;
            gap: 8px !important;
            min-width: max-content !important;
            width: auto !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            text-align: left !important;
            touch-action: pan-x !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            cursor: pointer !important;
          }
          .adm-content [class*="selector-pills"] button span,
          .adm-content [class*="pills-wrap"] button span,
          .adm-content [class*="tabs-wrap"] button span,
          .adm-content [class*="subtabs"] button span {
            min-width: auto !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            text-align: left !important;
          }

          /* Compact swatches, reorder arrows, presets, and small icon buttons */
          .adm-content [class*="swatch"],
          .adm-content button[class*="swatch"] {
            width: 24px !important;
            min-width: 24px !important;
            height: 24px !important;
            min-height: 24px !important;
            padding: 0 !important;
            border-radius: 6px !important;
            flex-shrink: 0 !important;
          }
          .adm-content [class*="arrow"],
          .adm-content button[class*="arrow"] {
            width: 26px !important;
            min-width: 26px !important;
            height: 26px !important;
            min-height: 26px !important;
            padding: 0 !important;
            border-radius: 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
          }
          .adm-content [class*="preset"],
          .adm-content button[class*="preset"] {
            padding: 4px 8px !important;
            min-height: auto !important;
            font-size: 0.72rem !important;
            line-height: 1.2 !important;
            border-radius: 6px !important;
          }
          .adm-content [class*="del"],
          .adm-content button[class*="del"] {
            min-height: 24px !important;
            height: 26px !important;
            padding: 0 8px !important;
            font-size: 0.72rem !important;
            flex-shrink: 0 !important;
          }

          /* Form inputs: comfortable touch targets without blowing up */
          .adm-content input,
          .adm-content select,
          .adm-content textarea,
          .adm-content .form-input,
          .adm-content .form-select,
          .adm-content .form-textarea {
            font-size: 13px !important;
            padding: 8px 10px !important;
            border-radius: 7px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .adm-content .form-group {
            margin-bottom: 12px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .adm-content .form-label {
            font-size: 0.72rem !important;
            margin-bottom: 4px !important;
          }

          /* Cards & Panels: tighter padding on mobile so content has breathing room */
          .adm-content .adm-card-panel,
          .adm-content .card-item,
          .adm-content .dash-welcome,
          .adm-content .dash-card,
          .adm-content div[style*="borderRadius: 16"],
          .adm-content div[style*="borderRadius: 14"],
          .adm-content div[style*="borderRadius: 12"],
          .adm-content div[style*="border-radius: 16px"],
          .adm-content div[style*="border-radius: 14px"],
          .adm-content div[style*="border-radius: 12px"] {
            padding: 14px 12px !important;
            margin-bottom: 14px !important;
            border-radius: 10px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          /* Responsive Flex header toolbars */
          .adm-content div[style*="justifyContent: \"space-between\""]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]),
          .adm-content div[style*="justify-content: space-between"]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]),
          .adm-content [class*="tab-header-bar"] {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adm-content [class*="tab-header-bar"] > div:first-child,
          .adm-content div[style*="justifyContent: \"space-between\""]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]) > div:not([class*="controls"]):not([class*="actions"]),
          .adm-content div[style*="justify-content: space-between"]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]) > div:not([class*="controls"]):not([class*="actions"]) {
            width: 100% !important;
          }
          .adm-content [class*="tab-header-bar"] button,
          .adm-content [class*="tab-header-bar"] > button,
          .adm-content [class*="tab-header-bar"] > div:last-child button,
          .adm-content [class*="stat-header-bar"] button {
            width: auto !important;
            max-width: max-content !important;
            align-self: flex-start !important;
            justify-content: flex-start !important;
            padding: 7px 14px !important;
            font-size: 0.8rem !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
          }
          .adm-content div[style*="justifyContent: \"space-between\""]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]):not([class*="tab-header-bar"]) > button,
          .adm-content div[style*="justify-content: space-between"]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]):not([class*="tab-header-bar"]) > button {
            width: auto !important;
            max-width: max-content !important;
            align-self: flex-start !important;
          }
          .adm-content [class*="tab-header-bar"] button,
          .adm-content [class*="tab-header-bar"] > button,
          .adm-content [class*="tab-header-bar"] > div:last-child button,
          .adm-content [class*="stat-header-bar"] button {
            width: auto !important;
            max-width: max-content !important;
            align-self: flex-start !important;
            justify-content: flex-start !important;
            padding: 7px 14px !important;
            font-size: 0.8rem !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
          }
          .adm-content div[style*="justifyContent: \"space-between\""]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]):not([class*="tab-header-bar"]) > button,
          .adm-content div[style*="justify-content: space-between"]:not([class*="stat-item"]):not([class*="table-topbar"]):not([class*="row"]):not([class*="head-row"]):not([class*="title-wrap"]):not([class*="item-head"]):not([class*="selector-head"]):not([class*="tab-header-bar"]) > button {
            width: auto !important;
            max-width: max-content !important;
            align-self: flex-start !important;
          }

          /* Ensure Stat card item headers stay clean single-line rows */
          .adm-content [class*="stat-item-header"] {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 8px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .adm-content [class*="stat-item-header"] > [class*="title-wrap"] {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 6px !important;
            min-width: 0 !important;
            flex: 1 1 auto !important;
            width: auto !important;
          }
          .adm-content [class*="stat-item-header"] > [class*="controls"] {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 4px !important;
            flex-shrink: 0 !important;
            width: auto !important;
          }

          /* Stat cards and multi-column grids collapse to 1 column on mobile */
          .adm-content div[style*="gridTemplateColumns"],
          .adm-content div[style*="grid-template-columns"],
          .adm-content .grid-2col {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Tables: smooth horizontal scroll container without breaking page */
          .adm-content table {
            width: 100% !important;
            max-width: none !important;
          }
          .adm-content div:has(> table),
          .adm-content div[class*="table-scroll"],
          .adm-content div[style*="overflowX"],
          .adm-content div[style*="overflow-x"] {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            display: block !important;
            border-radius: 8px !important;
          }
          .adm-content div:has(> table) > table,
          .adm-content div[class*="table-scroll"] table,
          .adm-content div[style*="overflowX"] > table,
          .adm-content div[style*="overflow-x"] > table {
            min-width: 560px !important;
            width: 100% !important;
            max-width: none !important;
            table-layout: auto !important;
          }
          .adm-content table th,
          .adm-content table td {
            padding: 8px 10px !important;
            font-size: 0.78rem !important;
            white-space: nowrap !important;
          }
          .adm-content table td input,
          .adm-content table th input {
            min-width: 80px !important;
            max-width: none !important;
            font-size: 0.78rem !important;
            padding: 5px 8px !important;
          }
          .adm-content table td:first-child,
          .adm-content table th:first-child {
            width: 50px !important;
            min-width: 50px !important;
          }
          .adm-content table td:first-child input,
          .adm-content table th:first-child input {
            width: 42px !important;
            min-width: 42px !important;
            text-align: center !important;
          }

          /* Upload preview box */
          .adm-content .uploaded-preview-box {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 10px !important;
          }
          .adm-content .preview-img-wrap {
            width: 100% !important;
            max-width: 100% !important;
            height: 120px !important;
          }
          .adm-content .preview-actions {
            flex-wrap: wrap !important;
            width: 100% !important;
            gap: 6px !important;
          }
          .adm-content .preview-actions button {
            flex: 1 1 auto !important;
          }

          /* Dropdown popover */
          .adm-content .icon-dropdown-popover {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            left: 0 !important;
            right: 0 !important;
          }

          /* Modals globally inside Admin pages */
          div[class*="modal-backdrop"] {
            padding: 8px !important;
          }
          div[class*="modal-card"] {
            padding: 14px 12px !important;
            max-height: 94vh !important;
            border-radius: 12px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          div[class*="modal-card"] div[style*="gridTemplateColumns"],
          div[class*="modal-card"] div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          div[class*="modal-card"] div[style*="justifyContent: \"flex-end\""],
          div[class*="modal-card"] div[style*="justify-content: flex-end"] {
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          div[class*="modal-card"] div[style*="justifyContent: \"flex-end\""] button,
          div[class*="modal-card"] div[style*="justify-content: flex-end"] button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }

          /* Tab bars across all admin pages */
          div[class*="tabs"],
          div[class*="nav-tabs"] {
            overflow-x: auto !important;
            display: flex !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 6px !important;
            padding-bottom: 8px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          button[class*="tab-btn"] {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.78rem !important;
            padding: 7px 12px !important;
          }

          /* Outer page containers with large padding */
          .adm-content > div[style*="padding: \"24px"],
          .adm-content > div[style*="padding: 24px"],
          .adm-content > div[style*="padding: \"26px"],
          .adm-content > div[style*="padding: 26px"] {
            padding: 10px 4px !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          /* Hardcoded large minWidth elements */
          .adm-content div[style*="minWidth: 3"],
          .adm-content div[style*="minWidth: 2"],
          .adm-content div[style*="min-width: 3"],
          .adm-content div[style*="min-width: 2"],
          .adm-content form[style*="minWidth: 2"],
          .adm-content form[style*="minWidth: 3"] {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Universal button unwrapped & sizing constraint */
          .adm-content button:not([class*="swatch"]):not([class*="arrow"]):not([class*="color"]):not([class*="preset"]):not([class*="icon-btn"]),
          .adm-content .btn,
          .adm-content .btn-red,
          .adm-content .btn-secondary,
          .adm-content a.btn {
            white-space: nowrap !important;
            line-height: 1.2 !important;
            box-sizing: border-box !important;
          }

          /* Modal Overlays & Dialogs Viewport Constraints */
          div[style*="position: fixed"],
          div[style*="position: \"fixed\""],
          div[class*="modal-backdrop"] {
            padding: 6px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }

          div[style*="position: fixed"] > div,
          div[style*="position: \"fixed\""] > div,
          div[class*="modal-card"],
          div[class*="modal-dialog"] {
            max-width: calc(100vw - 12px) !important;
            width: calc(100vw - 12px) !important;
            padding: 16px 12px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            max-height: 94vh !important;
            overflow-y: auto !important;
          }

          /* FORCE MULTI-COLUMN FORM ROWS TO SINGLE COLUMN ON MOBILE */
          div[style*="position: fixed"] form div[style*="display: grid"],
          div[style*="position: fixed"] form div[style*="display: \"grid\""],
          div[style*="position: fixed"] div[style*="gridTemplateColumns"],
          div[style*="position: fixed"] div[style*="grid-template-columns"],
          div[style*="position: \"fixed\""] form div[style*="display: grid"],
          div[style*="position: \"fixed\""] form div[style*="display: \"grid\""],
          div[style*="position: \"fixed\""] div[style*="gridTemplateColumns"],
          div[style*="position: \"fixed\""] div[style*="grid-template-columns"],
          div[class*="modal"] div[style*="gridTemplateColumns"],
          div[class*="modal"] div[style*="grid-template-columns"],
          .adm-modal-form-grid {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          /* Form inputs, selects, textareas inside modals full width and readable */
          div[style*="position: fixed"] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
          div[style*="position: fixed"] select,
          div[style*="position: fixed"] textarea,
          div[style*="position: \"fixed\""] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
          div[style*="position: \"fixed\""] select,
          div[style*="position: \"fixed\""] textarea {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            font-size: 0.85rem !important;
            height: 38px !important;
            min-height: 38px !important;
            padding: 8px 10px !important;
          }

          div[style*="position: fixed"] textarea,
          div[style*="position: \"fixed\""] textarea {
            height: auto !important;
            min-height: 72px !important;
          }

          div[style*="position: fixed"] label,
          div[style*="position: \"fixed\""] label {
            font-size: 0.78rem !important;
            margin-bottom: 4px !important;
          }

          /* Modal footer buttons */
          div[style*="position: fixed"] form div[style*="justifyContent: \"flex-end\""],
          div[style*="position: fixed"] form div[style*="justify-content: flex-end"],
          div[style*="position: \"fixed\""] form div[style*="justifyContent: \"flex-end\""],
          div[style*="position: \"fixed\""] form div[style*="justify-content: flex-end"],
          div[style*="position: fixed"] div[style*="justifyContent: \"space-between\""]:last-child,
          div[style*="position: fixed"] div[style*="justify-content: space-between"]:last-child {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            width: 100% !important;
            margin-top: 14px !important;
          }

          div[style*="position: fixed"] form div[style*="justifyContent: \"flex-end\""] > button,
          div[style*="position: fixed"] form div[style*="justify-content: flex-end"] > button,
          div[style*="position: \"fixed\""] form div[style*="justifyContent: \"flex-end\""] > button,
          div[style*="position: \"fixed\""] form div[style*="justify-content: flex-end"] > button,
          div[style*="position: fixed"] div[style*="justifyContent: \"space-between\""]:last-child > button,
          div[style*="position: fixed"] div[style*="justify-content: space-between"]:last-child > button {
            flex: 1 1 0 !important;
            height: 38px !important;
            min-height: 38px !important;
            max-height: 38px !important;
            font-size: 0.82rem !important;
            padding: 6px 12px !important;
            white-space: nowrap !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
          }

          /* Typography scaling on mobile - fixes big fonts */
          .adm-content h1 {
            font-size: 1.35rem !important;
            margin-bottom: 6px !important;
            line-height: 1.25 !important;
          }
          .adm-content h2 {
            font-size: 1.15rem !important;
            margin-bottom: 6px !important;
          }
          .adm-content h3 {
            font-size: 1.02rem !important;
            margin-bottom: 4px !important;
          }
          .adm-content h4 {
            font-size: 0.92rem !important;
            margin-bottom: 4px !important;
          }
          .adm-content p {
            font-size: 0.82rem !important;
            line-height: 1.4 !important;
          }
          .adm-content span[style*="fontSize: \"1.8rem\""],
          .adm-content div[style*="fontSize: \"1.8rem\""],
          .adm-content div[style*="fontSize: 1.8rem"],
          .adm-content div[style*="fontSize: \"1.9rem\""],
          .adm-content div[style*="fontSize: 1.9rem"],
          .adm-content div[style*="fontSize: \"1.7rem\""],
          .adm-content div[style*="fontSize: 1.7rem"],
          .stat-val,
          .metric-val {
            font-size: 1.4rem !important;
          }

          /* Button sizing on mobile - fixes big buttons */
          .adm-content button:not([class*="swatch"]):not([class*="arrow"]):not([class*="color"]):not([class*="preset"]):not([class*="icon-btn"]):not(.pills-scroll-btn),
          .adm-content .btn,
          .adm-content .btn-red,
          .adm-content .btn-secondary,
          .adm-content a.btn,
          .adm-content a[style*="borderRadius: 8"],
          .adm-content a[style*="border-radius: 8"],
          .adm-content a[style*="borderRadius: 10"],
          .adm-content a[style*="border-radius: 10"] {
            font-size: 0.8rem !important;
            padding: 6px 12px !important;
            height: 36px !important;
            min-height: 36px !important;
            max-height: 38px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            box-sizing: border-box !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          /* Upload preview box */
          .adm-content .uploaded-preview-box {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 10px !important;
          }
          .adm-content .preview-img-wrap {
            width: 100% !important;
            max-width: 100% !important;
            height: 120px !important;
          }
          .adm-content .preview-actions {
            flex-wrap: wrap !important;
            width: 100% !important;
            gap: 6px !important;
          }
          .adm-content .preview-actions button {
            flex: 1 1 auto !important;
          }

          /* Dropdown popover */
          .adm-content .icon-dropdown-popover {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            left: 0 !important;
            right: 0 !important;
          }

        }

        /* ── Extra Small Mobile Phones (iPhone SE, 320px - 420px) ── */
        @media (max-width: 480px) {
          .adm-content {
            padding: 8px 6px !important;
          }
          .adm-topbar {
            padding: 0 8px !important;
            height: 52px !important;
          }
          .adm-page-title {
            font-size: 0.88rem !important;
            max-width: 140px !important;
          }
          .adm-avatar {
            width: 24px !important;
            height: 24px !important;
            font-size: 0.65rem !important;
          }
          .adm-content .adm-card-panel,
          .adm-content .card-item,
          .adm-content .dash-welcome,
          .adm-content .dash-card,
          .adm-content div[style*="borderRadius: 16"],
          .adm-content div[style*="borderRadius: 14"],
          .adm-content div[style*="borderRadius: 12"] {
            padding: 10px 8px !important;
            margin-bottom: 10px !important;
          }
          .adm-content button,
          .adm-content .btn,
          .adm-content .btn-red,
          .adm-content .btn-secondary,
          .adm-content .tab-btn {
            font-size: 0.76rem !important;
            padding: 6px 10px !important;
            min-height: 30px !important;
          }
        }
      `}</style>

      <div className="adm-wrap">
        {/* Mobile Backdrop Overlay */}
        <div
          className={`adm-overlay${mobileOpen ? " show" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className={`adm-sidebar${sidebarOpen ? "" : " collapsed"}${mobileOpen ? " mob-open" : ""}`}>
          {/* Header */}
          <div className="adm-sidebar-head">
            <Link to="/admin/dashboard" className="adm-logo-box" title="ALERT NGO Dashboard" onClick={() => setMobileOpen(false)}>
              <img
                src="/admin-logo.png"
                alt="ALERT NGO"
                className="adm-logo-img"
              />
            </Link>
            {(sidebarOpen || mobileOpen) && (
              <div className="adm-brand">
                <div className="adm-brand-name">ALERT NGO</div>
                <div className="adm-brand-sub">ADMIN PANEL</div>
              </div>
            )}

            {/* Mobile close button */}
            <button
              className="adm-mob-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar menu"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="adm-nav" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              if (item.soon) {
                return (
                  <div key={item.path} className="adm-nav-item soon" title={item.label}>
                    <Icon className="adm-nav-icon" />
                    {(sidebarOpen || mobileOpen) && <><span className="adm-nav-label">{item.label}</span><span className="adm-soon-tag">SOON</span></>}
                  </div>
                );
              }

              const hasSub = item.subItems && item.subItems.length > 0;
              const isSectionOpen = (sidebarOpen || mobileOpen) && (isActive || location.pathname.startsWith(item.path));

              return (
                <div key={item.path} style={{ display: "flex", flexDirection: "column" }}>
                  <Link
                    to={item.path}
                    className={`adm-nav-item${isActive ? " active" : ""}`}
                    title={!sidebarOpen && !mobileOpen ? item.label : ""}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="adm-nav-icon" />
                    {(sidebarOpen || mobileOpen) && <span className="adm-nav-label">{item.label}</span>}
                  </Link>

                  {/* Expandable Submenu */}
                  {hasSub && isSectionOpen && (
                    <div
                      style={{
                        paddingLeft: 34,
                        paddingTop: 3,
                        paddingBottom: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                      }}
                    >
                      {item.subItems.map((sub) => {
                        const currentFull = location.pathname + location.search;
                        const isSubActive =
                          currentFull === sub.path ||
                          (location.pathname === item.path && !location.search && sub.path.includes("flood-relief-measures")) ||
                          (location.pathname === item.path && !location.search && sub.path.includes("rofr") && !sub.path.includes("abstract"));
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileOpen(false)}
                            style={{
                              color: isSubActive ? "#ff6b6b" : "#8892a4",
                              fontSize: "0.78rem",
                              fontWeight: isSubActive ? 700 : 500,
                              textDecoration: "none",
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: isSubActive ? "rgba(192,57,43,.15)" : "transparent",
                              transition: "all 0.15s ease",
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                          >
                            • {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer Actions: Change Password & Logout */}
          <div className="adm-sidebar-foot">
            <button
              className="adm-foot-btn adm-change-pwd-btn"
              onClick={() => {
                setMobileOpen(false);
                setShowPwdModal(true);
              }}
              title="Change Admin Password"
            >
              <FaKey size={14} style={{ color: "#38bdf8", flexShrink: 0 }} />
              {(sidebarOpen || mobileOpen) && <span>Change Password</span>}
            </button>
            <button className="adm-foot-btn adm-logout" onClick={() => { setMobileOpen(false); logout(); }} title="Logout">
              <FaSignOutAlt size={14} style={{ flexShrink: 0 }} />
              {(sidebarOpen || mobileOpen) && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="adm-main">
          {/* Topbar */}
          <header className="adm-topbar">
            <div className="adm-topbar-left" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <button
                className="adm-mob-toggle"
                onClick={() => setMobileOpen(prev => !prev)}
                aria-label="Toggle navigation menu"
              >
                <FaBars size={18} />
              </button>
              <h1 className="adm-page-title">{title}</h1>
            </div>
            <div className="adm-user-chip">
              <div className="adm-avatar">A</div>
              <span className="adm-uname">alertngo@vone</span>
            </div>
          </header>

          {/* Page content */}
          <div className="adm-content">
            {children}
          </div>
        </div>
      </div>

      {/* ── CHANGE PASSWORD MODAL ── */}
      {showPwdModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            boxSizing: "border-box"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPwdModal(false);
          }}
        >
          <div
            style={{
              background: "#141820",
              border: "1px solid #1e2436",
              borderRadius: 14,
              padding: "22px 20px",
              width: "100%",
              maxWidth: "min(380px, 94vw)",
              boxSizing: "border-box",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
                  <FaKey size={15} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#fff" }}>Change Password</h3>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#94a3b8" }}>Update admin access credential</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPwdModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4, display: "flex" }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {pwdError && (
              <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "8px 12px", borderRadius: 8, fontSize: "0.76rem", marginBottom: 12 }}>
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", padding: "8px 12px", borderRadius: 8, fontSize: "0.76rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <FaCheck size={12} /> {pwdSuccess}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 5 }}>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={pwdShowOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    style={{ width: "100%", height: 36, padding: "0 34px 0 10px", background: "#0b0f17", border: "1px solid #1e2436", borderRadius: 7, color: "#fff", fontSize: "0.82rem", boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => setPwdShowOld(!pwdShowOld)}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}
                  >
                    {pwdShowOld ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 5 }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={pwdShowNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    style={{ width: "100%", height: 36, padding: "0 34px 0 10px", background: "#0b0f17", border: "1px solid #1e2436", borderRadius: 7, color: "#fff", fontSize: "0.82rem", boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => setPwdShowNew(!pwdShowNew)}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}
                  >
                    {pwdShowNew ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#cbd5e1", marginBottom: 5 }}>Confirm New Password</label>
                <input
                  type={pwdShowNew ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-type new password"
                  style={{ width: "100%", height: 36, padding: "0 10px", background: "#0b0f17", border: "1px solid #1e2436", borderRadius: 7, color: "#fff", fontSize: "0.82rem", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  style={{
                    flex: 1,
                    height: 36,
                    background: "#c0392b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {pwdLoading ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPwdModal(false)}
                  style={{
                    height: 36,
                    padding: "0 14px",
                    background: "#1e2436",
                    color: "#cbd5e1",
                    border: "1px solid #2a3148",
                    borderRadius: 7,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
