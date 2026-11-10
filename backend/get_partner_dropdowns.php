<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultDropdowns = [
    [
        "parent_label" => "Partner with us",
        "section" => "Main",
        "label" => "Partner with Us",
        "path" => "/partner",
        "sub_items_json" => "[]",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "parent_label" => "Partner with us",
        "section" => "Grievances",
        "label" => "Grievances",
        "path" => "/grievances",
        "sub_items_json" => json_encode([
            ["label" => "R&R Grievances", "path" => "/abstract"],
            ["label" => "Land Rights Grievance", "path" => "/rr-grievances"],
            ["label" => "Types of Grievances", "path" => "/types-of-grievances"],
            ["label" => "R&R Forms", "path" => "/rr-grievance-full-forms"]
        ], JSON_UNESCAPED_UNICODE),
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "parent_label" => "Partner with us",
        "section" => "Downloads",
        "label" => "Downloads",
        "path" => "/downloads",
        "sub_items_json" => json_encode([
            ["label" => "Legislative Acts", "path" => "/legislative-acts-2"],
            ["label" => "GO's", "path" => "/gos"],
            ["label" => "R&R G.Os", "path" => "/rr-gos"],
            ["label" => "Others", "path" => "/others"]
        ], JSON_UNESCAPED_UNICODE),
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "parent_label" => "Partner with us",
        "section" => "Main",
        "label" => "FAQ’s",
        "path" => "/faqs",
        "sub_items_json" => "[]",
        "sort_order" => 4,
        "is_active" => 1
    ],
    [
        "parent_label" => "Partner with us",
        "section" => "Main",
        "label" => "Quick Links",
        "path" => "/quick-links",
        "sub_items_json" => "[]",
        "sort_order" => 5,
        "is_active" => 1
    ]
];

if (!$conn) {
    echo json_encode(["success" => true, "data" => $defaultDropdowns], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `partner_dropdowns` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `parent_label` VARCHAR(100) NOT NULL DEFAULT 'Partner with us',
        `section` VARCHAR(100) NOT NULL DEFAULT 'Main',
        `label` VARCHAR(150) NOT NULL,
        `path` VARCHAR(255) NOT NULL,
        `sub_items_json` LONGTEXT NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $count = (int)$conn->query("SELECT COUNT(*) FROM partner_dropdowns")->fetchColumn();
    if ($count === 0) {
        $stmt = $conn->prepare("INSERT INTO partner_dropdowns 
            (parent_label, section, label, path, sub_items_json, sort_order, is_active)
            VALUES (:parent_label, :section, :label, :path, :sub_items_json, :sort_order, :is_active)");
        foreach ($defaultDropdowns as $d) {
            $stmt->execute([
                ':parent_label' => $d['parent_label'],
                ':section' => $d['section'],
                ':label' => $d['label'],
                ':path' => $d['path'],
                ':sub_items_json' => $d['sub_items_json'],
                ':sort_order' => $d['sort_order'],
                ':is_active' => $d['is_active']
            ]);
        }
    }

    $all = isset($_GET['all']) && $_GET['all'] === '1';
    $sql = $all ? "SELECT * FROM partner_dropdowns ORDER BY sort_order ASC, id ASC"
                : "SELECT * FROM partner_dropdowns WHERE is_active = 1 ORDER BY sort_order ASC, id ASC";

    $items = $conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $items], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode(["success" => true, "data" => $defaultDropdowns, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

