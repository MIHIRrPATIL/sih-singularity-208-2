import { useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DraggableItem } from "@/components/shared/DraggableItem";
import { DropZone } from "@/components/shared/DropZone";
import { MapPin, RefreshCw, AlertCircle, Factory } from "lucide-react";
import { toast } from "sonner";
import 'maplibre-gl/dist/maplibre-gl.css';

// Major Indian Steel Plants with actual coordinates
const STEEL_PLANTS = [
  {
    id: "CMO-001",
    name: "Bhilai Steel Plant",
    coordinates: { lat: 21.2091, lon: 81.3631 },
    status: "Available",
    materials: ["Steel Coils", "Steel Plates", "Steel Beams"],
    inventory: 5000,
    pathCost: 45000,
    timeCost: 48
  },
  {
    id: "CMO-002",
    name: "Rourkela Steel Plant",
    coordinates: { lat: 22.2604, lon: 84.8536 },
    status: "Available",
    materials: ["Steel Plates", "Steel Beams", "Steel Sheets"],
    inventory: 4500,
    pathCost: 52000,
    timeCost: 54
  },
  {
    id: "CMO-003",
    name: "Bokaro Steel Plant",
    coordinates: { lat: 23.6693, lon: 86.1511 },
    status: "Limited",
    materials: ["Steel Coils", "Steel Sheets", "Steel Beams"],
    inventory: 3000,
    pathCost: 48000,
    timeCost: 50
  },
  {
    id: "CMO-004",
    name: "IISCO Steel Plant",
    coordinates: { lat: 23.7937, lon: 86.4304 },
    status: "Available",
    materials: ["Steel Plates", "Steel Coils", "Steel Beams"],
    inventory: 3500,
    pathCost: 50000,
    timeCost: 52
  }
];

// Sample orders
const SAMPLE_ORDERS = [
  {
    id: "ORD-001",
    materialType: "Steel Coils",
    quantity: 2500,
    status: "Active"
  },
  {
    id: "ORD-002",
    materialType: "Steel Plates",
    quantity: 1800,
    status: "Active"
  },
  {
    id: "ORD-003",
    materialType: "Steel Beams",
    quantity: 3200,
    status: "Active"
  }
];

const CMOMatching = () => {
  const [allocations, setAllocations] = useState<Record<string, string[]>>({});
  const [selectedCMO, setSelectedCMO] = useState<string | null>(null);
  const cmoCardsRef = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Map viewport state - centered on India
  const [viewState, setViewState] = useState({
    longitude: 83.5,
    latitude: 23.0,
    zoom: 5.5
  });

  const handleDrop = (cmoId: string, item: { id: string; type: 'order' }) => {
    if (item.type !== 'order') return;
    
    setAllocations(prev => {
      // Check if order is already allocated to this CMO
      if (prev[cmoId]?.includes(item.id)) {
        toast.info(`Order ${item.id} is already allocated to this CMO`);
        return prev;
      }
      
      // Remove order from any other CMO
      const newAllocations = Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: prev[key].filter((orderId: string) => orderId !== item.id)
      }), {} as Record<string, string[]>);
      
      // Add to selected CMO
      return {
        ...newAllocations,
        [cmoId]: [...(newAllocations[cmoId] || []), item.id]
      };
    });
    
    toast.success(`Order ${item.id} allocated to ${STEEL_PLANTS.find(c => c.id === cmoId)?.name}`);
  };

  const handleRecalculate = () => {
    toast.info("Recalculating optimal allocations...", {
      description: "Updated cost and time estimates"
    });
  };

  const handleCMOClick = (cmoId: string) => {
    setSelectedCMO(cmoId);
    const cmo = STEEL_PLANTS.find(c => c.id === cmoId);
    if (cmo) {
      setViewState({
        longitude: cmo.coordinates.lon,
        latitude: cmo.coordinates.lat,
        zoom: 8
      });
    }
    
    const element = cmoCardsRef.current[cmoId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-primary");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary");
      }, 2000);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CMO Matching</h1>
            <p className="text-muted-foreground mt-1">Match orders with optimal steel plants</p>
          </div>
          <Button onClick={handleRecalculate} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
        </div>

        {/* Interactive Map */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Steel Plant Location Map ({STEEL_PLANTS.length} Plants)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: '500px', position: 'relative' }}>
              <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-right" />
                
                {STEEL_PLANTS.map(cmo => (
                  <Marker
                    key={cmo.id}
                    longitude={cmo.coordinates.lon}
                    latitude={cmo.coordinates.lat}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      handleCMOClick(cmo.id);
                    }}
                  >
                    <div className="cursor-pointer transform transition-transform hover:scale-110">
                      <div className={`relative ${selectedCMO === cmo.id ? 'animate-pulse' : ''}`}>
                        <Factory 
                          className={`h-8 w-8 ${
                            selectedCMO === cmo.id 
                              ? 'text-blue-600' 
                              : cmo.status === 'Available' 
                                ? 'text-green-600' 
                                : cmo.status === 'Limited'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                          }`}
                          fill="currentColor"
                        />
                        {allocations[cmo.id] && allocations[cmo.id].length > 0 && (
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {allocations[cmo.id].length}
                          </div>
                        )}
                      </div>
                      <div className="bg-white px-2 py-1 rounded shadow-lg text-xs font-semibold text-center mt-1 border border-gray-200">
                        {cmo.name.replace(' Steel Plant', '')}
                      </div>
                    </div>
                  </Marker>
                ))}
              </Map>
            </div>
          </CardContent>
        </Card>

        {/* Available Orders */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Available Orders (Drag to Allocate)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_ORDERS.map(order => (
                <DraggableItem key={order.id} id={order.id} type="order" data={order}>
                  <Card className="cursor-move hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-blue-500">
                    <CardContent className="p-4">
                      <p className="font-bold text-lg">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.materialType}</p>
                      <p className="text-sm font-semibold text-blue-600">{(order.quantity / 1000).toFixed(1)}t</p>
                    </CardContent>
                  </Card>
                </DraggableItem>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CMO Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEEL_PLANTS.map(cmo => (
            <div 
              key={cmo.id} 
              ref={(el) => { cmoCardsRef.current[cmo.id] = el; }}
              className="transition-all duration-300"
            >
              <Card className={`shadow-lg ${selectedCMO === cmo.id ? 'ring-2 ring-blue-500' : ''}`}>
                <DropZone 
                  accept="order"
                  onDrop={(item) => handleDrop(cmo.id, { id: item.id, type: 'order' })}
                  className="min-h-[200px]"
                >
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{cmo.name}</CardTitle>
                        <p className="text-sm text-gray-600">{cmo.id}</p>
                      </div>
                      <Badge 
                        className={
                          cmo.status === "Available" 
                            ? "bg-green-500" 
                            : cmo.status === "Limited" 
                              ? "bg-yellow-500" 
                              : "bg-red-500"
                        }
                      >
                        {cmo.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {cmo.materials.map(mat => (
                        <Badge key={mat} variant="outline" className="bg-blue-50">
                          {mat}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600 text-xs">Inventory</p>
                        <p className="font-bold text-lg">{cmo.inventory}t</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600 text-xs">Path Cost</p>
                        <p className="font-bold text-lg">₹{(cmo.pathCost / 1000).toFixed(0)}k</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600 text-xs">Time Cost</p>
                        <p className="font-bold text-lg">{cmo.timeCost}h</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600 text-xs">Location</p>
                        <p className="font-semibold text-sm">{cmo.coordinates.lat.toFixed(2)}°N</p>
                      </div>
                    </div>

                    {allocations[cmo.id] && allocations[cmo.id].length > 0 && (
                      <div className="pt-3 border-t-2 border-blue-200">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {allocations[cmo.id].length}
                          </span>
                          Allocated Orders:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allocations[cmo.id].map(orderId => (
                            <Badge key={orderId} className="bg-blue-600">
                              {orderId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {cmo.status === "Full" && (
                      <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4" />
                        <span>Capacity constraint active</span>
                      </div>
                    )}

                    {allocations[cmo.id]?.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
                        Drop orders here to allocate
                      </div>
                    )}
                  </CardContent>
                </DropZone>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default CMOMatching;