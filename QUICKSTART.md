# SmartSpend AI - Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ and npm
- **Python** 3.9+ with pip
- **PostgreSQL** 14+ or Docker
- **Redis** 7+ or Docker
- **Git**

## Repository Structure

```
smartspend-ai/
├── backend/              # NestJS API server + Python scrapers
├── frontend/             # Next.js web application
├── mobile/               # React Native mobile app (future)
├── browser-extension/    # Chrome/Firefox extension
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Browser Extension
cd ../browser-extension
npm install
```

### 2. Set Up Database with Docker (Recommended)

```bash
# From project root
docker-compose up -d postgres redis
```

Or use existing PostgreSQL and Redis installations:

```bash
# Create database
createdb smartspend_ai

# Verify Redis
redis-cli ping  # Should return PONG
```

### 3. Configure Environment Variables

#### Backend (.env)

Create `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartspend_ai

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OTP Configuration (for development)
OTP_ENABLED=false
DEFAULT_OTP=123456

# Proxy Configuration (optional for development)
PROXY_ENABLED=false
PROXY_POOL_URL=

# External Services
SENTRY_DSN=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Affiliate APIs (add as you integrate)
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
FLIPKART_API_KEY=

# AI Services (optional)
OPENAI_API_KEY=
```

#### Frontend (.env.local)

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=SmartSpend AI
```

### 4. Initialize Database

```bash
cd backend

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### 5. Start Development Servers

#### Option A: Start All Services

From project root:

```bash
npm run dev:all
```

#### Option B: Start Services Individually

**Terminal 1 - Backend API:**
```bash
cd backend
npm run start:dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 - Scraper Service (Python):**
```bash
cd backend
python -m src.scrapers.main
# Runs on http://localhost:8000
```

**Terminal 4 - Worker Queue:**
```bash
cd backend
npm run worker
```

### 6. Verify Setup

Visit the following URLs to verify everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/docs (Swagger)
- **Scraper Service**: http://localhost:8000/health

## Testing Core Features

### Test Authentication

```bash
# Send OTP (development mode uses DEFAULT_OTP)
curl -X POST http://localhost:3001/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Verify OTP
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```

### Test Product Search

```bash
curl http://localhost:3001/api/v1/products/search?q=iphone
```

### Test Price History

```bash
# Get product by ID (replace with actual ID from search results)
curl http://localhost:3001/api/v1/products/:id/price-history
```

## Browser Extension Development

### Load Extension in Chrome

1. Build the extension:
```bash
cd browser-extension
npm run build
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right)

4. Click "Load unpacked" and select `browser-extension/dist`

5. The extension icon should appear in your toolbar

### Test Extension

1. Visit Amazon India or Flipkart product pages
2. The extension should automatically detect the product page
3. Click the extension icon to see price history and comparisons

## Common Development Tasks

### Run Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

### Database Operations

```bash
# View database schema
psql -d smartspend_ai -c "\dt"

# Reset database (WARNING: deletes all data)
npm run db:reset

# Create new migration
npm run db:migration:create --name=create_users_table
```

### Debugging Scrapers

```bash
# Run scraper in debug mode
cd backend
python -m src.scrapers.amazon --debug --url="https://amazon.in/dp/B0CHWRXH8B"

# Test proxy rotation
python -m src.scripts.test_proxies
```

### View Logs

```bash
# Backend logs
docker logs smartspend-backend

# Database logs
docker logs smartspend-postgres

# Real-time log streaming
npm run logs:follow
```

## Production Deployment

### Prerequisites

- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Production database (managed PostgreSQL recommended)
- Production Redis instance
- SMTP service for emails
- SMS gateway for OTP

### Environment Configuration

Update `.env` files with production values:

```env
# Critical production settings
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/smartspend
REDIS_HOST=prod-redis-host
JWT_SECRET=<strong-random-secret>
OTP_ENABLED=true
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
```

### Deploy with Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

### Deploy to Cloud (AWS Example)

1. **ECS/EKS**: Container orchestration
2. **RDS**: Managed PostgreSQL
3. **ElastiCache**: Managed Redis
4. **CloudFront**: CDN for static assets
5. **S3**: File storage
6. **SES**: Email sending
7. **SNS/SQS**: Message queuing

See `docs/architecture/deployment.md` for detailed deployment guide.

## Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Redis Connection Error:**
```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

**Port Already in Use:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

**Scraper Not Working:**
```bash
# Test without proxies first
export PROXY_ENABLED=false

# Increase timeout
export REQUEST_TIMEOUT=30000

# Check for CAPTCHA
python -m src.scrapers.debug --url="target-url"
```

### Getting Help

- Check existing issues on GitHub
- Review documentation in `/docs`
- Join developer Discord/Slack channel
- Contact: dev@smartspend.ai

## Next Steps

1. **Customize Configuration**: Update branding, add API keys
2. **Add Retailers**: Implement scrapers for additional platforms
3. **Configure Alerts**: Set up email/SMS providers
4. **Test End-to-End**: Complete user journey testing
5. **Invite Beta Users**: Start with small user group
6. **Monitor & Iterate**: Use analytics to improve

## Additional Resources

- [Development Plan](./DEVELOPMENT_PLAN.md) - Detailed implementation roadmap
- [API Documentation](../api/api_overview.md) - Complete API reference
- [Architecture Guide](../architecture/system_architecture.md) - System design
- [Database Schema](../schemas/database_schema.sql) - Full schema reference

---

**Happy Coding! 🚀**

For questions or issues, please refer to the documentation or contact the development team.
