// Core Types for SAIL Rake Formation DSS

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface Location {
  location: string;
  coordinates: Coordinates;
  address?: string;
}

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type OrderStatus = 'Active' | 'Pending' | 'Completed' | 'Cancelled';
export type WagonStatus = 'Available' | 'Allocated' | 'In Transit' | 'Maintenance';
export type RakeStatus = 'Scheduled' | 'Formation' | 'In Transit' | 'Completed';
export type CMOStatus = 'Available' | 'Limited' | 'Full';
export type Shape = 'box' | 'cylinder' | 'sphere';
export type VehicleType = 'rail' | 'road';
export type TrackingStatus = 'on-time' | 'delayed' | 'anomaly';
export type InsightType = 'alternative' | 'anomaly' | 'deadline' | 'optimization' | 'forecast' | 'profitloss';
export type Severity = 'info' | 'warning' | 'danger' | 'success';

export interface Order {
  id: string;
  materialType: string;
  quantity: number;
  quantityUnit: string;
  cost: number;
  estimatedCost: number;
  deliveryDateTime: string;
  priority: Priority;
  status: OrderStatus;
  dimensions: Dimensions;
  shape: Shape;
  source: {
    location: string;
    cmoId: string;
    coordinates: Coordinates;
  };
  destination: Location;
  assignedWagon: string | null;
  assignedRake: string | null;
  conflicts: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface CMO {
  id: string;
  name: string;
  location: string;
  coordinates: Coordinates;
  materials: string[];
  inventory: number;
  maxInventory: number;
  inventoryUnit: string;
  pathCost: number;
  timeCost: number;
  timeCostUnit: string;
  status: CMOStatus;
  efficiency: number;
  totalDeliveries: number;
  avgCost: number;
  assignedOrders: string[];
  operatingHours: string;
  contactPerson: string;
  contactPhone: string;
}

export interface Wagon {
  id: string;
  type: string;
  capacity: number;
  capacityUnit: string;
  currentLoad: number;
  available: boolean;
  status: WagonStatus;
  color: string;
  material: string;
  assignedOrders: string[];
  assignedRake: string | null;
  utilizationPercent: number;
  costPerKm: number;
  maintenanceStatus: string;
  lastMaintenance: string;
  nextMaintenance: string;
  dimensions: Dimensions;
}

export interface Rake {
  id: string;
  wagons: string[];
  orders: string[];
  cost: number;
  schedule: string;
  route: string;
  status: RakeStatus;
  length: number;
  lengthUnit: string;
  weight: number;
  weightUnit: string;
  maxSpeed: number;
  speedUnit: string;
  estimatedDuration: number;
  durationUnit: string;
  engineId: string;
  driverId: string;
  driverName: string;
  currentLocation: Location;
  destination: Location;
  progress: number;
  slaCompliance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Siding {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  availableSlots: number;
  material: string;
  assignedWagons: string[];
  labor: number;
  requiredLabor: number;
  timeEstimate: number;
  timeUnit: string;
  status: string;
  utilizationPercent: number;
}

export interface LiveTracking {
  id: string;
  type: VehicleType;
  currentLocation: Location;
  destination: Location;
  status: TrackingStatus;
  eta: string;
  progress: number;
  route: string;
  speed: number;
  speedUnit: string;
  altCost?: number;
  delayReason?: string;
  lastUpdate: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workers: number;
  supervisor: string;
  location: string;
  status: string;
}

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: string;
  severity: Severity;
  affectedItems: string[];
  action: string;
  createdAt: string;
  priority: number;
}

export interface Metadata {
  version: string;
  lastUpdated: string;
  dataSource: string;
  environment: string;
}

export interface MockData {
  orders: Order[];
  cmos: CMO[];
  wagons: Wagon[];
  rakes: Rake[];
  sidings: Siding[];
  liveTracking: LiveTracking[];
  shifts: Shift[];
  aiInsights: AIInsight[];
  metadata: Metadata;
}

// Helper types for 3D Visualization
export interface Order3D {
  id: string;
  qty: number;
  dest: string;
  priority: Priority;
  dimensions: Dimensions;
  shape: Shape;
}

export interface Wagon3D {
  wagonId: string;
  capacity: number;
  currentLoad: number;
  color: number;
  orders: Order3D[];
}

export interface RakeData3D {
  rakeId: string;
  wagons: Wagon3D[];
}
