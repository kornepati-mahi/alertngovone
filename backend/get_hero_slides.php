<?php
require_once __DIR__ . '/config.php';

$defaultSlides = [
    ["id" => 1, "image_url" => "/uploads/submergence-area-map-1.jpg", "subtitle" => "Defending Adivasi Forest & Land Rights", "sort_order" => 1],
    ["id" => 2, "image_url" => "/uploads/all2023.jpeg", "subtitle" => "Flood Relief & Emergency Provisioning", "sort_order" => 2],
    ["id" => 3, "image_url" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg", "subtitle" => "Empowering Marginalized Communities", "sort_order" => 3],
    ["id" => 4, "image_url" => "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", "subtitle" => "Revitalizing Gram Sabha Self-Governance", "sort_order" => 4],
    ["id" => 5, "image_url" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", "subtitle" => "Project Green Energy: Solar Future", "sort_order" => 5]
];

if ($conn) {
    try {
        $stmt = $conn->query("SELECT id, image_url, subtitle, sort_order FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        if ($rows && count($rows) > 0) {
            echo json_encode(["success" => true, "data" => $rows]);
            exit;
        }
    } catch (PDOException $e) {
        // Table missing or DB issue - fallback
    }
}

echo json_encode(["success" => true, "data" => $defaultSlides]);
