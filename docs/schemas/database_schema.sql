-- SmartSpend AI Database Schema
-- Based on PRD Section 13: Updated Database Schema

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User addresses for location-based quick commerce pricing
CREATE TABLE addresses (
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
);

-- Canonical products table (normalized product catalog)
CREATE TABLE products (
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
);

-- Platform-specific product mappings
CREATE TABLE platform_products (
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
);

-- Price snapshots for e-commerce products
CREATE TABLE price_snapshots (
    id SERIAL PRIMARY KEY,
    platform_product_id INTEGER NOT NULL REFERENCES platform_products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2),
    availability_status VARCHAR(50) DEFAULT 'available',
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quick commerce specific pricing with location and fees
CREATE TABLE quick_commerce_prices (
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
);

-- User shopping carts
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart items
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    preferred_brand VARCHAR(255),
    preferred_pack_size VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart comparison results
CREATE TABLE cart_comparisons (
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
    available_item_count INTEGER,
    missing_item_count INTEGER,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coupons and offers
CREATE TABLE coupons (
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
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'inactive', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, coupon_code)
);

-- Price and availability alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('price_drop', 'cart_price', 'back_in_stock', 'coupon', 'bank_offer', 'wishlist_sale')),
    target_entity_type VARCHAR(50) NOT NULL CHECK (target_entity_type IN ('product', 'cart', 'wishlist')),
    target_entity_id INTEGER NOT NULL,
    target_price DECIMAL(10, 2),
    notification_channel VARCHAR(50) DEFAULT 'push' CHECK (notification_channel IN ('push', 'email', 'whatsapp', 'sms', 'in_app')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'triggered', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alert history/log
CREATE TABLE alert_history (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_channel VARCHAR(50),
    message TEXT,
    metadata JSONB
);

-- Product matching confidence scores
CREATE TABLE product_matches (
    id SERIAL PRIMARY KEY,
    product_id_1 INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_id_2 INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform VARCHAR(100),
    confidence_score DECIMAL(5, 2),
    match_type VARCHAR(50) CHECK (match_type IN ('auto', 'soft', 'manual_review')),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id_1, product_id_2, platform)
);

-- User wishlist
CREATE TABLE wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'My Wishlist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist items
CREATE TABLE wishlist_items (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform_product_id INTEGER REFERENCES platform_products(id),
    priority INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wishlist_id, product_id)
);

-- Savings tracking
CREATE TABLE user_savings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    savings_amount DECIMAL(10, 2) NOT NULL,
    savings_type VARCHAR(50) CHECK (savings_type IN ('cart_comparison', 'price_alert', 'coupon', 'deal')),
    source_platform VARCHAR(100),
    description TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Affiliate tracking
CREATE TABLE affiliate_clicks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform VARCHAR(100) NOT NULL,
    product_id INTEGER REFERENCES products(id),
    affiliate_link TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10, 2),
    commission_earned DECIMAL(10, 2),
    metadata JSONB
);

-- Data ingestion jobs
CREATE TABLE ingestion_jobs (
    id SERIAL PRIMARY KEY,
    job_type VARCHAR(100) NOT NULL,
    platform VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin audit logs
CREATE TABLE admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_products_normalized_key ON products(normalized_key);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_platform_products_product_id ON platform_products(product_id);
CREATE INDEX idx_platform_products_platform ON platform_products(platform);
CREATE INDEX idx_price_snapshots_platform_product_id ON price_snapshots(platform_product_id);
CREATE INDEX idx_price_snapshots_captured_at ON price_snapshots(captured_at);
CREATE INDEX idx_quick_commerce_prices_product_id ON quick_commerce_prices(product_id);
CREATE INDEX idx_quick_commerce_prices_platform ON quick_commerce_prices(platform);
CREATE INDEX idx_quick_commerce_prices_location ON quick_commerce_prices(city, pincode);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_comparisons_cart_id ON cart_comparisons(cart_id);
CREATE INDEX idx_coupons_platform ON coupons(platform);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_user_savings_user_id ON user_savings(user_id);
CREATE INDEX idx_affiliate_clicks_user_id ON affiliate_clicks(user_id);
CREATE INDEX idx_ingestion_jobs_status ON ingestion_jobs(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
