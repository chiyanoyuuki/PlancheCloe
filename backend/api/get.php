<?php
// =============================================================================
//  GET get.php  ->  renvoie les donnees de la planche enregistrees.
//  Acces public (lecture seule). Si rien n'est enregistre, data = null et
//  l'application utilise ses valeurs par defaut.
// =============================================================================

require __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    json_fail('Methode non autorisee.', 405);
}

$row = db()->query('SELECT data, updated_at FROM planche WHERE id = 1')
           ->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    json_out(['ok' => true, 'data' => null, 'updated_at' => null]);
}

json_out([
    'ok'         => true,
    'data'       => json_decode($row['data'], true),
    'updated_at' => $row['updated_at'],
]);
