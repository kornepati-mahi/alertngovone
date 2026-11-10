<?php
require_once __DIR__ . '/config.php';

$defaultHeader = [
    "badge" => "Instagram",
    "title" => "Stories from the Field",
    "subtitle" => "Short videos from our work across Andhra Pradesh — follow us for the latest from the communities we serve.",
    "profile_handle" => "alert.ngo",
    "profile_meta" => "@alert.ngo · Instagram",
    "profile_bio" => "Adivasi rights, forest governance & women's collectives across Andhra Pradesh.",
    "profile_url" => "https://www.instagram.com/alert.ngo/",
    "avatar_url" => "/uploads/alert-logo-transparent-cropped-removebg-preview-2.png"
];

$defaultReels = [
    [
        "id" => 1,
        "label" => "Reel 1",
        "duration" => "0:08",
        "topic" => "Culture & Identity",
        "title" => "Dhimsa dance at a community gathering",
        "img" => "/uploads/reels/reel-1-dhimsa.jpg",
        "image_url" => "/uploads/reels/reel-1-dhimsa.jpg",
        "video" => "/uploads/reels/reel-1-dhimsa.mp4",
        "video_url" => "/uploads/reels/reel-1-dhimsa.mp4",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "id" => 2,
        "label" => "Reel 2",
        "duration" => "0:08",
        "topic" => "Education",
        "title" => "Digital learning reaches agency schools",
        "img" => "/uploads/reels/reel-2-learning.jpg",
        "image_url" => "/uploads/reels/reel-2-learning.jpg",
        "video" => "/uploads/reels/reel-2-learning.mp4",
        "video_url" => "/uploads/reels/reel-2-learning.mp4",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "id" => 3,
        "label" => "Reel 3",
        "duration" => "0:08",
        "topic" => "Child Support",
        "title" => "School kits for children in hill villages",
        "img" => "/uploads/reels/reel-3-school-kits.jpg",
        "image_url" => "/uploads/reels/reel-3-school-kits.jpg",
        "video" => "/uploads/reels/reel-3-school-kits.mp4",
        "video_url" => "/uploads/reels/reel-3-school-kits.mp4",
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "id" => 4,
        "label" => "Reel 4",
        "duration" => "0:08",
        "topic" => "Women's Collectives",
        "title" => "Yenadi women's federation convention",
        "img" => "/uploads/reels/reel-4-women.jpg",
        "image_url" => "/uploads/reels/reel-4-women.jpg",
        "video" => "/uploads/reels/reel-4-women.mp4",
        "video_url" => "/uploads/reels/reel-4-women.mp4",
        "sort_order" => 4,
        "is_active" => 1
    ]
];

if ($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS home_reels_header (
            id INT AUTO_INCREMENT PRIMARY KEY,
            badge VARCHAR(100) DEFAULT 'Instagram',
            title VARCHAR(255) DEFAULT 'Stories from the Field',
            subtitle TEXT,
            profile_handle VARCHAR(100) DEFAULT 'alert.ngo',
            profile_meta VARCHAR(150) DEFAULT '@alert.ngo · Instagram',
            profile_bio TEXT,
            profile_url VARCHAR(255) DEFAULT 'https://www.instagram.com/alert.ngo/',
            avatar_url VARCHAR(255) DEFAULT '/uploads/alert-logo-transparent-cropped-removebg-preview-2.png',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $conn->exec("CREATE TABLE IF NOT EXISTS home_reels (
            id INT AUTO_INCREMENT PRIMARY KEY,
            label VARCHAR(100) NOT NULL,
            duration VARCHAR(50) DEFAULT '0:15',
            topic VARCHAR(150) NOT NULL,
            title VARCHAR(255) NOT NULL,
            img LONGTEXT NOT NULL,
            video LONGTEXT NOT NULL,
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Seed header
        $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_reels_header")->fetchColumn();
        if ($hCount === 0) {
            $stmtH = $conn->prepare("INSERT INTO home_reels_header (badge, title, subtitle, profile_handle, profile_meta, profile_bio, profile_url, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmtH->execute([
                $defaultHeader['badge'],
                $defaultHeader['title'],
                $defaultHeader['subtitle'],
                $defaultHeader['profile_handle'],
                $defaultHeader['profile_meta'],
                $defaultHeader['profile_bio'],
                $defaultHeader['profile_url'],
                $defaultHeader['avatar_url']
            ]);
        }

        // Seed reels
        $rCount = (int)$conn->query("SELECT COUNT(*) FROM home_reels")->fetchColumn();
        if ($rCount === 0) {
            $stmtR = $conn->prepare("INSERT INTO home_reels (label, duration, topic, title, img, video, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaultReels as $dr) {
                $stmtR->execute([
                    $dr['label'],
                    $dr['duration'],
                    $dr['topic'],
                    $dr['title'],
                    $dr['img'],
                    $dr['video'],
                    $dr['sort_order'],
                    $dr['is_active']
                ]);
            }
        }

        $headerRow = $conn->query("SELECT badge, title, subtitle, profile_handle, profile_meta, profile_bio, profile_url, avatar_url FROM home_reels_header ORDER BY id DESC LIMIT 1")->fetch();
        $finalHeader = $headerRow ? array_merge($defaultHeader, $headerRow) : $defaultHeader;

        $stmt = $conn->query("SELECT id, label, duration, topic, title, img, video, img as image_url, video as video_url, sort_order, is_active FROM home_reels WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
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
        // Fallback
    }
}

echo json_encode([
    "success" => true,
    "data" => $defaultReels,
    "header" => $defaultHeader
]);
