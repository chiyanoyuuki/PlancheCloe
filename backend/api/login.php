<?php
// =============================================================================
//  POST login.php  { "password": "..." }  ->  { ok, token, ttl }
//  Verifie le mot de passe admin et renvoie un jeton de connexion.
// =============================================================================

require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_fail('Methode non autorisee.', 405);
}

$body = read_json_body();
$password = isset($body['password']) ? (string)$body['password'] : '';

if (!hash_equals(ADMIN_PASSWORD, $password)) {
    usleep(400000); // petite temporisation contre le brute force
    json_fail('Mot de passe incorrect.', 401);
}

json_out(['ok' => true, 'token' => make_token(), 'ttl' => AUTH_TTL]);
