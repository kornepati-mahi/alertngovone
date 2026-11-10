<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultRoutes = [
    [
        "icon" => "FaBuilding",
        "title" => "CSR & Section 80G Support",
        "body" => "Company CSR contributions to ALERT's registered programmes, with 80G tax exemption, a project-specific utilization certificate and audit-ready reporting for your CSR committee and Section 135 filings.",
        "fits" => "CSR committees, trusts of corporate foundations"
    ],
    [
        "icon" => "FaHandHoldingHeart",
        "title" => "Institutional & FCRA Grants",
        "body" => "Multi-year grants from international foundations and development agencies. ALERT has implemented Brot für die Welt (BftW), Germany-supported work through the Antyodaya Project in the coastal Krishna District.",
        "fits" => "Foundations, embassies, multilateral funds"
    ],
    [
        "icon" => "FaUsers",
        "title" => "Foundation & Community Partnerships",
        "body" => "Co-designed work with district administrations, Gram Sabhas, forest committees, universities and other NGOs — joint surveys, legal literacy drives, restoration and livelihood programmes with shared ownership.",
        "fits" => "PRIs, departments, academic institutions"
    ],
    [
        "icon" => "FaSeedling",
        "title" => "In-Kind & Skilled Support",
        "body" => "Solar kits, school and learning material, books, blankets and relief supplies, or pro-bono legal, accounting, translation, design and monitoring expertise contributed against a defined scope.",
        "fits" => "Suppliers, professional firms, individual experts"
    ]
];

$defaultMissions = [
    [
        "icon" => "FaGavel",
        "title" => "Land & Forest Rights",
        "body" => "Recognition of Forest Rights Act and LTR 1970 claims, Community Forest Resource mapping, title-suit recovery, and legal aid for habitation-level rights disputes across the Eastern Ghats agency zones.",
        "tell" => "Tell us if you want to fund legal aid, claim facilitation or document recovery."
    ],
    [
        "icon" => "FaWater",
        "title" => "Polavaram Rehabilitation",
        "body" => "Household surveys, RFCTLARR Act 2013 entitlement tracking, R&R social audits and grievance redressal support for families in the submergence belt of Godavari and Krishna districts.",
        "tell" => "Tell us if you want to back field research, social audits or victim support."
    ],
    [
        "icon" => "FaUsers",
        "title" => "Antyodaya Livelihoods",
        "body" => "Women's cooperatives and SHGs — micro-savings, revolving credit, estuarine fishing and mangrove work, house-site pattas and market linkage for coastal Krishna mandals.",
        "tell" => "Tell us if you want to seed a cooperative, a revolving fund or skills training."
    ],
    [
        "icon" => "FaGraduationCap",
        "title" => "Child Rights & Basic Services",
        "body" => "Joyful learning centres, digital classrooms and kits, school kits and kits for out-of-school children, alongside child-protection and nutrition monitoring at the village level.",
        "tell" => "Tell us if you want to equip a classroom, a centre or a batch of students."
    ]
];

$defaultDiligence = [
    [
        "title" => "Organizational Profile & 20-Year Report of ALERT",
        "file" => "/uploads/Organizational-Profile-of-ALERT.pdf",
        "meta" => "Registration 307/2004 • 12A & 80G certificates",
        "icon" => "FaFilePdf"
    ],
    [
        "title" => "ALERT Annual Report (April 2020 – March 2021)",
        "file" => "/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf",
        "meta" => "Audited operational and financial report",
        "icon" => "FaFilePdf"
    ],
    [
        "title" => "Governance & Statutory Compliances for NGOs in India",
        "file" => "/uploads/FAQS-ON-NGO.pdf",
        "meta" => "Societies Registration, FCRA and 80G compliance manual",
        "icon" => "FaFilePdf"
    ]
];

$defaultCommitments = [
    "Project-scoped agreement with clear deliverables, budget heads and a reporting calendar",
    "Social audit and beneficiary-level verification before a grant is renewed",
    "Named field officer and a site visit for every funded intervention",
    "Donations and grants reported publicly in our News & Views and annual report",
    "Zero tolerance on diversion: 12A & 80G, FCRA and POSH compliant operations"
];

$defaultRegistration = [
    ["label" => "Legal form", "value" => "Registered Society, Andhra Pradesh"],
    ["label" => "Reg. No.", "value" => "307/2004"],
    ["label" => "Tax status", "value" => "12A & 80G — donations tax-exempt"],
    ["label" => "Foreign contributions", "value" => "FCRA-compliant institutional grants"],
    ["label" => "Head office", "value" => "Vijayawada, Krishna District, Andhra Pradesh"]
];
$defaultRegistrationNote = "Certificates, PAN, FCRA sanction and audited statements are shared on request against a signed enquiry. Full document list: [Downloads](/downloads).";

$defaultPage = [
    "id" => 1,
    "badge" => "Section 01",
    "title" => "Why Partner With ALERT",
    "subtitle" => "ALERT is a Vijayawada-based society registered in 2004, working with Adivasi and coastal communities in the Fifth Scheduled Areas of Andhra Pradesh. We combine a legal cell, field research units and community institutions — so a partnership here reaches a habitation, not only a report.",
    "intro_p1" => "Our mandate runs from forest and land rights through displacement rehabilitation to livelihoods and education. Work is delivered through Gram Sabhas, forest rights committees and women's cooperatives, led by <strong>Y.L.J.B. Jayaraj</strong> with 35 institutional policies governing compliance, safeguarding and monitoring.",
    "intro_p2" => "We welcome funders who want the messier, slower work — title recovery, entitlement audits, legal literacy — as well as those who prefer a single school kit or solar pole. Both are scoped, reported and audited.",
    "hero_media_type" => "image",
    "hero_media_url" => "/uploads/reels/reel-4-women.jpg",
    "hero_poster" => "",
    "contact_email" => "director@alertngo.in",
    "donate_btn_text" => "Give Directly",
    "donate_btn_url" => "/donate",
    "routes_badge" => "Section 02",
    "routes_title" => "Four Ways to Partner",
    "routes_subtitle" => "Pick the route that matches your mandate, your budget cycle and your reporting needs.",
    "routes_json" => json_encode($defaultRoutes, JSON_UNESCAPED_UNICODE),
    "missions_badge" => "Section 03",
    "missions_title" => "Where Support Goes",
    "missions_subtitle" => "Four missions we can ring-fence a grant around. Every funded intervention gets a named officer, a field visit and a written close-out.",
    "missions_json" => json_encode($defaultMissions, JSON_UNESCAPED_UNICODE),
    "diligence_badge" => "Section 04",
    "diligence_title" => "Due Diligence & Statutory Records",
    "diligence_subtitle" => "Three audited records verifying ALERT's registration, governance and tax status.",
    "diligence_json" => json_encode($defaultDiligence, JSON_UNESCAPED_UNICODE),
    "commitments_title" => "Our Institutional Commitments",
    "commitments_json" => json_encode($defaultCommitments, JSON_UNESCAPED_UNICODE),
    "registration_title" => "Registration & tax details",
    "registration_json" => json_encode($defaultRegistration, JSON_UNESCAPED_UNICODE),
    "registration_note" => $defaultRegistrationNote,
    "cta_badge" => "Partnership",
    "cta_title" => "Begin a Conversation With Us",
    "cta_subtitle" => "Tell us what programme, community or geography fits your mandate. We will reply with a concept note and sample budget heads.",
    "cta_email_subject" => "Partnership enquiry to ALERT",
    "cta_donate_url" => "/donate"
];

if (!$conn) {
    echo json_encode(["success" => true, "page" => $defaultPage], JSON_UNESCAPED_UNICODE);
    exit;
}

// Ensure table exists
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `partner_page` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `badge` VARCHAR(100) DEFAULT 'Section 01',
        `title` VARCHAR(255) DEFAULT 'Why Partner With ALERT',
        `subtitle` TEXT NULL,
        `intro_p1` TEXT NULL,
        `intro_p2` TEXT NULL,
        `hero_media_type` VARCHAR(20) DEFAULT 'image',
        `hero_media_url` VARCHAR(500) DEFAULT '/uploads/reels/reel-4-women.jpg',
        `hero_poster` VARCHAR(500) NULL,
        `contact_email` VARCHAR(255) DEFAULT 'director@alertngo.in',
        `donate_btn_text` VARCHAR(100) DEFAULT 'Give Directly',
        `donate_btn_url` VARCHAR(255) DEFAULT '/donate',
        `routes_badge` VARCHAR(100) DEFAULT 'Section 02',
        `routes_title` VARCHAR(255) DEFAULT 'Four Ways to Partner',
        `routes_subtitle` TEXT NULL,
        `routes_json` LONGTEXT NULL,
        `missions_badge` VARCHAR(100) DEFAULT 'Section 03',
        `missions_title` VARCHAR(255) DEFAULT 'Where Support Goes',
        `missions_subtitle` TEXT NULL,
        `missions_json` LONGTEXT NULL,
        `diligence_badge` VARCHAR(100) DEFAULT 'Section 04',
        `diligence_title` VARCHAR(255) DEFAULT 'Due Diligence & Statutory Records',
        `diligence_subtitle` TEXT NULL,
        `diligence_json` LONGTEXT NULL,
        `commitments_title` VARCHAR(255) DEFAULT 'Our Institutional Commitments',
        `commitments_json` LONGTEXT NULL,
        `registration_title` VARCHAR(255) DEFAULT 'Registration & tax details',
        `registration_json` LONGTEXT NULL,
        `registration_note` TEXT NULL,
        `cta_badge` VARCHAR(100) DEFAULT 'Partnership',
        `cta_title` VARCHAR(255) DEFAULT 'Begin a Conversation With Us',
        `cta_subtitle` TEXT NULL,
        `cta_email_subject` VARCHAR(255) DEFAULT 'Partnership enquiry to ALERT',
        `cta_donate_url` VARCHAR(255) DEFAULT '/donate',
        `trust_strip_json` LONGTEXT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try { $conn->exec("ALTER TABLE `partner_page` ADD COLUMN `registration_title` VARCHAR(255) DEFAULT 'Registration & tax details'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `partner_page` ADD COLUMN `registration_json` LONGTEXT NULL"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `partner_page` ADD COLUMN `registration_note` TEXT NULL"); } catch (Exception $e) {}

    $count = (int)$conn->query("SELECT COUNT(*) FROM partner_page")->fetchColumn();
    if ($count === 0) {
        $stmt = $conn->prepare("INSERT INTO partner_page 
            (id, badge, title, subtitle, intro_p1, intro_p2, hero_media_type, hero_media_url, hero_poster, contact_email, donate_btn_text, donate_btn_url, routes_badge, routes_title, routes_subtitle, routes_json, missions_badge, missions_title, missions_subtitle, missions_json, diligence_badge, diligence_title, diligence_subtitle, diligence_json, commitments_title, commitments_json, registration_title, registration_json, registration_note, cta_badge, cta_title, cta_subtitle, cta_email_subject, cta_donate_url)
            VALUES (1, :badge, :title, :subtitle, :intro_p1, :intro_p2, :hero_media_type, :hero_media_url, :hero_poster, :contact_email, :donate_btn_text, :donate_btn_url, :routes_badge, :routes_title, :routes_subtitle, :routes_json, :missions_badge, :missions_title, :missions_subtitle, :missions_json, :diligence_badge, :diligence_title, :diligence_subtitle, :diligence_json, :commitments_title, :commitments_json, :registration_title, :registration_json, :registration_note, :cta_badge, :cta_title, :cta_subtitle, :cta_email_subject, :cta_donate_url)");
        $stmt->execute([
            ':badge' => $defaultPage['badge'],
            ':title' => $defaultPage['title'],
            ':subtitle' => $defaultPage['subtitle'],
            ':intro_p1' => $defaultPage['intro_p1'],
            ':intro_p2' => $defaultPage['intro_p2'],
            ':hero_media_type' => $defaultPage['hero_media_type'],
            ':hero_media_url' => $defaultPage['hero_media_url'],
            ':hero_poster' => $defaultPage['hero_poster'],
            ':contact_email' => $defaultPage['contact_email'],
            ':donate_btn_text' => $defaultPage['donate_btn_text'],
            ':donate_btn_url' => $defaultPage['donate_btn_url'],
            ':routes_badge' => $defaultPage['routes_badge'],
            ':routes_title' => $defaultPage['routes_title'],
            ':routes_subtitle' => $defaultPage['routes_subtitle'],
            ':routes_json' => $defaultPage['routes_json'],
            ':missions_badge' => $defaultPage['missions_badge'],
            ':missions_title' => $defaultPage['missions_title'],
            ':missions_subtitle' => $defaultPage['missions_subtitle'],
            ':missions_json' => $defaultPage['missions_json'],
            ':diligence_badge' => $defaultPage['diligence_badge'],
            ':diligence_title' => $defaultPage['diligence_title'],
            ':diligence_subtitle' => $defaultPage['diligence_subtitle'],
            ':diligence_json' => $defaultPage['diligence_json'],
            ':commitments_title' => $defaultPage['commitments_title'],
            ':commitments_json' => $defaultPage['commitments_json'],
            ':registration_title' => $defaultPage['registration_title'],
            ':registration_json' => $defaultPage['registration_json'],
            ':registration_note' => $defaultPage['registration_note'],
            ':cta_badge' => $defaultPage['cta_badge'],
            ':cta_title' => $defaultPage['cta_title'],
            ':cta_subtitle' => $defaultPage['cta_subtitle'],
            ':cta_email_subject' => $defaultPage['cta_email_subject'],
            ':cta_donate_url' => $defaultPage['cta_donate_url']
        ]);
    }

    $row = $conn->query("SELECT * FROM partner_page WHERE id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    $activePage = $row ?: $defaultPage;
    if (empty($activePage['missions_json'])) {
        $activePage['missions_json'] = json_encode($defaultMissions, JSON_UNESCAPED_UNICODE);
    }
    if (empty($activePage['commitments_json'])) {
        $activePage['commitments_json'] = json_encode($defaultCommitments, JSON_UNESCAPED_UNICODE);
    }
    if (empty($activePage['registration_json'])) {
        $activePage['registration_json'] = json_encode($defaultRegistration, JSON_UNESCAPED_UNICODE);
    }
    if (empty($activePage['registration_title'])) {
        $activePage['registration_title'] = "Registration & tax details";
    }
    if (empty($activePage['registration_note'])) {
        $activePage['registration_note'] = $defaultRegistrationNote;
    }
    echo json_encode([
        "success" => true,
        "page" => $activePage,
        "data" => $activePage
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        "success" => true,
        "page" => $defaultPage,
        "data" => $defaultPage,
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

