🚀 Social-Automation - AI-Powered Social Media Management Platform
Social Automation is a comprehensive social media automation platform that enables users to manage, schedule, and analyze content across multiple platforms (Facebook, Instagram, Twitter, Reddit, LinkedIn) from a single unified dashboard. Built with AI-powered content generation, automated scheduling, and real-time analytics.

Version Python React FastAPI

📋 Table of Contents
Problem Statement
Solution
Features
Tech Stack
Architecture
Setup & Installation
Environment Variables
API Documentation
Database Schema
Deployment
Project Structure
Known Limitations
What's Next
🎯 Problem Statement
Managing social media presence across multiple platforms is time-consuming and fragmented:

Multiple Dashboards: Each platform requires separate login and management interfaces
Manual Content Creation: Creating engaging captions and images for each post is repetitive
Scheduling Complexity: Coordinating posts across platforms with different optimal posting times
Analytics Fragmentation: No unified view of performance metrics across all platforms
Token Management: Managing OAuth tokens and API credentials manually is error-prone
💡 Solution
SocialAnywhere provides:

Unified Dashboard: Single interface for Facebook, Instagram, Twitter, Reddit, and LinkedIn
AI Content Generation: Automated caption and image generation using Groq, ChatGPT, Gemini, and Stability AI
Smart Scheduling: Automated post scheduling with timezone awareness
Real-time Analytics: Cross-platform analytics with follower counts, engagement rates, and best-performing posts
Secure Token Management: OAuth 2.0 integration with automatic token refresh and secure database storage
✨ Features
🔐 Authentication & Account Management
Google OAuth 2.0 authentication
Multi-platform account connection (Facebook, Instagram, Twitter, Reddit, LinkedIn)
Secure token storage in PostgreSQL database
Account disconnect functionality with proper cleanup
📝 Content Generation
AI Caption Generation: Choose from Groq, ChatGPT, or Gemini for caption generation
AI Image Generation: Stability AI integration for custom image creation
Batch Post Generation: Generate multiple posts for campaigns
Content Templates: Pre-built templates for different post types
📅 Scheduling & Publishing
Multi-platform Scheduling: Schedule posts across all connected platforms
Calendar View: Visual calendar interface for managing scheduled posts
Google Calendar Integration: Sync scheduled posts with Google Calendar
Automated Publishing: Background scheduler service publishes posts at scheduled times
📊 Analytics & Insights
Cross-platform Analytics: Unified dashboard showing metrics from all platforms
Follower Tracking: Real-time follower counts (requires proper API permissions)
Engagement Metrics: Track likes, comments, shares, and impressions
Best/Worst Posts: Identify top and bottom performing content
Demographics: Audience insights by country, age, and gender
💾 Data Management
Google Drive Integration: Export campaigns and images to Google Drive
Campaign Management: Organize posts into campaigns
Post History: Complete history of all posts with status tracking
🛠 Tech Stack
Frontend
React 19.1.1 - UI framework
Vite 5.4.11 - Build tool and dev server
Tailwind CSS 4.1.11 - Utility-first CSS framework
Zustand 5.0.7 - State management
React Router DOM 7.8.0 - Client-side routing
Lucide React - Icon library
Sonner - Toast notifications
Recharts 3.1.2 - Data visualization
Backend
Python 3.11 - Programming language
FastAPI 0.104.1 - Web framework
Uvicorn 0.24.0 - ASGI server
PostgreSQL - Database (via databases and asyncpg)
SQLAlchemy 1.4.53 - ORM
APScheduler 3.10.4 - Task scheduling
Pydantic 2.5.0 - Data validation
AI & APIs
Groq API - Fast LLM for caption generation
OpenAI (ChatGPT) - Alternative caption generation
Google Gemini - Alternative caption generation
Stability AI - Image generation
Meta Graph API v19.0 - Facebook & Instagram integration
Twitter API v2 - Twitter integration
Reddit API - Reddit integration
LinkedIn API - LinkedIn integration
DevOps
Docker - Containerization
Docker Compose - Multi-container orchestration
Azure Pipelines - CI/CD
Nginx - Reverse proxy (in production)
🏗 Architecture
┌─────────────────────────────────────────────────────────────┐
│                    React SPA (Vite)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Analytics│  │ Campaigns│  │ Settings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (/socialanywhere)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST API Endpoints                                  │  │
│  │  - /api/social-media/* (Account Management)         │  │
│  │  - /api/instagram/* (Instagram Analytics)           │  │
│  │  - /api/facebook/* (Facebook Analytics)             │  │
│  │  - /generate-post (AI Content Generation)           │  │
│  │  - /generate-batch (Batch Generation)                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OAuth Callbacks                                     │  │
│  │  - /social-media/{platform}/callback                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Background Services                                 │  │
│  │  - APScheduler (Post Publishing)                    │  │
│  │  - Token Refresh Workers                            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
                ▼                           ▼
    ┌──────────────────┐      ┌──────────────────────────┐
    │   PostgreSQL     │      │  External APIs           │
    │   Database        │      │  - Meta Graph API       │
    │  - users          │      │  - Twitter API           │
    │  - posts          │      │  - Reddit API            │
    │  - campaigns      │      │  - LinkedIn API          │
    │  - social_media_  │      │  - Google APIs           │
    │    accounts       │      │  - AI APIs (Groq, etc.)  │
    └──────────────────┘      └──────────────────────────┘
Data Flow
User Authentication: Google OAuth → JWT token → Stored in Zustand
Platform Connection: OAuth flow → Tokens stored in social_media_accounts table
Content Generation: User input → AI APIs → Caption + Image → Stored in posts table
Scheduling: Post created → Scheduled in posts table → APScheduler picks up → Published via platform APIs
Analytics: Platform APIs → Aggregated in backend → Displayed in React dashboard
🚀 Setup & Installation
Prerequisites
Node.js 20+ and npm
Python 3.11+ and pip
PostgreSQL 14+
Docker & Docker Compose (optional, for containerized deployment)
Local Development Setup
1. Clone the Repository
git clone https://github.com/SubhamThakur80661/social-automation.git
cd social-automation
2. Backend Setup
# Navigate to server directory
cd server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
3. Database Setup
# Create PostgreSQL database
createdb social_media_agent

# Run migrations
psql social_media_agent < ../init-db.sql
psql social_media_agent < migrate_social_media_accounts.sql
psql social_media_agent < migrate_instagram_accounts.sql
4. Frontend Setup
# From project root
npm install
5. Environment Configuration
Create .env file in the server/ directory (see Environment Variables section):

cp .env.example server/.env
# Edit server/.env with your credentials
6. Run the Application
Terminal 1 - Backend:

cd server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
Terminal 2 - Frontend:

npm run dev
The application will be available at:

Frontend: http://localhost:5173/socialanywhere
Backend API: http://localhost:8000/socialanywhere
Docker Setup
# Build and run with Docker Compose
docker-compose up --build

# Or build Docker image manually
docker build -t socialanywhere .
docker run -p 8000:8000 --env-file server/.env socialanywhere
🔐 Environment Variables
Create a .env file in the server/ directory with the following variables:

Database
DATABASE_URL=postgresql://user:password@localhost:5432/social_media_agent
Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
AI Services
GROQ_API_KEY=your-groq-api-key
STABILITY_API_KEY=your-stability-ai-api-key
GEMINI_API=your-gemini-api-key
CHATGPT_API=your-openai-api-key
NANO_BANANA_API_KEY=your-nano-banana-key
Social Media Platforms
Facebook/Instagram
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_PAGE_ID=your-page-id
FACEBOOK_ACCESS_TOKEN=your-access-token
INSTAGRAM_ACCOUNT_ID=your-instagram-account-id
Twitter
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_CONSUMER_KEY=your-consumer-key
TWITTER_CONSUMER_SECRET=your-consumer-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
TWITTER_BEARER_TOKEN=your-bearer-token
TWITTER_USERNAME=your-twitter-username
Reddit
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USERNAME=your-reddit-username
REDDIT_PASSWORD=your-reddit-password
REDDIT_USER_AGENT=your-user-agent-string
LinkedIn
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=https://yourdomain.com/socialanywhere/social-media/linkedin/callback
Application Settings
PUBLIC_DOMAIN=agentanywhere.ai
USE_HTTPS=true
CORS_ORIGINS=*
DEBUG=false
LOG_LEVEL=INFO
PORT=8000
HOST=0.0.0.0
Optional Services
CLOUDINARY_URL=your-cloudinary-url
CLOUDINARY_UPLOAD_PRESET=ml_default
GOOGLE_REDIRECT_URI=http://localhost:8000/callback
Note: For production, never commit .env files. Use environment variable management in your deployment platform.

📡 API Documentation
Authentication
All API endpoints (except OAuth callbacks) require JWT authentication via Bearer token:

Authorization: Bearer <your-jwt-token>
Social Media Account Management
Get All Accounts
GET /api/social-media/accounts?platform={platform}
Returns all connected social media accounts for the authenticated user.

Disconnect Account
DELETE /api/social-media/accounts/{account_id}
Deactivates a specific social media account.

Connect Platform (OAuth)
POST /social-media/{platform}/connect
Initiates OAuth flow for the specified platform. Returns auth_url for redirect.

Supported platforms: facebook, instagram, twitter, reddit, linkedin

Content Generation
Generate Single Post
POST /generate-post
Content-Type: application/json

{
  "description": "Post description",
  "caption_provider": "groq",
  "image_provider": "stability_ai",
  "platforms": ["instagram", "facebook"]
}
Generate Batch Posts
POST /generate-batch
Content-Type: application/json

{
  "description": "Campaign description",
  "num_posts": 10,
  "days_duration": 7,
  "caption_provider": "groq",
  "image_provider": "stability_ai",
  "platforms": ["instagram", "facebook", "twitter"]
}
Analytics
Instagram Account Info
GET /api/instagram/account/info?account_id={account_id}
Returns Instagram account information including follower count.

Instagram Analytics
GET /api/instagram/account/analytics?account_id={account_id}
Returns comprehensive Instagram analytics.

Facebook Analytics
GET /api/facebook/analytics?account_id={account_id}
Returns Facebook page analytics.

Post Management
Get All Posts
GET /api/posts?limit=50&status=scheduled
Schedule Post
POST /api/facebook/schedule
Content-Type: application/json

{
  "caption": "Post caption",
  "image_url": "https://...",
  "scheduled_at": "2024-01-01T10:00:00Z",
  "platforms": ["facebook", "instagram"]
}
Full API Documentation
For complete API documentation, visit:

Swagger UI: http://localhost:8000/socialanywhere/docs
ReDoc: http://localhost:8000/socialanywhere/redoc
🗄 Database Schema
Core Tables
users
Stores user authentication and profile information.

id (UUID, Primary Key)
google_id (VARCHAR, Unique)
email (VARCHAR, Unique)
name (VARCHAR)
picture_url (VARCHAR)
created_at, updated_at (TIMESTAMP)
is_active (BOOLEAN)
social_media_accounts
Stores connected social media platform accounts.

id (UUID, Primary Key)
user_id (UUID, Foreign Key → users)
platform (VARCHAR: facebook, instagram, twitter, reddit, linkedin)
account_id (VARCHAR, Platform-specific account ID)
username (VARCHAR)
display_name (VARCHAR)
access_token (TEXT, Encrypted)
refresh_token (TEXT, Optional)
expires_at (TIMESTAMP)
metadata (JSONB, Platform-specific data)
is_active (BOOLEAN)
is_primary (BOOLEAN)
created_at, updated_at (TIMESTAMP)
posts
Stores generated and scheduled posts.

id (UUID, Primary Key)
user_id (UUID, Foreign Key → users)
campaign_id (UUID, Foreign Key → campaigns)
original_description (TEXT)
caption (TEXT)
image_path (VARCHAR)
image_url (VARCHAR)
scheduled_at (TIMESTAMP)
posted_at (TIMESTAMP)
status (VARCHAR: draft, scheduled, posted, failed)
platforms (TEXT[], Array of platforms)
subreddit (VARCHAR, For Reddit posts)
engagement_metrics (JSONB)
campaigns
Groups related posts into campaigns.

id (UUID, Primary Key)
user_id (UUID, Foreign Key → users)
name (VARCHAR)
description (TEXT)
created_at, updated_at (TIMESTAMP)
is_active (BOOLEAN)
Migration Scripts
init-db.sql - Initial schema creation
migrate_social_media_accounts.sql - Social media accounts table
migrate_instagram_accounts.sql - Instagram-specific migrations
🚢 Deployment
Production Deployment
# Build Docker image
docker build -t socialanywhere .

# Tag and push to registry
docker tag socialanywhere your-registry/socialanywhere:latest
docker push your-registry/socialanywhere:latest

# Deploy with Docker Compose
docker-compose up -d
Environment Setup on Server
Set environment variables on the server
Ensure PostgreSQL is running and accessible
Run database migrations
Configure Nginx reverse proxy (if needed)
Set up SSL certificates for HTTPS
Health Checks
The application includes health check endpoint:

GET /health
📁 Project Structure
social-automation/
├── server/                 # Backend Python code
│   ├── main.py            # FastAPI application entry point
│   ├── database.py        # Database connection management
│   ├── database_service.py # Database service layer
│   ├── social_media_routes.py # Social media OAuth routes
│   ├── auth_routes.py     # Authentication routes
│   ├── dashboard_routes.py # Dashboard API routes
│   ├── scheduler_service.py # Background job scheduler
│   ├── instagram_analytics_service.py # Instagram API service
│   ├── facebook_analytics_service.py # Facebook API service
│   ├── requirements.txt   # Python dependencies
│   └── ...
├── src/                   # Frontend React code
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Analytics.jsx
│   │   ├── Settings.jsx
│   │   ├── CreateCampaign.jsx
│   │   └── ...
│   ├── components/       # Reusable components
│   ├── store/           # Zustand state management
│   ├── lib/             # Utility functions
│   └── ...
├── public/              # Static assets
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile          # Multi-stage Docker build
├── package.json        # Node.js dependencies
├── vite.config.js      # Vite configuration
└── README.md          # This file
⚠️ Known Limitations
Instagram Follower Count: Requires instagram_basic and instagram_manage_insights permissions. If not granted, follower count will show as 0.

Twitter API Limitations: Free tier has limited analytics access. Some metrics may not be available.

Token Refresh: Some platforms (like LinkedIn) require manual token refresh in certain scenarios.

Rate Limits: AI API services (Groq, Stability AI) have rate limits that may affect batch generation.

Image Storage: Images are stored locally by default. For production, configure Cloudinary or similar service.

🔮 What's Next
Planned Features
 Automatic Token Refresh: Background workers for all platforms
 Multi-tenant Support: Organization/team management
 Advanced Analytics: Predictive analytics and trend analysis
 Content Library: Reusable content templates and media library
 A/B Testing: Test different post variations
 Social Listening: Monitor mentions and comments
 Mobile App: React Native mobile application
 Webhooks: Real-time notifications for post status changes
Technical Improvements
 Caching Layer: Redis for API response caching
 Message Queue: RabbitMQ/Kafka for async job processing
 Monitoring: Prometheus + Grafana for metrics
 Error Tracking: Sentry integration
 Load Testing: Performance optimization
📄 License
This project is proprietary software. All rights reserved.

👥 Contributing
This is a private project. For contributions or questions, please contact the repository maintainers.

📞 Support
For setup assistance or issues:

Check the documentation in /docs folder
Review platform-specific setup guides:
FACEBOOK_APP_SETUP.md
TWITTER_SETUP_INSTRUCTIONS.md
REDDIT_SETUP_INSTRUCTIONS.md
LINKEDIN_SETUP_INSTRUCTIONS.md
Built with ❤️ using React, FastAPI, and AI
