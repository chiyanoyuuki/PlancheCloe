<?php
// =============================================================================
//  POST save.php  { "data": { ... } }   (en-tete: Authorization: Bearer <jeton>)
//  Enregistre (ou met a jour) l'integralite des donnees de la planche.
// =============================================================================

require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_fail('Methode non autorisee.', 405);
}
require_auth();

$body = read_json_body();
if (!isset($body['data']) || !is_array($body['data'])) {
    json_fail('Donnees invalides : champ "data" manquant.');
}

$json = json_encode($body['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    json_fail('Impossible d\'encoder les donnees.');
}
if (strlen($json) > 4 * 1024 * 1024) {
    json_fail('Donnees trop volumineuses.', 413);
}

$now = date('Y-m-d H:i:s');

if (DB_DRIVER === 'sqlite') {
    $stmt = db()->prepare(
        'INSERT INTO planche (id, data, updated_at) VALUES (1, :data, :now)
         ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    );
} else {
    $stmt = db()->prepare(
        'INSERT INTO planche (id, data, updated_at) VALUES (1, :data, :now)
         ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)'
    );
}
$stmt->execute([':data' => $json, ':now' => $now]);

json_out(['ok' => true, 'updated_at' => $now]);
