#!/bin/bash
# ============================================================
#   SD Academy — Auto Keep-Alive & Health Check Script
#   Ensures the Node.js Express server is always running 24/7
# ============================================================

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=3001
HEALTH_URL="http://127.0.0.1:$PORT/api/health"

# Check if Node.js server is responding to health check
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" --max-time 5)

if [ "$HTTP_STATUS" = "200" ]; then
    # Server is healthy and running fine
    exit 0
fi

# If server is not responding, restart it
echo "[$(date '+%Y-%m-%d %H:%M:%S')] SD Academy server down (status: $HTTP_STATUS). Restarting..."

cd "$APP_DIR" || exit 1

# Method A: Try PM2 if available
if command -v npx &> /dev/null; then
    npx pm2 resurrect 2>/dev/null || npx pm2 restart ecosystem.config.cjs 2>/dev/null || npx pm2 start ecosystem.config.cjs 2>/dev/null
fi

# Method B: Fallback to direct Node.js background process if PM2 is not active
if ! pgrep -f "app.js" > /dev/null; then
    nohup node app.js >> "$APP_DIR/server.log" 2>&1 &
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Started node app.js in background with PID $!"
fi
