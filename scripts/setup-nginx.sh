set -euo pipefail

echo "🚀 Starting NGINX + HTTPS deployment..."

# === Step 1: Load .env with fallback ===
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️ .env file not found, using default values."
fi

# Fallbacks
BASE_URL="${BASE_URL:-example.com}"
EMAIL="${EMAIL:-admin@example.com}"
PACKAGE_NAME="${PACKAGE_NAME:-myapp}"
PORT="${PORT:-5056}"

echo "🌐 BASE_URL: $BASE_URL"
echo "📧 EMAIL: $EMAIL"
echo "📦 PACKAGE_NAME: $PACKAGE_NAME"
echo "📍 PORT: $PORT"

# === Step 2: Prepare folders ===
mkdir -p nginx/conf.d nginx/certbot/www nginx/certbot/conf

# === Step 3: Generate NGINX config ===
cat > nginx/conf.d/default.conf <<EOF
server {
    listen 80;
    server_name $BASE_URL;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $BASE_URL;

    ssl_certificate /etc/letsencrypt/live/$BASE_URL/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$BASE_URL/privkey.pem;

    location / {
        proxy_pass http://app:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

echo "📝 NGINX config updated."

# === Step 4: Stop conflicting containers (safe cleanup) ===
docker rm -f "${PACKAGE_NAME}_nginx" "${PACKAGE_NAME}_certbot" "${PACKAGE_NAME}_certbot_renew" 2>/dev/null || true

# === Step 5: Start base services ===
docker-compose up -d app nginx

# === Step 6: First-time cert issue if needed ===
CERT_PATH="nginx/certbot/conf/live/$BASE_URL/fullchain.pem"
if [[ ! -f "$CERT_PATH" ]]; then
  echo "🔐 First-time certbot run..."
  docker-compose run --rm certbot
else
  echo "✅ SSL already exists — skipping certbot issue."
fi

# === Step 7: Restart nginx to apply new cert ===
docker-compose restart nginx

# === Step 8: Start certbot-renew service (background) ===
docker-compose up -d certbot-renew

echo "✅ Setup complete: https://$BASE_URL"
