<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultFeatured = [
    [
        "img" => "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
        "tag" => "Forest Rights",
        "place" => "Maredumilli Mandal, ASR District",
        "title" => "The resolution that turned a forest into a legal record",
        "body" => "For years the hamlet's bamboo and tendu collection was treated as encroachment. A Gram Sabha resolution, a resource map drawn village by village, and a community forest rights claim changed that: the forest the elders had guarded was finally written into the record as theirs.",
        "outcome" => "CFR claim filed with Gram Sabha endorsement",
        "story_type" => "featured",
        "media_type" => "image",
        "video_url" => ""
    ],
    [
        "img" => "/uploads/coastal-krishna-fishing.jpg",
        "tag" => "Women Cooperatives",
        "place" => "Machilipatnam Mandal, Krishna District",
        "title" => "Matsya Mithra: from auction floor to co-operative ledger",
        "body" => "Yenadi fisherwomen once sold the morning catch at whatever the middleman offered. Organised into savings groups and registered cooperatives, they now fix their own price, run cold storage links, and lend from their own revolving fund instead of the moneylender's.",
        "outcome" => "Federation of 3,500+ members across 6 mandals",
        "story_type" => "featured",
        "media_type" => "image",
        "video_url" => ""
    ],
    [
        "img" => "/uploads/l-1.jpg",
        "tag" => "Child Rights",
        "place" => "Chinturu ITDA, Godavari Agency",
        "title" => "A classroom that begins in Koya",
        "body" => "Children who stopped at the first difficult sentence were not failing school — school was arriving in a language they had never heard. Joyful learning centres started lessons in the mother tongue, moved on to Telugu, and carried tribal folk content into the syllabus.",
        "outcome" => "Mother-tongue learning centres in agency hamlets",
        "story_type" => "featured",
        "media_type" => "image",
        "video_url" => ""
    ],
    [
        "img" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
        "tag" => "Clean Energy",
        "place" => "Devipatnam Mandal, Godavari Gorge",
        "title" => "The first evening the hamlet kept its lights on",
        "body" => "Kerosene meant a lamp that smoked, a bill that ate a week's income, and children who could not study after dark. Solar home lighting and a street pole at the junction changed the timetable: the shop stayed open, the children finished their homework.",
        "outcome" => "75+ off-grid hamlets with solar lighting",
        "story_type" => "featured",
        "media_type" => "image",
        "video_url" => ""
    ],
    [
        "img" => "/uploads/all2023.jpeg",
        "tag" => "Disaster Relief",
        "place" => "Kunavaram Mandal, Godavari Basin",
        "title" => "Boats before the water reached the steps",
        "body" => "When the Godavari rose, the first help was not a government truck — it was neighbours with boats, moving families, grain and livestock to the relief camp. ALERT's field teams ran ration, sanitary kits and winter blankets alongside post-flood disinfection.",
        "outcome" => "Rescue, ration and rehabilitation response 2020–2023",
        "story_type" => "featured",
        "media_type" => "image",
        "video_url" => ""
    ],
    [
        "img" => "/uploads/ippuru2-1-1024x461-640x480.jpeg",
        "tag" => "Polavaram LA & R&R",
        "place" => "Polavaram Mandal, Eluru District",
        "title" => "Counting every family the award list forgot",
        "body" => "Project displacement is decided in columns of a register. Household surveys and social audits in the submergence belt put names, land parcels and adult-youth entitlements back on paper — the evidence that later became representations and writ petitions.",
        "outcome" => "R&R social audits across the 371-village belt",
        "story_type" => "featured",
        "media_type" => "image",
        "video_url" => ""
    ]
];

$defaultFieldNotes = [
    [
        "tag" => "Governance",
        "place" => "Rampachodavaram",
        "title" => "A panchayat that now keeps its own minutes",
        "body" => "Training in statutory meetings, record keeping and PESA powers meant the difference between a Gram Sabha that was informed and one that decided.",
        "story_type" => "field_note"
    ],
    [
        "tag" => "Land Rights",
        "place" => "Buttayigudem",
        "title" => "Land sold under a forged bond, recovered on paper",
        "body" => "Alienated tribal land was traced through revenue records, challenged under the Land Transfer Regulation, and restored to the family that had lost it.",
        "story_type" => "field_note"
    ],
    [
        "tag" => "Livelihoods",
        "place" => "Ramavarampadu",
        "title" => "Seeds the village keeps, not buys",
        "body" => "A community seed bank of native millets and pulses returns every season, with farmer stewards maintaining germination and variety.",
        "story_type" => "field_note"
    ],
    [
        "tag" => "Identity",
        "place" => "Koduru",
        "title" => "Aadhaar, ration card, voter ID — in one camp day",
        "body" => "Nomadic families excluded from the welfare net were documented in a civil rights camp, opening pensions, ration and school enrolment.",
        "story_type" => "field_note"
    ]
];

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

if (!$conn) {
    echo json_encode([
        "success" => true,
        "featured" => $defaultFeatured,
        "field_notes" => $defaultFieldNotes,
        "all" => array_merge($defaultFeatured, $defaultFieldNotes),
        "settings" => $defaultStoriesSettings,
        "data" => [
            "featured" => $defaultFeatured,
            "field_notes" => $defaultFieldNotes,
            "all" => array_merge($defaultFeatured, $defaultFieldNotes),
            "settings" => $defaultStoriesSettings
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

try {
    // Check if table exists
    $tableExists = $conn->query("SHOW TABLES LIKE 'stories'")->rowCount() > 0;
    if (!$tableExists) {
        echo json_encode([
            "success" => true,
            "featured" => $defaultFeatured,
            "field_notes" => $defaultFieldNotes,
            "all" => array_merge($defaultFeatured, $defaultFieldNotes),
            "settings" => $defaultStoriesSettings,
            "data" => [
                "featured" => $defaultFeatured,
                "field_notes" => $defaultFieldNotes,
                "all" => array_merge($defaultFeatured, $defaultFieldNotes),
                "settings" => $defaultStoriesSettings
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // Ensure settings table exists
    $conn->exec("CREATE TABLE IF NOT EXISTS `stories_settings` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `setting_key` VARCHAR(100) NOT NULL UNIQUE,
        `setting_value` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

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

    // Ensure field notes exist if table is populated only with featured stories
    try {
        $fnCount = (int)$conn->query("SELECT COUNT(*) FROM stories WHERE story_type = 'field_note'")->fetchColumn();
        if ($fnCount === 0) {
            $stmtFn = $conn->prepare("INSERT INTO stories (story_type, tag, place, title, body, outcome, media_type, img, video_url, sort_order, is_active)
                VALUES (?, ?, ?, ?, ?, '', 'image', '', '', ?, 1)");
            $seedNotes = [
                ["field_note", "Governance", "Rampachodavaram", "A panchayat that now keeps its own minutes", "Training in statutory meetings, record keeping and PESA powers meant the difference between a Gram Sabha that was informed and one that decided.", 7],
                ["field_note", "Land Rights", "Buttayigudem", "Land sold under a forged bond, recovered on paper", "Alienated tribal land was traced through revenue records, challenged under the Land Transfer Regulation, and restored to the family that had lost it.", 8],
                ["field_note", "Livelihoods", "Ramavarampadu", "Seeds the village keeps, not buys", "A community seed bank of native millets and pulses returns every season, with farmer stewards maintaining germination and variety.", 9],
                ["field_note", "Identity", "Koduru", "Aadhaar, ration card, voter ID — in one camp day", "Nomadic families excluded from the welfare net were documented in a civil rights camp, opening pensions, ration and school enrolment.", 10]
            ];
            foreach ($seedNotes as $sn) {
                $stmtFn->execute($sn);
            }
        }
    } catch (Exception $e) {}

    $stmt = $conn->query("SELECT * FROM stories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    $rows = $stmt->fetchAll();

    if (empty($rows)) {
        echo json_encode([
            "success" => true,
            "featured" => $defaultFeatured,
            "field_notes" => $defaultFieldNotes,
            "all" => array_merge($defaultFeatured, $defaultFieldNotes),
            "settings" => $settings,
            "data" => [
                "featured" => $defaultFeatured,
                "field_notes" => $defaultFieldNotes,
                "all" => array_merge($defaultFeatured, $defaultFieldNotes),
                "settings" => $settings
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    $featured = [];
    $fieldNotes = [];
    $all = [];

    foreach ($rows as $r) {
        $item = [
            "id" => (int)$r['id'],
            "tag" => $r['tag'],
            "place" => $r['place'],
            "title" => $r['title'],
            "body" => $r['body'],
            "outcome" => $r['outcome'] ?? '',
            "story_type" => $r['story_type'] ?: 'featured',
            "media_type" => $r['media_type'] ?: 'image',
            "img" => $r['img'] ?? '',
            "video_url" => $r['video_url'] ?? '',
            "sort_order" => (int)$r['sort_order'],
            "is_active" => (int)$r['is_active']
        ];

        $all[] = $item;
        if ($item['story_type'] === 'field_note') {
            $fieldNotes[] = $item;
        } else {
            $featured[] = $item;
        }
    }

    echo json_encode([
        "success" => true,
        "featured" => $featured,
        "field_notes" => $fieldNotes,
        "all" => $all,
        "settings" => $settings,
        "data" => [
            "featured" => $featured,
            "field_notes" => $fieldNotes,
            "all" => $all,
            "settings" => $settings
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        "success" => true,
        "featured" => $defaultFeatured,
        "field_notes" => $defaultFieldNotes,
        "all" => array_merge($defaultFeatured, $defaultFieldNotes),
        "settings" => $defaultStoriesSettings,
        "data" => [
            "featured" => $defaultFeatured,
            "field_notes" => $defaultFieldNotes,
            "all" => array_merge($defaultFeatured, $defaultFieldNotes),
            "settings" => $defaultStoriesSettings
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

