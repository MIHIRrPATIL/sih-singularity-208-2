import React, { useCallback, useMemo } from 'react';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Train } from 'lucide-react';

type Vehicle = {
  id: string;
  type: 'rail' | 'road';
  lat: number;
  lon: number;
  status: 'on-time' | 'delayed' | 'anomaly';
  eta: string;
  progress: number;
  route: string;
  issue?: string;
  altCost?: number;
};

type FleetMapProps = {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicle: Vehicle) => void;
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;

const VehicleMarker = ({ 
  vehicle, 
  onClick 
}: { 
  vehicle: Vehicle; 
  onClick: () => void;
}) => {
  const position = useMemo(() => ({
    lat: vehicle.lat,
    lng: vehicle.lon
  }), [vehicle.lat, vehicle.lon]);

  const statusColor = useMemo(() => {
    switch (vehicle.status) {
      case 'on-time': return '#10b981'; // green-500
      case 'delayed': return '#f59e0b'; // yellow-500
      case 'anomaly': return '#ef4444'; // red-500
      default: return '#3b82f6'; // blue-500
    }
  }, [vehicle.status]);

  return (
    <Marker
      position={position}
      onClick={onClick}
      title={`${vehicle.id} - ${vehicle.route}`}
      options={{
        icon: {
          path: vehicle.type === 'rail' ? 
            'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' :
            'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: statusColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#ffffff',
          scale: 1.2,
          anchor: { x: 12, y: 12 },
        },
      }}
    >
      <div className="bg-white p-2 rounded shadow-lg min-w-48">
        <div className="flex items-center gap-2">
          {vehicle.type === 'rail' ? (
            <Train className="h-4 w-4 text-blue-600" />
          ) : (
            <Truck className="h-4 w-4 text-orange-500" />
          )}
          <span className="font-medium text-sm">{vehicle.id}</span>
          <Badge 
            variant={
              vehicle.status === 'on-time' ? 'default' :
              vehicle.status === 'delayed' ? 'secondary' : 'destructive'
            }
            className="ml-auto text-xs"
          >
            {vehicle.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">{vehicle.route}</p>
        <p className="text-xs">ETA: {vehicle.eta}</p>
      </div>
    </Marker>
  );
};

const FleetMapContent = ({ vehicles, onVehicleClick }: FleetMapProps) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');

  // Handle map click events if needed
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    console.log('Map clicked at:', e.latLng?.toJSON());
  }, []);

  return (
    <div className="h-full w-full relative">
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
        onClick={handleMapClick}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
      >
        {vehicles.map((vehicle) => (
          <VehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
            onClick={() => onVehicleClick?.(vehicle)}
          />
        ))}
      </Map>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md space-y-2 z-10">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>On Time</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Delayed</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Anomaly</span>
        </div>
        <div className="h-px bg-gray-200 my-1"></div>
        <div className="flex items-center gap-2 text-xs">
          <Train className="h-3 w-3 text-blue-600" />
          <span>Rail</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Truck className="h-3 w-3 text-orange-500" />
          <span>Road</span>
        </div>
      </div>
    </div>
  );
};

export const FleetMap = (props: FleetMapProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center p-4">
          <h3 className="text-lg font-medium mb-2">Google Maps API Key Required</h3>
          <p className="text-sm text-gray-600">
            Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['routes']}>
      <FleetMapContent {...props} />
    </APIProvider>
  );
};
