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
        // Pool of images to use for gallery (since we don't have new ones)
        // We will rotate these to simulate a gallery
        $seedImages = [
            '/images/seeds/tekapo.jpg',
            '/images/seeds/hyde.jpg',
            '/images/seeds/moraine.jpg',
            '/images/seeds/central.jpg',
            '/images/seeds/amalfi.jpg',
        ];

        $users = ['Alice', 'Bob', 'Charlie', 'Dana', 'Eve'];

        $benches = [
            [
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
            ],
            [
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
            ],
            [
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
            ],
            [
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
            ],
            [
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
            ]
        ];

        foreach ($benches as $data) {
            $bench = Bench::create($data);

            // 1. Add the main photo as the first gallery item
            $bench->photos()->create([
                'photo_url' => $bench->image_url,
                'user_name' => $users[array_rand($users)], // Random starter user
                'is_primary' => true,
                'display_order' => 0,
            ]);

            // 2. Add 2-3 random extra photos from our seed pool to simulate gallery
            // Pick random images that AREN'T the main one ideally, but duplicates are fine for dev
            $extraCount = rand(2, 3);
            for ($i = 1; $i <= $extraCount; $i++) {
                $randomImg = $seedImages[array_rand($seedImages)];
                $bench->photos()->create([
                    'photo_url' => $randomImg,
                    'user_name' => $users[array_rand($users)],
                    'is_primary' => false,
                    'display_order' => $i,
                ]);
            }

            // 3. Add some comments
            $bench->comments()->create([
                'user_name' => $users[array_rand($users)],
                'comment' => 'This is such a lovely spot! I wish I could visit every day.'
            ]);
            $bench->comments()->create([
                'user_name' => $users[array_rand($users)],
                'comment' => 'Great view, very peaceful.'
            ]);
        }
    }
}
