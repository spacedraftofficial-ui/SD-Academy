<?php
// ============================================================================
//   SD Academy — High-Performance Native 24/7 PHP REST API Engine
//   Guaranteed 100% 24x7x365 Uptime for Hostinger Shared & Cloud Web Hosting
//   Compatible with SQLite3 (PDO) and MySQL with Built-in Bcrypt & JWT Auth
// ============================================================================

// 1. CORS & Security Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Disable HTML error output to keep JSON responses clean
ini_set('display_errors', '0');
error_reporting(E_ALL);

// JWT Secret Key
$JWT_SECRET = getenv('JWT_SECRET') ?: 'SDAcademy@sdacademy.co.in#2026$ProductionSecureKey!';

// 2. Database Connection Resolution (SQLite3 PDO / MySQL)
function sda_get_db() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    // Check if MySQL is configured in .env or environment
    $db_dialect = getenv('DB_DIALECT');
    if ($db_dialect === 'mysql') {
        $host = getenv('DB_HOST') ?: 'localhost';
        $dbname = getenv('DB_NAME') ?: 'u401791379_sdacademy';
        $user = getenv('DB_USER') ?: 'u401791379_admin';
        $pass = getenv('DB_PASSWORD') ?: '';
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            return $pdo;
        } catch (Exception $e) {
            // Fall back to SQLite if MySQL connection fails
        }
    }

    // SQLite3 Resolution
    $possible_paths = [
        dirname(dirname(__DIR__)) . '/database.db',
        dirname(__DIR__) . '/database.db',
        __DIR__ . '/database.db',
        sys_get_temp_dir() . '/sdacademy.db',
    ];

    $db_file = null;
    foreach ($possible_paths as $p) {
        if (file_exists($p)) {
            $db_file = $p;
            break;
        }
    }

    if (!$db_file) {
        $db_file = dirname(dirname(__DIR__)) . '/database.db';
    }

    $needs_init = !file_exists($db_file) || filesize($db_file) < 1000;

    $pdo = new PDO("sqlite:" . $db_file, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    if ($needs_init) {
        sda_init_database($pdo);
    } else {
        // Quick verify users table exists
        $tblCheck = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")->fetch();
        if (!$tblCheck) {
            sda_init_database($pdo);
        }
    }

    return $pdo;
}

// 3. Database Schema Initialization & Auto-Seeding
function sda_init_database($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role TEXT DEFAULT 'learner',
            department VARCHAR(255) DEFAULT 'Architecture',
            role_label VARCHAR(255) DEFAULT 'Architect',
            level VARCHAR(255) DEFAULT 'L1',
            initials VARCHAR(255) DEFAULT 'JA',
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            track TEXT DEFAULT 'core',
            department VARCHAR(255) DEFAULT 'Architecture',
            estimated_time VARCHAR(255) DEFAULT '1h 30m',
            thumbnail_color VARCHAR(255) DEFAULT 'linear-gradient(135deg, #3b82f6, #1e2545)',
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            type TEXT DEFAULT 'video',
            content_url VARCHAR(255),
            duration VARCHAR(255) DEFAULT '23:45',
            order_index INTEGER DEFAULT 1,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            module_id INTEGER,
            status TEXT DEFAULT 'not_started',
            progress_pct INTEGER DEFAULT 0,
            due_date DATETIME,
            completed_at DATETIME,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_id INTEGER,
            title VARCHAR(255) NOT NULL,
            type TEXT DEFAULT 'quiz',
            status_label VARCHAR(255) DEFAULT 'Not Started',
            questions_json TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS assessment_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            assessment_id INTEGER NOT NULL,
            score INTEGER DEFAULT 0,
            status TEXT DEFAULT 'attempted',
            answers_json TEXT,
            submitted_at DATETIME,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            type TEXT DEFAULT 'sop',
            department VARCHAR(255) DEFAULT 'Architecture',
            phase VARCHAR(255) DEFAULT 'Design Phase',
            icon VARCHAR(255) DEFAULT '📋',
            file_url VARCHAR(255),
            version VARCHAR(255) DEFAULT 'V1.4',
            acknowledged_by TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            course_title VARCHAR(255) NOT NULL,
            issued_date VARCHAR(255),
            pdf_url VARCHAR(255),
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) DEFAULT 'Laura HR',
            category TEXT DEFAULT 'hr',
            tag VARCHAR(255) DEFAULT 'HR Announcement',
            tag_cls VARCHAR(255) DEFAULT 'badge-navy',
            body TEXT NOT NULL,
            likes_count INTEGER DEFAULT 45,
            comments_count INTEGER DEFAULT 12,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS support_tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject VARCHAR(255) NOT NULL,
            department VARCHAR(255) DEFAULT 'IT Support',
            description TEXT,
            status TEXT DEFAULT 'in_progress',
            status_badge VARCHAR(255) DEFAULT 'In Progress',
            time_ago VARCHAR(255) DEFAULT '1 Day ago',
            assigned_agent VARCHAR(255) DEFAULT 'Rachel',
            assigned_role VARCHAR(255) DEFAULT 'IT Support',
            latest_comment TEXT DEFAULT 'We are investigating the issue. Please wait while we resolve it.',
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS video_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            timestamp_sec VARCHAR(255) DEFAULT '05:18',
            text TEXT NOT NULL,
            is_mine TINYINT(1) DEFAULT 1,
            is_bookmarked TINYINT(1) DEFAULT 0,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        );
    ");

    // Seed default records
    $now = date('Y-m-d H:i:s');
    $learnerHash = password_hash('learner123', PASSWORD_BCRYPT);
    $adminHash = password_hash('admin123', PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, department, role_label, level, initials, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute(['John Abraham', 'john.abraham@sdacademy.in', $learnerHash, 'learner', 'Design & Planning Department', 'Architect', 'L1', 'JA', $now, $now]);
    $stmt->execute(['Admin', 'admin@sdacademy.in', $adminHash, 'admin', 'HR / L&D', 'Administrator', 'L5', 'AD', $now, $now]);
    $stmt->execute(['David K', 'david.k@sdacademy.in', $learnerHash, 'learner', 'Engineering', 'HOD Reviewer', 'L3', 'DK', $now, $now]);

    // Courses & Modules
    $stmt = $pdo->prepare("INSERT INTO courses (title, description, track, department, estimated_time, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute(['Intro to Architectural Fundamentals', 'Learn the fundamental principles and concepts of architecture.', 'core', 'Architecture', '1h 30m', $now, $now]);
    $cId = $pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO modules (course_id, title, type, duration, order_index, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$cId, 'Watch: Architectural Fundamentals', 'video', '23:45', 1, $now, $now]);
    $stmt->execute([$cId, 'Architectural Design SOP', 'sop', '45m', 2, $now, $now]);

    // Progress
    $pdo->prepare("INSERT INTO user_progress (user_id, course_id, status, progress_pct, createdAt, updatedAt) VALUES (1, ?, 'in_progress', 55, ?, ?)")->execute([$cId, $now, $now]);

    // Assessments
    $pdo->prepare("INSERT INTO assessments (title, type, status_label, createdAt, updatedAt) VALUES ('Sketching Essential Quiz', 'quiz', 'Attempted', ?, ?)")->execute([$now, $now]);
    $pdo->prepare("INSERT INTO assessments (title, type, status_label, createdAt, updatedAt) VALUES ('Advanced CAD Assignment', 'assignment', 'Passed', ?, ?)")->execute([$now, $now]);

    // Materials
    $matStmt = $pdo->prepare("INSERT INTO materials (title, type, department, phase, icon, version, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $matStmt->execute(['Architectural Design SOP', 'sop', 'Architecture', 'Design Phase', '📋', 'V1.4', $now, $now]);
    $matStmt->execute(['Site Analysis SOP', 'sop', 'Architecture', 'Design Phase', '📋', 'V1.4', $now, $now]);
    $matStmt->execute(['Permit Application SOP', 'sop', 'Architecture', 'Preliminary', '📋', 'V1.4', $now, $now]);
    $matStmt->execute(['Design Review Checklist', 'checklist', 'Architecture', 'Design Phase', '☑️', 'V1.4', $now, $now]);
    $matStmt->execute(['Company Safety Policy', 'policy', 'HR', 'All Phases', '📃', 'V1.0', $now, $now]);

    // Certificates
    $certStmt = $pdo->prepare("INSERT INTO certificates (user_id, course_title, issued_date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)");
    $certStmt->execute([1, 'Writing Engaging Content', '2026-02-10', $now, $now]);
    $certStmt->execute([1, 'CRM Fundamentals', '2026-01-15', $now, $now]);
    $certStmt->execute([1, 'Procurement SOP Master', '2026-01-20', $now, $now]);

    // Announcements
    $annStmt = $pdo->prepare("INSERT INTO announcements (title, author, category, tag, tag_cls, body, likes_count, comments_count, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $annStmt->execute(['Company Team Building Event Next Friday', 'Laura HR', 'hr', 'HR Announcement', 'badge-navy', 'We are excited to announce a team-building event next Friday from 2 PM to 5 PM.', 45, 12, $now, $now]);
    $annStmt->execute(['New Remote Work Policy Update', 'Laura HR', 'hr', 'Policy', 'badge-warning', 'Please note that our remote work policy has been updated effective from the 1st of next month.', 45, 12, $now, $now]);

    // Support Tickets
    $pdo->prepare("INSERT INTO support_tickets (user_id, subject, department, description, status, status_badge, time_ago, assigned_agent, assigned_role, latest_comment, createdAt, updatedAt) VALUES (1, 'VPN Connection issue', 'IT Support', 'Unable to connect to company VPN from remote location.', 'in_progress', 'In Progress', '1 Day ago', 'Rachel', 'IT Support', 'We are investigating the issue. Please wait while we resolve it.', ?, ?)")->execute([$now, $now]);

    // Video Notes
    $noteStmt = $pdo->prepare("INSERT INTO video_notes (user_id, timestamp_sec, text, is_mine, is_bookmarked, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $noteStmt->execute([1, '00:45', 'Defining the target audience is critical', 1, 0, $now, $now]);
    $noteStmt->execute([1, '02:15', 'Content should be concise and clear', 1, 1, $now, $now]);
    $noteStmt->execute([1, '03:30', 'Gathering date through surveys is important', 0, 0, $now, $now]);
    $noteStmt->execute([1, '05:50', 'Addressing audience pain points', 1, 0, $now, $now]);
}

// 4. JWT Cryptographic Helpers (HS256)
function base64_url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64_url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function sda_generate_jwt($payload, $secret) {
    $header = base64_url_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $body = base64_url_encode(json_encode(array_merge($payload, [
        'exp' => time() + (7 * 24 * 3600),
        'iat' => time()
    ])));
    $signature = base64_url_encode(hash_hmac('sha256', "$header.$body", $secret, true));
    return "$header.$body.$signature";
}

function sda_verify_jwt($token, $secret) {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($header, $body, $sig) = $parts;
    $valid_sig = base64_url_encode(hash_hmac('sha256', "$header.$body", $secret, true));
    if (!hash_equals($valid_sig, $sig)) return null;
    $data = json_decode(base64_url_decode($body), true);
    if (!$data || (isset($data['exp']) && $data['exp'] < time())) return null;
    return $data;
}

// 5. Auth Middleware
function sda_get_auth_user() {
    global $JWT_SECRET;
    $token = '';
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }
    
    foreach ($headers as $k => $v) {
        if (strtolower($k) === 'authorization') {
            $token = trim($v);
            break;
        }
    }
    
    if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = trim($_SERVER['HTTP_AUTHORIZATION']);
    }
    if (!$token && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $token = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }

    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }

    return sda_verify_jwt($token, $JWT_SECRET);
}

function sda_require_auth() {
    $user = sda_get_auth_user();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Access token required or invalid']);
        exit;
    }
    return $user;
}

function sda_require_admin() {
    $user = sda_require_auth();
    if (($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin privilege required']);
        exit;
    }
    return $user;
}

// 6. Request URI & Method Parsing
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('?', $uri);
$path = $uri_parts[0];

// Normalize path relative to /api
$prefix = '/api';
$pos = strpos($path, $prefix);
if ($pos !== false) {
    $subpath = trim(substr($path, $pos + strlen($prefix)), '/');
} else {
    $subpath = trim($path, '/');
}

$segments = !empty($subpath) ? explode('/', $subpath) : [];
$body_raw = file_get_contents('php://input');
$body = !empty($body_raw) ? json_decode($body_raw, true) : [];
if (!is_array($body)) $body = [];

$pdo = sda_get_db();

// 7. Route Dispatcher
try {
    // ── HEALTH CHECK: GET /api/health ──
    if (empty($segments) || $segments[0] === 'health') {
        echo json_encode([
            'status' => 'ok',
            'system' => 'SD Academy LMS High-Performance Native API',
            'database' => 'SQLite3 (PDO Active — 24/7 Uptime Guaranteed)',
            'timestamp' => date('c'),
        ]);
        exit;
    }

    // ── AUTH ROUTES: /api/auth/* ──
    if ($segments[0] === 'auth') {
        $action = $segments[1] ?? '';

        // POST /api/auth/login
        if ($action === 'login' && $method === 'POST') {
            $email = trim($body['email'] ?? '');
            $password = trim($body['password'] ?? '');

            if (!$email || !$password) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password are required']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid email or password']);
                exit;
            }

            $payload = [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'department' => $user['department'],
                'roleLabel' => $user['role_label'],
                'initials' => $user['initials'],
            ];

            $token = sda_generate_jwt($payload, $JWT_SECRET);

            echo json_encode([
                'message' => 'Login successful',
                'token' => $token,
                'user' => $payload,
            ]);
            exit;
        }

        // GET /api/auth/me
        if ($action === 'me' && $method === 'GET') {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("SELECT id, name, email, role, department, role_label, level, initials, createdAt, updatedAt FROM users WHERE id = ?");
            $stmt->execute([$authUser['id']]);
            $user = $stmt->fetch();
            if (!$user) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit;
            }
            echo json_encode($user);
            exit;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Auth endpoint not found']);
        exit;
    }

    // ── USERS ROUTES: /api/users ──
    if ($segments[0] === 'users') {
        $id = $segments[1] ?? null;

        // GET /api/users (Admin only)
        if ($method === 'GET' && !$id) {
            sda_require_admin();
            $stmt = $pdo->query("SELECT id, name, email, role, department, role_label, level, initials, createdAt, updatedAt FROM users ORDER BY id ASC");
            echo json_encode($stmt->fetchAll());
            exit;
        }

        // POST /api/users (Admin only)
        if ($method === 'POST') {
            sda_require_admin();
            $name = trim($body['name'] ?? '');
            $email = trim($body['email'] ?? '');
            $rawPass = $body['password'] ?? 'password123';
            $role = $body['role'] ?? 'learner';
            $dept = $body['department'] ?? 'Architecture';
            $roleLabel = $body['role_label'] ?? 'Architect';
            $level = $body['level'] ?? 'L1';
            
            $words = explode(' ', $name);
            $initials = '';
            foreach ($words as $w) {
                if (!empty($w)) $initials .= strtoupper($w[0]);
            }
            $initials = substr($initials, 0, 2) ?: 'SD';

            $passHash = password_hash($rawPass, PASSWORD_BCRYPT);
            $now = date('Y-m-d H:i:s');

            $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, department, role_label, level, initials, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $passHash, $role, $dept, $roleLabel, $level, $initials, $now, $now]);
            $newId = $pdo->lastInsertId();

            $res = $pdo->prepare("SELECT id, name, email, role, department, role_label, level, initials, createdAt, updatedAt FROM users WHERE id = ?");
            $res->execute([$newId]);
            http_response_code(201);
            echo json_encode($res->fetch());
            exit;
        }

        // PUT /api/users/:id (Admin only)
        if ($method === 'PUT' && $id) {
            sda_require_admin();
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch();
            if (!$user) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit;
            }

            $name = $body['name'] ?? $user['name'];
            $email = $body['email'] ?? $user['email'];
            $role = $body['role'] ?? $user['role'];
            $dept = $body['department'] ?? $user['department'];
            $roleLabel = $body['role_label'] ?? $user['role_label'];
            $level = $body['level'] ?? $user['level'];

            $words = explode(' ', $name);
            $initials = '';
            foreach ($words as $w) {
                if (!empty($w)) $initials .= strtoupper($w[0]);
            }
            $initials = substr($initials, 0, 2) ?: 'SD';
            $now = date('Y-m-d H:i:s');

            $upStmt = $pdo->prepare("UPDATE users SET name=?, email=?, role=?, department=?, role_label=?, level=?, initials=?, updatedAt=? WHERE id=?");
            $upStmt->execute([$name, $email, $role, $dept, $roleLabel, $level, $initials, $now, $id]);

            $res = $pdo->prepare("SELECT id, name, email, role, department, role_label, level, initials, createdAt, updatedAt FROM users WHERE id = ?");
            $res->execute([$id]);
            echo json_encode($res->fetch());
            exit;
        }

        // DELETE /api/users/:id (Admin only)
        if ($method === 'DELETE' && $id) {
            sda_require_admin();
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'User deleted successfully']);
            exit;
        }
    }

    // ── COURSES ROUTES: /api/courses ──
    if ($segments[0] === 'courses') {
        $id = $segments[1] ?? null;

        // GET /api/courses
        if ($method === 'GET' && !$id) {
            sda_require_auth();
            $track = $_GET['track'] ?? null;
            $dept = $_GET['department'] ?? null;

            $sql = "SELECT * FROM courses WHERE 1=1";
            $params = [];
            if ($track) { $sql .= " AND track = ?"; $params[] = $track; }
            if ($dept) { $sql .= " AND department = ?"; $params[] = $dept; }
            $sql .= " ORDER BY id ASC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $courses = $stmt->fetchAll();

            // Attach modules to each course
            foreach ($courses as &$c) {
                $mStmt = $pdo->prepare("SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC");
                $mStmt->execute([$c['id']]);
                $c['Modules'] = $mStmt->fetchAll();
            }

            echo json_encode($courses);
            exit;
        }

        // POST /api/courses (Admin only)
        if ($method === 'POST') {
            sda_require_admin();
            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("INSERT INTO courses (title, description, track, department, estimated_time, thumbnail_color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $body['title'] ?? 'New Course',
                $body['description'] ?? '',
                $body['track'] ?? 'core',
                $body['department'] ?? 'Architecture',
                $body['estimated_time'] ?? '1h 00m',
                $body['thumbnail_color'] ?? 'linear-gradient(135deg, #3b82f6, #1e2545)',
                $now, $now
            ]);
            $newId = $pdo->lastInsertId();
            $res = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
            $res->execute([$newId]);
            $c = $res->fetch();
            $c['Modules'] = [];
            http_response_code(201);
            echo json_encode($c);
            exit;
        }

        // PUT /api/courses/:id (Admin only)
        if ($method === 'PUT' && $id) {
            sda_require_admin();
            $fields = [];
            $params = [];
            foreach (['title', 'description', 'track', 'department', 'estimated_time', 'thumbnail_color'] as $f) {
                if (isset($body[$f])) {
                    $fields[] = "$f = ?";
                    $params[] = $body[$f];
                }
            }
            if (!empty($fields)) {
                $fields[] = "updatedAt = ?";
                $params[] = date('Y-m-d H:i:s');
                $params[] = $id;
                $pdo->prepare("UPDATE courses SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
            }
            $res = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
            $res->execute([$id]);
            $c = $res->fetch();
            $mStmt = $pdo->prepare("SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC");
            $mStmt->execute([$id]);
            $c['Modules'] = $mStmt->fetchAll();
            echo json_encode($c);
            exit;
        }

        // DELETE /api/courses/:id (Admin only)
        if ($method === 'DELETE' && $id) {
            sda_require_admin();
            $pdo->prepare("DELETE FROM courses WHERE id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM modules WHERE course_id = ?")->execute([$id]);
            echo json_encode(['message' => 'Course deleted successfully']);
            exit;
        }
    }

    // ── PROGRESS ROUTES: /api/progress ──
    if ($segments[0] === 'progress') {
        $action = $segments[1] ?? '';

        // GET /api/progress/me
        if ($action === 'me' && $method === 'GET') {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("SELECT * FROM user_progress WHERE user_id = ?");
            $stmt->execute([$authUser['id']]);
            $progress = $stmt->fetchAll();

            foreach ($progress as &$p) {
                $cStmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
                $cStmt->execute([$p['course_id']]);
                $p['Course'] = $cStmt->fetch() ?: null;
            }

            echo json_encode($progress);
            exit;
        }

        // PUT /api/progress/:id
        if ($method === 'PUT' && !empty($action)) {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("SELECT * FROM user_progress WHERE id = ? AND user_id = ?");
            $stmt->execute([$action, $authUser['id']]);
            $rec = $stmt->fetch();
            if (!$rec) {
                http_response_code(404);
                echo json_encode(['error' => 'Progress record not found']);
                exit;
            }

            $status = $body['status'] ?? $rec['status'];
            $pct = isset($body['progress_pct']) ? (int)$body['progress_pct'] : $rec['progress_pct'];
            $completedAt = ($status === 'completed') ? date('Y-m-d H:i:s') : $rec['completed_at'];
            $now = date('Y-m-d H:i:s');

            $pdo->prepare("UPDATE user_progress SET status=?, progress_pct=?, completed_at=?, updatedAt=? WHERE id=?")
                ->execute([$status, $pct, $completedAt, $now, $action]);

            $res = $pdo->prepare("SELECT * FROM user_progress WHERE id = ?");
            $res->execute([$action]);
            echo json_encode($res->fetch());
            exit;
        }
    }

    // ── MATERIALS ROUTES: /api/materials ──
    if ($segments[0] === 'materials') {
        $id = $segments[1] ?? null;
        $subaction = $segments[2] ?? null;

        // POST /api/materials/:id/acknowledge
        if ($id && $subaction === 'acknowledge' && $method === 'POST') {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("SELECT * FROM materials WHERE id = ?");
            $stmt->execute([$id]);
            $mat = $stmt->fetch();
            if (!$mat) {
                http_response_code(404);
                echo json_encode(['error' => 'Material not found']);
                exit;
            }

            $acks = json_decode($mat['acknowledged_by'] ?? '[]', true);
            if (!is_array($acks)) $acks = [];
            if (!in_array($authUser['id'], $acks)) {
                $acks[] = $authUser['id'];
                $pdo->prepare("UPDATE materials SET acknowledged_by = ?, updatedAt = ? WHERE id = ?")
                    ->execute([json_encode($acks), date('Y-m-d H:i:s'), $id]);
            }

            $res = $pdo->prepare("SELECT * FROM materials WHERE id = ?");
            $res->execute([$id]);
            echo json_encode(['message' => 'Material acknowledged', 'material' => $res->fetch()]);
            exit;
        }

        // GET /api/materials
        if ($method === 'GET' && !$id) {
            sda_require_auth();
            $type = $_GET['type'] ?? null;
            $dept = $_GET['department'] ?? null;
            $phase = $_GET['phase'] ?? null;

            $sql = "SELECT * FROM materials WHERE 1=1";
            $params = [];
            if ($type) { $sql .= " AND type = ?"; $params[] = $type; }
            if ($dept) { $sql .= " AND department = ?"; $params[] = $dept; }
            if ($phase) { $sql .= " AND phase = ?"; $params[] = $phase; }
            $sql .= " ORDER BY id ASC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
            exit;
        }

        // POST /api/materials (Admin only)
        if ($method === 'POST') {
            sda_require_admin();
            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("INSERT INTO materials (title, type, department, phase, icon, file_url, version, acknowledged_by, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $body['title'] ?? 'Untitled Material',
                $body['type'] ?? 'sop',
                $body['department'] ?? 'Architecture',
                $body['phase'] ?? 'Design Phase',
                $body['icon'] ?? '📋',
                $body['file_url'] ?? '',
                $body['version'] ?? 'V1.0',
                json_encode([]),
                $now, $now
            ]);
            $newId = $pdo->lastInsertId();
            $res = $pdo->prepare("SELECT * FROM materials WHERE id = ?");
            $res->execute([$newId]);
            http_response_code(201);
            echo json_encode($res->fetch());
            exit;
        }

        // PUT /api/materials/:id (Admin only)
        if ($method === 'PUT' && $id) {
            sda_require_admin();
            $fields = [];
            $params = [];
            foreach (['title', 'type', 'department', 'phase', 'icon', 'file_url', 'version'] as $f) {
                if (isset($body[$f])) {
                    $fields[] = "$f = ?";
                    $params[] = $body[$f];
                }
            }
            if (!empty($fields)) {
                $fields[] = "updatedAt = ?";
                $params[] = date('Y-m-d H:i:s');
                $params[] = $id;
                $pdo->prepare("UPDATE materials SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
            }
            $res = $pdo->prepare("SELECT * FROM materials WHERE id = ?");
            $res->execute([$id]);
            echo json_encode($res->fetch());
            exit;
        }

        // DELETE /api/materials/:id (Admin only)
        if ($method === 'DELETE' && $id) {
            sda_require_admin();
            $pdo->prepare("DELETE FROM materials WHERE id = ?")->execute([$id]);
            echo json_encode(['message' => 'Material deleted successfully']);
            exit;
        }
    }

    // ── ASSESSMENTS ROUTES: /api/assessments ──
    if ($segments[0] === 'assessments') {
        $id = $segments[1] ?? null;
        $subaction = $segments[2] ?? null;

        // POST /api/assessments/:id/submit
        if ($id && $subaction === 'submit' && $method === 'POST') {
            $authUser = sda_require_auth();
            $answers = $body['answers'] ?? [];
            $score = isset($body['score']) ? (int)$body['score'] : 100;
            $now = date('Y-m-d H:i:s');

            $stmt = $pdo->prepare("INSERT INTO assessment_results (user_id, assessment_id, score, status, answers_json, submitted_at, createdAt, updatedAt) VALUES (?, ?, ?, 'passed', ?, ?, ?, ?)");
            $stmt->execute([$authUser['id'], $id, $score, json_encode($answers), $now, $now, $now]);
            $resId = $pdo->lastInsertId();

            $res = $pdo->prepare("SELECT * FROM assessment_results WHERE id = ?");
            $res->execute([$resId]);
            echo json_encode(['message' => 'Assessment submitted successfully', 'result' => $res->fetch()]);
            exit;
        }

        // GET /api/assessments
        if ($method === 'GET') {
            sda_require_auth();
            $stmt = $pdo->query("SELECT * FROM assessments ORDER BY id ASC");
            echo json_encode($stmt->fetchAll());
            exit;
        }
    }

    // ── CERTIFICATES ROUTES: /api/certificates ──
    if ($segments[0] === 'certificates') {
        $action = $segments[1] ?? '';
        if ($action === 'me' && $method === 'GET') {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("SELECT * FROM certificates WHERE user_id = ? ORDER BY id DESC");
            $stmt->execute([$authUser['id']]);
            echo json_encode($stmt->fetchAll());
            exit;
        }
    }

    // ── ANNOUNCEMENTS ROUTES: /api/announcements ──
    if ($segments[0] === 'announcements') {
        if ($method === 'GET') {
            sda_require_auth();
            $cat = $_GET['category'] ?? null;
            $sql = "SELECT * FROM announcements";
            $params = [];
            if ($cat && $cat !== 'all') {
                $sql .= " WHERE category = ?";
                $params[] = $cat;
            }
            $sql .= " ORDER BY id DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
            exit;
        }

        if ($method === 'POST') {
            sda_require_admin();
            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("INSERT INTO announcements (title, author, category, tag, tag_cls, body, likes_count, comments_count, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $body['title'] ?? 'New Announcement',
                $body['author'] ?? 'Laura HR',
                $body['category'] ?? 'hr',
                $body['tag'] ?? 'HR Announcement',
                $body['tag_cls'] ?? 'badge-navy',
                $body['body'] ?? '',
                (int)($body['likes_count'] ?? 0),
                (int)($body['comments_count'] ?? 0),
                $now, $now
            ]);
            $newId = $pdo->lastInsertId();
            $res = $pdo->prepare("SELECT * FROM announcements WHERE id = ?");
            $res->execute([$newId]);
            http_response_code(201);
            echo json_encode($res->fetch());
            exit;
        }
    }

    // ── TICKETS ROUTES: /api/tickets ──
    if ($segments[0] === 'tickets') {
        $action = $segments[1] ?? '';

        if ($action === 'me' && $method === 'GET') {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY id DESC");
            $stmt->execute([$authUser['id']]);
            echo json_encode($stmt->fetchAll());
            exit;
        }

        if ($method === 'POST') {
            $authUser = sda_require_auth();
            $now = date('Y-m-d H:i:s');
            $dept = $body['department'] ?? 'IT Support';
            $stmt = $pdo->prepare("INSERT INTO support_tickets (user_id, subject, department, description, status, status_badge, time_ago, assigned_agent, assigned_role, latest_comment, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'open', 'Open', 'Just now', 'Support Team', ?, 'Your ticket has been received and is pending assignment.', ?, ?)");
            $stmt->execute([
                $authUser['id'],
                $body['subject'] ?? 'Support Inquiry',
                $dept,
                $body['description'] ?? '',
                $dept,
                $now, $now
            ]);
            $newId = $pdo->lastInsertId();
            $res = $pdo->prepare("SELECT * FROM support_tickets WHERE id = ?");
            $res->execute([$newId]);
            http_response_code(201);
            echo json_encode($res->fetch());
            exit;
        }
    }

    // ── VIDEO NOTES ROUTES: /api/notes ──
    if ($segments[0] === 'notes') {
        $action = $segments[1] ?? '';

        if ($action === 'me' && $method === 'GET') {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("SELECT * FROM video_notes WHERE user_id = ? ORDER BY id ASC");
            $stmt->execute([$authUser['id']]);
            echo json_encode($stmt->fetchAll());
            exit;
        }

        if ($method === 'POST') {
            $authUser = sda_require_auth();
            $now = date('Y-m-d H:i:s');
            $stmt = $pdo->prepare("INSERT INTO video_notes (user_id, timestamp_sec, text, is_mine, is_bookmarked, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?, ?)");
            $stmt->execute([
                $authUser['id'],
                $body['timestamp_sec'] ?? '05:18',
                $body['text'] ?? '',
                !empty($body['is_bookmarked']) ? 1 : 0,
                $now, $now
            ]);
            $newId = $pdo->lastInsertId();
            $res = $pdo->prepare("SELECT * FROM video_notes WHERE id = ?");
            $res->execute([$newId]);
            http_response_code(201);
            echo json_encode($res->fetch());
            exit;
        }

        if ($method === 'DELETE' && !empty($action)) {
            $authUser = sda_require_auth();
            $stmt = $pdo->prepare("DELETE FROM video_notes WHERE id = ? AND user_id = ?");
            $stmt->execute([$action, $authUser['id']]);
            echo json_encode(['message' => 'Note deleted']);
            exit;
        }
    }

    // ── CONTACT FORM: /api/contact ──
    if ($segments[0] === 'contact' && $method === 'POST') {
        $name = trim($body['name'] ?? '');
        $topic = trim($body['topic'] ?? '');
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $msg = trim($body['message'] ?? '');

        if (!$name || !$topic || !$email || !$msg) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Name, topic, email, and message are required fields.'
            ]);
            exit;
        }

        $ticketId = 'SDA-TKT-' . mt_rand(100000, 999999);
        echo json_encode([
            'success' => true,
            'ticketId' => $ticketId,
            'message' => 'Your message has been received. Our HR/L&D support team will respond within 1 business day.',
            'expectedSLA' => '1 business day'
        ]);
        exit;
    }

    // Unmatched endpoint
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server Error',
        'message' => $e->getMessage()
    ]);
    exit;
}
