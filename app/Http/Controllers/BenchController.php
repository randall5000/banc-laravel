<?php

namespace App\Http\Controllers;

use App\Models\Bench;
use Illuminate\Http\Request;

class BenchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get the most liked bench for the Hero section
        $heroBench = Bench::orderBy('likes', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();

        return view('benches.index', compact('heroBench'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Bench $bench)
    {
        $bench->load(['photos', 'videos', 'comments']);
        return view('benches.show', compact('bench'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Structured Data: Country => [List of Regions]
        $locationData = [
            'United States' => [
                'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 
                'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 
                'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 
                'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 
                'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
            ],
            'Canada' => [
                'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 
                'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
            ],
            'United Kingdom' => ['England', 'Scotland', 'Wales', 'Northern Ireland'],
            'Ireland' => ['Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'],
            'France' => ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'],
            'Germany' => ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
            'Italy' => ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont', 'Apulia', 'Sardinia', 'Sicily', 'Tuscany', 'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'],
            'Spain' => ['Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country', 'Canary Islands', 'Cantabria', 'Castile and León', 'Castile-La Mancha', 'Catalonia', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Murcia', 'Navarre', 'Valencia'],
            'Netherlands' => ['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland'],
            'Belgium' => ['Antwerp', 'East Flanders', 'Flemish Brabant', 'Hainaut', 'Liège', 'Limburg', 'Luxembourg', 'Namur', 'Walloon Brabant', 'West Flanders'],
            'Switzerland' => ['Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft', 'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura', 'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz', 'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zurich'],
            'Austria' => ['Burgenland', 'Carinthia', 'Lower Austria', 'Salzburg', 'Styria', 'Tyrol', 'Upper Austria', 'Vienna', 'Vorarlberg'],
            'Portugal' => ['Alentejo', 'Algarve', 'Azores', 'Centro', 'Lisbon', 'Madeira', 'Norte'],
            'Sweden' => ['Blekinge', 'Dalarna', 'Gävleborg', 'Gotland', 'Halland', 'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland', 'Skåne', 'Södermanland', 'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland', 'Västra Götaland'],
            'Norway' => ['Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark', 'Vestland', 'Viken'],
            'Denmark' => ['Capital Region', 'Central Denmark', 'North Denmark', 'Zealand', 'Southern Denmark'],
            'Finland' => ['Uusimaa', 'Pirkanmaa', 'Varsinais-Suomi', 'North Ostrobothnia', 'Central Finland', 'North Savo', 'Satakunta', 'Central Ostrobothnia', 'South Ostrobothnia', 'Ostrobothnia', 'South Savo', 'Päijät-Häme', 'Kanta-Häme', 'Kymenlaakso', 'South Karelia', 'North Karelia', 'Kainuu', 'Lapland', 'Åland'],
            'Greece' => ['Attica', 'Central Greece', 'Central Macedonia', 'Crete', 'Eastern Macedonia and Thrace', 'Epirus', 'Ionian Islands', 'North Aegean', 'Peloponnese', 'South Aegean', 'Thessaly', 'Western Greece', 'Western Macedonia'],
            // Add other major European/Global options as simple string keys if needed, or expand logic
            'Other' => []
        ];

        // Sort countries alphabetically
        ksort($locationData);

        return view('benches.create', compact('locationData'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'town' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'description' => 'required|string',
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240', // Max 10MB per file
            'user_name' => 'nullable|string|max:255', // Allow attribution
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $mainImageUrl = null;
        
        // Create the bench first (we'll update image_url after processing first photo)
        $bench = Bench::create([
            'location' => $validated['location'],
            'country' => $validated['country'],
            'town' => $validated['town'],
            'province' => $validated['province'],
            'description' => $validated['description'],
            'image_url' => '', // Placeholder
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'likes' => 0,
            'is_tribute' => false,
        ]);

        $uploadUser = $validated['user_name'] ?? 'Anonymous';

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('benches', 'public');
                $fullUrl = '/storage/' . $path;

                // First photo becomes the main cover image
                if ($index === 0) {
                    $bench->update(['image_url' => $fullUrl]);
                }

                $bench->photos()->create([
                    'photo_url' => $fullUrl,
                    'user_name' => $uploadUser, // Attribute the upload
                    'is_primary' => $index === 0,
                    'display_order' => $index,
                ]);
            }
        }

        return redirect()->route('benches.show', $bench);
    }
}
