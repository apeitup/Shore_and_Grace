#!/usr/bin/env bash

set -euo pipefail

readonly SERVER="troy@66.29.139.124"
readonly SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
readonly BOOTSTRAP_CONFIG="deployment/nginx/shoreandgrace.co.uk.bootstrap"
readonly FINAL_CONFIG="deployment/nginx/shoreandgrace.co.uk"
readonly REMOTE_BOOTSTRAP="/tmp/shoreandgrace.co.uk.bootstrap"
readonly REMOTE_FINAL="/tmp/shoreandgrace.co.uk.nginx"

scp -i "$SSH_KEY" "$BOOTSTRAP_CONFIG" "$SERVER:$REMOTE_BOOTSTRAP"
scp -i "$SSH_KEY" "$FINAL_CONFIG" "$SERVER:$REMOTE_FINAL"

ssh -tt -i "$SSH_KEY" "$SERVER" "
  set -e
  sudo install -o root -g root -m 0644 '$REMOTE_BOOTSTRAP' /etc/nginx/sites-available/shoreandgrace.co.uk
  sudo ln -sfn /etc/nginx/sites-available/shoreandgrace.co.uk /etc/nginx/sites-enabled/shoreandgrace.co.uk
  sudo nginx -t
  sudo systemctl reload nginx
  sudo certbot certonly --webroot \
    --webroot-path /var/www/shoreandgrace.com \
    --domain shoreandgrace.co.uk \
    --domain www.shoreandgrace.co.uk \
    --email info@shoreandgrace.com \
    --agree-tos \
    --non-interactive
  sudo install -o root -g root -m 0644 '$REMOTE_FINAL' /etc/nginx/sites-available/shoreandgrace.co.uk
  if ! sudo nginx -t; then
    sudo install -o root -g root -m 0644 '$REMOTE_BOOTSTRAP' /etc/nginx/sites-available/shoreandgrace.co.uk
    sudo nginx -t
    exit 1
  fi
  sudo systemctl reload nginx
  rm -f '$REMOTE_BOOTSTRAP' '$REMOTE_FINAL'
"

echo "The .co.uk HTTPS redirect is enabled."
