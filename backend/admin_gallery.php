<?php
require_once __DIR__ . '/config.php';

function galleryRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$adminKey = getenv('ADMIN_KEY') ?: 'alertngo@123';
$validKeys = array_unique(array_filter([$adminKey, 'alertngo@123', 'alertngo-admin']));
$providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_POST['admin_key'] ?? ($_GET['admin_key'] ?? ''));

$authorized = false;
foreach ($validKeys as $vk) {
    if ($vk !== '' && hash_equals($vk, $providedKey)) {
        $authorized = true;
        break;
    }
}
if (!$authorized) {
    galleryRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    galleryRespond(["success" => false, "message" => "Database connection unavailable."], 503);
}

// 1. Ensure table exists
try {
    $createSql = "CREATE TABLE IF NOT EXISTS `gallery_items` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->exec($createSql);
} catch (PDOException $e) {
    galleryRespond(["success" => false, "message" => "Failed to initialize table: " . $e->getMessage()], 500);
}

function seedGalleryDefaults($conn, $force = false) {
    $count = (int)$conn->query("SELECT COUNT(*) FROM gallery_items")->fetchColumn();
    if ($count > 0 && !$force) {
        return $count;
    }

    if ($force) {
        $conn->exec("TRUNCATE TABLE gallery_items");
    }

    $initial = [
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

    $stmt = $conn->prepare("INSERT INTO gallery_items (type, title, cat, src, poster, duration, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
    $order = 1;
    foreach ($initial as $item) {
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
    return count($initial);
}

// Auto seed if empty
seedGalleryDefaults($conn, false);

$rawBody = file_get_contents("php://input");
$input = [];
if (!empty($rawBody)) {
    $decoded = json_decode($rawBody, true);
    if (is_array($decoded)) $input = $decoded;
}
$action = $_REQUEST['action'] ?? ($input['action'] ?? 'list');

switch ($action) {
    case 'list': {
        $type = trim($_GET['type'] ?? ($input['type'] ?? ''));
        $cat = trim($_GET['cat'] ?? ($input['cat'] ?? ''));
        $search = trim($_GET['search'] ?? ($input['search'] ?? ''));

        $sql = "SELECT * FROM gallery_items WHERE 1=1";
        $params = [];

        if ($type !== '' && $type !== 'All') {
            $sql .= " AND type = ?";
            $params[] = $type;
        }
        if ($cat !== '' && $cat !== 'All') {
            $sql .= " AND cat = ?";
            $params[] = $cat;
        }
        if ($search !== '') {
            $sql .= " AND (title LIKE ? OR description LIKE ? OR cat LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sql .= " ORDER BY sort_order ASC, id ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        galleryRespond([
            "success" => true,
            "total" => count($items),
            "data" => $items
        ]);
    }

    case 'create': {
        $title = trim($input['title'] ?? ($_POST['title'] ?? ''));
        $type = trim($input['type'] ?? ($_POST['type'] ?? 'image'));
        $cat = trim($input['cat'] ?? ($_POST['cat'] ?? 'Community'));
        $src = trim($input['src'] ?? ($_POST['src'] ?? ''));
        $poster = trim($input['poster'] ?? ($_POST['poster'] ?? ''));
        $duration = trim($input['duration'] ?? ($_POST['duration'] ?? ''));
        $description = trim($input['description'] ?? ($_POST['description'] ?? ''));
        $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : (isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0);
        $is_active = isset($input['is_active']) ? ((int)$input['is_active'] ? 1 : 0) : 1;

        if ($title === '' || $src === '') {
            galleryRespond(["success" => false, "message" => "Title and Media URL/Path (src) are required."], 400);
        }

        if ($sort_order === 0) {
            $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM gallery_items")->fetchColumn();
            $sort_order = $maxOrder + 1;
        }

        $stmt = $conn->prepare("INSERT INTO gallery_items (type, title, cat, src, poster, duration, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $type,
            $title,
            $cat,
            $src,
            $poster !== '' ? $poster : null,
            $duration !== '' ? $duration : null,
            $description !== '' ? $description : null,
            $sort_order,
            $is_active
        ]);

        $newId = (int)$conn->lastInsertId();
        galleryRespond([
            "success" => true,
            "message" => "Gallery media created successfully.",
            "id" => $newId
        ]);
    }

    case 'update': {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            galleryRespond(["success" => false, "message" => "Valid item ID required."], 400);
        }

        $title = trim($input['title'] ?? ($_POST['title'] ?? ''));
        $type = trim($input['type'] ?? ($_POST['type'] ?? 'image'));
        $cat = trim($input['cat'] ?? ($_POST['cat'] ?? 'Community'));
        $src = trim($input['src'] ?? ($_POST['src'] ?? ''));
        $poster = trim($input['poster'] ?? ($_POST['poster'] ?? ''));
        $duration = trim($input['duration'] ?? ($_POST['duration'] ?? ''));
        $description = trim($input['description'] ?? ($_POST['description'] ?? ''));
        $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : (isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : null);
        $is_active = isset($input['is_active']) ? ((int)$input['is_active'] ? 1 : 0) : null;

        if ($title === '' || $src === '') {
            galleryRespond(["success" => false, "message" => "Title and Media URL/Path (src) are required."], 400);
        }

        $fields = ["type = ?", "title = ?", "cat = ?", "src = ?", "poster = ?", "duration = ?", "description = ?"];
        $params = [
            $type,
            $title,
            $cat,
            $src,
            $poster !== '' ? $poster : null,
            $duration !== '' ? $duration : null,
            $description !== '' ? $description : null
        ];

        if ($sort_order !== null) {
            $fields[] = "sort_order = ?";
            $params[] = $sort_order;
        }
        if ($is_active !== null) {
            $fields[] = "is_active = ?";
            $params[] = $is_active;
        }

        $params[] = $id;
        $sql = "UPDATE gallery_items SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        galleryRespond([
            "success" => true,
            "message" => "Gallery media updated successfully."
        ]);
    }

    case 'toggle_active': {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            galleryRespond(["success" => false, "message" => "Valid item ID required."], 400);
        }
        $val = isset($input['is_active']) ? (int)$input['is_active'] : null;
        if ($val !== null) {
            $stmt = $conn->prepare("UPDATE gallery_items SET is_active = ? WHERE id = ?");
            $stmt->execute([$val ? 1 : 0, $id]);
        } else {
            $stmt = $conn->prepare("UPDATE gallery_items SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?");
            $stmt->execute([$id]);
        }
        galleryRespond([
            "success" => true,
            "message" => "Item visibility toggled."
        ]);
    }

    case 'delete': {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            galleryRespond(["success" => false, "message" => "Valid item ID required."], 400);
        }

        $stmt = $conn->prepare("DELETE FROM gallery_items WHERE id = ?");
        $stmt->execute([$id]);

        galleryRespond([
            "success" => true,
            "message" => "Gallery item deleted successfully."
        ]);
    }

    case 'reorder': {
        $ids = $input['ids'] ?? ($_POST['ids'] ?? []);
        if (!is_array($ids) || empty($ids)) {
            galleryRespond(["success" => false, "message" => "Array of IDs required for reorder."], 400);
        }

        $stmt = $conn->prepare("UPDATE gallery_items SET sort_order = ? WHERE id = ?");
        $order = 1;
        foreach ($ids as $id) {
            $cleanId = (int)$id;
            if ($cleanId > 0) {
                $stmt->execute([$order++, $cleanId]);
            }
        }
        galleryRespond([
            "success" => true,
            "message" => "Sort order updated successfully."
        ]);
    }

    case 'seed_defaults': {
        $seeded = seedGalleryDefaults($conn, true);
        galleryRespond([
            "success" => true,
            "message" => "Successfully restored {$seeded} default gallery media items."
        ]);
    }

    default:
        galleryRespond(["success" => false, "message" => "Unknown action: {$action}"], 400);
}

