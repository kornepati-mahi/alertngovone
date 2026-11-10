<?php
require_once __DIR__ . '/config.php';

$defaultStats = [
    ["metric_key" => "acres_secured", "metric_label" => "Acres Forest Rights Secured", "metric_value" => 15000, "suffix" => "+"],
    ["metric_key" => "tribal_families", "metric_label" => "Adivasi Families Supported", "metric_value" => 25000, "suffix" => "+"],
    ["metric_key" => "polavaram_villages", "metric_label" => "Submergence Villages Monitored", "metric_value" => 371, "suffix" => ""],
    ["metric_key" => "solar_hamlets", "metric_label" => "Off-Grid Solar Hamlets Energized", "metric_value" => 75, "suffix" => "+"],
    ["metric_key" => "women_fisheries", "metric_label" => "Yenadi Women in Cooperatives", "metric_value" => 3500, "suffix" => "+"],
    ["metric_key" => "flood_relief", "metric_label" => "Families Emergency Relieved", "metric_value" => 4200, "suffix" => "+"]
];

if ($conn) {
    try {
        $stmt = $conn->query("SELECT metric_key, metric_label, metric_value, suffix FROM impact_stats");
        $stats = $stmt->fetchAll();
        if ($stats && count($stats) > 0) {
            echo json_encode(["success" => true, "data" => $stats]);
            exit;
        }
    } catch (PDOException $e) {}
}

echo json_encode(["success" => true, "data" => $defaultStats]);
