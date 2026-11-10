<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON payload"]);
    exit();
}

$trackingCode   = isset($input['tracking_code']) ? trim($input['tracking_code']) : ('ALT-GRV-' . rand(100000, 999999));
$name           = isset($input['name']) ? trim($input['name']) : '';
$aadhaar        = isset($input['aadhaar']) ? trim($input['aadhaar']) : '';
$phone          = isset($input['phone']) ? trim($input['phone']) : '';
$village        = isset($input['village']) ? trim($input['village']) : '';
$mandal         = isset($input['mandal']) ? trim($input['mandal']) : '';
$district       = isset($input['district']) ? trim($input['district']) : 'Alluri Sitharama Raju';
$grievanceType  = isset($input['grievanceType']) ? trim($input['grievanceType']) : 'General';
$description    = isset($input['description']) ? trim($input['description']) : '';

if (empty($name) || empty($phone) || empty($village) || empty($description)) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Name, phone, village and description are required."]);
    exit();
}

try {
    // Create table if it does not exist
    $conn->exec("CREATE TABLE IF NOT EXISTS `grievances` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `tracking_code` VARCHAR(50) UNIQUE NOT NULL,
        `name` VARCHAR(150) NOT NULL,
        `aadhaar` VARCHAR(20) NULL,
        `phone` VARCHAR(30) NOT NULL,
        `village` VARCHAR(100) NOT NULL,
        `mandal` VARCHAR(100) NOT NULL,
        `district` VARCHAR(100) NOT NULL,
        `grievance_type` VARCHAR(150) NOT NULL,
        `description` TEXT NOT NULL,
        `status` ENUM('registered', 'under_investigation', 'submitted_to_sdc', 'resolved') DEFAULT 'registered',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $stmt = $conn->prepare("INSERT INTO grievances 
        (tracking_code, name, aadhaar, phone, village, mandal, district, grievance_type, description) 
        VALUES (:tracking, :name, :aadhaar, :phone, :village, :mandal, :district, :gtype, :description)");

    $stmt->execute([
        ':tracking'    => $trackingCode,
        ':name'        => $name,
        ':aadhaar'     => $aadhaar,
        ':phone'       => $phone,
        ':village'     => $village,
        ':mandal'      => $mandal,
        ':district'    => $district,
        ':gtype'       => $grievanceType,
        ':description' => $description
    ]);

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Grievance registered successfully.",
        "tracking_code" => $trackingCode,
        "grievance_id" => $conn->lastInsertId()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to lodge grievance: " . $e->getMessage()]);
}
