import { useState, useCallback, useMemo, useEffect } from 'react';
import Map, { Marker, NavigationControl, Popup, Source, Layer } from 'react-map-gl/maplibre';
import type { LayerProps, SourceProps } from 'react-map-gl/maplibre';
import type { LineLayerSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Train, Truck, Loader2 } from 'lucide-react';

interface RailwayMapProps {
  vehicles: Array<{
    id: string;
    type: 'rail' | 'road';
    lat: number;
    lon: number;
    status: 'on-time' | 'delayed' | 'anomaly';
    eta: string;
    route: string;
  }>;
  routes: Array<{
    name: string;
    coordinates: Array<{ lat: number; lng: number }>;
    color: string;
  }>;
  showRoutes?: boolean;
  onVehicleClick?: (vehicle: any) => void;
  initialViewState?: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
}

export const RailwayMap = ({
  vehicles = [],
  routes = [],
  showRoutes = true,
  onVehicleClick,
  initialViewState = { latitude: 23.6717, longitude: 86.1069, zoom: 5 }
}: RailwayMapProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [viewState, setViewState] = useState(initialViewState);

  // Handle map load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Create GeoJSON sources and layers for routes
  const routeData = useMemo(() => {
    if (!routes || routes.length === 0) {
      console.log('No routes provided or routes array is empty');
      return { sources: [], layers: [] };
    }

    console.log('Processing routes:', routes);

    const sources = routes.map((route, index) => {
      // Ensure we have valid coordinates
      const coordinates = (route.coordinates || [])
        .filter(coord => {
          const isValid = coord && 
                         typeof coord.lng === 'number' && 
                         typeof coord.lat === 'number' &&
                         !isNaN(coord.lng) && 
                         !isNaN(coord.lat);
          if (!isValid) {
            console.warn(`Invalid coordinate in route ${route.name}:`, coord);
          }
          return isValid;
        })
        .map(coord => [coord.lng, coord.lat]);

      if (coordinates.length < 2) {
        console.warn(`Route ${route.name} has insufficient valid coordinates (${coordinates.length} of 2 required)`);
      }

      const source = {
        id: `route-${index}`,
        type: 'geojson' as const,
        data: {
          type: 'Feature' as const,
          properties: { name: route.name },
          geometry: {
            type: 'LineString' as const,
            coordinates: coordinates.length >= 2 ? coordinates : []
          }
        }
      };

      console.log(`Created source for route ${route.name}:`, source);
      return source;
    });

    const layers = routes.map<LineLayerSpecification>((route, index) => {
      const layer: LineLayerSpecification = {
        id: `route-${index}-line`,
        type: 'line',
        source: `route-${index}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': route.color || '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.9,
          'line-dasharray': [2, 2]
        }
      };
      console.log(`Created layer for route ${route.name}:`, layer);
      return layer;
    });

    return { sources, layers };
  }, [routes]);

  const routeSources = routeData.sources;
  const routeLayers = routeData.layers;

  const handleVehicleClick = useCallback((vehicle: any, event: any) => {
    event?.originalEvent?.stopPropagation();
    setSelectedVehicle(vehicle);
    onVehicleClick?.(vehicle);
  }, [onVehicleClick]);

  // Using a basic OpenStreetMap style that doesn't require an API key
  const mapStyle = {
    version: 8 as const,
    sources: {
      'osm-tiles': {
        type: 'raster' as const,
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster' as const,
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  };

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onClick={() => setSelectedVehicle(null)}
        reuseMaps
      >
        <NavigationControl position="top-right" />
        
        {/* Add base map layers first */}
        <Source
          id="osm-tiles"
          type="raster"
          tiles={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}
          tileSize={256}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        >
          <Layer
            id="osm-tiles"
            type="raster"
            source="osm-tiles"
            minzoom={0}
            maxzoom={19}
          />
        </Source>

        {/* Add route sources and layers */}
        {showRoutes && routeSources.map((source, index) => {
          // Skip if source data is invalid
          const coords = source.data?.geometry?.coordinates;
          if (!coords || !Array.isArray(coords) || coords.length < 2) {
            console.warn(`Skipping invalid route source (${source.id}): insufficient coordinates`);
            return null;
          }
          
          const layer = routeLayers[index];
          if (!layer) {
            console.warn(`No matching layer for source: ${source.id}`);
            return null;
          }
          
          console.log(`Rendering route: ${source.id} with ${coords.length} coordinates`);
          
          return (
            <Source key={source.id} {...source}>
              <Layer {...layer} beforeId="osm-tiles" />
            </Source>
          );
        })}

        {/* Add vehicle markers */}
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            longitude={vehicle.lon}
            latitude={vehicle.lat}
            anchor="bottom"
            onClick={(e) => handleVehicleClick(vehicle, e)}
          >
            <div 
              className={`w-6 h-6 rounded-full ${
                vehicle.status === 'on-time' ? 'bg-green-500' : 
                vehicle.status === 'delayed' ? 'bg-yellow-500' : 'bg-red-500'
              } border-2 border-white shadow-lg cursor-pointer`}
            >
              {vehicle.type === 'rail' ? (
                <Train className="w-4 h-4 mx-auto mt-0.5 text-white" />
              ) : (
                <Truck className="w-4 h-4 mx-auto mt-0.5 text-white" />
              )}
            </div>
          </Marker>
        ))}

        {/* Show popup when a vehicle is selected */}
        {selectedVehicle && (
          <Popup
            longitude={selectedVehicle.lon}
            latitude={selectedVehicle.lat}
            onClose={() => setSelectedVehicle(null)}
            anchor="top"
            closeOnClick={false}
          >
            <div className="p-2">
              <div className="font-medium">{selectedVehicle.id}</div>
              <div className="text-sm text-gray-600">
                Status: {selectedVehicle.status}
              </div>
              <div className="text-sm text-gray-600">
                ETA: {selectedVehicle.eta}
              </div>
              <div className="text-sm text-gray-600">
                Route: {selectedVehicle.route}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md space-y-2 z-10">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <Train className="h-3 w-3 text-white" />
          </div>
          <span>On Time</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
            <Train className="h-3 w-3 text-white" />
          </div>
          <span>Delayed</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <Train className="h-3 w-3 text-white" />
          </div>
          <span>Anomaly</span>
        </div>
      </div>
    </div>
  );
};

export default RailwayMap;
