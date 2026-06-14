<?php
// =============================================================================
//  Connexion a la base de donnees + utilitaires communs (CORS, JSON).
//  Inclus par tous les autres scripts de l'API.
// =============================================================================

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'error' => 'config.php manquant : copiez config.sample.php en config.php puis renseignez-le.'
    ]);
    exit;
}
require $configFile;

// ---- En-tetes CORS ----------------------------------------------------------
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Reponse immediate aux requetes de pre-verification (preflight).
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// ---- Petites fonctions utilitaires -----------------------------------------
function json_out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_fail(string $message, int $code = 400): void {
    json_out(['ok' => false, 'error' => $message], $code);
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ---- Connexion PDO (singleton) ---------------------------------------------
function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        if (DB_DRIVER === 'sqlite') {
            $dir = dirname(DB_SQLITE_PATH);
            if (!is_dir($dir)) @mkdir($dir, 0775, true);
            $pdo = new PDO('sqlite:' . DB_SQLITE_PATH);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec('CREATE TABLE IF NOT EXISTS planche (
                id INTEGER PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )');
        } else {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->exec('CREATE TABLE IF NOT EXISTS planche (
                id INT NOT NULL PRIMARY KEY,
                data LONGTEXT NOT NULL,
                updated_at DATETIME NOT NULL
            ) DEFAULT CHARSET = utf8mb4');
        }
    } catch (Throwable $e) {
        json_fail('Connexion a la base impossible : ' . $e->getMessage(), 500);
    }

    return $pdo;
}
