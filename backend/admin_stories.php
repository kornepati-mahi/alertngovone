<?php
require_once __DIR__ . '/config.php';

function storiesRespond($payload, $status = 200) {
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
    storiesRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    storiesRespond(["success" => false, "message" => "Database connection unavailable."], 503);
}

// 1. Ensure table exists
try {
    $createSql = "CREATE TABLE IF NOT EXISTS `stories` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `story_type` VARCHAR(50) DEFAULT 'featured',
        `tag` VARCHAR(100) NOT NULL,
        `place` VARCHAR(255) NOT NULL,
        `title` VARCHAR(255) NOT NULL,
        `body` TEXT NOT NULL,
        `outcome` VARCHAR(255) NULL,
        `media_type` ENUM('image', 'video') DEFAULT 'image',
        `img` VARCHAR(500) NULL,
        `video_url` VARCHAR(500) NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->exec($createSql);

    $createSettingsSql = "CREATE TABLE IF NOT EXISTS `stories_settings` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `setting_key` VARCHAR(100) NOT NULL UNIQUE,
        `setting_value` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->exec($createSettingsSql);
} catch (PDOException $e) {
    storiesRespond(["success" => false, "message" => "Failed to initialize table: " . $e->getMessage()], 500);
}

$defaultStoriesSettings = [
    "s1_badge" => "Section 01",
    "s1_title" => "Field Stories",
    "s1_subtitle" => "Compiled from ALERT's programme records, Gram Sabha resolutions and case files across the Fifth Scheduled Areas and the coastal Krishna belt. Identifying details of community members are withheld.",

    "s2_badge" => "Section 02",
    "s2_title" => "More From the Field",
    "s2_subtitle" => "Short notes from mandal offices and village visits — the smaller administrative wins that make the larger ones possible.",

    "s3_badge" => "Section 03",
    "s3_title" => "Stories by Programme",
    "s3_subtitle" => "Every story belongs to one of ALERT's eight impact pillars — open the pillar to see the interventions behind it.",
    "s3_programme_links" => json_encode([
        ["label" => "Forest Rights (RoFR & LTR)", "cat" => "Forest Rights"],
        ["label" => "PESA & Self-Governance", "cat" => "Governance"],
        ["label" => "Polavaram LA & R&R", "cat" => "Polavaram PIP"],
        ["label" => "Antyodaya Women Cooperatives", "cat" => "Women Cooperatives"],
        ["label" => "Child Interventions & Bare Acts", "cat" => "Child Rights"],
        ["label" => "Flood Relief Operations", "cat" => "Disaster Relief"],
        ["label" => "Solar & Clean Energy", "cat" => "Clean Energy"],
        ["label" => "Indigenous Millets & Seed Banks", "cat" => "Agriculture"]
    ]),

    "cta_badge" => "Next Story",
    "cta_title" => "Help Write the Next Chapter",
    "cta_title_highlight" => "Next Chapter",
    "cta_subtitle" => "Every patta, seed bank, street pole and savings ledger in these stories was funded by someone who read about work like this. Support the field teams who document, file and follow up.",
    "cta_donate_label" => "Donate Now",
    "cta_donate_url" => "/donate",
    "cta_volunteer_label" => "Volunteer with Us",
    "cta_volunteer_url" => "/contact",
    "cta_trust_items" => json_encode([
        "12A & 80G Certified",
        "FCRA Registered",
        "Reg. No. 307/2004"
    ])
];

function seedStoriesDefaults($conn, $force = false) {
    $count = (int)$conn->query("SELECT COUNT(*) FROM stories")->fetchColumn();
    if ($count > 0 && !$force) {
        return $count;
    }

    if ($force) {
        $conn->exec("TRUNCATE TABLE stories");
    }

    $initialStories = [
        [
            "story_type" => "featured",
            "tag" => "Forest Rights",
            "place" => "Maredumilli Mandal, ASR District",
            "title" => "The resolution that turned a forest into a legal record",
            "body" => "For years the hamlet's bamboo and tendu collection was treated as encroachment. A Gram Sabha resolution, a resource map drawn village by village, and a community forest rights claim changed that: the forest the elders had guarded was finally written into the record as theirs.",
            "outcome" => "CFR claim filed with Gram Sabha endorsement",
            "media_type" => "image",
            "img" => "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
            "video_url" => "",
            "sort_order" => 1
        ],
        [
            "story_type" => "featured",
            "tag" => "Women Cooperatives",
            "place" => "Machilipatnam Mandal, Krishna District",
            "title" => "Matsya Mithra: from auction floor to co-operative ledger",
            "body" => "Yenadi fisherwomen once sold the morning catch at whatever the middleman offered. Organised into savings groups and registered cooperatives, they now fix their own price, run cold storage links, and lend from their own revolving fund instead of the moneylender's.",
            "outcome" => "Federation of 3,500+ members across 6 mandals",
            "media_type" => "image",
            "img" => "/uploads/coastal-krishna-fishing.jpg",
            "video_url" => "",
            "sort_order" => 2
        ],
        [
            "story_type" => "featured",
            "tag" => "Child Rights",
            "place" => "Chinturu ITDA, Godavari Agency",
            "title" => "A classroom that begins in Koya",
            "body" => "Children who stopped at the first difficult sentence were not failing school — school was arriving in a language they had never heard. Joyful learning centres started lessons in the mother tongue, moved on to Telugu, and carried tribal folk content into the syllabus.",
            "outcome" => "Mother-tongue learning centres in agency hamlets",
            "media_type" => "image",
            "img" => "/uploads/l-1.jpg",
            "video_url" => "",
            "sort_order" => 3
        ],
        [
            "story_type" => "featured",
            "tag" => "Clean Energy",
            "place" => "Devipatnam Mandal, Godavari Gorge",
            "title" => "The first evening the hamlet kept its lights on",
            "body" => "Kerosene meant a lamp that smoked, a bill that ate a week's income, and children who could not study after dark. Solar home lighting and a street pole at the junction changed the timetable: the shop stayed open, the children finished their homework.",
            "outcome" => "75+ off-grid hamlets with solar lighting",
            "media_type" => "image",
            "img" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
            "video_url" => "",
            "sort_order" => 4
        ],
        [
            "story_type" => "featured",
            "tag" => "Disaster Relief",
            "place" => "Kunavaram Mandal, Godavari Basin",
            "title" => "Boats before the water reached the steps",
            "body" => "When the Godavari rose, the first help was not a government truck — it was neighbours with boats, moving families, grain and livestock to the relief camp. ALERT's field teams ran ration, sanitary kits and winter blankets alongside post-flood disinfection.",
            "outcome" => "Rescue, ration and rehabilitation response 2020–2023",
            "media_type" => "image",
            "img" => "/uploads/all2023.jpeg",
            "video_url" => "",
            "sort_order" => 5
        ],
        [
            "story_type" => "featured",
            "tag" => "Polavaram LA & R&R",
            "place" => "Polavaram Mandal, Eluru District",
            "title" => "Counting every family the award list forgot",
            "body" => "Project displacement is decided in columns of a register. Household surveys and social audits in the submergence belt put names, land parcels and adult-youth entitlements back on paper — the evidence that later became representations and writ petitions.",
            "outcome" => "R&R social audits across the 371-village belt",
            "media_type" => "image",
            "img" => "/uploads/ippuru2-1-1024x461-640x480.jpeg",
            "video_url" => "",
            "sort_order" => 6
        ],
        [
            "story_type" => "field_note",
            "tag" => "Governance",
            "place" => "Rampachodavaram",
            "title" => "A panchayat that now keeps its own minutes",
            "body" => "Training in statutory meetings, record keeping and PESA powers meant the difference between a Gram Sabha that was informed and one that decided.",
            "outcome" => "",
            "media_type" => "image",
            "img" => "",
            "video_url" => "",
            "sort_order" => 7
        ],
        [
            "story_type" => "field_note",
            "tag" => "Land Rights",
            "place" => "Buttayigudem",
            "title" => "Land sold under a forged bond, recovered on paper",
            "body" => "Alienated tribal land was traced through revenue records, challenged under the Land Transfer Regulation, and restored to the family that had lost it.",
            "outcome" => "",
            "media_type" => "image",
            "img" => "",
            "video_url" => "",
            "sort_order" => 8
        ],
        [
            "story_type" => "field_note",
            "tag" => "Livelihoods",
            "place" => "Ramavarampadu",
            "title" => "Seeds the village keeps, not buys",
            "body" => "A community seed bank of native millets and pulses returns every season, with farmer stewards maintaining germination and variety.",
            "outcome" => "",
            "media_type" => "image",
            "img" => "",
            "video_url" => "",
            "sort_order" => 9
        ],
        [
            "story_type" => "field_note",
            "tag" => "Identity",
            "place" => "Koduru",
            "title" => "Aadhaar, ration card, voter ID — in one camp day",
            "body" => "Nomadic families excluded from the welfare net were documented in a civil rights camp, opening pensions, ration and school enrolment.",
            "outcome" => "",
            "media_type" => "image",
            "img" => "",
            "video_url" => "",
            "sort_order" => 10
        ]
    ];

    $stmt = $conn->prepare("INSERT INTO stories (story_type, tag, place, title, body, outcome, media_type, img, video_url, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");

    foreach ($initialStories as $s) {
        $stmt->execute([
            $s['story_type'],
            $s['tag'],
            $s['place'],
            $s['title'],
            $s['body'],
            $s['outcome'] ?? '',
            $s['media_type'] ?? 'image',
            $s['img'] ?? '',
            $s['video_url'] ?? '',
            $s['sort_order']
        ]);
    }

    return count($initialStories);
}

// Auto-seed if empty
$cnt = (int)$conn->query("SELECT COUNT(*) FROM stories")->fetchColumn();
if ($cnt === 0) {
    seedStoriesDefaults($conn, false);
} else {
    // If table exists but has no field notes, ensure the 4 standard field notes are inserted
    try {
        $fnCount = (int)$conn->query("SELECT COUNT(*) FROM stories WHERE story_type = 'field_note'")->fetchColumn();
        if ($fnCount === 0) {
            $stmtFn = $conn->prepare("INSERT INTO stories (story_type, tag, place, title, body, outcome, media_type, img, video_url, sort_order, is_active)
                VALUES (?, ?, ?, ?, ?, '', 'image', '', '', ?, 1)");
            $defaultNotes = [
                [
                    "story_type" => "field_note",
                    "tag" => "Governance",
                    "place" => "Rampachodavaram",
                    "title" => "A panchayat that now keeps its own minutes",
                    "body" => "Training in statutory meetings, record keeping and PESA powers meant the difference between a Gram Sabha that was informed and one that decided.",
                    "sort_order" => 7
                ],
                [
                    "story_type" => "field_note",
                    "tag" => "Land Rights",
                    "place" => "Buttayigudem",
                    "title" => "Land sold under a forged bond, recovered on paper",
                    "body" => "Alienated tribal land was traced through revenue records, challenged under the Land Transfer Regulation, and restored to the family that had lost it.",
                    "sort_order" => 8
                ],
                [
                    "story_type" => "field_note",
                    "tag" => "Livelihoods",
                    "place" => "Ramavarampadu",
                    "title" => "Seeds the village keeps, not buys",
                    "body" => "A community seed bank of native millets and pulses returns every season, with farmer stewards maintaining germination and variety.",
                    "sort_order" => 9
                ],
                [
                    "story_type" => "field_note",
                    "tag" => "Identity",
                    "place" => "Koduru",
                    "title" => "Aadhaar, ration card, voter ID — in one camp day",
                    "body" => "Nomadic families excluded from the welfare net were documented in a civil rights camp, opening pensions, ration and school enrolment.",
                    "sort_order" => 10
                ]
            ];
            foreach ($defaultNotes as $fn) {
                $stmtFn->execute([
                    $fn['story_type'],
                    $fn['tag'],
                    $fn['place'],
                    $fn['title'],
                    $fn['body'],
                    $fn['sort_order']
                ]);
            }
        }
    } catch (Exception $e) {}
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET REQUESTS ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id > 0) {
            $stmt = $conn->prepare("SELECT * FROM stories WHERE id = ?");
            $stmt->execute([$id]);
            $story = $stmt->fetch();
            if ($story) {
                storiesRespond(["success" => true, "data" => $story]);
            } else {
                storiesRespond(["success" => false, "message" => "Story not found."], 404);
            }
        }

        $typeFilter = isset($_GET['type']) ? trim($_GET['type']) : '';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        $sql = "SELECT * FROM stories WHERE 1=1";
        $params = [];

        if ($typeFilter !== '' && strtolower($typeFilter) !== 'all') {
            $sql .= " AND story_type = ?";
            $params[] = $typeFilter;
        }

        if ($search !== '') {
            $sql .= " AND (LOWER(title) LIKE LOWER(?) OR LOWER(tag) LIKE LOWER(?) OR LOWER(place) LIKE LOWER(?) OR LOWER(body) LIKE LOWER(?))";
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $sql .= " ORDER BY sort_order ASC, id ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Calculate summary counters
        $totalFeatured = 0;
        $totalFieldNotes = 0;
        $totalVideos = 0;
        $totalPhotos = 0;

        foreach ($rows as $r) {
            if ($r['story_type'] === 'field_note') {
                $totalFieldNotes++;
            } else {
                $totalFeatured++;
            }

            if (($r['media_type'] === 'video' || !empty($r['video_url'])) && $r['story_type'] !== 'field_note') {
                $totalVideos++;
            } else if (!empty($r['img'])) {
                $totalPhotos++;
            }
        }

        // Fetch page settings
        $settings = [];
        try {
            $settingsRows = $conn->query("SELECT setting_key, setting_value FROM stories_settings")->fetchAll();
            foreach ($settingsRows as $sr) {
                $settings[$sr['setting_key']] = $sr['setting_value'];
            }
        } catch (Exception $e) { }

        foreach ($defaultStoriesSettings as $k => $v) {
            if (!isset($settings[$k])) {
                $settings[$k] = $v;
            }
        }

        storiesRespond([
            "success" => true,
            "total" => count($rows),
            "stats_summary" => [
                "total_stories" => count($rows),
                "featured_count" => $totalFeatured,
                "field_notes_count" => $totalFieldNotes,
                "video_stories_count" => $totalVideos,
                "photo_stories_count" => $totalPhotos
            ],
            "settings" => $settings,
            "data" => $rows
        ]);
    } catch (PDOException $e) {
        storiesRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
    }
}

// ── POST REQUESTS ────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? 'save_story';

    // 1. RE-SEED DEFAULTS
    if ($action === 'seed_defaults') {
        try {
            $force = !empty($input['force']);
            $count = seedStoriesDefaults($conn, $force);
            storiesRespond([
                "success" => true,
                "message" => "Successfully synchronized {$count} stories from defaults.",
                "total" => $count
            ]);
        } catch (Exception $e) {
            storiesRespond(["success" => false, "message" => "Seed error: " . $e->getMessage()], 500);
        }
    }

    // 2. CREATE STORY
    if ($action === 'create_story') {
        $title = trim($input['title'] ?? '');
        $tag = trim($input['tag'] ?? 'Field Story');
        $place = trim($input['place'] ?? 'Andhra Pradesh');
        $body = trim($input['body'] ?? '');
        $outcome = trim($input['outcome'] ?? '');
        $storyType = trim($input['story_type'] ?? 'featured');
        $mediaType = trim($input['media_type'] ?? 'image');
        $img = trim($input['img'] ?? '');
        $videoUrl = trim($input['video_url'] ?? '');

        if ($title === '') {
            storiesRespond(["success" => false, "message" => "Story title is required."], 422);
        }

        $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM stories")->fetchColumn();
        $sortOrder = $maxOrder + 1;

        try {
            $stmt = $conn->prepare("INSERT INTO stories (story_type, tag, place, title, body, outcome, media_type, img, video_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$storyType, $tag, $place, $title, $body, $outcome, $mediaType, $img, $videoUrl, $sortOrder]);
            $newId = (int)$conn->lastInsertId();

            storiesRespond([
                "success" => true,
                "message" => "Story '{$title}' created successfully.",
                "data" => [
                    "id" => $newId,
                    "story_type" => $storyType,
                    "tag" => $tag,
                    "place" => $place,
                    "title" => $title,
                    "body" => $body,
                    "outcome" => $outcome,
                    "media_type" => $mediaType,
                    "img" => $img,
                    "video_url" => $videoUrl,
                    "sort_order" => $sortOrder,
                    "is_active" => 1
                ]
            ]);
        } catch (PDOException $e) {
            storiesRespond(["success" => false, "message" => "Failed to create story: " . $e->getMessage()], 500);
        }
    }

    // 3. UPDATE / SAVE STORY
    if ($action === 'update_story' || $action === 'save_story') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            storiesRespond(["success" => false, "message" => "Valid story ID is required."], 422);
        }

        $story = $conn->query("SELECT * FROM stories WHERE id = {$id}")->fetch();
        if (!$story) {
            storiesRespond(["success" => false, "message" => "Story not found."], 404);
        }

        $title = isset($input['title']) ? trim($input['title']) : $story['title'];
        $tag = isset($input['tag']) ? trim($input['tag']) : $story['tag'];
        $place = isset($input['place']) ? trim($input['place']) : $story['place'];
        $body = isset($input['body']) ? trim($input['body']) : $story['body'];
        $outcome = isset($input['outcome']) ? trim($input['outcome']) : $story['outcome'];
        $storyType = isset($input['story_type']) ? trim($input['story_type']) : $story['story_type'];
        $mediaType = isset($input['media_type']) ? trim($input['media_type']) : $story['media_type'];
        $img = isset($input['img']) ? trim($input['img']) : $story['img'];
        $videoUrl = isset($input['video_url']) ? trim($input['video_url']) : $story['video_url'];
        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : (int)$story['sort_order'];
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : (int)$story['is_active'];

        try {
            $stmt = $conn->prepare("UPDATE stories SET story_type = ?, tag = ?, place = ?, title = ?, body = ?, outcome = ?, media_type = ?, img = ?, video_url = ?, sort_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$storyType, $tag, $place, $title, $body, $outcome, $mediaType, $img, $videoUrl, $sortOrder, $isActive, $id]);

            storiesRespond([
                "success" => true,
                "message" => "Story updated successfully.",
                "data" => [
                    "id" => $id,
                    "story_type" => $storyType,
                    "tag" => $tag,
                    "place" => $place,
                    "title" => $title,
                    "body" => $body,
                    "outcome" => $outcome,
                    "media_type" => $mediaType,
                    "img" => $img,
                    "video_url" => $videoUrl,
                    "sort_order" => $sortOrder,
                    "is_active" => $isActive
                ]
            ]);
        } catch (PDOException $e) {
            storiesRespond(["success" => false, "message" => "Failed to update story: " . $e->getMessage()], 500);
        }
    }

    // 4. DELETE STORY
    if ($action === 'delete_story') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            storiesRespond(["success" => false, "message" => "Valid story ID is required."], 422);
        }

        try {
            $conn->exec("DELETE FROM stories WHERE id = {$id}");
            storiesRespond([
                "success" => true,
                "message" => "Story deleted successfully.",
                "deleted_id" => $id
            ]);
        } catch (PDOException $e) {
            storiesRespond(["success" => false, "message" => "Failed to delete story: " . $e->getMessage()], 500);
        }
    }

    // 5. REORDER STORIES
    if ($action === 'reorder_stories') {
        $orderList = $input['order'] ?? [];
        if (!is_array($orderList)) {
            storiesRespond(["success" => false, "message" => "Invalid order format."], 422);
        }

        try {
            $stmt = $conn->prepare("UPDATE stories SET sort_order = ? WHERE id = ?");
            foreach ($orderList as $item) {
                if (isset($item['id'], $item['sort_order'])) {
                    $stmt->execute([(int)$item['sort_order'], (int)$item['id']]);
                }
            }
            storiesRespond(["success" => true, "message" => "Stories order updated successfully."]);
        } catch (PDOException $e) {
            storiesRespond(["success" => false, "message" => "Failed to reorder: " . $e->getMessage()], 500);
        }
    }

    // 6. SAVE STORIES SETTINGS (Section Headers, Programme Links, CTA)
    if ($action === 'save_settings') {
        $settings = $input['settings'] ?? [];
        if (!is_array($settings)) {
            storiesRespond(["success" => false, "message" => "Settings map is required."], 422);
        }
        try {
            $stmt = $conn->prepare("INSERT INTO stories_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            foreach ($settings as $k => $v) {
                if (is_array($v)) {
                    $v = json_encode($v);
                }
                $stmt->execute([(string)$k, (string)$v]);
            }
            storiesRespond(["success" => true, "message" => "Stories page settings saved successfully."]);
        } catch (PDOException $e) {
            storiesRespond(["success" => false, "message" => "Failed to save settings: " . $e->getMessage()], 500);
        }
    }

    storiesRespond(["success" => false, "message" => "Unknown action '{$action}'."], 400);
}

storiesRespond(["success" => false, "message" => "Method not allowed."], 405);

