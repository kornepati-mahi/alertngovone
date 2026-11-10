<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultSettings = [
    "page_badge" => "Make an Impact",
    "page_title" => "Your Donation Changes Lives",
    "page_description" => "Every donation to ALERT directly supports Adivasi communities in Andhra Pradesh. Your contribution funds forest rights advocacy, women empowerment programs, solar energy access, and sustainable livelihood initiatives.",
    "tax_note" => "ALERT is registered under Section 12A & 80G of the Indian Income Tax Act. All donations are 50% tax-exempt.",
    "preset_amounts" => [500, 1000, 2500, 5000, 10000, 25000],
    "impact_tiers" => [
        [
            "id" => 1,
            "amount" => 500,
            "title" => "Forest Rights Documentation",
            "impact" => "Supports forest rights documentation and CFR claim submission for 1 family"
        ],
        [
            "id" => 2,
            "amount" => 1000,
            "title" => "Solar Energy Access",
            "impact" => "Provides clean solar lantern to a remote, un-electrified hill village household"
        ],
        [
            "id" => 3,
            "amount" => 5000,
            "title" => "Women Cooperative Training",
            "impact" => "Funds one month of skill training & seed capital for women's fishery cooperative"
        ],
        [
            "id" => 4,
            "amount" => 10000,
            "title" => "High Court Legal Defense",
            "impact" => "Supports legal aid, writ petition filing, and High Court representation for displaced families"
        ],
        [
            "id" => 5,
            "amount" => 25000,
            "title" => "Community Drinking Water",
            "impact" => "Helps install a community solar-powered drinking water filtration system in a tribal hamlet"
        ]
    ],
    "trust_badges" => [
        [ "icon" => "shield", "label" => "Secure & Trusted" ],
        [ "icon" => "receipt", "label" => "80G Tax Exempt" ],
        [ "icon" => "heart", "label" => "100% Impact" ]
    ],
    "qr_code_image" => "/uploads/alert-donation-qr.png",
    "upi_id" => "alert.ngo@upi",
    "upi_name" => "Association for Land and Livelihood (ALERT)",
    "payment_instructions" => "1. Scan the QR code using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.\n2. Complete the payment for your selected donation amount.\n3. Take a screenshot of the completed payment and upload it below.\n4. Enter the 12-digit UPI UTR / Transaction reference number.",
    "require_screenshot" => 1,
    "bank_details" => [
        [ "label" => "Account Name", "value" => "Association for Land and Livelihood" ],
        [ "label" => "Account Number", "value" => "39201948572" ],
        [ "label" => "IFSC Code", "value" => "SBIN0001845" ],
        [ "label" => "Bank", "value" => "State Bank of India, Benz Circle Branch, Vijayawada" ],
        [ "label" => "UPI ID", "value" => "alert.ngo@upi" ],
        [ "label" => "Contact Helpline", "value" => "+91 866 2482345 / +91 94401 82940" ]
    ]
];

if (!$conn) {
    echo json_encode(["success" => true, "data" => $defaultSettings, "source" => "fallback"]);
    exit;
}

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `donate_settings` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `settings_json` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $stmt = $conn->query("SELECT settings_json FROM donate_settings WHERE id = 1 LIMIT 1");
    $row = $stmt ? $stmt->fetch() : null;

    if ($row && !empty($row['settings_json'])) {
        $saved = json_decode($row['settings_json'], true);
        if (is_array($saved)) {
            $merged = array_merge($defaultSettings, $saved);
            echo json_encode(["success" => true, "data" => $merged]);
            exit;
        }
    }

    // Auto-seed initial settings
    $initJson = json_encode($defaultSettings, JSON_UNESCAPED_UNICODE);
    $ins = $conn->prepare("INSERT INTO donate_settings (id, settings_json) VALUES (1, ?) ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json)");
    $ins->execute([$initJson]);

    echo json_encode(["success" => true, "data" => $defaultSettings, "source" => "seeded"]);
} catch (Exception $e) {
    echo json_encode(["success" => true, "data" => $defaultSettings, "source" => "error_fallback", "error" => $e->getMessage()]);
}

