'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths inside Next.js bundler
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapSelector({ onLocationSelect, initialLat = 37.7749, initialLng = -122.4194 }: MapSelectorProps) {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(initialLat, initialLng));
  const [address, setAddress] = useState('San Francisco, CA');
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');

  // Trigger geocode mock on change
  const resolveAddressMock = (lat: number, lng: number) => {
    // Generate a premium fake address based on coords for testing ease
    const streets = ['Market St', 'Mission St', 'Geary Blvd', 'Valencia St', 'Broadway', 'Lombard St', 'University Ave', 'El Camino Real'];
    const cities = ['San Francisco', 'Oakland', 'San Jose', 'Berkeley', 'Palo Alto'];
    
    const street = streets[Math.abs(Math.round(lat * 1000)) % streets.length];
    const streetNo = Math.abs(Math.round(lng * 1234)) % 999 + 1;
    const city = cities[Math.abs(Math.round(lat * lng * 100)) % cities.length];
    
    const generatedAddress = `${streetNo} ${street}, ${city}, CA`;
    setAddress(generatedAddress);
    onLocationSelect(lat, lng, generatedAddress);
  };

  // Map events receiver
  function MapEvents() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        resolveAddressMock(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-center bg-gray-950/40 p-2.5 rounded-lg border border-white/5">
        <span className="text-xs text-gray-400">
          Selected: <strong className="text-indigo-400 font-mono">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</strong>
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMapType('streets')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${mapType === 'streets' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Streets
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${mapType === 'satellite' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Satellite Mock
          </button>
        </div>
      </div>

      <div className="h-72 w-full relative z-10 rounded-xl overflow-hidden border border-white/8">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          {mapType === 'streets' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            // Custom tile configuration simulating satellite imaging overlay
            <TileLayer
              attribution='Map data &copy; Esri World Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          <Marker 
            position={position} 
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                setPosition(pos);
                resolveAddressMock(pos.lat, pos.lng);
              }
            }}
          />
          <MapEvents />
        </MapContainer>
      </div>

      <div className="text-xs text-gray-500 italic mt-0.5">
        Tip: Drag the marker or click anywhere on the map to change the location coordinates.
      </div>
    </div>
  );
}
