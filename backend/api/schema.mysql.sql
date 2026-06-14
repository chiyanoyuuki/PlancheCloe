-- Schema MySQL / MariaDB pour PlancheCloe.
-- Facultatif : la table est aussi creee automatiquement au premier appel de
-- l'API. Ce fichier est fourni a titre de reference / installation manuelle.

CREATE TABLE IF NOT EXISTS planche (
  id         INT       NOT NULL PRIMARY KEY,
  data       LONGTEXT  NOT NULL,
  updated_at DATETIME  NOT NULL
) DEFAULT CHARSET = utf8mb4;
