<?php
require_once __DIR__ . '/config.php';

$defaultFeatures = [
    [
        "id" => 1,
        "title" => "Our Work",
        "description" => "ALERT, established in 2004, specializes in empowering Adivasis in the Fifth Scheduled Areas of Andhra Pradesh through rights-based approaches.",
        "link_url" => "/about",
        "icon_name" => "university",
        "is_active" => 1,
        "sort_order" => 1
    ],
    [
        "id" => 2,
        "title" => "Our Vision",
        "description" => "Empowerment of socially excluded and marginalized communities towards prosperity and peace through constitutional rights-based development.",
        "link_url" => "/about",
        "icon_name" => "note",
        "is_active" => 1,
        "sort_order" => 2
    ],
    [
        "id" => 3,
        "title" => "Our Mission",
        "description" => "To awaken, sensitize, organize and mobilize Adivasi communities for Self-governance, self-reliance, and sustainable environment.",
        "link_url" => "/about",
        "icon_name" => "cloud",
        "is_active" => 1,
        "sort_order" => 3
    ]
];

if ($conn) {
    try {
        $stmt = $conn->query("SELECT id, title, description, link_url, icon_name, is_active, sort_order FROM home_features WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        if ($rows && count($rows) > 0) {
            echo json_encode(["success" => true, "data" => $rows]);
            exit;
        }
    } catch (PDOException $e) {
        // Fallback if table missing
    }
}

echo json_encode(["success" => true, "data" => $defaultFeatures]);
