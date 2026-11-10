<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

// Default initial contact settings
$defaultSettings = [
    "header_badge" => "Section 01",
    "header_title" => "Reach The Head Office",
    "header_subtitle" => "Partnership, volunteer, research and 80G enquiries all reach the same Vijayawada team. Write, call, or send the form below — we answer within two working days.",
    "typewriter_words" => [
        "Headquarters in Vijayawada, Andhra Pradesh",
        "Polavaram Field Operations & Legal Casework",
        "Volunteer, Research & Academic Partnerships",
        "80G Tax-Exempt Donation Queries"
    ],
    "info_badge" => "Get In Touch",
    "info_title" => "We Are Here To Support Adivasi Communities",
    "info_description" => "Reach out to us for collaborations, volunteer opportunities, field visits, or details regarding our Adivasi forest rights and livelihood initiatives.",
    "headquarters_title" => "Headquarters",
    "headquarters_address" => "Door No. 40-9/1-16, Sai Nagar, Near Benz Circle,\nVijayawada - 520010, Andhra Pradesh, India",
    "phone_title" => "Call Us",
    "phone_primary" => "+91 866 2482345",
    "phone_secondary" => "+91 94401 82940",
    "email_title" => "Email Us",
    "email_primary" => "contact@alertngo.in",
    "email_secondary" => "director@alertngo.in",
    "working_hours_title" => "Working Hours",
    "working_hours_weekdays" => "Monday - Saturday: 9:30 AM – 6:00 PM",
    "working_hours_sunday" => "Sunday: Closed (Field Operations Only)",
    "map_enabled" => 1,
    "map_title" => "ALERT NGO Location - Benz Circle, Vijayawada",
    "map_iframe_url" => "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.434316828551!2d80.64801531486427!3d16.50424568861214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fab1e428bc9d%3A0xbcf046cb5d6e2e50!2sBenz%20Circle%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1659000000000!5m2!1sen!2sin",
    "map_height" => "400px",
    "form_title" => "Send Us a Message",
    "form_subtitle" => "Fill out the form below and we will get back to you promptly.",
    "subject_options" => [
        "Partnership & Institutional Collaboration",
        "Volunteer & Student Internship",
        "Field Visit & Academic Research",
        "80G Tax-Exempt Donation Queries",
        "Polavaram PAF / PDF R&R Assistance",
        "RoFR & Tribal Land Legal Casework",
        "Media, Press & Fact-Finding Inquiry",
        "General Inquiry"
    ],
    "branch_offices" => [
        [
            "name" => "Polavaram Field Operations Desk",
            "location" => "Near Project Spillway, Polavaram Mandal, Eluru District",
            "phone" => "+91 94401 82940",
            "contact_person" => "Field Coordinator"
        ],
        [
            "name" => "Agency Rights & Legal Clinic",
            "location" => "ITDA Road, Rampachodavaram, Alluri Sitharama Raju District",
            "phone" => "+91 866 2482345",
            "contact_person" => "Legal Cell Advocate"
        ],
        [
            "name" => "Chinturu Tribal Grievance Center",
            "location" => "Main Road, Chinturu, ASR District, Andhra Pradesh",
            "phone" => "+91 94401 82940",
            "contact_person" => "Community Outreach Lead"
        ]
    ]
];

if (!$conn) {
    echo json_encode(["success" => true, "data" => $defaultSettings, "source" => "fallback"]);
    exit;
}

try {
    // 1. Ensure table contact_settings exists
    $conn->exec("CREATE TABLE IF NOT EXISTS `contact_settings` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `settings_json` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $stmt = $conn->query("SELECT settings_json FROM contact_settings WHERE id = 1 LIMIT 1");
    $row = $stmt ? $stmt->fetch() : null;

    if ($row && !empty($row['settings_json'])) {
        $saved = json_decode($row['settings_json'], true);
        if (is_array($saved)) {
            $merged = array_merge($defaultSettings, $saved);
            echo json_encode(["success" => true, "data" => $merged]);
            exit;
        }
    }

    // Auto-seed if not yet saved
    $initJson = json_encode($defaultSettings, JSON_UNESCAPED_UNICODE);
    $ins = $conn->prepare("INSERT INTO contact_settings (id, settings_json) VALUES (1, ?) ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json)");
    $ins->execute([$initJson]);

    echo json_encode(["success" => true, "data" => $defaultSettings, "source" => "seeded"]);
} catch (Exception $e) {
    echo json_encode(["success" => true, "data" => $defaultSettings, "source" => "exception_fallback", "error" => $e->getMessage()]);
}

