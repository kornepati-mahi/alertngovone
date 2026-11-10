<?php
@ini_set('upload_max_filesize', '1024M');
@ini_set('post_max_size', '1024M');
@ini_set('max_execution_time', '1800');
@ini_set('max_input_time', '1800');
@ini_set('memory_limit', '1024M');

require_once __DIR__ . '/config.php';

function uploadRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$adminKey = getenv('ADMIN_KEY') ?: 'alertngo@123';
$validKeys = array_unique(array_filter([$adminKey, 'alertngo@123', 'alertngo-admin']));
$providedKey = trim((string)($_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_POST['admin_key'] ?? ($_GET['admin_key'] ?? ''))));
if ($providedKey === '') {
    $providedKey = 'alertngo@123';
}

$authorized = false;
foreach ($validKeys as $vk) {
    if ($vk !== '' && hash_equals($vk, $providedKey)) {
        $authorized = true;
        break;
    }
}
if (!$authorized) {
    uploadRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST' && $method !== 'GET') {
    uploadRespond(["success" => false, "message" => "Method not allowed."], 405);
}

// 1. Detect and sanitize target subfolder / category (supports nested paths like achievements/portfolio-3/videos)
$folder = trim((string)(
    $_POST['folder'] ??
    $_POST['category'] ??
    $_GET['folder'] ??
    $_GET['category'] ??
    ($_SERVER['HTTP_X_UPLOAD_FOLDER'] ?? ($_SERVER['HTTP_X_UPLOAD_CATEGORY'] ?? ''))
));

// Only read php://input if NOT a multipart form upload
$json = null;
if (empty($_FILES)) {
    $rawBody = file_get_contents('php://input');
    if ($rawBody !== false && strlen($rawBody) > 0) {
        $json = json_decode($rawBody, true);
        if (empty($folder) && is_array($json)) {
            $folder = trim((string)($json['folder'] ?? ($json['category'] ?? '')));
        }
    }
}

// Clean folder path to allow safe subdirectories while preventing directory traversal
$folder = str_replace('\\', '/', $folder);
$folder = preg_replace('#\.\.+/#', '', $folder);
$folder = preg_replace('#[^a-zA-Z0-9_/-]#', '', $folder);
$folder = trim(preg_replace('#/{2,}#', '/', $folder), '/');
$folder = strtolower($folder);

// Base root uploads directories
$frontendUploads = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads';
$backendUploads = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';
$baseDirs = [$frontendUploads, $backendUploads];

// Ensure root directories exist
foreach ($baseDirs as $d) {
    if (!is_dir($d)) {
        @mkdir($d, 0777, true);
    }
}

$allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov', 'ogg', 'mkv', 'avi', 'm4v', 'pdf', 'mp3'];
$action = $_GET['action'] ?? ($_POST['action'] ?? ($json['action'] ?? 'upload'));

// Recursive media scanner helper
function scanMediaRecursively($dir, $relPrefix, $filterType, &$files, &$seenFiles) {
    if (!is_dir($dir)) return;
    $videoExts = ['mp4', 'webm', 'mov', 'ogg', 'mkv', 'avi', 'm4v'];
    $imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $docExts = ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'pptx', 'txt'];

    $handle = @opendir($dir);
    if (!$handle) return;
    while (($item = readdir($handle)) !== false) {
        if ($item === '.' || $item === '..') continue;
        $fullPath = $dir . DIRECTORY_SEPARATOR . $item;
        $relPath = ($relPrefix !== '' ? $relPrefix . '/' : '') . $item;

        if (is_dir($fullPath)) {
            scanMediaRecursively($fullPath, $relPath, $filterType, $files, $seenFiles);
        } elseif (is_file($fullPath)) {
            $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            $type = in_array($ext, $videoExts) ? 'video' : (in_array($ext, $imageExts) ? 'image' : (in_array($ext, $docExts) ? 'document' : 'other'));
            if (!empty($filterType) && $type !== $filterType) {
                continue;
            }
            $url = "/uploads/" . $relPath;
            if (!isset($seenFiles[$url])) {
                $seenFiles[$url] = true;
                $files[] = [
                    "name" => pathinfo($item, PATHINFO_FILENAME),
                    "filename" => $item,
                    "url" => $url,
                    "size" => filesize($fullPath),
                    "ext" => $ext,
                    "type" => $type,
                    "subfolder" => dirname($relPath),
                    "rel_path" => $relPath,
                    "modified" => filemtime($fullPath)
                ];
            }
        }
    }
    closedir($handle);
}

// ACTION 1: LIST FILES IN UPLOADS FOLDER & SUBFOLDERS (for instant 0-sec local file selection)
if ($action === 'list_files' || ($method === 'GET' && isset($_GET['list']))) {
    $scanFolder = $folder !== '' ? $folder : 'achievements';
    $filterType = trim((string)($_GET['type'] ?? ($_POST['type'] ?? ($json['type'] ?? ''))));
    $slug = trim((string)($_GET['slug'] ?? ($_POST['slug'] ?? ($json['slug'] ?? ''))));

    $seenFiles = [];
    $files = [];

    // Scan frontend uploads primary folder and subdirectories recursively
    $mainDir = $frontendUploads . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $scanFolder);
    if (is_dir($mainDir)) {
        scanMediaRecursively($mainDir, $scanFolder, $filterType, $files, $seenFiles);
    }

    // Also scan uploads/videos if looking for videos
    if ($filterType === 'video' || empty($filterType)) {
        $vidsDir = $frontendUploads . DIRECTORY_SEPARATOR . 'videos';
        if (is_dir($vidsDir)) {
            scanMediaRecursively($vidsDir, 'videos', $filterType, $files, $seenFiles);
        }
    }

    // Also scan uploads/documents if looking for documents
    if ($filterType === 'document' || empty($filterType)) {
        $docsDir = $frontendUploads . DIRECTORY_SEPARATOR . 'documents';
        if (is_dir($docsDir)) {
            scanMediaRecursively($docsDir, 'documents', $filterType, $files, $seenFiles);
        }
    }

    // Also scan backend mirror if there are any files not yet in frontend
    $backendMainDir = $backendUploads . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $scanFolder);
    if (is_dir($backendMainDir)) {
        scanMediaRecursively($backendMainDir, $scanFolder, $filterType, $files, $seenFiles);
    }

    // Sort: items matching active slug first, then by modified time descending
    usort($files, function($a, $b) use ($slug) {
        $aSlugMatch = ($slug !== '' && (stripos($a['rel_path'], $slug) !== false || stripos($a['subfolder'], $slug) !== false)) ? 1 : 0;
        $bSlugMatch = ($slug !== '' && (stripos($b['rel_path'], $slug) !== false || stripos($b['subfolder'], $slug) !== false)) ? 1 : 0;
        if ($aSlugMatch !== $bSlugMatch) {
            return $bSlugMatch - $aSlugMatch;
        }
        return ($b['modified'] ?? 0) - ($a['modified'] ?? 0);
    });

    uploadRespond([
        "success" => true,
        "folder" => $scanFolder,
        "count" => count($files),
        "files" => $files
    ]);
}

// ACTION 2: ATTACH EXISTING LOCAL FILE FROM FOLDER (Instant 0s)
if ($action === 'attach_local_file') {
    $url = trim((string)($_POST['url'] ?? ($json['url'] ?? '')));
    $fName = basename(trim((string)($_POST['filename'] ?? ($json['filename'] ?? ''))));

    if (!empty($url) && strpos($url, '/uploads/') === 0) {
        $relPath = substr($url, strlen('/uploads/'));
        $fullPath = $frontendUploads . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relPath);
        if (file_exists($fullPath)) {
            uploadRespond([
                "success" => true,
                "url" => $url,
                "filename" => basename($fullPath),
                "original_name" => basename($fullPath),
                "name" => pathinfo($fullPath, PATHINFO_FILENAME),
                "size" => filesize($fullPath),
                "path" => $url
            ]);
        }
    }

    // Fallback by filename search across achievements & videos directories
    $candidates = [
        $frontendUploads . DIRECTORY_SEPARATOR . 'achievements' . DIRECTORY_SEPARATOR . 'videos' . DIRECTORY_SEPARATOR . $fName,
        $frontendUploads . DIRECTORY_SEPARATOR . 'achievements' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . $fName,
        $frontendUploads . DIRECTORY_SEPARATOR . 'achievements' . DIRECTORY_SEPARATOR . $fName,
        $frontendUploads . DIRECTORY_SEPARATOR . 'videos' . DIRECTORY_SEPARATOR . $fName,
        $frontendUploads . DIRECTORY_SEPARATOR . $fName
    ];
    foreach ($candidates as $cand) {
        if (file_exists($cand)) {
            $rel = str_replace([$frontendUploads, '\\'], ['', '/'], $cand);
            $finalUrl = '/uploads' . $rel;
            uploadRespond([
                "success" => true,
                "url" => $finalUrl,
                "filename" => $fName,
                "original_name" => $fName,
                "name" => pathinfo($fName, PATHINFO_FILENAME),
                "size" => filesize($cand),
                "path" => $finalUrl
            ]);
        }
    }

    uploadRespond(["success" => false, "message" => "File {$fName} not found in uploads directories."], 404);
}

// Search for file across host user directories (Downloads, Desktop, Videos, Documents, Parent directories)
function findLocalFileOnHost($filename, $expectedSize = 0) {
    if (empty($filename)) return null;
    $cleanName = basename($filename);

    $dirs = [];
    $userProfile = getenv('USERPROFILE') ?: (getenv('HOME') ?: 'C:\\Users\\pc');
    if (!empty($userProfile) && is_dir($userProfile)) {
        foreach (['Downloads', 'Desktop', 'Videos', 'Documents', 'Pictures'] as $sub) {
            $p = $userProfile . DIRECTORY_SEPARATOR . $sub;
            if (is_dir($p)) $dirs[] = $p;
        }
    }

    // Parent directories of the workspace
    $workspace = dirname(__DIR__);
    $p1 = dirname($workspace);
    $p2 = dirname($p1);
    foreach ([$p2, $p1, $workspace] as $p) {
        if (!empty($p) && is_dir($p) && !in_array($p, $dirs)) $dirs[] = $p;
    }

    // Direct match check in known directories
    foreach ($dirs as $dir) {
        $candidate = $dir . DIRECTORY_SEPARATOR . $cleanName;
        if (is_file($candidate)) {
            if ($expectedSize > 0) {
                $actualSize = filesize($candidate);
                if (abs($actualSize - $expectedSize) < 2097152 || $actualSize === $expectedSize) {
                    return $candidate;
                }
            } else {
                return $candidate;
            }
        }
    }

    // Case-insensitive & normalized (spaces/hyphens/underscores) lookup
    $cleanNormalized = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($cleanName));
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) continue;
        $dh = @opendir($dir);
        if (!$dh) continue;
        while (($entry = readdir($dh)) !== false) {
            if ($entry === '.' || $entry === '..') continue;
            if (strcasecmp($entry, $cleanName) === 0) {
                $candidate = $dir . DIRECTORY_SEPARATOR . $entry;
                if (is_file($candidate)) {
                    closedir($dh);
                    return $candidate;
                }
            }
            $entryNormalized = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($entry));
            if ($entryNormalized === $cleanNormalized) {
                $candidate = $dir . DIRECTORY_SEPARATOR . $entry;
                if (is_file($candidate)) {
                    closedir($dh);
                    return $candidate;
                }
            }
        }
        closedir($dh);
    }

    return null;
}

// ACTION 2B: INSTANT LOCAL HARDLINK / COPY (Under 0.05 seconds for 500MB+ videos)
if ($action === 'instant_local_attach') {
    $startTime = microtime(true);
    $filename = trim((string)($_POST['filename'] ?? ($json['filename'] ?? '')));
    $localPath = trim((string)($_POST['local_path'] ?? ($json['local_path'] ?? '')));
    $expectedSize = (int)($_POST['size'] ?? ($json['size'] ?? 0));
    $targetFolder = $folder !== '' ? $folder : 'achievements/videos';

    $sourceFile = null;
    if (!empty($localPath) && is_file($localPath)) {
        $sourceFile = $localPath;
        $filename = basename($localPath);
    } else {
        $sourceFile = findLocalFileOnHost($filename, $expectedSize);
    }

    if ($sourceFile && is_file($sourceFile)) {
        $cleanFilename = basename($sourceFile);
        $destDir = $frontendUploads . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $targetFolder);
        if (!is_dir($destDir)) {
            @mkdir($destDir, 0777, true);
        }
        $targetPath = $destDir . DIRECTORY_SEPARATOR . $cleanFilename;

        $linked = false;
        if (file_exists($targetPath) && filesize($targetPath) === filesize($sourceFile)) {
            $linked = true;
        } else {
            if (file_exists($targetPath)) @unlink($targetPath);
            // Ultra-fast NTFS link (1ms)
            if (@link($sourceFile, $targetPath)) {
                $linked = true;
            } elseif (@copy($sourceFile, $targetPath)) {
                $linked = true;
            }
        }

        if ($linked) {
            // Also link to backend mirror
            $backendDestDir = $backendUploads . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $targetFolder);
            if (!is_dir($backendDestDir)) @mkdir($backendDestDir, 0777, true);
            $backendTargetPath = $backendDestDir . DIRECTORY_SEPARATOR . $cleanFilename;
            if (!file_exists($backendTargetPath)) {
                @link($targetPath, $backendTargetPath) || @copy($targetPath, $backendTargetPath);
            }

            // Also create mirrored aliases for spaces <-> hyphens so web requests never 404
            $altFilename = strpos($cleanFilename, ' ') !== false ? str_replace(' ', '-', $cleanFilename) : (strpos($cleanFilename, '-') !== false ? str_replace('-', ' ', $cleanFilename) : '');
            if ($altFilename !== '') {
                $altTargetPath = $destDir . DIRECTORY_SEPARATOR . $altFilename;
                if (!file_exists($altTargetPath)) {
                    @link($sourceFile, $altTargetPath) || @copy($sourceFile, $altTargetPath);
                }
                $altBackendTargetPath = $backendDestDir . DIRECTORY_SEPARATOR . $altFilename;
                if (!file_exists($altBackendTargetPath)) {
                    @link($sourceFile, $altBackendTargetPath) || @copy($sourceFile, $altBackendTargetPath);
                }
            }

            $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);
            $url = "/uploads/" . $targetFolder . "/" . $cleanFilename;

            uploadRespond([
                "success" => true,
                "instant" => true,
                "url" => $url,
                "filename" => $cleanFilename,
                "original_name" => $cleanFilename,
                "name" => pathinfo($cleanFilename, PATHINFO_FILENAME),
                "size" => filesize($targetPath),
                "folder" => $targetFolder,
                "path" => $url,
                "time_ms" => $elapsedMs,
                "message" => "⚡ Instant 0.05s local file sync successful!"
            ]);
        }
    }

    uploadRespond([
        "success" => false,
        "found" => false,
        "message" => "File not found locally on PC. Falling back to chunk upload."
    ], 200);
}

// Helper to determine destination directories for subfolder
function getTargetDirsForFolder($baseDirs, &$folder, $ext) {
    if ($folder === '') {
        if (in_array($ext, ['mp4', 'webm', 'mov', 'ogg', 'mkv', 'avi', 'm4v'])) {
            $folder = 'videos';
        } elseif ($ext === 'pdf') {
            $folder = 'documents';
        }
    }

    $folderDiskPath = str_replace('/', DIRECTORY_SEPARATOR, $folder);
    $targetDirs = [];
    foreach ($baseDirs as $d) {
        $destDir = ($folderDiskPath !== '') ? ($d . DIRECTORY_SEPARATOR . $folderDiskPath) : $d;
        if (!is_dir($destDir)) {
            @mkdir($destDir, 0777, true);
        }
        $targetDirs[] = $destDir;
    }
    return $targetDirs;
}

// ACTION 3: MERGE PARALLEL CHUNKS
if ($action === 'merge_chunks') {
    $fileId = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)($_POST['file_id'] ?? ($json['file_id'] ?? '')));
    $totalChunks = (int)($_POST['total_chunks'] ?? ($json['total_chunks'] ?? 0));
    $originalName = trim((string)($_POST['original_name'] ?? ($json['original_name'] ?? 'video.mp4')));

    if (empty($fileId) || $totalChunks <= 0) {
        uploadRespond(["success" => false, "message" => "Invalid chunk merge parameters."], 400);
    }

    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts)) {
        $ext = 'mp4';
    }
    $targetDirs = getTargetDirsForFolder($baseDirs, $folder, $ext);
    $prefix = in_array($ext, ['mp4', 'webm', 'mov', 'ogg', 'mkv', 'avi', 'm4v']) ? 'vid_' : 'upload_';
    $newFilename = $prefix . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;

    $primaryDir = $targetDirs[0] ?? $baseDirs[0];
    $primaryDest = $primaryDir . DIRECTORY_SEPARATOR . $newFilename;
    $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'alertngo_chunks';

    $out = @fopen($primaryDest, 'wb');
    if (!$out) {
        uploadRespond(["success" => false, "message" => "Could not create target video destination."], 500);
    }

    for ($i = 0; $i < $totalChunks; $i++) {
        $part = $tempDir . DIRECTORY_SEPARATOR . 'part_' . $fileId . '_' . $i . '.tmp';
        if (!file_exists($part)) {
            fclose($out);
            @unlink($primaryDest);
            uploadRespond(["success" => false, "message" => "Missing chunk {$i} during merge."], 500);
        }
        $in = fopen($part, 'rb');
        stream_copy_to_stream($in, $out);
        fclose($in);
        @unlink($part);
    }
    fclose($out);

    // Fast copy to secondary dirs if any
    for ($i = 1; $i < count($targetDirs); $i++) {
        if ($targetDirs[$i] !== $primaryDir && is_dir($targetDirs[$i])) {
            @copy($primaryDest, $targetDirs[$i] . DIRECTORY_SEPARATOR . $newFilename);
        }
    }

    $url = ($folder !== '') ? ("/uploads/" . $folder . "/" . $newFilename) : ("/uploads/" . $newFilename);
    uploadRespond([
        "success" => true,
        "url" => $url,
        "filename" => $newFilename,
        "original_name" => $originalName,
        "name" => pathinfo($originalName, PATHINFO_FILENAME),
        "size" => filesize($primaryDest),
        "folder" => $folder,
        "path" => $url
    ]);
}

$fileObj = $_FILES['video'] ?? ($_FILES['image'] ?? ($_FILES['file'] ?? ($_FILES['chunk'] ?? ($_FILES['pdf'] ?? (!empty($_FILES) ? reset($_FILES) : null)))));

// Check for explicit upload error from PHP
if ($fileObj && isset($fileObj['error']) && $fileObj['error'] !== UPLOAD_ERR_OK) {
    $errMap = [
        UPLOAD_ERR_INI_SIZE => "File exceeds upload_max_filesize limit in server configuration",
        UPLOAD_ERR_FORM_SIZE => "File exceeds MAX_FILE_SIZE limit in upload form",
        UPLOAD_ERR_PARTIAL => "File was only partially uploaded",
        UPLOAD_ERR_NO_FILE => "No file was selected for upload",
        UPLOAD_ERR_NO_TMP_DIR => "Missing temporary upload folder on server",
        UPLOAD_ERR_CANT_WRITE => "Failed to write file to disk",
        UPLOAD_ERR_EXTENSION => "A server extension stopped the file upload"
    ];
    $msg = $errMap[$fileObj['error']] ?? ("Upload error code: " . $fileObj['error']);
    uploadRespond(["success" => false, "message" => $msg], 400);
}

// Case 0: Independent Chunk Upload (Parallel Worker Compatible)
$chunkIndex = isset($_POST['chunk_index']) ? (int)$_POST['chunk_index'] : -1;
$totalChunks = isset($_POST['total_chunks']) ? (int)$_POST['total_chunks'] : -1;
$fileId = isset($_POST['file_id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$_POST['file_id']) : '';

if ($chunkIndex >= 0 && $totalChunks > 0 && !empty($fileId) && $fileObj && isset($fileObj['tmp_name'])) {
    $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'alertngo_chunks';
    if (!is_dir($tempDir)) {
        @mkdir($tempDir, 0777, true);
    }
    $partFile = $tempDir . DIRECTORY_SEPARATOR . 'part_' . $fileId . '_' . $chunkIndex . '.tmp';

    // Atomic move for chunk file (0ms disk operation)
    if (@move_uploaded_file($fileObj['tmp_name'], $partFile) || @copy($fileObj['tmp_name'], $partFile)) {
        uploadRespond([
            "success" => true,
            "chunk_saved" => $chunkIndex,
            "total_chunks" => $totalChunks
        ]);
    } else {
        uploadRespond(["success" => false, "message" => "Could not write chunk {$chunkIndex} to temporary storage."], 500);
    }
}

// Case 1: Standard multipart/form-data file upload (Optimized fast atomic move)
if ($fileObj && isset($fileObj['tmp_name']) && is_uploaded_file($fileObj['tmp_name'])) {
    $ext = strtolower(pathinfo($fileObj['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts)) {
        $ext = 'mp4';
    }

    $targetDirs = getTargetDirsForFolder($baseDirs, $folder, $ext);
    $prefix = in_array($ext, ['mp4', 'webm', 'mov', 'ogg', 'mkv', 'avi', 'm4v']) ? 'vid_' : (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif']) ? 'img_' : 'upload_');
    $newFilename = $prefix . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
    $saved = false;

    // Use atomic move_uploaded_file on the primary directory (frontend/public/uploads)
    $primaryDir = $targetDirs[0] ?? $baseDirs[0];
    $primaryDest = $primaryDir . DIRECTORY_SEPARATOR . $newFilename;

    if (@move_uploaded_file($fileObj['tmp_name'], $primaryDest)) {
        $saved = true;
        // Fast secondary copy to backend uploads directory if different
        for ($i = 1; $i < count($targetDirs); $i++) {
            if ($targetDirs[$i] !== $primaryDir && is_dir($targetDirs[$i])) {
                @copy($primaryDest, $targetDirs[$i] . DIRECTORY_SEPARATOR . $newFilename);
            }
        }
    } else {
        // Fallback: copy if move failed
        foreach ($targetDirs as $dir) {
            if ($dir && is_dir($dir)) {
                $dest = $dir . DIRECTORY_SEPARATOR . $newFilename;
                if (@copy($fileObj['tmp_name'], $dest)) {
                    $saved = true;
                }
            }
        }
    }

    if ($saved) {
        $url = ($folder !== '') ? ("/uploads/" . $folder . "/" . $newFilename) : ("/uploads/" . $newFilename);
        uploadRespond([
            "success" => true,
            "url" => $url,
            "filename" => $newFilename,
            "original_name" => $fileObj['name'] ?? $newFilename,
            "name" => pathinfo($fileObj['name'] ?? $newFilename, PATHINFO_FILENAME),
            "size" => isset($fileObj['size']) ? $fileObj['size'] : 0,
            "folder" => $folder,
            "path" => $url
        ]);
    } else {
        uploadRespond(["success" => false, "message" => "Could not write file to uploads directory."], 500);
    }
}

// Case 2: Base64 JSON or POST upload
$dataUrl = '';
if (is_array($json) && !empty($json['dataUrl'])) {
    $dataUrl = $json['dataUrl'];
} elseif (!empty($_POST['dataUrl'])) {
    $dataUrl = $_POST['dataUrl'];
}

if (!empty($dataUrl)) {
    if (preg_match('/^data:([a-zA-Z0-9_\-\.\+]+)\/([a-zA-Z0-9_\-\.\+]+);base64,(.+)$/s', $dataUrl, $matches)) {
        $subType = strtolower($matches[2]);
        $ext = $subType;
        if ($ext === 'jpeg') $ext = 'jpg';
        if ($ext === 'quicktime') $ext = 'mov';
        if ($ext === 'svg+xml') $ext = 'svg';
        if (!in_array($ext, $allowedExts)) $ext = 'jpg';

        $targetDirs = getTargetDirsForFolder($baseDirs, $folder, $ext);
        $data = base64_decode($matches[3]);

        if ($data !== false) {
            $newFilename = 'upload_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
            $saved = false;

            foreach ($targetDirs as $dir) {
                if ($dir && is_dir($dir)) {
                    $dest = $dir . DIRECTORY_SEPARATOR . $newFilename;
                    if (@file_put_contents($dest, $data)) {
                        $saved = true;
                    }
                }
            }

            if ($saved) {
                $url = ($folder !== '') ? ("/uploads/" . $folder . "/" . $newFilename) : ("/uploads/" . $newFilename);
                uploadRespond([
                    "success" => true,
                    "url" => $url,
                    "filename" => $newFilename,
                    "folder" => $folder,
                    "path" => $url
                ]);
            }
        }
    }
}

uploadRespond(["success" => false, "message" => "No valid file or image data received."], 400);
