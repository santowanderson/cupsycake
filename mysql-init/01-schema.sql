CREATE TABLE IF NOT EXISTS `produtos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `descricao` TEXT NULL,
  `ingredientes` TEXT NULL,
  `preco` DECIMAL(10, 2) NOT NULL,
  `imagem_url` VARCHAR(500) NULL,
  `ativo` BOOLEAN NOT NULL DEFAULT TRUE,
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_produtos_nome` (`nome`),
  INDEX `idx_produtos_preco` (`preco`),
  INDEX `idx_produtos_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tags` (
  `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` ENUM('sem-gluten', 'sem-lactose', 'vegano') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tags_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produto_tags` (
  `produto_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`produto_id`, `tag_id`),
  CONSTRAINT `fk_produto_tags_produto`
    FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_produto_tags_tag`
    FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tags` (`nome`) VALUES
  ('sem-gluten'),
  ('sem-lactose'),
  ('vegano')
ON DUPLICATE KEY UPDATE `nome` = VALUES(`nome`);