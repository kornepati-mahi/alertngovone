export const defaultOperationalRegions = [
  {
    id: "asr",
    name: "ASR District (Alluri Sitharama Raju)",
    shortName: "ASR District",
    badgeColor: "#10b981", // Green matching original official map
    itda: ["Rampachodavaram ITDA", "Chinturu ITDA"],
    focus: "PESA Gram Sabha sovereignty, RoFR Community Forest Rights (CFR), and forest dwelling tribal land titles.",
    tribes: ["Koya", "Konda Reddi (PVTG)", "Valmiki"],
    center: [17.55, 81.55],
    zoom: 9.5,
    polygonCoords: [
      [17.85, 81.25],
      [17.82, 81.55],
      [17.65, 81.85],
      [17.35, 81.88],
      [17.25, 81.65],
      [17.48, 81.35],
      [17.75, 81.25]
    ],
    mandals: [
      {
        id: "chinturu",
        name: "1. Chinturu",
        fullName: "Chinturu Mandal",
        itda: "Chinturu ITDA",
        lat: 17.747,
        lng: 81.393,
        river: "Sabari & Godavari Basin",
        actionTag: "Community Mobilization",
        activities: "Gram Sabha Patta titling under RoFR 2006, flash flood warning system, emergency relief distribution."
      },
      {
        id: "devipatnam",
        name: "2. Devipatnam",
        fullName: "Devipatnam Mandal",
        itda: "Rampachodavaram ITDA",
        lat: 17.291,
        lng: 81.673,
        river: "Godavari Gorge Area",
        actionTag: "Community Mobilization",
        activities: "Polavaram submergence R&R package entitlement verification, youth cooperative training."
      },
      {
        id: "kunavaram",
        name: "3. Kunavaram",
        fullName: "Kunavaram Mandal",
        itda: "Chinturu ITDA",
        lat: 17.585,
        lng: 81.272,
        river: "Sabari-Godavari Confluence",
        actionTag: "Community Mobilization",
        activities: "Monsoon disaster risk reduction, tribal healthcare camps, forest produce value addition."
      },
      {
        id: "maredumilli",
        name: "4. Maredumilli",
        fullName: "Maredumilli Mandal",
        itda: "Rampachodavaram ITDA",
        lat: 17.595,
        lng: 81.713,
        river: "Eastern Ghats Forest Reserve",
        actionTag: "Community Mobilization",
        activities: "Community Forest Resource rights mapping, sustainable bamboo & NTFP harvest stewardship."
      },
      {
        id: "rcvaram",
        name: "5. R.C. Varam",
        fullName: "Rampachodavaram Mandal",
        itda: "Rampachodavaram ITDA",
        lat: 17.447,
        lng: 81.776,
        river: "Agency Administrative Center",
        actionTag: "Community Mobilization",
        activities: "Regional legal aid cell, high court writ petition documentation, human rights paralegal clinic."
      },
      {
        id: "vrpuram",
        name: "6. V.R. Puram",
        fullName: "Vararamachandrapuram Mandal",
        itda: "Chinturu ITDA",
        lat: 17.545,
        lng: 81.332,
        river: "Deep Agency Riverine Belt",
        actionTag: "Community Mobilization",
        activities: "Solar micro-grid home electrification, tribal nutrition & ashram school quality monitoring."
      }
    ]
  },
  {
    id: "eluru",
    name: "Eluru Agency District",
    shortName: "Eluru District",
    badgeColor: "#ef4444", // Red matching original official map
    itda: ["K.R. Puram ITDA"],
    focus: "Land Transfer Regulation (LTR 1/70) enforcement, agricultural cooperatives, and fair Polavaram displacement compensation.",
    tribes: ["Koya", "Konda Dora", "Nayaks"],
    center: [17.3, 81.3],
    zoom: 9.5,
    polygonCoords: [
      [17.65, 81.1],
      [17.55, 81.3],
      [17.32, 81.65],
      [17.18, 81.6],
      [17.1, 81.25],
      [17.25, 81.08]
    ],
    mandals: [
      {
        id: "buttayigudem",
        name: "1. Buttayigudem",
        fullName: "Buttayigudem Mandal",
        itda: "K.R. Puram ITDA",
        lat: 17.151,
        lng: 81.298,
        river: "Jalleru Reservoir Belt",
        actionTag: "Community Mobilization",
        activities: "Land Transfer Regulation 1 of 1970 restitution litigation, organic millets & turmeric collective farming."
      },
      {
        id: "jeelugumilli",
        name: "2. Jeelugumilli",
        fullName: "Jeelugumilli Mandal",
        itda: "K.R. Puram ITDA",
        lat: 17.185,
        lng: 81.161,
        river: "Agency Foothill Plains",
        actionTag: "Community Mobilization",
        activities: "Forest rights claim dispute resolution, women self-help microfinance cooperatives."
      },
      {
        id: "kukkunuru",
        name: "3. Kukkunuru",
        fullName: "Kukkunuru Mandal",
        itda: "K.R. Puram ITDA",
        lat: 17.575,
        lng: 81.196,
        river: "Godavari Riverine Basin",
        actionTag: "Community Mobilization",
        activities: "Polavaram displacement rehabilitation survey, youth vocational rights advocacy."
      },
      {
        id: "velerpadu",
        name: "4. Velerpadu",
        fullName: "Velerpadu Mandal",
        itda: "K.R. Puram ITDA",
        lat: 17.485,
        lng: 81.171,
        river: "Godavari Upstream Belt",
        actionTag: "Community Mobilization",
        activities: "Resettlement housing quality audits, potable drinking water filter installation."
      },
      {
        id: "polavaram",
        name: "5. Polavaram",
        fullName: "Polavaram Mandal",
        itda: "K.R. Puram ITDA",
        lat: 17.251,
        lng: 81.642,
        river: "Project Dam Site Epicenter",
        actionTag: "Community Mobilization",
        activities: "Statutory RFCTLARR Act 2013 compliance monitoring, grievance redressal for displaced families."
      }
    ]
  },
  {
    id: "submergence",
    name: "Polavaram Submergence Area",
    shortName: "371 Villages Zone",
    badgeColor: "#f59e0b", // Yellow / Amber matching original official map
    itda: ["Tri-ITDA Jurisdiction"],
    focus: "Comprehensive entitlement monitoring for 371 tribal habitations facing total submergence under the Polavaram Mega Dam reservoir.",
    tribes: ["Koya", "Konda Reddi", "Hill Tribals"],
    center: [17.38, 81.52],
    zoom: 10.5,
    polygonCoords: [
      [17.48, 81.45],
      [17.45, 81.65],
      [17.25, 81.66],
      [17.28, 81.42]
    ],
    mandals: [
      {
        id: "submerged_habitations",
        name: "371 Villages Submergence Zone",
        fullName: "371 Submerged Villages Zone",
        itda: "Tri-ITDA Jurisdiction",
        lat: 17.38,
        lng: 81.52,
        river: "Contour 41.15m & 45.72m Flood Levels",
        actionTag: "Community Mobilization",
        activities: "Independent social audit of R&R housing, land-for-land entitlement verification, and legal representation in Supreme Court / High Court."
      }
    ]
  },
  {
    id: "coastal",
    name: "Coastal Krishna Belt",
    shortName: "Coastal Krishna",
    badgeColor: "#0ea5e9", // Blue
    itda: ["Non-Scheduled Nomad Cell"],
    focus: "Nomadic Yenadi tribal land rights, housing entitlement, Matsya Mithra Women Fisheries Federation, and coastal mangrove resilience.",
    tribes: ["Yenadi (Nomadic Primitive Tribe)", "Traditional Fishermen Communities"],
    center: [16.15, 81.1],
    zoom: 9.5,
    polygonCoords: [
      [16.48, 81.25],
      [16.45, 81.45],
      [16.15, 81.25],
      [15.88, 80.95],
      [16.05, 80.85],
      [16.35, 81.15]
    ],
    mandals: [
      {
        id: "machilipatnam",
        name: "1. Machilipatnam",
        fullName: "Machilipatnam Mandal",
        itda: "Coastal Cell",
        lat: 16.187,
        lng: 81.138,
        river: "Bay of Bengal Shoreline",
        actionTag: "Community Mobilization",
        activities: "Federation headquarters of 3,500+ Matsya Mithra tribal fisherwomen, revolving micro-capital loans."
      },
      {
        id: "bantumilli",
        name: "2. Bantumilli",
        fullName: "Bantumilli Mandal",
        itda: "Coastal Cell",
        lat: 16.358,
        lng: 81.273,
        river: "Coastal Estuary Belt",
        actionTag: "Community Mobilization",
        activities: "Securing permanent house-site pattas and social identity documentation for nomadic Yenadi hamlets."
      },
      {
        id: "kruthivennu",
        name: "3. Kruthivennu",
        fullName: "Kruthivennu Mandal",
        itda: "Coastal Cell",
        lat: 16.425,
        lng: 81.385,
        river: "Mangrove Tidal Creeks",
        actionTag: "Community Mobilization",
        activities: "Community-led mangrove ecological restoration, cyclone emergency shelter management."
      },
      {
        id: "nagayalanka",
        name: "4. Nagayalanka",
        fullName: "Nagayalanka Mandal",
        itda: "Coastal Cell",
        lat: 15.945,
        lng: 80.916,
        river: "Krishna River Estuary Mouth",
        actionTag: "Community Mobilization",
        activities: "Estuarine artisanal fishing rights protection, child joyful learning centers."
      },
      {
        id: "koduru",
        name: "5. Koduru",
        fullName: "Koduru Mandal",
        itda: "Coastal Cell",
        lat: 15.914,
        lng: 80.898,
        river: "Hamsaladeevi Beach Zone",
        actionTag: "Community Mobilization",
        activities: "Civil rights camps: securing Aadhaar, Voter IDs, and Ration cards for excluded nomadic families."
      },
      {
        id: "mopidevi",
        name: "6. Mopidevi",
        fullName: "Mopidevi Mandal",
        itda: "Coastal Cell",
        lat: 16.082,
        lng: 80.932,
        river: "Krishna River Irrigation Tract",
        actionTag: "Community Mobilization",
        activities: "Safe clean drinking water systems, self-help health collectives, youth literacy support."
      }
    ]
  }
];

export const defaultMapSettings = {
  map_tile_url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  map_center_lat: "17.1",
  map_center_lng: "81.45",
  map_zoom: "8.5"
};
