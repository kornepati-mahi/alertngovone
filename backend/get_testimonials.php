<?php
require_once __DIR__ . '/config.php';

$defaultHeader = [
    "badge" => "Testimonials",
    "title" => "Voices from the Community",
    "google_reviews_title" => "Google Reviews",
    "google_reviews_subtitle" => "See what our community says on Google",
    "google_reviews_url" => "https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews",
    "google_rating" => 5.0,
    "show_google_badge" => 1
];

$defaultTestimonials = [
    [
        "id" => 1,
        "name" => "Ramaiah G.",
        "role" => "Village Leader, Khammam District",
        "text" => "ALERT has transformed our village. We finally have our forest rights documents and can access the forest resources that belong to us.",
        "avatar" => null,
        "avatar_color" => "#D2190C",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "id" => 2,
        "name" => "Lakshmi Devi",
        "role" => "Matsya Mithra Group Member",
        "text" => "Thanks to ALERT's women cooperative, I can now earn independently through fishing. My children are in school and our lives have changed.",
        "avatar" => null,
        "avatar_color" => "#3E8E0F",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "id" => 3,
        "name" => "Venkat Rao",
        "role" => "Tribal Community Member",
        "text" => "The solar poles installed by ALERT mean our children can study at night. Education opportunities have improved dramatically.",
        "avatar" => null,
        "avatar_color" => "#F5A623",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "id" => 4,
        "name" => "Sanna Koya",
        "role" => "Gram Sabha Member, ASR Agency",
        "text" => "Our Gram Sabha finally has the powers the PESA Act promised. Decisions about our forests are made in the village, not in an office far away.",
        "avatar" => null,
        "avatar_color" => "#005696",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 4,
        "is_active" => 1
    ],
    [
        "id" => 5,
        "name" => "Mutta Raju",
        "role" => "Flood-Affected Farmer, Eluru Agency",
        "text" => "When the Godavari flooded, ALERT's boat reached us with rice, water and medicines before any other help arrived.",
        "avatar" => null,
        "avatar_color" => "#7B1FA2",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 5,
        "is_active" => 1
    ],
    [
        "id" => 6,
        "name" => "Durgamma P.",
        "role" => "Matsya Mithra Federation Member",
        "text" => "The Matsya Mithra cooperative gave fisherwomen in our village a collective voice, better prices and a steady income.",
        "avatar" => null,
        "avatar_color" => "#C2185B",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 6,
        "is_active" => 1
    ],
    [
        "id" => 7,
        "name" => "Ravi Kumar",
        "role" => "Digital Learning Student, Khammam",
        "text" => "I learned to use a computer for the first time at the ALERT learning centre. Now I help my younger sister with her schoolwork.",
        "avatar" => null,
        "avatar_color" => "#00796B",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 7,
        "is_active" => 1
    ],
    [
        "id" => 8,
        "name" => "Meenakshi V.",
        "role" => "Parent, Rampachodavaram ITDA",
        "text" => "The school kit my children received at the start of the year meant they could attend class with everything they needed.",
        "avatar" => null,
        "avatar_color" => "#E64A19",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 8,
        "is_active" => 1
    ],
    [
        "id" => 9,
        "name" => "Buchamma K.",
        "role" => "Community Forest Rights Holder",
        "text" => "With ALERT's legal support our village filed for community forest rights together. The title is in the name of the whole community.",
        "avatar" => null,
        "avatar_color" => "#388E3C",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 9,
        "is_active" => 1
    ],
    [
        "id" => 10,
        "name" => "Prasad Naidu",
        "role" => "Project Displaced Family, Polavaram Belt",
        "text" => "ALERT helped our family understand the rehabilitation package we were owed and follow up until the papers were cleared.",
        "avatar" => null,
        "avatar_color" => "#512DA8",
        "rating" => 5,
        "source" => "Google",
        "sort_order" => 10,
        "is_active" => 1
    ]
];

if ($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS home_testimonials_header (
            id INT AUTO_INCREMENT PRIMARY KEY,
            badge VARCHAR(100) DEFAULT 'Testimonials',
            title VARCHAR(255) DEFAULT 'Voices from the Community',
            google_reviews_title VARCHAR(150) DEFAULT 'Google Reviews',
            google_reviews_subtitle VARCHAR(255) DEFAULT 'See what our community says on Google',
            google_reviews_url VARCHAR(500) DEFAULT 'https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews',
            google_rating DECIMAL(2,1) DEFAULT 5.0,
            show_google_badge TINYINT(1) DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $conn->exec("CREATE TABLE IF NOT EXISTS home_testimonials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            role VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            avatar LONGTEXT NULL,
            avatar_color VARCHAR(50) DEFAULT '#D2190C',
            rating INT DEFAULT 5,
            source VARCHAR(50) DEFAULT 'Google',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Seed header
        $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_testimonials_header")->fetchColumn();
        if ($hCount === 0) {
            $stmtH = $conn->prepare("INSERT INTO home_testimonials_header (badge, title, google_reviews_title, google_reviews_subtitle, google_reviews_url, google_rating, show_google_badge) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmtH->execute([
                $defaultHeader['badge'],
                $defaultHeader['title'],
                $defaultHeader['google_reviews_title'],
                $defaultHeader['google_reviews_subtitle'],
                $defaultHeader['google_reviews_url'],
                $defaultHeader['google_rating'],
                $defaultHeader['show_google_badge']
            ]);
        }

        // Seed testimonials
        $tCount = (int)$conn->query("SELECT COUNT(*) FROM home_testimonials")->fetchColumn();
        if ($tCount === 0) {
            $stmtT = $conn->prepare("INSERT INTO home_testimonials (name, role, text, avatar, avatar_color, rating, source, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaultTestimonials as $dt) {
                $stmtT->execute([
                    $dt['name'],
                    $dt['role'],
                    $dt['text'],
                    $dt['avatar'],
                    $dt['avatar_color'],
                    $dt['rating'],
                    $dt['source'],
                    $dt['sort_order'],
                    $dt['is_active']
                ]);
            }
        }

        $headerRow = $conn->query("SELECT badge, title, google_reviews_title, google_reviews_subtitle, google_reviews_url, google_rating, show_google_badge FROM home_testimonials_header ORDER BY id DESC LIMIT 1")->fetch();
        $finalHeader = $headerRow ? array_merge($defaultHeader, $headerRow) : $defaultHeader;
        if (isset($finalHeader['show_google_badge'])) {
            $finalHeader['show_google_badge'] = (int)$finalHeader['show_google_badge'];
        }
        if (isset($finalHeader['google_rating'])) {
            $finalHeader['google_rating'] = (float)$finalHeader['google_rating'];
        }

        $stmt = $conn->query("SELECT id, name, role, text, avatar, avatar_color, rating, source, sort_order, is_active FROM home_testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
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
    "data" => $defaultTestimonials,
    "header" => $defaultHeader
]);
