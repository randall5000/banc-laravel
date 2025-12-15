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
            'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Lake_Tekapo_Waitaki_Canterbury_New_Zealand.jpg', // Scenic view of Lake Tekapo
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
            'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Bench_and_Boathouse%2C_Hyde_Park_-_geograph.org.uk_-_1022576.jpg', // Hyde Park Bench
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
            'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Moraine_Lake_17092005.jpg', // Moraine Lake View
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
            'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Bench_in_Central_Park_%284%29.jpg', // Central Park Bench
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
            'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Atrani_-_The_Amalfi_Coast_-_Ravello_citta_della_musica_-_City_Sightseeing_Ravello_%287692815104%29.jpg', // Amalfi/Ravello Bench
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
