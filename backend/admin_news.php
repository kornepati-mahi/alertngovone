<?php
require_once __DIR__ . '/config.php';

function newsRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$adminKey = getenv('ADMIN_KEY') ?: 'alertngo@123';
$validKeys = array_unique(array_filter([$adminKey, 'alertngo@123', 'alertngo-admin']));
$providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_POST['admin_key'] ?? '');

$authorized = false;
foreach ($validKeys as $vk) {
    if ($vk !== '' && hash_equals($vk, $providedKey)) {
        $authorized = true;
        break;
    }
}
if (!$authorized) {
    newsRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    newsRespond(["success" => false, "message" => "Database connection unavailable."], 503);
}

// 1. Ensure table exists
try {
    $createSql = "CREATE TABLE IF NOT EXISTS `news_articles` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `date` VARCHAR(100) NOT NULL,
        `category` VARCHAR(50) NOT NULL DEFAULT 'relief',
        `tag` VARCHAR(100) NOT NULL DEFAULT 'Field Dispatch',
        `img` VARCHAR(500) NULL,
        `excerpt` TEXT NOT NULL,
        `details` LONGTEXT NULL,
        `link_url` VARCHAR(255) DEFAULT '/contact',
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->exec($createSql);
} catch (PDOException $e) {
    newsRespond(["success" => false, "message" => "Failed to initialize table: " . $e->getMessage()], 500);
}

function seedNewsDefaults($conn, $force = false) {
    $count = (int)$conn->query("SELECT COUNT(*) FROM news_articles")->fetchColumn();
    if ($count > 0 && !$force) {
        return $count;
    }

    if ($force) {
        $conn->exec("TRUNCATE TABLE news_articles");
    }

    $initial = [
        [
            "title" => "Godavari Flood Relief 2023: Emergency Rations & Medical Kits to 4,200 Displaced Families",
            "date" => "September 2023",
            "category" => "relief",
            "tag" => "Flood Relief 2023",
            "img" => "/uploads/all2023.jpeg",
            "excerpt" => "ALERT mobilized field teams across flood-hit habitations of Alluri Sitharama Raju and Eluru districts, deploying mechanized boats to supply rice, lentils, drinking water, and sanitary kits to cut-off Adivasi hamlets.",
            "sort_order" => 1
        ],
        [
            "title" => "Flood Relief Operations 2022: Multi-Mandal Relief Mission Across Submergence Habitations",
            "date" => "October 2022",
            "category" => "relief",
            "tag" => "Flood Relief 2022",
            "img" => "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg",
            "excerpt" => "Field caseworkers distributed comprehensive ration packets and hygiene supplies to families displaced by heavy Godavari river spillage in Kunavaram, VR Puram, and Chintoor mandals.",
            "sort_order" => 2
        ],
        [
            "title" => "Flood Relief Operations 2021: Rescue Boat Deployment & Essential Services in Hill Tracts",
            "date" => "August 2021",
            "category" => "relief",
            "tag" => "Flood Relief 2021",
            "img" => "/uploads/ramavarampadu_11-08-2021-1024x461-640x480.jpeg",
            "excerpt" => "During peak Godavari inundation reaching 45+ meters, ALERT rescue teams accessed 18 marooned hill settlements, distributing dry rations and potable drinking water.",
            "sort_order" => 3
        ],
        [
            "title" => "Winter Blanket Distribution Drive: High-Altitude Tribal Hamlets of East Godavari",
            "date" => "December 2022",
            "category" => "winter",
            "tag" => "Winter Relief",
            "img" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
            "excerpt" => "Distributed over 2,800 thermal fleece blankets to elderly Adivasis and nursing mothers across isolated habitations in Rampachodavaram agency area.",
            "sort_order" => 4
        ],
        [
            "title" => "Emergency Food & Essential Groceries Distribution in West Godavari Flood Tracts",
            "date" => "September 2021",
            "category" => "groceries",
            "tag" => "Groceries Distribution",
            "img" => "/uploads/Kotarugommu-18-9-21-1-rotated-1-1024x461-640x480.jpeg",
            "excerpt" => "Comprehensive door-to-door grocery delivery providing rice, pulses, cooking oil, spices, and soap kits for submerged households in Polavaram and Buttayagudem mandals.",
            "sort_order" => 5
        ],
        [
            "title" => "Project Green Energy: 75+ Solar Street Poles Erected in Remote Scheduled Hamlets",
            "date" => "November 2023",
            "category" => "energy",
            "tag" => "Green Energy",
            "img" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
            "excerpt" => "Transitioning isolated forest hamlets away from dangerous kerosene lighting through decentralized, standalone solar street poles and solar household lanterns.",
            "sort_order" => 6
        ]
    ];

    $stmt = $conn->prepare("INSERT INTO news_articles (title, date, category, tag, img, excerpt, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
    foreach ($initial as $item) {
        $stmt->execute([
            $item['title'],
            $item['date'],
            $item['category'],
            $item['tag'],
            $item['img'],
            $item['excerpt'],
            $item['sort_order']
        ]);
    }

    return count($initial);
}

// Auto-seed if empty
$cnt = (int)$conn->query("SELECT COUNT(*) FROM news_articles")->fetchColumn();
if ($cnt === 0) {
    seedNewsDefaults($conn, false);
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET REQUESTS ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id > 0) {
            $stmt = $conn->prepare("SELECT * FROM news_articles WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if ($item) {
                newsRespond(["success" => true, "data" => $item]);
            } else {
                newsRespond(["success" => false, "message" => "Article not found."], 404);
            }
        }

        $category = isset($_GET['category']) ? trim($_GET['category']) : '';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        $sql = "SELECT * FROM news_articles WHERE 1=1";
        $params = [];

        if ($category !== '' && strtolower($category) !== 'all') {
            $sql .= " AND (category = ? OR tag LIKE ?)";
            $params[] = $category;
            $params[] = '%' . $category . '%';
        }

        if ($search !== '') {
            $sql .= " AND (LOWER(title) LIKE LOWER(?) OR LOWER(excerpt) LIKE LOWER(?) OR LOWER(tag) LIKE LOWER(?) OR LOWER(date) LIKE LOWER(?))";
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $sql .= " ORDER BY sort_order ASC, id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Calculate summary counters
        $reliefCount = 0;
        $winterCount = 0;
        $groceriesCount = 0;
        $energyCount = 0;

        foreach ($rows as $r) {
            $cat = strtolower($r['category'] ?? '');
            if ($cat === 'relief') $reliefCount++;
            else if ($cat === 'winter') $winterCount++;
            else if ($cat === 'groceries') $groceriesCount++;
            else if ($cat === 'energy') $energyCount++;
        }

        newsRespond([
            "success" => true,
            "total" => count($rows),
            "stats_summary" => [
                "total" => count($rows),
                "relief" => $reliefCount,
                "winter" => $winterCount,
                "groceries" => $groceriesCount,
                "energy" => $energyCount
            ],
            "data" => $rows
        ]);
    } catch (PDOException $e) {
        newsRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
    }
}

// ── POST REQUESTS ────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? 'save_news';

    // 1. RE-SEED DEFAULTS
    if ($action === 'seed_defaults') {
        try {
            $force = !empty($input['force']);
            $count = seedNewsDefaults($conn, $force);
            newsRespond([
                "success" => true,
                "message" => "Successfully synchronized {$count} articles from defaults.",
                "total" => $count
            ]);
        } catch (Exception $e) {
            newsRespond(["success" => false, "message" => "Seed error: " . $e->getMessage()], 500);
        }
    }

    // 2. CREATE ARTICLE
    if ($action === 'create_news') {
        $title = trim($input['title'] ?? '');
        $date = trim($input['date'] ?? date('F Y'));
        $category = trim($input['category'] ?? 'relief');
        $tag = trim($input['tag'] ?? 'Field Dispatch');
        $img = trim($input['img'] ?? '');
        $excerpt = trim($input['excerpt'] ?? '');
        $details = trim($input['details'] ?? '');
        $linkUrl = trim($input['link_url'] ?? '/contact');

        if ($title === '') {
            newsRespond(["success" => false, "message" => "Article title is required."], 422);
        }
        if ($excerpt === '') {
            newsRespond(["success" => false, "message" => "Article excerpt / summary is required."], 422);
        }

        $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM news_articles")->fetchColumn();
        $sortOrder = $maxOrder + 1;

        try {
            $stmt = $conn->prepare("INSERT INTO news_articles (title, date, category, tag, img, excerpt, details, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$title, $date, $category, $tag, $img, $excerpt, $details, $linkUrl, $sortOrder]);
            $newId = (int)$conn->lastInsertId();

            newsRespond([
                "success" => true,
                "message" => "Article '{$title}' created successfully.",
                "data" => [
                    "id" => $newId,
                    "title" => $title,
                    "date" => $date,
                    "category" => $category,
                    "tag" => $tag,
                    "img" => $img,
                    "excerpt" => $excerpt,
                    "details" => $details,
                    "link_url" => $linkUrl,
                    "sort_order" => $sortOrder,
                    "is_active" => 1
                ]
            ]);
        } catch (PDOException $e) {
            newsRespond(["success" => false, "message" => "Failed to create article: " . $e->getMessage()], 500);
        }
    }

    // 3. UPDATE / SAVE ARTICLE
    if ($action === 'update_news' || $action === 'save_news') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            newsRespond(["success" => false, "message" => "Valid article ID is required."], 422);
        }

        $article = $conn->query("SELECT * FROM news_articles WHERE id = {$id}")->fetch();
        if (!$article) {
            newsRespond(["success" => false, "message" => "Article not found."], 404);
        }

        $title = isset($input['title']) ? trim($input['title']) : $article['title'];
        $date = isset($input['date']) ? trim($input['date']) : $article['date'];
        $category = isset($input['category']) ? trim($input['category']) : $article['category'];
        $tag = isset($input['tag']) ? trim($input['tag']) : $article['tag'];
        $img = isset($input['img']) ? trim($input['img']) : $article['img'];
        $excerpt = isset($input['excerpt']) ? trim($input['excerpt']) : $article['excerpt'];
        $details = isset($input['details']) ? trim($input['details']) : $article['details'];
        $linkUrl = isset($input['link_url']) ? trim($input['link_url']) : $article['link_url'];
        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : (int)$article['sort_order'];
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : (int)$article['is_active'];

        try {
            $stmt = $conn->prepare("UPDATE news_articles SET title = ?, date = ?, category = ?, tag = ?, img = ?, excerpt = ?, details = ?, link_url = ?, sort_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$title, $date, $category, $tag, $img, $excerpt, $details, $linkUrl, $sortOrder, $isActive, $id]);

            newsRespond([
                "success" => true,
                "message" => "Article updated successfully.",
                "data" => [
                    "id" => $id,
                    "title" => $title,
                    "date" => $date,
                    "category" => $category,
                    "tag" => $tag,
                    "img" => $img,
                    "excerpt" => $excerpt,
                    "details" => $details,
                    "link_url" => $linkUrl,
                    "sort_order" => $sortOrder,
                    "is_active" => $isActive
                ]
            ]);
        } catch (PDOException $e) {
            newsRespond(["success" => false, "message" => "Failed to update article: " . $e->getMessage()], 500);
        }
    }

    // 4. DELETE ARTICLE
    if ($action === 'delete_news') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            newsRespond(["success" => false, "message" => "Valid article ID is required."], 422);
        }

        try {
            $conn->exec("DELETE FROM news_articles WHERE id = {$id}");
            newsRespond([
                "success" => true,
                "message" => "Article deleted successfully.",
                "deleted_id" => $id
            ]);
        } catch (PDOException $e) {
            newsRespond(["success" => false, "message" => "Failed to delete article: " . $e->getMessage()], 500);
        }
    }

    // 5. REORDER
    if ($action === 'reorder_news') {
        $orderList = $input['order'] ?? [];
        if (!is_array($orderList)) {
            newsRespond(["success" => false, "message" => "Invalid order format."], 422);
        }

        try {
            $stmt = $conn->prepare("UPDATE news_articles SET sort_order = ? WHERE id = ?");
            foreach ($orderList as $item) {
                if (isset($item['id'], $item['sort_order'])) {
                    $stmt->execute([(int)$item['sort_order'], (int)$item['id']]);
                }
            }
            newsRespond(["success" => true, "message" => "Article order updated successfully."]);
        } catch (PDOException $e) {
            newsRespond(["success" => false, "message" => "Failed to reorder: " . $e->getMessage()], 500);
        }
    }

    newsRespond(["success" => false, "message" => "Unknown action '{$action}'."], 400);
}

newsRespond(["success" => false, "message" => "Method not allowed."], 405);

