<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$category = isset($_GET['category']) ? trim($_GET['category']) : null;
$results = [];
$seenSlugs = [];

// 1. Fetch from MySQL site_all_pages table if available
if ($conn) {
    try {
        $sqlAll = "SELECT slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM site_all_pages WHERE is_active = 1";
        $paramsAll = [];
        if ($category && strtolower($category) !== 'all') {
            $sqlAll .= " AND (LOWER(category) = LOWER(?) OR LOWER(category) LIKE LOWER(?))";
            $paramsAll = [$category, '%' . $category . '%'];
        }
        $sqlAll .= " ORDER BY sort_order ASC, id ASC";

        $stmtAll = $conn->prepare($sqlAll);
        $stmtAll->execute($paramsAll);
        $rowsAll = $stmtAll->fetchAll();

        foreach ($rowsAll as $r) {
            $slug = trim($r['slug']);
            if (isset($seenSlugs[$slug])) continue;
            $seenSlugs[$slug] = true;
            $content = json_decode($r['content_json'] ?? '{}', true) ?: [];

            $tables = $content['tables'] ?? [];
            $images = $content['images'] ?? [];
            $downloads = $content['downloads'] ?? [];
            $paragraphs = $content['paragraphs'] ?? [];
            $videos = $content['videos'] ?? [];

            $firstPara = '';
            if (!empty($paragraphs)) {
                $p0 = is_string($paragraphs[0]) ? $paragraphs[0] : ($paragraphs[0]['text'] ?? '');
                $firstPara = mb_substr(strip_tags($p0), 0, 160) . '...';
            }

            $results[] = [
                'slug' => $slug,
                'nav_label' => $r['nav_label'] ?: $r['title'],
                'title' => $r['title'],
                'category' => $r['category'] ?: "General",
                'badge' => $r['badge'] ?: $r['category'],
                'subtitle' => $r['subtitle'] ?: "",
                'tables_count' => count($tables),
                'images_count' => count($images),
                'downloads_count' => count($downloads),
                'videos_count' => count($videos),
                'url' => "/" . $slug,
                'excerpt' => $firstPara
            ];
        }
    } catch (PDOException $e) {
        // Fallback to specific tables
    }

    try {
        $sql = "SELECT slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM polavaram_pages";
        $params = [];
        if ($category) {
            $sql .= " WHERE LOWER(category) = LOWER(?) OR LOWER(category) LIKE LOWER(?)";
            $params = [$category, '%' . $category . '%'];
        }
        $sql .= " ORDER BY sort_order ASC, id ASC";

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as $r) {
            $slug = trim($r['slug']);
            if (isset($seenSlugs[$slug])) continue;
            $seenSlugs[$slug] = true;
            $content = json_decode($r['content_json'] ?? '{}', true) ?: [];

            $tables = $content['tables'] ?? [];
            $images = $content['images'] ?? [];
            $downloads = $content['downloads'] ?? [];
            $paragraphs = $content['paragraphs'] ?? [];

            $results[] = [
                'slug' => $slug,
                'nav_label' => $r['nav_label'] ?: $r['title'],
                'title' => $r['title'],
                'category' => $r['category'] ?: "Polavaram Project",
                'badge' => $r['badge'] ?: "Polavaram PIP",
                'subtitle' => $r['subtitle'] ?: "",
                'tables_count' => count($tables),
                'images_count' => count($images),
                'downloads_count' => count($downloads),
                'url' => "/" . $slug,
                'excerpt' => !empty($paragraphs) ? substr($paragraphs[0], 0, 160) . '...' : ''
            ];
        }

        // Also fetch from la_rr_pages table if available
        $sqlLarr = "SELECT slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM la_rr_pages";
        $paramsLarr = [];
        if ($category) {
            $sqlLarr .= " WHERE LOWER(category) = LOWER(?) OR LOWER(category) LIKE LOWER(?)";
            $paramsLarr = [$category, '%' . $category . '%'];
        }
        $sqlLarr .= " ORDER BY sort_order ASC, id ASC";

        $stmtLarr = $conn->prepare($sqlLarr);
        $stmtLarr->execute($paramsLarr);
        $rowsLarr = $stmtLarr->fetchAll();

        foreach ($rowsLarr as $r) {
            $slug = trim($r['slug']);
            if (isset($seenSlugs[$slug])) continue;
            $seenSlugs[$slug] = true;
            $content = json_decode($r['content_json'] ?? '{}', true) ?: [];

            $tables = $content['tables'] ?? [];
            $images = $content['images'] ?? [];
            $downloads = $content['downloads'] ?? [];
            $paragraphs = $content['paragraphs'] ?? [];

            $results[] = [
                'slug' => $slug,
                'nav_label' => $r['nav_label'] ?: $r['title'],
                'title' => $r['title'],
                'category' => $r['category'] ?: "LA & RR",
                'badge' => $r['badge'] ?: "LA & RR Project",
                'subtitle' => $r['subtitle'] ?: "",
                'tables_count' => count($tables),
                'images_count' => count($images),
                'downloads_count' => count($downloads),
                'url' => "/" . $slug,
                'excerpt' => !empty($paragraphs) ? substr($paragraphs[0], 0, 160) . '...' : ''
            ];
        }
    } catch (PDOException $e) {
        // Fallback to static JSON
    }
}

// 2. Fetch from static all_site_pages.json for any other pages
$dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $data = json_decode($json, true) ?: [];

    foreach ($data as $slugKey => $page) {
        $slug = trim($page['slug'] ?? $slugKey);
        if (isset($seenSlugs[$slug])) {
            continue; // Already loaded latest version from database
        }
        $seenSlugs[$slug] = true;

        if ($category) {
            $catLower = strtolower($category);
            $pageCatLower = strtolower($page['category'] ?? '');
            if ($catLower !== $pageCatLower && strpos($pageCatLower, $catLower) === false) {
                continue;
            }
        }

        $tables = $page['tables'] ?? [];
        $images = $page['images'] ?? [];
        $downloads = $page['downloads'] ?? [];
        $paragraphs = $page['paragraphs'] ?? [];

        $results[] = [
            'slug' => $page['slug'] ?? $slug,
            'title' => $page['title'] ?? $slug,
            'category' => $page['category'] ?? 'General',
            'tables_count' => count($tables),
            'images_count' => count($images),
            'downloads_count' => count($downloads),
            'url' => "/" . ($page['slug'] ?? $slug),
            'excerpt' => !empty($paragraphs) ? substr($paragraphs[0], 0, 160) . '...' : ''
        ];
    }
}

echo json_encode([
    "success" => true,
    "total" => count($results),
    "data" => $results
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
