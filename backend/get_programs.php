<?php
require_once __DIR__ . '/config.php';

$defaultHeader = [
    "badge" => "What We Do",
    "title" => "Our Key Programs",
    "subtitle" => "Comprehensive programs addressing the needs of Adivasi and marginalized communities"
];

$defaultPrograms = [
    [
        "id" => 1,
        "title" => "Forest Rights & Land Advocacy",
        "category" => "Forest Rights",
        "description" => "Securing individual (IFR) and community forest rights (CFR) for Adivasi families under the Forest Rights Act, protecting thousands of acres.",
        "image_url" => "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg",
        "link_url" => "/programs",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "id" => 2,
        "title" => "Self-Governance & PESA Act",
        "category" => "Governance",
        "description" => "Mobilizing Adivasi communities for self-governance through Gram Sabha empowerment and PESA Act implementation.",
        "image_url" => "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
        "link_url" => "/programs",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "id" => 3,
        "title" => "Land Acquisition & R&R Advocacy",
        "category" => "Polavaram PIP",
        "description" => "Defending rights of 1,05,000+ Project Displaced Families across 371 habitations under the RFCTLARR Act 2013.",
        "image_url" => "/uploads/submergence-area-map-1.jpg",
        "link_url" => "/programs",
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "id" => 4,
        "title" => "Matsya Mithra Women Federation",
        "category" => "Empowerment",
        "description" => "Forming and strengthening women-led cooperatives for Yenadi tribal women across 6 coastal mandals of Krishna District.",
        "image_url" => "/uploads/PHOTO-2023-02-15-19-21-00_1.jpg",
        "link_url" => "/programs",
        "sort_order" => 4,
        "is_active" => 1
    ],
    [
        "id" => 5,
        "title" => "Godavari Flood Relief Missions",
        "category" => "Disaster Relief",
        "description" => "Essential grocery provisions, rescue boat operations, and emergency supplies to flood-affected Adivasi communities.",
        "image_url" => "/uploads/all2023.jpeg",
        "link_url" => "/programs",
        "sort_order" => 5,
        "is_active" => 1
    ],
    [
        "id" => 6,
        "title" => "Project Green Energy: Solar Lighting",
        "category" => "Clean Energy",
        "description" => "Installing solar street poles and distributing solar home lanterns in remote off-grid tribal villages.",
        "image_url" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
        "link_url" => "/programs",
        "sort_order" => 6,
        "is_active" => 1
    ]
];

if ($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS home_programs_header (
            id INT AUTO_INCREMENT PRIMARY KEY,
            badge VARCHAR(100) DEFAULT 'What We Do',
            title VARCHAR(255) DEFAULT 'Our Key Programs',
            subtitle TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $conn->exec("CREATE TABLE IF NOT EXISTS home_programs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            image_url LONGTEXT NOT NULL,
            link_url VARCHAR(255) DEFAULT '/programs',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Seed header if empty
        $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_programs_header")->fetchColumn();
        if ($hCount === 0) {
            $stmtH = $conn->prepare("INSERT INTO home_programs_header (badge, title, subtitle) VALUES (?, ?, ?)");
            $stmtH->execute([$defaultHeader['badge'], $defaultHeader['title'], $defaultHeader['subtitle']]);
        }

        // Seed programs if empty
        $pCount = (int)$conn->query("SELECT COUNT(*) FROM home_programs")->fetchColumn();
        if ($pCount === 0) {
            $stmtP = $conn->prepare("INSERT INTO home_programs (title, category, description, image_url, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaultPrograms as $dp) {
                $stmtP->execute([
                    $dp['title'],
                    $dp['category'],
                    $dp['description'],
                    $dp['image_url'],
                    $dp['link_url'],
                    $dp['sort_order'],
                    $dp['is_active']
                ]);
            }
        }

        // Fetch header
        $headerRow = $conn->query("SELECT badge, title, subtitle FROM home_programs_header ORDER BY id DESC LIMIT 1")->fetch();
        $finalHeader = $headerRow ? [
            "badge" => $headerRow['badge'] ?: $defaultHeader['badge'],
            "title" => $headerRow['title'] ?: $defaultHeader['title'],
            "subtitle" => $headerRow['subtitle'] ?: $defaultHeader['subtitle']
        ] : $defaultHeader;

        // Fetch programs
        $stmt = $conn->query("SELECT id, title, category, description, image_url, link_url, sort_order, is_active FROM home_programs WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();

        if ($rows && count($rows) > 0) {
            echo json_encode([
                "success" => true,
                "data" => $rows,
                "header" => $finalHeader
            ]);
            exit;
        }
    } catch (PDOException $e) {
        // Fallback to default array
    }
}

echo json_encode([
    "success" => true,
    "data" => $defaultPrograms,
    "header" => $defaultHeader
]);
