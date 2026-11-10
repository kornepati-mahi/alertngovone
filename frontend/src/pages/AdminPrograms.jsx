import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaHandsHelping, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaCloudUploadAlt, FaFolderOpen,
  FaCheckCircle, FaEye, FaSave, FaExternalLinkAlt, FaInfoCircle,
  FaTags, FaLink, FaLayerGroup, FaArrowRight, FaAward, FaCalendarAlt,
  FaMapMarkerAlt, FaUsers, FaSearch, FaList, FaHome, FaSlidersH,
  FaHeading
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";
import {
  fetchOverviewPrograms,
  adminListOverviewPrograms,
  adminCreateOverviewProgram,
  adminUpdateOverviewProgram,
  adminDeleteOverviewProgram,
  adminReorderOverviewPrograms,
  adminUpdateOverviewCategory,
  adminDeleteOverviewCategory,
  adminSaveOverviewSettings,
  adminUploadImage
} from "../api/client";

const KEY_STORAGE = "alertngo_admin_key";
const OVERVIEW_PROGRAMS_CACHE_KEY = "alertngo_overview_programs_cache";
const PROGRAMS_SETTINGS_CACHE_KEY = "alertngo_programs_settings";

const PRESET_PROGRAM_PHOTOS = [
  { url: "/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg", label: "RoFR Land Advocacy" },
  { url: "/uploads/programs/Kotarugommu-18-9-21-1-rotated-1-1024x461-640x480.jpeg", label: "CFR Mapping" },
  { url: "/uploads/programs/tammileru-10-8-21-768x346-1-640x480.jpeg", label: "LTR 1 of 1970 Restitution" },
  { url: "/uploads/programs/PHOTO-2023-02-15-19-20-56.jpg", label: "PESA Self-Governance" },
  { url: "/uploads/programs/submergence-area-map-1.jpg", label: "Polavaram Submergence Map" },
  { url: "/uploads/programs/ippuru2-1-1024x461-640x480.jpeg", label: "Submerged Villages Audit" },
  { url: "/uploads/programs/PHOTO-2023-02-15-19-21-00_1.jpg", label: "Matsya Mithra Women" },
  { url: "/uploads/programs/coastal-krishna-fishing.jpg", label: "Nomadic Yenadi Pattas" },
  { url: "/uploads/programs/Children-reieved-shoes-1.jpg", label: "Child Interventions" },
  { url: "/uploads/programs/reel-2-learning.jpg", label: "Joyful Learning Centers" },
  { url: "/uploads/programs/all2023.jpeg", label: "Flood Relief Mission" },
  { url: "/uploads/programs/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", label: "Solar Green Energy" },
  { url: "/uploads/programs/ramavarampadu_11-08-2021-1024x461-640x480.jpeg", label: "Heritage Millets & Seed Banks" },
  { url: "/uploads/programs/WhatsApp-Image-2024-10-15-at-4.52.24-PM-640x480.jpeg", label: "Heirloom Seed Bank" },
];

function compressAndOptimizeImage(file, maxWidth = 1200, maxHeight = 900, quality = 0.85) {
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

export default function AdminPrograms() {
  const [activeTab, setActiveTab] = useState("sections"); // "sections", "antyodaya", "header"
  const [programsList, setProgramsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [pageSettings, setPageSettings] = useState({
    page_badge: "Our Work",
    page_title: "Key Programs Overview",
    page_subtitle: "Eight thematic intervention pillars defending Adivasi dignity, constitutional land rights, and self-governance since 2004.",
    antyodaya_eyebrow: "Flagship Initiative",
    antyodaya_title: "Antyodaya Project",
    antyodaya_subtitle: "Supported by Brot für die Welt (BftW), Germany",
    antyodaya_chips: ["Since January 2016", "Six coastal mandals, Krishna District", "Yenadi tribal community"],
    antyodaya_p1: "In partnership with Brot für die Welt (BftW), Germany, ALERT has executed the Antyodaya Project across six coastal mandals of Krishna District, directly uplifting the highly marginalized Yenadi tribal community.",
    antyodaya_p2: "The Yenadi women have organized into vibrant Matsya Mithra Groups and coastal cooperatives, establishing sustainable fisheries management, obtaining government identity documentation, and achieving true financial independence.",
    antyodaya_stats: [
      { n: "6", l: "Coastal Mandals" },
      { n: "3,500+", l: "Women Enrolled" },
      { n: "50+", l: "Cooperatives" }
    ],
    antyodaya_img: "/uploads/programs/WhatsApp-Image-2021-07-24-at-8.04.03-PM-1-768x1024.jpeg",
    antyodaya_caption: "Antyodaya Project — coastal Krishna District",
    cta_badge: "Support Our Work",
    cta_title: "Fuel the Eight Pillars of Change",
    cta_subtitle: "Every contribution funds legal aid for forest-rights claims, solar electrification of off-grid hamlets, and the women-led cooperatives that keep Adivasi livelihoods resilient."
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const adminKey = sessionStorage.getItem(KEY_STORAGE) || "";

  // Add / Edit Card Form State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardForm, setCardForm] = useState({
    title: "",
    category: "Forest Rights",
    description: "",
    img: "/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg",
    details: ["IFR & CFR Claims Documentation", "Gram Sabha Resolution Filing"],
    link_url: "/la-rr",
    sort_order: 1,
    is_active: 1
  });
  const [newDetailPoint, setNewDetailPoint] = useState("");
  const [uploadingCardImg, setUploadingCardImg] = useState(false);
  const cardFileInputRef = useRef(null);

  // Add / Edit Pillar Heading Form State
  const [isPillarModalOpen, setIsPillarModalOpen] = useState(false);
  const [editingPillarKey, setEditingPillarKey] = useState(null);
  const [pillarForm, setPillarForm] = useState({
    category_name: "",
    display_name: "",
    subtitle: "",
    sort_order: 1
  });

  // Antyodaya file ref & upload state
  const antyodayaFileRef = useRef(null);
  const [uploadingAntyodayaImg, setUploadingAntyodayaImg] = useState(false);

  const showNotice = (msg) => {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    // 0. Load cached settings from localStorage immediately for instant display
    try {
      const cachedSet = localStorage.getItem(PROGRAMS_SETTINGS_CACHE_KEY);
      if (cachedSet) {
        const parsed = JSON.parse(cachedSet);
        if (parsed && typeof parsed === "object") {
          setPageSettings((prev) => ({
            ...prev,
            ...parsed,
            antyodaya_chips: Array.isArray(parsed.antyodaya_chips) ? parsed.antyodaya_chips : prev.antyodaya_chips,
            antyodaya_stats: Array.isArray(parsed.antyodaya_stats) ? parsed.antyodaya_stats : prev.antyodaya_stats
          }));
        }
      }
    } catch { }

    try {
      let res = null;
      const keyToUse = adminKey || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY_STORAGE) : "") || (typeof localStorage !== "undefined" ? localStorage.getItem(KEY_STORAGE) : "") || "alertngo@123";
      if (keyToUse) {
        res = await adminListOverviewPrograms(keyToUse);
      }
      if (!res || !res.success) {
        res = await fetchOverviewPrograms();
      }

      if (res && res.success) {
        if (Array.isArray(res.data)) {
          setProgramsList(res.data);
          try {
            localStorage.setItem(OVERVIEW_PROGRAMS_CACHE_KEY, JSON.stringify(res.data));
          } catch { }
        }
        if (Array.isArray(res.categories)) {
          setCategoriesList(res.categories);
        }
        if (res.settings) {
          const s = res.settings;
          setPageSettings((prev) => {
            const merged = {
              ...prev,
              ...s,
              antyodaya_chips: typeof s.antyodaya_chips === "string" ? JSON.parse(s.antyodaya_chips) : (s.antyodaya_chips || prev.antyodaya_chips),
              antyodaya_stats: typeof s.antyodaya_stats === "string" ? JSON.parse(s.antyodaya_stats) : (s.antyodaya_stats || prev.antyodaya_stats),
            };
            try {
              localStorage.setItem(PROGRAMS_SETTINGS_CACHE_KEY, JSON.stringify(merged));
            } catch { }
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to load overview programs:", err);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Card Image Upload
  const handleCardImageUpload = async (file) => {
    if (!file) return;
    setUploadingCardImg(true);
    try {
      const optimized = await compressAndOptimizeImage(file);
      const keyToUse = adminKey || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY_STORAGE) : "") || (typeof localStorage !== "undefined" ? localStorage.getItem(KEY_STORAGE) : "") || "alertngo@123";
      if (keyToUse) {
        const upRes = await adminUploadImage(keyToUse, optimized.originalFile || optimized.dataUrl, "programs");
        if (upRes && upRes.success && upRes.url) {
          setCardForm((prev) => ({ ...prev, img: upRes.url }));
          showNotice(`Image saved to subfolder: ${upRes.url}`);
        } else {
          setCardForm((prev) => ({ ...prev, img: optimized.dataUrl }));
        }
      } else {
        setCardForm((prev) => ({ ...prev, img: optimized.dataUrl }));
      }
    } catch (err) {
      setError(err.message || "Failed to process image.");
    } finally {
      setUploadingCardImg(false);
    }
  };

  // Antyodaya Image Upload (Robust dual-mode: instant DataURL + async server storage)
  const handleAntyodayaImage = async (file) => {
    if (!file) return;
    setUploadingAntyodayaImg(true);
    setError("");
    try {
      // Step 1: Instantly generate local DataURL for zero-delay preview (never fails or shows fallback)
      const optimized = await compressAndOptimizeImage(file);
      const previewDataUrl = optimized.dataUrl;

      // Update state with local preview immediately
      setPageSettings((prev) => {
        const updated = { ...prev, antyodaya_img: previewDataUrl };
        try { localStorage.setItem(PROGRAMS_SETTINGS_CACHE_KEY, JSON.stringify(updated)); } catch { }
        return updated;
      });
      showNotice("Optimizing & uploading image to /uploads/programs/...");

      // Step 2: Upload original/compressed file to server (/uploads/programs/)
      const keyToUse = adminKey || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY_STORAGE) : "") || (typeof localStorage !== "undefined" ? localStorage.getItem(KEY_STORAGE) : "") || "alertngo@123";

      const upRes = await adminUploadImage(keyToUse, optimized.originalFile || file, "programs");
      if (upRes && upRes.success && upRes.url) {
        setPageSettings((prev) => {
          const updated = { ...prev, antyodaya_img: upRes.url };
          try { localStorage.setItem(PROGRAMS_SETTINGS_CACHE_KEY, JSON.stringify(updated)); } catch { }
          return updated;
        });
        showNotice(`Antyodaya image uploaded to ${upRes.url}! Click 'Save Antyodaya Settings' to apply.`);
      } else {
        showNotice("Photo set locally as base64! Click 'Save Antyodaya Settings' to apply.");
      }
    } catch (err) {
      console.warn("Antyodaya upload fallback:", err);
      // Fallback: direct FileReader if canvas compression threw
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          setPageSettings((prev) => {
            const updated = { ...prev, antyodaya_img: dataUrl };
            try { localStorage.setItem(PROGRAMS_SETTINGS_CACHE_KEY, JSON.stringify(updated)); } catch { }
            return updated;
          });
          showNotice("Image selected locally! Click 'Save Antyodaya Settings' to apply.");
        };
        reader.readAsDataURL(file);
      } catch (readErr) {
        setError("Failed to process image: " + (err.message || readErr.message));
      }
    } finally {
      setUploadingAntyodayaImg(false);
      if (antyodayaFileRef.current) antyodayaFileRef.current.value = "";
    }
  };

  // Detail points helpers
  const handleAddDetailPoint = () => {
    if (!newDetailPoint.trim()) return;
    setCardForm((prev) => ({
      ...prev,
      details: [...(prev.details || []), newDetailPoint.trim()]
    }));
    setNewDetailPoint("");
  };

  const handleRemoveDetailPoint = (idx) => {
    setCardForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== idx)
    }));
  };

  // Open Form to Add Card under a specific Pillar
  const openAddCardUnderPillar = (categoryName) => {
    setEditingCardId(null);
    setCardForm({
      title: "",
      category: categoryName || "Forest Rights",
      description: "",
      img: "/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg",
      details: ["Intervention 1", "Intervention 2"],
      link_url: "/la-rr",
      sort_order: programsList.length + 1,
      is_active: 1
    });
    setIsCardModalOpen(true);
  };

  // Open Form to Edit Card
  const openEditCard = (p) => {
    setEditingCardId(p.id);
    setCardForm({
      title: p.title || "",
      category: p.category || p.cat || "Forest Rights",
      description: p.description || p.desc || "",
      img: p.img || p.image_url || "/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg",
      details: Array.isArray(p.details) ? p.details : (p.details ? [p.details] : []),
      link_url: p.link_url || "/la-rr",
      sort_order: p.sort_order || 1,
      is_active: p.is_active !== undefined ? p.is_active : 1
    });
    setIsCardModalOpen(true);
  };

  // Save Card
  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!cardForm.title.trim()) {
      setError("Card title is required.");
      return;
    }
    if (!cardForm.description.trim()) {
      setError("Card description is required.");
      return;
    }

    setLoading(true);
    try {
      if (editingCardId) {
        const res = await adminUpdateOverviewProgram(adminKey, editingCardId, cardForm);
        if (res && res.success) {
          setProgramsList((prev) =>
            prev.map((item) => (item.id === editingCardId ? { ...item, ...cardForm, id: editingCardId } : item))
          );
          showNotice(`Saved card: "${cardForm.title}"!`);
          setIsCardModalOpen(false);
          window.dispatchEvent(new Event("alertngo_programs_updated"));
        } else {
          setError(res?.message || "Failed to update card.");
        }
      } else {
        const res = await adminCreateOverviewProgram(adminKey, cardForm);
        if (res && res.success) {
          const created = res.data || { ...cardForm, id: Date.now() };
          setProgramsList((prev) => [...prev, created]);
          showNotice(`Created new card: "${cardForm.title}"!`);
          setIsCardModalOpen(false);
          window.dispatchEvent(new Event("alertngo_programs_updated"));
        } else {
          setError(res?.message || "Failed to create card.");
        }
      }
    } catch (err) {
      setError("Operation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Card
  const handleDeleteCard = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete card "${title}"?`)) return;
    setLoading(true);
    try {
      const res = await adminDeleteOverviewProgram(adminKey, id);
      if (res && res.success) {
        setProgramsList((prev) => prev.filter((p) => p.id !== id));
        showNotice(`Deleted card "${title}".`);
        window.dispatchEvent(new Event("alertngo_programs_updated"));
      } else {
        setError(res?.message || "Failed to delete card.");
      }
    } catch (err) {
      setError("Delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Pillar Edit
  const openEditPillar = (cat) => {
    setEditingPillarKey(cat.category_name);
    setPillarForm({
      category_name: cat.category_name,
      display_name: cat.display_name || cat.category_name,
      subtitle: cat.subtitle || "",
      sort_order: cat.sort_order || 1
    });
    setIsPillarModalOpen(true);
  };

  // Open New Pillar Create
  const openCreatePillar = () => {
    setEditingPillarKey(null);
    setPillarForm({
      category_name: "",
      display_name: "",
      subtitle: "",
      sort_order: categoriesList.length + 1
    });
    setIsPillarModalOpen(true);
  };

  // Save Pillar
  const handleSavePillar = async (e) => {
    e.preventDefault();
    if (!pillarForm.category_name.trim()) {
      setError("Category identifier name is required.");
      return;
    }
    if (!pillarForm.display_name.trim()) {
      setError("Display title is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminUpdateOverviewCategory(adminKey, pillarForm);
      if (res && res.success) {
        setCategoriesList((prev) => {
          const idx = prev.findIndex((c) => c.category_name === pillarForm.category_name);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...pillarForm };
            return updated;
          }
          return [...prev, pillarForm];
        });
        showNotice(`Saved Pillar Heading: "${pillarForm.display_name}"!`);
        setIsPillarModalOpen(false);
        window.dispatchEvent(new Event("alertngo_programs_updated"));
      } else {
        setError(res?.message || "Failed to save category pillar.");
      }
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Pillar
  const handleDeletePillar = async (catName) => {
    const cardCount = programsList.filter((p) => (p.category || p.cat || "").toLowerCase() === catName.toLowerCase()).length;
    const confirmMsg = cardCount > 0
      ? `Are you sure you want to delete section "${catName}"? This will also remove the ${cardCount} cards inside it!`
      : `Are you sure you want to delete section "${catName}"?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await adminDeleteOverviewCategory(adminKey, catName, true);
      if (res && res.success) {
        setCategoriesList((prev) => prev.filter((c) => c.category_name !== catName));
        setProgramsList((prev) => prev.filter((p) => (p.category || p.cat || "").toLowerCase() !== catName.toLowerCase()));
        showNotice(`Section "${catName}" deleted.`);
        window.dispatchEvent(new Event("alertngo_programs_updated"));
      } else {
        setError(res?.message || "Failed to delete section.");
      }
    } catch (err) {
      setError("Delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Immediately persist locally
      try {
        localStorage.setItem(PROGRAMS_SETTINGS_CACHE_KEY, JSON.stringify(pageSettings));
      } catch { }

      // 2. Persist to server
      const keyToUse = adminKey || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY_STORAGE) : "") || (typeof localStorage !== "undefined" ? localStorage.getItem(KEY_STORAGE) : "") || "alertngo@123";
      let res = null;
      try {
        res = await adminSaveOverviewSettings(keyToUse, pageSettings);
      } catch (serverErr) {
        console.warn("Server save error:", serverErr);
      }

      if (res && res.success) {
        showNotice("Antyodaya settings saved successfully to server and cache!");
      } else {
        showNotice("Antyodaya settings saved to local cache! (Server sync pending)");
      }
      window.dispatchEvent(new Event("alertngo_programs_updated"));
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group programs by category
  const categoriesToRender = categoriesList.length > 0 ? categoriesList : [
    { category_name: "Forest Rights", display_name: "Forest Rights (RoFR & LTR)", subtitle: "Securing individual and community forest rights (RoFR 2006) for Adivasi families across the agency tracts." },
    { category_name: "Governance", display_name: "PESA & Self-Governance", subtitle: "Empowering Gram Sabhas with sovereign self-governance powers under PESA Act 1996." },
    { category_name: "Polavaram PIP", display_name: "Polavaram LA & R&R", subtitle: "Defending the statutory rights of 1,05,000+ Project Displaced Families under the RFCTLARR Act 2013." },
    { category_name: "Women Cooperatives", display_name: "Antyodaya Women Cooperatives", subtitle: "3,500+ Yenadi fisherwomen organized into the Matsya Mithra cooperative federation." },
    { category_name: "Child Rights", display_name: "Child Interventions & Bare Acts", subtitle: "Statutory protection, bilingual education, and nutrition for every Adivasi child." },
    { category_name: "Disaster Relief", display_name: "Flood Relief Operations", subtitle: "Emergency rescue, relief, and rehabilitation for Godavari and Krishna flood-affected communities." },
    { category_name: "Clean Energy", display_name: "Solar & Clean Energy", subtitle: "Decentralized solar lighting for remote, un-electrified tribal habitations." },
    { category_name: "Agriculture", display_name: "Indigenous Millets & Seed Banks", subtitle: "Heritage millet cultivation, indigenous seed banks, and food sovereignty for Adivasi farmers." }
  ];

  return (
    <AdminLayout title="Our Work & Key Programs">
      <style>{`
        .prog-page {
          width: 100%;
          color: #f1f5f9;
          padding-bottom: 80px;
        }
        .prog-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          flex-wrap: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(192, 57, 43, 0.45) transparent;
          padding: 4px 2px 10px 2px;
          margin-bottom: 20px;
          width: 100%;
          box-sizing: border-box;
        }
        .prog-tab-short {
          display: none;
        }
        .prog-tab-full {
          display: inline;
        }
        .prog-field {
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 14px;
        }
        .prog-header-subactions,
        .prog-sec-subactions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .prog-tabs::-webkit-scrollbar {
          height: 3px;
          display: block;
        }
        .prog-tabs::-webkit-scrollbar-thumb {
          background: rgba(192, 57, 43, 0.5);
          border-radius: 3px;
        }
        .prog-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid #1e2436;
          background: #141820;
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .prog-tab-btn:hover {
          background: #1e2436;
          color: #fff;
        }
        .prog-tab-btn.active {
          background: #c0392b;
          color: #fff;
          border-color: #c0392b;
          box-shadow: 0 4px 14px rgba(192, 57, 43, 0.35);
        }
        .pillar-section-block {
          background: #111522;
          border: 1.5px solid #1f273a;
          border-radius: 14px;
          margin-bottom: 36px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          box-sizing: border-box;
          width: 100%;
        }
        .pillar-header-bar {
          background: linear-gradient(135deg, #171d2e 0%, #101420 100%);
          border-bottom: 1px solid #232c42;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          box-sizing: border-box;
          width: 100%;
        }
        .pillar-title-text {
          font-size: 1.35rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 6px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
          line-height: 1.3;
        }
        .pillar-sub-text {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.5;
          max-width: 820px;
          word-break: break-word;
        }
        .prog-cards-container {
          padding: 24px;
          box-sizing: border-box;
          width: 100%;
        }
        .prog-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          box-sizing: border-box;
          width: 100%;
        }
        .prog-card {
          background: #141824;
          border: 1px solid #202738;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .prog-card:hover {
          border-color: #3d4a66;
          transform: translateY(-2px);
        }
        .prog-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(192, 57, 43, 0.2);
          color: #ff6b6b;
          border: 1px solid rgba(192, 57, 43, 0.4);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .prog-btn-secondary {
          background: #1c2333;
          border: 1px solid #2a3449;
          color: #e2e8f0;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.82rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
        }
        .prog-btn-secondary:hover {
          background: #252f44;
          border-color: #3d4a66;
        }
        .prog-btn-delete-section {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .prog-btn-delete-section:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fff;
          border-color: #ef4444;
        }
        .prog-search-bar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }
        .prog-cat-pills-wrap {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          flex: 1 1 auto;
          min-width: 0;
        }
        .prog-search-box {
          position: relative;
          min-width: 260px;
        }
        .prog-form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }
        .prog-form-grid-1-2 {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .prog-antyodaya-img-row {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .prog-antyodaya-img-inputs {
          flex: 1;
          min-width: 260px;
        }

        .prog-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .prog-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
          flex-wrap: wrap;
          width: 100%;
        }
        .prog-page-h1 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0;
          color: #fff;
          word-break: break-word;
        }
        .prog-header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .prog-section-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .prog-bottom-cta-wrap {
          text-align: center;
          padding: 24px 0;
          box-sizing: border-box;
          width: 100%;
        }
        .prog-bottom-cta-wrap button {
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }

        /* ── Base Form Inputs & Labels ── */
        .prog-settings-panel {
          padding: 28px;
          box-sizing: border-box;
          width: 100%;
        }
        .prog-form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        .prog-input,
        .prog-textarea,
        .prog-select {
          width: 100%;
          background: #0d1017;
          border: 1px solid #263148;
          border-radius: 8px;
          padding: 10px 14px;
          color: #f1f5f9;
          font-size: 0.88rem;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          display: block;
          font-family: inherit;
        }
        .prog-input:focus,
        .prog-textarea:focus,
        .prog-select:focus {
          border-color: #c0392b;
          box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.25);
        }
        .prog-input::placeholder,
        .prog-textarea::placeholder {
          color: #55627a;
        }

        /* ── Modals (Add/Edit Card & Pillar) ── */
        .prog-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          box-sizing: border-box;
        }
        .prog-modal-card {
          background: #111522;
          border: 1.5px solid #26324b;
          border-radius: 14px;
          width: 100%;
          max-width: 780px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75);
          padding: 24px;
          box-sizing: border-box;
        }
        .prog-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #202738;
          padding-top: 16px;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .prog-page,
          .prog-page * {
            box-sizing: border-box !important;
            max-width: 100% !important;
          }
          /* Allow pill items inside scrollable row to exceed the wrap width */
          .prog-cat-pills-wrap > * {
            max-width: none !important;
          }
          .prog-page {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
          }
          .prog-settings-panel {
            padding: 14px 12px !important;
          }
          .prog-form-label {
            display: block !important;
            margin-bottom: 5px !important;
            font-size: 0.74rem !important;
          }
          .prog-input,
          .prog-textarea,
          .prog-select {
            width: 100% !important;
            box-sizing: border-box !important;
            background: #0d1017 !important;
            border: 1px solid #263148 !important;
            color: #f1f5f9 !important;
            padding: 8px 12px !important;
            font-size: 0.84rem !important;
            display: block !important;
          }
          .prog-tab-full {
            display: none !important;
          }
          .prog-tab-short {
            display: inline !important;
          }
          .prog-header-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          .prog-title-row {
            gap: 8px !important;
            flex-wrap: wrap !important;
          }
          .prog-page-h1 {
            font-size: 1.15rem !important;
            line-height: 1.3 !important;
          }
          .prog-header-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .prog-btn-add-card {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 8px 14px !important;
            font-size: 0.82rem !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
          }
          .prog-header-subactions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .prog-header-subactions > * {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 0.76rem !important;
            padding: 7px 8px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: inline-flex !important;
            align-items: center !important;
          }
          .prog-tabs {
            gap: 6px !important;
            padding: 2px 2px 8px 2px !important;
            margin-bottom: 14px !important;
          }
          .prog-tab-btn {
            padding: 6px 12px !important;
            font-size: 0.74rem !important;
            gap: 6px !important;
          }
          .prog-search-bar-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 16px !important;
          }
          .prog-cat-pills-wrap {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior-x: contain !important;
            gap: 5px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(255,255,255,0.2) transparent !important;
            padding-bottom: 4px !important;
          }
          .prog-cat-pills-wrap::-webkit-scrollbar {
            height: 3px !important;
            display: block !important;
          }
          .prog-cat-pills-wrap::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2) !important;
            border-radius: 3px !important;
          }
          .prog-cat-pills-wrap > * {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
          }
          .prog-search-box {
            min-width: 0 !important;
            width: 100% !important;
          }
          .pillar-section-block {
            margin-bottom: 16px !important;
            border-radius: 10px !important;
            overflow: hidden !important;
            max-width: 100% !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .pillar-header-bar {
            padding: 12px 10px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
            max-width: 100% !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            width: 100% !important;
          }
          .pillar-title-text {
            font-size: 1.05rem !important;
            flex-wrap: nowrap !important;
            gap: 6px !important;
            line-height: 1.3 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .pillar-title-text > span:first-child {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            min-width: 0 !important;
            flex: 1 1 0 !important;
          }
          .pillar-title-text > span:last-child {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
          }
          .pillar-sub-text {
            font-size: 0.80rem !important;
            line-height: 1.4 !important;
            word-break: break-word !important;
          }
          .prog-section-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .prog-sec-btn-add {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 0.80rem !important;
            padding: 8px 12px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
          }
          .prog-sec-subactions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .prog-sec-subactions > * {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            font-size: 0.76rem !important;
            padding: 6px 8px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
          }
          .prog-field {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
            margin-bottom: 12px !important;
          }
          .prog-btn-save-settings {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 10px 16px !important;
            font-size: 0.84rem !important;
            box-sizing: border-box !important;
          }
          .prog-cards-container {
            padding: 10px 8px !important;
          }
          .prog-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .prog-card {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .prog-bottom-cta-wrap {
            padding: 16px 8px !important;
          }
          .prog-bottom-cta-wrap button {
            width: 100% !important;
            padding: 9px 16px !important;
            font-size: 0.82rem !important;
            justify-content: center !important;
          }
          .prog-form-grid-2col,
          .prog-form-grid-1-2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .prog-antyodaya-img-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .prog-antyodaya-img-inputs {
            min-width: 0 !important;
            width: 100% !important;
          }
          .prog-antyodaya-img-inputs button {
            width: 100% !important;
            justify-content: center !important;
          }
          /* Prevent any minWidth blowout */
          .prog-page *[style*="minWidth: 2"],
          .prog-page *[style*="min-width: 2"],
          .prog-page *[style*="minWidth: 3"],
          .prog-page *[style*="min-width: 3"],
          .prog-page *[style*="minWidth: 1"] {
            min-width: 0 !important;
            width: 100% !important;
          }
          .prog-modal-backdrop {
            padding: 8px !important;
          }
          .prog-modal-card {
            padding: 14px 12px !important;
            max-height: 94vh !important;
            border-radius: 12px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .prog-modal-grid-2col,
          .prog-modal-inner-2col {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .prog-modal-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .prog-modal-actions button {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 10px 14px !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>

      <div className="prog-page">
        {/* HEADER BAR */}
        <div className="prog-header-bar">
          <div>
            <div className="prog-title-row">
              <h1 className="prog-page-h1">
                Our Work — Key Programs Overview
              </h1>
              <span className="prog-badge">Admin Management</span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0, wordBreak: "break-word" }}>
              Structured identically to <code style={{ color: "#f87171" }}>/programs</code>. Edit pillar headings &amp; subtitles directly, and manage all content cards below each heading.
            </p>
          </div>

          <div className="prog-header-actions">
            <button
              onClick={() => openAddCardUnderPillar("Forest Rights")}
              className="btn-primary prog-btn-add-card"
              style={{ padding: "8px 16px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem" }}
            >
              <FaPlus size={12} /> Add Content Card
            </button>
            <div className="prog-header-subactions">
              <Link
                to="/programs"
                target="_blank"
                className="prog-btn-secondary"
                title="Open public page"
              >
                <FaExternalLinkAlt size={12} /> View Public Page
              </Link>
              <button
                onClick={openCreatePillar}
                className="prog-btn-secondary"
                style={{ background: "rgba(59,130,246,0.15)", borderColor: "#3b82f6", color: "#60a5fa" }}
              >
                <FaPlus size={11} /> Create Section
              </button>
            </div>
          </div>
        </div>

        {/* NOTICES */}
        {notice && (
          <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", color: "#34d399", padding: "12px 18px", borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <FaCheckCircle /> {notice}
          </div>
        )}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171", padding: "12px 18px", borderRadius: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <FaTimes /> {error}
          </div>
        )}

        {/* TABS */}
        <div className="prog-tabs">
          <button
            className={`prog-tab-btn ${activeTab === "sections" ? "active" : ""}`}
            onClick={(e) => {
              setActiveTab("sections");
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }}
          >
            <FaLayerGroup />
            <span className="prog-tab-full">Section Headings &amp; Cards ({programsList.length} cards across {categoriesToRender.length} pillars)</span>
            <span className="prog-tab-short">Cards ({programsList.length})</span>
          </button>
          <button
            className={`prog-tab-btn ${activeTab === "antyodaya" ? "active" : ""}`}
            onClick={(e) => {
              setActiveTab("antyodaya");
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }}
          >
            <FaAward />
            <span className="prog-tab-full">Flagship Initiative (Antyodaya)</span>
            <span className="prog-tab-short">Antyodaya</span>
          </button>
          <button
            className={`prog-tab-btn ${activeTab === "header" ? "active" : ""}`}
            onClick={(e) => {
              setActiveTab("header");
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }}
          >
            <FaSlidersH />
            <span className="prog-tab-full">Page Header &amp; CTA Banner</span>
            <span className="prog-tab-short">Header &amp; CTA</span>
          </button>
        </div>

        {/* ================= TAB 1: SECTION HEADINGS & CONTENT CARDS ================= */}
        {activeTab === "sections" && (
          <>
            {/* SEARCH & QUICK JUMP */}
            <div className="prog-search-bar-row">
              <div className="prog-cat-pills-wrap">
                {categoriesToRender.map((cat) => (
                  <a
                    key={cat.category_name}
                    href={`#section-${cat.category_name}`}
                    style={{
                      background: "#161b28",
                      border: "1px solid #232c40",
                      color: "#94a3b8",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      padding: "5px 12px",
                      borderRadius: 20,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}
                  >
                    {cat.display_name.split(" ")[0]} ({programsList.filter((p) => (p.category || p.cat || "").toLowerCase() === cat.category_name.toLowerCase()).length})
                  </a>
                ))}
              </div>

              <div className="prog-search-box">
                <FaSearch size={12} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="prog-input"
                  style={{ paddingLeft: 34, fontSize: "0.82rem" }}
                />
              </div>
            </div>

            {/* SECTIONS LIST */}
            {categoriesToRender.map((cat, secIdx) => {
              const catKey = cat.category_name;
              const sectionPrograms = programsList.filter((p) => {
                const matchesCat = (p.category || p.cat || "").toLowerCase() === catKey.toLowerCase();
                const q = searchQuery.toLowerCase().trim();
                const matchesQ = !q || (p.title || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
                return matchesCat && matchesQ;
              });

              return (
                <div key={catKey} id={`section-${catKey}`} className="pillar-section-block">
                  {/* SECTION / PILLAR HEADING BAR */}
                  <div className="pillar-header-bar">
                    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                      <div className="pillar-title-text">
                        <span>{cat.display_name}</span>
                        <span style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 12, color: "#cbd5e1", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                          Section #{secIdx + 1}
                        </span>
                      </div>
                      <p className="pillar-sub-text">
                        {cat.subtitle || "Field interventions under this thematic area."}
                      </p>
                    </div>

                    <div className="prog-section-actions">
                      <button
                        type="button"
                        onClick={() => openAddCardUnderPillar(catKey)}
                        className="btn-primary prog-sec-btn-add"
                        style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                        title="Add a new card into this section"
                      >
                        <FaPlus size={10} /> Add Card to this Section
                      </button>
                      <div className="prog-sec-subactions">
                        <button
                          type="button"
                          onClick={() => openEditPillar(cat)}
                          className="prog-btn-secondary"
                          title="Edit Section Heading and Subtitle"
                        >
                          <FaEdit size={11} /> Edit Heading
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePillar(catKey)}
                          className="prog-btn-delete-section"
                          title="Delete entire section"
                        >
                          <FaTrash size={11} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CARDS UNDER THIS HEADING */}
                  <div className="prog-cards-container">
                    {sectionPrograms.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "32px", background: "#0c0f17", borderRadius: 8, border: "1px dashed #202738" }}>
                        <p style={{ color: "#64748b", margin: "0 0 12px" }}>No content cards under this heading yet.</p>
                        <button
                          type="button"
                          onClick={() => openAddCardUnderPillar(catKey)}
                          className="btn-primary"
                          style={{ padding: "7px 16px", borderRadius: 8, fontSize: "0.82rem" }}
                        >
                          <FaPlus size={11} /> Add First Card to {cat.display_name}
                        </button>
                      </div>
                    ) : (
                      <div className="prog-cards-grid">
                        {sectionPrograms.map((p, idx) => (
                          <div className="prog-card" key={p.id || idx}>
                            {/* Card Image */}
                            <div style={{ position: "relative", height: 160, overflow: "hidden", background: "#0a0d13" }}>
                              <img
                                src={p.img || p.image_url}
                                alt={p.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { e.currentTarget.src = "/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg"; }}
                              />
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,14,24,0.85), transparent 60%)" }} />
                              <span style={{ position: "absolute", top: 10, left: 10 }} className="prog-badge">
                                {p.category || p.cat}
                              </span>
                              <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: 4, fontSize: "0.7rem", color: "#cbd5e1" }}>
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Card Content */}
                            <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                              <h4 style={{ margin: "0 0 8px", fontSize: "1.02rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                                {p.title}
                              </h4>
                              <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {p.description || p.desc}
                              </p>

                              {/* Bullet Points */}
                              {p.details && Array.isArray(p.details) && p.details.length > 0 && (
                                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                                  {p.details.map((d, di) => (
                                    <li key={di} style={{ fontSize: "0.78rem", color: "#cbd5e1", display: "flex", alignItems: "flex-start", gap: 6 }}>
                                      <span style={{ color: "#c0392b", fontWeight: 700 }}>✔</span>
                                      <span>{d}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {/* Action Link Preview */}
                              <div style={{ marginBottom: 12, fontSize: "0.78rem", color: "#38bdf8", display: "flex", alignItems: "center", gap: 5 }}>
                                <FaLink size={10} /> {p.link_url || "/la-rr"}
                              </div>

                              {/* Action Buttons */}
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid #1c2333", paddingTop: 12, marginTop: "auto" }}>
                                <button
                                  type="button"
                                  onClick={() => openEditCard(p)}
                                  className="prog-btn-secondary"
                                  style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                                >
                                  <FaEdit size={11} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCard(p.id, p.title)}
                                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: "0.78rem" }}
                                  title="Delete card"
                                >
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* BOTTOM ADD SECTION BUTTON */}
            <div className="prog-bottom-cta-wrap">
              <button
                type="button"
                onClick={openCreatePillar}
                className="btn-primary"
              >
                <FaPlus /> Create Another Section / Pillar Heading
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 2: ANTYODAYA FLAGSHIP ================= */}
        {activeTab === "antyodaya" && (
          <div className="pillar-section-block prog-settings-panel">
            <h3 style={{ margin: "0 0 16px", fontSize: "1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <FaAward color="#c0392b" /> Antyodaya Flagship Initiative
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "-8px 0 24px" }}>
              Controls the BftW-supported Antyodaya showcase block at the bottom of the Key Programs Overview page.
            </p>

            <div className="prog-form-grid-2col">
              <div className="prog-field">
                <label className="prog-form-label">Section Eyebrow</label>
                <input
                  type="text"
                  className="prog-input"
                  value={pageSettings.antyodaya_eyebrow || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, antyodaya_eyebrow: e.target.value })}
                />
              </div>
              <div className="prog-field">
                <label className="prog-form-label">Main Title</label>
                <input
                  type="text"
                  className="prog-input"
                  value={pageSettings.antyodaya_title || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, antyodaya_title: e.target.value })}
                />
              </div>
            </div>

            <div className="prog-field" style={{ marginBottom: 16 }}>
              <label className="prog-form-label">Subtitle / Partner Support Line</label>
              <input
                type="text"
                className="prog-input"
                value={pageSettings.antyodaya_subtitle || ""}
                onChange={(e) => setPageSettings({ ...pageSettings, antyodaya_subtitle: e.target.value })}
              />
            </div>

            <div className="prog-form-grid-2col">
              <div className="prog-field">
                <label className="prog-form-label">Story Paragraph 1</label>
                <textarea
                  rows={4}
                  className="prog-textarea"
                  value={pageSettings.antyodaya_p1 || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, antyodaya_p1: e.target.value })}
                />
              </div>
              <div className="prog-field">
                <label className="prog-form-label">Story Paragraph 2</label>
                <textarea
                  rows={4}
                  className="prog-textarea"
                  value={pageSettings.antyodaya_p2 || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, antyodaya_p2: e.target.value })}
                />
              </div>
            </div>

            {/* Antyodaya Image & Caption */}
            <div className="prog-field" style={{ marginBottom: 24, background: "#0b0f19", border: "1px solid #1e2436", borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <label className="prog-form-label" style={{ fontSize: "0.92rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                    Featured Initiative Photo &amp; Caption
                  </label>
                  <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "#8892a4" }}>
                    Shown prominently in the Flagship Antyodaya showcase section on the public programs page.
                  </p>
                </div>
                {pageSettings.antyodaya_img && (
                  <span style={{ fontSize: "0.68rem", color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(56, 189, 248, 0.25)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pageSettings.antyodaya_img.startsWith("data:") ? "Local Base64 Preview" : pageSettings.antyodaya_img}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 220px) 1fr", gap: 18, alignItems: "start" }}>
                {/* Photo Preview Frame */}
                <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "2px solid #283348", background: "#0a0d14", minHeight: 140, boxShadow: "0 4px 14px rgba(0,0,0,0.4)" }}>
                  <img
                    src={pageSettings.antyodaya_img || "/uploads/programs/WhatsApp-Image-2021-07-24-at-8.04.03-PM-1-768x1024.jpeg"}
                    alt="Antyodaya Initiative"
                    style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      if (e.currentTarget.src !== "/uploads/programs/PHOTO-2023-02-15-19-21-00_1.jpg") {
                        e.currentTarget.src = "/uploads/programs/PHOTO-2023-02-15-19-21-00_1.jpg";
                      }
                    }}
                  />
                  <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, background: "rgba(10, 14, 24, 0.88)", padding: "3px 8px", borderRadius: 4, fontSize: "0.66rem", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pageSettings.antyodaya_caption || "Live Preview"}
                  </div>
                </div>

                {/* Photo Controls & Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Upload button & path input */}
                  <div>
                    <label className="prog-form-label" style={{ fontSize: "0.74rem" }}>Photo Server Path / URL</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input
                        type="text"
                        className="prog-input"
                        style={{ flex: 1, minWidth: 220, fontSize: "0.82rem" }}
                        placeholder="/uploads/programs/... or https://..."
                        value={pageSettings.antyodaya_img || ""}
                        onChange={(e) => setPageSettings({ ...pageSettings, antyodaya_img: e.target.value })}
                      />
                      <input
                        type="file"
                        ref={antyodayaFileRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAntyodayaImage(e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => antyodayaFileRef.current && antyodayaFileRef.current.click()}
                        disabled={uploadingAntyodayaImg}
                        className="prog-btn-secondary"
                        style={{ padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.8rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)", background: "rgba(56, 189, 248, 0.08)", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        <FaCloudUploadAlt size={15} />
                        {uploadingAntyodayaImg ? "Uploading Photo..." : "Upload New Photo"}
                      </button>
                    </div>
                  </div>

                  {/* Preset Photos */}
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      Quick Preset Photos:
                    </span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {[
                        { url: "/uploads/programs/WhatsApp-Image-2021-07-24-at-8.04.03-PM-1-768x1024.jpeg", label: "Antyodaya Fisherwomen (Default)" },
                        { url: "/uploads/programs/PHOTO-2023-02-15-19-21-00_1.jpg", label: "Matsya Mithra Cooperative" },
                        { url: "/uploads/programs/coastal-krishna-fishing.jpg", label: "Coastal Krishna Fishing" },
                        { url: "/uploads/programs/reel-4-women.jpg", label: "Women Mobilizers" },
                        { url: "/uploads/programs/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", label: "Solar Electrification" }
                      ].map((preset, pi) => (
                        <button
                          key={pi}
                          type="button"
                          onClick={() => {
                            setPageSettings((prev) => ({ ...prev, antyodaya_img: preset.url }));
                            showNotice(`Selected preset: ${preset.label}`);
                          }}
                          style={{
                            background: pageSettings.antyodaya_img === preset.url ? "rgba(192, 57, 43, 0.35)" : "#181e2b",
                            border: `1px solid ${pageSettings.antyodaya_img === preset.url ? "#c0392b" : "#283348"}`,
                            color: pageSettings.antyodaya_img === preset.url ? "#ffffff" : "#cbd5e1",
                            fontSize: "0.72rem",
                            padding: "4px 9px",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontWeight: pageSettings.antyodaya_img === preset.url ? 700 : 500
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="prog-form-label" style={{ fontSize: "0.74rem" }}>Photo Caption</label>
                    <input
                      type="text"
                      className="prog-input"
                      placeholder="e.g. Antyodaya Project — coastal Krishna District"
                      value={pageSettings.antyodaya_caption || ""}
                      onChange={(e) => setPageSettings({ ...pageSettings, antyodaya_caption: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="btn-primary prog-btn-save-settings"
              style={{ padding: "10px 24px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}
            >
              <FaSave /> Save Antyodaya Settings
            </button>
          </div>
        )}

        {/* ================= TAB 3: HEADER & CTA ================= */}
        {activeTab === "header" && (
          <div className="pillar-section-block prog-settings-panel">
            <h3 style={{ margin: "0 0 16px", fontSize: "1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <FaSlidersH color="#c0392b" /> Page Header &amp; Bottom Call to Action
            </h3>

            <div className="prog-form-grid-1-2">
              <div className="prog-field">
                <label className="prog-form-label">Top Badge</label>
                <input
                  type="text"
                  className="prog-input"
                  value={pageSettings.page_badge || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, page_badge: e.target.value })}
                />
              </div>
              <div className="prog-field">
                <label className="prog-form-label">Page Headline</label>
                <input
                  type="text"
                  className="prog-input"
                  value={pageSettings.page_title || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, page_title: e.target.value })}
                />
              </div>
            </div>

            <div className="prog-field" style={{ marginBottom: 24 }}>
              <label className="prog-form-label">Header Subtitle</label>
              <textarea
                rows={2}
                className="prog-textarea"
                value={pageSettings.page_subtitle || ""}
                onChange={(e) => setPageSettings({ ...pageSettings, page_subtitle: e.target.value })}
              />
            </div>

            <hr style={{ borderColor: "#202738", margin: "24px 0" }} />

            <h4 style={{ margin: "0 0 14px", color: "#fff", fontSize: "1rem" }}>Call To Action (CTA) Banner</h4>
            <div className="prog-form-grid-1-2">
              <div className="prog-field">
                <label className="prog-form-label">CTA Badge</label>
                <input
                  type="text"
                  className="prog-input"
                  value={pageSettings.cta_badge || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, cta_badge: e.target.value })}
                />
              </div>
              <div className="prog-field">
                <label className="prog-form-label">CTA Headline</label>
                <input
                  type="text"
                  className="prog-input"
                  value={pageSettings.cta_title || ""}
                  onChange={(e) => setPageSettings({ ...pageSettings, cta_title: e.target.value })}
                />
              </div>
            </div>

            <div className="prog-field" style={{ marginBottom: 20 }}>
              <label className="prog-form-label">CTA Description</label>
              <textarea
                rows={3}
                className="prog-textarea"
                value={pageSettings.cta_subtitle || ""}
                onChange={(e) => setPageSettings({ ...pageSettings, cta_subtitle: e.target.value })}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="btn-primary prog-btn-save-settings"
              style={{ padding: "10px 24px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}
            >
              <FaSave /> Save Page Header &amp; CTA
            </button>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT CARD ================= */}
        {isCardModalOpen && (
          <div className="prog-modal-backdrop" onClick={() => setIsCardModalOpen(false)}>
            <div className="prog-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #242e42", paddingBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                  {editingCardId ? <><FaEdit color="#c0392b" /> Edit Content Card #{editingCardId}</> : <><FaPlus color="#c0392b" /> Add New Content Card</>}
                </h3>
                <button
                  onClick={() => setIsCardModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveCard}>
                <div className="prog-modal-grid-2col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 20 }}>
                  {/* Left Column */}
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <label className="prog-form-label">Card Title *</label>
                      <input
                        type="text"
                        className="prog-input"
                        placeholder="e.g. RoFR & Tribal Land Advocacy"
                        value={cardForm.title}
                        onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="prog-modal-inner-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div>
                        <label className="prog-form-label">Pillar Section *</label>
                        <select
                          className="prog-select"
                          value={cardForm.category}
                          onChange={(e) => setCardForm({ ...cardForm, category: e.target.value })}
                        >
                          {categoriesToRender.map((c) => (
                            <option key={c.category_name} value={c.category_name}>{c.display_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="prog-form-label">Documentation Link</label>
                        <input
                          type="text"
                          className="prog-input"
                          value={cardForm.link_url}
                          onChange={(e) => setCardForm({ ...cardForm, link_url: e.target.value })}
                          placeholder="/la-rr"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="prog-form-label">Description / Summary *</label>
                      <textarea
                        rows={4}
                        className="prog-textarea"
                        placeholder="Intervention summary..."
                        value={cardForm.description}
                        onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                        required
                      />
                    </div>

                    {/* Bullet Points */}
                    <div>
                      <label className="prog-form-label">Field Interventions (Bullet Points ✔)</label>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <input
                          type="text"
                          className="prog-input"
                          style={{ flex: 1, minWidth: 0 }}
                          placeholder="e.g. Gram Sabha Resolution Filing..."
                          value={newDetailPoint}
                          onChange={(e) => setNewDetailPoint(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddDetailPoint(); } }}
                        />
                        <button
                          type="button"
                          onClick={handleAddDetailPoint}
                          className="prog-btn-secondary"
                          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          <FaPlus size={10} /> Add
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 140, overflowY: "auto" }}>
                        {cardForm.details && cardForm.details.map((pt, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0c0f16", padding: "6px 12px", borderRadius: 6, border: "1px solid #1e2538", fontSize: "0.82rem" }}>
                            <span>✔ {pt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDetailPoint(idx)}
                              style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: 2 }}
                              title="Delete point"
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Image */}
                  <div>
                    <label className="prog-form-label">Card Cover Image</label>
                    <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "-4px 0 10px" }}>
                      Uploads directly to <code style={{ color: "#38bdf8" }}>/uploads/programs/</code>
                    </p>

                    <div style={{ position: "relative", height: 180, borderRadius: 8, overflow: "hidden", border: "1px solid #202738", marginBottom: 12, background: "#0a0d13" }}>
                      <img
                        src={cardForm.img}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.src = "/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg"; }}
                      />
                      <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.8)", padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", color: "#cbd5e1" }}>
                        {cardForm.img}
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={cardFileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={(e) => { if (e.target.files && e.target.files[0]) handleCardImageUpload(e.target.files[0]); }}
                    />
                    <button
                      type="button"
                      onClick={() => cardFileInputRef.current && cardFileInputRef.current.click()}
                      className="prog-btn-secondary"
                      style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
                    >
                      <FaCloudUploadAlt size={14} /> {uploadingCardImg ? "Uploading to /uploads/programs/..." : "Upload Photo to /uploads/programs/"}
                    </button>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Preset Images:</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {PRESET_PROGRAM_PHOTOS.slice(0, 6).map((preset, pi) => (
                          <button
                            key={pi}
                            type="button"
                            onClick={() => setCardForm((prev) => ({ ...prev, img: preset.url }))}
                            style={{
                              background: cardForm.img === preset.url ? "#c0392b" : "#181e2b",
                              border: "1px solid #283348",
                              color: "#f1f5f9",
                              fontSize: "0.72rem",
                              padding: "3px 8px",
                              borderRadius: 4,
                              cursor: "pointer"
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prog-modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsCardModalOpen(false)}
                    className="prog-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: "9px 24px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                  >
                    <FaSave /> {loading ? "Saving..." : (editingCardId ? "Save Card Changes" : "Create Card")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT PILLAR HEADING ================= */}
        {isPillarModalOpen && (
          <div className="prog-modal-backdrop" onClick={() => setIsPillarModalOpen(false)}>
            <div className="prog-modal-card" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #242e42", paddingBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaHeading color="#c0392b" />
                  {editingPillarKey ? `Edit Section: ${editingPillarKey}` : "Create New Section / Pillar Heading"}
                </h3>
                <button
                  onClick={() => setIsPillarModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSavePillar}>
                <div style={{ marginBottom: 16 }}>
                  <label className="prog-form-label">Category Identifier Name *</label>
                  <input
                    type="text"
                    className="prog-input"
                    placeholder="e.g. Legal Defense or Clean Energy"
                    value={pillarForm.category_name}
                    onChange={(e) => setPillarForm({ ...pillarForm, category_name: e.target.value })}
                    disabled={!!editingPillarKey}
                    required
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Unique section identifier.</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="prog-form-label">Reader-Facing Heading Title *</label>
                  <input
                    type="text"
                    className="prog-input"
                    placeholder="e.g. Forest Rights (RoFR & LTR)"
                    value={pillarForm.display_name}
                    onChange={(e) => setPillarForm({ ...pillarForm, display_name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="prog-form-label">Section Subtitle / Description *</label>
                  <textarea
                    rows={3}
                    className="prog-textarea"
                    placeholder="Brief description appearing right below the heading on /programs..."
                    value={pillarForm.subtitle}
                    onChange={(e) => setPillarForm({ ...pillarForm, subtitle: e.target.value })}
                    required
                  />
                </div>

                <div className="prog-modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsPillarModalOpen(false)}
                    className="prog-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: "9px 24px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                  >
                    <FaSave /> {loading ? "Saving..." : (editingPillarKey ? "Save Heading" : "Create Heading")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
