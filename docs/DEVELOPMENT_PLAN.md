# SmartSpend AI - Development Plan

## Executive Summary

This document outlines the technical implementation plan for building SmartSpend AI, an AI-powered shopping and grocery savings assistant for Indian users. The platform will focus on:

1. **Quick Commerce Cart Comparison** (Blinkit, Zepto, Swiggy Instamart, etc.)
2. **E-commerce Price Tracking** (Amazon, Flipkart, Myntra, etc.)
3. **Coupon & Offer Discovery**
4. **AI-Powered Buy/Wait Recommendations**
5. **Price Drop Alerts**
6. **Browser Extension**

---

## Technology Stack

### Backend
- **Primary**: Node.js with NestJS (TypeScript)
- **Secondary**: Python FastAPI (for scraping & ML services)
- **Database**: PostgreSQL (relational data) + Redis (caching)
- **Search**: Elasticsearch/OpenSearch (product search)
- **Queue**: BullMQ or Kafka (background jobs)
- **Storage**: AWS S3 (images, assets)

### Frontend
- **Framework**: Next.js 14+ (React)
- **Styling**: Tailwind CSS
- **Charts**: Recharts or ECharts
- **State**: Zustand or React Query

### Mobile
- **Framework**: React Native or Flutter
- **Target**: iOS and Android

### Browser Extension
- **Standard**: Chrome Manifest V3
- **Compatibility**: Firefox, Edge

### Infrastructure
- **Cloud**: AWS/GCP/Azure
- **Container**: Docker + Kubernetes
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **CI/CD**: GitHub Actions

### AI/ML
- **LLM**: For recommendation explanations
- **Embeddings**: Product matching
- **OCR**: Receipt/image processing
- **Computer Vision**: Image similarity

---

## Phase 1: Core Infrastructure (Months 1-3)

### Week 1-2: Project Setup & Database Design

#### Tasks:
1. Initialize repositories (backend, frontend, mobile, extension)
2. Set up development environments
3. Configure CI/CD pipelines
4. Design and implement database schema
5. Set up PostgreSQL and Redis

#### Deliverables:
- [ ] Git repositories initialized
- [ ] Docker Compose for local development
- [ ] Database schema deployed
- [ ] Basic health check endpoints

### Week 3-6: Data Ingestion Layer

#### Tasks:
1. Build scraper framework (Python)
2. Implement anti-detection measures:
   - Rotating proxies (residential IPs)
   - User-agent rotation
   - Request throttling
   - Headless browser support (Puppeteer/Playwright)
3. Create initial scrapers for:
   - Amazon India
   - Flipkart
   - Blinkit
   - Zepto
4. Build data normalization pipeline
5. Implement product matching algorithm

#### Technical Implementation:

**Scraper Architecture:**
```python
# backend/src/scrapers/base_scraper.py
class BaseScraper:
    def __init__(self, proxy_pool, user_agents):
        self.proxy_pool = proxy_pool
        self.user_agents = user_agents
    
    async def fetch(self, url, headers=None):
        # Rotate proxy and user-agent
        # Handle retries with exponential backoff
        pass
    
    async def parse_product(self, html):
        # Extract product details
        pass
```

**Product Matching:**
```python
# backend/src/services/product_matching.py
class ProductMatcher:
    def match_products(self, product_a, product_b):
        # Calculate similarity score using:
        # - Title fuzzy matching (Levenshtein distance)
        # - Brand matching
        # - EAN/UPC barcode matching
        # - Image similarity (if available)
        # - Category matching
        return confidence_score
```

#### Deliverables:
- [ ] Scraper framework with 4+ retailers
- [ ] Proxy rotation working
- [ ] Product matching with 85%+ accuracy
- [ ] Data ingestion API endpoints

### Week 7-10: Core API Development

#### Tasks:
1. Build RESTful API with NestJS
2. Implement authentication (OTP-based)
3. Create core endpoints:
   - Product search
   - Price history
   - Cart comparison
   - User management
   - Alerts
4. Set up caching layer (Redis)
5. Implement rate limiting

#### API Endpoints:
```typescript
// Authentication
POST /api/v1/auth/send-otp
POST /api/v1/auth/verify-otp

// Products
GET /api/v1/products/search?q=:query
GET /api/v1/products/:id
GET /api/v1/products/:id/price-history
GET /api/v1/products/:id/compare

// Carts (Quick Commerce)
POST /api/v1/carts
POST /api/v1/carts/:id/items
GET /api/v1/carts/:id/compare

// Alerts
POST /api/v1/alerts
GET /api/v1/alerts
PUT /api/v1/alerts/:id
DELETE /api/v1/alerts/:id

// Coupons
GET /api/v1/coupons?platform=:platform
POST /api/v1/coupons/validate
```

#### Deliverables:
- [ ] Complete API documentation (OpenAPI/Swagger)
- [ ] Authentication working with OTP
- [ ] All core endpoints functional
- [ ] Redis caching implemented
- [ ] Rate limiting configured

### Week 11-12: Background Jobs & Scheduled Tasks

#### Tasks:
1. Set up job queue (BullMQ)
2. Implement scheduled price updates:
   - Popular products: Every 1-6 hours
   - Long-tail products: Every 12-24 hours
   - Quick commerce: Every 5-15 minutes (active carts)
3. Build alert evaluation engine
4. Create data freshness monitoring

#### Deliverables:
- [ ] Job queue system operational
- [ ] Scheduled crawlers running
- [ ] Alert evaluation working
- [ ] Data freshness tracking

---

## Phase 2: Web Application (Months 3-5)

### Week 13-16: Frontend Foundation

#### Tasks:
1. Set up Next.js project with TypeScript
2. Implement design system with Tailwind CSS
3. Build core components:
   - Search bar with autocomplete
   - Product cards
   - Price history charts
   - Comparison tables
   - Alert forms
4. Create pages:
   - Home
   - Search results
   - Product detail
   - Cart comparison
   - User dashboard

#### Key Components:
```tsx
// frontend/src/components/PriceHistoryChart.tsx
interface PriceHistoryChartProps {
  productId: string;
  timeframe: '30d' | '90d' | '1y' | 'all';
}

// frontend/src/components/ProductComparison.tsx
interface ProductComparisonProps {
  productId: string;
  platforms: Platform[];
}
```

#### Deliverables:
- [ ] Responsive web app deployed
- [ ] Search functionality working
- [ ] Product detail pages with price history
- [ ] User authentication flow

### Week 17-20: Advanced Features

#### Tasks:
1. Implement cart builder for quick commerce
2. Build comparison engine UI
3. Add coupon discovery interface
4. Create alert management dashboard
5. Implement wishlist functionality
6. Add savings tracker

#### Deliverables:
- [ ] Cart comparison feature complete
- [ ] Coupon display and validation
- [ ] Alert creation and management
- [ ] Wishlist functionality

---

## Phase 3: Browser Extension (Months 5-6)

### Week 21-24: Extension Development

#### Tasks:
1. Set up Manifest V3 extension structure
2. Implement content scripts for:
   - Amazon India
   - Flipkart
   - Myntra
   - Ajio
3. Build popup interface
4. Create background service worker
5. Implement price overlay widget
6. Add one-click tracking

#### Extension Structure:
```
browser-extension/
├── src/
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   ├── amazon.ts
│   │   ├── flipkart.ts
│   │   └── myntra.ts
│   ├── popup/
│   │   ├── Popup.tsx
│   │   └── styles.css
│   └── utils/
│       └── api.ts
├── manifest.json
└── assets/
```

#### Key Features:
```typescript
// Content script example
class PriceOverlay {
  detectProductPage(): boolean {
    // Check URL patterns and page structure
  }
  
  extractProductData(): ProductData {
    // Scrape product details from current page
  }
  
  injectWidget(productData: ProductData): void {
    // Inject price history and comparison widget
  }
}
```

#### Deliverables:
- [ ] Chrome extension published
- [ ] Support for 4+ e-commerce sites
- [ ] Price history widget working
- [ ] One-click tracking functional

### Week 25-26: Cross-Browser Support

#### Tasks:
1. Adapt for Firefox
2. Adapt for Edge
3. Test on all browsers
4. Submit to respective stores

#### Deliverables:
- [ ] Firefox Add-on published
- [ ] Edge extension published
- [ ] Cross-browser compatibility verified

---

## Phase 4: AI & Advanced Features (Months 6-8)

### Week 27-32: AI Recommendation Engine

#### Tasks:
1. Build deal scoring algorithm
2. Implement fake discount detection
3. Create buy/wait recommendation engine
4. Develop natural language query interface
5. Build savings report generator

#### AI Models:
```python
# backend/src/ai/deal_scorer.py
class DealScorer:
    def calculate_deal_score(self, product_id):
        # Factors:
        # - Current price vs historical lowest
        # - Current price vs average price
        # - Discount percentage authenticity
        # - Seasonal trends
        # - Coupon availability
        return {
            'score': 0-100,
            'label': 'Excellent Deal' | 'Good Deal' | 'Average' | 'Wait',
            'confidence': float
        }

# backend/src/ai/fake_discount_detector.py
class FakeDiscountDetector:
    def detect_fake_discount(self, product_id):
        # Analyze:
        # - MRP inflation patterns
        # - Historical price consistency
        # - Competitor pricing
        # - Time since last "sale"
        return {
            'is_fake': bool,
            'reason': str,
            'actual_discount': float
        }
```

#### Deliverables:
- [ ] Deal scoring system (85%+ accuracy)
- [ ] Fake discount detection
- [ ] Buy/wait recommendations
- [ ] Natural language queries (beta)

### Week 33-36: Mobile App Development

#### Tasks:
1. Set up React Native/Flutter project
2. Implement core features:
   - Search
   - Product tracking
   - Cart comparison
   - Alerts
   - Coupons
3. Add push notifications
4. Implement biometric authentication
5. Optimize for mobile performance

#### Deliverables:
- [ ] iOS app (TestFlight)
- [ ] Android app (Internal testing)
- [ ] Push notifications working
- [ ] Feature parity with web app

---

## Phase 5: Launch & Iteration (Month 9+)

### Week 37-40: Testing & Optimization

#### Tasks:
1. Load testing (1000+ concurrent users)
2. Performance optimization
3. Security audit
4. Bug fixes
5. User acceptance testing
6. Beta launch with limited users

#### Deliverables:
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed
- [ ] Beta user feedback incorporated

### Week 41+: Public Launch & Growth

#### Tasks:
1. Public launch
2. Marketing campaigns
3. User acquisition
4. Continuous feature improvements
5. Add more retailers
6. Expand AI capabilities

---

## Technical Challenges & Solutions

### 1. Anti-Scraping Protection

**Challenge**: Major retailers use sophisticated bot detection systems.

**Solutions**:
- Use residential proxy pools (Bright Data, Oxylabs, Smartproxy)
- Implement browser fingerprinting evasion
- Rotate user-agents and request headers
- Add realistic delays between requests (2-5 seconds)
- Use headless browsers with stealth plugins
- Implement CAPTCHA solving services (2Captcha, Anti-Captcha)
- Consider official affiliate APIs where available

**Estimated Cost**: $500-$2,000/month for proxy services

### 2. Product Matching Across Platforms

**Challenge**: Same product listed differently across platforms.

**Solutions**:
- Multi-signal matching algorithm:
  - EAN/UPC barcode (highest confidence)
  - Brand + Model Number
  - Fuzzy title matching (85%+ similarity)
  - Image similarity (CNN-based)
  - Category + specifications
- Confidence scoring (0-100)
- Manual review queue for low-confidence matches
- User feedback loop for corrections

**Implementation**:
```python
def calculate_match_confidence(product_a, product_b):
    scores = {
        'barcode': 1.0 if barcodes_match else 0.0,
        'brand_model': fuzzy_match(brand_model_a, brand_model_b),
        'title': fuzzy_match(title_a, title_b),
        'image': image_similarity(image_a, image_b),
        'category': 1.0 if categories_match else 0.0
    }
    
    weighted_score = (
        scores['barcode'] * 0.4 +
        scores['brand_model'] * 0.25 +
        scores['title'] * 0.2 +
        scores['image'] * 0.1 +
        scores['category'] * 0.05
    )
    
    return weighted_score
```

### 3. Real-Time Performance

**Challenge**: Sub-second response times with large datasets.

**Solutions**:
- Multi-level caching:
  - L1: In-memory cache (node-local)
  - L2: Redis (shared cache)
  - L3: CDN (static assets)
- Database optimization:
  - Proper indexing
  - Query optimization
  - Read replicas
- Lazy loading for non-critical data
- Pre-computation of expensive calculations
- GraphQL for efficient data fetching (optional)

### 4. Data Freshness vs Cost

**Challenge**: Keeping prices updated without excessive infrastructure costs.

**Solutions**:
- Priority-based crawling:
  - Tier 1: Popular products (update every 1-2 hours)
  - Tier 2: Medium popularity (update every 6-12 hours)
  - Tier 3: Long-tail (update every 24 hours)
- Event-driven updates:
  - User-triggered refreshes
  - Alert-triggered checks
- Smart caching with TTL based on product volatility
- On-demand fresh data for premium users

### 5. Legal & Compliance

**Challenge**: Operating within legal boundaries.

**Solutions**:
- Use official APIs where available (Amazon Associates, Flipkart Affiliate)
- Respect robots.txt files
- Implement rate limiting (max 1 request per 2-3 seconds per domain)
- Clear disclaimers about price accuracy
- Terms of service compliance review
- No storage of third-party credentials
- No automated purchases without consent
- GDPR/India DPDP Act compliance for user data

---

## Estimated Costs

### Development Team (6-9 months)

| Role | Count | Monthly Cost (INR) | Total (6 months) |
|------|-------|-------------------|------------------|
| Senior Backend Developer | 2 | ₹1,50,000 | ₹18,00,000 |
| Frontend Developer | 2 | ₹1,20,000 | ₹14,40,000 |
| Python/ML Engineer | 1 | ₹1,50,000 | ₹9,00,000 |
| DevOps Engineer | 1 | ₹1,30,000 | ₹7,80,000 |
| UI/UX Designer | 1 | ₹1,00,000 | ₹6,00,000 |
| QA Engineer | 1 | ₹80,000 | ₹4,80,000 |
| **Total** | | | **₹60,00,000** (~$72,000) |

### Infrastructure (Monthly)

| Service | Cost (USD) | Notes |
|---------|-----------|-------|
| Proxy Services | $500-$2,000 | Residential IPs critical |
| Cloud Hosting (AWS/GCP) | $300-$1,000 | Scales with usage |
| Database (Managed PostgreSQL) | $100-$300 | RDS or Cloud SQL |
| Redis Cache | $50-$150 | ElastiCache or Memorystore |
| CAPTCHA Solving | $100-$500 | As needed |
| Monitoring & Logging | $100-$200 | Datadog/New Relic |
| CDN | $50-$200 | CloudFlare/CloudFront |
| Email/SMS | $50-$100 | Transactional messages |
| **Total Monthly** | **$1,250-$4,450** | |

### One-Time Costs

| Item | Cost (USD) |
|------|-----------|
| Browser Extension Development | $5,000-$15,000 |
| Mobile App Development | $15,000-$30,000 |
| Legal & Compliance Review | $3,000-$5,000 |
| Security Audit | $5,000-$10,000 |
| **Total** | **$28,000-$60,000** |

### Total Estimated Budget (9 months)

- **Development**: $72,000
- **Infrastructure**: $27,000 ($3,000 × 9 months avg)
- **One-time**: $45,000 (mid-range)
- **Contingency (20%)**: $28,800
- **Grand Total**: **~$172,800** (~₹1.45 Crore)

*Note: Costs can be reduced by 40-50% with offshore teams or smaller MVP scope.*

---

## Monetization Strategy

### 1. Affiliate Commissions (Primary)
- Amazon Associates: 1-10% depending on category
- Flipkart Affiliate: 1-15%
- Other platforms: 2-20%
- **Projected Revenue**: ₹5-50 per transaction

### 2. Sponsored Deals
- Featured product placements
- Promoted coupons
- Brand campaigns
- **Rate**: ₹50,000-5,00,000 per campaign

### 3. Premium Subscription (Future)
- **Price**: ₹99-299/month
- **Features**:
  - Unlimited alerts
  - Advanced price history (2+ years)
  - Family grocery tracking
  - Early sale access
  - Ad-free experience
  - AI insights

### 4. B2B Data Products (Future)
- Price intelligence APIs
- Competitor monitoring
- Market trend reports
- **Rate**: ₹50,000-5,00,000/month per enterprise client

### Revenue Projections (Year 1)

| Month | Active Users | Affiliate GMV | Revenue (INR) |
|-------|-------------|---------------|---------------|
| 1-3 | 1,000 | ₹10,00,000 | ₹50,000 |
| 4-6 | 10,000 | ₹50,00,000 | ₹2,50,000 |
| 7-9 | 50,000 | ₹2,00,00,000 | ₹10,00,000 |
| 10-12 | 1,00,000 | ₹5,00,00,000 | ₹25,00,000 |

*Assumptions: 2% conversion rate, 5% affiliate commission average*

---

## Success Metrics

### User Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention Rate (D7, D30)
- Session Duration
- Searches per Session
- Alert Creation Rate
- Extension Installs

### Business Metrics
- Affiliate GMV
- Conversion Rate (click to purchase)
- Revenue Per User (ARPU)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Premium Conversion Rate

### Technical Metrics
- API Response Time (<200ms p95)
- Page Load Time (<2s)
- Uptime (>99.5%)
- Data Freshness (% updated in last 24h)
- Scraper Success Rate (>90%)
- Product Match Accuracy (>85%)

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Retailers block scrapers | High | High | Diversify data sources, use APIs, build relationships |
| Low user adoption | Medium | High | Focus on SEO, content marketing, referral programs |
| High infrastructure costs | Medium | Medium | Optimize crawling, use caching, tiered updates |
| Legal challenges | Low | High | Compliance-first approach, legal review |
| Competition | High | Medium | Differentiate with AI, focus on quick commerce |
| Data inaccuracies | Medium | Medium | User feedback loops, manual verification |

---

## Next Steps (Week 1)

1. **Team Assembly**
   - Hire/assign 2 backend developers
   - Hire/assign 1 frontend developer
   - Identify tech lead

2. **Infrastructure Setup**
   - Set up Git repositories
   - Configure development environments
   - Set up staging servers

3. **Technical Spikes**
   - Test scraper viability on Amazon/Flipkart
   - Evaluate proxy providers
   - Prototype product matching algorithm

4. **Project Management**
   - Set up Jira/Linear for task tracking
   - Define sprint cycles (2 weeks)
   - Schedule daily standups

5. **Legal**
   - Consult lawyer on terms of service
   - Review affiliate program TOS
   - Draft privacy policy

---

## Appendix A: Sample Database Schema

See `docs/schemas/database_schema.sql` for complete schema.

## Appendix B: API Specification

See `docs/api/api_overview.md` for complete API documentation.

## Appendix C: Scraper Implementation Guide

See `backend/src/scrapers/README.md` for detailed scraper documentation.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Development
