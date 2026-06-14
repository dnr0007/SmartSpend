# SmartSpend AI Backend

Node.js backend for SmartSpend AI - India's AI-powered shopping and grocery savings assistant.

## Features

- **User Authentication**: OTP-based login with JWT tokens
- **Product Search & Comparison**: Search across e-commerce platforms
- **Price Tracking**: Real-time price scraping from Amazon, Flipkart
- **Cart Management**: Create and compare grocery carts
- **Price Alerts**: Set and manage price drop alerts
- **Coupon Engine**: Discover and validate coupons
- **AI Recommendations**: Buy/wait recommendations based on price history

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis (for sessions and rate limiting)
- **Web Scraping**: Puppeteer
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Chrome/Chromium (for Puppeteer)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`: Redis server host
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3000)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with phone/email
- `POST /api/v1/auth/send-otp` - Send OTP
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/:id` - Get product details with prices
- `POST /api/v1/products` - Create product (admin)

### Prices
- `POST /api/v1/prices/track` - Track price for URL
- `GET /api/v1/prices/history/:productId` - Get price history
- `GET /api/v1/prices/current/:productId` - Get current prices

### Carts
- `GET /api/v1/carts` - Get user's carts
- `POST /api/v1/carts` - Create cart
- `GET /api/v1/carts/:id` - Get cart details
- `PUT /api/v1/carts/:id/items` - Add/update item
- `DELETE /api/v1/carts/:id/items/:product_id` - Remove item

### Alerts
- `GET /api/v1/alerts` - Get user's alerts
- `POST /api/v1/alerts` - Create alert
- `PUT /api/v1/alerts/:id` - Update alert
- `DELETE /api/v1/alerts/:id` - Delete alert

### Coupons
- `GET /api/v1/coupons` - Get active coupons
- `POST /api/v1/coupons` - Create coupon (admin)

### AI
- `POST /api/v1/ai/recommend` - Get buy/wait recommendation
- `GET /api/v1/ai/savings-report/:userId` - Get savings report

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Run migration
npm run migrate

# Seed database
npm run seed
```

## Project Structure

```
src/
├── index.js              # Application entry point
├── config/               # Configuration files
├── controllers/          # Request handlers
├── middleware/           # Express middleware
├── models/               # Database models
├── routes/               # API route definitions
├── scrapers/             # Web scrapers for platforms
├── services/             # Business logic
├── utils/                # Utility functions
└── database/             # Database connection & migrations
```

## License

MIT
