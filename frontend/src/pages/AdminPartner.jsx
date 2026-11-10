import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaHandsHelping, FaPlus, FaTrash, FaEdit, FaSave, FaExternalLinkAlt,
  FaCheckCircle, FaExclamationTriangle, FaSyncAlt, FaEye, FaEyeSlash,
  FaFilePdf, FaCloudUploadAlt, FaTimes, FaSearch, FaFolderOpen,
  FaQuestionCircle, FaExclamationCircle, FaBars, FaVideo, FaImages,
  FaBuilding, FaHandHoldingHeart, FaUsers, FaSeedling, FaGavel, FaWater,
  FaGraduationCap, FaEnvelope, FaList, FaChevronRight, FaFileAlt
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import { resolveUploadUrl } from "../utils/resolveUploadUrl";
import AdminResourcePagesSection from "../components/AdminResourcePagesSection";
import {
  adminGetPartnerData,
  adminSavePartnerPage,
  adminSaveGrievancePage,
  adminUpdateGrievance,
  adminDeleteGrievance,
  adminSaveDownload,
  adminDeleteDownload,
  adminToggleDownloadActive,
  adminSaveFaq,
  adminDeleteFaq,
  adminToggleFaqActive,
  adminSavePartnerDropdown,
  adminDeletePartnerDropdown,
  adminTogglePartnerDropdown,
  adminSeedPartnerDefaults,
  adminUploadImage,
  adminUploadVideo,
  API_BASE
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";

const ROUTE_ICONS = [
  { name: "FaBuilding", label: "Building / Corporate", icon: FaBuilding },
  { name: "FaHandHoldingHeart", label: "Grants / Heart", icon: FaHandHoldingHeart },
  { name: "FaUsers", label: "Community / Users", icon: FaUsers },
  { name: "FaSeedling", label: "In-Kind / Seedling", icon: FaSeedling },
  { name: "FaGavel", label: "Legal / Gavel", icon: FaGavel },
  { name: "FaWater", label: "Rehab / Water", icon: FaWater },
  { name: "FaGraduationCap", label: "Education / Cap", icon: FaGraduationCap }
];

function renderRouteIcon(name, size = 18) {
  switch (name) {
    case "FaBuilding": return <FaBuilding size={size} />;
    case "FaHandHoldingHeart": return <FaHandHoldingHeart size={size} />;
    case "FaUsers": return <FaUsers size={size} />;
    case "FaSeedling": return <FaSeedling size={size} />;
    case "FaGavel": return <FaGavel size={size} />;
    case "FaWater": return <FaWater size={size} />;
    case "FaGraduationCap": return <FaGraduationCap size={size} />;
    default: return <FaHandsHelping size={size} />;
  }
}

export default function AdminPartner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "partner"; // partner | grievances | grievance_pages | download_pages | downloads | faqs | dropdowns

  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL
  const setTab = (t, slug = "") => {
    setActiveTab(t);
    const p = { tab: t };
    if (slug) p.slug = slug;
    setSearchParams(p);
  };

  // Master Data States
  const [partnerPage, setPartnerPage] = useState({
    badge: "Section 01",
    title: "Why Partner With ALERT",
    subtitle: "",
    intro_p1: "",
    intro_p2: "",
    hero_media_type: "image",
    hero_media_url: "",
    hero_poster: "",
    contact_email: "director@alertngo.in",
    donate_btn_text: "Give Directly",
    donate_btn_url: "/donate",
    routes_badge: "Section 02",
    routes_title: "Four Ways to Partner",
    routes_subtitle: "",
    missions_badge: "Section 03",
    missions_title: "Where Support Goes",
    missions_subtitle: "",
    diligence_badge: "Section 04",
    diligence_title: "Due Diligence & Statutory Records",
    diligence_subtitle: "",
    commitments_title: "Our Institutional Commitments",
    registration_title: "Registration & tax details",
    registration_note: "Certificates, PAN, FCRA sanction and audited statements are shared on request against a signed enquiry. Full document list: /downloads",
    cta_badge: "Partnership",
    cta_title: "Begin a Conversation With Us",
    cta_subtitle: "",
    cta_email_subject: "Partnership enquiry to ALERT",
    cta_donate_url: "/donate"
  });

  const [partnerRoutes, setPartnerRoutes] = useState([]);
  const [partnerMissions, setPartnerMissions] = useState([]);
  const [partnerDiligence, setPartnerDiligence] = useState([]);
  const [partnerCommitments, setPartnerCommitments] = useState([]);
  const [registrationItems, setRegistrationItems] = useState([
    { label: "Legal form", value: "Registered Society, Andhra Pradesh" },
    { label: "Reg. No.", value: "307/2004" },
    { label: "Tax status", value: "12A & 80G — donations tax-exempt" },
    { label: "Foreign contributions", value: "FCRA-compliant institutional grants" },
    { label: "Head office", value: "Vijayawada, Krishna District, Andhra Pradesh" }
  ]);
  const [newCommitmentText, setNewCommitmentText] = useState("");
  const [newRegItem, setNewRegItem] = useState({ label: "", value: "" });

  // Grievance Portal
  const [grievancePage, setGrievancePage] = useState({
    badge: "Community Assistance",
    title: "ALERT Grievance Redressal Portal",
    subtitle: "",
    form_title: "Lodge a Land or R&R Grievance",
    form_subtitle: "Provide accurate details as per your household ration card / patta documents.",
    chart1_title: "Official Grievance Categories Chart",
    chart1_image: "/uploads/grievance-types.png",
    chart2_title: "ALERT R&R Grievances Abstract",
    chart2_image: "/uploads/GRIEVANCE-ALL.png",
    chart3_title: "Land Rights Grievances Classification",
    chart3_image: "/uploads/LAND-RIGHTS.png",
    faq_pdf_url: "/uploads/GREIVANCE-FAQ.pdf",
    faq_pdf_label: "FAQ PDF",
    hero_image: "",
    success_title: "Grievance Registered Successfully",
    success_desc: "Our legal and field caseworkers in Vijayawada will inspect the revenue records and follow up with the concerned Special Deputy Collector (SDC)."
  });
  const [typewriterWords, setTypewriterWords] = useState([]);
  const [fullForms, setFullForms] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [grievanceCharts, setGrievanceCharts] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  const [grievanceCategories, setGrievanceCategories] = useState([
    { value: "R&R Package Entitlement", label: "R&R Package Entitlement", desc: "₹10 Lakh or House allotment" },
    { value: "Adult Youth Package", label: "Adult Youth (18+ Yrs) Package", desc: "Non-inclusion in entitlement roll" },
    { value: "Land Valuation / Award Issue", label: "Land Valuation / Low Compensation", desc: "Discrepancy in land award" },
    { value: "House / Structure Valuation", label: "House Structure Valuation", desc: "Structure measurement discrepancy" },
    { value: "Resettlement Colony Infrastructure", label: "R&R Colony Amenities", desc: "Water, power, access roads" },
    { value: "RoFR Forest Land Patta Issue", label: "RoFR Forest Land Patta", desc: "Title rejection or pending claim" }
  ]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatIdx, setEditingCatIdx] = useState(null);
  const [catForm, setCatForm] = useState({ value: "", label: "", desc: "" });

  const [showAcronymModal, setShowAcronymModal] = useState(false);
  const [editingAcronymIdx, setEditingAcronymIdx] = useState(null);
  const [acronymForm, setAcronymForm] = useState({ abbr: "", full: "", desc: "" });

  // Downloads & FAQs & Dropdowns
  const [downloads, setDownloads] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [dropdowns, setDropdowns] = useState([]);

  // Search & Filters
  const [searchDoc, setSearchDoc] = useState("");
  const [docCatFilter, setDocCatFilter] = useState("all");
  const [searchFaq, setSearchFaq] = useState("");
  const [searchGrv, setSearchGrv] = useState("");
  const [grvStatusFilter, setGrvStatusFilter] = useState("all");

  // Modals
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRouteIdx, setEditingRouteIdx] = useState(null);
  const [routeForm, setRouteForm] = useState({ icon: "FaBuilding", title: "", body: "", fits: "" });

  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingMissionIdx, setEditingMissionIdx] = useState(null);
  const [missionForm, setMissionForm] = useState({ icon: "FaGavel", title: "", body: "", tell: "" });

  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docForm, setDocForm] = useState({ category: "acts", title: "", file: "", meta: "", desc: "", file_size: "Official PDF", sort_order: 0, is_active: 1 });

  const [showDiligenceModal, setShowDiligenceModal] = useState(false);
  const [editingDiligenceIdx, setEditingDiligenceIdx] = useState(null);
  const [diligenceForm, setDiligenceForm] = useState({ title: "", file: "", meta: "", icon: "FaFilePdf" });

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [faqForm, setFaqForm] = useState({ category: "General", q: "", a: "", sort_order: 0, is_active: 1 });

  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [editingDropdownId, setEditingDropdownId] = useState(null);
  const [dropdownForm, setDropdownForm] = useState({ parent_label: "Partner with us", section: "Main", label: "", path: "", sub_items: [], sort_order: 0, is_active: 1 });

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'doc'|'faq'|'grv'|'dropdown'|'route'|'mission', id/index, label }
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Status & Uploads
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const heroInputRef = useRef(null);
  const chart1InputRef = useRef(null);
  const chart2InputRef = useRef(null);
  const chart3InputRef = useRef(null);
  const grvFaqInputRef = useRef(null);
  const grvHeroInputRef = useRef(null);
  const docFileInputRef = useRef(null);
  const diligenceInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  useEffect(() => {
    const key = sessionStorage.getItem(KEY_STORAGE) || "alertngo@123";
    setAdminKey(key);
    loadAllData(key);
  }, []);

  const loadAllData = async (key = adminKey) => {
    setLoading(true);
    try {
      const res = await adminGetPartnerData(key);
      if (res && res.success) {
        // 1. Partner
        if (res.partner_page) {
          setPartnerPage(res.partner_page);
          try {
            setPartnerRoutes(typeof res.partner_page.routes_json === "string" ? JSON.parse(res.partner_page.routes_json || "[]") : (res.partner_page.routes_json || []));
          } catch (e) { setPartnerRoutes([]); }
          try {
            setPartnerMissions(typeof res.partner_page.missions_json === "string" ? JSON.parse(res.partner_page.missions_json || "[]") : (res.partner_page.missions_json || []));
          } catch (e) { setPartnerMissions([]); }
          try {
            setPartnerDiligence(typeof res.partner_page.diligence_json === "string" ? JSON.parse(res.partner_page.diligence_json || "[]") : (res.partner_page.diligence_json || []));
          } catch (e) { setPartnerDiligence([]); }
          try {
            setPartnerCommitments(typeof res.partner_page.commitments_json === "string" ? JSON.parse(res.partner_page.commitments_json || "[]") : (res.partner_page.commitments_json || []));
          } catch (e) { setPartnerCommitments([]); }
          try {
            const reg = typeof res.partner_page.registration_json === "string" ? JSON.parse(res.partner_page.registration_json || "[]") : (res.partner_page.registration_json || []);
            if (Array.isArray(reg) && reg.length > 0) setRegistrationItems(reg);
          } catch (e) { }
        }

        // 2. Grievance
        if (res.grievance_page) {
          setGrievancePage(res.grievance_page);
          try {
            const parsedCharts = typeof res.grievance_page.charts_json === "string" ? JSON.parse(res.grievance_page.charts_json || "[]") : (res.grievance_page.charts_json || []);
            if (Array.isArray(parsedCharts) && parsedCharts.length > 0) {
              setGrievanceCharts(parsedCharts);
            } else {
              // Backward compat: build from legacy chart1/2/3 fields
              const legacy = [];
              if (res.grievance_page.chart1_image) legacy.push({ title: res.grievance_page.chart1_title || "Official Grievance Categories Chart", image: res.grievance_page.chart1_image });
              if (res.grievance_page.chart2_image) legacy.push({ title: res.grievance_page.chart2_title || "ALERT R&R Grievances Abstract", image: res.grievance_page.chart2_image });
              if (res.grievance_page.chart3_image) legacy.push({ title: res.grievance_page.chart3_title || "Land Rights Grievances Classification", image: res.grievance_page.chart3_image });
              setGrievanceCharts(legacy.length > 0 ? legacy : [
                { title: "Official Grievance Categories Chart", image: "/uploads/grievance-types.png" },
                { title: "ALERT R&R Grievances Abstract", image: "/uploads/GRIEVANCE-ALL.png" },
                { title: "Land Rights Grievances Classification", image: "/uploads/LAND-RIGHTS.png" },
              ]);
            }
          } catch (e) { setGrievanceCharts([]); }
          try {
            setTypewriterWords(typeof res.grievance_page.typewriter_json === "string" ? JSON.parse(res.grievance_page.typewriter_json || "[]") : (res.grievance_page.typewriter_json || []));
          } catch (e) { setTypewriterWords([]); }
          try {
            setFullForms(typeof res.grievance_page.full_forms_json === "string" ? JSON.parse(res.grievance_page.full_forms_json || "[]") : (res.grievance_page.full_forms_json || []));
          } catch (e) { setFullForms([]); }
          try {
            const parsedCats = typeof res.grievance_page.categories_json === "string" ? JSON.parse(res.grievance_page.categories_json || "[]") : (res.grievance_page.categories_json || []);
            if (Array.isArray(parsedCats) && parsedCats.length > 0) {
              setGrievanceCategories(parsedCats);
            }
          } catch (e) { }
        }
        setGrievances(res.grievances || []);

        // 3. Downloads, FAQs, Dropdowns
        setDownloads(res.downloads || []);
        setFaqs(res.faqs || []);
        setDropdowns(res.dropdowns || []);
      } else {
        showToast(res?.message || "Failed to load partner data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading partner data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── FILE UPLOAD HELPER ────────────────────────────────────────────────────
  const handleUpload = async (e, mode, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      let res;
      if (mode === "video") {
        res = await adminUploadVideo(adminKey, file, "partner");
      } else {
        res = await adminUploadImage(adminKey, file, "partner");
      }
      if (res && res.success && res.url) {
        setter(res.url);
        showToast("File uploaded successfully!");
      } else {
        showToast(res?.message || "Upload failed", "error");
      }
    } catch (err) {
      showToast("File upload error", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ── SAVE PARTNER PAGE ─────────────────────────────────────────────────────
  const handleSavePartnerPage = async (customPayload = null) => {
    setIsSaving(true);
    try {
      const payload = {
        ...partnerPage,
        routes_json: partnerRoutes,
        missions_json: partnerMissions,
        diligence_json: partnerDiligence,
        commitments_json: partnerCommitments,
        registration_json: registrationItems,
        ...(customPayload || {})
      };
      const res = await adminSavePartnerPage(adminKey, payload);
      if (res && res.success) {
        showToast("Partner page updated successfully!");
        loadAllData();
      } else {
        showToast(res?.message || "Failed to save partner page", "error");
      }
    } catch (err) {
      showToast("Error saving partner page", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── SAVE GRIEVANCE PAGE ───────────────────────────────────────────────────
  const handleSaveGrievancePage = async (customPayload = null) => {
    setIsSaving(true);
    try {
      const payload = {
        ...grievancePage,
        typewriter_json: typewriterWords,
        full_forms_json: fullForms,
         charts_json: grievanceCharts,
        categories_json: grievanceCategories,
        ...(customPayload || {})
      };
      const res = await adminSaveGrievancePage(adminKey, payload);
      if (res && res.success) {
        showToast("Grievance portal settings saved!");
        window.dispatchEvent(new CustomEvent("alertngo_grievance_page_updated", { detail: payload }));
        loadAllData();
      } else {
        showToast(res?.message || "Failed to save grievance page", "error");
      }
    } catch (err) {
      showToast("Error saving grievance page: " + (err?.message || err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── UPDATE GRIEVANCE STATUS ───────────────────────────────────────────────
  const handleUpdateGrievanceStatus = async (id, status, remarks) => {
    try {
      const res = await adminUpdateGrievance(adminKey, { id, status, admin_remarks: remarks });
      if (res && res.success) {
        showToast("Grievance status updated!");
        setGrievances((prev) =>
          prev.map((g) => (g.id === id ? { ...g, status, admin_remarks: remarks } : g))
        );
        if (selectedGrievance && selectedGrievance.id === id) {
          setSelectedGrievance({ ...selectedGrievance, status, admin_remarks: remarks });
        }
      }
    } catch (err) {
      showToast("Error updating grievance status", "error");
    }
  };

  // ── DOWNLOADS CRUD ────────────────────────────────────────────────────────
  const openCreateDocModal = () => {
    setEditingDocId(null);
    setDocForm({ category: "acts", title: "", file: "", meta: "", desc: "", file_size: "Official PDF", sort_order: downloads.length + 1, is_active: 1 });
    setShowDocModal(true);
  };

  const openEditDocModal = (d) => {
    setEditingDocId(d.id);
    setDocForm({
      id: d.id,
      category: d.category || "acts",
      title: d.title || "",
      file: d.file || "",
      meta: d.meta || "",
      desc: d.desc || "",
      file_size: d.fileSize || d.file_size || "Official PDF",
      sort_order: d.sort_order ?? 0,
      is_active: Number(d.is_active) !== 0 ? 1 : 0
    });
    setShowDocModal(true);
  };

  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!docForm.title.trim() || !docForm.file.trim()) {
      showToast("Title and PDF file URL are required", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await adminSaveDownload(adminKey, docForm);
      if (res && res.success) {
        showToast(editingDocId ? "Document updated!" : "New document added!");
        setShowDocModal(false);
        loadAllData();
      } else {
        showToast(res?.message || "Failed to save document", "error");
      }
    } catch (err) {
      showToast("Error saving document", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDocActive = async (id, currentActive) => {
    try {
      const res = await adminToggleDownloadActive(adminKey, id, currentActive ? 0 : 1);
      if (res && res.success) {
        setDownloads((prev) =>
          prev.map((d) => (d.id === id ? { ...d, is_active: currentActive ? 0 : 1 } : d))
        );
        showToast(currentActive ? "Document hidden" : "Document published!");
      }
    } catch (err) {
      showToast("Error updating status", "error");
    }
  };

  // ── FAQS CRUD ─────────────────────────────────────────────────────────────
  const openCreateFaqModal = () => {
    setEditingFaqId(null);
    setFaqForm({ category: "General", q: "", a: "", sort_order: faqs.length + 1, is_active: 1 });
    setShowFaqModal(true);
  };

  const openEditFaqModal = (f) => {
    setEditingFaqId(f.id);
    setFaqForm({
      id: f.id,
      category: f.category || "General",
      q: f.q || "",
      a: f.a || "",
      sort_order: f.sort_order ?? 0,
      is_active: Number(f.is_active) !== 0 ? 1 : 0
    });
    setShowFaqModal(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.q.trim() || !faqForm.a.trim()) {
      showToast("Question and Answer are required", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await adminSaveFaq(adminKey, faqForm);
      if (res && res.success) {
        showToast(editingFaqId ? "FAQ updated!" : "New FAQ created!");
        setShowFaqModal(false);
        loadAllData();
      } else {
        showToast(res?.message || "Failed to save FAQ", "error");
      }
    } catch (err) {
      showToast("Error saving FAQ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFaqActive = async (id, currentActive) => {
    try {
      const res = await adminToggleFaqActive(adminKey, id, currentActive ? 0 : 1);
      if (res && res.success) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === id ? { ...f, is_active: currentActive ? 0 : 1 } : f))
        );
        showToast(currentActive ? "FAQ hidden" : "FAQ published!");
      }
    } catch (err) {
      showToast("Error updating FAQ status", "error");
    }
  };

  // ── DROPDOWNS CRUD ────────────────────────────────────────────────────────
  const openCreateDropdownModal = () => {
    setEditingDropdownId(null);
    setDropdownForm({ parent_label: "Partner with us", section: "Main", label: "", path: "", sub_items: [], sort_order: dropdowns.length + 1, is_active: 1 });
    setShowDropdownModal(true);
  };

  const openEditDropdownModal = (d) => {
    setEditingDropdownId(d.id);
    let subs = [];
    try {
      subs = typeof d.sub_items_json === "string" ? JSON.parse(d.sub_items_json || "[]") : (d.sub_items_json || []);
    } catch (e) { subs = []; }
    setDropdownForm({
      id: d.id,
      parent_label: d.parent_label || "Partner with us",
      section: d.section || "Main",
      label: d.label || "",
      path: d.path || "",
      sub_items: subs,
      sort_order: d.sort_order ?? 0,
      is_active: Number(d.is_active) !== 0 ? 1 : 0
    });
    setShowDropdownModal(true);
  };

  const handleSaveDropdown = async (e) => {
    e.preventDefault();
    if (!dropdownForm.label.trim() || !dropdownForm.path.trim()) {
      showToast("Label and path are required", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await adminSavePartnerDropdown(adminKey, {
        ...dropdownForm,
        sub_items_json: dropdownForm.sub_items
      });
      if (res && res.success) {
        showToast(editingDropdownId ? "Dropdown item updated!" : "Dropdown item added!");
        setShowDropdownModal(false);
        loadAllData();
        window.dispatchEvent(new Event("alertngo_partner_dropdowns_updated"));
      } else {
        showToast(res?.message || "Failed to save dropdown item", "error");
      }
    } catch (err) {
      showToast("Error saving dropdown item", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDropdownActive = async (id, currentActive) => {
    try {
      const res = await adminTogglePartnerDropdown(adminKey, id, currentActive ? 0 : 1);
      if (res && res.success) {
        setDropdowns((prev) =>
          prev.map((d) => (d.id === id ? { ...d, is_active: currentActive ? 0 : 1 } : d))
        );
        showToast(currentActive ? "Hidden from navbar" : "Active on navbar!");
        window.dispatchEvent(new Event("alertngo_partner_dropdowns_updated"));
      }
    } catch (err) {
      showToast("Error updating dropdown status", "error");
    }
  };

  // ── CONFIRM DELETE ────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      if (deleteTarget.type === "doc") {
        await adminDeleteDownload(adminKey, deleteTarget.id);
        showToast("Document deleted");
      } else if (deleteTarget.type === "faq") {
        await adminDeleteFaq(adminKey, deleteTarget.id);
        showToast("FAQ deleted");
      } else if (deleteTarget.type === "grv") {
        await adminDeleteGrievance(adminKey, deleteTarget.id);
        showToast("Grievance record removed");
        if (selectedGrievance && selectedGrievance.id === deleteTarget.id) setSelectedGrievance(null);
      } else if (deleteTarget.type === "dropdown") {
        await adminDeletePartnerDropdown(adminKey, deleteTarget.id);
        showToast("Dropdown link deleted");
        window.dispatchEvent(new Event("alertngo_partner_dropdowns_updated"));
      }
      setDeleteTarget(null);
      loadAllData();
    } catch (err) {
      showToast("Error executing delete", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── RESTORE DEFAULTS ──────────────────────────────────────────────────────
  const handleRestoreDefaults = async () => {
    setIsSyncing(true);
    try {
      const res = await adminSeedPartnerDefaults(adminKey);
      if (res && res.success) {
        showToast("All Partner, Grievance, Downloads, FAQs, and Dropdowns restored to defaults!");
        setShowSyncModal(false);
        loadAllData();
        window.dispatchEvent(new Event("alertngo_partner_dropdowns_updated"));
      }
    } catch (err) {
      showToast("Error restoring defaults", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered Downloads
  const filteredDownloads = downloads.filter((d) => {
    const matchCat = docCatFilter === "all" || d.category === docCatFilter;
    const matchQ = !searchDoc.trim() ||
      (d.title || "").toLowerCase().includes(searchDoc.toLowerCase()) ||
      (d.desc || "").toLowerCase().includes(searchDoc.toLowerCase()) ||
      (d.meta || "").toLowerCase().includes(searchDoc.toLowerCase());
    return matchCat && matchQ;
  });

  // Filtered Grievances
  const filteredGrievances = grievances.filter((g) => {
    const matchSt = grvStatusFilter === "all" || g.status === grvStatusFilter;
    const matchQ = !searchGrv.trim() ||
      (g.name || "").toLowerCase().includes(searchGrv.toLowerCase()) ||
      (g.phone || "").toLowerCase().includes(searchGrv.toLowerCase()) ||
      (g.village || "").toLowerCase().includes(searchGrv.toLowerCase()) ||
      (g.tracking_code || "").toLowerCase().includes(searchGrv.toLowerCase()) ||
      (g.grievance_type || "").toLowerCase().includes(searchGrv.toLowerCase());
    return matchSt && matchQ;
  });

  return (
    <AdminLayout title="Partner & Resources Management">
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
        @media (max-width: 768px) {
          .adm-card-panel {
            padding: 14px 10px !important;
          }
          .adm-section-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adm-section-header > button,
          .adm-section-header > div:last-child > button {
            width: 100% !important;
            padding: 9px 14px !important;
            font-size: 0.82rem !important;
            white-space: nowrap !important;
            height: 38px !important;
            min-height: 38px !important;
            box-sizing: border-box !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .adm-section-header h3 {
            font-size: 1.05rem !important;
          }
          .adm-section-header p {
            font-size: 0.8rem !important;
          }
          .adm-partner-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 18px !important;
          }
          .adm-partner-head h1 {
            font-size: 1.15rem !important;
            line-height: 1.3 !important;
          }
          .adm-partner-head p {
            font-size: 0.8rem !important;
          }
          .adm-partner-head > div:first-child > div:first-child {
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .adm-partner-head > div:first-child > div:first-child span {
            font-size: 0.7rem !important;
          }
          .adm-partner-actions {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .adm-partner-actions > * {
            width: 100% !important;
            padding: 8px 12px !important;
            font-size: 0.8rem !important;
            text-align: center !important;
            justify-content: center !important;
            height: 36px !important;
            min-height: 36px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .adm-partner-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 6px !important;
            width: 100% !important;
          }
          .adm-partner-tabs button {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            font-size: 0.72rem !important;
            padding: 7px 10px !important;
          }
          .adm-partner-search {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .adm-partner-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .adm-partner-dropdown-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .adm-partner-dropdown-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr 40px !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .adm-partner-dropdown-actions button {
            width: 100% !important;
            height: 34px !important;
            min-height: 34px !important;
            padding: 6px 8px !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 0.74rem !important;
            box-sizing: border-box !important;
          }
          /* ── Grievances filter bar ── */
          .adm-grv-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 12px !important;
          }
          .adm-grv-filter-pills {
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .adm-grv-filter-pills button {
            font-size: 0.72rem !important;
            padding: 4px 9px !important;
          }
          /* ── Downloads & statutory filter bar ── */
          .adm-partner-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 12px 10px !important;
          }
          .adm-partner-filter-pills {
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .adm-partner-filter-pills button {
            font-size: 0.72rem !important;
            padding: 4px 9px !important;
          }
          /* ── Download cards ── */
          .adm-doc-card-actions {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            width: 100% !important;
            justify-content: flex-end !important;
          }
          .adm-doc-card-actions > * {
            font-size: 0.72rem !important;
            padding: 4px 8px !important;
          }
          /* ── FAQ items ── */
          .adm-faq-item-head {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .adm-faq-item-head h3 {
            font-size: 0.95rem !important;
          }
          .adm-faq-actions {
            display: flex !important;
            gap: 6px !important;
            width: 100% !important;
            justify-content: flex-end !important;
          }
          .adm-faq-actions button {
            font-size: 0.72rem !important;
            padding: 4px 8px !important;
          }
          .adm-faq-answer {
            padding-left: 0 !important;
            font-size: 0.82rem !important;
            line-height: 1.5 !important;
          }
          /* ── Dropdown items ── */
          .adm-partner-dropdown-subs {
            padding: 8px 10px !important;
          }
          .adm-partner-dropdown-subs span {
            font-size: 0.74rem !important;
          }
          /* ── Grievances table → card view on mobile ── */
          .adm-grv-table-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .adm-grv-table {
            font-size: 0.75rem !important;
            min-width: 560px !important;
          }
          .adm-grv-table th,
          .adm-grv-table td {
            padding: 10px 10px !important;
          }
          .adm-grv-table th {
            font-size: 0.7rem !important;
          }
          /* ── Glossary / Acronym grid ── */
          .adm-grv-glossary-grid {
            grid-template-columns: 1fr !important;
          }
          .adm-modal-backdrop {
            padding: 6px 4px !important;
          }
          .adm-partner-modal {
            max-width: calc(100vw - 10px) !important;
            width: calc(100vw - 10px) !important;
            padding: 14px 10px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            max-height: 94vh !important;
            overflow-x: hidden !important;
          }
          .adm-partner-modal * {
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
          .adm-partner-modal input,
          .adm-partner-modal select,
          .adm-partner-modal textarea {
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

        {/* ── TOP VIEW TABS SWITCHER ── */}
        <div className="adm-partner-tabs" style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1f2937", paddingBottom: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("partner")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "partner" ? "#0284c7" : "#1f2937",
              background: activeTab === "partner" ? "rgba(2, 132, 199, 0.2)" : "#111827",
              color: activeTab === "partner" ? "#38bdf8" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaHandsHelping size={15} /> 🤝 Partner with Us (/partner)
          </button>

          <button
            onClick={() => setTab("grievances")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "grievances" ? "#f59e0b" : "#1f2937",
              background: activeTab === "grievances" ? "rgba(245, 158, 11, 0.2)" : "#111827",
              color: activeTab === "grievances" ? "#fbbf24" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaExclamationCircle size={15} /> 📢 Grievances Portal ({grievances.length})
          </button>

          <button
            onClick={() => setTab("grievance_pages")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "grievance_pages" ? "#f59e0b" : "#1f2937",
              background: activeTab === "grievance_pages" ? "rgba(245, 158, 11, 0.2)" : "#111827",
              color: activeTab === "grievance_pages" ? "#fbbf24" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaFileAlt size={15} /> ⚖️ Grievance Pages (4)
          </button>

          <button
            onClick={() => setTab("download_pages")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "download_pages" ? "#10b981" : "#1f2937",
              background: activeTab === "download_pages" ? "rgba(16, 185, 129, 0.2)" : "#111827",
              color: activeTab === "download_pages" ? "#34d399" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaFolderOpen size={15} /> 🏛️ Downloads Pages (4)
          </button>

          <button
            onClick={() => setTab("quick_links")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "quick_links" ? "#38bdf8" : "#1f2937",
              background: activeTab === "quick_links" ? "rgba(56, 189, 248, 0.2)" : "#111827",
              color: activeTab === "quick_links" ? "#38bdf8" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaExternalLinkAlt size={14} /> 🔗 Quick Links (/quick-links)
          </button>

          <button
            onClick={() => setTab("downloads")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "downloads" ? "#10b981" : "#1f2937",
              background: activeTab === "downloads" ? "rgba(16, 185, 129, 0.2)" : "#111827",
              color: activeTab === "downloads" ? "#34d399" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaFolderOpen size={15} /> 📥 Downloads & Legal Acts ({downloads.length})
          </button>

          <button
            onClick={() => setTab("faqs")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "faqs" ? "#8b5cf6" : "#1f2937",
              background: activeTab === "faqs" ? "rgba(139, 92, 246, 0.2)" : "#111827",
              color: activeTab === "faqs" ? "#c4b5fd" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaQuestionCircle size={15} /> ❓ FAQ’s Center ({faqs.length})
          </button>

          <button
            onClick={() => setTab("dropdowns")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: activeTab === "dropdowns" ? "#ea580c" : "#1f2937",
              background: activeTab === "dropdowns" ? "rgba(234, 88, 12, 0.2)" : "#111827",
              color: activeTab === "dropdowns" ? "#fb923c" : "#94a3b8",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <FaBars size={15} /> 📑 Navbar Dropdown Menus Manager ({dropdowns.length})
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PARTNER WITH US (/partner)                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "partner" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* TOP HEADER */}
            <div className="adm-partner-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(2, 132, 199, 0.15)", color: "#38bdf8", border: "1px solid rgba(2, 132, 199, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                    Partner Management
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to MySQL table `partner_page`</span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff" }}>
                  Partner with ALERT Configuration
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Manage CSR routes, grant partnerships, due diligence records, commitments, and hero media shown on{" "}
                  <Link to="/partner" target="_blank" style={{ color: "#38bdf8" }}>/partner</Link>.
                </p>
              </div>

              <div className="adm-partner-actions" style={{ display: "flex", gap: 10 }}>
                <Link to="/partner" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#1e293b", borderRadius: 8, color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                  <FaExternalLinkAlt size={12} /> View Live /partner
                </Link>
                <button onClick={() => setShowSyncModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#334155", borderRadius: 8, color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  <FaSyncAlt size={12} /> Reset Defaults
                </button>
                <button onClick={() => handleSavePartnerPage()} disabled={isSaving} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#0284c7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  <FaSave /> {isSaving ? "Saving..." : "Save Partner Changes"}
                </button>
              </div>
            </div>

            {/* SECTION 01 & HERO MULTIMEDIA */}
            <div className="adm-modal-form-grid" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24, display: "grid", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "#38bdf8", fontWeight: 700 }}>Hero Headline & Overview</h3>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Badge</label>
                  <input type="text" value={partnerPage.badge || ""} onChange={(e) => setPartnerPage({ ...partnerPage, badge: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Title</label>
                  <input type="text" value={partnerPage.title || ""} onChange={(e) => setPartnerPage({ ...partnerPage, title: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Subtitle</label>
                  <textarea rows={3} value={partnerPage.subtitle || ""} onChange={(e) => setPartnerPage({ ...partnerPage, subtitle: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", lineHeight: 1.5 }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Intro Paragraph 1</label>
                  <textarea rows={3} value={partnerPage.intro_p1 || ""} onChange={(e) => setPartnerPage({ ...partnerPage, intro_p1: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", lineHeight: 1.5 }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Contact / Enquiry Email</label>
                  <input type="text" value={partnerPage.contact_email || ""} onChange={(e) => setPartnerPage({ ...partnerPage, contact_email: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>
              </div>

              {/* HERO MEDIA PREVIEW */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "#38bdf8", fontWeight: 700 }}>Supporting Photo or Video</h3>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Hero Media Type</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setPartnerPage({ ...partnerPage, hero_media_type: "image" })}
                      style={{ padding: "8px", borderRadius: 6, border: "1px solid", borderColor: partnerPage.hero_media_type === "image" ? "#0284c7" : "#1f2937", background: partnerPage.hero_media_type === "image" ? "rgba(2,132,199,0.2)" : "#0b0f17", color: partnerPage.hero_media_type === "image" ? "#38bdf8" : "#94a3b8", cursor: "pointer", fontWeight: 700 }}
                    >
                      <FaImages /> Photo Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerPage({ ...partnerPage, hero_media_type: "video" })}
                      style={{ padding: "8px", borderRadius: 6, border: "1px solid", borderColor: partnerPage.hero_media_type === "video" ? "#e11d48" : "#1f2937", background: partnerPage.hero_media_type === "video" ? "rgba(225,29,72,0.2)" : "#0b0f17", color: partnerPage.hero_media_type === "video" ? "#fb7185" : "#94a3b8", cursor: "pointer", fontWeight: 700 }}
                    >
                      <FaVideo /> Video / MP4
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>File URL or Upload</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" value={partnerPage.hero_media_url || ""} onChange={(e) => setPartnerPage({ ...partnerPage, hero_media_url: e.target.value })} placeholder="/uploads/... or URL" style={{ flex: 1, padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                    <input type="file" ref={heroInputRef} style={{ display: "none" }} accept={partnerPage.hero_media_type === "video" ? "video/*" : "image/*"} onChange={(e) => handleUpload(e, partnerPage.hero_media_type, (url) => setPartnerPage((prev) => ({ ...prev, hero_media_url: url })))} />
                    <button type="button" onClick={() => heroInputRef.current?.click()} disabled={isUploading} style={{ padding: "8px 14px", background: "#334155", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem" }}>
                      Upload
                    </button>
                  </div>
                </div>

                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 10, height: 240, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {partnerPage.hero_media_url ? (
                    partnerPage.hero_media_type === "video" ? (
                      <video src={resolveUploadUrl(partnerPage.hero_media_url)} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <img
                        src={resolveUploadUrl(partnerPage.hero_media_url)}
                        alt="Partner hero"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          if (!e.currentTarget.dataset.fallbackTried) {
                            e.currentTarget.dataset.fallbackTried = "1";
                            e.currentTarget.src = "/uploads/reels/reel-4-women.jpg";
                          }
                        }}
                      />
                    )
                  ) : (
                    <span style={{ color: "#64748b" }}>No media selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 02: 4 WAYS TO PARTNER */}
            <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>Section 02: Ways to Partner ({partnerRoutes.length})</h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>CSR 80G, FCRA Grants, Community Partnerships & In-Kind Support cards</p>
                </div>
                <button
                  onClick={() => {
                    setEditingRouteIdx(null);
                    setRouteForm({ icon: "FaBuilding", title: "", body: "", fits: "" });
                    setShowRouteModal(true);
                  }}
                  style={{ padding: "8px 14px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                >
                  + Add Route
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
                {partnerRoutes.map((r, rIdx) => (
                  <div key={rIdx} style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(56,189,248,0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {renderRouteIcon(r.icon)}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { setEditingRouteIdx(rIdx); setRouteForm({ ...r }); setShowRouteModal(true); }} style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer" }}><FaEdit /></button>
                        <button onClick={() => { const u = partnerRoutes.filter((_, i) => i !== rIdx); setPartnerRoutes(u); handleSavePartnerPage({ ...partnerPage, routes_json: u }); }} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><FaTrash /></button>
                      </div>
                    </div>
                    <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#fff" }}>{r.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.5, flex: 1 }}>{r.body}</p>
                    <div style={{ fontSize: "0.76rem", color: "#94a3b8", borderTop: "1px dashed #1f2937", paddingTop: 8 }}>
                      <strong>Suited to:</strong> {r.fits}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 03: WHERE SUPPORT GOES (MISSIONS) */}
            <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>
                      {partnerPage.missions_badge || "Section 03"}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      {partnerPage.missions_title || "Where Support Goes"} ({partnerMissions.length})
                    </h3>
                  </div>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                    Four ring-fenced missions: Land & Forest Rights, Polavaram Rehab, Antyodaya Livelihoods & Child Rights
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMissionIdx(null);
                      setMissionForm({ icon: "FaGavel", title: "", body: "", tell: "" });
                      setShowMissionModal(true);
                    }}
                    style={{ padding: "8px 14px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <FaPlus size={12} /> Add Mission
                  </button>
                </div>
              </div>

              {/* Editable Section 03 Headline Settings */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12, marginBottom: 18, background: "#0b0f17", padding: 14, borderRadius: 10, border: "1px solid #1f2937" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Badge</label>
                  <input type="text" value={partnerPage.missions_badge || ""} onChange={(e) => setPartnerPage({ ...partnerPage, missions_badge: e.target.value })} style={{ width: "100%", padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Section 03 Title</label>
                  <input type="text" value={partnerPage.missions_title || ""} onChange={(e) => setPartnerPage({ ...partnerPage, missions_title: e.target.value })} style={{ width: "100%", padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem", fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Section 03 Subtitle</label>
                  <input type="text" value={partnerPage.missions_subtitle || ""} onChange={(e) => setPartnerPage({ ...partnerPage, missions_subtitle: e.target.value })} style={{ width: "100%", padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem" }} />
                </div>
              </div>

              {/* Missions Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
                {partnerMissions.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "28px 16px", color: "#64748b", background: "#0b0f17", borderRadius: 10, border: "1px dashed #1f2937" }}>
                    <p style={{ margin: "0 0 10px", fontSize: "0.88rem" }}>No support missions configured yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const defaults = [
                          { icon: "FaGavel", title: "Land & Forest Rights", body: "Recognition of Forest Rights Act and LTR 1970 claims, Community Forest Resource mapping, title-suit recovery, and legal aid for habitation-level rights disputes across the Eastern Ghats agency zones.", tell: "Tell us if you want to fund legal aid, claim facilitation or document recovery." },
                          { icon: "FaWater", title: "Polavaram Rehabilitation", body: "Household surveys, RFCTLARR Act 2013 entitlement tracking, R&R social audits and grievance redressal support for families in the submergence belt of Godavari and Krishna districts.", tell: "Tell us if you want to back field research, social audits or victim support." },
                          { icon: "FaUsers", title: "Antyodaya Livelihoods", body: "Women's cooperatives and SHGs — micro-savings, revolving credit, estuarine fishing and mangrove work, house-site pattas and market linkage for coastal Krishna mandals.", tell: "Tell us if you want to seed a cooperative, a revolving fund or skills training." },
                          { icon: "FaGraduationCap", title: "Child Rights & Basic Services", body: "Joyful learning centres, digital classrooms and kits, school kits and kits for out-of-school children, alongside child-protection and nutrition monitoring at the village level.", tell: "Tell us if you want to equip a classroom, a centre or a batch of students." }
                        ];
                        setPartnerMissions(defaults);
                        handleSavePartnerPage({ ...partnerPage, missions_json: defaults });
                      }}
                      style={{ padding: "7px 14px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700 }}
                    >
                      Load 4 Default Missions
                    </button>
                  </div>
                ) : (
                  partnerMissions.map((m, mIdx) => (
                    <div key={mIdx} style={{ background: "#0b0f17", border: "1px solid #1f2937", borderLeft: "3px solid #059669", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {renderRouteIcon(m.icon)}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMissionIdx(mIdx);
                              setMissionForm({ ...m });
                              setShowMissionModal(true);
                            }}
                            style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", padding: 4 }}
                            title="Edit Mission"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete mission "${m.title}"?`)) {
                                const u = partnerMissions.filter((_, i) => i !== mIdx);
                                setPartnerMissions(u);
                                handleSavePartnerPage({ ...partnerPage, missions_json: u });
                              }
                            }}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 4 }}
                            title="Delete Mission"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#fff" }}>{m.title}</h4>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.5, flex: 1 }}>{m.body}</p>
                      {m.tell && (
                        <div style={{ fontSize: "0.76rem", color: "#34d399", borderTop: "1px dashed #1f2937", paddingTop: 8, fontWeight: 600 }}>
                          {m.tell}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 04: DUE DILIGENCE RECORDS */}
            <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>Section 04: Due Diligence & Statutory Documents ({partnerDiligence.length})</h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Audited registration profiles, annual reports, and 80G governance manuals</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDiligenceIdx(null);
                    setDiligenceForm({ title: "", file: "", meta: "", icon: "FaFilePdf" });
                    setShowDiligenceModal(true);
                  }}
                  style={{
                    padding: "9px 16px",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <FaPlus size={12} /> Add Document
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {partnerDiligence.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 20px", color: "#64748b", background: "#0b0f17", borderRadius: 10, border: "1px dashed #1f2937" }}>
                    <FaFilePdf size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>No statutory or due diligence documents added yet.</p>
                  </div>
                ) : (
                  partnerDiligence.map((d, dIdx) => (
                    <div
                      key={dIdx}
                      style={{
                        background: "#0b0f17",
                        border: "1px solid #1f2937",
                        borderRadius: 12,
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(225, 29, 72, 0.25) 100%)",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#f43f5e",
                            flexShrink: 0
                          }}
                        >
                          <FaFilePdf size={22} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.96rem", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {d.title}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#94a3b8" }}>
                            {d.meta && (
                              <span style={{ padding: "2px 8px", background: "rgba(16, 185, 129, 0.12)", color: "#34d399", borderRadius: 4, border: "1px solid rgba(16, 185, 129, 0.25)", fontWeight: 600, fontSize: "0.75rem" }}>
                                {d.meta}
                              </span>
                            )}
                            <span style={{ color: "#38bdf8", wordBreak: "break-all" }}>
                              {d.file}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {d.file && (
                          <a
                            href={resolveUploadUrl(d.file)}
                            target="_blank"
                            rel="noreferrer"
                            title="View PDF"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 12px",
                              background: "rgba(56, 189, 248, 0.12)",
                              border: "1px solid rgba(56, 189, 248, 0.25)",
                              borderRadius: 6,
                              color: "#38bdf8",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              textDecoration: "none"
                            }}
                          >
                            <FaEye size={12} /> View
                          </a>
                        )}
                        <button
                          type="button"
                          title="Edit Document"
                          onClick={() => {
                            setEditingDiligenceIdx(dIdx);
                            setDiligenceForm({ ...d });
                            setShowDiligenceModal(true);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 12px",
                            background: "rgba(2, 132, 199, 0.15)",
                            border: "1px solid rgba(2, 132, 199, 0.3)",
                            borderRadius: 6,
                            color: "#38bdf8",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          <FaEdit size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          title="Delete Document"
                          onClick={() => {
                            if (window.confirm(`Delete "${d.title}"?`)) {
                              const u = partnerDiligence.filter((_, i) => i !== dIdx);
                              setPartnerDiligence(u);
                              handleSavePartnerPage({ ...partnerPage, diligence_json: u });
                              showToast("Document deleted successfully");
                            }
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 12px",
                            background: "rgba(244, 63, 94, 0.15)",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            borderRadius: 6,
                            color: "#fb7185",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          <FaTrash size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* INSTITUTIONAL COMMITMENTS & REGISTRATION / TAX DETAILS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: 24 }}>
              
              {/* OUR INSTITUTIONAL COMMITMENTS */}
              <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                      <FaCheckCircle style={{ color: "#10b981" }} /> Institutional Commitments ({partnerCommitments.length})
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.83rem" }}>
                      Governance, project-scoped agreements, social audits, and zero-diversion compliance
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const defaults = [
                        "Project-scoped agreement with clear deliverables, budget heads and a reporting calendar",
                        "Social audit and beneficiary-level verification before a grant is renewed",
                        "Named field officer and a site visit for every funded intervention",
                        "Donations and grants reported publicly in our News & Views and annual report",
                        "Zero tolerance on diversion: 12A & 80G, FCRA and POSH compliant operations"
                      ];
                      setPartnerCommitments(defaults);
                      handleSavePartnerPage({ ...partnerPage, commitments_json: defaults });
                    }}
                    style={{ padding: "4px 10px", background: "#1f2937", border: "1px solid #374151", borderRadius: 6, color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Reset Defaults
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Commitments Section Title</label>
                  <input
                    type="text"
                    value={partnerPage.commitments_title || ""}
                    onChange={(e) => setPartnerPage({ ...partnerPage, commitments_title: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}
                  />
                </div>

                {/* Add new commitment input */}
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={newCommitmentText}
                    onChange={(e) => setNewCommitmentText(e.target.value)}
                    placeholder="Type a new institutional commitment policy..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCommitmentText.trim()) {
                          const u = [...partnerCommitments, newCommitmentText.trim()];
                          setPartnerCommitments(u);
                          setNewCommitmentText("");
                        }
                      }
                    }}
                    style={{ flex: 1, padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.85rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCommitmentText.trim()) {
                        const u = [...partnerCommitments, newCommitmentText.trim()];
                        setPartnerCommitments(u);
                        setNewCommitmentText("");
                      }
                    }}
                    style={{ padding: "8px 14px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap" }}
                  >
                    + Add
                  </button>
                </div>

                {/* Commitment items list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {partnerCommitments.map((c, cIdx) => (
                    <div key={cIdx} style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
                        <FaCheckCircle size={14} style={{ color: "#10b981", marginTop: 3, flexShrink: 0 }} />
                        <input
                          type="text"
                          value={c}
                          onChange={(e) => {
                            const u = [...partnerCommitments];
                            u[cIdx] = e.target.value;
                            setPartnerCommitments(u);
                          }}
                          style={{ width: "100%", background: "transparent", border: "none", color: "#e2e8f0", fontSize: "0.84rem", outline: "none", lineHeight: 1.5 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const u = partnerCommitments.filter((_, i) => i !== cIdx);
                          setPartnerCommitments(u);
                        }}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 4 }}
                        title="Remove commitment"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* REGISTRATION & TAX DETAILS */}
              <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                      Registration & Tax Details
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.83rem" }}>
                      Legal form, Society Reg No., 12A & 80G tax exemptions, FCRA status, and Head Office
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const defaults = [
                        { label: "Legal form", value: "Registered Society, Andhra Pradesh" },
                        { label: "Reg. No.", value: "307/2004" },
                        { label: "Tax status", value: "12A & 80G — donations tax-exempt" },
                        { label: "Foreign contributions", value: "FCRA-compliant institutional grants" },
                        { label: "Head office", value: "Vijayawada, Krishna District, Andhra Pradesh" }
                      ];
                      setRegistrationItems(defaults);
                    }}
                    style={{ padding: "4px 10px", background: "#1f2937", border: "1px solid #374151", borderRadius: 6, color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Reset Defaults
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Section Title</label>
                  <input
                    type="text"
                    value={partnerPage.registration_title || "Registration & tax details"}
                    onChange={(e) => setPartnerPage({ ...partnerPage, registration_title: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.85rem", fontWeight: 700 }}
                  />
                </div>

                {/* Key-Value details editor */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {registrationItems.map((item, rIdx) => (
                    <div key={rIdx} style={{ display: "grid", gridTemplateColumns: "140px 1fr 32px", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const u = [...registrationItems];
                          u[rIdx].label = e.target.value;
                          setRegistrationItems(u);
                        }}
                        placeholder="Label (e.g. Legal form)"
                        style={{ padding: "8px 10px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#93c5fd", fontSize: "0.82rem", fontWeight: 600 }}
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => {
                          const u = [...registrationItems];
                          u[rIdx].value = e.target.value;
                          setRegistrationItems(u);
                        }}
                        placeholder="Value (e.g. Registered Society...)"
                        style={{ padding: "8px 10px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const u = registrationItems.filter((_, i) => i !== rIdx);
                          setRegistrationItems(u);
                        }}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "grid", placeItems: "center" }}
                        title="Delete Detail Row"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new key-value row */}
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 70px", gap: 8, alignItems: "center", background: "#0b0f17", padding: 10, borderRadius: 8, border: "1px dashed #1f2937" }}>
                  <input
                    type="text"
                    value={newRegItem.label}
                    onChange={(e) => setNewRegItem({ ...newRegItem, label: e.target.value })}
                    placeholder="New Label..."
                    style={{ padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.8rem" }}
                  />
                  <input
                    type="text"
                    value={newRegItem.value}
                    onChange={(e) => setNewRegItem({ ...newRegItem, value: e.target.value })}
                    placeholder="New Value..."
                    style={{ padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.8rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newRegItem.label.trim() && newRegItem.value.trim()) {
                        setRegistrationItems([...registrationItems, { label: newRegItem.label.trim(), value: newRegItem.value.trim() }]);
                        setNewRegItem({ label: "", value: "" });
                      }
                    }}
                    style={{ padding: "7px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}
                  >
                    + Row
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Note / Document Request Disclaimer</label>
                  <textarea
                    rows={2}
                    value={partnerPage.registration_note || ""}
                    onChange={(e) => setPartnerPage({ ...partnerPage, registration_note: e.target.value })}
                    placeholder="Certificates, PAN, FCRA sanction and audited statements are shared on request..."
                    style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem", lineHeight: 1.5 }}
                  />
                </div>
              </div>
            </div>

            {/* CTA CONFIGURATION STRIP */}
            <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Bottom Call to Action Banner</h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.83rem" }}>Configure the concluding partnership proposal strip at the bottom of the page</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSavePartnerPage()}
                  disabled={isSaving}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#0284c7", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
                >
                  <FaSave size={12} /> {isSaving ? "Saving..." : "Save All Partner Settings"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>CTA Badge</label>
                  <input type="text" value={partnerPage.cta_badge || ""} onChange={(e) => setPartnerPage({ ...partnerPage, cta_badge: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.85rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>CTA Title</label>
                  <input type="text" value={partnerPage.cta_title || ""} onChange={(e) => setPartnerPage({ ...partnerPage, cta_title: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.85rem", fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>CTA Email Subject</label>
                  <input type="text" value={partnerPage.cta_email_subject || ""} onChange={(e) => setPartnerPage({ ...partnerPage, cta_email_subject: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.85rem" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: GRIEVANCES PORTAL (/grievances)                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "grievances" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="adm-partner-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                    Grievances Redressal
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to MySQL table `grievances`</span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff" }}>
                  Grievance Representations & Redressal
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Review and process community grievance submissions for Polavaram R&R and Land Rights from{" "}
                  <Link to="/grievances" target="_blank" style={{ color: "#38bdf8" }}>/grievances</Link>.
                </p>
              </div>

              <div className="adm-partner-actions" style={{ display: "flex", gap: 10 }}>
                <Link to="/grievances" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#1e293b", borderRadius: 8, color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                  <FaExternalLinkAlt size={12} /> View Live /grievances
                </Link>
                <button onClick={() => handleSaveGrievancePage()} disabled={isSaving} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#f59e0b", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer" }}>
                  <FaSave /> {isSaving ? "Saving..." : "Save Portal Settings"}
                </button>
              </div>
            </div>

            {/* SEARCH & STATUS FILTER */}
            <div className="adm-grv-filter-bar" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div className="adm-grv-filter-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 700 }}>Status:</span>
                {["all", "registered", "under_investigation", "submitted_to_sdc", "resolved"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setGrvStatusFilter(st)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 20,
                      border: "1px solid",
                      borderColor: grvStatusFilter === st ? "#f59e0b" : "#1f2937",
                      background: grvStatusFilter === st ? "rgba(245, 158, 11, 0.2)" : "#0b0f17",
                      color: grvStatusFilter === st ? "#fbbf24" : "#94a3b8",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "capitalize"
                    }}
                  >
                    {st.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <div className="adm-partner-search" style={{ position: "relative", minWidth: 0, width: "100%", maxWidth: 400 }}>
                <FaSearch size={13} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  value={searchGrv}
                  onChange={(e) => setSearchGrv(e.target.value)}
                  placeholder="Search by name, tracking code, village..."
                  style={{ width: "100%", padding: "8px 14px 8px 36px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                />
              </div>
            </div>

            {/* GRIEVANCES TABLE */}
            <div className="adm-grv-table-wrap" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, overflowX: "auto" }}>
              <table className="adm-grv-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ background: "#0b0f17", borderBottom: "1px solid #1f2937", color: "#94a3b8" }}>
                    <th style={{ padding: "14px 18px" }}>Tracking Code</th>
                    <th style={{ padding: "14px 18px" }}>Applicant & Contact</th>
                    <th style={{ padding: "14px 18px" }}>Village / Mandal</th>
                    <th style={{ padding: "14px 18px" }}>Grievance Category</th>
                    <th style={{ padding: "14px 18px" }}>Status</th>
                    <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrievances.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                        No grievances found.
                      </td>
                    </tr>
                  ) : (
                    filteredGrievances.map((g) => (
                      <tr key={g.id} style={{ borderBottom: "1px solid #1f2937", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 18px", fontWeight: 700, color: "#fbbf24" }}>{g.tracking_code}</td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 700, color: "#fff" }}>{g.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{g.phone}</div>
                        </td>
                        <td style={{ padding: "14px 18px", color: "#cbd5e1" }}>
                          {g.village}, {g.mandal}
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{g.district}</div>
                        </td>
                        <td style={{ padding: "14px 18px", color: "#38bdf8" }}>{g.grievance_type}</td>
                        <td style={{ padding: "14px 18px" }}>
                          <select
                            value={g.status || "registered"}
                            onChange={(e) => handleUpdateGrievanceStatus(g.id, e.target.value, g.admin_remarks)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: g.status === "resolved" ? "rgba(16,185,129,0.2)" : g.status === "submitted_to_sdc" ? "rgba(2,132,199,0.2)" : "rgba(245,158,11,0.2)",
                              color: g.status === "resolved" ? "#34d399" : g.status === "submitted_to_sdc" ? "#38bdf8" : "#fbbf24",
                              border: "1px solid #374151",
                              fontSize: "0.78rem",
                              fontWeight: 700
                            }}
                          >
                            <option value="registered">Registered</option>
                            <option value="under_investigation">Under Investigation</option>
                            <option value="submitted_to_sdc">Submitted to SDC</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 8 }}>
                            <button
                              onClick={() => setSelectedGrievance(g)}
                              style={{ padding: "5px 10px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: "grv", id: g.id, label: g.tracking_code })}
                              style={{ padding: "5px 10px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem" }}
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── 2. GRIEVANCE CATEGORIES MANAGER ── */}
            <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "2px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>
                      Public Form Options
                    </span>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      Grievance Categories ({grievanceCategories.length})
                    </h3>
                  </div>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                    Options shown in the <strong>Grievance Category *</strong> dropdown on <Link to="/grievances" target="_blank" style={{ color: "#38bdf8" }}>/grievances</Link>. Add, edit, or delete any category anytime.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const defaults = [
                        { value: "R&R Package Entitlement", label: "R&R Package Entitlement", desc: "₹10 Lakh or House allotment" },
                        { value: "Adult Youth Package", label: "Adult Youth (18+ Yrs) Package", desc: "Non-inclusion in entitlement roll" },
                        { value: "Land Valuation / Award Issue", label: "Land Valuation / Low Compensation", desc: "Discrepancy in land award" },
                        { value: "House / Structure Valuation", label: "House Structure Valuation", desc: "Structure measurement discrepancy" },
                        { value: "Resettlement Colony Infrastructure", label: "R&R Colony Amenities", desc: "Water, power, access roads" },
                        { value: "RoFR Forest Land Patta Issue", label: "RoFR Forest Land Patta", desc: "Title rejection or pending claim" }
                      ];
                      setGrievanceCategories(defaults);
                      handleSaveGrievancePage({ ...grievancePage, categories_json: defaults });
                    }}
                    style={{ padding: "8px 14px", background: "#1f2937", border: "1px solid #374151", borderRadius: 6, color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                  >
                    Reset 6 Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatIdx(null);
                      setCatForm({ value: "", label: "", desc: "" });
                      setShowCatModal(true);
                    }}
                    style={{ padding: "8px 16px", background: "#f59e0b", color: "#000", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <FaPlus size={12} /> Add Category
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 14 }}>
                {grievanceCategories.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px 16px", color: "#64748b", background: "#0b0f17", borderRadius: 10, border: "1px dashed #1f2937" }}>
                    No grievance categories defined. Click "+ Add Category" to add one.
                  </div>
                ) : (
                  grievanceCategories.map((cat, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        background: "#0b0f17",
                        border: "1px solid #1f2937",
                        borderLeft: "3px solid #f59e0b",
                        borderRadius: 10,
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", lineHeight: 1.3 }}>
                          {cat.label}
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatIdx(cIdx);
                              setCatForm({ ...cat });
                              setShowCatModal(true);
                            }}
                            style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", padding: 4 }}
                            title="Edit Category"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete category "${cat.label}"?`)) {
                                const u = grievanceCategories.filter((_, i) => i !== cIdx);
                                setGrievanceCategories(u);
                                handleSaveGrievancePage({ ...grievancePage, categories_json: u });
                              }
                            }}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 4 }}
                            title="Delete Category"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </div>

                      {cat.desc && (
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.4 }}>
                          {cat.desc}
                        </div>
                      )}

                      <div style={{ marginTop: "auto", paddingTop: 6, borderTop: "1px dashed #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Form Value:</span>
                        <code style={{ fontSize: "0.72rem", color: "#fbbf24", background: "rgba(245,158,11,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                          {cat.value}
                        </code>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── 3. PORTAL HEADLINES & PUBLIC FORM CONFIG ── */}
            <div className="adm-modal-form-grid" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24, display: "grid", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "#fbbf24", fontWeight: 700 }}>
                  Portal Titles & Form Text
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Badge</label>
                    <input
                      type="text"
                      value={grievancePage.badge || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, badge: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Portal Main Title</label>
                    <input
                      type="text"
                      value={grievancePage.title || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, title: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Portal Subtitle / Introduction</label>
                  <textarea
                    rows={2}
                    value={grievancePage.subtitle || ""}
                    onChange={(e) => setGrievancePage({ ...grievancePage, subtitle: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Form Header Title</label>
                    <input
                      type="text"
                      value={grievancePage.form_title || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, form_title: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Success Screen Title</label>
                    <input
                      type="text"
                      value={grievancePage.success_title || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, success_title: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Form Instructions / Subtitle</label>
                  <input
                    type="text"
                    value={grievancePage.form_subtitle || ""}
                    onChange={(e) => setGrievancePage({ ...grievancePage, form_subtitle: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Success Follow-Up Message</label>
                  <textarea
                    rows={2}
                    value={grievancePage.success_desc || ""}
                    onChange={(e) => setGrievancePage({ ...grievancePage, success_desc: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", lineHeight: 1.5 }}
                  />
                </div>
              </div>

              {/* Supporting Hero Image/Banner */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "#fbbf24", fontWeight: 700 }}>
                  Hero / Top Banner Image
                </h3>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Banner Image URL or Upload</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={grievancePage.hero_image || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, hero_image: e.target.value })}
                      placeholder="/uploads/grievances/hero.jpg or URL"
                      style={{ flex: 1, padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }}
                    />
                    <input
                      type="file"
                      ref={grvHeroInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={(e) => handleUpload(e, "image", (url) => setGrievancePage((prev) => ({ ...prev, hero_image: url })))}
                    />
                    <button
                      type="button"
                      onClick={() => grvHeroInputRef.current?.click()}
                      disabled={isUploading}
                      style={{ padding: "8px 14px", background: "#334155", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      Upload
                    </button>
                    {grievancePage.hero_image && (
                      <button
                        type="button"
                        onClick={() => setGrievancePage({ ...grievancePage, hero_image: "" })}
                        style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 6, cursor: "pointer" }}
                        title="Clear banner image"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 10, height: 230, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {grievancePage.hero_image ? (
                    <img
                      src={grievancePage.hero_image}
                      alt="Grievance Banner"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#64748b" }}>
                      <FaImages size={32} style={{ marginBottom: 6, opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: "0.85rem" }}>No banner image uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── 4. OFFICIAL INFOGRAPHICS & VISUAL ABSTRACT IMAGES ── */}
            <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                    Official Charts & Infographic Documents (3 Images & FAQ PDF)
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                    Manage the authentic scraped charts and official PDF manual displayed on <Link to="/grievances" target="_blank" style={{ color: "#38bdf8" }}>/grievances</Link>.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18 }}>
                {/* Chart 1 */}
                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#38bdf8", background: "rgba(56,189,248,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                      Chart #1
                    </span>
                    {grievancePage.chart1_image && (
                      <button
                        type="button"
                        onClick={() => setGrievancePage({ ...grievancePage, chart1_image: "" })}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.75rem" }}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Chart Title</label>
                    <input
                      type="text"
                      value={grievancePage.chart1_title || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, chart1_title: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Image URL or Upload</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        value={grievancePage.chart1_image || ""}
                        onChange={(e) => setGrievancePage({ ...grievancePage, chart1_image: e.target.value })}
                        style={{ flex: 1, padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.8rem" }}
                      />
                      <input
                        type="file"
                        ref={chart1InputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => handleUpload(e, "image", (url) => setGrievancePage((prev) => ({ ...prev, chart1_image: url })))}
                      />
                      <button
                        type="button"
                        onClick={() => chart1InputRef.current?.click()}
                        disabled={isUploading}
                        style={{ padding: "6px 12px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 140, background: "#111827", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1f2937" }}>
                    {grievancePage.chart1_image ? (
                      <img src={grievancePage.chart1_image} alt={grievancePage.chart1_title || "Chart 1"} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.8rem" }}>No image</span>
                    )}
                  </div>
                </div>

                {/* Chart 2 */}
                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                      Chart #2 (R&R Abstract)
                    </span>
                    {grievancePage.chart2_image && (
                      <button
                        type="button"
                        onClick={() => setGrievancePage({ ...grievancePage, chart2_image: "" })}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.75rem" }}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Chart Title</label>
                    <input
                      type="text"
                      value={grievancePage.chart2_title || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, chart2_title: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Image URL or Upload</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        value={grievancePage.chart2_image || ""}
                        onChange={(e) => setGrievancePage({ ...grievancePage, chart2_image: e.target.value })}
                        style={{ flex: 1, padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.8rem" }}
                      />
                      <input
                        type="file"
                        ref={chart2InputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => handleUpload(e, "image", (url) => setGrievancePage((prev) => ({ ...prev, chart2_image: url })))}
                      />
                      <button
                        type="button"
                        onClick={() => chart2InputRef.current?.click()}
                        disabled={isUploading}
                        style={{ padding: "6px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 140, background: "#111827", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1f2937" }}>
                    {grievancePage.chart2_image ? (
                      <img src={grievancePage.chart2_image} alt={grievancePage.chart2_title || "Chart 2"} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.8rem" }}>No image</span>
                    )}
                  </div>
                </div>

                {/* Chart 3 */}
                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                      Chart #3 (Land Rights)
                    </span>
                    {grievancePage.chart3_image && (
                      <button
                        type="button"
                        onClick={() => setGrievancePage({ ...grievancePage, chart3_image: "" })}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.75rem" }}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Chart Title</label>
                    <input
                      type="text"
                      value={grievancePage.chart3_title || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, chart3_title: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Image URL or Upload</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        value={grievancePage.chart3_image || ""}
                        onChange={(e) => setGrievancePage({ ...grievancePage, chart3_image: e.target.value })}
                        style={{ flex: 1, padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.8rem" }}
                      />
                      <input
                        type="file"
                        ref={chart3InputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => handleUpload(e, "image", (url) => setGrievancePage((prev) => ({ ...prev, chart3_image: url })))}
                      />
                      <button
                        type="button"
                        onClick={() => chart3InputRef.current?.click()}
                        disabled={isUploading}
                        style={{ padding: "6px 12px", background: "#d97706", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 140, background: "#111827", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1f2937" }}>
                    {grievancePage.chart3_image ? (
                      <img src={grievancePage.chart3_image} alt={grievancePage.chart3_title || "Chart 3"} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.8rem" }}>No image</span>
                    )}
                  </div>
                </div>

                {/* Additional Charts (dynamic) */}
                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 18, gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa" }}>Additional Charts (add as many as needed)</span>
                    <button
                      type="button"
                      onClick={() => setGrievanceCharts((prev) => [...prev, { title: "New Chart", image: "" }])}
                      style={{ padding: "6px 12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}
                    >
                      <FaPlus size={11} /> Add Chart
                    </button>
                  </div>
                  {grievanceCharts.length === 0 && (
                    <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>No additional charts. Click "Add Chart" to create one.</p>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
                    {grievanceCharts.map((ch, idx) => (
                      <div key={idx} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a78bfa" }}>Chart #{idx + 4}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const u = grievanceCharts.filter((_, i) => i !== idx);
                              setGrievanceCharts(u);
                              handleSaveGrievancePage({ ...grievancePage, charts_json: u });
                            }}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.75rem" }}
                          >
                            <FaTrash size={11} /> Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Chart title"
                          value={ch.title || ""}
                          onChange={(e) => {
                            const u = grievanceCharts.map((c, i) => (i === idx ? { ...c, title: e.target.value } : c));
                            setGrievanceCharts(u);
                          }}
                          style={{ width: "100%", padding: "6px 8px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.8rem" }}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={ch.image || ""}
                            onChange={(e) => {
                              const u = grievanceCharts.map((c, i) => (i === idx ? { ...c, image: e.target.value } : c));
                              setGrievanceCharts(u);
                            }}
                            style={{ flex: 1, padding: "6px 8px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.78rem" }}
                          />
                          <input
                            type="file"
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              handleUpload(e, "image", (url) => {
                                const u = grievanceCharts.map((c, i) => (i === idx ? { ...c, image: url } : c));
                                setGrievanceCharts(u);
                                handleSaveGrievancePage({ ...grievancePage, charts_json: u });
                              });
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                            disabled={isUploading}
                            style={{ padding: "5px 10px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}
                          >
                            Upload
                          </button>
                        </div>
                        {ch.image && (
                          <img src={ch.image} alt={ch.title} style={{ width: "100%", height: 100, objectFit: "contain", borderRadius: 6, background: "#0b0f17" }} />
                        )}
                      </div>
                    ))}
                  </div>
                  {grievanceCharts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSaveGrievancePage({ ...grievancePage, charts_json: grievanceCharts })}
                      style={{ marginTop: 12, padding: "8px 16px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}
                    >
                      Save Additional Charts
                    </button>
                  )}
                </div>

                {/* FAQ Document PDF */}
                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f43f5e", background: "rgba(244,63,94,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                      FAQ Manual PDF
                    </span>
                    {grievancePage.faq_pdf_url && (
                      <a href={grievancePage.faq_pdf_url} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", fontSize: "0.78rem", textDecoration: "none", fontWeight: 600 }}>
                        View PDF
                      </a>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>Document Button Label</label>
                    <input
                      type="text"
                      value={grievancePage.faq_pdf_label || ""}
                      onChange={(e) => setGrievancePage({ ...grievancePage, faq_pdf_label: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.82rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>PDF File URL or Direct Upload</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="text"
                        value={grievancePage.faq_pdf_url || ""}
                        onChange={(e) => setGrievancePage({ ...grievancePage, faq_pdf_url: e.target.value })}
                        style={{ flex: 1, padding: "7px 10px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.8rem" }}
                      />
                      <input
                        type="file"
                        ref={grvFaqInputRef}
                        style={{ display: "none" }}
                        accept=".pdf"
                        onChange={(e) => handleUpload(e, "image", (url) => setGrievancePage((prev) => ({ ...prev, faq_pdf_url: url })))}
                      />
                      <button
                        type="button"
                        onClick={() => grvFaqInputRef.current?.click()}
                        disabled={isUploading}
                        style={{ padding: "6px 12px", background: "#f43f5e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 140, background: "#111827", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid #1f2937", gap: 8 }}>
                    <FaFilePdf size={36} color="#f43f5e" />
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8", textAlign: "center", padding: "0 10px", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                      {grievancePage.faq_pdf_url || "No PDF configured"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. GLOSSARY & FULL FORMS SECTION ── */}
            <div className="adm-card-panel" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: 24 }}>
              <div className="adm-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                    R&R & Legal Glossary Abbreviations ({fullForms.length})
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.83rem" }}>
                    Definitions shown beside the grievance form on /grievances
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAcronymIdx(null);
                    setAcronymForm({ abbr: "", full: "", desc: "" });
                    setShowAcronymModal(true);
                  }}
                  style={{ padding: "8px 14px", background: "#f59e0b", color: "#000", border: "none", borderRadius: 6, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <FaPlus size={11} /> Add Acronym
                </button>
              </div>

              <div className="adm-grv-glossary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
                {fullForms.map((ff, ffIdx) => (
                  <div key={ffIdx} style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, padding: 14, position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "#f59e0b" }}>{ff.abbr}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAcronymIdx(ffIdx);
                            setAcronymForm({ ...ff });
                            setShowAcronymModal(true);
                          }}
                          style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", padding: 2 }}
                          title="Edit Acronym"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const u = fullForms.filter((_, i) => i !== ffIdx);
                            setFullForms(u);
                            handleSaveGrievancePage({ ...grievancePage, full_forms_json: u });
                          }}
                          style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 2 }}
                          title="Delete Acronym"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginTop: 4 }}>{ff.full}</div>
                    <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>{ff.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: GRIEVANCE SUB-PAGES (/abstract, /rr-grievances, etc.)           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "grievance_pages" && (
          <AdminResourcePagesSection
            sectionType="grievance"
            initialSlug={searchParams.get("slug") || ""}
            adminKey={adminKey}
            onShowToast={showToast}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: DOWNLOAD SUB-PAGES (/legislative-acts-2, /gos, etc.)           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "download_pages" && (
          <AdminResourcePagesSection
            sectionType="download"
            initialSlug={searchParams.get("slug") || ""}
            adminKey={adminKey}
            onShowToast={showToast}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: QUICK LINKS (/quick-links)                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "quick_links" && (
          <AdminResourcePagesSection
            sectionType="quick_links"
            initialSlug={searchParams.get("slug") || "quick-links"}
            adminKey={adminKey}
            onShowToast={showToast}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: DOWNLOADS & STATUTORY ACTS (/downloads)                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "downloads" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="adm-partner-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                    Downloads Repository
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to MySQL table `site_downloads`</span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff" }}>
                  Legal Acts & Downloads Management
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Upload, categorize, and publish authentic Bare Acts, court cases, and government orders shown on{" "}
                  <Link to="/downloads" target="_blank" style={{ color: "#38bdf8" }}>/downloads</Link>.
                </p>
              </div>

              <div className="adm-partner-actions" style={{ display: "flex", gap: 10 }}>
                <Link to="/downloads" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#1e293b", borderRadius: 8, color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                  <FaExternalLinkAlt size={12} /> View Live /downloads
                </Link>
                <button onClick={openCreateDocModal} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  <FaPlus size={12} /> Add PDF Document
                </button>
              </div>
            </div>

            {/* SEARCH & CATEGORY FILTER */}
            <div className="adm-partner-filter-bar" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div className="adm-partner-filter-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 700 }}>Category:</span>
                {[
                  { id: "all", label: "All Docs" },
                  { id: "acts", label: "Bare Acts" },
                  { id: "court", label: "Court Cases" },
                  { id: "rr", label: "R&R Cases" },
                  { id: "reports", label: "Audited Reports" },
                  { id: "faqs", label: "Guides & Manuals" }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDocCatFilter(c.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 20,
                      border: "1px solid",
                      borderColor: docCatFilter === c.id ? "#10b981" : "#1f2937",
                      background: docCatFilter === c.id ? "rgba(16, 185, 129, 0.2)" : "#0b0f17",
                      color: docCatFilter === c.id ? "#34d399" : "#94a3b8",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="adm-partner-search" style={{ position: "relative", minWidth: 0, width: "100%", maxWidth: 400 }}>
                <FaSearch size={13} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  placeholder="Search documents by title or keyword..."
                  style={{ width: "100%", padding: "8px 14px 8px 36px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                />
              </div>
            </div>

            {/* DOWNLOADS GRID */}
            <div className="adm-partner-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 18 }}>
              {filteredDownloads.map((doc) => {
                const isActive = Number(doc.is_active) !== 0;
                return (
                  <div
                    key={doc.id}
                    style={{
                      background: "#111827",
                      border: "1px solid #1f2937",
                      borderRadius: 14,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      opacity: isActive ? 1 : 0.65
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(244,63,94,0.15)", color: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FaFilePdf size={22} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>
                            {doc.category}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{doc.fileSize || doc.file_size}</span>
                        </div>
                        <h4 style={{ margin: "4px 0 0", fontSize: "0.98rem", fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>
                          {doc.title}
                        </h4>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.5, flex: 1 }}>
                      {doc.desc}
                    </p>

                    <div style={{ fontSize: "0.76rem", color: "#64748b", borderTop: "1px dashed #1f2937", paddingTop: 8 }}>
                      {doc.meta}
                    </div>

                    <div className="adm-doc-card-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #1f2937", flexWrap: "wrap", gap: 8 }}>
                      <button
                        onClick={() => handleToggleDocActive(doc.id, isActive)}
                        style={{ padding: "4px 8px", background: isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", border: "1px solid", borderColor: isActive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)", borderRadius: 6, color: isActive ? "#34d399" : "#fca5a5", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        {isActive ? "Published" : "Hidden"}
                      </button>

                      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                        <a href={resolveUploadUrl(doc.file)} target="_blank" rel="noreferrer" style={{ padding: "4px 8px", background: "#1e293b", color: "#38bdf8", borderRadius: 6, fontSize: "0.74rem", textDecoration: "none", whiteSpace: "nowrap" }}>
                          View PDF
                        </a>
                        <button onClick={() => openEditDocModal(doc)} style={{ padding: "4px 8px", background: "rgba(2,132,199,0.15)", border: "1px solid rgba(2,132,199,0.35)", color: "#38bdf8", borderRadius: 6, cursor: "pointer", fontSize: "0.74rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget({ type: "doc", id: doc.id, label: doc.title })} style={{ padding: "4px 8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171", borderRadius: 6, cursor: "pointer", fontSize: "0.74rem", whiteSpace: "nowrap" }}>
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: FAQ’S CENTER (/faqs)                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "faqs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="adm-partner-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd", border: "1px solid rgba(139, 92, 246, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                    Frequently Asked Questions
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to MySQL table `site_faqs`</span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff" }}>
                  FAQ’s Knowledge Base
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Manage questions, official answers, and tax exemption clarity shown on{" "}
                  <Link to="/faqs" target="_blank" style={{ color: "#38bdf8" }}>/faqs</Link>.
                </p>
              </div>

              <div className="adm-partner-actions" style={{ display: "flex", gap: 10 }}>
                <Link to="/faqs" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#1e293b", borderRadius: 8, color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                  <FaExternalLinkAlt size={12} /> View Live /faqs
                </Link>
                <button onClick={openCreateFaqModal} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#8b5cf6", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  <FaPlus size={12} /> Add FAQ Item
                </button>
              </div>
            </div>

            {/* FAQS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {faqs.map((f, fIdx) => {
                const isActive = Number(f.is_active) !== 0;
                return (
                  <div
                    key={f.id}
                    style={{
                      background: "#111827",
                      border: "1px solid #1f2937",
                      borderRadius: 14,
                      padding: 22,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      opacity: isActive ? 1 : 0.65
                    }}
                  >
                    <div className="adm-faq-item-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, wordBreak: "break-word" }}>
                        <span style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(139,92,246,0.15)", color: "#c4b5fd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }}>
                          Q{fIdx + 1}
                        </span>
                        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#fff", wordBreak: "break-word" }}>{f.q}</h3>
                      </div>

                      <div className="adm-faq-actions" style={{ display: "flex", gap: 8, flexShrink: 0, whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => handleToggleFaqActive(f.id, isActive)}
                          style={{ padding: "4px 8px", background: isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", border: "1px solid", borderColor: isActive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)", borderRadius: 6, color: isActive ? "#34d399" : "#fca5a5", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          {isActive ? "Live" : "Hidden"}
                        </button>
                        <button onClick={() => openEditFaqModal(f)} style={{ padding: "4px 8px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd", borderRadius: 6, cursor: "pointer", fontSize: "0.74rem", fontWeight: 700 }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget({ type: "faq", id: f.id, label: f.q })} style={{ padding: "4px 8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171", borderRadius: 6, cursor: "pointer", fontSize: "0.74rem" }}>
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>

                    <p className="adm-faq-answer" style={{ margin: 0, fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.65, paddingLeft: 38 }}>
                      {f.a}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: NAVBAR DROPDOWN MENUS MANAGER                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "dropdowns" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="adm-partner-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ background: "rgba(234, 88, 12, 0.15)", color: "#fb923c", border: "1px solid rgba(234, 88, 12, 0.3)", padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                    Navigation Architecture
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to MySQL table `partner_dropdowns`</span>
                </div>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, color: "#fff" }}>
                  &quot;Partner with Us&quot; Dropdown Menus Manager
                </h1>
                <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.92rem" }}>
                  Create, edit, delete, and manage nested flyout sub-links displayed under <strong>PARTNER WITH US</strong> in the main navbar.
                </p>
              </div>

              <div className="adm-partner-actions" style={{ display: "flex", gap: 10 }}>
                <button onClick={openCreateDropdownModal} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#ea580c", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  <FaPlus size={12} /> Add Dropdown Link
                </button>
              </div>
            </div>

            {/* DROPDOWNS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {dropdowns.map((d, idx) => {
                const isActive = Number(d.is_active) !== 0;
                let subs = [];
                try {
                  subs = typeof d.sub_items_json === "string" ? JSON.parse(d.sub_items_json || "[]") : (d.sub_items_json || []);
                } catch (e) { subs = []; }

                return (
                  <div
                    key={d.id}
                    style={{
                      background: "#111827",
                      border: "1px solid #1f2937",
                      borderRadius: 14,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      opacity: isActive ? 1 : 0.65
                    }}
                  >
                    <div className="adm-partner-dropdown-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1, wordBreak: "break-word" }}>
                        <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(234,88,12,0.15)", color: "#fb923c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                          #{idx + 1}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#fff", wordBreak: "break-word" }}>{d.label}</h3>
                          <span style={{ fontSize: "0.78rem", color: "#38bdf8", wordBreak: "break-all" }}>Path: {d.path}</span>
                        </div>
                      </div>

                      <div className="adm-partner-dropdown-actions" style={{ display: "flex", gap: 8, flexShrink: 0, whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => handleToggleDropdownActive(d.id, isActive)}
                          style={{ padding: "4px 8px", background: isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", border: "1px solid", borderColor: isActive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)", borderRadius: 6, color: isActive ? "#34d399" : "#fca5a5", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          {isActive ? "Active" : "Hidden"}
                        </button>
                        <button onClick={() => openEditDropdownModal(d)} style={{ padding: "4px 10px", background: "rgba(2,132,199,0.15)", border: "1px solid rgba(2,132,199,0.35)", color: "#38bdf8", borderRadius: 6, cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget({ type: "dropdown", id: d.id, label: d.label })} style={{ padding: "4px 10px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171", borderRadius: 6, cursor: "pointer", fontSize: "0.76rem" }}>
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>

                    {/* NESTED SUB-ITEMS */}
                    {subs.length > 0 && (
                      <div className="adm-partner-dropdown-subs" style={{ background: "#0b0f17", borderRadius: 8, padding: "10px 16px", marginTop: 4 }}>
                        <div style={{ fontSize: "0.74rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                          Flyout Sub-Menu Links ({subs.length}):
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {subs.map((s, sIdx) => (
                            <span key={sIdx} style={{ background: "#111827", border: "1px solid #1f2937", padding: "4px 10px", borderRadius: 6, fontSize: "0.8rem", color: "#e2e8f0" }}>
                              • {s.label} <span style={{ color: "#64748b", fontSize: "0.72rem" }}>({s.path})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT ROUTE MODAL ────────────────────────────────────── */}
        {showRouteModal && (
          <div className="adm-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowRouteModal(false)}>
            <div className="adm-partner-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 540, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>
                {editingRouteIdx !== null ? "Edit Partnership Route" : "Add Partnership Route"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  let updated;
                  if (editingRouteIdx !== null) {
                    updated = [...partnerRoutes];
                    updated[editingRouteIdx] = routeForm;
                  } else {
                    updated = [...partnerRoutes, routeForm];
                  }
                  setPartnerRoutes(updated);
                  setShowRouteModal(false);
                  handleSavePartnerPage({ ...partnerPage, routes_json: updated });
                }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Route Title *</label>
                  <input type="text" required value={routeForm.title} onChange={(e) => setRouteForm({ ...routeForm, title: e.target.value })} placeholder="e.g. CSR Partnerships & Grant Matching" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Best Suited For / Fits *</label>
                  <input type="text" required value={routeForm.fits} onChange={(e) => setRouteForm({ ...routeForm, fits: e.target.value })} placeholder="e.g. Corporate CSR Funds, Foundations" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Description / Scope *</label>
                  <textarea rows={3} required value={routeForm.body} onChange={(e) => setRouteForm({ ...routeForm, body: e.target.value })} placeholder="Describe engagement model..." style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", lineHeight: 1.5 }} />
                </div>
                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowRouteModal(false)} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>Cancel</button>
                  <button type="submit" disabled={isSaving} style={{ padding: "8px 18px", background: "#0284c7", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>
                    {editingRouteIdx !== null ? "Update Route" : "Save Route"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT SECTION 04 DUE DILIGENCE MODAL ────────────────── */}
        {showDiligenceModal && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => setShowDiligenceModal(false)}
          >
            <div
              className="adm-partner-modal"
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 16,
                maxWidth: 580,
                width: "100%",
                padding: "26px 28px",
                color: "#fff",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.74rem", fontWeight: 700, marginBottom: 8 }}>
                    <FaFilePdf size={11} /> SECTION 04 STATUTORY RECORD
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
                    {editingDiligenceIdx !== null ? "Edit Due Diligence Document" : "Add Due Diligence Document"}
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.84rem" }}>
                    Attach verified organizational profiles, annual audited reports, and 80G governance manuals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDiligenceModal(false)}
                  style={{ background: "#1f2937", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!diligenceForm.title.trim() || !diligenceForm.file.trim()) {
                    showToast("Title and PDF document file are required", "error");
                    return;
                  }
                  let updated;
                  if (editingDiligenceIdx !== null) {
                    updated = [...partnerDiligence];
                    updated[editingDiligenceIdx] = { ...diligenceForm, icon: "FaFilePdf" };
                  } else {
                    updated = [...partnerDiligence, { ...diligenceForm, icon: "FaFilePdf" }];
                  }
                  setPartnerDiligence(updated);
                  setShowDiligenceModal(false);
                  handleSavePartnerPage({ ...partnerPage, diligence_json: updated });
                  showToast(editingDiligenceIdx !== null ? "Document updated successfully!" : "New document added successfully!");
                }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={diligenceForm.title}
                    onChange={(e) => setDiligenceForm({ ...diligenceForm, title: e.target.value })}
                    placeholder="e.g. Organizational Profile & 20-Year Report of ALERT"
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Compliance & Registration Meta Details *
                  </label>
                  <input
                    type="text"
                    required
                    value={diligenceForm.meta}
                    onChange={(e) => setDiligenceForm({ ...diligenceForm, meta: e.target.value })}
                    placeholder="e.g. Registration 307/2004 • 12A & 80G certificates • Audited"
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    PDF Document File URL or Direct Upload *
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      required
                      value={diligenceForm.file}
                      onChange={(e) => setDiligenceForm({ ...diligenceForm, file: e.target.value })}
                      placeholder="/uploads/partner/your-document.pdf or URL"
                      style={{ flex: 1, padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                    />
                    <input
                      type="file"
                      ref={diligenceInputRef}
                      style={{ display: "none" }}
                      accept=".pdf"
                      onChange={(e) =>
                        handleUpload(e, "image", (url) => {
                          setDiligenceForm((prev) => ({ ...prev, file: url }));
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => diligenceInputRef.current?.click()}
                      disabled={isUploading}
                      style={{
                        padding: "10px 16px",
                        background: "#0284c7",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap"
                      }}
                    >
                      <FaCloudUploadAlt size={16} />
                      {isUploading ? "Uploading..." : "Upload PDF"}
                    </button>
                  </div>
                </div>

                {diligenceForm.file && (
                  <div
                    style={{
                      background: "rgba(56, 189, 248, 0.08)",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#e0f2fe", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <FaFilePdf color="#f43f5e" size={16} />
                      <span style={{ fontWeight: 600 }}>Attached:</span>
                      <span style={{ color: "#38bdf8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {diligenceForm.file}
                      </span>
                    </div>
                    <a
                      href={resolveUploadUrl(diligenceForm.file)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#38bdf8",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        textDecoration: "none",
                        flexShrink: 0
                      }}
                    >
                      <FaExternalLinkAlt size={11} /> Test View
                    </a>
                  </div>
                )}

                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowDiligenceModal(false)}
                    style={{ padding: "10px 18px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{ padding: "10px 22px", background: "#10b981", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <FaSave size={13} />
                    {isSaving ? "Saving..." : (editingDiligenceIdx !== null ? "Update Document" : "Save Document")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT SECTION 03 MISSION MODAL ───────────────────────── */}
        {showMissionModal && (
          <div
            className="adm-modal-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={() => setShowMissionModal(false)}
          >
            <div
              className="adm-partner-modal"
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 16,
                maxWidth: 580,
                width: "100%",
                padding: "26px 28px",
                color: "#fff",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.74rem", fontWeight: 700, marginBottom: 8 }}>
                    SECTION 03 SUPPORT MISSION
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
                    {editingMissionIdx !== null ? "Edit Mission" : "Add Support Mission"}
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.84rem" }}>
                    Ring-fenceable intervention: field visits, named officers, and measurable outputs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMissionModal(false)}
                  style={{ background: "#1f2937", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!missionForm.title.trim() || !missionForm.body.trim()) {
                    showToast("Title and Description are required", "error");
                    return;
                  }
                  let updated;
                  if (editingMissionIdx !== null) {
                    updated = [...partnerMissions];
                    updated[editingMissionIdx] = { ...missionForm };
                  } else {
                    updated = [...partnerMissions, { ...missionForm }];
                  }
                  setPartnerMissions(updated);
                  setShowMissionModal(false);
                  handleSavePartnerPage({ ...partnerPage, missions_json: updated });
                  showToast(editingMissionIdx !== null ? "Mission updated successfully!" : "New mission added successfully!");
                }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Select Mission Icon
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {ROUTE_ICONS.map((ic) => (
                      <button
                        type="button"
                        key={ic.name}
                        onClick={() => setMissionForm({ ...missionForm, icon: ic.name })}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid",
                          borderColor: missionForm.icon === ic.name ? "#10b981" : "#1f2937",
                          background: missionForm.icon === ic.name ? "rgba(16, 185, 129, 0.2)" : "#0b0f17",
                          color: missionForm.icon === ic.name ? "#34d399" : "#94a3b8",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}
                      >
                        {renderRouteIcon(ic.name, 14)}
                        <span>{ic.label.split("/")[0].trim()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Mission Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={missionForm.title}
                    onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
                    placeholder="e.g. Land & Forest Rights"
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Description & Mandate Scope *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={missionForm.body}
                    onChange={(e) => setMissionForm({ ...missionForm, body: e.target.value })}
                    placeholder="Describe the operational mandate, communities supported, and field activities..."
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem", lineHeight: 1.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
                    Funder Prompt / Tell Us Statement
                  </label>
                  <input
                    type="text"
                    value={missionForm.tell}
                    onChange={(e) => setMissionForm({ ...missionForm, tell: e.target.value })}
                    placeholder="e.g. Tell us if you want to fund legal aid, claim facilitation or document recovery."
                    style={{ width: "100%", padding: "10px 14px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, color: "#fff", fontSize: "0.88rem" }}
                  />
                </div>

                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowMissionModal(false)}
                    style={{ padding: "10px 18px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{ padding: "10px 22px", background: "#059669", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <FaSave size={13} />
                    {isSaving ? "Saving..." : (editingMissionIdx !== null ? "Update Mission" : "Save Mission")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT DOCUMENT MODAL ──────────────────────────────────── */}
        {showDocModal && (
          <div className="adm-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowDocModal(false)}>
            <div className="adm-partner-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 560, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>
                {editingDocId ? "Edit PDF Document" : "Add Statutory Act / Document"}
              </h3>
              <form onSubmit={handleSaveDoc} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Document Title *</label>
                  <input type="text" required value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="e.g. RFCTLARR Act 2013 - Schedule 1" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>
                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Category *</label>
                    <select value={docForm.category} onChange={(e) => setDocForm({ ...docForm, category: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }}>
                      <option value="acts">Bare Acts</option>
                      <option value="court">Court Cases</option>
                      <option value="rr">R&R Cases</option>
                      <option value="reports">Audited Reports</option>
                      <option value="faqs">Guides & FAQs</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>File Size / Badge</label>
                    <input type="text" value={docForm.file_size} onChange={(e) => setDocForm({ ...docForm, file_size: e.target.value })} placeholder="Official PDF (1.2 MB)" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>PDF File URL or Upload *</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" required value={docForm.file} onChange={(e) => setDocForm({ ...docForm, file: e.target.value })} placeholder="/uploads/... or URL" style={{ flex: 1, padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                    <input type="file" ref={docFileInputRef} style={{ display: "none" }} accept=".pdf" onChange={(e) => handleUpload(e, "image", (url) => setDocForm((prev) => ({ ...prev, file: url })))} />
                    <button type="button" onClick={() => docFileInputRef.current?.click()} disabled={isUploading} style={{ padding: "8px 12px", background: "#334155", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem" }}>Upload PDF</button>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Meta Details</label>
                  <input type="text" value={docForm.meta} onChange={(e) => setDocForm({ ...docForm, meta: e.target.value })} placeholder="Central Bare Act • LA Act 2013" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Description *</label>
                  <textarea rows={3} required value={docForm.desc} onChange={(e) => setDocForm({ ...docForm, desc: e.target.value })} placeholder="Explain document purpose and legal relevance..." style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", lineHeight: 1.5 }} />
                </div>
                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowDocModal(false)} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>Cancel</button>
                  <button type="submit" disabled={isSaving} style={{ padding: "8px 18px", background: "#10b981", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>
                    {isSaving ? "Saving..." : (editingDocId ? "Update Document" : "Add Document")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT FAQ MODAL ───────────────────────────────────────── */}
        {showFaqModal && (
          <div className="adm-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowFaqModal(false)}>
            <div className="adm-partner-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 540, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>
                {editingFaqId ? "Edit FAQ" : "Add Frequently Asked Question"}
              </h3>
              <form onSubmit={handleSaveFaq} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Question *</label>
                  <textarea rows={2} required value={faqForm.q} onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })} placeholder="What is ALERT and what is its primary mission?" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Official Answer *</label>
                  <textarea rows={5} required value={faqForm.a} onChange={(e) => setFaqForm({ ...faqForm, a: e.target.value })} placeholder="Provide clear, authoritative answer..." style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", lineHeight: 1.5 }} />
                </div>
                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowFaqModal(false)} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>Cancel</button>
                  <button type="submit" disabled={isSaving} style={{ padding: "8px 18px", background: "#8b5cf6", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>
                    {isSaving ? "Saving..." : (editingFaqId ? "Update FAQ" : "Create FAQ")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT DROPDOWN MODAL ─────────────────────────────────── */}
        {showDropdownModal && (
          <div className="adm-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowDropdownModal(false)}>
            <div className="adm-partner-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 540, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>
                {editingDropdownId ? "Edit Navbar Dropdown Item" : "Add Navbar Dropdown Item"}
              </h3>
              <form onSubmit={handleSaveDropdown} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Menu Item Label *</label>
                  <input type="text" required value={dropdownForm.label} onChange={(e) => setDropdownForm({ ...dropdownForm, label: e.target.value })} placeholder="e.g. Partner with Us" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginBottom: 4 }}>Page Link / URL *</label>
                  <input type="text" required value={dropdownForm.path} onChange={(e) => setDropdownForm({ ...dropdownForm, path: e.target.value })} placeholder="e.g. /partner or /grievances" style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff" }} />
                </div>

                {/* SUB ITEMS MANAGEMENT */}
                <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fb923c" }}>Nested Flyout Links</label>
                    <button
                      type="button"
                      onClick={() => {
                        const lbl = prompt("Sub-item Label:");
                        const pth = prompt("Sub-item Path / URL:");
                        if (lbl && pth) {
                          setDropdownForm({ ...dropdownForm, sub_items: [...dropdownForm.sub_items, { label: lbl, path: pth }] });
                        }
                      }}
                      style={{ padding: "4px 8px", background: "#ea580c", color: "#fff", border: "none", borderRadius: 4, fontSize: "0.74rem", cursor: "pointer" }}
                    >
                      + Add Flyout Link
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {dropdownForm.sub_items.map((sub, sIdx) => (
                      <div key={sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111827", padding: "6px 10px", borderRadius: 6, fontSize: "0.8rem" }}>
                        <span>• {sub.label} <span style={{ color: "#64748b" }}>({sub.path})</span></span>
                        <button type="button" onClick={() => setDropdownForm({ ...dropdownForm, sub_items: dropdownForm.sub_items.filter((_, i) => i !== sIdx) })} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><FaTrash size={10} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowDropdownModal(false)} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>Cancel</button>
                  <button type="submit" disabled={isSaving} style={{ padding: "8px 18px", background: "#ea580c", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>
                    {isSaving ? "Saving..." : (editingDropdownId ? "Update Item" : "Create Item")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── VIEW GRIEVANCE MODAL ─────────────────────────────────────────── */}
        {selectedGrievance && (
          <div className="adm-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setSelectedGrievance(null)}>
            <div className="adm-partner-modal" style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 14, maxWidth: 600, width: "100%", padding: "26px 30px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f2937", paddingBottom: 14, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>Grievance Representation</span>
                  <h3 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: 800 }}>Tracking: {selectedGrievance.tracking_code}</h3>
                </div>
                <button onClick={() => setSelectedGrievance(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}><FaTimes /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Applicant Name</label>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{selectedGrievance.name}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Phone Number</label>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#38bdf8" }}>{selectedGrievance.phone}</div>
                  </div>
                </div>

                <div className="adm-modal-form-grid" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Village / Mandal</label>
                    <div style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>{selectedGrievance.village}, {selectedGrievance.mandal}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>District</label>
                    <div style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>{selectedGrievance.district}</div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Grievance Category</label>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fbbf24" }}>{selectedGrievance.grievance_type}</div>
                </div>

                <div>
                  <label style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Full Complaint Description</label>
                  <div style={{ background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, padding: 14, fontSize: "0.88rem", lineHeight: 1.6, color: "#e2e8f0" }}>
                    {selectedGrievance.description}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.76rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Casework Admin Remarks / Action Taken</label>
                  <textarea
                    rows={3}
                    defaultValue={selectedGrievance.admin_remarks || ""}
                    onBlur={(e) => handleUpdateGrievanceStatus(selectedGrievance.id, selectedGrievance.status, e.target.value)}
                    placeholder="Enter casework notes, SDC submission dates, or resolution outcome..."
                    style={{ width: "100%", padding: "8px 12px", background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 6, color: "#fff", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIRM DELETE MODAL ─────────────────────────────────────────── */}
        {deleteTarget && (
          <div className="adm-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setDeleteTarget(null)}>
            <div className="adm-partner-modal" style={{ background: "#111827", border: "1px solid #ef4444", borderRadius: 14, maxWidth: 460, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, color: "#ef4444" }}>
                <FaExclamationTriangle size={24} />
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Confirm Deletion</h3>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: "0 0 20px" }}>
                Permanently delete &quot;<strong>{deleteTarget.label}</strong>&quot;? This cannot be undone.
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setDeleteTarget(null)} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>Cancel</button>
                <button onClick={confirmDelete} style={{ padding: "8px 18px", background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESTORE DEFAULTS MODAL ───────────────────────────────────────── */}
        {showSyncModal && (
          <div className="adm-modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowSyncModal(false)}>
            <div className="adm-partner-modal" style={{ background: "#111827", border: "1px solid #3b82f6", borderRadius: 14, maxWidth: 480, width: "100%", padding: "26px 28px", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, color: "#38bdf8" }}>
                <FaSyncAlt size={22} />
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Restore Factory Defaults</h3>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: "0 0 20px" }}>
                Reset all 4 partner pages, statutory Bare Acts downloads, FAQs, and navbar dropdown menus to their original defaults.
              </p>
              <div className="adm-modal-footer-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setShowSyncModal(false)} style={{ padding: "8px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8" }}>Cancel</button>
                <button onClick={handleRestoreDefaults} style={{ padding: "8px 18px", background: "#0284c7", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700 }}>Yes, Reset All</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

