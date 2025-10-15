import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DraggableItem } from "@/components/shared/DraggableItem";
import { DropZone } from "@/components/shared/DropZone";
import { Wagon3DViewer } from "@/components/shared/Wagon3DViewer";
import { Truck, AlertCircle, X, TrendingUp, TrendingDown, Settings } from "lucide-react";
import { toast } from "sonner";
import { dataService } from "@/services/dataService";
import type { Wagon, Order } from "@/types";
import DigitalTwinDashboard from "@/components/shared/DigitalTwinDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WagonAllocation = () => {
  const allWagons = dataService.getAllWagons();
  const allOrders = dataService.getAllOrders();
  
  const [wagons, setWagons] = useState<Wagon[]>(() => {
    // Initialize with some sample assignments
    const initialWagons = [...allWagons];
    initialWagons[0].assignedOrders = [allOrders[0].id];
    initialWagons[1].assignedOrders = [allOrders[1].id];
    return initialWagons;
  });
  
  const [allowSplitting, setAllowSplitting] = useState(false);
  const [selectedWagon, setSelectedWagon] = useState<Wagon | null>(wagons[0]);
  
  // Get available orders (not assigned to any wagon)
  const availableOrders = allOrders.filter(order => 
    !wagons.some(wagon => wagon.assignedOrders.includes(order.id))
  );

  const handleDrop = (wagonId: string, item: { id: string; type: string; order: Order }) => {
    if (item.type !== "order") return;
    
    setWagons(prevWagons => {
      // Remove from current wagon if exists
      const updatedWagons = prevWagons.map(wagon => ({
        ...wagon,
        assignedOrders: wagon.assignedOrders.filter(id => id !== item.order.id)
      }));
      
      // Add to target wagon
      return updatedWagons.map(wagon => 
        wagon.id === wagonId 
          ? { 
              ...wagon, 
              assignedOrders: [...wagon.assignedOrders, item.order.id],
              available: false
            } 
          : wagon
      );
    });
    
    toast.success(`Order ${item.order.id} allocated to ${wagonId}`, {
      description: "Wagon allocation updated"
    });
  };

  const handleRemoveOrder = (wagonId: string, orderId: string) => {
    setWagons(prevWagons => 
      prevWagons.map(wagon => 
        wagon.id === wagonId
          ? { 
              ...wagon, 
              assignedOrders: wagon.assignedOrders.filter(id => id !== orderId),
              available: wagon.assignedOrders.length <= 1 // Mark as available if no orders left
            } 
          : wagon
      )
    );
  };

  const saveConfiguration = () => {
    // Here you would typically save to your backend
    const config = {
      wagons,
      allowSplitting,
      timestamp: new Date().toISOString()
    };
    console.log('Saving configuration:', config);
    toast.success("Configuration saved successfully!");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs defaultValue="allocation" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Wagon Management</h1>
            <p className="text-muted-foreground mt-1">Optimize wagon allocation and monitor operations</p>
          </div>
          <TabsList>
            <TabsTrigger value="allocation">
              <Truck className="h-4 w-4 mr-2" />
              Wagon Allocation
            </TabsTrigger>
            <TabsTrigger value="digital-twin">
              <Settings className="h-4 w-4 mr-2" />
              Digital Twin
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="allocation" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Wagon Allocation</h2>
              <p className="text-muted-foreground">Drag and drop orders to allocate wagons</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="split-orders"
                  checked={allowSplitting}
                  onCheckedChange={setAllowSplitting}
                />
                <Label htmlFor="split-orders">Allow Order Splitting</Label>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveConfiguration}
                className="ml-2"
              >
                Save Configuration
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wagon List */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Available Orders (Drag to Allocate)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableOrders.map(order => (
                      <DraggableItem key={order.id} id={order.id} type="order" data={order}>
                        <Card className="border-2 border-dashed border-primary/50 hover:border-primary transition-colors cursor-move">
                          <CardContent className="p-3">
                            <p className="font-medium text-sm">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.materialType}</p>
                            <p className="text-xs text-muted-foreground">{(order.quantity / 1000).toFixed(1)}t</p>
                          </CardContent>
                        </Card>
                      </DraggableItem>
                    ))}
                    {availableOrders.length === 0 && (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        <p>All orders have been allocated</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {wagons.map(wagon => (
                <Card 
                  key={wagon.id} 
                  className="shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedWagon(wagon)}
                >
                  <DropZone
                    accept="order"
                    onDrop={(item) => handleDrop(wagon.id, item)}
                    className="p-0"
                  >
                    <CardHeader className={`${wagon.available ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-muted'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-base">{wagon.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">{wagon.type} Wagon</p>
                          </div>
                        </div>
                        <Badge variant={wagon.available ? "default" : "secondary"}>
                          {wagon.available ? "Available" : "Allocated"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 mt-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p className="font-medium">{(wagon.capacity / 1000).toFixed(1)}t</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost/km</p>
                          <p className="font-medium">₹{wagon.costPerKm.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Material</p>
                          <p className="font-medium">{wagon.material}</p>
                        </div>
                      </div>

                      {wagon.assignedOrders.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Assigned Orders:</p>
                          <div className="flex flex-wrap gap-2">
                            {wagon.assignedOrders.map(orderId => {
                              const order = allOrders.find(o => o.id === orderId);
                              return (
                                <Badge 
                                  key={orderId} 
                                  variant="default"
                                  className="cursor-pointer hover:bg-primary/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveOrder(wagon.id, orderId);
                                  }}
                                >
                                  {orderId}
                                  <X className="h-3 w-3 ml-1" />
                                </Badge>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>Utilization: {wagon.utilizationPercent?.toFixed(1) || '0'}%</span>
                          </div>
                        </div>
                      )}

                      {!wagon.available && wagon.material === "Steel" && (
                        <div className="flex items-center gap-2 text-xs text-yellow-600 pt-2">
                          <AlertCircle className="h-3 w-3" />
                          <span>Material compatibility check required</span>
                        </div>
                      )}
                    </CardContent>
                  </DropZone>
                </Card>
              ))}
            </div>

            {/* 3D Viewer */}
            <div className="space-y-4">
              {selectedWagon && (
                <>
                  <Wagon3DViewer
                    wagonType={selectedWagon.type}
                    capacity={selectedWagon.capacity}
                    fillPercentage={selectedWagon.utilizationPercent}
                    material={selectedWagon.material}
                  />
                  
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="text-sm">Efficiency Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Capacity Utilization</span>
                          <span className="font-medium">
                            {selectedWagon.utilizationPercent?.toFixed(1) || '0'}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${selectedWagon.utilizationPercent || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cost Efficiency</span>
                          <span className="font-medium text-green-600">+12%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "87%" }} />
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Wagon Details</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">{selectedWagon.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Material:</span>
                            <span className="font-medium">{selectedWagon.material}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Orders:</span>
                            <span className="font-medium">{selectedWagon.assignedOrders.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {!selectedWagon && (
                <Card className="shadow-md">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a wagon to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Digital Twin Tab Content */}
        <TabsContent value="digital-twin" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Digital Twin Dashboard</h2>
              <p className="text-muted-foreground">Real-time monitoring and analytics</p>
            </div>
          </div>
          
          {selectedWagon ? (
            <div className="space-y-6">
              {/* Wagon Information Card */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Selected Wagon: {selectedWagon.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-lg font-semibold">{selectedWagon.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Material</p>
                      <p className="text-lg font-semibold">{selectedWagon.material}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="text-lg font-semibold">{(selectedWagon.capacity / 1000).toFixed(1)}t</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={selectedWagon.available ? "default" : "secondary"}>
                        {selectedWagon.available ? "Available" : "Allocated"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Digital Twin Dashboard Component */}
              <DigitalTwinDashboard />
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">No Wagon Selected</p>
                <p className="text-sm">Please select a wagon from the allocation tab to view its digital twin</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DndProvider>
  );
};

export default WagonAllocation;