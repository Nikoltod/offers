#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="${APP_DIR:-$PWD}"

cd "$APP_DIR"

echo "[deploy] Fetching latest code for branch: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[deploy] Installing dependencies"
npm ci

echo "[deploy] Preparing Prisma client and database"
npm run prisma:generate
npm run prisma:migrate:deploy

echo "[deploy] Building Next.js app"
npm run build

if command -v pm2 >/dev/null 2>&1; then
  echo "[deploy] Restarting app via pm2"
  pm2 restart offers || pm2 start npm --name offers -- start
elif command -v systemctl >/dev/null 2>&1; then
  echo "[deploy] Restarting app via systemd service: offers"
  sudo systemctl restart offers
else
  echo "[deploy] No process manager detected. Start app manually with: npm run start"
fi

echo "[deploy] Completed successfully"
