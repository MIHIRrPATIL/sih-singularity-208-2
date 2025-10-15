import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import { Wagon3DViewer } from "@/components/shared/Wagon3DViewer";
import Order3DVisualization from "@/components/shared/Order3DVisualization";
import { toast } from "sonner";
import { dataService } from "@/services/dataService";
import type { Order } from "@/types";

const OrderCreation = () => {
  const [orders, setOrders] = useState<Order[]>(dataService.getAllOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleCheckOptimal = () => {
    toast.success("Optimal CMO allocation calculated", {
      description: "Best match: CMO-3 at ₹12,500 lower cost"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Creation</h1>
          <p className="text-muted-foreground mt-1">Create and manage material orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>New Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material Type</Label>
                <Select>
                  <SelectTrigger id="material">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steel">Steel Coils</SelectItem>
                    <SelectItem value="iron">Iron Ore</SelectItem>
                    <SelectItem value="coal">Coal</SelectItem>
                    <SelectItem value="limestone">Limestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (tons)</Label>
                <Input id="quantity" type="number" placeholder="Enter quantity" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost (₹)</Label>
                <Input id="cost" type="number" placeholder="Enter cost" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery">Delivery Date & Time</Label>
                <Input id="delivery" type="datetime-local" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (LxWxH m)</Label>
                <Input id="dimensions" placeholder="e.g., 5x2x1.5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" placeholder="Add any special instructions or notes" />
            </div>
            
            <div className="flex gap-3">
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
              <Button variant="outline" onClick={handleCheckOptimal}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Optimal CMO Allocation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3D Preview */}
        <div className="space-y-4">
          <Wagon3DViewer
            wagonType="Freight"
            capacity={500}
            fillPercentage={65}
            material="Steel Coils"
          />
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">Validation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>CMO capacity available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Route optimization passed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span>SLA constraint: Tight schedule</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3D Visualization */}
      <Order3DVisualization orders={orders} />

      {/* Orders Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Existing Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost (₹)</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conflicts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.materialType}</TableCell>
                    <TableCell>{(order.quantity / 1000).toFixed(1)}t</TableCell>
                    <TableCell>₹{order.cost.toLocaleString()}</TableCell>
                    <TableCell>{new Date(order.deliveryDateTime).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.priority === "HIGH" ? "destructive" :
                        order.priority === "MEDIUM" ? "default" : "secondary"
                      }>
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === "Active" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.conflicts > 0 ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {order.conflicts}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-success border-success">
                          <CheckCircle className="h-3 w-3" />
                          None
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCreation;
