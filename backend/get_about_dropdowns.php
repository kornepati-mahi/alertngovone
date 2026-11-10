<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultAboutDropdowns = [
    [
        "id" => 1,
        "label" => "About ALERT",
        "path" => "/about",
        "sub_items_json" => "[]",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "id" => 2,
        "label" => "Governing Body",
        "path" => "/governing-body",
        "sub_items_json" => "[]",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "id" => 3,
        "label" => "Vision & Mission",
        "path" => "/vision-mission-2",
        "sub_items_json" => "[]",
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "id" => 4,
        "label" => "Core Values",
        "path" => "/core-values",
        "sub_items_json" => "[]",
        "sort_order" => 4,
        "is_active" => 1
    ],
    [
        "id" => 5,
        "label" => "Org Profile",
        "path" => "/organizational-profile",
        "sub_items_json" => "[]",
        "sort_order" => 5,
        "is_active" => 1
    ],
    [
        "id" => 6,
        "label" => "Organogram",
        "path" => "/organogram",
        "sub_items_json" => "[]",
        "sort_order" => 6,
        "is_active" => 1
    ],
    [
        "id" => 7,
        "label" => "ALERT Policies",
        "path" => "/alert-policies",
        "sub_items_json" => "[]",
        "sort_order" => 7,
        "is_active" => 1
    ],
    [
        "id" => 8,
        "label" => "Area of Operation",
        "path" => "/area-of-operation",
        "sub_items_json" => "[]",
        "sort_order" => 8,
        "is_active" => 1
    ]
];

if (!$conn) {
    echo json_encode(["success" => true, "data" => $defaultAboutDropdowns], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `about_dropdowns` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `label` VARCHAR(150) NOT NULL,
        `path` VARCHAR(255) NOT NULL,
        `parent_id` INT NULL DEFAULT NULL,
        `sub_items_json` LONGTEXT NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try {
        $conn->exec("ALTER TABLE `about_dropdowns` ADD COLUMN `parent_id` INT NULL DEFAULT NULL AFTER `path`");
    } catch (Exception $ignored) {}

    // Seed defaults if table is empty
    $count = (int)$conn->query("SELECT COUNT(*) FROM `about_dropdowns`")->fetchColumn();
    if ($count === 0) {
        $insert = $conn->prepare("INSERT INTO `about_dropdowns` (`label`, `path`, `sub_items_json`, `sort_order`, `is_active`) VALUES (:label, :path, :sub_items_json, :sort_order, :is_active)");
        foreach ($defaultAboutDropdowns as $d) {
            $insert->execute([
                ':label' => $d['label'],
                ':path' => $d['path'],
                ':sub_items_json' => $d['sub_items_json'] ?? '[]',
                ':sort_order' => $d['sort_order'],
                ':is_active' => $d['is_active']
            ]);
        }
    }

    $stmt = $conn->query("SELECT * FROM `about_dropdowns` WHERE `is_active` = 1 ORDER BY `sort_order` ASC, `id` ASC");
    $items = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

    if (empty($items)) {
        $items = $defaultAboutDropdowns;
    }

    echo json_encode(["success" => true, "data" => $items], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(["success" => true, "data" => $defaultAboutDropdowns, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

