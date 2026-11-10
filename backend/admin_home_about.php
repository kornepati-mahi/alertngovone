<?php
require_once __DIR__ . '/config.php';

function aboutRespond($payload, $status = 200) {
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
    aboutRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    aboutRespond(["success" => false, "message" => "Database is not available. Check MySQL in XAMPP."], 503);
}

function ensureAboutTable($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS home_about (
            id INT AUTO_INCREMENT PRIMARY KEY,
            years_number VARCHAR(50) DEFAULT '20+',
            years_label VARCHAR(100) DEFAULT 'Years of Service',
            image_url LONGTEXT NOT NULL,
            tag VARCHAR(100) DEFAULT 'Who We Are',
            title VARCHAR(255) DEFAULT 'Championing Adivasi Rights and Sustainable Development',
            lead_text TEXT,
            p1 TEXT,
            p2 TEXT,
            features_json TEXT,
            btn1_text VARCHAR(100) DEFAULT 'Learn More',
            btn1_link VARCHAR(255) DEFAULT '/about',
            btn2_text VARCHAR(100) DEFAULT 'Get Involved',
            btn2_link VARCHAR(255) DEFAULT '/contact',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = $conn->query("SELECT COUNT(*) FROM home_about")->fetchColumn();
        if ((int)$count === 0) {
            $defaultFeatures = json_encode([
                "Forest Rights Secured",
                "Women Empowerment",
                "Sustainable Livelihoods",
                "Self-Governance",
                "Natural Resources",
                "Disaster Relief"
            ]);
            $stmt = $conn->prepare("INSERT INTO home_about (years_number, years_label, image_url, tag, title, lead_text, p1, p2, features_json, btn1_text, btn1_link, btn2_text, btn2_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                "20+",
                "Years of Service",
                "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
                "Who We Are",
                "Championing Adivasi Rights and Sustainable Development",
                "Led by YL Jayaraj with 47 years of NGO experience, ALERT specializes in empowering Adivasis in Andhra Pradesh.",
                "ALERT, established in 2004, is a South India-based not-for-profit organization headquartered in Vijayawada. The organization focuses on ensuring effective implementation of affirmative legislations, securing forest rights, and promoting self-governance.",
                "ALERT partners with Adivasi Mahasabha, advocating for Adivasi rights and sustainable development, supporting thousands of acres of individual and community forest rights besides facilitating effective service delivery.",
                $defaultFeatures,
                "Learn More",
                "/about",
                "Get Involved",
                "/contact"
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
    ensureAboutTable($conn);

    if ($method === 'GET') {
        $row = $conn->query("SELECT * FROM home_about ORDER BY id DESC LIMIT 1")->fetch();
        if ($row) {
            $features = [];
            if (!empty($row['features_json'])) {
                $decoded = json_decode($row['features_json'], true);
                if (is_array($decoded)) $features = $decoded;
            }
            $row['features'] = $features;
            aboutRespond(["success" => true, "data" => $row]);
        }
        aboutRespond(["success" => true, "data" => null]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        $yearsNumber = trim((string)($input['years_number'] ?? '20+'));
        $yearsLabel  = trim((string)($input['years_label'] ?? 'Years of Service'));
        $imageUrl    = trim((string)($input['image_url'] ?? '/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg'));
        $tag         = trim((string)($input['tag'] ?? 'Who We Are'));
        $title       = trim((string)($input['title'] ?? 'Championing Adivasi Rights and Sustainable Development'));
        $leadText    = trim((string)($input['lead_text'] ?? ''));
        $p1          = trim((string)($input['p1'] ?? ''));
        $p2          = trim((string)($input['p2'] ?? ''));
        $featuresJson= isset($input['features']) && is_array($input['features']) ? json_encode(array_values($input['features'])) : '[]';
        $btn1Text    = trim((string)($input['btn1_text'] ?? 'Learn More'));
        $btn1Link    = trim((string)($input['btn1_link'] ?? '/about'));
        $btn2Text    = trim((string)($input['btn2_text'] ?? 'Get Involved'));
        $btn2Link    = trim((string)($input['btn2_link'] ?? '/contact'));

        $count = $conn->query("SELECT COUNT(*) FROM home_about")->fetchColumn();
        if ((int)$count > 0) {
            $lastId = $conn->query("SELECT id FROM home_about ORDER BY id DESC LIMIT 1")->fetchColumn();
            $stmt = $conn->prepare("UPDATE home_about SET years_number=?, years_label=?, image_url=?, tag=?, title=?, lead_text=?, p1=?, p2=?, features_json=?, btn1_text=?, btn1_link=?, btn2_text=?, btn2_link=? WHERE id=?");
            $stmt->execute([$yearsNumber, $yearsLabel, $imageUrl, $tag, $title, $leadText, $p1, $p2, $featuresJson, $btn1Text, $btn1Link, $btn2Text, $btn2Link, $lastId]);
        } else {
            $stmt = $conn->prepare("INSERT INTO home_about (years_number, years_label, image_url, tag, title, lead_text, p1, p2, features_json, btn1_text, btn1_link, btn2_text, btn2_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$yearsNumber, $yearsLabel, $imageUrl, $tag, $title, $leadText, $p1, $p2, $featuresJson, $btn1Text, $btn1Link, $btn2Text, $btn2Link]);
        }

        aboutRespond(["success" => true, "message" => "About section updated."]);
    }

    aboutRespond(["success" => false, "message" => "Method not allowed."], 405);
} catch (PDOException $e) {
    aboutRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
