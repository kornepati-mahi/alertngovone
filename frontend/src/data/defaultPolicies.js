export const DEFAULT_COMPLIANCE_PORTAL = {
  portal_badge: "Interactive Compliance Portal",
  portal_cert: "Certified by ALERT Governing Body",
  portal_title: "The 35 Institutional Governance Policies",
  portal_desc: "ALERT operations are strictly governed by 35 formalized statutory charters ensuring democratic transparency, child protection, financial accountability, and indigenous community rights.",
  portal_status_badge: "100% Ratified & Audited",
  portal_status_sub: "Active Statutory Compliance",
  portal_metrics: [
    { label: "Active Policies", val: "35 / 35", color: "#10b981" },
    { label: "POSH Compliant", val: "100%", color: "#D2190C" },
    { label: "Audited Charters", val: "Certified", color: "#8b5cf6" },
    { label: "Regulatory Status", val: "12A • 80G • FCRA", color: "#0ea5e9" }
  ]
};

export const DEFAULT_35_POLICIES = [
  {
    id: 1,
    title: "Common Cost Policy",
    category: "Financial & Operational",
    statutoryBasis: "Societies Registration Act 1860 & Multi-Donor Financial Accounting Standards",
    committee: "Board Finance & Logistical Oversight Committee",
    scope: "Standardized equitable cost-sharing framework for multi-donor logistics, vehicle fleet utilization, and central administrative expenses.",
    desc: "Standardized equitable cost-sharing framework for multi-donor logistics, vehicle fleet utilization, and central administrative expenses.",
    principles: [
      "Activity-based proportional expense allocation across active grants",
      "Quarterly reconciliation with third-party project audits",
      "Strict ban on double-charging administrative overheads"
    ],
    highlights: [
      "Activity-based cost allocation",
      "Quarterly reconciliation",
      "No double-charging overheads"
    ],
    badge: "Statutory",
    icon: "FaBuilding",
    accent: "#0ea5e9"
  },
  {
    id: 2,
    title: "Finance Policy",
    category: "Financial & Operational",
    statutoryBasis: "Foreign Contribution Regulation Act (FCRA 2010) & Indian Income Tax Act Sec 12A/80G",
    committee: "Statutory Financial Audit & Internal Control Cell",
    scope: "Statutory fiscal compliance, double-entry ledger bookkeeping, dual-signatory bank controls, and FCRA expenditure regulations.",
    desc: "Statutory fiscal compliance, double-entry ledger bookkeeping, dual-signatory bank controls, and FCRA expenditure regulations.",
    principles: [
      "Dual signatory authorization for transactions exceeding ₹25,000",
      "Mandatory quarterly internal audit & annual statutory CA audit",
      "100% digital electronic fund transfers (NEFT/RTGS/PFMS)"
    ],
    highlights: [
      "Dual signatory authorization > ₹25,000",
      "Quarterly internal & annual CA audits",
      "100% digital electronic fund transfers"
    ],
    badge: "Statutory",
    icon: "FaLock",
    accent: "#10b981"
  },
  {
    id: 3,
    title: "HIV/AIDS Workplace Policy",
    category: "Protection & Rights",
    scope: "Strict non-discrimination charter, medical confidentiality, health insurance access, and grassroots sensitization across tribal hamlets.",
    desc: "Strict non-discrimination charter, medical confidentiality, health insurance access, and grassroots sensitization across tribal hamlets.",
    statutoryBasis: "Human Immunodeficiency Virus and Acquired Immune Deficiency Syndrome (Prevention and Control) Act 2017",
    committee: "Employee Health & Community Well-being Cell",
    principles: [
      "Zero tolerance for workplace discrimination or dismissal based on health status",
      "Confidential medical counseling and anti-retroviral treatment assistance",
      "Regular health & hygiene camps across remote Adivasi habitations"
    ],
    highlights: [
      "Zero health discrimination",
      "Confidential medical counseling",
      "Regular health & hygiene camps"
    ],
    badge: "Human Rights",
    icon: "FaHandHoldingHeart",
    accent: "#ef4444"
  },
  {
    id: 4,
    title: "Human Resource Policy",
    category: "Governance & Ethics",
    scope: "Merit-based recruitment, tribal youth employment affirmative action, transparent salary grids, and employee grievance pathways.",
    desc: "Merit-based recruitment, tribal youth employment affirmative action, transparent salary grids, and employee grievance pathways.",
    statutoryBasis: "Employees' Provident Funds & Miscellaneous Provisions Act 1952 & State Labor Codes",
    committee: "Institutional Human Resources & Grievance Council",
    principles: [
      "Affirmative recruitment quota prioritizing local indigenous tribal youth",
      "Transparent annual performance evaluations and skill-upgrade sabbaticals",
      "Equitable health, maternity, and emergency compassionate leave entitlements"
    ],
    highlights: [
      "Affirmative tribal youth quota",
      "Transparent salary grids",
      "Equitable leave entitlements"
    ],
    badge: "Institutional",
    icon: "FaShieldAlt",
    accent: "#6366f1"
  },
  {
    id: 5,
    title: "Procurement Policy",
    category: "Financial & Operational",
    scope: "Three-quotation competitive tender threshold, vendor vetting, anti-collusion bidding protocols, and physical asset tagging.",
    desc: "Three-quotation competitive tender threshold, vendor vetting, anti-collusion bidding protocols, and physical asset tagging.",
    statutoryBasis: "General Financial Rules (GFR) & Donor Compliance Guidelines",
    committee: "Central Procurement & Purchase Committee",
    principles: [
      "Minimum 3 sealed competitive quotations for all asset purchases > ₹10,000",
      "Mandatory non-relationship affidavit from prospective vendors",
      "Annual physical inventory verification and asset barcode tagging"
    ],
    highlights: [
      "3 competitive sealed quotations",
      "Vendor anti-collusion vetting",
      "Annual inventory barcode tagging"
    ],
    badge: "Statutory",
    icon: "FaBuilding",
    accent: "#f59e0b"
  },
  {
    id: 6,
    title: "ALERT Gender Policy",
    category: "Protection & Rights",
    scope: "50% representation of women in grassroots decision-making, equal remuneration for equal work, and zero toleration of gender disparity.",
    desc: "50% representation of women in grassroots decision-making, equal remuneration for equal work, and zero toleration of gender disparity.",
    statutoryBasis: "Equal Remuneration Act 1976 & CEDAW International Protocols",
    committee: "Gender Equality & Women Empowerment Council",
    principles: [
      "Minimum 50% women representation across all Gram Sabha executive committees",
      "Zero gender wage gap across field coordinators and administrative staff",
      "Priority leadership grooming for Yenadi & Koya indigenous women"
    ],
    highlights: [
      "50% women in Gram Sabhas",
      "Zero gender wage disparity",
      "Indigenous women leadership grooming"
    ],
    badge: "Human Rights",
    icon: "FaHandHoldingHeart",
    accent: "#ec4899"
  },
  {
    id: 7,
    title: "ALERT Conflict of Interest Policy",
    category: "Governance & Ethics",
    scope: "Mandatory annual disclosures of personal, commercial, or family ties for Governing Body members and senior programmatic staff.",
    desc: "Mandatory annual disclosures of personal, commercial, or family ties for Governing Body members and senior programmatic staff.",
    statutoryBasis: "Societies Registration Act 1860 & Institutional Ethics Standards",
    committee: "Independent Ethics & Disclosures Tribunal",
    principles: [
      "Annual written declaration of financial or familial interests",
      "Automatic recusal from voting on contracts involving affiliated entities",
      "Immediate disciplinary dismissal for undisclosed pecuniary gains"
    ],
    highlights: [
      "Mandatory annual written disclosure",
      "Automatic contract voting recusal",
      "Zero tolerance for undisclosed gain"
    ],
    badge: "Integrity",
    icon: "FaBalanceScale",
    accent: "#8b5cf6"
  },
  {
    id: 8,
    title: "Children Joyful Learning Policy",
    category: "Protection & Rights",
    scope: "Mother-tongue pedagogy (Koya/Telugu), cultural tribal folk curricula, zero corporal punishment, and inclusive village learning centers.",
    desc: "Mother-tongue pedagogy (Koya/Telugu), cultural tribal folk curricula, zero corporal punishment, and inclusive village learning centers.",
    statutoryBasis: "Right to Education Act (RTE 2009) & National Early Childhood Care Framework",
    committee: "Tribal Education & Child Development Directorate",
    principles: [
      "Mother-tongue primary instruction in Koya and local tribal dialects",
      "Strict ban on psychological pressure, humiliation, or physical corporal punishment",
      "Community Gram Sabha oversight of village joyful learning centers"
    ],
    highlights: [
      "Koya & Telugu mother-tongue pedagogy",
      "Zero corporal punishment",
      "Gram Sabha education oversight"
    ],
    badge: "Child Rights",
    icon: "FaHandHoldingHeart",
    accent: "#10b981"
  },
  {
    id: 9,
    title: "Sexual Harassment Policy (POSH)",
    category: "Protection & Rights",
    scope: "Full statutory compliance under the POSH Act 2013 with an active, autonomous Internal Complaints Committee (ICC) chaired by senior women leaders.",
    desc: "Full statutory compliance under the POSH Act 2013 with an active, autonomous Internal Complaints Committee (ICC) chaired by senior women leaders.",
    statutoryBasis: "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act 2013",
    committee: "Autonomous Internal Complaints Committee (ICC)",
    principles: [
      "Independent ICC chaired by senior external woman jurist / social activist",
      "Confidential 90-day time-bound formal inquiry and protection from retaliation",
      "Mandatory annual POSH sensitization workshops for all field staff"
    ],
    highlights: [
      "Autonomous ICC chaired by woman jurist",
      "Strict 90-day time-bound inquiry",
      "Mandatory annual POSH workshops"
    ],
    badge: "Mandatory",
    icon: "FaShieldAlt",
    accent: "#D2190C"
  },
  {
    id: 10,
    title: "Environmental Policy",
    category: "Community & Field",
    scope: "Zero ecological footprint in forest sanctuaries, protection of sacred tribal groves (Punya Vanalu), and coastal mangrove regeneration.",
    desc: "Zero ecological footprint in forest sanctuaries, protection of sacred tribal groves (Punya Vanalu), and coastal mangrove regeneration.",
    statutoryBasis: "Biological Diversity Act 2002 & Forest Conservation Rules",
    committee: "Ecological Conservation & Biodiversity Unit",
    principles: [
      "Zero plastic tolerance in all ALERT agency field offices and tribal events",
      "Strict preservation of indigenous sacred groves and rare medicinal herbs",
      "Community-led mangrove regeneration along the Krishna estuary"
    ],
    highlights: [
      "Zero plastic in forest hamlets",
      "Sacred groves preservation",
      "Mangrove estuarine restoration"
    ],
    badge: "Ecological",
    icon: "FaFolderOpen",
    accent: "#15803d"
  },
  {
    id: 11,
    title: "Health and Safety Policy",
    category: "Community & Field",
    scope: "Mandatory life jackets during Godavari river flood rescue, emergency medical supplies, and anti-venom protocols for agency fieldworkers.",
    desc: "Mandatory life jackets during Godavari river flood rescue, emergency medical supplies, and anti-venom protocols for agency fieldworkers.",
    statutoryBasis: "Disaster Management Act 2005 & Occupational Safety Norms",
    committee: "Disaster Response & Safety Taskforce",
    principles: [
      "Certified life jackets and GPS satellite beacons for monsoon river travel",
      "Stocked first-aid kits and anti-snake venom vials at all agency field camps",
      "Comprehensive accidental health insurance for all frontline mobilizers"
    ],
    highlights: [
      "Certified life jackets & GPS beacons",
      "Anti-venom stocked in agency camps",
      "Field staff accident insurance"
    ],
    badge: "Field Safety",
    icon: "FaShieldAlt",
    accent: "#0284c7"
  },
  {
    id: 12,
    title: "Code of Ethics and Conduct Policy",
    category: "Governance & Ethics",
    scope: "Highest standards of personal integrity, honesty, respect for indigenous tribal elders, and dedication to grassroots social justice.",
    desc: "Highest standards of personal integrity, honesty, respect for indigenous tribal elders, and dedication to grassroots social justice.",
    statutoryBasis: "ALERT Constitutional Bylaws & NGO Code of Public Ethics",
    committee: "Board Ethics & Governance Bench",
    principles: [
      "Unwavering reverence for Adivasi customs, democratic Gram Sabhas, and tribal lore",
      "Zero tolerance for harassment, discrimination, intoxication, or malfeasance",
      "Full transparency in handling community grievances and public petitions"
    ],
    highlights: [
      "Reverence for Adivasi customs",
      "Zero harassment tolerance",
      "Transparent grievance redressal"
    ],
    badge: "Integrity",
    icon: "FaBalanceScale",
    accent: "#4f46e5"
  },
  {
    id: 13,
    title: "Data Protection and Privacy Policy",
    category: "Governance & Ethics",
    scope: "Secure encryption and anonymization of indigenous household land records, biometric voter surveys, and legal claimant case notes.",
    desc: "Secure encryption and anonymization of indigenous household land records, biometric voter surveys, and legal claimant case notes.",
    statutoryBasis: "Digital Personal Data Protection Act 2023 & Indian IT Act 2000",
    committee: "Informatics & Data Governance Cell",
    principles: [
      "End-to-end encrypted storage of land claim genealogies and GPS boundary points",
      "Informed community consent prior to recording any household demographic data",
      "Strict prohibition on selling or sharing beneficiary databases with commercial entities"
    ],
    highlights: [
      "Encrypted land claim coordinates",
      "Informed prior household consent",
      "Ban on commercial data sharing"
    ],
    badge: "Security",
    icon: "FaLock",
    accent: "#334155"
  },
  {
    id: 14,
    title: "Social Inclusion Policy",
    category: "Protection & Rights",
    scope: "Special programmatic priority for Particularly Vulnerable Tribal Groups (PVTGs), nomadic Yenadi families, and disabled rural citizens.",
    desc: "Special programmatic priority for Particularly Vulnerable Tribal Groups (PVTGs), nomadic Yenadi families, and disabled rural citizens.",
    statutoryBasis: "Article 46 & Fifth Schedule of the Constitution of India",
    committee: "Affirmative Action & Social Inclusion Council",
    principles: [
      "Direct prioritization of Konda Reddi PVTGs and nomadic Yenadi forest dwellers",
      "100% saturation of social security pensions and ration cards for marginalized elders",
      "Democratic inclusion of nomadic women in coastal fisheries federations"
    ],
    highlights: [
      "Konda Reddi PVTG prioritization",
      "100% pension & ration card saturation",
      "Nomadic women inclusion"
    ],
    badge: "Inclusion",
    icon: "FaHandHoldingHeart",
    accent: "#d97706"
  },
  {
    id: 15,
    title: "Do No Harm Policy",
    category: "Governance & Ethics",
    scope: "Conflict-sensitive community interaction avoiding local political polarization, cultural disruption, or long-term institutional dependency.",
    desc: "Conflict-sensitive community interaction avoiding local political polarization, cultural disruption, or long-term institutional dependency.",
    statutoryBasis: "International Humanitarian Standards & Core Humanitarian Standard (CHS)",
    committee: "Community Safeguards & Conflict Assessment Unit",
    principles: [
      "Comprehensive socio-cultural risk assessment prior to launching any field project",
      "Non-partisan engagement with local political factions and panchayat bodies",
      "Sustainable capacity transfer ensuring Gram Sabhas become fully self-reliant"
    ],
    highlights: [
      "Socio-cultural risk assessments",
      "Strict political non-partisanship",
      "Long-term Gram Sabha self-reliance"
    ],
    badge: "Principle",
    icon: "FaShieldAlt",
    accent: "#64748b"
  },
  {
    id: 16,
    title: "Anti-Corruption & Anti-Bribery Policy",
    category: "Governance & Ethics",
    scope: "Absolute prohibition on bribes, kickbacks, or gifts to public authorities during land patta processing, RTI follow-ups, or legal representation.",
    desc: "Absolute prohibition on bribes, kickbacks, or gifts to public authorities during land patta processing, RTI follow-ups, or legal representation.",
    statutoryBasis: "Prevention of Corruption Act 1988 & UN Convention against Corruption",
    committee: "Vigilance & Anti-Corruption Bureau",
    principles: [
      "Zero tolerance for facilitating payments, kickbacks, or bureaucratic bribes",
      "Immediate reporting of public extortion attempts to State Vigilance Commission",
      "Strict gift policy: Staff prohibited from accepting personal commercial gifts"
    ],
    highlights: [
      "Zero tolerance for bribe facilitation",
      "Vigilance Commission reporting",
      "Strict commercial gift ban"
    ],
    badge: "Zero Tolerance",
    icon: "FaBalanceScale",
    accent: "#b91c1c"
  },
  {
    id: 17,
    title: "Child Protection & Safeguarding Policy",
    category: "Protection & Rights",
    scope: "Rigorous background checks for staff, strict ban on child labor, abuse reporting hotline, and informed parental consent for media/photos.",
    desc: "Rigorous background checks for staff, strict ban on child labor, abuse reporting hotline, and informed parental consent for media/photos.",
    statutoryBasis: "Protection of Children from Sexual Offences (POCSO Act 2012) & JJ Act",
    committee: "Autonomous Child Protection Cell",
    principles: [
      "Mandatory police verification and child protection signing for all staff/volunteers",
      "Strict ban on individual unmonitored visits with children in remote hamlets",
      "Explicit parental written consent required before capturing photographs or media"
    ],
    highlights: [
      "Mandatory police background checks",
      "Zero unmonitored visits with minors",
      "Parental media photo consent"
    ],
    badge: "Child Rights",
    icon: "FaHandHoldingHeart",
    accent: "#e11d48"
  },
  {
    id: 18,
    title: "Whistleblower Protection Policy",
    category: "Governance & Ethics",
    scope: "Direct, confidential escalation channel to the Board President with complete statutory protection from retaliation or termination.",
    desc: "Direct, confidential escalation channel to the Board President with complete statutory protection from retaliation or termination.",
    statutoryBasis: "Whistle Blowers Protection Act 2014 & Corporate Governance Norms",
    committee: "Independent Whistleblower Review Board",
    principles: [
      "Encrypted anonymous email & postal reporting box directly to the President",
      "Guaranteed protection from retaliatory transfers, harassment, or dismissal",
      "Mandatory investigation completed within 30 days of formal report"
    ],
    highlights: [
      "Direct encrypted President channel",
      "Total protection from retaliation",
      "30-day investigation completion"
    ],
    badge: "Whistleblower",
    icon: "FaShieldAlt",
    accent: "#7c3aed"
  },
  {
    id: 19,
    title: "Risk Management Framework",
    category: "Financial & Operational",
    scope: "Comprehensive risk registers evaluating legal challenges, monsoon river flooding contingencies, and regulatory compliance changes.",
    desc: "Comprehensive risk registers evaluating legal challenges, monsoon river flooding contingencies, and regulatory compliance changes.",
    statutoryBasis: "Enterprise Risk Management (ERM) Framework & Disaster Guidelines",
    committee: "Risk Assessment & Audit Steering Group",
    principles: [
      "Biannual review of the Institutional Risk Matrix by the Governing Body",
      "Contingency reserves for sudden natural flood emergencies in Godavari basin",
      "Immediate legal response protocol for unlawful arrests or FIRs against community leaders"
    ],
    highlights: [
      "Biannual institutional risk review",
      "Basin flood contingency reserves",
      "Community legal defense protocol"
    ],
    badge: "Operational",
    icon: "FaLock",
    accent: "#d97706"
  },
  {
    id: 20,
    title: "Livelihood Cooperative Governance Policy",
    category: "Community & Field",
    scope: "Democratic rules for Matsya Mithra Women Fisheries collectives and NTFP cooperative societies ensuring 100% member dividend return.",
    desc: "Democratic rules for Matsya Mithra Women Fisheries collectives and NTFP cooperative societies ensuring 100% member dividend return.",
    statutoryBasis: "Andhra Pradesh Mutually Aided Cooperative Societies (MACS) Act 1995",
    committee: "Cooperative Enterprise Development Directorate",
    principles: [
      "100% member ownership with one-member-one-vote cooperative democracy",
      "Transparent annual dividend distribution directly into tribal women's bank accounts",
      "Revolving micro-credit fund capped at statutory non-usurious interest rates"
    ],
    highlights: [
      "100% tribal member ownership",
      "Direct bank dividend distribution",
      "Non-usurious micro-credit cap"
    ],
    badge: "Cooperative",
    icon: "FaBuilding",
    accent: "#059669"
  },
  {
    id: 21,
    title: "Disability Rights & Universal Accessibility",
    category: "Protection & Rights",
    scope: "Physical ramp accessibility, assistive hearing/mobility aid distribution, and affirmative employment quotas for persons with disabilities.",
    desc: "Physical ramp accessibility, assistive hearing/mobility aid distribution, and affirmative employment quotas for persons with disabilities.",
    statutoryBasis: "Rights of Persons with Disabilities (RPwD) Act 2016",
    committee: "Disability Inclusion & Equal Opportunities Wing",
    principles: [
      "Universal design ramps and accessible facilities across all ALERT centers",
      "Active identification and pension saturation for disabled indigenous citizens",
      "Specialized legal counseling for land entitlement protection of disabled persons"
    ],
    highlights: [
      "Universal barrier-free ramps",
      "Assistive device distribution",
      "Disability land rights defense"
    ],
    badge: "Inclusion",
    icon: "FaHandHoldingHeart",
    accent: "#0284c7"
  },
  {
    id: 22,
    title: "Forest Rights Advocacy Ethics Policy",
    category: "Community & Field",
    scope: "Uncompromising loyalty to Gram Sabha decisions under RoFR 2006, free legal counseling, and refusal of commercial compensation cuts.",
    desc: "Uncompromising loyalty to Gram Sabha decisions under RoFR 2006, free legal counseling, and refusal of commercial compensation cuts.",
    statutoryBasis: "Scheduled Tribes and Other Traditional Forest Dwellers (FRA 2006)",
    committee: "Forest Rights Legal Cell & Paralegal Directorate",
    principles: [
      "Complete refusal of any contingency fee or cut from land compensation awards",
      "Exclusively pro-bono paralegal and high court legal representation for Gram Sabhas",
      "Respect for traditional village boundary demarcation using participatory GPS mapping"
    ],
    highlights: [
      "Zero compensation contingency cuts",
      "100% pro-bono litigation",
      "Participatory GPS village mapping"
    ],
    badge: "Legal Aid",
    icon: "FaBalanceScale",
    accent: "#16a34a"
  },
  {
    id: 23,
    title: "Polavaram Displacement Assistance Protocol",
    category: "Community & Field",
    scope: "Statutory monitoring of RFCTLARR Act 2013 entitlements: house-for-house, land-for-land, and one-time rehabilitation grant compliance.",
    desc: "Statutory monitoring of RFCTLARR Act 2013 entitlements: house-for-house, land-for-land, and one-time rehabilitation grant compliance.",
    statutoryBasis: "Right to Fair Compensation and Transparency in Land Acquisition (RFCTLARR 2013)",
    committee: "Polavaram Rehabilitation Monitoring Council",
    principles: [
      "Independent social audit of 371 submerged villages against official R&R packages",
      "Enforcing the mandatory land-for-land compensation clause for displaced tribals",
      "Monitoring construction quality and civil amenities at resettlement colonies"
    ],
    highlights: [
      "Independent 371 villages audit",
      "Land-for-land statutory clause",
      "Resettlement colony quality checks"
    ],
    badge: "Statutory",
    icon: "FaShieldAlt",
    accent: "#ea580c"
  },
  {
    id: 24,
    title: "Field Disaster Response Protocol",
    category: "Community & Field",
    scope: "Standard Operating Procedures for annual Godavari flood rescue, supply drops, boat logistics, and rapid health emergency response.",
    desc: "Standard Operating Procedures for annual Godavari flood rescue, supply drops, boat logistics, and rapid health emergency response.",
    statutoryBasis: "National Disaster Management Authority (NDMA) Guidelines",
    committee: "Emergency Flood Relief Operational Cell",
    principles: [
      "Rapid deployment within 6 hours of flood warning across Godavari Agency tracts",
      "Pre-positioned motorboats and dry food rations in flood-prone cut-off hamlets",
      "Transparent beneficiary manifests verified and signed by local Gram Sabhas"
    ],
    highlights: [
      "6-hour rapid response protocol",
      "Pre-positioned boat logistics",
      "Gram Sabha verified manifests"
    ],
    badge: "Emergency",
    icon: "FaFolderOpen",
    accent: "#dc2626"
  },
  {
    id: 25,
    title: "Legal Aid & RTI Proactive Disclosure",
    category: "Community & Field",
    scope: "Drafting pro-bono High Court and Supreme Court writ petitions, public information requests under RTI Act 2005, and legal literacy camps.",
    desc: "Drafting pro-bono High Court and Supreme Court writ petitions, public information requests under RTI Act 2005, and legal literacy camps.",
    statutoryBasis: "Right to Information Act 2005 & Legal Services Authorities Act 1987",
    committee: "Public Interest Litigation & RTI Cell",
    principles: [
      "Free drafting of RTI applications and first/second appeals for illiterate tribals",
      "Proactive public dissemination of government circulars on tribal entitlements",
      "Paralegal training for tribal youth to independently file village claims"
    ],
    highlights: [
      "Pro-bono High Court PILs",
      "Free RTI drafting & appeals",
      "Youth paralegal literacy camps"
    ],
    badge: "Justice",
    icon: "FaBalanceScale",
    accent: "#2563eb"
  },
  {
    id: 26,
    title: "Board & Executive Succession Policy",
    category: "Governance & Ethics",
    scope: "Democratic 3-year board election cycles, term limits, leadership grooming pipeline, and grass-roots tribal leader induction.",
    desc: "Democratic 3-year board election cycles, term limits, leadership grooming pipeline, and grass-roots tribal leader induction.",
    statutoryBasis: "ALERT Registered Constitution & Society Rules",
    committee: "Nomination & Board Governance Council",
    principles: [
      "Democratic 3-year election cycles with secret ballot if contested",
      "Mandatory representation of indigenous women on the Governing Body",
      "Continuous youth leadership mentorship to ensure generational continuity"
    ],
    highlights: [
      "3-year democratic elections",
      "Mandatory women board members",
      "Grassroots youth succession pipeline"
    ],
    badge: "Democracy",
    icon: "FaBuilding",
    accent: "#475569"
  },
  {
    id: 27,
    title: "Donor Accountability & Transparency Charter",
    category: "Financial & Operational",
    scope: "Unrestricted access to project accounts, milestone audits by independent chartered accountants, and public annual expenditure disclosures.",
    desc: "Unrestricted access to project accounts, milestone audits by independent chartered accountants, and public annual expenditure disclosures.",
    statutoryBasis: "Credibility Alliance Minimum Norms & FCRA Statutory Standards",
    committee: "Audit & Donor Accountability Bench",
    principles: [
      "Public publishing of audited balance sheets, utilization certificates, and FCRA filings",
      "Open-door policy for institutional donors conducting field verification visits",
      "Zero diversion of dedicated project funds to unauthorized overheads"
    ],
    highlights: [
      "Public annual balance sheets",
      "Zero project fund diversion",
      "Open-door field audit policy"
    ],
    badge: "Transparency",
    icon: "FaLock",
    accent: "#0891b2"
  },
  {
    id: 28,
    title: "Volunteer & Intern Professional Code",
    category: "Governance & Ethics",
    scope: "Cultural sensitivity guidelines for university researchers and volunteers working inside Fifth Scheduled Adivasi habitations.",
    desc: "Cultural sensitivity guidelines for university researchers and volunteers working inside Fifth Scheduled Adivasi habitations.",
    statutoryBasis: "ALERT Field Research Ethics Guidelines",
    committee: "Volunteer Coordination & Cultural Ethics Unit",
    principles: [
      "Mandatory cultural orientation before entering sensitive tribal agency areas",
      "Strict ban on commercializing indigenous photographs or traditional knowledge",
      "Mandatory debriefing and sharing of research findings with the community Gram Sabha"
    ],
    highlights: [
      "Mandatory cultural orientation",
      "Ban on commercial photo exploitation",
      "Research sharing with Gram Sabha"
    ],
    badge: "Field Conduct",
    icon: "FaShieldAlt",
    accent: "#6b7280"
  },
  {
    id: 29,
    title: "Coastal Marine & Mangrove Stewardship",
    category: "Community & Field",
    scope: "Banning destructive fine-mesh estuarine trawling, safeguarding fish breeding zones, and planting mangrove tidal barriers.",
    desc: "Banning destructive fine-mesh estuarine trawling, safeguarding fish breeding zones, and planting mangrove tidal barriers.",
    statutoryBasis: "Coastal Regulation Zone (CRZ) Notification & Wildlife Protection Act",
    committee: "Marine Ecosystem & Coastal Livelihoods Wing",
    principles: [
      "Community ban on juvenile crab and shrimp seed poaching in mangrove roots",
      "Planting 50,000+ Rhizophora mangrove seedlings along tidal estuaries annually",
      "Artisanal fisherwomen empowerment through non-destructive sustainable gear"
    ],
    highlights: [
      "Estuarine fish breeding protection",
      "50,000 mangrove seedlings/year",
      "Sustainable artisanal gear"
    ],
    badge: "Ecology",
    icon: "FaFolderOpen",
    accent: "#0d9488"
  },
  {
    id: 30,
    title: "Indigenous Knowledge & Heritage Protocol",
    category: "Community & Field",
    scope: "Protecting tribal traditional medicinal herb knowledge and oral folklore against unauthorized commercial biopiracy.",
    desc: "Protecting tribal traditional medicinal herb knowledge and oral folklore against unauthorized commercial biopiracy.",
    statutoryBasis: "Biological Diversity Act 2002 & Traditional Knowledge Digital Library (TKDL)",
    committee: "Indigenous Heritage & Ethnobotany Cell",
    principles: [
      "Documentation of herbal medicine exclusively with prior informed Gram Sabha consent",
      "Zero transfer of indigenous botanical recipes to commercial pharmaceutical firms",
      "Community ownership of traditional folklore, songs, and cultural biodiversity"
    ],
    highlights: [
      "Prior informed Gram Sabha consent",
      "Strict ban on commercial biopiracy",
      "Community folklore ownership"
    ],
    badge: "Heritage",
    icon: "FaHandHoldingHeart",
    accent: "#ca8a04"
  },
  {
    id: 31,
    title: "Information Disclosure Charter",
    category: "Financial & Operational",
    scope: "Mandatory public hosting of ALERT Society Registration, 12A, 80G, FCRA certificates, and annual audited balances on the web portal.",
    desc: "Mandatory public hosting of ALERT Society Registration, 12A, 80G, FCRA certificates, and annual audited balances on the web portal.",
    statutoryBasis: "Voluntary Guidelines on Transparency & Public Record Act",
    committee: "Public Information Disclosure Desk",
    principles: [
      "All statutory registration certificates freely downloadable by the general public",
      "Annual audited reports archived and publicly accessible for 20 continuous years",
      "Transparent disclosure of board member identities, tenures, and affiliations"
    ],
    highlights: [
      "12A, 80G & FCRA public certificates",
      "20-year audited report archive",
      "Transparent board disclosure"
    ],
    badge: "Public Record",
    icon: "FaLock",
    accent: "#0284c7"
  },
  {
    id: 32,
    title: "Grievance Redressal Mechanism Policy",
    category: "Governance & Ethics",
    scope: "Guaranteed 15-day resolution pathway for community complaints, village petitions, worker grievances, and institutional feedback.",
    desc: "Guaranteed 15-day resolution pathway for community complaints, village petitions, worker grievances, and institutional feedback.",
    statutoryBasis: "Public Grievance Redressal Standards & CHS Alliance Norms",
    committee: "Ombudsperson & Grievance Redressal Committee",
    principles: [
      "Time-bound 15-day mandatory written resolution for all lodged grievances",
      "Confidential toll-free helpline and physical drop-boxes at agency field camps",
      "Right of direct appeal to the Board President if resolution is unsatisfactory"
    ],
    highlights: [
      "15-day guaranteed written resolution",
      "Toll-free hotline & agency dropboxes",
      "Direct Board President appeal"
    ],
    badge: "Accountability",
    icon: "FaBalanceScale",
    accent: "#4338ca"
  },
  {
    id: 33,
    title: "Travel, Logistics & Field Per Diem Policy",
    category: "Financial & Operational",
    scope: "Standardized rural travel mileage reimbursements, hazardous country-boat crossing allowances, and transparent receipt settlement.",
    desc: "Standardized rural travel mileage reimbursements, hazardous country-boat crossing allowances, and transparent receipt settlement.",
    statutoryBasis: "ALERT Operational Financial Manual",
    committee: "Administrative & Field Logistics Desk",
    principles: [
      "Standard mileage per diem based on prevailing state transport rates",
      "Special hazard allowance for difficult monsoon boat journeys across flooded rivers",
      "Zero cash disbursements without digital or physical verified vouchers"
    ],
    highlights: [
      "Standard state mileage rates",
      "Monsoon boat hazard allowance",
      "Verified voucher settlement"
    ],
    badge: "Operational",
    icon: "FaBuilding",
    accent: "#0369a1"
  },
  {
    id: 34,
    title: "Asset & Depreciation Control Policy",
    category: "Financial & Operational",
    scope: "Physical inventory barcode verification, annual depreciation calculations, and environmentally safe e-waste disposal protocols.",
    desc: "Physical inventory barcode verification, annual depreciation calculations, and environmentally safe e-waste disposal protocols.",
    statutoryBasis: "Accounting Standard (AS) 10 on Property, Plant and Equipment",
    committee: "Asset Management & Verification Board",
    principles: [
      "Unique identification barcode on all computers, vehicles, and office assets",
      "Standard straight-line depreciation calculated annually by statutory auditors",
      "Safe, environmentally certified e-waste recycling of obsolete hardware"
    ],
    highlights: [
      "Barcode tagging on all fixed assets",
      "Statutory annual depreciation",
      "Certified eco-friendly e-waste disposal"
    ],
    badge: "Asset Control",
    icon: "FaBuilding",
    accent: "#374151"
  },
  {
    id: 35,
    title: "Monitoring, Evaluation & Learning (MEL)",
    category: "Financial & Operational",
    scope: "Quantitative and qualitative outcome harvesting, longitudinal beneficiary surveys, and peer-reviewed programmatic impact assessments.",
    desc: "Quantitative and qualitative outcome harvesting, longitudinal beneficiary surveys, and peer-reviewed programmatic impact assessments.",
    statutoryBasis: "Results-Based Management (RBM) & Logical Framework Analysis (LFA)",
    committee: "Monitoring, Evaluation & Impact Research Cell",
    principles: [
      "Longitudinal impact surveys measuring tribal household income and land security",
      "Quarterly milestone tracking against board-approved multi-year strategic plans",
      "Participatory rural appraisal (PRA) with Gram Sabhas to validate project outcomes"
    ],
    highlights: [
      "Longitudinal income & land surveys",
      "Quarterly board milestone reviews",
      "Participatory Gram Sabha appraisal"
    ],
    badge: "MEL Framework",
    icon: "FaLock",
    accent: "#047857"
  }
];

