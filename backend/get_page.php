<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

if (!$slug) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Page slug parameter is required."]);
    exit;
}

// 1. Check site_all_pages and section database tables first
if ($conn) {
    try {
        $stmt = $conn->prepare("SELECT slug, nav_label, title, category, badge, subtitle, content_json FROM site_all_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
        $stmt->execute([$slug, $slug]);
        $pRow = $stmt->fetch();

        if (!$pRow) {
            $stmt = $conn->prepare("SELECT slug, nav_label, title, category, badge, subtitle, content_json FROM polavaram_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $pRow = $stmt->fetch();
        }

        if (!$pRow) {
            $stmt = $conn->prepare("SELECT slug, nav_label, title, category, badge, subtitle, content_json FROM la_rr_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $pRow = $stmt->fetch();
        }

        if (!$pRow) {
            $stmt = $conn->prepare("SELECT slug, nav_label, title, category, badge, subtitle, content_json FROM rofr_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $pRow = $stmt->fetch();
        }

        if (!$pRow) {
            $stmt = $conn->prepare("SELECT slug, nav_label, title, category, badge, subtitle, content_json FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $pRow = $stmt->fetch();
        }

        if (!$pRow) {
            $stmt = $conn->prepare("SELECT slug, nav_label, title, category, badge, subtitle, content_json FROM achievements_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $pRow = $stmt->fetch();
        }

        if ($pRow) {
            $content = json_decode($pRow['content_json'] ?? '{}', true) ?: [];
            
            // Normalize images
            $images = $content['images'] ?? [];
            $normalizedImages = [];
            $extractedVideos = $content['videos'] ?? [];

            foreach ($images as $img) {
                $src = $img['src'] ?? ($img['url'] ?? '');
                $name = $img['name'] ?? ($img['caption'] ?? ($img['alt'] ?? 'Official Map / Photo'));
                $alt = $img['alt'] ?? ($img['name'] ?? $name);
                $caption = $img['caption'] ?? ($img['name'] ?? $name);

                // If file extension is a video format, add to videos
                if (preg_match('/\.(mp4|webm|mov|ogg)$/i', $src)) {
                    $extractedVideos[] = [
                        "url" => $src,
                        "title" => $name,
                        "description" => $caption,
                        "type" => "video"
                    ];
                } else {
                    $normalizedImages[] = [
                        "src" => $src,
                        "url" => $src,
                        "name" => $name,
                        "alt" => $alt,
                        "caption" => $caption
                    ];
                }
            }

            $pageData = array_merge($content, [
                "slug" => $pRow['slug'],
                "title" => $pRow['title'],
                "nav_label" => $pRow['nav_label'] ?? ($content['nav_label'] ?? $pRow['title']),
                "category" => $pRow['category'] ?: ($content['category'] ?? "Official Record"),
                "badge" => $pRow['badge'] ?: ($content['badge'] ?? "ALERT Document"),
                "subtitle" => $pRow['subtitle'],
                "paragraphs" => $content['paragraphs'] ?? [],
                "downloads" => $content['downloads'] ?? [],
                "tables" => $content['tables'] ?? [],
                "images" => $normalizedImages,
                "videos" => $extractedVideos,
                "stats" => $content['stats'] ?? [],
                "content" => array_merge($content, [
                    "slug" => $pRow['slug'],
                    "title" => $pRow['title'],
                    "nav_label" => $pRow['nav_label'] ?? ($content['nav_label'] ?? $pRow['title']),
                    "category" => $pRow['category'] ?: ($content['category'] ?? "Official Record"),
                    "badge" => $pRow['badge'] ?: ($content['badge'] ?? "ALERT Document"),
                    "subtitle" => $pRow['subtitle'],
                    "paragraphs" => $content['paragraphs'] ?? [],
                    "downloads" => $content['downloads'] ?? [],
                    "tables" => $content['tables'] ?? [],
                    "images" => $normalizedImages,
                    "videos" => $extractedVideos,
                    "stats" => $content['stats'] ?? []
                ])
            ]);
            echo json_encode([
                "success" => true,
                "data" => $pageData
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            exit;
        }
    } catch (PDOException $e) {
        // Fallback to static JSON file
    }
}

$dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';

if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $data = json_decode($json, true);
    
    // Exact or normalized match
    $matched = null;
    $slugClean = strtolower($slug);
    
    if (isset($data[$slugClean])) {
        $matched = $data[$slugClean];
    } else {
        foreach ($data as $k => $v) {
            if (strtolower($k) === $slugClean || strtolower($v['slug']) === $slugClean) {
                $matched = $v;
                break;
            }
        }
    }
    
    if ($matched) {
        echo json_encode([
            "success" => true,
            "data" => $matched
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Page with slug '{$slug}' not found."]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Pages data file not found."]);
}
