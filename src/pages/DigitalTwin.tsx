import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const scenarios = [
  { id: "surge", name: "Order Surge (+40%)", icon: TrendingUp },
  { id: "route-change", name: "Route Restriction", icon: RefreshCw },
  { id: "resource-fail", name: "Resource Failure", icon: TrendingDown },
  { id: "constraint", name: "Constraint Adjustment", icon: RefreshCw },
];

const baselineMetrics = {
  totalCost: 485000,
  avgDeliveryTime: 16.5,
  utilization: 78,
  slaCompliance: 94,
  totalOrders: 142,
};

const DigitalTwin = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [simulated, setSimulated] = useState(false);
  const [scenarioMetrics, setScenarioMetrics] = useState(baselineMetrics);

  const handleSimulate = () => {
    if (!selectedScenario) {
      toast.error("Please select a scenario first");
      return;
    }

    // Mock simulation changes
    const changes = {
      surge: {
        totalCost: 678000,
        avgDeliveryTime: 18.2,
        utilization: 92,
        slaCompliance: 87,
        totalOrders: 199,
      },
      "route-change": {
        totalCost: 512000,
        avgDeliveryTime: 19.5,
        utilization: 75,
        slaCompliance: 91,
        totalOrders: 142,
      },
      "resource-fail": {
        totalCost: 523000,
        avgDeliveryTime: 21.0,
        utilization: 65,
        slaCompliance: 82,
        totalOrders: 142,
      },
      constraint: {
        totalCost: 445000,
        avgDeliveryTime: 15.8,
        utilization: 85,
        slaCompliance: 96,
        totalOrders: 142,
      },
    };

    setScenarioMetrics(changes[selectedScenario as keyof typeof changes]);
    setSimulated(true);
    toast.success("Scenario simulation complete", {
      description: "Review the impact analysis below"
    });
  };

  const calculateDelta = (baseline: number, scenario: number, isPercentage = false) => {
    const diff = scenario - baseline;
    const pct = ((diff / baseline) * 100).toFixed(1);
    return {
      value: isPercentage ? diff.toFixed(1) : diff.toLocaleString(),
      percent: pct,
      isPositive: diff > 0,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Digital Twin Simulation</h1>
          <p className="text-muted-foreground mt-1">Test scenarios and predict outcomes</p>
        </div>
        <Button onClick={handleSimulate} className="bg-gradient-primary hover:opacity-90">
          <FlaskConical className="h-4 w-4 mr-2" />
          Run Simulation
        </Button>
      </div>

      {/* Scenario Selection */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Scenario Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Scenario</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedScenario && (
              <div className="p-4 bg-gradient-surface rounded-lg">
                <p className="text-sm font-medium mb-2">Scenario Description</p>
                <p className="text-xs text-muted-foreground">
                  {selectedScenario === "surge" && "Simulates a 40% increase in order volume over the next week"}
                  {selectedScenario === "route-change" && "Tests impact of main route closure, forcing alternate paths"}
                  {selectedScenario === "resource-fail" && "Simulates loss of primary CMO or siding capacity"}
                  {selectedScenario === "constraint" && "Adjusts axle load and length constraints for optimization"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baseline */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Baseline</CardTitle>
              <Badge variant="outline">Current State</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="text-lg font-bold">₹{baselineMetrics.totalCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                <span className="text-sm text-muted-foreground">Avg Delivery Time</span>
                <span className="text-lg font-bold">{baselineMetrics.avgDeliveryTime}h</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                <span className="text-sm text-muted-foreground">Utilization</span>
                <span className="text-lg font-bold">{baselineMetrics.utilization}%</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                <span className="text-sm text-muted-foreground">SLA Compliance</span>
                <span className="text-lg font-bold">{baselineMetrics.slaCompliance}%</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <span className="text-lg font-bold">{baselineMetrics.totalOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scenario Result</CardTitle>
              <Badge variant={simulated ? "default" : "secondary"}>
                {simulated ? "Simulated" : "Not Run"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!simulated ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-12">
                Select a scenario and run simulation to see results
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">₹{scenarioMetrics.totalCost.toLocaleString()}</span>
                    <span className={`block text-xs ${calculateDelta(baselineMetrics.totalCost, scenarioMetrics.totalCost).isPositive ? 'text-danger' : 'text-success'}`}>
                      {calculateDelta(baselineMetrics.totalCost, scenarioMetrics.totalCost).isPositive ? '+' : ''}
                      ₹{calculateDelta(baselineMetrics.totalCost, scenarioMetrics.totalCost).value} ({calculateDelta(baselineMetrics.totalCost, scenarioMetrics.totalCost).percent}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                  <span className="text-sm text-muted-foreground">Avg Delivery Time</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{scenarioMetrics.avgDeliveryTime}h</span>
                    <span className={`block text-xs ${calculateDelta(baselineMetrics.avgDeliveryTime, scenarioMetrics.avgDeliveryTime).isPositive ? 'text-danger' : 'text-success'}`}>
                      {calculateDelta(baselineMetrics.avgDeliveryTime, scenarioMetrics.avgDeliveryTime).isPositive ? '+' : ''}
                      {calculateDelta(baselineMetrics.avgDeliveryTime, scenarioMetrics.avgDeliveryTime, true).value}h
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                  <span className="text-sm text-muted-foreground">Utilization</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{scenarioMetrics.utilization}%</span>
                    <span className={`block text-xs ${calculateDelta(baselineMetrics.utilization, scenarioMetrics.utilization).isPositive ? 'text-success' : 'text-danger'}`}>
                      {calculateDelta(baselineMetrics.utilization, scenarioMetrics.utilization).isPositive ? '+' : ''}
                      {calculateDelta(baselineMetrics.utilization, scenarioMetrics.utilization, true).value}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                  <span className="text-sm text-muted-foreground">SLA Compliance</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{scenarioMetrics.slaCompliance}%</span>
                    <span className={`block text-xs ${calculateDelta(baselineMetrics.slaCompliance, scenarioMetrics.slaCompliance).isPositive ? 'text-success' : 'text-danger'}`}>
                      {calculateDelta(baselineMetrics.slaCompliance, scenarioMetrics.slaCompliance).isPositive ? '+' : ''}
                      {calculateDelta(baselineMetrics.slaCompliance, scenarioMetrics.slaCompliance, true).value}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gradient-surface rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{scenarioMetrics.totalOrders}</span>
                    {scenarioMetrics.totalOrders !== baselineMetrics.totalOrders && (
                      <span className="block text-xs text-accent">
                        +{scenarioMetrics.totalOrders - baselineMetrics.totalOrders} orders
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {simulated && (
        <Card className="shadow-md bg-accent/5 border-accent/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Apply this scenario configuration?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will update allocations, schedules, and resource assignments
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSimulated(false)}>
                  Reset
                </Button>
                <Button className="bg-gradient-primary hover:opacity-90">
                  Apply Configuration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DigitalTwin;
