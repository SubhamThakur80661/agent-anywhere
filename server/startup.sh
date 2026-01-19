#!/bin/bash
# Simple Docker Startup Script with Reddit Access Token Automation

echo "🚀 Starting Social Media Agent"
echo "====================================================="

# Test Reddit connection and refresh token if needed (optional)
if [ -n "$REDDIT_CLIENT_ID" ] && [ -n "$REDDIT_CLIENT_SECRET" ] && [ -n "$REDDIT_REFRESH_TOKEN" ]; then
    echo "🔧 Testing Reddit connection..."
    python3 -c "
from reddit_token_refresh import RedditTokenRefresh
import os

service = RedditTokenRefresh()
if service.test_connection():
    print('✅ Reddit integration ready!')
else:
    print('⚠️ Reddit integration failed, continuing without it')
" || echo "⚠️ Reddit integration check failed, continuing without it"
else
    echo "ℹ️ Reddit credentials not provided, skipping Reddit integration"
fi

echo "🚀 Starting main application..."
python3 main.py