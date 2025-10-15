import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DraggableItem } from "@/components/shared/DraggableItem";
import { DropZone } from "@/components/shared/DropZone";
import ShiftManagement from "@/components/shared/ShiftManagement";
import { Activity, Users, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { dataService } from "@/services/dataService";
import type { Siding } from "@/types";

const mockSidings = [
  { id: "SIDING-A", capacity: 5, occupied: 3, material: "Steel", labor: 4, timeEst: "2h" },
  { id: "SIDING-B", capacity: 6, occupied: 6, material: "Coal", labor: 6, timeEst: "3h" },
  { id: "SIDING-C", capacity: 4, occupied: 1, material: "Mixed", labor: 2, timeEst: "1h" },
  { id: "SIDING-D", capacity: 7, occupied: 4, material: "Iron Ore", labor: 5, timeEst: "2.5h" },
];

const mockWagons = [
  { id: "WGN-015", material: "Steel", status: "Ready" },
  { id: "WGN-016", material: "Coal", status: "Ready" },
  { id: "WGN-017", material: "Iron Ore", status: "Ready" },
];

const YardManagement = () => {
  const allSidings = dataService.getAllSidings();
  const availableWagons = dataService.getAvailableWagons().slice(0, 3);
  
  const [sidings, setSidings] = useState<Siding[]>(allSidings);

  const handleDrop = (sidingId: string, item: any) => {
    const siding = sidings.find(s => s.id === sidingId);
    
    if (!siding) return;
    
    if (siding.occupied >= siding.capacity) {
      toast.error("Siding is at full capacity", {
        description: `${sidingId} cannot accept more wagons`
      });
      return;
    }
    
    setSidings(prev => prev.map(s => 
      s.id === sidingId ? { ...s, occupied: s.occupied + 1 } : s
    ));
    
    toast.success(`Wagon ${item.id} assigned to ${sidingId}`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Yard Management</h1>
          <p className="text-muted-foreground mt-1">Manage siding allocation and resources</p>
        </div>

        {/* Shift Management Section */}
        <ShiftManagement />

        {/* Available Wagons */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Incoming Wagons (Drag to Sidings)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockWagons.map(wagon => (
                <DraggableItem key={wagon.id} id={wagon.id} type="wagon" data={wagon}>
                  <CardContent className="p-4">
                    <p className="font-medium">{wagon.id}</p>
                    <p className="text-sm text-muted-foreground">{wagon.material}</p>
                    <Badge variant="default" className="mt-2">{wagon.status}</Badge>
                  </CardContent>
                </DraggableItem>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Siding Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sidings.map(siding => {
            const utilizationPct = (siding.occupied / siding.capacity) * 100;
            const isFull = siding.occupied >= siding.capacity;
            const laborShortage = siding.labor < siding.occupied;
            
            return (
              <DropZone
                key={siding.id}
                accept="wagon"
                onDrop={(item) => handleDrop(siding.id, item)}
                className="p-0"
              >
                <CardHeader className={`${isFull ? 'bg-danger/10' : 'bg-gradient-surface'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">{siding.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">{siding.material}</p>
                      </div>
                    </div>
                    <Badge variant={isFull ? "destructive" : "default"}>
                      {siding.occupied}/{siding.capacity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 mt-4">
                  {/* Capacity Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity Utilization</span>
                      <span className="font-medium">{utilizationPct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isFull ? 'bg-danger' : utilizationPct > 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${utilizationPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Labor */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Labor Assigned</span>
                    </div>
                    <span className={`font-medium ${laborShortage ? 'text-warning' : 'text-foreground'}`}>
                      {siding.labor} workers
                    </span>
                  </div>

                  {/* Time Estimate */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Estimated Time</span>
                    </div>
                    <span className="font-medium">{siding.timeEstimate}{siding.timeUnit}</span>
                  </div>

                  {/* Alerts */}
                  {(isFull || laborShortage) && (
                    <div className="pt-3 border-t space-y-2">
                      {isFull && (
                        <div className="flex items-center gap-2 text-xs text-danger">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Siding at full capacity</span>
                        </div>
                      )}
                      {laborShortage && (
                        <div className="flex items-center gap-2 text-xs text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Labor shortage detected</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </DropZone>
            );
          })}
        </div>

        {/* Resource Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Sidings</p>
                  <p className="text-2xl font-bold">{sidings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Labor</p>
                  <p className="text-2xl font-bold">
                    {sidings.reduce((sum, s) => sum + s.labor, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Time</p>
                  <p className="text-2xl font-bold">2.1h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold">
                    {sidings.filter(s => s.occupied >= s.capacity).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
};

export default YardManagement;
