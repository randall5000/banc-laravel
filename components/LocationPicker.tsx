'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with Next.js/Webpack
const icon = L.icon({
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
// Note: We'll need to ensure these images exist or use a CDN fallback if local assets are missing.
// A common workaround is to use the unpkg CDN for the default icon.
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition, onLocationSelect }: {
    position: { lat: number; lng: number } | null,
    setPosition: (pos: { lat: number; lng: number }) => void,
    onLocationSelect: (lat: number, lng: number) => void
}) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position} draggable={true} eventHandlers={{
            dragend: (e) => {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setPosition(newPos);
                onLocationSelect(newPos.lat, newPos.lng);
            }
        }}>
        </Marker>
    );
}

interface LocationPickerProps {
    initialLat?: number | null;
    initialLng?: number | null;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
    // Default to a central view (e.g., London or users current loc if we had it, but generic is fine)
    // or (0,0) if nothing.
    const defaultCenter = { lat: 51.505, lng: -0.09 };
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );

    // Update internal state if props change (e.g. from Auto-detect)
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition({ lat: initialLat, lng: initialLng });
        }
    }, [initialLat, initialLng]);

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border-2 border-slate-200 z-0">
            <MapContainer
                center={position || defaultCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
            </MapContainer>
        </div>
    );
}
