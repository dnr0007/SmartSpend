export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  created_at: string;
}

export interface Product {
  id: string;
  canonical_name: string;
  brand: string;
  category: string;
  sub_category: string;
  image_url: string;
  barcode?: string;
}

export interface PlatformProduct {
  id: string;
  product_id: string;
  platform: string;
  platform_type: 'quick_commerce' | 'ecommerce';
  title: string;
  image_url: string;
  product_url: string;
  seller_name?: string;
  is_active: boolean;
}

export interface PriceSnapshot {
  id: string;
  platform_product_id: string;
  price: number;
  mrp: number;
  discount_percent: number;
  availability_status: string;
  captured_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  preferred_brand?: string;
  preferred_pack_size?: string;
}

export interface Cart {
  id: string;
  user_id: string;
  name: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface CartComparison {
  platform: string;
  item_total: number;
  delivery_fee: number;
  platform_fee: number;
  handling_fee: number;
  coupon_discount: number;
  final_total: number;
  eta_minutes?: number;
  available_item_count: number;
  missing_item_count: number;
}

export interface Alert {
  id: string;
  user_id: string;
  alert_type: 'price_drop' | 'historical_low' | 'back_in_stock' | 'cart_price' | 'coupon';
  target_entity_type: 'product' | 'cart';
  target_entity_id: string;
  target_price?: number;
  notification_channel: 'push' | 'email' | 'whatsapp' | 'sms';
  status: 'active' | 'paused' | 'triggered';
  created_at: string;
}

export interface Coupon {
  id: string;
  platform: string;
  coupon_code: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'cashback';
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  valid_from: string;
  valid_till: string;
  status: 'active' | 'expired' | 'invalid';
}

export interface PriceHistory {
  product_id: string;
  platform: string;
  history: Array<{
    date: string;
    price: number;
    mrp: number;
  }>;
  lowest_price: number;
  average_price: number;
  highest_price: number;
}

export interface AIRecommendation {
  recommendation: 'buy_now' | 'wait' | 'consider';
  reason: string;
  confidence: number;
  deal_score?: string;
  savings_potential?: number;
}

export interface SavingsReport {
  month: string;
  total_saved: number;
  grocery_saved: number;
  ecommerce_saved: number;
  transactions: Array<{
    date: string;
    platform: string;
    amount_saved: number;
    category: 'grocery' | 'ecommerce';
  }>;
}
