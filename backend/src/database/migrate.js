const { pool } = require('../database/connection');
const logger = require('../utils/logger');

class DatabaseMigration {
  async up() {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      logger.info('Starting database migration...');
      
      // Enable UUID extension
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) UNIQUE,
          email VARCHAR(255) UNIQUE,
          city VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // User addresses
      await client.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          label VARCHAR(100),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          pincode VARCHAR(10),
          city VARCHAR(100),
          state VARCHAR(100),
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Products table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          canonical_name VARCHAR(500) NOT NULL,
          brand VARCHAR(255),
          category VARCHAR(255),
          sub_category VARCHAR(255),
          image_url TEXT,
          barcode VARCHAR(100),
          normalized_key VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Platform products
      await client.query(`
        CREATE TABLE IF NOT EXISTS platform_products (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          platform VARCHAR(100) NOT NULL,
          platform_type VARCHAR(50) NOT NULL CHECK (platform_type IN ('quick_commerce', 'ecommerce')),
          platform_product_id VARCHAR(255) NOT NULL,
          product_url TEXT,
          title VARCHAR(1000),
          image_url TEXT,
          pack_size VARCHAR(100),
          unit VARCHAR(50),
          seller_name VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          last_checked_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(platform, platform_product_id)
        )
      `);
      
      // Price snapshots
      await client.query(`
        CREATE TABLE IF NOT EXISTS price_snapshots (
          id SERIAL PRIMARY KEY,
          platform_product_id INTEGER NOT NULL REFERENCES platform_products(id) ON DELETE CASCADE,
          price DECIMAL(10, 2) NOT NULL,
          mrp DECIMAL(10, 2),
          discount_percent DECIMAL(5, 2),
          availability_status VARCHAR(50) DEFAULT 'available',
          captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Quick commerce prices
      await client.query(`
        CREATE TABLE IF NOT EXISTS quick_commerce_prices (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          platform VARCHAR(100) NOT NULL,
          city VARCHAR(100),
          pincode VARCHAR(10),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          price DECIMAL(10, 2) NOT NULL,
          mrp DECIMAL(10, 2),
          availability BOOLEAN DEFAULT TRUE,
          eta_minutes INTEGER,
          delivery_fee DECIMAL(10, 2) DEFAULT 0,
          platform_fee DECIMAL(10, 2) DEFAULT 0,
          handling_fee DECIMAL(10, 2) DEFAULT 0,
          captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Carts
      await client.query(`
        CREATE TABLE IF NOT EXISTS carts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Cart items
      await client.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL DEFAULT 1,
          preferred_brand VARCHAR(255),
          preferred_pack_size VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Cart comparisons
      await client.query(`
        CREATE TABLE IF NOT EXISTS cart_comparisons (
          id SERIAL PRIMARY KEY,
          cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
          platform VARCHAR(100) NOT NULL,
          item_total DECIMAL(10, 2) NOT NULL,
          delivery_fee DECIMAL(10, 2) DEFAULT 0,
          platform_fee DECIMAL(10, 2) DEFAULT 0,
          handling_fee DECIMAL(10, 2) DEFAULT 0,
          coupon_discount DECIMAL(10, 2) DEFAULT 0,
          final_total DECIMAL(10, 2) NOT NULL,
          eta_minutes INTEGER,
          available_item_count INTEGER DEFAULT 0,
          missing_item_count INTEGER DEFAULT 0,
          captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Coupons
      await client.query(`
        CREATE TABLE IF NOT EXISTS coupons (
          id SERIAL PRIMARY KEY,
          platform VARCHAR(100) NOT NULL,
          coupon_code VARCHAR(100) NOT NULL,
          description TEXT,
          discount_type VARCHAR(50) CHECK (discount_type IN ('percentage', 'fixed', 'cashback')),
          discount_value DECIMAL(10, 2),
          min_order_value DECIMAL(10, 2),
          max_discount DECIMAL(10, 2),
          valid_from TIMESTAMP WITH TIME ZONE,
          valid_till TIMESTAMP WITH TIME ZONE,
          status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(platform, coupon_code)
        )
      `);
      
      // Alerts
      await client.query(`
        CREATE TABLE IF NOT EXISTS alerts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('price_drop', 'cart_price', 'back_in_stock', 'coupon')),
          target_entity_type VARCHAR(50) NOT NULL CHECK (target_entity_type IN ('product', 'cart', 'category')),
          target_entity_id INTEGER NOT NULL,
          target_price DECIMAL(10, 2),
          notification_channel VARCHAR(50) DEFAULT 'push' CHECK (notification_channel IN ('push', 'email', 'whatsapp', 'sms')),
          status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'triggered', 'deleted')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
        CREATE INDEX IF NOT EXISTS idx_products_normalized_key ON products(normalized_key);
        CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
        CREATE INDEX IF NOT EXISTS idx_platform_products_product_id ON platform_products(product_id);
        CREATE INDEX IF NOT EXISTS idx_platform_products_platform ON platform_products(platform);
        CREATE INDEX IF NOT EXISTS idx_price_snapshots_platform_product_id ON price_snapshots(platform_product_id);
        CREATE INDEX IF NOT EXISTS idx_price_snapshots_captured_at ON price_snapshots(captured_at);
        CREATE INDEX IF NOT EXISTS idx_quick_commerce_prices_product_id ON quick_commerce_prices(product_id);
        CREATE INDEX IF NOT EXISTS idx_quick_commerce_prices_platform ON quick_commerce_prices(platform);
        CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
        CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
        CREATE INDEX IF NOT EXISTS idx_cart_comparisons_cart_id ON cart_comparisons(cart_id);
        CREATE INDEX IF NOT EXISTS idx_coupons_platform ON coupons(platform);
        CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
        CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
      `);
      
      await client.query('COMMIT');
      logger.info('Database migration completed successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Database migration failed', { error: error.message });
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DatabaseMigration;
