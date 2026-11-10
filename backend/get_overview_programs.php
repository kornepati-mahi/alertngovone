<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultCategories = [
    [
        "category_name" => "Forest Rights",
        "display_name" => "Forest Rights (RoFR & LTR)",
        "subtitle" => "Securing individual and community forest rights (RoFR 2006) for Adivasi families across the agency tracts.",
        "sort_order" => 1
    ],
    [
        "category_name" => "Governance",
        "display_name" => "PESA & Self-Governance",
        "subtitle" => "Empowering Gram Sabhas with sovereign self-governance powers under PESA Act 1996.",
        "sort_order" => 2
    ],
    [
        "category_name" => "Polavaram PIP",
        "display_name" => "Polavaram LA & R&R",
        "subtitle" => "Defending the statutory rights of 1,05,000+ Project Displaced Families under the RFCTLARR Act 2013.",
        "sort_order" => 3
    ],
    [
        "category_name" => "Women Cooperatives",
        "display_name" => "Antyodaya Women Cooperatives",
        "subtitle" => "3,500+ Yenadi fisherwomen organized into the Matsya Mithra cooperative federation.",
        "sort_order" => 4
    ],
    [
        "category_name" => "Child Rights",
        "display_name" => "Child Interventions & Bare Acts",
        "subtitle" => "Statutory protection, bilingual education, and nutrition for every Adivasi child.",
        "sort_order" => 5
    ],
    [
        "category_name" => "Disaster Relief",
        "display_name" => "Flood Relief Operations",
        "subtitle" => "Emergency rescue, relief, and rehabilitation for Godavari and Krishna flood-affected communities.",
        "sort_order" => 6
    ],
    [
        "category_name" => "Clean Energy",
        "display_name" => "Solar & Clean Energy",
        "subtitle" => "Decentralized solar lighting for remote, un-electrified tribal habitations.",
        "sort_order" => 7
    ],
    [
        "category_name" => "Agriculture",
        "display_name" => "Indigenous Millets & Seed Banks",
        "subtitle" => "Heritage millet cultivation, indigenous seed banks, and food sovereignty for Adivasi farmers.",
        "sort_order" => 8
    ]
];

$defaultSettings = [
    "page_badge" => "Our Work",
    "page_title" => "Key Programs Overview",
    "page_subtitle" => "Eight thematic intervention pillars defending Adivasi dignity, constitutional land rights, and self-governance since 2004.",
    "antyodaya_eyebrow" => "Flagship Initiative",
    "antyodaya_title" => "Antyodaya Project",
    "antyodaya_subtitle" => "Supported by Brot für die Welt (BftW), Germany",
    "antyodaya_chips" => json_encode(["Since January 2016", "Six coastal mandals, Krishna District", "Yenadi tribal community"]),
    "antyodaya_p1" => "In partnership with Brot für die Welt (BftW), Germany, ALERT has executed the Antyodaya Project across six coastal mandals of Krishna District, directly uplifting the highly marginalized Yenadi tribal community.",
    "antyodaya_p2" => "The Yenadi women have organized into vibrant Matsya Mithra Groups and coastal cooperatives, establishing sustainable fisheries management, obtaining government identity documentation, and achieving true financial independence.",
    "antyodaya_stats" => json_encode([
        ["n" => "6", "l" => "Coastal Mandals"],
        ["n" => "3,500+", "l" => "Women Enrolled"],
        ["n" => "50+", "l" => "Cooperatives"]
    ]),
    "antyodaya_img" => "/uploads/programs/WhatsApp-Image-2021-07-24-at-8.04.03-PM-1-768x1024.jpeg",
    "antyodaya_caption" => "Antyodaya Project — coastal Krishna District",
    "cta_badge" => "Support Our Work",
    "cta_title" => "Fuel the Eight Pillars of Change",
    "cta_subtitle" => "Every contribution funds legal aid for forest-rights claims, solar electrification of off-grid hamlets, and the women-led cooperatives that keep Adivasi livelihoods resilient."
];

$defaultPrograms = [
    // Forest Rights
    [
        "category" => "Forest Rights",
        "title" => "RoFR & Tribal Land Advocacy",
        "description" => "Securing individual (IFR) and community forest rights (CFR) for Adivasi families under the Forest Rights Act 2006, protecting over 15,000+ acres of ancestral forests.",
        "img" => "/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg",
        "details" => json_encode(["IFR & CFR Claims Documentation", "Gram Sabha Resolution Filing", "GPS Boundary Demarcation", "Title Deed (Patta) Distribution Support"]),
        "link_url" => "/la-rr",
        "sort_order" => 1
    ],
    [
        "category" => "Forest Rights",
        "title" => "Community Forest Resource (CFR) Mapping",
        "description" => "Gram Sabha resource committees in the Rampachodavaram and Chinturu ITDA tracts map and document community forest use, from shifting cultivation plots to bamboo and minor forest produce collection grounds.",
        "img" => "/uploads/programs/Kotarugommu-18-9-21-1-rotated-1-1024x461-640x480.jpeg",
        "details" => json_encode(["Village Resource Mapping", "NTFP & Bamboo Harvest Records", "Sacred Grove (Punya Vanalu) Protection", "CFR Claim Drafting Support"]),
        "link_url" => "/la-rr",
        "sort_order" => 2
    ],
    [
        "category" => "Forest Rights",
        "title" => "Land Transfer Regulation 1 of 1970 Restitution",
        "description" => "Recovery of tribal land illegally alienated to non-tribals in the K.R. Puram ITDA belt, through revenue petitions, mutation follow-up and litigation support for dispossessed families.",
        "img" => "/uploads/programs/tammileru-10-8-21-768x346-1-640x480.jpeg",
        "details" => json_encode(["Alienation Case Survey", "Revenue & Mutation Petitions", "Patta Restoration Follow-Up", "Victim Family Legal Aid"]),
        "link_url" => "/la-rr",
        "sort_order" => 3
    ],
    [
        "category" => "Forest Rights",
        "title" => "Forest Rights Act Literacy Camps",
        "description" => "Hamlet-level legal literacy sessions that explain the IFR and CFR claim process, Forest Rights Committee formation, and the evidence required before the Sub-Divisional Level Committee.",
        "img" => "/uploads/programs/PHOTO-2023-02-15-19-20-55_1-2_(1).jpg",
        "details" => json_encode(["Bare Act Village Readings", "Claim Helpdesk Assistance", "Forest Rights Committee Formation", "SDLC & DLC Hearing Support"]),
        "link_url" => "/la-rr",
        "sort_order" => 4
    ],

    // Governance
    [
        "category" => "Governance",
        "title" => "Self-Governance & PESA Act 1996",
        "description" => "Mobilizing Adivasi hamlets to exercise sovereign powers vested in the Gram Sabha under PESA, curbing illegal land alienation and defending customary heritage.",
        "img" => "/uploads/programs/PHOTO-2023-02-15-19-20-56.jpg",
        "details" => json_encode(["Gram Sabha Capacity Training", "PESA Rules Enforcement", "Dispute Resolution Through Tribal Elders", "Natural Resource Governance"]),
        "link_url" => "/la-rr",
        "sort_order" => 5
    ],
    [
        "category" => "Governance",
        "title" => "Gram Sabha Panchayat & Planning Training",
        "description" => "Training elected Gram Sabha Panchayats to prepare village development plans, assert minor-water-forest and land entitlement powers, and hold statutory meetings in the mother tongue.",
        "img" => "/uploads/programs/PHOTO-2022-10-20-17-25-29-2.jpg",
        "details" => json_encode(["Annual Village Planning", "PESA Powers Orientation", "Minutes & Record Keeping", "Women Councillor Mentoring"]),
        "link_url" => "/la-rr",
        "sort_order" => 6
    ],
    [
        "category" => "Governance",
        "title" => "Elder Council Dispute Resolution",
        "description" => "Customary justice forums convened by tribal elders and Gram Sabhas settle land, family and resource disputes locally, reducing case pendency and court costs for Adivasi families.",
        "img" => "/uploads/programs/PHOTO-2022-10-20-17-25-30.jpg",
        "details" => json_encode(["Elder Council Convening", "Customary Law Documentation", "Land Dispute Mediation", "Referral To Legal Aid Cell"]),
        "link_url" => "/la-rr",
        "sort_order" => 7
    ],
    [
        "category" => "Governance",
        "title" => "RTI & Departmental Convergence Monitoring",
        "description" => "Using the Right to Information Act and ITDA review meetings to track sanctioned works, welfare scheme entitlements and service delivery in agency mandals.",
        "img" => "/uploads/programs/PHOTO-2022-10-20-17-25-31.jpg",
        "details" => json_encode(["RTI Representations", "ITDA Convergence Reviews", "Scheme Utilisation Audits", "Grievance Escalation Tracking"]),
        "link_url" => "/la-rr",
        "sort_order" => 8
    ],

    // Polavaram PIP
    [
        "category" => "Polavaram PIP",
        "title" => "Land Acquisition (LA) & R&R Advocacy",
        "description" => "Defending rights of 1,05,000+ Project Displaced Families (PDFs) facing displacement from the Polavaram National Project under the RFCTLARR Act 2013.",
        "img" => "/uploads/programs/submergence-area-map-1.jpg",
        "details" => json_encode(["Fair Market Land Valuation", "Adult Youth (18+) Package Claims", "Colony Amenities Monitoring", "High Court Litigation Support"]),
        "link_url" => "/la-rr",
        "sort_order" => 9
    ],
    [
        "category" => "Polavaram PIP",
        "title" => "R&R Social Audit of Submerged Villages",
        "description" => "Independent community social audits across the 371 submergence-area villages of the tri-ITDA belt, verifying beneficiary lists, compensation records and resettlement entitlements.",
        "img" => "/uploads/programs/ippuru2-1-1024x461-640x480.jpeg",
        "details" => json_encode(["Household Survey Verification", "Beneficiary List Audits", "Village-Level Social Audit Meetings", "Audit Findings Submissions"]),
        "link_url" => "/la-rr",
        "sort_order" => 10
    ],
    [
        "category" => "Polavaram PIP",
        "title" => "RFCTLARR Act 2013 Entitlement Tracking",
        "description" => "Section-by-section tracking of land-for-land and house-for-house entitlements, homestead plots, amenities and rehabilitation grants for project-affected families.",
        "img" => "/uploads/programs/larr2013.png",
        "details" => json_encode(["Entitlement Register Maintenance", "Land-for-Land Verification", "Housing Plot Allocation Review", "Resettlement Colony Amenities"]),
        "link_url" => "/la-rr",
        "sort_order" => 11
    ],
    [
        "category" => "Polavaram PIP",
        "title" => "PAF Grievance Redressal & Litigation Support",
        "description" => "Grievance camps and court support for project-affected families whose awards, pensions and colony works remain unresolved, including documentation for writ petitions.",
        "img" => "/uploads/programs/egwg-colonies-1.png",
        "details" => json_encode(["PAF Grievance Camps", "Award Objection Filing", "Rehabilitation Commissioner Representations", "Writ Petition Documentation"]),
        "link_url" => "/la-rr",
        "sort_order" => 12
    ],

    // Women Cooperatives
    [
        "category" => "Women Cooperatives",
        "title" => "Antyodaya: Matsya Mithra Women Federation",
        "description" => "Empowering 3,500+ Yenadi tribal fisherwomen across 6 coastal mandals of Krishna District through sustainable fisheries, cold storage, and micro-credit.",
        "img" => "/uploads/programs/PHOTO-2023-02-15-19-21-00_1.jpg",
        "details" => json_encode(["Fisheries Cooperatives Management", "Micro-Savings & SHG Linkages", "Direct Market Fish Processing", "Leadership & Gender Justice"]),
        "link_url" => "/la-rr",
        "sort_order" => 13
    ],
    [
        "category" => "Women Cooperatives",
        "title" => "Yenadi House-Site Pattas & Identity Documents",
        "description" => "Securing permanent house-site pattas and civil documentation for nomadic Yenadi hamlets in Machilipatnam, Bantumilli and Koduru mandals so families can claim ration, pension and school access.",
        "img" => "/uploads/programs/coastal-krishna-fishing.jpg",
        "details" => json_encode(["House-Site Patta Filing", "Aadhaar & Voter Enrolment", "Ration Card Linking", "Pension Scheme Access"]),
        "link_url" => "/la-rr",
        "sort_order" => 14
    ],
    [
        "category" => "Women Cooperatives",
        "title" => "Micro-Savings & Revolving Credit Groups",
        "description" => "Savings collectives run by Matsya Mithra members replace moneylender debt with internal revolving loans, steady repayments and financial literacy for coastal households.",
        "img" => "/uploads/programs/reel-4-women.jpg",
        "details" => json_encode(["Weekly Savings Meetings", "Revolving Loan Corpus", "Debt-Free Livelihood Support", "Book-Keeping Training"]),
        "link_url" => "/la-rr",
        "sort_order" => 15
    ],
    [
        "category" => "Women Cooperatives",
        "title" => "Estuarine Fishing Rights & Mangrove Care",
        "description" => "Women-led committees in the Kruthivennu and Nagayalanka creeks protect artisanal fishing zones, ban destructive fine-mesh trawling and restore mangrove tidal barriers.",
        "img" => "/uploads/programs/WhatsApp-Image-2021-07-24-at-8.04.03-PM-1-768x1024.jpeg",
        "details" => json_encode(["Artisanal Zone Protection", "Mangrove Regeneration Drives", "Breeding Season Norms", "Cyclone Shelter Preparedness"]),
        "link_url" => "/la-rr",
        "sort_order" => 16
    ],

    // Child Rights
    [
        "category" => "Child Rights",
        "title" => "Child Interventions & Bare Acts",
        "description" => "Ensuring every Adivasi child enjoys statutory protection under RTE, Juvenile Justice, and POCSO Acts, supporting bilingual education and nutrition.",
        "img" => "/uploads/programs/Children-reieved-shoes-1.jpg",
        "details" => json_encode(["Anti-Child Labor & Trafficking Vigilance", "Mother-Tongue Bilingual Learning", "Malnutrition Mitigation in Ashram Schools", "Child Bare Acts Community Workshops"]),
        "link_url" => "/la-rr",
        "sort_order" => 17
    ],
    [
        "category" => "Child Rights",
        "title" => "Joyful Learning Centres in Agency Hamlets",
        "description" => "Village learning centres that teach young children in Koya and Telugu mother tongues, with tribal folk content, play-based material and no corporal punishment.",
        "img" => "/uploads/programs/reel-2-learning.jpg",
        "details" => json_encode(["Mother-Tongue Pedagogy", "Folk & Cultural Curricula", "Toy & Learning Material Kits", "Volunteer Teacher Support"]),
        "link_url" => "/la-rr",
        "sort_order" => 18
    ],
    [
        "category" => "Child Rights",
        "title" => "Digital Classrooms & School Support Kits",
        "description" => "School kits, uniforms, footwear and digital learning equipment supplied to Adivasi children in ashram and village schools to curb dropouts in the Godavari belt.",
        "img" => "/uploads/programs/reel-3-school-kits.jpg",
        "details" => json_encode(["Uniform & Footwear Support", "Digital Classroom Equipment", "Exam & Career Guidance", "Dropout Re-Enrolment Drives"]),
        "link_url" => "/la-rr",
        "sort_order" => 19
    ],
    [
        "category" => "Child Rights",
        "title" => "Child Protection & Nutrition Watch",
        "description" => "Community vigilance on child labour, trafficking and residential-school nutrition, with reporting pathways to Child Welfare Committees and district authorities.",
        "img" => "/uploads/programs/laptop1-640x480.jpeg",
        "details" => json_encode(["Residential School Inspections", "Nutrition & Meal Monitoring", "Childline & CWC Linkages", "POCSO Awareness Sessions"]),
        "link_url" => "/la-rr",
        "sort_order" => 20
    ],

    // Disaster Relief
    [
        "category" => "Disaster Relief",
        "title" => "Flood Relief Measures (2020 – 2023)",
        "description" => "Mobilizing emergency boat rescues, essential food provisions, sanitary supplies, and winter blankets for Godavari and Krishna river flood victims.",
        "img" => "/uploads/programs/all2023.jpeg",
        "details" => json_encode(["Boat Rescue & Evacuation Teams", "Ration & Medical Kit Distribution", "Post-Flood Sanitation & Water Purification", "Housing Rehabilitation Assistance"]),
        "link_url" => "/flood-relief-measures",
        "sort_order" => 21
    ],
    [
        "category" => "Disaster Relief",
        "title" => "Godavari Gorge Rescue & Evacuation",
        "description" => "Volunteer boat teams reach isolated riverside habitations in the Kunavaram and Devipatnam gorge belt during monsoon inundation, moving families to relief camps.",
        "img" => "/uploads/programs/f2023-1024x461-640x480.jpeg",
        "details" => json_encode(["Community Boat Teams", "Isolated Hamlet Access", "Relief Camp Setup", "Livestock & Grain Shift Support"]),
        "link_url" => "/flood-relief-measures",
        "sort_order" => 22
    ],
    [
        "category" => "Disaster Relief",
        "title" => "Winter Blanket & Health Drives",
        "description" => "Blankets, warm clothing and basic medical checks for exposed hill hamlets during Eastern Ghats winter, when cold stress hits children and elders hardest.",
        "img" => "/uploads/programs/m2023-1024x461-640x480.jpeg",
        "details" => json_encode(["Blanket Distribution", "Mobile Health Checks", "Elder & Child Care Kits", "Village Health Referrals"]),
        "link_url" => "/flood-relief-measures",
        "sort_order" => 23
    ],
    [
        "category" => "Disaster Relief",
        "title" => "Post-Flood Sanitation & Safe Water",
        "description" => "Disinfection, clean drinking water units and latrine restoration after Godavari and Krishna floods, plus rebuilding support for damaged houses.",
        "img" => "/uploads/programs/all2023-1024x576-640x480.jpeg",
        "details" => json_encode(["Water Purification Units", "Village Disinfection Works", "Damaged House Repair", "Sanitary & Dignity Kits"]),
        "link_url" => "/flood-relief-measures",
        "sort_order" => 24
    ],

    // Clean Energy
    [
        "category" => "Clean Energy",
        "title" => "Community Solar & Green Energy",
        "description" => "Providing decentralized clean solar home lighting systems and solar street poles to remote, un-electrified hill habitations across the Eastern Ghats.",
        "img" => "/uploads/programs/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
        "details" => json_encode(["Solar Street Pole Installations", "Portable Solar Lantern Distribution", "Local Youth Technician Training", "Zero-Carbon Rural Electrification"]),
        "link_url" => "/la-rr",
        "sort_order" => 25
    ],
    [
        "category" => "Clean Energy",
        "title" => "Solar Home Lighting for Off-Grid Hamlets",
        "description" => "Decentralized solar lighting systems installed in Godavari gorge hamlets cut off from the conventional grid, replacing kerosene lamps in Adivasi households.",
        "img" => "/uploads/programs/WhatsApp-Image-2021-09-16-at-7.51.09-PM-1024x461.jpeg",
        "details" => json_encode(["Household Solar Kits", "Kerosene-Free Habitats", "Installation Site Survey", "Beneficiary Handover Training"]),
        "link_url" => "/la-rr",
        "sort_order" => 26
    ],
    [
        "category" => "Clean Energy",
        "title" => "Solar Street Poles & Water Units",
        "description" => "Solar street lighting at village meeting points and schools improves night safety for women and children, alongside solar-assisted drinking water purification.",
        "img" => "/uploads/programs/WhatsApp-Image-2021-09-16-at-7.50.52-PM-461x1024.jpeg",
        "details" => json_encode(["Village Lane Street Poles", "School & Path Lighting", "Solar Water Purification", "Community Maintenance Corpus"]),
        "link_url" => "/la-rr",
        "sort_order" => 27
    ],
    [
        "category" => "Clean Energy",
        "title" => "Tribal Youth Solar Technician Training",
        "description" => "Local Adivasi youth are trained to service solar kits, replace batteries and maintain micro-grids, keeping repair work and income inside the village.",
        "img" => "/uploads/programs/WhatsApp-Image-2021-09-16-at-7.50.57-PM-461x1024.jpeg",
        "details" => json_encode(["Panel & Battery Servicing", "Fault Diagnosis Modules", "Village Maintenance Teams", "Green Livelihood Linkages"]),
        "link_url" => "/la-rr",
        "sort_order" => 28
    ],

    // Agriculture
    [
        "category" => "Agriculture",
        "title" => "Indigenous Millets & Seed Banks",
        "description" => "Reviving native heritage millet cultivation, bio-fertilizers, and community heirloom seed banks to guarantee food sovereignty and climate resilience.",
        "img" => "/uploads/programs/ramavarampadu_11-08-2021-1024x461-640x480.jpeg",
        "details" => json_encode(["Traditional Millet Cultivation", "Community Indigenous Seed Banks", "Chemical-Free Organic Farming", "Soil & Water Conservation Works"]),
        "link_url" => "/la-rr",
        "sort_order" => 29
    ],
    [
        "category" => "Agriculture",
        "title" => "Community Heirloom Seed Banks",
        "description" => "Farmer-managed seed stores preserve native millet, pulse and oilseed varieties, distributed before each sowing season without cost to small and marginal growers.",
        "img" => "/uploads/programs/WhatsApp-Image-2024-10-15-at-4.52.24-PM-640x480.jpeg",
        "details" => json_encode(["Variety Selection & Storage", "Seed Exchange Festivals", "Farmer Steward Committees", "Germination & Viability Tests"]),
        "link_url" => "/la-rr",
        "sort_order" => 30
    ],
    [
        "category" => "Agriculture",
        "title" => "Natural Farming & Bio-Input Fields",
        "description" => "Chemical-free plot demonstrations using farmyard inputs, composting and intercropping, so degraded agency slopes regain soil health and lower input costs.",
        "img" => "/uploads/programs/WhatsApp-Image-2024-09-18-at-1.46.51-PM-640x480.jpeg",
        "details" => json_encode(["Bio-Fertilizer Preparation", "Compost & Mulch Training", "Intercropping Models", "Pest Management Without Chemicals"]),
        "link_url" => "/la-rr",
        "sort_order" => 31
    ],
    [
        "category" => "Agriculture",
        "title" => "Water Conservation & Farm Ponds",
        "description" => "Contour bunding, percolation tanks and farm ponds dug with Gram Sabha labour to hold monsoon runoff for dry-season millet and vegetable cultivation.",
        "img" => "/uploads/programs/WhatsApp-Image-2024-10-05-at-11.38.49-AM-640x480.jpeg",
        "details" => json_encode(["Farm Pond Construction", "Contour & Trench Binding", "Drip & Mica Irrigation Support", "Kitchen Garden Promotion"]),
        "link_url" => "/la-rr",
        "sort_order" => 32
    ]
];

if ($conn) {
    try {
        // 1. Table for Categories
        $conn->exec("CREATE TABLE IF NOT EXISTS key_programs_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_name VARCHAR(100) NOT NULL UNIQUE,
            display_name VARCHAR(150) NOT NULL,
            subtitle TEXT NOT NULL,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // 2. Table for Settings (Antyodaya & CTA)
        $conn->exec("CREATE TABLE IF NOT EXISTS key_programs_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // 3. Table for Programs
        $conn->exec("CREATE TABLE IF NOT EXISTS key_programs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            img LONGTEXT NOT NULL,
            details LONGTEXT NULL,
            link_url VARCHAR(255) DEFAULT '/la-rr',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Seed Categories if empty
        $catCount = (int)$conn->query("SELECT COUNT(*) FROM key_programs_categories")->fetchColumn();
        if ($catCount === 0) {
            $stmtCat = $conn->prepare("INSERT INTO key_programs_categories (category_name, display_name, subtitle, sort_order) VALUES (?, ?, ?, ?)");
            foreach ($defaultCategories as $c) {
                $stmtCat->execute([$c['category_name'], $c['display_name'], $c['subtitle'], $c['sort_order']]);
            }
        }

        // Seed Settings if empty
        $setCount = (int)$conn->query("SELECT COUNT(*) FROM key_programs_settings")->fetchColumn();
        if ($setCount === 0) {
            $stmtSet = $conn->prepare("INSERT INTO key_programs_settings (setting_key, setting_value) VALUES (?, ?)");
            foreach ($defaultSettings as $k => $v) {
                $stmtSet->execute([$k, $v]);
            }
        }

        // Seed Programs if empty
        $progCount = (int)$conn->query("SELECT COUNT(*) FROM key_programs")->fetchColumn();
        if ($progCount === 0) {
            $stmtP = $conn->prepare("INSERT INTO key_programs (category, title, description, img, details, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
            foreach ($defaultPrograms as $dp) {
                $stmtP->execute([
                    $dp['category'],
                    $dp['title'],
                    $dp['description'],
                    $dp['img'],
                    $dp['details'],
                    $dp['link_url'],
                    $dp['sort_order']
                ]);
            }
        }

        // Fetch categories
        $categories = $conn->query("SELECT category_name, display_name, subtitle, sort_order FROM key_programs_categories ORDER BY sort_order ASC, id ASC")->fetchAll();

        // Fetch settings
        $settingsRows = $conn->query("SELECT setting_key, setting_value FROM key_programs_settings")->fetchAll();
        $settings = [];
        foreach ($settingsRows as $sr) {
            $settings[$sr['setting_key']] = $sr['setting_value'];
        }
        foreach ($defaultSettings as $dk => $dv) {
            if (!isset($settings[$dk])) {
                $settings[$dk] = $dv;
            }
        }

        // Fetch active programs
        $programs = $conn->query("SELECT id, category, title, description, img, details, link_url, sort_order, is_active FROM key_programs WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")->fetchAll();

        // Format details as array
        foreach ($programs as &$p) {
            if (!empty($p['details'])) {
                $decoded = json_decode($p['details'], true);
                $p['details'] = is_array($decoded) ? $decoded : [$p['details']];
            } else {
                $p['details'] = [];
            }
            $p['cat'] = $p['category'];
        }
        unset($p);

        echo json_encode([
            "success" => true,
            "data" => $programs,
            "categories" => $categories ?: $defaultCategories,
            "settings" => $settings
        ]);
        exit;
    } catch (PDOException $e) {
        // Fall back to defaults
    }
}

// Fallback formatted array
$fbPrograms = $defaultPrograms;
foreach ($fbPrograms as $idx => &$fp) {
    $fp['id'] = $idx + 1;
    $fp['details'] = json_decode($fp['details'], true) ?: [];
    $fp['cat'] = $fp['category'];
    $fp['is_active'] = 1;
}
unset($fp);

echo json_encode([
    "success" => true,
    "data" => $fbPrograms,
    "categories" => $defaultCategories,
    "settings" => $defaultSettings
]);

