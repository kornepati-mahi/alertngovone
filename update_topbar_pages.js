const fs = require('fs');

const allPagesPath = './frontend/src/data/all_site_pages.json';
const allPages = JSON.parse(fs.readFileSync(allPagesPath, 'utf8'));

// 1. QUICK LINKS
allPages['quick-links'] = {
  slug: 'quick-links',
  title: 'Quick Links',
  category: 'Legal & Downloads',
  url: 'https://alertngo.in/quick-links/',
  paragraphs: [
    "Official state and central government portals, dashboards, and tribal welfare departmental links associated with the Polavaram Irrigation Project, land records, and forest rights administration.",
    "Direct access to official governmental resources including Giribhumi land records, Polavaram R&R monitoring portal, AP Government Orders, Ministry of Tribal Affairs (MoTA), and Integrated Tribal Development Agency (ITDA) project offices."
  ],
  tables: [
    {
      headers: ["Department / Official Portal", "Government Authority / ITDA", "Direct Access Link"],
      rows: [
        ["Giribhumi Land Records Portal", "Government of Andhra Pradesh", "http://www.giribhumi.ap.gov.in/pages/dashboard.aspx"],
        ["Polavaram R&R Official Portal", "Water Resources Department (WRD)", "https://polavaramrr.ap.gov.in/"],
        ["AP R&R Government Orders (G.Os)", "Government of Andhra Pradesh", "https://aprr.gov.in/aprr/Order.do"],
        ["Ministry of Tribal Affairs (MoTA)", "Government of India", "https://tribal.nic.in/"],
        ["ITDA K.R. Puram Official Portal", "Tribal Welfare Department", "https://itdakrpuram.ap.gov.in/"],
        ["GIRIPRAGATHI Tribal Monitoring", "Government of Andhra Pradesh", "http://giripragati.ap.gov.in/view_itda_image.jsp?itda=Chintur"],
        ["ITDA Rampachodavaram Portal", "Tribal Welfare Department", "http://itdarampachodavaram.ap.gov.in/"],
        ["ITDA Chinturu Official Portal", "Tribal Welfare Department", "https://itdachintur.ap.gov.in/"],
        ["National Forest Rights Portal", "Ministry of Tribal Affairs", "https://forestrights.nic.in/"]
      ]
    }
  ],
  images: [],
  downloads: []
};

// 2. FAQS
allPages['faqs'] = {
  slug: 'faqs',
  title: "FAQ's",
  category: 'Legal & Downloads',
  url: 'https://alertngo.in/faqs/',
  paragraphs: [
    "Frequently Asked Questions (FAQs) and statutory clarification compendiums addressing legal entitlements, Forest Rights (FRA / RoFR), Rehabilitation and Resettlement (R&R), and central welfare schemes.",
    "Download official statutory FAQ booklets and ministry guidelines published by the Ministry of Tribal Affairs (MoTA), Ministry of Rural Development, and ALERT Legal Cell."
  ],
  tables: [
    {
      headers: ["S.No", "Subject / Category", "Enactment / Policy", "View / Download"],
      rows: [
        ["1", "Forest Rights (FRA / RoFR)", "Recognition of Forest Rights Act 2006", "https://drive.google.com/file/d/1InxhtK02BGgwCRyzWbkJ99VmZNR8pa9X/view?usp=sharing"],
        ["2", "Land Acquisition & R&R (LARR)", "Right to Fair Compensation (RFCTLARR 2013)", "/uploads/FAQ-LARR.pdf"],
        ["3", "R&R Grievance Redressal Procedures", "ALERT Grievance Cell Documentation", "/uploads/GREIVANCE-FAQ.pdf"],
        ["4", "PESA Act Provisions & Powers", "Panchayats (Extension to Scheduled Areas)", "https://drive.google.com/file/d/10jwZsNp9IJjYlvHOex6AIrX8Uq46ed6n/view?usp=sharing"],
        ["5", "Ministry of Tribal Affairs (MoTA) Directives", "Tribal Welfare Statutory Notifications", "/uploads/MoTA_FAQ.pdf"],
        ["6", "NREGA Scheme Entitlements", "National Rural Employment Guarantee Act", "/uploads/NREGA_FAQ.pdf"],
        ["7", "MGNREGA Operational Guidelines", "Ministry of Rural Development", "/uploads/MGNREGA_GUIDELINES.pdf"],
        ["8", "PMKSY Irrigation Scheme Guidelines", "Pradhan Mantri Krishi Sinchayee Yojana", "/uploads/PMKSY_FAQ.pdf"],
        ["9", "NGO Compliance & Statutory Governance", "Societies Registration & 80G Compliances", "/uploads/FAQS-ON-NGO.pdf"],
        ["10", "RTI (Right To Information) Procedures", "Right to Information Act 2005", "/uploads/RTI-Online-FAQs.pdf"]
      ]
    }
  ],
  images: [],
  downloads: [
    {
      url: "https://drive.google.com/file/d/1InxhtK02BGgwCRyzWbkJ99VmZNR8pa9X/view?usp=sharing",
      text: "Forest Rights (RoFR) Statutory FAQs",
      filename: "RoFR_FAQ.pdf"
    },
    {
      url: "/uploads/FAQ-LARR.pdf",
      text: "LA & RR Statutory FAQs",
      filename: "FAQ-LARR.pdf"
    },
    {
      url: "/uploads/GREIVANCE-FAQ.pdf",
      text: "R&R Grievance Redressal FAQs",
      filename: "GREIVANCE-FAQ.pdf"
    },
    {
      url: "/uploads/MoTA_FAQ.pdf",
      text: "Ministry of Tribal Affairs FAQs",
      filename: "MoTA_FAQ.pdf"
    },
    {
      url: "/uploads/NREGA_FAQ.pdf",
      text: "NREGA Scheme FAQs",
      filename: "NREGA_FAQ.pdf"
    },
    {
      url: "/uploads/MGNREGA_GUIDELINES.pdf",
      text: "MGNREGA Operational Guidelines",
      filename: "MGNREGA_GUIDELINES.pdf"
    },
    {
      url: "/uploads/PMKSY_FAQ.pdf",
      text: "PMKSY Irrigation Scheme FAQs",
      filename: "PMKSY_FAQ.pdf"
    },
    {
      url: "/uploads/FAQS-ON-NGO.pdf",
      text: "NGO Compliance & Governance FAQs",
      filename: "FAQS-ON-NGO.pdf"
    },
    {
      url: "/uploads/RTI-Online-FAQs.pdf",
      text: "RTI Online Filing FAQs",
      filename: "RTI-Online-FAQs.pdf"
    }
  ]
};

fs.writeFileSync(allPagesPath, JSON.stringify(allPages, null, 2), 'utf8');
console.log('Successfully updated quick-links and faqs in all_site_pages.json!');
