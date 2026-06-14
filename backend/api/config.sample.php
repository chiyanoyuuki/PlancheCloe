<?php
// =============================================================================
//  PlancheCloe - configuration du backend
// -----------------------------------------------------------------------------
//  COPIEZ ce fichier en "config.php" puis renseignez vos informations.
//  Le fichier config.php ne doit PAS etre partage publiquement.
// =============================================================================

// ---- Base de donnees --------------------------------------------------------
// Moteur a utiliser : 'mysql' (recommande sur hebergement mutualise) ou 'sqlite'.
define('DB_DRIVER', 'mysql');

// --- Parametres MySQL / MariaDB (utilises si DB_DRIVER = 'mysql') ---
define('DB_HOST', 'localhost');
define('DB_NAME', 'cloechaudron');
define('DB_USER', 'utilisateur');
define('DB_PASS', 'mot_de_passe_bdd');
define('DB_CHARSET', 'utf8mb4');

// --- Parametre SQLite (utilise si DB_DRIVER = 'sqlite') ---
// Chemin ABSOLU du fichier de base (cree automatiquement).
define('DB_SQLITE_PATH', __DIR__ . '/data/planche.sqlite');

// ---- Securite ---------------------------------------------------------------
// Mot de passe de l'espace d'administration (a saisir dans l'editeur du site).
define('ADMIN_PASSWORD', 'changez-ce-mot-de-passe');

// Cle secrete servant a signer les jetons de connexion.
// Mettez une longue chaine aleatoire, par ex. le resultat de :  openssl rand -hex 32
define('AUTH_SECRET', 'remplacez-par-une-longue-chaine-aleatoire-unique');

// Duree de validite d'une connexion admin, en secondes (ici 7 jours).
define('AUTH_TTL', 7 * 24 * 3600);

// ---- Televersement d'images -------------------------------------------------
// Dossier ou enregistrer les images televersees (doit etre accessible en ecriture).
define('UPLOAD_DIR', __DIR__ . '/uploads');

// URL publique correspondant a ce dossier (sans slash final).
define('UPLOAD_BASE_URL', 'http://cloechaudronbeauty.com/backend/api/uploads');

// ---- CORS -------------------------------------------------------------------
// Origine autorisee a appeler l'API. '*' = toutes les origines.
// Pour plus de securite, mettez l'URL exacte du site, par ex :
//   'https://www.cloechaudronbeauty.com'
define('ALLOWED_ORIGIN', '*');
