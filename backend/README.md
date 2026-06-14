# Backend PlancheCloe (API PHP)

Petite API PHP qui permet d'enregistrer et de recharger toutes les données de
la planche tarifaire (textes, prix, descriptions, images, positions, pied de
page…) dans une base de données, et de téléverser des images.

L'application Angular appelle cette API ; l'adresse est configurée dans
`src/app/config.ts` (par défaut `http://cloechaudronbeauty.com/backend/api/`).

---

## 1. Installation sur le serveur

1. **Copiez le dossier `api/`** sur votre hébergement, à l'adresse :

   ```
   cloechaudronbeauty.com/backend/api/
   ```

2. **Créez le fichier de configuration** : dupliquez `config.sample.php` en
   `config.php`, puis renseignez vos informations :

   - `DB_DRIVER` : `'mysql'` (recommandé) ou `'sqlite'`.
   - Identifiants MySQL (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`).
   - `ADMIN_PASSWORD` : le mot de passe qui servira à se connecter à l'éditeur.
   - `AUTH_SECRET` : une longue chaîne aléatoire (ex. `openssl rand -hex 32`).
   - `UPLOAD_BASE_URL` : l'URL publique du dossier `uploads/`.

   > `config.php` n'est volontairement pas inclus dans le dépôt (secrets).

3. **Base de données**

   - **MySQL** : créez une base (ex. `cloechaudron`) via votre hébergeur, puis
     renseignez les identifiants. La table `planche` est créée automatiquement
     au premier appel ; vous pouvez aussi exécuter `schema.mysql.sql`.
   - **SQLite** : rien à créer, le fichier est généré automatiquement dans
     `api/data/`. Pensez à rendre ce dossier accessible en écriture.

4. **Droits d'écriture** : le dossier `uploads/` (et `data/` en SQLite) doit
   être accessible en écriture par le serveur (`chmod 775` en général).

5. **HTTPS** : si le site Angular est servi en HTTPS, l'API doit l'être aussi,
   sinon le navigateur bloquera les requêtes (« mixed content »). Adaptez alors
   `API_BASE` dans `src/app/config.ts` et `UPLOAD_BASE_URL` dans `config.php`.

---

## 2. Points d'entrée de l'API

| Méthode | URL           | Auth | Rôle                                            |
| ------- | ------------- | ---- | ----------------------------------------------- |
| GET     | `get.php`     | non  | Renvoie les données enregistrées (`data:null` si vide). |
| POST    | `login.php`   | non  | `{ password }` → `{ token }`.                   |
| POST    | `save.php`    | oui  | `{ data }` → enregistre toute la planche.       |
| POST    | `upload.php`  | oui  | `multipart/form-data` champ `file` → `{ url }`. |

L'authentification se fait via un jeton renvoyé par `login.php`, transmis
ensuite dans l'en-tête `Authorization: Bearer <jeton>`.

---

## 3. Utilisation dans le site

1. Ouvrez le site, cliquez sur **« ✎ Modifier la planche »**.
2. Connectez-vous avec le mot de passe défini dans `ADMIN_PASSWORD`.
3. Modifiez les textes, prix, descriptions, images, positions, etc. — la
   prévisualisation se met à jour en direct.
4. Cliquez sur **« 💾 Enregistrer »** : tout est sauvegardé en base.

Les visiteurs (non connectés) voient toujours la dernière version enregistrée :
les données sont rechargées depuis l'API à chaque ouverture du site.

> Tant que rien n'est enregistré, l'application utilise les valeurs par défaut
> embarquées (`public/data.json`). Le premier enregistrement initialise la base.

---

## 4. Sécurité

- Choisissez un `ADMIN_PASSWORD` robuste et un `AUTH_SECRET` long et aléatoire.
- Servez de préférence l'API en HTTPS.
- Le `.htaccess` fourni bloque l'accès direct à `config.php` et empêche
  l'exécution de scripts dans `uploads/`.
- Pour restreindre les appels à votre seul site, remplacez `ALLOWED_ORIGIN`
  (`'*'`) par l'URL exacte du site dans `config.php`.
