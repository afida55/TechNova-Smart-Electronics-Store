-- ============================================================
-- TechNova Intelligent E-commerce Platform
-- Database initialization script
-- Run this once (or let docker-compose auto-run it) before starting the backend.
-- ============================================================

CREATE DATABASE IF NOT EXISTS shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop;

-- ------------------------------------------------------------
-- 1. user
-- ------------------------------------------------------------
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS order_item;
DROP TABLE IF EXISTS `order`;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  phone       VARCHAR(20)  NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. category (self-referencing for nested subcategories)
-- ------------------------------------------------------------
CREATE TABLE category (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  parent_id BIGINT NULL,
  CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES category(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. product
-- ------------------------------------------------------------
CREATE TABLE product (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)   NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,
  stock       INT            NOT NULL DEFAULT 0,
  category_id BIGINT         NOT NULL,
  image       VARCHAR(255),
  description TEXT,
  create_time DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. cart
-- ------------------------------------------------------------
CREATE TABLE cart (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity   INT    NOT NULL DEFAULT 1,
  CONSTRAINT fk_cart_user    FOREIGN KEY (user_id)    REFERENCES user(id),
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. order  (backtick-quoted: ORDER is a reserved SQL keyword)
-- ------------------------------------------------------------
CREATE TABLE `order` (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_no       VARCHAR(40)    NOT NULL UNIQUE,
  user_id        BIGINT         NOT NULL,
  total_price    DECIMAL(10, 2) NOT NULL,
  status         VARCHAR(20)    NOT NULL DEFAULT 'pending' COMMENT 'pending, paid, shipped, completed, cancelled',
  receiver_name  VARCHAR(50)    NOT NULL,
  receiver_phone VARCHAR(20)    NOT NULL,
  address        VARCHAR(255)   NOT NULL,
  create_time    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. order_item
-- ------------------------------------------------------------
CREATE TABLE order_item (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id   BIGINT         NOT NULL,
  product_id BIGINT         NOT NULL,
  quantity   INT            NOT NULL,
  price      DECIMAL(10, 2) NOT NULL COMMENT 'unit price at time of purchase',
  CONSTRAINT fk_orderitem_order   FOREIGN KEY (order_id)   REFERENCES `order`(id),
  CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. wishlist (extra table backing the frontend's Wishlist page)
-- ------------------------------------------------------------
CREATE TABLE wishlist (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT   NOT NULL,
  product_id  BIGINT   NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  CONSTRAINT fk_wishlist_user    FOREIGN KEY (user_id)    REFERENCES user(id),
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB;

-- ============================================================
-- Seed / test data
-- ============================================================

-- Password for every seed user is: 123456   (bcrypt hash below)
INSERT INTO user (username, password, phone, email) VALUES
('alice',   '$2b$10$okSQ.NtIBkD1WG5wEwi4QuW0qHwteMZeec4iRgAz/81/tlOpnNKLm', '13800000001', 'alice@example.com'),
('bob',     '$2b$10$okSQ.NtIBkD1WG5wEwi4QuW0qHwteMZeec4iRgAz/81/tlOpnNKLm', '13800000002', 'bob@example.com'),
('carol',   '$2b$10$okSQ.NtIBkD1WG5wEwi4QuW0qHwteMZeec4iRgAz/81/tlOpnNKLm', '13800000003', 'carol@example.com'),
('dave',    '$2b$10$okSQ.NtIBkD1WG5wEwi4QuW0qHwteMZeec4iRgAz/81/tlOpnNKLm', '13800000004', 'dave@example.com'),
('admin',   '$2b$10$okSQ.NtIBkD1WG5wEwi4QuW0qHwteMZeec4iRgAz/81/tlOpnNKLm', '13800000005', 'admin@example.com');

INSERT INTO category (id, name, parent_id) VALUES
(1, 'Electronics', NULL),
(2, 'Smartphones', 1),
(3, 'Laptops', 1),
(4, 'Audio', 1),
(5, 'Wearables', 1),
(6, 'Earbuds', 4),
(7, 'Headphones', 4);

INSERT INTO product (name, price, stock, category_id, image, description) VALUES
('Nova Phone X12', 899.00, 25, 2, '/images/phone-x12.jpg', 'Flagship smartphone with a 6.7" OLED display and triple camera.'),
('Nova Phone Lite', 399.00, 60, 2, '/images/phone-lite.jpg', 'Budget-friendly smartphone with all-day battery life.'),
('NovaBook Pro 14', 1299.00, 15, 3, '/images/book-pro14.jpg', '14-inch ultrabook with 16GB RAM and 512GB SSD.'),
('NovaBook Air 13', 999.00, 20, 3, '/images/book-air13.jpg', 'Lightweight 13-inch laptop for everyday productivity.'),
('Nova Buds Pro', 149.00, 80, 6, '/images/buds-pro.jpg', 'Active noise-cancelling wireless earbuds.'),
('Nova Buds Lite', 69.00, 120, 6, '/images/buds-lite.jpg', 'Affordable wireless earbuds with 20-hour battery.'),
('Nova Headphone Studio', 199.00, 30, 7, '/images/headphone-studio.jpg', 'Over-ear studio headphones with rich bass.'),
('Nova Watch S2', 249.00, 40, 5, '/images/watch-s2.jpg', 'Fitness smartwatch with heart-rate and sleep tracking.'),
('Nova Speaker Mini', 59.00, 0, 4, '/images/speaker-mini.jpg', 'Portable Bluetooth speaker, currently out of stock.'),
('Nova Tablet 10', 349.00, 18, 1, '/images/tablet-10.jpg', '10-inch tablet great for media and light work.');

-- alice's cart
INSERT INTO cart (user_id, product_id, quantity) VALUES
(1, 5, 1),
(1, 8, 2),
(2, 1, 1);

INSERT INTO `order` (order_no, user_id, total_price, status, receiver_name, receiver_phone, address, create_time) VALUES
('TN1700000000001A', 1, 149.00, 'completed', 'Alice Zhang', '13800000001', '123 Chengdu Rd, Chengdu, Sichuan', '2026-06-01 10:00:00'),
('TN1700000000002B', 1, 899.00, 'shipped',   'Alice Zhang', '13800000001', '123 Chengdu Rd, Chengdu, Sichuan', '2026-07-10 14:20:00'),
('TN1700000000003C', 2, 1299.00,'paid',      'Bob Li',      '13800000002', '45 Jinjiang Ave, Chengdu, Sichuan', '2026-08-01 09:15:00'),
('TN1700000000004D', 3, 268.00, 'pending',   'Carol Wu',    '13800000003', '9 Wuhou St, Chengdu, Sichuan', '2026-08-15 18:45:00'),
('TN1700000000005E', 2, 69.00,  'cancelled', 'Bob Li',      '13800000002', '45 Jinjiang Ave, Chengdu, Sichuan', '2026-05-20 11:00:00');

INSERT INTO order_item (order_id, product_id, quantity, price) VALUES
(1, 5, 1, 149.00),
(2, 1, 1, 899.00),
(3, 3, 1, 1299.00),
(4, 7, 1, 199.00),
(4, 6, 1, 69.00),
(5, 6, 1, 69.00);

INSERT INTO wishlist (user_id, product_id) VALUES
(1, 3),
(1, 4),
(2, 8),
(2, 10),
(3, 5);
