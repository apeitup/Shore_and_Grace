#!/usr/bin/env bash

set -euo pipefail

readonly SERVER="troy@66.29.139.124"
readonly SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
readonly WEB_ROOT="/var/www/shoreandgrace.com"
readonly NGINX_CONFIG="deployment/nginx/shoreandgrace.com"
readonly SIGNUP_SOURCE="server/signup_service.py"
readonly SIGNUP_SERVICE="deployment/systemd/shoreandgrace-signup.service"
readonly RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
readonly LOCAL_ARCHIVE="$(mktemp "/tmp/shore-and-grace-${RELEASE_ID}.XXXXXX.tgz")"
readonly REMOTE_ARCHIVE="/tmp/shore-and-grace-${RELEASE_ID}.tgz"
readonly REMOTE_STAGE="/tmp/shore-and-grace-${RELEASE_ID}"
readonly REMOTE_NGINX_CONFIG="/tmp/shoreandgrace.com-${RELEASE_ID}.nginx"
readonly REMOTE_SIGNUP_SOURCE="/tmp/shoreandgrace-signup-${RELEASE_ID}.py"
readonly REMOTE_SIGNUP_SERVICE="/tmp/shoreandgrace-signup-${RELEASE_ID}.service"

cleanup() {
  rm -f "$LOCAL_ARCHIVE"
}
trap cleanup EXIT

echo "Building Shore & Grace…"
pnpm --dir apps/holding build

echo "Packaging production files…"
COPYFILE_DISABLE=1 tar --no-xattrs -C apps/holding/dist -czf "$LOCAL_ARCHIVE" .

echo "Uploading staged release…"
scp -i "$SSH_KEY" "$LOCAL_ARCHIVE" "$SERVER:$REMOTE_ARCHIVE"
scp -i "$SSH_KEY" "$NGINX_CONFIG" "$SERVER:$REMOTE_NGINX_CONFIG"
scp -i "$SSH_KEY" "$SIGNUP_SOURCE" "$SERVER:$REMOTE_SIGNUP_SOURCE"
scp -i "$SSH_KEY" "$SIGNUP_SERVICE" "$SERVER:$REMOTE_SIGNUP_SERVICE"

echo "Publishing to ${WEB_ROOT}…"
ssh -tt -i "$SSH_KEY" "$SERVER" "
  set -e
  rm -rf '$REMOTE_STAGE'
  mkdir -p '$REMOTE_STAGE'
  tar -xzf '$REMOTE_ARCHIVE' -C '$REMOTE_STAGE'
  sudo nginx -t
  sudo cp /etc/nginx/sites-available/shoreandgrace.com /etc/nginx/sites-available/shoreandgrace.com.previous
  sudo install -d -o root -g root -m 0755 /opt/shoreandgrace-signup
  sudo install -o root -g root -m 0644 '$REMOTE_SIGNUP_SOURCE' /opt/shoreandgrace-signup/signup_service.py
  sudo install -o root -g root -m 0644 '$REMOTE_SIGNUP_SERVICE' /etc/systemd/system/shoreandgrace-signup.service
  sudo systemctl daemon-reload
  sudo systemctl enable --now shoreandgrace-signup.service
  health_attempt=0
  until curl --fail --silent http://127.0.0.1:8017/health >/dev/null; do
    health_attempt=\$((health_attempt + 1))
    if [ \$health_attempt -ge 10 ]; then
      sudo systemctl --no-pager --full status shoreandgrace-signup.service
      exit 1
    fi
    sleep 1
  done
  sudo install -o root -g root -m 0644 '$REMOTE_NGINX_CONFIG' /etc/nginx/sites-available/shoreandgrace.com
  if ! sudo nginx -t; then
    sudo cp /etc/nginx/sites-available/shoreandgrace.com.previous /etc/nginx/sites-available/shoreandgrace.com
    sudo nginx -t
    exit 1
  fi
  sudo install -d -o root -g www-data -m 0755 '$WEB_ROOT'
  sudo rsync -a --delete --chown=root:www-data '$REMOTE_STAGE/' '$WEB_ROOT/'
  sudo find '$WEB_ROOT' -type d -exec chmod 0755 {} +
  sudo find '$WEB_ROOT' -type f -exec chmod 0644 {} +
  sudo nginx -t
  sudo systemctl reload nginx
  rm -rf '$REMOTE_STAGE' '$REMOTE_ARCHIVE' '$REMOTE_NGINX_CONFIG' '$REMOTE_SIGNUP_SOURCE' '$REMOTE_SIGNUP_SERVICE'
"

echo "Deployment complete. Verify https://shoreandgrace.com/"
