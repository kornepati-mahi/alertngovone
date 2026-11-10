<?php
require_once __DIR__ . '/config.php';

$defaultRegions = [
    [
        "id" => 1,
        "title" => "ASR Hill Agency",
        "tag" => "Rampachodavaram & Chinturu ITDAs",
        "description" => "PESA Gram Sabha sovereignty, community forest rights (CFR) and individual forest pattas across the Eastern Ghats agency mandals.",
        "mandals" => "6 mandals",
        "tribes" => "Koya · Konda Reddi (PVTG) · Valmiki",
        "stat" => "6 Mandals",
        "image_url" => "/uploads/region-asr-culture.jpg",
        "alt_text" => "Adivasi cultural gathering in the agency hills",
        "accent" => "#3E8E0F",
        "icon_name" => "tree",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "id" => 2,
        "title" => "Eluru Agency & Polavaram",
        "tag" => "K.R. Puram ITDA · Dam Belt",
        "description" => "LTR 1/70 land restitution, fair RFCTLARR compensation and rehabilitation support for families facing Polavaram submergence.",
        "mandals" => "5 mandals · 371 habitations",
        "tribes" => "Koya · Konda Dora · Nayaks",
        "stat" => "371 Habitations",
        "image_url" => "/uploads/submergence-area-map-1.jpg",
        "alt_text" => "Polavaram submergence contour map along the Godavari",
        "accent" => "#D97706",
        "icon_name" => "water",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "id" => 3,
        "title" => "Coastal Krishna Belt",
        "tag" => "Machilipatnam Coastal Cell",
        "description" => "Land and housing entitlements for nomadic Yenadi families, the Matsya Mithra women's fisheries federation, and mangrove resilience.",
        "mandals" => "6 coastal mandals",
        "tribes" => "Yenadi · Fisher communities",
        "stat" => "3,500+ Women",
        "image_url" => "/uploads/coastal-krishna-fishing.jpg",
        "alt_text" => "Traditional fishing crews on the Krishna coast",
        "accent" => "#0ea5e9",
        "icon_name" => "fish",
        "sort_order" => 3,
        "is_active" => 1
    ]
];

if ($conn) {
    try {
        $stmt = $conn->query("SELECT id, title, tag, description, mandals, tribes, stat, image_url, alt_text, accent, icon_name, sort_order, is_active FROM regions WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        if ($rows && count($rows) > 0) {
            echo json_encode(["success" => true, "data" => $rows]);
            exit;
        }
    } catch (PDOException $e) {
        // Fallback
    }
}

echo json_encode(["success" => true, "data" => $defaultRegions]);
