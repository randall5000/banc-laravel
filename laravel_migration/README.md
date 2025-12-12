# Laravel Migration Guide

This directory contains the essential files to migrate the "Banconaut" Next.js application to Laravel.

## Prerequisites

- PHP 8.2+
- Composer
- Node.js & NPM
- a MySQL Database

## Installation Steps

1.  **Create a new Laravel Project**
    ```bash
    composer create-project laravel/laravel banconaut-laravel
    cd banconaut-laravel
    ```

2.  **Install Livewire**
    ```bash
    composer require livewire/livewire
    ```

3.  **Copy Files**
    Copy the files from this `laravel_migration` directory into your new Laravel project, matching the folder structure.

    - `database/migrations/*` -> `database/migrations/`
    - `app/Models/*` -> `app/Models/`
    - `app/Http/Controllers/*` -> `app/Http/Controllers/`
    - `app/Livewire/*` -> `app/Livewire/`
    - `resources/views/*` -> `resources/views/`
    - `routes/*` -> `routes/`

4.  **Database Setup**
    - Configure your `.env` file with your database credentials.
    - Run migrations:
      ```bash
      php artisan migrate
      ```

5.  **Frontend Setup**
    The layout uses Tailwind CSS via CDN for immediate preview. for production, you should install Tailwind properly:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
    And convert the `<script src="cdn..."></script>` in `app.blade.php` to `@vite('resources/css/app.css')`.

6.  **Run the Server**
    ```bash
    php artisan serve
    ```

## Features Ported

-   **Database Schema**: `benches`, `photos`, `videos`, `comments` tables.
-   **Eloquent Models**: Relationships defined for all entities.
-   **Bench Grid**: Recreated using **Livewire** to handle:
    -   Search (Location, Country, Text)
    -   Filtering (Country)
    -   Sorting (Newest, Oldest, Likes, Nearest)
    -   Geolocation (Distance calculation) relative to user.
-   **Views**: Blade templates for the Home page and Hero section.

## Notes

-   **Distance Calculation**: The "Nearest" filter uses a Haversine formula directly in the SQL query (via `BenchGrid.php`). Ensure your database supports trigonometric functions (MySQL 5.7+ / 8.0+ supports them).
-   **File Storage**: The original app used URLs. If you implement file uploads, use Laravel's `Storage` facade.
