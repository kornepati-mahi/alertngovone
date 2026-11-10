<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultGallery = [
    ["src" => "/uploads/reels/reel-1-dhimsa.mp4", "poster" => "/uploads/reels/reel-1-dhimsa.jpg", "type" => "video", "duration" => "0:08", "title" => "Dhimsa Dance at a Community Gathering", "cat" => "Community"],
    ["src" => "/uploads/reels/reel-2-learning.mp4", "poster" => "/uploads/reels/reel-2-learning.jpg", "type" => "video", "duration" => "0:08", "title" => "Digital Learning Reaches Agency Schools", "cat" => "Education"],
    ["src" => "/uploads/reels/reel-3-school-kits.mp4", "poster" => "/uploads/reels/reel-3-school-kits.jpg", "type" => "video", "duration" => "0:08", "title" => "School Kits for Children in Hill Villages", "cat" => "Education"],
    ["src" => "/uploads/reels/reel-4-women.mp4", "poster" => "/uploads/reels/reel-4-women.jpg", "type" => "video", "duration" => "0:08", "title" => "Yenadi Women's Federation Convention", "cat" => "Women"],
    ["src" => "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", "title" => "Adivasi Community Meeting & Rights Dialogue", "cat" => "Community", "type" => "image"],
    ["src" => "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg", "title" => "Gram Sabha Forest Rights Documentation", "cat" => "Forest Rights", "type" => "image"],
    ["src" => "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg", "title" => "Tribal Elders Council Resolution", "cat" => "Community", "type" => "image"],
    ["src" => "/uploads/PHOTO-2023-02-15-19-20-56.jpg", "title" => "Field Survey in Polavaram Basin", "cat" => "Field Work", "type" => "image"],
    ["src" => "/uploads/PHOTO-2023-02-15-19-21-00_1.jpg", "title" => "Women Livelihood Group Discussion", "cat" => "Women", "type" => "image"],
    ["src" => "/uploads/laptop1.jpeg", "title" => "Digital Literacy & Youth Skill Training", "cat" => "Education", "type" => "image"],
    ["src" => "/uploads/lp.jpeg", "title" => "Computer Lab & Online Grievance Filing", "cat" => "Education", "type" => "image"],
    ["src" => "/uploads/lp2.jpeg", "title" => "Youth Community Informatics Workshop", "cat" => "Education", "type" => "image"],
    ["src" => "/uploads/l-1.jpg", "title" => "Ashram School Children Digital Education", "cat" => "Education", "type" => "image"],
    ["src" => "/uploads/lp3.jpeg", "title" => "Skill Certification in Tribal Mandal", "cat" => "Education", "type" => "image"],
    ["src" => "/uploads/DR.png", "title" => "Disaster Relief Operations & Provisioning", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/DR2.png", "title" => "Essential Food Ration Distribution", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/FR.png", "title" => "Flood Water Rescue & Hamlets Support", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/PL.png", "title" => "Polavaram Resettlement Colony Inspection", "cat" => "Field Work", "type" => "image"],
    ["src" => "/uploads/fire1-1.jpg", "title" => "Solar Micro-Grid & Lantern Commissioning", "cat" => "Energy", "type" => "image"],
    ["src" => "/uploads/fire3-1.jpg", "title" => "Solar Street Pole Erection Drive", "cat" => "Energy", "type" => "image"],
    ["src" => "/uploads/firee-1.jpg", "title" => "Evening Lighting in Off-Grid Hamlet", "cat" => "Energy", "type" => "image"],
    ["src" => "/uploads/fire4-1.jpg", "title" => "Clean Energy Transition Workshop", "cat" => "Energy", "type" => "image"],
    ["src" => "/uploads/fire5-1.jpg", "title" => "Community Solar Battery Maintenance", "cat" => "Energy", "type" => "image"],
    ["src" => "/uploads/fire6-1.jpg", "title" => "Renewable Energy Celebration in Tribal Village", "cat" => "Energy", "type" => "image"],
    ["src" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg", "title" => "Flood Affected Families Evacuation Base", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/WhatsApp-Image-2021-08-23-at-11.23.52-AM-1024x768.jpeg", "title" => "Emergency Medical Kit Handover", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg", "title" => "Relief Boat Launch in Godavari Basin", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/PHOTO-2022-10-20-17-25-30.jpg", "title" => "Dry Provisions Distribution in Cut-Off Village", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/The-formation-Meeting-of-Yanadi-Girijana-Women-fisheries-COOP-at-Machilipatnam-mandal-in-Krishna-District-150x150.jpg", "title" => "Yanadi Girijana Women Fisheries Cooperative Formation", "cat" => "Women", "type" => "image"],
    ["src" => "/uploads/Children-reieved-shoes-1.jpg", "title" => "Tribal Ashram School Children Footwear & Education Drive", "cat" => "Education", "type" => "image"],
    ["src" => "/uploads/Love-then-Serve.jpg", "title" => "Love Then Serve: Community Elders Convocation", "cat" => "Community", "type" => "image"],
    ["src" => "/uploads/Kotarugommu-18-9-21-1-rotated-1-1024x461-640x480.jpeg", "title" => "Kotarugommu Flood Relief Field Intervention", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/ramavarampadu_11-08-2021-1024x461-640x480.jpeg", "title" => "Ramavarampadu Emergency Provisioning Camp", "cat" => "Relief", "type" => "image"],
    ["src" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", "title" => "Decentralized Solar System Testing in Habitation", "cat" => "Energy", "type" => "image"],
    ["src" => "/uploads/all2023.jpeg", "title" => "Godavari Flood Relief Unified Operation Base", "cat" => "Relief", "type" => "image"],
    // Event Photos & Videos
    ["src" => "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", "title" => "Adivasi Mahasabha State Leadership Convention", "cat" => "Events", "type" => "image", "description" => "State-level leadership convention uniting tribal village elders, sarpanches and community advocates."],
    ["src" => "/uploads/reels/reel-1-dhimsa.mp4", "poster" => "/uploads/reels/reel-1-dhimsa.jpg", "type" => "video", "duration" => "0:08", "title" => "Dhimsa Cultural Dance at Annual Tribal Festival", "cat" => "Events", "description" => "Traditional Dhimsa community dance presented during the annual cultural conclave."],
    ["src" => "/uploads/The-formation-Meeting-of-Yanadi-Girijana-Women-fisheries-COOP-at-Machilipatnam-mandal-in-Krishna-District-150x150.jpg", "title" => "Yanadi Women Fisheries Cooperative Annual General Meeting", "cat" => "Events", "type" => "image", "description" => "General body meeting and charter presentation for women fisheries federation."],
    ["src" => "/uploads/reels/reel-4-women.mp4", "poster" => "/uploads/reels/reel-4-women.jpg", "type" => "video", "duration" => "0:08", "title" => "Women Federation Empowerment Conference & Assembly", "cat" => "Events", "description" => "Delegates and self-help group leaders ratifying tribal livelihood resolutions."],
    ["src" => "/uploads/Love-then-Serve.jpg", "title" => "World Tribal Day Celebration & Community Convocation", "cat" => "Events", "type" => "image", "description" => "Annual community convocation honoring indigenous heritage and community protectors."],
    ["src" => "/uploads/all2023.jpeg", "title" => "Emergency Relief Field Volunteers Briefing Assembly", "cat" => "Events", "type" => "image", "description" => "Disaster preparedness training session and distribution launch ceremony."]
];

$items = [];

if ($conn) {
    try {
        // Ensure table exists
        $conn->exec("CREATE TABLE IF NOT EXISTS `gallery_items` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `type` VARCHAR(20) NOT NULL DEFAULT 'image',
            `title` VARCHAR(255) NOT NULL,
            `cat` VARCHAR(100) NOT NULL DEFAULT 'Community',
            `src` VARCHAR(500) NOT NULL,
            `poster` VARCHAR(500) NULL,
            `duration` VARCHAR(50) NULL,
            `description` TEXT NULL,
            `sort_order` INT DEFAULT 0,
            `is_active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = (int)$conn->query("SELECT COUNT(*) FROM gallery_items")->fetchColumn();
        if ($count === 0) {
            $stmt = $conn->prepare("INSERT INTO gallery_items (type, title, cat, src, poster, duration, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
            $order = 1;
            foreach ($defaultGallery as $item) {
                $stmt->execute([
                    $item["type"] ?? "image",
                    $item["title"] ?? "",
                    $item["cat"] ?? "Community",
                    $item["src"] ?? "",
                    $item["poster"] ?? null,
                    $item["duration"] ?? null,
                    $order++
                ]);
            }
        }

        $stmt = $conn->query("SELECT * FROM gallery_items WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $items = [];
    }
}

if (empty($items)) {
    $items = $defaultGallery;
}

echo json_encode([
    "success" => true,
    "total" => count($items),
    "data" => $items
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
