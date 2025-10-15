import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react";

interface CMO {
  id: string;
  name: string;
  materials: string[];
  inventory: number;
  pathCost: number;
  timeCost: number;
  status: string;
  lat: number;
  lon: number;
}

interface CMOMapProps {
  cmos: CMO[];
  onCMOClick?: (cmoId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "#10B981"; // Green
    case "Limited":
      return "#F59E0B"; // Yellow
    case "Full":
      return "#DC2626"; // Red
    default:
      return "#6B7280"; // Gray
  }
};

const getInventoryPercentage = (inventory: number) => {
  const maxInventory = 1000;
  return (inventory / maxInventory) * 100;
};

const CMOMap = ({ cmos, onCMOClick }: CMOMapProps) => {
  const [selectedCMO, setSelectedCMO] = useState<string | null>(null);
  const [hoveredCMO, setHoveredCMO] = useState<string | null>(null);

  const handleMarkerClick = (cmo: CMO) => {
    setSelectedCMO(cmo.id);
    onCMOClick?.(cmo.id);
  };

  // Calculate position on map (normalized to 0-100%)
  const getMapPosition = (lat: number, lon: number) => {
    // Normalize coordinates for India map view
    const latRange = { min: 8, max: 35 };
    const lonRange = { min: 68, max: 97 };
    
    const x = ((lon - lonRange.min) / (lonRange.max - lonRange.min)) * 100;
    const y = ((latRange.max - lat) / (latRange.max - latRange.min)) * 100;
    
    return { x, y };
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>CMO Location Map</CardTitle>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10B981" }} />
              <span>Available (&gt;70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
              <span>Limited (30-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#DC2626" }} />
              <span>Full (&lt;30%)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border border-border relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" style={{ height: "500px" }}>
          {/* Map Background with Grid */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" className="opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Route Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {cmos.slice(0, 2).map((cmo) => {
              const pos = getMapPosition(cmo.lat, cmo.lon);
              const centerPos = getMapPosition(20.5937, 78.9629);
              return (
                <line
                  key={`route-${cmo.id}`}
                  x1={`${pos.x}%`}
                  y1={`${pos.y}%`}
                  x2={`${centerPos.x}%`}
                  y2={`${centerPos.y}%`}
                  stroke={getStatusColor(cmo.status)}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.4"
                />
              );
            })}
          </svg>

          {/* CMO Markers */}
          {cmos.map((cmo) => {
            const pos = getMapPosition(cmo.lat, cmo.lon);
            const inventoryPct = getInventoryPercentage(cmo.inventory);
            const isHovered = hoveredCMO === cmo.id;
            const isSelected = selectedCMO === cmo.id;

            return (
              <div
                key={cmo.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${isHovered || isSelected ? 1.2 : 1})`,
                }}
                onMouseEnter={() => setHoveredCMO(cmo.id)}
                onMouseLeave={() => setHoveredCMO(null)}
                onClick={() => handleMarkerClick(cmo)}
              >
                {/* Marker Pin */}
                <div 
                  className="relative"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' : 'none'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: getStatusColor(cmo.status) }}
                  >
                    <MapPin className="h-5 w-5 text-white fill-current" />
                  </div>
                  
                  {/* Pulse animation for selected */}
                  {isSelected && (
                    <div 
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{ 
                        backgroundColor: getStatusColor(cmo.status),
                        opacity: 0.3
                      }}
                    />
                  )}
                </div>

                {/* Popup on hover or select */}
                {(isHovered || isSelected) && (
                  <div className="absolute left-12 top-0 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-border p-3 z-50 animate-fade-in">
                    <h3 className="font-bold text-sm mb-2">{cmo.name}</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">{cmo.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge 
                          variant={
                            cmo.status === "Available" ? "default" :
                            cmo.status === "Limited" ? "secondary" : "destructive"
                          }
                          className="text-xs"
                        >
                          {cmo.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inventory:</span>
                        <span className="font-medium">{inventoryPct.toFixed(0)}%</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-muted-foreground mb-1">Materials:</p>
                        <div className="flex flex-wrap gap-1">
                          {cmo.materials.map((mat) => (
                            <Badge key={mat} variant="outline" className="text-xs">
                              {mat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Path Cost:</span>
                          <span className="font-medium">₹{cmo.pathCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{cmo.timeCost}h</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleMarkerClick(cmo)}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Center point (customer location) */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${getMapPosition(20.5937, 78.9629).x}%`,
              top: `${getMapPosition(20.5937, 78.9629).y}%`,
            }}
          >
            <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              Hub
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button size="sm" variant="outline" className="bg-white dark:bg-slate-800">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-white dark:bg-slate-800">
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CMOMap;
