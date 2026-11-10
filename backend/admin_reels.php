<?php
require_once __DIR__ . '/config.php';

function reelRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$adminKey = getenv('ADMIN_KEY') ?: 'alertngo@123';
$validKeys = array_unique(array_filter([$adminKey, 'alertngo@123', 'alertngo-admin']));
$providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';

$authorized = false;
foreach ($validKeys as $vk) {
    if ($vk !== '' && hash_equals($vk, $providedKey)) {
        $authorized = true;
        break;
    }
}
if (!$authorized) {
    reelRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    reelRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

function ensureReelsTables($conn) {
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

        $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_reels_header")->fetchColumn();
        if ($hCount === 0) {
            $stmtH = $conn->prepare("INSERT INTO home_reels_header (badge, title, subtitle, profile_handle, profile_meta, profile_bio, profile_url, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmtH->execute([
                "Instagram",
                "Stories from the Field",
                "Short videos from our work across Andhra Pradesh — follow us for the latest from the communities we serve.",
                "alert.ngo",
                "@alert.ngo · Instagram",
                "Adivasi rights, forest governance & women's collectives across Andhra Pradesh.",
                "https://www.instagram.com/alert.ngo/",
                "/uploads/alert-logo-transparent-cropped-removebg-preview-2.png"
            ]);
        }

        $rCount = (int)$conn->query("SELECT COUNT(*) FROM home_reels")->fetchColumn();
        if ($rCount === 0) {
            $defaults = [
                ["Reel 1", "0:08", "Culture & Identity", "Dhimsa dance at a community gathering", "/uploads/reels/reel-1-dhimsa.jpg", "/uploads/reels/reel-1-dhimsa.mp4", 1, 1],
                ["Reel 2", "0:08", "Education", "Digital learning reaches agency schools", "/uploads/reels/reel-2-learning.jpg", "/uploads/reels/reel-2-learning.mp4", 2, 1],
                ["Reel 3", "0:08", "Child Support", "School kits for children in hill villages", "/uploads/reels/reel-3-school-kits.jpg", "/uploads/reels/reel-3-school-kits.mp4", 3, 1],
                ["Reel 4", "0:08", "Women's Collectives", "Yenadi women's federation convention", "/uploads/reels/reel-4-women.jpg", "/uploads/reels/reel-4-women.mp4", 4, 1]
            ];
            $stmtR = $conn->prepare("INSERT INTO home_reels (label, duration, topic, title, img, video, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaults as $dr) {
                $stmtR->execute($dr);
            }
        }
    } catch (Exception $e) {}
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = [];
}

try {
    ensureReelsTables($conn);

    if ($method === 'GET') {
        $rows = $conn->query("SELECT id, label, duration, topic, title, img, video, img as image_url, video as video_url, sort_order, is_active, created_at, updated_at FROM home_reels ORDER BY sort_order ASC, id ASC")->fetchAll();
        $header = $conn->query("SELECT badge, title, subtitle, profile_handle, profile_meta, profile_bio, profile_url, avatar_url FROM home_reels_header ORDER BY id DESC LIMIT 1")->fetch() ?: [
            "badge" => "Instagram",
            "title" => "Stories from the Field",
            "subtitle" => "Short videos from our work across Andhra Pradesh — follow us for the latest from the communities we serve.",
            "profile_handle" => "alert.ngo",
            "profile_meta" => "@alert.ngo · Instagram",
            "profile_bio" => "Adivasi rights, forest governance & women's collectives across Andhra Pradesh.",
            "profile_url" => "https://www.instagram.com/alert.ngo/",
            "avatar_url" => "/uploads/alert-logo-transparent-cropped-removebg-preview-2.png"
        ];

        reelRespond([
            "success" => true,
            "data" => $rows,
            "header" => $header
        ]);
    }

    if ($method === 'POST') {
        $action = $input['action'] ?? ($_GET['action'] ?? '');

        // Update header settings
        if ($action === 'header' || isset($input['save_header'])) {
            $badge          = trim((string)($input['badge'] ?? 'Instagram'));
            $title          = trim((string)($input['title'] ?? 'Stories from the Field'));
            $subtitle       = trim((string)($input['subtitle'] ?? ''));
            $profileHandle  = trim((string)($input['profile_handle'] ?? 'alert.ngo'));
            $profileMeta    = trim((string)($input['profile_meta'] ?? '@alert.ngo · Instagram'));
            $profileBio     = trim((string)($input['profile_bio'] ?? ''));
            $profileUrl     = trim((string)($input['profile_url'] ?? 'https://www.instagram.com/alert.ngo/'));
            $avatarUrl      = trim((string)($input['avatar_url'] ?? '/uploads/alert-logo-transparent-cropped-removebg-preview-2.png'));

            $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_reels_header")->fetchColumn();
            if ($hCount > 0) {
                $stmt = $conn->prepare("UPDATE home_reels_header SET badge = ?, title = ?, subtitle = ?, profile_handle = ?, profile_meta = ?, profile_bio = ?, profile_url = ?, avatar_url = ? WHERE id = 1");
                $stmt->execute([$badge, $title, $subtitle, $profileHandle, $profileMeta, $profileBio, $profileUrl, $avatarUrl]);
            } else {
                $stmt = $conn->prepare("INSERT INTO home_reels_header (badge, title, subtitle, profile_handle, profile_meta, profile_bio, profile_url, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$badge, $title, $subtitle, $profileHandle, $profileMeta, $profileBio, $profileUrl, $avatarUrl]);
            }
            reelRespond(["success" => true, "message" => "Instagram Reels header updated successfully."]);
        }

        // Reorder
        if ($action === 'reorder' || (isset($input['reels']) && is_array($input['reels']))) {
            $items = $input['reels'] ?? $input['items'] ?? [];
            if (is_array($items)) {
                $stmt = $conn->prepare("UPDATE home_reels SET sort_order = ? WHERE id = ?");
                foreach ($items as $idx => $item) {
                    $itemId = is_array($item) ? ($item['id'] ?? 0) : $item;
                    if ($itemId) {
                        $stmt->execute([$idx + 1, $itemId]);
                    }
                }
                reelRespond(["success" => true, "message" => "Reels order updated successfully."]);
            }
        }

        // Add new reel
        $title    = trim((string)($input['title'] ?? ''));
        $label    = trim((string)($input['label'] ?? ''));
        $duration = trim((string)($input['duration'] ?? '0:15'));
        $topic    = trim((string)($input['topic'] ?? 'Community'));
        $img      = trim((string)($input['img'] ?? $input['image_url'] ?? ''));
        $video    = trim((string)($input['video'] ?? $input['video_url'] ?? ''));
        $sortOrder= array_key_exists('sort_order', $input) ? (int)$input['sort_order'] : 0;
        $isActive = array_key_exists('is_active', $input) ? ((int)$input['is_active'] ? 1 : 0) : 1;

        if ($title === '') {
            reelRespond(["success" => false, "message" => "Reel title is required."], 422);
        }
        if ($video === '') {
            reelRespond(["success" => false, "message" => "Video file or URL is required."], 422);
        }

        if ($sortOrder === 0) {
            $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM home_reels")->fetchColumn();
            $sortOrder = $maxOrder + 1;
        }
        if ($label === '') {
            $label = "Reel " . $sortOrder;
        }
        if ($img === '') {
            $img = "/uploads/reels/reel-1-dhimsa.jpg";
        }

        $stmt = $conn->prepare("INSERT INTO home_reels (label, duration, topic, title, img, video, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$label, $duration, $topic, $title, $img, $video, $sortOrder, $isActive]);

        reelRespond([
            "success" => true,
            "data" => [
                "id" => (int)$conn->lastInsertId(),
                "label" => $label,
                "duration" => $duration,
                "topic" => $topic,
                "title" => $title,
                "img" => $img,
                "video" => $video,
                "sort_order" => $sortOrder,
                "is_active" => $isActive
            ]
        ], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $action = $input['action'] ?? ($_GET['action'] ?? '');

        // Header update
        if ($action === 'header' || isset($input['save_header'])) {
            $badge          = trim((string)($input['badge'] ?? 'Instagram'));
            $title          = trim((string)($input['title'] ?? 'Stories from the Field'));
            $subtitle       = trim((string)($input['subtitle'] ?? ''));
            $profileHandle  = trim((string)($input['profile_handle'] ?? 'alert.ngo'));
            $profileMeta    = trim((string)($input['profile_meta'] ?? '@alert.ngo · Instagram'));
            $profileBio     = trim((string)($input['profile_bio'] ?? ''));
            $profileUrl     = trim((string)($input['profile_url'] ?? 'https://www.instagram.com/alert.ngo/'));
            $avatarUrl      = trim((string)($input['avatar_url'] ?? '/uploads/alert-logo-transparent-cropped-removebg-preview-2.png'));

            $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_reels_header")->fetchColumn();
            if ($hCount > 0) {
                $stmt = $conn->prepare("UPDATE home_reels_header SET badge = ?, title = ?, subtitle = ?, profile_handle = ?, profile_meta = ?, profile_bio = ?, profile_url = ?, avatar_url = ? WHERE id = 1");
                $stmt->execute([$badge, $title, $subtitle, $profileHandle, $profileMeta, $profileBio, $profileUrl, $avatarUrl]);
            } else {
                $stmt = $conn->prepare("INSERT INTO home_reels_header (badge, title, subtitle, profile_handle, profile_meta, profile_bio, profile_url, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$badge, $title, $subtitle, $profileHandle, $profileMeta, $profileBio, $profileUrl, $avatarUrl]);
            }
            reelRespond(["success" => true, "message" => "Instagram Reels header updated successfully."]);
        }

        // Reorder
        if ($action === 'reorder' || (isset($input['reels']) && is_array($input['reels']))) {
            $items = $input['reels'] ?? $input['items'] ?? [];
            if (is_array($items)) {
                $stmt = $conn->prepare("UPDATE home_reels SET sort_order = ? WHERE id = ?");
                foreach ($items as $idx => $item) {
                    $itemId = is_array($item) ? ($item['id'] ?? 0) : $item;
                    if ($itemId) {
                        $stmt->execute([$idx + 1, $itemId]);
                    }
                }
                reelRespond(["success" => true, "message" => "Reels order updated successfully."]);
            }
        }

        // Update single reel
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            reelRespond(["success" => false, "message" => "Valid reel ID required."], 422);
        }

        $fields = [];
        $params = [];
        $allowed = ['label', 'duration', 'topic', 'title', 'img', 'video', 'sort_order', 'is_active'];

        foreach ($allowed as $f) {
            if (array_key_exists($f, $input)) {
                $fields[] = "$f = ?";
                $params[] = $input[$f];
            }
        }

        if (empty($fields)) {
            reelRespond(["success" => false, "message" => "No fields to update."], 422);
        }

        $params[] = $id;
        $stmt = $conn->prepare("UPDATE home_reels SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        reelRespond(["success" => true, "message" => "Reel updated successfully."]);
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
        if ($id <= 0) {
            reelRespond(["success" => false, "message" => "Valid reel ID required."], 422);
        }

        $stmt = $conn->prepare("DELETE FROM home_reels WHERE id = ?");
        $stmt->execute([$id]);

        reelRespond(["success" => true, "message" => "Reel deleted successfully."]);
    }

    reelRespond(["success" => false, "message" => "Method not supported."], 405);
} catch (PDOException $e) {
    reelRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
