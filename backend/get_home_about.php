<?php
require_once __DIR__ . '/config.php';

$defaultAbout = [
    "years_number" => "20+",
    "years_label" => "Years of Service",
    "image_url" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
    "tag" => "Who We Are",
    "title" => "Championing Adivasi Rights and Sustainable Development",
    "lead_text" => "Led by YL Jayaraj with 47 years of NGO experience, ALERT specializes in empowering Adivasis in Andhra Pradesh.",
    "p1" => "ALERT, established in 2004, is a South India-based not-for-profit organization headquartered in Vijayawada. The organization focuses on ensuring effective implementation of affirmative legislations, securing forest rights, and promoting self-governance.",
    "p2" => "ALERT partners with Adivasi Mahasabha, advocating for Adivasi rights and sustainable development, supporting thousands of acres of individual and community forest rights besides facilitating effective service delivery.",
    "features" => [
        "Forest Rights Secured",
        "Women Empowerment",
        "Sustainable Livelihoods",
        "Self-Governance",
        "Natural Resources",
        "Disaster Relief"
    ],
    "btn1_text" => "Learn More",
    "btn1_link" => "/about",
    "btn2_text" => "Get Involved",
    "btn2_link" => "/contact"
];

if ($conn) {
    try {
        $stmt = $conn->query("SELECT * FROM home_about ORDER BY id DESC LIMIT 1");
        $row = $stmt->fetch();
        if ($row) {
            $features = [];
            if (!empty($row['features_json'])) {
                $decoded = json_decode($row['features_json'], true);
                if (is_array($decoded)) $features = $decoded;
            }
            if (empty($features)) $features = $defaultAbout['features'];

            echo json_encode([
                "success" => true,
                "data" => array_merge($defaultAbout, $row, ["features" => $features])
            ]);
            exit;
        }
    } catch (PDOException $e) {
        // Fallback below
    }
}

echo json_encode(["success" => true, "data" => $defaultAbout]);
