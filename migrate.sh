#!/bin/bash

# migrate.sh - Automated setup script for Banconaut Laravel Migration

echo "🚀 Starting Banconaut Migration Setup..."
echo "ℹ️  Run this script ON YOUR SERVER where you want to install the Laravel app."

# Check for Composer
if ! command -v composer &> /dev/null; then
    echo "❌ Error: 'composer' is not installed or not in your PATH."
    echo "Please install Composer first: https://getcomposer.org/"
    exit 1
fi

# Check for PHP
if ! command -v php &> /dev/null; then
    echo "❌ Error: 'php' is not installed."
    exit 1
fi

PROJECT_NAME="banconaut-laravel"
SOURCE_DIR="./laravel_migration"

# Ensure we are in the directory containing laravel_migration
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Could not find directory '$SOURCE_DIR'."
    echo "Make sure you run this script from the root of the 'banconaut' repository."
    exit 1
fi

if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  Directory '$PROJECT_NAME' already exists."
    read -p "Do you want to overwrite it? (y/N) " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        echo "Aborting."
        exit 0
    fi
    rm -rf "$PROJECT_NAME"
fi

echo "📦 Creating new Laravel project..."
# Using --quiet to reduce noise, remove it if you want to see standard output
composer create-project laravel/laravel "$PROJECT_NAME"

cd "$PROJECT_NAME" || exit

echo "🔌 Installing Livewire..."
composer require livewire/livewire

echo "📂 Copying migration files..."
# Copy directories from source to new project
cp -R ../"$SOURCE_DIR"/database/migrations/* database/migrations/
cp -R ../"$SOURCE_DIR"/app/Models/* app/Models/
cp -R ../"$SOURCE_DIR"/app/Http/Controllers/* app/Http/Controllers/
cp -R ../"$SOURCE_DIR"/resources/views/* resources/views/
cp -R ../"$SOURCE_DIR"/routes/* routes/

# Create missing directories if they don't exist
mkdir -p app/Livewire
cp -R ../"$SOURCE_DIR"/app/Livewire/* app/Livewire/

echo "✅ Files copied successfully."

echo "
🎉 Setup Complete!

To finish the installation:
1. cd $PROJECT_NAME
2. cp .env.example .env
3. Edit .env with your database credentials
4. php artisan migrate
"
