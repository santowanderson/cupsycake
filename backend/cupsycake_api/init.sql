sudo docker run --name cupsycake-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cupsycake_db \
  -p 3307:3306 \
  -d mysql:8.0



ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS `cupsycake_db`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `cupsycake_db`;


CREATE TABLE IF NOT EXISTS `customers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `cpf` CHAR(11) NOT NULL COMMENT 'Brazilian individual taxpayer ID',
    `email` VARCHAR(255) NOT NULL,
    `area_code` CHAR(2) NOT NULL,
    `phone_number` VARCHAR(9) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED') NOT NULL DEFAULT 'NOT_SPECIFIED',
    `birth_date` DATE NULL COMMENT 'Replaces static age for dynamic calculation',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt/Argon2)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Uniqueness Constraints
    CONSTRAINT `uk_customers_cpf` UNIQUE (`cpf`),
    CONSTRAINT `uk_customers_email` UNIQUE (`email`),

    -- Indexes
    INDEX `idx_customers_email` (`email`),
    INDEX `idx_customers_cpf` (`cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `addresses` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `zip_code` CHAR(8) NOT NULL COMMENT 'Numbers only',
    `street_address` VARCHAR(150) NOT NULL COMMENT 'Street, Avenue, etc.',
    `number` VARCHAR(20) NOT NULL,
    `complement` VARCHAR(100) NULL,
    `neighborhood` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state_code` CHAR(2) NOT NULL COMMENT 'State abbreviation (e.g., SP, RJ)',
    `state_name` VARCHAR(50) NOT NULL COMMENT 'Full state name',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Key Constraint
    CONSTRAINT `fk_addresses_customer` 
        FOREIGN KEY (`customer_id`) 
        REFERENCES `customers` (`id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,

    -- Indexes
    INDEX `idx_addresses_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE OR REPLACE VIEW `vw_customer_details` AS
SELECT 
    c.id AS customer_id,
    c.first_name,
    c.last_name,
    c.cpf,
    c.email,
    CONCAT('(', c.area_code, ') ', c.phone_number) AS formatted_phone,
    c.gender,
    c.birth_date,
    TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) AS age,
    a.zip_code,
    a.street_address,
    a.number,
    a.complement,
    a.neighborhood,
    a.city,
    a.state_code,
    a.state_name
FROM `customers` c
LEFT JOIN `addresses` a ON c.id = a.customer_id;


CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL COMMENT 'URL-friendly product name',
    `description` TEXT NULL,
    `ingredients` TEXT NULL,
    `price` DECIMAL(10, 2) UNSIGNED NOT NULL,
    `image_url` VARCHAR(150) NOT NULL,
    `stock_quantity` INT UNSIGNED NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Uniqueness Constraints
    CONSTRAINT `uk_products_slug` UNIQUE (`slug`),

    -- Indexes for search optimization
    INDEX `idx_products_name` (`name`),
    INDEX `idx_products_price` (`price`),
    INDEX `idx_products_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `tags` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL COMMENT 'e.g., gluten-free, lactose-free, vegan',
    `slug` VARCHAR(50) NOT NULL,
    
    -- Uniqueness Constraints
    CONSTRAINT `uk_tags_name` UNIQUE (`name`),
    CONSTRAINT `uk_tags_slug` UNIQUE (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `product_tags` (
    `product_id` BIGINT UNSIGNED NOT NULL,
    `tag_id` INT UNSIGNED NOT NULL,

    PRIMARY KEY (`product_id`, `tag_id`),

    -- Foreign Key Constraints
    CONSTRAINT `fk_product_tags_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT `fk_product_tags_tag`
        FOREIGN KEY (`tag_id`)
        REFERENCES `tags` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `tags` (`name`, `slug`) VALUES
('sem-glutem', 'sem-glutem'),
('sem-lactose', 'sem-lactose'),
('vegano', 'vegano')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(32) NOT NULL COMMENT 'Unique human-readable order code (e.g. ORD-20261009-001)',
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `shipping_address_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `total_amount` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00,
    `shipping_fee` DECIMAL(10, 2) UNSIGNED NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL COMMENT 'Special instructions or delivery notes',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Uniqueness Constraints
    CONSTRAINT `uk_orders_order_number` UNIQUE (`order_number`),

    -- Foreign Key Constraints
    CONSTRAINT `fk_orders_customer`
        FOREIGN KEY (`customer_id`)
        REFERENCES `customers` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `fk_orders_shipping_address`
        FOREIGN KEY (`shipping_address_id`)
        REFERENCES `addresses` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Indexes for performance
    INDEX `idx_orders_customer_id` (`customer_id`),
    INDEX `idx_orders_status` (`status`),
    INDEX `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) UNSIGNED NOT NULL COMMENT 'Price snapshot at the time of purchase',
    `subtotal` DECIMAL(10, 2) GENERATED ALWAYS AS (`quantity` * `unit_price`) STORED COMMENT 'Computed subtotal',

    -- Foreign Key Constraints
    CONSTRAINT `fk_order_items_order`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT `fk_order_items_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Indexes
    INDEX `idx_order_items_order_id` (`order_id`),
    INDEX `idx_order_items_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW `vw_customer_order_history` AS
SELECT 
    o.id AS order_id,
    o.order_number,
    o.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email AS customer_email,
    o.status,
    o.shipping_fee,
    o.total_amount,
    COUNT(oi.id) AS total_items_count,
    SUM(oi.quantity) AS total_cupcakes_qty,
    o.created_at AS order_date
FROM `orders` o
INNER JOIN `customers` c ON o.customer_id = c.id
LEFT JOIN `order_items` oi ON o.id = oi.order_id
GROUP BY o.id;


INSERT INTO `products` (`name`, `slug`, `description`, `ingredients`, `price`, `image_url`, `stock_quantity`, `is_active`) VALUES
-- Cupcakes Tradicionais (IDs 1 a 12)
('Cupcake Clássico de Baunilha', 'cupcake-classico-de-baunilha', 'Delicioso cupcake de baunilha com cobertura de buttercream.', 'Farinha de trigo, açúcar, ovos, manteiga, baunilha, leite', 8.50, 'cupcake-classico-de-baunilha.jpg', 25, TRUE),
('Cupcake de Chocolate Supremo', 'cupcake-de-chocolate-supremo', 'Massa fofinha de chocolate com recheio e cobertura de ganache.', 'Farinha de trigo, cacau em pó, açúcar, ovos, manteiga, chocolate meio amargo', 9.50, 'cupcake-de-chocolate-supremo.jpg', 30, TRUE),
('Cupcake Red Velvet', 'cupcake-red-velvet', 'O clássico americano com toque aveludado e cream cheese frosting.', 'Farinha de trigo, cacau, corante vermelho, cream cheese, manteiga, açúcar', 10.00, 'cupcake-red-velvet.jpg', 20, TRUE),
('Cupcake de Doce de Leite', 'cupcake-de-doce-de-leite', 'Massa amanteigada recheada e coberta com doce de leite argentino.', 'Farinha de trigo, açúcar, ovos, manteiga, doce de leite', 9.00, 'cupcake-de-doce-de-leite.jpg', 15, TRUE),
('Cupcake de Morango com Chantilly', 'cupcake-de-morango-com-chantilly', 'Massa leve de baunilha com recheio de geleia de morango e chantilly.', 'Farinha de trigo, açúcar, ovos, manteiga, morangos frescos, creme de leite', 9.80, 'cupcake-de-morango-com-chantilly.jpg', 18, TRUE),
('Cupcake de Limão Siciliano', 'cupcake-de-limao-siciliano', 'Cupcake refrescante com toque cítrico e cobertura de merengue.', 'Farinha de trigo, limão siciliano, açúcar, ovos, manteiga', 8.90, 'cupcake-de-limao-siciliano.jpg', 22, TRUE),
('Cupcake de Paçoca', 'cupcake-de-pacoca', 'Massa de amendoim com cobertura cremosa de paçoca artesanal.', 'Farinha de trigo, amendoim, açúcar, ovos, manteiga, leite', 9.20, 'cupcake-de-pacoca.jpg', 25, TRUE),
('Cupcake de Prestígio', 'cupcake-de-prestigio', 'Massa de chocolate com recheio de beijinho de coco e cobertura de chocolate.', 'Farinha de trigo, cacau, coco ralado, leite condensado, manteiga', 9.50, 'cupcake-de-prestigio.jpg', 20, TRUE),
('Cupcake de Churros', 'cupcake-de-churros', 'Massa aromatizada com canela, recheio de doce de leite e açúcar polvilhado.', 'Farinha de trigo, canela, doce de leite, açúcar, ovos, manteiga', 9.00, 'cupcake-de-churros.jpg', 28, TRUE),
('Cupcake de Maracujá', 'cupcake-de-maracuja', 'Massa leve com toque tropical de maracujá e ganache de chocolate branco.', 'Farinha de trigo, suco de maracujá, chocolate branco, açúcar, ovos, manteiga', 9.30, 'cupcake-de-maracuja.jpg', 15, TRUE),
('Cupcake de Nozes com Caramelo', 'cupcake-de-nozes-com-caramelo', 'Massa com pedaços de nozes e cobertura de caramelo salgado.', 'Farinha de trigo, nozes, açúcar, manteiga, ovos, creme de leite', 11.00, 'cupcake-de-nozes-com-caramelo.jpg', 12, TRUE),
('Cupcake de Cappuccino', 'cupcake-de-cappuccino', 'Sabor intenso de café com toque de canela e chantilly de café.', 'Farinha de trigo, café solúvel, canela, açúcar, ovos, manteiga', 9.50, 'cupcake-de-cappuccino.jpg', 20, TRUE),

-- Cupcakes Apenas Sem Glúten (IDs 13 a 16) - Tag ID: 1 (gluten-free)
('Cupcake de Banana com Canela', 'cupcake-de-banana-com-canela', 'Cupcake nutritivo de banana, canela e aveia sem glúten.', 'Farinha de arroz, aveia certificada sem glúten, banana, ovos, óleo de coco, canela', 10.50, 'cupcake-de-banana-com-canela.jpg', 20, TRUE),
('Cupcake de Milho Cremoso', 'cupcake-de-milho-cremoso', 'Massa cremosa de milho verde feita com farinha de arroz.', 'Farinha de arroz, fubá fino, milho verde, açúcar, ovos, óleo de milho', 9.80, 'cupcake-de-milho-cremoso.jpg', 15, TRUE),
('Cupcake de Coco com Doce de Leite Zero', 'cupcake-de-coco-com-doce-de-leite-zero', 'Massa leve de coco sem glúten com toque de doce de leite zero.', 'Farinha de arroz, fécula de batata, coco ralado, ovos, óleo, doce de leite zero', 11.20, 'cupcake-de-coco-com-doce-de-leite-zero.jpg', 18, TRUE),
('Cupcake de Fubá com Goiabada', 'cupcake-de-fuba-com-goiabada', 'O clássico brasileiro adaptado sem glúten com recheio de goiabada cremosa.', 'Farinha de arroz, fubá, goiabada cascão, ovos, óleo de girassol, açúcar', 9.50, 'cupcake-de-fuba-com-goiabada.jpg', 22, TRUE),

-- Cupcakes Apenas Sem Lactose (IDs 17 a 20) - Tag ID: 2 (lactose-free)
('Cupcake de Chocolate Diet', 'cupcake-de-chocolate-diet', 'Opção deliciosa sem lactose e sem adição de açúcares.', 'Farinha de trigo, cacau em pó, adoçante culinário, óleo de coco, ovos', 10.00, 'cupcake-de-chocolate-diet.jpg', 15, TRUE),
('Cupcake de Baunilha', 'cupcake-de-baunilha', 'Massa leve de baunilha feita com leite vegetal e manteiga ghee clarificada.', 'Farinha de trigo, leite de amêndoas, ovos, açúcar, manteiga ghee, baunilha', 9.00, 'cupcake-de-baunilha.jpg', 25, TRUE),
('Cupcake de Frutas Vermelhas', 'cupcake-de-frutas-vermelhas', 'Massa fofinha com recheio artesanal de frutas vermelhas e cobertura leve.', 'Farinha de trigo, mix de frutas vermelhas, leite de coco, açúcar, ovos', 10.20, 'cupcake-de-frutas-vermelhas.jpg', 14, TRUE),
('Cupcake de Coco Cremoso', 'cupcake-de-coco-cremoso', 'Sabor marcante de coco com leite de coco fresco e óleo vegetal.', 'Farinha de trigo, leite de coco, coco ralado, açúcar, ovos, óleo de coco', 9.20, 'cupcake-de-coco-cremoso.jpg', 20, TRUE),

-- Cupcakes Veganos (IDs 21 a 24) - Tag IDs: 2 (lactose-free) e 3 (vegan)
('Cupcake Vegano de Cacau com Abacate', 'cupcake-vegano-de-cacau-com-abacate', 'Massa rica em cacau com ganache cremosa à base de abacate e cacau.', 'Farinha de trigo integral, cacau, abacate, açúcar mascavo, óleo de coco', 11.50, 'cupcake-vegano-de-cacau-com-abacate.jpg', 18, TRUE),
('Cupcake Vegano de Cenoura com Chocolate', 'cupcake-vegano-de-cenoura-com-chocolate', 'Massa de cenoura fofinha com cobertura de chocolate vegano.', 'Farinha de trigo, cenoura, óleo vegetal, açúcar, chocolate vegano em pó', 10.00, 'cupcake-vegano-de-cenoura-com-chocolate.jpg', 22, TRUE),
('Cupcake Vegano de Café com Nozes', 'cupcake-vegano-de-cafe-com-nozes', 'Energia e sabor com café forte, nozes trituradas e cobertura sem crueldade animal.', 'Farinha de trigo, café coado, nozes, açúcar demerara, óleo de girassol', 10.80, 'cupcake-vegano-de-cafe-com-nozes.jpg', 15, TRUE),
('Cupcake Vegano de Frutas Tropicais', 'cupcake-vegano-de-frutas-tropicais', 'Massa leve com maracujá e manga, totalmente vegetal.', 'Farinha de trigo, purê de manga, suco de maracujá, açúcar, óleo vegetal', 9.90, 'cupcake-vegano-de-frutas-tropicais.jpg', 16, TRUE),

-- Cupcakes Veganos e Sem Glúten (IDs 25 a 27) - Tag IDs: 1 (gluten-free), 2 (lactose-free), 3 (vegan)
('Cupcake Vegano e Sem Glúten de Amêndoas', 'cupcake-vegano-e-sem-gluten-de-amendoas', 'Totalmente livre de ingredientes de origem animal e glúten, com farinha de amêndoas.', 'Farinha de amêndoas, fécula de batata, leite de castanhas, açúcar de coco, óleo de coco', 13.00, 'cupcake-vegano-e-sem-gluten-de-amendoas.jpg', 12, TRUE),
('Cupcake Vegano e Sem Glúten de Castanhas', 'cupcake-vegano-e-sem-gluten-de-castanhas', 'Textura incrível com mix de castanhas de caju e do pará, sem glúten e vegano.', 'Farinha de arroz integral, castanha de caju, leite de coco, açúcar demerara, óleo de coco', 12.50, 'cupcake-vegano-e-sem-gluten-de-castanhas.jpg', 14, TRUE),
('Cupcake Vegano e Sem Glúten de Maçã e Canela', 'cupcake-vegano-e-sem-gluten-de-maca-e-canela', 'Aconchegante, sem glúten, sem lactose e vegano.', 'Farinha de arroz, maçã picada, canela em pó, açúcar de coco, óleo de girassol', 11.00, 'cupcake-vegano-e-sem-gluten-de-maca-e-canela.jpg', 20, TRUE),

-- Cupcakes Sem Glúten e Sem Lactose (IDs 28 a 29) - Tag IDs: 1 (gluten-free), 2 (lactose-free)
('Cupcake Sem Glúten e Sem Lactose de Laranja', 'cupcake-sem-gluten-e-sem-lactose-de-laranja', 'Cítrico, leve, sem glúten e sem lactose.', 'Farinha de arroz, fécula de mandioca, suco de laranja natural, ovos, óleo vegetal', 9.80, 'cupcake-sem-gluten-e-sem-lactose-de-laranja.jpg', 19, TRUE),
('Cupcake Sem Glúten e Sem Lactose de Limão', 'cupcake-sem-gluten-e-sem-lactose-de-limao', 'Refrescante, feito com ingredientes selecionados livres de glúten e lactose.', 'Farinha de arroz, fécula de batata, raspas de limão, ovos, óleo vegetal', 9.80, 'cupcake-sem-gluten-e-sem-lactose-de-limao.jpg', 17, TRUE),

-- Cupcake Tradicional Extra (ID 30)
('Cupcake Brigadeiro Gourmet', 'cupcake-brigadeiro-gourmet', 'Massa clássica de chocolate com recheio cremoso de brigadeiro belga.', 'Farinha de trigo, cacau, leite condensado, creme de leite, manteiga, chocolate belga', 10.50, 'cupcake-brigadeiro-gourmet.jpg', 30, TRUE);

INSERT INTO `product_tags` (`product_id`, `tag_id`) VALUES
-- Produtos 13 a 16: Apenas Sem Glúten (Tag 1)
(13, 1),
(14, 1),
(15, 1),
(16, 1),

-- Produtos 17 a 20: Apenas Sem Lactose (Tag 2)
(17, 2),
(18, 2),
(19, 2),
(20, 2),

-- Produtos 21 a 24: Veganos (Tags 2 e 3)
(21, 2), (21, 3),
(22, 2), (22, 3),
(23, 2), (23, 3),
(24, 2), (24, 3),

-- Produtos 25 a 27: Veganos e Sem Glúten (Tags 1, 2 e 3)
(25, 1), (25, 2), (25, 3),
(26, 1), (26, 2), (26, 3),
(27, 1), (27, 2), (27, 3),

-- Produtos 28 a 29: Sem Glúten e Sem Lactose (Tags 1 e 2)
(28, 1), (28, 2),
(29, 1), (29, 2);