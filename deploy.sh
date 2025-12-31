#!/bin/bash

# deploy.sh - Deployment script for Cloudways/Production

echo "🚀 Starting Deployment..."

# 1. Pull latest changes (uncomment if running from git hook)
# git pull origin main

# 2. PHP/Laravel Dependencies
echo "📦 Installing Composer Dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader

# 3. Database Migrations
echo "🗄️  Running Migrations..."
php artisan migrate --force

# 4. Clear Caches
echo "🧹 Clearing Caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Frontend Dependencies & Build
echo "🎨 Installing NPM Dependencies & Building..."
npm install
npm run build

echo "✅ Build Complete!"

# 6. Restart Next.js Server
echo "🔄 Restarting PM2 Process..."
pm2 restart banconaut-v3 || npx pm2 restart banconaut-v3 || echo "⚠️  Could not restart PM2 automatically. Please run 'pm2 restart banconaut-v3' manually."

echo "
----------------------------------------------------------------------
🚀 Deployment Finished!
----------------------------------------------------------------------
"
