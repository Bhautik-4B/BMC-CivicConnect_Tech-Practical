import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IWard } from '@bmc/shared';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '../common/Button.js';

// SVG Marker for the dropped pin
const pickerIcon = L.divIcon({
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 32px; height: 32px; background: #0066CC; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%;"></div>
      </div>
      <div style="width: 14px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1px); margin-top: 2px;"></div>
    </div>
  `,
  className: 'location-picker-pin',
  iconSize: [32, 40],
  iconAnchor: [16, 38],
  popupAnchor: [0, -36]
});

interface LocationPickerMapProps {
  coordinates: [number, number]; // [Longitude, Latitude]
  onChange: (coordinates: [number, number], address?: string) => void;
  detectedWard?: IWard | null;
  wards?: IWard[];
  height?: string;
  nearbyComplaints?: any[];
}

// Map Click Handler Sub-component
const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Map Recenter Controller Sub-component
const RecenterController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  coordinates,
  onChange,
  detectedWard,
  wards = [],
  height = '320px',
  nearbyComplaints = []
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string>('');

  const lat = coordinates[1] || 21.753;
  const lng = coordinates[0] || 72.138;

  const handleLocationChange = async (newLat: number, newLng: number) => {
    // Reverse geocode via Nominatim OSM
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
      const city = data.address?.city || data.address?.town || 'Bhavnagar';
      const formattedAddress = road ? `${road}, ${city}` : data.display_name?.slice(0, 80) || `Coordinates: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
      onChange([newLng, newLat], formattedAddress);
    } catch {
      onChange([newLng, newLat]);
    }
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        handleLocationChange(latitude, longitude);
      },
      (error) => {
        setIsLocating(false);
        setGpsError('Could not obtain GPS position. Please click directly on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <MapPin className="w-3.5 h-3.5 text-civic-600" />
          <span>Click anywhere on the map or drag pin to adjust location</span>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentGPS}
          disabled={isLocating}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-civic-700 bg-civic-50 hover:bg-civic-100 border border-civic-200 rounded-xl transition-colors disabled:opacity-60"
        >
          {isLocating ? (
            <Loader2 className="w-3 h-3 animate-spin text-civic-600" />
          ) : (
            <Navigation className="w-3 h-3 text-civic-600" />
          )}
          <span>{isLocating ? 'Acquiring GPS...' : 'Use My GPS'}</span>
        </button>
      </div>

      {gpsError && (
        <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
          {gpsError}
        </div>
      )}

      <div
        style={{ height, width: '100%' }}
        className="rounded-2xl overflow-hidden border border-slate-300 shadow-inner relative z-0"
      >
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterController center={[lat, lng]} />
          <MapClickHandler onLocationSelect={handleLocationChange} />

          {/* Ward Polygon Boundaries */}
          {wards.map((ward) => {
            if (!ward.boundaryPolygon?.coordinates) return null;
            const latLngCoords = ward.boundaryPolygon.coordinates[0].map(([wLng, wLat]) => [wLat, wLng] as [number, number]);
            const isSelectedWard = detectedWard?.id === ward.id || (detectedWard as any)?._id === ward.id;

            return (
              <Polygon
                key={ward.id}
                positions={latLngCoords}
                pathOptions={{
                  color: isSelectedWard ? '#0284c7' : '#94a3b8',
                  fillColor: isSelectedWard ? '#38bdf8' : '#cbd5e1',
                  fillOpacity: isSelectedWard ? 0.18 : 0.05,
                  weight: isSelectedWard ? 2.5 : 1.5,
                  dashArray: isSelectedWard ? undefined : '3, 4'
                }}
              />
            );
          })}

          {/* Draggable Active Marker */}
          <Marker
            position={[lat, lng]}
            icon={pickerIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleLocationChange(position.lat, position.lng);
              }
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-slate-900">Selected Complaint Location</div>
                <div className="text-slate-500 text-[10px] mt-0.5 font-mono">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </div>
                {detectedWard && (
                  <div className="text-civic-700 font-bold text-[11px] mt-1">
                    {detectedWard.name}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Nearby Active Complaints (Prevent duplicate reporting) */}
          {nearbyComplaints.map((comp) => {
            const cLat = comp.location?.coordinates?.[1];
            const cLng = comp.location?.coordinates?.[0];
            if (!cLat || !cLng) return null;

            return (
              <Marker
                key={comp.id || comp._id}
                position={[cLat, cLng]}
                icon={L.divIcon({
                  html: '<div style="width: 14px; height: 14px; background: #e11d48; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                  className: 'nearby-pin',
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                })}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <span className="font-bold text-red-600 block">Existing Reported Issue</span>
                    <span className="font-semibold text-slate-800">{comp.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{comp.ticketId}</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
        <span>GPS Coordinates: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E</span>
        <span>GeoJSON [Lng, Lat]</span>
      </div>
    </div>
  );
};
