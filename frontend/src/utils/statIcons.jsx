import {
  FaClock,
  FaMapMarkedAlt,
  FaShip,
  FaWater,
  FaHandHoldingHeart,
  FaCalendarAlt,
  FaBalanceScale,
  FaUsers,
  FaHome,
  FaBolt,
  FaUtensils,
  FaBed,
  FaSun,
  FaCheckCircle,
  FaChartBar
} from "react-icons/fa";

export const STAT_ICON_OPTIONS = [
  { id: "clock", label: "Clock / Time / Year", icon: FaClock },
  { id: "map", label: "Map / Mandals / Region", icon: FaMapMarkedAlt },
  { id: "ship", label: "Ship / Boat / Transport", icon: FaShip },
  { id: "water", label: "Water / Flood / River", icon: FaWater },
  { id: "heart", label: "Heart / Relief / Aid", icon: FaHandHoldingHeart },
  { id: "calendar", label: "Calendar / Campaign", icon: FaCalendarAlt },
  { id: "users", label: "Users / Families / People", icon: FaUsers },
  { id: "home", label: "Home / Hamlet / Village", icon: FaHome },
  { id: "bolt", label: "Solar / Lantern / Energy", icon: FaBolt },
  { id: "sun", label: "Sun / Solar Light", icon: FaSun },
  { id: "utensils", label: "Food / Groceries", icon: FaUtensils },
  { id: "bed", label: "Blankets / Bedding", icon: FaBed },
  { id: "balance", label: "Scale / Legal / Rights", icon: FaBalanceScale },
  { id: "chart", label: "Chart / Stats", icon: FaChartBar }
];

export const STAT_COLOR_OPTIONS = [
  { value: "#003190", label: "Navy Blue" },
  { value: "#D2190C", label: "Crimson Red" },
  { value: "#3E8E0F", label: "Forest Green" },
  { value: "#F5A000", label: "Golden Amber" },
  { value: "#8B5CF6", label: "Royal Purple" },
  { value: "#06B6D4", label: "Ocean Teal" },
  { value: "#EC4899", label: "Rose Pink" }
];

export const DEFAULT_STATS_BY_SLUG = {
  "flood-relief-measures-2022": [
    { num: "2022", label: "Relief Year", icon: "clock", color: "#003190" },
    { num: "5", label: "Mandal Coverage", icon: "map", color: "#3E8E0F" },
    { num: "Solar", label: "Lanterns Distributed", icon: "ship", color: "#D2190C" },
    { num: "100+", label: "Hamlets Energized", icon: "water", color: "#F5A000" }
  ],
  "2023-2": [
    { num: "4,200+", label: "Families Relieved", icon: "water", color: "#D2190C" },
    { num: "2023", label: "Relief Year", icon: "clock", color: "#003190" },
    { num: "Godavari", label: "Basin Coverage", icon: "map", color: "#3E8E0F" },
    { num: "15+", label: "Boat Deployments", icon: "ship", color: "#D2190C" }
  ],
  "flood-relief-measures-2021-2": [
    { num: "2021", label: "Relief Year", icon: "clock", color: "#003190" },
    { num: "48hrs", label: "Avg Response Time", icon: "clock", color: "#D2190C" },
    { num: "Rescue", label: "Boat Deployments", icon: "ship", color: "#D2190C" },
    { num: "Hill", label: "Habitations Reached", icon: "map", color: "#3E8E0F" }
  ],
  "flood-relief-measures-2020": [
    { num: "2020", label: "Relief Year", icon: "clock", color: "#003190" },
    { num: "3,000+", label: "Blankets Distributed", icon: "ship", color: "#D2190C" },
    { num: "Groceries", label: "West Godavari", icon: "map", color: "#3E8E0F" },
    { num: "Lockdown", label: "COVID Relief", icon: "water", color: "#F5A000" }
  ],
  "blankets-distribution-in-east-godavari": [
    { num: "3,000+", label: "Thermal Blankets Distributed", icon: "ship", color: "#D2190C" },
    { num: "East Godavari", label: "Hill Agency Belt", icon: "map", color: "#003190" },
    { num: "2020", label: "Winter Relief Campaign", icon: "clock", color: "#3E8E0F" },
    { num: "Konda Reddi", label: "PVTG Tribal Communities", icon: "water", color: "#F5A000" }
  ],
  "groceries-distribution-in-west-godavari": [
    { num: "1,200+", label: "Grocery Hampers Delivered", icon: "ship", color: "#D2190C" },
    { num: "West Godavari", label: "Forested Tribal Pockets", icon: "map", color: "#003190" },
    { num: "COVID-19", label: "Pandemic Lockdown Relief", icon: "clock", color: "#3E8E0F" },
    { num: "100%", label: "Direct Hamlet Reach", icon: "water", color: "#16A34A" }
  ],
  "flood-relief-measures": [
    { num: "4,200+", label: "Families Emergency Relieved", icon: "water", color: "#D2190C" },
    { num: "5", label: "Major Flood Operations (2019–2023)", icon: "map", color: "#003190" },
    { num: "48hrs", label: "Average Response Time", icon: "clock", color: "#D97706" },
    { num: "15+", label: "Rescue Boat Deployments", icon: "ship", color: "#16A34A" }
  ],

  // RoFR & LTR Pages
  "achievements": [
    { num: "3,452", label: "Farmers Supported (APCBTM Tank Project)", icon: "users", color: "#3E8E0F" },
    { num: "495", label: "Child Labourers Mainstreamed", icon: "balance", color: "#003190" },
    { num: "350", label: "Tribal Organic Farmers", icon: "map", color: "#F5A000" },
    { num: "254", label: "Youth Rescue Swimmers (UNDP DRR)", icon: "ship", color: "#D2190C" }
  ],
  "child-interventions": [
    { num: "1,500+", label: "Adivasi Children Reached", icon: "users", color: "#003190" },
    { num: "5", label: "Koya Basha Teachers Deployed", icon: "home", color: "#3E8E0F" },
    { num: "100+", label: "Solar Hamlets Energized", icon: "map", color: "#F5A000" },
    { num: "12", label: "Child Protection Committees", icon: "balance", color: "#D2190C" }
  ],
  "child-bare-acts": [
    { num: "5", label: "Enacted Bare Acts & Rules", icon: "balance", color: "#003190" },
    { num: "2005-22", label: "Legislative Timeline", icon: "calendar", color: "#3E8E0F" },
    { num: "100%", label: "Official Full-Text Access", icon: "chart", color: "#F5A000" },
    { num: "POCSO/JJ", label: "Child Protection Standards", icon: "clock", color: "#D2190C" }
  ],
  "reports": [
    { num: "20+", label: "Continuous Years of Audit", icon: "calendar", color: "#003190" },
    { num: "100%", label: "Statutory Compliance", icon: "balance", color: "#3E8E0F" },
    { num: "4+", label: "Key Field Surveys Archived", icon: "chart", color: "#F5A000" },
    { num: "Audited", label: "Financial Records Open", icon: "clock", color: "#D2190C" }
  ],
  "portfolio-3": [
    { num: "25,000+", label: "Tribal Families Defended", icon: "users", color: "#003190" },
    { num: "371", label: "Polavaram Villages Monitored", icon: "map", color: "#D2190C" },
    { num: "75", label: "Off-Grid Solar Hamlets", icon: "home", color: "#F5A000" },
    { num: "20+", label: "Years Grassroots Leadership", icon: "chart", color: "#3E8E0F" }
  ],
  "rofr": [
    { num: "15,453", label: "Titles Recognized", icon: "balance", color: "#003190" },
    { num: "1,03,397", label: "Extent in Acres", icon: "map", color: "#3E8E0F" },
    { num: "4,735", label: "Claims Under Process", icon: "clock", color: "#D2190C" },
    { num: "842", label: "Community Forest Titles", icon: "users", color: "#F5A000" }
  ],
  "abstract-rofr": [
    { num: "14,611", label: "Approved Individual Titles", icon: "balance", color: "#003190" },
    { num: "89,682", label: "Approved Extent (Acres)", icon: "map", color: "#3E8E0F" },
    { num: "4,025", label: "Claims Under Process", icon: "clock", color: "#D2190C" },
    { num: "15,453", label: "Total Recognized Titles", icon: "chart", color: "#F5A000" }
  ],
  "reasons-for-rejections": [
    { num: "2,340+", label: "Inquiries Conducted", icon: "balance", color: "#D2190C" },
    { num: "100%", label: "Gram Sabha Resubmissions", icon: "users", color: "#003190" },
    { num: "4", label: "Primary Rejection Categories", icon: "map", color: "#3E8E0F" },
    { num: "Sec 6", label: "FRA Statutory Appeals", icon: "clock", color: "#D97706" }
  ],
  "compendium-of-judgements-rofr": [
    { num: "660+", label: "Compendium Pages", icon: "balance", color: "#003190" },
    { num: "2007-15", label: "Judgement Archive Period", icon: "calendar", color: "#3E8E0F" },
    { num: "100%", label: "High Court & SC Rulings", icon: "chart", color: "#D2190C" },
    { num: "Statutory", label: "Legal Reference Compendium", icon: "clock", color: "#F5A000" }
  ],
  "rofr-g-os": [
    { num: "22+", label: "Official Government Orders", icon: "balance", color: "#003190" },
    { num: "MoTA", label: "Central Ministry Directives", icon: "home", color: "#3E8E0F" },
    { num: "AP Govt", label: "Tribal Welfare Notifications", icon: "map", color: "#D2190C" },
    { num: "100%", label: "Verified Gazette Circulars", icon: "chart", color: "#16A34A" }
  ],
  "ltr": [
    { num: "1,420+", label: "LTR Cases Inquired", icon: "balance", color: "#003190" },
    { num: "8,950+", label: "Acres Tribal Land Reclaimed", icon: "map", color: "#3E8E0F" },
    { num: "100%", label: "Ejectment Decrees Monitored", icon: "home", color: "#D2190C" },
    { num: "ASR", label: "Alluri Sitharama Raju District", icon: "map", color: "#F5A000" }
  ],
  "ltr-eluru": [
    { num: "850+", label: "Eluru Inquiries Registered", icon: "balance", color: "#003190" },
    { num: "4,200+", label: "Acres Restored to Tribals", icon: "map", color: "#3E8E0F" },
    { num: "Act 1/70", label: "Statutory Land Protections", icon: "chart", color: "#D2190C" },
    { num: "100%", label: "Appellate Representation", icon: "users", color: "#16A34A" }
  ],
  "ltr-disposal-meanings": [
    { num: "8", label: "Statutory Disposal Categories", icon: "chart", color: "#003190" },
    { num: "Decree", label: "Restitution Orders Enforced", icon: "balance", color: "#3E8E0F" },
    { num: "Section 3", label: "Null & Void Transfers Proved", icon: "clock", color: "#D2190C" },
    { num: "100%", label: "Legal Literacy Compliance", icon: "users", color: "#F5A000" }
  ],

  // Polavaram Pages
  "polavaram": [
    { num: "371", label: "Submergence Villages Monitored", icon: "home", color: "#003190" },
    { num: "1.5L+", label: "Displaced Tribal Population", icon: "users", color: "#D2190C" },
    { num: "2.8L+", label: "Acres Submergence Zone", icon: "map", color: "#3E8E0F" },
    { num: "100%", label: "Survey Ground Verification", icon: "chart", color: "#16A34A" }
  ],
  "polavaram-overview": [
    { num: "371", label: "Submergence Villages Monitored", icon: "home", color: "#003190" },
    { num: "1.5L+", label: "Displaced Tribal Population", icon: "users", color: "#D2190C" },
    { num: "2.8L+", label: "Acres Submergence Zone", icon: "map", color: "#3E8E0F" },
    { num: "100%", label: "Survey Ground Verification", icon: "chart", color: "#16A34A" }
  ],
  "polavaram-submergence-villages": [
    { num: "371", label: "Submergence Villages", icon: "home", color: "#003190" },
    { num: "44", label: "Contour +41.15m Priority", icon: "water", color: "#D2190C" },
    { num: "1.05L", label: "Displaced Families", icon: "users", color: "#F5A000" },
    { num: "9 Mandals", label: "Godavari Agency Belt", icon: "map", color: "#3E8E0F" }
  ],
  "submergence-area-map": [
    { num: "371", label: "Villages Mapped", icon: "map", color: "#003190" },
    { num: "+45.72m", label: "Full Reservoir Level Contour", icon: "water", color: "#D2190C" },
    { num: "6 Mandals", label: "Alluri Sitharama Raju", icon: "home", color: "#3E8E0F" },
    { num: "100%", label: "GIS Ground Verified", icon: "chart", color: "#16A34A" }
  ],
  "polavaram-r-r-status": [
    { num: "1.05L+", label: "Displaced PDF Families", icon: "users", color: "#003190" },
    { num: "₹10.0L", label: "Special R&R Package", icon: "chart", color: "#3E8E0F" },
    { num: "44", label: "Phase 1 Priority Hamlets", icon: "home", color: "#D2190C" },
    { num: "100%", label: "Allotment Verification", icon: "balance", color: "#16A34A" }
  ],
  "polavaram-colonies-monitored": [
    { num: "50+", label: "Resettlement Colonies", icon: "home", color: "#003190" },
    { num: "25,000+", label: "Habitations Monitored", icon: "users", color: "#3E8E0F" },
    { num: "12", label: "Basic Civic Amenities Audited", icon: "water", color: "#D2190C" },
    { num: "100%", label: "Community Grievances Filed", icon: "balance", color: "#F5A000" }
  ],

  // LA & RR Pages
  "la-rr": [
    { num: "15,000+", label: "Acres Forest Rights Secured", icon: "map", color: "#003190" },
    { num: "₹50+ Cr", label: "R&R Compensation Tracked", icon: "chart", color: "#3E8E0F" },
    { num: "120+", label: "Court Cases Represented", icon: "balance", color: "#D2190C" },
    { num: "100%", label: "Entitlements Audited", icon: "users", color: "#16A34A" }
  ],
  "r-r-package": [
    { num: "₹10.0L", label: "Statutory R&R Package", icon: "chart", color: "#003190" },
    { num: "18+ Yrs", label: "Major Youth Entitlements", icon: "users", color: "#3E8E0F" },
    { num: "5 Cents", label: "House Site Allotment", icon: "home", color: "#F5A000" },
    { num: "100%", label: "Gazette Entitlement Proofs", icon: "balance", color: "#D2190C" }
  ],
  "cases": [
    { num: "120+", label: "Active & Disposed Cases", icon: "balance", color: "#003190" },
    { num: "High Court", label: "AP High Court Benches", icon: "home", color: "#3E8E0F" },
    { num: "Sec 64", label: "RFCTLARR 2013 References", icon: "clock", color: "#D2190C" },
    { num: "100%", label: "Legal Aid Provided Free", icon: "users", color: "#16A34A" }
  ],
  "act-rules": [
    { num: "Act 30/13", label: "RFCTLARR Statutory Base", icon: "balance", color: "#003190" },
    { num: "2014", label: "AP State LARR Rules", icon: "clock", color: "#3E8E0F" },
    { num: "Chapter V", label: "R&R Statutory Scheme", icon: "home", color: "#D2190C" },
    { num: "100%", label: "Statutory Schedules Covered", icon: "chart", color: "#16A34A" }
  ],
  "petitions": [
    { num: "350+", label: "Public Grievance Petitions", icon: "balance", color: "#003190" },
    { num: "Collectorate", label: "District Forum Representations", icon: "home", color: "#3E8E0F" },
    { num: "Tribunal", label: "LARR Authority Applications", icon: "clock", color: "#D2190C" },
    { num: "100%", label: "Follow-up Tracking", icon: "users", color: "#16A34A" }
  ]
};

export function renderStatIcon(iconName, color = "#003190", size = 22) {
  const norm = String(iconName || "").toLowerCase().trim();
  switch (norm) {
    case "clock":
    case "time":
    case "year":
      return <FaClock size={size} color={color} />;
    case "map":
    case "location":
    case "mandals":
      return <FaMapMarkedAlt size={size} color={color} />;
    case "ship":
    case "boat":
    case "transport":
      return <FaShip size={size} color={color} />;
    case "water":
    case "flood":
    case "river":
      return <FaWater size={size} color={color} />;
    case "heart":
    case "relief":
    case "aid":
      return <FaHandHoldingHeart size={size} color={color} />;
    case "calendar":
      return <FaCalendarAlt size={size} color={color} />;
    case "users":
    case "family":
    case "people":
      return <FaUsers size={size} color={color} />;
    case "home":
    case "village":
    case "hamlet":
      return <FaHome size={size} color={color} />;
    case "bolt":
    case "solar":
    case "lantern":
      return <FaBolt size={size} color={color} />;
    case "sun":
      return <FaSun size={size} color={color} />;
    case "utensils":
    case "groceries":
    case "food":
      return <FaUtensils size={size} color={color} />;
    case "bed":
    case "blanket":
      return <FaBed size={size} color={color} />;
    case "balance":
    case "scale":
      return <FaBalanceScale size={size} color={color} />;
    case "chart":
      return <FaChartBar size={size} color={color} />;
    default:
      return <FaHandHoldingHeart size={size} color={color} />;
  }
}

