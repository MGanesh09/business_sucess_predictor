'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons using stable, public leaflet color markers
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Competitor {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  distance: string;
  popularity: string;
}

interface CompetitorMapProps {
  centerLat: number;
  centerLng: number;
  businessName: string;
  competitors: Competitor[];
  activeCompIndex: number | null;
}

// Controller to fly map to coordinates when selected
function ChangeMapView({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, map, zoom]);
  return null;
}

export default function CompetitorMap({ centerLat, centerLng, businessName, competitors, activeCompIndex }: CompetitorMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([centerLat, centerLng]);

  useEffect(() => {
    if (activeCompIndex !== null && competitors[activeCompIndex]) {
      setMapCenter([competitors[activeCompIndex].lat, competitors[activeCompIndex].lng]);
    } else {
      setMapCenter([centerLat, centerLng]);
    }
  }, [activeCompIndex, centerLat, centerLng, competitors]);

  return (
    <div className="h-96 w-full relative rounded-2xl overflow-hidden border border-white/8 z-10 shadow-lg">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Target business marker */}
        <Marker position={[centerLat, centerLng]} icon={blueIcon}>
          <Popup>
            <div className="text-xs">
              <strong className="text-indigo-400 font-bold">{businessName}</strong>
              <span className="block text-[10px] text-gray-400 mt-0.5">Your Proposed Spot</span>
            </div>
          </Popup>
        </Marker>

        {/* Competitors markers */}
        {competitors.map((comp, idx) => (
          <Marker 
            key={idx} 
            position={[comp.lat, comp.lng]} 
            icon={redIcon}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <strong className="text-red-400 font-bold">{comp.name}</strong>
                <div className="flex gap-2 text-[10px] text-gray-400">
                  <span>Rating: {comp.rating} ⭐</span>
                  <span>Dist: {comp.distance}</span>
                </div>
                <span className="block text-[9px] text-indigo-300 font-medium">{comp.popularity} popularity</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Update Map focus based on active selections */}
        <ChangeMapView lat={mapCenter[0]} lng={mapCenter[1]} zoom={activeCompIndex !== null ? 16 : 15} />

      </MapContainer>
    </div>
  );
}
