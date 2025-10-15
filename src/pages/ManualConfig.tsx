import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DraggableItem } from "@/components/shared/DraggableItem";
import { DropZone } from "@/components/shared/DropZone";
import { Settings, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const mockOrders = [
  { id: "ORD-001", material: "Steel" },
  { id: "ORD-002", material: "Coal" },
];

const mockCMOs = [
  { id: "CMO-1", name: "Bhilai" },
  { id: "CMO-2", name: "Rourkela" },
];

const mockWagons = [
  { id: "WGN-001", type: "Box" },
  { id: "WGN-002", type: "Hopper" },
];

const mockRakes = [
  { id: "RAKE-001", wagons: 5 },
  { id: "RAKE-002", wagons: 3 },
];

const ManualConfig = () => {
  const [orderToCMO, setOrderToCMO] = useState<Record<string, string>>({});
  const [wagonToCMO, setWagonToCMO] = useState<Record<string, string>>({});
  const [previewDelta, setPreviewDelta] = useState({ cost: 0, sla: 0 });

  const handleOrderToCMODrop = (cmoId: string, item: any) => {
    setOrderToCMO(prev => ({ ...prev, [item.id]: cmoId }));
    toast.success(`${item.id} manually assigned to ${cmoId}`);
    
    // Mock delta calculation
    setPreviewDelta({ cost: -2500, sla: 1.2 });
  };

  const handleSimulateScenario = () => {
    toast.info("Running simulation with manual overrides...", {
      description: "Results will appear in Digital Twin page"
    });
  };

  const handleApplyChanges = () => {
    toast.success("Manual configuration applied", {
      description: "Changes will be reflected in all related pages"
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manual Configuration</h1>
            <p className="text-muted-foreground mt-1">Override automated allocations</p>
          </div>
          <Button onClick={handleSimulateScenario} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Simulate Scenario
          </Button>
        </div>

        {/* Preview Delta */}
        <Card className="shadow-md border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Impact Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cost Delta</p>
                <p className={`text-2xl font-bold ${previewDelta.cost < 0 ? 'text-success' : 'text-danger'}`}>
                  {previewDelta.cost < 0 ? '-' : '+'}₹{Math.abs(previewDelta.cost).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SLA Impact</p>
                <p className={`text-2xl font-bold ${previewDelta.sla > 0 ? 'text-success' : 'text-danger'}`}>
                  {previewDelta.sla > 0 ? '+' : ''}{previewDelta.sla}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order to CMO */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Assign Orders → CMOs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Available Orders</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockOrders.map(order => (
                    <DraggableItem key={order.id} id={order.id} type="order" data={order}>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.material}</p>
                      </CardContent>
                    </DraggableItem>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {mockCMOs.map(cmo => (
                  <DropZone
                    key={cmo.id}
                    accept="order"
                    onDrop={(item) => handleOrderToCMODrop(cmo.id, item)}
                    className="p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cmo.name}</span>
                      {orderToCMO[cmo.id] && (
                        <Badge variant="default">{orderToCMO[cmo.id]}</Badge>
                      )}
                    </div>
                  </DropZone>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wagon to Rake */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Assign Wagons → Rakes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Available Wagons</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockWagons.map(wagon => (
                    <DraggableItem key={wagon.id} id={wagon.id} type="wagon" data={wagon}>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{wagon.id}</p>
                        <p className="text-xs text-muted-foreground">{wagon.type}</p>
                      </CardContent>
                    </DraggableItem>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {mockRakes.map(rake => (
                  <DropZone
                    key={rake.id}
                    accept="wagon"
                    onDrop={(item) => toast.success(`${item.id} assigned to ${rake.id}`)}
                    className="p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{rake.id}</span>
                      <Badge variant="outline">{rake.wagons} wagons</Badge>
                    </div>
                  </DropZone>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Configuration */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Route & Schedule Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="route">Add Detour Route</Label>
                <Input id="route" placeholder="e.g., Bhilai → Nagpur → Kolkata" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule">Override Schedule</Label>
                <Input id="schedule" type="datetime-local" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation & Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Validation Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>All manual assignments are valid</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>No constraint violations detected</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span>Pending approval from supervisor</span>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button onClick={handleApplyChanges} className="bg-gradient-primary hover:opacity-90">
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};

export default ManualConfig;
