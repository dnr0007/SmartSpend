# SmartSpend AI - System Architecture

## Overview

This document describes the system architecture for SmartSpend AI, an AI-powered shopping and grocery savings assistant for Indian users.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ Mobile App  │  │  Web App    │  │   Browser   │  │ Admin      │ │
│  │(React Native)│  │  (Next.js)  │  │  Extension  │  │ Dashboard  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         API Gateway                                  │
│              (Authentication, Rate Limiting, Routing)                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Layer                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Comparison Orchestrator                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ Quick        │ │ E-commerce   │ │   Coupon     │ │    AI      │ │
│  │ Commerce     │ │ Price        │ │   Engine     │ │Recommendation│ │
│  │ Cart Engine  │ │ Engine       │ │              │ │   Engine   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │    Alert     │ │  Affiliate/  │ │ Notification │                 │
│  │    Engine    │ │ Deep Link    │ │   Service    │                 │
│  │              │ │   Engine     │ │              │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Message Queue / Scheduler                       │
│            (Kafka / RabbitMQ / BullMQ for async processing)          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Ingestion Layer                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │   Official   │ │  Affiliate   │ │    ONDC      │ │  Partner   │ │
│  │     APIs     │ │     APIs     │ │  Integration │ │Integration │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │  Extension   │ │  Compliant   │ │    Manual    │                 │
│  │   Signals    │ │   Crawling   │ │   Curation   │                 │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Storage Layer                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │  PostgreSQL  │ │    Redis     │ │Elasticsearch │ │     S3     │ │
│  │ (Primary DB) │ │   (Cache)    │ │  (Search)    │ │  (Storage) │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          Data Warehouse (BigQuery/Redshift/Snowflake)         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Quick Commerce Cart Engine

**Responsibilities:**
- Cart creation and management
- Item matching across quick commerce platforms
- Real-time price comparison including all fees
- ETA comparison
- Availability checking
- Substitute recommendations
- Split-cart optimization

**Key Components:**
- `CartService` - Manages cart CRUD operations
- `ItemMatchingService` - Maps items across platforms using fuzzy matching
- `PriceCalculationService` - Calculates final price with all fees
- `AvailabilityService` - Checks item availability per platform
- `SubstituteRecommendationService` - Suggests alternatives for unavailable items

### 2. E-commerce Price Engine

**Responsibilities:**
- Product search and discovery
- Price tracking across platforms
- Historical price storage
- Price trend analysis
- Fake discount detection
- Deal scoring

**Key Components:**
- `ProductService` - Product catalog management
- `PriceTrackingService` - Monitors and stores price changes
- `PriceHistoryService` - Manages historical price data
- `DealScoringService` - Calculates deal quality scores
- `FakeDiscountDetectionService` - Identifies inflated discounts

### 3. Coupon Engine

**Responsibilities:**
- Coupon discovery and aggregation
- Coupon validation
- Bank offer detection
- Platform-specific offer logic
- Expiration management

**Key Components:**
- `CouponDiscoveryService` - Aggregates coupons from multiple sources
- `CouponValidationService` - Validates coupon applicability
- `BankOfferService` - Manages bank-specific offers
- `OfferApplicationService` - Calculates final price with offers

### 4. AI Recommendation Engine

**Responsibilities:**
- Buy/wait recommendations
- Platform recommendations
- Fake discount explanations
- Substitute recommendations
- Natural language query processing
- Savings analysis

**Key Components:**
- `BuyWaitRecommendationService` - Generates purchase timing advice
- `PlatformRecommendationService` - Recommends best platform
- `ExplanationGenerator` - Creates human-readable explanations
- `NaturalLanguageProcessor` - Handles NL queries
- `SavingsAnalyzer` - Calculates and reports savings

### 5. Alert Engine

**Responsibilities:**
- Price drop alerts
- Cart price alerts
- Back-in-stock alerts
- Coupon alerts
- Notification delivery
- Alert deduplication

**Key Components:**
- `AlertCreationService` - Manages alert setup
- `AlertMonitoringService` - Monitors alert conditions
- `NotificationService` - Delivers notifications via multiple channels
- `AlertDeduplicationService` - Prevents alert spam

### 6. Affiliate/Deep Link Engine

**Responsibilities:**
- Affiliate link generation
- Click tracking
- Conversion attribution
- Deep link creation
- Revenue reporting

**Key Components:**
- `AffiliateLinkService` - Generates tracked affiliate links
- `ClickTrackingService` - Tracks user clicks
- `ConversionService` - Attributes conversions
- `DeepLinkService` - Creates platform-specific deep links

## Data Flow

### Quick Commerce Cart Comparison Flow

```
User creates cart → Add items → Confirm location
    ↓
Comparison Orchestrator receives request
    ↓
Parallel requests to all quick commerce platforms
    ↓
Collect: prices, fees, availability, ETA
    ↓
Apply coupon calculations
    ↓
AI engine generates recommendation
    ↓
Return comparison results to user
    ↓
User selects platform → Deep link opens
```

### E-commerce Price Tracking Flow

```
User searches/pastes URL → Extract product details
    ↓
Find matching products across platforms
    ↓
Fetch current prices
    ↓
Retrieve historical prices
    ↓
Calculate deal score
    ↓
AI generates buy/wait recommendation
    ↓
Display price history graph and comparison
    ↓
User can set alert or click affiliate link
```

### Price Alert Flow

```
User creates alert → Store in database
    ↓
Scheduler triggers price check (periodic)
    ↓
Fetch current price from platform
    ↓
Compare with target price
    ↓
If condition met → Create alert event
    ↓
Check deduplication rules
    ↓
Send notification via preferred channel
    ↓
Log alert in history
```

## Technology Decisions

### Backend Framework Options

**Option A: Node.js with NestJS**
- Pros: TypeScript support, modular architecture, large ecosystem
- Cons: Less mature for ML/AI workloads

**Option B: Python with FastAPI**
- Pros: Excellent for AI/ML, async support, clean API design
- Cons: Smaller ecosystem for some web features

**Recommendation:** Hybrid approach - FastAPI for core services and AI, Node.js for real-time features

### Database Strategy

**PostgreSQL:**
- Primary relational database
- ACID compliance for transactions
- JSONB support for flexible metadata
- Full-text search capabilities

**Redis:**
- Caching layer for frequently accessed data
- Session management
- Rate limiting
- Real-time leaderboards

**Elasticsearch/OpenSearch:**
- Product search
- Faceted search
- Autocomplete
- Analytics queries

### AI/ML Stack

**Product Matching:**
- Embedding models (sentence-transformers)
- Fuzzy string matching (Levenshtein, Jaro-Winkler)
- Image similarity (CLIP, ResNet)

**Recommendations:**
- LLM for explanation generation (Llama, Mistral, or cloud APIs)
- Rule-based systems for deal scoring
- Anomaly detection for fake discounts

**OCR:**
- Tesseract or cloud OCR for receipt scanning
- Layout analysis for grocery lists

### Infrastructure

**Container Orchestration:**
- Docker for containerization
- Kubernetes for orchestration at scale
- Helm charts for deployment

**Monitoring:**
- Prometheus for metrics collection
- Grafana for visualization
- Sentry for error tracking
- ELK stack for logs

**Cloud Providers:**
- AWS: Comprehensive services, mature ecosystem
- GCP: Strong AI/ML tools, BigQuery integration
- Azure: Enterprise features, good hybrid options

## Scalability Considerations

### Horizontal Scaling

- Stateless application servers behind load balancer
- Database read replicas for read-heavy workloads
- Sharding strategy for time-series price data
- CDN for static assets

### Caching Strategy

**Multi-level caching:**
1. Browser/Extension cache (static assets)
2. CDN cache (images, static content)
3. Redis cache (API responses, session data)
4. Database query cache

**Cache invalidation:**
- Time-based expiration for price data
- Event-based invalidation for updates
- Write-through cache for critical data

### Async Processing

**Use message queues for:**
- Price data ingestion
- Alert monitoring
- Notification delivery
- Report generation
- Data synchronization

## Security Architecture

### Authentication & Authorization

- Phone OTP verification
- OAuth 2.0 for Google/Apple login
- JWT tokens for API authentication
- Role-based access control (RBAC) for admin

### Data Protection

- TLS 1.3 for data in transit
- AES-256 encryption for sensitive data at rest
- PII encryption (phone, email, address)
- No storage of third-party credentials

### API Security

- Rate limiting per user/IP
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens for web

## Compliance & Legal

### Data Privacy

- User consent for location data
- User consent for notifications
- Right to data export
- Right to account deletion
- GDPR/DPDP compliance

### Platform Compliance

- Use official APIs where available
- Follow affiliate program terms
- Respect robots.txt for crawling
- Show price timestamps
- Clear disclaimers about price changes

## Disaster Recovery

### Backup Strategy

- Daily automated database backups
- Point-in-time recovery capability
- Multi-region backup storage
- Regular backup restoration tests

### High Availability

- Multi-AZ deployment
- Database replication
- Load balancer health checks
- Automatic failover

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cached API response | < 1.5s | P95 latency |
| Product detail page | < 2s | Page load time |
| Price history graph | < 1s | Render time |
| Cart comparison (cached) | < 5s | End-to-end |
| Alert delivery | < 1min | From trigger to notification |
| System uptime | 99.5% (initial), 99.9% (mature) | Monthly |

## Monitoring & Observability

### Key Metrics to Track

**Business Metrics:**
- Active users (DAU/MAU)
- Cart comparisons completed
- Alerts created
- Affiliate clicks and conversions
- User savings reported

**Technical Metrics:**
- API response times
- Error rates
- Database query performance
- Cache hit rates
- Queue depths
- Data freshness

### Alerting

- Critical: System down, data loss, security incidents
- Warning: High error rates, slow responses, stale data
- Info: Unusual traffic patterns, capacity thresholds

## Future Considerations

### Planned Enhancements

1. **ONDC Integration** - Expand quick commerce coverage
2. **Voice Interface** - Natural language cart building
3. **Family Accounts** - Shared carts and savings tracking
4. **Offline Mode** - Cached data for limited connectivity
5. **Regional Languages** - Hindi, Tamil, Telugu support

### Technical Debt Management

- Regular code reviews
- Automated testing coverage > 80%
- Documentation updates
- Dependency updates
- Performance profiling

---

*Last Updated: Based on PRD v1.0*
*Document Owner: Engineering Team*
