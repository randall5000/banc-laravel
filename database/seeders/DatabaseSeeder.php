<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bench;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. A scenic bench in New Zealand
        Bench::create([
            'image_url' => '/images/seeds/tekapo.jpg', 
            'location' => 'Lake Tekapo',
            'town' => 'Tekapo',
            'province' => 'Canterbury',
            'country' => 'New Zealand',
            'latitude' => -44.004674,
            'longitude' => 170.477121,
            'description' => 'A beautiful bench overlooking the turquoise waters of Lake Tekapo, perfect for stargazing.',
            'is_tribute' => false,
            'likes' => 120,
        ]);

        // 2. A tribute bench in London
        Bench::create([
            'image_url' => '/images/seeds/hyde.jpg', 
            'location' => 'Hyde Park',
            'town' => 'London',
            'province' => 'England',
            'country' => 'United Kingdom',
            'latitude' => 51.507268,
            'longitude' => -0.165730,
            'description' => 'Dedicated to John, who loved feeding the ducks here.',
            'is_tribute' => true,
            'tribute_name' => 'John Smith',
            'tribute_date' => '2023-05-15',
            'likes' => 45,
        ]);

        // 3. A rustic bench in Canada (Banff)
        Bench::create([
            'image_url' => '/images/seeds/moraine.jpg', 
            'location' => 'Moraine Lake',
            'town' => 'Banff',
            'province' => 'Alberta',
            'country' => 'Canada',
            'latitude' => 51.321742,
            'longitude' => -116.186005,
            'description' => 'Rest your legs after the hike and enjoy the view of the Valley of the Ten Peaks.',
            'is_tribute' => false,
            'likes' => 210,
        ]);

        // 4. A city bench in New York
        Bench::create([
            'image_url' => '/images/seeds/central.jpg', 
            'location' => 'Central Park',
            'town' => 'New York',
            'province' => 'New York',
            'country' => 'United States',
            'latitude' => 40.7812,
            'longitude' => -73.9665,
            'description' => 'A quiet spot amidst the bustling city.',
            'is_tribute' => true,
            'tribute_name' => 'The dreamers',
            'likes' => 89,
        ]);
        
         // 5. A coastal bench in Italy
        Bench::create([
            'image_url' => '/images/seeds/amalfi.jpg', 
            'location' => 'Amalfi Coast',
            'town' => 'Positano',
            'province' => 'Salerno',
            'country' => 'Italy',
            'latitude' => 40.6281,
            'longitude' => 14.4850,
            'description' => 'Sit and watch the sunset over the Mediterranean.',
            'is_tribute' => false,
            'likes' => 340,
        ]);
    }
}
