import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { IComplaint, IWard, ComplaintStatuses, Priorities } from '@bmc/shared';
import { StatusBadge } from '../common/StatusBadge.js';
import { PriorityBadge } from '../common/PriorityBadge.js';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom SVG Pin Icon generator
const createCustomIcon = (status: string, priority: string) => {
  let color = '#0284c7'; // default blue
  if (priority === Priorities.EMERGENCY) color = '#dc2626';
  else if (status === ComplaintStatuses.IN_PROGRESS) color = '#0284c7';
  else if (status === ComplaintStatuses.RESOLVED || status === ComplaintStatuses.CLOSED)
    color = '#16a34a';
  else if (status === ComplaintStatuses.REOPENED) color = '#e11d48';
  else if (status === ComplaintStatuses.AWAITING_VERIFICATION) color = '#d97706';

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="30" height="30" stroke="#ffffff" stroke-width="1.5">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-map-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28]
  });
};

interface GISMapProps {
  complaints: IComplaint[];
  wards?: IWard[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (complaint: IComplaint) => void;
}

export const GISMap: React.FC<GISMapProps> = ({
  complaints,
  wards = [],
  center = [21.753, 72.138], // Bhavnagar default coordinates [lat, lng]
  zoom = 13,
  height = '500px',
  onMarkerClick
}) => {
  return (
    <div
      style={{ height, width: '100%' }}
      className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-md relative z-0"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ward Boundaries (Polygons) */}
        {wards.map((ward) => {
          if (!ward.boundaryPolygon?.coordinates) return null;
          // Leaflet expects [lat, lng] pairs for Polygons
          const latLngCoords = ward.boundaryPolygon.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

          return (
            <Polygon
              key={ward.id}
              positions={latLngCoords}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '4, 4'
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <div className="font-bold text-slate-900">{ward.name}</div>
                  <div className="text-slate-500 text-[11px]">Ward Number: {ward.wardNumber}</div>
                  <div className="text-slate-500 text-[11px]">{ward.officeAddress}</div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Complaint Markers */}
        {complaints.map((comp) => {
          const lat = comp.location?.coordinates?.[1] || center[0];
          const lng = comp.location?.coordinates?.[0] || center[1];

          return (
            <Marker
              key={comp.id}
              position={[lat, lng]}
              icon={createCustomIcon(comp.status, comp.priority)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(comp)
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 max-w-xs text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-civic-700">{comp.ticketId}</span>
                    <PriorityBadge priority={comp.priority} />
                  </div>

                  <div className="font-bold text-slate-900 leading-tight">{comp.title}</div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{comp.location?.address}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <StatusBadge status={comp.status} />
                    <Link
                      to={`/citizen/ticket/${comp.ticketId || comp.id}`}
                      className="inline-flex items-center gap-1 text-civic-600 font-bold hover:underline"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
