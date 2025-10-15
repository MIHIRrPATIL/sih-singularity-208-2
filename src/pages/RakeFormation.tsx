import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CostComparator } from "@/components/shared/CostComparator";
import { TrainFront, RefreshCw, AlertCircle, CheckCircle, Maximize2 } from "lucide-react";
import RakeVisualization from "@/components/shared/RakeVisualization";
import { toast } from "sonner";
import { dataService } from "@/services/dataService";
import type { Rake } from "@/types";

const RakeFormation = () => {
  // Get data from centralized service
  const allRakes = dataService.getAllRakes();
  const [rakes] = useState<Rake[]>(allRakes);
  const [selectedRake, setSelectedRake] = useState<Rake>(allRakes[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRecalculate = () => {
    toast.success("Rake formation optimized", {
      description: "Cost reduced by ₹8,500 with new configuration"
    });
  };

  const handleRakeSelect = (rake: Rake) => {
    setSelectedRake(rake);
    toast.info(`Viewing ${rake.id}`, {
      description: `${rake.wagons.length} wagons • ${rake.route}`
    });
  };

  // Get 3D visualization data from service
  const getRakeVisualizationData = (rakeId: string) => {
    return dataService.getRakeData3D(rakeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rake Formation</h1>
          <p className="text-muted-foreground mt-1">Optimize wagon grouping into rakes</p>
        </div>
        <Button onClick={handleRecalculate} className="bg-gradient-primary hover:opacity-90">
          <RefreshCw className="h-4 w-4 mr-2" />
          Recalculate Formation
        </Button>
      </div>

      {/* Quick Rake Selector */}
      <Card className="shadow-md bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Quick Select:</span>
            {rakes.map((rake) => (
              <Button
                key={rake.id}
                variant={selectedRake.id === rake.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleRakeSelect(rake)}
                className="gap-2"
              >
                {selectedRake.id === rake.id && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
                {rake.id}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rake Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Active Rakes</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Click on a rake to view in 3D</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rake ID</TableHead>
                  <TableHead>Wagons</TableHead>
                  <TableHead>Cost (₹)</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Length (m)</TableHead>
                  <TableHead>Weight (t)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rakes.map((rake) => (
                  <TableRow 
                    key={rake.id}
                    onClick={() => handleRakeSelect(rake)}
                    className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                      selectedRake.id === rake.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {selectedRake.id === rake.id && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                        {rake.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rake.wagons.slice(0, 3).map((wagon, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {wagon.slice(-3)}
                          </Badge>
                        ))}
                        {rake.wagons.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{rake.wagons.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₹{rake.cost.toLocaleString()}</TableCell>
                    <TableCell>{new Date(rake.schedule).toLocaleString('en-IN', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</TableCell>
                    <TableCell>{rake.route}</TableCell>
                    <TableCell>{rake.length}m</TableCell>
                    <TableCell>{rake.weight}t</TableCell>
                    <TableCell>
                      <Badge variant={rake.status === "Scheduled" ? "default" : "secondary"}>
                        {rake.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 3D Visualization - Full Width */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrainFront className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Interactive 3D Rake Visualization</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedRake.id} - {selectedRake.route}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Wagons:</span>
                  <span className="font-semibold">{selectedRake.wagons.length}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-semibold text-primary">₹{(selectedRake.cost / 1000).toFixed(0)}K</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                {isFullscreen ? "Exit" : "Fullscreen"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className={`relative ${isFullscreen ? 'h-[80vh]' : 'h-[500px]'} transition-all duration-300`}>
            {getRakeVisualizationData(selectedRake.id) && (
              <RakeVisualization 
                key={selectedRake.id} 
                rakeData={getRakeVisualizationData(selectedRake.id)!} 
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rake Metrics */}
        <Card className="shadow-md border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Rake Metrics - {selectedRake.id}</CardTitle>
              <Badge variant={selectedRake.status === "Scheduled" ? "default" : "secondary"}>
                {selectedRake.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{selectedRake.route}</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg transition-all hover:shadow-sm">
                <span className="text-sm text-muted-foreground">Total Wagons</span>
                <span className="text-lg font-bold">{selectedRake.wagons.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg transition-all hover:shadow-sm">
                <span className="text-sm text-muted-foreground">Train Length</span>
                <span className="text-lg font-bold">{selectedRake.length}m</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg transition-all hover:shadow-sm">
                <span className="text-sm text-muted-foreground">Total Weight</span>
                <span className="text-lg font-bold">{selectedRake.weight}t</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg transition-all hover:shadow-sm">
                <span className="text-sm text-muted-foreground">Estimated Cost</span>
                <span className="text-lg font-bold text-primary">₹{selectedRake.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg transition-all hover:shadow-sm">
                <span className="text-sm text-muted-foreground">Scheduled Departure</span>
                <span className="text-sm font-semibold">{selectedRake.schedule}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Comparator */}
        <div className="space-y-4">
          <CostComparator
            railCost={selectedRake.cost}
            roadCost={Math.floor(selectedRake.cost * 1.3)}
            railTime={18}
            roadTime={24}
          />
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">Constraint Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Max train length: 350m / 400m</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Axle load: Within limits</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Route compatibility: Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span>SLA: Tight 2h window</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gantt Chart Placeholder */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Rake Schedule Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rakes.map((rake, idx) => (
              <div key={rake.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{rake.id}</span>
                  <span className="text-muted-foreground">{rake.schedule}</span>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-primary flex items-center px-3 text-white text-xs font-medium"
                    style={{
                      left: `${idx * 15}%`,
                      width: `${35 + idx * 5}%`,
                    }}
                  >
                    {rake.route}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RakeFormation;
