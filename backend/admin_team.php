<?php
require_once __DIR__ . '/config.php';

function teamRespond($payload, $status = 200) {
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
    teamRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    teamRespond(["success" => false, "message" => "Database is not available. Check MySQL in XAMPP."], 503);
}

function ensureTeamTable($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS team_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            role VARCHAR(150) NOT NULL,
            image_url LONGTEXT NOT NULL,
            bio TEXT NOT NULL,
            highlights_json TEXT,
            quote TEXT,
            badge VARCHAR(100) DEFAULT 'Board of Directors',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = $conn->query("SELECT COUNT(*) FROM team_members")->fetchColumn();
        if ((int)$count === 0) {
            $defaults = [
                [
                    "Prof. Ch. Diwakar Babu",
                    "President",
                    "/uploads/Divakar-Babu.jpg",
                    "Renowned legal scholar, former Principal of V.R. Law College, and constitutional rights specialist guiding ALERT's legal interventions in tribal fifth-scheduled areas.",
                    json_encode(["Principal VR Law College", "Constitutional Rights Expert", "Appellate Litigation Advisor"]),
                    "Justice is non-negotiable for the indigenous forest dwelling communities.",
                    "Board of Directors",
                    1,
                    1
                ],
                [
                    "Mr V. Rama Krishna",
                    "Vice President",
                    "/uploads/Ramakrishna.jpg",
                    "Senior development activist specializing in rural livelihood cooperatives, grassroots agrarian sustainability, and natural resource stewardship for forest hamlets.",
                    json_encode(["Rural Livelihood Cooperatives", "Community Mobilization", "Natural Resource Policy"]),
                    "Self-reliance begins when communities govern their own indigenous land.",
                    "Board of Directors",
                    2,
                    1
                ],
                [
                    "Mr Y.L.J.B. Jayaraj",
                    "Secretary & Director",
                    "/uploads/jayaraj-sir.jpg",
                    "Founder & Chief Functionary with 47+ years of grass-roots human rights, affirmative tribal advocacy, and institutional leadership across Andhra Pradesh.",
                    json_encode(["47+ Years Grassroots Leadership", "FRA & PESA Enforcement Specialist", "Disaster Relief Coordinator"]),
                    "Every tribal settlement has a constitutional right to sovereignty, dignity, and flourishing.",
                    "Founder & Director",
                    3,
                    1
                ],
                [
                    "Ms P. Sirisha",
                    "Treasurer",
                    "/uploads/Sirisha-1.jpg",
                    "Development finance specialist overseeing statutory financial auditing, reporting, and regulatory compliances under FCRA and Indian Income Tax regulations.",
                    json_encode(["12A & 80G Compliances", "Statutory Financial Auditing", "Transparent Donor Reporting"]),
                    "Uncompromising integrity and financial transparency are our core tenets.",
                    "Board of Directors",
                    4,
                    1
                ],
                [
                    "Mr J. Prasad",
                    "Executive Member",
                    "/uploads/Jillela-Prasad-1-3.png",
                    "Community organizer actively directing field campaigns on Forest Rights (RoFR 2006), GPS boundary demarcation, and Gram Sabha empowerment across Godavari agency mandals.",
                    json_encode(["RoFR Patta Verification", "Gram Sabha Mobilizer", "Youth Leadership Training"]),
                    "The Gram Sabha is the true sovereign custodian of our ancestral forests.",
                    "Board of Directors",
                    5,
                    1
                ],
                [
                    "Ms K.L. Nancharamma",
                    "Executive Member",
                    "/uploads/Nancharamma-1-1.png",
                    "Indigenous community leader championing Yenadi women rights, healthcare access, and the Antyodaya Matsya Mithra fisheries cooperative federation.",
                    json_encode(["Antyodaya Women Leader", "Fisheries Cooperative Builder", "Indigenous Gender Rights"]),
                    "When women lead economic cooperatives, entire tribal habitations rise.",
                    "Board of Directors",
                    6,
                    1
                ],
                [
                    "Ms N. Silpa",
                    "Executive Member",
                    "/uploads/silpa-1.png",
                    "Field intervention coordinator focusing on tribal youth digital informatics, ashram school education equity, and flood disaster relief logistical operations.",
                    json_encode(["Tribal Youth Informatics", "Ashram School Advocacy", "Emergency Relief Operations"]),
                    "Education and digital access are the strongest equalizers for tribal youth.",
                    "Board of Directors",
                    7,
                    1
                ]
            ];

            $stmt = $conn->prepare("INSERT INTO team_members (name, role, image_url, bio, highlights_json, quote, badge, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaults as $d) {
                $stmt->execute($d);
            }
        }
    } catch (PDOException $e) {}
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = [];
}

try {
    ensureTeamTable($conn);

    if ($method === 'GET') {
        $stmt = $conn->query("SELECT id, name, role, image_url, bio, highlights_json, quote, badge, sort_order, is_active FROM team_members ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['img'] = $r['image_url'];
            $r['highlights'] = [];
            if (!empty($r['highlights_json'])) {
                $decoded = json_decode($r['highlights_json'], true);
                if (is_array($decoded)) $r['highlights'] = $decoded;
            }
        }
        teamRespond(["success" => true, "data" => $rows]);
    }

    if ($method === 'POST') {
        $name = trim((string)($input['name'] ?? ''));
        $role = trim((string)($input['role'] ?? 'Executive Member'));
        $img = trim((string)($input['image_url'] ?? ($input['img'] ?? '/uploads/Divakar-Babu.jpg')));
        $bio = trim((string)($input['bio'] ?? ''));
        $quote = trim((string)($input['quote'] ?? ''));
        $badge = trim((string)($input['badge'] ?? 'Board of Directors'));
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        $highlights = $input['highlights'] ?? [];
        if (!is_array($highlights)) {
            $highlights = array_filter(array_map('trim', explode("\n", (string)$highlights)));
        }
        $highlightsJson = json_encode(array_values($highlights));

        if ($name === '') {
            teamRespond(["success" => false, "message" => "Name is required."], 400);
        }

        if ($sortOrder === 0) {
            $maxOrder = $conn->query("SELECT MAX(sort_order) FROM team_members")->fetchColumn();
            $sortOrder = ((int)$maxOrder) + 1;
        }

        $stmt = $conn->prepare("INSERT INTO team_members (name, role, image_url, bio, highlights_json, quote, badge, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $role, $img, $bio, $highlightsJson, $quote, $badge, $sortOrder, $isActive]);
        $newId = (int)$conn->lastInsertId();

        teamRespond([
            "success" => true,
            "message" => "Team member added successfully.",
            "data" => [
                "id" => $newId,
                "name" => $name,
                "role" => $role,
                "image_url" => $img,
                "img" => $img,
                "bio" => $bio,
                "highlights" => array_values($highlights),
                "quote" => $quote,
                "badge" => $badge,
                "sort_order" => $sortOrder,
                "is_active" => $isActive
            ]
        ], 201);
    }

    if ($method === 'PUT') {
        // Bulk reorder
        if (isset($input['action']) && $input['action'] === 'reorder' && is_array($input['items'])) {
            $stmt = $conn->prepare("UPDATE team_members SET sort_order = ? WHERE id = ?");
            foreach ($input['items'] as $idx => $it) {
                $id = (int)($it['id'] ?? 0);
                if ($id > 0) {
                    $stmt->execute([$idx + 1, $id]);
                }
            }
            teamRespond(["success" => true, "message" => "Order updated successfully."]);
        }

        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            teamRespond(["success" => false, "message" => "Valid member ID is required for update."], 400);
        }

        $name = trim((string)($input['name'] ?? ''));
        $role = trim((string)($input['role'] ?? 'Executive Member'));
        $img = trim((string)($input['image_url'] ?? ($input['img'] ?? '')));
        $bio = trim((string)($input['bio'] ?? ''));
        $quote = trim((string)($input['quote'] ?? ''));
        $badge = trim((string)($input['badge'] ?? 'Board of Directors'));
        $sortOrder = (int)($input['sort_order'] ?? 1);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        $highlights = $input['highlights'] ?? [];
        if (!is_array($highlights)) {
            $highlights = array_filter(array_map('trim', explode("\n", (string)$highlights)));
        }
        $highlightsJson = json_encode(array_values($highlights));

        if ($name === '') {
            teamRespond(["success" => false, "message" => "Name is required."], 400);
        }

        $stmt = $conn->prepare("UPDATE team_members SET name=?, role=?, image_url=?, bio=?, highlights_json=?, quote=?, badge=?, sort_order=?, is_active=? WHERE id=?");
        $stmt->execute([$name, $role, $img, $bio, $highlightsJson, $quote, $badge, $sortOrder, $isActive, $id]);

        teamRespond([
            "success" => true,
            "message" => "Team member updated successfully."
        ]);
    }

    if ($method === 'DELETE') {
        $id = (int)($input['id'] ?? ($_GET['id'] ?? 0));
        if ($id <= 0) {
            teamRespond(["success" => false, "message" => "Valid member ID required to delete."], 400);
        }

        $stmt = $conn->prepare("DELETE FROM team_members WHERE id = ?");
        $stmt->execute([$id]);

        teamRespond(["success" => true, "message" => "Team member deleted."]);
    }

    teamRespond(["success" => false, "message" => "Method not allowed."], 405);
} catch (PDOException $e) {
    teamRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
