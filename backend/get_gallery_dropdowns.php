<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultDropdowns = [
    ["section" => "Photos & Images", "label" => "All Photos", "path" => "/gallery-9?filter=Photos", "sort_order" => 1],
    ["section" => "Photos & Images", "label" => "Community & Forest Rights", "path" => "/gallery-9?filter=Photos&cat=Community", "sort_order" => 2],
    ["section" => "Photos & Images", "label" => "Flood Relief & Operations", "path" => "/gallery-9?filter=Photos&cat=Relief", "sort_order" => 3],
    ["section" => "Photos & Images", "label" => "Education & Livelihood", "path" => "/gallery-9?filter=Photos&cat=Education", "sort_order" => 4],
    
    ["section" => "Field Videos", "label" => "All Videos", "path" => "/gallery-9?filter=Videos", "sort_order" => 5],
    ["section" => "Field Videos", "label" => "Field Reels & Stories", "path" => "/gallery-9?filter=Videos", "sort_order" => 6],
    ["section" => "Field Videos", "label" => "Community & Youth Videos", "path" => "/gallery-9?filter=Videos&cat=Education", "sort_order" => 7],

    ["section" => "Events & Albums", "label" => "All Event Media", "path" => "/gallery-9?cat=Events", "sort_order" => 8],
    ["section" => "Events & Albums", "label" => "Event Photos", "path" => "/gallery-9?cat=Events&filter=Photos", "sort_order" => 9],
    ["section" => "Events & Albums", "label" => "Event Videos", "path" => "/gallery-9?cat=Events&filter=Videos", "sort_order" => 10],
    ["section" => "Events & Albums", "label" => "Conferences & Conventions", "path" => "/gallery-9?cat=Events", "sort_order" => 11],
];

$items = [];

if ($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS `gallery_dropdowns` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `parent_label` VARCHAR(100) NOT NULL DEFAULT 'Videos & Images',
            `section` VARCHAR(100) NOT NULL DEFAULT 'Photos & Images',
            `label` VARCHAR(150) NOT NULL,
            `path` VARCHAR(255) NOT NULL,
            `sort_order` INT DEFAULT 0,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = (int)$conn->query("SELECT COUNT(*) FROM gallery_dropdowns")->fetchColumn();
        if ($count === 0) {
            $stmt = $conn->prepare("INSERT INTO gallery_dropdowns (parent_label, section, label, path, sort_order, is_active) VALUES ('Videos & Images', ?, ?, ?, ?, 1)");
            $order = 1;
            foreach ($defaultDropdowns as $d) {
                $stmt->execute([$d['section'], $d['label'], $d['path'], $order++]);
            }
        }

        $stmt = $conn->query("SELECT * FROM gallery_dropdowns WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $items = [];
    }
}

if (empty($items)) {
    $items = $defaultDropdowns;
}

// Group by section
$grouped = [];
foreach ($items as $it) {
    $sec = $it['section'] ?? 'Photos & Images';
    if (!isset($grouped[$sec])) {
        $grouped[$sec] = [];
    }
    $grouped[$sec][] = $it;
}

echo json_encode([
    "success" => true,
    "total" => count($items),
    "data" => $items,
    "grouped" => $grouped
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

