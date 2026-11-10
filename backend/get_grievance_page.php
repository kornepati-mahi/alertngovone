<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultTypewriter = [
    "Polavaram Displaced Family (PDF) Housing Packages",
    "Adult Youth (18+) R&R Entitlement Claims",
    "Submergence Contour & Survey Rectifications",
    "Forest Land Rights (RoFR) Disposed Appeals",
    "Resettlement Colony Public Infrastructure Gaps"
];

$defaultFullForms = [
    ["abbr" => "PDF", "full" => "Project Displaced Family", "desc" => "A family whose home or physical dwelling is acquired and displaced."],
    ["abbr" => "PAF", "full" => "Project Affected Family", "desc" => "A family whose livelihood or agricultural land is impacted by the project."],
    ["abbr" => "SDC", "full" => "Special Deputy Collector", "desc" => "The designated Land Acquisition & Resettlement Officer at sub-division level."],
    ["abbr" => "SLAO", "full" => "Special Land Acquisition Officer", "desc" => "Revenue officer presiding over award enquiries and compensation disbursement."],
    ["abbr" => "FRL", "full" => "Full Reservoir Level", "desc" => "Maximum water storage height (+45.72 Meters in Polavaram Dam)."],
    ["abbr" => "RoFR", "full" => "Recognition of Forest Rights", "desc" => "Statutory rights under the Scheduled Tribes Forest Rights Act 2006."]
];

$defaultGrievanceCategories = [
    [
        "value" => "R&R Package Entitlement",
        "label" => "R&R Package Entitlement",
        "desc" => "₹10 Lakh or House allotment"
    ],
    [
        "value" => "Adult Youth Package",
        "label" => "Adult Youth (18+ Yrs) Package",
        "desc" => "Non-inclusion in entitlement roll"
    ],
    [
        "value" => "Land Valuation / Award Issue",
        "label" => "Land Valuation / Low Compensation",
        "desc" => "Discrepancy in land award"
    ],
    [
        "value" => "House / Structure Valuation",
        "label" => "House Structure Valuation",
        "desc" => "Structure measurement discrepancy"
    ],
    [
        "value" => "Resettlement Colony Infrastructure",
        "label" => "R&R Colony Amenities",
        "desc" => "Water, power, access roads"
    ],
    [
        "value" => "RoFR Forest Land Patta Issue",
        "label" => "RoFR Forest Land Patta",
        "desc" => "Title rejection or pending claim"
    ]
];

$defaultPage = [
    "id" => 1,
    "badge" => "Community Assistance",
    "title" => "ALERT Grievance Redressal Portal",
    "subtitle" => "Dedicated platform for Project Affected Families (PAFs) and Displaced Families (PDFs) to lodge land, compensation, and R&R complaints.",
    "typewriter_json" => json_encode($defaultTypewriter, JSON_UNESCAPED_UNICODE),
    "form_title" => "Lodge a Land or R&R Grievance",
    "form_subtitle" => "Provide accurate details as per your household ration card / patta documents.",
    "categories_json" => json_encode($defaultGrievanceCategories, JSON_UNESCAPED_UNICODE),
    "full_forms_json" => json_encode($defaultFullForms, JSON_UNESCAPED_UNICODE),
    "chart1_title" => "Official Grievance Categories Chart",
    "chart1_image" => "/uploads/grievance-types.png",
    "chart2_title" => "ALERT R&R Grievances Abstract",
    "chart2_image" => "/uploads/GRIEVANCE-ALL.png",
    "chart3_title" => "Land Rights Grievances Classification",
    "chart3_image" => "/uploads/LAND-RIGHTS.png",
    "faq_pdf_url" => "/uploads/GREIVANCE-FAQ.pdf",
    "faq_pdf_label" => "FAQ PDF",
    "hero_image" => "",
    "success_title" => "Grievance Registered Successfully",
    "success_desc" => "Our legal and field caseworkers in Vijayawada will inspect the revenue records and follow up with the concerned Special Deputy Collector (SDC)."
];

if (!$conn) {
    echo json_encode(["success" => true, "page" => $defaultPage], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `grievance_page` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `badge` VARCHAR(100) DEFAULT 'Community Assistance',
        `title` VARCHAR(255) DEFAULT 'ALERT Grievance Redressal Portal',
        `subtitle` TEXT NULL,
        `typewriter_json` LONGTEXT NULL,
        `form_title` VARCHAR(255) DEFAULT 'Lodge a Land or R&R Grievance',
        `form_subtitle` TEXT NULL,
        `categories_json` LONGTEXT NULL,
        `full_forms_json` LONGTEXT NULL,
        `chart1_title` VARCHAR(255) DEFAULT 'Official Grievance Categories Chart',
        `chart1_image` VARCHAR(500) DEFAULT '/uploads/grievance-types.png',
        `chart2_title` VARCHAR(255) DEFAULT 'ALERT R&R Grievances Abstract',
        `chart2_image` VARCHAR(500) DEFAULT '/uploads/GRIEVANCE-ALL.png',
        `chart3_title` VARCHAR(255) DEFAULT 'Land Rights Grievances Classification',
        `chart3_image` VARCHAR(500) DEFAULT '/uploads/LAND-RIGHTS.png',
        `faq_pdf_url` VARCHAR(500) DEFAULT '/uploads/GREIVANCE-FAQ.pdf',
        `faq_pdf_label` VARCHAR(255) DEFAULT 'FAQ PDF',
        `hero_image` VARCHAR(500) NULL,
        `success_title` VARCHAR(255) DEFAULT 'Grievance Registered Successfully',
        `success_desc` TEXT NULL,
        `guidelines_json` LONGTEXT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `categories_json` LONGTEXT NULL"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart1_title` VARCHAR(255) DEFAULT 'Official Grievance Categories Chart'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart1_image` VARCHAR(500) DEFAULT '/uploads/grievance-types.png'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart2_title` VARCHAR(255) DEFAULT 'ALERT R&R Grievances Abstract'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart2_image` VARCHAR(500) DEFAULT '/uploads/GRIEVANCE-ALL.png'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart3_title` VARCHAR(255) DEFAULT 'Land Rights Grievances Classification'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart3_image` VARCHAR(500) DEFAULT '/uploads/LAND-RIGHTS.png'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `faq_pdf_url` VARCHAR(500) DEFAULT '/uploads/GREIVANCE-FAQ.pdf'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `faq_pdf_label` VARCHAR(255) DEFAULT 'FAQ PDF'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `hero_image` VARCHAR(500) NULL"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `success_title` VARCHAR(255) DEFAULT 'Grievance Registered Successfully'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `success_desc` TEXT NULL"); } catch (Exception $e) {}

    $count = (int)$conn->query("SELECT COUNT(*) FROM grievance_page")->fetchColumn();
    if ($count === 0) {
        $stmt = $conn->prepare("INSERT INTO grievance_page 
            (id, badge, title, subtitle, typewriter_json, form_title, form_subtitle, categories_json, full_forms_json, chart1_title, chart1_image, chart2_title, chart2_image, chart3_title, chart3_image, faq_pdf_url, faq_pdf_label, hero_image, success_title, success_desc)
            VALUES (1, :badge, :title, :subtitle, :typewriter_json, :form_title, :form_subtitle, :categories_json, :full_forms_json, :chart1_title, :chart1_image, :chart2_title, :chart2_image, :chart3_title, :chart3_image, :faq_pdf_url, :faq_pdf_label, :hero_image, :success_title, :success_desc)");
        $stmt->execute([
            ':badge' => $defaultPage['badge'],
            ':title' => $defaultPage['title'],
            ':subtitle' => $defaultPage['subtitle'],
            ':typewriter_json' => $defaultPage['typewriter_json'],
            ':form_title' => $defaultPage['form_title'],
            ':form_subtitle' => $defaultPage['form_subtitle'],
            ':categories_json' => $defaultPage['categories_json'],
            ':full_forms_json' => $defaultPage['full_forms_json'],
            ':chart1_title' => $defaultPage['chart1_title'],
            ':chart1_image' => $defaultPage['chart1_image'],
            ':chart2_title' => $defaultPage['chart2_title'],
            ':chart2_image' => $defaultPage['chart2_image'],
            ':chart3_title' => $defaultPage['chart3_title'],
            ':chart3_image' => $defaultPage['chart3_image'],
            ':faq_pdf_url' => $defaultPage['faq_pdf_url'],
            ':faq_pdf_label' => $defaultPage['faq_pdf_label'],
            ':hero_image' => $defaultPage['hero_image'],
            ':success_title' => $defaultPage['success_title'],
            ':success_desc' => $defaultPage['success_desc']
        ]);
    }

    $row = $conn->query("SELECT * FROM grievance_page WHERE id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    $activeGrievance = $row ?: $defaultPage;
    if (empty($activeGrievance['categories_json']) || $activeGrievance['categories_json'] === '[]') {
        $activeGrievance['categories_json'] = $defaultPage['categories_json'];
    }
    if (empty($activeGrievance['full_forms_json']) || $activeGrievance['full_forms_json'] === '[]') {
        $activeGrievance['full_forms_json'] = $defaultPage['full_forms_json'];
    }
    if (empty($activeGrievance['chart1_image'])) $activeGrievance['chart1_image'] = $defaultPage['chart1_image'];
    if (empty($activeGrievance['chart2_image'])) $activeGrievance['chart2_image'] = $defaultPage['chart2_image'];
    if (empty($activeGrievance['chart3_image'])) $activeGrievance['chart3_image'] = $defaultPage['chart3_image'];
    if (empty($activeGrievance['chart1_title'])) $activeGrievance['chart1_title'] = $defaultPage['chart1_title'];
    if (empty($activeGrievance['chart2_title'])) $activeGrievance['chart2_title'] = $defaultPage['chart2_title'];
    if (empty($activeGrievance['chart3_title'])) $activeGrievance['chart3_title'] = $defaultPage['chart3_title'];
    if (empty($activeGrievance['faq_pdf_url'])) $activeGrievance['faq_pdf_url'] = $defaultPage['faq_pdf_url'];
    if (empty($activeGrievance['faq_pdf_label'])) $activeGrievance['faq_pdf_label'] = $defaultPage['faq_pdf_label'];
    if (empty($activeGrievance['success_title'])) $activeGrievance['success_title'] = $defaultPage['success_title'];
    if (empty($activeGrievance['success_desc'])) $activeGrievance['success_desc'] = $defaultPage['success_desc'];

    echo json_encode(["success" => true, "page" => $activeGrievance], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode(["success" => true, "page" => $defaultPage, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

