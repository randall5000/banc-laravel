#!/bin/bash

# migrate.sh - Automated setup script for Banconaut Laravel Migration

echo "🚀 Starting Banconaut Migration Setup..."
echo "ℹ️  Run this script ON YOUR SERVER where you want to install the Laravel app."

# Check for Composer
COMPOSER_BIN="composer"
if ! command -v composer &> /dev/null; then
    if [ -f "/usr/local/bin/composer" ]; then
        echo "⚠️  'composer' not in PATH, but found at /usr/local/bin/composer. Using that."
        COMPOSER_BIN="/usr/local/bin/composer"
    else
        echo "❌ Error: 'composer' could not be found automatically."
        echo "Please enter the full path to your composer executable (e.g. /usr/bin/composer):"
        read -r USER_COMPOSER_PATH
        
        if [ -n "$USER_COMPOSER_PATH" ] && [ -f "$USER_COMPOSER_PATH" ]; then
             echo "✅ Using provided composer path: $USER_COMPOSER_PATH"
             COMPOSER_BIN="$USER_COMPOSER_PATH"
        else
            echo "❌ Invalid path provided or file does not exist."
            echo "Please install Composer first: https://getcomposer.org/"
            exit 1
        fi
    fi
fi

# Check for PHP
PHP_BIN="php"
if ! command -v php &> /dev/null; then
    if [ -f "/usr/bin/php" ]; then
        echo "⚠️  'php' not in PATH, but found at /usr/bin/php. Using that."
        PHP_BIN="/usr/bin/php"
    elif [ -f "/usr/local/bin/php" ]; then
        echo "⚠️  'php' not in PATH, but found at /usr/local/bin/php. Using that."
        PHP_BIN="/usr/local/bin/php"
    else
        echo "❌ Error: 'php' could not be found automatically."
        echo "Please enter the full path to your php executable (e.g. /usr/bin/php):"
        read -r USER_PHP_PATH
        
        if [ -n "$USER_PHP_PATH" ] && [ -f "$USER_PHP_PATH" ]; then
             echo "✅ Using provided php path: $USER_PHP_PATH"
             PHP_BIN="$USER_PHP_PATH"
        else
            echo "❌ Invalid path provided or file does not exist."
            echo "Please install PHP first."
            exit 1
        fi
    fi
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
$PHP_BIN $COMPOSER_BIN create-project laravel/laravel "$PROJECT_NAME"

cd "$PROJECT_NAME" || exit

echo "🔌 Installing Livewire..."
$PHP_BIN $COMPOSER_BIN require livewire/livewire

echo "📂 Copying migration files..."
# Copy directories from source to new project (force overwrite)
cp -Rf ../"$SOURCE_DIR"/database/migrations/* database/migrations/
cp -Rf ../"$SOURCE_DIR"/app/Models/* app/Models/
cp -Rf ../"$SOURCE_DIR"/app/Http/Controllers/* app/Http/Controllers/
cp -Rf ../"$SOURCE_DIR"/resources/views/* resources/views/
cp -Rf ../"$SOURCE_DIR"/routes/* routes/

# Create missing directories if they don't exist
mkdir -p app/Livewire
cp -Rf ../"$SOURCE_DIR"/app/Livewire/* app/Livewire/

echo "✅ Files copied successfully."

echo "
🎉 Setup Complete!

To finish the installation:
1. cd $PROJECT_NAME
2. cp .env.example .env
3. Edit .env with your database credentials
4. php artisan migrate
"
