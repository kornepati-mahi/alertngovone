<?php
require_once __DIR__ . '/config.php';

$defaultNews = [
    ["id" => 0, "message" => "Welcome to ALERT — latest announcements and field updates appear here."]
];

if ($conn) {
    try {
        $stmt = $conn->query("SELECT id, message, sort_order FROM flash_news WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        if ($rows && count($rows) > 0) {
            echo json_encode(["success" => true, "data" => $rows]);
            exit;
        }
    } catch (PDOException $e) {
        // Table missing on an old install - fall through to the default message
    }
}

echo json_encode(["success" => true, "data" => $defaultNews]);
