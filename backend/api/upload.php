<?php
// =============================================================================
//  POST upload.php  (multipart/form-data, champ "file")
//                   (en-tete: Authorization: Bearer <jeton>)
//  Enregistre une image et renvoie son URL publique.
// =============================================================================

require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_fail('Methode non autorisee.', 405);
}
require_auth();

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    json_fail('Aucun fichier recu.');
}

$file = $_FILES['file'];
if ($file['size'] > 8 * 1024 * 1024) {
    json_fail('Image trop volumineuse (max 8 Mo).', 413);
}

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);
if (!isset($allowed[$mime])) {
    json_fail('Format non supporte (JPG, PNG, WEBP ou GIF uniquement).');
}
$ext = $allowed[$mime];

if (!is_dir(UPLOAD_DIR) && !@mkdir(UPLOAD_DIR, 0775, true)) {
    json_fail('Dossier de televersement inaccessible.', 500);
}

// Nom de fichier : base assainie + suffixe aleatoire pour eviter les collisions.
$base = pathinfo($file['name'], PATHINFO_FILENAME);
$slug = strtolower(preg_replace('/[^a-zA-Z0-9_-]+/', '-', $base));
$slug = trim($slug, '-');
if ($slug === '') $slug = 'image';
$name = $slug . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$dest = rtrim(UPLOAD_DIR, '/') . '/' . $name;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_fail('Echec de l\'enregistrement du fichier.', 500);
}

json_out([
    'ok'   => true,
    'url'  => rtrim(UPLOAD_BASE_URL, '/') . '/' . $name,
    'name' => $name,
]);
