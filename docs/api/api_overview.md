# SmartSpend AI - API Documentation Overview

## Base URL

```
Production: https://api.smartspend.ai/v1
Staging: https://api-staging.smartspend.ai/v1
Development: http://localhost:3000/v1
```

## Authentication

All API requests require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

## Rate Limiting

| Tier | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Premium | 300 | 10,000 |
| Enterprise | 1,000 | Unlimited |

Rate limit headers included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705315800
```

---

# API Endpoints

## Authentication

### POST /auth/send-otp

Send OTP to phone number.

**Request:**
```json
{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "otp_sent": true,
    "expires_in": 300
  }
}
```

### POST /auth/verify-otp

Verify OTP and get access token.

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "John Doe",
      "phone": "+919876543210",
      "email": null
    }
  }
}
```

### POST /auth/refresh

Refresh access token.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

---

## Products

### GET /products/search

Search for products.

**Query Parameters:**
- `q` (required): Search query
- `category`: Filter by category
- `platform`: Filter by platform
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 123,
        "canonical_name": "Amul Taaza Fresh Milk",
        "brand": "Amul",
        "category": "Dairy",
        "image_url": "https://...",
        "platforms": [
          {
            "platform": "blinkit",
            "price": 62,
            "availability": true,
            "url": "https://..."
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### GET /products/:id

Get product details with price comparison.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 123,
      "canonical_name": "Amul Taaza Fresh Milk",
      "brand": "Amul",
      "category": "Dairy",
      "sub_category": "Milk",
      "pack_size": "500ml",
      "image_url": "https://...",
      "barcode": "123456789"
    },
    "price_comparison": {
      "current_prices": [
        {
          "platform": "blinkit",
          "price": 62,
          "mrp": 65,
          "discount_percent": 4.6,
          "availability": true,
          "eta_minutes": 9,
          "delivery_fee": 15,
          "last_updated": "2024-01-15T10:00:00Z"
        }
      ],
      "best_price": {
        "platform": "zepto",
        "price": 60
      }
    },
    "price_history": {
      "lowest_price": 58,
      "average_price": 63,
      "highest_price": 68,
      "trend": "stable"
    },
    "ai_recommendation": {
      "action": "buy",
      "confidence": 0.85,
      "reason": "Current price is close to historical lowest price."
    }
  }
}
```

---

## Carts

### POST /carts

Create a new cart.

**Request:**
```json
{
  "name": "Monthly Groceries",
  "items": [
    {
      "product_id": 123,
      "quantity": 2
    }
  ]
}
```

### GET /carts/:id/compare

Compare cart across quick commerce platforms.

**Response:**
```json
{
  "success": true,
  "data": {
    "cart_id": 456,
    "comparisons": [
      {
        "platform": "zepto",
        "item_total": 720,
        "delivery_fee": 10,
        "platform_fee": 5,
        "handling_fee": 2,
        "coupon_discount": 0,
        "final_total": 737,
        "eta_minutes": 11,
        "available_items": 18,
        "missing_items": 2,
        "ai_recommendation": "Best price option"
      }
    ],
    "recommendation": {
      "platform": "zepto",
      "reason": "Lowest final price with good availability",
      "alternatives": [
        {
          "platform": "blinkit",
          "reason": "Faster delivery but ₹44 more expensive"
        }
      ]
    },
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /carts/:id

Update cart items.

### DELETE /carts/:id

Delete cart.

---

## Price Alerts

### POST /alerts

Create price alert.

**Request:**
```json
{
  "alert_type": "price_drop",
  "target_entity_type": "product",
  "target_entity_id": 123,
  "target_price": 55000,
  "notification_channel": "push"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alert_id": 789,
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /alerts

List user alerts.

### PUT /alerts/:id

Update alert (pause, edit target price).

### DELETE /alerts/:id

Delete alert.

---

## Coupons

### GET /coupons

Get available coupons.

**Query Parameters:**
- `platform`: Filter by platform
- `category`: Filter by category
- `min_discount`: Minimum discount value

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "platform": "amazon",
        "coupon_code": "SAVE50",
        "description": "₹50 off on orders above ₹499",
        "discount_type": "fixed",
        "discount_value": 50,
        "min_order_value": 499,
        "max_discount": 50,
        "valid_till": "2024-01-31T23:59:59Z",
        "status": "verified"
      }
    ]
  }
}
```

### POST /coupons/validate

Validate coupon applicability.

**Request:**
```json
{
  "coupon_code": "SAVE50",
  "platform": "amazon",
  "cart_value": 550
}
```

---

## AI Recommendations

### POST /ai/recommend

Get AI recommendation for purchase decision.

**Request:**
```json
{
  "product_id": 123,
  "current_price": 58999,
  "urgency": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendation": "wait",
    "confidence": 0.78,
    "reason": "This product typically drops by 8-10% during sales. Current price is 8% above historical low.",
    "expected_savings": 4500,
    "suggested_wait_time": "2-3 weeks",
    "upcoming_sales": ["Republic Day Sale"],
    "alternative_products": [
      {
        "product_id": 124,
        "name": "Similar Product X",
        "price": 54999,
        "savings": 4000
      }
    ]
  }
}
```

### GET /ai/savings-report

Get monthly savings report.

---

## User

### GET /user/profile

Get user profile.

### PUT /user/profile

Update user profile.

### GET /user/addresses

List user addresses.

### POST /user/addresses

Add new address.

### GET /user/savings

Get user savings history.

### DELETE /user/account

Delete user account.

---

## Browser Extension

### GET /extension/product-data

Get product data for current page.

**Query Parameters:**
- `url`: Current page URL

**Response:**
```json
{
  "success": true,
  "data": {
    "product_found": true,
    "product_id": 123,
    "price_history": {
      "current": 58999,
      "lowest": 54499,
      "average": 61200
    },
    "deal_score": 7.5,
    "ai_recommendation": "wait",
    "coupons": [...],
    "comparison": [...]
  }
}
```

---

# Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| INVALID_TOKEN | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Access denied |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

# Webhooks

## Available Events

- `price_alert.triggered`
- `cart_price.changed`
- `coupon.available`
- `back_in_stock.notification`

## Webhook Payload

```json
{
  "event": "price_alert.triggered",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "alert_id": 789,
    "user_id": 1,
    "product_id": 123,
    "old_price": 60000,
    "new_price": 55000,
    "platform": "flipkart"
  }
}
```

---

*Last Updated: Based on PRD v1.0*
