<?php
require_once __DIR__ . '/config.php';

function testimonialRespond($payload, $status = 200) {
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
    testimonialRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    testimonialRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

function ensureTestimonialsTables($conn) {
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

        $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_testimonials_header")->fetchColumn();
        if ($hCount === 0) {
            $stmtH = $conn->prepare("INSERT INTO home_testimonials_header (badge, title, google_reviews_title, google_reviews_subtitle, google_reviews_url, google_rating, show_google_badge) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmtH->execute([
                "Testimonials",
                "Voices from the Community",
                "Google Reviews",
                "See what our community says on Google",
                "https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews",
                5.0,
                1
            ]);
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
    ensureTestimonialsTables($conn);

    if ($method === 'GET') {
        $rows = $conn->query("SELECT id, name, role, text, avatar, avatar_color, rating, source, sort_order, is_active, created_at, updated_at FROM home_testimonials ORDER BY sort_order ASC, id ASC")->fetchAll();
        $header = $conn->query("SELECT badge, title, google_reviews_title, google_reviews_subtitle, google_reviews_url, google_rating, show_google_badge FROM home_testimonials_header ORDER BY id DESC LIMIT 1")->fetch() ?: [
            "badge" => "Testimonials",
            "title" => "Voices from the Community",
            "google_reviews_title" => "Google Reviews",
            "google_reviews_subtitle" => "See what our community says on Google",
            "google_reviews_url" => "https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews",
            "google_rating" => 5.0,
            "show_google_badge" => 1
        ];
        if ($header) {
            $header['google_rating'] = (float)($header['google_rating'] ?? 5.0);
            $header['show_google_badge'] = (int)($header['show_google_badge'] ?? 1);
        }

        testimonialRespond([
            "success" => true,
            "data" => $rows,
            "header" => $header
        ]);
    }

    if ($method === 'POST') {
        $action = $input['action'] ?? ($_GET['action'] ?? '');
        if ($action === 'header') {
            $badge = trim((string)($input['badge'] ?? 'Testimonials'));
            $title = trim((string)($input['title'] ?? 'Voices from the Community'));
            $gTitle = trim((string)($input['google_reviews_title'] ?? 'Google Reviews'));
            $gSub = trim((string)($input['google_reviews_subtitle'] ?? 'See what our community says on Google'));
            $gUrl = trim((string)($input['google_reviews_url'] ?? 'https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews'));
            $gRating = (float)($input['google_rating'] ?? 5.0);
            $showBadge = isset($input['show_google_badge']) ? ((int)$input['show_google_badge'] ? 1 : 0) : 1;

            $hId = (int)$conn->query("SELECT id FROM home_testimonials_header ORDER BY id DESC LIMIT 1")->fetchColumn();
            if ($hId > 0) {
                $stmt = $conn->prepare("UPDATE home_testimonials_header SET badge = ?, title = ?, google_reviews_title = ?, google_reviews_subtitle = ?, google_reviews_url = ?, google_rating = ?, show_google_badge = ? WHERE id = ?");
                $stmt->execute([$badge, $title, $gTitle, $gSub, $gUrl, $gRating, $showBadge, $hId]);
            } else {
                $stmt = $conn->prepare("INSERT INTO home_testimonials_header (badge, title, google_reviews_title, google_reviews_subtitle, google_reviews_url, google_rating, show_google_badge) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$badge, $title, $gTitle, $gSub, $gUrl, $gRating, $showBadge]);
            }

            testimonialRespond([
                "success" => true,
                "message" => "Testimonials header & Google Reviews badge updated successfully.",
                "header" => [
                    "badge" => $badge,
                    "title" => $title,
                    "google_reviews_title" => $gTitle,
                    "google_reviews_subtitle" => $gSub,
                    "google_reviews_url" => $gUrl,
                    "google_rating" => $gRating,
                    "show_google_badge" => $showBadge
                ]
            ]);
        }

        // Create new testimonial
        $name = trim((string)($input['name'] ?? ''));
        $role = trim((string)($input['role'] ?? ''));
        $text = trim((string)($input['text'] ?? ''));
        $avatar = !empty($input['avatar']) ? trim((string)$input['avatar']) : null;
        $avatarColor = !empty($input['avatar_color']) ? trim((string)$input['avatar_color']) : '#D2190C';
        $rating = isset($input['rating']) ? max(1, min(5, (int)$input['rating'])) : 5;
        $source = !empty($input['source']) ? trim((string)$input['source']) : 'Google';
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $isActive = isset($input['is_active']) ? ((int)$input['is_active'] ? 1 : 0) : 1;

        if ($name === '' || $text === '') {
            testimonialRespond(["success" => false, "message" => "Name and testimonial review text are required."], 422);
        }

        if ($sortOrder === 0) {
            $maxSort = (int)$conn->query("SELECT MAX(sort_order) FROM home_testimonials")->fetchColumn();
            $sortOrder = $maxSort + 1;
        }

        $stmt = $conn->prepare("INSERT INTO home_testimonials (name, role, text, avatar, avatar_color, rating, source, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $role, $text, $avatar, $avatarColor, $rating, $source, $sortOrder, $isActive]);
        $newId = (int)$conn->lastInsertId();

        testimonialRespond([
            "success" => true,
            "message" => "Testimonial created successfully.",
            "data" => [
                "id" => $newId,
                "name" => $name,
                "role" => $role,
                "text" => $text,
                "avatar" => $avatar,
                "avatar_color" => $avatarColor,
                "rating" => $rating,
                "source" => $source,
                "sort_order" => $sortOrder,
                "is_active" => $isActive
            ]
        ], 201);
    }

    if ($method === 'PUT') {
        $action = $input['action'] ?? ($_GET['action'] ?? '');
        if ($action === 'header') {
            $badge = trim((string)($input['badge'] ?? 'Testimonials'));
            $title = trim((string)($input['title'] ?? 'Voices from the Community'));
            $gTitle = trim((string)($input['google_reviews_title'] ?? 'Google Reviews'));
            $gSub = trim((string)($input['google_reviews_subtitle'] ?? 'See what our community says on Google'));
            $gUrl = trim((string)($input['google_reviews_url'] ?? 'https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews'));
            $gRating = (float)($input['google_rating'] ?? 5.0);
            $showBadge = isset($input['show_google_badge']) ? ((int)$input['show_google_badge'] ? 1 : 0) : 1;

            $hId = (int)$conn->query("SELECT id FROM home_testimonials_header ORDER BY id DESC LIMIT 1")->fetchColumn();
            if ($hId > 0) {
                $stmt = $conn->prepare("UPDATE home_testimonials_header SET badge = ?, title = ?, google_reviews_title = ?, google_reviews_subtitle = ?, google_reviews_url = ?, google_rating = ?, show_google_badge = ? WHERE id = ?");
                $stmt->execute([$badge, $title, $gTitle, $gSub, $gUrl, $gRating, $showBadge, $hId]);
            } else {
                $stmt = $conn->prepare("INSERT INTO home_testimonials_header (badge, title, google_reviews_title, google_reviews_subtitle, google_reviews_url, google_rating, show_google_badge) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$badge, $title, $gTitle, $gSub, $gUrl, $gRating, $showBadge]);
            }

            testimonialRespond([
                "success" => true,
                "message" => "Testimonials header & Google Reviews badge updated successfully.",
                "header" => [
                    "badge" => $badge,
                    "title" => $title,
                    "google_reviews_title" => $gTitle,
                    "google_reviews_subtitle" => $gSub,
                    "google_reviews_url" => $gUrl,
                    "google_rating" => $gRating,
                    "show_google_badge" => $showBadge
                ]
            ]);
        }

        if ($action === 'reorder') {
            $testimonialsList = $input['testimonials'] ?? [];
            if (!is_array($testimonialsList)) {
                testimonialRespond(["success" => false, "message" => "Invalid testimonials reorder payload."], 422);
            }
            $stmt = $conn->prepare("UPDATE home_testimonials SET sort_order = ? WHERE id = ?");
            foreach ($testimonialsList as $idx => $tItem) {
                $tId = (int)($tItem['id'] ?? 0);
                if ($tId > 0) {
                    $stmt->execute([$idx + 1, $tId]);
                }
            }
            testimonialRespond(["success" => true, "message" => "Testimonials reordered successfully."]);
        }

        // Update single testimonial
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            testimonialRespond(["success" => false, "message" => "Testimonial ID required for update."], 422);
        }

        $name = trim((string)($input['name'] ?? ''));
        $role = trim((string)($input['role'] ?? ''));
        $text = trim((string)($input['text'] ?? ''));
        $avatar = isset($input['avatar']) && $input['avatar'] !== '' ? trim((string)$input['avatar']) : null;
        $avatarColor = !empty($input['avatar_color']) ? trim((string)$input['avatar_color']) : '#D2190C';
        $rating = isset($input['rating']) ? max(1, min(5, (int)$input['rating'])) : 5;
        $source = !empty($input['source']) ? trim((string)$input['source']) : 'Google';
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $isActive = isset($input['is_active']) ? ((int)$input['is_active'] ? 1 : 0) : 1;

        if ($name === '' || $text === '') {
            testimonialRespond(["success" => false, "message" => "Name and testimonial review text are required."], 422);
        }

        $stmt = $conn->prepare("UPDATE home_testimonials SET name = ?, role = ?, text = ?, avatar = ?, avatar_color = ?, rating = ?, source = ?, sort_order = ?, is_active = ? WHERE id = ?");
        $stmt->execute([$name, $role, $text, $avatar, $avatarColor, $rating, $source, $sortOrder, $isActive, $id]);

        testimonialRespond([
            "success" => true,
            "message" => "Testimonial updated successfully."
        ]);
    }

    if ($method === 'DELETE') {
        $id = (int)($input['id'] ?? ($_GET['id'] ?? 0));
        if ($id <= 0) {
            testimonialRespond(["success" => false, "message" => "Valid Testimonial ID is required for deletion."], 422);
        }
        $stmt = $conn->prepare("DELETE FROM home_testimonials WHERE id = ?");
        $stmt->execute([$id]);
        testimonialRespond(["success" => true, "message" => "Testimonial deleted successfully."]);
    }

    testimonialRespond(["success" => false, "message" => "Unsupported request method."], 405);
} catch (Exception $e) {
    testimonialRespond(["success" => false, "message" => "Server error: " . $e->getMessage()], 500);
}
