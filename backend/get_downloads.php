<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$documents = [
    [
        "category" => "acts",
        "title" => "RFCTLARR Act 2013 - Schedule 1 (Compensation)",
        "file" => "/uploads/schedule-1.pdf",
        "meta" => "Central Bare Act • LA Act 2013",
        "desc" => "Statutory multi-factor valuation formula for rural tribal lands and mandatory 100% solatium allowance.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "acts",
        "title" => "RFCTLARR Act 2013 - Schedule 2 (R&R Entitlements)",
        "file" => "/uploads/schedule-2.pdf",
        "meta" => "Central Bare Act • LA Act 2013",
        "desc" => "Mandatory house allotment, subsistence monthly grants, cattle shed allowances, and shifting grants for displaced families.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "acts",
        "title" => "RFCTLARR Act 2013 - Schedule 3 (25 Colony Amenities)",
        "file" => "/uploads/schedules-3-1.pdf",
        "meta" => "Central Bare Act • LA Act 2013",
        "desc" => "List of 25 mandatory public infrastructural amenities required in every resettlement colony before displacement.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "acts",
        "title" => "Key Critical Issues of Polavaram Project (PIP Brief)",
        "file" => "/uploads/Seperated-Polavaram-issues-4.pdf",
        "meta" => "ALERT Legal & Policy Cell",
        "desc" => "Analytical policy brief on submergence contour errors, youth package exclusions, and rehabilitation colony infrastructure.",
        "fileSize" => "Official PDF (80 KB)"
    ],
    [
        "category" => "court",
        "title" => "High Court Cases: East Godavari District",
        "file" => "/uploads/High-court-Cases_EG-1.pdf",
        "meta" => "High Court of Andhra Pradesh",
        "desc" => "Record of writ petitions and court orders defending Adivasi forest rights and fair land valuation in East Godavari.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "court",
        "title" => "Pending High Court Cases: West Godavari District",
        "file" => "/uploads/Pending-High-court-cases_WG.pdf",
        "meta" => "High Court of Andhra Pradesh",
        "desc" => "Compiled list of pending litigation regarding adult youth entitlement packages and resettlement colony allotments.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "court",
        "title" => "Cases @ R&R Commissioner Office, Vijayawada",
        "file" => "/uploads/RR-commissioner-office_Court-Cases.pdf",
        "meta" => "Commissioner of R&R, Polavaram",
        "desc" => "Appeals filed by ALERT caseworkers representing families excluded from draft award declarations.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "court",
        "title" => "RTI Disclosures: LA & RR Authority Court",
        "file" => "/uploads/RTI-Data-LA-RR-Court.pdf",
        "meta" => "RTI Official Disclosures",
        "desc" => "Comprehensive RTI records regarding land acquisition award enquiries and compensation disbursement tracking.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "court",
        "title" => "Compendium of Judgements on Forest Rights Act (2007–2015)",
        "file" => "/uploads/Compendum-of-Judgements-on-FRA-2007-2015.pdf",
        "meta" => "ALERT Legal Cell Compilation",
        "desc" => "Landmark High Court and Supreme Court judgements affirming tribal land tenure under the Forest Rights Act 2006.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "court",
        "title" => "Land Acquisition & Structural Award Copies",
        "file" => "/uploads/AWARD-COPIES-1.pdf",
        "meta" => "Official Revenue Awards",
        "desc" => "Certified award copies issued by Special Land Acquisition Officers (SLAOs) in the Polavaram submergence basin.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "faqs",
        "title" => "Frequently Asked Questions on LARR Act 2013",
        "file" => "/uploads/FAQ-LARR.pdf",
        "meta" => "Government of India Guidelines",
        "desc" => "Comprehensive FAQ explaining land acquisition procedures, SIA studies, consent norms, and award calculations.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "faqs",
        "title" => "R&R Grievance Redressal FAQs & Procedures",
        "file" => "/uploads/GREIVANCE-FAQ.pdf",
        "meta" => "ALERT Community Handbook",
        "desc" => "Practical handbook on lodging grievances, appeal procedures before SDC, and entitlement claims under Polavaram.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "faqs",
        "title" => "Ministry of Tribal Affairs (MoTA) RoFR Guidelines FAQ",
        "file" => "/uploads/MoTA_FAQ.pdf",
        "meta" => "Ministry of Tribal Affairs",
        "desc" => "Official clarifications on Individual Forest Rights (IFR), Community Rights (CFR), and Gram Sabha powers.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "faqs",
        "title" => "MGNREGA Operational Guidelines & Rights in Tribal Areas",
        "file" => "/uploads/MGNREGA_GUIDELINES.pdf",
        "meta" => "Ministry of Rural Development",
        "desc" => "Statutory operational guidelines for employment guarantee, watershed development, and land leveling in Scheduled areas.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "faqs",
        "title" => "MGNREGA Frequently Asked Questions",
        "file" => "/uploads/NREGA_FAQ.pdf",
        "meta" => "Rural Employment Cell",
        "desc" => "Answers to wage payments, job card applications, and unemployment allowances for tribal workers.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "faqs",
        "title" => "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) FAQ",
        "file" => "/uploads/PMKSY_FAQ.pdf",
        "meta" => "Ministry of Agriculture & Farmers Welfare",
        "desc" => "Guidelines on micro-irrigation subsidies, check dams, and water harvesting structures for smallholder farmers.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "reports",
        "title" => "Organizational Profile & 20-Year Report of ALERT",
        "file" => "/uploads/Organizational-Profile-of-ALERT.pdf",
        "meta" => "ALERT Official Profile",
        "desc" => "Official organizational profile, registration documents (307/2004), 12A & 80G certificates, and 20-year achievements summary.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "reports",
        "title" => "ALERT Annual Report (April 2020 – March 2021)",
        "file" => "/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf",
        "meta" => "ALERT Audited Annual Report",
        "desc" => "Audited operational and financial report detailing field interventions, COVID-19 tribal relief, RoFR claims, and women's cooperatives.",
        "fileSize" => "Official PDF (730 KB)"
    ],
    [
        "category" => "faqs",
        "title" => "Governance & Statutory Compliances for NGOs in India",
        "file" => "/uploads/FAQS-ON-NGO.pdf",
        "meta" => "Legal Compliance Manual",
        "desc" => "Regulatory handbook on Societies Registration, FCRA regulations, 80G tax deductions, and governance best practices.",
        "fileSize" => "Official PDF"
    ],
    [
        "category" => "faqs",
        "title" => "RTI Online Filing & Tribal Advocacy Manual",
        "file" => "/uploads/RTI-Online-FAQs.pdf",
        "meta" => "Central Information Commission",
        "desc" => "Guide to filing online Right to Information (RTI) petitions to access project documents, DPRs, and land award records.",
        "fileSize" => "Official PDF"
    ]
];

if (!$conn) {
    echo json_encode([
        "success" => true,
        "total" => count($documents),
        "data" => $documents
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `site_downloads` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `category` VARCHAR(50) NOT NULL DEFAULT 'acts',
        `title` VARCHAR(255) NOT NULL,
        `file` VARCHAR(500) NOT NULL,
        `meta` VARCHAR(255) NULL,
        `desc` TEXT NOT NULL,
        `file_size` VARCHAR(100) DEFAULT 'Official PDF',
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $count = (int)$conn->query("SELECT COUNT(*) FROM site_downloads")->fetchColumn();
    if ($count === 0) {
        $stmt = $conn->prepare("INSERT INTO site_downloads 
            (category, title, file, meta, `desc`, file_size, sort_order, is_active)
            VALUES (:category, :title, :file, :meta, :desc, :file_size, :sort_order, 1)");
        foreach ($documents as $idx => $d) {
            $stmt->execute([
                ':category' => $d['category'],
                ':title' => $d['title'],
                ':file' => $d['file'],
                ':meta' => $d['meta'] ?? '',
                ':desc' => $d['desc'] ?? '',
                ':file_size' => $d['fileSize'] ?? 'Official PDF',
                ':sort_order' => $idx + 1
            ]);
        }
    }

    $all = isset($_GET['all']) && $_GET['all'] === '1';
    $sql = $all ? "SELECT id, category, title, file, meta, `desc`, file_size as fileSize, sort_order, is_active FROM site_downloads ORDER BY sort_order ASC, id ASC"
                : "SELECT id, category, title, file, meta, `desc`, file_size as fileSize, sort_order, is_active FROM site_downloads WHERE is_active = 1 ORDER BY sort_order ASC, id ASC";

    $dbRows = $conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "total" => count($dbRows),
        "data" => $dbRows
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        "success" => true,
        "total" => count($documents),
        "data" => $documents,
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

