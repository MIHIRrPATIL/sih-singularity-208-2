# SAIL Rake Formation DSS - Data Structure Documentation

## Overview
This document describes the comprehensive data structure used throughout the SAIL Rake Formation Decision Support System. All data is centralized in `src/data/mockData.json` and accessed through the `dataService` utility.

## Table of Contents
1. [Orders](#orders)
2. [CMOs (Central Material Organizations)](#cmos)
3. [Wagons](#wagons)
4. [Rakes](#rakes)
5. [Sidings](#sidings)
6. [Live Tracking](#live-tracking)
7. [Shifts](#shifts)
8. [AI Insights](#ai-insights)
9. [Relationships](#relationships)
10. [Usage Examples](#usage-examples)

---

## Orders

**Purpose**: Represents material transport orders from source to destination.

### Schema
```typescript
{
  id: string;                    // Unique identifier (e.g., "ORD-2401")
  materialType: string;          // Type of material (e.g., "Steel Coils")
  quantity: number;              // Amount in kg
  quantityUnit: string;          // Unit of measurement
  cost: number;                  // Order cost in ₹
  estimatedCost: number;         // Estimated cost
  deliveryDateTime: string;      // ISO 8601 datetime
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "Active" | "Pending" | "Completed" | "Cancelled";
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  shape: "box" | "cylinder" | "sphere";
  source: {
    location: string;
    cmoId: string;
    coordinates: { lat: number; lon: number; }
  };
  destination: {
    location: string;
    address: string;
    coordinates: { lat: number; lon: number; }
  };
  assignedWagon: string | null;  // Wagon ID or null
  assignedRake: string | null;   // Rake ID or null
  conflicts: number;             // Number of conflicts
  remarks: string;               // Additional notes
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}
```

### Key Fields
- **priority**: Determines urgency (HIGH = red, MEDIUM = yellow, LOW = green in UI)
- **shape**: Affects 3D visualization rendering
- **assignedWagon/assignedRake**: Links order to wagon and rake
- **conflicts**: Number of scheduling/capacity conflicts

---

## CMOs

**Purpose**: Central Material Organizations - source locations for materials.

### Schema
```typescript
{
  id: string;                    // Unique identifier (e.g., "CMO-1")
  name: string;                  // Full name
  location: string;              // City, State
  coordinates: { lat: number; lon: number; };
  materials: string[];           // Available materials
  inventory: number;             // Current inventory in tons
  maxInventory: number;          // Maximum capacity
  inventoryUnit: string;         // Unit of measurement
  pathCost: number;              // Cost per route in ₹
  timeCost: number;              // Time in hours
  timeCostUnit: string;          // Unit
  status: "Available" | "Limited" | "Full";
  efficiency: number;            // Efficiency percentage (0-100)
  totalDeliveries: number;       // Historical deliveries
  avgCost: number;               // Average cost per delivery
  assignedOrders: string[];      // Array of order IDs
  operatingHours: string;        // Operating schedule
  contactPerson: string;         // Contact name
  contactPhone: string;          // Phone number
}
```

### Key Fields
- **status**: Availability (Available > 70%, Limited 30-70%, Full < 30%)
- **materials**: Determines which orders can be assigned
- **assignedOrders**: Current orders from this CMO

---

## Wagons

**Purpose**: Individual railway wagons that carry orders.

### Schema
```typescript
{
  id: string;                    // Unique identifier (e.g., "WGN-001")
  type: string;                  // Box, Hopper, Gondola, Tank
  capacity: number;              // Maximum capacity in kg
  capacityUnit: string;          // Unit
  currentLoad: number;           // Current load in kg
  available: boolean;            // Availability status
  status: "Available" | "Allocated" | "In Transit" | "Maintenance";
  color: string;                 // Hex color for visualization
  material: string;              // Primary material type
  assignedOrders: string[];      // Array of order IDs
  assignedRake: string | null;   // Rake ID or null
  utilizationPercent: number;    // Capacity utilization (0-100)
  costPerKm: number;             // Cost per kilometer
  maintenanceStatus: string;     // Good, Fair, Poor, Excellent
  lastMaintenance: string;       // ISO 8601 date
  nextMaintenance: string;       // ISO 8601 date
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}
```

### Key Fields
- **type**: Determines wagon shape in 3D visualization
- **color**: Used for 3D rendering (hex format)
- **assignedOrders**: Links to orders carried by this wagon
- **utilizationPercent**: Calculated as (currentLoad / capacity) * 100

---

## Rakes

**Purpose**: Collection of wagons forming a complete train.

### Schema
```typescript
{
  id: string;                    // Unique identifier (e.g., "RAKE-001")
  wagons: string[];              // Array of wagon IDs
  orders: string[];              // Array of order IDs
  cost: number;                  // Total cost in ₹
  schedule: string;              // ISO 8601 datetime
  route: string;                 // "Source → Destination"
  status: "Scheduled" | "Formation" | "In Transit" | "Completed";
  length: number;                // Total length in meters
  lengthUnit: string;            // Unit
  weight: number;                // Total weight in tons
  weightUnit: string;            // Unit
  maxSpeed: number;              // Maximum speed
  speedUnit: string;             // km/h
  estimatedDuration: number;     // Duration in hours
  durationUnit: string;          // Unit
  engineId: string;              // Engine identifier
  driverId: string;              // Driver identifier
  driverName: string;            // Driver name
  currentLocation: {
    location: string;
    coordinates: { lat: number; lon: number; }
  };
  destination: {
    location: string;
    coordinates: { lat: number; lon: number; }
  };
  progress: number;              // Progress percentage (0-100)
  slaCompliance: number;         // SLA compliance percentage
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}
```

### Key Fields
- **wagons**: Ordered array of wagon IDs (order matters for visualization)
- **status**: Current state of rake formation/movement
- **progress**: Used for live tracking visualization

---

## Sidings

**Purpose**: Yard locations where wagons are stored and loaded.

### Schema
```typescript
{
  id: string;                    // Unique identifier (e.g., "SIDING-A")
  name: string;                  // Display name
  location: string;              // Yard location
  capacity: number;              // Maximum wagons
  occupied: number;              // Current wagons
  availableSlots: number;        // Available slots
  material: string;              // Primary material type
  assignedWagons: string[];      // Array of wagon IDs
  labor: number;                 // Current workers
  requiredLabor: number;         // Required workers
  timeEstimate: number;          // Estimated time in hours
  timeUnit: string;              // Unit
  status: string;                // Active, Full, Maintenance
  utilizationPercent: number;    // (occupied / capacity) * 100
}
```

### Key Fields
- **availableSlots**: capacity - occupied
- **utilizationPercent**: Visual indicator for capacity

---

## Live Tracking

**Purpose**: Real-time location and status of vehicles.

### Schema
```typescript
{
  id: string;                    // Vehicle identifier
  type: "rail" | "road";         // Vehicle type
  currentLocation: {
    lat: number;
    lon: number;
    location: string;
  };
  destination: {
    lat: number;
    lon: number;
    location: string;
  };
  status: "on-time" | "delayed" | "anomaly";
  eta: string;                   // HH:MM format
  progress: number;              // Progress percentage (0-100)
  route: string;                 // "Source → Destination"
  speed: number;                 // Current speed
  speedUnit: string;             // km/h
  altCost?: number;              // Alternative cost (optional)
  delayReason?: string;          // Delay reason (optional)
  lastUpdate: string;            // ISO 8601 datetime
}
```

### Key Fields
- **status**: Determines marker color on map
- **progress**: Used for progress bar visualization
- **altCost**: Shows optimization opportunities

---

## Shifts

**Purpose**: Worker shift management for yard operations.

### Schema
```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Shift name
  startTime: string;             // HH:MM format
  endTime: string;               // HH:MM format
  workers: number;               // Number of workers
  supervisor: string;            // Supervisor name
  location: string;              // Yard location
  status: string;                // Active, Scheduled, Completed
}
```

---

## AI Insights

**Purpose**: AI-generated recommendations and alerts.

### Schema
```typescript
{
  id: string;                    // Unique identifier
  type: "alternative" | "anomaly" | "deadline" | "optimization" | "forecast" | "profitloss";
  title: string;                 // Short title
  description: string;           // Detailed description
  impact: string;                // Impact description
  severity: "info" | "warning" | "danger" | "success";
  affectedItems: string[];       // Array of affected entity IDs
  action: string;                // Navigation path
  createdAt: string;             // ISO 8601 datetime
  priority: number;              // Priority level (1-5)
}
```

### Key Fields
- **severity**: Determines visual styling
- **action**: Navigation path for "View Details" button
- **affectedItems**: Links to related entities

---

## Relationships

### Entity Relationship Diagram
```
Orders
  ├─ source.cmoId → CMO.id
  ├─ assignedWagon → Wagon.id
  └─ assignedRake → Rake.id

CMO
  └─ assignedOrders[] → Order.id[]

Wagon
  ├─ assignedOrders[] → Order.id[]
  └─ assignedRake → Rake.id

Rake
  ├─ wagons[] → Wagon.id[]
  └─ orders[] → Order.id[]

Siding
  └─ assignedWagons[] → Wagon.id[]

LiveTracking
  └─ id → Rake.id or Vehicle.id

AIInsight
  └─ affectedItems[] → (Order|CMO|Wagon|Rake|Siding).id[]
```

---

## Usage Examples

### Importing the Data Service
```typescript
import { dataService } from '@/services/dataService';
```

### Getting All Orders
```typescript
const orders = dataService.getAllOrders();
```

### Getting Orders by Wagon
```typescript
const wagonOrders = dataService.getOrdersByWagon('WGN-001');
```

### Getting 3D Rake Data
```typescript
const rakeData = dataService.getRakeData3D('RAKE-001');
// Returns formatted data ready for RakeVisualization component
```

### Getting Available Wagons
```typescript
const availableWagons = dataService.getAvailableWagons();
```

### Getting CMOs by Material
```typescript
const steelCMOs = dataService.getCMOsByMaterial('Steel Coils');
```

### Getting Statistics
```typescript
const totalOrders = dataService.getTotalOrders();
const avgUtilization = dataService.getAverageWagonUtilization();
const avgSLA = dataService.getAverageSLACompliance();
```

---

## Data Consistency Rules

1. **Order Assignment**:
   - An order can only be assigned to ONE wagon
   - An order can only be assigned to ONE rake
   - If order.assignedWagon is set, that wagon must include the order ID in its assignedOrders[]

2. **Wagon Assignment**:
   - A wagon can have MULTIPLE orders
   - A wagon can only be assigned to ONE rake
   - wagon.currentLoad should equal sum of assigned order quantities

3. **Rake Composition**:
   - A rake contains MULTIPLE wagons
   - rake.orders[] should be the union of all orders from its wagons
   - rake.cost should reflect total operational cost

4. **CMO Allocation**:
   - A CMO can handle MULTIPLE orders
   - Orders must match CMO's available materials
   - CMO inventory should reflect current capacity

5. **ID Conventions**:
   - Orders: `ORD-XXXX`
   - CMOs: `CMO-X`
   - Wagons: `WGN-XXX`
   - Rakes: `RAKE-XXX`
   - Sidings: `SIDING-X`
   - Shifts: `SHIFT-XXX`
   - Insights: `INS-XXX`

---

## Future Backend Integration

When integrating with a real backend:

1. Replace `dataService` calls with API calls
2. Use the same TypeScript interfaces for type safety
3. Implement caching with TanStack Query
4. Add real-time updates via WebSocket
5. Implement optimistic updates for better UX

Example API structure:
```typescript
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id

GET    /api/rakes/:id/visualization  // Returns RakeData3D format
```

---

## Version History

- **v1.0.0** (2025-10-14): Initial data structure
  - Complete entity definitions
  - Relationship mappings
  - Data service implementation
