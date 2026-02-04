
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface TacticalMapProps {
  lat: number;
  lon: number;
}

const TacticalMap: React.FC<TacticalMapProps> = ({ lat, lon }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lon], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add a tactical crosshair marker
      const tacticalIcon = L.divIcon({
        className: 'tactical-marker',
        html: `<div class="w-8 h-8 border-2 border-[#00ff41] rounded-full flex items-center justify-center">
                <div class="w-1 h-1 bg-[#00ff41] rounded-full"></div>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([lat, lon], { icon: tacticalIcon }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([lat, lon], 12);
    }

    return () => {
      // Cleanup happens if needed, but we keep instance in ref
    };
  }, [lat, lon]);

  return (
    <div className="relative w-full h-full rounded overflow-hidden tactical-border">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 z-[1000] bg-black/80 p-1 text-[10px] uppercase tracking-tighter">
        RADAR_SCAN: ACTIVE // SAT_LAYER_01
      </div>
    </div>
  );
};

export default TacticalMap;
