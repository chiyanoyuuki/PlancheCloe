<?php
// =============================================================================
//  Authentification par jeton signe (sans session serveur).
//  Un jeton valide = "<expiration>.<signature HMAC>".
// =============================================================================

function make_token(): string {
    $exp = time() + AUTH_TTL;
    $sig = hash_hmac('sha256', (string)$exp, AUTH_SECRET);
    return $exp . '.' . $sig;
}

function token_is_valid(?string $token): bool {
    if (!$token) return false;
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2) return false;
    [$exp, $sig] = $parts;
    if (!ctype_digit($exp) || (int)$exp < time()) return false;
    $expected = hash_hmac('sha256', $exp, AUTH_SECRET);
    return hash_equals($expected, $sig);
}

function bearer_token(): ?string {
    $auth = '';
    if (function_exists('getallheaders')) {
        $h = getallheaders();
        $auth = $h['Authorization'] ?? $h['authorization'] ?? '';
    }
    if (!$auth) {
        $auth = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';
    }
    if (stripos($auth, 'Bearer ') === 0) {
        return trim(substr($auth, 7));
    }
    return null;
}

function require_auth(): void {
    if (!token_is_valid(bearer_token())) {
        json_fail('Non autorise. Reconnectez-vous.', 401);
    }
}
