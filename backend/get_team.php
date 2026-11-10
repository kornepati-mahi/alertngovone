<?php
require_once __DIR__ . '/config.php';

$defaultTeam = [
    [
        "id" => 1,
        "name" => "Prof. Ch. Diwakar Babu",
        "role" => "President",
        "image_url" => "/uploads/Divakar-Babu.jpg",
        "img" => "/uploads/Divakar-Babu.jpg",
        "bio" => "Renowned legal scholar, former Principal of V.R. Law College, and constitutional rights specialist guiding ALERT's legal interventions in tribal fifth-scheduled areas.",
        "highlights" => ["Principal VR Law College", "Constitutional Rights Expert", "Appellate Litigation Advisor"],
        "quote" => "Justice is non-negotiable for the indigenous forest dwelling communities.",
        "badge" => "Board of Directors",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "id" => 2,
        "name" => "Mr V. Rama Krishna",
        "role" => "Vice President",
        "image_url" => "/uploads/Ramakrishna.jpg",
        "img" => "/uploads/Ramakrishna.jpg",
        "bio" => "Senior development activist specializing in rural livelihood cooperatives, grassroots agrarian sustainability, and natural resource stewardship for forest hamlets.",
        "highlights" => ["Rural Livelihood Cooperatives", "Community Mobilization", "Natural Resource Policy"],
        "quote" => "Self-reliance begins when communities govern their own indigenous land.",
        "badge" => "Board of Directors",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "id" => 3,
        "name" => "Mr Y.L.J.B. Jayaraj",
        "role" => "Secretary & Director",
        "image_url" => "/uploads/jayaraj-sir.jpg",
        "img" => "/uploads/jayaraj-sir.jpg",
        "bio" => "Founder & Chief Functionary with 47+ years of grass-roots human rights, affirmative tribal advocacy, and institutional leadership across Andhra Pradesh.",
        "highlights" => ["47+ Years Grassroots Leadership", "FRA & PESA Enforcement Specialist", "Disaster Relief Coordinator"],
        "quote" => "Every tribal settlement has a constitutional right to sovereignty, dignity, and flourishing.",
        "badge" => "Founder & Director",
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "id" => 4,
        "name" => "Ms P. Sirisha",
        "role" => "Treasurer",
        "image_url" => "/uploads/Sirisha-1.jpg",
        "img" => "/uploads/Sirisha-1.jpg",
        "bio" => "Development finance specialist overseeing statutory financial auditing, reporting, and regulatory compliances under FCRA and Indian Income Tax regulations.",
        "highlights" => ["12A & 80G Compliances", "Statutory Financial Auditing", "Transparent Donor Reporting"],
        "quote" => "Uncompromising integrity and financial transparency are our core tenets.",
        "badge" => "Board of Directors",
        "sort_order" => 4,
        "is_active" => 1
    ],
    [
        "id" => 5,
        "name" => "Mr J. Prasad",
        "role" => "Executive Member",
        "image_url" => "/uploads/Jillela-Prasad-1-3.png",
        "img" => "/uploads/Jillela-Prasad-1-3.png",
        "bio" => "Community organizer actively directing field campaigns on Forest Rights (RoFR 2006), GPS boundary demarcation, and Gram Sabha empowerment across Godavari agency mandals.",
        "highlights" => ["RoFR Patta Verification", "Gram Sabha Mobilizer", "Youth Leadership Training"],
        "quote" => "The Gram Sabha is the true sovereign custodian of our ancestral forests.",
        "badge" => "Board of Directors",
        "sort_order" => 5,
        "is_active" => 1
    ],
    [
        "id" => 6,
        "name" => "Ms K.L. Nancharamma",
        "role" => "Executive Member",
        "image_url" => "/uploads/Nancharamma-1-1.png",
        "img" => "/uploads/Nancharamma-1-1.png",
        "bio" => "Indigenous community leader championing Yenadi women rights, healthcare access, and the Antyodaya Matsya Mithra fisheries cooperative federation.",
        "highlights" => ["Antyodaya Women Leader", "Fisheries Cooperative Builder", "Indigenous Gender Rights"],
        "quote" => "When women lead economic cooperatives, entire tribal habitations rise.",
        "badge" => "Board of Directors",
        "sort_order" => 6,
        "is_active" => 1
    ],
    [
        "id" => 7,
        "name" => "Ms N. Silpa",
        "role" => "Executive Member",
        "image_url" => "/uploads/silpa-1.png",
        "img" => "/uploads/silpa-1.png",
        "bio" => "Field intervention coordinator focusing on tribal youth digital informatics, ashram school education equity, and flood disaster relief logistical operations.",
        "highlights" => ["Tribal Youth Informatics", "Ashram School Advocacy", "Emergency Relief Operations"],
        "quote" => "Education and digital access are the strongest equalizers for tribal youth.",
        "badge" => "Board of Directors",
        "sort_order" => 7,
        "is_active" => 1
    ]
];

if ($conn) {
    try {
        $stmt = $conn->query("SELECT id, name, role, image_url, bio, highlights_json, quote, badge, sort_order, is_active FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        if ($rows && count($rows) > 0) {
            foreach ($rows as &$r) {
                $r['img'] = $r['image_url'];
                $r['highlights'] = [];
                if (!empty($r['highlights_json'])) {
                    $decoded = json_decode($r['highlights_json'], true);
                    if (is_array($decoded)) $r['highlights'] = $decoded;
                }
            }
            echo json_encode(["success" => true, "data" => $rows]);
            exit;
        }
    } catch (PDOException $e) {
        // Table might not exist yet, fallback gracefully
    }
}

echo json_encode(["success" => true, "data" => $defaultTeam]);
