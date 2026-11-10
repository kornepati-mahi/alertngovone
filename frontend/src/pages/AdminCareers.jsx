import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaBriefcase, FaPlus, FaTrash, FaEdit, FaSave, FaExternalLinkAlt,
  FaCheckCircle, FaExclamationTriangle, FaSyncAlt, FaEye, FaEyeSlash,
  FaMapMarkerAlt, FaShieldAlt, FaUsers, FaGraduationCap, FaHeart,
  FaVideo, FaImages, FaFilePdf, FaCloudUploadAlt, FaLink, FaEnvelope,
  FaTimes, FaSearch, FaCheck, FaTree, FaBalanceScale, FaPaperclip,
  FaInbox, FaPhone, FaUser, FaDownload, FaCommentDots
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import { resolveUploadUrl } from "../utils/resolveUploadUrl";
import {
  adminGetCareers,
  adminSaveCareerPage,
  adminSaveCareerOpening,
  adminDeleteCareerOpening,
  adminToggleCareerOpening,
  adminSaveCareerMedia,
  adminDeleteCareerMedia,
  adminToggleCareerMedia,
  adminSeedCareers,
  adminUploadImage,
  adminUploadVideo,
  adminGetCareerLeads,
  adminUpdateCareerLead,
  adminDeleteCareerLead,
  API_BASE
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

const AVAILABLE_ICONS = [
  { name: "FaBriefcase", label: "Briefcase", icon: FaBriefcase },
  { name: "FaMapMarkerAlt", label: "Location", icon: FaMapMarkerAlt },
  { name: "FaShieldAlt", label: "Legal / Shield", icon: FaShieldAlt },
  { name: "FaUsers", label: "Community / Users", icon: FaUsers },
  { name: "FaGraduationCap", label: "Education / Cap", icon: FaGraduationCap },
  { name: "FaHeart", label: "Heart / Care", icon: FaHeart },
  { name: "FaTree", label: "Forest / Nature", icon: FaTree },
  { name: "FaBalanceScale", label: "Rights / Scale", icon: FaBalanceScale }
];

function renderIconByName(name, size = 16) {
  switch (name) {
    case "FaMapMarkerAlt": return <FaMapMarkerAlt size={size} />;
    case "FaShieldAlt": return <FaShieldAlt size={size} />;
    case "FaUsers": return <FaUsers size={size} />;
    case "FaGraduationCap": return <FaGraduationCap size={size} />;
    case "FaHeart": return <FaHeart size={size} />;
    case "FaTree": return <FaTree size={size} />;
    case "FaBalanceScale": return <FaBalanceScale size={size} />;
    case "FaBriefcase":
    default:
      return <FaBriefcase size={size} />;
  }
}

export default function AdminCareers() {
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState("openings"); // openings | pathways | process | page_intro | media | cta

  // Data states
  const [pageData, setPageData] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_page");
      if (local) return JSON.parse(local);
    } catch (e) {}
    return {
      badge: "Section 01",
      title: "Working With ALERT",
      subtitle: "",
      intro_p1: "",
      intro_p2: "",
      hero_media_type: "image",
      hero_media_url: "",
      hero_poster: "",
      apply_email: "contact@alertngo.in",
      partner_btn_text: "Partner With Us",
      partner_btn_url: "/partner",
      openings_badge: "Section 02",
      openings_title: "Roles We Recruit For",
      openings_subtitle: "",
      pathways_badge: "Section 03",
      pathways_title: "Internships & Volunteer Pathways",
      pathways_subtitle: "",
      steps_badge: "Section 04",
      steps_title: "How To Apply",
      steps_subtitle: "",
      values_title: "What you can expect from us",
      cta_badge: "Careers",
      cta_title: "Do Work That Reaches the Last Hamlet",
      cta_subtitle: "",
      cta_email_subject: "Profile for ALERT talent pool",
      cta_contact_url: "/contact"
    };
  });

  const [openings, setOpenings] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_openings");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [mediaList, setMediaList] = useState([]);
  const [pathways, setPathways] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_pathways");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const pageLocal = localStorage.getItem("alertngo_careers_page");
      if (pageLocal) {
        const pObj = JSON.parse(pageLocal);
        const pw = typeof pObj.pathways_json === "string" ? JSON.parse(pObj.pathways_json) : pObj.pathways_json;
        if (Array.isArray(pw) && pw.length > 0) return pw;
      }
    } catch (e) {}
    return [];
  });
  const [steps, setSteps] = useState([]);
  const [values, setValues] = useState([]);
  const [trustStrip, setTrustStrip] = useState([]);

  // Careers Leads (Applications & Inquiries)
  const [leads, setLeads] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_career_leads");
      if (local) return JSON.parse(local);
    } catch (e) {}
    return [];
  });
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadNotesInput, setLeadNotesInput] = useState("");
  const [leadStatusInput, setLeadStatusInput] = useState("New");

  // Dynamic Pathway & Role Options in Form Dropdown
  const [formOptions, setFormOptions] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_careers_form_options");
      if (local) return JSON.parse(local);
    } catch (e) {}
    return [
      "Field Volunteering",
      "Research Internships",
      "Skilled Pro-Bono Support",
      "General Volunteer / Talent Pool",
      "Pro-Bono Legal / Research Support"
    ];
  });
  const [newOptionInput, setNewOptionInput] = useState("");

  const handleAddFormOption = (e) => {
    e.preventDefault();
    if (!newOptionInput.trim()) return;
    const trimmed = newOptionInput.trim();
    if (formOptions.includes(trimmed)) {
      showToast("This option is already in the list", "error");
      return;
    }
    const nextOptions = [...formOptions, trimmed];
    setFormOptions(nextOptions);
    setNewOptionInput("");
    try {
      localStorage.setItem("alertngo_careers_form_options", JSON.stringify(nextOptions));
      window.dispatchEvent(new Event("alertngo_careers_form_options_updated"));
    } catch (err) {}
    showToast(`Added "${trimmed}" to application form dropdown!`);
  };

  const handleDeleteFormOption = (opt) => {
    const nextOptions = formOptions.filter((o) => o !== opt);
    setFormOptions(nextOptions);
    try {
      localStorage.setItem("alertngo_careers_form_options", JSON.stringify(nextOptions));
      window.dispatchEvent(new Event("alertngo_careers_form_options_updated"));
    } catch (err) {}
    showToast(`Removed "${opt}" from application form dropdown`);
  };

  // Search & Filter
  const [search, setSearch] = useState("");

  // Opening Modal State
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [editingOpeningId, setEditingOpeningId] = useState(null);
  const [openingForm, setOpeningForm] = useState({
    role: "",
    type: "Full-time",
    place: "Vijayawada HQ",
    icon: "FaBriefcase",
    about: "",
    fit: "",
    apply_link: "",
    apply_email: "contact@alertngo.in",
    media_type: "none",
    media_url: "",
    jd_file: "",
    link_url: "/contact",
    sort_order: 0,
    is_active: 1
  });

  // Pathway Modal State
  const [showPathwayModal, setShowPathwayModal] = useState(false);
  const [editingPathwayIdx, setEditingPathwayIdx] = useState(null);
  const [pathwayForm, setPathwayForm] = useState({
    title: "",
    who: "",
    body: "",
    link_url: "/contact",
    is_active: 1
  });

  // Media Modal State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [mediaForm, setMediaForm] = useState({
    title: "",
    type: "image",
    url: "",
    poster: "",
    tag: "Field Team",
    description: "",
    link_url: "/careers",
    sort_order: 0,
    is_active: 1
  });

  // Delete & Confirmation Modals
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'opening'|'media'|'pathway', id/index, label }
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Status flags
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // File Inputs
  const heroMediaInputRef = useRef(null);
  const openingMediaInputRef = useRef(null);
  const openingJdInputRef = useRef(null);
  const mediaFileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showOpeningModal || showPathwayModal || showMediaModal || deleteTarget || showSyncModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showOpeningModal, showPathwayModal, showMediaModal, deleteTarget, showSyncModal]);

  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
    loadData(key);

    const handleLeadsUpdated = () => {
      try {
        const local = localStorage.getItem("alertngo_career_leads");
        if (local) setLeads(JSON.parse(local));
      } catch (e) {}
    };
    window.addEventListener("alertngo_career_leads_updated", handleLeadsUpdated);
    return () => window.removeEventListener("alertngo_career_leads_updated", handleLeadsUpdated);
  }, []);

  const loadData = async (key = adminKey) => {
    setLoading(true);
    try {
      const res = await adminGetCareers(key);
      if (res && res.success) {
        if (res.page) {
          setPageData(res.page);
          try {
            const pw = typeof res.page.pathways_json === "string" ? JSON.parse(res.page.pathways_json || "[]") : (res.page.pathways_json || []);
            setPathways(pw);
            localStorage.setItem("alertngo_careers_pathways", JSON.stringify(pw));
          } catch (e) { setPathways([]); }
          try {
            setSteps(typeof res.page.steps_json === "string" ? JSON.parse(res.page.steps_json || "[]") : (res.page.steps_json || []));
          } catch (e) { setSteps([]); }
          try {
            setValues(typeof res.page.values_json === "string" ? JSON.parse(res.page.values_json || "[]") : (res.page.values_json || []));
          } catch (e) { setValues([]); }
          try {
            setTrustStrip(typeof res.page.trust_strip_json === "string" ? JSON.parse(res.page.trust_strip_json || "[]") : (res.page.trust_strip_json || []));
          } catch (e) { setTrustStrip([]); }

          localStorage.setItem("alertngo_careers_page", JSON.stringify(res.page));
        }
        if (Array.isArray(res.openings)) {
          setOpenings(res.openings);
          localStorage.setItem("alertngo_careers_openings", JSON.stringify(res.openings));
        }
        setMediaList(res.media || []);
        window.dispatchEvent(new Event("alertngo_careers_updated"));
      } else {
        showToast(res?.message || "Loaded local careers cache");
      }
    } catch (err) {
      console.warn("Using local careers cache:", err);
    }

    try {
      const leadsRes = await adminGetCareerLeads(key);
      if (leadsRes && leadsRes.success && Array.isArray(leadsRes.leads)) {
        setLeads(leadsRes.leads);
        localStorage.setItem("alertngo_career_leads", JSON.stringify(leadsRes.leads));
      }
    } catch (err) {
      console.warn("Using local leads cache:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── FILE UPLOAD HANDLERS ──────────────────────────────────────────────────
  const handleFileUpload = async (e, type, targetSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let res;
      if (type === "video") {
        res = await adminUploadVideo(adminKey, file, "careers", (pct) => {
          const val = typeof pct === "object" && pct !== null ? (pct.percent ?? 0) : (Number(pct) || 0);
          setUploadProgress(val);
        });
      } else {
        res = await adminUploadImage(adminKey, file, "careers");
      }

      if (res && res.success && res.url) {
        targetSetter(res.url);
        showToast("File uploaded successfully!");
      } else {
        showToast(res?.message || "Upload failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("File upload error", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  // ── SAVE PAGE SETTINGS ────────────────────────────────────────────────────
  const handleSavePageSettings = async (customPayload = null) => {
    setIsSaving(true);
    const payload = customPayload || {
      ...pageData,
      pathways_json: pathways,
      steps_json: steps,
      values_json: values,
      trust_strip_json: trustStrip
    };

    // Update local cache and dispatch event for immediate public frontend reflection
    try {
      localStorage.setItem("alertngo_careers_page", JSON.stringify(payload));
      localStorage.setItem("alertngo_careers_pathways", JSON.stringify(payload.pathways_json || pathways));
      window.dispatchEvent(new Event("alertngo_careers_updated"));
    } catch (e) {}

    try {
      const res = await adminSaveCareerPage(adminKey, payload);
      if (res && res.success) {
        showToast("Page content saved successfully!");
        loadData();
      } else {
        showToast("Page content saved locally!");
      }
    } catch (err) {
      console.error(err);
      showToast("Page content saved locally (offline mode)");
    } finally {
      setIsSaving(false);
    }
  };

  // ── OPENING CRUD HANDLERS ─────────────────────────────────────────────────
  const openCreateOpeningModal = () => {
    setEditingOpeningId(null);
    setOpeningForm({
      role: "",
      type: "Full-time",
      place: "Vijayawada HQ",
      icon: "FaBriefcase",
      about: "",
      fit: "",
      apply_link: "",
      apply_email: pageData.apply_email || "contact@alertngo.in",
      media_type: "none",
      media_url: "",
      jd_file: "",
      link_url: "/contact",
      sort_order: openings.length + 1,
      is_active: 1
    });
    setShowOpeningModal(true);
  };

  const openEditOpeningModal = (item) => {
    setEditingOpeningId(item.id);
    setOpeningForm({
      id: item.id,
      role: item.role || "",
      type: item.type || "Full-time",
      place: item.place || "",
      icon: item.icon || "FaBriefcase",
      about: item.about || "",
      fit: item.fit || "",
      apply_link: item.apply_link || "",
      apply_email: item.apply_email || "contact@alertngo.in",
      media_type: item.media_type || "none",
      media_url: item.media_url || "",
      jd_file: item.jd_file || "",
      link_url: item.link_url || "/contact",
      sort_order: item.sort_order ?? 0,
      is_active: Number(item.is_active) !== 0 ? 1 : 0
    });
    setShowOpeningModal(true);
  };

  const handleSaveOpening = async (e) => {
    e.preventDefault();
    if (!openingForm.role.trim()) {
      showToast("Role title is required", "error");
      return;
    }
    setIsSaving(true);
    let nextOpenings = [...openings];
    if (editingOpeningId) {
      nextOpenings = nextOpenings.map(o => o.id === editingOpeningId ? { ...o, ...openingForm } : o);
    } else {
      nextOpenings.push({ ...openingForm, id: Date.now() });
    }
    setOpenings(nextOpenings);
    try {
      localStorage.setItem("alertngo_careers_openings", JSON.stringify(nextOpenings));
      window.dispatchEvent(new Event("alertngo_careers_updated"));
    } catch (e) {}

    try {
      const res = await adminSaveCareerOpening(adminKey, openingForm);
      if (res && res.success) {
        showToast(editingOpeningId ? "Job opening updated!" : "New job opening created!");
        setShowOpeningModal(false);
        loadData();
      } else {
        showToast(editingOpeningId ? "Job opening updated locally!" : "New job opening saved locally!");
        setShowOpeningModal(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Saved locally (offline mode)");
      setShowOpeningModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleOpeningActive = async (id, currentActive) => {
    const nextOpenings = openings.map((o) =>
      o.id === id ? { ...o, is_active: currentActive ? 0 : 1 } : o
    );
    setOpenings(nextOpenings);
    try {
      localStorage.setItem("alertngo_careers_openings", JSON.stringify(nextOpenings));
      window.dispatchEvent(new Event("alertngo_careers_updated"));
    } catch (e) {}

    try {
      const res = await adminToggleCareerOpening(adminKey, id, currentActive ? 0 : 1);
      if (res && res.success) {
        showToast(currentActive ? "Role hidden from public view" : "Role published live!");
      }
    } catch (err) {
      showToast(currentActive ? "Role hidden locally" : "Role published locally");
    }
  };

  // ── PATHWAY CRUD HANDLERS ─────────────────────────────────────────────────
  const openCreatePathwayModal = () => {
    setEditingPathwayIdx(null);
    setPathwayForm({
      title: "",
      who: "",
      body: "",
      link_url: "/contact",
      is_active: 1
    });
    setShowPathwayModal(true);
  };

  const openEditPathwayModal = (idx) => {
    setEditingPathwayIdx(idx);
    setPathwayForm({ ...pathways[idx] });
    setShowPathwayModal(true);
  };

  const handleSavePathway = async (e) => {
    e.preventDefault();
    if (!pathwayForm.title.trim()) {
      showToast("Pathway title is required", "error");
      return;
    }
    let updated;
    if (editingPathwayIdx !== null) {
      updated = pathways.map((p, i) => (i === editingPathwayIdx ? pathwayForm : p));
    } else {
      updated = [...pathways, { ...pathwayForm, id: `pw_${Date.now()}` }];
    }
    setPathways(updated);
    setShowPathwayModal(false);
    await handleSavePageSettings({
      ...pageData,
      pathways_json: updated,
      steps_json: steps,
      values_json: values,
      trust_strip_json: trustStrip
    });
  };

  const handleDeletePathway = async (idx) => {
    const updated = pathways.filter((_, i) => i !== idx);
    setPathways(updated);
    setDeleteTarget(null);
    await handleSavePageSettings({
      ...pageData,
      pathways_json: updated,
      steps_json: steps,
      values_json: values,
      trust_strip_json: trustStrip
    });
  };

  // ── MEDIA ATTACHMENTS CRUD HANDLERS ───────────────────────────────────────
  const openCreateMediaModal = (defaultType = "image") => {
    setEditingMediaId(null);
    setMediaForm({
      title: "",
      type: defaultType,
      url: "",
      poster: "",
      tag: "Field Team",
      description: "",
      link_url: "/careers",
      sort_order: mediaList.length + 1,
      is_active: 1
    });
    setShowMediaModal(true);
  };

  const openEditMediaModal = (item) => {
    setEditingMediaId(item.id);
    setMediaForm({
      id: item.id,
      title: item.title || "",
      type: item.type || "image",
      url: item.url || "",
      poster: item.poster || "",
      tag: item.tag || "Field Team",
      description: item.description || "",
      link_url: item.link_url || "/careers",
      sort_order: item.sort_order ?? 0,
      is_active: Number(item.is_active) !== 0 ? 1 : 0
    });
    setShowMediaModal(true);
  };

  const handleSaveMedia = async (e) => {
    e.preventDefault();
    if (!mediaForm.title.trim() || !mediaForm.url.trim()) {
      showToast("Media title and file/link URL are required", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await adminSaveCareerMedia(adminKey, mediaForm);
      if (res && res.success) {
        showToast(editingMediaId ? "Media item updated!" : "New media item added!");
        setShowMediaModal(false);
        loadData();
      } else {
        showToast(res?.message || "Failed to save media", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving media item", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMediaActive = async (id, currentActive) => {
    try {
      const res = await adminToggleCareerMedia(adminKey, id, currentActive ? 0 : 1);
      if (res && res.success) {
        setMediaList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, is_active: currentActive ? 0 : 1 } : m))
        );
        showToast(currentActive ? "Media hidden" : "Media published!");
      }
    } catch (err) {
      showToast("Error updating media status", "error");
    }
  };

  // ── CONFIRM DELETE HANDLER ────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      if (deleteTarget.type === "opening") {
        const nextOpenings = openings.filter((o) => o.id !== deleteTarget.id);
        setOpenings(nextOpenings);
        try {
          localStorage.setItem("alertngo_careers_openings", JSON.stringify(nextOpenings));
          window.dispatchEvent(new Event("alertngo_careers_updated"));
        } catch (e) {}
        const res = await adminDeleteCareerOpening(adminKey, deleteTarget.id);
        if (res && res.success) {
          showToast("Job opening permanently deleted");
          setDeleteTarget(null);
          loadData();
        } else {
          showToast("Job opening deleted locally!");
          setDeleteTarget(null);
        }
      } else if (deleteTarget.type === "media") {
        const res = await adminDeleteCareerMedia(adminKey, deleteTarget.id);
        if (res && res.success) {
          showToast("Media item deleted");
          setDeleteTarget(null);
          loadData();
        } else {
          showToast(res?.message || "Failed to delete media item", "error");
        }
      } else if (deleteTarget.type === "pathway") {
        handleDeletePathway(deleteTarget.index);
      }
    } catch (err) {
      console.error(err);
      showToast("Error executing deletion", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── RESTORE FACTORY DEFAULTS ──────────────────────────────────────────────
  const handleRestoreDefaults = async () => {
    setIsSyncing(true);
    try {
      const res = await adminSeedCareers(adminKey);
      if (res && res.success) {
        showToast("Careers page and all vacancies restored to defaults!");
        setShowSyncModal(false);
        loadData();
      } else {
        showToast(res?.message || "Failed to restore defaults", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error restoring defaults", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // ── CAREERS LEADS HANDLERS ────────────────────────────────────────────────
  const handleOpenLeadModal = (lead) => {
    setSelectedLead(lead);
    setLeadStatusInput(lead.status || "New");
    setLeadNotesInput(lead.admin_notes || "");
  };

  const handleSaveLeadReview = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    const updatedLead = {
      ...selectedLead,
      status: leadStatusInput,
      admin_notes: leadNotesInput
    };
    const nextLeads = leads.map(l => l.id === selectedLead.id ? updatedLead : l);
    setLeads(nextLeads);
    try {
      localStorage.setItem("alertngo_career_leads", JSON.stringify(nextLeads));
      window.dispatchEvent(new Event("alertngo_career_leads_updated"));
    } catch (e) {}

    try {
      await adminUpdateCareerLead(adminKey, selectedLead.id, leadStatusInput, leadNotesInput);
      showToast("Application review and status updated!");
    } catch (err) {
      showToast("Review saved locally");
    }
    setSelectedLead(null);
  };

  const handleDeleteLeadItem = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this applicant record?")) return;
    const nextLeads = leads.filter(l => l.id !== id);
    setLeads(nextLeads);
    try {
      localStorage.setItem("alertngo_career_leads", JSON.stringify(nextLeads));
      window.dispatchEvent(new Event("alertngo_career_leads_updated"));
    } catch (e) {}

    try {
      await adminDeleteCareerLead(adminKey, id);
      showToast("Applicant lead deleted");
    } catch (err) {
      showToast("Deleted locally");
    }
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(null);
    }
  };

  const handleExportLeadsCSV = () => {
    if (leads.length === 0) {
      showToast("No leads to export", "error");
      return;
    }
    const headers = ["ID", "Name", "Email", "Phone", "Interest / Role", "Background", "Statement of Interest", "Referees", "Resume URL", "Status", "Admin Notes", "Date"];
    const rows = leads.map(l => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.interest_type || "").replace(/"/g, '""')}"`,
      `"${(l.background || "").replace(/"/g, '""')}"`,
      `"${(l.note || "").replace(/"/g, '""')}"`,
      `"${(l.referees || "").replace(/"/g, '""')}"`,
      `"${(l.resume_url || "").replace(/"/g, '""')}"`,
      `"${(l.status || "New").replace(/"/g, '""')}"`,
      `"${(l.admin_notes || "").replace(/"/g, '""')}"`,
      `"${(l.created_at || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alertngo_careers_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Careers leads exported to CSV!");
  };

  const filteredLeads = leads.filter((l) => {
    const matchStatus = leadStatusFilter === "all" || (l.status || "New").toLowerCase() === leadStatusFilter.toLowerCase();
    if (!matchStatus) return false;
    if (!leadSearch.trim()) return true;
    const q = leadSearch.toLowerCase();
    return (
      (l.name || "").toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q) ||
      (l.phone || "").toLowerCase().includes(q) ||
      (l.interest_type || "").toLowerCase().includes(q) ||
      (l.background || "").toLowerCase().includes(q) ||
      (l.note || "").toLowerCase().includes(q)
    );
  });

  // Filtered Openings
  const filteredOpenings = openings.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.role || "").toLowerCase().includes(q) ||
      (o.place || "").toLowerCase().includes(q) ||
      (o.type || "").toLowerCase().includes(q) ||
      (o.about || "").toLowerCase().includes(q) ||
      (o.fit || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Careers & Recruitment">
      <style>{`
        .adm-modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .adm-modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .adm-career-status-pill {
          white-space: nowrap;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .adm-media-input-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 10px;
          align-items: center;
        }
        .adm-media-upload-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .adm-careers-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 18px !important;
          }
          .adm-careers-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-careers-actions > * {
            width: 100% !important;
            padding: 8px 10px !important;
            font-size: 0.78rem !important;
            text-align: center !important;
            justify-content: center !important;
            height: 38px !important;
            min-height: 38px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .adm-careers-actions > a:first-child {
            grid-column: 1 / -1 !important;
          }
          .adm-careers-metrics {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
          }
          .adm-careers-metrics > div {
            padding: 10px 12px !important;
            border-radius: 10px !important;
          }
          .adm-careers-metrics > div > div:nth-child(2) {
            font-size: 1.35rem !important;
            margin-top: 4px !important;
          }
          .adm-careers-metrics > div > div:nth-child(3) {
            font-size: 0.7rem !important;
            line-height: 1.2 !important;
            margin-top: 2px !important;
          }
          .adm-careers-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            width: 100% !important;
          }
          .adm-careers-tabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.8rem !important;
            padding: 8px 12px !important;
          }
          .adm-careers-search {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .adm-careers-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-careers-modal {
            max-width: calc(100vw - 10px) !important;
            width: calc(100vw - 10px) !important;
            padding: 14px 10px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
          }
          .adm-careers-modal * {
            box-sizing: border-box !important;
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
          .adm-careers-card {
            padding: 14px 12px !important;
          }
          .adm-career-status-pill {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-width: 56px !important;
            height: 24px !important;
            line-height: 1 !important;
            text-align: center !important;
            box-sizing: border-box !important;
          }
          .adm-career-card-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .adm-career-card-actions-left {
            display: contents !important;
          }
          .adm-career-card-actions button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 8px 6px !important;
            font-size: 0.74rem !important;
            height: 36px !important;
            min-height: 36px !important;
            white-space: nowrap !important;
            box-sizing: border-box !important;
          }
          .adm-media-input-row {
            grid-template-columns: 1fr !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-media-input-row > * {
            width: 100% !important;
          }
          .adm-media-upload-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-media-upload-row input[type="text"],
          .adm-media-upload-row button {
            width: 100% !important;
          }
          .adm-careers-modal input,
          .adm-careers-modal select,
          .adm-careers-modal textarea {
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
      <div style={{ width: "100%", boxSizing: "border-box", color: "#f8fafc" }}>
        
        {/* Toast Alert */}
        {toast.show && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 99999,
              padding: "12px 20px",
              borderRadius: 10,
              background: toast.type === "error" ? "#dc2626" : "#059669",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "fadeIn 0.2s ease"
            }}
          >
            {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* TOP VIEW TAB SWITCHER */}
        <div className="adm-careers-tabs" style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1f2937", paddingBottom: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => setViewTab("openings")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "openings" ? "#10b981" : "#1f2937",
              background: viewTab === "openings" ? "rgba(16, 185, 129, 0.2)" : "#111827",
              color: viewTab === "openings" ? "#34d399" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaBriefcase size={15} /> 💼 Roles & Openings ({openings.length})
          </button>

          <button
            onClick={() => setViewTab("pathways")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "pathways" ? "#0284c7" : "#1f2937",
              background: viewTab === "pathways" ? "rgba(2, 132, 199, 0.2)" : "#111827",
              color: viewTab === "pathways" ? "#38bdf8" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaUsers size={15} /> 🎓 Volunteer & Intern Pathways ({pathways.length})
          </button>

          <button
            onClick={() => setViewTab("process")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "process" ? "#f59e0b" : "#1f2937",
              background: viewTab === "process" ? "rgba(245, 158, 11, 0.2)" : "#111827",
              color: viewTab === "process" ? "#fbbf24" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaShieldAlt size={15} /> 📋 Application Steps & Values
          </button>

          <button
            onClick={() => setViewTab("page_intro")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "page_intro" ? "#8b5cf6" : "#1f2937",
              background: viewTab === "page_intro" ? "rgba(139, 92, 246, 0.2)" : "#111827",
              color: viewTab === "page_intro" ? "#c4b5fd" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaImages size={15} /> 🖼️ Hero & Intro Multimedia
          </button>

          <button
            onClick={() => setViewTab("media")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "media" ? "#ec4899" : "#1f2937",
              background: viewTab === "media" ? "rgba(236, 72, 153, 0.2)" : "#111827",
              color: viewTab === "media" ? "#f472b6" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaVideo size={15} /> 🎬 Media & Documents ({mediaList.length})
          </button>

          <button
            onClick={() => setViewTab("cta")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "cta" ? "#ef4444" : "#1f2937",
              background: viewTab === "cta" ? "rgba(239, 68, 68, 0.2)" : "#111827",
              color: viewTab === "cta" ? "#fca5a5" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaHeart size={15} /> 📣 Call To Action Strip
          </button>

          <button
            onClick={() => setViewTab("leads")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: viewTab === "leads" ? "#10b981" : "#1f2937",
              background: viewTab === "leads" ? "rgba(16, 185, 129, 0.2)" : "#111827",
              color: viewTab === "leads" ? "#34d399" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <FaInbox size={15} /> 📬 Careers Leads ({leads.length})
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: JOB OPENINGS & ROLES                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "openings" && (
          <div>
            {/* TOP BAR */}
            <div className="adm-careers-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <FaBriefcase size={12} /> Recruitment Manager
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Connected to MySQL table `careers_openings`
                  </span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
                  Careers & Job Openings
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Create, edit, toggle visibility, and attach images/videos/documents for public roles on{" "}
                  <Link to="/careers" target="_blank" style={{ color: "#38bdf8", textDecoration: "none" }}>
                    /careers#openings
                  </Link>.
                </p>
              </div>

              <div className="adm-careers-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  to="/careers"
                  target="_blank"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#cbd5e1", textDecoration: "none", fontSize: "0.86rem", fontWeight: 600 }}
                >
                  <FaExternalLinkAlt size={12} /> View Live /careers
                </Link>

                <button
                  onClick={() => setShowSyncModal(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", background: "rgba(100, 116, 139, 0.15)", border: "1px solid rgba(100, 116, 139, 0.3)", borderRadius: 8, color: "#cbd5e1", cursor: "pointer", fontSize: "0.86rem", fontWeight: 600 }}
                >
                  <FaSyncAlt size={12} /> Restore Defaults
                </button>

                <button
                  onClick={openCreateOpeningModal}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: "0.86rem", fontWeight: 700, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)" }}
                >
                  <FaPlus size={13} /> Add Job Opening
                </button>
              </div>
            </div>

            {/* METRICS ROW */}
            <div className="adm-careers-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Total Openings</span>
                  <FaBriefcase size={16} color="#34d399" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fff", marginTop: 8 }}>{openings.length}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Configured career vacancies</div>
              </div>

              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Active Published</span>
                  <FaCheckCircle size={16} color="#10b981" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#34d399", marginTop: 8 }}>
                  {openings.filter((o) => Number(o.is_active) !== 0).length}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Currently accepting applications</div>
              </div>

              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Hidden / Draft</span>
                  <FaEyeSlash size={16} color="#94a3b8" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#94a3b8", marginTop: 8 }}>
                  {openings.filter((o) => Number(o.is_active) === 0).length}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Temporarily closed / inactive</div>
              </div>

              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>With Video / Media</span>
                  <FaVideo size={16} color="#fb7185" />
                </div>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fb7185", marginTop: 8 }}>
                  {openings.filter((o) => o.media_type && o.media_type !== "none").length}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>Featuring visual media clips</div>
              </div>
            </div>

            {/* SEARCH BOX */}
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div className="adm-careers-search" style={{ position: "relative", minWidth: 0, width: "100%", maxWidth: 480 }}>
                <FaSearch size={13} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search openings by role, place, or qualifications..."
                  style={{ width: "100%", padding: "9px 14px 9px 36px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem", outline: "none" }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                Showing {filteredOpenings.length} of {openings.length} roles
              </div>
            </div>

            {/* OPENINGS CARDS GRID */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>Loading openings from database...</div>
              </div>
            ) : filteredOpenings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#111827", borderRadius: 12, border: "1px dashed #374151" }}>
                <FaBriefcase size={40} style={{ color: "#475569", marginBottom: 14 }} />
                <h3 style={{ fontSize: "1.1rem", color: "#f1f5f9", margin: "0 0 6px" }}>No job openings found</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 auto 16px", maxWidth: 420 }}>
                  No vacancies match your search filter or no openings have been added yet.
                </p>
                <button onClick={openCreateOpeningModal} style={{ padding: "8px 16px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>
                  + Add First Role
                </button>
              </div>
            ) : (
              <div className="adm-careers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 20 }}>
                {filteredOpenings.map((o) => {
                  const isActive = Number(o.is_active) !== 0;
                  return (
                    <div
                      key={o.id}
                      className="adm-careers-card"
                      style={{
                        background: "#111827",
                        border: "1px solid",
                        borderColor: isActive ? "#1f2937" : "#374151",
                        borderRadius: 14,
                        padding: 22,
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        opacity: isActive ? 1 : 0.65,
                        transition: "all 0.2s",
                        position: "relative"
                      }}
                    >
                      {/* CARD HEADER */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                          <span style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {renderIconByName(o.icon, 20)}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, wordBreak: "break-word" }}>
                              {o.role}
                            </h3>
                            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block", marginTop: 3 }}>
                              {o.type}
                            </span>
                          </div>
                        </div>

                        {/* STATUS PILL */}
                        <span className="adm-career-status-pill" style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: isActive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: isActive ? "#34d399" : "#fca5a5", whiteSpace: "nowrap", flexShrink: 0, alignSelf: "flex-start" }}>
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </div>

                      {/* LOCATION */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#94a3b8" }}>
                        <FaMapMarkerAlt size={12} color="#10b981" />
                        <span>{o.place}</span>
                      </div>

                      {/* ABOUT */}
                      <p style={{ margin: 0, fontSize: "0.86rem", color: "#cbd5e1", lineHeight: 1.6, flex: 1 }}>
                        {o.about}
                      </p>

                      {/* FIT / REQUIREMENTS */}
                      <div style={{ paddingTop: 10, borderTop: "1px dashed #1f2937", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5 }}>
                        <strong style={{ color: "#e2e8f0" }}>What fits:</strong> {o.fit}
                      </div>

                      {/* ATTACHED MEDIA OR JD TAGS */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {o.media_type && o.media_type !== "none" && o.media_url && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(251,113,133,0.15)", color: "#fb7185", padding: "3px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600 }}>
                            {o.media_type === "video" ? <FaVideo size={10} /> : <FaImages size={10} />}
                            {o.media_type.toUpperCase()} Attached
                          </span>
                        )}
                        {o.jd_file && (
                          <a href={o.jd_file} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(56,189,248,0.15)", color: "#38bdf8", padding: "3px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600, textDecoration: "none" }}>
                            <FaFilePdf size={10} /> PDF JD
                          </a>
                        )}
                      </div>

                      {/* ACTIONS BAR */}
                      <div className="adm-career-card-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1f2937", flexWrap: "wrap", gap: 8 }}>
                        <div className="adm-career-card-actions-left" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleToggleOpeningActive(o.id, isActive)}
                            style={{ padding: "6px 10px", background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)", border: "1px solid", borderColor: isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)", borderRadius: 6, color: isActive ? "#34d399" : "#fca5a5", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}
                          >
                            {isActive ? <FaEye size={11} /> : <FaEyeSlash size={11} />}
                            {isActive ? "Visible" : "Hidden"}
                          </button>

                          <button
                            onClick={() => openEditOpeningModal(o)}
                            style={{ padding: "6px 12px", background: "rgba(2, 132, 199, 0.15)", border: "1px solid rgba(2, 132, 199, 0.35)", borderRadius: 6, color: "#38bdf8", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}
                          >
                            <FaEdit size={11} /> Edit
                          </button>
                        </div>

                        <button
                          onClick={() => setDeleteTarget({ type: "opening", id: o.id, label: o.role })}
                          style={{ padding: "6px 10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: 6, color: "#f87171", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaTrash size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: VOLUNTEER & INTERNSHIP PATHWAYS                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "pathways" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(2, 132, 199, 0.15)", color: "#38bdf8", border: "1px solid rgba(2, 132, 199, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <FaUsers size={12} /> Pathways Manager
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Section 03: Internships & Volunteer Pathways
                  </span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff" }}>
                  Volunteer & Internship Pathways
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Manage non-paid student placements, research fellowships, and pro-bono expert support channels.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={openCreatePathwayModal}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "#0284c7", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: "0.86rem", fontWeight: 700 }}
                >
                  <FaPlus size={12} /> Add Pathway
                </button>
              </div>
            </div>

            {/* PATHWAYS LIST */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
              {pathways.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#111827",
                    border: "1px solid #1f2937",
                    borderTop: "3px solid #f59e0b",
                    borderRadius: 14,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                      {p.title}
                    </h3>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>#{idx + 1}</span>
                  </div>

                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {p.who}
                  </span>

                  <p style={{ margin: 0, fontSize: "0.86rem", color: "#cbd5e1", lineHeight: 1.6, flex: 1 }}>
                    {p.body}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1f2937" }}>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Link: {p.link_url || "/contact"}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEditPathwayModal(idx)}
                        style={{ padding: "5px 10px", background: "rgba(2, 132, 199, 0.15)", border: "1px solid rgba(2, 132, 199, 0.35)", borderRadius: 6, color: "#38bdf8", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700 }}
                      >
                        <FaEdit size={10} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "pathway", index: idx, label: p.title })}
                        style={{ padding: "5px 10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: 6, color: "#f87171", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700 }}
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FORM DROPDOWN CHANNELS & ROLES MANAGER */}
            <div style={{ marginTop: 32, background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: "24px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "3px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>
                      Live Application Form
                    </span>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                      "Pathway or Role of Interest *" Dropdown Options
                    </h3>
                  </div>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.84rem" }}>
                    Admin can add, remove, or customize dropdown options available on the public <code>/careers</code> application form anytime.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddFormOption} style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Type new pathway or role to add into form dropdown (e.g. Coastal Documentation Fellow)..."
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                  style={{ flex: "1 1 280px", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                />
                <button
                  type="submit"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  <FaPlus size={11} /> Add to Form Dropdown
                </button>
              </form>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {pathways.filter(p => p.is_active === undefined || Number(p.is_active) !== 0).map((p, pIdx) => (
                  <span key={`pw_badge_${pIdx}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(2, 132, 199, 0.15)", border: "1px solid rgba(2, 132, 199, 0.35)", borderRadius: 20, color: "#38bdf8", fontSize: "0.8rem", fontWeight: 600 }}>
                    🎓 {p.title} <span style={{ fontSize: "0.7rem", color: "#64748b" }}>(Pathway)</span>
                  </span>
                ))}
                {openings.filter(o => o.is_active === undefined || Number(o.is_active) !== 0).map((o, oIdx) => (
                  <span key={`op_badge_${oIdx}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", borderRadius: 20, color: "#34d399", fontSize: "0.8rem", fontWeight: 600 }}>
                    💼 {o.role} <span style={{ fontSize: "0.7rem", color: "#64748b" }}>({o.type})</span>
                  </span>
                ))}
                {formOptions
                  .filter(f => !pathways.some(p => p.title === f) && !openings.some(o => o.role === f))
                  .map((opt, fIdx) => (
                    <span key={`custom_badge_${fIdx}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.35)", borderRadius: 20, color: "#fbbf24", fontSize: "0.8rem", fontWeight: 600 }}>
                      🌟 {opt}
                      <button
                        type="button"
                        onClick={() => handleDeleteFormOption(opt)}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 0, marginLeft: 4, display: "flex", alignItems: "center" }}
                        title="Remove from dropdown"
                      >
                        <FaTimes size={11} />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 3: APPLICATION STEPS & VALUES                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "process" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* APPLICATION STEPS SECTION */}
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
                    Section 04: How To Apply (4 Steps)
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                    Define the step-by-step application guidance shown to applicants.
                  </p>
                </div>
                <button
                  onClick={() => handleSavePageSettings()}
                  disabled={isSaving}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  <FaSave /> {isSaving ? "Saving..." : "Save Steps"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                {steps.map((step, sIdx) => (
                  <div key={sIdx} style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <input
                        type="text"
                        value={step.n || ""}
                        onChange={(e) => {
                          const updated = [...steps];
                          updated[sIdx] = { ...updated[sIdx], n: e.target.value };
                          setSteps(updated);
                        }}
                        style={{ width: 44, padding: "5px 8px", background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#10b981", fontWeight: 800, fontSize: "1.1rem", textAlign: "center" }}
                      />
                      <input
                        type="text"
                        value={step.t || ""}
                        onChange={(e) => {
                          const updated = [...steps];
                          updated[sIdx] = { ...updated[sIdx], t: e.target.value };
                          setSteps(updated);
                        }}
                        placeholder="Step Title"
                        style={{ flex: 1, padding: "6px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: "0.88rem" }}
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={step.d || ""}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[sIdx] = { ...updated[sIdx], d: e.target.value };
                        setSteps(updated);
                      }}
                      placeholder="Step instructions..."
                      style={{ width: "100%", padding: "8px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#cbd5e1", fontSize: "0.82rem", lineHeight: 1.5, resize: "vertical", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* WORKPLACE STANDARDS & VALUES */}
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
                    Workplace Standards & Safeguarding Policies
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                    Bullet points under &quot;What you can expect from us&quot; (POSH Act, Child Protection, Professional Code).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setValues([...values, "New institutional policy or workplace standard"])}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#0284c7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.84rem" }}
                >
                  <FaPlus size={11} /> Add Standard
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {values.map((v, vIdx) => (
                  <div key={vIdx} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0b0f17", padding: "10px 14px", borderRadius: 8, border: "1px solid #1f2937" }}>
                    <FaCheckCircle color="#10b981" size={14} style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => {
                        const updated = [...values];
                        updated[vIdx] = e.target.value;
                        setValues(updated);
                      }}
                      style={{ flex: 1, background: "transparent", border: "none", color: "#f1f5f9", fontSize: "0.88rem", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setValues(values.filter((_, i) => i !== vIdx))}
                      style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 4 }}
                      title="Remove standard"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, textAlign: "right" }}>
                <button
                  onClick={() => handleSavePageSettings()}
                  disabled={isSaving}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 22px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  <FaSave /> {isSaving ? "Saving..." : "Save Standards"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 4: HERO & INTRO MULTIMEDIA                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "page_intro" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid #1f2937", paddingBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                  Hero Header & Section 01 Configuration
                </h2>
                <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                  Control the hero title, introductory paragraphs, apply email, and supporting photo or video.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSavePageSettings()}
                disabled={isSaving}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                <FaSave /> {isSaving ? "Saving Changes..." : "Save Intro Settings"}
              </button>
            </div>

            <div className="adm-modal-form-grid" style={{ display: "grid", gap: 24 }}>
              {/* LEFT COLUMN: TEXT CONTENT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Section 01 Badge</label>
                  <input
                    type="text"
                    value={pageData.badge || ""}
                    onChange={(e) => setPageData({ ...pageData, badge: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Section 01 Title</label>
                  <input
                    type="text"
                    value={pageData.title || ""}
                    onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Subtitle</label>
                  <textarea
                    rows={3}
                    value={pageData.subtitle || ""}
                    onChange={(e) => setPageData({ ...pageData, subtitle: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", lineHeight: 1.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Intro Paragraph 1</label>
                  <textarea
                    rows={4}
                    value={pageData.intro_p1 || ""}
                    onChange={(e) => setPageData({ ...pageData, intro_p1: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", lineHeight: 1.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Intro Paragraph 2</label>
                  <textarea
                    rows={3}
                    value={pageData.intro_p2 || ""}
                    onChange={(e) => setPageData({ ...pageData, intro_p2: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", lineHeight: 1.5 }}
                  />
                </div>

                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Apply Email</label>
                    <input
                      type="text"
                      value={pageData.apply_email || ""}
                      onChange={(e) => setPageData({ ...pageData, apply_email: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Partner Link URL</label>
                    <input
                      type="text"
                      value={pageData.partner_btn_url || ""}
                      onChange={(e) => setPageData({ ...pageData, partner_btn_url: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: HERO MEDIA PREVIEW & UPLOAD */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Hero Media Type</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setPageData({ ...pageData, hero_media_type: "image" })}
                      style={{
                        padding: "10px",
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor: pageData.hero_media_type === "image" ? "#0284c7" : "#1f2937",
                        background: pageData.hero_media_type === "image" ? "rgba(2, 132, 199, 0.2)" : "#0b0f17",
                        color: pageData.hero_media_type === "image" ? "#38bdf8" : "#94a3b8",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                      }}
                    >
                      <FaImages /> Image Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageData({ ...pageData, hero_media_type: "video" })}
                      style={{
                        padding: "10px",
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor: pageData.hero_media_type === "video" ? "#e11d48" : "#1f2937",
                        background: pageData.hero_media_type === "video" ? "rgba(225, 29, 72, 0.2)" : "#0b0f17",
                        color: pageData.hero_media_type === "video" ? "#fb7185" : "#94a3b8",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                      }}
                    >
                      <FaVideo /> Video / MP4
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Hero Media URL / File</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      value={pageData.hero_media_url || ""}
                      onChange={(e) => setPageData({ ...pageData, hero_media_url: e.target.value })}
                      placeholder="/uploads/... or https://..."
                      style={{ flex: 1, padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                    <input
                      type="file"
                      ref={heroMediaInputRef}
                      style={{ display: "none" }}
                      accept={pageData.hero_media_type === "video" ? "video/*" : "image/*"}
                      onChange={(e) => handleFileUpload(e, pageData.hero_media_type, (url) => setPageData((prev) => ({ ...prev, hero_media_url: url })))}
                    />
                    <button
                      type="button"
                      onClick={() => heroMediaInputRef.current?.click()}
                      disabled={isUploading}
                      style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <FaCloudUploadAlt /> Upload
                    </button>
                  </div>
                  {isUploading && (
                    <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#38bdf8" }}>
                      Uploading file: {typeof uploadProgress === "object" && uploadProgress !== null ? (uploadProgress.percent ?? 0) : uploadProgress}%
                    </div>
                  )}
                </div>

                {/* PREVIEW BOX */}
                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 12, height: 260, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {pageData.hero_media_url ? (
                    pageData.hero_media_type === "video" ? (
                      <video
                        src={resolveUploadUrl(pageData.hero_media_url)}
                        controls
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }}
                      />
                    ) : (
                      <img
                        src={resolveUploadUrl(pageData.hero_media_url)}
                        alt="Hero preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                        onError={(e) => {
                          if (!e.currentTarget.dataset.fallbackTried) {
                            e.currentTarget.dataset.fallbackTried = "1";
                            e.currentTarget.src = "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg";
                          }
                        }}
                      />
                    )
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "0.85rem" }}>No hero media selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 5: MEDIA & DOCUMENTS REPOSITORY                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "media" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(236, 72, 153, 0.15)", color: "#f472b6", border: "1px solid rgba(236, 72, 153, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <FaVideo size={12} /> Multimedia Showcase
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Connected to MySQL table `careers_media`
                  </span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff" }}>
                  Careers Videos, Photos & Documents
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Add orientation videos, community work reels, brochures, and application PDF documents for applicants.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => openCreateMediaModal("video")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "#e11d48", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: "0.86rem", fontWeight: 700 }}
                >
                  <FaVideo size={12} /> + Add Video
                </button>
                <button
                  onClick={() => openCreateMediaModal("image")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "#0284c7", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: "0.86rem", fontWeight: 700 }}
                >
                  <FaImages size={12} /> + Add Photo
                </button>
                <button
                  onClick={() => openCreateMediaModal("document")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: "0.86rem", fontWeight: 700 }}
                >
                  <FaFilePdf size={12} /> + Add Document
                </button>
              </div>
            </div>

            {/* MEDIA GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {mediaList.map((m) => {
                const isActive = Number(m.is_active) !== 0;
                return (
                  <div
                    key={m.id}
                    style={{
                      background: "#111827",
                      border: "1px solid #1f2937",
                      borderRadius: 14,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      opacity: isActive ? 1 : 0.65
                    }}
                  >
                    {/* PREVIEW CONTAINER */}
                    <div style={{ height: 180, background: "#000", position: "relative" }}>
                      {m.type === "video" ? (
                        <video src={m.url} poster={m.poster} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : m.type === "image" ? (
                        <img src={m.url} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
                          <FaFilePdf size={44} />
                          <span style={{ marginTop: 8, fontSize: "0.85rem", color: "#cbd5e1" }}>PDF Document</span>
                        </div>
                      )}

                      <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.75)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>
                        {m.type}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#f472b6", textTransform: "uppercase" }}>{m.tag || "General"}</span>
                      <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{m.title}</h4>
                      {m.description && <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5, flex: 1 }}>{m.description}</p>}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1f2937", marginTop: 8 }}>
                        <button
                          onClick={() => handleToggleMediaActive(m.id, isActive)}
                          style={{ padding: "4px 8px", background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)", border: "1px solid", borderColor: isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)", borderRadius: 6, color: isActive ? "#34d399" : "#fca5a5", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          {isActive ? "Visible" : "Hidden"}
                        </button>

                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => openEditMediaModal(m)}
                            style={{ padding: "4px 8px", background: "rgba(2, 132, 199, 0.15)", border: "1px solid rgba(2, 132, 199, 0.35)", borderRadius: 6, color: "#38bdf8", fontSize: "0.74rem", cursor: "pointer", fontWeight: 700 }}
                          >
                            <FaEdit size={10} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: "media", id: m.id, label: m.title })}
                            style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: 6, color: "#f87171", fontSize: "0.74rem", cursor: "pointer", fontWeight: 700 }}
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 6: CALL TO ACTION STRIP                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "cta" && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 28, maxWidth: 900 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #1f2937", paddingBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                  Call To Action Shell & Trust Badges
                </h2>
                <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                  Manage the bottom &quot;Do Work That Reaches the Last Hamlet&quot; banner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSavePageSettings()}
                disabled={isSaving}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                <FaSave /> {isSaving ? "Saving..." : "Save CTA"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>CTA Badge</label>
                <input
                  type="text"
                  value={pageData.cta_badge || ""}
                  onChange={(e) => setPageData({ ...pageData, cta_badge: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>CTA Headline Title</label>
                <input
                  type="text"
                  value={pageData.cta_title || ""}
                  onChange={(e) => setPageData({ ...pageData, cta_title: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>CTA Subtitle</label>
                <textarea
                  rows={3}
                  value={pageData.cta_subtitle || ""}
                  onChange={(e) => setPageData({ ...pageData, cta_subtitle: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", lineHeight: 1.5 }}
                />
              </div>

              <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Email Subject Line</label>
                  <input
                    type="text"
                    value={pageData.cta_email_subject || ""}
                    onChange={(e) => setPageData({ ...pageData, cta_email_subject: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Contact Head Office URL</label>
                  <input
                    type="text"
                    value={pageData.cta_contact_url || ""}
                    onChange={(e) => setPageData({ ...pageData, cta_contact_url: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>
              </div>

              {/* TRUST STRIP ITEMS */}
              <div style={{ marginTop: 12, paddingTop: 16, borderTop: "1px solid #1f2937" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>Trust Badges (Footer Strip)</label>
                  <button
                    type="button"
                    onClick={() => setTrustStrip([...trustStrip, { text: "Verified Initiative", icon: "FaShieldAlt" }])}
                    style={{ padding: "5px 12px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, fontSize: "0.78rem", cursor: "pointer", fontWeight: 700 }}
                  >
                    + Add Badge
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {trustStrip.map((item, tIdx) => (
                    <div key={tIdx} style={{ display: "flex", gap: 10, alignItems: "center", background: "#0b0f17", padding: "8px 12px", borderRadius: 8, border: "1px solid #1f2937" }}>
                      <input
                        type="text"
                        value={item.text || ""}
                        onChange={(e) => {
                          const updated = [...trustStrip];
                          updated[tIdx] = { ...updated[tIdx], text: e.target.value };
                          setTrustStrip(updated);
                        }}
                        style={{ flex: 1, padding: "6px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#fff", fontSize: "0.85rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setTrustStrip(trustStrip.filter((_, i) => i !== tIdx))}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 4 }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 7: CAREERS LEADS & APPLICATIONS                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {viewTab === "leads" && (
          <div>
            {/* TOP BAR */}
            <div className="adm-careers-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <FaInbox size={12} /> Talent Pool &amp; Application Leads
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    Submissions from /careers application form &amp; talent pool
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                  Careers Leads &amp; Candidate Applications
                </h2>
                <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                  Review candidate profiles, statement of interest, referee contacts, and track recruitment progress.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleExportLeadsCSV}
                  disabled={leads.length === 0}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#cbd5e1",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <FaDownload size={12} /> Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => loadData()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "#0284c7",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <FaSyncAlt size={12} /> Refresh Leads
                </button>
              </div>
            </div>

            {/* METRICS ROW */}
            <div className="adm-careers-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: "14px 16px" }}>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Total Leads</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginTop: 4 }}>{leads.length}</div>
              </div>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: "14px 16px" }}>
                <span style={{ fontSize: "0.72rem", color: "#38bdf8", textTransform: "uppercase", fontWeight: 700 }}>New / Unreviewed</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>
                  {leads.filter(l => (l.status || "New") === "New").length}
                </div>
              </div>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: "14px 16px" }}>
                <span style={{ fontSize: "0.72rem", color: "#fbbf24", textTransform: "uppercase", fontWeight: 700 }}>In Review / Conversation</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>
                  {leads.filter(l => l.status === "In Review" || l.status === "In Conversation").length}
                </div>
              </div>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: "14px 16px" }}>
                <span style={{ fontSize: "0.72rem", color: "#34d399", textTransform: "uppercase", fontWeight: 700 }}>Shortlisted / Accepted</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#34d399", marginTop: 4 }}>
                  {leads.filter(l => l.status === "Shortlisted" || l.status === "Accepted").length}
                </div>
              </div>
            </div>

            {/* SEARCH & STATUS FILTER */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search by candidate name, email, phone, role..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px 9px 36px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                style={{ padding: "9px 14px", background: "#111827", border: "1px solid #1f2937", borderRadius: 8, color: "#cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="all">All Statuses ({leads.length})</option>
                <option value="New">New ({leads.filter(l => (l.status || "New") === "New").length})</option>
                <option value="In Review">In Review</option>
                <option value="In Conversation">In Conversation</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Accepted">Accepted</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* LEADS LIST */}
            {filteredLeads.length === 0 ? (
              <div style={{ background: "#111827", border: "1px dashed #1f2937", borderRadius: 12, padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
                <FaInbox size={32} style={{ color: "#475569", marginBottom: 12 }} />
                <h4 style={{ margin: "0 0 6px", fontSize: "1.1rem", color: "#e2e8f0" }}>No applications found</h4>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  {leadSearch ? "No leads matched your search criteria." : "Candidates who submit the application form on /careers will appear here."}
                </p>
              </div>
            ) : (
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
                {/* Desktop Table View */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f2937", background: "rgba(255,255,255,0.02)", color: "#94a3b8", textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                        <th style={{ padding: "12px 16px" }}>Candidate &amp; Background</th>
                        <th style={{ padding: "12px 16px" }}>Role / Pathway</th>
                        <th style={{ padding: "12px 16px" }}>Contact Details</th>
                        <th style={{ padding: "12px 16px" }}>Resume / CV</th>
                        <th style={{ padding: "12px 16px" }}>Status</th>
                        <th style={{ padding: "12px 16px" }}>Date</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => {
                        const statusColors = {
                          "New": { bg: "rgba(56, 189, 248, 0.15)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" },
                          "In Review": { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
                          "In Conversation": { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.3)" },
                          "Shortlisted": { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
                          "Accepted": { bg: "rgba(34, 197, 94, 0.2)", text: "#4ade80", border: "rgba(34, 197, 94, 0.4)" },
                          "Archived": { bg: "rgba(148, 163, 184, 0.1)", text: "#94a3b8", border: "rgba(148, 163, 184, 0.2)" }
                        };
                        const sc = statusColors[lead.status] || statusColors["New"];

                        return (
                          <tr key={lead.id} style={{ borderBottom: "1px solid #182030" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.92rem" }}>{lead.name}</div>
                              {lead.background && (
                                <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: 2 }}>{lead.background}</div>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ display: "inline-block", background: "rgba(2, 132, 199, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: 4, fontSize: "0.76rem", fontWeight: 600 }}>
                                {lead.interest_type}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ color: "#cbd5e1" }}>
                                <a href={`mailto:${lead.email}`} style={{ color: "#38bdf8", textDecoration: "none" }}>{lead.email}</a>
                              </div>
                              {lead.phone && (
                                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>
                                  <a href={`tel:${lead.phone}`} style={{ color: "#94a3b8", textDecoration: "none" }}>{lead.phone}</a>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              {lead.resume_url ? (
                                <a
                                  href={resolveUploadUrl(lead.resume_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={lead.resume_name || "Resume"}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "4px 9px",
                                    background: "rgba(225, 29, 72, 0.15)",
                                    border: "1px solid rgba(225, 29, 72, 0.35)",
                                    borderRadius: 6,
                                    color: "#fb7185",
                                    fontWeight: 700,
                                    fontSize: "0.74rem",
                                    textDecoration: "none"
                                  }}
                                  title={lead.resume_name || "View / Download Resume"}
                                >
                                  <FaFilePdf size={12} />
                                  <span>{lead.resume_name ? (lead.resume_name.length > 14 ? lead.resume_name.slice(0, 14) + "..." : lead.resume_name) : "Resume"}</span>
                                </a>
                              ) : (
                                <span style={{ color: "#64748b", fontSize: "0.75rem" }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                {lead.status || "New"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                              {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "Recent"}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                              <button
                                type="button"
                                onClick={() => handleOpenLeadModal(lead)}
                                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#38bdf8", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", marginRight: 6 }}
                              >
                                <FaEye size={11} /> Review
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLeadItem(lead.id)}
                                style={{ display: "inline-flex", alignItems: "center", padding: "5px 9px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 6, color: "#f87171", fontSize: "0.76rem", cursor: "pointer" }}
                                title="Delete Lead"
                              >
                                <FaTrash size={11} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CREATE / EDIT OPENING MODAL ───────────────────────────────────── */}
        {showOpeningModal && (
          <div
            className="adm-modal-backdrop"
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => !isSaving && setShowOpeningModal(false)}
          >
            <div
              className="adm-careers-modal"
              style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 660, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "26px 30px", color: "#fff", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f2937", paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                    {editingOpeningId ? "Edit Job Opening" : "Create New Job Opening"}
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                    Configure role requirements, attachments, and apply guidelines
                  </p>
                </div>
                <button onClick={() => setShowOpeningModal(false)} disabled={isSaving} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveOpening} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Role Title *</label>
                  <input
                    type="text"
                    required
                    value={openingForm.role}
                    onChange={(e) => setOpeningForm({ ...openingForm, role: e.target.value })}
                    placeholder="e.g. Field Coordinator — Polavaram R&R"
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Employment Type *</label>
                    <select
                      value={openingForm.type}
                      onChange={(e) => setOpeningForm({ ...openingForm, type: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem" }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract / Project">Contract / Project</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Location / Field Area *</label>
                    <input
                      type="text"
                      required
                      value={openingForm.place}
                      onChange={(e) => setOpeningForm({ ...openingForm, place: e.target.value })}
                      placeholder="e.g. Vijayawada HQ with field travel"
                      style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.9rem" }}
                    />
                  </div>
                </div>

                {/* ICON PICKER */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Role Card Icon</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {AVAILABLE_ICONS.map((ic) => {
                      const IconComp = ic.icon;
                      const isSelected = openingForm.icon === ic.name;
                      return (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => setOpeningForm({ ...openingForm, icon: ic.name })}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid",
                            borderColor: isSelected ? "#10b981" : "#1f2937",
                            background: isSelected ? "rgba(16, 185, 129, 0.2)" : "#0b0f17",
                            color: isSelected ? "#34d399" : "#94a3b8",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            fontSize: "0.82rem"
                          }}
                        >
                          <IconComp size={14} />
                          <span>{ic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Role Overview & Responsibilities (About) *</label>
                  <textarea
                    rows={3}
                    required
                    value={openingForm.about}
                    onChange={(e) => setOpeningForm({ ...openingForm, about: e.target.value })}
                    placeholder="Describe core field duties, surveys, team coordination..."
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem", lineHeight: 1.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Qualifications & Background (What Fits) *</label>
                  <textarea
                    rows={2}
                    required
                    value={openingForm.fit}
                    onChange={(e) => setOpeningForm({ ...openingForm, fit: e.target.value })}
                    placeholder="e.g. Field research experience with tribal communities, Telugu fluency..."
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem", lineHeight: 1.5 }}
                  />
                </div>

                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Apply Email</label>
                    <input
                      type="text"
                      value={openingForm.apply_email}
                      onChange={(e) => setOpeningForm({ ...openingForm, apply_email: e.target.value })}
                      placeholder="contact@alertngo.in"
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Custom Apply Link (Optional)</label>
                    <input
                      type="text"
                      value={openingForm.apply_link}
                      onChange={(e) => setOpeningForm({ ...openingForm, apply_link: e.target.value })}
                      placeholder="https://... or google form link"
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                  </div>
                </div>

                {/* ATTACHED MULTIMEDIA (IMAGE/VIDEO) */}
                <div style={{ padding: 14, background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 10 }}>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                    🎬 Attach Photo or Video to Role (Optional)
                  </label>
                  <div className="adm-media-input-row" style={{ display: "grid", gap: 10, alignItems: "center" }}>
                    <select
                      value={openingForm.media_type}
                      onChange={(e) => setOpeningForm({ ...openingForm, media_type: e.target.value })}
                      style={{ padding: "8px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#fff" }}
                    >
                      <option value="none">None</option>
                      <option value="image">Photo</option>
                      <option value="video">Video</option>
                      <option value="youtube">YouTube</option>
                    </select>

                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        disabled={openingForm.media_type === "none"}
                        value={openingForm.media_url}
                        onChange={(e) => setOpeningForm({ ...openingForm, media_url: e.target.value })}
                        placeholder={openingForm.media_type === "youtube" ? "https://youtube.com/watch?v=..." : "/uploads/... or URL"}
                        style={{ flex: 1, padding: "8px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#fff" }}
                      />
                      {openingForm.media_type !== "none" && openingForm.media_type !== "youtube" && (
                        <>
                          <input
                            type="file"
                            ref={openingMediaInputRef}
                            style={{ display: "none" }}
                            accept={openingForm.media_type === "video" ? "video/*" : "image/*"}
                            onChange={(e) => handleFileUpload(e, openingForm.media_type, (url) => setOpeningForm((prev) => ({ ...prev, media_url: url })))}
                          />
                          <button
                            type="button"
                            onClick={() => openingMediaInputRef.current?.click()}
                            disabled={isUploading}
                            style={{ padding: "8px 12px", background: "#334155", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}
                          >
                            Upload
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* ATTACHED PDF / JD DOCUMENT */}
                <div style={{ padding: 14, background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 10 }}>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                    📄 Downloadable Job Description (JD File / Link)
                  </label>
                  <div className="adm-media-upload-row" style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      value={openingForm.jd_file}
                      onChange={(e) => setOpeningForm({ ...openingForm, jd_file: e.target.value })}
                      placeholder="/downloads/job-description.pdf or URL"
                      style={{ flex: 1, padding: "8px 10px", background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#fff" }}
                    />
                    <input
                      type="file"
                      ref={openingJdInputRef}
                      style={{ display: "none" }}
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, "image", (url) => setOpeningForm((prev) => ({ ...prev, jd_file: url })))}
                    />
                    <button
                      type="button"
                      onClick={() => openingJdInputRef.current?.click()}
                      disabled={isUploading}
                      style={{ padding: "8px 12px", background: "#334155", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      Upload PDF
                    </button>
                  </div>
                </div>

                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Display Sort Order</label>
                    <input
                      type="number"
                      value={openingForm.sort_order}
                      onChange={(e) => setOpeningForm({ ...openingForm, sort_order: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Publish Status</label>
                    <select
                      value={openingForm.is_active}
                      onChange={(e) => setOpeningForm({ ...openingForm, is_active: parseInt(e.target.value) })}
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    >
                      <option value={1}>Active (Visible to public)</option>
                      <option value={0}>Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12, borderTop: "1px solid #1f2937", paddingTop: 16 }}>
                  <button type="button" onClick={() => setShowOpeningModal(false)} disabled={isSaving} style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} style={{ padding: "9px 22px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    {isSaving ? "Saving..." : (editingOpeningId ? "Update Opening" : "Create Opening")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT PATHWAY MODAL ───────────────────────────────────── */}
        {showPathwayModal && (
          <div
            className="adm-modal-backdrop"
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setShowPathwayModal(false)}
          >
            <div
              className="adm-careers-modal"
              style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 540, width: "100%", padding: "26px 28px", color: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>
                {editingPathwayIdx !== null ? "Edit Pathway" : "Create Volunteer / Intern Pathway"}
              </h3>
              <form onSubmit={handleSavePathway} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Pathway Title *</label>
                  <input
                    type="text"
                    required
                    value={pathwayForm.title}
                    onChange={(e) => setPathwayForm({ ...pathwayForm, title: e.target.value })}
                    placeholder="e.g. Field Volunteering"
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Target Group / Who it is for *</label>
                  <input
                    type="text"
                    required
                    value={pathwayForm.who}
                    onChange={(e) => setPathwayForm({ ...pathwayForm, who: e.target.value })}
                    placeholder="e.g. Students and early-career practitioners"
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={pathwayForm.body}
                    onChange={(e) => setPathwayForm({ ...pathwayForm, body: e.target.value })}
                    placeholder="Describe placement tenure, field visits, or research expectations..."
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Action Link</label>
                  <input
                    type="text"
                    value={pathwayForm.link_url}
                    onChange={(e) => setPathwayForm({ ...pathwayForm, link_url: e.target.value })}
                    placeholder="/contact or /partner"
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>

                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" onClick={() => setShowPathwayModal(false)} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: "8px 18px", background: "#0284c7", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>
                    Save Pathway
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT MEDIA MODAL ─────────────────────────────────────── */}
        {showMediaModal && (
          <div
            className="adm-modal-backdrop"
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => !isSaving && setShowMediaModal(false)}
          >
            <div
              className="adm-careers-modal"
              style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 560, width: "100%", padding: "26px 28px", color: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>
                {editingMediaId ? "Edit Media Item" : "Add Careers Media / Document"}
              </h3>
              <form onSubmit={handleSaveMedia} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Media Title *</label>
                  <input
                    type="text"
                    required
                    value={mediaForm.title}
                    onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                    placeholder="e.g. Field Team Village Induction Session"
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>

                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Media Type</label>
                    <select
                      value={mediaForm.type}
                      onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    >
                      <option value="image">Photo / Image</option>
                      <option value="video">Video (MP4 / WebM)</option>
                      <option value="document">PDF Document / Brochure</option>
                      <option value="youtube">YouTube Embed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Category / Tag</label>
                    <input
                      type="text"
                      value={mediaForm.tag}
                      onChange={(e) => setMediaForm({ ...mediaForm, tag: e.target.value })}
                      placeholder="e.g. Field Team, Youth, Guidelines"
                      style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>File URL or Upload *</label>
                  <div className="adm-media-upload-row" style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      required
                      value={mediaForm.url}
                      onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                      placeholder="/uploads/... or URL"
                      style={{ flex: 1, padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                    />
                    <input
                      type="file"
                      ref={mediaFileInputRef}
                      style={{ display: "none" }}
                      accept={mediaForm.type === "video" ? "video/*" : mediaForm.type === "document" ? ".pdf" : "image/*"}
                      onChange={(e) => handleFileUpload(e, mediaForm.type, (url) => setMediaForm((prev) => ({ ...prev, url })))}
                    />
                    <button
                      type="button"
                      onClick={() => mediaFileInputRef.current?.click()}
                      disabled={isUploading}
                      style={{ padding: "8px 14px", background: "#334155", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem" }}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Description / Caption</label>
                  <textarea
                    rows={2}
                    value={mediaForm.description}
                    onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                    placeholder="Brief description of the media item..."
                    style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff" }}
                  />
                </div>

                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" onClick={() => setShowMediaModal(false)} disabled={isSaving} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} style={{ padding: "8px 18px", background: "#e11d48", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>
                    {isSaving ? "Saving..." : (editingMediaId ? "Update Item" : "Add Item")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CONFIRM DELETE MODAL ─────────────────────────────────────────── */}
        {deleteTarget && (
          <div
            className="adm-modal-backdrop"
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => !isSaving && setDeleteTarget(null)}
          >
            <div
              className="adm-careers-modal"
              style={{ background: "#111827", border: "1px solid #ef4444", borderRadius: 14, maxWidth: 460, width: "100%", padding: "26px 28px", color: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, color: "#ef4444" }}>
                <FaExclamationTriangle size={24} />
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Confirm Deletion</h3>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 20px" }}>
                Are you sure you want to permanently delete &quot;<strong>{deleteTarget.label}</strong>&quot;? This cannot be undone.
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={isSaving} style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="button" onClick={confirmDelete} disabled={isSaving} style={{ padding: "9px 18px", background: "#ef4444", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {isSaving ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESTORE DEFAULTS MODAL ───────────────────────────────────────── */}
        {showSyncModal && (
          <div
            className="adm-modal-backdrop"
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => !isSyncing && setShowSyncModal(false)}
          >
            <div
              className="adm-careers-modal"
              style={{ background: "#111827", border: "1px solid #3b82f6", borderRadius: 14, maxWidth: 480, width: "100%", padding: "26px 28px", color: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, color: "#38bdf8" }}>
                <FaSyncAlt size={22} />
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Restore Factory Defaults</h3>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 20px" }}>
                This will reset the 5 core job openings, 3 volunteer pathways, 4 application steps, and workplace standards to their official defaults.
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowSyncModal(false)} disabled={isSyncing} style={{ padding: "9px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="button" onClick={handleRestoreDefaults} disabled={isSyncing} style={{ padding: "9px 18px", background: "#0284c7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {isSyncing ? "Restoring..." : "Yes, Restore Defaults"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LEAD REVIEW & DETAILS MODAL ────────────────────────────────────── */}
        {selectedLead && (
          <div
            className="adm-modal-backdrop"
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setSelectedLead(null)}
          >
            <div
              className="adm-careers-modal"
              style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "26px 28px", color: "#fff", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1f2937", paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Candidate Profile #{selectedLead.id}
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: "1.25rem", fontWeight: 800 }}>
                    {selectedLead.name}
                  </h3>
                  <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: "0.8rem", color: "#94a3b8" }}>
                    <span>{selectedLead.email}</span>
                    {selectedLead.phone && <span>• {selectedLead.phone}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}>
                  <FaTimes />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#0b0f17", padding: "12px 16px", borderRadius: 8, border: "1px solid #1f2937" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Applied For</span>
                    <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "0.9rem", marginTop: 2 }}>{selectedLead.interest_type}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Background</span>
                    <div style={{ color: "#e2e8f0", fontSize: "0.85rem", marginTop: 2 }}>{selectedLead.background || "Not specified"}</div>
                  </div>
                </div>

                {/* RESUME / CV DOCUMENT REVIEW BOX */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
                    Uploaded Resume / CV Document
                  </label>
                  {selectedLead.resume_url ? (
                    <div style={{ background: "#0b0f17", borderRadius: 10, border: "1px solid #1f2937", padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(225, 29, 72, 0.15)", color: "#fb7185", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FaFilePdf size={20} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {selectedLead.resume_name || "Candidate_Resume_Document"}
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "#38bdf8", marginTop: 2 }}>
                              Resume attached by candidate
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <a
                            href={resolveUploadUrl(selectedLead.resume_url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "7px 13px",
                              background: "#0284c7",
                              borderRadius: 6,
                              color: "#fff",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none"
                            }}
                          >
                            <FaExternalLinkAlt size={11} /> Open / View
                          </a>
                          <a
                            href={resolveUploadUrl(selectedLead.resume_url)}
                            download={selectedLead.resume_name || "Candidate_Resume"}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "7px 13px",
                              background: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: 6,
                              color: "#cbd5e1",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none"
                            }}
                          >
                            <FaDownload size={11} /> Download File
                          </a>
                        </div>
                      </div>

                      {/* PREVIEW FRAME IF PDF, IMAGE, OR DATA URL */}
                      {/\.(pdf)($|\?)/i.test(resolveUploadUrl(selectedLead.resume_url)) || resolveUploadUrl(selectedLead.resume_url).startsWith("data:application/pdf") ? (
                        <div style={{ marginTop: 14, borderTop: "1px solid #1f2937", paddingTop: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Inline PDF Document Preview:</span>
                            <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 700 }}>✓ Verified PDF Asset</span>
                          </div>
                          <iframe
                            src={resolveUploadUrl(selectedLead.resume_url)}
                            title="Resume PDF Preview"
                            style={{ width: "100%", height: 440, border: "1px solid #374151", borderRadius: 8, background: "#fff" }}
                          />
                        </div>
                      ) : /\.(png|jpe?g|webp|gif)($|\?)/i.test(resolveUploadUrl(selectedLead.resume_url)) || resolveUploadUrl(selectedLead.resume_url).startsWith("data:image/") ? (
                        <div style={{ marginTop: 14, borderTop: "1px solid #1f2937", paddingTop: 12 }}>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 6 }}>Attached Image Preview:</div>
                          <img
                            src={resolveUploadUrl(selectedLead.resume_url)}
                            alt="Resume attachment"
                            style={{ width: "100%", maxHeight: 380, objectFit: "contain", borderRadius: 8, border: "1px solid #374151", background: "#0b0f17" }}
                          />
                        </div>
                      ) : /\.(docx?|odt|rtf)($|\?)/i.test(resolveUploadUrl(selectedLead.resume_url)) ? (
                        <div style={{ marginTop: 14, borderTop: "1px solid #1f2937", paddingTop: 12, color: "#94a3b8", fontSize: "0.82rem" }}>
                          ℹ️ Document file attached ({selectedLead.resume_name}). Use <strong>"Open / View"</strong> or <strong>"Download File"</strong> above to inspect.
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ background: "#0b0f17", padding: "12px 14px", borderRadius: 8, border: "1px solid #1f2937", color: "#64748b", fontSize: "0.82rem" }}>
                      No resume document or link was attached with this application.
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
                    Statement of Interest &amp; Motivation
                  </label>
                  <div style={{ background: "#0b0f17", padding: "14px", borderRadius: 8, border: "1px solid #1f2937", fontSize: "0.86rem", color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {selectedLead.note || "No note provided."}
                  </div>
                </div>

                {selectedLead.referees && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
                      Referee Contacts
                    </label>
                    <div style={{ background: "#0b0f17", padding: "10px 14px", borderRadius: 8, border: "1px solid #1f2937", fontSize: "0.84rem", color: "#cbd5e1" }}>
                      {selectedLead.referees}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveLeadReview} style={{ borderTop: "1px solid #1f2937", paddingTop: 16, marginTop: 4 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Application Status</label>
                      <select
                        value={leadStatusInput}
                        onChange={(e) => setLeadStatusInput(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                      >
                        <option value="New">New (Unreviewed)</option>
                        <option value="In Review">In Review</option>
                        <option value="In Conversation">In Conversation (Step 03)</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Accepted">Accepted / Placed</option>
                        <option value="Archived">Archived / Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>Internal Recruitment Notes</label>
                      <textarea
                        rows={3}
                        value={leadNotesInput}
                        onChange={(e) => setLeadNotesInput(e.target.value)}
                        placeholder="Add interview notes, discussion summary, or follow-up dates..."
                        style={{ width: "100%", padding: "9px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteLeadItem(selectedLead.id)}
                      style={{ padding: "8px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 7, color: "#f87171", fontSize: "0.8rem", cursor: "pointer" }}
                    >
                      Delete Lead
                    </button>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedLead(null)}
                        style={{ padding: "8px 16px", background: "#1f2937", border: "none", borderRadius: 7, color: "#cbd5e1", fontSize: "0.8rem", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "#10b981", border: "none", borderRadius: 7, color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        <FaSave size={12} /> Save Review
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

