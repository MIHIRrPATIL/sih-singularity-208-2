import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  TrendingUp, 
  AlertCircle, 
  Truck, 
  Train, 
  Loader2, 
  X, 
  Package, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  Map,
  RefreshCw
} from "lucide-react";
import { CostComparator } from "@/components/shared/CostComparator";
import { dataService } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { RailwayMap } from "@/components/map/RailwayMap";

// Types for our vehicle data
interface Vehicle {
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
  orderId?: string;
  orderDetails?: {
    id: string;
    materialType: string;
    quantity: number;
    quantityUnit: string;
    cost: number;
    estimatedCost: number;
    deliveryDateTime: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'Active' | 'Pending' | 'Completed' | 'Cancelled';
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    shape: 'box' | 'cylinder' | 'sphere';
    source: {
      location: string;
      cmoId: string;
      coordinates: {
        lat: number;
        lon: number;
      };
    };
    destination: {
      location: string;
      coordinates: {
        lat: number;
        lon: number;
      };
      address?: string;
    };
    assignedWagon: string | null;
    assignedRake: string | null;
    conflicts: number;
    remarks: string;
    createdAt: string;
    updatedAt: string;
    expectedDelivery?: string;
  };
  wagons?: Array<{
    id: string;
    type: string;
    capacity: number;
    status: string;
  }>;
  lastUpdated?: string;
}

// Format date utility function
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const LiveTracking = () => {
  // Major Indian railway routes data
  const majorRailwayRoutes = [
    {
      name: 'Bokaro to Kolkata',
      coordinates: [
        { lat: 23.6717, lng: 86.1069 }, // Bokaro Steel Plant
        { lat: 23.3441, lng: 85.3096 }, // Ranchi
        { lat: 22.5726, lng: 88.3639 }, // Kolkata
      ],
      color: '#FF5733'
    },
    {
      name: 'Bokaro to Delhi',
      coordinates: [
        { lat: 23.6717, lng: 86.1069 }, // Bokaro
        { lat: 25.5941, lng: 85.1376 }, // Patna
        { lat: 26.8467, lng: 80.9462 }, // Lucknow
        { lat: 28.6139, lng: 77.2090 }, // Delhi
      ],
      color: '#33FF57'
    },
    {
      name: 'Bokaro to Chennai',
      coordinates: [
        { lat: 23.6717, lng: 86.1069 }, // Bokaro
        { lat: 21.1458, lng: 79.0882 }, // Nagpur
        { lat: 17.3850, lng: 78.4867 }, // Hyderabad
        { lat: 13.0827, lng: 80.2707 }, // Chennai
      ],
      color: '#3357FF'
    },
  ];

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showCostComparison, setShowCostComparison] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);

  // Sample vehicle data
  const sampleVehicles: Vehicle[] = [
    {
      id: 'RAKE-1234',
      type: 'rail',
      lat: 23.6717,
      lon: 86.1069,
      status: 'on-time',
      eta: '2h 30m',
      progress: 25,
      route: 'Bokaro to Kolkata',
      wagons: [
        { id: 'WGN-001', type: 'BOXN', capacity: 60, status: 'loaded' },
        { id: 'WGN-002', type: 'BOXN', capacity: 60, status: 'loaded' },
      ]
    },
    {
      id: 'RAKE-5678',
      type: 'rail',
      lat: 24.5,
      lon: 85.5,
      status: 'delayed',
      eta: '4h 15m',
      progress: 40,
      route: 'Bokaro to Delhi',
      wagons: [
        { id: 'WGN-101', type: 'BOXN', capacity: 60, status: 'loaded' },
      ]
    },
  ];

  // Initialize with sample data
  useEffect(() => {
    const timer = setTimeout(() => {
      setVehicles(sampleVehicles);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  // Function to get random status for demo purposes
  const getRandomStatus = (): 'on-time' | 'delayed' | 'anomaly' => {
    const statuses: ('on-time' | 'delayed' | 'anomaly')[] = ['on-time', 'delayed', 'anomaly'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  // Function to format ETA (adds random minutes to current time)
  const getETA = (): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + Math.floor(Math.random() * 180) + 30); // 30-210 minutes from now
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all rakes and their assigned wagons
        const rakes = dataService.getAllRakes();
        const allVehicles: Vehicle[] = [];

        // Process rakes (rail vehicles)
        rakes.forEach(rake => {
          const wagons = dataService.getWagonsByRake(rake.id);
          const orders = dataService.getOrdersByRake(rake.id);
          const status = getRandomStatus();
          
          // Get coordinates from the first order's source and destination
          const sourceCoords = orders[0]?.source?.coordinates || [0, 0];
          const destCoords = orders[0]?.destination?.coordinates || [0, 0];
          
          // Calculate a position along the route based on progress
          const progress = Math.floor(Math.random() * 100);
          const lat = sourceCoords[1] + (destCoords[1] - sourceCoords[1]) * (progress / 100);
          const lon = sourceCoords[0] + (destCoords[0] - sourceCoords[0]) * (progress / 100);
          
          allVehicles.push({
            id: rake.id,
            type: 'rail',
            lat: lat || 20.6 + (Math.random() - 0.5) * 10, // Fallback to random position in India
            lon: lon || 78.9 + (Math.random() - 0.5) * 20,
            status,
            eta: getETA(),
            progress,
            route: orders[0] && orders[0].source && orders[0].destination
              ? `${orders[0].source.location || 'Unknown'} → ${orders[0].destination.location || 'Unknown'}`
              : 'No route assigned',
            issue: status === 'anomaly' ? 'Route deviation detected' : undefined,
          });
        });

        // Add some road vehicles (trucks)
        const roadVehicles = 2; // Number of road vehicles to show
        for (let i = 0; i < roadVehicles; i++) {
          const status = getRandomStatus();
          allVehicles.push({
            id: `TRUCK-${String(i + 1).padStart(3, '0')}`,
            type: 'road',
            lat: 19.0 + (Math.random() * 5), // Random position in India
            lon: 72.8 + (Math.random() * 10),
            status,
            eta: getETA(),
            progress: Math.floor(Math.random() * 100),
            route: 'Mumbai → Pune',
            issue: status === 'anomaly' ? 'Route deviation detected' : undefined,
            altCost: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 5000 : undefined,
          });
        }

        setVehicles(allVehicles);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        setError('Failed to load vehicle data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();

    // Update vehicle positions periodically
    const interval = setInterval(() => {
      setVehicles(prevVehicles => 
        prevVehicles.map(v => {
          const newProgress = Math.min(100, v.progress + (Math.random() * 2));
          const latChange = (Math.random() - 0.5) * 0.1;
          const lonChange = (Math.random() - 0.5) * 0.1;
          
          return {
            ...v,
            progress: newProgress,
            lat: v.lat + latChange,
            lon: v.lon + lonChange,
            // Randomly change status near the end of the route
            status: newProgress > 90 && Math.random() > 0.8 
              ? getRandomStatus() 
              : v.status,
            // Update ETA occasionally
            eta: Math.random() > 0.9 ? getETA() : v.eta,
          };
        })
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => {
          // Simulate position updates
          const latChange = (Math.random() - 0.5) * 0.1;
          const lonChange = (Math.random() - 0.5) * 0.1;
          
          return {
            ...vehicle,
            lat: Math.min(Math.max(vehicle.lat + latChange, 8.4), 37.6), // Keep within India bounds
            lon: Math.min(Math.max(vehicle.lon + lonChange, 68.7), 97.25),
            progress: Math.min(100, vehicle.progress + (Math.random() * 2)),
            status: Math.random() > 0.95 ? 
              'delayed' : 
              (vehicle.status === 'delayed' && Math.random() > 0.7 ? 'on-time' : vehicle.status)
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading vehicle data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Tracking</h1>
          <p className="text-muted-foreground">Real-time monitoring of all your shipments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowRoutes(!showRoutes)}
            className="flex items-center gap-2"
          >
            {showRoutes ? (
              <>
                <X className="h-4 w-4" />
                Hide Routes
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                Show Routes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[500px] rounded-lg overflow-hidden shadow-lg border relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p>Loading map data...</p>
            </div>
          </div>
        ) : (
          <RailwayMap 
            vehicles={vehicles}
            routes={showRoutes ? majorRailwayRoutes : []}
            onVehicleClick={handleVehicleSelect}
          />
        )}
      </div>

      {/* Vehicle Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map(vehicle => (
          <Card key={vehicle.id} className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {vehicle.type === "rail" ? (
                    <Train className="h-5 w-5" />
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                  <div>
                    <CardTitle className="text-base">{vehicle.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{vehicle.route}</p>
                  </div>
                </div>
                <Badge variant={
                  vehicle.status === "on-time" ? "default" :
                  vehicle.status === "delayed" ? "secondary" : "destructive"
                }>
                  {vehicle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Route Progress</span>
                  <span className="font-medium">{vehicle.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${vehicle.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ETA</p>
                  <p className="font-medium">{vehicle.eta}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Position</p>
                  <p className="font-medium text-xs">
                    {vehicle.lat.toFixed(2)}°N, {vehicle.lon.toFixed(2)}°E
                  </p>
                </div>
              </div>

              {vehicle.status === "anomaly" && vehicle.issue && (
                <div className="flex items-start gap-2 p-3 bg-danger/10 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-danger">Alert</p>
                    <p className="text-xs text-muted-foreground mt-1">{vehicle.issue}</p>
                  </div>
                </div>
              )}

              {vehicle.altCost && (
                <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg text-sm">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Hybrid Optimization</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alternative rail route available: Save ₹{vehicle.altCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Comparator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostComparator
          railCost={125000}
          roadCost={168000}
          railTime={16}
          roadTime={22}
        />
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Vehicles</span>
              <span className="font-medium">{vehicles.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">On-Time Performance</span>
              <span className="font-medium text-success">
                {((vehicles.filter(v => v.status === "on-time").length / vehicles.length) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Alerts</span>
              <span className="font-medium text-danger">
                {vehicles.filter(v => v.status === "anomaly").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveTracking;
