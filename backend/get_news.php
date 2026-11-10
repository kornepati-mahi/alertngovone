<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultNews = [
    [
        "title" => "Godavari Flood Relief 2023: Emergency Rations & Medical Kits to 4,200 Displaced Families",
        "date" => "September 2023",
        "category" => "relief",
        "tag" => "Flood Relief 2023",
        "img" => "/uploads/all2023.jpeg",
        "excerpt" => "ALERT mobilized field teams across flood-hit habitations of Alluri Sitharama Raju and Eluru districts, deploying mechanized boats to supply rice, lentils, drinking water, and sanitary kits to cut-off Adivasi hamlets."
    ],
    [
        "title" => "Flood Relief Operations 2022: Multi-Mandal Relief Mission Across Submergence Habitations",
        "date" => "October 2022",
        "category" => "relief",
        "tag" => "Flood Relief 2022",
        "img" => "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg",
        "excerpt" => "Field caseworkers distributed comprehensive ration packets and hygiene supplies to families displaced by heavy Godavari river spillage in Kunavaram, VR Puram, and Chintoor mandals."
    ],
    [
        "title" => "Flood Relief Operations 2021: Rescue Boat Deployment & Essential Services in Hill Tracts",
        "date" => "August 2021",
        "category" => "relief",
        "tag" => "Flood Relief 2021",
        "img" => "/uploads/ramavarampadu_11-08-2021-1024x461-640x480.jpeg",
        "excerpt" => "During peak Godavari inundation reaching 45+ meters, ALERT rescue teams accessed 18 marooned hill settlements, distributing dry rations and potable drinking water."
    ],
    [
        "title" => "Winter Blanket Distribution Drive: High-Altitude Tribal Hamlets of East Godavari",
        "date" => "December 2022",
        "category" => "winter",
        "tag" => "Winter Relief",
        "img" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
        "excerpt" => "Distributed over 2,800 thermal fleece blankets to elderly Adivasis and nursing mothers across isolated habitations in Rampachodavaram agency area."
    ],
    [
        "title" => "Emergency Food & Essential Groceries Distribution in West Godavari Flood Tracts",
        "date" => "September 2021",
        "category" => "groceries",
        "tag" => "Groceries Distribution",
        "img" => "/uploads/Kotarugommu-18-9-21-1-rotated-1-1024x461-640x480.jpeg",
        "excerpt" => "Comprehensive door-to-door grocery delivery providing rice, pulses, cooking oil, spices, and soap kits for submerged households in Polavaram and Buttayagudem mandals."
    ],
    [
        "title" => "Project Green Energy: 75+ Solar Street Poles Erected in Remote Scheduled Hamlets",
        "date" => "November 2023",
        "category" => "energy",
        "tag" => "Green Energy",
        "img" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
        "excerpt" => "Transitioning isolated forest hamlets away from dangerous kerosene lighting through decentralized, standalone solar street poles and solar household lanterns."
    ]
];

if (!$conn) {
    echo json_encode([
        "success" => true,
        "total" => count($defaultNews),
        "data" => $defaultNews
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

try {
    $tableExists = $conn->query("SHOW TABLES LIKE 'news_articles'")->rowCount() > 0;
    if (!$tableExists) {
        echo json_encode([
            "success" => true,
            "total" => count($defaultNews),
            "data" => $defaultNews
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $sql = "SELECT id, title, date, category, tag, img, excerpt, details, link_url FROM news_articles WHERE is_active = 1";
    $params = [];

    if ($category !== '' && strtolower($category) !== 'all') {
        $sql .= " AND (category = ? OR tag LIKE ?)";
        $params[] = $category;
        $params[] = '%' . $category . '%';
    }

    $sql .= " ORDER BY sort_order ASC, id DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    if (empty($rows)) {
        echo json_encode([
            "success" => true,
            "total" => count($defaultNews),
            "data" => $defaultNews
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $data = [];
    foreach ($rows as $r) {
        $data[] = [
            "id" => (int)$r['id'],
            "title" => $r['title'],
            "date" => $r['date'],
            "category" => $r['category'],
            "tag" => $r['tag'],
            "img" => $r['img'] ?? '',
            "excerpt" => $r['excerpt'],
            "details" => $r['details'] ?? '',
            "link_url" => $r['link_url'] ?? '/contact'
        ];
    }

    echo json_encode([
        "success" => true,
        "total" => count($data),
        "data" => $data
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        "success" => true,
        "total" => count($defaultNews),
        "data" => $defaultNews
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
